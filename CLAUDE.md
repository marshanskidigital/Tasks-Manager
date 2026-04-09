# המשימות של דור

A real-time, collaborative task management PWA built with React, Vite, Firebase, and Tailwind CSS.

## Tech Stack
- **Frontend:** React 18, Vite 5, Tailwind CSS 3
- **Backend:** Firebase (Firestore + Cloud Storage)
- **Drag & Drop:** @dnd-kit
- **Icons:** lucide-react
- **Dates:** date-fns
- **PWA:** vite-plugin-pwa
- **Deployment:** Netlify

## Project Structure
```
src/
  App.jsx              # Root orchestrator component
  main.jsx             # React entry point
  firebase.js          # Firebase init (Firestore + Storage)
  index.css            # Tailwind imports + global styles
  components/          # 19 React components
    Sidebar.jsx        # Desktop list navigation
    MobileListSwitcher.jsx
    TaskList.jsx       # List view
    KanbanBoard.jsx    # Kanban view with drag-drop
    KanbanCard.jsx     # Draggable kanban card
    TaskItem.jsx       # Single task row
    TaskInputV2.jsx    # Rich task creation form
    TaskDetailDrawer.jsx # Side drawer for editing
    TaskCheckCircle.jsx  # 3-state status toggle
    PriorityPicker.jsx
    TagPickerPopover.jsx
    DatePickerPopover.jsx
    PhotoAttachment.jsx  # Photo gallery + upload + lightbox
    SearchBar.jsx
    FilterBar.jsx
    SortMenu.jsx
    ViewToggle.jsx
    Toast.jsx
  hooks/               # 5 custom hooks
    useLists.js        # Real-time list CRUD (Firestore onSnapshot)
    useTasks.js        # Real-time task CRUD + status management
    useToast.js        # Toast notification state
    useKeyboardShortcuts.js
    useTheme.js        # Dark/light toggle (localStorage)
  lib/                 # Utility libraries
    taskHelpers.js     # Constants, filtering, sorting, date utils
    photoStorage.js    # Firebase Storage upload/delete helpers
```

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build

## Key Patterns
- Real-time Firestore subscriptions via `onSnapshot` in custom hooks
- Top-down props, bottom-up callbacks (no global state library)
- RTL layout support (dir="rtl" on HTML)
- 3-state task status: todo -> doing -> done
- Soft delete with undo via toast notifications
- Dark/light theme with localStorage persistence
- Keyboard shortcuts: `n` new task, `/` search, `v` toggle view, `1-9` switch lists, `Esc` close

## Environment Variables
Firebase config via `VITE_FIREBASE_*` env vars. See `.env.example`.

## Firestore Collections
- `lists` — name, color, view preference
- `tasks` — title, status, priority, tags, dueDate, notes, photos, listId, order, timestamps

## Notes
- Security rules are currently open (allow read, write: if true) — not production-ready
- PWA configured for standalone display with auto-updating service worker

## Workflow
- After implementing any change, build and deploy to Netlify automatically:
  ```
  npm run build && netlify deploy --prod
  ```
