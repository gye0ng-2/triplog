# 초록여행 🌿

초록색과 크림색 종이, 엽서와 스티커로 꾸민 AI 여행 계획 · 여행 기록 웹서비스의 첫 번째 프로토타입입니다.

## 실행

Node.js 20.19+ 또는 22.12+가 필요합니다.

```bash
npm install
npm run dev
```

터미널에 표시된 주소(기본 `http://localhost:5173`)를 브라우저에서 엽니다. Windows PowerShell에서 스크립트 실행 정책 오류가 발생하면 `npm` 대신 `npm.cmd`를 사용하세요.

```bash
npm run build
npm run preview
```

`build`는 TypeScript 검사 후 `dist/`에 배포용 정적 파일을 생성합니다.

## 구현 화면과 동작

- **랜딩**: 서비스 소개, 추천 여행 테마, 계획 시작과 예시 일정 진입.
- **여행 계획**: 목적지·출발일·기간·동행자·취향·자연어 요청 입력, 목업 추천 로딩.
- **일정 결과**: 날짜별 장소 카드, 시간 변경, 순서 올리기, 삭제, 장소 추가.
- **지도 관리**: 일러스트 지도와 장소 선택 연동, 장소 이름 변경, 일정 저장. 저장한 일정은 같은 브라우저의 `localStorage`에서 다시 불러옵니다.
- **여행 기록**: 여러 사진 업로드, 사진과 스티커 드래그, 방향키 이동, 회전·삭제, 문구·배경색 변경, PNG 다운로드.

데스크톱·태블릿·모바일 레이아웃과 모바일 메뉴를 지원합니다. 사진·콜라주 편집 상태는 새로고침하면 초기화되므로 완성 후 이미지로 저장하세요.

## 기술 및 구조

React 19 + TypeScript + Vite 6 + Tailwind CSS 4를 사용합니다. Tailwind는 Vite 플러그인과 CSS import로 설정되며, 브랜드 고유의 디자인은 `src/styles.css`에서 정의합니다. 아이콘은 Lucide, PNG 내보내기는 html-to-image를 사용합니다.

```text
src/
  main.tsx                앱 진입점
  App.tsx                 화면과 프로토타입 인터랙션
  styles.css              디자인 토큰·반응형 스타일
  types.ts                요청·여행·장소 도메인 타입
  services/tripService.ts  목업 데이터와 비동기 추천 서비스
```

UI는 `tripService.recommend(request)`를 호출합니다. Spring Boot 연동 시 서비스 구현을 REST 호출로 교체하고 DTO를 `types.ts` 타입에 매핑할 수 있습니다. 권장 요청 형태:

```http
POST /api/trips/recommend
Content-Type: application/json

{
  "destination": "제주",
  "startDate": "2026-10-24",
  "days": 3,
  "travelers": "친구와 둘이",
  "preferences": "조용한 바다와 숲이 좋아요",
  "tags": ["자연과 힐링", "감성 카페"]
}
```

응답은 `Trip` 타입(`title`, `destination`, `request`, `days: Place[][]`)을 기준으로 합니다. 추후 `VITE_API_BASE_URL` 환경 변수로 서버 주소를 분리하고 `GET/POST/PUT /api/trips` 및 사진 업로드 API를 추가할 수 있습니다. Vite 환경 변수에는 공개 가능한 서버 주소만 넣고 AI API 비밀키는 Spring Boot 서버에서 관리하세요.

## 목업의 범위

실제 AI API·지도 API·DB·회원 인증은 연결하지 않았습니다. 추천은 입력한 목적지·기간을 반영하는 예시 데이터이며 여행 스타일·자연어 내용을 분석하지 않습니다. 제주 이외 목적지는 데모 이름을 생성하며, 날짜별 일정은 같은 예시 장소를 반복합니다. 지도는 실제 좌표·이동 거리와 무관한 일러스트입니다. 사진은 Unsplash 외부 이미지, 폰트는 Google Fonts를 사용하므로 인터넷 연결이 필요합니다. 업로드 사진은 서버로 전송하지 않습니다.

프로토타입 탐색에는 회원가입이 필요하지 않습니다. 화면 전환은 React 상태 기반으로 구현되어 있고 URL 라우팅은 후속 단계에서 추가할 수 있습니다.
