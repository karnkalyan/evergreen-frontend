// lib/blogService.js
import { apiRequest, publicApiRequest, handleApiError } from './api';

// Helper function to generate slug from title
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Helper function to generate meta title
export const generateMetaTitle = (title) => {
  return `${title} | Your Blog Name`;
};

// Helper function to generate meta description from content
export const generateMetaDescription = (content, maxLength = 160) => {
  if (!content) return '';
  // Remove HTML tags and get plain text
  const plainText = content.replace(/<[^>]*>/g, '');
  return plainText.length > maxLength 
    ? plainText.substring(0, maxLength) + '...'
    : plainText;
};

// Function to sanitize and optimize blog content
export const sanitizeBlogContent = (content) => {
  if (!content) return '';
  
  let sanitized = content;
  
  // Remove very large base64 images (over 50KB) and replace with placeholder
  const base64Regex = /data:image\/[^;]+;base64,([^"']{50000,})/g;
  sanitized = sanitized.replace(base64Regex, (match) => {
    console.warn('Removing large base64 image from content');
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBSZW1vdmVkIChUb28gTGFyZ2UpPC90ZXh0Pjwvc3ZnPg==';
  });
  
  return sanitized;
};

export const blogService = {
  // Get all blog posts with pagination and filters
  getBlogPosts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add all parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      // Always include admin=true for admin panel requests
      if (!queryParams.has('admin')) {
        queryParams.append('admin', 'true');
      }

      const response = await apiRequest(`/blog-posts?${queryParams}`);
      
      if (!response || !response.success) {
        throw new Error(response?.error || 'Failed to fetch blog posts');
      }
      
      return {
        posts: response.data?.posts || [],
        pagination: response.data?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        }
      };
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      // Return empty structure instead of throwing to prevent UI crashes
      return {
        posts: [],
        pagination: {
          page: 1,
          limit: params.limit || 10,
          total: 0,
          pages: 0
        }
      };
    }
  },

  // Get blog post by ID
  getBlogPostById: async (id) => {
    try {
      const response = await apiRequest(`/blog-posts/${id}`);
      
      if (response && response.success) {
        return response.data || response;
      }
      
      throw new Error(response?.error || 'Failed to fetch blog post');
    } catch (error) {
      handleApiError(error, 'Failed to fetch blog post');
      throw error;
    }
  },

  // Get blog post by slug (public)
  getBlogPostBySlug: async (slug) => {
    try {
      const response = await publicApiRequest(`/blog-posts/slug/${slug}`);
      
      if (response && response.success) {
        return response.data || response;
      }
      
      throw new Error(response?.error || 'Failed to fetch blog post');
    } catch (error) {
      handleApiError(error, 'Failed to fetch blog post');
      throw error;
    }
  },

  // Create blog post
  createBlogPost: async (postData) => {
    try {
      // Sanitize content before sending
      const sanitizedData = {
        ...postData,
        content: sanitizeBlogContent(postData.content)
      };

      const response = await apiRequest('/blog-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      });
      
      if (response && response.success) {
        return {
          success: true,
          message: response.message,
          data: response.data
        };
      }
      
      throw new Error(response?.error || 'Failed to create blog post');
    } catch (error) {
      handleApiError(error, 'Failed to create blog post');
      throw error;
    }
  },

  // Update blog post
  updateBlogPost: async (id, postData) => {
    try {
      // Sanitize and optimize the data before sending
      const sanitizedData = {
        ...postData,
        content: sanitizeBlogContent(postData.content)
      };

      console.log('Sending update request for post:', id, 'Content length:', sanitizedData.content?.length);

      const response = await apiRequest(`/blog-posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      });
      
      if (response && response.success) {
        return {
          success: true,
          message: response.message,
          data: response.data
        };
      }
      
      throw new Error(response?.error || 'Failed to update blog post');
    } catch (error) {
      console.error('Update blog post error details:', error);
      handleApiError(error, 'Failed to update blog post');
      throw error;
    }
  },

  // Delete blog post
  deleteBlogPost: async (id) => {
    try {
      const response = await apiRequest(`/blog-posts/${id}`, {
        method: 'DELETE',
      });
      
      if (response && response.success) {
        return {
          success: true,
          message: response.message
        };
      }
      
      throw new Error(response?.error || 'Failed to delete blog post');
    } catch (error) {
      handleApiError(error, 'Failed to delete blog post');
      throw error;
    }
  },

  // Toggle blog post status (active/inactive)
  toggleBlogPostStatus: async (id) => {
    try {
      const response = await apiRequest(`/blog-posts/${id}/toggle-status`, {
        method: 'PATCH',
      });
      
      if (response && response.success) {
        return {
          success: true,
          message: response.message,
          data: response.data
        };
      }
      
      throw new Error(response?.error || 'Failed to toggle blog post status');
    } catch (error) {
      handleApiError(error, 'Failed to toggle blog post status');
      throw error;
    }
  },

  // Utility functions
  generateSlug,
  generateMetaTitle,
  generateMetaDescription,
  sanitizeBlogContent,

  // Auto-generate all SEO fields from title and content
  autoGenerateSEOFields: (title, content, existingFields = {}) => {
    const slug = existingFields.slug || generateSlug(title);
    const metaTitle = existingFields.metaTitle || generateMetaTitle(title);
    const metaDescription = existingFields.metaDescription || generateMetaDescription(content);
    const excerpt = existingFields.excerpt || generateMetaDescription(content, 300);
    
    return {
      slug,
      metaTitle,
      metaDescription,
      excerpt
    };
  }
};

// Public blog service for frontend (without admin parameter)
export const publicBlogService = {
  getBlogPosts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await publicApiRequest(`/blog-posts?${queryParams}`);
      
      if (response && response.success && response.data) {
        return {
          posts: response.data.posts || [],
          pagination: response.data.pagination || {}
        };
      }
      
      return {
        posts: [],
        pagination: {}
      };
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return {
        posts: [],
        pagination: {}
      };
    }
  },

  getBlogPostBySlug: async (slug) => {
    try {
      const response = await publicApiRequest(`/blog-posts/slug/${slug}`);
      
      if (response && response.success) {
        return response.data || response;
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      throw error;
    }
  }
};

export default blogService;