// InvoiceModal.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { Order } from '../../types';
import Button from './Button';

const currencySymbols: { [key: string]: string } = { USD: '$', GBP: '£' };

interface InvoiceModalProps {
    order: Order;
    onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
    const currencySymbol = currencySymbols[order.currency] || '$';

    const handlePrint = () => {
        window.print();
    };

    // Format date safely
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Get customer name from shipping address or user
    const getCustomerName = () => {
        if (order.shippingAddress?.name) {
            return order.shippingAddress.name;
        }
        if (order.user) {
            return `${order.user.firstName} ${order.user.lastName}`;
        }
        return 'Customer';
    };

    // Safe method to format payment method
    const getPaymentMethodDisplay = () => {
        const paymentMethod = order.paymentMethodCode || order.paymentMethod;
        if (!paymentMethod) return 'N/A';
        
        return paymentMethod.replace('_', ' ').toUpperCase();
    };

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Escape key handler
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const modalContent = (
        <>
            <style>
                {`
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 0.5in;
                        }
                        
                        body, html {
                            margin: 0 !important;
                            padding: 0 !important;
                            height: 100% !important;
                        }
                        
                        body * {
                            visibility: hidden;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        
                        #printable-invoice, 
                        #printable-invoice * {
                            visibility: visible;
                            margin: 0 !important;
                        }
                        
                        #printable-invoice {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            min-height: 100% !important;
                            background: white !important;
                            font-size: 12px !important;
                            line-height: 1.2 !important;
                            padding: 0.5in !important;
                            box-sizing: border-box !important;
                        }
                        
                        .no-print, 
                        .no-print * {
                            display: none !important;
                        }
                        
                        .page-break {
                            page-break-before: always;
                        }
                        
                        table {
                            page-break-inside: avoid;
                        }
                        
                        tr {
                            page-break-inside: avoid;
                            page-break-after: auto;
                        }
                    }
                    
                    @media screen {
                        #printable-invoice {
                            max-width: 8.3in;
                            margin: 0 auto;
                        }
                    }
                `}
            </style>
            <div 
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                onClick={handleBackdropClick}
            >
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center no-print">
                        <h2 className="text-lg font-bold">Invoice for Order #{order.orderNumber}</h2>
                        <div className="flex gap-2">
                             <Button onClick={handlePrint} size="sm">Print</Button>
                             <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
                        </div>
                    </div>
                    <div id="printable-invoice" className="p-8 overflow-y-auto bg-white">
                        {/* Invoice Header */}
                        <div className="flex justify-between items-start mb-6 border-b pb-4">
                            <div>
                                <h1 className="text-2xl font-bold font-serif text-primaryStart">Evergreen Medicine</h1>
                                <p className="text-sm text-slate-500">123 Health St, Wellness City, CA 90210</p>
                                <p className="text-sm text-slate-500">support@evergreenmed.com</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-semibold text-slate-800">INVOICE</h2>
                                <p className="text-sm text-slate-600"><strong>Invoice #:</strong> INV-{order.orderNumber}</p>
                                <p className="text-sm text-slate-600"><strong>Date:</strong> {formatDate(order.orderDate || order.createdAt)}</p>
                                <p className="text-sm text-slate-600"><strong>Order #:</strong> {order.orderNumber}</p>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 className="font-semibold border-b pb-1 mb-2 text-slate-800">Bill To:</h3>
                                <p className="text-sm font-medium text-slate-700">{getCustomerName()}</p>
                                <p className="text-sm text-slate-600">{order.contactEmail}</p>
                                {order.contactPhone && (
                                    <p className="text-sm text-slate-600">{order.contactPhone}</p>
                                )}
                                {order.billingAddress && (
                                    <>
                                        <p className="text-sm text-slate-600">{order.billingAddress.streetAddress}</p>
                                        <p className="text-sm text-slate-600">{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}</p>
                                    </>
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold border-b pb-1 mb-2 text-slate-800">Ship To:</h3>
                                <p className="text-sm font-medium text-slate-700">{order.shippingAddress?.name || 'N/A'}</p>
                                <p className="text-sm text-slate-600">{order.shippingAddress?.streetAddress || 'N/A'}</p>
                                <p className="text-sm text-slate-600">{order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.state || 'N/A'} {order.shippingAddress?.zipCode || 'N/A'}</p>
                            </div>
                        </div>
                        
                        {/* Items Table */}
                        <div className="mb-6">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="p-2 border border-slate-200 font-semibold text-slate-700">Item</th>
                                        <th className="p-2 border border-slate-200 font-semibold text-slate-700 text-center">SKU</th>
                                        <th className="p-2 border border-slate-200 font-semibold text-slate-700 text-center">Qty</th>
                                        <th className="p-2 border border-slate-200 font-semibold text-slate-700 text-right">Unit Price</th>
                                        <th className="p-2 border border-slate-200 font-semibold text-slate-700 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.orderItems?.map((item, index) => (
                                        <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                            <td className="p-2 border border-slate-200">
                                                <p className="font-semibold text-slate-800">{item.productName}</p>
                                                {item.variantLabel && (
                                                    <p className="text-xs text-slate-500">Variant: {item.variantLabel}</p>
                                                )}
                                            </td>
                                            <td className="p-2 border border-slate-200 text-center text-slate-600">{item.productSku}</td>
                                            <td className="p-2 border border-slate-200 text-center text-slate-700">{item.quantity}</td>
                                            <td className="p-2 border border-slate-200 text-right text-slate-700">{currencySymbol}{item.unitPrice?.toFixed(2) || '0.00'}</td>
                                            <td className="p-2 border border-slate-200 text-right font-semibold text-slate-800">
                                                {currencySymbol}{item.totalPrice?.toFixed(2) || '0.00'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Totals */}
                        <div className="flex justify-end mb-6">
                            <div className="w-full max-w-xs space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Subtotal:</span>
                                    <span className="text-slate-800">{currencySymbol}{order.subtotal?.toFixed(2) || '0.00'}</span>
                                </div>
                                {order.discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount {order.couponCode && `(${order.couponCode})`}:</span>
                                        <span>-{currencySymbol}{order.discountAmount?.toFixed(2) || '0.00'}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Tax:</span>
                                    <span className="text-slate-800">{currencySymbol}{order.taxAmount?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Shipping:</span>
                                    <span className="text-slate-800">{currencySymbol}{order.shippingAmount?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between font-bold text-base pt-2 border-t border-slate-300 mt-2">
                                    <span className="text-slate-900">Total:</span>
                                    <span className="text-slate-900">{currencySymbol}{order.totalAmount?.toFixed(2) || '0.00'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Information */}
                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs text-slate-500">
                            <div>
                                <p><strong className="text-slate-700">Payment Method:</strong> {getPaymentMethodDisplay()}</p>
                                <p><strong className="text-slate-700">Payment Status:</strong> {order.paymentStatus || 'N/A'}</p>
                            </div>
                            <div>
                                <p><strong className="text-slate-700">Shipping Method:</strong> {order.shippingMethod || 'Standard'}</p>
                                {order.trackingNumber && (
                                    <p><strong className="text-slate-700">Tracking Number:</strong> {order.trackingNumber}</p>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center text-xs text-slate-400 mt-8 pt-4 border-t border-slate-200">
                            <p>Thank you for your business!</p>
                            <p className="mt-1">If you have any questions, please contact support@evergreenmed.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    // Create portal to render outside the component hierarchy
    return ReactDOM.createPortal(
        modalContent,
        document.body
    );
};

export default InvoiceModal;