// GET /api/access/list  → 관리자 패널 "회원승인" 탭이 전체 대기열을 조회할 때 사용(다기기 관리자 동기화용). x-kahugo-token 필요.
import { json, cors, requireAdmin, loadAccessList } from '../../_shared.js';

export async function onRequestGet({ request, env }) {
  const auth = requireAdmin(request, env);
  if (!auth.ok) return json({ error: auth.reason }, 401);
  const list = await loadAccessList(env);
  return json({ list: list });
}

export async function onRequestOptions() {
  return cors(new Response(null, { status: 204 }));
}
