'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, User, Search, FileText, LogOut, Users, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<{first_name: string, last_name: string, role: string} | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) setProfile(data)
      }
    }
    loadProfile()
  }, [])

  const handleSignOut = async () => {
    const confirmSignOut = window.confirm('Are you sure you want to sign out?')
    if (confirmSignOut) {
      await supabase.auth.signOut()
      router.push('/')
    }
  }
  
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My profile', href: '/profile', icon: User },
    { name: 'Talent Community', href: '/talents', icon: Users },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
  ]
  
  const jobItems = [
    { name: 'Browse jobs', href: '/jobs', icon: Search },
    { name: 'My applications', href: '/applications', icon: FileText },
  ]

  return (
    <div className="sidebar">
      <div className="logo-area">
        <div className="logo">Talent<span>-DZ</span></div>
        <div className="tagline">Recruitment Platform</div>
      </div>
      <div className="nav">
        <div className="nav-section">Menu</div>
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
              <Icon className="nav-icon" />
              {item.name}
            </Link>
          )
        })}
        
        <div className="nav-section mt-1">Jobs</div>
        {jobItems.map(item => {
          const Icon = item.icon
          // If pathname starts with /apply, maybe highlight something, or keep it simple
          const isActive = pathname === item.href || (item.href === '/jobs' && pathname.startsWith('/apply'))
          return (
            <Link key={item.name} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
              <Icon className="nav-icon" />
              {item.name}
            </Link>
          )
        })}
        
        <div className="nav-section mt-1">Account</div>
        <div className="nav-item text-red-400 hover:text-red-300 cursor-pointer" onClick={handleSignOut}>
          <LogOut className="nav-icon" />
          Sign out
        </div>
      </div>
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="avatar-sm">
            {profile ? `${(profile.first_name || '')[0] || ''}${(profile.last_name || '')[0] || ''}`.toUpperCase() : '...'}
          </div>
          <div className="user-info">
            <p>{profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User' : 'Loading...'}</p>
            <span>{profile?.role === 'candidate' ? 'Candidate' : profile?.role || ''}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
