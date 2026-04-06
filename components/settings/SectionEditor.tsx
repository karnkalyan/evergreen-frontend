import React from 'react';
import { HomepageSection, Category, Brand, PromoGridItem, FaqItem, PromoCardItem, FeatureCardItem, KeyMetricItem, Testimonial, TrustBadgeItem, ButtonVariant } from '../../types';
import Button from '../../components/shared/Button';
import SearchableSelect from '../../components/shared/SearchableSelect';
import { ICONS } from '../../constants';

interface SectionEditorProps {
    section: HomepageSection;
    index: number;
    isNested: boolean;
    onDragStart: (index: number) => void;
    onDragEnter: (index: number) => void;
    onDragEnd: () => void;
    onSectionChange: (id: string, key: keyof HomepageSection, value: any) => void;
    onConfigChange: (sectionId: string, configKey: string, value: any) => void;
    onDeleteSection: (id: string) => void;
    getConfigValue: (section: HomepageSection, key: string, defaultValue?: any) => any;
    categories: Category[];
    brands: Brand[];
    loadingData: boolean;
    categoryOptions: { value: string; label: string }[];
    buttonVariantOptions: { value: ButtonVariant; label: string }[];
    lucideIcons: { [key: string]: React.ComponentType<any> };
    onAddToGrid: (gridId: string) => void;
}

