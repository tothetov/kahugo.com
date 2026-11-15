// KAHUGO 9차 · Cloudflare D1(SQLite) 저장소 — 커뮤니티·문의·구독
// D1 바인딩 이름: KAHUGO_DB (Settings › Bindings › D1 database). 표는 첫 요청 때 자동으로 만들어집니다.
// 한 줄씩 원자적으로 저장되므로 동시에 글·댓글이 몰려도 사라지지 않습니다(KV의 덮어쓰기 문제 해결).
let ready = null;
export function db(env) {
  if (!env.KAHUGO_DB) throw Object.assign(new Error('D1(KAHUGO_DB)이 연결되지 않았습니다.'), { status: 503 });
  return env.KAHUGO_DB;
}
export async function ensure(env) {
  const d = db(env);
  if (!ready) ready = d.batch([
    d.prepare('CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, board TEXT, title TEXT, body TEXT, author TEXT, anon INTEGER, ts INTEGER, hidden INTEGER DEFAULT 0)'),
    d.prepare('CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id TEXT, author TEXT, body TEXT, ts INTEGER)'),
    d.prepare('CREATE TABLE IF NOT EXISTS likes (post_id TEXT, ip TEXT, PRIMARY KEY (post_id, ip))'),
    d.prepare('CREATE TABLE IF NOT EXISTS reports (post_id TEXT, ip TEXT, why TEXT, ts INTEGER, PRIMARY KEY (post_id, ip))'),
    d.prepare('CREATE TABLE IF NOT EXISTS inquiries (id TEXT PRIMARY KEY, type TEXT, type_label TEXT, name TEXT, org TEXT, contact TEXT, msg TEXT, ts INTEGER)'),
    d.prepare('CREATE TABLE IF NOT EXISTS subscribers (contact TEXT PRIMARY KEY, ts INTEGER)'),
    d.prepare('CREATE INDEX IF NOT EXISTS idx_posts_ts ON posts (ts DESC)'),
    d.prepare('CREATE INDEX IF NOT EXISTS idx_comments_post ON comments (post_id, ts)')
  ]).catch(e => { ready = null; throw e; });
  await ready;
  return d;
}
// 글 목록 + 댓글 + 공감 수를 사이트가 쓰는 모양으로
export async function listPosts(env, { includeHidden = false, limit = 200 } = {}) {
  const d = await ensure(env);
  const posts = (await d.prepare(`SELECT p.*, (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes, (SELECT COUNT(*) FROM reports r WHERE r.post_id = p.id) AS reports FROM posts p ${includeHidden ? '' : 'WHERE p.hidden = 0'} ORDER BY p.ts DESC LIMIT ?`).bind(limit).all()).results || [];
  if (!posts.length) return [];
  const ids = posts.map(p => p.id);
  const cm = (await d.prepare(`SELECT post_id, author, body, ts FROM comments WHERE post_id IN (${ids.map(() => '?').join(',')}) ORDER BY ts`).bind(...ids).all()).results || [];
  return posts.map(p => ({ id: p.id, board: p.board, title: p.title, body: p.body, author: p.author, anon: !!p.anon, ts: p.ts, likes: p.likes, hidden: !!p.hidden, reports: p.reports,
    replies: cm.filter(c => c.post_id === p.id).map(c => ({ author: c.author, body: c.body, ts: c.ts })) }));
}
