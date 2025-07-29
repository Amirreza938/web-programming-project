from rest_framework import serializers
from django.db.models import Avg
from .models import Category, Product, ProductImage, Offer, Favorite
from users.serializers import UserProfileSerializer


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for product categories"""
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'description', 'parent', 'image', 
            'is_active', 'products_count', 'created_at'
        ]
    
    def get_products_count(self, obj):
        return obj.get_products_count()


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for product images"""
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'image_url', 'is_main', 'alt_text', 'created_at']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Return external URL directly, or build absolute URI for uploaded files
        if instance.image_url:
            data['image'] = instance.image_url
        elif instance.image:
            data['image'] = self.context['request'].build_absolute_uri(instance.image.url)
        else:
            data['image'] = None
        return data


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for listing products"""
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    seller_rating = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    main_image = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'price', 'original_price', 'condition', 'brand', 'model',
            'location', 'city', 'country', 'seller_name', 'seller_rating',
            'category_name', 'main_image', 'views_count', 'favorites_count',
            'is_negotiable', 'is_favorited', 'created_at'
        ]
    
    def get_seller_rating(self, obj):
        return float(obj.seller.average_rating)
    
    def get_main_image(self, obj):
        main_image = obj.get_main_image()
        if main_image:
            if main_image.image_url:
                return main_image.image_url
            elif main_image.image:
                return self.context['request'].build_absolute_uri(main_image.image.url)
        return None
    
    def get_is_favorited(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return obj.favorited_by.filter(user=user).exists()
        return False


class ProductDetailSerializer(serializers.ModelSerializer):
    """Serializer for product details"""
    seller = UserProfileSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    is_favorited = serializers.SerializerMethodField()
    offers_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'seller', 'category', 'title', 'description', 'condition',
            'brand', 'model', 'price', 'original_price', 'is_negotiable',
            'location', 'city', 'country', 'latitude', 'longitude',
            'shipping_options', 'shipping_cost', 'status', 'is_active',
            'is_featured', 'views_count', 'favorites_count', 'images',
            'is_favorited', 'offers_count', 'created_at', 'updated_at'
        ]
    
    def get_is_favorited(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return obj.favorited_by.filter(user=user).exists()
        return False
    
    def get_offers_count(self, obj):
        return obj.offers.filter(status='pending').count()


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating products"""
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Product
        fields = [
            'category', 'title', 'description', 'condition', 'brand', 'model',
            'price', 'original_price', 'is_negotiable', 'location', 'city',
            'country', 'latitude', 'longitude', 'shipping_options', 'shipping_cost',
            'images'
        ]
    
    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        validated_data['seller'] = self.context['request'].user
        product = Product.objects.create(**validated_data)
        
        # Create product images
        for i, image_data in enumerate(images_data):
            ProductImage.objects.create(
                product=product,
                image=image_data,
                is_main=(i == 0)  # First image is main
            )
        
        return product


class ProductUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating products"""
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Product
        fields = [
            'category', 'title', 'description', 'condition', 'brand', 'model',
            'price', 'original_price', 'is_negotiable', 'location', 'city',
            'country', 'latitude', 'longitude', 'shipping_options', 'shipping_cost',
            'status', 'is_active', 'images'
        ]
        read_only_fields = ['seller', 'views_count', 'favorites_count']
    
    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', [])
        
        # Update product
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Add new images if provided
        if images_data:
            for image_data in images_data:
                ProductImage.objects.create(
                    product=instance,
                    image=image_data,
                    is_main=False
                )
        
        return instance


class OfferSerializer(serializers.ModelSerializer):
    """Serializer for product offers"""
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)
    
    class Meta:
        model = Offer
        fields = [
            'id', 'product', 'product_title', 'buyer', 'buyer_name', 'amount',
            'message', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'buyer', 'buyer_name', 'product_title', 'status', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        product = attrs['product']
        amount = attrs['amount']
        
        # Check if product is available
        if not product.is_available():
            raise serializers.ValidationError("Product is not available for offers")
        
        # Check if user is not the seller
        if product.seller == self.context['request'].user:
            raise serializers.ValidationError("You cannot make an offer on your own product")
        
        # Check if offer amount is reasonable
        if amount <= 0:
            raise serializers.ValidationError("Offer amount must be greater than 0")
        
        # Check if user already has a pending offer
        if Offer.objects.filter(
            product=product,
            buyer=self.context['request'].user,
            status='pending'
        ).exists():
            raise serializers.ValidationError("You already have a pending offer for this product")
        
        attrs['buyer'] = self.context['request'].user
        return attrs


class OfferListSerializer(serializers.ModelSerializer):
    """Serializer for listing offers"""
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)
    buyer_image = serializers.ImageField(source='buyer.profile_image', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)
    product_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Offer
        fields = [
            'id', 'product', 'product_title', 'product_image', 'buyer_name',
            'buyer_image', 'amount', 'message', 'status', 'created_at'
        ]
    
    def get_product_image(self, obj):
        main_image = obj.product.get_main_image()
        if main_image:
            if main_image.image_url:
                return main_image.image_url
            elif main_image.image:
                return self.context['request'].build_absolute_uri(main_image.image.url)
        return None


class FavoriteSerializer(serializers.ModelSerializer):
    """Serializer for favorites"""
    product = ProductListSerializer(read_only=True)
    
    class Meta:
        model = Favorite
        fields = ['id', 'product', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def validate(self, attrs):
        user = self.context['request'].user
        product = attrs['product']
        
        # Check if already favorited
        if Favorite.objects.filter(user=user, product=product).exists():
            raise serializers.ValidationError("Product is already in your favorites")
        
        attrs['user'] = user
        return attrs


class ProductSearchSerializer(serializers.Serializer):
    """Serializer for product search"""
    query = serializers.CharField(required=False)
    category = serializers.IntegerField(required=False)
    min_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    max_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    condition = serializers.CharField(required=False)
    location = serializers.CharField(required=False)
    sort_by = serializers.ChoiceField(
        choices=[
            ('newest', 'Newest'),
            ('price_low', 'Price: Low to High'),
            ('price_high', 'Price: High to Low'),
            ('popular', 'Most Popular'),
        ],
        required=False,
        default='newest'
    ) 