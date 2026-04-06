// pages/Disclaimer.tsx
import React, { useState, useEffect } from 'react';
import { 
  FaExclamationTriangle, FaStethoscope, FaCapsules, 
  FaShieldAlt, FaInfoCircle, FaEnvelope, FaHistory, 
  FaUserMd, FaPhoneAlt, FaLeaf 
} from 'react-icons/fa';
import Button from '../components/shared/Button';
import { publicDisclaimerService, DisclaimerData } from '../lib/disclaimerService';

const DisclaimerPage: React.FC = () => {
  const [disclaimerData, setDisclaimerData] = useState<DisclaimerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDisclaimerData = async () => {
      try {
        setLoading(true);
        const data = await publicDisclaimerService.getDisclaimer();
        setDisclaimerData(data);
      } catch (err) {
        setError('Failed to load Disclaimer');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDisclaimerData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-emerald-800 font-medium animate-pulse">Loading Legal Data...</p>
        </div>
      </div>
    );
  }

  if (error || !disclaimerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-12 bg-white rounded-3xl shadow-2xl max-w-md border border-red-100">
          <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-800">Connection Interrupted</h2>
          <p className="text-slate-500 mt-2 mb-8">{error}</p>
          <Button href="/" variant="primary" className="w-full">Try Again</Button>
        </div>
      </div>
    );
  }

  const validSections = disclaimerData.sections?.filter(section => section.number > 0) || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      
      {/* ================= HEADER SECTION (Asymmetric) ================= */}
      <section className="relative pt-24 pb-40 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-600/10 skew-x-12 transform translate-x-20"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
              <FaShieldAlt className="animate-pulse" /> Legal Safety Framework
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
              Medical <span className="text-emerald-400 underline decoration-emerald-500/30">Disclaimer</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-xl">
              Evergreen Pharma provides pharmaceutical information for educational use. 
              By browsing this site, you acknowledge our liability boundaries.
            </p>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT GRID ================= */}
      <section className="container mx-auto px-6 -mt-24 pb-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Critical Sticky Content */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* STICKY MEDICAL WARNING */}
            <div className="sticky top-24">
              <div className="bg-white rounded-3xl shadow-2xl shadow-emerald-900/10 border border-red-100 overflow-hidden">
                <div className="bg-red-600 p-4 text-white flex items-center justify-between">
                  <span className="font-bold text-sm tracking-tighter flex items-center gap-2">
                    <FaExclamationTriangle /> CRITICAL NOTICE
                  </span>
                  <FaUserMd className="opacity-50" />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 leading-snug">
                    Not a Substitute for Professional Medical Advice
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    All content, including text, graphics, and images, is for general information only. 
                    <span className="text-red-600 font-bold"> Never disregard professional medical advice </span> 
                    because of something you read on this website.
                  </p>
                  <div className="space-y-3">
                    <Button href="tel:911" className="w-full bg-slate-900 text-white rounded-xl py-4 flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
                      <FaPhoneAlt className="text-red-400" /> Emergency: 911
                    </Button>
                    <p className="text-[10px] text-center text-slate-400 uppercase font-bold tracking-widest">Available 24/7 for support</p>
                  </div>
                </div>
              </div>

              {/* METADATA CARD */}
              <div className="mt-6 bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <FaLeaf className="absolute -right-4 -bottom-4 text-8xl text-emerald-800/50 rotate-12" />
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <FaHistory className="text-emerald-400" /> Version Control
                </h4>
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between border-b border-emerald-800 pb-2">
                    <span className="text-emerald-400 text-sm">Effective</span>
                    <span className="font-mono text-sm">{disclaimerData.effectiveDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-400 text-sm">Last Review</span>
                    <span className="font-mono text-sm">{disclaimerData.lastUpdated}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Section Cards (Grid Layout) */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Introduction Card (Wide) */}
              <div className="md:col-span-2 bg-white rounded-3xl p-10 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                    <FaCapsules className="text-xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Scope of Use</h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Evergreen Pharma (<a href="https://evergreenpharma.us" className="text-emerald-600 font-bold hover:underline">evergreenpharma.us</a>) 
                  operates as an informational platform. By engaging with our digital assets, you acknowledge that our content does not constitute 
                  a doctor-patient relationship.
                </p>
              </div>

              {/* Dynamic Mapping into 2-column Grid */}
              {validSections.map((section) => (
                <div 
                  key={section.id}
                  className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-4xl font-black text-slate-100 group-hover:text-emerald-50 transition-colors">
                      {String(section.number).padStart(2, '0')}
                    </span>
                    {section.icon === 'warning' ? (
                      <FaExclamationTriangle className="text-amber-500 text-xl" />
                    ) : (
                      <FaStethoscope className="text-emerald-500 text-xl" />
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">
                    {section.title}
                  </h3>
                  
                  {section.content && (
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                      {section.content}
                    </p>
                  )}

                  {section.items && section.items.length > 0 && (
                    <ul className="space-y-3">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                           {item.description}
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.note && (
                    <div className="mt-6 pt-4 border-t border-slate-50 italic text-[11px] text-slate-400">
                      <strong>Note:</strong> {section.note}
                    </div>
                  )}
                </div>
              ))}

              {/* CONTACT CTA CARD (Wide) */}
              <div className="md:col-span-2 mt-8 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-3xl font-bold mb-2">Need Further Clarity?</h3>
                  <p className="text-emerald-50 opacity-80">Our legal and medical compliance team is here to assist with questions.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <a href="mailto:med@evergreenpharmacy.net" className="px-8 py-4 bg-white text-emerald-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors shadow-lg shadow-emerald-900/20">
                    <FaEnvelope /> Email Support
                  </a>
                  <Button href="/contact" className="px-8 py-4 bg-emerald-800 text-white rounded-2xl font-bold border border-emerald-500/30">
                    Contact Form
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER LINKS ================= */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
            <span className="font-bold text-slate-900">Evergreen Pharma</span>
          </div>
          <div className="flex gap-8 text-sm font-semibold text-slate-500">
            <a href="/terms" className="hover:text-emerald-600 transition-colors">Terms of Service</a>
            <a href="/privacy" className="hover:text-emerald-600 transition-colors">Privacy Policy</a>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-emerald-600">Back to Top</button>
          </div>
          <p className="text-slate-400 text-xs tracking-widest uppercase">© 2026 Legal Division</p>
        </div>
      </footer>
    </div>
  );
};

export default DisclaimerPage;