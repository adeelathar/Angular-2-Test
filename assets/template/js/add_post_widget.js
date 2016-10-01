$(document).ready(function (e) {
    $('#working').elastic();

    var postbox = $("#working");
    slidesection = $(".upload_section");
    optionBox = $("#option_box");
    inputField = $("#add_post_img");

    $('#option_btn').on("click", function (e) {
        optionBox.slideToggle();
        return false;
    });
    postbox.on({
        click: function (e) {
            slidesection.slideDown();
            return false;
        }
    });
    $(document.body).mouseup(function (e) {
        var subject = $(".working_comments");
        var letter = postbox.val().trim();
        if (letter.length == 0 && inputField.val() == "") {
            if (e.target.id != subject.attr('id') && !subject.has(e.target).length) {
                slidesection.slideUp();
                postbox.val("");
                optionBox.hide();
            }
        }
    });
    $(window).on({
        scroll: function () {
            var letter = postbox.val().trim();
            if (letter.length == 0 && inputField.val() == "") {
                slidesection.slideUp();
                postbox.val("");
                optionBox.slideUp();
            }
        }
    });
    $("#close-post").click(function () {
        slidesection.slideUp(function () {
            postbox.css({
                height: 32 + "px"
            });
            inputField.replaceWith(inputField.val("").clone(true));
            $("#add_photo_str").text('Add a photo');
            postbox.val("");

        });
    })
    $('#add_post_img').on('change', function () {
        var fileCount = this.files.length;
        $("#add_photo_str").text(fileCount + ' file selected');
    });
});