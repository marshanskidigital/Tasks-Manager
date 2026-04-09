import {
  DndContext, DragOverlay, PointerSensor, TouchSensor,
  useSensor, useSensors, useDroppable, closestCorners
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import KanbanCard from './KanbanCard.jsx';
import { STATUSES, STATUS_LABELS } from '../lib/taskHelpers';

const COLUMN_ACCENT = {
  todo: 'border-slate-700',
  doing: 'border-amber-500/40',
  done: 'border-emerald-500/40'
};
const COLUMN_HEADER = {
  todo: 'text-slate-300',
  doing: 'text-amber-300',
  done: 'text-emerald-300'
};

function Column({ status, tasks, onSetStatus, onOpen, onUpdate, onContextMenu }) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${status}` });
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[260px] bg-slate-900/40 border rounded-xl p-3 flex flex-col ${COLUMN_ACCENT[status]} ${
        isOver ? 'ring-2 ring-sky-500/40' : ''
      }`}
    >
      <div className={`flex items-center justify-between mb-3 px-1 ${COLUMN_HEADER[status]}`}>
        <span className="text-sm font-semibold uppercase tracking-wider">{STATUS_LABELS[status]}</span>
        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 flex-1 min-h-[80px]">
          {tasks.map((t) => (
            <KanbanCard key={t.id} task={t} onSetStatus={onSetStatus} onOpen={onOpen} onUpdate={onUpdate} onContextMenu={onContextMenu} />
          ))}
          {tasks.length === 0 && (
            <div className="text-xs text-slate-600 text-center py-4 border border-dashed border-slate-800 rounded-lg">
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard({ tasks, onSetStatus, onOpen, onUpdate, onContextMenu }) {
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const byStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s);
    return acc;
  }, {});

  const onDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;
    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;
    let targetStatus;
    if (typeof over.id === 'string' && over.id.startsWith('col-')) {
      targetStatus = over.id.slice(4);
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      targetStatus = overTask?.status;
    }
    if (targetStatus && targetStatus !== task.status) {
      onSetStatus(task, targetStatus);
    }
  };

  const activeTask = tasks.find((t) => t.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1 snap-x">
        {STATUSES.map((s) => (
          <Column key={s} status={s} tasks={byStatus[s]} onSetStatus={onSetStatus} onOpen={onOpen} onUpdate={onUpdate} onContextMenu={onContextMenu} />
        ))}
      </div>
      <DragOverlay>
        {activeTask && <KanbanCard task={activeTask} onSetStatus={() => {}} onOpen={() => {}} />}
      </DragOverlay>
    </DndContext>
  );
}
