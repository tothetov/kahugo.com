/* ============================================================
   KAHUGO PLATFORM · views-v3.js  (v3.0)
   한국AI휴먼전략연구원 · 신설 독립퍼널 확장 모듈
   ------------------------------------------------------------
   이 파일이 담당하는 것
     §A  공통 유틸 · 리더 엔진(진행률·이어읽기·큰글씨·하이라이트)
     §B  코너 1 · AI 신문명시대 미래예측 18가지   (#/futures)
     §C  코너 2 · 제5의 물결 낱말집 50            (#/lexicon)
     §D  코너 3 · 분야별 AI 신문명 사업 기회 30   (#/opps)
     §E  코너 4 · 제5의 물결 뉴스레터             (#/newsletter)
     §F  본문 전권 리더 37장                      (#/read)
     §G  표지 갤러리                              (#/covers)
     §H  더보기 시트 · 로그인(카카오/네이버)
     §I  섹션별 커뮤니티(댓글·투표) 엔진
     §J  설치 — 라우트/액션/네비/검색색인 등록
   ------------------------------------------------------------
   ★ 인라인 onclick 0건 · 외부 CDN 0건 · 웹폰트 0건
   ★ localStorage 직접 호출 0건 (A.store 래퍼만 사용)
   ★ 모든 data-action 은 §J 에서 ACTIONS 에 등록된다
   ============================================================ */
