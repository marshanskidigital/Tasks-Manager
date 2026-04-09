import { Check } from 'lucide-react';

// 3-state circle: todo (empty) → doing (half) → done (filled check)
export default function TaskCheckCircle({ status = 'todo', onChange, size = 22 }) {
  const next = status === 'done' ? 'todo' : 'done';
  const cls =
    status === 'done'
      ? 'bg-emerald-500 border-emerald-500 text-white'
      : status === 'doing'
      ? 'border-amber-400 bg-amber-400/20'
      : 'border-slate-600 hover:border-slate-400';

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onChange(next); }}
      role="checkbox"
      aria-checked={status === 'done'}
      title={`Status: ${status} (click to change)`}
      className={`inline-flex items-center justify-center rounded-full border-2 transition flex-shrink-0 ${cls}`}
      style={{ width: size, height: size }}
    >
      {status === 'done' && <Check size={size - 8} strokeWidth={3} />}
      {status === 'doing' && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />}
    </button>
  );
}
