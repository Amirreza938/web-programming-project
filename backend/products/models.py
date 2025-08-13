from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User


class Category(models.Model):
    """Product categories"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name='children')
    image = models.ImageField(upload_to='category_images/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        db_table = 'categories'
    
    def __str__(self):
        return self.name
    
    def get_products_count(self):
        return self.products.filter(is_active=True, status='active').count()


class Product(models.Model):
    """Product model for marketplace items"""
    CONDITION_CHOICES = [
        ('new', 'New'),
        ('like_new', 'Like New'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
        ('needs_repair', 'Needs Repair'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('sold', 'Sold'),
        ('expired', 'Expired'),
        ('inactive', 'Inactive'),
    ]
    
    # Basic product information
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    title = models.CharField(max_length=200)
    description = models.TextField()
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    brand = models.CharField(max_length=100, blank=True, null=True)
    model = models.CharField(max_length=100, blank=True, null=True)
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    is_negotiable = models.BooleanField(default=True)
    
    # Location and shipping
    location = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    
    # Shipping options
    shipping_options = models.JSONField(default=list)  # ['post', 'pickup', 'delivery']
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Product status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    # Statistics
    views_count = models.PositiveIntegerField(default=0)
    favorites_count = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    
    # Ratings
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_ratings = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} by {self.seller.username}"
    
    def increment_views(self):
        self.views_count += 1
        self.save(update_fields=['views_count'])
    
    def get_main_image(self):
        """Get the main product image"""
        return self.images.filter(is_main=True).first() or self.images.first()
    
    def get_all_images(self):
        """Get all product images"""
        return self.images.all().order_by('-is_main', 'created_at')
    
    def is_available(self):
        return self.status == 'active' and self.is_active
    
    def update_rating(self):
        """Update product average rating based on all ratings"""
        from django.db.models import Avg
        ratings = self.ratings.all()
        if ratings.exists():
            avg_rating = ratings.aggregate(Avg('rating'))['rating__avg']
            self.average_rating = round(avg_rating, 1) if avg_rating else 0
            self.total_ratings = ratings.count()
        else:
            self.average_rating = 0
            self.total_ratings = 0
        self.save(update_fields=['average_rating', 'total_ratings'])


class ProductImage(models.Model):
    """Product images"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='product_images/', blank=True, null=True)
    image_url = models.URLField(blank=True, null=True, help_text="External image URL")
    is_main = models.BooleanField(default=False)
    alt_text = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'product_images'
    
    def __str__(self):
        return f"Image for {self.product.title}"
    
    def save(self, *args, **kwargs):
        # Ensure only one main image per product
        if self.is_main:
            ProductImage.objects.filter(product=self.product, is_main=True).update(is_main=False)
        super().save(*args, **kwargs)
    
    @property
    def image_url_or_file(self):
        """Return image URL if external, otherwise return file URL"""
        if self.image_url:
            return self.image_url
        elif self.image:
            return self.image.url
        return None


class Offer(models.Model):
    """Buyer offers for products"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='offers')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='offers_made')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'offers'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"${self.amount} offer by {self.buyer.username} for {self.product.title}"
    
    def accept(self):
        self.status = 'accepted'
        self.save()
        # Do NOT update product status to sold here
        # Product will be marked as sold only when order is approved by seller
    
    def reject(self):
        self.status = 'rejected'
        self.save()


class Favorite(models.Model):
    """User favorites/wishlist"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'product')
        db_table = 'favorites'
    
    def __str__(self):
        return f"{self.user.username} favorited {self.product.title}"
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            # Update product favorites count
            self.product.favorites_count += 1
            self.product.save(update_fields=['favorites_count'])
    
    def delete(self, *args, **kwargs):
        # Update product favorites count
        self.product.favorites_count = max(0, self.product.favorites_count - 1)
        self.product.save(update_fields=['favorites_count'])
        super().delete(*args, **kwargs)


class ProductRating(models.Model):
    """Product ratings and reviews"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='product_ratings')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='ratings')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'product')
        db_table = 'product_ratings'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} rated {self.product.title} - {self.rating} stars"
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            # Update product average rating
            self.product.update_rating()
    
    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
        # Update product average rating
        self.product.update_rating()
