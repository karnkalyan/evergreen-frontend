import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../../components/shared/Button';
import { integrationsService } from '../../lib/integrationsService';
import { IntegrationSettings } from '../../types';

const IntegrationsSettings: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState<string | null>(null);
    const [settings, setSettings] = useState<IntegrationSettings | null>(null);
    const [formData, setFormData] = useState({
        // SMTP Settings
        smtpHost: '',
        smtpPort: 587,
        smtpUsername: '',
        smtpPassword: '',
        smtpFromEmail: '',
        smtpFromName: '',
        smtpEncryption: 'tls',
        
        // Admin Emails
        adminEmails: [''],
        
        // SMS Settings
        smsProvider: 'twilio',
        smsAccountSid: '',
        smsAuthToken: '',
        smsFromNumber: '',
        
        // Test phone number for SMS
        testPhoneNumber: '',
        
        // Payment Settings
        paymentProvider: 'stripe',
        paymentPublicKey: '',
        paymentSecretKey: '',
        paymentWebhookSecret: '',
        
        // reCAPTCHA
        recaptchaSiteKey: '',
        recaptchaSecretKey: ''
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const settingsData = await integrationsService.getIntegrationSettings();
            if (settingsData) {
                setSettings(settingsData);
                // Only update form data with actual values from server, don't overwrite with empty strings
                setFormData(prev => ({
                    ...prev,
                    // SMTP Settings - only update if we have actual values
                    smtpHost: settingsData.smtpHost || prev.smtpHost,
                    smtpPort: settingsData.smtpPort || prev.smtpPort,
                    smtpUsername: settingsData.smtpUsername || prev.smtpUsername,
                    smtpPassword: settingsData.smtpPassword || prev.smtpPassword,
                    smtpFromEmail: settingsData.smtpFromEmail || prev.smtpFromEmail,
                    smtpFromName: settingsData.smtpFromName || prev.smtpFromName,
                    smtpEncryption: settingsData.smtpEncryption || prev.smtpEncryption,
                    
                    // Admin Emails - handle both string and array formats
                    adminEmails: settingsData.adminEmails 
                        ? (Array.isArray(settingsData.adminEmails) 
                            ? settingsData.adminEmails 
                            : [settingsData.adminEmails].filter(Boolean))
                        : [''],
                    
                    // SMS Settings
                    smsProvider: settingsData.smsProvider || prev.smsProvider,
                    smsAccountSid: settingsData.smsAccountSid || prev.smsAccountSid,
                    smsAuthToken: settingsData.smsAuthToken || prev.smsAuthToken,
                    smsFromNumber: settingsData.smsFromNumber || prev.smsFromNumber,
                    
                    // Payment Settings
                    paymentProvider: settingsData.paymentProvider || prev.paymentProvider,
                    paymentPublicKey: settingsData.paymentPublicKey || prev.paymentPublicKey,
                    paymentSecretKey: settingsData.paymentSecretKey || prev.paymentSecretKey,
                    paymentWebhookSecret: settingsData.paymentWebhookSecret || prev.paymentWebhookSecret,
                    
                    // reCAPTCHA
                    recaptchaSiteKey: settingsData.recaptchaSiteKey || prev.recaptchaSiteKey,
                    recaptchaSecretKey: settingsData.recaptchaSecretKey || prev.recaptchaSecretKey
                }));
            }
        } catch (error) {
            console.error('Error loading integration settings:', error);
            toast.error('Failed to load integration settings');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'smtpPort' ? parseInt(value) || 587 : value
        }));
    };

    // Admin Emails handlers
    const handleAdminEmailChange = (index: number, value: string) => {
        const updatedEmails = [...formData.adminEmails];
        updatedEmails[index] = value;
        setFormData(prev => ({
            ...prev,
            adminEmails: updatedEmails
        }));
    };

    const addAdminEmail = () => {
        setFormData(prev => ({
            ...prev,
            adminEmails: [...prev.adminEmails, '']
        }));
    };

    const removeAdminEmail = (index: number) => {
        if (formData.adminEmails.length > 1) {
            const updatedEmails = formData.adminEmails.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                adminEmails: updatedEmails
            }));
        } else {
            toast.error('At least one admin email is required');
        }
    };

    const validateSection = (section: string): boolean => {
        if (section === 'smtp') {
            return !!(formData.smtpHost && formData.smtpUsername && formData.smtpPassword && formData.smtpFromEmail);
        } else if (section === 'adminEmails') {
            // Validate that all admin emails are valid and at least one exists
            const validEmails = formData.adminEmails.filter(email => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return email.trim() && emailRegex.test(email);
            });
            return validEmails.length > 0;
        } else if (section === 'sms') {
            return !!(formData.smsAccountSid && formData.smsAuthToken && formData.smsFromNumber);
        } else if (section === 'payment') {
            return !!(formData.paymentPublicKey && formData.paymentSecretKey);
        } else if (section === 'recaptcha') {
            return !!(formData.recaptchaSiteKey && formData.recaptchaSecretKey);
        }
        return true;
    };

    const handleSaveSettings = async (section: string) => {
        if (!validateSection(section)) {
            toast.error(`Please fill in all required fields for ${section}`);
            return;
        }

        setSaving(true);
        try {
            let updateData: any = {};
            
            if (section === 'smtp') {
                updateData = {
                    smtpHost: formData.smtpHost,
                    smtpPort: formData.smtpPort,
                    smtpUsername: formData.smtpUsername,
                    smtpPassword: formData.smtpPassword,
                    smtpFromEmail: formData.smtpFromEmail,
                    smtpFromName: formData.smtpFromName,
                    smtpEncryption: formData.smtpEncryption
                };
            } else if (section === 'adminEmails') {
                // Filter out empty emails and validate format
                const validEmails = formData.adminEmails
                    .filter(email => email.trim())
                    .map(email => email.trim())
                    .filter(email => {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        return emailRegex.test(email);
                    });

                if (validEmails.length === 0) {
                    toast.error('Please enter at least one valid admin email');
                    return;
                }

                updateData = {
                    adminEmails: validEmails
                };
            } else if (section === 'sms') {
                updateData = {
                    smsProvider: formData.smsProvider,
                    smsAccountSid: formData.smsAccountSid,
                    smsAuthToken: formData.smsAuthToken,
                    smsFromNumber: formData.smsFromNumber
                };
            } else if (section === 'payment') {
                updateData = {
                    paymentProvider: formData.paymentProvider,
                    paymentPublicKey: formData.paymentPublicKey,
                    paymentSecretKey: formData.paymentSecretKey,
                    paymentWebhookSecret: formData.paymentWebhookSecret
                };
            } else if (section === 'recaptcha') {
                updateData = {
                    recaptchaSiteKey: formData.recaptchaSiteKey,
                    recaptchaSecretKey: formData.recaptchaSecretKey
                };
            }

            const response = await integrationsService.updateIntegrationSettings(updateData);
            
            if (response.success) {
                toast.success(`${section === 'adminEmails' ? 'Admin Emails' : section.toUpperCase()} settings saved successfully!`);
                // Update settings state without reloading entire form
                if (response.data) {
                    setSettings(response.data);
                }
            } else {
                toast.error(response.message || `Failed to save ${section} settings`);
            }
        } catch (error: any) {
            console.error(`Error saving ${section} settings:`, error);
            toast.error(error.message || `Failed to save ${section} settings`);
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async (type: string) => {
        if (type === 'sms' && !formData.testPhoneNumber) {
            toast.error('Please enter a test phone number');
            return;
        }

        if (!validateSection(type)) {
            toast.error(`Please fill in all required fields for ${type}`);
            return;
        }

        setTesting(type);
        try {
            let testResponse;
            
            if (type === 'smtp') {
                testResponse = await integrationsService.testSmtpConnection({
                    smtpHost: formData.smtpHost,
                    smtpPort: formData.smtpPort,
                    smtpUsername: formData.smtpUsername,
                    smtpPassword: formData.smtpPassword,
                    smtpEncryption: formData.smtpEncryption
                });
            } else if (type === 'sms') {
                testResponse = await integrationsService.testSmsGateway({
                    smsProvider: formData.smsProvider,
                    smsAccountSid: formData.smsAccountSid,
                    smsAuthToken: formData.smsAuthToken,
                    smsFromNumber: formData.smsFromNumber,
                    testPhoneNumber: formData.testPhoneNumber
                });
            } else if (type === 'payment') {
                testResponse = await integrationsService.testPaymentGateway({
                    paymentProvider: formData.paymentProvider,
                    paymentPublicKey: formData.paymentPublicKey,
                    paymentSecretKey: formData.paymentSecretKey
                });
            }

            if (testResponse?.success) {
                toast.success(testResponse.message || `${type.toUpperCase()} test successful!`);
                // Update only the test status without reloading entire form data
                setSettings(prev => prev ? {
                    ...prev,
                    ...(type === 'smtp' && { isSmtpTested: true }),
                    ...(type === 'sms' && { isSmsTested: true }),
                    ...(type === 'payment' && { isPaymentTested: true })
                } : null);
            } else {
                toast.error(testResponse?.message || `${type.toUpperCase()} test failed`);
            }
        } catch (error: any) {
            console.error(`Error testing ${type}:`, error);
            toast.error(error.message || `${type.toUpperCase()} test failed`);
        } finally {
            setTesting(null);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="bg-white p-6 rounded-xl shadow-soft-md">
                    <div className="flex items-center justify-center min-h-64">
                        <div className="text-lg">Loading integration settings...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Email Configuration Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Email Setup (SMTP) */}
                <div className="bg-white p-6 rounded-xl shadow-soft-md">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-xl font-poppins font-bold text-slate-800">
                            Email Setup (SMTP)
                        </h2>
                        {settings?.isSmtpTested && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Tested
                            </span>
                        )}
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings('smtp'); }} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                SMTP Host *
                            </label>
                            <input 
                                type="text" 
                                name="smtpHost"
                                value={formData.smtpHost}
                                onChange={handleInputChange}
                                placeholder="smtp.gmail.com" 
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Port *
                                </label>
                                <input 
                                    type="number" 
                                    name="smtpPort"
                                    value={formData.smtpPort}
                                    onChange={handleInputChange}
                                    placeholder="587" 
                                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Username *
                                </label>
                                <input 
                                    type="text" 
                                    name="smtpUsername"
                                    value={formData.smtpUsername}
                                    onChange={handleInputChange}
                                    placeholder="your-email@gmail.com" 
                                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Password *
                                </label>
                                <input 
                                    type="password" 
                                    name="smtpPassword"
                                    value={formData.smtpPassword}
                                    onChange={handleInputChange}
                                    placeholder="••••••••" 
                                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    From Email *
                                </label>
                                <input 
                                    type="email" 
                                    name="smtpFromEmail"
                                    value={formData.smtpFromEmail}
                                    onChange={handleInputChange}
                                    placeholder="noreply@company.com" 
                                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    From Name
                                </label>
                                <input 
                                    type="text" 
                                    name="smtpFromName"
                                    value={formData.smtpFromName}
                                    onChange={handleInputChange}
                                    placeholder="Your Company" 
                                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Encryption
                            </label>
                            <select 
                                name="smtpEncryption"
                                value={formData.smtpEncryption}
                                onChange={handleInputChange}
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
                            >
                                <option value="tls">TLS</option>
                                <option value="ssl">SSL</option>
                                <option value="none">None</option>
                            </select>
                        </div>
                        <div className="flex space-x-3">
                            <Button 
                                type="submit" 
                                variant="secondary"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save SMTP Settings'}
                            </Button>
                            <Button 
                                type="button"
                                variant="primary"
                                onClick={() => handleTestConnection('smtp')}
                                disabled={testing === 'smtp' || !validateSection('smtp')}
                            >
                                {testing === 'smtp' ? 'Testing...' : 'Test Connection'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Admin Email List */}
                <div className="bg-white p-6 rounded-xl shadow-soft-md">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-xl font-poppins font-bold text-slate-800">
                            Admin Email List
                        </h2>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {formData.adminEmails.filter(email => email.trim()).length} Email(s)
                        </span>
                    </div>
                    <div className="space-y-4">
                        <div className="text-sm text-slate-600 mb-4">
                            <p>These email addresses will receive company notifications for:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>New order notifications</li>
                                <li>Order status updates</li>
                                <li>Payment status changes</li>
                                <li>Low stock alerts</li>
                                <li>System notifications</li>
                            </ul>
                        </div>

                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {formData.adminEmails.map((email, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => handleAdminEmailChange(index, e.target.value)}
                                        placeholder="admin@company.com"
                                        className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-sm"
                                    />
                                    {formData.adminEmails.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeAdminEmail(index)}
                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove email"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addAdminEmail}
                                className="flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Add Another Email</span>
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => handleSaveSettings('adminEmails')}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Admin Emails'}
                            </Button>
                        </div>

                        <div className="text-xs text-slate-500">
                            <p>• Emails will be validated before saving</p>
                            <p>• At least one admin email is required</p>
                            <p>• All notifications will be sent to these addresses</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rest of the sections remain the same */}
            {/* SMS Gateway */}
            <div className="bg-white p-6 rounded-xl shadow-soft-md">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-poppins font-bold text-slate-800">
                        SMS Gateway
                    </h2>
                    {settings?.isSmsTested && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Tested
                        </span>
                    )}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings('sms'); }} className="space-y-4 max-w-2xl">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            SMS Provider
                        </label>
                        <select 
                            name="smsProvider"
                            value={formData.smsProvider}
                            onChange={handleInputChange}
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
                        >
                            <option value="twilio">Twilio</option>
                            <option value="vonage">Vonage</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            API Key / Account SID *
                        </label>
                        <input 
                            type="text" 
                            name="smsAccountSid"
                            value={formData.smsAccountSid}
                            onChange={handleInputChange}
                            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            API Secret / Auth Token *
                        </label>
                        <input 
                            type="password" 
                            name="smsAuthToken"
                            value={formData.smsAuthToken}
                            onChange={handleInputChange}
                            placeholder="••••••••" 
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            From Phone Number *
                        </label>
                        <input 
                            type="text" 
                            name="smsFromNumber"
                            value={formData.smsFromNumber}
                            onChange={handleInputChange}
                            placeholder="+1234567890" 
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Test Phone Number *
                            </label>
                            <input 
                                type="text" 
                                name="testPhoneNumber"
                                value={formData.testPhoneNumber}
                                onChange={handleInputChange}
                                placeholder="+1234567890" 
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                            />
                        </div>
                        <div className="flex items-end">
                            <Button 
                                type="button"
                                variant="primary"
                                onClick={() => handleTestConnection('sms')}
                                disabled={testing === 'sms' || !validateSection('sms') || !formData.testPhoneNumber}
                                className="w-full"
                            >
                                {testing === 'sms' ? 'Testing...' : 'Test SMS'}
                            </Button>
                        </div>
                    </div>
                    <Button 
                        type="submit" 
                        variant="secondary"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save SMS Settings'}
                    </Button>
                </form>
            </div>

            {/* Payment Gateway */}
            <div className="bg-white p-6 rounded-xl shadow-soft-md">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-poppins font-bold text-slate-800">
                        Payment Gateway
                    </h2>
                    {settings?.isPaymentTested && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Tested
                        </span>
                    )}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings('payment'); }} className="space-y-4 max-w-2xl">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Payment Provider
                        </label>
                        <select 
                            name="paymentProvider"
                            value={formData.paymentProvider}
                            onChange={handleInputChange}
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
                        >
                            <option value="stripe">Stripe</option>
                            <option value="paypal">PayPal</option>
                            <option value="razorpay">Razorpay</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Public Key *
                        </label>
                        <input 
                            type="text" 
                            name="paymentPublicKey"
                            value={formData.paymentPublicKey}
                            onChange={handleInputChange}
                            placeholder="pk_test_xxxxxxxxxxxxxxxxxxxxxxxx" 
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Secret Key *
                        </label>
                        <input 
                            type="password" 
                            name="paymentSecretKey"
                            value={formData.paymentSecretKey}
                            onChange={handleInputChange}
                            placeholder="Enter your Stripe secret key" 
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Webhook Secret
                        </label>
                        <input 
                            type="password" 
                            name="paymentWebhookSecret"
                            value={formData.paymentWebhookSecret}
                            onChange={handleInputChange}
                            placeholder="whsec_xxxxxxxxxxxxxxxx" 
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                        />
                    </div>
                    <div className="flex space-x-3">
                        <Button 
                            type="submit" 
                            variant="secondary"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Payment Settings'}
                        </Button>
                        <Button 
                            type="button"
                            variant="primary"
                            onClick={() => handleTestConnection('payment')}
                            disabled={testing === 'payment' || !validateSection('payment')}
                        >
                            {testing === 'payment' ? 'Testing...' : 'Test Connection'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* reCAPTCHA Settings */}
            <div className="bg-white p-6 rounded-xl shadow-soft-md">
                <h2 className="text-xl font-poppins font-bold text-slate-800 mb-4 border-b pb-2">
                    reCAPTCHA Settings
                </h2>
                <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings('recaptcha'); }} className="space-y-4 max-w-2xl">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            reCAPTCHA Site Key *
                        </label>
                        <input 
                            type="text" 
                            name="recaptchaSiteKey"
                            value={formData.recaptchaSiteKey}
                            onChange={handleInputChange}
                            placeholder="6Lexxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            reCAPTCHA Secret Key *
                        </label>
                        <input 
                            type="password" 
                            name="recaptchaSecretKey"
                            value={formData.recaptchaSecretKey}
                            onChange={handleInputChange}
                            placeholder="6Lexxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                        />
                    </div>
                    <Button 
                        type="submit" 
                        variant="secondary"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save reCAPTCHA Settings'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default IntegrationsSettings;