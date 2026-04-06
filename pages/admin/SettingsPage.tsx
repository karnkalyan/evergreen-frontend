import React, { useState } from 'react';
import { useApp } from '../../hooks/useApp';
import HomepageLayout from '../../components/settings/HomepageLayout';
import ShippingSettings from '../../components/settings/ShippingSettings';
import AppearanceSettings from '../../components/settings/AppearanceSettings';
import EmailTemplatesSettings from '../../components/settings/EmailTemplatesSettings';
import AutomationSettings from '../../components/settings/AutomationSettings';
import IntegrationsSettings from '../../components/settings/IntegrationsSettings';
import GeneralSettings from '../../components/settings/GeneralSettings';
import Button from '../../components/shared/Button';
import PaymentMethodAdminPage from '@/components/admin/PaymentMethodAdminPage';

const SettingsPage: React.FC = () => {
    const { homepageSectionsLoading, homepageSectionsError, refreshHomepageSections } = useApp();
    const [activeTab, setActiveTab] = useState('homepage');

    // Tabs configuration
    const tabs = [
        { id: 'homepage', label: 'Homepage' },
        { id: 'shipping', label: 'Shipping' },
        { id: 'payment_methods', label: 'Payment Method' },
        // { id: 'appearance', label: 'Appearance' },
        { id: 'email_templates', label: 'Email Templates' },
        { id: 'automation', label: 'Automation' },
        { id: 'integrations', label: 'Integrations' },
        { id: 'general', label: 'General' },
    ];

    // Loading state for homepage sections
    if (activeTab === 'homepage' && homepageSectionsLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryEnd"></div>
                <span className="ml-4 text-slate-600">Loading homepage sections...</span>
            </div>
        );
    }

    // Error state for homepage sections
    if (activeTab === 'homepage' && homepageSectionsError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                    <div className="text-red-600 text-lg">❌</div>
                    <h3 className="text-red-800 font-semibold ml-2">Error Loading Homepage Sections</h3>
                </div>
                <p className="text-red-700 mb-4">{homepageSectionsError}</p>
                <Button onClick={refreshHomepageSections} variant="primary">
                    Try Again
                </Button>
            </div>
        );
    }

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'homepage':
                return <HomepageLayout />;
            case 'shipping':
                return <ShippingSettings />;
            case 'payment_methods':
                return <PaymentMethodAdminPage />;
            // case 'appearance':
            //     return <AppearanceSettings />;
            case 'email_templates':
                return <EmailTemplatesSettings />;
            case 'automation':
                return <AutomationSettings />;
            case 'integrations':
                return <IntegrationsSettings />;
            case 'general':
                return <GeneralSettings />;
            default:
                return <HomepageLayout />;
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-poppins font-bold text-slate-800 mb-6">Settings</h1>

            <div className="mb-6 border-b border-slate-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                ? 'border-primaryEnd text-primaryEnd'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            } whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="space-y-8">
                {renderActiveTab()}
            </div>
        </div>
    );
};

export default SettingsPage;