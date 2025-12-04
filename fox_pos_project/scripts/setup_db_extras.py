import os
import sys
import django

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from django.db import connection

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fox_pos.settings')
django.setup()

SQL_COMMANDS = [
    # --- Triggers ---
    """
    CREATE OR REPLACE FUNCTION fox_system.update_stock_after_sale()
    RETURNS TRIGGER AS $$
    DECLARE
        v_invoice_type VARCHAR(20);
        v_quantity_before DECIMAL(10,2);
    BEGIN
        SELECT invoice_type INTO v_invoice_type
        FROM fox_system.sales_invoices
        WHERE invoice_id = NEW.invoice_id;

        IF v_invoice_type = 'regular' THEN
            SELECT current_stock INTO v_quantity_before
            FROM fox_system.products
            WHERE product_id = NEW.product_id;

            UPDATE fox_system.products
            SET current_stock = current_stock - NEW.quantity,
                updated_at = CURRENT_TIMESTAMP
            WHERE product_id = NEW.product_id;

            INSERT INTO fox_system.inventory_movements(
                movement_type, reference_type, reference_id, product_id, 
                quantity, quantity_before, quantity_after, notes
            )
            VALUES(
                'sale', 'sales_invoice', NEW.invoice_id, NEW.product_id,
                -NEW.quantity, v_quantity_before, v_quantity_before - NEW.quantity,
                'Auto: Sale'
            );
        END IF;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """,
    """
    CREATE OR REPLACE TRIGGER trg_update_stock_after_sale
    AFTER INSERT ON fox_system.sales_invoice_items
    FOR EACH ROW EXECUTE FUNCTION fox_system.update_stock_after_sale();
    """,
    """
    CREATE OR REPLACE FUNCTION fox_system.update_stock_after_purchase()
    RETURNS TRIGGER AS $$
    DECLARE
        v_quantity_before DECIMAL(10,2);
    BEGIN
        SELECT current_stock INTO v_quantity_before
        FROM fox_system.products
        WHERE product_id = NEW.product_id;

        UPDATE fox_system.products
        SET current_stock = current_stock + NEW.quantity,
            purchase_price = NEW.purchase_price,
            selling_price = NEW.selling_price,
            updated_at = CURRENT_TIMESTAMP
        WHERE product_id = NEW.product_id;

        INSERT INTO fox_system.inventory_movements(
            movement_type, reference_type, reference_id, product_id,
            quantity, quantity_before, quantity_after, notes
        )
        VALUES(
            'purchase', 'purchase_invoice', NEW.invoice_id, NEW.product_id,
            NEW.quantity, v_quantity_before, v_quantity_before + NEW.quantity,
            'Auto: Purchase'
        );

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """,
    """
    CREATE OR REPLACE TRIGGER trg_update_stock_after_purchase
    AFTER INSERT ON fox_system.purchase_invoice_items
    FOR EACH ROW EXECUTE FUNCTION fox_system.update_stock_after_purchase();
    """,
    """
    CREATE OR REPLACE FUNCTION fox_system.update_stock_after_sales_return()
    RETURNS TRIGGER AS $$
    DECLARE
        v_quantity_before DECIMAL(10,2);
    BEGIN
        SELECT current_stock INTO v_quantity_before
        FROM fox_system.products
        WHERE product_id = NEW.product_id;

        UPDATE fox_system.products
        SET current_stock = current_stock + NEW.quantity,
            updated_at = CURRENT_TIMESTAMP
        WHERE product_id = NEW.product_id;

        INSERT INTO fox_system.inventory_movements(
            movement_type, reference_type, reference_id, product_id,
            quantity, quantity_before, quantity_after, notes
        )
        VALUES(
            'return_sale', 'sales_return', NEW.return_id, NEW.product_id,
            NEW.quantity, v_quantity_before, v_quantity_before + NEW.quantity,
            'Auto: Sales Return'
        );

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """,
    """
    CREATE OR REPLACE TRIGGER trg_update_stock_after_sales_return
    AFTER INSERT ON fox_system.sales_return_items
    FOR EACH ROW EXECUTE FUNCTION fox_system.update_stock_after_sales_return();
    """,
    """
    CREATE OR REPLACE FUNCTION fox_system.update_customer_balance()
    RETURNS TRIGGER AS $$
    DECLARE
        v_customer_type VARCHAR(20);
    BEGIN
        SELECT customer_type INTO v_customer_type
        FROM fox_system.customers
        WHERE customer_id = NEW.customer_id;

        IF v_customer_type = 'regular' AND NEW.remaining_amount > 0 THEN
            UPDATE fox_system.customers
            SET current_balance = current_balance + NEW.remaining_amount,
                updated_at = CURRENT_TIMESTAMP
            WHERE customer_id = NEW.customer_id;

            INSERT INTO fox_system.debts(
                debt_type, entity_type, entity_id, reference_type, reference_id,
                original_amount, paid_amount, remaining_amount, status
            )
            VALUES(
                'receivable', 'customer', NEW.customer_id, 'sales_invoice', NEW.invoice_id,
                NEW.remaining_amount, 0.00, NEW.remaining_amount, 'pending'
            );
        END IF;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """,
    """
    CREATE OR REPLACE TRIGGER trg_update_customer_balance
    AFTER INSERT ON fox_system.sales_invoices
    FOR EACH ROW EXECUTE FUNCTION fox_system.update_customer_balance();
    """,
    """
    CREATE OR REPLACE FUNCTION fox_system.update_treasury_after_sale()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.paid_amount > 0 THEN
            INSERT INTO fox_system.treasury(
                transaction_type, transaction_category, reference_type, reference_id,
                amount, payment_method, transaction_date, transaction_time, description
            )
            VALUES(
                'income', 'sale', 'sales_invoice', NEW.invoice_id,
                NEW.paid_amount, NEW.payment_method, NEW.invoice_date, NEW.invoice_time,
                'مبيعات - فاتورة رقم ' || NEW.invoice_number
            );
        END IF;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """,
    """
    CREATE OR REPLACE TRIGGER trg_update_treasury_after_sale
    AFTER INSERT ON fox_system.sales_invoices
    FOR EACH ROW EXECUTE FUNCTION fox_system.update_treasury_after_sale();
    """,

    # --- Views ---
    """
    CREATE OR REPLACE VIEW fox_system.v_daily_sales_summary AS
    SELECT 
        invoice_date,
        COUNT(*) as total_invoices,
        COUNT(DISTINCT customer_id) as unique_customers,
        SUM(subtotal) as total_sales,
        SUM(discount_amount) as total_discounts,
        SUM(total_amount) as net_sales,
        SUM(paid_amount) as collected_amount,
        SUM(remaining_amount) as outstanding_amount,
        SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_invoices,
        SUM(CASE WHEN payment_status = 'partial' THEN 1 ELSE 0 END) as partial_invoices
    FROM fox_system.sales_invoices
    WHERE is_cancelled = FALSE
    GROUP BY invoice_date
    ORDER BY invoice_date DESC;
    """,
    """
    CREATE OR REPLACE VIEW fox_system.v_inventory_summary AS
    SELECT 
        p.product_id,
        p.product_code,
        p.barcode,
        p.product_name,
        p.category,
        p.unit,
        p.current_stock,
        p.purchase_price,
        p.selling_price,
        (p.current_stock * p.purchase_price) as stock_value_cost,
        (p.current_stock * p.selling_price) as stock_value_selling,
        p.min_stock_level,
        p.max_stock_level,
        p.product_image,
        CASE 
            WHEN p.current_stock <= 0 THEN 'نفذت الكمية'
            WHEN p.current_stock <= p.min_stock_level THEN 'مخزون منخفض'
            WHEN p.current_stock >= p.max_stock_level THEN 'مخزون زائد'
            ELSE 'مخزون عادي'
        END as stock_status,
        p.is_active
    FROM fox_system.products p
    ORDER BY p.product_name;
    """,
    """
    CREATE OR REPLACE VIEW fox_system.v_outstanding_debts AS
    SELECT 
        d.debt_id,
        d.debt_type,
        d.entity_type,
        CASE 
            WHEN d.entity_type = 'customer' THEN c.customer_name
            WHEN d.entity_type = 'supplier' THEN s.supplier_name
        END as entity_name,
        CASE 
            WHEN d.entity_type = 'customer' THEN c.phone
            WHEN d.entity_type = 'supplier' THEN s.phone
        END as entity_phone,
        d.original_amount,
        d.paid_amount,
        d.remaining_amount,
        d.due_date,
        d.status,
        CASE 
            WHEN d.due_date < CURRENT_DATE AND d.status != 'paid' THEN 'متأخر'
            WHEN d.due_date = CURRENT_DATE THEN 'يستحق اليوم'
            WHEN d.due_date > CURRENT_DATE THEN 'مستقبلي'
            ELSE 'مسدد'
        END as aging_status,
        CASE 
            WHEN d.due_date < CURRENT_DATE THEN CURRENT_DATE - d.due_date
            ELSE 0
        END as days_overdue,
        d.created_at
    FROM fox_system.debts d
    LEFT JOIN fox_system.customers c ON d.entity_type = 'customer' AND d.entity_id = c.customer_id
    LEFT JOIN fox_system.suppliers s ON d.entity_type = 'supplier' AND d.entity_id = s.supplier_id
    WHERE d.status != 'paid'
    ORDER BY d.due_date ASC;
    """,
    """
    CREATE OR REPLACE VIEW fox_system.v_treasury_balance AS
    SELECT 
        payment_method,
        SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as total_expense,
        SUM(CASE WHEN transaction_type = 'opening_balance' THEN amount ELSE 0 END) as opening_balance,
        SUM(CASE 
            WHEN transaction_type = 'income' THEN amount 
            WHEN transaction_type = 'opening_balance' THEN amount
            ELSE -amount 
        END) as net_balance
    FROM fox_system.treasury
    GROUP BY payment_method;
    """,
    """
    CREATE OR REPLACE VIEW fox_system.v_profitability_report AS
    SELECT 
        si.invoice_date,
        si.invoice_number,
        c.customer_name,
        p.product_name,
        sii.quantity,
        p.purchase_price,
        sii.unit_price as selling_price,
        (sii.quantity * p.purchase_price) as cost,
        sii.total as revenue,
        (sii.total - (sii.quantity * p.purchase_price)) as profit,
        CASE 
            WHEN (sii.quantity * p.purchase_price) > 0 
            THEN ((sii.total - (sii.quantity * p.purchase_price)) / (sii.quantity * p.purchase_price) * 100)
            ELSE 0
        END as profit_margin_percentage
    FROM fox_system.sales_invoice_items sii
    JOIN fox_system.sales_invoices si ON sii.invoice_id = si.invoice_id
    JOIN fox_system.products p ON sii.product_id = p.product_id
    JOIN fox_system.customers c ON si.customer_id = c.customer_id
    WHERE si.is_cancelled = FALSE AND si.invoice_type = 'regular'
    ORDER BY si.invoice_date DESC, si.invoice_number;
    """
]

def run_sql():
    with connection.cursor() as cursor:
        for sql in SQL_COMMANDS:
            try:
                cursor.execute(sql)
                print(f"Successfully executed SQL block starting with: {sql.strip()[:50]}...")
            except Exception as e:
                print(f"Error executing SQL: {e}")
                # Don't stop, try others (e.g. if trigger exists)

if __name__ == "__main__":
    run_sql()
