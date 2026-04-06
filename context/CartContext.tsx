import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CartItem, Product, ProductVariant, PromoCode, QuantityPriceOption, Country } from '../types';
import { AppContext } from './AppContext';
import { AuthContext } from './AuthContext';
import Button from '../components/shared/Button';
import { cartService } from '../lib/cartService';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number, variantGroup: ProductVariant, selectedOption: QuantityPriceOption) => void;
  removeFromCart: (productId: number, variantDetail: CartItem['variantDetail']) => void;
  updateQuantity: (productId: number, variantDetail: CartItem['variantDetail'], quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (promo: PromoCode) => void;
  removePromoCode: () => void;
  syncCartWithServer: () => Promise<void>;
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  totalPrice: number;
  appliedPromo: PromoCode | null;
  isLoading: boolean;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const appContext = useContext(AppContext);
  const authContext = useContext(AuthContext);
  
  const isAuthenticated = authContext ? authContext.isAuthenticated : false;
  const currentUser = authContext ? authContext.user : null;
  const authIsLoading = authContext ? authContext.isLoading : true;

  // Load cart only when authentication status is fully determined
  useEffect(() => {
    if (authContext && !authIsLoading && !hasInitialized) {
      console.log('🔄 Initial cart load. Authenticated:', isAuthenticated, 'User:', currentUser?.id);
      loadCart();
      setHasInitialized(true);
    }
  }, [authContext, authIsLoading, hasInitialized]);

  // Reload cart when auth state changes
  useEffect(() => {
    if (hasInitialized && authContext && !authIsLoading) {
      console.log('🔄 Auth state changed, reloading cart. Authenticated:', isAuthenticated, 'User ID:', currentUser?.id);
      loadCart();
    }
  }, [isAuthenticated, currentUser?.id, authIsLoading, hasInitialized]);

  // Handle country change with cart clearing
  useEffect(() => {
    if (appContext && cartItems.length > 0) {
      const firstItemCountry = cartItems[0].variantDetail.country;
      if (firstItemCountry !== appContext.country && firstItemCountry !== 'Global') {
        handleCountryChange();
      }
    }
  }, [appContext?.country]);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      
      if (authContext && isAuthenticated && currentUser) {
        console.log('🔄 Loading cart from SERVER for authenticated user:', currentUser.id);
        try {
          const serverCart = await cartService.getCart(currentUser.id);
          console.log('🛒 Server cart loaded:', serverCart);
          
          if (serverCart && serverCart.length > 0) {
            setCartItems(serverCart);
            localStorage.removeItem('guest_cart');
          } else {
            const savedCart = localStorage.getItem('guest_cart');
            if (savedCart) {
              const localCart = JSON.parse(savedCart);
              console.log('📦 Found local cart, syncing to server:', localCart);
              if (localCart.length > 0) {
                await cartService.syncCart(currentUser.id, localCart);
                const syncedCart = await cartService.getCart(currentUser.id);
                setCartItems(syncedCart);
                localStorage.removeItem('guest_cart');
              } else {
                setCartItems([]);
              }
            } else {
              setCartItems([]);
            }
          }
        } catch (serverError) {
          console.error('❌ Server cart load failed:', serverError);
          const savedCart = localStorage.getItem('guest_cart');
          if (savedCart) {
            setCartItems(JSON.parse(savedCart));
          } else {
            setCartItems([]);
          }
        }
      } else {
        console.log('🔄 Loading cart from LOCALSTORAGE for guest');
        const savedCart = localStorage.getItem('guest_cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          console.log('🛒 Local storage cart loaded:', parsedCart);
          setCartItems(parsedCart);
        } else {
          setCartItems([]);
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      const savedCart = localStorage.getItem('guest_cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        setCartItems([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveCart = async (items: CartItem[]) => {
    console.log('💾 Saving cart. Authenticated:', isAuthenticated, 'User ID:', currentUser?.id);
    
    if (authContext && isAuthenticated && currentUser) {
      try {
        console.log('💾 Syncing cart to SERVER for user:', currentUser.id);
        await cartService.syncCart(currentUser.id, items);
        localStorage.removeItem('guest_cart');
      } catch (error) {
        console.error('Error syncing cart to server:', error);
        localStorage.setItem('guest_cart', JSON.stringify(items));
      }
    } else {
      console.log('💾 Saving cart to LOCALSTORAGE for guest');
      localStorage.setItem('guest_cart', JSON.stringify(items));
    }
  };

  const handleCountryChange = () => {
    const previousCountry = cartItems[0]?.variantDetail.country;
    toast(
      (t) => (
        <div className="p-4 bg-white rounded-lg shadow-lg max-w-sm">
          <p className="text-center text-sm text-slate-700 mb-4">
            Changing your country will clear your current cart. Do you want to continue?
          </p>
          <div className="flex justify-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                appContext?.setCountry(previousCountry as Country);
                toast.dismiss(t.id);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                clearCart();
                toast.dismiss(t.id);
              }}
            >
              Continue
            </Button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: 'top-center',
      }
    );
  };

  const subtotal = cartItems.reduce((total, item) => total + item.variantDetail.price * item.quantity, 0);

  const calculateDiscount = (promo: PromoCode | null, currentSubtotal: number) => {
    if (!promo) return 0;
    
    let discount = 0;
    
    if (promo.type === 'PERCENTAGE') {
      discount = currentSubtotal * (promo.value / 100);
      // Apply max discount if specified
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else {
      discount = Math.min(promo.value, currentSubtotal);
    }
    
    return discount;
  };

  useEffect(() => {
    setDiscountAmount(calculateDiscount(appliedPromo, subtotal));
  }, [appliedPromo, subtotal]);

  const shippingCost = (() => {
    if (appliedPromo?.freeShipping) return 0;
    return 0;
  })();

  const totalPrice = subtotal - discountAmount + shippingCost;

  const addToCart = async (product: Product, quantity: number, variantGroup: ProductVariant, selectedOption: QuantityPriceOption) => {
    const newItemDetail: CartItem['variantDetail'] = {
      id: selectedOption.id,
      country: variantGroup.country,
      shipping: variantGroup.shipping,
      currency: variantGroup.currency,
      label: selectedOption.label,
      price: selectedOption.price,
      mrp: selectedOption.mrp,
    };

    if (cartItems.length > 0 && cartItems[0].variantDetail.country !== 'Global' && newItemDetail.country !== cartItems[0].variantDetail.country) {
      toast.error("You can't add items from different countries to the same cart.");
      return;
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => 
        item.product.id === product.id && 
        item.variantDetail.label === newItemDetail.label &&
        item.variantDetail.shipping === newItemDetail.shipping
      );

      let newItems;
      if (existingItem) {
        newItems = prevItems.map(item =>
          (item.product.id === product.id && item.variantDetail.label === newItemDetail.label && item.variantDetail.shipping === newItemDetail.shipping)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...prevItems, { 
          product, 
          quantity, 
          variantDetail: newItemDetail 
        }];
      }

      saveCart(newItems);
      return newItems;
    });

    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = async (productId: number, variantDetail: CartItem['variantDetail']) => {
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => 
        !(item.product.id === productId && item.variantDetail.label === variantDetail.label && item.variantDetail.shipping === variantDetail.shipping)
      );
      saveCart(newItems);
      return newItems;
    });
  };

  const updateQuantity = async (productId: number, variantDetail: CartItem['variantDetail'], quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantDetail);
    } else {
      setCartItems(prevItems => {
        const newItems = prevItems.map(item =>
          (item.product.id === productId && item.variantDetail.label === variantDetail.label && item.variantDetail.shipping === variantDetail.shipping) 
          ? { ...item, quantity } 
          : item
        );
        saveCart(newItems);
        return newItems;
      });
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    setAppliedPromo(null);
    setDiscountAmount(0);
    
    localStorage.removeItem('guest_cart');
    
    if (authContext && isAuthenticated && currentUser) {
      try {
        await cartService.clearCart(currentUser.id);
      } catch (error) {
        console.error('Error clearing server cart:', error);
      }
    }
  };

  const syncCartWithServer = async () => {
    if (authContext && isAuthenticated && currentUser && cartItems.length > 0) {
      try {
        console.log('🔄 Manual cart sync triggered');
        
        const processedCartItems = cartItems.map(item => ({
          ...item,
          variantDetail: {
            ...item.variantDetail,
            id: item.variantDetail.id || undefined
          }
        }));
        
        await saveCart(processedCartItems);
        toast.success('Cart synced successfully!');
      } catch (error) {
        console.error('Error syncing cart with server:', error);
        toast.error('Failed to sync cart with server');
      }
    }
  };

  // Updated applyPromoCode to accept PromoCode object directly
  const applyPromoCode = (promo: PromoCode) => {
    setAppliedPromo(promo);
    // No toast here - let the CartPage handle it
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    // No toast here - let the CartPage handle it
  };

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      syncCartWithServer,
      itemCount, 
      subtotal, 
      shippingCost, 
      discountAmount, 
      totalPrice,
      applyPromoCode, 
      removePromoCode, 
      appliedPromo,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
};