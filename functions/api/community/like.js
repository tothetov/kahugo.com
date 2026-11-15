// POST /api/community/like { postId, on } → 공감(IP당 글 1회 · IP당 10분 60회 제한)
import { json, wrap, readJson, ip, rateLimit } from '../../_shared.js';
import { ensure } from '../../_db.js';
export const onRequestPost = wrap(async ({ request, env }) => {
  const b = await readJson(request);
  if (!(await rateLimit(env, request, 'like', 60, 600))) return json({ error: '잠시 후 다시 시도하세요.' }, 429);
  const d = await ensure(env), id = String(b.postId || '');
  if (!(await d.prepare('SELECT id FROM posts WHERE id = ?').bind(id).first())) return json({ error: '글을 찾을 수 없습니다.' }, 404);
  if (b.on) await d.prepare('INSERT OR IGNORE INTO likes (post_id, ip) VALUES (?, ?)').bind(id, ip(request)).run();
  else await d.prepare('DELETE FROM likes WHERE post_id = ? AND ip = ?').bind(id, ip(request)).run();
  const r = await d.prepare('SELECT COUNT(*) AS n FROM likes WHERE post_id = ?').bind(id).first();
  return json({ likes: r ? r.n : 0 });
});
