import os
import sys
import django
from django.core.management import call_command

# Add project root to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fox_pos.settings')
django.setup()

def backup():
    output_file = "../fox_db_backup.json"
    print(f"Creating clean backup (excluding views)...")
    with open(output_file, "w", encoding="utf-8") as f:
        # Exclude 'reports' app because it contains views that cannot be loaded back
        # Also exclude contenttypes and permissions to avoid integrity errors on fresh DBs
        call_command('dumpdata', 
                     exclude=['reports', 'contenttypes', 'auth.permission'], 
                     indent=2, 
                     stdout=f)
    print(f"Backup created successfully: {output_file}")

if __name__ == "__main__":
    backup()
