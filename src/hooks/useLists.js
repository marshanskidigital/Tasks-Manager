import { useEffect, useState, useRef } from 'react';
import {
  collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc,
  orderBy, query, serverTimestamp, getDocs, writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { LIST_COLORS } from '../lib/taskHelpers';

export function useLists() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const migratedRef = useRef(false);

  useEffect(() => {
    const q = query(collection(db, 'lists'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, async (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Check if lists exist but are missing the 'order' field (migration)
      if (data.length === 0 && !snap.metadata.fromCache && !migratedRef.current) {
        const allSnap = await getDocs(collection(db, 'lists'));
        if (allSnap.empty) {
          // Truly empty — create starter list
          await addDoc(collection(db, 'lists'), {
            name: 'My Tasks',
            color: LIST_COLORS[0],
            view: 'list',
            order: 0,
            createdAt: serverTimestamp()
          });
          return;
        }
        // Lists exist but have no 'order' field — migrate them
        migratedRef.current = true;
        const batch = writeBatch(db);
        allSnap.docs.forEach((d, i) => batch.update(doc(db, 'lists', d.id), { order: i }));
        await batch.commit();
        return; // onSnapshot will fire again with the migrated data
      }
      setLists(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const addList = async (name, color = LIST_COLORS[0]) => {
    const maxOrder = lists.reduce((max, l) => Math.max(max, l.order ?? 0), -1);
    return addDoc(collection(db, 'lists'), {
      name: name.trim(),
      color,
      view: 'list',
      order: maxOrder + 1,
      createdAt: serverTimestamp()
    });
  };

  const reorderLists = async (orderedIds) => {
    const batch = writeBatch(db);
    orderedIds.forEach((id, i) => batch.update(doc(db, 'lists', id), { order: i }));
    await batch.commit();
  };

  const updateList = (id, patch) => updateDoc(doc(db, 'lists', id), patch);
  const removeList = (id) => deleteDoc(doc(db, 'lists', id));

  return { lists, loading, addList, updateList, removeList, reorderLists };
}
