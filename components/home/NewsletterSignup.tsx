import React from 'react';
import Button from '../shared/Button';

const NewsletterSignup: React.FC = () => {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-soft-lg text-center" data-aos="fade-up">
            <h2 className="text-3xl font-poppins font-bold text-slate-900 mb-2">Subscribe to Our Newsletter</h2>
            <p className="text-slate-600 max-w-xl mx-auto mb-6">
                Get the latest updates on new products, upcoming offers, and health tips delivered straight to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row justify-center max-w-md mx-auto gap-3">
                <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="flex-grow p-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-primaryStart focus:border-primaryStart"
                    aria-label="Email Address"
                />
                <Button type="submit" size="lg" className="flex-shrink-0">Subscribe</Button>
            </form>
        </div>
    );
};

export default NewsletterSignup;
