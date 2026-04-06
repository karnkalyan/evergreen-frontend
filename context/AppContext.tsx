// src/context/AppContext.tsx
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Country, HomepageSection, ShippingOption } from '../types';
import { MOCK_SHIPPING_OPTIONS, MOCK_HOMEPAGE_LAYOUT } from '../data/mockData';
import { homepageService } from '../lib/homeService';

interface AppContextType {
    country: Country;
    setCountry: (country: Country) => void;
    homepageSections: HomepageSection[];
    updateHomepageSections: (sections: HomepageSection[]) => void;
    homepageSectionsLoading: boolean;
    homepageSectionsError: string | null;
    refreshHomepageSections: () => Promise<void>;
    shippingOptions: ShippingOption[];
    updateShippingOptions: (options: ShippingOption[]) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [country, setCountry] = useState<Country>('US');
    const [homepageSections, setHomepageSections] = useState<HomepageSection[]>([]);
    const [homepageSectionsLoading, setHomepageSectionsLoading] = useState<boolean>(true);
    const [homepageSectionsError, setHomepageSectionsError] = useState<string | null>(null);
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>(MOCK_SHIPPING_OPTIONS);

    // Load homepage sections on mount
    useEffect(() => {
        loadHomepageSections();
    }, []);

    const loadHomepageSections = async () => {
        try {
            setHomepageSectionsLoading(true);
            setHomepageSectionsError(null);
            console.log('🔄 Loading homepage sections from API...');
            
            const sections = await homepageService.getHomepageSections();
            console.log('📄 Homepage sections loaded:', sections.length, 'sections');
            
            setHomepageSections(sections);
        } catch (error) {
            console.error('❌ Error loading homepage sections:', error);
            setHomepageSectionsError('Failed to load homepage sections. Using demo data instead.');
            // Fallback to mock data
            setHomepageSections(MOCK_HOMEPAGE_LAYOUT);
        } finally {
            setHomepageSectionsLoading(false);
        }
    };

    const updateHomepageSections = async (sections: HomepageSection[]) => {
        try {
            console.log('🔄 Updating homepage sections...', sections);
            
            // Update local state immediately for responsive UI
            setHomepageSections(sections);
            
            // Update backend asynchronously using bulk update
            const updateData = sections.map(section => ({
                id: section.id,
                data: section
            }));
            
            await homepageService.bulkUpdateHomepageSections(updateData);
            console.log('✅ Homepage sections updated successfully');
        } catch (error) {
            console.error('❌ Error updating homepage sections:', error);
            // Revert local state on error
            await loadHomepageSections();
            throw error;
        }
    };

    const refreshHomepageSections = async () => {
        await loadHomepageSections();
    };

    const updateShippingOptions = (options: ShippingOption[]) => {
        setShippingOptions(options);
    };

    return (
        <AppContext.Provider value={{ 
            country, 
            setCountry, 
            homepageSections, 
            updateHomepageSections,
            homepageSectionsLoading,
            homepageSectionsError,
            refreshHomepageSections,
            shippingOptions, 
            updateShippingOptions
        }}>
            {children}
        </AppContext.Provider>
    );
};