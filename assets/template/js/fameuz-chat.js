/*
 * jQuery.ajaxMultiQueue - A queue for multiple concurrent ajax requests
 * (c) 2013 Amir Grozki
 * Dual licensed under the MIT and GPL licenses.
 *
 * Based on jQuery.ajaxQueue
 * (c) 2011 Corey Frang
 *
 * Requires jQuery 1.5+
 */
(function ($) {

    $.ajaxMultiQueue = function (n) {
        return new MultiQueue(~~n);
    };

    function MultiQueue(number) {
        var queues, i,
            current = 0;

        if (!queues) {
            queues = new Array(number);

            for (i = 0; i < number; i++) {
                // jQuery on an empty object, we are going to use this as our Queue
                queues[i] = $({});
            }
        }

        function queue(ajaxOpts) {
            var jqXHR,
                dfd = $.Deferred(),
                promise = dfd.promise();

            // queue our ajax request
            queues[current].queue(doRequest);

            current = (current + 1) % number;

            // add the abort method
            promise.abort = function (statusText) {

                // proxy abort to the jqXHR if it is active
                if (jqXHR) {
                    return jqXHR.abort(statusText);
                }


                var i,
                    queue,
                    index;

                // if there wasn't already a jqXHR we need to remove from queue
                for (i = 0; i < number || index < 0; i++) {
                    queue = queues[current].queue();
                    index = $.inArray(doRequest, queue);
                }

                if (index > -1) {
                    queue.splice(index, 1);
                }

                // and then reject the deferred
                dfd.rejectWith(ajaxOpts.context || ajaxOpts, [promise, statusText, ""]);
                return promise;
            };

            // run the actual query
            function doRequest(next) {
                jqXHR = $.ajax(ajaxOpts)
                    .done(dfd.resolve)
                    .fail(dfd.reject)
                    .then(next, next);
            }

            return promise;
        };

        return {
            queue: queue
        };
    }

})(jQuery);

