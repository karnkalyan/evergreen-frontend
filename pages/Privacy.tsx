// pages/Privacy.tsx
import React, { useState, useEffect } from 'react';
import { 
  FaShieldAlt, 
  FaUserLock, 
  FaCookieBite, 
  FaCheck, 
  FaUserShield, 
  FaFingerprint, 
  FaDatabase, 
  FaHistory, 
  FaListUl, 
  FaMicrochip, 
  FaExclamationTriangle,
  FaInfoCircle // Added this missing import to fix the ReferenceError
} from 'react-icons/fa';
import Button from '../components/shared/Button';
import { 
  publicPrivacyPolicyService, 
  PrivacyPolicyData, 
  CookiePreferences, 
  cookieService
} from '../lib/privacyPolicyService';

const PrivacyPolicyPage: React.FC = () => {
  const [privacyData, setPrivacyData] = useState<PrivacyPolicyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCookieOptions, setShowCookieOptions] = useState(false);
  const [cookieConsent, setCookieConsent] = useState(cookieService.getConsent());

  useEffect(() => {
    const fetchPrivacyData = async () => {
      try {
        setLoading(true);
        const data = await publicPrivacyPolicyService.getPrivacyPolicy();
        setPrivacyData(data);
      } catch (err) {
        console.error('Privacy Framework Offline');
      } finally {
        setLoading(false);
      }
    };
    fetchPrivacyData();
  }, []);

  const handlePreferenceChange = (category: keyof CookiePreferences, value: boolean) => {
    const updated = { ...cookieConsent.preferences, [category]: value };
    const newConsent = cookieService.updateConsent(updated);
    setCookieConsent(newConsent);
  };

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
            <FaUserShield className="text-4xl text-emerald-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            Privacy <span className="text-emerald-500">Protocol</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            {privacyData?.description}
          </p>
        </div>
        <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#10b981_0.5px,transparent_0.5px)] [background-size:24px_24px]"></div>
        </div>
      </section>

      {/* ================= 3 KEY WIDGETS ================= */}
      <section className="py-12 bg-slate-50 border-b border-slate-100 relative z-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
              <FaFingerprint className="text-3xl text-emerald-600 mb-4" />
              <h4 className="font-bold text-slate-900 mb-2">Zero Sale Policy</h4>
              <p className="text-slate-500 text-sm leading-relaxed">We never sell your medical or personal data to third-party brokers.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
              <FaDatabase className="text-3xl text-blue-600 mb-4" />
              <h4 className="font-bold text-slate-900 mb-2">Encrypted Storage</h4>
              <p className="text-slate-500 text-sm leading-relaxed">All sensitive interactions are shielded with AES-256 bit encryption.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
              <FaHistory className="text-3xl text-purple-600 mb-4" />
              <h4 className="font-bold text-slate-900 mb-2">Your Data Rights</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Request access, correction, or total deletion at any time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTENT LAYER ================= */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-32">
            
            {privacyData?.sections?.map((section, index) => (
              <div 
                key={section.id} 
                className={`flex flex-col lg:items-start gap-12 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
              >
                {/* Visual Indicator Area */}
                <div className="lg:w-1/3 flex justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-600 text-4xl font-black">
                      {String(section.number).padStart(2, '0')}
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-emerald-600">
                       {section.id === 'medical-disclaimer' ? <FaExclamationTriangle /> : <FaShieldAlt />}
                    </div>
                  </div>
                </div>

                {/* Text Content Area */}
                <div className="lg:w-2/3">
                  <h3 className="text-3xl font-black text-slate-900 mb-4">{section.title}</h3>
                  {section.subtitle && <p className="text-emerald-600 font-bold uppercase tracking-tighter text-sm mb-6">{section.subtitle}</p>}
                  
                  <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                    {section.content && (
                      <p className="text-slate-600 text-lg leading-relaxed mb-8">
                        {section.content}
                      </p>
                    )}

                    {/* DYNAMIC LISTS MAPPING */}
                    {section.items && section.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="mb-8 last:mb-0">
                        {item.title && (
                          <div className="flex items-center gap-2 mb-4 text-slate-900 font-black uppercase text-xs tracking-widest">
                            {item.title.includes('Personal') ? <FaListUl className="text-emerald-500" /> : <FaMicrochip className="text-blue-500" />}
                            {item.title}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Array.isArray(item.description) ? (
                            item.description.map((desc, descIdx) => (
                              <div key={descIdx} className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <FaCheck className="text-emerald-500 mt-1 flex-shrink-0 text-xs" />
                                <span className="text-sm font-medium text-slate-700">{desc}</span>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-2 bg-white p-4 rounded-2xl border border-slate-100 text-sm font-medium text-slate-700">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* COOKIE MANAGEMENT TOGGLE */}
                    {section.id === 'cookies-tracking' && (
                      <div className="mt-8 flex flex-col gap-4">
                        <div className="p-6 bg-emerald-900 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <FaCookieBite className="text-3xl text-emerald-400" />
                                <p className="text-sm font-medium">Manage your tracking preferences.</p>
                            </div>
                            <Button 
                                onClick={() => setShowCookieOptions(!showCookieOptions)}
                                variant="outline" 
                                className="border-white/30 text-white hover:bg-white/10 px-6 py-2 rounded-xl text-xs uppercase font-bold"
                            >
                                {showCookieOptions ? 'Hide Settings' : 'Adjust Settings'}
                            </Button>
                        </div>
                        {showCookieOptions && (
                          <div className="p-6 bg-white border border-slate-200 rounded-2xl animate-in fade-in duration-300">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-slate-700">Analytics Tracking</span>
                              <button 
                                onClick={() => handlePreferenceChange('analytics', !cookieConsent.preferences.analytics)}
                                className={`w-12 h-6 rounded-full relative transition-colors ${cookieConsent.preferences.analytics ? 'bg-emerald-500' : 'bg-slate-300'}`}
                              >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${cookieConsent.preferences.analytics ? 'right-1' : 'left-1'}`} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {section.note && (
                      <div className="mt-6 flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 text-xs font-bold uppercase italic">
                        <FaInfoCircle /> Note: {section.note}
                      </div>
                    )}
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
            <FaUserLock className="text-5xl text-emerald-600 mx-auto mb-8" />
            <h2 className="text-3xl font-black text-slate-900 mb-4">Dedicated Privacy Support</h2>
            <p className="text-slate-500 mb-10 max-w-lg mx-auto">
              Our Data Protection Officer is available to handle any inquiries regarding your personal information.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <a href="mailto:med@evergreenpharmacy.net" className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all">
                  Contact DPO
               </a>
               <Button >
                                <a href="/contact" className="px-10 py-4 transition-all">
 Compliance Form </a>
               </Button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 border-t border-slate-100 pt-8">
               <div className="text-center">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Effective</span>
                  <span className="font-bold text-slate-900">{privacyData?.effectiveDate}</span>
               </div>
               <div className="w-px h-8 bg-slate-200"></div>
               <div className="text-center">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Review Date</span>
                  <span className="font-bold text-slate-900">{privacyData?.lastUpdated}</span>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;