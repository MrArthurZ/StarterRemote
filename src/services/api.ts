import { Job, FilterCategory } from '../types';

async function fetchWithTimeout(url: string, timeoutMs: number = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function fetchJobs(category: FilterCategory = 'all'): Promise<Job[]> {
  const allJobs: Job[] = [];

  // Map our categories to API-specific categories
  let jobicyCategory = '';
  let museCategory = '';
  
  if (category === 'customer-support') {
    jobicyCategory = 'customer-support';
    museCategory = 'Customer%20Service';
  } else if (category === 'writing') {
    jobicyCategory = 'copywriting';
    museCategory = 'Writing%20and%20Editing';
  } else if (category === 'data') {
    jobicyCategory = 'data-science';
    museCategory = 'Data%20and%20Analytics';
  } else if (category === 'sales') {
    jobicyCategory = 'sales';
    museCategory = 'Sales';
  } else if (category === 'hr') {
    jobicyCategory = 'hr';
    museCategory = 'Human%20Resources';
  } else if (category === 'marketing') {
    jobicyCategory = 'marketing';
    museCategory = 'Marketing';
  }

  const jobicyUrl = jobicyCategory 
    ? `https://jobicy.com/api/v2/remote-jobs?count=50&industry=${jobicyCategory}`
    : 'https://jobicy.com/api/v2/remote-jobs?count=50';
    
  const museUrl = museCategory
    ? `https://www.themuse.com/api/public/jobs?page=1&location=Flexible%20/%20Remote&category=${museCategory}`
    : 'https://www.themuse.com/api/public/jobs?page=1&location=Flexible%20/%20Remote';

  try {
    const [jobicyRes, arbeitnowRes, remoteOkRes, museRes] = await Promise.allSettled([
      fetchWithTimeout(jobicyUrl),
      fetchWithTimeout('https://www.arbeitnow.com/api/job-board-api'),
      fetchWithTimeout('https://remoteok.com/api'),
      fetchWithTimeout(museUrl)
    ]);

    // 1. Jobicy
    if (jobicyRes.status === 'fulfilled' && jobicyRes.value.ok) {
      try {
        const data = await jobicyRes.value.json();
        const mapped = (data.jobs || []).map((j: any) => {
          const cat = Array.isArray(j.jobIndustry) ? j.jobIndustry[0] : (j.jobIndustry || 'General');
          return {
            id: `jobicy-${j.id}`,
            url: j.url,
            title: j.jobTitle,
            company_name: j.companyName,
            company_logo: j.companyLogo,
            category: typeof cat === 'string' ? cat : 'General',
            tags: j.jobExcerpts ? [j.jobExcerpts] : [],
            job_type: j.jobType,
            publication_date: j.pubDate,
            candidate_required_location: j.jobGeo,
            salary: j.annualSalaryMin ? `$${j.annualSalaryMin} - $${j.annualSalaryMax}` : '',
            description: j.jobDescription,
            source: 'Jobicy',
            source_logo: 'https://jobicy.com/favicon.ico'
          };
        });
        allJobs.push(...mapped);
      } catch (e) {
        console.error("Jobicy parse error:", e);
      }
    }

    // 2. Arbeitnow
    if (arbeitnowRes.status === 'fulfilled' && arbeitnowRes.value.ok) {
      try {
        const data = await arbeitnowRes.value.json();
        const mapped = (data.data || []).map((j: any) => {
          const cat = (j.tags && j.tags.length > 0) ? j.tags[0] : 'General';
          return {
            id: `arbeitnow-${j.slug}`,
            url: j.url,
            title: j.title,
            company_name: j.company_name,
            company_logo: '',
            category: typeof cat === 'string' ? cat : 'General',
            tags: j.tags || [],
            job_type: j.job_types ? j.job_types.join(', ') : 'Full-time',
            publication_date: j.created_at,
            candidate_required_location: j.location,
            salary: '',
            description: j.description,
            source: 'Arbeitnow',
            source_logo: 'https://www.arbeitnow.com/favicon.ico'
          };
        });
        allJobs.push(...mapped);
      } catch (e) {
        console.error("Arbeitnow parse error:", e);
      }
    }

    // 3. RemoteOK
    if (remoteOkRes.status === 'fulfilled' && remoteOkRes.value.ok) {
      try {
        const data = await remoteOkRes.value.json();
        // RemoteOK API returns legal text as the first item
        const jobs = Array.isArray(data) ? data.slice(1) : [];
        const mapped = jobs.map((j: any) => {
          return {
            id: `remoteok-${j.id}`,
            url: j.apply_url || j.url,
            title: j.position,
            company_name: j.company,
            company_logo: j.company_logo || j.logo || '',
            category: (j.tags && j.tags.length > 0) ? j.tags[0] : 'General',
            tags: j.tags || [],
            job_type: 'Full-time',
            publication_date: j.date,
            candidate_required_location: j.location || 'Worldwide',
            salary: j.salary_min ? `$${j.salary_min} - $${j.salary_max}` : '',
            description: j.description,
            source: 'Remote OK',
            source_logo: 'https://remoteok.com/favicon.ico'
          };
        });
        allJobs.push(...mapped);
      } catch (e) {
        console.error("RemoteOK parse error:", e);
      }
    }

    // 4. The Muse
    if (museRes.status === 'fulfilled' && museRes.value.ok) {
      try {
        const data = await museRes.value.json();
        const mapped = (data.results || []).map((j: any) => {
          const cat = (j.categories && j.categories.length > 0) ? j.categories[0].name : 'General';
          const loc = (j.locations && j.locations.length > 0) ? j.locations.map((l: any) => l.name).join(', ') : 'Flexible / Remote';
          return {
            id: `muse-${j.id}`,
            url: j.refs?.landing_page || '',
            title: j.name,
            company_name: j.company?.name || 'Unknown',
            company_logo: '',
            category: typeof cat === 'string' ? cat : 'General',
            tags: j.levels ? j.levels.map((l: any) => l.name) : [],
            job_type: 'Full-time',
            publication_date: j.publication_date,
            candidate_required_location: loc,
            salary: '',
            description: j.contents,
            source: 'The Muse',
            source_logo: 'https://www.themuse.com/favicon.ico'
          };
        });
        allJobs.push(...mapped);
      } catch (e) {
        console.error("The Muse parse error:", e);
      }
    }
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
  }

  // Client-side category filtering for Jobicy and Arbeitnow
  let finalJobs = allJobs;
  if (category !== 'all') {
    const catLower = category.toLowerCase();
    finalJobs = allJobs.filter(j => {
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

  // Sort by publication date (newest first)
  finalJobs.sort((a, b) => new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime());

  return finalJobs;
}

export async function fetchFreelanceJobs(): Promise<Job[]> {
  const allJobs: Job[] = [];

  try {
    const [freelancerRes, remoteOkRes, jobicyRes, remotiveRes, arbeitnowRes, museRes] = await Promise.allSettled([
      fetchWithTimeout('https://www.freelancer.com/api/projects/0.1/projects/active?compact=true&limit=50'),
      fetchWithTimeout('https://remoteok.com/api?tag=freelance'),
      fetchWithTimeout('https://jobicy.com/api/v2/remote-jobs?count=50&jobType=freelance'),
      fetchWithTimeout('https://remotive.com/api/remote-jobs?limit=100'),
      fetchWithTimeout('https://www.arbeitnow.com/api/job-board-api'),
      fetchWithTimeout('https://www.themuse.com/api/public/jobs?page=1&location=Flexible%20/%20Remote')
    ]);

    // 1. Freelancer.com
    if (freelancerRes.status === 'fulfilled' && freelancerRes.value.ok) {
      try {
        const data = await freelancerRes.value.json();
        const mapped = (data.result?.projects || []).map((p: any) => {
          const min = p.budget?.minimum || 0;
          const max = p.budget?.maximum || 0;
          const currency = p.currency?.code || 'USD';
          const salary = min && max ? `${min} - ${max} ${currency}` : 'Negotiable';
          const tags = p.jobs ? p.jobs.map((j: any) => j.name) : [];

          return {
            id: `freelancer-${p.id}`,
            url: `https://www.freelancer.com/projects/${p.seo_url}`,
            title: p.title,
            company_name: 'Freelancer.com Client',
            company_logo: '',
            category: p.type === 'hourly' ? 'Hourly Project' : 'Fixed Price Project',
            tags: tags,
            job_type: 'Freelance',
            publication_date: new Date(p.submitdate * 1000).toISOString(),
            candidate_required_location: 'Worldwide',
            salary: salary,
            description: p.preview_description || p.description || '',
            source: 'Freelancer.com',
            source_logo: 'https://www.freelancer.com/favicon.ico'
          };
        });
        allJobs.push(...mapped);
      } catch (e) {
        console.error("Freelancer.com parse error:", e);
      }
    }

    // 2. RemoteOK (Freelance tag)
    if (remoteOkRes.status === 'fulfilled' && remoteOkRes.value.ok) {
      try {
        const data = await remoteOkRes.value.json();
        const jobs = Array.isArray(data) ? data.slice(1) : [];
        const mapped = jobs.map((j: any) => {
          return {
            id: `remoteok-freelance-${j.id}`,
            url: j.apply_url || j.url,
            title: j.position,
            company_name: j.company,
            company_logo: j.company_logo || j.logo || '',
            category: (j.tags && j.tags.length > 0) ? j.tags[0] : 'General',
            tags: j.tags || [],
            job_type: 'Freelance',
            publication_date: j.date,
            candidate_required_location: j.location || 'Worldwide',
            salary: j.salary_min ? `$${j.salary_min} - $${j.salary_max}` : '',
            description: j.description,
            source: 'Remote OK',
            source_logo: 'https://remoteok.com/favicon.ico'
          };
        });
        allJobs.push(...mapped);
      } catch (e) {
        console.error("RemoteOK parse error:", e);
      }
    }

    // 3. Jobicy (Freelance type)
    if (jobicyRes.status === 'fulfilled' && jobicyRes.value.ok) {
      try {
        const data = await jobicyRes.value.json();
        const mapped = (data.jobs || []).map((j: any) => {
          const cat = Array.isArray(j.jobIndustry) ? j.jobIndustry[0] : (j.jobIndustry || 'General');
          return {
            id: `jobicy-freelance-${j.id}`,
            url: j.url,
            title: j.jobTitle,
            company_name: j.companyName,
            company_logo: j.companyLogo,
            category: typeof cat === 'string' ? cat : 'General',
            tags: j.jobExcerpts ? [j.jobExcerpts] : [],
            job_type: 'Freelance',
            publication_date: j.pubDate,
            candidate_required_location: j.jobGeo,
            salary: j.annualSalaryMin ? `$${j.annualSalaryMin} - $${j.annualSalaryMax}` : '',
            description: j.jobDescription,
            source: 'Jobicy',
            source_logo: 'https://jobicy.com/favicon.ico'
          };
        });
        allJobs.push(...mapped);
      } catch (e) {
        console.error("Jobicy parse error:", e);
      }
    }

    // 4. Remotive (Filter for freelance/contract)
    if (remotiveRes.status === 'fulfilled' && remotiveRes.value.ok) {
      try {
        const data = await remotiveRes.value.json();
        const freelanceJobs = (data.jobs || []).filter((j: any) => 
          j.job_type === 'contract' || j.job_type === 'freelance'
        );
        const mapped = freelanceJobs.map((j: any) => {
          return {
            id: `remotive-freelance-${j.id}`,
            url: j.url,
            title: j.title,
            company_name: j.company_name,
            company_logo: j.company_logo || '',
            category: j.category || 'General',
            tags: j.tags || [],
            job_type: 'Freelance / Contract',
            publication_date: j.publication_date,
            candidate_required_location: j.candidate_required_location || 'Worldwide',
            salary: j.salary || '',
            description: j.description,
            source: 'Remotive',
            source_logo: 'https://remotive.com/favicon.ico'
          };
        });
        allJobs.push(...mapped);
      } catch (e) {
        console.error("Remotive parse error:", e);
      }
    }

    // 5. Arbeitnow (Filter for freelance/contract)
    if (arbeitnowRes.status === 'fulfilled' && arbeitnowRes.value.ok) {
      try {
        const data = await arbeitnowRes.value.json();
        const freelanceJobs = (data.data || []).filter((j: any) => 
          j.job_types && (j.job_types.includes('contract') || j.job_types.includes('freelance'))
        );
        const mapped = freelanceJobs.map((j: any) => {
          const cat = (j.tags && j.tags.length > 0) ? j.tags[0] : 'General';
          return {
            id: `arbeitnow-freelance-${j.slug}`,
            url: j.url,
            title: j.title,
            company_name: j.company_name,
            company_logo: '',
            category: typeof cat === 'string' ? cat : 'General',
            tags: j.tags || [],
            job_type: 'Freelance / Contract',
            publication_date: j.created_at,
            candidate_required_location: j.location,
            salary: '',
            description: j.description,
            source: 'Arbeitnow',
            source_logo: 'https://www.arbeitnow.com/favicon.ico'
          };
        });
        allJobs.push(...mapped);
      } catch (e) {
        console.error("Arbeitnow parse error:", e);
      }
    }

    // 6. The Muse (Filter for freelance/contract)
    if (museRes.status === 'fulfilled' && museRes.value.ok) {
      try {
        const data = await museRes.value.json();
        const freelanceJobs = (data.results || []).filter((j: any) => {
          const nameLower = j.name.toLowerCase();
          return nameLower.includes('freelance') || nameLower.includes('contract');
        });
        const mapped = freelanceJobs.map((j: any) => {
          const cat = (j.categories && j.categories.length > 0) ? j.categories[0].name : 'General';
          const loc = (j.locations && j.locations.length > 0) ? j.locations.map((l: any) => l.name).join(', ') : 'Flexible / Remote';
          return {
            id: `muse-freelance-${j.id}`,
            url: j.refs?.landing_page || '',
            title: j.name,
            company_name: j.company?.name || 'Unknown',
            company_logo: '',
            category: typeof cat === 'string' ? cat : 'General',
            tags: j.levels ? j.levels.map((l: any) => l.name) : [],
            job_type: 'Freelance / Contract',
            publication_date: j.publication_date,
            candidate_required_location: loc,
            salary: '',
            description: j.contents,
            source: 'The Muse',
            source_logo: 'https://www.themuse.com/favicon.ico'
          };
        });
        allJobs.push(...mapped);
      } catch (e) {
        console.error("The Muse parse error:", e);
      }
    }
  } catch (error) {
    console.error("Failed to fetch freelance jobs:", error);
  }

  // Sort by publication date (newest first)
  allJobs.sort((a, b) => new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime());

  return allJobs;
}

// Helper to filter jobs that match search, location, and experience level
export function filterJobs(
  jobs: Job[], 
  searchQuery: string = '', 
  selectedCountry: string = '',
  experienceLevel: string = 'entry'
): Job[] {
  const entryLevelKeywords = [
    'junior', 'entry', 'entry-level', 'associate', 'assistant', 
    'support', 'bilingual', 'native', 'translator', 'writer', 
    'data entry', 'coordinator', 'specialist', 'representative', 'generalist',
    'intern', 'internship', 'trainee', 'apprentice', 'no experience'
  ];

  const seniorKeywords = [
    'senior', 'lead', 'principal', 'director', 'manager', 'head', 'vp', 'chief', 'architect'
  ];

  return jobs.filter(job => {
    const textToSearch = `${job.title} ${job.tags.join(' ')} ${job.category}`.toLowerCase();
    
    // Check experience level
    let matchesExperience = true;
    const isEntry = entryLevelKeywords.some(keyword => textToSearch.includes(keyword));
    const isSenior = seniorKeywords.some(keyword => textToSearch.includes(keyword));
    
    if (experienceLevel === 'entry') {
      matchesExperience = isEntry && !isSenior;
    } else if (experienceLevel === 'senior') {
      matchesExperience = isSenior;
    } else if (experienceLevel === 'mid') {
      matchesExperience = !isEntry && !isSenior;
    } else if (experienceLevel === 'all') {
      matchesExperience = true;
    }
    
    // Check search query
    const matchesSearch = searchQuery 
      ? textToSearch.includes(searchQuery.toLowerCase()) || job.company_name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    // Check country
    let matchesCountry = true;
    if (selectedCountry) {
      const location = (job.candidate_required_location || '').toLowerCase();
      const countryLower = selectedCountry.toLowerCase();
      
      matchesCountry = 
        location.includes(countryLower) || 
        location.includes('anywhere') || 
        location.includes('worldwide') || 
        location.includes('global') ||
        location === '';
        
      // Special cases for US/UK
      if (!matchesCountry && countryLower === 'united states') {
        matchesCountry = location.includes('us') || location.includes('usa') || location.includes('america');
      }
      if (!matchesCountry && countryLower === 'united kingdom') {
        matchesCountry = location.includes('uk');
      }
    }

    return matchesExperience && matchesSearch && matchesCountry;
  });
}
