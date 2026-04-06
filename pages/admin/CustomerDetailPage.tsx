import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Order } from '../../types';
import AdminPagination from '../../components/admin/AdminPagination';
import { ICONS } from '../../constants';
import { userService } from '../../lib/userService';
import { orderService } from '../../lib/orderService';
import { toast } from 'react-hot-toast';

const getStatusClasses = (status: Order['status']) => {
  switch (status) {
    case 'delivered': return 'bg-green-100 text-green-800';
    case 'shipped': return 'bg-blue-100 text-blue-800';
    case 'processing': return 'bg-yellow-100 text-yellow-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    case 'confirmed': return 'bg-purple-100 text-purple-800';
    case 'pending': return 'bg-orange-100 text-orange-800';
    default: return 'bg-slate-100 text-slate-800';
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

const InfoCard: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-soft-md">
    <div className="flex items-center mb-4">
      <div className="text-primaryEnd mr-3">{icon}</div>
      <h2 className="text-xl font-poppins font-bold text-slate-800">{title}</h2>
    </div>
    <div className="space-y-2 text-sm">{children}</div>
  </div>
);

const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const customerData = await userService.getUserById(parseInt(id));
        
        // Check if user is actually a customer
        if (customerData && customerData.role?.name === 'customer') {
          setCustomer(customerData);
        } else {
          toast.error('Customer not found or user is not a customer');
        }
      } catch (error) {
        console.error('Error fetching customer:', error);
        toast.error('Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  // Fetch customer orders
  useEffect(() => {
    const fetchCustomerOrders = async () => {
      if (!id) return;
      
      try {
        setOrdersLoading(true);
        const response = await orderService.getUserOrders(parseInt(id));
        setOrders(response.orders || []);
      } catch (error) {
        console.error('Error fetching customer orders:', error);
        toast.error('Failed to load customer orders');
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    if (customer) {
      fetchCustomerOrders();
    }
  }, [id, customer]);

  const getFullName = (user: User): string => {
    return `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`.trim();
  };

  const getDefaultAddress = (user: User) => {
    if (!user.addresses || user.addresses.length === 0) {
      return {
        name: 'No address',
        streetAddress: 'Not provided',
        city: 'Not provided',
        state: 'Not provided',
        zipCode: 'Not provided',
        country: 'Nepal'
      };
    }

    // Find the default address
    const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
    
    return {
      name: defaultAddress.name,
      streetAddress: defaultAddress.streetAddress,
      city: defaultAddress.city,
      state: defaultAddress.state,
      zipCode: defaultAddress.zipCode,
      country: 'Nepal'
    };
  };

  const getTotalOrders = (): number => {
    return orders.length;
  };

  const getTotalSpent = (): number => {
    return orders.reduce((total, order) => total + (order.totalAmount || 0), 0);
  };

  const getLastLogin = (user: User): string => {
    return user.credential?.lastLogin 
      ? new Date(user.credential.lastLogin).toLocaleDateString()
      : 'Never logged in';
  };

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [orders, currentPage]);
  
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading customer details...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div>
        <h1 className="text-3xl font-poppins font-bold text-slate-800 mb-6">Customer Not Found</h1>
        <p className="text-slate-600 mb-4">The customer you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link to="/admin/customers" className="text-primaryEnd hover:underline">← Back to Customers</Link>
      </div>
    );
  }

  const address = getDefaultAddress(customer);

  return (
    <div>
      <div className="mb-6">
        <Link to="/admin/customers" className="text-sm font-semibold text-primaryEnd hover:underline">← Back to Customers</Link>
        <div className="flex items-center mt-4">
          {customer.profilePicture ? (
            <img 
              src={customer.profilePicture} 
              alt={getFullName(customer)}
              className="w-16 h-16 object-cover rounded-full bg-slate-100 mr-4"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YxZjVmOSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOWNhMGE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj5Vc2VyPC90ZXh0Pjwvc3ZnPg==';
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xl mr-4">
              {customer.firstName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-poppins font-bold text-slate-800">{getFullName(customer)}</h1>
            <p className="text-slate-600 mt-1">{customer.email}</p>
            <div className="flex items-center mt-2">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                customer.status === 'active' ? 'bg-green-100 text-green-800' :
                customer.status === 'inactive' ? 'bg-slate-100 text-slate-800' :
                customer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
              </span>
              <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {customer.addresses?.length || 0} Address{customer.addresses?.length !== 1 ? 'es' : ''}
              </span>
              <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                {getTotalOrders()} Order{getTotalOrders() !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column with Customer Details */}
        <div className="lg:col-span-1 space-y-8 self-start">
          <InfoCard title="Contact Information" icon={ICONS.user}>
            <p><span className="font-semibold text-slate-600">Name:</span> {getFullName(customer)}</p>
            <p><span className="font-semibold text-slate-600">Email:</span> {customer.email}</p>
            <p><span className="font-semibold text-slate-600">Phone:</span> {customer.phoneNumber || 'Not provided'}</p>
            <p><span className="font-semibold text-slate-600">Customer ID:</span> {customer.id}</p>
          </InfoCard>

          <InfoCard title="Default Shipping Address" icon={ICONS.location}>
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-slate-700">{address.name}</p>
                  <p className="text-slate-700 leading-relaxed mt-1">
                    {address.streetAddress}<br/>
                    {address.city}, {address.state} {address.zipCode}<br/>
                    {address.country}
                  </p>
                </div>
                {customer.addresses?.some(addr => addr.isDefault) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Default
                  </span>
                )}
              </div>
              {customer.addresses && customer.addresses.length > 1 && (
                <p className="text-xs text-slate-500 mt-2">
                  {customer.addresses.length - 1} additional address{customer.addresses.length - 1 !== 1 ? 'es' : ''} saved
                </p>
              )}
            </div>
          </InfoCard>

          <InfoCard title="Account Details" icon={ICONS.settings}>
            <p><span className="font-semibold text-slate-600">Registered:</span> {new Date(customer.createdAt).toLocaleDateString()}</p>
            <p><span className="font-semibold text-slate-600">Last Login:</span> {getLastLogin(customer)}</p>
            <p><span className="font-semibold text-slate-600">Total Orders:</span> {getTotalOrders()}</p>
            <p><span className="font-semibold text-slate-600">Total Spent:</span> ${getTotalSpent().toFixed(2)}</p>
            <p><span className="font-semibold text-slate-600">Status:</span> 
              <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                customer.status === 'active' ? 'bg-green-100 text-green-800' :
                customer.status === 'inactive' ? 'bg-slate-100 text-slate-800' :
                customer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
              </span>
            </p>
          </InfoCard>
        </div>

        {/* Right Column with Orders Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-soft-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-poppins font-bold text-slate-800">Order History</h2>
            <span className="text-sm text-slate-500">
              {orders.length} order{orders.length !== 1 ? 's' : ''} total
            </span>
          </div>
          
          {ordersLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-lg">Loading orders...</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-semibold text-slate-500 uppercase border-b bg-slate-50">
                      <th className="p-4">Order Number</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {paginatedOrders.map(order => {
                      const currencySymbol = currencySymbols[order.currency] || '$';
                      const orderDate = order.orderDate || order.createdAt;
                      
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
                            {orderDate ? new Date(orderDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses(order.status)}`}>
                              {getStatusDisplayText(order.status)}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                              order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1) || 'Pending'}
                            </span>
                          </td>
                          <td className="p-4 text-right font-semibold">
                            {currencySymbol}{(order.totalAmount || 0).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                    {paginatedOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center p-8 text-slate-500">
                          No orders found for this customer.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailPage;