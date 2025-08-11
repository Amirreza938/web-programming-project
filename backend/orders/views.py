from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count, Sum
from django.shortcuts import get_object_or_404
from django.db import models
from .models import Order, OrderStatus, ShippingMethod, Dispute, DisputeMessage
from .serializers import (
    OrderListSerializer, OrderDetailSerializer, OrderCreateSerializer,
    OrderUpdateSerializer, DisputeSerializer, DisputeListSerializer,
    DisputeDetailSerializer, DisputeMessageSerializer, DisputeResolutionSerializer,
    OrderTrackingSerializer, ShippingMethodSerializer, OrderStatusSerializer
)
from users.views import CanBuyPermission, CanSellPermission


class OrderListView(generics.ListAPIView):
    """List user's orders"""
    serializer_class = OrderListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Order.objects.filter(
            Q(buyer=user) | Q(seller=user)
        ).order_by('-created_at')


class OrderDetailView(generics.RetrieveAPIView):
    """Get order details"""
    serializer_class = OrderDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Order.objects.filter(
            Q(buyer=user) | Q(seller=user)
        )


class OrderCreateView(generics.CreateAPIView):
    """Create a new order"""
    serializer_class = OrderCreateSerializer
    permission_classes = [CanBuyPermission]
    
    def perform_create(self, serializer):
        # Check if user can buy
        if not self.request.user.can_buy():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You don't have permission to create orders")
        
        order = serializer.save()
        
        # Do NOT change product status when order is created - keep it available until approved
        # This allows other buyers to still see and potentially purchase the product
        # until the seller approves this specific order
        
        # Create initial status
        OrderStatus.objects.create(
            order=order,
            status='pending',
            notes='Order created, awaiting seller approval'
        )
        
        # Create notification for seller
        from chat.models import Notification
        Notification.objects.create(
            recipient=order.seller,
            title=f'New Order #{order.order_number}',
            message=f'You have a new order for "{order.product.title}" from {order.buyer.username}. Please review and approve.',
            notification_type='order_created'
        )
        
        # Update product status only if order was created from an accepted offer
        if order.accepted_offer:
            order.product.status = 'sold'
            order.product.save()


class OrderUpdateView(generics.UpdateAPIView):
    """Update order status (seller/admin only)"""
    serializer_class = OrderUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Order.objects.filter(seller=user)


class MyOrdersView(generics.ListAPIView):
    """Get current user's orders as buyer"""
    serializer_class = OrderListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        print("[DEBUG] MyOrdersView user:", self.request.user)
        print("[DEBUG] MyOrdersView headers:", dict(self.request.headers))
        return Order.objects.filter(buyer=self.request.user).order_by('-created_at')


class MySalesView(generics.ListAPIView):
    """Get current user's sales as seller"""
    serializer_class = OrderListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(seller=self.request.user).order_by('-created_at')


