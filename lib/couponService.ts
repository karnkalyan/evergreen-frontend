// lib/couponService.ts
import { apiRequest } from './api';
import { Coupon, ApiResponse, CouponStats } from '../types';

export const couponService = {
  // Get all coupons with pagination and filters
getCoupons: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}): Promise<{ coupons: Coupon[]; pagination: any }> => {
    try {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.status) queryParams.append('status', params.status);
        if (params?.search) queryParams.append('search', params.search);

        const queryString = queryParams.toString();
        const url = `/coupons${queryString ? `?${queryString}` : ''}`;

        const response = await apiRequest(url);
        
        console.log('📊 COUPONS API RAW RESPONSE:', response);

        let couponsArray: Coupon[] = [];
        let paginationData: any = {};

        // Handle different response structures
        if (response.success && response.data) {
            couponsArray = response.data.coupons || [];
            paginationData = response.data.pagination || {};
        }
        // Handle direct response structure: { coupons: [], pagination: {} }
        else if (response.coupons && Array.isArray(response.coupons)) {
            couponsArray = response.coupons;
            paginationData = response.pagination || {};
        }
        // Handle array response directly
        else if (Array.isArray(response)) {
            couponsArray = response;
            paginationData = {
                page: params?.page || 1,
                limit: params?.limit || 10,
                total: response.length,
                pages: Math.ceil(response.length / (params?.limit || 10))
            };
        }
        else {
            console.warn('Unexpected coupons response structure:', response);
            return { coupons: [], pagination: {} };
        }
        
        // Ensure pagination has required fields
        const finalPagination = {
            page: paginationData.page || (params?.page || 1),
            limit: paginationData.limit || (params?.limit || 10),
            total: paginationData.total || couponsArray.length,
            pages: paginationData.pages || Math.ceil((paginationData.total || couponsArray.length) / (paginationData.limit || params?.limit || 10))
        };
        
        console.log('✅ PROCESSED COUPONS DATA:', {
            couponsCount: couponsArray.length,
            pagination: finalPagination
        });
        
        return {
            coupons: couponsArray,
            pagination: finalPagination
        };
    } catch (error) {
        console.error('Error fetching coupons:', error);
        throw error;
    }
},

  // Get coupon by ID
  getCouponById: async (id: number): Promise<Coupon | null> => {
    try {
      const response = await apiRequest(`/coupons/${id}`);
      console.log('📋 COUPON BY ID RESPONSE:', response); // Debug log
      
      let coupon: Coupon | null = null;

      // Handle different response structures
      if (response.success && response.data?.coupon) {
        coupon = response.data.coupon;
      } else if (response.coupon) {
        coupon = response.coupon;
      } else if (response.id === id) {
        coupon = response;
      }
      
      return coupon;
    } catch (error) {
      console.error('Error fetching coupon:', error);
      throw error;
    }
  },

  // Get coupon by code
  getCouponByCode: async (code: string): Promise<Coupon | null> => {
    try {
      const response = await apiRequest(`/coupons/code/${code}`);
      
      let coupon: Coupon | null = null;

      if (response.success && response.data?.coupon) {
        coupon = response.data.coupon;
      } else if (response.coupon) {
        coupon = response.coupon;
      }
      
      return coupon;
    } catch (error) {
      console.error('Error fetching coupon by code:', error);
      throw error;
    }
  },

  // Create coupon
  createCoupon: async (couponData: Partial<Coupon>): Promise<Coupon> => {
    try {
      const response = await apiRequest('/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(couponData),
      });

      console.log('🎯 CREATE COUPON RESPONSE:', response); // Debug log

      let coupon: Coupon;

      if (response.success && response.data?.coupon) {
        coupon = response.data.coupon;
      } else if (response.coupon) {
        coupon = response.coupon;
      } else if (response.id) {
        coupon = response;
      } else {
        throw new Error(response.error || response.message || 'Failed to create coupon');
      }
      
      return coupon;
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw error;
    }
  },

  // Update coupon
  updateCoupon: async (id: number, couponData: Partial<Coupon>): Promise<Coupon> => {
    try {
      const response = await apiRequest(`/coupons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(couponData),
      });

      console.log('🎯 UPDATE COUPON RESPONSE:', response); // Debug log

      let coupon: Coupon;

      if (response.success && response.data?.coupon) {
        coupon = response.data.coupon;
      } else if (response.coupon) {
        coupon = response.coupon;
      } else if (response.id) {
        coupon = response;
      } else {
        throw new Error(response.error || response.message || 'Failed to update coupon');
      }
      
      return coupon;
    } catch (error) {
      console.error('Error updating coupon:', error);
      throw error;
    }
  },

  // Delete coupon
  deleteCoupon: async (id: number): Promise<void> => {
    try {
      const response = await apiRequest(`/coupons/${id}`, {
        method: 'DELETE',
      });

      console.log('🗑️ DELETE COUPON RESPONSE:', response); // Debug log

      if (response.success === false || response.error) {
        throw new Error(response.error || response.message || 'Failed to delete coupon');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }
  },

  // Validate coupon
  validateCoupon: async (code: string, userId?: number, cartTotal?: number): Promise<any> => {
    try {
      const response = await apiRequest('/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, userId, cartTotal }),
      });

      if (response.success === false || response.error) {
        throw new Error(response.error || 'Failed to validate coupon');
      }

      return response;
    } catch (error) {
      console.error('Error validating coupon:', error);
      throw error;
    }
  },

  // Get coupon statistics
  getCouponStats: async (): Promise<CouponStats> => {
    try {
      const response = await apiRequest('/coupons/stats/coupons');
      
      console.log('📈 COUPON STATS RESPONSE:', response); // Debug log

      let stats: CouponStats;

      if (response.success && response.data?.stats) {
        stats = response.data.stats;
      } else if (response.stats) {
        stats = response.stats;
      } else {
        throw new Error('Failed to fetch coupon statistics');
      }
      
      return stats;
    } catch (error) {
      console.error('Error fetching coupon stats:', error);
      throw error;
    }
  }
};