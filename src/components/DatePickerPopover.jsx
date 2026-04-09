import { useEffect, useRef, useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { addDays, format, nextFriday, startOfDay } from 'date-fns';
import { toDate } from '../lib/taskHelpers';

export default function DatePickerPopover({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const date = toDate(value);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const set = (d) => { onChange(d); setOpen(false); };

  const today = startOfDay(new Date());
  const presets = [
    { label: 'Today', value: today },
    { label: 'Tomorrow', value: addDays(today, 1) },
    { label: 'This Friday', value: nextFriday(today) },
    { label: 'Next week', value: addDays(today, 7) }
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition ${
          date ? 'border-sky-500/50 text-sky-300 bg-sky-500/10' : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
        }`}
      >
        <Calendar size={15} />
        <span className="text-xs font-medium">{date ? format(date, 'MMM d') : 'Due date'}</span>
        {date && (
          <X
            size={13}
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="hover:text-slate-100"
          />
        )}
      </button>
      {open && (
        <div className="absolute z-30 mt-2 start-0 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 space-y-1">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => set(p.value)}
              className="flex justify-between w-full text-sm text-slate-200 hover:bg-slate-800 rounded-md px-2 py-1.5"
            >
              <span>{p.label}</span>
              <span className="text-slate-500 text-xs">{format(p.value, 'EEE, MMM d')}</span>
            </button>
          ))}
          <div className="border-t border-slate-800 pt-2 mt-2">
            <input
              type="date"
              defaultValue={date ? format(date, 'yyyy-MM-dd') : ''}
              onChange={(e) => e.target.value && set(new Date(e.target.value))}
              className="w-full bg-slate-800 text-slate-100 rounded-md px-2 py-1.5 text-sm outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
