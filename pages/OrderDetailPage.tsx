
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_ORDERS } from '../data/mockData';
import { Order, CartItem, Currency } from '../types';
import Button from '../components/shared/Button';

const getStatusClasses = (status: Order['status']) => {
  switch (status) {
    case 'Delivered': return 'bg-green-100 text-green-800';
    case 'Shipped': return 'bg-blue-100 text-blue-800';
    case 'Processing': return 'bg-yellow-100 text-yellow-800';
    case 'Cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-slate-100 text-slate-800';
  }
};

const currencySymbols: { [key: string]: string } = {
    USD: '$',
    GBP: '£',
};

const OrderItem: React.FC<{ item: CartItem, currencySymbol: string }> = ({ item, currencySymbol }) => (
    <div className="flex items-center py-4">
        <img src={item.product.images[0]} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg mr-4 bg-slate-100" />
        <div className="flex-grow">
            <Link to={`/product/${item.product.slug}`} className="font-semibold text-slate-800 hover:text-primaryEnd">{item.product.name}</Link>
             <p className="text-sm text-slate-500">{item.variantDetail.label}</p>
            <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
        </div>
        <div className="text-right">
            <p className="font-semibold text-slate-800">{currencySymbol}{(item.variantDetail.price * item.quantity).toFixed(2)}</p>
            <p className="text-sm text-slate-500">{currencySymbol}{item.variantDetail.price.toFixed(2)} each</p>
        </div>
    </div>
);

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const order = MOCK_ORDERS.find(o => o.id === id);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-serif font-bold text-slate-900">Order Not Found</h1>
        <p className="text-slate-600 mt-4">We couldn't find an order with that ID.</p>
        <Link to="/account/orders" className="mt-8 inline-block"><Button>Back to Order History</Button></Link>
      </div>
    );
  }

  const currencySymbol = currencySymbols[order.currency] || '$';
  const subtotal = order.items.reduce((acc, item) => acc + item.variantDetail.price * item.quantity, 0);

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8" data-aos="fade-down">
            <div>
                <h1 className="text-4xl font-serif font-bold text-slate-900">Order #{order.id}</h1>
                <p className="text-slate-500 mt-1">Placed on {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <Link to="/account/orders" className="text-primaryEnd font-semibold mt-4 md:mt-0">Back to Order History</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-soft-md" data-aos="fade-up">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <h2 className="text-2xl font-poppins font-bold">Items in this order</h2>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusClasses(order.status)}`}>
                      {order.status}
                    </span>
                </div>
                <div className="divide-y">
                    {order.items.map((item, index) => <OrderItem key={index} item={item} currencySymbol={currencySymbol}/>)}
                </div>
            </div>

            <div className="lg:col-span-1" data-aos="fade-left">
                <div className="bg-white p-6 rounded-2xl shadow-soft-md sticky top-24">
                    <h2 className="text-2xl font-poppins font-bold mb-4">Order Summary</h2>
                    <div className="space-y-2 border-b pb-4 mb-4">
                        <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{currencySymbol}{subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between text-slate-600"><span>Shipping</span><span className="text-green-600 font-semibold">FREE</span></div>
                        <div className="flex justify-between text-slate-600"><span>Taxes</span><span>{currencySymbol}0.00</span></div>
                    </div>
                    <div className="flex justify-between font-bold text-xl text-slate-900 mb-6">
                        <span>Total</span><span>{currencySymbol}{order.total.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-6">
                        <h3 className="font-semibold text-lg mb-2">Shipping Address</h3>
                        <p className="text-slate-600 text-sm">John Doe<br/>123 Health St, Wellness City<br/>CA 90210, USA</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
