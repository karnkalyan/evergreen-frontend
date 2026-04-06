// lib/countryService.ts
import { apiRequest } from './api';

export interface Country {
  id?: number;
  name: string;
  code: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  isActive?: boolean;
  isGlobal?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const countryService = {
  // Get all active countries (public)
  getCountries: async (includeInactive?: boolean): Promise<Country[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (includeInactive) queryParams.append('includeInactive', 'true');

      const queryString = queryParams.toString();
      const url = `/countries/public${queryString ? `?${queryString}` : ''}`;

      const response = await apiRequest(url);
      
      let countries: Country[] = [];

      if (response.success && response.data?.countries) {
        countries = response.data.countries;
      } else if (response.countries && Array.isArray(response.countries)) {
        countries = response.countries;
      } else if (Array.isArray(response)) {
        countries = response;
      }
      
      return countries;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  },

  // Detect user's country
  detectCountry: async (): Promise<Country | null> => {
    try {
      const response = await apiRequest('/countries/detect');
      
      let country: Country | null = null;

      if (response.success && response.data?.country) {
        country = response.data.country;
      } else if (response.country) {
        country = response.country;
      } else if (response.id) {
        country = response;
      }
      
      return country;
    } catch (error) {
      console.error('Error detecting country:', error);
      throw error;
    }
  },

  // Get country by code
  getCountryByCode: async (code: string): Promise<Country | null> => {
    try {
      const response = await apiRequest(`/countries/code/${code}`);
      
      let country: Country | null = null;

      if (response.success && response.data?.country) {
        country = response.data.country;
      } else if (response.country) {
        country = response.country;
      } else if (response.id) {
        country = response;
      }
      
      return country;
    } catch (error) {
      console.error('Error fetching country by code:', error);
      throw error;
    }
  },

  // Get all countries (admin)
  getAllCountries: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    search?: string;
  }): Promise<{ countries: Country[]; pagination: any }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.search) queryParams.append('search', params.search);

      const queryString = queryParams.toString();
      const url = `/countries${queryString ? `?${queryString}` : ''}`;

      const response = await apiRequest(url);
      
      let countriesArray: Country[] = [];
      let paginationData: any = {};

      if (response.success && response.data) {
        countriesArray = response.data.countries || [];
        paginationData = response.data.pagination || {};
      } else if (response.countries && Array.isArray(response.countries)) {
        countriesArray = response.countries;
        paginationData = response.pagination || {};
      } else if (Array.isArray(response)) {
        countriesArray = response;
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
        total: paginationData.total || countriesArray.length,
        pages: paginationData.pages || Math.ceil((paginationData.total || countriesArray.length) / (paginationData.limit || params?.limit || 10))
      };
      
      return {
        countries: countriesArray,
        pagination: finalPagination
      };
    } catch (error) {
      console.error('Error fetching countries list:', error);
      throw error;
    }
  },

  // Get country by ID (admin)
  getCountryById: async (id: number): Promise<Country | null> => {
    try {
      const response = await apiRequest(`/countries/${id}`);
      
      let country: Country | null = null;

      if (response.success && response.data?.country) {
        country = response.data.country;
      } else if (response.country) {
        country = response.country;
      } else if (response.id === id) {
        country = response;
      }
      
      return country;
    } catch (error) {
      console.error('Error fetching country:', error);
      throw error;
    }
  },

  // Create country
  createCountry: async (countryData: Country): Promise<Country> => {
    try {
      const response = await apiRequest('/countries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(countryData),
      });

      let country: Country;

      if (response.success && response.data?.country) {
        country = response.data.country;
      } else if (response.country) {
        country = response.country;
      } else if (response.id) {
        country = response;
      } else {
        throw new Error(response.error || response.message || 'Failed to create country');
      }
      
      return country;
    } catch (error) {
      console.error('Error creating country:', error);
      throw error;
    }
  },

  // Update country
  updateCountry: async (id: number, countryData: Partial<Country>): Promise<Country> => {
    try {
      const response = await apiRequest(`/countries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(countryData),
      });

      let country: Country;

      if (response.success && response.data?.country) {
        country = response.data.country;
      } else if (response.country) {
        country = response.country;
      } else if (response.id) {
        country = response;
      } else {
        throw new Error(response.error || response.message || 'Failed to update country');
      }
      
      return country;
    } catch (error) {
      console.error('Error updating country:', error);
      throw error;
    }
  },

  // Delete country
  deleteCountry: async (id: number): Promise<void> => {
    try {
      const response = await apiRequest(`/countries/${id}`, {
        method: 'DELETE',
      });

      if (response.success === false || response.error) {
        throw new Error(response.error || response.message || 'Failed to delete country');
      }
    } catch (error) {
      console.error('Error deleting country:', error);
      throw error;
    }
  },

  // Toggle country status
  toggleCountryStatus: async (id: number): Promise<Country> => {
    try {
      const response = await apiRequest(`/countries/${id}/toggle-status`, {
        method: 'PATCH',
      });

      let country: Country;

      if (response.success && response.data?.country) {
        country = response.data.country;
      } else if (response.country) {
        country = response.country;
      } else if (response.id) {
        country = response;
      } else {
        throw new Error(response.error || response.message || 'Failed to toggle country status');
      }
      
      return country;
    } catch (error) {
      console.error('Error toggling country status:', error);
      throw error;
    }
  }
};