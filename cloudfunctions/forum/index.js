const cloudbase = require('@cloudbase/node-sdk');
const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
const db = app.database();

function json(body, code = 200) {
  return {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  };
}

exports.main = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') return json({ ok: true });

    const path = event.path || '';

    // GET — 获取所有帖子
    if (event.httpMethod === 'GET') {
      const res = await db.collection('forum_posts')
        .orderBy('createdAt', 'desc')
        .limit(200)
        .get();
      return json({ ok: true, posts: res.data || [] });
    }

    const payload = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});

    // POST /forum/like — 点赞/点踩
    if (path.includes('/like')) {
      const { postId, replyIndex, studentId, type } = payload;
      if (!postId || !studentId) return json({ ok: false, message: '参数不全' }, 400);

      const postRes = await db.collection('forum_posts').doc(postId).get();
      if (!postRes.data?.length) return json({ ok: false, message: '帖子不存在' }, 404);
      const post = postRes.data[0];

      // 判断是回复还是主帖
      let target;
      if (replyIndex !== undefined && replyIndex >= 0) {
        target = post.replies?.[replyIndex];
        if (!target) return json({ ok: false, message: '回复不存在' }, 404);
      }
      const likesField = replyIndex !== undefined ? `replies.${replyIndex}.likes` : 'likes';
      const dislikesField = replyIndex !== undefined ? `replies.${replyIndex}.dislikes` : 'dislikes';
      const currentLikes = target?.likes || post.likes || [];
      const currentDislikes = target?.dislikes || post.dislikes || [];

      // 点踩时从 likes 移除；点赞时从 dislikes 移除
      const newLikes = type === 'like'
        ? (currentLikes.includes(studentId) ? currentLikes.filter(id => id !== studentId) : [...currentLikes, studentId])
        : currentLikes.filter(id => id !== studentId);
      const newDislikes = type === 'dislike'
        ? (currentDislikes.includes(studentId) ? currentDislikes.filter(id => id !== studentId) : [...currentDislikes, studentId])
        : currentDislikes.filter(id => id !== studentId);

      await db.collection('forum_posts').doc(postId).update({
        [likesField]: newLikes,
        [dislikesField]: newDislikes,
      });

      return json({ ok: true, likes: newLikes.length, dislikes: newDislikes.length });
    }

    // POST /forum/reply — 回复帖子
    if (path.includes('/reply')) {
      const { postId, content, author, avatar } = payload;
      if (!postId || !content || !author) {
        return json({ ok: false, message: '请填写完整信息' }, 400);
      }
      const reply = {
        content: content.trim(),
        author: author.trim(),
        avatar: avatar || '',
        createdAt: new Date().toISOString(),
        likes: [],
        dislikes: [],
      };
      await db.collection('forum_posts').doc(postId).update({
        replies: db.command.push(reply),
      });
      return json({ ok: true, reply });
    }

    // POST /forum — 创建新帖
    const { content, author, avatar } = payload;
    if (!content || !author) {
      return json({ ok: false, message: '请填写内容和姓名' }, 400);
    }
    const post = {
      content: content.trim(),
      author: author.trim(),
      avatar: avatar || '',
      createdAt: new Date().toISOString(),
      replies: [],
      likes: [],
      dislikes: [],
    };
    const result = await db.collection('forum_posts').add(post);
    return json({ ok: true, post: { ...post, _id: result.id } });
  } catch (err) {
    return json({ ok: false, message: '服务器错误: ' + (err.message ?? String(err)) }, 500);
  }
};
