import React, { useState, useMemo } from 'react';
import { PRODUCTS } from '../../../data/mockData';
import { Product } from '../../../types';
import TableControls from '../../../components/admin/TableControls';
import AdminPagination from '../../../components/admin/AdminPagination';

const getStockStatus = (stock: number): { text: string; className: string } => {
    if (stock <= 0) {
        return { text: 'Out of Stock', className: 'bg-red-100 text-red-800' };
    }
    if (stock < 20) {
        return { text: 'Low Stock', className: 'bg-amber-100 text-amber-800' };
    }
    return { text: 'In Stock', className: 'bg-green-100 text-green-800' };
};


const StockControlPage: React.FC = () => {
    const [products] = useState<Product[]>(PRODUCTS);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const ITEMS_PER_PAGE = 10;

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        const lowercasedQuery = searchTerm.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(lowercasedQuery) ||
            p.sku.toLowerCase().includes(lowercasedQuery)
        );
    }, [products, searchTerm]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    const columnsForExport = [
        { Header: 'SKU', accessor: 'sku' },
        { Header: 'Product Name', accessor: 'name' },
        { Header: 'Stock Level', accessor: 'stock' },
        { Header: 'Status', accessor: (row: Product) => getStockStatus(row.stock).text },
    ];
    
    return (
        <div>
            <TableControls
                title="Stock Control"
                onSearch={setSearchTerm}
                exportData={filteredProducts}
                exportColumns={columnsForExport}
            />
            <div className="bg-white rounded-xl shadow-soft-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-semibold text-slate-500 uppercase border-b bg-slate-50">
                                <th className="p-4">Product</th>
                                <th className="p-4">SKU</th>
                                <th className="p-4 text-center">Stock Level</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {paginatedProducts.map(product => {
                                const status = getStockStatus(product.stock);
                                return (
                                <tr key={product.id} className="border-b last:border-0 text-slate-700 hover:bg-slate-50/70">
                                    <td className="p-4">
                                        <div className="font-semibold text-slate-800 flex items-center space-x-3">
                                            <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded-md bg-slate-100" />
                                            <span className="max-w-xs truncate">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-slate-500">{product.sku}</td>
                                    <td className="p-4 text-center font-semibold text-slate-800">{product.stock}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.className}`}>
                                            {status.text}
                                        </span>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
            {totalPages > 1 && (
                <div className="mt-6">
                    <AdminPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}
        </div>
    );
};

export default StockControlPage;
