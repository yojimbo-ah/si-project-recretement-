'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, User, Search, FileText, LogOut, Users, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<{first_name: string, last_name: string, role: string} | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) {
          setProfile(data)
        } else {
          // Fallback si le profil n'existe pas encore dans la table
          setProfile({
            first_name: user.email?.split('@')[0] || 'User',
            last_name: '',
            role: 'candidate'
          })
        }
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

  const handleLinkClick = () => {
    if (onNavigate) onNavigate()
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
        <div className="nav-section">MAIN MENU</div>
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <Icon className="nav-icon" />
              <span>{item.name}</span>
            </Link>
          )
        })}
        
        <div className="nav-section mt-4">JOBS & APPLICATIONS</div>
        {jobItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href === '/jobs' && pathname.startsWith('/apply'))
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <Icon className="nav-icon" />
              <span>{item.name}</span>
            </Link>
          )
        })}

        <div className="nav-section mt-4">ACCOUNT</div>
        <div className="nav-item text-red-500 hover:text-red-600 cursor-pointer" onClick={handleSignOut}>
          <LogOut className="nav-icon" />
          <span>Sign out</span>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="avatar-sm">
            {profile ? `${(profile.first_name || '')[0] || ''}${(profile.last_name || '')[0] || ''}`.toUpperCase() : '??'}
          </div>
          <div className="user-info">
            <p>{profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Guest User'}</p>
            <span>Candidate</span>
          </div>
        </div>
      </div>
    </div>
  )
}
