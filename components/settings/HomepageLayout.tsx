import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useApp } from '../../hooks/useApp';
import { homepageService } from '../../lib/homeService';
import { publicCategoryService } from '../../lib/categoryService';
import { publicBrandService } from '../../lib/brandService';
import { HomepageSection, Category, Brand, PromoGridItem, FaqItem, PromoCardItem, FeatureCardItem, KeyMetricItem, Testimonial, TrustBadgeItem, ButtonVariant } from '../../types';
import Button from '../../components/shared/Button';
import SearchableSelect from '../../components/shared/SearchableSelect';
import AddSectionModal from '../../components/admin/settings/AddSectionModal';
import SectionEditor from './../settings/SectionEditor';
import { ICONS } from '../../constants';
import { 
    Shield, Truck, CreditCard, Clock, Heart, Star, Award,
    CheckCircle, Lock, Users, ThumbsUp 
} from 'lucide-react';

const Switch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; }> = ({ enabled, onChange }) => (
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

const HomepageLayout: React.FC = () => {
    const { 
        homepageSections, 
        updateHomepageSections, 
        refreshHomepageSections 
    } = useApp();
    
    const [isAddSectionModalOpen, setAddSectionModalOpen] = useState(false);
    const [addingToGridId, setAddingToGridId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const [dragging, setDragging] = useState(false);

    const LUCIDE_ICONS: { [key: string]: React.ComponentType<any> } = {
        shield: Shield, truck: Truck, creditCard: CreditCard, clock: Clock,
        heart: Heart, star: Star, award: Award, checkCircle: CheckCircle,
        lock: Lock, users: Users, thumbsUp: ThumbsUp
    };

    // Fetch categories and brands from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingData(true);
                const [categoriesData, brandsData] = await Promise.all([
                    publicCategoryService.getCategories(),
                    publicBrandService.getBrands()
                ]);
                setCategories(categoriesData);
                setBrands(brandsData);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load categories and brands');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    const categoryOptions = categories.map(c => ({ value: c.slug, label: c.name }));
    const buttonVariantOptions: { value: ButtonVariant, label: string }[] = [
        { value: 'primary', label: 'Primary' }, 
        { value: 'secondary', label: 'Secondary' },
        { value: 'ghost', label: 'Ghost' }, 
        { value: 'accent', label: 'Accent' }, 
        { value: 'danger', label: 'Danger' }
    ];

    // Drag and drop handlers
    const handleDragStart = (index: number) => {
        dragItem.current = index;
        setDragging(true);
    };
    
    const handleDragEnter = (index: number) => {
        dragOverItem.current = index;
    };
    
    const handleDragEnd = async () => {
        if (dragItem.current === null || dragOverItem.current === null) {
            setDragging(false);
            return;
        };
        
        const newSections = [...homepageSections];
        const draggedItemContent = newSections.splice(dragItem.current, 1)[0];
        newSections.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        
        try {
            await updateHomepageSections(newSections);
            toast.success('Sections reordered successfully!');
        } catch (error) {
            toast.error('Failed to reorder sections');
        } finally {
            setDragging(false);
        }
    };

    const handleSectionChange = async (id: string, key: keyof HomepageSection, value: any) => {
        const recursivelyUpdate = (sections: HomepageSection[]): HomepageSection[] => {
            return sections.map(section => {
                if (section.id === id) {
                    return { ...section, [key]: value };
                }
                if (section.type === 'GRID' && section.config?.items) {
                    return { 
                        ...section, 
                        config: {
                            ...section.config,
                            items: recursivelyUpdate(section.config.items)
                        }
                    };
                }
                return section;
            });
        };
        
        const newSections = recursivelyUpdate(homepageSections);
        try {
            await updateHomepageSections(newSections);
        } catch (error) {
            toast.error('Failed to update section');
        }
    };

    const handleConfigChange = async (sectionId: string, configKey: string, value: any) => {
        const recursivelyUpdateConfig = (sections: HomepageSection[]): HomepageSection[] => {
            return sections.map(section => {
                if (section.id === sectionId) {
                    const currentConfig = section.config || {};
                    return {
                        ...section,
                        config: {
                            ...currentConfig,
                            [configKey]: value
                        }
                    };
                }
                if (section.type === 'GRID' && section.config?.items) {
                    return {
                        ...section,
                        config: {
                            ...section.config,
                            items: recursivelyUpdateConfig(section.config.items)
                        }
                    };
                }
                return section;
            });
        };
        
        const newSections = recursivelyUpdateConfig(homepageSections);
        try {
            await updateHomepageSections(newSections);
        } catch (error) {
            toast.error('Failed to update section config');
        }
    };

    const handleDeleteSection = async (id: string) => {
        const isGridItem = id.startsWith('grid-item-');
        
        toast((t) => (
            <div className="p-4 bg-white rounded-lg shadow-lg">
                <p className="text-center text-sm text-slate-700 mb-4">
                    Are you sure you want to delete this {isGridItem ? 'grid item' : 'section'}? This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-3">
                    <Button variant="secondary" size="sm" onClick={() => toast.dismiss(t.id)}>Cancel</Button>
                    <Button variant="danger" size="sm" onClick={async () => {
                        try {
                            if (isGridItem) {
                                const findAndRemoveFromGrid = (sections: HomepageSection[]): HomepageSection[] => {
                                    return sections.map(section => {
                                        if (section.type === 'GRID' && section.config?.items) {
                                            const currentItems = section.config.items || [];
                                            const itemExists = currentItems.some(item => item.id === id);
                                            
                                            if (itemExists) {
                                                const newItems = currentItems.filter(item => item.id !== id);
                                                return {
                                                    ...section,
                                                    config: {
                                                        ...section.config,
                                                        items: newItems
                                                    }
                                                };
                                            }
                                            
                                            const updatedItems = currentItems.map(item => {
                                                if (item.type === 'GRID' && item.config?.items) {
                                                    return {
                                                        ...item,
                                                        config: {
                                                            ...item.config,
                                                            items: findAndRemoveFromGrid([item])
                                                        }
                                                    };
                                                }
                                                return item;
                                            });
                                            
                                            return {
                                                ...section,
                                                config: {
                                                    ...section.config,
                                                    items: updatedItems
                                                }
                                            };
                                        }
                                        return section;
                                    });
                                };
                                
                                const newSections = findAndRemoveFromGrid(homepageSections);
                                await updateHomepageSections(newSections);
                                toast.dismiss(t.id);
                                toast.success("Grid item removed successfully.");
                            } else {
                                await homepageService.deleteHomepageSection(id);
                                const recursivelyFilter = (sections: HomepageSection[]): HomepageSection[] => {
                                    const filtered = sections.filter(s => s.id !== id);
                                    return filtered.map(section => {
                                        if (section.type === 'GRID' && section.config?.items) {
                                            return { 
                                                ...section, 
                                                config: {
                                                    ...section.config,
                                                    items: recursivelyFilter(section.config.items)
                                                }
                                            };
                                        }
                                        return section;
                                    });
                                };
                                
                                const newSections = recursivelyFilter(homepageSections);
                                await updateHomepageSections(newSections);
                                toast.dismiss(t.id);
                                toast.success("Section deleted successfully.");
                            }
                        } catch (error) {
                            console.error('❌ Error deleting section:', error);
                            toast.dismiss(t.id);
                            toast.error("Failed to delete section.");
                        }
                    }}>Delete</Button>
                </div>
            </div>
        ), { duration: Infinity, position: 'top-center' });
    };

    const handleAddSection = async (type: HomepageSectionType) => {
        try {
            setSaving(true);
            const sectionData = homepageService.createSectionTemplate(type);
            
            let newSections;
            if (addingToGridId) {
                const recursivelyAdd = (sections: HomepageSection[]): HomepageSection[] => {
                    return sections.map(section => {
                        if (section.id === addingToGridId && section.type === 'GRID') {
                            const currentItems = getConfigValue(section, 'items', []);
                            const defaultConfig = {
                                ...(type === 'PROMO_GRID' && { promoGridItems: [{ title: 'New Card', subtitle: '', link: '#', bgImage: 'https://placehold.co/600x400' }] }),
                                ...(type === 'KEY_METRICS' && { keyMetrics: [{ icon: '✨', value: '100+', label: 'New Metric' }] }),
                                ...(type === 'TESTIMONIALS' && { testimonialItems: [{ id: `testimonial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, name: 'New Person', location: 'City, Country', avatar: 'https://placehold.co/100x100', text: 'New testimonial text.', rating: 5 }] }),
                                ...(type === 'FEATURE_CARDS' && { featureCards: [{ icon: 'placeholder', title: 'New Feature', description: 'Description for the new feature.' }] }),
                                ...(type === 'IMAGE_GALLERY' && { galleryImages: ['https://placehold.co/400x400'] }),
                                ...(type === 'PROMO_CARDS' && { promoCards: [{ title: 'New Card', subtitle: '', link: '#', bgColor: 'bg-slate-100', textColor: 'text-slate-800' }] }),
                                ...(type === 'TRUST_BADGES' && { trustBadgeItems: [{ id: `trust-badge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, icon: 'shield', title: 'New Badge', color: 'text-green-600' }] }),
                                ...(type === 'FAQ' && { faqItems: [{ question: 'New Question?', answer: 'New answer.' }] }),
                            };
                            
                            const newGridItem = {
                                ...sectionData,
                                id: `grid-item-${Date.now()}`,
                                parentId: addingToGridId,
                                config: {
                                    ...sectionData.config,
                                    ...defaultConfig
                                }
                            };
                            
                            const updatedConfig = {
                                ...section.config,
                                items: [...currentItems, newGridItem]
                            };
                            
                            return { ...section, config: updatedConfig };
                        }
                        if (section.type === 'GRID' && section.config?.items) {
                            return { ...section, config: { ...section.config, items: recursivelyAdd(section.config.items) } };
                        }
                        return section;
                    });
                };
                newSections = recursivelyAdd(homepageSections);
            } else {
                const newSection = await homepageService.createHomepageSection(sectionData);
                newSections = [...homepageSections, newSection];
            }

            await updateHomepageSections(newSections);
            toast.success('Section added successfully!');
            
        } catch (error) {
            console.error('❌ Error adding section:', error);
            toast.error('Failed to add section');
        } finally {
            setAddSectionModalOpen(false);
            setAddingToGridId(null);
            setSaving(false);
        }
    };

    const handleSaveLayout = async () => {
        try {
            setSaving(true);
            await updateHomepageSections(homepageSections);
            toast.success('Homepage layout saved successfully!');
        } catch (error) {
            toast.error('Failed to save layout');
        } finally {
            setSaving(false);
        }
    };

    const getConfigValue = (section: HomepageSection, key: string, defaultValue: any = null) => {
        return section.config?.[key] ?? defaultValue;
    };

    return (
        <div style={{ cursor: dragging ? 'grabbing' : 'default' }}>
            <div className="bg-white p-6 rounded-xl shadow-soft-md">
                <div className="flex justify-between items-center mb-2 border-b pb-2">
                    <div>
                        <h2 className="text-xl font-poppins font-bold text-slate-800">Homepage Layout Manager</h2>
                        <p className="text-sm text-slate-500">Drag to reorder sections. Use the toggle to show or hide a section.</p>
                    </div>
                    <Button 
                        size="sm" 
                        onClick={() => { setAddingToGridId(null); setAddSectionModalOpen(true); }}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Add Section'}
                    </Button>
                </div>
                <div className="space-y-3 mt-4">
                    {homepageSections.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-slate-400 mb-4">No sections configured yet</div>
                            <Button 
                                onClick={() => { setAddingToGridId(null); setAddSectionModalOpen(true); }}
                                disabled={saving}
                            >
                                Create Your First Section
                            </Button>
                        </div>
                    ) : (
                        homepageSections.map((section, index) => (
                            <SectionEditor
                                key={section.id}
                                section={section}
                                index={index}
                                isNested={false}
                                onDragStart={handleDragStart}
                                onDragEnter={handleDragEnter}
                                onDragEnd={handleDragEnd}
                                onSectionChange={handleSectionChange}
                                onConfigChange={handleConfigChange}
                                onDeleteSection={handleDeleteSection}
                                getConfigValue={getConfigValue}
                                categories={categories}
                                brands={brands}
                                loadingData={loadingData}
                                categoryOptions={categoryOptions}
                                buttonVariantOptions={buttonVariantOptions}
                                lucideIcons={LUCIDE_ICONS}
                                onAddToGrid={(gridId) => {
                                    setAddingToGridId(gridId);
                                    setAddSectionModalOpen(true);
                                }}
                            />
                        ))
                    )}
                </div>
                <div className="text-right pt-6 mt-4 border-t">
                    <Button 
                        type="button" 
                        onClick={handleSaveLayout}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Layout'}
                    </Button>
                </div>
            </div>

            {isAddSectionModalOpen && (
                <AddSectionModal 
                    onClose={() => setAddSectionModalOpen(false)}
                    onAddSection={handleAddSection}
                    loading={saving}
                />
            )}
        </div>
    );
};

export default HomepageLayout;