import React, { useState, useMemo, useEffect } from 'react';
import { User, Role } from '../../../types';
import Button from '../../../components/shared/Button';
import UserEditModal from '../../../components/admin/UserEditModal';
import { toast } from 'react-hot-toast';
import TableControls from '../../../components/admin/TableControls';
import AdminPagination from '../../../components/admin/AdminPagination';
import { userService } from '../../../lib/userService';
import { ICONS } from '../../../constants';

const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const ITEMS_PER_PAGE = 10;

    // Fetch users and roles from API
    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, rolesData] = await Promise.all([
                userService.getUsers(),
                userService.getRoles()
            ]);
            
            // Filter out users with role 'customer'
            const nonCustomerUsers = usersData.filter(user => 
                user.role?.name?.toLowerCase() !== 'customer'
            );
            
            // Filter out 'customer' role from roles list for dropdown
            const nonCustomerRoles = rolesData.filter(role => 
                role.name?.toLowerCase() !== 'customer'
            );
            
            setUsers(nonCustomerUsers);
            setRoles(nonCustomerRoles);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingUser(null);
        setModalOpen(true);
    };

  const handleSave = async (userData: any, profilePictureFile?: File | null, removeProfilePicture?: boolean) => {
    try {
        const formData = new FormData();
        
        // Append all user data including address fields
        Object.keys(userData).forEach(key => {
            if (userData[key] !== undefined && userData[key] !== null && userData[key] !== '') {
                formData.append(key, userData[key].toString());
            }
        });

        // Append profile picture file if provided
        if (profilePictureFile) {
            formData.append('profilePicture', profilePictureFile);
        }

        // Append removeProfilePicture flag if needed
        if (removeProfilePicture) {
            formData.append('removeProfilePicture', 'true');
        }

        if (editingUser) {
            // Update existing user
            await userService.updateUser(editingUser.id, formData);
            toast.success('User updated successfully!');
        } else {
            // Create new user
            await userService.createUser(formData);
            toast.success('User created successfully!');
        }
        
        setModalOpen(false);
        // Refresh users list
        await fetchData();
    } catch (error: any) {
        console.error('Error saving user:', error);
        const errorMessage = error.message || "Failed to save user.";
        toast.error(errorMessage);
    }
};

    const handleDelete = async (id: number) => {
        toast(
            (t) => (
                <div className="p-4 bg-white rounded-lg shadow-lg">
                    <p className="text-center text-sm text-slate-700 mb-4">
                        Are you sure you want to delete this user?
                    </p>
                    <div className="flex justify-center space-x-3">
                        <Button variant="secondary" size="sm" onClick={() => toast.dismiss(t.id)}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={async () => {
                                try {
                                    await userService.deleteUser(id);
                                    setUsers(prev => prev.filter(user => user.id !== id));
                                    toast.dismiss(t.id);
                                    toast.success("User deleted successfully.");
                                } catch (error) {
                                    console.error('Error deleting user:', error);
                                    toast.dismiss(t.id);
                                    toast.error("Failed to delete user.");
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            ),
            { duration: Infinity, position: 'top-center' }
        );
    };

    const getFullName = (user: User): string => {
        return `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`;
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { color: 'bg-green-100 text-green-800', label: 'Active' },
            inactive: { color: 'bg-slate-100 text-slate-800', label: 'Inactive' },
            pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
            disabled: { color: 'bg-red-100 text-red-800', label: 'Disabled' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
        
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const filteredUsers = useMemo(() => {
        const lowercasedQuery = searchTerm.toLowerCase();
        if (!lowercasedQuery) return users;
        
        return users.filter(user =>
            user.firstName.toLowerCase().includes(lowercasedQuery) ||
            user.lastName.toLowerCase().includes(lowercasedQuery) ||
            user.email.toLowerCase().includes(lowercasedQuery) ||
            user.role?.name.toLowerCase().includes(lowercasedQuery) ||
            user.status.toLowerCase().includes(lowercasedQuery)
        );
    }, [users, searchTerm]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    const columnsForExport = [
        { Header: 'ID', accessor: 'id' },
        { Header: 'Name', accessor: (row: User) => getFullName(row) },
        { Header: 'Email', accessor: 'email' },
        { Header: 'Phone', accessor: 'phoneNumber' },
        { Header: 'Role', accessor: (row: User) => row.role?.name || 'N/A' },
        { Header: 'Status', accessor: 'status' },
        { Header: 'Created At', accessor: 'createdAt' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading users...</div>
            </div>
        );
    }

    return (
        <>
            <TableControls
                title="User Management"
                onSearch={setSearchTerm}
                exportData={filteredUsers}
                exportColumns={columnsForExport}
                actionButton={
                    <Button onClick={handleAddNew}>Add New User</Button>
                }
            />
            
            <div className="bg-white rounded-xl shadow-soft-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-semibold text-slate-500 uppercase border-b bg-slate-50">
                                <th className="p-4">Profile</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Phone</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Last Login</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-slate-500">
                                        {searchTerm ? 'No users found matching your search.' : 'No users available.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map(user => (
                                    <tr key={user.id} className="border-b last:border-0 text-slate-700 hover:bg-slate-50/70">
                                        <td className="p-4">
                                            {user.profilePicture ? (
                                                <img 
                                                    src={user.profilePicture} 
                                                    alt={getFullName(user)}
                                                    className="w-10 h-10 object-cover rounded-full bg-slate-100"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YxZjVmOSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOWNhMGE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj5Vc2VyPC90ZXh0Pjwvc3ZnPg==';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
                                                    {user.firstName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-slate-800">
                                                {getFullName(user)}
                                            </div>
                                        </td>
                                        <td className="p-4">{user.email}</td>
                                        <td className="p-4">{user.phoneNumber}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {user.role?.name || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(user.status)}
                                        </td>
                                        <td className="p-4 text-xs text-slate-500">
                                            {user.credential?.lastLogin 
                                                ? new Date(user.credential.lastLogin).toLocaleDateString()
                                                : 'Never'
                                            }
                                        </td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => handleEdit(user)} 
                                                    className="text-slate-500 hover:text-primaryEnd p-1.5 rounded-md hover:bg-slate-100 text-xs font-semibold transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(user.id)} 
                                                    className="text-slate-500 hover:text-coral p-1.5 rounded-md hover:bg-slate-100 text-xs font-semibold transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="mt-6">
                    <AdminPagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={setCurrentPage} 
                    />
                </div>
            )}
            
            {isModalOpen && (
                <UserEditModal 
                    user={editingUser}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                    roles={roles}
                />
            )}
        </>
    );
};

export default UserManagementPage;