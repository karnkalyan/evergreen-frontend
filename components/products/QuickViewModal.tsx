import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductVariant, QuantityPriceOption } from '../../types';
import { useCart } from '../../hooks/useCart';
import { useApp } from '../../hooks/useApp';
import Button from '../shared/Button';
import { ICONS } from '../../constants';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const currencySymbols: { [key: string]: string } = {
    USD: '$',
    GBP: '£',
};

const QuickViewModal: React.FC<{ product: Product; onClose: () => void; }> = ({ product, onClose }) => {
    const { country } = useApp();
    const { addToCart } = useCart();

    const [activeVariantGroup, setActiveVariantGroup] = useState<ProductVariant | null>(null);
    const [selectedShipping, setSelectedShipping] = useState<'Domestic' | 'Overseas' | null>(null);

    // Helper function to get primary image URL
    const getPrimaryImageUrl = () => {
        if (!product.images || product.images.length === 0) {
            return 'https://placehold.co/400x400/e2e8f0/e2e8f0';
        }
        
        // Find primary image or use first image
        const primaryImage = product.images.find(img => 
            typeof img === 'object' && img.isPrimary
        ) || product.images[0];
        
        return typeof primaryImage === 'string' ? primaryImage : primaryImage.url;
    };

    // Helper function to convert HTML to plain text
    const getPlainTextDescription = (html: string): string => {
        if (!html) return '';
        // Remove HTML tags and trim
        return html.replace(/<[^>]*>/g, '').trim();
    };

    useEffect(() => {
        const availableVariants = product.variants?.filter(v => v.country === country || v.country === 'Global') || [];
        
        if (availableVariants.length > 0) {
            const domesticVariant = availableVariants.find(v => v.shipping === 'Domestic');
            const overseasVariant = availableVariants.find(v => v.shipping === 'Overseas');
            
            if (domesticVariant) {
                setActiveVariantGroup(domesticVariant);
                setSelectedShipping('Domestic');
            } else if (overseasVariant) {
                setActiveVariantGroup(overseasVariant);
                setSelectedShipping('Overseas');
            } else {
                 setActiveVariantGroup(availableVariants[0]);
                 setSelectedShipping(availableVariants[0].shipping as 'Domestic' | 'Overseas');
            }
        } else {
            if (!product.variants || product.variants.length === 0) {
                setActiveVariantGroup({
                    country: 'Global',
                    currency: 'USD',
                    shipping: 'Domestic',
                    options: [{
                        label: product.forms && product.forms.length > 0 ? product.forms[0] : 'Standard',
                        price: product.price,
                        mrp: product.mrp,
                        stock: product.stock || 0
                    }]
                });
                setSelectedShipping('Domestic');
            } else {
                setActiveVariantGroup(null);
            }
        }
    }, [product, country]);
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    const handleShippingChange = (shipping: 'Domestic' | 'Overseas') => {
      const newVariant = product?.variants?.find(v => (v.country === country || v.country === 'Global') && v.shipping === shipping);
      if(newVariant) {
          setActiveVariantGroup(newVariant);
          setSelectedShipping(shipping);
      }
    }

    const handleAddToCart = (option: QuantityPriceOption) => {
      if (product && activeVariantGroup) {
          addToCart(product, 1, activeVariantGroup, option);
          toast.success(`${product.name} added to cart!`);
      }
    };

    const shippingOptions = useMemo(() => {
        if (!product || !product.variants) return [];
        const availableVariants = product.variants.filter(v => v.country === country || v.country === 'Global');
        return [...new Set(availableVariants.map(v => v.shipping))];
    }, [product, country]);

    if (!activeVariantGroup) {
        return null;
    }
    
    const currencySymbol = currencySymbols[activeVariantGroup.currency] || '$';
    
    // Use short description if available, otherwise convert HTML description to plain text
    const displayDescription = product.shortDescription || getPlainTextDescription(product.description);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden relative" onClick={e => e.stopPropagation()} data-aos="zoom-in-up">
                {/* Image Section */}
                <div className="w-full md:w-1/2 p-4 bg-slate-50 flex items-center justify-center">
                    <img 
                        src={getPrimaryImageUrl()} 
                        alt={product.name} 
                        className="max-h-full w-auto object-contain"
                        onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/400x400/e2e8f0/e2e8f0';
                        }}
                    />
                </div>
                
                {/* Details Section */}
                <div className="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto">
                   <div>
                        <p className="text-sm font-semibold text-primaryEnd">{product.brand?.name || 'Unknown Brand'}</p>
                        <h1 className="text-2xl font-serif font-bold text-slate-900 mt-1 mb-2">{product.name}</h1>
                        
                        <div className="flex items-center space-x-2 text-amber-500 mb-4">
                            {[...Array(Math.floor(product.rating || 0))].map((_, i) => (
                                <span key={i}>{ICONS.star}</span>
                            ))}
                            <span className="text-sm text-slate-500 ml-2">({product.reviews || 0} reviews)</span>
                        </div>

                        {displayDescription && (
                            <p className="text-slate-600 leading-relaxed mb-4 text-sm line-clamp-3">
                                {displayDescription}
                            </p>
                        )}
                   </div>
                    
                   <div className="flex-grow">
                        {shippingOptions && shippingOptions.length > 1 && (
                             <div className="mb-4">
                                <h4 className="font-semibold text-sm mb-2 text-slate-800">Shipping From:</h4>
                                <div className="flex space-x-2">
                                    {shippingOptions.map(shipping => (
                                        <button 
                                            key={shipping} 
                                            onClick={() => handleShippingChange(shipping as 'Domestic' | 'Overseas')} 
                                            className={`px-3 py-1.5 text-sm rounded-lg border-2 font-medium ${
                                                selectedShipping === shipping 
                                                    ? 'border-primaryEnd bg-primaryEnd/10 text-primaryEnd' 
                                                    : 'border-slate-300 text-slate-600'
                                            }`}
                                        >
                                            {shipping}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="mb-4">
                            <h4 className="font-semibold text-sm mb-2 text-slate-800">Select Option:</h4>
                            <div className="space-y-2">
                                {activeVariantGroup.options && activeVariantGroup.options.length > 0 ? (
                                    activeVariantGroup.options.map(option => (
                                        <div key={option.id || option.label} className="bg-slate-50/70 p-2.5 rounded-lg flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-sm text-slate-800">{option.label}</p>
                                                <div className="flex items-baseline space-x-2">
                                                    <span className="font-bold text-slate-900">
                                                        {currencySymbol}{option.price.toFixed(2)}
                                                    </span>
                                                    {option.price < option.mrp && (
                                                        <span className="text-xs line-through text-slate-400">
                                                            {currencySymbol}{option.mrp.toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                onClick={() => handleAddToCart(option)} 
                                                disabled={option.stock <= 0}
                                            >
                                                {option.stock > 0 ? 'Add' : 'Out of Stock'}
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-slate-50 p-3 rounded-lg text-slate-600 text-sm">
                                        No options available for this shipping method.
                                    </div>
                                )}
                            </div>
                        </div>
                   </div>

                    <div className="mt-auto pt-4 border-t">
                        <Link 
                            to={`/product/${product.slug}`} 
                            onClick={onClose} 
                            className="font-semibold text-primaryEnd hover:underline text-sm"
                        >
                            View Full Details &rarr;
                        </Link>
                    </div>
                </div>
                
                {/* Close Button - Using ICONS.close instead of ICONS.x */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 bg-white/50 rounded-full p-1 transition-colors z-10" 
                    aria-label="Close quick view"
                >
                    {ICONS.close}
                </button>
            </div>
        </div>
    );
};

export default QuickViewModal;