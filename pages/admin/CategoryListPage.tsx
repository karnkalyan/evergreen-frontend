import React, { useState, useMemo, useEffect } from 'react';
import { Category } from '../../types';
import Button from '../../components/shared/Button';
import CategoryEditModal from '../../components/admin/CategoryEditModal';
import { toast } from 'react-hot-toast';
import TableControls from '../../components/admin/TableControls';
import AdminPagination from '../../components/admin/AdminPagination';
import { categoryService } from '../../lib/categoryService';

const CategoryListPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const ITEMS_PER_PAGE = 10;

    // Fetch categories from API
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const categoriesData = await categoryService.getCategories();
            console.log('📊 CATEGORIES DATA IN COMPONENT:', categoriesData); // Debug log
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingCategory(null);
        setModalOpen(true);
    };

    const handleSave = async (categoryData: any, logoFile?: File | null, removeLogo?: boolean) => {
        try {
            const formData = new FormData();
            
            // Append all category data
            Object.keys(categoryData).forEach(key => {
                if (categoryData[key] !== undefined) {
                    formData.append(key, categoryData[key]);
                }
            });

            // Append logo file if provided
            if (logoFile) {
                formData.append('catLogo', logoFile);
            }

            // Append removeLogo flag if needed
            if (removeLogo) {
                formData.append('removeLogo', 'true');
            }

            if (editingCategory) {
                // Update existing category
                await categoryService.updateCategory(editingCategory.id, formData);
                toast.success('Category updated successfully!');
            } else {
                // Create new category
                await categoryService.createCategory(formData);
                toast.success('Category created successfully!');
            }
            
            setModalOpen(false);
            // Refresh categories list
            await fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Failed to save category');
        }
    };

    const handleDelete = async (id: number) => {
        toast(
            (t) => (
                <div className="p-4 bg-white rounded-lg shadow-lg">
                    <p className="text-center text-sm text-slate-700 mb-4">
                        Are you sure you want to delete this category?
                    </p>
                    <div className="flex justify-center space-x-3">
                        <Button variant="secondary" size="sm" onClick={() => toast.dismiss(t.id)}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={async () => {
                                try {
                                    await categoryService.deleteCategory(id);
                                    setCategories(prev => prev.filter(cat => cat.id !== id));
                                    toast.dismiss(t.id);
                                    toast.success("Category deleted successfully.");
                                } catch (error) {
                                    console.error('Error deleting category:', error);
                                     const errorMessage = error.message || "Failed to delete brand.";
                                                                    toast.dismiss(t.id);
                                                                    toast.error(errorMessage);
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            ),
            { duration: Infinity, position: 'top-center' }
        );
    };

    // Helper function to get product count from category
    const getProductCount = (category: Category): number => {
        // Check _count.products first, then fallback to other possible locations
        if (category._count?.products !== undefined) {
            return category._count.products;
        }
        if (category.productCount !== undefined) {
            return category.productCount;
        }
        return 0;
    };

    const filteredCategories = useMemo(() => {
        const lowercasedQuery = searchTerm.toLowerCase();
        if (!lowercasedQuery) return categories;
        
        return categories.filter(c =>
            c.name.toLowerCase().includes(lowercasedQuery) ||
            c.slug.toLowerCase().includes(lowercasedQuery) ||
            c.description?.toLowerCase().includes(lowercasedQuery)
        );
    }, [categories, searchTerm]);

    const paginatedCategories = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredCategories, currentPage]);

    const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);

    const columnsForExport = [
        { Header: 'ID', accessor: 'id' },
        { Header: 'Name', accessor: 'name' },
        { Header: 'Slug', accessor: 'slug' },
        { Header: 'Product Count', accessor: (row: Category) => getProductCount(row) },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading categories...</div>
            </div>
        );
    }

    return (
        <>
            <TableControls
                title="Categories"
                onSearch={setSearchTerm}
                exportData={filteredCategories}
                exportColumns={columnsForExport}
                actionButton={
                    <Button onClick={handleAddNew}>Add New Category</Button>
                }
            />
            
            <div className="bg-white rounded-xl shadow-soft-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-semibold text-slate-500 uppercase border-b bg-slate-50">
                                <th className="p-4">Logo</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Slug</th>
                                <th className="p-4">Products</th>
                                <th className="p-4">Color</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {paginatedCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        {searchTerm ? 'No categories found matching your search.' : 'No categories available.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedCategories.map(category => {
                                    const productCount = getProductCount(category);
                                    console.log(`📊 Category "${category.name}" product count:`, productCount, 'Full _count:', category._count); // Debug log
                                    
                                    return (
                                        <tr key={category.id} className="border-b last:border-0 text-slate-700 hover:bg-slate-50/70">
                                            <td className="p-4">
                                                {category.catLogo ? (
                                                    <img 
                                                        src={category.catLogo} 
                                                        alt={category.name}
                                                        className="w-10 h-10 object-cover rounded-lg bg-slate-100"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                                        }}
                                                    />
                                                ) : (
                                                    <div 
                                                        className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400"
                                                        style={{ backgroundColor: category.catColor || '#f1f5f9' }}
                                                    >
                                                        {category.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-semibold text-slate-800">{category.name}</div>
                                                {category.description && (
                                                    <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                                                        {category.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <code className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                    {category.slug}
                                                </code>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    productCount > 0 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-slate-100 text-slate-800'
                                                }`}>
                                                    {productCount} {productCount === 1 ? 'product' : 'products'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {category.catColor && (
                                                    <div className="flex items-center gap-2">
                                                        <div 
                                                            className="w-6 h-6 rounded border border-slate-300"
                                                            style={{ backgroundColor: category.catColor }}
                                                        />
                                                        <span className="text-xs text-slate-500 font-mono">
                                                            {category.catColor}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex space-x-2">
                                                    <button 
                                                        onClick={() => handleEdit(category)} 
                                                        className="text-slate-500 hover:text-primaryEnd p-1.5 rounded-md hover:bg-slate-100 text-xs font-semibold transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(category.id)} 
                                                        className="text-slate-500 hover:text-coral p-1.5 rounded-md hover:bg-slate-100 text-xs font-semibold transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="mt-6">
                    <AdminPagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={setCurrentPage} 
                    />
                </div>
            )}
            
            {isModalOpen && (
                <CategoryEditModal 
                    category={editingCategory} 
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default CategoryListPage;