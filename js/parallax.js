/**
* My Parallax Plugin
* 
* @Date 	20130909
* @Author 	ShawnWu
* @Version 	release v6.6.20140320
* @License 	under the MIT License
**/
jQuery.fn.parallScroll = function(settings, selector) {
	settings = jQuery.extend({
		useEasing: true,	//boolean to using Easing effect
		interval: 25,		//interval of scroll page
		scrollLimit: 8000,	//right scroll limit
		scrollRatio: 500,	//ratio of scroll page
		naviRatio: 800,		//ratio of clicked navigation bar
		naviLocate: {},		//navi's id & start position
		scrollAxis: 'x',	//Set scrolling axis
		horiScroll: true,	//Enable horizontal effect
		vertiScroll: true,	//Enable vertical effect
		response: false,	//Refreshes parallax content on window load and resize
		parallaxB: true,	//Enable or disable the Backgrounds of parallax
		parallaxE: true,	//Enable or disable the Elements of parallax
		hideElem: true,		//Hide parallax elements that move outside the viewport
		hideType: function($elem){ $elem.hide() },		//Customise hidden
		showType: function($elem){ $elem.show() },		//Customise shown
		refValueW: $(window).width(),	//The reference value of browser width
		refValueH: $(window).height(),	//The reference value of browser height
		navId: '#navi',		//setting the navigation name to plugin
		formula: function(a, b){ return Math.round(a / b * 100) / 100; }	//proportional Formula
	}, settings);
	
	var parallax = new function() {
		function checkBrowser() {
			if( !!~navigator.userAgent.toLowerCase().search("firefox") ) return '-moz';
			else if( !!~navigator.userAgent.toLowerCase().search("msie") ) return '-ms';
			else if( !!~navigator.userAgent.toLowerCase().search("opera") ) return '-o';
			else return '-webkit';
		} var coreStyle = checkBrowser() + '-transform';
		
		var win = $(window), docuElem = $('body'), elem = $(selector), navi = $(settings.navId);
		
		var bSize = settings.scrollAxis == 'x' ? settings.refValueW : settings.refValueH,
			bResize = settings.scrollAxis == 'x' ? win.width() : win.height(),
			bRatio = settings.formula(bResize, bSize);
		
		win.resize(function(){
			bResize = settings.scrollAxis == 'x' ? win.width() : win.height();
			bRatio = settings.formula(bResize, bSize);
		});
		
		settings.scrollLimit *= bRatio; settings.scrollRatio *= bRatio; settings.naviRatio *= bRatio;
		var bound = settings.scrollAxis == 'x' ? win.width() : win.height();
		
		//initiate parallax effects starting
		this.init = function() { parallax.parallax.init_parallax() }
		
		//Handles navigation, scrolling and parallax effects.
		this.parallax = new function() {
			this.iScrollInstance = null, this.iScrollInterval = null;
			this.useEasing = settings.useEasing, this.naviLoc = settings.naviLocate;
			this.scrollPos = 0; var _isNaviClick = 0;
			
			//Initialize the parallax effects
			this.init_parallax = function() {
				var _this = this;
				
				//bundling the click event in navigation bar
				navi.find("li a").click(function(){ 
					_isNaviClick = settings.naviLocate[$(this).attr('id')];
					_this.naviClick($(this).attr('id'));
				});
				
				//start and setting stellar
				$.stellar({
					horizontalScrolling: settings.horiScroll,	//Set scrolling to be horizontal scrolling
					verticalScrolling: settings.vertiScroll,	//Set scrolling to be vertical scrolling
					responsive: settings.response,				//Refreshes parallax content on window load and resize
					parallaxBackgrounds: settings.parallaxB,	//Enable or disable the Backgrounds of parallax
					parallaxElements: settings.parallaxE,		//Enable or disable the Elements of parallax
					hideDistantElements: settings.hideElem,		//Hide parallax elements that move outside the viewport
					hideElement: settings.hideType,				//Customise hidden
					showElement: settings.showType,				//Customise shown
					refWidth: win.width(),						//Realtime browser width
					refHeight: win.height(),					//Realtime browser height
					formula: settings.formula					//Proportional formula
				});
				
				//scroll mousewheel detection
				elem.mousewheel(function(event, delta){
					event.preventDefault(); event.stopPropagation();
					//calculate new position FOR mousewheel Scrolling
					_this.scrollPos = _this.scrollPos-delta*settings.interval < 0 ? 0 : _this.scrollPos-delta*settings.interval || 0;
					//fix the Infinity scroll RIGHT problem
					_this.scrollPos = _this.scrollPos > settings.scrollLimit ? settings.scrollLimit : _this.scrollPos;
					//no easing when page has a small delta value
					if (delta < 1 && delta > -1) _this.useEasing = false;
					
					_this.scrollEasing(_this.useEasing);
				});
				
				//scroll keyboard detection
				$(document).on("keyup keypress keydown", elem, function(event){
					event.stopPropagation();
					//keyboard arrow detection
					if(event.keyCode==37 || event.keyCode==38) var delta = 1; if(event.keyCode==39 || event.keyCode==40) var delta = -1;
					var keyCodeArr = [37, 38, 39, 40]; if( !!~keyCodeArr.indexOf(event.keyCode) ) {
						//calculate new position FOR keyboard Scrolling
						_this.scrollPos = _this.scrollPos-delta*settings.interval < 0 ? 0 : _this.scrollPos-delta*settings.interval || 0;
						//fix the Infinity scroll RIGHT problem
						_this.scrollPos = _this.scrollPos > settings.scrollLimit ? settings.scrollLimit : _this.scrollPos;
						
						_this.scrollEasing(_this.useEasing);
					}
				});
				
				_this.scrollEasing = function(useEasing) {
					if ( useEasing ) {
						//stop all running animation and update scrolling position
						var scrollTmp = 0;
						if( settings.scrollAxis == 'x' ) {
							docuElem.stop(true, false).animate({scrollLeft: _this.scrollPos}, {duration: settings.scrollRatio, step: function() {
								var tmpScroll = docuElem.scrollLeft() ? docuElem.scrollLeft() : elem.scrollLeft();
								if( tmpScroll != scrollTmp ) { _this.scrollUpdate(tmpScroll); scrollTmp = tmpScroll; }
							} });
						} else {
							docuElem.stop(true, false).animate({scrollTop: _this.scrollPos}, {duration: settings.scrollRatio, step: function() {
								var tmpScroll = docuElem.scrollLeft() ? docuElem.scrollLeft() : elem.scrollLeft();
								if( tmpScroll != scrollTmp ) { _this.scrollUpdate(tmpScroll); scrollTmp = tmpScroll; }
							} });
						}
					} else {
						//update position and scrolling without easing
						( settings.scrollAxis == 'x' ) ? docuElem.scrollLeft(_this.scrollPos) : docuElem.scrollTop(_this.scrollPos);
						_this.scrollUpdate(_this.scrollPos);
					}
				}
			}
			
			//trigger the animation events depending on the scroll position
			this.scrollUpdate = function(scrollPx, iScrollEnd, noneNavi) {
				this.aniHandler(scrollPx);					//animation trigger
				if(!noneNavi) this.naviScroll(scrollPx);	//handle the navigation bar in scroll
			}
			
			//animation handler
			this.aniHandler = function(scrollPx) {
				var scrollDirect = this.scrollPos;
				
				if( scrollPx >= _isNaviClick * bRatio - 5 && scrollPx <= _isNaviClick * bRatio + 5 ) _isNaviClick = 0;

				 //rotate image action
				elem.find('[data-rotate]').each(function(){
					var optRotate	= $(this).data("rotate"), initRotate = $(this).data("init-rotate"),
						speed	 	= +optRotate.speed || 5, direct = +optRotate.direct || 0,
						adjVal		= direct ? (1 * speed) : (-1 * speed),
						rotate		= +initRotate.rotate || 0;
					
					if( scrollDirect-scrollPx > 0 ) {
						rotate = (rotate + adjVal) % 360;
						rotateAngle = 'rotate('+ rotate +'deg)';
						$(this).next().css(coreStyle, rotateAngle);
					} else if( scrollDirect-scrollPx < 0 ) {
						rotate = (rotate - adjVal) % 360;
						rotateAngle = 'rotate('+ rotate +'deg)';
						$(this).next().css(coreStyle, rotateAngle);
					} else {
						rotate = (rotate + adjVal) % 360;
						rotateAngle = 'rotate('+ rotate +'deg)';
						$(this).next().css(coreStyle, rotateAngle);
					}
					
					$(this).data("init-rotate", {"rotate":rotate});
				});/*rotate*/
				
				 //scale image action
				elem.find('[data-scale]').each(function(){
					var optScale = $(this).data("scale"), initScale = $(this).data("init-scale"),
						speed	 = +optScale.speed * bRatio || 100,
						resize 	 = +optScale.resize || 1, direct = +optScale.direct || 0,
						max		 = +optScale.max || 5, min = +optScale.min || 1,
						sdist 	 = +optScale.sdist * bRatio || 0, edist = +optScale.edist * bRatio || bound,
						dist	 = +initScale.dist * bRatio || 0, scale = +initScale.scale || 1;

					if( scrollDirect-scrollPx > 0 ) {
						if( scrollPx > sdist && scrollPx < sdist+edist && scrollPx > dist ) {
							scale = direct ? scale - resize : scale + resize;
							if( scale > max ) scale = max; if( scale < min ) scale = min;
							scaleSize = 'scale('+ scale +')'; dist += speed;
							$(this).next().css(coreStyle, scaleSize);
						}
					} else if( scrollDirect-scrollPx < 0 ) {
						if( scrollPx > sdist && scrollPx < sdist+edist && scrollPx < dist ) {
							scale = direct ? scale + resize : scale - resize;
							if( scale > max ) scale = max; if( scale < min ) scale = min;
							scaleSize = 'scale('+ scale +')'; dist -= speed;
							$(this).next().css(coreStyle, scaleSize);
						}
					} else {
						if( scrollPx > sdist && scrollPx < sdist+edist ) {
							if( _isNaviClick && scrollPx > dist ) {
								scale = direct ? scale - resize : scale + resize;
								if( scale > max ) scale = max; if( scale < min ) scale = min;
								scaleSize = 'scale('+ scale +')'; dist += speed;
								$(this).next().css(coreStyle, scaleSize);
							} else if( _isNaviClick && scrollPx < dist ) {
								scale = direct ? scale + resize : scale - resize;
								if( scale > max ) scale = max; if( scale < min ) scale = min;
								scaleSize = 'scale('+ scale +')'; dist -= speed;
								$(this).next().css(coreStyle, scaleSize);
							}
						}
					}
					
					dist /= bRatio; $(this).data("init-scale", {"dist":dist, "scale":scale});
				});/*scale*/
			
				 //multiple image action
				elem.find('[data-frame]').each(function(){
					var optFrame = $(this).data("frame"), initFrame = $(this).data("init-frame"),
						speed	 = +optFrame.speed * bRatio || 100,
						sdist 	 = +optFrame.sdist * bRatio || 0, edist = +optFrame.edist * bRatio || bound,
						dist	 = +initFrame.dist * bRatio || 0,
						fNum	 = +$(this).nextAll().length,
						fNow	 = +initFrame.now || 0, fNext = +initFrame.next || 0;
					
					if( scrollDirect-scrollPx > 0 ) {
						if( scrollPx > sdist && scrollPx < sdist+edist && scrollPx > dist ) {
							if( fNext < fNum-1 ) {
								fNext++; dist += speed;
								$(this).data("init-frame", {"dist":dist, "next":fNext});
							}
						}
					} else if( scrollDirect-scrollPx < 0 ) {
						if( scrollPx > sdist && scrollPx < sdist+edist && scrollPx < dist ) {
							if( fNext >= 1 ) {
								fNext--; dist -= speed;
								$(this).data("init-frame", {"dist":dist, "next":fNext});
							}
						}
					} else {
						if( scrollPx > sdist && scrollPx < sdist+edist ) {
							if( _isNaviClick && scrollPx > dist ) {
								if( fNext < fNum-1 ) {
									fNext++; dist += speed;
									$(this).data("init-frame", {"dist":dist, "next":fNext});
								}
							} else if( _isNaviClick && scrollPx < dist ) {
								if( fNext >= 1 ) {
									fNext--; dist -= speed;
									$(this).data("init-frame", {"dist":dist, "next":fNext});
								}
							}
						}
					}
					
					if (fNext != fNow) {
						//show new frame step by step
						$(this).siblings().css('display','none');
						$(this).nextAll().each(function(i){ if( i == fNext ) $(this).css('display','block'); });
						
						//update current frame to new one
						fNow = fNext;
						dist /= bRatio; $(this).data("init-frame", {"dist":dist, "now":fNow, "next":fNext});
					}
				});/*multiple*/
				
				 //mask image action
				elem.find('[data-mask]').each(function(){
					var optMask = $(this).data("mask"), initMask = $(this).data("init-mask"),
						speed	= +optMask.speed * bRatio || 100, clip = +optMask.clip || 10,
						direct	= +optMask.direct || 0, axis = +optMask.axis || 0,
						sdist 	= +optMask.sdist * bRatio || 0, edist = +optMask.edist * bRatio || bound,
						dist	= +initMask.dist * bRatio || 0,
						myMask	= $(this).next().length ? $(this).next() : $(this),
						maskW	= +myMask.width(), limitW = +$(this).parent().width(),
						maskH	= +myMask.height(), limitH = +$(this).parent().height();
					
					if( scrollDirect-scrollPx > 0 ) {
						if( scrollPx > sdist && scrollPx < sdist+edist && scrollPx > dist ) {
							if( !axis ) maskW = direct ? maskW - clip : maskW + clip;
							else maskH = direct ? maskH + clip : maskH - clip;
							if( maskW > limitW ) maskW = limitW; if( maskW < 0 ) maskW = 0;
							if( maskH > limitH ) maskH = limitH; if( maskH < 0 ) maskH = 0;
							dist += speed;
						}
					} else if( scrollDirect-scrollPx < 0 ) {
						if( scrollPx > sdist && scrollPx < sdist+edist && scrollPx < dist ) {
							if( !axis ) maskW = direct ? maskW + clip : maskW - clip;
							else maskH = direct ? maskH - clip : maskH + clip;
							if( maskW > limitW ) maskW = limitW; if( maskW < 0 ) maskW = 0;
							if( maskH > limitH ) maskH = limitH; if( maskH < 0 ) maskH = 0;
							dist -= speed;
						}
					} else {
						if( scrollPx > sdist && scrollPx < sdist+edist ) {
							if( _isNaviClick && scrollPx > dist ) {
								if( !axis ) maskW = direct ? maskW - clip : maskW + clip;
								else maskH = direct ? maskH + clip : maskH - clip;
								if( maskW > limitW ) maskW = limitW; if( maskW < 0 ) maskW = 0;
								if( maskH > limitH ) maskH = limitH; if( maskH < 0 ) maskH = 0;
								dist += speed;
							} else if( _isNaviClick && scrollPx < dist ) {
								if( !axis ) maskW = direct ? maskW + clip : maskW - clip;
								else maskH = direct ? maskH - clip : maskH + clip;
								if( maskW > limitW ) maskW = limitW; if( maskW < 0 ) maskW = 0;
								if( maskH > limitH ) maskH = limitH; if( maskH < 0 ) maskH = 0;
								dist -= speed;
							}
						}
					}
					
					myMask.css({"width":maskW, "height":maskH});
					dist /= bRatio; $(this).data("init-mask", {"dist":dist});
				});/*mask*/
				
				 //CSS sprite action
				elem.find('[data-sprite]').each(function(){
					var optSprite	= $(this).data("sprite"),
						speed		= +optSprite.speed || 100,
						direct 		= +optSprite.direct || 0, axis = +optSprite.axis || 0,
						posArr		= $(this).css("background-position").split(' '),
						spriteX		= +posArr[0].replace(/[^0-9-]/g, ''), spriteY = +posArr[1].replace(/[^0-9-]/g, '');
					
					if( scrollDirect-scrollPx > 0 ) {
						if( !axis ) spriteX = direct ? spriteX - speed : spriteX + speed;
						else spriteY = direct ? spriteY + speed : spriteY - speed;
					} else if( scrollDirect-scrollPx < 0 ) {
						if( !axis ) spriteX = direct ? spriteX + speed : spriteX - speed;
						else spriteY = direct ? spriteY - speed : spriteY + speed;
					} else {
						if( !axis ) spriteX = direct ? spriteX - speed : spriteX + speed;
						else spriteY = direct ? spriteY + speed : spriteY - speed;
					}
					
					$(this).css("background-position", spriteX + 'px' + ' ' + spriteY + 'px');
				});/*sprite*/
				
				 //move image action
				elem.find('[data-move]').each(function(){
					var optMove	= $(this).data("move"), initMove = $(this).data("init-move"),
						speed	= +optMove.speed * bRatio || 100,
						moving 	= +optMove.moving * bRatio || 10, direct = +optMove.direct || 0,
						max		= +optMove.max * bRatio || 100, min = +optMove.min * bRatio || 0,
						sdist 	= +optMove.sdist * bRatio || 0, edist = +optMove.edist * bRatio || bound,
						dist	= +initMove.dist * bRatio || 0, move = +initMove.posi * bRatio || 0;

					if( scrollDirect-scrollPx > 0 ) {
						if( scrollPx > sdist && scrollPx < sdist+edist && scrollPx > dist ) {
							move = direct ? move + moving : move - moving; if( move > max ) move = max; if( move < min ) move = min;
							dist += speed;
						}
					} else if( scrollDirect-scrollPx < 0 ) {
						if( scrollPx > sdist && scrollPx < sdist+edist && scrollPx < dist ) {
							move = direct ? move - moving : move + moving; if( move > max ) move = max; if( move < min ) move = min;
							dist -= speed;
						}
					} else {
						if( scrollPx > sdist && scrollPx < sdist+edist ) {
							if( _isNaviClick && scrollPx > dist ) {
								move = direct ? move + moving : move - moving; if( move > max ) move = max; if( move < min ) move = min;
								dist += speed;
							} else if( _isNaviClick && scrollPx < dist ) {
								move = direct ? move - moving : move + moving; if( move > max ) move = max; if( move < min ) move = min;
								dist -= speed;
							}
						}
					}
					
					(settings.scrollAxis == 'x') ? $(this).parent().css("top", move) : $(this).parent().css("left", move);
					dist /= bRatio; move /= bRatio; $(this).data("init-move", {"dist":dist, "posi":move});
				});/*move*/
				
				 //CSS3 animated action
				elem.find('[data-animated]').each(function(){
					var optAnimated	= $(this).data("animated"),
						sdist		= +optAnimated.sdist * bRatio || 0, edist = +optAnimated.edist * bRatio || bound,
						css3		= optAnimated.css3;
					
					if( scrollPx > sdist && scrollPx < sdist+edist ) $(this).addClass("animated " + css3);
					else if( scrollPx > sdist+edist ) $(this).removeClass("animated " + css3);
					else $(this).removeClass("animated " + css3);
				});/*animated*/
			}
			
			//handle the STYLE of navigation bar in scrolling page
			this.naviScroll = function(scrollPx) {
				//get the active item then remove
				navi.find("a.active").each(function(){ $(this).removeClass('active') });
				
				//setting the active item by scrollPx
				var i=0, temp=[];
				for (var naviId in this.naviLoc) {
					temp[i] = {}; temp[i].myNaviId = naviId; temp[i].myNaviLoc = this.naviLoc[naviId] * bRatio;
					i++;
				}
				temp = temp.sort(function(a,b) { return a.myNaviLoc < b.myNaviLoc ? 1 : -1; });
				for ( var i=0; i<temp.length; i++ ) {
					if(scrollPx >= temp[i].myNaviLoc) {
						var activeItem = temp[i].myNaviId;
						break;
					}
				}
				
				//active target item
				navi.find("li a#" + activeItem).addClass('active');
			}
			
			//handle the CLICK event of navigation bar
			this.naviClick = function(naviId) {
				var _this = this;
				
				//get the active item then remove & active item when clicked the navigation bar
				navi.find("a.active").each(function(){ $(this).removeClass('active') });
				navi.find("li a#" + naviId).addClass('active');
				
				//animation action handle when clicked the navigation bar
				if( settings.scrollAxis == 'x' ) {
					docuElem.stop(true, true).animate({scrollLeft: this.naviLoc[naviId]*bRatio}, {duration: settings.naviRatio, step: naviUpdate, complete: naviUpdate});
				} else {
					docuElem.stop(true, true).animate({scrollTop: this.naviLoc[naviId]*bRatio}, {duration: settings.naviRatio, step: naviUpdate, complete: naviUpdate});
				}
				
				function naviUpdate() {
					//get the position when click the navigation bar
					if( settings.scrollAxis == 'x' ) {
						var tmpScroll = (docuElem.scrollLeft() == 0 && elem.scrollLeft() != 0) ? elem.scrollLeft() : docuElem.scrollLeft();
					} else {
						var tmpScroll = (docuElem.scrollTop() == 0 && elem.scrollTop() != 0) ? elem.scrollTop() : docuElem.scrollTop();
					}
					
					//move to target page
					_this.scrollPos = tmpScroll;
					_this.scrollUpdate(tmpScroll, false, true);
				}
			}
		}
	}

	parallax.init();
}
