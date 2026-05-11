const ATTEMPTS_KEY = 'chem-tree-login-failures';
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;

function readAttempts(now = Date.now()) {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    const attempts = raw ? (JSON.parse(raw) as number[]) : [];
    return attempts.filter((time) => now - time < WINDOW_MS);
  } catch {
    return [];
  }
}

function writeAttempts(attempts: number[]) {
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch {
    // Login throttling is a client-side convenience until backend auth exists.
  }
}

export function getLoginBlockStatus(now = Date.now()) {
  const attempts = readAttempts(now);
  if (attempts.length < MAX_ATTEMPTS) {
    return {
      blocked: false,
      remainingSeconds: 0,
      attemptsRemaining: MAX_ATTEMPTS - attempts.length,
    };
  }

  const oldest = Math.min(...attempts);
  const remainingMs = Math.max(0, WINDOW_MS - (now - oldest));

  return {
    blocked: remainingMs > 0,
    remainingSeconds: Math.ceil(remainingMs / 1000),
    attemptsRemaining: 0,
  };
}

export function recordFailedLogin(now = Date.now()) {
  const attempts = [...readAttempts(now), now];
  writeAttempts(attempts);
  return getLoginBlockStatus(now);
}

export function clearFailedLogins() {
  try {
    localStorage.removeItem(ATTEMPTS_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}
