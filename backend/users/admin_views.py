from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta
from users.models import User
from products.models import Product, Category
from orders.models import Order, Dispute
from chat.models import Notification


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_stats(request):
    """Get admin dashboard statistics"""
    period = request.GET.get('period', 'week')
    
    # Calculate date range
    now = timezone.now()
    if period == 'day':
        start_date = now - timedelta(days=1)
    elif period == 'week':
        start_date = now - timedelta(weeks=1)
    elif period == 'month':
        start_date = now - timedelta(days=30)
    elif period == 'year':
        start_date = now - timedelta(days=365)
    else:
        start_date = now - timedelta(weeks=1)
    
    # Previous period for comparison
    period_duration = now - start_date
    previous_start = start_date - period_duration
    
    # Current period stats
    current_users = User.objects.filter(date_joined__gte=start_date).count()
    current_products = Product.objects.filter(created_at__gte=start_date).count()
    current_orders = Order.objects.filter(created_at__gte=start_date).count()
    current_revenue = Order.objects.filter(
        created_at__gte=start_date,
        status='delivered'
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    # Previous period stats for comparison
    previous_users = User.objects.filter(
        date_joined__gte=previous_start,
        date_joined__lt=start_date
    ).count()
    previous_products = Product.objects.filter(
        created_at__gte=previous_start,
        created_at__lt=start_date
    ).count()
    previous_orders = Order.objects.filter(
        created_at__gte=previous_start,
        created_at__lt=start_date
    ).count()
    previous_revenue = Order.objects.filter(
        created_at__gte=previous_start,
        created_at__lt=start_date,
        status='delivered'
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    # Calculate growth percentages
    def calculate_growth(current, previous):
        if previous == 0:
            return 100 if current > 0 else 0
        return round(((current - previous) / previous) * 100, 2)
    
    # Overall stats
    total_stats = {
        'total_users': User.objects.count(),
        'users_growth': calculate_growth(current_users, previous_users),
        'active_listings': Product.objects.filter(is_active=True, status='active').count(),
        'listings_growth': calculate_growth(current_products, previous_products),
        'total_orders': Order.objects.count(),
        'orders_growth': calculate_growth(current_orders, previous_orders),
        'total_revenue': float(Order.objects.filter(status='delivered').aggregate(
            total=Sum('total_amount'))['total'] or 0),
        'revenue_growth': calculate_growth(float(current_revenue), float(previous_revenue)),
        'open_disputes': Dispute.objects.filter(status='open').count(),
        'pending_verifications': User.objects.filter(verification_status='pending').count(),
    }
    
    # User statistics
    user_stats = {
        'buyers_count': User.objects.filter(user_type__in=['buyer', 'both']).count(),
        'sellers_count': User.objects.filter(user_type__in=['seller', 'both']).count(),
        'verified_users': User.objects.filter(verification_status='verified').count(),
        'premium_users': User.objects.filter(is_premium=True).count(),
    }
    
    # Product statistics
    product_stats = {
        'products_pending_review': Product.objects.filter(is_active=False).count(),
        'expired_listings': Product.objects.filter(expires_at__lt=now).count(),
        'featured_products': Product.objects.filter(is_featured=True).count(),
    }
    
    # Order statistics
    order_stats = {
        'pending_orders': Order.objects.filter(status='pending').count(),
        'shipped_orders': Order.objects.filter(status='shipped').count(),
        'completed_orders': Order.objects.filter(status='delivered').count(),
    }
    
    # Top categories
    top_categories = Category.objects.annotate(
        product_count=Count('products', filter=Q(products__is_active=True))
    ).filter(product_count__gt=0).order_by('-product_count')[:5]
    
    category_data = [
        {
            'name': cat.name,
            'count': cat.product_count
        }
        for cat in top_categories
    ]
    
    # Dispute statistics
    dispute_stats = {
        'avg_resolution_time': 3,  # This would need actual calculation
        'resolution_rate': 85,      # This would need actual calculation
        'satisfaction_rate': 92,    # This would need actual calculation
    }
    
    return Response({
        **total_stats,
        **user_stats,
        **product_stats,
        **order_stats,
        **dispute_stats,
        'top_categories': category_data,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_activities(request):
    """Get recent admin activities"""
    
    # Recent users
    recent_users = User.objects.order_by('-date_joined')[:10]
    user_data = [
        {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_verified': user.verification_status == 'verified',
            'date_joined': user.date_joined,
        }
        for user in recent_users
    ]
    
    # Recent orders
    recent_orders = Order.objects.select_related('buyer', 'product').order_by('-created_at')[:10]
    order_data = [
        {
            'id': order.id,
            'order_number': order.order_number,
            'buyer_name': order.buyer.username,
            'total_amount': float(order.total_amount),
            'status': order.status,
            'created_at': order.created_at,
        }
        for order in recent_orders
    ]
    
    # Open disputes
    open_disputes = Dispute.objects.select_related('order', 'complainant').filter(
        status='open'
    )[:10]
    dispute_data = [
        {
            'id': dispute.id,
            'dispute_type': dispute.dispute_type,
            'order_number': dispute.order.order_number,
            'complainant': dispute.complainant.username,
            'status': dispute.status,
            'created_at': dispute.created_at,
        }
        for dispute in open_disputes
    ]
    
    # System logs (mock data - you would integrate with actual logging)
    system_logs = [
        {
            'level': 'info',
            'message': 'User verification completed successfully',
            'timestamp': timezone.now() - timedelta(minutes=30),
        },
        {
            'level': 'warning',
            'message': 'High number of failed login attempts detected',
            'timestamp': timezone.now() - timedelta(hours=2),
        },
        {
            'level': 'info',
            'message': 'Database backup completed',
            'timestamp': timezone.now() - timedelta(hours=6),
        },
    ]
    
    return Response({
        'recent_users': user_data,
        'recent_orders': order_data,
        'open_disputes': dispute_data,
        'system_logs': system_logs,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def system_health(request):
    """Get system health information"""
    
    # Mock system health data - integrate with actual monitoring
    return Response({
        'server_status': 'Online',
        'database_status': 'Connected',
        'storage_usage': 45,  # percentage
        'active_users': User.objects.filter(last_login__gte=timezone.now() - timedelta(hours=24)).count(),
        'error_rate': 0.1,    # percentage
        'response_time': 120, # milliseconds
    })


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def pending_products(request):
    """List all products pending admin verification"""
    from products.models import Product
    from products.serializers import ProductListSerializer

    products = Product.objects.filter(is_verified=False, status='pending_verification').order_by('-created_at')
    return Response(ProductListSerializer(products, many=True, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def verify_product(request, product_id):
    """Admin verifies a product"""
    from products.models import Product
    product = Product.objects.filter(id=product_id).first()

    if not product:
        return Response({'error': 'Product not found'}, status=404)

    product.verify_product(admin_user=request.user, notes=request.data.get('notes'))
    return Response({'message': 'Product verified successfully'})


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def reject_product(request, product_id):
    """Admin rejects a product"""
    from products.models import Product
    product = Product.objects.filter(id=product_id).first()

    if not product:
        return Response({'error': 'Product not found'}, status=404)

    reason = request.data.get('reason', 'Rejected by admin')
    product.reject_product(admin_user=request.user, reason=reason)
    return Response({'message': 'Product rejected successfully'})

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def pending_reports(request):
    """List all product reports pending review"""
    from products.models import ProductReport
    reports = ProductReport.objects.filter(status='pending').order_by('-created_at')

    data = []
    for r in reports:
        data.append({
            'id': r.id,
            'product_title': r.product.title,
            'report_type': r.get_report_type_display(),
            'description': r.description,
            'reporter': r.reporter.username,
            'created_at': r.created_at,
        })

    return Response(data)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def update_report_status(request, report_id):
    """Update product report status"""
    from products.models import ProductReport
    report = ProductReport.objects.filter(id=report_id).first()

    if not report:
        return Response({'error': 'Report not found'}, status=404)

    action = request.data.get('action')
    notes = request.data.get('notes', '')

    if action == 'review':
        report.mark_reviewed(request.user, notes)
    elif action == 'resolve':
        report.resolve(request.user, notes)
    elif action == 'dismiss':
        report.dismiss(request.user, notes)
    else:
        return Response({'error': 'Invalid action'}, status=400)

    return Response({'message': f'Report {action}d successfully'})
