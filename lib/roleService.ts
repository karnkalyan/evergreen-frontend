// src/services/roleService.ts
import { apiRequest } from './api';
import { Role, RoleFormData, Permission, ApiResponse } from '../types';

export const roleService = {
  // Get all roles
  getRoles: async (): Promise<Role[]> => {
    try {
      const response = await apiRequest('/roles') as ApiResponse;
      console.log('📋 ROLES API RESPONSE:', response);

      if (response.success && response.data) {
        // Check if data has a roles property or is the array directly
        if (response.data.roles && Array.isArray(response.data.roles)) {
          return response.data.roles;
        } else if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      
      // Handle array response directly
      if (Array.isArray(response)) {
        return response;
      }
      
      console.warn('Unexpected roles response structure:', response);
      return [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  },

  // Get role by ID
  getRoleById: async (id: number): Promise<Role | null> => {
    try {
      const response = await apiRequest(`/roles/${id}`) as ApiResponse;
      
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching role:', error);
      return null;
    }
  },

  // Create role
  createRole: async (roleData: RoleFormData): Promise<ApiResponse> => {
    const response = await apiRequest('/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roleData),
    }) as ApiResponse;
    
    return response;
  },

  // Update role
  updateRole: async (id: number, roleData: RoleFormData): Promise<ApiResponse> => {
    const response = await apiRequest(`/roles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roleData),
    }) as ApiResponse;
    
    return response;
  },

  // Delete role
  deleteRole: async (id: number): Promise<ApiResponse> => {
    const response = await apiRequest(`/roles/${id}`, {
      method: 'DELETE',
    }) as ApiResponse;
    
    return response;
  },

  // Get all permissions
  getPermissions: async (): Promise<Permission[]> => {
    try {
      const response = await apiRequest('/permissions') as ApiResponse;
      console.log('📋 PERMISSIONS API RESPONSE:', response);
      
      if (response.success && response.data) {
        // Check if data has a permissions property or is the array directly
        if (response.data.permissions && Array.isArray(response.data.permissions)) {
          return response.data.permissions;
        } else if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      
      if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }
  }
};