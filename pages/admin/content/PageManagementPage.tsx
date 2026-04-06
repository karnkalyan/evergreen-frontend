import React, { useState, useMemo } from 'react';
import Button from '../../../components/shared/Button';
import { MOCK_CMS_PAGES } from '../../../data/mockData';
import { ICONS } from '../../../constants';
import { CmsPage } from '../../../types';
import { toast } from 'react-hot-toast';
import TableControls from '../../../components/admin/TableControls';
import AdminPagination from '../../../components/admin/AdminPagination';


const PageEditModal: React.FC<{ page?: CmsPage | null, onClose: () => void, onSave: (page: CmsPage) => void }> = ({ page, onClose, onSave }) => {
    const [title, setTitle] = useState(page?.title || '');
    const [slug, setSlug] = useState(page?.slug || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: page?.id || Date.now(),
            title,
            slug,
            lastUpdated: new Date().toISOString().split('T')[0],
        });
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" data-aos="zoom-in-up">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b"><h2 className="text-xl font-bold">{page ? 'Edit Page' : 'New Page'}</h2></div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"/>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 flex justify-end space-x-2">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Page</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const PageManagementPage: React.FC = () => {
    const [pages, setPages] = useState<CmsPage[]>(MOCK_CMS_PAGES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<CmsPage | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const ITEMS_PER_PAGE = 10;

    const handleAddNew = () => {
        setEditingPage(null);
        setIsModalOpen(true);
    };

    const handleEdit = (page: CmsPage) => {
        setEditingPage(page);
        setIsModalOpen(true);
    };

    const handleSave = (pageToSave: CmsPage) => {
        if (editingPage) {
            setPages(pages.map(p => p.id === pageToSave.id ? pageToSave : p));
            toast.success("Page updated!");
        } else {
            setPages([...pages, pageToSave]);
            toast.success("Page created!");
        }
    };
    
    const handleDelete = (id: number) => {
        toast((t) => (
            <div className="p-4 bg-white rounded-lg shadow-lg">
                <p className="text-center text-sm text-slate-700 mb-4">Are you sure you want to delete this page?</p>
                <div className="flex justify-center space-x-3">
                    <Button variant="secondary" size="sm" onClick={() => toast.dismiss(t.id)}>Cancel</Button>
                    <Button variant="danger" size="sm" onClick={() => {
                        setPages(pages.filter(p => p.id !== id));
                        toast.dismiss(t.id);
                        toast.success("Page deleted.");
                    }}>Delete</Button>
                </div>
            </div>
        ), { duration: Infinity, position: 'top-center' });
    };

    const filteredPages = useMemo(() => {
        if (!searchTerm) return pages;
        return pages.filter(p =>
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.slug.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [pages, searchTerm]);

    const paginatedPages = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredPages.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredPages, currentPage]);

    const totalPages = Math.ceil(filteredPages.length / ITEMS_PER_PAGE);

    const columnsForExport = [
        { Header: 'ID', accessor: 'id' },
        { Header: 'Title', accessor: 'title' },
        { Header: 'Slug', accessor: 'slug' },
        { Header: 'Last Updated', accessor: 'lastUpdated' },
    ];
    
    return (
        <>
            <TableControls
                title="Pages"
                onSearch={setSearchTerm}
                exportData={filteredPages}
                exportColumns={columnsForExport}
                actionButton={<Button onClick={handleAddNew}>Add New Page</Button>}
            />
            <div className="bg-white rounded-xl shadow-soft-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-semibold text-slate-500 uppercase border-b bg-slate-50">
                                <th className="p-4">Title</th>
                                <th className="p-4">Slug</th>
                                <th className="p-4">Last Updated</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {paginatedPages.map(page => (
                                <tr key={page.id} className="border-b last:border-0 text-slate-700 hover:bg-slate-50/70">
                                    <td className="p-4 font-semibold text-slate-800">{page.title}</td>
                                    <td className="p-4 font-mono text-xs text-slate-500">{page.slug}</td>
                                    <td className="p-4">{new Date(page.lastUpdated).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <div className="flex space-x-1">
                                            <button onClick={() => handleEdit(page)} className="p-2 text-slate-500 hover:text-primaryEnd rounded-md hover:bg-slate-100">{React.cloneElement(ICONS.edit, { className: 'w-4 h-4'})}</button>
                                            <button onClick={() => handleDelete(page.id)} className="p-2 text-slate-500 hover:text-coral rounded-md hover:bg-slate-100">{React.cloneElement(ICONS.trash, { className: 'w-4 h-4'})}</button>
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
                <PageEditModal 
                    page={editingPage}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

export default PageManagementPage;