# ttystudio

__A terminal-to-gif recorder minus the headaches.__

![ttystudio](https://raw.githubusercontent.com/chjj/ttystudio/master/img/example.gif)

Record your terminal and compile it to a GIF or APNG without any external
dependencies, bash scripts, gif concatenation, etc.

## Usage

``` bash
$ ttystudio output.gif --log
  $ vim
    hello world
    :q!
  $ ^Q # stop recording with ctrl-q
initializing writer
writing image
writing head
writing frame 0 - 132 left
writing frame 1 - 131 left
writing frame 2 - 130 left
...
writing frame 131 - 1 left
writing eof
wrote image to /home/chjj/output.gif
$ chromium output.gif
# or if you wrote to output.png (an APNG)
$ firefox output.png
```

## The Difference

ttystudio differs from other terminal recorders in that:

1. It has its own built-in gif and apng writer, no imagemagick required.
2. It has a font parser to render the font during image writing so no terminal
   playback is required when writing the image (this also means __no GUI is
   required at all__ - you can record on a remote machine via ssh).
3. No concatenation of hundreds of gif files required. ttystudio automatically
   writes out to one gif or apng.
4. No glitchy frames due to imperfect GUI recording of the playback or gif
   concatenation.
5. ttystudio will record frames even if nothing is being updated on the screen.

This project has ended up making use of years of work I've done writing
terminal libraries (my personal obsession). Once all the pieces were there,
this project became possible. It also sprang out of a need to find a
terminal-to-gif recorder that actually worked.

<sup>(NOTE: The above .gif was recorded with ttystudio - _nested_ ttystudio
instances cause a slight glitch where the cursor is not visible. Not to matter
in most cases).</sup>


## More Usage

``` bash
$ ttystudio output.gif --log # record and compile
$ ttystudio frames.json --log # record
$ ttystudio frames.json output.gif --range=0-50 # compile
```


### Use a frames.json file

``` bash
$ ttystudio --record frames.json --interval=100 # grab each frame on a 100ms interval
  $ vim
    hello world
    :q!
  $ ^Q # stop recording with ctrl-q
$ ttystudio --compile frames.json output.gif --log
parsing json
initializing writer
writing image
writing head
writing frame 0 - 132 left
writing frame 1 - 131 left
writing frame 2 - 130 left
...
writing frame 131 - 1 left
writing eof
wrote image to /home/chjj/output.gif
$ chromium output.gif
# or if you wrote to output.png (an APNG)
$ firefox output.png
```


## How it works

1. `$ ttystudio --record frames.json`:
   [blessed][blessed]+[term.js][term.js]+[pty.js][pty.js] will spawn a
   pseudo-terminal to let you record until you press ^Q.
2. `$ ttystudio --compile frames.json output.gif`: ttystudio will parse each set of
   frames into a bitmap, keeping in mind the foreground color and character in
   each cell.
3. It will use its parsed font (terminus-u14n/b by default) to render pixels
   for each characters in the image.
4. It will write out each frame to a .gif or .png file of your choice.

It's that simple. No bash script to run. No gifs to concatenate. No external
dependencies required (i.e. ffmpeg or imagemagick) - ttystudio does it all on
its own, in 99% javascript (aside from pty.js which is a node c++ binding to
spawn terminals).


## Bonus

To watch your recording __in__ your terminal, check out [tng][tng]:

``` bash
$ tng output.gif --height=$(($(tput lines) - 2))
```


## Other Options

Compiling to APNG:

``` bash
$ ttystudio frames.json output.png --log
```

Accidentally recorded something you don't want in your image? The `range`
option can help:

``` bash
# compile only frames 5 to 130
$ ttystudio frames.json output.gif --log --range=5-130
```

The `delay` option sets the delay between frames in the final image:

``` bash
# 100ms between output frames
$ ttystudio frames.json output.png --log --delay=100
```

The `--no-palette/--rgba` option can be used to avoid use a global palette
(color type 3) when compiling APNGs (this is known to cause high memory usage
when building the palette since it has to parse every frame beforehand).
Instead, it will use color type 6 (RGBA). This will make the APNG larger, but
does not risk OOMing the process. OOMing the process is unlikely to happen, but
if it does, this option is here. Use `pngcrush` afterwards to optimize.

``` bash
$ ttystudio frames.json output.png --log --rgba
```

Piping:

``` bash
$ ttystudio frames.json - | feh -
```


## Choosing a new font for your terminal recording

Since ttystudio does not record a GUI, it needs to know which font you want to
use (it has no real idea of the font your terminal is using). ttystudio uses
terminus (ter-u14n/b) by default, but you can change this.

Your font __must__ be in [BDF][bdf] format. Once you have your font ready,
place it in the `fonts/` directory in ttystudio and run `$ make`.
ttystudio+pxxl.js will convert the `.bdf` font to a glyph bitmap format in a
json file, which is what ttystudio uses.

``` bash
$ cp ~/ter-u12n.bdf ~/ttystudio/fonts/
$ cp ~/ter-u12b.bdf ~/ttystudio/fonts/
$ cd ~/ttystudio/fonts
$ make
...
$ ttystudio output.gif --log \
  --font ~/ttystudio/fonts/ter-u12n.json \
  --font-bold ~/ttystudio/fonts/ter-u12b.json
```


## Notes

A special thanks to the folks who developed [pxxl.js][pxxl.js] - a BDF font
parser. Without them, it would not have been possible to render a reasonable
looking font to the output gif/png.


## Todo

- Frame offset optimization (with dispose methods).
- More fonts and font formats supported.
- Antialiased fonts.
- Emit frames as events in writers.
- Better documentation.


## Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your code
to be distributed under the MIT license. You are also implicitly verifying that
all code is your original work. `</legalese>`


## License

Copyright (c) 2015, Christopher Jeffrey. (MIT License)

See LICENSE for more info.

[blessed]: https://github.com/chjj/blessed
[term.js]: https://github.com/chjj/term.js
[pty.js]: https://github.com/chjj/pty.js
[pxxl.js]: https://github.com/remcoder/Pxxl.js
[tng]: https://github.com/chjj/tng
[bdf]: https://en.wikipedia.org/wiki/Glyph_Bitmap_Distribution_Format