(function ($, window, document, undefined) {
    //"use strict";

    var SITE_ROOT = window.SITE_ROOT || '/';

    // Create the defaults once
    var pluginName = "fameuzLightbox",
        defaults = {
            class: '',
            sidebar: 'default',
            likeUrl: 'api/like',
            shareUrl: 'api/share',
            rateUrl: "api/rate-image",
            photos: {
                imageLoadUrl: 'ajax/popdata.php',
                commentBoxUrl: 'ajax/image-comment-box',
                limitCount: 10,
                comments: {
                    commentActionUrl: 'access/post_comment.php?action=add_comment',
                    commentLikeUrl: '',
                    commentDelete: 'access/delete_comment.php',
                }

            },
            videos: {
                videoLoadUrl: '',
                commentBoxUrl: '',
                comments: {
                    commentActionUrl: '',
                    commentLikeUrl: '',
                }
            },
            comments: {
                deleteComment: '',
            },
            skin: {
                next: '<img src=' + SITE_ROOT + 'js/fameuz_lightbox/images/next.png>',
                prev: '<img src=' + SITE_ROOT + 'js/fameuz_lightbox/images/prev.png>',
                reset: '<i class="fa fa-refresh"></i>',
                close: '<img src=' + SITE_ROOT + 'js/fameuz_lightbox/images/close.png width="15">',
                loader: SITE_ROOT + 'images/ajax-loader.gif',
                review: '<i class="fa fa-chevron-right"></i>',
                video: SITE_ROOT + 'js/jw_player/six/six.xml',
            }
        };

    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend(Plugin.prototype, {
        init: function () {
            var self = this;
            var element = self.element;

            //if body was not build then build the overlay for lightbox
            if (!self.grandParent) {
                self.buildFrag();
            }

            // initiating plugin in accordance With class
            $(element).on('click', function (e) {
                var myClass = (self.settings.class !== '') ? self.settings.class : 'lightBoxs';
                self.targeted = null;
                if ($(e.target).hasClass(myClass)) {
                    e.preventDefault();
                    self.targeted = $(e.target);
                    //self.cycle();
                } else if ($(e.target).parent().hasClass(myClass)) {
                    e.preventDefault();
                    self.targeted = $(e.target).parent();
                    //self.cycle();
                }

                if (self.targeted) {
                    if (self.targeted.data("videncrid")) {
                        var url = "#video/" + self.targeted.data("videncrid");
                    } else {
                        if (self.targeted.data("contentalbum")) {
                            var url = "#album/" + self.targeted.data("contentalbum") + "/photo/" + self.targeted.data("contentid");
                        } else {
                            var url = "#photo/" + self.targeted.data("contentid");
                        }
                    }

                    if (history.pushState) {
                        history.pushState(null, null, url);
                    }

                    self.goto(url);
                }
            });

            $(window).on("hashchange", function (e) {
                if (self.goto(location.hash)) {
                    e.stopPropagation();
                }
            });

            self.goto(location.hash)
        },
        buildFrag: function () {
            var self = this;

            self.imageContentId = 2; // FIXME: Hardcoded content id
            self.videoContentId = 4;

            //Plugin Body with different sidebars
            var sidebar = '<div class="side_bar">' +
                '<div class="user-data">' +
                '<div class="user_info">' +
                '<a><img/></a>' +
                '</div>' +
                '<div class="user_data"><h3><a></a></h3><p></p></div>' +
                '</div>' +
                '<div class="like_countz">' +
                '<ul>' +
                '<li><i class="fa fa-heart"></i> <span class="likeCount">0</span></li>' +
                '<li><i class="fa fa-comments"></i> <span  class="commentCount">0</span></li>' +
                '<li><i class="fa fa-share-alt"></i> <span class="shareCount">0</span></li>' +
                '</ul>' +
                '</div>' +
                '<div class="image_comment_load">' +
                '<div class="middelSec">' +
                (self.settings.sidebar === 'photo' ? '<div class="masnoryDiv"><ul></ul></div>' : '') +
                '<div class="desc_photoz"><p></p></div>' +
                '<div class="comments_Extr"></div>' +
                '</div>' +
                '<div class="comment_box">' +
                '<div class="drop_shasdow"></div>' +
                '<div class="prof_thump"><img></div>' +
                '<div class="post_commnt">' +
                '<form enctype="multipart/form-data" method="post" action="">' +
                '<div class="arrow"><img src="' + SITE_ROOT + 'images/arrow_left.png" alt="arrow"></div>' +
                '<div class="textarea">' +
                '<!-- span class="smile_icon"><i class="fa fa-smile-o"></i></span !-->' +
                '<textarea class="lightbox_comment_input" rows="1" name="comment_descr_input" style="height: 34px; overflow: hidden;"></textarea>' +
                '<div class="ajaxloader text-center">' +
                '<img src="' + self.settings.skin.loader + '" alt="comments_arrow">' +
                '</div>' +
                '<input type="hidden" value="1" name="type">' +
                '<input type="hidden" value="84" name="video_id">' +
                '<input type="hidden" value="36" name="userto">' +
                '<br>' +
                '<small>Press Enter to post.</small>' +
                '</form>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';

            self.grandParent = $('<div class="overlay_bg">' +
                '<div class="lightBox">' +
                sidebar +
                '<div class="bg_fixed">' +
                '<div class="dismiss">' + self.settings.skin.close + '</div>' +
                '<span class="prev">' + self.settings.skin.prev + '</span>' +
                '<span class="next">' + self.settings.skin.next + '</span>' +
                '<div class="share_like_box">' +
                '<div class="review_message">' +
                '<a>Add Review <i class="fa fa-chevron-right"></i></a>' +
                '<a>Message <i class="fa fa-chevron-right"></i></a>' +
                '</div>' +
                '<div class="like">' +
                '<a class="like_btn_pop" href="javascript:;">' +
                '<i class="fa fa-heart"></i> <span>Like</span>' +
                '</a>' +
                '</div>' +
                '<div class="share">' +
                '<a class="share_btn_pop" href="javascript:;">' +
                '<i class="fa fa-share-alt"></i> <span>Share</span>' +
                '</a>' +
                '</div>' +
                '<div class="makeCover"><a class="makeCover_btn" href="javascript:;"><i class="fa fa-image"></i>Make Cover Photo </a></div>' +
                '<div class="fl-ratingBox"></div>' +
                '</div>' +
                '<div class="bg_img_stand">' +
                '<img>' +
                '<div class="vidSection" id="lightbox-video">' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>');

            self.grandParent.appendTo(document.body);

            var self = this;
            var lightbox = self.grandParent[0].firstElementChild;

            self.mainContainer = $(lightbox.getElementsByClassName("bg_fixed"));
            self.dismiss = $(lightbox.getElementsByClassName("dismiss"));
            self.imagePlatform = $(lightbox.getElementsByClassName("bg_img_stand"));
            self.displayImg = $(self.imagePlatform[0].firstElementChild);
            self.commentSection = $(lightbox.getElementsByClassName("comment"));
            self.sideBar = $(lightbox.getElementsByClassName("side_bar"));
            self.prev = $(lightbox.getElementsByClassName("prev"));
            self.next = $(lightbox.getElementsByClassName("next"));
            self.formActnInject = $(lightbox.getElementsByTagName("form"));
            self.commentParent = $(lightbox.getElementsByClassName("comments_Extr"));

            self.likeBtn = $(lightbox.getElementsByClassName("like_btn_pop"));
            self.shareBtn = $(lightbox.getElementsByClassName("share_btn_pop"));
            self.likeCount = $(lightbox.getElementsByClassName("likeCount"));
            self.shareCount = $(lightbox.getElementsByClassName("shareCount"));

            self.commentCount = $(lightbox.getElementsByClassName("commentCount"));
            self.commentLikeBtn = $(lightbox.getElementsByClassName("like_button"));
            self.commentBox = $(lightbox.getElementsByClassName("comment_box"));

            self.masnoryUl = $('.masnoryDiv ul', lightbox);
            self.descSection = $(lightbox.getElementsByClassName("desc_photoz"));
            self.descPopup = $(".desc_photoz p", lightbox);
            self.makeCoverBtn = $(lightbox.getElementsByClassName("makeCover_btn"));

            self.userlink = $(".user_info a", lightbox);
            self.userImage = $('.user_info img', lightbox);
            self.userName = $('.user_data h3 a', lightbox);
            self.timeUpdated = $('.user_data p', lightbox);
            self.appendComment = $(lightbox.getElementsByClassName("middelSec"));
            self.myImageThumb = $('.prof_thump img', lightbox);
            self.commentTextarea = $(lightbox.getElementsByClassName("lightbox_comment_input"));

            self.ratingBox = $(lightbox.getElementsByClassName("fl-ratingBox"));

            if (self.settings.guest) {
                $(lightbox.getElementsByClassName("share_like_box")).hide();
                self.commentSection.hide();
                self.commentParent.hide();
                self.commentBox.hide();
            } else {
                self.imagePlatform.css({paddingBottom: "50px"});
            }

            if (self.settings.sidebar === "album") {
                self.commentBox.hide();
            }

            var inputs = self.formActnInject[0].elements;
            self.inputObj = {
                id: $(inputs["video_id"]),
                type: $(inputs["type"]),
                userto: $(inputs["userto"]),
            };

            if ($.fn["perfectScrollbar"]) {
                self.appendComment.perfectScrollbar();
            }

            if ($.fn["elastic"]) {
                self.commentTextarea.elastic();
            }

            self.next.add(self.prev).on('click', function () {
                var $this = $(this);
                if ($this.data('videncrid')) {
                    var url = "#video/" + $this.data("videncrid");
                } else {
                    if ($this.data("contentalbum")) {
                        var url = "#album/" + $this.data("contentalbum") + "/photo/" + $this.data("contentid");
                    } else {
                        var url = "#photo/" + $this.data("contentid");
                    }
                }
                if (history.pushState) {
                    history.pushState(null, null, url);
                }
                self.goto(url);
            });

            self.likeBtn.on('click', function () {
                var $this = $(this),
                    likeId = $this.data("like");

                $this.toggleClass('liked');

                fameuz.like(likeId, $this.data("likecat"), function (data) {
                    self.likeCount.text(data.total);

                    self.toggleLike(data.liked);

                    var likeCnt = document.getElementById("img-likes-" + likeId);
                    if (likeCnt) {
                        var val = parseInt(likeCnt.textContent);
                        data.liked ? val++ : val--;
                        likeCnt.textContent = val;
                    }
                });
            });

            self.commentParent.on("click", ".like_button", function () {
                var $this = $(this);
                fameuz.like($this.data("likeId"), $this.data("likecat"), function (data) {
                    data.liked ? $this.addClass("liked") : $this.removeClass("liked");
                    $this.children('span:first').text(data.liked ? 'Liked' : 'Like');
                    $this.children('span:last').text(data.total);
                });
            });

            self.shareBtn.on('click', function () {
                var $this = $(this),
                    shareId = $this.data("share");

                self.shareBtn.toggleClass('shared');

                fameuz.share(shareId, $this.data("sharecat"), function (data) {
                    self.shareCount.text(data.total);

                    self.toggleShare(data.shared);

                    var sharesCnt = document.getElementById("img-shares-" + shareId);

                    if (sharesCnt) {
                        var val = parseInt(sharesCnt.textContent);
                        data.shared ? val++ : val--;
                        sharesCnt.textContent = val;
                    }
                });
            });

            self.commentTextarea.on('keyup', function (event) {
                if (event.keyCode == 13 && !event.shiftKey && self.commentTextarea.val().trim()) {
                    var closestForm = $(this).closest('form');
                    closestForm.find('.ajaxloader').show();
                    $.ajax({
                        method: "POST",
                        url: closestForm.attr("action"),
                        data: closestForm.serialize(),
                        success: function () {
                            self.fetchComments(self.globalElement, self.RecentpageNo);
                            var recentCount = parseInt(self.commentCount.html());
                            self.commentCount.html(recentCount + 1);
                            self.commentTextarea.val('');
                            $('.ajaxloader').hide();
                        }
                    });
                    return false;
                }
            });

            self.makeCoverBtn.on("click", function () {
                var $this = $(this);
                // Optimistic approach
                $this.html('<i class="fa fa-check"></i> Make Cover Photo');
                $.post(SITE_ROOT + 'ajax/set-cover-image', {imgId: $this.data("coverid")});
            });

            self.masnoryUl.on('click', '.popInside', function () {
                var _this = $(this);
                self.show(_this);
            });

            self.appendComment.on('click', '.loadMorePicz', function () {
                var _this = $(this);
                var initValue = parseInt(_this.data('limit'));
                var count = parseInt(initValue) + self.count;
                self.loadMasnory(self.globalElement, initValue, count);
            });

            self.commentParent.on('click', '.loadMoreTime', function () {
                var pageNo = $(this).data('pageno');
                if (typeof pageNo !== typeof undefined) {
                    var newPageNo = parseInt(pageNo) + 1;
                    self.fetchComments(self.globalElement, newPageNo);
                }
            });

            self.dismiss.on('click', function () {
                self.close();
            });

            $(document).keyup(function (e) {
                switch (e.which) {
                    case 27:
                        self.close();
                        break;
                }
            });

            lightbox.addEventListener("click", function (e) {
                e.stopPropagation();
            });

            self.grandParent.on("click", function () {
                self.close();
            });
            
            $(document).on("fameuz.image.deleted", function () {
                self.close();
            });
        },
        goto: function(url){
            var self = this;

            if (!url || url === "#") {
                if (!self.grandParent.is(":hidden")) {
                    self.close();
                }
                return false;
            };

            if (url.match(/#video\/.+/g)) {
                var id = url.split("#video/")[1];
                if (!id) return;
                self.targeted = $('<a></a>').data("videncrid", id);
                self.cycle();
                return true;
            }

            if (url.match(/#photo\/.+/g)) {
                var id = url.split("#photo/")[1];
                if (!id) return;
                self.targeted = $('<a></a>').data("contentid", id);
                self.cycle();
                return true;
            }

            if (url.match(/#album\/[\d-]+\/photo\/\d+/g)) {
                var albumId = url.split("#album/")[1].split("/")[0];
                var photoId = url.split("photo/")[1];
                self.targeted = $('<a></a>').data({
                    contentalbum: albumId,
                    contentid: photoId
                });
                self.cycle();
                return true;
            }

            if (!self.grandParent.is(":hidden")) {
                self.close();
            }

            return false;
        },
        cycle: function () {
            var self = this;

            self.resetScrollTop();
            self.show(self.targeted);

            var countTemp = self.settings.photos.limitCount ? self.settings.photos.limitCount : 10;
            var windowHeight = $(window).height();
            self.count = (windowHeight <= 700) ? 3 : countTemp;

            self.initPlugin();
        },
        initPlugin: function () {
            var self = this;
            if (self.grandParent.css('display') !== 'block') {
                self.grandParent.show();
            }
        },
        show: function (_this) {
            var keys,
                self = this,
                data = _this.data();

            self.typeofFile = data.videncrid ? "video" : "image";

            var keys = $.extend({}, data);

            if (data.videncrid) {
                keys.ecrId = data.videncrid;
                keys.contentid = data.videncrid;
            }

            self.fetch(keys, self.typeofFile).done(function (data) {
                self.globalElement = data;
                if (self.settings.sidebar === 'photo') {
                    self.loadMasnory(data, 0, self.count);
                }
                self.settingBuildFrag(self.typeofFile, data);
                self.exhibit(data, self.RecentpageNo, keys);
            });
        },
        exhibit: function (data, page, val) {
            var self = this;
            self.next.removeData();
            self.prev.removeData();
            self.mainContainer.removeClass('loadImages');
            self.supply(data, val);
            self.display(data, self.typeofFile, val);
            self.like(data, val, self.typeofFile);
            self.share(data, val);
            (self.settings.sidebar !== 'album') ? self.triggerCmnt(data, val) : null;
        },
        fetch: function (val, typeofFile) {
            var self = this;

            var self = this,
                url = typeofFile === 'image'
                    ? self.settings.photos.imageLoadUrl
                    : self.settings.videos.videoLoadUrl;

            if (self.settings.sidebar === 'photo') {
                val.type = window.photoMode || '';
            }

            self.commentData = val;

            return $.ajax({
                url: url,
                dataType: "json",
                data: val,
                type: "GET",
                cache: false,
                beforeSend: function () {
                    self.beforeSend();
                },
                success: function (data) {
                    if (!self.settings.guest) {
                        self.fetchComments(data, 1).error(function () {
                            throw new Error('Error loading comments form database :-() ');
                        });
                    }
                },
                error: function () {
                    console.log('error fetching data from database');
                }
            });
        },
        fetchComments: function (data, pageNo) {
            var self = this,
                url = self.typeofFile === 'image'
                    ? self.settings.photos.commentBoxUrl
                    : self.settings.videos.commentBoxUrl;
            
            if (self.settings.sidebar !== 'album') {
                var dataKey = (self.typeofFile == 'image') ? {
                    imageId: self.commentData.contentid,
                    userto: data.userto,
                    myimage: data.myimage,
                    page: pageNo
                } : {
                    imageId: self.commentData.ecrId,
                    userto: data.userto,
                    page: pageNo
                };
            } else if (self.settings.sidebar === 'album') {
                var dataKey = (self.typeofFile === 'image') ? {
                    imageId: self.commentData.contentid,
                    albumId: self.commentData.contentalbum
                } : {
                    ecrId: self.commentData.ecrId
                };
            }
            return $.ajax({
                url: url,
                data: 'html',
                type: 'GET',
                data: dataKey,
                cache: false,
                beforeSend: function (pageNo) {
                    self.commentClear(pageNo);
                },
                success: function (data) {
                    self.loadComment(data);
                }
            });
        },
        loadComment: function (data) {
            var self = this;
            (self.sidebar !== 'album') ? self.commentParent.html(data) : self.commentParent.html(data);
            var loadMoreTime = $('.loadMoreTime');
            self.RecentpageNo = loadMoreTime.data('pageno');
            self.delteComment();
        },
        beforeSend: function () {
            var self = this;
            self.clearHtml(self.masnoryUl[0]);
            self.partialClear();
        },
        commentClear: function () {
        },
        settingBuildFrag: function (ExtensiontypeofFile, data) {
            var self = this;
            var sidebarHeight = parseInt(self.sideBar.height() - 180);
            self.displayImg.hide();
            $("#lightbox-video").hide();

            if (self.typeofFile === 'image') {
                self.displayImg.show();
                self.makeCoverBtn.show();
            } else {
                $("#lightbox-video").show();
            }

            self.appendComment.css({height: sidebarHeight})
        },
        display: function (data, fileType, values) {
            var self = this;
            self.imagePlatform.removeClass('bg_img_stand_img');

            if (fileType === 'video') {
                self.imagePlatform.show();
                self.mainContainer.addClass('loadImages');
                self.video(data);
            } else {
                self.photo(data);
            }

            if (self.settings.guest) return;

            if (fileType == 'image') {
                if (data.userMe === data.userto) {
                    self.makeCoverBtn.show().data("coverid", values.contentid);
                    if (data.coverImg) {
                        self.makeCoverBtn.html('<i class="fa fa-check"></i> Cover Photo');
                    } else {
                        self.makeCoverBtn.html('<i class="fa fa-image"></i> Make Cover Photo');
                    }
                } else {
                    self.makeCoverBtn.hide();
                }
                if (typeof data.rating !== "undefined") {
                    self.showRatingBox(data);
                } else {
                    self.hideRatingBox();
                }
            } else {
                self.makeCoverBtn.hide();
            }
        },
        resetScrollTop: function () {
            var self = this;
            self.appendComment.css({scrollTop: 0});
        },
        photo: function (data) {
            var self = this;
            self.displayImg.attr('src', data.imageUrl).load(function () {
                self.imagePlatform.show();
            }).on('error', function () {
                self.displayImg.attr('src', 'images/no_img.jpg');
            });
            self.imagePlatform.addClass('bg_img_stand_img');

            var newMessurments = self.setImage(data);

            self.displayImg.css({
                width: newMessurments[0],
                height: newMessurments[1],
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            });
        },
        video: function (data) {
            var self = this;
            self.imagePlatform.css({
                width: '100%',
                height: '89%',
                top: 40,
                left: 0,
                right: 0,
                bottom: 50,
                transform: 'none'
            });

            jwplayer("lightbox-video").setup({
                flashplayer: "player.swf",
                //image: data.imageUrl,
                file: data.videourl,
                skin: self.settings.skin.video,
                width: "100%",
                height: "100%",
                autostart: true,
                stretching: "uniform",
            });
        },
        supply: function (data, val) {
            var self = this;

            self.userImage.attr('src', data.userImage);
            self.myImageThumb.attr('src', data.myimage);
            self.userlink.attr('href', data.userLink);

            if (data.imgDescrSmall) {
                self.descSection.show();
                self.descPopup.html(data.imgDescrSmall);
                $(".readMore").on('click', function () {
                    self.descPopup.html(data.imgDescrFull);
                });
            } else {
                self.descPopup.html('');
                self.descSection.hide();
            }

            var elementArray = [self.likeCount, self.shareCount, self.commentCount, self.userName, self.timeUpdated];
            var valueArray = [data.likeCount, data.shareCount, data.commentCount, data.userName, data.imageCreatedOn];
            for (var i = 0; i < elementArray.length && valueArray.length; i++) {
                elementArray[i].html(valueArray[i]);
            }

            self.userName.attr('href', data.userLink);

            (data.imageNextId == '' || data.imageNextId == null) ? self.next.hide() : self.next.show();
            (data.imagePrevId == '' || data.imagePrevId == null) ? self.prev.hide() : self.prev.show();

            if (self.settings.sidebar !== 'photo') {
                if (self.typeofFile == 'image') {
                    self.next.data({
                        contentid: data.imageNextId,
                        contentalbum: data.imageAlbumId
                    });
                    self.prev.data({
                        contentid: data.imagePrevId,
                        contentalbum: data.imageAlbumId
                    });
                } else if (self.typeofFile == 'video') {
                    self.next.data("videncrid", data.imageNextId);
                    self.prev.data("videncrid", data.imagePrevId);
                }
            } else if (self.settings.sidebar === 'photo') {
                self.next.data({
                    contentid: data.imageNextId
                });
                self.prev.data({
                    contentid: data.imagePrevId
                });
            }

            (self.typeofFile == 'image') ? self.inputObj.id.attr('name', 'id') : self.inputObj.id.attr('name', 'video_id');
            (self.typeofFile == 'image') ? self.commentTextarea.attr('name', 'comment_descr') : self.commentTextarea.attr('name', 'comment_descr_input');
        },
        showRatingBox: function (data) {
            var self = this, stars, average;

            self.ratingBox.data("imageId", data.imageId);
            self.ratingBox.data("imageType", data.imageType);

            if (!self.ratingBox[0].firstChild) {
                // ''.repeat(), we can't be together yet.
                var i = 0, stars = '';
                while (i++ < 5) {
                    stars += '<i class="fa fa-star-o" aria-hidden="true"></i>';
                }
                $('<span class="fl-stars">' + stars + '</span>')
                    .appendTo(self.ratingBox);

                self.ratingBox.find(".fa-star-o")
                    .on("mouseover", function () {
                        var pos = stars.index(this) + 1;
                        stars.slice(0, pos).addClass("fa-star").removeClass("fa-star-o");
                        stars.slice(pos).addClass("fa-star-o").removeClass("fa-star");
                    })
                    .on("click", function () {
                        var rating = stars.index(this) + 1;
                        var imageId = self.ratingBox.data("imageId");
                        $.post(self.settings.rateUrl, {
                            id: imageId,
                            type: self.ratingBox.data("imageType"),
                            rating: rating
                        }, function (res) {
                            stars.addClass("fa-star-o").removeClass("fa-star fl-checked");
                            stars.slice(0, rating).addClass("fa-star fl-checked").removeClass("fa-star-o");
                            average.text(res.average);
                            $(document).trigger("fameuz.photo.rated", imageId);
                        });
                    });

                $('<b></b>').appendTo(self.ratingBox);

                self.ratingBox.on("mouseout", function () {
                    stars.filter(".fl-checked").addClass("fa-star").removeClass("fa-star-o");
                    stars.filter(":not(.fl-checked)").addClass("fa-star-o").removeClass("fa-star");
                });
            }

            stars = self.ratingBox.find(".fl-stars").first().children()
                .addClass("fa-star-o")
                .removeClass("fa-star fl-checked");

            average = self.ratingBox.find("b").first();

            if (data.rating && typeof data.rating.rating === "number") {
                stars.slice(0, data.rating.rating).addClass("fa-star fl-checked").removeClass("fa-star-o");
                average.text(data.rating.average);
            } else {
                average.text("Become first to rate this photo!")
            }

            self.ratingBox.show();
        },
        hideRatingBox: function () {
            this.ratingBox.hide();
        },
        loadMasnory: function (data, initValue, count) {
            $('.photo_prev').html('');
            var self = this;
            if (data.relatedImages.length > count) {
                var range = data.relatedImages.length - count;
            } else {
                var count = data.relatedImages.length;
            }
            if ((data.relatedImages.length - 1) < count) {
                count = data.relatedImages.length;
                $('.loadMorePicz').remove();
            }
            for (var i = parseInt(initValue); i < parseInt(count); i++) {
                self.masnoryUl.append('<li><a href="javascript:;" class="popInside" data-contentid="' + data.relatedImages[i].contentid + '"><img src="' + data.relatedImages[i].relatedImgUrl + '"></a></li>');
            }
            if (!$('.loadMorePicz').length && range != 0 && range > 0) {
                $('<a class="loadMorePicz" href="javascript:;" data-limit="' + count + '">Load More Images</a>').insertAfter(self.masnoryUl);
            } else {
                $('.loadMorePicz').data({limit: count});
            }
        },
        triggerCmnt: function (data, val) {
            var self = this;

            self.inputObj.userto.val(data.userto);
            self.inputObj.id.val(val.contentid);

            var actionUrl = (self.typeofFile == 'image')
                ? self.settings.photos.comments.commentActionUrl
                : self.settings.videos.comments.commentActionUrl;

            self.formActnInject.attr('action', actionUrl);
        },
        like: function (data, val) {
            var self = this;

            self.toggleLike(data.youLike);

            if (data.videoId) {
                self.likeBtn.data({
                    like: data.videoId,
                    likecat: self.videoContentId
                });
            } else {
                self.likeBtn.data({
                    like: val.contentid,
                    likecat: self.imageContentId
                });
            }
        },
        toggleLike: function(status) {
            var self = this;

            if (status) {
                self.likeBtn.addClass('liked');
                self.likeBtn.children('span:first').text('Liked');
            } else {
                self.likeBtn.removeClass('liked');
                self.likeBtn.children('span:first').text('Like');
            }
        },
        toggleShare: function(status) {
            var self = this;

            if (status) {
                self.shareBtn.addClass('shared');
                self.shareBtn.children('span:first').text('Shared');
            } else {
                self.shareBtn.removeClass('shared');
                self.shareBtn.children('span:first').text('Share');
            }
        },
        share: function (data, val) {
            var self = this;

            if (data.userMe == data.userto) {
                self.shareBtn.hide();
                return;
            }

            self.toggleShare(data.youShare);

            if (data.videoId) {
                self.shareBtn.data({
                    share: data.videoId,
                    sharecat: self.videoContentId
                });
            } else {
                self.shareBtn.data({
                    share: val.contentid,
                    sharecat: self.imageContentId
                });
            }

            self.shareBtn.show();
        },

        setImage: function (data) {
            var self = this;
            var imageWidth, imageHeight, resizedWidth, resizedHeight, adjTop, adjLeft;
            var imageOverlayWidth = self.mainContainer.width();
            var imageOverlayHeight = self.mainContainer.height();
            var mesurments = new Array();
            var ratioWidth = imageOverlayWidth / data.imageWidth;
            var ratioHeight = imageOverlayHeight / data.imageHeight;

            if (data.imageWidth > imageOverlayWidth || data.imageHeight > imageOverlayHeight) {
                if (data.imageWidth > imageOverlayWidth) {
                    resizedWidth = imageOverlayWidth;
                    resizedHeight = data.imageHeight * ratioWidth;
                }
                if (data.imageHeight > imageOverlayHeight) {
                    resizedWidth = data.imageWidth * ratioHeight;
                    resizedHeight = imageOverlayHeight;
                }
            } else {
                resizedWidth = data.imageWidth;
                resizedHeight = data.imageHeight;
            }
            adjTop = parseInt((imageOverlayHeight - resizedHeight) / 2);
            adjLeft = parseInt((imageOverlayWidth - resizedWidth) / 2)
            mesurments.push(resizedWidth, resizedHeight, adjTop, adjLeft);

            return mesurments;
        },
        partialClear: function () {
            var self = this;
            self.mainContainer.addClass('loadImages');
            self.displayImg.removeAttr('src');
            self.imagePlatform.hide();
            self.masnoryUl.html('');
            self.clearHtml(self.masnoryUl[0]);
            self.clearHtml(self.commentParent[0]);
        },
        clear: function () {
            var self = this;
            self.partialClear();
            self.hideRatingBox();
            self.imagePlatform.removeClass('bg_img_stand_img');

            if (self.typeofFile == 'video') {
                try {
                    jwplayer("lightbox-video").stop();
                } catch (e) {
                }
            }

            $("#lightbox-video").replaceWith($('<div class="vidSection" id="lightbox-video"></div>').hide());

            self.next.removeData();
            self.prev.removeData();

            self.clearHtml(self.masnoryUl[0]);
        },
        clearHtml: function (node) {
            if (!node) return;
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
        },
        delteComment: function (element) {
            var self = this;
            $('.deletComment', self.commentParent).on('click', 'a', function () {
                var deleteId = $(this).data('delid');
                var elem = $(this).parents('.comment');
                Lobibox.confirm({
                    msg: "You are about to delete this comment ?",
                    title: "Delete Confirmation",
                    buttonsAlign: 'right',
                    closeButton: false,
                    callback: function ($this, type, ev) {
                        if (type === 'yes') {
                            elem.remove();
                            var recentCommentCount = self.commentCount.html();
                            self.commentCount.html(parseInt(recentCommentCount) - 1);
                            $('.ajaxloader').show();
                            var delid = deleteId;
                            if (delid) {
                                $.ajax({
                                    url: self.settings.photos.comments.commentDelete,
                                    method: "POST",
                                    data: {delid: delid},
                                    success: function () {
                                        $('.ajaxloader').hide();
                                    },
                                    error: function () {
                                        Lobibox.notify('error', {
                                            msg: 'Failed to remove Comment',
                                            icon: false,
                                            delay: false,
                                        });
                                    },
                                });
                            }
                            Lobibox.notify('success', {
                                msg: 'Comment has been removed.',
                                icon: false,
                                delay: 1500,
                            });
                        } else if (type === 'no') {
                            //Lobibox.notify('info', {
//											msg: 'You have clicked "No" button.'
//										});
                        }
                    }
                });
            });
        },
        close: function () {
            var self = this;
            self.grandParent.hide();
            self.clear();
            $(document).trigger("fameuz.lightbox.closed");
            if (history.pushState && (location.hash.indexOf("photo/") > -1 || location.hash.indexOf("video/") > -1)) {
                history.pushState(null, null, "#");
            }
        }
    });

    $.fn[pluginName] = function (options) {
        return new Plugin(this, options);
    };

})(jQuery, window, document);