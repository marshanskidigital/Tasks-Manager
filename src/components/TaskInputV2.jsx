import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Plus, StickyNote, ImagePlus } from 'lucide-react';
import PriorityPicker, { PRIORITY_COLORS } from './PriorityPicker.jsx';
import TagPickerPopover from './TagPickerPopover.jsx';
import DatePickerPopover from './DatePickerPopover.jsx';
import PhotoAttachment from './PhotoAttachment.jsx';
import VoiceInputButton from './VoiceInputButton.jsx';
import { extractImagesFromClipboard, uploadTaskPhoto } from '../lib/photoStorage';

const TaskInputV2 = forwardRef(function TaskInputV2({ onAdd, onUpdate, allTags = [], disabled }, ref) {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [priority, setPriority] = useState('none');
  const [dueDate, setDueDate] = useState(null);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [stagedFiles, setStagedFiles] = useState([]);
  const [showPhotos, setShowPhotos] = useState(false);
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }));

  const reset = () => {
    setTitle(''); setTags([]); setPriority('none'); setDueDate(null); setNotes(''); setShowNotes(false);
    setStagedFiles([]); setShowPhotos(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const docRef = await onAdd({ title: title.trim(), tags, priority, dueDate, notes });
    if (stagedFiles.length > 0 && docRef?.id) {
      const urls = await Promise.all(stagedFiles.map((f) => uploadTaskPhoto(docRef.id, f)));
      onUpdate?.(docRef.id, { photos: urls });
    }
    reset();
    inputRef.current?.focus();
  };

  const handlePaste = (e) => {
    const images = extractImagesFromClipboard(e);
    if (images.length === 0) return;
    e.preventDefault();
    setStagedFiles((prev) => [...prev, ...images]);
    if (!showPhotos) setShowPhotos(true);
  };

  return (
    <form onSubmit={submit} onPaste={handlePaste} className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg">
      <div className="flex gap-2 items-center">
        <input
          ref={inputRef}
          type="text"
          autoFocus
          disabled={disabled}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 bg-transparent outline-none text-slate-100 placeholder-slate-500 px-1 py-2 text-base"
        />
        <VoiceInputButton
          onTranscript={(text) => setTitle(text)}
          mode="replace"
        />
        <button
          type="submit"
          disabled={disabled || !title.trim()}
          className="bg-sky-500 hover:bg-sky-400 disabled:opacity-30 text-white rounded-lg px-3 py-2 flex items-center gap-1 text-sm font-medium"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-2">
        <PriorityPicker value={priority} onChange={setPriority} />
        <TagPickerPopover value={tags} allTags={allTags} onChange={setTags} />
        <DatePickerPopover value={dueDate} onChange={setDueDate} />
        <button
          type="button"
          onClick={() => setShowNotes((s) => !s)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition ${
            showNotes || notes
              ? 'border-sky-500/50 text-sky-300 bg-sky-500/10'
              : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
          }`}
        >
          <StickyNote size={15} />
          <span className="text-xs font-medium">Notes</span>
        </button>
        <button
          type="button"
          onClick={() => setShowPhotos((s) => !s)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition ${
            showPhotos || stagedFiles.length > 0
              ? 'border-sky-500/50 text-sky-300 bg-sky-500/10'
              : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
          }`}
        >
          <ImagePlus size={15} />
          <span className="text-xs font-medium">Photos{stagedFiles.length > 0 ? ` (${stagedFiles.length})` : ''}</span>
        </button>
        {(tags.length > 0 || priority !== 'none' || dueDate) && (
          <span className={`text-xs ${PRIORITY_COLORS[priority]}`}>•</span>
        )}
      </div>

      {showNotes && (
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes (optional)…"
          rows={2}
          className="w-full mt-2 bg-slate-800 text-slate-100 placeholder-slate-500 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-sky-500 resize-none"
        />
      )}

      {showPhotos && (
        <div className="mt-2">
          <PhotoAttachment
            photos={[]}
            onPhotosChange={() => {}}
            taskId={null}
            stagedFiles={stagedFiles}
            onStagedFilesChange={setStagedFiles}
            compact={false}
          />
        </div>
      )}
    </form>
  );
});

export default TaskInputV2;
