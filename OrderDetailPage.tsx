import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from './lib/orderService';
import { Order } from './types';
import Button from './components/shared/Button';
import { toast } from 'react-hot-toast';

// Status Components
const OrderStatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
  const getStatusConfig = (status: Order['status']) => {
    const config = {
      pending: { class: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Pending' },
      confirmed: { class: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Confirmed' },
      processing: { class: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Processing' },
      shipped: { class: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Shipped' },
      delivered: { class: 'bg-green-100 text-green-800 border-green-200', label: 'Delivered' },
      cancelled: { class: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled' },
      completed: { class: 'bg-green-100 text-green-800 border-green-200', label: 'Completed' },
      pending_payment: { class: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Pending Payment' }
    };
    return config[status] || config.pending;
  };

  const config = getStatusConfig(status);
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${config.class}`}>
      {config.label}
    </span>
  );
};

const PaymentStatusBadge: React.FC<{ status: Order['paymentStatus'] }> = ({ status }) => {
  const getStatusConfig = (status: Order['paymentStatus']) => {
    const config = {
      pending: { class: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Pending' },
      paid: { class: 'bg-green-100 text-green-800 border-green-200', label: 'Paid' },
      failed: { class: 'bg-red-100 text-red-800 border-red-200', label: 'Failed' },
      refunded: { class: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Refunded' },
      partially_refunded: { class: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Partially Refunded' }
    };
    return config[status] || config.pending;
  };

  const config = getStatusConfig(status);
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${config.class}`}>
      {config.label}
    </span>
  );
};

// Order Item Component
const OrderItem: React.FC<{ item: any; currencySymbol: string }> = ({ item, currencySymbol }) => {
  const getImageUrl = () => {
    if (item.product?.images && item.product.images.length > 0) {
      const firstImage = item.product.images[0];
      return typeof firstImage === 'string' ? firstImage : firstImage.url;
    }
    if (item.productSnapshot?.images && item.productSnapshot.images.length > 0) {
      const firstImage = item.productSnapshot.images[0];
      return typeof firstImage === 'string' ? firstImage : firstImage.url;
    }
    return '/placeholder-image.jpg';
  };

  const getProductName = () => {
    return item.product?.name || item.productName || item.productSnapshot?.name || 'Unknown Product';
  };

  const getVariantLabel = () => {
    return item.variantLabel || item.variantOption?.label || 'Standard';
  };

  const getSku = () => {
    return item.product?.sku || item.productSku || item.productSnapshot?.sku || 'N/A';
  };

  const imageUrl = getImageUrl();
  const productName = getProductName();
  const variantLabel = getVariantLabel();
  const sku = getSku();

  return (
    <div className="flex items-start space-x-4 py-4 border-b border-gray-200 last:border-b-0">
      <img 
        src={imageUrl} 
        alt={productName}
        className="w-16 h-16 object-cover rounded-lg bg-gray-100 flex-shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
        }}
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-lg font-semibold text-gray-900">{productName}</h4>
        <div className="mt-1 space-y-1">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Variant:</span> {variantLabel}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">SKU:</span> {sku}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Qty:</span> {item.quantity}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-semibold text-gray-900">
          {currencySymbol}{((item.unitPrice || 0) * (item.quantity || 0)).toFixed(2)}
        </p>
        <p className="text-sm text-gray-500">
          {currencySymbol}{(item.unitPrice || 0).toFixed(2)} each
        </p>
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
}> = ({ status, trackingNumber, shippingMethod, estimatedDelivery }) => {
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
  paymentMethod?: string; 
  paymentStatus: Order['paymentStatus']; 
  transactionId?: string; 
  paidAt?: string;
}> = ({ paymentMethod, paymentStatus, transactionId, paidAt }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Payment Method:</span>
          <span className="font-semibold text-gray-900 capitalize">
            {paymentMethod?.replace('_', ' ') || 'Not specified'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Payment Status:</span>
          <PaymentStatusBadge status={paymentStatus} />
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
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{currencySymbol}{subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className={shippingAmount === 0 ? "font-semibold text-green-600" : ""}>
            {shippingAmount === 0 ? 'FREE' : `${currencySymbol}${shippingAmount.toFixed(2)}`}
          </span>
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>{currencySymbol}{taxAmount.toFixed(2)}</span>
        </div>
        
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{currencySymbol}{discountAmount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>{currencySymbol}{totalAmount.toFixed(2)}</span>
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

// Main Customer Order Detail Page Component
const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const orderData = await orderService.getOrderById(parseInt(id));
        console.log('📦 Customer Order Data:', orderData);
        setOrder(orderData);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Order Not Found</h1>
          <p className="text-gray-600 mt-4">
            {error || "We couldn't find an order with that ID."}
          </p>
          <Link to="/account/orders" className="mt-8 inline-block">
            <Button>Back to Order History</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currencySymbol = '$'; // Based on your order data
  const subtotal = order.subtotal || order.orderItems?.reduce(
    (acc, item) => acc + ((item.unitPrice || 0) * (item.quantity || 0)), 0
  ) || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <Link 
                  to="/account/orders" 
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ← Back to Orders
                </Link>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Order #{order.orderNumber}
                  </h1>
                  <p className="text-gray-500 mt-1">
                    Placed on {new Date(order.orderDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} at {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <Button 
                variant="outline"
                onClick={() => window.print()}
              >
                Print Invoice
              </Button>
              <div className="flex items-center space-x-2">
                <OrderStatusBadge status={order.status} />
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Items & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
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
          </div>

          {/* Right Column - Summary & Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <OrderSummary
              subtotal={subtotal}
              shippingAmount={order.shippingAmount || 0}
              taxAmount={order.taxAmount || 0}
              discountAmount={order.discountAmount || 0}
              totalAmount={order.totalAmount || 0}
              currencySymbol={currencySymbol}
              couponCode={order.couponCode}
            />

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

            {/* Payment Information */}
            <PaymentInformation
              paymentMethod={order.paymentMethod}
              paymentStatus={order.paymentStatus}
              transactionId={order.payment?.transactionId}
              paidAt={order.paidAt}
            />

            {/* Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Actions</h3>
              <div className="space-y-3">
                <Button className="w-full" variant="primary" onClick={() => window.print()}>
                  📄 Download Invoice
                </Button>
                {order.status === 'delivered' && (
                  <Button className="w-full" variant="outline">
                    ⭐ Write a Review
                  </Button>
                )}
                <Button className="w-full" variant="outline">
                  🔄 Reorder Items
                </Button>
                <Button className="w-full" variant="ghost">
                  💬 Contact Support
                </Button>
              </div>
            </div>

            {/* Customer Support */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-bold text-blue-800 mb-2">Need Help?</h3>
              <p className="text-blue-700 text-sm mb-4">
                Have questions about your order? Our support team is here to help.
              </p>
              <div className="space-y-2 text-sm text-blue-600">
                <p className="flex items-center">
                  <span className="mr-2">📞</span>
                  <strong>Phone:</strong> 1-800-ORDER-NOW
                </p>
                <p className="flex items-center">
                  <span className="mr-2">✉️</span>
                  <strong>Email:</strong> support@yourstore.com
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🕒</span>
                  <strong>Hours:</strong> Mon-Fri, 9AM-6PM EST
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;