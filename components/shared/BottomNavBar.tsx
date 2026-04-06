import React from 'react';
import { NavLink } from 'react-router-dom';
import { ICONS } from '../../constants';
import { useCart } from '../../hooks/useCart';

const BottomNavBar: React.FC = () => {
    const { itemCount } = useCart();
    const navItems = [
        { path: '/', icon: ICONS.home, label: 'Home' },
        { path: '/category/all', icon: ICONS.shopGrid, label: 'Shop' },
        { path: '/cart', icon: ICONS.cart, label: 'Cart', badge: itemCount > 0 ? itemCount : null },
        { path: '/account', icon: ICONS.user, label: 'Profile' }
    ];

    const activeLinkClass = "text-primaryEnd";
    const inactiveLinkClass = "text-slate-500";

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40">
            <div className="flex justify-around items-center h-16">
                {navItems.map(item => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) => 
                            `flex flex-col items-center justify-center space-y-1 w-full h-full relative transition-colors ${isActive ? activeLinkClass : inactiveLinkClass}`
                        }
                    >
                        {item.badge !== null && (
                            <span className="absolute top-1 right-[calc(50%-2rem)] inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-coral rounded-full">
                                {item.badge}
                            </span>
                        )}
                        {React.cloneElement(item.icon, { className: 'w-6 h-6' })}
                        <span className="text-xs font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomNavBar;
