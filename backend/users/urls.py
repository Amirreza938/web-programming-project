from django.urls import path
from . import views
from . import admin_views

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

    # Admin endpoints (staff only)
    path('admin/stats/', admin_views.admin_stats, name='admin-stats'),
    path('admin/activities/', admin_views.admin_activities, name='admin-activities'),
    path('admin/system-health/', admin_views.system_health, name='system-health'),
]