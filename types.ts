import { ReactNode } from "react";

// export type Country = 'US' | 'UK' | 'Global';
export type Currency = 'USD' | 'GBP';

export interface QuantityPriceOption {
  id: number;
  quantity: number;
  label: string; // e.g., "60 Pills"
  price: number;
  mrp: number;
  stock: number;
}


// types/index.ts
export interface Country {
  id?: number;
  name: string;
  code: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  isActive?: boolean;
  isGlobal?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactRequest {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface ContactRequestFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactRequestStats {
  byStatus: Array<{
    status: string;
    _count: { id: number };
  }>;
  total: number;
  pending: number;
  todayRequests: number;
}

// types.ts
export interface IntegrationSettings {
  id: number;
  
  // SMTP Settings
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpFromEmail?: string;
  smtpFromName?: string;
  smtpEncryption?: string;
  
  // Admin Emails
  adminEmails?: string[]; // Array of email addresses for company notifications
  
  // SMS Settings
  smsProvider?: string;
  smsAccountSid?: string;
  smsAuthToken?: string;
  smsFromNumber?: string;
  
  // Payment Settings
  paymentProvider?: string;
  paymentPublicKey?: string;
  paymentSecretKey?: string;
  paymentWebhookSecret?: string;
  
  // Social Media
  facebookAppId?: string;
  facebookAppSecret?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  
  // Analytics
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  facebookPixelId?: string;
  
  // reCAPTCHA
  recaptchaSiteKey?: string;
  recaptchaSecretKey?: string;
  
  // Testing flags
  isSmtpTested: boolean;
  isSmsTested: boolean;
  isPaymentTested: boolean;
  lastTestedAt?: string;
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationTestResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface IntegrationUpdateResponse {
  success: boolean;
  message: string;
  data?: IntegrationSettings;
}

export interface ProductVariant {
  country: string; // Changed from Country to string for flexibility
  shipping: string; // e.g., 'Domestic' | 'Overseas'
  currency: Currency;
  options: QuantityPriceOption[];
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  brand: Brand;
  category: Category;
  description: string;
  composition: string;
  strengths: string[];
  forms: string[];
  price: number; // Default price
  mrp: number; // Default mrp
  discount_percent: number;
  prescription_required: boolean;
  stock: number; // Default stock
  images: string[];
  tags: string[];
  symptoms: string[];
  rating: number;
  reviews: number;
  views: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  variants?: ProductVariant[];
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  website?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  isDeleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
  productCount?: number;
}

export interface BrandFormData {
  name: string;
  slug?: string;
  website?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
  logoFile?: File | null;
  removeLogo?: boolean;
}

// In your types/index.ts
export interface Category {
  id: number;
  name: string;
  slug: string;
  catLogo?: string;
  catColor?: string;
  description?: string;
  imageAlt?: string;
  bannerAlt?: string;
  logoAlt?: string;
  isDeleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  displayOrder: number;
  image?: string;
  banner?: string;
  metaTitle?: string;
  metaDescription?: string;
  parentId?: number;
  parent?: Category | null;
  children?: Category[];
  _count?: {
    products: number;
    children: number;
  };
  // Optional flat properties for backward compatibility
  productCount?: number;
  childrenCount?: number;
}

export interface User {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state?: string;
  zipCode?: string;
  profilePicture?: string;
  status: 'active' | 'inactive' | 'pending' | 'disabled';
  roleId: number;
  role?: {
    id: number;
    name: string;
    permissions?: any[];
  };
  credential?: {
    lastLogin?: string;
    email?: string;
  };
  addresses?: {
    streetAddress: string;
    city: string;
    state?: string;
    zipCode?: string;
  };
  isDeleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
   defaultAddress: {
        streetAddress: string;
        city: string;
        state: string;
        zipCode: string;
    } | null;
}

export interface Permission {
  id: number;
  name: string;
  menuName: string;
  description?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
  _count?: {
    users: number;
    permissions: number;
  };
}

export interface RoleFormData {
  name: string;
  description: string;
  permissionIds: number[];
}

export interface UserFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state?: string;
  zipCode?: string;
  status: 'active' | 'inactive' | 'pending' | 'disabled';
  roleId: number;
  password?: string;
  profilePictureFile?: File | null;
  removeProfilePicture?: boolean;
}

export interface AdminAuthUser {
    id: string;
    name: string;
    email: string;
    avatar: string;
}

export interface CustomerAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: CustomerAddress;
    registeredDate: string;
    lastLogin: string;
    totalOrders: number;
    totalSpent: number;
}

export interface CartItem {
  id?: number; // Server-side cart item ID
  product: Product;
  quantity: number;
  variantDetail: {
    id?: number; // The variant option ID
    country: string;
    shipping: string;
    currency: string;
    label: string;
    price: number;
    mrp: number;
  };
}


export interface MedicationRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  medicineName: string;
  message?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface MedicationRequestFormData {
  name: string;
  email: string;
  phone: string;
  medicineName: string;
  message: string;
}

export interface MedicationRequestStats {
  byStatus: Array<{
    status: string;
    _count: { id: number };
  }>;
  total: number;
  pending: number;
}



export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'failed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'cash_on_delivery' | 'bank_transfer';
  currency: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress: {
    name: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
  };
  billingAddress: {
    name: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contactEmail: string;
  contactPhone?: string;
  shippingMethod?: string;
  couponCode?: string;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  trackingNumber?: string;
  deliveredAt?: string;
  // Add missing properties
  prescriptions?: any[]; // Add this for prescription relation
  payment?: any; // Add this for payment relation
  orderHistory?: any[]; // Add this for order history
}

export interface OrderItem {
  id: number;
  productId: number;
  variantOptionId?: number;
  productName: string;
  productSku: string;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  productSnapshot: {
    name: string;
    sku: string;
    images: any[];
    price: number;
    prescription_required?: boolean; // Add this
  };
  product?: {
    id: number;
    name: string;
    sku: string;
    images: any[];
  };
  variantOption?: any;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  recentOrders: Order[];
}

export interface Testimonial {
  id: number;
  name:string;
  location: string;
  avatar: string;
  text: string;
  rating: number;
}

export interface PromoCode {
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  freeShipping?: boolean;
  minAmount?: number;
  orderCount?: number;
  description: string;
}

export interface Supplier {
    id: number;
    name: string;
    contactPerson: string;
    email: string;
}

export interface PurchaseOrderItem {
    productId: number;
    productName: string;
    quantity: number;
    costPerItem: number;
}

export interface PurchaseOrder {
    id: string;
    supplierId: number;
    date: string;
    status: 'Pending' | 'Received' | 'Cancelled';
    totalCost: number;
    items: PurchaseOrderItem[];
}

// types/prescription.ts
export interface Prescription {
  id: number;
  userId: number;
  imageUrl: string;
  fileName: string;
  fileSize: number;
  isValidated: boolean;
  validatedBy?: number;
  validatedAt?: Date | string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  isDeleted?: boolean;
  orderIds?: number[];
  
