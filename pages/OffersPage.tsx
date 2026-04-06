import React, { useMemo, useState, useEffect } from 'react';
import { publicProductService } from '../lib/productService';
import ProductCard from '../components/products/ProductCard';
import Pagination from '../components/shared/Pagination';
import { Product } from '../types';
import Button from '../components/shared/Button';
import { useApp } from '../hooks/useApp';

const ITEMS_PER_PAGE = 16;

const OffersPage: React.FC = () => {
  const { country } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('🔄 Fetching products for offers page...');
        
        const productsData = await publicProductService.getProducts(country);
        console.log('📦 Products fetched:', productsData);
        
        setProducts(productsData);
      } catch (err) {
        console.error('❌ Error fetching products:', err);
        setError('Failed to load offers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Enhanced discount detection for your API structure
  const discountedProducts = useMemo(() => {
    if (!products.length) return [];
    
    const discounted = products
      .filter(p => {
        // Check if product has any variant with actual discount
        const hasDiscountedVariant = p.variants?.some(variant => 
          variant.options?.some(option => {
            // Calculate discount based on MRP and price
            if (option.mrp && option.price) {
              const calculatedDiscount = ((option.mrp - option.price) / option.mrp) * 100;
              return calculatedDiscount > 0;
            }
            return false;
          })
        );

        // Also check main product pricing
        if (p.mrp && p.price) {
          const mainDiscount = ((p.mrp - p.price) / p.mrp) * 100;
          if (mainDiscount > 0) return true;
        }

        return hasDiscountedVariant;
      })
      .map(p => {
        // Find the best discount across all variants
        let bestDiscount = 0;
        
        // Check main product discount
        if (p.mrp && p.price && p.mrp > p.price) {
          bestDiscount = Math.round(((p.mrp - p.price) / p.mrp) * 100);
        }

        // Check variant discounts
        p.variants?.forEach(variant => {
          variant.options?.forEach(option => {
            if (option.mrp && option.price && option.mrp > option.price) {
              const variantDiscount = Math.round(((option.mrp - option.price) / option.mrp) * 100);
              if (variantDiscount > bestDiscount) {
                bestDiscount = variantDiscount;
              }
            }
          });
        });

        return {
          ...p,
          discount_percent: bestDiscount,
          // Use the best price for display
          display_price: p.price,
          display_mrp: p.mrp
        };
      })
      .filter(p => p.discount_percent > 0) // Only products with actual positive discounts
      .sort((a, b) => b.discount_percent - a.discount_percent); // Sort by highest discount
    
    console.log('🎯 Valid discounted products:', discounted);
    return discounted;
  }, [products]);
  
  const paginatedProducts = useMemo(() => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      return discountedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [discountedProducts, currentPage]);

  const totalPages = Math.ceil(discountedProducts.length / ITEMS_PER_PAGE);

  // Handle retry
  const handleRetry = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div>
        <section className="bg-coral/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-serif font-bold text-coral">Offers & Deals</h1>
            <p className="text-xl mt-4 max-w-3xl mx-auto text-slate-700">Loading amazing deals for you...</p>
          </div>
        </section>

        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white rounded-2xl p-4 shadow-soft-md animate-pulse">
                  <div className="bg-slate-200 h-48 rounded-lg mb-4"></div>
                  <div className="bg-slate-200 h-4 rounded mb-2"></div>
                  <div className="bg-slate-200 h-4 rounded w-3/4 mb-2"></div>
                  <div className="bg-slate-200 h-6 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <section className="bg-coral/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-serif font-bold text-coral">Offers & Deals</h1>
            <p className="text-xl mt-4 max-w-3xl mx-auto text-slate-700">Something went wrong</p>
          </div>
        </section>

        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl p-12 max-w-2xl mx-auto">
              <div className="text-6xl mb-4">😔</div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">Unable to Load Offers</h3>
              <p className="text-slate-600 mb-6">{error}</p>
              <Button onClick={handleRetry}>Try Again</Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-coral/10 py-16">
        <div className="container mx-auto px-4 text-center" data-aos="fade-up">
          <h1 className="text-5xl font-serif font-bold text-coral">Offers & Deals</h1>
          <p className="text-xl mt-4 max-w-3xl mx-auto text-slate-700">
            {discountedProducts.length > 0 
              ? `Discover ${discountedProducts.length} amazing deals on health and wellness products.` 
              : 'Find the best prices on your favorite health and wellness products.'
            }
          </p>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          {discountedProducts.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-poppins font-bold text-slate-900" data-aos="fade-right">
                  Top Discounts
                  <span className="text-coral text-lg ml-3">({discountedProducts.length} deals)</span>
                </h2>
                
                {/* Sort info */}
                <div className="text-sm text-slate-500" data-aos="fade-left">
                  Sorted by highest discount
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {paginatedProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={index}
                    highlightDiscount 
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12" data-aos="fade-up">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl" data-aos="zoom-in">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">No Current Offers</h3>
              <p className="text-slate-600 max-w-md mx-auto mb-6">
                We're working on bringing you the best deals. Check back soon for exciting offers on health and wellness products!
              </p>
              <div className="text-sm text-slate-500">
                In the meantime, explore our full product catalog for great everyday prices.
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default OffersPage;