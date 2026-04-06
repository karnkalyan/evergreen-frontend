// src/components/admin/settings/AutomationRuleModal.tsx
import React, { useState, useEffect } from 'react';
import { AutomationRule, EmailTemplate } from '../../../types';
import Button from '../../shared/Button';
import SearchableSelect from '../../shared/SearchableSelect';

interface AutomationRuleModalProps {
    rule?: AutomationRule | null;
    templates: EmailTemplate[];
    onClose: () => void;
    onSave: (rule: Partial<AutomationRule>) => void;
}

const AutomationRuleModal: React.FC<AutomationRuleModalProps> = ({ rule, templates, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<AutomationRule>>({
        name: '',
        description: '',
        trigger: 'ORDER_PLACED',
        delayHours: 0,
        templateId: 0,
        status: 'active',
        priority: 1,
        maxAttempts: 3
    });

    useEffect(() => {
        if (rule) {
            setFormData({
                name: rule.name,
                description: rule.description,
                trigger: rule.trigger,
                delayHours: rule.delayHours,
                templateId: rule.templateId,
                status: rule.status,
                priority: rule.priority,
                maxAttempts: rule.maxAttempts
            });
        }
    }, [rule]);

    const handleChange = (field: keyof AutomationRule, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.templateId) {
            alert('Please fill in all required fields');
            return;
        }
        onSave(formData);
    };

    const triggerOptions = [
        { value: 'ORDER_PLACED', label: 'Order Placed' },
        { value: 'ORDER_SHIPPED', label: 'Order Shipped' },
        { value: 'ORDER_DELIVERED', label: 'Order Delivered' },
        { value: 'ORDER_CANCELLED', label: 'Order Cancelled' },
        { value: 'PAYMENT_FAILED', label: 'Payment Failed' },
        { value: 'USER_REGISTERED', label: 'User Registered' },
        { value: 'LOW_STOCK', label: 'Low Stock' }
    ];

    const templateOptions = templates
        .filter(t => t.status === 'active')
        .map(t => ({ value: t.id, label: t.name }));

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold">{rule ? 'Edit Automation Rule' : 'New Automation Rule'}</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Rule Name *</label>
                            <input 
                                type="text" 
                                value={formData.name} 
                                onChange={e => handleChange('name', e.target.value)} 
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea 
                                value={formData.description} 
                                onChange={e => handleChange('description', e.target.value)} 
                                rows={2}
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                                placeholder="Describe what this automation rule does..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Trigger *</label>
                                <SearchableSelect 
                                    options={triggerOptions} 
                                    value={formData.trigger} 
                                    onChange={val => handleChange('trigger', val)} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Delay (Hours)</label>
                                <input 
                                    type="number" 
                                    value={formData.delayHours} 
                                    onChange={e => handleChange('delayHours', parseInt(e.target.value) || 0)} 
                                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Template *</label>
                            <SearchableSelect 
                                options={templateOptions} 
                                value={formData.templateId} 
                                onChange={val => handleChange('templateId', val)} 
                                placeholder="Select a template..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                                <input 
                                    type="number" 
                                    value={formData.priority} 
                                    onChange={e => handleChange('priority', parseInt(e.target.value) || 1)} 
                                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                                    min="1"
                                    max="10"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Max Attempts</label>
                                <input 
                                    type="number" 
                                    value={formData.maxAttempts} 
                                    onChange={e => handleChange('maxAttempts', parseInt(e.target.value) || 3)} 
                                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                                    min="1"
                                    max="10"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 flex justify-end space-x-2">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">{rule ? 'Update' : 'Create'} Rule</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AutomationRuleModal;