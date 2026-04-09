import { useEffect, useRef, useState } from 'react';
import { Tag, Plus, X } from 'lucide-react';

export default function TagPickerPopover({ value = [], allTags = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const toggle = (t) => {
    if (value.includes(t)) onChange(value.filter((x) => x !== t));
    else onChange([...value, t]);
  };

  const addNew = (e) => {
    e.preventDefault();
    const t = draft.trim().toLowerCase().replace(/^#/, '');
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setDraft('');
  };

  const merged = Array.from(new Set([...allTags, ...value])).sort();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition ${
          value.length > 0
            ? 'border-sky-500/50 text-sky-300 bg-sky-500/10'
            : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
        }`}
      >
        <Tag size={15} />
        <span className="text-xs font-medium">{value.length > 0 ? `${value.length} tag${value.length > 1 ? 's' : ''}` : 'Tag'}</span>
      </button>
      {open && (
        <div className="absolute z-30 mt-2 start-0 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3">
          <form onSubmit={addNew} className="flex gap-1 mb-2">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="New tag…"
              className="flex-1 bg-slate-800 text-slate-100 placeholder-slate-500 rounded-md px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-sky-500"
            />
            <button type="submit" className="bg-sky-500 hover:bg-sky-400 text-white rounded-md p-1" aria-label="Add tag">
              <Plus size={14} />
            </button>
          </form>
          <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
            {merged.length === 0 && <div className="text-xs text-slate-500 py-2">No tags yet</div>}
            {merged.map((t) => {
              const active = value.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggle(t)}
                  className={`text-xs px-2 py-1 rounded-full transition ${
                    active ? 'bg-sky-500 text-white' : 'bg-slate-800 text-sky-300 hover:bg-slate-700'
                  }`}
                >
                  {active && <X size={10} className="inline me-0.5" />}#{t}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
