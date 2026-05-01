'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const WILAYAS = [
  "01-Adrar", "02-Chlef", "03-Laghouat", "04-Oum El Bouaghi", "05-Batna", "06-Béjaïa", "07-Biskra", "08-Béchar", "09-Blida", "10-Bouira",
  "11-Tamanrasset", "12-Tébessa", "13-Tlemcen", "14-Tiaret", "15-Tizi Ouzou", "16-Alger", "17-Djelfa", "18-Jijel", "19-Sétif", "20-Saïda",
  "21-Skikda", "22-Sidi Bel Abbès", "23-Annaba", "24-Guelma", "25-Constantine", "26-Médéa", "27-Mostaganem", "28-M'Sila", "29-Mascara", "30-Ouargla",
  "31-Oran", "32-El Bayadh", "33-Illizi", "34-Bordj Bou Arreridj", "35-Boumerdès", "36-El Tarf", "37-Tindouf", "38-Tissemsilt", "39-El Oued", "40-Khenchela",
  "41-Souk Ahras", "42-Tipaza", "43-Mila", "44-Aïn Defla", "45-Naâma", "46-Aïn Témouchent", "47-Ghardaïa", "48-Relizane", "49-El M'Ghair", "50-El Meniaa",
  "51-Ouled Djellal", "52-Bordj Baji Mokhtar", "53-Béni Abbès", "54-Timimoun", "55-Touggourt", "56-Djanet", "57-In Salah", "58-In Guezzam"
];

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    role: '',
  })
  
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvName, setCvName] = useState<string | null>(null)

  const [experience, setExperience] = useState('')
  const [education, setEducation] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')

  const handleAddSkill = () => {
    const skill = window.prompt('Enter a new skill (e.g. TypeScript):')
    if (skill && skill.trim()) {
      if (!skills.includes(skill.trim())) {
        setSkills([...skills, skill.trim()])
      }
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove))
  }

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      setUserEmail(user.email || '')

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          role: data.role || 'candidate'
        })
        setBio(data.bio || '')
        setLocation(data.location || '')
        setPhone(data.phone || '')
        setSkills(data.skills || [])
        setCvName(data.cv_name || null)
        setExperience(data.experience || '')
        setEducation(data.education || '')
        setLinkedinUrl(data.linkedin_url || '')
        setGithubUrl(data.github_url || '')
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let finalCvUrl = undefined
    let finalCvName = cvName

    if (cvFile) {
      const filePath = `${user.id}/${Date.now()}_${cvFile.name}`
      const { error: uploadError } = await supabase.storage.from('cv_bucket').upload(filePath, cvFile)
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('cv_bucket').getPublicUrl(filePath)
        finalCvUrl = publicUrl
        finalCvName = cvFile.name
        setCvName(cvFile.name)
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        bio,
        location,
        phone,
        skills,
        experience,
        education,
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        ...(finalCvUrl && { cv_url: finalCvUrl, cv_name: finalCvName })
      })
      .eq('id', user.id)

    if (error) {
      alert('Error updating profile: ' + error.message)
    } else {
      alert('Profile updated successfully!')
    }
    setSaving(false)
  }

  if (loading) return <div className="p-8">Loading profile...</div>

  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">My profile</div>
          <div className="page-sub">Build your professional identity</div>
        </div>
        <div className="topbar-actions">
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ fontSize: '12px' }}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
      <div className="content">
        <div className="profile-hero">
          <div className="avatar-lg">{initials || 'U'}</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 500, fontFamily: "'Syne', sans-serif" }}>
              {profile.first_name} {profile.last_name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
              Candidate · {location || 'Not set'}
            </div>
          </div>
        </div>
        <div className="grid2">
          <div className="flex flex-col gap-4">
            <div className="card">
              <div className="card-title">Personal information</div>
              <div className="grid2" style={{ gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '0' }}>
                <div className="form-group">
                  <label className="form-label">First name</label>
                  <input className="form-input" value={profile.first_name} onChange={e => setProfile({...profile, first_name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last name</label>
                  <input className="form-input" value={profile.last_name} onChange={e => setProfile({...profile, last_name: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location (Wilaya)</label>
                <select className="form-select" value={location} onChange={e => setLocation(e.target.value)}>
                  <option value="">Select your wilaya...</option>
                  {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Bio / About me</label>
                <textarea className="form-input" rows={2} value={bio} onChange={e => setBio(e.target.value)} />
              </div>
            </div>

            <div className="card">
              <div className="card-title">Experience & Education</div>
              <div className="form-group">
                <label className="form-label">Professional Experience</label>
                <textarea className="form-input" rows={3} placeholder="Describe your past roles..." value={experience} onChange={e => setExperience(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Education / University</label>
                <select className="form-select" value={education} onChange={e => setEducation(e.target.value)}>
                  <option value="">Select your school...</option>
                  <option value="ESTIN (Amizour)">ESTIN (Amizour)</option>
                  <option value="ESI (Alger)">ESI (Alger)</option>
                  <option value="ESI SBA (Sidi Bel Abbès)">ESI SBA (Sidi Bel Abbès)</option>
                  <option value="Informatique LMD">Informatique LMD</option>
                  <option value="Informatique Ingénieur">Informatique Ingénieur</option>
                  <option value="Other / University">Other / University</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="card">
              <div className="card-title">Social & Contact</div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">LinkedIn URL</label>
                <input className="form-input" placeholder="https://linkedin.com/in/..." value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">GitHub URL</label>
                <input className="form-input" placeholder="https://github.com/..." value={githubUrl} onChange={e => setGithubUrl(e.target.value)} />
              </div>
            </div>

            <div className="card">
              <div className="card-title">Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {skills.map(skill => (
                  <span key={skill} className="tag full" style={{ cursor: 'pointer' }} onClick={() => handleRemoveSkill(skill)}>
                    {skill} &times;
                  </span>
                ))}
                <button type="button" onClick={handleAddSkill} style={{ fontSize: '10px', padding: '2px 9px', borderRadius: '5px', border: '1px dashed var(--border2)', background: 'none', color: 'var(--accent)', cursor: 'pointer' }}>+ Add</button>
              </div>
            </div>

            <div className="card">
              <div className="card-title">My CV</div>
              <label className="upload-zone" style={{ padding: '16px', display: 'block' }}>
                <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Upload your CV — <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>browse file</span></div>
                <div style={{ fontSize: '10px', color: 'var(--hint)', marginTop: '3px' }}>PDF only · Max 5MB</div>
              </label>
              {cvName && !cvFile && <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text)' }}>Current: <strong>{cvName}</strong></div>}
              {cvFile && <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--accent)' }}>New: <strong>{cvFile.name}</strong></div>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
