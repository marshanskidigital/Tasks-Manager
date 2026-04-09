import { useEffect, useRef, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import PriorityPicker from './PriorityPicker.jsx';
import TagPickerPopover from './TagPickerPopover.jsx';
import DatePickerPopover from './DatePickerPopover.jsx';
import TaskCheckCircle from './TaskCheckCircle.jsx';
import PhotoAttachment from './PhotoAttachment.jsx';
import VoiceInputButton from './VoiceInputButton.jsx';
import ListPickerPopover from './ListPickerPopover.jsx';
import { STATUS_LABELS, STATUSES, toDate } from '../lib/taskHelpers';
import { extractImagesFromClipboard, uploadTaskPhoto } from '../lib/photoStorage';
import { serverTimestamp } from 'firebase/firestore';

export default function TaskDetailDrawer({ task, allTags, lists, currentListId, onClose, onUpdate, onMove, onRemove }) {
  const [draft, setDraft] = useState(task);
  const titleRef = useRef(null);

  const autoResizeTitle = () => {
    const el = titleRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }
  };

  useEffect(() => { setDraft(task); }, [task?.id]);
  useEffect(() => { autoResizeTitle(); }, [draft.title, task?.id]);

  if (!task) return null;

  const save = (patch) => {
    setDraft((d) => ({ ...d, ...patch }));
    onUpdate(task.id, patch);
  };

  const handlePaste = async (e) => {
    const images = extractImagesFromClipboard(e);
    if (images.length === 0) return;
    e.preventDefault();
    const urls = await Promise.all(images.map((f) => uploadTaskPhoto(task.id, f)));
    const updated = [...(draft.photos || []), ...urls];
    save({ photos: updated });
  };

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="absolute end-0 top-0 h-full w-full sm:max-w-md bg-slate-900 border-s border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-left">
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <TaskCheckCircle status={draft.status} onChange={(s) => save({ status: s, completed: s === 'done', completedAt: s === 'done' ? serverTimestamp() : null })} />
            <span className="text-sm text-slate-400">{STATUS_LABELS[draft.status]}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { onRemove(task); onClose(); }}
              className="p-2 text-slate-400 hover:text-red-400"
              aria-label="Delete task"
            >
              <Trash2 size={18} />
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-100" aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" onPaste={handlePaste}>
          <textarea
            ref={titleRef}
            value={draft.title}
            onChange={(e) => { setDraft((d) => ({ ...d, title: e.target.value })); autoResizeTitle(); }}
            onBlur={() => draft.title.trim() && save({ title: draft.title.trim() })}
            rows={1}
            className="w-full bg-transparent text-xl font-semibold text-slate-100 outline-none border-b border-transparent focus:border-slate-700 pb-1 resize-none overflow-hidden"
          />

          <div className="flex flex-wrap gap-2">
            <PriorityPicker value={draft.priority} onChange={(p) => save({ priority: p })} />
            <TagPickerPopover value={draft.tags || []} allTags={allTags} onChange={(t) => save({ tags: t })} />
            <DatePickerPopover value={draft.dueDate} onChange={(d) => save({ dueDate: d })} />
            <ListPickerPopover currentListId={currentListId} lists={lists} onChange={(listId) => onMove(task.id, listId)} />
          </div>

          <div>
            <label className="block text-xs uppercase text-slate-500 mb-1">Status</label>
            <div className="flex gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => save({ status: s, completed: s === 'done', completedAt: s === 'done' ? serverTimestamp() : null })}
                  className={`flex-1 text-xs py-1.5 rounded-md border transition ${
                    draft.status === s ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs uppercase text-slate-500">Notes</label>
              <VoiceInputButton
                onTranscript={(text) => {
                  const updated = draft.notes ? `${draft.notes}\n${text}` : text;
                  setDraft((d) => ({ ...d, notes: updated }));
                  save({ notes: updated });
                }}
                mode="append"
                className="scale-90"
              />
            </div>
            <textarea
              value={draft.notes || ''}
              onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
              onBlur={() => save({ notes: draft.notes || '' })}
              rows={6}
              placeholder="Add notes…"
              className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-sky-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-slate-500 mb-1">Photos</label>
            <PhotoAttachment
              photos={draft.photos || []}
              onPhotosChange={(p) => save({ photos: p })}
              taskId={task.id}
            />
          </div>

          <div className="text-xs text-slate-500 space-y-0.5 pt-2 border-t border-slate-800">
            {toDate(task.createdAt) && <div>Created {format(toDate(task.createdAt), 'PP p')}</div>}
            {toDate(task.completedAt) && <div>Completed {format(toDate(task.completedAt), 'PP p')}</div>}
          </div>
        </div>
      </aside>
    </div>
  );
}
