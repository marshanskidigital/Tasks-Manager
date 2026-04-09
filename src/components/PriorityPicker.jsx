import { Flag } from 'lucide-react';

export const PRIORITY_COLORS = {
  high: 'text-red-400',
  med: 'text-amber-400',
  low: 'text-sky-400',
  none: 'text-slate-500'
};

const ORDER = ['none', 'low', 'med', 'high'];
const LABEL = { none: 'Priority', low: 'Low', med: 'Medium', high: 'High' };

export default function PriorityPicker({ value = 'none', onChange, compact = false }) {
  const cycle = () => {
    const idx = ORDER.indexOf(value);
    onChange(ORDER[(idx + 1) % ORDER.length]);
  };
  return (
    <button
      type="button"
      onClick={cycle}
      title={`Priority: ${LABEL[value]} (click to change)`}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 hover:bg-slate-800 transition ${PRIORITY_COLORS[value]}`}
    >
      <Flag size={15} fill={value === 'none' ? 'none' : 'currentColor'} />
      {!compact && <span className="text-xs font-medium">{LABEL[value]}</span>}
    </button>
  );
}
