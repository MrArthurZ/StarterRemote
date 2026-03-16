import { Job } from '../types';
import { MapPin, Briefcase, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { Key } from 'react';

interface JobCardProps {
  job: Job;
  key?: Key;
}

function sanitizeUrl(url: string) {
  if (!url) return '#';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch (e) {
    // Invalid URL
  }
  return '#';
}

export function JobCard({ job }: JobCardProps) {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(job.publication_date));

  const safeUrl = sanitizeUrl(job.url);

  return (
    <motion.a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="group block bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-500/50 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {job.company_logo && sanitizeUrl(job.company_logo) !== '#' ? (
            <img 
              src={sanitizeUrl(job.company_logo)} 
              alt={`${job.company_name} logo`} 
              className="w-12 h-12 rounded-lg object-contain bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-1"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl border border-indigo-100 dark:border-indigo-800/50">
              {job.company_name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{job.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{job.company_name}</p>
          </div>
        </div>
        <ExternalLink className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
          <span className="truncate">{job.candidate_required_location || 'Anywhere'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
          <span className="truncate capitalize">
            {typeof job.job_type === 'string' ? job.job_type.replace(/_/g, ' ') : 'Full-time'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
          <span className="truncate">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
          <span className="truncate">{job.salary || 'Not specified'}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full capitalize">
          {typeof job.category === 'string' ? job.category.replace(/-/g, ' ') : String(job.category || 'General')}
        </span>
        {job.tags.slice(0, 3).map(tag => (
          <span key={tag} className="px-3 py-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={sanitizeUrl(job.source_logo)} alt={job.source} className="w-4 h-4 rounded-sm object-contain" />
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">via {job.source}</span>
        </div>
      </div>
    </motion.a>
  );
}
