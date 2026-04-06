import React from 'react';
import { Product } from '../../types';
import ProductCard from '../products/ProductCard';

interface ProductSuggestionProps {
    products: Product[];
}

const ProductSuggestion: React.FC<ProductSuggestionProps> = ({ products }) => {
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div className="my-4">
            <h4 className="text-sm font-semibold text-slate-600 mb-2 pl-2">Based on your symptoms, you might consider these products:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default ProductSuggestion;
