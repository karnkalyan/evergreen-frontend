import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../../components/shared/Button';
import { websiteSettingsService } from '../../lib/websiteSettingsService';
import { WebsiteSettings, WebsiteSettingsFormData, NavigationItem, SocialLink, PaymentMethod, AppearanceSettings } from '../../types';
import { ICONS } from '../../constants';
import SectionAppearanceControls from '../../components/home/SectionAppearanceControls';

// Popular font options
const FONT_OPTIONS = [
  { value: 'Poppins', label: 'Poppins (Modern)' },
  { value: 'Inter', label: 'Inter (Clean)' },
  { value: 'Roboto', label: 'Roboto (Google)' },
  { value: 'Open Sans', label: 'Open Sans (Friendly)' },
  { value: 'Montserrat', label: 'Montserrat (Elegant)' },
  { value: 'Lato', label: 'Lato (Professional)' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro (Readable)' },
  { value: 'Nunito', label: 'Nunito (Rounded)' },
  { value: 'Oswald', label: 'Oswald (Bold)' },
  { value: 'Raleway', label: 'Raleway (Sophisticated)' },
  { value: 'Merriweather', label: 'Merriweather (Serif)' },
  { value: 'Playfair Display', label: 'Playfair Display (Elegant Serif)' },
  { value: 'Ubuntu', label: 'Ubuntu (Technical)' },
  { value: 'Fira Sans', label: 'Fira Sans (Modern)' },
  { value: 'Quicksand', label: 'Quicksand (Friendly)' }
];

// Predefined gradient options
const GRADIENT_PRESETS = [
  { name: 'Ocean Blue', colors: ['#667eea', '#764ba2'], direction: 'to right' },
  { name: 'Sunset', colors: ['#f093fb', '#f5576c'], direction: 'to right' },
  { name: 'Emerald', colors: ['#4facfe', '#00f2fe'], direction: 'to right' },
  { name: 'Purple Dream', colors: ['#6a11cb', '#2575fc'], direction: 'to right' },
  { name: 'Fiery Orange', colors: ['#fa709a', '#fee140'], direction: 'to right' },
  { name: 'Fresh Mint', colors: ['#43e97b', '#38f9d7'], direction: 'to right' },
  { name: 'Dark Night', colors: ['#1e3c72', '#2a5298'], direction: 'to right' },
  { name: 'Warm Flame', colors: ['#ff9a9e', '#fecfef'], direction: 'to right' }
];

// Helper function to migrate old appearance settings to new structure
const migrateAppearanceSettings = (oldSettings: any) => {
  if (oldSettings.sections) {
    return oldSettings; // Already new structure
  }

  // Migrate from old structure to new
  return {
    colors: oldSettings.colors || {
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      mutedTextColor: '#6b7280',
      borderColor: '#e5e7eb'
    },
    sections: {
      header: {
        topBar: {
          background: {
            type: oldSettings.gradient?.type || 'gradient',
            color: oldSettings.colors?.primaryColor || '#3b82f6',
            gradient: {
              direction: oldSettings.gradient?.direction || 'to right',
              colors: oldSettings.gradient?.colors || ['#3b82f6', '#1e40af'],
              customGradient: oldSettings.gradient?.customGradient || ''
            }
          },
          textColor: '#ffffff'
        },
        searchBar: {
          background: {
            type: 'solid',
            color: '#ffffff',
            gradient: {
              direction: 'to right',
              colors: ['#f8fafc', '#f1f5f9'],
              customGradient: ''
            }
          },
          textColor: oldSettings.colors?.textColor || '#1f2937'
        },
        navigation: {
          background: {
            type: 'solid',
            color: '#ffffff',
            gradient: {
              direction: 'to right',
              colors: ['#ffffff', '#f8fafc'],
              customGradient: ''
            }
          },
          textColor: oldSettings.colors?.textColor || '#1f2937'
        }
      },
      footer: {
        main: {
          background: {
            type: 'solid',
            color: '#1f2937',
            gradient: {
              direction: 'to right',
              colors: ['#1f2937', '#374151'],
              customGradient: ''
            }
          },
          textColor: '#f9fafb'
        },
        bottomBar: {
          background: {
            type: 'solid',
            color: '#111827',
            gradient: {
              direction: 'to right',
              colors: ['#111827', '#1f2937'],
              customGradient: ''
            }
          },
          textColor: '#d1d5db'
        }
      },
      buttons: {
        primary: {
          background: {
            type: 'gradient',
            color: oldSettings.colors?.primaryColor || '#3b82f6',
            gradient: {
              direction: oldSettings.gradient?.direction || 'to right',
              colors: oldSettings.gradient?.colors || ['#3b82f6', '#1e40af'],
              customGradient: oldSettings.gradient?.customGradient || ''
            }
          },
          textColor: '#ffffff'
        },
        secondary: {
          background: {
            type: 'solid',
            color: '#f3f4f6',
            gradient: {
              direction: 'to right',
              colors: ['#f3f4f6', '#e5e7eb'],
              customGradient: ''
            }
          },
          textColor: oldSettings.colors?.textColor || '#374151'
        }
      }
    },
    fonts: oldSettings.fonts || {
      primaryFont: 'Poppins',
      secondaryFont: 'Inter',
      fontSize: {
        base: '16px',
        sm: '14px',
        lg: '18px',
        xl: '24px'
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
      }
    },
    borderRadius: oldSettings.borderRadius || '8px',
    boxShadow: oldSettings.boxShadow || '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
  };
};

const GeneralSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  
  // Initialize with migrated structure
  const [formData, setFormData] = useState<WebsiteSettingsFormData>({
    // General Settings
    siteTitle: '',
    siteDescription: '',
    siteUrl: '',
    siteKeywords: '',
    siteLogo: '',
    favicon: '',
    
    // Header Settings
    headerLogo: '',
    headerLogoAlt: '',
    headerCtaText: '',
    headerCtaLink: '',
    headerNavigation: [],
    
    // Footer Settings
    footerLogo: '',
    footerLogoAlt: '',
    footerDescription: '',
    footerCopyrightText: '',
    footerContactInfo: {
      address: '',
      email: '',
      phone: ''
    },
    footerSocialLinks: [],
    footerQuickLinks: [],
    footerCategories: [],
    footerPaymentMethods: [],
    
    // Social Media
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    
    // Analytics
    googleAnalyticsId: '',
    googleTagManagerId: '',
    facebookPixelId: '',
    
    // SEO
    metaTitle: '',
    metaDescription: '',
    metaImage: '',
    structuredData: null,
    robotsTxt: '',
    sitemapUrl: '',

    // Appearance Settings with new structure
    appearanceSettings: migrateAppearanceSettings({})
  });

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'header', label: 'Header' },
    { id: 'footer', label: 'Footer' },
    { id: 'social', label: 'Social Media' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'seo', label: 'SEO' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const settingsData = await websiteSettingsService.getWebsiteSettings();
      if (settingsData) {
        setSettings(settingsData);
        setFormData(prev => ({
          ...prev,
          // General
          siteTitle: settingsData.siteTitle || 'Evergreen Medicine',
          siteDescription: settingsData.siteDescription || 'Your trusted partner for health and wellness',
          siteUrl: settingsData.siteUrl || '',
          siteKeywords: settingsData.siteKeywords || '',
          siteLogo: settingsData.siteLogo || '',
          favicon: settingsData.favicon || '',
          
          // Header
          headerLogo: settingsData.headerLogo || '',
          headerLogoAlt: settingsData.headerLogoAlt || 'Evergreen Medicine',
          headerCtaText: settingsData.headerCtaText || 'Upload Prescription',
          headerCtaLink: settingsData.headerCtaLink || '/account/prescriptions',
          headerNavigation: settingsData.headerNavigation || [
            { name: 'Shop by Category', path: '#', type: 'dropdown' },
            { name: 'All Products', path: '/category/all' },
            { name: 'Offers', path: '/offers' },
            { name: 'Symptom Checker', path: '/symptom-checker' },
            { name: 'Promo Codes', path: '/promocodes' },
            { name: 'Blog', path: '/blog' },
            { name: 'About Us', path: '/about' }
          ],
          
          // Footer
          footerLogo: settingsData.footerLogo || '',
          footerLogoAlt: settingsData.footerLogoAlt || 'Evergreen Medicine',
          footerDescription: settingsData.footerDescription || 'Your trusted partner for health and wellness. Delivering genuine medicines and healthcare products to your doorstep.',
          footerCopyrightText: settingsData.footerCopyrightText || `© ${new Date().getFullYear()} Evergreen Medicine. All Rights Reserved.`,
          footerContactInfo: settingsData.footerContactInfo || {
            address: '123 Health St, Wellness City, CA 90210, USA',
            email: 'support@evergreenmed.com',
            phone: '+1-555-HEALTH'
          },
          footerSocialLinks: settingsData.footerSocialLinks || [
            { platform: 'facebook', url: '#', icon: 'facebook' },
            { platform: 'twitter', url: '#', icon: 'twitter' },
            { platform: 'instagram', url: '#', icon: 'instagram' }
          ],
          footerQuickLinks: settingsData.footerQuickLinks || [
            { name: 'About Us', path: '/about' },
            { name: 'Contact Us', path: '/contact' },
            { name: 'Offers & Deals', path: '/offers' },
            { name: 'Promo Codes', path: '/promocodes' },
            { name: 'Blog', path: '/blog' }
          ],
          footerCategories: settingsData.footerCategories || [],
          footerPaymentMethods: settingsData.footerPaymentMethods || [],
          
          // Social Media
          facebookUrl: settingsData.facebookUrl || '',
          twitterUrl: settingsData.twitterUrl || '',
          instagramUrl: settingsData.instagramUrl || '',
          linkedinUrl: settingsData.linkedinUrl || '',
          
          // Analytics
          googleAnalyticsId: settingsData.googleAnalyticsId || '',
          googleTagManagerId: settingsData.googleTagManagerId || '',
          facebookPixelId: settingsData.facebookPixelId || '',
          
          // SEO
          metaTitle: settingsData.metaTitle || '',
          metaDescription: settingsData.metaDescription || '',
          metaImage: settingsData.metaImage || '',
          structuredData: settingsData.structuredData || null,
          robotsTxt: settingsData.robotsTxt || '',
          sitemapUrl: settingsData.sitemapUrl || '',

          // Appearance Settings - migrate if needed
          appearanceSettings: settingsData.appearanceSettings 
            ? migrateAppearanceSettings(settingsData.appearanceSettings)
            : prev.appearanceSettings
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load website settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle appearance settings changes
  const handleAppearanceChange = (path: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      appearanceSettings: updateNestedObject(prev.appearanceSettings!, path, value)
    }));
  };

  // Helper function to update nested objects
  const updateNestedObject = (obj: any, path: string, value: any): any => {
    const keys = path.split('.');
    const currentKey = keys[0];
    
    if (keys.length === 1) {
      return { ...obj, [currentKey]: value };
    }
    
    return {
      ...obj,
      [currentKey]: updateNestedObject(obj[currentKey], keys.slice(1).join('.'), value)
    };
  };

  // Apply gradient preset to specific section
  const applyGradientPreset = (sectionPath: string, preset: typeof GRADIENT_PRESETS[0]) => {
    handleAppearanceChange(`${sectionPath}.background.gradient.colors`, preset.colors);
    handleAppearanceChange(`${sectionPath}.background.gradient.direction`, preset.direction);
  };

  // Handle contact info and other existing functions remain the same...
  const handleContactInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      footerContactInfo: {
        ...prev.footerContactInfo!,
        [name]: value
      }
    }));
  };

  // Header Navigation Management (existing functions)
  const addHeaderNavItem = () => {
    setFormData(prev => ({
      ...prev,
      headerNavigation: [
        ...(prev.headerNavigation || []),
        { name: 'New Link', path: '#' }
      ]
    }));
  };

  const updateHeaderNavItem = (index: number, field: keyof NavigationItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      headerNavigation: prev.headerNavigation?.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeHeaderNavItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      headerNavigation: prev.headerNavigation?.filter((_, i) => i !== index)
    }));
  };

  // Footer Quick Links Management (existing functions)
  const addFooterQuickLink = () => {
    setFormData(prev => ({
      ...prev,
      footerQuickLinks: [
        ...(prev.footerQuickLinks || []),
        { name: 'New Link', path: '#' }
      ]
    }));
  };

  const updateFooterQuickLink = (index: number, field: keyof NavigationItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      footerQuickLinks: prev.footerQuickLinks?.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeFooterQuickLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      footerQuickLinks: prev.footerQuickLinks?.filter((_, i) => i !== index)
    }));
  };

  // Social Links Management (existing functions)
  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      footerSocialLinks: [
        ...(prev.footerSocialLinks || []),
        { platform: 'New Platform', url: '#', icon: 'link' }
      ]
    }));
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    setFormData(prev => ({
      ...prev,
      footerSocialLinks: prev.footerSocialLinks?.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeSocialLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      footerSocialLinks: prev.footerSocialLinks?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await websiteSettingsService.updateWebsiteSettings(formData);
      
      if (response.success) {
        toast.success('Website settings saved successfully!');
        await loadSettings();
      } else {
        toast.error(response.message || 'Failed to save settings');
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-soft-md">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg">Loading website settings...</div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-700">General Site Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Site Title *</label>
                <input 
                  type="text" 
                  name="siteTitle"
                  value={formData.siteTitle}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Site URL</label>
                <input 
                  type="text" 
                  name="siteUrl"
                  value={formData.siteUrl}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Site Description</label>
              <textarea 
                name="siteDescription"
                value={formData.siteDescription}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                placeholder="Brief description of your website"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Site Keywords</label>
              <input 
                type="text" 
                name="siteKeywords"
                value={formData.siteKeywords}
                onChange={handleInputChange}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                placeholder="medicine, healthcare, wellness, pharmacy"
              />
              <p className="text-xs text-slate-500 mt-1">Separate keywords with commas</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Site Logo URL</label>
                <input 
                  type="text" 
                  name="siteLogo"
                  value={formData.siteLogo}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                  placeholder="/images/logo.png or https://example.com/logo.png"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Favicon URL</label>
                <input 
                  type="text" 
                  name="favicon"
                  value={formData.favicon}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                  placeholder="/images/favicon.ico or https://example.com/favicon.ico"
                />
              </div>
            </div>
          </div>
        );

      case 'appearance':
        const appearance = formData.appearanceSettings!;
        return (
          <div className="space-y-8">
            <h3 className="text-lg font-semibold text-slate-700">Appearance & Theme</h3>
            
            {/* Global Color Settings */}
            <div className="space-y-6">
              <h4 className="font-semibold text-slate-700 border-b pb-2">Global Colors</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(appearance.colors).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="color" 
                        value={value}
                        onChange={(e) => handleAppearanceChange(`colors.${key}`, e.target.value)}
                        className="w-12 h-12 rounded border border-slate-300 cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={value}
                        onChange={(e) => handleAppearanceChange(`colors.${key}`, e.target.value)}
                        className="flex-1 p-2 bg-white border border-slate-300 rounded text-sm font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Header Section Styling */}
            <div className="space-y-6">
              <h4 className="font-semibold text-slate-700 border-b pb-2">Header Styling</h4>
              
              {/* Top Bar */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                <h5 className="font-medium text-slate-700">Top Bar</h5>
                <SectionAppearanceControls
                  section={appearance.sections.header.topBar}
                  onChange={(path, value) => handleAppearanceChange(`sections.header.topBar.${path}`, value)}
                  onGradientPreset={(preset) => applyGradientPreset('sections.header.topBar', preset)}
                />
              </div>

              {/* Search Bar */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                <h5 className="font-medium text-slate-700">Search Bar</h5>
                <SectionAppearanceControls
                  section={appearance.sections.header.searchBar}
                  onChange={(path, value) => handleAppearanceChange(`sections.header.searchBar.${path}`, value)}
                  onGradientPreset={(preset) => applyGradientPreset('sections.header.searchBar', preset)}
                />
              </div>

              {/* Navigation */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                <h5 className="font-medium text-slate-700">Navigation Bar</h5>
                <SectionAppearanceControls
                  section={appearance.sections.header.navigation}
                  onChange={(path, value) => handleAppearanceChange(`sections.header.navigation.${path}`, value)}
                  onGradientPreset={(preset) => applyGradientPreset('sections.header.navigation', preset)}
                />
              </div>
            </div>

            {/* Footer Section Styling */}
            <div className="space-y-6">
              <h4 className="font-semibold text-slate-700 border-b pb-2">Footer Styling</h4>
              
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                <h5 className="font-medium text-slate-700">Main Footer</h5>
                <SectionAppearanceControls
                  section={appearance.sections.footer.main}
                  onChange={(path, value) => handleAppearanceChange(`sections.footer.main.${path}`, value)}
                  onGradientPreset={(preset) => applyGradientPreset('sections.footer.main', preset)}
                />
              </div>

              <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                <h5 className="font-medium text-slate-700">Bottom Bar (Copyright)</h5>
                <SectionAppearanceControls
                  section={appearance.sections.footer.bottomBar}
                  onChange={(path, value) => handleAppearanceChange(`sections.footer.bottomBar.${path}`, value)}
                  onGradientPreset={(preset) => applyGradientPreset('sections.footer.bottomBar', preset)}
                />
              </div>
            </div>

            {/* Button Styling */}
            <div className="space-y-6">
              <h4 className="font-semibold text-slate-700 border-b pb-2">Button Styling</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                  <h5 className="font-medium text-slate-700">Primary Buttons</h5>
                  <SectionAppearanceControls
                    section={appearance.sections.buttons.primary}
                    onChange={(path, value) => handleAppearanceChange(`sections.buttons.primary.${path}`, value)}
                    onGradientPreset={(preset) => applyGradientPreset('sections.buttons.primary', preset)}
                  />
                </div>

                <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                  <h5 className="font-medium text-slate-700">Secondary Buttons</h5>
                  <SectionAppearanceControls
                    section={appearance.sections.buttons.secondary}
                    onChange={(path, value) => handleAppearanceChange(`sections.buttons.secondary.${path}`, value)}
                    onGradientPreset={(preset) => applyGradientPreset('sections.buttons.secondary', preset)}
                  />
                </div>
              </div>
            </div>

            {/* Font Settings */}
            <div className="space-y-6">
              <h4 className="font-semibold text-slate-700 border-b pb-2">Typography</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Primary Font</label>
                  <select 
                    value={appearance.fonts.primaryFont}
                    onChange={(e) => handleAppearanceChange('fonts.primaryFont', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
                    style={{ fontFamily: appearance.fonts.primaryFont }}
                  >
                    {FONT_OPTIONS.map(font => (
                      <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Secondary Font</label>
                  <select 
                    value={appearance.fonts.secondaryFont}
                    onChange={(e) => handleAppearanceChange('fonts.secondaryFont', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
                    style={{ fontFamily: appearance.fonts.secondaryFont }}
                  >
                    {FONT_OPTIONS.map(font => (
                      <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Font Sizes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Font Sizes</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(appearance.fonts.fontSize).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <label className="block text-xs font-medium text-slate-600 capitalize">
                        {key}
                      </label>
                      <input 
                        type="text" 
                        value={value}
                        onChange={(e) => handleAppearanceChange(`fonts.fontSize.${key}`, e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Font Preview */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Font Preview</label>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p 
                    className="text-lg mb-2"
                    style={{ fontFamily: appearance.fonts.primaryFont }}
                  >
                    Primary Font: {appearance.fonts.primaryFont} - The quick brown fox jumps over the lazy dog
                  </p>
                  <p 
                    className="text-base text-slate-600"
                    style={{ fontFamily: appearance.fonts.secondaryFont }}
                  >
                    Secondary Font: {appearance.fonts.secondaryFont} - The quick brown fox jumps over the lazy dog
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Styling */}
            <div className="space-y-6">
              <h4 className="font-semibold text-slate-700 border-b pb-2">Additional Styling</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Border Radius</label>
                  <input 
                    type="text" 
                    value={appearance.borderRadius}
                    onChange={(e) => handleAppearanceChange('borderRadius', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
                    placeholder="8px"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Box Shadow</label>
                  <input 
                    type="text" 
                    value={appearance.boxShadow}
                    onChange={(e) => handleAppearanceChange('boxShadow', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
                    placeholder="0 1px 3px 0 rgba(0, 0, 0, 0.1)"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      // ... rest of your existing cases (header, footer, social, analytics, seo) remain the same
      case 'header':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-700">Header Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Header Logo URL</label>
                <input 
                  type="url" 
                  name="headerLogo"
                  value={formData.headerLogo}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                  placeholder="https://example.com/header-logo.png"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Header Logo Alt Text</label>
                <input 
                  type="text" 
                  name="headerLogoAlt"
                  value={formData.headerLogoAlt}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Header CTA Text</label>
                <input 
                  type="text" 
                  name="headerCtaText"
                  value={formData.headerCtaText}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                  placeholder="Shop Now"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Header CTA Link</label>
                <input 
                  type="url" 
                  name="headerCtaLink"
                  value={formData.headerCtaLink}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                  placeholder="/products"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-slate-700">Header Navigation</label>
                <Button type="button" size="sm" variant="secondary" onClick={addHeaderNavItem}>
                  + Add Menu Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.headerNavigation?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                    <input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => updateHeaderNavItem(index, 'name', e.target.value)}
                      placeholder="Menu Item Name"
                      className="flex-1 p-2 bg-white border border-slate-300 rounded text-sm"
                    />
                    <input 
                      type="text" 
                      value={item.path}
                      onChange={(e) => updateHeaderNavItem(index, 'path', e.target.value)}
                      placeholder="/path"
                      className="flex-1 p-2 bg-white border border-slate-300 rounded text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeHeaderNavItem(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                
                {(!formData.headerNavigation || formData.headerNavigation.length === 0) && (
                  <p className="text-sm text-slate-500 text-center py-4">No navigation items added yet</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'footer':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-700">Footer Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Footer Logo URL</label>
                <input 
                  type="url" 
                  name="footerLogo"
                  value={formData.footerLogo}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Footer Logo Alt Text</label>
                <input 
                  type="text" 
                  name="footerLogoAlt"
                  value={formData.footerLogoAlt}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Footer Description</label>
              <textarea 
                name="footerDescription"
                value={formData.footerDescription}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Copyright Text</label>
              <input 
                type="text" 
                name="footerCopyrightText"
                value={formData.footerCopyrightText}
                onChange={handleInputChange}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-slate-700">Contact Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input 
                  type="text" 
                  name="address"
                  value={formData.footerContactInfo?.address || ''}
                  onChange={handleContactInfoChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.footerContactInfo?.email || ''}
                    onChange={handleContactInfoChange}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.footerContactInfo?.phone || ''}
                    onChange={handleContactInfoChange}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-slate-700">Quick Links</label>
                <Button type="button" size="sm" variant="secondary" onClick={addFooterQuickLink}>
                  + Add Quick Link
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.footerQuickLinks?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                    <input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => updateFooterQuickLink(index, 'name', e.target.value)}
                      placeholder="Link Name"
                      className="flex-1 p-2 bg-white border border-slate-300 rounded text-sm"
                    />
                    <input 
                      type="text" 
                      value={item.path}
                      onChange={(e) => updateFooterQuickLink(index, 'path', e.target.value)}
                      placeholder="/path"
                      className="flex-1 p-2 bg-white border border-slate-300 rounded text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeFooterQuickLink(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-slate-700">Legal Links</label>
                <Button type="button" size="sm" variant="secondary" onClick={addSocialLink}>
                  + Add Social Link
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.footerSocialLinks?.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg">
                    <input 
                      type="text" 
                      value={item.platform}
                      onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                      placeholder="Platform"
                      className="p-2 bg-white border border-slate-300 rounded text-sm"
                    />
                    <input 
                      type="text" 
                      value={item.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                      placeholder="https://..."
                      className="p-2 bg-white border border-slate-300 rounded text-sm"
                    />
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        value={item.icon}
                        onChange={(e) => updateSocialLink(index, 'icon', e.target.value)}
                        placeholder="icon-name"
                        className="flex-1 p-2 bg-white border border-slate-300 rounded text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeSocialLink(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-700">Social Media Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Facebook URL</label>
                <input 
                  type="url" 
                  name="facebookUrl"
                  value={formData.facebookUrl}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Twitter URL</label>
                <input 
                  type="url" 
                  name="twitterUrl"
                  value={formData.twitterUrl}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Instagram URL</label>
                <input 
                  type="url" 
                  name="instagramUrl"
                  value={formData.instagramUrl}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
                <input 
                  type="url" 
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                />
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-700">Analytics & Tracking</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Google Analytics ID</label>
                <input 
                  type="text" 
                  name="googleAnalyticsId"
                  value={formData.googleAnalyticsId}
                  onChange={handleInputChange}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Google Tag Manager ID</label>
                <input 
                  type="text" 
                  name="googleTagManagerId"
                  value={formData.googleTagManagerId}
                  onChange={handleInputChange}
                  placeholder="GTM-XXXXXX"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Facebook Pixel ID</label>
                <input 
                  type="text" 
                  name="facebookPixelId"
                  value={formData.facebookPixelId}
                  onChange={handleInputChange}
                  placeholder="XXXXXXXXXXXXXXX"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                />
              </div>
            </div>
          </div>
        );

      case 'seo':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-700">SEO Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
                <input 
                  type="text" 
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                <textarea 
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Meta Image URL</label>
                <input 
                  type="url" 
                  name="metaImage"
                  value={formData.metaImage}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Robots.txt Content</label>
                <textarea 
                  name="robotsTxt"
                  value={formData.robotsTxt}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-mono text-sm" 
                  placeholder="User-agent: *&#10;Allow: /&#10;Disallow: /admin/"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sitemap URL</label>
                <input 
                  type="url" 
                  name="sitemapUrl"
                  value={formData.sitemapUrl}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                  placeholder="https://example.com/sitemap.xml"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-soft-md">
      <h2 className="text-xl font-poppins font-bold text-slate-800 mb-4 border-b pb-2">
        Website Settings
      </h2>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-slate-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                ? 'border-primaryEnd text-primaryEnd'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              } whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit}>
        {renderTabContent()}

        <div className="flex justify-between items-center pt-6 mt-6 border-t">
          <Button 
            type="button" 
            variant="secondary"
            onClick={loadSettings}
            disabled={saving}
          >
            Reset Changes
          </Button>
          
          <Button 
            type="submit" 
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GeneralSettings;