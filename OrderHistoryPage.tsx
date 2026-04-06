import React from 'react';
import { Link } from 'react-router-dom';
import { MOCK_ORDERS } from '../../data/mockData';
import { Order } from '../../types';
import Button from '../../components/shared/Button';

const getStatusClasses = (status: Order['status']) => {
  switch (status) {
    case 'Delivered':
      return 'bg-green-100 text-green-800';
    case 'Shipped':
      return 'bg-blue-100 text-blue-800';
    case 'Processing':
      return 'bg-yellow-100 text-yellow-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

const currencySymbols: { [key: string]: string } = {
    USD: '$',
    GBP: '£',
};

const OrderHistoryPage: React.FC = () => {
  return (
    <div>
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-6">My Orders</h1>

        <div className="space-y-6">
          {MOCK_ORDERS.map(order => {
            const currencySymbol = currencySymbols[order.currency] || '$';
            return (
                <div key={order.id} className="bg-slate-50/70 p-4 sm:p-6 rounded-xl border">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-200 pb-4 mb-4">
                    <div>
                      <h2 className="font-bold text-lg text-slate-800">Order ID: #{order.id}</h2>
                      <p className="text-sm text-slate-500">Placed on: {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className={`text-sm font-semibold px-3 py-1 rounded-full mt-2 sm:mt-0 ${getStatusClasses(order.status)}`}>
                      {order.status}
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-4">
                      <div className="flex -space-x-4">
                          {order.items.slice(0, 3).map((item, index) => (
                              <img 
                                  key={index} 
                                  src={item.product.images[0]} 
                                  alt={item.product.name}
                                  className="w-12 h-12 object-cover rounded-full bg-white border-2 border-white"
                              />
                          ))}
                      </div>
                      {order.items.length > 3 && <span className="ml-2 text-sm text-slate-500">+{order.items.length - 3} more</span>}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <p className="font-bold text-xl text-slate-900">Total: {currencySymbol}{order.total.toFixed(2)}</p>
                    <div className="flex space-x-2 mt-4 sm:mt-0">
                      <Link to={`/account/orders/${order.id}`}>
                        <Button variant="secondary" size="sm">View Details</Button>
                      </Link>
                      <Button variant="primary" size="sm">Reorder</Button>
                    </div>
                  </div>
                </div>
            )
          })}
        </div>
    </div>
  );
};

export default OrderHistoryPage;