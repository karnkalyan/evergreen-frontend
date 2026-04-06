// components/admin/ShippingAdminPage.tsx
import React, { useState, useEffect } from 'react';
import { shippingService, Shipping } from '../../lib/shippingService';
import { toast } from 'react-hot-toast';
import Button from '../../components/shared/Button';
import TableControls from '../../components/admin/TableControls';
import AdminPagination from '../../components/admin/AdminPagination';
import { Edit2, Trash2, ToggleLeft, ToggleRight, Plus, X, Star, Package } from 'lucide-react';

const ShippingAdminPage: React.FC = () => {
  const [shippingOptions, setShippingOptions] = useState<Shipping[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<Shipping | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Shipping>>({
    name: '',
    code: '',
    description: '',
    cost: 0,
    isActive: true,
    isDefault: false,
    estimatedDays: 3,
    sortOrder: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchShippingOptions();
  }, [currentPage, statusFilter]);

  const fetchShippingOptions = async () => {
    try {
      setLoading(true);
      const response = await shippingService.getAllShippingOptions({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        isActive: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE'
      });
      setShippingOptions(response.shippingOptions);
    } catch (error) {
      console.error('Error fetching shipping options:', error);
      toast.error('Failed to load shipping options');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedShipping?.id) {
        await shippingService.updateShipping(selectedShipping.id, formData);
        toast.success('Shipping option updated successfully');
      } else {
        await shippingService.createShipping(formData as Shipping);
        toast.success('Shipping option created successfully');
      }
      setEditing(false);
      setSelectedShipping(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        cost: 0,
        isActive: true,
        isDefault: false,
        estimatedDays: 3,
        sortOrder: 0
      });
      fetchShippingOptions();
    } catch (error: any) {
      console.error('Error saving shipping option:', error);
      toast.error(error.message || 'Failed to save shipping option');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (shipping: Shipping) => {
    setSelectedShipping(shipping);
    setFormData(shipping);
    setEditing(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await shippingService.toggleShippingStatus(id);
      toast.success('Status updated successfully');
      fetchShippingOptions();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await shippingService.setDefaultShipping(id);
      toast.success('Default shipping option set successfully');
      fetchShippingOptions();
    } catch (error) {
      console.error('Error setting default shipping:', error);
      toast.error('Failed to set default shipping');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this shipping option?')) {
      try {
        await shippingService.deleteShipping(id);
        toast.success('Shipping option deleted successfully');
        fetchShippingOptions();
      } catch (error) {
        console.error('Error deleting shipping option:', error);
        toast.error('Failed to delete shipping option');
      }
    }
  };

  // Predefined shipping data for quick adding
  const predefinedShipping: Partial<Shipping>[] = [
    { name: 'Standard Shipping', code: 'STANDARD', description: 'Regular shipping with tracking', cost: 4.99, estimatedDays: 5, isDefault: true },
    { name: 'Express Shipping', code: 'EXPRESS', description: 'Fast delivery with priority handling', cost: 12.99, estimatedDays: 2 },
    { name: 'Overnight Shipping', code: 'OVERNIGHT', description: 'Next business day delivery', cost: 24.99, estimatedDays: 1 },
    { name: 'Free Shipping', code: 'FREE', description: 'Free shipping on qualified orders', cost: 0, estimatedDays: 7 },
    { name: 'International Standard', code: 'INTL_STANDARD', description: 'International standard delivery', cost: 19.99, estimatedDays: 14 },
    { name: 'International Express', code: 'INTL_EXPRESS', description: 'International express delivery', cost: 39.99, estimatedDays: 5 },
    { name: 'Store Pickup', code: 'PICKUP', description: 'Pick up from nearest store', cost: 0, estimatedDays: 1 }
  ];

  const addPredefinedShipping = async (shippingData: Partial<Shipping>) => {
    try {
      setLoading(true);
      await shippingService.createShipping(shippingData as Shipping);
      toast.success('Shipping option added successfully');
      fetchShippingOptions();
    } catch (error: any) {
      console.error('Error adding predefined shipping:', error);
      toast.error(error.message || 'Failed to add shipping option');
    } finally {
      setLoading(false);
    }
  };

  const columnsForExport = [
    { Header: 'ID', accessor: 'id' },
    { Header: 'Name', accessor: 'name' },
    { Header: 'Code', accessor: 'code' },
    { Header: 'Description', accessor: 'description' },
    { Header: 'Cost', accessor: 'cost' },
    { Header: 'Estimated Days', accessor: 'estimatedDays' },
    { Header: 'Status', accessor: (row: Shipping) => row.isActive ? 'Active' : 'Inactive' },
    { Header: 'Default', accessor: (row: Shipping) => row.isDefault ? 'Yes' : 'No' },
    { Header: 'Sort Order', accessor: 'sortOrder' },
    { Header: 'Created At', accessor: (row: Shipping) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '' },
  ];

  const filteredShipping = shippingOptions.filter(shipping =>
    shipping.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipping.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipping.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredShipping.length / ITEMS_PER_PAGE);

  if (loading && shippingOptions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading shipping options...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TableControls
        title="Shipping Options"
        onSearch={setSearchTerm}
        exportData={filteredShipping}
        exportColumns={columnsForExport}
        actionButton={
          <Button onClick={() => {
            setEditing(true);
            setSelectedShipping(null);
            setFormData({
              name: '',
              code: '',
              description: '',
              cost: 0,
              isActive: true,
              isDefault: false,
              estimatedDays: 3,
              sortOrder: 0
            });
          }}>
            Add New Shipping
          </Button>
        }
        showFilters={true}
      />

      {/* Quick Add Predefined Shipping */}
      <div className="bg-white rounded-xl shadow-soft-md p-6 border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Add Common Shipping Options</h2>
        <div className="flex flex-wrap gap-2">
          {predefinedShipping.map((shipping, index) => (
            <Button
              key={index}
              onClick={() => addPredefinedShipping(shipping)}
              disabled={loading}
              variant="outline"
              size="sm"
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Package className="w-4 h-4 mr-2" />
              {shipping.name}
            </Button>
          ))}
        </div>
        <p className="text-sm text-slate-500 mt-3">
          <strong>Default Shipping:</strong> This will be automatically selected for customers during checkout.
        </p>
      </div>

      {editing ? (
        <div className="bg-white rounded-xl shadow-soft-md p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              {selectedShipping ? 'Edit Shipping Option' : 'Add New Shipping Option'}
            </h2>
            <button
              onClick={() => setEditing(false)}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Shipping Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="Enter shipping name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Shipping Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="STANDARD, EXPRESS, etc."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Enter shipping description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cost ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost || 0}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Estimated Days <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.estimatedDays || 3}
                  onChange={(e) => setFormData({ ...formData, estimatedDays: parseInt(e.target.value) || 3 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sortOrder || 0}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div className="flex space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive || false}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Active</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isDefault || false}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">Default Option</span>
                  <div className="text-xs text-slate-500">Automatically selected for customers</div>
                </div>
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary-gradient hover:opacity-90 text-white disabled:opacity-50"
              >
                {loading ? 'Saving...' : (selectedShipping ? 'Update Shipping' : 'Create Shipping')}
              </Button>
              <Button
                type="button"
                onClick={() => setEditing(false)}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-soft-md overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-semibold text-slate-500 uppercase border-b bg-slate-50">
                    <th className="p-4">Shipping Option</th>
                    <th className="p-4">Cost</th>
                    <th className="p-4">Delivery Time</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Default</th>
                    <th className="p-4">Sort Order</th>
                    <th className="p-4">Created</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredShipping.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        {searchTerm || statusFilter !== 'ALL' 
                          ? 'No shipping options found matching your criteria.' 
                          : 'No shipping options available. Click "Add New Shipping" to get started.'}
                      </td>
                    </tr>
                  ) : (
                    filteredShipping.map((shipping) => (
                      <tr key={shipping.id} className="border-b last:border-0 text-slate-700 hover:bg-slate-50/70">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <Package className="w-5 h-5 text-slate-400" />
                            <div>
                              <div className="font-semibold text-slate-800">{shipping.name}</div>
                              <div className="text-xs text-slate-500 font-mono">{shipping.code}</div>
                              {shipping.description && (
                                <div className="text-xs text-slate-500 mt-1">{shipping.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-800 font-semibold">
                            ${shipping.cost.toFixed(2)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-600">
                            {shipping.estimatedDays} day{shipping.estimatedDays !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => shipping.id && handleToggleStatus(shipping.id)}
                            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                              shipping.isActive
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {shipping.isActive ? (
                              <ToggleRight className="w-4 h-4" />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                            <span>{shipping.isActive ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>
                        <td className="p-4">
                          {shipping.isDefault ? (
                            <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3 fill-yellow-500" />
                              <span>Default</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => shipping.id && handleSetDefault(shipping.id)}
                              className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                              <Star className="w-3 h-3" />
                              <span>Set Default</span>
                            </button>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-slate-600 font-mono text-xs">
                            {shipping.sortOrder || 0}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs text-slate-500">
                            {shipping.createdAt ? new Date(shipping.createdAt).toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEdit(shipping)}
                              className="text-blue-600 hover:text-blue-800 p-1.5 rounded-md hover:bg-blue-50 text-xs font-semibold transition-colors flex items-center space-x-1"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => shipping.id && handleDelete(shipping.id)} 
                              className="text-red-600 hover:text-red-800 p-1.5 rounded-md hover:bg-red-50 text-xs font-semibold transition-colors flex items-center space-x-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <AdminPagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShippingAdminPage;