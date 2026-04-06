// services/medicationRequestService.ts
import { apiRequest } from './api';
import { MedicationRequest, MedicationRequestFormData, MedicationRequestStats, ApiResponse } from '../types';

export const medicationRequestService = {
  // Create medication request
  createMedicationRequest: async (data: MedicationRequestFormData): Promise<ApiResponse> => {
    const response = await apiRequest('/medication-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }) as ApiResponse;
    
    return response;
  },

  // Get all medication requests
  getMedicationRequests: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ data: MedicationRequest[]; pagination: any }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const response = await apiRequest(`/medication-requests?${queryParams}`) as ApiResponse;
    
    if (response.success) {
      return {
        data: response.data,
        pagination: response.pagination
      };
    }
    
    return { data: [], pagination: {} };
  },

  // Get medication request by ID
  getMedicationRequest: async (id: number): Promise<MedicationRequest | null> => {
    try {
      const response = await apiRequest(`/medication-requests/${id}`) as ApiResponse;
      
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching medication request:', error);
      return null;
    }
  },

  // Update medication request status
  updateMedicationRequest: async (id: number, status: string): Promise<ApiResponse> => {
    const response = await apiRequest(`/medication-requests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    }) as ApiResponse;
    
    return response;
  },

  // Delete medication request
  deleteMedicationRequest: async (id: number): Promise<ApiResponse> => {
    const response = await apiRequest(`/medication-requests/${id}`, {
      method: 'DELETE',
    }) as ApiResponse;
    
    return response;
  },

  // Get stats
  getMedicationRequestStats: async (): Promise<MedicationRequestStats | null> => {
    try {
      const response = await apiRequest('/medication-requests/stats') as ApiResponse;
      
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching medication request stats:', error);
      return null;
    }
  }
};