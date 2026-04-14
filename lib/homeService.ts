// src/lib/homepageService.ts
import { apiRequest } from './api';
import { HomepageSection, HomepageSectionType } from '../types';

export const homepageService = {
  // Get all homepage sections
  getHomepageSections: async (): Promise<HomepageSection[]> => {
    try {
      const response = await apiRequest('/homepage-layout');
      console.log('📄 HOMEPAGE SECTIONS API RAW RESPONSE:', response);

      let sectionsArray: HomepageSection[] = [];

      // Handle different response structures
      if (response.success && response.data) {
        sectionsArray = response.data.sections || [];
      } else if (response.sections && Array.isArray(response.sections)) {
        sectionsArray = response.sections;
      } else if (Array.isArray(response)) {
        sectionsArray = response;
      } else {
        // console.warn('Unexpected homepage sections response structure:', response);
        return [];
      }

      // console.log('✅ PROCESSED HOMEPAGE SECTIONS DATA:', {
      //   sectionsCount: sectionsArray.length
      // });

      return sectionsArray;
    } catch (error) {
      // console.error('Error fetching homepage sections:', error);
      throw error;
    }
  },

  // Get homepage section by ID
  getHomepageSectionById: async (id: string): Promise<HomepageSection | null> => {
    try {
      const response = await apiRequest(`/homepage-layout/${id}`);
      // console.log('📋 HOMEPAGE SECTION BY ID RESPONSE:', response);

      let section: HomepageSection | null = null;

      // Handle different response structures
      if (response.success && response.data?.section) {
        section = response.data.section;
      } else if (response.section) {
        section = response.section;
      } else if (response.id === id) {
        section = response;
      }

      return section;
    } catch (error) {
      // console.error('Error fetching homepage section:', error);
      throw error;
    }
  },

  // Create homepage section
  createHomepageSection: async (sectionData: {
    type: HomepageSectionType;
    title?: string;
    enabled?: boolean;
    config?: any;
    parentId?: string;
  }): Promise<HomepageSection> => {
    try {
      const response = await apiRequest('/homepage-layout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sectionData),
      });

      console.log('🎯 CREATE HOMEPAGE SECTION RESPONSE:', response);

      let section: HomepageSection;

      if (response.success && response.data?.section) {
        section = response.data.section;
      } else if (response.section) {
        section = response.section;
      } else if (response.id) {
        section = response;
      } else {
        throw new Error(response.error || response.message || 'Failed to create homepage section');
      }

      return section;
    } catch (error) {
      console.error('Error creating homepage section:', error);
      throw error;
    }
  },

  // Update homepage section
  updateHomepageSection: async (id: string, sectionData: Partial<HomepageSection>): Promise<HomepageSection> => {
    try {
      const response = await apiRequest(`/homepage-layout/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sectionData),
      });

      console.log('🎯 UPDATE HOMEPAGE SECTION RESPONSE:', response);

      let section: HomepageSection;

      if (response.success && response.data?.section) {
        section = response.data.section;
      } else if (response.section) {
        section = response.section;
      } else if (response.id) {
        section = response;
      } else {
        throw new Error(response.error || response.message || 'Failed to update homepage section');
      }

      return section;
    } catch (error) {
      console.error('Error updating homepage section:', error);
      throw error;
    }
  },

  // Delete homepage section
  deleteHomepageSection: async (id: string): Promise<void> => {
    try {
      const response = await apiRequest(`/homepage-layout/${id}`, {
        method: 'DELETE',
      });

      console.log('🗑️ DELETE HOMEPAGE SECTION RESPONSE:', response);

      if (response.success === false || response.error) {
        throw new Error(response.error || response.message || 'Failed to delete homepage section');
      }
    } catch (error) {
      console.error('Error deleting homepage section:', error);
      throw error;
    }
  },

  // Reorder homepage sections
  reorderHomepageSections: async (sections: { id: string; orderIndex: number; parentId?: string }[]): Promise<void> => {
    try {
      const response = await apiRequest('/homepage-layout/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sections }),
      });

      console.log('🔀 REORDER HOMEPAGE SECTIONS RESPONSE:', response);

      if (response.success === false || response.error) {
        throw new Error(response.error || response.message || 'Failed to reorder homepage sections');
      }
    } catch (error) {
      console.error('Error reordering homepage sections:', error);
      throw error;
    }
  },

  bulkUpdateHomepageSections: async (sections: HomepageSection[]): Promise<void> => {
    try {
      const response = await apiRequest('/homepage-layout/bulk-update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sections }), // Send sections directly
      });

      console.log('📦 BULK UPDATE HOMEPAGE SECTIONS RESPONSE:', response);

      if (response.success === false || response.error) {
        throw new Error(response.error || response.message || 'Failed to bulk update homepage sections');
      }
    } catch (error) {
      console.error('Error bulk updating homepage sections:', error);
      throw error;
    }
  },

  // Factory methods for creating different section types
  createSectionTemplate: (type: HomepageSectionType, title?: string): any => {
    const baseSection = {
      type,
      title: title || `New ${type.replace(/_/g, ' ')} Section`,
      enabled: true,
      orderIndex: 0,
    };

    const config: any = {};

    switch (type) {
      case 'PROMO_BANNER':
        config.promoBannerTitle = 'New Banner';
        config.promoBannerSubtitle = 'Banner subtitle';
        config.promoBannerButtonText = 'Shop Now';
        config.promoBannerLink = '/';
        config.promoBannerImage = 'https://placehold.co/1200x400';
        break;
      case 'FAQ':
        config.faqItems = [{ question: 'What is the shipping time?', answer: 'Standard shipping takes 5-7 business days.' }];
        break;
      case 'VIDEO':
        config.videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        break;
      case 'CALL_TO_ACTION':
        config.ctaSubtitle = 'This is a subtitle';
        config.ctaButtonText = 'Click Me';
        config.ctaLink = '#';
        break;
      case 'GRID':
        config.columnTemplate = [6, 6];
        break;
      case 'PROMO_CARDS':
        config.promoCards = [];
        break;
      case 'FEATURE_CARDS':
        config.featureCards = [];
        break;
      case 'KEY_METRICS':
        config.keyMetrics = [];
        break;
      case 'IMAGE_GALLERY':
        config.galleryImages = [];
        config.galleryLayout = 'grid';
        break;
      case 'CATEGORY_CAROUSEL':
        config.categorySlug = 'all';
        config.productCount = 8;
        break;
      case 'CATEGORY_GRID':
        config.categoryDisplayStart = 1;
        config.categoryDisplayCount = 18;
        break;
      case 'FEATURED_PRODUCTS':
        config.productCount = 8;
        break;
      case 'BLOG':
        config.postCount = 3;
        break;
      case 'TESTIMONIALS':
        config.testimonialItems = [];
        break;
      case 'BRAND_CAROUSEL':
        config.brandIds = [];
        break;
      // In homeService.ts, update the TRUST_BADGES template:
      case 'TRUST_BADGES':
        config.trustBadgeItems = [
          { id: Date.now(), icon: 'shield', title: '100% Genuine Medicines', color: 'text-green-600' },
          { id: Date.now(), icon: 'truck', title: 'Nationwide Delivery', color: 'text-blue-600' },
          { id: Date.now(), icon: 'creditCard', title: 'Secure Payments', color: 'text-indigo-600' }
        ];
        break;

      default:
        // For any other type, just create empty config
        break;
    }

    return {
      ...baseSection,
      config
    };
  }
};