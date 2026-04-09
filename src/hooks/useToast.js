import { useCallback, useState } from 'react';

let nextId = 1;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((arr) => arr.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, opts = {}) => {
    const id = nextId++;
    const toast = { id, message, action: opts.action, actionLabel: opts.actionLabel, duration: opts.duration ?? 5000 };
    setToasts((arr) => [...arr, toast]);
    if (toast.duration > 0) {
      setTimeout(() => dismiss(id), toast.duration);
    }
    return id;
  }, [dismiss]);

  return { toasts, show, dismiss };
}
