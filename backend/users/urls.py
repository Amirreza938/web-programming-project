from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('login/', views.UserLoginView.as_view(), name='user-login'),
    path('logout/', views.logout_view, name='user-logout'),
    
    # Profile management
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile/<int:id>/', views.UserDetailView.as_view(), name='user-detail'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    
    # Seller verification
    path('verify-seller/', views.SellerVerificationView.as_view(), name='verify-seller'),
    path('verification-status/', views.VerificationStatusView.as_view(), name='verification-status'),
    
    # User ratings
    path('ratings/create/', views.UserRatingCreateView.as_view(), name='create-rating'),
    path('ratings/<int:user_id>/', views.UserRatingListView.as_view(), name='user-ratings'),
    
    # User search
    path('search/', views.UserSearchView.as_view(), name='user-search'),
    
    # Dashboards
    path('dashboard/', views.user_dashboard, name='user-dashboard'),
    path('seller-dashboard/', views.seller_dashboard, name='seller-dashboard'),
    
    # Admin endpoints
    path('admin/dashboard/', views.admin_dashboard, name='admin-dashboard'),
    path('admin/verification-requests/', views.VerificationRequestListView.as_view(), name='verification-requests'),
    path('admin/verification-requests/<int:pk>/', views.VerificationRequestDetailView.as_view(), name='verification-request-detail'),
    path('admin/pending-users/', views.PendingUsersListView.as_view(), name='pending-users'),
    path('admin/users/', views.users_list, name='admin-users-list'),
    path('admin/approve-user/<int:user_id>/', views.approve_user, name='approve-user'),
    path('admin/reject-user/<int:user_id>/', views.reject_user, name='reject-user'),
]