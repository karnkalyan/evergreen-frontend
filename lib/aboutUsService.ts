// lib/aboutUsService.ts
import { apiRequest, publicApiRequest, handleApiError } from './api'; // Ensure publicApiRequest and handleApiError are imported

export interface AboutUsData {
  id?: number;
  title: string;
  subtitle?: string;
  description: string;
  mission: string;
  vision?: string;
  values?: Array<{
    title: string;
    description: string;
  }>;
  image?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ------------------------------------------------------------------
// ADMIN / AUTHENTICATED SERVICE (Uses apiRequest)
// Path: /about-us
// ------------------------------------------------------------------

export const aboutUsService = {
  // Get all About Us content (admin)
  getAllAboutUs: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<{ aboutUs: AboutUsData[]; pagination: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

      const queryString = queryParams.toString();
      // FIX 1: Changed /about to /about-us
      const url = `/about-us${queryString ? `?${queryString}` : ''}`; 

      const response = await apiRequest(url);
      
      // ... (Existing response handling logic remains here) ...
      let aboutUsArray: AboutUsData[] = [];
      let paginationData: any = {};
      
      if (response.success && response.data) {
        aboutUsArray = response.data.aboutUs || [];
        paginationData = response.data.pagination || {};
      } else if (response.aboutUs && Array.isArray(response.aboutUs)) {
        aboutUsArray = response.aboutUs;
        paginationData = response.pagination || {};
      } else if (Array.isArray(response)) {
        aboutUsArray = response;
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
        total: paginationData.total || aboutUsArray.length,
        pages: paginationData.pages || Math.ceil((paginationData.total || aboutUsArray.length) / (paginationData.limit || params?.limit || 10))
      };
      // ...
      
      return {
        aboutUs: aboutUsArray,
        pagination: finalPagination
      };
    } catch (error) {
      console.error('Error fetching About Us list:', error);
      throw error;
    }
  },

  // Get About Us by ID (admin)
  getAboutUsById: async (id: number): Promise<AboutUsData | null> => {
    try {
      // FIX 2: Changed /about/${id} to /about-us/${id}
      const response = await apiRequest(`/about-us/${id}`);
      
      let aboutUs: AboutUsData | null = null;
      if (response.success && response.data?.aboutUs) {
        aboutUs = response.data.aboutUs;
      } else if (response.aboutUs) {
        aboutUs = response.aboutUs;
      } else if (response.id === id) {
        aboutUs = response;
      }
      
      return aboutUs;
    } catch (error) {
      console.error('Error fetching About Us:', error);
      throw error;
    }
  },

  // Create About Us
  createAboutUs: async (aboutUsData: AboutUsData): Promise<AboutUsData> => {
    try {
      // FIX 3: Changed /about to /about-us
      const response = await apiRequest('/about-us', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aboutUsData),
      });
      // ... (response handling) ...
      let aboutUs: AboutUsData;
      if (response.success && response.data?.aboutUs) {
        aboutUs = response.data.aboutUs;
      } else if (response.aboutUs) {
        aboutUs = response.aboutUs;
      } else if (response.id) {
        aboutUs = response;
      } else {
        throw new Error(response.error || response.message || 'Failed to create About Us content');
      }
      
      return aboutUs;
    } catch (error) {
      console.error('Error creating About Us:', error);
      throw error;
    }
  },

  // Update About Us
  updateAboutUs: async (id: number, aboutUsData: Partial<AboutUsData>): Promise<AboutUsData> => {
    try {
      // FIX 4: Changed /about/${id} to /about-us/${id}
      const response = await apiRequest(`/about-us/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aboutUsData),
      });
      // ... (response handling) ...
      let aboutUs: AboutUsData;
      if (response.success && response.data?.aboutUs) {
        aboutUs = response.data.aboutUs;
      } else if (response.aboutUs) {
        aboutUs = response.aboutUs;
      } else if (response.id) {
        aboutUs = response;
      } else {
        throw new Error(response.error || response.message || 'Failed to update About Us content');
      }
      
      return aboutUs;
    } catch (error) {
      console.error('Error updating About Us:', error);
      throw error;
    }
  },

  // Delete About Us
  deleteAboutUs: async (id: number): Promise<void> => {
    try {
      // FIX 5: Changed /about/${id} to /about-us/${id}
      const response = await apiRequest(`/about-us/${id}`, {
        method: 'DELETE',
      });

      if (response.success === false || response.error) {
        throw new Error(response.error || response.message || 'Failed to delete About Us content');
      }
    } catch (error) {
      console.error('Error deleting About Us:', error);
      throw error;
    }
  },

  // Toggle About Us status
  toggleAboutUsStatus: async (id: number): Promise<AboutUsData> => {
    try {
      // FIX 6: Changed /about/${id}/toggle-status to /about-us/${id}/toggle-status
      const response = await apiRequest(`/about-us/${id}/toggle-status`, {
        method: 'PATCH',
      });
      // ... (response handling) ...
      let aboutUs: AboutUsData;
      if (response.success && response.data?.aboutUs) {
        aboutUs = response.data.aboutUs;
      } else if (response.aboutUs) {
        aboutUs = response.aboutUs;
      } else if (response.id) {
        aboutUs = response;
      } else {
        throw new Error(response.error || response.message || 'Failed to toggle About Us status');
      }
      
      return aboutUs;
    } catch (error) {
      console.error('Error toggling About Us status:', error);
      throw error;
    }
  }
};

// ------------------------------------------------------------------
// PUBLIC SERVICE (Uses publicApiRequest)
// Path: /about-us/public
// ------------------------------------------------------------------

export const publicAboutUsService = {
  // Get active About Us content (public)
  getAboutUs: async (): Promise<AboutUsData | null> => {
    try {
      // FIX 7: Use publicApiRequest and the full public route
      const response = await publicApiRequest('/about-us/public');
      
      let aboutUs: AboutUsData | null = null;

      if (response.success && response.data?.aboutUs) {
        aboutUs = response.data.aboutUs;
      } else if (response.aboutUs) {
        aboutUs = response.aboutUs;
      } else if (response.id) {
        aboutUs = response;
      }
      
      return aboutUs;
    } catch (error) {
      console.error('Error fetching public About Us:', error);
      // Use handleApiError for public service if available, otherwise rethrow
      if (typeof handleApiError === 'function') {
        handleApiError(error, 'Failed to fetch public About Us');
      }
      throw error;
    }
  },
};