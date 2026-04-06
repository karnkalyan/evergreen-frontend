// components/admin/PaymentMethodAdminPage.tsx
import React, { useState, useEffect } from 'react';
import { paymentMethodService, PaymentMethod } from '../../lib/paymentMethodService';
import { toast } from 'react-hot-toast';
import Button from '../../components/shared/Button';
import TableControls from '../../components/admin/TableControls';
import AdminPagination from '../../components/admin/AdminPagination';
import { Edit2, Trash2, ToggleLeft, ToggleRight, Plus, X, Star, CreditCard, QrCode } from 'lucide-react';

const PaymentMethodAdminPage: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    name: '',
    code: '',
    description: '',
    instructions: '',
    isActive: true,
    isDefault: false,
    isQrAvailable: false,
    qrCodeUrl: '',
    sortOrder: 0,
    requiresAuthorization: false,
    supportsRefunds: true,
    processingFee: 0,
    minAmount: 0,
    maxAmount: undefined
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchPaymentMethods();
  }, [currentPage, statusFilter]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await paymentMethodService.getAllPaymentMethods({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        isActive: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE'
      });
      setPaymentMethods(response.paymentMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedPaymentMethod?.id) {
        await paymentMethodService.updatePaymentMethod(selectedPaymentMethod.id, formData);
        toast.success('Payment method updated successfully');
      } else {
        await paymentMethodService.createPaymentMethod(formData as PaymentMethod);
        toast.success('Payment method created successfully');
      }
      setEditing(false);
      setSelectedPaymentMethod(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        instructions: '',
        isActive: true,
        isDefault: false,
        isQrAvailable: false,
        qrCodeUrl: '',
        sortOrder: 0,
        requiresAuthorization: false,
        supportsRefunds: true,
        processingFee: 0,
        minAmount: 0,
        maxAmount: undefined
      });
      fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error saving payment method:', error);
      toast.error(error.message || 'Failed to save payment method');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setFormData(paymentMethod);
    setEditing(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await paymentMethodService.togglePaymentMethodStatus(id);
      toast.success('Status updated successfully');
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await paymentMethodService.setDefaultPaymentMethod(id);
      toast.success('Default payment method set successfully');
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error('Failed to set default payment method');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        await paymentMethodService.deletePaymentMethod(id);
        toast.success('Payment method deleted successfully');
        fetchPaymentMethods();
      } catch (error) {
        console.error('Error deleting payment method:', error);
        toast.error('Failed to delete payment method');
      }
    }
  };

  // Predefined payment methods for quick adding
  const predefinedPaymentMethods: Partial<PaymentMethod>[] = [
    { 
      name: 'Credit Card', 
      code: 'CREDIT_CARD', 
      description: 'Pay with Visa, MasterCard, American Express', 
      instructions: 'Enter your card details to complete the payment',
      supportsRefunds: true,
      processingFee: 2.5
    },
    { 
      name: 'PayPal', 
      code: 'PAYPAL', 
      description: 'Pay using your PayPal account', 
      instructions: 'You will be redirected to PayPal to complete your payment',
      supportsRefunds: true,
      processingFee: 2.9
    },
    { 
      name: 'Bank Transfer', 
      code: 'BANK_TRANSFER', 
      description: 'Direct bank transfer', 
      instructions: 'Transfer the amount to our bank account. Use order ID as reference.',
      requiresAuthorization: true,
      supportsRefunds: false,
      processingFee: 0
    },
    { 
      name: 'Cash on Delivery', 
      code: 'COD', 
      description: 'Pay when you receive your order', 
      instructions: 'Pay cash to the delivery person when you receive your order',
      requiresAuthorization: false,
      supportsRefunds: false,
      processingFee: 0
    },
    { 
      name: 'Stripe', 
      code: 'STRIPE', 
      description: 'Secure online payments via Stripe', 
      instructions: 'Enter your card details for secure processing',
      supportsRefunds: true,
      processingFee: 2.9
    },
    { 
      name: 'Google Pay', 
      code: 'GOOGLE_PAY', 
      description: 'Fast payment with Google Pay', 
      instructions: 'Use your Google Pay account for quick checkout',
      supportsRefunds: true,
      processingFee: 1.5
    },
    { 
      name: 'Apple Pay', 
      code: 'APPLE_PAY', 
      description: 'Secure payment with Apple Pay', 
      instructions: 'Use Apple Pay for secure and fast payment',
      supportsRefunds: true,
      processingFee: 1.5
    }
  ];

  const addPredefinedPaymentMethod = async (paymentMethodData: Partial<PaymentMethod>) => {
    try {
      setLoading(true);
      await paymentMethodService.createPaymentMethod(paymentMethodData as PaymentMethod);
      toast.success('Payment method added successfully');
      fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error adding predefined payment method:', error);
      toast.error(error.message || 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  const columnsForExport = [
    { Header: 'ID', accessor: 'id' },
    { Header: 'Name', accessor: 'name' },
    { Header: 'Code', accessor: 'code' },
    { Header: 'Description', accessor: 'description' },
    { Header: 'Status', accessor: (row: PaymentMethod) => row.isActive ? 'Active' : 'Inactive' },
    { Header: 'Default', accessor: (row: PaymentMethod) => row.isDefault ? 'Yes' : 'No' },
    { Header: 'QR Available', accessor: (row: PaymentMethod) => row.isQrAvailable ? 'Yes' : 'No' },
    { Header: 'Processing Fee', accessor: 'processingFee' },
    { Header: 'Supports Refunds', accessor: (row: PaymentMethod) => row.supportsRefunds ? 'Yes' : 'No' },
    { Header: 'Sort Order', accessor: 'sortOrder' },
    { Header: 'Created At', accessor: (row: PaymentMethod) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '' },
  ];

  const filteredPaymentMethods = paymentMethods.filter(paymentMethod =>
    paymentMethod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paymentMethod.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paymentMethod.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPaymentMethods.length / ITEMS_PER_PAGE);

  if (loading && paymentMethods.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading payment methods...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TableControls
        title="Payment Methods"
        onSearch={setSearchTerm}
        exportData={filteredPaymentMethods}
        exportColumns={columnsForExport}
        actionButton={
          <Button onClick={() => {
            setEditing(true);
            setSelectedPaymentMethod(null);
            setFormData({
              name: '',
              code: '',
              description: '',
              instructions: '',
              isActive: true,
              isDefault: false,
              isQrAvailable: false,
              qrCodeUrl: '',
              sortOrder: 0,
              requiresAuthorization: false,
              supportsRefunds: true,
              processingFee: 0,
              minAmount: 0,
              maxAmount: undefined
            });
          }}>
            Add New Payment Method
          </Button>
        }
        showFilters={true}
      />

      {/* Quick Add Predefined Payment Methods */}
      <div className="bg-white rounded-xl shadow-soft-md p-6 border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Add Common Payment Methods</h2>
        <div className="flex flex-wrap gap-2">
          {predefinedPaymentMethods.map((paymentMethod, index) => (
            <Button
              key={index}
              onClick={() => addPredefinedPaymentMethod(paymentMethod)}
              disabled={loading}
              variant="outline"
              size="sm"
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {paymentMethod.name}
            </Button>
          ))}
        </div>
        <p className="text-sm text-slate-500 mt-3">
          <strong>Default Payment Method:</strong> This will be automatically selected for customers during checkout.
        </p>
      </div>

      {editing ? (
        <div className="bg-white rounded-xl shadow-soft-md p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              {selectedPaymentMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
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
                  Payment Method Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="Enter payment method name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="CREDIT_CARD, PAYPAL, etc."
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
                rows={2}
                placeholder="Enter payment method description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Instructions for Customers
              </label>
              <textarea
                value={formData.instructions || ''}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Enter payment instructions that customers will see"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Processing Fee (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.processingFee || 0}
                  onChange={(e) => setFormData({ ...formData, processingFee: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Minimum Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minAmount || 0}
                  onChange={(e) => setFormData({ ...formData, minAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Maximum Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.maxAmount || ''}
                  onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Leave empty for no limit"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="space-y-4">
                {/* QR Code Section */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isQrAvailable || false}
                      onChange={(e) => setFormData({ ...formData, isQrAvailable: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">QR Code Available</span>
                  </label>
                  
                  {formData.isQrAvailable && (
                    <div className="flex-1 ml-4">
                      <input
                        type="url"
                        value={formData.qrCodeUrl || ''}
                        onChange={(e) => setFormData({ ...formData, qrCodeUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Enter QR Code URL"
                      />
                    </div>
                  )}
                </div>

                {formData.isQrAvailable && formData.qrCodeUrl && (
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-md">
                    <QrCode className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-600 truncate flex-1">
                      QR URL: {formData.qrCodeUrl}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
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

              <div className="space-y-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.requiresAuthorization || false}
                    onChange={(e) => setFormData({ ...formData, requiresAuthorization: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-700">Requires Authorization</span>
                    <div className="text-xs text-slate-500">Needs manual approval for payments</div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.supportsRefunds || true}
                    onChange={(e) => setFormData({ ...formData, supportsRefunds: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-700">Supports Refunds</span>
                    <div className="text-xs text-slate-500">Allow refunds for this payment method</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary-gradient hover:opacity-90 text-white disabled:opacity-50"
              >
                {loading ? 'Saving...' : (selectedPaymentMethod ? 'Update Payment Method' : 'Create Payment Method')}
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
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Processing Fee</th>
                    <th className="p-4">Amount Limits</th>
                    <th className="p-4">QR Code</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Default</th>
                    <th className="p-4">Sort Order</th>
                    <th className="p-4">Created</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredPaymentMethods.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        {searchTerm || statusFilter !== 'ALL' 
                          ? 'No payment methods found matching your criteria.' 
                          : 'No payment methods available. Click "Add New Payment Method" to get started.'}
                      </td>
                    </tr>
                  ) : (
                    filteredPaymentMethods.map((paymentMethod) => (
                      <tr key={paymentMethod.id} className="border-b last:border-0 text-slate-700 hover:bg-slate-50/70">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="w-5 h-5 text-slate-400" />
                            <div>
                              <div className="font-semibold text-slate-800">{paymentMethod.name}</div>
                              <div className="text-xs text-slate-500 font-mono">{paymentMethod.code}</div>
                              {paymentMethod.description && (
                                <div className="text-xs text-slate-500 mt-1">{paymentMethod.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-800 font-semibold">
                            {paymentMethod.processingFee > 0 ? `${paymentMethod.processingFee}%` : 'Free'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-600 text-xs">
                            {paymentMethod.minAmount && paymentMethod.maxAmount ? (
                              <>${paymentMethod.minAmount} - ${paymentMethod.maxAmount}</>
                            ) : paymentMethod.minAmount ? (
                              <>Min: ${paymentMethod.minAmount}</>
                            ) : paymentMethod.maxAmount ? (
                              <>Max: ${paymentMethod.maxAmount}</>
                            ) : (
                              'No limits'
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {paymentMethod.isQrAvailable ? (
                            <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              <QrCode className="w-3 h-3" />
                              <span>Available</span>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500">Not available</div>
                          )}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => paymentMethod.id && handleToggleStatus(paymentMethod.id)}
                            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                              paymentMethod.isActive
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {paymentMethod.isActive ? (
                              <ToggleRight className="w-4 h-4" />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                            <span>{paymentMethod.isActive ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>
                        <td className="p-4">
                          {paymentMethod.isDefault ? (
                            <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3 fill-yellow-500" />
                              <span>Default</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => paymentMethod.id && handleSetDefault(paymentMethod.id)}
                              className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                              <Star className="w-3 h-3" />
                              <span>Set Default</span>
                            </button>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-slate-600 font-mono text-xs">
                            {paymentMethod.sortOrder || 0}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs text-slate-500">
                            {paymentMethod.createdAt ? new Date(paymentMethod.createdAt).toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEdit(paymentMethod)}
                              className="text-blue-600 hover:text-blue-800 p-1.5 rounded-md hover:bg-blue-50 text-xs font-semibold transition-colors flex items-center space-x-1"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => paymentMethod.id && handleDelete(paymentMethod.id)} 
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

export default PaymentMethodAdminPage;