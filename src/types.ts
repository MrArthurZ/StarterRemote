export interface Job {
  id: string | number;
  url: string;
  title: string;
  company_name: string;
  company_logo: string;
  category: string;
  tags: string[];
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
  source: string;
  source_logo: string;
}

export type FilterCategory = 'all' | 'customer-support' | 'writing' | 'data' | 'sales' | 'hr' | 'marketing';
export type ExperienceLevel = 'all' | 'entry' | 'mid' | 'senior';
