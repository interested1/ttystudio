/**
 * record.js - terminal recorder for ttystudio
 * Copyright (c) 2015, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/ttystudio
 */

var EventEmitter = require('events').EventEmitter
  , fs = require('fs')
  , cp = require('child_process')
  , blessed = require('blessed');

module.exports = function(options, callback) {
  var frames = []
    , out
    , termName = 'xterm'
    , screen
    , tty
    , timeout;

  try {
    out = cp.execSync('tput -Txterm-256color longname', { encoding: 'utf8' });
    if (~out.indexOf('256 colors')) {
      termName = 'xterm-256color';
    }
  } catch (e) {
    ;
  }

  screen = blessed.screen({
    smartCSR: true
  });

  tty = blessed.terminal({
    parent: screen,
    cursorBlink: false,
    screenKeys: false,
    left: 0,
    top: 0,
    term: options.term || termName,
    width: screen.width,
    height: screen.height
  });

  timeout = setInterval(function() {
    var lines = []
      , y
      , line
      , cx
      , x
      , cell
      , attr
      , ch;

    for (y = 0; y < screen.lines.length; y++) {
      line = [];
      if (y === tty.term.y
          && tty.term.cursorState
          && (tty.term.ydisp === tty.term.ybase || tty.term.selectMode)
          && !tty.term.cursorHidden) {
        cx = tty.term.x;
      } else {
        cx = -1;
      }
      for (x = 0; x < screen.lines[y].length; x++) {
        cell = screen.lines[y][x];
        attr = cell[0];
        ch = cell[1];
        if (x === cx) attr = (0x1ff << 9) | 15;
        line.push([attr, ch]);
      }
      lines.push(line);
    }
    frames.push(lines);
  }, options.interval || 100);

  timeout.unref();

  function done() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;

      process.removeAllListeners('exit');

      screen.program.flush();
      screen.program._exiting = true;

      tty.pty.kill();
      tty.term.write('\x1b[H\x1b[2J');
      screen.leave();

      callback(null, frames);
    }
  }

  screen.key(options.key || 'C-q', done);

  process.on('exit', done);
};
