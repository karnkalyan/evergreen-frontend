import React, { useState, useEffect } from 'react';
import Button from '../components/shared/Button';
import { ICONS } from '../constants';
import { websiteSettingsService } from '../lib/websiteSettingsService';
import { contactRequestService } from '../lib/contactService';
import { WebsiteSettings, ContactRequestFormData } from '../types';

const ContactUsPage: React.FC = () => {
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState<ContactRequestFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  useEffect(() => {
    const fetchWebsiteSettings = async () => {
      try {
        setIsLoading(true);
        const settings = await websiteSettingsService.getWebsiteSettings();
        setWebsiteSettings(settings);
      } catch (error) {
        console.error('Error fetching website settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWebsiteSettings();
  }, []);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear status when user starts typing again
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: '' });
    }
  };

  // Handle phone input with formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Format phone number
    if (value.length <= 3) {
      value = value;
    } else if (value.length <= 6) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length <= 10) {
      value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6)}`;
    } else {
      value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 10)}`;
    }
    
    setFormData(prev => ({
      ...prev,
      phone: value
    }));
    
    // Clear status when user starts typing again
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: '' });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill in all required fields.'
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus({
        type: 'error',
        message: 'Please enter a valid email address.'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await contactRequestService.createContactRequest(formData);
      
      if (response.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Thank you for your message! We will get back to you soon.'
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: response.message || 'Failed to send message. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus({
        type: 'error',
        message: 'An error occurred while sending your message. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get contact info from settings or use defaults
  const contactInfo = websiteSettings?.footerContactInfo || {
    address: '123 Health St, Wellness City, CA 90210, USA',
    email: 'support@evergreenmed.com',
    phone: '+1-555-111111'
  };

  const siteTitle = websiteSettings?.siteTitle || 'Evergreen Pharma';
  const siteDescription = websiteSettings?.siteDescription || 'Your trusted partner for health and wellness. Delivering genuine medicines and healthcare products to your doorstep.';

  if (isLoading) {
    return (
      <div className="bg-white">
        <section className="bg-slate-100 py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-slate-300 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-6 bg-slate-300 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Form Skeleton */}
              <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-soft-lg border border-slate-100">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-slate-300 rounded w-1/3 mb-6"></div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="h-12 bg-slate-200 rounded"></div>
                    <div className="h-12 bg-slate-200 rounded"></div>
                  </div>
                  <div className="h-12 bg-slate-200 rounded"></div>
                  <div className="h-12 bg-slate-200 rounded"></div>
                  <div className="h-40 bg-slate-200 rounded"></div>
                  <div className="h-12 bg-slate-300 rounded w-1/4"></div>
                </div>
              </div>

              {/* Contact Details Skeleton */}
              <div className="space-y-6">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-slate-50 p-6 rounded-2xl animate-pulse">
                    <div className="h-8 bg-slate-300 rounded w-8 mb-2"></div>
                    <div className="h-6 bg-slate-300 rounded w-1/2 mb-1"></div>
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <section className="bg-slate-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-serif font-bold text-slate-900">Get In Touch</h1>
          <p className="text-xl mt-4 max-w-3xl mx-auto text-slate-600">
            {siteDescription}
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          {/* Status Message */}
          {submitStatus.message && (
            <div className={`mb-6 p-4 rounded-lg ${
              submitStatus.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {submitStatus.message}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-soft-lg border border-slate-100">
              <h2 className="text-3xl font-poppins font-bold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    name="name"
                    placeholder="Your Name *" 
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full p-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:ring-primaryStart focus:border-primaryStart disabled:bg-slate-100 disabled:cursor-not-allowed" 
                    required
                  />
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Your Email *" 
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full p-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:ring-primaryStart focus:border-primaryStart disabled:bg-slate-100 disabled:cursor-not-allowed" 
                    required
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    name="phone"
                    placeholder="Phone Number *"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    disabled={isSubmitting}
                    className="w-full p-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:ring-primaryStart focus:border-primaryStart disabled:bg-slate-100 disabled:cursor-not-allowed" 
                    required
                  />
                  <input 
                    type="text" 
                    name="subject"
                    placeholder="Subject *" 
                    value={formData.subject}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full p-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:ring-primaryStart focus:border-primaryStart disabled:bg-slate-100 disabled:cursor-not-allowed" 
                    required
                  />
                </div>
                <textarea 
                  name="message"
                  placeholder="Your Message *" 
                  rows={6} 
                  value={formData.message}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full p-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:ring-primaryStart focus:border-primaryStart disabled:bg-slate-100 disabled:cursor-not-allowed"
                  required
                ></textarea>
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isSubmitting}
                  className="min-w-32"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Details */}
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl">
                <div className="text-primaryEnd mb-2">{ICONS.location}</div>
                <h3 className="font-bold text-lg mb-1">Our Address</h3>
                <p className="text-slate-600">{contactInfo.address}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl">
                <div className="text-primaryEnd mb-2">{ICONS.email}</div>
                <h3 className="font-bold text-lg mb-1">Email Us</h3>
                <p className="text-slate-600 hover:text-primaryEnd transition-colors">
                  <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                </p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl">
                <div className="text-primaryEnd mb-2">{ICONS.phone}</div>
                <h3 className="font-bold text-lg mb-1">Call Us</h3>
                <p className="text-slate-600 hover:text-primaryEnd transition-colors">
                  <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
                </p>
              </div>
              
              {/* Additional Info */}
              <div className="bg-primaryStart bg-opacity-5 p-6 rounded-2xl border border-primaryStart border-opacity-20">
                <h3 className="font-bold text-lg mb-2 text-primaryStart">Response Time</h3>
                <p className="text-slate-600">
                  We typically respond to all inquiries within 24 hours during business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUsPage;