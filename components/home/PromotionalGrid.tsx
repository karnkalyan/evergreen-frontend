import React from 'react';
import { Link } from 'react-router-dom';
import { PromoGridItem } from '../../types';

interface PromotionalGridProps {
    items: PromoGridItem[];
}

const PromoCard: React.FC<PromoGridItem & { className?: string; 'data-aos-delay'?: string }> = ({ bgImage, title, subtitle, link, className = "", ...props }) => (
    <Link 
        to={link}
        className={`relative rounded-2xl shadow-lg overflow-hidden group block ${className}`}
        data-aos="zoom-in"
        {...props}
    >
        <img src={bgImage} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
        <div className="relative h-full flex flex-col justify-end p-6 text-white">
            <h3 className="text-2xl font-poppins font-bold">{title}</h3>
            <p className="opacity-90">{subtitle}</p>
        </div>
    </Link>
);

const PromotionalGrid: React.FC<PromotionalGridProps> = ({ items }) => {
    if (!items || items.length === 0) return null;

    const itemCount = items.length;

    // This component now uses different grid layouts based on the number of items
    // to create more balanced and visually appealing arrangements.
    switch (itemCount) {
        case 1:
            // A single item spans the full width for maximum impact.
            return <PromoCard {...items[0]} className="h-96 md:h-[30rem]" />;
        
        case 2:
            // Two items are displayed side-by-side.
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PromoCard {...items[0]} className="h-96" />
                    <PromoCard {...items[1]} className="h-96" />
                </div>
            );

        case 3: 
            // The original 1-large, 2-small layout is preserved.
            const [large, small1, small2] = items;
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[40rem]">
                    <PromoCard {...large} className="h-full" />
                    <div className="grid grid-rows-2 gap-6 h-full">
                        <PromoCard {...small1} className="h-full" />
                        <PromoCard {...small2} className="h-full" />
                    </div>
                </div>
            );

        case 4: 
            // Four items are arranged in a balanced 2x2 grid.
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {items.map((item, index) => (
                        <PromoCard {...item} key={index} className="h-80" />
                    ))}
                </div>
            );

        case 5: 
            // A creative 2-up, 3-down layout for five items.
            return (
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                    <PromoCard {...items[0]} className="md:col-span-3 h-80" data-aos-delay="0" />
                    <PromoCard {...items[1]} className="md:col-span-3 h-80" data-aos-delay="100" />
                    <PromoCard {...items[2]} className="md:col-span-2 h-80" data-aos-delay="200" />
                    <PromoCard {...items[3]} className="md:col-span-2 h-80" data-aos-delay="300" />
                    <PromoCard {...items[4]} className="md:col-span-2 h-80" data-aos-delay="400" />
                </div>
            );

        default: 
            // A standard 3-column grid for 6 or more items.
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, index) => (
                        <PromoCard {...item} key={index} className="h-80" data-aos-delay={`${(index % 3) * 100}`} />
                    ))}
                </div>
            );
    }
};

export default PromotionalGrid;
