from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q, Count, Sum
from .models import User, UserRating
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    UserUpdateSerializer, UserRatingSerializer, UserRatingListSerializer,
    SellerVerificationSerializer, ChangePasswordSerializer
)
from products.serializers import ProductListSerializer
from orders.serializers import OrderListSerializer


class UserRegistrationView(APIView):
    """User registration endpoint"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'User registered successfully',
                'user': UserProfileSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    """User login endpoint"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Login successful',
                'user': UserProfileSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """User profile management"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get current user profile"""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        """Update user profile"""
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully',
                'user': UserProfileSerializer(request.user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(generics.RetrieveAPIView):
    """Get user details by ID"""
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'


class ChangePasswordView(APIView):
    """Change user password"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Password changed successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SellerVerificationView(APIView):
    """Submit seller verification documents"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = SellerVerificationSerializer(request.user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Verification documents submitted successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserRatingCreateView(generics.CreateAPIView):
    """Create a user rating"""
    serializer_class = UserRatingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(from_user=self.request.user)


class UserRatingListView(generics.ListAPIView):
    """List user ratings"""
    serializer_class = UserRatingListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return UserRating.objects.filter(to_user_id=user_id).order_by('-created_at')


class UserSearchView(generics.ListAPIView):
    """Search users"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        user_type = self.request.query_params.get('user_type', '')
        
        queryset = User.objects.filter(is_active=True)
        
        if query:
            queryset = queryset.filter(
                Q(username__icontains=query) |
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(email__icontains=query)
            )
        
        if user_type:
            queryset = queryset.filter(user_type=user_type)
        
        return queryset.order_by('-created_at')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """User logout"""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Logout successful'})
    except Exception:
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_dashboard(request):
    print("[DEBUG] user_dashboard user:", request.user)
    print("[DEBUG] user_dashboard headers:", dict(request.headers))
    """Get user dashboard data"""
    user = request.user
    
    # Get user statistics
    stats = {
        'total_products': user.products.count(),
        'active_products': user.products.filter(status='active', is_active=True).count(),
        'total_orders': user.orders.count(),
        'total_sales': user.sales.count(),
        'total_offers_received': user.products.aggregate(
            total_offers=Count('offers')
        )['total_offers'] or 0,
        'total_offers_made': user.offers_made.count(),
        'unread_messages': user.buyer_conversations.aggregate(
            unread=Count('messages', filter=Q(messages__is_read=False) & ~Q(messages__sender=user))
        )['unread'] or 0,
        'unread_notifications': user.notifications.filter(is_read=False).count(),
    }
    
    return Response({
        'user': UserProfileSerializer(user).data,
        'stats': stats
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def seller_dashboard(request):
    """Get seller dashboard data"""
    user = request.user
    
    if user.user_type not in ['seller', 'both']:
        return Response({'error': 'User is not a seller'}, status=status.HTTP_403_FORBIDDEN)
    
    # Get seller statistics
    stats = {
        'total_products': user.products.count(),
        'active_products': user.products.filter(status='active', is_active=True).count(),
        'sold_products': user.products.filter(status='sold').count(),
        'total_sales': user.sales.count(),
        'total_revenue': user.sales.aggregate(
            total=Sum('total_amount')
        )['total'] or 0,
        'pending_offers': user.products.aggregate(
            pending=Count('offers', filter=Q(offers__status='pending'))
        )['pending'] or 0,
        'unread_messages': user.seller_conversations.aggregate(
            unread=Count('messages', filter=Q(messages__is_read=False) & ~Q(messages__sender=user))
        )['unread'] or 0,
    }
    
    # Get recent products
    recent_products = user.products.order_by('-created_at')[:5]
    
    # Get recent orders
    recent_orders = user.sales.order_by('-created_at')[:5]
    
    return Response({
        'user': UserProfileSerializer(user).data,
        'stats': stats,
        'recent_products': ProductListSerializer(recent_products, many=True, context={'request': request}).data,
        'recent_orders': OrderListSerializer(recent_orders, many=True, context={'request': request}).data,
    })
