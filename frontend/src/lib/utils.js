import { clsx } from 'clsx'

export const cn = (...args) => clsx(args)

export const PRIORITY_CONFIG = {
  LOW:    { label: 'Low',    color: 'bg-slate-500/20 text-slate-400',  dot: 'bg-slate-400' },
  MEDIUM: { label: 'Medium', color: 'bg-blue-500/20 text-blue-400',    dot: 'bg-blue-400' },
  HIGH:   { label: 'High',   color: 'bg-orange-500/20 text-orange-400',dot: 'bg-orange-400' },
  URGENT: { label: 'Urgent', color: 'bg-red-500/20 text-red-400',      dot: 'bg-red-400' },
}

export const STATUS_CONFIG = {
  TODO:        { label: 'To Do',       color: 'bg-slate-500/20 text-slate-400',   border: 'border-slate-500/30' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400',     border: 'border-blue-500/30' },
  IN_REVIEW:   { label: 'In Review',   color: 'bg-yellow-500/20 text-yellow-400', border: 'border-yellow-500/30' },
  DONE:        { label: 'Done',        color: 'bg-green-500/20 text-green-400',   border: 'border-green-500/30' },
}

export const ROLE_CONFIG = {
  ADMIN:  { label: 'Admin',  color: 'bg-purple-500/20 text-purple-400' },
  EDITOR: { label: 'Editor', color: 'bg-blue-500/20 text-blue-400' },
  VIEWER: { label: 'Viewer', color: 'bg-slate-500/20 text-slate-400' },
}

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const isOverdue = (dueDate) => {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

export const AVATAR_COLORS = [
  'bg-violet-500', 'bg-blue-500', 'bg-cyan-500',
  'bg-teal-500', 'bg-green-500', 'bg-amber-500',
  'bg-orange-500', 'bg-rose-500', 'bg-pink-500',
]

export const getAvatarColor = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length]