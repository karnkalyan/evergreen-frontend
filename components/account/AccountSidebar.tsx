import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AccountSidebar: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            navigate('/login'); // Still navigate even if API call fails
        }
    };

    const navItems = [
        { name: 'Dashboard', path: '/account', end: true, onClick: undefined },
        { name: 'My Orders', path: '/account/orders', onClick: undefined },
        { name: 'Profile Details', path: '/account/profile', onClick: undefined },
        { name: 'My Addresses', path: '/account/addresses', onClick: undefined },
        // { name: 'Payment Methods', path: '/account/payment-methods', onClick: undefined },
        { name: 'Saved Prescriptions', path: '/account/prescriptions', onClick: undefined },
        { name: 'Logout', path: '#', onClick: handleLogout }, // Use # for path and handle via onClick
    ];

    const activeClass = "bg-primary-gradient text-white font-semibold shadow-md";
    const inactiveClass = "text-slate-600 hover:bg-slate-200/70";

    return (
        <div className="bg-white p-4 rounded-2xl shadow-soft-md">
            <div className="mb-4 p-4">
                <h3 className="text-xl font-bold text-slate-800">
                    Hello, {user?.firstName || 'User'}!
                </h3>
                <p className="text-sm text-slate-500">Welcome to your account</p>
            </div>
            <nav className="space-y-1">
                {navItems.map(item => (
                    item.name === 'Logout' ? (
                        <button
                            key={item.name}
                            onClick={item.onClick}
                            className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-200 text-sm ${inactiveClass} cursor-pointer`}
                        >
                            {item.name}
                        </button>
                    ) : (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `block w-full text-left px-4 py-3 rounded-lg transition-all duration-200 text-sm ${isActive ? activeClass : inactiveClass}`
                            }
                        >
                            {item.name}
                        </NavLink>
                    )
                ))}
            </nav>
        </div>
    );
};

export default AccountSidebar;