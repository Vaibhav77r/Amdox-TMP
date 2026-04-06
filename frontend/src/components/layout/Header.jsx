import { Bell, Search } from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../../store/authStore'
import { RoleBadge } from '../ui/Badge'

export default function Header({ title, subtitle }) {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')

  return (
    <header className="h-16 bg-dark-950/80 backdrop-blur-sm border-b border-dark-800 sticky top-0 z-30
                        flex items-center justify-between px-6 gap-4">
      <div>
        <h1 className="text-lg font-bold text-dark-50 leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-dark-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="bg-dark-800 border border-dark-700 rounded-xl pl-9 pr-4 py-2 text-sm
                       text-dark-200 placeholder-dark-500 focus:outline-none focus:ring-2
                       focus:ring-primary-500 w-52 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl bg-dark-800 border border-dark-700
                           flex items-center justify-center text-dark-400 hover:text-dark-200
                           hover:bg-dark-700 transition-all">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500" />
        </button>

        {/* Role badge */}
        <RoleBadge role={user?.role} />
      </div>
    </header>
  )
}