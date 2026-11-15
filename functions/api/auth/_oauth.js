// 카카오·네이버 OAuth 2.0 공통 (Authorization Code 방식 · state 쿠키로 CSRF 방지)
import { json, sign, getCookie, setCookie, safeReturn, uid } from '../../_shared.js';
const P = {
  kakao: {
    key: e => e.KAKAO_REST_KEY, auth: 'https://kauth.kakao.com/oauth/authorize', token: 'https://kauth.kakao.com/oauth/token', me: 'https://kapi.kakao.com/v2/user/me',
    profile: j => ({ id: 'kakao:' + j.id, name: (j.kakao_account && j.kakao_account.profile && j.kakao_account.profile.nickname) || (j.properties && j.properties.nickname) || '카카오 사용자' })
  },
  naver: {
    key: e => e.NAVER_CLIENT_ID, auth: 'https://nid.naver.com/oauth2.0/authorize', token: 'https://nid.naver.com/oauth2.0/token', me: 'https://openapi.naver.com/v1/nid/me',
    profile: j => ({ id: 'naver:' + (j.response && j.response.id), name: (j.response && (j.response.nickname || j.response.name)) || '네이버 사용자' })
  }
};
const secretOf = (p, env) => p === 'kakao' ? env.KAKAO_CLIENT_SECRET : env.NAVER_CLIENT_SECRET;
export function start(provider) {
  return async ({ request, env }) => {
    const cfg = P[provider], key = cfg.key(env);
    if (!key) return json({ error: provider + ' 로그인 키가 설정되지 않았습니다(관리자 가이드 참고).' }, 501);
    const url = new URL(request.url), state = uid('st'), r = safeReturn(url.searchParams.get('r'));
    const redirect = `${url.origin}/api/auth/${provider}/callback`;
    const q = new URLSearchParams({ response_type: 'code', client_id: key, redirect_uri: redirect, state });
    const h = new Headers({ location: `${cfg.auth}?${q}` });
    h.append('set-cookie', setCookie('kahugo_st', state + '|' + r, 600));
    return new Response(null, { status: 302, headers: h });
  };
}
export function callback(provider) {
  return async ({ request, env }) => {
    const cfg = P[provider], url = new URL(request.url), code = url.searchParams.get('code'), state = url.searchParams.get('state');
    const saved = (getCookie(request, 'kahugo_st') || '').split('|'), r = safeReturn(saved[1]);
    const fail = msg => new Response(null, { status: 302, headers: { location: `${url.origin}/#/my?login=fail&m=${encodeURIComponent(msg)}` } });
    if (!code || !state || state !== saved[0]) return fail('state');
    const body = new URLSearchParams({ grant_type: 'authorization_code', client_id: cfg.key(env), redirect_uri: `${url.origin}/api/auth/${provider}/callback`, code, state });
    const sec = secretOf(provider, env); if (sec) body.set('client_secret', sec);
    const tr = await fetch(cfg.token, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' }, body });
    const tj = await tr.json().catch(() => ({}));
    if (!tj.access_token) return fail('token');
    const mr = await fetch(cfg.me, { headers: { authorization: `Bearer ${tj.access_token}` } });
    const mj = await mr.json().catch(() => ({}));
    const prof = cfg.profile(mj); if (!prof.id || prof.id.endsWith('undefined')) return fail('profile');
    const user = { id: prof.id, name: String(prof.name).slice(0, 20), provider, at: Date.now() };
    const h = new Headers({ location: `${url.origin}/${r}` });
    h.append('set-cookie', setCookie('kahugo_s', await sign(env, { user, exp: Date.now() + 30 * 864e5 }), 30 * 86400));
    h.append('set-cookie', 'kahugo_st=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
    return new Response(null, { status: 302, headers: h });
  };
}
