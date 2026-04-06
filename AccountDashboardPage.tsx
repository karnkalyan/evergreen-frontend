import React from 'react';
import { Link } from 'react-router-dom';
import { MOCK_ORDERS } from '../../data/mockData';
import Button from '../../components/shared/Button';

const AccountDashboardPage: React.FC = () => {
    const recentOrder = MOCK_ORDERS.length > 0 ? MOCK_ORDERS[0] : null;

    return (
        <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-6">Account Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-50 p-6 rounded-xl">
                    <h3 className="font-bold text-slate-800">Personal Information</h3>
                    <p className="text-sm text-slate-600 mt-2">John Doe</p>
                    <p className="text-sm text-slate-600">john.doe@example.com</p>
                    <Link to="/account/profile" className="text-sm font-semibold text-primaryEnd hover:underline mt-4 inline-block">Edit Profile</Link>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl">
                    <h3 className="font-bold text-slate-800">Primary Address</h3>
                    <p className="text-sm text-slate-600 mt-2">123 Health St, <br/>Wellness City, CA 90210</p>
                    <Link to="/account/addresses" className="text-sm font-semibold text-primaryEnd hover:underline mt-4 inline-block">Manage Addresses</Link>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-serif font-bold text-slate-800 mb-4">Recent Orders</h2>
                {recentOrder ? (
                    <div className="border rounded-xl p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold">Order #{recentOrder.id}</p>
                                <p className="text-sm text-slate-500">Date: {new Date(recentOrder.date).toLocaleDateString()}</p>
                            </div>
                            <Link to={`/account/orders/${recentOrder.id}`}>
                                <Button size="sm" variant="secondary">View Order</Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-500">You have no recent orders.</p>
                )}
                 <Link to="/account/orders" className="text-sm font-semibold text-primaryEnd hover:underline mt-4 inline-block">View All Orders</Link>
            </div>

        </div>
    );
};

export default AccountDashboardPage;