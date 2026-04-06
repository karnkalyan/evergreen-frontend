import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { websiteSettingsService } from '../../lib/websiteSettingsService';
import { WebsiteSettings } from '../../types';

const getBackgroundStyle = (background: any) => {
    if (!background) return '';
    if (background.type === 'solid') return background.color;
    if (background.type === 'gradient') {
        if (background.gradient?.customGradient) return background.gradient.customGradient;
        if (background.gradient?.colors && background.gradient.colors.length > 0) {
            return `linear-gradient(${background.gradient.direction || 'to right'}, ${background.gradient.colors.join(', ')})`;
        }
    }
    return '';
};

const Footer: React.FC = () => {
    const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWebsiteSettings = async () => {
            try {
                setIsLoading(true);
                const settings = await websiteSettingsService.getWebsiteSettings();
                setWebsiteSettings(settings);
            } catch (error) {
                console.error('❌ Error fetching settings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchWebsiteSettings();
    }, []);

    const siteTitle = websiteSettings?.siteTitle || 'Evergreen Medicine';
    const footerDescription = websiteSettings?.footerDescription || websiteSettings?.siteDescription;
    const footerCopyrightText = websiteSettings?.footerCopyrightText || `© ${new Date().getFullYear()} ${siteTitle}. All Rights Reserved.`;
    
    // Disclaimer text moved here
    const disclaimer = "Disclaimer: Medical information provided is for informational purposes only and does not replace professional medical advice, diagnosis, or treatment.";

    const footerContactInfo = websiteSettings?.footerContactInfo || {
        address: '123 Health St, Wellness City, CA 90210, USA',
        email: 'support@evergreenmed.com',
        phone: '+1-555-HEALTH'
    };

    const footerQuickLinks = websiteSettings?.footerQuickLinks || [];
    const footerSocialLinks = websiteSettings?.footerSocialLinks || []; // Used for Legal links

    const appearanceSettings = websiteSettings?.appearanceSettings;
    const footerStyles = appearanceSettings?.sections?.footer;
    const buttonStyles = appearanceSettings?.sections?.buttons;

    if (isLoading) {
        return (
            <footer className="bg-slate-50 py-8 border-t border-slate-200">
                <div className="container mx-auto px-4 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryEnd"></div>
                </div>
            </footer>
        );
    }

    return (
        <footer 
            style={{
                background: getBackgroundStyle(footerStyles?.main?.background),
                color: footerStyles?.main?.textColor || '#f9fafb'
            }}
        >
            <div className="container mx-auto px-4 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    
                    {/* Column 1: Brand & Newsletter */}
                    <div className="md:col-span-2 lg:col-span-1">
                        <h3 className="text-2xl font-bold font-serif mb-4" style={{ color: appearanceSettings?.colors?.primaryColor || '#3b82f6' }}>
                            {siteTitle}
                        </h3>
                        <p className="text-sm mb-4 opacity-90">{footerDescription}</p>
                        <h4 className="font-semibold mb-3 opacity-90 text-sm uppercase tracking-wider">Newsletter</h4>
                        <form className="flex">
                            <input 
                                type="email" 
                                placeholder="Your email" 
                                className="w-full rounded-l-lg p-2 text-slate-900 focus:outline-none" 
                            />
                            <button 
                                type="submit" 
                                className="px-4 rounded-r-lg font-semibold transition-opacity"
                                style={{
                                    background: getBackgroundStyle(buttonStyles?.primary?.background),
                                    color: buttonStyles?.primary?.textColor || '#ffffff'
                                }}
                            >
                                Go
                            </button>
                        </form>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4 opacity-90">Quick Links</h4>
                        <ul className="space-y-2">
                            {footerQuickLinks.map(link => (
                                <li key={link.name}>
                                    <Link to={link.path} className="hover:text-primaryEnd transition-colors text-sm opacity-80 hover:opacity-100">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Legal (Fetched from social links data) */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4 opacity-90">Legal</h4>
                        <ul className="space-y-2">
                            {footerSocialLinks.map((item) => (
                                <li key={item.platform}>
                                    <a 
                                        href={item.url} 
                                        className="hover:text-primaryEnd transition-colors text-sm opacity-80 capitalize"
                                    >
                                        {item.platform.replace(/-/g, ' ')}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Column 4: Disclaimer & Contact */}
                    <div>
                        <h4 className="font-semibold text-lg mb-2 opacity-90">Medical Disclaimer</h4>
                        <p className="text-[12px] leading-relaxed opacity-70 italic mb-6">
                            {disclaimer}
                        </p>

                        <h4 className="font-semibold text-lg mb-2 opacity-90">Contact Us</h4>
                        <p className="text-sm opacity-80 leading-relaxed">
                            {footerContactInfo.address}<br />
                            <a href={`mailto:${footerContactInfo.email}`} className="hover:underline">{footerContactInfo.email}</a><br />
                            <a href={`tel:${footerContactInfo.phone}`} className="hover:underline">{footerContactInfo.phone}</a>
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center opacity-100">
                    <p className="text-xs mb-4 md:mb-0">
                        {footerCopyrightText}
                    </p>
                    <div className="flex space-x-3 opacity-100">
                        {websiteSettings?.footerPaymentMethods?.map(payment => (
                            <img key={payment.name} src={payment.image} alt={payment.alt} className="h-6" />
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;