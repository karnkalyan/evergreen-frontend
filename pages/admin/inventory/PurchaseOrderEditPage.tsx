import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PurchaseOrder, PurchaseOrderItem } from '../../../types';
import { MOCK_PURCHASE_ORDERS, MOCK_SUPPLIERS, PRODUCTS } from '../../../data/mockData';
import Button from '../../../components/shared/Button';
import SearchableSelect from '../../../components/shared/SearchableSelect';
import { ICONS } from '../../../constants';
import { toast } from 'react-hot-toast';

const PurchaseOrderEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [po, setPo] = useState<Partial<PurchaseOrder>>({});
    const [items, setItems] = useState<PurchaseOrderItem[]>([]);

    useEffect(() => {
        if (isEditing) {
            const foundPo = MOCK_PURCHASE_ORDERS.find(p => p.id === id);
            if (foundPo) {
                setPo(foundPo);
                setItems(foundPo.items);
            }
        } else {
            setPo({
                date: new Date().toISOString().split('T')[0],
                status: 'Pending',
            });
            setItems([]);
        }
    }, [id, isEditing]);

    const totalCost = useMemo(() => {
        return items.reduce((sum, item) => sum + item.quantity * item.costPerItem, 0);
    }, [items]);

    const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
        const newItems = [...items];
        const item = newItems[index] as any;
        item[field] = value;

        // If product changes, update name
        if (field === 'productId') {
            const product = PRODUCTS.find(p => p.id === value);
            item['productName'] = product?.name || 'Unknown Product';
        }
        setItems(newItems);
    };
    
    const addItem = () => {
        setItems([...items, { productId: 0, productName: '', quantity: 1, costPerItem: 0 }]);
    };
    
    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success(`Purchase Order ${isEditing ? 'updated' : 'created'} successfully!`);
        navigate('/admin/inventory/purchases');
    };
    
    const supplierOptions = MOCK_SUPPLIERS.map(s => ({ value: s.id, label: s.name }));
    const productOptions = PRODUCTS.map(p => ({ value: p.id, label: p.name }));
    const statusOptions = [
        { value: 'Pending', label: 'Pending' },
        { value: 'Received', label: 'Received' },
        { value: 'Cancelled', label: 'Cancelled' },
    ];
    
    return (
        <div>
            <div className="mb-6">
                <Link to="/admin/inventory/purchases" className="text-sm font-semibold text-primaryEnd hover:underline">← Back to Purchase Orders</Link>
                <h1 className="text-3xl font-poppins font-bold text-slate-800 mt-1">
                    {isEditing ? `Edit PO #${po.id}` : 'Create New Purchase Order'}
                </h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-soft-md">
                        <h2 className="text-xl font-poppins font-bold text-slate-800 mb-4">Items</h2>
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg">
                                    <div className="flex-grow">
                                        <SearchableSelect
                                            options={productOptions}
                                            value={item.productId}
                                            onChange={(val) => handleItemChange(index, 'productId', val)}
                                            placeholder="Select product..."
                                        />
                                    </div>
                                    <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))} className="w-20 p-2 bg-white border border-slate-300 rounded-md" placeholder="Qty" />
                                    <input type="number" step="0.01" value={item.costPerItem} onChange={(e) => handleItemChange(index, 'costPerItem', parseFloat(e.target.value))} className="w-24 p-2 bg-white border border-slate-300 rounded-md" placeholder="Cost" />
                                    <button type="button" onClick={() => removeItem(index)} className="p-2 text-coral hover:text-red-700">{React.cloneElement(ICONS.trash, { className: 'w-5 h-5'})}</button>
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="secondary" size="sm" onClick={addItem} className="mt-4">Add Item</Button>
                    </div>

                    <div className="space-y-8 sticky top-24">
                        <div className="bg-white p-6 rounded-xl shadow-soft-md">
                            <h2 className="text-xl font-poppins font-bold text-slate-800 mb-4">Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                                    <SearchableSelect options={supplierOptions} value={po.supplierId} onChange={val => setPo(p => ({ ...p, supplierId: val as number }))} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <SearchableSelect options={statusOptions} value={po.status} onChange={val => setPo(p => ({ ...p, status: val as 'Pending' | 'Received' | 'Cancelled' }))} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input type="date" value={po.date} onChange={e => setPo(p => ({ ...p, date: e.target.value }))} className="w-full p-2 bg-white border border-slate-300 rounded-lg"/>
                                </div>
                                <div className="text-right font-bold text-xl pt-4 border-t">
                                    Total: ${totalCost.toFixed(2)}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <Link to="/admin/inventory/purchases">
                                <Button type="button" variant="secondary">Cancel</Button>
                            </Link>
                            <Button type="submit">Save PO</Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PurchaseOrderEditPage;