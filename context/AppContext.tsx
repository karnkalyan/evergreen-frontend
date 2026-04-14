import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { Country, HomepageSection, ShippingOption } from '../types';
import { MOCK_SHIPPING_OPTIONS, MOCK_HOMEPAGE_LAYOUT } from '../data/mockData';
import { homepageService } from '../lib/homeService';

interface AppContextType {
    country: Country;
    setCountry: (country: Country) => void;

    homepageSections: HomepageSection[];
    updateHomepageSections: (sections: HomepageSection[]) => Promise<void>;
    homepageSectionsLoading: boolean;
    homepageSectionsError: string | null;
    refreshHomepageSections: () => Promise<void>;

    shippingOptions: ShippingOption[];
    updateShippingOptions: (options: ShippingOption[]) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const COUNTRY_STORAGE_KEY = 'evergreen_country';

const getInitialCountry = (): Country => {
    if (typeof window === 'undefined') return 'US';
    const saved = localStorage.getItem(COUNTRY_STORAGE_KEY);
    return (saved as Country) || 'US';
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [country, setCountryState] = useState<Country>(getInitialCountry);

    const [homepageSections, setHomepageSections] = useState<HomepageSection[]>([]);
    const [homepageSectionsLoading, setHomepageSectionsLoading] = useState<boolean>(true);
    const [homepageSectionsError, setHomepageSectionsError] = useState<string | null>(null);
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>(MOCK_SHIPPING_OPTIONS);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(COUNTRY_STORAGE_KEY, country);
        }
    }, [country]);

    const setCountry = (nextCountry: Country) => {
        setCountryState(nextCountry);
    };

    const loadHomepageSections = async () => {
        try {
            setHomepageSectionsLoading(true);
            setHomepageSectionsError(null);

            const sections = await homepageService.getHomepageSections();
            setHomepageSections(Array.isArray(sections) && sections.length > 0 ? sections : MOCK_HOMEPAGE_LAYOUT);
        } catch (error) {
            console.error('Error loading homepage sections:', error);
            setHomepageSectionsError('Failed to load homepage sections. Using demo data instead.');
            setHomepageSections(MOCK_HOMEPAGE_LAYOUT);
        } finally {
            setHomepageSectionsLoading(false);
        }
    };

    useEffect(() => {
        loadHomepageSections();
    }, []);

    const updateHomepageSections = async (sections: HomepageSection[]) => {
        try {
            setHomepageSections(sections);

            const updateData = sections.map(section => ({
                id: section.id,
                data: section
            }));

            await homepageService.bulkUpdateHomepageSections(updateData);
        } catch (error) {
            console.error('Error updating homepage sections:', error);
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
        <AppContext.Provider
            value={{
                country,
                setCountry,
                homepageSections,
                updateHomepageSections,
                homepageSectionsLoading,
                homepageSectionsError,
                refreshHomepageSections,
                shippingOptions,
                updateShippingOptions
            }}
        >
            {children}
        </AppContext.Provider>
    );
};