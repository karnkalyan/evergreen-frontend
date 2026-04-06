import React, { useState, useEffect } from 'react';
import { User, UserFormData, Role } from '../../types';
import Button from '../shared/Button';
import { toast } from 'react-hot-toast';
import SearchableSelect from '../shared/SearchableSelect';

interface UserEditModalProps {
    user: User | null;
    onClose: () => void;
    onSave: (userData: UserFormData, profilePictureFile?: File | null, removeProfilePicture?: boolean) => void;
    roles: Role[];
}

interface Address {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose, onSave, roles }) => {
    const [formData, setFormData] = useState<UserFormData>({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        streetAddress: '',
        city: '',
        state: '',
        zipCode: '',
        status: 'pending',
        roleId: 0,
        password: ''
    });
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
    const [removeProfilePicture, setRemoveProfilePicture] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            console.log('Editing user:', user);
            
            // Extract address from defaultAddress if it exists
            const defaultAddress: Address | null = user.defaultAddress || null;
            
            setFormData({
                firstName: user.firstName || '',
                middleName: user.middleName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                streetAddress: defaultAddress?.streetAddress || '',
                city: defaultAddress?.city || '',
                state: defaultAddress?.state || '',
                zipCode: defaultAddress?.zipCode || '',
                status: user.status || 'pending',
                roleId: user.role?.id || 0, // Get roleId from user.role
                password: '' // Don't prefill password
            });
            setProfilePicturePreview(user.profilePicture || '');
            setRemoveProfilePicture(false);
        } else {
            // Reset form for new user
            setFormData({
                firstName: '',
                middleName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                streetAddress: '',
                city: '',
                state: '',
                zipCode: '',
                status: 'pending',
                roleId: 0,
                password: ''
            });
            setProfilePicturePreview('');
            setProfilePictureFile(null);
            setRemoveProfilePicture(false);
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            
            // Check file size (2MB limit)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image size should be less than 2MB');
                return;
            }

            setProfilePictureFile(file);
            setRemoveProfilePicture(false);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfilePicturePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveProfilePicture = () => {
        setProfilePictureFile(null);
        setProfilePicturePreview('');
        setRemoveProfilePicture(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phoneNumber.trim()) {
            toast.error('First name, last name, email, and phone number are required');
            return;
        }

        if (!user && !formData.password) {
            toast.error('Password is required for new users');
            return;
        }

        if (!formData.roleId) {
            toast.error('Please select a role');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            await onSave(formData, profilePictureFile, removeProfilePicture);
        } catch (error) {
            console.error('Error saving user:', error);
            toast.error('Failed to save user');
        } finally {
            setLoading(false);
        }
    };

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
        { value: 'disabled', label: 'Disabled' }
    ];

    const roleOptions = roles.map(role => ({
        value: role.id.toString(),
        label: role.name
    }));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800">
                        {user ? 'Edit User' : 'Add New User'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Profile Picture Upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Profile Picture
                        </label>
                        <div className="flex items-center space-x-4">
                            {(profilePicturePreview || (user?.profilePicture && !removeProfilePicture)) ? (
                                <div className="relative">
                                    <img 
                                        src={profilePicturePreview || user?.profilePicture} 
                                        alt="Profile preview" 
                                        className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveProfilePicture}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400">
                                    No Image
                                </div>
                            )}
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePictureChange}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Recommended: Square image, max 2MB
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
                                First Name *
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="First name"
                            />
                        </div>

                        <div>
                            <label htmlFor="middleName" className="block text-sm font-medium text-slate-700 mb-1">
                                Middle Name
                            </label>
                            <input
                                type="text"
                                id="middleName"
                                name="middleName"
                                value={formData.middleName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="Middle name"
                            />
                        </div>

                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="Last name"
                            />
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="email@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 mb-1">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-slate-800 mb-4">Default Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="streetAddress" className="block text-sm font-medium text-slate-700 mb-1">
                                    Street Address
                                </label>
                                <input
                                    type="text"
                                    id="streetAddress"
                                    name="streetAddress"
                                    value={formData.streetAddress}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="123 Main St"
                                />
                            </div>

                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
                                    City
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="City"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-1">
                                    State
                                </label>
                                <input
                                    type="text"
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="State"
                                />
                            </div>

                            <div>
                                <label htmlFor="zipCode" className="block text-sm font-medium text-slate-700 mb-1">
                                    ZIP Code
                                </label>
                                <input
                                    type="text"
                                    id="zipCode"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="12345"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Account Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="roleId" className="block text-sm font-medium text-slate-700 mb-1">
                                Role *
                            </label>
                            <SearchableSelect
                                options={roleOptions}
                                value={formData.roleId.toString()}
                                onChange={(val) => setFormData(prev => ({ ...prev, roleId: parseInt(val) }))}
                                placeholder="Select role"
                            />
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                                Status *
                            </label>
                            <SearchableSelect
                                options={statusOptions}
                                value={formData.status}
                                onChange={(val) => setFormData(prev => ({ ...prev, status: val as any }))}
                                placeholder="Select status"
                            />
                        </div>
                    </div>

                    {/* Password (only for new users or when changing) */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                            {user ? 'New Password (leave blank to keep current)' : 'Password *'}
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required={!user}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Enter password"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (user ? 'Update User' : 'Create User')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserEditModal;