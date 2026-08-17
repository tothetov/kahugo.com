/* ============================================================
   KAHUGO 콘텐츠 저장소 · Cloudflare Pages Function
   GET  /api/content            → { ok, content, updated }   (공개)
   PUT  /api/content            → { ok }                     (토큰 필요)
   ------------------------------------------------------------
   저장소는 Cloudflare KV 네임스페이스이며 바인딩 이름은 KAHUGO_KV 이다.
   바인딩이 없으면 사이트는 원본 콘텐츠로 그대로 동작한다.
   ============================================================ */

const KEY = 'content:v1';
const MAX_BYTES = 3 * 1024 * 1024;   /* 3MB — KV 값 한도 안쪽 */

function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extra
    }
  });
}

const enc = new TextEncoder();

async function sign(payload, secret) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function authed(request, env) {
  const secret = env.ADMIN_PASSWORD;
  if (!secret) return false;
  const raw = request.headers.get('Authorization') || '';
  const token = raw.replace(/^Bearer\s+/i, '').trim();
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'kahugo') return false;
  const exp = Number(parts[1]);
  if (!exp || Date.now() > exp) return false;
  const expected = await sign(`kahugo.${exp}`, secret);
  return safeEqual(parts[2], expected);
}

export async function onRequestGet({ env }) {
  if (!env.KAHUGO_KV) return json({ ok: true, content: null, note: 'KV 미연결 — 원본 콘텐츠 사용' });
  try {
    const raw = await env.KAHUGO_KV.get(KEY);
    if (!raw) return json({ ok: true, content: null });
    const saved = JSON.parse(raw);
    return json({ ok: true, content: saved.content, updated: saved.updated });
  } catch (e) {
    return json({ ok: true, content: null, note: '저장본을 읽지 못해 원본을 사용합니다.' });
  }
}

export async function onRequestPut({ request, env }) {
  if (!env.KAHUGO_KV) {
    return json({ ok: false, error: 'KV 네임스페이스(KAHUGO_KV)가 연결되지 않았습니다.' }, 500);
  }
  if (!(await authed(request, env))) {
    return json({ ok: false, error: '로그인이 필요합니다. 다시 로그인해 주세요.' }, 401);
  }

  let body;
  try { body = await request.json(); }
  catch { return json({ ok: false, error: '요청 형식이 올바르지 않습니다.' }, 400); }

  if (!body || !body.content || typeof body.content !== 'object') {
    return json({ ok: false, error: '저장할 내용이 없습니다.' }, 400);
  }

  const payload = JSON.stringify({ content: body.content, updated: new Date().toISOString() });
  if (payload.length > MAX_BYTES) {
    return json({ ok: false, error: `내용이 너무 큽니다 (${Math.round(payload.length / 1024)}KB). 큰 이미지를 줄여 주세요.` }, 413);
  }

  /* 직전 내용을 되돌리기용으로 한 벌 남긴다 */
  try {
    const prev = await env.KAHUGO_KV.get(KEY);
    if (prev) await env.KAHUGO_KV.put(KEY + ':prev', prev);
  } catch (e) { /* 백업 실패는 저장을 막지 않는다 */ }

  await env.KAHUGO_KV.put(KEY, payload);
  return json({ ok: true, updated: JSON.parse(payload).updated });
}

export async function onRequestDelete({ request, env }) {
  if (!env.KAHUGO_KV) return json({ ok: false, error: 'KV 미연결' }, 500);
  if (!(await authed(request, env))) return json({ ok: false, error: '로그인이 필요합니다.' }, 401);
  await env.KAHUGO_KV.delete(KEY);
  return json({ ok: true, note: '저장본을 지웠습니다. 사이트가 원본 콘텐츠로 돌아갑니다.' });
}
