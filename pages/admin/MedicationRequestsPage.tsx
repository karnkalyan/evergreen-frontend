import React, { useState, useEffect } from 'react';
import { MedicationRequest, MedicationRequestStats } from '../../types';
import { medicationRequestService } from '../../lib/medicationRequestService';
import Button from '../../components/shared/Button';
import TableControls from '../../components/admin/TableControls';
import AdminPagination from '../../components/admin/AdminPagination';
import { toast } from 'react-hot-toast';
import { Search, Filter, Calendar, User, Mail, Phone, Package } from 'lucide-react';

const MedicationRequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<MedicationRequest[]>([]);
    const [stats, setStats] = useState<MedicationRequestStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const ITEMS_PER_PAGE = 10;
        const [pagination, setPagination] = useState({
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
        });

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await medicationRequestService.getMedicationRequests({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                status: statusFilter === 'ALL' ? undefined : statusFilter,
                search: searchTerm || undefined
            });
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching medication requests:', error);
            toast.error('Failed to load medication requests');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const statsData = await medicationRequestService.getMedicationRequestStats();
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchStats();
    }, [currentPage, statusFilter]);

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            if (currentPage === 1) {
                fetchRequests();
            } else {
                setCurrentPage(1);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleStatusUpdate = async (id: number, newStatus: string) => {
        try {
            await medicationRequestService.updateMedicationRequest(id, newStatus);
            toast.success('Status updated successfully');
            fetchRequests();
            fetchStats();
        } catch (error: any) {
            console.error('Error updating status:', error);
            toast.error(error.message || 'Failed to update status');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this medication request?')) {
            try {
                await medicationRequestService.deleteMedicationRequest(id);
                toast.success('Medication request deleted successfully');
                fetchRequests();
                fetchStats();
            } catch (error: any) {
                console.error('Error deleting request:', error);
                toast.error(error.message || 'Failed to delete request');
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'PROCESSING':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Pending';
            case 'PROCESSING': return 'Processing';
            case 'COMPLETED': return 'Completed';
            case 'CANCELLED': return 'Cancelled';
            default: return status;
        }
    };

    const columnsForExport = [
        { Header: 'ID', accessor: 'id' },
        { Header: 'Name', accessor: 'name' },
        { Header: 'Email', accessor: 'email' },
        { Header: 'Phone', accessor: 'phone' },
        { Header: 'Medicine Name', accessor: 'medicineName' },
        { Header: 'Message', accessor: 'message' },
        { Header: 'Status', accessor: 'status' },
        { Header: 'Created At', accessor: (row: MedicationRequest) => new Date(row.createdAt).toLocaleDateString() },
    ];

        const totalPages = pagination.pages > 0 ? pagination.pages : Math.ceil(pagination.total / ITEMS_PER_PAGE);



    if (loading && requests.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading medication requests...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-soft-md p-6 border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total Requests</p>
                                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-soft-md p-6 border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-soft-md p-6 border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Processing</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {stats.byStatus.find(s => s.status === 'PROCESSING')?._count.id || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Filter className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-soft-md p-6 border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Completed</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {stats.byStatus.find(s => s.status === 'COMPLETED')?._count.id || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Package className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <TableControls
                title="Medication Requests"
                onSearch={setSearchTerm}
                exportData={requests}
                exportColumns={columnsForExport}
                showFilters={true}
                filters={
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                }
            />
            
            <div className="bg-white rounded-xl shadow-soft-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-semibold text-slate-500 uppercase border-b bg-slate-50">
                                <th className="p-4">Customer</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Medicine</th>
                                <th className="p-4">Message</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Created</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">
                                        {searchTerm || statusFilter !== 'ALL' 
                                            ? 'No medication requests found matching your criteria.' 
                                            : 'No medication requests available.'}
                                    </td>
                                </tr>
                            ) : (
                                requests.map((request) => (
                                    <tr key={request.id} className="border-b last:border-0 text-slate-700 hover:bg-slate-50/70">
                                        <td className="p-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-primary-gradient rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                    {request.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-800">{request.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2 text-slate-600">
                                                    <Mail className="w-4 h-4" />
                                                    <span className="text-xs">{request.email}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-slate-600">
                                                    <Phone className="w-4 h-4" />
                                                    <span className="text-xs">{request.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-slate-800">{request.medicineName}</div>
                                        </td>
                                        <td className="p-4 max-w-xs">
                                            {request.message ? (
                                                <div className="text-slate-600 text-sm line-clamp-2">
                                                    {request.message}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-sm">No message</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={request.status}
                                                onChange={(e) => handleStatusUpdate(request.id, e.target.value)}
                                                className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${getStatusColor(request.status)}`}
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="PROCESSING">Processing</option>
                                                <option value="COMPLETED">Completed</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-xs text-slate-500">
                                                {new Date(request.createdAt).toLocaleDateString()}
                                                <br />
                                                <span className="text-slate-400">
                                                    {new Date(request.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => handleDelete(request.id)} 
                                                    className="text-slate-500 hover:text-coral p-1.5 rounded-md hover:bg-slate-100 text-xs font-semibold transition-colors"
                                                >
                                                    Delete
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
        </div>
    );
};

export default MedicationRequestsPage;