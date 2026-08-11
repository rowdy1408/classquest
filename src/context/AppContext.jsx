import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { defaultData, roleCatalog } from '../data/defaultData';
import { tierRequiredLevels } from '../data/skillTreeData';
import { makeStarterRules, STARTER_CONTENT_VERSION, starterShopItems } from '../data/starterContent';
import { loadAppData, loadSession, resetStorage, saveAppData, saveSession } from '../utils/storage';
import { MAX_CHARACTER_LEVEL } from '../utils/characterSkins';
import { buildMeetingDates, orderQuestNodes } from '../utils/questSchedule';
import { sortTests, validateTestSchedule } from '../utils/classValidation';
import {
  deactivateStudentAccount,
  friendlyFirebaseError,
  getTeacherProfile,
  getUserProfile,
  loadStudentView,
  loadOrCreateTeacherWorkspace,
  migrateWorkspaceSubmissionImages,
  observeFirebaseUser,
  provisionStudentAccount,
  saveStudentActivity,
  saveTeacherWorkspace,
  signInStudentWithPassword,
  signInTeacherWithGoogle,
  signOutFirebaseUser,
  subscribeToStudentView,
  subscribeToTeacherStudentViews,
  subscribeToTeacherWorkspace,
  syncStudentViews,
  uploadSubmissionImages,
} from '../firebase/classquestCloud';

const AppContext = createContext(null);

const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const cloneDefault = () => JSON.parse(JSON.stringify(defaultData));

function usernameBase(value) {
  return String(value || 'student')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24) || 'student';
}

