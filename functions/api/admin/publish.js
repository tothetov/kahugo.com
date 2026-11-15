// POST /api/admin/publish { config } → GitHub 저장소의 assets/data/site-config.json 커밋 → Cloudflare Pages 자동 재배포
import { json, wrap, readJson, requireAdmin, kvPut } from '../../_shared.js';
function b64utf8(str) { const bytes = new TextEncoder().encode(str); let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(bin); }
export const onRequestPost = wrap(async ({ request, env }) => {
  await requireAdmin(request, env);
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) return json({ error: 'GITHUB_TOKEN, GITHUB_REPO 환경변수를 먼저 설정하세요.' }, 400);
  const { config } = await readJson(request, 2 * 1024 * 1024);
  // KV(실시간) 설정이 GitHub 파일보다 우선하므로, 커밋 전에 서버에도 같은 내용을 반영해 어긋남을 막는다
  if (env.KAHUGO_KV) await kvPut(env, 'kahugo:config', config);
  const path = env.GITHUB_CONFIG_PATH || 'assets/data/site-config.json', branch = env.GITHUB_BRANCH || 'main';
  const url = `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}`;
  const h = { authorization: `Bearer ${env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json', 'user-agent': 'kahugo-admin', 'x-github-api-version': '2022-11-28' };
  let sha;
  const cur = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, { headers: h });
  if (cur.ok) sha = (await cur.json()).sha; else if (cur.status !== 404) return json({ error: 'GitHub 조회 실패: ' + cur.status }, 502);
  const res = await fetch(url, { method: 'PUT', headers: { ...h, 'content-type': 'application/json' }, body: JSON.stringify({ message: 'KAHUGO 관리자: 사이트 설정 갱신 ' + new Date().toISOString(), content: b64utf8(JSON.stringify(config)), sha, branch }) });
  const j = await res.json();
  if (!res.ok) return json({ error: 'GitHub 커밋 실패: ' + (j.message || res.status) }, 502);
  return json({ ok: true, commit: j.commit && j.commit.sha });
});
