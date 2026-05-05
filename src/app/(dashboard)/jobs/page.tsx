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
  const [role, setRole] = useState<'candidate' | 'recruiter' | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    tags: ''
  })

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setRole((profile?.role || 'candidate') as 'candidate' | 'recruiter')
    }

    loadProfile()
  }, [])

  useEffect(() => {
    async function loadJobs() {
      if (!role) return
      setLoading(true)
      setError(null)

      // Rafraîchir la session si le JWT est expiré
      await supabase.auth.refreshSession()

      const query = supabase
        .from('job_offers')
        .select('*')
        .order('created_at', { ascending: false })

      const { data, error } = role === 'recruiter' && userId
        ? await query.eq('recruiter_id', userId)
        : await query
      
      if (error) {
        console.error('Supabase error:', error)
        setError(error.message)
      } else {
        setJobs(data || [])
      }
      setLoading(false)
    }

    loadJobs()
  }, [role, userId])

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setCreating(true)
    setError(null)

    const tags = newJob.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    const { error } = await supabase.from('job_offers').insert({
      title: newJob.title,
      company: newJob.company,
      location: newJob.location || null,
      type: newJob.type || null,
      salary: newJob.salary || null,
      description: newJob.description || null,
      tags: tags.length ? tags : null,
      recruiter_id: userId
    })

    if (error) {
      setError(error.message)
    } else {
      setNewJob({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        salary: '',
        description: '',
        tags: ''
      })
    }
    setCreating(false)
  }

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
          <div className="page-title">{role === 'recruiter' ? 'My job offers' : 'Browse jobs'}</div>
          <div className="page-sub">
            {loading ? 'Loading...' : `${filteredJobs.length} ${role === 'recruiter' ? 'offers' : 'open positions'} match your search`}
          </div>
        </div>
      </div>
      <div className="content">
        {role === 'recruiter' && (
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="card-title">Post a job offer</div>
            <form onSubmit={handleCreateJob} className="grid2" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  required
                  className="form-input"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="Frontend Engineer"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <input
                  required
                  className="form-input"
                  value={newJob.company}
                  onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                  placeholder="Your company"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  className="form-input"
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  placeholder="Alger"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={newJob.type}
                  onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Salary</label>
                <input
                  className="form-input"
                  value={newJob.salary}
                  onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                  placeholder="120k - 180k DA"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tags</label>
                <input
                  className="form-input"
                  value={newJob.tags}
                  onChange={(e) => setNewJob({ ...newJob, tags: e.target.value })}
                  placeholder="React, TypeScript, Remote"
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  placeholder="Describe the role, responsibilities, and requirements."
                />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary" disabled={creating} style={{ fontSize: '12px' }}>
                  {creating ? 'Posting...' : 'Post job'}
                </button>
              </div>
            </form>
          </div>
        )}
        <div className="flex gap-2 mb-3.5">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-(--hint)" />
            <input 
              className="w-full bg-white border border-(--border2) rounded-lg py-2 pr-3 pl-7.5 text-xs text-(--text) outline-none" 
              placeholder="Search jobs, companies, locations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-primary text-xs">Search</button>
        </div>
        
        {loading && <div className="p-8 text-center text-(--muted) text-sm">Loading jobs...</div>}

        {!loading && error && (
          <div className="p-8 text-center text-sm">
            <div style={{ color: '#ef4444', marginBottom: '8px' }}>⚠ Error: {error}</div>
            <button className="btn-primary text-xs" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {!loading && !error && filteredJobs.length === 0 && (
          <div className="p-8 text-center text-(--muted) text-sm">
            No jobs found. The database may be empty.
          </div>
        )}


        {!loading && filteredJobs.map(job => (
          <div key={job.id} className="job-card">
            <div className="job-logo bg-[#fff5f6] text-(--accent)">
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
              <div className="text-xs font-medium text-(--text)">{job.salary || 'Competitive'}</div>
              <div className="text-[10px] text-(--hint)">{new Date(job.created_at).toLocaleDateString()}</div>
              {role !== 'recruiter' ? (
                <Link href={`/apply/${job.id}`} className="bg-(--accent) text-white border-none py-1.5 px-3 rounded-md text-[11px] cursor-pointer font-medium mt-1 inline-block">Apply now</Link>
              ) : (
                <Link href="/applications" className="bg-(--accent) text-white border-none py-1.5 px-3 rounded-md text-[11px] cursor-pointer font-medium mt-1 inline-block">Manage applications</Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
