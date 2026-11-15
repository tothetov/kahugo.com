// GET  /api/community/posts → 공개 글 목록(최근 200, 댓글·공감 수 포함)
// POST /api/community/posts { board,title,body,author,anon } → 글 등록 (텍스트만 · 파일 불가 · IP당 10분 5건)
import { json, wrap, readJson, clean, uid, rateLimit } from '../../_shared.js';
import { ensure, listPosts } from '../../_db.js';
const BOARDS = ['free', 'qna', 'case', 'study', 'archive', 'suggest', 'book'];
export const onRequestGet = wrap(async ({ env }) => {
  const posts = await listPosts(env);
  return json({ posts: posts.map(({ hidden, reports, ...p }) => p) });
});
export const onRequestPost = wrap(async ({ request, env }) => {
  const b = await readJson(request);
  if (b.website) return json({ error: '등록할 수 없습니다.' }, 400); // 허니팟
  if (!(await rateLimit(env, request, 'post', 5, 600))) return json({ error: '등록이 너무 잦습니다.' }, 429);
  const title = clean(b.title, 80), body = clean(b.body, 2000);
  if (title.length < 2 || body.length < 5) return json({ error: '제목·내용을 확인하세요.' }, 400);
  const anon = b.anon !== false;
  const post = { id: uid('s'), board: BOARDS.includes(b.board) ? b.board : 'free', title, body, anon, author: anon ? '익명' : (clean(b.author, 60) || '익명'), likes: 0, ts: Date.now(), replies: [] };
  const d = await ensure(env);
  await d.prepare('INSERT INTO posts (id, board, title, body, author, anon, ts, hidden) VALUES (?, ?, ?, ?, ?, ?, ?, 0)').bind(post.id, post.board, title, body, post.author, anon ? 1 : 0, post.ts).run();
  return json({ post }, 201);
});
