// POST /api/admin/login { password } → 12시간 유효 관리자 토큰
import { json, wrap, readJson, checkPw, sign, rateLimit, pwVersion } from '../../_shared.js';
export const onRequestPost = wrap(async ({ request, env }) => {
  if (!(await rateLimit(env, request, 'login', 10, 600))) return json({ error: '시도가 너무 많습니다. 10분 뒤 다시 시도하세요.' }, 429);
  const { password } = await readJson(request);
  if (!password || !(await checkPw(env, String(password)))) return json({ error: '비밀번호가 맞지 않습니다.' }, 401);
  return json({ token: await sign(env, { role: 'admin', pv: await pwVersion(env), exp: Date.now() + 12 * 3600e3 }) });
});
