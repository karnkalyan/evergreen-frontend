import React from 'react';
import { FeatureCardItem } from '../../types';

const FeatureCards: React.FC<{ items: FeatureCardItem[] }> = ({ items }) => {
    // A mapping from string names to SVG components would go here in a real app
    const getIcon = (name: string) => {
        // Placeholder icon
        return (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-soft-md text-center" data-aos="fade-up" data-aos-delay={index * 100}>
                    <div className="inline-block p-4 bg-primaryEnd/10 text-primaryEnd rounded-full mb-4">
                        {getIcon(item.icon)}
                    </div>
                    <h3 className="text-xl font-poppins font-bold text-slate-800 mb-2">{item.title}</h3>
                    <p className="text-slate-600">{item.description}</p>
                </div>
            ))}
        </div>
    );
};

export default FeatureCards;
