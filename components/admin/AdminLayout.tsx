import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

const AdminLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminNavbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100">
                    <div className="mx-auto px-6 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;