import { PromoCode } from "../types";

export const PROMO_CODES: PromoCode[] = [
    {
        code: 'SAVE20',
        type: 'PERCENTAGE',
        value: 20,
        minAmount: 100,
        description: '20% off on orders over $100'
    },
    {
        code: 'FREESHIP',
        type: 'FIXED_AMOUNT',
        value: 0,
        freeShipping: true,
        minAmount: 50,
        description: 'Free shipping on orders over $50'
    },
    {
        code: 'SAVE15SHIP',
        type: 'PERCENTAGE',
        value: 15,
        freeShipping: true,
        minAmount: 75,
        description: '15% off and free shipping on orders over $75'
    },
    {
        code: 'WELCOME10',
        type: 'PERCENTAGE',
        value: 10,
        description: '10% off your first order'
    }
];
