// GET /api/auth/naver/start?r=#/my → naver 로그인 화면으로 이동
import { start } from '../_oauth.js';
export const onRequestGet = start('naver');
