const APP_KEY = 'classquest-rpg-manager-v1';
const SESSION_KEY = 'classquest-session-v1';

export function loadAppData(fallback) {
  try {
    const stored = localStorage.getItem(APP_KEY);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.warn('Could not load ClassQuest data:', error);
    return fallback;
  }
}

export function saveAppData(data) {
  try {
    localStorage.setItem(APP_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Could not save ClassQuest data. Browser storage may be full:', error);
  }
}

export function loadSession() {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  if (!session) {
    sessionStorage.removeItem(SESSION_KEY);
    return;
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function resetStorage() {
  localStorage.removeItem(APP_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}
