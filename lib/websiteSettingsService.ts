import { apiRequest, publicApiRequest, handleApiError, handleApiSuccess } from './api';
import { 
  WebsiteSettings, 
  SeoPage, 
  NavigationMenu, 
  ApiResponse,
  WebsiteSettingsFormData,
  SeoPageFormData,
  NavigationMenuFormData
} from '../types';

export const websiteSettingsService = {
  // Public: Get website settings
  getWebsiteSettings: async (): Promise<WebsiteSettings | null> => {
    try {
      const response = await publicApiRequest('/website/public/settings') as ApiResponse;
      console.log('🌐 WEBSITE SETTINGS API RESPONSE:', response);

      if (response.success && response.data) {
        return response.data;
      }
      
      console.warn('Unexpected website settings response structure:', response);
      return null;
    } catch (error) {
      console.error('Error fetching website settings:', error);
      return null;
    }
  },

  // Admin: Update website settings
  updateWebsiteSettings: async (settingsData: WebsiteSettingsFormData): Promise<ApiResponse> => {
    const response = await apiRequest('/website/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsData),
    }) as ApiResponse;
    
    return response;
  },

  // Public: Get page SEO
  getPageSeo: async (pageType: string, pageSlug?: string, pageId?: number): Promise<SeoPage | null> => {
    try {
      const params = new URLSearchParams({ pageType });
      if (pageSlug) params.append('pageSlug', pageSlug);
      if (pageId) params.append('pageId', pageId.toString());
      
      const response = await publicApiRequest(`/website/public/seo?${params}`) as ApiResponse;
      
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching page SEO:', error);
      return null;
    }
  },

  // Admin: Update page SEO
  updatePageSeo: async (seoData: SeoPageFormData): Promise<ApiResponse> => {
    const response = await apiRequest('/website/seo', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(seoData),
    }) as ApiResponse;
    
    return response;
  },

  // Public: Get navigation menus
  getNavigationMenus: async (location?: string): Promise<NavigationMenu[]> => {
    try {
      const url = location 
        ? `/website/public/navigation?location=${location}`
        : '/website/public/navigation';
      
      const response = await publicApiRequest(url) as ApiResponse;
      
      if (response.success && response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      if (Array.isArray(response)) {
        return response;
      }
      
      console.warn('Unexpected navigation menus response structure:', response);
      return [];
    } catch (error) {
      console.error('Error fetching navigation menus:', error);
      return [];
    }
  },

  // Admin: Create navigation menu
  createNavigationMenu: async (menuData: NavigationMenuFormData): Promise<ApiResponse> => {
    const response = await apiRequest('/website/navigation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(menuData),
    }) as ApiResponse;
    
    return response;
  },

  // Admin: Update navigation menu
  updateNavigationMenu: async (id: number, menuData: Partial<NavigationMenuFormData>): Promise<ApiResponse> => {
    const response = await apiRequest(`/website/navigation/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(menuData),
    }) as ApiResponse;
    
    return response;
  },

  // Admin: Delete navigation menu
  deleteNavigationMenu: async (id: number): Promise<ApiResponse> => {
    const response = await apiRequest(`/website/navigation/${id}`, {
      method: 'DELETE',
    }) as ApiResponse;
    
    return response;
  }
};