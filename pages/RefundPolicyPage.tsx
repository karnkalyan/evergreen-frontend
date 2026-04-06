// pages/RefundPolicy.tsx
import React, { useState, useEffect } from 'react';
import { 
  FaUndo, FaShieldAlt, FaCheck, FaBan, 
  FaExclamationTriangle, FaCamera, FaClock, 
  FaInfoCircle, FaPrescriptionBottleAlt, 
  FaTruckLoading, FaFileInvoiceDollar, FaTimesCircle 
} from 'react-icons/fa';
import Button from '../components/shared/Button';
import { 
  publicRefundPolicyService, 
  RefundPolicyData 
} from '../lib/refundPolicyService';

// Icon mapping helper to safely render icons from the service data
const getIcon = (iconName?: string) => {
  switch (iconName) {
    case 'check': return <FaCheck className="text-emerald-500" />;
    case 'warning': return <FaExclamationTriangle className="text-amber-500" />;
    case 'camera': return <FaCamera className="text-blue-500" />;
    case 'ban': return <FaBan className="text-red-500" />;
    case 'clock': return <FaClock className="text-purple-500" />;
    case 'info': return <FaInfoCircle className="text-blue-500" />;
    default: return <FaShieldAlt className="text-emerald-500" />;
  }
};

const RefundPolicyPage: React.FC = () => {
  const [policyData, setPolicyData] = useState<RefundPolicyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setLoading(true);
        const data = await publicRefundPolicyService.getRefundPolicy();
        setPolicyData(data);
      } catch (err) {
        console.error('Refund Policy Load Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center bg-white">
      <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-white">
      {/* ================= HERO ================= */}
      <section className="bg-slate-900 pt-32 pb-32 text-center relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
            <FaUndo className="text-4xl text-emerald-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            Refund <span className="text-emerald-500">Protocol</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            {policyData?.description}
          </p>
        </div>
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#10b981_0.5px,transparent_0.5px)] [background-size:24px_24px]"></div>
        </div>
      </section>

      {/* ================= QUICK SUMMARY WIDGETS ================= */}
      <section className="py-12 bg-slate-50 border-b border-slate-100 relative z-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
              <FaPrescriptionBottleAlt className="text-3xl text-red-500 mb-4" />
              <h4 className="font-bold text-slate-900 mb-2">Medicine Safety</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Pharmaceutical products are generally final sale due to health protocols.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
              <FaTruckLoading className="text-3xl text-emerald-600 mb-4" />
              <h4 className="font-bold text-slate-900 mb-2">24h Report Window</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Issues must be reported within 24 hours of delivery for eligibility.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
              <FaFileInvoiceDollar className="text-3xl text-blue-600 mb-4" />
              <h4 className="font-bold text-slate-900 mb-2">7-10 Day Refund</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Approved refunds are processed back to the original payment method.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-32">
            
            {policyData?.sections?.map((section, index) => (
              <div 
                key={section.id} 
                className={`flex flex-col lg:items-start gap-12 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
              >
                {/* Visual Circle Indicator */}
                <div className="lg:w-1/3 flex justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-600 text-4xl font-black">
                      {String(section.number).padStart(2, '0')}
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center">
                       {/* Section-specific logic for indicators */}
                       {section.id === 'cancellation-policy' ? <FaTimesCircle className="text-red-500" /> : <FaShieldAlt className="text-emerald-600" />}
                    </div>
                  </div>
                </div>

                {/* Section Details */}
                <div className="lg:w-2/3">
                  <h3 className="text-3xl font-black text-slate-900 mb-2">{section.title}</h3>
                  {section.subtitle && <p className="text-emerald-600 font-bold uppercase tracking-tighter text-sm mb-6">{section.subtitle}</p>}
                  
                  <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                    {section.content && (
                      <p className="text-slate-600 text-lg leading-relaxed mb-8">
                        {section.content}
                      </p>
                    )}

                    {/* Mapping Items from Service */}
                    {section.items && section.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="mb-6 last:mb-0">
                        {item.title && (
                          <div className="text-slate-900 font-black text-sm uppercase tracking-widest mb-3">
                            {item.title}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Array.isArray(item.description) ? (
                            item.description.map((desc, dIdx) => (
                              <div key={dIdx} className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <span className="mt-1">{getIcon(item.icon)}</span>
                                <span className="text-sm font-medium text-slate-700">{desc}</span>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-2 flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                              <span className="mt-1">{getIcon(item.icon)}</span>
                              <span className="text-sm font-medium text-slate-700">{item.description}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="bg-slate-50 py-20 border-t border-slate-200">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 text-center">
            <FaInfoCircle className="text-5xl text-emerald-600 mx-auto mb-8" />
            <h2 className="text-3xl font-black text-slate-900 mb-4">Questions about your order?</h2>
            <p className="text-slate-500 mb-10 max-w-lg mx-auto">
              Our support team is standing by to help with any concerns regarding delivery or product integrity.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <a href="mailto:med@evergreenpharmacy.net" className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all">
                  Contact Support
               </a>
               <Button href="/contact" className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold">
                  Compliance Form
               </Button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 border-t border-slate-100 pt-8">
               <div className="text-center">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Effective</span>
                  <span className="font-bold text-slate-900">{policyData?.effectiveDate}</span>
               </div>
               <div className="w-px h-8 bg-slate-200"></div>
               <div className="text-center">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Updated</span>
                  <span className="font-bold text-slate-900">{policyData?.lastUpdated}</span>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RefundPolicyPage;