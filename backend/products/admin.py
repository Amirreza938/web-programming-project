from django.contrib import admin
from .models import Category, Product, ProductImage, Offer, Favorite


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'parent', 'image')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'is_main', 'alt_text']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'seller', 'category', 'price', 'condition', 'status',
        'is_active', 'views_count', 'favorites_count', 'created_at'
    ]
    list_filter = [
        'status', 'condition', 'is_active', 'is_featured', 'is_negotiable',
        'category', 'created_at'
    ]
    search_fields = ['title', 'description', 'brand', 'model', 'seller__username']
    ordering = ['-created_at']
    readonly_fields = ['views_count', 'favorites_count', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('seller', 'category', 'title', 'description')
        }),
        ('Product Details', {
            'fields': ('condition', 'brand', 'model')
        }),
        ('Pricing', {
            'fields': ('price', 'original_price', 'is_negotiable')
        }),
        ('Location & Shipping', {
            'fields': (
                'location', 'city', 'country', 'latitude', 'longitude',
                'shipping_options', 'shipping_cost'
            )
        }),
        ('Status', {
            'fields': ('status', 'is_active', 'is_featured')
        }),
        ('Statistics', {
            'fields': ('views_count', 'favorites_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'expires_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [ProductImageInline]
    
    actions = ['activate_products', 'deactivate_products', 'mark_as_featured', 'unmark_as_featured']
    
    def activate_products(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} products have been activated.')
    activate_products.short_description = "Activate selected products"
    
    def deactivate_products(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} products have been deactivated.')
    deactivate_products.short_description = "Deactivate selected products"
    
    def mark_as_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} products have been marked as featured.')
    mark_as_featured.short_description = "Mark selected products as featured"
    
    def unmark_as_featured(self, request, queryset):
        updated = queryset.update(is_featured=False)
        self.message_user(request, f'{updated} products have been unmarked as featured.')
    unmark_as_featured.short_description = "Unmark selected products as featured"


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'is_main', 'created_at']
    list_filter = ['is_main', 'created_at']
    search_fields = ['product__title', 'alt_text']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Image Details', {
            'fields': ('product', 'image', 'is_main', 'alt_text')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['created_at']


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = [
        'product', 'buyer', 'amount', 'status', 'created_at'
    ]
    list_filter = ['status', 'created_at']
    search_fields = [
        'product__title', 'buyer__username', 'message'
    ]
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Offer Details', {
            'fields': ('product', 'buyer', 'amount', 'message')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'expires_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['accept_offers', 'reject_offers']
    
    def accept_offers(self, request, queryset):
        updated = 0
        for offer in queryset.filter(status='pending'):
            offer.accept()
            updated += 1
        self.message_user(request, f'{updated} offers have been accepted.')
    accept_offers.short_description = "Accept selected offers"
    
    def reject_offers(self, request, queryset):
        updated = 0
        for offer in queryset.filter(status='pending'):
            offer.reject()
            updated += 1
        self.message_user(request, f'{updated} offers have been rejected.')
    reject_offers.short_description = "Reject selected offers"


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'product__title']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Favorite Details', {
            'fields': ('user', 'product')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
