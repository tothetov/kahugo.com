// POST /api/admin/moderate { postId, action: hide|restore|delete }
import { json, wrap, readJson, requireAdmin } from '../../_shared.js';
import { ensure } from '../../_db.js';
export const onRequestPost = wrap(async ({ request, env }) => {
  await requireAdmin(request, env);
  const { postId, action } = await readJson(request), d = await ensure(env), id = String(postId || '');
  if (action === 'delete') await d.batch([d.prepare('DELETE FROM posts WHERE id = ?').bind(id), d.prepare('DELETE FROM comments WHERE post_id = ?').bind(id), d.prepare('DELETE FROM likes WHERE post_id = ?').bind(id), d.prepare('DELETE FROM reports WHERE post_id = ?').bind(id)]);
  else if (action === 'hide' || action === 'restore') await d.batch([d.prepare('UPDATE posts SET hidden = ? WHERE id = ?').bind(action === 'hide' ? 1 : 0, id)].concat(action === 'restore' ? [d.prepare('DELETE FROM reports WHERE post_id = ?').bind(id)] : []));
  else return json({ error: 'action 값을 확인하세요.' }, 400);
  return json({ ok: true });
});
