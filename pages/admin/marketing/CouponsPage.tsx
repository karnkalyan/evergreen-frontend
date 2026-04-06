import React, { useState, useMemo, useEffect } from 'react';
import Button from '../../../components/shared/Button';
import { Coupon } from '../../../types';
import { ICONS } from '../../../constants';
import { toast } from 'react-hot-toast';
import CouponEditModal from '../../../components/admin/marketing/CouponEditModal';
import TableControls from '../../../components/admin/TableControls';
import AdminPagination from '../../../components/admin/AdminPagination';
import { couponService } from '../../../lib/couponService';

const CouponsPage: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });
    
    const ITEMS_PER_PAGE = 10;

    // Fetch coupons from API
    const fetchCoupons = async (page = 1, search = '') => {
        try {
            setLoading(true);
            const response = await couponService.getCoupons({
                page,
                limit: ITEMS_PER_PAGE,
                search: search || undefined
            });
            
            console.log('📊 FETCHED COUPONS RESPONSE:', response);
            
            setCoupons(response.coupons || []);
            
            // Set pagination data - ensure it always has the required structure
            if (response.pagination) {
                setPagination({
                    page: response.pagination.page || page,
                    limit: response.pagination.limit || ITEMS_PER_PAGE,
                    total: response.pagination.total || 0,
                    pages: response.pagination.pages || 1
                });
            } else {
                // Fallback if no pagination data
                setPagination({
                    page,
                    limit: ITEMS_PER_PAGE,
                    total: response.coupons?.length || 0,
                    pages: Math.ceil((response.coupons?.length || 0) / ITEMS_PER_PAGE)
                });
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
            toast.error('Failed to load coupons');
            setCoupons([]);
            setPagination({
                page: 1,
                limit: ITEMS_PER_PAGE,
                total: 0,
                pages: 0
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons(currentPage, searchTerm);
    }, [currentPage]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage === 1) {
                fetchCoupons(1, searchTerm);
            } else {
                setCurrentPage(1);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleAddNew = () => {
        setEditingCoupon(null);
        setIsModalOpen(true);
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setIsModalOpen(true);
    };

    const handleSave = async (couponData: any) => {
        try {
            if (editingCoupon) {
                // Update existing coupon
                const updatedCoupon = await couponService.updateCoupon(editingCoupon.id, couponData);
                setCoupons(prev => prev.map(c => c.id === updatedCoupon.id ? updatedCoupon : c));
                toast.success("Coupon updated successfully!");
            } else {
                // Create new coupon
                const newCoupon = await couponService.createCoupon(couponData);
                setCoupons(prev => [newCoupon, ...prev]);
                toast.success("Coupon created successfully!");
            }
            setIsModalOpen(false);
            await fetchCoupons(currentPage, searchTerm);
        } catch (error: any) {
            console.error('Error saving coupon:', error);
            toast.error(error.message || "Failed to save coupon");
        }
    };

    const handleDelete = async (id: number) => {
        toast((t) => (
            <div className="p-4 bg-white rounded-lg shadow-lg">
                <p className="text-center text-sm text-slate-700 mb-4">Are you sure you want to delete this coupon?</p>
                <div className="flex justify-center space-x-3">
                    <Button variant="secondary" size="sm" onClick={() => toast.dismiss(t.id)}>Cancel</Button>
                    <Button variant="danger" size="sm" onClick={async () => {
                        try {
                            await couponService.deleteCoupon(id);
                            setCoupons(prev => prev.filter(c => c.id !== id));
                            toast.dismiss(t.id);
                            toast.success("Coupon deleted successfully.");
                            await fetchCoupons(currentPage, searchTerm);
                        } catch (error: any) {
                            console.error('Error deleting coupon:', error);
                            toast.dismiss(t.id);
                            toast.error(error.message || "Failed to delete coupon");
                        }
                    }}>Delete</Button>
                </div>
            </div>
        ), { duration: Infinity, position: 'top-center' });
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const columnsForExport = useMemo(() => [
        { Header: 'Code', accessor: 'code' },
        { Header: 'Type', accessor: 'type' },
        { Header: 'Value', accessor: (row: Coupon) => row.type === 'Percentage' ? `${row.value}%` : `$${row.value.toFixed(2)}` },
        { Header: 'Uses', accessor: (row: Coupon) => `${row.usageCount} / ${row.usageLimit || 'Unlimited'}` },
        { Header: 'Status', accessor: 'status' },
        { Header: 'Start Date', accessor: (row: Coupon) => row.startDate ? new Date(row.startDate).toLocaleDateString() : 'Immediate' },
        { Header: 'End Date', accessor: (row: Coupon) => row.endDate ? new Date(row.endDate).toLocaleDateString() : 'No expiry' }
    ], []);

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            Active: { color: 'bg-green-100 text-green-800', label: 'Active' },
            Scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
            Expired: { color: 'bg-red-100 text-red-800', label: 'Expired' },
            Inactive: { color: 'bg-slate-100 text-slate-800', label: 'Inactive' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Inactive;
        
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    // Calculate total pages for pagination display
    const totalPages = pagination.pages > 0 ? pagination.pages : Math.ceil(pagination.total / ITEMS_PER_PAGE);

    if (loading && coupons.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading coupons...</div>
            </div>
        );
    }

    const getVisibilityBadge = (isPublic: boolean) => {
    const config = isPublic 
        ? { color: 'bg-blue-100 text-blue-800', label: 'Public' }
        : { color: 'bg-purple-100 text-purple-800', label: 'Private' };
    
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
            {config.label}
                    </span>
                );
            };

    return (
        <>
            <TableControls
                title="Coupons / Promo Codes"
                onSearch={handleSearch}
                exportData={coupons}
                exportColumns={columnsForExport}
                actionButton={<Button onClick={handleAddNew}>Add New Coupon</Button>}
            />
            
            <div className="bg-white rounded-xl shadow-soft-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-semibold text-slate-500 uppercase border-b bg-slate-50">
                                <th className="p-4">Code</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Value</th>
                                <th className="p-4">Uses</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Visibility</th>
                                <th className="p-4">Start Date</th>
                                <th className="p-4">End Date</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-slate-500">
                                        {searchTerm ? 'No coupons found matching your search.' : 'No coupons available.'}
                                    </td>
                                </tr>
                            ) : (
                                coupons.map(coupon => (
                                    <tr key={coupon.id} className="border-b last:border-0 text-slate-700 hover:bg-slate-50/70">
                                        <td className="p-4 font-semibold font-mono text-slate-800">{coupon.code}</td>
                                        <td className="p-4">{coupon.type}</td>
                                        <td className="p-4">
                                            {coupon.type === 'Percentage' 
                                                ? `${coupon.value}%` 
                                                : `$${coupon.value.toFixed(2)}`
                                            }
                                        </td>
                                        <td className="p-4">
                                            {`${coupon.usageCount} / ${coupon.usageLimit || '∞'}`}
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(coupon.status)}
                                        </td>
                                        <td className="p-4">
                                            {getVisibilityBadge(coupon.isPublic)}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {coupon.startDate 
                                                ? new Date(coupon.startDate).toLocaleDateString()
                                                : 'Immediate'
                                            }
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {coupon.endDate 
                                                ? new Date(coupon.endDate).toLocaleDateString()
                                                : 'No expiry'
                                            }
                                        </td>
                                        <td className="p-4">
                                            <div className="flex space-x-1">
                                                <button 
                                                    onClick={() => handleEdit(coupon)} 
                                                    className="p-2 text-slate-500 hover:text-primaryEnd rounded-md hover:bg-slate-100"
                                                    title="Edit coupon"
                                                >
                                                    {React.cloneElement(ICONS.edit, { className: 'w-4 h-4'})}
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(coupon.id)} 
                                                    className="p-2 text-slate-500 hover:text-coral rounded-md hover:bg-slate-100"
                                                    title="Delete coupon"
                                                >
                                                    {React.cloneElement(ICONS.trash, { className: 'w-4 h-4'})}
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

            {/* FIXED PAGINATION - Always show if there are multiple pages */}
            {totalPages > 1 && (
                <div className="mt-6">
                    <AdminPagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={handlePageChange} 
                    />
                </div>
            )}

            {isModalOpen && (
                <CouponEditModal 
                    coupon={editingCoupon}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default CouponsPage;