from django.contrib import admin
from .models import Order, OrderStatus, ShippingMethod, Dispute, DisputeMessage


class OrderStatusInline(admin.TabularInline):
    model = OrderStatus
    extra = 0
    readonly_fields = ['created_at']
    fields = ['status', 'notes', 'created_at']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number', 'product', 'buyer', 'seller', 'total_amount',
        'status', 'payment_status', 'created_at'
    ]
    list_filter = [
        'status', 'payment_status', 'shipping_method', 'created_at'
    ]
    search_fields = [
        'order_number', 'product__title', 'buyer__username', 'seller__username'
    ]
    ordering = ['-created_at']
    readonly_fields = [
        'order_number', 'created_at', 'updated_at', 'shipped_at', 'delivered_at'
    ]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'product', 'accepted_offer')
        }),
        ('Users', {
            'fields': ('buyer', 'seller')
        }),
        ('Pricing', {
            'fields': ('unit_price', 'shipping_cost', 'total_amount')
        }),
        ('Shipping Information', {
            'fields': (
                'shipping_address', 'shipping_city', 'shipping_country',
                'shipping_postal_code', 'shipping_phone', 'shipping_method',
                'tracking_number'
            )
        }),
        ('Status', {
            'fields': ('status', 'payment_status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'shipped_at', 'delivered_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [OrderStatusInline]
    
    actions = [
        'mark_as_pending', 'mark_as_confirmed', 'mark_as_processing',
        'mark_as_shipped', 'mark_as_delivered', 'mark_as_cancelled'
    ]
    
    def mark_as_pending(self, request, queryset):
        updated = queryset.update(status='pending')
        self.message_user(request, f'{updated} orders have been marked as pending.')
    mark_as_pending.short_description = "Mark selected orders as pending"
    
    def mark_as_confirmed(self, request, queryset):
        updated = queryset.update(status='confirmed')
        self.message_user(request, f'{updated} orders have been marked as confirmed.')
    mark_as_confirmed.short_description = "Mark selected orders as confirmed"
    
    def mark_as_processing(self, request, queryset):
        updated = queryset.update(status='processing')
        self.message_user(request, f'{updated} orders have been marked as processing.')
    mark_as_processing.short_description = "Mark selected orders as processing"
    
    def mark_as_shipped(self, request, queryset):
        updated = queryset.update(status='shipped')
        self.message_user(request, f'{updated} orders have been marked as shipped.')
    mark_as_shipped.short_description = "Mark selected orders as shipped"
    
    def mark_as_delivered(self, request, queryset):
        updated = queryset.update(status='delivered')
        self.message_user(request, f'{updated} orders have been marked as delivered.')
    mark_as_delivered.short_description = "Mark selected orders as delivered"
    
    def mark_as_cancelled(self, request, queryset):
        updated = queryset.update(status='cancelled')
        self.message_user(request, f'{updated} orders have been marked as cancelled.')
    mark_as_cancelled.short_description = "Mark selected orders as cancelled"


@admin.register(OrderStatus)
class OrderStatusAdmin(admin.ModelAdmin):
    list_display = ['order', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order__order_number', 'notes']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Status Details', {
            'fields': ('order', 'status', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(ShippingMethod)
class ShippingMethodAdmin(admin.ModelAdmin):
    list_display = ['name', 'base_cost', 'estimated_days', 'is_active']
    list_filter = ['is_active', 'estimated_days']
    search_fields = ['name', 'description']
    ordering = ['name']
    
    fieldsets = (
        ('Shipping Method Details', {
            'fields': ('name', 'description', 'base_cost', 'estimated_days', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['created_at']


class DisputeMessageInline(admin.TabularInline):
    model = DisputeMessage
    extra = 0
    readonly_fields = ['created_at']
    fields = ['sender', 'message', 'is_admin_message', 'created_at']


@admin.register(Dispute)
class DisputeAdmin(admin.ModelAdmin):
    list_display = [
        'order', 'complainant', 'dispute_type', 'status', 'created_at'
    ]
    list_filter = ['dispute_type', 'status', 'created_at']
    search_fields = [
        'order__order_number', 'complainant__username', 'description'
    ]
    ordering = ['-created_at']
    readonly_fields = [
        'created_at', 'updated_at', 'resolved_at', 'resolved_by'
    ]
    
    fieldsets = (
        ('Dispute Information', {
            'fields': ('order', 'complainant', 'dispute_type', 'description', 'evidence')
        }),
        ('Resolution', {
            'fields': ('status', 'resolution', 'resolved_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'resolved_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [DisputeMessageInline]
    
    actions = [
        'mark_as_open', 'mark_as_under_review', 'mark_as_resolved', 'mark_as_closed'
    ]
    
    def mark_as_open(self, request, queryset):
        updated = queryset.update(status='open')
        self.message_user(request, f'{updated} disputes have been marked as open.')
    mark_as_open.short_description = "Mark selected disputes as open"
    
    def mark_as_under_review(self, request, queryset):
        updated = queryset.update(status='under_review')
        self.message_user(request, f'{updated} disputes have been marked as under review.')
    mark_as_under_review.short_description = "Mark selected disputes as under review"
    
    def mark_as_resolved(self, request, queryset):
        updated = queryset.update(status='resolved')
        self.message_user(request, f'{updated} disputes have been marked as resolved.')
    mark_as_resolved.short_description = "Mark selected disputes as resolved"
    
    def mark_as_closed(self, request, queryset):
        updated = queryset.update(status='closed')
        self.message_user(request, f'{updated} disputes have been marked as closed.')
    mark_as_closed.short_description = "Mark selected disputes as closed"


@admin.register(DisputeMessage)
class DisputeMessageAdmin(admin.ModelAdmin):
    list_display = [
        'dispute', 'sender', 'message_preview', 'is_admin_message', 'created_at'
    ]
    list_filter = ['is_admin_message', 'created_at']
    search_fields = [
        'dispute__order__order_number', 'sender__username', 'message'
    ]
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Message Details', {
            'fields': ('dispute', 'sender', 'message', 'is_admin_message')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def message_preview(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    message_preview.short_description = 'Message Preview'
