import React from 'react';
import { Testimonial } from '../../types';
import { ICONS } from '../../constants';

interface TestimonialCardProps {
    testimonial: Testimonial;
    index: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial, index }) => {
    return (
        <div 
            className="bg-white p-8 rounded-2xl shadow-soft-md flex flex-col h-full"
            data-aos="fade-up"
            data-aos-delay={index * 100}
        >
            <div className="text-primaryStart/20 mb-4">{ICONS.quote}</div>
            <p className="text-slate-600 mb-6 flex-grow">"{testimonial.text}"</p>
            <div className="flex items-center">
                <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                <div>
                    <h4 className="font-bold text-slate-800">{testimonial.name}</h4>
                    <p className="text-sm text-slate-500">{testimonial.location}</p>
                </div>
                <div className="ml-auto flex text-amber-500">
                     {[...Array(testimonial.rating)].map((_, i) => <span key={i}>{ICONS.star}</span>)}
                </div>
            </div>
        </div>
    );
};

export default TestimonialCard;
