import { apiRequest, publicApiRequest, handleApiError } from './api';
import { Product, Category, Brand, Country } from '../types';

// Helper function to get full image URL
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '/placeholder-image.jpg';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a relative path, prepend the base URL
  // Use environment variable or default to the current origin for client-side
  const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  
  // Ensure the path starts with a slash
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${normalizedPath}`;
};

// Helper function to process product images
export const processProductImages = (product: any): Product => {
  if (!product) return product;
  
  // Process images array if it exists
  const processedImages = product.images?.map((img: any) => ({
    ...img,
    url: getImageUrl(img.url),
    // Ensure isPrimary is properly set
    isPrimary: img.isPrimary || (img.fieldName === 'primaryImage')
  })) || [];
  
  return {
    ...product,
    images: processedImages
  };
};

// Helper to parse array fields from API
export const parseArrayField = (field: any): string[] => {
  if (Array.isArray(field)) {
    return field;
  } else if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Error parsing field as JSON, trying as string:', field);
      // If it's a string but not JSON, try to split by comma
      if (typeof field === 'string' && field.includes(',')) {
        return field.split(',').map(item => item.trim()).filter(item => item);
      }
      return field ? [field] : [];
    }
  }
  return [];
};

// Existing productService for admin (authenticated routes)
// Existing productService for admin (authenticated routes)
export const productService = {
  // FIXED: Use admin route instead of public route
  getProducts: async (): Promise<Product[]> => {
    try {
      console.log('ðŸ”„ Fetching products from ADMIN API...');
      
      // Use apiRequest (authenticated) instead of publicApiRequest
      const response = await apiRequest('/products');
      console.log('ðŸ“¦ Admin products API response:', response);
      
      let products: any[] = [];
      
      // Handle the admin API response structure: { success: true, data: { products: [...] } }
      if (response && response.success && response.data && Array.isArray(response.data.products)) {
        products = response.data.products;
      } 
      // Handle direct array response (fallback)
      else if (Array.isArray(response)) {
        products = response;
      } 
      // Handle other possible structures for backward compatibility
      else if (response && Array.isArray(response.products)) {
        products = response.products;
      } else if (response && Array.isArray(response.data)) {
        products = response.data;
      } else {
        console.warn('âŒ Unexpected admin products response structure:', response);
        return [];
      }
      
      // Process image URLs for all products
      const processedProducts = products.map(processProductImages);
      console.log('âœ… Processed admin products:', processedProducts.length);
      return processedProducts;
    } catch (error) {
      console.error('âŒ Error fetching admin products:', error);
      handleApiError(error, 'Failed to fetch products');
      return [];
    }
  },

  getProductsPaginated: async (page: number = 1, limit: number = 10, search?: string): Promise<any> => {
    try {
      console.log(`ðŸ”„ Fetching paginated admin products: page=${page}, limit=${limit}, search=${search}`);
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (search) params.append('search', search);

      const response = await apiRequest(`/products?${params.toString()}`);
      console.log('ðŸ“¦ Paginated products response:', response);

      let products: any[] = [];
      let pagination: any = {
        page,
        limit,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null
      };

      if (response && response.success && response.data) {
        products = Array.isArray(response.data.products) ? response.data.products : [];
        pagination = response.data.pagination || pagination;
      } else if (response && Array.isArray(response.products)) {
        products = response.products;
      } else if (Array.isArray(response)) {
        products = response;
      } else if (response && Array.isArray(response.data)) {
        products = response.data;
      }

      return {
        products: products.map(processProductImages),
        pagination
      };
    } catch (error) {
      console.error('âŒ Error fetching paginated admin products:', error);
      handleApiError(error, 'Failed to fetch products');
      return {
        products: [],
        pagination: {
          page,
          limit,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null
        }
      };
    }
  },

  getProductBySlug: async (slug: string): Promise<Product | null> => {
    try {
      console.log(`ðŸ”„ Fetching product by slug from ADMIN API: ${slug}`);
      
      // Use admin route without country parameter
      const productData = await apiRequest(`/products/slug/${slug}`);
      console.log('ðŸ“¦ Admin product data received:', productData);
      
      if (!productData) {
        console.warn('âŒ No product data found for slug:', slug);
        return null;
      }
      
      const processedProduct = processProductImages(productData);
      console.log('âœ… Processed admin product:', processedProduct);
      return processedProduct;
    } catch (error) {
      console.error('âŒ Error fetching admin product by slug:', error);
      handleApiError(error, 'Failed to fetch product');
      return null;
    }
  },
  // Get product by ID with processed images (admin route)
  getProductById: async (id: number): Promise<Product | null> => {
    try {
      console.log(`ðŸ”„ Fetching product by ID from ADMIN API: ${id}`);
      const productData = await apiRequest(`/products/${id}`);
      console.log('ðŸ“¦ Admin product by ID data:', productData);
      return productData ? processProductImages(productData) : null;
    } catch (error) {
      console.error('âŒ Error fetching admin product by ID:', error);
      handleApiError(error, 'Failed to fetch product');
      return null;
    }
  },

  // Create product (admin route)
  createProduct: async (productData: FormData): Promise<any> => {
    try {
      console.log('ðŸ”„ Creating product via ADMIN API...');
      const result = await apiRequest('/products', {
        method: 'POST',
        body: productData,
      });
      console.log('âœ… Product creation result:', result);
      return result;
    } catch (error) {
      console.error('âŒ Error creating product:', error);
      throw error;
    }
  },

  // Update product (admin route)
  updateProduct: async (id: number, productData: FormData): Promise<any> => {
    try {
      console.log(`ðŸ”„ Updating product via ADMIN API: ${id}`);
      const result = await apiRequest(`/products/${id}`, {
        method: 'PUT',
        body: productData,
      });
      console.log('âœ… Product update result:', result);
      return result;
    } catch (error) {
      console.error('âŒ Error updating product:', error);
      throw error;
    }
  },

  // Delete product (admin route)
  deleteProduct: async (id: number): Promise<any> => {
    try {
      console.log(`ðŸ”„ Deleting product via ADMIN API: ${id}`);
      const result = await apiRequest(`/products/${id}`, {
        method: 'DELETE',
      });
      console.log('âœ… Product deletion result:', result);
      return result;
    } catch (error) {
      console.error('âŒ Error deleting product:', error);
      throw error;
    }
  },
  
  // Get categories (admin route)
  getCategories: async (): Promise<Category[]> => {
    try {
      console.log('ðŸ”„ Fetching categories from ADMIN API...');
      const response = await apiRequest('/categories');
      console.log('ðŸ“¦ Admin categories response:', response);
      
      if (response && response.success && response.data) {
        if (Array.isArray(response.data.categories)) {
          return response.data.categories;
        } else if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      
      if (Array.isArray(response)) {
        return response;
      } else if (response && Array.isArray(response.categories)) {
        return response.categories;
      } else if (response && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('âŒ Unexpected admin categories response structure:', response);
        return [];
      }
    } catch (error) {
      console.error('âŒ Error fetching admin categories:', error);
      handleApiError(error, 'Failed to fetch categories');
      return [];
    }
  },

  // Get brands (admin route)
  getBrands: async (): Promise<Brand[]> => {
    try {
      console.log('ðŸ”„ Fetching brands from ADMIN API...');
      const response = await apiRequest('/brands');
      console.log('ðŸ“¦ Admin brands response:', response);
      
      // Handle the admin API response structure: { success: true, data: { brands: [...] } }
      if (response && response.success && response.data) {
        if (Array.isArray(response.data.brands)) {
          return response.data.brands;
        } else if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      
      // Fallback to old structure handling
      if (Array.isArray(response)) {
        return response;
      } else if (response && Array.isArray(response.brands)) {
        return response.brands;
      } else if (response && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('âŒ Unexpected admin brands response structure:', response);
        return [];
      }
    } catch (error) {
      console.error('âŒ Error fetching admin brands:', error);
      handleApiError(error, 'Failed to fetch brands');
      return [];
    }
  },

  // Helper functions for external use
  getImageUrl,
  parseArrayField
};

const buildPublicProductUrl = (endpoint: string, country?: Country | string) => {
  const code = typeof country === 'string' ? country : country?.code;
  if (code && code !== 'Global') {
    const separator = endpoint.includes('?') ? '&' : '?';
    return `${endpoint}${separator}country=${encodeURIComponent(code)}`;
  }
  return endpoint;
};

export const publicProductService = {
  getProducts: async (country?: Country | string): Promise<Product[]> => {
    try {
      console.log('Fetching products from public API...', country);
      const response = await publicApiRequest(buildPublicProductUrl('/products/public/products', country));
      console.log('Products API response:', response);
      
      let products: any[] = [];
      if (Array.isArray(response)) {
        products = response;
      } else if (response && Array.isArray(response.products)) {
        products = response.products;
      } else if (response && Array.isArray(response.data)) {
        products = response.data;
      } else if (response && response.success && Array.isArray(response.data?.products)) {
        products = response.data.products;
      } else {
        console.warn('Unexpected products response structure:', response);
        return [];
      }
      
      // Process image URLs for all products
      const processedProducts = products.map(processProductImages);
      console.log('Processed products:', processedProducts);
      return processedProducts;
    } catch (error) {
      handleApiError(error, 'Failed to fetch products');
      return [];
    }
  },
  getFeaturedProducts: async (country?: Country | string): Promise<Product[]> => {
    try {
      console.log('Fetching featured products from public API...', country);
      const response = await publicApiRequest(buildPublicProductUrl('/products/public/products/featured', country));
      console.log('Featured products API response:', response);
      
      let products: any[] = [];
      if (Array.isArray(response)) {
        products = response;
      } else if (response && Array.isArray(response.products)) {
        products = response.products;
      } else if (response && Array.isArray(response.data)) {
        products = response.data;
      } else if (response && response.success && Array.isArray(response.data?.products)) {
        products = response.data.products;
      } else {
        console.warn('Unexpected featured products response structure:', response);
        return [];
      }
      
      return products.map(processProductImages);
    } catch (error) {
      handleApiError(error, 'Failed to fetch featured products');
      return [];
    }
  },
  getTrendingProducts: async (country?: Country | string): Promise<Product[]> => {
    try {
      console.log('Fetching trending products from public API...', country);
      const response = await publicApiRequest(buildPublicProductUrl('/products/public/products/trending', country));
      console.log('Trending products API response:', response);
      
      let products: any[] = [];
      if (Array.isArray(response)) {
        products = response;
      } else if (response && Array.isArray(response.products)) {
        products = response.products;
      } else if (response && Array.isArray(response.data)) {
        products = response.data;
      } else if (response && response.success && Array.isArray(response.data?.products)) {
        products = response.data.products;
      } else {
        console.warn('Unexpected trending products response structure:', response);
        return [];
      }
      
      return products.map(processProductImages);
    } catch (error) {
      handleApiError(error, 'Failed to fetch trending products');
      return [];
    }
  },
  getProductBySlug: async (slug: string): Promise<Product | null> => {
    try {
      console.log(`Fetching product by slug from public API: ${slug}`);
      const productData = await publicApiRequest(`/products/public/products/slug/${slug}`);
      console.log('Product data received:', productData);
      
      if (!productData) {
        console.warn('No product data found for slug:', slug);
        return null;
      }
      
      // Handle different response structures
      const product = productData.data || productData.product || productData;
      const processedProduct = processProductImages(product);
      console.log('Processed product:', processedProduct);
      return processedProduct;
    } catch (error) {
      handleApiError(error, 'Failed to fetch product');
      return null;
    }
  },
  getProductById: async (id: number): Promise<Product | null> => {
    try {
      const productData = await publicApiRequest(`/products/public/products/${id}`);
      const product = productData.data || productData.product || productData;
      return product ? processProductImages(product) : null;
    } catch (error) {
      handleApiError(error, 'Failed to fetch product');
      return null;
    }
  },
  searchProducts: async (query: string, filters?: any): Promise<Product[]> => {
    try {
      const params = new URLSearchParams();
      params.append('search', query);
      
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key]) params.append(key, filters[key]);
        });
      }
      
      const response = await publicApiRequest(`/products/public/products/search/products?${params}`);
      
      let products: any[] = [];
      if (Array.isArray(response)) {
        products = response;
      } else if (response && Array.isArray(response.products)) {
        products = response.products;
      } else if (response && Array.isArray(response.data)) {
        products = response.data;
      } else if (response && response.success && Array.isArray(response.data?.products)) {
        products = response.data.products;
      } else {
        console.warn('Unexpected search products response structure:', response);
        return [];
      }
      
      return products.map(processProductImages);
    } catch (error) {
      handleApiError(error, 'Failed to search products');
      return [];
    }
  },

   getRecommendedProducts: async (productId: number): Promise<Product[]> => {
    try {
      const response = await api.get(`/products/${productId}/recommended`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recommended products:', error);
      throw error;
    }
  },

  getProductsByCategory: async (categoryId: number): Promise<Product[]> => {
    try {
      const response = await api.get(`/products/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }
};

