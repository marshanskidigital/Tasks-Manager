export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto bg-slate-800 border border-slate-700 text-slate-100 rounded-xl shadow-2xl px-4 py-2.5 flex items-center gap-3 text-sm animate-in fade-in slide-in-from-bottom-2"
        >
          <span>{t.message}</span>
          {t.action && (
            <button
              onClick={() => { t.action(); onDismiss(t.id); }}
              className="text-sky-400 hover:text-sky-300 font-medium uppercase text-xs tracking-wide"
            >
              {t.actionLabel || 'Undo'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
