import React from 'react';
import { HomepageSection, HomepageSectionType } from '../../../types';

interface AddSectionModalProps {
    onClose: () => void;
    onAddSection: (type: HomepageSectionType) => void;
}

const sectionOptions: { type: HomepageSectionType, name: string, description: string }[] = [
    { type: 'GRID', name: 'Grid Layout', description: 'A 2, 3, or 4 column container for other sections.' },
    { type: 'FEATURED_PRODUCTS', name: 'Featured Products', description: 'A grid of hand-picked products.' },
    { type: 'CATEGORY_CAROUSEL', name: 'Category Carousel', description: 'Horizontally scrolling product carousel.' },
    // Fix: Changed 'PROMO_GRID_DYNAMIC' to 'PROMO_GRID' to match HomepageSectionType.
    { type: 'PROMO_GRID', name: 'Promotional Grid', description: 'A 1-large, 2-small grid for promotions.' },
    { type: 'PROMO_BANNER', name: 'Promotional Banner', description: 'A single, full-width promotional banner.' },
    { type: 'CALL_TO_ACTION', name: 'Call to Action', description: 'A simple text and button block.' },
    { type: 'KEY_METRICS', name: 'Key Metrics', description: 'Showcase statistics like customer count.' },
    { type: 'BRAND_CAROUSEL', name: 'Brand Carousel', description: 'Showcase brand logos.' },
    { type: 'TESTIMONIALS', name: 'Testimonials', description: 'Display customer feedback.' },
    { type: 'BLOG', name: 'Blog Posts', description: 'Showcase recent articles.' },
    { type: 'IMAGE_GALLERY', name: 'Image Gallery', description: 'A simple grid of images.' },
    { type: 'FEATURE_CARDS', name: 'Feature Cards', description: 'Cards with icons, titles, and text.' },
    { type: 'NEWSLETTER_SIGNUP', name: 'Newsletter Signup', description: 'A form to capture email signups.' },
    { type: 'FAQ', name: 'FAQ', description: 'An accordion-style Q&A section.' },
    { type: 'VIDEO', name: 'Video', description: 'Embed a video from a URL.' },
    { type: 'TRUST_BADGES', name: 'Trust Badges', description: 'Display trust badges for credibility.' },
];

const AddSectionModal: React.FC<AddSectionModalProps> = ({ onClose, onAddSection }) => {

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl"  onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">Add New Section</h2>
                    <p className="text-sm text-slate-500">Choose a component to add to your homepage.</p>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                    {sectionOptions.map(opt => (
                        <button 
                            key={opt.type} 
                            onClick={() => onAddSection(opt.type)}
                            className="text-left p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 hover:border-primaryEnd transition-colors"
                        >
                            <h3 className="font-semibold text-slate-800">{opt.name}</h3>
                            <p className="text-sm text-slate-600">{opt.description}</p>
                        </button>
                    ))}
                </div>
                 <div className="p-4 bg-slate-50 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border rounded-lg hover:bg-slate-100">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddSectionModal;