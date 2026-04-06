import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../lib/orderService';
import { Order } from '../../types';
import TableControls from '../../components/admin/TableControls';
import AdminPagination from '../../components/admin/AdminPagination';
import { toast } from 'react-hot-toast';

const getStatusClasses = (status: string) => {
  switch (status) {
    case 'delivered': 
    case 'completed': 
      return 'bg-green-100 text-green-800';
    case 'shipped': 
      return 'bg-blue-100 text-blue-800';
    case 'processing': 
    case 'confirmed': 
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled': 
    case 'refunded': 
      return 'bg-red-100 text-red-800';
    case 'pending': 
    case 'pending_payment': 
      return 'bg-orange-100 text-orange-800';
    default: 
      return 'bg-slate-100 text-slate-800';
  }
};

const getPaymentStatusClasses = (status: string) => {
  switch (status) {
    case 'paid': 
      return 'bg-green-100 text-green-800';
    case 'failed': 
      return 'bg-red-100 text-red-800';
    case 'refunded': 
    case 'partially_refunded': 
      return 'bg-purple-100 text-purple-800';
    case 'pending': 
      return 'bg-orange-100 text-orange-800';
    default: 
      return 'bg-slate-100 text-slate-800';
  }
};

const currencySymbols: { [key: string]: string } = {
  USD: '$',
  GBP: '£',
  EUR: '€',
};

const OrderListPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const ITEMS_PER_PAGE = 10;

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: statusFilter || undefined,
        search: searchTerm || undefined
      });
      
      setOrders(response.orders);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  // Search handler
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    // Debounced search would be better here
  };

  // Status filter handler
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    
    const lowercasedQuery = searchTerm.toLowerCase();
    return orders.filter(order =>
      order.orderNumber.toLowerCase().includes(lowercasedQuery) ||
      (order.user?.firstName?.toLowerCase().includes(lowercasedQuery)) ||
      (order.user?.lastName?.toLowerCase().includes(lowercasedQuery)) ||
      (order.user?.email?.toLowerCase().includes(lowercasedQuery)) ||
      order.status.toLowerCase().includes(lowercasedQuery) ||
      order.paymentStatus.toLowerCase().includes(lowercasedQuery)
    );
  }, [orders, searchTerm]);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const paymentStatusOptions = [
    { value: '', label: 'All Payments' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
  ];

  const columnsForExport = [
    { Header: 'Order Number', accessor: 'orderNumber' },
    { Header: 'Customer', accessor: (row: Order) => `${row.user?.firstName} ${row.user?.lastName}` },
    { Header: 'Email', accessor: (row: Order) => row.user?.email },
    { Header: 'Date', accessor: 'orderDate' },
    { Header: 'Status', accessor: 'status' },
    { Header: 'Payment Status', accessor: 'paymentStatus' },
    { Header: 'Total', accessor: 'totalAmount' },
    { Header: 'Currency', accessor: 'currency' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <TableControls
        title="Sales Orders"
        onSearch={handleSearch}
        exportData={filteredOrders}
        exportColumns={columnsForExport}
        filters={
          <div className="flex gap-4">
            <select 
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="bg-white rounded-xl shadow-soft-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold text-slate-500 uppercase border-b bg-slate-50">
                <th className="p-4">Order Number</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const currencySymbol = currencySymbols[order.currency] || '$';
                  const customerName = order.user ? 
                    `${order.user.firstName} ${order.user.lastName}` : 
                    'Unknown Customer';
                  
                  return (
                    <tr key={order.id} className="border-b last:border-0 text-slate-700 hover:bg-slate-50/70">
                      <td className="p-4">
                        <Link 
                          to={`/admin/orders/${order.id}`} 
                          className="text-primaryEnd hover:underline font-semibold"
                        >
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-semibold">{customerName}</div>
                          <div className="text-xs text-slate-500">{order.user?.email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses(order.status)}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusClasses(order.paymentStatus)}`}>
                          {order.paymentStatus.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right font-semibold">
                        {currencySymbol}{order.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.pages > 1 && (
        <div className="mt-6">
          <AdminPagination 
            currentPage={currentPage} 
            totalPages={pagination.pages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      )}
    </div>
  );
};

export default OrderListPage;