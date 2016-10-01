if (!window.SITE_ROOT) window.SITE_ROOT = "/";

window.fameuz = {
    SITE_ROOT: window.SITE_ROOT,
    maxUploadSize: window.maxUploadSize || 10485760,
    scrollThreshold: Math.floor($(window).height() / 3),
    endpoints: {
        like: SITE_ROOT + "ajax/like.json",
        share: SITE_ROOT + "ajax/share.json",
        rate: SITE_ROOT + "ajax/rate.json",
        log: SITE_ROOT + "ajax/log.json",
        subscribe_jobs: SITE_ROOT + "ajax/subscribe_jobs.json",
        image_popup: SITE_ROOT + "ajax/image-popup.json",
        upload_signature: SITE_ROOT + "ajax/upload-signature.json",
        usersLikedHTML: SITE_ROOT + "ajax/users-liked"
    },
    like: function(id, type, callback) {
        return $.post(fameuz.endpoints.like, {
            likeId: id,
            likeCat: type
        }, callback);
    },
    share: function (id, type, callback) {
        return $.post(fameuz.endpoints.share, {
            shareId: id,
            shareCat: type
        }, callback);
    },
    rate: function (id, type, rating, callback) {
        return $.post(fameuz.endpoints.rate, {
            id: id,
            type: type,
            rating: rating
        }, callback);
    },
    /**
     * Shows a toastr error to user and/or sends a message to the log endpoint.
     * @param string clientMessage
     * @param string serverMessage
     */
    error: function(clientMessage, serverMessage) {
        if (clientMessage) toastr.error(clientMessage);
        if (serverMessage) $.post(fameuz.endpoints.log, serverMessage);
    },
    /**
     * @param File file
     * @returns {boolean}
     */
    validateImage: function(file)
    {
        if (typeof file !== "object") return false;

        if (typeof file.type === "string" && file.type.indexOf('image/') !== 0) {
            toastr.error('Please, select a correct image.');
            return false;
        }

        if (typeof file.size === "number" && file.size > fameuz.maxUploadSize) {
            toastr.error("The file is too big.");
            return false;
        }

        return true;
    },
    /**
     * Replaces normal upload with client-side upload to Cloudinary.
     * Accepts a form node with a file input named "file".
     * @param form
     */
    cloudinarify: function(form, folder, callback) {
        if (!form.elements["file"]) {
            console.log("No file input.");
            return;
        }

        if (!form.elements["_file"]) {
            form.appendChild($('<input type="hidden" name="_file">')[0]);
        }

        if (form.getAttribute("enctype") !== "multipart/form-data") {
            form.setAttribute("enctype", "multipart/form-data");
        }

        var $form = $(form);

        $form.on("submit", function (e) {
            if (!this.elements["file"] || !this.elements["file"].value) {
                return;
            }

            e.preventDefault();

            toastr.info("Uploading...", null, {timeOut: 9999999});

            var config = null;

            if (!folder) folder = 'uploads/albums';

            $.ajax({
                url: fameuz.endpoints.upload_signature + "?folder=" + encodeURIComponent(folder),
                async: false,
                success: function (data) {
                    config = data;
                }
            });

            if (!config || !config.url) {
                fameuz.error(
                    'Network error. Please, try again later.',
                    'Failed to fetch upload signature: ' + JSON.stringify(config)
                );
                return false;
            }

            var formData = new FormData(form);
            formData.append('api_key', config.api_key);
            formData.append('signature', config.signature);
            $.each(config.params, function (k, v) {
                formData.append(k, v);
            });

            $.ajax({
                url: config.url,
                type: 'POST',
                data: formData,
                success: function (data) {
                    if (data.format) {
                        data.public_id += "." + data.format;
                    }
                    form.elements["_file"].value = data.public_id;

                    $.ajax({
                        url: form.getAttribute("action"),
                        type: 'POST',
                        data: $form.serialize(),
                        success: callback ? callback : function(){
                            toastr.clear();
                            location.href = SITE_ROOT;
                        },
                        error: function(xhr){
                            toastr.clear();
                            if (xhr.status === 418) {
                                location.href = xhr.responseText;
                            } else {
                                toastr.error(xhr.responseText);
                            }
                        }
                    });
                },
                error: function (xhr) {
                    toastr.clear();
                    fameuz.error(
                        'Sorry, something went wrong. Please, try again later.',
                        config.url + ": " + xhr.responseText
                    );
                },
                contentType: false,
                processData: false
            });
        });
    },
    timestamp: function(ts){
        var now = new Date(),
            dateObj = new Date(ts * 1000),
            day = "" + dateObj.getFullYear() + dateObj.getMonth() + dateObj.getDay(),
            seenText = "Last seen ",
            today = "" + now.getFullYear() + now.getMonth() + now.getDay();

        now.setDate(now.getDate() - 1);

        var yesterday = "" + now.getFullYear() + now.getMonth() + now.getDay();

        if (day === today) {
            return "Today at " + ("0" + dateObj.getHours()).slice(-2) + ":" + ("0" + dateObj.getMinutes()).slice(-2);
        } else if (day === yesterday) {
            return "Yesterday at " + ("0" + dateObj.getHours()).slice(-2) + ":" + ("0" + dateObj.getMinutes()).slice(-2);
        } else {
            return dateObj.toDateString() + " " + dateObj.toTimeString().split(" ")[0].split(":").slice(0, 2).join(":");
        }
    },
    submit: function ($form, success, error) {
        return $.ajax({
            method: $form.attr("method") || "POST",
            url: $form.attr("action") || location.href,
            data: $form.serialize(),
            success: success,
            error: error
        });
    },
    empty: function(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
        return node;
    },
    lightbox: function(callback){
        if (callback && $.fn["fameuzLightbox"]) {
            callback();
            return;
        }

        $('<link rel="stylesheet" type="text/css">')
            .on("load", function(){
                $.ajax({
                    url: fameuz.SITE_ROOT + "js/fameuz_lightbox/famuez_lightbox." + (window.ASSET_VER || '1111111111') + ".js",
                    dataType: "script",
                    cache: false,
                    success: function () {
                        fameuz.initLightbox();
                        if (callback) callback();
                    }
                });
            })
            .attr("href", fameuz.SITE_ROOT + 'js/fameuz_lightbox/fameuz_lightbox.' + (window.ASSET_VER || '1111111111') + '.css')
            .appendTo(document.head);
    },
    initLightbox: function(){
        var SITE_ROOT = fameuz.SITE_ROOT;
        
        var fl = {
            class: 'lightBoxs',
            sidebar: 'default',
            guest: !!window.GUEST,
            likeUrl: fameuz.endpoints.like,
            shareUrl: fameuz.endpoints.share,
            rateUrl: fameuz.endpoints.rate,
            photos: {
                imageLoadUrl: fameuz.endpoints.image_popup,
                commentBoxUrl: SITE_ROOT + 'ajax/image-comment-box',
                comments: {
                    commentActionUrl: SITE_ROOT + 'access/post_comment.php',
                    commentDelete: SITE_ROOT + 'access/delete_comment.php'
                }
            },
            videos: {
                videoLoadUrl: SITE_ROOT + 'ajax/popUpVideoUser.php',
                likeUrl: fameuz.endpoints.like,
                commentBoxUrl: SITE_ROOT + 'ajax/video-comment-box',
                comments: {
                    commentActionUrl: SITE_ROOT + 'access/post_video_comment.php?action=add_comment',
                }
            },
            skin: {
                next: '<img src="' + SITE_ROOT + 'js/fameuz_lightbox/images/next.png">',
                prev: '<img src="' + SITE_ROOT + 'js/fameuz_lightbox/images/prev.png">',
                reset: '<i class="fa fa-refresh"></i>',
                close: '<img src="' + SITE_ROOT + 'js/fameuz_lightbox/images/close.png" width="15">',
                loader: SITE_ROOT + 'images/ajax-loader.gif',
                review: '<i class="fa fa-chevron-right"></i>',
                video: SITE_ROOT + 'js/jw_player/six/six.xml'
            }
        };
        if (location.href.indexOf("/user/photos") > -1) {
            fl.sidebar = 'album';
            fl.photos.commentBoxUrl = SITE_ROOT + 'ajax/popUpImageMe.php';
            fl.videos.commentBoxUrl = SITE_ROOT + 'ajax/popUpVideoMe.php';
            fl.photos.comments = {};
        } else if (location.href.indexOf("/photos") > -1) {
            fl.sidebar = 'photo';
        }

        $(document.body).fameuzLightbox(fl);
    }
};

