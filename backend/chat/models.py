from django.db import models
from django.db.models import Q
from users.models import User
from products.models import Product


class Conversation(models.Model):
    """Conversation between two users about a product"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='conversations')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='buyer_conversations')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='seller_conversations')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('product', 'buyer', 'seller')
        db_table = 'conversations'
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Chat between {self.buyer.username} and {self.seller.username} about {self.product.title}"
    
    def get_other_user(self, current_user):
        """Get the other user in the conversation"""
        if current_user == self.buyer:
            return self.seller
        return self.buyer
    
    def get_unread_count(self, user):
        """Get unread message count for a user"""
        return self.messages.filter(
            ~Q(sender=user),
            is_read=False
        ).count()
    
    def mark_as_read(self, user):
        """Mark all messages as read for a user"""
        self.messages.filter(
            ~Q(sender=user),
            is_read=False
        ).update(is_read=True)
        
        # Also mark related notifications as read
        Notification.objects.filter(
            recipient=user,
            related_conversation=self,
            is_read=False
        ).update(is_read=True)


class Message(models.Model):
    """Individual messages in conversations"""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'messages'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message from {self.sender.username} in {self.conversation}"
    
    def mark_as_read(self):
        self.is_read = True
        self.save(update_fields=['is_read'])


class DirectMessage(models.Model):
    """Individual messages in direct conversations"""
    conversation = models.ForeignKey('DirectConversation', on_delete=models.CASCADE, related_name='direct_messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_direct_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'direct_messages'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Direct message from {self.sender.username}"
    
    def mark_as_read(self):
        self.is_read = True
        self.save(update_fields=['is_read'])


class Notification(models.Model):
    """User notifications"""
    NOTIFICATION_TYPES = [
        ('message', 'New Message'),
        ('offer', 'New Offer'),
        ('offer_accepted', 'Offer Accepted'),
        ('offer_rejected', 'Offer Rejected'),
        ('product_sold', 'Product Sold'),
        ('rating', 'New Rating'),
        ('verification', 'Verification Update'),
    ]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications', blank=True, null=True)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    related_product = models.ForeignKey(Product, on_delete=models.CASCADE, blank=True, null=True)
    related_conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.notification_type} notification for {self.recipient.username}"
    
    def mark_as_read(self):
        self.is_read = True
        self.save(update_fields=['is_read'])


class DirectConversation(models.Model):
    """Direct conversation between two users (not tied to a specific product)"""
    participant1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations_as_participant1')
    participant2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations_as_participant2')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'direct_conversations'
        ordering = ['-updated_at']
        constraints = [
            models.CheckConstraint(
                check=~Q(participant1=models.F('participant2')),
                name='different_participants'
            )
        ]
    
    def __str__(self):
        return f"Direct chat between {self.participant1.username} and {self.participant2.username}"
    
    def get_other_user(self, current_user):
        """Get the other user in the conversation"""
        if current_user == self.participant1:
            return self.participant2
        return self.participant1
    
    def get_unread_count(self, user):
        """Get unread message count for a user"""
        return self.direct_messages.filter(
            ~Q(sender=user),
            is_read=False
        ).count()
    
    def mark_as_read(self, user):
        """Mark all messages as read for a user"""
        self.direct_messages.filter(
            ~Q(sender=user),
            is_read=False
        ).update(is_read=True)
        
        # Also mark related notifications as read
        Notification.objects.filter(
            recipient=user,
            related_direct_conversation=self,
            is_read=False
        ).update(is_read=True)
    
    @classmethod
    def get_or_create_conversation(cls, user1, user2):
        """Get existing conversation or create new one between two users"""
        # Ensure consistent ordering to avoid duplicates
        if user1.id > user2.id:
            user1, user2 = user2, user1
        
        conversation, created = cls.objects.get_or_create(
            participant1=user1,
            participant2=user2,
            defaults={'is_active': True}
        )
        return conversation, created
