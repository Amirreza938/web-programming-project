from django.urls import path
from . import views

urlpatterns = [
    # Conversations
    path('conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('conversations/create/', views.ConversationCreateView.as_view(), name='conversation-create'),
    path('conversations/<int:pk>/', views.ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:conversation_id>/delete/', views.delete_conversation, name='delete-conversation'),
    
    # Messages
    path('messages/create/', views.MessageCreateView.as_view(), name='message-create'),
    path('conversations/<int:conversation_id>/messages/', views.MessageListView.as_view(), name='conversation-messages'),
    
    # Notifications
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:notification_id>/read/', views.mark_notification_read, name='mark-notification-read'),
    path('notifications/read-all/', views.mark_all_notifications_read, name='mark-all-notifications-read'),
    
    # Utility endpoints
    path('unread-counts/', views.unread_counts, name='unread-counts'),
    path('start-conversation/<int:product_id>/', views.start_conversation, name='start-conversation'),
    path('conversation-exists/<int:product_id>/', views.conversation_exists, name='conversation-exists'),
] 