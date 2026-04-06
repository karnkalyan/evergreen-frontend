// lib/privacyPolicyService.ts
export interface PrivacyPolicyItem {
  title?: string;
  description: string | string[];
  icon?: 'warning' | 'info' | 'note';
}

export interface PrivacyPolicySection {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  content?: string;
  items?: PrivacyPolicyItem[];
  note?: string;
}

export interface PrivacyPolicyData {
  title: string;
  description: string;
  effectiveDate: string;
  lastUpdated: string;
  sections: PrivacyPolicySection[];
}

// Mock service for fetching privacy policy data
export const publicPrivacyPolicyService = {
  getPrivacyPolicy: async (): Promise<PrivacyPolicyData> => {
    // In a real application, this would fetch from an API
    return {
      title: 'Privacy Policy',
      description: 'Your privacy and data security are our top priorities',
      effectiveDate: '01-03-2026',
      lastUpdated: '01-03-2026',
      sections: [
        {
          id: 'introduction',
          number: 0,
          title: 'Introduction',
          subtitle: 'Welcome to Evergreen Pharma',
          content: 'Welcome to Evergreen Pharma (website: https://evergreenpharma.us). Your privacy is extremely important to us. This Privacy Policy document explains how we collect, use, protect, disclose, and safeguard your personal information when you visit or use our website. By accessing or using evergreenpharma.us, you agree to the terms of this Privacy Policy. If you do not agree, please do not use our website.'
        },
        {
          id: 'information-collection',
          number: 1,
          title: 'Information We Collect',
          subtitle: 'We may collect personal and non-personal information in various ways',
          items: [
            {
              title: '1.1 Personal Information',
              description: [
                'Full Name',
                'Email Address',
                'Phone Number',
                'Billing Address',
                'Shipping Address',
                'Payment-related details (processed securely via third-party providers)',
                'Prescription-related information (if applicable)',
                'Any information submitted via contact forms, order forms, or customer support'
              ]
            },
            {
              title: '1.2 Non-Personal Information',
              description: [
                'IP address',
                'Browser type and version',
                'Device information',
                'Operating system',
                'Pages visited',
                'Date and time of visits',
                'Referring URLs',
                'Click behavior and usage data'
              ]
            }
          ],
          note: 'We do not store sensitive payment details such as credit/debit card numbers.',
          content: 'This information helps us improve website functionality and user experience.'
        },
        {
          id: 'how-we-use',
          number: 2,
          title: 'How We Use Your Information',
          subtitle: 'We use the collected information for the following purposes',
          items: [
            {
              description: [
                'To process and fulfill orders',
                'To communicate with you regarding inquiries, orders, or support',
                'To provide customer service and respond to requests',
                'To improve our website, services, and offerings',
                'To personalize user experience',
                'To send transactional emails and important updates',
                'To comply with legal and regulatory requirements',
                'To detect and prevent fraud, abuse, or unauthorized activities'
              ]
            }
          ]
        },
        {
          id: 'cookies-tracking',
          number: 3,
          title: 'Cookies and Tracking Technologies',
          subtitle: 'Evergreen Pharma uses cookies and similar technologies',
          items: [
            {
              title: 'Cookies may be used to:',
              description: [
                'Remember user preferences',
                'Analyze website traffic and performance',
                'Improve content relevance',
                'Enable security features'
              ]
            }
          ],
          content: 'You can disable cookies through your browser settings; however, some parts of the website may not function properly.'
        },
        {
          id: 'third-party-services',
          number: 4,
          title: 'Third-Party Services',
          subtitle: 'We may use third-party services to support our website operations',
          items: [
            {
              description: [
                'Payment processors',
                'Analytics tools (e.g., Google Analytics)',
                'Email communication services',
                'Hosting and security providers'
              ]
            }
          ],
          content: 'These third parties have their own privacy policies and only receive information necessary to perform their services. Evergreen Pharma does not sell, rent, or trade your personal information to third parties for marketing purposes.'
        },
        {
          id: 'data-security',
          number: 5,
          title: 'Data Security',
          subtitle: 'We take data security seriously and implement appropriate measures',
          items: [
            {
              description: [
                'SSL (Secure Socket Layer) encryption',
                'Secure servers and firewalls',
                'Restricted access to sensitive data',
                'Regular system monitoring'
              ]
            }
          ],
          content: 'While we strive to protect your data, no online transmission is 100% secure. Therefore, we cannot guarantee absolute security.',
          note: 'No online transmission is 100% secure'
        },
        {
          id: 'medical-disclaimer',
          number: 6,
          title: 'Medical Information Disclaimer',
          subtitle: 'Health and medicine-related information on our website',
          items: [
            {
              description: [
                'Is for informational purposes only',
                'Is not a substitute for professional medical advice',
                'Should not be used for diagnosis or treatment without consulting a licensed healthcare provider'
              ]
            }
          ],
          content: 'By using this website, you acknowledge that you are responsible for consulting a qualified medical professional before using any medication.',
          icon: 'warning'
        },
        {
          id: 'children-privacy',
          number: 7,
          title: 'Children\'s Privacy',
          content: 'Evergreen Pharma does not knowingly collect personal information from individuals under the age of 18. If you believe that a child has provided us with personal information, please contact us immediately, and we will take appropriate action to remove such data.'
        },
        {
          id: 'user-rights',
          number: 8,
          title: 'User Rights and Choices',
          subtitle: 'Depending on your jurisdiction, you may have the right to',
          items: [
            {
              description: [
                'Access your personal data',
                'Request correction or deletion of your information',
                'Withdraw consent',
                'Opt out of marketing communications'
              ]
            }
          ],
          content: 'To exercise these rights, please contact us using the details provided below.'
        },
        {
          id: 'data-retention',
          number: 9,
          title: 'Data Retention',
          subtitle: 'We retain personal information only for as long as necessary to',
          items: [
            {
              description: [
                'Fulfill the purposes outlined in this policy',
                'Comply with legal and regulatory obligations',
                'Resolve disputes and enforce agreements'
              ]
            }
          ]
        },
        {
          id: 'international-users',
          number: 10,
          title: 'International Users',
          content: 'Evergreen Pharma operates primarily in the United States. If you access the website from outside the U.S., you consent to the transfer and processing of your information in accordance with U.S. data protection laws.'
        },
        {
          id: 'policy-changes',
          number: 11,
          title: 'Changes to This Privacy Policy',
          subtitle: 'We reserve the right to update or modify this Privacy Policy at any time',
          items: [
            {
              title: 'Any changes will be:',
              description: [
                'Posted on this page',
                'Reflected with an updated "Last Updated" date'
              ]
            }
          ],
          content: 'Continued use of the website after changes constitutes acceptance of the revised policy.'
        },
        {
          id: 'contact',
          number: 12,
          title: 'Contact Information',
          subtitle: 'If you have any questions or concerns regarding this Privacy Policy',
          items: [
            {
              title: 'Website:',
              description: 'https://evergreenpharma.us'
            },
            {
              title: 'Email:',
              description: 'med@evergreenpharmacy.net'
            },
            {
              title: 'Contact Page:',
              description: 'https://evergreenpharma.us/contact'
            }
          ]
        }
      ]
    };
  }
};

// Helper function to get section by ID
export const getSectionById = (data: PrivacyPolicyData, id: string): PrivacyPolicySection | undefined => {
  return data.sections.find(section => section.id === id);
};

// Helper function to get all section IDs for navigation
export const getAllSectionIds = (data: PrivacyPolicyData): string[] => {
  return data.sections.map(section => section.id);
};

// Types for cookie preferences
export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsent {
  preferences: CookiePreferences;
  lastUpdated: string;
  consented: boolean;
}

// Cookie management service
export const cookieService = {
  getConsent: (): CookieConsent => {
    if (typeof window === 'undefined') {
      return {
        preferences: { essential: true, analytics: false, marketing: false },
        lastUpdated: new Date().toISOString(),
        consented: false
      };
    }
    
    const stored = localStorage.getItem('evergreen_cookie_consent');
    if (stored) {
      return JSON.parse(stored);
    }
    
    return {
      preferences: { essential: true, analytics: false, marketing: false },
      lastUpdated: new Date().toISOString(),
      consented: false
    };
  },

  updateConsent: (preferences: CookiePreferences): CookieConsent => {
    const consent: CookieConsent = {
      preferences,
      lastUpdated: new Date().toISOString(),
      consented: true
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('evergreen_cookie_consent', JSON.stringify(consent));
    }
    
    return consent;
  },

  resetConsent: (): CookieConsent => {
    const defaultConsent: CookieConsent = {
      preferences: { essential: true, analytics: false, marketing: false },
      lastUpdated: new Date().toISOString(),
      consented: false
    };
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('evergreen_cookie_consent');
    }
    
    return defaultConsent;
  }
};

// Privacy Rights Request interface
export interface PrivacyRightsRequest {
  type: 'access' | 'correction' | 'deletion' | 'withdraw' | 'opt-out';
  description: string;
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  additionalInfo?: string;
  dateSubmitted: string;
}

// Service for handling privacy rights requests
export const privacyRightsService = {
  submitRequest: async (request: Omit<PrivacyRightsRequest, 'dateSubmitted'>): Promise<{ success: boolean; referenceId: string }> => {
    // In a real application, this would send to your backend
    console.log('Privacy rights request submitted:', request);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const referenceId = `PRV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      referenceId
    };
  },

  getRequestTypes: (): Array<{ value: string; label: string; description: string }> => {
    return [
      {
        value: 'access',
        label: 'Access My Data',
        description: 'Request a copy of your personal information'
      },
      {
        value: 'correction',
        label: 'Correct My Data',
        description: 'Update inaccurate or incomplete information'
      },
      {
        value: 'deletion',
        label: 'Delete My Data',
        description: 'Request removal of your personal information'
      },
      {
        value: 'withdraw',
        label: 'Withdraw Consent',
        description: 'Withdraw previously given consent'
      },
      {
        value: 'opt-out',
        label: 'Opt-out of Marketing',
        description: 'Stop receiving marketing communications'
      }
    ];
  }
};