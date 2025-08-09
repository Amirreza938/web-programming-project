from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Conversation, Message, Notification, DirectConversation, DirectMessage
from .serializers import (
    ConversationListSerializer, ConversationDetailSerializer, ConversationCreateSerializer,
    MessageSerializer, NotificationListSerializer, UnreadCountSerializer,
    DirectConversationListSerializer, DirectMessageSerializer
)


class ConversationListView(generics.ListAPIView):
    """List user's conversations"""
    serializer_class = ConversationListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(
            Q(buyer=user) | Q(seller=user),
            is_active=True
        ).order_by('-updated_at')


class DirectConversationListView(generics.ListAPIView):
    """List user's direct conversations"""
    serializer_class = DirectConversationListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return DirectConversation.objects.filter(
            Q(participant1=user) | Q(participant2=user),
            is_active=True
        ).order_by('-updated_at')


class ConversationDetailView(generics.RetrieveAPIView):
    """Get conversation details with messages"""
    serializer_class = ConversationDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(
            Q(buyer=user) | Q(seller=user)
        )
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Mark messages as read
        instance.mark_as_read(request.user)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class ConversationCreateView(generics.CreateAPIView):
    """Create a new conversation"""
    serializer_class = ConversationCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        conversation = serializer.save()
        # Create initial message if provided
        initial_message = self.request.data.get('initial_message')
        if initial_message:
            Message.objects.create(
                conversation=conversation,
                sender=self.request.user,
                content=initial_message
            )


class MessageCreateView(generics.CreateAPIView):
    """Send a message in a conversation"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        conversation = serializer.validated_data['conversation']
        # Check if user is part of the conversation
        if conversation.buyer != self.request.user and conversation.seller != self.request.user:
            raise PermissionError("You are not part of this conversation")
        
        message = serializer.save(sender=self.request.user)
        
        # Create notification for the other user
        other_user = conversation.get_other_user(self.request.user)
        Notification.objects.create(
            recipient=other_user,
            sender=self.request.user,
            notification_type='message',
            title=f'New message from {self.request.user.username}',
            message=f'You have a new message about "{conversation.product.title}"',
            related_conversation=conversation,
            related_product=conversation.product
        )


class MessageListView(generics.ListAPIView):
    """List messages in a conversation"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        conversation_id = self.kwargs.get('conversation_id')
        conversation = get_object_or_404(Conversation, id=conversation_id)
        
        # Check if user is part of the conversation
        if conversation.buyer != self.request.user and conversation.seller != self.request.user:
            return Message.objects.none()
        
        return Message.objects.filter(conversation=conversation).order_by('created_at')


