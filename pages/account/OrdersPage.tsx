// OrderHistoryPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../../types';
import { orderService } from '../../lib/orderService';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/shared/Button';
import { toast } from 'react-hot-toast';

const getStatusClasses = (status: Order['status']) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'shipped':
      return 'bg-blue-100 text-blue-800';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'confirmed':
      return 'bg-purple-100 text-purple-800';
    case 'pending':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

const getStatusDisplayText = (status: Order['status']) => {
  switch (status) {
    case 'pending': return 'Pending';
    case 'confirmed': return 'Confirmed';
    case 'processing': return 'Processing';
    case 'shipped': return 'Shipped';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    case 'refunded': return 'Refunded';
    case 'failed': return 'Failed';
    default: return status;
  }
};

const currencySymbols: { [key: string]: string } = {
  USD: '$',
  GBP: '£',
};

const OrderHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await orderService.getUserOrders(user.id, {
          page: pagination.page,
          limit: pagination.limit
        });
        
        setOrders(response.orders);
        setPagination(response.pagination);
      } catch (error) {
        console.error('Error loading orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user, pagination.page]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-serif font-bold text-slate-900 mb-6">My Orders</h1>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-6 bg-slate-200 rounded w-1/6"></div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-slate-200 rounded w-20"></div>
                    <div className="h-8 bg-slate-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-slate-400">📦</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-700 mb-2">No orders yet</h2>
            <p className="text-slate-500 mb-6">When you place orders, they will appear here.</p>
            <Link to="/products">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => {
              const currencySymbol = currencySymbols[order.currency] || '$';
              const firstImage = order.orderItems[0]?.productSnapshot?.images?.[0]?.url || 
                               order.orderItems[0]?.product?.images?.[0]?.url;

              return (
                <div key={order.id} className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-sm transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-200 pb-4 mb-4">
                    <div>
                      <h2 className="font-bold text-lg text-slate-800">
                        Order #: {order.orderNumber}
                      </h2>
                      <p className="text-sm text-slate-500">
                        Placed on: {formatDate(order.orderDate || order.createdAt)}
                      </p>
                    </div>
                    <div className={`text-sm font-semibold px-3 py-1 rounded-full mt-2 sm:mt-0 ${getStatusClasses(order.status)}`}>
                      {getStatusDisplayText(order.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex -space-x-4">
                      {order.orderItems.slice(0, 3).map((item, index) => {
                        const imageUrl = item.productSnapshot?.images?.[0]?.url || 
                                       item.product?.images?.[0]?.url;
                        return (
                          <div key={index} className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center overflow-hidden">
                            {imageUrl ? (
                              <img 
                                src={imageUrl} 
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-slate-400">📦</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {order.orderItems.length > 3 && (
                      <span className="ml-2 text-sm text-slate-500">
                        +{order.orderItems.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <p className="font-bold text-xl text-slate-900">
                      Total: {currencySymbol}{order.totalAmount.toFixed(2)}
                    </p>
                    <div className="flex space-x-2 mt-4 sm:mt-0">
                      <Link to={`/account/orders/${order.id}`}>
                        <Button variant="secondary" size="sm">View Details</Button>
                      </Link>
                      {/* <Button variant="primary" size="sm">Reorder</Button> */}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-slate-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;