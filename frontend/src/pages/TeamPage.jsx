import { useQuery } from '@tanstack/react-query'
import { userAPI, taskAPI } from '../lib/api'
import Header from '../components/layout/Header'
import { PageLoader } from '../components/ui/Spinner'
import Avatar from '../components/ui/Avatar'
import { RoleBadge, StatusBadge } from '../components/ui/Badge'
import { CheckCircle2, Clock, ListTodo } from 'lucide-react'

export default function TeamPage() {
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userAPI.getAll().then(r => r.data),
  })

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskAPI.getAll().then(r => r.data),
  })

  const isLoading = usersLoading || tasksLoading

  const getUserStats = (userId) => {
    const userTasks = tasks.filter(t => t.assignee?.id === userId)
    return {
      total:      userTasks.length,
      done:       userTasks.filter(t => t.status === 'DONE').length,
      inProgress: userTasks.filter(t => t.status === 'IN_PROGRESS').length,
      todo:       userTasks.filter(t => t.status === 'TODO').length,
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Team" subtitle={`${users.length} member${users.length !== 1 ? 's' : ''}`} />

      <main className="flex-1 p-6">
        {isLoading ? <PageLoader /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {users.map(user => {
              const stats = getUserStats(user.id)
              const completion = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0

              return (
                <div key={user.id} className="card p-5 hover:border-dark-600 transition-colors">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar user={user} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-dark-50 truncate">{user.fullName}</p>
                      <p className="text-dark-500 text-xs truncate">{user.email}</p>
                      <div className="mt-1.5">
                        <RoleBadge role={user.role} />
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-dark-800 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <ListTodo size={12} className="text-dark-400" />
                      </div>
                      <p className="text-xl font-bold text-dark-100">{stats.total}</p>
                      <p className="text-xs text-dark-500">Total</p>
                    </div>
                    <div className="bg-dark-800 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock size={12} className="text-blue-400" />
                      </div>
                      <p className="text-xl font-bold text-blue-400">{stats.inProgress}</p>
                      <p className="text-xs text-dark-500">Active</p>
                    </div>
                    <div className="bg-dark-800 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <CheckCircle2 size={12} className="text-green-400" />
                      </div>
                      <p className="text-xl font-bold text-green-400">{stats.done}</p>
                      <p className="text-xs text-dark-500">Done</p>
                    </div>
                  </div>

                  {/* Completion Rate */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-dark-500">Completion rate</span>
                      <span className="text-xs font-bold text-dark-300">{completion}%</span>
                    </div>
                    <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-600 to-green-500 transition-all duration-500"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}

            {users.length === 0 && (
              <div className="col-span-3 text-center py-16 text-dark-500">
                No team members found.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}