import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { COUNTRIES } from '../utils/countries';

interface CountrySearchProps {
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
}

export function CountrySearch({ selectedCountry, setSelectedCountry }: CountrySearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRIES.filter(c => 
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full md:w-64" ref={wrapperRef}>
      <div 
        className="relative flex items-center w-full bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="absolute left-3 w-5 h-5 text-gray-400" />
        <div className="w-full pl-10 pr-10 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
          {selectedCountry || 'All Locations'}
        </div>
        <ChevronDown className={`absolute right-3 w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <input
              type="text"
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-lg focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all outline-none dark:text-white"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            <button
              className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 ${!selectedCountry ? 'text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30' : 'text-gray-700 dark:text-gray-300'}`}
              onClick={() => {
                setSelectedCountry('');
                setIsOpen(false);
                setSearch('');
              }}
            >
              All Locations
              {!selectedCountry && <Check className="w-4 h-4" />}
            </button>
            <button
              className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedCountry === 'Anywhere' ? 'text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30' : 'text-gray-700 dark:text-gray-300'}`}
              onClick={() => {
                setSelectedCountry('Anywhere');
                setIsOpen(false);
                setSearch('');
              }}
            >
              Anywhere / Worldwide
              {selectedCountry === 'Anywhere' && <Check className="w-4 h-4" />}
            </button>
            {filteredCountries.map(country => (
              <button
                key={country}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedCountry === country ? 'text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30' : 'text-gray-700 dark:text-gray-300'}`}
                onClick={() => {
                  setSelectedCountry(country);
                  setIsOpen(false);
                  setSearch('');
                }}
              >
                {country}
                {selectedCountry === country && <Check className="w-4 h-4" />}
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