(function () {
  'use strict';

  var A = null;                 /* app.js 브리지 */
  var FUT, LEX, OPP, NEWS, MS;  /* 콘텐츠 모듈 */

  /* ══════════ §A. 공통 유틸 ══════════════════════════════ */
  var esc, ic, attr, uid, toast, go, $, $$, store;

  var K3 = {
    RD:   'kahugo.v3.read',      /* 읽기 진행률 { key: {p:0..100, at:ts, label} } */
    FS:   'kahugo.v3.fontsize',  /* 1~5 */
    NOTE: 'kahugo.v3.notes',     /* 마이노트 */
    HL:   'kahugo.v3.hl',        /* 하이라이트 */
    CM:   'kahugo.v3.comments',  /* 섹션별 댓글 */
    VOTE: 'kahugo.v3.votes',     /* 미래예측 체감투표 */
    SUB:  'kahugo.v3.news',      /* 뉴스레터 구독 */
    USER: 'kahugo.v3.user',      /* 로그인 사용자 */
    SEEN: 'kahugo.v3.seen',      /* 읽은 항목 */
    ACCQ: 'kahugo.v3.access.queue'  /* 책 전체보기 승인 대기열 (관리자와 공유 · 같은 도메인 내 동일 오리진) */
  };

  /* ══════════ §A-2. 책 전체보기 승인 게이트 ══════════════
     ※ 무료 공개 범위: 프론트매터 + 제1부(1~4장) = 58쪽 미리보기(#/preview),
        그리고 #/read/1~#/read/4 는 동일 범위이므로 함께 무료로 열어 둔다.
     ※ 5장부터 37장까지의 본문 전체는 "책전체보기신청" → 회원가입/로그인
        → 관리자 승인을 거쳐야 열람할 수 있다.
     ※ 승인 대기열은 이 오리진의 localStorage(K3.ACCQ)에 저장되며,
        /admin/ 페이지가 같은 도메인에 있으면 관리자가 그대로 열람·승인한다
        (동일 기기·동일 도메인 데모 기준). 여러 기기·다른 관리자 PC에서도
        승인이 반영되게 하려면 배포 패키지에 포함된 Cloudflare Worker
        백엔드(worker/index.js)를 연결하면 된다 — 그때는 fetch(API_BASE+...)
        로 같은 인터페이스가 자동 전환된다. */
  var FREE_CHAPTERS = [1, 2, 3, 4];   /* 제1부 · 미리보기와 동일 무료 범위 */

  function isFreeChapter(n) { return FREE_CHAPTERS.indexOf(n) >= 0; }

  function apiBase() {
    var m = document.querySelector('meta[name="kahugo-api"]');
    var on = m && m.getAttribute('content') === 'on' && /^https?:/i.test(location.protocol);
    if (!on) return null;
    var u = document.querySelector('meta[name="kahugo-api-base"]');
    return (u && u.getAttribute('content')) || '/api';
  }

  function loadQueue() { return store.get(K3.ACCQ, []) || []; }
  function saveQueue(q) { store.set(K3.ACCQ, q); }

  /* 관리자 승인 상태를 내 계정에 동기화한다.
     · 정적 배포(A안): 같은 오리진 localStorage 큐를 직접 조회(동일 기기·동일 브라우저 데모 기준)
     · 실시간 편집(B안, Cloudflare Worker 연결됨): /api/access/status?uid= 로 실제 서버 상태를 조회해
       다른 기기·다른 브라우저에서도 관리자 승인이 그대로 반영된다. 실패 시 로컬 값을 그대로 둔다. */
  function syncBookAccess() {
    if (!V.user || !V.user.uid) return;
    var q = loadQueue(), mine = null;
    for (var i = 0; i < q.length; i++) { if (q[i].uid === V.user.uid) { mine = q[i]; break; } }
    if (mine && mine.status && mine.status !== V.user.bookAccess) {
      V.user.bookAccess = mine.status;
      saveState();
    }
    var api = apiBase();
    if (api && typeof fetch === 'function') {
      try {
        fetch(api + '/access/status?uid=' + encodeURIComponent(V.user.uid))
          .then(function (r) { return r && r.ok ? r.json() : null; })
          .then(function (j) {
            if (j && j.status && V.user && j.status !== V.user.bookAccess) {
              V.user.bookAccess = j.status; saveState();
              if (typeof A !== 'undefined' && A.render) A.render();
            }
          }).catch(function () {});
      } catch (e) {}
    }
  }

  function bookAccessStatus() {
    if (!V.user) return 'guest';
    return V.user.bookAccess || 'none';
  }

  function hasFullBookAccess() {
    return bookAccessStatus() === 'approved';
  }

  function requestBookAccess() {
    if (!V.user) {
      toast('먼저 로그인(또는 가입 없이 둘러보기)해 주세요', 'warn');
      go('#/more?focus=login');
      return;
    }
    if (V.user.bookAccess === 'approved') { toast('이미 책 전체보기가 승인되어 있습니다'); return; }
    if (V.user.bookAccess === 'requested') { toast('이미 승인을 기다리고 있습니다. 관리자 확인 후 열람할 수 있습니다', 'warn'); return; }
    var q = loadQueue();
    var mine = null;
    for (var i = 0; i < q.length; i++) { if (q[i].uid === V.user.uid) { mine = q[i]; break; } }
    var rec = mine || { uid: V.user.uid };
    rec.name = V.user.name; rec.provider = V.user.provider;
    rec.status = 'requested'; rec.at = nowLabel(); rec.ts = Date.now();
    if (!mine) q.push(rec);
    saveQueue(q);
    V.user.bookAccess = 'requested';
    saveState();
    var api = apiBase();
    if (api) {
      try {
        fetch(api + '/access/request', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: V.user.uid, name: V.user.name, provider: V.user.provider })
        }).catch(function () {});
      } catch (e) {}
    }
    toast('책전체보기를 신청했습니다. 관리자 승인 후 열람할 수 있습니다', 'ok');
  }

  /* 잠금 화면 — 승인 상태별 안내 + CTA */
  function bookGate(opts) {
    opts = opts || {};
    var st = bookAccessStatus();
    var title = opts.title || '책 전체보기';
    var body, cta;
    if (st === 'approved') return '';  /* 호출부에서 걸러지지만 방어적으로 둔다 */
    if (st === 'requested') {
      body = '신청이 접수되었습니다. 관리자 승인이 완료되면 이 화면이 자동으로 본문으로 바뀝니다.';
      cta = '<span class="badge badge--wait">' + ic('bell') + '승인 대기 중</span>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-action="v3-access-recheck">' + ic('refresh') + '승인 여부 다시 확인</button>';
    } else if (st === 'denied') {
      body = '이번 신청은 보류되었습니다. 협력·문의로 사유를 남겨 주시면 다시 확인해 드립니다.';
      cta = '<a class="btn btn--ghost btn--sm" href="#/contact">' + ic('mail') + '문의하기</a>' +
        '<button type="button" class="btn btn--accent btn--sm" data-action="v3-access-request">' + ic('unlock') + '다시 신청하기</button>';
    } else if (st === 'guest') {
      body = '58쪽 무료 미리보기(프론트매터 + 1~4장)는 누구나 볼 수 있습니다. ' + title + ' 전체는 회원가입 후 관리자 승인을 받아야 열람할 수 있습니다.';
      cta = '<a class="btn btn--ghost btn--sm" href="#/preview">' + ic('pages') + '58쪽 무료 미리보기</a>' +
        '<button type="button" class="btn btn--accent btn--sm" data-action="v3-goto-login">' + ic('lock') + '로그인하고 신청하기</button>';
    } else {
      body = '58쪽 무료 미리보기 이후 구간입니다. ' + title + ' 전체를 보려면 책전체보기를 신청해 관리자 승인을 받아야 합니다.';
      cta = '<a class="btn btn--ghost btn--sm" href="#/preview">' + ic('pages') + '58쪽 무료 미리보기</a>' +
        '<button type="button" class="btn btn--accent btn--sm" data-action="v3-access-request">' + ic('unlock') + '책전체보기 신청하기</button>';
    }
    return '<div class="bkgate reveal">' + ic('lock') +
      '<h3>' + esc(title) + ' 전체보기는 승인이 필요합니다</h3>' +
      '<p>' + esc(body) + '</p>' +
      '<div class="row" style="margin-top:14px;justify-content:center">' + cta + '</div>' +
      '<p class="bkgate__n">※ 승인은 같은 브라우저 안에서 자동 반영됩니다. 다른 기기에서도 즉시 반영되게 하려면 관리자가 실시간 백엔드(B안)를 연결하면 됩니다.</p>' +
      '</div>';
  }

  var V = {};   /* v3 상태 */

  function loadState() {
    V.read  = store.get(K3.RD, {})   || {};
    V.fs    = store.get(K3.FS, 3)    || 3;
    V.notes = store.get(K3.NOTE, []) || [];
    V.hl    = store.get(K3.HL, [])   || [];
    V.cm    = store.get(K3.CM, {})   || {};
    V.vote  = store.get(K3.VOTE, {}) || {};
    V.sub   = store.get(K3.SUB, null);
    V.user  = store.get(K3.USER, null);
    V.seen  = store.get(K3.SEEN, {}) || {};
    syncBookAccess();
  }
  function saveState() {
    store.set(K3.RD, V.read);   store.set(K3.FS, V.fs);
    store.set(K3.NOTE, V.notes); store.set(K3.HL, V.hl);
    store.set(K3.CM, V.cm);     store.set(K3.VOTE, V.vote);
    store.set(K3.SUB, V.sub);   store.set(K3.USER, V.user);
    store.set(K3.SEEN, V.seen);
  }

  function n2(n) { return (n < 10 ? '0' : '') + n; }
  function nowLabel() {
    var d = new Date();
    return d.getFullYear() + '.' + n2(d.getMonth() + 1) + '.' + n2(d.getDate()) + ' ' +
           n2(d.getHours()) + ':' + n2(d.getMinutes());
  }
  function readMin(chars) { return Math.max(1, Math.round(chars / 850)); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 마킹 — 읽음 처리 */
  function markSeen(key) {
    if (!V.seen[key]) { V.seen[key] = Date.now(); saveState(); }
  }
  function seenCount(prefix) {
    var c = 0;
    for (var k in V.seen) if (V.seen.hasOwnProperty(k) && k.indexOf(prefix) === 0) c++;
    return c;
  }

  /* 진행률 저장 (이어읽기) */
  function setProgress(key, label, route, pct) {
    V.read[key] = { p: clamp(Math.round(pct), 0, 100), at: Date.now(), label: label, route: route };
    saveState();
  }
  function lastRead() {
    var best = null, k;
    for (k in V.read) {
      if (!V.read.hasOwnProperty(k)) continue;
      if (!best || V.read[k].at > best.at) best = V.read[k];
    }
    return best;
  }

  /* 문단 렌더 — 하이라이트 가능한 본문 */
  function paras(list, idPrefix) {
    return (list || []).map(function (t, i) {
      var id = idPrefix + '-p' + i;
      var on = V.hl.indexOf(t) >= 0;
      return '<p class="rd__p' + (on ? ' is-hl' : '') + '" id="' + attr(id) + '" data-txt="' + attr(t) + '">' +
        esc(t) +
        '<button type="button" class="rd__mark" data-action="v3-hl" data-txt="' + attr(t) + '" ' +
        'aria-label="' + (on ? '저장 해제' : '이 문장 저장') + '" title="' + (on ? '저장 해제' : '이 문장 저장') + '">' +
        ic('highlight') + '</button></p>';
    }).join('');
  }

  function bodyHtml(sections, idPrefix) {
    return (sections || []).map(function (s, i) {
      var h = s.h ? '<h3 class="rd__h" id="' + attr(idPrefix + '-h' + i) + '">' + esc(s.h) + '</h3>' : '';
      return '<section class="rd__sec">' + h + paras(s.p, idPrefix + '-s' + i) + '</section>';
    }).join('');
  }

  /* 읽기 도구막대 (큰글씨 · 저장 · 공유 · 목차) */
  function readerBar(opts) {
    return '<div class="rdbar" role="toolbar" aria-label="읽기 도구">' +
      '<button type="button" class="rdbar__b" data-action="v3-font" data-d="-1" aria-label="글자 작게">' + ic('aa') + '<span>작게</span></button>' +
      '<span class="rdbar__fs" id="v3-fs-label">' + V.fs + '단계</span>' +
      '<button type="button" class="rdbar__b" data-action="v3-font" data-d="1" aria-label="글자 크게">' + ic('aa') + '<span>크게</span></button>' +
      '<span class="rdbar__sp"></span>' +
      (opts.tocAction ? '<button type="button" class="rdbar__b" data-action="' + attr(opts.tocAction) + '" aria-label="목차 열기">' + ic('list') + '<span>목차</span></button>' : '') +
      '<button type="button" class="rdbar__b" data-action="v3-note-add" data-key="' + attr(opts.key || '') + '" data-label="' + attr(opts.label || '') + '" aria-label="메모 남기기">' + ic('pen') + '<span>메모</span></button>' +
      '<button type="button" class="rdbar__b" data-action="v3-share" data-title="' + attr(opts.label || '') + '" aria-label="공유하기">' + ic('share') + '<span>공유</span></button>' +
      '</div>';
  }

  function progressBar(pct) {
    return '<div class="rdprog" role="progressbar" aria-valuenow="' + Math.round(pct) + '" aria-valuemin="0" aria-valuemax="100" aria-label="읽기 진행률">' +
      '<i style="width:' + clamp(pct, 0, 100) + '%"></i></div>';
  }

  function hero(kicker, title, sub, deck, chips) {
    return '<header class="c3hero reveal">' +
      '<span class="c3hero__kick">' + esc(kicker) + '</span>' +
      '<h1 class="c3hero__t">' + esc(title) + '</h1>' +
      (sub ? '<p class="c3hero__s">' + esc(sub) + '</p>' : '') +
      (deck ? '<p class="c3hero__d">' + esc(deck) + '</p>' : '') +
      (chips ? '<div class="c3hero__chips">' + chips + '</div>' : '') +
      '</header>';
  }

  function stat(v, l) {
    return '<div class="c3stat"><b>' + esc(v) + '</b><span>' + esc(l) + '</span></div>';
  }

  function sectionCTA(title, body, btns) {
    return '<div class="c3cta reveal"><div><h3>' + esc(title) + '</h3><p>' + esc(body) + '</p></div>' +
      '<div class="c3cta__b">' + btns + '</div></div>';
  }

  function btn(label, route, kind, icon) {
    return '<a class="btn ' + (kind || 'btn--ghost') + ' btn--sm" href="' + attr(route) + '">' +
      (icon ? ic(icon) : '') + esc(label) + '</a>';
  }

  /* ══════════ §I. 섹션별 커뮤니티 (댓글 · 투표) ══════════ */
  function cmList(key) { return (V.cm[key] || []); }

  function communityBlock(key, label, opts) {
    opts = opts || {};
    var list = cmList(key);
    var head = '<div class="c3cm__head">' + ic('users') +
      '<h3>이 글에 남긴 생각 <b>' + list.length + '</b></h3>' +
      '<span class="c3cm__note">닉네임만 있으면 됩니다 · 비공개 옵션 제공</span></div>';

    var vote = '';
    if (opts.vote) {
      var vk = 'v-' + key, my = V.vote[vk] || '';
      vote = '<div class="c3vote"><span class="c3vote__q">' + esc(opts.vote) + '</span>' +
        ['그렇다', '아니다', '모르겠다'].map(function (o) {
          return '<button type="button" class="c3vote__b' + (my === o ? ' is-on' : '') +
            '" data-action="v3-vote" data-k="' + attr(vk) + '" data-v="' + attr(o) + '">' + esc(o) + '</button>';
        }).join('') +
        (my ? '<span class="c3vote__my">' + ic('check') + '내 선택: ' + esc(my) + '</span>' : '') +
        '</div>';
    }

    var form = '<form class="c3cm__form" data-cmkey="' + attr(key) + '" data-cmlabel="' + attr(label) + '">' +
      '<div class="c3cm__row">' +
        '<input class="input input--sm" name="who" maxlength="16" placeholder="닉네임" aria-label="닉네임" required>' +
        '<label class="c3cm__anon"><input type="checkbox" name="anon"> <span>익명으로</span></label>' +
      '</div>' +
      '<textarea class="input" name="body" rows="3" maxlength="600" placeholder="이 글에서 붙잡은 문장이나, 내 현장에 옮겨 볼 한 가지를 적어 보세요." aria-label="내용" required></textarea>' +
      '<div class="c3cm__row c3cm__row--end">' +
        '<span class="c3cm__hint">등록 시 이 기기에만 저장됩니다. 개인정보는 수집하지 않습니다.</span>' +
        '<button type="submit" class="btn btn--accent btn--sm">' + ic('pen') + '등록</button>' +
      '</div>' +
    '</form>';

    var items = list.length
      ? list.map(function (c) {
          return '<article class="c3cm__i" id="cm-' + attr(c.id) + '">' +
            '<div class="c3cm__meta"><b>' + esc(c.who) + '</b><span>' + esc(c.at) + '</span>' +
            '<button type="button" class="c3cm__x" data-action="v3-cm-del" data-key="' + attr(key) + '" data-id="' + attr(c.id) + '" aria-label="내 글 지우기">' + ic('trash') + '</button></div>' +
            '<p>' + esc(c.body) + '</p></article>';
        }).join('')
      : '<p class="c3cm__empty">' + ic('quote') + ' 아직 첫 생각이 없습니다. 한 줄이면 충분합니다.</p>';

    return '<div class="c3cm reveal" id="cm-box-' + attr(key) + '">' + head + vote + form +
      '<div class="c3cm__list">' + items + '</div></div>';
  }

  /* ══════════ §B. 코너 1 · 미래예측 18 ══════════════════ */
  function futChip(k) {
    return '<span class="tag tag--' + (k === '기회' ? 'op' : 'rk') + '">' +
      ic(k === '기회' ? 'sun' : 'shield') + esc(k) + '</span>';
  }

  function viewFutures(r) {
    var f = FUT, q = r.query || {};
    var filt = q.k || 'all';
    var items = f.items.filter(function (x) { return filt === 'all' || x.kind === filt; });
    var done = seenCount('f-');

    var chips = ['all', '기회', '위협'].map(function (k) {
      var label = k === 'all' ? '전체 ' + f.items.length : k + ' ' + (k === '기회' ? f.meta.op : f.meta.rk);
      return '<a class="chip' + (filt === k ? ' is-on' : '') + '" href="#/futures?k=' + encodeURIComponent(k) + '">' + esc(label) + '</a>';
    }).join('');

    var cards = items.map(function (x) {
      var seen = !!V.seen['f-' + x.id];
      return '<a class="fcard reveal' + (seen ? ' is-seen' : '') + '" href="#/futures/' + attr(x.id) + '">' +
        '<div class="fcard__top"><span class="fcard__no">' + n2(x.no) + '</span>' + futChip(x.kind) +
        (seen ? '<span class="fcard__seen">' + ic('check') + '읽음</span>' : '') + '</div>' +
        '<h3 class="fcard__t">' + esc(x.t) + '</h3>' +
        '<p class="fcard__s">' + esc(x.sub) + '</p>' +
        '<p class="fcard__lead">' + esc(x.lead) + '</p>' +
        '<div class="fcard__meta">' +
          '<span>' + ic('gauge') + '가능성 ' + esc(x.prob) + '</span>' +
          '<span>' + ic('clock') + esc(x.when) + '</span>' +
          '<span>' + ic('pages') + readMin(x.wc) + '분</span>' +
        '</div></a>';
    }).join('');

    return '<div class="wrap">' +
      A.crumb([{ t: '홈', route: '#/home' }, { t: 'AI 신문명시대 미래예측' }]) +
      hero(f.meta.part, f.meta.t, f.meta.sub, f.meta.deck,
        stat(f.meta.count + '개', '예측') + stat(f.meta.op + ' · ' + f.meta.rk, '기회 · 위협') +
        stat(done + '/' + f.meta.count, '내가 읽은 수') + stat(readMin(f.meta.wc) + '분', '전체 분량')) +

      '<div class="c3note reveal">' + ic('info') +
        '<div><b>이 코너는 도서 『제5의 물결과 AI 신문명시대』 별책부록 제8부 전문입니다.</b>' +
        '<span>예언이 아니라 지도입니다. 각 예측에는 <em>빗나갈 수 있는 조건</em>과 <em>오늘 할 일</em>이 함께 붙어 있습니다.</span></div></div>' +

      '<div class="c3filter">' + chips +
        '<a class="chip chip--ghost" href="#/futures?v=refs">' + ic('link') + '근거자료 ' + f.refs.length + '</a>' +
        '<a class="chip chip--ghost" href="#/futures?v=intro">' + ic('quote') + '여는 글</a>' +
      '</div>' +

      (q.v === 'intro' ? introPanel(f) : '') +
      (q.v === 'refs' ? refsPanel(f) : '') +

      '<div class="fgrid">' + cards + '</div>' +

      sectionCTA('열여덟 개를 다 읽을 필요는 없습니다',
        '심장이 한 번 뛴 항목에서 멈추고, 그 아래 「오늘 할 일」 한 줄만 이번 주에 실행해 보세요.',
        btn('낱말집 50 보기', '#/lexicon', 'btn--ghost', 'quote') +
        btn('사업 기회 30 보기', '#/opps', 'btn--ghost', 'target') +
        btn('뉴스레터 받기', '#/newsletter', 'btn--accent', 'mail')) +

      communityBlock('futures-hub', 'AI 신문명시대 미래예측',
        { vote: '열여덟 개 중, 내 삶에 가장 먼저 닿을 것은 기회 쪽인가?' }) +
      '</div>';
  }

  function introPanel(f) {
    return '<div class="c3panel reveal"><h3>' + ic('quote') + '여는 글 — 예언서를 펼치려 온 독자에게</h3>' +
      bodyHtml(f.intro, 'fi') +
      '<h3 style="margin-top:22px">' + ic('alert') + '예측의 한계</h3>' +
      bodyHtml(f.limit, 'fl') +
      '<a class="btn btn--ghost btn--sm" href="#/futures">' + ic('close') + '접기</a></div>';
  }

  function refsPanel(f) {
    return '<div class="c3panel reveal"><h3>' + ic('link') + '근거자료 ' + f.refs.length + '건</h3>' +
      '<p class="c3panel__lead">※ 아래는 도서 별책부록에 표기된 1차 출처 목록입니다. 원문 확인을 권합니다. ' +
      '수치는 발표 시점의 값이며, 바뀌면 바뀐 쪽이 맞습니다.</p>' +
      '<ol class="c3refs">' + f.refs.map(function (t) {
        return '<li>' + esc(t.replace(/^\d{1,3}\.\s*/, '')) + '</li>';
      }).join('') + '</ol>' +
      '<a class="btn btn--ghost btn--sm" href="#/futures">' + ic('close') + '접기</a></div>';
  }

  function viewFutureDetail(r) {
    var x = null, i = -1;
    FUT.items.forEach(function (v, k) { if (v.id === r.param) { x = v; i = k; } });
    if (!x) return notFound('미래예측', '#/futures');
    markSeen('f-' + x.id);
    var prev = FUT.items[i - 1], next = FUT.items[i + 1];
    var key = 'f-' + x.id;

    var act = x.act.length
      ? '<div class="c3act reveal"><h3>' + ic('target') + '오늘 할 일</h3><div class="c3act__g">' +
        x.act.map(function (a) {
          return '<div class="c3act__i"><b>' + esc(a.who) + '</b><p>' + esc(a.do) + '</p></div>';
        }).join('') + '</div></div>'
      : '';

    return '<div class="wrap wrap--read" data-read-key="' + attr(key) + '" data-read-label="' + attr('미래예측 ' + x.no + ' · ' + x.t) + '" data-read-route="#/futures/' + attr(x.id) + '">' +
      A.crumb([{ t: '홈', route: '#/home' }, { t: '미래예측', route: '#/futures' }, { t: '예측 ' + x.no }]) +
      progressBar(0) +
      '<header class="c3det reveal">' +
        '<div class="c3det__top"><span class="c3det__no">예측 ' + n2(x.no) + '</span>' + futChip(x.kind) + '</div>' +
        '<h1 class="c3det__t">' + esc(x.t) + '</h1>' +
        '<p class="c3det__s">' + esc(x.sub) + '</p>' +
        '<div class="c3det__meta">' +
          '<span>' + ic('gauge') + '가능성 <b>' + esc(x.prob) + '</b></span>' +
          '<span>' + ic('clock') + '중심 시기 <b>' + esc(x.when) + '</b></span>' +
          '<span>' + ic('pages') + '<b>' + readMin(x.wc) + '분</b> 분량</span>' +
        '</div>' +
        '<blockquote class="c3lead">' + esc(x.lead) + '</blockquote>' +
      '</header>' +
      readerBar({ key: key, label: '미래예측 ' + x.no + ' · ' + x.t }) +
      '<article class="rd rd--fs' + V.fs + '">' + bodyHtml(x.body, 'f' + x.no) + '</article>' +
      act +
      (x.q ? '<div class="c3q reveal">' + ic('quote') + '<div><b>스스로에게 묻기</b><p>' + esc(x.q) + '</p></div></div>' : '') +
      '<nav class="c3nav">' +
        (prev ? '<a class="c3nav__b" href="#/futures/' + attr(prev.id) + '">' + ic('prev') + '<span><i>이전</i>' + esc(prev.t) + '</span></a>' : '<span></span>') +
        (next ? '<a class="c3nav__b c3nav__b--n" href="#/futures/' + attr(next.id) + '"><span><i>다음</i>' + esc(next.t) + '</span>' + ic('chev') + '</a>' : '<span></span>') +
      '</nav>' +
      communityBlock(key, '예측 ' + x.no + ' · ' + x.t,
        { vote: '이 예측, 내 일터에는 이미 도착했는가?' }) +
      sectionCTA('다음 파도를 놓치지 않으려면',
        '뉴스레터를 신청하면 이 책의 한 장(章)씩을 매주 수요일 아침에 보내 드립니다.',
        btn('목록으로', '#/futures', 'btn--ghost', 'list') + btn('뉴스레터 구독', '#/newsletter', 'btn--accent', 'mail')) +
      '</div>';
  }

  /* ══════════ §C. 코너 2 · 낱말집 50 ════════════════════ */
  function viewLexicon(r) {
    var q = r.query || {}, gi = q.g == null ? 'all' : String(q.g);
    var kw = (q.q || '').trim();
    var terms = LEX.terms.filter(function (t) {
      if (gi !== 'all' && String(t.g) !== gi) return false;
      if (kw && (t.k + ' ' + t.d).toLowerCase().indexOf(kw.toLowerCase()) < 0) return false;
      return true;
    });

    var gchips = '<a class="chip' + (gi === 'all' ? ' is-on' : '') + '" href="#/lexicon">전체 50</a>' +
      LEX.groups.map(function (g, i) {
        var short = g.t.split('—')[1] ? g.t.split('—')[1].trim() : g.t;
        return '<a class="chip' + (gi === String(i) ? ' is-on' : '') + '" href="#/lexicon?g=' + i + '">' +
          esc(short) + ' ' + (g.to - g.from + 1) + '</a>';
      }).join('');

    var cards = terms.map(function (t) {
      return '<article class="lcard reveal" id="lx-' + t.n + '">' +
        '<div class="lcard__h"><span class="lcard__sym">' + esc(t.sym) + '</span>' +
        '<h3>' + esc(t.k) + '</h3>' +
        '<button type="button" class="lcard__b" data-action="v3-note-term" data-k="' + attr(t.k) + '" aria-label="이 낱말 메모에 담기">' + ic('plus') + '</button></div>' +
        '<p>' + esc(t.d) + '</p>' +
        '<div class="lcard__f">' +
          '<button type="button" class="lcard__x" data-action="v3-copy" data-txt="' + attr(t.k + ' — ' + t.d) + '">' + ic('link') + '문장 복사</button>' +
          '<a class="lcard__x" href="#/lexicon/' + t.n + '">' + ic('chev') + '자세히 · 생각 나누기</a>' +
        '</div></article>';
    }).join('');

    var gnote = (gi !== 'all' && LEX.groups[gi])
      ? '<div class="c3note reveal">' + ic('quote') + '<div><b>' + esc(LEX.groups[gi].t) + '</b><span>' + esc(LEX.groups[gi].d) + '</span></div></div>'
      : '';

    return '<div class="wrap">' +
      A.crumb([{ t: '홈', route: '#/home' }, { t: '제5의 물결 낱말집' }]) +
      hero(LEX.meta.part, LEX.meta.t, LEX.meta.sub, LEX.meta.deck,
        stat('50개', '신문명 키워드') + stat('5묶음', '읽는 순서') +
        stat(seenCount('lx-') + '개', '내가 담은 낱말') + stat('3개', '오늘의 목표')) +

      '<div class="c3note reveal">' + ic('info') +
        '<div><b>회의실에서 나만 모르는 말이 오간 적, 있습니까.</b>' +
        '<span>문명이 바뀔 때 가장 먼저 그어지는 선은 능력이 아니라 <em>어휘</em>였습니다. 이 코너는 도서 보너스장 전문입니다.</span></div></div>' +

      '<form class="c3search" data-lexsearch><label class="sr-only" for="lx-q">낱말 검색</label>' +
        ic('search') +
        '<input class="input input--sm" id="lx-q" name="q" value="' + attr(kw) + '" placeholder="낱말·설명에서 찾기 (예: 판단, 격차, 에이전트)" autocomplete="off">' +
        (kw ? '<a class="c3search__x" href="#/lexicon" aria-label="검색 지우기">' + ic('close') + '</a>' : '') +
      '</form>' +

      '<div class="c3filter">' + gchips + '</div>' + gnote +
      (terms.length ? '<div class="lgrid">' + cards + '</div>'
                    : '<p class="c3empty">' + ic('search') + ' 찾는 낱말이 없습니다. 다른 말로 찾아보세요.</p>') +

      sectionCTA('셋만 챙겨도 다음 회의의 자리가 바뀝니다',
        '외우지 마세요. 낱말은 암기의 대상이 아니라 렌즈입니다. 렌즈 하나를 갈아 끼우면 같은 풍경이 다르게 보입니다.',
        btn('미래예측 18 보기', '#/futures', 'btn--ghost', 'spark') +
        btn('본문 37장 읽기', '#/read', 'btn--ghost', 'book') +
        btn('뉴스레터 받기', '#/newsletter', 'btn--accent', 'mail')) +

      communityBlock('lexicon-hub', '제5의 물결 낱말집',
        { vote: '이 중 세 개를 이번 주 회의에서 실제로 써 보겠는가?' }) +
      '</div>';
  }

  function viewLexTerm(r) {
    var n = parseInt(r.param, 10);
    var t = null, i = -1;
    LEX.terms.forEach(function (v, k) { if (v.n === n) { t = v; i = k; } });
    if (!t) return notFound('낱말', '#/lexicon');
    markSeen('lx-' + t.n);
    var g = LEX.groups[t.g] || {};
    var prev = LEX.terms[i - 1], next = LEX.terms[i + 1];
    var key = 'lx-' + t.n;

    return '<div class="wrap wrap--read" data-read-key="' + attr(key) + '" data-read-label="' + attr('낱말 · ' + t.k) + '" data-read-route="#/lexicon/' + t.n + '">' +
      A.crumb([{ t: '홈', route: '#/home' }, { t: '낱말집', route: '#/lexicon' }, { t: t.k }]) +
      '<header class="c3det reveal">' +
        '<div class="c3det__top"><span class="c3det__no">' + esc(t.sym) + ' ' + n2(t.n) + '번</span>' +
        '<span class="tag tag--acc">' + esc((g.t || '').split('—')[1] || g.t || '') + '</span></div>' +
        '<h1 class="c3det__t">' + esc(t.k) + '</h1>' +
      '</header>' +
      '<article class="rd rd--fs' + V.fs + ' rd--term">' + paras([t.d], 'lx' + t.n) + '</article>' +
      readerBar({ key: key, label: '낱말 · ' + t.k }) +
      '<div class="c3act reveal"><h3>' + ic('target') + '이 낱말을 내 것으로 만드는 3단계</h3><div class="c3act__g">' +
        '<div class="c3act__i"><b>1 · 옮겨 적기</b><p>이 설명을 내 업무 언어로 한 문장으로 바꿔 적어 봅니다.</p></div>' +
        '<div class="c3act__i"><b>2 · 사례 찾기</b><p>지난 한 달 안에서 이 낱말이 들어맞는 장면을 하나 떠올립니다.</p></div>' +
        '<div class="c3act__i"><b>3 · 소리 내기</b><p>이번 주 회의에서 한 번 실제로 써 봅니다. 쓰는 순간 내 어휘가 됩니다.</p></div>' +
      '</div></div>' +
      '<nav class="c3nav">' +
        (prev ? '<a class="c3nav__b" href="#/lexicon/' + prev.n + '">' + ic('prev') + '<span><i>이전</i>' + esc(prev.k) + '</span></a>' : '<span></span>') +
        (next ? '<a class="c3nav__b c3nav__b--n" href="#/lexicon/' + next.n + '"><span><i>다음</i>' + esc(next.k) + '</span>' + ic('chev') + '</a>' : '<span></span>') +
      '</nav>' +
      communityBlock(key, '낱말 · ' + t.k, { vote: '이 낱말, 우리 조직에 이미 도착했는가?' }) +
      '</div>';
  }

  /* ══════════ §D. 코너 3 · 사업 기회 30 ═════════════════ */
  function viewOpps(r) {
    var q = r.query || {}, gi = q.g == null ? 'all' : String(q.g), tier = q.t || 'all';
    var items = OPP.items.filter(function (x) {
      if (gi !== 'all' && String(x.g) !== gi) return false;
      if (tier !== 'all' && x.tier !== tier) return false;
      return true;
    });
    var tiers = {};
    OPP.items.forEach(function (x) { tiers[x.tier] = (tiers[x.tier] || 0) + 1; });

    var gchips = '<a class="chip' + (gi === 'all' ? ' is-on' : '') + '" href="#/opps">전체 30</a>' +
      OPP.groups.map(function (g, i) {
        var short = g.t.split('—')[0].trim();
        return '<a class="chip' + (gi === String(i) ? ' is-on' : '') + '" href="#/opps?g=' + i + '">' +
          esc(g.sym + ' ' + short) + '</a>';
      }).join('');

    var tchips = '<a class="chip chip--sm' + (tier === 'all' ? ' is-on' : '') + '" href="#/opps' + (gi !== 'all' ? '?g=' + gi : '') + '">비용 전체</a>' +
      Object.keys(tiers).map(function (t) {
        var href = '#/opps?' + (gi !== 'all' ? 'g=' + gi + '&' : '') + 't=' + encodeURIComponent(t);
        return '<a class="chip chip--sm' + (tier === t ? ' is-on' : '') + '" href="' + href + '">' + esc(t) + ' ' + tiers[t] + '</a>';
      }).join('');

    var cards = items.map(function (x) {
      return '<a class="ocard reveal" href="#/opps/' + x.n + '">' +
        '<div class="ocard__h"><span class="ocard__no">' + n2(x.n) + '</span>' +
        '<span class="tag tag--tier">' + esc(x.tier) + '</span></div>' +
        '<h3 class="ocard__t">' + esc(x.k) + '</h3>' +
        '<p class="ocard__d">' + esc(x.d) + '</p>' +
        '<dl class="ocard__dl">' +
          '<div><dt>' + ic('cart') + '초기 비용</dt><dd>' + esc(x.cost.split('.')[0]) + '</dd></div>' +
          '<div><dt>' + ic('target') + '첫 고객</dt><dd>' + esc(x.first.split('.')[0]) + '</dd></div>' +
        '</dl></a>';
    }).join('');

    return '<div class="wrap">' +
      A.crumb([{ t: '홈', route: '#/home' }, { t: 'AI 신문명 사업 기회' }]) +
      hero(OPP.meta.part, OPP.meta.t, OPP.meta.sub, OPP.meta.deck,
        stat('30개', '사업 아이템') + stat('6묶음', '분야') +
        stat('월 5만~', '최저 시작 비용') + stat(seenCount('op-') + '개', '내가 본 아이템')) +

      '<div class="c3note reveal">' + ic('info') +
        '<div><b>세 줄이 목록과 사업의 경계선입니다.</b>' +
        '<span>비용을 모르면 시작을 미루고, 도구를 모르면 검색만 하다 저녁이 가고, 첫 고객을 모르면 만들어 놓고도 못 팝니다. ' +
        '※ 비용은 2026년 상반기 한국 시장 기준의 현실적 범위이며 환율·요금제에 따라 달라집니다. 숫자가 아니라 <em>자릿수</em>를 기억하세요.</span></div></div>' +

      '<div class="c3filter">' + gchips + '</div>' +
      '<div class="c3filter c3filter--sub">' + tchips + '</div>' +

      (items.length ? '<div class="ogrid">' + cards + '</div>'
                    : '<p class="c3empty">' + ic('filter') + ' 조건에 맞는 항목이 없습니다.</p>') +

      sectionCTA('서른 개를 다 읽지 마세요',
        '심장이 한 번 뛴 항목에서 멈추고, 세 번째 줄 「첫 고객」에 적힌 사람을 이번 주 안에 만나세요. 사업계획서는 그다음에 써도 늦지 않습니다.',
        btn('연구랩에서 검증하기', '#/labs', 'btn--ghost', 'flask') +
        btn('자가진단 받기', '#/diagnosis', 'btn--ghost', 'gauge') +
        btn('뉴스레터 받기', '#/newsletter', 'btn--accent', 'mail')) +

      communityBlock('opps-hub', 'AI 신문명 사업 기회 30',
        { vote: '이번 주 안에 「첫 고객」 칸의 사람을 실제로 만나 보겠는가?' }) +
      '</div>';
  }

  function viewOppDetail(r) {
    var n = parseInt(r.param, 10), x = null, i = -1;
    OPP.items.forEach(function (v, k) { if (v.n === n) { x = v; i = k; } });
    if (!x) return notFound('사업 기회', '#/opps');
    markSeen('op-' + x.n);
    var g = OPP.groups[x.g] || {};
    var prev = OPP.items[i - 1], next = OPP.items[i + 1];
    var key = 'op-' + x.n;

    return '<div class="wrap wrap--read" data-read-key="' + attr(key) + '" data-read-label="' + attr('사업기회 ' + x.n + ' · ' + x.k) + '" data-read-route="#/opps/' + x.n + '">' +
      A.crumb([{ t: '홈', route: '#/home' }, { t: '사업 기회', route: '#/opps' }, { t: x.k }]) +
      '<header class="c3det reveal">' +
        '<div class="c3det__top"><span class="c3det__no">' + n2(x.n) + '번</span>' +
        '<span class="tag tag--acc">' + esc(g.sym + ' ' + (g.t || '').split('—')[0].trim()) + '</span>' +
        '<span class="tag tag--tier">' + esc(x.tier) + '</span></div>' +
        '<h1 class="c3det__t">' + esc(x.k) + '</h1>' +
        '<p class="c3det__s">' + esc(x.d) + '</p>' +
      '</header>' +
      '<div class="o3grid reveal">' +
        '<div class="o3b"><div class="o3b__h">' + ic('cart') + '초기 비용</div><p>' + esc(x.cost) + '</p></div>' +
        '<div class="o3b"><div class="o3b__h">' + ic('grid') + '필요 도구</div><p>' + esc(x.tools) + '</p></div>' +
        '<div class="o3b o3b--key"><div class="o3b__h">' + ic('target') + '첫 고객</div><p>' + esc(x.first) + '</p></div>' +
      '</div>' +
      '<div class="c3act reveal"><h3>' + ic('spark') + '이번 주 실행 3단계</h3><div class="c3act__g">' +
        '<div class="c3act__i"><b>1 · 만나기</b><p>위 「첫 고객」에 적힌 사람 <b>세 명</b>의 이름을 지금 적어 보세요. 업종이 아니라 사람입니다.</p></div>' +
        '<div class="c3act__i"><b>2 · 듣기</b><p>제안하지 말고 30분만 들으세요. 그들이 <b>짜증 내는 지점</b>이 곧 첫 기능입니다.</p></div>' +
        '<div class="c3act__i"><b>3 · 숫자 받기</b><p>한 달을 무료로 해 주고 <b>변화한 숫자</b>를 받아내세요. 그 숫자가 첫 제안서입니다.</p></div>' +
      '</div></div>' +
      readerBar({ key: key, label: '사업기회 ' + x.n + ' · ' + x.k }) +
      '<nav class="c3nav">' +
        (prev ? '<a class="c3nav__b" href="#/opps/' + prev.n + '">' + ic('prev') + '<span><i>이전</i>' + esc(prev.k) + '</span></a>' : '<span></span>') +
        (next ? '<a class="c3nav__b c3nav__b--n" href="#/opps/' + next.n + '"><span><i>다음</i>' + esc(next.k) + '</span>' + ic('chev') + '</a>' : '<span></span>') +
      '</nav>' +
      communityBlock(key, '사업기회 ' + x.n + ' · ' + x.k,
        { vote: '이 아이템, 내가 이번 분기에 시작할 수 있는가?' }) +
      '</div>';
  }

  /* ══════════ §E. 코너 4 · 뉴스레터 ═════════════════════ */
  function viewNewsletter(r) {
    var q = r.query || {}, sub = V.sub;
    var track = q.t || 'all';
    var issues = NEWS.issues.filter(function (x) { return track === 'all' || x.track === track; });

    var tchips = '<a class="chip' + (track === 'all' ? ' is-on' : '') + '" href="#/newsletter">전체 ' + NEWS.issues.length + '호</a>' +
      NEWS.tracks.map(function (t) {
        var c = NEWS.issues.filter(function (i) { return i.track === t.id; }).length;
        return '<a class="chip' + (track === t.id ? ' is-on' : '') + '" href="#/newsletter?t=' + attr(t.id) + '">' + esc(t.t) + ' ' + c + '</a>';
      }).join('');

    var form = sub
      ? '<div class="nsub nsub--done reveal">' + ic('check') +
          '<div><b>구독 신청이 접수되었습니다.</b>' +
          '<p>' + esc(sub.email) + ' · ' + esc(sub.channel === 'kakao' ? '카카오톡 알림톡' : '이메일') +
          ' · 관심 트랙 ' + (sub.tracks && sub.tracks.length ? esc(sub.tracks.join(', ')) : '전체') + '</p>' +
          '<p class="nsub__note">첫 호는 다음 수요일 07:00에 도착합니다. 언제든 한 번의 클릭으로 해지할 수 있습니다.</p></div>' +
          '<button type="button" class="btn btn--ghost btn--sm" data-action="v3-unsub">' + ic('close') + '구독 해지</button>' +
        '</div>'
      : '<form class="nsub reveal" id="v3-sub-form">' +
          '<div class="nsub__h">' + ic('mail') + '<h3>매주 수요일 아침, 한 장(章)씩 도착합니다</h3></div>' +
          '<p class="nsub__lead">책 한 권을 ' + NEWS.issues.length + '주에 나눠 읽습니다. 한 통에 5분, 한 주에 한 걸음.</p>' +
          '<div class="nsub__row">' +
            '<div class="field"><label for="ns-email">이메일 주소</label>' +
              '<input class="input" id="ns-email" name="email" type="email" placeholder="name@example.com" autocomplete="email" required></div>' +
            '<div class="field"><label for="ns-name">이름 또는 닉네임 <span>(선택)</span></label>' +
              '<input class="input" id="ns-name" name="name" maxlength="20" placeholder="어떻게 불러 드릴까요"></div>' +
          '</div>' +
          '<fieldset class="nsub__fs"><legend>받는 방법</legend>' +
            '<label class="radio"><input type="radio" name="channel" value="email" checked> <span>' + ic('mail') + '이메일</span></label>' +
            '<label class="radio"><input type="radio" name="channel" value="kakao"> <span>' + ic('chat') + '카카오톡 알림톡</span></label>' +
          '</fieldset>' +
          '<fieldset class="nsub__fs"><legend>관심 트랙 <span>(복수 선택 · 선택 안 하면 전체 발송)</span></legend>' +
            NEWS.tracks.map(function (t) {
              return '<label class="chkbox"><input type="checkbox" name="tracks" value="' + attr(t.t) + '"> <span>' + esc(t.t) + '</span></label>';
            }).join('') +
          '</fieldset>' +
          '<label class="chkbox chkbox--agree"><input type="checkbox" name="agree" required> ' +
            '<span>발행 목적의 이메일 수신에 동의합니다. 수집 항목은 <b>이메일·닉네임</b>뿐이며, 해지 시 즉시 파기됩니다.</span></label>' +
          '<div class="nsub__btns">' +
            '<button type="submit" class="btn btn--accent">' + ic('mail') + '무료로 구독 신청</button>' +
            '<span class="nsub__hint">스팸 없음 · 주 1회 · 언제든 해지</span>' +
          '</div>' +
        '</form>';

    var cards = issues.map(function (x) {
      return '<article class="ncard reveal">' +
        '<div class="ncard__h"><span class="ncard__no">' + n2(x.no) + '호</span>' +
        '<span class="tag tag--acc">' + esc(x.trackName) + '</span>' +
        '<span class="ncard__min">' + ic('clock') + x.read + '분</span></div>' +
        '<h3 class="ncard__t">' + esc(x.t) + '</h3>' +
        '<p class="ncard__hook">' + esc(x.hook) + '</p>' +
        '<div class="ncard__f">' +
          '<a class="btn btn--ghost btn--xs" href="#/read/' + x.ch + '">' + ic('book') + '본문 ' + x.ch + '장 읽기</a>' +
          '<button type="button" class="btn btn--ghost btn--xs" data-action="v3-issue" data-no="' + x.no + '">' + ic('eye') + '이 호 미리보기</button>' +
        '</div></article>';
    }).join('');

    return '<div class="wrap">' +
      A.crumb([{ t: '홈', route: '#/home' }, { t: '뉴스레터' }]) +
      hero('제5의 물결 뉴스레터', NEWS.meta.t, NEWS.meta.sub, NEWS.meta.deck,
        stat(NEWS.issues.length + '호', '발행 예정') + stat('주 1회', '수요일 07:00') +
        stat('5분', '한 통 읽는 시간') + stat('무료', '구독료')) +
      form +
      '<div class="c3filter">' + tchips + '</div>' +
      '<div class="ngrid">' + cards + '</div>' +
      communityBlock('news-hub', '제5의 물결 뉴스레터',
        { vote: '매주 한 통, 끝까지 읽을 자신이 있는가?' }) +
      '</div>';
  }

  /* ══════════ §F. 본문 전권 리더 ════════════════════════ */
  function viewRead(r) {
    if (!MS) return notFound('본문', '#/book');
    if (r.param) return viewChapter(r);
    var q = r.query || {}, pi = q.p == null ? 'all' : String(q.p);
    var chs = MS.chapters.filter(function (c) { return pi === 'all' || String(c.part) === pi; });
    var lr = lastRead();
    var doneN = seenCount('ch-');

    var pchips = '<a class="chip' + (pi === 'all' ? ' is-on' : '') + '" href="#/read">전체 37장</a>' +
      MS.parts.map(function (p) {
        return '<a class="chip' + (pi === String(p.n) ? ' is-on' : '') + '" href="#/read?p=' + p.n + '">제' + p.n + '부 ' + p.chs.length + '장</a>';
      }).join('');

    var byPart = {};
    chs.forEach(function (c) { (byPart[c.part] = byPart[c.part] || []).push(c); });

    var unlocked = hasFullBookAccess();
    var list = MS.parts.filter(function (p) { return byPart[p.n]; }).map(function (p) {
      return '<section class="rlist reveal"><div class="rlist__h"><span>제' + p.n + '부</span><h3>' + esc(p.t) + '</h3></div>' +
        byPart[p.n].map(function (c) {
          var seen = !!V.seen['ch-' + c.n];
          var pr = V.read['ch-' + c.n];
          var open = isFreeChapter(c.n) || unlocked;
          return '<a class="rrow' + (seen ? ' is-seen' : '') + (open ? '' : ' rrow--lock') + '" href="#/read/' + c.n + '">' +
            '<span class="rrow__n">' + c.n + '장</span>' +
            '<span class="rrow__t">' + esc(c.t) + '</span>' +
            '<span class="rrow__m">' + (open ? ic('pages') + readMin(c.wc) + '분' : ic('lock') + '승인 필요') +
              (pr && pr.p > 3 ? '<i class="rrow__p">' + pr.p + '%</i>' : '') + '</span>' +
            ic('chev') + '</a>';
        }).join('') + '</section>';
    }).join('');

    return '<div class="wrap">' +
      A.crumb([{ t: '홈', route: '#/home' }, { t: '제5의 물결', route: '#/book' }, { t: '본문 읽기' }]) +
      hero('제5의 물결과 AI 신문명시대', '본문 전권 읽기', '7부 37장 · 별책부록 · 보너스장 · 부록까지',
        '목차를 훑다가 심장이 한 번 뛰는 곳에서 멈추면 됩니다. 거기가 당신의 파도입니다.',
        stat('37장', '본문') + stat(doneN + '/37', '내가 읽은 장') +
        stat(readMin(MS.chapters.reduce(function (a, c) { return a + c.wc; }, 0)) + '분', '전체 분량') +
        stat(unlocked ? '전체 열람' : '1~4장 무료', unlocked ? '책전체보기 승인됨' : '5장부터 승인 필요')) +
      (lr ? '<a class="rresume reveal" href="' + attr(lr.route) + '">' + ic('bookmark') +
        '<div><b>이어 읽기</b><span>' + esc(lr.label) + ' · ' + lr.p + '%까지 읽었습니다</span></div>' + ic('chev') + '</a>' : '') +
      '<div class="c3filter">' + pchips + '</div>' +
      list +
      (unlocked ? '' : bookGate({ title: '본문 5~37장' })) +
      sectionCTA('본문 밖의 세 코너도 전문 공개 중입니다',
        '별책부록 제8부(미래예측 18) · 보너스장(낱말집 50) · 부록 A(사업 기회 30)는 로그인 없이도 전문을 읽고 커뮤니티에 참여할 수 있습니다.',
        btn('미래예측 18', '#/futures', 'btn--ghost', 'spark') +
        btn('낱말집 50', '#/lexicon', 'btn--ghost', 'quote') +
        btn('사업 기회 30', '#/opps', 'btn--ghost', 'target')) +
      '</div>';
  }

  function viewChapter(r) {
    var n = parseInt(r.param, 10), c = null, i = -1;
    MS.chapters.forEach(function (v, k) { if (v.n === n) { c = v; i = k; } });
    if (!c) return notFound('장', '#/read');
    var p = null;
    MS.parts.forEach(function (x) { if (x.n === c.part) p = x; });
    var prev = MS.chapters[i - 1], next = MS.chapters[i + 1];
    var key = 'ch-' + c.n;
    var open = isFreeChapter(c.n) || hasFullBookAccess();

    var navBlock = '<nav class="c3nav">' +
        (prev ? '<a class="c3nav__b" href="#/read/' + prev.n + '">' + ic('prev') + '<span><i>' + prev.n + '장</i>' + esc(prev.t) + '</span></a>' : '<span></span>') +
        (next ? '<a class="c3nav__b c3nav__b--n" href="#/read/' + next.n + '"><span><i>' + next.n + '장</i>' + esc(next.t) + '</span>' + ic('chev') + '</a>' : '<span></span>') +
      '</nav>';

    if (!open) {
      var teaser = (c.body[0] && c.body[0].p && c.body[0].p[0]) ? c.body[0].p[0] : '';
      return '<div class="wrap">' +
        A.crumb([{ t: '홈', route: '#/home' }, { t: '본문', route: '#/read' }, { t: c.n + '장' }]) +
        '<header class="c3det reveal">' +
          '<div class="c3det__top"><span class="c3det__no">' + c.n + '장</span>' +
          '<span class="tag tag--acc">제' + c.part + '부 · ' + esc(p ? p.t : '') + '</span></div>' +
          '<h1 class="c3det__t">' + esc(c.t) + '</h1>' +
          '<div class="c3det__meta"><span>' + ic('pages') + '<b>' + readMin(c.wc) + '분</b> 분량</span>' +
          '<span>' + ic('lock') + '<b>5장부터 승인 필요</b></span></div>' +
        '</header>' +
        (teaser ? '<p class="rd__teaser">' + esc(teaser) + '&hellip;</p>' : '') +
        bookGate({ title: c.n + '장 「' + c.t + '」' }) +
        navBlock +
        '</div>';
    }

    markSeen('ch-' + c.n);
    return '<div class="wrap wrap--read" data-read-key="' + attr(key) + '" data-read-label="' + attr(c.n + '장 · ' + c.t) + '" data-read-route="#/read/' + c.n + '">' +
      A.crumb([{ t: '홈', route: '#/home' }, { t: '본문', route: '#/read' }, { t: c.n + '장' }]) +
      progressBar(0) +
      '<header class="c3det reveal">' +
        '<div class="c3det__top"><span class="c3det__no">' + c.n + '장</span>' +
        '<span class="tag tag--acc">제' + c.part + '부 · ' + esc(p ? p.t : '') + '</span></div>' +
        '<h1 class="c3det__t">' + esc(c.t) + '</h1>' +
        '<div class="c3det__meta"><span>' + ic('pages') + '<b>' + readMin(c.wc) + '분</b> 분량</span>' +
        '<span>' + ic('layers') + '<b>' + c.body.length + '</b>개 절</span></div>' +
      '</header>' +
      readerBar({ key: key, label: c.n + '장 · ' + c.t, tocAction: 'v3-toc' }) +
      '<article class="rd rd--fs' + V.fs + '">' + bodyHtml(c.body, 'ch' + c.n) + '</article>' +
      navBlock +
      communityBlock(key, c.n + '장 · ' + c.t, { vote: '이 장에서 오늘 바로 옮길 한 가지를 찾았는가?' }) +
      '</div>';
  }

  /* ══════════ §G. 표지 갤러리 ══════════════════════════ */
  function viewCovers() {
    var imgs = [
      { s: 'assets/book-cover-dark.jpg',  t: '앞표지 · 다크 에디션', d: '밤바다 위 별자리 — 「제5의 물결」의 기본 표지입니다.' },
      { s: 'assets/book-cover-light.jpg', t: '앞표지 · 라이트 에디션', d: '종이책 판형에 맞춘 밝은 표지 변형입니다.' },
      { s: 'assets/book-back.jpg',        t: '뒤표지', d: '핵심 카피 · 이 책이 답하는 질문 · 독자 대상이 담겨 있습니다.' },
      { s: 'assets/book-spread.jpg',      t: '표지 전개도 (앞·책등·뒤)', d: '인쇄용 전개 시안입니다.' }
    ];
    return '<div class="wrap">' +
      A.crumb([{ t: '홈', route: '#/home' }, { t: '제5의 물결', route: '#/book' }, { t: '표지' }]) +
      hero('BOOK COVER', '표지 갤러리', '제5의 물결과 AI 신문명시대', '앞표지 · 뒤표지 · 전개도를 원본 크기로 확인할 수 있습니다.', '') +
      '<div class="cvgrid">' + imgs.map(function (x) {
        return '<figure class="cvfig reveal">' +
          '<button type="button" class="cvfig__b" data-action="v3-zoom" data-src="' + attr(x.s) + '" data-t="' + attr(x.t) + '" aria-label="' + attr(x.t + ' 크게 보기') + '">' +
          '<img src="' + attr(x.s) + '" alt="' + attr(x.t) + '" loading="lazy" decoding="async">' +
          '<span class="cvfig__z">' + ic('search') + '크게 보기</span></button>' +
          '<figcaption><b>' + esc(x.t) + '</b><span>' + esc(x.d) + '</span></figcaption>' +
        '</figure>';
      }).join('') + '</div>' +
      sectionCTA('표지를 보셨다면, 안을 읽어 보세요',
        '58쪽 무료 미리보기(프론트매터 + 1~4장)와 별책부록·보너스장·부록 A는 누구나 볼 수 있습니다. 5장부터는 회원가입 후 관리자 승인을 받아 열람합니다.',
        btn('본문 읽기', '#/read', 'btn--accent', 'book') + btn('책 소개', '#/book', 'btn--ghost', 'wave2')) +
      '</div>';
  }

  /* ══════════ §H. 더보기 · 로그인 ═══════════════════════ */
  var MORE = [
    { g: '이 책의 코너', items: [
      { t: '제5의 물결 · 도서 허브', d: '책 소개 · 목차 · 독서경로', r: '#/book', i: 'wave2' },
      { t: '본문 전권 읽기 37장', d: '1~4장 무료, 5장부터 승인 필요', r: '#/read', i: 'book' },
      { t: 'AI 신문명시대 미래예측 18', d: '기회 아홉 · 위협 아홉', r: '#/futures', i: 'spark' },
      { t: '제5의 물결 낱말집 50', d: '신문명 키워드 사전', r: '#/lexicon', i: 'quote' },
      { t: 'AI 신문명 사업 기회 30', d: '초기비용 · 도구 · 첫 고객', r: '#/opps', i: 'target' },
      { t: '표지 갤러리', d: '앞표지 · 뒤표지 · 전개도', r: '#/covers', i: 'pages' },
      { t: '도서 미리보기', d: '프론트매터 + 1~4장', r: '#/preview', i: 'eye' }
    ] },
    { g: '연구원', items: [
      { t: '연구 허브', d: '12대 AI휴먼전략 아젠다', r: '#/research', i: 'compass' },
      { t: '연구랩', d: '분야별 실험·검증 조직', r: '#/labs', i: 'flask' },
      { t: '4대 사업축', d: '포럼 · 아카데미 · 랩 · 리포트', r: '#/programs', i: 'cap' },
      { t: '출판 · 리포트', d: '발간물과 발행 알림', r: '#/publications', i: 'pages' },
      { t: 'AI휴먼전략 자가진단', d: '30초 · 가입 불필요', r: '#/diagnosis', i: 'gauge' },
      { t: '연구원 소개', d: '10대 창립선언과 정체성', r: '#/about', i: 'info' }
    ] },
    { g: '참여 · 연결', items: [
      { t: '뉴스레터 구독', d: '매주 수요일 아침 한 장씩', r: '#/newsletter', i: 'mail' },
      { t: '커뮤니티', d: '질문과 사례를 나누는 자리', r: '#/community', i: 'users' },
      { t: '내 서재', d: '노트 · 저장 문장 · 이어읽기', r: '#/my', i: 'bookmark' },
      { t: '협력 · 파트너십', d: '함께 만드는 방법', r: '#/partnership', i: 'handshake' },
      { t: '협력 · 문의하기', d: 'habibot@gmail.com', r: '#/contact', i: 'mail' }
    ] }
  ];

  function bookAccessCard() {
    var u = V.user, st = bookAccessStatus();
    if (!u) return '';
    var map = {
      approved:  { b: 'badge--ok',   t: '책 전체보기 승인됨',   d: '5장부터 37장까지 전체 본문을 볼 수 있습니다.', act: '' },
      requested: { b: 'badge--wait', t: '책 전체보기 승인 대기 중', d: '관리자 확인 후 자동으로 열립니다.',
        act: '<button type="button" class="btn btn--ghost btn--sm" data-action="v3-access-recheck">' + ic('refresh') + '지금 확인</button>' },
      denied:    { b: 'badge--danger', t: '책 전체보기 신청 보류됨', d: '문의 후 다시 신청할 수 있습니다.',
        act: '<button type="button" class="btn btn--accent btn--sm" data-action="v3-access-request">' + ic('unlock') + '다시 신청</button>' },
      none:      { b: '', t: '책 전체보기 미신청', d: '5장부터는 신청·승인 후 열람할 수 있습니다.',
        act: '<button type="button" class="btn btn--accent btn--sm" data-action="v3-access-request">' + ic('unlock') + '책전체보기 신청</button>' }
    };
    var m = map[st] || map.none;
    return '<div class="mlogin reveal" style="margin-top:10px">' + ic('book') +
      '<div><b>' + esc(m.t) + '</b><span>' + esc(m.d) + '</span></div>' +
      '<div class="row">' + m.act + '</div></div>';
  }

  function viewMore() {
    var u = V.user;
    return '<div class="wrap">' +
      A.crumb([{ t: '홈', route: '#/home' }, { t: '더보기' }]) +
      '<header class="c3hero c3hero--sm reveal"><h1 class="c3hero__t">더보기</h1>' +
      '<p class="c3hero__s">KAHUGO의 모든 코너를 한 화면에서 찾을 수 있습니다.</p></header>' +
      '<div id="more-login">' +
      (u
        ? '<div class="mlogin mlogin--on reveal">' + ic('check') + '<div><b>' + esc(u.name) + '님, 환영합니다</b>' +
          '<span>' + esc(u.provider === 'kakao' ? '카카오' : (u.provider === 'naver' ? '네이버' : '게스트')) + ' 계정으로 이용 중입니다.</span></div>' +
          '<button type="button" class="btn btn--ghost btn--sm" data-action="v3-logout">' + ic('close') + '로그아웃</button></div>'
        : '<div class="mlogin reveal"><div class="mlogin__t">' + ic('lock') +
          '<div><b>3초 로그인</b><span>노트·저장 문장·읽던 위치를 기기 사이에서 이어 가고, 책전체보기도 신청할 수 있습니다.</span></div></div>' +
          '<div class="mlogin__b">' +
            '<button type="button" class="sso sso--kakao" data-action="v3-login" data-p="kakao">' + ic('chat') + '카카오로 시작하기</button>' +
            '<button type="button" class="sso sso--naver" data-action="v3-login" data-p="naver"><b>N</b>네이버로 시작하기</button>' +
            '<button type="button" class="sso sso--guest" data-action="v3-login" data-p="guest">' + ic('users') + '가입 없이 둘러보기</button>' +
          '</div>' +
          '<p class="mlogin__n">※ 수집 항목은 <b>닉네임·프로필 이미지</b>뿐입니다. 이메일·연락처는 받지 않습니다.</p></div>') +
      bookAccessCard() +
      '</div>' +
      MORE.map(function (g) {
        return '<section class="mgrp reveal"><h2 class="mgrp__h">' + esc(g.g) + '</h2><div class="mgrid">' +
          g.items.map(function (x) {
            return '<a class="mtile" href="' + attr(x.r) + '">' + ic(x.i) +
              '<span><b>' + esc(x.t) + '</b><i>' + esc(x.d) + '</i></span>' + ic('chev') + '</a>';
          }).join('') + '</div></section>';
      }).join('') +
      '<div class="mfoot reveal">' +
        '<button type="button" class="btn btn--ghost btn--sm" data-action="v3-export">' + ic('download') + '내 기록 내려받기</button>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-action="env-help">' + ic('alert') + '이동이 막히나요?</button>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-action="install-pwa">' + ic('install') + '앱으로 설치</button>' +
      '</div></div>';
  }

  /* ── 홈: 이 책의 4대 코너 ── */
  function homeCorners() {
    var lr = lastRead();
    var cards = [
      { r: '#/read', i: 'book', k: '본문 전권 · 37장',
        t: '제5의 물결과 AI 신문명시대', d: '1~4장은 누구나 무료로, 5장부터는 승인 후 열람합니다. 목차를 훑다가 심장이 한 번 뛰는 곳에서 멈추세요.',
        m: (MS ? MS.chapters.length + '장 · 약 ' + readMin(MS.chapters.reduce(function (a, c) { return a + c.wc; }, 0)) + '분' : '전문 공개'), a: true },
      { r: '#/futures', i: 'spark', k: '별책부록 제8부',
        t: 'AI 신문명시대 미래예측 18가지', d: '기회 아홉, 위협 아홉. 각 예측에 「빗나갈 수 있는 조건」과 「오늘 할 일」이 붙어 있습니다.',
        m: FUT.meta.count + '개 예측 · 근거 ' + FUT.refs.length + '건' },
      { r: '#/lexicon', i: 'quote', k: '보너스장',
        t: '제5의 물결 낱말집 50', d: '문명이 바뀔 때 가장 먼저 그어지는 선은 능력이 아니라 어휘였습니다. 셋만 챙겨도 회의의 자리가 바뀝니다.',
        m: LEX.meta.count + '개 키워드 · 5묶음' },
      { r: '#/opps', i: 'target', k: '부록 A',
        t: '분야별 AI 신문명 사업 기회 30', d: '초기 비용 · 필요 도구 · 첫 고객까지. 목록과 사업을 가르는 세 줄이 전부 적혀 있습니다.',
        m: OPP.meta.count + '개 아이템 · 6분야' }
    ];
    return '<section class="sec sec--alt"><div class="wrap">' +
      '<div class="sec__head"><span class="sec__eyebrow">이 책의 코너 · 전문 무료 공개</span>' +
      '<h2 class="sec__title">『제5의 물결과 AI 신문명시대』를 사이트에서 그대로 읽습니다</h2>' +
      '<p class="sec__sub">읽고, 표시하고, 메모하고, 다른 독자와 생각을 나눌 수 있습니다. 가입은 필요 없습니다.</p></div>' +
      (lr ? '<a class="rresume reveal" href="' + attr(lr.route) + '">' + ic('bookmark') +
        '<div><b>이어 읽기</b><span>' + esc(lr.label) + ' · ' + lr.p + '%까지 읽었습니다</span></div>' + ic('chev') + '</a>' : '') +
      '<div class="hcgrid">' + cards.map(function (c) {
        return '<a class="hcard reveal' + (c.a ? ' hcard--key' : '') + '" href="' + attr(c.r) + '">' +
          '<span class="hcard__ic">' + ic(c.i) + '</span>' +
          '<span class="hcard__k">' + esc(c.k) + '</span>' +
          '<b class="hcard__t">' + esc(c.t) + '</b>' +
          '<span class="hcard__d">' + esc(c.d) + '</span>' +
          '<span class="hcard__m">' + ic('pages') + esc(c.m) + ic('chev') + '</span>' +
        '</a>';
      }).join('') + '</div>' +
      '<div class="hcmore">' +
        '<a class="btn btn--ghost btn--sm" href="#/book">' + ic('wave2') + '책 소개 · 독서경로</a>' +
        '<a class="btn btn--ghost btn--sm" href="#/covers">' + ic('pages') + '표지 갤러리</a>' +
        '<a class="btn btn--ghost btn--sm" href="#/preview">' + ic('eye') + '미리보기</a>' +
        '<a class="btn btn--ghost btn--sm" href="#/community">' + ic('users') + '커뮤니티</a>' +
      '</div>' +
      '</div></section>';
  }

  /* ── 홈: 뉴스레터 전환 밴드 ── */
  function homeNewsBand() {
    if (V.sub) {
      return '<section class="sec"><div class="wrap"><div class="nband nband--on reveal">' + ic('check') +
        '<div><b>뉴스레터를 구독 중입니다</b><span>다음 수요일 07:00에 다음 호가 도착합니다.</span></div>' +
        '<a class="btn btn--ghost btn--sm" href="#/newsletter">지난 호 보기</a></div></div></section>';
    }
    return '<section class="sec"><div class="wrap"><div class="nband reveal">' +
      '<div class="nband__t">' + ic('mail') +
        '<div><b>매주 수요일 아침, 한 장(章)씩 도착합니다</b>' +
        '<span>책 한 권을 ' + NEWS.issues.length + '주에 나눠 읽습니다. 한 통에 5분, 한 주에 한 걸음. 무료입니다.</span></div></div>' +
      '<a class="btn btn--accent" href="#/newsletter">' + ic('mail') + '무료 구독 신청</a>' +
      '</div></div></section>';
  }

  /* ── 내 서재: v3 기록 패널 ── */
  function myPanel() {
    var rl = [];
    for (var k in V.read) if (V.read.hasOwnProperty(k)) rl.push(V.read[k]);
    rl.sort(function (a, b) { return b.at - a.at; });
    rl = rl.slice(0, 8);

    var tabs =
      '<div class="mypv reveal">' +
        '<div class="mypv__h">' + ic('bookmark') + '<h2>내 읽기 기록</h2>' +
          '<span class="mypv__c">저장 문장 ' + V.hl.length + ' · 메모 ' + V.notes.length + ' · 읽던 글 ' + rl.length + '</span>' +
          '<button type="button" class="btn btn--ghost btn--xs" data-action="v3-export">' + ic('download') + '내려받기</button>' +
        '</div>' +
        (rl.length
          ? '<div class="mypv__sec"><h3>' + ic('clock') + '이어 읽기</h3><div class="mypv__rows">' +
              rl.map(function (x) {
                return '<a class="mypv__row" href="' + attr(x.route) + '">' +
                  '<span class="mypv__rt">' + esc(x.label) + '</span>' +
                  '<span class="mypv__bar"><i style="width:' + x.p + '%"></i></span>' +
                  '<span class="mypv__p">' + x.p + '%</span>' + ic('chev') + '</a>';
              }).join('') + '</div></div>'
          : '') +
        (V.hl.length
          ? '<div class="mypv__sec"><h3>' + ic('highlight') + '저장한 문장 ' + V.hl.length + '</h3><div class="mypv__hl">' +
              V.hl.slice(0, 6).map(function (t) {
                return '<blockquote>' + esc(t.length > 180 ? t.slice(0, 180) + '…' : t) +
                  '<button type="button" class="mypv__x" data-action="v3-hl" data-txt="' + attr(t) + '" aria-label="저장 해제">' + ic('close') + '</button>' +
                  '</blockquote>';
              }).join('') +
              (V.hl.length > 6 ? '<p class="mypv__more">외 ' + (V.hl.length - 6) + '개 — 내려받기로 전체 확인</p>' : '') +
            '</div></div>'
          : '') +
        (V.notes.length
          ? '<div class="mypv__sec"><h3>' + ic('pen') + '내 메모 ' + V.notes.length + '</h3><div class="mypv__nt">' +
              V.notes.slice(0, 6).map(function (n) {
                return '<div class="mypv__n"><b>' + esc(n.label || '메모') + '</b><span>' + esc(n.at) + '</span>' +
                  '<p>' + esc(n.body) + '</p></div>';
              }).join('') + '</div></div>'
          : '') +
        (!rl.length && !V.hl.length && !V.notes.length
          ? '<p class="mypv__empty">' + ic('info') + ' 아직 기록이 없습니다. 본문을 읽으며 문장 옆 형광펜을 누르면 여기에 모입니다. ' +
            '<a href="#/read">본문 읽으러 가기</a></p>'
          : '') +
      '</div>';
    return '<div class="wrap">' + tabs + '</div>';
  }

  function notFound(what, back) {
    return '<div class="wrap"><div class="c3empty c3empty--lg">' + ic('alert') +
      '<h2>' + esc(what) + ' 항목을 찾지 못했습니다</h2>' +
      '<p>주소가 바뀌었거나 잘못된 번호일 수 있습니다.</p>' +
      '<a class="btn btn--accent btn--sm" href="' + attr(back) + '">' + ic('prev') + '목록으로 돌아가기</a></div></div>';
  }

  /* ══════════ §J. 설치 ═════════════════════════════════ */
  function install(app) {
    A = app;
    esc = A.esc; ic = A.ic; attr = A.attr; uid = A.uid;
    toast = A.toast; go = A.go; $ = A.$; $$ = A.$$; store = A.store;

    FUT  = window.KAHUGO_FUTURES;
    LEX  = window.KAHUGO_LEXICON;
    OPP  = window.KAHUGO_OPPS;
    NEWS = window.KAHUGO_NEWS;
    MS   = window.KAHUGO_MS;
    if (!FUT || !LEX || !OPP || !NEWS) {
      console.error('[KAHUGO v3] 콘텐츠 모듈이 로드되지 않았습니다.');
      return;
    }
    loadState();

    /* ── 라우트 등록 ── */
    A.ROUTES.futures    = { title: 'AI 신문명시대 미래예측 18가지', render: function (r) { return r.param ? viewFutureDetail(r) : viewFutures(r); } };
    A.ROUTES.lexicon    = { title: '제5의 물결 낱말집',            render: function (r) { return r.param ? viewLexTerm(r) : viewLexicon(r); } };
    A.ROUTES.opps       = { title: '분야별 AI 신문명 사업 기회 30', render: function (r) { return r.param ? viewOppDetail(r) : viewOpps(r); } };
    A.ROUTES.newsletter = { title: '제5의 물결 뉴스레터',          render: viewNewsletter };
    A.ROUTES.read       = { title: '본문 전권 읽기',               render: viewRead };
    A.ROUTES.covers     = { title: '표지 갤러리',                  render: viewCovers };
    A.ROUTES.more       = { title: '더보기',                       render: viewMore };

    /* ── 액션 등록 ── */
    var AC = A.ACTIONS;

    AC['v3-font'] = function (el) {
      var d = parseInt(el.getAttribute('data-d'), 10) || 0;
      V.fs = clamp(V.fs + d, 1, 5); saveState();
      $$('.rd').forEach(function (n) {
        n.className = n.className.replace(/rd--fs\d/, 'rd--fs' + V.fs);
      });
      var lab = $('#v3-fs-label'); if (lab) lab.textContent = V.fs + '단계';
      toast('글자 크기 ' + V.fs + '단계' + (V.fs === 5 ? ' (가장 큼)' : (V.fs === 1 ? ' (가장 작음)' : '')));
    };

    AC['v3-hl'] = function (el) {
      var t = el.getAttribute('data-txt') || '';
      var i = V.hl.indexOf(t);
      if (i >= 0) { V.hl.splice(i, 1); toast('저장을 해제했습니다', 'warn'); }
      else { V.hl.unshift(t); if (V.hl.length > 300) V.hl.length = 300; toast('문장을 저장했습니다 · 내 서재에서 확인'); }
      saveState();
      var p = el.closest ? el.closest('.rd__p') : null;
      if (p) p.classList.toggle('is-hl', i < 0);
    };

    AC['v3-note-add'] = function (el) {
      var key = el.getAttribute('data-key') || '', label = el.getAttribute('data-label') || '';
      A.openModal('<b>메모 남기기</b>',
        '<p class="modal__lead">' + esc(label) + '</p>' +
        '<div class="field"><label for="v3-note-t">메모</label>' +
        '<textarea class="input" id="v3-note-t" rows="5" maxlength="800" placeholder="이 글에서 붙잡은 한 문장, 또는 내 현장에 옮길 한 가지"></textarea></div>' +
        '<p class="modal__note">메모는 이 브라우저에만 저장됩니다. 「내 서재」와 「더보기 → 내 기록 내려받기」에서 확인할 수 있습니다.</p>',
        '<button type="button" class="btn btn--ghost btn--sm" data-action="close-modal">취소</button>' +
        '<button type="button" class="btn btn--accent btn--sm" data-action="v3-note-save" data-key="' + attr(key) + '" data-label="' + attr(label) + '">저장</button>');
    };

    AC['v3-note-save'] = function (el) {
      var t = ($('#v3-note-t') || {}).value || '';
      if (t.trim().length < 2) { toast('메모를 입력해 주세요', 'warn'); return; }
      V.notes.unshift({ id: uid('n'), key: el.getAttribute('data-key'), label: el.getAttribute('data-label'), body: t.trim(), at: nowLabel() });
      saveState(); A.closeModal(); toast('메모를 저장했습니다');
    };

    AC['v3-note-term'] = function (el) {
      var k = el.getAttribute('data-k') || '';
      V.notes.unshift({ id: uid('n'), key: 'lex', label: '낱말 · ' + k, body: k, at: nowLabel() });
      saveState(); toast('「' + k + '」을(를) 메모에 담았습니다');
    };

    AC['v3-copy'] = function (el) { A.copyText(el.getAttribute('data-txt') || '', '문장을 복사했습니다'); };

    AC['v3-share'] = function (el) {
      A.openShareSheet(el.getAttribute('data-title') || document.title, A.shareUrl());
    };

    AC['v3-vote'] = function (el) {
      var k = el.getAttribute('data-k'), v = el.getAttribute('data-v');
      V.vote[k] = (V.vote[k] === v) ? '' : v; saveState();
      toast(V.vote[k] ? '「' + v + '」로 표시했습니다' : '표시를 해제했습니다');
      A.render();
    };

    AC['v3-cm-del'] = function (el) {
      var key = el.getAttribute('data-key'), id = el.getAttribute('data-id');
      A.confirmBox('글 지우기', '이 글을 지웁니다. 되돌릴 수 없습니다.', function () {
        V.cm[key] = (V.cm[key] || []).filter(function (c) { return c.id !== id; });
        saveState(); A.render(); toast('글을 지웠습니다', 'warn');
      });
    };

    AC['v3-unsub'] = function () {
      A.confirmBox('구독 해지', '뉴스레터 구독을 해지합니다. 저장된 이메일은 즉시 삭제됩니다.', function () {
        V.sub = null; saveState(); A.render(); toast('구독을 해지했습니다', 'warn');
      });
    };

    AC['v3-issue'] = function (el) {
      var no = parseInt(el.getAttribute('data-no'), 10);
      var x = null; NEWS.issues.forEach(function (v) { if (v.no === no) x = v; });
      if (!x) return;
      A.openModal('<span class="badge badge--accent">' + n2(x.no) + '호 미리보기</span><b>' + esc(x.t) + '</b>',
        '<p class="modal__lead">' + esc(x.trackName) + ' · 읽는 시간 ' + x.read + '분</p>' +
        x.body.map(function (p) { return '<p class="modal__p">' + esc(p) + '</p>'; }).join('') +
        '<div class="modal__act"><b>' + ic('target') + '이번 주 한 가지</b><p>' + esc(x.action) + '</p></div>',
        '<button type="button" class="btn btn--ghost btn--sm" data-action="close-modal">닫기</button>' +
        '<a class="btn btn--accent btn--sm" href="#/read/' + x.ch + '">' + ic('book') + '본문 ' + x.ch + '장 전문 읽기</a>');
    };

    AC['v3-toc'] = function () {
      var c = null, n = parseInt(A.state.route.param, 10);
      MS.chapters.forEach(function (v) { if (v.n === n) c = v; });
      if (!c) return;
      A.openModal('<b>' + c.n + '장 목차</b>',
        '<ol class="modal__toc">' + c.body.map(function (s, i) {
          return s.h ? '<li><button type="button" data-action="v3-jump" data-t="ch' + c.n + '-h' + i + '">' + esc(s.h) + '</button></li>' : '';
        }).join('') + '</ol>',
        '<button type="button" class="btn btn--ghost btn--sm" data-action="close-modal">닫기</button>');
    };

    AC['v3-jump'] = function (el) {
      var id = el.getAttribute('data-t');
      A.closeModal();
      setTimeout(function () {
        var t = document.getElementById(id);
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 220);
    };

    AC['v3-zoom'] = function (el) {
      var s = el.getAttribute('data-src'), t = el.getAttribute('data-t');
      A.openModal('<b>' + esc(t) + '</b>',
        '<img class="modal__img" src="' + attr(s) + '" alt="' + attr(t) + '">',
        '<button type="button" class="btn btn--ghost btn--sm" data-action="close-modal">닫기</button>' +
        '<a class="btn btn--accent btn--sm" href="' + attr(s) + '" target="_blank" rel="noopener">' + ic('external') + '원본 열기</a>');
    };

    AC['v3-login'] = function (el) {
      var p = el.getAttribute('data-p');
      if (p === 'guest') {
        V.user = { provider: 'guest', name: '게스트', at: nowLabel(), uid: (V.user && V.user.uid) || uid(), bookAccess: (V.user && V.user.bookAccess) || 'none' };
        saveState(); syncBookAccess(); A.render(); toast('게스트로 시작합니다');
        return;
      }
      var api = document.querySelector('meta[name="kahugo-api"]');
      var live = api && api.getAttribute('content') === 'on' && /^https?:/i.test(location.protocol);
      if (live) { location.href = '/oauth/' + p; return; }
      var name = p === 'kakao' ? '카카오' : '네이버';
      A.openModal('<b>' + name + ' 로그인</b>',
        '<p class="modal__lead">지금은 <b>데모 모드</b>입니다.</p>' +
        '<p class="modal__p">실제 ' + name + ' 로그인은 앱키 발급과 도메인 심사가 끝나면 같은 버튼에서 바로 연결됩니다. ' +
        '백엔드(<code>/oauth/' + p + '</code>)는 이미 함께 납품되어 있으며, Cloudflare 환경변수에 앱키를 넣는 순간 자동으로 실연동으로 전환됩니다.</p>' +
        '<p class="modal__note">데모로 진행하면 닉네임만 이 기기에 저장됩니다. 이메일·연락처는 수집하지 않습니다.</p>',
        '<button type="button" class="btn btn--ghost btn--sm" data-action="close-modal">취소</button>' +
        '<button type="button" class="btn btn--accent btn--sm" data-action="v3-login-demo" data-p="' + attr(p) + '">데모로 계속</button>');
    };

    AC['v3-login-demo'] = function (el) {
      var p = el.getAttribute('data-p');
      V.user = { provider: p, name: (p === 'kakao' ? '카카오' : '네이버') + ' 사용자', at: nowLabel(), uid: (V.user && V.user.uid) || uid(), bookAccess: (V.user && V.user.bookAccess) || 'none' };
      saveState(); syncBookAccess(); A.closeModal(); A.render();
      toast('데모 로그인되었습니다');
    };

    AC['v3-logout'] = function () {
      V.user = null; saveState(); A.render(); toast('로그아웃했습니다', 'warn');
    };

    /* 책전체보기 신청 · 재확인 · 로그인 유도 */
    AC['v3-access-request'] = function () { requestBookAccess(); A.render(); };
    AC['v3-access-recheck'] = function () {
      syncBookAccess();
      if (V.user && V.user.bookAccess === 'approved') toast('승인되었습니다! 이제 전체 본문을 볼 수 있습니다', 'ok');
      else toast('아직 승인 대기 중입니다', 'warn');
      A.render();
    };
    AC['v3-goto-login'] = function () {
      go('#/more');
      setTimeout(function () {
        var t = document.getElementById('more-login');
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 160);
    };

    /* 내 기록 내보내기
       ── 일부 환경(호스팅된 미리보기·앱 내장 브라우저)은 페이지가 시작한
          파일 저장을 막습니다. 그래서 '복사'를 기본 경로로 두고,
          '파일로 저장'은 가능한 환경에서만 추가로 제공합니다. */
    function exportText() {
      return JSON.stringify({
        저장한문장: V.hl, 메모: V.notes, 읽기기록: V.read,
        남긴생각: V.cm, 구독: V.sub, 내보낸시각: nowLabel()
      }, null, 2);
    }

    AC['v3-export'] = function () {
      var txt = exportText();
      var cnt = V.hl.length + V.notes.length;
      var rows = 0; for (var k in V.read) if (V.read.hasOwnProperty(k)) rows++;
      A.openModal('<b>내 기록 내보내기</b>',
        '<p class="modal__lead">저장한 문장 ' + V.hl.length + ' · 메모 ' + V.notes.length +
          ' · 읽던 글 ' + rows + '개</p>' +
        '<p class="modal__p">아래 내용을 복사해 메모장이나 메일에 붙여 두시면 다른 기기에서도 보관됩니다.</p>' +
        '<textarea class="input" id="v3-exp" rows="8" readonly>' + esc(txt) + '</textarea>' +
        '<p class="modal__note">이 기록은 이 브라우저에만 저장되어 있습니다. ' +
          '브라우저 데이터를 지우면 함께 사라지므로, 가끔 복사해 두시길 권합니다.</p>',
        '<button type="button" class="btn btn--ghost btn--sm" data-action="close-modal">닫기</button>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-action="v3-export-file">' + ic('download') + '파일로 저장</button>' +
        '<button type="button" class="btn btn--accent btn--sm" data-action="v3-export-copy">' + ic('link') + '복사하기</button>');
      if (!cnt && !rows) toast('아직 저장된 기록이 없습니다', 'warn');
    };

    AC['v3-export-copy'] = function () { A.copyText(exportText(), '내 기록을 복사했습니다'); };

    AC['v3-export-file'] = function () {
      var txt = exportText();
      try {
        var b = new Blob([txt], { type: 'application/json;charset=utf-8' });
        var u = URL.createObjectURL(b);
        var a = document.createElement('a');
        a.href = u; a.download = 'kahugo-내기록.json';
        a.style.display = 'none';
        document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(u); if (a.parentNode) a.parentNode.removeChild(a); }, 400);
        toast('저장이 시작되지 않으면 「복사하기」를 눌러 주세요');
      } catch (e) {
        A.copyText(txt, '이 환경에서는 저장이 막혀 클립보드에 복사했습니다');
      }
    };

    AC['v3-more'] = function () { go('#/more'); };

    /* ── 폼 · 스크롤 훅 ── */
    document.addEventListener('submit', function (e) {
      var f = e.target;
      if (f.classList && f.classList.contains('c3cm__form')) {
        e.preventDefault();
        var key = f.getAttribute('data-cmkey'), label = f.getAttribute('data-cmlabel');
        var who = (f.who.value || '').trim(), body = (f.body.value || '').trim();
        if (body.length < 5) { toast('5자 이상 적어 주세요', 'warn'); f.body.focus(); return; }
        if (!who) { toast('닉네임을 입력해 주세요', 'warn'); f.who.focus(); return; }
        if (f.anon.checked) who = '익명' + String(Math.floor(Math.random() * 900) + 100);
        V.cm[key] = V.cm[key] || [];
        V.cm[key].unshift({ id: uid('c'), who: who, body: body, at: nowLabel(), label: label });
        saveState(); A.render(); toast('생각을 남겼습니다');
        setTimeout(function () {
          var el = document.getElementById('cm-box-' + key);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
        return;
      }
      if (f.id === 'v3-sub-form') {
        e.preventDefault();
        var em = (f.email.value || '').trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { toast('이메일 주소를 확인해 주세요', 'warn'); f.email.focus(); return; }
        if (!f.agree.checked) { toast('수신 동의가 필요합니다', 'warn'); return; }
        var tracks = [];
        Array.prototype.forEach.call(f.querySelectorAll('input[name="tracks"]:checked'), function (c) { tracks.push(c.value); });
        var ch = 'email';
        Array.prototype.forEach.call(f.querySelectorAll('input[name="channel"]'), function (c) { if (c.checked) ch = c.value; });
        V.sub = { email: em, name: (f.name.value || '').trim(), channel: ch, tracks: tracks, at: nowLabel() };
        saveState();
        var api = document.querySelector('meta[name="kahugo-api"]');
        if (api && api.getAttribute('content') === 'on' && window.fetch && /^https?:/i.test(location.protocol)) {
          fetch('/api/subscribe', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(V.sub)
          }).catch(function () {});
        }
        A.render(); toast('구독 신청이 접수되었습니다');
        return;
      }
      if (f.hasAttribute && f.hasAttribute('data-lexsearch')) {
        e.preventDefault();
        var q = (f.q.value || '').trim();
        go('#/lexicon' + (q ? '?q=' + encodeURIComponent(q) : ''));
      }
    }, true);

    /* 읽기 진행률 추적 */
    var tick = null;
    window.addEventListener('scroll', function () {
      if (tick) return;
      tick = setTimeout(function () {
        tick = null;
        var w = document.querySelector('.wrap--read');
        if (!w) return;
        var key = w.getAttribute('data-read-key');
        if (!key) return;
        var top = w.offsetTop, h = w.offsetHeight - window.innerHeight;
        var y = (window.pageYOffset || 0) - top;
        var pct = h > 0 ? (y / h) * 100 : 100;
        setProgress(key, w.getAttribute('data-read-label'), w.getAttribute('data-read-route'), pct);
        var bar = w.querySelector('.rdprog > i');
        if (bar) bar.style.width = clamp(pct, 0, 100) + '%';
      }, 220);
    }, { passive: true });

    /* ── 홈 화면 확장: 이 책의 4대 코너 + 뉴스레터 밴드 ── */
    var origHome = A.ROUTES.home.render;
    A.ROUTES.home.render = function (r) {
      var html = origHome(r);
      /* 히어로 CTA 를 본문 코너 중심으로 교체 */
      html = html.replace(
        '<a class="btn btn--accent" href="#/diagnosis">',
        '<a class="btn btn--accent" href="#/read">'
      ).replace(
        '30초 자가진단 시작</a>',
        '본문 읽기 (1~4장 무료)</a>'
      ).replace(
        '<a class="btn btn--ghost" href="#/research">',
        '<a class="btn btn--ghost" href="#/futures">'
      ).replace(
        '12대 아젠다 보기</a>',
        '미래예측 18가지 보기</a>'
      );
      var i = html.indexOf('</section>');
      if (i < 0) return html + homeCorners() + homeNewsBand();
      return html.slice(0, i + 10) + homeCorners() + html.slice(i + 10) + homeNewsBand();
    };

    /* ── 내 서재 확장: v3 기록(메모·저장 문장·이어읽기) ── */
    var origMy = A.ROUTES.my.render;
    A.ROUTES.my.render = function (r) { return myPanel() + origMy(r); };

    /* ── 통합 검색 색인 확장 ── */
    var IDX = A.D.SEARCH_INDEX;
    IDX.push(
      { type: '코너', title: 'AI 신문명시대 미래예측 18가지', sub: '기회 아홉 · 위협 아홉 · 별책부록 제8부 전문',
        route: '#/futures', keys: '미래예측 예측 18 기회 위협 별책부록 제8부 2030 2035 전망 시나리오 futures' },
      { type: '코너', title: '제5의 물결 낱말집 50', sub: '다섯 개의 열쇠말과 신문명 키워드 · 보너스장 전문',
        route: '#/lexicon', keys: '낱말집 낱말 용어 사전 키워드 열쇠말 보너스장 어휘 lexicon 판단프리미엄 프롬프트계급' },
      { type: '코너', title: '분야별 AI 신문명 사업 기회 30', sub: '초기 비용 · 필요 도구 · 첫 고객 · 부록 A 전문',
        route: '#/opps', keys: '사업기회 창업 아이템 부록A 초기비용 첫고객 도구 30 비즈니스 opportunity' },
      { type: '코너', title: '제5의 물결 뉴스레터', sub: '매주 수요일 아침, 한 장씩 · 무료 구독',
        route: '#/newsletter', keys: '뉴스레터 구독 메일 이메일 카카오 알림톡 발행 newsletter 정기' },
      { type: '코너', title: '본문 전권 읽기 37장', sub: '1~4장 무료 · 5장부터 승인 후 열람',
        route: '#/read', keys: '본문 원고 전문 읽기 37장 7부 승인 미리보기 read 책읽기' },
      { type: '코너', title: '표지 갤러리', sub: '앞표지 · 뒤표지 · 전개도',
        route: '#/covers', keys: '표지 앞표지 뒤표지 커버 cover 전개도 책등' },
      { type: '코너', title: '더보기 · 전체 메뉴', sub: '모든 코너를 한 화면에서',
        route: '#/more', keys: '더보기 전체메뉴 메뉴 로그인 카카오 네이버 사이트맵' }
    );
    FUT.items.forEach(function (x) {
      IDX.push({ type: '미래예측', title: '예측 ' + x.no + ' · ' + x.t, sub: x.sub,
        route: '#/futures/' + x.id, keys: x.t + ' ' + x.sub + ' ' + x.lead + ' ' + x.kind + ' 미래예측 예측' });
    });
    LEX.terms.forEach(function (x) {
      IDX.push({ type: '낱말', title: x.k, sub: x.d.slice(0, 60) + '…',
        route: '#/lexicon/' + x.n, keys: x.k + ' ' + x.d + ' 낱말 용어 키워드' });
    });
    OPP.items.forEach(function (x) {
      IDX.push({ type: '사업기회', title: x.n + '. ' + x.k, sub: x.d,
        route: '#/opps/' + x.n, keys: x.k + ' ' + x.d + ' ' + x.tools + ' ' + x.first + ' 사업 창업 아이템' });
    });
    if (MS) MS.chapters.forEach(function (c) {
      IDX.push({ type: '본문', title: c.n + '장 · ' + c.t, sub: '제' + c.part + '부 · 약 ' + readMin(c.wc) + '분',
        route: '#/read/' + c.n, keys: c.t + ' ' + c.n + '장 본문 원고 제' + c.part + '부' });
    });

    /* v3 상태를 app.js 「내 서재」가 읽을 수 있게 노출 */
    window.KAHUGO_V3_STATE = V;
    window.KAHUGO_V3.state = V;
    window.KAHUGO_V3.lastRead = lastRead;
    window.KAHUGO_V3.reload = loadState;
  }

  window.KAHUGO_V3 = { install: install, version: '3.0' };
})();
