#!/usr/bin/env python3
"""
Test script for User Rating System API endpoints
"""
import os
import sys
import django
import requests
import json

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'marketplace.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import UserRating
from orders.models import Order
from products.models import Product

User = get_user_model()

def test_user_rating_system():
    """Test the user rating system functionality"""
    print("🧪 Testing User Rating System...")
    
    # Create test users if they don't exist
    try:
        buyer = User.objects.get(username='test_buyer')
    except User.DoesNotExist:
        buyer = User.objects.create_user(
            username='test_buyer',
            email='buyer@test.com',
            password='testpass123',
            user_type='buyer'
        )
        print("✅ Created test buyer")
    
    try:
        seller = User.objects.get(username='test_seller')
    except User.DoesNotExist:
        seller = User.objects.create_user(
            username='test_seller',
            email='seller@test.com',
            password='testpass123',
            user_type='seller'
        )
        print("✅ Created test seller")
    
    # Create a test product and order
    try:
        product = Product.objects.get(title='Test Product for Rating')
    except Product.DoesNotExist:
        product = Product.objects.create(
            title='Test Product for Rating',
            description='Test product description',
            price=100.00,
            seller=seller,
            category='electronics',
            condition='used',
            location='Test City'
        )
        print("✅ Created test product")
    
    # Create a delivered order
    try:
        order = Order.objects.get(buyer=buyer, seller=seller, product=product)
    except Order.DoesNotExist:
        order = Order.objects.create(
            order_number='TEST001',
            buyer=buyer,
            seller=seller,
            product=product,
            unit_price=100.00,
            total_amount=100.00,
            shipping_address='Test Address',
            shipping_city='Test City',
            shipping_country='Test Country',
            shipping_postal_code='12345',
            shipping_phone='1234567890',
            shipping_method='post',
            status='delivered'
        )
        print("✅ Created test delivered order")
    else:
        order.status = 'delivered'
        order.save()
        print("✅ Updated order status to delivered")
    
    # Test creating a user rating (buyer rating seller)
    try:
        rating = UserRating.objects.get(from_user=buyer, to_user=seller)
        print(f"ℹ️  Rating already exists: {rating}")
    except UserRating.DoesNotExist:
        rating = UserRating.objects.create(
            from_user=buyer,
            to_user=seller,
            rating=5,
            review="Excellent seller! Great communication and fast shipping."
        )
        print(f"✅ Created user rating: {rating}")
    
    # Test creating another rating (seller rating buyer)
    try:
        rating2 = UserRating.objects.get(from_user=seller, to_user=buyer)
        print(f"ℹ️  Rating already exists: {rating2}")
    except UserRating.DoesNotExist:
        rating2 = UserRating.objects.create(
            from_user=seller,
            to_user=buyer,
            rating=4,
            review="Good buyer, paid quickly and communicated well."
        )
        print(f"✅ Created seller rating buyer: {rating2}")
    
    # Check average ratings
    seller.refresh_from_db()
    buyer.refresh_from_db()
    
    print(f"\n📊 Rating Statistics:")
    print(f"Seller ({seller.username}) - Average Rating: {seller.average_rating}, Total: {seller.total_ratings}")
    print(f"Buyer ({buyer.username}) - Average Rating: {buyer.average_rating}, Total: {buyer.total_ratings}")
    
    # Test API endpoints
    print(f"\n🌐 Testing API Endpoints:")
    base_url = "http://127.0.0.1:8000/api"
    
    # Test getting user ratings
    try:
        response = requests.get(f"{base_url}/users/ratings/{seller.id}/")
        if response.status_code == 200:
            ratings_data = response.json()
            print(f"✅ GET /users/ratings/{seller.id}/ - Success: {len(ratings_data.get('results', []))} ratings")
        else:
            print(f"❌ GET /users/ratings/{seller.id}/ - Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ API test failed: {e}")
    
    print(f"\n✅ User Rating System Test Complete!")
    return True

if __name__ == "__main__":
    test_user_rating_system()
