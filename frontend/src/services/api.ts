import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface LoginResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'buyer' | 'seller' | 'both';
  phone_number?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  profile_image?: string;
  average_rating: number;
  total_ratings: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_active_seller: boolean;
  is_verified_seller: boolean;
  is_premium: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  condition: string;
  brand?: string;
  model?: string;
  location: string;
  city: string;
  country: string;
  seller_name: string;
  seller_rating: number;
  category_name: string;
  main_image?: string;
  views_count: number;
  favorites_count: number;
  is_negotiable: boolean;
  is_favorited: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  parent?: number;
  image?: string;
  is_active: boolean;
  products_count: number;
  created_at: string;
}

export interface Offer {
  id: number;
  product: number;
  product_title: string;
  buyer_name: string;
  buyer_image?: string;
  amount: number;
  message?: string;
  status: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  product: Product;
  other_user: {
    id: number;
    username: string;
    profile_image?: string;
    average_rating: number;
  };
  last_message?: {
    content: string;
    sender_name: string;
    created_at: string;
  };
  unread_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation: number;
  sender: number;
  sender_name: string;
  sender_image?: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  product: Product;
  seller_name: string;
  buyer_name: string;
  unit_price: number;
  total_amount: number;
  status: string;
  payment_status: string;
  shipping_method: string;
  created_at: string;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
                refresh: refreshToken,
              });

              const { access } = response.data;
              localStorage.setItem('access_token', access);

              originalRequest.headers.Authorization = `Bearer ${access}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh token failed, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await this.api.post('/users/login/', { username, password });
    return response.data;
  }

  async register(userData: any): Promise<LoginResponse> {
    const response = await this.api.post('/users/register/', userData);
    return response.data;
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await this.api.post('/users/logout/', { refresh_token: refreshToken });
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // User management
  async getProfile(): Promise<User> {
    const response = await this.api.get('/users/profile/');
    return response.data;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await this.api.put('/users/profile/', userData);
    return response.data.user;
  }

  async changePassword(passwords: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<void> {
    await this.api.post('/users/change-password/', passwords);
  }

  async verifySeller(documents: FormData): Promise<void> {
    await this.api.post('/users/verify-seller/', documents, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Products
  async getProducts(params?: any): Promise<{ results: Product[]; count: number }> {
    const response = await this.api.get('/products/', { params });
    return response.data;
  }

  async getProduct(id: number): Promise<Product> {
    const response = await this.api.get(`/products/${id}/`);
    return response.data;
  }

  async createProduct(productData: FormData): Promise<Product> {
    const response = await this.api.post('/products/create/', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateProduct(id: number, productData: FormData): Promise<Product> {
    const response = await this.api.put(`/products/${id}/update/`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteProduct(id: number): Promise<void> {
    await this.api.delete(`/products/${id}/delete/`);
  }

  async searchProducts(params: any): Promise<{ results: Product[]; count: number }> {
    const response = await this.api.get('/products/search/', { params });
    return response.data;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const response = await this.api.get('/products/featured/');
    return response.data;
  }

  async getPopularProducts(): Promise<Product[]> {
    const response = await this.api.get('/products/popular/');
    return response.data;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await this.api.get('/products/categories/');
    return response.data;
  }

  async getCategoryProducts(categoryId: number): Promise<Product[]> {
    const response = await this.api.get(`/products/categories/${categoryId}/products/`);
    return response.data;
  }

  // Offers
  async createOffer(offerData: { product: number; amount: number; message?: string }): Promise<Offer> {
    const response = await this.api.post('/products/offers/create/', offerData);
    return response.data;
  }

  async getMyOffers(): Promise<Offer[]> {
    const response = await this.api.get('/products/offers/my-offers/');
    return response.data;
  }

  async getProductOffers(productId: number): Promise<Offer[]> {
    const response = await this.api.get(`/products/${productId}/offers/`);
    return response.data;
  }

  async acceptOffer(offerId: number): Promise<void> {
    await this.api.post(`/products/offers/${offerId}/accept/`);
  }

  async rejectOffer(offerId: number): Promise<void> {
    await this.api.post(`/products/offers/${offerId}/reject/`);
  }

  // Favorites
  async addToFavorites(productId: number): Promise<void> {
    await this.api.post('/products/favorites/add/', { product: productId });
  }

  async removeFromFavorites(productId: number): Promise<void> {
    await this.api.delete(`/products/favorites/${productId}/remove/`);
  }

  async getFavorites(): Promise<Product[]> {
    const response = await this.api.get('/products/favorites/');
    return response.data;
  }

  // Chat
  async getConversations(): Promise<Conversation[]> {
    const response = await this.api.get('/chat/conversations/');
    return response.data;
  }

  async getConversation(id: number): Promise<Conversation> {
    const response = await this.api.get(`/chat/conversations/${id}/`);
    return response.data;
  }

  async createConversation(productId: number, message?: string): Promise<{ conversation_id: number }> {
    const response = await this.api.post(`/chat/start-conversation/${productId}/`, { message });
    return response.data;
  }

  async sendMessage(messageData: { conversation: number; content: string }): Promise<Message> {
    const response = await this.api.post('/chat/messages/create/', messageData);
    return response.data;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    const response = await this.api.get(`/chat/conversations/${conversationId}/messages/`);
    return response.data;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    const response = await this.api.get('/orders/');
    return response.data;
  }

  async getMyOrders(): Promise<Order[]> {
    const response = await this.api.get('/orders/my-orders/');
    return response.data;
  }

  async getMySales(): Promise<Order[]> {
    const response = await this.api.get('/orders/my-sales/');
    return response.data;
  }

  async createOrder(orderData: any): Promise<Order> {
    const response = await this.api.post('/orders/create/', orderData);
    return response.data;
  }

  async getOrder(id: number): Promise<Order> {
    const response = await this.api.get(`/orders/${id}/`);
    return response.data;
  }

  async updateOrder(id: number, orderData: any): Promise<Order> {
    const response = await this.api.put(`/orders/${id}/update/`, orderData);
    return response.data;
  }

  async markOrderShipped(orderId: number, trackingNumber?: string): Promise<void> {
    await this.api.post(`/orders/${orderId}/ship/`, { tracking_number: trackingNumber });
  }

  async markOrderDelivered(orderId: number): Promise<void> {
    await this.api.post(`/orders/${orderId}/deliver/`);
  }

  async cancelOrder(orderId: number): Promise<void> {
    await this.api.post(`/orders/${orderId}/cancel/`);
  }

  // Shipping methods
  async getShippingMethods(): Promise<any[]> {
    const response = await this.api.get('/orders/shipping-methods/');
    return response.data;
  }

  // Dashboard
  async getUserDashboard(): Promise<any> {
    const response = await this.api.get('/users/dashboard/');
    return response.data;
  }

  async getSellerDashboard(): Promise<any> {
    const response = await this.api.get('/users/seller-dashboard/');
    return response.data;
  }

  // Notifications
  async getNotifications(): Promise<any[]> {
    const response = await this.api.get('/chat/notifications/');
    return response.data;
  }

  async markNotificationRead(notificationId: number): Promise<void> {
    await this.api.post(`/chat/notifications/${notificationId}/read/`);
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.api.post('/chat/notifications/read-all/');
  }

  async getUnreadCounts(): Promise<{ unread_messages: number; unread_notifications: number }> {
    const response = await this.api.get('/chat/unread-counts/');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 