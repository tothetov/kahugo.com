// GET /api/access/status?uid=xxx  → { status: 'none'|'requested'|'approved'|'denied' }
// 프론트(views-v3.js syncBookAccess)가 승인 여부를 다른 기기에서도 확인하려고 폴링한다. 인증 불필요(uid는 추측 불가한 난수라 안전).
import { json, cors, loadAccessList } from '../../_shared.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const uid = url.searchParams.get('uid') || '';
  if (!uid) return json({ error: 'uid 필요' }, 400);
  const list = await loadAccessList(env);
  const rec = list.find(r => r.uid === uid);
  return json({ status: rec ? rec.status : 'none' });
}

export async function onRequestOptions() {
  return cors(new Response(null, { status: 204 }));
}
