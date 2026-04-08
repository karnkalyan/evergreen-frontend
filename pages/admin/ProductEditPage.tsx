import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Button from '../../components/shared/Button';
import ImageUploader from '../../components/admin/ImageUploader';
import SearchableSelect from '../../components/shared/SearchableSelect';
import TagInput from '../../components/shared/TagInput';
import { toast } from 'react-hot-toast';
import { Product, ProductVariant, QuantityPriceOption, Category, Brand } from '../../types';
import { ICONS } from '../../constants';
import CustomReactQuill from '../../components/shared/CustomReactQuill';
import { productService } from '../../lib/productService';
import { countryService, Country } from '../../lib/countryService';
import { shippingService, Shipping } from '../../lib/shippingService';

const Switch: React.FC<{ label: string; enabled: boolean; setEnabled: (enabled: boolean) => void; }> = ({ label, enabled, setEnabled }) => (
  <div className="flex items-center justify-between">
    <label className="text-sm font-medium text-slate-700">{label}</label>
    <button
      type="button"
      onClick={() => setEnabled(!enabled)}
      className={`${enabled ? 'bg-primaryEnd' : 'bg-slate-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primaryEnd focus:ring-offset-2`}
    >
      <span
        className={`${enabled ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  </div>
);

const SearchableSelectWithLabel: React.FC<{ 
  label: string;
  options: any[]; 
  value: any; 
  onChange: (val: any) => void; 
  placeholder?: string; 
}> = ({ label, options, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <SearchableSelect options={options} value={value} onChange={onChange} placeholder={placeholder} />
  </div>
);

interface VariantManagerProps {
  variants: ProductVariant[];
  setVariants: (variants: ProductVariant[]) => void;
  countries: Country[];
  shippingOptions: Shipping[];
}

const VariantManager: React.FC<VariantManagerProps> = ({ 
  variants, 
  setVariants, 
  countries, 
  shippingOptions 
}) => {
  
  const countryOptions = countries.map(country => ({
    value: country.code,
    label: `${country.flag} ${country.name} (${country.code})`
  }));

  const shippingOptionsList = shippingOptions.map(shipping => ({
    value: shipping.code,
    label: `${shipping.name} - $${shipping.cost} (${shipping.estimatedDays} days)`
  }));

  const updateVariant = (vIndex: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...variants];
    (newVariants[vIndex] as any)[field] = value;
    
    // If country is changed, update currency automatically
    if (field === 'country') {
      const selectedCountry = countries.find(c => c.code === value);
      if (selectedCountry) {
        newVariants[vIndex].currency = selectedCountry.currency;
      }
    }
    
    setVariants(newVariants);
  };

  const addVariantGroup = () => {
    const defaultCountry = countries.find(c => c.isGlobal) || countries[0];
    const defaultShipping = shippingOptions.find(s => s.isDefault) || shippingOptions[0];
    
    const newGroup: ProductVariant = {
      country: defaultCountry?.code || 'Global',
      shipping: defaultShipping?.code || 'STANDARD',
      currency: defaultCountry?.currency || 'USD',
      options: [{ label: 'Standard', price: 0, mrp: 0, stock: 0 }]
    };
    setVariants([...variants, newGroup]);
  };
  
  const removeVariantGroup = (vIndex: number) => {
    setVariants(variants.filter((_, i) => i !== vIndex));
  };

  const addOption = (vIndex: number) => {
    const newVariants = [...variants];
    newVariants[vIndex].options.push({ label: '', price: 0, mrp: 0, stock: 0 });
    setVariants(newVariants);
  };

  const updateOption = (vIndex: number, oIndex: number, field: keyof QuantityPriceOption, value: any) => {
    const newVariants = [...variants];
    const newOption = { ...newVariants[vIndex].options[oIndex], [field]: value };
    newVariants[vIndex].options[oIndex] = newOption;
    setVariants(newVariants);
  };

  const removeOption = (vIndex: number, oIndex: number) => {
    const newVariants = [...variants];
    newVariants[vIndex].options = newVariants[vIndex].options.filter((_, i) => i !== oIndex);
    setVariants(newVariants);
  };

  return (
    <div className="space-y-4">
      {variants.map((variant, vIndex) => (
        <div key={vIndex} className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-start">
            <div className="grid grid-cols-3 gap-4 flex-grow pr-4">
              <SearchableSelectWithLabel 
                label="Country" 
                options={countryOptions} 
                value={variant.country} 
                onChange={val => updateVariant(vIndex, 'country', val)} 
              />
              <SearchableSelectWithLabel 
                label="Shipping" 
                options={shippingOptionsList} 
                value={variant.shipping} 
                onChange={val => updateVariant(vIndex, 'shipping', val)} 
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                <input 
                  type="text" 
                  value={variant.currency || 'USD'} 
                  readOnly
                  className="w-full p-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-500" 
                />
              </div>
            </div>
            <button type="button" onClick={() => removeVariantGroup(vIndex)} className="text-coral hover:text-red-700 p-1">
              {React.cloneElement(ICONS.trash, { className: 'w-5 h-5' })}
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 block">Options</label>
            {variant.options.map((option, oIndex) => (
              <div key={oIndex} className="grid grid-cols-12 gap-2 items-center">
                <input 
                  type="text" 
                  placeholder="Label (e.g. 60 pills)" 
                  value={option.label} 
                  onChange={(e) => updateOption(vIndex, oIndex, 'label', e.target.value)} 
                  className="col-span-3 p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                />
                <input 
                  type="number" 
                  placeholder="Price" 
                  value={option.price} 
                  onChange={(e) => updateOption(vIndex, oIndex, 'price', parseFloat(e.target.value))} 
                  className="col-span-2 p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                />
                <input 
                  type="number" 
                  placeholder="MRP" 
                  value={option.mrp} 
                  onChange={(e) => updateOption(vIndex, oIndex, 'mrp', parseFloat(e.target.value))} 
                  className="col-span-2 p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                />
                <input 
                  type="number" 
                  placeholder="Stock" 
                  value={option.stock} 
                  onChange={(e) => updateOption(vIndex, oIndex, 'stock', parseInt(e.target.value))} 
                  className="col-span-2 p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                />
                <button 
                  type="button" 
                  onClick={() => removeOption(vIndex, oIndex)} 
                  className="col-span-1 text-slate-400 hover:text-coral flex justify-end"
                >
                  {React.cloneElement(ICONS.close, { className: 'w-4 h-4' })}
                </button>
              </div>
            ))}
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={() => addOption(vIndex)}>Add Option</Button>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={addVariantGroup}>Add Variant Group</Button>
    </div>
  );
};

const ProductEditPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(slug);
  
  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    sku: '',
    slug: '',
    description: '',
    shortDescription: '',
    composition: '',
    price: 0,
    mrp: 0,
    discount_percent: 0,
    prescription_required: false,
    isFeatured: false,
    isTrending: false,
    isActive: true,
    country: 'Global', // Product-level country for visibility
    brand_id: undefined,
    category_id: undefined,
    stock: 0,
    min_order_quantity: 1,
    max_order_quantity: 10,
    weight: 0,
    dimensions: '',
    strengths: [],
    forms: [],
    tags: [],
    symptoms: [],
    images: [],
    rating: 0,
    reviews: 0,
    views: 0,
    variants: []
  });
  
  const [strengths, setStrengths] = useState<string[]>([]);
  const [forms, setForms] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [shippingOptions, setShippingOptions] = useState<Shipping[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Auto-generate SKU and slug from product name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const generateSKU = (name: string): string => {
    const prefix = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${random}`;
  };

  // Auto-generate SKU and slug when product name changes (only for new products)
  useEffect(() => {
    if (!isEditing && product.name) {
      const newSlug = generateSlug(product.name);
      const newSKU = generateSKU(product.name);

      setProduct(prev => ({
        ...prev,
        slug: newSlug,
        sku: newSKU
      }));
    }
  }, [product.name, isEditing]);

  // Handle removal of existing images
  const handleRemoveExistingImage = (imageUrl: string) => {
    setImagesToRemove(prev => {
      // Prevent duplicate entries
      if (prev.includes(imageUrl)) return prev;
      return [...prev, imageUrl];
    });
    // Also update local state for immediate UI feedback
    setProduct(prev => ({
      ...prev,
      images: prev.images?.filter(img => img.url !== imageUrl) || []
    }));
  };

  // Fetch initial data (categories, brands, countries, shipping options)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setInitialLoading(true);
        setFetchError(null);
        
        const [categoriesData, brandsData, countriesData, shippingData] = await Promise.all([
          productService.getCategories(),
          productService.getBrands(),
          countryService.getCountries(),
          shippingService.getShippingOptions()
        ]);
        
        setCategories(categoriesData);
        setBrands(brandsData);
        setCountries(countriesData);
        setShippingOptions(shippingData);
        
        // console.log('Fetched categories:', categoriesData);
        // console.log('Fetched brands:', brandsData);
        // console.log('Fetched countries:', countriesData);
        // console.log('Fetched shipping options:', shippingData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setFetchError('Failed to load initial data');
        toast.error('Failed to load initial data');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch product data when editing
  useEffect(() => {
    const fetchProduct = async () => {
      if (!isEditing || !slug) return;

      try {
        setInitialLoading(true);
        setFetchError(null);
        console.log('Fetching product data for slug:', slug);
        
        const productData = await productService.getProductBySlug(slug);
        
        if (!productData) {
          setFetchError('Product not found');
          toast.error('Product not found');
          navigate('/admin/products');
          return;
        }
        
        console.log('Product data received:', productData);
        
        // Transform API response to match frontend types
        setProduct({
          id: productData.id,
          sku: productData.sku,
          name: productData.name,
          slug: productData.slug,
          description: productData.description,
          shortDescription: productData.shortDescription,
          composition: productData.composition,
          price: productData.price,
          mrp: productData.mrp,
          discount_percent: productData.discount_percent,
          prescription_required: productData.prescription_required,
          isFeatured: productData.isFeatured,
          isTrending: productData.isTrending,
          isActive: productData.isActive,
          country: productData.country || 'Global', // Set country from API
          brand_id: productData.brand?.id || productData.brand_id,
          category_id: productData.category?.id || productData.category_id,
          stock: productData.stock || 0,
          min_order_quantity: productData.min_order_quantity || 1,
          max_order_quantity: productData.max_order_quantity || 10,
          weight: productData.weight || 0,
          dimensions: productData.dimensions || '',
          brand: productData.brand,
          category: productData.category,
          images: productData.images || [],
          rating: productData.rating,
          reviews: productData.reviews,
          views: productData.views
        });
        
        setDescription(productData.description || '');
        
        // Parse the array fields from the API response
        setStrengths(productService.parseArrayField(productData.strengths));
        setForms(productService.parseArrayField(productData.forms));
        setTags(productService.parseArrayField(productData.tags));
        setSymptoms(productService.parseArrayField(productData.symptoms));
        setVariants(Array.isArray(productData.variants) ? productData.variants : []);
        
        // console.log('Product images:', productData.images);
        // console.log('Parsed strengths:', productService.parseArrayField(productData.strengths));
        // console.log('Parsed forms:', productService.parseArrayField(productData.forms));
        // console.log('Parsed tags:', productService.parseArrayField(productData.tags));
        // console.log('Parsed symptoms:', productService.parseArrayField(productData.symptoms));
      } catch (error) {
        console.error('Error fetching product:', error);
        setFetchError('Failed to load product data');
        toast.error('Failed to load product data');
        navigate('/admin/products');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProduct();
  }, [slug, isEditing, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setProduct(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setProduct(prev => ({ ...prev, [name]: value }));
    }
  };

  const prepareFormData = (): FormData => {
    const formData = new FormData();

    // Basic product fields
    formData.append('name', product.name || '');
    formData.append('sku', product.sku || '');
    formData.append('slug', product.slug || '');
    formData.append('description', description);
    formData.append('shortDescription', product.shortDescription || '');
    formData.append('composition', product.composition || '');
    formData.append('price', (product.price || 0).toString());
    formData.append('mrp', (product.mrp || 0).toString());
    formData.append('prescription_required', product.prescription_required?.toString() || 'false');
    formData.append('isFeatured', product.isFeatured?.toString() || 'false');
    formData.append('isTrending', product.isTrending?.toString() || 'false');
    formData.append('isActive', product.isActive?.toString() || 'true');
    formData.append('country', product.country || 'Global'); // Product-level country
    formData.append('stock', (product.stock || 0).toString());
    formData.append('min_order_quantity', (product.min_order_quantity || 1).toString());
    formData.append('max_order_quantity', (product.max_order_quantity || 10).toString());
    formData.append('weight', (product.weight || 0).toString());
    formData.append('dimensions', product.dimensions || '');
    
    if (product.brand_id) {
      formData.append('brand_id', product.brand_id.toString());
    }
    if (product.category_id) {
      formData.append('category_id', product.category_id.toString());
    }

    // JSON fields - ensure they're arrays
    formData.append('strengths', JSON.stringify(Array.isArray(strengths) ? strengths : []));
    formData.append('forms', JSON.stringify(Array.isArray(forms) ? forms : []));
    formData.append('tags', JSON.stringify(Array.isArray(tags) ? tags : []));
    formData.append('symptoms', JSON.stringify(Array.isArray(symptoms) ? symptoms : []));

    // Variants
    if (variants.length > 0) {
      formData.append('variants', JSON.stringify(variants));
    }

    // Images to remove
    if (imagesToRemove.length > 0) {
      formData.append('imagesToRemove', JSON.stringify(imagesToRemove));
    }

    // Use correct field names that match Multer configuration
    if (images.length > 0) {
      // Use the first image as primaryImage
      formData.append('primaryImage', images[0]);
      
      // Use the rest as secondaryImages
      for (let i = 1; i < images.length; i++) {
        formData.append('secondaryImages', images[i]);
      }
    }

    // Debug: Log form data to see what's being sent
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(key, value.name, value.type, value.size);
      } else {
        console.log(key, value);
      }
    }

    return formData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!product.name || !product.sku || !product.slug || !product.brand_id || !product.category_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (product.price === undefined || product.mrp === undefined) {
      toast.error('Price and MRP are required');
      return;
    }

    setLoading(true);

    try {
      const formData = prepareFormData();

      if (isEditing && product.id) {
        await productService.updateProduct(product.id, formData);
        toast.success('Product updated successfully!');
      } else {
        await productService.createProduct(formData);
        toast.success('Product created successfully!');
      }
      
      navigate('/admin/products');
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} product`);
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
  const brandOptions = brands.map(b => ({ value: b.id, label: b.name }));
  const countryOptions = countries.map(country => ({
    value: country.code,
    label: `${country.flag} ${country.name} (${country.code})`
  }));

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (fetchError && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">{fetchError}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/admin/products" className="text-sm font-semibold text-primaryEnd hover:underline">← Back to Products</Link>
        <h1 className="text-3xl font-poppins font-bold text-slate-800 mt-1">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {/* Product Information Section */}
          <div className="bg-white p-6 rounded-xl shadow-soft-md">
            <h2 className="text-lg font-poppins font-bold text-slate-800 mb-4 border-b pb-2">Product Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={product.name || ''} 
                    onChange={handleChange} 
                    required
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU *</label>
                  <input 
                    type="text" 
                    name="sku" 
                    value={product.sku || ''} 
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={`w-full p-2 border border-slate-300 rounded-lg text-sm ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white'}`}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {!isEditing ? 'Auto-generated from product name' : 'Product SKU'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Slug *</label>
                  <input 
                    type="text" 
                    name="slug" 
                    value={product.slug || ''} 
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={`w-full p-2 border border-slate-300 rounded-lg text-sm ${!isEditing ? 'bg-slate-50 text-slate-500' : 'bg-white'}`}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {!isEditing ? 'Auto-generated from product name' : 'Product URL slug'}
                  </p>
                </div>
                <SearchableSelectWithLabel 
                  label="Product Country *" 
                  options={countryOptions} 
                  value={product.country} 
                  onChange={val => setProduct(p => ({...p, country: val}))} 
                  placeholder="Select country..."
                />
              </div>
              <div className="text-xs text-slate-500 -mt-2">
                <strong>Global</strong> = Show in all countries | <strong>Specific country</strong> = Show only in that country
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Short Description</label>
                <input 
                  type="text" 
                  name="shortDescription" 
                  value={product.shortDescription || ''} 
                  onChange={handleChange} 
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                  placeholder="Brief description for listings"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <CustomReactQuill
                  value={description}
                  onChange={setDescription}
                  placeholder="Enter product description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Composition</label>
                <input 
                  type="text" 
                  name="composition" 
                  value={product.composition || ''} 
                  onChange={handleChange} 
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                  placeholder="Active ingredients and composition"
                />
              </div>
              
              {/* Product Details Section */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price *</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={product.price || 0} 
                    onChange={handleChange} 
                    required
                    step="0.01"
                    min="0"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">MRP *</label>
                  <input 
                    type="number" 
                    name="mrp" 
                    value={product.mrp || 0} 
                    onChange={handleChange} 
                    required
                    step="0.01"
                    min="0"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock *</label>
                  <input 
                    type="number" 
                    name="stock" 
                    value={product.stock || 0} 
                    onChange={handleChange} 
                    required
                    min="0"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Min Order Qty</label>
                  <input 
                    type="number" 
                    name="min_order_quantity" 
                    value={product.min_order_quantity || 1} 
                    onChange={handleChange} 
                    min="1"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Order Qty</label>
                  <input 
                    type="number" 
                    name="max_order_quantity" 
                    value={product.max_order_quantity || 10} 
                    onChange={handleChange} 
                    min="1"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                  <input 
                    type="number" 
                    name="weight" 
                    value={product.weight || 0} 
                    onChange={handleChange} 
                    step="0.01"
                    min="0"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dimensions</label>
                <input 
                  type="text" 
                  name="dimensions" 
                  value={product.dimensions || ''} 
                  onChange={handleChange} 
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" 
                  placeholder="e.g., 10x5x2 cm"
                />
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-white p-6 rounded-xl shadow-soft-md">
            <h2 className="text-lg font-poppins font-bold text-slate-800 mb-4 border-b pb-2">Product Images</h2>
            <ImageUploader 
              onImagesChange={setImages}
              existingImages={product.images || []}
              onRemoveExistingImage={handleRemoveExistingImage}
            />
          </div>

          {/* Variants Section */}
          <div className="bg-white p-6 rounded-xl shadow-soft-md">
            <h2 className="text-lg font-poppins font-bold text-slate-800 mb-4 border-b pb-2">Pricing, Variants & Inventory</h2>
            <VariantManager 
              variants={variants} 
              setVariants={setVariants}
              countries={countries}
              shippingOptions={shippingOptions}
            />
          </div>
        </div>
        
        <div className="lg:col-span-1 space-y-8 sticky top-24">
          {/* Organization Section */}
          <div className="bg-white p-6 rounded-xl shadow-soft-md">
            <h2 className="text-lg font-poppins font-bold text-slate-800 mb-4 border-b pb-2">Organization</h2>
            <div className="space-y-4 text-sm">
              <SearchableSelectWithLabel 
                label="Category *" 
                options={categoryOptions} 
                value={product.category_id} 
                onChange={val => setProduct(p => ({...p, category_id: val}))} 
                placeholder="Select category..."
              />
              <SearchableSelectWithLabel 
                label="Brand *" 
                options={brandOptions} 
                value={product.brand_id} 
                onChange={val => setProduct(p => ({...p, brand_id: val}))} 
                placeholder="Select brand..."
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Strengths</label>
                <TagInput tags={strengths} setTags={setStrengths} placeholder="e.g., 250mg, 500mg..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Forms</label>
                <TagInput tags={forms} setTags={setForms} placeholder="e.g., Tablet, Capsule..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                <TagInput tags={tags} setTags={setTags} placeholder="e.g., pain-relief..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Symptoms</label>
                <TagInput tags={symptoms} setTags={setSymptoms} placeholder="e.g., Headache, Fever..." />
              </div>
            </div>
          </div>
          
          {/* Actions Section */}
          <div className="bg-white p-6 rounded-xl shadow-soft-md">
            <h2 className="text-lg font-poppins font-bold text-slate-800 mb-4 border-b pb-2">Settings</h2>
            <div className="space-y-4">
              <Switch 
                label="Active Product" 
                enabled={product.isActive !== false} 
                setEnabled={val => setProduct(p => ({...p, isActive: val}))} 
              />
              <Switch label="Featured Product" enabled={product.isFeatured || false} setEnabled={val => setProduct(p => ({...p, isFeatured: val}))} />
              <Switch label="Trending Product" enabled={product.isTrending || false} setEnabled={val => setProduct(p => ({...p, isTrending: val}))} />
              <Switch label="Prescription Required" enabled={product.prescription_required || false} setEnabled={val => setProduct(p => ({...p, prescription_required: val}))} />
            </div>
            <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
              <Link to="/admin/products">
                <Button type="button" variant="secondary" disabled={loading}>Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Product')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductEditPage;