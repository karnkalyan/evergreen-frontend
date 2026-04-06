// lib/shippingPolicyService.ts

export interface ShippingPolicyItem {
  title?: string;
  description: string | string[];
  icon?: 'truck' | 'globe' | 'clock' | 'tracking' | 'box' | 'alert' | 'map';
}

export interface ShippingPolicySection {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  content?: string;
  items?: ShippingPolicyItem[];
}

export interface ShippingPolicyData {
  title: string;
  description: string;
  effectiveDate: string;
  lastUpdated: string;
  sections: ShippingPolicySection[];
}

export const publicShippingPolicyService = {
  getShippingPolicy: async (): Promise<ShippingPolicyData> => {
    return {
      title: 'Shipping Policy',
      description: 'Guidelines on how Evergreen Pharma processes, ships, and delivers your medical supplies globally.',
      effectiveDate: '01-03-2026',
      lastUpdated: '01-03-2026',
      sections: [
        {
          id: 'processing-time',
          number: 1,
          title: 'Order Processing Time',
          subtitle: 'Internal Fulfillment',
          content: 'We prioritize accuracy in medical fulfillment. Orders are typically processed within 1–3 business days.',
          items: [
            { description: 'Weekend/Holiday orders process next business day', icon: 'clock' },
            { description: 'Prescription verification may add processing time', icon: 'alert' }
          ]
        },
        {
          id: 'locations',
          number: 2,
          title: 'Shipping Locations',
          subtitle: 'Global Reach',
          items: [
            { title: 'Domestic', description: 'Full coverage across the United States.', icon: 'map' },
            { title: 'International', description: 'Selected international destinations (subject to local regulations).', icon: 'globe' }
          ]
        },
        {
          id: 'estimated-delivery',
          number: 4,
          title: 'Estimated Delivery Time',
          subtitle: 'Transit Windows',
          items: [
            { title: 'United States', description: '5–10 business days', icon: 'truck' },
            { title: 'International', description: '10–21 business days', icon: 'globe' }
          ]
        },
        {
          id: 'tracking',
          number: 6,
          title: 'Order Tracking',
          subtitle: 'Real-time Updates',
          content: 'Tracking details are shared via email once the order is dispatched.',
          items: [
            { description: 'Allow 48 hours for tracking links to activate.', icon: 'tracking' }
          ]
        },
        {
          id: 'customs-taxes',
          number: 7,
          title: 'Customs, Duties & Taxes',
          subtitle: 'International Compliance',
          content: 'For international shipments, customs duties or import fees are the sole responsibility of the customer.',
          items: [
            { description: 'Failure to clear customs may result in order loss without refund.', icon: 'alert' }
          ]
        },
        {
          id: 'damaged-packages',
          number: 10,
          title: 'Damaged Packages',
          subtitle: 'Arrival Protocol',
          content: 'If your package arrives visibly damaged, do not accept the delivery.',
          items: [
            { description: 'Take photos/videos immediately and contact us within 24 hours.', icon: 'camera' as any }
          ]
        },
        {
          id: 'delivery-responsibility',
          number: 11,
          title: 'Delivery Responsibility',
          subtitle: 'Final Handover',
          content: 'Evergreen Pharma is not responsible for theft or loss after the courier marks the package as "Delivered".',
          items: [
            { description: 'Ensure your delivery location is secure.', icon: 'box' }
          ]
        },
        {
          id: 'policy-changes',
          number: 13,
          title: 'Changes to This Policy',
          content: 'Updates will be reflected on this page with a revised “Last Updated” date. Continued use constitutes acceptance.',
        },
        {
          id: 'contact',
          number: 14,
          title: 'Contact Information',
          subtitle: 'Logistics Support',
          items: [
            { title: 'Email', description: 'med@evergreenpharmacy.net' },
            { title: 'Support', description: 'https://evergreenpharma.us/contact' }
          ]
        }
      ]
    };
  }
};