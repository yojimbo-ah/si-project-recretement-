'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { Menu, X } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={`app ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Bouton mobile uniquement (absolute pour ne pas casser la grille) */}
      <button 
        className="mobile-toggle btn-ghost" 
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1100, display: 'none' }}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar (Premier enfant de la grille .app) */}
      <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content (Deuxième enfant de la grille .app) */}
      <div className="main">
        {children}
      </div>
    </div>
  )
}
