/* ============================================================
   KAHUGO 관리자 로그인 · Cloudflare Pages Function
   POST /api/login   { password }  →  { ok, token, expires }
   ------------------------------------------------------------
   비밀번호는 코드에 넣지 않는다. Cloudflare 대시보드의
   「환경 변수 및 암호」에 ADMIN_PASSWORD 로 저장한다.
   발급 토큰은 서명된 문자열이며 기본 12시간 뒤 만료된다.
   ============================================================ */

const TTL_MS = 12 * 60 * 60 * 1000;   /* 12시간 */

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
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

/* 타이밍 공격을 줄이기 위한 상수 시간 비교 */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function onRequestPost({ request, env }) {
  const secret = env.ADMIN_PASSWORD;
  if (!secret) {
    return json({ ok: false, error: 'ADMIN_PASSWORD 환경 변수가 설정되지 않았습니다.' }, 500);
  }

  let body;
  try { body = await request.json(); }
  catch { return json({ ok: false, error: '요청 형식이 올바르지 않습니다.' }, 400); }

  const pw = String((body && body.password) || '');
  if (!safeEqual(pw, String(secret))) {
    /* 무차별 대입을 늦추기 위한 최소 지연 */
    await new Promise(r => setTimeout(r, 700));
    return json({ ok: false, error: '비밀번호가 맞지 않습니다.' }, 401);
  }

  const exp = Date.now() + TTL_MS;
  const payload = `kahugo.${exp}`;
  const token = `${payload}.${await sign(payload, secret)}`;
  return json({ ok: true, token, expires: exp });
}

export function onRequestGet() {
  return json({ ok: false, error: 'POST 로만 요청할 수 있습니다.' }, 405);
}
