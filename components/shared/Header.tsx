import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useApp } from '../../hooks/useApp';
import { 
    ChevronDown,
    Search,
    ShoppingCart,
    User,
    Menu,
    X,
    Phone,
    Loader2
} from 'lucide-react';
import { publicCategoryService } from '../../lib/categoryService';
import { publicProductService } from '../../lib/productService';
import { websiteSettingsService } from '../../lib/websiteSettingsService';
import { countryService, Country as CountryType } from '../../lib/countryService';
import { Category, Product, WebsiteSettings } from '../../types';
import Button from './Button';

const CountrySelector: React.FC = () => {
    const { country, setCountry } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [availableCountries, setAvailableCountries] = useState<CountryType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Only show detected country and Global
    useEffect(() => {
        const loadAvailableCountries = async () => {
            try {
                setIsLoading(true);
                
                // Get the current country from context
                const currentCountryCode = country;
                
                // Get country details for the current country
                let currentCountry: CountryType | null = null;
                if (currentCountryCode && currentCountryCode !== 'Global') {
                    try {
                        currentCountry = await countryService.getCountryByCode(currentCountryCode);
                    } catch (error) {
                        console.error('❌ Error fetching current country details:', error);
                    }
                }

                // Always include Global
                const globalCountry: CountryType = {
                    id: 0,
                    name: 'Global',
                    code: 'Global', // Use 'Global' as code to match frontend expectation
                    currency: 'USD',
                    currencySymbol: '$',
                    flag: '🌍',
                    isActive: true,
                    isGlobal: true
                };

                const countries = [globalCountry];
                
                // Add current country if it exists and is not Global
                if (currentCountry && currentCountry.code !== 'Global' && currentCountry.code !== 'GL') {
                    // Map backend 'GL' code to frontend 'Global'
                    if (currentCountry.code === 'GL') {
                        countries.length = 0; // Remove Global from array since we're adding it as current country
                        countries.push({
                            ...currentCountry,
                            code: 'Global',
                            name: 'Global'
                        });
                    } else {
                        countries.unshift(currentCountry);
                    }
                }
                setAvailableCountries(countries);
            } catch (error) {
                console.error('❌ Error loading available countries:', error);
                // Fallback to just Global
                setAvailableCountries([{
                    id: 0,
                    name: 'Global',
                    code: 'Global',
                    currency: 'USD',
                    currencySymbol: '$',
                    flag: '🌍',
                    isActive: true,
                    isGlobal: true
                }]);
            } finally {
                setIsLoading(false);
            }
        };

        loadAvailableCountries();
    }, [country]);

    const selectedCountry = availableCountries.find(c => c.code === country) || availableCountries[0];

    if (isLoading) {
        return (
            <div className="flex items-center space-x-2 text-white">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden lg:inline">Loading...</span>
            </div>
        );
    }

    // Don't show dropdown if only one country is available
    if (availableCountries.length <= 1) {
        return (
            <div className="flex items-center space-x-2 text-white">
                <span>{selectedCountry?.flag}</span>
                <span className="hidden lg:inline">{selectedCountry?.name}</span>
            </div>
        );
    }

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex items-center space-x-2 text-white hover:text-slate-200 transition-colors"
            >
                <span>{selectedCountry?.flag}</span>
                <span className="hidden lg:inline">{selectedCountry?.name}</span>
                <ChevronDown className="hidden lg:inline h-4 w-4" />
            </button>
            {isOpen && (
                 <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-soft-lg p-2 z-50">
                    {availableCountries.map(country => (
                        <button 
                            key={country.code} 
                            onClick={() => { 
                                setCountry(country.code as any); 
                                setIsOpen(false); 
                            }}
                            className="w-full text-left flex items-center space-x-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md"
                        >
                           <span>{country.flag}</span>
                           <span>{country.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Helper function to get background style from appearance settings
const getBackgroundStyle = (background: any) => {
  if (!background) return '';
  
  if (background.type === 'solid') {
    return background.color;
  } else if (background.type === 'gradient') {
    if (background.gradient?.customGradient) {
      return background.gradient.customGradient;
    } else if (background.gradient?.colors && background.gradient.colors.length > 0) {
      return `linear-gradient(${background.gradient.direction || 'to right'}, ${background.gradient.colors.join(', ')})`;
    }
  }
  
  return '';
};

const Header: React.FC = () => {
    const { country, setCountry } = useApp();
    const { itemCount } = useCart();
    const [isCategoryOpen, setCategoryOpen] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings | null>(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [isDetectingCountry, setIsDetectingCountry] = useState(false);
    const navigate = useNavigate();
    
    // Add refs to track click events
    const searchInputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Enhanced country detection that uses browser geolocation API
    useEffect(() => {
        const detectUserCountry = async () => {
            try {
                setIsDetectingCountry(true);
                console.log('🔄 Starting enhanced country detection...');

                let detectedCountryCode = 'Global';

                // Method 1: Try HTML5 Geolocation API first (most accurate)
                const geolocationCountry = await getCountryFromGeolocation();
                if (geolocationCountry) {
                    detectedCountryCode = geolocationCountry;
                    console.log('📍 Country detected from geolocation:', detectedCountryCode);
                } else {
                    // Method 2: Try backend IP detection
                    try {
                        const backendCountry = await countryService.detectCountry();
                        console.log('🌐 Backend detection result:', backendCountry);
                        
                        if (backendCountry && backendCountry.code && backendCountry.code !== 'GL') {
                            detectedCountryCode = backendCountry.code;
                            console.log('📍 Country detected from backend IP:', detectedCountryCode);
                        }
                    } catch (backendError) {
                        console.log('⚠️ Backend detection failed, trying browser methods...');
                    }

                    // Method 3: Browser language and timezone fallback
                    if (detectedCountryCode === 'Global') {
                        const browserCountry = getCountryFromBrowser();
                        if (browserCountry) {
                            detectedCountryCode = browserCountry;
                            console.log('📍 Country detected from browser:', detectedCountryCode);
                        }
                    }
                }

                // Verify the detected country exists and is active
                if (detectedCountryCode !== 'Global') {
                    try {
                        const countryDetails = await countryService.getCountryByCode(detectedCountryCode);
                        if (countryDetails && countryDetails.isActive) {
                            console.log('✅ Setting detected country:', detectedCountryCode);
                            setCountry(detectedCountryCode as any);
                        } else {
                            console.log('⚠️ Detected country not active, falling back to Global');
                            setCountry('Global');
                        }
                    } catch (error) {
                        console.log('⚠️ Detected country not found, falling back to Global');
                        setCountry('Global');
                    }
                } else {
                    console.log('🌍 No country detected, using Global');
                    setCountry('Global');
                }

            } catch (error) {
                console.error('❌ Error in country detection:', error);
                setCountry('Global');
            } finally {
                setIsDetectingCountry(false);
            }
        };

        detectUserCountry();
    }, [setCountry]);

    // HTML5 Geolocation API to get precise location
    const getCountryFromGeolocation = (): Promise<string | null> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                console.log('📍 Geolocation not supported');
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        console.log('📍 Geolocation coordinates:', latitude, longitude);
                        
                        // Use a geocoding service to get country from coordinates
                        const country = await reverseGeocode(latitude, longitude);
                        resolve(country);
                    } catch (error) {
                        console.error('📍 Geolocation reverse geocoding failed:', error);
                        resolve(null);
                    }
                },
                (error) => {
                    console.log('📍 Geolocation permission denied or failed:', error.message);
                    resolve(null);
                },
                {
                    enableHighAccuracy: false,
                    timeout: 5000,
                    maximumAge: 300000 // 5 minutes cache
                }
            );
        });
    };

    // Simple reverse geocoding using a free service
    const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
        try {
            // Using a free geocoding service (you might want to use a more reliable one in production)
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
            const data = await response.json();
            
            if (data && data.countryCode) {
                console.log('📍 Reverse geocode result:', data.countryCode, data.countryName);
                return data.countryCode;
            }
        } catch (error) {
            console.error('📍 Reverse geocoding error:', error);
        }
        return null;
    };

    // Get country from browser language and timezone
    const getCountryFromBrowser = (): string | null => {
        const language = navigator.language || navigator.languages[0];
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        console.log('🌐 Browser language:', language);
        console.log('⏰ Browser timezone:', timezone);

        // Map common patterns to country codes
        if (language.includes('ne') || timezone.includes('Kathmandu')) {
            return 'NP'; // Nepal
        } else if (language.includes('en-US') || timezone.includes('America')) {
            return 'US'; // United States
        } else if (language.includes('en-GB') || timezone.includes('Europe/London')) {
            return 'UK'; // United Kingdom
        } else if (language.includes('en-IN') || timezone.includes('India')) {
            return 'IN'; // India
        } else if (language.includes('en-AU') || timezone.includes('Australia')) {
            return 'AU'; // Australia
        } else if (language.includes('en-CA') || timezone.includes('Canada')) {
            return 'CA'; // Canada
        }

        return null;
    };

    // Fetch website settings from API
    useEffect(() => {
        const fetchWebsiteSettings = async () => {
            try {
                setIsLoadingSettings(true);
                console.log('🔄 Fetching website settings for header...');
                
                const settings = await websiteSettingsService.getWebsiteSettings();
                console.log('🌐 Website settings fetched:', settings);
                
                setWebsiteSettings(settings);
            } catch (error) {
                console.error('❌ Error fetching website settings:', error);
            } finally {
                setIsLoadingSettings(false);
            }
        };

        fetchWebsiteSettings();
    }, []);

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoadingCategories(true);
                console.log('🔄 Fetching categories for header...');
                
                const categoriesData = await publicCategoryService.getCategories();
                console.log('📁 Categories fetched:', categoriesData);
                
                setCategories(categoriesData);
            } catch (error) {
                console.error('❌ Error fetching categories:', error);
                // Categories will remain empty array if fetch fails
            } finally {
                setIsLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // Search suggestions handler
    useEffect(() => {
        const getSearchSuggestions = async () => {
            if (searchQuery.trim().length < 2) {
                setSearchSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            try {
                setIsSearching(true);
                console.log('🔍 Searching for:', searchQuery);
                
                // Use the searchProducts method from productService
                const searchResults = await publicProductService.searchProducts(searchQuery.trim(), { country });
                console.log('📦 Search results:', searchResults);
                
                // Filter by country
                const countryFilteredResults = searchResults.filter(product => 
                    !product.variants || product.variants.length === 0 || 
                    product.variants.some(v => v.country === country || v.country === 'Global')
                );
                
                setSearchSuggestions(countryFilteredResults.slice(0, 5)); // Show top 5 results
                setShowSuggestions(true);
            } catch (error) {
                console.error('❌ Error searching products:', error);
                setSearchSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        };

        const debounceTimer = setTimeout(getSearchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, country]);

    // Handle clicks outside search suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current && 
                !suggestionsRef.current.contains(event.target as Node) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/category/all?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setSearchSuggestions([]);
            setShowSuggestions(false);
            setMobileMenuOpen(false);
        }
    };

    const handleSuggestionClick = (product: Product) => {
        navigate(`/product/${product.slug}`);
        setSearchQuery('');
        setSearchSuggestions([]);
        setShowSuggestions(false);
        setMobileMenuOpen(false);
    };

    const handleSearchInputFocus = () => {
        if (searchSuggestions.length > 0 && searchQuery.trim().length >= 2) {
            setShowSuggestions(true);
        }
    };

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMobileMenuOpen]);

    // Get values from settings or use defaults
    const siteTitle = websiteSettings?.siteTitle || 'Evergreen Medicine';
    const headerLogoAlt = websiteSettings?.headerLogoAlt || siteTitle;
    
    // Get header navigation from settings or use default
    const headerNavigation = websiteSettings?.headerNavigation || [
        { name: "Shop by Category", path: "#", type: "dropdown" },
        { name: "All Products", path: "/category/all" },
        { name: "Offers", path: "/offers" },
        { name: "Symptom Checker", path: "/symptom-checker" },
        { name: "Promo Codes", path: "/promocodes" },
        { name: "Blog", path: "/blog" },
        { name: "About Us", path: "/about" }
    ];

    // Get header CTA from settings
    const headerCtaText = websiteSettings?.headerCtaText || "Upload Prescription";
    const headerCtaLink = websiteSettings?.headerCtaLink || "/account/prescriptions";

    // Get contact info from footerContactInfo (since headerContactInfo doesn't exist in API)
    const contactInfo = websiteSettings?.footerContactInfo || {
        phone: "+1 (888) 123-4567",
        email: "support@evergreenmed.com",
        address: "123 Health St, Wellness City, CA 90210, USA"
    };

    // Default top bar links (since topBarLinks doesn't exist in API)
    const topBarLinks = [
        { name: "Contact Us", path: "/contact" },
        { name: "Track Order", path: "/account/orders" },
        { name: "Admin", path: "/admin" }
    ];

    // Get appearance settings
    const appearanceSettings = websiteSettings?.appearanceSettings;
    const headerStyles = appearanceSettings?.sections?.header;
    const buttonStyles = appearanceSettings?.sections?.buttons;

    // Split site title for two-line logo (optional)
    const splitSiteTitle = siteTitle.split(' ');
    const firstLine = splitSiteTitle[0];
    const secondLine = splitSiteTitle.slice(1).join(' ');

    // Loading state for categories dropdown
    const renderCategoriesDropdown = () => {
        if (isLoadingCategories) {
            return (
                <div className="absolute top-full left-0 mt-0 w-64 bg-white rounded-lg shadow-soft-lg p-4 z-50">
                    <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-slate-500">Loading categories...</span>
                    </div>
                </div>
            );
        }

        if (categories.length === 0) {
            return (
                <div className="absolute top-full left-0 mt-0 w-64 bg-white rounded-lg shadow-soft-lg p-4 z-50">
                    <span className="text-sm text-slate-500">No categories available</span>
                </div>
            );
        }

        return (
            <div className="absolute top-full left-0 mt-0 w-64 bg-white rounded-lg shadow-soft-lg p-2 z-50 max-h-96 overflow-y-auto">
                {categories.map(cat => (
                    <Link 
                        key={cat.id} 
                        to={`/category/${cat.slug}`} 
                        className="block px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        onClick={() => setCategoryOpen(false)}
                    >
                        {cat.name}
                    </Link>
                ))}
            </div>
        );
    };

    // Search suggestions dropdown
    const renderSearchSuggestions = () => {
        if (!showSuggestions || searchSuggestions.length === 0) return null;

        return (
            <div 
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-soft-lg border border-slate-200 z-50 max-h-80 overflow-y-auto"
            >
                {searchSuggestions.map((product) => (
                    <div
                        key={product.id}
                        className="w-full text-left p-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 cursor-pointer"
                        onClick={() => handleSuggestionClick(product)}
                    >
                        <div className="flex items-center space-x-3">
                            {product.images && product.images[0] && (
                                <img 
                                    src={product.images[0].url} 
                                    alt={product.name}
                                    className="w-10 h-10 object-cover rounded"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-800 truncate">
                                    {product.name}
                                </div>
                                <div className="text-sm text-slate-500 truncate">
                                    {product.brand?.name}
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-primaryEnd font-semibold">
                                        ${product.price}
                                    </span>
                                    {product.mrp && product.mrp > product.price && (
                                        <span className="text-slate-400 line-through text-sm">
                                            ${product.mrp}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Loading state for mobile categories
    const renderMobileCategories = () => {
        if (isLoadingCategories) {
            return (
                <div className="flex items-center justify-center space-x-2 py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-slate-500">Loading categories...</span>
                </div>
            );
        }

        if (categories.length === 0) {
            return (
                <div className="text-center py-4">
                    <span className="text-sm text-slate-500">No categories available</span>
                </div>
            );
        }

        return categories.map(cat => (
            <Link 
                key={cat.id} 
                to={`/category/${cat.slug}`} 
                onClick={() => setMobileMenuOpen(false)} 
                className="block px-2 py-3 text-lg text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
                {cat.name}
            </Link>
        ));
    };

    // Render navigation items from settings
    const renderNavigationItems = () => {
        return headerNavigation.map((item: any) => {
            if (item.type === 'dropdown') {
                return (
                    <div key={item.name} className="relative group" onMouseEnter={() => setCategoryOpen(true)} onMouseLeave={() => setCategoryOpen(false)}>
                        <button 
                            className="font-semibold flex items-center space-x-2 py-2"
                            style={{ color: headerStyles?.navigation?.textColor || '#1f2937' }}
                        >
                            <span>{item.name}</span>
                            <ChevronDown className="h-4 w-4" />
                            {isLoadingCategories && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                        </button>
                        {isCategoryOpen && renderCategoriesDropdown()}
                    </div>
                );
            }
            
            return (
                <NavLink 
                    key={item.name}
                    to={item.path} 
                    className={({ isActive }) => `hover:text-primaryEnd transition-colors ${isActive ? 'font-semibold text-primaryEnd' : ''}`}
                    style={({ isActive }) => ({ 
                        color: isActive 
                            ? (appearanceSettings?.colors?.primaryColor || '#3b82f6')
                            : (headerStyles?.navigation?.textColor || '#6b7280')
                    })}
                >
                    {item.name}
                </NavLink>
            );
        });
    };

    // Render top bar links
    const renderTopBarLinks = () => {
        return topBarLinks.map((link: any) => (
            <Link 
                key={link.name}
                to={link.path} 
                className="hover:text-slate-200 transition-colors"
                style={{ color: headerStyles?.topBar?.textColor || '#ffffff' }}
            >
                {link.name}
            </Link>
        ));
    };

    if (isLoadingSettings || isDetectingCountry) {
        return (
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="animate-pulse bg-slate-200 rounded h-8 w-32"></div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-white">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="hidden lg:inline">Detecting location...</span>
                        </div>
                        <div className="animate-pulse bg-slate-200 rounded-full h-8 w-8"></div>
                    </div>
                </div>
            </header>
        );
    }
    
    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg shadow-sm">
            
            {/* Top Bar - This will scroll away naturally */}
            <div 
                className="text-sm hidden md:block"
                style={{
                    background: getBackgroundStyle(headerStyles?.topBar?.background),
                    color: headerStyles?.topBar?.textColor || '#ffffff'
                }}
            >
                <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                    <div className="flex items-center space-x-6">
                        <span className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{contactInfo.phone}</span>
                        </span>
                        {renderTopBarLinks()}
                    </div>
                    <div className="flex items-center space-x-6">
                        <CountrySelector />
                    </div>
                </div>
            </div>

            {/* Main Navigation Section - This stays sticky */}
            <div 
                className="border-b border-slate-200"
                style={{
                    background: getBackgroundStyle(headerStyles?.navigation?.background),
                    color: headerStyles?.navigation?.textColor || '#1f2937'
                }}
            >
                <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <Link 
                        to="/" 
                        className="font-poppins font-bold flex flex-col leading-tight" 
                        title={headerLogoAlt}
                        style={{ color: appearanceSettings?.colors?.primaryColor || '#3b82f6' }}
                    >
                        <span className="text-3xl">{firstLine}</span>
                        {secondLine && <span className="text-xl">{secondLine}</span>}
                    </Link>

                    {/* Search Bar - Hidden on mobile */}
                    <div className="flex-1 flex justify-center px-8 hidden lg:flex">
                        <form onSubmit={handleSearch} className="relative w-full max-w-xl">
                            <div className="relative">
                                <input 
                                    ref={searchInputRef}
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={handleSearchInputFocus}
                                    placeholder="Search for medicines and wellness products..."
                                    className="w-full pl-12 pr-4 py-3 bg-slate-100 border-2 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-primaryStart/50 focus:border-primaryStart"
                                />
                                <button 
                                    type="submit" 
                                    aria-label="Search" 
                                    className="absolute left-4 top-1/2 -translate-y-1/2"
                                    style={{ color: headerStyles?.searchBar?.textColor || '#6b7280' }}
                                >
                                    <Search className="h-5 w-5" />
                                </button>
                                {isSearching && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                )}
                            </div>
                            {renderSearchSuggestions()}
                        </form>
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <Link 
                            to="/cart" 
                            className="relative p-2"
                            style={{ color: headerStyles?.navigation?.textColor || '#6b7280' }}
                        >
                            <ShoppingCart className="h-7 w-7" />
                            {itemCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-coral rounded-full">
                                    {itemCount}
                                </span>
                            )}
                        </Link>
                        <Link 
                            to="/account" 
                            className="p-2 hidden sm:block"
                            style={{ color: headerStyles?.navigation?.textColor || '#6b7280' }}
                        >
                            <User className="h-7 w-7" />
                        </Link>
                        {/* Mobile menu button - shown on mobile */}
                        <button 
                            className="lg:hidden p-2" 
                            onClick={() => setMobileMenuOpen(true)} 
                            aria-label="Open menu"
                            style={{ color: headerStyles?.navigation?.textColor || '#6b7280' }}
                        >
                            <Menu className="h-7 w-7" />
                        </button>
                    </div>
                </nav>
            </div>

            {/* Bottom Navigation Links - Hidden on mobile */}
            <div 
                className="border-t border-slate-200 hidden md:block"
                style={{
                    background: getBackgroundStyle(headerStyles?.navigation?.background),
                    color: headerStyles?.navigation?.textColor || '#1f2937'
                }}
            >
                <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                    <div className="flex items-center space-x-6">
                        {renderNavigationItems()}
                    </div>
                    <div>
                        <Link to={headerCtaLink}>
                            <Button 
                                variant="accent" 
                                size="sm"
                                style={{
                                    background: getBackgroundStyle(buttonStyles?.primary?.background),
                                    color: buttonStyles?.primary?.textColor || '#ffffff'
                                }}
                            >
                                {headerCtaText}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu */}
            <div className={`fixed inset-0 bg-white z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden`}>
               <div className="flex flex-col h-screen">
                    <div 
                        className="flex justify-between items-center p-4 border-b"
                        style={{
                            background: getBackgroundStyle(headerStyles?.navigation?.background),
                            color: headerStyles?.navigation?.textColor || '#1f2937'
                        }}
                    >
                        <Link 
                            to="/" 
                            onClick={() => setMobileMenuOpen(false)} 
                            className="font-poppins font-bold flex flex-col leading-tight" 
                            title={headerLogoAlt}
                            style={{ color: appearanceSettings?.colors?.primaryColor || '#3b82f6' }}
                        >
                            <span className="text-2xl">{firstLine}</span>
                            {secondLine && <span className="text-lg">{secondLine}</span>}
                        </Link>
                        <button 
                            onClick={() => setMobileMenuOpen(false)} 
                            aria-label="Close menu" 
                            className="p-2"
                            style={{ color: headerStyles?.navigation?.textColor || '#1f2937' }}
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-4 space-y-6 bg-white">
                        <form onSubmit={handleSearch} className="relative w-full">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for medicines and wellness products..."
                                    className="w-full pl-12 pr-4 py-3 border-2 border-transparent rounded-full focus:outline-none focus:ring-2 focus:border-primaryStart"
                                    style={{
                                        background: getBackgroundStyle(headerStyles?.searchBar?.background),
                                        color: headerStyles?.searchBar?.textColor || '#1f2937'
                                    }}
                                />
                                <button 
                                    type="submit" 
                                    aria-label="Search" 
                                    className="absolute left-4 top-1/2 -translate-y-1/2"
                                    style={{ color: headerStyles?.searchBar?.textColor || '#6b7280' }}
                                >
                                    <Search className="h-5 w-5" />
                                </button>
                                {isSearching && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                )}
                            </div>
                        </form>

                        <nav className="flex flex-col space-y-1 -mx-2">
                            {headerNavigation.map((item: any) => (
                                item.type !== 'dropdown' && (
                                    <NavLink 
                                        key={item.name}
                                        to={item.path} 
                                        onClick={() => setMobileMenuOpen(false)} 
                                        className={({ isActive }) => `px-2 py-3 rounded-md text-lg hover:bg-slate-100 transition-colors ${isActive ? 'font-semibold bg-slate-100' : ''}`}
                                        style={({ isActive }) => ({ 
                                            color: isActive 
                                                ? (appearanceSettings?.colors?.primaryColor || '#3b82f6')
                                                : '#374151',
                                            background: isActive ? 'rgba(243, 244, 246, 0.8)' : 'rgba(255, 255, 255, 0.9)'
                                        })}
                                    >
                                        {item.name}
                                    </NavLink>
                                )
                            ))}
                            <NavLink 
                                to="/account" 
                                onClick={() => setMobileMenuOpen(false)} 
                                className={({ isActive }) => `px-2 py-3 rounded-md text-lg ${isActive ? 'font-semibold bg-slate-100' : ''}`}
                                style={({ isActive }) => ({ 
                                    color: isActive 
                                        ? (appearanceSettings?.colors?.primaryColor || '#3b82f6')
                                        : '#374151',
                                    background: isActive ? 'rgba(243, 244, 246, 0.5)' : 'transparent'
                                })}
                            >
                                My Account
                            </NavLink>
                            <NavLink 
                                to="/account/orders" 
                                onClick={() => setMobileMenuOpen(false)} 
                                className={({ isActive }) => `px-2 py-3 rounded-md text-lg ${isActive ? 'font-semibold bg-slate-100' : ''}`}
                                style={({ isActive }) => ({ 
                                    color: isActive 
                                        ? (appearanceSettings?.colors?.primaryColor || '#3b82f6')
                                        : '#374151',
                                    background: isActive ? 'rgba(243, 244, 246, 0.5)' : 'transparent'
                                })}
                            >
                                Track Order
                            </NavLink>
                        </nav>

                        <div className="border-t pt-4">
                            <h3 
                                className="font-semibold mb-2 px-2 flex items-center space-x-2"
                                style={{ color: headerStyles?.navigation?.textColor || '#1f2937' }}
                            >
                                <span>Shop by Category</span>
                                {isLoadingCategories && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                            </h3>
                            <div className="flex flex-col space-y-1 -mx-2">
                                {renderMobileCategories()}
                            </div>
                        </div>
                        
                         <Link to={headerCtaLink} onClick={() => setMobileMenuOpen(false)} className="block pt-4">
                            <Button 
                                variant="accent" 
                                size="lg" 
                                className="w-full"
                                style={{
                                    background: getBackgroundStyle(buttonStyles?.primary?.background),
                                    color: buttonStyles?.primary?.textColor || '#ffffff'
                                }}
                            >
                                {headerCtaText}
                            </Button>
                         </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;