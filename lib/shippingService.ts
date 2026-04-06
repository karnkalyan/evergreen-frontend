// lib/shippingService.ts
import { apiRequest } from './api';

export interface Shipping {
  id?: number;
  name: string;
  code: string;
  description?: string;
  cost: number;
  isActive: boolean;
  isDefault: boolean;
  estimatedDays: number;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const shippingService = {
  // Get all active shipping options (public)
  getShippingOptions: async (includeInactive?: boolean): Promise<Shipping[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (includeInactive) queryParams.append('includeInactive', 'true');

      const queryString = queryParams.toString();
      const url = `/shipping/public${queryString ? `?${queryString}` : ''}`;

      const response = await apiRequest(url);
      
      let shippingOptions: Shipping[] = [];

      if (response.success && response.data?.shippingOptions) {
        shippingOptions = response.data.shippingOptions;
      } else if (response.shippingOptions && Array.isArray(response.shippingOptions)) {
        shippingOptions = response.shippingOptions;
      } else if (Array.isArray(response)) {
        shippingOptions = response;
      }
      
      return shippingOptions;
    } catch (error) {
      console.error('Error fetching shipping options:', error);
      throw error;
    }
  },

  // Get all shipping options (admin)
  getAllShippingOptions: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    search?: string;
  }): Promise<{ shippingOptions: Shipping[]; pagination: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.search) queryParams.append('search', params.search);

      const queryString = queryParams.toString();
      const url = `/shipping${queryString ? `?${queryString}` : ''}`;

      const response = await apiRequest(url);
      
      let shippingArray: Shipping[] = [];
      let paginationData: any = {};

      if (response.success && response.data) {
        shippingArray = response.data.shippingOptions || [];
        paginationData = response.data.pagination || {};
      } else if (response.shippingOptions && Array.isArray(response.shippingOptions)) {
        shippingArray = response.shippingOptions;
        paginationData = response.pagination || {};
      } else if (Array.isArray(response)) {
        shippingArray = response;
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
        total: paginationData.total || shippingArray.length,
        pages: paginationData.pages || Math.ceil((paginationData.total || shippingArray.length) / (paginationData.limit || params?.limit || 10))
      };
      
      return {
        shippingOptions: shippingArray,
        pagination: finalPagination
      };
    } catch (error) {
      console.error('Error fetching shipping list:', error);
      throw error;
    }
  },

  // Get shipping by ID
  getShippingById: async (id: number): Promise<Shipping | null> => {
    try {
      const response = await apiRequest(`/shipping/${id}`);
      
      let shipping: Shipping | null = null;

      if (response.success && response.data?.shipping) {
        shipping = response.data.shipping;
      } else if (response.shipping) {
        shipping = response.shipping;
      } else if (response.id === id) {
        shipping = response;
      }
      
      return shipping;
    } catch (error) {
      console.error('Error fetching shipping:', error);
      throw error;
    }
  },

  // Create shipping
  createShipping: async (shippingData: Shipping): Promise<Shipping> => {
    try {
      const response = await apiRequest('/shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shippingData),
      });

      let shipping: Shipping;

      if (response.success && response.data?.shipping) {
        shipping = response.data.shipping;
      } else if (response.shipping) {
        shipping = response.shipping;
      } else if (response.id) {
        shipping = response;
      } else {
        throw new Error(response.error || response.message || 'Failed to create shipping option');
      }
      
      return shipping;
    } catch (error) {
      console.error('Error creating shipping:', error);
      throw error;
    }
  },

  // Update shipping
  updateShipping: async (id: number, shippingData: Partial<Shipping>): Promise<Shipping> => {
    try {
      const response = await apiRequest(`/shipping/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shippingData),
      });

      let shipping: Shipping;

      if (response.success && response.data?.shipping) {
        shipping = response.data.shipping;
      } else if (response.shipping) {
        shipping = response.shipping;
      } else if (response.id) {
        shipping = response;
      } else {
        throw new Error(response.error || response.message || 'Failed to update shipping option');
      }
      
      return shipping;
    } catch (error) {
      console.error('Error updating shipping:', error);
      throw error;
    }
  },

  // Delete shipping
  deleteShipping: async (id: number): Promise<void> => {
    try {
      const response = await apiRequest(`/shipping/${id}`, {
        method: 'DELETE',
      });

      if (response.success === false || response.error) {
        throw new Error(response.error || response.message || 'Failed to delete shipping option');
      }
    } catch (error) {
      console.error('Error deleting shipping:', error);
      throw error;
    }
  },

  // Toggle shipping status
  toggleShippingStatus: async (id: number): Promise<Shipping> => {
    try {
      const response = await apiRequest(`/shipping/${id}/toggle-status`, {
        method: 'PATCH',
      });

      let shipping: Shipping;

      if (response.success && response.data?.shipping) {
        shipping = response.data.shipping;
      } else if (response.shipping) {
        shipping = response.shipping;
      } else if (response.id) {
        shipping = response;
      } else {
        throw new Error(response.error || response.message || 'Failed to toggle shipping status');
      }
      
      return shipping;
    } catch (error) {
      console.error('Error toggling shipping status:', error);
      throw error;
    }
  },

  // Set default shipping
  setDefaultShipping: async (id: number): Promise<Shipping> => {
    try {
      const response = await apiRequest(`/shipping/${id}/set-default`, {
        method: 'PATCH',
      });

      let shipping: Shipping;

      if (response.success && response.data?.shipping) {
        shipping = response.data.shipping;
      } else if (response.shipping) {
        shipping = response.shipping;
      } else if (response.id) {
        shipping = response;
      } else {
        throw new Error(response.error || response.message || 'Failed to set default shipping');
      }
      
      return shipping;
    } catch (error) {
      console.error('Error setting default shipping:', error);
      throw error;
    }
  }
};