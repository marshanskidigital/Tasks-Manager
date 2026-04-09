import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Plus, Pencil, Check } from 'lucide-react';
import { LIST_COLORS } from '../lib/taskHelpers';

export default function MobileListSwitcher({ lists, currentId, onSelect, onAdd, onRename, taskCounts }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(LIST_COLORS[0]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const editRef = useRef(null);
  const current = lists.find((l) => l.id === currentId);

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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full px-3 py-1.5 text-sm text-slate-100"
      >
        {current && <span className="w-2 h-2 rounded-full" style={{ background: current.color || LIST_COLORS[0] }} />}
        <span className="truncate max-w-[140px]">{current?.name || 'Pick a list'}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 rounded-t-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <span className="text-slate-100 font-semibold">Lists</span>
              <button onClick={() => setOpen(false)} className="text-slate-400 p-1"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-1">
              {lists.map((l) => {
                const counts = taskCounts[l.id] || { active: 0, overdue: 0 };
                return (
                  <div
                    key={l.id}
                    onClick={() => { if (editingId !== l.id) { onSelect(l.id); setOpen(false); } }}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-start cursor-pointer ${
                      currentId === l.id ? 'bg-slate-800 text-sky-300' : 'text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color || LIST_COLORS[0] }} />
                    {editingId === l.id ? (
                      <input
                        ref={editRef}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => commitRename(l.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitRename(l.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-slate-700 text-slate-100 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-sky-500 min-w-0"
                      />
                    ) : (
                      <span className="flex-1 truncate">{l.name}</span>
                    )}
                    {counts.overdue > 0 && (
                      <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded-full">{counts.overdue}</span>
                    )}
                    <span className="text-xs text-slate-500">{counts.active}</span>
                    {editingId === l.id ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); commitRename(l.id); }}
                        className="text-green-400 hover:text-green-300 p-1"
                        aria-label="Confirm rename"
                      >
                        <Check size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => startRename(e, l)}
                        className="text-slate-500 hover:text-sky-400 p-1"
                        aria-label="Rename list"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <form onSubmit={submit} className="p-3 border-t border-slate-800 space-y-2">
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="New list…"
                  className="flex-1 bg-slate-800 text-slate-100 placeholder-slate-500 rounded-lg px-3 py-2 text-sm outline-none"
                />
                <button type="submit" className="bg-sky-500 hover:bg-sky-400 text-white rounded-lg px-3"><Plus size={18} /></button>
              </div>
              <div className="flex gap-1.5">
                {LIST_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition ${color === c ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white' : ''}`}
                    style={{ background: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
