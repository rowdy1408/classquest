import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
export const firebaseConfigured = requiredConfigKeys.every((key) => Boolean(firebaseConfig[key]));

const app = firebaseConfigured
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null;

export const firebaseAuth = app ? getAuth(app) : null;
export const firestoreDb = app ? getFirestore(app) : null;

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const workspaceDataKeys = [
  'teachers',
  'classes',
  'students',
  'groups',
  'rules',
  'tests',
  'questNodes',
  'pointLogs',
  'shopItems',
  'purchases',
  'skillUses',
  'submissions',
];

function requireFirebase() {
  if (!firebaseConfigured || !firebaseAuth || !firestoreDb) {
    throw new Error('Firebase has not been configured for this build.');
  }
}

export function firebaseProjectLabel() {
  return firebaseConfig.projectId || '';
}

export async function signInTeacherWithGoogle() {
  requireFirebase();
  await setPersistence(firebaseAuth, browserLocalPersistence);
  const result = await signInWithPopup(firebaseAuth, googleProvider);
  return result.user;
}

export function observeFirebaseAuth(callback) {
  if (!firebaseAuth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(firebaseAuth, callback);
}

export async function signOutTeacher() {
  if (firebaseAuth?.currentUser) await signOut(firebaseAuth);
}

export async function ensureTeacherWorkspace(user) {
  requireFirebase();
  if (!user?.uid || !user.email) throw new Error('Google did not return a usable teacher account.');

  const profileRef = doc(firestoreDb, 'cq_users', user.uid);
  const profileSnapshot = await getDoc(profileRef);
  const existing = profileSnapshot.exists() ? profileSnapshot.data() : null;

  if (existing && (existing.role !== 'teacher' || existing.workspaceId !== user.uid)) {
    throw new Error('This Google account is not configured as a ClassQuest teacher.');
  }

  const profile = {
    uid: user.uid,
    role: 'teacher',
    workspaceId: user.uid,
    name: user.displayName || user.email.split('@')[0],
    email: user.email,
    photoURL: user.photoURL || '',
  };

  await setDoc(profileRef, {
    ...profile,
    createdAt: existing?.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  }, { merge: true });

  const workspaceRef = doc(firestoreDb, 'classquestWorkspaces', user.uid);
  const workspaceSnapshot = await getDoc(workspaceRef);
  await setDoc(workspaceRef, {
    workspaceId: user.uid,
    ownerUid: user.uid,
    name: existing?.workspaceName || `${profile.name}'s ClassQuest`,
    createdAt: workspaceSnapshot.exists() ? workspaceSnapshot.data().createdAt : serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return { id: user.uid, ...profile };
}

function cloudSafeItems(key, items) {
  if (key !== 'submissions') return items || [];

  // Base64 evidence is intentionally kept out of Firestore. It can exceed the
  // Firestore document limit and will move to Firebase Storage when student
  // accounts are migrated to Firebase Auth.
  return (items || []).map((submission) => ({
    ...submission,
    images: (submission.images || [])
      .filter((image) => image.downloadURL)
      .map(({ dataUrl, ...image }) => image),
    localEvidenceImageCount: (submission.images || []).filter((image) => image.dataUrl && !image.downloadURL).length,
  }));
}

export function cloudDataFingerprint(data) {
  return JSON.stringify(workspaceDataKeys.reduce((result, key) => {
    result[key] = cloudSafeItems(key, data?.[key]);
    return result;
  }, {}));
}

export async function readWorkspaceData(workspaceId) {
  requireFirebase();
  const snapshot = await getDocs(collection(firestoreDb, 'classquestWorkspaces', workspaceId, 'storage'));
  if (snapshot.empty) return { exists: false, data: null };

  const result = {};
  snapshot.forEach((entry) => {
    if (workspaceDataKeys.includes(entry.id)) result[entry.id] = entry.data().items || [];
  });
  return { exists: Object.keys(result).length > 0, data: result };
}

export function subscribeToWorkspaceData(workspaceId, onData, onError) {
  requireFirebase();
  return onSnapshot(
    collection(firestoreDb, 'classquestWorkspaces', workspaceId, 'storage'),
    (snapshot) => {
      if (snapshot.empty) return;
      const result = {};
      snapshot.forEach((entry) => {
        if (workspaceDataKeys.includes(entry.id)) result[entry.id] = entry.data().items || [];
      });
      if (Object.keys(result).length) onData(result);
    },
    onError,
  );
}

export async function writeWorkspaceData(workspaceId, data) {
  requireFirebase();
  const batch = writeBatch(firestoreDb);

  workspaceDataKeys.forEach((key) => {
    const storageRef = doc(firestoreDb, 'classquestWorkspaces', workspaceId, 'storage', key);
    batch.set(storageRef, {
      items: cloudSafeItems(key, data?.[key]),
      schemaVersion: 1,
      updatedAt: serverTimestamp(),
    });
  });

  batch.update(doc(firestoreDb, 'classquestWorkspaces', workspaceId), {
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export function firebaseErrorMessage(error) {
  const code = error?.code || '';
  if (code === 'auth/popup-closed-by-user') return 'The Google sign-in window was closed before login finished.';
  if (code === 'auth/popup-blocked') return 'Your browser blocked the Google sign-in window. Allow pop-ups and try again.';
  if (code === 'auth/unauthorized-domain') return 'This website domain has not been added to Firebase Authorized domains.';
  if (code === 'auth/network-request-failed') return 'Could not reach Firebase. Check your internet connection and try again.';
  if (code === 'permission-denied' || code === 'firestore/permission-denied') return 'Firestore rejected this request. Publish the supplied ClassQuest rules and try again.';
  return error?.message || 'Could not sign in with Google.';
}
