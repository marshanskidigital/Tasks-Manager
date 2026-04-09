import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { uploadTaskPhoto, deleteTaskPhoto } from '../lib/photoStorage';

export default function PhotoAttachment({
  photos = [],
  onPhotosChange,
  taskId,
  stagedFiles = [],
  onStagedFilesChange,
  compact = false,
}) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState([]);
  const [lightbox, setLightbox] = useState(null);

  const isCreationMode = taskId === null || taskId === undefined;

  // Create object URLs for staged files, revoke on cleanup or when files change
  const [stagedPreviews, setStagedPreviews] = useState([]);
  useEffect(() => {
    const urls = stagedFiles.map((f) => URL.createObjectURL(f));
    setStagedPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [stagedFiles]);
  const allPreviews = [...photos, ...stagedPreviews];

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = '';

    if (isCreationMode) {
      onStagedFilesChange?.([...stagedFiles, ...files]);
      return;
    }

    // Upload immediately for existing tasks
    const ids = files.map((_, i) => `upload-${Date.now()}-${i}`);
    setUploading((prev) => [...prev, ...ids]);
    try {
      const urls = await Promise.all(files.map((f) => uploadTaskPhoto(taskId, f)));
      onPhotosChange([...photos, ...urls]);
    } finally {
      setUploading((prev) => prev.filter((id) => !ids.includes(id)));
    }
  };

  const handleRemove = async (index) => {
    if (index < photos.length) {
      // Remove an uploaded photo
      const url = photos[index];
      try { await deleteTaskPhoto(url); } catch { /* storage ref may already be gone */ }
      onPhotosChange(photos.filter((_, i) => i !== index));
    } else {
      // Remove a staged file (object URL cleanup handled by useEffect)
      const stagedIndex = index - photos.length;
      onStagedFilesChange?.(stagedFiles.filter((_, i) => i !== stagedIndex));
    }
    if (lightbox !== null) setLightbox(null);
  };

  const openLightbox = (index) => setLightbox(index);
  const closeLightbox = () => setLightbox(null);

  if (compact && allPreviews.length === 0) {
    return (
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800 transition"
      >
        <ImagePlus size={15} />
        <span className="text-xs font-medium">Photos</span>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
      </button>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {allPreviews.map((src, i) => (
          <div key={`${src}-${i}`} className="relative group">
            <img
              src={src}
              alt=""
              onClick={() => openLightbox(i)}
              className="w-20 h-20 object-cover rounded-lg cursor-pointer border border-slate-700 hover:border-sky-500 transition"
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemove(i); }}
              className="absolute -top-1.5 -end-1.5 bg-slate-800 border border-slate-700 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition hover:bg-red-500 hover:border-red-500"
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        ))}

        {uploading.map((id) => (
          <div key={id} className="w-20 h-20 rounded-lg border border-slate-700 flex items-center justify-center bg-slate-800">
            <Loader2 size={20} className="text-sky-400 animate-spin" />
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:border-sky-500 hover:text-sky-400 transition"
        >
          <ImagePlus size={20} />
          <span className="text-[10px] mt-1">Add</span>
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />

      {/* Lightbox */}
      {lightbox !== null && allPreviews[lightbox] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 end-4 text-white/70 hover:text-white p-2"
          >
            <X size={24} />
          </button>

          {allPreviews.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + allPreviews.length) % allPreviews.length); }}
                className="absolute start-4 text-white/70 hover:text-white p-2"
              >
                <ChevronRight size={32} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % allPreviews.length); }}
                className="absolute end-4 text-white/70 hover:text-white p-2"
              >
                <ChevronLeft size={32} />
              </button>
            </>
          )}

          <img
            src={allPreviews[lightbox]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