var fameuzChat = function (server, userId) {
    var self = fameuzChat;

    if (self.started) {
        return self;
    }

    var SITE_ROOT = window.SITE_ROOT ? window.SITE_ROOT : '/';

    self.endpoints = {
        talks: SITE_ROOT + "ajax/chat/conversations.json",
        user: SITE_ROOT + "ajax/chat/user.json",
        post: SITE_ROOT + "ajax/chat/post.json",
        read: SITE_ROOT + "ajax/chat/mark-read.json",
        search: SITE_ROOT + "ajax/chat/search-users.json",
        //formats: SITE_ROOT + "ajax/valid-file-formats.json",
        upload_signature: SITE_ROOT + "ajax/upload-signature.json?folder=" + encodeURIComponent('uploads/messages') + "&use_filename=1",
        purge: SITE_ROOT + "ajax/chat/purge.json"
    };

    self.readDelay = 1000;
    self.maxFileSize = 5242880; // 5 Mb

    self.activeTab = null;

    self.chatWindow = $('<div class="modal fade" tabindex="-1" role="dialog" style="bottom:5%;overflow:hidden;">' +
        '<div class="modal-dialog modal-lg" style="transition: transform .1s ease-out;"></div>' +
        '</div>')
        .on("hidden.bs.modal", function () {
            self.activeTab.html.detach();
            if ("onClose" in self.activeTab) self.activeTab.onClose();
            self.activeTab = null;
        });

    self.openWindow = function () {
        if (self.chatWindow.is(":hidden")) {
            self.chatWindow.modal('show');
        }
        return self.chatWindow;
    };

    self.error = function (text) {
        if (typeof toastr === "object") {
            toastr.error(text);
        } else {
            alert(text);
        }
    };

    self.getTimestamp = function (ts) {
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
    };

    self.tabUserChat = (function () {
        var currentUser, currentTalkee, activeReadDelay,
            imageFileFormats = ["jpg", "jpeg", "gif", "png"],
            originalValues = {},
            tab = {},
            inProgress = false,
            isFinished = false;

        tab.html = tab.body = tab.form = tab.input = tab.msgTpl = null;

        tab.load = function (talkeeId, start) {
            start = start || 0;
            talkeeId = talkeeId || (currentTalkee ? currentTalkee.user_id : null);
            if (!talkeeId) {
                console.log("No user id.")
                return;
            }
            inProgress = true;
            $.getJSON(self.endpoints.user + "?talkee=" + talkeeId + "&start=" + start, tab.render);
        };

        tab.open = function (options) {
            tab.init();
            tab.body.empty();
            $("h4", tab.html).text(options.username ? options.username : '');
            tab.load(options.userId);
            return tab;
        };

        tab.onOpen = function(){
            tab.initOnDrop();
            tab.input.focus();
        };

        tab.fire = function (e, data) {
            switch (e) {
                case "new-message":
                    tab.render(data);
                    break;
                case "messages-read":
                    $(".fa-check", tab.body).show();
                    break;
            }
        };

        tab.render = function (data) {
            tab.init();
            if (data.me) currentUser = data.me;
            if (data.talkee) currentTalkee = data.talkee;

            if (!currentUser || !currentTalkee) {
                tab.body.html('<div class="alert alert-danger">Sorry, something went wrong. Please, try again.</div>');
                return;
            }

            $("h4", tab.html).text(currentTalkee.display_name);

            var result = data.messages.map(function (msg) {
                msg.sender = msg.me ? currentUser : currentTalkee;
                return tab.msgTpl(msg);
            }).join("");

            result = $(result);

            if (data.start) {
                var sH = tab.body[0].scrollHeight, sT = tab.body[0].scrollTop;
                tab.body.prepend(result);
                tab.body[0].scrollTop = tab.body[0].scrollHeight - sH + sT;
            } else {
                tab.body
                    .append(result)
                    .css({height: $(window).height() * 0.7})
                    .scrollTop(tab.body[0].scrollHeight);
            }

            var unread = $(".alert-success", result);

            if (unread.length) {
                activeReadDelay = setTimeout(function () {
                    activeReadDelay = null;
                    $.post(self.endpoints.read, {talkee: currentTalkee.user_id}, function (res) {
                        unread.addClass("alert-warning").removeClass("alert-success");
                        self.updateNotifier(res.unread);
                    });
                }, self.readDelay);
            }

            inProgress = false;

            if (data.messages.length === 0) {
                isFinished = true;
            }
        };

        tab.onClose = function () {
            if (activeReadDelay) {
                clearTimeout(activeReadDelay);
                activeReadDelay = null;
            }
            tab.resetOnDrop();
            currentTalkee = null;
            inProgress = false;
            isFinished = false;
        };

        tab.postMessage = function (message) {
            if (!currentTalkee) {
                console.log("No user data.")
                return;
            }
            return $.post(self.endpoints.post, {
                msg_descr: message,
                talkee: currentTalkee.user_id
            }, function (messages) {
                tab.render({messages: messages});
            });
        };

        tab.progress = $('<div class="clearfix pull-right" style="width:80%;padding-bottom:10px;"><span class="label label-success">Uploading, please wait...</span></div>');

        tab.initOnDrop = function () {
            if (originalValues["d.ondrop"]) return;

            // Save original values in order to restore them after closing
            originalValues["d.ondrop"] = document.ondrop;
            originalValues["w.ondragover"] = window.ondragover;
            originalValues["w.ondrop"] = window.ondrop;

            document.ondrop = function (e) {
                e.preventDefault();
                tab.body.scrollTop(tab.body[0].scrollHeight);
                tab.sendFiles(e.dataTransfer.files);
                tab.body.removeClass("chat-dragover");
                return false;
            };

            window.ondragover = window.ondrop = function (e) {
                e.preventDefault();
                return false;
            };
        };

        tab.resetOnDrop = function () {
            if (originalValues["d.ondrop"]) {
                document.ondrop = originalValues["d.ondrop"];
                window.ondragover = originalValues["w.ondragover"];
                window.ondrop = originalValues["w.ondrop"];
                originalValues["d.ondrop"] = originalValues["w.ondragover"] = originalValues["w.ondrop"] = null;
            }
        };

        tab.sendFiles = function (files) {
            if (!files || !files.length) {
                return;
            }

            if (!currentTalkee) {
                console.log("No user data.")
                return;
            }

            tab.progress.appendTo(tab.body);
            tab.body.scrollTop(tab.body[0].scrollHeight);

            var cloudinary = null;

            $.ajax({
                url: self.endpoints.upload_signature,
                success: function (result, status, xhr) {
                    if (!result || !result.signature) {
                        fameuz.error(null, 'Cloudinary config request failed: ' + xhr.responseText);
                        return;
                    }
                    cloudinary = result;
                    console.log(cloudinary);
                },
                async: false
            });

            if (!cloudinary || !cloudinary.signature) {
                fameuz.error('Network error.');
                return;
            }

            var formDataCount = 0, formData, ext, uploadUrl,
                imageFormats = ["jpg", "jpeg", "gif", "png"],
                q = $.ajaxMultiQueue(3),
                attachments = [],
                postAttachments = function(){
                    if (!attachments.length) {
                        tab.progress.detach();
                        self.error("Sorry, unable to upload the file.");
                        return;
                    }
                    var formData = new FormData();
                    formData.append("talkee", currentTalkee.user_id);
                    formData.append("_files", JSON.stringify(attachments));

                    // queue up an ajax request
                    $.ajax({
                        url: self.endpoints.post,
                        data: formData,
                        processData: false,
                        contentType: false,
                        timeout: 3000,
                        type: 'POST',
                        success: function (data) {
                            tab.render({messages: data});
                            tab.progress.detach();
                        },
                        error: function () {
                            self.error("Sorry, unable to upload the file.");
                            tab.progress.detach();
                        }
                    });
                };


            for (var i = 0; i < files.length; i++) {
                if (files[i].size > self.maxFileSize) continue;
                ext = files[i].name.split(".");
                ext = ext[ext.length - 1].toLowerCase();
                if (cloudinary.allowed_formats && cloudinary.allowed_formats.indexOf(ext) === -1) continue;

                formData = new FormData();
                formData.append('api_key', cloudinary.api_key);
                formData.append('signature', cloudinary.signature);
                formData.append("file", files[i], files[i].name);
                $.each(cloudinary.params, function (k, v) {
                    formData.append(k, v);
                });
                formDataCount++;

                uploadUrl = imageFormats.indexOf(ext) > -1 ? cloudinary.url : cloudinary.url_raw;

                // queue up an ajax request
                q.queue({
                    url: uploadUrl,
                    data: formData,
                    contentType: false,
                    processData: false,
                    timeout: 3000,
                    type: 'POST',
                    success: function (data) {
                        attachments.push(data);
                        formDataCount--;
                        if (!formDataCount) postAttachments();
                    },
                    error: function(){
                        formDataCount--;
                        if (!formDataCount) postAttachments();
                    }
                });
            }

            if (!formDataCount) {
                tab.progress.detach();
                self.error("Please, choose image, document or archive files under 5 MB.");
                return;
            }
        };

        tab.init = function () {
            if (tab.html) return;

            var dropdown = '<div class="btn-group" style="float:right;">' +
                '<button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                '<i class="fa fa-trash-o" aria-hidden="true"></i>' +
                '</button>' +
                '<ul class="dropdown-menu dropdown-menu-right">' +
                '<li><a href="#" data-action="archive">Remove the conversation?</a></li>' +
                '</ul>' +
                '</div>';

            tab.html = $('<div class="modal-content" style="height:100%;">' +
                '<div class="modal-header">' +
                '<button type="button" aria-label="Go back" class="btn btn-default btn-sm" style="float:left;"><i class="fa fa-chevron-left" aria-hidden="true"></i></button>' +
                '<button type="button" class="btn btn-default btn-sm" style="float:right;margin-left:7px;" data-dismiss="modal" aria-label="Close"><i class="fa fa-times" aria-hidden="true"></i></button>' +
                dropdown +
                '<h4 class="modal-title" style="text-align:center;width:calc(100% - 100px);margin:0 auto;"></h4>' +
                '</div>' +
                '<div class="modal-body modal-body-chat clearfix" style="overflow-y: auto;max-height: calc(100% - 142px);">' +
                '</div>' +
                '<form class="modal-footer" style="text-align:left;margin-top:0;" action="' + self.endpoints.post + '">' +
                '<div class="row">' +
                '<div class="col-xs-9 col-sm-10">' +
                '<textarea class="form-control" placeholder="Enter a message" style="height:56px;width:100%;"></textarea>' +
                '</div>' +
                '<div class="col-xs-3 col-sm-2">' +
                '<button type="submit" class="btn btn-info btn-info-chat">Send</button>' +
                '<label class="chat-form-label" style="display:block;margin:5px 0 0;">' +
                '<input type="file" name="upload[]" style="display:none;">' +
                '<a style="cursor:pointer;font-weight:normal;">Send a file</a>' +
                '</label>' +
                '</div>' +
                '</div>' +
                '</form>' +
                '</div>');

            tab.body = $(".modal-body", tab.html).first();
            tab.form = $("form", tab.html).first();
            tab.input = $("textarea", tab.form).first();

            var winBRRegex = new RegExp("\\r", "g"),
                multBRRegex = new RegExp("[\\n]{2,}", "g"),
                singleBRRegex = new RegExp("\\n", "g");

            var fileSize = function(size) {
                var i = Math.floor(Math.log(size) / Math.log(1024));
                return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' +['B', 'kB', 'MB', 'GB', 'TB'][i];
            }

            tab.msgTpl = function (data) {
                if (!data.msg_descr) {
                    if (data.attachments && data.attachments.length) {
                        data.msg_descr = "";

                        data.attachments.forEach(function (a, i) {
                            if (data.thumbs && data.thumbs[i]) {
                                data.msg_descr += '<a href="' + a + '" target="_blank" class="chat-image-thumb"><img src="' + encodeURI(data.thumbs[i].url) + '" width="' + data.thumbs[i].width + '" height="' + data.thumbs[i].height + '"></a>';
                            } else {
                                var file = a.split("/");
                                file = file[file.length - 1];
                                data.msg_descr += '<div class="chat-file-link">' +
                                    '<a href="' + a + '">' +
                                    '<i class="fa fa-download" aria-hidden="true"></i> ' +
                                    file +
                                    (data.attachment_size[i] ? ' (' + fileSize(data.attachment_size[i]) + ')' : '') +
                                    '</a>' +
                                    '</div>';
                            }
                        });
                    }
                }

                return '<div style="width:80%;" class="clearfix chat-msg  ' + (data.me ? "chat-msg-my pull-right" : "pull-left") + '" data-msg-id="' + data.msg_id + '"' + (data.msg_descr ? '' : ' style="display:none;"') + '>' +
                    '<a href="' + data.sender.profile + '">' +
                    '<img src="' + data.sender.pic + '" style="float:left;margin-right:12px;">' +
                    data.sender.display_name +
                    '</a>' +
                    '<small class="pull-right small-chat">' +
                    (data.me ? '<i class="fa fa-check" aria-hidden="true" ' +
                    (data.msg_read_status == 0 ? ' style="display:none;"' : "") +
                    '></i> ' : "") +
                    self.getTimestamp(data.msg_created_date) +
                    '</small>' +
                    '<div class="alert alert-' + (data.me ? 'info' : (data.msg_read_status == 0 ? 'success' : 'warning')) + '">' +
                    data.msg_descr.trim()
                        .replace(winBRRegex, "")
                        .replace(multBRRegex, '<br><br>')
                        .replace(singleBRRegex, '<br>') +
                    '</div>' +
                    '</div>';
            };

            tab.html.find("button").first().on("click", self.showTalks);

            tab.html.find("[data-action='archive']").on("click", function (e) {
                e.preventDefault();
                $.post(self.endpoints.purge, {talkee: currentTalkee.user_id}, function () {
                    self.showTalks();
                });
            });

            tab.form.on("submit", function (e) {
                e.preventDefault();
                var input = this.getElementsByTagName("textarea").item(0);
                tab.postMessage(input.value);
                input.value = "";
            });

            tab.input.on("keydown", function (e) {
                if (e.keyCode === 10 || e.keyCode === 13) {
                    if (e.ctrlKey) {
                        this.value += "\n";
                        return false;
                    }
                    e.preventDefault();
                    tab.form.submit();
                }
            });

            $("[type='file']", tab.form).on("change", function () {
                    tab.sendFiles(this.files);
                });

            tab.html.on("dragover", function () {
                tab.body.addClass("chat-dragover");
            }).on("dragleave", function () {
                tab.body.removeClass("chat-dragover");
            });

            self.chatWindow.on("hidden.bs.modal", tab.onClose);
            self.chatWindow.on("shown.bs.modal", function(){
                tab.input.focus();
                tab.body.scrollTop(tab.body[0].scrollHeight);
            });

            tab.body.on("scroll", function () {
                if (!inProgress && !isFinished && this.scrollTop <= this.clientHeight / 3) {
                    tab.load(null, tab.body[0].children.length - 1);
                }
            });
        };

        return tab;
    })();

    self.tabChatList = (function () {
        var tab = {};

        tab.html = tab.itemTpl = null;

        tab.open = function () {
            tab.init();
            tab.search.val()
                ? tab.searchUser()
                : $.getJSON(self.endpoints.talks, tab.render);
            return tab;
        };

        tab.fire = function (e, data) {
            switch (e) {
                case "new-message":
                    tab.open();
                    break;
            }
        };

        tab.render = function (data) {
            if (!data || !data.talks) {
                return;
            }
            var result = data.talks.map(tab.itemTpl).join("");
            tab.body.html(result);
        };

        tab.searchUser = function () {
            tab.reset.show();
            var search = tab.search[0].value.trim();
            $.getJSON(self.endpoints.search + "?search=" + encodeURIComponent(search), function (data) {
                tab.render({talks: data});
            });
        };

        tab.init = function () {
            if (tab.html) return;

            tab.html = $('<div class="modal-content">' +
                '<div class="modal-header">' +
                '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                '<h4 class="modal-title" style="text-align:center;">Recent chats</h4>' +
                '<form class="navbar-form" role="search" style="width:100%;text-align:center;">' +
                '<div class="form-group" style="position:relative;">' +
                '<input type="text" class="form-control" placeholder="Enter a name" style="width:200px;">' +
                '<a style="pointer-events: auto; text-decoration: none; cursor: pointer; position: absolute; font-size: 14px;padding:10px;top:0;right:0;" class="fa fa-times" aria-hidden="true"></a>' +
                '</div>' +
                '</form>' +
                '</div>' +
                '<div class="list-group" style="overflow-y: auto;"></div>' +
                '</div>');

            tab.body = $(".list-group", tab.html).first();
            tab.search = $("input", tab.html).first();
            tab.reset = $(".fa-times", tab.html).first().hide();

            tab.itemTpl = function (data) {
                return '<a href="#" class="list-group-item ' + (data.msg_read_status ? '' : 'list-group-item-info') + ' clearfix" data-user-id="' + data.user_id + '" data-username="' + data.display_name + '">' +
                    '<img src="' + data.profile_image + '" style="float:left;margin-right:12px;" width="50" height="50">' +
                    '<h4 class="list-group-item-heading">' +
                    data.display_name +
                    (data.chatStatus ? ' <span style="color:green">&middot;</span>' : '') +
                    '</h4>' +
                    '<p class="list-group-item-text">' +
                    (data.msg_descr || "") +
                    '</p>' +
                    '</a>';
            };

            tab.html.on("click", ".list-group-item", self.showTalk);

            tab.search.on("keyup", function () {
                if (this.value.trim()) {
                    tab.searchUser();
                } else {
                    tab.open();
                    this.focus();
                    tab.reset.hide();
                }
            });

            tab.reset.on("click", function () {
                tab.search.val("").trigger("keyup");
            });

            self.chatWindow.on("hidden.bs.modal", function () {
                tab.search.val("");
            });
        };

        return tab;
    })();

    var $chatModal = $(self.chatWindow[0].firstElementChild);

    var openTab = function (tab, options) {
        if (self.activeTab) {
            self.activeTab.html.detach();
            if ("onClose" in self.activeTab) self.activeTab.onClose();
        }
        self.activeTab = tab.open(options);
        self.openWindow();
        $chatModal.append(self.activeTab.html);
        if ("onOpen" in self.activeTab) self.activeTab.onOpen();
    };

    self.showTalks = function (e) {
        openTab(self.tabChatList);
    };

    self.showTalk = function (e) {
        openTab(self.tabUserChat, this.dataset);
    };

    var msgNotifier = document.getElementById("message_notofication_head");

    self.updateNotifier = function (count) {
        if (!msgNotifier) return;

        if (count == 0) {
            $(msgNotifier).empty();
            return;
        }

        if (msgNotifier.firstElementChild) {
            msgNotifier.firstElementChild.textContent = count;
        } else {
            $("<sup></sup>").text(count).appendTo(msgNotifier);
        }
    };

    if (server && userId && typeof Faye === "object") {
        new Faye.Client(server).subscribe('/user/' + userId, function (res) {
            if (self.activeTab && res.event) {
                self.activeTab.fire(res.event, res);
            }
            if (msgNotifier && "unread" in res) {
                self.updateNotifier(res.unread);
            }
        });

    }

    self.started = true;
    return self;
};