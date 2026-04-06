import { apiRequest } from './api';

export interface PaymentMethod {
  id?: number;
  name: string;
  code: string;
  description?: string;
  instructions?: string;
  isActive: boolean;
  isDefault: boolean;
  isQrAvailable: boolean;
  qrCodeUrl?: string;
  sortOrder?: number;
  requiresAuthorization: boolean;
  supportsRefunds: boolean;
  processingFee: number;
  minAmount?: number;
  maxAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const paymentMethodService = {
  // Get all active payment methods (public)
  getPaymentMethods: async (includeInactive?: boolean): Promise<PaymentMethod[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (includeInactive) queryParams.append('includeInactive', 'true');

      const queryString = queryParams.toString();
      const url = `/payment-methods/public${queryString ? `?${queryString}` : ''}`;

      const response = await apiRequest(url);
      
      let paymentMethods: PaymentMethod[] = [];

      if (response.success && response.data?.paymentMethods) {
        paymentMethods = response.data.paymentMethods;
      } else if (response.paymentMethods && Array.isArray(response.paymentMethods)) {
        paymentMethods = response.paymentMethods;
      } else if (Array.isArray(response)) {
        paymentMethods = response;
      }
      
      return paymentMethods;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  // Get payment method by code
  getPaymentMethodByCode: async (code: string): Promise<PaymentMethod | null> => {
    try {
      const response = await apiRequest(`/payment-methods/code/${code}`);
      
      let paymentMethod: PaymentMethod | null = null;

      if (response.success && response.data?.paymentMethod) {
        paymentMethod = response.data.paymentMethod;
      } else if (response.paymentMethod) {
        paymentMethod = response.paymentMethod;
      } else if (response.code === code) {
        paymentMethod = response;
      }
      
      return paymentMethod;
    } catch (error) {
      console.error('Error fetching payment method by code:', error);
      throw error;
    }
  },

  // Get all payment methods (admin)
  getAllPaymentMethods: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    search?: string;
  }): Promise<{ paymentMethods: PaymentMethod[]; pagination: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.search) queryParams.append('search', params.search);

      const queryString = queryParams.toString();
      const url = `/payment-methods${queryString ? `?${queryString}` : ''}`;

      const response = await apiRequest(url);
      
      let paymentMethodsArray: PaymentMethod[] = [];
      let paginationData: any = {};

      if (response.success && response.data) {
        paymentMethodsArray = response.data.paymentMethods || [];
        paginationData = response.data.pagination || {};
      } else if (response.paymentMethods && Array.isArray(response.paymentMethods)) {
        paymentMethodsArray = response.paymentMethods;
        paginationData = response.pagination || {};
      } else if (Array.isArray(response)) {
        paymentMethodsArray = response;
        paginationData = {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: response.length,
          pages: Math.ceil(response.length / (params?.limit || 10))
        };
      }
      
      const finalPagination = {
        page: paginationData.page || (params?.page || 1),
        limit: paginationData.limit || (params?.limit || 10),
        total: paginationData.total || paymentMethodsArray.length,
        pages: paginationData.pages || Math.ceil((paginationData.total || paymentMethodsArray.length) / (paginationData.limit || params?.limit || 10))
      };
      
      return {
        paymentMethods: paymentMethodsArray,
        pagination: finalPagination
      };
    } catch (error) {
      console.error('Error fetching payment methods list:', error);
      throw error;
    }
  },

  // Get payment method by ID
  getPaymentMethodById: async (id: number): Promise<PaymentMethod | null> => {
    try {
      const response = await apiRequest(`/payment-methods/${id}`);
      
      let paymentMethod: PaymentMethod | null = null;

      if (response.success && response.data?.paymentMethod) {
        paymentMethod = response.data.paymentMethod;
      } else if (response.paymentMethod) {
        paymentMethod = response.paymentMethod;
      } else if (response.id === id) {
        paymentMethod = response;
      }
      
      return paymentMethod;
    } catch (error) {
      console.error('Error fetching payment method:', error);
      throw error;
    }
  },

  // Create payment method
  createPaymentMethod: async (paymentMethodData: PaymentMethod): Promise<PaymentMethod> => {
    try {
      const response = await apiRequest('/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentMethodData),
      });

      let paymentMethod: PaymentMethod;

      if (response.success && response.data?.paymentMethod) {
        paymentMethod = response.data.paymentMethod;
      } else if (response.paymentMethod) {
        paymentMethod = response.paymentMethod;
      } else if (response.id) {
        paymentMethod = response;
      } else {
        throw new Error(response.error || response.message || 'Failed to create payment method');
      }
      
      return paymentMethod;
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  },

  // Update payment method
  updatePaymentMethod: async (id: number, paymentMethodData: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    try {
      const response = await apiRequest(`/payment-methods/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentMethodData),
      });

      let paymentMethod: PaymentMethod;

      if (response.success && response.data?.paymentMethod) {
        paymentMethod = response.data.paymentMethod;
      } else if (response.paymentMethod) {
        paymentMethod = response.paymentMethod;
      } else if (response.id) {
        paymentMethod = response;
      } else {
        throw new Error(response.error || response.message || 'Failed to update payment method');
      }
      
      return paymentMethod;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  },

  // Delete payment method
  deletePaymentMethod: async (id: number): Promise<void> => {
    try {
      const response = await apiRequest(`/payment-methods/${id}`, {
        method: 'DELETE',
      });

      if (response.success === false || response.error) {
        throw new Error(response.error || response.message || 'Failed to delete payment method');
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  },

  // Toggle payment method status
  togglePaymentMethodStatus: async (id: number): Promise<PaymentMethod> => {
    try {
      const response = await apiRequest(`/payment-methods/${id}/toggle-status`, {
        method: 'PATCH',
      });

      let paymentMethod: PaymentMethod;

      if (response.success && response.data?.paymentMethod) {
        paymentMethod = response.data.paymentMethod;
      } else if (response.paymentMethod) {
        paymentMethod = response.paymentMethod;
      } else if (response.id) {
        paymentMethod = response;
      } else {
        throw new Error(response.error || response.message || 'Failed to toggle payment method status');
      }
      
      return paymentMethod;
    } catch (error) {
      console.error('Error toggling payment method status:', error);
      throw error;
    }
  },

  // Set default payment method
  setDefaultPaymentMethod: async (id: number): Promise<PaymentMethod> => {
    try {
      const response = await apiRequest(`/payment-methods/${id}/set-default`, {
        method: 'PATCH',
      });

      let paymentMethod: PaymentMethod;

      if (response.success && response.data?.paymentMethod) {
        paymentMethod = response.data.paymentMethod;
      } else if (response.paymentMethod) {
        paymentMethod = response.paymentMethod;
      } else if (response.id) {
        paymentMethod = response;
      } else {
        throw new Error(response.error || response.message || 'Failed to set default payment method');
      }
      
      return paymentMethod;
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }
};