import { useState, useEffect, Fragment } from 'react';
import { Job, FilterCategory, ExperienceLevel } from '../types';
import { fetchFreelanceJobs, filterJobs } from '../services/api';
import { JobCard } from '../components/JobCard';
import { Filters } from '../components/Filters';
import { GoogleAd } from '../components/GoogleAd';
import { Loader2, AlertCircle, Search, Info } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function Freelance() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [category, setCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('all');
  
  const [announcement, setAnnouncement] = useState('');
  const [announcementVisible, setAnnouncementVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAnnouncement(data.announcement || '');
        setAnnouncementVisible(data.announcementVisible || false);
      }
    }, (err) => {
      console.error("Failed to fetch settings:", err);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      setError(null);
      try {
        const fetchedJobs = await fetchFreelanceJobs();
        setJobs(fetchedJobs);
      } catch (err) {
        setError('Failed to load freelance jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  useEffect(() => {
    const filtered = filterJobs(jobs, searchQuery, selectedCountry, experienceLevel);
    
    // Additional category filtering for freelance since the API doesn't filter by category natively
    let finalFiltered = filtered;
    if (category !== 'all') {
      const catLower = category.toLowerCase();
      finalFiltered = filtered.filter(j => {
        const text = `${j.category} ${j.tags.join(' ')} ${j.title}`.toLowerCase();
        if (catLower === 'customer-support') return text.includes('support') || text.includes('customer') || text.includes('service');
        if (catLower === 'writing') return text.includes('writing') || text.includes('translation') || text.includes('copywriting') || text.includes('editing') || text.includes('content');
        if (catLower === 'data') return text.includes('data') || text.includes('analytics') || text.includes('analyst');
        if (catLower === 'sales') return text.includes('sales') || text.includes('account executive') || text.includes('business development');
        if (catLower === 'hr') return text.includes('hr') || text.includes('human') || text.includes('recruiting') || text.includes('talent');
        if (catLower === 'marketing') return text.includes('marketing') || text.includes('seo') || text.includes('growth');
        return true;
      });
    }

    setFilteredJobs(finalFiltered);
  }, [jobs, searchQuery, selectedCountry, experienceLevel, category]);

  return (
    <>
      <Helmet>
        <title>StarterRemote | Freelance Work</title>
        <meta name="description" content="Find freelance gigs and short-term contracts from top freelancing platforms." />
        <meta name="keywords" content="freelance jobs, gigs, upwork, freelancer, remote work, contract" />
        <meta property="og:title" content="StarterRemote | Freelance Work" />
        <meta property="og:description" content="Find freelance gigs and short-term contracts from top freelancing platforms." />
      </Helmet>

      {announcementVisible && announcement && (
        <div className="bg-indigo-600 text-white px-4 py-3 text-center text-sm font-medium flex items-center justify-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>{announcement}</span>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2 dark:text-white">Freelance Work & Gigs</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Find short-term contracts and freelance opportunities from major platforms like Freelancer.com and Remote OK.
          </p>
        </div>

        <Filters 
          category={category} 
          setCategory={setCategory} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          experienceLevel={experienceLevel}
          setExperienceLevel={setExperienceLevel}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Scouting for freelance gigs...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-6 rounded-2xl flex items-start gap-3 border border-red-100 dark:border-red-900/30">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="font-semibold">Oops! Something went wrong</h3>
              <p className="mt-1 text-red-600 dark:text-red-300">{error}</p>
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No gigs found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              We couldn't find any freelance roles matching your criteria. Try adjusting your search or category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.slice(0, 50).map((job, index) => (
              <Fragment key={job.id}>
                <JobCard job={job} />
                {/* Non-invasive in-feed ad every 8 jobs */}
                {(index + 1) % 8 === 0 && (
                  <div className="col-span-1 md:col-span-2 py-2 flex flex-col items-center justify-center">
                    <span className="mb-2 text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Advertisement</span>
                    <GoogleAd className="min-h-[90px] max-w-[800px]" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
