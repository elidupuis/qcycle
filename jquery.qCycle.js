/**
 *	jQuery qCycle plugin
 *	@version 0.3
 *	@date Nov 10, 2009
 *	@author Eli Dupuis
 *	@license Creative Commons Share Alike 2.5 Canada (http://creativecommons.org/licenses/by-sa/2.5/ca/)
 *	Requires: jQuery v1.3.2 or later (most likely works fine with earlier versions, but untested)
 *	Requires: jquery Cycle plugin by Mike Alsup (http://www.malsup.com/jquery/cycle/)
 *				uses jquery.cycle.addSlide() function which is not supported in jquery.cycleLite (http://www.malsup.com/jquery/cycle/lite/)
 *
 *	CHANGLOG:
 *	v0.3
	-added 'start' option. can be either 'pageload' or 'immediate'. immediate is equivalent to domReady since you should not be calling qCycle before the DOM is ready. pageload waits for the rest of the page to load (fired on window.load)
 *
 *  TODO: support JSON import for data...
 *	TODO: add ability to pass in a simple array of image filepaths--no need for extra data, just images.
*/

(function($) {

var ver = '0.3';

$.fn.qCycle = function(options) {

	// build main options before element iteration:
	var opts = $.extend({}, $.fn.qCycle.defaults, options);

	return this.each(function() {
		$this = $(this);
		// build element specific options:
		var o = $.meta ? $.extend({}, opts, $this.data()) : opts;
		$this.data('qCycle.opts',o);

		if (opts.start == 'immediate') {
			initSlideshow($this);
		}else{
			$(window).load(function(){
				initSlideshow($this);
			});
		};

	});
};

function initSlideshow(obj){
	var o = obj.data('qCycle.opts');
	obj.data( 'qCycle.slidesLoaded', 0 );
	
	var loaded = obj.data( 'qCycle.slidesLoaded' );

	if (o.toLoad != null) $('<img/>').load(function(){ 
			addSlide($(this),obj,true);
		}).data(
			'qCycle.slideData',o.toLoad[loaded]
		).attr(
			'src',o.toLoad[loaded].img
		);
	
	obj.data( 'qCycle.slidesLoaded', obj.data( 'qCycle.slidesLoaded' )+1 );
	
};

function startSlideshow(obj){
	var o = obj.data('qCycle.opts');
	var loaded = obj.data( 'qCycle.slidesLoaded' );

	//	homepage feature cycle
	var slideshow = obj.cycle(o.cycleOpts);		//	start cycle
	obj.data('qCycle.cycleOpts', $(slideshow).data('cycle.opts'));	//	grab reference to cycle so we can use cycle.addSlide() later

	if (loaded < obj.data('qCycle.opts').toLoad.length) loadSlide(obj);
	obj.data( 'qCycle.slidesLoaded', obj.data( 'qCycle.slidesLoaded' )+1 );		//	increment loaded counter
};

function loadSlide(obj){
	var loaded = obj.data( 'qCycle.slidesLoaded' );
	
	$('<img/>').load(function(){ 
			addSlide($(this),obj);
		}).data(
			'qCycle.slideData',obj.data('qCycle.opts').toLoad[loaded]
		).attr(
			'src',obj.data('qCycle.opts').toLoad[loaded].img
		);
};

function addSlide(img,obj,init){
	
	var cycleOpts = obj.data('qCycle.cycleOpts');

	var slide = obj.data('qCycle.opts').createSlide.call(this,img);

	//	add newly loaded slide:
	if (init == true) {
		//	first pass. use standard jquery.append because cycle is not initialized yet.
		obj.append(slide);
		startSlideshow(obj);
	}else{
		//	not first pass. add slide via cycle.addSlide() function:
		cycleOpts.addSlide(slide);
	};
	
	//	update counters and initiate loading of next image (if there's more tho load!):
	var loaded = obj.data( 'qCycle.slidesLoaded' );
	if (loaded < obj.data('qCycle.opts').toLoad.length ) loadSlide(obj);
	obj.data( 'qCycle.slidesLoaded', obj.data( 'qCycle.slidesLoaded' )+1 );
	
};


//
// plugin defaults
//
$.fn.qCycle.defaults = {
	toLoad: null,									//	array of objects. each object must have attribute 'img' that contains the url of an image to load.
	cycleOpts:{},									//	passed directly into jQuery.cycle on init. see http://www.malsup.com/jquery/cycle/options.html for options.
	createSlide: function(img){	return img;	},		//	function where slides are created. default just returns the loaded image.
	start: 'pageload'								//	one of ['pageload', 'immediate']
};

//	public function/method
$.fn.qCycle.ver = function() { return "jquery.qCycle version " + ver; };


})(jQuery);