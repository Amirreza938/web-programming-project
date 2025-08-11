from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from django.shortcuts import get_object_or_404
from .models import Category, Product, ProductImage, Offer, Favorite
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ProductCreateSerializer, ProductUpdateSerializer, OfferSerializer,
    OfferListSerializer, FavoriteSerializer, ProductSearchSerializer
)
from users.views import CanSellPermission, CanBuyPermission


class CategoryListView(generics.ListAPIView):
    """List all categories"""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class CategoryDetailView(generics.RetrieveAPIView):
    """Get category details"""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class ProductListCreateView(generics.ListCreateAPIView):
    """List products (GET) and create a new product (POST)"""
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'condition', 'city', 'country', 'is_negotiable']
    search_fields = ['title', 'description', 'brand', 'model']
    ordering_fields = ['price', 'created_at', 'views_count', 'favorites_count']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.request.method == 'POST':
            # Only sellers can create products
            return [CanSellPermission()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True, status='active')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(
                Q(city__icontains=location) |
                Q(country__icontains=location) |
                Q(location__icontains=location)
            )
        return queryset

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateSerializer
        return ProductListSerializer

    def perform_create(self, serializer):
        # Check if user can sell
        if not self.request.user.can_sell():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You don't have permission to create listings")
        
        serializer.save(seller=self.request.user)


class ProductDetailView(generics.RetrieveAPIView):
    """Get product details"""
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class ProductUpdateView(generics.UpdateAPIView):
    """Update a product"""
    serializer_class = ProductUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Product.objects.filter(seller=self.request.user)


class ProductDeleteView(generics.DestroyAPIView):
    """Delete a product"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Product.objects.filter(seller=self.request.user)
    
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


class UserProductsView(generics.ListAPIView):
    """Get products by user"""
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return Product.objects.filter(
            seller_id=user_id, 
            is_active=True
        ).order_by('-created_at')


class MyProductsView(generics.ListAPIView):
    """Get current user's products"""
    serializer_class = ProductListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        print("[DEBUG] MyProductsView user:", self.request.user)
        print("[DEBUG] MyProductsView headers:", dict(self.request.headers))
        return Product.objects.filter(
            seller=self.request.user
        ).order_by('-created_at')


class OfferCreateView(generics.CreateAPIView):
    """Create an offer for a product"""
    serializer_class = OfferSerializer
    permission_classes = [CanBuyPermission]
    
    def create(self, request, *args, **kwargs):
        # Add debug logging
        print(f"Offer creation request data: {request.data}")
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print(f"Error creating offer: {str(e)}")
            raise
    
    def perform_create(self, serializer):
        # Check if user can buy
        if not self.request.user.can_buy():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You don't have permission to make offers")
        
        offer = serializer.save(buyer=self.request.user)
        
        # Add debug logging
        print(f"Creating offer: {offer.id} for product: {offer.product.title}")
        print(f"Buyer: {offer.buyer.username}, Seller: {offer.product.seller.username}")
        
        # Create notification for seller
        from chat.models import Notification
        notification = Notification.objects.create(
            recipient=offer.product.seller,
            sender=self.request.user,
            notification_type='offer',
            title=f'New offer for {offer.product.title}',
            message=f'{self.request.user.username} made an offer of ${offer.amount} for your product',
            related_product=offer.product
        )
        
        print(f"Created notification: {notification.id} for user: {notification.recipient.username}")
        print(f"Notification type: {notification.notification_type}")
        print(f"Total notifications for user: {Notification.objects.filter(recipient=offer.product.seller).count()}")
        
        return offer


class OfferListView(generics.ListAPIView):
    """List offers for a product (seller only)"""
    serializer_class = OfferListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        product = get_object_or_404(Product, id=product_id)
        
        # Only seller can see offers
        if product.seller != self.request.user:
            return Offer.objects.none()
        
        return Offer.objects.filter(product=product).order_by('-created_at')


