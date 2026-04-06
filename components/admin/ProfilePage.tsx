// components/admin/UserProfilePage.tsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    Shield, 
    Building,
    CheckCircle,
    Clock,
    Award
} from 'lucide-react';

const UserProfilePage: React.FC = () => {
    const { user: currentUser } = useAuth();

    const getFullName = () => {
        if (!currentUser) return '';
        const { firstName, middleName, lastName } = currentUser;
        return [firstName, middleName, lastName].filter(Boolean).join(' ');
    };

    const getProfilePictureUrl = () => {
        if (!currentUser?.profilePicture) return '/default-avatar.png';
        
        if (currentUser.profilePicture.startsWith('http')) {
            return currentUser.profilePicture;
        }
        
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
        const normalizedPath = currentUser.profilePicture.startsWith('/') 
            ? currentUser.profilePicture 
            : `/${currentUser.profilePicture}`;
        
        return `${baseUrl}${normalizedPath}`;
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Active', icon: CheckCircle },
            inactive: { color: 'bg-slate-100 text-slate-800 border-slate-200', label: 'Inactive', icon: Clock },
            pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending', icon: Clock },
            disabled: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Disabled', icon: Clock }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
        const IconComponent = config.icon;
        
        return (
            <span className={`flex items-center space-x-1 px-3 py-1 text-sm font-semibold rounded-full border ${config.color}`}>
                <IconComponent className="w-3 h-3" />
                <span>{config.label}</span>
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!currentUser) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg text-slate-600">Loading profile...</div>
            </div>
        );
    }

    const profilePictureUrl = getProfilePictureUrl();
    const fullName = getFullName();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-soft-md p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
                        <p className="text-slate-600 mt-2">View your personal information and system access</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {getStatusBadge(currentUser.status)}
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full border border-blue-200">
                            {currentUser.role?.name || 'User'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Profile Card & Role */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-xl shadow-soft-md p-6 border border-slate-200">
                        <div className="text-center">
                            <div className="relative inline-block">
                                <img
                                    src={profilePictureUrl}
                                    alt={fullName}
                                    className="w-32 h-32 rounded-full object-cover border-4 border-slate-100 mx-auto"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                                    }}
                                />
                                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            
                            <h2 className="text-xl font-bold text-slate-800 mt-4">{fullName}</h2>
                            <p className="text-slate-600 flex items-center justify-center mt-1">
                                <Mail className="w-4 h-4 mr-2" />
                                {currentUser.email}
                            </p>
                            {currentUser.phoneNumber && (
                                <p className="text-slate-600 flex items-center justify-center mt-1">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {currentUser.phoneNumber}
                                </p>
                            )}
                            
                            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                                <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="font-semibold text-slate-800">Member Since</div>
                                    <div className="text-slate-600 mt-1">
                                        {currentUser.createdAt ? formatDate(currentUser.createdAt) : 'N/A'}
                                    </div>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="font-semibold text-slate-800">Last Updated</div>
                                    <div className="text-slate-600 mt-1">
                                        {currentUser.updatedAt ? formatDate(currentUser.updatedAt) : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Role Information */}
                    <div className="bg-white rounded-xl shadow-soft-md p-6 border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-primaryEnd" />
                            Role Information
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div>
                                    <div className="text-sm font-medium text-blue-700">Role</div>
                                    <div className="text-blue-800 font-semibold">{currentUser.role?.name || 'User'}</div>
                                </div>
                                <Award className="w-8 h-8 text-blue-600" />
                            </div>
                            
                            {currentUser.role?.permissions && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-sm font-medium text-slate-700">
                                            Permissions
                                        </div>
                                        <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full">
                                            {currentUser.role.permissions.length} permissions
                                        </span>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {currentUser.role.permissions.map((permission) => (
                                            <div
                                                key={permission.id}
                                                className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200"
                                            >
                                                <div>
                                                    <div className="text-sm font-medium text-slate-800">
                                                        {permission.menuName || permission.name}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {permission.name}
                                                    </div>
                                                </div>
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-xl shadow-soft-md p-6 border border-slate-200">
                        <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                            <User className="w-5 h-5 mr-2 text-primaryEnd" />
                            Personal Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-slate-700">First Name</div>
                                <div className="text-slate-800 p-2 bg-slate-50 rounded border border-slate-200">
                                    {currentUser.firstName}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-slate-700">Middle Name</div>
                                <div className="text-slate-800 p-2 bg-slate-50 rounded border border-slate-200">
                                    {currentUser.middleName || '-'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-slate-700">Last Name</div>
                                <div className="text-slate-800 p-2 bg-slate-50 rounded border border-slate-200">
                                    {currentUser.lastName}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-slate-700">Email</div>
                                <div className="text-slate-800 p-2 bg-slate-50 rounded border border-slate-200 flex items-center">
                                    <Mail className="w-4 h-4 mr-2 text-slate-400" />
                                    {currentUser.email}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-slate-700">Phone Number</div>
                                <div className="text-slate-800 p-2 bg-slate-50 rounded border border-slate-200 flex items-center">
                                    <Phone className="w-4 h-4 mr-2 text-slate-400" />
                                    {currentUser.phoneNumber || '-'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-slate-700">User ID</div>
                                <div className="text-slate-800 p-2 bg-slate-50 rounded border border-slate-200 font-mono">
                                    {currentUser.id}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-slate-700">Account Status</div>
                                <div className="p-2">
                                    {getStatusBadge(currentUser.status)}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-slate-700">Active Status</div>
                                <div className="text-slate-800 p-2 bg-slate-50 rounded border border-slate-200">
                                    {currentUser.isActive ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="bg-white rounded-xl shadow-soft-md p-6 border border-slate-200">
                        <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-primaryEnd" />
                            Default Address
                        </h3>

                        {currentUser.defaultAddress ? (
                            <div className="space-y-4">
                                <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <Building className="w-6 h-6 text-slate-400 mt-1" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-semibold text-slate-800 text-lg">
                                                {currentUser.defaultAddress.name}
                                            </div>
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-200">
                                                Default
                                            </span>
                                        </div>
                                        <div className="text-slate-700 space-y-1">
                                            <div>{currentUser.defaultAddress.streetAddress}</div>
                                            <div>
                                                {currentUser.defaultAddress.city}, {currentUser.defaultAddress.state} {currentUser.defaultAddress.zipCode}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                                <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h4 className="text-lg font-semibold text-slate-700 mb-2">No Address Added</h4>
                                <p className="text-slate-500">No default address has been set for this account</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;