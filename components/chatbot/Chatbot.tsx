import React, { useState, useContext, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse, FunctionDeclaration, Type, Part } from '@google/genai';
import { useApp } from '../../hooks/useApp';
import ChatWindow from './ChatWindow';
import { ICONS } from '../../constants';
import { ChatbotMessage } from '../../types';
import { orderService } from '../../lib/orderService';
import { userService } from '../../lib/userService';
import { publicProductService } from '../../lib/productService';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatbotMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userDetails, setUserDetails] = useState<any>(null);
    const { country } = useApp();
    const { user: authUser, isAuthenticated } = useContext(AuthContext);
    const hasGreeted = useRef(false);

    // Fetch user details when authenticated
    useEffect(() => {
        const fetchUserDetails = async () => {
            if (isAuthenticated && authUser?.id) {
                try {
                    const userData = await userService.getUserById(authUser.id);
                    if (userData) {
                        setUserDetails(userData);
                    }
                } catch (error) {
                    console.error('Error fetching user details:', error);
                }
            }
        };

        if (isOpen && isAuthenticated) {
            fetchUserDetails();
        }
    }, [isOpen, isAuthenticated, authUser?.id]);

    // Add greeting when chat opens for the first time
    useEffect(() => {
        if (isOpen && messages.length === 0 && !hasGreeted.current) {
            const greeting = userDetails?.firstName 
                ? `Hello ${userDetails.firstName}! 👋 Welcome to Evergreen Medicine. How can I assist you today?`
                : `Hello! 👋 Welcome to Evergreen Medicine. How can I assist you today?`;
            
            const greetingMessage: ChatbotMessage = {
                role: 'model',
                parts: [{ text: greeting }]
            };
            
            setMessages([greetingMessage]);
            hasGreeted.current = true;
        }
    }, [isOpen, messages.length, userDetails]);

    // Reset greeting when chat closes
    useEffect(() => {
        if (!isOpen) {
            hasGreeted.current = false;
        }
    }, [isOpen]);

    // --- Security Validator ---
    const validateUserAccess = (): { authorized: boolean; error?: string } => {
        if (!isAuthenticated || !authUser) {
            return { 
                authorized: false, 
                error: 'Please log in to access your personal information and orders.' 
            };
        }
        return { authorized: true };
    };

    // --- Real Service Functions ---
    const getOrderDetails = async (orderId: string): Promise<{ 
        orderNumber: string;
        status: string;
        orderDate: string;
        items: Array<{ name: string; quantity: number; price: string }>;
        totalAmount: string;
        shippingAddress: string;
        trackingNumber?: string;
        estimatedDelivery?: string;
        shippingMethod?: string;
        shippingCarrier?: string;
        trackingLink?: string;
        paymentStatus?: string;
    } | { error: string }> => {
        const access = validateUserAccess();
        if (!access.authorized) {
            return { error: access.error! };
        }

        try {
            let order = await orderService.getOrderByNumber(orderId);
            
            if (!order) {
                const orderIdNum = parseInt(orderId);
                if (!isNaN(orderIdNum)) {
                    order = await orderService.getOrderById(orderIdNum);
                }
            }

            if (order) {
                const userOrders = await orderService.getUserOrders(authUser!.id);
                const userOrderIds = userOrders.orders.map(o => o.id);
                
                if (!userOrderIds.includes(order.id)) {
                    return { error: 'Order not found in your account. Please check the order number.' };
                }

                const formattedItems = order.orderItems?.map(item => ({
                    name: item.product?.name || item.productName || item.productSnapshot?.name || 'Unknown Product',
                    quantity: item.quantity || 1,
                    price: `$${(item.unitPrice || 0).toFixed(2)}`
                })) || [];

                let shippingAddress = 'Not specified';
                if (typeof order.shippingAddress === 'object') {
                    const addr = order.shippingAddress;
                    shippingAddress = `${addr.streetAddress}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
                } else if (order.shippingAddress) {
                    shippingAddress = order.shippingAddress;
                }

                let shippingCarrier = 'Standard Shipping';
                let trackingLink = '';
                
                if (order.shippingMethod) {
                    const method = order.shippingMethod.toLowerCase();
                    if (method.includes('fedex')) {
                        shippingCarrier = 'FedEx';
                        trackingLink = `https://www.fedex.com/fedextrack/?trknbr=${order.trackingNumber}`;
                    } else if (method.includes('ups')) {
                        shippingCarrier = 'UPS';
                        trackingLink = `https://www.ups.com/track?tracknum=${order.trackingNumber}`;
                    } else if (method.includes('dhl')) {
                        shippingCarrier = 'DHL';
                        trackingLink = `https://www.dhl.com/en/express/tracking.html?AWB=${order.trackingNumber}`;
                    } else if (method.includes('usps')) {
                        shippingCarrier = 'USPS';
                        trackingLink = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.trackingNumber}`;
                    } else {
                        shippingCarrier = order.shippingMethod;
                    }
                }

                return {
                    orderNumber: order.orderNumber,
                    status: order.status,
                    orderDate: order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) : 'Unknown date',
                    items: formattedItems,
                    totalAmount: `$${(order.totalAmount || 0).toFixed(2)}`,
                    shippingAddress,
                    trackingNumber: order.trackingNumber,
                    estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) : undefined,
                    shippingMethod: order.shippingMethod,
                    shippingCarrier,
                    trackingLink,
                    paymentStatus: order.paymentStatus
                };
            }
            return { error: `Order with ID/number '${orderId}' not found in your account.` };
        } catch (error) {
            console.error('Error fetching order:', error);
            return { error: 'Service temporarily unavailable. Please try again later.' };
        }
    };

    const checkInventory = async (productName: string): Promise<{ 
    name: string;
    price: string;
    stock: number;
    inStock: boolean;
    sku?: string;
    category?: string;
    availability: string;
    variantGroups?: Array<{
        country: string;
        shipping: string;
        currency: string;
        options: Array<{
            label: string;
            price: string;
            stock: number;
            inStock: boolean;
            availability: string;
        }>;
    }>;
} | { error: string }> => {
    try {
        const products = await publicProductService.searchProducts(productName, { country });
        
        if (products.length === 0) {
            return { error: `Product '${productName}' is not available in our inventory.` };
        }

        const product = products[0];
        const stock = product.stockQuantity || 0;
        
        // Group variants by country and shipping
        const variantGroups = product.variants?.map(variant => ({
            country: variant.country || 'Global',
            shipping: variant.shipping || 'Standard',
            currency: variant.currency || 'USD',
            options: variant.options?.map(option => {
                const variantStock = option.stock || 0;
                return {
                    label: option.label?.trim(),
                    price: `$${(option.price || 0).toFixed(2)}`,
                    stock: variantStock,
                    inStock: variantStock > 0,
                    availability: variantStock > 0 ? 
                        (variantStock > 10 ? 'In Stock' : `Only ${variantStock} left`) : 
                        'Out of Stock'
                };
            }) || []
        })) || [];

        return {
            name: product.name,
            price: `$${(product.price || 0).toFixed(2)}`,
            stock: stock,
            inStock: stock > 0,
            sku: product.sku,
            category: product.category?.name,
            availability: stock > 0 ? 
                (stock > 10 ? 'In Stock' : `Only ${stock} left`) : 
                'Out of Stock',
            variantGroups: variantGroups.length > 0 ? variantGroups : undefined
        };
    } catch (error) {
        console.error('Error checking inventory:', error);
        return { error: 'Inventory service temporarily unavailable. Please try again later.' };
    }
};

    const getMyOrders = async (): Promise<{ 
        orders: Array<{
            orderNumber: string;
            date: string;
            status: string;
            itemCount: number;
            total: string;
            statusEmoji: string;
            paymentStatus?: string;
        }>;
        totalOrders: number;
        summary: {
            pending: number;
            confirmed: number;
            shipped: number;
            delivered: number;
        };
    } | { error: string }> => {
        const access = validateUserAccess();
        if (!access.authorized) {
            return { error: access.error! };
        }

        try {
            const ordersResponse = await orderService.getUserOrders(authUser!.id);
            const orders = ordersResponse.orders || [];

            if (orders.length === 0) {
                return { 
                    orders: [],
                    totalOrders: 0,
                    summary: { pending: 0, confirmed: 0, shipped: 0, delivered: 0 }
                };
            }

            const formattedOrders = orders.slice(0, 10).map(order => {
                let statusEmoji = '⏳';
                switch (order.status) {
                    case 'delivered': statusEmoji = '✅'; break;
                    case 'shipped': statusEmoji = '🚚'; break;
                    case 'confirmed': statusEmoji = '✅'; break;
                    case 'processing': statusEmoji = '⚡'; break;
                    case 'pending': statusEmoji = '⏳'; break;
                    default: statusEmoji = '📦';
                }

                return {
                    orderNumber: order.orderNumber,
                    date: order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }) : 'Unknown date',
                    status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
                    itemCount: order.orderItems?.length || 0,
                    total: `$${(order.totalAmount || 0).toFixed(2)}`,
                    statusEmoji,
                    paymentStatus: order.paymentStatus
                };
            });

            const summary = {
                pending: orders.filter(o => o.status === 'pending').length,
                confirmed: orders.filter(o => o.status === 'confirmed').length,
                shipped: orders.filter(o => o.status === 'shipped').length,
                delivered: orders.filter(o => o.status === 'delivered').length
            };

            return {
                orders: formattedOrders,
                totalOrders: orders.length,
                summary
            };
        } catch (error) {
            console.error('Error fetching user orders:', error);
            return { error: 'Unable to fetch your orders. Please try again later.' };
        }
    };

    const getOrderStatus = async (orderIdentifier: string): Promise<{ 
        orderNumber: string;
        status: string;
        statusDescription: string;
        statusEmoji: string;
        estimatedDelivery?: string;
        trackingNumber?: string;
        shippingCarrier?: string;
        trackingLink?: string;
        lastUpdated: string;
        paymentStatus?: string;
    } | { error: string }> => {
        const access = validateUserAccess();
        if (!access.authorized) {
            return { error: access.error! };
        }

        try {
            let order = await orderService.getOrderByNumber(orderIdentifier);
            
            if (!order) {
                const orderIdNum = parseInt(orderIdentifier);
                if (!isNaN(orderIdNum)) {
                    order = await orderService.getOrderById(orderIdNum);
                }
            }

            if (order) {
                const userOrders = await orderService.getUserOrders(authUser!.id);
                const userOrderIds = userOrders.orders.map(o => o.id);
                
                if (!userOrderIds.includes(order.id)) {
                    return { error: 'Order not found in your account.' };
                }

                let statusEmoji = '📦';
                let statusDescription = 'Your order is being processed';
                
                switch (order.status) {
                    case 'pending':
                        statusEmoji = '⏳';
                        statusDescription = 'Your order is being processed';
                        break;
                    case 'confirmed':
                        statusEmoji = '✅';
                        statusDescription = 'Your order has been confirmed';
                        break;
                    case 'processing':
                        statusEmoji = '⚡';
                        statusDescription = 'We are preparing your order';
                        break;
                    case 'shipped':
                        statusEmoji = '🚚';
                        statusDescription = 'Your order has been shipped';
                        break;
                    case 'delivered':
                        statusEmoji = '📬';
                        statusDescription = 'Your order has been delivered';
                        break;
                    case 'cancelled':
                        statusEmoji = '❌';
                        statusDescription = 'Your order has been cancelled';
                        break;
                }

                let shippingCarrier = 'Standard Shipping';
                let trackingLink = '';
                
                if (order.shippingMethod) {
                    const method = order.shippingMethod.toLowerCase();
                    if (method.includes('fedex')) {
                        shippingCarrier = 'FedEx';
                        trackingLink = `https://www.fedex.com/fedextrack/?trknbr=${order.trackingNumber}`;
                    } else if (method.includes('ups')) {
                        shippingCarrier = 'UPS';
                        trackingLink = `https://www.ups.com/track?tracknum=${order.trackingNumber}`;
                    } else if (method.includes('dhl')) {
                        shippingCarrier = 'DHL';
                        trackingLink = `https://www.dhl.com/en/express/tracking.html?AWB=${order.trackingNumber}`;
                    } else if (method.includes('usps')) {
                        shippingCarrier = 'USPS';
                        trackingLink = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.trackingNumber}`;
                    } else {
                        shippingCarrier = order.shippingMethod;
                    }
                }

                return {
                    orderNumber: order.orderNumber,
                    status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
                    statusDescription,
                    statusEmoji,
                    estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                    }) : undefined,
                    trackingNumber: order.trackingNumber,
                    shippingCarrier,
                    trackingLink,
                    lastUpdated: order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'Recently',
                    paymentStatus: order.paymentStatus
                };
            }
            return { error: `Order '${orderIdentifier}' not found in your account.` };
        } catch (error) {
            console.error('Error fetching order status:', error);
            return { error: 'Unable to fetch order status. Please try again later.' };
        }
    };


    const searchProducts = async (query: string): Promise<{ 
    products: Array<{
        name: string;
        price: string;
        inStock: boolean;
        stock: number;
        category: string;
        sku?: string;
        availability: string;
        variantGroups?: Array<{
            country: string;
            shipping: string;
            currency: string;
            options: Array<{
                label: string;
                price: string;
                mrp: string;
                stock: number;
                inStock: boolean;
                availability: string;
            }>;
        }>;
    }>;
    total: number;
    query: string;
} | { error: string }> => {
    try {
        // First try the exact search
        let products = await publicProductService.searchProducts(query, {});
        
        // If no results, try a broader search with common medical terms
        if (products.length === 0) {
            const searchTerms = getSearchTerms(query);
            for (const term of searchTerms) {
                products = await publicProductService.searchProducts(term, { country });
                if (products.length > 0) break;
            }
        }

        // If still no results, try searching by category or symptoms
        if (products.length === 0) {
            products = await publicProductService.searchProducts('', { limit: 50, country }); // Get all products
            products = products.filter(product => 
                matchesMedicalCondition(product, query) ||
                matchesCategory(product, query) ||
                matchesSymptoms(product, query)
            );
        }
        
        const formattedProducts = products.slice(0, 8).map(product => {
            const stock = product.stockQuantity || 0;
            
            // Group variants by country and shipping
            const variantGroups = product.variants?.map(variant => ({
                country: variant.country || 'Global',
                shipping: variant.shipping || 'Standard',
                currency: variant.currency || 'USD',
                options: variant.options?.map(option => {
                    const variantStock = option.stock || 0;
                    return {
                        label: option.label?.trim(),
                        price: `$${(option.price || 0).toFixed(2)}`,
                        mrp: `$${(option.mrp || 0).toFixed(2)}`,
                        stock: variantStock,
                        inStock: variantStock > 0,
                        availability: variantStock > 0 ? 
                            (variantStock > 10 ? 'In Stock' : `Only ${variantStock} left`) : 
                            'Out of Stock'
                    };
                }) || []
            })) || [];

            return {
                name: product.name,
                price: `$${(product.price || 0).toFixed(2)}`,
                inStock: stock > 0,
                stock: stock,
                category: product.category?.name || 'Uncategorized',
                sku: product.sku,
                availability: stock > 0 ? 
                    (stock > 10 ? 'In Stock' : `Only ${stock} left`) : 
                    'Out of Stock',
                variantGroups: variantGroups.length > 0 ? variantGroups : undefined
            };
        });

        return {
            products: formattedProducts,
            total: products.length,
            query
        };
    } catch (error) {
        console.error('Error searching products:', error);
        return { error: 'Search service temporarily unavailable. Please try again later.' };
    }
};

// Helper function to expand search terms
const getSearchTerms = (query: string): string[] => {
    const lowerQuery = query.toLowerCase();
    const terms = [query]; // Always include original query
    
    // Medical condition mappings
    const conditionMap: { [key: string]: string[] } = {
        'fever': ['paracetamol', 'acetaminophen', 'ibuprofen', 'aspirin', 'antipyretic'],
        'cold': ['decongestant', 'antihistamine', 'cough', 'nasal spray'],
        'headache': ['paracetamol', 'ibuprofen', 'aspirin', 'migraine'],
        'vitamin': ['vitamin c', 'vitamin d', 'multivitamin', 'supplement'],
        'pain': ['analgesic', 'pain relief', 'ibuprofen', 'naproxen'],
        'allergy': ['antihistamine', 'loratadine', 'cetirizine'],
        'infection': ['antibiotic', 'antiviral', 'antifungal'],
        'blood pressure': ['hypertension', 'bp', 'cardiovascular']
    };

    // Add related terms
    for (const [key, values] of Object.entries(conditionMap)) {
        if (lowerQuery.includes(key)) {
            terms.push(...values);
        }
    }

    // Add common pharmaceutical suffixes
    if (lowerQuery.includes('vitamin')) {
        terms.push('vitamin-c', 'vitamin-c-', 'vit c', 'ascorbic acid');
    }

    return [...new Set(terms)]; // Remove duplicates
};

// Helper function to match medical conditions
const matchesMedicalCondition = (product: any, query: string): boolean => {
    const lowerQuery = query.toLowerCase();
    const productText = [
        product.name,
        product.description,
        product.composition,
        product.tags?.join(' '),
        product.symptoms?.join(' '),
        product.searchableText
    ].join(' ').toLowerCase();

    const conditionKeywords: { [key: string]: string[] } = {
        'fever': ['fever', 'temperature', 'pyrexia', 'antipyretic'],
        'cold': ['cold', 'flu', 'influenza', 'respiratory', 'congestion'],
        'headache': ['headache', 'migraine', 'pain relief', 'analgesic'],
        'vitamin': ['vitamin', 'supplement', 'nutritional', 'ascorbic'],
        'infection': ['infection', 'antibiotic', 'antiviral', 'bacterial', 'viral']
    };

    for (const [condition, keywords] of Object.entries(conditionKeywords)) {
        if (lowerQuery.includes(condition)) {
            return keywords.some(keyword => productText.includes(keyword));
        }
    }

    return false;
};

// Helper function to match category
const matchesCategory = (product: any, query: string): boolean => {
    const lowerQuery = query.toLowerCase();
    const categoryName = product.category?.name?.toLowerCase() || '';
    
    const categoryMap: { [key: string]: string[] } = {
        'fever': ['fever', 'antipyretic', 'pain relief'],
        'vitamin': ['vitamin', 'supplement', 'nutrition'],
        'cold': ['cold', 'flu', 'respiratory'],
        'pain': ['pain', 'analgesic', 'anti-inflammatory']
    };

    for (const [queryTerm, categories] of Object.entries(categoryMap)) {
        if (lowerQuery.includes(queryTerm)) {
            return categories.some(cat => categoryName.includes(cat));
        }
    }

    return false;
};

// Helper function to match symptoms
const matchesSymptoms = (product: any, query: string): boolean => {
    const lowerQuery = query.toLowerCase();
    const symptoms = product.symptoms || [];
    
    const symptomMap: { [key: string]: string[] } = {
        'fever': ['fever', 'headache', 'body ache'],
        'cold': ['cough', 'sneezing', 'runny nose', 'congestion'],
        'vitamin': ['deficiency', 'weakness', 'fatigue']
    };

    for (const [queryTerm, relatedSymptoms] of Object.entries(symptomMap)) {
        if (lowerQuery.includes(queryTerm)) {
            return symptoms.some((symptom: string) => 
                relatedSymptoms.some(related => 
                    symptom.toLowerCase().includes(related)
                )
            );
        }
    }

    return false;
};

const getProductDetails = async (productName: string): Promise<{ 
    name: string;
    price: string;
    stock: number;
    inStock: boolean;
    description?: string;
    sku?: string;
    category?: string;
    brand?: string;
    availability: string;
    variantGroups?: Array<{
        country: string;
        shipping: string;
        currency: string;
        options: Array<{
            label: string;
            price: string;
            mrp: string;
            stock: number;
            inStock: boolean;
            availability: string;
        }>;
    }>;
} | { error: string }> => {
    try {
        const products = await publicProductService.searchProducts(productName, { country });
        
        if (products.length === 0) {
            return { error: `Product '${productName}' is not available in our store.` };
        }

        const product = products[0];
        const stock = product.stockQuantity || 0;
        
        // Group variants by country and shipping
        const variantGroups = product.variants?.map(variant => ({
            country: variant.country || 'Global',
            shipping: variant.shipping || 'Standard',
            currency: variant.currency || 'USD',
            options: variant.options?.map(option => {
                const variantStock = option.stock || 0;
                return {
                    label: option.label?.trim(),
                    price: `$${(option.price || 0).toFixed(2)}`,
                    mrp: `$${(option.mrp || 0).toFixed(2)}`,
                    stock: variantStock,
                    inStock: variantStock > 0,
                    availability: variantStock > 0 ? 
                        (variantStock > 10 ? 'In Stock' : `Only ${variantStock} left`) : 
                        'Out of Stock'
                };
            }) || []
        })) || [];

        return {
            name: product.name,
            price: `$${(product.price || 0).toFixed(2)}`,
            stock: stock,
            inStock: stock > 0,
            description: product.description,
            sku: product.sku,
            category: product.category?.name,
            brand: product.brand?.name,
            availability: stock > 0 ? 
                (stock > 10 ? 'In Stock' : `Only ${stock} left`) : 
                'Out of Stock',
            variantGroups: variantGroups.length > 0 ? variantGroups : undefined
        };
    } catch (error) {
        console.error('Error fetching product details:', error);
        return { error: 'Unable to fetch product details. Please try again later.' };
    }
};


    const getUserProfile = async (): Promise<{ 
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber?: string;
        status: string;
        lastLogin?: string;
        addresses: Array<{
            name: string;
            address: string;
            isDefault: boolean;
        }>;
    } | { error: string }> => {
        const access = validateUserAccess();
        if (!access.authorized) {
            return { error: access.error! };
        }

        try {
            if (!userDetails) {
                const userData = await userService.getUserById(authUser!.id);
                if (userData) {
                    setUserDetails(userData);
                } else {
                    return { error: 'Unable to fetch your profile. Please try again later.' };
                }
            }

            const addresses = userDetails.addresses?.map((addr: any) => ({
                name: addr.name,
                address: `${addr.streetAddress}, ${addr.city}, ${addr.state} ${addr.zipCode}`,
                isDefault: addr.isDefault
            })) || [];

            return {
                firstName: userDetails.firstName || 'Not provided',
                lastName: userDetails.lastName || 'Not provided',
                email: userDetails.email,
                phoneNumber: userDetails.phoneNumber,
                status: userDetails.status || 'active',
                lastLogin: userDetails.credential?.lastLogin ? 
                    new Date(userDetails.credential.lastLogin).toLocaleString() : 'Never',
                addresses
            };
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return { error: 'Unable to fetch your profile. Please try again later.' };
        }
    };

    // --- Gemini Function Declarations ---
    const functionDeclarations: FunctionDeclaration[] = [
        {
            name: 'getOrderDetails',
            description: 'Get detailed information about a specific order using order ID or order number.',
            parameters: {
                type: Type.OBJECT,
                properties: {
                    orderId: {
                        type: Type.STRING,
                        description: 'The order ID number or order number, e.g., "12345" or "ORD-2023-001".',
                    },
                },
                required: ['orderId'],
            },
        },
        {
            name: 'checkInventory',
            description: 'Check the current stock level and availability for a specific product.',
            parameters: {
                type: Type.OBJECT,
                properties: {
                    productName: {
                        type: Type.STRING,
                        description: 'The name or description of the product to check inventory for.',
                    },
                },
                required: ['productName'],
            },
        },
        {
            name: 'getMyOrders',
            description: 'Get the current user\'s order history and recent orders.',
            parameters: {
                type: Type.OBJECT,
                properties: {},
            },
        },
        {
            name: 'getOrderStatus',
            description: 'Get the current status and tracking information for a specific order.',
            parameters: {
                type: Type.OBJECT,
                properties: {
                    orderIdentifier: {
                        type: Type.STRING,
                        description: 'Order ID, order number, or tracking number to check status.',
                    },
                },
                required: ['orderIdentifier'],
            },
        },
        {
            name: 'searchProducts',
            description: 'Search for products by name, description, or category.',
            parameters: {
                type: Type.OBJECT,
                properties: {
                    query: {
                        type: Type.STRING,
                        description: 'Search query for products - can be product name, category, or description.',
                    },
                },
                required: ['query'],
            },
        },
        {
            name: 'getProductDetails',
            description: 'Get detailed information about a specific product including price, stock, and description.',
            parameters: {
                type: Type.OBJECT,
                properties: {
                    productName: {
                        type: Type.STRING,
                        description: 'The name of the product to get details for.',
                    },
                },
                required: ['productName'],
            },
        },
        {
            name: 'getUserProfile',
            description: 'Get the current user\'s profile information including name, contact details, and addresses.',
            parameters: {
                type: Type.OBJECT,
                properties: {},
            },
        },
    ];

    const handleSendMessage = async (userInput: string) => {
        if (!userInput.trim()) return;

        const userMessage: ChatbotMessage = {
            role: 'user',
            parts: [{ text: userInput }],
        };
        
        const currentMessages = [...messages, userMessage];
        setMessages(currentMessages);
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            
            const userContext = isAuthenticated && authUser 
                ? `Current user: ${userDetails?.firstName || authUser.email} (Authenticated & Verified)`
                : 'Current user: Guest (Limited Access)';

   const systemInstruction = `You are Evergreen AI, a helpful assistant for Evergreen Medicine online pharmacy.

USER STATUS: ${userContext}

RESPONSE GUIDELINES:
- Always use clear, conversational language that's easy to understand
- Present product information in a natural, readable format using bullet points
- Include emojis for better visual organization (💊, 📦, 🚚, 🌍, etc.)
- For authenticated users, address them by first name when available
- Keep responses concise but informative
- Never provide medical advice - direct to healthcare professionals
- Always maintain professional, empathetic tone
- Group product variants by country and shipping method for better clarity

SEARCH BEHAVIOR:
- When users ask for "fever medicine", "cold medicine", or general conditions, search broadly for related products
- If no exact matches found, suggest alternative search terms or browse categories
- Always be helpful and try multiple search strategies

PRODUCT RESPONSE FORMAT:
When showing products with variants, use this organized format:

💊 Found Products for "[query]":

• [Product Name] - $[price] ([Availability])

🌍 [Country] - [Shipping]:
   - [Variant Label]: $[price] (Stock: [availability])
   - [Variant Label]: $[price] (Stock: [availability])

Example:
💊 Found 1 product for "fever":

• Zoviclovir 400 mg Tablet (Acyclovir 400mg) - $200.00 (Out of Stock)

🌍 Global - Domestic Shipping:
   - 100 Tablet/s: $75.00 (Stock: 92 available)
   - 200 Tablet/s: $138.00 (Stock: 97 available) 
   - 300 Tablet/s: $200.00 (Stock: 97 available)

🌍 Global - Overseas Shipping:
   - 100 Tablet/s: $500.00 (Stock: 97 available)
   - 400 Tablet/s: $900.00 (Stock: 93 available)

🇺🇸 US - Overseas Shipping:
   - 100 Tablet/s: $34.00 (Out of Stock)
   - 200 Tablet/s: $66.00 (Out of Stock)
   - 300 Tablet/s: $78.00 (Out of Stock)

NO RESULTS RESPONSE:
If no products are found, respond helpfully:
"I couldn't find exact matches for "[query]", but you might want to try:
• Searching for specific medication names like 'Paracetamol' or 'Ibuprofen'
• Browsing by category like 'Pain Relief' or 'Cold & Flu'
• Checking our vitamin and supplement section

Would you like me to search for something specific?"

Be conversational and helpful while maintaining professionalism.`;

            let response: GenerateContentResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: currentMessages,
                config: {
                    systemInstruction,
                    tools: [{ functionDeclarations }],
                }
            });

            const functionCalls = response.functionCalls;
            let finalResponseText: string;

            if (functionCalls && functionCalls.length > 0) {
                const call = functionCalls[0];
                let functionResult;

                // Execute the appropriate function based on the call
                switch (call.name) {
                    case 'getOrderDetails':
                        functionResult = await getOrderDetails(call.args.orderId);
                        break;
                    case 'checkInventory':
                        functionResult = await checkInventory(call.args.productName);
                        break;
                    case 'getMyOrders':
                        functionResult = await getMyOrders();
                        break;
                    case 'getOrderStatus':
                        functionResult = await getOrderStatus(call.args.orderIdentifier);
                        break;
                    case 'searchProducts':
                        functionResult = await searchProducts(call.args.query);
                        break;
                    case 'getProductDetails':
                        functionResult = await getProductDetails(call.args.productName);
                        break;
                    case 'getUserProfile':
                        functionResult = await getUserProfile();
                        break;
                    default:
                        functionResult = { error: `Function ${call.name} is not available.` };
                }

                const functionResponsePart: Part = {
                    functionResponse: {
                        name: call.name,
                        response: functionResult,
                    },
                };

                const historyWithFunctionCall: ChatbotMessage[] = [
                    ...currentMessages,
                    { role: 'model', parts: [{ functionCall: call }] },
                    { role: 'function', parts: [functionResponsePart] }
                ];
                
                // Send the function response back to the model
                const secondResponse = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: historyWithFunctionCall,
                    config: {
                         systemInstruction,
                         tools: [{ functionDeclarations }],
                    }
                });

                // Safely extract text from response
                finalResponseText = secondResponse.text || "I apologize, but I didn't receive a proper response. Please try again.";
            } else {
                // Safely extract text from response
                finalResponseText = response.text || "I apologize, but I didn't receive a proper response. Please try again.";
            }
            
            const aiResponse: ChatbotMessage = {
                role: 'model',
                parts: [{ text: finalResponseText }]
            };
            setMessages(prev => [...prev, aiResponse]);

       } catch (error) {
    console.error("Chatbot error:", error);
    
    let errorMessage = "I'm experiencing some technical difficulties right now. Please try again in a moment.";
    
    // More specific error handling
    if (error.toString().includes('503') || error.toString().includes('service unavailable')) {
        errorMessage = "Our product catalog is currently being updated. Please check back in a few moments.";
    } else if (error.toString().includes('network') || error.toString().includes('fetch')) {
        errorMessage = "I'm having trouble connecting to our product database. Please check your internet connection and try again.";
    } else if (error.toString().includes('timeout')) {
        errorMessage = "The search is taking longer than expected. Please try a different search term or try again shortly.";
    }
    
    const errorMessageObj: ChatbotMessage = {
        role: 'model',
        parts: [{ text: errorMessage }],
    };
    setMessages(prev => [...prev, errorMessageObj]);
} finally {
    setIsLoading(false);
}
    };

    // Clear conversation history
    const clearChat = () => {
        setMessages([]);
        hasGreeted.current = false;
        toast.success('Chat history cleared');
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-primary-gradient text-white rounded-full p-4 shadow-lg hover:scale-110 transform transition-transform z-50"
                aria-label="Open AI Chat"
            >
                {isOpen ? React.cloneElement(ICONS.close, { className: 'w-8 h-8' }) : React.cloneElement(ICONS.chat, { className: 'w-8 h-8' })}
            </button>
            {isOpen && (
                <ChatWindow
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    onClose={() => setIsOpen(false)}
                    onClearChat={clearChat}
                    user={userDetails || authUser}
                    isAuthenticated={isAuthenticated}
                />
            )}
        </>
    );
};

export default Chatbot;