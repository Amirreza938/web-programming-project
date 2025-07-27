from django.db import models
from users.models import User
from products.models import Product, Offer


class Order(models.Model):
    """Order model for completed purchases"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    # Order details
    order_number = models.CharField(max_length=20, unique=True)
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sales')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='orders')
    accepted_offer = models.ForeignKey(Offer, on_delete=models.SET_NULL, blank=True, null=True)
    
    # Pricing
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Shipping information
    shipping_address = models.TextField()
    shipping_city = models.CharField(max_length=100)
    shipping_country = models.CharField(max_length=100)
    shipping_postal_code = models.CharField(max_length=20)
    shipping_phone = models.CharField(max_length=15)
    
    # Shipping method
    shipping_method = models.CharField(max_length=50)  # 'post', 'pickup', 'delivery'
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    
    # Order status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    shipped_at = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order {self.order_number} - {self.product.title}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate unique order number
            import random
            import string
            while True:
                order_number = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
                if not Order.objects.filter(order_number=order_number).exists():
                    self.order_number = order_number
                    break
        super().save(*args, **kwargs)
    
    def mark_as_shipped(self, tracking_number=None):
        from django.utils import timezone
        self.status = 'shipped'
        self.shipped_at = timezone.now()
        if tracking_number:
            self.tracking_number = tracking_number
        self.save()
    
    def mark_as_delivered(self):
        from django.utils import timezone
        self.status = 'delivered'
        self.delivered_at = timezone.now()
        self.save()
    
    def cancel_order(self):
        self.status = 'cancelled'
        self.save()


class OrderStatus(models.Model):
    """Order status history"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20, choices=Order.STATUS_CHOICES)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'order_status_history'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.order.order_number} - {self.status}"


class ShippingMethod(models.Model):
    """Available shipping methods"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    base_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    estimated_days = models.PositiveIntegerField(help_text="Estimated delivery time in days")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'shipping_methods'
    
    def __str__(self):
        return f"{self.name} - {self.estimated_days} days"


class Dispute(models.Model):
    """Dispute resolution system"""
    DISPUTE_TYPES = [
        ('item_not_received', 'Item Not Received'),
        ('item_not_as_described', 'Item Not As Described'),
        ('damaged_item', 'Damaged Item'),
        ('wrong_item', 'Wrong Item'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('under_review', 'Under Review'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='disputes')
    complainant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='disputes_filed')
    dispute_type = models.CharField(max_length=30, choices=DISPUTE_TYPES)
    description = models.TextField()
    evidence = models.FileField(upload_to='dispute_evidence/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    resolution = models.TextField(blank=True, null=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='disputes_resolved')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'disputes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Dispute for Order {self.order.order_number} - {self.get_dispute_type_display()}"
    
    def resolve(self, resolution, resolved_by):
        from django.utils import timezone
        self.status = 'resolved'
        self.resolution = resolution
        self.resolved_by = resolved_by
        self.resolved_at = timezone.now()
        self.save()


class DisputeMessage(models.Model):
    """Messages in dispute resolution"""
    dispute = models.ForeignKey(Dispute, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dispute_messages')
    message = models.TextField()
    is_admin_message = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'dispute_messages'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message in dispute {self.dispute.id} from {self.sender.username}"
