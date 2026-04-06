// lib/disclaimerService.ts
export interface DisclaimerSection {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  content?: string;
  items?: DisclaimerItem[];
  note?: string;
  icon?: 'warning' | 'important' | 'info';
}

export interface DisclaimerItem {
  title?: string;
  description: string | string[];
  icon?: string;
}

export interface DisclaimerData {
  title: string;
  description: string;
  effectiveDate: string;
  lastUpdated: string;
  sections: DisclaimerSection[];
}

// Mock service for fetching disclaimer data
export const publicDisclaimerService = {
  getDisclaimer: async (): Promise<DisclaimerData> => {
    return {
      title: 'Disclaimer',
      description: 'Important legal information about the use of our website',
      effectiveDate: '01-03-2026',
      lastUpdated: '01-03-2026',
      sections: [
        {
          id: 'introduction',
          number: 0,
          title: 'Introduction',
          content: 'Welcome to Evergreen Pharma (https://evergreenpharma.us). By accessing and using this website, you acknowledge and agree to the terms outlined in this Disclaimer. If you do not agree, please discontinue use of this website immediately.'
        },
        {
          id: 'general-information',
          number: 1,
          title: 'General Information Disclaimer',
          content: 'All information provided on evergreenpharma.us is published in good faith and for general informational and educational purposes only. Evergreen Pharma makes no warranties or guarantees regarding the completeness, reliability, accuracy, or suitability of any information available on this website. Any action you take based on the information found on this website is strictly at your own risk.'
        },
        {
          id: 'medical-disclaimer',
          number: 2,
          title: 'Medical Disclaimer (Very Important)',
          icon: 'warning',
          subtitle: 'The content on evergreenpharma.us, including but not limited to:',
          items: [
            {
              description: [
                'Medicine descriptions',
                'Drug information',
                'Dosage details',
                'Usage instructions',
                'Side effects',
                'Health-related articles or blogs'
              ]
            }
          ],
          content: 'is NOT intended as medical advice and should not be considered a substitute for professional medical consultation, diagnosis, or treatment.'
        },
        {
          id: 'prescription-disclaimer',
          number: 3,
          title: 'Prescription Medication Disclaimer',
          subtitle: 'Some medications available or discussed on this website may require a valid prescription.',
          items: [
            {
              description: [
                'We do not encourage self-medication',
                'Prescription drugs should only be used under professional supervision',
                'Users are responsible for providing accurate prescription details where required'
              ]
            }
          ],
          note: 'Evergreen Pharma shall not be held responsible for misuse, incorrect dosage, or unauthorized use of any medication.'
        },
        {
          id: 'accuracy-information',
          number: 4,
          title: 'Accuracy of Information',
          content: 'While we strive to keep all information up to date and accurate:',
          items: [
            {
              description: [
                'Medicine formulations, guidelines, and regulations may change',
                'Information may become outdated or incomplete over time'
              ]
            }
          ]
        },
        {
          id: 'product-disclaimer',
          number: 5,
          title: 'Product Disclaimer',
          subtitle: 'Images, descriptions, packaging, and branding of medicines displayed on evergreenpharma.us are for illustrative purposes only.',
          content: 'Actual products may vary in:',
          items: [
            {
              description: [
                'Appearance',
                'Packaging',
                'Manufacturer branding'
              ]
            }
          ],
          note: 'Evergreen Pharma does not guarantee that product images perfectly represent the delivered product.'
        },
        {
          id: 'external-links',
          number: 6,
          title: 'External Links Disclaimer',
          content: 'This website may contain links to third-party websites for additional information or services.',
          items: [
            {
              description: [
                'Evergreen Pharma has no control over external websites',
                'We do not guarantee the accuracy, relevance, or reliability of third-party content',
                'Clicking external links is done at your own discretion'
              ]
            }
          ],
          note: 'We are not responsible for any loss or damage caused by third-party websites.'
        },
        {
          id: 'limitation-liability',
          number: 7,
          title: 'Limitation of Liability',
          icon: 'warning',
          content: 'Under no circumstances shall Evergreen Pharma, its owners, employees, partners, or affiliates be liable for:',
          items: [
            {
              description: [
                'Direct or indirect damages',
                'Health complications',
                'Loss of data or revenue',
                'Misuse of information or products'
              ]
            }
          ],
          subtitle: 'arising from the use of this website or reliance on its content.'
        },
        {
          id: 'user-responsibility',
          number: 8,
          title: 'User Responsibility',
          content: 'By using evergreenpharma.us, you agree that:',
          items: [
            {
              description: [
                'You are responsible for verifying information before acting on it',
                'You will consult a healthcare professional when required',
                'You understand the risks associated with medication use'
              ]
            }
          ],
          note: 'Evergreen Pharma shall not be responsible for consequences arising from self-diagnosis or self-treatment.'
        },
        {
          id: 'no-relationship',
          number: 9,
          title: 'No Professional-Client Relationship',
          content: 'Use of this website does not create:',
          items: [
            {
              description: [
                'Doctor-patient relationship',
                'Pharmacist-patient relationship',
                'Professional healthcare relationship'
              ]
            }
          ],
          subtitle: 'Any communication via this website is informational only.'
        },
        {
          id: 'regulatory-compliance',
          number: 10,
          title: 'Regulatory Compliance Disclaimer',
          content: 'Evergreen Pharma operates in accordance with applicable laws and regulations. However:',
          items: [
            {
              description: [
                'Availability of medicines may vary by region',
                'Users are responsible for ensuring legal compliance in their jurisdiction'
              ]
            }
          ],
          note: 'We do not guarantee availability or legality of all products in every location.'
        },
        {
          id: 'changes-disclaimer',
          number: 11,
          title: 'Changes to This Disclaimer',
          content: 'Evergreen Pharma reserves the right to update or modify this Disclaimer at any time without prior notice.',
          items: [
            {
              description: [
                'Changes will be reflected on this page with an updated "Last Updated" date',
                'Continued use of the website indicates acceptance of the revised Disclaimer'
              ]
            }
          ]
        },
        {
          id: 'contact',
          number: 12,
          title: 'Contact Information',
          subtitle: 'If you have any questions regarding this Disclaimer, please contact us:',
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