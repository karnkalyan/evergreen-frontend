import React, { useState } from 'react';
import Button from '../../components/shared/Button';
import { toast } from 'react-hot-toast';

interface PaymentMethod {
    id: number;
    type: 'Visa' | 'Mastercard';
    last4: string;
    expiry: string;
}

const PaymentMethodModal: React.FC<{ onClose: () => void, onSave: (pm: PaymentMethod) => void }> = ({ onClose, onSave }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock data, no real validation
        onSave({ id: Date.now(), type: 'Visa', last4: '1234', expiry: '12/28' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b"><h3 className="font-bold text-lg">Add New Card</h3></div>
                    <div className="p-6 space-y-4">
                         <input placeholder="Card Number" className="w-full p-2 border rounded"/>
                         <div className="grid grid-cols-2 gap-4">
                            <input placeholder="MM/YY" className="w-full p-2 border rounded"/>
                            <input placeholder="CVC" className="w-full p-2 border rounded"/>
                         </div>
                    </div>
                    <div className="p-4 bg-slate-50 flex justify-end space-x-2">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Card</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PaymentMethodsPage: React.FC = () => {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
        { id: 1, type: 'Visa', last4: '4242', expiry: '08/26' },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = (pm: PaymentMethod) => {
        setPaymentMethods(prev => [...prev, pm]);
        toast.success("Payment method added!");
    };

    const handleDelete = (id: number) => {
        setPaymentMethods(prev => prev.filter(p => p.id !== id));
        toast.success("Payment method removed.");
    };

    return (
        <div>
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-serif font-bold text-slate-900">Payment Methods</h1>
                <Button size="sm" onClick={() => setIsModalOpen(true)}>Add New Card</Button>
            </div>

            <div className="space-y-4">
                {paymentMethods.map(pm => (
                    <div key={pm.id} className="bg-slate-50/70 p-4 rounded-xl border flex justify-between items-center">
                        <div className="flex items-center">
                             <img src={`/images/payment-${pm.type.toLowerCase()}.svg`} alt={pm.type} className="h-8 mr-4"/>
                            <div>
                                <p className="font-semibold">{pm.type} ending in {pm.last4}</p>
                                <p className="text-sm text-slate-600">Expires {pm.expiry}</p>
                            </div>
                        </div>
                         <Button variant="ghost" size="sm" className="text-coral hover:bg-red-50" onClick={() => handleDelete(pm.id)}>Delete</Button>
                    </div>
                ))}
            </div>
            {isModalOpen && <PaymentMethodModal onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </div>
    );
};

export default PaymentMethodsPage;