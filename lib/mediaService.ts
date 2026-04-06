import { apiRequest, publicApiRequest, handleApiError } from './api';

// Helper function to get full media URL
export const getMediaUrl = (mediaPath) => {
  if (!mediaPath) return '/placeholder-image.jpg';
  
  if (mediaPath.startsWith('http')) {
    return mediaPath;
  }
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
  return `${baseUrl}${mediaPath}`;
};

// Media types for filtering
export const MEDIA_TYPES = {
  IMAGE: 'IMAGE',
  DOCUMENT: 'DOCUMENT', 
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  OTHER: 'OTHER',
  ALL: 'ALL'
};

export const mediaService = {
  // Get all media with pagination and filters
  getMedia: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await apiRequest(`/media?${queryParams}`);
      
      if (response.success && response.data) {
        // Add full URLs to media items
        const mediaWithFullUrls = response.data.media.map(media => ({
          ...media,
          fullUrl: getMediaUrl(media.url),
          thumbnailUrl: getMediaUrl(media.thumbnailUrl)
        }));

        return {
          ...response.data,
          media: mediaWithFullUrls
        };
      }
      
      return {
        media: [],
        pagination: {}
      };
    } catch (error) {
      handleApiError(error, 'Failed to fetch media');
      return {
        media: [],
        pagination: {}
      };
    }
  },

  // Get media by ID
  getMediaById: async (id) => {
    try {
      const response = await apiRequest(`/media/${id}`);
      
      if (response.success && response.data) {
        const media = response.data;
        return {
          ...media,
          fullUrl: getMediaUrl(media.url),
          thumbnailUrl: getMediaUrl(media.thumbnailUrl)
        };
      }
      return null;
    } catch (error) {
      handleApiError(error, 'Failed to fetch media');
      return null;
    }
  },

  // Upload media files
  uploadMedia: async (formData) => {
    try {
      const response = await apiRequest('/media/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.success && response.data) {
        // Add full URLs to uploaded media
        const mediaWithFullUrls = response.data.media.map(media => ({
          ...media,
          fullUrl: getMediaUrl(media.url),
          thumbnailUrl: getMediaUrl(media.thumbnailUrl)
        }));

        return {
          ...response,
          data: {
            media: mediaWithFullUrls
          }
        };
      }
      
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to upload media');
      throw error;
    }
  },

  // Update media metadata
  updateMedia: async (id, updateData) => {
    try {
      const response = await apiRequest(`/media/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (response.success && response.data) {
        const media = response.data;
        return {
          ...response,
          data: {
            ...media,
            fullUrl: getMediaUrl(media.url),
            thumbnailUrl: getMediaUrl(media.thumbnailUrl)
          }
        };
      }
      
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to update media');
      throw error;
    }
  },

  // Delete media
  deleteMedia: async (id) => {
    try {
      const response = await apiRequest(`/media/${id}`, {
        method: 'DELETE',
      });
      
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to delete media');
      throw error;
    }
  },

  // Bulk delete media
  bulkDeleteMedia: async (ids) => {
    try {
      const response = await apiRequest('/media/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });
      
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to delete media');
      throw error;
    }
  },

  // Get media statistics
  getMediaStats: async () => {
    try {
      const response = await apiRequest('/media/stats');
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to fetch media statistics');
      return {
        success: false,
        data: {}
      };
    }
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file type icon
  getFileTypeIcon: (mimeType, type) => {
    if (type === 'IMAGE') return '🖼️';
    if (type === 'VIDEO') return '🎥';
    if (type === 'AUDIO') return '🎵';
    if (type === 'DOCUMENT') {
      if (mimeType.includes('pdf')) return '📄';
      if (mimeType.includes('word')) return '📝';
      if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊';
      if (mimeType.includes('text')) return '📃';
      return '📄';
    }
    return '📎';
  }
};

// Public media service for frontend (if needed)
export const publicMediaService = {
  getMediaById: async (id) => {
    try {
      const response = await publicApiRequest(`/media/public/${id}`);
      
      if (response.success && response.data) {
        const media = response.data;
        return {
          ...media,
          fullUrl: getMediaUrl(media.url),
          thumbnailUrl: getMediaUrl(media.thumbnailUrl)
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching media:', error);
      return null;
    }
  }
};