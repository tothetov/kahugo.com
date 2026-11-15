// POST /api/admin/password { current, next } → 서버 비밀번호 변경(KV에 PBKDF2 해시 저장)
import { json, wrap, readJson, requireAdmin, checkPw, hashPw, needKV, sign, pwVersion } from '../../_shared.js';
export const onRequestPost = wrap(async ({ request, env }) => {
  await requireAdmin(request, env);
  const { current, next } = await readJson(request);
  if (!(await checkPw(env, String(current || '')))) return json({ error: '현재 비밀번호가 맞지 않습니다.' }, 401);
  const n = String(next || '');
  if (n.length < 8 || !/[A-Za-z]/.test(n) || !/\d/.test(n)) return json({ error: '8자 이상, 영문+숫자 조합이어야 합니다.' }, 400);
  await needKV(env).put('kahugo:admin:pw', await hashPw(n));
  // 기존 토큰은 모두 무효 → 지금 쓰는 화면이 끊기지 않도록 새 토큰을 돌려준다
  return json({ ok: true, token: await sign(env, { role: 'admin', pv: await pwVersion(env), exp: Date.now() + 12 * 3600e3 }) });
});
