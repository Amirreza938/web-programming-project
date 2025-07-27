from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, UserRating


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'password', 
            'password_confirm', 'user_type', 'phone_number', 'address', 
            'city', 'country', 'postal_code'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'password_confirm': {'write_only': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
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
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    full_name = serializers.SerializerMethodField()
    is_verified_seller = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'user_type', 'phone_number', 'address', 'city', 'country', 
            'postal_code', 'profile_image', 'average_rating', 'total_ratings',
            'verification_status', 'is_active_seller', 'is_verified_seller',
            'is_premium', 'created_at'
        ]
        read_only_fields = ['id', 'username', 'email', 'average_rating', 
                           'total_ratings', 'verification_status', 'created_at']
    
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
    
    class Meta:
        model = UserRating
        fields = [
            'id', 'from_user', 'from_user_name', 'to_user', 'to_user_name',
            'rating', 'review', 'created_at'
        ]
        read_only_fields = ['id', 'from_user', 'from_user_name', 'created_at']
    
    def validate(self, attrs):
        from_user = self.context['request'].user
        to_user = attrs['to_user']
        
        if from_user == to_user:
            raise serializers.ValidationError("You cannot rate yourself")
        
        # Check if user has already rated this user
        if UserRating.objects.filter(from_user=from_user, to_user=to_user).exists():
            raise serializers.ValidationError("You have already rated this user")
        
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