// src/components/shared/EmailModal.jsx
import React, { useState, useEffect } from 'react';
import Button from './Button';
import { orderService } from '../../lib/orderService';
import { toast } from 'react-hot-toast';

const EmailModal = ({
  isOpen,
  onClose,
  order,
  onEmailSent,
  loading = false
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [processedPreview, setProcessedPreview] = useState({ subject: '', body: '' });

  // Enhanced quick templates matching your automation service variables
  const quickTemplates = [
    {
      id: 'order_update',
      name: 'Order Status Update',
      subject: 'Update on your order #{order_id}',
      body: `Dear {customer_name},

We wanted to provide an update on your order #{order_id}.

Current Status: {order_status}
Order Date: {order_date}
Total Amount: {order_total}

{if tracking_number}Tracking Number: {tracking_number}{endif}
{if estimated_delivery}Estimated Delivery: {estimated_delivery}{endif}

You can view your order details here: {order_tracking_url}

Thank you for your patience and business!

Best regards,
Customer Service Team
Evergreen Medicine`
    },
    {
      id: 'shipping_update',
      name: 'Shipping Update',
      subject: 'Your order #{order_id} has been shipped!',
      body: `Dear {customer_name},

Great news! Your order #{order_id} has been shipped and is on its way to you.

Shipping Method: {shipping_method}
{if tracking_number}Tracking Number: {tracking_number}{endif}
{if estimated_delivery}Estimated Delivery: {estimated_delivery}{endif}

You can track your package here: {tracking_url}

We're excited for you to receive your items! If you have any questions about your delivery, please don't hesitate to contact us.

Thank you for shopping with us!

Best regards,
Shipping Department
Evergreen Medicine`
    },
    {
      id: 'delivery_confirmation',
      name: 'Delivery Confirmation',
      subject: 'Your order #{order_id} has been delivered',
      body: `Dear {customer_name},

Your order #{order_id} has been successfully delivered.

We hope you're enjoying your purchase! If you have any questions or need assistance with your products, please don't hesitate to reach out to our support team.

Would you like to leave a review about your experience? {review_url}

Your feedback helps us serve you better and assists other customers in making informed decisions.

Thank you for your business!

Best regards,
Customer Service Team
Evergreen Medicine`
    },
    {
      id: 'payment_confirmation',
      name: 'Payment Confirmation',
      subject: 'Payment confirmed for order #{order_id}',
      body: `Dear {customer_name},

We've successfully received your payment for order #{order_id}.

Amount Paid: {order_total}
Payment Method: {payment_method}
{if transaction_id}Transaction ID: {transaction_id}{endif}

You can view your order details and track its progress here: {order_tracking_url}

Thank you for your purchase! We're processing your order and will notify you once it ships.

Best regards,
Billing Department
Evergreen Medicine`
    },
    {
      id: 'order_delay',
      name: 'Order Delay Notification',
      subject: 'Important update about your order #{order_id}',
      body: `Dear {customer_name},

We're writing to inform you about a delay in processing your order #{order_id}.

We understand you're eagerly awaiting your items and apologize for this unexpected delay. Our team is working diligently to resolve the issue and get your order to you as soon as possible.

Current Status: {order_status}
{if estimated_delivery}Revised Estimated Delivery: {estimated_delivery}{endif}

Reason for delay: [Please specify reason - e.g., high order volume, inventory review, quality check, etc.]

We truly value your business and appreciate your understanding. If you have any questions or would like to discuss alternative options, please contact our customer service team at {support_email} or call us at {support_phone}.

You can check the latest status of your order anytime here: {order_tracking_url}

Thank you for your patience and understanding.

Sincerely,
Customer Service Team
Evergreen Medicine`
    },
    {
      id: 'prescription_required',
      name: 'Prescription Required',
      subject: 'Prescription needed for your order #{order_id}',
      body: `Dear {customer_name},

Thank you for your order #{order_id}. We've received your request and noticed that one or more items in your order require a valid prescription.

To proceed with processing your order, we need you to:

1. Upload your prescription through your account dashboard
2. Or email it directly to {support_email}
3. Or fax it to [Fax Number]

Required items in your order:
- [List prescription-required products]

Once we receive and verify your prescription, we'll immediately process your order. Please note that prescription verification may take 24-48 hours during business days.

If you have already submitted your prescription, please disregard this message. If you have any questions about prescription requirements, please contact our pharmacy team at {support_phone}.

View your order: {order_tracking_url}

Thank you for choosing Evergreen Medicine for your healthcare needs.

Best regards,
Pharmacy Team
Evergreen Medicine`
    },
    {
      id: 'backorder_notification',
      name: 'Backorder Notification',
      subject: 'Item Backorder Update for Order #{order_id}',
      body: `Dear {customer_name},

We're contacting you regarding your order #{order_id} because one or more items are currently on backorder.

Current Status: {order_status}
Expected Restock Date: [Please specify date]
New Estimated Ship Date: [Please specify date]

Affected Items:
- [List backordered items]

Your Options:
• Wait for restock (we'll ship when available)
• Partial shipment (ship available items now)
• Substitute with similar products
• Cancel backordered items
• Cancel entire order

Please reply to this email with your preference within 48 hours.

We apologize for this inconvenience and appreciate your understanding.

Sincerely,
Customer Service Team
Evergreen Medicine`
    }
  ];

  // Process template variables exactly like your emailAutomationService
  const processTemplateVariables = (content) => {
    if (!order) return content;

    // Get customer name exactly like your automation service
    const getCustomerName = () => {
      if (order.user?.firstName) {
        return `${order.user.firstName} ${order.user.lastName || ''}`.trim();
      }

      // Try to get from shipping address
      if (order.shippingAddress) {
        try {
          const shippingAddress = typeof order.shippingAddress === 'string'
            ? JSON.parse(order.shippingAddress)
            : order.shippingAddress;
          return shippingAddress.name || 'Customer';
        } catch (error) {
          console.error('Error parsing shipping address:', error);
        }
      }

      return 'Customer';
    };

    // Parse shipping address exactly like your automation service
    const getShippingAddress = () => {
      if (order.shippingAddress) {
        try {
          const shippingAddress = typeof order.shippingAddress === 'string'
            ? JSON.parse(order.shippingAddress)
            : order.shippingAddress;

          return [
            shippingAddress.streetAddress || shippingAddress.street,
            shippingAddress.city,
            shippingAddress.state,
            shippingAddress.zipCode || shippingAddress.postalCode
          ].filter(Boolean).join(', ');
        } catch (error) {
          console.error('Error parsing shipping address:', error);
        }
      }
      return 'Address not available';
    };

    // Get tracking URL
    const getTrackingUrl = () => {
      if (order.trackingNumber) {
        return `${window.location.origin}/account/track-order/${order.trackingNumber}`;
      }
      return `${window.location.origin}/account/orders/${order.id}`;
    };

    // Exact variable mapping matching your emailAutomationService
    const variables = {
      // User variables (exactly like automation service)
      '{customer_name}': getCustomerName(),
      '{customer_first_name}': order.user?.firstName || 'Customer',
      '{customer_email}': order.user?.email || order.contactEmail || 'N/A',
      '{customer_phone}': order.user?.phoneNumber || order.contactPhone || 'N/A',

      // Order variables (exactly like automation service)
      '{order_id}': order.orderNumber || 'N/A',
      '{order_number}': order.orderNumber || 'N/A', // Alias for compatibility
      '{order_date}': order.orderDate ? new Date(order.orderDate).toLocaleDateString() : new Date(order.createdAt).toLocaleDateString(),
      '{order_total}': order.totalAmount ? `$${order.totalAmount.toFixed(2)}` : '$0.00',
      '{order_status}': order.status ? order.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : 'Processing',
      '{payment_status}': order.paymentStatus ? order.paymentStatus.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : 'Pending',
      '{payment_method}': order.paymentMethodCode ? order.paymentMethodCode.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : 'Credit Card',

      // Shipping variables
      '{shipping_address}': getShippingAddress(),
      '{shipping_method}': order.shippingMethod || 'Standard Shipping',
      '{tracking_number}': order.trackingNumber || 'Not available yet',
      '{estimated_delivery}': order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'To be confirmed',

      // Payment variables
      '{transaction_id}': order.payment?.transactionId || 'N/A',
      '{amount_paid}': order.totalAmount ? `$${order.totalAmount.toFixed(2)}` : '$0.00',

      // URL variables (exactly like automation service)
      '{order_tracking_url}': `${window.location.origin}/account/orders/${order.id}`,
      '{tracking_url}': getTrackingUrl(),
      '{review_url}': `${window.location.origin}/account/orders/${order.id}/review`,
      '{website_url}': window.location.origin,
      '{account_url}': `${window.location.origin}/account`,
      '{shop_url}': `${window.location.origin}/shop`,
      '{support_url}': `${window.location.origin}/contact`,

      // Contact variables (exactly like automation service)
      '{support_email}': 'med@evergreenpharma.us',
      '{support_phone}': '+1 (555) 123-4567',

      // Date variables
      '{current_date}': new Date().toLocaleDateString(),
      '{current_year}': new Date().getFullYear().toString(),

      // System variables
      '{site_name}': 'Evergreen Medicine'
    };

    let processedContent = content;

    // First, handle conditional blocks exactly like your automation service
    processedContent = processedContent.replace(/{if ([^}]+)}(.*?){endif}/gs, (match, condition, conditionalContent) => {
      const varName = `{${condition.trim()}}`;
      const variableValue = variables[varName];

      // Show conditional content if variable has a meaningful value (like automation service)
      if (variableValue &&
        variableValue !== 'Not available yet' &&
        variableValue !== 'N/A' &&
        variableValue !== 'To be confirmed' &&
        !variableValue.includes('Not available') &&
        variableValue !== 'Address not available') {
        return conditionalContent;
      }
      return '';
    });

    // Then replace all variables with exact matching
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      processedContent = processedContent.replace(regex, variables[key]);
    });

    // Clean up any remaining conditional tags
    processedContent = processedContent.replace(/{if [^}]+}/g, '');
    processedContent = processedContent.replace(/{endif}/g, '');

    return processedContent;
  };

  useEffect(() => {
    if (isOpen && order) {
      // Load default template
      const defaultTemplate = quickTemplates[0];
      setSelectedTemplate(defaultTemplate.id);
      setSubject(defaultTemplate.subject);
      setBody(defaultTemplate.body);

      // Generate initial preview
      updatePreview(defaultTemplate.subject, defaultTemplate.body);
    }
  }, [isOpen, order]);

  useEffect(() => {
    // Update preview when subject or body changes
    if (subject || body) {
      updatePreview(subject, body);
    }
  }, [subject, body, order]);

  const updatePreview = (subj, bdy) => {
    const processedSubject = processTemplateVariables(subj);
    const processedBody = processTemplateVariables(bdy);
    setProcessedPreview({
      subject: processedSubject,
      body: processedBody
    });
  };

  const handleTemplateChange = (templateId) => {
    const template = quickTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  const handleSendEmail = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Please fill in both subject and body');
      return;
    }

    if (!order?.id) {
      toast.error('Order information is missing');
      return;
    }

    // Check if recipient email exists
    const recipientEmail = order.user?.email || order.contactEmail;
    if (!recipientEmail) {
      toast.error('No email address found for this order');
      return;
    }

    setSending(true);
    try {
      const result = await orderService.sendOrderEmail(order.id, {
        subject: subject.trim(),
        body: body.trim()
      });

      if (result.success) {
        toast.success(`Email sent successfully to ${recipientEmail}!`);
        onEmailSent && onEmailSent({
          subject: subject.trim(),
          body: body.trim(),
          recipient: recipientEmail,
          messageId: result.data?.messageId
        });
        onClose();

        // Reset form
        setSubject('');
        setBody('');
        setSelectedTemplate('');
      } else {
        throw new Error(result.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handlePreview = () => {
    const previewWindow = window.open('', '_blank');
    const previewHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Preview - ${processedPreview.subject}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px;
              background: #f5f5f5;
            }
            .email-container {
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header { 
              background: #2d5016; 
              color: white;
              padding: 30px 20px; 
              text-align: center;
            }
            .content { 
              padding: 30px; 
              background: white;
              white-space: pre-line;
              line-height: 1.8;
              font-size: 14px;
            }
            .footer { 
              margin-top: 20px; 
              padding-top: 20px; 
              border-top: 1px solid #e9ecef; 
              color: #6c757d; 
              font-size: 12px;
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
            }
            .variable-highlight {
              background: #e3f2fd;
              padding: 2px 4px;
              border-radius: 3px;
              border: 1px solid #bbdefb;
              font-family: monospace;
              font-size: 0.9em;
            }
            .note {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 4px;
              padding: 12px;
              margin: 15px 0;
              font-size: 12px;
            }
            .recipient-info {
              background: #e8f5e8;
              padding: 10px 15px;
              border-radius: 4px;
              margin-bottom: 15px;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Evergreen Medicine</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Health & Wellness</p>
            </div>
            
            <div class="content">
              <div class="recipient-info">
                <strong>To:</strong> ${order?.user?.email || order?.contactEmail || 'Customer'}<br>
                <strong>Subject:</strong> ${processedPreview.subject}
              </div>
              
              ${processedPreview.body.replace(/\n/g, '<br>')}
            </div>
            
            <div class="footer">
              <div class="note">
                <p style="margin: 0;">
                  <strong>Preview Note:</strong> This is how the email will appear to the customer.<br>
                  All variables have been replaced with actual order data.
                </p>
              </div>
              <p style="margin: 10px 0 0 0;">
                Evergreen Medicine • support@evergreenmed.com • +1 (555) 123-4567<br>
                <small>This is an automated preview for testing purposes.</small>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    previewWindow.document.write(previewHTML);
    previewWindow.document.close();
  };

  const handleInsertVariable = (variable) => {
    const textarea = document.getElementById('email-body');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newBody = body.substring(0, start) + variable + body.substring(end);
    setBody(newBody);

    // Focus back on textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  // Available variables exactly matching your automation service
  const availableVariables = [
    // User variables
    '{customer_name}',
    '{customer_first_name}',
    '{customer_email}',
    '{customer_phone}',

    // Order variables
    '{order_id}',
    '{order_number}',
    '{order_date}',
    '{order_total}',
    '{order_status}',
    '{payment_status}',
    '{payment_method}',

    // Shipping variables
    '{shipping_address}',
    '{shipping_method}',
    '{tracking_number}',
    '{estimated_delivery}',

    // Payment variables
    '{transaction_id}',
    '{amount_paid}',

    // URL variables
    '{order_tracking_url}',
    '{tracking_url}',
    '{review_url}',
    '{website_url}',
    '{account_url}',
    '{shop_url}',
    '{support_url}',

    // Contact variables
    '{support_email}',
    '{support_phone}',

    // Date variables
    '{current_date}',
    '{current_year}',

    // System variables
    '{site_name}'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Send Email to Customer
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Order #{order?.orderNumber} • {order?.user?.email || order?.contactEmail || 'No email available'}
                {order?.user?.firstName && ` • Customer: ${order.user.firstName} ${order.user.lastName || ''}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-light"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Email Editor */}
          <div className="flex-1 overflow-y-auto p-6 border-r border-gray-200">
            {/* Quick Templates */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Quick Templates
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {quickTemplates.map(template => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateChange(template.id)}
                    className={`p-3 text-left rounded-lg border transition-colors ${selectedTemplate === template.id
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="font-medium text-sm mb-1">{template.name}</div>
                    <div className="text-xs text-gray-500 line-clamp-2">
                      {template.subject.replace(/{order_id}/g, order?.orderNumber || '#ORDER')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div className="mb-6">
              <label htmlFor="email-subject" className="block text-sm font-semibold text-gray-700 mb-2">
                Subject
              </label>
              <input
                id="email-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Email subject..."
              />
            </div>

            {/* Body */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="email-body" className="block text-sm font-semibold text-gray-700">
                  Message Body
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const template = quickTemplates.find(t => t.id === selectedTemplate);
                      if (template) {
                        setSubject(template.subject);
                        setBody(template.body);
                      }
                    }}
                    className="text-sm text-gray-600 hover:text-gray-700 font-medium px-3 py-1 rounded border border-gray-300 hover:border-gray-400"
                  >
                    Reset Template
                  </button>
                  <button
                    type="button"
                    onClick={handlePreview}
                    className="text-sm text-green-600 hover:text-green-700 font-medium px-3 py-1 rounded border border-green-300 hover:border-green-400"
                  >
                    Preview Email
                  </button>
                </div>
              </div>
              <textarea
                id="email-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-mono text-sm"
                placeholder="Write your email message..."
              />
            </div>

            {/* Template Variables Help */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Available Variables</h4>
              <p className="text-sm text-gray-600 mb-3">Click to insert variable at cursor position:</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm mb-3">
                {availableVariables.map(variable => (
                  <button
                    key={variable}
                    type="button"
                    onClick={() => handleInsertVariable(variable)}
                    className="bg-white px-2 py-1 rounded border border-gray-300 hover:border-green-500 hover:bg-green-50 text-xs text-left font-mono transition-colors"
                  >
                    {variable}
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p className="flex items-center gap-1">
                  <span className="font-semibold">Conditional Content:</span>
                  <code className="bg-white px-1 py-0.5 rounded border">{"{if variable}content{endif}"}</code>
                </p>
                <p>• Variables will be automatically replaced with actual order data when sent</p>
                <p>• Conditional content only appears if the variable has a meaningful value</p>
                <p>• Uses same variable processing as automated emails</p>
              </div>
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="w-96 bg-gray-50 p-6 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Live Preview</h3>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-green-800 text-white p-4">
                <div className="text-center">
                  <div className="font-bold text-lg">Evergreen Medicine</div>
                  <div className="text-green-200 text-sm">Health & Wellness</div>
                </div>
              </div>

              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="text-sm">
                  <div><strong>To:</strong> {order?.user?.email || order?.contactEmail || 'Customer'}</div>
                  <div><strong>Subject:</strong> {processedPreview.subject}</div>
                </div>
              </div>

              <div className="p-4 text-sm whitespace-pre-line leading-relaxed">
                {processedPreview.body || 'Preview will appear here...'}
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
                <div className="text-center">
                  Evergreen Medicine • support@evergreenmed.com • +1 (555) 123-4567
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 text-sm mb-2">Preview Information</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• This shows exactly how the email will look</li>
                <li>• All variables are replaced with real data</li>
                <li>• Conditional content is automatically shown/hidden</li>
                <li>• Uses same logic as automated email system</li>
                <li>• Click "Preview Email" for full view</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Recipient: <strong>{order?.user?.email || order?.contactEmail || 'No email address'}</strong>
              {order?.user?.firstName && (
                <span className="ml-4">
                  Customer: <strong>{order.user.firstName} {order.user.lastName || ''}</strong>
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={sending || !subject.trim() || !body.trim() || !(order?.user?.email || order?.contactEmail)}
                loading={sending}
              >
                {sending ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;