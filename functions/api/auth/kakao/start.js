// GET /api/auth/kakao/start?r=#/my → kakao 로그인 화면으로 이동
import { start } from '../_oauth.js';
export const onRequestGet = start('kakao');