class ShippingMethodListView(generics.ListAPIView):
    """List available shipping methods"""
    queryset = ShippingMethod.objects.filter(is_active=True)
    serializer_class = ShippingMethodSerializer
    permission_classes = [permissions.AllowAny]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_order_shipped(request, order_id):
    """Mark order as shipped (seller only)"""
    order = get_object_or_404(Order, id=order_id, seller=request.user)
    
    tracking_number = request.data.get('tracking_number')
    order.mark_as_shipped(tracking_number)
    
    return Response({'message': 'Order marked as shipped successfully'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_order_delivered(request, order_id):
    """Mark order as delivered (buyer only)"""
    order = get_object_or_404(Order, id=order_id, buyer=request.user)
    
    order.mark_as_delivered()
    
    return Response({'message': 'Order marked as delivered successfully'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_order(request, order_id):
    """Cancel an order"""
    order = get_object_or_404(Order, id=order_id)
    
    # Check if user can cancel this order
    if order.buyer != request.user and order.seller != request.user:
        return Response(
            {'error': 'You cannot cancel this order'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Only allow cancellation if order is still pending
    if order.status != 'pending':
        return Response(
            {'error': 'Order cannot be cancelled at this stage'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    order.cancel_order()
    
    return Response({'message': 'Order cancelled successfully'})


class DisputeCreateView(generics.CreateAPIView):
    """Create a dispute for an order"""
    serializer_class = DisputeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        dispute = serializer.save()
        
        # Create initial message if provided
        initial_message = self.request.data.get('message')
        if initial_message:
            DisputeMessage.objects.create(
                dispute=dispute,
                sender=self.request.user,
                message=initial_message
            )


class DisputeListView(generics.ListAPIView):
    """List user's disputes"""
    serializer_class = DisputeListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Dispute.objects.filter(
            Q(complainant=user) | Q(order__seller=user) | Q(order__buyer=user)
        ).order_by('-created_at')


class DisputeDetailView(generics.RetrieveAPIView):
    """Get dispute details"""
    serializer_class = DisputeDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Dispute.objects.filter(
            Q(complainant=user) | Q(order__seller=user) | Q(order__buyer=user)
        )


class DisputeMessageCreateView(generics.CreateAPIView):
    """Add message to dispute"""
    serializer_class = DisputeMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        dispute = serializer.validated_data['dispute']
        # Check if user is involved in the dispute
        if (dispute.complainant != self.request.user and 
            dispute.order.seller != self.request.user and 
            dispute.order.buyer != self.request.user):
            raise PermissionError("You are not involved in this dispute")
        
        serializer.save(sender=self.request.user)


class DisputeMessageListView(generics.ListAPIView):
    """List messages in a dispute"""
    serializer_class = DisputeMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        dispute_id = self.kwargs.get('dispute_id')
        dispute = get_object_or_404(Dispute, id=dispute_id)
        
        # Check if user is involved in the dispute
        if (dispute.complainant != self.request.user and 
            dispute.order.seller != self.request.user and 
            dispute.order.buyer != self.request.user):
            return DisputeMessage.objects.none()
        
        return DisputeMessage.objects.filter(dispute=dispute).order_by('created_at')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def resolve_dispute(request, dispute_id):
    """Resolve a dispute (admin only)"""
    dispute = get_object_or_404(Dispute, id=dispute_id)
    
    # Check if user is admin or has permission to resolve disputes
    if not request.user.is_staff:
        return Response(
            {'error': 'Only administrators can resolve disputes'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = DisputeResolutionSerializer(dispute, data=request.data)
    if serializer.is_valid():
        serializer.save(resolved_by=request.user)
        return Response({'message': 'Dispute resolved successfully'})
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def track_order(request):
    """Track order by order number"""
    serializer = OrderTrackingSerializer(data=request.query_params)
    if serializer.is_valid():
        order_number = serializer.validated_data['order_number']
        order = get_object_or_404(Order, order_number=order_number)
        
        # Return basic order info for tracking
        return Response({
            'order_number': order.order_number,
            'status': order.status,
            'tracking_number': order.tracking_number,
            'shipping_method': order.shipping_method,
            'created_at': order.created_at,
            'shipped_at': order.shipped_at,
            'delivered_at': order.delivered_at,
            'status_history': OrderStatusSerializer(
                order.status_history.all(), many=True
            ).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def order_statistics(request):
    """Get order statistics for user"""
    user = request.user
    
    # Buyer statistics
    buyer_stats = {
        'total_orders': Order.objects.filter(buyer=user).count(),
        'pending_orders': Order.objects.filter(buyer=user, status='pending').count(),
        'shipped_orders': Order.objects.filter(buyer=user, status='shipped').count(),
        'delivered_orders': Order.objects.filter(buyer=user, status='delivered').count(),
        'cancelled_orders': Order.objects.filter(buyer=user, status='cancelled').count(),
    }
    
    # Seller statistics
    seller_stats = {
        'total_sales': Order.objects.filter(seller=user).count(),
        'pending_sales': Order.objects.filter(seller=user, status='pending').count(),
        'shipped_sales': Order.objects.filter(seller=user, status='shipped').count(),
        'delivered_sales': Order.objects.filter(seller=user, status='delivered').count(),
        'total_revenue': Order.objects.filter(
            seller=user, 
            status__in=['delivered', 'shipped']
        ).aggregate(total=models.Sum('total_amount'))['total'] or 0,
    }
    
    # Dispute statistics
    dispute_stats = {
        'total_disputes': Dispute.objects.filter(complainant=user).count(),
        'open_disputes': Dispute.objects.filter(complainant=user, status='open').count(),
        'resolved_disputes': Dispute.objects.filter(complainant=user, status='resolved').count(),
    }
    
    return Response({
        'buyer_stats': buyer_stats,
        'seller_stats': seller_stats,
        'dispute_stats': dispute_stats
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recent_orders(request):
    """Get recent orders for user"""
    user = request.user
    
    # Get recent orders as buyer
    recent_buyer_orders = Order.objects.filter(
        buyer=user
    ).order_by('-created_at')[:5]
    
    # Get recent orders as seller
    recent_seller_orders = Order.objects.filter(
        seller=user
    ).order_by('-created_at')[:5]
    
    return Response({
        'recent_buyer_orders': OrderListSerializer(
            recent_buyer_orders, many=True, context={'request': request}
        ).data,
        'recent_seller_orders': OrderListSerializer(
            recent_seller_orders, many=True, context={'request': request}
        ).data,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_order_tracking(request, order_id):
    """Get order tracking details by order ID"""
    user = request.user
    order = get_object_or_404(Order, pk=order_id)
    
    # Check if user has permission to view this order
    if order.buyer != user and order.seller != user:
        return Response(
            {'error': 'You do not have permission to view this order'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Return detailed tracking info
    return Response({
        'order_id': order.id,
        'order_number': order.order_number,
        'status': order.status,
        'tracking_number': order.tracking_number,
        'shipping_method': order.shipping_method.name if order.shipping_method else None,
        'created_at': order.created_at,
        'shipped_at': order.shipped_at,
        'delivered_at': order.delivered_at,
        'estimated_delivery': order.estimated_delivery,
        'buyer': {
            'id': order.buyer.id,
            'username': order.buyer.username,
            'full_name': order.buyer.get_full_name(),
        },
        'seller': {
            'id': order.seller.id,
            'username': order.seller.username,
            'full_name': order.seller.get_full_name(),
        },
        'total_amount': order.total_amount,
        'status_history': OrderStatusSerializer(
            order.status_history.all().order_by('created_at'), many=True
        ).data,
        'items': [{
            'product_title': order.product.title,
            'product_id': order.product.id,
            'quantity': order.quantity,
            'price': order.price,
        }]
    })


class OrderApprovalView(APIView):
    """Approve or reject an order (seller only)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, order_id):
        print(f"[DEBUG] OrderApprovalView: order_id={order_id}, user={request.user}")
        print(f"[DEBUG] Request data: {request.data}")
        
        try:
            order = Order.objects.get(id=order_id, seller=request.user)
            print(f"[DEBUG] Found order: {order}, status: {order.status}")
        except Order.DoesNotExist:
            print(f"[DEBUG] Order not found for id={order_id}, user={request.user}")
            return Response({'error': 'Order not found or you are not authorized to modify this order'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        action = request.data.get('action')
        print(f"[DEBUG] Action: {action}")
        
        if action not in ['approve', 'reject']:
            print(f"[DEBUG] Invalid action: {action}")
            return Response({'error': 'Invalid action. Must be "approve" or "reject"'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        if order.status != 'pending':
            print(f"[DEBUG] Order status is not pending: {order.status}")
            return Response({'error': f'Order is not in pending status. Current status: {order.status}'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        if action == 'approve':
            order.status = 'approved'
            status_note = 'Order approved by seller'
            # Set product as sold when order is approved
            order.product.status = 'sold'
            order.product.save()
        else:
            order.status = 'rejected'
            status_note = 'Order rejected by seller'
            # Keep product available when order is rejected
            # (product status remains unchanged - available for other buyers)
        
        order.save()
        
        # Create status history
        OrderStatus.objects.create(
            order=order,
            status=order.status,
            notes=status_note
        )
        
        # Create notification for buyer
        from chat.models import Notification
        Notification.objects.create(
            recipient=order.buyer,
            title=f'Order #{order.order_number} {action}d',
            message=f'Your order for "{order.product.title}" has been {action}d by the seller.',
            notification_type=f'order_{action}d'
        )
        
        return Response({
            'success': True, 
            'order_status': order.status,
            'message': f'Order {action}d successfully'
        })
