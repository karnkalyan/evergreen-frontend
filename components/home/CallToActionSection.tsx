import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../shared/Button';
import { ButtonVariant } from '../../types';

interface CallToActionProps {
    title: string;
    subtitle: string;
    buttonText: string;
    link: string;
    buttonVariant?: ButtonVariant;
}

const CallToActionSection: React.FC<CallToActionProps> = ({ title, subtitle, buttonText, link, buttonVariant = 'primary' }) => {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-soft-lg text-center" data-aos="fade-up">
            <h2 className="text-3xl font-poppins font-bold text-slate-900 mb-2">{title}</h2>
            {subtitle && (
                <p className="text-slate-600 max-w-xl mx-auto mb-6">
                    {subtitle}
                </p>
            )}
            <Link to={link}>
                <Button size="lg" variant={buttonVariant}>{buttonText}</Button>
            </Link>
        </div>
    );
};

export default CallToActionSection;