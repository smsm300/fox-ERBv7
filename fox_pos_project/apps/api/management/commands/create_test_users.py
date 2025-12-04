from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create test users for Fox ERP'

    def handle(self, *args, **kwargs):
        # Delete existing users
        User.objects.filter(username__in=['admin', 'cashier']).delete()
        
        # Create admin user
        admin = User.objects.create_superuser(
            username='admin',
            password='admin',
            email='admin@foxgroup.com'
        )
        self.stdout.write(self.style.SUCCESS(f'✓ Created admin user: {admin.username}'))
        
        # Create cashier user
        cashier = User.objects.create_user(
            username='cashier',
            password='123',
            email='cashier@foxgroup.com'
        )
        self.stdout.write(self.style.SUCCESS(f'✓ Created cashier user: {cashier.username}'))
        
        self.stdout.write(self.style.SUCCESS('\n✓ Test users created successfully!'))
        self.stdout.write(self.style.WARNING('\nLogin credentials:'))
        self.stdout.write('  Admin:   username=admin    password=admin')
        self.stdout.write('  Cashier: username=cashier  password=123')
