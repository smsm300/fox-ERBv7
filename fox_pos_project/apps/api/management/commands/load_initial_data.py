"""
Management command to load initial data into the database
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.products.models import Product
from apps.customers.models import Customer
from apps.suppliers.models import Supplier
from apps.api.models import AppSettings


class Command(BaseCommand):
    help = 'Load initial data for Fox ERP system'
    
    def handle(self, *args, **options):
        self.stdout.write('Loading initial data...')
        
        # Check if data already exists
        if Product.objects.exists() or Customer.objects.exists() or Supplier.objects.exists():
            self.stdout.write(self.style.WARNING('Data already exists. Skipping initial data load.'))
            return
        
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
                'customer_type': 'business',
                'current_balance': -5000,
                'credit_limit': 10000
            },
            {
                'customer_code': 'C0003',
                'customer_name': 'أحمد للمقاولات',
                'phone': '01122334455',
                'customer_type': 'business',
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
        settings.logo_url = 'https://foxgroup-egy.com/wp-content/uploads/2022/03/logo.png'
        settings.auto_print = False
        settings.next_invoice_number = 1002
        settings.opening_balance = 50000
        settings.tax_rate = 14
        settings.prevent_negative_stock = False
        settings.invoice_terms = 'البضاعة المباعة ترد وتستبدل خلال 14 يوماً بحالتها الأصلية. تطبق الشروط والأحكام.'
        settings.save()
        
        self.stdout.write(self.style.SUCCESS('Created initial settings'))
        
        self.stdout.write(self.style.SUCCESS('Initial data loaded successfully!'))
