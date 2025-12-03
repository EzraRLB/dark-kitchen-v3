from django.core.management.base import BaseCommand
from users.models import User

class Command(BaseCommand):
    help = 'Create a new user with PIN or email+password'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username')
        parser.add_argument('--pin', type=str, help='6-digit PIN for PIN-based login')
        parser.add_argument('--email', type=str, help='Email for email+password login')
        parser.add_argument('--password', type=str, help='Password for email+password login')
        parser.add_argument('--role', type=str, choices=['cocina', 'reparto', 'ensamble', 'supervisor', 'admin'], default='cocina')
        parser.add_argument('--alias', type=str, help='User alias/display name')
        parser.add_argument('--unit', type=str, help='Work unit/station')

    def handle(self, *args, **options):
        username = options['username']
        
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.ERROR(f'User {username} already exists'))
            return

        user = User(
            username=username,
            user_role=options['role'],
            user_alias=options.get('alias', ''),
            unit=options.get('unit', ''),
        )

        if options['pin']:
            if len(options['pin']) != 6 or not options['pin'].isdigit():
                self.stdout.write(self.style.ERROR('PIN must be exactly 6 digits'))
                return
            user.user_pin = options['pin']
            
        elif options['email'] and options['password']:
            user.email = options['email']
            user.set_password(options['password'])
            
        else:
            self.stdout.write(self.style.ERROR('Must provide either --pin or both --email and --password'))
            return

        user.save()
        self.stdout.write(self.style.SUCCESS(f'User {username} created successfully'))