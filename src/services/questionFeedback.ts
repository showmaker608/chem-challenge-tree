import type { Challenge, StudentProfile } from '../types';

const FEEDBACK_KEY = 'chem-tree-question-feedback';

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

function readFeedback() {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    return raw ? (JSON.parse(raw) as QuestionFeedback[]) : [];
  } catch {
    return [];
  }
}

function writeFeedback(items: QuestionFeedback[]) {
  try {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(items));
  } catch {
    // Local feedback is best-effort until CloudBase submission is connected.
  }
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

export function saveQuestionFeedback(input: SaveQuestionFeedbackInput) {
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

  writeFeedback([feedback, ...readFeedback()]);
  return feedback;
}
