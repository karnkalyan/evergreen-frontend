// src/components/admin/settings/EmailTemplatesSettings.tsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../../components/shared/Button';
import { ICONS } from '../../constants';
import { EmailTemplate } from '../../types';
import EmailTemplateEditModal from '../../components/admin/settings/EmailTemplateEditModal';
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

const EmailTemplatesSettings: React.FC = () => {
    const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [editingEmail, setEditingEmail] = useState<EmailTemplate | null>(null);

    useEffect(() => {
        loadEmailTemplates();
    }, []);

    const loadEmailTemplates = async () => {
        setLoading(true);
        try {
            const templates = await emailAutomationService.getEmailTemplates();
            setEmailTemplates(templates);
        } catch (error) {
            console.error('Error loading email templates:', error);
            toast.error('Failed to load email templates');
        } finally {
            setLoading(false);
        }
    };

    const handleEditEmail = (template: EmailTemplate) => {
        setEditingEmail(template);
        setIsEmailModalOpen(true);
    };
    
    const handleSaveEmail = async (templateData: Partial<EmailTemplate>) => {
        try {
            let response;
            if (editingEmail?.id) {
                response = await emailAutomationService.updateEmailTemplate(editingEmail.id, templateData);
                toast.success("Template updated successfully!");
            } else {
                response = await emailAutomationService.createEmailTemplate(templateData);
                toast.success("Template created successfully!");
            }

            if (response.success) {
                await loadEmailTemplates();
                setIsEmailModalOpen(false);
                setEditingEmail(null);
            } else {
                toast.error(response.message || 'Failed to save template');
            }
        } catch (error: any) {
            console.error('Error saving email template:', error);
            toast.error(error.message || 'Failed to save template');
        }
    };
    
    const handleToggleEmail = async (id: number, currentStatus: 'active' | 'inactive') => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            const response = await emailAutomationService.updateEmailTemplate(id, { status: newStatus });
            
            if (response.success) {
                setEmailTemplates(emailTemplates.map(t => 
                    t.id === id ? { ...t, status: newStatus } : t
                ));
                toast.success(`Template ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
            } else {
                toast.error(response.message || 'Failed to update template');
            }
        } catch (error: any) {
            console.error('Error toggling email template:', error);
            toast.error(error.message || 'Failed to update template');
        }
    };
    
    const handleDeleteEmail = async (id: number) => {
        toast((t) => (
            <div className="p-4 bg-white rounded-lg shadow-lg">
                <p className="text-center text-sm text-slate-700 mb-4">Delete this email template?</p>
                <div className="flex justify-center space-x-3">
                    <Button variant="secondary" size="sm" onClick={() => toast.dismiss(t.id)}>Cancel</Button>
                    <Button variant="danger" size="sm" onClick={async () => {
                        try {
                            const response = await emailAutomationService.deleteEmailTemplate(id);
                            if (response.success) {
                                setEmailTemplates(emailTemplates.filter(temp => temp.id !== id));
                                toast.dismiss(t.id);
                                toast.success("Template deleted successfully!");
                            } else {
                                toast.error(response.message || 'Failed to delete template');
                            }
                        } catch (error: any) {
                            toast.error(error.message || 'Failed to delete template');
                        }
                    }}>Delete</Button>
                </div>
            </div>
        ));
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-soft-md">
                <div className="flex items-center justify-center min-h-32">
                    <div className="text-lg">Loading email templates...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-soft-md">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-xl font-poppins font-bold text-slate-800">Email Templates</h2>
                <Button size="sm" onClick={() => { setEditingEmail(null); setIsEmailModalOpen(true); }}>
                    Add New Template
                </Button>
            </div>
            <div className="space-y-3">
                {emailTemplates.map(template => (
                    <div key={template.id} className="flex items-center p-3 bg-slate-50 rounded-lg border">
                        <div className="flex-grow">
                            <p className="font-semibold text-sm text-slate-800">{template.name}</p>
                            <p className="text-xs text-slate-500">Subject: {template.subject}</p>
                            <p className="text-xs text-slate-400">Type: {template.type} • {template.isSystem ? 'System' : 'Custom'}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch 
                                enabled={template.status === 'active'} 
                                onChange={() => handleToggleEmail(template.id, template.status)} 
                            />
                            {!template.isSystem && (
                                <>
                                    <button 
                                        onClick={() => handleEditEmail(template)} 
                                        className="p-2 text-slate-500 hover:text-primaryEnd rounded-md hover:bg-slate-200" 
                                        title="Edit"
                                    >
                                        {React.cloneElement(ICONS.edit, { className: 'w-4 h-4'})}
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteEmail(template.id)} 
                                        className="p-2 text-slate-500 hover:text-coral rounded-md hover:bg-slate-200" 
                                        title="Delete"
                                    >
                                        {React.cloneElement(ICONS.trash, { className: 'w-4 h-4'})}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
                {emailTemplates.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                        No email templates found. Create your first template to get started.
                    </div>
                )}
            </div>
            {isEmailModalOpen && (
                <EmailTemplateEditModal 
                    onClose={() => {
                        setIsEmailModalOpen(false);
                        setEditingEmail(null);
                    }} 
                    onSave={handleSaveEmail} 
                    template={editingEmail} 
                />
            )}
        </div>
    );
};

export default EmailTemplatesSettings;