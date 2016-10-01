function deletePost(a) {
    $.confirm({
        'title': 'Delete Confirmation',
        'message': 'You are about to delete this post ?',
        'buttons': {
            'Yes': {
                'class': 'blue',
                'action': function () {
                    var catId = $(a).parent('ul').parent('a').data("category");
                    var dataId = $(a).parent('ul').parent('a').data("id");
                    $.ajax({
                        url: (window.SITE_ROOT || '/') + 'ajax/delete-feed-post',
                        data: {dataID: dataId, dataCat: catId},
                        type: "POST",
                        success: function (result) {
                            if (result == 'success') {
                                $(a).parent().parent().parent('div').parent('div').remove();
                            }
                        }
                    });
                }
            },
            'No': {
                'class': 'gray',
                'action': function () {
                }   // Nothing to do in this case. You can as well omit the action property.
            }
        }
    });
}