class MyOffersView(generics.ListAPIView):
    """Get current user's offers"""
    serializer_class = OfferListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Offer.objects.filter(buyer=self.request.user).order_by('-created_at')


class OfferDetailView(generics.RetrieveAPIView):
    """Get offer details"""
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Offer.objects.filter(
            Q(buyer=user) | Q(product__seller=user)
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def accept_offer(request, offer_id):
    """Accept an offer (seller only)"""
    offer = get_object_or_404(Offer, id=offer_id)
    
    if offer.product.seller != request.user:
        return Response(
            {'error': 'You can only accept offers for your own products'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    if offer.status != 'pending':
        return Response(
            {'error': 'Offer is not pending'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    offer.accept()
    
    # Create notification for buyer
    from chat.models import Notification
    Notification.objects.create(
        recipient=offer.buyer,
        sender=request.user,
        notification_type='offer_accepted',
        title=f'Your offer was accepted!',
        message=f'Your offer of ${offer.amount} for "{offer.product.title}" has been accepted',
        related_product=offer.product
    )
    
    return Response({'message': 'Offer accepted successfully'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_offer(request, offer_id):
    """Reject an offer (seller only)"""
    offer = get_object_or_404(Offer, id=offer_id)
    
    if offer.product.seller != request.user:
        return Response(
            {'error': 'You can only reject offers for your own products'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    if offer.status != 'pending':
        return Response(
            {'error': 'Offer is not pending'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    offer.reject()
    
    # Create notification for buyer
    from chat.models import Notification
    Notification.objects.create(
        recipient=offer.buyer,
        sender=request.user,
        notification_type='offer_rejected',
        title=f'Your offer was rejected',
        message=f'Your offer of ${offer.amount} for "{offer.product.title}" has been rejected',
        related_product=offer.product
    )
    
    return Response({'message': 'Offer rejected successfully'})
    
    if offer.product.seller != request.user:
        return Response(
            {'error': 'You can only reject offers for your own products'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    if offer.status != 'pending':
        return Response(
            {'error': 'Offer is not pending'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    offer.reject()
    return Response({'message': 'Offer rejected successfully'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_offer(request, offer_id):
    """Cancel an offer (buyer only)"""
    offer = get_object_or_404(Offer, id=offer_id)
    
    if offer.buyer != request.user:
        return Response(
            {'error': 'You can only cancel your own offers'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    if offer.status != 'pending':
        return Response(
            {'error': 'Offer is not pending'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Mark offer as cancelled or delete it
    offer.delete()  # or offer.status = 'cancelled'; offer.save()
    
    return Response({'message': 'Offer cancelled successfully'})


class FavoriteCreateView(generics.CreateAPIView):
    """Add product to favorites"""
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FavoriteListView(generics.ListAPIView):
    """Get user's favorites"""
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).order_by('-created_at')


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_favorite(request, product_id):
    """Remove product from favorites"""
    try:
        favorite = Favorite.objects.get(
            user=request.user, 
            product_id=product_id
        )
        favorite.delete()
        return Response({'message': 'Product removed from favorites'})
    except Favorite.DoesNotExist:
        return Response(
            {'error': 'Product not in favorites'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_favorite(request, product_id):
    """Toggle product in favorites (add if not favorited, remove if favorited)"""
    try:
        favorite = Favorite.objects.get(
            user=request.user, 
            product_id=product_id
        )
        # Product is already favorited, remove it
        favorite.delete()
        return Response({'message': 'Product removed from favorites', 'is_favorited': False})
    except Favorite.DoesNotExist:
        # Product is not favorited, add it
        try:
            product = Product.objects.get(id=product_id)
            Favorite.objects.create(user=request.user, product=product)
            return Response({'message': 'Product added to favorites', 'is_favorited': True})
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_products(request):
    """Advanced product search"""
    serializer = ProductSearchSerializer(data=request.query_params)
    if serializer.is_valid():
        data = serializer.validated_data
        
        queryset = Product.objects.filter(is_active=True, status='active')
        
        # Text search
        if data.get('query'):
            query = data['query']
            queryset = queryset.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(brand__icontains=query) |
                Q(model__icontains=query)
            )
        
        # Category filter
        if data.get('category'):
            queryset = queryset.filter(category_id=data['category'])
        
        # Price range
        if data.get('min_price'):
            queryset = queryset.filter(price__gte=data['min_price'])
        if data.get('max_price'):
            queryset = queryset.filter(price__lte=data['max_price'])
        
        # Condition filter
        if data.get('condition'):
            queryset = queryset.filter(condition=data['condition'])
        
        # Location filter
        if data.get('location'):
            location = data['location']
            queryset = queryset.filter(
                Q(city__icontains=location) |
                Q(country__icontains=location) |
                Q(location__icontains=location)
            )
        
        # Sorting
        sort_by = data.get('sort_by', 'newest')
        if sort_by == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort_by == 'price_low':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_high':
            queryset = queryset.order_by('-price')
        elif sort_by == 'popular':
            queryset = queryset.order_by('-views_count')
        
        # Return results
        serializer = ProductListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def featured_products(request):
    """Get featured products"""
    products = Product.objects.filter(
        is_active=True, 
        status='active', 
        is_featured=True
    ).order_by('-created_at')[:10]
    
    serializer = ProductListSerializer(products, many=True, context={'request': request})
    return Response({
        'results': serializer.data,
        'count': len(serializer.data),
        'next': None,
        'previous': None
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def popular_products(request):
    """Get popular products based on views"""
    products = Product.objects.filter(
        is_active=True, 
        status='active'
    ).order_by('-views_count')[:10]
    
    serializer = ProductListSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def category_products(request, category_id):
    """Get products by category"""
    products = Product.objects.filter(
        category_id=category_id,
        is_active=True,
        status='active'
    ).order_by('-created_at')
    
    serializer = ProductListSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_product_rating(request, product_id):
    """Create a rating for a product"""
    try:
        product = Product.objects.get(id=product_id)
        
        # Check if user is trying to rate their own product
        if product.seller == request.user:
            return Response(
                {'error': 'You cannot rate your own product'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user has already rated this product
        from .models import ProductRating
        existing_rating = ProductRating.objects.filter(
            user=request.user,
            product=product
        ).first()
        
        if existing_rating:
            # Update existing rating
            existing_rating.rating = request.data.get('rating')
            existing_rating.review = request.data.get('review', '')
            existing_rating.save()
            
            # Update product's average rating
            product.update_rating()
            
            return Response({
                'message': 'Rating updated successfully',
                'rating': {
                    'id': existing_rating.id,
                    'rating': existing_rating.rating,
                    'review': existing_rating.review
                }
            })
        else:
            # Create new rating
            rating = ProductRating.objects.create(
                user=request.user,
                product=product,
                rating=request.data.get('rating'),
                review=request.data.get('review', '')
            )
            
            # Update product's average rating
            product.update_rating()
            
            return Response({
                'message': 'Rating created successfully',
                'rating': {
                    'id': rating.id,
                    'rating': rating.rating,
                    'review': rating.review
                }
            })
            
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
def get_product_ratings(request, product_id):
    """Get all ratings for a product"""
    try:
        product = Product.objects.get(id=product_id)
        from .models import ProductRating
        ratings = ProductRating.objects.filter(product=product).order_by('-created_at')
        
        ratings_data = []
        for rating in ratings:
            ratings_data.append({
                'id': rating.id,
                'user': rating.user.username,
                'user_image': rating.user.profile_image.url if rating.user.profile_image else None,
                'rating': rating.rating,
                'review': rating.review,
                'created_at': rating.created_at.isoformat()
            })
        
        return Response({
            'results': ratings_data,
            'average_rating': product.average_rating,
            'total_ratings': product.total_ratings
        })
        
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# ...existing code...