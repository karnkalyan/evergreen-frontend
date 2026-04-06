
import React from 'react';
import { Link } from 'react-router-dom';
import { ICONS } from '../constants';

const AccountDashboardPage: React.FC = () => {
// In your AccountDashboardPage component, update the dashboardItems:
const dashboardItems = [
  { name: 'My Orders', description: 'View, track, and manage your orders.', link: '/account/orders', icon: '📦' },
  { name: 'Profile Details', description: 'Edit your personal information.', link: '/account/profile', icon: '👤' },
  { name: 'My Addresses', description: 'Manage your saved shipping addresses.', link: '/account/addresses', icon: '🏠' },
  { name: 'Payment Methods', description: 'Manage your saved cards and wallets.', link: '/account/payment-methods', icon: '💳' },
  { name: 'Saved Prescriptions', description: 'View your uploaded prescriptions.', link: '/account/prescriptions', icon: '℞' },
  { name: 'Logout', description: 'Sign out of your account.', link: '/login', icon: '🚪' },
];

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12" data-aos="fade-down">
          <h1 className="text-4xl font-serif font-bold text-slate-900">My Account</h1>
          <p className="text-slate-600 mt-2">Welcome back, User!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <Link to={item.link} key={item.name} data-aos="fade-up" data-aos-delay={index * 100}>
              <div className="bg-white p-6 rounded-2xl shadow-soft-md hover:shadow-soft-lg transform hover:-translate-y-1 transition-all duration-300 h-full flex items-start space-x-4 group">
                <div className="text-3xl bg-slate-100 p-3 rounded-lg">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{item.name}</h3>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </div>
                <div className="ml-auto text-slate-400 group-hover:text-primaryEnd transition-colors">
                    {ICONS.chevronRight}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountDashboardPage;