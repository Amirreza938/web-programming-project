from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
import random

from products.models import Category, Product, ProductImage  # matches your models
# Optional: seed shipping methods if the orders app exists
try:
    from orders.models import ShippingMethod  # type: ignore
    HAS_ORDERS = True
except Exception:
    HAS_ORDERS = False

User = get_user_model()


def _rand_image_urls(n=1):
    # picsum has stable, hotlink-friendly placeholders
    ids = random.sample(range(100, 1200), k=n)
    return [f"https://picsum.photos/id/{i}/1200/800" for i in ids]


class Command(BaseCommand):
    help = "Seed admin, users, categories, (optional) shipping methods, and VERIFIED products compatible with current models."

    def add_arguments(self, parser):
        parser.add_argument("--sellers", type=int, default=3, help="How many seller accounts to create.")
        parser.add_argument("--buyers", type=int, default=2, help="How many buyer accounts to create.")
        parser.add_argument("--products", type=int, default=15, help="How many products to create (spread across sellers).")
        parser.add_argument("--reset", action="store_true", help="If set, will not delete data (safe). Present just for parity; does nothing destructive.")

    def handle(self, *args, **options):
        sellers_n = options["sellers"]
        buyers_n = options["buyers"]
        products_n = options["products"]

        self.stdout.write(self.style.WARNING("Seeding data…"))
        with transaction.atomic():
            admin = self._ensure_admin()
            sellers = self._ensure_sellers(sellers_n)
            buyers = self._ensure_buyers(buyers_n)
            cats = self._ensure_categories()
            if HAS_ORDERS:
                self._ensure_shipping_methods()
            self._ensure_products(products_n, admin, sellers, cats)

        self.stdout.write(self.style.SUCCESS("✓ Done."))

    # --- helpers -------------------------------------------------------------

    def _ensure_admin(self):
        """
        Create/ensure a superuser aligned with your User model defaults:
        user_type='admin', account_approved=True, verification_status='not_required'.
        """
        admin, created = User.objects.get_or_create(
            username="admin",
            defaults=dict(
                email="admin@example.com",
                first_name="Admin",
                last_name="User",
                user_type="admin",
                account_approved=True,
                verification_status="not_required",
                is_staff=True,
                is_superuser=True,
            ),
        )
        if created:
            admin.set_password("admin123")
            admin.save()
            self.stdout.write(self.style.SUCCESS("Created superuser: admin / admin123"))
        else:
            # keep flags consistent
            changed = False
            desired = dict(
                user_type="admin",
                account_approved=True,
                verification_status="not_required",
                is_staff=True,
                is_superuser=True,
            )
            for k, v in desired.items():
                if getattr(admin, k) != v:
                    setattr(admin, k, v)
                    changed = True
            if changed:
                admin.save()
                self.stdout.write(self.style.SUCCESS("Updated existing admin flags."))
            else:
                self.stdout.write("Admin already exists.")
        return admin

    def _ensure_sellers(self, n):
        """
        Make verified & approved sellers to satisfy Product.seller FK and your can_sell()
        (user_type in ['seller','both'] + account_approved=True + verification_status='verified').
        """
        sellers = []
        cities = [("Berlin", "Germany"), ("Munich", "Germany"), ("Hamburg", "Germany"), ("Cologne", "Germany")]
        for i in range(n):
            username = f"seller{i+1}"
            city, country = random.choice(cities)
            user, created = User.objects.get_or_create(
                username=username,
                defaults=dict(
                    email=f"{username}@example.com",
                    first_name=f"Seller{i+1}",
                    last_name="User",
                    user_type="both",
                    phone_number=f"+49176{random.randint(1000000, 9999999)}",
                    city=city,
                    country=country,
                    account_approved=True,
                    verification_status="verified",
                    is_active_seller=True,
                ),
            )
            if created:
                user.set_password("password123")
                user.save()
                self.stdout.write(f"Created seller: {user.username}")
            sellers.append(user)
        return sellers

    def _ensure_buyers(self, n):
        buyers = []
        cities = [("Berlin", "Germany"), ("Frankfurt", "Germany"), ("Stuttgart", "Germany")]
        for i in range(n):
            username = f"buyer{i+1}"
            city, country = random.choice(cities)
            user, created = User.objects.get_or_create(
                username=username,
                defaults=dict(
                    email=f"{username}@example.com",
                    first_name=f"Buyer{i+1}",
                    last_name="User",
                    user_type="buyer",
                    phone_number=f"+49175{random.randint(1000000, 9999999)}",
                    city=city,
                    country=country,
                    # your User.save() sets buyer: verification_status='not_required', account_approved=True
                ),
            )
            if created:
                user.set_password("password123")
                user.save()
                self.stdout.write(f"Created buyer: {user.username}")
            buyers.append(user)
        return buyers

    def _ensure_categories(self):
        rows = [
            ("Electronics", "Devices and gadgets"),
            ("Clothing", "Fashion and apparel"),
            ("Home & Garden", "Home improvement and gardening"),
            ("Sports & Outdoors", "Sports equipment and outdoor gear"),
            ("Books & Media", "Books, movies, and music"),
            ("Automotive", "Car parts and accessories"),
        ]
        cats = {}
        for name, desc in rows:
            cat, created = Category.objects.get_or_create(name=name, defaults={"description": desc})
            if created:
                self.stdout.write(f"Created category: {name}")
            cats[name] = cat
        return cats

    def _ensure_shipping_methods(self):
        data = [
            ("Standard Shipping", "5–7 business days", Decimal("5.99"), 7),
            ("Express Shipping", "2–3 business days", Decimal("12.99"), 3),
            ("Overnight", "Next business day", Decimal("24.99"), 1),
            ("Local Pickup", "Pick up from seller", Decimal("0.00"), 0),
        ]
        for name, desc, cost, days in data:
            ShippingMethod.objects.get_or_create(
                name=name,
                defaults={"description": desc, "base_cost": cost, "estimated_days": days},
            )

    def _ensure_products(self, n, admin, sellers, cats):
        """
        Create n products spread across sellers; each product is VERIFIED+ACTIVE and
        has at least one ProductImage via image_url (no local media).
        """
        titles_by_cat = {
            "Electronics": [
                "iPhone 12 Pro 128GB", "Samsung Galaxy S21", "MacBook Air M1",
                "Sony WH-1000XM4", "GoPro HERO9", "Kindle Paperwhite",
                "Dell XPS 13", "iPad Pro 11", "Canon EOS R", "Nikon D750",
                "Surface Pro 7", "Galaxy Tab S7", "PS5 Console", "Xbox Series X",
                "Apple Watch Series 7", "Fitbit Versa 3", "JBL Bluetooth Speaker",
                "Raspberry Pi 4", "Nintendo Switch OLED", "DJI Mavic Mini"
            ],
            "Clothing": [
                "Leather Jacket (L)", "Running Shoes EU 43", "Winter Parka (M)",
                "Designer Jeans (32/32)", "T-Shirt Pack (M)", "Wool Sweater (XL)",
                "Baseball Cap", "Hiking Boots (45)", "Raincoat (L)",
                "Formal Suit (50R)", "Evening Dress (S)", "Sneakers (EU 41)"
            ],
            "Home & Garden": [
                "Vintage Coffee Table", "Desk Lamp", "Air Purifier", "Electric Kettle",
                "Microwave Oven", "Blender 700W", "Vacuum Cleaner", "Wall Clock",
                "Bookshelf", "Office Chair", "Garden Hose 20m", "Patio Umbrella"
            ],
            "Sports & Outdoors": [
                "Mountain Bike Helmet", "Yoga Mat", "Camping Tent 2P",
                "Sleeping Bag", "Hiking Backpack 60L", "Tennis Racket",
                "Football", "Basketball", "Climbing Shoes", "Fishing Rod",
                "Kayak Paddle", "Ski Goggles"
            ],
            "Books & Media": [
                "Django for APIs (Book)", "Inception Blu-ray", "Guitar Starter Kit",
                "The Pragmatic Programmer", "Clean Code", "Harry Potter Set",
                "Lord of the Rings Box", "Star Wars DVD Collection",
                "Pink Floyd Vinyl", "Beethoven Symphony CD"
            ],
            "Automotive": [
                "All-Season Tires (Set of 4)", "Car Phone Holder", "OBD-II Scanner",
                "Roof Rack", "Motor Oil 5L", "LED Headlights", "Car Battery Charger",
                "Dash Cam", "Seat Covers Set", "Floor Mats Rubber",
                "Alloy Wheels", "Car Vacuum Cleaner"
            ],
        }


        conditions = ["new", "like_new", "good", "fair", "poor", "needs_repair"]
        shipping_pool = [["post"], ["pickup"], ["post", "pickup"], ["post", "delivery"], ["delivery"]]
        brands = ["Apple", "Samsung", "Sony", "Ikea", "Bosch", "Adidas", "Nike", "Generic"]

        all_cats = list(cats.values())
        now = timezone.now()

        created_count = 0
        attempts = 0
        # keep trying until n unique (title, seller) combos are created (get_or_create safe)
        while created_count < n and attempts < n * 3:
            attempts += 1
            cat = random.choice(all_cats)
            title = random.choice(titles_by_cat[cat.name])
            seller = random.choice(sellers)

            defaults = dict(
                seller=seller,
                category=cat,
                description="Great condition, works perfectly. See photos.",
                condition=random.choice(conditions),
                brand=random.choice(brands),
                model=f"Model-{random.randint(100,999)}",
                price=Decimal(str(round(random.uniform(10, 1200), 2))),
                original_price=Decimal(str(round(random.uniform(10, 1500), 2))),
                is_negotiable=True,
                location=f"{random.randint(1, 200)} Main St",
                city=seller.city or "Berlin",
                country=seller.country or "Germany",
                # lat/long optional; omit to keep simple & valid
                shipping_options=random.choice(shipping_pool),
                shipping_cost=Decimal(str(round(random.uniform(0, 30), 2))),
                # status will be set to active once verified below
            )

            product, created = Product.objects.get_or_create(
                title=title, seller=seller, defaults=defaults
            )
            if not created:
                continue

            # verify & activate using your model method (sets fields and saves)
            product.verify_product(admin_user=admin, notes="Auto-verified by seed command.")

            # attach 1–3 images via external URLs; first one as main
            for idx, url in enumerate(_rand_image_urls(random.randint(1, 3))):
                ProductImage.objects.create(product=product, image_url=url, is_main=(idx == 0))

            created_count += 1
            self.stdout.write(f"Created product: {product.title} ({product.category.name})")

        if created_count < n:
            self.stdout.write(self.style.WARNING(f"Created {created_count}/{n} (unique title/seller combos exhausted)."))
