from django.urls import path
from . import views

urlpatterns = [
    # Categories
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('categories/<int:category_id>/products/', views.category_products, name='category-products'),
    
    # Products
    path('', views.ProductListCreateView.as_view(), name='product-list-create'),
    path('<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('<int:pk>/update/', views.ProductUpdateView.as_view(), name='product-update'),
    path('<int:pk>/delete/', views.ProductDeleteView.as_view(), name='product-delete'),
    
    # User products
    path('user/<int:user_id>/', views.UserProductsView.as_view(), name='user-products'),
    path('my-products/', views.MyProductsView.as_view(), name='my-products'),
    
    # Offers
    path('offers/create/', views.OfferCreateView.as_view(), name='offer-create'),
    path('offers/my-offers/', views.MyOffersView.as_view(), name='my-offers'),
    path('offers/<int:pk>/', views.OfferDetailView.as_view(), name='offer-detail'),
    path('<int:product_id>/offers/', views.OfferListView.as_view(), name='product-offers'),
    path('offers/<int:offer_id>/accept/', views.accept_offer, name='accept-offer'),
    path('offers/<int:offer_id>/reject/', views.reject_offer, name='reject-offer'),
    
    # Favorites
    path('favorites/', views.FavoriteListView.as_view(), name='favorite-list'),
    path('favorites/add/', views.FavoriteCreateView.as_view(), name='add-favorite'),
    path('favorites/<int:product_id>/remove/', views.remove_favorite, name='remove-favorite'),
    path('<int:product_id>/toggle-favorite/', views.toggle_favorite, name='toggle-favorite'),
    
    # Search and discovery
    path('search/', views.search_products, name='search-products'),
    path('featured/', views.featured_products, name='featured-products'),
    path('popular/', views.popular_products, name='popular-products'),
] 