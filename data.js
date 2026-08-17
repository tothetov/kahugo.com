/* ====================================
   KAHUGO PLATFORM · data.js  (v2.0)
   한국AI휴먼전략연구원 · Korea AI Human Strategy Institute
   ------------------------------------
   ★ 텍스트를 바꾸고 싶으면 이 파일만 수정하면 됩니다. (HTML/CSS 수정 불필요)
   ★ 원본 랜딩페이지 문구는 Source of Truth 로서 원문 100% 보존.
   ★ 확정되지 않은 조직·프로그램은 status:'proposed' / 'planned' 로 명시.
   ★ 실측되지 않은 회원수·매출·조회수는 어디에도 표기하지 않습니다.
   ------------------------------------
   v2.0 변경점
     · 구 브랜드 표기를 KAHUGO 로 전면 전환
     · NAV(6대메뉴) / ICON_ACTIONS(상단 아이콘바) 데이터화
     · DIAGNOSTIC  : AI휴먼전략 자가진단 6문항 · 4단계 판정 · 맞춤 추천
     · COMMUNITY_SEED : 운영팀 공식 안내글 (가짜 회원글·가짜 좋아요 없음)
     · FAQ / TRUST_NOTES / SHARE_CARDS / QUICK_ACTIONS 신설
   ==================================== */
