/**
 *	jQuery qcycle plugin
 *	@version 0.8
 *	@date May 20, 2010
 *	@author Eli Dupuis
 *	@license Creative Commons Share Alike 2.5 Canada (http://creativecommons.org/licenses/by-sa/2.5/ca/)
 *	Requires: jQuery v1.3.2 or later (most likely works fine with earlier versions, but untested)
 *	Requires: jquery Cycle plugin by Mike Alsup (http://www.malsup.com/jquery/cycle/)
 *				uses jquery.cycle.addSlide() function which is not supported in jquery.cycleLite (http://www.malsup.com/jquery/cycle/lite/)
*/

(function($) {

var ver = '0.8';

$.fn.qcycle = function(options) {

	// build main options before element iteration:
	var opts = $.extend({}, $.fn.qcycle.defaults, options);


	var $this = $(this);
	var qcycle = {
		slidesLoaded: 0,
		slideData: opts.slideData,	//	bascially because we allow json, original opts.slideData will always contain the initial data (array or url string), while qcycle.slideData will contain the actual data array
		malsupOpts: null,

		initPlugin: function() {
				try {
				//	define image onLoad action:
				var theImage = $('<img/>').load(function(){ 
					qcycle.addSlide($(this));
				});

				//	check for JSON. here we assume that a simple string is a URL that will return JSON:
				if (opts.slideData.constructor.name === 'String') {

					//	get json from url:
					$.getJSON(opts.slideData, function(json){

						//	store result on qcycle object
						qcycle.slideData = json;
						
						//	check if json returned an array - for low level debuggin help:
						if (json.constructor.name === 'Array') {
							
							//	set image source to initialize loading:
							qcycle.setImageSource(theImage);
							
						}else{
							if(window.console) window.console.error($.fn.qcycle.ver(), ': JSON must return an Array. Currently returning', json.constructor.name);
						};
						
					});

				//	otherwise assume we have an array of data to deal with:
				}else{
					//	set image source to initialize loading:
					qcycle.setImageSource(theImage);
				};
				
			} catch(error) {
				//	this could be a different error, but slideData option is most likely.
				if(window.console) window.console.error($.fn.qcycle.ver(), ': slideData option is not set.');
			}

		},
		
		initCycle: function () {
			//	start cycle:
			$this.cycle(opts.cycleOpts);

			//	retrieve jquery.cycle options now that cycle has been initialized:
			this.malsupOpts = $this.data('cycle.opts');

		},
		
		addSlide: function (img) {
			// if(window.console) window.console.log('addSlide(), qcycle.slidesLoaded:', qcycle.slidesLoaded);

			//	increment count for slides loaded
			qcycle.slidesLoaded++;
			
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

			//	initiate loading of next image (if there's more to load):
			if (qcycle.slidesLoaded < qcycle.slideData.length ) {
				//	load next image:
				qcycle.loadSlide();
				
			}else{
				//	fire onComplete callback
				opts.onComplete.call(this, qcycle.slidesLoaded);
				
			}
			
		},

		loadSlide: function () {
			// if(window.console) window.console.log('loadSlide(), qcycle.slidesLoaded:', qcycle.slidesLoaded);
			
			//	create image node, attach load functionality:
			var theImage = $('<img/>').load(function(){ 
					qcycle.addSlide($(this));
			});
			
			//	set image source to initiate image preloading:
			qcycle.setImageSource(theImage);
		},
		
		setImageSource: function(img){
			
			// if(window.console) window.console.log('setImageSource(), qcycle.slidesLoaded:', qcycle.slidesLoaded);
			
			//	store user's custom data on the image that is loaded so it can be accessed from createSlide function:
			img.data('qcycle.slideData', qcycle.slideData[qcycle.slidesLoaded]);

			if (qcycle.slideData[qcycle.slidesLoaded][opts.imageKey]) {
				//	if opts.imageKey exists, we have custom data structure:
				img.attr( 'src', qcycle.slideData[qcycle.slidesLoaded][opts.imageKey] );
				
			}else{
				//	if opts.imageKey does not exist, we are dealing with images only, not custom data structure
				img.attr( 'src', qcycle.slideData[qcycle.slidesLoaded] );
				
			};
		}
		
	};

	return this.each(function() {
		//	start the action here
		if (opts.defer) {
			$(window).load(function(){
				qcycle.initPlugin();
			});
		}else{
			qcycle.initPlugin();
		};

	});
};

// plugin defaults
$.fn.qcycle.defaults = {
	slideData: null,
	cycleOpts: {},
	createSlide: function(img){	return img;	},
	onComplete: function(){},
	defer: false,
	imageKey: 'img'
};

//	public function/method
$.fn.qcycle.ver = function() { return "jquery.qcycle version " + ver; };

})(jQuery);