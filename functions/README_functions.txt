이 functions/ 폴더는 Cloudflare Pages 전용입니다.
Netlify 등 다른 정적 호스팅에 올릴 때는 이 폴더를 제외해도 사이트는 100% 정상 작동합니다
(관리자 패널이 /api/config 를 못 찾으면 자동으로 "정적 배포 모드(A안)"로 표시됩니다).

Cloudflare Pages에서 B안(실시간 편집 + 회원승인 다기기 동기화)을 쓰려면:
1) Cloudflare 대시보드 → KV → 네임스페이스 생성 (이름 예: kahugo-kv)
2) Pages 프로젝트 → Settings → Functions → KV namespace bindings
   변수 이름: KAHUGO_KV → 방금 만든 네임스페이스 연결
3) Pages 프로젝트 → Settings → Environment variables
   이름: KAHUGO_ADMIN_TOKEN → 값: 관리자만 아는 임의의 긴 문자열(운영/미리보기 둘 다 설정)
4) index.html의 <meta name="kahugo-api" content="off"> 를 content="on" 으로 변경 후 재배포
5) /admin/ 접속 → 저장/배포 탭 → 상단 배지가 "실시간 편집 연결됨(B안)"으로 바뀌면 성공

자세한 절차는 함께 제공되는 "카후고_배포가이드_Cloudflare_GitHub.docx" 를 참고하세요.
