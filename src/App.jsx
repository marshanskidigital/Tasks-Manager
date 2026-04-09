import { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import MobileListSwitcher from './components/MobileListSwitcher.jsx';
import TaskInputV2 from './components/TaskInputV2.jsx';
import TaskList from './components/TaskList.jsx';
import KanbanBoard from './components/KanbanBoard.jsx';
import FilterBar from './components/FilterBar.jsx';
import SearchBar from './components/SearchBar.jsx';
import SortMenu from './components/SortMenu.jsx';
import ViewToggle from './components/ViewToggle.jsx';
import TaskDetailDrawer from './components/TaskDetailDrawer.jsx';
import Toast from './components/Toast.jsx';
import TaskContextMenu from './components/TaskContextMenu.jsx';
import { useLists } from './hooks/useLists.js';
import { useTasks } from './hooks/useTasks.js';
import { useToast } from './hooks/useToast.js';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js';
import { useTheme } from './hooks/useTheme.js';
import { filterTasks, sortTasks, isOverdue } from './lib/taskHelpers.js';
import { Sun, Moon } from 'lucide-react';

const hasFirebaseConfig = !!import.meta.env.VITE_FIREBASE_PROJECT_ID;

export default function App() {
  const [currentId, setCurrentId] = useState(null);
  const [filter, setFilter] = useState({ tag: null, priority: null, status: null, overdue: false });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created');
  const [openTask, setOpenTask] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const { theme, toggleTheme } = useTheme();
  const { lists, addList, updateList, removeList, reorderLists } = useLists();
  const { tasks, addTask, updateTask, setStatus, removeTask, restoreTask } = useTasks(currentId);
  const { toasts, show, dismiss } = useToast();

  const inputRef = useRef(null);
  const searchRef = useRef(null);

  // Auto-select first list
  useEffect(() => {
    if (!currentId && lists.length > 0) setCurrentId(lists[0].id);
    if (currentId && !lists.find((l) => l.id === currentId)) setCurrentId(lists[0]?.id || null);
  }, [lists, currentId]);

  // Keep openTask in sync with realtime updates
  useEffect(() => {
    if (!openTask) return;
    const fresh = tasks.find((t) => t.id === openTask.id);
    if (fresh && fresh !== openTask) setOpenTask(fresh);
    if (!fresh) setOpenTask(null);
  }, [tasks]); // eslint-disable-line

  // Compute counts for all lists — needs an aggregate query, but we approximate
  // with the current list only (other lists show 0 until visited). For a small
  // app this is fine and avoids extra Firestore reads.
  const taskCounts = useMemo(() => {
    const map = {};
    if (currentId) {
      const active = tasks.filter((t) => t.status !== 'done').length;
      const overdue = tasks.filter((t) => isOverdue(t)).length;
      map[currentId] = { active, overdue };
    }
    return map;
  }, [tasks, currentId]);

  const currentList = lists.find((l) => l.id === currentId);
  const view = currentList?.view || 'list';

  const visibleTasks = useMemo(() => {
    return sortTasks(filterTasks(tasks, { ...filter, search }), sortBy);
  }, [tasks, filter, search, sortBy]);

  const allTags = useMemo(
    () => Array.from(new Set(tasks.flatMap((t) => t.tags || []))).sort(),
    [tasks]
  );

  const handleRemove = async (task) => {
    await removeTask(task.id);
    show('Task deleted', {
      actionLabel: 'Undo',
      action: () => restoreTask(task)
    });
  };

  const handleMove = async (taskId, newListId) => {
    const previousListId = currentId;
    const targetList = lists.find((l) => l.id === newListId);
    await updateTask(taskId, { listId: newListId });
    show(`Moved to ${targetList?.name || 'list'}`, {
      actionLabel: 'Undo',
      action: () => updateTask(taskId, { listId: previousListId })
    });
  };

  const handleContextMenu = (task, e) => {
    e.preventDefault();
    setContextMenu({ task, x: e.clientX, y: e.clientY });
  };

  const handleDuplicate = async (task) => {
    const { id, createdAt, completedAt, ...rest } = task;
    await addTask({ ...rest, title: `${task.title} (copy)` });
    show('Task duplicated');
  };

  useKeyboardShortcuts({
    newTask: () => inputRef.current?.focus(),
    search: () => searchRef.current?.focus(),
    toggleView: () => currentList && updateList(currentList.id, { view: view === 'list' ? 'kanban' : 'list' }),
    switchList: (i) => lists[i] && setCurrentId(lists[i].id),
    escape: () => setOpenTask(null)
  });

  if (!hasFirebaseConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-slate-200">
        <div className="max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h1 className="text-xl font-semibold text-sky-400 mb-2">Firebase config missing</h1>
          <p className="text-sm text-slate-400">
            Create a <code>.env</code> from <code>.env.example</code> and restart <code>npm run dev</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex text-slate-100 bg-slate-950">
      <div className="hidden md:block">
        <Sidebar
          lists={lists}
          currentId={currentId}
          onSelect={setCurrentId}
          onAdd={addList}
          onRemove={removeList}
          onRename={(id, name) => updateList(id, { name })}
          onReorder={reorderLists}
          taskCounts={taskCounts}
        />
      </div>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-2 md:gap-3 px-3 md:px-6 py-3 border-b border-slate-800 flex-wrap">
          <MobileListSwitcher
            lists={lists}
            currentId={currentId}
            onSelect={setCurrentId}
            onAdd={addList}
            onRename={(id, name) => updateList(id, { name })}
            taskCounts={taskCounts}
          />
          <h1 className="hidden md:flex items-center gap-2 text-lg font-semibold truncate">
            {currentList && (
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: currentList.color }} />
            )}
            {currentList?.name || 'No list'}
          </h1>
          <div className="flex-1" />
          <SearchBar ref={searchRef} value={search} onChange={setSearch} />
          {currentList && (
            <>
              <SortMenu value={sortBy} onChange={setSortBy} />
              <ViewToggle
                value={view}
                onChange={(v) => updateList(currentList.id, { view: v })}
              />
            </>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-3 md:px-6 py-5 max-w-5xl w-full mx-auto space-y-4">
          {currentList ? (
            <>
              <FilterBar tasks={tasks} filter={filter} setFilter={setFilter} />

              {view === 'list' ? (
                <TaskList
                  tasks={visibleTasks}
                  onSetStatus={setStatus}
                  onRemove={handleRemove}
                  onOpen={setOpenTask}
                  onUpdate={updateTask}
                  onContextMenu={handleContextMenu}
                />
              ) : (
                <KanbanBoard
                  tasks={visibleTasks}
                  onSetStatus={setStatus}
                  onOpen={setOpenTask}
                  onUpdate={updateTask}
                  onContextMenu={handleContextMenu}
                />
              )}
            </>
          ) : (
            <div className="text-slate-500 text-center mt-20">Loading…</div>
          )}
        </div>

        {currentList && (
          <div className="shrink-0 border-t border-slate-700 px-3 md:px-6 py-3">
            <div className="max-w-5xl w-full mx-auto">
              <TaskInputV2 ref={inputRef} onAdd={addTask} onUpdate={updateTask} allTags={allTags} disabled={!currentId} />
            </div>
          </div>
        )}
      </main>

      {openTask && (
        <TaskDetailDrawer
          task={openTask}
          allTags={allTags}
          lists={lists}
          currentListId={currentId}
          onClose={() => setOpenTask(null)}
          onUpdate={updateTask}
          onMove={handleMove}
          onRemove={handleRemove}
        />
      )}

      <Toast toasts={toasts} onDismiss={dismiss} />

      <TaskContextMenu
        task={contextMenu?.task}
        position={contextMenu || { x: 0, y: 0 }}
        isOpen={!!contextMenu}
        onClose={() => setContextMenu(null)}
        lists={lists}
        currentListId={currentId}
        onOpen={(t) => { setOpenTask(t); setContextMenu(null); }}
        onSetStatus={setStatus}
        onUpdate={(id, patch) => {
          const task = contextMenu?.task;
          if (patch.listId && task) {
            handleMove(id, patch.listId);
          } else {
            updateTask(id, patch);
          }
        }}
        onDuplicate={handleDuplicate}
        onRemove={handleRemove}
      />
    </div>
  );
}