const Switch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void }> = ({ enabled, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`${enabled ? 'bg-primaryEnd' : 'bg-slate-300'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primaryEnd focus:ring-offset-2`}
    >
        <span
            className={`${enabled ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);

const SectionEditor: React.FC<SectionEditorProps> = ({
    section,
    index,
    isNested,
    onDragStart,
    onDragEnter,
    onDragEnd,
    onSectionChange,
    onConfigChange,
    onDeleteSection,
    getConfigValue,
    categories,
    brands,
    loadingData,
    categoryOptions,
    buttonVariantOptions,
    lucideIcons,
    onAddToGrid
}) => {
    const sectionId = section.id;

    // Handler functions for different section types
    const handlePromoGridItemChange = async (itemIndex: number, field: keyof PromoGridItem, value: any) => {
        const currentItems = (getConfigValue(section, 'promoGridItems', []) as PromoGridItem[]);
        const newItems = [...currentItems];
        
        if (newItems[itemIndex]) {
            newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
            await onConfigChange(sectionId, 'promoGridItems', newItems);
        }
    };

    const addPromoGridItem = async () => {
        const currentItems = getConfigValue(section, 'promoGridItems', []);
        const newItem = { title: 'New Card', subtitle: '', link: '#', bgImage: 'https://placehold.co/600x400' };
        await onConfigChange(sectionId, 'promoGridItems', [...currentItems, newItem]);
    };

    const removePromoGridItem = async (itemIndex: number) => {
        const currentItems = getConfigValue(section, 'promoGridItems', []);
        const newItems = currentItems.filter((_, index) => index !== itemIndex);
        await onConfigChange(sectionId, 'promoGridItems', newItems);
    };

    // FAQ Handlers
    const handleFaqItemChange = async (itemIndex: number, field: keyof FaqItem, value: any) => {
        const currentItems = getConfigValue(section, 'faqItems', []);
        const newItems = [...currentItems];
        
        if (newItems[itemIndex]) {
            newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
            await onConfigChange(sectionId, 'faqItems', newItems);
        }
    };

    const addFaqItem = async () => {
        const currentItems = getConfigValue(section, 'faqItems', []);
        const newItem = { question: 'New Question?', answer: 'New answer.' };
        await onConfigChange(sectionId, 'faqItems', [...currentItems, newItem]);
    };

    const removeFaqItem = async (itemIndex: number) => {
        const currentItems = getConfigValue(section, 'faqItems', []);
        const newItems = currentItems.filter((_, index) => index !== itemIndex);
        await onConfigChange(sectionId, 'faqItems', newItems);
    };

    // Promo Cards Handlers
    const handlePromoCardItemChange = async (itemIndex: number, field: keyof PromoCardItem, value: any) => {
        const currentItems = getConfigValue(section, 'promoCards', []);
        const newItems = [...currentItems];
        
        if (newItems[itemIndex]) {
            newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
            await onConfigChange(sectionId, 'promoCards', newItems);
        }
    };

    const addPromoCardItem = async () => {
        const currentItems = getConfigValue(section, 'promoCards', []);
        const newItem = { title: 'New Card', subtitle: '', link: '#', bgColor: 'bg-slate-100', textColor: 'text-slate-800' };
        await onConfigChange(sectionId, 'promoCards', [...currentItems, newItem]);
    };

    const removePromoCardItem = async (itemIndex: number) => {
        const currentItems = getConfigValue(section, 'promoCards', []);
        const newItems = currentItems.filter((_, index) => index !== itemIndex);
        await onConfigChange(sectionId, 'promoCards', newItems);
    };

    // Feature Cards Handlers
    const handleFeatureCardItemChange = async (itemIndex: number, field: keyof FeatureCardItem, value: any) => {
        const currentItems = getConfigValue(section, 'featureCards', []);
        const newItems = [...currentItems];
        
        if (newItems[itemIndex]) {
            newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
            await onConfigChange(sectionId, 'featureCards', newItems);
        }
    };

    const addFeatureCardItem = async () => {
        const currentItems = getConfigValue(section, 'featureCards', []);
        const newItem = { icon: 'placeholder', title: 'New Feature', description: 'Description for the new feature.' };
        await onConfigChange(sectionId, 'featureCards', [...currentItems, newItem]);
    };

    const removeFeatureCardItem = async (itemIndex: number) => {
        const currentItems = getConfigValue(section, 'featureCards', []);
        const newItems = currentItems.filter((_, index) => index !== itemIndex);
        await onConfigChange(sectionId, 'featureCards', newItems);
    };

    // Testimonials Handlers
    const handleTestimonialItemChange = async (itemIndex: number, field: keyof Testimonial, value: any) => {
        const currentItems = getConfigValue(section, 'testimonialItems', []);
        const newItems = [...currentItems];
        
        if (newItems[itemIndex]) {
            newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
            await onConfigChange(sectionId, 'testimonialItems', newItems);
        }
    };

    const addTestimonialItem = async () => {
        const currentItems = getConfigValue(section, 'testimonialItems', []);
        const newItem = { 
            id: `testimonial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
            name: 'New Person', 
            location: 'City, Country', 
            avatar: 'https://placehold.co/100x100', 
            text: 'New testimonial text.', 
            rating: 5 
        };
        await onConfigChange(sectionId, 'testimonialItems', [...currentItems, newItem]);
    };

    const removeTestimonialItem = async (itemIndex: number) => {
        const currentItems = getConfigValue(section, 'testimonialItems', []);
        const newItems = currentItems.filter((_, index) => index !== itemIndex);
        await onConfigChange(sectionId, 'testimonialItems', newItems);
    };

    // Trust Badges Handlers
    const handleTrustBadgeItemChange = async (itemIndex: number, field: keyof TrustBadgeItem, value: any) => {
        const currentItems = getConfigValue(section, 'trustBadgeItems', []);
        const newItems = [...currentItems];
        
        if (newItems[itemIndex]) {
            newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
            await onConfigChange(sectionId, 'trustBadgeItems', newItems);
        }
    };

    const addTrustBadgeItem = async (icon: string = 'shield') => {
        const currentItems = getConfigValue(section, 'trustBadgeItems', []);
        const newItem = { 
            id: `trust-badge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
            icon, 
            title: `New ${icon} Badge`, 
            color: 'text-green-600' 
        };
        await onConfigChange(sectionId, 'trustBadgeItems', [...currentItems, newItem]);
    };

    const removeTrustBadgeItem = async (itemIndex: number) => {
        const currentItems = getConfigValue(section, 'trustBadgeItems', []);
        const newItems = currentItems.filter((_, index) => index !== itemIndex);
        await onConfigChange(sectionId, 'trustBadgeItems', newItems);
    };

    // Brand Carousel Handler
    const handleBrandSelectionChange = async (brandId: number, isSelected: boolean) => {
        const currentIds = getConfigValue(section, 'brandIds', []);
        const newIds = isSelected
            ? [...currentIds, brandId]
            : currentIds.filter(id => id !== brandId);
        await onConfigChange(sectionId, 'brandIds', newIds);
    };

    // Image Gallery Handlers
    const handleImageGalleryUrlChange = async (imageIndex: number, value: string) => {
        const currentImages = getConfigValue(section, 'galleryImages', []);
        const newImages = currentImages.map((url, i) => i === imageIndex ? value : url);
        await onConfigChange(sectionId, 'galleryImages', newImages);
    };

    const addImageToGallery = async () => {
        const currentImages = getConfigValue(section, 'galleryImages', []);
        await onConfigChange(sectionId, 'galleryImages', [...currentImages, 'https://placehold.co/400x400']);
    };

    const removeImageFromGallery = async (imageIndex: number) => {
        const currentImages = getConfigValue(section, 'galleryImages', []);
        await onConfigChange(sectionId, 'galleryImages', currentImages.filter((_, i) => i !== imageIndex));
    };

    // Grid Handlers
    const handleGridTemplateChange = (newTemplate: number[]) => {
        onConfigChange(sectionId, 'columnTemplate', newTemplate);
    };

    const handleGridSpanChange = (spanIndex: number, value: number) => {
        const columnTemplate = getConfigValue(section, 'columnTemplate', [12]);
        const newTemplate = [...columnTemplate];
        newTemplate[spanIndex] = isNaN(value) || value < 1 ? 1 : value;
        handleGridTemplateChange(newTemplate);
    };

    const handleAddGridColumn = () => {
        const columnTemplate = getConfigValue(section, 'columnTemplate', [12]);
        handleGridTemplateChange([...columnTemplate, 1]);
    };

    const handleRemoveGridColumn = (spanIndex: number) => {
        const columnTemplate = getConfigValue(section, 'columnTemplate', [12]);
        if (columnTemplate.length > 1) {
            handleGridTemplateChange(columnTemplate.filter((_, i) => i !== spanIndex));
        }
    };

    const handleRemoveGridItem = async (itemId: string) => {
        const currentItems = getConfigValue(section, 'items', []);
        const newItems = currentItems.filter(item => item.id !== itemId);
        await onConfigChange(sectionId, 'items', newItems);
    };

    const renderSectionConfig = () => {
        switch (section.type) {
            case 'CATEGORY_CAROUSEL':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <SearchableSelect 
                            options={categoryOptions}
                            value={getConfigValue(section, 'categorySlug', '')}
                            onChange={(val) => onConfigChange(sectionId, 'categorySlug', val)}
                        />
                        <div className="flex items-center space-x-2 text-sm">
                            <label>Products:</label>
                            <input 
                                type="number" 
                                value={getConfigValue(section, 'productCount', 8)}
                                onChange={(e) => onConfigChange(sectionId, 'productCount', parseInt(e.target.value, 10))}
                                className="w-20 p-2 bg-white border border-slate-300 rounded-md text-sm" 
                            />
                        </div>
                    </div>
                );

            case 'CATEGORY_GRID':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2 text-sm">
                            <label>Start From:</label>
                            <input 
                                type="number" 
                                value={getConfigValue(section, 'categoryDisplayStart', 1)}
                                onChange={(e) => onConfigChange(sectionId, 'categoryDisplayStart', parseInt(e.target.value, 10))}
                                className="w-20 p-2 bg-white border border-slate-300 rounded-md text-sm" 
                            />
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                            <label>Show Total:</label>
                            <input 
                                type="number" 
                                value={getConfigValue(section, 'categoryDisplayCount', 18)}
                                onChange={(e) => onConfigChange(sectionId, 'categoryDisplayCount', parseInt(e.target.value, 10))}
                                className="w-20 p-2 bg-white border border-slate-300 rounded-md text-sm" 
                            />
                        </div>
                    </div>
                );

            case 'PROMO_GRID':
                return (
                    <div className="space-y-4 p-2 border-l-2">
                        {(getConfigValue(section, 'promoGridItems', [])).map((item: PromoGridItem, index: number) => (
                            <div key={index} className="space-y-2 p-3 bg-slate-100 rounded-md relative">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-xs font-bold text-slate-600">Card {index + 1}</h4>
                                    <button type="button" onClick={() => removePromoGridItem(index)} className="text-coral p-1 rounded-full hover:bg-red-50">
                                        {React.cloneElement(ICONS.close, { className: "w-3 h-3" })}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Title"
                                        value={item.title}
                                        onChange={e => handlePromoGridItemChange(index, 'title', e.target.value)}
                                        className="p-2 bg-white border border-slate-300 rounded-md text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Subtitle"
                                        value={item.subtitle}
                                        onChange={e => handlePromoGridItemChange(index, 'subtitle', e.target.value)}
                                        className="p-2 bg-white border border-slate-300 rounded-md text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Link URL"
                                        value={item.link}
                                        onChange={e => handlePromoGridItemChange(index, 'link', e.target.value)}
                                        className="p-2 bg-white border border-slate-300 rounded-md text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Background Image URL"
                                        value={item.bgImage}
                                        onChange={e => handlePromoGridItemChange(index, 'bgImage', e.target.value)}
                                        className="p-2 bg-white border border-slate-300 rounded-md text-sm"
                                    />
                                </div>
                            </div>
                        ))}
                        <Button size="sm" variant="secondary" onClick={addPromoGridItem}>Add Promo Card</Button>
                    </div>
                );

            case 'PROMO_CARDS':
                return (
                    <div className="space-y-4 p-2 border-l-2">
                        {(getConfigValue(section, 'promoCards', [])).map((item: PromoCardItem, index: number) => (
                            <div key={index} className="space-y-2 p-3 bg-slate-100 rounded-md relative">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-xs font-bold text-slate-600">Card {index + 1}</h4>
                                    <button type="button" onClick={() => removePromoCardItem(index)} className="text-coral p-1 rounded-full hover:bg-red-50">
                                        {React.cloneElement(ICONS.close, { className: "w-3 h-3" })}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" placeholder="Title" value={item.title} onChange={e => handlePromoCardItemChange(index, 'title', e.target.value)} className="col-span-2 p-2 bg-white border border-slate-300 rounded-md text-sm" />
                                    <input type="text" placeholder="Subtitle" value={item.subtitle} onChange={e => handlePromoCardItemChange(index, 'subtitle', e.target.value)} className="col-span-2 p-2 bg-white border border-slate-300 rounded-md text-sm" />
                                    <input type="text" placeholder="Link" value={item.link} onChange={e => handlePromoCardItemChange(index, 'link', e.target.value)} className="col-span-2 p-2 bg-white border border-slate-300 rounded-md text-sm" />
                                    <input type="text" placeholder="Button Text" value={item.buttonText || ''} onChange={e => handlePromoCardItemChange(index, 'buttonText', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm" />
                                    <input type="text" placeholder="Link Text" value={item.linkText || ''} onChange={e => handlePromoCardItemChange(index, 'linkText', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm" />
                                    <input type="text" placeholder="BG Color" value={item.bgColor} onChange={e => handlePromoCardItemChange(index, 'bgColor', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm" />
                                    <input type="text" placeholder="Text Color" value={item.textColor} onChange={e => handlePromoCardItemChange(index, 'textColor', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm" />
                                    <div className="col-span-2">
                                        <SearchableSelect 
                                            options={buttonVariantOptions} 
                                            value={item.buttonVariant} 
                                            onChange={val => handlePromoCardItemChange(index, 'buttonVariant', val as string)} 
                                            placeholder="Button Variant..." 
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button size="sm" variant="secondary" onClick={addPromoCardItem}>Add Card</Button>
                    </div>
                );

            case 'FEATURE_CARDS':
                return (
                    <div className="space-y-4 p-2 border-l-2">
                        {(getConfigValue(section, 'featureCards', [])).map((item: FeatureCardItem, index: number) => (
                            <div key={index} className="space-y-2 p-3 bg-slate-100 rounded-md relative">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-xs font-bold text-slate-600">Card {index + 1}</h4>
                                    <button type="button" onClick={() => removeFeatureCardItem(index)} className="text-coral p-1 rounded-full hover:bg-red-50">
                                        {React.cloneElement(ICONS.close, { className: "w-3 h-3" })}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    <input type="text" placeholder="Icon Name" value={item.icon} onChange={e => handleFeatureCardItemChange(index, 'icon', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm" />
                                    <input type="text" placeholder="Title" value={item.title} onChange={e => handleFeatureCardItemChange(index, 'title', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm" />
                                    <textarea placeholder="Description" value={item.description} onChange={e => handleFeatureCardItemChange(index, 'description', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm h-20"></textarea>
                                </div>
                            </div>
                        ))}
                        <Button size="sm" variant="secondary" onClick={addFeatureCardItem}>Add Feature Card</Button>
                    </div>
                );

            case 'KEY_METRICS':
                return (
                    <div className="space-y-4 p-2 border-l-2">
                        {(getConfigValue(section, 'keyMetrics', [])).map((item: KeyMetricItem, index: number) => (
                            <div key={index} className="space-y-2 p-3 bg-slate-100 rounded-md relative">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-xs font-bold text-slate-600">Metric {index + 1}</h4>
                                    <button type="button" onClick={() => removeFeatureCardItem(index)} className="text-coral p-1 rounded-full hover:bg-red-50">
                                        {React.cloneElement(ICONS.close, { className: "w-3 h-3" })}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    <input type="text" placeholder="Value" value={item.value} onChange={e => handleFeatureCardItemChange(index, 'value', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm" />
                                    <input type="text" placeholder="Label" value={item.label} onChange={e => handleFeatureCardItemChange(index, 'label', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm" />
                                    <input type="text" placeholder="Icon" value={item.icon} onChange={e => handleFeatureCardItemChange(index, 'icon', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm" />
                                </div>
                            </div>
                        ))}
                        <Button size="sm" variant="secondary" onClick={addFeatureCardItem}>Add Metric</Button>
                    </div>
                );

            case 'IMAGE_GALLERY':
                return (
                    <div className="space-y-4 p-2 border-l-2">
                        <SearchableSelect 
                            options={[{value: 'grid', label: 'Grid'}, {value: 'masonry', label: 'Masonry'}]} 
                            value={getConfigValue(section, 'galleryLayout', 'grid')} 
                            onChange={val => onConfigChange(sectionId, 'galleryLayout', val)} 
                        />
                        {(getConfigValue(section, 'galleryImages', [])).map((url: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input type="text" placeholder="Image URL" value={url} onChange={e => handleImageGalleryUrlChange(index, e.target.value)} className="flex-grow p-2 bg-white border border-slate-300 rounded-md text-sm" />
                                <button type="button" onClick={() => removeImageFromGallery(index)} className="text-coral p-1 rounded-full hover:bg-red-50">
                                    {React.cloneElement(ICONS.close, { className: "w-4 h-4" })}
                                </button>
                            </div>
                        ))}
                        <Button size="sm" variant="secondary" onClick={addImageToGallery}>Add Image</Button>
                    </div>
                );

            case 'TRUST_BADGES':
                return (
                    <div className="space-y-4 p-2 border-l-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-2 block">Available Icons</label>
                                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-md">
                                    {Object.entries(lucideIcons).map(([key, IconComponent]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            className="flex flex-col items-center p-2 rounded hover:bg-white transition-colors"
                                            onClick={() => addTrustBadgeItem(key)}
                                        >
                                            <IconComponent className="w-5 h-5 mb-1 text-slate-600" />
                                            <span className="text-xs text-slate-600 capitalize">{key}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-2 block">Current Badges</label>
                                <div className="space-y-3">
                                    {(getConfigValue(section, 'trustBadgeItems', [])).map((item: TrustBadgeItem, index: number) => (
                                        <div key={item.id} className="space-y-2 p-3 bg-slate-100 rounded-md relative">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="text-xs font-bold text-slate-600">Badge {index + 1}</h4>
                                                <button type="button" onClick={() => removeTrustBadgeItem(index)} className="text-coral p-1 rounded-full hover:bg-red-50">
                                                    {React.cloneElement(ICONS.close, { className: "w-3 h-3" })}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Title"
                                                    value={item.title}
                                                    onChange={e => handleTrustBadgeItemChange(index, 'title', e.target.value)}
                                                    className="p-2 bg-white border border-slate-300 rounded-md text-sm"
                                                />
                                                <div className="flex items-center space-x-2 p-2 bg-white border border-slate-300 rounded-md text-sm">
                                                    <span className="text-xs text-slate-500">Icon:</span>
                                                    {lucideIcons[item.icon] ? (
                                                        React.createElement(lucideIcons[item.icon], { 
                                                            className: "w-4 h-4 text-slate-600" 
                                                        })
                                                    ) : (
                                                        <span className="text-xs text-slate-400">No icon</span>
                                                    )}
                                                    <select
                                                        value={item.icon}
                                                        onChange={e => handleTrustBadgeItemChange(index, 'icon', e.target.value)}
                                                        className="flex-1 bg-transparent border-0 focus:ring-0 text-sm"
                                                    >
                                                        <option value="">Select Icon</option>
                                                        {Object.keys(lucideIcons).map(iconKey => (
                                                            <option key={iconKey} value={iconKey}>
                                                                {iconKey.replace(/([A-Z])/g, ' $1').trim()}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <select
                                                    value={item.color}
                                                    onChange={e => handleTrustBadgeItemChange(index, 'color', e.target.value)}
                                                    className="p-2 bg-white border border-slate-300 rounded-md text-sm"
                                                >
                                                    <option value="text-green-600">Green</option>
                                                    <option value="text-blue-600">Blue</option>
                                                    <option value="text-red-600">Red</option>
                                                    <option value="text-yellow-600">Yellow</option>
                                                    <option value="text-purple-600">Purple</option>
                                                    <option value="text-indigo-600">Indigo</option>
                                                    <option value="text-slate-600">Slate</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {getConfigValue(section, 'trustBadgeItems', []).length === 0 && (
                            <p className="text-xs text-slate-500 text-center py-4">
                                Click on an icon above to add a trust badge
                            </p>
                        )}
                    </div>
                );

            case 'GRID':
                const columnTemplate = getConfigValue(section, 'columnTemplate', [12]);
                const items = getConfigValue(section, 'items', []);
                const totalSpan = columnTemplate.reduce((a: number, b: number) => a + b, 0);

                return (
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-600">Layout Presets</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                <Button size="sm" variant="secondary" onClick={() => handleGridTemplateChange([12])}>1 Col</Button>
                                <Button size="sm" variant="secondary" onClick={() => handleGridTemplateChange([6, 6])}>6-6</Button>
                                <Button size="sm" variant="secondary" onClick={() => handleGridTemplateChange([8, 4])}>8-4</Button>
                                <Button size="sm" variant="secondary" onClick={() => handleGridTemplateChange([4, 8])}>4-8</Button>
                                <Button size="sm" variant="secondary" onClick={() => handleGridTemplateChange([4, 4, 4])}>4-4-4</Button>
                                <Button size="sm" variant="secondary" onClick={() => handleGridTemplateChange([3, 9])}>3-9</Button>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600">Custom Column Spans (Total must be 12)</label>
                            <div className="flex items-center flex-wrap gap-2 mt-1">
                                {columnTemplate.map((span: number, spanIndex: number) => (
                                    <div key={spanIndex} className="relative">
                                        <input 
                                            type="number" 
                                            value={span} 
                                            min="1" 
                                            max="12" 
                                            onChange={(e) => handleGridSpanChange(spanIndex, parseInt(e.target.value))} 
                                            className="w-16 p-2 bg-white border border-slate-300 rounded-md text-sm pr-6" 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveGridColumn(spanIndex)} 
                                            className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-coral p-1" 
                                            title="Remove column"
                                        >
                                            {React.cloneElement(ICONS.close, { className: 'w-3 h-3'})}
                                        </button>
                                    </div>
                                ))}
                                <button 
                                    type="button" 
                                    onClick={handleAddGridColumn} 
                                    className="p-2 text-slate-500 hover:text-primaryEnd" 
                                    title="Add column"
                                >
                                    {React.cloneElement(ICONS.plus, { className: 'w-5 h-5'})}
                                </button>
                            </div>
                            {totalSpan !== 12 && (
                                <p className="text-xs text-coral mt-1 font-semibold">
                                    Total span must be 12. Current total: {totalSpan}
                                </p>
                            )}
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-slate-600 mb-2">Grid Items ({items.length})</h4>
                            <div className="space-y-3 border-2 border-dashed border-slate-200 rounded-lg p-4 bg-slate-50">
                                {items.length > 0 ? (
                                    items.map((item: HomepageSection, itemIndex: number) => (
                                        <div key={item.id} className="relative">
                                            <SectionEditor
                                                section={item}
                                                index={itemIndex}
                                                isNested={true}
                                                onDragStart={() => {}}
                                                onDragEnter={() => {}}
                                                onDragEnd={() => {}}
                                                onSectionChange={onSectionChange}
                                                onConfigChange={onConfigChange}
                                                onDeleteSection={onDeleteSection}
                                                getConfigValue={getConfigValue}
                                                categories={categories}
                                                brands={brands}
                                                loadingData={loadingData}
                                                categoryOptions={categoryOptions}
                                                buttonVariantOptions={buttonVariantOptions}
                                                lucideIcons={lucideIcons}
                                                onAddToGrid={onAddToGrid}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveGridItem(item.id)}
                                                className="absolute top-2 right-2 p-1 text-coral hover:bg-red-50 rounded-full z-10"
                                                title="Remove from grid"
                                            >
                                                {React.cloneElement(ICONS.close, { className: 'w-4 h-4' })}
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-slate-400 mb-2">{ICONS.grid}</div>
                                        <p className="text-sm text-slate-500">No items in this grid yet</p>
                                        <p className="text-xs text-slate-400 mt-1">Add sections to create your layout</p>
                                    </div>
                                )}
                                <div className="text-center pt-2">
                                    <Button 
                                        type="button" 
                                        size="sm" 
                                        variant="secondary" 
                                        onClick={() => onAddToGrid(sectionId)}
                                    >
                                        {React.cloneElement(ICONS.plus, { className: 'w-4 h-4 mr-1' })}
                                        Add Item to Grid
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'PROMO_BANNER':
                return (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-2 border-l-2">
                        <input type="text" placeholder="Title" value={getConfigValue(section, 'promoBannerTitle', '')} onChange={e => onConfigChange(sectionId, 'promoBannerTitle', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm" />
                        <input type="text" placeholder="Subtitle" value={getConfigValue(section, 'promoBannerSubtitle', '')} onChange={e => onConfigChange(sectionId, 'promoBannerSubtitle', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm" />
                        <input type="text" placeholder="Button Text" value={getConfigValue(section, 'promoBannerButtonText', '')} onChange={e => onConfigChange(sectionId, 'promoBannerButtonText', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm" />
                        <input type="text" placeholder="Button Link" value={getConfigValue(section, 'promoBannerLink', '')} onChange={e => onConfigChange(sectionId, 'promoBannerLink', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm" />
                        <input type="text" placeholder="Background Image URL" value={getConfigValue(section, 'promoBannerImage', '')} onChange={e => onConfigChange(sectionId, 'promoBannerImage', e.target.value)} className="col-span-2 p-2 bg-white border border-slate-300 rounded-md text-sm" />
                    </div>
                );

            case 'VIDEO':
                return (
                    <input type="text" placeholder="YouTube or Vimeo URL" value={getConfigValue(section, 'videoUrl', '')} onChange={e => onConfigChange(sectionId, 'videoUrl', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm w-full" />
                );

            case 'FAQ':
                return (
                    <div className="space-y-2">
                        {(getConfigValue(section, 'faqItems', [])).map((item: FaqItem, itemIndex: number) => (
                            <div key={itemIndex} className="grid grid-cols-1 gap-2 p-2 border-l-2 relative">
                                <input type="text" placeholder="Question" value={item.question} onChange={e => handleFaqItemChange(itemIndex, 'question', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm" />
                                <textarea placeholder="Answer" value={item.answer} onChange={e => handleFaqItemChange(itemIndex, 'answer', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm h-20"></textarea>
                                <button onClick={() => removeFaqItem(itemIndex)} className="absolute top-1 right-1 text-coral p-1 rounded-full hover:bg-red-50">
                                    {React.cloneElement(ICONS.close, {className: "w-3 h-3"})}
                                </button>
                            </div>
                        ))}
                        <Button size="sm" variant="secondary" onClick={addFaqItem}>Add FAQ Item</Button>
                    </div>
                );

            case 'CALL_TO_ACTION':
                return (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-2 border-l-2">
                        <input type="text" placeholder="Subtitle" value={getConfigValue(section, 'ctaSubtitle', '')} onChange={e => onConfigChange(sectionId, 'ctaSubtitle', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm col-span-2" />
                        <input type="text" placeholder="Button Text" value={getConfigValue(section, 'ctaButtonText', '')} onChange={e => onConfigChange(sectionId, 'ctaButtonText', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm" />
                        <input type="text" placeholder="Button Link" value={getConfigValue(section, 'ctaLink', '')} onChange={e => onConfigChange(sectionId, 'ctaLink', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm" />
                    </div>
                );

            case 'FEATURED_PRODUCTS':
                return (
                    <div className="flex items-center space-x-2 text-sm">
                        <label>Number of products to show:</label>
                        <input type="number" value={getConfigValue(section, 'productCount', 4)} onChange={(e) => onConfigChange(sectionId, 'productCount', parseInt(e.target.value, 10))} className="w-20 p-2 bg-white border border-slate-300 rounded-md text-sm" />
                    </div>
                );

            case 'BLOG':
                return (
                    <div className="flex items-center space-x-2 text-sm">
                        <label>Number of posts to show:</label>
                        <input type="number" value={getConfigValue(section, 'postCount', 3)} onChange={(e) => onConfigChange(sectionId, 'postCount', parseInt(e.target.value, 10))} className="w-20 p-2 bg-white border border-slate-300 rounded-md text-sm" />
                    </div>
                );

            case 'TESTIMONIALS':
                return (
                    <div className="space-y-4 p-2 border-l-2">
                        {(getConfigValue(section, 'testimonialItems', [])).map((item: Testimonial, index: number) => (
                            <div key={index} className="space-y-2 p-3 bg-slate-100 rounded-md relative">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-xs font-bold text-slate-600">Testimonial {index + 1}</h4>
                                    <button type="button" onClick={() => removeTestimonialItem(index)} className="text-coral p-1 rounded-full hover:bg-red-50">
                                        {React.cloneElement(ICONS.close, { className: "w-3 h-3" })}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" placeholder="Name" value={item.name} onChange={e => handleTestimonialItemChange(index, 'name', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm" />
                                    <input type="text" placeholder="Location" value={item.location} onChange={e => handleTestimonialItemChange(index, 'location', e.target.value)} className="p-2 bg-white border border-slate-300 rounded-md text-sm" />
                                    <input type="text" placeholder="Avatar URL" value={item.avatar} onChange={e => handleTestimonialItemChange(index, 'avatar', e.target.value)} className="col-span-2 p-2 bg-white border border-slate-300 rounded-md text-sm" />
                                    <textarea placeholder="Text" value={item.text} onChange={e => handleTestimonialItemChange(index, 'text', e.target.value)} className="col-span-2 p-2 bg-white border border-slate-300 rounded-md text-sm h-20" />
                                    <div>
                                        <label className="text-xs">Rating</label>
                                        <input type="number" min="1" max="5" value={item.rating} onChange={e => handleTestimonialItemChange(index, 'rating', parseInt(e.target.value))} className="w-full p-2 bg-white border border-slate-300 rounded-md text-sm" />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button size="sm" variant="secondary" onClick={addTestimonialItem}>Add Testimonial</Button>
                    </div>
                );

            case 'BRAND_CAROUSEL':
                return (
                    <div className="space-y-2 p-2 border-l-2">
                        <h4 className="text-xs font-bold text-slate-600 mb-2">Select Brands to Display</h4>
                        {loadingData ? (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primaryEnd mx-auto"></div>
                                <p className="text-xs text-slate-500 mt-2">Loading brands...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                {brands.map(brand => (
                                    <div key={brand.id} className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            id={`brand-select-${sectionId}-${brand.id}`} 
                                            checked={(getConfigValue(section, 'brandIds', [])).includes(brand.id)} 
                                            onChange={(e) => handleBrandSelectionChange(brand.id, e.target.checked)} 
                                            className="h-4 w-4 rounded border-slate-300 text-primaryEnd focus:ring-primaryEnd" 
                                        />
                                        <label htmlFor={`brand-select-${sectionId}-${brand.id}`} className="ml-2 text-sm text-slate-700 flex items-center">
                                            {brand.logo && (
                                                <img src={brand.logo} alt={brand.name} className="w-6 h-6 object-contain mr-2" />
                                            )}
                                            {brand.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                        {brands.length === 0 && !loadingData && (
                            <p className="text-xs text-slate-500 text-center py-2">No brands available</p>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div 
            className={isNested ? "p-3 bg-white rounded-lg border ml-6" : "p-3 bg-slate-50 rounded-lg border"}
            draggable={!isNested}
            onDragStart={() => !isNested && onDragStart(index)}
            onDragEnter={() => !isNested && onDragEnter(index)}
            onDragEnd={!isNested ? onDragEnd : undefined}
            onDragOver={(e) => !isNested && e.preventDefault()}
        >
            <div className="flex items-center space-x-4">
                {!isNested && <div className="cursor-grab text-slate-400 hover:text-slate-600" title="Drag to reorder">{ICONS.drag}</div>}
                <div className="flex-grow">
                    {section.type === 'GRID' ? (
                        <div className="p-1">
                            <p className="font-semibold text-slate-700 text-sm">Grid Layout</p>
                            <p className="text-xs text-slate-400">Container for other sections</p>
                        </div>
                    ) : (
                        <>
                            <input 
                                type="text"
                                value={section.title}
                                onChange={(e) => onSectionChange(sectionId, 'title', e.target.value)}
                                className="font-semibold text-slate-700 text-sm bg-transparent focus:bg-white border-0 focus:ring-1 focus:ring-primaryEnd rounded p-1 w-full"
                            />
                            <p className="text-xs text-slate-400 pl-1">{section.type.replace(/_/g, ' ')}</p>
                        </>
                    )}
                </div>
                <Switch 
                    enabled={section.enabled} 
                    onChange={(val) => onSectionChange(sectionId, 'enabled', val)} 
                />
                <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSection(sectionId);
                    }}
                    className="p-1.5 text-slate-400 hover:text-coral rounded-full hover:bg-red-50"
                    title="Delete Section"
                >
                    {React.cloneElement(ICONS.trash, { className: 'w-5 h-5' })}
                </button>
            </div>

            <div className={isNested ? "pt-3 mt-3 border-t" : "pl-10 pt-3 mt-3 border-t"}>
                {renderSectionConfig()}
            </div>
        </div>
    );
};

export default SectionEditor;