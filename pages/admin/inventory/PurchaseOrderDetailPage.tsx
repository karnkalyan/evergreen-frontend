import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_PURCHASE_ORDERS, MOCK_SUPPLIERS } from '../../../data/mockData';
import Button from '../../../components/shared/Button';

const getStatusClasses = (status: string) => {
  switch (status) {
    case 'Received': return 'bg-green-100 text-green-800';
    case 'Pending': return 'bg-yellow-100 text-yellow-800';
    case 'Cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-slate-100 text-slate-800';
  }
};

const PurchaseOrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const po = MOCK_PURCHASE_ORDERS.find(p => p.id === id);

    if (!po) {
        return (
            <div>
                <h1 className="text-3xl font-poppins font-bold text-slate-800">Purchase Order Not Found</h1>
                 <Link to="/admin/inventory/purchases" className="text-primaryEnd hover:underline mt-4 inline-block">← Back to Purchase Orders</Link>
            </div>
        );
    }
    
    const supplier = MOCK_SUPPLIERS.find(s => s.id === po.supplierId);

    return (
        <div>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <Link to="/admin/inventory/purchases" className="text-sm font-semibold text-primaryEnd hover:underline">← Back to Purchase Orders</Link>
                    <h1 className="text-3xl font-poppins font-bold text-slate-800 mt-1">Purchase Order #{po.id}</h1>
                    <p className="text-sm text-slate-500">
                        Date: {new Date(po.date).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Link to={`/admin/inventory/purchases/edit/${po.id}`}>
                        <Button variant="secondary">Edit PO</Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-soft-md">
                    <h2 className="text-xl font-poppins font-bold text-slate-800 mb-4">Items</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-semibold text-slate-500 uppercase border-b bg-slate-50">
                                    <th className="p-3">Product</th>
                                    <th className="p-3 text-center">Quantity</th>
                                    <th className="p-3 text-right">Cost/Item</th>
                                    <th className="p-3 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {po.items.map((item, index) => (
                                    <tr key={index} className="border-b last:border-b-0">
                                        <td className="p-3 font-semibold">{item.productName}</td>
                                        <td className="p-3 text-center">{item.quantity}</td>
                                        <td className="p-3 text-right">${item.costPerItem.toFixed(2)}</td>
                                        <td className="p-3 text-right font-semibold">${(item.quantity * item.costPerItem).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-soft-md">
                        <h2 className="text-xl font-poppins font-bold text-slate-800 mb-4">Details</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-600">Status:</span>
                                 <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusClasses(po.status)}`}>
                                    {po.status}
                                </span>
                            </div>
                             <div className="flex justify-between font-bold text-base pt-2 border-t">
                                <span>Total Cost:</span>
                                <span>${po.totalCost.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    {supplier && (
                        <div className="bg-white p-6 rounded-xl shadow-soft-md">
                            <h2 className="text-xl font-poppins font-bold text-slate-800 mb-4">Supplier</h2>
                            <div className="space-y-1 text-sm">
                                <p className="font-semibold">{supplier.name}</p>
                                <p className="text-slate-600">{supplier.contactPerson}</p>
                                <p className="text-slate-600">{supplier.email}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderDetailPage;
