import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types
export interface ApiResponse<T = any> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  user_type: 'admin' | 'buyer' | 'seller' | 'both';
  phone_number?: string;
  phone?: string; // Alias for phone_number
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  zip_code?: string; // Alias for postal_code
  profile_image?: string;
  bio?: string;
  average_rating: number;
  total_ratings: number;
  verification_status: 'pending' | 'verified' | 'rejected' | 'not_required';
  account_approved: boolean;
  is_active_seller: boolean;
  is_verified_seller: boolean;
  is_verified?: boolean; // Alias for is_verified_seller
  is_premium: boolean;
  can_buy: boolean;
  can_sell: boolean;
  is_admin_user: boolean;
  needs_verification: boolean;
  created_at: string;
  date_joined?: string; // Alias for created_at
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  condition: string;
  category: number;
  category_name: string;
  seller: number;
  seller_id?: number;
  seller_name: string;
  seller_image?: string;
  seller_rating?: number;
  seller_ratings_count?: number;
  seller_verified?: boolean;
  location: string;
  brand?: string;
  model?: string;
  year?: number;
  is_negotiable: boolean;
  is_featured: boolean;
  shipping_method?: string;
  payment_method?: string;
  return_policy?: string;
  views_count: number;
  favorites_count: number;
  main_image?: string;
  images?: Array<{ id: number; image: string; is_main: boolean }>;
  is_favorited?: boolean;
  status: 'active' | 'sold' | 'expired' | 'inactive' | 'pending_verification';
  is_verified?: boolean;
  verified_by?: number;
  verified_at?: string;
  verification_notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  parent?: number | null;
  image?: string | null;
  is_active?: boolean;
  products_count?: number;
  created_at?: string;
}

export interface Offer {
  id: number;
  product: number;
  buyer: number;
  buyer_name: string;
  buyer_image?: string;
  product_title: string;
  product_image?: string;
  amount: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Conversation {
  id: number;
  product: number;
  product_title: string;
  product_price: number;
  buyer: number;
  seller: number;
  other_user: number;
  other_user_name: string;
  other_user_image?: string;
  last_message?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation: number;
  sender: number;
  content: string;
  is_sender: boolean;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  product: any; // This should be a product object from ProductListSerializer
  seller: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    user_type: string;
    phone_number?: string;
    address?: string;
    city?: string;
    country?: string;
    postal_code?: string;
    profile_image?: string;
    average_rating: number;
    total_ratings: number;
    verification_status: string;
    is_active_seller: boolean;
    is_verified_seller: boolean;
    is_premium: boolean;
    created_at: string;
  };
  buyer: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    user_type: string;
    phone_number?: string;
    address?: string;
    city?: string;
    country?: string;
    postal_code?: string;
    profile_image?: string;
    average_rating: number;
    total_ratings: number;
    verification_status: string;
    is_active_seller: boolean;
    is_verified_seller: boolean;
    is_premium: boolean;
    created_at: string;
  };
  accepted_offer?: number;
  unit_price: number;
  shipping_cost: number;
  total_amount: number;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  shipping_postal_code: string;
  shipping_phone: string;
  shipping_method: string;
  tracking_number?: string;
  status: string;
  payment_status: string;
  status_history?: any[];
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
  // Legacy fields for backward compatibility
  product_title?: string;
  product_image?: string;
  buyer_name?: string;
  seller_name?: string;
  quantity?: number;
  conversation_id?: number;
}

export interface DashboardData {
  total_sales: number;
  active_listings: number;
  total_views: number;
  total_favorites: number;
  monthly_sales: number;
  conversion_rate: number;
  top_categories?: Array<{ name: string; sales: number }>;
}

// Admin-specific interfaces
export interface AdminDashboardStats {
  pending_verifications: number;
  total_users: number;
  total_buyers: number;
  total_sellers: number;
  verified_sellers: number;
  pending_sellers: number;
  rejected_sellers: number;
}

