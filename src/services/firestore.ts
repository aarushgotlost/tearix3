import { collection, addDoc, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Blog, Story, Video } from '../types';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

export const saveBlog = async (blog: Omit<Blog, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'blogs'), {
    ...blog,
    createdAt: new Date()
  });
  return docRef.id;
};

export const saveStory = async (story: Omit<Story, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'stories'), {
    ...story,
    createdAt: new Date()
  });
  return docRef.id;
};

export const saveVideo = async (video: Omit<Video, 'id' | 'createdAt'>) => {
  // Don't save the blob URL to Firestore, just the metadata
  const videoData = {
    ...video,
    videoUrl: '', // We'll handle video URLs differently
    createdAt: new Date()
  };
  
  const docRef = await addDoc(collection(db, 'videos'), {
    ...videoData
  });
  return docRef.id;
};

export const getUserBlogs = async (userId: string): Promise<Blog[]> => {
  const q = query(
    collection(db, 'blogs'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date()
  })) as Blog[];
};

export const getUserStories = async (userId: string): Promise<Story[]> => {
  const q = query(
    collection(db, 'stories'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date()
  })) as Story[];
};

export const getUserVideos = async (userId: string): Promise<Video[]> => {
  const q = query(
    collection(db, 'videos'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date()
  })) as Video[];
};

export const getStoryById = async (storyId: string): Promise<Story | null> => {
  const docRef = doc(db, 'stories', storyId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date()
    } as Story;
  }
  return null;
};

// Image management functions
export const uploadImageToStorage = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

export const deleteImageFromStorage = async (url: string): Promise<void> => {
  try {
    // Extract the path from the Firebase Storage URL
    const urlParts = url.split('/');
    const pathIndex = urlParts.findIndex(part => part.includes('video-images'));
    if (pathIndex !== -1) {
      const path = decodeURIComponent(urlParts.slice(pathIndex).join('/').split('?')[0]);
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error as the image might already be deleted or URL might be external
  }
};