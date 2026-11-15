// GET /api/auth/me → 카카오·네이버 로그인 세션(쿠키)의 사용자
import { json, wrap, getCookie, verify } from '../../_shared.js';
export const onRequestGet = wrap(async ({ request, env }) => { const p = await verify(env, getCookie(request, 'kahugo_s')); return json({ user: p && p.user ? p.user : null }); });
