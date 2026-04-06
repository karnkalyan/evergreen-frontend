import React, { useState } from 'react';
import { FaqItem } from '../../types';
import { ICONS } from '../../constants';

const AccordionItem: React.FC<{ item: FaqItem; isOpen: boolean; onClick: () => void; }> = ({ item, isOpen, onClick }) => {
    return (
        <div className="border-b">
            <button
                className="w-full flex justify-between items-center text-left py-4"
                onClick={onClick}
                aria-expanded={isOpen}
            >
                <h3 className="font-semibold text-slate-800">{item.question}</h3>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                     {React.cloneElement(ICONS.chevronDown, { className: 'w-5 h-5 text-slate-500' })}
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
            >
                <div className="pb-4 text-slate-600">
                    <p>{item.answer}</p>
                </div>
            </div>
        </div>
    );
};

const FaqSection: React.FC<{ items: FaqItem[] }> = ({ items }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleClick = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="max-w-3xl mx-auto" data-aos="fade-up">
            {items.map((item, index) => (
                <AccordionItem
                    key={index}
                    item={item}
                    isOpen={openIndex === index}
                    onClick={() => handleClick(index)}
                />
            ))}
        </div>
    );
};

export default FaqSection;