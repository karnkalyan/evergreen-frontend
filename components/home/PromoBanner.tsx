import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../shared/Button';
import { ButtonVariant } from '../../types';

interface PromoBannerProps {
    bgImage: string; // This is now the stethoscope image, not a background
    title: string;
    subtitle: string;
    buttonText: string;
    link: string;
    variant?: ButtonVariant;
}

const PromoBanner: React.FC<PromoBannerProps> = ({ bgImage, title, subtitle, buttonText, link, variant = 'secondary' }) => {
    return (
        <div 
            className="relative rounded-2xl shadow-lg overflow-hidden bg-gradient-to-r from-primaryStart to-primaryEnd"
            data-aos="fade-up"
        >
            <div className="flex justify-between items-center p-8 md:py-4 md:px-12">
                {/* Content on the left */}
                <div className="relative z-10 max-w-md text-white py-4">
                    <h2 className="text-3xl md:text-5xl font-poppins font-bold mb-3">{title}</h2>
                    <p className="text-slate-100 mb-6">{subtitle}</p>
                    <Link to={link}>
                        <Button variant={variant} size="lg">{buttonText}</Button>
                    </Link>
                </div>

                {/* Stethoscope image on the right */}
                <div className="relative hidden md:flex items-center justify-end flex-1 pl-8">
                    <img 
                        src={bgImage} 
                        alt="" // Decorative
                        className="w-auto h-40 lg:h-56 drop-shadow-lg"
                        aria-hidden="true"
                    />
                </div>
            </div>
        </div>
    );
};

export default PromoBanner;