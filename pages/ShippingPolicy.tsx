import React, { useState, useEffect } from 'react';
import { 
  FaTruck, FaGlobe, FaClock, FaMapMarkedAlt, 
  FaBoxOpen, FaExclamationTriangle, FaSearchLocation,
  FaShieldAlt, FaInfoCircle
} from 'react-icons/fa';
import Button from '../components/shared/Button';
import { publicShippingPolicyService, ShippingPolicyData } from '../lib/shippingPolicyService';

const getIcon = (iconName?: string) => {
  switch (iconName) {
    case 'truck': return <FaTruck className="text-emerald-500" />;
    case 'globe': return <FaGlobe className="text-blue-500" />;
    case 'clock': return <FaClock className="text-amber-500" />;
    case 'map': return <FaMapMarkedAlt className="text-emerald-600" />;
    case 'tracking': return <FaSearchLocation className="text-purple-500" />;
    case 'box': return <FaBoxOpen className="text-orange-500" />;
    case 'alert': return <FaExclamationTriangle className="text-red-500" />;
    default: return <FaShieldAlt className="text-emerald-500" />;
  }
};

const ShippingPolicyPage: React.FC = () => {
  const [data, setData] = useState<ShippingPolicyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicShippingPolicyService.getShippingPolicy().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="bg-slate-900 pt-32 pb-32 text-center relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
            <FaTruck className="text-4xl text-emerald-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">Shipping <span className="text-emerald-500">Policy</span></h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">{data?.description}</p>
        </div>
      </section>

      {/* SUMMARY */}
      <section className="py-12 bg-slate-50 border-b border-slate-100">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <FaClock className="text-3xl text-amber-500 mb-4" />
            <h4 className="font-bold">1–3 Days</h4>
            <p className="text-slate-500 text-sm">Standard processing time for most orders.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <FaGlobe className="text-3xl text-blue-500 mb-4" />
            <h4 className="font-bold">Global Shipping</h4>
            <p className="text-slate-500 text-sm">Serving the US and selected international zones.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <FaSearchLocation className="text-3xl text-purple-500 mb-4" />
            <h4 className="font-bold">Full Tracking</h4>
            <p className="text-slate-500 text-sm">Real-time status updates via email and SMS.</p>
          </div>
        </div>
      </section>

      {/* SECTIONS */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-6xl space-y-24">
          {data?.sections.map((section, idx) => (
            <div key={section.id} className={`flex flex-col lg:flex-row gap-12 ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="lg:w-1/3 flex justify-center">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-3xl font-black text-emerald-600 border border-emerald-100">
                  {String(section.number).padStart(2, '0')}
                </div>
              </div>
              <div className="lg:w-2/3">
                <h3 className="text-3xl font-black text-slate-900 mb-2">{section.title}</h3>
                <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-6">{section.subtitle}</p>
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                  {section.content && <p className="text-slate-600 mb-6">{section.content}</p>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.items?.map((item, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 flex gap-3 items-start">
                        <span className="mt-1">{getIcon(item.icon)}</span>
                        <div>
                           {item.title && <div className="font-bold text-xs text-slate-900 mb-1">{item.title}</div>}
                           <div className="text-sm text-slate-600">{Array.isArray(item.description) ? item.description.join(', ') : item.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="bg-slate-50 py-20 border-t">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100">
            <FaInfoCircle className="text-5xl text-emerald-600 mx-auto mb-6" />
            <h2 className="text-3xl font-black mb-4">Tracking Assistance</h2>
            <p className="text-slate-500 mb-8">Need help with a current shipment or international customs?</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <a href="mailto:med@evergreenpharmacy.net" className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold">Email Logistics</a>
               <Button href="/contact" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold">Contact Support</Button>
            </div>
            <div className="mt-8 pt-8 border-t flex justify-center gap-12 text-sm">
               <div><span className="block text-slate-400">Effective</span><b>{data?.effectiveDate}</b></div>
               {/* <div><span className="block text-slate-400">Version</span><b>1.0.4</b></div> */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShippingPolicyPage;