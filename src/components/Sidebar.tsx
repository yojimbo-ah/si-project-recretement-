'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, User, Search, FileText, LogOut } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My profile', href: '/profile', icon: User },
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
        <div className="nav-item text-red-400 hover:text-red-300">
          <LogOut className="nav-icon" />
          Sign out
        </div>
      </div>
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="avatar-sm">AM</div>
          <div className="user-info">
            <p>Amine Meziani</p>
            <span>Frontend Dev</span>
          </div>
        </div>
      </div>
    </div>
  )
}
