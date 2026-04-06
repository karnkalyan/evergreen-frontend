// lib/prescriptionService.ts
import { apiRequest } from './api';
import { ApiResponse } from '../types';

export interface Prescription {
  id: number;
  userId: number;
  imageUrl: string;
  fileName: string;
  fileSize: number;
  isValidated: boolean;
  validatedBy?: number;
  validatedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  orderIds?: number[];
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  validatedByUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// ADD THIS MISSING INTERFACE
export interface PrescriptionStats {
  total: number;
  validated: number;
  pending: number;
  rejected: number;
  recentUploads: number;
}

export interface PrescriptionValidation {
  isValidated: boolean;
  notes?: string;
}

export interface PrescriptionUploadResponse {
  prescription: Prescription;
  message: string;
}

export interface PrescriptionsResponse {
  prescriptions: Prescription[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const prescriptionService = {
  /**
   * Get all prescriptions for current user
   */
  getPrescriptions: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PrescriptionsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);

      const queryString = queryParams.toString();
      const url = `/prescription${queryString ? `?${queryString}` : ''}`;

      const response = await apiRequest(url) as ApiResponse;

      if (response.success && response.data) {
        return {
          prescriptions: response.data.prescriptions || [],
          pagination: response.data.pagination
        };
      }
      
      throw new Error(response.error || 'Failed to fetch prescriptions');
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      throw error;
    }
  },

  /**
   * Get user prescriptions (simple list - for checkout page)
   */
  getUserPrescriptions: async (): Promise<Prescription[]> => {
    try {
      const response = await apiRequest('/prescription') as ApiResponse;
      
      if (response.success && response.data) {
        return response.data.prescriptions || [];
      }
      
      throw new Error(response.error || 'Failed to fetch user prescriptions');
    } catch (error) {
      console.error('Error fetching user prescriptions:', error);
      throw error;
    }
  },

  /**
   * Get prescription statistics for user
   */
  getUserPrescriptionStats: async (): Promise<PrescriptionStats> => {
    try {
      const response = await apiRequest('/prescription/stats/user') as ApiResponse;
      
      if (response.success && response.data) {
        return response.data.stats;
      }
      
      throw new Error(response.error || 'Failed to fetch prescription statistics');
    } catch (error) {
      console.error('Error fetching prescription stats:', error);
      throw error;
    }
  },

  /**
   * Get all prescriptions (Admin)
   */
  getAllPrescriptions: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    userId?: number;
  }): Promise<PrescriptionsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.userId) queryParams.append('userId', params.userId.toString());

      const queryString = queryParams.toString();
      const url = `/prescription/admin/all${queryString ? `?${queryString}` : ''}`;

      const response = await apiRequest(url) as ApiResponse;

      if (response.success && response.data) {
        return {
          prescriptions: response.data.prescriptions || [],
          pagination: response.data.pagination
        };
      }
      
      throw new Error(response.error || 'Failed to fetch prescriptions');
    } catch (error) {
      console.error('Error fetching all prescriptions:', error);
      throw error;
    }
  },

  /**
   * Validate/Reject prescription (Admin)
   */
  validatePrescription: async (prescriptionId: number, validationData: PrescriptionValidation): Promise<Prescription> => {
    try {
      const response = await apiRequest(`/prescription/${prescriptionId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validationData),
      }) as ApiResponse;

      if (response.success && response.data?.prescription) {
        return response.data.prescription;
      }
      
      throw new Error(response.error || 'Failed to validate prescription');
    } catch (error) {
      console.error('Error validating prescription:', error);
      throw error;
    }
  },

  /**
   * Get prescription by ID
   */
  getPrescriptionById: async (id: number): Promise<Prescription> => {
    try {
      const response = await apiRequest(`/prescription/${id}`) as ApiResponse;
      
      if (response.success && response.data?.prescription) {
        return response.data.prescription;
      }
      
      throw new Error('Prescription not found');
    } catch (error) {
      console.error('Error fetching prescription:', error);
      throw error;
    }
  },

  /**
   * Upload prescription
   */
  uploadPrescription: async (file: File, notes?: string): Promise<PrescriptionUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('prescription', file);
      if (notes) {
        formData.append('notes', notes);
      }

      const response = await apiRequest('/prescription/upload', {
        method: 'POST',
        body: formData,
      }) as ApiResponse;

      if (response.success && response.data) {
        return {
          prescription: response.data.prescription,
          message: response.message || 'Prescription uploaded successfully'
        };
      }
      
      throw new Error(response.error || 'Failed to upload prescription');
    } catch (error) {
      console.error('Error uploading prescription:', error);
      throw error;
    }
  },

  /**
   * Delete prescription
   */
  deletePrescription: async (prescriptionId: number): Promise<{message: string}> => {
    try {
      const response = await apiRequest(`/prescription/${prescriptionId}`, {
        method: 'DELETE',
      }) as ApiResponse;

      if (response.success) {
        return {
          message: response.message || 'Prescription deleted successfully'
        };
      }
      
      throw new Error(response.error || 'Failed to delete prescription');
    } catch (error) {
      console.error('Error deleting prescription:', error);
      throw error;
    }
  },

  /**
   * Update prescription notes
   */
  updatePrescription: async (prescriptionId: number, notes: string): Promise<Prescription> => {
    try {
      const response = await apiRequest(`/prescription/${prescriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      }) as ApiResponse;

      if (response.success && response.data?.prescription) {
        return response.data.prescription;
      }
      
      throw new Error(response.error || 'Failed to update prescription');
    } catch (error) {
      console.error('Error updating prescription:', error);
      throw error;
    }
  },

  /**
   * Get prescriptions for a specific order
   */
  getOrderPrescriptions: async (orderId: number): Promise<Prescription[]> => {
    try {
      const response = await apiRequest(`/prescription/order/${orderId}`) as ApiResponse;
      
      if (response.success && response.data) {
        return response.data.prescriptions || [];
      }
      
      throw new Error(response.error || 'Failed to fetch order prescriptions');
    } catch (error) {
      console.error('Error fetching order prescriptions:', error);
      throw error;
    }
  }
};