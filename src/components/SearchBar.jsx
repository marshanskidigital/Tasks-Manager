import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = forwardRef(function SearchBar({ value, onChange }, ref) {
  const inputRef = useRef(null);
  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }));

  return (
    <div className="relative flex-1 max-w-xs">
      <Search size={14} className="absolute start-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search tasks…"
        className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 rounded-lg ps-8 pe-7 py-1.5 text-sm outline-none focus:ring-1 focus:ring-sky-500"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200">
          <X size={13} />
        </button>
      )}
    </div>
  );
});

export default SearchBar;
