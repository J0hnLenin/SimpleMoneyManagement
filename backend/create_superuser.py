import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SimpleMoneyManagement.settings')
django.setup()

def create_superuser():
    User = get_user_model()
    
    username = os.getenv('DJANGO_SUPERUSER_USERNAME', "admin")
    email = os.getenv('DJANGO_SUPERUSER_EMAIL', "")
    password = os.getenv('DJANGO_SUPERUSER_PASSWORD', "admin")
    
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username, email, password)
        if User.objects.filter(username=username).exists():
            print(f"Superuser created successfully!")
        else:
            raise Exception("ERROR: Can't create superuser :(")
    else:
        print(f"Superuser already exists!")

if __name__ == '__main__':
    create_superuser()