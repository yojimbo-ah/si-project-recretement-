'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function Jobs() {
  const supabase = createClient()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadJobs() {
      setLoading(true)
      setError(null)

      // Rafraîchir la session si le JWT est expiré
      await supabase.auth.refreshSession()
      
      const { data, error } = await supabase
        .from('job_offers')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Supabase error:', error)
        setError(error.message)
      } else {
        setJobs(data || [])
      }
      setLoading(false)
    }
    loadJobs()
  }, [])

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => {
    const q = searchQuery.toLowerCase()
    return (
      (job.title && job.title.toLowerCase().includes(q)) ||
      (job.company && job.company.toLowerCase().includes(q)) ||
      (job.location && job.location.toLowerCase().includes(q))
    )
  })

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Browse jobs</div>
          <div className="page-sub">{loading ? 'Loading...' : `${filteredJobs.length} open positions match your search`}</div>
        </div>
      </div>
      <div className="content">
        <div className="flex gap-2 mb-3.5">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--hint)]" />
            <input 
              className="w-full bg-white border border-[var(--border2)] rounded-lg py-2 pr-3 pl-[30px] text-xs text-[var(--text)] outline-none" 
              placeholder="Search jobs, companies, locations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-primary text-xs">Search</button>
        </div>
        
        {loading && <div className="p-8 text-center text-[var(--muted)] text-sm">Loading jobs...</div>}

        {!loading && error && (
          <div className="p-8 text-center text-sm">
            <div style={{ color: '#ef4444', marginBottom: '8px' }}>⚠ Error: {error}</div>
            <button className="btn-primary text-xs" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {!loading && !error && filteredJobs.length === 0 && (
          <div className="p-8 text-center text-[var(--muted)] text-sm">
            No jobs found. The database may be empty.
          </div>
        )}


        {!loading && filteredJobs.map(job => (
          <div key={job.id} className="job-card">
            <div className="job-logo bg-[#fff5f6] text-[var(--accent)]">
              {job.company.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="job-title">{job.title}</div>
              <div className="job-company">{job.company} {job.location ? `· ${job.location}` : ''}</div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {job.type && <span className={`tag ${job.type.toLowerCase() === 'remote' ? 'remote' : job.type.toLowerCase() === 'on-site' ? 'full' : 'part'}`}>{job.type}</span>}
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
              <div className="text-xs font-medium text-[var(--text)]">{job.salary || 'Competitive'}</div>
              <div className="text-[10px] text-[var(--hint)]">{new Date(job.created_at).toLocaleDateString()}</div>
              <Link href={`/apply/${job.id}`} className="bg-[var(--accent)] text-white border-none py-1.5 px-3 rounded-md text-[11px] cursor-pointer font-medium mt-1 inline-block">Apply now</Link>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
