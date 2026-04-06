// src/components/admin/RoleFormModal.tsx
import React, { useState, useEffect } from 'react';
import { Role, Permission, RoleFormData } from '../../types';
import Button from '../shared/Button';
import { toast } from 'react-hot-toast';

interface RoleFormModalProps {
  role: Role | null;
  permissions: Permission[];
  onClose: () => void;
  onSave: (roleData: RoleFormData) => void;
  loading: boolean;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({
  role,
  permissions,
  onClose,
  onSave,
  loading
}) => {
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissionIds: []
  });

  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());

  // Group permissions by menuName
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.menuName]) {
      acc[permission.menuName] = [];
    }
    acc[permission.menuName].push(permission);
    return acc;
  }, {} as { [key: string]: Permission[] });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        permissionIds: role.permissions.map(p => p.id)
      });
      setSelectedPermissions(new Set(role.permissions.map(p => p.id)));
    } else {
      setFormData({
        name: '',
        description: '',
        permissionIds: []
      });
      setSelectedPermissions(new Set());
    }
  }, [role]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionToggle = (permissionId: number) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
    setFormData(prev => ({
      ...prev,
      permissionIds: Array.from(newSelected)
    }));
  };

  const handleSelectAll = (menuName: string) => {
    const menuPermissions = groupedPermissions[menuName] || [];
    const menuPermissionIds = menuPermissions.map(p => p.id);
    const newSelected = new Set(selectedPermissions);
    
    const allSelected = menuPermissionIds.every(id => newSelected.has(id));
    
    if (allSelected) {
      // Deselect all
      menuPermissionIds.forEach(id => newSelected.delete(id));
    } else {
      // Select all
      menuPermissionIds.forEach(id => newSelected.add(id));
    }
    
    setSelectedPermissions(newSelected);
    setFormData(prev => ({
      ...prev,
      permissionIds: Array.from(newSelected)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    if (formData.permissionIds.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            {role ? 'Edit Role' : 'Create New Role'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter role name"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter role description"
                />
              </div>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Permissions *
              </label>
              <div className="space-y-4 max-h-96 overflow-y-auto border border-slate-200 rounded-lg p-4">
                {Object.entries(groupedPermissions).map(([menuName, menuPermissions]) => (
                  <div key={menuName} className="border-b border-slate-100 last:border-b-0 pb-4 last:pb-0">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-slate-800">{menuName}</h4>
                      <button
                        type="button"
                        onClick={() => handleSelectAll(menuName)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Select All
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {menuPermissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.has(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700">
                            {permission.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Selected {formData.permissionIds.length} permissions
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (role ? 'Update Role' : 'Create Role')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleFormModal;