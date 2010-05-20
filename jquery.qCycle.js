/**
 *	jQuery qCycle plugin
 *	@version 0.7
 *	@date April 16, 2010
 *	@author Eli Dupuis
 *	@license Creative Commons Share Alike 2.5 Canada (http://creativecommons.org/licenses/by-sa/2.5/ca/)
 *	Requires: jQuery v1.3.2 or later (most likely works fine with earlier versions, but untested)
 *	Requires: jquery Cycle plugin by Mike Alsup (http://www.malsup.com/jquery/cycle/)
 *				uses jquery.cycle.addSlide() function which is not supported in jquery.cycleLite (http://www.malsup.com/jquery/cycle/lite/)
 *
 *	CHANGLOG:
 *	v0.7
	-complete restructuring of code.
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
*/

(function($) {

var ver = '0.7';

$.fn.qCycle = function(options) {

	// build main options before element iteration:
	var opts = $.extend({}, $.fn.qCycle.defaults, options);

	return this.each(function() {
		var $this = $(this);
		var qcycle = {
			slidesLoaded: 0,
			toLoad: opts.toLoad,	//	bascially because we allow json, original opts.toLoad will always contain the initial data (array or url string), while qcycle.toLoad will contain the actual data array
			malsupOpts: null,
			
			initSlideshow: function() {
 				try {
					//	define image onLoad action:
					var theImage = $('<img/>').load(function(){ 
						qcycle.addSlide($(this));
					});

					//	check for JSON. here we assume that a simple string is a URL that will return JSON:
					if (opts.toLoad.constructor.name === 'String') {

						//	get json from url:
						$.getJSON(opts.toLoad, function(json){

							//	store result on qcycle object
							qcycle.toLoad = json;
							
							//	check if json returned an array - for low level debuggin help:
							if (json.constructor.name === 'Array') {
								
								//	set image source to initialize loading:
								qcycle.setImageSource(theImage);
								
							}else{
								if(window.console) window.console.error($.fn.qCycle.ver(), ': JSON must return an Array. Currently returning', json.constructor.name);
							};
							
						});

					//	otherwise assume we have an array of data to deal with:
					}else{
						//	set image source to initialize loading:
						qcycle.setImageSource(theImage);
					};
					
				} catch(error) {
					//	this could be a different error, but toLoad option is most likely.
					if(window.console) window.console.error($.fn.qCycle.ver(), ': toLoad option is not set.');
				}

				//	increment number of slides loaded:
				qcycle.slidesLoaded++;
			},
			
			initCycle: function () {
				//	start cycle:
				$this.cycle(opts.cycleOpts);

				//	retrieve jquery.cycle options now that cycle has been initialized:
				this.malsupOpts = $this.data('cycle.opts');
				
				//	if there's more slides to load, do it:
				if (qcycle.slidesLoaded < qcycle.toLoad.length) qcycle.loadSlide();

			},
			
			addSlide: function (img) {
				
				//	call the createSlide function (as defined in user options):
				var slide = opts.createSlide.call(this, img, qcycle.slidesLoaded);

				//	add newly loaded slide:
				if (!this.malsupOpts) {
					//	first pass. use standard jquery.append because cycle is not initialized yet.
					$this.append(slide);
					
					//	initialize malsup's jquery.cycle
					qcycle.initCycle();

				}else{
					//	not first pass. add slide via cycle.addSlide() function:
					this.malsupOpts.addSlide(slide);

				};

				//	update counters and initiate loading of next image (if there's more to load):
				qcycle.slidesLoaded++;
				if (qcycle.slidesLoaded < qcycle.toLoad.length ) qcycle.loadSlide();

			},

			loadSlide: function () {
				
				//	create image node, attach load functionality:
				var theImage = $('<img/>').load(function(){ 
						qcycle.addSlide($(this));
				});
				
				//	set image source to initiate image preloading:
				qcycle.setImageSource(theImage);
			},
			
			setImageSource: function(img){
				//	store user's custom data on the image that is loaded so it can be accessed from createSlide function:
				img.data('qCycle.slideData', qcycle.toLoad[qcycle.slidesLoaded]);

				if (qcycle.toLoad[qcycle.slidesLoaded][opts.imageKey]) {
					//	if opts.imageKey exists, we have custom data structure:
					img.attr( 'src', qcycle.toLoad[qcycle.slidesLoaded][opts.imageKey] );
					
				}else{
					//	if opts.imageKey does not exist, we are dealing with images only, not custom data structure
					img.attr( 'src', qcycle.toLoad[qcycle.slidesLoaded] );
					
				};
			}
			
		};

		//	start the action here
		if (opts.onPageLoad) {
			$(window).load(function(){
				qcycle.initSlideshow();
			});
		}else{
			qcycle.initSlideshow();
		};

	});
};

// plugin defaults
$.fn.qCycle.defaults = {
	toLoad: null,
	cycleOpts: {},
	createSlide: function(img){	return img;	},
	onPageLoad: true,
	imageKey: 'img'
};

//	public function/method
$.fn.qCycle.ver = function() { return "jquery.qCycle version " + ver; };

})(jQuery);