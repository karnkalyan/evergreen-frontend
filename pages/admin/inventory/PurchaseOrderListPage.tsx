import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MOCK_PURCHASE_ORDERS, MOCK_SUPPLIERS } from '../../../data/mockData';
import { PurchaseOrder } from '../../../types';
import Button from '../../../components/shared/Button';
import { toast } from 'react-hot-toast';
import TableControls from '../../../components/admin/TableControls';
import AdminPagination from '../../../components/admin/AdminPagination';

const getStatusClasses = (status: PurchaseOrder['status']) => {
  switch (status) {
    case 'Received': return 'bg-green-100 text-green-800';
    case 'Pending': return 'bg-yellow-100 text-yellow-800';
    case 'Cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-slate-100 text-slate-800';
  }
};

const PurchaseOrderListPage: React.FC = () => {
    const navigate = useNavigate();
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const ITEMS_PER_PAGE = 10;
    
    const handleDelete = (id: string) => {
        toast((t) => (
            <div className="p-4 bg-white rounded-lg shadow-lg">
                <p className="text-center text-sm text-slate-700 mb-4">Are you sure you want to delete this purchase order?</p>
                <div className="flex justify-center space-x-3">
                    <Button variant="secondary" size="sm" onClick={() => toast.dismiss(t.id)}>Cancel</Button>
                    <Button variant="danger" size="sm" onClick={() => {
                        setPurchaseOrders(prev => prev.filter(po => po.id !== id));
                        toast.dismiss(t.id);
                        toast.success("Purchase Order deleted.");
                    }}>Delete</Button>
                </div>
            </div>
        ), { duration: Infinity, position: 'top-center' });
    }

    const filteredPOs = useMemo(() => {
        if (!searchTerm) return purchaseOrders;
        const lowercasedQuery = searchTerm.toLowerCase();
        return purchaseOrders.filter(po =>
            po.id.toLowerCase().includes(lowercasedQuery) ||
            (MOCK_SUPPLIERS.find(s => s.id === po.supplierId)?.name || '').toLowerCase().includes(lowercasedQuery) ||
            po.status.toLowerCase().includes(lowercasedQuery)
        );
    }, [purchaseOrders, searchTerm]);

    const paginatedPOs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredPOs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredPOs, currentPage]);

    const totalPages = Math.ceil(filteredPOs.length / ITEMS_PER_PAGE);

    const columnsForExport = [
        { Header: 'PO ID', accessor: 'id' },
        { Header: 'Supplier', accessor: (row: PurchaseOrder) => MOCK_SUPPLIERS.find(s => s.id === row.supplierId)?.name || 'Unknown' },
        { Header: 'Date', accessor: 'date' },
        { Header: 'Status', accessor: 'status' },
        { Header: 'Total Cost', accessor: 'totalCost' },
    ];

    return (
       <div>
            <TableControls
                title="Purchase Orders"
                onSearch={setSearchTerm}
                exportData={filteredPOs}
                exportColumns={columnsForExport}
                actionButton={<Button onClick={() => navigate('/admin/inventory/purchases/new')}>Create New PO</Button>}
            />
            <div className="bg-white rounded-xl shadow-soft-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-semibold text-slate-500 uppercase border-b bg-slate-50">
                                <th className="p-4">PO ID</th>
                                <th className="p-4">Supplier</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Total Cost</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {paginatedPOs.map(po => (
                                <tr key={po.id} className="border-b last:border-0 text-slate-700 hover:bg-slate-50/70">
                                    <td className="p-4 font-semibold">
                                        <Link to={`/admin/inventory/purchases/${po.id}`} className="text-primaryEnd hover:underline">
                                            {po.id}
                                        </Link>
                                    </td>
                                    <td className="p-4">{MOCK_SUPPLIERS.find(s => s.id === po.supplierId)?.name || 'Unknown'}</td>
                                    <td className="p-4">{new Date(po.date).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses(po.status)}`}>
                                            {po.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-semibold">${po.totalCost.toFixed(2)}</td>
                                    <td className="p-4">
                                        <div className="flex space-x-2">
                                            <Link to={`/admin/inventory/purchases/edit/${po.id}`} className="text-slate-500 hover:text-primaryEnd p-1.5 rounded-md hover:bg-slate-100 text-xs font-semibold">Edit</Link>
                                            <button onClick={() => handleDelete(po.id)} className="text-slate-500 hover:text-coral p-1.5 rounded-md hover:bg-slate-100 text-xs font-semibold">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {totalPages > 1 && (
                <div className="mt-6">
                    <AdminPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}
       </div>
    );
};

export default PurchaseOrderListPage;