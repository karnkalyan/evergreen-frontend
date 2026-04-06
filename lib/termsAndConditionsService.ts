// lib/termsAndConditionsService.ts
export interface TermsSection {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  content?: string;
  items?: TermsItem[];
  note?: string;
  icon?: 'warning' | 'info' | 'legal';
}

export interface TermsItem {
  title?: string;
  description: string | string[];
  icon?: string;
}

export interface TermsAndConditionsData {
  title: string;
  description: string;
  effectiveDate: string;
  lastUpdated: string;
  sections: TermsSection[];
}

// Mock service for fetching terms and conditions data
export const publicTermsAndConditionsService = {
  getTermsAndConditions: async (): Promise<TermsAndConditionsData> => {
    return {
      title: 'Terms and Conditions',
      description: 'Please read these terms carefully before using our website',
      effectiveDate: '01-03-2026',
      lastUpdated: '01-03-2026',
      sections: [
        {
          id: 'introduction',
          number: 0,
          title: 'Introduction',
          content: 'Welcome to Evergreen Pharma (https://evergreenpharma.us). These Terms and Conditions ("Terms") govern your access to and use of our website, services, and products. By accessing or using this website, you agree to be bound by these Terms. If you do not agree, please do not use this website.'
        },
        {
          id: 'definitions',
          number: 1,
          title: 'Definitions',
          items: [
            {
              description: [
                '"Website" refers to evergreenpharma.us',
                '"Company," "We," "Us," "Our" refers to Evergreen Pharma',
                '"User," "You," "Your" refers to any visitor or customer accessing the website',
                '"Products" refers to medicines, health products, or related items displayed on the website'
              ]
            }
          ]
        },
        {
          id: 'eligibility',
          number: 2,
          title: 'Eligibility to Use the Website',
          subtitle: 'By using this website, you confirm that:',
          items: [
            {
              description: [
                'You are at least 18 years of age',
                'You are legally capable of entering into binding agreements',
                'You will use this website only for lawful purposes'
              ]
            }
          ],
          note: 'Use of this website by minors is strictly prohibited.'
        },
        {
          id: 'medical-disclaimer',
          number: 3,
          title: 'Medical & Health Disclaimer (Important)',
          icon: 'warning',
          items: [
            {
              description: [
                'All information on this website is provided for informational purposes only',
                'We do not provide medical advice, diagnosis, or treatment',
                'You must consult a licensed healthcare professional before using any medication'
              ]
            }
          ],
          content: 'Evergreen Pharma is not responsible for health outcomes resulting from self-medication or misuse.'
        },
        {
          id: 'prescription-policy',
          number: 4,
          title: 'Prescription Medication Policy',
          subtitle: 'Certain medicines may require a valid prescription.',
          content: 'By ordering such medicines, you agree that:',
          items: [
            {
              description: [
                'You will provide accurate and valid prescription details when required',
                'You understand the risks associated with prescription medicines',
                'You will not misuse or resell prescription drugs'
              ]
            }
          ],
          note: 'We reserve the right to cancel or refuse orders that do not comply with legal or medical requirements.'
        },
        {
          id: 'content-use',
          number: 5,
          title: 'Use of Website Content',
          subtitle: 'All content on evergreenpharma.us, including:',
          items: [
            {
              description: [
                'Text',
                'Images',
                'Graphics',
                'Logos',
                'Product descriptions',
                'Blogs and articles'
              ]
            }
          ],
          content: 'is the property of Evergreen Pharma and is protected by intellectual property laws.'
        },
        {
          id: 'orders-payments',
          number: 6,
          title: 'Orders & Payments',
          items: [
            {
              title: '6.1 Order Acceptance',
              description: [
                'Placing an order does not guarantee acceptance',
                'We reserve the right to cancel or limit quantities at our discretion'
              ]
            },
            {
              title: '6.2 Pricing',
              description: [
                'Prices are subject to change without prior notice',
                'We strive for accuracy but errors may occur'
              ]
            },
            {
              title: '6.3 Payments',
              description: [
                'Payments are processed through secure third-party payment gateways',
                'We do not store sensitive payment information'
              ]
            }
          ]
        },
        {
          id: 'shipping-delivery',
          number: 7,
          title: 'Shipping & Delivery',
          content: 'Refer to our Shipping Policy for detailed information.',
          items: [
            {
              description: [
                'Delivery times are estimates and may vary',
                'We are not responsible for delays caused by couriers, customs, or unforeseen circumstances',
                'Risk of loss passes to the customer upon shipment (unless otherwise required by law)'
              ]
            }
          ]
        },
        {
          id: 'returns-refunds',
          number: 8,
          title: 'Returns, Refunds & Cancellations',
          items: [
            {
              description: [
                'Medicines may not be returnable due to safety and regulatory reasons',
                'Refunds or cancellations are subject to our Refund Policy',
                'Orders once shipped may not be cancelled'
              ]
            }
          ],
          note: 'Please review our Refund & Return Policy before placing an order.'
        },
        {
          id: 'user-responsibilities',
          number: 9,
          title: 'User Responsibilities',
          content: 'You agree that you will:',
          items: [
            {
              description: [
                'Provide accurate and truthful information',
                'Not misuse medicines purchased from this website',
                'Not use the website for fraudulent or illegal activities',
                'Comply with all applicable local and international laws'
              ]
            }
          ]
        },
        {
          id: 'account-termination',
          number: 10,
          title: 'Account Termination',
          content: 'We reserve the right to:',
          items: [
            {
              description: [
                'Suspend or terminate user access without notice',
                'Refuse service to anyone for violation of these Terms'
              ]
            }
          ],
          note: 'This includes misuse, fraud, or unlawful behavior.'
        },
        {
          id: 'third-party-links',
          number: 11,
          title: 'Third-Party Links',
          content: 'This website may contain links to third-party websites.',
          items: [
            {
              description: [
                'We do not control third-party content',
                'We are not responsible for external websites or services',
                'Use of third-party sites is at your own risk'
              ]
            }
          ]
        },
        {
          id: 'limitation-liability',
          number: 12,
          title: 'Limitation of Liability',
          icon: 'warning',
          content: 'To the fullest extent permitted by law, Evergreen Pharma shall not be liable for:',
          items: [
            {
              description: [
                'Health-related complications',
                'Losses arising from misuse of medicines',
                'Indirect or consequential damages',
                'Errors or omissions in content'
              ]
            }
          ],
          note: 'Use of this website is entirely at your own risk.'
        },
        {
          id: 'indemnification',
          number: 13,
          title: 'Indemnification',
          content: 'You agree to indemnify and hold harmless Evergreen Pharma from:',
          items: [
            {
              description: [
                'Claims',
                'Damages',
                'Losses',
                'Legal fees'
              ]
            }
          ],
          subtitle: 'arising from your violation of these Terms or misuse of the website.'
        },
        {
          id: 'privacy-policy',
          number: 14,
          title: 'Privacy Policy',
          content: 'Your use of this website is also governed by our Privacy Policy. Please review it to understand how we collect and use your information.'
        },
        {
          id: 'governing-law',
          number: 15,
          title: 'Governing Law',
          content: 'These Terms shall be governed and interpreted in accordance with applicable laws. Any disputes shall be subject to the jurisdiction of competent courts.'
        },
        {
          id: 'changes-terms',
          number: 16,
          title: 'Changes to Terms',
          content: 'We reserve the right to modify these Terms at any time.',
          items: [
            {
              description: [
                'Updates will be posted on this page',
                'Continued use of the website constitutes acceptance of updated Terms'
              ]
            }
          ]
        },
        {
          id: 'contact',
          number: 17,
          title: 'Contact Information',
          subtitle: 'For any questions regarding these Terms & Conditions, contact us:',
          items: [
            {
              title: 'Website:',
              description: 'https://evergreenpharma.us/contact'
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