class NotificationListView(generics.ListAPIView):
    """List user's notifications"""
    serializer_class = NotificationListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Notification.objects.filter(
            recipient=self.request.user
        ).order_by('-created_at')
        
        # Add debug logging
        print(f"Fetching notifications for user: {self.request.user.username}")
        print(f"Total notifications: {queryset.count()}")
        for notif in queryset[:5]:
            print(f"  - {notif.id}: {notif.notification_type} - {notif.title}")
        
        return queryset


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Mark a notification as read"""
    try:
        notification = Notification.objects.get(
            id=notification_id,
            recipient=request.user
        )
        notification.mark_as_read()
        return Response({'message': 'Notification marked as read'})
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all notifications as read"""
    Notification.objects.filter(
        recipient=request.user,
        is_read=False
    ).update(is_read=True)
    
    return Response({'message': 'All notifications marked as read'})


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_notification(request, notification_id):
    """Delete a notification"""
    try:
        notification = Notification.objects.get(
            id=notification_id,
            recipient=request.user
        )
        notification.delete()
        return Response({'message': 'Notification deleted successfully'})
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_counts(request):
    """Get unread message and notification counts"""
    user = request.user
    
    # Count unread messages
    unread_messages = Message.objects.filter(
        Q(conversation__buyer=user) | Q(conversation__seller=user),
        sender__ne=user,
        is_read=False
    ).count()
    
    # Count unread notifications
    unread_notifications = Notification.objects.filter(
        recipient=user,
        is_read=False
    ).count()
    
    data = {
        'unread_messages': unread_messages,
        'unread_notifications': unread_notifications
    }
    
    serializer = UnreadCountSerializer(data)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_conversation(request, product_id):
    """Start a conversation about a product"""
    from products.models import Product
    
    product = get_object_or_404(Product, id=product_id)
    
    # Check if user is not the seller
    if product.seller == request.user:
        return Response(
            {'error': 'You cannot start a conversation about your own product'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if conversation already exists
    existing_conversation = Conversation.objects.filter(
        product=product,
        buyer=request.user,
        seller=product.seller
    ).first()
    
    if existing_conversation:
        return Response({
            'message': 'Conversation already exists',
            'conversation_id': existing_conversation.id
        })
    
    # Create new conversation
    conversation = Conversation.objects.create(
        product=product,
        buyer=request.user,
        seller=product.seller
    )
    
    # Create initial message if provided
    initial_message = request.data.get('message')
    if initial_message:
        Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=initial_message
        )
    
    # Create notification for seller
    Notification.objects.create(
        recipient=product.seller,
        sender=request.user,
        notification_type='message',
        title=f'New conversation about {product.title}',
        message=f'{request.user.username} started a conversation about your product',
        related_conversation=conversation,
        related_product=product
    )
    
    return Response({
        'message': 'Conversation started successfully',
        'conversation_id': conversation.id
    }, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_conversation(request, conversation_id):
    """Delete a conversation"""
    conversation = get_object_or_404(Conversation, id=conversation_id)
    
    # Check if user is part of the conversation
    if conversation.buyer != request.user and conversation.seller != request.user:
        return Response(
            {'error': 'You are not part of this conversation'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    conversation.is_active = False
    conversation.save()
    
    return Response({'message': 'Conversation deleted successfully'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def conversation_exists(request, product_id):
    """Check if conversation exists for a product"""
    from products.models import Product
    
    product = get_object_or_404(Product, id=product_id)
    
    conversation = Conversation.objects.filter(
        product=product,
        buyer=request.user,
        seller=product.seller,
        is_active=True
    ).first()
    
    if conversation:
        return Response({
            'exists': True,
            'conversation_id': conversation.id
        })
    
    return Response({'exists': False})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_direct_conversation(request, user_id):
    """Start a direct conversation with another user"""
    from users.models import User
    
    other_user = get_object_or_404(User, id=user_id)
    
    if other_user == request.user:
        return Response(
            {'error': 'You cannot start a conversation with yourself'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get or create conversation
    conversation, created = DirectConversation.get_or_create_conversation(
        request.user, other_user
    )
    
    # Create initial message if provided
    initial_message = request.data.get('message')
    if initial_message:
        DirectMessage.objects.create(
            conversation=conversation,
            sender=request.user,
            content=initial_message
        )
        
        # Create notification for the other user
        Notification.objects.create(
            recipient=other_user,
            sender=request.user,
            notification_type='message',
            title=f'New message from {request.user.username}',
            message=f'{request.user.username} sent you a message',
            related_direct_conversation=conversation
        )
    
    return Response({
        'message': 'Conversation started successfully' if created else 'Conversation already exists',
        'conversation_id': conversation.id,
        'created': created
    }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class DirectMessageCreateView(generics.CreateAPIView):
    """Send a direct message"""
    serializer_class = DirectMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        conversation = serializer.validated_data['conversation']
        # Check if user is part of the conversation
        if conversation.participant1 != self.request.user and conversation.participant2 != self.request.user:
            raise PermissionError("You are not part of this conversation")
        
        message = serializer.save(sender=self.request.user)
        
        # Create notification for the other user
        other_user = conversation.get_other_user(self.request.user)
        Notification.objects.create(
            recipient=other_user,
            sender=self.request.user,
            notification_type='message',
            title=f'New message from {self.request.user.username}',
            message=f'You have a new message from {self.request.user.username}',
            related_direct_conversation=conversation
        )


class DirectMessageListView(generics.ListAPIView):
    """List messages in a direct conversation"""
    serializer_class = DirectMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        conversation_id = self.kwargs.get('conversation_id')
        conversation = get_object_or_404(DirectConversation, id=conversation_id)
        
        # Check if user is part of the conversation
        if conversation.participant1 != self.request.user and conversation.participant2 != self.request.user:
            return DirectMessage.objects.none()
        
        # Mark messages as read
        conversation.mark_as_read(self.request.user)
        
        return conversation.direct_messages.all()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def debug_notifications(request):
    """Debug endpoint to check notifications"""
    from chat.models import Notification
    
    notifications = Notification.objects.filter(recipient=request.user).order_by('-created_at')
    
    debug_info = {
        'user': request.user.username,
        'total_notifications': notifications.count(),
        'notification_types': list(notifications.values_list('notification_type', flat=True).distinct()),
        'recent_notifications': []
    }
    
    for notif in notifications[:5]:
        debug_info['recent_notifications'].append({
            'id': notif.id,
            'type': notif.notification_type,
            'title': notif.title,
            'sender': notif.sender.username if notif.sender else None,
            'is_read': notif.is_read,
            'created_at': notif.created_at.isoformat()
        })
    
    return Response(debug_info)
