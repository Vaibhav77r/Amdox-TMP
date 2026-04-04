import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { taskAPI } from '../lib/api'
import Header from '../components/layout/Header'
import { PageLoader } from '../components/ui/Spinner'
import TaskCard from '../components/tasks/TaskCard'
import TaskFormModal from '../components/tasks/TaskFormModal'
import TaskDetailDrawer from '../components/tasks/TaskDetailDrawer'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Plus } from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const COLUMNS = [
  { key: 'todo',       status: 'TODO',        label: 'To Do',       color: 'border-slate-500/30',  dot: 'bg-slate-400' },
  { key: 'inProgress', status: 'IN_PROGRESS',  label: 'In Progress', color: 'border-blue-500/30',   dot: 'bg-blue-400' },
  { key: 'inReview',   status: 'IN_REVIEW',    label: 'In Review',   color: 'border-yellow-500/30', dot: 'bg-yellow-400' },
  { key: 'done',       status: 'DONE',         label: 'Done',        color: 'border-green-500/30',  dot: 'bg-green-400' },
]

export default function KanbanPage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTask,   setEditTask]   = useState(null)
  const [detailId,   setDetailId]   = useState(null)
  const [deleteTask, setDeleteTask] = useState(null)

  const { data: kanban, isLoading } = useQuery({
    queryKey: ['kanban'],
    queryFn: () => taskAPI.getKanban().then(r => r.data),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => taskAPI.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries(['kanban'])
      qc.invalidateQueries(['tasks'])
      qc.invalidateQueries(['stats'])
    },
    onError: () => toast.error('Failed to update status'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => taskAPI.delete(id),
    onSuccess: () => {
      qc.invalidateQueries(['kanban'])
      qc.invalidateQueries(['tasks'])
      qc.invalidateQueries(['stats'])
      setDeleteTask(null)
      toast.success('Task deleted')
    },
  })

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = COLUMNS.find(c => c.key === destination.droppableId)?.status
    if (newStatus) {
      statusMutation.mutate({ id: parseInt(draggableId), status: newStatus })
    }
  }

  const getColumnTasks = (key) => {
    if (!kanban) return []
    const map = { todo: kanban.todo, inProgress: kanban.inProgress, inReview: kanban.inReview, done: kanban.done }
    return map[key] || []
  }

  const totalTasks = kanban
    ? (kanban.todo?.length || 0) + (kanban.inProgress?.length || 0) + (kanban.inReview?.length || 0) + (kanban.done?.length || 0)
    : 0

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Kanban Board" subtitle={`${totalTasks} total tasks`} />

      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-dark-400 text-sm">Drag and drop tasks between columns to update their status.</p>
          {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
            <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> New Task
            </button>
          )}
        </div>

        {isLoading ? <PageLoader /> : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
              {COLUMNS.map(col => {
                const colTasks = getColumnTasks(col.key)
                return (
                  <div key={col.key}
                    className={`bg-dark-900/50 border ${col.color} rounded-2xl flex flex-col`}>
                    {/* Column header */}
                    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-dark-800">
                      <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                      <span className="text-sm font-semibold text-dark-200 flex-1">{col.label}</span>
                      <span className="w-6 h-6 rounded-lg bg-dark-800 flex items-center justify-center
                                       text-xs font-bold text-dark-400">
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Tasks */}
                    <Droppable droppableId={col.key}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-3 space-y-3 min-h-24 transition-colors rounded-b-2xl
                            ${snapshot.isDraggingOver ? 'bg-primary-500/5' : ''}`}
                        >
                          {colTasks.map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={String(task.id)}
                              index={index}
                              isDragDisabled={user?.role === 'VIEWER'}
                            >
                              {(provided) => (
                                <TaskCard
                                  task={task}
                                  provided={provided}
                                  onClick={(t) => setDetailId(t.id)}
                                  onDelete={(t) => setDeleteTask(t)}
                                />
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}

                          {colTasks.length === 0 && (
                            <div className="text-center py-6">
                              <p className="text-dark-600 text-xs">Drop tasks here</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )
              })}
            </div>
          </DragDropContext>
        )}
      </main>

      <TaskFormModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      <TaskFormModal isOpen={!!editTask} onClose={() => setEditTask(null)} task={editTask} />
      <TaskDetailDrawer
        taskId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={() => {
          const all = [...(kanban?.todo||[]), ...(kanban?.inProgress||[]), ...(kanban?.inReview||[]), ...(kanban?.done||[])]
          setEditTask(all.find(t => t.id === detailId))
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