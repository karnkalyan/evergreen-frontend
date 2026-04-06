// lib/blogInteractionService.js
import { apiRequest, handleApiError } from './api';

export const blogInteractionService = {
  // Like a blog post
  likeBlogPost: async (postId) => {
    try {
      const response = await apiRequest(`/blog-posts/${postId}/like`, {
        method: 'POST',
      });
      
      if (response && response.success) {
        return {
          success: true,
          message: response.message,
          data: response.data
        };
      }
      
      throw new Error(response?.error || 'Failed to like blog post');
    } catch (error) {
      handleApiError(error, 'Failed to like blog post');
      throw error;
    }
  },

  // Unlike a blog post
  unlikeBlogPost: async (postId) => {
    try {
      const response = await apiRequest(`/blog-posts/${postId}/unlike`, {
        method: 'POST',
      });
      
      if (response && response.success) {
        return {
          success: true,
          message: response.message,
          data: response.data
        };
      }
      
      throw new Error(response?.error || 'Failed to unlike blog post');
    } catch (error) {
      handleApiError(error, 'Failed to unlike blog post');
      throw error;
    }
  },

  // Get user's like status for a post
  getLikeStatus: async (postId) => {
    try {
      const response = await apiRequest(`/blog-posts/${postId}/like-status`);
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error(response?.error || 'Failed to get like status');
    } catch (error) {
      handleApiError(error, 'Failed to get like status');
      throw error;
    }
  },

  // Share a blog post
  shareBlogPost: async (postId, platform = 'general') => {
    try {
      const response = await apiRequest(`/blog-posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform }),
      });
      
      if (response && response.success) {
        return {
          success: true,
          message: response.message,
          data: response.data
        };
      }
      
      throw new Error(response?.error || 'Failed to share blog post');
    } catch (error) {
      handleApiError(error, 'Failed to share blog post');
      throw error;
    }
  }
};

export default blogInteractionService;