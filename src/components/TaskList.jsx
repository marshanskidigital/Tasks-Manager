import { useState } from 'react';
import { ChevronDown, ChevronLeft, Inbox } from 'lucide-react';
import TaskItem from './TaskItem.jsx';

export default function TaskList({ tasks, onSetStatus, onRemove, onOpen, onUpdate, onContextMenu }) {
  const [showCompleted, setShowCompleted] = useState(false);

  const active = tasks.filter((t) => t.status !== 'done');
  const completed = tasks.filter((t) => t.status === 'done');

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Inbox size={48} className="mb-3 opacity-50" />
        <div className="text-base">No tasks here yet</div>
        <div className="text-xs mt-1">Add your first task above to get started</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {active.length === 0 ? (
          <div className="text-slate-500 text-sm text-center py-6">All caught up. 🎉</div>
        ) : (
          active.map((t) => (
            <TaskItem key={t.id} task={t} onSetStatus={onSetStatus} onRemove={onRemove} onOpen={onOpen} onUpdate={onUpdate} onContextMenu={onContextMenu} />
          ))
        )}
      </div>

      {completed.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted((s) => !s)}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-sm mb-2"
          >
            {showCompleted ? <ChevronDown size={16} /> : <ChevronLeft size={16} />}
            Completed ({completed.length})
          </button>
          {showCompleted && (
            <div className="space-y-2 opacity-70">
              {completed.map((t) => (
                <TaskItem key={t.id} task={t} onSetStatus={onSetStatus} onRemove={onRemove} onOpen={onOpen} onUpdate={onUpdate} onContextMenu={onContextMenu} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
