// pages/TermsAndConditions.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  FaGavel, FaShieldAlt, FaExclamationTriangle, FaEnvelope, 
  FaGlobe, FaCheck, FaArrowRight, FaClock, FaHistory, FaLeaf 
} from 'react-icons/fa';
import Button from '../components/shared/Button';
import { publicTermsAndConditionsService, TermsAndConditionsData } from '../lib/termsAndConditionsService';

const TermsAndConditionsPage: React.FC = () => {
  const [termsData, setTermsData] = useState<TermsAndConditionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');
  
  // Refs for scroll spy and smooth scrolling
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const fetchTermsData = async () => {
      try {
        setLoading(true);
        const data = await publicTermsAndConditionsService.getTermsAndConditions();
        setTermsData(data);
        if (data?.sections?.length > 0) {
          setActiveSection(data.sections[0].id);
        }
      } catch (err) {
        setError('Failed to load Terms');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTermsData();
  }, []);

  // Advanced Scroll Spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset

      if (termsData?.sections) {
        for (const section of termsData.sections) {
          const element = sectionRefs.current[section.id];
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              setActiveSection(section.id);
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [termsData]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  // --- Render Helpers ---

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <FaLeaf className="text-emerald-600 text-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !termsData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-10 bg-white rounded-3xl shadow-xl max-w-lg mx-4">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Unable to Load Terms</h2>
          <p className="text-slate-500 mb-8">{error || 'Please check your connection and try again.'}</p>
          <Button href="/" variant="primary" className="w-full">Return Home</Button>
        </div>
      </div>
    );
  }

  const validSections = termsData.sections?.filter(section => section.number > 0) || [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ================= HERO SECTION ================= */}
      <div className="relative bg-slate-900 pb-32 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-600/20 blur-[100px]"></div>
          <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/20 blur-[100px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-20 pb-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 font-medium text-sm mb-6">
              <FaShieldAlt />
              <span>Legal Documentation</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Conditions</span>
            </h1>
            
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Please read these terms carefully. They govern your use of the Evergreen Pharma platform and services to ensure a safe experience for everyone.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-400">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg">
                <FaClock className="text-emerald-500" />
                <span>Effective: <span className="text-slate-200">{termsData.effectiveDate}</span></span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg">
                <FaHistory className="text-blue-500" />
                <span>Updated: <span className="text-slate-200">{termsData.lastUpdated}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT OVERLAP ================= */}
      <div className="container mx-auto px-4 -mt-24 relative z-20 pb-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start max-w-7xl mx-auto">

          {/* === LEFT SIDEBAR (Sticky Navigation) === */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 p-2 overflow-hidden">
              <div className="p-4 border-b border-slate-100 mb-2">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                  <FaGavel className="text-emerald-600" /> Agreement Content
                </h3>
              </div>
              <nav className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar p-2 space-y-1">
                {validSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between group ${
                      activeSection === section.id
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                        activeSection === section.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {section.number}
                      </span>
                      <span className="truncate w-40">{section.title}</span>
                    </span>
                    {activeSection === section.id && <FaArrowRight className="text-xs animate-pulse" />}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* === RIGHT CONTENT (Scrollable) === */}
          <main className="flex-1 min-w-0">
            
            {/* Intro Card */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-full opacity-50"></div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-6 relative z-10">Welcome to Evergreen Pharma</h2>
              <div className="prose prose-slate max-w-none relative z-10">
                <p className="text-lg text-slate-600 leading-relaxed">
                  Welcome to <span className="font-semibold text-emerald-700">Evergreen Pharma</span> (website: <a href="https://evergreenpharma.us" className="text-emerald-600 hover:text-emerald-700 font-medium underline decoration-emerald-200 underline-offset-2">https://evergreenpharma.us</a>). 
                  These Terms and Conditions ("Terms") govern your access to and use of our website, services, and products.
                </p>
                <div className="mt-6 flex gap-4 items-start bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div className="mt-1 text-blue-600"><FaCheck /></div>
                  <p className="text-slate-700 text-sm m-0">
                    By accessing or using this website, you agree to be bound by these Terms. If you do not agree, please do not use this website.
                  </p>
                </div>
              </div>
            </div>

            {/* Sections Wrapper */}
            <div className="space-y-8">
              {validSections.map((section) => (
                <article 
                  key={section.id} 
                  id={section.id} 
                  ref={(el) => (sectionRefs.current[section.id] = el)}
                  className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden scroll-mt-32 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-shadow duration-300"
                >
                  {/* Card Header */}
                  <div className={`px-8 py-6 border-b border-slate-50 flex items-center gap-4 ${
                    section.icon === 'warning' ? 'bg-red-50/30' : 'bg-slate-50/50'
                  }`}>
                     <span className="text-3xl font-black text-slate-200/80 font-serif">
                       {String(section.number).padStart(2, '0')}
                     </span>
                     <div className="flex-1">
                       <h3 className="text-xl md:text-2xl font-bold text-slate-900">{section.title}</h3>
                       {section.subtitle && <p className="text-slate-500 text-sm mt-1">{section.subtitle}</p>}
                     </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-8">
                    {section.content && (
                      <p className="text-slate-600 leading-7 mb-6">{section.content}</p>
                    )}

                    {/* Detailed Items Grid */}
                    {section.items && section.items.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {section.items.map((item, idx) => (
                          <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-100/50">
                            {item.title && (
                              <h4 className="font-bold text-slate-800 mb-2 text-sm">{item.title}</h4>
                            )}
                            {item.description && (
                              <div className="text-slate-500 text-sm leading-relaxed">
                                {Array.isArray(item.description) ? (
                                  <ul className="list-disc list-inside space-y-1">
                                    {item.description.map((desc, dIdx) => (
                                      <li key={dIdx}>{desc}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p>{item.description}</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Alert Box */}
                    {section.note && (
                      <div className={`rounded-xl p-5 flex gap-4 ${
                        section.icon === 'warning' 
                          ? 'bg-red-50 border border-red-100' 
                          : 'bg-amber-50 border border-amber-100'
                      }`}>
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                           section.icon === 'warning' ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-600'
                        }`}>
                          <FaExclamationTriangle className="text-lg" />
                        </div>
                        <div>
                          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                            section.icon === 'warning' ? 'text-red-800' : 'text-amber-800'
                          }`}>
                            Important Note
                          </p>
                          <p className={`text-sm font-medium leading-relaxed ${
                            section.icon === 'warning' ? 'text-red-700' : 'text-amber-700'
                          }`}>
                            {section.note}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* Footer / Contact CTA */}
            <div className="mt-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
               {/* Decorative glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none"></div>

              <h2 className="text-2xl md:text-3xl font-bold mb-4">Questions about these Terms?</h2>
              <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                Our support team is available to clarify any aspect of this agreement.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:med@evergreenpharmacy.net"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                  <FaEnvelope /> Email Support
                </a>
                <a 
                  href="https://evergreenpharma.us/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-bold transition-all border border-white/10"
                >
                  <FaGlobe /> Visit Website
                </a>
              </div>
              
              <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
                <p>&copy; 2026 Evergreen Pharma</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                  <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Back to Top</button>
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;