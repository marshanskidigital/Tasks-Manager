import { useEffect, useRef, useState } from 'react';
import { ArrowUpDown, Check } from 'lucide-react';

const OPTIONS = [
  { id: 'created', label: 'Newest first' },
  { id: 'priority', label: 'Priority' },
  { id: 'dueDate', label: 'Due date' },
  { id: 'alpha', label: 'Alphabetical' }
];

export default function SortMenu({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
      >
        <ArrowUpDown size={13} /> Sort
      </button>
      {open && (
        <div className="absolute end-0 mt-2 z-30 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => { onChange(o.id); setOpen(false); }}
              className="flex items-center justify-between w-full text-sm text-slate-200 hover:bg-slate-800 rounded-md px-2 py-1.5"
            >
              <span>{o.label}</span>
              {value === o.id && <Check size={14} className="text-sky-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
