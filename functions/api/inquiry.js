// POST /api/inquiry → 협력·상담 문의 저장(D1) (+선택: Resend로 메일 전달). IP당 10분 3건.
import { json, wrap, readJson, clean, uid, rateLimit } from '../_shared.js';
import { ensure } from '../_db.js';
export const onRequestPost = wrap(async ({ request, env }) => {
  const b = await readJson(request);
  if (b.website) return json({ error: '접수할 수 없습니다.' }, 400);
  if (!(await rateLimit(env, request, 'inq', 3, 600))) return json({ error: '문의가 너무 잦습니다.' }, 429);
  const q = { id: uid('q'), type: clean(b.type, 20), typeLabel: clean(b.typeLabel, 40), name: clean(b.name, 30), org: clean(b.org, 60), contact: clean(b.contact, 80), msg: clean(b.msg, 2000), at: Date.now() };
  if (!q.name || !q.contact || q.msg.length < 10) return json({ error: '필수 항목을 확인하세요.' }, 400);
  const d = await ensure(env);
  await d.prepare('INSERT INTO inquiries (id, type, type_label, name, org, contact, msg, ts) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(q.id, q.type, q.typeLabel, q.name, q.org, q.contact, q.msg, q.at).run();
  if (env.RESEND_API_KEY && env.RESEND_FROM) {
    try {
      await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({ from: env.RESEND_FROM, to: [env.INQUIRY_TO || 'habibot@naver.com'], subject: `[KAHUGO 문의] ${q.typeLabel} · ${q.name}`, text: `유형: ${q.typeLabel}\n이름: ${q.name}\n소속: ${q.org || '-'}\n연락처: ${q.contact}\n\n${q.msg}` }) });
    } catch (e) { /* 메일 실패해도 접수는 유지 */ }
  }
  return json({ ok: true, id: q.id }, 201);
});
