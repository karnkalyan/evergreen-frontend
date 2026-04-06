import React, { useState, useMemo, useEffect } from 'react';
import { Brand } from '../../types';
import Button from '../../components/shared/Button';
import BrandEditModal from '../../components/admin/BrandEditModal';
import { toast } from 'react-hot-toast';
import TableControls from '../../components/admin/TableControls';
import AdminPagination from '../../components/admin/AdminPagination';
import { brandService } from '../../lib/brandService';

const BrandListPage: React.FC = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const ITEMS_PER_PAGE = 10;

    // Fetch brands from API
    const fetchBrands = async () => {
        try {
            setLoading(true);
            const brandsData = await brandService.getBrands();
            console.log('📊 BRANDS DATA IN COMPONENT:', brandsData);
            setBrands(brandsData);
        } catch (error) {
            console.error('Error fetching brands:', error);
            toast.error('Failed to load brands');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand);
        setModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingBrand(null);
        setModalOpen(true);
    };

 const handleSave = async (brandData: any, logoFile?: File | null, removeLogo?: boolean) => {
    try {
        const formData = new FormData();
        
        // Append all brand data
        Object.keys(brandData).forEach(key => {
            if (brandData[key] !== undefined && brandData[key] !== null) {
                formData.append(key, brandData[key].toString());
            }
        });

        // Append logo file if provided
        if (logoFile) {
            formData.append('logo', logoFile);
        }

        // Append removeLogo flag if needed
        if (removeLogo) {
            formData.append('removeLogo', 'true');
        }

        if (editingBrand) {
            // Update existing brand
            await brandService.updateBrand(editingBrand.id, formData);
            toast.success('Brand updated successfully!');
        } else {
            // Create new brand
            await brandService.createBrand(formData);
            toast.success('Brand created successfully!');
        }
        
        setModalOpen(false);
        // Refresh brands list
        await fetchBrands();
    } catch (error: any) {
        console.error('Error saving brand:', error);
        
        // Extract the actual API error message from the error object
        // The error message now contains the API response message
        const errorMessage = error.message || 'Failed to save brand';
        
        toast.error(errorMessage);
    }
};

const handleDelete = async (id: number) => {
    toast(
        (t) => (
            <div className="p-4 bg-white rounded-lg shadow-lg">
                <p className="text-center text-sm text-slate-700 mb-4">
                    Are you sure you want to delete this brand?
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
                                await brandService.deleteBrand(id);
                                setBrands(prev => prev.filter(brand => brand.id !== id));
                                toast.dismiss(t.id);
                                toast.success("Brand deleted successfully.");
                            } catch (error: any) {
                                console.error('Error deleting brand:', error);
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

    // Helper function to get product count from brand
    const getProductCount = (brand: Brand): number => {
        if (brand._count?.products !== undefined) {
            return brand._count.products;
        }
        if (brand.productCount !== undefined) {
            return brand.productCount;
        }
        return 0;
    };

    const filteredBrands = useMemo(() => {
        const lowercasedQuery = searchTerm.toLowerCase();
        if (!lowercasedQuery) return brands;
        
        return brands.filter(b =>
            b.name.toLowerCase().includes(lowercasedQuery) ||
            b.slug.toLowerCase().includes(lowercasedQuery) ||
            b.description?.toLowerCase().includes(lowercasedQuery) ||
            b.website?.toLowerCase().includes(lowercasedQuery)
        );
    }, [brands, searchTerm]);

    const paginatedBrands = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredBrands.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredBrands, currentPage]);

    const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE);

    const columnsForExport = [
        { Header: 'ID', accessor: 'id' },
        { Header: 'Name', accessor: 'name' },
        { Header: 'Slug', accessor: 'slug' },
        { Header: 'Website', accessor: 'website' },
        { Header: 'Product Count', accessor: (row: Brand) => getProductCount(row) },
        { Header: 'Status', accessor: (row: Brand) => row.isActive ? 'Active' : 'Inactive' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading brands...</div>
            </div>
        );
    }

    return (
        <>
            <TableControls
                title="Brands"
                onSearch={setSearchTerm}
                exportData={filteredBrands}
                exportColumns={columnsForExport}
                actionButton={
                    <Button onClick={handleAddNew}>Add New Brand</Button>
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
                                <th className="p-4">Website</th>
                                <th className="p-4">Products</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {paginatedBrands.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">
                                        {searchTerm ? 'No brands found matching your search.' : 'No brands available.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedBrands.map(brand => {
                                    const productCount = getProductCount(brand);
                                    console.log(`📊 Brand "${brand.name}" product count:`, productCount, 'Full _count:', brand._count);
                                    
                                    return (
                                        <tr key={brand.id} className="border-b last:border-0 text-slate-700 hover:bg-slate-50/70">
                                            <td className="p-4">
                                                {brand.logo ? (
                                                    <img 
                                                        src={brand.logo} 
                                                        alt={brand.name}
                                                        className="w-10 h-10 object-cover rounded-lg bg-slate-100"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400">
                                                        {brand.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-semibold text-slate-800">{brand.name}</div>
                                                {brand.description && (
                                                    <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                                                        {brand.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <code className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                    {brand.slug}
                                                </code>
                                            </td>
                                            <td className="p-4">
                                                {brand.website ? (
                                                    <a 
                                                        href={brand.website} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-600 hover:text-blue-800 truncate max-w-[150px] block"
                                                    >
                                                        {brand.website}
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-slate-400">No website</span>
                                                )}
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
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    brand.isActive 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {brand.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex space-x-2">
                                                    <button 
                                                        onClick={() => handleEdit(brand)} 
                                                        className="text-slate-500 hover:text-primaryEnd p-1.5 rounded-md hover:bg-slate-100 text-xs font-semibold transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(brand.id)} 
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
                <BrandEditModal 
                    brand={editingBrand} 
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default BrandListPage;