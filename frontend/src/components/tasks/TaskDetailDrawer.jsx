import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Send, Trash2, Edit, Calendar, User, Flag, MessageSquare } from 'lucide-react'
import { taskAPI, commentAPI } from '../../lib/api'
import { PriorityBadge, StatusBadge } from '../ui/Badge'
import Avatar from '../ui/Avatar'
import { formatDate, isOverdue } from '../../lib/utils'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function TaskDetailDrawer({ taskId, onClose, onEdit }) {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const [comment, setComment] = useState('')

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskAPI.getById(taskId).then(r => r.data),
    enabled: !!taskId,
  })

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => commentAPI.getAll(taskId).then(r => r.data),
    enabled: !!taskId,
  })

  const addComment = useMutation({
    mutationFn: (data) => commentAPI.create(taskId, data),
    onSuccess: () => {
      qc.invalidateQueries(['comments', taskId])
      setComment('')
    },
    onError: () => toast.error('Failed to add comment'),
  })

  const deleteComment = useMutation({
    mutationFn: (cid) => commentAPI.delete(taskId, cid),
    onSuccess: () => qc.invalidateQueries(['comments', taskId]),
  })

  const handleComment = (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    addComment.mutate({ content: comment })
  }

  if (!taskId) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-dark-900 border-l border-dark-800 h-full overflow-y-auto
                       flex flex-col animate-slide-in-right shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-800 sticky top-0 bg-dark-900 z-10">
          <h2 className="text-base font-semibold text-dark-50">Task Details</h2>
          <div className="flex items-center gap-2">
            {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
              <button onClick={onEdit} className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-primary-400 transition-colors">
                <Edit size={16} />
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-dark-700 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : task ? (
          <div className="flex-1 p-5 space-y-6">
            {/* Title & Status */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-dark-50 leading-snug">{task.title}</h3>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                {isOverdue(task.dueDate) && task.status !== 'DONE' && (
                  <span className="badge bg-red-500/20 text-red-400">Overdue</span>
                )}
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <div className="bg-dark-800 rounded-xl p-4">
                <p className="text-dark-300 text-sm leading-relaxed">{task.description}</p>
              </div>
            )}

            {/* Meta */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-800 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-dark-500 text-xs">
                  <User size={12} /> Assignee
                </div>
                {task.assignee ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar user={task.assignee} size="sm" />
                    <span className="text-dark-200 text-sm font-medium truncate">{task.assignee.fullName}</span>
                  </div>
                ) : (
                  <p className="text-dark-500 text-sm">Unassigned</p>
                )}
              </div>
              <div className="bg-dark-800 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-dark-500 text-xs">
                  <Calendar size={12} /> Due Date
                </div>
                <p className={`text-sm font-medium ${isOverdue(task.dueDate) && task.status !== 'DONE' ? 'text-red-400' : 'text-dark-200'}`}>
                  {formatDate(task.dueDate)}
                </p>
              </div>
              <div className="bg-dark-800 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-dark-500 text-xs">
                  <User size={12} /> Created by
                </div>
                <p className="text-dark-200 text-sm font-medium">{task.createdBy?.fullName || '—'}</p>
              </div>
              <div className="bg-dark-800 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-dark-500 text-xs">
                  <Flag size={12} /> Created
                </div>
                <p className="text-dark-200 text-sm">{formatDate(task.createdAt)}</p>
              </div>
            </div>

            {/* Comments */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={15} className="text-dark-400" />
                <h4 className="text-sm font-semibold text-dark-200">Comments ({comments.length})</h4>
              </div>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-dark-500 text-sm text-center py-4">No comments yet. Be the first!</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="flex gap-3 group">
                      <Avatar user={c.user} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-dark-300">{c.user?.fullName}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-dark-600">{formatDate(c.createdAt)}</span>
                            {user?.role === 'ADMIN' && (
                              <button
                                onClick={() => deleteComment.mutate(c.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20
                                           text-dark-500 hover:text-red-400 transition-all"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-dark-300 text-sm mt-0.5 bg-dark-800 rounded-lg p-2.5">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleComment} className="flex gap-2">
                <Avatar user={user} size="sm" />
                <div className="flex-1 flex gap-2">
                  <input
                    className="input text-sm flex-1"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Add a comment..."
                  />
                  <button type="submit" disabled={addComment.isPending || !comment.trim()}
                    className="btn-primary px-3">
                    <Send size={14} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}