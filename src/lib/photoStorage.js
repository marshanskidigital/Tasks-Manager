import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from '../firebase';

export async function uploadTaskPhoto(taskId, file, onProgress) {
  const name = file.name && file.name !== 'image.png'
    ? `${Date.now()}_${file.name}`
    : `paste-${Date.now()}.png`;

  const storageRef = ref(storage, `tasks/${taskId}/${name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snap) => onProgress?.(snap.bytesTransferred / snap.totalBytes),
      reject,
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
}

export async function deleteTaskPhoto(photoUrl) {
  const storageRef = ref(storage, photoUrl);
  await deleteObject(storageRef);
}

export async function deleteAllTaskPhotos(taskId) {
  const folderRef = ref(storage, `tasks/${taskId}`);
  const result = await listAll(folderRef);
  await Promise.all(result.items.map((item) => deleteObject(item)));
}

export function extractImagesFromClipboard(event) {
  const files = [];
  const items = event.clipboardData?.items;
  if (!items) return files;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) files.push(file);
    }
  }
  return files;
}
