$(document).ready(function () {

    $('#change_status').click(function (e) {
        $('#status_option').fadeToggle();
        return false;
    });
    $('#like_btn').click(function (e) {
        $(this).toggleClass('liked');
        return false;
    });
    $('.like_btn_photo').click(function (e) {
        $(this).toggleClass('liked');
        return false;
    });

    $("#book_from_date").datepicker({});
    $("#book_to_date").datepicker({});
    $('input[name="file"]').change(function () {
        var fileName = $(this).val();
        $(".attach_book").html(fileName);
    });

});
$("#add-booking-form").validate({
    rules: {
        book_from_date: "required",
        book_to_date: "required",
        book_title: "required",
        book_email: {required: true, email: true},
    },
    messages: {
        book_from_date: 'Can\'t be empty',
        book_to_date: 'Can\'t be empty',
        book_title: 'Can\'t be empty',
        book_email: {required: 'Can\'t be empty', email: 'Please enter valid email address'}
    }

});