import React, { useState, useEffect, useCallback, FormEvent, ChangeEvent } from 'react';
import Button from '../../components/shared/Button';
import { userService } from '../../lib/userService';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

interface ProfileFormData {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    password?: string;
    profilePictureFile?: File | null;
}

const ProfilePage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { user: authUser } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<ProfileFormData>({
        firstName: '',
        lastName: '',
        email: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

    // Get default address from addresses array
    const defaultAddress = user?.addresses?.find(addr => addr.isDefault);

    // Fetch user data using userService
    const fetchUser = useCallback(async () => {
        if (!authUser?.id) {
            setError('No user ID available');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const userData = await userService.getUserById(authUser.id);
            
            if (userData) {
                setUser(userData);
                setFormData({
                    firstName: userData.firstName || '',
                    middleName: userData.middleName || '',
                    lastName: userData.lastName || '',
                    email: userData.email || '',
                    phoneNumber: userData.phoneNumber || '',
                    password: '',
                    profilePictureFile: null,
                });
                setProfilePictureUrl(userData.profilePicture);
            } else {
                setError('Failed to load user profile.');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('An unexpected error occurred while fetching the profile.');
        } finally {
            setLoading(false);
        }
    }, [authUser?.id]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // --- Form Change Handlers ---
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setFormData(prev => ({ ...prev, profilePictureFile: file }));

        if (file) {
            setProfilePictureUrl(URL.createObjectURL(file));
        } else if (user) {
            setProfilePictureUrl(user.profilePicture);
        } else {
            setProfilePictureUrl(null);
        }
    };

    // --- Form Submission ---
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (loading || !user) return;

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const updateFormData = new FormData();
            
            // Append only editable user fields
            updateFormData.append('firstName', formData.firstName);
            updateFormData.append('middleName', formData.middleName || '');
            updateFormData.append('lastName', formData.lastName);
            updateFormData.append('status', user.status);

            // Add password if provided
            if (formData.password) {
                updateFormData.append('password', formData.password);
            }

            // Add profile picture if changed
            if (formData.profilePictureFile) {
                updateFormData.append('profilePicture', formData.profilePictureFile);
            }

            const response = await userService.updateUser(user.id, updateFormData);
            
            if (response.success) {
                toast.success('Profile updated successfully!');
                setFormData(prev => ({ ...prev, password: '' }));
                await fetchUser();
            } else {
                toast.error(response.message || 'Failed to update profile.');
            }
        } catch (error: any) {
            console.error('Error updating profile:', error);
            const errorMessage = error.message || "Failed to update profile.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !user) {
        return (
            <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900 mb-6">Profile Details</h1>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryEnd"></div>
                </div>
            </div>
        );
    }

    if (error && !user) {
        return (
            <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900 mb-6">Profile Details</h1>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    <p>Error: {error}</p>
                    <Button 
                        onClick={fetchUser} 
                        className="mt-2"
                        size="sm"
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900 mb-6">Profile Details</h1>
                <div className="text-center py-10 text-xl text-red-500">
                    User data is missing.
                </div>
            </div>
        );
    }

    const lastLoginFormatted = user.credential?.lastLogin ? 
        new Date(user.credential.lastLogin).toLocaleString() : 'N/A';

    const formatAddress = () => {
        if (!defaultAddress) return 'No default address set';
        const { streetAddress, city, state, zipCode } = defaultAddress;
        return `${streetAddress}, ${city}, ${state} ${zipCode}`;
    };

    return (
        <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-6">Profile Details</h1>
            
            {message && <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">✅ {message}</div>}
            {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">❌ {error}</div>}

            <form className="space-y-6" onSubmit={handleSubmit}>
                
                {/* Profile Picture Upload */}
                <div className="flex items-center space-x-4 border-b border-slate-200 pb-6">
                    <img
                        src={profilePictureUrl || '/default-avatar.png'}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                    />
                    <div>
                        <label htmlFor="profilePicture" className="block text-sm font-medium text-slate-700 mb-1 cursor-pointer hover:text-primaryStart transition-colors">
                            Change Profile Picture
                        </label>
                        <input
                            type="file"
                            id="profilePicture"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <p className="text-xs text-slate-500 mt-1">Max 2MB. Only image files.</p>
                        {formData.profilePictureFile && (
                            <p className="text-xs text-blue-500 mt-1">Selected: {formData.profilePictureFile.name}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                            {/* Role: {user.role?.name} */}
                             Last Login: {lastLoginFormatted}
                        </p>
                    </div>
                </div>

                <h3 className="text-xl font-semibold text-slate-800 pt-2">Personal Information</h3>
                
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full p-3 bg-slate-50/70 text-slate-900 border border-slate-300 rounded-lg focus:ring-primaryStart focus:border-primaryStart"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="middleName" className="block text-sm font-medium text-slate-700 mb-1">Middle Name (Optional)</label>
                        <input
                            type="text"
                            id="middleName"
                            value={formData.middleName || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 bg-slate-50/70 text-slate-900 border border-slate-300 rounded-lg focus:ring-primaryStart focus:border-primaryStart"
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                        <input
                            type="text"
                            id="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full p-3 bg-slate-50/70 text-slate-900 border border-slate-300 rounded-lg focus:ring-primaryStart focus:border-primaryStart"
                            required
                        />
                    </div>
                </div>
                
                {/* Contact Fields - Read Only */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            disabled
                            className="w-full p-3 bg-slate-100 text-slate-500 border border-slate-300 rounded-lg cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-400 mt-1">Email cannot be changed from here</p>
                    </div>
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <input
                            type="text"
                            id="phoneNumber"
                            value={formData.phoneNumber || ''}
                            disabled
                            className="w-full p-3 bg-slate-100 text-slate-500 border border-slate-300 rounded-lg cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-400 mt-1">Phone number cannot be changed from here</p>
                    </div>
                </div>

                {/* Default Address Display - Read Only */}
                <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Default Address</h3>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        {defaultAddress ? (
                            <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-slate-800">{defaultAddress.name}</p>
                                        <p className="text-sm text-slate-600">{defaultAddress.streetAddress}</p>
                                        <p className="text-sm text-slate-600">
                                            {defaultAddress.city}, {defaultAddress.state} {defaultAddress.zipCode}
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Default
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">
                                    To manage addresses, visit the{' '}
                                    <a href="/account/addresses" className="text-primaryEnd hover:underline">
                                        Addresses page
                                    </a>
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-slate-500 mb-2">No default address set</p>
                                <a 
                                    href="/account/addresses" 
                                    className="text-sm text-primaryEnd hover:underline font-medium"
                                >
                                    Add your first address
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Change Password Section */}
                <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Change Password (Optional)</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">New Password (Min 8 characters)</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={formData.password || ''}
                                    onChange={handleInputChange}
                                    className="w-full p-3 pr-10 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:ring-primaryStart focus:border-primaryStart"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="text-right pt-6">
                    <Button type="submit" size="lg" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;