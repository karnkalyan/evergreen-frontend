import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-hot-toast';
import Button from '../shared/Button';

interface TableControlsProps {
    title: string;
    actionButton?: React.ReactNode;
    onSearch: (query: string) => void;
    // For exports, we need the raw data and columns
    exportData: any[];
    exportColumns: { Header: string, accessor: string | ((row: any) => any) }[];
}

const TableControls: React.FC<TableControlsProps> = ({ title, actionButton, onSearch, exportData, exportColumns }) => {
    const [isExportOpen, setIsExportOpen] = useState(false);

    const getRowValue = (row: any, accessor: string | ((row: any) => any)) => {
        if (typeof accessor === 'function') {
            return accessor(row);
        }
        // Basic nested accessor support
        return accessor.split('.').reduce((o, i) => (o ? o[i] : ''), row);
    };

    const exportToCSV = () => {
        const headers = exportColumns.map(c => c.Header).join(',');
        const rows = exportData.map(row => 
            exportColumns.map(col => `"${getRowValue(row, col.accessor)}"`).join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${title.toLowerCase().replace(/ /g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExportOpen(false);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        (doc as any).autoTable({
            head: [exportColumns.map(c => c.Header)],
            body: exportData.map(row => 
                exportColumns.map(col => getRowValue(row, col.accessor))
            ),
        });
        doc.save(`${title.toLowerCase().replace(/ /g, '_')}.pdf`);
        setIsExportOpen(false);
    };
    
    const copyToClipboard = () => {
        const headers = exportColumns.map(c => c.Header).join('\t');
        const rows = exportData.map(row => 
            exportColumns.map(col => getRowValue(row, col.accessor)).join('\t')
        );
        navigator.clipboard.writeText([headers, ...rows].join('\n'));
        toast.success('Data copied to clipboard!');
        setIsExportOpen(false);
    };

    const printTable = () => {
        // This is a simplified print function. For better results, a dedicated print stylesheet is recommended.
        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>' + title + '</title>');
            printWindow.document.write('<style>body{font-family:sans-serif;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:8px;} th{background-color:#f2f2f2;}</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(`<h1>${title}</h1>`);
            printWindow.document.write('<table>');
            printWindow.document.write('<thead><tr>');
            exportColumns.forEach(col => printWindow.document.write(`<th>${col.Header}</th>`));
            printWindow.document.write('</tr></thead><tbody>');
            exportData.forEach(row => {
                printWindow.document.write('<tr>');
                exportColumns.forEach(col => printWindow.document.write(`<td>${getRowValue(row, col.accessor)}</td>`));
                printWindow.document.write('</tr>');
            });
            printWindow.document.write('</tbody></table>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
        setIsExportOpen(false);
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-3xl font-poppins font-bold text-slate-800 mb-4 md:mb-0">{title}</h1>
            <div className="flex items-center space-x-2 w-full md:w-auto">
                <input
                    type="text"
                    placeholder="Search table..."
                    onChange={e => onSearch(e.target.value)}
                    className="w-full md:w-64 p-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-primaryStart focus:border-primaryStart"
                />
                 <div className="relative">
                    <Button variant="secondary" size="sm" onClick={() => setIsExportOpen(!isExportOpen)}>Export</Button>
                    {isExportOpen && (
                        <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-soft-lg p-2 z-20 border">
                            <button onClick={copyToClipboard} className="w-full text-left block px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-md">Copy</button>
                            <button onClick={exportToCSV} className="w-full text-left block px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-md">CSV</button>
                            <button onClick={exportToPDF} className="w-full text-left block px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-md">PDF</button>
                            <button onClick={printTable} className="w-full text-left block px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-md">Print</button>
                        </div>
                    )}
                </div>
                {actionButton}
            </div>
        </div>
    );
};

export default TableControls;