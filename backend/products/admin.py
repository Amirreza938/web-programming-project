from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count, Q
from .models import (
    Category, Product, ProductImage, Offer, Favorite, 
    ProductRating, ProductReport
)


class ProductImageInline(admin.TabularInline):
    """Inline for product images"""
    model = ProductImage
    extra = 1
    fields = ('image', 'image_url', 'is_main', 'alt_text')
    readonly_fields = ('created_at',)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'products_count', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at', 'parent')
    search_fields = ('name', 'description')
    ordering = ('name',)
    prepopulated_fields = {'name': ('name',)}
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'parent')
        }),
        ('Media', {
            'fields': ('image',)
        }),
        ('Settings', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def products_count(self, obj):
        return obj.get_products_count()
    products_count.short_description = 'Active Products'
    products_count.admin_order_field = 'products__count'
    
    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            products__count=Count('products', filter=Q(
                products__is_active=True,
                products__status='active',
                products__is_verified=True
            ))
        )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'seller', 'category', 'price', 'condition', 
        'verification_status', 'status', 'views_count', 'created_at'
    )
    list_filter = (
        'is_verified', 'status', 'condition', 'category', 
        'is_featured', 'is_negotiable', 'created_at'
    )
    search_fields = ('title', 'description', 'seller__username', 'brand', 'model')
    ordering = ('-created_at',)
    inlines = [ProductImageInline]
    
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
            'fields': ('location', 'city', 'country', 'latitude', 'longitude',
                      'shipping_options', 'shipping_cost')
        }),
        ('Status & Verification', {
            'fields': ('status', 'is_active', 'is_featured', 'is_verified',
                      'verified_by', 'verified_at', 'verification_notes', 
                      'rejection_reason')
        }),
        ('Statistics', {
            'fields': ('views_count', 'favorites_count', 'average_rating', 
                      'total_ratings'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'expires_at'),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = (
        'views_count', 'favorites_count', 'average_rating', 'total_ratings',
        'created_at', 'updated_at', 'verified_at'
    )
    
    actions = ['verify_products', 'reject_products', 'make_featured', 'remove_featured']
    
    def verification_status(self, obj):
        if obj.is_verified:
            return format_html(
                '<span style="color: green;">✓ Verified</span>'
            )
        elif obj.status == 'pending_verification':
            return format_html(
                '<span style="color: orange;">⏳ Pending</span>'
            )
        else:
            return format_html(
                '<span style="color: red;">✗ Not Verified</span>'
            )
    verification_status.short_description = 'Verification'
    verification_status.admin_order_field = 'is_verified'
    
    def verify_products(self, request, queryset):
        count = 0
        for product in queryset.filter(is_verified=False):
            product.verify_product(request.user, "Bulk verified by admin")
            count += 1
        self.message_user(request, f'{count} products were verified.')
    verify_products.short_description = "Verify selected products"
    
    def reject_products(self, request, queryset):
        count = 0
        for product in queryset.filter(is_verified=False):
            product.reject_product(request.user, "Bulk rejected by admin")
            count += 1
        self.message_user(request, f'{count} products were rejected.')
    reject_products.short_description = "Reject selected products"
    
    def make_featured(self, request, queryset):
        count = queryset.update(is_featured=True)
        self.message_user(request, f'{count} products were made featured.')
    make_featured.short_description = "Make selected products featured"
    
    def remove_featured(self, request, queryset):
        count = queryset.update(is_featured=False)
        self.message_user(request, f'{count} products were removed from featured.')
    remove_featured.short_description = "Remove featured status"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'seller', 'category', 'verified_by'
        )


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'is_main', 'image_preview', 'created_at')
    list_filter = ('is_main', 'created_at')
    search_fields = ('product__title', 'alt_text')
    ordering = ('-created_at',)
    
    def image_preview(self, obj):
        if obj.image_url_or_file:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 100px;" />',
                obj.image_url_or_file
            )
        return "No image"
    image_preview.short_description = 'Preview'


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = (
        'product', 'buyer', 'amount', 'status', 'created_at', 'expires_at'
    )
    list_filter = ('status', 'created_at', 'product__category')
    search_fields = ('product__title', 'buyer__username', 'message')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Offer Information', {
            'fields': ('product', 'buyer', 'amount', 'message')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'expires_at'),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    actions = ['accept_offers', 'reject_offers']
    
    def accept_offers(self, request, queryset):
        count = 0
        for offer in queryset.filter(status='pending'):
            try:
                offer.accept()
                count += 1
            except ValueError:
                pass
        self.message_user(request, f'{count} offers were accepted.')
    accept_offers.short_description = "Accept selected offers"
    
    def reject_offers(self, request, queryset):
        count = 0
        for offer in queryset.filter(status='pending'):
            offer.reject()
            count += 1
        self.message_user(request, f'{count} offers were rejected.')
    reject_offers.short_description = "Reject selected offers"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'product', 'buyer'
        )


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'created_at')
    list_filter = ('created_at', 'product__category')
    search_fields = ('user__username', 'product__title')
    ordering = ('-created_at',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'user', 'product'
        )


@admin.register(ProductRating)
class ProductRatingAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at', 'product__category')
    search_fields = ('product__title', 'user__username', 'review')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Rating Information', {
            'fields': ('product', 'user', 'rating', 'review')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'product', 'user'
        )


@admin.register(ProductReport)
class ProductReportAdmin(admin.ModelAdmin):
    list_display = (
        'product', 'reporter', 'report_type', 'status', 
        'reviewed_by', 'created_at'
    )
    list_filter = ('report_type', 'status', 'created_at')
    search_fields = ('product__title', 'reporter__username', 'description')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Report Information', {
            'fields': ('reporter', 'product', 'report_type', 'description')
        }),
        ('Status & Review', {
            'fields': ('status', 'reviewed_by', 'admin_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    actions = ['mark_as_reviewed', 'resolve_reports', 'dismiss_reports']
    
    def mark_as_reviewed(self, request, queryset):
        count = 0
        for report in queryset.filter(status='pending'):
            report.mark_reviewed(request.user)
            count += 1
        self.message_user(request, f'{count} reports were marked as reviewed.')
    mark_as_reviewed.short_description = "Mark as reviewed"
    
    def resolve_reports(self, request, queryset):
        count = 0
        for report in queryset.exclude(status='resolved'):
            report.resolve(request.user)
            count += 1
        self.message_user(request, f'{count} reports were resolved.')
    resolve_reports.short_description = "Resolve selected reports"
    
    def dismiss_reports(self, request, queryset):
        count = 0
        for report in queryset.exclude(status='dismissed'):
            report.dismiss(request.user)
            count += 1
        self.message_user(request, f'{count} reports were dismissed.')
    dismiss_reports.short_description = "Dismiss selected reports"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'reporter', 'product', 'reviewed_by'
        )


# Custom admin site configuration
admin.site.site_header = "Marketplace Admin"
admin.site.site_title = "Marketplace Admin Portal"
admin.site.index_title = "Welcome to Marketplace Administration"