// GET /api/config  → 공개: 실시간 편집으로 저장된 사이트 설정(없으면 {})
// PUT /api/config  → 관리자: 새 설정 저장(즉시 반영) + 최근 10개 이력
import { json, wrap, readJson, requireAdmin, kvGet, kvPut } from '../_shared.js';
export const onRequestGet = wrap(async ({ env }) => json(env.KAHUGO_KV ? await kvGet(env, 'kahugo:config', {}) : {}));
export const onRequestPut = wrap(async ({ request, env }) => {
  await requireAdmin(request, env);
  const body = await readJson(request, 2 * 1024 * 1024);
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: '설정 객체가 아닙니다.' }, 400);
  const prev = await kvGet(env, 'kahugo:config', null);
  if (prev) { const h = await kvGet(env, 'kahugo:config:history', []); h.unshift({ at: Date.now(), cfg: prev }); await kvPut(env, 'kahugo:config:history', h.slice(0, 10)); }
  await kvPut(env, 'kahugo:config', body);
  return json({ ok: true, savedAt: new Date().toISOString() });
});
