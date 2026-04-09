import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Pencil, Check, ListChecks, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { LIST_COLORS } from '../lib/taskHelpers';

function SortableListItem({ list, active, counts, editingId, editName, editRef, setEditName, startRename, commitRename, setEditingId, onSelect, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: list.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 px-2 py-2 cursor-pointer ${
        active ? 'bg-slate-800 text-sky-300' : 'text-slate-300 hover:bg-slate-800/60'
      }`}
      onClick={() => onSelect(list.id)}
    >
      <button
        className="flex-shrink-0 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: list.color || LIST_COLORS[0] }} />
      {editingId === list.id ? (
        <input
          ref={editRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={() => commitRename(list.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename(list.id);
            if (e.key === 'Escape') setEditingId(null);
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-slate-700 text-slate-100 rounded px-1.5 py-0.5 text-sm outline-none focus:ring-1 focus:ring-sky-500 min-w-0"
        />
      ) : (
        <span className="flex-1 truncate text-sm" onDoubleClick={(e) => startRename(e, list)}>{list.name}</span>
      )}
      {counts.overdue > 0 && (
        <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded-full">{counts.overdue}</span>
      )}
      {counts.active > 0 && (
        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">{counts.active}</span>
      )}
      {editingId === list.id ? (
        <button
          onClick={(e) => { e.stopPropagation(); commitRename(list.id); }}
          className="text-green-400 hover:text-green-300"
          aria-label="Confirm rename"
        >
          <Check size={14} />
        </button>
      ) : (
        <button
          onClick={(e) => startRename(e, list)}
          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-sky-400"
          aria-label="Rename list"
        >
          <Pencil size={14} />
        </button>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); if (confirm(`Delete list "${list.name}"?`)) onRemove(list.id); }}
        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400"
        aria-label="Delete list"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function Sidebar({ lists, currentId, onSelect, onAdd, onRemove, onRename, onReorder, taskCounts }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(LIST_COLORS[0]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const editRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  useEffect(() => {
    if (editingId && editRef.current) editRef.current.focus();
  }, [editingId]);

  const startRename = (e, l) => {
    e.stopPropagation();
    setEditingId(l.id);
    setEditName(l.name);
  };

  const commitRename = (id) => {
    if (editName.trim() && editName.trim() !== lists.find((l) => l.id === id)?.name) {
      onRename(id, editName.trim());
    }
    setEditingId(null);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), color);
    setName('');
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = lists.findIndex((l) => l.id === active.id);
    const newIndex = lists.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(lists, oldIndex, newIndex);
    onReorder(reordered.map((l) => l.id));
  };

  return (
    <aside className="h-full w-64 bg-slate-900 border-e border-slate-800 flex flex-col">
      <div className="px-4 py-4 flex items-center gap-2 text-slate-100 font-semibold border-b border-slate-800">
        <ListChecks size={20} className="text-sky-400" />
        Tasks Manager
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {lists.length === 0 && (
          <div className="text-slate-500 text-sm px-4 py-2">Loading…</div>
        )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
          <SortableContext items={lists.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            {lists.map((l) => (
              <SortableListItem
                key={l.id}
                list={l}
                active={currentId === l.id}
                counts={taskCounts[l.id] || { active: 0, overdue: 0 }}
                editingId={editingId}
                editName={editName}
                editRef={editRef}
                setEditName={setEditName}
                startRename={startRename}
                commitRename={commitRename}
                setEditingId={setEditingId}
                onSelect={onSelect}
                onRemove={onRemove}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <form onSubmit={submit} className="p-3 border-t border-slate-800 space-y-2">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New list…"
            className="flex-1 bg-slate-800 text-slate-100 placeholder-slate-500 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-sky-500"
          />
          <button type="submit" className="bg-sky-500 hover:bg-sky-400 text-white rounded-lg p-1.5" aria-label="Add list">
            <Plus size={16} />
          </button>
        </div>
        <div className="flex gap-1">
          {LIST_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-5 h-5 rounded-full transition ${color === c ? 'ring-2 ring-offset-1 ring-offset-slate-900 ring-white' : ''}`}
              style={{ background: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </form>
    </aside>
  );
}
