"""
Management command to load initial data into the database
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.products.models import Product
from apps.customers.models import Customer
from apps.suppliers.models import Supplier
from apps.api.models import AppSettings, Transaction, Shift, ActivityLog
from apps.quotations.models import Quotation, QuotationItem
from django.utils import timezone


class Command(BaseCommand):
    help = 'Load initial data for Fox ERP system'
    
    def handle(self, *args, **options):
        self.stdout.write('Loading initial data...')
        
        # Check if data already exists
        if Product.objects.exists() or Customer.objects.exists() or Supplier.objects.exists():
            self.stdout.write(self.style.WARNING('⚠️  Data already exists. Skipping initial data load.'))
            self.stdout.write(self.style.WARNING('    To reload data, first run: python manage.py clear_all_data'))
            return
        
        self.stdout.write(self.style.SUCCESS('✓ No existing data found. Loading initial data...'))
        
        # Load initial products
        self.stdout.write('Creating initial products...')
        products_data = [
            {
                'product_code': 'CRN-001',
                'product_name': 'كرنيشة فيوتك مودرن 10سم',
                'category': 'كرانيش',
                'current_stock': 150,
                'purchase_price': 45,
                'selling_price': 65,
                'unit': 'متر',
                'min_stock_level': 50,
                'product_image': 'https://picsum.photos/200/200?random=1'
            },
            {
                'product_code': 'LGT-005',
                'product_name': 'أباليك كلاسيك نحاسي',
                'category': 'إضاءة',
                'current_stock': 20,
                'purchase_price': 150,
                'selling_price': 350,
                'unit': 'قطعة',
                'min_stock_level': 10,
                'product_image': 'https://picsum.photos/200/200?random=2'
            },
            {
                'product_code': 'WPN-012',
                'product_name': 'بانوهات 4سم سادة',
                'category': 'بانوهات',
                'current_stock': 300,
                'purchase_price': 20,
                'selling_price': 35,
                'unit': 'متر',
                'min_stock_level': 100,
                'product_image': 'https://picsum.photos/200/200?random=3'
            },
            {
                'product_code': 'GLU-001',
                'product_name': 'معجون لاصق فيوتك',
                'category': 'لوازم',
                'current_stock': 5,
                'purchase_price': 25,
                'selling_price': 40,
                'unit': 'كرتونة',
                'min_stock_level': 20,
                'product_image': 'https://picsum.photos/200/200?random=4'
            },
            {
                'product_code': 'PUC-101',
                'product_name': 'كرنيشة فوم بولي يوريثان 12سم مودرن',
                'category': 'كرانيش',
                'current_stock': 200,
                'purchase_price': 80,
                'selling_price': 120,
                'unit': 'متر',
                'min_stock_level': 60,
                'product_image': 'https://picsum.photos/200/200?random=5'
            },
            {
                'product_code': 'PUC-102',
                'product_name': 'كرنيشة فوم كلاسيك 8سم',
                'category': 'كرانيش',
                'current_stock': 180,
                'purchase_price': 70,
                'selling_price': 110,
                'unit': 'متر',
                'min_stock_level': 50,
                'product_image': 'https://picsum.photos/200/200?random=6'
            },
            {
                'product_code': 'RZT-601',
                'product_name': 'روزيت سقف فوم 60سم',
                'category': 'روزيت',
                'current_stock': 80,
                'purchase_price': 200,
                'selling_price': 320,
                'unit': 'قطعة',
                'min_stock_level': 20,
                'product_image': 'https://picsum.photos/200/200?random=7'
            },
            {
                'product_code': 'PNL-501',
                'product_name': 'بانوه حائط فوم 50x50',
                'category': 'بانوهات',
                'current_stock': 120,
                'purchase_price': 140,
                'selling_price': 220,
                'unit': 'قطعة',
                'min_stock_level': 30,
                'product_image': 'https://picsum.photos/200/200?random=8'
            },
            {
                'product_code': 'SKR-701',
                'product_name': 'سكرتنج فوم 10سم',
                'category': 'سكرتنج',
                'current_stock': 250,
                'purchase_price': 70,
                'selling_price': 110,
                'unit': 'متر',
                'min_stock_level': 80,
                'product_image': 'https://picsum.photos/200/200?random=9'
            },
            {
                'product_code': 'TRM-801',
                'product_name': 'حلية زاوية فوم',
                'category': 'حلويات ديكور',
                'current_stock': 140,
                'purchase_price': 85,
                'selling_price': 130,
                'unit': 'قطعة',
                'min_stock_level': 40,
                'product_image': 'https://picsum.photos/200/200?random=10'
            }
        ]
        
        for product_data in products_data:
            Product.objects.create(**product_data)
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(products_data)} products'))
        
        # Load initial customers
        self.stdout.write('Creating initial customers...')
        customers_data = [
            {
                'customer_code': 'C0001',
                'customer_name': 'عميل نقدي',
                'phone': '0000000000',
                'customer_type': 'consumer',
                'current_balance': 0,
                'credit_limit': 0
            },
            {
                'customer_code': 'C0002',
                'customer_name': 'مكتب الهندسية للديكور',
                'phone': '01012345678',
                'customer_type': 'regular',
                'current_balance': -5000,
                'credit_limit': 10000
            },
            {
                'customer_code': 'C0003',
                'customer_name': 'أحمد للمقاولات',
                'phone': '01122334455',
                'customer_type': 'regular',
                'current_balance': 0,
                'credit_limit': 20000
            }
        ]
        
        for customer_data in customers_data:
            Customer.objects.create(**customer_data)
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(customers_data)} customers'))
        
        # Load initial suppliers
        self.stdout.write('Creating initial suppliers...')
        suppliers_data = [
            {
                'supplier_code': 'S0001',
                'supplier_name': 'مصنع فيوتك',
                'phone': '0223456789',
                'current_balance': 12000
            },
            {
                'supplier_code': 'S0002',
                'supplier_name': 'الشركة الدولية للإضاءة',
                'phone': '0229876543',
                'current_balance': 0
            },
            {
                'supplier_code': 'S0003',
                'supplier_name': 'فوكس ايجيبت جروب للتصنيع',
                'phone': '01501108110',
                'current_balance': 0
            }
        ]
        
        for supplier_data in suppliers_data:
            Supplier.objects.create(**supplier_data)
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(suppliers_data)} suppliers'))
        
        # Load initial users
        self.stdout.write('Creating initial users...')
        
        # Create admin user
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                password='admin',
                first_name='المدير العام',
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write(self.style.SUCCESS('Created admin user'))
        
        # Create cashier user
        if not User.objects.filter(username='cashier').exists():
            User.objects.create_user(
                username='cashier',
                password='123',
                first_name='كاشير 1',
                is_staff=False
            )
            self.stdout.write(self.style.SUCCESS('Created cashier user'))
        
        # Load initial settings
        self.stdout.write('Creating initial settings...')
        settings = AppSettings.get_settings()
        settings.company_name = 'FOX GROUP'
        settings.company_phone = '01112223334'
        settings.company_address = 'القاهرة - مصر'
        # Use local logo path by default or empty to fallback to frontend default
        settings.logo_url = '/fox-logo.png'
        settings.auto_print = False
        settings.next_invoice_number = 1002
        settings.opening_balance = 50000
        settings.tax_rate = 14
        settings.prevent_negative_stock = False
        settings.invoice_terms = 'البضاعة المباعة ترد وتستبدل خلال 14 يوماً بحالتها الأصلية. تطبق الشروط والأحكام.'
        settings.save()
        
        self.stdout.write(self.style.SUCCESS('Created initial settings'))
        
        # Create a demo shift
        self.stdout.write('Creating demo shift and transactions...')
        admin_user = User.objects.filter(username='admin').first() or User.objects.first()
        shift = Shift.objects.create(
            user=admin_user,
            start_cash=5000,
            status='open'
        )
        
        settings.current_shift = shift
        settings.save()
        
        # Prepare references
        consumer = Customer.objects.filter(customer_type='consumer').first() or Customer.objects.first()
        regular = Customer.objects.filter(customer_type='regular').first() or consumer
        supplier = Supplier.objects.first()
        products = list(Product.objects.all()[:5])
        
        def cart_item(p: Product, qty: float):
            return {
                'id': p.product_id,
                'sku': p.product_code,
                'name': p.product_name,
                'category': p.category or 'ديكور',
                'quantity': float(p.current_stock),
                'costPrice': float(p.purchase_price),
                'sellPrice': float(p.selling_price),
                'unit': p.unit,
                'minStockAlert': float(p.min_stock_level),
                'cartQuantity': qty,
                'discount': 0.0,
                'image': p.product_image,
            }
        
        now = timezone.now()
        
        # Transactions: Sales
        sales_tx = [
            {
                'transaction_id': 'INV-10001',
                'type': 'بيع',
                'amount': 1200.00,
                'payment_method': 'كاش',
                'description': 'بيع كرانيش فوم ومستلزمات ديكور',
                'items': [cart_item(products[0], 5), cart_item(products[1], 2)],
                'related_customer': consumer,
                'shift': shift,
                'date': now,
            },
            {
                'transaction_id': 'INV-10002',
                'type': 'بيع',
                'amount': 850.00,
                'payment_method': 'محفظة',
                'description': 'روزيت سقف + بانوه حائط',
                'items': [cart_item(products[2], 3), cart_item(products[3], 1)],
                'related_customer': regular,
                'shift': shift,
                'date': now,
            },
            {
                'transaction_id': 'INV-10003',
                'type': 'بيع',
                'amount': 600.00,
                'payment_method': 'Instapay',
                'description': 'سكرتنج فوم 10سم',
                'items': [cart_item(products[4], 6)],
                'related_customer': consumer,
                'shift': shift,
                'date': now,
            },
            {
                'transaction_id': 'INV-10004',
                'type': 'بيع',
                'amount': 1500.00,
                'payment_method': 'آجل',
                'description': 'توريد كرانيش لمكتب ديكور',
                'items': [cart_item(products[0], 10), cart_item(products[2], 5)],
                'related_customer': regular,
                'shift': shift,
                'due_date': (now + timezone.timedelta(days=14)).date(),
                'date': now,
            },
        ]
        
        for tx in sales_tx:
            Transaction.objects.create(
                transaction_id=tx['transaction_id'],
                type=tx['type'],
                amount=tx['amount'],
                payment_method=tx['payment_method'],
                description=tx['description'],
                items=tx['items'],
                related_customer=tx.get('related_customer'),
                shift=tx.get('shift'),
                due_date=tx.get('due_date'),
                status='completed'
            )
        
        # Transactions: Purchases
        purchase_tx = [
            {
                'transaction_id': 'PUR-20001',
                'type': 'شراء',
                'amount': 5000.00,
                'payment_method': 'كاش',
                'description': 'شراء بضاعة فوم من المورد',
                'items': [cart_item(products[0], 50), cart_item(products[1], 20)],
                'related_supplier': supplier,
            },
            {
                'transaction_id': 'PUR-20002',
                'type': 'شراء',
                'amount': 2800.00,
                'payment_method': 'آجل',
                'description': 'توريد بانوهات وروزيت',
                'items': [cart_item(products[2], 40), cart_item(products[3], 15)],
                'related_supplier': supplier,
                'due_date': (now + timezone.timedelta(days=30)).date(),
            },
        ]
        for tx in purchase_tx:
            Transaction.objects.create(
                transaction_id=tx['transaction_id'],
                type=tx['type'],
                amount=tx['amount'],
                payment_method=tx['payment_method'],
                description=tx['description'],
                items=tx['items'],
                related_supplier=tx.get('related_supplier'),
                due_date=tx.get('due_date'),
                status='completed'
            )
        
        # Transactions: Expenses
        expenses_tx = [
            {
                'transaction_id': 'EXP-30001',
                'type': 'مصروف',
                'amount': 1500.00,
                'payment_method': 'كاش',
                'description': 'إيجار محل الشهر',
                'category': 'إيجار',
            },
            {
                'transaction_id': 'EXP-30002',
                'type': 'مصروف',
                'amount': 450.00,
                'payment_method': 'كاش',
                'description': 'كهرباء ومياه',
                'category': 'كهرباء ومياه',
            },
            {
                'transaction_id': 'EXP-30003',
                'type': 'مصروف',
                'amount': 700.00,
                'payment_method': 'كاش',
                'description': 'مصروفات تشغيلية ونقل',
                'category': 'مصروفات تشغيلية',
            },
        ]
        for tx in expenses_tx:
            Transaction.objects.create(
                transaction_id=tx['transaction_id'],
                type=tx['type'],
                amount=tx['amount'],
                payment_method=tx['payment_method'],
                description=tx['description'],
                category=tx['category'],
                status='completed'
            )
        
        # Transaction: Capital Deposit
        Transaction.objects.create(
            transaction_id='CAP-40001',
            type='إيداع رأس مال',
            amount=10000.00,
            payment_method='كاش',
            description='تعزيز السيولة للخزينة',
            status='completed'
        )
        
        # Update Shift totals and close it
        sales_by_method = {
            'كاش': 1200.00,
            'محفظة': 850.00,
            'Instapay': 600.00,
            'آجل': 1500.00,
        }
        shift.sales_by_method = sales_by_method
        shift.total_sales = sum(v for v in sales_by_method.values())
        shift.expected_cash = shift.start_cash + sales_by_method['كاش'] + sales_by_method['Instapay'] + sales_by_method['محفظة'] - 0
        shift.end_cash = shift.expected_cash
        shift.end_time = timezone.now()
        shift.status = 'closed'
        shift.save()
        
        # Create sample quotations
        q_customer = regular
        sample_products = products[:3]
        q_subtotal = sum(float(p.selling_price) * qty for p, qty in [(sample_products[0], 5), (sample_products[1], 3), (sample_products[2], 2)])
        quotation = Quotation.objects.create(
            quotation_number='Q00001',
            customer=q_customer,
            subtotal=q_subtotal,
            discount_amount=0.0,
            tax_amount=0.0,
            total_amount=q_subtotal,
            status='draft',
            created_by=admin_user.id if admin_user else None
        )
        for p, qty in [(sample_products[0], 5), (sample_products[1], 3), (sample_products[2], 2)]:
            QuotationItem.objects.create(
                quotation=quotation,
                product=p,
                quantity=qty,
                unit_price=float(p.selling_price),
                total=float(p.selling_price) * qty
            )
        
        ActivityLog.objects.create(
            user=admin_user,
            user_name=admin_user.first_name or admin_user.username,
            action='تهيئة بيانات تجريبية',
            details='إنشاء منتجات/عملاء/موردين/وردية ومعاملات وعرض سعر للعرض التجريبي'
        )
        
        self.stdout.write(self.style.SUCCESS('Initial data loaded successfully!'))
