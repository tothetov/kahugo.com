// POST /api/community/report { postId, why } → 서로 다른 신고자(IP) 3명 이상이면 자동 숨김(관리자가 다시 공개 가능)
import { json, wrap, readJson, clean, ip, rateLimit } from '../../_shared.js';
import { ensure } from '../../_db.js';
export const onRequestPost = wrap(async ({ request, env }) => {
  const b = await readJson(request);
  if (!(await rateLimit(env, request, 'rep', 10, 600))) return json({ error: '잠시 후 다시 시도하세요.' }, 429);
  const d = await ensure(env), id = String(b.postId || '');
  if (!(await d.prepare('SELECT id FROM posts WHERE id = ?').bind(id).first())) return json({ error: '글을 찾을 수 없습니다.' }, 404);
  await d.prepare('INSERT OR IGNORE INTO reports (post_id, ip, why, ts) VALUES (?, ?, ?, ?)').bind(id, ip(request), clean(b.why, 40), Date.now()).run();
  const r = await d.prepare('SELECT COUNT(*) AS n FROM reports WHERE post_id = ?').bind(id).first();
  if (r && r.n >= 3) await d.prepare('UPDATE posts SET hidden = 1 WHERE id = ?').bind(id).run();
  return json({ ok: true });
});
