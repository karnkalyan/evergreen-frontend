import { apiRequest } from './api';
import { CartItem, ApiResponse } from '../types';

// Types for cart API responses
interface CartResponse {
  id: number;
  userId: number;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

interface CartItemRequest {
  productId: number;
  variantOptionId?: number;
  quantity: number;
}

// Helper function to get full image URL (same as product service)
const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '/placeholder-image.jpg';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a relative path, prepend the base URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  
  // Ensure the path starts with a slash
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${normalizedPath}`;
};

// Helper function to process product images (same as product service)
const processProductImages = (product: any): any => {
  if (!product) return product;
  
  // Process images array if it exists
  const processedImages = product.images?.map((img: any) => {
    // Handle both string URLs and image objects
    if (typeof img === 'string') {
      return {
        url: getImageUrl(img),
        isPrimary: false
      };
    } else if (typeof img === 'object' && img !== null) {
      return {
        ...img,
        url: getImageUrl(img.url || img),
        // Ensure isPrimary is properly set
        isPrimary: img.isPrimary || (img.fieldName === 'primaryImage')
      };
    }
    return img;
  }) || [];
  
  return {
    ...product,
    images: processedImages
  };
};

// Helper function to get primary image URL from processed images
const getPrimaryImageUrl = (images: any[]): string => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return '/images/placeholder-product.jpg';
  }

  // Try to find the primary image first
  const primaryImage = images.find(img => img.isPrimary === true);
  if (primaryImage) {
    return primaryImage.url;
  }

  // Otherwise use the first image
  const firstImage = images[0];
  return firstImage.url || firstImage;
};

export const cartService = {
  /**
   * Get user's cart
   */
  getCart: async (userId: number): Promise<CartItem[]> => {
    try {
      const response = await apiRequest(`/cart/${userId}`) as ApiResponse;
      console.log('🛒 CART API RESPONSE:', response);

      let cartItems: CartItem[] = [];
      
      // Check for wrapped response structure
      if (response.success && response.data) {
        // Handle both direct items array and cart object with items
        if (Array.isArray(response.data.items)) {
          cartItems = response.data.items;
        } else if (Array.isArray(response.data)) {
          cartItems = response.data;
        } else if (response.data && Array.isArray(response.data.items)) {
          cartItems = response.data.items;
        }
      }
      // Check for direct items array
      else if (Array.isArray(response)) {
        cartItems = response;
      }
      // Check for raw cart object
      else if (response && Array.isArray(response.items)) {
        cartItems = response.items;
      }

      // Process cart items and ensure proper structure with image processing
      return cartItems.map((item: any) => {
        // Process product images
        const processedProduct = processProductImages(item.product);
        
        return {
          ...item,
          product: processedProduct
        };
      });
      
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Return empty array instead of throwing to prevent app crashes
      return [];
    }
  },

  /**
   * Add item to cart
   */
addToCart: async (userId: number, cartData: CartItemRequest): Promise<ApiResponse> => {
  try {
    console.log('🛒 [Frontend] Adding to cart:', cartData);
    
    const response = await apiRequest(`/cart/${userId}/items`, {
      method: 'POST',
      body: JSON.stringify(cartData),
    }) as ApiResponse;

    console.log('➕ ADD TO CART RESPONSE:', response);
    return response;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
},

  /**
   * Update cart item quantity
   */
  updateCartItem: async (userId: number, itemId: number, quantity: number): Promise<ApiResponse> => {
    try {
      const response = await apiRequest(`/cart/${userId}/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      }) as ApiResponse;

      console.log('✏️ UPDATE CART ITEM RESPONSE:', response);
      return response;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (userId: number, itemId: number): Promise<ApiResponse> => {
    try {
      const response = await apiRequest(`/cart/${userId}/items/${itemId}`, {
        method: 'DELETE',
      }) as ApiResponse;

      console.log('🗑️ REMOVE FROM CART RESPONSE:', response);
      return response;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  },

  /**
   * Clear entire cart
   */
  clearCart: async (userId: number): Promise<ApiResponse> => {
    try {
      const response = await apiRequest(`/cart/${userId}/clear`, {
        method: 'DELETE',
      }) as ApiResponse;

      console.log('🔄 CLEAR CART RESPONSE:', response);
      return response;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  /**
   * Get cart total (quantity and price)
   */
  getCartTotal: async (userId: number): Promise<{ total: number; itemCount: number }> => {
    try {
      const response = await apiRequest(`/cart/${userId}/total`) as ApiResponse;
      console.log('💰 CART TOTAL RESPONSE:', response);

      let totalData = { total: 0, itemCount: 0 };
      
      // Check for wrapped response structure
      if (response.success && response.data) {
        totalData = response.data;
      }
      // Check for direct response
      else if (response.total !== undefined) {
        totalData = response as { total: number; itemCount: number };
      }

      return totalData;
    } catch (error) {
      console.error('Error fetching cart total:', error);
      return { total: 0, itemCount: 0 };
    }
  },

  /**
   * Sync local cart with server (after login)
   * This merges guest cart items with server cart
   */
syncCart: async (userId: number, localCartItems: CartItem[]): Promise<ApiResponse> => {
  try {
    console.log('🔄 Starting cart sync for user:', userId);
    console.log('📦 Local cart items to sync:', localCartItems);

    if (localCartItems.length === 0) {
      console.log('📭 Local cart is empty, no sync needed');
      return {
        success: true,
        message: 'No items to sync',
        data: { syncedItems: 0, failedItems: 0 }
      };
    }

    // Clear existing server cart first
    console.log('🧹 Clearing existing server cart...');
    await cartService.clearCart(userId);

    // Add all local cart items to server
    console.log('📤 Adding local cart items to server...');
    const syncPromises = localCartItems.map(async (localItem) => {
      try {
        console.log(`➕ Adding item to server cart:`, {
          productId: localItem.product.id,
          variantOptionId: localItem.variantDetail.id, // Use the variant option ID
          quantity: localItem.quantity,
          variant: localItem.variantDetail.label
        });

        return await cartService.addToCart(userId, {
          productId: localItem.product.id,
          variantOptionId: localItem.variantDetail.id || undefined, // Handle both cases
          quantity: localItem.quantity
        });
      } catch (error) {
        console.error(`❌ Failed to add item ${localItem.product.id}:`, error);
        throw error;
      }
    });

    const results = await Promise.allSettled(syncPromises);
    const successfulOperations = results.filter(result => result.status === 'fulfilled');
    const failedOperations = results.filter(result => result.status === 'rejected');

    if (failedOperations.length > 0) {
      console.warn('Some cart sync operations failed:', failedOperations);
    }

    console.log(`✅ Cart sync completed: ${successfulOperations.length} successful, ${failedOperations.length} failed`);

    return {
      success: true,
      message: 'Cart synced successfully',
      data: {
        syncedItems: successfulOperations.length,
        failedItems: failedOperations.length
      }
    };
  } catch (error) {
    console.error('Error syncing cart:', error);
    throw error;
  }
},
  // Helper functions for external use (same as product service)
  getImageUrl,
  processProductImages,
  getPrimaryImageUrl
};