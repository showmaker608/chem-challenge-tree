import type { Challenge, StudentProfile } from '../types';

const BASE = import.meta.env.VITE_CLOUD_FUNCTION_BASE;

export interface QuestionFeedback {
  id: string;
  classCode: string;
  className: string;
  studentName: string;
  nodeId: string;
  nodeTopic: string;
  challengeIndex: number;
  stem: string;
  selectedAnswer: number | null;
  correctAnswer: number;
  comment: string;
  createdAt: string;
}

interface SaveQuestionFeedbackInput {
  profile: StudentProfile;
  nodeId: string;
  nodeTopic: string;
  challenge: Challenge;
  challengeIndex: number;
  selectedAnswer: number | null;
  comment: string;
}

export async function saveQuestionFeedback(input: SaveQuestionFeedbackInput) {
  // 同时存本地和云端
  const feedback: QuestionFeedback = {
    id: `${Date.now()}-${input.nodeId}-${input.challengeIndex}`,
    classCode: input.profile.classCode,
    className: input.profile.className,
    studentName: input.profile.studentName,
    nodeId: input.nodeId,
    nodeTopic: input.nodeTopic,
    challengeIndex: input.challengeIndex,
    stem: input.challenge.stem,
    selectedAnswer: input.selectedAnswer,
    correctAnswer: input.challenge.answer,
    comment: input.comment.trim(),
    createdAt: new Date().toISOString(),
  };

  // 本地
  try {
    const raw = localStorage.getItem('chem-tree-question-feedback');
    const items = raw ? (JSON.parse(raw) as QuestionFeedback[]) : [];
    localStorage.setItem('chem-tree-question-feedback', JSON.stringify([feedback, ...items]));
  } catch { /* local fallback */ }

  // 云端
  if (BASE && input.profile.profileId !== 'guest') {
    try {
      await fetch(`${BASE}/manageCodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submitFeedback',
          classCode: input.profile.classCode,
          studentName: input.profile.studentName,
          nodeId: input.nodeId,
          nodeTopic: input.nodeTopic,
          stem: input.challenge.stem,
          userAnswer: input.selectedAnswer !== null ? input.challenge.options[input.selectedAnswer] : '',
          correctAnswer: input.challenge.options[input.challenge.answer],
          comment: input.comment.trim(),
        }),
      });
    } catch { /* cloud fallback */ }
  }

  return feedback;
}
