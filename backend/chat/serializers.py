from rest_framework import serializers
from .models import Conversation, Message, Notification
from users.serializers import UserProfileSerializer
from products.serializers import ProductListSerializer


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages"""
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    sender_image = serializers.ImageField(source='sender.profile_image', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'sender_name', 'sender_image',
            'content', 'is_read', 'created_at'
        ]
        read_only_fields = ['id', 'sender', 'sender_name', 'sender_image', 'is_read', 'created_at']
    
    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        message = Message.objects.create(**validated_data)
        
        # Mark conversation as updated
        conversation = message.conversation
        conversation.save()  # This will update the updated_at field
        
        return message


class ConversationListSerializer(serializers.ModelSerializer):
    """Serializer for listing conversations"""
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    product = ProductListSerializer(read_only=True)
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'product', 'other_user', 'last_message', 'unread_count',
            'is_active', 'created_at', 'updated_at'
        ]
    
    def get_other_user(self, obj):
        current_user = self.context['request'].user
        other_user = obj.get_other_user(current_user)
        return {
            'id': other_user.id,
            'username': other_user.username,
            'profile_image': other_user.profile_image.url if other_user.profile_image else None,
            'average_rating': float(other_user.average_rating)
        }
    
    def get_last_message(self, obj):
        last_message = obj.messages.last()
        if last_message:
            return {
                'content': last_message.content,
                'sender_name': last_message.sender.username,
                'created_at': last_message.created_at
            }
        return None
    
    def get_unread_count(self, obj):
        current_user = self.context['request'].user
        return obj.get_unread_count(current_user)


class ConversationDetailSerializer(serializers.ModelSerializer):
    """Serializer for conversation details"""
    messages = MessageSerializer(many=True, read_only=True)
    other_user = serializers.SerializerMethodField()
    product = ProductListSerializer(read_only=True)
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'product', 'other_user', 'messages', 'is_active',
            'created_at', 'updated_at'
        ]
    
    def get_other_user(self, obj):
        current_user = self.context['request'].user
        other_user = obj.get_other_user(current_user)
        return UserProfileSerializer(other_user, context=self.context).data


class ConversationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating conversations"""
    
    class Meta:
        model = Conversation
        fields = ['product']
    
    def validate(self, attrs):
        product = attrs['product']
        user = self.context['request'].user
        
        # Check if user is not the seller
        if product.seller == user:
            raise serializers.ValidationError("You cannot start a conversation about your own product")
        
        # Check if conversation already exists
        if Conversation.objects.filter(
            product=product,
            buyer=user,
            seller=product.seller
        ).exists():
            raise serializers.ValidationError("Conversation already exists")
        
        attrs['buyer'] = user
        attrs['seller'] = product.seller
        return attrs


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications"""
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    sender_image = serializers.ImageField(source='sender.profile_image', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message', 'sender_name',
            'sender_image', 'is_read', 'created_at'
        ]
        read_only_fields = ['id', 'notification_type', 'title', 'message', 
                           'sender_name', 'sender_image', 'created_at']


class NotificationListSerializer(serializers.ModelSerializer):
    """Serializer for listing notifications"""
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    sender_image = serializers.ImageField(source='sender.profile_image', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message', 'sender_name',
            'sender_image', 'is_read', 'created_at'
        ]
        ordering = ['-created_at']


class UnreadCountSerializer(serializers.Serializer):
    """Serializer for unread counts"""
    unread_messages = serializers.IntegerField()
    unread_notifications = serializers.IntegerField() 