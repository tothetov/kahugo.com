// GET  /api/config  → 저장된 사이트 설정(JSON)을 반환. 없으면 {} (관리자 B안 "실시간 편집 서버 감지"가 여기로 GET을 쏜다)
// PUT  /api/config  → 관리자 패널이 "서버에 즉시 반영" 시 보내는 새 설정을 저장. x-kahugo-token 헤더 필요.
import { json, cors, requireAdmin, readJson } from '../_shared.js';

const KEY = 'kahugo:config';

export async function onRequestGet({ env }) {
  const raw = await env.KAHUGO_KV.get(KEY);
  return json(raw ? JSON.parse(raw) : {});
}

export async function onRequestPut({ request, env }) {
  const auth = requireAdmin(request, env);
  if (!auth.ok) return json({ error: auth.reason }, 401);
  const body = await readJson(request);
  if (!body || typeof body !== 'object') return json({ error: '잘못된 본문(JSON 아님)' }, 400);
  await env.KAHUGO_KV.put(KEY, JSON.stringify(body));
  return json({ ok: true, savedAt: new Date().toISOString() });
}

export async function onRequestOptions() {
  return cors(new Response(null, { status: 204 }));
}
