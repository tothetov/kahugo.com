/* ============================================================
   KAHUGO PLATFORM · app.js  (v2.0)
   한국AI휴먼전략연구원 · 독립 풀스크린 반응형 웹앱 플랫폼
   ------------------------------------------------------------
   목차
     §1  안전 저장소 · 유틸           §8   챗봇 (가이드 모드)
     §2  아이콘 (원본 SVG)            §9   자가진단 엔진
     §3  전역 상태                    §10  커뮤니티 엔진
     §4  토스트 · 모달 · 패널         §11  뷰 렌더러
     §5  테마 (다크 기본)             §12  액션 핸들러 (단일 위임)
     §6  라우터 (레지스트리 기반)     §13  PWA · 공유 · 환경 진단
     §7  통합 검색                    §14  부트스트랩
   ------------------------------------------------------------
   ★ 인라인 onclick 0건 — data-action 속성 + 단일 위임 리스너
   ★ localStorage 직접 호출 0건 — safeStore 래퍼만 사용
   ★ 외부 CDN · 외부 API 호출 0건
   ★ ROUTES 레지스트리에 없는 경로는 빌드 게이트가 차단합니다.
   ============================================================ */
(function () {
  'use strict';

  var D = window.KAHUGO_DATA;
  if (!D) { console.error('[KAHUGO] data.js 가 로드되지 않았습니다.'); return; }

  var BK = window.KAHUGO_BOOK || null;   /* 도서 서브퍼널 데이터 (book.js) */
  if (BK) {
    var B0 = BK.BOOK;
    D.SEARCH_INDEX = D.SEARCH_INDEX.concat([
      { type: '도서', title: B0.title, sub: B0.subtitle, route: '#/book',
        keys: B0.title + ' ' + B0.subtitle + ' ' + B0.author + ' ' + B0.deck + ' 제5의물결 책 도서 신간 book 신하비 심플릿' },
      { type: '도서', title: '미리보기 ' + BK.PREVIEW_PAGES + '쪽 무료 공개', sub: '프론트매터 + 제1부 1~4장 전문',
        route: '#/preview', keys: '미리보기 preview 시독 샘플 읽기 무료 공개 프롤로그 저자의말 1장 2장 3장 4장' },
      { type: '도서', title: '신문명 키워드', sub: 'AI 자율화혁명 · AI 디렉터 · A·H·AH · 판단 프리미엄',
        route: '#/book?s=keywords', keys: '키워드 낱말 열쇠말 용어 AI자율화혁명 AI디렉터 판단프리미엄 공진화 사피엔스 프롬프트계급' },
      { type: '도서', title: '분야별 AI 사업 기회 30', sub: '초기 비용 · 필요 도구 · 첫 고객까지',
        route: '#/book?s=opps', keys: '사업기회 창업 아이템 부록A 초기비용 첫고객 30 비즈니스 아이디어' },
      { type: '도서', title: '6주 실행 워크북', sub: '읽고 끝나지 않게 만드는 장치',
        route: '#/book?s=workbook', keys: '워크북 6주 실행 코스 부록B 과제 루틴 실행계획' },
      { type: '도서', title: '다섯 가지 독서 경로', sub: '직장인 · 창업가 · 부모 · 정책 · 크리에이터',
        route: '#/book?s=paths', keys: '독서경로 읽는법 추천 순서 직장인 창업가 부모 교육자 정책 크리에이터' }
    ].concat(BK.BOOK_KEYWORDS.map(function (k) {
      return { type: '신문명 키워드', title: k.k, sub: k.d.slice(0, 56) + '…', route: '#/book?s=keywords&k=' + encodeURIComponent(k.k),
               keys: k.k + ' ' + k.en + ' ' + k.d };
    })));
  }

  /* ══════════ §1. 안전 저장소 · 유틸 ══════════════════════ */
  var safeStore = (function () {
    var mem = {}, ok = false;
    try { var k = '__kahugo_t'; localStorage.setItem(k, '1'); localStorage.removeItem(k); ok = true; }
    catch (e) { ok = false; }
    return {
      get: function (k, d) {
        try { var v = ok ? localStorage.getItem(k) : mem[k]; return v == null ? (d === undefined ? null : d) : JSON.parse(v); }
        catch (e) { return d === undefined ? null : d; }
      },
      set: function (k, v) {
        try { var s = JSON.stringify(v); if (ok) localStorage.setItem(k, s); else mem[k] = s; return true; }
        catch (e) { mem[k] = JSON.stringify(v); return false; }
      },
      del: function (k) { try { if (ok) localStorage.removeItem(k); else delete mem[k]; } catch (e) {} },
      available: function () { return ok; }
    };
  })();

  var KEY = {
    THEME: 'kahugo.theme', BM: 'kahugo.bookmarks', RECENT: 'kahugo.recent',
    INT: 'kahugo.interests', SUB: 'kahugo.subscribe', ALERT: 'kahugo.pubalerts',
    DIAG: 'kahugo.diagnosis', POSTS: 'kahugo.posts',
    VISIT: 'kahugo.visits', SEEN: 'kahugo.seenNotice',
    RD: 'kahugo.readPos', RDFS: 'kahugo.readFont', HL: 'kahugo.highlights'
  };

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function attr(s) { return esc(s); }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '.' + pad2(d.getMonth() + 1) + '.' + pad2(d.getDate());
  }
  function uid(p) { return (p || 'id') + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e5).toString(36); }

  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function catOf(id) { return byId(D.CATEGORIES, id) || { ko: id, en: '', icon: 'grid' }; }

  /* ══════════ §2. 아이콘 (전부 직접 작성한 원본 SVG) ══════ */
  var P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.6V20h13V9.6"/><path d="M9.7 20v-5.4h4.6V20"/>',
    compass: '<circle cx="12" cy="12" r="8.6"/><path d="m15.2 8.8-1.9 4.5-4.5 1.9 1.9-4.5z"/>',
    flask: '<path d="M9.6 3h4.8"/><path d="M10.6 3v5.4L5.6 17.2A2 2 0 0 0 7.3 20.2h9.4a2 2 0 0 0 1.7-3L13.4 8.4V3"/><path d="M8.2 14.4h7.6"/>',
    cap: '<path d="M12 4 2.8 8.6 12 13.2l9.2-4.6z"/><path d="M6.6 10.9v4.6c0 1.6 2.4 2.9 5.4 2.9s5.4-1.3 5.4-2.9v-4.6"/><path d="M21.2 8.6v5"/>',
    book: '<path d="M4.2 4.6h7.8v15H4.2z"/><path d="M12 4.6h7.8v15H12z"/><path d="M12 4.6v15"/>',
    users: '<circle cx="9" cy="8.4" r="3.2"/><path d="M3.4 19.6c0-3.1 2.5-5.2 5.6-5.2s5.6 2.1 5.6 5.2"/><path d="M16.1 6.1a3.2 3.2 0 0 1 0 5.9"/><path d="M17 14.7c2.2.5 3.6 2.3 3.6 4.9"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.6"/><path d="m15.6 15.6 4.2 4.2"/>',
    moon: '<path d="M20 13.6A8.2 8.2 0 0 1 10.4 4a8.6 8.6 0 1 0 9.6 9.6z"/>',
    sun: '<circle cx="12" cy="12" r="4.1"/><path d="M12 2.6v2.3M12 19.1v2.3M4.5 4.5l1.6 1.6M17.9 17.9l1.6 1.6M2.6 12h2.3M19.1 12h2.3M4.5 19.5l1.6-1.6M17.9 6.1l1.6-1.6"/>',
    chat: '<path d="M20.4 12.4c0 4-3.8 7.2-8.4 7.2a9.8 9.8 0 0 1-2.6-.35L4.6 20.6l1.2-3.5A6.9 6.9 0 0 1 3.6 12.4c0-4 3.8-7.2 8.4-7.2s8.4 3.2 8.4 7.2z"/><path d="M8.8 12h.01M12 12h.01M15.2 12h.01"/>',
    mail: '<rect x="3" y="5.4" width="18" height="13.2" rx="2.2"/><path d="m3.6 6.6 8.4 6 8.4-6"/>',
    gauge: '<path d="M4 17.4a8.8 8.8 0 1 1 16 0"/><path d="m12 13.8 3.9-3.9"/><circle cx="12" cy="17.4" r="1.5"/>',
    bookmark: '<path d="M6.4 3.8h11.2v16.4L12 16.2l-5.6 4z"/>',
    bell: '<path d="M18.2 15.6V11a6.2 6.2 0 1 0-12.4 0v4.6L4.2 18h15.6z"/><path d="M10.1 21a2.1 2.1 0 0 0 3.8 0"/>',
    handshake: '<path d="m8.6 12.4 2.5-2.5a1.6 1.6 0 0 1 2.3 0l3.4 3.4"/><path d="M2.8 10.6 7 6.4h4.2"/><path d="M21.2 10.6 17 6.4h-2.6"/><path d="m8.6 12.4-2.2 2.2a1.7 1.7 0 0 0 2.4 2.4l.6-.6"/><path d="m11.4 15.2 1.7 1.7a1.7 1.7 0 0 0 2.4-2.4"/>',
    grid: '<rect x="3.6" y="3.6" width="7" height="7" rx="1.6"/><rect x="13.4" y="3.6" width="7" height="7" rx="1.6"/><rect x="3.6" y="13.4" width="7" height="7" rx="1.6"/><rect x="13.4" y="13.4" width="7" height="7" rx="1.6"/>',
    spark: '<path d="m12 3 2.1 5.6L19.8 10l-5.7 1.4L12 17l-2.1-5.6L4.2 10l5.7-1.4z"/><path d="M18.4 16.6 19 18.4l1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6z"/>',
    shield: '<path d="M12 3.2 5 6v5.4c0 4 2.9 7.6 7 9.4 4.1-1.8 7-5.4 7-9.4V6z"/><path d="m9.2 12 2 2 3.6-3.8"/>',
    map: '<path d="M3.6 6.4 9 4.2v13.4l-5.4 2.2z"/><path d="M9 4.2 15 6.6v13.2L9 17.6z"/><path d="m15 6.6 5.4-2.4v13.4L15 19.8z"/>',
    pen: '<path d="M16.4 3.9a2.3 2.3 0 0 1 3.3 3.3L8.4 18.5l-4.3 1 1-4.3z"/><path d="m14.4 5.9 3.3 3.3"/>',
    wave: '<path d="M2.8 8.4c1.6-1.8 3.2-1.8 4.8 0s3.2 1.8 4.8 0 3.2-1.8 4.8 0 3.2 1.8 4.8 0"/><path d="M2.8 14c1.6-1.8 3.2-1.8 4.8 0s3.2 1.8 4.8 0 3.2-1.8 4.8 0 3.2 1.8 4.8 0"/>',
    info: '<circle cx="12" cy="12" r="8.6"/><path d="M12 11.2v5"/><path d="M12 7.9h.01"/>',
    close: '<path d="m5.8 5.8 12.4 12.4M18.2 5.8 5.8 18.2"/>',
    arrow: '<path d="M4.6 12h14.2"/><path d="m13.2 6.4 5.6 5.6-5.6 5.6"/>',
    chev: '<path d="m9.4 5.6 6.4 6.4-6.4 6.4"/>',
    check: '<path d="m4.8 12.6 4.6 4.6 9.8-10.4"/>',
    share: '<circle cx="17.6" cy="5.8" r="2.6"/><circle cx="6.4" cy="12" r="2.6"/><circle cx="17.6" cy="18.2" r="2.6"/><path d="m8.7 10.8 6.6-3.7M8.7 13.2l6.6 3.7"/>',
    download: '<path d="M12 3.8v10.4"/><path d="m7.6 10.2 4.4 4 4.4-4"/><path d="M4.2 18.4v1.8h15.6v-1.8"/>',
    trash: '<path d="M4.4 6.6h15.2"/><path d="M9.4 6.6V4.4h5.2v2.2"/><path d="M6.6 6.6 7.6 20h8.8l1-13.4"/><path d="M10.4 10.2v6M13.6 10.2v6"/>',
    plus: '<path d="M12 5.2v13.6M5.2 12h13.6"/>',
    link: '<path d="M10.2 13.8a3.9 3.9 0 0 0 5.6 0l2.8-2.8a3.9 3.9 0 0 0-5.6-5.6l-1.4 1.4"/><path d="M13.8 10.2a3.9 3.9 0 0 0-5.6 0l-2.8 2.8a3.9 3.9 0 0 0 5.6 5.6l1.4-1.4"/>',
    reply: '<path d="M9.6 6 4.4 11.2l5.2 5.2"/><path d="M4.4 11.2h9.2a6 6 0 0 1 6 6v1"/>',
    print: '<path d="M6.6 9V3.8h10.8V9"/><rect x="3.6" y="9" width="16.8" height="7.4" rx="1.8"/><path d="M6.6 14.2h10.8v6H6.6z"/>',
    install: '<rect x="6.2" y="2.8" width="11.6" height="18.4" rx="2.4"/><path d="M10.6 5.6h2.8"/><path d="M12 10v6"/><path d="m9.6 13.6 2.4 2.4 2.4-2.4"/>',
    flag: '<path d="M5.4 21V3.6"/><path d="M5.4 4.6h11.8l-2 3.6 2 3.6H5.4"/>',
    lock: '<rect x="4.6" y="10.4" width="14.8" height="9.8" rx="2.2"/><path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6"/>',
    alert: '<path d="M12 3.6 2.8 19.8h18.4z"/><path d="M12 9.6v4.4"/><path d="M12 17.2h.01"/>',
    external: '<path d="M13.6 4.4h6v6"/><path d="m19.6 4.4-8 8"/><path d="M18 14v4.4a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 18.4V7.6A1.6 1.6 0 0 1 5.6 6H10"/>',
    filter: '<path d="M3.6 5.6h16.8L14 13v5.8l-4 2.2V13z"/>',
    star: '<path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.8l5.9-.8z"/>',
    clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 1.9"/>',
    layers: '<path d="m12 3.4 8.4 4.2-8.4 4.2-8.4-4.2z"/><path d="m3.6 12 8.4 4.2 8.4-4.2"/><path d="m3.6 16.4 8.4 4.2 8.4-4.2"/>',
    target: '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1"/>',
    wave2: '<path d="M2.6 15.6c1.7-2.1 3.4-2.1 5.1 0s3.4 2.1 5.1 0 3.4-2.1 5.1 0 2.4 1.3 3.5.4"/><path d="M2.6 10.4c1.7-2.1 3.4-2.1 5.1 0s3.4 2.1 5.1 0 3.4-2.1 5.1 0 2.4 1.3 3.5.4"/><path d="M15.4 4.6 17 6.2l-1.6 1.6"/><path d="M8.6 4.4h8.2"/>',
    quote: '<path d="M9.4 6.6C6.6 7.8 5 10 5 12.8c0 2.4 1.4 4 3.4 4s3.3-1.4 3.3-3.3-1.3-3.2-3-3.2c-.3 0-.6 0-.8.1.3-1.3 1.3-2.4 2.8-3.1z"/><path d="M18.6 6.6c-2.8 1.2-4.4 3.4-4.4 6.2 0 2.4 1.4 4 3.4 4s3.3-1.4 3.3-3.3-1.3-3.2-3-3.2c-.3 0-.6 0-.8.1.3-1.3 1.3-2.4 2.8-3.1z"/>',
    pages: '<path d="M4.2 5.2h7.2v13.6H4.2z"/><path d="M12.6 5.2h7.2v13.6h-7.2z"/><path d="M6.4 8.6h2.8M6.4 11.4h2.8M14.8 8.6h2.8M14.8 11.4h2.8"/>',
    aa: '<path d="M2.8 18 6.6 6.6 10.4 18"/><path d="M4.2 14.2h4.8"/><path d="M13.4 18l3.2-9.4L19.8 18"/><path d="M14.6 15h4"/>',
    prev: '<path d="m14.6 5.6-6.4 6.4 6.4 6.4"/>',
    list: '<path d="M8.4 6.6h11.4M8.4 12h11.4M8.4 17.4h11.4"/><path d="M4.4 6.6h.01M4.4 12h.01M4.4 17.4h.01"/>',
    cart: '<circle cx="9.6" cy="19.2" r="1.4"/><circle cx="17.4" cy="19.2" r="1.4"/><path d="M2.6 3.8h2.6l2.4 11.4h11l2.2-8.2H6.4"/>',
    highlight: '<path d="m14.2 4.6 5.2 5.2-8.6 8.6-5.2-5.2z"/><path d="M4.4 20.2h6"/><path d="m11.6 7.2 5.2 5.2"/>'
  };

  function ic(name, cls) {
    var d = P[name] || P.info;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"' +
      (cls ? ' class="' + attr(cls) + '"' : '') + '>' + d + '</svg>';
  }

  /* ══════════ §3. 전역 상태 ═══════════════════════════════ */
  var S = {
    route: { name: 'home', param: '', query: {} },
    theme: safeStore.get(KEY.THEME, 'dark'),
    bookmarks: safeStore.get(KEY.BM, []) || [],
    recent: safeStore.get(KEY.RECENT, []) || [],
    interests: safeStore.get(KEY.INT, []) || [],
    subscribed: safeStore.get(KEY.SUB, false),
    pubAlerts: safeStore.get(KEY.ALERT, []) || [],
    diag: safeStore.get(KEY.DIAG, null),
    posts: safeStore.get(KEY.POSTS, []) || [],
    visits: (safeStore.get(KEY.VISIT, 0) || 0) + 1,
    chatLog: [],
    diagAnswers: {},
    filter: { cat: 'all', pubType: 'all', q: '' },
    lastFocus: null,
    installPrompt: null,
    readPos: safeStore.get(KEY.RD, 1) || 1,
    readFont: safeStore.get(KEY.RDFS, 2) || 2,
    highlights: safeStore.get(KEY.HL, []) || [],
    bookDiag: safeStore.get('kahugo.bookDiag', {}) || {}
  };
  safeStore.set(KEY.VISIT, S.visits);

  function persist() {
    safeStore.set(KEY.BM, S.bookmarks);
    safeStore.set(KEY.RECENT, S.recent);
    safeStore.set(KEY.INT, S.interests);
    safeStore.set(KEY.SUB, S.subscribed);
    safeStore.set(KEY.ALERT, S.pubAlerts);
    safeStore.set(KEY.POSTS, S.posts);
    if (S.diag) safeStore.set(KEY.DIAG, S.diag);
    safeStore.set(KEY.RD, S.readPos);
    safeStore.set(KEY.RDFS, S.readFont);
    safeStore.set(KEY.HL, S.highlights);
  }

  /* ══════════ §4. 토스트 · 모달 · 패널 ═══════════════════ */
  function toast(msg, kind) {
    var box = $('#toasts'); if (!box) return;
    var el = document.createElement('div');
    el.className = 'toast toast--' + (kind || 'ok');
    el.setAttribute('role', 'status');
    el.innerHTML = ic(kind === 'warn' ? 'alert' : 'check') + '<span>' + esc(msg) + '</span>';
    box.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity .3s ease, transform .3s ease';
      el.style.opacity = '0'; el.style.transform = 'translateY(10px)';
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
    }, 2600);
  }

  var scrollY = 0;
  function lockScroll(on) {
    if (on) {
      scrollY = window.scrollY || window.pageYOffset || 0;
      document.body.classList.add('is-locked');
      document.body.style.top = -scrollY + 'px';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.classList.remove('is-locked');
      document.body.style.position = ''; document.body.style.top = ''; document.body.style.width = '';
      window.scrollTo(0, scrollY);
    }
  }

  function anyOverlayOpen() {
    return !!($('.panel.is-open') || $('.modal.is-open'));
  }

  function trapFocus(container) {
    var sel = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
    var nodes = $$(sel, container).filter(function (n) { return n.offsetParent !== null || n === document.activeElement; });
    if (!nodes.length) return;
    var first = nodes[0], last = nodes[nodes.length - 1];
    container.__trap = function (e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    container.addEventListener('keydown', container.__trap);
    setTimeout(function () { first.focus(); }, 60);
  }
  function releaseFocus(container) {
    if (container && container.__trap) { container.removeEventListener('keydown', container.__trap); container.__trap = null; }
  }

  function openPanel(id) {
    var p = $('#' + id); if (!p) return;
    S.lastFocus = document.activeElement;
    $('#backdrop').classList.add('is-open');
    p.classList.add('is-open');
    p.setAttribute('aria-hidden', 'false');
    lockScroll(true);
    trapFocus(p);
  }
  function closePanel(id) {
    var p = id ? $('#' + id) : null;
    var list = p ? [p] : $$('.panel.is-open');
    list.forEach(function (el) { el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true'); releaseFocus(el); });
    if (!anyOverlayOpen()) { $('#backdrop').classList.remove('is-open'); lockScroll(false); }
    if (S.lastFocus && S.lastFocus.focus) { try { S.lastFocus.focus(); } catch (e) {} }
  }

  function openModal(title, bodyHtml, footHtml) {
    var m = $('#modal'); if (!m) return;
    S.lastFocus = document.activeElement;
    $('#modal-title').innerHTML = title;
    $('#modal-body').innerHTML = bodyHtml;
    $('#modal-foot').innerHTML = footHtml || '<button type="button" class="btn btn--ghost" data-action="close-modal">닫기</button>';
    m.classList.add('is-open');
    m.setAttribute('aria-hidden', 'false');
    lockScroll(true);
    trapFocus(m);
    $('#modal-body').scrollTop = 0;
  }
  function closeModal() {
    var m = $('#modal'); if (!m) return;
    m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true');
    releaseFocus(m);
    if (!anyOverlayOpen()) lockScroll(false);
    if (S.lastFocus && S.lastFocus.focus) { try { S.lastFocus.focus(); } catch (e) {} }
  }

  /* ══════════ §5. 테마 ════════════════════════════════════ */
  function applyTheme(t) {
    S.theme = (t === 'light') ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', S.theme);
    safeStore.set(KEY.THEME, S.theme);
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', S.theme === 'light' ? '#ffffff' : '#060f1e');
    var b = $('[data-action="toggle-theme"]');
    if (b) {
      b.innerHTML = ic(S.theme === 'light' ? 'moon' : 'sun') +
        '<span class="iconbtn__label">' + (S.theme === 'light' ? '다크' : '라이트') + '</span>';
      b.setAttribute('aria-label', S.theme === 'light' ? '어두운 화면으로 전환' : '밝은 화면으로 전환');
    }
  }

  /* ══════════ §6. 라우터 (레지스트리 기반) ════════════════
     ★ 여기 등록되지 않은 경로로는 절대 이동할 수 없습니다.
       미등록 경로 요청 시 안내 화면을 띄우고 홈 링크를 제공합니다.
     ------------------------------------------------------ */
  var ROUTES = {
    home:         { title: '홈',            render: viewHome },
    research:     { title: '연구 허브',     render: viewResearch },
    labs:         { title: '연구랩',        render: viewLabs },
    programs:     { title: '4대 사업축',    render: viewPrograms },
    publications: { title: '출판·리포트',   render: viewPublications },
    community:    { title: '커뮤니티',      render: viewCommunity },
    diagnosis:    { title: 'AI휴먼전략 자가진단', render: viewDiagnosis },
    my:           { title: '내 서재',       render: viewMy },
    about:        { title: '연구원 소개',   render: viewAbout },
    partnership:  { title: '협력·파트너십', render: viewPartnership },
    contact:      { title: '협력·문의',     render: viewContact },
    book:         { title: '제5의 물결과 AI 신문명시대', render: viewBook },
    preview:      { title: '도서 미리보기',  render: viewPreview }
  };
  window.KAHUGO_ROUTES = Object.keys(ROUTES);   /* 빌드 게이트가 읽는 지점 */

  function parseHash(h) {
    h = String(h || '').replace(/^#/, '');
    if (!h || h === '/') return { name: 'home', param: '', query: {} };
    var qi = h.indexOf('?');
    var query = {};
    if (qi >= 0) {
      h.slice(qi + 1).split('&').forEach(function (kv) {
        if (!kv) return;
        var p = kv.split('=');
        query[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
      });
      h = h.slice(0, qi);
    }
    var seg = h.replace(/^\//, '').split('/');
    return { name: seg[0] || 'home', param: seg[1] || '', query: query };
  }

  function go(route) {
    if (!route) return;
    markScroll();
    if (location.hash === route) { render(); return; }
    try { location.hash = route; }
    catch (e) { showEnvHelp('주소 변경이 차단되어 화면을 직접 전환했습니다.'); S.route = parseHash(route); render(); }
  }

  /* ══════════ 콘텐츠 오버라이드 (관리자 모드) ══════════════
     관리자 모드가 내려 준 부분 데이터를 원본 위에 덮어쓴다.
     · 오프라인 관리자: 미리보기 창에 window.KAHUGO_OVERRIDE 를 주입
     · 클라우드 관리자: /api/content 응답을 받아 적용
     실패하거나 데이터가 없으면 원본 그대로 동작한다. */
  function applyOverride(o) {
    if (!o || typeof o !== 'object') return false;
    var touched = false;
    if (o.DATA && typeof o.DATA === 'object') {
      Object.keys(o.DATA).forEach(function (k) {
        if (k === 'SEARCH_INDEX') return;       /* 색인은 아래에서 다시 만든다 */
        D[k] = o.DATA[k]; touched = true;
      });
    }
    if (o.BOOK && BK && typeof o.BOOK === 'object') {
      Object.keys(o.BOOK).forEach(function (k) { BK[k] = o.BOOK[k]; touched = true; });
      if (BK.BOOK_PREVIEW) BK.PREVIEW_PAGES = BK.BOOK_PREVIEW.length;
    }
    if (touched && typeof window.KAHUGO_BUILD_INDEX === 'function') {
      try { D.SEARCH_INDEX = window.KAHUGO_BUILD_INDEX(); } catch (e) {}
    }
    return touched;
  }

  /* 클라우드 관리자(백엔드)가 붙어 있을 때만 동작한다.
     정적 배포만 한 상태에서는 404 가 나므로 조용히 넘어간다. */
  function loadCloudContent() {
    if (!/^https?:/i.test(location.protocol) || !window.fetch) return;
    /* 백엔드가 없는 정적 배포에서 헛된 404 를 만들지 않도록 스위치를 확인한다. */
    var flag = document.querySelector('meta[name="kahugo-api"]');
    if (!flag || flag.getAttribute('content') !== 'on') return;
    var ctrl = null;
    try { ctrl = new AbortController(); setTimeout(function () { ctrl.abort(); }, 4000); } catch (e) {}
    fetch('/api/content', ctrl ? { signal: ctrl.signal } : undefined)
      .then(function (res) { return res && res.ok ? res.json() : null; })
      .then(function (json) {
        if (!json || !json.content) return;
        if (applyOverride(json.content)) { buildShell(); render(); }
      })
      .catch(function () { /* 백엔드 미연결 — 원본 콘텐츠로 계속 */ });
  }

  var _lastView = null;
  var _pendingY = null;   /* 클릭 시점의 스크롤 위치 (라우팅 전에 캡처) */

  function markScroll() {
    _pendingY = window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  /* 화면을 통째로 교체한 직후에는 문서 높이가 잠깐 줄어들어 원하는 위치로
     한 번에 못 간다. 레이아웃이 잡힌 다음 프레임에서 한 번 더 맞춘다. */
  function setScroll(y) {
    window.scrollTo(0, y);
    var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
    raf(function () {
      window.scrollTo(0, y);
      raf(function () { window.scrollTo(0, y); });
    });
  }

  function render() {
    var r = parseHash(location.hash);
    /* 같은 화면에서 탭·필터만 바뀐 경우 스크롤 위치를 유지한다.
       ('수익모델' 같은 인페이지 탭을 눌렀을 때 화면이 맨 위로 튀던 문제)
       위치는 render 시점이 아니라 '클릭 시점'의 값을 쓴다. */
    var prevY = _pendingY != null ? _pendingY
              : (window.pageYOffset || document.documentElement.scrollTop || 0);
    _pendingY = null;
    var pvKey = r.name === 'preview' ? (r.query.p || '') : '';
    var sameView = !!(_lastView && _lastView.name === r.name &&
                      _lastView.param === r.param && _lastView.pv === pvKey);
    _lastView = { name: r.name, param: r.param, pv: pvKey };
    S.route = r;
    var def = ROUTES[r.name];
    var root = $('#view');
    if (!root) return;

    if (!def) {
      root.innerHTML = viewNotFound(r.name);
      document.title = '페이지를 찾을 수 없습니다 · KAHUGO';
    } else {
      root.innerHTML = def.render(r);
      document.title = def.title + ' · 한국AI휴먼전략연구원 KAHUGO';
    }
    root.classList.remove('view'); void root.offsetWidth; root.classList.add('view');

    syncNav(r.name);
    observeReveal();
    /* 화면 전환 시 열려 있던 오버레이를 모두 닫는다.
       (모달 안의 이동 버튼이 모달을 남겨 스크롤이 잠기던 문제를 원천 차단) */
    closePanel();
    closeModal();
    if (document.body.classList.contains('is-locked')) lockScroll(false);
    var hasAnchor = !!(r.query.s || r.query.focus);
    if (r.query.top === '1') setScroll(0);
    else if (hasAnchor) { /* 아래 앵커 로직이 위치를 잡는다 */ }
    else if (r.query.keepscroll || sameView) setScroll(prevY);
    else setScroll(0);
    if (r.name === 'book' && r.query.s) {
      setTimeout(function () {
        var t = $('#bk-' + r.query.s);
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 90);
    }
    trackRecent(r);
  }

  function syncNav(name) {
    $$('.nav__item').forEach(function (a) {
      var on = a.getAttribute('data-nav') === name;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    $$('.bottomnav__item').forEach(function (a) {
      var on = a.getAttribute('data-nav') === name;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function trackRecent(r) {
    var item = null;
    if (r.name === 'research' && r.param) {
      var rr = byId(D.RESEARCH, r.param);
      if (rr) item = { t: '연구', title: rr.title, route: '#/research/' + rr.id };
    } else if (r.name === 'labs' && r.param) {
      var l = byId(D.LABS, r.param);
      if (l) item = { t: '연구랩', title: l.ko, route: '#/labs/' + l.id };
    } else if (r.name === 'publications' && r.param) {
      var p = byId(D.PUBLICATIONS, r.param);
      if (p) item = { t: '출판', title: p.title, route: '#/publications/' + p.id };
    }
    if (!item) return;
    S.recent = S.recent.filter(function (x) { return x.route !== item.route; });
    S.recent.unshift(item);
    if (S.recent.length > 12) S.recent.length = 12;
    persist();
  }

  function observeReveal() {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: .08, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ══════════ §7. 통합 검색 ═══════════════════════════════ */
  function highlight(text, q) {
    if (!q) return esc(text);
    var t = esc(text), needle = esc(q);
    var i = t.toLowerCase().indexOf(needle.toLowerCase());
    if (i < 0) return t;
    return t.slice(0, i) + '<mark>' + t.slice(i, i + needle.length) + '</mark>' + t.slice(i + needle.length);
  }

  function searchRun(q) {
    var box = $('#search-results'); if (!box) return;
    q = String(q || '').trim();
    if (!q) { box.innerHTML = searchDefaultHtml(); return; }
    var lo = q.toLowerCase();
    var hits = D.SEARCH_INDEX.filter(function (it) {
      return (it.title + ' ' + it.sub + ' ' + it.keys).toLowerCase().indexOf(lo) >= 0;
    }).slice(0, 24);

    if (!hits.length) {
      box.innerHTML =
        '<div class="empty">' + ic('search') +
        '<div class="empty__t">검색 결과가 없습니다</div>' +
        '<div class="empty__d">“' + esc(q) + '”와 일치하는 항목을 찾지 못했습니다. 다른 낱말로 시도하시거나 가이드 챗봇에 물어보세요.</div>' +
        '<button type="button" class="btn btn--accent btn--sm" data-action="search-to-chat" data-q="' + attr(q) + '">' +
        ic('chat') + '챗봇에게 물어보기</button></div>';
      return;
    }
    box.innerHTML =
      '<div class="sec__eyebrow" style="margin-bottom:8px">검색 결과 ' + hits.length + '건</div>' +
      hits.map(function (it) {
        return '<a class="result" href="' + attr(it.route) + '" data-action="close-panels">' +
          '<div class="result__type">' + esc(it.type) + '</div>' +
          '<div class="result__title">' + highlight(it.title, q) + '</div>' +
          '<div class="result__sub">' + highlight(it.sub, q) + '</div></a>';
      }).join('');
  }

  function searchDefaultHtml() {
    var picks = ['자가진단', '12대 아젠다', '창립선언', '연구랩', '아카데미', '멤버십', '협력', '로드맵'];
    return '<div class="sec__eyebrow" style="margin-bottom:8px">이런 것을 찾아보세요</div>' +
      '<div class="chips" style="margin-bottom:16px">' +
      picks.map(function (p) {
        return '<button type="button" class="chip" data-action="search-fill" data-q="' + attr(p) + '">' + esc(p) + '</button>';
      }).join('') + '</div>' +
      '<div class="notice">' + ic('info') + '<span>연구 · 연구랩 · 프로그램 · 출판 · 창립선언 · 멤버십 · FAQ 등 ' +
      D.SEARCH_INDEX.length + '개 항목을 한 번에 찾습니다.</span></div>';
  }

  /* ══════════ §8. 챗봇 (가이드 모드) ═════════════════════ */
  function chatPush(who, html, ctas) {
    S.chatLog.push({ who: who, html: html, ctas: ctas || [] });
    chatRender();
  }
  function chatRender() {
    var log = $('#chat-log'); if (!log) return;
    log.innerHTML = S.chatLog.map(function (m) {
      var c = m.ctas.length
        ? '<div class="bubble__ctas">' + m.ctas.map(function (x) {
            return '<a class="chip" href="' + attr(x.route) + '" data-action="chat-goto">' + esc(x.label) + ic('chev') + '</a>';
          }).join('') + '</div>'
        : '';
      return '<div class="bubble bubble--' + (m.who === 'me' ? 'me' : 'bot') + '">' + m.html + c + '</div>';
    }).join('');
    log.scrollTop = log.scrollHeight;
  }
  function chatChipsHtml() {
    return D.CHAT_INTENTS.map(function (i) {
      return '<button type="button" class="chip" data-action="chat-chip" data-id="' + attr(i.id) + '">' + esc(i.chip) + '</button>';
    }).join('');
  }
  function chatAnswer(text) {
    var lo = String(text || '').toLowerCase();
    var best = null, bestScore = 0;
    D.CHAT_INTENTS.forEach(function (it) {
      var sc = 0;
      it.keys.forEach(function (k) { if (lo.indexOf(String(k).toLowerCase()) >= 0) sc++; });
      if (lo.indexOf(it.chip.toLowerCase()) >= 0) sc += 2;
      if (sc > bestScore) { bestScore = sc; best = it; }
    });
    if (best && bestScore > 0) chatPush('bot', esc(best.answer), best.ctas);
    else chatPush('bot', esc(D.CHAT_FALLBACK), [
      { label: '자가진단 받기', route: '#/diagnosis' },
      { label: '협력·문의하기', route: '#/contact' }
    ]);
  }
  if (BK) {
    D.CHAT_INTENTS.push({
      id: 'c9', chip: '제5의 물결 책', keys: ['책', '도서', '물결', '미리보기', '출간', '신하비', '저자', 'book'],
      answer: '원장 신하비의 저서 『' + BK.BOOK.title + '』입니다. ' + BK.BOOK.spec +
        '으로 구성되어 있고, 앞부분 ' + BK.PREVIEW_PAGES + '쪽(프론트매터와 제1부 1~4장 전문)을 무료로 공개하고 있습니다. 가입 없이 바로 읽으실 수 있습니다.',
      ctas: [{ label: '미리보기 읽기', route: '#/preview' }, { label: '책 소개·목차', route: '#/book' }]
    });
    D.CHAT_INTENTS.push({
      id: 'c10', chip: '사업 기회 30', keys: ['사업기회', '창업', '아이템', '부록', '기회', '아이디어'],
      answer: '책 부록 A에 분야별 AI 신문명 사업 기회 30가지가 실려 있습니다. 각 항목마다 초기 비용 · 필요 도구 · 첫 고객 세 줄이 붙어 있어 목록이 아니라 실행 계획으로 읽힙니다. 플랫폼에서 전체를 열람하실 수 있습니다.',
      ctas: [{ label: '사업 기회 30 보기', route: '#/book?s=opps' }, { label: '연구랩에서 검증', route: '#/labs' }]
    });
  }

  function chatBoot() {
    if (S.chatLog.length) { chatRender(); return; }
    chatPush('bot',
      '안녕하세요. <b>KAHUGO 가이드</b>입니다.<br>연구 아젠다 · 프로그램 · 랩 · 출판 · 멤버십 · 협력 문의를 안내해 드립니다.<br>' +
      '<span style="font-size:11.5px;color:var(--faint)">' + esc(D.CHAT_CONFIG.disclaimer) + '</span>',
      [{ label: '30초 자가진단', route: '#/diagnosis' }]);
  }

  /* ══════════ §9. 자가진단 엔진 ══════════════════════════ */
  function diagScore() {
    var total = 0, axes = {};
    D.DIAGNOSTIC.questions.forEach(function (q) {
      var v = S.diagAnswers[q.id];
      var n = (typeof v === 'number') ? v : 0;
      total += n;
      axes[q.axis] = { ko: q.axisKo, v: n, research: q.research };
    });
    return { total: total, axes: axes };
  }
  function diagLevel(total) {
    for (var i = 0; i < D.DIAGNOSTIC.levels.length; i++) {
      var l = D.DIAGNOSTIC.levels[i];
      if (total >= l.min && total <= l.max) return l;
    }
    return D.DIAGNOSTIC.levels[0];
  }
  function diagAnswered() { return Object.keys(S.diagAnswers).length; }

  function diagWeakResearch(axes) {
    var arr = Object.keys(axes).map(function (k) { return { k: k, v: axes[k].v, r: axes[k].research }; });
    arr.sort(function (a, b) { return a.v - b.v; });
    var ids = [], i;
    for (i = 0; i < arr.length && ids.length < 3; i++) {
      arr[i].r.forEach(function (rid) { if (ids.indexOf(rid) < 0 && ids.length < 3) ids.push(rid); });
    }
    return ids.map(function (id) { return byId(D.RESEARCH, id); }).filter(Boolean);
  }

  function diagSave() {
    var s = diagScore(), lv = diagLevel(s.total);
    S.diag = {
      date: todayStr(), total: s.total, max: D.DIAGNOSTIC.questions.length * 3,
      level: lv.code, levelName: lv.name,
      axes: Object.keys(s.axes).map(function (k) { return { ko: s.axes[k].ko, v: s.axes[k].v }; }),
      answers: JSON.parse(JSON.stringify(S.diagAnswers))
    };
    persist();
  }

  /* ══════════ §10. 커뮤니티 엔진 ═════════════════════════ */
  function allPosts() {
    return D.COMMUNITY_SEED.map(function (s) {
      return { id: s.id, official: true, author: s.author, cat: s.cat, title: s.title, body: s.body, date: '', seed: true };
    }).concat(S.posts);
  }
  function repliesOf(id) {
    var own = byId(S.posts, id);
    if (own) return own.replies || [];
    var seed = byId(D.COMMUNITY_SEED, id);
    if (seed && seed.__replies) return seed.__replies;
    var store = safeStore.get('kahugo.replies.' + id, []) || [];
    return store;
  }
  function addReply(id, who, text) {
    var own = byId(S.posts, id);
    if (own) { own.replies = own.replies || []; own.replies.push({ who: who, text: text, date: todayStr() }); persist(); return; }
    var arr = safeStore.get('kahugo.replies.' + id, []) || [];
    arr.push({ who: who, text: text, date: todayStr() });
    safeStore.set('kahugo.replies.' + id, arr);
  }

  /* ══════════ §11. 뷰 렌더러 ═════════════════════════════ */
  var I = D.INSTITUTE;

  function bmkBtn(id, label) {
    var on = S.bookmarks.indexOf(id) >= 0;
    return '<button type="button" class="bmk' + (on ? ' is-on' : '') + '" data-action="bookmark" data-id="' + attr(id) + '" ' +
      'aria-pressed="' + (on ? 'true' : 'false') + '" aria-label="' + attr(label || '') + ' 북마크">' + ic('bookmark') + '</button>';
  }

  function crumb(items) {
    return '<nav class="crumb" aria-label="현재 위치">' +
      items.map(function (it, i) {
        var sep = i ? ic('chev') : '';
        return sep + (it.route ? '<a href="' + attr(it.route) + '">' + esc(it.t) + '</a>' : '<span>' + esc(it.t) + '</span>');
      }).join('') + '</nav>';
  }

  /* ── 홈 ── */
  /* ── 이어서 하기 ──────────────────────────────────────────
     재방문자가 "지난번에 어디까지 했더라"를 다시 찾지 않게 한다.
     읽던 쪽 → 풀던 진단 → 최근 본 콘텐츠 순으로 하나만 보여 준다.
     새 방문자에게는 아무것도 노출하지 않는다. */
  function resumeCard() {
    var total = BK ? BK.BOOK_PREVIEW.length : 0;
    var r = null;

    if (BK && S.readPos > 1 && S.readPos < total) {
      r = { icon: 'pages', k: '이어서 읽기',
            t: '『제5의 물결과 AI 신문명시대』 ' + S.readPos + '쪽',
            s: '미리보기 ' + total + '쪽 중 ' + S.readPos + '쪽까지 읽으셨습니다.',
            pct: Math.round(S.readPos / total * 100),
            go: '#/preview', label: '이어서 읽기' };
    } else if (!S.diag && diagAnswered() > 0) {
      var qn = D.DIAGNOSTIC.questions.length;
      r = { icon: 'gauge', k: '이어서 진단하기',
            t: 'AI휴먼전략 자가진단 ' + diagAnswered() + ' / ' + qn + '문항',
            s: '남은 ' + (qn - diagAnswered()) + '문항만 답하시면 결과가 나옵니다.',
            pct: Math.round(diagAnswered() / qn * 100),
            go: '#/diagnosis', label: '이어서 진단' };
    } else if (S.recent.length) {
      var last = S.recent[0];
      r = { icon: 'compass', k: '최근 보던 곳',
            t: last.title, s: last.t + ' · 마지막으로 열어 보신 화면입니다.',
            pct: 0, go: last.route, label: '다시 열기' };
    } else if (S.bookmarks.length) {
      r = { icon: 'bookmark', k: '저장해 두신 것',
            t: '내 서재에 ' + S.bookmarks.length + '건이 담겨 있습니다',
            s: '저장한 아젠다·리포트를 한자리에서 확인하실 수 있습니다.',
            pct: 0, go: '#/my', label: '내 서재 열기' };
    }
    if (!r) return '';

    return '<section class="resume"><div class="wrap"><div class="resume__in">' +
      '<span class="resume__ic">' + ic(r.icon) + '</span>' +
      '<span class="resume__tx">' +
        '<span class="resume__k">' + esc(r.k) + '</span>' +
        '<span class="resume__t">' + esc(r.t) + '</span>' +
        '<span class="resume__s">' + esc(r.s) + '</span>' +
        (r.pct ? '<span class="resume__bar"><span class="bar"><span class="bar__fill" style="width:' +
          r.pct + '%"></span></span><span class="resume__pct">' + r.pct + '%</span></span>' : '') +
      '</span>' +
      '<span class="resume__go"><a class="btn btn--accent btn--sm" href="' + attr(r.go) + '">' +
        ic('arrow') + esc(r.label) + '</a></span>' +
    '</div></div></section>';
  }

  function viewHome() {
    var wq = D.WEEKLY_QUESTIONS[(S.visits - 1) % D.WEEKLY_QUESTIONS.length];
    var diagCard = S.diag
      ? '<div class="card" style="border-color:var(--accent)">' +
          '<div class="row" style="justify-content:space-between">' +
            '<span class="badge badge--accent">' + esc(S.diag.level) + ' · ' + esc(S.diag.levelName) + '</span>' +
            '<span class="badge">' + esc(S.diag.date) + '</span>' +
          '</div>' +
          '<h3 class="card__title">최근 자가진단 결과가 저장되어 있습니다</h3>' +
          '<div class="bar" style="margin:10px 0"><div class="bar__fill" style="width:' +
            Math.round(S.diag.total / S.diag.max * 100) + '%"></div></div>' +
          '<p class="card__desc">' + esc(S.diag.total) + ' / ' + esc(S.diag.max) + '점 · 다시 진단하면 변화를 비교할 수 있습니다.</p>' +
          '<div class="row" style="margin-top:12px"><a class="btn btn--accent btn--sm" href="#/diagnosis">결과 다시 보기</a>' +
          '<a class="btn btn--line btn--sm" href="#/my">내 서재</a></div></div>'
      : '';

    return '' +
    /* HERO */
    '<section class="hero"><div class="wrap"><div class="hero__in">' +
      '<span class="badge badge--accent hero__badge badge--dot">' + esc(I.badge) + '</span>' +
      '<h1 class="hero__h">' + esc(I.heroLine1) + '<br>' + esc(I.heroLine2) + '<br><em>' + esc(I.heroLine3) + '</em></h1>' +
      '<p class="hero__sub">' + esc(I.heroSub) + '</p>' +
      '<p class="hero__focus">' + esc(I.focusLine) + '</p>' +
      '<div class="hero__cta">' +
        '<a class="btn btn--accent" href="#/diagnosis">' + ic('gauge') + '30초 자가진단 시작</a>' +
        '<a class="btn btn--ghost" href="#/research">' + ic('compass') + '12대 아젠다 보기</a>' +
      '</div>' +
    '</div></div></section>' +

    /* 이어서 하기 (재방문자) */
    resumeCard() +

    /* 퀵액션 */
    '<section class="sec sec--tight"><div class="wrap">' +
      '<div class="grid grid--4">' +
        D.QUICK_ACTIONS.map(function (q) {
          return '<a class="qa reveal' + (q.primary ? ' qa--primary' : '') + '" href="' + attr(q.route) + '">' +
            '<span class="qa__ic">' + ic(q.icon) + '</span>' +
            '<span><span class="qa__t">' + esc(q.title) + '</span><span class="qa__s">' + esc(q.sub) + '</span></span></a>';
        }).join('') +
      '</div>' +
      (diagCard ? '<div style="margin-top:14px">' + diagCard + '</div>' : '') +
    '</div></section>' +

    /* 이번 주의 질문 */
    '<section class="sec sec--alt"><div class="wrap">' +
      '<div class="sec__head"><span class="sec__eyebrow">이번 주의 AI Human Question</span>' +
      '<h2 class="sec__title">질문이 바뀌면 답이 바뀝니다</h2></div>' +
      '<div class="card reveal" style="border-left:3px solid var(--accent)">' +
        '<p style="font-size:var(--fs-h3);color:var(--ink);line-height:1.6;font-weight:650">' + esc(wq.q) + '</p>' +
        '<div class="row" style="margin-top:14px">' +
          '<a class="btn btn--accent btn--sm" href="' + attr(wq.link) + '">관련 연구 보기</a>' +
          '<button type="button" class="btn btn--line btn--sm" data-action="next-question">' + ic('arrow') + '다른 질문 보기</button>' +
          '<button type="button" class="btn btn--line btn--sm" data-action="share" data-title="' + attr(wq.q) + '">' + ic('share') + '공유</button>' +
        '</div>' +
      '</div>' +
    '</div></section>' +

    /* Start Here */
    '<section class="sec"><div class="wrap">' +
      '<div class="sec__head"><span class="sec__eyebrow">Start Here</span>' +
      '<h2 class="sec__title">어디서 시작하시겠습니까?</h2>' +
      '<p class="sec__sub">역할에 따라 필요한 것이 다릅니다. 자신에게 맞는 입구를 고르세요.</p></div>' +
      '<div class="grid grid--4">' +
        D.START_HERE.map(function (s) {
          return '<a class="card card--link reveal" href="' + attr(s.route) + '">' +
            '<span class="card__icon">' + ic(s.icon) + '</span>' +
            '<h3 class="card__title">' + esc(s.name) + '</h3>' +
            '<p class="card__desc">' + esc(s.line) + '</p>' +
            '<div class="card__foot"><span class="badge badge--brand">' + esc(s.next) + ' ' + '→</span></div></a>';
        }).join('') +
      '</div>' +
    '</div></section>' +

    /* 정체성 */
    '<section class="sec sec--alt"><div class="wrap">' +
      '<div class="sec__head"><span class="sec__eyebrow">기관 정체성</span>' +
      '<h2 class="sec__title">' + esc(I.identityHeadline) + '</h2>' +
      '<p class="sec__sub">' + esc(I.identitySub) + '</p></div>' +
      '<div class="grid grid--2">' +
        '<div class="card reveal">' +
          '<h3 class="card__title">' + esc(I.whyNowHeadline) + '</h3>' +
          '<p class="card__desc" style="margin-bottom:12px">' + esc(I.whyNowBody) + '</p>' +
          I.whyNowPoints.map(function (p) { return '<div class="doc__li">' + esc(p) + '</div>'; }).join('') +
        '</div>' +
        '<div class="card reveal" style="background:linear-gradient(150deg,var(--surface-2),var(--surface))">' +
          '<span class="card__icon">' + ic('spark') + '</span>' +
          '<p style="font-size:var(--fs-h3);color:var(--ink);line-height:1.55;font-weight:700;margin-bottom:10px">' + esc(I.quote) + '</p>' +
          '<p class="card__desc">' + esc(I.quoteSub) + '</p>' +
          '<div class="card__foot"><a class="btn btn--line btn--sm" href="#/about">' + ic('info') + '연구원 소개 자세히</a></div>' +
        '</div>' +
      '</div>' +
    '</div></section>' +

    /* 4대 사업축 */
    '<section class="sec"><div class="wrap">' +
      '<div class="sec__head"><span class="sec__eyebrow">4대 사업축</span>' +
      '<h2 class="sec__title">연구 · 교육 · 포럼 · 출판이 하나의 흐름으로</h2>' +
      '<p class="sec__sub">질문을 연구로, 연구를 교육으로, 교육을 프로젝트로, 프로젝트를 성과로 연결합니다.</p></div>' +
      '<div class="grid grid--4">' +
        D.PROGRAMS.map(function (p) {
          return '<a class="card card--link reveal" href="#/programs?p=' + attr(p.id) + '">' +
            '<span class="card__no">' + esc(p.no) + '</span>' +
            '<span class="card__icon" style="margin-top:8px">' + ic(p.icon) + '</span>' +
            '<h3 class="card__title">' + esc(p.name) + '</h3>' +
            '<p class="card__desc">' + esc(p.lead) + '</p></a>';
        }).join('') +
      '</div>' +
      '<div class="bridge" style="margin-top:18px">여기까지가 무엇을 하는가입니다. 그렇다면 <b>지금 내 조직은 어디쯤</b> 와 있을까요?</div>' +
    '</div></section>' +

    /* 진단 유도 */
    '<section class="sec sec--alt"><div class="wrap">' +
      '<div class="card reveal" style="text-align:center;border-color:var(--accent);padding:28px 18px">' +
        '<span class="card__icon" style="margin:0 auto 12px">' + ic('gauge') + '</span>' +
        '<h2 class="sec__title" style="margin-bottom:8px">' + esc(D.DIAGNOSTIC.title) + '</h2>' +
        '<p class="sec__sub" style="margin:0 auto 16px">' + esc(D.DIAGNOSTIC.lead) + '</p>' +
        '<a class="btn btn--accent" href="#/diagnosis">' + ic('gauge') + '지금 진단 시작하기</a>' +
      '</div>' +
    '</div></section>' +

    /* 도서 서브퍼널 */
    (BK ? '<section class="sec"><div class="wrap">' +
      '<div class="sec__head"><span class="sec__eyebrow">' + esc(BK.BOOK.badge) + '</span>' +
      '<h2 class="sec__title">원장이 쓴 책, 연구원이 선 자리</h2>' +
      '<p class="sec__sub">12대 아젠다의 출발점이 된 문제의식이 한 권으로 정리되어 있습니다.</p></div>' +
      '<div class="bkpromo reveal">' +
        '<a class="bkpromo__cv" href="#/book" aria-label="책 소개 열기">' +
          '<img src="' + attr(bookCover()) + '" alt="' + attr(BK.BOOK.title + ' 표지') + '" width="200" height="286" loading="lazy"></a>' +
        '<div class="bkpromo__tx">' +
          '<span class="badge badge--gold">' + esc(BK.BOOK.series) + '</span>' +
          '<h3 class="bkpromo__h">' + esc(BK.BOOK.title) + '</h3>' +
          '<p class="bkpromo__s">' + esc(BK.BOOK.subtitle) + '</p>' +
          '<div class="bkhook" style="margin:12px 0">' +
          BK.BOOK.hook.split('\n').map(function (l) { return '<span>' + esc(l) + '</span>'; }).join('') + '</div>' +
          '<p class="card__desc">' + esc(BK.BOOK.spec) + '</p>' +
          '<div class="row" style="margin-top:14px">' +
            '<a class="btn btn--accent btn--sm" href="#/preview">' + ic('pages') + BK.PREVIEW_PAGES + '쪽 미리보기</a>' +
            '<a class="btn btn--ghost btn--sm" href="#/book">' + ic('book') + '책 소개·목차</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="bridge" style="margin-top:18px">책이 던진 질문을 연구로 옮긴 것이 <a href="#/research">12대 아젠다</a>입니다.</div>' +
    '</div></section>' : '') +

    /* 신뢰 표기 */
    '<section class="sec"><div class="wrap">' +
      '<div class="sec__head"><span class="sec__eyebrow">표기 원칙</span>' +
      '<h2 class="sec__title">과장하지 않는 것이 가장 강한 설득입니다</h2></div>' +
      '<div class="grid grid--4">' +
        D.TRUST_NOTES.map(function (t) {
          return '<div class="card reveal"><span class="card__icon">' + ic(t.icon) + '</span>' +
            '<h3 class="card__title">' + esc(t.title) + '</h3>' +
            '<p class="card__desc">' + esc(t.text) + '</p></div>';
        }).join('') +
      '</div>' +
    '</div></section>' +

    /* 클로징 */
    '<section class="sec sec--alt"><div class="wrap" style="text-align:center">' +
      '<h2 class="sec__title" style="max-width:640px;margin:0 auto 10px">' + esc(I.closingHeadline) + '</h2>' +
      '<p class="sec__sub" style="margin:0 auto 18px">' + esc(I.closingSub) + '</p>' +
      '<div class="row" style="justify-content:center">' +
        '<a class="btn btn--accent" href="#/contact">' + ic('mail') + '협력·문의하기</a>' +
        '<a class="btn btn--ghost" href="#/community">' + ic('users') + '커뮤니티 참여</a>' +
      '</div>' +
    '</div></section>';
  }

  /* ── 연구 허브 ── */
  function viewResearch(r) {
    if (r.param) return viewResearchDetail(r.param);

    var cat = r.query.cat || S.filter.cat || 'all';
    S.filter.cat = cat;
    var list = D.RESEARCH.filter(function (x) { return cat === 'all' || x.cat === cat; });

    return '<div class="wrap sec">' +
      crumb([{ t: '홈', route: '#/home' }, { t: '연구 허브' }]) +
      '<div class="sec__head"><span class="sec__eyebrow">AI × Human 전략 지도</span>' +
      '<h1 class="sec__title">12대 AI휴먼전략 아젠다</h1>' +
      '<p class="sec__sub">8개 상위 분류로 묶인 12개 연구 아젠다입니다. 각 아젠다는 하나의 질문에서 출발합니다.</p></div>' +

      '<div class="chips chips--x" style="margin-bottom:16px" role="group" aria-label="연구 분야 필터">' +
        '<button type="button" class="chip' + (cat === 'all' ? ' is-on' : '') + '" data-action="research-cat" data-cat="all">전체 ' + D.RESEARCH.length + '</button>' +
        D.CATEGORIES.map(function (c) {
          var n = D.RESEARCH.filter(function (x) { return x.cat === c.id; }).length;
          if (!n) return '';
          return '<button type="button" class="chip' + (cat === c.id ? ' is-on' : '') + '" data-action="research-cat" data-cat="' + attr(c.id) + '">' +
            ic(c.icon) + esc(c.ko) + ' ' + n + '</button>';
        }).join('') +
      '</div>' +

      (list.length
        ? '<div class="grid grid--3">' + list.map(researchCard).join('') + '</div>'
        : '<div class="empty">' + ic('search') + '<div class="empty__t">해당 분야의 아젠다가 없습니다</div>' +
          '<button type="button" class="btn btn--ghost btn--sm" data-action="research-cat" data-cat="all">전체 보기</button></div>') +

      '<div class="bridge" style="margin-top:20px">아젠다는 질문입니다. 이 질문을 <b>실제 프로젝트로 옮기는 곳</b>이 연구랩입니다. ' +
      '<a href="#/labs">연구랩 보기 →</a></div>' +
    '</div>';
  }

  function researchCard(x) {
    var c = catOf(x.cat);
    return '<article class="card rcard reveal">' +
      '<div class="rcard__top">' +
        '<span class="card__no">AGENDA ' + esc(x.no) + '</span>' +
        bmkBtn(x.id, x.title) +
      '</div>' +
      '<span class="badge badge--brand">' + ic(c.icon) + esc(c.ko) + '</span>' +
      '<h3 class="card__title">' + esc(x.title) + '</h3>' +
      '<p class="card__desc">' + esc(x.desc) + '</p>' +
      '<div class="rcard__q">' + esc(x.question) + '</div>' +
      '<div class="rcard__tags"><div class="chips">' +
        x.tags.slice(0, 3).map(function (t) { return '<span class="chip chip--tag">#' + esc(t) + '</span>'; }).join('') +
      '</div></div>' +
      '<div class="card__foot"><a class="btn btn--line btn--sm btn--block" href="#/research/' + attr(x.id) + '">' +
        '연구 상세 열기' + ic('arrow') + '</a></div>' +
    '</article>';
  }

  function viewResearchDetail(id) {
    var x = byId(D.RESEARCH, id);
    if (!x) return viewNotFound('research/' + id);
    var c = catOf(x.cat);
    var dec = D.DECLARATIONS[x.declaration - 1];
    var progs = (x.programs || []).map(function (p) { return byId(D.PROGRAMS, p); }).filter(Boolean);
    var labs = D.LABS.filter(function (l) { return (l.research || []).indexOf(x.id) >= 0; });
    var pubs = D.PUBLICATIONS.filter(function (p) { return (x.pubs || []).indexOf(p.type) >= 0; }).slice(0, 4);

    return '<div class="wrap sec">' +
      crumb([{ t: '홈', route: '#/home' }, { t: '연구 허브', route: '#/research' }, { t: x.title }]) +
      '<div class="row" style="justify-content:space-between;align-items:flex-start;margin-bottom:12px">' +
        '<div><span class="badge badge--brand">' + ic(c.icon) + esc(c.ko) + '</span> ' +
        '<span class="badge">AGENDA ' + esc(x.no) + '</span></div>' +
        '<div class="row">' + bmkBtn(x.id, x.title) +
        '<button type="button" class="bmk" data-action="share" data-title="' + attr(x.title) + '" aria-label="공유">' + ic('share') + '</button></div>' +
      '</div>' +
      '<h1 style="font-size:var(--fs-h1);margin-bottom:10px">' + esc(x.title) + '</h1>' +
      '<p class="doc__lead">' + esc(x.desc) + '</p>' +

      '<div class="card" style="border-left:3px solid var(--accent);margin-bottom:24px">' +
        '<div class="sec__eyebrow">연구 질문</div>' +
        '<p style="font-size:var(--fs-h3);color:var(--ink);line-height:1.6;font-weight:650">' + esc(x.question) + '</p>' +
      '</div>' +

      '<div class="doc">' +
        '<div class="doc__block"><h2 class="doc__h">왜 중요한가</h2><p style="font-size:var(--fs-sm);color:var(--ink-2)">' + esc(x.why) + '</p></div>' +
        '<div class="doc__block"><h2 class="doc__h">핵심 인사이트</h2>' +
          x.insights.map(function (t) { return '<div class="doc__li">' + esc(t) + '</div>'; }).join('') + '</div>' +
        '<div class="doc__block"><h2 class="doc__h">적용 대상</h2><div class="chips">' +
          x.targets.map(function (t) { return '<span class="chip chip--tag">' + esc(t) + '</span>'; }).join('') + '</div></div>' +
        (dec ? '<div class="doc__block"><h2 class="doc__h">관련 창립선언</h2>' +
          '<a class="card card--link" href="#/about?s=declaration&d=' + x.declaration + '">' +
          '<span class="card__no">선언 ' + pad2(x.declaration) + '</span>' +
          '<h3 class="card__title">' + esc(dec.title) + '</h3>' +
          '<p class="card__desc">' + esc(dec.short) + '</p></a></div>' : '') +
      '</div>' +

      (progs.length ? '<div class="doc__block"><h2 class="doc__h">관련 프로그램</h2><div class="grid grid--2">' +
        progs.map(function (p) {
          return '<a class="card card--link" href="#/programs?p=' + attr(p.id) + '">' +
            '<span class="card__icon">' + ic(p.icon) + '</span>' +
            '<h3 class="card__title">' + esc(p.name) + '</h3>' +
            '<p class="card__desc">' + esc(p.lead) + '</p></a>';
        }).join('') + '</div></div>' : '') +

      (labs.length ? '<div class="doc__block"><h2 class="doc__h">이 연구를 수행할 랩</h2><div class="grid grid--2">' +
        labs.map(function (l) {
          return '<a class="card card--link" href="#/labs/' + attr(l.id) + '">' +
            '<span class="badge badge--gold">Proposed</span>' +
            '<h3 class="card__title">' + esc(l.ko) + '</h3>' +
            '<p class="card__desc">' + esc(l.focus) + '</p></a>';
        }).join('') + '</div></div>' : '') +

      (pubs.length ? '<div class="doc__block"><h2 class="doc__h">관련 출판 계획</h2><div class="stack">' +
        pubs.map(function (p) {
          return '<a class="card card--link" href="#/publications/' + attr(p.id) + '">' +
            '<div class="row" style="justify-content:space-between"><span class="badge">' + esc((byId(D.PUB_TYPES, p.type) || {}).ko || p.type) + '</span>' +
            '<span class="badge badge--gold">' + esc(p.plan) + '</span></div>' +
            '<h3 class="card__title">' + esc(p.title) + '</h3></a>';
        }).join('') + '</div></div>' : '') +

      (BK && BK.BOOK_LINKS[x.id] ? bookCallout(BK.BOOK_LINKS[x.id]) : '') +

      '<div class="card" style="text-align:center;border-color:var(--accent);margin-top:24px">' +
        '<h3 class="card__title">이 연구를 함께 하시겠습니까?</h3>' +
        '<p class="card__desc" style="margin-bottom:14px">공동연구 · 파일럿 · 교육 의뢰 · 정책과제 모두 열려 있습니다.</p>' +
        '<div class="row" style="justify-content:center">' +
          '<a class="btn btn--accent btn--sm" href="#/partnership">협력 제안하기</a>' +
          '<a class="btn btn--line btn--sm" href="#/research">' + ic('arrow') + '다른 아젠다 보기</a>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ── 연구랩 ── */
  function viewLabs(r) {
    if (r.param) return viewLabDetail(r.param);
    return '<div class="wrap sec">' +
      crumb([{ t: '홈', route: '#/home' }, { t: '연구랩' }]) +
      '<div class="sec__head"><span class="sec__eyebrow">Lab Architecture</span>' +
      '<h1 class="sec__title">AI휴먼전략랩 · 6개 랩 구조</h1>' +
      '<p class="sec__sub">연구 질문을 실제 프로젝트로 옮기는 실행 조직입니다.</p></div>' +
      '<div class="notice" style="margin-bottom:18px">' + ic('flag') +
      '<span>아래 6개 랩은 모두 <b>구축 제안(Proposed)</b> 단계입니다. 확정 조직이 아니며, 파트너 확정 시 순차 개설합니다.</span></div>' +
      '<div class="grid grid--3">' +
        D.LABS.map(function (l) {
          return '<a class="card card--link reveal" href="#/labs/' + attr(l.id) + '">' +
            '<div class="row" style="justify-content:space-between"><span class="badge badge--gold badge--dot">Proposed</span></div>' +
            '<h3 class="card__title">' + esc(l.ko) + '</h3>' +
            '<p style="font-size:11px;color:var(--faint);font-family:var(--font-num);margin-bottom:7px">' + esc(l.name) + '</p>' +
            '<p class="card__desc">' + esc(l.focus) + '</p>' +
            '<div class="card__foot"><div class="chips">' +
              l.themes.slice(0, 2).map(function (t) { return '<span class="chip chip--tag">' + esc(t) + '</span>'; }).join('') +
            '</div></div></a>';
        }).join('') +
      '</div>' +

      '<div class="sec__head" style="margin-top:36px"><span class="sec__eyebrow">Process</span>' +
      '<h2 class="sec__title">실행 프로세스 6단계</h2></div>' +
      '<div class="tl">' +
        D.LAB_PROCESS.map(function (p) {
          return '<div class="tl__item reveal"><div class="tl__term">STEP ' + esc(p.step) + '</div>' +
            '<h3 class="tl__name">' + esc(p.name) + '</h3>' +
            '<p style="font-size:var(--fs-sm);color:var(--sub)">' + esc(p.desc) + '</p></div>';
        }).join('') +
      '</div>' +
      '<div class="bridge" style="margin-top:22px">랩은 파트너와 함께 열립니다. <a href="#/partnership">공동 프로젝트 제안하기 →</a></div>' +
    '</div>';
  }

  function viewLabDetail(id) {
    var l = byId(D.LABS, id);
    if (!l) return viewNotFound('labs/' + id);
    var rs = (l.research || []).map(function (x) { return byId(D.RESEARCH, x); }).filter(Boolean);
    return '<div class="wrap sec">' +
      crumb([{ t: '홈', route: '#/home' }, { t: '연구랩', route: '#/labs' }, { t: l.ko }]) +
      '<span class="badge badge--gold badge--dot">Proposed · 구축 제안</span>' +
      '<h1 style="font-size:var(--fs-h1);margin:10px 0 5px">' + esc(l.ko) + '</h1>' +
      '<p style="font-family:var(--font-num);font-size:12px;color:var(--faint);margin-bottom:14px">' + esc(l.name) + '</p>' +
      '<p class="doc__lead">' + esc(l.focus) + '</p>' +
      '<div class="doc__block"><h2 class="doc__h">주요 연구 테마</h2>' +
        l.themes.map(function (t) { return '<div class="doc__li">' + esc(t) + '</div>'; }).join('') + '</div>' +
      (rs.length ? '<div class="doc__block"><h2 class="doc__h">연결된 연구 아젠다</h2><div class="grid grid--2">' +
        rs.map(function (x) {
          return '<a class="card card--link" href="#/research/' + attr(x.id) + '">' +
            '<span class="card__no">AGENDA ' + esc(x.no) + '</span>' +
            '<h3 class="card__title">' + esc(x.title) + '</h3>' +
            '<p class="card__desc">' + esc(x.desc) + '</p></a>';
        }).join('') + '</div></div>' : '') +
      '<div class="doc__block"><h2 class="doc__h">실행 프로세스</h2><div class="tl">' +
        D.LAB_PROCESS.map(function (p) {
          return '<div class="tl__item"><div class="tl__term">STEP ' + esc(p.step) + '</div>' +
            '<h3 class="tl__name">' + esc(p.name) + '</h3>' +
            '<p style="font-size:var(--fs-sm);color:var(--sub)">' + esc(p.desc) + '</p></div>';
        }).join('') + '</div></div>' +
      '<div class="row"><a class="btn btn--accent btn--sm" href="#/partnership">이 랩에 참여 제안하기</a>' +
      '<a class="btn btn--line btn--sm" href="#/labs">' + ic('arrow') + '다른 랩 보기</a></div>' +
    '</div>';
  }

  /* ── 프로그램 (4대 사업축) ── */
  function viewPrograms(r) {
    var pid = r.query.p || D.PROGRAMS[0].id;
    var p = byId(D.PROGRAMS, pid) || D.PROGRAMS[0];
    return '<div class="wrap sec">' +
      crumb([{ t: '홈', route: '#/home' }, { t: '4대 사업축' }]) +
      '<div class="sec__head"><span class="sec__eyebrow">4대 사업축</span>' +
      '<h1 class="sec__title">포럼 · 아카데미 · 랩 · 리포트</h1>' +
      '<p class="sec__sub">네 개의 축이 하나의 흐름으로 이어집니다.</p></div>' +

      '<div class="tabs" style="margin-bottom:18px" role="tablist">' +
        D.PROGRAMS.map(function (x) {
          return '<button type="button" class="tab' + (x.id === p.id ? ' is-on' : '') + '" role="tab" ' +
            'aria-selected="' + (x.id === p.id ? 'true' : 'false') + '" data-action="program-tab" data-p="' + attr(x.id) + '">' +
            esc(x.en) + '</button>';
        }).join('') +
      '</div>' +

      '<div class="card">' +
        '<span class="card__no">' + esc(p.no) + '</span>' +
        '<span class="card__icon" style="margin-top:8px">' + ic(p.icon) + '</span>' +
        '<h2 style="font-size:var(--fs-h2);margin-bottom:8px">' + esc(p.name) + '</h2>' +
        '<p style="font-size:var(--fs-sm);color:var(--ink-2);margin-bottom:8px">' + esc(p.lead) + '</p>' +
        '<p class="card__desc" style="margin-bottom:14px">' + esc(p.desc) + '</p>' +
        p.bullets.map(function (b) { return '<div class="doc__li">' + esc(b) + '</div>'; }).join('') +
      '</div>' +

      (p.levels ? '<div class="doc__block" style="margin-top:24px"><h2 class="doc__h">단계형 커리큘럼</h2>' +
        '<div class="tbl__wrap"><div class="scroll-x"><table class="tbl">' +
        '<thead><tr><th>단계</th><th>과정</th><th>내용</th><th>상태</th></tr></thead><tbody>' +
        p.levels.map(function (l) {
          return '<tr><td><b style="color:var(--accent);font-family:var(--font-num)">' + esc(l.lv) + '</b></td>' +
            '<td><b style="color:var(--ink)">' + esc(l.name) + '</b></td><td>' + esc(l.desc) + '</td>' +
            '<td><span class="badge badge--gold">준비 중</span></td></tr>';
        }).join('') + '</tbody></table></div></div></div>' : '') +

      (p.formats ? '<div class="doc__block" style="margin-top:24px"><h2 class="doc__h">포럼 운영 포맷</h2>' +
        '<div class="grid grid--2">' +
        p.formats.map(function (f) {
          return '<div class="card"><div class="row" style="justify-content:space-between">' +
            '<h3 class="card__title" style="margin:0">' + esc(f.name) + '</h3>' +
            '<span class="badge badge--gold">준비 중</span></div>' +
            '<p class="card__desc" style="margin-top:7px">' + esc(f.desc) + '</p></div>';
        }).join('') + '</div></div>' : '') +

      (p.id === 'lab' ? '<div class="row" style="margin-top:20px"><a class="btn btn--accent btn--sm" href="#/labs">' +
        ic('flask') + '랩 아키텍처 6개 보기</a></div>' : '') +
      (p.id === 'report' ? '<div class="row" style="margin-top:20px"><a class="btn btn--accent btn--sm" href="#/publications">' +
        ic('book') + '발행 라인업 보기</a></div>' : '') +

      (BK && BK.BOOK_PROG_LINKS[p.id] ? bookCallout(BK.BOOK_PROG_LINKS[p.id]) : '') +

      '<div class="notice" style="margin-top:22px">' + ic('info') +
      '<span>일정이 확정되지 않은 과정과 세션은 <b>준비 중</b>으로 표기됩니다. ' +
      '<a href="#/community?focus=subscribe">발행·개설 알림을 신청</a>하시면 확정 시 안내드립니다.</span></div>' +
    '</div>';
  }

  /* ── 출판·리포트 ── */
  function viewPublications(r) {
    if (r.param) return viewPubDetail(r.param);
    var t = r.query.t || S.filter.pubType || 'all';
    S.filter.pubType = t;
    var list = D.PUBLICATIONS.filter(function (p) { return t === 'all' || p.type === t; });

    return '<div class="wrap sec">' +
      crumb([{ t: '홈', route: '#/home' }, { t: '출판·리포트' }]) +
      '<div class="sec__head"><span class="sec__eyebrow">AI Human Strategy Report</span>' +
      '<h1 class="sec__title">발행 라인업 ' + D.PUBLICATIONS.length + '종</h1>' +
      '<p class="sec__sub">연구 리포트 · 전략 브리프 · 백서 · 도서 · 뉴스레터 · 강의/미디어</p></div>' +

      '<div class="notice" style="margin-bottom:16px">' + ic('flag') +
      '<span>현재 모든 항목이 <b>발행 준비 단계</b>입니다. 실제 파일이 없는 상태에서 다운로드 버튼을 열어 두지 않는 것이 저희 원칙입니다. ' +
      '발행 알림을 신청하시면 창간 시 가장 먼저 안내드립니다.</span></div>' +

      '<div class="chips chips--x" style="margin-bottom:16px" role="group" aria-label="출판 유형 필터">' +
        '<button type="button" class="chip' + (t === 'all' ? ' is-on' : '') + '" data-action="pub-type" data-t="all">전체 ' + D.PUBLICATIONS.length + '</button>' +
        D.PUB_TYPES.map(function (x) {
          var n = D.PUBLICATIONS.filter(function (p) { return p.type === x.id; }).length;
          if (!n) return '';
          return '<button type="button" class="chip' + (t === x.id ? ' is-on' : '') + '" data-action="pub-type" data-t="' + attr(x.id) + '">' +
            esc(x.ko) + ' ' + n + '</button>';
        }).join('') +
      '</div>' +

      (list.length ? '<div class="grid grid--3">' + list.map(function (p) {
        var on = S.pubAlerts.indexOf(p.id) >= 0;
        return '<article class="card reveal" style="display:flex;flex-direction:column">' +
          '<div class="row" style="justify-content:space-between">' +
            '<span class="badge badge--brand">' + esc((byId(D.PUB_TYPES, p.type) || {}).ko || p.type) + '</span>' +
            bmkBtn(p.id, p.title) +
          '</div>' +
          '<h3 class="card__title">' + esc(p.title) + '</h3>' +
          '<p class="card__desc">' + esc(p.desc) + '</p>' +
          '<div class="card__foot" style="margin-top:auto">' +
            '<div class="row" style="justify-content:space-between;margin-bottom:9px">' +
            '<span class="badge badge--gold">' + esc(p.plan) + '</span></div>' +
            '<div class="row">' +
              '<a class="btn btn--line btn--sm" href="#/publications/' + attr(p.id) + '">상세</a>' +
              '<button type="button" class="btn btn--sm ' + (on ? 'btn--accent' : 'btn--ghost') + '" data-action="pub-alert" data-id="' + attr(p.id) + '">' +
              ic('bell') + (on ? '알림 신청됨' : '발행 알림') + '</button>' +
            '</div>' +
          '</div>' +
        '</article>';
      }).join('') + '</div>' : '<div class="empty">' + ic('book') + '<div class="empty__t">해당 유형의 출판물이 없습니다</div>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-action="pub-type" data-t="all">전체 보기</button></div>') +
    '</div>';
  }

  function viewPubDetail(id) {
    var p = byId(D.PUBLICATIONS, id);
    if (!p) return viewNotFound('publications/' + id);
    var on = S.pubAlerts.indexOf(p.id) >= 0;
    var same = D.PUBLICATIONS.filter(function (x) { return x.type === p.type && x.id !== p.id; }).slice(0, 3);
    return '<div class="wrap sec">' +
      crumb([{ t: '홈', route: '#/home' }, { t: '출판·리포트', route: '#/publications' }, { t: p.title }]) +
      '<div class="row" style="justify-content:space-between;align-items:flex-start;margin-bottom:10px">' +
      '<span class="badge badge--brand">' + esc((byId(D.PUB_TYPES, p.type) || {}).ko || p.type) + '</span>' +
      '<div class="row">' + bmkBtn(p.id, p.title) +
      '<button type="button" class="bmk" data-action="share" data-title="' + attr(p.title) + '" aria-label="공유">' + ic('share') + '</button></div></div>' +
      '<h1 style="font-size:var(--fs-h1);margin-bottom:10px">' + esc(p.title) + '</h1>' +
      '<p class="doc__lead">' + esc(p.desc) + '</p>' +
      '<div class="card" style="margin-bottom:20px">' +
        '<div class="row" style="justify-content:space-between"><span class="badge badge--gold">' + esc(p.plan) + '</span>' +
        '<span class="badge">발행 준비 단계</span></div>' +
        '<p class="card__desc" style="margin-top:11px">아직 발행되지 않은 출판물입니다. 다운로드는 실제 파일이 준비된 뒤에 열립니다. ' +
        '알림을 신청해 두시면 발행 시 이 화면에서 바로 받아보실 수 있습니다.</p>' +
        '<div class="row" style="margin-top:14px">' +
          '<button type="button" class="btn btn--sm ' + (on ? 'btn--accent' : 'btn--ghost') + '" data-action="pub-alert" data-id="' + attr(p.id) + '">' +
          ic('bell') + (on ? '알림 신청됨 · 해제하기' : '발행 알림 신청') + '</button>' +
        '</div>' +
      '</div>' +
      (same.length ? '<h2 class="doc__h">같은 유형의 다른 출판물</h2><div class="stack">' +
        same.map(function (x) {
          return '<a class="card card--link" href="#/publications/' + attr(x.id) + '">' +
            '<h3 class="card__title" style="margin-top:0">' + esc(x.title) + '</h3>' +
            '<p class="card__desc">' + esc(x.desc) + '</p></a>';
        }).join('') + '</div>' : '') +
      '<div class="row" style="margin-top:20px"><a class="btn btn--line btn--sm" href="#/publications">' + ic('arrow') + '전체 라인업</a></div>' +
    '</div>';
  }

  /* ── 자가진단 ── */
  function viewDiagnosis() {
    var dg = D.DIAGNOSTIC;
    var answered = diagAnswered();
    var done = answered === dg.questions.length;
    var s = diagScore();
    var lv = diagLevel(s.total);

    var head = '<div class="wrap sec">' +
      crumb([{ t: '홈', route: '#/home' }, { t: '자가진단' }]) +
      '<div class="sec__head"><span class="sec__eyebrow">30초 · 가입 불필요</span>' +
      '<h1 class="sec__title">' + esc(dg.title) + '</h1>' +
      '<p class="sec__sub">' + esc(dg.lead) + '</p></div>';

    var progress =
      '<div class="card" style="margin-bottom:16px">' +
        '<div class="row" style="justify-content:space-between;margin-bottom:8px">' +
        '<b style="font-size:12.5px;color:var(--ink)">진행 ' + answered + ' / ' + dg.questions.length + '</b>' +
        '<span class="badge badge--accent">' + Math.round(answered / dg.questions.length * 100) + '%</span></div>' +
        '<div class="bar"><div class="bar__fill" style="width:' + (answered / dg.questions.length * 100) + '%"></div></div>' +
      '</div>';

    var qs = dg.questions.map(function (q, i) {
      var cur = S.diagAnswers[q.id];
      return '<div class="dg__q reveal">' +
        '<div class="dg__qh"><span class="dg__no">' + pad2(i + 1) + '</span>' +
        '<div><div class="dg__axis">' + esc(q.axisKo) + '</div>' +
        '<div class="dg__qt">' + esc(q.text) + '</div></div></div>' +
        '<div class="dg__opts" role="group" aria-label="' + attr(q.axisKo + ' 문항 답변') + '">' +
          dg.scale.map(function (sc) {
            return '<button type="button" class="dg__opt' + (cur === sc.v ? ' is-on' : '') + '" ' +
              'data-action="diag-answer" data-q="' + attr(q.id) + '" data-v="' + sc.v + '" ' +
              'aria-pressed="' + (cur === sc.v ? 'true' : 'false') + '">' + esc(sc.label) + '</button>';
          }).join('') +
        '</div></div>';
    }).join('');

    var result = '';
    if (done) {
      var weak = diagWeakResearch(s.axes);
      var prog = byId(D.PROGRAMS, lv.program);
      result =
      '<div class="dg__result reveal" id="diag-result" style="margin-top:20px">' +
        '<div class="dg__lv">' + ic('target') + esc(lv.code) + ' · ' + esc(lv.name) + '</div>' +
        '<div class="dg__score">' + s.total + '<small> / ' + (dg.questions.length * 3) + '점</small></div>' +
        '<p style="font-size:var(--fs-h3);color:var(--ink);margin:12px 0 8px;font-weight:700">' + esc(lv.summary) + '</p>' +
        '<p style="font-size:var(--fs-sm);color:var(--ink-2)">' + esc(lv.detail) + '</p>' +

        '<div class="dg__axes">' +
          Object.keys(s.axes).map(function (k) {
            var a = s.axes[k];
            return '<div class="dg__axrow"><b>' + esc(a.ko) + '</b>' +
              '<div class="bar"><div class="bar__fill" style="width:' + (a.v / 3 * 100) + '%"></div></div>' +
              '<span>' + a.v + '/3</span></div>';
          }).join('') +
        '</div>' +

        '<div style="margin-top:20px"><h3 class="doc__h">지금 하면 좋은 것 3가지</h3>' +
          lv.actions.map(function (a) { return '<div class="doc__li">' + esc(a) + '</div>'; }).join('') + '</div>' +

        (prog ? '<div style="margin-top:18px"><h3 class="doc__h">추천 프로그램</h3>' +
          '<a class="card card--link" href="#/programs?p=' + attr(prog.id) + '">' +
          '<span class="card__icon">' + ic(prog.icon) + '</span>' +
          '<h3 class="card__title">' + esc(prog.name) + '</h3>' +
          '<p class="card__desc">' + esc(lv.programNote) + '</p></a></div>' : '') +

        (weak.length ? '<div style="margin-top:18px"><h3 class="doc__h">가장 약한 축과 연결된 연구</h3><div class="stack">' +
          weak.map(function (w) {
            return '<a class="card card--link" href="#/research/' + attr(w.id) + '">' +
              '<span class="card__no">AGENDA ' + esc(w.no) + '</span>' +
              '<h3 class="card__title">' + esc(w.title) + '</h3>' +
              '<p class="card__desc">' + esc(w.desc) + '</p></a>';
          }).join('') + '</div></div>' : '') +

        '<div class="row" style="margin-top:20px">' +
          '<button type="button" class="btn btn--accent btn--sm" data-action="diag-save">' + ic('bookmark') + '결과 저장</button>' +
          '<button type="button" class="btn btn--ghost btn--sm" data-action="diag-print">' + ic('print') + 'PDF로 저장</button>' +
          '<button type="button" class="btn btn--line btn--sm" data-action="diag-share">' + ic('share') + '결과 공유</button>' +
          '<button type="button" class="btn btn--line btn--sm" data-action="diag-reset">' + ic('trash') + '다시 하기</button>' +
        '</div>' +
      '</div>';
    } else {
      result = '<div class="notice notice--accent" style="margin-top:18px">' + ic('info') +
        '<span>남은 문항 <b>' + (dg.questions.length - answered) + '개</b>를 마치면 레벨 판정과 맞춤 추천이 나타납니다.</span></div>';
    }

    var saved = S.diag
      ? '<div class="card" style="margin-top:18px"><div class="row" style="justify-content:space-between">' +
        '<span class="badge badge--accent">저장된 결과 · ' + esc(S.diag.date) + '</span>' +
        '<span class="badge">' + esc(S.diag.level) + ' ' + esc(S.diag.levelName) + ' · ' + esc(S.diag.total) + '점</span></div>' +
        '<p class="card__desc" style="margin-top:9px">내 서재에서 언제든 다시 확인하고 내보낼 수 있습니다.</p>' +
        '<div class="row" style="margin-top:11px"><a class="btn btn--line btn--sm" href="#/my">' + ic('bookmark') + '내 서재 열기</a></div></div>'
      : '';

    return head + progress + qs + result + saved +
      '<div class="notice" style="margin-top:20px">' + ic('lock') + '<span>' + esc(dg.disclaimer) + '</span></div>' +
    '</div>';
  }

  /* ── 내 서재 ── */
  function viewMy() {
    var bm = S.bookmarks.map(function (id) {
      var r = byId(D.RESEARCH, id); if (r) return { t: '연구', title: r.title, route: '#/research/' + r.id, id: id };
      var p = byId(D.PUBLICATIONS, id); if (p) return { t: '출판', title: p.title, route: '#/publications/' + p.id, id: id };
      var l = byId(D.LABS, id); if (l) return { t: '연구랩', title: l.ko, route: '#/labs/' + l.id, id: id };
      return null;
    }).filter(Boolean);

    var totalItems = D.RESEARCH.length + D.LABS.length + D.PUBLICATIONS.length;
    var seen = S.recent.length;
    var pct = Math.min(100, Math.round(seen / totalItems * 100));

    return '<div class="wrap sec">' +
      crumb([{ t: '홈', route: '#/home' }, { t: '내 서재' }]) +
      '<div class="sec__head"><span class="sec__eyebrow">My Library</span>' +
      '<h1 class="sec__title">내 서재</h1>' +
      '<p class="sec__sub">북마크 · 최근 본 콘텐츠 · 관심 분야 · 진단 결과가 이 기기에만 저장됩니다.</p></div>' +

      '<div class="grid grid--4" style="margin-bottom:20px">' +
        '<div class="stat"><div class="stat__v">' + S.bookmarks.length + '</div><div class="stat__k">북마크</div></div>' +
        '<div class="stat"><div class="stat__v">' + S.recent.length + '</div><div class="stat__k">최근 본 콘텐츠</div></div>' +
        '<div class="stat"><div class="stat__v">' + S.interests.length + '</div><div class="stat__k">관심 분야</div></div>' +
        '<div class="stat"><div class="stat__v">' + S.highlights.length + '</div><div class="stat__k">저장한 문장</div></div>' +
      '</div>' +

      '<div class="card" style="margin-bottom:20px">' +
        '<div class="row" style="justify-content:space-between;margin-bottom:8px">' +
        '<b style="font-size:12.5px;color:var(--ink)">콘텐츠 탐색 진행률</b>' +
        '<span class="badge badge--accent">' + pct + '%</span></div>' +
        '<div class="bar"><div class="bar__fill" style="width:' + pct + '%"></div></div>' +
        '<p class="card__desc" style="margin-top:9px">전체 ' + totalItems + '개 콘텐츠 중 ' + seen + '개를 열어보셨습니다.</p>' +
      '</div>' +

      (S.diag
        ? '<div class="doc__block"><h2 class="doc__h">저장된 자가진단 결과</h2>' +
          '<div class="card"><div class="row" style="justify-content:space-between">' +
          '<span class="badge badge--accent">' + esc(S.diag.level) + ' · ' + esc(S.diag.levelName) + '</span>' +
          '<span class="badge">' + esc(S.diag.date) + '</span></div>' +
          '<div class="dg__score" style="margin:12px 0 4px">' + esc(S.diag.total) + '<small> / ' + esc(S.diag.max) + '점</small></div>' +
          '<div class="dg__axes">' + (S.diag.axes || []).map(function (a) {
            return '<div class="dg__axrow"><b>' + esc(a.ko) + '</b>' +
              '<div class="bar"><div class="bar__fill" style="width:' + (a.v / 3 * 100) + '%"></div></div>' +
              '<span>' + esc(a.v) + '/3</span></div>';
          }).join('') + '</div>' +
          '<div class="row" style="margin-top:14px"><a class="btn btn--accent btn--sm" href="#/diagnosis">다시 진단하기</a>' +
          '<button type="button" class="btn btn--line btn--sm" data-action="diag-print">' + ic('print') + 'PDF 저장</button></div></div></div>'
        : '<div class="doc__block"><h2 class="doc__h">자가진단</h2>' +
          '<div class="empty">' + ic('gauge') + '<div class="empty__t">아직 진단 결과가 없습니다</div>' +
          '<div class="empty__d">6문항 · 30초면 조직의 AI 전환 준비도를 확인할 수 있습니다.</div>' +
          '<a class="btn btn--accent btn--sm" href="#/diagnosis">진단 시작하기</a></div></div>') +

      '<div class="doc__block"><div class="row" style="justify-content:space-between">' +
        '<h2 class="doc__h" style="margin:0">북마크 ' + (bm.length ? '(' + bm.length + ')' : '') + '</h2>' +
        (bm.length ? '<button type="button" class="btn btn--line btn--sm" data-action="clear-bookmarks">' + ic('trash') + '전체 삭제</button>' : '') +
      '</div>' +
      (bm.length
        ? '<div class="stack" style="margin-top:12px">' + bm.map(function (b) {
            return '<div class="card"><div class="row" style="justify-content:space-between">' +
              '<span class="badge badge--brand">' + esc(b.t) + '</span>' + bmkBtn(b.id, b.title) + '</div>' +
              '<a class="card__title" href="' + attr(b.route) + '" style="display:block;margin-top:7px">' + esc(b.title) + '</a></div>';
          }).join('') + '</div>'
        : '<div class="empty">' + ic('bookmark') + '<div class="empty__t">저장한 항목이 없습니다</div>' +
          '<div class="empty__d">연구 아젠다·출판물 카드의 북마크 아이콘을 누르면 여기에 모입니다.</div>' +
          '<a class="btn btn--ghost btn--sm" href="#/research">연구 아젠다 보기</a></div>') +
      '</div>' +

      '<div class="doc__block"><div class="row" style="justify-content:space-between">' +
        '<h2 class="doc__h" style="margin:0">최근 본 콘텐츠</h2>' +
        (S.recent.length ? '<button type="button" class="btn btn--line btn--sm" data-action="clear-recent">' + ic('trash') + '기록 지우기</button>' : '') +
      '</div>' +
      (S.recent.length
        ? '<div class="stack" style="margin-top:12px">' + S.recent.map(function (x) {
            return '<a class="card card--link" href="' + attr(x.route) + '">' +
              '<span class="badge">' + esc(x.t) + '</span>' +
              '<div class="card__title" style="margin-top:6px">' + esc(x.title) + '</div></a>';
          }).join('') + '</div>'
        : '<div class="empty" style="padding:22px">' + ic('clock') + '<div class="empty__t">최근 본 콘텐츠가 없습니다</div></div>') +
      '</div>' +

      '<div class="doc__block"><div class="row" style="justify-content:space-between">' +
        '<h2 class="doc__h" style="margin:0">저장한 문장 ' + (S.highlights.length ? '(' + S.highlights.length + ')' : '') + '</h2>' +
        (S.highlights.length ? '<button type="button" class="btn btn--line btn--sm" data-action="hl-clear">' + ic('trash') + '비우기</button>' : '') +
      '</div>' +
      (S.highlights.length
        ? '<div class="stack" style="margin-top:12px">' + S.highlights.map(function (h) {
            return '<blockquote class="rd__q" style="margin:0">' + ic('quote') + '<p>' + esc(h) + '</p></blockquote>';
          }).join('') + '</div>'
        : '<div class="empty" style="padding:22px">' + ic('quote') + '<div class="empty__t">저장한 문장이 없습니다</div>' +
          '<div class="empty__d">도서 미리보기에서 마음에 남는 문장을 저장해 두면 여기에 모입니다.</div>' +
          '<a class="btn btn--ghost btn--sm" href="#/preview">' + ic('pages') + '미리보기 열기</a></div>') +
      '</div>' +

      (BK && S.readPos > 1 ? '<div class="doc__block"><h2 class="doc__h">이어 읽기</h2>' +
        '<div class="card"><div class="row" style="justify-content:space-between">' +
        '<span class="badge badge--accent">『' + esc(BK.BOOK.title) + '』</span>' +
        '<span class="badge">' + S.readPos + ' / ' + BK.BOOK_PREVIEW.length + '쪽</span></div>' +
        '<div class="bar" style="margin:11px 0"><div class="bar__fill" style="width:' +
        Math.round(S.readPos / BK.BOOK_PREVIEW.length * 100) + '%"></div></div>' +
        '<div class="row"><a class="btn btn--accent btn--sm" href="#/preview">' + ic('pages') + '이어서 읽기</a>' +
        '<a class="btn btn--line btn--sm" href="#/book">' + ic('book') + '책 소개</a></div></div></div>' : '') +

      '<div class="doc__block"><h2 class="doc__h">데이터 관리</h2>' +
        '<div class="notice" style="margin-bottom:12px">' + ic('lock') +
        '<span>모든 데이터는 이 브라우저에만 저장되며 서버로 전송되지 않습니다. ' +
        (safeStore.available() ? '' : '<b>현재 브라우저 저장이 제한되어 있어 새로고침 시 초기화됩니다.</b>') +
        ' 브라우저 데이터를 지우기 전에 내보내기를 권장합니다.</span></div>' +
        '<div class="row">' +
          '<button type="button" class="btn btn--ghost btn--sm" data-action="export-data">' + ic('download') + '내 데이터 내보내기</button>' +
          '<button type="button" class="btn btn--line btn--sm" data-action="wipe-data">' + ic('trash') + '전체 초기화</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ── 커뮤니티 ── */
  function viewCommunity(r) {
    var focus = r.query.focus || '';
    var posts = allPosts().slice().reverse();

    return '<div class="wrap sec">' +
      crumb([{ t: '홈', route: '#/home' }, { t: '커뮤니티' }]) +
      '<div class="sec__head"><span class="sec__eyebrow">Community Network</span>' +
      '<h1 class="sec__title">질문과 사례가 모이는 곳</h1>' +
      '<p class="sec__sub">관계가 프로젝트를 만드는 것이 아니라, 프로젝트가 관계를 남깁니다.</p></div>' +

      /* 관심 분야 */
      '<div class="card" id="interests" style="margin-bottom:16px">' +
        '<h2 class="card__title" style="margin-top:0">관심 주제 선택</h2>' +
        '<p class="card__desc" style="margin-bottom:12px">선택해 두시면 관련 포럼·교육·리포트가 개설될 때 안내 대상에 포함됩니다.</p>' +
        '<div class="chips">' +
          D.INTERESTS.map(function (x) {
            var on = S.interests.indexOf(x.id) >= 0;
            return '<button type="button" class="chip' + (on ? ' is-on' : '') + '" data-action="toggle-interest" data-id="' + attr(x.id) + '" ' +
              'aria-pressed="' + (on ? 'true' : 'false') + '">' + (on ? ic('check') : '') + esc(x.ko) + '</button>';
          }).join('') +
        '</div>' +
        (S.interests.length ? '<div class="row" style="margin-top:12px">' +
          '<button type="button" class="btn btn--line btn--sm" data-action="clear-interests">' + ic('trash') + '선택 해제</button></div>' : '') +
      '</div>' +

      /* 구독 */
      '<div class="card" id="subscribe" style="margin-bottom:16px;' + (focus === 'subscribe' ? 'border-color:var(--accent)' : '') + '">' +
        '<span class="card__icon">' + ic('bell') + '</span>' +
        '<h2 class="card__title" style="margin-top:0">브리프·뉴스레터 구독</h2>' +
        '<p class="card__desc" style="margin-bottom:12px">' +
        (S.subscribed
          ? '구독 상태입니다. 창간 시 이 기기에서 안내 배지가 표시됩니다. (이메일 발송은 실제 발행 시작 이후 연결됩니다.)'
          : '월간 AI휴먼전략 브리프와 뉴스레터가 창간되면 가장 먼저 안내드립니다.') + '</p>' +
        '<button type="button" class="btn btn--sm ' + (S.subscribed ? 'btn--ghost' : 'btn--accent') + '" data-action="toggle-subscribe">' +
        ic(S.subscribed ? 'check' : 'bell') + (S.subscribed ? '구독 중 · 해제하기' : '구독 신청하기') + '</button>' +
      '</div>' +

      /* 글쓰기 */
      '<div class="card" id="write" style="margin-bottom:16px;' + (focus === 'write' ? 'border-color:var(--accent)' : '') + '">' +
        '<h2 class="card__title" style="margin-top:0">글 남기기</h2>' +
        '<form id="post-form" novalidate>' +
          '<div class="field"><label class="field__label" for="pf-who">표시할 이름 <span class="req">*</span></label>' +
            '<input class="input" id="pf-who" name="who" type="text" maxlength="24" placeholder="예: 김OO / 제조업 기획팀" autocomplete="nickname">' +
            '<div class="field__err">이름을 입력해 주세요. (1~24자)</div></div>' +
          '<div class="field"><label class="field__label" for="pf-cat">분야</label>' +
            '<select class="select" id="pf-cat" name="cat">' +
            D.CATEGORIES.map(function (c) { return '<option value="' + attr(c.id) + '">' + esc(c.ko) + '</option>'; }).join('') +
            '</select></div>' +
          '<div class="field"><label class="field__label" for="pf-title">제목 <span class="req">*</span></label>' +
            '<input class="input" id="pf-title" name="title" type="text" maxlength="80" placeholder="질문 · 사례 · 프로젝트 제안">' +
            '<div class="field__err">제목을 입력해 주세요. (2~80자)</div></div>' +
          '<div class="field"><label class="field__label" for="pf-body">내용 <span class="req">*</span></label>' +
            '<textarea class="textarea" id="pf-body" name="body" maxlength="1200" placeholder="프로젝트 제안이라면 목적 / 필요한 역할 / 예상 기간 / 기여 가능한 것을 함께 적어 주세요."></textarea>' +
            '<div class="field__err">내용을 10자 이상 입력해 주세요.</div>' +
            '<div class="field__hint">작성한 글은 이 기기에만 저장되며 서버로 전송되지 않습니다.</div></div>' +
          '<button type="submit" class="btn btn--accent btn--block">' + ic('plus') + '글 등록하기</button>' +
        '</form>' +
      '</div>' +

      /* 목록 */
      '<div class="doc__block"><div class="row" style="justify-content:space-between">' +
        '<h2 class="doc__h" style="margin:0">커뮤니티 글 ' + posts.length + '건</h2>' +
        (S.posts.length ? '<button type="button" class="btn btn--line btn--sm" data-action="clear-posts">' + ic('trash') + '내 글 전체 삭제</button>' : '') +
      '</div>' +
      '<div style="margin-top:12px">' + posts.map(postHtml).join('') + '</div></div>' +

      /* 멤버십 */
      '<div class="doc__block" id="membership" style="' + (focus === 'membership' ? 'scroll-margin-top:120px' : '') + '">' +
        '<h2 class="doc__h">멤버십 3단계</h2>' +
        '<div class="grid grid--3">' +
          D.MEMBERSHIP.map(function (m) {
            return '<div class="card plan' + (m.featured ? ' plan--hot' : '') + '">' +
              '<span class="badge badge--brand">' + esc(m.badge) + '</span>' +
              '<h3 class="card__title">' + esc(m.name) + '</h3>' +
              '<p class="card__desc">' + esc(m.desc) + '</p>' +
              '<div class="plan__items">' + m.items.map(function (t) {
                return '<div class="plan__item">' + ic('check') + '<span>' + esc(t) + '</span></div>';
              }).join('') + '</div>' +
              '<div class="plan__cta"><a class="btn btn--sm btn--block ' + (m.featured ? 'btn--accent' : 'btn--ghost') + '" href="' + attr(m.ctaRoute) + '">' +
              esc(m.cta) + '</a></div></div>';
          }).join('') +
        '</div>' +
        '<div class="notice" style="margin-top:12px">' + ic('info') +
        '<span>가격·정원·일정은 확정 후 공개합니다. 현재는 문의 접수와 관심 등록 단계입니다.</span></div>' +
      '</div>' +

      /* 가이드 */
      '<div class="doc__block"><h2 class="doc__h">커뮤니티 가이드</h2>' +
        D.COMMUNITY_GUIDE.map(function (g) { return '<div class="doc__li">' + esc(g) + '</div>'; }).join('') + '</div>' +
    '</div>';
  }

  function postHtml(p) {
    var c = catOf(p.cat);
    var reps = repliesOf(p.id);
    return '<article class="post" id="post-' + attr(p.id) + '">' +
      '<div class="post__head">' +
        (p.official ? '<span class="badge badge--accent badge--dot">운영팀 공지</span>' : '<span class="badge badge--brand">' + ic(c.icon) + esc(c.ko) + '</span>') +
        '<span class="post__who">' + esc(p.author || p.who) + '</span>' +
        (p.date ? '<span class="badge">' + esc(p.date) + '</span>' : '') +
      '</div>' +
      '<h3 class="post__t">' + esc(p.title) + '</h3>' +
      '<p class="post__b">' + esc(p.body) + '</p>' +
      (reps.length ? reps.map(function (rp) {
        return '<div class="post__reply"><b>' + esc(rp.who) + ' · ' + esc(rp.date) + '</b>' + esc(rp.text) + '</div>';
      }).join('') : '') +
      '<div class="post__acts">' +
        '<button type="button" class="btn btn--line btn--sm" data-action="reply" data-id="' + attr(p.id) + '">' + ic('reply') + '답글 ' + (reps.length || '') + '</button>' +
        '<button type="button" class="btn btn--line btn--sm" data-action="share" data-title="' + attr(p.title) + '">' + ic('share') + '공유</button>' +
        (!p.seed ? '<button type="button" class="btn btn--line btn--sm" data-action="del-post" data-id="' + attr(p.id) + '">' + ic('trash') + '삭제</button>' : '') +
      '</div>' +
    '</article>';
  }

  /* ── 연구원 소개 ── */
  function viewAbout(r) {
    var s = r.query.s || '';
    var vt = r.query.t || D.VALUE_TABS[0].id;
    var vtab = byId(D.VALUE_TABS, vt) || D.VALUE_TABS[0];

    return '<div class="wrap sec">' +
      crumb([{ t: '홈', route: '#/home' }, { t: '연구원 소개' }]) +
      '<div class="sec__head"><span class="sec__eyebrow">About KAHUGO</span>' +
      '<h1 class="sec__title">' + esc(I.nameKo) + '</h1>' +
      '<p class="sec__sub">' + esc(I.nameEn) + ' · ' + esc(I.tagline) + '</p></div>' +

      '<div class="card" style="margin-bottom:24px">' +
        '<h2 class="card__title" style="margin-top:0">' + esc(I.identityHeadline) + '</h2>' +
        '<p class="card__desc">' + esc(I.identitySub) + '</p>' +
      '</div>' +

      /* Why Now */
      '<div class="doc__block" id="why"><h2 class="doc__h">왜 지금인가</h2>' +
        '<p style="font-size:var(--fs-h3);color:var(--ink);margin-bottom:10px;font-weight:700">' + esc(I.whyNowHeadline) + '</p>' +
        '<p style="font-size:var(--fs-sm);color:var(--ink-2);margin-bottom:12px">' + esc(I.whyNowBody) + '</p>' +
        I.whyNowPoints.map(function (p) { return '<div class="doc__li">' + esc(p) + '</div>'; }).join('') +
      '</div>' +

      /* 10대 창립선언 */
      '<div class="doc__block" id="declaration"><h2 class="doc__h">10대 창립선언문</h2>' +
        '<p style="font-size:var(--fs-sm);color:var(--sub);margin-bottom:14px">기관의 공식 가치 기준입니다. 카드를 누르면 전문이 열립니다.</p>' +
        '<div class="grid grid--2">' +
          D.DECLARATIONS.map(function (d, i) {
            return '<button type="button" class="card card--link reveal" data-action="declaration" data-i="' + i + '">' +
              '<span class="card__no">선언 ' + pad2(i + 1) + '</span>' +
              '<h3 class="card__title">' + esc(d.title) + '</h3>' +
              '<p class="card__desc">' + esc(d.short) + '</p></button>';
          }).join('') +
        '</div>' +
        '<div class="bridge" style="margin-top:16px">' + esc(D.DECLARATION_CLOSING) + '</div>' +
      '</div>' +

      /* 가치 탭 */
      '<div class="doc__block" id="value"><h2 class="doc__h">핵심 가치와 수익 구조</h2>' +
        '<div class="tabs" style="margin-bottom:14px" role="tablist">' +
          D.VALUE_TABS.map(function (v) {
            return '<button type="button" class="tab' + (v.id === vtab.id ? ' is-on' : '') + '" role="tab" ' +
              'aria-selected="' + (v.id === vtab.id ? 'true' : 'false') + '" data-action="value-tab" data-t="' + attr(v.id) + '">' +
              esc(v.title) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="card"><h3 class="card__title" style="margin-top:0">' + esc(vtab.title) + '</h3>' +
        '<p class="card__desc">' + esc(vtab.text) + '</p></div>' +
      '</div>' +

      /* 로드맵 */
      '<div class="doc__block" id="roadmap"><h2 class="doc__h">성장 로드맵</h2><div class="tl">' +
        D.ROADMAP.map(function (x) {
          return '<div class="tl__item reveal"><div class="tl__term">' + esc(x.term) + '</div>' +
            '<h3 class="tl__name">' + esc(x.name) + '</h3>' +
            x.items.map(function (t) { return '<div class="doc__li">' + esc(t) + '</div>'; }).join('') + '</div>';
        }).join('') + '</div></div>' +

      /* FAQ */
      '<div class="doc__block" id="faq"><h2 class="doc__h">자주 묻는 질문</h2><div class="stack">' +
        D.FAQ.map(function (f, i) {
          return '<div class="card"><h3 class="card__title" style="margin-top:0">Q. ' + esc(f.q) + '</h3>' +
            '<p class="card__desc" style="margin-top:8px">' + esc(f.a) + '</p></div>';
        }).join('') + '</div></div>' +


      (s === 'declaration' && r.query.d ? '<script-noop></script-noop>' : '') +
    '</div>';
  }

  /* ── 협력·파트너십 ── */
  function viewPartnership() {
    var types = [
      { icon: 'flask',     t: '공동연구·파일럿',   d: '연구 아젠다를 함께 정하고 파일럿으로 검증합니다.' },
      { icon: 'cap',       t: '교육·사내연수',     d: '기업 맞춤형 사내교육과 공공기관 위탁교육을 설계합니다.' },
      { icon: 'target',    t: 'AI 전환 컨설팅',    d: '진단 → 직무·프로세스 재설계 → 파일럿 → 성과검증 순으로 진행합니다.' },
      { icon: 'map',       t: '지역혁신 프로젝트', d: '지자체·대학·협회를 하나의 의제로 묶어 과제를 설계합니다.' },
      { icon: 'book',      t: '공동 발행·출판',    d: '리포트·백서·교재를 공동 기획하고 발행합니다.' },
      { icon: 'handshake', t: '기관 파트너십',     d: '중장기 전략협력과 후원 파트너십을 논의합니다.' }
    ];
    return '<div class="wrap sec">' +
      crumb([{ t: '홈', route: '#/home' }, { t: '협력·파트너십' }]) +
      '<div class="sec__head"><span class="sec__eyebrow">Partnership</span>' +
      '<h1 class="sec__title">함께 만들 수 있는 여섯 가지</h1>' +
      '<p class="sec__sub">기업 · 협회 · 대학 · 공공기관 · 지자체 · 창업가 모두 열려 있습니다.</p></div>' +
      '<div class="grid grid--3" style="margin-bottom:24px">' +
        types.map(function (x) {
          return '<div class="card reveal"><span class="card__icon">' + ic(x.icon) + '</span>' +
            '<h3 class="card__title">' + esc(x.t) + '</h3>' +
            '<p class="card__desc">' + esc(x.d) + '</p></div>';
        }).join('') +
      '</div>' +
      '<div class="doc__block"><h2 class="doc__h">진행 방식</h2><div class="tl">' +
        [
          { s: '01', n: '제안 접수', d: '협력·문의 폼으로 목적과 범위를 알려 주십시오.' },
          { s: '02', n: '사전 미팅', d: '현재 상황과 기대 성과를 확인하고 범위를 좁힙니다.' },
          { s: '03', n: '설계·견적', d: '기간·산출물·역할 분담을 문서로 정리해 드립니다.' },
          { s: '04', n: '실행·검증', d: '파일럿으로 시작해 성과 기준을 먼저 합의합니다.' },
          { s: '05', n: '리포트·확장', d: '결과를 리포트로 남기고 다음 단계를 함께 결정합니다.' }
        ].map(function (x) {
          return '<div class="tl__item reveal"><div class="tl__term">STEP ' + x.s + '</div>' +
            '<h3 class="tl__name">' + esc(x.n) + '</h3>' +
            '<p style="font-size:var(--fs-sm);color:var(--sub)">' + esc(x.d) + '</p></div>';
        }).join('') + '</div></div>' +
      '<div class="card" style="text-align:center;border-color:var(--accent)">' +
        '<h3 class="card__title">제안을 기다립니다</h3>' +
        '<p class="card__desc" style="margin-bottom:14px">' + esc(I.closingSub) + '</p>' +
        '<a class="btn btn--accent" href="#/contact">' + ic('mail') + '협력 제안 작성하기</a>' +
      '</div>' +
    '</div>';
  }

  /* ── 협력·문의 ── */
  function viewContact(r) {
    var topic = r.query.topic || '';
    var topics = [
      { v: 'research',   t: '공동연구·파일럿' },
      { v: 'education',  t: '교육·강의 의뢰' },
      { v: 'consulting', t: 'AI 전환 컨설팅' },
      { v: 'forum',      t: '포럼·세미나 참여' },
      { v: 'membership', t: '멤버십 문의' },
      { v: 'community',  t: '커뮤니티 참여' },
      { v: 'policy',     t: '정책·공공과제' },
      { v: 'invest',     t: '투자·파트너십' },
      { v: 'etc',        t: '기타 문의' }
    ];
    return '<div class="wrap sec">' +
      crumb([{ t: '홈', route: '#/home' }, { t: '협력·문의' }]) +
      '<div class="sec__head"><span class="sec__eyebrow">Contact</span>' +
      '<h1 class="sec__title">협력 제안 보내기</h1>' +
      '<p class="sec__sub">작성하시면 요약본이 만들어지고, 메일 앱으로 바로 보내실 수 있습니다.</p></div>' +

      '<div class="grid grid--2">' +
        '<div class="card">' +
          '<form id="contact-form" novalidate>' +
            '<div class="field"><label class="field__label" for="cf-name">성함 / 소속 <span class="req">*</span></label>' +
              '<input class="input" id="cf-name" name="name" type="text" maxlength="60" placeholder="예: 김OO / OO대학교 산학협력단" autocomplete="name">' +
              '<div class="field__err">성함과 소속을 입력해 주세요.</div></div>' +
            '<div class="field"><label class="field__label" for="cf-email">회신 이메일 <span class="req">*</span></label>' +
              '<input class="input" id="cf-email" name="email" type="email" maxlength="80" placeholder="name@company.com" autocomplete="email" inputmode="email">' +
              '<div class="field__err">올바른 이메일 형식으로 입력해 주세요.</div></div>' +
            '<div class="field"><label class="field__label" for="cf-topic">제안 유형 <span class="req">*</span></label>' +
              '<select class="select" id="cf-topic" name="topic">' +
              '<option value="">선택해 주세요</option>' +
              topics.map(function (t) {
                return '<option value="' + attr(t.v) + '"' + (t.v === topic ? ' selected' : '') + '>' + esc(t.t) + '</option>';
              }).join('') + '</select>' +
              '<div class="field__err">제안 유형을 선택해 주세요.</div></div>' +
            '<div class="field"><label class="field__label" for="cf-msg">제안 내용 <span class="req">*</span></label>' +
              '<textarea class="textarea" id="cf-msg" name="msg" maxlength="2000" placeholder="목적 / 대상 / 희망 시기 / 예상 규모를 함께 적어 주시면 회신이 빨라집니다."></textarea>' +
              '<div class="field__err">제안 내용을 20자 이상 입력해 주세요.</div></div>' +
            '<button type="submit" class="btn btn--accent btn--block">' + ic('mail') + '요약본 만들기</button>' +
            '<div class="field__hint" style="margin-top:9px">입력값은 전송 전까지 이 기기를 벗어나지 않습니다. 자동 전송 서버를 두지 않는 것이 저희 원칙입니다.</div>' +
          '</form>' +
        '</div>' +

        '<div class="card">' +
          '<span class="card__icon">' + ic('mail') + '</span>' +
          '<h2 class="card__title" style="margin-top:0">직접 연락하기</h2>' +
          '<p class="card__desc" style="margin-bottom:12px">폼 작성이 번거로우시면 아래 주소로 바로 보내주셔도 됩니다.</p>' +
          '<div class="tbl__wrap"><table class="tbl"><tbody>' +
            '<tr><th style="width:96px">기관명</th><td>' + esc(I.nameKo) + '</td></tr>' +
            '<tr><th>영문명</th><td>' + esc(I.nameEn) + '</td></tr>' +
            '<tr><th>이메일</th><td><a href="mailto:' + attr(I.email) + '">' + esc(I.email) + '</a></td></tr>' +
            '<tr><th>영역</th><td style="font-size:11.5px;color:var(--faint)">' + esc(I.focusLine) + '</td></tr>' +
          '</tbody></table></div>' +
          '<div class="row" style="margin-top:14px">' +
            '<button type="button" class="btn btn--ghost btn--sm" data-action="copy-email">' + ic('mail') + '이메일 주소 복사</button>' +
            '<a class="btn btn--line btn--sm" href="#/partnership">' + ic('handshake') + '협력 유형 보기</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }


  /* ══════════ §11-B. 도서 서브퍼널 — 『제5의 물결과 AI 신문명시대』 ══ */

  function bookCover() {
    if (!BK) return '';
    var c = BK.BOOK.covers;
    return S.theme === 'light' ? c.light : c.dark;
  }

  /* 플랫폼 각 페이지에 삽입되는 책 연결 콜아웃 */
  function bookCallout(link, label) {
    if (!BK || !link) return '';
    return '<aside class="bkcall reveal">' +
      '<img class="bkcall__cv" src="' + attr(BK.BOOK.covers.thumb) + '" alt="' + attr(BK.BOOK.title) + ' 표지" width="64" height="92" loading="lazy">' +
      '<div class="bkcall__in">' +
        '<div class="bkcall__eye">' + ic('quote') + '『' + esc(BK.BOOK.title) + '』 ' + esc(link.ch) + '</div>' +
        '<p class="bkcall__q">' + esc(link.q) + '</p>' +
        '<p class="bkcall__t">' + esc(link.t) + '</p>' +
        '<div class="row" style="margin-top:10px">' +
          '<a class="btn btn--accent btn--sm" href="#/preview">' + ic('pages') + '미리보기 읽기</a>' +
          '<a class="btn btn--line btn--sm" href="#/book">' + ic('book') + '책 소개</a>' +
        '</div>' +
      '</div></aside>';
  }

  /* ── 책 소개 (메인 퍼널) ── */
  function viewBook(r) {
    if (!BK) return viewNotFound('book');
    var B = BK.BOOK;
    var focus = r.query.s || '';
    var bd = S.bookDiag || {};
    var bdCount = Object.keys(bd).filter(function (k) { return bd[k]; }).length;
    var bdDone = Object.keys(bd).length > 0;

    var bdType = null;
    if (bdCount >= 8) bdType = { n: 'AI 지휘자형', c: '8~10점', d: '이미 도구를 쓰는 단계를 넘어 판단의 주도권을 고민하고 있습니다.', ch: '10장 · 13장 · 14장 · 31장', res: 'r01' };
    else if (bdCount >= 4) bdType = { n: 'AI 전환기형', c: '4~7점', d: '불안과 가능성이 함께 있는 자리입니다.', ch: '1장 · 4장 · 5장 · 6장', res: 'r10' };
    else bdType = { n: 'AI 경고등형', c: '0~3점', d: '늦었다는 뜻이 아니라, 가장 빨리 바뀔 수 있는 출발점에 섰다는 뜻입니다.', ch: '프롤로그 · 1장 · 2장 · 4장', res: 'r02' };

    return '' +
    /* ── 히어로 ── */
    '<section class="bkhero"><div class="wrap"><div class="bkhero__grid">' +
      '<div class="bkhero__cv">' +
        '<button type="button" class="bkcover" data-action="cover-view" data-src="' + attr(bookCover()) + '" aria-label="표지 크게 보기">' +
          '<img src="' + attr(bookCover()) + '" alt="' + attr(B.title + ' 표지') + '" width="380" height="544">' +
          '<span class="bkcover__zoom">' + ic('search') + '</span>' +
        '</button>' +
      '</div>' +
      '<div class="bkhero__tx">' +
        '<span class="badge badge--gold badge--dot">' + esc(B.badge) + '</span> ' +
        '<span class="badge">' + esc(B.series) + '</span>' +
        '<h1 class="bkhero__h">' + esc(B.title) + '</h1>' +
        '<p class="bkhero__sub">' + esc(B.subtitle) + '</p>' +
        '<p class="bkhero__deck">' + esc(B.deck) + '</p>' +
        '<div class="bkhook">' + B.hook.split('\n').map(function (l) { return '<span>' + esc(l) + '</span>'; }).join('') + '</div>' +
        '<div class="bkbadges">' +
          B.badges.map(function (x) {
            return '<div class="bkbadge"><span class="bkbadge__st">★★★★★</span>' +
              '<b>' + esc(x.t) + '</b><span>' + esc(x.s) + '</span></div>';
          }).join('') +
        '</div>' +
        '<div class="row" style="margin-top:18px">' +
          '<a class="btn btn--accent" href="#/preview">' + ic('pages') + BK.PREVIEW_PAGES + '쪽 미리보기 시작</a>' +
          '<button type="button" class="btn btn--ghost" data-action="book-tab" data-s="toc">' + ic('list') + '전체 목차</button>' +
        '</div>' +
        '<p class="bkhero__by">' + esc(B.author) + ' 지음</p>' +
      '</div>' +
    '</div></div></section>' +

    /* ── 뒤표지 카피 ── */
    '<section class="sec sec--alt"><div class="wrap">' +
      '<div class="bkquote">' + ic('quote') +
      '<p>파도를 검색하는 사람은 늦고, 파도를 읽는 사람은 빠르며,<br>파도를 지휘하는 사람은 새 문명의 첫 문장을 쓴다.</p></div>' +
      '<div class="doc" style="margin:22px auto 0">' +
        B.back.map(function (p) { return '<p class="bkback">' + esc(p) + '</p>'; }).join('') +
      '</div>' +
      '<div class="grid grid--2" style="margin-top:26px">' +
        '<div class="card"><span class="card__icon">' + ic('layers') + '</span>' +
          '<h2 class="card__title" style="margin-top:0">이 책에 실린 것</h2>' +
          B.contains.map(function (t) { return '<div class="doc__li">' + esc(t) + '</div>'; }).join('') + '</div>' +
        '<div class="card"><span class="card__icon">' + ic('users') + '</span>' +
          '<h2 class="card__title" style="margin-top:0">이런 분께</h2>' +
          B.forWhom.map(function (w) {
            return '<div class="doc__li"><span><b style="color:var(--ink)">' + esc(w.t) + '</b> — ' + esc(w.d) + '</span></div>';
          }).join('') + '</div>' +
      '</div>' +
    '</div></section>' +

    /* ── 1분 생존 진단 (책 수록 원문) ── */
    '<section class="sec" id="bk-diag"><div class="wrap">' +
      '<div class="sec__head"><span class="sec__eyebrow">책 속 진단 · 1분</span>' +
      '<h2 class="sec__title">당신은 파도의 어디쯤 서 있는가</h2>' +
      '<p class="sec__sub">책 13쪽에 실린 「AI 시대 개인 생존력 자가 진단표」입니다. 해당하는 문항을 눌러 보세요.</p></div>' +
      '<div class="bkdiag">' +
        BK.BOOK_DIAG.map(function (q, i) {
          var on = !!bd[i];
          return '<button type="button" class="bkdiag__q' + (on ? ' is-on' : '') + '" data-action="bd-answer" data-i="' + i + '" aria-pressed="' + (on ? 'true' : 'false') + '">' +
            '<span class="bkdiag__no">' + pad2(i + 1) + '</span>' +
            '<span class="bkdiag__t">' + esc(q.q) + '</span>' +
            '<span class="bkdiag__ck">' + ic(on ? 'check' : 'plus') + '</span></button>';
        }).join('') +
      '</div>' +
      (bdDone
        ? '<div class="dg__result" style="margin-top:18px">' +
            '<div class="dg__lv">' + ic('target') + esc(bdType.c) + ' · ' + esc(bdType.n) + '</div>' +
            '<div class="dg__score">' + bdCount + '<small> / 10점</small></div>' +
            '<p style="font-size:var(--fs-sm);color:var(--ink-2);margin:10px 0 14px">' + esc(bdType.d) + '</p>' +
            '<div class="notice notice--accent">' + ic('book') + '<span>책에서 먼저 읽으면 좋은 장 — <b>' + esc(bdType.ch) + '</b></span></div>' +
            '<div class="row" style="margin-top:14px">' +
              '<a class="btn btn--accent btn--sm" href="#/preview">' + ic('pages') + '미리보기에서 확인</a>' +
              '<a class="btn btn--ghost btn--sm" href="#/research/' + attr(bdType.res) + '">' + ic('compass') + '연결된 연구 보기</a>' +
              '<button type="button" class="btn btn--line btn--sm" data-action="bd-reset">' + ic('trash') + '다시 하기</button>' +
            '</div>' +
            '<p style="font-size:var(--fs-cap);color:var(--faint);margin-top:12px">※ 점수는 거들 뿐입니다. 어느 문항 앞에서 손이 멈췄는지, 그것만 확인하면 됩니다. — 본문 중에서</p>' +
          '</div>'
        : '<div class="notice" style="margin-top:14px">' + ic('info') + '<span>문항을 하나라도 누르면 유형 판정과 추천 장이 나타납니다.</span></div>') +
    '</div></section>' +

    /* ── 다섯 가지 독서 경로 ── */
    '<section class="sec sec--alt" id="bk-paths"><div class="wrap">' +
      '<div class="sec__head"><span class="sec__eyebrow">Reading Paths</span>' +
      '<h2 class="sec__title">다섯 가지 독서 경로</h2>' +
      '<p class="sec__sub">처음부터 끝까지 읽어도 좋지만, 지금 가장 급한 질문에서 시작해도 됩니다.</p></div>' +
      '<div class="grid grid--3">' +
        BK.BOOK_PATHS.map(function (p) {
          var rr = byId(D.RESEARCH, p.res);
          return '<div class="card bkpath reveal"><span class="card__icon">' + ic(p.icon) + '</span>' +
            '<h3 class="card__title">' + esc(p.who) + '</h3>' +
            '<p class="bkpath__q">' + esc(p.q) + '</p>' +
            '<div class="bkpath__route">' + esc(p.route) + '</div>' +
            '<p class="card__desc">' + esc(p.why) + '</p>' +
            (rr ? '<div class="card__foot"><a class="btn btn--line btn--sm btn--block" href="#/research/' + attr(rr.id) + '">' +
              ic('compass') + '연구 아젠다 · ' + esc(rr.title) + '</a></div>' : '') + '</div>';
        }).join('') +
      '</div>' +
    '</div></section>' +

    /* ── 신문명 키워드 ── */
    '<section class="sec" id="bk-keywords"><div class="wrap">' +
      '<div class="sec__head"><span class="sec__eyebrow">New Civilization Keywords</span>' +
      '<h2 class="sec__title">먼저 이름을 아는 쪽이 먼저 값을 매긴다</h2>' +
      '<p class="sec__sub">책에는 쉰 개의 낱말이 실려 있습니다. 그중 여덟 개를 먼저 꺼내 둡니다.</p></div>' +
      '<div class="grid grid--4">' +
        BK.BOOK_KEYWORDS.map(function (k, i) {
          return '<button type="button" class="card card--link bkkw reveal" data-action="kw" data-i="' + i + '">' +
            '<span class="bkkw__en">' + esc(k.en) + '</span>' +
            '<h3 class="card__title">' + esc(k.k) + '</h3>' +
            '<p class="card__desc">' + esc(k.d.slice(0, 52)) + '…</p>' +
            '<span class="bkkw__more">자세히' + ic('chev') + '</span></button>';
        }).join('') +
      '</div>' +
    '</div></section>' +

    /* ── 7부 구조 ── */
    '<section class="sec sec--alt" id="bk-parts"><div class="wrap">' +
      '<div class="sec__head"><span class="sec__eyebrow">Structure</span>' +
      '<h2 class="sec__title">일곱 개의 파도, 서른일곱 개의 물마루</h2></div>' +
      '<div class="tbl__wrap"><div class="scroll-x"><table class="tbl">' +
      '<thead><tr><th style="width:150px">부</th><th>테마</th><th>독자가 얻는 것</th></tr></thead><tbody>' +
      BK.BOOK_PARTS.map(function (p) {
        return '<tr><td><b style="color:var(--accent)">' + esc(p.part) + '</b></td>' +
          '<td><b style="color:var(--ink)">' + esc(p.theme) + '</b></td><td>' + esc(p.gain) + '</td></tr>';
      }).join('') + '</tbody></table></div></div>' +
    '</div></section>' +

    /* ── 전체 목차 ── */
    '<section class="sec" id="bk-toc"><div class="wrap">' +
      '<div class="sec__head"><span class="sec__eyebrow">Contents</span>' +
      '<h2 class="sec__title">전체 목차</h2>' +
      '<p class="sec__sub">목차를 훑다가 심장이 한 번 뛰는 곳에서 멈추면 됩니다. 거기가 당신의 파도입니다.</p></div>' +
      '<div class="bktoc">' +
        BK.BOOK_TOC.map(function (t) {
          return '<div class="bktoc__r bktoc__r--' + esc(t.lv) + '">' +
            '<span class="bktoc__t">' + esc(t.t) + '</span>' +
            (t.p ? '<span class="bktoc__p">' + t.p + '</span>' : '') + '</div>';
        }).join('') +
      '</div>' +
      '<div class="row" style="margin-top:16px"><a class="btn btn--accent btn--sm" href="#/preview">' +
      ic('pages') + '앞부분 ' + BK.PREVIEW_PAGES + '쪽 바로 읽기</a></div>' +
    '</div></section>' +

    /* ── 사업 기회 30 ── */
    '<section class="sec sec--alt" id="bk-opps"><div class="wrap">' +
      '<div class="sec__head"><span class="sec__eyebrow">부록 A</span>' +
      '<h2 class="sec__title">분야별 AI 신문명 사업 기회 30</h2>' +
      '<p class="sec__sub">각 항목에 초기 비용 · 필요 도구 · 첫 고객 세 줄이 붙어 있습니다. 목록과 사업의 경계선입니다.</p></div>' +
      '<div class="notice" style="margin-bottom:14px">' + ic('info') +
      '<span>비용은 2026년 상반기 한국 시장 기준의 현실적인 범위입니다. 숫자를 외우지 말고 자릿수를 기억하십시오. ' +
      '<b>※ 저자 추정치이며 환율·요금제 변동에 따라 달라집니다.</b></span></div>' +
      '<div class="bkopps">' +
        BK.BOOK_OPPS.map(function (o) {
          return '<button type="button" class="bkopp" data-action="opp" data-n="' + o.no + '">' +
            '<span class="bkopp__no">' + pad2(o.no) + '</span>' +
            '<span class="bkopp__b"><b>' + esc(o.name) + '</b><span>' + esc(o.lead) + '</span></span>' +
            '<span class="bkopp__c">' + ic('chev') + '</span></button>';
        }).join('') +
      '</div>' +
      '<div class="bridge" style="margin-top:18px">이 서른 개를 실제 프로젝트로 옮기는 곳이 <a href="#/labs">AI휴먼전략랩</a>입니다.</div>' +
    '</div></section>' +

    /* ── 6주 워크북 ── */
    '<section class="sec" id="bk-workbook"><div class="wrap">' +
      '<div class="sec__head"><span class="sec__eyebrow">부록 B</span>' +
      '<h2 class="sec__title">6주 실행 워크북</h2>' +
      '<p class="sec__sub">읽고 끝나지 않게 만드는 장치입니다. 한 장을 읽고, 한 문장을 적고, 한 가지를 실험하십시오.</p></div>' +
      '<div class="tl">' +
        BK.BOOK_WORKBOOK.map(function (w) {
          return '<div class="tl__item reveal"><div class="tl__term">' + esc(w.wk) + '</div>' +
            '<h3 class="tl__name">' + esc(w.name) + '</h3>' +
            '<p style="font-size:var(--fs-sm);color:var(--sub)">' + esc(w.task) + '</p></div>';
        }).join('') +
      '</div>' +
    '</div></section>' +

    /* ── 저자 ── */
    '<section class="sec sec--alt" id="bk-author"><div class="wrap">' +
      '<div class="sec__head"><span class="sec__eyebrow">지은이</span>' +
      '<h2 class="sec__title">' + esc(B.author) + '</h2>' +
      '<p class="sec__sub">' + esc(B.authorRole) + '</p></div>' +
      '<div class="doc">' +
        B.authorBio.map(function (p) { return '<p class="bkback">' + esc(p) + '</p>'; }).join('') +
      '</div>' +
      '<div class="bkquote" style="margin-top:20px">' + ic('quote') + '<p>' + esc(B.authorQuote) + '</p></div>' +
      '<div class="notice notice--accent" style="margin-top:18px">' + ic('info') +
      '<span>저자는 <b>한국AI휴먼전략연구원(KAHUGO)</b> 원장입니다. 이 책의 문제의식이 곧 연구원 12대 아젠다의 출발점입니다. ' +
      '<a href="#/research">연구 허브 보기 →</a></span></div>' +
    '</div></section>' +

    /* ── 표지 갤러리 · 도서 정보 ── */
    '<section class="sec" id="bk-info"><div class="wrap">' +
      '<div class="sec__head"><span class="sec__eyebrow">표지·서지</span>' +
      '<h2 class="sec__title">표지 패키지</h2></div>' +
      '<div class="bkgal">' +
        [{ s: B.covers.dark, t: '앞표지 · 네이비 에디션' },
         { s: B.covers.light, t: '앞표지 · 아이보리 에디션' },
         { s: B.covers.back, t: '뒤표지' },
         { s: B.covers.spread, t: '전개도 (날개 포함)', wide: true }].map(function (g) {
          return '<button type="button" class="bkgal__i' + (g.wide ? ' bkgal__i--wide' : '') + '" data-action="cover-view" data-src="' + attr(g.s) + '" aria-label="' + attr(g.t) + ' 크게 보기">' +
            '<img src="' + attr(g.s) + '" alt="' + attr(g.t) + '" loading="lazy">' +
            '<span>' + esc(g.t) + '</span></button>';
        }).join('') +
      '</div>' +
      '<div class="tbl__wrap" style="margin-top:20px"><table class="tbl"><tbody>' +
        '<tr><th style="width:104px">제목</th><td>' + esc(B.title) + '</td></tr>' +
        '<tr><th>부제</th><td>' + esc(B.subtitle) + '</td></tr>' +
        '<tr><th>지은이</th><td>' + esc(B.author) + '</td></tr>' +
        '<tr><th>펴낸곳</th><td>' + esc(B.publisher) + '</td></tr>' +
        '<tr><th>분류</th><td>' + esc(B.category) + '</td></tr>' +
        '<tr><th>구성</th><td>' + esc(B.spec) + '</td></tr>' +
        '<tr><th>ISBN</th><td style="font-family:var(--font-num);font-size:12px">' + esc(B.isbn) + '</td></tr>' +
      '</tbody></table></div>' +
      '<div class="grid grid--3" style="margin-top:20px">' +
        B.pubNote.map(function (n) {
          return '<div class="card"><h3 class="card__title" style="margin-top:0">' + esc(n.t) + '</h3>' +
            '<p class="card__desc">' + esc(n.d) + '</p></div>';
        }).join('') +
      '</div>' +
      '<div class="notice" style="margin-top:16px">' + ic('lock') + '<span>' + esc(B.copyright) + '</span></div>' +
    '</div></section>' +

    /* ── 클로징 CTA ── */
    '<section class="sec sec--alt"><div class="wrap" style="text-align:center">' +
      '<div class="bkhook" style="justify-content:center;margin-bottom:16px">' +
      '<span>' + esc(B.strap) + '</span></div>' +
      '<p class="sec__sub" style="margin:0 auto 20px">' + esc(B.strapSub) + '</p>' +
      '<div class="row" style="justify-content:center">' +
        '<a class="btn btn--accent" href="#/preview">' + ic('pages') + '미리보기 ' + BK.PREVIEW_PAGES + '쪽 읽기</a>' +
        '<a class="btn btn--ghost" href="#/contact?topic=book">' + ic('mail') + '구매·강연 문의</a>' +
        '<button type="button" class="btn btn--line" data-action="share" data-title="' + attr(B.title + ' — ' + B.subtitle) + '">' + ic('share') + '공유</button>' +
      '</div>' +
    '</div></section>';
  }

  /* ── 미리보기 리더 ── */
  function viewPreview(r) {
    if (!BK) return viewNotFound('preview');
    var total = BK.BOOK_PREVIEW.length;
    var p = parseInt(r.query.p, 10);
    if (!p || isNaN(p)) p = Math.min(Math.max(S.readPos || 1, 1), total);
    p = Math.min(Math.max(p, 1), total);
    S.readPos = p; persist();

    var pg = BK.BOOK_PREVIEW[p - 1];
    var pct = Math.round(p / total * 100);

    var body = pg.blocks.map(function (b) {
      if (b.k === 'h') return '<h3 class="rd__h">' + esc(b.t) + '</h3>';
      if (b.k === 'note') return '<div class="rd__note">' + esc(b.t) + '</div>';
      if (b.k === 'quote') return '<blockquote class="rd__q">' + ic('quote') +
        '<p>' + esc(b.t.replace(/^[「“]|[」”]$/g, '')) + '</p>' +
        '<button type="button" class="rd__hl" data-action="pv-hl" data-t="' + attr(b.t.replace(/^[「“]|[」”]$/g, '')) + '" aria-label="문장 저장">' +
        ic('highlight') + '저장</button></blockquote>';
      if (b.k === 'diagtable') {
        return '<div class="tbl__wrap" style="margin:14px 0"><div class="scroll-x"><table class="tbl">' +
          '<thead><tr><th style="width:44px">번호</th><th>진단 문항</th></tr></thead><tbody>' +
          BK.BOOK_DIAG.map(function (q) { return '<tr><td>' + esc(q.no) + '</td><td>' + esc(q.q) + '</td></tr>'; }).join('') +
          '</tbody></table></div><div style="padding:10px 12px;border-top:1px solid var(--line)">' +
          '<a class="btn btn--accent btn--sm" href="#/book?s=diag">' + ic('gauge') + '이 진단 바로 해보기</a></div></div>';
      }
      return '<p class="rd__p">' + esc(b.t) + '</p>';
    }).join('');

    var isLast = p === total;

    return '<div class="rd rd--f' + S.readFont + '">' +
      /* 리더 바 */
      '<div class="rd__bar"><div class="wrap rd__barin">' +
        '<a class="rd__back" href="#/book" aria-label="책 소개로 돌아가기">' + ic('prev') + '<span>책 소개</span></a>' +
        '<div class="rd__meta"><b>' + esc(pg.part) + '</b><span>' + esc(pg.title) + '</span></div>' +
        '<div class="rd__tools">' +
          '<button type="button" class="iconbtn" data-action="pv-font" data-d="-1" aria-label="글자 작게">' + ic('aa') + '<span class="iconbtn__label">작게</span></button>' +
          '<button type="button" class="iconbtn" data-action="pv-font" data-d="1" aria-label="글자 크게">' + ic('aa') + '<span class="iconbtn__label">크게</span></button>' +
          '<button type="button" class="iconbtn" data-action="pv-jump" aria-label="목차로 이동">' + ic('list') + '<span class="iconbtn__label">목차</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="rd__prog"><div class="rd__progfill" style="width:' + pct + '%"></div></div>' +
      '</div>' +

      '<div class="wrap rd__page">' +
        '<div class="rd__pno">' + p + ' / ' + total + '쪽 · ' + pct + '%</div>' +
        (pg.blocks[0] && pg.blocks[0].k === 'h' ? '' : (p === 1 || BK.BOOK_PREVIEW[p - 2].sid !== pg.sid
          ? '<h2 class="rd__title">' + esc(pg.title) + '</h2>' : '')) +
        body +

        (isLast
          ? '<div class="dg__result" style="margin-top:28px">' +
              '<div class="dg__lv">' + ic('check') + '미리보기 끝 · ' + total + '쪽 완독</div>' +
              '<h3 style="font-size:var(--fs-h2);margin:8px 0 10px">여기까지가 제1부입니다</h3>' +
              '<p style="font-size:var(--fs-sm);color:var(--ink-2)">' + esc(BK.BOOK.previewNote) + '</p>' +
              '<div class="row" style="margin-top:16px">' +
                '<a class="btn btn--accent btn--sm" href="#/contact?topic=book">' + ic('mail') + '구매·강연 문의</a>' +
                '<a class="btn btn--ghost btn--sm" href="#/book?s=toc">' + ic('list') + '전체 목차 보기</a>' +
                '<a class="btn btn--line btn--sm" href="#/research">' + ic('compass') + '연구 아젠다로</a>' +
                '<button type="button" class="btn btn--line btn--sm" data-action="pv-go" data-p="1">' + ic('prev') + '처음부터 다시</button>' +
              '</div>' +
            '</div>'
          : '') +

        (S.highlights.length ? '<div class="card" style="margin-top:22px">' +
          '<div class="row" style="justify-content:space-between"><h3 class="card__title" style="margin:0">저장한 문장 ' + S.highlights.length + '</h3>' +
          '<button type="button" class="btn btn--line btn--sm" data-action="hl-clear">' + ic('trash') + '비우기</button></div>' +
          '<div style="margin-top:10px">' + S.highlights.slice(-3).map(function (h) {
            return '<p class="rd__hlsaved">' + esc(h) + '</p>';
          }).join('') + '</div></div>' : '') +
      '</div>' +

      /* 페이지 네비 */
      '<div class="rd__nav"><div class="wrap rd__navin">' +
        '<button type="button" class="btn btn--ghost btn--sm" data-action="pv-go" data-p="' + (p - 1) + '"' + (p <= 1 ? ' disabled' : '') + '>' +
        ic('prev') + '이전</button>' +
        '<button type="button" class="btn btn--line btn--sm" data-action="pv-jump">' + p + ' / ' + total + '</button>' +
        '<button type="button" class="btn btn--accent btn--sm" data-action="pv-go" data-p="' + (p + 1) + '"' + (isLast ? ' disabled' : '') + '>' +
        '다음' + ic('arrow') + '</button>' +
      '</div></div>' +
    '</div>';
  }

  /* ── 404 ── */
  function viewNotFound(what) {
    return '<div class="wrap sec"><div class="empty" style="padding:60px 20px">' + ic('alert') +
      '<h1 class="empty__t">페이지를 찾을 수 없습니다</h1>' +
      '<p class="empty__d">요청하신 경로 <code style="color:var(--gold)">' + esc(what || '') + '</code> 는 이 플랫폼에 존재하지 않습니다. ' +
      '아래 메뉴에서 원하시는 곳으로 이동하실 수 있습니다.</p>' +
      '<div class="row" style="justify-content:center">' +
        '<a class="btn btn--accent btn--sm" href="#/home">' + ic('home') + '홈으로</a>' +
        '<a class="btn btn--ghost btn--sm" href="#/research">' + ic('compass') + '연구 허브</a>' +
        '<button type="button" class="btn btn--line btn--sm" data-action="open-search">' + ic('search') + '검색으로 찾기</button>' +
      '</div></div></div>';
  }

  /* ══════════ §12. 액션 핸들러 (단일 위임) ═══════════════ */
  var ACTIONS = {

    'open-search': function () { openPanel('panel-search'); setTimeout(function () { var i = $('#search-input'); if (i) i.focus(); }, 90); searchRun($('#search-input') ? $('#search-input').value : ''); },
    'open-chat':   function () { chatBoot(); openPanel('panel-chat'); },
    'close-panels': function () { closePanel(); },
    'close-modal': function () { closeModal(); },
    'toggle-theme': function () {
      applyTheme(S.theme === 'dark' ? 'light' : 'dark');
      toast(S.theme === 'dark' ? '어두운 화면으로 전환했습니다' : '밝은 화면으로 전환했습니다');
      if (BK && (S.route.name === 'book' || S.route.name === 'home')) render();
    },

    'goto': function (el) { var r = el.getAttribute('data-route'); if (r) go(r); },

    'search-fill': function (el) {
      var q = el.getAttribute('data-q') || '';
      var i = $('#search-input'); if (i) { i.value = q; i.focus(); }
      searchRun(q);
    },
    'search-to-chat': function (el) {
      var q = el.getAttribute('data-q') || '';
      closePanel('panel-search');
      setTimeout(function () { chatBoot(); openPanel('panel-chat'); chatPush('me', esc(q)); setTimeout(function () { chatAnswer(q); }, 260); }, 240);
    },
    'chat-chip': function (el) {
      var it = byId(D.CHAT_INTENTS, el.getAttribute('data-id'));
      if (!it) return;
      chatPush('me', esc(it.chip));
      setTimeout(function () { chatPush('bot', esc(it.answer), it.ctas); }, 220);
    },
    'chat-goto': function (el) { closePanel('panel-chat'); },

    'bookmark': function (el) {
      var id = el.getAttribute('data-id'); if (!id) return;
      var i = S.bookmarks.indexOf(id);
      if (i >= 0) { S.bookmarks.splice(i, 1); toast('북마크를 해제했습니다'); }
      else { S.bookmarks.push(id); toast('내 서재에 저장했습니다'); }
      persist();
      $$('[data-action="bookmark"][data-id="' + id + '"]').forEach(function (b) {
        var on = S.bookmarks.indexOf(id) >= 0;
        b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (S.route.name === 'my') render();
    },
    'clear-bookmarks': function () {
      confirmBox('북마크 전체 삭제', '저장한 북마크 ' + S.bookmarks.length + '건을 모두 지웁니다. 되돌릴 수 없습니다.', function () {
        S.bookmarks = []; persist(); render(); toast('북마크를 모두 지웠습니다', 'warn');
      });
    },
    'clear-recent': function () { S.recent = []; persist(); render(); toast('최근 기록을 지웠습니다', 'warn'); },
    'clear-interests': function () { S.interests = []; persist(); render(); toast('관심 분야 선택을 해제했습니다', 'warn'); },

    'research-cat': function (el) {
      S.filter.cat = el.getAttribute('data-cat') || 'all';
      go('#/research?cat=' + encodeURIComponent(S.filter.cat));
      if (parseHash(location.hash).query.cat === S.filter.cat) render();
    },
    'pub-type': function (el) {
      S.filter.pubType = el.getAttribute('data-t') || 'all';
      go('#/publications?t=' + encodeURIComponent(S.filter.pubType));
      if (parseHash(location.hash).query.t === S.filter.pubType) render();
    },
    'program-tab': function (el) { go('#/programs?p=' + encodeURIComponent(el.getAttribute('data-p') || '')); },
    'value-tab':   function (el) { go('#/about?t=' + encodeURIComponent(el.getAttribute('data-t') || '')); },

    'pub-alert': function (el) {
      var id = el.getAttribute('data-id'); if (!id) return;
      var i = S.pubAlerts.indexOf(id);
      if (i >= 0) { S.pubAlerts.splice(i, 1); toast('발행 알림을 해제했습니다'); }
      else { S.pubAlerts.push(id); toast('발행 시 안내 대상에 포함되었습니다'); }
      persist(); render(); syncAlertBadge();
    },
    'toggle-subscribe': function () {
      S.subscribed = !S.subscribed; persist(); render(); syncAlertBadge();
      toast(S.subscribed ? '구독 신청이 저장되었습니다' : '구독을 해제했습니다');
    },
    'toggle-interest': function (el) {
      var id = el.getAttribute('data-id'); if (!id) return;
      var i = S.interests.indexOf(id);
      if (i >= 0) S.interests.splice(i, 1); else S.interests.push(id);
      persist(); render();
      toast(i >= 0 ? '관심 분야에서 제외했습니다' : '관심 분야에 추가했습니다');
    },

    'next-question': function () {
      S.visits = S.visits + 1; safeStore.set(KEY.VISIT, S.visits); render();
    },

    'declaration': function (el) {
      var i = parseInt(el.getAttribute('data-i'), 10);
      var d = D.DECLARATIONS[i]; if (!d) return;
      openModal(
        '<div><span class="card__no">창립선언 ' + pad2(i + 1) + '</span>' +
        '<h2 style="font-size:var(--fs-h2);margin-top:6px">' + esc(d.title) + '</h2></div>',
        '<p style="font-size:var(--fs-h3);color:var(--accent);margin-bottom:14px;font-weight:650">' + esc(d.short) + '</p>' +
        '<p style="font-size:var(--fs-sm);color:var(--ink-2);line-height:1.8">' + esc(d.body) + '</p>',
        (i > 0 ? '<button type="button" class="btn btn--line btn--sm" data-action="declaration" data-i="' + (i - 1) + '">' + ic('arrow') + '이전</button>' : '') +
        (i < D.DECLARATIONS.length - 1 ? '<button type="button" class="btn btn--line btn--sm" data-action="declaration" data-i="' + (i + 1) + '">다음' + ic('arrow') + '</button>' : '') +
        '<span style="flex:1"></span>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-action="close-modal">닫기</button>'
      );
    },

    /* ── 자가진단 ── */
    'diag-answer': function (el) {
      var q = el.getAttribute('data-q');
      var v = parseInt(el.getAttribute('data-v'), 10);
      if (!q || isNaN(v)) return;
      S.diagAnswers[q] = v;
      var wasDone = diagAnswered() === D.DIAGNOSTIC.questions.length;
      render();
      if (wasDone) {
        var res = $('#diag-result');
        if (res) setTimeout(function () { res.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120);
      } else {
        var next = $$('[data-action="diag-answer"]').filter(function (b) {
          return !S.diagAnswers.hasOwnProperty(b.getAttribute('data-q'));
        })[0];
        if (next) setTimeout(function () { next.closest('.dg__q').scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
      }
    },
    'diag-save': function () {
      if (diagAnswered() < D.DIAGNOSTIC.questions.length) { toast('모든 문항에 답해 주세요', 'warn'); return; }
      diagSave(); render(); toast('진단 결과를 내 서재에 저장했습니다');
    },
    'diag-reset': function () {
      confirmBox('진단 다시 하기', '현재 입력한 답변을 지우고 처음부터 다시 시작합니다. 저장된 결과는 유지됩니다.', function () {
        S.diagAnswers = {}; render(); toast('진단을 초기화했습니다', 'warn');
      });
    },
    'diag-print': function () { printDiagnosis(); },
    'diag-share': function () {
      var s = diagScore(), lv = diagLevel(s.total);
      doShare('AI휴먼전략 자가진단 결과', lv.code + ' · ' + lv.name + ' (' + s.total + '/' + (D.DIAGNOSTIC.questions.length * 3) + '점) — ' + lv.summary);
    },

    /* ── 커뮤니티 ── */
    'reply': function (el) {
      var id = el.getAttribute('data-id'); if (!id) return;
      openModal('<h2 style="font-size:var(--fs-h2)">답글 남기기</h2>',
        '<form id="reply-form" novalidate>' +
          '<div class="field"><label class="field__label" for="rf-who">표시할 이름 <span class="req">*</span></label>' +
          '<input class="input" id="rf-who" type="text" maxlength="24" placeholder="예: 이OO"><div class="field__err">이름을 입력해 주세요.</div></div>' +
          '<div class="field"><label class="field__label" for="rf-text">답글 <span class="req">*</span></label>' +
          '<textarea class="textarea" id="rf-text" maxlength="600" placeholder="질문에 대한 생각이나 경험을 남겨 주세요."></textarea>' +
          '<div class="field__err">답글을 5자 이상 입력해 주세요.</div></div>' +
        '</form>',
        '<button type="button" class="btn btn--accent btn--sm" data-action="reply-submit" data-id="' + attr(id) + '">' + ic('check') + '등록</button>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-action="close-modal">취소</button>');
    },
    'reply-submit': function (el) {
      var id = el.getAttribute('data-id');
      var who = ($('#rf-who') || {}).value || '';
      var text = ($('#rf-text') || {}).value || '';
      var ok = true;
      ok = setFieldErr('#rf-who', who.trim().length >= 1) && ok;
      ok = setFieldErr('#rf-text', text.trim().length >= 5) && ok;
      if (!ok) return;
      addReply(id, who.trim(), text.trim());
      closeModal(); render(); toast('답글을 등록했습니다');
      setTimeout(function () { var p = $('#post-' + id); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 200);
    },
    'del-post': function (el) {
      var id = el.getAttribute('data-id');
      confirmBox('글 삭제', '이 글과 답글을 함께 삭제합니다. 되돌릴 수 없습니다.', function () {
        S.posts = S.posts.filter(function (p) { return p.id !== id; });
        safeStore.del('kahugo.replies.' + id);
        persist(); render(); toast('글을 삭제했습니다', 'warn');
      });
    },
    'clear-posts': function () {
      confirmBox('내 글 전체 삭제', '이 기기에 저장된 내 글 ' + S.posts.length + '건을 모두 지웁니다. 되돌릴 수 없습니다.', function () {
        S.posts.forEach(function (p) { safeStore.del('kahugo.replies.' + p.id); });
        S.posts = []; persist(); render(); toast('내 글을 모두 지웠습니다', 'warn');
      });
    },

    /* ── 데이터 ── */
    'export-data': function () {
      var payload = {
        exportedAt: new Date().toISOString(),
        platform: 'KAHUGO Platform v2.0',
        bookmarks: S.bookmarks, recent: S.recent, interests: S.interests,
        subscribed: S.subscribed, pubAlerts: S.pubAlerts, diagnosis: S.diag, posts: S.posts
      };
      var txt = JSON.stringify(payload, null, 2);
      try {
        var blob = new Blob([txt], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = 'kahugo-my-data.json';
        document.body.appendChild(a); a.click();
        setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 400);
        toast('내 데이터를 파일로 내려받았습니다');
      } catch (e) {
        openModal('<h2 style="font-size:var(--fs-h2)">내 데이터</h2>',
          '<p class="card__desc" style="margin-bottom:10px">파일 저장이 차단된 환경입니다. 아래 내용을 복사해 보관해 주세요.</p>' +
          '<textarea class="textarea" style="min-height:260px" readonly>' + esc(txt) + '</textarea>');
      }
    },
    'wipe-data': function () {
      confirmBox('전체 초기화', '북마크·최근기록·관심분야·구독·진단결과·커뮤니티 글을 모두 지웁니다. 되돌릴 수 없습니다.', function () {
        Object.keys(KEY).forEach(function (k) { if (k !== 'THEME') safeStore.del(KEY[k]); });
        S.bookmarks = []; S.recent = []; S.interests = []; S.subscribed = false;
        S.pubAlerts = []; S.diag = null; S.posts = []; S.diagAnswers = {};
        S.highlights = []; S.readPos = 1; S.bookDiag = {}; safeStore.del('kahugo.bookDiag');
        render(); syncAlertBadge(); toast('모든 데이터를 초기화했습니다', 'warn');
      });
    },

    /* ── 공유 · 복사 · 설치 ── */
    'share': function (el) { openShareSheet(el.getAttribute('data-title') || document.title, shareUrl()); },
    'share-native': function () {
      var c = _shareCtx;
      if (!navigator.share) { copyText(c.url, '공유 링크를 복사했습니다'); return; }
      navigator.share({ title: c.title, text: c.title, url: c.url }).catch(function () {});
    },
    'share-kakao': function () {
      copyText(_shareCtx.url, '링크를 복사했습니다 · 카카오톡에 붙여넣기 하세요');
    },
    'share-copy': function () { copyText(_shareCtx.url, '공유 링크를 복사했습니다'); },
    'copy-email': function () { copyText(I.email, '이메일 주소를 복사했습니다'); },
    'install-pwa': function () {
      if (S.installPrompt) {
        S.installPrompt.prompt();
        S.installPrompt.userChoice.then(function () { S.installPrompt = null; syncInstallBtn(); });
      } else {
        openModal('<h2 style="font-size:var(--fs-h2)">앱으로 설치하기</h2>',
          '<p class="card__desc" style="margin-bottom:12px">이 플랫폼은 앱처럼 설치해 전체화면으로 쓸 수 있습니다.</p>' +
          '<div class="doc__li"><b>iPhone / iPad (Safari)</b> — 하단 공유 버튼 → “홈 화면에 추가”</div>' +
          '<div class="doc__li"><b>Android (Chrome)</b> — 우상단 ⋮ 메뉴 → “앱 설치” 또는 “홈 화면에 추가”</div>' +
          '<div class="doc__li"><b>PC (Chrome/Edge)</b> — 주소창 오른쪽 설치 아이콘 클릭</div>' +
          '<div class="notice" style="margin-top:12px">' + ic('info') +
          '<span>HTTPS 로 서비스되는 주소에서만 설치 옵션이 나타납니다. 로컬 파일(file://)로 열었을 때는 표시되지 않습니다.</span></div>');
      }
    },

    /* ── 도서 서브퍼널 ── */
    'cover-view': function (el) {
      var src = el.getAttribute('data-src'); if (!src) return;
      openModal('<h2 style="font-size:var(--fs-h2)">표지 크게 보기</h2>',
        '<img src="' + attr(src) + '" alt="표지 이미지" style="width:100%;border-radius:var(--r);border:1px solid var(--line)">',
        '<button type="button" class="btn btn--ghost btn--sm" data-action="close-modal">닫기</button>');
    },
    'book-tab': function (el) {
      var id = el.getAttribute('data-s') || 'toc';
      var t = $('#bk-' + id);
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else go('#/book?s=' + encodeURIComponent(id));
    },
    'kw': function (el) {
      var i = parseInt(el.getAttribute('data-i'), 10);
      var k = BK && BK.BOOK_KEYWORDS[i]; if (!k) return;
      var rr = byId(D.RESEARCH, k.res);
      openModal(
        '<div><span class="bkkw__en">' + esc(k.en) + '</span>' +
        '<h2 style="font-size:var(--fs-h2);margin-top:4px">' + esc(k.k) + '</h2></div>',
        '<p style="font-size:var(--fs-sm);color:var(--ink-2);line-height:1.8;margin-bottom:14px">' + esc(k.d) + '</p>' +
        '<div class="notice notice--accent">' + ic('book') +
        '<span>『' + esc(BK.BOOK.title) + '』에 실린 신문명 키워드 50 중 하나입니다.</span></div>' +
        (rr ? '<div style="margin-top:14px"><h3 class="doc__h">연결된 연구 아젠다</h3>' +
          '<a class="card card--link" href="#/research/' + attr(rr.id) + '" data-action="close-modal">' +
          '<span class="card__no">AGENDA ' + esc(rr.no) + '</span>' +
          '<h3 class="card__title">' + esc(rr.title) + '</h3>' +
          '<p class="card__desc">' + esc(rr.desc) + '</p></a></div>' : ''),
        '<a class="btn btn--accent btn--sm" href="#/preview" data-action="close-modal">' + ic('pages') + '미리보기 읽기</a>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-action="close-modal">닫기</button>');
    },
    'opp': function (el) {
      var n = parseInt(el.getAttribute('data-n'), 10);
      var o = BK && BK.BOOK_OPPS.filter(function (x) { return x.no === n; })[0]; if (!o) return;
      openModal(
        '<div><span class="card__no">사업 기회 ' + pad2(o.no) + ' / 30</span>' +
        '<h2 style="font-size:var(--fs-h2);margin-top:4px">' + esc(o.name) + '</h2></div>',
        '<p style="font-size:var(--fs-sm);color:var(--ink-2);margin-bottom:16px">' + esc(o.lead) + '</p>' +
        '<div class="tbl__wrap"><table class="tbl"><tbody>' +
        '<tr><th style="width:88px">초기 비용</th><td>' + esc(o.cost) + '</td></tr>' +
        '<tr><th>필요 도구</th><td>' + esc(o.tools) + '</td></tr>' +
        '<tr><th>첫 고객</th><td>' + esc(o.first) + '</td></tr>' +
        '</tbody></table></div>' +
        '<div class="notice" style="margin-top:14px">' + ic('info') +
        '<span>※ 비용은 2026년 상반기 한국 시장 기준 저자 추정치입니다. 숫자가 아니라 자릿수를 기억하십시오. ' +
        '출처: 『' + esc(BK.BOOK.title) + '』 부록 A.</span></div>',
        '<a class="btn btn--accent btn--sm" href="#/labs" data-action="close-modal">' + ic('flask') + '연구랩에서 검증하기</a>' +
        '<a class="btn btn--ghost btn--sm" href="#/partnership" data-action="close-modal">협력 제안</a>' +
        '<button type="button" class="btn btn--line btn--sm" data-action="close-modal">닫기</button>');
    },
    'bd-answer': function (el) {
      var i = el.getAttribute('data-i');
      S.bookDiag[i] = !S.bookDiag[i];
      safeStore.set('kahugo.bookDiag', S.bookDiag);
      render();
      setTimeout(function () { var t = $('#bk-diag'); if (t) t.scrollIntoView({ behavior: 'auto', block: 'start' }); }, 40);
    },
    'bd-reset': function () {
      S.bookDiag = {}; safeStore.set('kahugo.bookDiag', S.bookDiag); render();
      toast('진단을 초기화했습니다', 'warn');
      setTimeout(function () { var t = $('#bk-diag'); if (t) t.scrollIntoView({ behavior: 'auto', block: 'start' }); }, 40);
    },
    'pv-go': function (el) {
      var p = parseInt(el.getAttribute('data-p'), 10);
      if (!BK || isNaN(p)) return;
      p = Math.min(Math.max(p, 1), BK.BOOK_PREVIEW.length);
      S.readPos = p; persist();
      go('#/preview?p=' + p);
      if (parseHash(location.hash).query.p === String(p)) render();
    },
    'pv-font': function (el) {
      var d = parseInt(el.getAttribute('data-d'), 10) || 0;
      var n = Math.min(3, Math.max(1, (S.readFont || 2) + d));
      if (n === S.readFont) { toast(d > 0 ? '가장 큰 글자입니다' : '가장 작은 글자입니다', 'warn'); return; }
      S.readFont = n; persist(); render();
    },
    'pv-jump': function () {
      if (!BK) return;
      var seen = {}, items = [];
      BK.BOOK_PREVIEW.forEach(function (pg) {
        if (seen[pg.sid]) return;
        seen[pg.sid] = 1;
        items.push({ p: pg.no, part: pg.part, title: pg.title });
      });
      openModal('<h2 style="font-size:var(--fs-h2)">미리보기 목차</h2>',
        '<div class="stack">' + items.map(function (it) {
          var on = S.readPos >= it.p;
          return '<button type="button" class="result" data-action="pv-go" data-p="' + it.p + '" style="border:1px solid var(--line)">' +
            '<div class="result__type">' + esc(it.part) + (on ? ' · 읽음' : '') + '</div>' +
            '<div class="result__title">' + esc(it.title) + '</div>' +
            '<div class="result__sub">' + it.p + '쪽부터</div></button>';
        }).join('') + '</div>',
        '<button type="button" class="btn btn--ghost btn--sm" data-action="close-modal">닫기</button>');
    },
    'pv-hl': function (el) {
      var t = el.getAttribute('data-t'); if (!t) return;
      if (S.highlights.indexOf(t) >= 0) { toast('이미 저장된 문장입니다', 'warn'); return; }
      S.highlights.push(t); persist(); render();
      toast('문장을 저장했습니다 · 내 서재에서 확인');
    },
    'hl-clear': function () {
      confirmBox('저장한 문장 비우기', '저장한 문장 ' + S.highlights.length + '개를 모두 지웁니다.', function () {
        S.highlights = []; persist(); render(); toast('저장한 문장을 지웠습니다', 'warn');
      });
    },

    'env-help': function () { showEnvHelp(); }
  };

  function onClick(e) {
    /* 1) data-action 우선 */
    var el = e.target.closest ? e.target.closest('[data-action]') : null;
    if (el) {
      var name = el.getAttribute('data-action');
      var fn = ACTIONS[name];
      if (fn) {
        if (el.tagName === 'A' && el.getAttribute('href') && el.getAttribute('href').charAt(0) === '#') {
          /* 해시 링크 + 액션 동시 — 액션만 실행하고 이동은 브라우저에 맡김 */
          fn(el, e);
          return;
        }
        e.preventDefault();
        fn(el, e);
        return;
      }
      console.warn('[KAHUGO] 등록되지 않은 액션:', name);
      e.preventDefault();
      toast('이 기능은 아직 연결되지 않았습니다', 'warn');
      return;
    }
    /* 2) 내부 해시 링크 — 미등록 경로 차단 */
    var a = e.target.closest ? e.target.closest('a[href^="#/"]') : null;
    if (a) {
      var r = parseHash(a.getAttribute('href'));
      if (!ROUTES[r.name]) {
        e.preventDefault();
        console.warn('[KAHUGO] 미등록 경로:', a.getAttribute('href'));
        toast('연결되지 않은 경로입니다', 'warn');
      }
      if (a.getAttribute('href') === location.hash) { e.preventDefault(); render(); }
    }
  }

  function setFieldErr(sel, ok) {
    var input = $(sel); if (!input) return ok;
    var field = input.closest('.field');
    if (field) field.classList.toggle('has-err', !ok);
    if (!ok) { try { input.focus(); } catch (e) {} }
    return ok;
  }

  function confirmBox(title, body, onYes) {
    openModal('<h2 style="font-size:var(--fs-h2)">' + esc(title) + '</h2>',
      '<p class="card__desc">' + esc(body) + '</p>',
      '<button type="button" class="btn btn--accent btn--sm" data-action="confirm-yes">' + ic('check') + '확인</button>' +
      '<button type="button" class="btn btn--ghost btn--sm" data-action="close-modal">취소</button>');
    ACTIONS['confirm-yes'] = function () { closeModal(); setTimeout(onYes, 120); };
  }
  ACTIONS['confirm-yes'] = function () { closeModal(); };

  function copyText(t, msg) {
    var done = function () { toast(msg || '복사했습니다'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(done).catch(function () { fallbackCopy(t, done); });
    } else fallbackCopy(t, done);
  }
  function fallbackCopy(t, done) {
    try {
      var ta = document.createElement('textarea');
      ta.value = t; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.top = '-1000px';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta); done();
    } catch (e) {
      openModal('<h2 style="font-size:var(--fs-h2)">복사</h2>',
        '<p class="card__desc" style="margin-bottom:10px">자동 복사가 차단된 환경입니다. 아래 내용을 직접 선택해 복사해 주세요.</p>' +
        '<input class="input" value="' + attr(t) + '" readonly>');
    }
  }

  /* ── 공유 시트 ─────────────────────────────────────────────
     · 모바일: 기기 기본 공유(navigator.share) → 카카오톡·문자·메일이 그대로 뜬다.
     · 데스크톱: SNS 공유 주소를 새 창으로 연다. 카카오톡은 PC 웹 공유 규격이
       없으므로 '링크 복사 후 붙여넣기' 경로를 제공한다.
     · 외부 SDK·CDN 을 싣지 않고 공개 공유 주소만 사용한다. */
  var _shareCtx = { title: '', url: '' };

  function shareUrl() {
    var u = location.href;
    if (/^https?:/i.test(u)) return u;
    return 'https://kahugo.com/' + (location.hash || '');   /* 로컬 파일에서도 유효한 주소로 */
  }

  function snsTargets(title, url) {
    var t = encodeURIComponent(title), u = encodeURIComponent(url);
    return [
      { k: 'x',    n: 'X (트위터)',   h: 'https://twitter.com/intent/tweet?text=' + t + '&url=' + u },
      { k: 'fb',   n: '페이스북',      h: 'https://www.facebook.com/sharer/sharer.php?u=' + u },
      { k: 'line', n: '라인',          h: 'https://social-plugins.line.me/lineit/share?url=' + u },
      { k: 'band', n: '네이버 밴드',   h: 'https://band.us/plugin/share?body=' + t + '%0A' + u + '&route=' + u },
      { k: 'blog', n: '네이버 블로그', h: 'https://share.naver.com/web/shareView?url=' + u + '&title=' + t }
    ];
  }

  function openShareSheet(title, url) {
    _shareCtx = { title: title || document.title, url: url || shareUrl() };
    var canNative = !!navigator.share;
    var list = snsTargets(_shareCtx.title, _shareCtx.url).map(function (s) {
      return '<a class="shr__i" href="' + attr(s.h) + '" target="_blank" rel="noopener noreferrer" data-ext="1">' +
             '<span class="shr__n">' + esc(s.n) + '</span>' + ic('arrow') + '</a>';
    }).join('');

    openModal(
      '<div><span class="badge badge--accent">공유</span>' +
      '<h2 style="font-size:var(--fs-h2);margin-top:6px">' + esc(_shareCtx.title) + '</h2></div>',
      (canNative
        ? '<button type="button" class="btn btn--accent btn--block" data-action="share-native">' +
          ic('share') + '카카오톡 · 문자 · 메일로 공유</button>' +
          '<p class="shr__hint">휴대폰 기본 공유창이 열립니다. 카카오톡이 목록에 함께 표시됩니다.</p>'
        : '<button type="button" class="btn btn--accent btn--block" data-action="share-kakao">' +
          ic('chat') + '카카오톡으로 공유 (링크 복사)</button>' +
          '<p class="shr__hint">PC 카카오톡은 웹 공유 규격이 없어 링크를 복사해 드립니다. ' +
          '카카오톡 대화창에 붙여넣기(Ctrl+V) 하시면 됩니다.</p>') +
      '<div class="shr">' + list + '</div>' +
      '<div class="shr__url"><input class="input" id="shr-url" value="' + attr(_shareCtx.url) + '" readonly aria-label="공유 주소"></div>',
      '<button type="button" class="btn btn--ghost btn--sm" data-action="share-copy">' + ic('link') + '링크 복사</button>' +
      '<button type="button" class="btn btn--line btn--sm" data-action="close-modal">닫기</button>'
    );
  }

  function doShare(title, text) { openShareSheet(title || text, shareUrl()); }

  /* ── 진단 결과 PDF (외부 라이브러리 없이 인쇄) ── */
  function printDiagnosis() {
    var src = S.diag;
    if (!src && diagAnswered() === D.DIAGNOSTIC.questions.length) { diagSave(); src = S.diag; }
    if (!src) { toast('먼저 진단을 완료해 주세요', 'warn'); return; }
    var lv = null;
    D.DIAGNOSTIC.levels.forEach(function (l) { if (l.code === src.level) lv = l; });
    lv = lv || D.DIAGNOSTIC.levels[0];

    var area = $('#print-area');
    area.innerHTML =
      '<h1>AI휴먼전략 자가진단 결과</h1>' +
      '<div class="pa-meta">한국AI휴먼전략연구원 KAHUGO · 진단일 ' + esc(src.date) + '</div>' +
      '<div class="pa-box"><h2>' + esc(src.level) + ' · ' + esc(src.levelName) + ' — ' + esc(src.total) + ' / ' + esc(src.max) + '점</h2>' +
      '<p>' + esc(lv.summary) + '</p><p>' + esc(lv.detail) + '</p></div>' +
      '<h2>축별 점수</h2><ul>' +
      (src.axes || []).map(function (a) { return '<li>' + esc(a.ko) + ' — ' + esc(a.v) + ' / 3</li>'; }).join('') + '</ul>' +
      '<h2>지금 하면 좋은 것</h2><ul>' +
      lv.actions.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>' +
      '<div class="pa-meta" style="margin-top:18px">' + esc(D.DIAGNOSTIC.disclaimer) + '</div>';

    document.body.classList.add('printing-scope');
    var restore = function () {
      document.body.classList.remove('printing-scope');
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    setTimeout(function () {
      try { window.print(); } catch (e) { toast('인쇄를 시작할 수 없는 환경입니다', 'warn'); }
      setTimeout(restore, 1200);
    }, 120);
  }

  /* ══════════ §13. PWA · 환경 진단 ══════════════════════ */
  function syncAlertBadge() {
    var n = S.pubAlerts.length + (S.subscribed ? 1 : 0);
    var b = $('#alert-dot');
    if (!b) return;
    if (n > 0) { b.textContent = n > 9 ? '9+' : String(n); b.style.display = ''; }
    else b.style.display = 'none';
  }

  function syncInstallBtn() {
    var b = $('#install-btn');
    if (b) b.style.display = S.installPrompt ? '' : 'none';
  }

  function showEnvHelp(extra) {
    var isFile = location.protocol === 'file:';
    var inFrame = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
    var rows = [
      ['현재 프로토콜', location.protocol],
      ['브라우저 저장소', safeStore.available() ? '사용 가능' : '차단됨 (메모리 임시 저장으로 대체 중)'],
      ['프레임 내부 실행', inFrame ? '예' : '아니오'],
      ['서비스워커', ('serviceWorker' in navigator) ? '지원' : '미지원']
    ];
    openModal('<h2 style="font-size:var(--fs-h2)">이동이 막히나요?</h2>',
      (extra ? '<div class="notice notice--accent" style="margin-bottom:12px">' + ic('info') + '<span>' + esc(extra) + '</span></div>' : '') +
      '<p class="card__desc" style="margin-bottom:12px">이 플랫폼은 주소창의 <code>#/경로</code> 값으로 화면을 전환합니다. ' +
      '아래 환경에서는 일부 기능이 제한될 수 있습니다.</p>' +
      '<div class="tbl__wrap"><table class="tbl"><tbody>' +
      rows.map(function (r) { return '<tr><th style="width:130px">' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>'; }).join('') +
      '</tbody></table></div>' +
      '<h3 class="doc__h" style="margin-top:16px">해결 방법</h3>' +
      (isFile ? '<div class="doc__li"><b>로컬 파일로 여신 경우</b> — 서비스워커·설치·일부 저장 기능이 브라우저 정책상 차단됩니다. 웹호스팅(HTTPS)에 올리면 모두 정상 동작합니다.</div>' : '') +
      (inFrame ? '<div class="doc__li"><b>다른 사이트 안에 삽입된 경우</b> — 상위 페이지가 주소 변경을 막을 수 있습니다. 새 탭에서 직접 열어 주세요.</div>' : '') +
      (!safeStore.available() ? '<div class="doc__li"><b>시크릿 모드 / 쿠키 차단</b> — 저장이 막혀 새로고침 시 초기화됩니다. 일반 창에서 열거나 사이트 데이터 허용을 켜 주세요.</div>' : '') +
      '<div class="doc__li"><b>메뉴가 반응하지 않을 때</b> — 브라우저 확장 프로그램(광고 차단 등)이 스크립트를 막는 경우가 있습니다. 확장을 끄고 새로고침해 보세요.</div>');
  }

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* 조용히 무시 */ });
    });
  }

  /* ══════════ §14. 부트스트랩 ═══════════════════════════ */
  function buildShell() {
    /* 상단 아이콘바 */
    var iconbar = D.ICON_ACTIONS.map(function (a) {
      var extra = a.route ? ' data-route="' + attr(a.route) + '"' : '';
      var badge = (a.id === 'contact') ? '' : '';
      var id = (a.id === 'theme') ? ' data-action="toggle-theme"' : ' data-action="' + attr(a.action) + '"';
      return '<button type="button" class="iconbtn' + (a.id === 'chat' ? ' iconbtn--accent' : '') + '"' + id + extra +
        ' aria-label="' + attr(a.aria) + '">' + ic(a.icon) +
        '<span class="iconbtn__label">' + esc(a.label) + '</span>' + badge + '</button>';
    }).join('');

    $('#iconbar').innerHTML =
      '<button type="button" class="iconbtn" id="install-btn" data-action="install-pwa" aria-label="앱으로 설치하기" style="display:none">' +
      ic('install') + '<span class="iconbtn__label">설치</span></button>' +
      '<a class="iconbtn iconbtn--my" href="#/my" aria-label="내 서재 열기">' + ic('bookmark') +
      '<span class="iconbtn__label">서재</span><span class="iconbtn__dot" id="alert-dot" style="display:none">0</span></a>' +
      iconbar;

    /* 2단 대메뉴 */
    $('#nav').innerHTML = D.NAV.map(function (n) {
      return '<a class="nav__item' + (n.accent ? ' nav__item--book' : '') + '" href="' + attr(n.route) + '" data-nav="' + attr(n.id) + '">' +
        ic(n.icon) + '<span>' + esc(n.label) + '</span></a>';
    }).join('');

    /* 하단 탭바 */
    $('#bottomnav').innerHTML = D.BOTTOM_NAV.map(function (n) {
      return '<a class="bottomnav__item' + (n.accent ? ' bottomnav__item--book' : '') + '" href="' + attr(n.route) + '" data-nav="' + attr(n.id) + '">' +
        ic(n.icon) + '<span>' + esc(n.label) + '</span></a>';
    }).join('');

    /* 검색 패널 */
    $('#search-default').innerHTML = '';
    $('#search-results').innerHTML = searchDefaultHtml();

    /* 챗봇 칩 */
    $('#chat-chips').innerHTML = chatChipsHtml();

    /* 푸터 */
    $('#foot').innerHTML =
      '<div class="wrap"><div class="foot__grid">' +
        '<div>' +
          '<div class="brand" style="margin-bottom:10px">' +
            '<img class="brand__mark" src="assets/kahugo-mark.svg" alt="KAHUGO 심볼" width="30" height="30">' +
            '<span class="brand__txt"><span class="brand__ko">' + esc(I.nameKo) + '</span>' +
            '<span class="brand__en">KAHUGO</span></span>' +
          '</div>' +
          '<p style="font-size:12.5px;color:var(--sub);margin-bottom:10px">' + esc(I.tagline) + '</p>' +
          '<p style="font-size:11.5px;color:var(--faint);font-family:var(--font-num)">' + esc(I.focusLine) + '</p>' +
          '<div class="row" style="margin-top:12px">' +
            '<a class="btn btn--ghost btn--sm" href="mailto:' + attr(I.email) + '">' + ic('mail') + esc(I.email) + '</a>' +
          '</div>' +
        '</div>' +
        '<div><div class="foot__h">플랫폼</div>' +
          D.NAV.map(function (n) { return '<a class="foot__link" href="' + attr(n.route) + '">' + esc(n.full) + '</a>'; }).join('') +
        '</div>' +
        '<div><div class="foot__h">참여·협력</div>' +
          '<a class="foot__link" href="#/book">제5의 물결 · 도서 소개</a>' +
          '<a class="foot__link" href="#/preview">도서 미리보기 (무료)</a>' +
          '<a class="foot__link" href="#/diagnosis">AI휴먼전략 자가진단</a>' +
          '<a class="foot__link" href="#/my">내 서재</a>' +
          '<a class="foot__link" href="#/about">연구원 소개</a>' +
          '<a class="foot__link" href="#/partnership">협력·파트너십</a>' +
          '<a class="foot__link" href="#/contact">협력·문의하기</a>' +
          '<button type="button" class="foot__link" data-action="env-help" style="text-align:left;width:100%">이동이 막히나요?</button>' +
        '</div>' +
      '</div>' +
      '<div class="foot__note">' +
        '<p>' + esc(I.footerNote) + '</p>' +
      '</div></div>';
  }

  function bindForms() {
    document.addEventListener('submit', function (e) {
      var f = e.target;

      if (f.id === 'post-form') {
        e.preventDefault();
        var who = ($('#pf-who') || {}).value || '';
        var title = ($('#pf-title') || {}).value || '';
        var body = ($('#pf-body') || {}).value || '';
        var cat = ($('#pf-cat') || {}).value || 'human';
        var ok = true;
        ok = setFieldErr('#pf-body', body.trim().length >= 10) && ok;
        ok = setFieldErr('#pf-title', title.trim().length >= 2) && ok;
        ok = setFieldErr('#pf-who', who.trim().length >= 1) && ok;
        if (!ok) { toast('입력값을 확인해 주세요', 'warn'); return; }
        var p = { id: uid('post'), author: who.trim(), cat: cat, title: title.trim(), body: body.trim(), date: todayStr(), replies: [] };
        S.posts.push(p); persist(); render();
        toast('글을 등록했습니다');
        setTimeout(function () { var el = $('#post-' + p.id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 220);
        return;
      }

      if (f.id === 'contact-form') {
        e.preventDefault();
        var n = ($('#cf-name') || {}).value || '';
        var em = ($('#cf-email') || {}).value || '';
        var tp = ($('#cf-topic') || {}).value || '';
        var ms = ($('#cf-msg') || {}).value || '';
        var ok2 = true;
        ok2 = setFieldErr('#cf-msg', ms.trim().length >= 20) && ok2;
        ok2 = setFieldErr('#cf-topic', !!tp) && ok2;
        ok2 = setFieldErr('#cf-email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.trim())) && ok2;
        ok2 = setFieldErr('#cf-name', n.trim().length >= 2) && ok2;
        if (!ok2) { toast('입력값을 확인해 주세요', 'warn'); return; }

        var topicLabel = ($('#cf-topic option:checked') || {}).textContent || tp;
        var summary =
          '[한국AI휴먼전략연구원 KAHUGO 협력 제안]\n\n' +
          '· 성함/소속 : ' + n.trim() + '\n' +
          '· 회신 이메일 : ' + em.trim() + '\n' +
          '· 제안 유형 : ' + topicLabel + '\n' +
          '· 작성일 : ' + todayStr() + '\n\n' +
          '[제안 내용]\n' + ms.trim() + '\n';

        var mailto = 'mailto:' + I.email +
          '?subject=' + encodeURIComponent('[KAHUGO 협력 제안] ' + topicLabel + ' · ' + n.trim()) +
          '&body=' + encodeURIComponent(summary);

        openModal('<h2 style="font-size:var(--fs-h2)">제안 요약본이 준비되었습니다</h2>',
          '<p class="card__desc" style="margin-bottom:12px">아래 내용 그대로 메일 앱으로 보내시거나, 복사해서 사용하실 수 있습니다.</p>' +
          '<textarea class="textarea" id="ct-summary" style="min-height:230px" readonly>' + esc(summary) + '</textarea>' +
          '<div class="notice" style="margin-top:12px">' + ic('lock') +
          '<span>이 내용은 전송 버튼을 누르기 전까지 이 기기를 벗어나지 않습니다.</span></div>',
          '<a class="btn btn--accent btn--sm" href="' + attr(mailto) + '">' + ic('mail') + '메일 앱으로 보내기</a>' +
          '<button type="button" class="btn btn--ghost btn--sm" data-action="copy-summary">' + ic('share') + '요약본 복사</button>' +
          '<button type="button" class="btn btn--line btn--sm" data-action="close-modal">닫기</button>');
        ACTIONS['copy-summary'] = function () { copyText(summary, '요약본을 복사했습니다'); };
        return;
      }
    });
    ACTIONS['copy-summary'] = function () { toast('먼저 폼을 작성해 주세요', 'warn'); };
  }

  function bindGlobal() {
    /* 캡처 단계에서 먼저 스크롤 위치를 기록한다.
       (해시 앵커 링크 클릭도 go() 를 거치지 않으므로 여기서 잡는다) */
    document.addEventListener('click', markScroll, true);
    document.addEventListener('click', onClick);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if ($('.modal.is-open')) { closeModal(); return; }
        if ($('.panel.is-open')) { closePanel(); return; }
      }
      /* Ctrl/Cmd + K → 검색 */
      if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'k') {
        e.preventDefault(); ACTIONS['open-search']();
      }
      /* / → 검색 (입력 중이 아닐 때) */
      if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
        e.preventDefault(); ACTIONS['open-search']();
      }
    });

    var si = $('#search-input');
    if (si) {
      var t = null;
      si.addEventListener('input', function () {
        clearTimeout(t);
        var v = si.value;
        t = setTimeout(function () { searchRun(v); }, 120);
      });
      si.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          var first = $('#search-results .result');
          if (first) first.click();
        }
      });
    }

    var ci = $('#chat-input');
    if (ci) {
      $('#chat-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var v = ci.value.trim();
        if (!v) return;
        chatPush('me', esc(v)); ci.value = '';
        setTimeout(function () { chatAnswer(v); }, 230);
      });
    }

    $('#backdrop').addEventListener('click', function () { closePanel(); });
    $('#modal-bg').addEventListener('click', function () { closeModal(); });

    window.addEventListener('hashchange', render);

    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault(); S.installPrompt = e; syncInstallBtn();
    });
    window.addEventListener('appinstalled', function () { S.installPrompt = null; syncInstallBtn(); toast('앱으로 설치되었습니다'); });

    window.addEventListener('error', function (ev) {
      console.error('[KAHUGO] 런타임 오류:', ev.message);
    });
  }

  function boot() {
    applyOverride(window.KAHUGO_OVERRIDE);   /* 관리자 미리보기 주입분 */
    applyTheme(S.theme);
    buildShell();
    applyTheme(S.theme);   /* 셸 생성 후 토글 버튼 라벨·아이콘을 현재 테마에 맞춤 */
    bindGlobal();
    bindForms();
    render();
    syncAlertBadge();
    syncInstallBtn();
    registerSW();
    loadCloudContent();

    if (!safeStore.available()) {
      setTimeout(function () { toast('브라우저 저장이 제한된 환경입니다. 새로고침 시 초기화됩니다.', 'warn'); }, 900);
    }
    console.log('%cKAHUGO Platform v2.2','color:#2fd4e8;font-weight:bold', '· 경로', Object.keys(ROUTES).length, '· 액션', Object.keys(ACTIONS).length, '· 검색', D.SEARCH_INDEX.length);
  }

  /* 전역 노출 — 빌드 게이트 · QA 스크립트가 참조 */
  window.KAHUGO_APP = {
    routes: function () { return Object.keys(ROUTES); },
    actions: function () { return Object.keys(ACTIONS); },
    go: go, render: render, state: S
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
