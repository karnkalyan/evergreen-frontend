// src/components/admin/settings/AutomationSettings.tsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../../components/shared/Button';
import { ICONS } from '../../constants';
import { AutomationRule, EmailTemplate } from '../../types';
import AutomationRuleModal from '../../components/admin/settings/AutomationRuleModal';
import { emailAutomationService } from '../../lib/emailAutomationService';

const Switch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; }> = ({ enabled, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`${enabled ? 'bg-primaryEnd' : 'bg-slate-300'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primaryEnd focus:ring-offset-2`}
    >
        <span
            className={`${enabled ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);

const AutomationSettings: React.FC = () => {
    const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
    const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
    const [editingAutomation, setEditingAutomation] = useState<AutomationRule | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [rules, templates] = await Promise.all([
                emailAutomationService.getAutomationRules(),
                emailAutomationService.getEmailTemplates()
            ]);
            setAutomationRules(rules);
            setEmailTemplates(templates);
        } catch (error) {
            console.error('Error loading automation data:', error);
            toast.error('Failed to load automation rules');
        } finally {
            setLoading(false);
        }
    };

    const handleEditAutomation = (rule: AutomationRule) => {
        setEditingAutomation(rule);
        setIsAutomationModalOpen(true);
    };
    
    const handleSaveAutomation = async (ruleData: Partial<AutomationRule>) => {
        try {
            let response;
            if (editingAutomation?.id) {
                response = await emailAutomationService.updateAutomationRule(editingAutomation.id, ruleData);
                toast.success("Rule updated successfully!");
            } else {
                response = await emailAutomationService.createAutomationRule(ruleData);
                toast.success("Rule created successfully!");
            }

            if (response.success) {
                await loadData();
                setIsAutomationModalOpen(false);
                setEditingAutomation(null);
            } else {
                toast.error(response.message || 'Failed to save rule');
            }
        } catch (error: any) {
            console.error('Error saving automation rule:', error);
            toast.error(error.message || 'Failed to save rule');
        }
    };
    
    const handleToggleAutomation = async (id: number, currentStatus: 'active' | 'inactive') => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            const response = await emailAutomationService.updateAutomationRule(id, { status: newStatus });
            
            if (response.success) {
                setAutomationRules(automationRules.map(r => 
                    r.id === id ? { ...r, status: newStatus } : r
                ));
                toast.success(`Rule ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
            } else {
                toast.error(response.message || 'Failed to update rule');
            }
        } catch (error: any) {
            console.error('Error toggling automation rule:', error);
            toast.error(error.message || 'Failed to update rule');
        }
    };
    
    const handleDeleteAutomation = async (id: number) => {
        toast((t) => (
            <div className="p-4 bg-white rounded-lg shadow-lg">
                <p className="text-center text-sm text-slate-700 mb-4">Delete this automation rule?</p>
                <div className="flex justify-center space-x-3">
                    <Button variant="secondary" size="sm" onClick={() => toast.dismiss(t.id)}>Cancel</Button>
                    <Button variant="danger" size="sm" onClick={async () => {
                        try {
                            const response = await emailAutomationService.deleteAutomationRule(id);
                            if (response.success) {
                                setAutomationRules(automationRules.filter(rule => rule.id !== id));
                                toast.dismiss(t.id);
                                toast.success("Rule deleted successfully!");
                            } else {
                                toast.error(response.message || 'Failed to delete rule');
                            }
                        } catch (error: any) {
                            toast.error(error.message || 'Failed to delete rule');
                        }
                    }}>Delete</Button>
                </div>
            </div>
        ));
    };

    const getTemplateName = (templateId: number) => {
        const template = emailTemplates.find(t => t.id === templateId);
        return template?.name || 'Unknown Template';
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-soft-md">
                <div className="flex items-center justify-center min-h-32">
                    <div className="text-lg">Loading automation rules...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-soft-md">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-xl font-poppins font-bold text-slate-800">Automation Rules</h2>
                <Button 
                    size="sm" 
                    onClick={() => { setEditingAutomation(null); setIsAutomationModalOpen(true); }}
                    disabled={emailTemplates.length === 0}
                >
                    Add New Rule
                </Button>
            </div>
            
            {emailTemplates.length === 0 && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-800 text-sm">
                        No email templates available. Please create email templates first before adding automation rules.
                    </p>
                </div>
            )}

            <div className="space-y-3">
                {automationRules.map(rule => (
                    <div key={rule.id} className="flex items-center p-3 bg-slate-50 rounded-lg border">
                        <div className="flex-grow">
                            <p className="font-semibold text-sm text-slate-800">{rule.name}</p>
                            <p className="text-xs text-slate-500">
                                When <span className="font-semibold">{rule.trigger.replace('_', ' ').toLowerCase()}</span>, wait{' '}
                                <span className="font-semibold">{rule.delayHours} hours</span> and send "{' '}
                                <span className="font-semibold">{getTemplateName(rule.templateId)}</span>"
                            </p>
                            {rule.description && (
                                <p className="text-xs text-slate-400 mt-1">{rule.description}</p>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch 
                                enabled={rule.status === 'active'} 
                                onChange={() => handleToggleAutomation(rule.id, rule.status)} 
                            />
                            <button 
                                onClick={() => handleEditAutomation(rule)} 
                                className="p-2 text-slate-500 hover:text-primaryEnd rounded-md hover:bg-slate-200" 
                                title="Edit"
                            >
                                {React.cloneElement(ICONS.edit, { className: 'w-4 h-4'})}
                            </button>
                            <button 
                                onClick={() => handleDeleteAutomation(rule.id)} 
                                className="p-2 text-slate-500 hover:text-coral rounded-md hover:bg-slate-200" 
                                title="Delete"
                            >
                                {React.cloneElement(ICONS.trash, { className: 'w-4 h-4'})}
                            </button>
                        </div>
                    </div>
                ))}
                {automationRules.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                        No automation rules found. Create your first rule to get started.
                    </div>
                )}
            </div>
            {isAutomationModalOpen && (
                <AutomationRuleModal 
                    rule={editingAutomation} 
                    templates={emailTemplates} 
                    onClose={() => {
                        setIsAutomationModalOpen(false);
                        setEditingAutomation(null);
                    }} 
                    onSave={handleSaveAutomation} 
                />
            )}
        </div>
    );
};

export default AutomationSettings;