# CLAUDE.md

이 파일은 Claude가 이 저장소에서 작업할 때 매 세션 자동으로 읽는다.
사람용 README가 아니다 — 길게 쓰지 말 것.

## 프로젝트

SM-2(간격반복) 기반 플래시카드 학습 사이트.

### 제약 (모든 결정에 우선)

- **0원 호스팅** — 백엔드, DB 서버, 유료 서비스 추가 제안 금지. 데이터는 IndexedDB(클라이언트)에만 둔다.
- **1주 데드라인** — 시작 2026-06-29, 배포 목표 2026-07-06. 기능보다 scope cut 우선.
- **언어** — UI/문구는 한국어. 코드 식별자/커밋 메시지는 영어.

## 스택

| 영역 | 선택 |
|---|---|
| 빌드 | Vite 8 |
| UI | React 19 + TypeScript |
| 스타일 | TailwindCSS v4 (Vite 플러그인) |
| 저장소 | Dexie.js (IndexedDB) |
| 라우팅 | react-router-dom v7 |
| 린트 | oxlint |
| 배포 | Cloudflare Pages 또는 Vercel (미정) |

세부 버전은 `package.json` 참조.

## 디렉토리

```
src/
  db/db.ts      Dexie 스키마. 모든 DB 접근은 여기서 export한 db를 통해서만.
  lib/sm2.ts    SM-2 알고리즘. 순수 함수, side-effect 없음.
  pages/        라우트 1개 = 파일 1개.
  App.tsx       BrowserRouter + Routes.
```

## 명령

```
npm run dev      개발 서버 (http://localhost:5173)
npm run build    타입체크 + 프로덕션 빌드
npm run lint     oxlint
```

## 작업 원칙

1. **스키마 변경**: `db/db.ts`에 새 `version(N).stores(...)`를 추가하고 마이그레이션을 작성. 기존 사용자 IndexedDB를 깨면 안 된다.
2. **SM-2는 식 자체를 바꾸지 않는다**: 검증된 알고리즘. 보너스/리미터 같은 외부 정수 조정만 허용.
3. **추상화는 3번 반복 후에**: 공통 컴포넌트, 커스텀 훅, 디자인 토큰, 추상 레이어를 미리 만들지 않는다. 같은 패턴이 3곳 이상 나타난 이후 추출.
4. **백엔드/인증/사이드 기능 제안 금지**: 모든 그런 제안은 "MVP 이후"로 미룬다.

## 상태 관리

- 로컬 UI 상태: `useState`.
- DB에서 파생되는 상태: `useLiveQuery` (Dexie). DB 변경 시 자동 리렌더.
- **전역 상태 도입 금지**: Context, Redux, Zustand, Jotai 등 추가하지 않는다. MVP 범위에서 전역 상태가 필요한 시나리오가 없다.

## Tailwind 사용 규칙

- JSX에 인라인 클래스만 사용한다.
- `@apply`로 컴포넌트 스타일 추출, 별도 CSS 클래스 정의 금지. (작업 원칙 #3에 따름.)
- 커스텀 색/간격이 필요하면 Tailwind의 임의 값 문법(`bg-[#abc]`, `w-[42px]`)을 먼저 시도하고, 같은 값이 3곳 이상 쓰일 때만 `tailwind.config`에 추가.

## 배포 / 호스팅 노트

- 정적 호스트(Cloudflare Pages, Vercel)에서 SPA로 동작하려면 `/deck/123` 같은 클라이언트 라우트가 404 나지 않도록 fallback 필요.
  - Cloudflare Pages: `public/_redirects`에 `/* /index.html 200`
  - Vercel: `vercel.json`에 rewrites 설정
- 배포 시점에 추가한다. 지금 미리 설정하지 말 것.

## MVP 범위 밖 (보류)

명시적으로 1주 MVP에서 제외:

- 사용자 계정 / 로그인
- 기기 간 동기화 (백엔드)
- 카드 편집 (현재 추가/삭제만)
- 이미지/오디오 카드
- 통계 대시보드
- 다국어 UI
- 자동화 테스트 (배포 후 재검토)

이 목록에 있는 항목을 진행하려면 사용자에게 명시적으로 확인.
