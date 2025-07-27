from django.contrib import admin
from .models import Conversation, Message, Notification


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = [
        'product', 'buyer', 'seller', 'is_active', 'created_at', 'updated_at'
    ]
    list_filter = ['is_active', 'created_at', 'updated_at']
    search_fields = [
        'product__title', 'buyer__username', 'seller__username'
    ]
    ordering = ['-updated_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Conversation Details', {
            'fields': ('product', 'buyer', 'seller', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activate_conversations', 'deactivate_conversations']
    
    def activate_conversations(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} conversations have been activated.')
    activate_conversations.short_description = "Activate selected conversations"
    
    def deactivate_conversations(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} conversations have been deactivated.')
    deactivate_conversations.short_description = "Deactivate selected conversations"


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = [
        'conversation', 'sender', 'content_preview', 'is_read', 'created_at'
    ]
    list_filter = ['is_read', 'created_at']
    search_fields = [
        'conversation__product__title', 'sender__username', 'content'
    ]
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Message Details', {
            'fields': ('conversation', 'sender', 'content', 'is_read')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'
    
    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f'{updated} messages have been marked as read.')
    mark_as_read.short_description = "Mark selected messages as read"
    
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False)
        self.message_user(request, f'{updated} messages have been marked as unread.')
    mark_as_unread.short_description = "Mark selected messages as unread"


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'recipient', 'notification_type', 'title', 'is_read', 'created_at'
    ]
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = [
        'recipient__username', 'sender__username', 'title', 'message'
    ]
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Notification Details', {
            'fields': (
                'recipient', 'sender', 'notification_type', 'title', 'message'
            )
        }),
        ('Related Objects', {
            'fields': ('related_product', 'related_conversation'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_read',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f'{updated} notifications have been marked as read.')
    mark_as_read.short_description = "Mark selected notifications as read"
    
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False)
        self.message_user(request, f'{updated} notifications have been marked as unread.')
    mark_as_unread.short_description = "Mark selected notifications as unread"
