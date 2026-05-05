'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    total: 0,
    inReview: 0,
    interview: 0,
    offer: 0
  })
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate')

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, role')
        .eq('id', user.id)
        .single()

      if (profile?.first_name) setUserName(profile.first_name)
      const currentRole = (profile?.role || 'candidate') as 'candidate' | 'recruiter'
      setRole(currentRole)

      const { data: apps } = currentRole === 'recruiter'
        ? await supabase
            .from('applications')
            .select('status, job_offers!inner(recruiter_id)')
            .eq('job_offers.recruiter_id', user.id)
        : await supabase
            .from('applications')
            .select('status')
            .eq('user_id', user.id)

      if (apps) {
        setStats({
          total: apps.length,
          inReview: apps.filter(a => a.status?.toLowerCase() === 'in review').length,
          interview: apps.filter(a => a.status?.toLowerCase() === 'interview').length,
          offer: apps.filter(a => a.status?.toLowerCase() === 'offer').length
        })
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  const statCards = role === 'recruiter'
    ? [
        { label: 'Applications', value: stats.total, dotColor: '#635bff', changeText: 'Total received' },
        { label: 'In Review', value: stats.inReview, dotColor: '#f59e0b', changeText: 'Waiting reply' },
        { label: 'Interviews', value: stats.interview, dotColor: '#16a34a', changeText: 'Scheduled' },
        { label: 'Offers', value: stats.offer, dotColor: '#3b82f6', changeText: 'Sent' },
      ]
    : [
        { label: 'Applications', value: stats.total, dotColor: '#635bff', changeText: 'Total submitted' },
        { label: 'In Review', value: stats.inReview, dotColor: '#f59e0b', changeText: 'Active now' },
        { label: 'Interviews', value: stats.interview, dotColor: '#16a34a', changeText: 'Next steps' },
        { label: 'Offers', value: stats.offer, dotColor: '#3b82f6', changeText: 'Received' },
      ]

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Good morning, {userName || (role === 'recruiter' ? 'Recruiter' : 'Talent')}</div>
          <div className="page-sub">{role === 'recruiter' ? 'Here is your hiring overview for today' : "Here's your job search overview for today"}</div>
        </div>
      </div>

      <div className="content">
        {/* STATS ROW (FROM DESIGN.HTML) */}
        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '18px' }}>
          {statCards.map((card) => (
            <div key={card.label} className="stat-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
              <div className="stat-label" style={{ fontSize: '10px', color: 'var(--hint)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
                {card.label}
              </div>
              <div className="stat-num" style={{ fontSize: '24px', fontWeight: 500, color: 'var(--text)', fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>
                {card.value}
              </div>
              <div className="stat-change" style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="stat-dot" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: card.dotColor }}></span>
                {card.changeText}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM SECTIONS (KEPT AS IS) */}
        <div className="grid2">
          <div className="card" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: 'white', border: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 600, fontFamily: "'Syne', sans-serif", marginBottom: '10px' }}>
                  {role === 'recruiter' ? 'Publish your next role' : 'Ready for your next move?'}
                </div>
                <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '20px', maxWidth: '250px' }}>
                  {role === 'recruiter'
                    ? 'Create job offers and track candidates in one place.'
                    : 'Explore thousands of jobs tailored to your skills in the Algerian market.'}
                </p>
                <Link href="/jobs" className="btn-primary" style={{ background: 'white', color: 'var(--accent)', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {role === 'recruiter' ? 'Post a Job' : 'Explore Jobs'} <ArrowRight size={14} />
                </Link>
              </div>
              <TrendingUp size={60} style={{ opacity: 0.1 }} />
            </div>
          </div>

          <div className="card">
            <div className="card-title">Recent Activity</div>
            <div style={{ marginTop: '15px' }}>
              {stats.total === 0 ? (
                <div className="text-center py-4 text-(--muted) text-xs">
                  {role === 'recruiter' ? 'No applications yet. Publish a job to get started.' : 'No activity yet. Your applications will appear here.'}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--surface2)', borderRadius: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                    <div style={{ fontSize: '12px' }}>
                      {role === 'recruiter'
                        ? <>You have <strong>{stats.total}</strong> applications waiting for review.</>
                        : <>You have <strong>{stats.total}</strong> active applications in progress.</>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
