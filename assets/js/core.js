/* ==========================================================================
   KAHUGO 9차 · 코어 엔진
   ─ 라우터 · 액션 레지스트리 · 빌드 게이트 · 오버레이(모달/패널) · 스크롤 잠금
   ─ 저장소(안전 래퍼) · 설정 병합(기본값 ← 배포 설정 ← 실시간 서버 ← 관리자 미리보기)
   ─ 챗봇 · 통합검색 · 로그인 · 공유 · 커뮤니티/문의 API · 앱 설치 · 보기 모드
   화면(뷰)은 views.js 에 있습니다. 메뉴·문구는 data.js 에서 고칩니다.
   ========================================================================== */
(function (W, D) {
  'use strict';
  var K = W.KAHUGO = W.KAHUGO || {};
  K.version = '9.0.0';

  /* ── 0. 작은 도구들 ─────────────────────────────────────────────────── */
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var attr = esc;
  var uid = function (p) { return (p || 'id') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  var nowLabel = function (ts) {
    var t = ts ? new Date(ts) : new Date(), diff = (Date.now() - t.getTime()) / 1000;
    if (diff < 60) return '방금 전';
    if (diff < 3600) return Math.floor(diff / 60) + '분 전';
    if (diff < 86400) return Math.floor(diff / 3600) + '시간 전';
    return t.getFullYear() + '.' + ('0' + (t.getMonth() + 1)).slice(-2) + '.' + ('0' + t.getDate()).slice(-2);
  };
  K.u = { $: $, $$: $$, esc: esc, attr: attr, uid: uid, clone: clone, nowLabel: nowLabel };

  /* ── 1. 환경 감지 ───────────────────────────────────────────────────── */
  var proto = (location.protocol || '').toLowerCase();
  var ENV = K.env = {
    http: proto === 'http:' || proto === 'https:',
    proto: proto,
    ios: /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    standalone: (W.matchMedia && W.matchMedia('(display-mode: standalone)').matches) || W.navigator.standalone === true,
    preview: /[?&]preview=1/.test(location.search),
    debug: /[?&]debug=1/.test(location.search)
  };

  /* ── 2. 안전 저장소 — 시크릿 모드·content:// 에서도 앱이 멈추지 않게 ── */
  var store = K.store = (function () {
    var mem = {}, ok = false, P = 'kahugo9:';
    try { var k = '__t'; W.localStorage.setItem(k, '1'); W.localStorage.removeItem(k); ok = true; } catch (e) { ok = false; }
    return {
      get: function (key, d) {
        try { var v = ok ? W.localStorage.getItem(P + key) : mem[key]; return v == null ? (d === undefined ? null : d) : JSON.parse(v); }
        catch (e) { return d === undefined ? null : d; }
      },
      set: function (key, v) {
        try { var s = JSON.stringify(v); if (ok) W.localStorage.setItem(P + key, s); else mem[key] = s; return true; }
        catch (e) { mem[key] = JSON.stringify(v); return false; }
      },
      del: function (key) { try { if (ok) W.localStorage.removeItem(P + key); else delete mem[key]; } catch (e) {} },
      ok: function () { return ok; },
      raw: function (key) { try { return ok ? W.localStorage.getItem(key) : null; } catch (e) { return null; } }
    };
  })();

  /* ── 3. 설정 병합 ───────────────────────────────────────────────────── */
  var DEF = W.KAHUGO_DEFAULT || {};
  var CFG = K.cfg = clone(DEF);
  function applyOverride(o) {
    if (!o || typeof o !== 'object') return false;
    var changed = false;
    Object.keys(o).forEach(function (k) { if (k !== '_meta' && Object.prototype.hasOwnProperty.call(DEF, k)) { var nv = sanitize(o[k]); if (JSON.stringify(CFG[k]) !== JSON.stringify(nv)) { CFG[k] = nv; changed = true; } } });
    return changed;
  }
  K.applyOverride = applyOverride;
  // 관리자가 넣은 주소 검사: 화면 이동(route·link·r)은 #/… 만, 외부 링크(url)는 https:// 만 허용 → javascript: 등 차단
  function sanitize(o) {
    if (Array.isArray(o)) { o.forEach(sanitize); return o; }
    if (!o || typeof o !== 'object') return o;
    Object.keys(o).forEach(function (k) {
      var v = o[k];
      if (typeof v === 'string' && (k === 'route' || k === 'link' || k === 'ctaRoute') && v && !/^#\/[\w\-\/?=&%.+가-힣]*$/.test(v)) o[k] = '#/home';
      else if (typeof v === 'string' && k === 'url' && !/^https:\/\/[^\s"'<>]+$/.test(v)) o[k] = '#/home';
      else if (v && typeof v === 'object') sanitize(v);
    });
    return o;
  }
  K.sanitize = sanitize;
  // 관리자 즉시 미리보기(같은 브라우저의 초안)
  function loadDraft() {
    if (!ENV.preview) return false;
    try { var raw = W.localStorage.getItem('kahugo9:admin:draft'); return raw ? applyOverride(JSON.parse(raw)) : false; } catch (e) { return false; }
  }
  sanitize(CFG); loadDraft();
  var metaApi = $('meta[name="kahugo-api"]');
  K.apiOn = false; K.dbOn = false;
  function apiWanted() {
    var m = metaApi ? metaApi.getAttribute('content') : 'off';
    var c = (CFG.site && CFG.site.integrations && CFG.site.integrations.api) || 'auto';
    return ENV.http && (m === 'on' || c === 'on') && c !== 'off';
  }
  K.api = function (path, opt) {
    opt = opt || {};
    if (!K.apiOn) return Promise.reject(new Error('api-off'));
    var init = { method: opt.method || 'GET', headers: { 'content-type': 'application/json' }, credentials: 'same-origin' };
    if (opt.body) init.body = JSON.stringify(opt.body);
    return fetch('/api/' + path, init).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) { var e = new Error(j.error || ('HTTP ' + r.status)); e.status = r.status; throw e; } return j; });
    });
  };
  function fetchJson(url, ms) {
    return new Promise(function (res) {
      var done = false, t = setTimeout(function () { if (!done) { done = true; res(null); } }, ms || 3000);
      try {
        fetch(url, { cache: 'no-store', credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : null; })
          .then(function (j) { if (!done) { done = true; clearTimeout(t); res(j); } })
          .catch(function () { if (!done) { done = true; clearTimeout(t); res(null); } });
      } catch (e) { done = true; clearTimeout(t); res(null); }
    });
  }
  K.loadRemoteConfig = function () {
    if (!ENV.http || ENV.preview || W.KAHUGO_STANDALONE) return Promise.resolve(false);
    var want = apiWanted();
    return Promise.all([fetchJson('assets/data/site-config.json', 3500), want ? fetchJson('/api/health', 3000) : null, want ? fetchJson('/api/config', 3500) : null]).then(function (r) {
      var ch = applyOverride(r[0]);
      var h = r[1]; K.apiOn = !!(h && h.ok); K.dbOn = !!(K.apiOn && h.db);
      if (K.apiOn && r[2]) ch = applyOverride(r[2]) || ch;
      return ch;
    });
  };

  /* ── 4. 아이콘 — 직접 그린 원본 SVG(24×24 선 아이콘) ─────────────────── */
  var IC = {
    home: '<path d="M3.5 10.6 12 4l8.5 6.6"/><path d="M5.8 9.2V19a1 1 0 0 0 1 1h3.7v-5.4h3V20h3.7a1 1 0 0 0 1-1V9.2"/>',
    compass: '<circle cx="12" cy="12" r="8.6"/><path d="m15.4 8.6-2.1 4.7-4.7 2.1 2.1-4.7z"/>',
    flask: '<path d="M9.4 3.6h5.2M10.3 3.8v5.6L5.2 18a1.6 1.6 0 0 0 1.4 2.4h10.8a1.6 1.6 0 0 0 1.4-2.4l-5.1-8.6V3.8"/><path d="M7.6 14.6h8.8"/>',
    cap: '<path d="m2.8 9.4 9.2-4.6 9.2 4.6-9.2 4.6z"/><path d="M6.6 11.4v4.4c1.4 1.5 3.3 2.2 5.4 2.2s4-.7 5.4-2.2v-4.4M21.2 9.4v5"/>',
    book: '<path d="M4 5.6c2.6-1.1 5.3-1.1 8 .6 2.7-1.7 5.4-1.7 8-.6v12.8c-2.6-1.1-5.3-1.1-8 .6-2.7-1.7-5.4-1.7-8-.6z"/><path d="M12 6.2V19"/>',
    wave: '<path d="M2.8 9.6q2.3-2 4.6 0t4.6 0 4.6 0 4.6 0"/><path d="M2.8 14.6q2.3-2 4.6 0t4.6 0 4.6 0 4.6 0"/><circle cx="12" cy="4.6" r="1.4"/>',
    spark: '<path d="M12 3.4c.5 3.9 2.2 5.6 6.1 6.1-3.9.5-5.6 2.2-6.1 6.1-.5-3.9-2.2-5.6-6.1-6.1 3.9-.5 5.6-2.2 6.1-6.1z"/><path d="M18.4 15.4c.2 1.6.9 2.3 2.5 2.5-1.6.2-2.3.9-2.5 2.5-.2-1.6-.9-2.3-2.5-2.5 1.6-.2 2.3-.9 2.5-2.5z"/>',
    users: '<circle cx="9" cy="8.4" r="3.4"/><path d="M3 19.6c.6-3.3 3-5.2 6-5.2s5.4 1.9 6 5.2"/><path d="M15.6 5.4a3.2 3.2 0 0 1 0 6.1M17.4 14.6c1.9.6 3.2 2.3 3.6 5"/>',
    info: '<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5.4M12 7.8h.01"/>',
    user: '<circle cx="12" cy="8.2" r="3.8"/><path d="M4.4 20c.8-3.8 3.8-6 7.6-6s6.8 2.2 7.6 6"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.4"/><path d="m15.6 15.6 4.4 4.4"/>',
    moon: '<path d="M19.6 14.6A8 8 0 0 1 9.4 4.4a8 8 0 1 0 10.2 10.2z"/>',
    sun: '<circle cx="12" cy="12" r="3.8"/><path d="M12 2.8v2M12 19.2v2M4.4 4.4l1.4 1.4M18.2 18.2l1.4 1.4M2.8 12h2M19.2 12h2M4.4 19.6l1.4-1.4M18.2 5.8l1.4-1.4"/>',
    chat: '<path d="M20.4 12c0 4-3.8 7.2-8.4 7.2-1 0-1.9-.1-2.8-.4L4.6 20.4l1.3-3.6C4.5 15.5 3.6 13.8 3.6 12c0-4 3.8-7.2 8.4-7.2s8.4 3.2 8.4 7.2z"/><path d="M8.6 12h.01M12 12h.01M15.4 12h.01"/>',
    mail: '<rect x="3.4" y="5.6" width="17.2" height="12.8" rx="2.2"/><path d="m4 7 8 6 8-6"/>',
    dots: '<circle cx="5.6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18.4" cy="12" r="1.2"/>',
    bell: '<path d="M6.4 16.4V11a5.6 5.6 0 0 1 11.2 0v5.4l1.6 1.8H4.8z"/><path d="M10 20.2a2.2 2.2 0 0 0 4 0"/>',
    download: '<path d="M12 4v11M7.4 10.6 12 15.2l4.6-4.6"/><path d="M4.6 17.6v1.6a1 1 0 0 0 1 1h12.8a1 1 0 0 0 1-1v-1.6"/>',
    share: '<circle cx="17.6" cy="5.8" r="2.4"/><circle cx="6.4" cy="12" r="2.4"/><circle cx="17.6" cy="18.2" r="2.4"/><path d="m8.5 10.8 7-3.8M8.5 13.2l7 3.8"/>',
    type: '<path d="M4.4 6.4V4.8h10v1.6M9.4 4.8v14.4M7.4 19.2h4"/><path d="M14.6 11.4v-1h5.4v1M17.3 10.4v8.8M16 19.2h2.6"/>',
    monitor: '<rect x="3.2" y="4.6" width="17.6" height="11.8" rx="1.8"/><path d="M9 20h6M12 16.4V20"/>',
    help: '<circle cx="12" cy="12" r="8.6"/><path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5v.6M12 16.8h.01"/>',
    target: '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.2"/>',
    map: '<path d="m9 4.6-5 2v12.8l5-2 6 2 5-2V4.6l-5 2z"/><path d="M9 4.6v12.8M15 6.6v12.8"/>',
    grid: '<rect x="4" y="4" width="6.4" height="6.4" rx="1.4"/><rect x="13.6" y="4" width="6.4" height="6.4" rx="1.4"/><rect x="4" y="13.6" width="6.4" height="6.4" rx="1.4"/><rect x="13.6" y="13.6" width="6.4" height="6.4" rx="1.4"/>',
    shield: '<path d="M12 3.4 5 6.2v5.4c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6.2z"/><path d="m9 12 2.2 2.2L15.4 10"/>',
    flag: '<path d="M5.4 20.6V4.2M5.4 4.6h11.4l-2 4 2 4H5.4"/>',
    lock: '<rect x="5" y="10.6" width="14" height="9.6" rx="2"/><path d="M8.2 10.6V8a3.8 3.8 0 0 1 7.6 0v2.6"/>',
    pen: '<path d="M15.4 4.8 19.2 8.6 9 18.8l-4.6.8.8-4.6z"/><path d="m13.4 6.8 3.8 3.8"/>',
    quote: '<path d="M9.8 7.2c-2.8.8-4.4 3-4.4 6v3.6h4.4v-4.4H7.4c0-1.8.9-3 2.8-3.6zM18.6 7.2c-2.8.8-4.4 3-4.4 6v3.6h4.4v-4.4h-2.4c0-1.8.9-3 2.8-3.6z"/>',
    check: '<path d="m5 12.4 4.4 4.4L19 7.2"/>',
    x: '<path d="m6 6 12 12M18 6 6 18"/>',
    arrow: '<path d="M4.8 12h14M13.4 6.6l5.4 5.4-5.4 5.4"/>',
    chev: '<path d="m9.4 5.6 6.4 6.4-6.4 6.4"/>',
    chevl: '<path d="m14.6 5.6-6.4 6.4 6.4 6.4"/>',
    heart: '<path d="M12 19.6s-7.6-4.4-7.6-10A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.6 2.4c0 5.6-7.6 10-7.6 10z"/>',
    comment: '<path d="M19.6 14.2a2 2 0 0 1-2 2H9l-4.6 3.4V6.4a2 2 0 0 1 2-2h11.2a2 2 0 0 1 2 2z"/>',
    eye: '<path d="M2.8 12S6 5.8 12 5.8 21.2 12 21.2 12 18 18.2 12 18.2 2.8 12 2.8 12z"/><circle cx="12" cy="12" r="2.8"/>',
    bookmark: '<path d="M6.4 4.4h11.2v16l-5.6-4-5.6 4z"/>',
    clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 2"/>',
    cal: '<rect x="3.8" y="5.4" width="16.4" height="14.8" rx="2"/><path d="M3.8 10h16.4M8.4 3.6v3.4M15.6 3.6v3.4"/>',
    pin: '<path d="M12 21s-6.4-5.6-6.4-11a6.4 6.4 0 0 1 12.8 0c0 5.4-6.4 11-6.4 11z"/><circle cx="12" cy="10" r="2.4"/>',
    link: '<path d="M10 14a4.2 4.2 0 0 0 6 0l3-3a4.2 4.2 0 0 0-6-6l-1 1"/><path d="M14 10a4.2 4.2 0 0 0-6 0l-3 3a4.2 4.2 0 0 0 6 6l1-1"/>',
    copy: '<rect x="8.4" y="8.4" width="11.6" height="11.6" rx="2"/><path d="M15.6 8.4V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.6a2 2 0 0 0 2 2h2.4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4.6 7h14.8M9.6 7V4.8h4.8V7M6.6 7l.8 12.4a1.4 1.4 0 0 0 1.4 1.3h6.4a1.4 1.4 0 0 0 1.4-1.3L17.4 7"/>',
    building: '<path d="M4.6 20.4V5.2l8-2v17.2M12.6 8.4l6.8 2.2v9.8M3 20.4h18"/><path d="M7.6 8h2M7.6 11.4h2M7.6 14.8h2M15.4 13.4h1.6M15.4 16.8h1.6"/>',
    hand: '<path d="M3 12.6 7.4 8.2l3.8 1.6 2.4-1.4 4.6 1.8L21 13.6"/><path d="m7 12.4 3.6 3.6a1.5 1.5 0 0 0 2.1-2.1M10.4 14.6l1.8 1.8a1.5 1.5 0 0 0 2.1-2.1L12 12"/>',
    list: '<path d="M9 6.6h11M9 12h11M9 17.4h11"/><circle cx="4.8" cy="6.6" r="1"/><circle cx="4.8" cy="12" r="1"/><circle cx="4.8" cy="17.4" r="1"/>',
    ext: '<path d="M13.6 4.6h5.8v5.8M19.4 4.6 11 13M17 13.8v4.4a1.6 1.6 0 0 1-1.6 1.6H6.2a1.6 1.6 0 0 1-1.6-1.6V9a1.6 1.6 0 0 1 1.6-1.6h4.4"/>',
    logout: '<path d="M14.6 4.6H18a1.6 1.6 0 0 1 1.6 1.6v11.6A1.6 1.6 0 0 1 18 19.4h-3.4"/><path d="M10.4 7.8 6.2 12l4.2 4.2M6.2 12h9.4"/>',
    print: '<path d="M7 8.4V4h10v4.4"/><rect x="3.8" y="8.4" width="16.4" height="7.8" rx="1.8"/><path d="M7 13.6h10V20H7z"/>',
    sliders: '<path d="M4.6 7h9M17.8 7h1.6M4.6 12h3M11.8 12h7.6M4.6 17h11M19 17h.4"/><circle cx="15.8" cy="7" r="2"/><circle cx="9.8" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',
    layers: '<path d="m12 4 8.4 4.4L12 12.8 3.6 8.4z"/><path d="m3.6 12.6 8.4 4.4 8.4-4.4M3.6 16.4 12 20.8l8.4-4.4"/>',
    bolt: '<path d="M13.2 3.4 5.4 13.2h6l-1 7.4 7.8-9.8h-6z"/>',
    globe: '<circle cx="12" cy="12" r="8.6"/><path d="M3.6 12h16.8M12 3.4c2.4 2.4 3.6 5.2 3.6 8.6s-1.2 6.2-3.6 8.6c-2.4-2.4-3.6-5.2-3.6-8.6s1.2-6.2 3.6-8.6z"/>',
    award: '<circle cx="12" cy="9.4" r="5.4"/><path d="m8.6 13.6-1.4 6.8 4.8-2.4 4.8 2.4-1.4-6.8"/>',
    refresh: '<path d="M19.4 12a7.4 7.4 0 1 1-2.2-5.2"/><path d="M19.6 4.6v4.4h-4.4"/>',
    filter: '<path d="M4.4 5.6h15.2l-6 7.2v5.4l-3.2 1.8v-7.2z"/>',
    star: '<path d="m12 4 2.4 5 5.4.7-4 3.8 1 5.4L12 16.3l-4.8 2.6 1-5.4-4-3.8 5.4-.7z"/>',
    file: '<path d="M7 3.6h7.2L19 8.4v11a1.4 1.4 0 0 1-1.4 1.4H7a1.4 1.4 0 0 1-1.4-1.4V5A1.4 1.4 0 0 1 7 3.6z"/><path d="M14 3.8v4.8h4.8M8.8 13h6.4M8.8 16.4h4.4"/>',
    play: '<circle cx="12" cy="12" r="8.6"/><path d="m10.2 8.6 5 3.4-5 3.4z"/>',
    edit: '<path d="M4.4 19.6h15.2M14.6 5.2l3 3L9 16.8l-3.6.6.6-3.6z"/>'
  };
  K.ico = function (name, cls, size) {
    var s = size || 20, p = IC[name] || IC.dots;
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>';
  };
  var ico = K.ico;

  /* ── 5. 토스트 ─────────────────────────────────────────────────────── */
  K.toast = function (msg, icon) {
    var box = $('#toast-box'); if (!box) return;
    var el = D.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status');
    el.innerHTML = ico(icon || 'check') + '<span>' + esc(msg) + '</span>';
    box.appendChild(el);
    setTimeout(function () { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320); }, 2600);
  };
  K.copy = function (text) {
    return new Promise(function (res) {
      function fallback() {
        var ta = D.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; ta.style.top = '0';
        D.body.appendChild(ta); ta.select(); try { ta.setSelectionRange(0, text.length); } catch (e) {}
        var ok = false; try { ok = D.execCommand('copy'); } catch (e) { ok = false; }
        D.body.removeChild(ta); res(ok);
      }
      try { if (navigator.clipboard && W.isSecureContext) navigator.clipboard.writeText(text).then(function () { res(true); }, fallback); else fallback(); }
      catch (e) { fallback(); }
    });
  };

  /* ── 6. 오버레이 & 스크롤 잠금 ─────────────────────────────────────────
     · 한 번에 하나만 연다(모달 위 모달 금지) → 잠금이 꼬이지 않는다
     · 화면 이동(해시 변경) 시 무조건 닫고 잠금을 풀며, 위치 복원은 하지 않는다
       (= "모달 안의 이동 버튼을 눌렀는데 스크롤이 잠긴 채 남는" 버그 원천 차단) */
  var OV = { cur: null, locked: false, y: 0, opener: null };
  function lockScroll() {
    if (OV.locked) return;
    OV.locked = true; OV.y = W.pageYOffset || D.documentElement.scrollTop || 0;
    var b = D.body; b.style.position = 'fixed'; b.style.top = (-OV.y) + 'px'; b.style.left = '0'; b.style.right = '0'; b.style.width = '100%';
  }
  function unlockScroll(restore) {
    if (!OV.locked) return;
    OV.locked = false; var b = D.body; b.style.position = ''; b.style.top = ''; b.style.left = ''; b.style.right = ''; b.style.width = '';
    if (restore !== false) W.scrollTo(0, OV.y);
  }
  K.isLocked = function () { return OV.locked || D.body.style.position === 'fixed'; };
  function showOverlay(el) {
    if (OV.cur && OV.cur !== el) hideEl(OV.cur);
    OV.opener = OV.opener || D.activeElement;
    OV.cur = el; lockScroll();
    $('#backdrop').classList.add('on');
    el.classList.add('on'); el.setAttribute('aria-hidden', 'false');
    setTimeout(function () { var f = el.querySelector('[data-autofocus]') || el.querySelector('.modal__head button, .panel__head button'); if (f) try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }, 60);
  }
  function hideEl(el) { el.classList.remove('on'); el.setAttribute('aria-hidden', 'true'); }
  K.closeAll = function (restore) {
    if (OV.cur) { hideEl(OV.cur); if (OV.cur.id === 'modal' && K._modalClose) { var f = K._modalClose; K._modalClose = null; try { f(); } catch (e) {} } }
    OV.cur = null; $('#backdrop').classList.remove('on');
    unlockScroll(restore);
    if (restore !== false && OV.opener && OV.opener.focus) { try { OV.opener.focus({ preventScroll: true }); } catch (e) {} }
    OV.opener = null;
  };
  K.openModal = function (o) {
    var m = $('#modal');
    $('#modal-title').innerHTML = o.title || '';
    var body = $('#modal-body'); body.innerHTML = o.body || ''; body.scrollTop = 0;
    m.setAttribute('aria-label', (o.title || '').replace(/<[^>]+>/g, ''));
    K._modalClose = o.onClose || null;
    showOverlay(m);
    if (o.mount) o.mount(body);
    K.gate(body);
    return body;
  };
  K.openPanel = function (id) { var p = $('#panel-' + id); if (p) showOverlay(p); return p; };
  // 포커스 가두기 + ESC
  D.addEventListener('keydown', function (e) {
    if (!OV.cur) return;
    if (e.key === 'Escape') { e.preventDefault(); K.closeAll(); return; }
    if (e.key !== 'Tab') return;
    var f = $$('a[href],button:not([disabled]),input:not([type="hidden"]):not(.hp),select,textarea,[tabindex]:not([tabindex="-1"])', OV.cur).filter(function (x) { return x.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && D.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && D.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ── 7. 액션 · 폼 레지스트리 ───────────────────────────────────────── */
  var ACT = K.ACT = {}, FORMS = K.FORMS = {};
  K.act = function (name, fn) { ACT[name] = fn; };
  K.form = function (name, fn) { FORMS[name] = fn; };
  D.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    var el = e.target.closest ? e.target.closest('[data-action]') : null;
    if (el && !el.disabled) {
      var name = el.getAttribute('data-action'), fn = ACT[name];
      if (fn) { if (el.tagName === 'A') e.preventDefault(); fn(el, e); }
      else { gateErr('미등록 액션 클릭: ' + name); if (ENV.debug) K.toast('미등록 액션: ' + name, 'x'); }
      return;
    }
    // 같은 해시를 다시 누르면 hashchange 가 안 생기므로 직접 처리 (모달 안 링크 포함)
    if (a) {
      var href = a.getAttribute('href') || '';
      if (href.indexOf('#/') === 0) {
        if (OV.cur) K.closeAll(false);
        if (href === location.hash) { e.preventDefault(); K.render(true); }
      }
    }
  });
  D.addEventListener('submit', function (e) {
    var f = e.target; var name = f.getAttribute('data-form');
    if (!name) return;
    e.preventDefault();
    if (FORMS[name]) FORMS[name](f, e); else gateErr('미등록 폼: ' + name);
  });
  K.go = function (route) {
    if (OV.cur) K.closeAll(false);
    if (location.hash === route) K.render(true); else location.hash = route;
  };
  K.act('go', function (el) { K.go(el.getAttribute('data-route') || '#/home'); });
  K.act('close', function () { K.closeAll(); });

  /* ── 8. 폼 검증 도우미 ─────────────────────────────────────────────── */
  K.validate = function (form, rules) {
    var ok = true, firstBad = null;
    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name]; if (!input) return;
      var field = input.closest('.field'); var v = (input.type === 'checkbox') ? input.checked : String(input.value || '').trim();
      var r = rules[name], msg = '';
      if (r.req && (v === '' || v === false)) msg = r.reqMsg || '필수 입력 항목입니다.';
      else if (v && r.min && String(v).length < r.min) msg = r.min + '자 이상 입력해 주세요.';
      else if (v && r.max && String(v).length > r.max) msg = r.max + '자 이내로 입력해 주세요.';
      else if (v && r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = '이메일 형식을 확인해 주세요. (예: name@example.com)';
      else if (v && r.contact && !(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || /^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(v.replace(/\s/g, '')))) msg = '이메일 또는 전화번호(010-0000-0000) 형식으로 입력해 주세요.';
      if (field) {
        field.classList.toggle('err', !!msg);
        var e = field.querySelector('.field__e'); if (e) e.textContent = msg;
      }
      if (msg) { ok = false; if (!firstBad) firstBad = input; }
    });
    if (firstBad) try { firstBad.focus(); } catch (e) {}
    if (form.elements.website && form.elements.website.value) ok = false; // 허니팟(봇 차단)
    return ok;
  };
  K.field = function (o) { // 공통 입력 필드 마크업
    var id = 'f-' + o.name + '-' + Math.random().toString(36).slice(2, 6);
    var lab = '<label class="field__l" for="' + id + '">' + esc(o.label) + (o.req ? '<em aria-hidden="true">*</em>' : '') + '</label>';
    var base = ' id="' + id + '" name="' + attr(o.name) + '"' + (o.req ? ' required aria-required="true"' : '') + (o.max ? ' maxlength="' + o.max + '"' : '') + (o.ph ? ' placeholder="' + attr(o.ph) + '"' : '') + (o.auto ? ' autocomplete="' + o.auto + '"' : '');
    var ctl;
    if (o.type === 'textarea') ctl = '<textarea class="textarea"' + base + (o.counter ? ' data-counter="1"' : '') + '>' + esc(o.value || '') + '</textarea>' + (o.counter ? '<div class="counter"><span>0</span> / ' + o.max + '</div>' : '');
    else if (o.type === 'select') ctl = '<select class="select"' + base + '>' + o.options.map(function (op) { var v = typeof op === 'string' ? op : op.v, t = typeof op === 'string' ? op : op.t; return '<option value="' + attr(v) + '"' + (String(o.value) === String(v) ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select>';
    else ctl = '<input class="input" type="' + (o.type || 'text') + '"' + base + ' value="' + attr(o.value || '') + '"' + (o.inputmode ? ' inputmode="' + o.inputmode + '"' : '') + '>';
    return '<div class="field">' + lab + ctl + (o.help ? '<div class="field__h">' + esc(o.help) + '</div>' : '') + '<div class="field__e" role="alert"></div></div>';
  };
  D.addEventListener('input', function (e) {
    var t = e.target;
    if (t.getAttribute && t.getAttribute('data-counter')) { var c = t.parentNode.querySelector('.counter span'); if (c) c.textContent = t.value.length; }
    var f = t.closest && t.closest('.field.err'); if (f) f.classList.remove('err');
  });

  /* ── 9. 라우터 ─────────────────────────────────────────────────────── */
  var ROUTES = [];
  K.route = function (pattern, view) {
    var keys = [], re = new RegExp('^' + pattern.replace(/:(\w+)/g, function (_, k) { keys.push(k); return '([^/]+)'; }) + '$');
    ROUTES.push({ pattern: pattern, re: re, keys: keys, view: view });
  };
  function parse(hash) {
    var h = (hash || '#/home').replace(/^#/, ''); if (!h || h === '/') h = '/home';
    var qi = h.indexOf('?'), qs = '', query = {};
    if (qi > -1) { qs = h.slice(qi + 1); h = h.slice(0, qi); }
    qs.split('&').forEach(function (p) { if (!p) return; var kv = p.split('='); try { query[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' ')); } catch (e) {} });
    return { path: h, query: query };
  }
  function match(path) {
    for (var i = 0; i < ROUTES.length; i++) {
      var m = path.match(ROUTES[i].re);
      if (m) { var params = {}; ROUTES[i].keys.forEach(function (k, j) { params[k] = decodeURIComponent(m[j + 1]); }); return { r: ROUTES[i], params: params }; }
    }
    return null;
  }
  K.resolves = function (href) { // 빌드 게이트용: 이 링크가 실제 화면으로 이어지는가
    var p = parse(href), m = match(p.path);
    if (!m) return false;
    if (m.r.view.exists) return !!m.r.view.exists(m.params, p.query);
    return true;
  };
  var last = { path: null };
  K.ctx = null;
  K.render = function (force) {
    if (OV.cur || OV.locked) K.closeAll(false); // 어떤 경로로 다시 그리든 열린 오버레이·스크롤 잠금을 남기지 않는다
    var p = parse(location.hash), m = match(p.path);
    var view = m ? m.r.view : K.views.notfound, params = m ? m.params : {};
    if (m && view.exists && !view.exists(params, p.query)) view = K.views.notfound;
    var ctx = { path: p.path, query: p.query, params: params, view: view };
    var samePage = last.path === p.path && !force;
    var keepY = W.pageYOffset;
    var root = $('#view');
    var html;
    try { html = view.render(ctx); }
    catch (err) { gateErr('렌더 실패: ' + p.path + ' · ' + err.message); html = K.views.error ? K.views.error.render(ctx, err) : '<div class="wrap sec"><p>화면을 그리는 중 문제가 생겼습니다.</p></div>'; if (W.console && ENV.debug) console.warn(err); }
    root.innerHTML = html;
    K.ctx = ctx;
    if (view.mount) { try { view.mount(root, ctx); } catch (err) { gateErr('마운트 실패: ' + p.path + ' · ' + err.message); } }
    // 상단 튐 제거: 같은 화면 안의 탭 전환이면 위치를 유지하고, 탭 머리가 화면 위로 지나갔을 때만 탭 바로 아래로 맞춘다
    if (samePage) {
      var tabs = root.querySelector('.tabs');
      if (tabs) {
        var hdr = $('.shell').offsetHeight, top = tabs.getBoundingClientRect().top + W.pageYOffset - hdr;
        W.scrollTo(0, keepY > top ? top : keepY);
      } else W.scrollTo(0, keepY);
    } else if (p.query.s && D.getElementById(p.query.s)) {
      var el = D.getElementById(p.query.s); setTimeout(function () { el.scrollIntoView({ block: 'start' }); }, 30);
    } else {
      W.scrollTo(0, 0);
    }
    last.path = p.path;
    // 메뉴 현재 위치 표시
    var navId = view.nav || p.path.split('/')[1] || 'home';
    $$('[data-nav]').forEach(function (a) { if (a.getAttribute('data-nav') === navId) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    var cur = $('.nav [aria-current="page"]'); if (cur && cur.scrollIntoView && W.innerWidth < 1024) { try { cur.scrollIntoView({ inline: 'center', block: 'nearest' }); } catch (e) {} }
    var t = view.title ? (typeof view.title === 'function' ? view.title(ctx) : view.title) : '';
    D.title = t ? t + ' · ' + (CFG.site.nameKo || '') + ' KAHUGO' : ((CFG.site.seo && CFG.site.seo.title) || (CFG.site.nameKo + ' KAHUGO'));
    var md = $('meta[name="description"]'); if (md && CFG.site.seo && CFG.site.seo.description) md.setAttribute('content', CFG.site.seo.description);
    if (K.afterRender) K.afterRender(root, ctx);
    K.gate(D);
  };
  W.addEventListener('hashchange', function () { if (OV.cur) K.closeAll(false); K.render(); });

  /* ── 10. 빌드 게이트 — 액션 미연결·죽은 링크·중복 id·alt 누락을 즉시 잡는다 ── */
  var GATE = K.gateState = W.__KAHUGO_GATE = { errors: [], checks: 0 };
  function gateErr(msg) { if (GATE.errors.indexOf(msg) < 0) GATE.errors.push(msg); if (ENV.debug && W.console) console.warn('[KAHUGO gate] ' + msg); }
  K.gateErr = gateErr;
  K.gate = function (root) {
    GATE.checks++;
    $$('[data-action]', root).forEach(function (el) { var n = el.getAttribute('data-action'); if (!ACT[n]) gateErr('미등록 data-action: ' + n); });
    $$('form[data-form]', root).forEach(function (f) { var n = f.getAttribute('data-form'); if (!FORMS[n]) gateErr('미등록 data-form: ' + n); });
    $$('a[href]', root).forEach(function (a) {
      var h = a.getAttribute('href');
      if (h === '#' || h === '' || /^javascript:/i.test(h)) gateErr('죽은 링크: ' + (a.textContent || '').trim().slice(0, 30));
      else if (h.indexOf('#/') === 0 && !K.resolves(h)) gateErr('연결 안 된 화면: ' + h);
      else if (/^https?:\/\//.test(h) && a.getAttribute('target') !== '_blank') gateErr('외부 링크 새 창 누락: ' + h.slice(0, 50));
    });
    $$('img', root).forEach(function (im) { if (!im.hasAttribute('alt')) gateErr('img alt 누락: ' + (im.getAttribute('src') || '').slice(-40)); });
    var seen = {}; $$('[id]').forEach(function (el) { var i = el.id; if (seen[i]) gateErr('중복 id: ' + i); seen[i] = 1; });
    $$('button', root).forEach(function (b) { if (!b.textContent.trim() && !b.getAttribute('aria-label')) gateErr('이름 없는 버튼'); });
    return GATE.errors.length === 0;
  };

  /* ── 11. 테마 · 큰 글씨 · 보기 모드 ─────────────────────────────────── */
  K.applyTheme = function (t) {
    t = t === 'light' ? 'light' : 'dark';
    D.documentElement.setAttribute('data-theme', t);
    var m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', t === 'light' ? '#ffffff' : '#060f1e');
    var b = $('.ibtn[data-id="theme"]');
    if (b) { b.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false'); b.innerHTML = ico(t === 'light' ? 'sun' : 'moon') + '<span class="ibtn__l">' + (t === 'light' ? '라이트' : '다크') + '</span>'; b.setAttribute('aria-label', t === 'light' ? '어두운 화면으로 전환' : '밝은 화면으로 전환'); }
  };
  K.act('toggle-theme', function () {
    var t = D.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    store.set('theme', t); K.applyTheme(t); K.toast(t === 'light' ? '밝은 화면으로 바꿨어요' : '어두운 화면으로 바꿨어요', t === 'light' ? 'sun' : 'moon');
  });
  K.act('toggle-big', function () {
    var on = !D.documentElement.classList.contains('big');
    D.documentElement.classList.toggle('big', on); store.set('big', on); K.closeAll(); K.toast(on ? '큰 글씨로 보여 드려요' : '기본 글씨로 돌아왔어요', 'type');
  });
  K.applyViewMode = function (m) {
    var vp = $('meta[name="viewport"]');
    if (m === 'pc') { vp.setAttribute('content', 'width=1200'); D.documentElement.classList.add('force-pc'); }
    else { vp.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover'); D.documentElement.classList.remove('force-pc'); }
  };
  K.act('toggle-viewmode', function () {
    var m = store.get('viewmode', 'auto') === 'pc' ? 'auto' : 'pc';
    store.set('viewmode', m); K.closeAll(); K.applyViewMode(m);
    K.toast(m === 'pc' ? 'PC 화면으로 보여 드려요(다시 누르면 모바일 보기)' : '기기에 맞는 화면으로 돌아왔어요', 'monitor');
  });

  /* ── 12. 앱 설치(PWA) ──────────────────────────────────────────────── */
  var deferredPrompt = null;
  W.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredPrompt = e; });
  K.act('install-app', function () {
    if (ENV.standalone) { K.closeAll(); K.toast('이미 앱으로 실행 중이에요', 'check'); return; }
    if (deferredPrompt) {
      K.closeAll(); deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (c) { K.toast(c.outcome === 'accepted' ? '홈 화면에 KAHUGO를 추가했어요' : '설치를 취소했어요', 'download'); deferredPrompt = null; });
      return;
    }
    K.openModal({ title: '홈 화면에 앱으로 추가하기', body:
      '<div class="steps">' +
      (ENV.ios
        ? '<div class="step"><span class="step__n">1</span><div><p class="step__t">사파리 하단(아이패드는 상단)의 공유 버튼</p><p class="step__d">네모에서 화살표가 위로 나온 모양을 누릅니다.</p></div></div><div class="step"><span class="step__n">2</span><div><p class="step__t">‘홈 화면에 추가’ 선택</p><p class="step__d">목록을 아래로 내리면 보입니다.</p></div></div><div class="step"><span class="step__n">3</span><div><p class="step__t">오른쪽 위 ‘추가’</p><p class="step__d">홈 화면의 KAHUGO 아이콘으로 앱처럼 열립니다.</p></div></div>'
        : '<div class="step"><span class="step__n">1</span><div><p class="step__t">브라우저 메뉴(⋮ 또는 ⋯) 열기</p><p class="step__d">크롬·삼성인터넷·엣지 모두 오른쪽 위 또는 아래에 있습니다.</p></div></div><div class="step"><span class="step__n">2</span><div><p class="step__t">‘앱 설치’ 또는 ‘홈 화면에 추가’</p><p class="step__d">PC 크롬은 주소창 오른쪽의 설치 아이콘을 눌러도 됩니다.</p></div></div>') +
      '</div><p class="note mt16">' + ico('info') + '<span>https 주소(www.kahugo.com)로 접속했을 때만 설치할 수 있습니다. 파일을 직접 열었거나 메신저 안 브라우저라면 크롬·사파리로 다시 열어 주세요.</span></p>' });
  });

  /* ── 13. 공유 — SNS·카카오톡 실제 링크 ───────────────────────────────── */
  K.shareUrl = function (hash) {
    var h = hash || location.hash || '#/home';
    var base = (ENV.http && !/^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname)) ? (location.origin + location.pathname.replace(/index\.html$/, '')) : ((CFG.site.domain || 'https://www.kahugo.com') + '/');
    return base + h;
  };
  function loadKakao() {
    return new Promise(function (res, rej) {
      var key = CFG.site.integrations && CFG.site.integrations.kakaoJsKey, src = CFG.site.integrations && CFG.site.integrations.kakaoSdkUrl;
      if (!key || !src || !ENV.http) return rej(new Error('no-key'));
      if (W.Kakao && W.Kakao.isInitialized && W.Kakao.isInitialized()) return res(W.Kakao);
      var s = D.createElement('script'); s.src = src; s.async = true; s.crossOrigin = 'anonymous';
      s.onload = function () { try { if (!W.Kakao.isInitialized()) W.Kakao.init(key); res(W.Kakao); } catch (e) { rej(e); } };
      s.onerror = function () { rej(new Error('sdk')); }; D.head.appendChild(s);
    });
  }
  K.openShare = function (o) {
    o = o || {};
    var url = o.url || K.shareUrl(o.hash), title = o.title || D.title, text = o.text || (CFG.site.tagline || '');
    var e = encodeURIComponent, u = e(url), t = e(title);
    var items = [
      { id: 'kakao', label: '카카오톡', bg: '#FEE500', fg: '#191600', g: 'K', action: 'share-kakao' },
      { id: 'fb', label: '페이스북', bg: '#1877F2', g: 'f', href: 'https://www.facebook.com/sharer/sharer.php?u=' + u },
      { id: 'x', label: 'X', bg: '#111', g: 'X', href: 'https://twitter.com/intent/tweet?url=' + u + '&text=' + t },
      { id: 'in', label: '링크드인', bg: '#0A66C2', g: 'in', href: 'https://www.linkedin.com/sharing/share-offsite/?url=' + u },
      { id: 'nblog', label: '네이버', bg: '#03C75A', g: 'N', href: 'https://share.naver.com/web/shareView?url=' + u + '&title=' + t },
      { id: 'band', label: '밴드', bg: '#06C755', g: 'B', href: 'https://band.us/plugin/share?body=' + e(title + '\n' + url) + '&route=' + e(location.hostname || 'kahugo.com') },
      { id: 'mail', label: '이메일', bg: '#5b6b83', g: '@', href: 'mailto:?subject=' + t + '&body=' + e(text + '\n' + url) },
      { id: 'copy', label: '링크 복사', bg: '#2f7df6', g: '⧉', action: 'share-copy' }
    ];
    K._share = { url: url, title: title, text: text };
    K.openModal({ title: '공유하기', body:
      '<p class="small sub" style="margin-bottom:14px">' + esc(title) + '</p>' +
      '<div class="sharegrid">' + items.map(function (it) {
        var inner = '<span class="share-i__c" style="background:' + it.bg + ';color:' + (it.fg || '#fff') + '">' + esc(it.g) + '</span>' + esc(it.label);
        return it.href ? '<a class="share-i" href="' + attr(it.href) + '" target="_blank" rel="noopener noreferrer" data-share="' + it.id + '">' + inner + '</a>'
                       : '<button type="button" class="share-i" data-action="' + it.action + '">' + inner + '</button>';
      }).join('') + '</div>' +
      (navigator.share ? '<button type="button" class="btn btn--ghost btn--block mt16" data-action="share-native">' + ico('share') + '휴대폰 공유 메뉴 열기</button>' : '') +
      '<div class="field mt16"><label class="field__l" for="share-url">공유 주소</label><input class="input" id="share-url" value="' + attr(url) + '" readonly></div>' });
  };
  K.act('share', function (el) { K.openShare({ title: el.getAttribute('data-title') || '', hash: el.getAttribute('data-hash') || '' }); });
  K.act('share-copy', function () { K.copy(K._share.url).then(function (ok) { K.toast(ok ? '링크를 복사했어요' : '주소 칸을 길게 눌러 복사해 주세요', ok ? 'copy' : 'info'); }); });
  K.act('share-native', function () {
    var s = K._share; try { navigator.share({ title: s.title, text: s.text, url: s.url }).catch(function () {}); } catch (e) {}
  });
  K.act('share-kakao', function () {
    var s = K._share;
    loadKakao().then(function (Kk) { Kk.Share.sendScrap({ requestUrl: s.url }); })
      .catch(function () {
        if (navigator.share) { try { navigator.share({ title: s.title, text: s.text, url: s.url }).catch(function () {}); } catch (e) {} K.toast('공유 메뉴에서 카카오톡을 고르세요', 'share'); }
        else K.copy(s.url).then(function () { K.toast('링크를 복사했어요. 카카오톡 대화창에 붙여넣기 하세요', 'copy'); });
      });
  });

  /* ── 14. 로그인(카카오·네이버) — 데모 동작 + 실연동(서버) 겸용 ─────────── */
  K.user = store.get('user', null);
  function authMode() { return (CFG.site.integrations && CFG.site.integrations.auth) || 'demo'; }
  K.isOAuth = function () { return K.apiOn && authMode() === 'oauth'; };
  K.refreshMe = function () {
    if (!K.isOAuth()) return Promise.resolve(K.user);
    return K.api('auth/me').then(function (j) { if (j && j.user) { K.user = j.user; store.set('user', j.user); } return K.user; }).catch(function () { return K.user; });
  };
  K.openLogin = function (reason) {
    K.openModal({ title: '3초 만에 시작하기', body:
      (reason ? '<p class="note" style="margin-bottom:14px">' + ico('info') + '<span>' + esc(reason) + '</span></p>' : '') +
      '<div class="stack">' +
      '<button type="button" class="btn btn--kakao btn--block" data-action="login" data-p="kakao"><b style="font-size:17px">K</b> 카카오로 계속하기</button>' +
      '<button type="button" class="btn btn--naver btn--block" data-action="login" data-p="naver"><b style="font-size:17px">N</b> 네이버로 계속하기</button>' +
      '<button type="button" class="btn btn--ghost btn--block" data-action="login" data-p="guest">' + ico('user') + '닉네임으로 간편 시작</button></div>' +
      '<ul class="list mt16"><li>' + ico('check') + '<span>로그인하지 않아도 대부분의 기능을 그대로 쓸 수 있어요.</span></li><li>' + ico('check') + '<span>로그인하면 저장한 항목·진단 기록·읽던 쪽이 이름과 함께 보관됩니다.</span></li>' +
      '<li>' + ico('lock') + '<span>' + (K.isOAuth() ? '카카오·네이버에서는 이름(닉네임)만 받아옵니다. 전화번호·이메일은 저장하지 않습니다.' : '현재는 데모 로그인입니다. 실제 계정 정보는 받지 않고, 입력한 이름만 이 기기에 저장됩니다.') + '</span></li></ul>' +
      '<p class="xs muted mt12">계속하면 <a class="linkbtn" href="#/terms">이용약관</a>과 <a class="linkbtn" href="#/privacy">개인정보처리방침</a>에 동의하게 됩니다.</p>' });
  };
  K.act('open-login', function () { K.openLogin(); });
  K.act('login', function (el) {
    var p = el.getAttribute('data-p');
    if (K.isOAuth() && p !== 'guest') { location.href = '/api/auth/' + p + '/start?r=' + encodeURIComponent(location.hash || '#/my'); return; }
    var label = { kakao: '카카오', naver: '네이버', guest: '닉네임' }[p];
    K.openModal({ title: label + '로 시작하기', body:
      '<form data-form="login-demo" novalidate><input type="hidden" name="p" value="' + attr(p) + '">' +
      K.field({ name: 'name', label: '화면에 보일 이름', req: true, max: 20, ph: '예: 파도읽는사람', auto: 'nickname' }) +
      '<p class="xs muted" style="margin:-4px 0 14px">' + (p === 'guest' ? '닉네임만으로 시작합니다.' : '데모 모드: 실제 ' + label + ' 계정에 연결하지 않습니다. 운영 시 관리자 설정에서 실연동으로 전환됩니다.') + '</p>' +
      '<button class="btn btn--pri btn--block" type="submit">시작하기</button></form>' });
  });
  K.form('login-demo', function (f) {
    if (!K.validate(f, { name: { req: true, max: 20 } })) return;
    var p = f.elements.p.value;
    K.user = { id: uid('u'), name: f.elements.name.value.trim(), provider: p, at: Date.now() };
    store.set('user', K.user); K.closeAll(false); K.render(true); K.toast(K.user.name + '님, 반가워요!', 'user');
  });
  K.act('logout', function () {
    var done = function () { K.user = null; store.del('user'); K.render(true); K.toast('로그아웃했어요', 'logout'); };
    if (K.isOAuth()) K.api('auth/logout', { method: 'POST' }).then(done, done); else done();
  });

  /* ── 15. 저장함(북마크) ────────────────────────────────────────────── */
  K.saved = function () { return store.get('saved', []); };
  K.isSaved = function (id) { return K.saved().some(function (s) { return s.id === id; }); };
  K.act('save', function (el) {
    var id = el.getAttribute('data-id'), list = K.saved(), i = -1;
    list.forEach(function (s, j) { if (s.id === id) i = j; });
    if (i > -1) { list.splice(i, 1); el.setAttribute('aria-pressed', 'false'); K.toast('저장함에서 뺐어요', 'bookmark'); }
    else { list.unshift({ id: id, t: el.getAttribute('data-t') || '', k: el.getAttribute('data-k') || '', r: el.getAttribute('data-r') || location.hash, at: Date.now() }); el.setAttribute('aria-pressed', 'true'); K.toast('마이 › 저장함에 담았어요', 'bookmark'); }
    store.set('saved', list.slice(0, 200));
    var lab = el.querySelector('.lab'); if (lab) lab.textContent = i > -1 ? '저장' : '저장됨';
  });
  K.saveBtn = function (id, t, k, r, withLabel) {
    var on = K.isSaved(id);
    return '<button type="button" class="' + (withLabel ? 'btn btn--ghost btn--sm' : 'iconbtn') + '" data-action="save" data-id="' + attr(id) + '" data-t="' + attr(t) + '" data-k="' + attr(k) + '" data-r="' + attr(r) + '" aria-pressed="' + on + '" aria-label="저장하기: ' + attr(t) + '">' + ico('bookmark') + (withLabel ? '<span class="lab">' + (on ? '저장됨' : '저장') + '</span>' : '') + '</button>';
  };

  /* ── 16. 알림(공지) ────────────────────────────────────────────────── */
  K.notices = function () { return (CFG.notices || []).filter(function (n) { return n.active !== false; }); };
  K.unread = function () { var r = store.get('noticeRead', []); return K.notices().filter(function (n) { return r.indexOf(n.id) < 0; }).length; };
  K.act('open-notices', function () {
    var list = K.notices(); store.set('noticeRead', list.map(function (n) { return n.id; })); K.paintDots();
    K.openModal({ title: '알림', body: list.length ? list.map(function (n) {
      return '<a class="mini" style="margin-bottom:8px;align-items:flex-start" href="' + attr(n.route || '#/home') + '"><span class="mini__ic">' + ico(n.pin ? 'flag' : 'bell') + '</span><span><span class="mini__t">' + esc(n.title) + '</span><span class="mini__d" style="display:block">' + esc(n.body || '') + '</span><span class="xs muted">' + esc(n.date || '') + '</span></span></a>';
    }).join('') : '<div class="empty">' + ico('bell') + '<p class="empty__t">새 알림이 없어요</p></div>' });
  });
  K.act('dismiss-notice', function (el) { var x = store.get('noticeX', []); x.push(el.getAttribute('data-id')); store.set('noticeX', x); var b = $('#notice-bar'); if (b) b.hidden = true; });
  K.paintDots = function () {
    var n = K.unread();
    $$('[data-dot]').forEach(function (el) { el.hidden = n === 0; });
  };

  /* ── 17. 통합 검색 ─────────────────────────────────────────────────── */
  var IDX = null;
  K.buildIndex = function () {
    var C = CFG, out = [], add = function (k, t, d, r, extra) { out.push({ k: k, t: t, d: d || '', r: r, s: (k + ' ' + t + ' ' + (d || '') + ' ' + (extra || '')).toLowerCase() }); };
    (C.research || []).forEach(function (r) { add('연구 아젠다', r.no + '. ' + r.title, r.desc, '#/research/' + r.id, (r.tags || []).join(' ') + ' ' + r.question); });
    (C.labs || []).forEach(function (l) { add('연구랩', l.ko, l.focus, '#/labs/' + l.id, l.name + ' ' + (l.themes || []).join(' ')); });
    (C.programs || []).forEach(function (p) { add('프로그램', p.name, p.lead, '#/programs?tab=' + p.id, p.desc); });
    if (C.solution) { add('AI 솔루션', C.solution.headline, C.solution.sub, '#/programs?tab=solution', '컨설팅 구축 자동화 도입'); (C.solution.packages || []).forEach(function (p) { add('AI 솔루션', p.name, p.desc, '#/programs?tab=solution', p.outputs.join(' ')); }); }
    (C.publications || []).forEach(function (p) { add('출판·리포트', p.title, p.desc, '#/publications'); });
    ((C.futures || {}).items || []).forEach(function (f) { add('미래예측 ' + f.no, f.t, f.lead, '#/futures?tab=predict&id=' + f.id, f.sub); });
    ((C.lexicon || {}).terms || []).forEach(function (t) { add('키워드', t.k, t.d, '#/futures?tab=keywords&q=' + encodeURIComponent(t.k)); });
    ((C.opps || {}).items || []).forEach(function (o) { add('사업 기회', o.n + '. ' + o.k, o.d, '#/futures?tab=opps'); });
    ((C.newsletter || {}).issues || []).forEach(function (i) { add('파도 편지 ' + i.no + '호', i.t, i.hook, '#/publications?tab=newsletter'); });
    (C.books || []).forEach(function (b) {
      add('도서', b.title, b.subtitle, '#/wave/' + b.id, b.deck);
      (b.toc || []).forEach(function (t) { if (t.lv !== 'etc' || t.p) add('목차', t.t, (t.p ? t.p + '쪽' : '') + (t.p && t.p <= b.previewPages ? ' · 미리보기에서 읽기' : ''), t.p && t.p <= b.previewPages ? '#/wave/' + b.id + '/read?p=' + t.p : '#/wave/' + b.id + '?tab=toc'); });
    });
    (C.faq || []).forEach(function (f) { add('자주 묻는 질문', f.q, f.a, '#/about?tab=guide'); });
    (C.glossary || []).forEach(function (g) { add('용어', g.term, g.def, '#/about?tab=guide'); });
    (C.events || []).forEach(function (e) { add('일정', e.title, e.kind + ' · ' + e.place, '#/community?tab=events'); });
    add('연구원 소개', '10대 창립선언', '우리가 지키는 열 가지 약속', '#/about?tab=declaration');
    add('연구원 소개', '설립·운영 로드맵', '0~6개월, 6~18개월, 18개월 이후', '#/about?tab=roadmap');
    add('진단', '조직 AI 준비도 진단', '15문항 · 5축 · 3분', '#/diagnose');
    add('진단', '1분 생존 진단', '10문항 · 책 13쪽', '#/wave/sapiens?tab=diag');
    add('시뮬레이터', 'AI 전환 로드맵 시뮬레이터', '모듈을 고르면 3단계 계획', '#/simulator');
    add('시뮬레이터', '나만의 미래 시나리오', '관심 분야 → 예측 · 이번 주 할 일', '#/futures?tab=scenario');
    add('문의', '협력·상담 문의', CFG.site.email, '#/contact');
    IDX = out; return out;
  };
  K.search = function (q) {
    if (!IDX) K.buildIndex();
    var terms = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return IDX.filter(function (it) { return terms.every(function (t) { return it.s.indexOf(t) > -1; }); })
      .sort(function (a, b) { var at = a.t.toLowerCase().indexOf(terms[0]) > -1 ? 0 : 1, bt = b.t.toLowerCase().indexOf(terms[0]) > -1 ? 0 : 1; return at - bt; }).slice(0, 40);
  };
  function hl(s, q) {
    var out = esc(s); String(q || '').split(/\s+/).filter(Boolean).forEach(function (t) {
      try { out = out.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>'); } catch (e) {}
    }); return out;
  }
  K.hl = hl;
  function paintSearch(q) {
    var res = $('#search-results'), def = $('#search-default');
    if (!q) { res.innerHTML = ''; def.hidden = false; return; }
    def.hidden = true;
    var r = K.search(q);
    res.innerHTML = r.length ? '<p class="xs muted" style="margin-bottom:8px">' + r.length + '건</p>' + r.map(function (it) {
      return '<a class="sres" href="' + attr(it.r) + '"><span class="sres__k">' + esc(it.k) + '</span><span class="sres__t" style="display:block">' + hl(it.t, q) + '</span><span class="sres__d" style="display:block">' + hl(it.d.slice(0, 90), q) + '</span></a>';
    }).join('') : '<div class="empty">' + ico('search') + '<p class="empty__t">‘' + esc(q) + '’에 맞는 결과가 없어요</p><p class="small mt8">다른 낱말로 찾아보거나, 챗봇에게 물어보세요.</p><button type="button" class="btn btn--soft btn--sm mt12" data-action="open-chat">챗봇에게 묻기</button></div>';
    K.gate(res);
  }
  K.act('open-search', function () {
    var p = K.openPanel('search');
    var rec = store.get('recentQ', []);
    $('#search-default').innerHTML = '<p class="foot__h">많이 찾는 주제</p><div class="chips">' +
      ['AI 솔루션', '미래예측', '58쪽', '진단', '리더십', '교육', '데이터', '포럼', '거버넌스', '사업 기회'].map(function (w) { return '<button type="button" class="chip" data-action="search-chip" data-q="' + attr(w) + '">' + esc(w) + '</button>'; }).join('') + '</div>' +
      (rec.length ? '<p class="foot__h mt24">최근 검색</p><div class="chips">' + rec.map(function (w) { return '<button type="button" class="chip" data-action="search-chip" data-q="' + attr(w) + '">' + ico('clock', 'ico--sm') + esc(w) + '</button>'; }).join('') + '</div>' : '');
    var inp = $('#search-input'); inp.value = ''; paintSearch('');
    setTimeout(function () { try { inp.focus(); } catch (e) {} }, 80);
    K.gate(p);
  });
  K.act('search-chip', function (el) { var inp = $('#search-input'); inp.value = el.getAttribute('data-q'); paintSearch(inp.value); });
  var sT = null;
  D.addEventListener('input', function (e) {
    if (e.target.id !== 'search-input') return;
    clearTimeout(sT); var v = e.target.value.trim();
    sT = setTimeout(function () { paintSearch(v); if (v.length > 1) { var rec = store.get('recentQ', []).filter(function (x) { return x !== v; }); rec.unshift(v); store.set('recentQ', rec.slice(0, 6)); } }, 160);
  });

  /* ── 18. 챗봇(규칙 기반 가이드) ─────────────────────────────────────── */
  var chatLog = store.get('chat', []);
  function bubble(m) {
    if (m.me) return '<div class="bubble bubble--me">' + esc(m.t) + '</div>';
    return '<div class="bubble bubble--bot">' + esc(m.t).replace(/\n/g, '<br>') + (m.ctas && m.ctas.length ? '<div class="btn-row">' + m.ctas.map(function (c) { return '<a class="btn btn--soft btn--sm" href="' + attr(c.route) + '">' + esc(c.label) + '</a>'; }).join('') + '</div>' : '') + '</div>';
  }
  function paintChat() {
    var log = $('#chat-log'); if (!log) return;
    log.innerHTML = chatLog.map(bubble).join('');
    var body = log.parentNode; body.scrollTop = body.scrollHeight;
    K.gate(log);
  }
  K.answer = function (q) {
    var s = String(q).toLowerCase(), best = null, score = 0;
    (CFG.chat.intents || []).forEach(function (it) {
      var sc = 0; (it.keys || []).forEach(function (k) { if (s.indexOf(String(k).toLowerCase()) > -1) sc += String(k).length > 2 ? 2 : 1; });
      if (it.chip && s.indexOf(it.chip.toLowerCase()) > -1) sc += 3;
      if (sc > score) { score = sc; best = it; }
    });
    if (best && score > 0) { var seenR = {}; return { t: best.answer, ctas: (best.ctas || []).filter(function (c) { if (seenR[c.route] || !K.resolves(c.route)) return false; seenR[c.route] = 1; return true; }) }; }
    var r = K.search(q).slice(0, 3);
    if (r.length) return { t: '사이트 안에서 이런 내용을 찾았어요. 눌러서 바로 확인해 보세요.', ctas: r.map(function (x) { return { label: x.t.slice(0, 22), route: x.r }; }) };
    return { t: CFG.chat.fallback, ctas: [{ label: '협력·문의하기', route: '#/contact' }, { label: '자주 묻는 질문', route: '#/about?tab=guide' }] };
  };
  K.act('open-chat', function () {
    var p = K.openPanel('chat');
    if (!chatLog.length) chatLog.push({ t: '안녕하세요, KAHUGO 가이드예요. 연구·프로그램·AI 솔루션·신간 미리보기까지, 궁금한 걸 물어보시면 바로 그 화면으로 안내해 드릴게요.', ctas: [] });
    $('#chat-chips').innerHTML = (CFG.chat.intents || []).slice(0, 12).map(function (it) { return '<button type="button" class="chip" data-action="chat-chip" data-q="' + attr(it.chip) + '">' + esc(it.chip) + '</button>'; }).join('');
    $('#chat-disc').textContent = CFG.chat.disclaimer || '';
    paintChat(); K.gate(p);
    setTimeout(function () { try { $('#chat-input').focus({ preventScroll: true }); } catch (e) {} }, 120);
  });
  function ask(q) {
    q = String(q || '').trim(); if (!q) return;
    chatLog.push({ me: true, t: q }); paintChat();
    var log = $('#chat-log'); log.insertAdjacentHTML('beforeend', '<div class="bubble bubble--bot" id="typing"><span class="typing"><i></i><i></i><i></i></span></div>');
    log.parentNode.scrollTop = log.parentNode.scrollHeight;
    setTimeout(function () { var a = K.answer(q); chatLog.push(a); chatLog = chatLog.slice(-40); store.set('chat', chatLog); paintChat(); }, 420);
  }
  K.act('chat-chip', function (el) { ask(el.getAttribute('data-q')); });
  K.act('chat-clear', function () { chatLog = []; store.del('chat'); K.ACT['open-chat'](); });
  K.form('chat', function (f) { var v = f.elements.q.value; f.elements.q.value = ''; ask(v); });

  /* ── 19. 더보기 시트 ───────────────────────────────────────────────── */
  K.act('open-more', function () {
    var items = CFG.moreMenu || [];
    K.openModal({ title: '더보기', body:
      (K.user ? '<div class="mini" style="margin-bottom:12px"><span class="avatar">' + esc(K.user.name.slice(0, 1)) + '</span><span><span class="mini__t">' + esc(K.user.name) + '님</span><span class="mini__d" style="display:block">' + esc({ kakao: '카카오', naver: '네이버', guest: '닉네임' }[K.user.provider] || '') + ' 로그인</span></span><button type="button" class="btn btn--ghost btn--sm mini__go" data-action="logout">로그아웃</button></div>'
              : '<button type="button" class="btn btn--pri btn--block" style="margin-bottom:12px" data-action="open-login">' + ico('user') + '로그인 · 회원가입</button>') +
      '<div class="morelist">' + items.map(function (it) {
        var inner = '<span class="mini__ic">' + ico(it.icon) + '</span><span class="mini__t">' + esc(it.label) + '</span>' + (it.id === 'notice' ? '<span class="dot" data-dot hidden style="position:static;margin-left:auto"></span>' : '');
        return it.route ? '<a class="mini" href="' + attr(it.route) + '">' + inner + '</a>' : '<button type="button" class="mini" data-action="' + attr(it.action) + '">' + inner + '</button>';
      }).join('') + '</div>' +
      '<p class="xs muted mt16">버전 ' + esc(CFG.site.version || K.version) + ' · ' + (K.apiOn ? '실시간 연결됨' : '정적 배포 모드') + '</p>',
      mount: function () { K.paintDots(); } });
  });

  /* ── 20. 커뮤니티 · 문의 · 구독 데이터 계층 ─────────────────────────── */
  var DATA = K.data = {};
  DATA.localPosts = function () { return store.get('posts', []); };
  DATA.serverPosts = [];
  DATA.allPosts = function () {
    var seed = (CFG.posts || []).map(function (p) { return Object.assign({ src: 'seed' }, p); });
    var srv = DATA.serverPosts.map(function (p) { return Object.assign({ src: 'server' }, p); });
    var loc = DATA.localPosts().map(function (p) { return Object.assign({ src: 'local' }, p); });
    var hidden = store.get('hiddenPosts', []);
    return loc.concat(srv, seed).filter(function (p) { return hidden.indexOf(p.id) < 0; });
  };
  DATA.post = function (id) { return DATA.allPosts().filter(function (p) { return p.id === id; })[0] || null; };
  DATA.loadServer = function () {
    if (!K.dbOn) return Promise.resolve([]);
    return K.api('community/posts').then(function (j) { DATA.serverPosts = (j && j.posts) || []; return DATA.serverPosts; }).catch(function () { return []; });
  };
  DATA.replies = function (id) { var r = store.get('replies', {}); return r[id] || []; };
  DATA.liked = function (id) { return !!store.get('likes', {})[id]; };
  DATA.likeCount = function (p) { return (p.likes || 0) + (DATA.liked(p.id) && p.src !== 'server' ? 1 : 0); };
  DATA.addPost = function (p) {
    if (K.dbOn) return K.api('community/posts', { method: 'POST', body: p }).then(function (j) { DATA.serverPosts.unshift(j.post); return j.post; });
    var list = DATA.localPosts(); list.unshift(p); store.set('posts', list.slice(0, 100)); return Promise.resolve(p);
  };
  DATA.addReply = function (id, r, src) {
    if (K.dbOn && src === 'server') return K.api('community/comment', { method: 'POST', body: { postId: id, author: r.author, body: r.body } }).then(function (j) { return j.reply; });
    var all = store.get('replies', {}); (all[id] = all[id] || []).push(r); store.set('replies', all); return Promise.resolve(r);
  };
  DATA.toggleLike = function (p) {
    var l = store.get('likes', {}); var on = !l[p.id]; if (on) l[p.id] = 1; else delete l[p.id]; store.set('likes', l);
    if (K.dbOn && p.src === 'server') K.api('community/like', { method: 'POST', body: { postId: p.id, on: on } }).then(function (j) { p.likes = j.likes; }).catch(function () {});
    return on;
  };
  DATA.sendInquiry = function (q) {
    var list = store.get('inquiries', []); list.unshift(q); store.set('inquiries', list.slice(0, 50));
    if (K.dbOn) return K.api('inquiry', { method: 'POST', body: q }).then(function () { return 'server'; }).catch(function () { return 'local'; });
    return Promise.resolve('local');
  };
  DATA.subscribe = function (s) {
    store.set('subscribed', s);
    if (K.dbOn) return K.api('subscribe', { method: 'POST', body: s }).then(function () { return 'server'; }).catch(function () { return 'local'; });
    return Promise.resolve('local');
  };
  K.mailto = function (subject, body) {
    return 'mailto:' + (CFG.site.email || 'habibot@naver.com') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  };
  // 짧은 시간 안 연속 등록 제한(서버 과부하·도배 방지 — 서버에도 같은 규칙이 있음)
  K.rateOk = function (key, sec) {
    var t = store.get('rate:' + key, 0); if (Date.now() - t < sec * 1000) return false; store.set('rate:' + key, Date.now()); return true;
  };

  /* ── 21. 셸 그리기(헤더 메뉴 · 하단 탭 · 푸터) ─────────────────────── */
  K.paintShell = function () {
    var C = CFG;
    $('#iconbar').innerHTML = (C.iconbar || []).map(function (b) {
      var attrs = b.action === 'go' ? ' data-action="go" data-route="' + attr(b.route) + '"' : ' data-action="' + attr(b.action) + '"';
      return '<button type="button" class="ibtn" data-id="' + attr(b.id) + '"' + attrs + ' aria-label="' + attr(b.label) + '">' + ico(b.icon) + '<span class="ibtn__l">' + esc(b.label) + '</span>' + (b.id === 'more' ? '<span class="dot" data-dot hidden></span>' : '') + '</button>';
    }).join('');
    $('#nav').innerHTML = (C.nav || []).map(function (n) {
      return '<a class="nav__a" href="' + attr(n.route) + '" data-nav="' + attr(n.id) + '" title="' + attr(n.full || n.label) + '">' + ico(n.icon) + '<span>' + esc(n.label) + '</span></a>';
    }).join('');
    $('#tabbar').innerHTML = (C.bottomNav || []).map(function (n) {
      return '<a class="tabbar__a" href="' + attr(n.route) + '" data-nav="' + attr(n.id) + '">' + ico(n.icon) + '<span>' + esc(n.label) + '</span>' + (n.id === 'my' ? '<span class="dot" data-dot hidden></span>' : '') + '</a>';
    }).join('');
    $('#tabbar').style.gridTemplateColumns = 'repeat(' + Math.max(1, (C.bottomNav || []).length) + ', 1fr)';
    var nb = $('#notice-bar'), pin = K.notices().filter(function (n) { return n.pin && store.get('noticeX', []).indexOf(n.id) < 0; })[0];
    if (nb) { if (pin) { nb.hidden = false; nb.innerHTML = '<div class="notice-bar__in">' + ico('flag', 'ico--sm') + '<a href="' + attr(pin.route || '#/home') + '">' + esc(pin.title) + '</a><button type="button" class="notice-bar__x" data-action="dismiss-notice" data-id="' + attr(pin.id) + '" aria-label="공지 닫기">' + ico('x', 'ico--sm') + '</button></div>'; } else nb.hidden = true; }
    var s = C.site;
    $('#foot').innerHTML = '<div class="wrap"><div class="foot__grid">' +
      '<div><div class="foot__brand"><img src="assets/img/kahugo-mark.svg" alt="" width="36" height="36"><div><b style="color:var(--ink)">' + esc(s.nameKo) + '</b><div class="xs" style="letter-spacing:.08em">' + esc(s.abbr) + ' · ' + esc(s.nameEn) + '</div></div></div>' +
      '<p class="small mt12">' + esc(s.tagline) + '</p><p class="small mt8">' + ico('mail', 'ico--sm') + ' <a href="mailto:' + attr(s.email) + '">' + esc(s.email) + '</a></p></div>' +
      '<div><p class="foot__h">메뉴</p><div class="foot__links">' + (C.nav || []).map(function (n) { return '<a href="' + attr(n.route) + '">' + esc(n.label) + '</a>'; }).join('') + '</div></div>' +
      '<div><p class="foot__h">바로가기</p><div class="foot__links" style="grid-template-columns:1fr 1fr">' +
      '<a href="#/contact">협력·문의</a><a href="#/programs?tab=solution">AI 솔루션</a><a href="#/wave/sapiens/read">58쪽 미리보기</a><a href="#/diagnose">조직 진단</a><a href="#/about?tab=guide">이용안내</a><a href="#/my">마이</a></div></div>' +
      '</div><div class="foot__legal"><p>' + esc(s.disclaimer || '') + '</p><p class="mt8">화면의 전문가·기관·사례·게시글 중 ‘설계 예시’ 표시가 붙은 항목은 서비스 구조를 보여 주기 위한 예시이며 실존 인물·기관·실적이 아닙니다. 로고·아이콘·도식은 자체 제작 원본입니다.</p>' +
      '<p class="mt8"><a href="#/terms">이용약관</a> · <a href="#/privacy">개인정보처리방침</a> · <a href="#/about?tab=guide">이용안내</a></p><p class="mt8">' + esc(s.footerNote) + '</p></div></div>';
    K.applyTheme(D.documentElement.getAttribute('data-theme'));
    K.paintDots();
  };

  /* ── 22. 스크롤 연동(스티키 CTA · 등장 애니메이션) ──────────────────── */
  var io = null;
  K.reveal = function (root) {
    var els = $$('.reveal', root);
    if (!('IntersectionObserver' in W)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    if (!io) io = new IntersectionObserver(function (ents) { ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
  };
  var ctaCfg = null;
  K.setStickyCta = function (o) {
    ctaCfg = o; var el = $('#stickycta');
    if (!o || store.get('ctaX:' + o.id)) { el.classList.remove('on'); el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = '<span class="stickycta__t">' + esc(o.t) + '</span><a class="btn btn--pri btn--sm" href="' + attr(o.route) + '">' + esc(o.label) + '</a><button type="button" class="stickycta__x" data-action="cta-x" aria-label="안내 닫기">' + ico('x', 'ico--sm') + '</button>';
    onScroll();
  };
  K.act('cta-x', function () { if (ctaCfg) store.set('ctaX:' + ctaCfg.id, 1); K.setStickyCta(null); });
  function onScroll() {
    var el = $('#stickycta'); if (!el || el.hidden || !ctaCfg) return;
    var y = W.pageYOffset, nearEnd = (W.innerHeight + y) > (D.documentElement.scrollHeight - 260);
    el.classList.toggle('on', y > 380 && !nearEnd && !OV.locked);
  }
  W.addEventListener('scroll', onScroll, { passive: true });

  // 늦게 도착한 설정·서버 글을 반영하되, 이용자가 보던 위치와 열어 둔 창은 건드리지 않는다
  var pendingSoft = false;
  K.softRefresh = function (shell) {
    if (OV.cur) { pendingSoft = true; return; }
    IDX = null; if (shell) K.paintShell();
    var y = W.pageYOffset; K.render(true); W.scrollTo(0, y);
  };
  var _close = K.closeAll;
  K.closeAll = function (restore) { _close(restore); if (pendingSoft) { pendingSoft = false; setTimeout(function () { K.softRefresh(true); }, 0); } };

  /* ── 23. 부팅 ──────────────────────────────────────────────────────── */
  K.boot = function () {
    K.applyTheme(store.get('theme', 'dark'));
    if (store.get('big', false)) D.documentElement.classList.add('big');
    if (store.get('viewmode', 'auto') === 'pc') K.applyViewMode('pc');
    if (!ENV.http) { var w = $('#envwarn'); if (w) { w.hidden = false; } }
    K.paintShell();
    K.render(true);
    K.booted = true; D.documentElement.classList.add('booted');
    // 배포 설정·실시간 서버 설정을 늦게 받아도 화면이 깨지지 않게 다시 그린다
    K.loadRemoteConfig().then(function (changed) {
      return Promise.all([K.refreshMe(), DATA.loadServer()]).then(function (r) {
        var gotPosts = r[1] && r[1].length;
        if (changed || gotPosts || (K.user && K.isOAuth())) K.softRefresh(changed);
      });
    }).catch(function () {});
    // 관리자 즉시 미리보기: 초안이 바뀌면 바로 반영
    if (ENV.preview) {
      W.addEventListener('storage', function (e) { if (e.key === 'kahugo9:admin:draft') { CFG = K.cfg = clone(DEF); loadDraft(); IDX = null; K.paintShell(); K.render(true); } });
      W.addEventListener('message', function (e) { if (e.origin !== location.origin || !e.data || e.data.type !== 'kahugo-preview') return; CFG = K.cfg = clone(DEF); applyOverride(e.data.cfg); IDX = null; K.paintShell(); K.render(true); });
    }
    // 서비스워커(앱 설치·오프라인) — http(s)에서만. content://·file:// 에서는 등록하지 않는다
    if (ENV.http && 'serviceWorker' in navigator && !ENV.preview && !W.KAHUGO_STANDALONE) {
      W.addEventListener('load', function () { try { navigator.serviceWorker.register('sw.js').catch(function () {}); } catch (e) {} });
    }
  };
})(window, document);
