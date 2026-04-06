import React, { useState, useEffect } from 'react';
import { couponService } from '../lib/couponService';
import { Coupon } from '../types';
import { toast } from 'react-hot-toast';

const PromoCodesPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch public coupons from API
  const fetchPublicCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all coupons and filter for public ones on the frontend
      // Alternatively, you could modify the backend to accept an isPublic filter
      const response = await couponService.getCoupons({
        status: 'Active', // Only get active coupons
        limit: 50 // Get more coupons to filter
      });

      console.log('📊 PUBLIC COUPONS RESPONSE:', response);

      // Filter for public coupons and active status
      const publicCoupons = (response.coupons || []).filter(coupon => 
        coupon.isPublic && coupon.status === 'Active'
      );

      console.log('✅ FILTERED PUBLIC COUPONS:', publicCoupons);

      setCoupons(publicCoupons);
    } catch (error) {
      console.error('Error fetching public coupons:', error);
      setError('Failed to load promo codes');
      toast.error('Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicCoupons();
  }, []);

  // Check if coupon is currently valid
  const isCouponValid = (coupon: Coupon): boolean => {
    const now = new Date();
    
    // Check start date
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return false;
    }
    
    // Check end date
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return false;
    }
    
    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return false;
    }
    
    return true;
  };

  // Format coupon description
  const getCouponDescription = (coupon: Coupon): string => {
    const discountText = coupon.type === 'Percentage' 
      ? `${coupon.value}% off` 
      : `$${coupon.value} off`;
    
    const minPurchaseText = coupon.minPurchase > 0 
      ? ` on orders over $${coupon.minPurchase}` 
      : '';
    
    const freeShippingText = coupon.freeShipping ? ' with free shipping' : '';
    
    return `${discountText}${minPurchaseText}${freeShippingText}`;
  };

  // Get coupon validity text
  const getValidityText = (coupon: Coupon): string => {
    const now = new Date();
    const texts: string[] = [];

    if (coupon.minPurchase > 0) {
      texts.push(`Valid on orders over $${coupon.minPurchase}`);
    }

    if (coupon.startDate && new Date(coupon.startDate) > now) {
      const startDate = new Date(coupon.startDate).toLocaleDateString();
      texts.push(`Starts on ${startDate}`);
    }

    if (coupon.endDate) {
      const endDate = new Date(coupon.endDate).toLocaleDateString();
      if (new Date(coupon.endDate) < now) {
        texts.push(`Expired on ${endDate}`);
      } else {
        texts.push(`Valid until ${endDate}`);
      }
    }

    if (coupon.usageLimit) {
      const remainingUses = coupon.usageLimit - coupon.usageCount;
      if (remainingUses > 0) {
        texts.push(`${remainingUses} uses remaining`);
      } else {
        texts.push('No uses remaining');
      }
    }

    return texts.join(' • ');
  };

  if (loading) {
    return (
      <div>
        <section className="bg-primary-gradient text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-serif font-bold">Promo Codes & Offers</h1>
            <p className="text-xl mt-4 max-w-3xl mx-auto">
              Save on your next order with our exclusive discounts and promotions.
            </p>
          </div>
        </section>

        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-2xl shadow-soft-md p-6 flex flex-col items-center text-center border-t-4 border-primaryEnd animate-pulse"
                >
                  <div className="h-8 bg-slate-200 rounded-lg w-32 mb-4"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <div className="text-lg text-slate-600">Loading promo codes...</div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <section className="bg-primary-gradient text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-serif font-bold">Promo Codes & Offers</h1>
            <p className="text-xl mt-4 max-w-3xl mx-auto">
              Save on your next order with our exclusive discounts and promotions.
            </p>
          </div>
        </section>

        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl shadow-soft-md p-12 max-w-2xl mx-auto">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Unable to Load Promo Codes</h2>
              <p className="text-slate-600 mb-6">{error}</p>
              <button
                onClick={fetchPublicCoupons}
                className="bg-primaryStart text-white px-6 py-3 rounded-lg font-semibold hover:bg-primaryEnd transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const validCoupons = coupons.filter(isCouponValid);
  const expiredCoupons = coupons.filter(coupon => !isCouponValid(coupon));

  return (
    <div>
      <section className="bg-primary-gradient text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-serif font-bold">Promo Codes & Offers</h1>
          <p className="text-xl mt-4 max-w-3xl mx-auto">
            Save on your next order with our exclusive discounts and promotions.
          </p>
        </div>
      </section>

      {/* Active Promo Codes */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Active Promo Codes
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Use these promo codes at checkout to save on your purchases
            </p>
          </div>

          {validCoupons.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No Active Promo Codes Available
              </h3>
              <p className="text-slate-500">
                Check back later for new promotions and discounts.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {validCoupons.map((coupon, index) => (
                <div
                  key={coupon.id}
                  className="bg-white rounded-2xl shadow-soft-md p-6 flex flex-col items-center text-center border-t-4 border-green-500 hover:shadow-lg transition-shadow"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="text-2xl font-bold font-mono bg-green-100 text-green-800 px-4 py-2 rounded-lg mb-4 tracking-widest">
                    {coupon.code}
                  </div>
                  <p className="text-lg font-semibold text-slate-700 mb-2">
                    {getCouponDescription(coupon)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {getValidityText(coupon)}
                  </p>
                  {coupon.freeShipping && (
                    <div className="mt-3 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      🚚 Free Shipping
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Expired Promo Codes Section (Optional) */}
      {expiredCoupons.length > 0 && (
        <section className="py-16 bg-white border-t border-slate-200">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-slate-600 mb-4">
                Recently Expired Offers
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                These promotions are no longer active but give you an idea of the types of offers we run
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {expiredCoupons.slice(0, 6).map((coupon, index) => (
                <div
                  key={coupon.id}
                  className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200 opacity-60"
                >
                  <div className="text-lg font-mono text-slate-400 line-through mb-2">
                    {coupon.code}
                  </div>
                  <p className="text-sm text-slate-500">
                    {getCouponDescription(coupon)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How to Use Section */}
      <section className="py-16 bg-primaryStart text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">How to Use Promo Codes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white text-primaryStart rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Add Items to Cart</h3>
                <p className="text-primary-100">
                  Browse our products and add your favorite items to the shopping cart
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white text-primaryStart rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Apply Promo Code</h3>
                <p className="text-primary-100">
                  Enter the promo code in the discount field during checkout
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white text-primaryStart rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Enjoy Savings</h3>
                <p className="text-primary-100">
                  See your discount applied instantly and complete your purchase
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-slate-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Stay Updated with New Offers
          </h2>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter to be the first to know about new promo codes, special discounts, and exclusive offers.
          </p>
          <div className="max-w-md mx-auto flex space-x-2">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primaryStart"
            />
            <button className="bg-primaryStart text-white px-6 py-3 rounded-lg font-semibold hover:bg-primaryEnd transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PromoCodesPage;