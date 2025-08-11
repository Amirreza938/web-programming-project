from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = 'Create the admin user Amirreza938938'

    def handle(self, *args, **options):
        username = 'Amirreza938938'
        password = '12345678A@'
        email = 'admin@marketplace.com'

        with transaction.atomic():
            # Check if admin user already exists
            if User.objects.filter(username=username).exists():
                self.stdout.write(
                    self.style.WARNING(f'Admin user "{username}" already exists')
                )
                return

            # Create admin user
            admin_user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name='Admin',
                last_name='User',
                user_type='admin',
                is_staff=True,
                is_superuser=True,
                verification_status='not_required',
                account_approved=True
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created admin user "{username}" with password "{password}"'
                )
            )
