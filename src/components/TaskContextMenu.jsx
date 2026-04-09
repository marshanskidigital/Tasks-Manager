import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ExternalLink, ChevronRight, Copy, Trash2,
  Circle, CircleDot, CheckCircle2,
  Flag, FolderOutput
} from 'lucide-react';
import { STATUSES, STATUS_LABELS } from '../lib/taskHelpers';

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High', color: 'text-red-400' },
  { value: 'med', label: 'Medium', color: 'text-amber-400' },
  { value: 'low', label: 'Low', color: 'text-sky-400' },
  { value: 'none', label: 'None', color: 'text-slate-400' },
];

const STATUS_ICONS = {
  todo: Circle,
  doing: CircleDot,
  done: CheckCircle2,
};

const STATUS_COLORS = {
  todo: 'text-slate-400',
  doing: 'text-amber-400',
  done: 'text-emerald-400',
};

export default function TaskContextMenu({
  task, position, isOpen, onClose,
  lists, currentListId,
  onOpen, onSetStatus, onUpdate, onDuplicate, onRemove,
}) {
  const [submenu, setSubmenu] = useState(null);
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // Viewport clamping
  useLayoutEffect(() => {
    if (!isOpen || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const margin = 8;
    let x = position.x;
    let y = position.y;
    if (x + rect.width > window.innerWidth - margin) x = window.innerWidth - rect.width - margin;
    if (y + rect.height > window.innerHeight - margin) y = window.innerHeight - rect.height - margin;
    if (x < margin) x = margin;
    if (y < margin) y = margin;
    setPos({ x, y });
  }, [isOpen, position, submenu]);

  // Close on outside click, escape, scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const handleScroll = () => onClose();
    const handleContext = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('contextmenu', handleContext);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('contextmenu', handleContext);
    };
  }, [isOpen, onClose]);

  // Reset submenu when menu opens
  useEffect(() => {
    if (isOpen) setSubmenu(null);
  }, [isOpen]);

  if (!isOpen || !task) return null;

  const otherLists = lists.filter((l) => l.id !== currentListId);

  const handleAction = (fn) => {
    fn();
    onClose();
  };

  const menuItem = (icon, label, onClick, { danger, active, sub } = {}) => (
    <button
      role="menuitem"
      onClick={sub ? () => setSubmenu(submenu === sub ? null : sub) : () => handleAction(onClick)}
      onMouseEnter={sub ? () => setSubmenu(sub) : () => setSubmenu(null)}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition ${
        danger
          ? 'text-red-400 hover:bg-red-500/10'
          : active
            ? 'text-sky-400 bg-slate-800/60'
            : 'text-slate-200 hover:bg-slate-800'
      }`}
    >
      {icon}
      <span className="flex-1 text-start">{label}</span>
      {sub && <ChevronRight size={14} className="text-slate-500" />}
    </button>
  );

  const separator = <div className="border-t border-slate-800 my-1" />;

  return createPortal(
    <div className="fixed inset-0 z-[9999]" onContextMenu={(e) => e.preventDefault()}>
      <div
        ref={menuRef}
        role="menu"
        className="absolute bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 px-1.5 min-w-[200px] select-none"
        style={{ left: pos.x, top: pos.y }}
      >
        {/* Open */}
        {menuItem(<ExternalLink size={15} />, 'Open', () => onOpen(task))}

        {separator}

        {/* Status */}
        <div className="relative">
          {menuItem(<CircleDot size={15} />, 'Set Status', null, { sub: 'status' })}
          {submenu === 'status' && (
            <Submenu parentRef={menuRef}>
              {STATUSES.map((s) => {
                const Icon = STATUS_ICONS[s];
                return (
                  <button
                    key={s}
                    role="menuitem"
                    onClick={() => handleAction(() => onSetStatus(task, s))}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition ${
                      task.status === s ? 'text-sky-400 bg-slate-800/60' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={15} className={STATUS_COLORS[s]} />
                    {STATUS_LABELS[s]}
                  </button>
                );
              })}
            </Submenu>
          )}
        </div>

        {/* Priority */}
        <div className="relative">
          {menuItem(<Flag size={15} />, 'Set Priority', null, { sub: 'priority' })}
          {submenu === 'priority' && (
            <Submenu parentRef={menuRef}>
              {PRIORITY_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  role="menuitem"
                  onClick={() => handleAction(() => onUpdate(task.id, { priority: p.value }))}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition ${
                    task.priority === p.value ? 'text-sky-400 bg-slate-800/60' : 'text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Flag size={15} className={p.color} />
                  {p.label}
                </button>
              ))}
            </Submenu>
          )}
        </div>

        {/* Move to List */}
        {otherLists.length > 0 && (
          <div className="relative">
            {menuItem(<FolderOutput size={15} />, 'Move to List', null, { sub: 'move' })}
            {submenu === 'move' && (
              <Submenu parentRef={menuRef}>
                {otherLists.map((l) => (
                  <button
                    key={l.id}
                    role="menuitem"
                    onClick={() => handleAction(() => onUpdate(task.id, { listId: l.id }))}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-slate-200 hover:bg-slate-800 transition"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: l.color }} />
                    {l.name}
                  </button>
                ))}
              </Submenu>
            )}
          </div>
        )}

        {separator}

        {/* Duplicate */}
        {menuItem(<Copy size={15} />, 'Duplicate', () => onDuplicate(task))}

        {/* Delete */}
        {menuItem(<Trash2 size={15} />, 'Delete', () => onRemove(task), { danger: true })}
      </div>
    </div>,
    document.body
  );
}

function Submenu({ parentRef, children }) {
  const ref = useRef(null);
  const [side, setSide] = useState('right');

  useLayoutEffect(() => {
    if (!ref.current || !parentRef.current) return;
    const parentRect = parentRef.current.getBoundingClientRect();
    const subRect = ref.current.getBoundingClientRect();
    if (parentRect.right + subRect.width > window.innerWidth - 8) {
      setSide('left');
    } else {
      setSide('right');
    }
  }, [parentRef]);

  return (
    <div
      ref={ref}
      role="menu"
      className={`absolute top-0 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 px-1.5 min-w-[170px] z-10 ${
        side === 'right' ? 'start-full ms-1' : 'end-full me-1'
      }`}
    >
      {children}
    </div>
  );
}
