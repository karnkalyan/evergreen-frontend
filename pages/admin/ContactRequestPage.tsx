// src/components/admin/ContactRequestsPage.tsx
import React, { useState, useEffect } from 'react';
import { ContactRequest, ContactRequestStats } from '../../types';
import { contactRequestService } from '../../lib/contactService';
import Button from '../../components/shared/Button';
import TableControls from '../../components/admin/TableControls';
import AdminPagination from '../../components/admin/AdminPagination';
import { toast } from 'react-hot-toast';
import { Search, Filter, Calendar, User, Mail, Phone, MessageSquare, Eye, X } from 'lucide-react';

const ContactRequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<ContactRequest[]>([]);
    const [stats, setStats] = useState<ContactRequestStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedMessage, setSelectedMessage] = useState<ContactRequest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
            const response = await contactRequestService.getContactRequests({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                status: statusFilter === 'ALL' ? undefined : statusFilter,
                search: searchTerm || undefined
            });
            setRequests(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Error fetching contact requests:', error);
            toast.error('Failed to load contact requests');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const statsData = await contactRequestService.getContactRequestStats();
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
            await contactRequestService.updateContactRequest(id, newStatus);
            toast.success('Status updated successfully');
            fetchRequests();
            fetchStats();
        } catch (error: any) {
            console.error('Error updating status:', error);
            toast.error(error.message || 'Failed to update status');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this contact request?')) {
            try {
                await contactRequestService.deleteContactRequest(id);
                toast.success('Contact request deleted successfully');
                fetchRequests();
                fetchStats();
            } catch (error: any) {
                console.error('Error deleting request:', error);
                toast.error(error.message || 'Failed to delete request');
            }
        }
    };

    const handleViewMessage = (request: ContactRequest) => {
        setSelectedMessage(request);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMessage(null);
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

    const formatMessage = (message: string) => {
        if (message.length > 100) {
            return message.substring(0, 100) + '...';
        }
        return message;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const columnsForExport = [
        { Header: 'ID', accessor: 'id' },
        { Header: 'Name', accessor: 'name' },
        { Header: 'Email', accessor: 'email' },
        { Header: 'Phone', accessor: 'phone' },
        { Header: 'Subject', accessor: 'subject' },
        { Header: 'Message', accessor: 'message' },
        { Header: 'Status', accessor: 'status' },
        { Header: 'Created At', accessor: (row: ContactRequest) => new Date(row.createdAt).toLocaleDateString() },
    ];

    const totalPages = pagination.pages > 0 ? pagination.pages : Math.ceil(pagination.total / ITEMS_PER_PAGE);

    if (loading && requests.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading contact requests...</div>
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
                                <MessageSquare className="w-6 h-6 text-blue-600" />
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
                                    {stats.byStatus.find(s => s.status === 'PROCESSING')?._count?.id || 0}
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
                                <p className="text-sm font-medium text-slate-600">Today</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {stats.todayRequests || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <MessageSquare className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <TableControls
                title="Contact Requests"
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
                                <th className="p-4">Contact</th>
                                <th className="p-4">Subject</th>
                                <th className="p-4">Message</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Created</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        {searchTerm || statusFilter !== 'ALL' 
                                            ? 'No contact requests found matching your criteria.' 
                                            : 'No contact requests available.'}
                                    </td>
                                </tr>
                            ) : (
                                requests.map((request) => (
                                    <tr key={request.id} className="border-b last:border-0 text-slate-700 hover:bg-slate-50/70">
                                        <td className="p-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-primary-gradient rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                        {request.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-800">{request.name}</div>
                                                    </div>
                                                </div>
                                                <div className="space-y-1 pl-11">
                                                    <div className="flex items-center space-x-2 text-slate-600">
                                                        <Mail className="w-4 h-4" />
                                                        <span className="text-xs">{request.email}</span>
                                                    </div>
                                                    {request.phone && (
                                                        <div className="flex items-center space-x-2 text-slate-600">
                                                            <Phone className="w-4 h-4" />
                                                            <span className="text-xs">{request.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-slate-800 max-w-xs">
                                                {request.subject}
                                            </div>
                                        </td>
                                        <td className="p-4 max-w-xs">
                                            <div className="flex items-start justify-between">
                                                <div className="text-slate-600 text-sm line-clamp-3 flex-1">
                                                    {formatMessage(request.message)}
                                                </div>
                                                {request.message.length > 100 && (
                                                    <button
                                                        onClick={() => handleViewMessage(request)}
                                                        className="ml-2 text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                                                        title="View full message"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
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
                                                    onClick={() => handleViewMessage(request)}
                                                    className="text-blue-600 hover:text-blue-800 p-1.5 rounded-md hover:bg-blue-50 text-xs font-semibold transition-colors flex items-center space-x-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span>View</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(request.id)} 
                                                    className="text-red-600 hover:text-red-800 p-1.5 rounded-md hover:bg-red-50 text-xs font-semibold transition-colors"
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

            {/* Message View Modal */}
            {isModalOpen && selectedMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-soft-md max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">
                                    {selectedMessage.subject}
                                </h3>
                                <p className="text-sm text-slate-600 mt-1">
                                    From: {selectedMessage.name} • {selectedMessage.email}
                                    {selectedMessage.phone && ` • ${selectedMessage.phone}`}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Ticket: {selectedMessage.ticketNumber} • {formatDate(selectedMessage.createdAt)}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto max-h-96">
                            <div className="bg-slate-50 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-slate-700 mb-3">Message:</h4>
                                <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {selectedMessage.message}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium text-slate-700">Status:</span>
                                <select
                                    value={selectedMessage.status}
                                    onChange={(e) => {
                                        handleStatusUpdate(selectedMessage.id, e.target.value);
                                        setSelectedMessage({
                                            ...selectedMessage,
                                            status: e.target.value
                                        });
                                    }}
                                    className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${getStatusColor(selectedMessage.status)}`}
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="PROCESSING">Processing</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                            <Button
                                onClick={closeModal}
                                variant="outline"
                                size="sm"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactRequestsPage;