/**************************************************************
	* youRhere v1.0 - jQuery Plugin
	* http://yourhere.gandtblog.com/
	* Copyright 2012, Daniel Sternlicht
	* http://www.danielsternlicht.com
	* Dual licensed under the MIT or GPL Version 2 licenses.		
	* Enjoy :)
***************************************************************/

(function($) {
	
	// youRhere jQuery plugin
	$.yourhere = {
		
		init: function(options, box) {			
			$.yourhere.box = box;			
			var boxLineHeight = box.css('fontSize').replace('px', '');
			var basicZindex = box.css('z-index') != 'auto' ? parseInt(box.css('z-index')) : 10;			
			
			// Check the container has position and set a default if not
			if(box.css('position') == 'static') box.css('position', 'relative');	

			// Initialized the default settings
			$.yourhere.opts = $.extend({}, $.fn.yourhere.defaults, options);

			// Set a relative position to the container childrens
			box.children().css({zIndex: basicZindex + 2, position: 'relative'});
			
			$('<div class="yourhere-marker"></div>').hide().appendTo(box).css({
				position: 'absolute',
				zIndex: basicZindex + 3,
				width: $.yourhere.opts.markerWidth,
				cursor: 'pointer',
				background: $.yourhere.opts.markerBackground,
				height: boxLineHeight + 'px'		
			});
			
			$('<div class="yourhere-markerline"></div>').hide().appendTo(box).css({
				position: 'absolute',
				zIndex: basicZindex + 1,
				backgroundColor: $.yourhere.opts.markerLineBackground,
				opacity: $.yourhere.opts.markerBackgroundOpacity,
				height: boxLineHeight + 'px'		
			});												
			
			// Create the temporary marker
			$.yourhere.tempMarker(box, boxLineHeight, basicZindex);						
			
			// Events Listener
			$.yourhere.eventsHandeler(box, boxLineHeight);
						
		},
		
		eventsHandeler: function(box, boxLineHeight) {
			var boxOffset = box.offset().top;
			
			// Click event on an element
			box.children($.yourhere.opts.supportedElements).click(function(e){
				var lineHeight = $(this).css('lineHeight').replace('px', '') > $(this).css('fontSize').replace('px', '') ? $(this).css('lineHeight').replace('px', '') : $(this).css('fontSize').replace('px', '');	
				var elmOffset = $(this).offset().top;
				var z = e.pageY - elmOffset;
				var e = Math.floor(z / lineHeight);
				var y = elmOffset - boxOffset + (e * lineHeight);
				$.yourhere.markerCreator(box, y, lineHeight);
			});	

			// Mouse move event
			box.children().mousemove(function(e){
				var lineHeight = $(this).css('lineHeight').replace('px', '') > $(this).css('fontSize').replace('px', '') ? $(this).css('lineHeight').replace('px', '') : $(this).css('fontSize').replace('px', '');
				var y = e.pageY - boxOffset - (lineHeight / 2);
				if(e.pageY < boxOffset + lineHeight / 2 || e.pageY > box.height() + boxOffset) return;
				box.find('.yourhere-temp-marker').stop(true, true).animate({
					top: y,
					height: lineHeight + 'px'
				}, 'fast');
			});
			
			// Hide the marker
			box.find('.yourhere-marker').dblclick(function() {
				$(this).fadeOut('fast');
				box.find('.yourhere-markerline').fadeOut('fast');
			});
		},
		
		tempMarker: function(box, lineHeight, z) {
			$('<div class="yourhere-temp-marker"></div>').appendTo(box).css({
				position: 'absolute',
				zIndex: z + 1,
				width: $.yourhere.opts.markerWidth,
				height: lineHeight + 'px',				
				top: 0,
				background: $.yourhere.opts.tempMarkerBackground
			});
			box.find('.yourhere-temp-marker').css($.yourhere.opts.markerDirection, (-(box.find('.yourhere-temp-marker').width()) + 'px'));
		},
		
		markerCreator: function(box, y, lineHeight) {
			// Remove previus markers
			box.find('.yourhere-marker, .yourhere-markerline').fadeOut('fast');
			
			// Place the marker
			box.find('.yourhere-marker').stop(true, true)
			.fadeIn().css({
				height: lineHeight + 'px',				
				top: y				
			});		
			
			// Place the marker line
			box.find('.yourhere-markerline').stop(true, true)
			.fadeIn()
			.width(box.outerWidth() + box.find('.yourhere-marker').width())
			.css({
				height: lineHeight + 'px',				
				top: y				
			});
			
			// Give the marker left / right offset
			box.find('.yourhere-marker, .yourhere-markerline').css($.yourhere.opts.markerDirection, (-(box.find('.yourhere-marker').width()) + 'px'));
		},
		
		opts: {}
		
	}
	
	// Creating new instance for each call
	$.fn.yourhere = function( options ) {     
		var yourhere = new $.yourhere.init( options, this );        
    };
	
	// youRhere default properties
	$.fn.yourhere.defaults = {
		markerDirection: 'left',
		tempMarkerBackground: '#b7b7b7',
		markerLineBackground: '#FFF82A',
		markerBackgroundOpacity: '0.7',
		markerBackground: '#000',
		markerWidth: '5px',
		supportedElements: 'h1, h2, h3, h4, h5, h6, p, ul, li'
	}

})(jQuery);