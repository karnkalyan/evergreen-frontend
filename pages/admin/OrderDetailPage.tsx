import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../lib/orderService';
import { paymentService } from '../../lib/paymentService';
import { prescriptionService } from '../../lib/prescriptionService';
import { Order, CartItem, Currency } from '../../types';
import Button from '../../components/shared/Button';
import SearchableSelect from '../../components/shared/SearchableSelect';
import InvoiceModal from '../../components/shared/InvoiceModal';
import EmailModal from '../../components/shared/EmailModal'; // 🆕 Import EmailModal
import { toast } from 'react-hot-toast';

const getStatusClasses = (status: Order['status']) => {
  switch (status) {
    case 'delivered': 
    case 'completed': 
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'shipped': 
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'processing': 
    case 'confirmed': 
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    case 'cancelled': 
    case 'refunded': 
      return 'bg-red-100 text-red-800 border border-red-200';
    case 'pending': 
    case 'pending_payment': 
      return 'bg-orange-100 text-orange-800 border border-orange-200';
    default: 
      return 'bg-slate-100 text-slate-800 border border-slate-200';
  }
};

const getPaymentStatusClasses = (status: Order['paymentStatus']) => {
  switch (status) {
    case 'paid': 
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'failed': 
      return 'bg-red-100 text-red-800 border border-red-200';
    case 'refunded': 
    case 'partially_refunded': 
      return 'bg-purple-100 text-purple-800 border border-purple-200';
    case 'pending': 
      return 'bg-orange-100 text-orange-800 border border-orange-200';
    default: 
      return 'bg-slate-100 text-slate-800 border border-slate-200';
  }
};

const currencySymbols: { [key: string]: string } = {
  USD: '$',
  GBP: '£',
  EUR: '€',
};

// Shipping carriers
const shippingCarriers = [
  { value: 'dhl', label: 'DHL Express', logo: '🚚' },
  { value: 'ups', label: 'UPS', logo: '📦' },
  { value: 'fedex', label: 'FedEx', logo: '✈️' },
  { value: 'usps', label: 'USPS', logo: '📮' },
  { value: 'custom', label: 'Custom Carrier', logo: '🚛' }
];

