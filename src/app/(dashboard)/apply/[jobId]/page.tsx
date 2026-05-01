'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'

export default function ApplyPage() {
  const params = useParams()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  
  const [job, setJob] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [userEmail, setUserEmail] = useState('')
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      setUserEmail(user.email || '')

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setUserProfile(profile)

      const { data: jobData } = await supabase.from('job_offers').select('*').eq('id', params.jobId).single()
      setJob(jobData)

      setPageLoading(false)
    }
    loadData()
  }, [params.jobId, router, supabase])

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return alert('Veuillez sélectionner un CV (PDF)')
    if (!job) return alert("L'offre d'emploi n'existe pas.")
    
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Vous devez être connecté')

      const filePath = `${user.id}/${Date.now()}_${file.name}`
      
      const { error: uploadError } = await supabase.storage
        .from('cv_bucket')
        .upload(filePath, file)
        
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('cv_bucket')
        .getPublicUrl(filePath)

      const { error: insertError } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          job_id: job.id,
          cv_url: publicUrl,
          status: 'pending'
        })
        
      if (insertError) {
        if (insertError.message.includes('duplicate key') || insertError.message.includes('unique constraint')) {
          throw new Error('Vous avez déjà postulé à cette offre.')
        }
        throw insertError
      }

      alert('Candidature envoyée avec succès!')
      router.push('/applications')
    } catch (err: any) {
      console.error(err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) return <div className="p-8">Loading application...</div>
  if (!job) return <div className="p-8">Job not found.</div>

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Apply for this position</div>
          <div className="page-sub">{job.title} · {job.company}</div>
        </div>
      </div>
      <div className="content">
        <form onSubmit={handleApply} className="grid2 gap-4.5">
          <div>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input required className="form-input" defaultValue={`${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input required className="form-input" defaultValue={userEmail} disabled />
            </div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" placeholder="+213 6XX XXX XXX" /></div>
            <div className="form-group"><label className="form-label">Cover letter</label><textarea className="form-input" rows={4} placeholder="Why are you the perfect fit?"></textarea></div>
          </div>
          <div>
            <label className="form-label block mb-2">CV / Resume <span className="text-(--accent)">*</span> (PDF only)</label>
            <label className="upload-zone block">
              <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <Upload className="w-9 h-9 mx-auto mb-2.5 text-(--muted)" />
              <div className="text-[13px] text-(--muted)">Drop your CV here or <span className="text-(--accent) cursor-pointer font-medium">browse files</span></div>
              <div className="text-[11px] text-(--hint) mt-1">PDF only · Max 5 MB · Stored in Supabase Storage</div>
            </label>
            
            {file && (
              <div className="mt-3 bg-(--surface3) rounded-lg p-3 flex items-center gap-2.5 border border-(--border)">
                <div className="flex-1">
                  <div className="text-xs font-medium text-(--text)">{file.name}</div>
                  <div className="text-[10px] text-(--hint)">{(file.size / 1024 / 1024).toFixed(2)} MB · Ready</div>
                </div>
              </div>
            )}
            
            <button type="submit" disabled={loading} className="btn-primary w-full p-3 text-[13px] mt-4 rounded-lg flex justify-center disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit application'}
            </button>
            <p className="text-[10px] text-(--hint) text-center mt-2.5 leading-[1.6]">Your data is securely stored via Supabase and only visible to you (RLS enforced).</p>
          </div>
        </form>
      </div>
    </>
  )
}
