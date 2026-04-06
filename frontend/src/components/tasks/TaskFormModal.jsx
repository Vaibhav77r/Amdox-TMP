import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskAPI, userAPI } from '../../lib/api'
import Modal from '../ui/Modal'
import toast from 'react-hot-toast'

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
const STATUSES   = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']

export default function TaskFormModal({ isOpen, onClose, task = null }) {
  const qc = useQueryClient()
  const isEdit = !!task

  const [form, setForm] = useState({
    title: '', description: '', priority: 'MEDIUM',
    status: 'TODO', dueDate: '', assigneeId: '',
  })

  useEffect(() => {
    if (task) {
      setForm({
        title:      task.title || '',
        description:task.description || '',
        priority:   task.priority || 'MEDIUM',
        status:     task.status || 'TODO',
        dueDate:    task.dueDate ? task.dueDate.slice(0, 16) : '',
        assigneeId: task.assignee?.id || '',
      })
    } else {
      setForm({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', assigneeId: '' })
    }
  }, [task, isOpen])

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => userAPI.getAll().then(r => r.data),
    enabled: isOpen,
  })

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? taskAPI.update(task.id, data)
      : taskAPI.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['tasks'])
      qc.invalidateQueries(['kanban'])
      qc.invalidateQueries(['stats'])
      toast.success(isEdit ? 'Task updated!' : 'Task created!')
      onClose()
    },
    onError: () => toast.error('Something went wrong'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    mutation.mutate({
      ...form,
      dueDate:    form.dueDate || null,
      assigneeId: form.assigneeId || null,
    })
  }

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Task' : 'Create New Task'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="label">Title *</label>
          <input className="input" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="Enter task title..." required />
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none" rows={3} value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Describe the task..." />
        </div>

        {/* Priority & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {isEdit && (
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          )}
          {!isEdit && (
            <div>
              <label className="label">Due Date</label>
              <input type="datetime-local" className="input" value={form.dueDate}
                onChange={e => set('dueDate', e.target.value)} />
            </div>
          )}
        </div>

        {/* Due Date (edit mode) */}
        {isEdit && (
          <div>
            <label className="label">Due Date</label>
            <input type="datetime-local" className="input" value={form.dueDate}
              onChange={e => set('dueDate', e.target.value)} />
          </div>
        )}

        {/* Assignee */}
        <div>
          <label className="label">Assign To</label>
          <select className="input" value={form.assigneeId} onChange={e => set('assigneeId', e.target.value)}>
            <option value="">Unassigned</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  )
}