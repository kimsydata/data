# 그린테크(GreenTech) 공식 웹사이트

친환경 생활용품 회사 그린테크의 소개·제품·고객 게시판·댓글·회원/관리자 시스템을 갖춘 풀스택 웹 애플리케이션입니다.

- **프론트엔드(client)**: React + Vite + TypeScript + Tailwind CSS (react-router) — 포트 `5173`
- **백엔드(server)**: Node.js + Express (REST API) — 포트 `4000`
- **DB**: SQLite(파일) + Prisma ORM
- **인증/보안**: 로컬 로그인(회원·관리자) + 소셜 로그인(구글·카카오 OAuth/PKCE), bcrypt 해시, helmet 보안 헤더, 로그인 rate limiting, 세션 재생성, 영속 세션(connect-sqlite3)

```
greentech/
├── server/   # Express + Prisma + SQLite
└── client/   # React + Vite
```

## 주요 기능
- 공개: 홈 / 회사소개 / 제품목록·상세 / 게시판(목록·상세) / 404
- 회원: 회원가입·로그인, 소셜 로그인(구글·카카오), 글·댓글 작성/수정/삭제(본인 것만)
- 관리자: 제품 CRUD, 게시글 관리, 회원 관리(목록·정지/해제·삭제)
- 게시판: 글 목록에 댓글 수 표시, 댓글 작성/수정/삭제
- 보안: 정지 회원 차단, OAuth PKCE·state·rate limit 등

---

## 0. 사전 요구사항
- Node.js 18 이상, npm
- (선택) 영속 세션 저장소(connect-sqlite3)는 네이티브 `sqlite3` 빌드가 필요합니다. 빌드 도구가 없으면 자동으로 메모리 세션으로 폴백하므로 실행에는 지장이 없습니다.

---

## 1. 서버(server) 실행

```bash
cd server
npm install                 # 의존성 설치
npx prisma generate         # Prisma Client 생성
npx prisma db push          # SQLite 스키마 생성(server/prisma/dev.db)
npm run db:seed             # 초기 데이터 시드
npm run dev                 # http://localhost:4000
```
> 한 줄 초기화: `npm install && npx prisma db push && npm run db:seed && npm run dev`

시드 데이터: 제품 6, 게시글 4, 댓글 2, 회원 2, 관리자 1.

기본 계정 (메인 로그인 화면 `/login`에서 회원·관리자 모두 로그인 가능)
- 관리자 — `admin` / `admin1234` (로그인 시 관리자 대시보드로 이동)
- 일반 회원 — `user1` / `user1234`
- 정지(비활성) 회원 데모 — `user2` / `user1234` (로그인 시 403)

> 환경변수는 `dotenv`로 `server/.env`에서 자동 로드됩니다. 값 변경 후에는 서버를 재시작하세요.

## 2. 클라이언트(client) 실행

서버를 먼저 켠 뒤(Vite가 `/api`를 `:4000`으로 프록시):

```bash
cd client
npm install
npm run dev          # http://localhost:5173
```
정적 검사/빌드: `npm run typecheck`, `npm run build`, `npm run preview`

- 사이트: http://localhost:5173
- 회원 로그인/가입: `/login`, `/register`
- 관리자: `/admin` (비관리자 접근 시 `/admin/login`으로 이동)

---

## 3. 테스트 방법

### 3-A. 자동 테스트 스크립트 (server — 권장)

루트의 `test-api.sh`를 사용하면 모든 API를 한 번에 점검합니다. **서버가 `npm run dev`로 떠 있는 상태**에서 실행하세요. (시드 직후 데이터 기준)

```bash
# 프로젝트 루트에서
sh test-api.sh
# 또는 다른 포트면: BASE=http://localhost:4000 sh test-api.sh
```
> POSIX 셸(sh/dash) 호환이며 `curl`만 필요합니다. PASS/FAIL과 합계를 출력합니다.

### 3-B. 수동 curl 테스트 (server)

서버가 떠 있는 상태에서 새 터미널을 열어 순서대로 실행하세요. `-c/-b cookies.txt`로 세션 쿠키를 저장·전송합니다.

**(1) 공개 읽기 — 쿠키 불필요**
```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/products
curl http://localhost:4000/api/products/1
curl http://localhost:4000/api/posts             # 각 글에 commentCount 포함
curl http://localhost:4000/api/posts/4
curl http://localhost:4000/api/posts/4/comments
curl -i http://localhost:4000/api/health         # helmet 보안 헤더 확인
```

**(2) 비로그인 차단 — 401이면 정상**
```bash
curl -i -X POST http://localhost:4000/api/posts \
  -H "Content-Type: application/json" -d '{"title":"제목","content":"내용"}'
```

**(3) 회원 로그인 (쿠키 저장)**
```bash
curl -c cookies.txt -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" -d '{"username":"user1","password":"user1234"}'
curl -b cookies.txt http://localhost:4000/api/auth/me
```

**(4) 회원: 글 작성→수정→삭제 (작성자는 서버가 세션에서 자동 설정)**
```bash
POST_ID=$(curl -s -b cookies.txt -X POST http://localhost:4000/api/posts \
  -H "Content-Type: application/json" -d '{"title":"내 글","content":"본문"}' \
  | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo "새 글 id=$POST_ID"
curl -b cookies.txt -X PUT http://localhost:4000/api/posts/$POST_ID \
  -H "Content-Type: application/json" -d '{"title":"수정","content":"수정본"}'
curl -b cookies.txt -X DELETE http://localhost:4000/api/posts/$POST_ID
```

**(5) 회원: 댓글 작성→수정→삭제**
```bash
CID=$(curl -s -b cookies.txt -X POST http://localhost:4000/api/posts/4/comments \
  -H "Content-Type: application/json" -d '{"content":"좋은 글이네요"}' \
  | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
curl -b cookies.txt -X PUT http://localhost:4000/api/comments/$CID \
  -H "Content-Type: application/json" -d '{"content":"수정한 댓글"}'
curl -b cookies.txt -X DELETE http://localhost:4000/api/comments/$CID
```
> 남의 글/댓글 수정·삭제는 403, 관리자는 모두 가능.

**(6) 관리자: 제품 CRUD / 회원 관리**
```bash
curl -c admin.txt -X POST http://localhost:4000/api/auth/admin/login \
  -H "Content-Type: application/json" -d '{"username":"admin","password":"admin1234"}'

# 제품
curl -b admin.txt -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" -d '{"name":"대나무 칫솔","price":3500,"summary":"친환경"}'
# (응답 id로) 수정/삭제
# curl -b admin.txt -X PUT http://localhost:4000/api/products/7 -H "Content-Type: application/json" -d '{"name":"수정","price":4000}'
# curl -b admin.txt -X DELETE http://localhost:4000/api/products/7

# 회원: 목록 / 정지 / 해제 / 삭제
curl -b admin.txt http://localhost:4000/api/admin/users
curl -b admin.txt -X PATCH http://localhost:4000/api/admin/users/1 \
  -H "Content-Type: application/json" -d '{"active":false}'   # 정지
curl -b admin.txt -X PATCH http://localhost:4000/api/admin/users/1 \
  -H "Content-Type: application/json" -d '{"active":true}'    # 해제
```

**(7) 보안 확인**
```bash
# 일반 회원이 제품 생성 → 403
curl -i -b cookies.txt -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" -d '{"name":"x","price":1}'
# 정지 회원 로그인 → 403
curl -i -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" -d '{"username":"user2","password":"user1234"}'
# 로그인 무차별 대입 방지: 15분 20회 초과 시 429 (테스트는 맨 마지막에)
i=1; while [ $i -le 22 ]; do \
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" -d '{"username":"x","password":"y"}'; i=$((i+1)); done
```
> 정리: `rm -f cookies.txt admin.txt`. 삭제 성공은 `204`(본문 없음)이며 상태코드는 `-i`로 확인하세요. rate limit 테스트는 이후 로그인을 잠시 막으니 마지막에 실행하세요.

### 3-C. 소셜 로그인(구글·카카오) 테스트 — 실제 키 필요

로그인/회원가입 화면에는 **카카오·구글 버튼이 항상 표시**됩니다. 다만 실제 로그인은 각 제공자 콘솔에서 앱을 등록하고 키를 `server/.env`에 넣어야 동작합니다(아래 4-1). 키가 없는 제공자 버튼을 누르면 "아직 설정되지 않았습니다"라는 안내가 표시됩니다.
1. `server/.env`에 키 입력 후 서버 재시작.
2. `/login`에서 "Google로 로그인 / 카카오로 로그인" 클릭 → 제공자 동의 → 자동 로그인되어 홈으로 복귀.
3. 빠른 확인: `curl http://localhost:4000/api/auth/oauth/status` → 설정된 제공자가 `true`.

### 3-D. 브라우저 수동 시나리오 (client)

http://localhost:5173 접속 후:

**A. 공개(비로그인)**
1. 홈 히어로 + 대표 제품 3개. 2. 제품소개 카드 6개(모바일1/태블릿2/PC3열), 클릭 시 상세.
3. 게시판 목록에 댓글 수 `[n]` 표시. 4. "글쓰기" 클릭 → "로그인이 필요합니다" 모달.
5. 없는 경로(`/zzz`) → 404.

**B. 회원**
6. 회원가입 또는 `user1`/`user1234` 로그인. 7. 글쓰기(작성자 자동) → 등록 후 상세.
8. 내 글에만 수정/삭제 버튼. 9. 댓글 작성/수정(인라인)/삭제. 10. 새로고침해도 로그인 유지.

**C. 관리자**
11. `/admin/login`에서 `admin`/`admin1234`. 12. 대시보드: 제품/게시글/회원 수.
13. 제품 관리(추가·수정·삭제 모달). 14. 게시글 관리(전체 조회·삭제).
15. 회원 관리: 활성/정지 배지 + 정지/해제 토글 + 삭제. 16. 비관리자로 `/admin` 접근 → 로그인으로 리다이렉트.

