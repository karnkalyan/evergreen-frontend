import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import ProductCard from '../products/ProductCard';

interface ProductCarouselProps {
    title: string;
    products: Product[];
    categorySlug: string;
    bgClass?: string;
}

const SectionTitle: React.FC<{ title: string; link?: string; linkText?: string; }> = ({ title, link, linkText = 'View All' }) => (
    <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl md:text-3xl font-poppins font-bold text-slate-900 relative pb-2">
            {title}
            <span className="absolute bottom-0 left-0 w-20 h-1 bg-primary-gradient rounded-full"></span>
        </h2>
        {link && (
            <Link to={link} className="font-semibold text-primaryEnd hover:underline flex-shrink-0 ml-4">
                {linkText}
            </Link>
        )}
    </div>
);

const ProductCarousel: React.FC<ProductCarouselProps> = ({ title, products, categorySlug, bgClass = 'bg-slate-50' }) => {
    if (products.length === 0) return null;

    return (
        <section className={`py-16 ${bgClass}`}>
            <div className="container mx-auto px-4">
                <SectionTitle title={title} link={`/category/${categorySlug}`} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {products.slice(0, 8).map((product, index) => (
                        <ProductCard key={product.id} product={product} index={6 + index * 2} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProductCarousel;