# stereovideo.js

**stereovideo.js** is an HTML5 video player for stereoscopic content.  The
player accepts either a left-right stereo pair or a video and associated depth
map (aka [2D plus Depth](https://en.wikipedia.org/wiki/2D-plus-depth)).
It outputs that video in a number of ways:

 * The original video (or the left video stream).
 * The depth map (or the right video stream).
 * [Red-Blue Anaglyph](https://en.wikipedia.org/wiki/Anaglyph_3D)
 * Side-by-Side

The side-by-side format is commonly used by 3D TVs and projectors as a way of
packing two camera views into a single frame.  Viewing it in 3D is just a
matter of setting the TV or projector 3D mode to "side-by-side".

## Building

Building **stereovideo.js** requires the following:

 * Make
 * Node v5.10 or higher

After cloning the repository simply call

```
$ make setup && make
```

to download the necessary Node modules and build the final script and CSS
files.  The results will be in the `dist/` folder.

### Makefile Rules

* **all**
    - Default rule.
    - Compiles the javascript source code, minifies it and then compiles the
      SCSS source files into the final CSS file.
* **setup**
    - Calls `npm install` when a repository has just been created, otherwise
      does nothing.
* **lint**
    - Applies [TSLint](http://palantir.github.io/tslint/) to the TypeScript
      source code.
* **doc**
    - Builds the source code's documentation.  The result will be in `docs/`.

## Usage

The example below shows how to embed a **stereovideo.js** player in a page.  It
waits until the page is finished loading before creating the player itself.

```
<!doctype html>
<html>
    <head>
        <link rel='stylesheet' href='stereovideo.css' type='text/css' />
        <script src='stereovideo.min.js'></script>
        <script>
            var viewer = null;
            window.onload = (function() {
                viewer = new StereoVideo('player', {
                    video: {
                        image: 'video.mp4',
                        depth: 'depthmap.mp4'
                    }
                });
            });
        </script>
    </head>
    <body>
        <div id='player'></div>
    </body>
<html>
```

### API

The public API consists of a single class: `StereoVideo`.  It provides some
simple control over the player.  A complete documentation can be generated via
`make doc`.

#### Constructor

* StereoVideo(*id*, *options*)
    - *id*: the ID of the `<div>` that will hold the player
    - *options*: the runtime options (see below)

The *options* object has the following properties:
* *video* (required)
    * *image*: path to the video containing the normal camera footage
    * *depth*: path to the video containing the depth maps
* *bias*
    * An *input-range* that controls the possible range for bias values along
      with the default.
* *scale*
    * Like *bias*, except it controls the scaling slider.
* *display*
    * Specify what that default display type should be when the player first
      starts.  This can be one of the following strings:
      - `image`
      - `depth`
      - `anaglyph`
      - `side-by-side`
* *stereo*
    * A boolean value where if set to `true` then the *video.depth* option is
      treated like the right camera in a stereo pair instead of a depth map.
      This will disable the depth adjustment panel.

The *input-range* that controls the *bias* and *scale* options have at most
three properties:
 * *max*
    * The maximum value in the range.
 * *min*
    * The minimum value in the range.
 * *default*
    * The starting value.

The following are valid *input-range* objects:

* All three properties.
```json
{
    "min": -10,
    "max": 10,
    "default": 3
}
```

* The minimum and maximum specified but no default.  Both properties must be
  specified or an exception is thrown.
```json
{
    "min": -10,
    "max": 10
}
```

* Only the default is specified.
```json
{
    "default": 3
}
```

#### Methods

* .Play()
    * Start playing the video.
* .Pause()
    * Pause the video if it's already playing.
* .Reset()
    * Reset the video so that it starts playing again from the beginning.

# Attributions

This project uses Google's [Material icons](https://design.google.com/icons/),
available under a [CC-BY](https://creativecommons.org/licenses/by/4.0/)
licence.

# Licence

Copyright (c) 2016 Richard Rzeszutek under a BSD Licence.
