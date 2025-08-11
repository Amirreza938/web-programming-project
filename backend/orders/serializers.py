from rest_framework import serializers
from .models import Order, OrderStatus, ShippingMethod, Dispute, DisputeMessage
from users.serializers import UserProfileSerializer
from products.serializers import ProductListSerializer


class ShippingMethodSerializer(serializers.ModelSerializer):
    """Serializer for shipping methods"""
    
    class Meta:
        model = ShippingMethod
        fields = [
            'id', 'name', 'description', 'base_cost', 'estimated_days', 'is_active'
        ]


class OrderStatusSerializer(serializers.ModelSerializer):
    """Serializer for order status history"""
    
    class Meta:
        model = OrderStatus
        fields = ['id', 'status', 'notes', 'created_at']


class OrderListSerializer(serializers.ModelSerializer):
    """Serializer for listing orders"""
    product = ProductListSerializer(read_only=True)
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'product', 'seller_name', 'buyer_name',
            'unit_price', 'total_amount', 'status', 'payment_status',
            'shipping_method', 'created_at'
        ]


class OrderDetailSerializer(serializers.ModelSerializer):
    """Serializer for order details"""
    product = ProductListSerializer(read_only=True)
    seller = UserProfileSerializer(read_only=True)
    buyer = UserProfileSerializer(read_only=True)
    status_history = OrderStatusSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'product', 'seller', 'buyer', 'accepted_offer',
            'unit_price', 'shipping_cost', 'total_amount', 'shipping_address',
            'shipping_city', 'shipping_country', 'shipping_postal_code',
            'shipping_phone', 'shipping_method', 'tracking_number', 'status',
            'payment_status', 'status_history', 'created_at', 'updated_at',
            'shipped_at', 'delivered_at'
        ]


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders"""
    
    class Meta:
        model = Order
        fields = [
            'product', 'accepted_offer', 'shipping_address', 'shipping_city',
            'shipping_country', 'shipping_postal_code', 'shipping_phone',
            'shipping_method'
        ]
    
    def validate(self, attrs):
        print(f"[DEBUG] OrderCreateSerializer.validate called with attrs: {attrs}")
        product = attrs['product']
        user = self.context['request'].user
        accepted_offer = attrs.get('accepted_offer')
        print(f"[DEBUG] Product: {product}, User: {user}, Accepted Offer: {accepted_offer}")
        
        # Check if product is available for this user/offer
        if accepted_offer:
            print(f"[DEBUG] Checking availability for accepted offer: {accepted_offer.id}")
            # For accepted offers, use the specific availability check
            if not product.is_available_for_user(user=user, offer=accepted_offer):
                print(f"[DEBUG] Accepted offer is not valid for purchase")
                raise serializers.ValidationError("This offer has expired or is no longer valid for purchase")
        else:
            print(f"[DEBUG] Checking standard product availability")
            # For regular purchases, use standard availability check
            if not product.is_available():
                print(f"[DEBUG] Product not available: {product.status}")
                raise serializers.ValidationError("Product is not available for purchase")
        
        # Check if user is not the seller
        if product.seller == user:
            print(f"[DEBUG] User is the seller")
            raise serializers.ValidationError("You cannot purchase your own product")
        
        # Convert shipping_method ID to method name
        if 'shipping_method' in attrs and isinstance(attrs['shipping_method'], int):
            print(f"[DEBUG] Converting shipping method ID {attrs['shipping_method']} to name")
            try:
                shipping_method_obj = ShippingMethod.objects.get(id=attrs['shipping_method'])
                attrs['shipping_method'] = shipping_method_obj.name
                print(f"[DEBUG] Converted to: {attrs['shipping_method']}")
            except ShippingMethod.DoesNotExist:
                print(f"[DEBUG] Invalid shipping method ID: {attrs['shipping_method']}")
                raise serializers.ValidationError("Invalid shipping method")
        
        # Set buyer and seller
        attrs['buyer'] = user
        attrs['seller'] = product.seller
        
        # Set pricing
        if attrs.get('accepted_offer'):
            print(f"[DEBUG] Using offer price: {attrs['accepted_offer'].amount}")
            attrs['unit_price'] = attrs['accepted_offer'].amount
        else:
            print(f"[DEBUG] Using product price: {product.price}")
            attrs['unit_price'] = product.price
        
        attrs['shipping_cost'] = product.shipping_cost
        attrs['total_amount'] = attrs['unit_price'] + attrs['shipping_cost']
        
        print(f"[DEBUG] Final attrs: {attrs}")
        return attrs


class OrderUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating orders (seller/admin only)"""
    
    class Meta:
        model = Order
        fields = [
            'status', 'payment_status', 'tracking_number'
        ]
        read_only_fields = ['order_number', 'buyer', 'seller', 'product', 'total_amount']
    
    def update(self, instance, validated_data):
        # Create status history entry
        if 'status' in validated_data and validated_data['status'] != instance.status:
            OrderStatus.objects.create(
                order=instance,
                status=validated_data['status'],
                notes=f"Status changed from {instance.status} to {validated_data['status']}"
            )
        
        return super().update(instance, validated_data)


