import { apiRequest, publicApiRequest, handleApiError } from './api';
import { Brand, BrandFormData, ApiResponse } from '../types';

// Helper function to get full image URL
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '/placeholder-image.jpg';
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
  return `${baseUrl}${imagePath}`;
};

// Existing brandService for admin (authenticated routes)
export const brandService = {
  // Get all brands
  getBrands: async (): Promise<Brand[]> => {
    try {
      const response = await apiRequest('/brands') as ApiResponse;
      console.log('📊 RAW BRANDS API RESPONSE:', response);

      if (response.success && response.data) {
        let brandsArray: Brand[] = [];
        
        if (response.data.brands && Array.isArray(response.data.brands)) {
          brandsArray = response.data.brands;
        } else if (Array.isArray(response.data)) {
          brandsArray = response.data;
        }
        
        return brandsArray.map((brand: Brand) => ({
          ...brand,
          logo: brand.logo ? getImageUrl(brand.logo) : undefined,
          productCount: brand._count?.products || 0
        }));
      }
      
      console.warn('Unexpected brands response structure:', response);
      return [];
    } catch (error) {
      console.error('Error fetching brands:', error);
      // Re-throw the error so the component can handle it
      throw error;
    }
  },

  // Get brand by ID
  getBrandById: async (id: number): Promise<Brand | null> => {
    try {
      const response = await apiRequest(`/brands/${id}`) as ApiResponse;
      
      if (response.success && response.data) {
        const brand = response.data;
        return {
          ...brand,
          logo: brand.logo ? getImageUrl(brand.logo) : undefined,
          productCount: brand._count?.products || 0
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching brand:', error);
      throw error;
    }
  },

  // Get brand by slug
  getBrandBySlug: async (slug: string): Promise<Brand | null> => {
    try {
      const response = await apiRequest(`/brands/slug/${slug}`) as ApiResponse;
      
      if (response.success && response.data) {
        const brand = response.data;
        return {
          ...brand,
          logo: brand.logo ? getImageUrl(brand.logo) : undefined,
          productCount: brand._count?.products || 0
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching brand by slug:', error);
      throw error;
    }
  },

  // Create brand
  createBrand: async (brandData: FormData): Promise<ApiResponse> => {
    try {
      const response = await apiRequest('/brands', {
        method: 'POST',
        body: brandData,
      }) as ApiResponse;
      
      return response;
    } catch (error) {
      console.error('Error creating brand:', error);
      throw error;
    }
  },

  // Update brand
  updateBrand: async (id: number, brandData: FormData): Promise<ApiResponse> => {
    try {
      const response = await apiRequest(`/brands/${id}`, {
        method: 'PUT',
        body: brandData,
      }) as ApiResponse;
      
      return response;
    } catch (error) {
      console.error('Error updating brand:', error);
      throw error;
    }
  },

  // Delete brand
  deleteBrand: async (id: number): Promise<ApiResponse> => {
    try {
      const response = await apiRequest(`/brands/${id}`, {
        method: 'DELETE',
      }) as ApiResponse;
      
      return response;
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  },

  // Get popular brands
  getPopularBrands: async (limit: number = 10): Promise<Brand[]> => {
    try {
      const response = await apiRequest(`/brands/popular/brands?limit=${limit}`) as ApiResponse;
      
      if (response.success && response.data) {
        let brandsArray: Brand[] = [];
        
        if (response.data.brands && Array.isArray(response.data.brands)) {
          brandsArray = response.data.brands;
        } else if (Array.isArray(response.data)) {
          brandsArray = response.data;
        }
        
        return brandsArray.map((brand: Brand) => ({
          ...brand,
          logo: brand.logo ? getImageUrl(brand.logo) : undefined,
          productCount: brand._count?.products || 0
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching popular brands:', error);
      throw error;
    }
  },

  // Search brands
  searchBrands: async (query: string, page: number = 1, limit: number = 10): Promise<{ brands: Brand[]; pagination: any }> => {
    try {
      const response = await apiRequest(`/brands/search/brands?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`) as ApiResponse;
      
      if (response.success && response.data) {
        const brandsArray = response.data.brands || [];
        const pagination = response.data.pagination || {};
        
        return {
          brands: brandsArray.map((brand: Brand) => ({
            ...brand,
            logo: brand.logo ? getImageUrl(brand.logo) : undefined,
            productCount: brand._count?.products || 0
          })),
          pagination
        };
      }
      return { brands: [], pagination: {} };
    } catch (error) {
      console.error('Error searching brands:', error);
      throw error;
    }
  },

  // Get brands for dropdown/select
  getBrandsForSelect: async (): Promise<{ value: number; label: string; productCount: number }[]> => {
    try {
      const brands = await brandService.getBrands();
      return brands.map(brand => ({
        value: brand.id,
        label: brand.name,
        productCount: brand._count?.products || brand.productCount || 0
      }));
    } catch (error) {
      console.error('Error fetching brands for select:', error);
      throw error;
    }
  }
};

// NEW: Public brand service for frontend using public routes
export const publicBrandService = {
  // Get all brands (public route)
  getBrands: async (): Promise<Brand[]> => {
    try {
      const response = await publicApiRequest('/brands/public/brands') as ApiResponse;
      console.log('📊 RAW PUBLIC BRANDS API RESPONSE:', response);

      if (response.success && response.data) {
        let brandsArray: Brand[] = [];
        
        if (response.data.brands && Array.isArray(response.data.brands)) {
          brandsArray = response.data.brands;
        } else if (Array.isArray(response.data)) {
          brandsArray = response.data;
        }
        
        return brandsArray.map((brand: Brand) => ({
          ...brand,
          logo: brand.logo ? getImageUrl(brand.logo) : undefined,
          productCount: brand._count?.products || 0
        }));
      }
      
      console.warn('Unexpected public brands response structure:', response);
      return [];
    } catch (error) {
      handleApiError(error, 'Failed to fetch brands');
      return [];
    }
  },

  // Get brand by ID (public route)
  getBrandById: async (id: number): Promise<Brand | null> => {
    try {
      const response = await publicApiRequest(`/brands/public/brands/${id}`) as ApiResponse;
      
      if (response.success && response.data) {
        const brand = response.data;
        return {
          ...brand,
          logo: brand.logo ? getImageUrl(brand.logo) : undefined,
          productCount: brand._count?.products || 0
        };
      }
      return null;
    } catch (error) {
      handleApiError(error, 'Failed to fetch brand');
      return null;
    }
  },

  // Get brand by slug (public route)
  getBrandBySlug: async (slug: string): Promise<Brand | null> => {
    try {
      const response = await publicApiRequest(`/brands/public/brands/slug/${slug}`) as ApiResponse;
      
      if (response.success && response.data) {
        const brand = response.data;
        return {
          ...brand,
          logo: brand.logo ? getImageUrl(brand.logo) : undefined,
          productCount: brand._count?.products || 0
        };
      }
      return null;
    } catch (error) {
      handleApiError(error, 'Failed to fetch brand');
      return null;
    }
  },

  // Get popular brands (public route)
  getPopularBrands: async (limit: number = 10): Promise<Brand[]> => {
    try {
      const response = await publicApiRequest(`/brands/public/brands/popular/brands?limit=${limit}`) as ApiResponse;
      
      if (response.success && response.data) {
        let brandsArray: Brand[] = [];
        
        if (response.data.brands && Array.isArray(response.data.brands)) {
          brandsArray = response.data.brands;
        } else if (Array.isArray(response.data)) {
          brandsArray = response.data;
        }
        
        return brandsArray.map((brand: Brand) => ({
          ...brand,
          logo: brand.logo ? getImageUrl(brand.logo) : undefined,
          productCount: brand._count?.products || 0
        }));
      }
      return [];
    } catch (error) {
      handleApiError(error, 'Failed to fetch popular brands');
      return [];
    }
  },

  // Search brands (public route)
  searchBrands: async (query: string, page: number = 1, limit: number = 10): Promise<{ brands: Brand[]; pagination: any }> => {
    try {
      const response = await publicApiRequest(`/brands/public/brands/search/brands?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`) as ApiResponse;
      
      if (response.success && response.data) {
        const brandsArray = response.data.brands || [];
        const pagination = response.data.pagination || {};
        
        return {
          brands: brandsArray.map((brand: Brand) => ({
            ...brand,
            logo: brand.logo ? getImageUrl(brand.logo) : undefined,
            productCount: brand._count?.products || 0
          })),
          pagination
        };
      }
      return { brands: [], pagination: {} };
    } catch (error) {
      handleApiError(error, 'Failed to search brands');
      return { brands: [], pagination: {} };
    }
  }
};