import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/shared/Button';
import { Order } from '../../types';
import { orderService } from '../../lib/orderService';
import { toast } from 'react-hot-toast';

const AccountDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Helper functions from OrderHistoryPage
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getFullName = () => {
        if (!user) return 'User';
        return `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`.trim();
    };

    const formatAddress = () => {
        if (!user?.defaultAddress) return 'No address saved';
        const { streetAddress, city, state, zipCode } = user.defaultAddress;
        return `${streetAddress}, ${city}, ${state} ${zipCode}`;
    };

    // Fetch recent orders
    useEffect(() => {
        const loadRecentOrders = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const response = await orderService.getUserOrders(user.id, {
                    page: 1,
                    limit: 5 // Only get the 5 most recent orders
                });
                
                setRecentOrders(response.orders);
            } catch (error) {
                console.error('Error loading recent orders:', error);
                toast.error('Failed to load recent orders');
            } finally {
                setLoading(false);
            }
        };

        loadRecentOrders();
    }, [user]);

    return (
        <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-6">Account Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Personal Information Card */}
                <div className="bg-slate-50 p-6 rounded-xl">
                    <h3 className="font-bold text-slate-800">Personal Information</h3>
                    <div className="mt-2 space-y-1">
                        <p className="text-sm text-slate-600">{getFullName()}</p>
                        <p className="text-sm text-slate-600">{user?.email}</p>
                        {user?.phoneNumber && (
                            <p className="text-sm text-slate-600">{user.phoneNumber}</p>
                        )}
                    </div>
                    <Link 
                        to="/account/profile" 
                        className="text-sm font-semibold text-primaryEnd hover:underline mt-4 inline-block"
                    >
                        Edit Profile
                    </Link>
                </div>

                {/* Primary Address Card */}
                <div className="bg-slate-50 p-6 rounded-xl">
                    <h3 className="font-bold text-slate-800">
                        {user?.defaultAddress ? 'Primary Address' : 'No Address Saved'}
                    </h3>
                    <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">
                        {formatAddress()}
                    </p>
                    <Link 
                        to="/account/addresses" 
                        className="text-sm font-semibold text-primaryEnd hover:underline mt-4 inline-block"
                    >
                        {user?.defaultAddress ? 'Manage Addresses' : 'Add Address'}
                    </Link>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div>
                <h2 className="text-2xl font-serif font-bold text-slate-800 mb-4">Recent Orders</h2>
                
                {loading ? (
                    <div className="border rounded-xl p-4">
                        <div className="space-y-4">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 animate-pulse">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                                        <div className="h-6 bg-slate-200 rounded w-1/6"></div>
                                    </div>
                                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                                    <div className="flex justify-between items-center">
                                        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                                        <div className="h-8 bg-slate-200 rounded w-20"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : recentOrders.length === 0 ? (
                    <div className="border rounded-xl p-4">
                        <div className="text-center py-8">
                            <p className="text-slate-500 mb-4">You have no recent orders.</p>
                            <Link to="/category/all">
                                <Button size="sm">Start Shopping</Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="border rounded-xl p-4">
                        <div className="space-y-4">
                            {recentOrders.map(order => {
                                const currencySymbol = currencySymbols[order.currency] || '$';
                                const firstImage = order.orderItems[0]?.productSnapshot?.images?.[0]?.url || 
                                                order.orderItems[0]?.product?.images?.[0]?.url;

                                return (
                                    <div key={order.id} className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-200 pb-2 mb-2">
                                            <div>
                                                <h3 className="font-bold text-slate-800">
                                                    Order #: {order.orderNumber}
                                                </h3>
                                                <p className="text-sm text-slate-500">
                                                    Placed on: {formatDate(order.orderDate || order.createdAt)}
                                                </p>
                                            </div>
                                            <div className={`text-xs font-semibold px-2 py-1 rounded-full mt-2 sm:mt-0 ${getStatusClasses(order.status)}`}>
                                                {getStatusDisplayText(order.status)}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center mb-2">
                                            <div className="flex -space-x-2">
                                                {order.orderItems.slice(0, 3).map((item, index) => {
                                                    const imageUrl = item.productSnapshot?.images?.[0]?.url || 
                                                                    item.product?.images?.[0]?.url;
                                                    return (
                                                        <div key={index} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center overflow-hidden">
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
                                                <span className="ml-2 text-xs text-slate-500">
                                                    +{order.orderItems.length - 3} more
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                            <p className="font-bold text-slate-900">
                                                Total: {currencySymbol}{order.totalAmount.toFixed(2)}
                                            </p>
                                            <div className="mt-2 sm:mt-0">
                                                <Link to={`/account/orders/${order.id}`}>
                                                    <Button variant="secondary" size="xs">View Details</Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                <Link 
                    to="/account/orders" 
                    className="text-sm font-semibold text-primaryEnd hover:underline mt-4 inline-block"
                >
                    View All Orders
                </Link>
            </div>
        </div>
    );
};

export default AccountDashboardPage;