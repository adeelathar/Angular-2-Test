$('.status_box').on("click", '#change_status', function (e) {
    $('#status_option').fadeToggle();
    return false;
});
$('#status_option').on("click", '.check_Status', function (e) {
    var SITE_ROOT = window.SITE_ROOT ? window.SITE_ROOT : '/';
    var dataVal = $(this).attr('data-value');
    if (dataVal) {
        $.post(SITE_ROOT + 'ajax/chat/change-status', {"dataVal": dataVal}, function (data1) {
            $(".status_box").html(data1);
        });
    }
});
$(".tab-menu img").click(function () {
    $(".ipad_menu, .my_profile_ipad").toggleClass("moveitup");
    $(".top_section, .inner_content_section, .footer_section").toggleClass("moveit");
});