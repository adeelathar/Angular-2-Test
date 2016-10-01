var fameuzPhotoManager = function(container, userId, managerMode, cloudinary){
    var self = fameuzPhotoManager;

    if (self.started) {
        return self;
    }

    var SITE_ROOT = window.SITE_ROOT || "/";

    self.endpoints = {
        albums: SITE_ROOT + "ajax/photos/albums-list.json",
        album: SITE_ROOT + "ajax/photos/single-album.json",
        allPhotos: SITE_ROOT + "ajax/photos/all.json",
        deletePhoto: SITE_ROOT + "ajax/photos/delete-photo.json",
        editAlbum: SITE_ROOT + "ajax/photos/edit-album.json",
        deleteAlbum: SITE_ROOT + "ajax/photos/delete-album.json",
        upload: SITE_ROOT + "ajax/photos/upload.json",
        log: SITE_ROOT + "ajax/log.json",
    };

    self.css = SITE_ROOT + 'css/fameuz-photo-manager.css';
    self.cssParentClass = 'fameuz-photos';

    self.photoWidth = 150;
    self.photoHeight = 110;

    self.maxFileSize = 10;

    self.albumAll = 0;
    self.albumPost = -1;
    self.albumPolaroids = null;

    var activeTab = null,
        dropzone = null;

    var tabAlbums = (function(){
        var tab = {};

        tab.load = function() {
            tab.init();
            $.getJSON(self.endpoints.albums, {userId: userId},  function(data){
                if (!data.length) {
                    var msg = (managerMode ? 'You have' : 'The member has') + ' no albums.'
                    tab.body.html('<div class="row text-center">' + msg + '</div>');
                    return;
                }

                var bg, result = '';
                for (var i = 0, l = data.length; i < l; i++) {
                    if (!managerMode && !data[i].count) continue;

                    bg = data[i].thumb
                        ? 'style="background-image:url(' + data[i].thumb + ');"'
                        : 'style="background: #f1f1f1 url(/images/album_list.png) no-repeat center center;"';

                    result += '<div class="col-sm-4 col-md-3">' +
                        '<a href="#album/' + data[i].id + '" ' + bg + ' data-album-id="' + data[i].id + '" data-type="' + data[i].type + '">' +
                        '<div class="caption">' +
                        '<b>' + data[i].name + '</b>' +
                        '<span class="pull-right"><i class="fa fa-camera" aria-hidden="true"></i> ' + data[i].count  + '</span>' +
                        '</div>' +
                        '</a>' +
                        '</div>';
                }

                tab.body.html('<div class="row fm-albums">' + result + '</div>');
            });
        };

        tab.open = function () {
            tab.init();
            tab.body.empty();
            tab.load();
            return tab;
        };

        tab.init = function(){
            if (tab.html) return;

            if (modalMode) {
                tab.html = $('<div class="modal-content">' +
                    '<div class="modal-header">' +
                    '<button type="button" class="btn btn-default btn-sm" data-dismiss="modal" aria-label="Close"><i class="fa fa-times" aria-hidden="true"></i></button>' +
                    (managerMode ? '<button type="button" class="btn btn-default btn-sm" data-action="create" style="float:left"><i class="fa fa-plus" aria-hidden="true"></i></button>' : '') +
                    '<h4 class="modal-title">' +
                    'Albums' +
                    '</h4>' +
                    '</div>' +
                    '<div class="modal-body clearfix">' +
                    '</div>' +
                    '</div>');

                tab.body = $(".modal-body", tab.html).first();
            } else {
                tab.html = $('<div><h4>Albums</h4></div>');
                tab.body = $('<div></div>').appendTo(tab.html);
            }

            if (modalMode) {
                tab.html.on("click", "[data-album-id]", self.showAlbum);
            }

            tab.html.find("[data-action='create']").on("click", self.createAlbum);
        };

        return tab;
    })();

    var tabSingleAlbum = (function(){
        var tab = {}, currentAlbum, $albumTitle, $dropzone;

        tab.load = function(albumId){
            tab.init();
            $.getJSON(self.endpoints.album, {
                userId: userId,
                albumId: albumId,
                width: self.photoWidth,
                height: self.photoHeight
            }, function (data) {
                var img, result = '';
                currentAlbum = data.album;

                $albumTitle.text(data.album.name).next().html(data.album.caption);

                if (!data.images.length) {
                    result += (managerMode ? 'You have' : 'The member has') + ' no photos yet.';
                } else {
                    for (var i = 0, l = data.images.length; i < l; i++) {
                        img = data.images[i];
                        result += '<a href="#' + (albumId != 0 ? 'album/' + albumId + '/' : '') + 'photo/' + img.ai_id + '" class="lightBoxs" data-contentid="' + img.ai_id + '" data-contentalbum="' + albumId + '">' +
                            '<img src="' + img.ai_images + '" width="' + self.photoWidth + '" height="' + self.photoHeight + '">' +
                            '</a>';
                    }
                }

                tab.body.html('<div class="text-center">' + result + '</div>');

                if (!modalMode && history.pushState) {
                    var path = albumId == self.albumPolaroids ? "#polaroids" : (albumId == "0" ? "#all" : "#album/" + albumId);
                    $(document).on("fameuz.lightbox.closed", function(){
                        history.pushState(null, null, path);
                    });
                }

                if (managerMode && (albumId == 0 || albumId == -1 || data.album.type === 'profile' || data.album.type === 'polaroids')) {
                    $("button[data-action='edit']", tab.html).hide();
                }
            });
        };

        tab.onClose = function(){
            if (dropzone) dropzone.removeAllFiles();
            $dropzone.hide();
            $albumTitle.empty().next().empty();
            $(document).off("fameuz.lightbox.closed");
        };

        tab.open = function(params) {
            tab.init();
            tab.body.empty();

            if (dropzone && params.type !== 'profile') {
                //dropzone.options.url = self.endpoints.upload + '?albumId=' + params.albumId;
                $dropzone.show();
            } else {
                $dropzone.hide();
            }

            if (managerMode) {
                (params.albumId == 0 || params.albumId == -1 || params.type === 'profile' || params.type === 'polaroids')
                    ? $("button[data-action='edit']", tab.html).hide()
                    : $("button[data-action='edit']", tab.html).show();
            }

            tab.load(params.albumId);

            return tab;
        };

        tab.init = function(){
            if (tab.html) return;

            if (modalMode) {
                tab.html = $('<div class="modal-content">' +
                    '<div class="modal-header">' +
                    '<button type="button" aria-label="Go back" class="btn btn-default btn-sm" data-action="albums"><i class="fa fa-chevron-left" aria-hidden="true"></i></button>' +
                    '<button type="button" class="btn btn-default btn-sm" data-dismiss="modal" aria-label="Close"><i class="fa fa-times" aria-hidden="true"></i></button>' +
                    (managerMode ? '<button type="button" class="btn btn-default btn-sm" data-action="edit"><i class="fa fa-pencil" aria-hidden="true"></i></button>' : '') +
                    '<h4 class="modal-title"></h4>' +
                    '</div>' +
                    (managerMode ? '<form class="dropzone clearfix" id="albumsDropzone"><aside class="clearfix">Drag and drop files here</aside></form>' : '') +
                    '<div class="modal-body clearfix">' +
                    '</div>' +
                    '</div>');
    
                tab.body = $(".modal-body", tab.html).first();
            } else {
                tab.html = $(
                    '<div>' +
                    (managerMode ? '<button type="button" class="btn btn-default btn-sm" data-action="edit"><i class="fa fa-pencil" aria-hidden="true"></i></button>' : '') +
                    '<h4></h4><p></p>' +
                    (managerMode ? '<form class="dropzone clearfix" id="albumsDropzone"><aside class="clearfix">Drag and drop files here</aside></form>' : '') +
                    '</div>'
                );
                tab.body = $('<div></div>').appendTo(tab.html);
            }
            
            tab.html.find("[data-action='albums']").on("click", self.showAlbums);

            tab.html.find("[data-action='edit']").on("click", function (e) {
                e.preventDefault();
                openTab(tabEditAlbum, currentAlbum);
            });

            $albumTitle = $("h4", tab.html);
            $dropzone = $("#albumsDropzone", tab.html);

            if (managerMode) {
                Dropzone.autoDiscover = false;

                dropzone = new Dropzone($dropzone[0], {
                    url: cloudinary.url,
                    paramName: "file",
                    addRemoveLinks: false,
                    acceptedFiles: "image/*",
                    maxFilesize: self.maxFileSize,
                    thumbnailWidth: self.photoWidth,
                    thumbnailHeight: self.photoHeight
                });

                dropzone.on('sending', function (file, xhr, formData) {
                    formData.append('api_key', cloudinary.api_key);
                    formData.append('signature', cloudinary.signature);
                    $.each(cloudinary.params, function(k, v) {
                        formData.append(k, v);
                    });
                });

                dropzone.on('success', function (file, response) {
                    if (response.error) {
                        toastr.error("Sorry, something went wrong. Please, try again later.");
                        $.post(self.endpoints.log, response.error.message);
                        return;
                    }
                    response.albumId = currentAlbum.id;
                    $.post(self.endpoints.upload, response);
                });

                $(document).on("fameuz.image.deleted", function (e, imageId) {
                    $("a[data-contentid='" + imageId + "']", tab.html).remove();
                });
            }
        };

        return tab;
    })();

    var tabEditAlbum = (function(){
        var tab = {};

        tab.open = function(album){

            var deleteBtn = (album && album.type !== 'polaroids') ? '<div class="btn-group">' +
                '<button type="button" class="btn btn-danger btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                '<i class="fa fa-trash-o" aria-hidden="true"></i>' +
                '</button>' +
                '<ul class="dropdown-menu">' +
                '<li><a href="#" data-action="delete">Remove the album?</a></li>' +
                '</ul>' +
                '</div>' : '';

            var $form = $('<form method="post" class="modal-body clearfix" action="' + self.endpoints.editAlbum + '">' +
                ( album ? '<input type="hidden" name="albumId" value="' + album.id + '">' : '') +
                '<div class="form-group">' +
                'Title:' +
                '<input name="name" type="text" class="form-control">' +
                '</div>' +
                '<div class="form-group">' +
                'Description:' +
                '<textarea name="caption" class="form-control" rows="3"></textarea>' +
                '</div>' +
                '<div class="form-group">' +
                deleteBtn +
                '<button class="btn btn-info pull-right" type="submit">Save</button> ' +
                '<button class="btn pull-right" data-action="cancel" type="button" data-album-id="' + ( album ? album.id : '') + '" style="margin-right:8px;">Cancel</button> ' +
                '</div>' +
                '</form>');

            var title = album ? 'Album settings' : 'Create an album';

            if (modalMode) {
                tab.html = $('<div class="modal-content">' +
                    '<div class="modal-header">' +
                    '<button type="button" class="btn btn-default btn-sm" data-dismiss="modal" aria-label="Close"><i class="fa fa-times" aria-hidden="true"></i></button>' +
                    '<h4 class="modal-title">' + title + '</h4>' +
                    '</div>' +
                    '</div>');
            } else {
                tab.html = $('<div>' +
                    '<h4 class="modal-title">' + title + '</h4>' +
                    '</div>');
            }

            $form.appendTo(tab.html).on("submit", function (e) {
                e.preventDefault();

                if (!this.elements["name"].value.trim()) {
                    toastr.error("Album name cannot be empty.");
                    return;
                }

                $.post(self.endpoints.editAlbum, $(this).serialize(), function(a){
                    openTab(tabSingleAlbum, {albumId: a.a_id});
                });
            });

            if (!album) {
                $form.find("[data-action='cancel']").on("click", self.showAlbums);
                return tab;
            }

            $form.find("[name='name']").val(album.name);
            $form.find("[name='caption']").val(album.caption);
            $form.find("[data-action='cancel']").on("click", self.showAlbum);

            $form.find("[data-action='delete']").on("click", function (e) {
                e.preventDefault();
                if (!confirm("Are you sure?")) return;
                $.post(self.endpoints.deleteAlbum, {albumId: album.id}, self.showAlbums);
            });

            return tab;
        };

        return tab;
    })();

    var modalMode = !container;

    if (modalMode) {
        var managerWindow = $('<div class="modal fade" tabindex="-1" role="dialog">' +
            '<div class="modal-dialog modal-lg" style="transition: transform .1s ease-out;">' +
            '' +
            '</div>' +
            '</div>')
            .on("hidden.bs.modal", function () {
                activeTab.html.detach();
                if ("onClose" in activeTab) activeTab.onClose();
                activeTab = null;
            });
        
        self.openWindow = function () {
            if (managerWindow.is(":hidden")) {
                managerWindow.modal('show');
            }
            return managerWindow;
        };

        var $container = $(managerWindow[0].firstElementChild);
    } else {
        var $container = $(container);
    }

    $container.addClass(self.cssParentClass);

    var openTab = function (tab, options) {
        if (activeTab) {
            if ("onClose" in activeTab) activeTab.onClose();
            activeTab.html.detach();
        }
        activeTab = tab.open(options);

        if (modalMode) {
            self.openWindow();
        }

        $container.append(activeTab.html);
        if ("onOpen" in activeTab) activeTab.onOpen();
    };

    // PUBLIC CONTROLLERS

    self.showAlbums = function (e) {
        if (e instanceof Event) e.preventDefault();
        openTab(tabAlbums);
    };

    self.showAlbum = function (e) {
        if (e instanceof Event) e.preventDefault();
        openTab(tabSingleAlbum, this.dataset);
    };
    
    self.showAllPhotos = function (e) {
        if (e instanceof Event) e.preventDefault();
        openTab(tabSingleAlbum, {albumId: self.albumAll});
    };

    self.createAlbum = function (e) {
        if (e instanceof Event) e.preventDefault();
        openTab(tabEditAlbum);
    };

    self.goto = function(path){
        switch (true) {
            case (path === "#all"):
                openTab(tabSingleAlbum, {albumId: 0});
                return true;
            case (self.albumPolaroids && path === "#polaroids"):
                openTab(tabSingleAlbum, {albumId: self.albumPolaroids, type: "polaroids"});
                return true;
            case (typeof path === "string" && path.indexOf('#album/') === 0):
                var id = path.split("#album/")[1];
                if (id) {
                    openTab(tabSingleAlbum, {albumId: id.split("/")[0]});
                    return true;
                }
                break;
            case (!path || path === "#"):
                openTab(tabAlbums);
                return true;
        }
        return false;
    };

    // ADD MISSING DEPENDENCIES

    if (!$.fn["dropzone"]) {
        $(document.head).append('<link href="' + SITE_ROOT + 'js/dropzone/css/dropzone.css" rel="stylesheet" type="text/css"><script src="' + SITE_ROOT + 'js/dropzone/dropzone.js"></script>');
    }

    if (!$.fn["fameuzLightbox"]) {
        $(document.head).append('<link href="' + SITE_ROOT + 'js/fameuz_lightbox/fameuz_lightbox.css" rel="stylesheet" type="text/css"><script src="' + SITE_ROOT + 'js/fameuz_lightbox/fameuz_lightbox.js"></script>');
    }

    if ($("link[href='" + self.css + "']").length === 0) {
        $(document.head).append('<link href="' + self.css + '" rel="stylesheet" type="text/css">');
    }

    if (!modalMode) {
        $(window).on("hashchange", function (e) {
            if (self.goto(location.hash)) {
                e.stopPropagation();
            }
        });
        self.goto(location.hash);
    }
    
    self.started = true;
    return self;
};