class DisputeSerializer(serializers.ModelSerializer):
    """Serializer for disputes"""
    complainant_name = serializers.CharField(source='complainant.username', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    
    class Meta:
        model = Dispute
        fields = [
            'id', 'order', 'order_number', 'complainant', 'complainant_name',
            'dispute_type', 'description', 'evidence', 'status', 'resolution',
            'resolved_by', 'created_at', 'updated_at', 'resolved_at'
        ]
        read_only_fields = [
            'id', 'complainant', 'complainant_name', 'order_number', 'status',
            'resolution', 'resolved_by', 'created_at', 'updated_at', 'resolved_at'
        ]
    
    def create(self, validated_data):
        validated_data['complainant'] = self.context['request'].user
        return super().create(validated_data)


class DisputeListSerializer(serializers.ModelSerializer):
    """Serializer for listing disputes"""
    complainant_name = serializers.CharField(source='complainant.username', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    product_title = serializers.CharField(source='order.product.title', read_only=True)
    
    class Meta:
        model = Dispute
        fields = [
            'id', 'order_number', 'product_title', 'complainant_name',
            'dispute_type', 'status', 'created_at'
        ]


class DisputeMessageSerializer(serializers.ModelSerializer):
    """Serializer for dispute messages"""
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    sender_image = serializers.ImageField(source='sender.profile_image', read_only=True)
    
    class Meta:
        model = DisputeMessage
        fields = [
            'id', 'dispute', 'sender', 'sender_name', 'sender_image',
            'message', 'is_admin_message', 'created_at'
        ]
        read_only_fields = [
            'id', 'sender', 'sender_name', 'sender_image', 'is_admin_message', 'created_at'
        ]
    
    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class DisputeDetailSerializer(serializers.ModelSerializer):
    """Serializer for dispute details"""
    complainant = UserProfileSerializer(read_only=True)
    order = OrderListSerializer(read_only=True)
    messages = DisputeMessageSerializer(many=True, read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.username', read_only=True)
    
    class Meta:
        model = Dispute
        fields = [
            'id', 'order', 'complainant', 'dispute_type', 'description',
            'evidence', 'status', 'resolution', 'resolved_by', 'resolved_by_name',
            'messages', 'created_at', 'updated_at', 'resolved_at'
        ]


class DisputeResolutionSerializer(serializers.ModelSerializer):
    """Serializer for resolving disputes (admin only)"""
    
    class Meta:
        model = Dispute
        fields = ['status', 'resolution']
    
    def validate(self, attrs):
        if attrs['status'] == 'resolved' and not attrs.get('resolution'):
            raise serializers.ValidationError("Resolution is required when resolving a dispute")
        return attrs
    
    def update(self, instance, validated_data):
        if validated_data.get('status') == 'resolved':
            validated_data['resolved_by'] = self.context['request'].user
        return super().update(instance, validated_data)


class OrderTrackingSerializer(serializers.Serializer):
    """Serializer for order tracking"""
    order_number = serializers.CharField()
    tracking_number = serializers.CharField(required=False)
    
    def validate_order_number(self, value):
        try:
            Order.objects.get(order_number=value)
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found")
        return value 