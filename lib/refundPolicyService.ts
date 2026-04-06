// lib/refundPolicyService.ts

export interface RefundPolicyItem {
  title?: string;
  description: string | string[];
  icon?: 'check' | 'warning' | 'camera' | 'ban' | 'clock' | 'info';
}

export interface RefundPolicySection {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  content?: string;
  items?: RefundPolicyItem[];
  note?: string;
}

export interface RefundPolicyData {
  title: string;
  description: string;
  effectiveDate: string;
  lastUpdated: string;
  sections: RefundPolicySection[];
}

export const publicRefundPolicyService = {
  getRefundPolicy: async (): Promise<RefundPolicyData> => {
    return {
      title: 'Refund and Return Policy',
      description: 'Transparent protocols for returns, replacements, and cancellations at Evergreen Pharma.',
      effectiveDate: '01-03-2026',
      lastUpdated: '01-03-2026',
      sections: [
        {
          id: 'important-notice',
          number: 1,
          title: 'Important Notice (Medicines & Safety)',
          subtitle: 'Health & Safety Compliance',
          content: 'Due to the sensitive nature of pharmaceutical products and in compliance with health and safety regulations, medicines once sold or delivered are generally NOT eligible for return or refund. This policy exists to protect customer health and ensure product integrity.',
        },
        {
          id: 'non-returnable',
          number: 2,
          title: 'Non-Returnable Items',
          subtitle: 'Strictly Final Sale',
          items: [
            {
              description: [
                'Prescription medicines',
                'Over-the-counter medicines',
                'Opened or used products',
                'Products with damaged or missing seals',
                'Products returned after delivery',
                'Products purchased during promotional offers'
              ],
              icon: 'ban'
            }
          ]
        },
        {
          id: 'eligible-cases',
          number: 3,
          title: 'Eligible Refund or Replacement Cases',
          subtitle: 'Limited Exceptions',
          content: 'We may consider refunds or replacements ONLY in the following situations:',
          items: [
            {
              title: '3.1 Wrong Product Delivered',
              description: 'If you receive a product different from what you ordered.',
              icon: 'check'
            },
            {
              title: '3.2 Damaged Product on Arrival',
              description: 'If the product is damaged during shipping or packaging is visibly broken at delivery.',
              icon: 'warning'
            },
            {
              title: '3.3 Missing Product',
              description: 'If an item is missing from your order.',
              icon: 'check'
            }
          ]
        },
        {
          id: 'reporting',
          number: 4,
          title: 'Reporting an Issue',
          subtitle: 'The 24-Hour Rule',
          content: 'Failure to report within the specified timeframe may result in rejection of the request.',
          items: [
            {
              description: [
                'You must contact us within 24 hours of delivery',
                'Provide clear photos/videos of the received package',
                'Provide clear photos of the product label',
                'Provide invoice or order confirmation'
              ],
              icon: 'camera'
            }
          ]
        },
        {
          id: 'return-process',
          number: 5,
          title: 'Return Process (If Applicable)',
          subtitle: 'Authorization Required',
          content: 'Unauthorized returns will not be accepted. Do not return any product without prior approval from our support team.',
          items: [
            {
              description: [
                'Our support team will guide you through the process',
                'Returned items must be unopened and in original condition',
                'Return shipping instructions will be shared if required'
              ]
            }
          ]
        },
        {
          id: 'refund-processing',
          number: 6,
          title: 'Refund Processing',
          subtitle: 'Financial Timeline',
          content: 'Refunds will be issued via the original payment method. Processing time may vary depending on your bank or payment provider.',
          items: [
            {
              description: 'Approved refunds will be processed within 7–10 business days',
              icon: 'clock'
            }
          ]
        },
        {
          id: 'replacement-policy',
          number: 7,
          title: 'Replacement Policy',
          subtitle: 'Product Exchange',
          content: 'If eligible, replacement products will be dispatched at no additional cost. Delivery timelines may vary depending on product availability.'
        },
        {
          id: 'cancellation-policy',
          number: 8,
          title: 'Order Cancellation Policy',
          items: [
            {
              title: '8.1 Before Shipment',
              description: 'Orders may be cancelled before dispatch. Requests must be submitted immediately.'
            },
            {
              title: '8.2 After Shipment',
              description: 'Orders cannot be cancelled once shipped. No refunds will be provided after dispatch.',
              icon: 'ban'
            }
          ]
        },
        {
          id: 'shipping-charges',
          number: 9,
          title: 'Shipping Charges',
          content: 'Shipping fees are non-refundable. Return shipping costs may be borne by the customer unless the error is ours.'
        },
        {
          id: 'fraud-prevention',
          number: 10,
          title: 'Fraud Prevention',
          subtitle: 'Account Protection',
          items: [
            {
              description: [
                'We reserve the right to reject refund requests that appear fraudulent',
                'We may limit or block accounts with repeated refund abuse',
                'We may request additional verification if necessary'
              ]
            }
          ]
        },
        {
          id: 'regulatory-compliance',
          number: 11,
          title: 'Regulatory Compliance',
          subtitle: 'Legal Standards',
          content: 'Refunds and returns are subject to applicable pharmaceutical laws and local/international health regulations. We strictly adhere to compliance standards for medicine handling.'
        },
        {
          id: 'policy-changes',
          number: 12,
          title: 'Changes to This Policy',
          subtitle: 'Policy Evolution',
          content: 'Evergreen Pharma reserves the right to modify this policy at any time. Changes will be updated on this page with a revised “Last Updated” date. Continued use of the website indicates acceptance of the updated policy.',
          icon: 'info'
        },
        {
          id: 'contact',
          number: 13,
          title: 'Contact Information',
          subtitle: 'Submit a Request',
          items: [
            { title: 'Website', description: 'https://evergreenpharma.us' },
            { title: 'Email', description: 'med@evergreenpharmacy.net' },
            { title: 'Contact Page', description: 'https://evergreenpharma.us/contact' }
          ]
        }
      ]
    };
  }
};