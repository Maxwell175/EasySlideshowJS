# EasySlideshowJS
The easy way to make slideshows.

This is specifically made to be a barebones design to allow you to expand on top of it.

A working demo is available at: https://mdtech-us-man.github.io/EasySlideshowJS/Demo/

# Requirements
1. EasyResizeToParent (https://github.com/MDTech-us-MAN/EasyResizeToParent)
    * This library is not required for the correct operation, but if you do not include it, you will have to manually set slide width by [adding a custom CSS class](#basic-usage).
2. One of [Velocity.js](http://velocityjs.org/) (recommended), [GASP.js](https://greensock.com/gsap), or jQuery animations.
    * If none of these are loaded, animations are disabled and [`FadeInDuration`](#basic-usage) is ignored.


# Basic Usage
```javascript
var SSImages = [
	{
		imgSrc: '<image 1>',
		imgLink: '<image 1 link>'
	},
	{
		imgSrc: '<image 2>',
	},
	{
		imgSrc: '<image 3>',
		imgLink: '<image 3 link>'
	}
];
EasySlideshowJS(document.getElementById('slideshow'), SSImages, 3000);
```

##### `EasySlideshowJS` accepts up to 5 arguments:

1. `ContainingDiv` - The div which will be made into a slideshow.
2. `ImageObjs` - An array of image objects.
    1. Each image object requires at least the `imgSrc` property, that will specify the `src` of the img.
    2. An image object may also have an `imgLink` property which will cause the image to become a link to the specified URL.
    3. If the image object has a `duration` property, it will override the default duration (below)
3. `DefaultDuration` - The default duration of each slide.
4. `FadeInDuration` (optional) - Defines how long the fade in for each slide will take in milliseconds. (default is 500)
5. `additionalCSSClasses` (optional) - Classes to add to each image element. (none by default)

# Advanced Usage
In order to provide control of the slideshow, the `EasySlideshowJS` function returns the slideshow div, but it now has control functions assigned to it.

Example:
```javascript
var MySS = EasySlideshowJS(document.getElementById('slideshow'), SSImages, 3000);
```

Now, you can access the control functions using MySS.

For example:
```javascript
// Play the slideshow
MySS.playSlideShow()
```

##### Also, notice that you can set custom properties on each image object as they will be available using the `currentImage()` function.

# Basic Control Functions
For demonstration purposes, we will refer to the slideshow object as `MySS`.

### Pause the slideshow
```javascript
MySS.pauseSlideShow();
```

### Resume the slideshow
```javascript
MySS.playSlideShow();
```

### Check if the slideshow is playing
```javascript
if (MySS.isPlaying() == false)
    alert("Play the slideshow to continue.");
```

### Get current image object
```javascript
var caption = document.getElementById("SSCaption");

caption.innerHTML = MySS.currentImage().MyCustomProperty;
```

### Get the zero-based index of the current image
```javascript
var imageSelection = document.getElementById("SSSelectImg");

imageSelection.selectedIndex = MySS.currentImageIndex();
```

### Get the full list of loaded image objects
```javascript
var imageSelection = document.getElementById("SSSelectImg");

MySS.allLoadedImages().forEach(function (elm, idx) {
	var newOption = document.createElement('option');
	newOption.value = idx;
	newOption.innerHTML = elm.imgName || idx + 1;
	imageSelection.appendChild(newOption);
});
```

### Jump to a specific slide
```javascript
var imageSelection = document.getElementById("SSSelectImg");

imageSelection.oninput = function() {
    // Accepts the zero-based index of the slide to jump to.
    // Ignores an attempt to go to the current slide.
    // FYI: Note that in the previous example we set the option's value
    //      to the index of the slide, this is a nice way to tranparently
    //      remember the right index.
    MySS.jumpToIndex(imageSelection.value);
};
```

# Events
Functions can be attached to events using the corresponding `add`/`remove` calls.
```javascript
function onSSTransitionProgChg(SlideShow, AllImgs, CurrImg, CurrImgIdx, Progress) {
    if (Progress > 0.5) {
        // Halfway point passed.
        // Do something?
    }
}

MySS.addTransitionProgressChangeListener(onSSTransitionProgChg);
```
```javascript
MySS.removeTransitionProgressChangeListener(onSSTransitionProgChg);
```

### Slide Change Started Listener
This event is called we start to transition to the next slide.

##### To listen to this event use the `addSlideChangeStartListener` and `removeSlideChangeStartListener` functions.

Parameters passed to triggered function:

|  Name            | Description |
|------------------|-------------|
| **`caller`**     | The slideshow that raised this event. This will be an object with all the above control functions. |
| **`AllImgs`**    | All currently loaded image objects. |
| **`CurrImg`**    | The image **_to which_** we are transitioning to. |
| **`CurrImgIdx`** | The (zero-based) index of the image **_to which_** we are transitioning to. |

### Slide Change Ended Listener
This event is called when we finish transitioning to the new slide.

##### To listen to this event use the `addSlideChangeEndListener` and `removeSlideChangeEndListener` functions.

Parameters passed to triggered function:

|  Name            | Description |
|------------------|-------------|
| **`caller`**     | The slideshow that raised this event. This will be an object with all the above control functions. |
| **`AllImgs`**    | All currently loaded image objects. |
| **`CurrImg`**    | The image **_to which_** we have transitioned to. |
| **`CurrImgIdx`** | The (zero-based) index of the image **_to which_** we have transitioned to.

### Slide Transition Progress Changed Listener
This event is called during the process of the duration.

_Note:_ If no transition library is loaded, this event will be called twice in quick succession. Once before we set the new image and once after.

##### To listen to this event use the `addTransitionProgressChangeListener` and `removeTransitionProgressChangeListener` functions.

Parameters passed to triggered function:

|  Name            | Description |
|------------------|-------------|
| **`caller`**     | The slideshow that raised this event. This will be an object with all the above control functions. |
| **`AllImgs`**    | All currently loaded image objects. |
| **`CurrImg`**    | The image **_to which_** we have transitioned/are transitioning to. |
| **`CurrImgIdx`** | The (zero-based) index of the image **_to which_** we have transitioned to. |
| **`Progress`**   | Percentage of the animation that has been completed. Values range from 0 to 1 (for example, 0.5 is 50%). |
