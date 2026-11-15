// KAHUGO 9차 · Cloudflare Pages Functions 공통 유틸
// ─ 필요한 설정(Cloudflare 대시보드 › Workers & Pages › 프로젝트 › Settings)
//   KV 바인딩      : KAHUGO_KV  (사이트 설정·관리자 비밀번호)
//   D1 바인딩      : KAHUGO_DB  (커뮤니티·문의·구독 — 표는 자동 생성)
//   환경변수(암호화): KAHUGO_ADMIN_PASSWORD (관리자 최초 비밀번호), KAHUGO_SECRET (긴 임의 문자열, 토큰 서명용)
//   선택           : GITHUB_TOKEN, GITHUB_REPO(예: myid/kahugo), GITHUB_BRANCH(main), GITHUB_CONFIG_PATH
//                    KAKAO_REST_KEY, KAKAO_CLIENT_SECRET, NAVER_CLIENT_ID, NAVER_CLIENT_SECRET
//                    RESEND_API_KEY, RESEND_FROM, INQUIRY_TO (문의 메일 전달, 기본 habibot@naver.com)
export const VERSION = '9.0.0';
const enc = new TextEncoder();

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
}
export const bad = (msg, status = 400) => json({ error: msg }, status);

// 업로드 차단: JSON 본문만, 16KB 이하(관리자 설정 저장은 2MB까지)
export async function readJson(request, max = 16 * 1024) {
  const ct = request.headers.get('content-type') || '';
  if (!ct.includes('application/json')) throw Object.assign(new Error('JSON 본문만 받습니다(파일 업로드 불가).'), { status: 415 });
  const len = +(request.headers.get('content-length') || 0);
  if (len > max) throw Object.assign(new Error('본문이 너무 큽니다.'), { status: 413 });
  const text = await request.text();
  if (text.length > max) throw Object.assign(new Error('본문이 너무 큽니다.'), { status: 413 });
  let v; try { v = JSON.parse(text); } catch (e) { throw Object.assign(new Error('JSON 형식 오류'), { status: 400 }); }
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw Object.assign(new Error('JSON 객체가 필요합니다.'), { status: 400 });
  return v;
}
export function clean(s, max) { return String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max); }
export function uid(p = '') { const a = new Uint8Array(8); crypto.getRandomValues(a); return p + Date.now().toString(36) + [...a].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 8); }
export function ip(request) { return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '0.0.0.0'; }
export function needKV(env) { if (!env.KAHUGO_KV) throw Object.assign(new Error('KV(KAHUGO_KV)가 연결되지 않았습니다.'), { status: 503 }); return env.KAHUGO_KV; }

export async function kvGet(env, key, d) { const v = await needKV(env).get(key); if (v == null) return d; try { return JSON.parse(v); } catch (e) { return d; } }
export async function kvPut(env, key, val, opt) { await needKV(env).put(key, JSON.stringify(val), opt); }

// 도배·과부하 방지: IP별 시간창 안 횟수 제한
// (KV 무료 쓰기 한도를 아끼려고 Cloudflare Cache API에 카운터를 둔다 · 데이터센터 단위로 동작)
export async function rateLimit(env, request, name, limit, windowSec) {
  try {
    const cache = caches.default, key = new Request(`https://rl.kahugo.internal/${name}/${encodeURIComponent(ip(request))}`);
    const hit = await cache.match(key);
    const n = hit ? +(await hit.text()) || 0 : 0;
    if (n >= limit) return false;
    await cache.put(key, new Response(String(n + 1), { headers: { 'cache-control': `max-age=${Math.max(60, windowSec)}` } }));
    return true;
  } catch (e) { return true; }
}

// HMAC 서명 토큰
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64uStr = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64uStr = s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
function secret(env) { return env.KAHUGO_SECRET || env.KAHUGO_ADMIN_TOKEN || ''; }
async function hmac(env, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret(env)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}
function safeEq(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
export async function sign(env, payload) { if (!secret(env)) throw Object.assign(new Error('KAHUGO_SECRET 환경변수가 필요합니다.'), { status: 500 }); const body = b64uStr(JSON.stringify(payload)); return body + '.' + await hmac(env, body); }
export async function verify(env, token) {
  if (!token || !secret(env)) return null;
  const parts = String(token).split('.'); if (parts.length !== 2) return null;
  const [body, sig] = parts; if (!body || !sig) return null;
  if (!safeEq(sig, await hmac(env, body))) return null;
  try { const p = JSON.parse(fromB64uStr(body)); if (p.exp && Date.now() > p.exp) return null; return p; } catch (e) { return null; }
}
// 비밀번호 버전: 비밀번호가 바뀌면 값이 바뀌어, 그 전에 발급된 관리자 토큰은 모두 무효가 된다
export async function pwVersion(env) {
  const stored = (env.KAHUGO_KV ? await env.KAHUGO_KV.get('kahugo:admin:pw') : null) || ('env:' + (env.KAHUGO_ADMIN_PASSWORD || ''));
  const h = await crypto.subtle.digest('SHA-256', enc.encode(stored));
  return b64u(h).slice(0, 16);
}
export async function requireAdmin(request, env) {
  const p = await verify(env, request.headers.get('x-kahugo-token'));
  if (!p || p.role !== 'admin' || p.pv !== await pwVersion(env)) throw Object.assign(new Error('관리자 인증이 필요합니다.'), { status: 401 });
  return p;
}

// 비밀번호 해시(PBKDF2-SHA256)
export async function hashPw(pw, saltB64) {
  const salt = saltB64 ? Uint8Array.from(atob(saltB64), c => c.charCodeAt(0)) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 }, key, 256);
  return 'pbkdf2$100000$' + btoa(String.fromCharCode(...salt)) + '$' + btoa(String.fromCharCode(...new Uint8Array(bits)));
}
export async function checkPw(env, pw) {
  const stored = env.KAHUGO_KV ? await env.KAHUGO_KV.get('kahugo:admin:pw') : null;
  if (stored) { const salt = stored.split('$')[2]; return safeEq(await hashPw(pw, salt), stored); }
  const init = env.KAHUGO_ADMIN_PASSWORD || '';
  return !!init && safeEq(pw, init);
}

// 쿠키
export function getCookie(request, name) { const m = (request.headers.get('cookie') || '').match(new RegExp('(?:^|; )' + name + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : null; }
export function setCookie(name, val, maxAge) { return `${name}=${encodeURIComponent(val)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`; }
export function safeReturn(r) { return /^#\/[\w\-/?=&%.]*$/.test(r || '') ? r : '#/my'; }

// 함수 감싸기: 오류를 JSON으로
export function wrap(fn) { return async (ctx) => { try { return await fn(ctx); } catch (e) { const st = e.status || 500; return json({ error: st >= 500 && !e.status ? '서버 처리 중 문제가 생겼습니다.' : (e.message || '요청을 처리할 수 없습니다.') }, st); } }; }
