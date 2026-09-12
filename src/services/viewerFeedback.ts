import type { StudentProfile } from '../types';

const BASE = import.meta.env.VITE_CLOUD_FUNCTION_BASE;

export type ViewerRole = 'student' | 'parent' | 'teacher' | 'other';

export const VIEWER_ROLE_LABELS: Record<ViewerRole, string> = {
  student: '学生',
  parent: '家长',
  teacher: '老师',
  other: '其他',
};

interface SubmitViewerFeedbackInput {
  role: ViewerRole;
  name: string;
  comment: string;
  sourcePage: string;
  profile: StudentProfile | null;
}

interface FeedbackResponse {
  ok?: boolean;
  message?: string;
}

export async function submitViewerFeedback(input: SubmitViewerFeedbackInput) {
  if (!BASE) {
    throw new Error('留言服务暂时未连接');
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    const roleLabel = VIEWER_ROLE_LABELS[input.role];
    const visitorName = input.name.trim()
      || input.profile?.displayName
      || input.profile?.studentName
      || `${roleLabel}访客`;

    const response = await fetch(`${BASE}/manageCodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        action: 'submitFeedback',
        classCode: input.profile?.classCode ?? '',
        studentName: visitorName,
        nodeId: 'site-feedback',
        nodeTopic: '整体体验留言',
        stem: `${input.sourcePage} · ${roleLabel}`,
        userAnswer: '',
        correctAnswer: '',
        comment: input.comment.trim(),
        feedbackType: 'viewer',
        sourcePage: input.sourcePage,
        viewerRole: input.role,
      }),
    });

    const result = await response.json().catch(() => ({})) as FeedbackResponse;
    if (!response.ok || !result.ok) {
      throw new Error(result.message || '留言没有送达，请稍后重试');
    }

    return result;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('网络有点慢，请再试一次', { cause: error });
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
