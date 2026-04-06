import { PRIORITY_CONFIG, STATUS_CONFIG } from '../../lib/utils'

export function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || {}
  return (
    <span className={`badge ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || {}
  return <span className={`badge ${cfg.color}`}>{cfg.label}</span>
}

export function RoleBadge({ role }) {
  const map = {
    ADMIN:  'bg-purple-500/20 text-purple-400',
    EDITOR: 'bg-blue-500/20 text-blue-400',
    VIEWER: 'bg-slate-500/20 text-slate-400',
  }
  return <span className={`badge ${map[role] || ''}`}>{role}</span>
}