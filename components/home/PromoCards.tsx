// components/home/PromoCards.tsx
import React from 'react';
import { PromoCardItem } from '../../types';
import Button from '../shared/Button';
import { Link } from 'react-router-dom';

interface PromoCardsProps {
    items: PromoCardItem[];
}

const PromoCards: React.FC<PromoCardsProps> = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="promo-cards-container">
            {items.map((item, index) => (
                <div 
                    key={index}
                    className={`promo-small-card ${item.bgColor} ${item.textColor}`}
                    style={{ 
                        backgroundColor: item.bgColor?.startsWith('bg-') ? undefined : item.bgColor,
                        color: item.textColor?.startsWith('text-') ? undefined : item.textColor
                    }}
                >
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    {item.subtitle && (
                        <p className="text-sm opacity-90 mb-4 leading-relaxed">
                            {item.subtitle}
                        </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-auto">
                        {item.buttonText ? (
                            <Button 
                                variant={item.buttonVariant || 'primary'}
                                size="sm"
                                as={Link}
                                to={item.link || '#'}
                            >
                                {item.buttonText}
                            </Button>
                        ) : (
                            <Link 
                                to={item.link || '#'} 
                                className="text-sm font-semibold hover:underline"
                            >
                                {item.linkText || 'Learn More'} →
                            </Link>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PromoCards;