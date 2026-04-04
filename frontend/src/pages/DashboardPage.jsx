import { useQuery } from '@tanstack/react-query'
import { dashboardAPI, taskAPI } from '../lib/api'
import Header from '../components/layout/Header'
import { PageLoader } from '../components/ui/Spinner'
import { CheckCircle2, Clock, Eye, Users, TrendingUp, ListTodo } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { PriorityBadge, StatusBadge } from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import { formatDate } from '../lib/utils'
import useAuthStore from '../store/authStore'

const PIE_COLORS = ['#64748b', '#6366f1', '#f59e0b', '#22c55e']

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => dashboardAPI.getStats().then(r => r.data),
  })

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskAPI.getAll().then(r => r.data),
  })

  const isLoading = statsLoading || tasksLoading

  const statCards = stats ? [
    { label: 'Total Tasks',    value: stats.totalTasks,      icon: ListTodo,     color: 'text-primary-400',  bg: 'bg-primary-500/10' },
    { label: 'In Progress',    value: stats.inProgressTasks, icon: Clock,        color: 'text-blue-400',     bg: 'bg-blue-500/10' },
    { label: 'Completed',      value: stats.completedTasks,  icon: CheckCircle2, color: 'text-green-400',    bg: 'bg-green-500/10' },
    { label: 'Team Members',   value: stats.totalMembers,    icon: Users,        color: 'text-purple-400',   bg: 'bg-purple-500/10' },
  ] : []

  const pieData = stats ? [
    { name: 'To Do',       value: stats.tasksByStatus?.TODO        || 0 },
    { name: 'In Progress', value: stats.tasksByStatus?.IN_PROGRESS || 0 },
    { name: 'In Review',   value: stats.tasksByStatus?.IN_REVIEW   || 0 },
    { name: 'Done',        value: stats.tasksByStatus?.DONE        || 0 },
  ] : []

  const priorityCounts = tasks.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1
    return acc
  }, {})
  const barData = Object.entries(priorityCounts).map(([k, v]) => ({ name: k, count: v }))

  const recentTasks = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Dashboard" subtitle={`Good to see you, ${user?.fullName?.split(' ')[0]} 👋`} />

      <main className="flex-1 p-6 space-y-6">
        {isLoading ? <PageLoader /> : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="card p-5 flex items-center gap-4">
                  <div className={`${bg} p-3 rounded-xl`}>
                    <Icon size={22} className={color} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dark-50">{value}</p>
                    <p className="text-dark-400 text-xs mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Completion Rate Banner */}
            {stats && (
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-green-400" />
                    <span className="text-sm font-semibold text-dark-200">Overall Completion Rate</span>
                  </div>
                  <span className="text-lg font-bold text-green-400">
                    {stats.completionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-dark-800 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-primary-600 to-green-500 transition-all duration-700"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Pie Chart */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-dark-200 mb-4">Tasks by Status</h3>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                        dataKey="value" paddingAngle={3}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 flex-1">
                    {pieData.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                          <span className="text-xs text-dark-400">{d.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-dark-200">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-dark-200 mb-4">Tasks by Priority</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={barData} barSize={32}>
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, fontSize: 12 }}
                      cursor={{ fill: 'rgba(99,102,241,0.1)' }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="card">
              <div className="p-5 border-b border-dark-800">
                <h3 className="text-sm font-semibold text-dark-200">Recent Tasks</h3>
              </div>
              <div className="divide-y divide-dark-800">
                {recentTasks.length === 0 ? (
                  <p className="text-dark-500 text-sm text-center py-8">No tasks yet. Create your first task!</p>
                ) : (
                  recentTasks.map(task => (
                    <div key={task.id} className="p-4 flex items-center gap-4 hover:bg-dark-800/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-dark-100 truncate">{task.title}</p>
                        <p className="text-xs text-dark-500 mt-0.5">{formatDate(task.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <PriorityBadge priority={task.priority} />
                        <StatusBadge status={task.status} />
                        {task.assignee && <Avatar user={task.assignee} size="sm" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}