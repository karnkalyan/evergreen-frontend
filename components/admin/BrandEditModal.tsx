import React, { useState, useEffect } from 'react';
import { Brand, BrandFormData } from '../../types';
import Button from '../shared/Button';
import { toast } from 'react-hot-toast';

interface BrandEditModalProps {
    brand: Brand | null;
    onClose: () => void;
    onSave: (brandData: BrandFormData, logoFile?: File | null, removeLogo?: boolean) => void;
}

const BrandEditModal: React.FC<BrandEditModalProps> = ({ brand, onClose, onSave }) => {
    const [formData, setFormData] = useState<BrandFormData>({
        name: '',
        slug: '',
        website: '',
        description: '',
        metaTitle: '',
        metaDescription: '',
        isActive: true,
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>('');
    const [removeLogo, setRemoveLogo] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (brand) {
            setFormData({
                name: brand.name || '',
                slug: brand.slug || '',
                website: brand.website || '',
                description: brand.description || '',
                metaTitle: brand.metaTitle || '',
                metaDescription: brand.metaDescription || '',
                isActive: brand.isActive ?? true,
            });
            setLogoPreview(brand.logo || '');
        } else {
            setFormData({
                name: '',
                slug: '',
                website: '',
                description: '',
                metaTitle: '',
                metaDescription: '',
                isActive: true,
            });
            setLogoPreview('');
            setLogoFile(null);
            setRemoveLogo(false);
        }
    }, [brand]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            setLogoFile(file);
            setRemoveLogo(false);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview('');
        setRemoveLogo(true);
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFormData(prev => ({
            ...prev,
            name,
            slug: prev.slug || generateSlug(name)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            toast.error('Brand name is required');
            return;
        }

        setLoading(true);
        try {
            await onSave(formData, logoFile, removeLogo);
        } catch (error) {
            console.error('Error saving brand:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-soft-md w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800">
                        {brand ? 'Edit Brand' : 'Add New Brand'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Logo Upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Brand Logo
                        </label>
                        <div className="flex items-center space-x-4">
                            {(logoPreview || brand?.logo) && !removeLogo ? (
                                <div className="relative">
                                    <img 
                                        src={logoPreview || brand?.logo} 
                                        alt="Brand logo preview" 
                                        className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveLogo}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400">
                                    No Logo
                                </div>
                            )}
                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Recommended: Square image, max 5MB
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                                Brand Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleNameChange}
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter brand name"
                            />
                        </div>

                        <div>
                            <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-1">
                                Slug
                            </label>
                            <input
                                type="text"
                                id="slug"
                                name="slug"
                                value={formData.slug}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="brand-slug"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
                            Website
                        </label>
                        <input
                            type="url"
                            id="website"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com"
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
                            placeholder="Enter brand description"
                        />
                    </div>

                    {/* SEO Fields */}
                    <div className="border-t border-slate-200 pt-6">
                        <h3 className="text-lg font-medium text-slate-800 mb-4">SEO Settings</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="metaTitle" className="block text-sm font-medium text-slate-700 mb-1">
                                    Meta Title
                                </label>
                                <input
                                    type="text"
                                    id="metaTitle"
                                    name="metaTitle"
                                    value={formData.metaTitle}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Meta title for SEO"
                                />
                            </div>

                            <div>
                                <label htmlFor="metaDescription" className="block text-sm font-medium text-slate-700 mb-1">
                                    Meta Description
                                </label>
                                <textarea
                                    id="metaDescription"
                                    name="metaDescription"
                                    value={formData.metaDescription}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Meta description for SEO"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        />
                        <label htmlFor="isActive" className="ml-2 block text-sm text-slate-700">
                            Active Brand
                        </label>
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
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (brand ? 'Update Brand' : 'Create Brand')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BrandEditModal;