  // Optional relational fields (for populated data)
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  validatedByUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  orderPrescriptions?: Array<{
    id: number;
    orderId: number;
    prescriptionId: number;
    order?: {
      id: number;
      orderNumber: string;
      orderDate: Date | string;
    };
  }>;
}

export interface PrescriptionStats {
  total: number;
  validated: number;
  pending: number;
  rejected: number;
  recentUploads: number;
}

export interface PrescriptionUploadResponse {
  success: boolean;
  data: {
    prescription: Prescription;
  };
  message?: string;
}

export interface PrescriptionListResponse {
  success: boolean;
  data: {
    prescriptions: Prescription[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface PrescriptionResponse {
  success: boolean;
  data: {
    prescription: Prescription;
  };
}

export interface PrescriptionStatsResponse {
  success: boolean;
  data: {
    stats: PrescriptionStats;
  };
}

// For API request parameters
export interface PrescriptionQueryParams {
  page?: number;
  limit?: number;
  status?: 'all' | 'validated' | 'pending' | 'rejected';
  search?: string;
  userId?: number;
}

// For prescription upload form
export interface PrescriptionUploadForm {
  file: File;
  notes?: string;
}

// For prescription validation (admin)
export interface PrescriptionValidationRequest {
  isValidated: boolean;
  notes?: string;
}

// For prescription update
export interface PrescriptionUpdateRequest {
  notes?: string;
}

export interface ShippingOption {
    id: number;
    name: string; // e.g., 'Domestic', 'Overseas', 'India'
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger';

export interface TrustBadgeItem {
    id: number;
    icon: string; // name of icon from constants
    title: string;
    color: string; // tailwind color class
}

export type HomepageSectionType = 
  | 'PROMO_GRID'
  | 'CATEGORY_CAROUSEL' 
  | 'CATEGORY_GRID'
  | 'FEATURED_PRODUCTS' 
  | 'BLOG' 
  | 'TESTIMONIALS' 
  | 'TRUST_BADGES' 
  | 'BRAND_CAROUSEL' 
  | 'IMAGE_GALLERY'
  | 'FEATURE_CARDS'
  | 'PROMO_BANNER'
  | 'PROMO_CARDS'
  | 'NEWSLETTER_SIGNUP'
  | 'FAQ'
  | 'VIDEO'
  | 'CALL_TO_ACTION'
  | 'GRID'
  | 'KEY_METRICS';

export interface PromoGridItem {
  title: string;
  subtitle: string;
  link: string;
  bgImage: string;
}

export interface FeatureCardItem {
    icon: string; // name of icon from a predefined set
    title: string;
    description: string;
}

export interface FaqItem {
    question: string;
    answer: string;
}

export interface KeyMetricItem {
    value: string;
    label: string;
    icon: string; // Emoji or icon name
}

export interface PromoCardItem {
  title: string;
  subtitle: string;
  link: string;
  buttonText?: string;
  linkText?: string;
  bgColor: string;
  textColor: string;
  buttonVariant?: ButtonVariant;
}

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  title: string;
  enabled: boolean;
  orderIndex: number;
  parentId?: string;
  
  // Section-specific properties (will be stored in config in DB)
  categorySlug?: string;
  productCount?: number;
  categoryDisplayStart?: number;
  categoryDisplayCount?: number;
  promoGridItems?: PromoGridItem[];
  faqItems?: FaqItem[];
  promoCards?: PromoCardItem[];
  featureCards?: FeatureCardItem[];
  keyMetrics?: KeyMetricItem[];
  galleryImages?: string[];
  galleryLayout?: 'grid' | 'masonry';
  promoBannerTitle?: string;
  promoBannerSubtitle?: string;
  promoBannerButtonText?: string;
  promoBannerLink?: string;
  promoBannerImage?: string;
  promoBannerButtonVariant?: ButtonVariant;
  videoUrl?: string;
  ctaSubtitle?: string;
  ctaButtonText?: string;
  ctaLink?: string;
  ctaButtonVariant?: ButtonVariant;
  postCount?: number;
  testimonialItems?: Testimonial[];
  brandIds?: number[];
  trustBadgeItems?: TrustBadgeItem[];
  columnTemplate?: number[];
  
  // Nested sections for GRID type
  items?: HomepageSection[];
}

// Admin Panel Specific Types
// Add to your existing types
export interface Coupon {
  id: number;
  code: string;
  type: 'Percentage' | 'Fixed Amount';
  value: number;
  freeShipping: boolean;
  status: 'Active' | 'Scheduled' | 'Expired' | 'Inactive';
  minPurchase: number;
  usageLimit: number;
  perUserLimit: number;
  usageCount: number;
  startDate: string | null;
  endDate: string | null;
  appliesTo: 'all' | 'categories' | 'products';
  applicableIds: number[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  isPublic: boolean;  // NEW
  orders?: any[];
  _count?: {
    orders: number;
    couponUsage: number;
  };
}

export interface CouponStats {
  totalCoupons: number;
  totalUsage: number;
  activeCoupons: number;
}

export interface CouponFormData {
  code: string;
  type: 'Percentage' | 'Fixed Amount';
  value: number;
  freeShipping: boolean;
  status: 'Active' | 'Scheduled' | 'Expired' | 'Inactive';
  minPurchase: number;
  usageLimit: number;
  perUserLimit: number;
  startDate: string | null;
  endDate: string | null;
  appliesTo: 'all' | 'categories' | 'products';
  applicableIds: number[];
  isPublic: boolean;  // NEW

}

export type ApiResponse = any;

export interface Promotion {
    id: number;
    name: string;
    type: 'Sitewide Discount' | 'Category Sale';
    status: 'Active' | 'Scheduled' | 'Ended';
    startDate: string;
    endDate: string;
}

export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    author: string;
    status: 'Published' | 'Draft';
    publishDate: string;
    images: string[];
    content: string; 
}

export interface CmsPage {
    id: number;
    title: string;
    slug: string;
    lastUpdated: string;
    content?: string; // Add content for editing
}

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: 'Administrator' | 'Editor' | 'Support';
    status: 'Active' | 'Inactive';
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  type: 'TRANSACTIONAL' | 'MARKETING' | 'SYSTEM' | 'NOTIFICATION';
  variables: string[];
  status: 'active' | 'inactive';
  isSystem: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRule {
  id: number;
  name: string;
  description?: string;
  trigger: 'ORDER_PLACED' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'ORDER_CANCELLED' | 'PAYMENT_FAILED' | 'USER_REGISTERED' | 'LOW_STOCK';
  conditions: any[];
  delayHours: number;
  templateId: number;
  template?: EmailTemplate;
  status: 'active' | 'inactive' | 'processing' | 'paused';
  priority: number;
  maxAttempts: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// AI Symptom Checker Chat Types
export interface ChatMessageText {
  type: 'text';
  sender: 'user' | 'ai';
  text: string;
}

export interface ChatMessageSuggestion {
  type: 'suggestion';
  products: Product[];
}

export type ChatMessage = ChatMessageText | ChatMessageSuggestion;

// AI Chatbot Types
export type ChatbotMessageRole = 'user' | 'model' | 'function';

export interface ChatbotMessage {
  role: ChatbotMessageRole;
  parts: {
    text?: string;
    functionCall?: { name: string; args: any };
    functionResponse?: { name: string; response: any };
  }[];
}


export interface CartItem {
  id?: number;
  product: Product;
  quantity: number;
  variantDetail: {
    id?: number;
    country: string;
    shipping: string;
    currency: string;
    label: string;
    price: number;
    mrp: number;
  };
}

export interface CartResponse {
  id: number;
  userId: number;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItemRequest {
  productId: number;
  variantOptionId?: number;
  quantity: number;
}

export interface OrderItemRequest {
  productId: number;
  variantOptionId?: number;
  quantity: number;
}

export interface CreateOrderRequest {
  userId: number;
  paymentMethod: string;
  currency: string;
  
  shippingAddress: {
    name: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  billingAddress: {
    name: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  contactEmail: string;
  contactPhone: string;
  
  shippingMethod: string;
  
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  
  items: OrderItemRequest[];
  
  couponCode?: string;
  
  // New prescription field
  prescriptionIds?: number[];
}


// Add these to your existing types

export interface WebsiteSettings {
  id: number;
  
  // Header Configuration
  headerLogo?: string;
  headerLogoAlt?: string;
  headerCtaText?: string;
  headerCtaLink?: string;
  headerNavigation?: NavigationItem[];
  
  // Footer Configuration
  footerLogo?: string;
  footerLogoAlt?: string;
  footerDescription?: string;
  footerContactInfo?: ContactInfo;
  footerSocialLinks?: SocialLink[];
  footerQuickLinks?: NavigationItem[];
  footerCategories?: NavigationItem[];
  footerPaymentMethods?: PaymentMethod[];
  footerCopyrightText?: string;
  
  // SEO Global Settings
  siteTitle?: string;
  siteDescription?: string;
  siteKeywords?: string;
  siteUrl?: string;
  siteLogo?: string;
  favicon?: string;
  
  // Social Media
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  appearanceSettings?: AppearanceSettings;

  // Analytics
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  facebookPixelId?: string;
  
  // Additional SEO
  structuredData?: any;
  robotsTxt?: string;
  sitemapUrl?: string;
  
  // Meta
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: string;
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


// Update your types file
// In your types file
export interface AppearanceSettings {
  // Global settings
  colors: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    mutedTextColor: string;
    borderColor: string;
  };
  
  // Section-specific settings
  sections: {
    header: {
      topBar: SectionAppearance;
      searchBar: SectionAppearance;
      navigation: SectionAppearance;
    };
    footer: {
      main: SectionAppearance;
      bottomBar: SectionAppearance;
    };
    buttons: {
      primary: SectionAppearance;
      secondary: SectionAppearance;
    };
  };
  
  // Global typography
  fonts: {
    primaryFont: string;
    secondaryFont: string;
    fontSize: {
      base: string;
      sm: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  
  // Global styling
  borderRadius: string;
  boxShadow: string;
}

export interface SectionAppearance {
  background: {
    type: 'solid' | 'gradient';
    color: string;
    gradient?: {
      direction: string;
      colors: string[];
      customGradient?: string;
    };
  };
  textColor: string;
  borderColor?: string;
  borderRadius?: string;
  boxShadow?: string;
}

export interface SectionAppearance {
  background: {
    type: 'solid' | 'gradient';
    color: string;
    gradient?: {
      direction: string;
      colors: string[];
      customGradient?: string;
    };
  };
  textColor: string;
  borderColor?: string;
  borderRadius?: string;
  boxShadow?: string;
}

export interface SeoPage {
  id: number;
  pageType: string;
  pageSlug?: string;
  pageId?: number;
  title: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: any;
  schemaType?: string;
  metaRobots?: string;
  metaViewport?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NavigationMenu {
  id: number;
  name: string;
  slug: string;
  location: string;
  items: NavigationItem[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NavigationItem {
  name: string;
  path: string;
  children?: NavigationItem[];
  icon?: string;
  external?: boolean;
}

export interface ContactInfo {
  address: string;
  email: string;
  phone: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface PaymentMethod {
  name: string;
  image: string;
  alt: string;
}

// Form Data Types
export interface WebsiteSettingsFormData {
  // Header
  headerLogo?: string;
  headerLogoAlt?: string;
  headerCtaText?: string;
  headerCtaLink?: string;
  headerNavigation?: NavigationItem[];
  appearanceSettings?: AppearanceSettings;

  
  // Footer
  footerLogo?: string;
  footerLogoAlt?: string;
  footerDescription?: string;
  footerContactInfo?: ContactInfo;
  footerSocialLinks?: SocialLink[];
  footerQuickLinks?: NavigationItem[];
  footerCategories?: NavigationItem[];
  footerPaymentMethods?: PaymentMethod[];
  footerCopyrightText?: string;
  
  // SEO Global
  siteTitle?: string;
  siteDescription?: string;
  siteKeywords?: string;
  siteUrl?: string;
  siteLogo?: string;
  favicon?: string;
  
  // Social Media
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  
  // Analytics
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  facebookPixelId?: string;
  
  // Additional SEO
  structuredData?: any;
  robotsTxt?: string;
  sitemapUrl?: string;
  
  // Meta
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: string;
}

export interface SeoPageFormData {
  pageType: string;
  pageSlug?: string;
  pageId?: number;
  title: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: any;
  schemaType?: string;
  metaRobots?: string;
  metaViewport?: string;
}

export interface NavigationMenuFormData {
  name: string;
  slug: string;
  location: string;
  items: NavigationItem[];
}
