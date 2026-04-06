import React from 'react';
import { Product, Brand, Category, Order, CartItem, Testimonial, ProductVariant, Customer, Supplier, PurchaseOrder, ShippingOption, HomepageSection, Coupon, Promotion, BlogPost, CmsPage, AdminUser, EmailTemplate, AutomationRule, TrustBadgeItem } from '../types';

export interface BrandWithLogo extends Brand {
  logo: string;
}

export interface Article {
  id: number;
  title: string;
  image: string;
  excerpt: string;
  slug: string; 
}

export const BRANDS: BrandWithLogo[] = [
  { id: 1, name: 'Wellness Inc.', logo: '/images/brand-logo-1.svg' },
  { id: 2, name: 'HealthFirst Pharma', logo: '/images/brand-logo-2.svg' },
  { id: 3, name: 'VitaLife Nutrition', logo: '/images/brand-logo-3.svg' },
  { id: 4, name: 'MediCare Essentials', logo: '/images/brand-logo-4.svg' },
  { id: 5, name: 'NatureWell', logo: '/images/brand-logo-5.svg' },
  { id: 6, name: 'ProHeal', logo: '/images/brand-logo-1.svg' },

];

export const CATEGORIES: Category[] = [
  { id: 1, name: 'Vitamins', slug: 'vitamins-supplements', color: '#4ade80', productCount: 2, icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l-2.25-1.313M3 7.5l-2.25 1.313M3 7.5v2.25m9 3l-2.25-1.313M12 12.75l-2.25 1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M12 7.5V5.25m0 2.25l-2.25-1.313m0 0L12 2.25" })) },
  { id: 2, name: 'Pain Relief', slug: 'pain-relief', color: '#f87171', productCount: 1, icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.83-5.83M11.42 15.17l-4.242 4.242a2.652 2.652 0 01-3.75 0L2.25 18.25a2.652 2.652 0 010-3.75l4.242-4.242M11.42 15.17L15.17 11.42M11.42 15.17l-4.242-4.242m4.242 4.242l4.242-4.242M11.42 15.17l-4.242 4.242" })) },
  { id: 3, name: 'Cold & Flu', slug: 'cold-flu', color: '#fb923c', productCount: 2, icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" })) },
  { id: 4, name: 'Personal Care', slug: 'personal-care', color: '#60a5fa', productCount: 1, icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a12.019 12.019 0 00-5.84-2.56m0 0a12.019 12.019 0 00-5.84 2.56m5.84-2.56v-4.82a6 6 0 015.84-7.38v4.82" })) },
  { id: 5, name: 'First Aid', slug: 'first-aid', color: '#c084fc', productCount: 1, icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4.5v15m7.5-7.5h-15" })) },
  { id: 6, name: 'Anti Cancer', slug: 'anti-cancer', color: '#2dd4bf', productCount: 8, icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 12.75l-7.5-7.5-7.5 7.5m15 6l-7.5-7.5-7.5 7.5" })) },
  { id: 7, name: 'HIV', slug: 'hiv', color: '#f472b6', productCount: 8, icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" })) },
  { id: 8, name: 'Erectile Dysfunction', slug: 'erectile-dysfunction', productCount: 8, color: '#38bdf8', icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" })) },
  { id: 9, name: 'Urinary', slug: 'urinary', color: '#facc15', productCount: 8, icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 6v1.5m0 7.5V18" })) },
  { id: 10, name: 'Cosmetic', slug: 'cosmetic', color: '#ec4899', productCount: 8, icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 9.75h.008v.008H9V9.75zm6 0h.008v.008H15V9.75z" })) },
  { id: 11, name: 'Cardiology', slug: 'cardiology', color: '#ef4444', productCount: 0, icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" })) },
  { id: 12, name: 'Eye Care', slug: 'eye-care', color: '#0ea5e9', productCount: 0, icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" }), React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })) },
  { id: 13, name: 'Diabetes', slug: 'diabetes', color: '#f97316', productCount: 0, icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 18.75a6 6 0 006-6H6a6 6 0 006 6z" })) },
  { id: 14, name: 'Lungs', slug: 'lungs', color: '#8b5cf6', productCount: 0, icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" }, React.createElement('path', { d: "M16.5 21a3 3 0 100-6 3 3 0 000 6zM7.5 21a3 3 0 100-6 3 3 0 000 6z" }), React.createElement('path', { d: "M16.5 15.75c0-3.375-2.25-6-5.25-6s-5.25 2.625-5.25 6" }), React.createElement('path', { d: "M2.25 6.75c0-2.485 2.015-4.5 4.5-4.5h10.5c2.485 0 4.5 2.015 4.5 4.5v3" })) },
  { id: 15, name: 'Skin Care', slug: 'skin-care', color: '#14b8a6', productCount: 0, icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c1.354 0 2.684-.336 3.868-.949M12 21c-1.354 0-2.684-.336-3.868-.949" }), React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M4 4.5a9 9 0 1016 0" })) },
  { id: 16, name: 'Neurology', slug: 'neurology', color: '#64748b', productCount: 0, icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" }, React.createElement('path', { d: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995a6.47 6.47 0 010 1.91l.438.995c.002.003.004.005.004.007a1.125 1.125 0 01-.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.332.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-.995a6.471 6.471 0 010-1.91l-.437-.995a1.125 1.125 0 01.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" }), React.createElement('path', { d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })) },
  { id: 17, name: 'Covid 19', slug: 'covid-19', color: '#a16207', productCount: 0, icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" })) },
  { id: 18, name: 'Hepatitis', slug: 'hepatitis', color: '#4d7c0f', productCount: 0, icon: React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })) },
];

const placeholderImage = 'https://thespinecommunity.com/.image/ar_16:9%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cg_faces:center%2Cq_auto:good%2Cw_768/MTc5MzQ1NzAzNDE3ODgyMzA3/image-placeholder-title.jpg';


export const PRODUCTS: Product[] = [
  // Existing products...
  {
    id: 1, sku: 'VTL-001', name: 'VitaLife Vitamin D3 5000 IU', slug: 'vitalife-vitamin-d3-5000-iu', brand: BRANDS[2], category: CATEGORIES[0], description: 'High-potency Vitamin D3 for bone, immune, and overall health.', composition: 'Vitamin D3 (as Cholecalciferol) 5000 IU', strengths: ['5000 IU'], forms: ['Softgel'], price: 15.99, mrp: 19.99, discount_percent: 20, prescription_required: false, stock: 150, images: [placeholderImage], tags: ['vitamin d', 'bone health', 'immune support'], symptoms: ['Weak Bones', 'Low Immunity'], rating: 4.8, reviews: 245, views: 12500, isFeatured: true, isTrending: true,
    variants: [
        { country: 'US', shipping: 'Domestic', currency: 'USD', options: [
            { label: '60 Softgels', price: 14.99, mrp: 18.99, stock: 100 },
            { label: '120 Softgels', price: 25.99, mrp: 32.99, stock: 80 }
        ]},
        { country: 'Global', shipping: 'Overseas', currency: 'USD', options: [
            { label: '180 Softgels', price: 35.99, mrp: 45.99, stock: 150 }
        ]}
    ]
  },
  {
    id: 2, sku: 'HFP-002', name: 'HealthFirst Ibuprofen 200mg', slug: 'healthfirst-ibuprofen-200mg', brand: BRANDS[1], category: CATEGORIES[1], description: 'Fast-acting pain reliever and fever reducer.', composition: 'Ibuprofen 200mg', strengths: ['200mg', '400mg'], forms: ['Tablet', 'Caplet'], price: 8.49, mrp: 10.99, discount_percent: 23, prescription_required: false, stock: 200, images: [placeholderImage], tags: ['pain relief', 'ibuprofen', 'headache'], symptoms: ['Headache', 'Muscle Pain', 'Fever'], rating: 4.6, reviews: 512, views: 25000, isFeatured: true,
     variants: [
        { country: 'US', shipping: 'Domestic', currency: 'USD', options: [
            { label: '50 Tablets', price: 7.99, mrp: 9.99, stock: 150 },
            { label: '100 Tablets', price: 12.99, mrp: 15.99, stock: 100 },
        ]},
        { country: 'UK', shipping: 'Domestic', currency: 'GBP', options: [
            { label: '32 Tablets', price: 6.99, mrp: 8.99, stock: 120 },
        ]},
        { country: 'Global', shipping: 'Overseas', currency: 'USD', options: [
            { label: '200 Tablets (Value Pack)', price: 18.99, mrp: 24.99, stock: 200 },
        ]}
    ]
  },
  {
    id: 3, sku: 'WLI-003', name: 'Wellness Inc. Antiseptic Wipes', slug: 'wellness-inc-antiseptic-wipes', brand: BRANDS[0], category: CATEGORIES[4], description: 'Kills 99.9% of germs.', composition: 'Benzalkonium Chloride 0.13%', strengths: [], forms: ['Wipe'], price: 4.99, mrp: 5.99, discount_percent: 17, prescription_required: false, stock: 0, images: [placeholderImage], tags: ['first aid', 'antiseptic', 'wipes'], symptoms: ['Cuts & Wounds'], rating: 4.9, reviews: 180, views: 8000,
    variants: [
        { country: 'US', shipping: 'Domestic', currency: 'USD', options: [
            { label: '50 Wipes', price: 4.99, mrp: 5.99, stock: 0 },
            { label: '100 Wipes', price: 8.99, mrp: 10.99, stock: 150 },
        ]}
    ]
  },
  {
    id: 4, sku: 'MCE-004', name: 'MediCare Amoxicillin 500mg', slug: 'medicare-amoxicillin-500mg', brand: BRANDS[3], category: CATEGORIES[2], description: 'Prescription antibiotic for treating bacterial infections. Amoxicillin is a penicillin antibiotic that fights bacteria.', composition: 'Amoxicillin 500mg', strengths: ['250mg', '500mg'], forms: ['Capsule'], price: 25.00, mrp: 30.00, discount_percent: 17, prescription_required: true, stock: 50, images: [placeholderImage], tags: ['antibiotic', 'prescription', 'infection'], symptoms: ['Bacterial Infection'], rating: 4.7, reviews: 95, views: 5500, isTrending: true,
    variants: [
        { country: 'US', shipping: 'Domestic', currency: 'USD', options: [
            { label: '30 Capsules', price: 25.00, mrp: 30.00, stock: 50 },
            { label: '60 Capsules', price: 45.00, mrp: 55.00, stock: 30 },
            { label: '90 Capsules', price: 60.00, mrp: 75.00, stock: 20 },
        ]},
        { country: 'Global', shipping: 'Overseas', currency: 'USD', options: [
            { label: '100 Capsules', price: 70.00, mrp: 90.00, stock: 100 },
            { label: '200 Capsules', price: 130.00, mrp: 170.00, stock: 80 },
        ]},
        { country: 'UK', shipping: 'Domestic', currency: 'GBP', options: [
            { label: '21 Capsules', price: 22.00, mrp: 28.00, stock: 40 },
            { label: '42 Capsules', price: 40.00, mrp: 50.00, stock: 25 },
        ]}
    ]
  },
  {
    id: 5, sku: 'VTL-005', name: 'VitaLife Omega-3 Fish Oil', slug: 'vitalife-omega-3-fish-oil', brand: BRANDS[2], category: CATEGORIES[0], description: 'Supports heart and brain health.', composition: 'Fish Oil 1200mg (600mg Omega-3)', strengths: ['1200mg'], forms: ['Softgel'], price: 22.50, mrp: 28.00, discount_percent: 20, prescription_required: false, stock: 120, images: [placeholderImage], tags: ['omega-3', 'heart health'], symptoms: ['High Cholesterol', 'Poor Memory'], rating: 4.8, reviews: 310, views: 18000,
    variants: [
        { country: 'Global', shipping: 'Overseas', currency: 'USD', options: [
            { label: '90 Softgels', price: 22.50, mrp: 28.00, stock: 120 },
            { label: '180 Softgels', price: 40.50, mrp: 50.00, stock: 80 },
        ]}
    ]
  },
  {
    id: 6, sku: 'HFP-006', name: 'HealthFirst Cold & Flu Relief', slug: 'healthfirst-cold-flu-relief', brand: BRANDS[1], category: CATEGORIES[2], description: 'Multi-symptom relief from cold and flu.', composition: 'Acetaminophen 325mg, Dextromethorphan HBr 10mg, Phenylephrine HCl 5mg', strengths: [], forms: ['Tablet'], price: 12.99, mrp: 15.99, discount_percent: 19, prescription_required: false, stock: 18, images: [placeholderImage], tags: ['cold relief', 'flu', 'cough'], symptoms: ['Cough', 'Fever', 'Nasal Congestion'], rating: 4.5, reviews: 210, views: 9800
  },
  {
    id: 7, sku: 'NWL-007', name: 'NatureWell Melatonin 5mg', slug: 'naturewell-melatonin-5mg', brand: BRANDS[4], category: CATEGORIES[0], description: 'Helps promote restful sleep.', composition: 'Melatonin 5mg', strengths: ['5mg', '10mg'], forms: ['Tablet'], price: 9.99, mrp: 12.99, discount_percent: 23, prescription_required: false, stock: 80, images: [placeholderImage], tags: ['sleep aid', 'melatonin'], symptoms: ['Sleeplessness'], rating: 4.7, reviews: 450, views: 22000, isTrending: true
  },
  {
    id: 8, sku: 'PHL-008', name: 'ProHeal Bandages Assorted Pack', slug: 'proheal-bandages-assorted-pack', brand: BRANDS[5], category: CATEGORIES[4], description: 'Assorted pack of sterile bandages for minor cuts and scrapes.', composition: 'N/A', strengths: [], forms: ['Bandage'], price: 6.29, mrp: 7.99, discount_percent: 21, prescription_required: false, stock: 300, images: [placeholderImage], tags: ['first aid', 'bandages'], symptoms: ['Cuts & Wounds'], rating: 4.9, reviews: 320, views: 15000
  },
   {
    id: 9, sku: 'VTL-009', name: 'Tadalafil 20mg', slug: 'tadalafil-20mg', brand: BRANDS[2], category: CATEGORIES[7], description: 'Effective treatment for erectile dysfunction.', composition: 'Tadalafil', strengths: ['5mg', '10mg', '20mg'], forms: ['Tablet'], price: 1.50, mrp: 2.50, discount_percent: 40, prescription_required: true, stock: 1000, images: [placeholderImage], tags: ['ed', 'tadalafil'], symptoms: ['Erectile Dysfunction'], rating: 4.9, reviews: 1203, views: 85000, isFeatured: true,
     variants: [
        { country: 'US', shipping: 'Domestic', currency: 'USD', options: [
            { label: '30 Tablets', price: 45.00, mrp: 75.00, stock: 500 },
            { label: '60 Tablets', price: 85.00, mrp: 150.00, stock: 300 },
        ]},
        { country: 'Global', shipping: 'Overseas', currency: 'USD', options: [
            { label: '90 Tablets', price: 110.00, mrp: 225.00, stock: 800 },
        ]}
    ]
  },
   {
    id: 10, sku: 'HFP-010', name: 'Sildenafil 100mg', slug: 'sildenafil-100mg', brand: BRANDS[1], category: CATEGORIES[7], description: 'Classic treatment for erectile dysfunction.', composition: 'Sildenafil Citrate', strengths: ['50mg', '100mg', '150mg'], forms: ['Tablet'], price: 1.20, mrp: 2.00, discount_percent: 40, prescription_required: true, stock: 1200, images: [placeholderImage], tags: ['ed', 'sildenafil'], symptoms: ['Erectile Dysfunction'], rating: 4.8, reviews: 2500, views: 120000,
     variants: [
        { country: 'Global', shipping: 'Overseas', currency: 'USD', options: [
            { label: '100 Tablets', price: 120.00, mrp: 200.00, stock: 600 },
            { label: '200 Tablets', price: 220.00, mrp: 400.00, stock: 400 },
        ]}
    ]
  },
  // ADDING NEW PRODUCTS TO POPULATE CATEGORIES
  // ... 6 more for ED
  ...Array.from({ length: 6 }, (_, i) => ({
    id: 11 + i, sku: `ED-00${i+1}`, name: `VigorMax Strength ${50 + i*10}mg`, slug: `vigormax-strength-${50 + i*10}mg`, brand: BRANDS[i % 5], category: CATEGORIES[7], description: 'Advanced formula for improved male performance.', composition: 'Herbal Blend', strengths: [`${50 + i*10}mg`], forms: ['Tablet'], price: 2.00 + i, mrp: 3.50 + i, discount_percent: 30, prescription_required: true, stock: 500, images: [placeholderImage], tags: ['ed', 'performance'], symptoms: ['Erectile Dysfunction'], rating: 4.7, reviews: 300 + i*20, views: 40000 + i*1000,
  })),
  // ... 8 for Anti Cancer
  ...Array.from({ length: 8 }, (_, i) => ({
    id: 17 + i, sku: `ACN-00${i+1}`, name: `OncoSupport Formula ${100 + i*50}mg`, slug: `oncosupport-formula-${100 + i*50}mg`, brand: BRANDS[i % 5], category: CATEGORIES[5], description: 'Supportive care medication for oncology patients.', composition: 'Bio-active Peptides', strengths: [`${100 + i*50}mg`], forms: ['Capsule'], price: 50 + i*5, mrp: 65 + i*5, discount_percent: 15, prescription_required: true, stock: 100, images: [placeholderImage], tags: ['anti-cancer', 'supportive care'], symptoms: ['Cancer Treatment Side Effects'], rating: 4.9, reviews: 150 + i*10, views: 10000 + i*500,
  })),
  // ... 8 for HIV
  ...Array.from({ length: 8 }, (_, i) => ({
    id: 25 + i, sku: `HIV-00${i+1}`, name: `ViroStat ${200 + i*100}mg`, slug: `virostat-${200 + i*100}mg`, brand: BRANDS[i % 5], category: CATEGORIES[6], description: 'Antiretroviral medication for the management of HIV.', composition: 'Tenofovir Disoproxil', strengths: [`${200 + i*100}mg`], forms: ['Tablet'], price: 80 + i*10, mrp: 100 + i*10, discount_percent: 20, prescription_required: true, stock: 200, images: [placeholderImage], tags: ['hiv', 'antiretroviral'], symptoms: ['HIV Infection'], rating: 4.8, reviews: 400 + i*15, views: 35000 + i*1000,
  })),
  // ... 8 for Urinary
  ...Array.from({ length: 8 }, (_, i) => ({
    id: 33 + i, sku: `URN-00${i+1}`, name: `UroRelief Max Strength`, slug: `urorelief-max-strength-${i+1}`, brand: BRANDS[i % 5], category: CATEGORIES[8], description: 'Fast-acting relief from urinary discomfort.', composition: 'Cranberry Extract, D-Mannose', strengths: ['500mg'], forms: ['Capsule'], price: 18 + i, mrp: 25 + i, discount_percent: 22, prescription_required: false, stock: 300, images: [placeholderImage], tags: ['urinary', 'uti'], symptoms: ['Urinary Tract Infection'], rating: 4.6, reviews: 250 + i*10, views: 15000 + i*500,
  })),
  // ... 8 for Cosmetic
  ...Array.from({ length: 8 }, (_, i) => ({
    id: 41 + i, sku: `CSM-00${i+1}`, name: `GlowUp Retinol Serum`, slug: `glowup-retinol-serum-${i+1}`, brand: BRANDS[i % 5], category: CATEGORIES[9], description: 'Advanced anti-aging serum for radiant skin.', composition: 'Retinol 0.5%, Hyaluronic Acid', strengths: ['0.5%'], forms: ['Serum'], price: 35 + i*2, mrp: 45 + i*2, discount_percent: 18, prescription_required: false, stock: 400, images: [placeholderImage], tags: ['cosmetic', 'skincare', 'anti-aging'], symptoms: ['Wrinkles', 'Dull Skin'], rating: 4.8, reviews: 600 + i*25, views: 50000 + i*1500, isFeatured: i < 2,
  })),
];

export const ARTICLES: Article[] = [
  { id: 1, title: 'The Surprising Benefits of Vitamin D', image: '/images/article-1.jpg', excerpt: 'Beyond bone health, discover how this essential vitamin impacts your immune system, mood, and more.', slug: 'benefits-of-vitamin-d' },
  { id: 2, title: 'Navigating Cold & Flu Season: A Guide', image: '/images/article-2.jpg', excerpt: 'Tips and tricks to stay healthy and what to do when you catch a bug. Learn how to recover faster.', slug: 'cold-and-flu-guide' },
  { id: 3, title: 'Understanding Your First Aid Kit', image: '/images/article-3.jpg', excerpt: 'What are the must-have items in every home first aid kit? We break it down for you.', slug: 'first-aid-kit-essentials' },
];

export const MOCK_ORDERS: Order[] = [
    {
        id: 'ORD-2023-001',
        date: '2023-10-26T10:00:00Z',
        customer: { id: 'CUST-001', name: 'John Doe' },
        status: 'Delivered',
        total: 75.45,
        currency: 'USD',
        items: [
            { product: PRODUCTS[3], quantity: 1, variantDetail: { country: 'US', shipping: 'Domestic', currency: 'USD', label: '30 Capsules', price: 25.00, mrp: 30.00 } },
            { product: PRODUCTS[0], quantity: 2, variantDetail: { country: 'US', shipping: 'Domestic', currency: 'USD', label: '120 Softgels', price: 25.99, mrp: 32.99 } },
        ]
    },
    {
        id: 'ORD-2023-002',
        date: '2023-10-28T14:30:00Z',
        customer: { id: 'CUST-002', name: 'Jane Smith' },
        status: 'Shipped',
        total: 25.98,
        currency: 'USD',
        items: [
            { product: PRODUCTS[1], quantity: 2, variantDetail: { country: 'US', shipping: 'Domestic', currency: 'USD', label: '100 Tablets', price: 12.99, mrp: 15.99 } },
        ]
    },
     {
        id: 'ORD-2023-003',
        date: '2023-10-29T09:15:00Z',
        customer: { id: 'CUST-001', name: 'John Doe' },
        status: 'Processing',
        total: 50.49,
        currency: 'USD',
        items: [
            { product: PRODUCTS[4], quantity: 1, variantDetail: { country: 'Global', shipping: 'Overseas', currency: 'USD', label: '90 Softgels', price: 22.50, mrp: 28.00 } },
            { product: PRODUCTS[6], quantity: 1, variantDetail: { country: 'Global', shipping: 'Overseas', currency: 'USD', label: '60 Tablets', price: 9.99, mrp: 12.99 } },
            { product: PRODUCTS[7], quantity: 1, variantDetail: { country: 'Global', shipping: 'Overseas', currency: 'USD', label: 'Assorted Pack', price: 6.29, mrp: 7.99 } },
        ]
    },
    {
        id: 'ORD-2023-004',
        date: '2023-10-25T11:00:00Z',
        customer: { id: 'CUST-003', name: 'Peter Jones' },
        status: 'Cancelled',
        total: 14.99,
        currency: 'GBP',
        items: [
            { product: PRODUCTS[0], quantity: 1, variantDetail: { country: 'UK', shipping: 'Domestic', currency: 'GBP', label: '60 Softgels', price: 14.99, mrp: 18.99 } },
        ]
    },
    {
        id: 'ORD-2023-005',
        date: '2023-10-22T18:45:00Z',
        customer: { id: 'CUST-004', name: 'Mary Johnson' },
        status: 'Delivered',
        total: 85.00,
        currency: 'USD',
        items: [
            { product: PRODUCTS[8], quantity: 1, variantDetail: { country: 'US', shipping: 'Domestic', currency: 'USD', label: '60 Tablets', price: 85.00, mrp: 150.00 } },
        ]
    }
];

export const MOCK_CART_ITEMS: CartItem[] = [
    { product: PRODUCTS[0], quantity: 1, variantDetail: { country: 'US', shipping: 'Domestic', currency: 'USD', label: '60 Softgels', price: 14.99, mrp: 18.99 } },
    { product: PRODUCTS[1], quantity: 2, variantDetail: { country: 'US', shipping: 'Domestic', currency: 'USD', label: '100 Tablets', price: 12.99, mrp: 15.99 } },
];

export const MOCK_CUSTOMERS: Customer[] = [
    { id: 'CUST-001', name: 'John Doe', email: 'john.d@example.com', phone: '555-0101', address: { street: '123 Health St', city: 'Wellness City', state: 'CA', zipCode: '90210', country: 'USA'}, registeredDate: '2023-01-15', lastLogin: '2023-10-29', totalOrders: 5, totalSpent: 345.60 },
    { id: 'CUST-002', name: 'Jane Smith', email: 'jane.s@example.com', phone: '555-0102', address: { street: '456 Vita Ave', city: 'Nutri-ville', state: 'FL', zipCode: '33101', country: 'USA'}, registeredDate: '2023-03-22', lastLogin: '2023-10-28', totalOrders: 2, totalSpent: 88.20 },
    { id: 'CUST-003', name: 'Peter Jones', email: 'peter.j@example.com', phone: '555-0103', address: { street: '789 Cure Blvd', city: 'Remedy Town', state: 'TX', zipCode: '75001', country: 'USA'}, registeredDate: '2023-05-10', lastLogin: '2023-09-15', totalOrders: 1, totalSpent: 0 },
    { id: 'CUST-004', name: 'Mary Johnson', email: 'mary.j@example.com', phone: '555-0104', address: { street: '101 Pharma Rd', city: 'Medicinal City', state: 'NY', zipCode: '10001', country: 'USA'}, registeredDate: '2022-11-01', lastLogin: '2023-10-22', totalOrders: 12, totalSpent: 1250.90 },
];

export const MOCK_SUPPLIERS: Supplier[] = [
    { id: 1, name: 'PharmaDist Inc.', contactPerson: 'Sarah Chen', email: 'sarah@pharmadist.com' },
    { id: 2, name: 'Global Med Supplies', contactPerson: 'David Rodriguez', email: 'david@globalmed.com' },
];

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
    {
        id: 'PO-2023-001', supplierId: 1, date: '2023-10-15', status: 'Received', totalCost: 1500,
        items: [
            { productId: 1, productName: 'VitaLife Vitamin D3 5000 IU', quantity: 50, costPerItem: 10.00 },
            { productId: 2, productName: 'HealthFirst Ibuprofen 200mg', quantity: 100, costPerItem: 5.00 },
        ]
    },
    {
        id: 'PO-2023-002', supplierId: 2, date: '2023-10-28', status: 'Pending', totalCost: 2500,
        items: [
            { productId: 9, productName: 'Tadalafil 20mg', quantity: 1000, costPerItem: 0.80 },
            { productId: 10, productName: 'Sildenafil 100mg', quantity: 1000, costPerItem: 0.70 },
        ]
    }
];

export const MOCK_SHIPPING_OPTIONS: ShippingOption[] = [
    { id: 1, name: 'Domestic' },
    { id: 2, name: 'Overseas' },
    { id: 3, name: 'India' }
];

export const MOCK_TRUST_BADGES: TrustBadgeItem[] = [
    { id: 1, icon: 'shield', title: '100% Genuine Medicines', color: 'text-green-600' },
    { id: 2, icon: 'deliveryTruck', title: 'Nationwide Delivery', color: 'text-sky-600' },
    { id: 3, icon: 'securePayment', title: 'Secure Payments', color: 'text-indigo-600' },
];

export const MOCK_HOMEPAGE_LAYOUT: HomepageSection[] = [
  { 
    id: 'trust-badges-1', 
    type: 'TRUST_BADGES', 
    title: 'Our Promise', 
    enabled: true,
    trustBadgeItems: MOCK_TRUST_BADGES,
  },
  { 
    id: 'promo-banner-1', 
    type: 'PROMO_BANNER', 
    title: '', 
    enabled: true, 
    promoBannerImage: '/images/stethoscope.png',
    promoBannerTitle: 'Up to 30% Off',
    promoBannerSubtitle: 'On all personal care and wellness products. Limited time offer!',
    promoBannerButtonText: 'Shop Deals',
    promoBannerLink: '/offers',
    promoBannerButtonVariant: 'secondary',
  },
  { 
    id: 'category-grid-1', 
    type: 'CATEGORY_GRID', 
    title: 'Shop by Category', 
    enabled: true,
    categoryDisplayStart: 1,
    categoryDisplayCount: 18,
  },
  { id: 'category-carousel-ed', type: 'CATEGORY_CAROUSEL', title: 'For Erectile Dysfunction', enabled: true, categorySlug: 'erectile-dysfunction', productCount: 8 },
  { id: 'category-carousel-cancer', type: 'CATEGORY_CAROUSEL', title: 'Most Popular In Anti Cancer', enabled: true, categorySlug: 'anti-cancer', productCount: 8 },
  { 
    id: 'promo-banner-2', 
    type: 'PROMO_BANNER', 
    title: '', 
    enabled: true, 
    promoBannerImage: 'https://placehold.co/1200x400/f59e0b/ffffff?text=Vitamins+For+You',
    promoBannerTitle: 'Vitamins & Supplements',
    promoBannerSubtitle: 'Boost your health with our wide range of vitamins. Get 15% off today!',
    promoBannerButtonText: 'Explore Vitamins',
    promoBannerLink: '/category/vitamins-supplements',
    promoBannerButtonVariant: 'accent',
  },
  { id: 'category-carousel-hiv', type: 'CATEGORY_CAROUSEL', title: 'Most Popular In HIV', enabled: true, categorySlug: 'hiv', productCount: 8 },
  { 
    id: 'promo-cards-1', 
    type: 'PROMO_CARDS', 
    title: '', 
    enabled: true,
    promoCards: [
        {
            title: 'Save up to 30%',
            subtitle: 'on all vitamins and supplements this month.',
            link: '/offers',
            buttonText: 'Shop Now',
            bgColor: 'bg-primary-gradient',
            textColor: 'text-white',
            buttonVariant: 'accent',
        },
        {
            title: 'Free Shipping',
            subtitle: 'on all orders over $50. No code needed!',
            link: '/category/all',
            linkText: 'Start Shopping',
            bgColor: 'bg-rose-50',
            textColor: 'text-slate-800',
        },
        {
            title: 'New User Offer',
            subtitle: 'Get 15% off your first order.',
            link: '/register',
            buttonText: 'Sign Up',
            bgColor: 'bg-slate-800',
            textColor: 'text-white',
            buttonVariant: 'primary',
        }
    ]
  },
  { id: 'category-carousel-urinary', type: 'CATEGORY_CAROUSEL', title: 'Popular In Urinary Care', enabled: true, categorySlug: 'urinary', productCount: 8 },
  { id: 'category-carousel-cosmetic', type: 'CATEGORY_CAROUSEL', title: 'Top Cosmetic Products', enabled: true, categorySlug: 'cosmetic', productCount: 8 },
  {
    id: 'promo-grid-1',
    type: 'PROMO_GRID',
    title: 'Health & Wellness Focus',
    enabled: true,
    promoGridItems: [
        {
            title: "Exclusive Men's Health Pack",
            subtitle: 'Save 25% on our curated wellness kit.',
            link: '/category/erectile-dysfunction',
            bgImage: 'https://placehold.co/600x800/2f80ed/ffffff?text=For+Him',
        },
        {
            title: 'Heart Health Essentials',
            subtitle: 'Supplements for your cardiovascular system.',
            link: '/category/cardiology',
            bgImage: 'https://placehold.co/600x400/ef4444/ffffff?text=Heart',
        },
        {
            title: 'Skin Care Specials',
            subtitle: 'Achieve radiant skin with our top picks.',
            link: '/category/skin-care',
            bgImage: 'https://placehold.co/600x400/14b8a6/ffffff?text=Glow',
        },
        {
            title: 'Immunity Boosters',
            subtitle: 'Strengthen your defenses this season.',
            link: '/category/vitamins-supplements',
            bgImage: 'https://placehold.co/600x400/f59e0b/ffffff?text=Immunity',
        },
    ]
  },
  { id: 'featured-products-1', type: 'FEATURED_PRODUCTS', title: 'Featured Products', enabled: true, productCount: 4 },
  { 
    id: 'testimonials-1', 
    type: 'TESTIMONIALS', 
    title: 'What Our Customers Say', 
    enabled: true,
    testimonialItems: [
        { id: 1, name: 'Sarah L.', location: 'New York, USA', avatar: '/images/avatar-1.jpg', text: 'Incredibly fast shipping and authentic products. The Vitamin D3 has been a game-changer for my energy levels. Highly recommend Evergreen Medicine!', rating: 5 },
        { id: 2, name: 'David Chen', location: 'London, UK', avatar: '/images/avatar-2.jpg', text: "Finding a reliable online pharmacy can be tough, but Evergreen is the real deal. Their customer service is top-notch and prices are fair.", rating: 5 },
        { id: 3, name: 'Maria Garcia', location: 'Miami, USA', avatar: '/images/avatar-3.jpg', text: "As a busy mom, the convenience of ordering online is a lifesaver. I trust them for all my family's basic health needs.", rating: 4 },
    ]
  },
  { 
    id: 'brand-carousel-1', 
    type: 'BRAND_CAROUSEL', 
    title: 'Shop By Manufacturer', 
    enabled: true,
    brandIds: [1, 2, 3, 4, 5, 6]
  },
  { 
    id: 'blog-1', 
    type: 'BLOG', 
    title: 'From Our Health Blog', 
    enabled: true,
    postCount: 3
  },
];

export const MOCK_COUPONS: Coupon[] = [
    { id: 1, code: 'SAVE10', type: 'Percentage', value: 10, freeShipping: false, status: 'Active', minPurchase: 50, usageLimit: 1000, usageCount: 250, perUserLimit: 1, startDate: null, endDate: null, appliesTo: 'all', applicableIds: [] },
    { id: 2, code: 'FREESHIP', type: 'Fixed Amount', value: 0, freeShipping: true, status: 'Active', minPurchase: 75, usageLimit: 500, usageCount: 100, perUserLimit: 5, startDate: null, endDate: null, appliesTo: 'all', applicableIds: [] },
    { id: 3, code: 'NEWYEAR24', type: 'Percentage', value: 15, freeShipping: false, status: 'Expired', minPurchase: 100, usageLimit: 200, usageCount: 200, perUserLimit: 1, startDate: '2024-01-01', endDate: '2024-01-31', appliesTo: 'all', applicableIds: [] },
];

export const MOCK_PROMOTIONS: Promotion[] = [
    { id: 1, name: 'Winter Wellness Sale', type: 'Sitewide Discount', status: 'Active', startDate: '2023-11-01', endDate: '2023-11-30' },
    { id: 2, name: 'Vitamins & Supplements 20% Off', type: 'Category Sale', status: 'Scheduled', startDate: '2023-12-01', endDate: '2023-12-15' },
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
    { id: 1, title: 'The Surprising Benefits of Vitamin D', slug: 'benefits-of-vitamin-d', author: 'Dr. Jane Doe', status: 'Published', publishDate: '2023-10-15', images: ['/images/article-1.jpg'], content: '<p>Vitamin D, often called the "sunshine vitamin," is crucial for various bodily functions. While it\'s well-known for its role in bone health by aiding calcium absorption, its benefits extend much further.</p><h2>Immune System Support</h2><p>Recent studies have shown that Vitamin D plays a significant role in modulating the immune system. Adequate levels can help reduce the risk of infections and autoimmune diseases.</p><h2>Mood Regulation</h2><p>There is a strong link between Vitamin D deficiency and mood disorders, including depression. Supplementing with Vitamin D may help improve mood, especially during winter months when sun exposure is limited.</p>' },
    { id: 2, title: 'Navigating Cold & Flu Season: A Guide', slug: 'cold-and-flu-guide', author: 'John Smith, R.Ph.', status: 'Published', publishDate: '2023-10-20', images: ['/images/article-2.jpg'], content: '<h3>Stay Hydrated</h3><p>Drinking plenty of fluids like water, tea, and broth can help loosen congestion and prevent dehydration.</p><h3>Rest is Key</h3><p>Your body needs energy to fight off infection. Make sure to get plenty of sleep to support your immune system.</p>' },
    { id: 3, title: 'First-Aid Kit Essentials for Every Home', slug: 'first-aid-kit-essentials', author: 'Admin', status: 'Draft', publishDate: '2023-11-05', images: ['/images/article-3.jpg'], content: '<p>Being prepared for minor injuries is crucial. Here\'s a checklist for a well-stocked first-aid kit...</p>' },
];

export const MOCK_CMS_PAGES: CmsPage[] = [
    { id: 1, title: 'About Us', slug: '/about', lastUpdated: '2023-10-01' },
    { id: 2, title: 'Privacy Policy', slug: '/privacy-policy', lastUpdated: '2023-09-15' },
    { id: 3, title: 'Terms of Service', slug: '/terms', lastUpdated: '2023-09-15' },
];

export const MOCK_ADMIN_USERS: AdminUser[] = [
    { id: 1, name: 'Admin User', email: 'admin@evergreen.com', role: 'Administrator', status: 'Active' },
    { id: 2, name: 'Editor User', email: 'editor@evergreen.com', role: 'Editor', status: 'Active' },
    { id: 3, name: 'Support User', email: 'support@evergreen.com', role: 'Support', status: 'Inactive' },
];

export const MOCK_EMAIL_TEMPLATES: EmailTemplate[] = [
    { id: 1, name: 'Order Confirmation', subject: 'Your Evergreen Order #{{order_id}} is confirmed!', body: '<h1>Thanks for your order, {{customer_name}}!</h1><p>We\'ve received it and will start processing it soon.</p>', enabled: true },
    { id: 2, name: 'Shipping Confirmation', subject: 'Your Evergreen Order #{{order_id}} has shipped!', body: '<p>Good news! Your order is on its way. Track it here: <a href="{{tracking_link}}">Track Package</a></p>', enabled: true },
    { id: 3, name: 'Order Delivered Follow-up', subject: 'How was your order, {{customer_name}}?', body: '<p>We see your order #{{order_id}} was delivered. We hope you are satisfied with your products! Please feel free to leave a review.</p>', enabled: true },
    { id: 4, name: 'Lead Info Capture', subject: 'Welcome to Evergreen Medicine!', body: '<p>Hi {{customer_name}}, thanks for signing up! Here\'s a 10% coupon for your first order: WELCOME10</p>', enabled: true },
    { id: 5, name: 'Wishlist Item Reminder', subject: 'Still thinking about it?', body: '<p>Hi {{customer_name}}, an item on your wishlist is waiting for you! Don\'t miss out.</p>', enabled: false },
];

export const MOCK_AUTOMATION_RULES: AutomationRule[] = [
    { id: 1, name: 'Post-shipment Follow-up', trigger: 'Order Shipped', delayDays: 7, templateId: 2, enabled: true },
    { id: 2, name: 'Order Placed Thank You', trigger: 'Order Placed', delayDays: 0, templateId: 1, enabled: true },
    { id: 3, name: 'Delivery Feedback Request', trigger: 'Order Delivered', delayDays: 3, templateId: 3, enabled: true },
    { id: 4, name: 'Wishlist Item on Sale', trigger: 'Wishlist Reminder', delayDays: 1, templateId: 5, enabled: false },
];