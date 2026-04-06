// lib/paymentService.ts
import { apiRequest } from './api';
import { ApiResponse } from '../types';

export interface Payment {
  id: number;
  orderId: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  amount: number;
  currency: string;
  transactionId?: string;
  paymentGateway?: string;
  gatewayResponse?: any;
  lastFourDigits?: string;
  cardBrand?: string;
  paidAt?: string;
  failedAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
  order?: {
    orderNumber: string;
    totalAmount: number;
    currency: string;
    orderItems?: Array<{
      product: {
        name: string;
        images: any[];
      };
    }>;
  };
}

export interface PaymentHistory {
  id: number;
  paymentId: number;
  action: string;
  amount: number;
  currency: string;
  notes?: string;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  supportedCurrencies: string[];
  processingFee: number;
  availableFor?: string[];
}

export interface ProcessPaymentRequest {
  orderId: number;
  paymentMethod: string;
  paymentDetails?: {
    lastFourDigits?: string;
    cardBrand?: string;
    [key: string]: any;
  };
}

export interface RefundRequest {
  refundAmount: number;
  reason?: string;
}

export const paymentService = {
  /**
   * Get all payments for authenticated user
   */
  getUserPayments: async (): Promise<Payment[]> => {
    try {
      const response = await apiRequest('/payments') as ApiResponse;
      
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response)) {
        return response;
      }
      
      throw new Error('Failed to fetch payments');
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  /**
   * Get payment by ID
   */
  getPaymentById: async (id: number): Promise<Payment> => {
    try {
      const response = await apiRequest(`/payments/${id}`) as ApiResponse;
      
      if (response.success && response.data) {
        return response.data;
      } else if (response.id) {
        return response;
      }
      
      throw new Error('Payment not found');
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  },

  /**
   * Process payment for order
   */
  processPayment: async (paymentData: ProcessPaymentRequest): Promise<{
    payment: Payment;
    orderStatus: string;
    message: string;
  }> => {
    try {
      const response = await apiRequest('/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      }) as ApiResponse;

      if (response.success) {
        return response;
      }
      
      throw new Error(response.error || 'Failed to process payment');
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  /**
   * Update payment status
   */
  updatePaymentStatus: async (paymentId: number, statusData: {
    paymentStatus?: string;
    transactionId?: string;
    gatewayResponse?: any;
    notes?: string;
  }): Promise<Payment> => {
    try {
      const response = await apiRequest(`/payments/${paymentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusData),
      }) as ApiResponse;

      if (response.success && response.data?.payment) {
        return response.data.payment;
      } else if (response.payment) {
        return response.payment;
      }
      
      throw new Error(response.error || 'Failed to update payment status');
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  /**
   * Initiate refund
   */
  initiateRefund: async (paymentId: number, refundData: RefundRequest): Promise<{
    refund: any;
    message: string;
  }> => {
    try {
      const response = await apiRequest(`/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refundData),
      }) as ApiResponse;

      if (response.success) {
        return response;
      }
      
      throw new Error(response.error || 'Failed to process refund');
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  },

  /**
   * Get available payment methods
   */
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    try {
      const response = await apiRequest('/payments/methods') as ApiResponse;
      
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response)) {
        return response;
      }
      
      throw new Error('Failed to fetch payment methods');
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  /**
   * Get payment history
   */
  getPaymentHistory: async (paymentId: number): Promise<PaymentHistory[]> => {
    try {
      const response = await apiRequest(`/payments/${paymentId}/history`) as ApiResponse;
      
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response)) {
        return response;
      }
      
      throw new Error('Failed to fetch payment history');
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }
};