export interface VerificationRequest {
  id: number;
  user: number;
  user_details: User;
  id_card_front: string;
  id_card_back: string;
  additional_documents?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  reviewed_by?: number;
  reviewer_name?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductReport {
  id: number;
  product: {
    id: number;
    title: string;
    seller: string;
  };
  reporter: string;
  report_type: 'irrelevant' | 'harassment' | 'spam' | 'inappropriate' | 'fake' | 'fraud' | 'duplicate' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  admin_notes?: string;
}

export interface PendingProductReport {
  id: number;
  product_title: string;
  report_type: string;
  description: string;
  reporter: string;
  created_at: string;
}

export interface ProductReport {
  id: number;
  product: {
    id: number;
    title: string;
    seller: string;
  };
  reporter: string;
  report_type: 'irrelevant' | 'harassment' | 'spam' | 'inappropriate' | 'fake' | 'fraud' | 'duplicate' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  admin_notes?: string;
}

export interface PendingProductReport {
  id: number;
  product_title: string;
  report_type: string;
  description: string;
  reporter: string;
  created_at: string;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Only set Content-Type to application/json if it's not FormData
        if (!(config.data instanceof FormData)) {
          config.headers['Content-Type'] = 'application/json';
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            const response = await axios.post(
              `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/token/refresh/`,
              { refresh: refreshToken }
            );

            const { access } = response.data;
            localStorage.setItem('access_token', access);

            originalRequest.headers.Authorization = `Bearer ${access}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(userData: any): Promise<LoginResponse> {
    const response = await this.api.post('/auth/register/', userData);
    return response.data;
  }

  async login(credentials: { username: string; password: string }): Promise<LoginResponse> {
    const response = await this.api.post('/auth/login/', credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout/');
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get('/auth/profile/');
    return response.data;
  }

  async getUserProfile(userId: number): Promise<User> {
    const response = await this.api.get(`/users/profile/${userId}/`);
    return response.data;
  }

  async updateProfile(userData: any): Promise<User> {
    const response = await this.api.put('/auth/profile/', userData);
    return response.data;
  }

  async changePassword(passwords: { old_password: string; new_password: string }): Promise<void> {
    await this.api.post('/auth/change-password/', passwords);
  }

  // User endpoints
  async getUser(userId: number): Promise<User> {
    const response = await this.api.get(`/users/${userId}/`);
    return response.data;
  }

  async searchUsers(query: string): Promise<User[]> {
    const response = await this.api.get(`/users/search/?q=${query}`);
    return response.data.results;
  }

  async getUserDashboard(): Promise<DashboardData> {
    const response = await this.api.get('/users/dashboard/');
    return response.data;
  }

  async getSellerDashboard(): Promise<DashboardData> {
    const response = await this.api.get('/users/seller-dashboard/');
    return response.data;
  }

  async verifySeller(verificationData: any): Promise<void> {
    await this.api.post('/users/verify-seller/', verificationData);
  }

  async createUserRating(userId: number, ratingData: any): Promise<void> {
    await this.api.post(`/users/${userId}/rate/`, ratingData);
  }

  async getUserRatings(userId: number): Promise<any[]> {
    const response = await this.api.get(`/users/${userId}/ratings/`);
    return response.data.results;
  }

  // Product endpoints
  async getProducts(params?: any): Promise<ApiResponse<Product>> {
    const response = await this.api.get('/products/', { params });
    return response.data;
  }

  async getProduct(productId: number): Promise<Product> {
    const response = await this.api.get(`/products/${productId}/`);
    return response.data;
  }

  async createProduct(productData: FormData): Promise<Product> {
    const response = await this.api.post('/products/', productData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async updateProduct(productId: number, productData: any): Promise<Product> {
    const response = await this.api.put(`/products/${productId}/`, productData);
    return response.data;
  }

  async deleteProduct(productId: number): Promise<void> {
    await this.api.delete(`/products/${productId}/`);
  }

  async getUserProducts(params?: any): Promise<ApiResponse<Product>> {
    const response = await this.api.get('/products/my-products/', { params });
    return response.data;
  }

  async searchProducts(params?: any): Promise<ApiResponse<Product>> {
    const response = await this.api.get('/products/search/', { params });
    return response.data;
  }

  async getFeaturedProducts(): Promise<ApiResponse<Product>> {
    const response = await this.api.get('/products/featured/');
    return response.data;
  }

  async getPopularProducts(): Promise<ApiResponse<Product>> {
    const response = await this.api.get('/products/popular/');
    return response.data;
  }

  async getCategories(): Promise<Category[]> {
    const response = await this.api.get('/products/categories/');
    return response.data.results;
  }

  // Offer endpoints
  async createOffer(productId: number, offerData: { amount: number; message?: string }): Promise<Offer> {
    const payload = { ...offerData, product: productId };
    console.log('Creating offer with payload:', payload);
    try {
      const response = await this.api.post('/products/offers/create/', payload);
      return response.data;
    } catch (error: any) {
      console.error('Offer creation error:', error.response?.data || error.message);
      
      // Check if it's a duplicate offer error
      if (error.response?.data?.non_field_errors?.some((err: any) => 
        err.toString().includes('already have a pending offer'))) {
        // Get user's existing offers to show them
        try {
          const existingOffers = await this.getMyOffers();
          const productOffer = existingOffers.find(offer => offer.product === productId && offer.status === 'pending');
          if (productOffer) {
            const enhancedError = new Error('You already have a pending offer for this product');
            (enhancedError as any).existingOffer = productOffer;
            throw enhancedError;
          }
        } catch (offersError) {
          console.error('Error fetching existing offers:', offersError);
        }
      }
      
      throw error;
    }
  }

  async getProductOffers(productId: number): Promise<Offer[]> {
    const response = await this.api.get(`/products/${productId}/offers/`);
    return response.data.results;
  }

  async getMyOffers(): Promise<Offer[]> {
    const response = await this.api.get('/products/offers/my-offers/');
    return response.data.results || response.data;
  }

  async getMyReceivedOffers(): Promise<Offer[]> {
    const response = await this.api.get('/products/offers/received/');
    return response.data.results || response.data;
  }

  async getOffer(offerId: number): Promise<Offer> {
    const response = await this.api.get(`/products/offers/${offerId}/`);
    return response.data;
  }

  async acceptOffer(offerId: number): Promise<void> {
    await this.api.post(`/products/offers/${offerId}/accept/`);
  }

  async rejectOffer(offerId: number): Promise<void> {
    await this.api.post(`/products/offers/${offerId}/reject/`);
  }

  async cancelOffer(offerId: number): Promise<void> {
    await this.api.post(`/products/offers/${offerId}/cancel/`);
  }

  // Favorite endpoints
  async getFavorites(): Promise<Product[]> {
    const response = await this.api.get('/products/favorites/');
    console.log('API getFavorites response:', response.data);
    console.log('API getFavorites results:', response.data.results);
    return response.data.results;
  }

  async addToFavorites(productId: number): Promise<void> {
    await this.api.post('/products/favorites/add/', { product: productId });
  }

  async removeFromFavorites(productId: number): Promise<void> {
    await this.api.delete(`/products/favorites/${productId}/remove/`);
  }

  async toggleFavorite(productId: number): Promise<void> {
    await this.api.post(`/products/${productId}/toggle-favorite/`);
  }

  // Chat endpoints
  async getConversations(): Promise<Conversation[]> {
    const response = await this.api.get('/chat/conversations/');
    return response.data.results || response.data;
  }

  async getDirectConversations(): Promise<Conversation[]> {
    const response = await this.api.get('/chat/direct-conversations/');
    return response.data.results || response.data;
  }

  async getConversation(conversationId: number): Promise<Conversation> {
    const response = await this.api.get(`/chat/conversations/${conversationId}/`);
    return response.data;
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    const response = await this.api.get(`/chat/conversations/${conversationId}/messages/`);
    return response.data.results || response.data;
  }

  async getDirectConversationMessages(conversationId: number): Promise<Message[]> {
    const response = await this.api.get(`/chat/direct-conversations/${conversationId}/messages/`);
    return response.data.results || response.data;
  }

  async sendMessage(conversationId: number, content: string): Promise<Message> {
    const response = await this.api.post('/chat/messages/create/', {
      conversation: conversationId,
      content: content
    });
    return response.data;
  }

  async sendDirectMessage(conversationId: number, content: string): Promise<Message> {
    const response = await this.api.post('/chat/direct-messages/create/', {
      conversation: conversationId,
      content: content
    });
    return response.data;
  }

  async startDirectConversation(userId: number, message?: string): Promise<{ conversation_id: number }> {
    const response = await this.api.post(`/chat/start-direct-conversation/${userId}/`, {
      message: message
    });
    return response.data;
  }

  async startConversation(productId: number, message: string): Promise<any> {
    const response = await this.api.post(`/chat/start-conversation/${productId}/`, {
      message: message
    });
    return response.data;
  }

  async createConversation(productId: number): Promise<any> {
    const response = await this.api.post(`/chat/start-conversation/${productId}/`, {
      message: 'Hi, I\'m interested in this product.'
    });
    return response.data;
  }

  async getUnreadCounts(): Promise<any> {
    const response = await this.api.get('/chat/unread-counts/');
    return response.data;
  }

  // Order endpoints
  async getOrders(params?: any): Promise<ApiResponse<Order>> {
    const response = await this.api.get('/orders/', { params });
    return response.data;
  }

  async getUserOrders(params?: any): Promise<ApiResponse<Order>> {
    const response = await this.api.get('/orders/my-orders/', { params });
    return response.data;
  }

  async getUserSales(params?: any): Promise<ApiResponse<Order>> {
    const response = await this.api.get('/orders/my-sales/', { params });
    return response.data;
  }

  async getOrder(orderId: number): Promise<Order> {
    const response = await this.api.get(`/orders/${orderId}/`);
    return response.data;
  }

  async createOrder(orderData: any): Promise<Order> {
    const response = await this.api.post('/orders/create/', orderData);
    return response.data;
  }

  async updateOrder(orderId: number, orderData: any): Promise<Order> {
    const response = await this.api.put(`/orders/${orderId}/`, orderData);
    return response.data;
  }

  async updateOrderStatus(orderId: number, status: string): Promise<void> {
    await this.api.post(`/orders/${orderId}/status/`, { status });
  }

  async shipOrder(orderId: number): Promise<void> {
    await this.api.post(`/orders/${orderId}/ship/`);
  }

  async deliverOrder(orderId: number): Promise<void> {
    await this.api.post(`/orders/${orderId}/deliver/`);
  }

  async cancelOrder(orderId: number): Promise<void> {
    await this.api.post(`/orders/${orderId}/cancel/`);
  }

  async getShippingMethods(): Promise<any[]> {
    const response = await this.api.get('/orders/shipping-methods/');
    return response.data.results;
  }

  async trackOrder(orderId: number): Promise<any> {
    const response = await this.api.get(`/orders/${orderId}/tracking/`);
    return response.data;
  }

  async getOrderTracking(orderId: number): Promise<any> {
    const response = await this.api.get(`/orders/${orderId}/tracking/`);
    return response.data;
  }

  async getOrderStats(): Promise<any> {
    const response = await this.api.get('/orders/stats/');
    return response.data;
  }

  async getRecentOrders(): Promise<Order[]> {
    const response = await this.api.get('/orders/recent/');
    return response.data.results;
  }

  // Dispute endpoints
  async getDisputes(): Promise<any[]> {
    const response = await this.api.get('/orders/disputes/');
    return response.data.results;
  }

  async createDispute(orderId: number, disputeData: any): Promise<any> {
    const response = await this.api.post(`/orders/${orderId}/dispute/`, disputeData);
    return response.data;
  }

  async getDispute(disputeId: number): Promise<any> {
    const response = await this.api.get(`/orders/disputes/${disputeId}/`);
    return response.data;
  }

  async resolveDispute(disputeId: number, resolution: any): Promise<void> {
    await this.api.post(`/orders/disputes/${disputeId}/resolve/`, resolution);
  }

  async addDisputeMessage(disputeId: number, message: string): Promise<any> {
    const response = await this.api.post(`/orders/disputes/${disputeId}/messages/`, {
      content: message,
    });
    return response.data;
  }

  // Admin APIs
  async getAdminStats(period: string = 'week'): Promise<any> {
    const response = await this.api.get(`/users/admin/stats/?period=${period}`);
    return response.data;
  }

  async getAdminActivities(): Promise<any> {
    const response = await this.api.get('/users/admin/activities/');
    return response.data;
  }

  async getSystemHealth(): Promise<any> {
    const response = await this.api.get('/users/admin/system-health/');
    return response.data;
  }

  // Admin endpoints
  async getAdminDashboard(): Promise<AdminDashboardStats> {
    const response = await this.api.get('/users/admin/dashboard/');
    return response.data;
  }

  async getVerificationRequests(status?: string): Promise<VerificationRequest[]> {
    const params = status ? { status } : {};
    const response = await this.api.get('/users/admin/verification-requests/', { params });
    return response.data.results;
  }

  async getVerificationRequest(id: number): Promise<VerificationRequest> {
    const response = await this.api.get(`/users/admin/verification-requests/${id}/`);
    return response.data;
  }

  async updateVerificationRequest(id: number, data: { status: string; admin_notes?: string }): Promise<VerificationRequest> {
    const response = await this.api.patch(`/users/admin/verification-requests/${id}/`, data);
    return response.data;
  }

  async getPendingUsers(): Promise<User[]> {
    const response = await this.api.get('/users/admin/pending-users/');
    return response.data.results;
  }

  async getAdminUsersList(params?: { type?: string; verification_status?: string }): Promise<User[]> {
    const response = await this.api.get('/users/admin/users/', { params });
    return response.data;
  }

  async approveUser(userId: number): Promise<{ message: string; user: User }> {
    const response = await this.api.post(`/users/admin/approve-user/${userId}/`);
    return response.data;
  }

  async rejectUser(userId: number, reason?: string): Promise<{ message: string; user: User }> {
    const response = await this.api.post(`/users/admin/reject-user/${userId}/`, { reason });
    return response.data;
  }

  // Notification methods
  async getNotifications(): Promise<any[]> {
    const response = await this.api.get('/notifications/');
    return response.data.results || response.data;
  }

  async markNotificationRead(notificationId: number): Promise<void> {
    await this.api.patch(`/notifications/${notificationId}/mark-read/`);
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.api.post('/notifications/mark-all-read/');
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await this.api.delete(`/notifications/${notificationId}/`);
  }

  // Order approval methods (for sellers)
  async approveOrder(orderId: number): Promise<void> {
    await this.api.post(`/orders/${orderId}/approve/`, { action: 'approve' });
  }

  async rejectOrder(orderId: number): Promise<void> {
    await this.api.post(`/orders/${orderId}/approve/`, { action: 'reject' });
  }

  // Product rating methods
  async createProductRating(productId: number, ratingData: any): Promise<any> {
    const response = await this.api.post(`/products/${productId}/rate/`, ratingData);
    return response.data;
  }

  async getProductRatings(productId: number): Promise<any> {
    const response = await this.api.get(`/products/${productId}/ratings/`);
    return response.data;
  }

  // Verification methods
  async getVerificationStatus(): Promise<any> {
    const response = await this.api.get('/users/verification-status/');
    return response.data;
  }

  async submitVerification(data: FormData): Promise<any> {
    const response = await this.api.post('/users/submit-verification/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Product verification methods (Admin)
  async getPendingProducts(): Promise<Product[]> {
    const response = await this.api.get('/users/admin/products/pending/');
    return response.data;
  }

  async verifyProduct(productId: number, notes?: string): Promise<{ message: string }> {
    const response = await this.api.post(`/users/admin/products/${productId}/verify/`, { notes });
    return response.data;
  }

  async rejectProduct(productId: number, reason: string): Promise<{ message: string }> {
    const response = await this.api.post(`/users/admin/products/${productId}/reject/`, { reason });
    return response.data;
  }

  // Product reporting methods
  async reportProduct(productId: number, reportData: { report_type: string; description: string }): Promise<{ message: string; report_id: number }> {
    const response = await this.api.post(`/products/products/${productId}/report/`, reportData);
    return response.data;
  }

  async getMyReports(): Promise<{ results: ProductReport[]; count: number }> {
    const response = await this.api.get('/products/my-reports/');
    return response.data;
  }

  // Admin product report management
  async getPendingReports(): Promise<PendingProductReport[]> {
    const response = await this.api.get('/users/admin/reports/pending/');
    return response.data;
  }

  async updateReportStatus(reportId: number, action: 'review' | 'resolve' | 'dismiss', notes?: string): Promise<{ message: string }> {
    const response = await this.api.post(`/users/admin/reports/${reportId}/update/`, { action, notes });
    return response.data;
  }
}

export const apiService = new ApiService();