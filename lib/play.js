/**
 * play.js - terminal player for ttystudio
 * Copyright (c) 2015, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/ttystudio
 */

var fs = require('fs')
  , blessed = require('blessed');

module.exports = function(options, callback) {
  var frames = JSON.parse(fs.readFileSync(options.files[0], 'utf8'));

  var screen = blessed.screen({
    smartCSR: true
  });

  setInterval(function() {
    if (!frames.length) return callback();
    screen.lines = frames.shift();
    screen.lines.forEach(function(line) {
      line.dirty = true;
    });
    screen.render();
  }, options.delay || 100);
};
