/* ==========================================================================
   KAHUGO 9차 · 화면(뷰)
   홈 / 연구 / 연구랩 / 프로그램(AI 솔루션·전략컨설팅 포함) / 출판·리포트 /
   제5의물결(도서 시리즈·58쪽 리더) / 미래예측 / 커뮤니티 / 연구원소개 /
   진단 · 시뮬레이터 · 협력문의 · 마이 · 약관 · 개인정보 · 404
   ========================================================================== */
(function (W, D) {
  'use strict';
  var K = W.KAHUGO, U = K.u, esc = U.esc, attr = U.attr, ico = K.ico, store = K.store;
  var C = function () { return K.cfg; };
  var V = K.views = {};

  /* ── 공통 조각 ─────────────────────────────────────────────────────── */
  function secH(eyebrow, title, lead, right) {
    return '<div class="sec-h' + (right ? ' row row--between' : '') + '"><div>' + (eyebrow ? '<p class="eyebrow">' + esc(eyebrow) + '</p>' : '') +
      '<h2 class="h2">' + title + '</h2>' + (lead ? '<p class="lead">' + lead + '</p>' : '') + '</div>' + (right || '') + '</div>';
  }
  function phead(crumbs, title, lead, extra) {
    return '<header class="phead"><div class="wrap">' +
      '<nav class="crumb" aria-label="현재 위치"><a href="#/home">홈</a>' + crumbs.map(function (c) { return ico('chev', 'ico--sm') + (c[1] ? '<a href="' + attr(c[1]) + '">' + esc(c[0]) + '</a>' : '<span>' + esc(c[0]) + '</span>'); }).join('') + '</nav>' +
      '<h1 class="h1">' + title + '</h1>' + (lead ? '<p class="lead">' + lead + '</p>' : '') + (extra || '') + '</div></header>';
  }
  function tabs(base, items, active) {
    return '<div class="tabs"><div class="tabs__in" role="tablist">' + items.map(function (t) {
      var on = t.id === active, sep = base.indexOf('?') > -1 ? '&' : '?';
      return '<a class="tab" role="tab" href="' + attr(base + sep + 'tab=' + t.id) + '" aria-selected="' + on + '">' + (t.icon ? ico(t.icon, 'ico--sm') : '') + esc(t.label) + (t.n != null ? '<span class="n">' + t.n + '</span>' : '') + '</a>';
    }).join('') + '</div></div>';
  }
  function pickTab(q, items) { var t = q.tab; return items.some(function (i) { return i.id === t; }) ? t : items[0].id; }
  var sample = function (it) { return it && it.sample ? '<span class="badge badge--sample">설계 예시</span>' : ''; };
  var STATUS = { planned: ['개설 예정', 'badge--brand'], proposed: ['제안 단계', 'badge--gold'], open: ['운영 중', 'badge--ok'], published: ['출간', 'badge--ok'], upcoming: ['출간 예정', 'badge--gold'], active: ['진행 중', 'badge--ok'], '모집중': ['모집 중', 'badge--ok'], '협의': ['협의 중', 'badge--gold'] };
  var status = function (s) { var x = STATUS[s]; return x ? '<span class="badge ' + x[1] + '">' + x[0] + '</span>' : (s ? '<span class="badge">' + esc(s) + '</span>' : ''); };
  var catName = function (id) { var c = (C().categories || []).filter(function (x) { return x.id === id; })[0]; return c ? c.ko : ''; };
  var byId = function (arr, id) { return (arr || []).filter(function (x) { return x.id === id; })[0]; };
  var book = function (id) { return byId(C().books, id); };
  function chapLink(b, n) { // 장 번호 → 미리보기(58쪽 이내) 또는 목차
    var t = (b.toc || []).filter(function (x) { return x.lv === 'ch' && x.no === n; })[0]; if (!t) return '';
    var inPv = t.p && t.p <= b.previewPages;
    return '<a class="mini" href="#/wave/' + b.id + (inPv ? '/read?p=' + t.p : '?tab=toc') + '"><span class="mini__ic">' + ico('book') + '</span><span><span class="mini__t">' + esc(t.t) + '</span><span class="mini__d" style="display:block">' + (inPv ? '미리보기에서 바로 읽기 · ' + t.p + '쪽' : '도서 ' + (t.p || '') + '쪽 · 목차 보기') + '</span></span>' + ico('chev', 'mini__go') + '</a>';
  }
  function ctaBand(title, sub, btns) {
    return '<section class="sec"><div class="wrap"><div class="card card--glow" style="padding:22px">' +
      '<h2 class="h3">' + esc(title) + '</h2>' + (sub ? '<p class="small sub mt8">' + esc(sub) + '</p>' : '') +
      '<div class="btn-row mt16">' + btns.join('') + '</div></div></div></section>';
  }
  var aBtn = function (label, href, cls, icon) { return '<a class="btn ' + (cls || 'btn--pri') + '" href="' + attr(href) + '">' + (icon ? ico(icon) : '') + esc(label) + '</a>'; };
  var shareBtn = function (title, hash, label) { return '<button type="button" class="' + (label ? 'btn btn--ghost btn--sm' : 'iconbtn') + '" data-action="share" data-title="' + attr(title) + '" data-hash="' + attr(hash || '') + '" aria-label="공유하기">' + ico('share') + (label ? esc(label) : '') + '</button>'; };
  var wavesSvg = '<svg class="hero__waves" viewBox="0 0 1200 90" preserveAspectRatio="none" width="1200" height="90" aria-hidden="true"><path d="M0 40 Q75 10 150 40 T300 40 T450 40 T600 40 T750 40 T900 40 T1050 40 T1200 40" fill="none" stroke="url(#hw1)" stroke-width="2.4"/><path d="M0 62 Q75 36 150 62 T300 62 T450 62 T600 62 T750 62 T900 62 T1050 62 T1200 62" fill="none" stroke="url(#hw2)" stroke-width="1.8" opacity=".7"/><defs><linearGradient id="hw1" x1="0" x2="1"><stop offset="0" stop-color="#2f7df6" stop-opacity="0"/><stop offset=".5" stop-color="#2f7df6"/><stop offset="1" stop-color="#19c3dc" stop-opacity="0"/></linearGradient><linearGradient id="hw2" x1="0" x2="1"><stop offset="0" stop-color="#19c3dc" stop-opacity="0"/><stop offset=".5" stop-color="#19c3dc"/><stop offset="1" stop-color="#2f7df6" stop-opacity="0"/></linearGradient></defs></svg>';

  /* ══════════════════════ 홈 ══════════════════════ */
  V.home = { nav: 'home', title: '',
    render: function () {
      var c = C(), s = c.site, b = c.books[0], fu = c.futures.items, lx = c.lexicon.terms;
      var day = Math.floor(Date.now() / 864e5), term = lx[day % lx.length];
      var rp = store.get('read:' + b.id, null);
      var roles = [
        { ic: 'user', t: '내 일의 다음 칸이 궁금하다면', d: '10문항 1분 생존 진단으로 지금 서 있는 자리부터 찍어 보세요.', r: '#/wave/sapiens?tab=diag', k: '개인' },
        { ic: 'building', t: '조직에 AI를 제대로 들이려면', d: '15문항 준비도 진단 → AI 솔루션 구축·전략컨설팅 상담으로 이어집니다.', r: '#/programs?tab=solution', k: '기업·기관', cls: 'card__ic--cyan' },
        { ic: 'hand', t: '함께 연구하고 강연하려면', d: '6대 연구랩의 공동연구, 포럼·아카데미 협력을 제안하세요.', r: '#/labs', k: '연구·교육 파트너', cls: 'card__ic--gold' },
        { ic: 'book', t: '제5의 물결을 읽고 싶다면', d: '신간 58쪽을 무료로 읽고, 독자들과 한 문장을 나눕니다.', r: '#/wave', k: '독자' }
      ];
      return '' +
      '<section class="hero">' + wavesSvg + '<div class="wrap hero__grid" style="position:relative"><div>' +
        '<span class="hero__badge"><i></i>' + esc(s.heroBadge) + '</span>' +
        '<h1>' + esc(s.heroLine1) + ' <span class="l2 grad-t">' + esc(s.heroLine2) + '</span></h1>' +
        '<p class="hero__sub">' + esc(s.heroSub) + '</p>' +
        '<div class="hero__cta">' + aBtn(s.heroCta1.label, s.heroCta1.route, 'btn--pri', 'target') + aBtn(s.heroCta2.label, s.heroCta2.route, 'btn--ghost', 'book') + '</div>' +
        '<div class="hero__chips">' + (s.trustChips || []).map(function (t) { return '<span>' + ico('check') + esc(t) + '</span>'; }).join('') + '</div></div>' +
        '<aside class="hero__aside" aria-label="바로 시작"><div class="card card--feat" style="padding:18px"><div style="display:grid;grid-template-columns:96px 1fr;gap:14px;align-items:center"><a class="cover" href="#/wave/' + b.id + '" aria-label="도서 소개"><img src="' + attr(b.coverThumb) + '" alt="『' + attr(b.title) + '』 표지" width="360" height="522"></a><div><p class="xs muted">신간 · ' + esc(b.series) + '</p><p class="card__t">『' + esc(b.title) + '』</p><p class="xs sub mt8">' + b.previewPages + '쪽 무료 미리보기</p></div></div>' +
        '<div class="stack mt16"><a class="mini" href="#/programs?tab=solution"><span class="mini__ic">' + ico('bolt') + '</span><span><span class="mini__t">AI 솔루션·전략컨설팅</span><span class="mini__d" style="display:block">진단 → 설계 → 구축 → 정착</span></span>' + ico('chev', 'mini__go') + '</a><a class="mini" href="#/futures"><span class="mini__ic">' + ico('spark') + '</span><span><span class="mini__t">미래예측 18</span><span class="mini__d" style="display:block">기회·위협·양면</span></span>' + ico('chev', 'mini__go') + '</a><a class="mini" href="#/diagnose"><span class="mini__ic">' + ico('target') + '</span><span><span class="mini__t">조직 AI 준비도 진단</span><span class="mini__d" style="display:block">15문항 · 3분</span></span>' + ico('chev', 'mini__go') + '</a></div></div></aside>' +
      '</div></div></section>' +

      '<section class="sec"><div class="wrap">' + secH('어디서부터 시작할까요', '지금 나에게 맞는 입구 하나만 고르세요') +
        '<div class="grid grid--2">' + roles.map(function (r) {
          return '<a class="card rolecard reveal" href="' + attr(r.r) + '"><span class="card__ic ' + (r.cls || '') + '">' + ico(r.ic) + '</span><span><span class="badge badge--brand">' + esc(r.k) + '</span><span class="card__t" style="display:block;margin-top:6px">' + esc(r.t) + '</span><span class="card__d" style="display:block">' + esc(r.d) + '</span></span></a>';
        }).join('') + '</div>' +
        '<p class="bridge mt16">입구를 골랐다면, 그다음은 읽을거리입니다.</p></div></section>' +

      '<section class="sec sec--alt"><div class="wrap"><div class="split">' +
        '<div><p class="eyebrow">' + esc(b.series) + ' · 신간</p><h2 class="h2">『' + esc(b.title) + '』</h2><p class="lead">' + esc(b.subtitle) + '</p>' +
        '<p class="quote mt16" style="white-space:pre-line">' + esc(b.hook) + '</p>' +
        (rp && rp.p ? '<div class="mini mt16"><span class="mini__ic">' + ico('bookmark') + '</span><span style="flex:1"><span class="mini__t">' + rp.p + '쪽까지 읽었어요</span><span class="progress mt8" style="display:block"><i style="width:' + Math.round(rp.p / b.previewPages * 100) + '%"></i></span></span></div>' : '') +
        '<div class="btn-row mt16">' + aBtn(rp && rp.p ? rp.p + '쪽부터 이어 읽기' : '58쪽 무료로 읽기', '#/wave/' + b.id + '/read' + (rp && rp.p ? '?p=' + rp.p : ''), 'btn--pri', 'book') + aBtn('도서 소개·목차', '#/wave/' + b.id, 'btn--ghost') + '</div></div>' +
        '<div class="bookhero mt24" style="grid-template-columns:120px 1fr"><a class="cover" href="#/wave/' + b.id + '" aria-label="도서 소개 보기"><img src="' + attr(b.coverThumb) + '" alt="『' + attr(b.title) + '』 표지" width="360" height="522" loading="lazy"></a>' +
        '<ul class="list">' + b.contains.slice(0, 4).map(function (x) { return '<li>' + ico('check') + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul></div>' +
      '</div></div></section>' +

      '<section class="sec"><div class="wrap">' + secH('미래예측 18', '기회와 위협이 함께 오는 장면들', '카드 한 장에 요지 하나. 끌리는 장면에서 멈추세요.', '<a class="more-link" href="#/futures">18가지 모두 ' + ico('chev', 'ico--sm') + '</a>') +
        '<div class="hscroll">' + [fu[3], fu[1], fu[8]].map(futureCard).join('') + '</div>' +
        '<div class="btn-row mt16"><a class="btn btn--soft btn--block" href="#/futures?tab=scenario">' + ico('spark') + '내 관심 분야로 미래 시나리오 만들기</a></div>' +
      '</div></section>' +

      solutionTeaser() +

      '<section class="sec"><div class="wrap">' + secH('12대 AI휴먼전략 아젠다', '우리가 붙드는 열두 개의 질문', '', '<a class="more-link" href="#/research">전체 보기 ' + ico('chev', 'ico--sm') + '</a>') +
        '<div class="grid grid--2 grid--3">' + c.research.slice(0, 6).map(researchCard).join('') + '</div></div></section>' +

      '<section class="sec sec--alt"><div class="wrap"><div class="split">' +
        '<div>' + secH('오늘의 키워드', '<span class="grad-t">' + esc(term.k) + '</span>', esc(term.d)) +
        '<div class="btn-row">' + aBtn('키워드 50 모두 보기', '#/futures?tab=keywords', 'btn--ghost btn--sm', 'quote') + '</div><p class="xs muted mt8">키워드는 매일 바뀝니다. 내일 또 들러 주세요.</p></div>' +
        '<div class="mt24">' + communityTeaser() + '</div>' +
      '</div></div></section>' +

      '<section class="sec"><div class="wrap">' + newsletterBox() + '</div></section>' +
      ctaBand(s.closingHeadline, s.closingSub, [aBtn('협력·상담 문의', '#/contact', 'btn--pri', 'mail'), aBtn('연구원 소개', '#/about', 'btn--ghost')]);
    }
  };
  function futureCard(f) {
    return '<button type="button" class="card fcard reveal" data-action="future-open" data-id="' + attr(f.id) + '">' +
      '<span class="fcard__top"><span class="card__no">예측 ' + ('0' + f.no).slice(-2) + '</span><span class="badge kind-' + esc(f.kind) + '">' + esc(f.kind) + '</span><span class="badge">' + esc(f.when) + '</span></span>' +
      '<span class="fcard__t">' + esc(f.t) + '</span><span class="fcard__l">' + esc(f.lead) + '</span>' +
      '<span class="card__f"><span>가능성 ' + esc(f.prob) + '</span><span class="linkbtn" style="min-height:0">자세히 ' + ico('chev', 'ico--sm') + '</span></span></button>';
  }
  function researchCard(r) {
    return '<a class="card reveal" href="#/research/' + attr(r.id) + '"><span class="row row--between"><span class="card__no">AGENDA ' + esc(r.no) + '</span><span class="badge">' + esc(catName(r.cat)) + '</span></span>' +
      '<span class="card__t" style="display:block;margin-top:8px">' + esc(r.title) + '</span><span class="card__d" style="display:block">' + esc(r.desc) + '</span></a>';
  }
  function solutionTeaser() {
    var s = C().solution;
    return '<section class="sec sec--alt"><div class="wrap">' + secH('NEW · 기업·기관', esc(s.headline), esc(s.sub)) +
      '<div class="grid grid--2 grid--4">' + s.packages.map(function (p, i) {
        return '<a class="card reveal" href="#/programs?tab=solution&s=pkg-' + attr(p.id) + '"><span class="card__ic ' + (['', 'card__ic--cyan', 'card__ic--gold', ''][i] || '') + '">' + ico(p.icon) + '</span><span class="badge">' + esc(p.term) + '</span><span class="card__t" style="display:block;margin-top:6px">' + esc(p.name) + '</span><span class="card__d" style="display:block">' + esc(p.who) + '</span></a>';
      }).join('') + '</div>' +
      '<div class="btn-row mt16">' + aBtn('무료 사전 상담 신청', '#/contact?type=solution', 'btn--pri', 'mail') + aBtn('15문항 조직 진단 먼저', '#/diagnose', 'btn--ghost', 'target') + '</div></div></section>';
  }
  function communityTeaser() {
    var posts = K.data.allPosts().slice(0, 3), wq = C().weeklyQuestions, q = wq[Math.floor(Date.now() / 6048e5) % wq.length];
    return secH('커뮤니티', '이번 주의 질문', '<b style="color:var(--ink)">“' + esc(q.q) + '”</b>') +
      posts.map(postItem).join('') +
      '<div class="btn-row mt12">' + aBtn('라운지 둘러보기', '#/community', 'btn--ghost btn--sm', 'users') + '<button type="button" class="btn btn--soft btn--sm" data-action="post-write">' + ico('pen') + '글쓰기</button></div>';
  }
  function newsletterBox(compact) {
    var n = C().newsletter, sub = store.get('subscribed', null);
    return '<div class="card card--feat" style="padding:20px"><div class="split"><div>' +
      '<p class="eyebrow">' + esc(n.title) + ' · ' + esc(n.cadence) + '</p><h2 class="h3">' + esc(n.sub) + ', 5분이면 충분합니다</h2><p class="small sub mt8">' + esc(n.deck) + '</p></div>' +
      '<div class="mt16">' + (sub ? '<div class="note">' + ico('check') + '<span><b>' + esc(sub.contact) + '</b>(으)로 구독 신청이 접수되어 있어요. 해지는 언제든 문의로 요청할 수 있습니다.</span></div>' :
      '<form data-form="subscribe" novalidate>' + K.field({ name: 'contact', label: '받을 이메일', req: true, type: 'email', ph: 'name@example.com', auto: 'email', inputmode: 'email' }) +
      '<label class="check"><input type="checkbox" name="agree"> <span>구독 안내를 위해 이메일을 수집·이용하는 데 동의합니다(해지 시 즉시 파기).</span></label><div class="field" style="margin:0"><div class="field__e" role="alert"></div></div>' +
      '<input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><button class="btn btn--pri btn--block" type="submit">' + ico('mail') + '무료 구독 신청</button></form>') + '</div></div></div>';
  }
  K.form('subscribe', function (f) {
    var agree = f.elements.agree.checked, e = f.querySelector('.field__e:last-of-type');
    var ok = K.validate(f, { contact: { req: true, email: true } });
    var af = f.elements.agree.closest('form').querySelectorAll('.field')[1];
    if (!agree) { if (af) { af.classList.add('err'); af.querySelector('.field__e').textContent = '동의가 필요합니다.'; } ok = false; }
    if (!ok) return;
    K.data.subscribe({ contact: f.elements.contact.value.trim(), at: Date.now() }).then(function (where) {
      K.toast(where === 'server' ? '구독 신청이 접수됐어요' : '구독 신청을 기기에 저장했어요', 'mail'); K.render(true);
    });
  });

  /* ══════════════════════ 연구 ══════════════════════ */
  V.research = { nav: 'research', title: '연구',
    render: function (ctx) {
      var c = C(), cat = ctx.query.cat || 'all', list = c.research.filter(function (r) { return cat === 'all' || r.cat === cat; });
      return phead([['연구']], '12대 AI휴먼전략 아젠다', '기술이 아니라 사람의 질문에서 출발합니다. 분야를 고르면 해당 아젠다만 남습니다.') +
        '<div class="tabs"><div class="tabs__in" role="tablist">' + [{ id: 'all', ko: '전체' }].concat(c.categories).map(function (x) {
          return '<a class="tab" role="tab" href="#/research' + (x.id === 'all' ? '' : '?cat=' + x.id) + '" aria-selected="' + (x.id === cat) + '">' + esc(x.ko) + '</a>';
        }).join('') + '</div></div>' +
        '<section class="sec sec--tight"><div class="wrap"><p class="small muted" style="margin-bottom:12px">' + list.length + '개 아젠다</p><div class="grid grid--2 grid--3">' + list.map(researchCard).join('') + '</div>' +
        '<div class="note mt24">' + ico('compass') + '<span>각 아젠다는 연구랩·프로그램·도서의 해당 장(章)과 연결돼 있습니다. 카드를 눌러 연구 질문과 적용 대상을 확인하세요.</span></div></div></section>' +
        ctaBand('연구 주제를 함께 다루고 싶으신가요?', '공동연구·자문·강연 제안은 연구랩을 통해 받습니다.', [aBtn('연구랩 보기', '#/labs', 'btn--pri', 'flask'), aBtn('협력 문의', '#/contact?type=lab', 'btn--ghost')]);
    }
  };
  V.researchDetail = { nav: 'research', title: function (ctx) { var r = byId(C().research, ctx.params.id); return r ? r.title : '연구'; },
    exists: function (p) { return !!byId(C().research, p.id); },
    render: function (ctx) {
      var c = C(), r = byId(c.research, ctx.params.id), b = c.books[0];
      var labs = c.labs.filter(function (l) { return (l.research || []).indexOf(r.id) > -1; });
      var progs = c.programs.filter(function (p) { return (r.programs || []).indexOf(p.id) > -1; });
      var i = c.research.indexOf(r), prev = c.research[i - 1], next = c.research[i + 1];
      return phead([['연구', '#/research'], ['AGENDA ' + r.no]], esc(r.title), esc(r.desc),
        '<div class="row mt12"><span class="badge badge--cyan">' + esc(catName(r.cat)) + '</span>' + (r.tags || []).map(function (t) { return '<span class="tag">#' + esc(t) + '</span>'; }).join(' ') + '<span style="margin-left:auto" class="row">' + K.saveBtn('res:' + r.id, r.title, '연구 아젠다', '#/research/' + r.id) + shareBtn(r.title, '#/research/' + r.id) + '</span></div>') +
        '<section class="sec sec--tight"><div class="wrap"><div class="split"><div>' +
        '<p class="eyebrow">핵심 연구 질문</p><p class="quote">' + esc(r.question) + '</p>' +
        '<h2 class="h3 mt24">왜 지금 이 질문인가</h2><p class="sub mt8">' + esc(r.why) + '</p>' +
        '<h2 class="h3 mt24">핵심 인사이트</h2><ul class="list mt8">' + (r.insights || []).map(function (x) { return '<li>' + ico('spark') + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul>' +
        '<h2 class="h3 mt24">누구에게 필요한가</h2><div class="chips mt8">' + (r.targets || []).map(function (x) { return '<span class="chip">' + esc(x) + '</span>'; }).join('') + '</div></div>' +
        '<div class="stack">' +
        (labs.length ? '<h2 class="h3">연결된 연구랩</h2>' + labs.map(function (l) { return '<a class="mini" href="#/labs/' + attr(l.id) + '"><span class="mini__ic">' + ico('flask') + '</span><span><span class="mini__t">' + esc(l.ko) + '</span><span class="mini__d" style="display:block">' + esc(l.focus) + '</span></span>' + ico('chev', 'mini__go') + '</a>'; }).join('') : '') +
        (progs.length ? '<h2 class="h3 mt16">관련 프로그램</h2>' + progs.map(function (p) { return '<a class="mini" href="#/programs?tab=' + attr(p.id) + '"><span class="mini__ic">' + ico(p.icon || 'cap') + '</span><span class="mini__t">' + esc(p.name) + '</span>' + ico('chev', 'mini__go') + '</a>'; }).join('') : '') +
        ((r.bookCh || []).length ? '<h2 class="h3 mt16">도서에서 더 읽기</h2>' + r.bookCh.map(function (n) { return chapLink(b, n); }).join('') : '') +
        (r.declaration ? '<a class="mini mt16" href="#/about?tab=declaration"><span class="mini__ic">' + ico('shield') + '</span><span class="mini__t">창립선언 제' + r.declaration + '조와 연결</span>' + ico('chev', 'mini__go') + '</a>' : '') +
        '</div></div>' +
        '<div class="btn-row mt32">' + (prev ? aBtn('이전 · ' + prev.title, '#/research/' + prev.id, 'btn--ghost btn--sm', 'chevl') : '') + (next ? aBtn('다음 · ' + next.title, '#/research/' + next.id, 'btn--ghost btn--sm') : '') + '</div></div></section>';
    }
  };

  /* ══════════════════════ 연구랩 ══════════════════════ */
  V.labs = { nav: 'labs', title: '연구랩',
    render: function () {
      var c = C();
      return phead([['연구랩']], '6대 연구랩', '현장의 질문을 연구로 좁히고, 연구 결과를 교육·컨설팅·사업으로 옮기는 실행 단위입니다.') +
        '<section class="sec sec--tight"><div class="wrap"><div class="grid grid--2 grid--3">' + c.labs.map(function (l, i) {
          return '<a class="card reveal" href="#/labs/' + attr(l.id) + '"><span class="row row--between"><span class="card__ic ' + (['', 'card__ic--cyan', 'card__ic--gold'][i % 3]) + '" style="margin:0">' + ico('flask') + '</span>' + status(l.status) + '</span>' +
            '<span class="card__t" style="display:block;margin-top:12px">' + esc(l.ko) + '</span><span class="xs muted" style="display:block">' + esc(l.name) + '</span><span class="card__d" style="display:block">' + esc(l.focus) + '</span>' +
            '<span class="chips mt12">' + (l.themes || []).slice(0, 3).map(function (t) { return '<span class="badge">' + esc(t) + '</span>'; }).join('') + '</span></a>';
        }).join('') + '</div></div></section>' +
        '<section class="sec sec--alt"><div class="wrap">' + secH('연구 프로세스', '질문이 결과물이 되기까지 6단계') +
        '<div class="steps grid--2" style="display:grid">' + c.labProcess.map(function (s) { return '<div class="step reveal"><span class="step__n">' + esc(s.step) + '</span><div><p class="step__t">' + esc(s.name) + '</p><p class="step__d">' + esc(s.desc) + '</p></div></div>'; }).join('') + '</div></div></section>' +
        '<section class="sec"><div class="wrap">' + secH('공동연구 협업 보드', '지금 함께할 연구자를 찾는 과제', '아래는 협업 보드가 어떻게 쓰이는지 보여 주는 설계 예시입니다.') +
        '<div class="grid grid--2">' + c.collab.slice(0, 6).map(function (x) {
          return '<div class="card"><div class="row"><span class="badge badge--cyan">' + esc(x.kind) + '</span>' + sample(x) + '<span class="badge" style="margin-left:auto">' + esc(x.deadline) + '</span></div><p class="card__t mt8">' + esc(x.title) + '</p><p class="card__d">' + esc(x.body) + '</p><p class="xs muted mt8">찾는 사람: ' + esc(x.want) + '</p></div>';
        }).join('') + '</div></div></section>' +
        ctaBand('우리 현장의 질문을 연구 과제로 올리고 싶다면', '목적·기간·필요한 역할을 적어 주시면 맞는 연구랩과 연결해 드립니다.', [aBtn('공동연구 제안하기', '#/contact?type=lab', 'btn--pri', 'hand'), aBtn('12대 아젠다', '#/research', 'btn--ghost')]);
    }
  };
  V.labDetail = { nav: 'labs', title: function (ctx) { var l = byId(C().labs, ctx.params.id); return l ? l.ko : '연구랩'; },
    exists: function (p) { return !!byId(C().labs, p.id); },
    render: function (ctx) {
      var c = C(), l = byId(c.labs, ctx.params.id);
      var res = c.research.filter(function (r) { return (l.research || []).indexOf(r.id) > -1; });
      var ex = c.experts.filter(function (e) { return (e.labs || []).indexOf(l.id) > -1; }).slice(0, 4);
      return phead([['연구랩', '#/labs'], [l.ko]], esc(l.ko), esc(l.focus), '<div class="row mt12">' + status(l.status) + '<span class="xs muted">' + esc(l.name) + '</span><span style="margin-left:auto" class="row">' + K.saveBtn('lab:' + l.id, l.ko, '연구랩', '#/labs/' + l.id) + shareBtn(l.ko, '#/labs/' + l.id) + '</span></div>') +
        '<section class="sec sec--tight"><div class="wrap"><div class="split"><div>' +
        '<h2 class="h3">연구 테마</h2><ul class="olist mt8">' + (l.themes || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        '<h2 class="h3 mt24">연결된 아젠다</h2><div class="stack mt8">' + res.map(function (r) { return '<a class="mini" href="#/research/' + attr(r.id) + '"><span class="mini__ic">' + ico('compass') + '</span><span><span class="mini__t">' + esc(r.no + '. ' + r.title) + '</span><span class="mini__d" style="display:block">' + esc(r.question.slice(0, 60)) + '…</span></span>' + ico('chev', 'mini__go') + '</a>'; }).join('') + '</div></div>' +
        '<div><h2 class="h3">참여 연구위원 <span class="badge badge--sample">설계 예시</span></h2><div class="stack mt8">' + (ex.length ? ex.map(expertMini).join('') : '<div class="empty">' + ico('users') + '<p class="empty__t">연구위원을 모집하고 있어요</p></div>') + '</div>' +
        '<div class="card card--glow mt16"><p class="card__t">이 랩과 함께하기</p><p class="card__d">공동연구 · 자문 · 강연 · 데이터 협력</p><div class="btn-row mt12">' + aBtn('제안하기', '#/contact?type=lab', 'btn--pri btn--sm', 'hand') + '</div></div></div></div></div></section>';
    }
  };
  function expertMini(e) { return '<button type="button" class="mini" data-action="expert-open" data-id="' + attr(e.id) + '" style="width:100%;text-align:left"><span class="avatar">' + esc(e.name.slice(0, 1)) + '</span><span><span class="mini__t">' + esc(e.name) + '</span><span class="mini__d" style="display:block">' + esc(e.role + ' · ' + e.region + ' · ' + e.mode) + '</span></span>' + ico('chev', 'mini__go') + '</button>'; }

  /* ══════════════════════ 프로그램 ══════════════════════ */
  V.programs = { nav: 'programs', title: '프로그램',
    render: function (ctx) {
      var c = C(), items = [{ id: 'solution', label: 'AI 솔루션·전략컨설팅', icon: 'bolt' }].concat(c.programs.map(function (p) { return { id: p.id, label: p.name.replace('제5의 물결 ', '').replace('AI휴먼전략 ', '') }; }), [{ id: 'membership', label: '멤버십' }, { id: 'cases', label: '적용 시나리오' }]);
      var t = pickTab(ctx.query, items), body;
      if (t === 'solution') body = solutionTab();
      else if (t === 'membership') body = membershipTab();
      else if (t === 'cases') body = casesTab();
      else body = programTab(byId(c.programs, t));
      return phead([['프로그램']], 'AI 솔루션·전략컨설팅 · 아카데미 · 포럼', '진단에서 시작해 설계·구축·교육·정착까지. 필요한 단계만 골라 쓰세요.',
        '<div class="grid grid--2m mt16"><a class="mini" href="#/diagnose"><span class="mini__ic">' + ico('target') + '</span><span><span class="mini__t">조직 AI 준비도 진단</span><span class="mini__d" style="display:block">15문항 · 3분</span></span></a><a class="mini" href="#/simulator"><span class="mini__ic">' + ico('map') + '</span><span><span class="mini__t">전환 로드맵 시뮬레이터</span><span class="mini__d" style="display:block">모듈 선택 → 3단계</span></span></a></div>') +
        tabs('#/programs', items, t) + body;
    }
  };
  function solutionTab() {
    var s = C().solution;
    return '<section class="sec sec--tight"><div class="wrap">' +
      '<div class="card card--glow" style="padding:20px"><span class="badge badge--cyan">NEW</span><h2 class="h2 mt8">' + esc(s.headline) + '</h2><p class="sub mt8">' + esc(s.sub) + '</p><ul class="list mt12">' + s.promise.map(function (x) { return '<li>' + ico('check') + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul>' +
      '<div class="btn-row mt16">' + aBtn('무료 사전 상담 신청', '#/contact?type=solution', 'btn--pri', 'mail') + aBtn('조직 진단 먼저 하기', '#/diagnose', 'btn--ghost', 'target') + '</div></div>' +
      '<h2 class="h2 mt32">4가지 패키지</h2><p class="lead">한 가지만 맡기셔도, 네 단계를 이어서 맡기셔도 됩니다.</p>' +
      '<div class="grid grid--2 mt16">' + s.packages.map(function (p) {
        return '<article class="card" id="pkg-' + attr(p.id) + '"><div class="row"><span class="card__ic" style="margin:0">' + ico(p.icon) + '</span><div><p class="xs muted">' + esc(p.en) + ' · ' + esc(p.tier) + '</p><h3 class="card__t">' + esc(p.name) + '</h3></div><span class="badge" style="margin-left:auto">' + esc(p.term) + '</span></div>' +
          '<p class="card__d mt12">' + esc(p.desc) + '</p><p class="xs muted mt12">이런 조직에 · ' + esc(p.who) + '</p><ul class="list mt8">' + p.outputs.map(function (o) { return '<li>' + ico('file') + '<span>' + esc(o) + '</span></li>'; }).join('') + '</ul>' +
          '<a class="btn btn--soft btn--sm btn--block mt12" href="#/contact?type=solution&pkg=' + attr(p.id) + '">이 패키지로 상담 신청</a></article>';
      }).join('') + '</div>' +
      '<h2 class="h2 mt32">진행 방식</h2><div class="steps grid--2 mt16" style="display:grid">' + s.process.map(function (x) { return '<div class="step"><span class="step__n">' + esc(x.step) + '</span><div><p class="step__t">' + esc(x.t) + '</p><p class="step__d">' + esc(x.d) + '</p></div></div>'; }).join('') + '</div>' +
      '<div class="split mt32"><div><h2 class="h3">함께하는 분야</h2><div class="chips mt12">' + s.industries.map(function (x) { return '<span class="chip">' + esc(x) + '</span>'; }).join('') + '</div></div>' +
      '<div class="mt24"><h2 class="h3">우리가 지키는 원칙</h2><ul class="list mt8">' + s.principles.map(function (x) { return '<li>' + ico('shield') + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul></div></div>' +
      '<h2 class="h3 mt32">자주 묻는 질문</h2><div class="mt8">' + s.faq.map(faqItem).join('') + '</div>' +
      '<p class="note mt16">' + ico('info') + '<span>기간은 일반적인 범위이며 조직 규모·범위에 따라 달라집니다. 성과를 보장하는 표현은 하지 않으며, 결과는 합의한 지표로 보고합니다.</span></p></div></section>';
  }
  function faqItem(f) { return '<details class="card" style="margin-bottom:8px;padding:0"><summary style="padding:14px 16px;cursor:pointer;font-weight:700;list-style-position:inside">' + esc(f.q) + '</summary><p class="small sub" style="padding:0 16px 16px">' + esc(f.a) + '</p></details>'; }
  function programTab(p) {
    var c = C(), res = c.research.filter(function (r) { return (r.programs || []).indexOf(p.id) > -1; });
    var sub = p.formats || p.levels || p.items || [];
    return '<section class="sec sec--tight"><div class="wrap"><div class="split"><div>' +
      '<p class="eyebrow">' + esc(p.no) + ' · ' + esc(p.en) + '</p><h2 class="h2">' + esc(p.name) + '</h2><p class="lead">' + esc(p.lead) + '</p><p class="sub mt12">' + esc(p.desc) + '</p>' +
      '<ul class="list mt16">' + (p.bullets || []).map(function (x) { return '<li>' + ico('check') + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul>' +
      '<div class="btn-row mt16">' + aBtn('참여·의뢰 문의', '#/contact?type=' + p.id, 'btn--pri', 'mail') + K.saveBtn('prog:' + p.id, p.name, '프로그램', '#/programs?tab=' + p.id, true) + '</div></div>' +
      '<div class="mt24"><h2 class="h3">구성</h2><div class="stack mt8">' + sub.map(function (x) {
        return '<div class="mini"><span class="mini__ic">' + (x.lv ? '<b style="font-size:12px">' + esc(x.lv) + '</b>' : ico('layers')) + '</span><span><span class="mini__t">' + esc(x.name || x.t || '') + '</span><span class="mini__d" style="display:block">' + esc(x.desc || x.d || '') + '</span></span><span class="mini__go">' + status(x.status) + '</span></div>';
      }).join('') + '</div>' +
      (res.length ? '<h2 class="h3 mt24">다루는 아젠다</h2><div class="chips mt8">' + res.map(function (r) { return '<a class="chip" href="#/research/' + attr(r.id) + '">' + esc(r.no + ' ' + r.title) + '</a>'; }).join('') + '</div>' : '') +
      '</div></div></div></section>';
  }
  function membershipTab() {
    var c = C();
    return '<section class="sec sec--tight"><div class="wrap">' + secH('멤버십', '참여 방식과 이용 범위', '런칭 단계의 설계안입니다. 금액·혜택은 정식 운영 공지에서 확정됩니다.') +
      '<div class="grid grid--2 grid--4">' + c.pricing.map(function (p) {
        return '<div class="card' + (p.featured ? ' card--glow' : '') + '"><span class="badge ' + (p.featured ? 'badge--cyan' : '') + '">' + esc(p.badge) + '</span><p class="card__t mt8">' + esc(p.name) + '</p><p class="stat__v" style="font-size:22px">' + esc(p.priceLabel) + '</p><p class="xs muted">' + esc(p.priceNote || '') + '</p><p class="small sub mt8">' + esc(p.target) + '</p>' +
          '<ul class="list mt8">' + p.items.map(function (x) { return '<li>' + ico('check') + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul><a class="btn ' + (p.featured ? 'btn--pri' : 'btn--ghost') + ' btn--sm btn--block mt12" href="' + attr(p.route || '#/contact') + '">' + esc(p.cta) + '</a></div>';
      }).join('') + '</div><p class="note mt16">' + ico('info') + '<span>결제 기능은 아직 열지 않았습니다. 참여 신청은 문의 접수로 받으며, 확정 조건을 안내한 뒤 진행합니다.</span></p></div></section>';
  }
  function casesTab() {
    var c = C();
    return '<section class="sec sec--tight"><div class="wrap">' + secH('적용 시나리오', '이런 상황이라면, 이렇게 풀어 갑니다', '모두 설계 예시입니다. 실제 고객 사례가 아니라 접근 방식을 보여 드리기 위한 시나리오입니다.') +
      '<div class="grid grid--2">' + c.cases.map(function (x) {
        return '<article class="card"><div class="row"><span class="badge badge--sample">' + esc(x.label) + '</span><span class="badge">' + esc(catName(x.cat)) + '</span></div><h3 class="card__t mt8">' + esc(x.title) + '</h3><p class="xs muted">' + esc(x.who) + '</p><p class="card__d">' + esc(x.pain) + '</p>' +
          '<p class="small mt8" style="color:var(--brand2)">' + esc(x.turn) + '</p><div class="steps mt12">' + (x.flow || []).slice(0, 4).map(function (f) { return '<div class="step" style="padding:10px"><span class="step__n" style="width:28px;height:28px;font-size:11px">' + esc(f.step) + '</span><div><p class="step__t small">' + esc(f.t) + '</p><p class="step__d">' + esc(f.d) + '</p></div></div>'; }).join('') + '</div></article>';
      }).join('') + '</div></div></section>';
  }

  /* ══════════════════════ 조직 AI 준비도 진단(15문항) ══════════════════════ */
  V.diagnose = { nav: 'programs', title: '조직 AI 준비도 진단',
    render: function (ctx) {
      var c = C(), qs = c.diagQuestions, st = store.get('orgDiag', { i: 0, a: {} });
      var done = Object.keys(st.a).length >= qs.length && ctx.query.view !== 'q';
      var head = phead([['프로그램', '#/programs'], ['조직 AI 준비도 진단']], '조직 AI 준비도 진단', '15문항 · 5개 축 · 약 3분. 가입 없이 결과를 바로 보고 저장할 수 있습니다.');
      if (done) return head + orgResult(st.a);
      var i = Math.min(st.i, qs.length - 1), q = qs[i], ax = byId(c.diagAxes, q.axis);
      return head + '<section class="sec sec--tight"><div class="wrap" style="max-width:720px">' +
        '<div class="row row--between small"><span class="muted">' + (i + 1) + ' / ' + qs.length + '</span><span class="badge badge--cyan">' + esc(ax ? ax.ko : '') + '</span></div><div class="progress mt8"><i style="width:' + Math.round(i / qs.length * 100) + '%"></i></div>' +
        '<div class="card qcard mt16"><p class="qnum">Q' + (i + 1) + '</p><p class="qtext">' + esc(q.q) + '</p><p class="small muted mt8">' + esc(q.help) + '</p>' +
        '<div class="optgrid mt16">' + q.opts.map(function (o) { return '<button type="button" class="opt" data-action="org-answer" data-v="' + o.v + '" aria-pressed="' + (st.a[q.id] === o.v) + '"><span class="opt__k"></span>' + esc(o.t) + '</button>'; }).join('') + '</div></div>' +
        '<div class="btn-row mt16">' + (i > 0 ? '<button type="button" class="btn btn--ghost" data-action="org-prev">' + ico('chevl') + '이전</button>' : '') + (Object.keys(st.a).length ? '<button type="button" class="btn btn--ghost" data-action="org-reset">' + ico('refresh') + '처음부터</button>' : '') + '</div>' +
        '<p class="note mt16">' + ico('lock') + '<span>응답은 서버로 보내지 않고 이 기기에만 저장됩니다. 공인 평가가 아닌 자기점검 도구입니다.</span></p></div></section>';
    }
  };
  function orgScore(a) {
    var c = C(), axes = c.diagAxes.map(function (x) { return { id: x.id, ko: x.ko, s: 0, m: 0 }; }), total = 0;
    c.diagQuestions.forEach(function (q) { var ax = axes.filter(function (x) { return x.id === q.axis; })[0]; var v = a[q.id] || 0; if (ax) { ax.s += v; ax.m += 3; } total += v; });
    var type = c.diagTypes.filter(function (t) { return total >= t.min && total <= t.max; })[0] || c.diagTypes[c.diagTypes.length - 1];
    return { axes: axes, total: total, max: c.diagQuestions.length * 3, type: type };
  }
  function orgResult(a) {
    var r = orgScore(a), pct = Math.round(r.total / r.max * 100), weak = r.axes.slice().sort(function (x, y) { return x.s / x.m - y.s / y.m; })[0];
    var C2 = 2 * Math.PI * 46;
    return '<section class="sec sec--tight print-area"><div class="wrap" style="max-width:820px"><div class="result">' +
      '<div class="row" style="gap:18px;flex-wrap:nowrap"><svg class="ring" viewBox="0 0 108 108" width="108" height="108" aria-hidden="true"><circle cx="54" cy="54" r="46" fill="none" stroke="var(--surface3)" stroke-width="10"/><circle cx="54" cy="54" r="46" fill="none" stroke="url(#rg)" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + (C2 * pct / 100).toFixed(1) + ' ' + C2.toFixed(1) + '" transform="rotate(-90 54 54)"/><defs><linearGradient id="rg"><stop offset="0" stop-color="#2f7df6"/><stop offset="1" stop-color="#19c3dc"/></linearGradient></defs><text x="54" y="60" text-anchor="middle" font-size="22" font-weight="800" fill="currentColor">' + pct + '%</text></svg>' +
      '<div><p class="xs muted">진단 결과 · ' + r.total + ' / ' + r.max + '점</p><h2 class="h2 mt8">' + esc(r.type.name) + '</h2><p class="small sub mt8">' + esc(r.type.line) + '</p></div></div>' +
      '<div class="mt24">' + r.axes.map(function (x) { var p = Math.round(x.s / x.m * 100); return '<div class="meter"><span>' + esc(x.ko) + '</span><span class="progress"><i style="width:' + p + '%"></i></span><b>' + p + '</b></div>'; }).join('') + '</div>' +
      '<p class="sub mt16">' + esc(r.type.body) + '</p><p class="note mt16">' + ico('target') + '<span>가장 먼저 손볼 축: <b>' + esc(weak.ko) + '</b> — 상담 시 이 결과를 함께 보시면 첫 미팅이 짧아집니다.</span></p>' +
      '<h3 class="h3 mt24">다음 단계</h3><div class="stack mt8">' + (r.type.next || []).map(function (n) { return '<a class="mini" href="' + attr(n.route) + '"><span class="mini__ic">' + ico('arrow') + '</span><span><span class="mini__t">' + esc(n.t) + '</span><span class="mini__d" style="display:block">' + esc(n.why) + '</span></span></a>'; }).join('') + '</div>' +
      '<div class="btn-row mt24 no-print">' + aBtn('이 결과로 상담 신청', '#/contact?type=solution&diag=' + pct, 'btn--pri', 'mail') + '<button type="button" class="btn btn--ghost" data-action="org-save">' + ico('bookmark') + '결과 저장</button><button type="button" class="btn btn--ghost" data-action="print">' + ico('print') + 'PDF·인쇄</button><button type="button" class="btn btn--ghost" data-action="org-reset">' + ico('refresh') + '다시 하기</button></div>' +
      '</div><p class="xs muted mt12">자기점검용 참고 결과입니다. 공인 인증·평가가 아니며 조직의 의사결정을 대체하지 않습니다.</p></div></section>';
  }
  K.act('org-answer', function (el) {
    var qs = C().diagQuestions, st = store.get('orgDiag', { i: 0, a: {} }), q = qs[Math.min(st.i, qs.length - 1)];
    st.a[q.id] = +el.getAttribute('data-v'); st.i = Math.min(st.i + 1, qs.length); store.set('orgDiag', st);
    $$opt(el); setTimeout(function () { K.go(Object.keys(st.a).length >= qs.length ? '#/diagnose' : '#/diagnose?view=q'); }, 140);
  });
  function $$opt(el) { U.$$('.opt', el.parentNode).forEach(function (o) { o.setAttribute('aria-pressed', o === el ? 'true' : 'false'); }); }
  K.act('org-prev', function () { var st = store.get('orgDiag', { i: 0, a: {} }); st.i = Math.max(0, st.i - 1); store.set('orgDiag', st); K.go('#/diagnose?view=q'); });
  K.act('org-reset', function () { store.set('orgDiag', { i: 0, a: {} }); K.go('#/diagnose?view=q'); });
  K.act('org-save', function () {
    var st = store.get('orgDiag', { a: {} }), r = orgScore(st.a), rec = store.get('records', []);
    rec.unshift({ id: U.uid('r'), kind: '조직 AI 준비도', t: r.type.name, d: r.total + ' / ' + r.max + '점', r: '#/diagnose', at: Date.now() }); store.set('records', rec.slice(0, 50));
    K.toast('마이 › 기록에 저장했어요', 'bookmark');
  });
  K.act('print', function () { D.body.classList.add('print-only'); setTimeout(function () { try { W.print(); } catch (e) {} D.body.classList.remove('print-only'); }, 50); });

  /* ══════════════════════ 로드맵 시뮬레이터 ══════════════════════ */
  V.simulator = { nav: 'programs', title: 'AI 전환 로드맵 시뮬레이터',
    render: function (ctx) {
      var c = C(), sel = store.get('simSel', []), cat = ctx.query.cat || 'all';
      var mods = c.simModules.filter(function (m) { return cat === 'all' || m.cat === cat; });
      var chosen = c.simModules.filter(function (m) { return sel.indexOf(m.id) > -1; });
      return phead([['프로그램', '#/programs'], ['로드맵 시뮬레이터']], 'AI 전환 로드맵 시뮬레이터', '하고 싶은 실행 모듈을 고르면 3단계(0~3개월 · 3~9개월 · 9~18개월) 계획표가 바로 만들어집니다.') +
        '<div class="tabs"><div class="tabs__in" role="tablist">' + [{ id: 'all', ko: '전체' }].concat(c.categories).map(function (x) { return '<a class="tab" role="tab" href="#/simulator' + (x.id === 'all' ? '' : '?cat=' + x.id) + '" aria-selected="' + (x.id === cat) + '">' + esc(x.ko) + '</a>'; }).join('') + '</div></div>' +
        '<section class="sec sec--tight"><div class="wrap"><div class="split"><div><p class="small muted" style="margin-bottom:10px">모듈 ' + mods.length + '개 · 선택 ' + sel.length + '개</p><div class="stack">' + mods.map(function (m) {
          var on = sel.indexOf(m.id) > -1;
          return '<button type="button" class="opt" style="align-items:flex-start" data-action="sim-toggle" data-id="' + attr(m.id) + '" aria-pressed="' + on + '"><span class="opt__k" style="margin-top:2px"></span><span><b>' + esc(m.name) + '</b><span class="xs muted" style="display:block">' + esc(m.who + ' · ' + m.weeks + '주 · 결과물: ' + m.outcome) + '</span><span class="small sub" style="display:block;margin-top:4px">' + esc(m.desc) + '</span></span></button>';
        }).join('') + '</div></div>' +
        '<div class="mt24 print-area"><div class="card card--feat" style="position:sticky;top:calc(var(--hdr) + 70px)"><h2 class="h3">내 로드맵 ' + (chosen.length ? '(' + chosen.length + '개 모듈)' : '') + '</h2>' +
        (chosen.length ? c.simPhases.map(function (ph) {
          var ms = chosen.filter(function (m) { return m.phase === ph.id; }), wk = ms.reduce(function (s, m) { return s + (m.weeks || 0); }, 0);
          return '<div class="mt16"><p class="row"><span class="badge badge--cyan">' + esc(ph.term) + '</span><b class="small">' + esc(ph.ko) + '</b></p><p class="xs muted mt8">' + esc(ph.line) + '</p>' + (ms.length ? '<ul class="list">' + ms.map(function (m) { return '<li>' + ico('check') + '<span>' + esc(m.name) + ' <span class="muted">· ' + m.weeks + '주</span></span></li>'; }).join('') + '</ul><p class="xs muted">합계 약 ' + wk + '주(병행 가능)</p>' : '<p class="xs muted mt8">이 단계에 고른 모듈이 없어요.</p>') + '</div>';
        }).join('') + '<div class="btn-row mt16 no-print"><button type="button" class="btn btn--pri btn--sm" data-action="sim-save">' + ico('bookmark') + '계획 저장</button><button type="button" class="btn btn--ghost btn--sm" data-action="print">' + ico('print') + 'PDF·인쇄</button><button type="button" class="btn btn--ghost btn--sm" data-action="sim-clear">' + ico('trash') + '비우기</button></div><a class="btn btn--soft btn--sm btn--block mt8 no-print" href="#/contact?type=solution">이 계획으로 상담 신청</a>'
          : '<div class="empty mt12">' + ico('map') + '<p class="empty__t">왼쪽에서 모듈을 골라 보세요</p><p class="small mt8">예시: 경영진 판단경계 워크숍 → 부서 파일럿 → 사내 챔피언 과정</p><button type="button" class="btn btn--soft btn--sm mt12" data-action="sim-sample">추천 조합 불러오기</button></div>') +
        '</div></div></div></div></section>';
    }
  };
  K.act('sim-toggle', function (el) { var id = el.getAttribute('data-id'), s = store.get('simSel', []), i = s.indexOf(id); if (i > -1) s.splice(i, 1); else s.push(id); store.set('simSel', s); K.render(); });
  K.act('sim-clear', function () { store.set('simSel', []); K.render(); });
  K.act('sim-sample', function () { var m = C().simModules; store.set('simSel', [m[0], m[3], m[6], m[10]].filter(Boolean).map(function (x) { return x.id; })); K.render(); K.toast('추천 조합을 불러왔어요', 'map'); });
  K.act('sim-save', function () { var s = store.get('simSel', []), rec = store.get('records', []); rec.unshift({ id: U.uid('r'), kind: '전환 로드맵', t: s.length + '개 모듈 계획', d: C().simModules.filter(function (m) { return s.indexOf(m.id) > -1; }).map(function (m) { return m.name; }).slice(0, 3).join(' · '), r: '#/simulator', at: Date.now() }); store.set('records', rec.slice(0, 50)); K.toast('마이 › 기록에 저장했어요', 'bookmark'); });

  /* ══════════════════════ 출판·리포트 ══════════════════════ */
  V.publications = { nav: 'publications', title: '출판·리포트',
    render: function (ctx) {
      var c = C(), items = [{ id: 'reports', label: '리포트·브리프', n: c.publications.length }, { id: 'newsletter', label: '파도 편지', n: c.newsletter.issues.length }, { id: 'books', label: '도서', n: c.books.length }];
      var t = pickTab(ctx.query, items), body = '';
      if (t === 'reports') {
        var ty = ctx.query.type || 'all', list = c.publications.filter(function (p) { return ty === 'all' || p.type === ty; });
        body = '<section class="sec sec--tight"><div class="wrap"><div class="chips chips--x" style="margin-bottom:14px">' + [{ id: 'all', ko: '전체' }].concat(c.pubTypes).map(function (x) { return '<a class="chip" href="#/publications?tab=reports' + (x.id === 'all' ? '' : '&type=' + x.id) + '" aria-pressed="' + (x.id === ty) + '">' + esc(x.ko) + '</a>'; }).join('') + '</div>' +
          '<div class="grid grid--2">' + list.map(function (p) { var pt = byId(c.pubTypes, p.type); return '<article class="card"><div class="row"><span class="badge badge--brand">' + esc(pt ? pt.ko : '') + '</span>' + status(p.status) + '</div><h3 class="card__t mt8">' + esc(p.title) + '</h3><p class="card__d">' + esc(p.desc) + '</p><div class="card__f"><span>' + esc(p.plan || '') + '</span>' + K.saveBtn('pub:' + p.id, p.title, '출판·리포트', '#/publications') + '</div></article>'; }).join('') + '</div>' +
          '<div class="note mt16">' + ico('mail') + '<span>발간되면 가장 먼저 받아 보시려면 아래 ‘파도 편지’를 구독하세요. 발간 전 리포트는 미리 보기를 제공하지 않습니다.</span></div></div></section>';
      } else if (t === 'newsletter') {
        var tr = ctx.query.track || 'all', iss = c.newsletter.issues.filter(function (i) { return tr === 'all' || i.track === tr; });
        body = '<section class="sec sec--tight"><div class="wrap">' + newsletterBox() +
          '<h2 class="h3 mt32">25주 편성표</h2><p class="small muted mt8">책 한 권을 25주에 나눠 읽습니다. 한 통에 5분, 한 주에 한 걸음.</p><div class="chips chips--x mt12" style="margin-bottom:12px">' + [{ id: 'all', t: '전체' }].concat(c.newsletter.tracks).map(function (x) { return '<a class="chip" href="#/publications?tab=newsletter' + (x.id === 'all' ? '' : '&track=' + x.id) + '" aria-pressed="' + (x.id === tr) + '">' + esc(x.t) + '</a>'; }).join('') + '</div>' +
          '<div class="grid grid--2">' + iss.map(function (i) { return '<article class="card"><div class="row"><span class="card__no">' + i.no + '호</span><span class="badge">' + esc((byId(c.newsletter.tracks, i.track) || {}).t || '') + '</span><span class="xs muted" style="margin-left:auto">' + ico('clock', 'ico--sm') + ' ' + i.read + '분</span></div><h3 class="card__t mt8">' + esc(i.t) + '</h3><p class="card__d">' + esc(i.hook) + '</p><p class="small mt8" style="color:var(--brand2)">' + ico('target', 'ico--sm') + ' ' + esc(i.action) + '</p></article>'; }).join('') + '</div></div></section>';
      } else {
        body = '<section class="sec sec--tight"><div class="wrap"><div class="grid grid--2">' + c.books.map(bookCard).join('') + '</div></div></section>';
      }
      return phead([['출판·리포트']], '출판 · 리포트 · 파도 편지', '연구는 문장이 되어야 쓸모가 생깁니다. 브리프·리포트·뉴스레터·도서로 나눕니다.') + tabs('#/publications', items, t) + body;
    }
  };
  function bookCard(b) {
    return '<a class="card" href="#/wave/' + attr(b.id) + '" style="display:grid;grid-template-columns:90px 1fr;gap:14px;align-items:center"><span class="cover"><img src="' + attr(b.coverThumb) + '" alt="『' + attr(b.title) + '』 표지" width="360" height="522" loading="lazy"></span><span><span class="row">' + status(b.status) + '<span class="badge badge--cyan">' + b.previewPages + '쪽 미리보기</span></span><span class="card__t" style="display:block;margin-top:6px">『' + esc(b.title) + '』</span><span class="card__d" style="display:block">' + esc(b.subtitle) + '</span><span class="xs muted" style="display:block;margin-top:6px">' + esc(b.author) + ' 지음 · ' + esc(b.series) + '</span></span></a>';
  }

  /* ══════════════════════ 제5의물결 (도서 시리즈) ══════════════════════ */
  V.wave = { nav: 'wave', title: '제5의 물결',
    render: function () {
      var c = C(), b = c.books[0], rp = store.get('read:' + b.id, null), notify = store.get('notify', []);
      return '<section class="hero">' + wavesSvg + '<div class="wrap" style="position:relative"><span class="hero__badge"><i></i>제5의 물결 시리즈</span><h1>AI 문명시대를 건너는 <span class="l2 grad-t">한 권씩의 해도(海圖)</span></h1><p class="hero__sub">예언 대신 좌표를 찍습니다. 시리즈의 각 권은 사이트에서 앞부분을 무료로 읽을 수 있습니다.</p></div></section>' +
        (rp && rp.p ? '<section class="sec sec--tight"><div class="wrap"><a class="mini" href="#/wave/' + b.id + '/read?p=' + rp.p + '"><span class="mini__ic">' + ico('bookmark') + '</span><span style="flex:1"><span class="mini__t">『' + esc(b.title) + '』 ' + rp.p + '쪽부터 이어 읽기</span><span class="progress mt8" style="display:block"><i style="width:' + Math.round(rp.p / b.previewPages * 100) + '%"></i></span></span>' + ico('chev', 'mini__go') + '</a></div></section>' : '') +
        '<section class="sec sec--tight"><div class="wrap">' + secH('시리즈', '출간 도서') + '<div class="grid grid--2">' + c.books.map(bookCard).join('') +
        (c.seriesNext || []).map(function (n) { var on = notify.indexOf(n.id) > -1; return '<div class="card" style="border-style:dashed"><div class="row">' + status(n.status) + '<span class="badge">Vol.' + n.vol + '</span></div><p class="card__t mt8">' + esc(n.title) + '</p><p class="card__d">' + esc(n.subtitle) + '</p><button type="button" class="btn btn--soft btn--sm mt12" data-action="notify" data-id="' + attr(n.id) + '" aria-pressed="' + on + '">' + ico('bell') + (on ? '알림 신청됨' : '출간 알림 받기') + '</button></div>'; }).join('') + '</div></div></section>' +
        '<section class="sec sec--alt"><div class="wrap">' + secH('읽는 법', '나에게 맞는 독서 경로', '『' + esc(b.title) + '』 38쪽의 다섯 가지 경로입니다.') + pathsGrid(b) + '</div></section>' +
        '<section class="sec"><div class="wrap"><div class="split"><div>' + secH('1분 생존 진단', '책을 펴기 전, 내 위치부터', '10문항 · 책 13~14쪽의 진단표를 화면에서 바로 해 볼 수 있습니다.') + aBtn('진단 시작', '#/wave/' + b.id + '?tab=diag', 'btn--pri', 'target') + '</div>' +
        '<div class="mt24">' + secH('독자의 한 문장', '읽고 남긴 문장들') + bookTalkList(3) + '</div></div></div></section>';
    }
  };
  function pathsGrid(b) {
    return '<div class="grid grid--2 grid--3l">' + b.paths.map(function (p) { return '<div class="card"><p class="card__t">' + esc(p.who) + '</p><p class="small mt8"><b style="color:var(--brand2)">' + esc(p.order) + '</b>' + (p.next ? ' <span class="muted">→ ' + esc(p.next) + '</span>' : '') + '</p><p class="card__d">' + esc(p.gain) + '</p></div>'; }).join('') + '</div>';
  }
  function bookTalkList(n) {
    var ps = K.data.allPosts().filter(function (p) { return p.board === 'book'; }).slice(0, n || 20);
    return (ps.length ? ps.map(postItem).join('') : '<div class="empty">' + ico('quote') + '<p class="empty__t">첫 번째 한 문장을 남겨 주세요</p><p class="small mt8">책을 덮고 남은 문장 하나, 혹은 질문 하나면 충분합니다.</p></div>') +
      '<button type="button" class="btn btn--soft btn--sm mt12" data-action="post-write" data-board="book">' + ico('pen') + '한 문장 남기기</button>';
  }
  K.act('notify', function (el) { var id = el.getAttribute('data-id'), n = store.get('notify', []), i = n.indexOf(id); if (i > -1) n.splice(i, 1); else n.push(id); store.set('notify', n); K.toast(i > -1 ? '출간 알림을 취소했어요' : '출간되면 마이 › 알림으로 알려 드릴게요', 'bell'); K.render(); });

  V.book = { nav: 'wave', title: function (ctx) { var b = book(ctx.params.id); return b ? b.title : '도서'; },
    exists: function (p) { return !!book(p.id); },
    render: function (ctx) {
      var b = book(ctx.params.id), rp = store.get('read:' + b.id, null);
      var items = [{ id: 'intro', label: '소개' }, { id: 'toc', label: '목차' }, { id: 'diag', label: '1분 진단' }, { id: 'paths', label: '읽는 법' }, { id: 'talk', label: '독자의 한 문장' }];
      var t = pickTab(ctx.query, items), body;
      if (t === 'toc') body = tocList(b);
      else if (t === 'diag') body = bookDiag(b);
      else if (t === 'paths') body = '<section class="sec sec--tight"><div class="wrap">' + pathsGrid(b) + '</div></section>';
      else if (t === 'talk') body = '<section class="sec sec--tight"><div class="wrap" style="max-width:760px">' + bookTalkList(30) + '</div></section>';
      else body = '<section class="sec sec--tight"><div class="wrap"><div class="split"><div><p class="lead" style="margin-top:0">' + esc(b.deck) + '</p><h2 class="h3 mt24">이 책에 담긴 것</h2><ul class="list mt8">' + b.contains.map(function (x) { return '<li>' + ico('check') + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul></div>' +
        '<div class="mt24"><h2 class="h3">이런 분께</h2><div class="grid grid--2m mt8">' + (b.forWhom || []).map(function (f) { return '<div class="stat"><p class="card__t">' + esc(f.t) + '</p><p class="stat__l mt8">' + esc(f.d) + '</p></div>'; }).join('') + '</div>' +
        '<div class="note mt16">' + ico('book') + '<span>' + esc(b.previewNote) + '</span></div><p class="xs muted mt12">' + esc(b.copyright) + '</p></div></div></div></section>';
      return '<section class="phead"><div class="wrap"><nav class="crumb" aria-label="현재 위치"><a href="#/home">홈</a>' + ico('chev', 'ico--sm') + '<a href="#/wave">제5의물결</a>' + ico('chev', 'ico--sm') + '<span>' + esc(b.title) + '</span></nav>' +
        '<div class="bookhero"><span class="cover"><img src="' + attr(b.cover) + '" alt="『' + attr(b.title) + '』 표지" width="600" height="870"></span><div><p class="xs muted">' + esc(b.series) + '</p><h1 class="h1" style="margin-top:4px">' + esc(b.title) + '</h1><p class="small sub mt8">' + esc(b.subtitle) + '</p><p class="small mt8">' + esc(b.author) + ' 지음 · ' + esc(b.authorRole) + '</p>' +
        '<p class="bookhero__hook mt12">' + esc(b.hook) + '</p></div></div>' +
        '<p class="xs muted mt12">' + esc(b.spec) + '</p>' +
        '<div class="btn-row mt16">' + aBtn(rp && rp.p ? rp.p + '쪽부터 이어 읽기' : b.previewPages + '쪽 무료로 읽기', '#/wave/' + b.id + '/read' + (rp && rp.p ? '?p=' + rp.p : ''), 'btn--pri', 'book') +
        (b.buy || []).map(function (x) { return '<a class="btn btn--gold" href="' + attr(x.url) + '" target="_blank" rel="noopener noreferrer">' + ico('ext') + esc(x.label) + '</a>'; }).join('') + '</div>' +
        '<div class="row mt8">' + K.saveBtn('book:' + b.id, b.title, '도서', '#/wave/' + b.id, true) + shareBtn('『' + b.title + '』 ' + b.previewPages + '쪽 미리보기', '#/wave/' + b.id, '공유') + '</div></div></section>' +
        tabs('#/wave/' + b.id, items, t) + body;
    }
  };
  function tocList(b) {
    return '<section class="sec sec--tight"><div class="wrap" style="max-width:820px"><p class="note" style="margin-bottom:14px">' + ico('book') + '<span>밑줄 친 항목은 미리보기(' + b.previewPages + '쪽)에서 바로 읽을 수 있습니다. ' + ico('lock', 'ico--sm') + ' 표시는 도서에서 이어집니다.</span></p><ul class="toc">' +
      b.toc.map(function (t) {
        var inPv = t.p && t.p <= b.previewPages;
        if (t.lv === 'part') return '<li class="part"><span class="toc__t">' + esc(t.t) + (t.sub ? '<small>' + esc(t.sub) + '</small>' : '') + '</span><span class="toc__p">' + (t.p || '') + '</span></li>';
        return '<li class="' + t.lv + '">' + (inPv ? '<a class="toc__t" href="#/wave/' + b.id + '/read?p=' + t.p + '">' + esc(t.t) + '</a>' : '<span class="toc__t">' + esc(t.t) + '</span>' + ico('lock', 'lock')) + '<span class="toc__p">' + (t.p || '') + '</span></li>';
      }).join('') + '</ul></div></section>';
  }
  function bookDiag(b) {
    var a = store.get('bookDiag:' + b.id, {}), n = Object.keys(a).length, score = Object.keys(a).reduce(function (s, k) { return s + (a[k] ? 1 : 0); }, 0);
    var res = n >= b.diag.length ? b.diagResults.filter(function (r) { return score >= r.min && score <= r.max; })[0] : null;
    return '<section class="sec sec--tight"><div class="wrap" style="max-width:760px"><p class="lead" style="margin-top:0">오래 생각하지 말고 지금의 나를 기준으로 고르세요. 응답은 이 기기에만 저장됩니다. <span class="muted">(도서 13~14쪽)</span></p>' +
      '<div class="row row--between small mt16"><span class="muted">' + n + ' / ' + b.diag.length + ' 응답</span><b>' + score + '점</b></div><div class="progress mt8"><i style="width:' + (n / b.diag.length * 100) + '%"></i></div>' +
      '<div class="stack mt16">' + b.diag.map(function (q) {
        var v = a[q.no];
        return '<div class="card qcard"><p class="qnum">' + esc(q.no) + '</p><p class="qtext" style="font-size:15.5px">' + esc(q.q) + '</p><div class="yn"><button type="button" class="opt" data-action="bdiag" data-b="' + attr(b.id) + '" data-q="' + attr(q.no) + '" data-v="1" aria-pressed="' + (v === 1) + '"><span class="opt__k"></span>그렇다</button><button type="button" class="opt" data-action="bdiag" data-b="' + attr(b.id) + '" data-q="' + attr(q.no) + '" data-v="0" aria-pressed="' + (v === 0) + '"><span class="opt__k"></span>아직 아니다</button></div></div>';
      }).join('') + '</div>' +
      (res ? '<div class="result mt24" id="bdiag-result"><p class="xs muted">결과 · ' + score + ' / ' + b.diag.length + '점</p><h2 class="h2 mt8">' + esc(res.name) + '</h2><p class="sub mt12">' + esc(res.text) + '</p><div class="btn-row mt16">' + aBtn('추천 장부터 읽기', '#/wave/' + b.id + '/read?p=44', 'btn--pri', 'book') + '<button type="button" class="btn btn--ghost" data-action="bdiag-save" data-b="' + attr(b.id) + '">' + ico('bookmark') + '저장</button>' + shareBtn('1분 생존 진단 — 나는 ' + res.name, '#/wave/' + b.id + '?tab=diag', '공유') + '<button type="button" class="btn btn--ghost" data-action="bdiag-reset" data-b="' + attr(b.id) + '">' + ico('refresh') + '다시</button></div></div>'
           : '<div class="empty mt24">' + ico('target') + '<p class="empty__t">10문항에 모두 답하면 결과가 나타납니다</p><p class="small mt8">8~10점 AI 지휘자형 · 4~7점 AI 전환기형 · 0~3점 AI 경고등형</p></div>') + '</div></section>';
  }
  K.act('bdiag', function (el) {
    var id = el.getAttribute('data-b'), a = store.get('bookDiag:' + id, {}); a[el.getAttribute('data-q')] = +el.getAttribute('data-v'); store.set('bookDiag:' + id, a);
    var all = Object.keys(a).length >= book(id).diag.length; K.render();
    if (all) setTimeout(function () { var r = D.getElementById('bdiag-result'); if (r && r.scrollIntoView) r.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 60);
  });
  K.act('bdiag-reset', function (el) { store.del('bookDiag:' + el.getAttribute('data-b')); K.render(); });
  K.act('bdiag-save', function (el) {
    var b = book(el.getAttribute('data-b')), a = store.get('bookDiag:' + b.id, {}), s = Object.keys(a).reduce(function (x, k) { return x + (a[k] ? 1 : 0); }, 0), r = b.diagResults.filter(function (x) { return s >= x.min && s <= x.max; })[0];
    var rec = store.get('records', []); rec.unshift({ id: U.uid('r'), kind: '1분 생존 진단', t: r.name, d: s + ' / 10점', r: '#/wave/' + b.id + '?tab=diag', at: Date.now() }); store.set('records', rec.slice(0, 50)); K.toast('마이 › 기록에 저장했어요', 'bookmark');
  });

  /* ── 58쪽 리더 ──────────────────────────────────────────────── */
  V.reader = { nav: 'wave', title: function (ctx) { var b = book(ctx.params.id); return b ? b.title + ' 미리보기' : '미리보기'; },
    exists: function (p) { return !!book(p.id); },
    render: function (ctx) {
      var b = book(ctx.params.id), rs = store.get('readerSet', { fs: 17, rt: 'paper' });
      var html = b.preview.map(function (bl) {
        switch (bl.k) {
          case 'pg': return '<div class="rpg" id="pg-' + bl.n + '" data-pg="' + bl.n + '">p. ' + bl.n + '</div>';
          case 'title': return '<p class="r-title">' + esc(bl.t) + '</p>';
          case 'part': return '<h2 class="r-part">' + esc(bl.t) + '</h2>';
          case 'ch': return '<h2 class="r-ch">' + esc(bl.t) + '</h2>';
          case 'h': return '<h3 class="r-h">' + esc(bl.t) + '</h3>';
          case 'h4': return '<p class="r-h4">' + esc(bl.t) + '</p>';
          case 'q': return '<p class="r-q">' + esc(bl.t) + '</p>';
          case 'ref': return '<p class="r-ref">' + esc(bl.t) + '</p>';
          case 'toc': return '<div class="r-tbl" style="padding:14px"><p class="r-h" style="margin-top:0">' + esc(bl.t) + '</p><ul class="toc">' + b.toc.filter(function (t) { return t.lv === 'part' || t.lv === 'ch' || (t.lv === 'etc' && t.p && t.p < 45); }).map(function (t) { var inPv = t.p && t.p <= b.previewPages; return '<li class="' + t.lv + '">' + (inPv ? '<button type="button" class="toc__t linkbtn" style="min-height:0;text-align:left" data-action="reader-jump" data-p="' + t.p + '">' + esc(t.t) + '</button>' : '<span class="toc__t">' + esc(t.t) + '</span>') + '<span class="toc__p">' + (t.p || '') + '</span></li>'; }).join('') + '</ul><p class="xs" style="opacity:.7;margin-top:8px">전체 목차는 도서 소개 › 목차에서 볼 수 있습니다.</p></div>';
          case 'table': return '<div class="r-tbl"><table>' + bl.rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + esc(c).replace(/\n/g, '<br>') + '</td>'; }).join('') + '</tr>'; }).join('') + '</table></div>';
          default: return '<p>' + esc(bl.t) + '</p>';
        }
      }).join('');
      return '<div class="reader" data-rt="' + attr(rs.rt) + '" style="--rfs:' + (+rs.fs || 17) + 'px">' +
        '<div class="rbar"><div class="rbar__in"><a class="iconbtn" href="#/wave/' + b.id + '" aria-label="도서 소개로 돌아가기">' + ico('chevl') + '</a><span class="rbar__t">『' + esc(b.title) + '』 미리보기</span>' +
        '<button type="button" class="iconbtn" data-action="reader-mark" aria-label="이 쪽 표시하기">' + ico('bookmark') + '</button><button type="button" class="iconbtn" data-action="reader-set" aria-label="글자 크기·화면 설정">' + ico('type') + '</button>' + shareBtn('『' + b.title + '』 ' + b.previewPages + '쪽 미리보기', '#/wave/' + b.id + '/read') + '</div><div class="rprog"><i id="rprog"></i></div></div>' +
        '<article class="rbody" id="rbody" lang="ko">' + html +
        '<div class="rend"><p class="xs" style="letter-spacing:.1em;opacity:.7">PREVIEW END · ' + b.previewPages + ' / ' + b.pagesTotal + '쪽</p><h2 class="h3 mt8" style="color:inherit">여기까지가 무료 미리보기입니다</h2><p class="small mt8" style="opacity:.85">이어지는 2장 후반부터 37장, 낱말집 50 · 사업 기회 30 · 미래예측 18은 도서에서 만나 주세요.</p>' +
        '<div class="btn-row mt16" style="justify-content:center">' + (b.buy || []).map(function (x) { return '<a class="btn btn--pri" href="' + attr(x.url) + '" target="_blank" rel="noopener noreferrer">' + ico('ext') + esc(x.label) + '</a>'; }).join('') + '<button type="button" class="btn btn--ghost" data-action="post-write" data-board="book">' + ico('pen') + '한 문장 남기기</button></div>' +
        '<p class="xs mt16" style="opacity:.65">' + esc(b.copyright) + '</p></div></article>' +
        '<div class="rnav"><div class="rnav__in"><button type="button" class="btn btn--ghost btn--sm" data-action="reader-step" data-d="-1">' + ico('chevl') + '이전 쪽</button><span style="flex:1;text-align:center" id="rpage">p. 1 / ' + b.previewPages + '</span><button type="button" class="btn btn--ghost btn--sm" data-action="reader-step" data-d="1">다음 쪽' + ico('chev') + '</button></div></div></div>';
    },
    mount: function (root, ctx) {
      var b = book(ctx.params.id), marks = U.$$('.rpg', root), cur = 1;
      function jump(p) { var el = D.getElementById('pg-' + p) || marks.filter(function (m) { return +m.getAttribute('data-pg') >= p; })[0]; if (!el) return; var y = el.getBoundingClientRect().top + W.pageYOffset - U.$('.shell').offsetHeight - 54; W.scrollTo(0, Math.max(0, y)); }
      K._readerJump = jump;
      function onS() {
        if (!D.getElementById('rbody')) { W.removeEventListener('scroll', onS); return; }
        var off = U.$('.shell').offsetHeight + 80, p = 1;
        for (var i = 0; i < marks.length; i++) { if (marks[i].getBoundingClientRect().top < off) p = +marks[i].getAttribute('data-pg'); else break; }
        if (p !== cur) { cur = p; var rp = U.$('#rpage'); if (rp) rp.textContent = 'p. ' + p + ' / ' + b.previewPages; store.set('read:' + b.id, { p: p, at: Date.now() }); }
        var h = D.documentElement.scrollHeight - W.innerHeight, pr = U.$('#rprog'); if (pr) pr.style.width = Math.min(100, Math.round(W.pageYOffset / Math.max(1, h) * 100)) + '%';
      }
      W.addEventListener('scroll', onS, { passive: true });
      K._readerCur = function () { return cur; };
      var start = +(ctx.query.p || 0);
      if (start > 1) setTimeout(function () { jump(start); onS(); }, 40); else onS();
    }
  };
  K.act('reader-jump', function (el) { if (K._readerJump) K._readerJump(+el.getAttribute('data-p')); });
  K.act('reader-step', function (el) { var c = K._readerCur ? K._readerCur() : 1, b = book(K.ctx.params.id); var n = Math.max(1, Math.min(b.previewPages, c + (+el.getAttribute('data-d')))); if (K._readerJump) K._readerJump(n); });
  K.act('reader-mark', function () {
    var b = book(K.ctx.params.id), p = K._readerCur ? K._readerCur() : 1, list = K.saved(), id = 'pg:' + b.id + ':' + p;
    if (!K.isSaved(id)) { list.unshift({ id: id, t: '『' + b.title + '』 ' + p + '쪽', k: '책갈피', r: '#/wave/' + b.id + '/read?p=' + p, at: Date.now() }); store.set('saved', list); }
    K.toast(p + '쪽에 책갈피를 꽂았어요', 'bookmark');
  });
  K.act('reader-set', function () {
    var rs = store.get('readerSet', { fs: 17, rt: 'paper' });
    K.openModal({ title: '읽기 설정', body: '<div class="rset"><div><p class="field__l">글자 크기</p><div class="seg">' + [15, 17, 19, 21].map(function (s) { return '<button type="button" data-action="reader-fs" data-v="' + s + '" aria-pressed="' + (rs.fs === s) + '" style="font-size:' + (s - 2) + 'px">가' + s + '</button>'; }).join('') + '</div></div>' +
      '<div><p class="field__l">화면</p><div class="seg">' + [['paper', '종이'], ['light', '밝게'], ['dark', '어둡게']].map(function (x) { return '<button type="button" data-action="reader-rt" data-v="' + x[0] + '" aria-pressed="' + (rs.rt === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div></div>' +
      '<p class="xs muted">설정은 이 기기에 저장됩니다.</p></div>' });
  });
  function setReader(k, v) { var rs = store.get('readerSet', { fs: 17, rt: 'paper' }); rs[k] = v; store.set('readerSet', rs); var r = U.$('.reader'); if (r) { if (k === 'fs') r.style.setProperty('--rfs', v + 'px'); else r.setAttribute('data-rt', v); } U.$$('#modal [data-action="reader-' + k + '"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v')) === String(v) ? 'true' : 'false'); }); }
  K.act('reader-fs', function (el) { setReader('fs', +el.getAttribute('data-v')); });
  K.act('reader-rt', function (el) { setReader('rt', el.getAttribute('data-v')); });

  /* ══════════════════════ 미래예측 ══════════════════════ */
  var TAGS = [['work', '일·직업'], ['business', '창업·사업'], ['education', '교육·배움'], ['health', '의료·돌봄'], ['finance', '금융·돈'], ['city', '도시·행정'], ['energy', '에너지'], ['media', '미디어·창작'], ['governance', '규칙·안전'], ['industry', '산업·과학'], ['life', '삶·생각']];
  var ACTIONS = {
    work: '내 업무 하나를 판단·검토·실행 세 칸으로 나눠 적어 보기', business: '이번 주 가장 짜증 났던 30분을 고객 문제로 다시 써 보기', education: '아이(또는 나)에게 AI 사용법보다 질문법 하나 먼저 건네기',
    health: '가족 건강 기록이 어디에 흩어져 있는지 한 장에 정리하기', finance: '자동 결제·자동 승인 중 이유를 모르는 거절 내역 확인하기', city: '내가 동의한 위치·카메라 데이터 권한 목록 점검하기',
    energy: '우리 조직의 AI 사용량과 전력 비용을 함께 묻는 질문 하나 만들기', media: '내가 직접 만든 것임을 보여 줄 과정 기록 남기기', governance: 'AI가 낸 답을 그대로 보내기 전 확인할 세 가지(수치·출처·고유명사) 습관 들이기',
    industry: '내 분야에서 실험 주기를 반으로 줄일 수 있는 지점 찾기', life: '하루 10분, 답을 찾기 전에 질문부터 적는 시간 만들기'
  };
  V.futures = { nav: 'futures', title: '미래예측',
    render: function (ctx) {
      var c = C(), f = c.futures, items = [{ id: 'predict', label: '미래예측 18', n: f.items.length }, { id: 'keywords', label: '키워드 50', n: c.lexicon.terms.length }, { id: 'opps', label: '사업 기회 30', n: c.opps.items.length }, { id: 'scenario', label: '나의 시나리오', icon: 'spark' }];
      var t = pickTab(ctx.query, items), body;
      if (t === 'keywords') body = keywordsTab(ctx);
      else if (t === 'opps') body = oppsTab(ctx);
      else if (t === 'scenario') body = scenarioTab();
      else {
        var k = ctx.query.kind || 'all', list = f.items.filter(function (x) { return k === 'all' || x.kind === k; });
        body = '<section class="sec sec--tight"><div class="wrap"><div class="chips chips--x" style="margin-bottom:14px">' + [['all', '전체'], ['기회', '기회'], ['위협', '위협'], ['양면', '양면']].map(function (x) { return '<a class="chip" href="#/futures?tab=predict' + (x[0] === 'all' ? '' : '&kind=' + encodeURIComponent(x[0])) + '" aria-pressed="' + (x[0] === k) + '">' + esc(x[1]) + (x[0] === 'all' ? '' : ' ' + f.items.filter(function (y) { return y.kind === x[0]; }).length) + '</a>'; }).join('') + '</div>' +
          '<div class="grid grid--2 grid--3">' + list.map(futureCard).join('') + '</div><p class="xs muted mt16">' + esc(f.basis) + ' · 카드에는 요지만 담았습니다. 근거자료와 전문은 『AI 공진화 사피엔스』 별책부록 제8부(450~553쪽)에 있습니다.</p></div></section>';
      }
      return phead([['미래예측']], '제5의 물결 이후, 무엇이 오는가', esc(f.deck)) + tabs('#/futures', items, t) + body;
    },
    mount: function (root, ctx) {
      if (ctx.query.id && (ctx.query.tab || 'predict') === 'predict') openFuture(ctx.query.id);
      var inp = U.$('#kw-q', root); if (inp) { var run = function () { var v = inp.value.trim().toLowerCase(), n = 0; U.$$('[data-kw]', root).forEach(function (el) { var on = !v || el.getAttribute('data-kw').indexOf(v) > -1; el.hidden = !on; if (on) n++; }); var c = U.$('#kw-n', root); if (c) c.textContent = n + '개'; }; inp.addEventListener('input', run); if (ctx.query.q) { inp.value = ctx.query.q; run(); } }
    }
  };
  function openFuture(id) {
    var f = byId(C().futures.items, id); if (!f) return;
    K.openModal({ title: '<span class="card__no">예측 ' + ('0' + f.no).slice(-2) + '</span> ' + esc(f.t), body:
      '<div class="row"><span class="badge kind-' + esc(f.kind) + '">' + esc(f.kind) + '</span><span class="badge">가능성 ' + esc(f.prob) + '</span><span class="badge">' + esc(f.when) + '</span></div>' +
      '<p class="sub mt12">' + esc(f.sub) + '</p><p class="quote mt16">' + esc(f.lead) + '</p>' +
      '<h3 class="h3 mt24">이번 주에 할 수 있는 한 가지</h3><ul class="list mt8">' + (f.tags || []).slice(0, 2).map(function (t) { return '<li>' + ico('target') + '<span>' + esc(ACTIONS[t] || '') + '</span></li>'; }).join('') + '</ul>' +
      '<p class="note mt16">' + ico('book') + '<span>근거·전망 시점·대응 전략 전문은 도서 ' + (f.page ? f.page + '쪽' : '별책부록') + '에서 이어집니다.</span></p>' +
      '<div class="btn-row mt16">' + K.saveBtn('fut:' + f.id, f.t, '미래예측', '#/futures?tab=predict&id=' + f.id, true) + shareBtn('미래예측 ' + f.no + ' · ' + f.t, '#/futures?tab=predict&id=' + f.id, '공유') + '<a class="btn btn--soft btn--sm" href="#/futures?tab=scenario">' + ico('spark') + '나의 시나리오</a></div>' });
  }
  K.act('future-open', function (el) { openFuture(el.getAttribute('data-id')); });
  function keywordsTab(ctx) {
    var L = C().lexicon, g = ctx.query.g, list = L.terms.filter(function (t) { return g == null || g === '' || String(t.g) === g; });
    return '<section class="sec sec--tight"><div class="wrap"><p class="lead" style="margin-top:0">' + esc(L.deck) + '</p>' +
      '<div class="field mt16" style="max-width:420px"><label class="field__l" for="kw-q">키워드 찾기</label><input class="input" id="kw-q" type="search" placeholder="예: 디렉터, 판단, 데이터" autocomplete="off"></div>' +
      '<div class="chips chips--x" style="margin-bottom:12px"><a class="chip" href="#/futures?tab=keywords" aria-pressed="' + (g == null) + '">전체</a>' + L.groups.map(function (x, i) { return '<a class="chip" href="#/futures?tab=keywords&g=' + i + '" aria-pressed="' + (g === String(i)) + '">' + esc(x.t.split('—')[0].trim()) + '</a>'; }).join('') + '</div>' +
      '<p class="xs muted" id="kw-n">' + list.length + '개</p><div class="grid grid--2 grid--3 mt8">' + list.map(function (t) { return '<div class="card lex" data-kw="' + attr((t.k + ' ' + t.d).toLowerCase()) + '"><p class="lex__k"><span class="lex__n">' + ('0' + t.n).slice(-2) + '</span>' + esc(t.k) + '</p><p class="card__d">' + esc(t.d) + '</p><div class="card__f"><span class="xs">' + esc((L.groups[t.g] || {}).t ? L.groups[t.g].t.split('—')[0].trim() : '') + '</span>' + K.saveBtn('kw:' + t.n, t.k, '키워드', '#/futures?tab=keywords&q=' + encodeURIComponent(t.k)) + '</div></div>'; }).join('') + '</div>' +
      '<p class="xs muted mt16">뜻풀이는 요지만 옮겼습니다. 낱말이 태어난 장면과 쓰임새는 도서 보너스장(399쪽~)에서 이어집니다.</p></div></section>';
  }
  function oppsTab(ctx) {
    var O = C().opps, g = ctx.query.g, list = O.items.filter(function (o) { return g == null || g === '' || String(o.g) === g; });
    return '<section class="sec sec--tight"><div class="wrap"><p class="lead" style="margin-top:0">' + esc(O.deck) + '</p>' +
      '<div class="chips chips--x mt16" style="margin-bottom:12px"><a class="chip" href="#/futures?tab=opps" aria-pressed="' + (g == null) + '">전체 30</a>' + O.groups.map(function (x, i) { return '<a class="chip" href="#/futures?tab=opps&g=' + i + '" aria-pressed="' + (g === String(i)) + '">' + esc(x.t) + '</a>'; }).join('') + '</div>' +
      (g != null && O.groups[+g] ? '<p class="note" style="margin-bottom:12px">' + ico('info') + '<span>' + esc(O.groups[+g].d) + '</span></p>' : '') +
      '<div class="grid grid--2 grid--3">' + list.map(function (o) { return '<div class="card"><div class="row"><span class="card__no">' + ('0' + o.n).slice(-2) + '</span><span class="badge badge--gold">' + esc(o.tier || '') + '</span><span style="margin-left:auto">' + K.saveBtn('opp:' + o.n, o.k, '사업 기회', '#/futures?tab=opps') + '</span></div><p class="card__t mt8">' + esc(o.k) + '</p><p class="card__d">' + esc(o.d) + '</p></div>'; }).join('') + '</div>' +
      '<div class="card card--glow mt24"><p class="card__t">아이디어를 실제 사업으로 옮기고 싶다면</p><p class="card__d">AI 비즈니스·혁신 랩과 AI 솔루션 구축 패키지로 첫 파일럿까지 함께 설계합니다.</p><div class="btn-row mt12">' + aBtn('사업화 상담', '#/contact?type=solution', 'btn--pri btn--sm', 'mail') + aBtn('비즈니스·혁신 랩', '#/labs/lab-business', 'btn--ghost btn--sm') + '</div></div></div></section>';
  }
  function scenarioTab() {
    var sc = store.get('scenario', { role: '', tags: [] }), roles = ['직장인', '창업가·사업가', '부모·교육자', '공공·정책 실무자', '학생·청년'];
    var f = C().futures.items, picked = sc.tags || [];
    var matched = picked.length ? f.map(function (x) { return { x: x, s: (x.tags || []).filter(function (t) { return picked.indexOf(t) > -1; }).length }; }).filter(function (y) { return y.s > 0; }).sort(function (a, b) { return b.s - a.s || a.x.no - b.x.no; }).slice(0, 6) : [];
    return '<section class="sec sec--tight"><div class="wrap"><div class="split"><div>' +
      '<h2 class="h3">1. 나는 지금</h2><div class="chips mt8">' + roles.map(function (r) { return '<button type="button" class="chip" data-action="sc-role" data-v="' + attr(r) + '" aria-pressed="' + (sc.role === r) + '">' + esc(r) + '</button>'; }).join('') + '</div>' +
      '<h2 class="h3 mt24">2. 관심 분야 (여러 개)</h2><div class="chips mt8">' + TAGS.map(function (t) { return '<button type="button" class="chip" data-action="sc-tag" data-v="' + t[0] + '" aria-pressed="' + (picked.indexOf(t[0]) > -1) + '">' + esc(t[1]) + '</button>'; }).join('') + '</div>' +
      '<p class="xs muted mt12">고를 때마다 오른쪽 시나리오가 바로 바뀝니다. 선택은 이 기기에 저장됩니다.</p></div>' +
      '<div class="mt24 print-area"><div class="card card--feat"><h2 class="h3">' + (sc.role ? esc(sc.role) + '의 ' : '') + '미래 시나리오</h2>' +
      (matched.length ? '<p class="xs muted mt8">나에게 가까운 예측 ' + matched.length + '개</p><div class="stack mt12">' + matched.map(function (m) { return '<button type="button" class="mini" data-action="future-open" data-id="' + attr(m.x.id) + '" style="width:100%;text-align:left"><span class="badge kind-' + esc(m.x.kind) + '">' + esc(m.x.kind) + '</span><span class="mini__t">' + esc(m.x.t) + '</span>' + ico('chev', 'mini__go') + '</button>'; }).join('') + '</div>' +
        '<h3 class="h3 mt24">이번 주에 할 일 3가지</h3><ol class="olist mt8">' + picked.slice(0, 3).map(function (t) { return '<li>' + esc(ACTIONS[t]) + '</li>'; }).join('') + (picked.length < 3 ? '<li>' + esc(ACTIONS.life) + '</li>' : '') + '</ol>' +
        '<div class="btn-row mt16 no-print"><button type="button" class="btn btn--pri btn--sm" data-action="sc-save">' + ico('bookmark') + '시나리오 저장</button><button type="button" class="btn btn--ghost btn--sm" data-action="print">' + ico('print') + 'PDF·인쇄</button>' + shareBtn('나의 미래 시나리오 만들기', '#/futures?tab=scenario', '공유') + '</div>'
        : '<div class="empty mt12">' + ico('spark') + '<p class="empty__t">관심 분야를 하나 이상 골라 주세요</p><p class="small mt8">예: 직장인 + 일·직업 + 교육·배움 → 예측 02 · 06 · 07</p><button type="button" class="btn btn--soft btn--sm mt12" data-action="sc-sample">예시로 채워 보기</button></div>') +
      '</div></div></div></div></section>';
  }
  K.act('sc-role', function (el) { var s = store.get('scenario', { role: '', tags: [] }); s.role = el.getAttribute('data-v'); store.set('scenario', s); K.render(); });
  K.act('sc-tag', function (el) { var s = store.get('scenario', { role: '', tags: [] }), v = el.getAttribute('data-v'), i = s.tags.indexOf(v); if (i > -1) s.tags.splice(i, 1); else s.tags.push(v); store.set('scenario', s); K.render(); });
  K.act('sc-sample', function () { store.set('scenario', { role: '직장인', tags: ['work', 'education', 'life'] }); K.render(); });
  K.act('sc-save', function () { var s = store.get('scenario', { role: '', tags: [] }), rec = store.get('records', []); rec.unshift({ id: U.uid('r'), kind: '미래 시나리오', t: (s.role || '나') + '의 시나리오', d: s.tags.map(function (t) { return (TAGS.filter(function (x) { return x[0] === t; })[0] || [0, t])[1]; }).join(' · '), r: '#/futures?tab=scenario', at: Date.now() }); store.set('records', rec.slice(0, 50)); K.toast('마이 › 기록에 저장했어요', 'bookmark'); });

  /* ══════════════════════ 커뮤니티 ══════════════════════ */
  function boardName(id) { var b = byId(C().boards, id); return b ? b.ko : '라운지'; }
  function authorLabel(p) { return p.anon ? '익명' : (p.author || '익명'); }
  function postItem(p) {
    return '<a class="post" href="#/community/post/' + attr(p.id) + '"><div class="post__meta"><span class="badge badge--brand">' + esc(boardName(p.board)) + '</span>' + (p.pinned ? '<span class="badge badge--gold">고정</span>' : '') + sample(p) + (p.src === 'local' ? '<span class="badge badge--cyan">내 글</span>' : '') + '<span>' + esc(authorLabel(p)) + '</span><span>· ' + esc(p.when || U.nowLabel(p.ts)) + '</span></div>' +
      '<p class="post__t">' + esc(p.title || (p.body || '').slice(0, 40)) + '</p><p class="post__b">' + esc(p.body) + '</p>' +
      '<div class="post__f"><span>' + ico('heart') + K.data.likeCount(p) + '</span><span>' + ico('comment') + ((p.replies || []).length + K.data.replies(p.id).length) + '</span>' + (p.views ? '<span>' + ico('eye') + p.views + '</span>' : '') + '</div></a>';
  }
  V.community = { nav: 'community', title: '커뮤니티',
    render: function (ctx) {
      var c = C(), items = [{ id: 'lounge', label: '라운지', icon: 'chat' }, { id: 'network', label: '네트워크', icon: 'users' }, { id: 'events', label: '일정', icon: 'cal' }, { id: 'weekly', label: '주간 질문', icon: 'help' }];
      var t = pickTab(ctx.query, items), body;
      if (t === 'network') body = networkTab(ctx);
      else if (t === 'events') body = eventsTab();
      else if (t === 'weekly') body = weeklyTab();
      else {
        var bd = ctx.query.board || 'all', sort = ctx.query.sort || 'new';
        var ps = K.data.allPosts().filter(function (p) { return bd === 'all' || p.board === bd; });
        if (sort === 'hot') ps = ps.slice().sort(function (a, b) { return K.data.likeCount(b) - K.data.likeCount(a); });
        else ps = ps.slice().sort(function (a, b) { return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0); });
        var q = function (o) { var x = { board: bd, sort: sort }; Object.keys(o).forEach(function (k) { x[k] = o[k]; }); return '#/community?tab=lounge' + (x.board !== 'all' ? '&board=' + x.board : '') + (x.sort !== 'new' ? '&sort=' + x.sort : ''); };
        body = '<section class="sec sec--tight"><div class="wrap" style="max-width:860px">' +
          '<div class="row row--between"><div class="chips chips--x" style="flex:1 1 auto">' + [{ id: 'all', ko: '전체' }].concat(c.boards).map(function (b) { return '<a class="chip" href="' + attr(q({ board: b.id })) + '" aria-pressed="' + (b.id === bd) + '">' + esc(b.ko) + '</a>'; }).join('') + '</div></div>' +
          '<div class="row row--between mt12"><div class="chips"><a class="chip" href="' + attr(q({ sort: 'new' })) + '" aria-pressed="' + (sort === 'new') + '">최신순</a><a class="chip" href="' + attr(q({ sort: 'hot' })) + '" aria-pressed="' + (sort === 'hot') + '">공감순</a></div><button type="button" class="btn btn--pri btn--sm" data-action="post-write" data-board="' + attr(bd === 'all' ? 'free' : bd) + '">' + ico('pen') + '글쓰기</button></div>' +
          '<div class="mt16">' + (ps.length ? ps.map(postItem).join('') : '<div class="empty">' + ico('chat') + '<p class="empty__t">이 게시판의 첫 글을 남겨 주세요</p></div>') + '</div>' +
          '<details class="card mt16" style="padding:0"><summary style="padding:14px 16px;cursor:pointer;font-weight:700">커뮤니티 이용 원칙</summary><ul class="list" style="padding:0 16px 12px">' + c.communityGuide.map(function (g) { return '<li>' + ico('check') + '<span>' + esc(g) + '</span></li>'; }).join('') + '<li>' + ico('lock') + '<span>파일·이미지 첨부는 받지 않습니다(서버 과부하·저작권 보호). 링크는 출처와 함께 적어 주세요.</span></li></ul></details></div></section>';
      }
      return phead([['커뮤니티']], '라운지 · 네트워크 · 일정', '질문하고, 사례를 나누고, 함께할 사람을 찾습니다. 글마다 이름 공개 여부를 고를 수 있어요.') + tabs('#/community', items, t) + body;
    }
  };
  function networkTab(ctx) {
    var c = C(), kind = ctx.query.kind || 'expert', cat = ctx.query.cat || 'all';
    var base = '#/community?tab=network&kind=' + kind;
    var list = kind === 'org' ? c.orgs : c.experts.filter(function (e) { return cat === 'all' || e.cat === cat; });
    return '<section class="sec sec--tight"><div class="wrap"><div class="note" style="margin-bottom:14px">' + ico('info') + '<span>네트워크의 인물·기관은 매칭 기능을 보여 드리기 위한 <b>설계 예시</b>입니다. 실제 연구위원·협력기관은 동의를 받아 순차 공개합니다.</span></div>' +
      '<div class="chips"><a class="chip" href="#/community?tab=network&kind=expert" aria-pressed="' + (kind === 'expert') + '">' + ico('user', 'ico--sm') + '전문가 ' + c.experts.length + '</a><a class="chip" href="#/community?tab=network&kind=org" aria-pressed="' + (kind === 'org') + '">' + ico('building', 'ico--sm') + '기관 ' + c.orgs.length + '</a></div>' +
      (kind === 'expert' ? '<div class="chips chips--x mt12">' + c.matchFilters.cat.map(function (x) { return '<a class="chip" href="' + attr(base + (x.id === 'all' ? '' : '&cat=' + x.id)) + '" aria-pressed="' + (x.id === cat) + '">' + esc(x.ko) + '</a>'; }).join('') + '</div>' : '') +
      '<div class="grid grid--2 grid--3 mt16">' + list.map(function (e) {
        if (kind === 'org') return '<div class="card"><div class="row"><span class="badge badge--cyan">' + esc(e.type) + '</span><span class="badge">' + esc(e.size) + '</span>' + sample(e) + '</div><p class="card__t mt8">' + esc(e.name) + '</p><p class="xs muted">' + esc(e.region) + ' · ' + status(e.stage) + '</p><p class="card__d">' + esc(e.need) + '</p></div>';
        return '<button type="button" class="card" data-action="expert-open" data-id="' + attr(e.id) + '"><span class="row"><span class="avatar">' + esc(e.name.slice(0, 1)) + '</span><span><span class="card__t" style="display:block;font-size:15px">' + esc(e.name) + '</span><span class="xs muted">' + esc(e.role + ' · ' + e.region) + '</span></span></span><span class="card__d" style="display:block">' + esc(e.intro) + '</span><span class="chips mt8">' + (e.offer || []).map(function (o) { return '<span class="badge">' + esc(o) + '</span>'; }).join('') + '</span></button>';
      }).join('') + '</div>' +
      '<div class="card card--glow mt24"><p class="card__t">연구위원·협력기관으로 함께하기</p><p class="card__d">전문 분야와 가능한 협력 방식을 알려 주시면 검토 후 연락드립니다.</p><div class="btn-row mt12">' + aBtn('참여 신청', '#/contact?type=network', 'btn--pri btn--sm', 'hand') + '</div></div></div></section>';
  }
  K.act('expert-open', function (el) {
    var e = byId(C().experts, el.getAttribute('data-id')); if (!e) return;
    K.openModal({ title: esc(e.name), body: '<div class="row"><span class="avatar">' + esc(e.name.slice(0, 1)) + '</span><div><p class="small"><b>' + esc(e.role) + '</b> · ' + esc(catName(e.cat)) + '</p><p class="xs muted">' + esc(e.region + ' · ' + e.mode) + '</p></div>' + sample(e) + '</div>' +
      '<p class="sub mt16">' + esc(e.intro) + '</p><div class="chips mt12">' + (e.tags || []).map(function (t) { return '<span class="chip">#' + esc(t) + '</span>'; }).join('') + '</div>' +
      '<dl class="kv mt16"><dt>협력 방식</dt><dd>' + esc((e.offer || []).join(' · ')) + '</dd><dt>상태</dt><dd>' + esc(e.availability || '') + '</dd></dl>' +
      '<div class="btn-row mt24">' + aBtn('협력 제안하기', '#/contact?type=network&to=' + e.id, 'btn--pri', 'hand') + K.saveBtn('ex:' + e.id, e.name, '네트워크', '#/community?tab=network', true) + '</div>' });
  });
  function eventsTab() {
    var c = C();
    return '<section class="sec sec--tight"><div class="wrap"><div class="note" style="margin-bottom:14px">' + ico('cal') + '<span>일정은 운영 계획(설계 예시)입니다. 확정되면 알림과 파도 편지로 먼저 안내합니다. ‘관심 등록’을 해 두세요.</span></div><div class="grid grid--2">' + c.events.map(function (e) {
      return '<div class="card"><div class="row"><span class="badge badge--cyan">' + esc(e.kind) + '</span>' + status(e.status) + sample(e) + '<span class="badge" style="margin-left:auto">' + esc(e.period) + '</span></div><p class="card__t mt8">' + esc(e.title) + '</p><dl class="kv mt8"><dt>장소</dt><dd>' + esc(e.place) + '</dd><dt>대상</dt><dd>' + esc(e.target) + '</dd><dt>규모</dt><dd>' + esc(e.capacity) + '</dd></dl><div class="btn-row mt12">' + K.saveBtn('ev:' + e.id, e.title, '관심 일정', '#/community?tab=events', true) + (e.route ? aBtn('관련 프로그램', e.route, 'btn--soft btn--sm') : '') + '</div></div>';
    }).join('') + '</div></div></section>';
  }
  function weeklyTab() {
    var c = C(), ans = store.get('weekly', {});
    return '<section class="sec sec--tight"><div class="wrap" style="max-width:760px"><p class="lead" style="margin-top:0">일주일에 질문 하나. 답은 이 기기에만 저장되고, 원하면 라운지에 공유할 수 있습니다.</p><div class="stack mt16">' + c.weeklyQuestions.map(function (q, i) {
      return '<form class="card" data-form="weekly" novalidate><input type="hidden" name="i" value="' + i + '"><p class="qnum">WEEK ' + (i + 1) + '</p><p class="qtext" style="font-size:15.5px">' + esc(q.q) + '</p>' + K.field({ name: 'a', label: '나의 답', type: 'textarea', max: 600, value: ans[i] || '', ph: '한두 문장이면 충분합니다' }) +
        '<div class="btn-row"><button class="btn btn--soft btn--sm" type="submit">' + ico('check') + '저장</button><button type="button" class="btn btn--ghost btn--sm" data-action="weekly-share" data-i="' + i + '">' + ico('share') + '라운지에 공유</button>' + (q.link ? aBtn('관련 아젠다', q.link, 'btn--ghost btn--sm') : '') + '</div></form>';
    }).join('') + '</div></div></section>';
  }
  K.form('weekly', function (f) { var a = store.get('weekly', {}); a[f.elements.i.value] = f.elements.a.value.trim(); store.set('weekly', a); K.toast('내 답을 저장했어요', 'check'); });
  K.act('weekly-share', function (el) { var i = el.getAttribute('data-i'), a = store.get('weekly', {})[i] || '', q = C().weeklyQuestions[+i]; openWrite('free', '[주간 질문] ' + q.q.slice(0, 50), a); });

  function openWrite(board, title, body) {
    var c = C(), u = K.user;
    K.openModal({ title: board === 'book' ? '한 문장 남기기' : '글쓰기', body:
      '<form data-form="post" novalidate>' +
      K.field({ name: 'board', label: '게시판', type: 'select', value: board || 'free', options: c.boards.map(function (b) { return { v: b.id, t: b.ko }; }) }) +
      K.field({ name: 'title', label: board === 'book' ? '한 문장 (제목)' : '제목', req: true, max: c.site.security.titleMaxLen || 80, value: title || '', ph: board === 'book' ? '책을 덮고 남은 문장 하나' : '무엇에 대한 이야기인가요?' }) +
      K.field({ name: 'body', label: '내용', type: 'textarea', req: true, max: c.site.security.communityMaxLen || 2000, counter: true, value: body || '', ph: '질문·사례·생각을 자유롭게. 개인 연락처는 적지 마세요.' }) +
      K.field({ name: 'author', label: '표시 이름', max: 20, value: u ? u.name : '', ph: '예: 파도읽는사람', help: '익명을 켜면 이름 대신 ‘익명’으로 보입니다.' }) +
      K.field({ name: 'org', label: '소속(선택)', max: 30, ph: '예: 중견제조 · 조직전환 담당' }) +
      '<label class="check"><input type="checkbox" name="anon" checked> <span><b>익명으로 게시</b> — 이름과 소속을 숨깁니다(기본값).</span></label>' +
      '<label class="check"><input type="checkbox" name="agree"> <span>이용 원칙(존중·출처·저작권)을 지키며, 타인의 개인정보를 적지 않겠습니다.</span></label><div class="field" style="margin:0"><div class="field__e" role="alert"></div></div>' +
      '<input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<p class="xs muted" style="margin:8px 0 12px">파일·이미지 첨부는 지원하지 않습니다. ' + (K.dbOn ? '등록한 글은 운영 원칙에 따라 관리자가 숨길 수 있습니다.' : '현재 정적 배포 모드라 글은 이 기기에 저장됩니다.') + '</p>' +
      '<button class="btn btn--pri btn--block" type="submit">' + ico('pen') + '등록하기</button></form>' });
  }
  K.act('post-write', function (el) { openWrite(el.getAttribute('data-board') || 'free'); });
  K.form('post', function (f) {
    var c = C(), ok = K.validate(f, { title: { req: true, min: 2, max: c.site.security.titleMaxLen || 80 }, body: { req: true, min: 5, max: c.site.security.communityMaxLen || 2000 }, author: { max: 20 }, org: { max: 30 } });
    var fs = f.querySelectorAll('.field'), agreeF = fs[fs.length - 1];
    if (!f.elements.agree.checked) { agreeF.classList.add('err'); agreeF.querySelector('.field__e').textContent = '이용 원칙에 동의해 주세요.'; ok = false; } else agreeF.classList.remove('err');
    if (!ok) return;
    if (!K.rateOk('post', 20)) { K.toast('잠시 후 다시 등록해 주세요(연속 등록 제한 20초)', 'clock'); return; }
    var anon = f.elements.anon.checked, name = f.elements.author.value.trim(), org = f.elements.org.value.trim();
    var p = { id: U.uid('p'), board: f.elements.board.value, title: f.elements.title.value.trim(), body: f.elements.body.value.trim(), anon: anon, author: anon ? '익명' : (name || '익명') + (org ? ' · ' + org : ''), likes: 0, ts: Date.now(), replies: [] };
    K.data.addPost(p).then(function (saved) { K.closeAll(false); K.toast('등록했어요', 'check'); K.go('#/community/post/' + (saved && saved.id || p.id)); })
      .catch(function (e) { K.toast(e.status === 429 ? '등록이 너무 잦아요. 잠시 후 다시 시도해 주세요' : '등록하지 못했어요. 잠시 후 다시 시도해 주세요', 'x'); });
  });
  V.post = { nav: 'community', title: function (ctx) { var p = K.data.post(ctx.params.id); return p ? (p.title || '게시글') : '게시글'; },
    exists: function (p) { return !!K.data.post(p.id); },
    render: function (ctx) {
      var p = K.data.post(ctx.params.id), rs = (p.replies || []).concat(K.data.replies(p.id)), liked = K.data.liked(p.id);
      return phead([['커뮤니티', '#/community'], [boardName(p.board), '#/community?tab=lounge&board=' + p.board]], esc(p.title || '한 문장'), '', '<div class="post__meta mt12">' + sample(p) + '<span>' + esc(authorLabel(p)) + '</span><span>· ' + esc(p.when || U.nowLabel(p.ts)) + '</span>' + (p.views ? '<span>· 조회 ' + p.views + '</span>' : '') + '</div>') +
        '<section class="sec sec--tight"><div class="wrap" style="max-width:760px"><p style="white-space:pre-line;font-size:15.5px">' + esc(p.body) + '</p>' + ((p.tags || []).length ? '<div class="chips mt16">' + p.tags.map(function (t) { return '<span class="tag">#' + esc(t) + '</span>'; }).join(' ') + '</div>' : '') +
        '<div class="row mt24"><button type="button" class="likebtn" data-action="like" data-id="' + attr(p.id) + '" aria-pressed="' + liked + '">' + ico('heart') + '공감 <b id="likes-n">' + K.data.likeCount(p) + '</b></button>' + shareBtn(p.title || '커뮤니티 글', '#/community/post/' + p.id, '공유') + '<button type="button" class="btn btn--ghost btn--sm" data-action="report" data-id="' + attr(p.id) + '">' + ico('flag') + '신고</button>' + (p.src === 'local' ? '<button type="button" class="btn btn--ghost btn--sm" data-action="post-del" data-id="' + attr(p.id) + '">' + ico('trash') + '삭제</button>' : '') + '</div>' +
        '<hr class="divider"><h2 class="h3">댓글 ' + rs.length + '</h2><div class="mt8">' + (rs.length ? rs.map(function (r) { return '<div class="reply"><p class="reply__a">' + esc(r.author || '익명') + ' <span class="muted" style="font-weight:500">· ' + esc(r.when || U.nowLabel(r.ts)) + '</span></p><p class="reply__b">' + esc(r.body) + '</p></div>'; }).join('') : '<p class="small muted">첫 댓글을 남겨 주세요.</p>') + '</div>' +
        '<form class="mt16" data-form="reply" novalidate><input type="hidden" name="id" value="' + attr(p.id) + '">' + K.field({ name: 'body', label: '댓글', type: 'textarea', req: true, max: 600, ph: '존중하는 언어로, 경험을 나눠 주세요' }) + K.field({ name: 'author', label: '표시 이름(비우면 익명)', max: 20, value: K.user ? K.user.name : '' }) + '<input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><button class="btn btn--pri btn--sm" type="submit">' + ico('comment') + '댓글 등록</button></form>' +
        '<div class="btn-row mt32">' + aBtn('목록으로', '#/community', 'btn--ghost btn--sm', 'list') + '</div></div></section>';
    }
  };
  K.act('like', function (el) { var p = K.data.post(el.getAttribute('data-id')); if (!p) return; var on = K.data.toggleLike(p); el.setAttribute('aria-pressed', on); var n = U.$('#likes-n'); if (n) n.textContent = K.data.likeCount(p); });
  K.act('report', function (el) {
    K.openModal({ title: '신고하기', body: '<form data-form="report" novalidate><input type="hidden" name="id" value="' + attr(el.getAttribute('data-id')) + '">' + K.field({ name: 'why', label: '사유', type: 'select', options: ['광고·홍보', '욕설·비방', '개인정보 노출', '저작권 침해', '기타'] }) + '<button class="btn btn--pri btn--block" type="submit">신고 접수</button></form>' });
  });
  K.form('report', function (f) { var r = store.get('reports', []); r.push({ id: f.elements.id.value, why: f.elements.why.value, at: Date.now() }); store.set('reports', r); var h = store.get('hiddenPosts', []); h.push(f.elements.id.value); store.set('hiddenPosts', h); if (K.dbOn && (K.data.post(f.elements.id.value) || {}).src === 'server') K.api('community/report', { method: 'POST', body: { postId: f.elements.id.value, why: f.elements.why.value } }).catch(function () {}); K.closeAll(false); K.toast('신고를 접수했어요. 이 글은 내 화면에서 숨겼습니다', 'flag'); K.go('#/community'); });
  K.act('post-del', function (el) { var id = el.getAttribute('data-id'); store.set('posts', K.data.localPosts().filter(function (p) { return p.id !== id; })); K.toast('삭제했어요', 'trash'); K.go('#/community'); });
  K.form('reply', function (f) {
    if (!K.validate(f, { body: { req: true, min: 2, max: 600 }, author: { max: 20 } })) return;
    if (!K.rateOk('reply', 8)) { K.toast('잠시 후 다시 등록해 주세요', 'clock'); return; }
    var id = f.elements.id.value, p = K.data.post(id);
    K.data.addReply(id, { author: f.elements.author.value.trim() || '익명', body: f.elements.body.value.trim(), ts: Date.now() }, p && p.src).then(function (r) { if (p && p.src === 'server' && r) { p.replies = (p.replies || []).concat([r]); } K.render(true); K.toast('댓글을 남겼어요', 'comment'); })
      .catch(function () { K.toast('등록하지 못했어요. 잠시 후 다시 시도해 주세요', 'x'); });
  });

  /* ══════════════════════ 연구원소개 ══════════════════════ */
  V.about = { nav: 'about', title: '연구원소개',
    render: function (ctx) {
      var c = C(), s = c.site, items = [{ id: 'intro', label: '소개' }, { id: 'director', label: '원장' }, { id: 'declaration', label: '10대 창립선언' }, { id: 'roadmap', label: '로드맵' }, { id: 'value', label: '4대 가치' }, { id: 'guide', label: '이용안내·FAQ' }];
      var t = pickTab(ctx.query, items), body;
      if (t === 'director') {
        var d = s.director;
        body = '<section class="sec sec--tight"><div class="wrap" style="max-width:820px"><div class="row" style="gap:14px"><span class="avatar" style="width:64px;height:64px;font-size:24px">' + esc(d.name.slice(0, 1)) + '</span><div><p class="xs muted">원장</p><h2 class="h2">' + esc(d.name) + '</h2><p class="small sub">' + esc(d.role) + '</p></div></div>' +
          (d.quote ? '<p class="quote mt24">' + esc(d.quote) + '</p>' : '') + '<div class="mt24">' + (d.bio || []).map(function (p) { return '<p class="sub" style="margin-bottom:12px">' + esc(p) + '</p>'; }).join('') + '</div>' + (d.bioSource ? '<p class="xs muted">' + esc(d.bioSource) + '</p>' : '') +
          '<div class="btn-row mt16">' + aBtn('강연·자문 문의', '#/contact?type=lecture', 'btn--pri', 'mail') + aBtn('『AI 공진화 사피엔스』', '#/wave/sapiens', 'btn--ghost', 'book') + '</div></div></section>';
      } else if (t === 'declaration') {
        body = '<section class="sec sec--tight"><div class="wrap" style="max-width:860px"><div class="stack">' + c.declarations.map(function (x, i) { return '<details class="card" style="padding:0"' + (i === 0 ? ' open' : '') + '><summary style="padding:15px 16px;cursor:pointer;list-style-position:inside"><span class="card__no">제' + (i + 1) + '조</span> <b>' + esc(x.title) + '</b><span class="small sub" style="display:block;margin-top:4px;padding-left:18px">' + esc(x.short) + '</span></summary><p class="small sub" style="padding:0 16px 16px">' + esc(x.body) + '</p></details>'; }).join('') + '</div><p class="quote mt24">' + esc(c.declarationClosing) + '</p></div></section>';
      } else if (t === 'roadmap') {
        body = '<section class="sec sec--tight"><div class="wrap"><div class="grid grid--3">' + c.roadmap.map(function (r, i) { return '<div class="card' + (i === 0 ? ' card--glow' : '') + '"><span class="badge badge--cyan">' + esc(r.term) + '</span><p class="card__t mt8">' + esc(r.name) + '</p><ul class="list mt8">' + r.items.map(function (x) { return '<li>' + ico('check') + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul></div>'; }).join('') + '</div><p class="note mt16">' + ico('flag') + '<span>로드맵은 설립·운영 계획이며, 진행 상황은 알림과 파도 편지로 공개합니다.</span></p></div></section>';
      } else if (t === 'value') {
        body = '<section class="sec sec--tight"><div class="wrap"><div class="grid grid--2">' + c.valueTabs.map(function (v, i) { return '<div class="card"><span class="card__ic ' + (['', 'card__ic--cyan', 'card__ic--gold', ''][i] || '') + '">' + ico(['target', 'users', 'shield', 'spark'][i] || 'spark') + '</span><p class="card__t">' + esc(v.title) + '</p><p class="card__d">' + esc(v.text) + '</p></div>'; }).join('') + '</div></div></section>';
      } else if (t === 'guide') {
        body = '<section class="sec sec--tight"><div class="wrap">' + secH('처음 오셨다면', '나에게 맞는 시작점') + '<div class="grid grid--2 grid--4">' + c.startHere.map(function (x) { return '<a class="card" href="' + attr(x.route) + '"><span class="card__ic">' + ico(x.icon || 'arrow') + '</span><span class="card__t" style="display:block">' + esc(x.name) + '</span><span class="card__d" style="display:block">' + esc(x.line) + '</span></a>'; }).join('') + '</div>' +
          '<h2 class="h2 mt32">자주 묻는 질문</h2><div class="mt12">' + c.faq.map(faqItem).join('') + '</div>' +
          '<h2 class="h2 mt32">용어 풀이</h2><div class="grid grid--2 mt12">' + c.glossary.map(function (g) { return '<div class="card"><p class="card__t">' + esc(g.term) + ' <span class="xs muted">' + esc(g.en || '') + '</span></p><p class="card__d">' + esc(g.def) + '</p></div>'; }).join('') + '</div>' +
          '<h2 class="h2 mt32">이용 원칙</h2><ul class="list mt8"><li>' + ico('lock') + '<span>진단·저장·읽던 쪽 기록은 기본적으로 이 기기(브라우저)에만 저장됩니다. 마이 › 설정에서 언제든 지울 수 있습니다.</span></li><li>' + ico('shield') + '<span>설계 예시 데이터는 따로 표시하며, 실적·회원 수처럼 확인되지 않은 수치는 쓰지 않습니다.</span></li><li>' + ico('pen') + '<span>로고·아이콘·도식은 자체 제작 원본입니다. 외부 웹폰트·CDN을 쓰지 않습니다.</span></li><li>' + ico('file') + '<span>외부 사용자의 파일 업로드는 받지 않습니다. 문의·댓글·공감은 누구나 남길 수 있습니다.</span></li></ul></div></section>';
      } else {
        body = '<section class="sec sec--tight"><div class="wrap"><div class="split"><div><p class="eyebrow">' + esc(s.abbr) + ' · ' + esc(s.nameEn) + '</p><h2 class="h2">' + esc(s.identityHeadline) + '</h2><p class="sub mt12">' + esc(s.identitySub) + '</p><p class="small muted mt12" style="font-family:var(--mono);font-size:12px">' + esc(s.focusLine) + '</p>' +
          '<h3 class="h3 mt24">' + esc(s.whyNowHeadline) + '</h3><p class="sub mt8">' + esc(s.whyNowBody) + '</p><ul class="list mt8">' + s.whyNowPoints.map(function (x) { return '<li>' + ico('check') + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul></div>' +
          '<div class="mt24"><p class="quote">' + esc(s.quote) + '</p><p class="small sub mt12">' + esc(s.quoteSub) + '</p><div class="grid grid--2m mt16">' + c.metrics.slice(0, 4).map(function (m) { return '<div class="stat"><p class="stat__k">' + esc(m.kind) + '</p><p class="stat__v">' + esc(m.value) + '<small>' + esc(m.unit) + '</small></p><p class="stat__l">' + esc(m.label) + '</p></div>'; }).join('') + '</div><p class="xs muted mt8">설계치·목표는 실적이 아니라 운영 설계 기준입니다.</p></div></div>' +
          '<h2 class="h2 mt32">연락처</h2><div class="grid grid--2 mt12"><a class="mini" href="mailto:' + attr(s.email) + '"><span class="mini__ic">' + ico('mail') + '</span><span><span class="mini__t">' + esc(s.email) + '</span><span class="mini__d" style="display:block">협력·강연·컨설팅·취재 문의</span></span></a><a class="mini" href="#/contact"><span class="mini__ic">' + ico('pen') + '</span><span><span class="mini__t">온라인 문의 접수</span><span class="mini__d" style="display:block">유형을 고르면 담당 연구랩으로 연결됩니다</span></span></a></div>' +
          '<p class="note mt16">' + ico('pin') + '<span>방문 상담은 사전 예약제로 운영합니다. 문의를 남기시면 일정과 장소를 안내해 드립니다.</span></p></div></section>';
      }
      return phead([['연구원소개']], esc(s.nameKo), esc(s.tagline)) + tabs('#/about', items, t) + body;
    }
  };

  /* ══════════════════════ 협력문의 ══════════════════════ */
  var TYPES = [{ v: 'solution', t: 'AI 솔루션 구축·전략컨설팅' }, { v: 'academy', t: '교육·아카데미(사내·위탁)' }, { v: 'lecture', t: '강연·자문' }, { v: 'forum', t: '포럼·세미나 참여/공동개최' }, { v: 'lab', t: '공동연구 제안' }, { v: 'report', t: '리포트·출판·미디어' }, { v: 'network', t: '연구위원·협력기관 참여' }, { v: 'etc', t: '기타' }];
  V.contact = { nav: 'about', title: '협력·문의',
    render: function (ctx) {
      var q = ctx.query, type = TYPES.some(function (x) { return x.v === q.type; }) ? q.type : 'solution';
      var pkg = q.pkg ? byId(C().solution.packages, q.pkg) : null, pre = (pkg ? '[희망 패키지] ' + pkg.name + '\n' : '') + (q.diag ? '[조직 진단 결과] ' + q.diag + '%\n' : '') + (q.to ? '[협력 희망 대상] ' + ((byId(C().experts, q.to) || {}).name || '') + '\n' : '');
      return phead([['연구원소개', '#/about'], ['협력·문의']], '협력 · 상담 문의', '유형을 고르고 몇 줄만 적어 주세요. 영업일 기준 2일 안에 회신드립니다(목표).') +
        '<section class="sec sec--tight"><div class="wrap"><div class="split"><form class="card" style="padding:20px" data-form="inquiry" novalidate>' +
        K.field({ name: 'type', label: '문의 유형', type: 'select', value: type, options: TYPES, req: true }) +
        K.field({ name: 'name', label: '이름', req: true, max: 30, auto: 'name' }) +
        K.field({ name: 'org', label: '소속·기관(선택)', max: 60, auto: 'organization' }) +
        K.field({ name: 'contact', label: '회신받을 연락처', req: true, max: 80, ph: '이메일 또는 010-0000-0000', auto: 'email' }) +
        K.field({ name: 'msg', label: '문의 내용', type: 'textarea', req: true, max: 2000, counter: true, value: pre, ph: '목적 · 대상 인원 · 희망 시기 · 예산 범위(알 경우)를 적어 주시면 빠릅니다.' }) +
        '<label class="check"><input type="checkbox" name="agree"> <span>[필수] 문의 답변을 위해 이름·연락처를 수집·이용하는 데 동의합니다. 답변 완료 후 1년 보관 뒤 파기합니다.</span></label><div class="field" style="margin:0"><div class="field__e" role="alert"></div></div>' +
        '<input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<button class="btn btn--pri btn--block mt12" type="submit">' + ico('mail') + '문의 보내기</button><p class="xs muted mt8">파일 첨부는 받지 않습니다. 자료가 있다면 회신 메일로 보내 주세요.</p></form>' +
        '<div class="mt24"><h2 class="h3">이렇게 진행됩니다</h2><div class="steps mt12">' + C().solution.process.slice(0, 3).map(function (x) { return '<div class="step"><span class="step__n">' + esc(x.step) + '</span><div><p class="step__t">' + esc(x.t) + '</p><p class="step__d">' + esc(x.d) + '</p></div></div>'; }).join('') + '</div>' +
        '<a class="mini mt16" href="mailto:' + attr(C().site.email) + '"><span class="mini__ic">' + ico('mail') + '</span><span><span class="mini__t">메일로 바로 보내기</span><span class="mini__d" style="display:block">' + esc(C().site.email) + '</span></span></a>' +
        '<a class="mini mt8" href="#/diagnose"><span class="mini__ic">' + ico('target') + '</span><span><span class="mini__t">조직 진단을 먼저 해 보세요</span><span class="mini__d" style="display:block">결과를 첨부하면 첫 미팅이 짧아집니다</span></span></a></div></div></div></section>';
    }
  };
  K.form('inquiry', function (f) {
    var ok = K.validate(f, { name: { req: true, max: 30 }, contact: { req: true, contact: true }, msg: { req: true, min: 10, max: 2000 } });
    var fs = f.querySelectorAll('.field'), af = fs[fs.length - 1];
    if (!f.elements.agree.checked) { af.classList.add('err'); af.querySelector('.field__e').textContent = '개인정보 수집·이용에 동의해 주세요.'; ok = false; } else af.classList.remove('err');
    if (!ok) return;
    if (!K.rateOk('inquiry', 30)) { K.toast('방금 보내셨어요. 30초 뒤에 다시 보낼 수 있습니다', 'clock'); return; }
    var type = TYPES.filter(function (x) { return x.v === f.elements.type.value; })[0];
    var q = { id: U.uid('q'), type: type.v, typeLabel: type.t, name: f.elements.name.value.trim(), org: f.elements.org.value.trim(), contact: f.elements.contact.value.trim(), msg: f.elements.msg.value.trim(), at: Date.now(), page: location.hash };
    K.data.sendInquiry(q).then(function (where) {
      var body = '[문의 유형] ' + q.typeLabel + '\n[이름] ' + q.name + '\n[소속] ' + (q.org || '-') + '\n[연락처] ' + q.contact + '\n\n' + q.msg;
      K.openModal({ title: '문의가 ' + (where === 'server' ? '접수됐어요' : '준비됐어요'), body:
        '<div class="empty" style="border-style:solid">' + ico('check') + '<p class="empty__t">' + esc(q.name) + '님, 고맙습니다</p><p class="small mt8">' + (where === 'server' ? '담당자에게 바로 전달됐습니다. 영업일 기준 2일 안에 ' + esc(q.contact) + '(으)로 회신드릴게요.' : '현재 정적 배포 모드라 서버로 전송되지 않았습니다. 아래 버튼을 눌러 메일 앱으로 한 번만 보내 주세요(내용은 자동으로 채워집니다).') + '</p></div>' +
        '<div class="btn-row mt16"><a class="btn ' + (where === 'server' ? 'btn--ghost' : 'btn--pri') + '" href="' + attr(K.mailto('[KAHUGO 문의] ' + q.typeLabel + ' · ' + q.name, body)) + '">' + ico('mail') + '메일 앱으로 ' + (where === 'server' ? '사본 보내기' : '보내기') + '</a><a class="btn btn--ghost" href="#/my?tab=inbox">내 문의 보기</a></div>' });
      f.reset();
    });
  });

  /* ══════════════════════ 마이 ══════════════════════ */
  V.my = { nav: 'my', title: '마이',
    render: function (ctx) {
      var u = K.user, saved = K.saved(), rec = store.get('records', []), items = [{ id: 'saved', label: '저장함', n: saved.length }, { id: 'records', label: '기록', n: rec.length }, { id: 'reading', label: '읽던 책' }, { id: 'inbox', label: '내 글·문의' }, { id: 'settings', label: '설정' }];
      var t = pickTab(ctx.query, items), body;
      if (t === 'records') body = rec.length ? '<div class="stack">' + rec.map(function (r) { return '<div class="mini"><span class="mini__ic">' + ico('file') + '</span><span style="flex:1"><span class="xs muted">' + esc(r.kind) + ' · ' + U.nowLabel(r.at) + '</span><a class="mini__t" style="display:block" href="' + attr(r.r) + '">' + esc(r.t) + '</a><span class="mini__d" style="display:block">' + esc(r.d) + '</span></span><button type="button" class="iconbtn" data-action="rec-del" data-id="' + attr(r.id) + '" aria-label="기록 삭제">' + ico('trash') + '</button></div>'; }).join('') + '</div>'
        : emptyStart('기록이 아직 없어요', '진단·시뮬레이터·시나리오 결과를 저장하면 여기에 모입니다.', [['1분 생존 진단', '#/wave/sapiens?tab=diag'], ['조직 준비도 진단', '#/diagnose'], ['미래 시나리오', '#/futures?tab=scenario']]);
      else if (t === 'reading') body = C().books.map(function (b) { var rp = store.get('read:' + b.id, null); return '<div class="card" style="display:grid;grid-template-columns:72px 1fr;gap:14px;align-items:center"><span class="cover"><img src="' + attr(b.coverThumb) + '" alt="『' + attr(b.title) + '』 표지" width="360" height="522" loading="lazy"></span><div><p class="card__t">『' + esc(b.title) + '』</p><p class="xs muted">' + (rp ? rp.p + ' / ' + b.previewPages + '쪽 · ' + U.nowLabel(rp.at) : '아직 펼치지 않았어요') + '</p><div class="progress mt8"><i style="width:' + (rp ? Math.round(rp.p / b.previewPages * 100) : 0) + '%"></i></div><div class="btn-row mt12">' + aBtn(rp ? '이어 읽기' : '첫 쪽부터', '#/wave/' + b.id + '/read' + (rp ? '?p=' + rp.p : ''), 'btn--pri btn--sm', 'book') + '</div></div></div>'; }).join('') +
        (saved.filter(function (s) { return s.k === '책갈피'; }).length ? '<h2 class="h3 mt24">책갈피</h2><div class="stack mt8">' + saved.filter(function (s) { return s.k === '책갈피'; }).map(function (s) { return '<a class="mini" href="' + attr(s.r) + '"><span class="mini__ic">' + ico('bookmark') + '</span><span class="mini__t">' + esc(s.t) + '</span>' + ico('chev', 'mini__go') + '</a>'; }).join('') + '</div>' : '');
      else if (t === 'inbox') {
        var mine = K.data.localPosts(), inq = store.get('inquiries', []), sub = store.get('subscribed', null);
        body = '<h2 class="h3">내가 쓴 글 ' + mine.length + '</h2><div class="mt8">' + (mine.length ? mine.map(function (p) { return postItem(Object.assign({ src: 'local' }, p)); }).join('') : emptyStart('아직 쓴 글이 없어요', '질문 하나, 사례 하나면 충분합니다.', [['라운지 가기', '#/community']])) + '</div>' +
          '<h2 class="h3 mt24">보낸 문의 ' + inq.length + '</h2><div class="stack mt8">' + (inq.length ? inq.map(function (q) { return '<div class="mini"><span class="mini__ic">' + ico('mail') + '</span><span><span class="mini__t">' + esc(q.typeLabel) + '</span><span class="mini__d" style="display:block">' + esc(U.nowLabel(q.at) + ' · ' + q.msg.slice(0, 50)) + '</span></span></div>'; }).join('') : '<p class="small muted">보낸 문의가 없어요. <a class="linkbtn" href="#/contact">문의하기</a></p>') + '</div>' +
          '<h2 class="h3 mt24">구독</h2><p class="small sub mt8">' + (sub ? '파도 편지 · ' + esc(sub.contact) : '구독 중인 소식이 없어요.') + '</p>' + (sub ? '<button type="button" class="btn btn--ghost btn--sm mt8" data-action="unsub">구독 정보 지우기</button>' : aBtn('파도 편지 구독', '#/publications?tab=newsletter', 'btn--soft btn--sm mt8'));
      } else if (t === 'settings') {
        var theme = D.documentElement.getAttribute('data-theme');
        body = '<div class="stack"><button type="button" class="mini" data-action="toggle-theme" style="width:100%;text-align:left"><span class="mini__ic">' + ico(theme === 'light' ? 'sun' : 'moon') + '</span><span class="mini__t">화면 밝기 · 지금 ' + (theme === 'light' ? '라이트' : '다크') + '</span><span class="mini__go badge">바꾸기</span></button>' +
          '<button type="button" class="mini" data-action="toggle-big" style="width:100%;text-align:left"><span class="mini__ic">' + ico('type') + '</span><span class="mini__t">큰 글씨 · ' + (D.documentElement.classList.contains('big') ? '켜짐' : '꺼짐') + '</span><span class="mini__go badge">바꾸기</span></button>' +
          '<button type="button" class="mini" data-action="toggle-viewmode" style="width:100%;text-align:left"><span class="mini__ic">' + ico('monitor') + '</span><span class="mini__t">보기 모드 · ' + (store.get('viewmode', 'auto') === 'pc' ? 'PC 보기' : '기기 맞춤') + '</span><span class="mini__go badge">바꾸기</span></button>' +
          '<button type="button" class="mini" data-action="install-app" style="width:100%;text-align:left"><span class="mini__ic">' + ico('download') + '</span><span class="mini__t">홈 화면에 앱 설치</span><span class="mini__go badge">설치</span></button>' +
          '<button type="button" class="mini" data-action="open-notices" style="width:100%;text-align:left"><span class="mini__ic">' + ico('bell') + '</span><span class="mini__t">알림 보기</span><span class="dot" data-dot hidden style="position:static;margin-left:auto"></span></button>' +
          '<button type="button" class="mini" data-action="data-export" style="width:100%;text-align:left"><span class="mini__ic">' + ico('download') + '</span><span class="mini__t">내 데이터 내려받기(JSON)</span></button>' +
          '<button type="button" class="mini" data-action="data-reset" style="width:100%;text-align:left"><span class="mini__ic" style="color:var(--danger)">' + ico('trash') + '</span><span class="mini__t">이 기기의 모든 기록 지우기</span></button></div>' +
          '<p class="xs muted mt16">저장 위치: ' + (store.ok() ? '이 브라우저(로컬 저장소)' : '임시 메모리 — 시크릿 모드 등에서는 창을 닫으면 사라집니다') + '</p>';
      } else body = saved.length ? '<div class="stack">' + saved.map(function (s) { return '<div class="mini"><span class="mini__ic">' + ico('bookmark') + '</span><span style="flex:1"><span class="xs muted">' + esc(s.k) + '</span><a class="mini__t" style="display:block" href="' + attr(K.resolves(s.r) ? s.r : '#/home') + '">' + esc(s.t) + '</a></span><button type="button" class="iconbtn" data-action="saved-del" data-id="' + attr(s.id) + '" aria-label="저장 해제">' + ico('trash') + '</button></div>'; }).join('') + '</div>'
        : emptyStart('저장한 항목이 없어요', '아젠다·예측·키워드·일정의 ' + '책갈피 아이콘을 누르면 여기에 담깁니다.', [['미래예측 18', '#/futures'], ['12대 아젠다', '#/research'], ['키워드 50', '#/futures?tab=keywords']]);
      return '<header class="phead"><div class="wrap"><div class="row" style="gap:12px">' + (u ? '<span class="avatar" style="width:52px;height:52px;font-size:20px">' + esc(u.name.slice(0, 1)) + '</span><div style="flex:1"><h1 class="h2">' + esc(u.name) + '님</h1><p class="xs muted">' + esc({ kakao: '카카오', naver: '네이버', guest: '닉네임' }[u.provider] || '') + ' 로그인 · ' + (K.isOAuth() ? '실연동' : '데모') + '</p></div><button type="button" class="btn btn--ghost btn--sm" data-action="logout">' + ico('logout') + '로그아웃</button>'
        : '<span class="avatar" style="width:52px;height:52px;background:var(--surface3);color:var(--sub)">' + ico('user') + '</span><div style="flex:1"><h1 class="h2">마이</h1><p class="xs muted">로그인 없이도 저장·기록이 이 기기에 남습니다</p></div><button type="button" class="btn btn--pri btn--sm" data-action="open-login">로그인</button>') + '</div>' +
        '<div class="grid grid--2m mt16"><div class="stat"><p class="stat__k">저장</p><p class="stat__v">' + saved.length + '<small>개</small></p></div><div class="stat"><p class="stat__k">기록</p><p class="stat__v">' + rec.length + '<small>건</small></p></div></div></div></header>' +
        tabs('#/my', items, t) + '<section class="sec sec--tight"><div class="wrap" style="max-width:820px">' + body + '</div></section>';
    }
  };
  function emptyStart(t, d, links) { return '<div class="empty">' + ico('spark') + '<p class="empty__t">' + esc(t) + '</p><p class="small mt8">' + esc(d) + '</p><div class="btn-row mt12" style="justify-content:center">' + links.map(function (l) { return aBtn(l[0], l[1], 'btn--soft btn--sm'); }).join('') + '</div></div>'; }
  K.act('saved-del', function (el) { var id = el.getAttribute('data-id'); store.set('saved', K.saved().filter(function (s) { return s.id !== id; })); K.render(); });
  K.act('rec-del', function (el) { var id = el.getAttribute('data-id'); store.set('records', store.get('records', []).filter(function (s) { return s.id !== id; })); K.render(); });
  K.act('unsub', function () { store.del('subscribed'); K.toast('구독 정보를 지웠어요', 'trash'); K.render(); });
  K.act('data-export', function () {
    var keys = ['saved', 'records', 'posts', 'replies', 'likes', 'weekly', 'inquiries', 'subscribed', 'scenario', 'simSel', 'orgDiag', 'readerSet', 'user'], out = {};
    keys.forEach(function (k) { out[k] = store.get(k, null); }); C().books.forEach(function (b) { out['read:' + b.id] = store.get('read:' + b.id, null); });
    try { var blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' }), a = D.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'kahugo-my-data.json'; D.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); K.toast('내 데이터를 내려받았어요', 'download'); }
    catch (e) { K.toast('이 브라우저에서는 내려받기를 지원하지 않아요', 'x'); }
  });
  K.act('data-reset', function () {
    K.openModal({ title: '모든 기록을 지울까요?', body: '<p class="sub">저장함·기록·읽던 쪽·내가 쓴 글(이 기기 저장분)·설정이 모두 지워집니다. 되돌릴 수 없습니다.</p><div class="btn-row mt16"><button type="button" class="btn btn--pri" data-action="data-reset-ok">' + ico('trash') + '모두 지우기</button><button type="button" class="btn btn--ghost" data-action="close">취소</button></div>' });
  });
  K.act('data-reset-ok', function () { try { Object.keys(W.localStorage).forEach(function (k) { if (k.indexOf('kahugo9:') === 0 && k.indexOf('kahugo9:admin') !== 0) W.localStorage.removeItem(k); }); } catch (e) {} K.user = null; K.closeAll(false); K.applyTheme('dark'); D.documentElement.classList.remove('big'); K.applyViewMode('auto'); K.render(true); K.toast('이 기기의 기록을 모두 지웠어요', 'trash'); });

  /* ══════════════════════ 약관 · 개인정보 · 404 ══════════════════════ */
  V.terms = { nav: 'about', title: '이용약관', render: function () {
    var s = C().site;
    return phead([['이용약관']], '이용약관', '시행일 2026년 11월 14일') + '<section class="sec sec--tight"><div class="wrap" style="max-width:780px"><ol class="olist">' +
      ['이 약관은 ' + s.nameKo + '(이하 ‘연구원’)이 운영하는 웹사이트 ' + s.domain.replace(/^https?:\/\//, '') + '(이하 ‘사이트’)의 이용 조건을 정합니다.',
       '사이트의 연구·프로그램·도서 미리보기·진단·시뮬레이터는 참고 정보이며, 법률·세무·투자·의료 등 전문 자문을 대체하지 않습니다.',
       '도서 미리보기와 사이트 콘텐츠의 저작권은 저작권자에게 있습니다. 출처를 밝힌 짧은 인용 외의 복제·배포·전송은 사전 동의가 필요합니다.',
       '커뮤니티에는 타인의 권리를 침해하거나 개인정보를 노출하는 글, 광고·도배·욕설을 올릴 수 없습니다. 연구원은 이용 원칙에 어긋나는 글을 숨기거나 삭제할 수 있습니다.',
       '이용자는 파일·이미지를 업로드할 수 없습니다. 문의·댓글·공감 기능은 누구나 이용할 수 있습니다.',
       '서비스는 점검·개선을 위해 사전 공지 후 변경되거나 일시 중단될 수 있습니다.',
       '문의: ' + s.email].map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></div></section>';
  } };
  V.privacy = { nav: 'about', title: '개인정보처리방침', render: function () {
    var s = C().site;
    return phead([['개인정보처리방침']], '개인정보처리방침', '시행일 2026년 11월 14일') + '<section class="sec sec--tight"><div class="wrap" style="max-width:780px"><div class="tblwrap"><table class="tbl"><tr><th>구분</th><th>수집 항목</th><th>목적</th><th>보관</th></tr>' +
      '<tr><td>문의</td><td>이름, 연락처(이메일·전화), 소속(선택), 문의 내용</td><td>문의 답변·상담 진행</td><td>답변 완료 후 1년</td></tr>' +
      '<tr><td>구독</td><td>이메일</td><td>파도 편지 발송</td><td>해지 시 즉시 파기</td></tr>' +
      '<tr><td>로그인</td><td>카카오·네이버 회원 식별값, 닉네임</td><td>저장·기록 보관, 커뮤니티 표시 이름</td><td>탈퇴(삭제 요청) 시 파기</td></tr>' +
      '<tr><td>커뮤니티</td><td>표시 이름(선택), 글·댓글 내용</td><td>게시글 표시</td><td>삭제 요청 시 파기</td></tr></table></div>' +
      '<ul class="list mt16"><li>' + ico('lock') + '<span>진단·저장·읽던 쪽 등은 이용자 브라우저에만 저장되며 연구원 서버로 보내지 않습니다.</span></li><li>' + ico('lock') + '<span>글쓰기 시 ‘익명’이 기본값이며, 이름·소속 공개는 이용자가 선택합니다.</span></li><li>' + ico('lock') + '<span>개인정보를 제3자에게 제공하거나 판매하지 않습니다. 법령에 따른 요청은 예외로 합니다.</span></li><li>' + ico('mail') + '<span>열람·정정·삭제 요청과 개인정보 보호 문의: ' + esc(s.email) + '</span></li></ul></div></section>';
  } };
  V.notfound = { nav: '', title: '페이지를 찾을 수 없어요', render: function () {
    return '<section class="sec"><div class="wrap" style="max-width:620px"><div class="empty">' + ico('compass') + '<p class="empty__t">찾으시는 화면이 없어요</p><p class="small mt8">주소가 바뀌었거나 삭제된 항목일 수 있습니다.</p><div class="btn-row mt16" style="justify-content:center">' + aBtn('홈으로', '#/home', 'btn--pri btn--sm', 'home') + '<button type="button" class="btn btn--ghost btn--sm" data-action="open-search">' + ico('search') + '찾아보기</button></div></div></div></section>';
  } };
  V.error = { render: function () { return '<section class="sec"><div class="wrap" style="max-width:620px"><div class="empty">' + ico('refresh') + '<p class="empty__t">화면을 그리는 중 문제가 생겼어요</p><div class="btn-row mt16" style="justify-content:center">' + aBtn('홈으로', '#/home', 'btn--pri btn--sm') + '</div></div></div></section>'; } };

  /* ── 라우트 등록 ───────────────────────────────────────────── */
  K.route('/home', V.home);
  K.route('/research', V.research); K.route('/research/:id', V.researchDetail);
  K.route('/labs', V.labs); K.route('/labs/:id', V.labDetail);
  K.route('/programs', V.programs); K.route('/diagnose', V.diagnose); K.route('/simulator', V.simulator);
  K.route('/publications', V.publications);
  K.route('/wave', V.wave); K.route('/wave/:id', V.book); K.route('/wave/:id/read', V.reader);
  K.route('/futures', V.futures);
  K.route('/community', V.community); K.route('/community/post/:id', V.post);
  K.route('/about', V.about); K.route('/contact', V.contact);
  K.route('/my', V.my); K.route('/terms', V.terms); K.route('/privacy', V.privacy);

  /* ── 렌더 후처리: 등장 효과 · 경로별 하단 CTA · 알림 점 ─────────── */
  var CTA = {
    home: { id: 'home', t: '1분 생존 진단으로 내 위치부터', label: '시작', route: '#/wave/sapiens?tab=diag' },
    programs: { id: 'prog', t: 'AI 솔루션 · 무료 사전 상담', label: '신청', route: '#/contact?type=solution' },
    research: { id: 'res', t: '우리 조직은 어디쯤일까? 15문항 진단', label: '진단', route: '#/diagnose' },
    futures: { id: 'fut', t: '내 관심 분야로 미래 시나리오 만들기', label: '만들기', route: '#/futures?tab=scenario' },
    wave: { id: 'wave', t: '신간 58쪽, 지금 무료로 읽기', label: '읽기', route: '#/wave/sapiens/read' },
    labs: { id: 'labs', t: '현장의 질문을 공동연구로', label: '제안', route: '#/contact?type=lab' }
  };
  K.afterRender = function (root, ctx) {
    K.reveal(root);
    var nav = ctx.view.nav, cta = CTA[nav];
    if (ctx.view === V.reader || ctx.path === '/diagnose' || (nav === 'futures' && ctx.query.tab === 'scenario') || (nav === 'wave' && ctx.view === V.book)) cta = nav === 'wave' && ctx.view === V.book ? CTA.wave : null;
    if (ctx.view === V.reader) cta = null;
    K.setStickyCta(cta || null);
    K.paintDots();
  };

  /* ── 시작 ── */
  function start() { try { K.boot(); } catch (e) { D.documentElement.className += ' kahugo-boot-fail'; } }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})(window, document);
