import { apiRequest, publicApiRequest, handleApiError } from './api';
import { Category, ApiResponse } from '../types';

// Helper function to get full image URL
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '/placeholder-image.jpg';

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  const baseUrl = '/api'
  return `${baseUrl}${imagePath}`;
};

// Existing categoryService for admin (authenticated routes)
export const categoryService = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await apiRequest('/categories') as ApiResponse;
      console.log('📊 RAW CATEGORIES API RESPONSE:', response); // Add this line

      console.log('Categories API Response:', response); // Debug log

      // Handle different response structures
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          // Case 1: response.data is directly the array
          return response.data.map((cat: Category) => ({
            ...cat,
            catLogo: cat.catLogo ? getImageUrl(cat.catLogo) : undefined,
            image: cat.image ? getImageUrl(cat.image) : undefined,
            banner: cat.banner ? getImageUrl(cat.banner) : undefined
          }));
        } else if (response.data.categories && Array.isArray(response.data.categories)) {
          // Case 2: response.data has categories property
          return response.data.categories.map((cat: Category) => ({
            ...cat,
            catLogo: cat.catLogo ? getImageUrl(cat.catLogo) : undefined,
            image: cat.image ? getImageUrl(cat.image) : undefined,
            banner: cat.banner ? getImageUrl(cat.banner) : undefined
          }));
        }
      }

      // If we get here, return empty array
      console.warn('Unexpected categories response structure:', response);
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get category by ID
  getCategoryById: async (id: number): Promise<Category | null> => {
    try {
      const response = await apiRequest(`/categories/${id}`) as ApiResponse;

      if (response.success && response.data) {
        const category = response.data;
        return {
          ...category,
          catLogo: category.catLogo ? getImageUrl(category.catLogo) : undefined,
          image: category.image ? getImageUrl(category.image) : undefined,
          banner: category.banner ? getImageUrl(category.banner) : undefined
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  },

  // Create category
  createCategory: async (categoryData: FormData): Promise<ApiResponse> => {
    const response = await apiRequest('/categories', {
      method: 'POST',
      body: categoryData,
    }) as ApiResponse;

    return response;
  },

  // Update category
  updateCategory: async (id: number, categoryData: FormData): Promise<ApiResponse> => {
    const response = await apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: categoryData,
    }) as ApiResponse;

    return response;
  },

  // Delete category
  deleteCategory: async (id: number): Promise<ApiResponse> => {
    const response = await apiRequest(`/categories/${id}`, {
      method: 'DELETE',
    }) as ApiResponse;

    return response;
  },

  // Get category hierarchy
  getCategoryHierarchy: async (): Promise<Category[]> => {
    try {
      const response = await apiRequest('/categories/hierarchy/tree') as ApiResponse;

      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          return response.data;
        } else if (Array.isArray(response.data.categories)) {
          return response.data.categories;
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching category hierarchy:', error);
      return [];
    }
  }
};

// NEW: Public category service for frontend using public routes
export const publicCategoryService = {
  // Get all categories (public route)
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await publicApiRequest('/categories/public/categories') as ApiResponse;
      console.log('📊 RAW PUBLIC CATEGORIES API RESPONSE:', response);

      console.log('Public Categories API Response:', response);

      // Handle different response structures
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          return response.data.map((cat: Category) => ({
            ...cat,
            catLogo: cat.catLogo ? getImageUrl(cat.catLogo) : undefined,
            image: cat.image ? getImageUrl(cat.image) : undefined,
            banner: cat.banner ? getImageUrl(cat.banner) : undefined
          }));
        } else if (response.data.categories && Array.isArray(response.data.categories)) {
          return response.data.categories.map((cat: Category) => ({
            ...cat,
            catLogo: cat.catLogo ? getImageUrl(cat.catLogo) : undefined,
            image: cat.image ? getImageUrl(cat.image) : undefined,
            banner: cat.banner ? getImageUrl(cat.banner) : undefined
          }));
        }
      }

      console.warn('Unexpected public categories response structure:', response);
      return [];
    } catch (error) {
      handleApiError(error, 'Failed to fetch categories');
      return [];
    }
  },

  // Get category by ID (public route)
  getCategoryById: async (id: number): Promise<Category | null> => {
    try {
      const response = await publicApiRequest(`/categories/public/categories/${id}`) as ApiResponse;

      if (response.success && response.data) {
        const category = response.data;
        return {
          ...category,
          catLogo: category.catLogo ? getImageUrl(category.catLogo) : undefined,
          image: category.image ? getImageUrl(category.image) : undefined,
          banner: category.banner ? getImageUrl(category.banner) : undefined
        };
      }
      return null;
    } catch (error) {
      handleApiError(error, 'Failed to fetch category');
      return null;
    }
  },

  // Get category by slug (public route)
  getCategoryBySlug: async (slug: string): Promise<Category | null> => {
    try {
      const response = await publicApiRequest(`/categories/public/categories/slug/${slug}`) as ApiResponse;

      if (response.success && response.data) {
        const category = response.data;
        return {
          ...category,
          catLogo: category.catLogo ? getImageUrl(category.catLogo) : undefined,
          image: category.image ? getImageUrl(category.image) : undefined,
          banner: category.banner ? getImageUrl(category.banner) : undefined
        };
      }
      return null;
    } catch (error) {
      handleApiError(error, 'Failed to fetch category');
      return null;
    }
  },

  // Get category hierarchy (public route)
  getCategoryHierarchy: async (): Promise<Category[]> => {
    try {
      const response = await publicApiRequest('/categories/public/categories/hierarchy/tree') as ApiResponse;

      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          return response.data;
        } else if (Array.isArray(response.data.categories)) {
          return response.data.categories;
        }
      }
      return [];
    } catch (error) {
      handleApiError(error, 'Failed to fetch category hierarchy');
      return [];
    }
  }
};