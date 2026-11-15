// GET /api/admin/inbox → 문의·커뮤니티 글(숨김 포함)·구독자
import { json, wrap, requireAdmin } from '../../_shared.js';
import { ensure, listPosts } from '../../_db.js';
export const onRequestGet = wrap(async ({ request, env }) => {
  await requireAdmin(request, env);
  const d = await ensure(env);
  const inq = ((await d.prepare('SELECT * FROM inquiries ORDER BY ts DESC LIMIT 1000').all()).results || []).map(q => ({ id: q.id, type: q.type, typeLabel: q.type_label, name: q.name, org: q.org, contact: q.contact, msg: q.msg, at: q.ts }));
  const subs = ((await d.prepare('SELECT contact, ts AS at FROM subscribers ORDER BY ts DESC LIMIT 20000').all()).results || []);
  return json({ inquiries: inq, posts: await listPosts(env, { includeHidden: true, limit: 500 }), subscribers: subs });
});
