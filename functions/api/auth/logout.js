// POST /api/auth/logout → 세션 쿠키 삭제
import { json } from '../../_shared.js';
export const onRequestPost = () => json({ ok: true }, 200, { 'set-cookie': 'kahugo_s=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0' });
