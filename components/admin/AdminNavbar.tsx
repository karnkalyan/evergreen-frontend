import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ICONS } from '../../constants';
import { useAuth } from '../../hooks/useAuth';

const useClickOutside = (handler: () => void) => {
    let domNode = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let maybeHandler = (event: MouseEvent) => {
            if (domNode.current && !domNode.current.contains(event.target as Node)) {
                handler();
            }
        };

        document.addEventListener("mousedown", maybeHandler);

        return () => {
            document.removeEventListener("mousedown", maybeHandler);
        };
    });

    return domNode;
};

const AdminNavbar: React.FC = () => {
    const { user, logout } = useAuth();
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const [isMessagesOpen, setMessagesOpen] = useState(false);

    const profileRef = useClickOutside(() => setProfileOpen(false));
    const notificationsRef = useClickOutside(() => setNotificationsOpen(false));
    const messagesRef = useClickOutside(() => setMessagesOpen(false));

    // Construct full name from user data
    const getFullName = () => {
        if (!user) return '';
        const { firstName, middleName, lastName } = user;
        return [firstName, middleName, lastName].filter(Boolean).join(' ');
    };

    // Construct profile picture URL
    const getProfilePictureUrl = () => {
        if (!user?.profilePicture) return '/default-avatar.png';
        
        // If it's already a full URL, return as is
        if (user.profilePicture.startsWith('http')) {
            return user.profilePicture;
        }
        
        // If it's a relative path, prepend the base URL
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
        
        // Ensure the path starts with a slash for proper concatenation
        const normalizedPath = user.profilePicture.startsWith('/') 
            ? user.profilePicture 
            : `/${user.profilePicture}`;
        
        return `${baseUrl}${normalizedPath}`;
    };

    const fullName = getFullName();
    const profilePictureUrl = getProfilePictureUrl();

    return (
        <header className="flex-shrink-0 bg-white border-b border-slate-200 shadow-sm">
            <div className="flex items-center justify-between p-4 h-16">
                {/* Search Bar */}
                <div className="relative w-full max-w-xs hidden md:block">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primaryStart/50"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                       {React.cloneElement(ICONS.search, { className: "h-5 w-5" })}
                    </div>
                </div>

                {/* Right Side Icons & Profile */}
                <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
                    <div className="relative group/tooltip">
                         <Link 
                            to="/" 
                            className="text-slate-500 hover:text-primaryEnd p-2 rounded-full hover:bg-slate-100 block"
                            title="Visit Site"
                         >
                            {React.cloneElement(ICONS.globe, { className: "h-6 w-6" })}
                         </Link>
                         <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
                            Visit Site
                        </span>
                    </div>

                    <div ref={notificationsRef} className="relative">
                        <button 
                            onClick={() => setNotificationsOpen(p => !p)} 
                            className="relative text-slate-500 hover:text-primaryEnd p-2 rounded-full hover:bg-slate-100"
                        >
                            {React.cloneElement(ICONS.bell, { className: "h-6 w-6" })}
                            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-coral ring-2 ring-white"></span>
                        </button>
                        {isNotificationsOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-soft-lg p-4 z-50 border border-slate-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-slate-800">Notifications</h3>
                                    <span className="text-xs text-slate-500">0 new</span>
                                </div>
                                <div className="text-sm text-slate-600 text-center py-4">
                                    No new notifications
                                </div>
                                <div className="border-t border-slate-200 pt-3">
                                    <Link 
                                        to="/admin/notifications" 
                                        className="text-primaryEnd hover:text-primaryStart text-sm font-medium block text-center"
                                        onClick={() => setNotificationsOpen(false)}
                                    >
                                        View all notifications
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <div ref={messagesRef} className="relative">
                        <button 
                            onClick={() => setMessagesOpen(p => !p)} 
                            className="relative text-slate-500 hover:text-primaryEnd p-2 rounded-full hover:bg-slate-100"
                        >
                            {React.cloneElement(ICONS.message, { className: "h-6 w-6" })}
                        </button>
                         {isMessagesOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-soft-lg p-4 z-50 border border-slate-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-slate-800">Messages</h3>
                                    <span className="text-xs text-slate-500">0 unread</span>
                                </div>
                                <div className="text-sm text-slate-600 text-center py-4">
                                    No new messages
                                </div>
                                <div className="border-t border-slate-200 pt-3">
                                    <Link 
                                        to="/admin/messages" 
                                        className="text-primaryEnd hover:text-primaryStart text-sm font-medium block text-center"
                                        onClick={() => setMessagesOpen(false)}
                                    >
                                        View all messages
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <div ref={profileRef} className="relative">
                        <button 
                            onClick={() => setProfileOpen(!isProfileOpen)} 
                            className="flex items-center space-x-3 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <div className="flex items-center space-x-2">
                                <div className="relative">
                                    <img 
                                        src={profilePictureUrl} 
                                        alt={fullName} 
                                        className="h-9 w-9 rounded-full object-cover border-2 border-slate-200"
                                        onError={(e) => {
                                            // Fallback if image fails to load
                                            (e.target as HTMLImageElement).src = '/default-avatar.png';
                                        }}
                                    />
                                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                                </div>
                                <div className="hidden sm:block text-left">
                                    <div className="font-semibold text-slate-800 text-sm">
                                        {fullName}
                                    </div>
                                    <div className="text-xs text-slate-500 capitalize">
                                        {user?.role?.name || 'User'}
                                    </div>
                                </div>
                            </div>
                        </button>
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-soft-lg p-2 z-50 border border-slate-200">
                                <div className="px-4 py-3 border-b border-slate-200">
                                    <div className="font-semibold text-slate-800">{fullName}</div>
                                    <div className="text-sm text-slate-500">{user?.email}</div>
                                    <div className="text-xs text-slate-400 mt-1 capitalize">
                                        {user?.role?.name || 'User'} • {user?.status || 'Active'}
                                    </div>
                                </div>
                                
                                <div className="py-2">
                                    <Link 
                                        to="/admin/profile" 
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                                    >
                                        {React.cloneElement(ICONS.user, { className: "h-4 w-4" })}
                                        <span>My Profile</span>
                                    </Link>
                                    <Link 
                                        to="/admin/settings" 
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                                    >
                                        {React.cloneElement(ICONS.settings, { className: "h-4 w-4" })}
                                        <span>Settings</span>
                                    </Link>
                                </div>
                                
                                <div className="border-t border-slate-200 pt-2">
                                    <button 
                                        onClick={logout} 
                                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                                    >
                                        {React.cloneElement(ICONS.logout, { className: "h-4 w-4" })}
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminNavbar;