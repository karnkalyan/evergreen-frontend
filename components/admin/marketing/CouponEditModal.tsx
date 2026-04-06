import React, { useState, useEffect } from 'react';
import { Coupon, CouponFormData, Category, Product } from '../../../types';
import Button from '../../shared/Button';
import SearchableSelect from '../../shared/SearchableSelect';
import { toast } from 'react-hot-toast';
import { productService } from '../../../lib/productService';
import { categoryService } from '../../../lib/categoryService';

interface CouponEditModalProps {
    coupon?: Coupon | null;
    onClose: () => void;
    onSave: (coupon: CouponFormData) => void;
}

const CouponEditModal: React.FC<CouponEditModalProps> = ({ coupon, onClose, onSave }) => {
    const [formData, setFormData] = useState<CouponFormData>({
        code: '',
        type: 'Percentage',
        value: 10,
        freeShipping: false,
        status: 'Active',
        minPurchase: 0,
        usageLimit: 100,
        perUserLimit: 1,
        startDate: null,
        endDate: null,
        appliesTo: 'all',
        applicableIds: [],
        isPublic: true,  // NEW: Default to public
    });
    
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    // Helper function to format date for datetime-local input
    const formatDateForInput = (dateString: string | null): string => {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            const timezoneOffset = date.getTimezoneOffset() * 60000;
            const localDate = new Date(date.getTime() - timezoneOffset);
            return localDate.toISOString().slice(0, 16);
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };

    // Helper function to convert datetime-local value to ISO string
    const formatDateForAPI = (datetimeLocalValue: string): string | null => {
        if (!datetimeLocalValue) return null;
        
        try {
            const date = new Date(datetimeLocalValue);
            return date.toISOString();
        } catch (error) {
            console.error('Error parsing date:', error);
            return null;
        }
    };

    // Fetch categories and products when modal opens
    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const [categoriesData, productsData] = await Promise.all([
                    categoryService.getCategories(),
                    productService.getProducts()
                ]);
                setCategories(categoriesData);
                setProducts(productsData);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load categories and products');
            } finally {
                setLoadingData(false);
            }
        };

        if (coupon) {
            console.log('🎯 Editing coupon:', coupon);
            
            setFormData({
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                freeShipping: coupon.freeShipping,
                status: coupon.status,
                minPurchase: coupon.minPurchase,
                usageLimit: coupon.usageLimit,
                perUserLimit: coupon.perUserLimit,
                startDate: coupon.startDate,
                endDate: coupon.endDate,
                appliesTo: coupon.appliesTo,
                applicableIds: coupon.applicableIds,
                isPublic: coupon.isPublic,  // NEW: Set from coupon data
            });
        } else {
            console.log('🆕 Creating new coupon');
        }

        fetchData();
    }, [coupon]);

    const handleChange = (field: keyof CouponFormData, value: any) => {
        setFormData(prev => ({ 
            ...prev, 
            [field]: value,
            ...(field === 'appliesTo' && { applicableIds: [] })
        }));
    };

    const handleDateChange = (field: 'startDate' | 'endDate', datetimeLocalValue: string) => {
        const apiDate = formatDateForAPI(datetimeLocalValue);
        setFormData(prev => ({
            ...prev,
            [field]: apiDate
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!formData.code.trim()) {
            toast.error('Coupon code is required');
            return;
        }

        if (formData.value <= 0) {
            toast.error('Discount value must be greater than 0');
            return;
        }

        if (formData.type === 'Percentage' && formData.value > 100) {
            toast.error('Percentage discount cannot exceed 100%');
            return;
        }

        // Validate applicableIds based on appliesTo
        if (formData.appliesTo !== 'all' && formData.applicableIds.length === 0) {
            toast.error(`Please select at least one ${formData.appliesTo === 'categories' ? 'category' : 'product'}`);
            return;
        }

        // Validate date range
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (end <= start) {
                toast.error('End date must be after start date');
                return;
            }
        }

        console.log('💾 Saving coupon data:', formData);

        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            // Error handling is done in the parent component
        } finally {
            setLoading(false);
        }
    };

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Scheduled', label: 'Scheduled' }, 
        { value: 'Inactive', label: 'Inactive' }
    ];
    
    const typeOptions = [
        { value: 'Percentage', label: 'Percentage' }, 
        { value: 'Fixed Amount', label: 'Fixed Amount' }
    ];
    
    const appliesToOptions = [
        { value: 'all', label: 'All Products' },
        { value: 'categories', label: 'Specific Categories' },
        { value: 'products', label: 'Specific Products' }
    ];

    // Prepare category and product options
    const categoryOptions = categories.map(category => ({
        value: category.id.toString(),
        label: category.name
    }));

    const productOptions = products.map(product => ({
        value: product.id.toString(),
        label: product.name
    }));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800">
                        {coupon ? 'Edit Coupon' : 'Create New Coupon'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Coupon Code *
                            </label>
                            <input 
                                type="text" 
                                value={formData.code} 
                                onChange={e => handleChange('code', e.target.value.toUpperCase())} 
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="SUMMER25"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Status *
                            </label>
                            <SearchableSelect 
                                options={statusOptions} 
                                value={formData.status} 
                                onChange={val => handleChange('status', val as any)} 
                            />
                        </div>
                    </div>

                    {/* NEW: Public/Private Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Coupon Visibility
                            </label>
                            <p className="text-xs text-slate-500">
                                {formData.isPublic 
                                    ? 'Public coupons can be used by anyone with the code' 
                                    : 'Private coupons are for specific users only'
                                }
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`text-sm font-medium ${formData.isPublic ? 'text-green-600' : 'text-slate-600'}`}>
                                {formData.isPublic ? 'Public' : 'Private'}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleChange('isPublic', !formData.isPublic)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    formData.isPublic ? 'bg-green-500' : 'bg-slate-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        formData.isPublic ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Discount Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Discount Type *
                            </label>
                            <SearchableSelect 
                                options={typeOptions} 
                                value={formData.type} 
                                onChange={val => handleChange('type', val as any)} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Discount Value {formData.type === 'Percentage' ? '(%) *' : '($) *'}
                            </label>
                            <input 
                                type="number" 
                                value={formData.value} 
                                onChange={e => handleChange('value', parseFloat(e.target.value) || 0)} 
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="0"
                                step={formData.type === 'Percentage' ? 1 : 0.01}
                                required
                            />
                        </div>
                    </div>

                    {/* Free Shipping */}
                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            id="freeShipping"
                            checked={formData.freeShipping}
                            onChange={(e) => handleChange('freeShipping', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="freeShipping" className="text-sm font-medium text-slate-700">
                            Offer Free Shipping
                        </label>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Start Date (Optional)
                            </label>
                            <input 
                                type="datetime-local" 
                                value={formatDateForInput(formData.startDate)} 
                                onChange={e => handleDateChange('startDate', e.target.value)} 
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {formData.startDate && (
                                <p className="text-xs text-slate-500 mt-1">
                                    Current: {new Date(formData.startDate).toLocaleString()}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                End Date (Optional)
                            </label>
                            <input 
                                type="datetime-local" 
                                value={formatDateForInput(formData.endDate)} 
                                onChange={e => handleDateChange('endDate', e.target.value)} 
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {formData.endDate && (
                                <p className="text-xs text-slate-500 mt-1">
                                    Current: {new Date(formData.endDate).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Usage Rules */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-slate-800 mb-4">Usage Rules</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Minimum Purchase ($)
                                </label>
                                <input 
                                    type="number" 
                                    value={formData.minPurchase} 
                                    onChange={e => handleChange('minPurchase', parseFloat(e.target.value) || 0)} 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Total Usage Limit
                                </label>
                                <input 
                                    type="number" 
                                    value={formData.usageLimit} 
                                    onChange={e => handleChange('usageLimit', parseInt(e.target.value) || 0)} 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Uses Per Customer
                                </label>
                                <input 
                                    type="number" 
                                    value={formData.perUserLimit} 
                                    onChange={e => handleChange('perUserLimit', parseInt(e.target.value) || 1)} 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    min="1"
                                />
                            </div>
                        </div>

                        {/* Applies To */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Applies To
                            </label>
                            <SearchableSelect 
                                options={appliesToOptions} 
                                value={formData.appliesTo} 
                                onChange={val => handleChange('appliesTo', val as any)} 
                            />
                        </div>

                        {/* Category Selection */}
                        {formData.appliesTo === 'categories' && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Select Categories *
                                </label>
                                {loadingData ? (
                                    <div className="text-sm text-slate-500">Loading categories...</div>
                                ) : (
                                    <SearchableSelect 
                                        options={categoryOptions} 
                                        value={formData.applicableIds[0]?.toString() || ''}
                                        onChange={(val) => handleChange('applicableIds', val ? [parseInt(val)] : [])}
                                        placeholder="Select a category"
                                    />
                                )}
                                <p className="text-xs text-slate-500 mt-1">
                                    Select categories that this coupon will apply to
                                </p>
                            </div>
                        )}

                        {/* Product Selection */}
                        {formData.appliesTo === 'products' && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Select Products *
                                </label>
                                {loadingData ? (
                                    <div className="text-sm text-slate-500">Loading products...</div>
                                ) : (
                                    <SearchableSelect 
                                        options={productOptions} 
                                        value={formData.applicableIds[0]?.toString() || ''}
                                        onChange={(val) => handleChange('applicableIds', val ? [parseInt(val)] : [])}
                                        placeholder="Select a product"
                                    />
                                )}
                                <p className="text-xs text-slate-500 mt-1">
                                    Select products that this coupon will apply to
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
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
                            disabled={loading || loadingData}
                        >
                            {loading ? 'Saving...' : (coupon ? 'Update Coupon' : 'Create Coupon')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CouponEditModal;