import React from 'react';
import { KeyMetricItem } from '../../types';

interface KeyMetricsSectionProps {
    items: KeyMetricItem[];
}

const KeyMetricsSection: React.FC<KeyMetricsSectionProps> = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {items.map((item, index) => (
                <div key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                    <div className="text-4xl md:text-5xl font-bold text-primaryEnd mb-2">{item.value}</div>
                    <div className="text-sm md:text-base text-slate-600 font-semibold">{item.label}</div>
                </div>
            ))}
        </div>
    );
};

export default KeyMetricsSection;