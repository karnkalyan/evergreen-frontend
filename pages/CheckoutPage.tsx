import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { addressService, ApiAddress } from '../lib/addressService';
import { orderService, CreateOrderRequest } from '../lib/orderService';
import { prescriptionService, Prescription } from '../lib/prescriptionService';
import { paymentMethodService, PaymentMethod } from '../lib/paymentMethodService'; // Import the service
import Button from '../components/shared/Button';
import PrescriptionUploader from '../components/checkout/PrescriptionUploader';
import { toast } from 'react-hot-toast';

const currencySymbols: { [key: string]: string } = {
    USD: '$',
    GBP: '£',
    EUR: '€',
    INR: '₹',
    NPR: '₹',
};

// Remove the hardcoded paymentMethods array and mapPaymentMethod function

const CheckoutPage: React.FC = () => {
    const { cartItems, subtotal, discountAmount, itemCount, appliedPromo, clearCart } = useCart();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    
    const [addresses, setAddresses] = useState<ApiAddress[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<ApiAddress | null>(null);
    const [defaultBillingAddress, setDefaultBillingAddress] = useState<ApiAddress | null>(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState<string>(''); // Initialize as empty
    const [placingOrder, setPlacingOrder] = useState(false);
    
    // Payment methods state
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
    
    // Prescription state
    const [userPrescriptions, setUserPrescriptions] = useState<Prescription[]>([]);
    const [selectedPrescriptions, setSelectedPrescriptions] = useState<number[]>([]);
    const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
    
    // Address form state
    const [addressForm, setAddressForm] = useState({
        name: '',
        streetAddress: '',
        city: '',
        state: '',
        zipCode: ''
    });

    // Check prescription requirement
    const requiresPrescription = React.useMemo(() => {
        return cartItems.some(item => {
            return item.product.prescription_required || 
                   (item.productSnapshot && item.productSnapshot.prescriptionRequired);
        });
    }, [cartItems]);

    const currencyCode = cartItems.length > 0 ? cartItems[0].variantDetail.currency : 'USD';
    const currencySymbol = currencySymbols[currencyCode] || '$';

    // Calculate totals (shipping not included - will be confirmed later)
    const finalTotal = subtotal  - discountAmount; // Shipping not included

    // Helper functions for order totals
    const calculateOrderTotals = () => {
        const subtotal = cartItems.reduce((sum, item) => 
            sum + (item.variantDetail.price * item.quantity), 0);
        
        const shippingAmount = 0; // Shipping will be confirmed later
        const discountAmount = appliedPromo ? calculateDiscount(subtotal, appliedPromo) : 0;
        const totalAmount = subtotal  + shippingAmount - discountAmount;

        return {
            subtotal,
            shippingAmount,
            discountAmount,
            totalAmount
        };
    };

    const calculateDiscount = (subtotal: number, promo: any) => {
        if (promo.type === 'PERCENTAGE') {
            const discount = subtotal * (promo.value / 100);
            return promo.maxDiscount ? Math.min(discount, promo.maxDiscount) : discount;
        }
        return Math.min(promo.value, subtotal);
    };

    // Fetch payment methods from backend
    const fetchPaymentMethods = async () => {
        try {
            setLoadingPaymentMethods(true);
            const methods = await paymentMethodService.getPaymentMethods();
            setPaymentMethods(methods);
            
            // Set default payment method
            const defaultMethod = methods.find(method => method.isDefault);
            if (defaultMethod) {
                setSelectedPayment(defaultMethod.code);
            } else if (methods.length > 0) {
                setSelectedPayment(methods[0].code);
            }
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            toast.error('Failed to load payment methods');
        } finally {
            setLoadingPaymentMethods(false);
        }
    };

    useEffect(() => {
        if (cartItems.length > 0) {
            const prescriptionRequiredItems = cartItems.filter(item => 
                item.product.prescription_required
            );
            
            console.log('🩺 Prescription check:', {
                totalItems: cartItems.length,
                prescriptionRequiredItems: prescriptionRequiredItems.length,
                items: prescriptionRequiredItems.map(item => ({
                    product: item.product.name,
                    requiresPrescription: item.product.prescription_required
                }))
            });

            if (prescriptionRequiredItems.length > 0) {
                console.log('📋 Products requiring prescription:', prescriptionRequiredItems);
            }
        }
    }, [cartItems]);

    const loadUserPrescriptions = async () => {
        try {
            setLoadingPrescriptions(true);
            const prescriptions = await prescriptionService.getUserPrescriptions();
            setUserPrescriptions(prescriptions);
        } catch (error) {
            console.error('Error loading prescriptions:', error);
        } finally {
            setLoadingPrescriptions(false);
        }
    };

    // Handle prescription selection
    const handlePrescriptionSelect = (prescriptionId: number) => {
        setSelectedPrescriptions(prev => {
            if (prev.includes(prescriptionId)) {
                return prev.filter(id => id !== prescriptionId);
            } else {
                return [...prev, id];
            }
        });
    };

    // Handle new prescription upload
    const handlePrescriptionUpload = async (file: File) => {
        try {
            const newPrescription = await prescriptionService.uploadPrescription(file);
            setUserPrescriptions(prev => [newPrescription, ...prev]);
            setSelectedPrescriptions(prev => [...prev, newPrescription.id]);
            toast.success('Prescription uploaded successfully');
            return newPrescription;
        } catch (error) {
            console.error('Error uploading prescription:', error);
            toast.error('Failed to upload prescription');
            throw error;
        }
    };

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error('Please login to proceed with checkout');
            navigate('/login', { 
                state: { 
                    from: '/checkout',
                    message: 'Please login to complete your purchase'
                } 
            });
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Load user addresses, prescriptions, and payment methods only if authenticated
    useEffect(() => {
        const loadUserData = async () => {
            if (!isAuthenticated || !user) {
                setLoadingAddresses(false);
                return;
            }

            try {
                setLoadingAddresses(true);
                
                // Load addresses
                const userAddresses = await addressService.getUserAddresses();
                setAddresses(userAddresses);
                
                // Set default billing address
                const defaultAddress = userAddresses.find(addr => addr.isDefault) || 
                                     (userAddresses.length > 0 ? userAddresses[0] : null);
                setDefaultBillingAddress(defaultAddress);
                
                // Set selected shipping address
                setSelectedAddress(defaultAddress);
                
                // Pre-fill address form
                if (defaultAddress) {
                    setAddressForm({
                        name: defaultAddress.name,
                        streetAddress: defaultAddress.streetAddress,
                        city: defaultAddress.city,
                        state: defaultAddress.state,
                        zipCode: defaultAddress.zipCode
                    });
                } else if (user) {
                    setAddressForm(prev => ({
                        ...prev,
                        name: `${user.firstName} ${user.lastName}`.trim()
                    }));
                }

                // Load payment methods
                await fetchPaymentMethods();

                // Load prescriptions if required
                if (requiresPrescription) {
                    await loadUserPrescriptions();
                }
            } catch (error) {
                console.error('Error loading user data:', error);
                toast.error('Failed to load user data');
            } finally {
                setLoadingAddresses(false);
            }
        };

        if (isAuthenticated) {
            loadUserData();
        }
    }, [user, isAuthenticated, requiresPrescription]);

    // Handle address selection
    const handleAddressSelect = (address: ApiAddress) => {
        setSelectedAddress(address);
        setAddressForm({
            name: address.name,
            streetAddress: address.streetAddress,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode
        });
        setShowAddressForm(false);
    };

    // Handle address form changes
    const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddressForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Save new address
    const handleSaveAddress = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to save addresses');
            navigate('/login');
            return;
        }

        if (!addressForm.name || !addressForm.streetAddress || !addressForm.city || !addressForm.state || !addressForm.zipCode) {
            toast.error('Please fill all address fields');
            return;
        }

        try {
            const newAddress = await addressService.createAddress({
                ...addressForm,
                isDefault: addresses.length === 0
            });
            
            setAddresses(prev => [...prev, newAddress]);
            setSelectedAddress(newAddress);
            
            if (addresses.length === 0) {
                setDefaultBillingAddress(newAddress);
            }
            
            setShowAddressForm(false);
            toast.success('Address saved successfully!');
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error('Failed to save address');
        }
    };

    // Validate prescription requirement
    const validatePrescriptionRequirement = (): boolean => {
        if (!requiresPrescription) return true;
        
        if (selectedPrescriptions.length === 0) {
            toast.error('Please upload or select at least one prescription for prescribed products');
            return false;
        }
        
        return true;
    };

    // Get payment method icon based on code
    const getPaymentMethodIcon = (code: string): string => {
        const iconMap: { [key: string]: string } = {
            'CREDIT_CARD': '💳',
            'DEBIT_CARD': '💳',
            'PAYPAL': '🔵',
            'STRIPE': '💳',
            'BANK_TRANSFER': '🏦',
            'CASH_ON_DELIVERY': '💵',
            'GIFT_CARD': '🎁',
            'ZELLE': '💸',
            'VENMO': '💚'
        };
        return iconMap[code] || '💳';
    };

    // Create order function
    const handleCreateOrder = async (): Promise<boolean> => {
        if (!user) {
            toast.error('User not found');
            return false;
        }

        // Validate prescription requirement
        if (!validatePrescriptionRequirement()) {
            return false;
        }

        // Validate payment method
        if (!selectedPayment) {
            toast.error('Please select a payment method');
            return false;
        }

        // Calculate totals using the helper function
        const totals = calculateOrderTotals();

        // Prepare order items with unique product IDs
        const orderItems = cartItems.map(item => ({
            productId: item.product.id,
            variantOptionId: item.variantDetail.id || undefined,
            quantity: item.quantity
        }));

        // Prepare addresses
        const shippingAddress = {
            name: addressForm.name,
            streetAddress: addressForm.streetAddress,
            city: addressForm.city,
            state: addressForm.state,
            zipCode: addressForm.zipCode
        };

        const billingAddress = defaultBillingAddress ? {
            name: defaultBillingAddress.name,
            streetAddress: defaultBillingAddress.streetAddress,
            city: defaultBillingAddress.city,
            state: defaultBillingAddress.state,
            zipCode: defaultBillingAddress.zipCode
        } : shippingAddress;

        const orderData: CreateOrderRequest = {
            // User and basic info
            userId: user.id,
            paymentMethod: selectedPayment, // Use the actual payment method code
            currency: currencyCode,
            
            // Address information
            shippingAddress: shippingAddress,
            billingAddress: billingAddress,
            
            // Contact information
            contactEmail: user.email,
            contactPhone: user.phoneNumber || '',
            
            // Shipping information
            shippingMethod: 'standard', // Default shipping method
            shippingOptionId: undefined,
            
            // Financial information - use calculated totals
            subtotal: totals.subtotal,
            shippingAmount: totals.shippingAmount, // This will be 0 - confirmed later
            discountAmount: totals.discountAmount,
            totalAmount: totals.totalAmount,
            
            // Items and promotions
            items: orderItems,
            couponCode: appliedPromo?.code,
            
            // Prescription information
            prescriptionIds: requiresPrescription && selectedPrescriptions.length > 0 ? selectedPrescriptions : undefined
        };

        try {
            console.log('🛒 Creating order with data:', orderData);
            console.log('📋 Selected prescriptions:', selectedPrescriptions);
            console.log('💰 Selected payment method:', selectedPayment);
            
            const order = await orderService.createOrder(orderData);
            
            console.log('✅ Order created successfully:', order);
            return true;
        } catch (error: any) {
            console.error('❌ Order creation failed:', error);
            
            const errorMessage = error?.response?.data?.error || 
                              error?.error || 
                              error?.message || 
                              'Failed to create order. Please try again.';
            
            toast.error(errorMessage);
            return false;
        }
    };

    const handlePlaceOrder = async () => {
        // Check if user is authenticated
        if (!isAuthenticated) {
            toast.error('Please login to place an order');
            navigate('/login', { 
                state: { 
                    from: '/checkout',
                    message: 'Please login to complete your purchase'
                } 
            });
            return;
        }

        // Validate address
        if (!selectedAddress && !showAddressForm) {
            toast.error('Please select or add a shipping address');
            return;
        }

        if (showAddressForm && (!addressForm.streetAddress || !addressForm.city || !addressForm.state || !addressForm.zipCode)) {
            toast.error('Please complete the address form');
            return;
        }

        // Validate payment method
        if (!selectedPayment) {
            toast.error('Please select a payment method');
            return;
        }

        // Validate prescription requirement
        if (requiresPrescription && selectedPrescriptions.length === 0) {
            toast.error('Please select or upload at least one prescription for prescribed products');
            return;
        }

        setPlacingOrder(true);

        try {
            const loadingToast = toast.loading('Creating your order...');
            const orderCreated = await handleCreateOrder();

            if (orderCreated) {
                toast.success('Order placed successfully!', { id: loadingToast });
                clearCart();
                setTimeout(() => {
                    navigate('/account/orders');
                }, 1000);
            } else {
                toast.error('Failed to place order', { id: loadingToast });
            }
        } catch (error) {
            console.error('Order placement error:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setPlacingOrder(false);
        }
    };

    // Pre-fill user information in address form
    useEffect(() => {
        if (user && !selectedAddress && !showAddressForm) {
            setAddressForm(prev => ({
                ...prev,
                name: `${user.firstName} ${user.lastName}`.trim()
            }));
        }
    }, [user, selectedAddress, showAddressForm]);

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading checkout...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-soft-md max-w-md w-full text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl text-amber-600">🔒</span>
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Authentication Required</h2>
                    <p className="text-slate-600 mb-6">
                        Please login or create an account to proceed with checkout.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button onClick={() => navigate('/login', { state: { from: '/checkout' } })}>
                            Login to Your Account
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/signup', { state: { from: '/checkout' } })}>
                            Create New Account
                        </Button>
                        <Button variant="ghost" onClick={() => navigate('/')}>
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-serif font-bold text-slate-900" data-aos="fade-down">Checkout</h1>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>Logged in as:</span>
                        <span className="font-semibold text-slate-900">
                            {user?.firstName} {user?.lastName}
                        </span>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Panel: Shipping, Prescription, Payment */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-soft-md" data-aos="fade-right">
                        {/* Shipping Address */}
                        <section>
                            <h2 className="text-2xl font-serif font-bold mb-4">1. Shipping Address</h2>
                            
                            {loadingAddresses ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-pulse text-slate-400">Loading addresses...</div>
                                </div>
                            ) : addresses.length > 0 ? (
                                <div className="space-y-4 mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map(address => (
                                            <div 
                                                key={address.id}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                    selectedAddress?.id === address.id 
                                                        ? 'border-blue-500 bg-blue-50' 
                                                        : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                                onClick={() => handleAddressSelect(address)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900">{address.name}</h3>
                                                        <p className="text-sm text-slate-600 mt-1">{address.streetAddress}</p>
                                                        <p className="text-sm text-slate-600">
                                                            {address.city}, {address.state} {address.zipCode}
                                                        </p>
                                                        {address.isDefault && (
                                                            <p className="text-xs text-green-600 mt-1">Default Billing Address</p>
                                                        )}
                                                    </div>
                                                    {address.isDefault && (
                                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setShowAddressForm(true)}
                                        className="w-full"
                                    >
                                        + Add New Address
                                    </Button>
                                </div>
                            ) : (
                                <div className="mb-6">
                                    <p className="text-slate-500 mb-4">No saved addresses found. Please add a shipping address.</p>
                                </div>
                            )}

                            {/* Address Form */}
                            {(showAddressForm || addresses.length === 0) && (
                                <div className="border-t border-slate-200 pt-6">
                                    <h3 className="text-lg font-semibold mb-4">
                                        {addresses.length === 0 ? 'Add Shipping Address' : 'Add New Address'}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <input 
                                            type="text" 
                                            name="name"
                                            placeholder="Address Name (e.g., Home, Office)" 
                                            value={addressForm.name}
                                            onChange={handleAddressFormChange}
                                            className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primaryStart/50 focus:border-primaryStart" 
                                        />
                                        <input 
                                            type="email" 
                                            placeholder="Email Address" 
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full p-3 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 cursor-not-allowed" 
                                        />
                                        <input 
                                            type="text" 
                                            name="streetAddress"
                                            placeholder="Street Address" 
                                            value={addressForm.streetAddress}
                                            onChange={handleAddressFormChange}
                                            className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primaryStart/50 focus:border-primaryStart sm:col-span-2" 
                                        />
                                        <input 
                                            type="text" 
                                            name="city"
                                            placeholder="City" 
                                            value={addressForm.city}
                                            onChange={handleAddressFormChange}
                                            className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primaryStart/50 focus:border-primaryStart" 
                                        />
                                        <input 
                                            type="text" 
                                            name="state"
                                            placeholder="State/Province" 
                                            value={addressForm.state}
                                            onChange={handleAddressFormChange}
                                            className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primaryStart/50 focus:border-primaryStart" 
                                        />
                                        <input 
                                            type="text" 
                                            name="zipCode"
                                            placeholder="ZIP/Postal Code" 
                                            value={addressForm.zipCode}
                                            onChange={handleAddressFormChange}
                                            className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primaryStart/50 focus:border-primaryStart" 
                                        />
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <Button onClick={handleSaveAddress}>
                                            Save Address
                                        </Button>
                                        {addresses.length > 0 && (
                                            <Button 
                                                variant="outline" 
                                                onClick={() => setShowAddressForm(false)}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Billing Address Info */}
                            {defaultBillingAddress && selectedAddress && defaultBillingAddress.id !== selectedAddress.id && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm text-blue-700">
                                        <strong>Note:</strong> Your billing address will be your default address:{" "}
                                        {defaultBillingAddress.name}, {defaultBillingAddress.streetAddress}, {defaultBillingAddress.city}
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* Prescription Upload Section */}
                        {requiresPrescription && (
                            <section className="mt-8 border-t border-slate-200 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-serif font-bold">2. Prescription Required</h2>
                                    {selectedPrescriptions.length > 0 && (
                                        <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                                            {selectedPrescriptions.length} prescription(s) selected
                                        </span>
                                    )}
                                </div>
                                
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-start">
                                        <span className="text-amber-600 text-lg mr-3">⚠️</span>
                                        <div>
                                            <p className="font-semibold text-amber-800">Prescription Required</p>
                                            <p className="text-amber-700 text-sm mt-1">
                                                One or more items in your cart require a valid prescription. 
                                                Please upload a new prescription or select from your existing ones.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <PrescriptionUploader
                                    userPrescriptions={userPrescriptions}
                                    selectedPrescriptions={selectedPrescriptions}
                                    onPrescriptionSelect={handlePrescriptionSelect}
                                    onPrescriptionUpload={handlePrescriptionUpload}
                                    loading={loadingPrescriptions}
                                />
                                
                                {selectedPrescriptions.length === 0 && (
                                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                                        <p className="text-sm text-red-700 text-center">
                                            ❌ Please select or upload at least one prescription to continue with your order.
                                        </p>
                                    </div>
                                )}
                            </section>
                        )}
                        
                        {/* Payment Method */}
                        <section className="mt-8 border-t border-slate-200 pt-6">
                            <h2 className="text-2xl font-serif font-bold mb-4">
                                {requiresPrescription ? '3.' : '2.'} Payment Method
                            </h2>
                            
                            {loadingPaymentMethods ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-pulse text-slate-400">Loading payment methods...</div>
                                </div>
                            ) : paymentMethods.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    No payment methods available. Please contact support.
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {paymentMethods
                                            .filter(method => method.isActive) // Only show active payment methods
                                            .map(method => (
                                            <label 
                                                key={method.id}
                                                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                    selectedPayment === method.code 
                                                        ? 'border-blue-500 bg-blue-50' 
                                                        : 'border-slate-300 hover:border-slate-400'
                                                }`}
                                            >
                                                <input 
                                                    type="radio" 
                                                    name="payment" 
                                                    value={method.code}
                                                    checked={selectedPayment === method.code}
                                                    onChange={(e) => setSelectedPayment(e.target.value)}
                                                    className="h-4 w-4 bg-white border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0" 
                                                />
                                                <span className="ml-3 font-semibold flex items-center">
                                                    <span className="text-xl mr-2">{getPaymentMethodIcon(method.code)}</span>
                                                    {method.name}
                                                    {method.isDefault && (
                                                        <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                                            Default
                                                        </span>
                                                    )}
                                                </span>
                                            </label>
                                        ))}
                                    </div>

                                    {/* Show instructions for selected payment method */}
                                    {selectedPayment && (
                                        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                            {(() => {
                                                const selectedMethod = paymentMethods.find(method => method.code === selectedPayment);
                                                if (!selectedMethod) return null;
                                                
                                                return (
                                                    <>
                                                        <h3 className="font-semibold mb-2">{selectedMethod.name} Details</h3>
                                                        {selectedMethod.description && (
                                                            <p className="text-sm text-slate-600 mb-2">{selectedMethod.description}</p>
                                                        )}
                                                        {selectedMethod.instructions && (
                                                            <p className="text-sm text-slate-700 bg-white p-3 rounded border">
                                                                <strong>Instructions:</strong> {selectedMethod.instructions}
                                                            </p>
                                                        )}
                                                        {selectedMethod.processingFee > 0 && (
                                                            <p className="text-sm text-slate-600 mt-2">
                                                                <strong>Processing Fee:</strong> {selectedMethod.processingFee}%
                                                            </p>
                                                        )}
                                                        {selectedMethod.isQrAvailable && selectedMethod.qrCodeUrl && (
                                                            <div className="mt-3">
                                                                <p className="text-sm font-semibold mb-2">QR Code Available</p>
                                                                <div className="bg-white p-2 rounded border inline-block">
                                                                    <img 
                                                                        src={selectedMethod.qrCodeUrl} 
                                                                        alt={`${selectedMethod.name} QR Code`}
                                                                        className="w-32 h-32 object-contain"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    {/* Payment Details based on selection */}
                                    {selectedPayment === 'CREDIT_CARD' && (
                                        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                            <h3 className="font-semibold mb-3">Card Details</h3>
                                            <div className="grid grid-cols-1 gap-3">
                                                <input 
                                                    type="text" 
                                                    placeholder="Card Number" 
                                                    className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                                />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input 
                                                        type="text" 
                                                        placeholder="MM/YY" 
                                                        className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                                    />
                                                    <input 
                                                        type="text" 
                                                        placeholder="CVV" 
                                                        className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </section>
                    </div>

                    {/* Right Panel: Order Summary */}
                    <div className="lg:col-span-1" data-aos="fade-left">
                        <div className="bg-white p-6 rounded-2xl shadow-soft-md sticky top-40">
                            <h2 className="text-2xl font-serif font-bold mb-4">Order Summary</h2>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 border-b border-slate-200 pb-4 mb-4">
                                {cartItems.map(item => (
                                    <div key={item.product.id + item.variantDetail.label} className="flex justify-between items-start">
                                        <div className="flex-grow pr-2">
                                            <p className="font-semibold text-sm line-clamp-1">{item.product.name} ({item.variantDetail.label})</p>
                                            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                            
                                            {/* Enhanced prescription requirement display */}
                                            {item.product.prescription_required && (
                                                <div className="flex items-center mt-1">
                                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full flex items-center">
                                                        <span className="mr-1">📋</span>
                                                        Prescription Required
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <p className="text-xs text-slate-500">Shipping: {item.variantDetail.shipping}</p>
                                            <p className="text-xs text-slate-500">Currency: {item.variantDetail.currency}</p>
                                        </div>
                                        <p className="font-semibold text-sm whitespace-nowrap">{currencySymbol}{(item.variantDetail.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            {requiresPrescription && selectedPrescriptions.length === 0 && (
                                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                                    <div className="flex items-center">
                                        <span className="text-red-500 text-lg mr-3">⚠️</span>
                                        <div>
                                            <p className="font-semibold text-red-800">Prescription Required</p>
                                            <p className="text-sm text-red-700">
                                                You must upload or select prescriptions for prescription-only products before placing your order.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2 border-b border-slate-200 pb-4 mb-4">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal ({itemCount} items)</span>
                                    <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount ({appliedPromo?.code})</span>
                                        <span>-{currencySymbol}{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-slate-600">
                                    <span>Shipping</span>
                                    <div className="text-sm text-blue-600 text-right">
                                        <div className="font-semibold">To be confirmed</div>
                                        <div className="text-xs mt-1 text-slate-500">
                                            Shipping cost will be confirmed after order placement
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between font-bold text-xl text-slate-900 mb-6">
                                <span>Total Amount</span>
                                <div className="text-right">
                                    <div className="text-xs text-slate-500 mt-1">
                                        *Shipping cost will be confirmed after order placement
                                    </div>
                                </div>
                            </div>

                            <Button 
                                size="lg" 
                                className="w-full" 
                                onClick={handlePlaceOrder} 
                                disabled={cartItems.length === 0 || placingOrder || (requiresPrescription && selectedPrescriptions.length === 0) || !selectedPayment}
                            >
                                {placingOrder ? 'Placing Order...' : 'Place Order'}
                            </Button>

                            {requiresPrescription && selectedPrescriptions.length === 0 && (
                                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                                    <p className="text-sm text-red-700 text-center">
                                        Please select or upload prescriptions to place order
                                    </p>
                                </div>
                            )}

                            {!selectedPayment && (
                                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                                    <p className="text-sm text-red-700 text-center">
                                        Please select a payment method
                                    </p>
                                </div>
                            )}

                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-700 text-center">
                                    💡 Shipping costs will be confirmed via email/mobile within 24 hours after order placement.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;