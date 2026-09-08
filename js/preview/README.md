# js/preview — 퍼블리싱 확인용 스크립트

퍼블리싱 단계에서 **로컬에서 화면 동작을 확인하기 위해** 작성한 스크립트입니다.
원본(`원본/` 폴더)에 없던 신규 기능만 모아 두었으므로, **개발에서는 참고 자료로만 보시고
실제 구현은 프로젝트 규칙에 맞게 새로 작성하시면 됩니다.**

각 HTML 하단의 `<script src="./js/preview/*.js">` 줄만 지우면 통째로 빠집니다.
(그 위의 인라인 `<script>`는 원본에도 있던 로직이라 그대로 두었습니다.)

## 파일

| 파일 | 기능 | 사용 페이지 |
|---|---|---|
| `common.js` | 검색조건 아코디언 토글, 달력 버튼 접근성 라벨 | index / estateBidList / estateSaleList |
| `compare.js` | 비교하기 하단 시트(3단계), 비교표·비교카드 렌더링, 페이지네이션 현재 위치 표시 | estateBidList / estateSaleList |
| `share.js` | 공유하기 팝업(카카오톡 / URL 복사) | estateDtl |

## HTML에 인라인으로 남겨 둔 것 (원본에 있던 로직)

| 페이지 | 남아 있는 스크립트 |
|---|---|
| index.html | datepicker 초기화, `fnSearch()` |
| estateBidList / estateSaleList | datepicker 초기화, 조회 조건 변경 시 재조회, 소재지 권역 ajax, `fnEstateList()`, `fnEstateDtl()` |
| estateDtl.html | 헤더 메뉴 active, 썸네일 클릭 시 메인 이미지 교체, `initGallery()`(fancybox), `initPrint()`, `goEstateList()` |

## 데이터에 대해

`compare.js`와 `share.js`는 **서버를 호출하지 않고 화면에 이미 그려진 값을 읽어서** 동작합니다.
(`fnCompareItems()`, `fnShare()` 참고) 실제 연동 시에는 `estateId`로 상세 데이터를 받아오도록
교체하시면 됩니다.