(function (global) {
  'use strict';

  /* ── 0. 기관 아이덴티티 (원문 보존) ─────────────────────────────── */
  var INSTITUTE = {
    nameKo: '한국AI휴먼전략연구원',
    nameEn: 'Korea AI Human Strategy Institute',
    abbr: 'KAHUGO',
    tagline: 'AI 시대, 사람을 중심에 세우는 전략연구 플랫폼',
    heroLine1: 'AI 시대,',
    heroLine2: '사람을 중심에 세우는',
    heroLine3: '전략연구 플랫폼',
    heroSub: '한국AI휴먼전략연구원은 제5의 물결과 AI 대전환 시대를 맞아 인간 중심의 전략, 연구, 교육, 사업화, 커뮤니티 네트워크를 연결하는 민간 전문 싱크탱크형 플랫폼입니다.',
    email: 'habibot@naver.com',
    badge: 'KAHUGO · 제5의 물결 AI휴먼전략 플랫폼',
    footerNote: '© 2026 Korea AI Human Strategy Institute.',
    focusLine: 'Research · Education · Forum · Consulting · Report · Business Lab · Community Network',
    identityHeadline: '연구도, 교육도, 포럼도, 출판도, 컨설팅도 가능한 큰 그릇',
    identitySub: 'KAHUGO는 기술 중심 담론을 넘어 사람의 질문·판단·창의성·윤리·실행력을 회복하고 확장하는 AI 전략기관입니다.',
    whyNowHeadline: '기술이 빨라질수록, 더 중요한 것은 사람입니다.',
    whyNowBody: 'AI는 이미 업무, 교육, 창작, 경영, 지역사회, 정책 의사결정 전반을 바꾸고 있습니다. 그러나 변화의 핵심은 기계의 속도가 아니라 인간이 무엇을 질문하고, 어떻게 판단하며, 누구와 협력하는가에 있습니다.',
    whyNowPoints: [
      'AI 활용 격차를 개인·기업·지역의 성장 격차로 번지지 않게 합니다.',
      '기술 중심 교육을 넘어 전략·윤리·창의·실행을 통합합니다.',
      '연구 결과가 리포트, 교육, 컨설팅, 프로젝트 사업화로 이어지게 합니다.'
    ],
    quote: 'AI와 경쟁하는 사람이 아니라, AI를 지휘하는 사람을 키우는 연구원.',
    quoteSub: 'KAHUGO는 AI를 두려움의 상징이 아닌 성장과 기회의 흐름으로 바꾸는 사람 중심 전략 네트워크를 지향합니다.',
    closingHeadline: '제5의 물결을 사람 중심의 기회로 바꾸는 일, 지금 시작할 수 있습니다.',
    closingSub: '설립 자문, 포럼 참여, 교육 의뢰, 기업 컨설팅, 공동 프로젝트 제안을 기다립니다.'
  };

  /* ── 1. 10대 창립선언문 (원문 100% 보존) ────────────────────────── */
  var DECLARATIONS = [
    { title: 'AI 시대의 중심에 사람을 세운다', short: '기술보다 사람, 속도보다 방향, 자동화보다 인간의 판단을 중심에 둡니다.', body: '우리는 AI를 기술 경쟁의 도구로만 보지 않는다. AI는 인간의 삶을 더 깊게 이해하고, 인간의 가능성을 더 넓게 확장하며, 개인과 조직과 사회가 더 나은 방향으로 나아가도록 돕는 전략적 도구가 되어야 한다. 한국AI휴먼전략연구원은 모든 연구와 사업의 출발점을 사람에게 둔다. 사람의 존엄, 창의성, 윤리, 협력, 실행력을 중심에 두고 AI 시대의 새로운 전략 질서를 설계한다.' },
    { title: '제5의 물결을 두려움이 아니라 기회로 바꾼다', short: '변화의 파도를 공포가 아니라 성장과 전략의 언어로 전환합니다.', body: 'AI 대전환은 누군가에게는 불안이고, 누군가에게는 기회이다. 문제는 AI가 오느냐 오지 않느냐가 아니라, 우리가 이 변화를 어떻게 해석하고 준비하며 활용할 것인가이다. 한국AI휴먼전략연구원은 AI 시대의 불안을 성장의 언어로 바꾸고, 혼란을 전략의 질서로 바꾸며, 변화의 파도를 사람 중심의 기회로 전환하는 지식 플랫폼이 된다.' },
    { title: '연구와 실행이 분리되지 않는 전략기관이 된다', short: '연구, 교육, 포럼, 컨설팅, 사업화를 하나의 실행 구조로 연결합니다.', body: '우리는 책상 위의 연구에 머물지 않는다. 연구는 현장의 문제를 해결해야 하고, 교육은 실제 역량으로 이어져야 하며, 포럼은 관계 형성에 그치지 않고 프로젝트와 사업화로 연결되어야 한다. 우리는 질문을 연구로 만들고, 연구를 교육으로 만들며, 교육을 프로젝트로 만들고, 프로젝트를 사회적 성과와 사업적 가치로 연결한다.' },
    { title: 'AI 활용 격차가 인간의 기회 격차가 되지 않도록 한다', short: '누구나 AI를 배우고, 자신의 일과 삶에 적용할 수 있는 길을 엽니다.', body: 'AI 시대의 가장 큰 위험 중 하나는 기술 그 자체가 아니라 기술을 활용할 수 있는 사람과 그렇지 못한 사람 사이의 격차이다. 이 격차는 지식 격차, 소득 격차, 조직 경쟁력의 격차와 지역 발전의 격차로 이어질 수 있다. 한국AI휴먼전략연구원은 AI 활용역량의 민주화를 중요한 사명으로 삼는다.' },
    { title: '인간의 창의성과 AI의 생산성을 연결한다', short: 'AI는 인간 창의성의 대체물이 아니라 증폭기가 되어야 합니다.', body: 'AI는 빠르게 생성하고 계산하고 분석한다. 그러나 의미를 발견하고, 방향을 선택하고, 감동을 만들고, 공동체의 미래를 상상하는 힘은 여전히 인간에게서 나온다. 한국AI휴먼전략연구원은 인간의 창의성과 AI의 생산성이 결합되는 새로운 방법론을 개발하고, 인간다운 상상력과 기술적 실행력이 함께 작동하는 전략 모델을 제시한다.' },
    { title: '윤리와 책임을 기반으로 신뢰 가능한 AI 활용 문화를 만든다', short: '효율보다 신뢰, 자동화보다 책임 있는 판단을 우선합니다.', body: 'AI 시대에는 활용 능력만큼이나 책임 능력이 중요하다. AI를 잘 쓰는 것보다 더 중요한 것은 AI를 바르게 쓰는 것이다. 우리는 개인정보 보호, 저작권, 공정성, 투명성, 책임성, 인간의 최종 판단 원칙을 중요하게 다룬다. 한국AI휴먼전략연구원은 책임 있는 AI 활용 문화를 확산시키고, 신뢰 가능한 기준과 교육과 거버넌스를 만들어간다.' },
    { title: '각계 사람들을 연결하는 AI휴먼전략 커뮤니티를 구축한다', short: '분야의 경계를 넘어 사람과 지식과 프로젝트를 연결합니다.', body: 'AI 시대의 해답은 한 분야 안에만 있지 않다. 기술자, 경영자, 교육자, 창작자, 정책 전문가, 지역 리더가 함께 만나는 융합의 장이 필요하다. 한국AI휴먼전략연구원은 각자의 전문성을 연결하고, 서로의 경험을 나누며, 공동의 프로젝트를 만들어내는 AI휴먼전략 커뮤니티를 구축한다.' },
    { title: '개인·기업·지역·조직의 AI 전환을 돕는 실전 전략을 개발한다', short: '담론이 아니라 현장에서 작동하는 AI 전환 로드맵을 제공합니다.', body: 'AI 시대의 전략은 거대한 담론에 머물러서는 안 된다. 개인의 일하는 방식, 기업의 업무 프로세스, 기관의 의사결정 구조, 지역의 성장 전략 안으로 들어가야 한다. 한국AI휴먼전략연구원은 AI 도입 진단, 업무 자동화 설계, 리더십 교육, 조직문화 전환, 신사업 발굴, 콘텐츠 개발, 정책 과제 설계 등 현장에서 작동하는 전략을 연구하고 제공한다.' },
    { title: '지식과 콘텐츠를 사회적 자산으로 축적한다', short: '흩어진 정보를 전략 지식과 실행 콘텐츠로 바꿉니다.', body: 'AI 시대에는 정보가 넘쳐나지만, 방향 있는 지식은 더 귀해진다. 단편적 정보가 아니라 해석된 지식, 검증된 전략, 적용 가능한 방법론이 필요하다. 한국AI휴먼전략연구원은 AI Human Strategy Report, 연구보고서, 백서, 도서, 뉴스레터, 강의자료, 유튜브 콘텐츠, 포럼 자료를 통해 AI 시대의 지식 자산을 체계적으로 축적하고 확산한다.' },
    { title: '한국형 AI휴먼전략 모델을 세계와 연결한다', short: '한국의 현장성과 세계의 흐름을 연결하는 사람 중심 AI 전략을 만듭니다.', body: 'AI 시대의 변화는 전 세계적이지만, 해답은 각 사회의 문화, 산업, 교육, 공동체 구조에 맞게 설계되어야 한다. 한국AI휴먼전략연구원은 한국형 AI휴먼전략 모델을 개발하고, 이를 기업, 지역, 교육, 창작, 정책, 시민사회 영역에 적용하며, 장기적으로 국제적 연구와 협력으로 확장해 나간다.' }
  ];
  var DECLARATION_CLOSING = '우리는 AI 시대의 중심에 사람을 세우고, 제5의 물결을 사람 중심의 기회로 바꾸기 위해 한국AI휴먼전략연구원을 창립합니다.';

  /* ── 2. Research 상위 분류 (8 Categories) ───────────────────────── */
  var CATEGORIES = [
    { id: 'human',     ko: '인간·리더십',   en: 'Human & Leadership',            icon: 'compass' },
    { id: 'work',      ko: '일·조직',       en: 'Work & Organization',           icon: 'grid' },
    { id: 'business',  ko: '비즈니스·혁신', en: 'Business & Innovation',         icon: 'spark' },
    { id: 'education', ko: '교육·역량',     en: 'Education & Capability',        icon: 'cap' },
    { id: 'ethics',    ko: '윤리·거버넌스', en: 'Ethics & Governance',           icon: 'shield' },
    { id: 'regional',  ko: '지역·정책',     en: 'Regional & Policy',             icon: 'map' },
    { id: 'creation',  ko: '창작·IP',       en: 'Creation & IP',                 icon: 'pen' },
    { id: 'future',    ko: '미래전략',      en: 'Future Strategy',               icon: 'wave' }
  ];

  /* ── 3. 12대 AI휴먼전략 아젠다 = Research 데이터 핵심 ────────────
     title / desc 는 원본 랜딩페이지 원문 보존.
     question·why·insights·targets 는 연구 프레이밍(관점) 서술이며 실적·통계가 아님.
     ------------------------------------ */
  var RESEARCH = [
    {
      id: 'r01', no: '01', cat: 'human',
      title: '인간 중심 AI 리더십',
      desc: 'CEO·관리자·공공리더를 위한 AI 시대 의사결정과 조직전환 전략.',
      tags: ['리더십', '의사결정', '조직전환', 'CEO'],
      question: 'AI가 판단의 재료를 무한히 공급하는 시대에, 리더가 여전히 인간으로서 책임져야 하는 결정은 무엇인가?',
      why: 'AI 도입의 성패는 도구의 성능이 아니라 도구를 쥔 리더의 질문 수준에서 갈립니다. 리더가 AI에게 무엇을 맡기고 무엇을 끝까지 붙들 것인지 선을 긋지 못하면, 조직은 빠르게 움직이지만 방향을 잃습니다.',
      insights: [
        'AI는 답을 빠르게 만들지만, 질문의 품질까지 대신 높여주지는 않는다.',
        '위임 가능한 판단과 위임 불가능한 판단을 구분하는 것이 AI 시대 리더십의 첫 과제다.',
        '조직 전환은 시스템 도입이 아니라 의사결정 습관의 교체에서 시작된다.'
      ],
      targets: ['기업 CEO·임원', '공공기관 리더', '중간관리자', '기관 의사결정 라인'],
      programs: ['academy', 'lab'], pubs: ['brief', 'report'],
      declaration: 1
    },
    {
      id: 'r02', no: '02', cat: 'education',
      title: 'AI 활용역량 격차 해소',
      desc: '청년·중장년·소상공인·지역기업 대상 실전형 AI 리터러시.',
      tags: ['리터러시', '격차', '소상공인', '지역기업'],
      question: 'AI를 쓰는 사람과 쓰지 못하는 사람의 격차는 어떤 경로로 소득·기회의 격차로 굳어지는가?',
      why: '기술 격차는 시간이 지나면 저절로 좁혀지지 않습니다. 오히려 먼저 활용한 쪽이 데이터·경험·네트워크를 함께 축적하면서 간격이 벌어집니다. 격차 해소는 복지가 아니라 성장 전략의 문제입니다.',
      insights: [
        '리터러시는 도구 사용법이 아니라 “내 일에 어떻게 붙일 것인가”라는 번역 능력이다.',
        '중장년·소상공인에게 필요한 것은 최신 모델이 아니라 반복되는 자기 업무 한 가지의 자동화 경험이다.',
        '첫 성공 경험 1회가 이후 학습 지속률을 결정한다.'
      ],
      targets: ['청년 구직자·신입', '중장년 재직자', '소상공인·자영업', '지역 중소기업'],
      programs: ['academy', 'forum'], pubs: ['brief', 'edu'],
      declaration: 4
    },
    {
      id: 'r03', no: '03', cat: 'ethics',
      title: 'AI 윤리와 거버넌스',
      desc: '책임 있는 AI 활용, 내부 규정, 리스크 관리, 신뢰 프레임워크.',
      tags: ['윤리', '거버넌스', '리스크', '내부규정'],
      question: '조직이 AI를 쓰다가 사고를 냈을 때, 책임은 어디에서 멈추고 누가 지는가?',
      why: 'AI 활용이 늘수록 개인정보·저작권·공정성·투명성 이슈가 함께 커집니다. 사후 대응은 비용이 크고 신뢰 회복이 어렵습니다. 사전에 “쓸 수 있는 범위”를 문서로 정해 둔 조직만이 속도를 낼 수 있습니다.',
      insights: [
        '윤리는 속도를 늦추는 규제가 아니라, 되돌아가지 않게 만드는 안전장치다.',
        '금지 목록보다 “판단이 필요한 회색지대의 처리 절차”가 실제로 작동한다.',
        '최종 판단의 주체를 사람으로 명시하는 한 줄이 조직 전체의 책임 구조를 바꾼다.'
      ],
      targets: ['법무·컴플라이언스', 'AI 도입 TF', '공공기관', '교육기관'],
      programs: ['lab', 'academy'], pubs: ['white', 'report'],
      declaration: 6
    },
    {
      id: 'r04', no: '04', cat: 'business',
      title: 'AI 비즈니스모델 혁신',
      desc: 'AI 에이전트, 자동화, 데이터 기반 수익모델 설계와 검증.',
      tags: ['비즈니스모델', '에이전트', '자동화', '수익설계'],
      question: 'AI로 비용을 줄이는 것을 넘어, AI가 아니면 불가능한 수익 구조는 무엇인가?',
      why: '대부분의 AI 도입은 원가 절감에서 멈춥니다. 절감은 경쟁사도 곧 따라옵니다. 지속 가능한 격차는 “AI가 있어야만 성립하는 제공 가치”를 설계했을 때 만들어집니다.',
      insights: [
        '비용 절감형 AI는 모방되고, 가치 창출형 AI는 축적된다.',
        '수익원이 하나면 리스크, 셋 이상이면 지속 가능성이다.',
        '검증은 시장 출시 이후가 아니라 파일럿 설계 단계에서 시작되어야 한다.'
      ],
      targets: ['스타트업 창업가', '신사업 담당', '중소기업 대표', '투자·심사역'],
      programs: ['lab', 'forum'], pubs: ['report', 'brief'],
      declaration: 3
    },
    {
      id: 'r05', no: '05', cat: 'creation',
      title: 'AI 창작·출판·콘텐츠',
      desc: 'AI와 인간의 협업으로 책, 영상, 교육콘텐츠, 지식상품 개발.',
      tags: ['창작', '출판', '콘텐츠', '지식상품'],
      question: 'AI가 문장을 무한히 생산하는 시대에, 독자가 끝까지 읽는 글의 조건은 무엇인가?',
      why: '생산량이 폭증할수록 희소해지는 것은 문장이 아니라 관점입니다. 창작에서 AI의 역할은 초안 속도이고, 인간의 역할은 방향·리듬·여운입니다. 둘의 분업 설계가 콘텐츠의 수명을 결정합니다.',
      insights: [
        'AI는 평균을 잘 쓰고, 사람은 예외를 잘 쓴다.',
        '기획(구조)에 시간을 더 쓸수록 집필 시간은 짧아진다.',
        '콘텐츠는 한 번 파는 상품이 아니라 재편집되는 자산이다.'
      ],
      targets: ['작가·출판기획자', '강사·교육콘텐츠 제작자', '마케터', '1인 지식창업가'],
      programs: ['academy', 'report'], pubs: ['book', 'edu'],
      declaration: 5
    },
    {
      id: 'r06', no: '06', cat: 'regional',
      title: '지역 AI 전환 전략',
      desc: '지자체·협회·대학·기업을 연결하는 지역혁신형 AI 프로젝트.',
      tags: ['지역혁신', '지자체', '대학', '협회'],
      question: '수도권 밖의 조직이 AI 전환에서 뒤처지지 않으려면, 무엇이 먼저 갖춰져야 하는가?',
      why: '지역의 문제는 예산이 아니라 연결입니다. 지자체·대학·기업·협회가 각자 사업을 벌이면 규모가 나오지 않습니다. 하나의 의제 아래 묶일 때 비로소 프로젝트가 성립합니다.',
      insights: [
        '지역 전환은 기술 이전이 아니라 의제 공유에서 시작된다.',
        '대학은 인력, 협회는 수요, 지자체는 명분, 기업은 실행을 가진다.',
        '작은 파일럿 1건의 성공 사례가 후속 예산의 근거가 된다.'
      ],
      targets: ['지자체 담당부서', '지역 대학·산학협력단', '업종별 협회', '지역 중견기업'],
      programs: ['forum', 'lab'], pubs: ['report', 'white'],
      declaration: 8
    },
    {
      id: 'r07', no: '07', cat: 'education',
      title: 'AI 교육 아카데미',
      desc: '입문부터 전략가 과정까지 이어지는 단계형 교육 체계.',
      tags: ['교육체계', '커리큘럼', '전략가과정'],
      question: '일회성 특강이 아니라, 사람을 실제로 바꾸는 교육 설계는 어떻게 다른가?',
      why: '특강은 만족도를 만들고 커리큘럼은 역량을 만듭니다. 입문–실무–리더십–전문가로 이어지는 단계가 있어야 학습자가 다음 단계를 스스로 찾습니다.',
      insights: [
        '교육의 성과는 강의 시간이 아니라 과제 제출률에서 드러난다.',
        '단계형 설계는 학습자를 붙잡는 장치이자 반복 매출의 구조다.',
        '수료가 끝이 아니라 커뮤니티 진입점이 되어야 한다.'
      ],
      targets: ['개인 학습자', '기업 교육담당', '공공 위탁교육', '대학 비교과'],
      programs: ['academy'], pubs: ['edu', 'brief'],
      declaration: 4
    },
    {
      id: 'r08', no: '08', cat: 'regional',
      title: 'AI 정책·제도 제안',
      desc: '현장 기반 정책 리포트, 제도 개선안, 공공협력 과제 발굴.',
      tags: ['정책', '제도개선', '공공협력', '과제발굴'],
      question: '현장에서 확인된 문제를 어떤 형식으로 담아야 정책 언어로 옮겨지는가?',
      why: '현장의 목소리는 크지만 정책으로 옮겨지지 않는 경우가 많습니다. 문제 정의–근거–대안–실행주체–예산 구조라는 형식을 갖출 때 비로소 검토 대상이 됩니다.',
      insights: [
        '정책 제안의 설득력은 분노가 아니라 구조에서 나온다.',
        '현장 사례 3건이 통계 1줄보다 먼저 읽힌다.',
        '실행주체가 비어 있는 제안은 채택되지 않는다.'
      ],
      targets: ['정책 담당 공무원', '연구기관', '협회·단체', '의정 지원 조직'],
      programs: ['lab', 'report'], pubs: ['white', 'report'],
      declaration: 8
    },
    {
      id: 'r09', no: '09', cat: 'human',
      title: 'AI휴먼 커뮤니티 네트워크',
      desc: '각계 전문가가 프로젝트 단위로 연결되는 지식 네트워크.',
      tags: ['커뮤니티', '네트워크', '전문가풀', '협업'],
      question: '명함 교환에서 끝나지 않고 실제 프로젝트로 이어지는 네트워크의 조건은 무엇인가?',
      why: '모임은 많지만 결과물은 적습니다. 차이는 “같이 만들 것”이 먼저 정해져 있는가에 있습니다. 프로젝트가 먼저 있으면 사람은 모입니다.',
      insights: [
        '관계가 프로젝트를 만드는 것이 아니라, 프로젝트가 관계를 남긴다.',
        '전문성의 조합은 동종보다 이종에서 가치가 커진다.',
        '기여 이력이 기록되는 커뮤니티만 오래 간다.'
      ],
      targets: ['기업인·전문가', '교수·연구자', '창작자', '정책·기관 담당자'],
      programs: ['forum'], pubs: ['brief'],
      declaration: 7
    },
    {
      id: 'r10', no: '10', cat: 'work',
      title: 'AI 시대 직무 재설계',
      desc: '조직별 직무·프로세스·역량맵을 AI 중심으로 재구성.',
      tags: ['직무재설계', '프로세스', '역량맵', 'HR'],
      question: 'AI가 업무의 일부를 대신할 때, 남는 사람의 일은 어떻게 다시 정의되어야 하는가?',
      why: '직무를 그대로 둔 채 도구만 바꾸면 업무는 줄지 않고 늘어납니다. 프로세스를 다시 그리고 역할을 재배치해야 도입 효과가 숫자로 나타납니다.',
      insights: [
        '자동화의 이득은 시간 절감이 아니라 절감된 시간의 재배치에서 나온다.',
        '직무 재설계 없는 도입은 “AI를 쓰느라 더 바쁜 조직”을 만든다.',
        '역량맵은 평가 도구가 아니라 이동 경로를 보여주는 지도여야 한다.'
      ],
      targets: ['HR·인사기획', '조직개발 담당', '현업 팀리더', '경영기획'],
      programs: ['lab', 'academy'], pubs: ['report', 'brief'],
      declaration: 8
    },
    {
      id: 'r11', no: '11', cat: 'creation',
      title: 'AI 특허·IP 전략',
      desc: 'AI 기반 서비스·플랫폼·콘텐츠의 지식재산화와 보호 전략.',
      tags: ['특허', 'IP', '지식재산', '보호전략'],
      question: '눈에 보이지 않는 방법론·데이터 구조·운영모델을 어떻게 자산으로 붙잡아 둘 것인가?',
      why: '서비스는 모방되지만 권리는 남습니다. 진단 프레임워크, 커리큘럼 구조, 데이터 스키마, 운영 모델은 기록하고 등록할 때 자산이 됩니다.',
      insights: [
        '아이디어는 보호되지 않고, 구조와 절차는 보호될 수 있다.',
        'IP는 방어 수단이자 협상 카드이며 매각 시 가치평가의 근거다.',
        '초기 문서화 습관이 나중의 권리 범위를 결정한다.'
      ],
      targets: ['스타트업·플랫폼 기업', '콘텐츠 사업자', '연구개발 조직', '기술창업가'],
      programs: ['lab'], pubs: ['white', 'report'],
      declaration: 9
    },
    {
      id: 'r12', no: '12', cat: 'future',
      title: '제5의 물결 미래전략',
      desc: 'AI 신문명 전환을 인간의 기회로 바꾸는 장기 담론 구축.',
      tags: ['미래전략', '제5의물결', '장기담론', '문명전환'],
      question: '10년 뒤에도 유효할 질문은 무엇이며, 지금 무엇을 준비해야 그때 늦지 않는가?',
      why: '단기 대응만 반복하면 조직은 유행을 좇습니다. 장기 담론은 방향을 고정해 주고, 그 방향이 매년의 선택을 단순하게 만듭니다.',
      insights: [
        '유행은 도구에서, 방향은 인간에 대한 질문에서 나온다.',
        '장기 담론은 예측이 아니라 대비 시나리오의 다발이다.',
        '브랜드는 반복된 질문에 이름을 붙일 때 만들어진다.'
      ],
      targets: ['경영진·전략기획', '연구자', '정책 설계자', '미래 준비 학습자'],
      programs: ['forum', 'report'], pubs: ['book', 'report'],
      declaration: 2
    }
  ];

  /* ── 4. AI휴먼전략랩 (Proposed Lab Architecture · 구축 제안) ──────
     ※ 확정 조직이 아닙니다. 전부 status:'proposed'.
     ------------------------------------ */
  var LABS = [
    { id: 'lab-leadership', name: 'Human-AI Leadership Lab', ko: '인간-AI 리더십 랩', status: 'proposed',
      focus: '리더의 의사결정 구조를 AI 시대에 맞게 재설계합니다.',
      themes: ['임원 의사결정 프로토콜', 'AI 위임 범위 설계', '리더십 진단 프레임워크'],
      cats: ['human'], research: ['r01', 'r09'] },
    { id: 'lab-work', name: 'Work & Organization Transformation Lab', ko: '일·조직 전환 랩', status: 'proposed',
      focus: '직무·프로세스·역량맵을 다시 그려 도입 효과를 숫자로 만듭니다.',
      themes: ['업무 자동화 설계', '직무 재설계 워크숍', '조직문화 전환 로드맵'],
      cats: ['work'], research: ['r10'] },
    { id: 'lab-governance', name: 'Responsible AI & Governance Lab', ko: '책임 AI·거버넌스 랩', status: 'proposed',
      focus: '조직이 안심하고 속도를 낼 수 있는 내부 기준을 만듭니다.',
      themes: ['AI 이용 내부규정 템플릿', '리스크 체크리스트', '신뢰 프레임워크'],
      cats: ['ethics'], research: ['r03'] },
    { id: 'lab-business', name: 'AI Business & Innovation Lab', ko: 'AI 비즈니스·혁신 랩', status: 'proposed',
      focus: 'AI가 아니면 불가능한 수익 구조를 설계하고 파일럿으로 검증합니다.',
      themes: ['BM 설계 캔버스', '파일럿 검증 설계', '투자 피칭 자료화'],
      cats: ['business'], research: ['r04', 'r11'] },
    { id: 'lab-education', name: 'Education & Capability Lab', ko: '교육·역량 랩', status: 'proposed',
      focus: '단계형 커리큘럼과 역량 진단 도구를 개발합니다.',
      themes: ['단계형 커리큘럼 설계', '역량 진단 문항 개발', '교재·강의자료 표준화'],
      cats: ['education'], research: ['r02', 'r07'] },
    { id: 'lab-regional', name: 'Regional & Future Strategy Lab', ko: '지역·미래전략 랩', status: 'proposed',
      focus: '지역 의제를 프로젝트로 묶고 장기 담론을 축적합니다.',
      themes: ['지역혁신 과제 발굴', '정책 리포트 설계', '제5의 물결 시나리오'],
      cats: ['regional', 'future'], research: ['r06', 'r08', 'r12'] }
  ];

  var LAB_PROCESS = [
    { step: '01', name: '문제정의', desc: '현장의 질문을 연구 가능한 형태로 좁힙니다.' },
    { step: '02', name: '리서치', desc: '자료·사례·이해관계자 인터뷰로 근거를 모읍니다.' },
    { step: '03', name: '프로토타입', desc: '가장 작은 형태로 해법을 만들어 봅니다.' },
    { step: '04', name: '파일럿', desc: '실제 조직·지역에서 제한 범위로 적용합니다.' },
    { step: '05', name: '성과검증', desc: '무엇이 달라졌는지 기준을 정해 확인합니다.' },
    { step: '06', name: '리포트·사업화', desc: '결과를 리포트·교육·상품으로 전환합니다.' }
  ];

  /* ── 5. 4대 사업축 (원문 보존) ──────────────────────────────────── */
  var PROGRAMS = [
    { id: 'forum', no: '01', name: '제5의 물결 AI휴먼전략포럼', en: 'Forum', icon: 'compass',
      lead: '월례 포럼, 라운드테이블, CEO 조찬회, 지역혁신 세미나 운영.',
      desc: '기업인, 교수, 연구자, 창작자, 정책 전문가, 지역 리더가 참여하는 개방형 전략 커뮤니티입니다.',
      bullets: ['연 4회 공개 컨퍼런스 및 분기별 이슈 포럼', '기업·대학·협회·지자체 협력 네트워크 구축', '회원제 기반 커뮤니티와 후원 파트너십'],
      formats: [
        { name: '공개 컨퍼런스', desc: '연 4회 · 개방형 · 주제별 기조와 세션', status: 'planned' },
        { name: '라운드테이블', desc: '소수 정예 · 비공개 토론 · 의제 중심', status: 'planned' },
        { name: 'CEO 리더 세션', desc: '경영진 조찬·저녁 세션 · 사례 공유', status: 'planned' },
        { name: '지역혁신 세미나', desc: '지자체·대학·협회 공동 개최', status: 'planned' }
      ] },
    { id: 'academy', no: '02', name: 'AI휴먼전략 아카데미', en: 'Academy', icon: 'cap',
      lead: '입문, 실무, 리더십, 전문가 과정으로 나뉘는 교육 사업.',
      desc: '개인·기업·기관이 AI를 사람 친화적으로 활용하도록 돕는 교육·리더십 프로그램입니다.',
      bullets: ['AI 리터러시·프롬프트·업무자동화·AI 윤리 과정', 'CEO·교수·강사·컨설턴트 대상 전략가 과정', '기업 맞춤형 사내교육과 공공기관 위탁교육'],
      levels: [
        { lv: 'L1', name: '입문', desc: 'AI 리터러시 · 도구 이해 · 첫 자동화 경험', status: 'planned' },
        { lv: 'L2', name: '실무', desc: '프롬프트 설계 · 업무 자동화 · 문서/데이터 활용', status: 'planned' },
        { lv: 'L3', name: '리더십', desc: '의사결정 · 조직전환 · AI 윤리와 내부규정', status: 'planned' },
        { lv: 'L4', name: '전문가', desc: '전략가 과정 · 강의/컨설팅 역량 · 프로젝트 설계', status: 'planned' }
      ] },
    { id: 'lab', no: '03', name: 'AI휴먼전략랩', en: 'Lab', icon: 'flask',
      lead: '실제 사업모델과 프로젝트를 설계·검증·사업화하는 실행 랩.',
      desc: '비즈니스모델, 정책과제, 창업아이템, 조직혁신 프로젝트를 실험하고 사업화합니다.',
      bullets: ['AI 도입 진단, 워크플로우 재설계, 파일럿 프로젝트', '창업·신사업 아이디어 검증과 제안서 제작', 'AI 서비스 특허·IP 전략 및 투자 피칭 자료화'] },
    { id: 'report', no: '04', name: 'AI Human Strategy Report', en: 'Report', icon: 'book',
      lead: '연구보고서, 백서, 도서, 뉴스레터, 유튜브 지식콘텐츠 발행.',
      desc: 'AI 시대의 변화, 산업전략, 사람 중심 리더십, 윤리와 정책을 리포트와 도서로 발행합니다.',
      bullets: ['월간 AI휴먼전략 브리프와 연간 전망 리포트', '기업·산업별 AI 전환 진단 리포트', '도서 출판, 강의 교재, 유튜브 콘텐츠 IP 확장'] }
  ];

  /* ── 6. Publications 카탈로그 (발행 계획 · 실데이터 없음) ─────────
     ※ 가짜 제목·날짜·조회수·인기순위를 만들지 않습니다.
     ※ 모든 항목 status:'planned' — 다운로드 비활성, 발행 알림 신청만 활성.
     ------------------------------------ */
  var PUB_TYPES = [
    { id: 'report', ko: '연구 리포트',  en: 'Research Report' },
    { id: 'brief',  ko: '전략 브리프',  en: 'Strategy Brief' },
    { id: 'white',  ko: '백서',        en: 'White Paper' },
    { id: 'book',   ko: '도서·출판',   en: 'Book / Publication' },
    { id: 'news',   ko: '뉴스레터',     en: 'Newsletter' },
    { id: 'edu',    ko: '강의·미디어', en: 'Lecture / Media' }
  ];

  var PUBLICATIONS = [
    { id: 'p-brief-monthly', type: 'brief', title: '월간 AI휴먼전략 브리프', status: 'planned',
      desc: '한 달 동안의 AI 변화를 사람·조직·전략의 관점으로 정리하는 정기 브리프.',
      cats: ['future', 'human'], plan: '창간 준비 중', file: null },
    { id: 'p-report-outlook', type: 'report', title: '연간 AI휴먼전략 전망 리포트', status: 'planned',
      desc: '한 해의 흐름을 12대 아젠다 축으로 해석하는 연간 전망 리포트.',
      cats: ['future'], plan: '기획 중', file: null },
    { id: 'p-report-industry', type: 'report', title: '산업별 AI 전환 진단 리포트', status: 'planned',
      desc: '업종별 도입 현황과 전환 과제를 진단 프레임워크로 정리하는 시리즈.',
      cats: ['business', 'work'], plan: '기획 중', file: null },
    { id: 'p-white-governance', type: 'white', title: 'AI 윤리·거버넌스 백서', status: 'planned',
      desc: '조직 내부 규정, 리스크 관리, 신뢰 프레임워크를 담는 백서.',
      cats: ['ethics'], plan: '기획 중', file: null },
    { id: 'p-white-policy', type: 'white', title: 'AI 정책·제도 제안 백서', status: 'planned',
      desc: '현장 기반 문제 정의와 제도 개선안을 담는 정책 제안 백서.',
      cats: ['regional'], plan: '기획 중', file: null },
    { id: 'p-book-fifthwave', type: 'book', title: '제5의 물결 · 사람 중심 AI 전략 (가제)', status: 'planned',
      desc: 'AI 신문명 전환을 인간의 기회로 바꾸는 장기 담론을 담는 단행본.',
      cats: ['future', 'creation'], plan: '집필 준비 중', file: null },
    { id: 'p-edu-curriculum', type: 'edu', title: 'AI휴먼전략 아카데미 교재·강의자료', status: 'planned',
      desc: '입문–실무–리더십–전문가 4단계 커리큘럼의 표준 교재와 강의자료.',
      cats: ['education'], plan: '개발 중', file: null },
    { id: 'p-news-weekly', type: 'news', title: 'AI휴먼전략 뉴스레터', status: 'planned',
      desc: '연구·포럼·교육 소식과 이번 주의 AI Human Question을 전하는 뉴스레터.',
      cats: ['human'], plan: '창간 준비 중', file: null },
    { id: 'p-edu-media', type: 'edu', title: '유튜브 지식콘텐츠 · 강연 아카이브', status: 'planned',
      desc: '포럼·강연·인터뷰를 지식 콘텐츠 IP로 축적하는 미디어 아카이브.',
      cats: ['creation'], plan: '준비 중', file: null },
    { id: 'p-report-region', type: 'report', title: '지역 AI 전환 사례 리포트', status: 'planned',
      desc: '지자체·대학·협회·기업 협력 프로젝트의 과정과 결과를 기록하는 리포트.',
      cats: ['regional'], plan: '기획 중', file: null }
  ];

  /* ── 7. 로드맵 (원문 보존) ──────────────────────────────────────── */
  var ROADMAP = [
    { term: 'SHORT TERM · 0~6개월', name: '셋업과 시장검증',
      items: ['브랜드·웹사이트·소개서·포럼 런칭', '창립 세미나 및 1기 운영위원 구성', 'AI 활용 기본교육 3종 출시', '월간 브리프·뉴스레터 발행'] },
    { term: 'MID TERM · 6~24개월', name: '사업 포트폴리오 확장',
      items: ['기업·기관 맞춤형 컨설팅 상품화', '회원제 포럼과 전문가 풀 운영', '산업별 AI 전환 리포트 판매', '지역·협회·대학 공동 프로젝트 추진'] },
    { term: 'LONG TERM · 2~5년', name: '민간 싱크탱크 브랜드화',
      items: ['연례 AI휴먼전략 컨퍼런스 개최', 'AI휴먼전략 인증·자격 과정 개발', '국내외 공동연구 및 정책제안 체계화', 'AI 전략 IP·플랫폼·콘텐츠 자산화'] }
  ];

  /* ── 8. 핵심 가치차별화 탭 (원문 보존) ──────────────────────────── */
  var VALUE_TABS = [
    { id: 'customer', title: '고객가치', text: 'AI를 막연한 기술이 아니라 개인과 조직의 성과로 바꾸는 실행형 전략을 제공합니다. 교육에서 끝나지 않고 진단, 적용, 리포트, 프로젝트 사업화까지 연결합니다.' },
    { id: 'service',  title: '서비스가치', text: '포럼, 아카데미, 랩, 리포트를 하나의 흐름으로 연결하여 학습·네트워킹·컨설팅·콘텐츠 발행이 반복되는 통합 서비스를 제공합니다.' },
    { id: 'profit',   title: '수익모델', text: '교육비, 포럼 멤버십, 기관 컨설팅, 리포트 판매, 공동 프로젝트, 출판·콘텐츠 IP, 인증과정으로 수익을 다각화합니다.' },
    { id: 'ip',       title: '특허·IP', text: 'AI 활용 진단 프레임워크, 조직 전환 방법론, 교육 커리큘럼, 리포트 데이터 구조, 플랫폼 운영모델을 지식재산 자산으로 축적합니다.' }
  ];

  /* ── 9. 멤버십 (원문 보존) ──────────────────────────────────────── */
  var MEMBERSHIP = [
    { id: 'open', name: '오픈 커뮤니티', badge: 'Free / Basic', featured: false,
      desc: 'AI 전환에 관심 있는 개인·창작자·청년·시민 리더 대상.',
      items: ['뉴스레터 구독', '공개 세미나 참여', 'AI휴먼전략 브리프 일부 열람'],
      cta: '참여 신청', ctaRoute: '#/contact?topic=community' },
    { id: 'expert', name: '전문가 멤버십', badge: 'Member', featured: true,
      desc: '기업인, 교수, 컨설턴트, 강사, 연구자, 정책·기관 담당자 대상.',
      items: ['월례 포럼·라운드테이블 참여', '리포트·교육자료 우선 제공', '공동 프로젝트·강의·컨설팅 기회 연결'],
      cta: '멤버십 문의', ctaRoute: '#/contact?topic=membership' },
    { id: 'partner', name: '기관 파트너십', badge: 'Partner', featured: false,
      desc: '기업, 협회, 대학, 공공기관, 지자체 대상 전략협력 모델.',
      items: ['맞춤형 AI 전환 컨설팅', '공동 포럼·교육·리포트 발행', '공모사업·R&D·정책과제 협력'],
      cta: '제휴 제안', ctaRoute: '#/partnership' }
  ];

  /* ── 10. Start Here (사용자군별 분기) ───────────────────────────── */
  var START_HERE = [
    { id: 'researcher', name: '연구자·교수', icon: 'book',
      line: '연구 질문과 12대 아젠다에서 시작하세요.',
      next: '연구 허브 열기', route: '#/research' },
    { id: 'org', name: '기업·기관·지자체', icon: 'grid',
      line: 'AI 전환 진단과 협력 모델을 확인하세요.',
      next: '협력·파트너십 보기', route: '#/partnership' },
    { id: 'founder', name: '창업가·전문가·창작자', icon: 'spark',
      line: '비즈니스모델·IP·창작 전략 랩으로 이동합니다.',
      next: '연구랩 보기', route: '#/labs' },
    { id: 'learner', name: '학습자·일반 사용자', icon: 'cap',
      line: '입문부터 전문가까지 단계형 교육 경로가 있습니다.',
      next: '아카데미 보기', route: '#/programs?p=academy' }
  ];

  /* ── 11. 이번 주의 AI Human Question (재방문 고리) ──────────────── */
  var WEEKLY_QUESTIONS = [
    { q: '이번 주 내가 AI에게 맡긴 판단 중, 사실은 내가 했어야 할 판단은 무엇이었나?', link: '#/research/r01' },
    { q: '우리 조직에서 AI를 가장 못 쓰는 사람은 왜 못 쓰고 있는가?', link: '#/research/r02' },
    { q: '지금 우리가 AI로 만든 결과물의 책임은 최종적으로 누구에게 있는가?', link: '#/research/r03' },
    { q: 'AI가 없어도 되는 우리의 수익 구조는, AI 시대에도 유효한가?', link: '#/research/r04' },
    { q: '내가 쓴 문장 중 AI가 절대 쓸 수 없었던 한 줄은 무엇인가?', link: '#/research/r05' },
    { q: '우리 지역에서 AI 전환을 가장 먼저 시작해야 할 곳은 어디인가?', link: '#/research/r06' },
    { q: '이번 달 배운 AI 기능 중 실제 업무에 붙인 것은 몇 개인가?', link: '#/research/r07' }
  ];

  /* ── 12. AI Human Guide 챗봇 (내부 데이터 기반 · 외부 API 미연결) ──
     ※ 실제 LLM 호출은 하지 않습니다. config.llm 은 향후 연결 지점만 분리.
     ※ API Key 를 프런트 코드에 절대 하드코딩하지 않습니다.
     ------------------------------------ */
  var CHAT_CONFIG = {
    mode: 'guide',              // 'guide' = 내부 데이터 안내 모드
    llmEndpoint: null,          // 향후 서버 프록시 URL 만 주입 (키 아님)
    disclaimer: 'AI Human Guide는 현재 KAHUGO 내부 콘텐츠를 안내하는 가이드 모드로 동작합니다. 외부 생성형 AI 모델에 연결되어 있지 않습니다.'
  };

  var CHAT_INTENTS = [
    { id: 'c1', chip: '연구 분야 찾아줘', keys: ['연구', '분야', '아젠다', 'research', '주제'],
      answer: 'KAHUGO의 연구는 12대 AI휴먼전략 아젠다를 8개 상위 분류로 묶어 운영합니다. 인간·리더십 / 일·조직 / 비즈니스·혁신 / 교육·역량 / 윤리·거버넌스 / 지역·정책 / 창작·IP / 미래전략입니다. 관심 분야를 고르면 연구 질문과 적용 대상까지 바로 확인할 수 있습니다.',
      ctas: [{ label: '연구 허브 열기', route: '#/research' }, { label: '12대 아젠다 보기', route: '#/research?view=agenda' }] },
    { id: 'c2', chip: '기업 AI 전환 프로그램', keys: ['기업', '전환', '컨설팅', '조직', '도입'],
      answer: '기업·기관의 AI 전환은 진단 → 직무·프로세스 재설계 → 파일럿 → 성과검증 → 리포트의 순서로 진행합니다. AI휴먼전략랩이 실행을 맡고, 아카데미가 리더십·실무 교육을 함께 붙입니다.',
      ctas: [{ label: 'AI휴먼전략랩 보기', route: '#/labs' }, { label: '협력·문의하기', route: '#/partnership' }] },
    { id: 'c3', chip: '포럼 참여 방법', keys: ['포럼', '참여', '세미나', '컨퍼런스', '모임'],
      answer: '제5의 물결 AI휴먼전략포럼은 공개 컨퍼런스 · 라운드테이블 · CEO 리더 세션 · 지역혁신 세미나로 구성됩니다. 일정은 준비 중이며, 커뮤니티에서 관심 분야를 등록해 두시면 개설 시 안내 대상에 포함됩니다.',
      ctas: [{ label: '포럼 프로그램 보기', route: '#/programs?p=forum' }, { label: '커뮤니티 참여하기', route: '#/community' }] },
    { id: 'c4', chip: 'AI휴먼전략랩', keys: ['랩', 'lab', '프로젝트', '파일럿', '실험'],
      answer: 'AI휴먼전략랩은 6개 랩 아키텍처를 구축 제안(Proposed) 상태로 설계해 두었습니다. 리더십 / 일·조직 / 거버넌스 / 비즈니스 / 교육 / 지역·미래 랩이며, 실행은 문제정의 → 리서치 → 프로토타입 → 파일럿 → 성과검증 → 리포트·사업화 6단계를 따릅니다.',
      ctas: [{ label: '랩 아키텍처 보기', route: '#/labs' }, { label: '공동 프로젝트 제안', route: '#/partnership' }] },
    { id: 'c5', chip: '리포트·브리프', keys: ['리포트', '브리프', '출판', '백서', '뉴스레터', '도서'],
      answer: 'AI Human Strategy Report는 연구 리포트 · 전략 브리프 · 백서 · 도서 · 뉴스레터 · 강의/미디어 6종으로 설계되어 있습니다. 현재는 모두 발행 준비 단계이므로 다운로드는 비활성 상태이며, 발행 알림을 신청하시면 창간 시 안내드립니다.',
      ctas: [{ label: '출판·리포트 보기', route: '#/publications' }, { label: '발행 알림 신청', route: '#/community?focus=subscribe' }] },
    { id: 'c6', chip: '협력·문의', keys: ['협력', '문의', '제휴', '파트너', '연락', '이메일'],
      answer: '설립 자문, 포럼 참여, 교육 의뢰, 기업 컨설팅, 공동 프로젝트 제안을 받고 있습니다. 문의 폼을 작성하시면 요약본이 만들어지고, 메일 앱으로 바로 보내실 수 있습니다.',
      ctas: [{ label: '협력·문의하기', route: '#/contact' }, { label: '기관 파트너십', route: '#/partnership' }] },
    { id: 'c7', chip: '10대 창립선언', keys: ['선언', '창립', '가치', '철학', '미션'],
      answer: 'KAHUGO의 10대 창립선언문은 기관의 공식 가치 기준입니다. 사람을 중심에 세우는 것에서 시작해 한국형 AI휴먼전략 모델을 세계와 연결하는 것으로 끝납니다.',
      ctas: [{ label: '10대 창립선언 보기', route: '#/about?s=declaration' }] },
    { id: 'c8', chip: '멤버십·수익모델', keys: ['멤버십', '회원', '수익', '가격', '요금', '후원'],
      answer: '멤버십은 오픈 커뮤니티(Free/Basic) · 전문가 멤버십(Member) · 기관 파트너십(Partner) 3단계입니다. 초기에는 교육·포럼·컨설팅으로 현금흐름을 만들고, 중장기적으로 리포트·인증·IP·플랫폼으로 확장하는 구조입니다.',
      ctas: [{ label: '멤버십 보기', route: '#/community?focus=membership' }, { label: '수익모델 보기', route: '#/about?s=value' }] }
  ];

  var CHAT_FALLBACK = '죄송합니다. 그 질문은 아직 가이드 모드에서 준비된 답변이 없습니다. 아래 추천 질문을 눌러 보시거나, 협력·문의를 통해 직접 남겨 주세요.';

  /* ── 13. 커뮤니티 관심 주제 ─────────────────────────────────────── */
  var INTERESTS = CATEGORIES.map(function (c) { return { id: c.id, ko: c.ko }; });

  var COMMUNITY_GUIDE = [
    '실명 또는 소속을 밝히고 존중하는 언어를 사용합니다.',
    '확인되지 않은 수치·실적·인용은 출처 없이 공유하지 않습니다.',
    '홍보보다 질문과 사례를 우선합니다.',
    '타인의 자료를 공유할 때는 저작권과 출처를 지킵니다.',
    '프로젝트 제안은 목적·역할·기간을 함께 적습니다.'
  ];


  /* ── 15. 내비게이션 (6대 메뉴 · 375px 무스크롤 최적화) ───────────
     ※ route 는 반드시 app.js 의 ROUTES 레지스트리에 존재해야 합니다.
        존재하지 않으면 빌드 게이트가 실패시킵니다.
     ------------------------------------ */
  var NAV = [
    { id: 'home',         label: '홈',       full: '홈',            icon: 'home',    route: '#/home' },
    { id: 'research',     label: '연구',     full: '연구 허브',     icon: 'compass', route: '#/research' },
    { id: 'labs',         label: '연구랩',   full: '연구랩',        icon: 'flask',   route: '#/labs' },
    { id: 'programs',     label: '프로그램', full: '4대 사업축',    icon: 'cap',     route: '#/programs' },
    { id: 'publications', label: '리포트',   full: '출판·리포트',   icon: 'book',    route: '#/publications' },
    { id: 'community',    label: '커뮤니티', full: '커뮤니티·멤버십', icon: 'users', route: '#/community' },
    { id: 'book',         label: '제5의 물결', full: '제5의 물결 · 도서', icon: 'wave2', route: '#/book', accent: true }
  ];

  /* 모바일 하단 탭 (5개 · 엄지 도달 영역) */
  var BOTTOM_NAV = [
    { id: 'home',      label: '홈',      icon: 'home',    route: '#/home' },
    { id: 'research',  label: '연구',    icon: 'compass', route: '#/research' },
    { id: 'book',      label: '제5의 물결', icon: 'wave2',  route: '#/book', accent: true },
    { id: 'diagnosis', label: '자가진단', icon: 'gauge',   route: '#/diagnosis' },
    { id: 'my',        label: '내 서재',  icon: 'bookmark', route: '#/my' }
  ];

  /* 상단 아이콘바 (찾기 · 다크모드 · 챗봇 · 협력문의) */
  var ICON_ACTIONS = [
    { id: 'search',  icon: 'search', label: '찾기',      aria: '통합 검색 열기',        action: 'open-search' },
    { id: 'theme',   icon: 'moon',   label: '다크모드',  aria: '밝은 화면/어두운 화면 전환', action: 'toggle-theme' },
    { id: 'chat',    icon: 'chat',   label: '챗봇',      aria: 'KAHUGO 가이드 챗봇 열기', action: 'open-chat' },
    { id: 'contact', icon: 'mail',   label: '협력문의',  aria: '협력·문의 페이지로 이동',  action: 'goto', route: '#/contact' }
  ];

  /* ── 16. AI휴먼전략 자가진단 (30초 · 가입 불필요) ────────────────
     ※ 심리검사·인증평가가 아닙니다. 조직·개인의 AI 전환 준비도를
        6개 축으로 되짚어 보는 자기점검 도구이며, 결과는 참고용입니다.
     ------------------------------------ */
  var DIAGNOSTIC = {
    title: 'AI휴먼전략 자가진단',
    lead: '6문항 · 약 30초. 가입 없이 바로 결과를 확인하고 저장할 수 있습니다.',
    disclaimer: '본 진단은 자기점검용 참고 도구입니다. 공인 인증·평가 결과가 아니며, 개별 조직의 의사결정을 대체하지 않습니다. 입력값은 서버로 전송되지 않고 이용자 기기에만 저장됩니다.',
    scale: [
      { v: 0, label: '전혀 아니다' },
      { v: 1, label: '조금 그렇다' },
      { v: 2, label: '대체로 그렇다' },
      { v: 3, label: '매우 그렇다' }
    ],
    questions: [
      { id: 'q1', axis: 'leadership', axisKo: '리더십·의사결정',
        text: '우리 조직(또는 나)은 AI에게 맡길 판단과 사람이 끝까지 책임질 판단의 경계를 말로 설명할 수 있다.',
        research: ['r01', 'r09'] },
      { id: 'q2', axis: 'capability', axisKo: '역량·리터러시',
        text: '반복되는 내 업무 중 최소 한 가지는 AI로 자동화해 실제로 시간을 줄인 경험이 있다.',
        research: ['r02', 'r07'] },
      { id: 'q3', axis: 'governance', axisKo: '윤리·거버넌스',
        text: 'AI 사용 범위·금지사항·최종 책임자를 정해 둔 내부 기준(문서)이 있다.',
        research: ['r03'] },
      { id: 'q4', axis: 'process', axisKo: '직무·프로세스',
        text: 'AI 도입에 맞춰 직무 분담이나 업무 프로세스를 실제로 다시 그린 적이 있다.',
        research: ['r10'] },
      { id: 'q5', axis: 'business', axisKo: '사업화·수익구조',
        text: '비용 절감을 넘어, AI가 있어야만 성립하는 제공 가치나 수익 구조를 설계해 본 적이 있다.',
        research: ['r04', 'r11'] },
      { id: 'q6', axis: 'culture', axisKo: '문화·네트워크',
        text: '조직 안팎에서 AI 활용 사례와 실패 경험을 정기적으로 공유하는 자리가 있다.',
        research: ['r06', 'r12'] }
    ],
    levels: [
      { min: 0,  max: 4,  code: 'L1', name: '인식 단계',
        summary: 'AI를 접했지만 아직 내 일과 연결되지 않은 상태입니다.',
        detail: '지금 필요한 것은 최신 모델 지식이 아니라 반복되는 내 업무 한 가지를 끝까지 자동화해 보는 첫 성공 경험입니다. 그 한 번이 이후 학습 지속률을 결정합니다.',
        actions: ['반복 업무 1개를 골라 처음부터 끝까지 AI로 처리해 보기', '입문 단계 커리큘럼(L1)으로 기준선 세우기', '월간 브리프 알림을 걸어 두고 흐름 따라가기'],
        program: 'academy', programNote: '아카데미 L1 입문 과정' },
      { min: 5,  max: 9,  code: 'L2', name: '시도 단계',
        summary: '도구는 쓰고 있지만 조직의 구조로는 아직 옮겨지지 않았습니다.',
        detail: '개인기로 쓰는 AI는 담당자가 바뀌면 사라집니다. 이 단계의 과제는 잘 쓰는 사람의 방법을 문서와 절차로 옮겨 조직의 자산으로 바꾸는 것입니다.',
        actions: ['잘 쓰는 사람의 프롬프트·절차를 표준 문서로 옮기기', 'AI 사용 범위와 최종 책임자를 한 장으로 정리하기', '실무 단계 커리큘럼(L2)으로 팀 기준선 맞추기'],
        program: 'academy', programNote: '아카데미 L2 실무 과정' },
      { min: 10, max: 14, code: 'L3', name: '정착 단계',
        summary: '기준과 절차가 생겼습니다. 이제 효과를 숫자로 만들 차례입니다.',
        detail: '도입 효과는 시간 절감 자체가 아니라 절감된 시간의 재배치에서 나옵니다. 직무와 프로세스를 다시 그리고, 파일럿의 성과를 측정 가능한 지표로 남기십시오.',
        actions: ['직무·프로세스 재설계 워크숍 1회 실행', '파일럿 1건을 정해 성과 기준을 먼저 합의하기', '결과를 내부 리포트로 문서화해 다음 예산의 근거로 만들기'],
        program: 'lab', programNote: 'AI휴먼전략랩 · 일·조직 전환 랩' },
      { min: 15, max: 18, code: 'L4', name: '전략 단계',
        summary: '운영은 안정적입니다. 남은 과제는 격차를 자산으로 굳히는 일입니다.',
        detail: '비용 절감형 AI는 모방되고 가치 창출형 AI는 축적됩니다. 방법론·데이터 구조·운영모델을 기록하고 권리로 등록할 때 비로소 자산이 됩니다.',
        actions: ['AI가 아니면 불가능한 제공 가치를 BM 캔버스로 설계', '진단 프레임워크·커리큘럼·데이터 스키마의 IP화 검토', '공동연구·정책과제·기관 파트너십으로 확장'],
        program: 'lab', programNote: 'AI휴먼전략랩 · 비즈니스·혁신 랩 / 특허·IP 전략' }
    ]
  };

  /* ── 17. 커뮤니티 시드 (운영팀 공식 안내글만) ────────────────────
     ※ 가짜 회원 글·가짜 좋아요·가짜 조회수를 만들지 않습니다.
     ※ 아래 3건은 모두 운영팀이 작성한 공지·가이드이며 official:true 로 구분됩니다.
     ※ 이용자가 작성한 글은 이용자 기기(localStorage)에만 저장됩니다.
     ------------------------------------ */
  var COMMUNITY_SEED = [
    { id: 'seed-1', official: true, author: 'KAHUGO 운영팀', cat: 'human', replies: [],
      title: '커뮤니티를 여는 첫 번째 질문',
      body: '이 커뮤니티는 정답을 모으는 곳이 아니라 질문을 정교하게 만드는 곳입니다. 첫 글로 이렇게 여쭙습니다. 이번 주에 AI에게 맡겼지만, 사실은 당신이 했어야 할 판단은 무엇이었습니까? 실패한 사례일수록 다른 분들에게 더 큰 도움이 됩니다.' },
    { id: 'seed-2', official: true, author: 'KAHUGO 운영팀', cat: 'ethics', replies: [],
      title: '수치·실적을 공유하실 때의 원칙',
      body: '우리는 확인되지 않은 수치와 실적을 출처 없이 공유하지 않습니다. 통계를 인용하실 때는 출처와 연도를, 사내 사례를 공유하실 때는 공개 가능한 범위를 먼저 확인해 주세요. 이 원칙 하나가 커뮤니티의 신뢰 수명을 결정합니다.' },
    { id: 'seed-3', official: true, author: 'KAHUGO 운영팀', cat: 'business', replies: [],
      title: '프로젝트 제안은 이렇게 적어 주세요',
      body: '관계가 프로젝트를 만드는 것이 아니라 프로젝트가 관계를 남깁니다. 제안 글에는 목적 / 필요한 역할 / 예상 기간 / 기여 가능한 것 네 가지를 함께 적어 주세요. 이 형식만 갖춰도 응답률이 크게 달라집니다.' }
  ];

  /* ── 18. FAQ & GUIDE ────────────────────────────────────────────── */
  var FAQ = [
    { q: 'KAHUGO는 어떤 기관인가요?', a: '한국AI휴먼전략연구원(KAHUGO)은 제5의 물결과 AI 대전환 시대에 인간 중심의 전략·연구·교육·사업화·커뮤니티를 연결하는 민간 전문 싱크탱크형 플랫폼입니다. 현재는 설립·런칭 기획 단계이며, 확정되지 않은 조직과 프로그램은 화면에서 Proposed 또는 준비 중으로 구분 표기합니다.' },
    { q: '지금 참여할 수 있는 것은 무엇인가요?', a: '가입 없이 자가진단을 받아 보실 수 있고, 관심 분야를 등록해 두시면 포럼·교육·리포트가 개설될 때 안내 대상에 포함됩니다. 커뮤니티에 질문과 사례를 남기는 것도 지금 바로 가능합니다.' },
    { q: '리포트는 언제 받아볼 수 있나요?', a: '출판 라인업 10종은 모두 발행 준비 단계입니다. 실제 파일이 없는 상태에서 다운로드 버튼을 열어 두지 않는 것이 저희 원칙이라, 현재는 발행 알림 신청만 활성화되어 있습니다.' },
    { q: '내가 입력한 내용은 어디에 저장되나요?', a: '자가진단 결과, 북마크, 커뮤니티 글, 관심 분야는 모두 이용자 기기의 브라우저 저장소에만 기록되며 서버로 전송되지 않습니다. 브라우저 데이터를 지우면 함께 사라지므로, 필요하시면 내 서재에서 내보내기를 이용해 주세요.' },
    { q: '챗봇은 생성형 AI에 연결되어 있나요?', a: '아니요. KAHUGO 가이드는 연구원 내부 콘텐츠를 안내하는 규칙 기반 가이드 모드로 동작합니다. 외부 생성형 AI 모델에 연결되어 있지 않으며, 답변은 이 플랫폼에 실제로 존재하는 내용만 안내합니다.' },
    { q: '협력·제휴는 어떻게 제안하나요?', a: '협력·문의 페이지에서 제안 유형과 내용을 작성하시면 요약본이 만들어지고, 메일 앱으로 바로 보내실 수 있습니다. 공동연구·컨설팅·교육 의뢰·정책과제·투자 및 파트너십 모두 열려 있습니다.' }
  ];

  /* ── 19. 신뢰·표기 원칙 (원문 취지 보존) ────────────────────────── */
  var TRUST_NOTES = [
    { icon: 'shield', title: '미확정 정보는 표기하지 않습니다', text: '연구실적·회원수·매출·수상·보도 등 검증되지 않은 정보를 실적처럼 적지 않습니다.' },
    { icon: 'flag',   title: 'Proposed / 준비 중 구분', text: '신규 제안 조직과 미개설 프로그램은 확정 사업과 분리해 표기합니다.' },
    { icon: 'lock',   title: '기기 내 저장 원칙', text: '진단·북마크·커뮤니티 입력값은 서버로 전송되지 않고 이용자 기기에만 저장됩니다.' },
    { icon: 'pen',    title: '자체 제작 자산', text: '로고·아이콘·도식은 전부 직접 그린 원본 SVG이며 외부 CDN과 웹폰트를 사용하지 않습니다.' }
  ];

  /* ── 20. 홈 퀵액션 (3초 룰 · 첫 화면 행동 유도) ─────────────────── */
  var QUICK_ACTIONS = [
    { id: 'qa-diag',  icon: 'gauge',    title: '30초 자가진단',   sub: '가입 없이 지금 바로', route: '#/diagnosis', primary: true },
    { id: 'qa-res',   icon: 'compass',  title: '12대 아젠다',     sub: '연구 질문부터 보기',  route: '#/research' },
    { id: 'qa-book',  icon: 'wave2',    title: '도서 미리보기',   sub: '58쪽 무료 공개',      route: '#/preview' },
    { id: 'qa-part',  icon: 'handshake', title: '협력 제안하기',  sub: '공동연구·교육·컨설팅', route: '#/partnership' }
  ];

  /* ── 14. 통합 검색 인덱스 빌드 ──────────────────────────────────── */
  function buildSearchIndex() {
    var idx = [];
    RESEARCH.forEach(function (r) {
      idx.push({ type: '연구', title: r.title, sub: r.desc, route: '#/research/' + r.id, keys: (r.tags.join(' ') + ' ' + r.title + ' ' + r.desc + ' ' + r.question) });
    });
    LABS.forEach(function (l) {
      idx.push({ type: '연구랩', title: l.ko, sub: l.focus, route: '#/labs/' + l.id, keys: l.ko + ' ' + l.name + ' ' + l.focus + ' ' + l.themes.join(' ') });
    });
    PROGRAMS.forEach(function (p) {
      idx.push({ type: '프로그램', title: p.name, sub: p.lead, route: '#/programs?p=' + p.id, keys: p.name + ' ' + p.en + ' ' + p.lead + ' ' + p.bullets.join(' ') });
    });
    PUBLICATIONS.forEach(function (p) {
      idx.push({ type: '출판', title: p.title, sub: p.desc, route: '#/publications/' + p.id, keys: p.title + ' ' + p.desc });
    });
    DECLARATIONS.forEach(function (d, i) {
      idx.push({ type: '창립선언', title: String(i + 1).padStart(2, '0') + '. ' + d.title, sub: d.short, route: '#/about?s=declaration&d=' + (i + 1), keys: d.title + ' ' + d.short + ' ' + d.body });
    });
    MEMBERSHIP.forEach(function (m) {
      idx.push({ type: '멤버십', title: m.name, sub: m.desc, route: '#/community?focus=membership', keys: m.name + ' ' + m.desc + ' ' + m.items.join(' ') });
    });
    VALUE_TABS.forEach(function (v) {
      idx.push({ type: '가치', title: v.title, sub: v.text.slice(0, 60) + '…', route: '#/about?s=value&t=' + v.id, keys: v.title + ' ' + v.text });
    });
    ROADMAP.forEach(function (r) {
      idx.push({ type: '로드맵', title: r.name, sub: r.term, route: '#/about?s=roadmap', keys: r.name + ' ' + r.term + ' ' + r.items.join(' ') });
    });
    PROGRAMS.forEach(function (p) {
      idx.push({ type: '연구원 소개', title: '기관 정체성 · ' + p.name, sub: INSTITUTE.identityHeadline, route: '#/about', keys: '정체성 아이덴티티 기관소개 연구원 소개 ' + p.name + ' ' + INSTITUTE.identitySub });
    });
    idx.push({ type: '연구원 소개', title: 'Why Now · ' + INSTITUTE.whyNowHeadline, sub: INSTITUTE.quote, route: '#/about?s=why', keys: '왜 지금 why now 정체성 철학 인간중심 휴머니티 ' + INSTITUTE.whyNowBody + ' ' + INSTITUTE.whyNowPoints.join(' ') });
    idx.push({ type: '협력·문의', title: '협력·파트너십 제안', sub: '공동연구 · 컨설팅 · 교육 의뢰 · 정책과제', route: '#/partnership', keys: '협력 문의 제휴 파트너십 파트너 컨설팅 공동연구 제안 contact partnership' });
    idx.push({ type: '커뮤니티', title: '브리프·뉴스레터 구독', sub: '발행 시작 시 가장 먼저 안내드립니다', route: '#/community?focus=subscribe', keys: '구독 뉴스레터 브리프 알림 subscribe' });
    idx.push({ type: '자가진단', title: 'AI휴먼전략 자가진단', sub: '6문항 · 30초 · 가입 불필요', route: '#/diagnosis', keys: '진단 자가진단 테스트 준비도 성숙도 레벨 점검 diagnosis 시뮬레이터' });
    DIAGNOSTIC.levels.forEach(function (lv) {
      idx.push({ type: '자가진단', title: lv.code + ' · ' + lv.name, sub: lv.summary, route: '#/diagnosis', keys: lv.code + ' ' + lv.name + ' ' + lv.summary + ' ' + lv.detail });
    });
    FAQ.forEach(function (f, i) {
      idx.push({ type: '자주 묻는 질문', title: f.q, sub: f.a.slice(0, 58) + '…', route: '#/about?s=faq&q=' + i, keys: f.q + ' ' + f.a });
    });
    idx.push({ type: '내 서재', title: '북마크 · 최근 본 콘텐츠 · 진행률', sub: '저장한 내용을 한 곳에서', route: '#/my', keys: '내 서재 북마크 저장 최근 진행률 마이페이지 내보내기 my' });
    idx.push({ type: '커뮤니티', title: '커뮤니티 글쓰기', sub: '질문·사례·프로젝트 제안', route: '#/community?focus=write', keys: '글쓰기 게시 질문 사례 제안 커뮤니티 write' });

    /* 카테고리 이름(‘창립선언’, ‘로드맵’ 등)으로도 검색되도록 type 을 키워드에 포함 */
    idx.forEach(function (it) { it.keys = it.keys + ' ' + it.type; });
    return idx;
  }

  global.KAHUGO_DATA = {
    INSTITUTE: INSTITUTE,
    DECLARATIONS: DECLARATIONS,
    DECLARATION_CLOSING: DECLARATION_CLOSING,
    CATEGORIES: CATEGORIES,
    RESEARCH: RESEARCH,
    LABS: LABS,
    LAB_PROCESS: LAB_PROCESS,
    PROGRAMS: PROGRAMS,
    PUB_TYPES: PUB_TYPES,
    PUBLICATIONS: PUBLICATIONS,
    ROADMAP: ROADMAP,
    VALUE_TABS: VALUE_TABS,
    MEMBERSHIP: MEMBERSHIP,
    START_HERE: START_HERE,
    WEEKLY_QUESTIONS: WEEKLY_QUESTIONS,
    CHAT_CONFIG: CHAT_CONFIG,
    CHAT_INTENTS: CHAT_INTENTS,
    CHAT_FALLBACK: CHAT_FALLBACK,
    INTERESTS: INTERESTS,
    COMMUNITY_GUIDE: COMMUNITY_GUIDE,
    NAV: NAV,
    BOTTOM_NAV: BOTTOM_NAV,
    ICON_ACTIONS: ICON_ACTIONS,
    DIAGNOSTIC: DIAGNOSTIC,
    COMMUNITY_SEED: COMMUNITY_SEED,
    FAQ: FAQ,
    TRUST_NOTES: TRUST_NOTES,
    QUICK_ACTIONS: QUICK_ACTIONS,
    SEARCH_INDEX: buildSearchIndex()
  };

  /* 관리자 모드에서 콘텐츠를 바꾼 뒤 검색 색인을 다시 만들기 위해 노출한다. */
  global.KAHUGO_BUILD_INDEX = buildSearchIndex;
})(window);
