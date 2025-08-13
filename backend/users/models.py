from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('admin', 'Admin'),
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
        ('both', 'Buyer & Seller'),
    ]
    
    VERIFICATION_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
        ('not_required', 'Not Required'),
    ]
    
    # Basic profile fields
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='buyer')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    
    # Seller verification
    verification_status = models.CharField(
        max_length=15, 
        choices=VERIFICATION_STATUS_CHOICES, 
        default='not_required'
    )
    id_card_image = models.ImageField(upload_to='id_cards/', blank=True, null=True)
    verification_documents = models.FileField(upload_to='verification_docs/', blank=True, null=True)
    verification_date = models.DateTimeField(blank=True, null=True)
    verification_notes = models.TextField(blank=True, null=True)
    
    # Account approval (for sellers)
    account_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='approved_users'
    )
    approval_date = models.DateTimeField(blank=True, null=True)
    
    # Profile image
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    
    # Rating and reputation
    average_rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    total_ratings = models.PositiveIntegerField(default=0)
    
    # Account status
    is_active_seller = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    def is_verified_seller(self):
        return self.verification_status == 'verified' and self.account_approved
    
    def can_buy(self):
        """Check if user can make purchases"""
        if self.user_type == 'admin':
            return False
        if self.user_type in ['buyer', 'both']:
            return self.account_approved if self.user_type == 'both' else True
        return False
    
    def can_sell(self):
        """Check if user can create listings"""
        if self.user_type == 'admin':
            return False
        if self.user_type in ['seller', 'both']:
            return self.account_approved and self.verification_status == 'verified'
        return False
    
    def is_admin_user(self):
        """Check if user is the admin"""
        return self.user_type == 'admin' and self.username == 'Amirreza938938'
    
    def needs_verification(self):
        """Check if user needs ID card verification"""
        return self.user_type in ['seller', 'both']
    
    def save(self, *args, **kwargs):
        # Set verification status based on user type
        if self.user_type == 'buyer':
            self.verification_status = 'not_required'
            self.account_approved = True
        elif self.user_type in ['seller', 'both'] and self.verification_status == 'not_required':
            self.verification_status = 'pending'
            self.account_approved = False
        elif self.user_type == 'admin':
            self.verification_status = 'not_required'
            self.account_approved = True
            self.is_staff = True
            self.is_superuser = True
        
        super().save(*args, **kwargs)
    
    def update_average_rating(self):
        """Update average rating based on all received ratings"""
        from django.db.models import Avg
        ratings = self.ratings_received.all()
        if ratings.exists():
            avg_rating = ratings.aggregate(Avg('rating'))['rating__avg']
            self.average_rating = round(avg_rating, 1) if avg_rating else 0
            self.total_ratings = ratings.count()
        else:
            self.average_rating = 0
            self.total_ratings = 0
        self.save(update_fields=['average_rating', 'total_ratings'])


class UserRating(models.Model):
    """Model for user ratings and reviews"""
    from_user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='ratings_given'
    )
    to_user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='ratings_received'
    )
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='ratings'
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('from_user', 'to_user', 'order')
        db_table = 'user_ratings'
    
    def __str__(self):
        return f"{self.from_user.username} rated {self.to_user.username}: {self.rating}/5"
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            # Update the recipient's average rating
            self.to_user.update_average_rating()
    
    def delete(self, *args, **kwargs):
        to_user = self.to_user
        super().delete(*args, **kwargs)
        # Update the recipient's average rating after deletion
        to_user.update_average_rating()


class VerificationRequest(models.Model):
    """Model for tracking user verification requests"""
    REQUEST_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='verification_request'
    )
    id_card_front = models.ImageField(upload_to='verification/id_cards/front/')
    id_card_back = models.ImageField(upload_to='verification/id_cards/back/')
    additional_documents = models.FileField(
        upload_to='verification/additional/',
        blank=True,
        null=True
    )
    notes = models.TextField(blank=True, help_text="Additional notes from user")
    
    # Admin response
    status = models.CharField(
        max_length=10,
        choices=REQUEST_STATUS_CHOICES,
        default='pending'
    )
    admin_notes = models.TextField(blank=True, help_text="Admin feedback")
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_requests'
    )
    reviewed_at = models.DateTimeField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'verification_requests'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Verification request for {self.user.username} - {self.status}"
