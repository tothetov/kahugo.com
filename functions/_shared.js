// KAHUGO Cloudflare Pages Functions — 공통 유틸
// KV 네임스페이스 바인딩 이름: KAHUGO_KV (Cloudflare 대시보드 · Pages 프로젝트 · Settings › Functions › KV namespace bindings)
// 관리자 토큰: 환경변수 KAHUGO_ADMIN_TOKEN (Settings › Environment variables, "암호화" 체크)

export function cors(resp) {
  const h = new Headers(resp.headers);
  h.set('Access-Control-Allow-Origin', '*');
  h.set('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  h.set('Access-Control-Allow-Headers', 'content-type, x-kahugo-token');
  return new Response(resp.body, { status: resp.status, headers: h });
}

export function json(data, status) {
  return cors(new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  }));
}

export function requireAdmin(request, env) {
  const token = request.headers.get('x-kahugo-token') || '';
  const expected = env.KAHUGO_ADMIN_TOKEN || '';
  if (!expected) return { ok: false, reason: 'KAHUGO_ADMIN_TOKEN 환경변수가 설정되지 않았습니다.' };
  if (token !== expected) return { ok: false, reason: '토큰이 일치하지 않습니다.' };
  return { ok: true };
}

export async function readJson(request) {
  try { return await request.json(); } catch (e) { return null; }
}

export const ACCESS_LIST_KEY = 'kahugo:access:list';

export async function loadAccessList(env) {
  const raw = await env.KAHUGO_KV.get(ACCESS_LIST_KEY);
  try { return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
}

export async function saveAccessList(env, list) {
  await env.KAHUGO_KV.put(ACCESS_LIST_KEY, JSON.stringify(list));
}
