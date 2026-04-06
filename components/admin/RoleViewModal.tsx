// src/components/admin/RoleViewModal.tsx
import React from 'react';
import { Role } from '../../types';
import Button from '../shared/Button';

interface RoleViewModalProps {
  role: Role;
  onClose: () => void;
}

const RoleViewModal: React.FC<RoleViewModalProps> = ({ role, onClose }) => {
  // Group permissions by menuName
  const groupedPermissions = role.permissions.reduce((acc, permission) => {
    if (!acc[permission.menuName]) {
      acc[permission.menuName] = [];
    }
    acc[permission.menuName].push(permission);
    return acc;
  }, {} as { [key: string]: typeof role.permissions });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            Role Details: {role.name}
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-slate-800 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role Name
                </label>
                <p className="text-slate-900">{role.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Users Count
                </label>
                <p className="text-slate-900">{role._count?.users || 0} users</p>
              </div>
              {role.description && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <p className="text-slate-900">{role.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-lg font-medium text-slate-800 mb-4">
              Permissions ({role.permissions.length})
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto border border-slate-200 rounded-lg p-4">
              {Object.entries(groupedPermissions).map(([menuName, permissions]) => (
                <div key={menuName} className="border-b border-slate-100 last:border-b-0 pb-4 last:pb-0">
                  <h4 className="font-medium text-slate-800 mb-2">{menuName}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center space-x-2 p-2 bg-slate-50 rounded"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-slate-700">
                          {permission.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t border-slate-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(role.createdAt).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{' '}
                {new Date(role.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleViewModal;