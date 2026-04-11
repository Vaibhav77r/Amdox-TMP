import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskAPI } from '../lib/api'
import Header from '../components/layout/Header'
import { PageLoader } from '../components/ui/Spinner'
import TaskFormModal from '../components/tasks/TaskFormModal'
import TaskDetailDrawer from '../components/tasks/TaskDetailDrawer'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { PriorityBadge, StatusBadge } from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import { formatDate, isOverdue } from '../lib/utils'
import { Plus, Filter, Calendar, Trash2, Eye } from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const STATUSES   = ['ALL', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']
const PRIORITIES = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'URGENT']

export default function TasksPage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTask,   setEditTask]   = useState(null)
  const [detailId,   setDetailId]   = useState(null)
  const [deleteTask, setDeleteTask] = useState(null)
  const [filterStatus,   setFilterStatus]   = useState('ALL')
  const [filterPriority, setFilterPriority] = useState('ALL')
  const [search, setSearch] = useState('')

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskAPI.getAll().then(r => r.data),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => taskAPI.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['kanban'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      setDeleteTask(null)
      toast.success('Task deleted')
    },
  })

  const filtered = tasks.filter(t => {
    const matchStatus   = filterStatus   === 'ALL' || t.status   === filterStatus
    const matchPriority = filterPriority === 'ALL' || t.priority === filterPriority
    const matchSearch   = !search || t.title.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchPriority && matchSearch
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="All Tasks" subtitle={`${filtered.length} task${filtered.length !== 1 ? 's' : ''}`} />

      <main className="flex-1 p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="input w-52 text-sm"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-dark-500" />
            {STATUSES.map(s => (
              <button key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${filterStatus === s
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-800 text-dark-400 hover:text-dark-200'}`}>
                {s === 'ALL' ? 'All Status' : s.replace('_', ' ')}
              </button>
            ))}
          </div>

          {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
            <button
              onClick={() => setCreateOpen(true)}
              className="btn-primary ml-auto flex items-center gap-2">
              <Plus size={16} /> New Task
            </button>
          )}
        </div>

        {/* Priority filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {PRIORITIES.map(p => (
            <button key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all
                ${filterPriority === p
                  ? 'bg-dark-700 text-dark-100 border border-dark-500'
                  : 'text-dark-500 hover:text-dark-300'}`}>
              {p === 'ALL' ? 'All Priorities' : p}
            </button>
          ))}
        </div>

        {/* Table */}
        {isLoading ? <PageLoader /> : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-800">
                    {['Task', 'Status', 'Priority', 'Assignee', 'Due Date', 'Actions'].map(h => (
                      <th key={h}
                        className="text-left px-5 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-dark-500">
                        {tasks.length === 0
                          ? 'No tasks yet. Create your first task!'
                          : 'No tasks match your filters.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map(task => (
                      <tr key={task.id}
                        className="hover:bg-dark-800/40 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="max-w-xs">
                            <p className="font-semibold text-dark-100 truncate">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-dark-500 truncate mt-0.5">{task.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4"><StatusBadge status={task.status} /></td>
                        <td className="px-5 py-4"><PriorityBadge priority={task.priority} /></td>
                        <td className="px-5 py-4">
                          {task.assignee ? (
                            <div className="flex items-center gap-2">
                              <Avatar user={task.assignee} size="sm" />
                              <span className="text-dark-300 text-xs">{task.assignee.fullName}</span>
                            </div>
                          ) : (
                            <span className="text-dark-600 text-xs">Unassigned</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`flex items-center gap-1.5 text-xs
                            ${isOverdue(task.dueDate) && task.status !== 'DONE'
                              ? 'text-red-400' : 'text-dark-400'}`}>
                            <Calendar size={11} />
                            {formatDate(task.dueDate)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setDetailId(task.id)}
                              className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-primary-400 transition-colors">
                              <Eye size={14} />
                            </button>
                            {user?.role === 'ADMIN' && (
                              <button
                                onClick={() => setDeleteTask(task)}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-dark-400 hover:text-red-400 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <TaskFormModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      <TaskFormModal
        isOpen={!!editTask}
        onClose={() => setEditTask(null)}
        task={editTask}
      />
      <TaskDetailDrawer
        taskId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={() => {
          setEditTask(tasks.find(t => t.id === detailId))
          setDetailId(null)
        }}
      />
      <ConfirmDialog
        isOpen={!!deleteTask}
        onClose={() => setDeleteTask(null)}
        onConfirm={() => deleteMutation.mutate(deleteTask?.id)}
        loading={deleteMutation.isPending}
        title="Delete Task?"
        message={`"${deleteTask?.title}" will be permanently deleted.`}
      />
    </div>
  )
}