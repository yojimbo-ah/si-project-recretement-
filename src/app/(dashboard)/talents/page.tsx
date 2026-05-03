'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Search, MapPin, X, Code, Link, Mail, GraduationCap, Briefcase, Users } from 'lucide-react'

export default function TalentsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [talents, setTalents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTalent, setSelectedTalent] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTalents() {
      setLoading(true)
      const { data, error: supabaseError } = await supabase
        .from('profiles')
        .select('*')
      
      if (supabaseError) {
        console.error('Erreur Supabase:', supabaseError)
        setError(supabaseError.message)
      } else {
        setTalents(data || [])
      }
      setLoading(false)
    }
    loadTalents()
  }, [])

  const filteredTalents = talents.filter(t => {
    const q = searchQuery.toLowerCase()
    const fullName = `${t.first_name || ''} ${t.last_name || ''}`.toLowerCase()
    return (
      fullName.includes(q) ||
      (t.bio && t.bio.toLowerCase().includes(q)) ||
      (t.location && t.location.toLowerCase().includes(q)) ||
      (t.skills && t.skills.some((s: string) => s.toLowerCase().includes(q)))
    )
  })

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Talent Community</div>
          <div className="page-sub">Discover and connect with {talents.length} professionals in Algeria</div>
        </div>
      </div>
      <div className="content">
        <div className="flex gap-2 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--hint)]" />
            <input 
              className="w-full bg-white border border-[var(--border2)] rounded-lg py-2 pr-3 pl-[30px] text-xs text-[var(--text)] outline-none" 
              placeholder="Search by name, skills, or location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {error && (
          <div style={{ padding: '15px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
            <strong>Erreur de chargement :</strong> {error}
          </div>
        )}

        {loading && <div className="p-8 text-center text-[var(--muted)] text-sm">Loading community...</div>}

        <div className="grid2">
          {!loading && filteredTalents.map(talent => (
            <div 
              key={talent.id} 
              className="card job-card" 
              style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}
              onClick={() => setSelectedTalent(talent)}
            >
              <div className="avatar-lg" style={{ width: '50px', height: '50px', minWidth: '50px', fontSize: '16px' }}>
                {(talent.first_name?.[0] || '') + (talent.last_name?.[0] || '') || 'U'}
              </div>
              <div className="flex-1">
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  {talent.first_name || 'Anonymous'} {talent.last_name || ''}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <MapPin size={10} /> {talent.location || 'Algeria'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px' }}>
                  {(talent.skills || []).slice(0, 3).map((skill: string) => (
                    <span key={skill} className="tag full" style={{ fontSize: '9px', padding: '2px 6px' }}>{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Détail Profil Enrichi */}
        {selectedTalent && (
          <div className="modal-overlay" onClick={() => setSelectedTalent(null)}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <span>Professional Profile</span>
                <X size={18} className="cursor-pointer opacity-50" onClick={() => setSelectedTalent(null)} />
              </div>
              <div className="modal-body">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="avatar-lg" style={{ width: '64px', height: '64px', fontSize: '24px' }}>
                      {(selectedTalent.first_name?.[0] || '') + (selectedTalent.last_name?.[0] || '')}
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 600 }}>{selectedTalent.first_name} {selectedTalent.last_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {selectedTalent.location || 'Algeria'}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {selectedTalent.linkedin_url && <a href={selectedTalent.linkedin_url} target="_blank" className="text-[var(--accent)]"><Link size={16} /></a>}
                        {selectedTalent.github_url && <a href={selectedTalent.github_url} target="_blank" className="text-[var(--text)]"><Code size={16} /></a>}
                      </div>
                    </div>
                  </div>
                  <button className="btn-primary" onClick={() => router.push(`/messages?to=${selectedTalent.id}`)}>Message</button>
                </div>

                <div className="grid2" style={{ gap: '20px' }}>
                  <div className="flex flex-col gap-5">
                    <div>
                      <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Users size={14} /> About me
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text)', lineHeight: '1.6' }}>
                        {selectedTalent.bio || 'No biography provided.'}
                      </p>
                    </div>

                    <div>
                      <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Briefcase size={14} /> Experience
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text)', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                        {selectedTalent.experience || 'No experience listed.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5">
                    <div>
                      <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <GraduationCap size={14} /> Education
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text)', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                        {selectedTalent.education || 'No education listed.'}
                      </p>
                    </div>

                    <div>
                      <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        Skills
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(selectedTalent.skills || []).map((skill: string) => (
                          <span key={skill} className="tag full">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && filteredTalents.length === 0 && (
          <div className="p-8 text-center text-[var(--muted)] text-sm">
            No talents found matching your search.
          </div>
        )}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(30, 27, 75, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.2s ease-out;
        }
        .modal-card {
          background: white;
          width: 100%;
          max-width: 650px;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
          overflow: hidden;
          animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .modal-header {
          padding: 15px 20px;
          border-bottom: 1px solid var(--border2);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 14px;
        }
        .modal-body {
          padding: 24px;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </>
  )
}

