// POST /api/access/request  { uid, name, provider }
// 로그인한 사용자가 "책전체보기"를 신청할 때 프론트(views-v3.js requestBookAccess)가 best-effort로 호출한다.
// 실패해도 로컬 localStorage 큐로 데모가 계속 동작하므로, 이 엔드포인트가 없어도 정적 배포는 문제없다.
import { json, cors, readJson, loadAccessList, saveAccessList } from '../../_shared.js';

export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  if (!body || !body.uid) return json({ error: 'uid 필요' }, 400);
  const list = await loadAccessList(env);
  let rec = list.find(r => r.uid === body.uid);
  const now = new Date();
  const nowLabel = now.getFullYear() + '.' + String(now.getMonth() + 1).padStart(2, '0') + '.' +
    String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  if (!rec) { rec = { uid: body.uid }; list.push(rec); }
  rec.name = body.name || rec.name || '';
  rec.provider = body.provider || rec.provider || '';
  rec.status = 'requested';
  rec.at = nowLabel;
  rec.ts = Date.now();
  await saveAccessList(env, list);
  return json({ ok: true, status: rec.status });
}

export async function onRequestOptions() {
  return cors(new Response(null, { status: 204 }));
}
