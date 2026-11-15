// GET /api/auth/kakao/callback → 토큰 교환 · 닉네임만 받아 세션 쿠키 발급 후 사이트로 복귀
import { callback } from '../_oauth.js';
export const onRequestGet = callback('kakao');
