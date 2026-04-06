import React, { useState, useMemo } from 'react';
import Button from '../../../components/shared/Button';
import { MOCK_PROMOTIONS } from '../../../data/mockData';
import { Promotion } from '../../../types';
import { ICONS } from '../../../constants';
import { toast } from 'react-hot-toast';
import TableControls from '../../../components/admin/TableControls';
import AdminPagination from '../../../components/admin/AdminPagination';

const getStatusClasses = (status: Promotion['status']) => {
  switch (status) {
    case 'Active': return 'bg-green-100 text-green-800';
    case 'Scheduled': return 'bg-sky-100 text-sky-800';
    case 'Ended': return 'bg-slate-100 text-slate-800';
  }
};

const PromotionEditModal: React.FC<{ promotion?: Promotion | null, onClose: () => void, onSave: (promo: Promotion) => void }> = ({ promotion, onClose, onSave }) => {
    const [name, setName] = useState(promotion?.name || '');
    // Add other fields...

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: promotion?.id || Date.now(),
            name,
            type: 'Sitewide Discount', // Placeholder
            status: 'Scheduled', // Placeholder
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
        });
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b"><h2 className="text-xl font-bold">{promotion ? 'Edit Promotion' : 'New Promotion'}</h2></div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Promotion Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg"/>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 flex justify-end space-x-2">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Promotion</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const PromotionsPage: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>(MOCK_PROMOTIONS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const ITEMS_PER_PAGE = 10;

    const handleAddNew = () => {
        setEditingPromo(null);
        setIsModalOpen(true);
    };

    const handleEdit = (promo: Promotion) => {
        setEditingPromo(promo);
        setIsModalOpen(true);
    };

    const handleSave = (promoToSave: Promotion) => {
        if (editingPromo) {
            setPromotions(promotions.map(p => p.id === promoToSave.id ? promoToSave : p));
            toast.success("Promotion updated!");
        } else {
            setPromotions([...promotions, promoToSave]);
            toast.success("Promotion created!");
        }
    };
    
    const handleDelete = (id: number) => {
        toast((t) => (
            <div className="p-4 bg-white rounded-lg shadow-lg">
                <p className="text-center text-sm text-slate-700 mb-4">Are you sure you want to delete this promotion?</p>
                <div className="flex justify-center space-x-3">
                    <Button variant="secondary" size="sm" onClick={() => toast.dismiss(t.id)}>Cancel</Button>
                    <Button variant="danger" size="sm" onClick={() => {
                        setPromotions(promotions.filter(p => p.id !== id));
                        toast.dismiss(t.id);
                        toast.success("Promotion deleted.");
                    }}>Delete</Button>
                </div>
            </div>
        ), { duration: Infinity, position: 'top-center' });
    };
    
    const filteredPromotions = useMemo(() => {
        if (!searchTerm) return promotions;
        return promotions.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [promotions, searchTerm]);

    const paginatedPromotions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredPromotions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredPromotions, currentPage]);

    const totalPages = Math.ceil(filteredPromotions.length / ITEMS_PER_PAGE);

    const columnsForExport = [
        { Header: 'Name', accessor: 'name' },
        { Header: 'Type', accessor: 'type' },
        { Header: 'Status', accessor: 'status' },
        { Header: 'Start Date', accessor: 'startDate' },
        { Header: 'End Date', accessor: 'endDate' },
    ];
    
    return (
        <>
            <TableControls
                title="Promotions"
                onSearch={setSearchTerm}
                exportData={filteredPromotions}
                exportColumns={columnsForExport}
                actionButton={<Button onClick={handleAddNew}>Add New Promotion</Button>}
            />
            <div className="bg-white rounded-xl shadow-soft-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                         <thead>
                            <tr className="text-xs font-semibold text-slate-500 uppercase border-b bg-slate-50">
                                <th className="p-4">Name</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Duration</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="text-sm">
                            {paginatedPromotions.map(promo => (
                                <tr key={promo.id} className="border-b last:border-0 text-slate-700 hover:bg-slate-50/70">
                                    <td className="p-4 font-semibold text-slate-800">{promo.name}</td>
                                    <td className="p-4">{promo.type}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses(promo.status)}`}>
                                            {promo.status}
                                        </span>
                                    </td>
                                    <td className="p-4">{`${new Date(promo.startDate).toLocaleDateString()} - ${new Date(promo.endDate).toLocaleDateString()}`}</td>
                                    <td className="p-4">
                                        <div className="flex space-x-1">
                                            <button onClick={() => handleEdit(promo)} className="p-2 text-slate-500 hover:text-primaryEnd rounded-md hover:bg-slate-100">{React.cloneElement(ICONS.edit, { className: 'w-4 h-4'})}</button>
                                            <button onClick={() => handleDelete(promo.id)} className="p-2 text-slate-500 hover:text-coral rounded-md hover:bg-slate-100">{React.cloneElement(ICONS.trash, { className: 'w-4 h-4'})}</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {totalPages > 1 && (
                <div className="mt-6">
                    <AdminPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}
             {isModalOpen && (
                <PromotionEditModal 
                    promotion={editingPromo}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default PromotionsPage;