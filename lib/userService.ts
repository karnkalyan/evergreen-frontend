// Assumed dependency for making HTTP requests
import { apiRequest } from './api'; 
import { User, UserFormData, Role, ApiResponse } from '../types';

// Helper function to get full image URL
export const getImageUrl = (imagePath: string): string | null => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    
    // NOTE: Ensure your VITE_API_BASE_URL is correctly set in your .env file
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    return `${baseUrl}${imagePath}`;
};

export const userService = {
    // Get all users
 getUsers: async (): Promise<User[]> => {
    try {
        const response = await apiRequest('/users') as ApiResponse;
        console.log('📊 USERS API RESPONSE:', response);

        let usersArray: User[] = [];
        
        // Handle wrapped response structure: { success: true, data: [user, ...] }
        if (response.success && Array.isArray(response.data)) {
            usersArray = response.data;
        } 
        // Handle raw array response directly: [user, ...]
        else if (Array.isArray(response)) {
            usersArray = response;
        } else {
            console.warn('Unexpected users response structure:', response);
            return [];
        }
        
        // Process users and ensure role structure is consistent
        return usersArray.map((user: User) => ({
            ...user,
            profilePicture: user.profilePicture ? getImageUrl(user.profilePicture) : null,
            // Ensure role object is properly structured
            role: user.role || { id: 0, name: 'Unknown', permissions: [] }
        }));
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
},

    /**
     * Get user by ID (FIXED LOGIC)
     * Handles both raw User object response AND wrapped { success: true, data: User } response.
     */
    getUserById: async (id: number): Promise<User | null> => {
        try {
            const response = await apiRequest(`/users/${id}`) as ApiResponse;
            // console.log('👤 USER API RESPONSE:', response);

            let user: User | null = null;
            
            // 💥 FIX 1: Check for raw User object response (which matches your previous successful API response)
            if (response && response.id === id) {
                user = response;
            } 
            // FIX 2: Check for wrapped response structure
            else if (response.success && response.data && response.data.id === id) {
                user = response.data;
            }

            if (user) {
                return {
                    ...user,
                    // Process the profilePicture path into a full URL
                    profilePicture: user.profilePicture ? getImageUrl(user.profilePicture) : null
                };
            }
            
            // If we received data but couldn't parse it as a User, log a warning
            if (response) {
                console.warn('Could not parse user data from response:', response);
            }
            
            return null; // Triggers the "Failed to load user profile: API returned empty data." message in the component
            
        } catch (error) {
            console.error('Error fetching user:', error);
            // Re-throw or return null depending on how you want the component to handle hard errors
            throw error; // Let the component catch and display the network/server error
        }
    },

    // Create user
    createUser: async (userData: FormData): Promise<ApiResponse> => {
        const response = await apiRequest('/users', {
            method: 'POST',
            body: userData,
        }) as ApiResponse;
        
        return response;
    },

    // Update user
    updateUser: async (id: number, userData: FormData): Promise<ApiResponse> => {
        const response = await apiRequest(`/users/${id}`, {
            method: 'PUT',
            body: userData,
        }) as ApiResponse;
        
        return response;
    },

    // Delete user
    deleteUser: async (id: number): Promise<ApiResponse> => {
        const response = await apiRequest(`/users/${id}`, {
            method: 'DELETE',
        }) as ApiResponse;
        
        return response;
    },

    // Get roles for dropdown
getRoles: async (): Promise<Role[]> => {
    try {
        const response = await apiRequest('/roles') as ApiResponse;
        console.log('📋 ROLES API RESPONSE:', response); 
        
        let rolesArray: Role[] = [];
        
        // 1. Check for wrapped response structure with nested roles array
        if (response.success && response.data && Array.isArray(response.data.roles)) {
            rolesArray = response.data.roles;
        }
        // 2. Check for wrapped response structure with direct data array
        else if (response.success && Array.isArray(response.data)) {
            rolesArray = response.data;
        }
        // 3. Handle array response directly
        else if (Array.isArray(response)) {
            rolesArray = response;
        }
        else {
            console.warn('Unexpected roles response structure:', response);
            return [];
        }
        
        console.log('✅ Processed roles:', rolesArray);
        return rolesArray;
    } catch (error) {
        console.error('Error fetching roles:', error);
        return [];
    }
}
};