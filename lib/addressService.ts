// Assumed dependency for making HTTP requests
import { apiRequest } from './api'; 
// Assuming User, ApiResponse, and other shared types are defined here
import { ApiResponse } from '../types'; 

// --- Interface Definitions (Based on your backend model) ---

export interface ApiAddress {
    id: number;
    userId: number;
    name: string; // e.g., "Home", "Office"
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Data structure for creation/update payload
interface AddressPayload {
    name: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault?: boolean;
}

// --- Helper Functions to Handle API Response Structure ---

const extractAddresses = (response: ApiResponse | any): ApiAddress[] => {
    let addresses: ApiAddress[] = [];

    // 1. Check for wrapped response structure: { success: true, data: [address, ...] }
    if (response?.success && Array.isArray(response.data)) {
        addresses = response.data;
    }
    // 2. Check for raw array response directly: [address, ...]
    else if (Array.isArray(response)) {
        addresses = response;
    }
    
    // Optional: Log warning if structure is unexpected
    if (addresses.length === 0 && response && (response.data || response.success)) {
        console.warn('Unexpected addresses response structure:', response);
    }

    return addresses;
};

const extractAddress = (response: ApiResponse | any, id?: number): ApiAddress | null => {
    let address: ApiAddress | null = null;
    
    // 1. Check for raw Address object response
    if (response && (id === undefined || response.id === id)) {
        address = response;
    } 
    // 2. Check for wrapped response structure
    else if (response?.success && response.data && (id === undefined || response.data.id === id)) {
        address = response.data;
    }
    
    if (address === null && response) {
        console.warn('Could not parse address data from response:', response);
    }

    return address;
};


// --- Address Service ---

export const addressService = {
    /**
     * Get all addresses for the authenticated user
     * GET /addresses
     */
    getUserAddresses: async (): Promise<ApiAddress[]> => {
        try {
            const response = await apiRequest('/addresses') as ApiResponse;
            return extractAddresses(response);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            throw error; 
        }
    },

    /**
     * Create a new address
     * POST /addresses
     * 💥 FIX: Explicitly JSON.stringify the payload and set Content-Type header.
     */
    createAddress: async (payload: AddressPayload): Promise<ApiAddress> => {
        const response = await apiRequest('/addresses', {
            method: 'POST',
            body: JSON.stringify(payload), // <-- FIX 1: Stringify the payload
            headers: { 'Content-Type': 'application/json' }, // <-- FIX 2: Set the header
        }) as ApiResponse;

        const newAddress = extractAddress(response);

        if (!newAddress) {
            throw new Error('Failed to create address or invalid response received.');
        }
        return newAddress;
    },

    /**
     * Update an existing address
     * PUT /addresses/:id
     * 💥 FIX: Explicitly JSON.stringify the payload and set Content-Type header.
     */
    updateAddress: async (id: number, payload: Partial<AddressPayload>): Promise<ApiAddress> => {
        const response = await apiRequest(`/addresses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload), // <-- FIX 1: Stringify the payload
            headers: { 'Content-Type': 'application/json' }, // <-- FIX 2: Set the header
        }) as ApiResponse;

        const updatedAddress = extractAddress(response, id);

        if (!updatedAddress) {
            throw new Error('Failed to update address or invalid response received.');
        }
        return updatedAddress;
    },

    /**
     * Delete an address (Soft Delete)
     * DELETE /addresses/:id
     */
    deleteAddress: async (id: number): Promise<ApiResponse> => {
        const response = await apiRequest(`/addresses/${id}`, {
            method: 'DELETE',
        }) as ApiResponse;
        
        return response;
    },
    
    /**
     * Set an address as the default
     * PATCH /addresses/:id/default
     * ⚠️ Note: PATCH often requires JSON too, including body={} if no data is sent.
     * We'll add the header, even with an empty body, for consistency.
     */
    setDefaultAddress: async (id: number): Promise<ApiAddress> => {
        const response = await apiRequest(`/addresses/${id}/default`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }, // <-- Added header
        }) as ApiResponse;

        // The backend controller returns the newly set default address object
        const defaultAddress = extractAddress(response, id);

        if (!defaultAddress) {
            throw new Error('Failed to set default address or invalid response received.');
        }
        return defaultAddress;
    }
};