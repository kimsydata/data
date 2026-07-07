# Frontend Beginner Practice Code

대상: 컴퓨터 비전공자 / Frontend Beginner  
주제: HTML, CSS, JavaScript 실습 코드

## 실행 방법

### 방법 1. HTML 파일 직접 열기
대부분의 `index.html` 파일은 더블클릭으로 실행할 수 있습니다.

### 방법 2. VS Code Live Server 사용 권장
`Day3/02_dom_async_modules` 예제는 JavaScript Module을 사용하므로 Live Server 실행을 권장합니다.

1. VS Code에서 이 폴더 열기
2. 확장 프로그램에서 `Live Server` 설치
3. 실행할 `index.html` 파일에서 마우스 오른쪽 클릭
4. `Open with Live Server` 선택

### 방법 3. Python 간단 서버 실행
터미널에서 다음 명령 실행:

```bash
cd frontend_beginner_practice
python -m http.server 5500
```

브라우저에서 아래 주소 접속:

```text
http://localhost:5500
```

## 폴더 구성

```text
Day1_HTML/
  01_web_workflow/
  02_my_intro_page/
  03_shortcut_links/
  04_signup_form/
  05_travel_hub/

Day2_CSS_JS_Basic/
  01_css_styling/
  02_js_basic_programming/

Day3_JS_DOM_Project/
  01_dom_event_practice/
  02_dom_async_modules/
  03_wrapup_quiz/
```

## 학습 순서

1. Day1: HTML 구조, 요소, 속성, 폼, 링크, 이미지, 시맨틱 태그
2. Day2: CSS 선택자, 박스 모델, Flex/Grid, 반응형, 애니메이션, JavaScript 기본 문법
3. Day3: DOM 조작, 이벤트 처리, 비동기 처리, 모듈 분리, 퀴즈 프로젝트
