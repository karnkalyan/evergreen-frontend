import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ICONS } from '../../constants';

interface Option {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: Option['value'];
  onChange: (value: Option['value']) => void;
  placeholder?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder = 'Select...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => options.find(opt => opt.value === value), [options, value]);

  const filteredOptions = useMemo(() =>
    options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    ), [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSelect = (option: Option) => {
    onChange(option.value);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg flex justify-between items-center text-left"
      >
        <span className={selectedOption ? 'text-slate-800' : 'text-slate-500'}>
            {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
             {React.cloneElement(ICONS.chevronDown, { className: 'w-5 h-5 text-slate-400' })}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-soft-lg border z-10">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className="p-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer"
                >
                  {option.label}
                </li>
              ))
            ) : (
              <li className="p-2 text-sm text-slate-500 text-center">No options found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
