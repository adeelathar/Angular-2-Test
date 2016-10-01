// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

	"use strict";
		// Create the defaults once
		var pluginName = "faemuzpopBox",
				defaults = {
					width : 300,
					height : 200,
					onReady: function() {},
					async : true,
					ajax: {
						url : '',
						type: '',
						data: '',
						dataType : '',
						cache: false,
						beforeSend: function(){},
						sucess: function(){},
						error: function(){},
					},
					complete: function(){},
		};

		// The actual plugin constructor
		function Plugin ( element, options ) {
				this.element = element;
				this.settings = $.extend( {}, defaults, options );
				this._defaults = defaults;
				this._name = pluginName;
				this.init();
		}

		// Avoid Plugin.prototype conflicts
		$.extend(Plugin.prototype, {
				init: function () {
					var self	=	this;
					self.cycle();
				},
				cycle: function(){
					var self	= this;
					self.cacheObj();
					self.setFrag();
					self.eventHandle();
				},
				cacheObj: function(){
					//cache jQery Objects
					var self	=	this;
					
					self.popBoxBg	=	$('.fameuz_popBox');
					self.contianer	=	$('.fameuz_popBox_container');
					self.popBoxBody	=	$('.fameuz_popBox_body');
					self.close		=	$('.popBox_close');
					
					// cache Measurments
					
				},
				eventHandle: function(){
					var self	=	this;
					$(self.element).bind('click', function(){
						self.popBoxBg.show();
						setTimeout(function(){
							self.contianer.addClass('orginalScaleSize');
						},100);
						self.settings.onReady.call(this);
						if(self.settings.async == true){
							self.ajaxCall();
						}
					});
					self.close.bind('click', function(){
						self.popBoxBg.hide();
					});
					$(window).resize(function(e) {
                        self.setFrag();
                    });
				},
				setFrag: function () {
					var self	=	this;
					self.windowWidth	=	$(window).width();
					self.windowHeight	=	$(window).height();
					var Alterwidth	=	(self.settings.width> self.windowWidth)?parseInt(self.windowWidth - 50): self.settings.width;
					var AlterHeight	=	(self.settings.height> self.windowHeight)?parseInt(self.windowHeight - 50): self.settings.height;
					var topMargin	=	parseInt((self.windowHeight - AlterHeight)/2);
					var leftMargin	=	parseInt((self.windowWidth - Alterwidth)/2);
					self.contianer.css({width:Alterwidth,height:AlterHeight,top:topMargin,left:leftMargin});
					self.popBoxBody.css({width:Alterwidth,height:(AlterHeight-70),top:30});
					self.popBoxBody.perfectScrollbar();
				},
				ajaxCall: function(){
					var self	=	this;
					 	$.ajax({
						url : self.settings.ajax.url,
						type: self.settings.ajax.type,
						data: self.settings.ajax.data,
						dataType:self.settings.ajax.dataType,
						cache: self.settings.ajax.cache,
						beforeSend: function(){self.settings.ajax.beforeSend.call(this)},
						success: function(data){self.settings.ajax.sucess.call(this, data)},
						error: function(){self.settings.ajax.error.call(this)},
					});
				},
				clear: function(){
					
					function unbindHandler(obj){
						var obJlength	=	obj.length;
						for(var i=0; i<obJlength; i++){
							$(obj[i]).unbind('click');
						}
					}
				},
		});
		$.fn[ pluginName ] = function ( options ) {
				return this.each(function() {
						if ( !$.data( this, "plugin_" + pluginName ) ) {
								$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
						}
				});
		};

})( jQuery, window, document );
