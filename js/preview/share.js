/*
 * [로컬 확인용] 공유하기 팝업
 * ------------------------------------------------------------------
 * 퍼블리싱 단계에서 화면 확인을 위해 작성한 스크립트입니다.
 * 원본에는 없던 기능이므로 개발 이관 시 이 파일을 참고만 하시고,
 * 필요 없으면 HTML의 <script src="./js/preview/share.js"> 한 줄만 지우면 됩니다.
 *
 * 사용 페이지 : estateDtl.html
 * 관련 마크업 : .btn-square.share(여는 버튼) / #shareLayer(팝업)
 * 관련 CSS    : css/layout.css - 공유하기 팝업
 *
 * 팝업 내용(썸네일/물건번호/소재지)은 서버 호출 없이 본문에 그려진 값을 그대로 씁니다.
 */

/* 공유 팝업을 열기 직전 포커스를 돌려줄 요소 */
var shareOpener = null;

/**
 * 공유하기 :: 태블릿 이하에서만 노출되는 버튼. 공유 팝업을 연다.
 * 팝업 내용(썸네일/물건번호/소재지)은 본문에 그려진 값을 그대로 가져다 쓴다.
 */
function fnShare() {
    var $layer = $('#shareLayer');

    $('#shareThumb').attr('src', $('#mainImage').attr('src'));
    $('#shareNum').text($('.title-wrap .title-top p span').not('.flag').text().trim());
    $('#shareAddr').text($('.title-wrap .address').text().trim());

    shareOpener = document.activeElement;
    /* hidden 속성 미지원 브라우저를 대비해 class로도 함께 제어한다 */
    $layer.removeAttr('hidden').addClass('is-open');
    /* 닫기 버튼 대신 팝업 자체에 포커스를 줘 X에 포커스링이 그려지지 않게 한다 */
    $layer.find('.share-popup').focus();
}

function fnShareClose() {
    $('#shareLayer').attr('hidden', 'hidden').removeClass('is-open');

    if (shareOpener) {
        shareOpener.focus();
        shareOpener = null;
    }
}

/* ESC로 닫기 */
$(document).on('keydown', function (e) {
    if (e.key === 'Escape' && $('#shareLayer').hasClass('is-open')) {
        fnShareClose();
    }
});

/**
 * 카카오톡 공유.
 * [D] : Kakao JavaScript SDK와 앱 키가 준비되면 아래 주석 블록을 사용하세요.
 *       (SDK 미탑재 상태에서는 URL 복사로 대체 동작합니다.)
 */
function fnShareKakao() {
    if (typeof Kakao === 'undefined' || !Kakao.isInitialized || !Kakao.isInitialized()) {
        fnShareUrl();
        return;
    }

    Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
            title: $('#shareNum').text(),
            description: $('#shareAddr').text(),
            imageUrl: $('#shareThumb').prop('src'),
            link: { mobileWebUrl: location.href, webUrl: location.href }
        }
    });
}

/** URL 복사 :: clipboard 미지원 브라우저는 prompt로 대체한다. */
function fnShareUrl() {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(location.href).then(function () {
            alert('주소가 복사되었습니다.');
        });
        return;
    }

    prompt('아래 주소를 복사해 주세요.', location.href);
}
