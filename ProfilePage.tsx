import React from 'react';
import Button from '../../components/shared/Button';

const ProfilePage: React.FC = () => {
    // Mock user data
    const user = {
        name: 'John Doe',
        email: 'john.doe@example.com',
    };

    return (
        <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-6">Profile Details</h1>

            <form className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        defaultValue={user.name}
                        className="w-full p-3 bg-slate-50/70 text-slate-900 border border-slate-300 rounded-lg focus:ring-primaryStart focus:border-primaryStart"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        defaultValue={user.email}
                        className="w-full p-3 bg-slate-50/70 text-slate-900 border border-slate-300 rounded-lg focus:ring-primaryStart focus:border-primaryStart"
                    />
                </div>
                <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Change Password</h3>
                    <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            id="current-password"
                            className="w-full p-3 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:ring-primaryStart focus:border-primaryStart"
                            placeholder="••••••••"
                        />
                    </div>
                        <div className="mt-4">
                        <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                        <input
                            type="password"
                            id="new-password"
                            className="w-full p-3 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:ring-primaryStart focus:border-primaryStart"
                            placeholder="••••••••"
                        />
                    </div>
                </div>
                <div className="text-right">
                    <Button type="submit" size="lg">Save Changes</Button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;