import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Product, ProductVariant, QuantityPriceOption } from '../types';
import { useCart } from '../hooks/useCart';
import { useApp } from '../hooks/useApp';
import Button from '../components/shared/Button';
import { ICONS } from '../constants';
import ProductCard from '../components/products/ProductCard';
import { publicProductService } from '../lib/productService';
import { shippingService } from '../lib/shippingService';
import { websiteSettingsService } from '../lib/websiteSettingsService';
import { toast } from 'react-hot-toast';

const SectionTitle: React.FC<{ title: string; }> = ({ title }) => (
  <div className="mb-6">
    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 relative pb-3">
      <span className="absolute bottom-0 left-0 w-16 h-1 bg-blue-600 rounded-full"></span>
      {title}
    </h2>
  </div>
);

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center bg-gray-100 text-gray-700 text-sm font-medium mr-2 mb-2 px-3 py-1.5 rounded-lg border border-gray-200">
    {children}
  </span>
);

const ShippingOptionCard: React.FC<{
  option: any;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ option, isSelected, onSelect }) => {
  const getEstimatedDaysText = (days: number) => {
    if (days === 1) return '1 business day';
    if (days <= 3) return `${days} business days`;
    return `${days} business days`;
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${isSelected
          ? 'border-blue-600 bg-blue-50 shadow-sm'
          : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
        }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{option.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{option.description}</p>
        </div>
        {option.cost === 0 ? (
          <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full whitespace-nowrap ml-4">
            FREE
          </span>
        ) : (
          <span className="text-sm font-semibold text-gray-700 whitespace-nowrap ml-4">
            ${option.cost.toFixed(2)}
          </span>
        )}
      </div>

      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          ⏱️ {getEstimatedDaysText(option.estimatedDays)}
        </span>
        {isSelected && (
          <span className="text-sm text-blue-600 font-medium">
            ✓ Selected
          </span>
        )}
      </div>
    </div>
  );
};

const VariantOptionCard: React.FC<{
  option: QuantityPriceOption;
  currencySymbol: string;
  isAdding: boolean;
  onAddToCart: () => void;
}> = ({ option, currencySymbol, isAdding, onAddToCart }) => {
  const discount = useMemo(() => {
    if (!option.mrp || !option.price || option.mrp <= option.price) return 0;
    return Math.round(((option.mrp - option.price) / option.mrp) * 100);
  }, [option.mrp, option.price]);

  return (
    <div className="bg-white p-5 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-gray-900 text-lg">{option.label}</h3>
        <div className="flex flex-col items-end">
          {option.stock > 0 ? (
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded mb-2">
              In Stock
            </span>
          ) : (
            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded mb-2">
              Out of Stock
            </span>
          )}
          {option.stock > 0 && (
            <span className="text-xs text-gray-500">
              {option.stock} units
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline space-x-2 mb-1">
          <span className="font-bold text-gray-900 text-2xl">
            {currencySymbol}{option.price?.toFixed(2) || '0.00'}
          </span>
          {discount > 0 && (
            <span className="bg-red-100 text-red-800 text-sm font-semibold px-2 py-1 rounded">
              {discount}% OFF
            </span>
          )}
        </div>
        {option.mrp && option.mrp > option.price && (
          <div className="flex items-center space-x-2">
            <span className="text-lg line-through text-gray-400">
              {currencySymbol}{option.mrp.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">
              Save {currencySymbol}{(option.mrp - option.price).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <Button
        size="lg"
        onClick={onAddToCart}
        disabled={option.stock <= 0 || isAdding}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
      >
        {isAdding ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Adding...
          </span>
        ) : (
          option.stock > 0 ? 'Add to Cart' : 'Out of Stock'
        )}
      </Button>
    </div>
  );
};

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { country } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVariantGroup, setActiveVariantGroup] = useState<ProductVariant | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  // SEO state
  const [seoData, setSeoData] = useState(null);

  const getCurrencySymbol = useMemo(() => {
    if (!product) return '₹';

    const productCountry = product.country;

    const countryCurrencyMap: { [key: string]: string } = {
      'US': '$', 'CA': '$', 'AU': '$', 'NZ': '$',
      'GB': '£',
      'EU': '€', 'DE': '€', 'FR': '€', 'IT': '€', 'ES': '€',
      'IN': '₹',
      'NP': '₹',
      'JP': '¥',
      'CN': '¥',
      'KR': '₩',
      'RU': '₽',
      'BR': 'R$',
      'MX': '$',
      'Global': '$'
    };

    return countryCurrencyMap[productCountry] || '₹';
  }, [product]);

  const currencySymbol = getCurrencySymbol;

  const calculateDiscount = useMemo(() => {
    if (!product) return 0;

    if (product.mrp && product.price && product.mrp > product.price) {
      return Math.round(((product.mrp - product.price) / product.mrp) * 100);
    }

    return 0;
  }, [product]);

  const getVariantCurrencySymbol = useMemo(() => {
    if (!activeVariantGroup) return currencySymbol;

    const variantCurrency = activeVariantGroup.currency;
    const currencySymbolMap: { [key: string]: string } = {
      'USD': '$', 'US': '$',
      'EUR': '€', 'EU': '€',
      'GBP': '£', 'GB': '£',
      'INR': '₹', 'IN': '₹',
      'NPR': '₹', 'NP': '₹',
      'JPY': '¥', 'JP': '¥',
      'CNY': '¥', 'CN': '¥',
      'KRW': '₩', 'KR': '₩',
    };

    return currencySymbolMap[variantCurrency] || currencySymbol;
  }, [activeVariantGroup, currencySymbol]);

  const variantCurrencySymbol = getVariantCurrencySymbol;

  // Fetch shipping options from API
  const fetchShippingOptions = async () => {
    try {
      setLoadingShipping(true);
      const shippingData = await shippingService.getShippingOptions();
      setShippingOptions(shippingData);
    } catch (error) {
      console.error('Error fetching shipping options:', error);
      setShippingOptions([]);
    } finally {
      setLoadingShipping(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        // Use actual API call only - NO MOCK DATA
        const productData = await publicProductService.getProductBySlug(slug, country);

        if (productData) {
          setProduct(productData);
          setActiveImage(0);

          // Fetch recommended products
          if (productData.id) {
            try {
              const recommended = await publicProductService.getRecommendedProducts(productData.id);
              setRecommendedProducts(recommended);
            } catch (err) {
              console.error('Error fetching recommended products:', err);
              setRecommendedProducts([]);
            }
          }
        } else {
          setError('Product not found in your region');
          setProduct(null);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    fetchShippingOptions();
  }, [slug, country]);

  const isProductAvailableForCountry = useMemo(() => {
    if (!product) return false;

    if (product.country === 'Global' || product.country === country) {
      return true;
    }

    if (product.variants && product.variants.length > 0) {
      return product.variants.some(variant =>
        variant.country === country || variant.country === 'Global'
      );
    }

    return false;
  }, [product, country]);

  // Get available shipping options from API response filtered by product variants
  const availableShippingOptions = useMemo(() => {
    if (!product || !shippingOptions.length || !isProductAvailableForCountry) return [];

    if (!product.variants || product.variants.length === 0) {
      return [];
    }

    // Get unique shipping codes from product variants for current country
    const variantShippingCodes = [...new Set(
      product.variants
        .filter(v => v.country === country || v.country === 'Global')
        .map(v => v.shipping)
    )];

    // Filter shipping options to only include those present in variants
    const filteredShippingOptions = shippingOptions
      .filter(option => option.isActive && variantShippingCodes.includes(option.code))
      .sort((a, b) => a.cost - b.cost);

    return filteredShippingOptions;
  }, [product, shippingOptions, country, isProductAvailableForCountry]);

  // Auto-select first available shipping option from variants
  useEffect(() => {
    if (availableShippingOptions.length > 0 && !selectedShipping) {
      const firstOption = availableShippingOptions[0];
      setSelectedShipping(firstOption.code);
    }
  }, [availableShippingOptions, selectedShipping]);

  // Set active variant group when shipping changes
  useEffect(() => {
    if (!product || !selectedShipping || !isProductAvailableForCountry) {
      setActiveVariantGroup(null);
      return;
    }

    if (!product.variants || product.variants.length === 0) {
      setActiveVariantGroup(null);
      return;
    }

    const newVariantGroup = product.variants.find(v =>
      (v.country === country || v.country === 'Global') && v.shipping === selectedShipping
    );

    setActiveVariantGroup(newVariantGroup || null);
  }, [product, selectedShipping, country, isProductAvailableForCountry]);

  // Fetch SEO data when product changes
  useEffect(() => {
    const fetchSeoData = async () => {
      if (!product?.id) return;

      try {
        const data = await websiteSettingsService.getPageSeo('product', undefined, product.id);
        setSeoData(data);
      } catch (error) {
        console.error('Error fetching SEO data:', error);
      }
    };

    fetchSeoData();
  }, [product?.id]);

  const handleAddToCart = async (option: QuantityPriceOption) => {
    if (product && activeVariantGroup) {
      setAddingToCart(option.id?.toString() || option.label);
      try {
        await addToCart(product, 1, activeVariantGroup, option);
        // toast.success('Product added to cart!');
      } catch (error) {
        console.error('Failed to add to cart:', error);
        toast.error('Failed to add item to cart');
      } finally {
        setAddingToCart(null);
      }
    }
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZoomed) return;

    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPosition({ x, y });
  };

  const parseStringArray = (field: any): string[] => {
    if (Array.isArray(field)) {
      return field;
    }
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const renderHTMLContent = (content: string) => {
    return { __html: content };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-8">{error || 'The product you are looking for does not exist.'}</p>
          <Link to="/category/all">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isProductAvailableForCountry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Available</h2>
          <p className="text-gray-600 mb-8">
            This product is not available in your selected region.
          </p>
          <Link to="/category/all">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const strengths = parseStringArray(product.strengths);
  const forms = parseStringArray(product.forms);
  const tags = parseStringArray(product.tags);
  const symptoms = parseStringArray(product.symptoms);

  return (
    <>
      <Helmet>
        {/* PRIMARY SEO */}
        <title>
          {seoData?.metaTitle ||
            `Buy ${product.name} Online | Price, Uses, Dosage & Fast Delivery USA | Evergreen Pharma`}
        </title>

        <meta
          name="description"
          content={
            seoData?.metaDescription ||
            `Buy ${product.name} online at best price. Check uses, dosage, side effects & fast delivery across USA, Nepal & worldwide. Trusted pharmacy – Evergreen Pharma.`
          }
        />

        {/* KEYWORDS (optional but still useful) */}
        <meta
          name="keywords"
          content={`${product.name}, buy ${product.name} online, ${product.category?.name}, ${product.brand?.name}, online pharmacy USA, medicine delivery`}
        />

        {/* CANONICAL */}
        <link
          rel="canonical"
          href={seoData?.canonicalUrl || `https://evergreenpharma.us/product/${product.slug}`}
        />

        {/* OPEN GRAPH */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={seoData?.ogTitle || product.name} />
        <meta property="og:description" content={seoData?.ogDescription || product.shortDescription} />
        <meta property="og:image" content={seoData?.ogImage || product.images?.[0]?.url} />
        <meta property="og:url" content={`https://evergreenpharma.us/product/${product.slug}`} />

        {/* TWITTER */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData?.twitterTitle || product.name} />
        <meta name="twitter:description" content={seoData?.twitterDescription || product.shortDescription} />
        <meta name="twitter:image" content={seoData?.twitterImage || product.images?.[0]?.url} />

        {/* STRUCTURED DATA (FORCED — DO NOT RELY ONLY ON API) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name,
            image: product.images?.map(i => i.url || i),
            description: product.shortDescription,
            sku: product.sku,
            brand: {
              "@type": "Brand",
              name: product.brand?.name
            },
            offers: {
              "@type": "Offer",
              url: `https://evergreenpharma.us/product/${product.slug}`,
              priceCurrency: "USD",
              price: product.price,
              availability: product.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock"
            }
          })}
        </script>
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex space-x-2 text-sm text-gray-600 mb-8">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/category/all" className="hover:text-blue-600 transition-colors">Products</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Images */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {product.images && product.images.length > 0 ? (
                  <div
                    ref={imageRef}
                    className="relative w-full h-96 overflow-hidden rounded-lg bg-gray-100"
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    onMouseMove={handleImageMouseMove}
                  >
                    <img
                      src={product.images[activeImage]?.url || product.images[activeImage]}
                      alt={product.images[activeImage]?.alt || `${product.name} ${activeImage + 1}`}
                      className={`w-full h-full object-contain transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'
                        }`}
                      style={{
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                      }}
                    />
                    {isZoomed && (
                      <div className="absolute inset-0 bg-white/20 pointer-events-none" />
                    )}

                    {/* Discount Badge */}
                    {calculateDiscount > 0 && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        {calculateDiscount}% OFF
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-96 bg-gray-100 flex items-center justify-center rounded-lg">
                    <div className="text-center text-gray-400">
                      No Image Available
                    </div>
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${activeImage === index
                          ? 'border-blue-600 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <img
                        src={typeof img === 'string' ? img : img.url}
                        alt={typeof img === 'string' ? `${product.name} thumbnail ${index + 1}` : img.alt || `${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Product Specifications */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-800 mb-6 text-xl">Product Specifications</h3>

                <div className="space-y-6">
                  {product.composition && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Composition</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{product.composition}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {strengths.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Available Strengths</h4>
                        <div className="flex flex-wrap gap-2">
                          {strengths.map(s => <Tag key={s}>{s}</Tag>)}
                        </div>
                      </div>
                    )}

                    {forms.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Available Forms</h4>
                        <div className="flex flex-wrap gap-2">
                          {forms.map(f => <Tag key={f}>{f}</Tag>)}
                        </div>
                      </div>
                    )}
                  </div>

                  {symptoms.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Treats Symptoms</h4>
                      <div className="flex flex-wrap gap-2">
                        {symptoms.map(s => <Tag key={s}>{s}</Tag>)}
                      </div>
                    </div>
                  )}

                  {tags.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Product Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {tags.map(t => <Tag key={t}>{t}</Tag>)}
                      </div>
                    </div>
                  )}

                  {/* Additional Product Info */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">SKU</h4>
                      <p className="text-gray-600">{product.sku || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Brand</h4>
                      <p className="text-gray-600">{product.brand?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Category</h4>
                      <p className="text-gray-600">{product.category?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Stock</h4>
                      <p className="text-gray-600">{product.stock || 0} units</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Product Details */}
            <div className="space-y-6">
              {/* Product Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {product.brand?.name || 'Prime'}
                  </span>
                  <div className="flex items-center space-x-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(product.rating || 0) ? 'text-amber-500' : 'text-gray-300'}>
                        {ICONS.star}
                      </span>
                    ))}
                    <span className="text-sm text-gray-500 ml-2">({product.reviews || 0} reviews)</span>
                  </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>

                {/* Price Section */}
                <div className="mb-4">
                  <div className="flex items-baseline space-x-3 mb-2">
                    {product.mrp && product.price && product.mrp > product.price ? (
                      <>
                        <span className="font-bold text-gray-900 text-3xl">
                          {currencySymbol}{product.price.toFixed(2)}
                        </span>
                        <span className="text-xl line-through text-gray-400">
                          {currencySymbol}{product.mrp.toFixed(2)}
                        </span>
                        {calculateDiscount > 0 && (
                          <span className="bg-green-100 text-green-800 text-sm font-semibold px-2 py-1 rounded-full">
                            Save {calculateDiscount}%
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="font-bold text-gray-900 text-3xl">
                        {currencySymbol}{product.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {product.mrp && product.price && product.mrp > product.price && (
                    <p className="text-green-600 text-sm font-medium">
                      You save {currencySymbol}{(product.mrp - product.price).toFixed(2)}
                    </p>
                  )}
                </div>

                {product.shortDescription && (
                  <p className="text-gray-600 leading-relaxed text-lg border-l-4 border-blue-600 pl-4 bg-blue-50 py-3 rounded-r-lg mb-4">
                    {product.shortDescription}
                  </p>
                )}

                {product.prescription_required && (
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg flex items-center">
                    <span className="text-orange-600 font-bold mr-3">⚠</span>
                    <span className="text-orange-700 font-medium">Prescription Required</span>
                  </div>
                )}
              </div>

              {/* Shipping & Variant Options */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Shipping Options from API */}
                {loadingShipping ? (
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-800 mb-4 text-lg">Shipping Options</h4>
                    <div className="space-y-3">
                      {[1, 2].map(i => (
                        <div key={i} className="p-4 rounded-lg border-2 border-gray-200 animate-pulse">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : availableShippingOptions.length > 0 ? (
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-800 mb-4 text-lg">Shipping Options</h4>
                    <div className="space-y-3">
                      {availableShippingOptions.map(shippingOpt => (
                        <ShippingOptionCard
                          key={shippingOpt.id}
                          option={shippingOpt}
                          isSelected={selectedShipping === shippingOpt.code}
                          onSelect={() => setSelectedShipping(shippingOpt.code)}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Variant Options */}
                {selectedShipping && activeVariantGroup && activeVariantGroup.options && activeVariantGroup.options.length > 0 ? (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4 text-lg">Available Packages</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeVariantGroup.options.map(option => {
                        const optionId = option.id?.toString() || option.label;
                        const isAdding = addingToCart === optionId;

                        return (
                          <VariantOptionCard
                            key={optionId}
                            option={option}
                            currencySymbol={variantCurrencySymbol}
                            isAdding={isAdding}
                            onAddToCart={() => handleAddToCart(option)}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : selectedShipping ? (
                  <div className="text-center p-6">
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <p className="text-yellow-700 font-medium">
                        No variant options available for selected shipping.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <p className="text-blue-700 font-medium">
                        Please select a shipping option to see available packages.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full Description */}
          {product.description && (
            <div className="mt-12">
              <SectionTitle title="Product Details" />
              <div
                className="prose prose-gray max-w-none bg-white rounded-lg shadow-sm border border-gray-200 p-8"
                dangerouslySetInnerHTML={renderHTMLContent(product.description)}
              />
            </div>
          )}
        </div>

        {/* Recommended Products */}
        {(recommendedProducts.length > 0 || loadingRecommended) && (
          <section className="py-16 bg-white border-t border-gray-200">
            <div className="container mx-auto px-4">
              <SectionTitle title="You Might Also Like" />
              {loadingRecommended ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-gray-400">Loading recommended products...</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {recommendedProducts.map((p, index) => (
                    <ProductCard key={p.id} product={p} index={index} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default ProductDetailPage;