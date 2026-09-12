const BASE = import.meta.env.VITE_CLOUD_FUNCTION_BASE;

export interface ForumPost {
  _id: string;
  content: string;
  author: string;
  avatar?: string;
  createdAt: string;
  likes?: string[];
  dislikes?: string[];
  replies: {
    content: string; author: string; avatar?: string; createdAt: string;
    likes?: string[]; dislikes?: string[];
  }[];
}

export async function getPosts(): Promise<ForumPost[]> {
  if (!BASE) return [];
  try {
    const res = await fetch(`${BASE}/forum`);
    if (!res.ok) return [];
    return (await res.json()).posts ?? [];
  } catch { return []; }
}

export async function createPost(content: string, author: string, avatar: string): Promise<boolean> {
  if (!BASE) return false;
  try {
    const res = await fetch(`${BASE}/forum`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, author, avatar }),
    });
    return res.ok;
  } catch { return false; }
}

export async function addReply(postId: string, content: string, author: string, avatar: string): Promise<boolean> {
  if (!BASE) return false;
  try {
    const res = await fetch(`${BASE}/forum/reply`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, content, author, avatar }),
    });
    return res.ok;
  } catch { return false; }
}

export async function toggleLike(postId: string, studentId: string, type: 'like' | 'dislike', replyIndex?: number): Promise<boolean> {
  if (!BASE) return false;
  try {
    const res = await fetch(`${BASE}/forum/like`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, replyIndex, studentId, type }),
    });
    return res.ok;
  } catch { return false; }
}
