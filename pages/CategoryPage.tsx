import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Product, Category, Brand } from '../types';
import { publicProductService } from '../lib/productService';
import { publicCategoryService } from '../lib/categoryService';
import { publicBrandService } from '../lib/brandService';
import { websiteSettingsService } from '../lib/websiteSettingsService';
import ProductCard from '../components/products/ProductCard';
import Button from '../components/shared/Button';
import { ICONS } from '../constants';
import Pagination from '../components/shared/Pagination';
import { useApp } from '../hooks/useApp';

const ITEMS_PER_PAGE = 12;

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
}

interface FilterState {
    price?: number;
    brands?: number[];
    categories?: number[];
    symptoms?: string[];
    forms?: string[];
}

const FilterPanel: React.FC<{ 
    onFilterChange: (filters: FilterState) => void, 
    closePanel?: () => void,
    categories: Category[],
    brands: Brand[]
}> = ({ onFilterChange, closePanel, categories, brands }) => {
    const [priceRange, setPriceRange] = useState(1500);
    const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [selectedForms, setSelectedForms] = useState<string[]>([]);

    const [allSymptoms, setAllSymptoms] = useState<string[]>([]);
    const [allForms, setAllForms] = useState<string[]>([]);

    // Fetch unique symptoms and forms from products
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const products = await publicProductService.getProducts();
                
                // Extract unique symptoms
                const symptomSet = new Set<string>();
                products.forEach(p => {
                    if (p.symptoms && Array.isArray(p.symptoms)) {
                        p.symptoms.forEach(s => symptomSet.add(s));
                    }
                });
                setAllSymptoms(Array.from(symptomSet).sort());

                // Extract unique forms
                const formSet = new Set<string>();
                products.forEach(p => {
                    if (p.forms && Array.isArray(p.forms)) {
                        p.forms.forEach(f => formSet.add(f));
                    }
                });
                setAllForms(Array.from(formSet).sort());
            } catch (error) {
                console.error('Error fetching filter options:', error);
            }
        };

        fetchFilterOptions();
    }, []);
    
    const applyFilters = useCallback(() => {
        onFilterChange({ 
            price: priceRange, 
            brands: selectedBrands, 
            categories: selectedCategories,
            symptoms: selectedSymptoms, 
            forms: selectedForms 
        });
        if(closePanel) closePanel();
    }, [priceRange, selectedBrands, selectedCategories, selectedSymptoms, selectedForms, onFilterChange, closePanel]);

    const handleCheckboxChange = (setter: React.Dispatch<React.SetStateAction<any[]>>, value: any) => {
        setter(prev => 
            prev.includes(value) 
                ? prev.filter(item => item !== value)
                : [...prev, value]
        );
    };

    const clearAllFilters = useCallback(() => {
        setPriceRange(1500);
        setSelectedBrands([]);
        setSelectedCategories([]);
        setSelectedSymptoms([]);
        setSelectedForms([]);
        onFilterChange({});
        if(closePanel) closePanel();
    }, [onFilterChange, closePanel]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-soft-md flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-xl font-poppins font-bold">Filters</h3>
                <button onClick={closePanel} className="lg:hidden text-slate-500">{ICONS.close}</button>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                {/* Price Filter */}
                <div className="mb-6 border-b pb-6">
                    <h4 className="font-semibold mb-3">Price Range</h4>
                    <input 
                        type="range" 
                        min="0" 
                        max="1500" 
                        step="10"
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primaryEnd" 
                    />
                    <div className="text-sm text-slate-500 text-center mt-2">Up to ${priceRange}</div>
                </div>

                {/* Categories Filter */}
                <div className="mb-6 border-b pb-6">
                    <h4 className="font-semibold mb-2">Categories</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
                        {categories.map(category => (
                             <div key={category.id} className="flex items-center">
                                 <input 
                                     type="checkbox" 
                                     id={`category-${category.id}`} 
                                     checked={selectedCategories.includes(category.id)}
                                     onChange={() => handleCheckboxChange(setSelectedCategories, category.id)} 
                                     className="h-4 w-4 bg-white rounded border-slate-300 text-primaryEnd focus:ring-primaryEnd focus:ring-offset-0" 
                                 />
                                 <label htmlFor={`category-${category.id}`} className="ml-3 text-sm text-slate-600">{category.name}</label>
                             </div>
                        ))}
                    </div>
                </div>

                {/* Brands Filter */}
                <div className="mb-6 border-b pb-6">
                    <h4 className="font-semibold mb-2">Brands</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
                        {brands.map(brand => (
                             <div key={brand.id} className="flex items-center">
                                 <input 
                                     type="checkbox" 
                                     id={`brand-${brand.id}`} 
                                     checked={selectedBrands.includes(brand.id)}
                                     onChange={() => handleCheckboxChange(setSelectedBrands, brand.id)} 
                                     className="h-4 w-4 bg-white rounded border-slate-300 text-primaryEnd focus:ring-primaryEnd focus:ring-offset-0" 
                                 />
                                 <label htmlFor={`brand-${brand.id}`} className="ml-3 text-sm text-slate-600">{brand.name}</label>
                             </div>
                        ))}
                    </div>
                </div>

                 {/* Symptoms Filter */}
                <div className="mb-6 border-b pb-6">
                    <h4 className="font-semibold mb-2">Symptoms</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
                        {allSymptoms.map(symptom => (
                             <div key={symptom} className="flex items-center">
                                 <input 
                                     type="checkbox" 
                                     id={`symptom-${symptom}`} 
                                     checked={selectedSymptoms.includes(symptom)}
                                     onChange={() => handleCheckboxChange(setSelectedSymptoms, symptom)} 
                                     className="h-4 w-4 bg-white rounded border-slate-300 text-primaryEnd focus:ring-primaryEnd focus:ring-offset-0" 
                                 />
                                 <label htmlFor={`symptom-${symptom}`} className="ml-3 text-sm text-slate-600">{symptom}</label>
                             </div>
                        ))}
                    </div>
                </div>

                 {/* Form Filter */}
                <div className="mb-6">
                    <h4 className="font-semibold mb-2">Form</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
                        {allForms.map(form => (
                             <div key={form} className="flex items-center">
                                 <input 
                                     type="checkbox" 
                                     id={`form-${form}`} 
                                     checked={selectedForms.includes(form)}
                                     onChange={() => handleCheckboxChange(setSelectedForms, form)} 
                                     className="h-4 w-4 bg-white rounded border-slate-300 text-primaryEnd focus:ring-primaryEnd focus:ring-offset-0" 
                                 />
                                 <label htmlFor={`form-${form}`} className="ml-3 text-sm text-slate-600">{form}</label>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
             <div className="mt-4 pt-4 border-t flex-shrink-0 space-y-2">
                <Button onClick={applyFilters} className="w-full">Apply Filters</Button>
                <Button onClick={clearAllFilters} variant="secondary" className="w-full">Clear All</Button>
            </div>
        </div>
    );
}

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { country } = useApp();
  const query = useQuery();
  const searchQuery = query.get('q');
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [pageTitle, setPageTitle] = useState<string>('All Products');
  const [filters, setFilters] = useState<FilterState>({});
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SEO state
  const [seoData, setSeoData] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('🔄 Starting to fetch data for CategoryPage...');
        
        const [productsData, categoriesData, brandsData] = await Promise.all([
          publicProductService.getProducts(),
          publicCategoryService.getCategories(),
          publicBrandService.getBrands()
        ]);

        console.log('📦 Products data:', productsData);
        console.log('📁 Categories data:', categoriesData);
        console.log('🏷️ Brands data:', brandsData);

        setAllProducts(productsData);
        setCategories(categoriesData);
        setBrands(brandsData);

        console.log('✅ Data fetching completed');
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products based on category, search, and filters
  useEffect(() => {
    if (allProducts.length === 0) return;

    console.log('🔄 Filtering products...', {
      slug,
      searchQuery,
      allProductsCount: allProducts.length,
      filters
    });

    // Filter products by country first
    const countryFilteredProducts = allProducts.filter(p => {
        if (!p.variants || p.variants.length === 0) return true; // Show products without variants everywhere
        return p.variants.some(v => v.country === country || v.country === 'Global');
    });

    let baseProducts: Product[];
    
    if (searchQuery) {
        setPageTitle(`Search results for "${searchQuery}"`);
        const lowercasedQuery = searchQuery.toLowerCase();
        baseProducts = countryFilteredProducts.filter(p => 
            p.name.toLowerCase().includes(lowercasedQuery) ||
            (p.brand && p.brand.name.toLowerCase().includes(lowercasedQuery)) ||
            (p.category && p.category.name.toLowerCase().includes(lowercasedQuery)) ||
            (p.tags && p.tags.some(tag => tag.toLowerCase().includes(lowercasedQuery)))
        );
    } else if (slug === 'all' || !slug) {
        baseProducts = countryFilteredProducts;
        setPageTitle('All Products');
    } else {
        const currentCategory = categories.find(c => c.slug === slug);
        if (currentCategory) {
            setPageTitle(currentCategory.name);
            baseProducts = countryFilteredProducts.filter(p => p.category && p.category.id === currentCategory.id);
        } else {
            baseProducts = [];
            setPageTitle('Category Not Found');
        }
    }

    const { price, brands: filterBrands, categories: filterCategories, symptoms, forms } = filters;
    let products = baseProducts;

    if (price) {
        products = products.filter(p => p.price <= price);
    }
    if (filterBrands?.length > 0) {
        products = products.filter(p => p.brand && filterBrands.includes(p.brand.id));
    }
    if (filterCategories?.length > 0) {
        products = products.filter(p => p.category && filterCategories.includes(p.category.id));
    }
    if (symptoms?.length > 0) {
        products = products.filter(p => p.symptoms && p.symptoms.some(s => symptoms.includes(s)));
    }
    if (forms?.length > 0) {
        products = products.filter(p => p.forms && p.forms.some(f => forms.includes(f)));
    }

    console.log('✅ Filtered products:', {
      initial: allProducts.length,
      countryFiltered: countryFilteredProducts.length,
      base: baseProducts.length,
      final: products.length
    });

    setFilteredProducts(products);
    setCurrentPage(1); // Reset to first page on filter change
  }, [slug, filters, searchQuery, country, allProducts, categories]);

  // Fetch SEO data when category changes
  useEffect(() => {
    const fetchSeoData = async () => {
      if (!slug || slug === 'all' || !categories.length) return;
      
      const currentCategory = categories.find(c => c.slug === slug);
      if (!currentCategory) return;
      
      try {
        const data = await websiteSettingsService.getPageSeo('category', slug);
        setSeoData(data);
      } catch (error) {
        console.error('Error fetching SEO data:', error);
      }
    };

    fetchSeoData();
  }, [slug, categories]);

  const paginatedProducts = useMemo(() => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryEnd mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Unable to load products</h3>
            <p className="text-slate-600">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{seoData?.metaTitle || `${pageTitle} - Evergreen Medicine`}</title>
        <meta name="description" content={seoData?.metaDescription || `Shop ${pageTitle} at Evergreen Medicine. Find quality medicines and health products with fast delivery.`} />
        {seoData?.canonicalUrl && <link rel="canonical" href={seoData.canonicalUrl} />}
        {seoData?.ogTitle && <meta property="og:title" content={seoData.ogTitle} />}
        {seoData?.ogDescription && <meta property="og:description" content={seoData.ogDescription} />}
        {seoData?.ogImage && <meta property="og:image" content={seoData.ogImage} />}
        {seoData?.twitterTitle && <meta name="twitter:title" content={seoData.twitterTitle} />}
        {seoData?.twitterDescription && <meta name="twitter:description" content={seoData.twitterDescription} />}
        {seoData?.twitterImage && <meta name="twitter:image" content={seoData.twitterImage} />}
        {seoData?.structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(seoData.structuredData)}
          </script>
        )}
      </Helmet>
      <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-poppins font-bold text-slate-900">{pageTitle}</h1>
        <p className="text-slate-500 mt-1">Showing {filteredProducts.length} products</p>
      </div>
      
      <div className="lg:hidden mb-4">
        <Button onClick={() => setFilterOpen(true)} variant="secondary" className="w-full flex items-center justify-center space-x-2">
            {ICONS.filter}
            <span>Filter</span>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row items-start">
        <aside className="w-full lg:w-1/4 lg:pr-8 mb-8 lg:mb-0 hidden lg:block">
            <div className="sticky top-24">
                <FilterPanel 
                  onFilterChange={setFilters} 
                  categories={categories}
                  brands={brands}
                />
            </div>
        </aside>

        <main className="w-full lg:w-3/4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={6 + index * 2} />
                    ))
                ) : (
                    <div className="col-span-full text-center text-slate-500 py-16 bg-white rounded-2xl">
                        <h3 className="text-xl font-semibold">No products found</h3>
                        <p>Try adjusting your filters or changing your search query.</p>
                    </div>
                )}
            </div>
            {totalPages > 1 && (
                <div className="mt-12">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}
        </main>
      </div>
      
      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 lg:hidden" onClick={() => setFilterOpen(false)}>
              <div className="absolute inset-y-0 right-0 w-full max-w-xs bg-slate-50 shadow-lg" onClick={e => e.stopPropagation()}>
                  <FilterPanel 
                    onFilterChange={setFilters} 
                    closePanel={() => setFilterOpen(false)}
                    categories={categories}
                    brands={brands}
                  />
              </div>
          </div>
      )}
    </div>
    </>
  );
};

export default CategoryPage;