// Updated OrderItem component with variant and shipping details
const OrderItem: React.FC<{ 
  item: any, 
  currencySymbol: string 
}> = ({ item, currencySymbol }) => {
  // Get the first image URL - handle both product and productSnapshot
  const getImageUrl = () => {
    // Try product images first
    if (item.product?.images && item.product.images.length > 0) {
      const firstImage = item.product.images[0];
      return typeof firstImage === 'string' ? firstImage : firstImage.url;
    }
    // Then try productSnapshot images
    if (item.productSnapshot?.images && item.productSnapshot.images.length > 0) {
      const firstImage = item.productSnapshot.images[0];
      return typeof firstImage === 'string' ? firstImage : firstImage.url;
    }
    // Fallback to placeholder
    return '/placeholder-image.jpg';
  };

  // Get product name
  const getProductName = () => {
    return item.product?.name || item.productName || item.productSnapshot?.name || 'Unknown Product';
  };

  // Get variant label
  const getVariantLabel = () => {
    return item.variantLabel || item.variantOption?.label || 'Standard';
  };

  // Get variant details including shipping
  const getVariantDetails = () => {
    if (item.variantOption) {
      const variant = item.variantOption;
      const variantShipping = variant.variant;
      const details = [];
      
      // Variant information
      if (variant.label) details.push(`Variant: ${variant.label}`);
      if (variant.price !== undefined) details.push(`Price: ${currencySymbol}${variant.price}`);
      if (variant.mrp !== undefined && variant.mrp !== variant.price) {
        details.push(`MRP: ${currencySymbol}${variant.mrp}`);
      }

      // Shipping information exactly from API
      if (variantShipping) {
        details.push(`Shipping: ${variantShipping.shipping}`);
        details.push(`Country: ${variantShipping.country}`);
        details.push(`Currency: ${variantShipping.currency}`);
      }

      return details;
    }
    return [`Variant: ${getVariantLabel()}`];
  };

  // Get SKU
  const getSku = () => {
    return item.product?.sku || item.productSku || item.productSnapshot?.sku || 'N/A';
  };

  // Check if prescription required
  const isPrescriptionRequired = () => {
    return item.product?.prescription_required || 
           item.productSnapshot?.prescription_required || 
           item.productSnapshot?.prescriptionRequired || 
           false;
  };

  const imageUrl = getImageUrl();
  const productName = getProductName();
  const variantLabel = getVariantLabel();
  const sku = getSku();
  const variantDetails = getVariantDetails();
  const prescriptionRequired = isPrescriptionRequired();

  return (
    <div className="flex items-start space-x-4 py-4 border-b border-gray-200 last:border-b-0">
      <img 
        src={imageUrl} 
        alt={productName}
        className="w-20 h-20 object-cover rounded-lg bg-gray-100 flex-shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
        }}
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-lg font-semibold text-gray-900">{productName}</h4>
        <div className="mt-2 space-y-1">
          <p className="text-sm text-gray-600">
            <span className="font-medium">SKU:</span> {sku}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Quantity:</span> {item.quantity}
          </p>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Product Details:</span>
            <ul className="mt-1 space-y-1">
              {variantDetails.map((detail, index) => (
                <li key={index} className="text-xs bg-gray-50 px-2 py-1 rounded">
                  {detail}
                </li>
              ))}
            </ul>
          </div>
          {prescriptionRequired && (
            <p className="text-xs text-amber-600 mt-1 flex items-center">
              <span className="mr-1">📋</span> Prescription Required
            </p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-semibold text-gray-900">
          {currencySymbol}{((item.unitPrice || 0) * (item.quantity || 0)).toFixed(2)}
        </p>
        <p className="text-sm text-gray-500">
          {currencySymbol}{(item.unitPrice || 0).toFixed(2)} each
        </p>
        {item.variantOption?.mrp && item.variantOption.mrp > item.unitPrice && (
          <p className="text-sm text-green-600 line-through">
            {currencySymbol}{item.variantOption.mrp.toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
};

// Order Timeline Component
const OrderTimeline: React.FC<{ history: any[] }> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h3>
        <p className="text-gray-500 text-sm">No timeline events available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h3>
      <div className="space-y-4">
        {history.slice().reverse().map((event, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${
                event.newStatus === 'delivered' ? 'bg-green-500' :
                event.newStatus === 'shipped' ? 'bg-blue-500' :
                event.newStatus === 'processing' ? 'bg-yellow-500' :
                'bg-gray-500'
              }`}></div>
              {index < history.length - 1 && <div className="w-0.5 h-8 bg-gray-200 mt-1"></div>}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 capitalize">
                {event.newStatus.replace('_', ' ')}
              </p>
              <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(event.createdAt).toLocaleDateString()} at{' '}
                {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Shipping Progress Component
const ShippingProgress: React.FC<{ 
  status: Order['status']; 
  trackingNumber?: string; 
  shippingMethod?: string;
  estimatedDelivery?: string;
  shippingDetails?: any;
}> = ({ status, trackingNumber, shippingMethod, estimatedDelivery, shippingDetails }) => {
  const steps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === status);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Progress</h3>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Current Status: <span className="font-semibold capitalize">{status.replace('_', ' ')}</span></span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {steps.map((step, index) => (
            <span 
              key={step.key} 
              className={`text-center ${index <= currentStepIndex ? 'text-blue-600 font-semibold' : ''}`}
            >
              {step.label}
            </span>
          ))}
        </div>
      </div>

      {/* Shipping Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shippingMethod && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Shipping Method</h4>
            <p className="text-gray-600">{shippingMethod}</p>
            {shippingDetails && (
              <div className="mt-2 text-sm text-gray-500">
                {shippingDetails.description && <p>{shippingDetails.description}</p>}
                {shippingDetails.estimatedDays && (
                  <p>Estimated delivery: {shippingDetails.estimatedDays} days</p>
                )}
              </div>
            )}
          </div>
        )}
        
        {trackingNumber && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Tracking Number</h4>
            <div className="flex items-center space-x-2">
              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{trackingNumber}</code>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(trackingNumber);
                  toast.success('Tracking number copied!');
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Estimated Delivery */}
      {estimatedDelivery && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-amber-500 text-lg mr-2">📅</span>
            <div>
              <div className="font-semibold text-amber-800">Estimated Delivery</div>
              <div className="text-sm text-amber-700">
                {new Date(estimatedDelivery).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {trackingNumber && (
        <div className="mt-4">
          <Button 
            className="w-full"
            onClick={() => window.open(`https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`, '_blank')}
          >
            📦 Track Your Package
          </Button>
        </div>
      )}
    </div>
  );
};

// Address Component
const AddressCard: React.FC<{ 
  title: string; 
  address: any; 
  contactEmail?: string; 
  contactPhone?: string;
  type: 'shipping' | 'billing';
}> = ({ title, address, contactEmail, contactPhone, type }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {typeof address === 'object' ? (
        <div className="space-y-2">
          <p className="font-medium text-gray-900">{address.name}</p>
          <p className="text-gray-600">{address.streetAddress}</p>
          <p className="text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
          {address.country && <p className="text-gray-600">{address.country}</p>}
        </div>
      ) : (
        <p className="text-gray-600">{address || 'Address not provided'}</p>
      )}

      {type === 'shipping' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
          {contactEmail && <p className="text-gray-600">📧 {contactEmail}</p>}
          {contactPhone && <p className="text-gray-600">📞 {contactPhone}</p>}
        </div>
      )}
    </div>
  );
};

// Payment Information Component
const PaymentInformation: React.FC<{ 
  paymentMethodCode?: string; 
  paymentStatus: Order['paymentStatus']; 
  transactionId?: string; 
  paidAt?: string;
  currency: string;
  currencySymbol: string;
  paymentMethodDetails?: any;
}> = ({ paymentMethodCode, paymentStatus, transactionId, paidAt, currency, currencySymbol, paymentMethodDetails }) => {
  const getPaymentMethodName = () => {
    if (paymentMethodDetails) {
      return paymentMethodDetails.name;
    }
    if (paymentMethodCode) {
      return paymentMethodCode.split('_').map(word => 
        word.charAt(0) + word.slice(1).toLowerCase()
      ).join(' ');
    }
    return 'Not specified';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Payment Method:</span>
          <span className="font-semibold text-gray-900">
            {getPaymentMethodName()}
          </span>
        </div>

        {paymentMethodDetails?.description && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">{paymentMethodDetails.description}</p>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Payment Status:</span>
          <PaymentStatusBadge status={paymentStatus} />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Currency:</span>
          <span className="font-semibold text-gray-900">
            {currency} ({currencySymbol})
          </span>
        </div>

        {transactionId && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Transaction ID:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{transactionId}</code>
          </div>
        )}

        {paidAt && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Paid On:</span>
            <span className="font-semibold text-gray-900">
              {new Date(paidAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {paymentStatus === 'paid' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg mt-4">
            <div className="flex items-center">
              <span className="text-green-500 text-lg mr-2">✅</span>
              <span className="text-green-800 font-semibold">Payment Successfully Processed</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Order Summary Component
const OrderSummary: React.FC<{ 
  subtotal: number; 
  shippingAmount: number; 
  taxAmount: number; 
  discountAmount: number; 
  totalAmount: number; 
  currencySymbol: string;
  couponCode?: string;
}> = ({ subtotal, shippingAmount, taxAmount, discountAmount, totalAmount, currencySymbol, couponCode }) => {
  const formatAmount = (amount: number) => {
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatAmount(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className={shippingAmount === 0 ? "font-semibold text-green-600" : ""}>
            {shippingAmount === 0 ? 'FREE' : formatAmount(shippingAmount)}
          </span>
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>{formatAmount(taxAmount)}</span>
        </div>
        
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{formatAmount(discountAmount)}</span>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>{formatAmount(totalAmount)}</span>
          </div>
        </div>

        {couponCode && (
          <div className="text-center text-sm text-gray-500 mt-2">
            Coupon applied: <span className="font-semibold">{couponCode}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Customer Support Component
const CustomerSupport: React.FC<{ companyInfo: any }> = ({ companyInfo }) => {
  const contactInfo = companyInfo?.footerContactInfo || {};
  
  return (
    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
      <h3 className="text-lg font-bold text-blue-800 mb-2">Need Help?</h3>
      <p className="text-blue-700 text-sm mb-4">
        Have questions about your order? Our support team is here to help.
      </p>
      <div className="space-y-2 text-sm text-blue-600">
        {contactInfo.phone && (
          <p className="flex items-center">
            <span className="mr-2">📞</span>
            <strong>Phone:</strong> {contactInfo.phone}
          </p>
        )}
        {contactInfo.email && (
          <p className="flex items-center">
            <span className="mr-2">✉️</span>
            <strong>Email:</strong> {contactInfo.email}
          </p>
        )}
        {contactInfo.address && (
          <p className="flex items-center">
            <span className="mr-2">🏢</span>
            <strong>Address:</strong> {contactInfo.address}
          </p>
        )}
        <p className="flex items-center">
          <span className="mr-2">🕒</span>
          <strong>Hours:</strong> Mon-Fri, 9AM-6PM EST
        </p>
      </div>
    </div>
  );
};

// Payment Status Badge Component
const PaymentStatusBadge: React.FC<{ status: Order['paymentStatus'] }> = ({ status }) => {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getPaymentStatusClasses(status)}`}>
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
};

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false); // 🆕 Email modal state
  const [isEditing, setIsEditing] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false); // 🆕 Email sending state
  
  // Form states for editing
  const [editForm, setEditForm] = useState({
    status: '',
    paymentStatus: '',
    shippingAmount: 0,
    trackingNumber: '',
    shippingMethod: '',
    estimatedDelivery: ''
  });

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const orderData = await orderService.getOrderById(parseInt(id));
        console.log('📦 Admin Order data fetched:', orderData);
        
        setOrder(orderData);
        
        // Initialize edit form with current data
        if (orderData) {
          setEditForm({
            status: orderData.status,
            paymentStatus: orderData.paymentStatus,
            shippingAmount: orderData.shippingAmount || 0,
            trackingNumber: orderData.trackingNumber || '',
            shippingMethod: orderData.shippingMethod || '',
            estimatedDelivery: orderData.estimatedDelivery ? 
              new Date(orderData.estimatedDelivery).toISOString().split('T')[0] : ''
          });
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Handle status updates
  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;

    try {
      await orderService.updateOrderStatus(order.id, {
        status: newStatus,
        notes: `Status updated to ${newStatus}`
      });
      
      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      setEditForm(prev => ({ ...prev, status: newStatus }));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handlePaymentStatusChange = async (newStatus: string) => {
    if (!order) return;

    try {
      const updatedOrder = await orderService.updateOrderPaymentStatus(order.id, newStatus);
      
      setOrder(updatedOrder);
      setEditForm(prev => ({ ...prev, paymentStatus: newStatus }));
      toast.success(`Payment status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const handleShippingUpdate = async () => {
    if (!order) return;

    try {
      const newSubtotal = order.subtotal || order.orderItems?.reduce(
        (acc, item) => acc + ((item.unitPrice || 0) * (item.quantity || 0)), 0
      ) || 0;
      
      const newTotal = newSubtotal + (order.taxAmount || 0) + editForm.shippingAmount - (order.discountAmount || 0);

      const updateData = {
        shippingAmount: editForm.shippingAmount,
        trackingNumber: editForm.trackingNumber,
        shippingMethod: editForm.shippingMethod,
        estimatedDelivery: editForm.estimatedDelivery ? new Date(editForm.estimatedDelivery) : null,
        totalAmount: newTotal
      };

      const updatedOrder = await orderService.updateOrderShipping(order.id, updateData);
      
      setOrder(updatedOrder);
      setIsEditing(false);
      toast.success('Shipping details updated successfully');
    } catch (error) {
      console.error('Error updating shipping details:', error);
      toast.error('Failed to update shipping details');
    }
  };

  // Handle refund
  const handleRefund = async () => {
    if (!order || !order.payment) return;

    try {
      await paymentService.initiateRefund(order.payment.id, {
        refundAmount: order.totalAmount,
        reason: 'Refund requested by admin'
      });
      
      toast.success('Refund processed successfully');
      // Refresh order data
      const updatedOrder = await orderService.getOrderById(order.id);
      setOrder(updatedOrder);
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Failed to process refund');
    }
  };

  // 🆕 Handle sending email
  const handleSendEmail = async (emailData: { subject: string; body: string }) => {
    if (!order) return;

    setSendingEmail(true);
    try {
      await orderService.sendOrderEmail(order.id, emailData);
      toast.success('Email sent successfully!');
      setIsEmailModalOpen(false);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  // 🆕 Handle quick status email
  const handleSendStatusEmail = async () => {
    if (!order) return;

    setSendingEmail(true);
    try {
      await orderService.sendOrderStatusEmail(order.id, order.status, {
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery
      });
      toast.success('Status update email sent successfully!');
    } catch (error) {
      console.error('Error sending status email:', error);
      toast.error('Failed to send status email');
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-serif font-bold text-slate-900">Order Not Found</h1>
          <p className="text-slate-600 mt-4">
            {error || "We couldn't find an order with that ID."}
          </p>
          <Link to="/admin/orders" className="mt-8 inline-block">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currencySymbol = currencySymbols[order.currency] || '$';
  const currency = order.currency || 'USD';
  const subtotal = order.subtotal || order.orderItems?.reduce(
    (acc, item) => acc + ((item.unitPrice || 0) * (item.quantity || 0)), 0
  ) || 0;

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'partially_refunded', label: 'Partially Refunded' },
  ];

  const getCarrierInfo = (method?: string) => {
    if (!method) return shippingCarriers[4]; // Custom carrier
    
    const carrier = shippingCarriers.find(c => 
      method.toLowerCase().includes(c.value) || 
      method.toLowerCase().includes(c.label.toLowerCase())
    );
    return carrier || shippingCarriers[4];
  };

  const carrier = getCarrierInfo(order.shippingMethod);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-slate-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-slate-500 mt-1">
                Placed on {new Date(order.orderDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex flex-col md:items-end gap-2 mt-2 md:mt-0">
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  onClick={() => setIsInvoiceOpen(true)}
                >
                  Print Invoice
                </Button>
                <Button 
                  variant={isEditing ? "danger" : "outline"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel Edit' : 'Edit Order'}
                </Button>
              </div>
              <div className="flex flex-col md:items-end gap-2">
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusClasses(order.status)}`}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getPaymentStatusClasses(order.paymentStatus)}`}>
                  PAYMENT: {order.paymentStatus.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <Link 
            to="/admin/orders" 
            className="text-sm text-primaryEnd font-semibold hover:underline flex items-center"
          >
            ← Back to All Orders
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Items & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                Items in this order ({(order.orderItems || []).length})
              </h2>
              <div className="space-y-4">
                {(order.orderItems || []).map((item, index) => (
                  <OrderItem 
                    key={`${item.productId}-${item.variantOptionId || index}`} 
                    item={item}
                    currencySymbol={currencySymbol}
                  />
                ))}
              </div>
            </div>

            {/* Shipping Progress */}
            <ShippingProgress 
              status={order.status}
              trackingNumber={order.trackingNumber}
              shippingMethod={order.shippingMethod}
              estimatedDelivery={order.estimatedDelivery}
            />

            {/* Order Timeline */}
            <OrderTimeline history={order.orderHistory || []} />

            {/* Admin Controls */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Order Management</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Status Control */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Order Status
                  </label>
                  <SearchableSelect
                    options={statusOptions}
                    value={order.status}
                    onChange={(val) => handleStatusChange(val as string)}
                  />
                </div>

                {/* Payment Status Control */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Payment Status
                  </label>
                  <SearchableSelect
                    options={paymentStatusOptions}
                    value={order.paymentStatus}
                    onChange={(val) => handlePaymentStatusChange(val as string)}
                  />
                </div>
              </div>

              {/* Refund Button */}
              {order.paymentStatus === 'paid' && (
                <div className="mt-4">
                  <Button 
                    variant="danger" 
                    onClick={handleRefund}
                    className="w-full"
                  >
                    Process Full Refund
                  </Button>
                </div>
              )}
            </div>

            {/* Shipping Address */}
            <AddressCard
              title="Shipping Address"
              address={order.shippingAddress}
              contactEmail={order.contactEmail}
              contactPhone={order.contactPhone}
              type="shipping"
            />

            {/* Billing Address */}
            <AddressCard
              title="Billing Address"
              address={order.billingAddress}
              type="billing"
            />
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                
                {/* Editable Shipping Amount */}
                <div className="flex justify-between items-center text-slate-600">
                  <span>Shipping</span>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{currencySymbol}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editForm.shippingAmount}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          shippingAmount: parseFloat(e.target.value) || 0
                        }))}
                        className="w-24 px-2 py-1 border border-slate-300 rounded text-right"
                        placeholder="0.00"
                      />
                    </div>
                  ) : (
                    <span className={order.shippingAmount === 0 ? "font-semibold text-green-600" : ""}>
                      {order.shippingAmount === 0 ? 'FREE' : `${currencySymbol}${order.shippingAmount.toFixed(2)}`}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between text-slate-600">
                  <span>Taxes</span>
                  <span>{currencySymbol}{order.taxAmount.toFixed(2)}</span>
                </div>
                
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{currencySymbol}{order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between font-bold text-lg text-slate-900">
                    <span>Total</span>
                    <span>
                      {currencySymbol}{
                        isEditing 
                          ? (subtotal + order.taxAmount + editForm.shippingAmount - order.discountAmount).toFixed(2)
                          : order.totalAmount.toFixed(2)
                      }
                    </span>
                  </div>
                </div>

                {order.couponCode && (
                  <div className="text-sm text-slate-500 text-center mt-2">
                    Coupon applied: <span className="font-semibold">{order.couponCode}</span>
                  </div>
                )}
              </div>

              {/* Save Shipping Changes */}
              {isEditing && (
                <div className="mt-4 flex gap-2">
                  <Button 
                    onClick={handleShippingUpdate}
                    className="flex-1"
                  >
                    Save Shipping Changes
                  </Button>
                </div>
              )}
            </div>

            {/* Shipping Details */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Shipping Details</h3>
              
              <div className="space-y-4">
                {/* Shipping Carrier */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{carrier.logo}</span>
                    <div>
                      <div className="font-semibold text-slate-800">{carrier.label}</div>
                      {isEditing ? (
                        <select
                          value={editForm.shippingMethod}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            shippingMethod: e.target.value
                          }))}
                          className="mt-1 text-sm border border-slate-300 rounded px-2 py-1"
                        >
                          {shippingCarriers.map(carrier => (
                            <option key={carrier.value} value={carrier.value}>
                              {carrier.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-sm text-slate-500">
                          {order.shippingMethod || 'Standard Shipping'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tracking Information */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-blue-800">Tracking Number</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.trackingNumber}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          trackingNumber: e.target.value
                        }))}
                        className="w-32 px-2 py-1 border border-blue-300 rounded text-sm"
                        placeholder="Enter tracking #"
                      />
                    ) : (
                      <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                        {order.trackingNumber || 'Not assigned'}
                      </span>
                    )}
                  </div>
                  
                  {order.trackingNumber && !isEditing && (
                    <div className="flex space-x-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          window.open(`https://tracking.com/${order.trackingNumber}`, '_blank');
                        }}
                      >
                        Track Package
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(order.trackingNumber!);
                          toast.success('Tracking number copied!');
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  )}
                </div>

                {/* Estimated Delivery */}
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-green-500 text-lg mr-2">📅</span>
                      <div>
                        <div className="font-semibold text-green-800">Estimated Delivery</div>
                        {isEditing ? (
                          <input
                            type="date"
                            value={editForm.estimatedDelivery}
                            onChange={(e) => setEditForm(prev => ({
                              ...prev,
                              estimatedDelivery: e.target.value
                            }))}
                            className="mt-1 text-sm border border-green-300 rounded px-2 py-1"
                          />
                        ) : (
                          <div className="text-sm text-green-700">
                            {order.estimatedDelivery 
                              ? new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              : 'Not set'
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <PaymentInformation
              paymentMethodCode={order.paymentMethodCode}
              paymentStatus={order.paymentStatus}
              transactionId={order.payment?.transactionId}
              paidAt={order.paidAt}
              currency={currency}
              currencySymbol={currencySymbol}
            />

            {/* 🆕 Updated Order Actions with Email */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Order Actions</h3>
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  variant="primary"
                  onClick={() => setIsInvoiceOpen(true)}
                >
                  Download Invoice
                </Button>
                
                {/* 🆕 Send Email Button */}
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setIsEmailModalOpen(true)}
                  disabled={sendingEmail}
                >
                  {sendingEmail ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                      Sending Email...
                    </>
                  ) : (
                    <>
                      ✉️ Send Email to Customer
                    </>
                  )}
                </Button>
                
                {/* 🆕 Quick Status Email */}
                {/* <Button 
                  className="w-full" 
                  variant="ghost"
                  onClick={handleSendStatusEmail}
                  disabled={sendingEmail}
                >
                  📧 Send Status Update
                </Button> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {isInvoiceOpen && (
        <InvoiceModal 
          order={order} 
          onClose={() => setIsInvoiceOpen(false)} 
        />
      )}

      {/* 🆕 Email Modal */}
      {isEmailModalOpen && (
        <EmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          order={order}
          onEmailSent={handleSendEmail}
          loading={sendingEmail}
        />
      )}
    </div>
  );
};

export default OrderDetailPage;