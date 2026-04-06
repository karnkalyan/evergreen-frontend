import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Role, UserFormData } from '../../types';
import TableControls from '../../components/admin/TableControls';
import AdminPagination from '../../components/admin/AdminPagination';
import Button from '../../components/shared/Button';
import UserEditModal from '../../components/admin/UserEditModal';
import { userService } from '../../lib/userService';
import { orderService } from '../../lib/orderService';
import { toast } from 'react-hot-toast';

const CustomerListPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [customerStats, setCustomerStats] = useState<{[key: number]: { totalOrders: number, totalSpent: number }}>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const ITEMS_PER_PAGE = 10;

    // Fetch users and roles from API
    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, rolesData] = await Promise.all([
                userService.getUsers(),
                userService.getRoles()
            ]);
            setUsers(usersData);
            setRoles(rolesData);
            
            // Fetch order statistics for all customers
            await fetchCustomerStats(usersData);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Fetch customer order statistics
    const fetchCustomerStats = async (usersData: User[]) => {
        try {
            const stats: {[key: number]: { totalOrders: number, totalSpent: number }} = {};
            
            // Get all customers (users with customer role)
            const customers = usersData.filter(user => user.role?.name?.toLowerCase() === 'customer');
            
            // Fetch orders for each customer
            for (const customer of customers) {
                try {
                    const response = await orderService.getUserOrders(customer.id);
                    const customerOrders = response.orders || [];
                    
                    // Calculate total spent (only from paid orders)
                    const totalSpent = customerOrders
                        .filter(order => order.paymentStatus === 'paid' && order.status !== 'cancelled')
                        .reduce((total, order) => total + (order.totalAmount || 0), 0);
                    
                    stats[customer.id] = {
                        totalOrders: customerOrders.length,
                        totalSpent: totalSpent
                    };
                } catch (error) {
                    console.error(`Error fetching orders for customer ${customer.id}:`, error);
                    stats[customer.id] = {
                        totalOrders: 0,
                        totalSpent: 0
                    };
                }
            }
            
            setCustomerStats(stats);
        } catch (error) {
            console.error('Error fetching customer stats:', error);
            toast.error('Failed to load customer statistics');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter only customers
    const customers = useMemo(() => {
        return users.filter(user => user.role?.name?.toLowerCase() === 'customer');
    }, [users]);

    // Get customer role for default selection
    const customerRole = useMemo(() => {
        return roles.find(role => role.name?.toLowerCase() === 'customer');
    }, [roles]);

    const handleAddNew = () => {
        setEditingUser(null);
        setModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setModalOpen(true);
    };

    const handleSave = async (userData: UserFormData, profilePictureFile?: File | null, removeProfilePicture?: boolean) => {
        try {
            const formData = new FormData();
            
            // Append all user data
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
                        Are you sure you want to delete this customer?
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
                                    setCustomerStats(prev => {
                                        const newStats = { ...prev };
                                        delete newStats[id];
                                        return newStats;
                                    });
                                    toast.dismiss(t.id);
                                    toast.success("Customer deleted successfully.");
                                } catch (error) {
                                    console.error('Error deleting customer:', error);
                                    toast.dismiss(t.id);
                                    toast.error("Failed to delete customer.");
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
        return `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`.trim();
    };

    const getTotalOrders = (user: User): number => {
        return customerStats[user.id]?.totalOrders || 0;
    };

    const getTotalSpent = (user: User): number => {
        return customerStats[user.id]?.totalSpent || 0;
    };

    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return customers;
        
        const lowercasedQuery = searchTerm.toLowerCase();
        return customers.filter(customer =>
            getFullName(customer).toLowerCase().includes(lowercasedQuery) ||
            customer.email.toLowerCase().includes(lowercasedQuery) ||
            customer.phoneNumber?.toLowerCase().includes(lowercasedQuery)
        );
    }, [customers, searchTerm]);

    const paginatedCustomers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredCustomers, currentPage]);

    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);

    const columnsForExport = [
        { Header: 'ID', accessor: 'id' },
        { Header: 'Name', accessor: (row: User) => getFullName(row) },
        { Header: 'Email', accessor: 'email' },
        { Header: 'Phone', accessor: 'phoneNumber' },
        { Header: 'Registered Date', accessor: 'createdAt' },
        { Header: 'Total Orders', accessor: (row: User) => getTotalOrders(row) },
        { Header: 'Total Spent', accessor: (row: User) => getTotalSpent(row) },
        { Header: 'Status', accessor: 'status' },
    ];

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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading customers...</div>
            </div>
        );
    }

    return (
        <div>
            <TableControls
                title="Customers"
                onSearch={setSearchTerm}
                exportData={filteredCustomers}
                exportColumns={columnsForExport}
                actionButton={
                    <Button onClick={handleAddNew}>Add New Customer</Button>
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
                                <th className="p-4">Status</th>
                                <th className="p-4">Registered</th>
                                <th className="p-4 text-center">Orders</th>
                                <th className="p-4 text-right">Total Spent</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {paginatedCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-slate-500">
                                        {searchTerm ? 'No customers found matching your search.' : 'No customers available.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedCustomers.map(customer => (
                                    <tr key={customer.id} className="border-b last:border-0 text-slate-700 hover:bg-slate-50/70">
                                        <td className="p-4">
                                            {customer.profilePicture ? (
                                                <img 
                                                    src={customer.profilePicture} 
                                                    alt={getFullName(customer)}
                                                    className="w-10 h-10 object-cover rounded-full bg-slate-100"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YxZjVmOSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOWNhMGE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj5Vc2VyPC90ZXh0Pjwvc3ZnPg==';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
                                                    {customer.firstName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 font-semibold text-slate-800">
                                            <Link to={`/admin/customers/${customer.id}`} className="hover:text-primaryEnd hover:underline">
                                                {getFullName(customer)}
                                            </Link>
                                        </td>
                                        <td className="p-4">{customer.email}</td>
                                        <td className="p-4">{customer.phoneNumber || 'N/A'}</td>
                                        <td className="p-4">
                                            {getStatusBadge(customer.status)}
                                        </td>
                                        <td className="p-4">
                                            {new Date(customer.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            {getTotalOrders(customer)}
                                        </td>
                                        <td className="p-4 text-right font-semibold">
                                            ${getTotalSpent(customer).toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => handleEdit(customer)} 
                                                    className="text-slate-500 hover:text-primaryEnd p-1.5 rounded-md hover:bg-slate-100 text-xs font-semibold transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <Link to={`/admin/customers/${customer.id}`}>
                                                    <Button variant="ghost" size="sm">View Details</Button>
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(customer.id)} 
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

            {/* Add/Edit Customer Modal */}
            {isModalOpen && (
                <UserEditModal 
                    user={editingUser}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                    roles={customerRole ? [customerRole] : []} // Only pass customer role
                />
            )}
        </div>
    );
};

export default CustomerListPage;