// NEW: Public category service for frontend using public routes
export const publicCategoryService = {
  // Get categories (public route)
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await publicApiRequest('/public/categories');
      
      // Handle different response structures
      if (response && response.success && response.data) {
        if (Array.isArray(response.data.categories)) {
          return response.data.categories;
        } else if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      
      if (Array.isArray(response)) {
        return response;
      } else if (response && Array.isArray(response.categories)) {
        return response.categories;
      } else if (response && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected categories response structure:', response);
        return [];
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch categories');
      return [];
    }
  },

  // Get category by slug
  getCategoryBySlug: async (slug: string): Promise<Category | null> => {
    try {
      const response = await publicApiRequest(`/public/categories/slug/${slug}`);
      return response.data || response.category || response;
    } catch (error) {
      handleApiError(error, 'Failed to fetch category');
      return null;
    }
  }
};

// NEW: Public brand service for frontend using public routes
export const publicBrandService = {
  // Get brands (public route)
  getBrands: async (): Promise<Brand[]> => {
    try {
      const response = await publicApiRequest('/public/brands');
      console.log('Brands API response:', response);
      
      // Handle the new API response structure: { success: true, data: { brands: [...] } }
      if (response && response.success && response.data) {
        if (Array.isArray(response.data.brands)) {
          return response.data.brands;
        } else if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      
      // Fallback to old structure handling
      if (Array.isArray(response)) {
        return response;
      } else if (response && Array.isArray(response.brands)) {
        return response.brands;
      } else if (response && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected brands response structure:', response);
        return [];
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch brands');
      return [];
    }
  },

  // Get brand by slug
  getBrandBySlug: async (slug: string): Promise<Brand | null> => {
    try {
      const response = await publicApiRequest(`/public/brands/slug/${slug}`);
      return response.data || response.brand || response;
    } catch (error) {
      handleApiError(error, 'Failed to fetch brand');
      return null;
    }
  }
};