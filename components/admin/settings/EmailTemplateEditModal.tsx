import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '../../../types';
import Button from '../../shared/Button';

interface EmailTemplateEditModalProps {
    template?: EmailTemplate | null;
    onClose: () => void;
    onSave: (template: Partial<EmailTemplate>) => void;
}

const EmailTemplateEditModal: React.FC<EmailTemplateEditModalProps> = ({ template, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<EmailTemplate>>({
        name: '',
        subject: '',
        body: '',
        type: 'TRANSACTIONAL',
        status: 'active'
    });

    // Define availableVariables as a constant array
    const availableVariables = [
        'customer_name', 'customer_email', 'order_id', 'order_total', 
        'shipping_address', 'tracking_number', 'tracking_link',
        'estimated_delivery', 'delivery_date', 'review_url', 'support_url',
        'shop_url', 'welcome_code', 'failure_reason', 'payment_retry_url',
        'cancellation_date', 'product_name', 'current_stock', 'reorder_level'
    ];

    useEffect(() => {
        if (template) {
            setFormData({
                name: template.name,
                subject: template.subject,
                body: template.body,
                type: template.type,
                status: template.status
            });
        }
    }, [template]);

    const handleChange = (field: keyof EmailTemplate, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.subject || !formData.body) {
            alert('Please fill in all required fields');
            return;
        }
        onSave(formData);
    };

    const templateTypes = [
        { value: 'TRANSACTIONAL', label: 'Transactional' },
        { value: 'MARKETING', label: 'Marketing' },
        { value: 'SYSTEM', label: 'System' },
        { value: 'NOTIFICATION', label: 'Notification' }
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" >
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold">{template ? 'Edit Email Template' : 'New Email Template'}</h2>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Template Name *</label>
                                <input 
                                    type="text" 
                                    value={formData.name} 
                                    onChange={e => handleChange('name', e.target.value)} 
                                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Template Type</label>
                                <select 
                                    value={formData.type} 
                                    onChange={e => handleChange('type', e.target.value)} 
                                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                                >
                                    {templateTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Subject *</label>
                            <input 
                                type="text" 
                                value={formData.subject} 
                                onChange={e => handleChange('subject', e.target.value)} 
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                                placeholder="Order Confirmation - #{{order_id}}"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Body (HTML) *</label>
                            <div className="mb-2 p-3 bg-slate-50 rounded-lg">
                                <p className="text-sm text-slate-600 mb-2">
                                    Available variables: {availableVariables.map(v => `{{${v}}}`).join(', ')}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {/* Fixed: Wrapped example variables in quotes to prevent React from trying to evaluate them as code */}
                                    Use double curly braces for variables. Example: Hello {'{{customer_name}}'}, your order {'{{order_id}}'} is confirmed!
                                </p>
                            </div>
                            <textarea 
                                value={formData.body} 
                                onChange={e => handleChange('body', e.target.value)} 
                                rows={12} 
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-sm"
                                placeholder="<h1>Hello {{customer_name}}!</h1><p>Your order {{order_id}} has been confirmed.</p>"
                                required
                            ></textarea>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 flex justify-end space-x-2 flex-shrink-0">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">{template ? 'Update' : 'Create'} Template</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmailTemplateEditModal;