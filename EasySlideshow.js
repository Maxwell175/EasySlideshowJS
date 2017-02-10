/**
 * @license Copyright (c) 2017 Maxwell Dreytser
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/**
 * Initializes a slideshow inside the specified div.
 * @param {HTMLElement} ContainingDiv The div which will be made into a slideshow.
 * @param {Array} ImageObjs An array of image objects. (Information on required elements for each Image is in the README)
 * @param {int} DefaultDuration The default duration of each slide.
 * @param {int} [FadeDuration=500] Defines how long the fade will take.
 * @param {String} [additionalCSSClasses] Classes to add to each image element.
 * @returns {HTMLElement} The created slideshow. (Provides control functionality)
 */
window.EasySlideshowJS = function(ContainingDiv, ImageObjs, DefaultDuration, FadeDuration, additionalCSSClasses) {
	var animationCanceler = null;
	function animateOpacity(elm, newOpacity, duration, callback, reportProgress) {
		if (window.jQuery) {
			if (window.Velocity) {
				$(elm).velocity({
					opacity: newOpacity
				}, {
					duration: duration,
					complete: function () {
						if (callback) callback();
						animationCanceler = null;
					},
					progress: function (elements, complete, remaining, start, tweenValue) {
						if (reportProgress)
							TransitionProgressChangeListeners.forEach(function (elm) {
								setTimeout(function(){elm(ContainingDiv, ImageObjs, ImageObjs[CurrImgIdx], CurrImgIdx, complete);}, 0);
							});
					}
				});
				animationCanceler = function () {
					$(elm).velocity("stop");
				}
			} else if (window.TweenLite || window.TweenMax) {
				var GASPTransition = (TweenLite || TweenMax).to(elm, duration, {opacity: newOpacity, onComplete: function () {
					if (callback) callback();
					animationCanceler = null;
				}, onUpdate: function(tween) {
					if (reportProgress)
						TransitionProgressChangeListeners.forEach(function (elm) {
							setTimeout(function(){elm(ContainingDiv, ImageObjs, ImageObjs[CurrImgIdx], CurrImgIdx, tween.progress());}, 0);
						});
				}, onStartParams:["{self}"]});
				animationCanceler = function () {
					GASPTransition.progress(1.00, true);
				}
			} else {
				$(elm).animate({
					opacity: newOpacity
				}, {
					duration: duration,
					complete: function () {
						if (callback) callback();
						animationCanceler = null;
					},
					progress: function (animation, progress, remainingMs) {
						if (reportProgress)
							TransitionProgressChangeListeners.forEach(function (elm) {
								setTimeout(function(){elm(ContainingDiv, ImageObjs, ImageObjs[CurrImgIdx], CurrImgIdx, progress());}, 0);
							});
					}
				});
				animationCanceler = function () {
					$(elm).stop();
				}
			}
		} else if (window.Velocity) {
			Velocity(elm, {
				opacity: newOpacity
			}, {
				duration: duration,
				complete: function () {
					if (callback) callback();
					animationCanceler = null;
				},
				progress: function (elements, complete, remaining, start, tweenValue) {
					if (reportProgress)
						TransitionProgressChangeListeners.forEach(function (elm) {
							setTimeout(function(){elm(ContainingDiv, ImageObjs, ImageObjs[CurrImgIdx], CurrImgIdx, complete);}, 0);
						});
				}
			});
			animationCanceler = function () {
				Velocity(elm, "stop");
			}
		} else if (window.TweenLite || window.TweenMax) {
			var GASPTransition = (TweenLite || TweenMax).to(elm, duration, {opacity: newOpacity, onComplete: function () {
				if (callback) callback();
				animationCanceler = null;
			}, onUpdate: function(tween) {
				if (reportProgress)
					TransitionProgressChangeListeners.forEach(function (elm) {
						setTimeout(function(){elm(ContainingDiv, ImageObjs, ImageObjs[CurrImgIdx], CurrImgIdx, tween.progress());}, 0);
					});
			}, onStartParams:["{self}"]});
			animationCanceler = function () {
				GASPTransition.progress(1.00, true);
			}
		} else {
			// If we can't use neither of the supported animation methods, go without an animation.
			if (reportProgress)
				TransitionProgressChangeListeners.forEach(function (elm) {
					setTimeout(function(){elm(ContainingDiv, ImageObjs, ImageObjs[CurrImgIdx], CurrImgIdx, 0);}, 0);
				});
			elm.style.opacity = newOpacity;
			if (reportProgress)
				TransitionProgressChangeListeners.forEach(function (elm) {
					setTimeout(function(){elm(ContainingDiv, ImageObjs, ImageObjs[CurrImgIdx], CurrImgIdx, 1);}, 0);
				});

			if (callback) {
				callback();
			}
		}
	}
	function removeAllFromArray(array, elm) {
		for (var i = 0; i < array.length;) {
			if (array[i] == elm) {
				array.splice(i, 1);
				continue;
			}
			i++;
		}
	}

	function endTransition() {
		if (animationCanceler) {
			animationCanceler();
			animationCanceler = true;
		}
	}

	if (!ContainingDiv) {
		console.error("You have not specified the div that will contain the slideshow.");
		return null;
	}
	if (!ImageObjs || !Array.isArray(ImageObjs)) {
		console.error("You have not specified an array of image objects.");
		return null;
	}
	if (!DefaultDuration) {
		console.error("You have not specified the default duration of each slide.");
		return null;
	}
	for (var i; i < ImageObjs.length; i++) {
		if (!ImageObjs[i].imgSrc && String.isString(ImageObjs[i].imgSrc)) {
			console.error("Image object at index " + i + " does not have an `imgSrc` property. Incorrect object:");
			console.error(ImageObjs[i]);
			return null;
		}
	}
	if (ContainingDiv.tagName.toLowerCase() != 'div') {
		console.error("The specified element is not a div.");
		return null;
	}
	if (ImageObjs.length == 0) {
		console.error("You have not specified any images for the slideshow.");
		console.error(ImageObjs);
		return null;
	}
	if (!window.DoEasyResizeToParent) {
		console.warn("EasyResizeToParent.js needs to be loaded in order for the slideshow to work properly. (https://github.com/MDTech-us-MAN/EasyResizeToParent)");
	}
	if (!window.Velocity && !window.TweenLite && !window.TweenMax && !window.jQuery) {
		console.warn("In order for animations to work, please load either Velocity.js (recommended) (https://github.com/julianshapiro/velocity), GASP.js (https://greensock.com/gsap), or jQuery (with animations).")
	}
	if (!FadeDuration) {
		FadeDuration = 500;
	}
	if (!additionalCSSClasses) {
		additionalCSSClasses = "";
	}

	var CurrImgIdx = 0;
	var CurrImgTimeout = null;
	var TransitionRunning = false;
	var onTransitionEnd = null;

	var loadingImg = document.createElement('img');
	loadingImg.src = window.EasySlideshowLoadingGIF || "EasySlideshowJSLoading.gif";
	loadingImg.style.position = 'absolute';
	loadingImg.className = additionalCSSClasses;

	var playing = true;
	ContainingDiv.ShowNextImg = null;
	var SlideChangeEndListeners = [];
	var SlideChangeStartListeners = [];
	var TransitionProgressChangeListeners = [];
	
	ContainingDiv.appendChild(loadingImg);


	console.log("Going to load:");
	console.log(ImageObjs[0]);
	var firstImg = document.createElement('img');
	if (ImageObjs[0].imgLink) {
		var firstImgLink = document.createElement('a');
		firstImgLink.href = ImageObjs[0].imgLink;
		firstImgLink.appendChild(firstImg);
	}
	firstImg.src = ImageObjs[0].imgSrc;
	firstImg.style.opacity = '0';
	firstImg.style.position = 'absolute';
	firstImg.style.zIndex = '0';
	firstImg.className = additionalCSSClasses;
	firstImg.setAttribute("resizeToParent", "yes");
	if (ImageObjs[0].imgLink) {
		ContainingDiv.appendChild(firstImgLink);
		ImageObjs[0].element = firstImgLink;
	} else {
		ContainingDiv.appendChild(firstImg);
		ImageObjs[0].element = firstImg;
	}
	// Force resize immediately!
	window.DoEasyResizeToParent();
	firstImg.onload = function () {
		firstImg.style.zIndex = '1';
		SlideChangeStartListeners.forEach(function (elm) {
			setTimeout(function(){elm(ContainingDiv, ImageObjs, ImageObjs[CurrImgIdx], CurrImgIdx);}, 0);
		});
		animateOpacity(firstImg, 1, FadeDuration, CurrLoaded, true);
	};

	function CurrLoaded() {
		if (CurrImgTimeout) {
			// if there is another instance running, cut the other one off.
			// if we have 2 sets of timers running at once, bad things will happen...
			// Should be fixed now... hopefully...
			console.log("Race condition in CurrLoaded (EasySlideshowJS)! We should recover after a few slides.");
			clearTimeout(CurrImgTimeout);
		}

		loadingImg.style.opacity = '0';

		// Remove previous image and any other foreign elements.
		for (var i = 0; i < ContainingDiv.children.length; i++) {
			var childElm = ContainingDiv.children[i];
			if (childElm != ImageObjs[CurrImgIdx].element && childElm != loadingImg) {
				childElm.parentNode.removeChild(childElm);
			}
		}

		// If we are at the end of the SS start from the beginning.
		var nextIdx = CurrImgIdx == ImageObjs.length - 1 ? 0 : CurrImgIdx + 1;
		console.log("Going to load:");
		console.log(ImageObjs[nextIdx]);
		var nextImg = document.createElement('img');
		if (ImageObjs[nextIdx].imgLink) {
			var nextImgLink = document.createElement('a');
			nextImgLink.href = ImageObjs[nextIdx].imgLink;
			nextImgLink.appendChild(nextImg);
		}
		nextImg.loaded = false;
		nextImg.src = ImageObjs[nextIdx].imgSrc;
		nextImg.style.opacity = '0';
		nextImg.style.position = 'absolute';
		nextImg.style.zIndex = '0';
		nextImg.className = additionalCSSClasses;
		nextImg.setAttribute("resizeToParent", "yes");
		if (ImageObjs[nextIdx].imgLink) {
			ContainingDiv.appendChild(nextImgLink);
			ImageObjs[nextIdx].element = nextImgLink;
		} else {

			ContainingDiv.appendChild(nextImg);
			ImageObjs[nextIdx].element = nextImg;
		}
		// Force resize immediately!
		window.DoEasyResizeToParent();
		nextImg.onload = function() {
			nextImg.loaded = true;
			if (nextImg.showOnLoaded) {
				TransitionRunning = true;
				animateOpacity(ImageObjs[CurrImgIdx].element, 0, FadeDuration);
				CurrImgIdx = nextIdx;
				nextImg.style.zIndex = '1';
				SlideChangeStartListeners.forEach(function (elm) {
					setTimeout(function(){elm(ContainingDiv, ImageObjs, ImageObjs[CurrImgIdx], CurrImgIdx);}, 0);
				});
				animateOpacity(nextImg, 1, FadeDuration, CurrLoaded, true);
			}
		};

		function ShowNextImg() {
			if (playing) {
				ContainingDiv.ShowNextImg = function() {console.log("Race condition in ShowNextImg (EasySlideshowJS)!")};
				if (nextImg.loaded) {
					TransitionRunning = true;
					animateOpacity(ImageObjs[CurrImgIdx].element, 0, FadeDuration);
					CurrImgIdx = nextIdx;
					nextImg.style.zIndex = '1';
					SlideChangeStartListeners.forEach(function (elm) {
						setTimeout(function(){elm(ContainingDiv, ImageObjs, ImageObjs[CurrImgIdx], CurrImgIdx);}, 0);
					});
					animateOpacity(nextImg, 1, FadeDuration, CurrLoaded, true);
				} else {
					loadingImg.style.opacity = '1';
					TransitionRunning = true;
					animateOpacity(ImageObjs[CurrImgIdx].element, 0, FadeDuration, function () {
						if (nextImg.loaded) {
							if (onTransitionEnd) {
								onTransitionEnd();
								onTransitionEnd = null;
							} else {
								CurrImgIdx = nextIdx;
								nextImg.style.zIndex = '1';
								SlideChangeStartListeners.forEach(function (elm) {
									setTimeout(function(){elm(ContainingDiv, ImageObjs, ImageObjs[CurrImgIdx], CurrImgIdx);}, 0);
								});
								animateOpacity(nextImg, 1, FadeDuration, CurrLoaded, true);
							}
						} else {
							TransitionRunning = false;
							if (onTransitionEnd) {
								onTransitionEnd();
								onTransitionEnd = null;
							}
							nextImg.showOnLoaded = true;
						}
					});
				}
			}
		}

		ContainingDiv.ShowNextImg = ShowNextImg;

		if (onTransitionEnd) {
			onTransitionEnd();
			onTransitionEnd = null;
			if (playing) {
				return;
			}
		}

		SlideChangeEndListeners.forEach(function (elm) {
			setTimeout(function(){elm(ContainingDiv, ImageObjs, ImageObjs[CurrImgIdx], CurrImgIdx);}, 0);
		});

		if (playing) {
			CurrImgTimeout = setTimeout(function () {
				CurrImgTimeout = null;
				ShowNextImg();
			}, ImageObjs[CurrImgIdx].duration ? ImageObjs[CurrImgIdx].duration : DefaultDuration);
		}

		TransitionRunning = false;
		if (onTransitionEnd) {
			onTransitionEnd();
			onTransitionEnd = null;
		}
	}

	/**
	 * Checks if the slideshow is playing.
	 * @returns {boolean} Is it playing?
	 */
	ContainingDiv.isPlaying = function () {
		return playing;
	};
	/**
	 * Resumes the slideshow.
	 */
	ContainingDiv.playSlideShow = function() {
		if (!playing) {
			function DoPlay() {
				playing = true;
				ContainingDiv.ShowNextImg();
			}
			if (TransitionRunning) {
				onTransitionEnd = DoPlay;
			} else {
				DoPlay();
			}
		}
	};
	/**
	 * Pauses the slideshow.
	 */
	ContainingDiv.pauseSlideShow = function() {
		if (playing) {
			if (CurrImgTimeout) {
				clearTimeout(CurrImgTimeout);
				CurrImgTimeout = null;
			}

			function DoPause() {
				playing = false;
				if (CurrImgTimeout) {
					clearTimeout(CurrImgTimeout);
					CurrImgTimeout = null;
				}
			}
			if (TransitionRunning) {
				onTransitionEnd = DoPause;
			} else {
				DoPause();
			}
		}
	};
	/**
	 * Retrieves the current image object (which includes any additional properties you may set).
	 * @returns {*} The image object.
	 */
	ContainingDiv.currentImage = function () {
		return ImageObjs[CurrImgIdx];
	};
	/**
	 * Retrieves the ZERO-BASED index of the current image.
	 * @returns {number} The ZERO-BASED (starts from 0) index of the image.
	 */
	ContainingDiv.currentImageIndex = function () {
		return CurrImgIdx;
	};
	/**
	 * Gets all the images in the slideshow.
	 * @returns {Array} The array of image objects.
	 */
	ContainingDiv.allLoadedImages = function () {
		return ImageObjs;
	};
	/**
	 * Jumps to the specified image.
	 * @param idx {number} ZERO-BASED index of the image to jump to.
	 */
	ContainingDiv.jumpToIndex = function (idx) {
		idx = parseInt(idx, 10);
		if (idx == Number.NaN) {
			console.error("You have not specified a valid integer index to jump to.");
			return;
		}

		if (idx > ImageObjs.length - 1) {
			console.error("Cannot jump to the requested slideshow index since it is greater than the maximum possible index, " + (ImageObjs.length - 1) + ".");
			return;
		}

		if (idx == CurrImgIdx) {
			console.log("Ignored an attempt to jump to the same image as we are on now.");
			return;
		}

		function ChgImg() {
			if (CurrImgTimeout) {
				clearTimeout(CurrImgTimeout);
				CurrImgTimeout = null;
			}

			var nextIdx = idx;
			console.log("Going to load:");
			console.log(ImageObjs[nextIdx]);
			var nextImg = document.createElement('img');
			if (ImageObjs[nextIdx].imgLink) {
				var nextImgLink = document.createElement('a');
				nextImgLink.href = ImageObjs[nextIdx].imgLink;
				nextImgLink.appendChild(nextImg);
			}
			nextImg.loaded = false;
			nextImg.src = ImageObjs[nextIdx].imgSrc;
			nextImg.style.opacity = '0';
			nextImg.style.position = 'absolute';
			nextImg.style.zIndex = '0';
			nextImg.className = additionalCSSClasses;
			nextImg.setAttribute("resizeToParent", "yes");
			if (ImageObjs[nextIdx].imgLink) {
				ContainingDiv.appendChild(nextImgLink);
				ImageObjs[nextIdx].element = nextImgLink;
			} else {
				ContainingDiv.appendChild(nextImg);
				ImageObjs[nextIdx].element = nextImg;
			}
			nextImg.onload = function () {
				nextImg.loaded = true;
				if (nextImg.showOnLoaded) {
					animateOpacity(ImageObjs[CurrImgIdx].element, 0, FadeDuration);
					CurrImgIdx = nextIdx;
					nextImg.style.zIndex = '1';
					SlideChangeStartListeners.forEach(function (elm) {
						setTimeout(function(){elm(ContainingDiv, ImageObjs, ImageObjs[CurrImgIdx], CurrImgIdx);}, 0);
					});
					animateOpacity(nextImg, 1, FadeDuration, CurrLoaded, true);
				}
			};

			// Allow the image to be loaded from cache if it is already cached. (500 milliseconds should be enough)
			setTimeout(function () {
				if (nextImg.loaded) {
					animateOpacity(ImageObjs[CurrImgIdx].element, 0, FadeDuration);
					CurrImgIdx = nextIdx;
					nextImg.style.zIndex = '1';
					SlideChangeStartListeners.forEach(function (elm) {
						setTimeout(function(){elm(ContainingDiv, ImageObjs, ImageObjs[CurrImgIdx], CurrImgIdx);}, 0);
					});
					animateOpacity(nextImg, 1, FadeDuration, CurrLoaded, true);
				} else {
					loadingImg.style.opacity = '1';
					animateOpacity(ImageObjs[CurrImgIdx].element, 0, FadeDuration, function () {
						if (nextImg.loaded) {
							CurrImgIdx = nextIdx;
							nextImg.style.zIndex = '1';
							SlideChangeStartListeners.forEach(function (elm) {
								setTimeout(function(){elm(ContainingDiv, ImageObjs, ImageObjs[CurrImgIdx], CurrImgIdx);}, 0);
							});
							animateOpacity(nextImg, 1, FadeDuration, CurrLoaded, true);
						} else {
							nextImg.showOnLoaded = true;
						}
					});
				}
			}, 500);
		}

		if (TransitionRunning)
			onTransitionEnd = ChgImg;
		else
			ChgImg();
	};
	/**
	 * Adds a listener for the SlideChangeStart event. Note: Will overwrite any identical listener.
	 * @param {function(*, Array, *, number)} listener The listener to add.
	 */
	ContainingDiv.addSlideChangeStartListener = function (listener) {
		removeAllFromArray(SlideChangeStartListeners, listener);
		SlideChangeStartListeners.push(listener);
	};
	/**
	 * Remove the specified listener.
	 * @param {function(*, Array, *, number)} listener The listener to remove.
	 */
	ContainingDiv.removeSlideChangeStartListener = function (listener) {
		removeAllFromArray(SlideChangeStartListeners, listener);
	};
	/**
	 /**
	 * Adds a listener for the SlideChangeEnd event. Note: Will overwrite any identical listener.
	 * @param {function(*, Array, *, number)} listener The listener to add.
	 * @param {Boolean} runNow Should we trigger the listener as soon as we add it?
	 */
	ContainingDiv.addSlideChangeEndListener = function (listener, runNow) {
		removeAllFromArray(SlideChangeEndListeners, listener);
		SlideChangeEndListeners.push(listener);
		if (runNow) {
			setTimeout(function(){
				listener(ContainingDiv, ImageObjs, ImageObjs[CurrImgIdx], CurrImgIdx);
			}, 0);
		}
	};
	/**
	 * Remove the specified listener.
	 * @param {function(*, Array, *, number)} listener The listener to remove.
	 */
	ContainingDiv.removeSlideChangeEndListener = function (listener) {
		removeAllFromArray(SlideChangeEndListeners, listener);
	};
	/** Adds a listener for the TransitionProgressChange event. Note: Will overwrite any identical listener.
	 * @param {function(*, Array, *, number, number)} listener The listener to add.
	 */
	ContainingDiv.addTransitionProgressChangeListener = function (listener) {
		removeAllFromArray(TransitionProgressChangeListeners, listener);
		TransitionProgressChangeListeners.push(listener);
	};
	/**
	 * Remove the specified listener.
	 * @param {function(*, Array, *, number, number)} listener The listener to remove.
	 */
	ContainingDiv.removeTransitionProgressChangeListener = function (listener) {
		removeAllFromArray(TransitionProgressChangeListeners, listener);
	};

	return ContainingDiv;
};