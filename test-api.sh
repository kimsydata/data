#!/bin/sh
# 그린테크 API 자동 점검 스크립트 (POSIX sh 호환, curl 필요)
# 사용법: 서버를 `npm run dev`로 켠 뒤, 시드 직후 데이터 기준으로 실행
#   sh test-api.sh
#   BASE=http://localhost:4000 sh test-api.sh

BASE="${BASE:-http://localhost:4000}"
UJ="$(mktemp)"; AJ="$(mktemp)"
pass=0; fail=0
chk(){ if [ "$2" = "$3" ]; then echo "PASS  $1"; pass=$((pass+1)); else echo "FAIL  $1 (got [$2] want [$3])"; fail=$((fail+1)); fi; }
has(){ if echo "$2" | grep -q "$3"; then chk "$1" 1 1; else chk "$1" 0 1; fi; }
code(){ curl -s -o /dev/null -w '%{http_code}' "$@"; }

if ! curl -sf "$BASE/api/health" >/dev/null 2>&1; then
  echo "서버에 연결할 수 없습니다: $BASE (먼저 'npm run dev'로 서버를 켜세요)"; exit 1
fi

echo "===== 공개 읽기 ====="
chk "health"            "$(code $BASE/api/health)" 200
chk "제품 목록"          "$(code $BASE/api/products)" 200
chk "제품 상세"          "$(code $BASE/api/products/1)" 200
chk "글 목록"            "$(code $BASE/api/posts)" 200
has "commentCount 포함"  "$(curl -s $BASE/api/posts)" "commentCount"
chk "댓글 목록"          "$(code $BASE/api/posts/4/comments)" 200
chk "알수없는 API 404"   "$(code $BASE/api/zzz)" 404

echo "===== 보안 헤더 ====="
HDR=$(curl -s -D - -o /dev/null $BASE/api/health)
chk "nosniff"            "$(echo "$HDR" | grep -ci 'x-content-type-options: nosniff')" 1
chk "X-Powered-By 제거"  "$(echo "$HDR" | grep -ci 'x-powered-by')" 0

echo "===== 인증/권한 ====="
chk "비로그인 글작성 401" "$(code -X POST $BASE/api/posts -H 'Content-Type: application/json' -d '{"title":"a","content":"b"}')" 401
chk "회원 로그인"         "$(curl -s -c $UJ -o /dev/null -w '%{http_code}' -X POST $BASE/api/auth/login -H 'Content-Type: application/json' -d '{"username":"user1","password":"user1234"}')" 200
chk "me role=user"       "$(curl -s -b $UJ $BASE/api/auth/me | grep -o '"role":"[a-z]*"')" '"role":"user"'
chk "정지회원 로그인 403" "$(code -X POST $BASE/api/auth/login -H 'Content-Type: application/json' -d '{"username":"user2","password":"user1234"}')" 403
chk "관리자 로그인"       "$(curl -s -c $AJ -o /dev/null -w '%{http_code}' -X POST $BASE/api/auth/admin/login -H 'Content-Type: application/json' -d '{"username":"admin","password":"admin1234"}')" 200

echo "===== 회원 글/댓글 ====="
PID=$(curl -s -b $UJ -X POST $BASE/api/posts -H 'Content-Type: application/json' -d '{"title":"글","content":"본문"}' | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
chk "글 작성"            "$([ -n "$PID" ] && echo ok)" ok
chk "본인 글 수정"        "$(curl -s -b $UJ -o /dev/null -w '%{http_code}' -X PUT $BASE/api/posts/$PID -H 'Content-Type: application/json' -d '{"title":"수정","content":"c"}')" 200
chk "타인 글 수정 403"    "$(curl -s -b $UJ -o /dev/null -w '%{http_code}' -X PUT $BASE/api/posts/1 -H 'Content-Type: application/json' -d '{"title":"x","content":"y"}')" 403
CID=$(curl -s -b $UJ -X POST $BASE/api/posts/4/comments -H 'Content-Type: application/json' -d '{"content":"댓글"}' | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
chk "댓글 작성"          "$([ -n "$CID" ] && echo ok)" ok
chk "댓글 수정"          "$(curl -s -b $UJ -o /dev/null -w '%{http_code}' -X PUT $BASE/api/comments/$CID -H 'Content-Type: application/json' -d '{"content":"수정"}')" 200
chk "댓글 삭제"          "$(curl -s -b $UJ -o /dev/null -w '%{http_code}' -X DELETE $BASE/api/comments/$CID)" 204

echo "===== 관리자 ====="
chk "회원 제품생성 403"   "$(curl -s -b $UJ -o /dev/null -w '%{http_code}' -X POST $BASE/api/products -H 'Content-Type: application/json' -d '{"name":"x","price":1}')" 403
chk "관리자 제품생성 201" "$(curl -s -b $AJ -o /dev/null -w '%{http_code}' -X POST $BASE/api/products -H 'Content-Type: application/json' -d '{"name":"신상","price":1000}')" 201
chk "회원 목록 200"       "$(curl -s -b $AJ -o /dev/null -w '%{http_code}' $BASE/api/admin/users)" 200
chk "회원 정지 200"       "$(curl -s -b $AJ -o /dev/null -w '%{http_code}' -X PATCH $BASE/api/admin/users/1 -H 'Content-Type: application/json' -d '{"active":false}')" 200
chk "정지 후 작성 차단 403" "$(curl -s -b $UJ -o /dev/null -w '%{http_code}' -X POST $BASE/api/posts -H 'Content-Type: application/json' -d '{"title":"t","content":"c"}')" 403
chk "회원 해제 200"       "$(curl -s -b $AJ -o /dev/null -w '%{http_code}' -X PATCH $BASE/api/admin/users/1 -H 'Content-Type: application/json' -d '{"active":true}')" 200

echo "===== 소셜 로그인 OAuth ====="
chk "oauth status 200"   "$(code $BASE/api/auth/oauth/status)" 200
chk "알수없는 제공자 404" "$(code $BASE/api/auth/oauth/naver)" 404

rm -f "$UJ" "$AJ"
echo
echo "RESULT: $pass passed, $fail failed"
[ "$fail" -eq 0 ]
