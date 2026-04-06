// lib/orderService.ts
import { apiRequest } from './api';
import { ApiResponse } from '../types';
import { Order, OrderItem, OrderStats, OrderItemRequest, CreateOrderRequest } from '../types';

// Helper function to get full image URL
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '/placeholder-image.jpg';
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
  return `${baseUrl}${imagePath}`;
};

// Helper function to transform order item images
const transformOrderItemImages = (item: any) => {
  if (item.productSnapshot?.images) {
    item.productSnapshot.images = item.productSnapshot.images.map((image: any) => ({
      ...image,
      url: getImageUrl(image.url)
    }));
  }
  
  if (item.product?.images) {
    item.product.images = item.product.images.map((image: any) => ({
      ...image,
      url: getImageUrl(image.url)
    }));
  }
  
  return item;
};

// Helper function to transform order images
const transformOrderImages = (order: any) => {
  if (order.orderItems && Array.isArray(order.orderItems)) {
    order.orderItems = order.orderItems.map(transformOrderItemImages);
  }
  return order;
};

export const orderService = {
  /**
   * Create a new order
   */
  createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
    try {
      console.log('📦 Creating order:', orderData);

      const response = await apiRequest('/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      }) as ApiResponse;

      console.log('✅ ORDER CREATION RESPONSE:', response);

      let order: Order;

      if (response.success && response.data?.order) {
        order = response.data.order;
      } else if (response.order) {
        order = response.order;
      } else if (response.id) {
        order = response;
      } else {
        throw new Error(response.error || response.message || 'Failed to create order');
      }

      // Transform images in the created order
      return transformOrderImages(order);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  /**
   * Get order by ID
   */
  getOrderById: async (id: number): Promise<Order | null> => {
    try {
      const response = await apiRequest(`/orders/${id}`) as ApiResponse;
      
      let order: Order | null = null;

      if (response.success && response.data?.order) {
        order = response.data.order;
      } else if (response.order) {
        order = response.order;
      } else if (response.id) {
        order = response;
      } else if (response.data) {
        order = response.data;
      }

      // Transform images if order exists
      return order ? transformOrderImages(order) : null;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  /**
   * Get order by order number
   */
  getOrderByNumber: async (orderNumber: string): Promise<Order | null> => {
    try {
      const response = await apiRequest(`/orders/number/${orderNumber}`) as ApiResponse;
      
      let order: Order | null = null;

      if (response.success && response.data?.order) {
        order = response.data.order;
      } else if (response.order) {
        order = response.order;
      } else if (response.orderNumber === orderNumber) {
        order = response;
      }

      // Transform images if order exists
      return order ? transformOrderImages(order) : null;
    } catch (error) {
      console.error('Error fetching order by number:', error);
      throw error;
    }
  },

  /**
   * Get user orders
   */
  getUserOrders: async (userId: number, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ orders: Order[]; pagination: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);

      const queryString = queryParams.toString();
      const url = `/orders/user/${userId}${queryString ? `?${queryString}` : ''}`;

      const response = await apiRequest(url) as ApiResponse;

      let ordersArray: Order[] = [];
      let paginationData: any = {};

      if (response.success && response.data) {
        ordersArray = response.data.orders || [];
        paginationData = response.data.pagination || {};
      } else if (response.orders && Array.isArray(response.orders)) {
        ordersArray = response.orders;
        paginationData = response.pagination || {};
      } else if (Array.isArray(response)) {
        ordersArray = response;
        paginationData = {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: response.length,
          pages: Math.ceil(response.length / (params?.limit || 10))
        };
      }

      // Transform images in all orders
      const transformedOrders = ordersArray.map(transformOrderImages);

      return {
        orders: transformedOrders,
        pagination: paginationData
      };
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  /**
   * Get order statistics
   */
  getOrderStats: async (): Promise<OrderStats> => {
    try {
      const response = await apiRequest('/orders/stats/orders') as ApiResponse;

      let stats: OrderStats;

      if (response.success && response.data?.stats) {
        stats = response.data.stats;
      } else if (response.stats) {
        stats = response.stats;
      } else {
        throw new Error('Failed to fetch order statistics');
      }

      // Transform images in recent orders
      if (stats.recentOrders) {
        stats.recentOrders = stats.recentOrders.map(transformOrderImages);
      }

      return stats;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  },

  /**
   * Get all orders (Admin)
   */
  getAllOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ orders: Order[]; pagination: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);

      const queryString = queryParams.toString();
      const url = `/orders${queryString ? `?${queryString}` : ''}`;

      const response = await apiRequest(url) as ApiResponse;

      let ordersArray: Order[] = [];
      let paginationData: any = {};

      if (response.success && response.data) {
        ordersArray = response.data.orders || [];
        paginationData = response.data.pagination || {};
      } else if (response.orders && Array.isArray(response.orders)) {
        ordersArray = response.orders;
        paginationData = response.pagination || {};
      } else if (Array.isArray(response)) {
        ordersArray = response;
        paginationData = {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: response.length,
          pages: Math.ceil(response.length / (params?.limit || 10))
        };
      }

      // Transform images in all orders
      const transformedOrders = ordersArray.map(transformOrderImages);

      return {
        orders: transformedOrders,
        pagination: paginationData
      };
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  },

  /**
   * Update order status (Admin)
   */
  updateOrderStatus: async (orderId: number, statusData: {
    status: string;
    notes?: string;
  }): Promise<Order> => {
    try {
      const response = await apiRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusData),
      }) as ApiResponse;

      if (response.success && response.data?.order) {
        return transformOrderImages(response.data.order);
      } else if (response.order) {
        return transformOrderImages(response.order);
      }
      
      throw new Error(response.error || 'Failed to update order status');
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  /**
   * Update order shipping details
   */
  updateOrderShipping: async (orderId: number, shippingData: {
    shippingAmount?: number;
    trackingNumber?: string;
    shippingMethod?: string;
    estimatedDelivery?: Date | null;
    totalAmount?: number;
  }): Promise<Order> => {
    try {
      const response = await apiRequest(`/orders/${orderId}/shipping`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shippingData),
      }) as ApiResponse;

      if (response.success && response.data?.order) {
        return transformOrderImages(response.data.order);
      } else if (response.order) {
        return transformOrderImages(response.order);
      }
      
      throw new Error(response.error || 'Failed to update order shipping');
    } catch (error) {
      console.error('Error updating order shipping:', error);
      throw error;
    }
  },

  /**
   * Update order payment status
   */
  updateOrderPaymentStatus: async (orderId: number, paymentStatus: string): Promise<Order> => {
    try {
      const response = await apiRequest(`/orders/${orderId}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus }),
      }) as ApiResponse;

      if (response.success && response.data?.order) {
        return transformOrderImages(response.data.order);
      } else if (response.order) {
        return transformOrderImages(response.order);
      }
      
      throw new Error(response.error || 'Failed to update payment status');
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  /**
   * Get order statistics (Admin)
   */
  getAdminOrderStats: async (): Promise<any> => {
    try {
      const response = await apiRequest('/orders/stats/admin') as ApiResponse;

      if (response.success && response.data?.stats) {
        return response.data.stats;
      } else if (response.stats) {
        return response.stats;
      } else if (response.data) {
        return response.data;
      }
      
      throw new Error('Failed to fetch admin dashboard statistics');
    } catch (error) {
      console.error('Error fetching admin order stats:', error);
      throw error;
    }
  },

  getMonthlyRevenue: async (): Promise<any> => {
    try {
      const response = await apiRequest('/orders/stats/revenue/monthly') as ApiResponse;

      if (response.success && response.data?.monthlyRevenue) {
        return response.data.monthlyRevenue;
      } else if (response.data) {
        return response.data;
      }
      
      throw new Error('Failed to fetch monthly revenue data');
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      throw error;
    }
  },

  /**
   * Get order status distribution for charts
   */
  getOrderStatusDistribution: async (): Promise<any> => {
    try {
      const response = await apiRequest('/orders/stats/orders/distribution') as ApiResponse;

      if (response.success && response.data?.distribution) {
        return response.data.distribution;
      } else if (response.data) {
        return response.data;
      }
      
      throw new Error('Failed to fetch order status distribution');
    } catch (error) {
      console.error('Error fetching order status distribution:', error);
      throw error;
    }
  },

  /**
   * Get top selling products for charts
   */
  getTopSellingProducts: async (): Promise<any> => {
    try {
      const response = await apiRequest('/orders/stats/products/top-selling') as ApiResponse;

      if (response.success && response.data?.topProducts) {
        return response.data.topProducts;
      } else if (response.data) {
        return response.data;
      }
      
      throw new Error('Failed to fetch top selling products');
    } catch (error) {
      console.error('Error fetching top selling products:', error);
      throw error;
    }
  },

  /**
   * 🆕 Send email for order
   */
  sendOrderEmail: async (orderId: number, emailData: {
    subject: string;
    body: string;
  }): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      console.log('📧 Sending email for order:', orderId, emailData);

      const response = await apiRequest(`/orders/${orderId}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      }) as ApiResponse;

      console.log('✅ EMAIL SEND RESPONSE:', response);

      if (response.success) {
        return {
          success: true,
          message: response.message || 'Email sent successfully',
          data: response.data
        };
      } else {
        throw new Error(response.message || response.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending order email:', error);
      throw error;
    }
  },

  /**
   * 🆕 Send order status update email (quick action)
   */
  sendOrderStatusEmail: async (orderId: number, status: string, additionalData?: {
    trackingNumber?: string;
    estimatedDelivery?: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('📧 Sending status email for order:', orderId, status);

      const response = await apiRequest(`/orders/${orderId}/status-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          ...additionalData
        }),
      }) as ApiResponse;

      console.log('✅ STATUS EMAIL RESPONSE:', response);

      if (response.success) {
        return {
          success: true,
          message: response.message || 'Status email sent successfully'
        };
      } else {
        throw new Error(response.message || response.error || 'Failed to send status email');
      }
    } catch (error) {
      console.error('Error sending status email:', error);
      throw error;
    }
  },

  /**
   * 🆕 Get sales reports
   */
  getSalesReports: async (params?: {
    period?: 'weekly' | 'monthly' | 'yearly';
    year?: number;
  }): Promise<any> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.period) queryParams.append('period', params.period);
      if (params?.year) queryParams.append('year', params.year.toString());

      const queryString = queryParams.toString();
      const url = `/orders/reports/sales${queryString ? `?${queryString}` : ''}`;

      const response = await apiRequest(url) as ApiResponse;

      if (response.success && response.data) {
        return response.data;
      } else if (response.data) {
        return response.data;
      }
      
      throw new Error('Failed to fetch sales reports');
    } catch (error) {
      console.error('Error fetching sales reports:', error);
      throw error;
    }
  }
};