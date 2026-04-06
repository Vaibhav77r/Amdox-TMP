import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CheckSquare, Kanban, Users,
  LogOut, ChevronRight, Zap
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import Avatar from '../ui/Avatar'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks',     icon: CheckSquare,     label: 'All Tasks' },
  { to: '/kanban',    icon: Kanban,          label: 'Kanban Board' },
  { to: '/team',      icon: Users,           label: 'Team' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-dark-950 border-r border-dark-800 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-dark-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-dark-50 leading-none">Amdox</p>
            <p className="text-dark-500 text-xs">Task Manager</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
               ${isActive
                 ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                 : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800'
               }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-dark-800">
        <div className="flex items-center gap-3 mb-3">
          <Avatar user={user} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-dark-100 truncate">{user?.fullName}</p>
            <p className="text-xs text-dark-500 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-dark-400
                     hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}