import { useEffect } from 'react';

export function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      const editing = tag === 'input' || tag === 'textarea' || e.target?.isContentEditable;
      if (e.key === 'Escape') { handlers.escape?.(); return; }
      if (editing) return;
      if (e.key === 'n') { e.preventDefault(); handlers.newTask?.(); }
      else if (e.key === '/') { e.preventDefault(); handlers.search?.(); }
      else if (e.key === 'v') { e.preventDefault(); handlers.toggleView?.(); }
      else if (/^[1-9]$/.test(e.key)) { handlers.switchList?.(parseInt(e.key, 10) - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlers]);
}
