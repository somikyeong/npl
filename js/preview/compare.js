/*
 * [로컬 확인용] 비교하기 시트 + 페이지네이션 현재 위치 표시
 * ------------------------------------------------------------------
 * 퍼블리싱 단계에서 화면 확인을 위해 작성한 스크립트입니다.
 * 원본에는 없던 기능이므로 개발 이관 시 이 파일을 참고만 하시고,
 * 필요 없으면 HTML의 <script src="./js/preview/compare.js"> 한 줄만 지우면 됩니다.
 *
 * 사용 페이지 : estateBidList.html / estateSaleList.html
 * 관련 마크업 : #compareSheet(하단 시트), .compare-btn(목록의 담기 버튼)
 * 관련 CSS    : css/layout.css - bottom sheet / css/content.css - 비교하기 시트
 *
 * 담은 물건 정보는 서버 호출 없이 목록 행에 그려진 값을 그대로 읽어옵니다.
 * (fnCompareItems 참고 - 실제 연동 시 estateId로 상세를 받아오도록 교체하면 됩니다.)
 */

$(function () {
    // 페이지네이션 현재 위치 표시
    $('.pagination .num li').on('click', function () {
        $('.pagination .num li').removeClass('active').find('button').removeAttr('aria-current');
        $(this).addClass('active').find('button').attr('aria-current', 'page');
    });

    // 비교 시트 :: 상단 탭으로 접고 펴기 / ESC로 접기
    $('#compareToggle').on('click', function () {
        fnNextCompareStep();
    });

    $(document).on('keydown', function (e) {
        if ($('#compareSheet').prop('hidden')) return;
        if (e.key === 'Escape' || e.keyCode === 27) fnSetCompareStep('collapsed');
    });

    // 폭이 바뀌어 한도가 줄면 넘치는 물건은 자동으로 뺀다
    var compareMaxNow = fnCompareMax();

    $(window).on('resize', function () {
        var max = fnCompareMax();

        if (max === compareMaxNow) return;
        compareMaxNow = max;

        $('.compare-btn[aria-pressed="true"]').slice(max)
            .attr('aria-pressed', 'false')
            .find('.sr-only').text('비교 목록에 담기');

        if (!$('#compareSheet').prop('hidden')) fnShowCompare(false);
    });
});

/*
 * 비교하기 :: 한 번에 담을 수 있는 최대 건수.
 * 카드가 한 화면에 들어가야 하므로 모바일에서는 2건으로 줄인다.
 * (기준 폭은 CSS 모바일 breakpoint와 동일)
 */
var COMPARE_MAX_PC = 3;
var COMPARE_MAX_MOBILE = 2;
var COMPARE_MOBILE_MQ = '(max-width: 47.9375rem)';

function fnCompareMax() {
    return (window.matchMedia && window.matchMedia(COMPARE_MOBILE_MQ).matches)
        ? COMPARE_MAX_MOBILE : COMPARE_MAX_PC;
}

/**
 * 비교하기 :: 물건을 담거나 뺀다. 담으면 비교 시트를 올린다.
 */
function fnToggleCompare(btn) {
    var $btn = $(btn);
    var on = $btn.attr('aria-pressed') !== 'true';

    // 한도를 넘으면 담지 않고, 이유를 알 수 있도록 시트만 올린다.
    if (on && $('.compare-btn[aria-pressed="true"]').length >= fnCompareMax()) {
        fnShowCompare(true);
        return;
    }

    $btn.attr('aria-pressed', on)
        .find('.sr-only').text(on ? '비교 목록에서 빼기' : '비교 목록에 담기');

    fnShowCompare(false);
}

/**
 * 비교 목록 초기화 :: 담은 물건을 모두 뺀다. (남는 물건이 없으면 시트도 내려간다)
 */
function fnResetCompare() {
    $('.compare-btn[aria-pressed="true"]')
        .attr('aria-pressed', 'false')
        .find('.sr-only').text('비교 목록에 담기');

    fnShowCompare(false);
}

/**
 * 비교 목록에서 빼기 :: 시트 안의 빼기 버튼에서 호출한다.
 */
function fnRemoveCompare(estateId) {
    $('.compare-btn').filter(function () {
        return $(this).val() === estateId;
    }).attr('aria-pressed', 'false').find('.sr-only').text('비교 목록에 담기');

    fnShowCompare(false);
}

/**
 * 담은 물건 정보 :: 목록 행에 이미 그려진 내용을 그대로 읽어온다.
 * [D] 서버 연동 시 estateId로 상세 데이터를 받아오도록 교체 가능
 */
function fnCompareItems() {
    return $('.compare-btn[aria-pressed="true"]').map(function () {
        var $btn = $(this);
        var $cont = $btn.closest('.cont');
        var $flag = $cont.find('.flag');
        var rows = [];

        $cont.find('.info .col-cont p').each(function () {
            var $row = $(this).clone();
            var label = $.trim($row.find('.sr-only').text());

            $row.find('.sr-only').remove();
            rows.push({ label: label, value: $.trim($row.text()) });
        });

        return {
            id: $btn.val(),
            flag: $.trim($flag.text()),
            flagClass: $flag.attr('class'),
            title: $.trim($cont.find('.title-info a').text()),
            img: $cont.find('.img-box img').attr('src'),
            rows: rows
        };
    }).get();
}

/**
 * 비교 카드 그리기 :: 담은 물건을 카드로 나란히 세운다.
 */
function fnRenderCompare() {
    var items = fnCompareItems();
    var max = fnCompareMax();
    var $list = $('#compareList').empty();

    // 한도 안내는 다시 그릴 때마다 지운다. (fnShowCompare가 필요할 때만 켠다)
    $('#compareNotice').text('최대 ' + max + '건까지 비교할 수 있습니다.').prop('hidden', true);

    $.each(items, function (i, item) {
        var $card = $('<li>', { 'class': 'compare-card' });
        var $thumb = $('<div>', { 'class': 'compare-card-thumb' }).appendTo($card);
        var $body = $('<div>', { 'class': 'compare-card-body' }).appendTo($card);
        var $flags = $('<div>', { 'class': 'compare-card-flags' }).appendTo($body);
        var $info = $('<dl>', { 'class': 'compare-card-info' });

        $('<img>', { src: item.img, alt: '' })
            .on('error', function () {
                this.onerror = null;
                this.src = './images/common/noImage.svg';
            })
            .appendTo($thumb);
        $('<button>', { type: 'button', 'class': 'compare-remove' })
            .append($('<span>', { 'class': 'sr-only', text: item.title + ' 비교 목록에서 빼기' }))
            .on('click', function () { fnRemoveCompare(item.id); })
            .appendTo($thumb);

        // 요약형(.is-mid)에서만 보이는 항목명
        $('<span>', { 'class': 'group-label', text: '경공매번호' }).appendTo($flags);
        $('<span>', { 'class': item.flagClass, text: item.flag }).appendTo($flags);

        // 진행상태는 목록 항목 중 하나이므로 칩으로 따로 올려준다.
        $.each(item.rows, function (r, row) {
            if (row.label !== '진행상태') return;
            $('<span>', { 'class': 'compare-card-state', text: row.value }).appendTo($flags);
        });

        $('<span>', { 'class': 'compare-card-title', text: item.title }).appendTo($body);

        $.each(item.rows, function (r, row) {
            if (row.label === '진행상태') return;

            // 소재지는 요약형에서 단독으로 노출하므로 따로 표시해 둔다.
            var cls = (row.label === '소재지') ? 'row-addr' : '';

            $info.append($('<dt>', { 'class': cls, text: row.label }))
                 .append($('<dd>', { 'class': cls, text: row.value }));
        });
        $info.appendTo($body);

        $list.append($card);
    });

    // 담긴 물건이 적어도 한도만큼의 칸 영역은 그대로 유지한다. (빈 칸 전체가 버튼)
    for (var slot = items.length; slot < max; slot++) {
        $('<li>', { 'class': 'compare-card is-empty' })
            .append(fnCompareEmptyBtn(max))
            .appendTo($list);
    }

    fnRenderCompareTable(items, max);

    $('#compareStatus').text('비교 목록 ' + items.length + '건 / 최대 ' + max + '건');
}

/**
 * 빈 칸 버튼 :: 칸 전체가 버튼이며, 누르면 시트를 내려 목록에서 더 담을 수 있게 한다.
 * [D] 다른 동작이 필요하면 click 핸들러만 교체하세요.
 */
function fnCompareEmptyBtn(max) {
    return $('<button>', {
        type: 'button',
        'class': 'compare-card-placeholder',
        text: '최대 ' + max + '개까지 선택 가능합니다.'
    }).on('click', function () {
        fnSetCompareStep('collapsed');
    });
}

/**
 * 비교표 그리기 :: 맨 위 단계(.is-full)에서 쓰는 표.
 * 왼쪽 첫 열이 항목명(th)이고, 담은 물건이 한 열씩 오른쪽으로 붙는다.
 */
