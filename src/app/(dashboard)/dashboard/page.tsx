export default function Dashboard() {
  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Good morning, Amine</div>
          <div className="page-sub">Here's your job search overview for today</div>
        </div>
        <div className="topbar-actions">
          <button className="btn-ghost">Notifications<span className="notif-badge">3</span></button>
          <button className="btn-primary">+ New application</button>
        </div>
      </div>
      <div className="content">
        <div className="stats-row">
          <div className="stat-card"><div className="stat-label">Applications</div><div className="stat-num">12</div><div className="stat-change"><span className="stat-dot" style={{background:'#635bff'}}></span><span className="text-[#1a7f5a]">+3 this week</span></div></div>
          <div className="stat-card"><div className="stat-label">In review</div><div className="stat-num">5</div><div className="stat-change"><span className="stat-dot" style={{background:'#f59e0b'}}></span>Active now</div></div>
          <div className="stat-card"><div className="stat-label">Interviews</div><div className="stat-num">2</div><div className="stat-change"><span className="stat-dot" style={{background:'#16a34a'}}></span><span className="text-[#1a7f5a]">Next: Tue</span></div></div>
          <div className="stat-card"><div className="stat-label">Profile views</div><div className="stat-num">87</div><div className="stat-change"><span className="stat-dot" style={{background:'#3b82f6'}}></span><span className="text-[#1a7f5a]">+24% this week</span></div></div>
        </div>
        <div className="grid2">
          <div className="card">
            <div className="card-title">Application pipeline</div>
            <div className="flex flex-col gap-[11px]">
              <div><div className="flex justify-between mb-1"><span className="text-xs text-[var(--muted)]">Submitted</span><span className="text-xs font-medium">12</span></div><div className="h-[3px] bg-[var(--surface3)] rounded"><div className="h-full rounded bg-[#635bff]" style={{width:'100%'}}></div></div></div>
              <div><div className="flex justify-between mb-1"><span className="text-xs text-[var(--muted)]">Under review</span><span className="text-xs font-medium">5</span></div><div className="h-[3px] bg-[var(--surface3)] rounded"><div className="h-full rounded bg-[#f59e0b]" style={{width:'42%'}}></div></div></div>
              <div><div className="flex justify-between mb-1"><span className="text-xs text-[var(--muted)]">Interview</span><span className="text-xs font-medium">2</span></div><div className="h-[3px] bg-[var(--surface3)] rounded"><div className="h-full rounded bg-[#16a34a]" style={{width:'17%'}}></div></div></div>
              <div><div className="flex justify-between mb-1"><span className="text-xs text-[var(--muted)]">Offer received</span><span className="text-xs font-medium">1</span></div><div className="h-[3px] bg-[var(--surface3)] rounded"><div className="h-full rounded bg-[#3b82f6]" style={{width:'8%'}}></div></div></div>
            </div>
          </div>
          <div className="card">
            <div className="card-title">Recommended for you</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5 p-[9px] bg-[var(--surface2)] rounded-lg border border-[var(--border)]">
                <div className="job-logo bg-[#fff5f6] text-[var(--accent)] text-xs">SN</div>
                <div className="flex-1"><div className="text-xs font-medium">Frontend Engineer</div><div className="text-[11px] text-[var(--muted)]">Sonatrach Digital</div></div>
                <span className="tag remote text-[10px]">Remote</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
