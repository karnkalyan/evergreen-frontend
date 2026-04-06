import React from 'react';
import { BRANDS } from '../data/mockData';

const ManufacturersPage: React.FC = () => {
  return (
    <div>
      <section className="bg-slate-100 py-16">
        <div className="container mx-auto px-4 text-center" data-aos="fade-down">
          <h1 className="text-5xl font-serif font-bold text-slate-900">Our Trusted Partners</h1>
          <p className="text-xl mt-4 max-w-3xl mx-auto text-slate-600">We partner with leading pharmaceutical brands to bring you genuine and effective healthcare products.</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {BRANDS.map((brand, index) => (
              <div 
                key={brand.id}
                className="bg-white p-8 flex flex-col justify-center items-center rounded-2xl shadow-soft-md hover:shadow-soft-lg transition-shadow border border-slate-100"
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <img src={brand.logo} alt={brand.name} className="h-12 object-contain mb-4" />
                <h3 className="font-semibold text-slate-700 text-center">{brand.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ManufacturersPage;
