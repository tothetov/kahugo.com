이 functions/ 폴더는 Cloudflare Pages 전용(관리자 B안 · 실시간 편집 백엔드)입니다.
일반 웹호스팅(public_html)에는 올리지 않아도 사이트는 100% 그대로 작동합니다(정적 배포 · A안).

[필수]  KV 바인딩 KAHUGO_KV(사이트 설정·관리자 비밀번호) · D1 바인딩 KAHUGO_DB(커뮤니티·문의·구독, 표 자동 생성)
        환경변수 KAHUGO_ADMIN_PASSWORD, KAHUGO_SECRET
        ※ D1이 없으면 사이트 커뮤니티는 자동으로 '이 기기 저장' 방식으로 동작합니다.
[선택]  GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH         → 관리자 ‘GitHub에 커밋’
        KAKAO_REST_KEY, KAKAO_CLIENT_SECRET              → 카카오 로그인 실연동
        NAVER_CLIENT_ID, NAVER_CLIENT_SECRET             → 네이버 로그인 실연동
        RESEND_API_KEY, RESEND_FROM, INQUIRY_TO          → 문의 메일 자동 전달
설정 후 index.html 의 <meta name="kahugo-api" content="off"> 를 on 으로 (CloudflarePages 패키지는 이미 on)

엔드포인트
  GET  /api/health                 서버 감지
  GET  /api/config  · PUT(관리자)   실시간 사이트 설정
  POST /api/admin/login            관리자 로그인(12시간 토큰)
  POST /api/admin/password         관리자 비밀번호 변경
  POST /api/admin/publish          GitHub 커밋(자동 재배포)
  GET  /api/admin/inbox            문의·글·구독자 모아보기
  POST /api/admin/moderate         글 숨김/다시공개/삭제
  GET/POST /api/community/posts    커뮤니티 글 (텍스트만 · 파일 업로드 불가)
  POST /api/community/comment|like|report
  POST /api/inquiry · /api/subscribe
  GET  /api/auth/{kakao|naver}/start · /callback · /api/auth/me · POST /api/auth/logout
