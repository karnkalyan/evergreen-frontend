import React from 'react';
import { Outlet } from 'react-router-dom';
import AccountSidebar from './AccountSidebar';

const AccountLayout: React.FC = () => {
    return (
        <div className="bg-slate-100">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    <aside className="lg:col-span-1" data-aos="fade-right">
                        <div className="sticky top-24">
                           <AccountSidebar />
                        </div>
                    </aside>
                    <main className="lg:col-span-3" data-aos="fade-up" data-aos-delay="100">
                         <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-soft-md min-h-[60vh]">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AccountLayout;