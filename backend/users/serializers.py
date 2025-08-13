from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from .models import User, UserRating, VerificationRequest


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=False)
    confirmPassword = serializers.CharField(write_only=True, required=False)  # Frontend field name
    
    # Frontend field name mappings
    firstName = serializers.CharField(source='first_name', required=False)
    lastName = serializers.CharField(source='last_name', required=False)
    phone = serializers.CharField(source='phone_number', required=False)
    userType = serializers.CharField(source='user_type', required=False)
    zipCode = serializers.CharField(source='postal_code', required=False)
    
    # ID card images for sellers
    id_card_front = serializers.ImageField(write_only=True, required=False)
    id_card_back = serializers.ImageField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'firstName', 'lastName',
            'password', 'password_confirm', 'confirmPassword', 'user_type', 'userType',
            'phone_number', 'phone', 'address', 'city', 'country', 'postal_code', 'zipCode',
            'id_card_front', 'id_card_back'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'password_confirm': {'write_only': True},
            'confirmPassword': {'write_only': True},
        }
    
    def validate(self, attrs):
        # Handle both frontend and backend field names
        password_confirm = attrs.get('password_confirm') or attrs.get('confirmPassword')
        if not password_confirm:
            raise serializers.ValidationError("Password confirmation is required")
        
        if attrs['password'] != password_confirm:
            raise serializers.ValidationError("Passwords don't match")
        
        # Check user type and ID card requirements
        user_type = attrs.get('user_type') or attrs.get('userType', 'buyer')
        
        # Prevent admin registration through API
        if user_type == 'admin':
            raise serializers.ValidationError("Admin accounts cannot be registered through this endpoint")
        
        # Validate ID card requirement for sellers
        if user_type in ['seller', 'both']:
            if not attrs.get('id_card_front') or not attrs.get('id_card_back'):
                raise serializers.ValidationError(
                    "ID card front and back images are required for seller accounts"
                )
        
        # Map frontend field names to backend field names
        if 'confirmPassword' in attrs:
            attrs['password_confirm'] = attrs.pop('confirmPassword')
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        validated_data.pop('confirmPassword', None)
        
        # Extract ID card images
        id_card_front = validated_data.pop('id_card_front', None)
        id_card_back = validated_data.pop('id_card_back', None)
        
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        
        # Create verification request for sellers
        if user.user_type in ['seller', 'both'] and id_card_front and id_card_back:
            VerificationRequest.objects.create(
                user=user,
                id_card_front=id_card_front,
                id_card_back=id_card_back
            )
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            
            # Check if user account is approved (for sellers)
            if user.user_type in ['seller', 'both'] and not user.account_approved:
                raise serializers.ValidationError(
                    'Your account is pending admin approval. Please wait for verification.'
                )
            
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    full_name = serializers.SerializerMethodField()
    is_verified_seller = serializers.SerializerMethodField()
    can_buy = serializers.SerializerMethodField()
    can_sell = serializers.SerializerMethodField()
    is_admin_user = serializers.SerializerMethodField()
    needs_verification = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'user_type', 'phone_number', 'address', 'city', 'country', 
            'postal_code', 'profile_image', 'average_rating', 'total_ratings',
            'verification_status', 'account_approved', 'is_active_seller', 
            'is_verified_seller', 'is_premium', 'created_at', 'can_buy', 
            'can_sell', 'is_admin_user', 'needs_verification'
        ]
        read_only_fields = ['id', 'username', 'email', 'average_rating', 
                           'total_ratings', 'verification_status', 'account_approved', 
                           'created_at', 'can_buy', 'can_sell', 'is_admin_user', 
                           'needs_verification']
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_is_verified_seller(self, obj):
        return obj.is_verified_seller()
    
    def get_can_buy(self, obj):
        return obj.can_buy()
    
    def get_can_sell(self, obj):
        return obj.can_sell()
    
    def get_is_admin_user(self, obj):
        return obj.is_admin_user()
    
    def get_needs_verification(self, obj):
        return obj.needs_verification()
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_is_verified_seller(self, obj):
        return obj.is_verified_seller()


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone_number', 'address', 
            'city', 'country', 'postal_code', 'profile_image'
        ]


