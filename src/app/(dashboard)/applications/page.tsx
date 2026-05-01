'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ApplicationsPage() {
  const supabase = createClient()
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadApplications() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('applications')
      .select(`
        *,
        job_offers (
          title,
          company
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (data) setApplications(data)
    setLoading(false)
  }

  useEffect(() => {
    loadApplications()
    const channel = supabase.channel('apps-live').on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => loadApplications()).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  // Logique de filtrage par colonne
  const getCol = (status: string) => {
    if (status === 'applied') {
      // Pour "Applied", on prend tout ce qui n'est pas dans les 3 autres colonnes majeures
      return applications.filter(a => {
        const s = a.status?.toLowerCase()
        return !s || s === 'applied' || (s !== 'in review' && s !== 'interview' && s !== 'offer' && s !== 'rejected')
      })
    }
    return applications.filter(a => a.status?.toLowerCase() === status.toLowerCase())
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'linear-gradient(145deg, #ede9fe 0%, #ddd6fe 50%, #c7d2fe 100%)' }}>
      <div className="topbar" style={{ 
        padding: '20px 26px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #635bff 100%)', 
        margin: 0, 
        borderBottom: '1px solid rgba(255,255,255,0.1)', 
        boxShadow: '0 4px 24px rgba(99,91,255,0.25)' 
      }}>
        <div>
          <div className="page-title" style={{ fontSize: '20px', fontWeight: 500, color: '#f5f3ff', letterSpacing: '-0.4px', fontFamily: "'Syne', sans-serif" }}>
            My applications
          </div>
          <div className="page-sub" style={{ fontSize: '12px', color: '#c4b5fd', marginTop: '2px' }}>
            Track your professional journey in real-time
          </div>
        </div>
      </div>

      <div className="content" style={{ padding: '18px 26px 24px' }}>
        <div className="kanban" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '14px' }}>
          {[
            { title: 'Applied', status: 'applied', color: '#7c3aed', dot: '#7c3aed' },
            { title: 'In review', status: 'in review', color: '#b45309', dot: '#f59e0b' },
            { title: 'Interview', status: 'interview', color: '#1d4ed8', dot: '#3b82f6' },
            { title: 'Offer', status: 'offer', color: '#15803d', dot: '#10b981' }
          ].map(col => (
            <div key={col.status} className="kanban-col" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', padding: '10px' }}>
              <div className="kanban-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div className="kanban-title" style={{ fontSize: '11px', fontWeight: 500, color: col.color, textTransform: 'uppercase', letterSpacing: '0.7px' }}>{col.title}</div>
                <div className="kanban-count" style={{ fontSize: '11px', background: '#fff', border: '1px solid rgba(109,91,255,0.1)', padding: '1px 7px', borderRadius: '10px', color: col.color }}>{getCol(col.status).length}</div>
              </div>
              {getCol(col.status).map(app => (
                <div key={app.id} className="kcard" style={{ background: '#fff', border: '1px solid rgba(109,91,255,0.1)', borderRadius: '8px', padding: '10px', marginBottom: '7px', borderLeft: `2px solid ${col.dot}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div className="kcard-name" style={{ fontSize: '12px', fontWeight: 500, color: '#1e1b4b' }}>{app.job_offers?.company}</div>
                  <div className="kcard-role" style={{ fontSize: '11px', color: '#4c1d95' }}>{app.job_offers?.title}</div>
                  <div className="kcard-tags" style={{ display: 'flex', gap: '4px', marginTop: '7px', flexWrap: 'wrap' }}>
                    <span className="kcard-tag" style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: '#ede9fe', color: '#7c3aed' }}>
                      {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="card" style={{ background: '#fff', border: '1px solid rgba(109,91,255,0.1)', borderRadius: '12px', padding: '16px' }}>
          <div className="card-title" style={{ fontSize: '13px', fontWeight: 500, marginBottom: '14px', color: '#1e1b4b', fontFamily: "'Syne', sans-serif" }}>Full history</div>
          <table className="app-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(109,91,255,0.1)' }}>
                <th style={{ textAlign: 'left', padding: '7px 10px', fontSize: '10px', color: '#7c3aed', fontWeight: 500, textTransform: 'uppercase' }}>Position</th>
                <th style={{ textAlign: 'left', padding: '7px 10px', fontSize: '10px', color: '#7c3aed', fontWeight: 500, textTransform: 'uppercase' }}>Company</th>
                <th style={{ textAlign: 'left', padding: '7px 10px', fontSize: '10px', color: '#7c3aed', fontWeight: 500, textTransform: 'uppercase' }}>Applied</th>
                <th style={{ textAlign: 'left', padding: '7px 10px', fontSize: '10px', color: '#7c3aed', fontWeight: 500, textTransform: 'uppercase' }}>CV</th>
                <th style={{ textAlign: 'left', padding: '7px 10px', fontSize: '10px', color: '#7c3aed', fontWeight: 500, textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id} style={{ borderBottom: '1px solid rgba(109,91,255,0.1)' }}>
                  <td style={{ padding: '11px 10px', fontWeight: 500 }}>{app.job_offers?.title}</td>
                  <td style={{ padding: '11px 10px', color: '#4c1d95' }}>{app.job_offers?.company}</td>
                  <td style={{ padding: '11px 10px', color: '#4c1d95' }}>{new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                  <td style={{ padding: '11px 10px' }}>
                    <a href={app.cv_url} target="_blank" style={{ color: '#2563eb', fontSize: '11px', textDecoration: 'none', cursor: 'pointer' }}>
                      {app.cv_name || 'CV_2026.pdf'}
                    </a>
                  </td>
                  <td style={{ padding: '11px 10px' }}>
                    <span style={{ 
                      padding: '2px 9px', 
                      borderRadius: '20px', 
                      fontSize: '10px', 
                      fontWeight: 600,
                      background: 
                        app.status?.toLowerCase() === 'offer' ? '#f0fdf4' : 
                        app.status?.toLowerCase() === 'rejected' ? '#fff1f2' : 
                        app.status?.toLowerCase() === 'interview' ? '#eff6ff' : 
                        app.status?.toLowerCase() === 'in review' ? '#fffbeb' : '#f3f0ff',
                      color: 
                        app.status?.toLowerCase() === 'offer' ? '#166534' : 
                        app.status?.toLowerCase() === 'rejected' ? '#9f1239' : 
                        app.status?.toLowerCase() === 'interview' ? '#1d4ed8' : 
                        app.status?.toLowerCase() === 'in review' ? '#92400e' : '#5b21b6'
                    }}>
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
