import {
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  getAuth,
  inMemoryPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { deleteApp, initializeApp } from 'firebase/app';
import { getDownloadURL, ref as storageRef, uploadString } from 'firebase/storage';
import {
  firebaseAuth,
  firebaseConfig,
  firebaseConfigured,
  firebasePersistenceReady,
  firestore,
  firebaseStorage,
  googleTeacherProvider,
} from './firebaseClient';
import { normalizeUsername, scopedStudentUsername, studentAuthEmail } from '../utils/identity';

const USER_COLLECTION = 'mhpUsers';
const CLASS_COLLECTION = 'mhpClasses';
const STUDENT_VIEW_COLLECTION = 'mhpStudentViews';
const SCHEMA_VERSION = 2;

function cleanPayload(value) {
  return JSON.parse(JSON.stringify(value));
}

export function teacherProfileRef(uid) {
  return doc(firestore, USER_COLLECTION, uid);
}

export function teacherWorkspaceRef(uid) {
  return doc(firestore, CLASS_COLLECTION, uid);
}

export function studentViewRef(uid) {
  return doc(firestore, STUDENT_VIEW_COLLECTION, uid);
}

export function observeFirebaseUser(callback) {
  return onAuthStateChanged(firebaseAuth, callback);
}

export async function getTeacherProfile(user) {
  if (!user) return null;
  const snapshot = await getDoc(teacherProfileRef(user.uid));
  if (!snapshot.exists()) return null;
  const profile = snapshot.data();
  return profile?.role === 'teacher' ? { id: user.uid, ...profile } : null;
}

export async function ensureTeacherProfile(user) {
  const existingProfile = await getTeacherProfile(user);
  const email = String(user?.email || '').trim().toLowerCase();
  if (!email) throw new Error('Google did not provide an email address for this account.');

  if (existingProfile) {
    await setDoc(teacherProfileRef(user.uid), {
      name: user.displayName || existingProfile.name || email.split('@')[0],
      photoURL: user.photoURL || existingProfile.photoURL || '',
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } else {
    await setDoc(teacherProfileRef(user.uid), {
      role: 'teacher',
      name: user.displayName || email.split('@')[0],
      email,
      photoURL: user.photoURL || '',
      provider: 'google.com',
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return getTeacherProfile(user);
}

export async function getUserProfile(user) {
  if (!user) return null;
  const snapshot = await getDoc(teacherProfileRef(user.uid));
  return snapshot.exists() ? { id: user.uid, ...snapshot.data() } : null;
}

export async function signInTeacherWithGoogle() {
  if (!firebaseConfigured) throw new Error('Firebase chưa được cấu hình. Hãy kiểm tra các biến VITE_FIREBASE_* trước khi chạy website.');
  await firebasePersistenceReady;
  const credential = await signInWithPopup(firebaseAuth, googleTeacherProvider);
  const user = credential.user;
  const email = String(user.email || '').trim().toLowerCase();

  if (!email) {
    await signOut(firebaseAuth);
    throw new Error('Google did not provide an email address for this account.');
  }

  return { user, profile: await ensureTeacherProfile(user) };
}

export async function signOutFirebaseUser() {
  await signOut(firebaseAuth);
}

export async function signInStudentWithPassword(username, password) {
  if (!firebaseConfigured) throw new Error('Firebase chưa được cấu hình. Hãy liên hệ giáo viên.');
  await firebasePersistenceReady;
  const email = studentAuthEmail(username);
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  const profile = await getUserProfile(credential.user);
  if (!profile || profile.role !== 'student' || profile.active !== true) {
    await signOut(firebaseAuth);
    throw new Error('Tài khoản học viên chưa được kích hoạt hoặc đã bị khóa.');
  }
  return { user: credential.user, profile };
}

export async function provisionStudentAccount(ownerId, student, password) {
  if (!firebaseConfigured) throw new Error('Firebase chưa được cấu hình.');
  const secondaryName = `classquest-student-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const secondaryApp = initializeApp(firebaseConfig, secondaryName);
  const secondaryAuth = getAuth(secondaryApp);
  const secondaryFirestore = getFirestore(secondaryApp);
  await setPersistence(secondaryAuth, inMemoryPersistence);

  try {
    const requestedUsername = normalizeUsername(student.username);
    if (!requestedUsername) throw new Error('Tên đăng nhập học viên chưa hợp lệ.');

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const username = attempt === 0
        ? requestedUsername
        : scopedStudentUsername(requestedUsername, ownerId, attempt);
      const authEmail = studentAuthEmail(username);
      let credential;
      let accountWasCreated = false;

      try {
        credential = await createUserWithEmailAndPassword(secondaryAuth, authEmail, password);
        accountWasCreated = true;
      } catch (error) {
        if (error?.code !== 'auth/email-already-in-use') throw error;
        try {
          credential = await signInWithEmailAndPassword(secondaryAuth, authEmail, password);
        } catch (signInError) {
          if (signInError?.code === 'auth/invalid-credential'
            || signInError?.code === 'auth/wrong-password'
            || signInError?.code === 'auth/user-not-found') {
            continue;
          }
          throw signInError;
        }
      }

      const authUid = credential.user.uid;
      const profileReference = doc(secondaryFirestore, USER_COLLECTION, authUid);
      const existingProfile = await getDoc(profileReference);
      const existingData = existingProfile.exists() ? existingProfile.data() : null;
      const reusableAccount = accountWasCreated
        || !existingData
        || (existingData.role === 'student'
          && existingData.ownerId === ownerId
          && existingData.studentId === student.id);

      if (!reusableAccount) {
        await signOut(secondaryAuth);
        continue;
      }

      await setDoc(profileReference, {
        role: 'student',
        ownerId,
        studentId: student.id,
        name: student.name,
        email: student.email || '',
        authEmail,
        username,
        provider: 'password',
        active: true,
        ...(existingProfile.exists() ? {} : { createdAt: serverTimestamp() }),
        updatedAt: serverTimestamp(),
      }, { merge: existingProfile.exists() });

      return { authUid, username, authEmail };
    }

    const collisionError = new Error('Tên đăng nhập đã được sử dụng. ClassQuest không thể tạo mã thay thế an toàn.');
    collisionError.code = 'auth/student-username-collision';
    throw collisionError;
  } finally {
    try { await signOut(secondaryAuth); } catch { /* no active secondary session */ }
    await deleteApp(secondaryApp);
  }
}

function safeStorageSegment(value, fallback) {
  return String(value || fallback).replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 80);
}

export async function uploadSubmissionImages(ownerKey, submissionId, images = []) {
  return Promise.all(images.map(async (image, index) => {
    if (!image?.dataUrl || !String(image.dataUrl).startsWith('data:')) {
      const { dataUrl, ...storedImage } = image || {};
      return { ...storedImage, url: image?.url || dataUrl || '' };
    }
    const imageId = safeStorageSegment(image.id, `image-${index + 1}`);
    const path = `mhpSubmissions/${safeStorageSegment(ownerKey, 'unknown')}/${safeStorageSegment(submissionId, 'submission')}/${imageId}.jpg`;
    const reference = storageRef(firebaseStorage, path);
    await uploadString(reference, image.dataUrl, 'data_url', { contentType: image.type || 'image/jpeg' });
    const url = await getDownloadURL(reference);
    return {
      id: image.id || imageId,
      name: image.name || `${imageId}.jpg`,
      type: image.type || 'image/jpeg',
      size: Number(image.size || 0),
      storagePath: path,
      url,
    };
  }));
}

export async function migrateWorkspaceSubmissionImages(ownerId, data) {
  let changed = false;
  const submissions = await Promise.all((data.submissions || []).map(async (submission) => {
    if (!(submission.images || []).some((image) => String(image?.dataUrl || '').startsWith('data:'))) return submission;
    changed = true;
    return {
      ...submission,
      images: await uploadSubmissionImages(`${ownerId}/${submission.studentId}`, submission.id, submission.images),
    };
  }));
  return changed ? { ...data, submissions } : data;
}

export async function deactivateStudentAccount(authUid, ownerId) {
  await updateDoc(teacherProfileRef(authUid), {
    active: false,
    ownerId,
    updatedAt: serverTimestamp(),
  });
}

export async function loadOrCreateTeacherWorkspace(user, seedData) {
  const reference = teacherWorkspaceRef(user.uid);
  const snapshot = await getDoc(reference);
  if (snapshot.exists() && snapshot.data()?.payload) {
    return snapshot.data().payload;
  }

  const profile = await getTeacherProfile(user);
  const nextData = cleanPayload({
    ...seedData,
    teachers: [{
      id: user.uid,
      name: profile?.name || user.displayName || user.email,
      email: String(user.email || '').toLowerCase(),
      photoURL: profile?.photoURL || user.photoURL || '',
      provider: 'google.com',
    }],
    classes: (seedData.classes || []).map((klass) => ({ ...klass, teacherId: user.uid })),
  });

  await setDoc(reference, {
    ownerId: user.uid,
    schemaVersion: SCHEMA_VERSION,
    payload: nextData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return nextData;
}

export function subscribeToTeacherWorkspace(uid, onData, onError) {
  return onSnapshot(teacherWorkspaceRef(uid), (snapshot) => {
    if (snapshot.exists() && snapshot.data()?.payload) onData(snapshot.data().payload);
  }, onError);
}

export async function saveTeacherWorkspace(uid, data) {
  await setDoc(teacherWorkspaceRef(uid), {
    ownerId: uid,
    schemaVersion: SCHEMA_VERSION,
    payload: cleanPayload(data),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function loadStudentView(uid) {
  const snapshot = await getDoc(studentViewRef(uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export function subscribeToStudentView(uid, onData, onError) {
  return onSnapshot(studentViewRef(uid), (snapshot) => {
    if (snapshot.exists()) onData(snapshot.data());
  }, onError);
}

export function subscribeToTeacherStudentViews(ownerId, onData, onError) {
  const reference = query(collection(firestore, STUDENT_VIEW_COLLECTION), where('ownerId', '==', ownerId));
  return onSnapshot(reference, (snapshot) => {
    onData(snapshot.docs.map((entry) => ({ authUid: entry.id, ...entry.data() })));
  }, onError);
}

export async function syncStudentViews(ownerId, views) {
  if (!views.length) return;
  const batch = writeBatch(firestore);
  views.forEach(({ authUid, studentId, profile, studentState, content }) => {
    batch.set(studentViewRef(authUid), {
      ownerId,
      studentId,
      schemaVersion: SCHEMA_VERSION,
      profile: cleanPayload(profile),
      studentState: cleanPayload(studentState),
      content: cleanPayload(content),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  });
  await batch.commit();
}

export async function saveStudentActivity(authUid, studentState, activity) {
  await updateDoc(studentViewRef(authUid), {
    studentState: cleanPayload(studentState),
    activity: cleanPayload(activity),
    studentUpdatedAt: serverTimestamp(),
  });
}

export function friendlyFirebaseError(error) {
  const code = error?.code || '';
  if (code === 'auth/popup-closed-by-user') return 'The Google sign-in window was closed before login finished.';
  if (code === 'auth/popup-blocked') return 'Your browser blocked the Google sign-in window. Allow pop-ups and try again.';
  if (code === 'auth/cancelled-popup-request') return 'Another sign-in window is already open.';
  if (code === 'auth/unauthorized-domain') return 'Tên miền website chưa được thêm vào danh sách Authorized domains của Firebase.';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') return 'Tên đăng nhập hoặc mật khẩu chưa đúng.';
  if (code === 'auth/email-already-in-use') return 'Email nội bộ này đã tồn tại nhưng mật khẩu không khớp. Hãy tạo mã tài khoản khác.';
  if (code === 'auth/student-username-collision') return error.message;
  if (code === 'auth/operation-not-allowed') return 'Firebase chưa bật phương thức đăng nhập Email/Password.';
  if (code === 'permission-denied' || code === 'firestore/permission-denied') {
    return 'Firebase Rules hiện chưa cho phép thao tác này. Hãy cập nhật Rules mới của ClassQuest rồi thử lại.';
  }
  if (code === 'auth/network-request-failed') return 'Could not reach Google sign-in. Check the internet connection and try again.';
  return error?.message || 'Google sign-in could not be completed.';
}
