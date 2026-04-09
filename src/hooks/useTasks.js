import { useEffect, useState } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc,
  query, where, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { migrateTask } from '../lib/taskHelpers';

export function useTasks(listId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listId) { setTasks([]); setLoading(false); return; }
    setLoading(true);
    const q = query(collection(db, 'tasks'), where('listId', '==', listId));
    return onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((d) => migrateTask({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [listId]);

  const addTask = (data) =>
    addDoc(collection(db, 'tasks'), {
      listId,
      title: data.title,
      tags: data.tags || [],
      priority: data.priority || 'none',
      status: data.status || 'todo',
      completed: data.status === 'done',
      dueDate: data.dueDate || null,
      notes: data.notes || '',
      photos: data.photos || [],
      order: Date.now(),
      createdAt: serverTimestamp(),
      completedAt: null
    });

  const updateTask = (id, patch) => updateDoc(doc(db, 'tasks', id), patch);

  const setStatus = (task, status) =>
    updateTask(task.id, {
      status,
      completed: status === 'done',
      completedAt: status === 'done' ? serverTimestamp() : null
    });

  const cycleStatus = (task) => {
    const next = task.status === 'todo' ? 'doing' : task.status === 'doing' ? 'done' : 'todo';
    return setStatus(task, next);
  };

  const removeTask = (id) => deleteDoc(doc(db, 'tasks', id));

  // Restore a previously deleted task by re-adding it (new id)
  const restoreTask = (taskData) => {
    const { id, ...rest } = taskData;
    return addDoc(collection(db, 'tasks'), { ...rest, createdAt: serverTimestamp() });
  };

  return { tasks, loading, addTask, updateTask, setStatus, cycleStatus, removeTask, restoreTask };
}
