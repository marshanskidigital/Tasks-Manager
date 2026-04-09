import { isPast, isToday, startOfDay } from 'date-fns';

export const STATUSES = ['todo', 'doing', 'done'];
export const STATUS_LABELS = { todo: 'To Do', doing: 'In Progress', done: 'Done' };
export const PRIORITY_RANK = { high: 0, med: 1, low: 2, none: 3 };

// Convert a Firestore Timestamp / Date / number / null to a JS Date or null
export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string') return new Date(value);
  return null;
}

// Backwards-compat: ensure every task has status/order/notes/dueDate/tags/priority
export function migrateTask(task) {
  const status = task.status || (task.completed ? 'done' : 'todo');
  return {
    ...task,
    status,
    completed: status === 'done',
    notes: task.notes || '',
    tags: task.tags || [],
    priority: task.priority || 'none',
    photos: task.photos || [],
    dueDate: task.dueDate ?? null,
    order: typeof task.order === 'number' ? task.order : 0
  };
}

export function isOverdue(task) {
  if (task.status === 'done') return false;
  const d = toDate(task.dueDate);
  if (!d) return false;
  return isPast(startOfDay(d)) && !isToday(d);
}

export function isDueToday(task) {
  const d = toDate(task.dueDate);
  return d ? isToday(d) : false;
}

export function filterTasks(tasks, { search, tag, priority, status, overdue, hasDueDate }) {
  const q = (search || '').trim().toLowerCase();
  return tasks.filter((t) => {
    if (q) {
      const blob = `${t.title} ${(t.tags || []).join(' ')} ${t.notes || ''}`.toLowerCase();
      if (!blob.includes(q)) return false;
    }
    if (tag && !(t.tags || []).includes(tag)) return false;
    if (priority && t.priority !== priority) return false;
    if (status && t.status !== status) return false;
    if (overdue && !isOverdue(t)) return false;
    if (hasDueDate && !t.dueDate) return false;
    return true;
  });
}

export function sortTasks(tasks, sortBy) {
  const arr = [...tasks];
  switch (sortBy) {
    case 'priority':
      arr.sort((a, b) => (PRIORITY_RANK[a.priority] ?? 3) - (PRIORITY_RANK[b.priority] ?? 3));
      break;
    case 'dueDate':
      arr.sort((a, b) => {
        const da = toDate(a.dueDate)?.getTime() ?? Infinity;
        const db = toDate(b.dueDate)?.getTime() ?? Infinity;
        return da - db;
      });
      break;
    case 'alpha':
      arr.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'order':
      arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      break;
    case 'created':
    default: {
      arr.sort((a, b) => {
        const da = toDate(a.createdAt)?.getTime() ?? 0;
        const db = toDate(b.createdAt)?.getTime() ?? 0;
        return db - da;
      });
    }
  }
  return arr;
}

export const LIST_COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'];
