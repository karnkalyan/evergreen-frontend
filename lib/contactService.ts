import { apiRequest } from './api';
import { ContactRequest, ContactRequestFormData, ContactRequestStats, ApiResponse } from '../types';

export const contactRequestService = {
  // Create contact request
  createContactRequest: async (data: ContactRequestFormData): Promise<ApiResponse> => {
    const response = await apiRequest('/contact-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }) as ApiResponse;
    
    return response;
  },

  // Get all contact requests
  getContactRequests: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ data: ContactRequest[]; pagination: any }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const response = await apiRequest(`/contact-requests?${queryParams}`) as ApiResponse;
    
    if (response.success) {
      return {
        data: response.data,
        pagination: response.pagination
      };
    }
    
    return { data: [], pagination: {} };
  },

  // Get contact request by ID
  getContactRequest: async (id: number): Promise<ContactRequest | null> => {
    try {
      const response = await apiRequest(`/contact-requests/${id}`) as ApiResponse;
      
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching contact request:', error);
      return null;
    }
  },

  // Update contact request status
  updateContactRequest: async (id: number, status: string): Promise<ApiResponse> => {
    const response = await apiRequest(`/contact-requests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    }) as ApiResponse;
    
    return response;
  },

  // Delete contact request
  deleteContactRequest: async (id: number): Promise<ApiResponse> => {
    const response = await apiRequest(`/contact-requests/${id}`, {
      method: 'DELETE',
    }) as ApiResponse;
    
    return response;
  },

  // Get stats
  getContactRequestStats: async (): Promise<ContactRequestStats | null> => {
    try {
      const response = await apiRequest('/contact-requests/stats') as ApiResponse;
      
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching contact request stats:', error);
      return null;
    }
  }
};