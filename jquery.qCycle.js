/**
 *	jQuery qCycle plugin
 *	@version 0.6
 *	@date April 12, 2010
 *	@author Eli Dupuis
 *	@license Creative Commons Share Alike 2.5 Canada (http://creativecommons.org/licenses/by-sa/2.5/ca/)
 *	Requires: jQuery v1.3.2 or later (most likely works fine with earlier versions, but untested)
 *	Requires: jquery Cycle plugin by Mike Alsup (http://www.malsup.com/jquery/cycle/)
 *				uses jquery.cycle.addSlide() function which is not supported in jquery.cycleLite (http://www.malsup.com/jquery/cycle/lite/)
 *
 *	CHANGLOG:
 *	v0.6
	-reverted namespacing of internal functions
	-added imageKey option. user can now customize the image path property in toLoad array.
	-added ability to pass in a url for the toLoad option. URL should return a JSON array. this still needs some clean up...
 *	v0.5
	-updated all internal functions to be within the $.fn.qCycle namespace
 *	v0.4
	-added ability to pass in an array of images only, as opposed to an array of objects containing image paths as well as other data. 
	-updated start property to be a boolean called onPageLoad. by default the plugin waits for $(window).load. set to false to run immediately
 *	v0.3
	-added 'start' option. can be either 'pageload' or 'immediate'. immediate is equivalent to domReady since you should not be calling qCycle before the DOM is ready. pageload waits for the rest of the page to load (fired on window.load)
 *
 *  TODO: support JSON import for data...
 *	TODO: optimize!
*/

(function($) {

var ver = '0.6';

$.fn.qCycle = function(options) {

	// build main options before element iteration:
	var opts = $.extend({}, $.fn.qCycle.defaults, options);

	return this.each(function() {
		$this = $(this);
		// build element specific options:
		var o = $.meta ? $.extend({}, opts, $this.data()) : opts;
		$this.data('qCycle.opts',o);

		if (opts.onPageLoad) {
			$(window).load(function(){
				initSlideshow($this);
			});
		}else{
			initSlideshow($this);			
		};

	});
};

function initSlideshow (obj) {
	var o = obj.data('qCycle.opts');
	obj.data( 'qCycle.slidesLoaded', 0 );
	
	var loaded = obj.data( 'qCycle.slidesLoaded' );
	
	if (o.toLoad != null) {
		var theImage = $('<img/>').load(function(){ 
			addSlide($(this),obj,true);
		});
		
		//	check for JSON
		if (typeof(o.toLoad) === 'string') {
			$.getJSON(o.toLoad, function(json){
				o.toLoad = json;
				setImageSource(theImage, o, loaded);
			});
		}else{
			setImageSource(theImage, o, loaded);
		};
		
	}
	
	obj.data( 'qCycle.slidesLoaded', obj.data( 'qCycle.slidesLoaded' )+1 );
	
};

function setImageSource(theImage, o, loaded){
	//	this has to be here because of first slide loaded dynamically.
	//	was having issues in initSlideshow with o.toLoad being the requested json url string, as opposed to actual data...
	theImage.data('qCycle.slideData',o.toLoad[loaded]);
	
	if (o.toLoad[loaded][o.imageKey]) {
		theImage.attr( 'src', o.toLoad[loaded][o.imageKey] );
	}else{
		theImage.attr( 'src', o.toLoad[loaded] );
	};
}

function startSlideshow (obj) {
	var o = obj.data('qCycle.opts');
	var loaded = obj.data( 'qCycle.slidesLoaded' );

	//	homepage feature cycle
	var slideshow = obj.cycle(o.cycleOpts);		//	start cycle
	obj.data('qCycle.cycleOpts', $(slideshow).data('cycle.opts'));	//	grab reference to cycle so we can use cycle.addSlide() later

	if (loaded < obj.data('qCycle.opts').toLoad.length) loadSlide(obj);
	obj.data( 'qCycle.slidesLoaded', obj.data( 'qCycle.slidesLoaded' )+1 );		//	increment loaded counter
};

function loadSlide (obj) {
	var o = obj.data('qCycle.opts');
	var loaded = obj.data( 'qCycle.slidesLoaded' );
	
	var theImage = $('<img/>').load(function(){ 
			addSlide($(this),obj);
		}).data(
			'qCycle.slideData',obj.data('qCycle.opts').toLoad[loaded]
		);
	
	setImageSource(theImage, o, loaded);
	// if (obj.data('qCycle.opts').toLoad[loaded][o.imageKey]) {
	// 		theImage.attr( 'src', obj.data('qCycle.opts').toLoad[loaded][o.imageKey] );
	// 	}else{
	// 		theImage.attr( 'src', obj.data('qCycle.opts').toLoad[loaded] );
	// 	};
	
};

function addSlide (img,obj,init) {
	
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
	toLoad: null,
	cycleOpts:{},
	createSlide: function(img){	return img;	},
	onPageLoad: true,
	imageKey: 'img'
};

//	public function/method
$.fn.qCycle.ver = function() { return "jquery.qCycle version " + ver; };


})(jQuery);