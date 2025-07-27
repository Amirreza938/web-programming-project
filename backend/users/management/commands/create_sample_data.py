from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from products.models import Category, Product, ProductImage
from orders.models import ShippingMethod
from decimal import Decimal

User = get_user_model()


class Command(BaseCommand):
    help = 'Create sample data for the marketplace'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        with transaction.atomic():
            # Create sample users
            self.create_sample_users()
            
            # Create sample categories
            self.create_sample_categories()
            
            # Create sample shipping methods
            self.create_sample_shipping_methods()
            
            # Create sample products
            self.create_sample_products()
        
        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))

    def create_sample_users(self):
        """Create sample users"""
        users_data = [
            {
                'username': 'john_doe',
                'email': 'john@example.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'user_type': 'both',
                'phone_number': '+1234567890',
                'address': '123 Main St',
                'city': 'New York',
                'country': 'USA',
                'postal_code': '10001',
                'is_active_seller': True,
                'verification_status': 'verified'
            },
            {
                'username': 'jane_smith',
                'email': 'jane@example.com',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'user_type': 'both',
                'phone_number': '+1234567891',
                'address': '456 Oak Ave',
                'city': 'Los Angeles',
                'country': 'USA',
                'postal_code': '90210',
                'is_active_seller': True,
                'verification_status': 'verified'
            },
            {
                'username': 'mike_buyer',
                'email': 'mike@example.com',
                'first_name': 'Mike',
                'last_name': 'Johnson',
                'user_type': 'buyer',
                'phone_number': '+1234567892',
                'address': '789 Pine St',
                'city': 'Chicago',
                'country': 'USA',
                'postal_code': '60601'
            }
        ]
        
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults=user_data
            )
            if created:
                user.set_password('password123')
                user.save()
                self.stdout.write(f'Created user: {user.username}')

    def create_sample_categories(self):
        """Create sample categories"""
        categories_data = [
            {
                'name': 'Electronics',
                'description': 'Electronic devices and gadgets'
            },
            {
                'name': 'Clothing',
                'description': 'Fashion and apparel'
            },
            {
                'name': 'Home & Garden',
                'description': 'Home improvement and gardening items'
            },
            {
                'name': 'Sports & Outdoors',
                'description': 'Sports equipment and outdoor gear'
            },
            {
                'name': 'Books & Media',
                'description': 'Books, movies, and music'
            },
            {
                'name': 'Automotive',
                'description': 'Car parts and accessories'
            }
        ]
        
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(f'Created category: {category.name}')

    def create_sample_shipping_methods(self):
        """Create sample shipping methods"""
        shipping_methods_data = [
            {
                'name': 'Standard Shipping',
                'description': '5-7 business days',
                'base_cost': Decimal('5.99'),
                'estimated_days': 7
            },
            {
                'name': 'Express Shipping',
                'description': '2-3 business days',
                'base_cost': Decimal('12.99'),
                'estimated_days': 3
            },
            {
                'name': 'Overnight Shipping',
                'description': 'Next business day',
                'base_cost': Decimal('24.99'),
                'estimated_days': 1
            },
            {
                'name': 'Local Pickup',
                'description': 'Pick up from seller location',
                'base_cost': Decimal('0.00'),
                'estimated_days': 0
            }
        ]
        
        for method_data in shipping_methods_data:
            method, created = ShippingMethod.objects.get_or_create(
                name=method_data['name'],
                defaults=method_data
            )
            if created:
                self.stdout.write(f'Created shipping method: {method.name}')

    def create_sample_products(self):
        """Create sample products"""
        # Get users and categories
        john = User.objects.get(username='john_doe')
        jane = User.objects.get(username='jane_smith')
        electronics = Category.objects.get(name='Electronics')
        clothing = Category.objects.get(name='Clothing')
        home = Category.objects.get(name='Home & Garden')
        
        products_data = [
            {
                'seller': john,
                'category': electronics,
                'title': 'iPhone 12 Pro - Excellent Condition',
                'description': 'iPhone 12 Pro in excellent condition. 128GB, Pacific Blue. Includes original box and charger. No scratches or damage.',
                'condition': 'like_new',
                'brand': 'Apple',
                'model': 'iPhone 12 Pro',
                'price': Decimal('699.99'),
                'original_price': Decimal('999.99'),
                'is_negotiable': True,
                'location': '123 Main St, New York, NY',
                'city': 'New York',
                'country': 'USA',
                'shipping_options': ['post', 'pickup'],
                'shipping_cost': Decimal('15.00')
            },
            {
                'seller': john,
                'category': electronics,
                'title': 'MacBook Air M1 - Good Condition',
                'description': 'MacBook Air with M1 chip. 8GB RAM, 256GB SSD. Some minor wear but works perfectly. Great for work or school.',
                'condition': 'good',
                'brand': 'Apple',
                'model': 'MacBook Air M1',
                'price': Decimal('799.99'),
                'original_price': Decimal('1299.99'),
                'is_negotiable': True,
                'location': '123 Main St, New York, NY',
                'city': 'New York',
                'country': 'USA',
                'shipping_options': ['post', 'pickup'],
                'shipping_cost': Decimal('25.00')
            },
            {
                'seller': jane,
                'category': clothing,
                'title': 'Designer Handbag - Louis Vuitton',
                'description': 'Authentic Louis Vuitton handbag. Neverfull MM size. Brown monogram canvas. Includes dust bag.',
                'condition': 'like_new',
                'brand': 'Louis Vuitton',
                'model': 'Neverfull MM',
                'price': Decimal('899.99'),
                'original_price': Decimal('1499.99'),
                'is_negotiable': False,
                'location': '456 Oak Ave, Los Angeles, CA',
                'city': 'Los Angeles',
                'country': 'USA',
                'shipping_options': ['post', 'pickup'],
                'shipping_cost': Decimal('20.00')
            },
            {
                'seller': jane,
                'category': home,
                'title': 'Vintage Coffee Table',
                'description': 'Beautiful vintage coffee table. Solid wood construction. Perfect condition. Great for living room.',
                'condition': 'good',
                'brand': 'Vintage',
                'model': 'Coffee Table',
                'price': Decimal('299.99'),
                'original_price': Decimal('450.00'),
                'is_negotiable': True,
                'location': '456 Oak Ave, Los Angeles, CA',
                'city': 'Los Angeles',
                'country': 'USA',
                'shipping_options': ['pickup'],
                'shipping_cost': Decimal('0.00')
            },
            {
                'seller': john,
                'category': electronics,
                'title': 'Sony WH-1000XM4 Headphones',
                'description': 'Sony noise-canceling headphones. Excellent sound quality. Includes carrying case and cables.',
                'condition': 'like_new',
                'brand': 'Sony',
                'model': 'WH-1000XM4',
                'price': Decimal('249.99'),
                'original_price': Decimal('349.99'),
                'is_negotiable': True,
                'location': '123 Main St, New York, NY',
                'city': 'New York',
                'country': 'USA',
                'shipping_options': ['post', 'pickup'],
                'shipping_cost': Decimal('10.00')
            }
        ]
        
        for product_data in products_data:
            product, created = Product.objects.get_or_create(
                title=product_data['title'],
                seller=product_data['seller'],
                defaults=product_data
            )
            if created:
                self.stdout.write(f'Created product: {product.title}') 