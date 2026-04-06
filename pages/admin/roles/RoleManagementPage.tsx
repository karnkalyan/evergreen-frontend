// src/pages/admin/roles/RoleManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { Role, Permission } from '../../../types';
import { roleService } from '../../../lib/roleService';
import Button from '../../../components/shared/Button';
import RoleFormModal from '../../../components/admin/RoleFormModal';
import RoleViewModal from '../../../components/admin/RoleViewModal';
import DeleteConfirmationModal from '../../../components/shared/DeleteConfirmationModal';
import { toast } from 'react-hot-toast';

const RoleManagementPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, permissionsData] = await Promise.all([
        roleService.getRoles(),
        roleService.getPermissions()
      ]);
      
      // Ensure we always set arrays, even if the service returns unexpected data
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermissions(Array.isArray(permissionsData) ? permissionsData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load roles and permissions');
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setShowFormModal(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowFormModal(true);
  };

  const handleViewRole = (role: Role) => {
    setSelectedRole(role);
    setShowViewModal(true);
  };

  const handleDeleteRole = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const handleSaveRole = async (roleData: any) => {
    setActionLoading(true);
    try {
      let response;
      if (selectedRole) {
        response = await roleService.updateRole(selectedRole.id, roleData);
      } else {
        response = await roleService.createRole(roleData);
      }

      if (response.success) {
        toast.success(`Role ${selectedRole ? 'updated' : 'created'} successfully`);
        setShowFormModal(false);
        setSelectedRole(null);
        await loadData();
      } else {
        toast.error(response.error || `Failed to ${selectedRole ? 'update' : 'create'} role`);
      }
    } catch (error: any) {
      console.error('Error saving role:', error);
      toast.error(error.message || `Failed to ${selectedRole ? 'update' : 'create'} role`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRole) return;

    setActionLoading(true);
    try {
      const response = await roleService.deleteRole(selectedRole.id);
      
      if (response.success) {
        toast.success('Role deleted successfully');
        setShowDeleteModal(false);
        setSelectedRole(null);
        await loadData();
      } else {
        toast.error(response.error || 'Failed to delete role');
      }
    } catch (error: any) {
      console.error('Error deleting role:', error);
      toast.error(error.message || 'Failed to delete role');
    } finally {
      setActionLoading(false);
    }
  };

  const getPermissionCountByMenu = (permissions: Permission[]) => {
    if (!Array.isArray(permissions)) return {};
    
    const menuCount: { [key: string]: number } = {};
    permissions.forEach(permission => {
      if (permission && permission.menuName) {
        menuCount[permission.menuName] = (menuCount[permission.menuName] || 0) + 1;
      }
    });
    return menuCount;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading roles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Role Management</h1>
          <p className="text-slate-600">Manage user roles and permissions</p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreateRole}
        >
          + Add New Role
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(roles) && roles.map((role) => {
          if (!role) return null;
          
          const menuCount = getPermissionCountByMenu(role.permissions || []);
          return (
            <div
              key={role.id}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-slate-800">{role.name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {role._count?.users || 0} users
                </span>
              </div>

              {role.description && (
                <p className="text-slate-600 text-sm mb-4">{role.description}</p>
              )}

              <div className="mb-4">
                <div className="flex justify-between text-sm text-slate-500 mb-2">
                  <span>Permissions</span>
                  <span>{(role.permissions && Array.isArray(role.permissions) ? role.permissions.length : 0)} total</span>
                </div>
                <div className="space-y-1">
                  {Object.entries(menuCount).map(([menuName, count]) => (
                    <div key={menuName} className="flex justify-between text-xs">
                      <span className="text-slate-600">{menuName}</span>
                      <span className="text-slate-400">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  Updated {role.updatedAt ? new Date(role.updatedAt).toLocaleDateString() : 'Unknown'}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewRole(role)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    title="View Role"
                  >
                    👁️
                  </button>
                  <button
                    onClick={() => handleEditRole(role)}
                    className="text-slate-400 hover:text-blue-600 transition-colors"
                    title="Edit Role"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete Role"
                    disabled={role._count?.users && role._count.users > 0}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(!Array.isArray(roles) || roles.length === 0) && (
        <div className="text-center py-12">
          <div className="text-slate-400 text-lg mb-2">
            {!Array.isArray(roles) ? 'Error loading roles' : 'No roles found'}
          </div>
          <Button variant="primary" onClick={handleCreateRole}>
            Create Your First Role
          </Button>
        </div>
      )}

      {/* Modals */}
      {showFormModal && (
        <RoleFormModal
          role={selectedRole}
          permissions={permissions}
          onClose={() => {
            setShowFormModal(false);
            setSelectedRole(null);
          }}
          onSave={handleSaveRole}
          loading={actionLoading}
        />
      )}

      {showViewModal && selectedRole && (
        <RoleViewModal
          role={selectedRole}
          onClose={() => {
            setShowViewModal(false);
            setSelectedRole(null);
          }}
        />
      )}

      {showDeleteModal && selectedRole && (
        <DeleteConfirmationModal
          title="Delete Role"
          message={`Are you sure you want to delete the role "${selectedRole.name}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedRole(null);
          }}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default RoleManagementPage;