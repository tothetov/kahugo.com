// POST /api/subscribe { contact } → 파도 편지 구독 신청(D1 · 중복 무시 · IP당 10분 5건)
import { json, wrap, readJson, clean, rateLimit } from '../_shared.js';
import { ensure } from '../_db.js';
export const onRequestPost = wrap(async ({ request, env }) => {
  const b = await readJson(request);
  if (!(await rateLimit(env, request, 'sub', 5, 600))) return json({ error: '잠시 후 다시 시도하세요.' }, 429);
  const contact = clean(b.contact, 80);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact)) return json({ error: '이메일 형식을 확인하세요.' }, 400);
  await (await ensure(env)).prepare('INSERT OR IGNORE INTO subscribers (contact, ts) VALUES (?, ?)').bind(contact, Date.now()).run();
  return json({ ok: true }, 201);
});
