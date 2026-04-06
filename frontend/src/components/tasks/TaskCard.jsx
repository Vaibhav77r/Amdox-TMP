import { Calendar, MessageSquare, Trash2 } from 'lucide-react'
import { PriorityBadge } from '../ui/Badge'
import Avatar from '../ui/Avatar'
import { formatDate, isOverdue } from '../../lib/utils'
import useAuthStore from '../../store/authStore'

export default function TaskCard({ task, onClick, onDelete, provided }) {
  const { user } = useAuthStore()
  const overdue = isOverdue(task.dueDate) && task.status !== 'DONE'

  return (
    <div
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      onClick={() => onClick(task)}
      className="card p-4 cursor-pointer hover:border-dark-600 hover:bg-dark-800/50
                 transition-all duration-150 group animate-fade-in"
    >
      {/* Priority */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <PriorityBadge priority={task.priority} />
        {user?.role === 'ADMIN' && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(task) }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/20
                       text-dark-500 hover:text-red-400 transition-all"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Title */}
      <p className="text-dark-100 font-semibold text-sm leading-snug mb-3 line-clamp-2">{task.title}</p>

      {/* Description */}
      {task.description && (
        <p className="text-dark-500 text-xs line-clamp-2 mb-3">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-dark-800">
        <div className="flex items-center gap-2">
          {task.assignee && <Avatar user={task.assignee} size="sm" />}
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-400' : 'text-dark-500'}`}>
              <Calendar size={11} />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
        {task.commentCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-dark-500">
            <MessageSquare size={11} />
            {task.commentCount}
          </span>
        )}
      </div>
    </div>
  )
}