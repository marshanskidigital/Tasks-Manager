import { useEffect, useRef, useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';

export default function ListPickerPopover({ currentListId, lists, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const otherLists = lists.filter((l) => l.id !== currentListId);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  if (otherLists.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800"
      >
        <ArrowRightLeft size={15} />
        <span className="text-xs font-medium">Move to…</span>
      </button>
      {open && (
        <div className="absolute z-30 mt-2 start-0 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 space-y-1">
          {otherLists.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => { onChange(l.id); setOpen(false); }}
              className="flex items-center gap-2 w-full text-sm text-slate-200 hover:bg-slate-800 rounded-md px-2 py-1.5"
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: l.color }} />
              <span className="truncate">{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
