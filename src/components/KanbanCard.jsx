import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, StickyNote, Image, Check } from 'lucide-react';
import { format } from 'date-fns';
import TaskCheckCircle from './TaskCheckCircle.jsx';
import { PRIORITY_COLORS } from './PriorityPicker.jsx';
import { isOverdue, isDueToday, toDate } from '../lib/taskHelpers';

export default function KanbanCard({ task, onSetStatus, onOpen, onUpdate, onContextMenu }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1
  };
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
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu?.(task, e); }}
      className={`bg-slate-900 hover:bg-slate-800/80 border rounded-xl p-3 cursor-grab active:cursor-grabbing space-y-2 ${
        overdue ? 'border-red-500/40' : 'border-slate-800'
      }`}
    >
      <div className="flex items-start gap-2">
        <TaskCheckCircle status={task.status} onChange={(s) => onSetStatus(task, s)} size={18} />
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 text-sm bg-transparent text-slate-100 outline-none border-b border-slate-600 focus:border-sky-500 pb-0.5"
          />
        ) : (
          <div
            onClick={handleTitleClick}
            onPointerDown={(e) => e.stopPropagation()}
            className={`flex-1 text-sm text-slate-100 break-words ${task.status === 'done' ? 'line-through text-slate-500' : ''}`}
          >
            {task.title}
          </div>
        )}
      </div>

      {(task.priority !== 'none' || due || task.tags?.length > 0 || task.notes || task.photos?.length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5 ps-6">
          {task.priority !== 'none' && (
            <span className={`text-[10px] uppercase font-bold ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
          )}
          {due && (
            <span className={`text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded-full ${
              overdue ? 'bg-red-500/20 text-red-300' : dueToday ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
            }`}>
              <Calendar size={9} /> {format(due, 'MMM d')}
            </span>
          )}
          {task.tags?.map((t) => (
            <span key={t} className="text-[10px] bg-slate-800 text-sky-300 px-1.5 py-0.5 rounded-full">#{t}</span>
          ))}
          {task.photos?.length > 0 && (
            <span className="text-[10px] flex items-center gap-1 bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">
              <Image size={9} /> {task.photos.length}
            </span>
          )}
          {task.notes && <StickyNote size={11} className="text-slate-500" />}
        </div>
      )}
      {task.status === 'done' && toDate(task.completedAt) && (
        <div className="text-[10px] text-slate-500 ps-6 flex items-center gap-1">
          <Check size={9} /> Completed {format(toDate(task.completedAt), 'MMM d, h:mm a')}
        </div>
      )}
    </div>
  );
}
