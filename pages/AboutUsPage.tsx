// components/AboutUsPage.tsx
import React, { useState, useEffect } from 'react';
// FIX 1: Import the new publicAboutUsService for public facing pages
import { publicAboutUsService, AboutUsData } from '../lib/aboutUsService'; 
// NOTE: We assume AboutUsData is also exported from '../lib/aboutUsService'

const AboutUsPage: React.FC = () => {
  const [aboutUsData, setAboutUsData] = useState<AboutUsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutUsData = async () => {
      try {
        setLoading(true);
        // FIX 2: Call the getAboutUs method from the publicAboutUsService
        const data = await publicAboutUsService.getAboutUs();
        setAboutUsData(data);
      } catch (err) {
        setError('Failed to load About Us content');
        console.error('Error fetching public About Us:', err); // Updated console message
      } finally {
        setLoading(false);
      }
    };

    fetchAboutUsData();
  }, []);

  // --- Loading and Error States ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !aboutUsData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="text-gray-600">{error || 'About Us content not found'}</p>
        </div>
      </div>
    );
  }
  // ---------------------------------

  return (
    <div>
      <section className="bg-primary-gradient text-white py-20">
        <div className="container mx-auto px-4 text-center" data-aos="fade-down">
          <h1 className="text-5xl font-serif font-bold">{aboutUsData.title}</h1>
          {aboutUsData.subtitle && (
            <p className="text-xl mt-4 max-w-3xl mx-auto">{aboutUsData.subtitle}</p>
          )}
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right">
              <h2 className="text-3xl font-poppins font-bold text-slate-900 mb-4">Our Mission</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                {aboutUsData.mission}
              </p>
              {aboutUsData.vision && (
                <>
                  <h3 className="text-2xl font-poppins font-bold text-slate-900 mb-4">Our Vision</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {aboutUsData.vision}
                  </p>
                </>
              )}
            </div>
            <div data-aos="fade-left">
              {aboutUsData.image ? (
                <img 
                  src={aboutUsData.image} 
                  alt="About Evergreen Medicine" 
                  className="rounded-2xl shadow-soft-lg w-full h-auto" 
                />
              ) : (
                <div className="rounded-2xl shadow-soft-lg w-full h-80 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">About Us Image</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {aboutUsData.values && aboutUsData.values.length > 0 && (
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-poppins font-bold text-slate-900 mb-12 text-center" data-aos="fade-up">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {aboutUsData.values.map((value, index) => (
                <div 
                  key={index} 
                  className="bg-white p-6 rounded-2xl shadow-soft-lg text-center" 
                  data-aos="fade-up" 
                  data-aos-delay={index * 100}
                >
                  <h3 className="font-bold text-xl text-slate-800 mb-3">{value.title}</h3>
                  <p className="text-slate-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default AboutUsPage;