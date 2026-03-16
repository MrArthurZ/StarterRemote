import { FilterCategory, ExperienceLevel } from '../types';
import { Search, Briefcase } from 'lucide-react';
import { CountrySearch } from './CountrySearch';

interface FiltersProps {
  category: FilterCategory;
  setCategory: (category: FilterCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  experienceLevel: ExperienceLevel;
  setExperienceLevel: (level: ExperienceLevel) => void;
}

export function Filters({ 
  category, setCategory, 
  searchQuery, setSearchQuery, 
  selectedCountry, setSelectedCountry,
  experienceLevel, setExperienceLevel
}: FiltersProps) {
  const categories: { value: FilterCategory; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'customer-support', label: 'Customer Support' },
    { value: 'writing', label: 'Writing & Translation' },
    { value: 'data', label: 'Data Entry' },
    { value: 'sales', label: 'Sales' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'marketing', label: 'Marketing' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 space-y-4 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for 'Spanish', 'Entry Level', 'Assistant'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all outline-none text-sm dark:text-white"
          />
        </div>
        
        <CountrySearch selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} />

        <div className="relative min-w-[160px]">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
            className="w-full pl-10 pr-8 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all outline-none text-sm dark:text-white appearance-none"
          >
            <option value="all">Any Experience</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="flex overflow-x-auto pb-2 md:pb-0 hide-scrollbar gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              category === cat.value
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
