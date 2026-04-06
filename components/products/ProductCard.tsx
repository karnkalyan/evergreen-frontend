import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product, ProductVariant, QuantityPriceOption } from '../../types';
import { useCart } from '../../hooks/useCart';
import { useApp } from '../../hooks/useApp';
import { ICONS } from '../../constants';
import Button from '../shared/Button';
import { toast } from 'react-hot-toast';
import QuickViewModal from './QuickViewModal';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { country } = useApp();
  const navigate = useNavigate();
  const [isQuickViewOpen, setQuickViewOpen] = useState(false);
  
  // Get currency symbol based on product's country
  const getCurrencySymbol = () => {
    const productCountry = product.country;
    
    const countryCurrencyMap: { [key: string]: string } = {
      'US': '$', 'CA': '$', 'AU': '$', 'NZ': '$',
      'GB': '£',
      'EU': '€', 'DE': '€', 'FR': '€', 'IT': '€', 'ES': '€',
      'IN': '₹',
      'NP': '₹', // Nepal uses Nepalese Rupee (₹)
      'JP': '¥',
      'CN': '¥',
      'KR': '₩',
      'RU': '₽',
      'BR': 'R$',
      'MX': '$',
      'Global': '$'
    };
    
    return countryCurrencyMap[productCountry] || '$';
  };

  const currencySymbol = getCurrencySymbol();
  
  // Fixed: Handle both string URLs and image objects
  const getImageUrl = () => {
    if (!product.images || product.images.length === 0) {
      return `https://placehold.co/400x400/e2e8f0/e2e8f0`;
    }
    
    const firstImage = product.images[0];
    // Handle both string URLs and image objects
    return typeof firstImage === 'string' ? firstImage : firstImage.url;
  };

  const imageUrl = getImageUrl();

  const getVariantAndOption = () => {
    const availableVariants = product.variants?.filter(v => v.country === country || v.country === 'Global') || [];
    
    let variantGroup: ProductVariant | undefined;
    let optionToAdd: QuantityPriceOption | undefined;
    
    if (availableVariants.length > 0) {
        variantGroup = availableVariants.find(v => v.shipping === 'Domestic') || availableVariants[0];
        if (variantGroup?.options?.length > 0) {
            optionToAdd = variantGroup.options[0];
        }
    } else if (!product.variants || product.variants.length === 0) {
        variantGroup = {
            country: 'Global',
            shipping: 'Domestic',
            currency: 'USD',
            options: [],
        };
        optionToAdd = {
            label: product.forms && product.forms.length > 0 ? product.forms[0] : 'Standard',
            price: product.price,
            mrp: product.mrp,
            stock: product.stock || 0,
        };
    }
    return { variantGroup, optionToAdd };
  }

  // Format price with correct currency symbol
  const formatPrice = (price: number) => {
    return `${currencySymbol}${price.toFixed(2)}`;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { variantGroup, optionToAdd } = getVariantAndOption();

    if (variantGroup && optionToAdd) {
        addToCart(product, 1, variantGroup, optionToAdd);
        toast.success(`${product.name} added to cart!`);
    } else {
        navigate(`/product/${product.slug}`);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { variantGroup, optionToAdd } = getVariantAndOption();

    if (variantGroup && optionToAdd) {
        addToCart(product, 1, variantGroup, optionToAdd);
        navigate('/checkout');
    } else {
        navigate(`/product/${product.slug}`);
    }
  }

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(`${product.name} added to wishlist!`);
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  }

  return (
    <div>
        <Link 
            to={`/product/${product.slug}`}
            className="bg-white rounded-2xl shadow-soft-md hover:shadow-xl transition-transform transition-shadow duration-300 ease-in-out flex flex-col h-full overflow-hidden transform hover:scale-105 group"
        >
          {/* Image Container */}
          <div className="relative bg-slate-50 p-2">
            {product.discount_percent > 0 && (
                <div className="absolute top-3 left-3 inline-flex items-center rounded-md bg-coral/10 px-2 py-1 text-xs font-medium text-coral ring-1 ring-inset ring-coral/20 z-10">
                    {Math.abs(product.discount_percent)}% OFF
                </div>
            )}
            <div className="aspect-square w-full">
                <img 
                  src={imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-contain" 
                  loading="lazy" 
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.src = `https://placehold.co/400x400/e2e8f0/e2e8f0?text=${encodeURIComponent(product.name)}`;
                  }}
                />
            </div>

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2 z-20">
                {/* Wishlist Button */}
                <div className="relative group/tooltip">
                    <button onClick={handleAddToWishlist} aria-label="Add to wishlist" className="bg-white text-slate-700 rounded-full p-2.5 shadow-md hover:text-coral transition-colors">
                        {React.cloneElement(ICONS.heart, {className: 'w-5 h-5'})}
                    </button>
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
                        Add to Wishlist
                    </span>
                </div>
                {/* Quick View Button */}
                <div className="relative group/tooltip">
                    <button onClick={handleQuickView} aria-label="Quick view" className="bg-white text-slate-700 rounded-full p-2.5 shadow-md hover:text-primaryEnd transition-colors">
                        {React.cloneElement(ICONS.eye, {className: 'w-5 h-5'})}
                    </button>
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
                        Quick View
                    </span>
                </div>
                {/* Buy Now Button */}
                <div className="relative group/tooltip">
                     <button onClick={handleBuyNow} aria-label="Buy now" className="bg-white text-slate-700 rounded-full p-2.5 shadow-md hover:text-amber-500 transition-colors">
                         {React.cloneElement(ICONS.bolt, {className: 'w-5 h-5'})}
                     </button>
                     <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
                         Buy Now
                     </span>
                </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-3 md:p-4 flex flex-col flex-grow">
              <p className="text-xs text-slate-500 mb-1 truncate">{product.brand?.name || 'Unknown Brand'}</p>
              <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-2 flex-grow min-h-[2.5rem]">
                  {product.name}
              </h3>
              <div className="hidden md:flex items-center space-x-1">
                  <span className="text-amber-500">{ICONS.star}</span>
                  <span className="text-xs text-slate-500 font-medium">{product.rating || 0} ({product.reviews || 0})</span>
              </div>

              <div className="mt-auto pt-3">
                {/* Mobile View: Price on left, '+' button on right */}
                <div className="flex justify-between items-center md:hidden">
                    <div className="flex flex-col">
                        <p className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</p>
                        {product.discount_percent > 0 && (
                            <p className="text-xs line-through text-slate-400">{formatPrice(product.mrp)}</p>
                        )}
                    </div>
                    <button 
                        onClick={handleAddToCart} 
                        aria-label={`Add ${product.name} to cart`}
                        className="bg-primary-gradient text-white rounded-full p-2.5 shadow-md active:scale-95 transition-transform"
                    >
                        {React.cloneElement(ICONS.plus, {className: 'w-5 h-5'})}
                    </button>
                </div>
              
                {/* Desktop View: Price and full 'Add' button */}
                <div className="hidden md:block">
                  <div className="flex items-baseline space-x-2 mb-2">
                      <p className="text-xl font-bold text-slate-900">{formatPrice(product.price)}</p>
                      {product.discount_percent > 0 && (
                          <p className="text-sm line-through text-slate-400">{formatPrice(product.mrp)}</p>
                      )}
                  </div>
                  <Button onClick={handleAddToCart} size="sm" className="w-full mt-1">
                      Add
                  </Button>
                </div>
              </div>
          </div>
        </Link>
        {isQuickViewOpen && (
          <QuickViewModal 
            product={product} 
            onClose={() => setQuickViewOpen(false)} 
          />
        )}
    </div>
  );
};

export default ProductCard;