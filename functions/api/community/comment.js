// POST /api/community/comment { postId, author, body } → 댓글(IP당 10분 15건) · 한 줄씩 원자적 저장
import { json, wrap, readJson, clean, rateLimit } from '../../_shared.js';
import { ensure } from '../../_db.js';
export const onRequestPost = wrap(async ({ request, env }) => {
  const b = await readJson(request);
  if (!(await rateLimit(env, request, 'cmt', 15, 600))) return json({ error: '등록이 너무 잦습니다.' }, 429);
  const body = clean(b.body, 600); if (body.length < 2) return json({ error: '내용을 입력하세요.' }, 400);
  const d = await ensure(env);
  const p = await d.prepare('SELECT id FROM posts WHERE id = ? AND hidden = 0').bind(String(b.postId || '')).first();
  if (!p) return json({ error: '글을 찾을 수 없습니다.' }, 404);
  const reply = { author: clean(b.author, 20) || '익명', body, ts: Date.now() };
  await d.prepare('INSERT INTO comments (post_id, author, body, ts) VALUES (?, ?, ?, ?)').bind(p.id, reply.author, body, reply.ts).run();
  return json({ reply }, 201);
});
