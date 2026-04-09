import { List, KanbanSquare } from 'lucide-react';

export default function ViewToggle({ value, onChange }) {
  const opt = (id, Icon, label) => (
    <button
      key={id}
      onClick={() => onChange(id)}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition ${
        value === id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      <Icon size={14} /> {label}
    </button>
  );
  return (
    <div className="inline-flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-0.5">
      {opt('list', List, 'List')}
      {opt('kanban', KanbanSquare, 'Kanban')}
    </div>
  );
}
