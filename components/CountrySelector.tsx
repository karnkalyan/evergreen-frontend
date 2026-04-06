// components/CountrySelector.tsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { ICONS } from '../constants';

const CountrySelector: React.FC = () => {
  const { country, setCountry, availableCountries, isLoading } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  // Filter to only show Global and current country (or allow all based on your needs)
  const displayCountries = availableCountries.filter(c => 
    c.isGlobal || c.code === country.code
  );

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-white">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span className="hidden lg:inline">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center space-x-2 text-white hover:text-slate-200 transition-colors"
        disabled={displayCountries.length <= 1}
      >
        <span>{country.flag}</span>
        <span className="hidden lg:inline">
          {country.code === 'Global' ? country.name : `${country.currencySymbol} ${country.currency}`}
        </span>
        {displayCountries.length > 1 && (
          <div className="hidden lg:inline">{ICONS.chevronDown}</div>
        )}
      </button>
      
      {isOpen && displayCountries.length > 1 && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-soft-lg p-2 z-50">
          {displayCountries.map(countryOption => (
            <button 
              key={countryOption.code} 
              onClick={() => { 
                setCountry(countryOption); 
                setIsOpen(false); 
              }}
              className={`w-full text-left flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                country.code === countryOption.code 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{countryOption.flag}</span>
              <div className="flex flex-col items-start">
                <span className="font-medium">{countryOption.name}</span>
                {!countryOption.isGlobal && (
                  <span className="text-xs text-slate-500">
                    {countryOption.currencySymbol} {countryOption.currency}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountrySelector;