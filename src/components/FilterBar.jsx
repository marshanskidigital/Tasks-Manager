import { X, AlertCircle } from 'lucide-react';

export default function FilterBar({ tasks, filter, setFilter }) {
  const allTags = Array.from(new Set(tasks.flatMap((t) => t.tags || []))).sort();
  const priorities = ['high', 'med', 'low'];

  const update = (patch) => setFilter((f) => ({ ...f, ...patch }));
  const clear = () => setFilter({ tag: null, priority: null, status: null, overdue: false });
  const hasAny = filter.tag || filter.priority || filter.status || filter.overdue;

  return (
    <div className="flex flex-wrap gap-1.5 items-center text-xs">
      <button
        onClick={() => update({ overdue: !filter.overdue })}
        className={`flex items-center gap-1 px-2 py-1 rounded-full border transition ${
          filter.overdue ? 'bg-red-500 border-red-500 text-white' : 'border-slate-700 text-slate-400 hover:text-slate-200'
        }`}
      >
        <AlertCircle size={11} /> Overdue
      </button>
      {priorities.map((p) => (
        <button
          key={p}
          onClick={() => update({ priority: filter.priority === p ? null : p })}
          className={`px-2 py-1 rounded-full border transition ${
            filter.priority === p ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          {p}
        </button>
      ))}
      {allTags.map((t) => (
        <button
          key={t}
          onClick={() => update({ tag: filter.tag === t ? null : t })}
          className={`px-2 py-1 rounded-full border transition ${
            filter.tag === t ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-700 text-sky-300 hover:text-sky-200'
          }`}
        >
          #{t}
        </button>
      ))}
      {hasAny && (
        <button onClick={clear} className="flex items-center gap-1 text-slate-400 hover:text-slate-200">
          <X size={12} /> clear
        </button>
      )}
    </div>
  );
}
