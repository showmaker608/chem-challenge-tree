const BASE = import.meta.env.VITE_CLOUD_FUNCTION_BASE;

export type AnalyticsEventName = 'visit' | 'start_experience' | 'complete';

interface AnalyticsEventOptions {
  experienceId?: string;
  source?: string;
}

const VISITOR_KEY = 'chem-tree-analytics-visitor';
const SESSION_KEY = 'chem-tree-analytics-session';
const SENT_PREFIX = 'chem-tree-analytics-sent:';

function randomId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getOrCreateId(storage: Storage, key: string) {
  const saved = storage.getItem(key);
  if (saved) return saved;
  const value = randomId();
  storage.setItem(key, value);
  return value;
}

function cleanDimension(value: string | null | undefined, fallback: string) {
  const cleaned = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return cleaned || fallback;
}

function getAttribution() {
  const params = new URLSearchParams(window.location.search);
  const source = cleanDimension(
    params.get('src') || params.get('utm_source'),
    'direct',
  );
  const campaign = cleanDimension(params.get('utm_campaign'), 'none');
  return { source, campaign };
}

export function trackAnalyticsEvent(
  eventName: AnalyticsEventName,
  options: AnalyticsEventOptions = {},
) {
  if (!BASE || typeof window === 'undefined') return;

  try {
    const visitorId = getOrCreateId(window.localStorage, VISITOR_KEY);
    const sessionId = getOrCreateId(window.sessionStorage, SESSION_KEY);
    const attribution = getAttribution();
    const experienceId = cleanDimension(options.experienceId, 'site');
    const source = cleanDimension(options.source, attribution.source);
    const sentKey = `${SENT_PREFIX}${eventName}:${source}:${experienceId}`;

    if (window.sessionStorage.getItem(sentKey)) return;
    window.sessionStorage.setItem(sentKey, '1');

    void fetch(`${BASE}/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        visitorId,
        sessionId,
        source,
        campaign: attribution.campaign,
        experienceId,
        path: window.location.pathname.slice(0, 120),
      }),
      keepalive: true,
    }).then((response) => {
      if (!response.ok) window.sessionStorage.removeItem(sentKey);
    }).catch(() => {
      window.sessionStorage.removeItem(sentKey);
    });
  } catch {
    // Analytics is best-effort and must never interrupt a student's practice.
  }
}