function uniqueUsername(preferred, name, used) {
  const base = usernameBase(preferred || name);
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${base.slice(0, 20)}-${suffix}`;
    suffix += 1;
  }
  used.add(candidate);
  return candidate;
}

function localDayKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function usedOnCurrentLocalDay(value) {
  return Boolean(value) && localDayKey(value) === localDayKey(new Date());
}

function earnedSkillPoints(level) {
  return Object.values(tierRequiredLevels).filter((requiredLevel) => Number(level || 1) >= requiredLevel).length;
}

function spentSkillPoints(role, unlockedSkillIds = []) {
  return role.skills
    .filter((skill) => unlockedSkillIds.includes(skill.id))
    .reduce((total, skill) => total + Number(skill.cost || 1), 0);
}

function skillUsageWindowStart(skill, now = new Date()) {
  if (skill.usesPerDay || (!skill.usesPerWeek && !skill.usesPerMonth && !skill.usesPerTerm)) {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  if (skill.usesPerWeek) {
    const start = new Date(now);
    const day = start.getDay();
    start.setDate(start.getDate() - ((day + 6) % 7));
    start.setHours(0, 0, 0, 0);
    return start;
  }
  if (skill.usesPerMonth) return new Date(now.getFullYear(), now.getMonth(), 1);
  return null;
}

function skillUsageLimit(skill) {
  return Number(skill.usesPerDay || skill.usesPerWeek || skill.usesPerMonth || skill.usesPerTerm || 1);
}

function countSkillUses(entries, studentId, skill, now = new Date()) {
  const windowStart = skillUsageWindowStart(skill, now);
  return entries.filter((entry) => {
    if (entry.studentId !== studentId || entry.skillId !== skill.id) return false;
    if (!windowStart) return true;
    const usedAt = new Date(entry.usedAt);
    return !Number.isNaN(usedAt.getTime()) && usedAt >= windowStart && usedAt <= now;
  }).length;
}

function applyXpChange(student, change) {
  const amount = Number(change || 0);
  let level = Math.max(1, Math.min(MAX_CHARACTER_LEVEL, Number(student.level) || 1));
  let xp = Math.max(0, Number(student.xp || 0) + amount);
  let xpToNext = Math.max(100, Number(student.xpToNext) || level * 100);

  while (amount > 0 && level < MAX_CHARACTER_LEVEL && xp >= xpToNext) {
    xp -= xpToNext;
    level += 1;
    xpToNext += 100;
  }

  if (level >= MAX_CHARACTER_LEVEL) {
    level = MAX_CHARACTER_LEVEL;
    xp = Math.min(xp, xpToNext);
  }

  return { ...student, level, xp, xpToNext };
}

function normalizeData(raw, fallback) {
  const source = raw && typeof raw === 'object' ? raw : fallback;
  const classes = (source.classes || []).map((klass) => ({ sessionCount: 16, meetingSlots: [], sessionDates: [], ...klass }));
  const needsStarterMigration = Number(source.starterContentVersion || 0) < STARTER_CONTENT_VERSION;
  const existingRules = source.rules || [];
  const migratedRules = needsStarterMigration
    ? [
        ...existingRules,
        ...classes.flatMap((klass) => {
          const titles = new Set(existingRules.filter((rule) => rule.classId === klass.id).map((rule) => rule.title));
          return makeStarterRules(klass.id).filter((rule) => !titles.has(rule.title));
        }),
      ]
    : existingRules;
  const existingShopItems = source.shopItems || [];
  const migratedShopItems = needsStarterMigration
    ? [
        ...existingShopItems,
        ...starterShopItems.filter((starter) => !existingShopItems.some((item) => item.id === starter.id || item.name === starter.name)),
      ]
    : existingShopItems;
  return {
    ...fallback,
    ...source,
    starterContentVersion: STARTER_CONTENT_VERSION,
    teachers: source.teachers || fallback.teachers,
    classes,
    students: (source.students || []).map((student) => {
      const role = roleCatalog[student.role] || roleCatalog.Explorer;
      const level = Math.max(1, Math.min(MAX_CHARACTER_LEVEL, Number(student.level) || 1));
      const validSkillIds = new Set(role.skills.map((skill) => skill.id));
      return {
        ...student,
        level,
        hp: Math.min(Number(student.hp ?? role.maxHp), role.maxHp),
        mana: Math.min(Number(student.mana ?? role.maxMana), role.maxMana),
        unlockedSkillIds: (Array.isArray(student.unlockedSkillIds) ? student.unlockedSkillIds : []).filter((id) => validSkillIds.has(id)),
        gender: student.gender || (String(student.avatar || '').includes('♀') ? 'female' : 'male'),
      };
    }),
    groups: source.groups || [],
    rules: migratedRules,
    tests: source.tests || [],
    questNodes: (source.questNodes || []).map((node) => ({
      assignmentInstructions: node.description || '',
      customPrompt: '',
      acceptedEvidence: 'Google link, image, or text',
      deadline: '',
      lockAfterDeadline: false,
      submissionLocked: false,
      ...node,
    })),
    pointLogs: source.pointLogs || [],
    shopItems: migratedShopItems,
    purchases: (source.purchases || []).map((purchase) => ({ lastUsedAt: '', ...purchase })),
    skillUses: source.skillUses || [],
    submissions: (source.submissions || []).map((submission) => ({
      workLink: '',
      responseText: '',
      studentNote: '',
      images: [],
      teacherFeedback: '',
      attemptCount: 1,
      ...submission,
    })),
  };
}

function withoutCredentials(student) {
  const { password, ...safeStudent } = student || {};
  return safeStudent;
}

function sanitizeWorkspaceData(data) {
  return {
    ...data,
    teachers: (data.teachers || []).map(({ password, ...teacher }) => teacher),
    students: (data.students || []).map(withoutCredentials),
  };
}

function buildStudentViews(ownerId, data) {
  return (data.students || []).filter((student) => student.authUid).map((student) => {
    const classIds = student.classIds || [];
    const nodeIds = new Set((data.questNodes || []).filter((node) => classIds.includes(node.classId)).map((node) => node.id));
    const peerIds = new Set((data.students || []).filter((peer) => (peer.classIds || []).some((id) => classIds.includes(id))).map((peer) => peer.id));
    const publicPeer = (peer) => {
      const safe = withoutCredentials(peer);
      const { email, username, note, authUid, ...visible } = safe;
      return visible;
    };
    const profile = publicPeer(student);
    return {
      authUid: student.authUid,
      studentId: student.id,
      profile,
      studentState: {
        unlockedSkillIds: student.unlockedSkillIds || [],
        mana: Number(student.mana || 0),
        gold: Number(student.gold || 0),
      },
      content: {
        teachers: (data.teachers || []).map(({ id, name, photoURL }) => ({ id, name, photoURL: photoURL || '' })),
        classes: (data.classes || []).filter((klass) => classIds.includes(klass.id)),
        students: (data.students || []).filter((peer) => peerIds.has(peer.id)).map(publicPeer),
        groups: (data.groups || []).filter((group) => classIds.includes(group.classId)),
        rules: (data.rules || []).filter((rule) => classIds.includes(rule.classId)),
        tests: (data.tests || []).filter((test) => classIds.includes(test.classId)),
        questNodes: (data.questNodes || []).filter((node) => classIds.includes(node.classId)),
        pointLogs: (data.pointLogs || []).filter((log) => log.studentId === student.id),
        shopItems: (data.shopItems || []).filter((item) => item.active !== false),
        purchases: (data.purchases || []).filter((item) => item.studentId === student.id),
        skillUses: (data.skillUses || []).filter((item) => item.studentId === student.id),
        submissions: (data.submissions || []).filter((item) => item.studentId === student.id && nodeIds.has(item.nodeId)),
      },
    };
  });
}

function mergeSubmissionRecords(authoritative = [], studentEntries = []) {
  const merged = new Map(authoritative.map((entry) => [entry.id, entry]));
  studentEntries.forEach((entry) => {
    const existing = merged.get(entry.id);
    if (!existing) {
      merged.set(entry.id, entry);
      return;
    }
    const reviewedAt = new Date(existing.reviewedAt || 0).getTime();
    const submittedAt = new Date(entry.submittedAt || 0).getTime();
    merged.set(entry.id, reviewedAt >= submittedAt ? existing : { ...existing, ...entry, teacherFeedback: '', reviewedAt: '' });
  });
  return [...merged.values()];
}

function hydrateStudentView(view, fallback) {
  const content = view?.content || {};
  const profile = { ...(view?.profile || {}), ...(view?.studentState || {}) };
  const activity = view?.activity || {};
  const raw = {
    ...fallback,
    ...content,
    students: (content.students || []).map((student) => (student.id === view.studentId ? { ...student, ...profile } : student)),
    submissions: mergeSubmissionRecords(content.submissions || [], activity.submissions || []),
    purchases: activity.purchases || content.purchases || [],
    skillUses: activity.skillUses || content.skillUses || [],
  };
  return syncAllClassQuestMaps(normalizeData(raw, fallback));
}

function mergeStudentViewsIntoTeacherData(current, views) {
  let next = current;
  views.forEach((view) => {
    if (!view?.studentId) return;
    const state = view.studentState || {};
    const activity = view.activity || {};
    const studentId = view.studentId;
    const submissions = mergeSubmissionRecords(next.submissions.filter((item) => item.studentId === studentId), activity.submissions || []);
    const purchases = new Map(next.purchases.filter((item) => item.studentId === studentId).map((item) => [item.id, item]));
    (activity.purchases || []).forEach((item) => purchases.set(item.id, item));
    const skillUses = new Map(next.skillUses.filter((item) => item.studentId === studentId).map((item) => [item.id, item]));
    (activity.skillUses || []).forEach((item) => skillUses.set(item.id, item));
    next = {
      ...next,
      students: next.students.map((student) => student.id === studentId ? {
        ...student,
        unlockedSkillIds: Array.isArray(state.unlockedSkillIds) ? state.unlockedSkillIds : student.unlockedSkillIds,
        mana: Number.isFinite(Number(state.mana)) ? Number(state.mana) : student.mana,
        gold: Number.isFinite(Number(state.gold)) ? Number(state.gold) : student.gold,
      } : student),
      submissions: [...next.submissions.filter((item) => item.studentId !== studentId), ...submissions],
      purchases: [...next.purchases.filter((item) => item.studentId !== studentId), ...purchases.values()],
      skillUses: [...next.skillUses.filter((item) => item.studentId !== studentId), ...skillUses.values()],
    };
  });
  return next;
}

function createLessonNode(classId, order, date) {
  return {
    id: makeId('node'),
    classId,
    order,
    title: `Lesson ${order}`,
    type: 'lesson',
    date: date || '',
    status: order === 1 ? 'available' : 'locked',
    xpReward: 60,
    goldReward: 12,
    description: `Session ${order} learning quest.`,
    assignmentInstructions: '',
    customPrompt: '',
    acceptedEvidence: 'Google link, image, or text',
    deadline: '',
    lockAfterDeadline: true,
    submissionLocked: false,
    testId: '',
    autoManaged: true,
  };
}

function createTestNode(classId, test, existingNode) {
  const isFinal = test.type === 'final';
  return {
    id: existingNode?.id || makeId('node'),
    classId,
    order: 0,
    title: existingNode?.title || test.title || (isFinal ? 'Final Boss' : 'Mini Boss'),
    type: isFinal ? 'final' : 'miniboss',
    date: test.date || '',
    status: existingNode?.status || 'locked',
    xpReward: Number(existingNode?.xpReward || (isFinal ? 400 : 160)),
    goldReward: Number(existingNode?.goldReward || (isFinal ? 100 : 40)),
    description: existingNode?.description || (isFinal ? 'Final course assessment.' : 'Progress assessment checkpoint.'),
    assignmentInstructions: existingNode?.assignmentInstructions || test.description || '',
    customPrompt: existingNode?.customPrompt || '',
    acceptedEvidence: existingNode?.acceptedEvidence || 'Teacher-scored test evidence',
    deadline: existingNode?.deadline || (test.date ? `${test.date}T23:59` : ''),
    lockAfterDeadline: existingNode?.lockAfterDeadline ?? true,
    submissionLocked: existingNode?.submissionLocked ?? false,
    testId: test.id,
    autoManaged: true,
  };
}

function syncClassQuestMapState(current, classId, classPatch = {}) {
  const currentClass = current.classes.find((item) => item.id === classId);
  if (!currentClass) return current;

  const nextClass = {
    ...currentClass,
    ...classPatch,
    meetingSlots: classPatch.meetingSlots ?? currentClass.meetingSlots ?? [],
    sessionCount: Math.max(1, Number(classPatch.sessionCount ?? currentClass.sessionCount) || 1),
  };
  const total = nextClass.sessionCount;
  const dates = buildMeetingDates(nextClass.startDate, total, nextClass.meetingSlots, nextClass.sessionDates);
  const existingNodes = current.questNodes.filter((node) => node.classId === classId);
  const existingLessons = new Map(existingNodes.filter((node) => node.type === 'lesson').map((node) => [Number(node.order), node]));
  const existingTests = new Map(existingNodes.filter((node) => node.testId).map((node) => [node.testId, node]));
  const lessonNodes = Array.from({ length: total }, (_, index) => {
    const order = index + 1;
    const existing = existingLessons.get(order);
    const base = existing || createLessonNode(classId, order, dates[index]);
    return {
      ...base,
      classId,
      order,
      type: 'lesson',
      date: base.autoManaged === false && base.date ? base.date : dates[index] || base.date || '',
      title: base.title || `Lesson ${order}`,
      description: base.description || `Session ${order} learning quest.`,
      testId: '',
      autoManaged: base.autoManaged ?? true,
    };
  });
  const testNodes = current.tests
    .filter((test) => test.classId === classId)
    .map((test) => createTestNode(classId, test, existingTests.get(test.id)));
  const nextNodes = orderQuestNodes([...lessonNodes, ...testNodes]);
  const keptNodeIds = new Set(nextNodes.map((node) => node.id));
  const removedNodeIds = existingNodes.filter((node) => !keptNodeIds.has(node.id)).map((node) => node.id);

  return {
    ...current,
    classes: current.classes.map((item) => (item.id === classId ? nextClass : item)),
    questNodes: [
      ...current.questNodes.filter((node) => node.classId !== classId),
      ...nextNodes,
    ],
    submissions: current.submissions.filter((submission) => !removedNodeIds.includes(submission.nodeId)),
  };
}

function rebuildClassQuestMapState(current, classId, classPatch = {}) {
  return syncClassQuestMapState(current, classId, classPatch);
}

function syncAllClassQuestMaps(data) {
  return data.classes.reduce((current, klass) => syncClassQuestMapState(current, klass.id), data);
}

export function AppProvider({ children }) {
  const [data, setData] = useState(() => {
    const fallback = cloneDefault();
    const normalized = normalizeData(loadAppData(fallback), fallback);
    return syncAllClassQuestMaps(normalized);
  });
  const [session, setSession] = useState(() => loadSession());
  const [authReady, setAuthReady] = useState(false);
  const [cloudStatus, setCloudStatus] = useState('local');
  const dataRef = useRef(data);
  const cloudOwnerRef = useRef('');
  const cloudUnsubscribeRef = useRef(null);
  const studentViewUnsubscribeRef = useRef(null);
  const teacherStudentViewsUnsubscribeRef = useRef(null);
  const lastCloudPayloadRef = useRef('');
  const lastStudentViewDataRef = useRef('');
  const lastStudentActivityRef = useRef('');

  useEffect(() => {
    if (session?.role !== 'student') saveAppData(sanitizeWorkspaceData(data));
  }, [data, session]);
  useEffect(() => saveSession(session), [session]);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const disconnectCloudWorkspace = useCallback(() => {
    cloudUnsubscribeRef.current?.();
    studentViewUnsubscribeRef.current?.();
    teacherStudentViewsUnsubscribeRef.current?.();
    cloudUnsubscribeRef.current = null;
    studentViewUnsubscribeRef.current = null;
    teacherStudentViewsUnsubscribeRef.current = null;
    cloudOwnerRef.current = '';
    lastCloudPayloadRef.current = '';
    lastStudentViewDataRef.current = '';
    lastStudentActivityRef.current = '';
  }, []);

  const activateTeacherUser = useCallback(async (user) => {
    const profile = await getTeacherProfile(user);
    if (!profile) return { ok: false, message: 'Tài khoản Google này chưa được đăng ký làm giáo viên ClassQuest.' };

    setCloudStatus('loading');
    const remotePayload = await loadOrCreateTeacherWorkspace(user, sanitizeWorkspaceData(dataRef.current));
    const fallback = cloneDefault();
    let normalized = syncAllClassQuestMaps(normalizeData(remotePayload, fallback));
    try {
      normalized = await migrateWorkspaceSubmissionImages(user.uid, normalized);
    } catch (error) {
      console.warn('Could not migrate legacy submission images to Firebase Storage:', error);
    }
    const teacherRecord = {
      id: user.uid,
      name: profile.name || user.displayName || user.email,
      email: profile.email || String(user.email || '').toLowerCase(),
      photoURL: profile.photoURL || user.photoURL || '',
      provider: 'google.com',
    };
    const nextData = sanitizeWorkspaceData({
      ...normalized,
      teachers: [teacherRecord],
      classes: normalized.classes.map((klass) => ({ ...klass, teacherId: user.uid })),
    });

    disconnectCloudWorkspace();
    cloudOwnerRef.current = user.uid;
    lastCloudPayloadRef.current = JSON.stringify(nextData);
    dataRef.current = nextData;
    setData(nextData);
    setSession({ role: 'teacher', userId: user.uid, provider: 'google.com' });
    await saveTeacherWorkspace(user.uid, nextData);
    await syncStudentViews(user.uid, buildStudentViews(user.uid, sanitizeWorkspaceData(nextData)));

    cloudUnsubscribeRef.current = subscribeToTeacherWorkspace(user.uid, (payload) => {
      const latest = syncAllClassQuestMaps(normalizeData(payload, cloneDefault()));
      const nextPayload = {
        ...latest,
        teachers: [teacherRecord],
        classes: latest.classes.map((klass) => ({ ...klass, teacherId: user.uid })),
      };
      const serialized = JSON.stringify(nextPayload);
      if (serialized === lastCloudPayloadRef.current) return;
      lastCloudPayloadRef.current = serialized;
      dataRef.current = nextPayload;
      setData(nextPayload);
      setCloudStatus('synced');
    }, (error) => {
      console.warn('ClassQuest Firestore subscription failed:', error);
      setCloudStatus('error');
    });

    teacherStudentViewsUnsubscribeRef.current = subscribeToTeacherStudentViews(user.uid, (views) => {
      setData((current) => {
        const next = mergeStudentViewsIntoTeacherData(current, views);
        if (JSON.stringify(next) === JSON.stringify(current)) return current;
        dataRef.current = next;
        return next;
      });
    }, (error) => {
      console.warn('Could not receive student activity:', error);
      setCloudStatus('error');
    });

    setCloudStatus('synced');
    return { ok: true };
  }, [disconnectCloudWorkspace]);

  const activateStudentUser = useCallback(async (user, suppliedProfile = null) => {
    const profile = suppliedProfile || await getUserProfile(user);
    if (!profile || profile.role !== 'student' || profile.active !== true) {
      return { ok: false, message: 'Tài khoản học viên chưa được kích hoạt hoặc đã bị khóa.' };
    }

    setCloudStatus('loading');
    const view = await loadStudentView(user.uid);
    if (!view) return { ok: false, message: 'Hồ sơ học viên chưa sẵn sàng. Giáo viên cần đồng bộ lại tài khoản.' };

    const fallback = cloneDefault();
    const nextData = hydrateStudentView(view, fallback);
    disconnectCloudWorkspace();
    cloudOwnerRef.current = profile.ownerId || view.ownerId || '';
    lastStudentViewDataRef.current = JSON.stringify(nextData);
    dataRef.current = nextData;
    setData(nextData);
    setSession({ role: 'student', userId: profile.studentId, authUid: user.uid, ownerId: profile.ownerId, provider: 'password' });

    studentViewUnsubscribeRef.current = subscribeToStudentView(user.uid, (nextView) => {
      const hydrated = hydrateStudentView(nextView, cloneDefault());
      const serialized = JSON.stringify(hydrated);
      if (serialized === lastStudentViewDataRef.current) return;
      lastStudentViewDataRef.current = serialized;
      dataRef.current = hydrated;
      setData(hydrated);
      setCloudStatus('synced');
    }, (error) => {
      console.warn('Could not synchronize the student view:', error);
      setCloudStatus('error');
    });

    setCloudStatus('synced');
    return { ok: true };
  }, [disconnectCloudWorkspace]);

  useEffect(() => {
    let active = true;
    const unsubscribe = observeFirebaseUser(async (user) => {
      if (!active) return;
      if (!user) {
        disconnectCloudWorkspace();
        setSession(null);
        setCloudStatus('local');
        setAuthReady(true);
        return;
      }
      try {
        const profile = await getUserProfile(user);
        const result = profile?.role === 'student'
          ? await activateStudentUser(user, profile)
          : await activateTeacherUser(user);
        if (!result.ok) setSession(null);
      } catch (error) {
        console.warn('Could not restore the teacher Firebase session:', error);
        setSession(null);
        setCloudStatus('error');
      } finally {
        if (active) setAuthReady(true);
      }
    });
    return () => {
      active = false;
      unsubscribe();
      disconnectCloudWorkspace();
    };
  }, [activateStudentUser, activateTeacherUser, disconnectCloudWorkspace]);

  useEffect(() => {
    if (!authReady || session?.role !== 'teacher' || !cloudOwnerRef.current || cloudStatus === 'loading') return undefined;
    const serialized = JSON.stringify(data);
    if (serialized === lastCloudPayloadRef.current) return undefined;

    const timer = window.setTimeout(async () => {
      const ownerId = cloudOwnerRef.current;
      if (!ownerId) return;
      lastCloudPayloadRef.current = serialized;
      setCloudStatus('saving');
      try {
        const safeData = sanitizeWorkspaceData(data);
        await saveTeacherWorkspace(ownerId, safeData);
        await syncStudentViews(ownerId, buildStudentViews(ownerId, safeData));
        setCloudStatus('synced');
      } catch (error) {
        console.warn('Could not save ClassQuest data to Firestore:', error);
        lastCloudPayloadRef.current = '';
        setCloudStatus('error');
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [authReady, cloudStatus, data, session]);

  useEffect(() => {
    if (!authReady || session?.role !== 'student' || !session.authUid || cloudStatus === 'loading') return undefined;
    const student = data.students.find((item) => item.id === session.userId);
    if (!student) return undefined;
    const payload = {
      studentState: {
        unlockedSkillIds: student.unlockedSkillIds || [],
        mana: Number(student.mana || 0),
        gold: Number(student.gold || 0),
      },
      activity: {
        submissions: data.submissions.filter((item) => item.studentId === student.id),
        purchases: data.purchases.filter((item) => item.studentId === student.id),
        skillUses: data.skillUses.filter((item) => item.studentId === student.id),
      },
    };
    const serialized = JSON.stringify(payload);
    if (serialized === lastStudentActivityRef.current) return undefined;

    const timer = window.setTimeout(async () => {
      lastStudentActivityRef.current = serialized;
      setCloudStatus('saving');
      try {
        await saveStudentActivity(session.authUid, payload.studentState, payload.activity);
        setCloudStatus('synced');
      } catch (error) {
        console.warn('Could not save student activity:', error);
        lastStudentActivityRef.current = '';
        setCloudStatus('error');
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [authReady, cloudStatus, data, session]);

  const loginTeacherWithGoogle = async () => {
    setAuthReady(false);
    setCloudStatus('loading');
    try {
      const { user } = await signInTeacherWithGoogle();
      const result = await activateTeacherUser(user);
      setAuthReady(true);
      return result;
    } catch (error) {
      console.warn('Teacher Google sign-in failed:', error);
      disconnectCloudWorkspace();
      setSession(null);
      setCloudStatus('error');
      setAuthReady(true);
      try { await signOutFirebaseUser(); } catch { /* The failed auth session is already unusable. */ }
      return { ok: false, message: friendlyFirebaseError(error) };
    }
  };

  const loginStudent = async (username, password) => {
    setAuthReady(false);
    setCloudStatus('loading');
    try {
      const { user, profile } = await signInStudentWithPassword(username, password);
      const result = await activateStudentUser(user, profile);
      setAuthReady(true);
      return result;
    } catch (error) {
      console.warn('Student Firebase sign-in failed:', error);
      disconnectCloudWorkspace();
      setSession(null);
      setCloudStatus('error');
      setAuthReady(true);
      try { await signOutFirebaseUser(); } catch { /* no active session */ }
      return { ok: false, message: friendlyFirebaseError(error) };
    }
  };

  const logout = async () => {
    disconnectCloudWorkspace();
    setSession(null);
    setCloudStatus('local');
    await signOutFirebaseUser();
  };

  const resetDemo = () => {
    resetStorage();
    const fallback = cloneDefault();
    setData(syncAllClassQuestMaps(normalizeData(fallback, fallback)));
    setSession(null);
  };

  const updateCollection = (collection, updater) => {
    setData((current) => ({ ...current, [collection]: updater(current[collection]) }));
  };

  const addClass = (payload) => {
    const { initialTests = [], ...classPayload } = payload;
    const created = {
      id: makeId('class'),
      teacherId: session.userId,
      ...classPayload,
      meetingSlots: classPayload.meetingSlots || [],
      sessionDates: classPayload.sessionDates || [],
      sessionCount: Math.max(1, Number(classPayload.sessionCount) || 16),
    };
    const createdTests = initialTests.map((test) => ({
      id: makeId('test'),
      classId: created.id,
      title: test.title || (test.type === 'final' ? 'Final Test' : 'Progress Test'),
      date: test.date || '',
      type: test.type === 'final' ? 'final' : 'progress',
      maxScore: Math.max(1, Number(test.maxScore) || 100),
      description: test.description || '',
    }));

    setData((current) => {
      const next = {
        ...current,
        classes: [...current.classes, created],
        tests: [...current.tests, ...createdTests],
        rules: [...current.rules, ...makeStarterRules(created.id)],
      };
      return rebuildClassQuestMapState(next, created.id);
    });
    return created;
  };

  const importClassBundle = ({ classInfo, sessions = [], tests = [], students = [] }) => {
    const created = {
      id: makeId('class'),
      teacherId: session.userId,
      name: classInfo.name,
      code: classInfo.code || '',
      level: classInfo.level || '',
      startDate: classInfo.startDate || '',
      sessionCount: Math.max(1, Number(classInfo.sessionCount) || 1),
      description: classInfo.description || '',
      meetingSlots: classInfo.meetingSlots || [],
      sessionDates: classInfo.sessionDates || [],
      importedAt: new Date().toISOString(),
    };
    const createdTests = tests.map((test) => ({
      id: makeId('test'),
      classId: created.id,
      title: test.title || (test.type === 'final' ? 'Kiểm tra cuối khóa' : 'Kiểm tra tiến độ'),
      date: test.date || '',
      type: test.type === 'final' ? 'final' : 'progress',
      maxScore: Math.max(1, Number(test.maxScore) || 100),
      description: test.description || '',
    }));

    setData((current) => {
      const usedUsernames = new Set(current.students.map((student) => String(student.username || '').toLowerCase()).filter(Boolean));
      const createdStudents = students.map((student) => {
        const role = roleCatalog[student.role] || roleCatalog.Explorer;
        const username = uniqueUsername(student.username, student.name, usedUsernames);
        return {
          id: makeId('student'),
          classIds: [created.id],
          name: student.name,
          email: String(student.email || '').toLowerCase(),
          username,
          role: student.role || 'Explorer',
          gender: student.gender || 'male',
          avatar: role.icon,
          level: 1,
          xp: 0,
          xpToNext: 100,
          gold: 50,
          hp: role.maxHp,
          mana: role.maxMana,
          groupId: '',
          note: student.note || '',
          unlockedSkillIds: [],
        };
      });
      const next = {
        ...current,
        classes: [...current.classes, created],
        tests: [...current.tests, ...createdTests],
        rules: [...current.rules, ...makeStarterRules(created.id)],
        students: [...current.students, ...createdStudents],
      };
      const rebuilt = rebuildClassQuestMapState(next, created.id);
      return {
        ...rebuilt,
        questNodes: rebuilt.questNodes.map((node) => {
          if (node.classId !== created.id || node.type !== 'lesson') return node;
          const importedSession = sessions.find((session) => Number(session.order) === Number(node.order));
          if (!importedSession) return node;
          return {
            ...node,
            title: importedSession.title || node.title,
            description: importedSession.description || node.description,
          };
        }),
      };
    });
    return created;
  };

  const updateClass = (classId, patch) => {
    setData((current) => syncClassQuestMapState(current, classId, patch));
  };

  const deleteClass = async (classId) => {
    const orphanedStudents = data.students.filter((student) => student.classIds.includes(classId) && student.classIds.length === 1);
    try {
      await Promise.all(orphanedStudents.filter((student) => student.authUid).map((student) => deactivateStudentAccount(student.authUid, session.userId)));
    } catch (error) {
      return { ok: false, message: friendlyFirebaseError(error) };
    }
    const orphanedIds = new Set(orphanedStudents.map((student) => student.id));
    setData((current) => {
      const nodeIds = current.questNodes.filter((item) => item.classId === classId).map((item) => item.id);
      return {
        ...current,
        classes: current.classes.filter((item) => item.id !== classId),
        groups: current.groups.filter((item) => item.classId !== classId),
        rules: current.rules.filter((item) => item.classId !== classId),
        tests: current.tests.filter((item) => item.classId !== classId),
        questNodes: current.questNodes.filter((item) => item.classId !== classId),
        pointLogs: current.pointLogs.filter((item) => item.classId !== classId && !orphanedIds.has(item.studentId)),
        purchases: current.purchases.filter((item) => !orphanedIds.has(item.studentId)),
        skillUses: current.skillUses.filter((item) => !orphanedIds.has(item.studentId)),
        submissions: current.submissions.filter((item) => !nodeIds.includes(item.nodeId) && !orphanedIds.has(item.studentId)),
        students: current.students
          .filter((student) => !orphanedIds.has(student.id))
          .map((student) => ({ ...student, classIds: student.classIds.filter((id) => id !== classId) })),
      };
    });
    return { ok: true };
  };

  const addStudent = async (payload) => {
    const role = roleCatalog[payload.role] ?? roleCatalog.Explorer;
    const startingLevel = Math.max(1, Math.min(MAX_CHARACTER_LEVEL, Number(payload.level) || 1));
    const { password, ...safePayload } = payload;
    if (!password || password.length < 8) return { ok: false, message: 'Mật khẩu tạm cần có ít nhất 8 ký tự.' };
    const created = {
      id: makeId('student'),
      avatar: role.icon,
      gender: 'male',
      xp: 0,
      gold: 50,
      hp: role.maxHp,
      mana: role.maxMana,
      groupId: '',
      note: '',
      unlockedSkillIds: [],
      ...safePayload,
      level: startingLevel,
      xpToNext: Math.max(100, startingLevel * 100),
    };
    try {
      const authUid = await provisionStudentAccount(session.userId, created, password);
      const cloudStudent = { ...created, authUid };
      updateCollection('students', (items) => [...items, cloudStudent]);
      return { ok: true, student: cloudStudent };
    } catch (error) {
      return { ok: false, message: friendlyFirebaseError(error) };
    }
  };

  const activateStudentAccount = async (studentId, temporaryPassword) => {
    const student = data.students.find((item) => item.id === studentId);
    if (!student) return { ok: false, message: 'Không tìm thấy học viên.' };
    if (student.authUid) return { ok: true, student };
    if (!temporaryPassword || temporaryPassword.length < 8) return { ok: false, message: 'Mật khẩu tạm cần có ít nhất 8 ký tự.' };
    try {
      const authUid = await provisionStudentAccount(session.userId, student, temporaryPassword);
      updateCollection('students', (items) => items.map((item) => item.id === studentId ? { ...withoutCredentials(item), authUid } : item));
      return { ok: true, student: { ...withoutCredentials(student), authUid } };
    } catch (error) {
      return { ok: false, message: friendlyFirebaseError(error) };
    }
  };

  const updateStudent = (studentId, patch) => {
    const target = data.students.find((student) => student.id === studentId);
    const safePatch = withoutCredentials(patch);
    if (target?.authUid) {
      delete safePatch.email;
      delete safePatch.username;
    }
    updateCollection('students', (items) => items.map((item) => {
      if (item.id !== studentId) return item;
      const next = { ...withoutCredentials(item), ...safePatch };
      if (safePatch.role && safePatch.role !== item.role) {
        const role = roleCatalog[safePatch.role] ?? roleCatalog.Explorer;
        next.avatar = role.icon;
        next.hp = Math.min(Number(next.hp || role.maxHp), role.maxHp);
        next.mana = Math.min(Number(next.mana || role.maxMana), role.maxMana);
        next.unlockedSkillIds = [];
      }
      return next;
    }));
  };

  const deleteStudent = async (studentId) => {
    const student = data.students.find((item) => item.id === studentId);
    if (student?.authUid) {
      try {
        await deactivateStudentAccount(student.authUid, session.userId);
      } catch (error) {
        return { ok: false, message: friendlyFirebaseError(error) };
      }
    }
    setData((current) => ({
      ...current,
      students: current.students.filter((item) => item.id !== studentId),
      groups: current.groups.map((group) => ({ ...group, memberIds: group.memberIds.filter((id) => id !== studentId) })),
      pointLogs: current.pointLogs.filter((item) => item.studentId !== studentId),
      purchases: current.purchases.filter((item) => item.studentId !== studentId),
      submissions: current.submissions.filter((item) => item.studentId !== studentId),
      skillUses: current.skillUses.filter((item) => item.studentId !== studentId),
    }));
    return { ok: true };
  };

  const addGroup = (payload) => {
    const created = { id: makeId('group'), memberIds: [], motto: '', ...payload };
    updateCollection('groups', (items) => [...items, created]);
    return created;
  };

  const updateGroup = (groupId, patch) => {
    setData((current) => {
      const nextGroups = current.groups.map((item) => (item.id === groupId ? { ...item, ...patch } : item));
      let nextStudents = current.students;
      if (patch.memberIds) {
        nextStudents = current.students.map((student) => {
          if (patch.memberIds.includes(student.id)) return { ...student, groupId };
          if (student.groupId === groupId) return { ...student, groupId: '' };
          return student;
        });
      }
      return { ...current, groups: nextGroups, students: nextStudents };
    });
  };

  const deleteGroup = (groupId) => {
    setData((current) => ({
      ...current,
      groups: current.groups.filter((item) => item.id !== groupId),
      students: current.students.map((student) => (student.groupId === groupId ? { ...student, groupId: '' } : student)),
    }));
  };

  const addRule = (payload) => updateCollection('rules', (items) => [...items, { id: makeId('rule'), ...payload }]);
  const updateRule = (ruleId, patch) => updateCollection('rules', (items) => items.map((item) => item.id === ruleId ? { ...item, ...patch } : item));
  const deleteRule = (ruleId) => updateCollection('rules', (items) => items.filter((item) => item.id !== ruleId));

  const addTest = (payload) => {
    const klass = data.classes.find((item) => item.id === payload.classId);
    if (!klass) return { ok: false, message: 'Không tìm thấy lớp.' };
    const created = { id: makeId('test'), ...payload, type: payload.type === 'final' ? 'final' : 'progress' };
    const lessonDates = buildMeetingDates(klass.startDate, klass.sessionCount, klass.meetingSlots, klass.sessionDates);
    const errors = validateTestSchedule({
      tests: [...data.tests.filter((test) => test.classId === payload.classId), created],
      lessonDates,
      startDate: klass.startDate,
    });
    if (errors.length) return { ok: false, message: errors[0] };
    setData((current) => {
      const next = { ...current, tests: sortTests([...current.tests, created]) };
      return rebuildClassQuestMapState(next, payload.classId);
    });
    return { ok: true, test: created };
  };
  const deleteTest = (testId) => {
    setData((current) => {
      const test = current.tests.find((item) => item.id === testId);
      if (!test) return current;
      const next = { ...current, tests: current.tests.filter((item) => item.id !== testId) };
      return rebuildClassQuestMapState(next, test.classId);
    });
  };

  const addQuestNode = (payload) => {
    const created = {
      id: makeId('node'),
      status: 'locked',
      xpReward: 50,
      goldReward: 10,
      assignmentInstructions: '',
      customPrompt: '',
      acceptedEvidence: 'Google link, image, or text',
      deadline: '',
      lockAfterDeadline: true,
      submissionLocked: false,
      autoManaged: false,
      ...payload,
    };
    setData((current) => {
      const klass = current.classes.find((item) => item.id === created.classId);
      const nextCount = Math.max(1, Number(klass?.sessionCount || 0) + 1);
      const next = { ...current, questNodes: [...current.questNodes, created] };
      return syncClassQuestMapState(next, created.classId, { sessionCount: nextCount });
    });
    return created;
  };

  const updateQuestNode = (nodeId, patch) => {
    updateCollection('questNodes', (items) => items.map((item) => (item.id === nodeId ? { ...item, ...patch } : item)));
  };

  const deleteQuestNode = (nodeId) => {
    setData((current) => {
      const node = current.questNodes.find((item) => item.id === nodeId);
      if (!node) return current;
      const klass = current.classes.find((item) => item.id === node.classId);
      const nextCount = Math.max(1, Number(klass?.sessionCount || 1) - 1);
      const next = {
        ...current,
        questNodes: current.questNodes.filter((item) => item.id !== nodeId),
        submissions: current.submissions.filter((item) => item.nodeId !== nodeId),
      };
      return syncClassQuestMapState(next, node.classId, { sessionCount: nextCount });
    });
  };

  const generateQuestMap = ({ classId, sessionCount, startDate }) => {
    setData((current) => rebuildClassQuestMapState(current, classId, {
      sessionCount: Math.max(1, Number(sessionCount) || 1),
      startDate,
    }));
  };

  const applyPoints = ({ classId, studentId, points, gold, reason }) => {
    setData((current) => ({
      ...current,
      students: current.students.map((student) => {
        if (student.id !== studentId) return student;
        const progressed = applyXpChange(student, Number(points || 0));
        return { ...progressed, gold: Math.max(0, Number(student.gold || 0) + Number(gold || 0)) };
      }),
      pointLogs: [
        {
          id: makeId('log'),
          classId,
          studentId,
          points: Number(points || 0),
          gold: Number(gold || 0),
          reason,
          createdAt: new Date().toISOString(),
        },
        ...current.pointLogs,
      ],
    }));
  };

  const addShopItem = (payload) => updateCollection('shopItems', (items) => [...items, { id: makeId('shop'), active: true, ...payload }]);
  const updateShopItem = (itemId, patch) => updateCollection('shopItems', (items) => items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)));
  const deleteShopItem = (itemId) => updateCollection('shopItems', (items) => items.filter((item) => item.id !== itemId));

  const buyShopItem = (studentId, itemId) => {
    const student = data.students.find((item) => item.id === studentId);
    const item = data.shopItems.find((entry) => entry.id === itemId && entry.active);
    if (!student || !item) return { ok: false, message: 'Kỹ năng này hiện không khả dụng.' };
    if (data.purchases.some((purchase) => purchase.studentId === studentId && purchase.itemId === itemId)) {
      return { ok: false, message: 'Em đã sở hữu kỹ năng này. Kỹ năng được dùng một lần mỗi ngày.' };
    }
    if (student.gold < item.price) return { ok: false, message: 'Em chưa đủ Gold.' };

    setData((current) => ({
      ...current,
      students: current.students.map((entry) => (entry.id === studentId ? { ...entry, gold: entry.gold - item.price } : entry)),
      purchases: [
        { id: makeId('purchase'), studentId, itemId, lastUsedAt: '', purchasedAt: new Date().toISOString() },
        ...current.purchases,
      ],
    }));
    return { ok: true, message: `Đã mở khóa vĩnh viễn ${item.name}. Em có thể kích hoạt một lần mỗi ngày.` };
  };

  const usePurchasedSkill = (purchaseId) => {
    const purchase = data.purchases.find((item) => item.id === purchaseId);
    if (!purchase) return { ok: false, message: 'Không tìm thấy kỹ năng đã mua.' };
    if (usedOnCurrentLocalDay(purchase.lastUsedAt)) return { ok: false, message: 'Kỹ năng này đã được dùng hôm nay.' };
    updateCollection('purchases', (items) => items.map((item) => (
      item.id === purchaseId ? { ...item, lastUsedAt: new Date().toISOString(), used: false } : item
    )));
    return { ok: true, message: 'Đã kích hoạt kỹ năng. Hãy báo giáo viên để xác nhận hiệu ứng.' };
  };

  const unlockRoleSkill = (studentId, skillId) => {
    const student = data.students.find((item) => item.id === studentId);
    const role = student ? roleCatalog[student.role] : null;
    const skill = role?.skills.find((item) => item.id === skillId);
    if (!student || !skill) return { ok: false, message: 'Không tìm thấy kỹ năng nhân vật.' };
    const unlockedSkillIds = student.unlockedSkillIds || [];
    if (unlockedSkillIds.includes(skillId)) return { ok: false, message: 'Kỹ năng này đã được mở khóa.' };
    if (Number(student.level || 1) < Number(skill.requiredLevel || 1)) {
      return { ok: false, message: `Kỹ năng mở ở cấp ${skill.requiredLevel}.` };
    }
    if (!skill.prerequisiteSkillIds.every((id) => unlockedSkillIds.includes(id))) {
      return { ok: false, message: 'Em cần mở kỹ năng đứng trước trong nhánh này.' };
    }
    if (skill.isUltimate && role.skills.some((item) => item.isUltimate && unlockedSkillIds.includes(item.id))) {
      return { ok: false, message: 'Mỗi nhân vật chỉ được chọn một kỹ năng Tối thượng.' };
    }
    const availablePoints = earnedSkillPoints(student.level) - spentSkillPoints(role, unlockedSkillIds);
    if (availablePoints < Number(skill.cost || 1)) {
      return { ok: false, message: 'Em chưa có đủ Điểm kỹ năng.' };
    }

    updateCollection('students', (items) => items.map((item) => (
      item.id === studentId
        ? { ...item, unlockedSkillIds: [...(item.unlockedSkillIds || []), skillId] }
        : item
    )));
    return { ok: true, message: `Đã mở khóa ${skill.name}.` };
  };

  const useRoleSkill = (studentId, skillId) => {
    const student = data.students.find((item) => item.id === studentId);
    const role = student ? roleCatalog[student.role] : null;
    const skill = role?.skills.find((item) => item.id === skillId);
    if (!student || !skill) return { ok: false, message: 'Không tìm thấy kỹ năng nhân vật.' };
    if (!(student.unlockedSkillIds || []).includes(skillId)) {
      return { ok: false, message: 'Em cần mở khóa kỹ năng này trước.' };
    }
    const useCount = countSkillUses(data.skillUses, studentId, skill);
    if (useCount >= skillUsageLimit(skill)) {
      const period = skill.usesPerDay ? 'hôm nay' : skill.usesPerWeek ? 'tuần này' : skill.usesPerMonth ? 'tháng này' : 'khóa học này';
      return { ok: false, message: `Kỹ năng này đã dùng đủ lượt trong ${period}.` };
    }
    if (Number(student.mana || 0) < Number(skill.manaCost || 0)) {
      return { ok: false, message: `Em cần ${skill.manaCost} Mana để kích hoạt kỹ năng này.` };
    }

    setData((current) => ({
      ...current,
      students: current.students.map((item) => (
        item.id === studentId ? { ...item, mana: Math.max(0, Number(item.mana || 0) - Number(skill.manaCost || 0)) } : item
      )),
      skillUses: [
        { id: makeId('skill-use'), studentId, skillId, usedAt: new Date().toISOString() },
        ...current.skillUses,
      ],
    }));
    return { ok: true, message: `Đã kích hoạt ${skill.name}. Hãy cho giáo viên xem để xác nhận hiệu ứng.` };
  };

  const submitQuest = async (studentId, nodeId, evidence = {}) => {
    const node = data.questNodes.find((item) => item.id === nodeId);
    if (!node) return { ok: false, message: 'Không tìm thấy nhiệm vụ.' };
    if (node.status === 'locked') return { ok: false, message: 'Nhiệm vụ này chưa được mở.' };
    if (node.submissionLocked) return { ok: false, message: 'Giáo viên đã đóng nộp bài cho nhiệm vụ này.' };
    if (node.lockAfterDeadline && node.deadline && new Date(node.deadline).getTime() < Date.now()) {
      return { ok: false, message: `Đã quá hạn nộp bài: ${new Date(node.deadline).toLocaleString('vi-VN')}.` };
    }

    const hasEvidence = evidence.workLink?.trim() || evidence.responseText?.trim() || evidence.images?.length;
    if (!hasEvidence) return { ok: false, message: 'Hãy thêm đường dẫn, câu trả lời hoặc hình ảnh minh chứng.' };

    const existing = data.submissions.find((item) => item.studentId === studentId && item.nodeId === nodeId);
    const submissionId = existing?.id || makeId('submission');
    let uploadedImages;
    try {
      uploadedImages = await uploadSubmissionImages(session?.authUid || studentId, submissionId, evidence.images || []);
    } catch (error) {
      console.warn('Could not upload quest evidence images:', error);
      return { ok: false, message: 'Chưa thể tải hình lên Firebase Storage. Hãy thử lại hoặc nộp bằng đường dẫn.' };
    }
    const storedEvidence = { ...evidence, images: uploadedImages };

    setData((current) => {
      const existing = current.submissions.find((item) => item.studentId === studentId && item.nodeId === nodeId);
      const submittedAt = new Date().toISOString();
      if (existing) {
        return {
          ...current,
          submissions: current.submissions.map((item) =>
            item.id === existing.id
              ? {
                  ...item,
                  ...storedEvidence,
                  status: 'submitted',
                  submittedAt,
                  teacherFeedback: '',
                  attemptCount: Number(item.attemptCount || 1) + 1,
                }
              : item,
          ),
        };
      }
      return {
        ...current,
        submissions: [
          ...current.submissions,
          {
            id: submissionId,
            studentId,
            nodeId,
            status: 'submitted',
            submittedAt,
            workLink: storedEvidence.workLink || '',
            responseText: storedEvidence.responseText || '',
            studentNote: storedEvidence.studentNote || '',
            images: storedEvidence.images || [],
            teacherFeedback: '',
            attemptCount: 1,
          },
        ],
      };
    });
    return { ok: true, message: 'Quest evidence submitted.' };
  };

  const reviewSubmission = (submissionId, status, teacherFeedback = '') => {
    updateCollection('submissions', (items) => items.map((item) => (
      item.id === submissionId
        ? { ...item, status, teacherFeedback, reviewedAt: new Date().toISOString() }
        : item
    )));
  };

  const currentTeacher = session?.role === 'teacher' ? data.teachers.find((item) => item.id === session.userId) : null;
  const currentStudent = session?.role === 'student' ? data.students.find((item) => item.id === session.userId) : null;

  const value = useMemo(
    () => ({
      data,
      session,
      authReady,
      cloudStatus,
      currentTeacher,
      currentStudent,
      roleCatalog,
      loginTeacherWithGoogle,
      loginStudent,
      logout,
      resetDemo,
      addClass,
      importClassBundle,
      updateClass,
      deleteClass,
      addStudent,
      activateStudentAccount,
      updateStudent,
      deleteStudent,
      addGroup,
      updateGroup,
      deleteGroup,
      addRule,
      updateRule,
      deleteRule,
      addTest,
      deleteTest,
      addQuestNode,
      updateQuestNode,
      deleteQuestNode,
      generateQuestMap,
      applyPoints,
      addShopItem,
      updateShopItem,
      deleteShopItem,
      buyShopItem,
      usePurchasedSkill,
      unlockRoleSkill,
      useRoleSkill,
      submitQuest,
      reviewSubmission,
    }),
    [data, session, authReady, cloudStatus, currentTeacher, currentStudent],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
