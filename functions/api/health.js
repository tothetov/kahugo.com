// GET /api/health → 사이트·관리자가 B안(실시간 편집) 서버를 감지하는 용도
import { json, VERSION } from '../_shared.js';
export const onRequestGet = ({ env }) => json({ ok: true, version: VERSION, kv: !!env.KAHUGO_KV, db: !!env.KAHUGO_DB, auth: !!(env.KAKAO_REST_KEY || env.NAVER_CLIENT_ID), github: env.GITHUB_REPO && env.GITHUB_TOKEN ? env.GITHUB_REPO : '' });
