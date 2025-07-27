from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserRating


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        'username', 'email', 'first_name', 'last_name', 'user_type',
        'verification_status', 'is_active_seller', 'average_rating',
        'total_ratings', 'is_active', 'date_joined'
    ]
    list_filter = [
        'user_type', 'verification_status', 'is_active_seller',
        'is_premium', 'is_active', 'date_joined'
    ]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Marketplace Profile', {
            'fields': (
                'user_type', 'phone_number', 'address', 'city', 'country',
                'postal_code', 'profile_image'
            )
        }),
        ('Seller Verification', {
            'fields': (
                'verification_status', 'verification_documents', 'verification_date',
                'is_active_seller'
            )
        }),
        ('Reputation', {
            'fields': ('average_rating', 'total_ratings', 'is_premium')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Marketplace Profile', {
            'fields': (
                'user_type', 'phone_number', 'address', 'city', 'country',
                'postal_code'
            )
        }),
    )
    
    readonly_fields = ['average_rating', 'total_ratings', 'verification_date']
    
    actions = ['verify_sellers', 'unverify_sellers', 'activate_sellers', 'deactivate_sellers']
    
    def verify_sellers(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(
            verification_status='verified',
            verification_date=timezone.now(),
            is_active_seller=True
        )
        self.message_user(request, f'{updated} sellers have been verified.')
    verify_sellers.short_description = "Verify selected sellers"
    
    def unverify_sellers(self, request, queryset):
        updated = queryset.update(
            verification_status='rejected',
            is_active_seller=False
        )
        self.message_user(request, f'{updated} sellers have been unverified.')
    unverify_sellers.short_description = "Unverify selected sellers"
    
    def activate_sellers(self, request, queryset):
        updated = queryset.update(is_active_seller=True)
        self.message_user(request, f'{updated} sellers have been activated.')
    activate_sellers.short_description = "Activate selected sellers"
    
    def deactivate_sellers(self, request, queryset):
        updated = queryset.update(is_active_seller=False)
        self.message_user(request, f'{updated} sellers have been deactivated.')
    deactivate_sellers.short_description = "Deactivate selected sellers"


@admin.register(UserRating)
class UserRatingAdmin(admin.ModelAdmin):
    list_display = [
        'from_user', 'to_user', 'rating', 'created_at'
    ]
    list_filter = ['rating', 'created_at']
    search_fields = ['from_user__username', 'to_user__username', 'review']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Rating Details', {
            'fields': ('from_user', 'to_user', 'rating', 'review')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
