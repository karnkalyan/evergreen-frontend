import React, { useState, useEffect } from 'react';
import { Category } from '../../types';
import Button from '../shared/Button';
import { ICONS } from '../../constants';
import { toast } from 'react-hot-toast';
import SingleImageUploader from '../shared/SingleImageUploader';

interface CategoryEditModalProps {
    category?: Category | null;
    onClose: () => void;
    onSave: (categoryData: any, logoFile?: File | null, removeLogo?: boolean) => void;
}

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({ category, onClose, onSave }) => {
    const isEditing = Boolean(category);
    const [name, setName] = useState(category?.name || '');
    const [slug, setSlug] = useState(category?.slug || '');
    const [description, setDescription] = useState(category?.description || '');
    const [catColor, setCatColor] = useState(category?.catColor || '#3B82F6');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [removeLogo, setRemoveLogo] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim() || !slug.trim()) {
            toast.error('Name and Slug are required');
            return;
        }

        setLoading(true);

        try {
            const categoryData = {
                name: name.trim(),
                slug: slug.trim(),
                description: description.trim(),
                catColor: catColor !== '#3B82F6' ? catColor : undefined,
                ...(isEditing && { removeLogo: removeLogo && !logoFile })
            };

            onSave(categoryData, logoFile, removeLogo && !logoFile);
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (file: File | null) => {
        setLogoFile(file);
        // If user selects a new file, don't remove the existing logo
        if (file) {
            setRemoveLogo(false);
        }
    };

    // Auto-generate slug from name
    useEffect(() => {
        if (!isEditing && name && !slug) {
            const generatedSlug = name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setSlug(generatedSlug);
        }
    }, [name, isEditing, slug]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-poppins font-bold text-slate-800">
                            {isEditing ? 'Edit Category' : 'Add New Category'}
                        </h2>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Category Name *
                            </label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                                required
                                placeholder="Enter category name"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Slug *
                            </label>
                            <input 
                                type="text" 
                                value={slug} 
                                onChange={e => setSlug(e.target.value)} 
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-mono" 
                                required
                                placeholder="category-slug"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                URL-friendly version of the name
                            </p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Description
                            </label>
                            <textarea 
                                value={description} 
                                onChange={e => setDescription(e.target.value)} 
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm resize-none" 
                                rows={3}
                                placeholder="Enter category description (optional)"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Category Color
                            </label>
                            <div className="flex items-center gap-3">
                                <input 
                                    type="color" 
                                    value={catColor} 
                                    onChange={e => setCatColor(e.target.value)} 
                                    className="w-12 h-12 rounded-lg border border-slate-300 cursor-pointer" 
                                />
                                <div className="flex-1">
                                    <input 
                                        type="text" 
                                        value={catColor} 
                                        onChange={e => setCatColor(e.target.value)} 
                                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-mono" 
                                        placeholder="#3B82F6"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Category Logo
                            </label>
                            <SingleImageUploader 
                                onFileChange={handleFileChange}
                                initialImage={category?.catLogo}
                            />
                            
                            {isEditing && category?.catLogo && (
                                <div className="mt-2 flex items-center">
                                    <input
                                        type="checkbox"
                                        id="removeLogo"
                                        checked={removeLogo}
                                        onChange={(e) => setRemoveLogo(e.target.checked)}
                                        className="w-4 h-4 text-primaryEnd border-slate-300 rounded focus:ring-primaryEnd"
                                    />
                                    <label htmlFor="removeLogo" className="ml-2 text-sm text-slate-700">
                                        Remove current logo
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="p-6 bg-slate-50 rounded-b-2xl flex justify-end space-x-3">
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
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Category')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryEditModal;