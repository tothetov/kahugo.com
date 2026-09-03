// POST /api/access/approve  { uid }  → 관리자 승인. x-kahugo-token 필요.
import { json, cors, requireAdmin, readJson, loadAccessList, saveAccessList } from '../../_shared.js';

export async function onRequestPost({ request, env }) {
  const auth = requireAdmin(request, env);
  if (!auth.ok) return json({ error: auth.reason }, 401);
  const body = await readJson(request);
  if (!body || !body.uid) return json({ error: 'uid 필요' }, 400);
  const list = await loadAccessList(env);
  const rec = list.find(r => r.uid === body.uid);
  if (!rec) return json({ error: '해당 uid 신청 내역 없음' }, 404);
  rec.status = 'approved';
  rec.decidedAt = new Date().toISOString();
  await saveAccessList(env, list);
  return json({ ok: true, status: rec.status });
}

export async function onRequestOptions() {
  return cors(new Response(null, { status: 204 }));
}