---

## 4. 라우트 / API

### 화면 라우트
| 구분 | 경로 |
| --- | --- |
| 공개 | `/` `/about` `/products` `/products/:id` `/board` `/board/:id` `/login` `/register` |
| 로그인 필요 | `/board/new` (회원·관리자) |
| 관리자 전용 | `/admin/login` `/admin` `/admin/products` `/admin/posts` `/admin/users` |
| 그 외 | 정의되지 않은 경로 → 404 |

### REST API
| 메서드 · 경로 | 권한 |
| --- | --- |
| `GET /api/products`, `GET /api/products/:id` | 공개 |
| `POST/PUT/DELETE /api/products` | 관리자 |
| `GET /api/posts`(commentCount 포함), `GET /api/posts/:id` | 공개 |
| `POST /api/posts` | 로그인 |
| `PUT/DELETE /api/posts/:id` | 작성자 본인 또는 관리자 |
| `GET /api/posts/:postId/comments` | 공개 |
| `POST /api/posts/:postId/comments` | 로그인 |
| `PUT/DELETE /api/comments/:id` | 작성자 본인 또는 관리자 |
| `POST /api/auth/register`, `POST /api/auth/login` | 회원 |
| `POST /api/auth/admin/login` | 관리자 |
| `POST /api/auth/logout`, `GET /api/auth/me` | 공통 |
| `GET /api/auth/oauth/status` | 공개 |
| `GET /api/auth/oauth/:provider` (`google`·`kakao`) | 공개(인증으로 리디렉트) |
| `GET /api/auth/oauth/:provider/callback` | 공개(콜백 처리) |
| `GET /api/admin/users`, `PATCH /api/admin/users/:id`, `DELETE /api/admin/users/:id` | 관리자 |

모든 에러는 `{ "error": "메시지" }` JSON과 알맞은 상태코드로 응답합니다.

### 권한 정책
| 작업 | 비로그인 | 일반 회원 | 관리자 |
| --- | --- | --- | --- |
| 글·댓글 읽기 | ✅ | ✅ | ✅ |
| 글·댓글 작성 | ❌ | ✅ | ✅ |
| 글·댓글 수정·삭제 | ❌ | 본인 것만 | 모두 |
| 제품 CRUD | ❌ | ❌ | ✅ |
| 회원 목록·정지·삭제 | ❌ | ❌ | ✅ |

---

## 4-1. 소셜 로그인(구글·카카오) 연동

키가 없으면 소셜 버튼이 표시되지 않으며, 직접 호출 시 `/login?error=..._not_configured`로 안내됩니다.

> ⚠️ 회원(User) 스키마가 변경되었으니 코드를 받은 뒤 반드시 `cd server && npx prisma db push`로 반영하세요.

**Google**: Google Cloud Console → OAuth 클라이언트 ID(웹) 생성 → 승인된 리디렉션 URI `http://localhost:4000/api/auth/oauth/google/callback` → `GOOGLE_CLIENT_ID/SECRET` 입력.
**Kakao**: Kakao Developers → 카카오 로그인 활성화 → Redirect URI `http://localhost:4000/api/auth/oauth/kakao/callback`, 동의 항목(닉네임/이메일) 설정 → `KAKAO_CLIENT_ID`에 REST API 키(선택: `KAKAO_CLIENT_SECRET`).

**적용된 OAuth 보안 (RFC 9700 / OAuth 2.1)**
- PKCE(S256), state(32B·1회용·10분 만료), Client Secret 서버 보관, OAuth rate limiting, `Cache-Control: no-store`, 세션 재생성, 콜백 후 고정 리디렉트(오픈 리디렉트 차단), 소셜 전용 계정은 비밀번호 로그인 불가.

## 5. 보안 & 세션
- 로그인 시 httpOnly 쿠키 발급, 새로고침해도 `/api/auth/me`로 상태 복원. `maxAge` 1일 + `rolling`(슬라이딩 만료).
- 영속 저장소: connect-sqlite3(`server/prisma/sessions.sqlite`) → 재시작에도 로그인 유지. 빌드 불가 시 메모리 폴백.
- helmet 보안 헤더, 인증 rate limiting(15분 20회→429), 세션 고정 방지, 사용자 열거 방지.
- 정지 회원: 로그인 거부 + 기존 세션도 인증 요청에서 즉시 차단.
- 운영(HTTPS): `NODE_ENV=production`이면 세션 쿠키가 자동 `secure`. `SESSION_SECRET` 교체 권장.

## 6. 환경 변수 (`server/.env`)
```
DATABASE_URL="file:./dev.db"
SESSION_SECRET="<운영에서는 무작위 문자열>"
PORT=4000
CLIENT_ORIGIN="http://localhost:5173"
# NODE_ENV=production
SERVER_URL="http://localhost:4000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
KAKAO_CLIENT_ID=""
KAKAO_CLIENT_SECRET=""
```

## 7. 빌드(배포)
```bash
cd client && npm run build      # client/dist 생성
cd ../server && npm start       # NODE_ENV=production 권장
```
