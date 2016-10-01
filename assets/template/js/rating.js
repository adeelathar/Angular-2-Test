$(function(){
    $('.remodal').on("mouseenter", ".rate-btn", function () {
        $('.rate-btn').removeClass('rate-btn-hover');
        var therate = $(this).attr('id');
        for (var i = therate; i >= 0; i--) {
            $('.rate-btn-' + i).addClass('rate-btn-hover');
        }
        ;
    });
    $('.remodal').on("click", ".rate-btn", function () {
        var therate = $(this).attr('id');
        $("#rate_val").val(therate);
    });
    $('.remodal').on("mouseleave", ".rate-btn", function () {
        var therate = $("#rate_val").val();
        therate++;
        for (var i = therate; i <= 5; i++) {
            $('.rate-btn-' + i).removeClass('rate-btn-hover');
        }
        ;
    });
});