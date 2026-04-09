import { useState, useRef, useEffect } from 'react';
import { Trash2, StickyNote, Calendar, Image } from 'lucide-react';
import { format } from 'date-fns';
import TaskCheckCircle from './TaskCheckCircle.jsx';
import { PRIORITY_COLORS } from './PriorityPicker.jsx';
import { isOverdue, isDueToday, toDate } from '../lib/taskHelpers';

export default function TaskItem({ task, onSetStatus, onRemove, onOpen, onUpdate, onContextMenu }) {
  const overdue = isOverdue(task);
  const dueToday = isDueToday(task);
  const due = toDate(task.dueDate);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleTitleClick = (e) => {
    e.stopPropagation();
    setEditValue(task.title);
    setIsEditing(true);
  };

  const saveTitle = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdate(task.id, { title: trimmed });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTitle();
    } else if (e.key === 'Escape') {
      setEditValue(task.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      onClick={() => onOpen(task)}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu?.(task, e); }}
      className={`group flex items-start gap-3 bg-slate-900 hover:bg-slate-800/80 border rounded-xl p-3 cursor-pointer transition ${
        overdue ? 'border-red-500/40' : 'border-slate-800'
      }`}
    >
      <div className="mt-0.5">
        <TaskCheckCircle status={task.status} onChange={(s) => onSetStatus(task, s)} />
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent text-slate-100 outline-none border-b border-slate-600 focus:border-sky-500 pb-0.5"
          />
        ) : (
          <div
            onClick={handleTitleClick}
            className={`text-slate-100 break-words ${task.status === 'done' ? 'line-through text-slate-500' : ''}`}
          >
            {task.title}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          {task.priority && task.priority !== 'none' && (
            <span className={`text-[10px] uppercase tracking-wide font-bold ${PRIORITY_COLORS[task.priority]}`}>
              {task.priority}
            </span>
          )}
          {due && (
            <span className={`text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-full ${
              overdue ? 'bg-red-500/20 text-red-300' : dueToday ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
            }`}>
              <Calendar size={10} /> {format(due, 'MMM d')}
            </span>
          )}
          {task.tags?.map((t) => (
            <span key={t} className="text-[11px] bg-slate-800 text-sky-300 px-2 py-0.5 rounded-full">#{t}</span>
          ))}
          {task.photos?.length > 0 && (
            <span className="text-[11px] flex items-center gap-1 bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              <Image size={10} /> {task.photos.length}
            </span>
          )}
          {task.notes && <StickyNote size={12} className="text-slate-500" />}
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onRemove(task); }}
        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition p-1"
        aria-label="Delete task"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
