from django.urls import path
from . import views

urlpatterns = [
    # Orders
    path('', views.OrderListView.as_view(), name='order-list'),
    path('create/', views.OrderCreateView.as_view(), name='order-create'),
    path('<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/update/', views.OrderUpdateView.as_view(), name='order-update'),
    path('my-orders/', views.MyOrdersView.as_view(), name='my-orders'),
    path('my-sales/', views.MySalesView.as_view(), name='my-sales'),
    
    # Order actions
    path('<int:order_id>/ship/', views.mark_order_shipped, name='mark-order-shipped'),
    path('<int:order_id>/deliver/', views.mark_order_delivered, name='mark-order-delivered'),
    path('<int:order_id>/cancel/', views.cancel_order, name='cancel-order'),
    
    # Shipping
    path('shipping-methods/', views.ShippingMethodListView.as_view(), name='shipping-methods'),
    
    # Order tracking
    path('track/', views.track_order, name='track-order'),
    
    # Order statistics
    path('statistics/', views.order_statistics, name='order-statistics'),
    path('recent/', views.recent_orders, name='recent-orders'),
    
    # Disputes
    path('disputes/', views.DisputeListView.as_view(), name='dispute-list'),
    path('disputes/create/', views.DisputeCreateView.as_view(), name='dispute-create'),
    path('disputes/<int:pk>/', views.DisputeDetailView.as_view(), name='dispute-detail'),
    path('disputes/<int:dispute_id>/resolve/', views.resolve_dispute, name='resolve-dispute'),
    
    # Dispute messages
    path('disputes/<int:dispute_id>/messages/', views.DisputeMessageListView.as_view(), name='dispute-messages'),
    path('disputes/messages/create/', views.DisputeMessageCreateView.as_view(), name='dispute-message-create'),
] 