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
			opts: opts,
			toLoad: opts.toLoad,
			
			initSlideshow: function() {
 				try {
					var theImage = $('<img/>').load(function(){ 
						qcycle.addSlide($(this));
					});

					//	check for JSON
					if (typeof(opts.toLoad) === 'string') {
						$.getJSON(opts.toLoad, function(json){
							qcycle.toLoad = json;
							qcycle.setImageSource(theImage);
						});
					}else{
						qcycle.setImageSource(theImage);
					};
				} catch(error) {
					if(window.console) window.console.error('$.qcycle toLoad option is null.');
				}

				this.slidesLoaded++;
			},
			
			initCycle: function () {
				//	start cycle
				$this.cycle(opts.cycleOpts);
				if (this.slidesLoaded < qcycle.toLoad.length) qcycle.loadSlide();
				this.slidesLoaded++;
			},
			
			addSlide: function (img) {
				var cycleOpts = $this.data('cycle.opts');
				
				var slide = qcycle.opts.createSlide.call(this,img);

				//	add newly loaded slide:
				if (!cycleOpts) {
					//	first pass. use standard jquery.append because cycle is not initialized yet.
					$this.append(slide);
					qcycle.initCycle();
				}else{
					//	not first pass. add slide via cycle.addSlide() function:
					cycleOpts.addSlide(slide);
				};

				//	update counters and initiate loading of next image (if there's more tho load!):
				var loaded = this.slidesLoaded;
				if (loaded < qcycle.toLoad.length ) qcycle.loadSlide();
				this.slidesLoaded++;

			},
			
			setImageSource: function(img){
				img.data('qCycle.slideData',qcycle.toLoad[qcycle.slidesLoaded]);

				if (qcycle.toLoad[qcycle.slidesLoaded][opts.imageKey]) {
					img.attr( 'src', qcycle.toLoad[qcycle.slidesLoaded][opts.imageKey] );
				}else{
					img.attr( 'src', qcycle.toLoad[qcycle.slidesLoaded] );
				};
			},

			loadSlide: function () {
				var theImage = $('<img/>').load(function(){ 
						qcycle.addSlide($(this));
				});
				// .data( 'qCycle.slideData', qcycle.toLoad[qcycle.slidesLoaded]	);	
				qcycle.setImageSource(theImage);
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