function fnRenderCompareTable(items, max) {
    // [D] 표에 노출할 행. label은 목록 행의 항목명과 맞춰 주세요.
    var ROWS = [
        { th: '물건사진',   cls: 'row-img',    type: 'img' },
        { th: '경공매빈도', cls: 'row-flag',   type: 'flag' },
        { th: '용도',       cls: 'row-use',    label: '사업용도' },
        { th: '물건상세',   cls: 'row-detail', label: '물건상세' },
        { th: '소재지',     cls: 'row-addr',   label: '소재지' }
    ];
    var empty = max - items.length;
    var $body = $('#compareTable tbody').empty();

    $.each(ROWS, function (i, row) {
        var $tr = $('<tr>', { 'class': row.cls });

        $('<th>', { scope: 'row', text: row.th }).appendTo($tr);

        $.each(items, function (n, item) {
            $tr.append(fnCompareCell(row, item));
        });

        // 빈 칸은 첫 행에서 rowspan으로 열 전체를 버튼 하나로 만든다.
        if (i === 0) {
            for (var slot = 0; slot < empty; slot++) {
                $('<td>', { 'class': 'is-empty', rowspan: ROWS.length })
                    .append(fnCompareEmptyBtn(max))
                    .appendTo($tr);
            }
        }

        $body.append($tr);
    });
}

/** 비교표 셀 하나 (.td-label : 태블릿 이하에서만 보이는 항목명. PC는 왼쪽 th가 대신한다) */
function fnCompareCell(row, item) {
    var $td = $('<td>');

    if (row.type !== 'img') {
        $('<span>', { 'class': 'td-label', text: row.th }).appendTo($td);
    }

    if (row.type === 'img') {
        var $thumb = $('<div>', { 'class': 'compare-table-thumb' }).appendTo($td);

        $('<img>', { src: item.img, alt: '' })
            .on('error', function () {
                this.onerror = null;
                this.src = './images/common/noImage.svg';
            })
            .appendTo($thumb);
        $('<button>', { type: 'button', 'class': 'compare-remove' })
            .append($('<span>', { 'class': 'sr-only', text: item.title + ' 비교 목록에서 빼기' }))
            .on('click', function () { fnRemoveCompare(item.id); })
            .appendTo($thumb);

        return $td;
    }

    if (row.type === 'flag') {
        $('<span>', { 'class': item.flagClass, text: item.flag }).appendTo($td);
        $.each(item.rows, function (r, data) {
            if (data.label !== '진행상태') return;
            $('<span>', { 'class': 'compare-card-state', text: data.value }).appendTo($td);
        });

        return $td;
    }

    $.each(item.rows, function (r, data) {
        // 라벨 span이 이미 있으므로 text()로 덮지 않고 뒤에 붙인다
        if (data.label === row.label) {
            $('<span>', { 'class': 'td-value', text: data.value }).appendTo($td);
        }
    });

    return $td;
}

/**
 * 비교 시트 올리기 :: 담은 물건이 없으면 시트를 감춘다.
 */
function fnShowCompare(overLimit) {
    var $sheet = $('#compareSheet');

    fnRenderCompare();

    if (!$('.compare-btn[aria-pressed="true"]').length && !overLimit) {
        $sheet.prop('hidden', true);
        return;
    }

    $('#compareNotice').prop('hidden', !overLimit);
    $sheet.prop('hidden', false);
    fnSetCompareStep('mid');
}

/*
 * 비교 시트 단계 :: 맨 위 > 중간 > 토글만.
 * 탭을 누를 때마다 한 단계씩 내려가고, 맨 아래에서 누르면 맨 위로 돌아온다.
 * (중간 단계는 클래스 없이 CSS 기본값을 쓴다)
 */
var COMPARE_STEPS = ['full', 'mid', 'collapsed'];

function fnCompareStep() {
    var $sheet = $('#compareSheet');

    if ($sheet.hasClass('is-full')) return 'full';
    if ($sheet.hasClass('is-collapsed')) return 'collapsed';
    return 'mid';
}

function fnSetCompareStep(step) {
    $('#compareSheet')
        .toggleClass('is-full', step === 'full')
        .toggleClass('is-mid', step === 'mid')
        .toggleClass('is-collapsed', step === 'collapsed');

    // 카드가 조금이라도 보이면 펼쳐진 것으로 알린다
    $('#compareToggle').attr('aria-expanded', step !== 'collapsed');
}

function fnNextCompareStep() {
    var i = $.inArray(fnCompareStep(), COMPARE_STEPS);

    fnSetCompareStep(COMPARE_STEPS[(i + 1) % COMPARE_STEPS.length]);
}
