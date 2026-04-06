import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { cartService } from '../lib/cartService';
import { couponService } from '../lib/couponService';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/shared/Button';
import { ICONS } from '../constants';
import { toast } from 'react-hot-toast';

const currencySymbols: { [key: string]: string } = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  INR: '₹',
  NPR: '₹',
};

// Helper function to get image URL using cartService
const getImageUrl = (images: any[]): string => {
  return cartService.getPrimaryImageUrl(images);
};

const CartPage: React.FC = () => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    shippingCost, 
    discountAmount, 
    totalPrice, 
    itemCount, 
    appliedPromo, 
    applyPromoCode, 
    removePromoCode,
    isLoading 
  } = useCart();
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Calculate final totals (shipping will be confirmed later)
  const finalSubtotal = subtotal;
  const finalDiscount = discountAmount;
  const finalTotal = finalSubtotal - finalDiscount; // Shipping not included in total

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      toast.error('Please login to apply promo codes');
      navigate('/login');
      return;
    }

    setValidatingCoupon(true);
    try {
      console.log('🎫 Validating coupon:', {
        code: promoCodeInput.trim().toUpperCase(),
        userId: user.id,
        cartTotal: subtotal
      });

      // Validate coupon using the coupon service
      const validationResponse = await couponService.validateCoupon(
        promoCodeInput.trim().toUpperCase(),
        user.id,
        subtotal
      );

      console.log('🎫 COUPON VALIDATION RESPONSE:', validationResponse);

      if (validationResponse.valid) {
        // Convert the coupon response to PromoCode format expected by useCart
        const promoCode = {
          code: validationResponse.coupon.code,
          type: validationResponse.coupon.type === 'Percentage' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
          value: validationResponse.coupon.value,
          description: `Coupon discount applied`,
          minAmount: validationResponse.coupon.minPurchase,
          maxDiscount: validationResponse.coupon.maxDiscount,
          freeShipping: validationResponse.coupon.freeShipping
        };

        // Apply the promo code through the cart context
        applyPromoCode(promoCode);
        
        toast.success('Coupon applied successfully!');
        setPromoCodeInput('');
      } else {
        // Handle validation errors from backend
        const errorMessage = validationResponse.error || 'Invalid coupon code';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Coupon validation error:', error);
      
      // Handle different error formats
      let errorMessage = 'Failed to validate coupon. Please try again.';
      
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    toast.success('Coupon removed');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyPromo();
    }
  };

  const currencyCode = cartItems.length > 0 ? cartItems[0].variantDetail.currency : 'USD';
  const currencySymbol = currencySymbols[currencyCode] || '$';

  // Calculate discount breakdown
  const getDiscountBreakdown = () => {
    if (!appliedPromo) return null;

    let discountText = '';
    
    if (appliedPromo.type === 'PERCENTAGE') {
      discountText = `${appliedPromo.value}% off`;
    } else {
      discountText = `${currencySymbol}${appliedPromo.value} off`;
    }

    if (appliedPromo.freeShipping) {
      discountText += ' + Free Shipping';
    }

    return discountText;
  };

  if (isLoading) {
    return (
      <div className="bg-slate-100 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-slate-400">Loading your cart...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-8">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-2xl shadow-lg">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
              <span className="text-3xl text-slate-400">🛒</span>
            </div>
            <h2 className="text-2xl font-semibold text-slate-700 mb-2">Your cart is empty.</h2>
            <p className="text-slate-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Button onClick={() => navigate('/')}>Start Shopping</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => {
                const imageUrl = getImageUrl(item.product.images);
                return (
                  <div key={`${item.product.id}-${item.variantDetail.label}-${item.variantDetail.shipping}`} 
                       className="bg-white p-6 rounded-2xl shadow-lg flex items-center hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src={imageUrl} 
                      alt={item.product.name} 
                      className="w-24 h-24 object-cover rounded-xl mr-6" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder-product.jpg';
                      }}
                    />
                    <div className="flex-grow">
                      <Link 
                        to={`/product/${item.product.slug}`} 
                        className="font-semibold text-slate-800 hover:text-blue-600 transition-colors text-lg"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-slate-500 mt-1">{item.variantDetail.label}</p>
                      <p className="text-sm text-slate-500">Shipping: {item.variantDetail.shipping}</p>
                      <p className="text-sm text-slate-500">Currency: {item.variantDetail.currency}</p>
                      <p className="text-lg font-bold text-slate-900 mt-2">
                        {currencySymbol}{item.variantDetail.price.toFixed(2)} × {item.quantity} = {currencySymbol}{(item.variantDetail.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.variantDetail, item.quantity - 1)} 
                          className="px-4 py-2 text-lg font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-4 py-2 text-md font-semibold min-w-12 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.variantDetail, item.quantity + 1)} 
                          className="px-4 py-2 text-lg font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product.id, item.variantDetail)} 
                        className="text-slate-400 hover:text-red-500 transition-colors p-2"
                      >
                        {ICONS.close}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-24">
                <h2 className="text-2xl font-serif font-bold mb-6 text-slate-900">Order Summary</h2>
                
                <div className="space-y-3 pb-4 mb-4 border-b border-slate-200">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                    <span className="font-semibold">{currencySymbol}{finalSubtotal.toFixed(2)}</span>
                  </div>
                  
                  {finalDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-semibold">-{currencySymbol}{finalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <div className="text-sm text-blue-600 text-right">
                      <div className="font-semibold">To be confirmed</div>
                      <div className="text-xs mt-1 text-slate-500">
                        Shipping cost will be confirmed after order placement
                      </div>
                    </div>
                  </div>
                </div>

                {/* Promo Code Section */}
                <div className="border-t border-slate-200 pt-4 mb-6">
                  {!appliedPromo ? (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">Promo Code</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Enter promo code" 
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1 p-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={validatingCoupon}
                        />
                        <Button 
                          onClick={handleApplyPromo} 
                          size="sm" 
                          className="whitespace-nowrap"
                          disabled={validatingCoupon || !promoCodeInput.trim()}
                        >
                          {validatingCoupon ? 'Validating...' : 'Apply'}
                        </Button>
                      </div>
                      {!isAuthenticated && (
                        <p className="text-xs text-amber-600">
                          💡 Please login to apply promo codes
                        </p>
                      )}
                      <p className="text-xs text-slate-500">
                        Enter your coupon code and click Apply to see discounts
                      </p>
                    </div>
                  ) : (
                    <div className="text-center bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-green-500 mr-2">✓</span>
                        <p className="font-semibold text-green-700">"{appliedPromo.code}" applied!</p>
                      </div>
                      <p className="text-xs text-green-600 mb-1">{getDiscountBreakdown()}</p>
                      <p className="text-sm text-green-700 font-medium">
                        You saved: {currencySymbol}{finalDiscount.toFixed(2)}
                      </p>
                      <button 
                        onClick={handleRemovePromo} 
                        className="text-xs text-red-500 mt-2 hover:underline font-medium"
                      >
                        Remove Code
                      </button>
                    </div>
                  )}
                </div>

                {/* Total Section */}
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-xl text-slate-900">Total</span>
                    <div className="text-right">
                      <div className="text-sm text-blue-600 font-normal">
                        {currencySymbol}{(finalSubtotal - finalDiscount).toFixed(2)} + Shipping*
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        *Shipping cost will be confirmed after order placement
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="w-full py-4 text-lg font-semibold" 
                    onClick={() => navigate('/checkout')}
                  >
                    Proceed to Checkout
                  </Button>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 text-center">
                      💡 Shipping costs will be confirmed via email/mobile within 24 hours after order placement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;