class UserRatingSerializer(serializers.ModelSerializer):
    """Serializer for user ratings"""
    from_user_name = serializers.CharField(source='from_user.username', read_only=True)
    to_user_name = serializers.CharField(source='to_user.username', read_only=True)
    to_user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    order = serializers.IntegerField(write_only=True, required=True)  # Order ID is required
    
    class Meta:
        model = UserRating
        fields = [
            'id', 'from_user', 'from_user_name', 'to_user', 'to_user_name',
            'order', 'rating', 'review', 'created_at'
        ]
        read_only_fields = ['id', 'from_user', 'from_user_name', 'created_at']
    
    def validate(self, attrs):
        from_user = self.context['request'].user
        
        # Handle to_user from URL parameter or from data
        to_user_id = self.context.get('to_user_id')
        
        if to_user_id:
            try:
                to_user = User.objects.get(id=to_user_id)
                attrs['to_user'] = to_user
            except User.DoesNotExist:
                raise serializers.ValidationError("User not found")
        else:
            to_user = attrs.get('to_user')
            if not to_user:
                raise serializers.ValidationError("to_user is required")
        
        if from_user == to_user:
            raise serializers.ValidationError("You cannot rate yourself")
        
        # Get order from request data
        order_id = attrs.get('order') or self.context.get('order_id')
        if order_id:
            from orders.models import Order
            try:
                order = Order.objects.get(id=order_id)
                attrs['order'] = order
                
                # Check if user has already rated this user for this specific order
                existing_rating = UserRating.objects.filter(
                    from_user=from_user, 
                    to_user=to_user, 
                    order=order
                ).first()
                if existing_rating:
                    raise serializers.ValidationError("You have already rated this user for this order")
                    
            except Order.DoesNotExist:
                raise serializers.ValidationError("Order not found")
        else:
            raise serializers.ValidationError("Order is required for rating")
        
        attrs['from_user'] = from_user
        return attrs


class UserRatingListSerializer(serializers.ModelSerializer):
    """Serializer for listing user ratings"""
    from_user_name = serializers.CharField(source='from_user.username', read_only=True)
    from_user_image = serializers.ImageField(source='from_user.profile_image', read_only=True)
    
    class Meta:
        model = UserRating
        fields = [
            'id', 'from_user_name', 'from_user_image', 'rating', 'review', 'created_at'
        ]


class SellerVerificationSerializer(serializers.ModelSerializer):
    """Serializer for seller verification"""
    
    class Meta:
        model = User
        fields = ['verification_documents']


class VerificationRequestSerializer(serializers.ModelSerializer):
    """Serializer for verification requests"""
    user_details = UserProfileSerializer(source='user', read_only=True)
    reviewer_name = serializers.CharField(source='reviewed_by.username', read_only=True)
    
    class Meta:
        model = VerificationRequest
        fields = [
            'id', 'user', 'user_details', 'id_card_front', 'id_card_back',
            'additional_documents', 'notes', 'status', 'admin_notes',
            'reviewed_by', 'reviewer_name', 'reviewed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'reviewed_by', 'reviewed_at']


class VerificationRequestUpdateSerializer(serializers.ModelSerializer):
    """Serializer for admin to update verification requests"""
    
    class Meta:
        model = VerificationRequest
        fields = ['status', 'admin_notes']
    
    def update(self, instance, validated_data):
        # Update the verification request
        request = self.context.get('request')
        if request and request.user.is_admin_user():
            instance.reviewed_by = request.user
            instance.reviewed_at = timezone.now()
            
            # Update user verification status based on admin decision
            if validated_data.get('status') == 'approved':
                instance.user.verification_status = 'verified'
                instance.user.account_approved = True
                instance.user.approved_by = request.user
                instance.user.approval_date = timezone.now()
                instance.user.save()
            elif validated_data.get('status') == 'rejected':
                instance.user.verification_status = 'rejected'
                instance.user.account_approved = False
                instance.user.save()
        
        return super().update(instance, validated_data)


class AdminDashboardStatsSerializer(serializers.Serializer):
    """Serializer for admin dashboard statistics"""
    pending_verifications = serializers.IntegerField()
    total_users = serializers.IntegerField()
    total_buyers = serializers.IntegerField()
    total_sellers = serializers.IntegerField()
    verified_sellers = serializers.IntegerField()
    pending_sellers = serializers.IntegerField()
    rejected_sellers = serializers.IntegerField()
    
    def update(self, instance, validated_data):
        instance.verification_status = 'pending'
        return super().update(instance, validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value
    
    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user 