import React, { useState, useEffect, useCallback } from 'react';
import Button from '../../components/shared/Button';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
// 1. Import the new address service
import { addressService, ApiAddress } from '../../lib/addressService'; 

// --- CRITICAL FIX: Address Interface (Mapping frontend names to API names) ---
// This interface defines the data structure used internally in the React component.
interface Address {
    id: number;
    isDefault: boolean;
    name: string;
    address: string; // Maps to streetAddress in the API
    city: string;
    state: string; // Must be included
    pincode: string; // Maps to zipCode in the API
}

// Helper function to convert API response to component's internal structure
const apiToLocalAddress = (apiAddress: ApiAddress): Address => ({
    id: apiAddress.id,
    isDefault: apiAddress.isDefault,
    name: apiAddress.name,
    address: apiAddress.streetAddress, // Map
    city: apiAddress.city,
    state: apiAddress.state,
    pincode: apiAddress.zipCode, // Map
});

// Helper function to convert component's internal structure to API payload
const localToApiPayload = (localAddress: Address): Partial<ApiAddress> => ({
    name: localAddress.name,
    streetAddress: localAddress.address, // Map back
    city: localAddress.city,
    state: localAddress.state,
    zipCode: localAddress.pincode, // Map back
    isDefault: localAddress.isDefault,
});


// --- Address Modal Component (Unchanged) ---
const AddressModal: React.FC<{ address?: Address | null, onClose: () => void, onSave: (address: Address) => Promise<void> }> = ({ address, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Address>>(address || { isDefault: false, state: '' });
    const [isSaving, setIsSaving] = useState(false); 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Handle checkbox specifically
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData(prev => ({...prev, [e.target.name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => { 
        e.preventDefault();
        
        if (!formData.name || !formData.address || !formData.city || !formData.pincode || !formData.state) {
            toast.error("Please fill in all address fields.");
            return;
        }

        setIsSaving(true);
        try {
            await onSave({ id: address?.id || 0, ...formData } as Address); // ID is required for type, but will be ignored for create
            onClose();
        } catch (error) {
            // Error handled by parent, but keep saving state cleanup here
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b"><h3 className="font-bold text-lg">{address ? 'Edit Address' : 'Add New Address'}</h3></div>
                    <div className="p-6 space-y-4">
                           <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Address Label (e.g. Home, Office)" className="w-full p-2 border rounded" required/>
                           <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Street Address" className="w-full p-2 border rounded" required/>
                           <div className="grid grid-cols-3 gap-4">
                                <input name="city" value={formData.city || ''} onChange={handleChange} placeholder="City" className="w-full p-2 border rounded" required/>
                                <input name="state" value={formData.state || ''} onChange={handleChange} placeholder="State" className="w-full p-2 border rounded" required/>
                                <input name="pincode" value={formData.pincode || ''} onChange={handleChange} placeholder="Pincode/Zip" className="w-full p-2 border rounded" required/>
                           </div>
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    name="isDefault" 
                                    checked={!!formData.isDefault} 
                                    onChange={handleChange} 
                                    className="mr-2"
                                />
                                <label>Set as Default Address</label>
                            </div>
                    </div>
                    <div className="p-4 bg-slate-50 flex justify-end space-x-2">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Address'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Addresses Page Component (Updated) ---

const AddressesPage: React.FC = () => {
    const { user: authUser } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    // 2. Renamed fetchInitialAddress to fetchAddresses
    const fetchAddresses = useCallback(async () => {
        if (!authUser?.id) {
            setLoading(false);
            return;
        }

        try {
            // 3. Use the new addressService to fetch all addresses
            const apiAddresses = await addressService.getUserAddresses();
            // Map the API data to the local component state structure
            setAddresses(apiAddresses.map(apiToLocalAddress));
        } catch (err: any) {
            setError(err.message || 'Failed to fetch addresses.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [authUser]);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);


    // --- CRITICAL UPDATE: API CRUD LOGIC using addressService ---
    const handleSave = async (localAddress: Address) => {
        
        const payload = localToApiPayload(localAddress);

        try {
            let result: ApiAddress;

            if (localAddress.id) {
                // UPDATE EXISTING ADDRESS
                result = await addressService.updateAddress(localAddress.id, payload);
                
                // If the default flag changed, it was handled by the API, so refresh all data.
                if (payload.isDefault !== undefined && payload.isDefault !== addresses.find(a => a.id === localAddress.id)?.isDefault) {
                    await fetchAddresses();
                } else {
                    // Quick local state update for simple detail change
                    setAddresses(prev => prev.map(a => a.id === result.id ? apiToLocalAddress(result) : a));
                }
                toast.success("Address updated successfully!");

            } else {
                // CREATE NEW ADDRESS
                result = await addressService.createAddress(payload as any); // Cast for safety, ensure required fields are present
                
                // Refresh all data to ensure correct default status is reflected
                await fetchAddresses(); 
                toast.success("New address added successfully!");
            }
        } catch (error: any) {
            toast.error(`Failed to save address: ${error.message || 'Server error'}`);
            throw error; 
        }
    };
    
    const handleSetDefault = async (addressId: number) => {
        try {
            await addressService.setDefaultAddress(addressId);
            toast.success("Default address changed successfully!");
            // Refresh addresses to reflect the change in the UI
            await fetchAddresses();
        } catch (error: any) {
            toast.error(`Failed to set default: ${error.message || 'Server error'}`);
        }
    };


    const handleDelete = async (id: number) => {
        try {
            await addressService.deleteAddress(id);
            toast.success("Address removed successfully.");
            setAddresses(prev => prev.filter(a => a.id !== id));
            // Optional: Re-fetch if the deleted one was the last one, to check edge cases.
        } catch (error: any) {
             toast.error(`Failed to delete address: ${error.message || 'Server error'}`);
        }
    };
    
    
    // --- Render Logic ---
    
    if (loading) {
        return <div className="text-center py-10 text-xl text-slate-500">Loading addresses...</div>;
    }
    
    if (error) {
        return <div className="text-center py-10 text-xl text-red-500">Error: {error}</div>;
    }


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-serif font-bold text-slate-900">My Addresses</h1>
                <Button size="sm" onClick={() => { setEditingAddress(null); setIsModalOpen(true); }}>Add New Address</Button>
            </div>
            
            <div className="space-y-4">
                {addresses.length === 0 ? (
                     <div className="p-6 text-center bg-slate-100 rounded-xl text-slate-500">
                        No addresses found. Click 'Add New Address' to save one.
                     </div>
                ) : (
                    addresses.map(addr => (
                        <div key={addr.id} className="bg-slate-50/70 p-4 rounded-xl border flex justify-between items-start">
                            <div>
                                {addr.isDefault && (
                                    <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full mb-2 inline-block">
                                        Default
                                    </span>
                                )}
                                <p className="font-semibold">{addr.name}</p>
                                <p className="text-sm text-slate-600">{`${addr.address}, ${addr.city}, ${addr.state} - ${addr.pincode}`}</p>
                            </div>
                            <div className="flex space-x-2 items-center">
                                {
                                    !addr.isDefault && (
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            onClick={() => handleSetDefault(addr.id)}
                                        >
                                            Set Default
                                        </Button>
                                    )
                                }
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => { setEditingAddress(addr); setIsModalOpen(true); }}
                                >
                                    Edit
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-600 hover:bg-red-50" 
                                    onClick={() => handleDelete(addr.id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {isModalOpen && <AddressModal address={editingAddress} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </div>
    );
};

export default AddressesPage;