/*
 window.onpopstate = function (event) {
 var siteurl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + "/",
 request_uri = document.location.slice(siteurl.length),
 segments = uri.split("?"),
 path = segments[0],
 query = segments[1] || "";

 console.log(siteurl, request_uri, segments, path, query);

 goto(query);
 };

*/

(function () {

    var SITE_ROOT = window.SITE_ROOT ? window.SITE_ROOT : '/';
    var body = $(document.body);

    var usermenu = $("#usermenu");
    if (usermenu.length) {
        var usermenuBtn = $("#usermenu-btn");
        usermenuBtn.click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            usermenu.toggle();
            usermenu.is(":hidden") ? usermenuBtn.removeClass("act") : usermenuBtn.addClass("act");
        });
    }

    $("#notificationLink").click(function (e) {
        e.preventDefault();
        var curdisp = $('#notificationContainer').css("display");
        if (curdisp == 'none') {
            $.ajax({
                url: SITE_ROOT + "ajax/notification-popup-list", success: function (result) {
                    $(".notification_head").hide("slow");
                    $("#notificationsBody").html(result);
                    $("#notificationContainer").toggle();
                }
            });
        } else {
            $('#notificationContainer').hide();
        }
        return false;
    });

    $("#notificationsBody")
        .on("click", ".agree", function (e) {
            e.preventDefault();
            e.stopPropagation();

            var $this = $(this);

            $this.closest('p').html('<a href="javascript:;" class="worked_confirm agreed"><i class="fa fa-check"></i> Accepted</a>');

            $.post(SITE_ROOT + 'access/confirm_work_together.php', {
                workedId: $this.data("worked"),
                confirmId: 1,
                notid: $this.data("notid")
            });
        })
        .on("click", ".decline", function (e) {
            e.preventDefault();
            e.stopPropagation();

            var $this = $(this);

            $this.closest('.item_review, .notificationBox').remove();

            $.post(SITE_ROOT + 'access/confirm_work_together.php', {
                workedId: $this.data("worked"),
                confirmId: 0,
                notid: $this.data("notid")
            });
        });

    $('#mob_btn').click(function (e) {
        $('.top_section .main_nav .main_manu').slideToggle();
        return false;
    });
    $('#mob_btn1').click(function (e) {
        $('#mob_menu1').slideToggle();
        return false;
    });

    $(".mob_menu_btn,#close").click(function (e) {
        e.preventDefault();
        $(".mob_menu").toggleClass("show_menu");
    });
    $(".mob_menu ul li a").click(function (event) {
        if ($(this).next('ul').length) {
            $(this).next().toggle('fast');
        }
    });

    var modalTemplate = $(
        '<div class="modal fade" tabindex="-1" role="dialog">' +
        '<div class="modal-dialog" role="document">' +
        '<div class="modal-content">' +
        '</div>' +
        '</div>' +
        '</div>'
    );

    var modalHeader = $(document.createElement("div"))
        .addClass("modal-header")
        .appendTo(modalTemplate[0].firstElementChild.firstElementChild);

    var modalClose = $('<button type="button" class="close" data-dismiss="modal">&times;</button>')
        .appendTo(modalHeader);

    var modalTitle = $(document.createElement("div"))
        .addClass("modal-title")
        .appendTo(modalHeader);

    var modalBody = $(document.createElement("div"))
        .addClass("modal-body")
        .appendTo(modalTemplate[0].firstElementChild.firstElementChild);

    body.append(modalTemplate);

    if ($.fn["perfectScrollbar"]) {
        $(".modal-body", modalTemplate).perfectScrollbar();
    }

    var buildModal = function(o, content)
    {
        if (o.title) {
            modalHeader.show();
            modalTitle.text(o.title);
        } else {
            modalHeader.hide();
            modalTitle.text('');
        }

        var classes = o.classes ? o.classes : '';
        var effect = o.effect ? o.effect : 'fade';

        modalTemplate.attr('class', 'modal ' + effect + ' ' + classes);
        modalBody.html(typeof content === "string" ? content : '');

        return modalTemplate;
    }

    var buildLinkModal = function(node, content)
    {
        var o = node.dataset;
        o.title = o.title ? o.title : node.getAttribute("title");
        return buildModal(o, content);
    }

    var loadModal = function (url, title, classes)
    {
        buildModal({title: title, classes: classes})
        modalBody.load(url);
        return modalTemplate.modal('show');
    };

    var showModal = function (content, title, classes)
    {
        return buildModal({title: title, classes: classes}, content).modal('show');
    };

    body.on("click", ".ajax-modal", function(e) {
        if (!this.getAttribute("href")) return;
        e.preventDefault();
        var classes = this.dataset.modalClass ? this.dataset.modalClass : '';
        loadModal(this.getAttribute("href"), this.getAttribute("title"), classes);
    });

    body.on("click", ".ajax-action", function (e) {
        if (!this.dataset.url) return;
        e.preventDefault();

        if (this.dataset.confirm) {
            if (!confirm(this.dataset.confirm)) {
                return;
            }
        }

        var self = this;
        var $self = $(this);

        if (self.dataset.event) {
            $self.trigger("pre." + self.dataset.event, [self]);
        }

        $.post((this.dataset.url[0] !== "/" ? SITE_ROOT : "") + this.dataset.url, $self.data(), function (data) {
            if (self.dataset.event) {
                $self.trigger(self.dataset.event, [self, data]);
            }
        });
    });

    body.on("click", ".ajax-link", function (e) {
        var url = this.dataset.url ? this.dataset.url : this.getAttribute("href");
        if (!url || !this.dataset.target) return;
        e.preventDefault();

        var self = this;
        var $self = $(this);
        var $target = $(self.dataset.target);

        $target.css({opacity: 0.7});

        if (self.dataset.event) {
            $self.trigger("pre." + self.dataset.event, [self]);
        }

        $.get((url[0] !== "/" ? SITE_ROOT : "") + url, $self.data(), function (data) {
            if (self.dataset.event) {
                $self.trigger(self.dataset.event, [self, data]);
            }
            $target.css({opacity: 1}).html(data);
        });
    });

    body.on("click", ".follow_btn", function (e) {
        e.preventDefault();

        var self = $(this);
        var friendid = self.data('friendid');
        if (!friendid) return;

        self.removeClass("has-spinner");

        if (self.hasClass("friend") || self.hasClass("following")) {
            // optimistic approach without waiting for the AJAX response
            self.removeClass("friend following active").addClass("follow");
            self.html('<i class="fa fa-plus"></i> <span class="text">Follow</span>');
            $.post(SITE_ROOT + 'ajax/unfollow_friend.php', {unfriendId: friendid}, function () {
                $(document).trigger("fameuz.follow", [friendid]);
            });
        } else {
            $.post(SITE_ROOT + 'ajax/sent_friend_request.php', {"friendId": friendid}, function (data) {
                self.removeClass("follow");
                if (data == 2) {
                    self.addClass("following friend");
                    self.html('<i class="fa fa-star-o"></i> <span class="text">Friend</span>');
                } else {
                    self.addClass("following");
                    self.html('<i class="fa fa-check"></i> <span class="text">Following</span>');
                }
                $(document).trigger("fameuz.follow", [friendid]);
            });
        }
    });

    var countChildren = function(node, sel)
    {
        if (!sel) {
            var children = node.children;
            return children ? children.length : $(node).children().length;
        }
        return $(node).children(sel).length;
    }

    //var $preloader = $('<div class="feedLoader">Loading...</div>');

    var ajaxLoader = function (node, search) {
        var url = node.dataset.url;

        if (!url) {
            return;
        }

        var $node = $(node);
        var newSearch = (typeof search === "string");

        if (newSearch) {
            $node.data("search", search).data("loading", false);
            node.dataset.finished = "";
            node.dataset.start = 0;
        }

        if (node.dataset.finished || $node.data("loading")) {
            return;
        }

        $node.data("loading", true);

        if (!node.dataset.limit) {
            node.dataset.limit = 10;
        }

        var start = node.dataset.start ? node.dataset.start : countChildren(node, node.dataset.children);
        var url = url + (url.indexOf("?") > -1 ? '&' : '?') + 'limit=' + node.dataset.limit + "&start=" + start;
        var searchStr = $node.data("search");

        if (searchStr) {
            url += "&search=" + encodeURIComponent(searchStr);
        }

        if (url[0] !== '/' && url.indexOf('://') === -1) {
            url = SITE_ROOT + url;
        }

        //if (!newSearch) {
            //$preloader.appendTo($node);
        //}

        if (node.dataset.event) {
            $node.trigger("pre." + node.dataset.event, [node]);
        }

        $.get(url, function (data) {
            if (newSearch) {
                $node.html(data);
                data = $(node.children);
            } else {
                //$preloader.remove();
                data = $(data);
                $node.append(data);
            }

            var prevStart = node.dataset.start ? node.dataset.start : 0;
            node.dataset.start = countChildren(node, node.dataset.children);
            var finished = (node.dataset.start - prevStart) < node.dataset.limit;
            node.dataset.finished = finished ? 1 : "";
            console.log("Finished: " + finished);
            $node.data("loading", false);

            if (node.dataset.start == 0) {
                if (node.dataset.empty) {
                    $node.html(node.dataset.empty);
                }
            } else {
                if ($.fn["elastic"]) {
                    $(node.getElementsByClassName("comment_descr_input2")).elastic();
                }
            }

            if (node.dataset.event) {
                $node.trigger(node.dataset.event, [node, data]);
            }
        });
    }

    var i, l;
    var ajaxContent = document.getElementsByClassName("ajax-content");

    if (ajaxContent.length) {
        for (i = 0, l = ajaxContent.length; i < l; i++) {
            ajaxLoader(fameuz.empty(ajaxContent.item(i)));
        }
    }

    var scrollfeed = document.getElementsByClassName("scrollfeed");

    if (scrollfeed.length) {
        // Force start from top, is scrollfeed exists
        scrollTo(0, 0);

        scrollfeed = scrollfeed.item(0);

        var scrollData = scrollfeed.dataset,
            ajaxSearch = document.getElementsByClassName("ajax-search");

        if (ajaxSearch.length) {
            $(ajaxSearch).keyup(function () {
                ajaxLoader(scrollfeed, this.value);
            });
        }

        if (scrollData.url) {
            var $w = $(window), $d = $(document);

            $w.scroll(function () {
                if (scrollData.finished) {
                    return;
                }

                if ($w.scrollTop() >= $d.height() - $w.height() - fameuz.scrollThreshold) {
                    ajaxLoader(scrollfeed);
                }
            });
        }
    }

    if ($.fn["tooltip"]) {
        $('[data-toggle="tooltip"]').tooltip();
    }

    if ($.fn["fameuzLightbox"]) {
        fameuz.initLightbox();
    }

    // Autoclose dropdown menus
    body.on("click", ".autoclose", function (e) {
        e.stopPropagation();
    });

    body.click(function (e) {
        $(document.getElementsByClassName("autoclose")).hide();
        var btn = document.getElementById("usermenu-btn");
        if (btn) btn.classList.remove("act");
    });
})();