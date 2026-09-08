/*
 * [로컬 확인용] 검색조건 아코디언
 * ------------------------------------------------------------------
 * 퍼블리싱 단계에서 화면 확인을 위해 작성한 스크립트입니다.
 * 원본에는 없던 기능이므로 개발 이관 시 이 파일을 참고만 하시고,
 * 필요 없으면 HTML의 <script src="./js/preview/common.js"> 한 줄만 지우면 됩니다.
 *
 * 사용 페이지 : index.html / estateBidList.html / estateSaleList.html
 * 관련 마크업 : .search-box.type-fold + .search-toggle  (기본 형식에는 버튼이 없어 아무 동작도 하지 않음)
 * 관련 CSS    : css/layout.css - '검색조건 아코디언'
 */
$(function () {
    // 모바일에서만 보이는 토글 (위 3개 항목은 항상 노출, .is-fold 항목만 접힌다)
    $('.search-toggle').on('click', function () {
        var open = $(this).attr('aria-expanded') !== 'true';

        $(this).attr('aria-expanded', open)
               .find('span').text(open ? '검색조건 접기' : '검색조건 더보기');

        $(this).closest('.search-box').toggleClass('is-open', open);
    });

    // jQuery UI가 생성한 달력 열기 버튼에 접근 가능한 이름 부여
    $('#datepicker1').next('.ui-datepicker-trigger').attr('aria-label', '입찰기간 시작일 달력 열기');
    $('#datepicker2').next('.ui-datepicker-trigger').attr('aria-label', '입찰기간 종료일 달력 열기');
});
