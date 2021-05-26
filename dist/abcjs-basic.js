(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["abcjs"] = factory();
	else
		root["ABCJS"] = factory();
})(this, function() {
return /******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

__webpack_require__(/*! ./license */ "./license.js");

var version = __webpack_require__(/*! ./version */ "./version.js");

var animation = __webpack_require__(/*! ./src/api/abc_animation */ "./src/api/abc_animation.js");

var tuneBook = __webpack_require__(/*! ./src/api/abc_tunebook */ "./src/api/abc_tunebook.js");

var sequence = __webpack_require__(/*! ./src/synth/abc_midi_sequencer */ "./src/synth/abc_midi_sequencer.js");

var abcjs = {};
abcjs.signature = "abcjs-basic v" + version;
Object.keys(animation).forEach(function (key) {
  abcjs[key] = animation[key];
});
Object.keys(tuneBook).forEach(function (key) {
  abcjs[key] = tuneBook[key];
});
abcjs.renderAbc = __webpack_require__(/*! ./src/api/abc_tunebook_svg */ "./src/api/abc_tunebook_svg.js");
abcjs.TimingCallbacks = __webpack_require__(/*! ./src/api/abc_timing_callbacks */ "./src/api/abc_timing_callbacks.js");

var glyphs = __webpack_require__(/*! ./src/write/abc_glyphs */ "./src/write/abc_glyphs.js");

abcjs.setGlyph = glyphs.setSymbol;

var CreateSynth = __webpack_require__(/*! ./src/synth/create-synth */ "./src/synth/create-synth.js");

var instrumentIndexToName = __webpack_require__(/*! ./src/synth/instrument-index-to-name */ "./src/synth/instrument-index-to-name.js");

var pitchToNoteName = __webpack_require__(/*! ./src/synth/pitch-to-note-name */ "./src/synth/pitch-to-note-name.js");

var SynthSequence = __webpack_require__(/*! ./src/synth/synth-sequence */ "./src/synth/synth-sequence.js");

var CreateSynthControl = __webpack_require__(/*! ./src/synth/create-synth-control */ "./src/synth/create-synth-control.js");

var registerAudioContext = __webpack_require__(/*! ./src/synth/register-audio-context */ "./src/synth/register-audio-context.js");

var activeAudioContext = __webpack_require__(/*! ./src/synth/active-audio-context */ "./src/synth/active-audio-context.js");

var supportsAudio = __webpack_require__(/*! ./src/synth/supports-audio */ "./src/synth/supports-audio.js");

var playEvent = __webpack_require__(/*! ./src/synth/play-event */ "./src/synth/play-event.js");

var SynthController = __webpack_require__(/*! ./src/synth/synth-controller */ "./src/synth/synth-controller.js");

var getMidiFile = __webpack_require__(/*! ./src/synth/get-midi-file */ "./src/synth/get-midi-file.js");

abcjs.synth = {
  CreateSynth: CreateSynth,
  instrumentIndexToName: instrumentIndexToName,
  pitchToNoteName: pitchToNoteName,
  SynthController: SynthController,
  SynthSequence: SynthSequence,
  CreateSynthControl: CreateSynthControl,
  registerAudioContext: registerAudioContext,
  activeAudioContext: activeAudioContext,
  supportsAudio: supportsAudio,
  playEvent: playEvent,
  getMidiFile: getMidiFile,
  sequence: sequence
};
abcjs['Editor'] = __webpack_require__(/*! ./src/edit/abc_editor */ "./src/edit/abc_editor.js");
abcjs['EditArea'] = __webpack_require__(/*! ./src/edit/abc_editarea */ "./src/edit/abc_editarea.js");
module.exports = abcjs;

/***/ }),

/***/ "./license.js":
/*!********************!*\
  !*** ./license.js ***!
  \********************/
/***/ (function() {

/**!
Copyright (c) 2009-2021 Paul Rosen and Gregory Dyke

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

**This text is from: http://opensource.org/licenses/MIT**
!**/

/***/ }),

/***/ "./src/api/abc_animation.js":
/*!**********************************!*\
  !*** ./src/api/abc_animation.js ***!
  \**********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

//    abc_animation.js: handles animating the music in real time.
var TimingCallbacks = __webpack_require__(/*! ./abc_timing_callbacks */ "./src/api/abc_timing_callbacks.js");

var animation = {};

(function () {
  "use strict";

  var timer;
  var cursor;

  animation.startAnimation = function (paper, tune, options) {
    //options.bpm
    //options.showCursor
    //options.hideCurrentMeasure
    //options.hideFinishedMeasures
    if (timer) {
      timer.stop();
      timer = undefined;
    }

    if (options.showCursor) {
      cursor = paper.querySelector('.abcjs-cursor');

      if (!cursor) {
        cursor = document.createElement('DIV');
        cursor.className = 'abcjs-cursor cursor';
        cursor.style.position = 'absolute';
        paper.appendChild(cursor);
        paper.style.position = 'relative';
      }
    }

    function hideMeasures(elements) {
      for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if (!element.classList.contains('abcjs-bar')) element.style.display = "none";
      }
    }

    var lastMeasure;

    function disappearMeasuresAfter(selector) {
      if (lastMeasure) {
        var elements = paper.querySelectorAll(lastMeasure);
        hideMeasures(elements);
      }

      lastMeasure = selector;
    }

    function disappearMeasuresBefore(selector) {
      var elements = paper.querySelectorAll(selector);
      hideMeasures(elements);
    }

    function measureCallback(selector) {
      if (options.hideCurrentMeasure) {
        disappearMeasuresBefore(selector);
      } else if (options.hideFinishedMeasures) {
        disappearMeasuresAfter(selector);
      }
    }

    function getLineAndMeasure(element) {
      return '.abcjs-l' + element.line + '.abcjs-m' + element.measureNumber;
    }

    function setCursor(range) {
      if (range) {
        if (range.measureStart) {
          var selector = getLineAndMeasure(range);
          if (selector) measureCallback(selector);
        }

        if (cursor) {
          cursor.style.left = range.left + "px";
          cursor.style.top = range.top + "px";
          cursor.style.width = range.width + "px";
          cursor.style.height = range.height + "px";
        }
      } else {
        timer.stop();
        timer = undefined;
      }
    }

    timer = new TimingCallbacks(tune, {
      qpm: options.bpm,
      eventCallback: setCursor
    });
    timer.start();
  };

  animation.pauseAnimation = function (pause) {
    if (timer) {
      if (pause) timer.pause();else timer.start();
    }
  };

  animation.stopAnimation = function () {
    if (timer) {
      timer.stop();
      timer = undefined;
    }
  };
})();

module.exports = animation;

/***/ }),

/***/ "./src/api/abc_timing_callbacks.js":
/*!*****************************************!*\
  !*** ./src/api/abc_timing_callbacks.js ***!
  \*****************************************/
/***/ (function(module) {

var TimingCallbacks = function TimingCallbacks(target, params) {
  var self = this;
  if (!params) params = {};
  self.qpm = params.qpm ? parseInt(params.qpm, 10) : null;

  if (!self.qpm) {
    var tempo = target.metaText ? target.metaText.tempo : null;
    self.qpm = target.getBpm(tempo);
  }

  self.extraMeasuresAtBeginning = params.extraMeasuresAtBeginning ? parseInt(params.extraMeasuresAtBeginning, 10) : 0;
  self.beatCallback = params.beatCallback; // This is called for each beat.

  self.eventCallback = params.eventCallback; // This is called for each note or rest encountered.

  self.lineEndCallback = params.lineEndCallback; // This is called when the end of a line is approaching.

  self.lineEndAnticipation = params.lineEndAnticipation ? parseInt(params.lineEndAnticipation, 10) : 0; // How many milliseconds before the end should the call happen.

  self.beatSubdivisions = params.beatSubdivisions ? parseInt(params.beatSubdivisions, 10) : 1; // how many callbacks per beat is desired.

  self.joggerTimer = null;

  self.replaceTarget = function (newTarget) {
    self.noteTimings = newTarget.setTiming(self.qpm, self.extraMeasuresAtBeginning);
    if (newTarget.noteTimings.length === 0) newTarget.setTiming(0, 0);

    if (self.lineEndCallback) {
      self.lineEndTimings = getLineEndTimings(newTarget.noteTimings, self.lineEndAnticipation);
    }

    self.startTime = null;
    self.currentBeat = 0;
    self.currentEvent = 0;
    self.currentLine = 0;
    self.isPaused = false;
    self.isRunning = false;
    self.pausedPercent = null;
    self.justUnpaused = false;
    self.newSeekPercent = 0;
    self.lastTimestamp = 0;
    if (self.noteTimings.length === 0) return; // noteTimings contains an array of events sorted by time. Events that happen at the same time are in the same element of the array.

    self.millisecondsPerBeat = 1000 / (self.qpm / 60) / self.beatSubdivisions;
    self.lastMoment = self.noteTimings[self.noteTimings.length - 1].milliseconds;
    self.totalBeats = Math.round(self.lastMoment / self.millisecondsPerBeat);
  };

  self.replaceTarget(target);

  self.doTiming = function (timestamp) {
    // This is called 60 times a second, that is, every 16 msecs.
    //console.log("doTiming", timestamp, timestamp-self.lastTimestamp);
    if (self.lastTimestamp === timestamp) return; // If there are multiple seeks or other calls, then we can easily get multiple callbacks for the same instant.

    self.lastTimestamp = timestamp;

    if (!self.startTime) {
      self.startTime = timestamp;
    }

    if (!self.isPaused && self.isRunning) {
      var currentTime = timestamp - self.startTime;
      currentTime += 16; // Add a little slop because this function isn't called exactly.

      while (self.noteTimings.length > self.currentEvent && self.noteTimings[self.currentEvent].milliseconds < currentTime) {
        if (self.eventCallback && self.noteTimings[self.currentEvent].type === 'event') {
          var thisStartTime = self.startTime; // the event callback can call seek and change the position from beneath us.

          self.eventCallback(self.noteTimings[self.currentEvent]);

          if (thisStartTime !== self.startTime) {
            currentTime = timestamp - self.startTime;
          }
        }

        self.currentEvent++;
      }

      if (self.lineEndCallback && self.lineEndTimings.length > self.currentLine && self.lineEndTimings[self.currentLine].milliseconds < currentTime && self.currentEvent < self.noteTimings.length) {
        var leftEvent = self.noteTimings[self.currentEvent].milliseconds === currentTime ? self.noteTimings[self.currentEvent] : self.noteTimings[self.currentEvent - 1];
        self.lineEndCallback(self.lineEndTimings[self.currentLine], leftEvent, {
          line: self.currentLine,
          endTimings: self.lineEndTimings,
          currentTime: currentTime
        });
        self.currentLine++;
      }

      if (currentTime < self.lastMoment) {
        requestAnimationFrame(self.doTiming);

        if (self.currentBeat * self.millisecondsPerBeat < currentTime) {
          var ret = self.doBeatCallback(timestamp);
          if (ret !== null) currentTime = ret;
        }
      } else if (self.currentBeat <= self.totalBeats) {
        // Because of timing issues (for instance, if the browser tab isn't active), the beat callbacks might not have happened when they are supposed to. To keep the client programs from having to deal with that, this will keep calling the loop until all of them have been sent.
        if (self.beatCallback) {
          var ret2 = self.doBeatCallback(timestamp);
          if (ret2 !== null) currentTime = ret2;
          requestAnimationFrame(self.doTiming);
        }
      }

      if (currentTime >= self.lastMoment) {
        if (self.eventCallback) {
          // At the end, the event callback can return "continue" to keep from stopping.
          // The event callback can either be a promise or not.
          var promise = self.eventCallback(null);
          self.shouldStop(promise).then(function (shouldStop) {
            if (shouldStop) self.stop();
          });
        } else self.stop();
      }
    }
  };

  self.shouldStop = function (promise) {
    // The return of the last event callback can be "continue" or a promise that returns "continue".
    // If it is then don't call stop. Any other value calls stop.
    return new Promise(function (resolve) {
      if (!promise) return resolve(true);
      if (promise === "continue") return resolve(false);

      if (promise.then) {
        promise.then(function (result) {
          resolve(result !== "continue");
        });
      }
    });
  };

  self.doBeatCallback = function (timestamp) {
    if (self.beatCallback) {
      var next = self.currentEvent;

      while (next < self.noteTimings.length && self.noteTimings[next].left === null) {
        next++;
      }

      var endMs;
      var ev;

      if (next < self.noteTimings.length) {
        endMs = self.noteTimings[next].milliseconds;
        next = self.currentEvent - 1;

        while (next >= 0 && self.noteTimings[next].left === null) {
          next--;
        }

        ev = self.noteTimings[next];
      }

      var position = {};
      var debugInfo = {};

      if (ev) {
        position.top = ev.top;
        position.height = ev.height; // timestamp = the time passed in from the animation timer
        // self.startTime = the time that the tune was started (if there was seeking or pausing, it is adjusted to keep the math the same)
        // ev = the event that is either happening now or has most recently passed.
        // ev.milliseconds = the time that the current event starts (relative to self.startTime)
        // endMs = the time that the next event starts
        // ev.endX = the x coordinate that the next event happens (or the end of the line or repeat measure)
        // ev.left = the x coordinate of the current event
        //
        // The output is the X coordinate of the current cursor location. It is calculated with the ratio of the length of the event and the width of it.

        var offMs = Math.max(0, timestamp - self.startTime - ev.milliseconds); // Offset in time from the last beat

        var gapMs = endMs - ev.milliseconds; // Length of this event in time

        var gapPx = ev.endX - ev.left; // The length in pixels

        var offPx = offMs * gapPx / gapMs;
        position.left = ev.left + offPx;
        debugInfo = {
          timestamp: timestamp,
          startTime: self.startTime,
          ev: ev,
          endMs: endMs,
          offMs: offMs,
          offPs: offPx,
          gapMs: gapMs,
          gapPx: gapPx
        };
      } else {
        debugInfo = {
          timestamp: timestamp,
          startTime: self.startTime
        };
      }

      var thisStartTime = self.startTime; // the beat callback can call seek and change the position from beneath us.

      self.beatCallback(self.currentBeat / self.beatSubdivisions, self.totalBeats / self.beatSubdivisions, self.lastMoment, position, debugInfo);

      if (thisStartTime !== self.startTime) {
        return timestamp - self.startTime;
      } else self.currentBeat++;
    }

    return null;
  }; // In general music doesn't need a timer at 60 fps because notes don't happen that fast.
  // For instance, at 120 beats per minute, a sixteenth note takes 125ms. So just as a
  // compromise value between performance and jank this is set about half that.


  var JOGGING_INTERVAL = 60;

  self.animationJogger = function () {
    // There are some cases where the animation timer doesn't work: for instance when
    // this isn't running in a visible tab and sometimes on mobile devices. We compensate
    // by having a backup timer using setTimeout. This won't be accurate so the performance
    // will be jerky, but without it the requestAnimationFrame might be skipped and so
    // not called again.
    if (self.isRunning) {
      self.doTiming(performance.now());
      self.joggerTimer = setTimeout(self.animationJogger, JOGGING_INTERVAL);
    }
  };

  self.start = function (offsetPercent) {
    self.isRunning = true;

    if (self.isPaused) {
      self.isPaused = false;
      if (offsetPercent === undefined) self.justUnpaused = true;
    }

    if (offsetPercent) {
      self.setProgress(offsetPercent);
    } else if (offsetPercent === 0) {
      self.reset();
    } else if (self.pausedPercent !== null) {
      var now = performance.now();
      var currentTime = self.lastMoment * self.pausedPercent;
      self.startTime = now - currentTime;
      self.pausedPercent = null;
      self.reportNext = true;
    }

    requestAnimationFrame(self.doTiming);
    self.joggerTimer = setTimeout(self.animationJogger, JOGGING_INTERVAL);
  };

  self.pause = function () {
    self.isPaused = true;
    var now = performance.now();
    self.pausedPercent = (now - self.startTime) / self.lastMoment;
    self.isRunning = false;

    if (self.joggerTimer) {
      clearTimeout(self.joggerTimer);
      self.joggerTimer = null;
    }
  };

  self.reset = function () {
    self.currentBeat = 0;
    self.currentEvent = 0;
    self.currentLine = 0;
    self.startTime = null;
    self.pausedPercent = null;
  };

  self.stop = function () {
    self.pause();
    self.reset();
  };

  self.setProgress = function (position, units) {
    // the effect of this function is to move startTime so that the callbacks happen correctly for the new seek.
    var currentTime;
    var percent;

    switch (units) {
      case "seconds":
        currentTime = position * 1000;
        if (currentTime < 0) currentTime = 0;
        if (currentTime > self.lastMoment) currentTime = self.lastMoment;
        percent = currentTime / self.lastMoment;
        break;

      case "beats":
        currentTime = position * self.millisecondsPerBeat * self.beatSubdivisions;
        if (currentTime < 0) currentTime = 0;
        if (currentTime > self.lastMoment) currentTime = self.lastMoment;
        percent = currentTime / self.lastMoment;
        break;

      default:
        // this is "percent" or any illegal value
        // this is passed a value between 0 and 1.
        percent = position;
        if (percent < 0) percent = 0;
        if (percent > 1) percent = 1;
        currentTime = self.lastMoment * percent;
        break;
    }

    if (!self.isRunning) self.pausedPercent = percent;
    var now = performance.now();
    self.startTime = now - currentTime;
    var oldEvent = self.currentEvent;
    self.currentEvent = 0;

    while (self.noteTimings.length > self.currentEvent && self.noteTimings[self.currentEvent].milliseconds < currentTime) {
      self.currentEvent++;
    }

    if (self.lineEndCallback) {
      self.currentLine = 0;

      while (self.lineEndTimings.length > self.currentLine && self.lineEndTimings[self.currentLine].milliseconds + self.lineEndAnticipation < currentTime) {
        self.currentLine++;
      }
    }

    var oldBeat = self.currentBeat;
    self.currentBeat = Math.floor(currentTime / self.millisecondsPerBeat);
    if (self.beatCallback && oldBeat !== self.currentBeat) // If the movement caused the beat to change, then immediately report it to the client.
      self.doBeatCallback(self.startTime + currentTime);
    if (self.eventCallback && self.currentEvent >= 0 && self.noteTimings[self.currentEvent].type === 'event') self.eventCallback(self.noteTimings[self.currentEvent]);
    if (self.lineEndCallback) self.lineEndCallback(self.lineEndTimings[self.currentLine], self.noteTimings[self.currentEvent], {
      line: self.currentLine,
      endTimings: self.lineEndTimings
    });
    self.joggerTimer = setTimeout(self.animationJogger, JOGGING_INTERVAL);
  };
};

function getLineEndTimings(timings, anticipation) {
  // Returns an array of milliseconds to call the lineEndCallback.
  // This figures out the timing of the beginning of each line and subtracts the anticipation from it.
  var callbackTimes = [];
  var lastTop = null;

  for (var i = 0; i < timings.length; i++) {
    var timing = timings[i];

    if (timing.type !== 'end' && timing.top !== lastTop) {
      callbackTimes.push({
        measureNumber: timing.measureNumber,
        milliseconds: timing.milliseconds - anticipation,
        top: timing.top,
        bottom: timing.top + timing.height
      });
      lastTop = timing.top;
    }
  }

  return callbackTimes;
}

module.exports = TimingCallbacks;

/***/ }),

/***/ "./src/api/abc_tunebook.js":
/*!*********************************!*\
  !*** ./src/api/abc_tunebook.js ***!
  \*********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

//    abc_tunebook.js: splits a string representing ABC Music Notation into individual tunes.
var Parse = __webpack_require__(/*! ../parse/abc_parse */ "./src/parse/abc_parse.js");

var bookParser = __webpack_require__(/*! ../parse/abc_parse_book */ "./src/parse/abc_parse_book.js");

var tunebook = {};

(function () {
  "use strict";

  tunebook.numberOfTunes = function (abc) {
    var tunes = abc.split("\nX:");
    var num = tunes.length;
    if (num === 0) num = 1;
    return num;
  };

  var TuneBook = tunebook.TuneBook = function (book) {
    var parsed = bookParser(book);
    this.header = parsed.header;
    this.tunes = parsed.tunes;
  };

  TuneBook.prototype.getTuneById = function (id) {
    for (var i = 0; i < this.tunes.length; i++) {
      if (this.tunes[i].id === '' + id) return this.tunes[i];
    }

    return null;
  };

  TuneBook.prototype.getTuneByTitle = function (title) {
    for (var i = 0; i < this.tunes.length; i++) {
      if (this.tunes[i].title === title) return this.tunes[i];
    }

    return null;
  };

  tunebook.parseOnly = function (abc, params) {
    var numTunes = tunebook.numberOfTunes(abc); // this just needs to be passed in because this tells the engine how many tunes to process.

    var output = [];

    for (var i = 0; i < numTunes; i++) {
      output.push(1);
    }

    function callback() {// Don't need to do anything with the parsed tunes.
    }

    return tunebook.renderEngine(callback, output, abc, params);
  };

  tunebook.renderEngine = function (callback, output, abc, params) {
    var ret = [];

    var isArray = function isArray(testObject) {
      return testObject && !testObject.propertyIsEnumerable('length') && _typeof(testObject) === 'object' && typeof testObject.length === 'number';
    }; // check and normalize input parameters


    if (output === undefined || abc === undefined) return;
    if (!isArray(output)) output = [output];
    if (params === undefined) params = {};
    var currentTune = params.startingTune ? parseInt(params.startingTune, 10) : 0; // parse the abc string

    var book = new TuneBook(abc);
    var abcParser = new Parse(); // output each tune, if it exists. Otherwise clear the div.

    for (var i = 0; i < output.length; i++) {
      var div = output[i];

      if (div === "*") {// This is for "headless" rendering: doing the work but not showing the svg.
      } else if (typeof div === "string") div = document.getElementById(div);

      if (div) {
        if (currentTune >= 0 && currentTune < book.tunes.length) {
          abcParser.parse(book.tunes[currentTune].abc, params, book.tunes[currentTune].startPos - book.header.length);
          var tune = abcParser.getTune();
          var warnings = abcParser.getWarnings();
          if (warnings) tune.warnings = warnings;
          var override = callback(div, tune, i, book.tunes[currentTune].abc);
          ret.push(override ? override : tune);
        } else {
          if (div['innerHTML']) div.innerHTML = "";
        }
      }

      currentTune++;
    }

    return ret;
  };

  function flattenTune(tuneObj) {
    // This removes the line breaks and removes the non-music lines.
    var staves = [];

    for (var j = 0; j < tuneObj.lines.length; j++) {
      var line = tuneObj.lines[j];

      if (line.staff) {
        for (var k = 0; k < line.staff.length; k++) {
          var staff = line.staff[k];
          if (!staves[k]) staves[k] = staff;else {
            for (var i = 0; i < staff.voices.length; i++) {
              if (staves[k].voices[i]) staves[k].voices[i] = staves[k].voices[i].concat(staff.voices[i]); // TODO-PER: If staves[k].voices[i] doesn't exist, that means a voice appeared in the middle of the tune. That isn't handled yet.
            }
          }
        }
      }
    }

    return staves;
  }

  function measuresParser(staff, tune) {
    var voices = [];
    var lastChord = null;
    var measureStartChord = null;
    var fragStart = null;
    var hasNotes = false;

    for (var i = 0; i < staff.voices.length; i++) {
      var voice = staff.voices[i];
      voices.push([]);

      for (var j = 0; j < voice.length; j++) {
        var elem = voice[j];

        if (fragStart === null && elem.startChar >= 0) {
          fragStart = elem.startChar;
          if (elem.chord === undefined) measureStartChord = lastChord;else measureStartChord = null;
        }

        if (elem.chord) lastChord = elem;

        if (elem.el_type === 'bar') {
          if (hasNotes) {
            var frag = tune.abc.substring(fragStart, elem.endChar);
            var measure = {
              abc: frag
            };
            lastChord = measureStartChord && measureStartChord.chord && measureStartChord.chord.length > 0 ? measureStartChord.chord[0].name : null;
            if (lastChord) measure.lastChord = lastChord;
            if (elem.startEnding) measure.startEnding = elem.startEnding;
            if (elem.endEnding) measure.endEnding = elem.endEnding;
            voices[i].push(measure);
            fragStart = null;
            hasNotes = false;
          }
        } else if (elem.el_type === 'note') {
          hasNotes = true;
        }
      }
    }

    return voices;
  }

  tunebook.extractMeasures = function (abc) {
    var tunes = [];
    var book = new TuneBook(abc);

    for (var i = 0; i < book.tunes.length; i++) {
      var tune = book.tunes[i];
      var arr = tune.abc.split("K:");
      var arr2 = arr[1].split("\n");
      var header = arr[0] + "K:" + arr2[0] + "\n";
      var lastChord = null;
      var measureStartChord = null;
      var fragStart = null;
      var measures = [];
      var hasNotes = false;
      var tuneObj = tunebook.parseOnly(tune.abc)[0];
      var hasPickup = tuneObj.getPickupLength() > 0; // var staves = flattenTune(tuneObj);
      // for (var s = 0; s < staves.length; s++) {
      // 	var voices = measuresParser(staves[s], tune);
      // 	if (s === 0)
      // 		measures = voices;
      // 	else {
      // 		for (var ss = 0; ss < voices.length; ss++) {
      // 			var voice = voices[ss];
      // 			if (measures.length <= ss)
      // 				measures.push([]);
      // 			var measureVoice = measures[ss];
      // 			for (var sss = 0; sss < voice.length; sss++) {
      // 				if (measureVoice.length > sss)
      // 					measureVoice[sss].abc += "\n" + voice[sss].abc;
      // 				else
      // 					measures.push(voice[sss]);
      // 			}
      // 		}
      // 	}
      // 	console.log(voices);
      // }
      // measures = measures[0];

      for (var j = 0; j < tuneObj.lines.length; j++) {
        var line = tuneObj.lines[j];

        if (line.staff) {
          for (var k = 0; k < 1
          /*line.staff.length*/
          ; k++) {
            var staff = line.staff[k];

            for (var kk = 0; kk < 1
            /*staff.voices.length*/
            ; kk++) {
              var voice = staff.voices[kk];

              for (var kkk = 0; kkk < voice.length; kkk++) {
                var elem = voice[kkk];

                if (fragStart === null && elem.startChar >= 0) {
                  fragStart = elem.startChar;
                  if (elem.chord === undefined) measureStartChord = lastChord;else measureStartChord = null;
                }

                if (elem.chord) lastChord = elem;

                if (elem.el_type === 'bar') {
                  if (hasNotes) {
                    var frag = tune.abc.substring(fragStart, elem.endChar);
                    var measure = {
                      abc: frag
                    };
                    lastChord = measureStartChord && measureStartChord.chord && measureStartChord.chord.length > 0 ? measureStartChord.chord[0].name : null;
                    if (lastChord) measure.lastChord = lastChord;
                    if (elem.startEnding) measure.startEnding = elem.startEnding;
                    if (elem.endEnding) measure.endEnding = elem.endEnding;
                    measures.push(measure);
                    fragStart = null;
                    hasNotes = false;
                  }
                } else if (elem.el_type === 'note') {
                  hasNotes = true;
                }
              }
            }
          }
        }
      }

      tunes.push({
        header: header,
        measures: measures,
        hasPickup: hasPickup
      });
    }

    return tunes;
  };
})();

module.exports = tunebook;

/***/ }),

/***/ "./src/api/abc_tunebook_svg.js":
/*!*************************************!*\
  !*** ./src/api/abc_tunebook_svg.js ***!
  \*************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var tunebook = __webpack_require__(/*! ./abc_tunebook */ "./src/api/abc_tunebook.js");

var Tune = __webpack_require__(/*! ../data/abc_tune */ "./src/data/abc_tune.js");

var EngraverController = __webpack_require__(/*! ../write/abc_engraver_controller */ "./src/write/abc_engraver_controller.js");

var Parse = __webpack_require__(/*! ../parse/abc_parse */ "./src/parse/abc_parse.js");

var wrap = __webpack_require__(/*! ../parse/wrap_lines */ "./src/parse/wrap_lines.js");

var parseCommon = __webpack_require__(/*! ../parse/abc_common */ "./src/parse/abc_common.js");

var resizeDivs = {};

function resizeOuter() {
  var width = window.innerWidth;

  for (var id in resizeDivs) {
    if (resizeDivs.hasOwnProperty(id)) {
      var outer = resizeDivs[id];
      var ofs = outer.offsetLeft;
      width -= ofs * 2;
      outer.style.width = width + "px";
    }
  }
}

try {
  window.addEventListener("resize", resizeOuter);
  window.addEventListener("orientationChange", resizeOuter);
} catch (e) {// if we aren't in a browser, this code will crash, but it is not needed then either.
}

function renderOne(div, tune, params, tuneNumber) {
  if (params.viewportHorizontal) {
    // Create an inner div that holds the music, so that the passed in div will be the viewport.
    div.innerHTML = '<div class="abcjs-inner"></div>';

    if (params.scrollHorizontal) {
      div.style.overflowX = "auto";
      div.style.overflowY = "hidden";
    } else div.style.overflow = "hidden";

    resizeDivs[div.id] = div; // We use a hash on the element's id so that multiple calls won't keep adding to the list.

    div = div.children[0]; // The music should be rendered in the inner div.
  } else if (params.viewportVertical) {
    // Create an inner div that holds the music, so that the passed in div will be the viewport.
    div.innerHTML = '<div class="abcjs-inner scroll-amount"></div>';
    div.style.overflowX = "hidden";
    div.style.overflowY = "auto";
    div = div.children[0]; // The music should be rendered in the inner div.
  } else div.innerHTML = "";

  var engraver_controller = new EngraverController(div, params);
  engraver_controller.engraveABC(tune, tuneNumber);
  tune.engraver = engraver_controller;

  if (params.viewportVertical || params.viewportHorizontal) {
    // If we added a wrapper around the div, then we need to size the wrapper, too.
    var parent = div.parentNode;
    parent.style.width = div.style.width;
  }
}

function renderEachLineSeparately(div, tune, params, tuneNumber) {
  function initializeTuneLine(tune) {
    var obj = new Tune();
    obj.formatting = tune.formatting;
    obj.media = tune.media;
    obj.version = tune.version;
    obj.metaText = {};
    obj.lines = [];
    return obj;
  } // Before rendering, chop up the returned tune into an array where each element is a line.
  // The first element of the array gets the title and other items that go on top, the last element
  // of the array gets the extra text that goes on bottom. Each element gets any non-music info that comes before it.


  var tunes = [];
  var tuneLine;

  for (var i = 0; i < tune.lines.length; i++) {
    var line = tune.lines[i];
    if (!tuneLine) tuneLine = initializeTuneLine(tune);

    if (i === 0) {
      // These items go on top of the music
      tuneLine.metaText.tempo = tune.metaText.tempo;
      tuneLine.metaText.title = tune.metaText.title;
      tuneLine.metaText.header = tune.metaText.header;
      tuneLine.metaText.rhythm = tune.metaText.rhythm;
      tuneLine.metaText.origin = tune.metaText.origin;
      tuneLine.metaText.composer = tune.metaText.composer;
      tuneLine.metaText.author = tune.metaText.author;
      tuneLine.metaText.partOrder = tune.metaText.partOrder;
    } // push the lines until we get to a music line


    tuneLine.lines.push(line);

    if (line.staff) {
      tunes.push(tuneLine);
      tuneLine = undefined;
    }
  } // Add any extra stuff to the last line.


  if (tuneLine) {
    var lastLine = tunes[tunes.length - 1];

    for (var j = 0; j < tuneLine.lines.length; j++) {
      lastLine.lines.push(tuneLine.lines[j]);
    }
  } // These items go below the music


  tuneLine = tunes[tunes.length - 1];
  tuneLine.metaText.unalignedWords = tune.metaText.unalignedWords;
  tuneLine.metaText.book = tune.metaText.book;
  tuneLine.metaText.source = tune.metaText.source;
  tuneLine.metaText.discography = tune.metaText.discography;
  tuneLine.metaText.notes = tune.metaText.notes;
  tuneLine.metaText.transcription = tune.metaText.transcription;
  tuneLine.metaText.history = tune.metaText.history;
  tuneLine.metaText['abc-copyright'] = tune.metaText['abc-copyright'];
  tuneLine.metaText['abc-creator'] = tune.metaText['abc-creator'];
  tuneLine.metaText['abc-edited-by'] = tune.metaText['abc-edited-by'];
  tuneLine.metaText.footer = tune.metaText.footer; // Now create sub-divs and render each line. Need to copy the params to change the padding for the interior slices.

  var ep = {};

  for (var key in params) {
    if (params.hasOwnProperty(key)) {
      ep[key] = params[key];
    }
  }

  var origPaddingTop = ep.paddingtop;
  var origPaddingBottom = ep.paddingbottom;
  div.innerHTML = "";

  for (var k = 0; k < tunes.length; k++) {
    var lineEl = document.createElement("div");
    div.appendChild(lineEl);

    if (k === 0) {
      ep.paddingtop = origPaddingTop;
      ep.paddingbottom = -20;
    } else if (k === tunes.length - 1) {
      ep.paddingtop = 10;
      ep.paddingbottom = origPaddingBottom;
    } else {
      ep.paddingtop = 10;
      ep.paddingbottom = -20;
    }

    if (k < tunes.length - 1) {
      // If it is not the last line, force stretchlast. If it is, stretchlast might have been set by the input parameters.
      tunes[k].formatting = parseCommon.clone(tunes[k].formatting);
      tunes[k].formatting.stretchlast = true;
    }

    renderOne(lineEl, tunes[k], ep, tuneNumber);
    if (k === 0) tune.engraver = tunes[k].engraver;else {
      if (!tune.engraver.staffgroups) tune.engraver.staffgroups = tunes[k].engraver.staffgroups;else if (tunes[k].engraver.staffgroups.length > 0) tune.engraver.staffgroups.push(tunes[k].engraver.staffgroups[0]);
    }
  }
} // A quick way to render a tune from javascript when interactivity is not required.
// This is used when a javascript routine has some abc text that it wants to render
// in a div or collection of divs. One tune or many can be rendered.
//
// parameters:
//      output: an array of divs that the individual tunes are rendered to.
//          If the number of tunes exceeds the number of divs in the array, then
//          only the first tunes are rendered. If the number of divs exceeds the number
//          of tunes, then the unused divs are cleared. The divs can be passed as either
//          elements or strings of ids. If ids are passed, then the div MUST exist already.
//          (if a single element is passed, then it is an implied array of length one.)
//          (if a null is passed for an element, or the element doesn't exist, then that tune is skipped.)
//      abc: text representing a tune or an entire tune book in ABC notation.
//      renderParams: hash of:
//          startingTune: an index, starting at zero, representing which tune to start rendering at.
//              (If this element is not present, then rendering starts at zero.)
//          width: 800 by default. The width in pixels of the output paper


var renderAbc = function renderAbc(output, abc, parserParams, engraverParams, renderParams) {
  // Note: all parameters have been condensed into the first ones. It doesn't hurt anything to allow the old format, so just copy them here.
  var params = {};
  var key;

  if (parserParams) {
    for (key in parserParams) {
      if (parserParams.hasOwnProperty(key)) {
        params[key] = parserParams[key];
      }
    }
  }

  if (engraverParams) {
    for (key in engraverParams) {
      if (engraverParams.hasOwnProperty(key)) {
        // There is a conflict with the name of the parameter "listener". If it is in the second parameter, then it is for click.
        if (key === "listener") {
          if (engraverParams[key].highlight) params.clickListener = engraverParams[key].highlight;
        } else params[key] = engraverParams[key];
      }
    }
  }

  if (renderParams) {
    for (key in renderParams) {
      if (renderParams.hasOwnProperty(key)) {
        params[key] = renderParams[key];
      }
    }
  }

  function callback(div, tune, tuneNumber, abcString) {
    var removeDiv = false;

    if (div === "*") {
      removeDiv = true;
      div = document.createElement("div");
      div.setAttribute("style", "visibility: hidden;");
      document.body.appendChild(div);
    }

    if (params.afterParsing) params.afterParsing(tune, tuneNumber, abcString);

    if (!removeDiv && params.wrap && params.staffwidth) {
      tune = doLineWrapping(div, tune, tuneNumber, abcString, params);
      return tune;
    } else if (removeDiv || !params.oneSvgPerLine || tune.lines.length < 2) renderOne(div, tune, params, tuneNumber);else renderEachLineSeparately(div, tune, params, tuneNumber);

    if (removeDiv) div.parentNode.removeChild(div);
    return null;
  }

  return tunebook.renderEngine(callback, output, abc, params);
};

function doLineWrapping(div, tune, tuneNumber, abcString, params) {
  var engraver_controller = new EngraverController(div, params);
  var widths = engraver_controller.getMeasureWidths(tune);
  var ret = wrap.calcLineWraps(tune, widths, params);

  if (ret.reParse) {
    var abcParser = new Parse();
    abcParser.parse(abcString, ret.revisedParams);
    tune = abcParser.getTune();
  }

  if (!params.oneSvgPerLine || tune.lines.length < 2) renderOne(div, tune, ret.revisedParams, tuneNumber);else renderEachLineSeparately(div, tune, ret.revisedParams, tuneNumber);
  tune.explanation = ret.explanation;
  return tune;
}

module.exports = renderAbc;

/***/ }),

/***/ "./src/data/abc_tune.js":
/*!******************************!*\
  !*** ./src/data/abc_tune.js ***!
  \******************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

//    abc_tune.js: a computer usable internal structure representing one tune.
var parseCommon = __webpack_require__(/*! ../parse/abc_common */ "./src/parse/abc_common.js");

var spacing = __webpack_require__(/*! ../write/abc_spacing */ "./src/write/abc_spacing.js");

var sequence = __webpack_require__(/*! ../synth/abc_midi_sequencer */ "./src/synth/abc_midi_sequencer.js");

var flatten = __webpack_require__(/*! ../synth/abc_midi_flattener */ "./src/synth/abc_midi_flattener.js");

var delineTune = __webpack_require__(/*! ./deline-tune */ "./src/data/deline-tune.js");
/**
 * This is the data for a single ABC tune. It is created and populated by the window.ABCJS.parse.Parse class.
 * Also known as the ABCJS Abstract Syntax Tree
 * @alternateClassName ABCJS.Tune
 */


var Tune = function Tune() {
  // The structure consists of a hash with the following two items:
  // metaText: a hash of {key, value}, where key is one of: title, author, rhythm, source, transcription, unalignedWords, etc...
  // tempo: { noteLength: number (e.g. .125), bpm: number }
  // lines: an array of elements, or one of the following:
  //
  // STAFF: array of elements
  // SUBTITLE: string
  //
  // TODO: actually, the start and end char should modify each part of the note type
  // The elements all have a type field and a start and end char
  // field. The rest of the fields depend on the type and are listed below:
  // REST: duration=1,2,4,8; chord: string
  // NOTE: accidental=none,dbl_flat,flat,natural,sharp,dbl_sharp
  //		pitch: "C" is 0. The numbers refer to the pitch letter.
  //		duration: .5 (sixteenth), .75 (dotted sixteenth), 1 (eighth), 1.5 (dotted eighth)
  //			2 (quarter), 3 (dotted quarter), 4 (half), 6 (dotted half) 8 (whole)
  //		chord: { name:chord, position: one of 'default', 'above', 'below' }
  //		end_beam = true or undefined if this is the last note in a beam.
  //		lyric: array of { syllable: xxx, divider: one of " -_" }
  //		startTie = true|undefined
  //		endTie = true|undefined
  //		startTriplet = num <- that is the number to print
  //		endTriplet = true|undefined (the last note of the triplet)
  // TODO: actually, decoration should be an array.
  //		decoration: upbow, downbow, accent
  // BAR: type=bar_thin, bar_thin_thick, bar_thin_thin, bar_thick_thin, bar_right_repeat, bar_left_repeat, bar_double_repeat
  //	number: 1 or 2: if it is the start of a first or second ending
  // CLEF: type=treble,bass
  // KEY-SIG:
  //		accidentals[]: { acc:sharp|dblsharp|natural|flat|dblflat,  note:a|b|c|d|e|f|g }
  // METER: type: common_time,cut_time,specified
  //		if specified, { num: 99, den: 99 }
  this.getBeatLength = function () {
    // This returns a fraction: for instance 1/4 for a quarter
    // There are two types of meters: compound and regular. Compound meter has 3 beats counted as one.
    var meter = this.getMeterFraction();
    var multiplier = 1;
    if (meter.num === 6 || meter.num === 9 || meter.num === 12) multiplier = 3;else if (meter.num === 3 && meter.den === 8) multiplier = 3;
    return multiplier / meter.den;
  };

  function computePickupLength(lines, barLength) {
    var pickupLength = 0;

    for (var i = 0; i < lines.length; i++) {
      if (lines[i].staff) {
        for (var j = 0; j < lines[i].staff.length; j++) {
          for (var v = 0; v < lines[i].staff[j].voices.length; v++) {
            var voice = lines[i].staff[j].voices[v];
            var tripletMultiplier = 1;

            for (var el = 0; el < voice.length; el++) {
              var isSpacer = voice[el].rest && voice[el].rest.type === "spacer";
              if (voice[el].startTriplet) tripletMultiplier = voice[el].tripletMultiplier;
              if (voice[el].duration && !isSpacer && voice[el].el_type !== "tempo") pickupLength += voice[el].duration * tripletMultiplier;
              if (voice[el].endTriplet) tripletMultiplier = 1;
              if (pickupLength >= barLength) pickupLength -= barLength;
              if (voice[el].el_type === 'bar') return pickupLength;
            }
          }
        }
      }
    }

    return pickupLength;
  }

  this.getPickupLength = function () {
    var barLength = this.getBarLength();
    var pickupLength = computePickupLength(this.lines, barLength); // If computed pickup length is very close to 0 or the bar length, we assume
    // that we actually have a full bar and hence no pickup.

    return pickupLength < 1e-8 || barLength - pickupLength < 1e-8 ? 0 : pickupLength;
  };

  this.getBarLength = function () {
    var meter = this.getMeterFraction();
    return meter.num / meter.den;
  };

  this.getTotalTime = function () {
    return this.totalTime;
  };

  this.getTotalBeats = function () {
    return this.totalBeats;
  };

  this.millisecondsPerMeasure = function (bpmOverride) {
    var bpm;

    if (bpmOverride) {
      bpm = bpmOverride;
    } else {
      var tempo = this.metaText ? this.metaText.tempo : null;
      bpm = this.getBpm(tempo);
    }

    if (bpm <= 0) bpm = 1; // I don't think this can happen, but we don't want a possibility of dividing by zero.

    var beatsPerMeasure = this.getBeatsPerMeasure();
    var minutesPerMeasure = beatsPerMeasure / bpm;
    return minutesPerMeasure * 60000;
  };

  this.getBeatsPerMeasure = function () {
    var beatLen = this.getBeatLength();
    var barLen = this.getBarLength();
    return barLen / beatLen;
  };

  this.getMeter = function () {
    for (var i = 0; i < this.lines.length; i++) {
      var line = this.lines[i];

      if (line.staff) {
        for (var j = 0; j < line.staff.length; j++) {
          var meter = line.staff[j].meter;

          if (meter) {
            return meter;
          }
        }
      }
    }

    return {
      type: "common_time"
    };
  };

  this.getMeterFraction = function () {
    var meter = this.getMeter();
    var num = 4;
    var den = 4;

    if (meter) {
      if (meter.type === 'specified') {
        num = parseInt(meter.value[0].num, 10);
        den = parseInt(meter.value[0].den, 10);
      } else if (meter.type === 'cut_time') {
        num = 2;
        den = 2;
      } else if (meter.type === 'common_time') {
        num = 4;
        den = 4;
      }
    }

    this.meter = {
      num: num,
      den: den
    };
    return this.meter; // TODO-PER: is this saved value used anywhere? A get function shouldn't change state.
  };

  this.getKeySignature = function () {
    for (var i = 0; i < this.lines.length; i++) {
      var line = this.lines[i];

      if (line.staff) {
        for (var j = 0; j < line.staff.length; j++) {
          if (line.staff[j].key) return line.staff[j].key;
        }
      }
    }

    return {};
  };

  this.getElementFromChar = function (_char) {
    for (var i = 0; i < this.lines.length; i++) {
      var line = this.lines[i];

      if (line.staff) {
        for (var j = 0; j < line.staff.length; j++) {
          var staff = line.staff[j];

          for (var k = 0; k < staff.voices.length; k++) {
            var voice = staff.voices[k];

            for (var ii = 0; ii < voice.length; ii++) {
              var elem = voice[ii];
              if (elem.startChar && elem.endChar && elem.startChar <= _char && elem.endChar > _char) return elem;
            }
          }
        }
      }
    }

    return null;
  };

  function addVerticalInfo(timingEvents) {
    // Add vertical info to the bar events: put the next event's top, and the event after the next measure's top.
    var lastBarTop;
    var lastBarBottom;
    var lastEventTop;
    var lastEventBottom;

    for (var e = timingEvents.length - 1; e >= 0; e--) {
      var ev = timingEvents[e];

      if (ev.type === 'bar') {
        ev.top = lastEventTop;
        ev.nextTop = lastBarTop;
        lastBarTop = lastEventTop;
        ev.bottom = lastEventBottom;
        ev.nextBottom = lastBarBottom;
        lastBarBottom = lastEventBottom;
      } else if (ev.type === 'event') {
        lastEventTop = ev.top;
        lastEventBottom = ev.top + ev.height;
      }
    }
  }

  function makeSortedArray(hash) {
    var arr = [];

    for (var k in hash) {
      if (hash.hasOwnProperty(k)) arr.push(hash[k]);
    }

    arr = arr.sort(function (a, b) {
      var diff = a.milliseconds - b.milliseconds; // if the events have the same time, make sure a bar comes before a note

      if (diff !== 0) {
        return diff;
      } else {
        return a.type === "bar" ? -1 : 1;
      }
    });
    return arr;
  }

  this.addElementToEvents = function (eventHash, element, voiceTimeMilliseconds, top, height, line, measureNumber, timeDivider, isTiedState, nextIsBar) {
    if (element.hint) return {
      isTiedState: undefined,
      duration: 0
    };
    var realDuration = element.durationClass ? element.durationClass : element.duration;
    if (element.abcelem.rest && element.abcelem.rest.type === "spacer") realDuration = 0;

    if (realDuration > 0) {
      var es = []; // If there is an invisible rest, then there are not elements, so don't push a null one.

      for (var i = 0; i < element.elemset.length; i++) {
        if (element.elemset[i] !== null) es.push(element.elemset[i]);
      }

      var isTiedToNext = element.startTie;

      if (isTiedState !== undefined) {
        eventHash["event" + isTiedState].elements.push(es); // Add the tied note to the first note that it is tied to

        if (nextIsBar) {
          if (!eventHash["event" + voiceTimeMilliseconds]) {
            eventHash["event" + voiceTimeMilliseconds] = {
              type: "event",
              milliseconds: voiceTimeMilliseconds,
              line: line,
              measureNumber: measureNumber,
              top: top,
              height: height,
              left: null,
              width: 0,
              elements: [],
              startChar: null,
              endChar: null,
              startCharArray: [],
              endCharArray: []
            };
          }

          eventHash["event" + voiceTimeMilliseconds].measureStart = true;
          nextIsBar = false;
        }

        if (!isTiedToNext) isTiedState = undefined;
      } else {
        // the last note wasn't tied.
        if (!eventHash["event" + voiceTimeMilliseconds]) {
          eventHash["event" + voiceTimeMilliseconds] = {
            type: "event",
            milliseconds: voiceTimeMilliseconds,
            line: line,
            measureNumber: measureNumber,
            top: top,
            height: height,
            left: element.x,
            width: element.w,
            elements: [es],
            startChar: element.abcelem.startChar,
            endChar: element.abcelem.endChar,
            startCharArray: [element.abcelem.startChar],
            endCharArray: [element.abcelem.endChar],
            midiPitches: element.abcelem.midiPitches ? parseCommon.cloneArray(element.abcelem.midiPitches) : []
          };
          if (element.abcelem.midiGraceNotePitches) eventHash["event" + voiceTimeMilliseconds].midiGraceNotePitches = parseCommon.cloneArray(element.abcelem.midiGraceNotePitches);
        } else {
          // If there is more than one voice then two notes can fall at the same time. Usually they would be lined up in the same place, but if it is a whole rest, then it is placed funny. In any case, the left most element wins.
          if (eventHash["event" + voiceTimeMilliseconds].left) eventHash["event" + voiceTimeMilliseconds].left = Math.min(eventHash["event" + voiceTimeMilliseconds].left, element.x);else eventHash["event" + voiceTimeMilliseconds].left = element.x;
          eventHash["event" + voiceTimeMilliseconds].elements.push(es);
          eventHash["event" + voiceTimeMilliseconds].startCharArray.push(element.abcelem.startChar);
          eventHash["event" + voiceTimeMilliseconds].endCharArray.push(element.abcelem.endChar);
          if (eventHash["event" + voiceTimeMilliseconds].startChar === null) eventHash["event" + voiceTimeMilliseconds].startChar = element.abcelem.startChar;
          if (eventHash["event" + voiceTimeMilliseconds].endChar === null) eventHash["event" + voiceTimeMilliseconds].endChar = element.abcelem.endChar;

          if (element.abcelem.midiPitches && element.abcelem.midiPitches.length) {
            if (!eventHash["event" + voiceTimeMilliseconds].midiPitches) eventHash["event" + voiceTimeMilliseconds].midiPitches = [];

            for (var i = 0; i < element.abcelem.midiPitches.length; i++) {
              eventHash["event" + voiceTimeMilliseconds].midiPitches.push(element.abcelem.midiPitches[i]);
            }
          }

          if (element.abcelem.midiGraceNotePitches && element.abcelem.midiGraceNotePitches.length) {
            if (!eventHash["event" + voiceTimeMilliseconds].midiGraceNotePitches) eventHash["event" + voiceTimeMilliseconds].midiGraceNotePitches = [];

            for (var j = 0; j < element.abcelem.midiGraceNotePitches.length; j++) {
              eventHash["event" + voiceTimeMilliseconds].midiGraceNotePitches.push(element.abcelem.midiGraceNotePitches[j]);
            }
          }
        }

        if (nextIsBar) {
          eventHash["event" + voiceTimeMilliseconds].measureStart = true;
          nextIsBar = false;
        }

        if (isTiedToNext) isTiedState = voiceTimeMilliseconds;
      }
    }

    return {
      isTiedState: isTiedState,
      duration: realDuration / timeDivider,
      nextIsBar: nextIsBar || element.type === 'bar'
    };
  };

  this.makeVoicesArray = function () {
    // First make a new array that is arranged by voice so that the repeats that span different lines are handled correctly.
    var voicesArr = [];
    var measureNumber = [];
    var tempos = {};

    for (var line = 0; line < this.engraver.staffgroups.length; line++) {
      var group = this.engraver.staffgroups[line];
      var firstStaff = group.staffs[0];
      var middleC = firstStaff.absoluteY;
      var top = middleC - firstStaff.top * spacing.STEP;
      var lastStaff = group.staffs[group.staffs.length - 1];
      middleC = lastStaff.absoluteY;
      var bottom = middleC - lastStaff.bottom * spacing.STEP;
      var height = bottom - top;
      var voices = group.voices;

      for (var v = 0; v < voices.length; v++) {
        var noteFound = false;
        if (!voicesArr[v]) voicesArr[v] = [];
        if (measureNumber[v] === undefined) measureNumber[v] = 0;
        var elements = voices[v].children;

        for (var elem = 0; elem < elements.length; elem++) {
          if (elements[elem].type === "tempo") tempos[measureNumber[v]] = this.getBpm(elements[elem].abcelem);
          voicesArr[v].push({
            top: top,
            height: height,
            line: group.line,
            measureNumber: measureNumber[v],
            elem: elements[elem]
          });
          if (elements[elem].type === 'bar' && noteFound) // Count the measures by counting the bar lines, but skip a bar line that appears at the left of the music, before any notes.
            measureNumber[v]++;
          if (elements[elem].type === 'note' || elements[elem].type === 'rest') noteFound = true;
        }
      }
    }

    this.tempoLocations = tempos; // This should be passed back, but the function is accessible publicly so that would break the interface.

    return voicesArr;
  };

  this.setupEvents = function (startingDelay, timeDivider, startingBpm, warp) {
    if (!warp) warp = 1;
    var timingEvents = [];
    var eventHash = {}; // The time is the number of seconds from the beginning of the piece.
    // The units we are scanning are in notation units (i.e. 0.25 is a quarter note)

    var time = startingDelay;
    var isTiedState;
    var nextIsBar = true;
    var voices = this.makeVoicesArray();
    var maxVoiceTimeMilliseconds = 0;

    for (var v = 0; v < voices.length; v++) {
      var voiceTime = time;
      var voiceTimeMilliseconds = Math.round(voiceTime * 1000);
      var startingRepeatElem = 0;
      var endingRepeatElem = -1;
      var elements = voices[v];
      var bpm = startingBpm;
      timeDivider = this.getBeatLength() * bpm / 60;
      var tempoDone = -1;

      for (var elem = 0; elem < elements.length; elem++) {
        var thisMeasure = elements[elem].measureNumber;

        if (tempoDone !== thisMeasure && this.tempoLocations[thisMeasure]) {
          bpm = this.tempoLocations[thisMeasure];
          timeDivider = warp * this.getBeatLength() * bpm / 60;
          tempoDone = thisMeasure;
        }

        var element = elements[elem].elem;
        var ret = this.addElementToEvents(eventHash, element, voiceTimeMilliseconds, elements[elem].top, elements[elem].height, elements[elem].line, elements[elem].measureNumber, timeDivider, isTiedState, nextIsBar);
        isTiedState = ret.isTiedState;
        nextIsBar = ret.nextIsBar;
        voiceTime += ret.duration;
        var lastHash;
        if (element.duration > 0 && eventHash["event" + voiceTimeMilliseconds]) // This won't exist if this is the end of a tie.
          lastHash = "event" + voiceTimeMilliseconds;
        voiceTimeMilliseconds = Math.round(voiceTime * 1000);

        if (element.type === 'bar') {
          var barType = element.abcelem.type;
          var endRepeat = barType === "bar_right_repeat" || barType === "bar_dbl_repeat";
          var startEnding = element.abcelem.startEnding === '1';
          var startRepeat = barType === "bar_left_repeat" || barType === "bar_dbl_repeat" || barType === "bar_right_repeat";

          if (endRepeat) {
            // Force the end of the previous note to the position of the measure - the cursor won't go past the end repeat
            if (elem > 0) {
              eventHash[lastHash].endX = element.x;
            }

            if (endingRepeatElem === -1) endingRepeatElem = elem;
            var lastVoiceTimeMilliseconds = 0;
            tempoDone = -1;

            for (var el2 = startingRepeatElem; el2 < endingRepeatElem; el2++) {
              thisMeasure = elements[el2].measureNumber;

              if (tempoDone !== thisMeasure && this.tempoLocations[thisMeasure]) {
                bpm = this.tempoLocations[thisMeasure];
                timeDivider = warp * this.getBeatLength() * bpm / 60;
                tempoDone = thisMeasure;
              }

              var element2 = elements[el2].elem;
              ret = this.addElementToEvents(eventHash, element2, voiceTimeMilliseconds, elements[el2].top, elements[el2].height, elements[el2].line, elements[el2].measureNumber, timeDivider, isTiedState, nextIsBar);
              isTiedState = ret.isTiedState;
              nextIsBar = ret.nextIsBar;
              voiceTime += ret.duration;
              lastVoiceTimeMilliseconds = voiceTimeMilliseconds;
              voiceTimeMilliseconds = Math.round(voiceTime * 1000);
            }

            if (eventHash["event" + lastVoiceTimeMilliseconds]) // This won't exist if it is the beginning of the next line. That's ok because we will just count the end of the last line as the end.
              eventHash["event" + lastVoiceTimeMilliseconds].endX = elements[endingRepeatElem].elem.x;
            nextIsBar = true;
            endingRepeatElem = -1;
          }

          if (startEnding) endingRepeatElem = elem;
          if (startRepeat) startingRepeatElem = elem;
        }
      }

      maxVoiceTimeMilliseconds = Math.max(maxVoiceTimeMilliseconds, voiceTimeMilliseconds);
    } // now we have all the events, but if there are multiple voices then there may be events out of order or duplicated, so normalize it.


    timingEvents = makeSortedArray(eventHash);
    addVerticalInfo(timingEvents);
    addEndPoints(this.lines, timingEvents);
    timingEvents.push({
      type: "end",
      milliseconds: maxVoiceTimeMilliseconds
    });
    this.addUsefulCallbackInfo(timingEvents, bpm * warp);
    return timingEvents;
  };

  this.addUsefulCallbackInfo = function (timingEvents, bpm) {
    var millisecondsPerMeasure = this.millisecondsPerMeasure(bpm);

    for (var i = 0; i < timingEvents.length; i++) {
      var ev = timingEvents[i];
      ev.millisecondsPerMeasure = millisecondsPerMeasure;
    }
  };

  function skipTies(elements, index) {
    while (index < elements.length && elements[index].left === null) {
      index++;
    }

    return elements[index];
  }

  function addEndPoints(lines, elements) {
    if (elements.length < 1) return;

    for (var i = 0; i < elements.length - 1; i++) {
      var el = elements[i];
      var next = skipTies(elements, i + 1);

      if (el.left !== null) {
        // If there is no left element that is because this is a tie so it should be skipped.
        var endX = next && el.top === next.top ? next.left : lines[el.line].staffGroup.w; // If this is already set, it is because the notes aren't sequential here, like the next thing is a repeat bar line.
        // In that case, the right-most position is passed in. There could still be an intervening note in another voice, so always look for the closest position.
        // If there is a repeat that stays on the same line, the endX set above won't be right because the next note will be before. In that case, use the endX that was calculated.

        if (el.endX !== undefined) {
          if (endX > el.left) el.endX = Math.min(el.endX, endX);
        } else el.endX = endX;
      }
    }

    var lastEl = elements[elements.length - 1];
    lastEl.endX = lines[lastEl.line].staffGroup.w;
  }

  this.getBpm = function (tempo) {
    var bpm;

    if (tempo) {
      bpm = tempo.bpm;
      var beatLength = this.getBeatLength();
      var statedBeatLength = tempo.duration && tempo.duration.length > 0 ? tempo.duration[0] : beatLength;
      bpm = bpm * statedBeatLength / beatLength;
    }

    if (!bpm) {
      bpm = 72; // Compensate for compound meter, where the beat isn't a beat.

      var meter = this.getMeterFraction();

      if (meter && meter.num !== 3 && meter.num % 3 === 0) {
        bpm = 72;
      }
    }

    return bpm;
  };

  this.setTiming = function (bpm, measuresOfDelay) {
    measuresOfDelay = measuresOfDelay || 0;

    if (!this.engraver || !this.engraver.staffgroups) {
      console.log("setTiming cannot be called before the tune is drawn.");
      this.noteTimings = [];
      return;
    }

    var tempo = this.metaText ? this.metaText.tempo : null;
    var naturalBpm = this.getBpm(tempo);
    var warp = 1;

    if (bpm) {
      if (tempo) warp = bpm / naturalBpm;
    } else bpm = naturalBpm; // Calculate the basic midi data. We only care about the qpm variable here.
    //this.setUpAudio({qpm: bpm});


    var beatLength = this.getBeatLength();
    var beatsPerSecond = bpm / 60;
    var measureLength = this.getBarLength();
    var startingDelay = measureLength / beatLength * measuresOfDelay / beatsPerSecond;
    if (startingDelay) startingDelay -= this.getPickupLength() / beatLength / beatsPerSecond;
    var timeDivider = beatLength * beatsPerSecond;
    this.noteTimings = this.setupEvents(startingDelay, timeDivider, bpm, warp);

    if (this.noteTimings.length > 0) {
      this.totalTime = this.noteTimings[this.noteTimings.length - 1].milliseconds / 1000;
      this.totalBeats = this.totalTime * beatsPerSecond;
    } else {
      this.totalTime = undefined;
      this.totalBeats = undefined;
    }

    return this.noteTimings;
  };

  this.setUpAudio = function (options) {
    if (!options) options = {};
    var seq = sequence(this, options);
    return flatten(seq, options, this.formatting.percmap);
  };

  this.deline = function (options) {
    return delineTune(this.lines, options);
  };
};

module.exports = Tune;

/***/ }),

/***/ "./src/data/deline-tune.js":
/*!*********************************!*\
  !*** ./src/data/deline-tune.js ***!
  \*********************************/
/***/ (function(module) {

function delineTune(inputLines, options) {
  if (!options) options = {};
  var lineBreaks = !!options.lineBreaks;
  var outputLines = [];
  var inMusicLine = false;
  var currentMeter = [];
  var currentKey = [];
  var currentClef = [];
  var currentVocalFont = [];
  var currentGChordFont = [];
  var currentTripletFont = [];
  var currentAnnotationFont = [];

  for (var i = 0; i < inputLines.length; i++) {
    var inputLine = inputLines[i];

    if (inputLine.staff) {
      if (inMusicLine && !inputLine.vskip) {
        var outputLine = outputLines[outputLines.length - 1]; //findMismatchKeys(inputLine, outputLine, ["staff", "staffGroup"], "line", i)

        for (var s = 0; s < outputLine.staff.length; s++) {
          var inputStaff = inputLine.staff[s];
          var outputStaff = outputLine.staff[s];

          if (inputStaff) {
            if (!objEqual(inputStaff.meter, currentMeter[s])) {
              // The meter changed for this line, otherwise it wouldn't have been set
              addMeterToVoices(inputStaff.meter, inputStaff.voices);
              currentMeter[s] = inputStaff.meter;
              delete inputStaff.meter;
            }

            if (!objEqual(inputStaff.key, currentKey[s])) {
              addKeyToVoices(inputStaff.key, inputStaff.voices);
              currentKey[s] = inputStaff.key;
              delete inputStaff.key;
            }

            if (inputStaff.title) outputStaff.abbrevTitle = inputStaff.title;

            if (!objEqual(inputStaff.clef, currentClef[s])) {
              addClefToVoices(inputStaff.clef, inputStaff.voices);
              currentClef[s] = inputStaff.clef;
              delete inputStaff.clef;
            }

            if (!objEqual(inputStaff.vocalfont, currentVocalFont[s])) {
              addFontToVoices(inputStaff.vocalfont, inputStaff.voices, 'vocalfont');
              currentVocalFont[s] = inputStaff.vocalfont;
              delete inputStaff.vocalfont;
            }

            if (!objEqual(inputStaff.gchordfont, currentGChordFont[s])) {
              addFontToVoices(inputStaff.gchordfont, inputStaff.voices, 'gchordfont');
              currentGChordFont[s] = inputStaff.gchordfont;
              delete inputStaff.gchordfont;
            }

            if (!objEqual(inputStaff.tripletfont, currentTripletFont[s])) {
              addFontToVoices(inputStaff.tripletfont, inputStaff.voices, 'tripletfont');
              currentTripletFont[s] = inputStaff.tripletfont;
              delete inputStaff.tripletfont;
            }

            if (!objEqual(inputStaff.annotationfont, currentAnnotationFont[s])) {
              addFontToVoices(inputStaff.annotationfont, inputStaff.voices, 'annotationfont');
              currentAnnotationFont[s] = inputStaff.annotationfont;
              delete inputStaff.annotationfont;
            }
          } //findMismatchKeys(inputStaff, outputStaff, ["voices", "title", "abbrevTitle", "barNumber", "meter", "key", "clef", "vocalfont", "gchordfont", "tripletfont", "annotationfont"], "staff", i + ' ' + s)


          if (inputStaff) {
            for (var v = 0; v < outputStaff.voices.length; v++) {
              var outputVoice = outputStaff.voices[v];
              var inputVoice = inputStaff.voices[v];
              if (lineBreaks) outputVoice.push({
                el_type: "break"
              });
              if (inputVoice) outputStaff.voices[v] = outputVoice.concat(inputVoice);
            }
          }
        }
      } else {
        for (var ii = 0; ii < inputLine.staff.length; ii++) {
          currentKey[ii] = inputLine.staff[ii].key;
          currentMeter[ii] = inputLine.staff[ii].meter;
          currentClef[ii] = inputLine.staff[ii].clef;
        } // copy this because we are going to change it and we don't want to change the original.


        outputLines.push(cloneLine(inputLine));
      }

      inMusicLine = true;
    } else {
      inMusicLine = false;
      outputLines.push(inputLine);
    }
  }

  return outputLines;
} // function findMismatchKeys(input, output, ignore, context, context2) {
// 	if (!input) {
// 		return;
// 	}
// 	var outputKeys = Object.keys(output);
// 	var inputKeys = Object.keys(input);
// 	for (var ii = 0; ii < ignore.length; ii++) {
// 		if (outputKeys.indexOf(ignore[ii]) >= 0) {
// 			outputKeys.splice(outputKeys.indexOf(ignore[ii]), 1);
// 		}
// 		if (inputKeys.indexOf(ignore[ii]) >= 0) {
// 			inputKeys.splice(inputKeys.indexOf(ignore[ii]), 1);
// 		}
// 	}
// 	if (inputKeys.join(",") !== outputKeys.join(",")) {
// 		console.log("keys mismatch "+context + ' ' + context2, input, output);
// 	}
// 	for (var k = 0; k < inputKeys.length; k++) {
// 		var key = inputKeys[k];
// 		if (ignore.indexOf(key) < 0) {
// 			var inputValue = JSON.stringify(input[key], replacer);
// 			var outputValue = JSON.stringify(output[key], replacer);
// 			if (inputValue !== outputValue)
// 				console.log("value mismatch "+context + ' ' + context2 + ' ' + key, inputValue, outputValue)
// 		}
// 	}
// }


function replacer(key, value) {
  // Filtering out properties
  if (key === 'abselem') {
    return 'abselem';
  }

  return value;
}

function addMeterToVoices(meter, voices) {
  meter.el_type = "meter";
  meter.startChar = -1;
  meter.endChar = -1;

  for (var i = 0; i < voices.length; i++) {
    voices[i].unshift(meter);
  }
}

function addKeyToVoices(key, voices) {
  key.el_type = "key";
  key.startChar = -1;
  key.endChar = -1;

  for (var i = 0; i < voices.length; i++) {
    voices[i].unshift(key);
  }
}

function addClefToVoices(clef, voices) {
  clef.el_type = "clef";
  clef.startChar = -1;
  clef.endChar = -1;

  for (var i = 0; i < voices.length; i++) {
    voices[i].unshift(clef);
  }
}

function addFontToVoices(font, voices, type) {
  font.el_type = "font";
  font.type = type;
  font.startChar = -1;
  font.endChar = -1;

  for (var i = 0; i < voices.length; i++) {
    voices[i].unshift(font);
  }
}

function objEqual(input, output) {
  if (!input) return true; // the default is whatever the old output is.

  var inputValue = JSON.stringify(input, replacer);
  var outputValue = JSON.stringify(output, replacer);
  return inputValue === outputValue;
}

function cloneLine(line) {
  var output = {};
  var keys = Object.keys(line);

  for (var i = 0; i < keys.length; i++) {
    if (keys[i] !== "staff") output[keys[i]] = line[keys[i]];else {
      output.staff = [];

      for (var j = 0; j < line.staff.length; j++) {
        var staff = {};
        var keys2 = Object.keys(line.staff[j]);

        for (var k = 0; k < keys2.length; k++) {
          if (keys2[k] !== "voices") staff[keys2[k]] = line.staff[j][keys2[k]];else {
            staff.voices = [];

            for (var v = 0; v < line.staff[j].voices.length; v++) {
              staff.voices.push([].concat(line.staff[j].voices[v]));
            }
          }
        }

        output.staff.push(staff);
      }
    }
  }

  return output;
}

module.exports = delineTune;

/***/ }),

/***/ "./src/edit/abc_editarea.js":
/*!**********************************!*\
  !*** ./src/edit/abc_editarea.js ***!
  \**********************************/
/***/ (function(module) {

// abc_editor.js
// window.ABCJS.Editor is the interface class for the area that contains the ABC text. It is responsible for
// holding the text of the tune and calling the parser and the rendering engines.
//
// EditArea is an example of using a textarea as the control that is shown to the user. As long as
// the same interface is used, window.ABCJS.Editor can use a different type of object.
//
// EditArea:
// - constructor(textareaid)
//		This contains the id of a textarea control that will be used.
// - addSelectionListener(listener)
//		A callback class that contains the entry point fireSelectionChanged()
// - addChangeListener(listener)
//		A callback class that contains the entry point fireChanged()
// - getSelection()
//		returns the object { start: , end: } with the current selection in characters
// - setSelection(start, end)
//		start and end are the character positions that should be selected.
// - getString()
//		returns the ABC text that is currently displayed.
// - setString(str)
//		sets the ABC text that is currently displayed, and resets the initialText variable
// - getElem()
//		returns the textarea element
// - string initialText
//		Contains the starting text. This can be compared against the current text to see if anything changed.
//
// Polyfill for CustomEvent for old IE versions
try {
  if (typeof window.CustomEvent !== "function") {
    var CustomEvent = function CustomEvent(event, params) {
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined
      };
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };

    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
  }
} catch (e) {// if we aren't in a browser, this code will crash, but it is not needed then either.
}

var EditArea = function EditArea(textareaid) {
  this.textarea = document.getElementById(textareaid);
  this.initialText = this.textarea.value;
  this.isDragging = false;
};

EditArea.prototype.addSelectionListener = function (listener) {
  this.textarea.onmousemove = function (ev) {
    if (this.isDragging) listener.fireSelectionChanged();
  };
};

EditArea.prototype.addChangeListener = function (listener) {
  this.changelistener = listener;

  this.textarea.onkeyup = function () {
    listener.fireChanged();
  };

  this.textarea.onmousedown = function () {
    this.isDragging = true;
    listener.fireSelectionChanged();
  };

  this.textarea.onmouseup = function () {
    this.isDragging = false;
    listener.fireChanged();
  };

  this.textarea.onchange = function () {
    listener.fireChanged();
  };
}; //TODO won't work under IE?


EditArea.prototype.getSelection = function () {
  return {
    start: this.textarea.selectionStart,
    end: this.textarea.selectionEnd
  };
};

EditArea.prototype.setSelection = function (start, end) {
  if (this.textarea.setSelectionRange) this.textarea.setSelectionRange(start, end);else if (this.textarea.createTextRange) {
    // For IE8
    var e = this.textarea.createTextRange();
    e.collapse(true);
    e.moveEnd('character', end);
    e.moveStart('character', start);
    e.select();
  }
  this.textarea.focus();
};

EditArea.prototype.getString = function () {
  return this.textarea.value;
};

EditArea.prototype.setString = function (str) {
  this.textarea.value = str;
  this.initialText = this.getString();

  if (this.changelistener) {
    this.changelistener.fireChanged();
  }
};

EditArea.prototype.getElem = function () {
  return this.textarea;
};

module.exports = EditArea;

/***/ }),

/***/ "./src/edit/abc_editor.js":
/*!********************************!*\
  !*** ./src/edit/abc_editor.js ***!
  \********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// window.ABCJS.Editor:
//
// constructor(editarea, params)
//		if editarea is a string, then it is an HTML id of a textarea control.
//		Otherwise, it should be an instantiation of an object that expresses the EditArea interface.
//
//		params is a hash of:
//		canvas_id: or paper_id: HTML id to draw in. If not present, then the drawing happens just below the editor.
//		generate_midi: if present, then midi is generated.
//		midi_id: if present, the HTML id to place the midi control. Otherwise it is placed in the same div as the paper.
//		midi_download_id: if present, the HTML id to place the midi download link. Otherwise it is placed in the same div as the paper.
//		generate_warnings: if present, then parser warnings are displayed on the page.
//		warnings_id: if present, the HTML id to place the warnings. Otherwise they are placed in the same div as the paper.
//		onchange: if present, the callback function to call whenever there has been a change.
//		gui: if present, the paper can send changes back to the editor (presumably because the user changed something directly.)
//		parser_options: options to send to the parser engine.
//		midi_options: options to send to the midi engine.
//		render_options: options to send to the render engine.
//		indicate_changed: the dirty flag is set if this is true.
//
// - setReadOnly(bool)
//		adds or removes the class abc_textarea_readonly, and adds or removes the attribute readonly=yes
// - setDirtyStyle(bool)
//		adds or removes the class abc_textarea_dirty
// - modelChanged()
//		Called when the model has been changed to trigger re-rendering
// - parseABC()
//		Called internally by fireChanged()
//		returns true if there has been a change since last call.
// - updateSelection()
//		Called when the user has changed the selection. This calls the engraver to show the selection.
// - fireSelectionChanged()
//		Called by the textarea object when the user has changed the selection.
// - paramChanged(engraverparams)
//		Called to signal that the engraver params have changed, so re-rendering should occur.
// - fireChanged()
//		Called by the textarea object when the user has changed something.
// - setNotDirty()
//		Called by the client app to reset the dirty flag
// - isDirty()
//		Returns true or false, whether the textarea contains the same text that it started with.
// - highlight(abcelem)
//		Called by the engraver to highlight an area.
// - pause(bool)
//		Stops the automatic rendering when the user is typing.
//
var parseCommon = __webpack_require__(/*! ../parse/abc_common */ "./src/parse/abc_common.js");

var SynthController = __webpack_require__(/*! ../synth/synth-controller */ "./src/synth/synth-controller.js");

var supportsAudio = __webpack_require__(/*! ../synth/supports-audio */ "./src/synth/supports-audio.js");

var renderAbc = __webpack_require__(/*! ../api/abc_tunebook_svg */ "./src/api/abc_tunebook_svg.js");

var EditArea = __webpack_require__(/*! ./abc_editarea */ "./src/edit/abc_editarea.js");

function gatherAbcParams(params) {
  // There used to be a bunch of ways parameters can be passed in. This just simplifies it.
  var abcjsParams = {};
  var key;

  if (params.abcjsParams) {
    for (key in params.abcjsParams) {
      if (params.abcjsParams.hasOwnProperty(key)) {
        abcjsParams[key] = params.abcjsParams[key];
      }
    }
  }

  if (params.midi_options) {
    for (key in params.midi_options) {
      if (params.midi_options.hasOwnProperty(key)) {
        abcjsParams[key] = params.midi_options[key];
      }
    }
  }

  if (params.parser_options) {
    for (key in params.parser_options) {
      if (params.parser_options.hasOwnProperty(key)) {
        abcjsParams[key] = params.parser_options[key];
      }
    }
  }

  if (params.render_options) {
    for (key in params.render_options) {
      if (params.render_options.hasOwnProperty(key)) {
        abcjsParams[key] = params.render_options[key];
      }
    }
  }

  return abcjsParams;
}

var Editor = function Editor(editarea, params) {
  // Copy all the options that will be passed through
  this.abcjsParams = gatherAbcParams(params);
  if (params.indicate_changed) this.indicate_changed = true;

  if (typeof editarea === "string") {
    this.editarea = new EditArea(editarea);
  } else {
    this.editarea = editarea;
  }

  this.editarea.addSelectionListener(this);
  this.editarea.addChangeListener(this);

  if (params.canvas_id) {
    this.div = params.canvas_id;
  } else if (params.paper_id) {
    this.div = params.paper_id;
  } else {
    this.div = document.createElement("DIV");
    this.editarea.getElem().parentNode.insertBefore(this.div, this.editarea.getElem());
  }

  if (typeof this.div === 'string') this.div = document.getElementById(this.div);

  if (params.selectionChangeCallback) {
    this.selectionChangeCallback = params.selectionChangeCallback;
  }

  this.clientClickListener = this.abcjsParams.clickListener;
  this.abcjsParams.clickListener = this.highlight.bind(this);

  if (params.synth) {
    if (supportsAudio()) {
      this.synth = {
        el: params.synth.el,
        cursorControl: params.synth.cursorControl,
        options: params.synth.options
      };
    }
  } // If the user wants midi, then store the elements that it will be written to. The element could either be passed in as an id,
  // an element, or nothing. If nothing is passed in, then just put the midi on top of the generated music.


  if (params.generate_midi) {
    this.generate_midi = params.generate_midi;

    if (this.abcjsParams.generateDownload) {
      if (typeof params.midi_download_id === 'string') this.downloadMidi = document.getElementById(params.midi_download_id);else if (params.midi_download_id) // assume, if the var is not a string it is an element. If not, it will crash soon enough.
        this.downloadMidi = params.midi_download_id;
    }

    if (this.abcjsParams.generateInline !== false) {
      // The default for this is true, so undefined is also true.
      if (typeof params.midi_id === 'string') this.inlineMidi = document.getElementById(params.midi_id);else if (params.midi_id) // assume, if the var is not a string it is an element. If not, it will crash soon enough.
        this.inlineMidi = params.midi_id;
    }
  }

  if (params.warnings_id) {
    if (typeof params.warnings_id === "string") this.warningsdiv = document.getElementById(params.warnings_id);else this.warningsdiv = params.warnings_id;
  } else if (params.generate_warnings) {
    this.warningsdiv = document.createElement("div");
    this.div.parentNode.insertBefore(this.warningsdiv, this.div);
  }

  this.onchangeCallback = params.onchange;
  this.currentAbc = "";
  this.tunes = [];
  this.bReentry = false;
  this.parseABC();
  this.modelChanged();

  this.addClassName = function (element, className) {
    var hasClassName = function hasClassName(element, className) {
      var elementClassName = element.className;
      return elementClassName.length > 0 && (elementClassName === className || new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName));
    };

    if (!hasClassName(element, className)) element.className += (element.className ? ' ' : '') + className;
    return element;
  };

  this.removeClassName = function (element, className) {
    element.className = parseCommon.strip(element.className.replace(new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' '));
    return element;
  };

  this.setReadOnly = function (readOnly) {
    var readonlyClass = 'abc_textarea_readonly';
    var el = this.editarea.getElem();

    if (readOnly) {
      el.setAttribute('readonly', 'yes');
      this.addClassName(el, readonlyClass);
    } else {
      el.removeAttribute('readonly');
      this.removeClassName(el, readonlyClass);
    }
  };
};

Editor.prototype.redrawMidi = function () {
  if (this.generate_midi && !this.midiPause) {
    var event = new window.CustomEvent("generateMidi", {
      detail: {
        tunes: this.tunes,
        abcjsParams: this.abcjsParams,
        downloadMidiEl: this.downloadMidi,
        inlineMidiEl: this.inlineMidi,
        engravingEl: this.div
      }
    });
    window.dispatchEvent(event);
  }

  if (this.synth) {
    var userAction = this.synth.synthControl; // Can't really tell if there was a user action before drawing, but we assume that if the synthControl was created already there was a user action.

    if (!this.synth.synthControl) {
      this.synth.synthControl = new SynthController();
      this.synth.synthControl.load(this.synth.el, this.synth.cursorControl, this.synth.options);
    }

    this.synth.synthControl.setTune(this.tunes[0], userAction, this.synth.options);
  }
};

Editor.prototype.modelChanged = function () {
  if (this.bReentry) return; // TODO is this likely? maybe, if we rewrite abc immediately w/ abc2abc

  this.bReentry = true;
  this.timerId = null;
  if (this.synth && this.synth.synthControl) this.synth.synthControl.disable(true);
  this.tunes = renderAbc(this.div, this.currentAbc, this.abcjsParams);

  if (this.tunes.length > 0) {
    this.warnings = this.tunes[0].warnings;
  }

  this.redrawMidi();

  if (this.warningsdiv) {
    this.warningsdiv.innerHTML = this.warnings ? this.warnings.join("<br />") : "No errors";
  }

  this.updateSelection();
  this.bReentry = false;
}; // Call this to reparse in response to the client changing the parameters on the fly


Editor.prototype.paramChanged = function (engraverParams) {
  if (engraverParams) {
    for (var key in engraverParams) {
      if (engraverParams.hasOwnProperty(key)) {
        this.abcjsParams[key] = engraverParams[key];
      }
    }
  }

  this.currentAbc = "";
  this.fireChanged();
};

Editor.prototype.synthParamChanged = function (options) {
  this.synth.options = {};

  if (options) {
    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        this.synth.options[key] = options[key];
      }
    }
  }

  this.currentAbc = "";
  this.fireChanged();
}; // return true if the model has changed


Editor.prototype.parseABC = function () {
  var t = this.editarea.getString();

  if (t === this.currentAbc) {
    this.updateSelection();
    return false;
  }

  this.currentAbc = t;
  return true;
};

Editor.prototype.updateSelection = function () {
  var selection = this.editarea.getSelection();

  try {
    if (this.tunes.length > 0 && this.tunes[0].engraver) this.tunes[0].engraver.rangeHighlight(selection.start, selection.end);
  } catch (e) {} // maybe printer isn't defined yet?


  if (this.selectionChangeCallback) this.selectionChangeCallback(selection.start, selection.end);
}; // Called when the textarea's selection is in the process of changing (after mouse down, dragging, or keyboard arrows)


Editor.prototype.fireSelectionChanged = function () {
  this.updateSelection();
};

Editor.prototype.setDirtyStyle = function (isDirty) {
  if (this.indicate_changed === undefined) return;

  var addClassName = function addClassName(element, className) {
    var hasClassName = function hasClassName(element, className) {
      var elementClassName = element.className;
      return elementClassName.length > 0 && (elementClassName === className || new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName));
    };

    if (!hasClassName(element, className)) element.className += (element.className ? ' ' : '') + className;
    return element;
  };

  var removeClassName = function removeClassName(element, className) {
    element.className = parseCommon.strip(element.className.replace(new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' '));
    return element;
  };

  var readonlyClass = 'abc_textarea_dirty';
  var el = this.editarea.getElem();

  if (isDirty) {
    addClassName(el, readonlyClass);
  } else {
    removeClassName(el, readonlyClass);
  }
}; // call when the textarea alerts us that the abc text is changed and needs re-parsing


Editor.prototype.fireChanged = function () {
  if (this.bIsPaused) return;

  if (this.parseABC()) {
    var self = this;
    if (this.timerId) // If the user is still typing, cancel the update
      clearTimeout(this.timerId);
    this.timerId = setTimeout(function () {
      self.modelChanged();
    }, 300); // Is this a good compromise between responsiveness and not redrawing too much?

    var isDirty = this.isDirty();

    if (this.wasDirty !== isDirty) {
      this.wasDirty = isDirty;
      this.setDirtyStyle(isDirty);
    }

    if (this.onchangeCallback) this.onchangeCallback(this);
  }
};

Editor.prototype.setNotDirty = function () {
  this.editarea.initialText = this.editarea.getString();
  this.wasDirty = false;
  this.setDirtyStyle(false);
};

Editor.prototype.isDirty = function () {
  if (this.indicate_changed === undefined) return false;
  return this.editarea.initialText !== this.editarea.getString();
};

Editor.prototype.highlight = function (abcelem, tuneNumber, classes, analysis, drag, mouseEvent) {
  // TODO-PER: The marker appears to get off by one for each tune parsed. I'm not sure why, but adding the tuneNumber in corrects it for the time being.
  //	var offset = (tuneNumber !== undefined) ? this.startPos[tuneNumber] + tuneNumber : 0;
  this.editarea.setSelection(abcelem.startChar, abcelem.endChar);
  if (this.selectionChangeCallback) this.selectionChangeCallback(abcelem.startChar, abcelem.endChar);
  if (this.clientClickListener) this.clientClickListener(abcelem, tuneNumber, classes, analysis, drag, mouseEvent);
};

Editor.prototype.pause = function (shouldPause) {
  this.bIsPaused = shouldPause;
  if (!shouldPause) this.fireChanged();
};

Editor.prototype.millisecondsPerMeasure = function () {
  return this.synth.synthControl.visualObj.millisecondsPerMeasure();
};

Editor.prototype.pauseMidi = function (shouldPause) {
  this.midiPause = shouldPause;
  if (!shouldPause) this.redrawMidi();
};

module.exports = Editor;

/***/ }),

/***/ "./src/midi/abc_midi_create.js":
/*!*************************************!*\
  !*** ./src/midi/abc_midi_create.js ***!
  \*************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

//    abc_midi_create.js: Turn a linear series of events into a midi file.
var rendererFactory = __webpack_require__(/*! ../synth/abc_midi_renderer */ "./src/synth/abc_midi_renderer.js");

var create;

(function () {
  "use strict";

  var baseDuration = 480 * 4; // nice and divisible, equals 1 whole note

  create = function create(abcTune, options) {
    if (options === undefined) options = {};
    var commands = abcTune.setUpAudio(options);
    var midi = rendererFactory();
    var title = abcTune.metaText ? abcTune.metaText.title : undefined;
    if (title && title.length > 128) title = title.substring(0, 124) + '...';
    var key = abcTune.getKeySignature();
    var time = abcTune.getMeterFraction();
    midi.setGlobalInfo(commands.tempo, title, key, time);

    for (var i = 0; i < commands.tracks.length; i++) {
      midi.startTrack();
      var notePlacement = {};

      for (var j = 0; j < commands.tracks[i].length; j++) {
        var event = commands.tracks[i][j];

        switch (event.cmd) {
          case 'text':
            midi.setText(event.type, event.text);
            break;

          case 'program':
            var pan = 0;
            if (options.pan && options.pan.length > i) pan = options.pan[i];
            midi.setChannel(event.channel, pan);
            midi.setInstrument(event.instrument);
            break;

          case 'note':
            var start = event.start;
            var end = start + event.duration; // TODO: end is affected by event.gap, too.

            if (!notePlacement[start]) notePlacement[start] = [];
            notePlacement[start].push({
              pitch: event.pitch,
              volume: event.volume,
              cents: event.cents
            });
            if (!notePlacement[end]) notePlacement[end] = [];
            notePlacement[end].push({
              pitch: event.pitch,
              volume: 0
            });
            break;

          default:
            console.log("MIDI create Unknown: " + event.cmd);
        }
      }

      addNotes(midi, notePlacement, baseDuration);
      midi.endTrack();
    }

    return midi.getData();
  };

  function addNotes(midi, notePlacement, baseDuration) {
    var times = Object.keys(notePlacement);

    for (var h = 0; h < times.length; h++) {
      times[h] = parseFloat(times[h]);
    }

    times.sort(function (a, b) {
      return a - b;
    });
    var lastTime = 0;

    for (var i = 0; i < times.length; i++) {
      var events = notePlacement[times[i]];

      if (times[i] > lastTime) {
        var distance = (times[i] - lastTime) * baseDuration;
        midi.addRest(distance);
        lastTime = times[i];
      }

      for (var j = 0; j < events.length; j++) {
        var event = events[j];

        if (event.volume) {
          midi.startNote(event.pitch, event.volume, event.cents);
        } else {
          midi.endNote(event.pitch);
        }
      }
    }
  }
})();

module.exports = create;

/***/ }),

/***/ "./src/parse/abc_common.js":
/*!*********************************!*\
  !*** ./src/parse/abc_common.js ***!
  \*********************************/
/***/ (function(module) {

//    abc_parse.js: parses a string representing ABC Music Notation into a usable internal structure.
var parseCommon = {};

parseCommon.clone = function (source) {
  var destination = {};

  for (var property in source) {
    if (source.hasOwnProperty(property)) destination[property] = source[property];
  }

  return destination;
};

parseCommon.cloneArray = function (source) {
  var destination = [];

  for (var i = 0; i < source.length; i++) {
    destination.push(parseCommon.clone(source[i]));
  }

  return destination;
};

parseCommon.cloneHashOfHash = function (source) {
  var destination = {};

  for (var property in source) {
    if (source.hasOwnProperty(property)) destination[property] = parseCommon.clone(source[property]);
  }

  return destination;
};

parseCommon.cloneHashOfArrayOfHash = function (source) {
  var destination = {};

  for (var property in source) {
    if (source.hasOwnProperty(property)) destination[property] = parseCommon.cloneArray(source[property]);
  }

  return destination;
};

parseCommon.gsub = function (source, pattern, replacement) {
  return source.split(pattern).join(replacement);
};

parseCommon.strip = function (str) {
  return str.replace(/^\s+/, '').replace(/\s+$/, '');
};

parseCommon.startsWith = function (str, pattern) {
  return str.indexOf(pattern) === 0;
};

parseCommon.endsWith = function (str, pattern) {
  var d = str.length - pattern.length;
  return d >= 0 && str.lastIndexOf(pattern) === d;
};

parseCommon.each = function (arr, iterator, context) {
  for (var i = 0, length = arr.length; i < length; i++) {
    iterator.apply(context, [arr[i], i]);
  }
};

parseCommon.last = function (arr) {
  if (arr.length === 0) return null;
  return arr[arr.length - 1];
};

parseCommon.compact = function (arr) {
  var output = [];

  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) output.push(arr[i]);
  }

  return output;
};

parseCommon.detect = function (arr, iterator) {
  for (var i = 0; i < arr.length; i++) {
    if (iterator(arr[i])) return true;
  }

  return false;
}; // The following is a polyfill for Object.remove for IE9, IE10, and IE11.
// from:https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md


try {
  (function (arr) {
    arr.forEach(function (item) {
      if (item.hasOwnProperty('remove')) {
        return;
      }

      Object.defineProperty(item, 'remove', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function remove() {
          if (this.parentNode !== null) this.parentNode.removeChild(this);
        }
      });
    });
  })([Element.prototype, CharacterData.prototype, DocumentType.prototype]);
} catch (e) {// if we aren't in a browser, this code will crash, but it is not needed then either.
}

module.exports = parseCommon;

/***/ }),

/***/ "./src/parse/abc_parse.js":
/*!********************************!*\
  !*** ./src/parse/abc_parse.js ***!
  \********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

//    abc_parse.js: parses a string representing ABC Music Notation into a usable internal structure.
var parseCommon = __webpack_require__(/*! ./abc_common */ "./src/parse/abc_common.js");

var parseDirective = __webpack_require__(/*! ./abc_parse_directive */ "./src/parse/abc_parse_directive.js");

var ParseHeader = __webpack_require__(/*! ./abc_parse_header */ "./src/parse/abc_parse_header.js");

var ParseMusic = __webpack_require__(/*! ./abc_parse_music */ "./src/parse/abc_parse_music.js");

var Tokenizer = __webpack_require__(/*! ./abc_tokenizer */ "./src/parse/abc_tokenizer.js");

var wrap = __webpack_require__(/*! ./wrap_lines */ "./src/parse/wrap_lines.js");

var Tune = __webpack_require__(/*! ../data/abc_tune */ "./src/data/abc_tune.js");

var TuneBuilder = __webpack_require__(/*! ../parse/tune-builder */ "./src/parse/tune-builder.js");

var Parse = function Parse() {
  "use strict";

  var tune = new Tune();
  var tuneBuilder = new TuneBuilder(tune);
  var tokenizer;
  var wordsContinuation = '';
  var symbolContinuation = '';

  this.getTune = function () {
    var t = {
      formatting: tune.formatting,
      lines: tune.lines,
      media: tune.media,
      metaText: tune.metaText,
      version: tune.version,
      addElementToEvents: tune.addElementToEvents,
      addUsefulCallbackInfo: tune.addUsefulCallbackInfo,
      getTotalTime: tune.getTotalTime,
      getTotalBeats: tune.getTotalBeats,
      getBarLength: tune.getBarLength,
      getBeatLength: tune.getBeatLength,
      getBeatsPerMeasure: tune.getBeatsPerMeasure,
      getBpm: tune.getBpm,
      getMeter: tune.getMeter,
      getMeterFraction: tune.getMeterFraction,
      getPickupLength: tune.getPickupLength,
      getKeySignature: tune.getKeySignature,
      getElementFromChar: tune.getElementFromChar,
      makeVoicesArray: tune.makeVoicesArray,
      millisecondsPerMeasure: tune.millisecondsPerMeasure,
      setupEvents: tune.setupEvents,
      setTiming: tune.setTiming,
      setUpAudio: tune.setUpAudio,
      deline: tune.deline
    };
    if (tune.lineBreaks) t.lineBreaks = tune.lineBreaks;
    if (tune.visualTranspose) t.visualTranspose = tune.visualTranspose;
    return t;
  };

  function addPositioning(el, type, value) {
    if (!el.positioning) el.positioning = {};
    el.positioning[type] = value;
  }

  function addFont(el, type, value) {
    if (!el.fonts) el.fonts = {};
    el.fonts[type] = value;
  }

  var multilineVars = {
    reset: function reset() {
      for (var property in this) {
        if (this.hasOwnProperty(property) && typeof this[property] !== "function") {
          delete this[property];
        }
      }

      this.iChar = 0;
      this.key = {
        accidentals: [],
        root: 'none',
        acc: '',
        mode: ''
      };
      this.meter = null; // if no meter is specified, free meter is assumed

      this.origMeter = null; // this is for new voices that are created after we set the meter.

      this.hasMainTitle = false;
      this.default_length = 0.125;
      this.clef = {
        type: 'swiss',
        verticalPos: 0
      };
      this.next_note_duration = 0;
      this.start_new_line = true;
      this.is_in_header = true;
      this.partForNextLine = {};
      this.tempoForNextLine = [];
      this.havent_set_length = true;
      this.voices = {};
      this.staves = [];
      this.macros = {};
      this.currBarNumber = 1;
      this.barCounter = {};
      this.ignoredDecorations = [];
      this.score_is_present = false; // Can't have original V: lines when there is the score directive

      this.inEnding = false;
      this.inTie = [];
      this.inTieChord = {};
      this.vocalPosition = "auto";
      this.dynamicPosition = "auto";
      this.chordPosition = "auto";
      this.ornamentPosition = "auto";
      this.volumePosition = "auto";
      this.openSlurs = [];
      this.freegchord = false;
      this.endingHoldOver = {};
    },
    differentFont: function differentFont(type, defaultFonts) {
      if (this[type].decoration !== defaultFonts[type].decoration) return true;
      if (this[type].face !== defaultFonts[type].face) return true;
      if (this[type].size !== defaultFonts[type].size) return true;
      if (this[type].style !== defaultFonts[type].style) return true;
      if (this[type].weight !== defaultFonts[type].weight) return true;
      return false;
    },
    addFormattingOptions: function addFormattingOptions(el, defaultFonts, elType) {
      if (elType === 'note') {
        if (this.vocalPosition !== 'auto') addPositioning(el, 'vocalPosition', this.vocalPosition);
        if (this.dynamicPosition !== 'auto') addPositioning(el, 'dynamicPosition', this.dynamicPosition);
        if (this.chordPosition !== 'auto') addPositioning(el, 'chordPosition', this.chordPosition);
        if (this.ornamentPosition !== 'auto') addPositioning(el, 'ornamentPosition', this.ornamentPosition);
        if (this.volumePosition !== 'auto') addPositioning(el, 'volumePosition', this.volumePosition);
        if (this.differentFont("annotationfont", defaultFonts)) addFont(el, 'annotationfont', this.annotationfont);
        if (this.differentFont("gchordfont", defaultFonts)) addFont(el, 'gchordfont', this.gchordfont);
        if (this.differentFont("vocalfont", defaultFonts)) addFont(el, 'vocalfont', this.vocalfont);
        if (this.differentFont("tripletfont", defaultFonts)) addFont(el, 'tripletfont', this.tripletfont);
      } else if (elType === 'bar') {
        if (this.dynamicPosition !== 'auto') addPositioning(el, 'dynamicPosition', this.dynamicPosition);
        if (this.chordPosition !== 'auto') addPositioning(el, 'chordPosition', this.chordPosition);
        if (this.ornamentPosition !== 'auto') addPositioning(el, 'ornamentPosition', this.ornamentPosition);
        if (this.volumePosition !== 'auto') addPositioning(el, 'volumePosition', this.volumePosition);
        if (this.differentFont("measurefont", defaultFonts)) addFont(el, 'measurefont', this.measurefont);
        if (this.differentFont("repeatfont", defaultFonts)) addFont(el, 'repeatfont', this.repeatfont);
      }
    },
    duplicateStartEndingHoldOvers: function duplicateStartEndingHoldOvers() {
      this.endingHoldOver = {
        inTie: [],
        inTieChord: {}
      };

      for (var i = 0; i < this.inTie.length; i++) {
        this.endingHoldOver.inTie.push([]);

        for (var j = 0; j < this.inTie[i].length; j++) {
          this.endingHoldOver.inTie[i].push(this.inTie[i][j]);
        }
      }

      for (var key in this.inTieChord) {
        if (this.inTieChord.hasOwnProperty(key)) this.endingHoldOver.inTieChord[key] = this.inTieChord[key];
      }
    },
    restoreStartEndingHoldOvers: function restoreStartEndingHoldOvers() {
      if (!this.endingHoldOver.inTie) return;
      this.inTie = [];
      this.inTieChord = {};

      for (var i = 0; i < this.endingHoldOver.inTie.length; i++) {
        this.inTie.push([]);

        for (var j = 0; j < this.endingHoldOver.inTie[i].length; j++) {
          this.inTie[i].push(this.endingHoldOver.inTie[i][j]);
        }
      }

      for (var key in this.endingHoldOver.inTieChord) {
        if (this.endingHoldOver.inTieChord.hasOwnProperty(key)) this.inTieChord[key] = this.endingHoldOver.inTieChord[key];
      }
    }
  };

  var addWarning = function addWarning(str) {
    if (!multilineVars.warnings) multilineVars.warnings = [];
    multilineVars.warnings.push(str);
  };

  var addWarningObject = function addWarningObject(warningObject) {
    if (!multilineVars.warningObjects) multilineVars.warningObjects = [];
    multilineVars.warningObjects.push(warningObject);
  };

  var encode = function encode(str) {
    var ret = parseCommon.gsub(str, '\x12', ' ');
    ret = parseCommon.gsub(ret, '&', '&amp;');
    ret = parseCommon.gsub(ret, '<', '&lt;');
    return parseCommon.gsub(ret, '>', '&gt;');
  };

  var warn = function warn(str, line, col_num) {
    if (!line) line = " ";
    var bad_char = line.charAt(col_num);
    if (bad_char === ' ') bad_char = "SPACE";
    var clean_line = encode(line.substring(0, col_num)) + '<span style="text-decoration:underline;font-size:1.3em;font-weight:bold;">' + bad_char + '</span>' + encode(line.substring(col_num + 1));
    addWarning("Music Line:" + tokenizer.lineIndex + ":" + (col_num + 1) + ': ' + str + ":  " + clean_line);
    addWarningObject({
      message: str,
      line: line,
      startChar: multilineVars.iChar + col_num,
      column: col_num
    });
  };

  var header;
  var music;

  this.getWarnings = function () {
    return multilineVars.warnings;
  };

  this.getWarningObjects = function () {
    return multilineVars.warningObjects;
  };

  var addWords = function addWords(line, words) {
    if (words.indexOf('\x12') >= 0) {
      wordsContinuation += words;
      return;
    }

    words = wordsContinuation + words;
    wordsContinuation = '';

    if (!line) {
      warn("Can't add words before the first line of music", line, 0);
      return;
    }

    words = parseCommon.strip(words);
    if (words.charAt(words.length - 1) !== '-') words = words + ' '; // Just makes it easier to parse below, since every word has a divider after it.

    var word_list = []; // first make a list of words from the string we are passed. A word is divided on either a space or dash.

    var last_divider = 0;
    var replace = false;

    var addWord = function addWord(i) {
      var word = parseCommon.strip(words.substring(last_divider, i));
      last_divider = i + 1;

      if (word.length > 0) {
        if (replace) word = parseCommon.gsub(word, '~', ' ');
        var div = words.charAt(i);
        if (div !== '_' && div !== '-') div = ' ';
        word_list.push({
          syllable: tokenizer.translateString(word),
          divider: div
        });
        replace = false;
        return true;
      }

      return false;
    };

    for (var i = 0; i < words.length; i++) {
      switch (words.charAt(i)) {
        case ' ':
        case '\x12':
          addWord(i);
          break;

        case '-':
          if (!addWord(i) && word_list.length > 0) {
            parseCommon.last(word_list).divider = '-';
            word_list.push({
              skip: true,
              to: 'next'
            });
          }

          break;

        case '_':
          addWord(i);
          word_list.push({
            skip: true,
            to: 'slur'
          });
          break;

        case '*':
          addWord(i);
          word_list.push({
            skip: true,
            to: 'next'
          });
          break;

        case '|':
          addWord(i);
          word_list.push({
            skip: true,
            to: 'bar'
          });
          break;

        case '~':
          replace = true;
          break;
      }
    }

    var inSlur = false;
    parseCommon.each(line, function (el) {
      if (word_list.length !== 0) {
        if (word_list[0].skip) {
          switch (word_list[0].to) {
            case 'next':
              if (el.el_type === 'note' && el.pitches !== null && !inSlur) word_list.shift();
              break;

            case 'slur':
              if (el.el_type === 'note' && el.pitches !== null) word_list.shift();
              break;

            case 'bar':
              if (el.el_type === 'bar') word_list.shift();
              break;
          }

          if (el.el_type !== 'bar') {
            if (el.lyric === undefined) el.lyric = [{
              syllable: "",
              divider: " "
            }];else el.lyric.push({
              syllable: "",
              divider: " "
            });
          }
        } else {
          if (el.el_type === 'note' && el.rest === undefined && !inSlur) {
            var lyric = word_list.shift();
            if (lyric.syllable) lyric.syllable = lyric.syllable.replace(/ +/g, '\xA0');
            if (el.lyric === undefined) el.lyric = [lyric];else el.lyric.push(lyric);
          }
        }
      }
    });
  };

  var addSymbols = function addSymbols(line, words) {
    if (words.indexOf('\x12') >= 0) {
      symbolContinuation += words;
      return;
    }

    words = symbolContinuation + words;
    symbolContinuation = ''; // TODO-PER: Currently copied from w: line. This needs to be read as symbols instead.

    if (!line) {
      warn("Can't add symbols before the first line of music", line, 0);
      return;
    }

    words = parseCommon.strip(words);
    if (words.charAt(words.length - 1) !== '-') words = words + ' '; // Just makes it easier to parse below, since every word has a divider after it.

    var word_list = []; // first make a list of words from the string we are passed. A word is divided on either a space or dash.

    var last_divider = 0;
    var replace = false;

    var addWord = function addWord(i) {
      var word = parseCommon.strip(words.substring(last_divider, i));
      last_divider = i + 1;

      if (word.length > 0) {
        if (replace) word = parseCommon.gsub(word, '~', ' ');
        var div = words.charAt(i);
        if (div !== '_' && div !== '-') div = ' ';
        word_list.push({
          syllable: tokenizer.translateString(word),
          divider: div
        });
        replace = false;
        return true;
      }

      return false;
    };

    for (var i = 0; i < words.length; i++) {
      switch (words.charAt(i)) {
        case ' ':
        case '\x12':
          addWord(i);
          break;

        case '-':
          if (!addWord(i) && word_list.length > 0) {
            parseCommon.last(word_list).divider = '-';
            word_list.push({
              skip: true,
              to: 'next'
            });
          }

          break;

        case '_':
          addWord(i);
          word_list.push({
            skip: true,
            to: 'slur'
          });
          break;

        case '*':
          addWord(i);
          word_list.push({
            skip: true,
            to: 'next'
          });
          break;

        case '|':
          addWord(i);
          word_list.push({
            skip: true,
            to: 'bar'
          });
          break;

        case '~':
          replace = true;
          break;
      }
    }

    var inSlur = false;
    parseCommon.each(line, function (el) {
      if (word_list.length !== 0) {
        if (word_list[0].skip) {
          switch (word_list[0].to) {
            case 'next':
              if (el.el_type === 'note' && el.pitches !== null && !inSlur) word_list.shift();
              break;

            case 'slur':
              if (el.el_type === 'note' && el.pitches !== null) word_list.shift();
              break;

            case 'bar':
              if (el.el_type === 'bar') word_list.shift();
              break;
          }
        } else {
          if (el.el_type === 'note' && el.rest === undefined && !inSlur) {
            var lyric = word_list.shift();
            if (el.lyric === undefined) el.lyric = [lyric];else el.lyric.push(lyric);
          }
        }
      }
    });
  };

  var parseLine = function parseLine(line) {
    if (parseCommon.startsWith(line, '%%')) {
      var err = parseDirective.addDirective(line.substring(2));
      if (err) warn(err, line, 2);
      return;
    }

    var i = line.indexOf('%');
    if (i >= 0) line = line.substring(0, i);
    line = line.replace(/\s+$/, '');
    if (line.length === 0) return;

    if (wordsContinuation) {
      addWords(tuneBuilder.getCurrentVoice(), line.substring(2));
      return;
    }

    if (symbolContinuation) {
      addSymbols(tuneBuilder.getCurrentVoice(), line.substring(2));
      return;
    }

    if (line.length < 2 || line.charAt(1) !== ':' || music.lineContinuation) {
      music.parseMusic(line);
      return;
    }

    var ret = header.parseHeader(line);
    if (ret.regular) music.parseMusic(line);
    if (ret.newline) music.startNewLine();
    if (ret.words) addWords(tuneBuilder.getCurrentVoice(), line.substring(2));
    if (ret.symbols) addSymbols(tuneBuilder.getCurrentVoice(), line.substring(2));
  };

  function appendLastMeasure(voice, nextVoice) {
    voice.push({
      el_type: 'hint'
    });

    for (var i = 0; i < nextVoice.length; i++) {
      var element = nextVoice[i];
      var hint = parseCommon.clone(element);
      voice.push(hint);
      if (element.el_type === 'bar') return;
    }
  }

  function addHintMeasure(staff, nextStaff) {
    for (var i = 0; i < staff.length; i++) {
      var stave = staff[i];
      var nextStave = nextStaff[i];

      if (nextStave) {
        // Be sure there is the same number of staves on the next line.
        for (var j = 0; j < nextStave.voices.length; j++) {
          var nextVoice = nextStave.voices[j];
          var voice = stave.voices[j];

          if (voice) {
            // Be sure there are the same number of voices on the previous line.
            appendLastMeasure(voice, nextVoice);
          }
        }
      }
    }
  }

  function addHintMeasures() {
    for (var i = 0; i < tune.lines.length; i++) {
      var line = tune.lines[i].staff;

      if (line) {
        var j = i + 1;

        while (j < tune.lines.length && tune.lines[j].staff === undefined) {
          j++;
        }

        if (j < tune.lines.length) {
          var nextLine = tune.lines[j].staff;
          addHintMeasure(line, nextLine);
        }
      }
    }
  }

  this.parse = function (strTune, switches, startPos) {
    // the switches are optional and cause a difference in the way the tune is parsed.
    // switches.header_only : stop parsing when the header is finished
    // switches.stop_on_warning : stop at the first warning encountered.
    // switches.print: format for the page instead of the browser.
    // switches.format: a hash of the desired formatting commands.
    // switches.hint_measures: put the next measure at the end of the current line.
    // switches.transpose: change the key signature, chords, and notes by a number of half-steps.
    if (!switches) switches = {};
    if (!startPos) startPos = 0;
    tuneBuilder.reset(); // Take care of whatever line endings come our way
    // Tack on newline temporarily to make the last line continuation work

    strTune = strTune.replace(/\r\n?/g, '\n') + '\n'; // get rid of latex commands. If a line starts with a backslash, then it is replaced by spaces to keep the character count the same.

    var arr = strTune.split("\n\\");

    if (arr.length > 1) {
      for (var i2 = 1; i2 < arr.length; i2++) {
        while (arr[i2].length > 0 && arr[i2][0] !== "\n") {
          arr[i2] = arr[i2].substr(1);
          arr[i2 - 1] += ' ';
        }
      }

      strTune = arr.join("  "); //. the split removed two characters, so this puts them back
    } // take care of line continuations right away, but keep the same number of characters


    strTune = strTune.replace(/\\([ \t]*)(%.*)*\n/g, function (all, backslash, comment) {
      var padding = comment ? Array(comment.length + 1).join(' ') : "";
      return backslash + "\x12" + padding + '\n';
    });
    var lines = strTune.split('\n');
    if (parseCommon.last(lines).length === 0) // remove the blank line we added above.
      lines.pop();
    tokenizer = new Tokenizer(lines, multilineVars);
    header = new ParseHeader(tokenizer, warn, multilineVars, tune, tuneBuilder);
    music = new ParseMusic(tokenizer, warn, multilineVars, tune, tuneBuilder, header);
    if (switches.print) tune.media = 'print';
    multilineVars.reset();
    multilineVars.iChar = startPos;

    if (switches.visualTranspose) {
      multilineVars.globalTranspose = parseInt(switches.visualTranspose);
      if (multilineVars.globalTranspose === 0) multilineVars.globalTranspose = undefined;else tuneBuilder.setVisualTranspose(switches.visualTranspose);
    } else multilineVars.globalTranspose = undefined;

    if (switches.lineBreaks) {
      // The line break numbers are 0-based and they reflect the last measure of the current line.
      multilineVars.lineBreaks = switches.lineBreaks; //multilineVars.continueall = true;
    }

    header.reset(tokenizer, warn, multilineVars, tune);

    try {
      if (switches.format) {
        parseDirective.globalFormatting(switches.format);
      }

      var line = tokenizer.nextLine();

      while (line) {
        if (switches.header_only && multilineVars.is_in_header === false) throw "normal_abort";
        if (switches.stop_on_warning && multilineVars.warnings) throw "normal_abort";
        var wasInHeader = multilineVars.is_in_header;
        parseLine(line);

        if (wasInHeader && !multilineVars.is_in_header) {
          tuneBuilder.setRunningFont("annotationfont", multilineVars.annotationfont);
          tuneBuilder.setRunningFont("gchordfont", multilineVars.gchordfont);
          tuneBuilder.setRunningFont("tripletfont", multilineVars.tripletfont);
          tuneBuilder.setRunningFont("vocalfont", multilineVars.vocalfont);
        }

        line = tokenizer.nextLine();
      }

      if (wordsContinuation) {
        addWords(tuneBuilder.getCurrentVoice(), '');
      }

      if (symbolContinuation) {
        addSymbols(tuneBuilder.getCurrentVoice(), '');
      }

      multilineVars.openSlurs = tuneBuilder.cleanUp(multilineVars.barsperstaff, multilineVars.staffnonote, multilineVars.openSlurs);
    } catch (err) {
      if (err !== "normal_abort") throw err;
    }

    var ph = 11 * 72;
    var pl = 8.5 * 72;

    switch (multilineVars.papersize) {
      //case "letter": ph = 11*72; pl = 8.5*72; break;
      case "legal":
        ph = 14 * 72;
        pl = 8.5 * 72;
        break;

      case "A4":
        ph = 11.7 * 72;
        pl = 8.3 * 72;
        break;
    }

    if (multilineVars.landscape) {
      var x = ph;
      ph = pl;
      pl = x;
    }

    if (!tune.formatting.pagewidth) tune.formatting.pagewidth = pl;
    if (!tune.formatting.pageheight) tune.formatting.pageheight = ph;

    if (switches.hint_measures) {
      addHintMeasures();
    }

    wrap.wrapLines(tune, multilineVars.lineBreaks);
  };
};

module.exports = Parse;

/***/ }),

/***/ "./src/parse/abc_parse_book.js":
/*!*************************************!*\
  !*** ./src/parse/abc_parse_book.js ***!
  \*************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

//    abc_parse_book.js: parses a string representing ABC Music Notation into a usable internal structure.
var parseCommon = __webpack_require__(/*! ./abc_common */ "./src/parse/abc_common.js");

var bookParser = function bookParser(book) {
  "use strict";

  var directives = "";
  book = parseCommon.strip(book);
  var tuneStrings = book.split("\nX:"); // Put back the X: that we lost when splitting the tunes.

  for (var i = 1; i < tuneStrings.length; i++) {
    tuneStrings[i] = "X:" + tuneStrings[i];
  } // Keep track of the character position each tune starts with.


  var pos = 0;
  var tunes = [];
  parseCommon.each(tuneStrings, function (tune) {
    tunes.push({
      abc: tune,
      startPos: pos
    });
    pos += tune.length + 1; // We also lost a newline when splitting, so count that.
  });

  if (tunes.length > 1 && !parseCommon.startsWith(tunes[0].abc, 'X:')) {
    // If there is only one tune, the X: might be missing, otherwise assume the top of the file is "intertune"
    // There could be file-wide directives in this, if so, we need to insert it into each tune. We can probably get away with
    // just looking for file-wide directives here (before the first tune) and inserting them at the bottom of each tune, since
    // the tune is parsed all at once. The directives will be seen before the engraver begins processing.
    var dir = tunes.shift();
    var arrDir = dir.abc.split('\n');
    parseCommon.each(arrDir, function (line) {
      if (parseCommon.startsWith(line, '%%')) directives += line + '\n';
    });
  }

  var header = directives; // Now, the tune ends at a blank line, so truncate it if needed. There may be "intertune" stuff.

  parseCommon.each(tunes, function (tune) {
    var end = tune.abc.indexOf('\n\n');
    if (end > 0) tune.abc = tune.abc.substring(0, end);
    tune.pure = tune.abc;
    tune.abc = directives + tune.abc; // for the user's convenience, parse and store the title separately. The title is between the first T: and the next \n

    tune.title = "";
    var title = tune.pure.split("T:");

    if (title.length > 1) {
      title = title[1].split("\n");
      tune.title = parseCommon.strip(title[0]);
    } // for the user's convenience, parse and store the id separately. The id is between the first X: and the next \n


    var id = tune.pure.substring(2, tune.pure.indexOf("\n"));
    tune.id = parseCommon.strip(id);
  });
  return {
    header: header,
    tunes: tunes
  };
};

module.exports = bookParser;

/***/ }),

/***/ "./src/parse/abc_parse_directive.js":
/*!******************************************!*\
  !*** ./src/parse/abc_parse_directive.js ***!
  \******************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var parseCommon = __webpack_require__(/*! ./abc_common */ "./src/parse/abc_common.js");

var parseDirective = {};

(function () {
  "use strict";

  var tokenizer;
  var warn;
  var multilineVars;
  var tune;
  var tuneBuilder;

  parseDirective.initialize = function (tokenizer_, warn_, multilineVars_, tune_, tuneBuilder_) {
    tokenizer = tokenizer_;
    warn = warn_;
    multilineVars = multilineVars_;
    tune = tune_;
    tuneBuilder = tuneBuilder_;
    initializeFonts();
  };

  function initializeFonts() {
    multilineVars.annotationfont = {
      face: "Helvetica",
      size: 12,
      weight: "normal",
      style: "normal",
      decoration: "none"
    };
    multilineVars.gchordfont = {
      face: "Helvetica",
      size: 12,
      weight: "normal",
      style: "normal",
      decoration: "none"
    };
    multilineVars.historyfont = {
      face: "\"Times New Roman\"",
      size: 16,
      weight: "normal",
      style: "normal",
      decoration: "none"
    };
    multilineVars.infofont = {
      face: "\"Times New Roman\"",
      size: 14,
      weight: "normal",
      style: "italic",
      decoration: "none"
    };
    multilineVars.measurefont = {
      face: "\"Times New Roman\"",
      size: 14,
      weight: "normal",
      style: "italic",
      decoration: "none"
    };
    multilineVars.partsfont = {
      face: "\"Times New Roman\"",
      size: 15,
      weight: "normal",
      style: "normal",
      decoration: "none"
    };
    multilineVars.repeatfont = {
      face: "\"Times New Roman\"",
      size: 13,
      weight: "normal",
      style: "normal",
      decoration: "none"
    };
    multilineVars.textfont = {
      face: "\"Times New Roman\"",
      size: 16,
      weight: "normal",
      style: "normal",
      decoration: "none"
    };
    multilineVars.tripletfont = {
      face: "Times",
      size: 11,
      weight: "normal",
      style: "italic",
      decoration: "none"
    };
    multilineVars.vocalfont = {
      face: "\"Times New Roman\"",
      size: 13,
      weight: "bold",
      style: "normal",
      decoration: "none"
    };
    multilineVars.wordsfont = {
      face: "\"Times New Roman\"",
      size: 16,
      weight: "normal",
      style: "normal",
      decoration: "none"
    }; // These fonts are global for the entire tune.

    tune.formatting.composerfont = {
      face: "\"Times New Roman\"",
      size: 14,
      weight: "normal",
      style: "italic",
      decoration: "none"
    };
    tune.formatting.subtitlefont = {
      face: "\"Times New Roman\"",
      size: 16,
      weight: "normal",
      style: "normal",
      decoration: "none"
    };
    tune.formatting.tempofont = {
      face: "\"Times New Roman\"",
      size: 15,
      weight: "bold",
      style: "normal",
      decoration: "none"
    };
    tune.formatting.titlefont = {
      face: "\"Times New Roman\"",
      size: 20,
      weight: "normal",
      style: "normal",
      decoration: "none"
    };
    tune.formatting.footerfont = {
      face: "\"Times New Roman\"",
      size: 12,
      weight: "normal",
      style: "normal",
      decoration: "none"
    };
    tune.formatting.headerfont = {
      face: "\"Times New Roman\"",
      size: 12,
      weight: "normal",
      style: "normal",
      decoration: "none"
    };
    tune.formatting.voicefont = {
      face: "\"Times New Roman\"",
      size: 13,
      weight: "bold",
      style: "normal",
      decoration: "none"
    }; // these are the default fonts for these element types. In the printer, these fonts might change as the tune progresses.

    tune.formatting.annotationfont = multilineVars.annotationfont;
    tune.formatting.gchordfont = multilineVars.gchordfont;
    tune.formatting.historyfont = multilineVars.historyfont;
    tune.formatting.infofont = multilineVars.infofont;
    tune.formatting.measurefont = multilineVars.measurefont;
    tune.formatting.partsfont = multilineVars.partsfont;
    tune.formatting.repeatfont = multilineVars.repeatfont;
    tune.formatting.textfont = multilineVars.textfont;
    tune.formatting.tripletfont = multilineVars.tripletfont;
    tune.formatting.vocalfont = multilineVars.vocalfont;
    tune.formatting.wordsfont = multilineVars.wordsfont;
  }

  var fontTypeCanHaveBox = {
    gchordfont: true,
    measurefont: true,
    partsfont: true,
    annotationfont: true,
    composerfont: true,
    historyfont: true,
    infofont: true,
    subtitlefont: true,
    textfont: true,
    titlefont: true,
    voicefont: true
  };

  var fontTranslation = function fontTranslation(fontFace) {
    // This translates Postscript fonts for a web alternative.
    // Note that the postscript fonts contain italic and bold info in them, so what is returned is a hash.
    switch (fontFace) {
      case "Arial-Italic":
        return {
          face: "Arial",
          weight: "normal",
          style: "italic",
          decoration: "none"
        };

      case "Arial-Bold":
        return {
          face: "Arial",
          weight: "bold",
          style: "normal",
          decoration: "none"
        };

      case "Bookman-Demi":
        return {
          face: "Bookman,serif",
          weight: "bold",
          style: "normal",
          decoration: "none"
        };

      case "Bookman-DemiItalic":
        return {
          face: "Bookman,serif",
          weight: "bold",
          style: "italic",
          decoration: "none"
        };

      case "Bookman-Light":
        return {
          face: "Bookman,serif",
          weight: "normal",
          style: "normal",
          decoration: "none"
        };

      case "Bookman-LightItalic":
        return {
          face: "Bookman,serif",
          weight: "normal",
          style: "italic",
          decoration: "none"
        };

      case "Courier":
        return {
          face: "\"Courier New\"",
          weight: "normal",
          style: "normal",
          decoration: "none"
        };

      case "Courier-Oblique":
        return {
          face: "\"Courier New\"",
          weight: "normal",
          style: "italic",
          decoration: "none"
        };

      case "Courier-Bold":
        return {
          face: "\"Courier New\"",
          weight: "bold",
          style: "normal",
          decoration: "none"
        };

      case "Courier-BoldOblique":
        return {
          face: "\"Courier New\"",
          weight: "bold",
          style: "italic",
          decoration: "none"
        };

      case "AvantGarde-Book":
        return {
          face: "AvantGarde,Arial",
          weight: "normal",
          style: "normal",
          decoration: "none"
        };

      case "AvantGarde-BookOblique":
        return {
          face: "AvantGarde,Arial",
          weight: "normal",
          style: "italic",
          decoration: "none"
        };

      case "AvantGarde-Demi":
      case "Avant-Garde-Demi":
        return {
          face: "AvantGarde,Arial",
          weight: "bold",
          style: "normal",
          decoration: "none"
        };

      case "AvantGarde-DemiOblique":
        return {
          face: "AvantGarde,Arial",
          weight: "bold",
          style: "italic",
          decoration: "none"
        };

      case "Helvetica-Oblique":
        return {
          face: "Helvetica",
          weight: "normal",
          style: "italic",
          decoration: "none"
        };

      case "Helvetica-Bold":
        return {
          face: "Helvetica",
          weight: "bold",
          style: "normal",
          decoration: "none"
        };

      case "Helvetica-BoldOblique":
        return {
          face: "Helvetica",
          weight: "bold",
          style: "italic",
          decoration: "none"
        };

      case "Helvetica-Narrow":
        return {
          face: "\"Helvetica Narrow\",Helvetica",
          weight: "normal",
          style: "normal",
          decoration: "none"
        };

      case "Helvetica-Narrow-Oblique":
        return {
          face: "\"Helvetica Narrow\",Helvetica",
          weight: "normal",
          style: "italic",
          decoration: "none"
        };

      case "Helvetica-Narrow-Bold":
        return {
          face: "\"Helvetica Narrow\",Helvetica",
          weight: "bold",
          style: "normal",
          decoration: "none"
        };

      case "Helvetica-Narrow-BoldOblique":
        return {
          face: "\"Helvetica Narrow\",Helvetica",
          weight: "bold",
          style: "italic",
          decoration: "none"
        };

      case "Palatino-Roman":
        return {
          face: "Palatino",
          weight: "normal",
          style: "normal",
          decoration: "none"
        };

      case "Palatino-Italic":
        return {
          face: "Palatino",
          weight: "normal",
          style: "italic",
          decoration: "none"
        };

      case "Palatino-Bold":
        return {
          face: "Palatino",
          weight: "bold",
          style: "normal",
          decoration: "none"
        };

      case "Palatino-BoldItalic":
        return {
          face: "Palatino",
          weight: "bold",
          style: "italic",
          decoration: "none"
        };

      case "NewCenturySchlbk-Roman":
        return {
          face: "\"New Century\",serif",
          weight: "normal",
          style: "normal",
          decoration: "none"
        };

      case "NewCenturySchlbk-Italic":
        return {
          face: "\"New Century\",serif",
          weight: "normal",
          style: "italic",
          decoration: "none"
        };

      case "NewCenturySchlbk-Bold":
        return {
          face: "\"New Century\",serif",
          weight: "bold",
          style: "normal",
          decoration: "none"
        };

      case "NewCenturySchlbk-BoldItalic":
        return {
          face: "\"New Century\",serif",
          weight: "bold",
          style: "italic",
          decoration: "none"
        };

      case "Times":
      case "Times-Roman":
      case "Times-Narrow":
      case "Times-Courier":
      case "Times-New-Roman":
        return {
          face: "\"Times New Roman\"",
          weight: "normal",
          style: "normal",
          decoration: "none"
        };

      case "Times-Italic":
      case "Times-Italics":
        return {
          face: "\"Times New Roman\"",
          weight: "normal",
          style: "italic",
          decoration: "none"
        };

      case "Times-Bold":
        return {
          face: "\"Times New Roman\"",
          weight: "bold",
          style: "normal",
          decoration: "none"
        };

      case "Times-BoldItalic":
        return {
          face: "\"Times New Roman\"",
          weight: "bold",
          style: "italic",
          decoration: "none"
        };

      case "ZapfChancery-MediumItalic":
        return {
          face: "\"Zapf Chancery\",cursive,serif",
          weight: "normal",
          style: "normal",
          decoration: "none"
        };

      default:
        return null;
    }
  };

  var getFontParameter = function getFontParameter(tokens, currentSetting, str, position, cmd) {
    // Every font parameter has the following format:
    // <face> <utf8> <size> <modifiers> <box>
    // Where:
    // face: either a standard web font name, or a postscript font, enumerated in fontTranslation. This could also be an * or be missing if the face shouldn't change.
    // utf8: This is optional, and specifies utf8. That's all that is supported so the field is just silently ignored.
    // size: The size, in pixels. This may be omitted if the size is not changing.
    // modifiers: zero or more of "bold", "italic", "underline"
    // box: Only applies to the measure numbers, gchords, and the parts. If present, then a box is drawn around the characters.
    // If face is present, then all the modifiers are cleared. If face is absent, then the modifiers are illegal.
    // The face can be a single word, a set of words separated by hyphens, or a quoted string.
    //
    // So, in practicality, there are three types of font definitions: a number only, an asterisk and a number only, or the full definition (with an optional size).
    function processNumberOnly() {
      var size = parseInt(tokens[0].token);
      tokens.shift();

      if (!currentSetting) {
        warn("Can't set just the size of the font since there is no default value.", str, position);
        return {
          face: "\"Times New Roman\"",
          weight: "normal",
          style: "normal",
          decoration: "none",
          size: size
        };
      }

      if (tokens.length === 0) {
        return {
          face: currentSetting.face,
          weight: currentSetting.weight,
          style: currentSetting.style,
          decoration: currentSetting.decoration,
          size: size
        };
      }

      if (tokens.length === 1 && tokens[0].token === "box" && fontTypeCanHaveBox[cmd]) return {
        face: currentSetting.face,
        weight: currentSetting.weight,
        style: currentSetting.style,
        decoration: currentSetting.decoration,
        size: size,
        box: true
      };
      warn("Extra parameters in font definition.", str, position);
      return {
        face: currentSetting.face,
        weight: currentSetting.weight,
        style: currentSetting.style,
        decoration: currentSetting.decoration,
        size: size
      };
    } // format 1: asterisk and number only


    if (tokens[0].token === '*') {
      tokens.shift();
      if (tokens[0].type === 'number') return processNumberOnly();else {
        warn("Expected font size number after *.", str, position);
      }
    } // format 2: number only


    if (tokens[0].type === 'number') {
      return processNumberOnly();
    } // format 3: whole definition


    var face = [];
    var size;
    var weight = "normal";
    var style = "normal";
    var decoration = "none";
    var box = false;
    var state = 'face';
    var hyphenLast = false;

    while (tokens.length) {
      var currToken = tokens.shift();
      var word = currToken.token.toLowerCase();

      switch (state) {
        case 'face':
          if (hyphenLast || word !== 'utf' && currToken.type !== 'number' && word !== "bold" && word !== "italic" && word !== "underline" && word !== "box") {
            if (face.length > 0 && currToken.token === '-') {
              hyphenLast = true;
              face[face.length - 1] = face[face.length - 1] + currToken.token;
            } else {
              if (hyphenLast) {
                hyphenLast = false;
                face[face.length - 1] = face[face.length - 1] + currToken.token;
              } else face.push(currToken.token);
            }
          } else {
            if (currToken.type === 'number') {
              if (size) {
                warn("Font size specified twice in font definition.", str, position);
              } else {
                size = currToken.token;
              }

              state = 'modifier';
            } else if (word === "bold") weight = "bold";else if (word === "italic") style = "italic";else if (word === "underline") decoration = "underline";else if (word === "box") {
              if (fontTypeCanHaveBox[cmd]) box = true;else warn("This font style doesn't support \"box\"", str, position);
              state = "finished";
            } else if (word === "utf") {
              currToken = tokens.shift(); // this gets rid of the "8" after "utf"

              state = "size";
            } else warn("Unknown parameter " + currToken.token + " in font definition.", str, position);
          }

          break;

        case "size":
          if (currToken.type === 'number') {
            if (size) {
              warn("Font size specified twice in font definition.", str, position);
            } else {
              size = currToken.token;
            }
          } else {
            warn("Expected font size in font definition.", str, position);
          }

          state = 'modifier';
          break;

        case "modifier":
          if (word === "bold") weight = "bold";else if (word === "italic") style = "italic";else if (word === "underline") decoration = "underline";else if (word === "box") {
            if (fontTypeCanHaveBox[cmd]) box = true;else warn("This font style doesn't support \"box\"", str, position);
            state = "finished";
          } else warn("Unknown parameter " + currToken.token + " in font definition.", str, position);
          break;

        case "finished":
          warn("Extra characters found after \"box\" in font definition.", str, position);
          break;
      }
    }

    if (size === undefined) {
      if (!currentSetting) {
        warn("Must specify the size of the font since there is no default value.", str, position);
        size = 12;
      } else size = currentSetting.size;
    } else size = parseFloat(size);

    face = face.join(' ');

    if (face === '') {
      if (!currentSetting) {
        warn("Must specify the name of the font since there is no default value.", str, position);
        face = "sans-serif";
      } else face = currentSetting.face;
    }

    var psFont = fontTranslation(face);
    var font = {};

    if (psFont) {
      font.face = psFont.face;
      font.weight = psFont.weight;
      font.style = psFont.style;
      font.decoration = psFont.decoration;
      font.size = size;
      if (box) font.box = true;
      return font;
    }

    font.face = face;
    font.weight = weight;
    font.style = style;
    font.decoration = decoration;
    font.size = size;
    if (box) font.box = true;
    return font;
  };

  var getChangingFont = function getChangingFont(cmd, tokens, str) {
    if (tokens.length === 0) return "Directive \"" + cmd + "\" requires a font as a parameter.";
    multilineVars[cmd] = getFontParameter(tokens, multilineVars[cmd], str, 0, cmd);
    if (multilineVars.is_in_header) // If the font appears in the header, then it becomes the default font.
      tune.formatting[cmd] = multilineVars[cmd];
    return null;
  };

  var getGlobalFont = function getGlobalFont(cmd, tokens, str) {
    if (tokens.length === 0) return "Directive \"" + cmd + "\" requires a font as a parameter.";
    tune.formatting[cmd] = getFontParameter(tokens, tune.formatting[cmd], str, 0, cmd);
    return null;
  };

  var setScale = function setScale(cmd, tokens) {
    var scratch = "";
    parseCommon.each(tokens, function (tok) {
      scratch += tok.token;
    });
    var num = parseFloat(scratch);
    if (isNaN(num) || num === 0) return "Directive \"" + cmd + "\" requires a number as a parameter.";
    tune.formatting.scale = num;
  }; // starts at 35


  var drumNames = ["acoustic-bass-drum", "bass-drum-1", "side-stick", "acoustic-snare", "hand-clap", "electric-snare", "low-floor-tom", "closed-hi-hat", "high-floor-tom", "pedal-hi-hat", "low-tom", "open-hi-hat", "low-mid-tom", "hi-mid-tom", "crash-cymbal-1", "high-tom", "ride-cymbal-1", "chinese-cymbal", "ride-bell", "tambourine", "splash-cymbal", "cowbell", "crash-cymbal-2", "vibraslap", "ride-cymbal-2", "hi-bongo", "low-bongo", "mute-hi-conga", "open-hi-conga", "low-conga", "high-timbale", "low-timbale", "high-agogo", "low-agogo", "cabasa", "maracas", "short-whistle", "long-whistle", "short-guiro", "long-guiro", "claves", "hi-wood-block", "low-wood-block", "mute-cuica", "open-cuica", "mute-triangle", "open-triangle"];

  var interpretPercMap = function interpretPercMap(restOfString) {
    var tokens = restOfString.split(/\s+/); // Allow multiple spaces.

    if (tokens.length !== 2 && tokens.length !== 3) return {
      error: 'Expected parameters "abc-note", "drum-sound", and optionally "note-head"'
    };
    var key = tokens[0]; // The percussion sound can either be a MIDI number or a drum name. If it is not a number then check for a name.

    var pitch = parseInt(tokens[1], 10);

    if ((isNaN(pitch) || pitch < 35 || pitch > 81) && tokens[1]) {
      pitch = drumNames.indexOf(tokens[1].toLowerCase()) + 35;
    }

    if (isNaN(pitch) || pitch < 35 || pitch > 81) return {
      error: 'Expected drum name, received "' + tokens[1] + '"'
    };
    var value = {
      sound: pitch
    };
    if (tokens.length === 3) value.noteHead = tokens[2];
    return {
      key: key,
      value: value
    };
  };

  var getRequiredMeasurement = function getRequiredMeasurement(cmd, tokens) {
    var points = tokenizer.getMeasurement(tokens);
    if (points.used === 0 || tokens.length !== 0) return {
      error: "Directive \"" + cmd + "\" requires a measurement as a parameter."
    };
    return points.value;
  };

  var oneParameterMeasurement = function oneParameterMeasurement(cmd, tokens) {
    var points = tokenizer.getMeasurement(tokens);
    if (points.used === 0 || tokens.length !== 0) return "Directive \"" + cmd + "\" requires a measurement as a parameter.";
    tune.formatting[cmd] = points.value;
    return null;
  };

  var addMultilineVar = function addMultilineVar(key, cmd, tokens, min, max) {
    if (tokens.length !== 1 || tokens[0].type !== 'number') return "Directive \"" + cmd + "\" requires a number as a parameter.";
    var i = tokens[0].intt;
    if (min !== undefined && i < min) return "Directive \"" + cmd + "\" requires a number greater than or equal to " + min + " as a parameter.";
    if (max !== undefined && i > max) return "Directive \"" + cmd + "\" requires a number less than or equal to " + max + " as a parameter.";
    multilineVars[key] = i;
    return null;
  };

  var addMultilineVarBool = function addMultilineVarBool(key, cmd, tokens) {
    if (tokens.length === 1 && (tokens[0].token === 'true' || tokens[0].token === 'false')) {
      multilineVars[key] = tokens[0].token === 'true';
      return null;
    }

    var str = addMultilineVar(key, cmd, tokens, 0, 1);
    if (str !== null) return str;
    multilineVars[key] = multilineVars[key] === 1;
    return null;
  };

  var addMultilineVarOneParamChoice = function addMultilineVarOneParamChoice(key, cmd, tokens, choices) {
    if (tokens.length !== 1) return "Directive \"" + cmd + "\" requires one of [ " + choices.join(", ") + " ] as a parameter.";
    var choice = tokens[0].token;
    var found = false;

    for (var i = 0; !found && i < choices.length; i++) {
      if (choices[i] === choice) found = true;
    }

    if (!found) return "Directive \"" + cmd + "\" requires one of [ " + choices.join(", ") + " ] as a parameter.";
    multilineVars[key] = choice;
    return null;
  };

  var midiCmdParam0 = ["nobarlines", "barlines", "beataccents", "nobeataccents", "droneon", "droneoff", "drumon", "drumoff", "fermatafixed", "fermataproportional", "gchordon", "gchordoff", "controlcombo", "temperamentnormal", "noportamento"];
  var midiCmdParam1String = ["gchord", "ptstress", "beatstring"];
  var midiCmdParam1Integer = ["bassvol", "chordvol", "c", "channel", "beatmod", "deltaloudness", "drumbars", "gracedivider", "makechordchannels", "randomchordattack", "chordattack", "stressmodel", "transpose", "rtranspose", "vol", "volinc"];
  var midiCmdParam1Integer1OptionalInteger = ["program"];
  var midiCmdParam2Integer = ["ratio", "snt", "bendvelocity", "pitchbend", "control", "temperamentlinear"];
  var midiCmdParam4Integer = ["beat"];
  var midiCmdParam5Integer = ["drone"];
  var midiCmdParam1String1Integer = ["portamento"];
  var midiCmdParamFraction = ["expand", "grace", "trim"];
  var midiCmdParam1StringVariableIntegers = ["drum", "chordname"];

  var parseMidiCommand = function parseMidiCommand(midi, tune, restOfString) {
    var midi_cmd = midi.shift().token;
    var midi_params = [];

    if (midiCmdParam0.indexOf(midi_cmd) >= 0) {
      // NO PARAMETERS
      if (midi.length !== 0) warn("Unexpected parameter in MIDI " + midi_cmd, restOfString, 0);
    } else if (midiCmdParam1String.indexOf(midi_cmd) >= 0) {
      // ONE STRING PARAMETER
      if (midi.length !== 1) warn("Expected one parameter in MIDI " + midi_cmd, restOfString, 0);else midi_params.push(midi[0].token);
    } else if (midiCmdParam1Integer.indexOf(midi_cmd) >= 0) {
      // ONE INT PARAMETER
      if (midi.length !== 1) warn("Expected one parameter in MIDI " + midi_cmd, restOfString, 0);else if (midi[0].type !== "number") warn("Expected one integer parameter in MIDI " + midi_cmd, restOfString, 0);else midi_params.push(midi[0].intt);
    } else if (midiCmdParam1Integer1OptionalInteger.indexOf(midi_cmd) >= 0) {
      // ONE INT PARAMETER, ONE OPTIONAL PARAMETER
      if (midi.length !== 1 && midi.length !== 2) warn("Expected one or two parameters in MIDI " + midi_cmd, restOfString, 0);else if (midi[0].type !== "number") warn("Expected integer parameter in MIDI " + midi_cmd, restOfString, 0);else if (midi.length === 2 && midi[1].type !== "number") warn("Expected integer parameter in MIDI " + midi_cmd, restOfString, 0);else {
        midi_params.push(midi[0].intt);
        if (midi.length === 2) midi_params.push(midi[1].intt);
      }
    } else if (midiCmdParam2Integer.indexOf(midi_cmd) >= 0) {
      // TWO INT PARAMETERS
      if (midi.length !== 2) warn("Expected two parameters in MIDI " + midi_cmd, restOfString, 0);else if (midi[0].type !== "number" || midi[1].type !== "number") warn("Expected two integer parameters in MIDI " + midi_cmd, restOfString, 0);else {
        midi_params.push(midi[0].intt);
        midi_params.push(midi[1].intt);
      }
    } else if (midiCmdParam1String1Integer.indexOf(midi_cmd) >= 0) {
      // ONE STRING PARAMETER, ONE INT PARAMETER
      if (midi.length !== 2) warn("Expected two parameters in MIDI " + midi_cmd, restOfString, 0);else if (midi[0].type !== "alpha" || midi[1].type !== "number") warn("Expected one string and one integer parameters in MIDI " + midi_cmd, restOfString, 0);else {
        midi_params.push(midi[0].token);
        midi_params.push(midi[1].intt);
      }
    } else if (midi_cmd === 'drummap') {
      // BUILD AN OBJECT OF ABC NOTE => MIDI NOTE
      if (midi.length === 2 && midi[0].type === 'alpha' && midi[1].type === 'number') {
        if (!tune.formatting) tune.formatting = {};
        if (!tune.formatting.midi) tune.formatting.midi = {};
        if (!tune.formatting.midi.drummap) tune.formatting.midi.drummap = {};
        tune.formatting.midi.drummap[midi[0].token] = midi[1].intt;
        midi_params = tune.formatting.midi.drummap;
      } else if (midi.length === 3 && midi[0].type === 'punct' && midi[1].type === 'alpha' && midi[2].type === 'number') {
        if (!tune.formatting) tune.formatting = {};
        if (!tune.formatting.midi) tune.formatting.midi = {};
        if (!tune.formatting.midi.drummap) tune.formatting.midi.drummap = {};
        tune.formatting.midi.drummap[midi[0].token + midi[1].token] = midi[2].intt;
        midi_params = tune.formatting.midi.drummap;
      } else {
        warn("Expected one note name and one integer parameter in MIDI " + midi_cmd, restOfString, 0);
      }
    } else if (midiCmdParamFraction.indexOf(midi_cmd) >= 0) {
      // ONE FRACTION PARAMETER
      if (midi.length !== 3) warn("Expected fraction parameter in MIDI " + midi_cmd, restOfString, 0);else if (midi[0].type !== "number" || midi[1].token !== "/" || midi[2].type !== "number") warn("Expected fraction parameter in MIDI " + midi_cmd, restOfString, 0);else {
        midi_params.push(midi[0].intt);
        midi_params.push(midi[2].intt);
      }
    } else if (midiCmdParam4Integer.indexOf(midi_cmd) >= 0) {
      // FOUR INT PARAMETERS
      if (midi.length !== 4) warn("Expected four parameters in MIDI " + midi_cmd, restOfString, 0);else if (midi[0].type !== "number" || midi[1].type !== "number" || midi[2].type !== "number" || midi[3].type !== "number") warn("Expected four integer parameters in MIDI " + midi_cmd, restOfString, 0);else {
        midi_params.push(midi[0].intt);
        midi_params.push(midi[1].intt);
        midi_params.push(midi[2].intt);
        midi_params.push(midi[3].intt);
      }
    } else if (midiCmdParam5Integer.indexOf(midi_cmd) >= 0) {
      // FIVE INT PARAMETERS
      if (midi.length !== 5) warn("Expected five parameters in MIDI " + midi_cmd, restOfString, 0);else if (midi[0].type !== "number" || midi[1].type !== "number" || midi[2].type !== "number" || midi[3].type !== "number" || midi[4].type !== "number") warn("Expected five integer parameters in MIDI " + midi_cmd, restOfString, 0);else {
        midi_params.push(midi[0].intt);
        midi_params.push(midi[1].intt);
        midi_params.push(midi[2].intt);
        midi_params.push(midi[3].intt);
        midi_params.push(midi[4].intt);
      }
    } else if (midiCmdParam1Integer1OptionalInteger.indexOf(midi_cmd) >= 0) {
      // ONE INT PARAMETER, ONE OPTIONAL OCTAVE PARAMETER
      if (midi.length !== 1 || midi.length !== 4) warn("Expected one or two parameters in MIDI " + midi_cmd, restOfString, 0);else if (midi[0].type !== "number") warn("Expected integer parameter in MIDI " + midi_cmd, restOfString, 0);else if (midi.length === 4) {
        if (midi[1].token !== "octave") warn("Expected octave parameter in MIDI " + midi_cmd, restOfString, 0);
        if (midi[2].token !== "=") warn("Expected octave parameter in MIDI " + midi_cmd, restOfString, 0);
        if (midi[3].type !== "number") warn("Expected integer parameter for octave in MIDI " + midi_cmd, restOfString, 0);
      } else {
        midi_params.push(midi[0].intt);
        if (midi.length === 4) midi_params.push(midi[3].intt);
      }
    } else if (midiCmdParam1StringVariableIntegers.indexOf(midi_cmd) >= 0) {
      // ONE STRING, VARIABLE INT PARAMETERS
      if (midi.length < 2) warn("Expected string parameter and at least one integer parameter in MIDI " + midi_cmd, restOfString, 0);else if (midi[0].type !== "alpha") warn("Expected string parameter and at least one integer parameter in MIDI " + midi_cmd, restOfString, 0);else {
        var p = midi.shift();
        midi_params.push(p.token);

        while (midi.length > 0) {
          p = midi.shift();
          if (p.type !== "number") warn("Expected integer parameter in MIDI " + midi_cmd, restOfString, 0);
          midi_params.push(p.intt);
        }
      }
    }

    if (tuneBuilder.hasBeginMusic()) tuneBuilder.appendElement('midi', -1, -1, {
      cmd: midi_cmd,
      params: midi_params
    });else {
      if (tune.formatting['midi'] === undefined) tune.formatting['midi'] = {};
      tune.formatting['midi'][midi_cmd] = midi_params;
    }
  };

  parseDirective.parseFontChangeLine = function (textstr) {
    var textParts = textstr.split('$');

    if (textParts.length > 1 && multilineVars.setfont) {
      var textarr = [{
        text: textParts[0]
      }];

      for (var i = 1; i < textParts.length; i++) {
        if (textParts[i].charAt(0) === '0') textarr.push({
          text: textParts[i].substring(1)
        });else if (textParts[i].charAt(0) === '1' && multilineVars.setfont[1]) textarr.push({
          font: multilineVars.setfont[1],
          text: textParts[i].substring(1)
        });else if (textParts[i].charAt(0) === '2' && multilineVars.setfont[2]) textarr.push({
          font: multilineVars.setfont[2],
          text: textParts[i].substring(1)
        });else if (textParts[i].charAt(0) === '3' && multilineVars.setfont[3]) textarr.push({
          font: multilineVars.setfont[3],
          text: textParts[i].substring(1)
        });else if (textParts[i].charAt(0) === '4' && multilineVars.setfont[4]) textarr.push({
          font: multilineVars.setfont[4],
          text: textParts[i].substring(1)
        });else textarr[textarr.length - 1].text += '$' + textParts[i];
      }

      if (textarr.length > 1) return textarr;
    }

    return textstr;
  };

  var positionChoices = ['auto', 'above', 'below', 'hidden'];

  parseDirective.addDirective = function (str) {
    var tokens = tokenizer.tokenize(str, 0, str.length); // 3 or more % in a row, or just spaces after %% is just a comment

    if (tokens.length === 0 || tokens[0].type !== 'alpha') return null;
    var restOfString = str.substring(str.indexOf(tokens[0].token) + tokens[0].token.length);
    restOfString = tokenizer.stripComment(restOfString);
    var cmd = tokens.shift().token.toLowerCase();
    var scratch = "";
    var line;

    switch (cmd) {
      // The following directives were added to abc_parser_lint, but haven't been implemented here.
      // Most of them are direct translations from the directives that will be parsed in. See abcm2ps's format.txt for info on each of these.
      //					alignbars: { type: "number", optional: true },
      //					aligncomposer: { type: "string", Enum: [ 'left', 'center','right' ], optional: true },
      //					bstemdown: { type: "boolean", optional: true },
      //					continueall: { type: "boolean", optional: true },
      //					dynalign: { type: "boolean", optional: true },
      //					exprabove: { type: "boolean", optional: true },
      //					exprbelow: { type: "boolean", optional: true },
      //					gchordbox: { type: "boolean", optional: true },
      //					gracespacebefore: { type: "number", optional: true },
      //					gracespaceinside: { type: "number", optional: true },
      //					gracespaceafter: { type: "number", optional: true },
      //					infospace: { type: "number", optional: true },
      //					lineskipfac: { type: "number", optional: true },
      //					maxshrink: { type: "number", optional: true },
      //					maxstaffsep: { type: "number", optional: true },
      //					maxsysstaffsep: { type: "number", optional: true },
      //					notespacingfactor: { type: "number", optional: true },
      //					parskipfac: { type: "number", optional: true },
      //					slurheight: { type: "number", optional: true },
      //					splittune: { type: "boolean", optional: true },
      //					squarebreve: { type: "boolean", optional: true },
      //					stemheight: { type: "number", optional: true },
      //					straightflags: { type: "boolean", optional: true },
      //					stretchstaff: { type: "boolean", optional: true },
      //					titleformat: { type: "string", optional: true },
      case "bagpipes":
        tune.formatting.bagpipes = true;
        break;

      case "flatbeams":
        tune.formatting.flatbeams = true;
        break;

      case "landscape":
        multilineVars.landscape = true;
        break;

      case "papersize":
        multilineVars.papersize = restOfString;
        break;

      case "graceslurs":
        if (tokens.length !== 1) return "Directive graceslurs requires one parameter: 0 or 1";
        if (tokens[0].token === '0' || tokens[0].token === 'false') tune.formatting.graceSlurs = false;else if (tokens[0].token === '1' || tokens[0].token === 'true') tune.formatting.graceSlurs = true;else return "Directive graceslurs requires one parameter: 0 or 1 (received " + tokens[0].token + ')';
        break;

      case "stretchlast":
        var sl = parseStretchLast(tokens);
        if (sl.value !== undefined) tune.formatting.stretchlast = sl.value;
        if (sl.error) return sl.error;
        break;

      case "titlecaps":
        multilineVars.titlecaps = true;
        break;

      case "titleleft":
        tune.formatting.titleleft = true;
        break;

      case "measurebox":
        tune.formatting.measurebox = true;
        break;

      case "vocal":
        return addMultilineVarOneParamChoice("vocalPosition", cmd, tokens, positionChoices);

      case "dynamic":
        return addMultilineVarOneParamChoice("dynamicPosition", cmd, tokens, positionChoices);

      case "gchord":
        return addMultilineVarOneParamChoice("chordPosition", cmd, tokens, positionChoices);

      case "ornament":
        return addMultilineVarOneParamChoice("ornamentPosition", cmd, tokens, positionChoices);

      case "volume":
        return addMultilineVarOneParamChoice("volumePosition", cmd, tokens, positionChoices);

      case "botmargin":
      case "botspace":
      case "composerspace":
      case "indent":
      case "leftmargin":
      case "linesep":
      case "musicspace":
      case "partsspace":
      case "pageheight":
      case "pagewidth":
      case "rightmargin":
      case "staffsep":
      case "staffwidth":
      case "subtitlespace":
      case "sysstaffsep":
      case "systemsep":
      case "textspace":
      case "titlespace":
      case "topmargin":
      case "topspace":
      case "vocalspace":
      case "wordsspace":
        return oneParameterMeasurement(cmd, tokens);

      case "voicescale":
        if (tokens.length !== 1 || tokens[0].type !== 'number') return "voicescale requires one float as a parameter";
        var voiceScale = tokens.shift();

        if (multilineVars.currentVoice) {
          multilineVars.currentVoice.scale = voiceScale.floatt;
          tuneBuilder.changeVoiceScale(multilineVars.currentVoice.scale);
        }

        return null;

      case "vskip":
        var vskip = Math.round(getRequiredMeasurement(cmd, tokens));
        if (vskip.error) return vskip.error;
        tuneBuilder.addSpacing(vskip);
        return null;

      case "scale":
        setScale(cmd, tokens);
        break;

      case "sep":
        if (tokens.length === 0) tuneBuilder.addSeparator(14, 14, 85); // If no parameters are given, then there is a default size.
        else {
            var points = tokenizer.getMeasurement(tokens);
            if (points.used === 0) return "Directive \"" + cmd + "\" requires 3 numbers: space above, space below, length of line";
            var spaceAbove = points.value;
            points = tokenizer.getMeasurement(tokens);
            if (points.used === 0) return "Directive \"" + cmd + "\" requires 3 numbers: space above, space below, length of line";
            var spaceBelow = points.value;
            points = tokenizer.getMeasurement(tokens);
            if (points.used === 0 || tokens.length !== 0) return "Directive \"" + cmd + "\" requires 3 numbers: space above, space below, length of line";
            var lenLine = points.value;
            tuneBuilder.addSeparator(spaceAbove, spaceBelow, lenLine);
          }
        break;

      case "barsperstaff":
        scratch = addMultilineVar('barsperstaff', cmd, tokens);
        if (scratch !== null) return scratch;
        break;

      case "staffnonote":
        // The sense of the boolean is opposite here. "0" means true.
        if (tokens.length !== 1) return "Directive staffnonote requires one parameter: 0 or 1";
        if (tokens[0].token === '0') multilineVars.staffnonote = true;else if (tokens[0].token === '1') multilineVars.staffnonote = false;else return "Directive staffnonote requires one parameter: 0 or 1 (received " + tokens[0].token + ')';
        break;

      case "printtempo":
        scratch = addMultilineVarBool('printTempo', cmd, tokens);
        if (scratch !== null) return scratch;
        break;

      case "partsbox":
        scratch = addMultilineVarBool('partsBox', cmd, tokens);
        if (scratch !== null) return scratch;
        multilineVars.partsfont.box = multilineVars.partsBox;
        break;

      case "freegchord":
        scratch = addMultilineVarBool('freegchord', cmd, tokens);
        if (scratch !== null) return scratch;
        break;

      case "measurenb":
      case "barnumbers":
        scratch = addMultilineVar('barNumbers', cmd, tokens);
        if (scratch !== null) return scratch;
        break;

      case "setbarnb":
        if (tokens.length !== 1 || tokens[0].type !== 'number') {
          return 'Directive setbarnb requires a number as a parameter.';
        }

        multilineVars.currBarNumber = tuneBuilder.setBarNumberImmediate(tokens[0].intt);
        break;

      case "begintext":
        var textBlock = '';
        line = tokenizer.nextLine();

        while (line && line.indexOf('%%endtext') !== 0) {
          if (parseCommon.startsWith(line, "%%")) textBlock += line.substring(2) + "\n";else textBlock += line + "\n";
          line = tokenizer.nextLine();
        }

        tuneBuilder.addText(textBlock);
        break;

      case "continueall":
        multilineVars.continueall = true;
        break;

      case "beginps":
        line = tokenizer.nextLine();

        while (line && line.indexOf('%%endps') !== 0) {
          tokenizer.nextLine();
        }

        warn("Postscript ignored", str, 0);
        break;

      case "deco":
        if (restOfString.length > 0) multilineVars.ignoredDecorations.push(restOfString.substring(0, restOfString.indexOf(' ')));
        warn("Decoration redefinition ignored", str, 0);
        break;

      case "text":
        var textstr = tokenizer.translateString(restOfString);
        tuneBuilder.addText(parseDirective.parseFontChangeLine(textstr));
        break;

      case "center":
        var centerstr = tokenizer.translateString(restOfString);
        tuneBuilder.addCentered(parseDirective.parseFontChangeLine(centerstr));
        break;

      case "font":
        // don't need to do anything for this; it is a useless directive
        break;

      case "setfont":
        var sfTokens = tokenizer.tokenize(restOfString, 0, restOfString.length); //				var sfDone = false;

        if (sfTokens.length >= 4) {
          if (sfTokens[0].token === '-' && sfTokens[1].type === 'number') {
            var sfNum = parseInt(sfTokens[1].token);

            if (sfNum >= 1 && sfNum <= 4) {
              if (!multilineVars.setfont) multilineVars.setfont = [];
              sfTokens.shift();
              sfTokens.shift();
              multilineVars.setfont[sfNum] = getFontParameter(sfTokens, multilineVars.setfont[sfNum], str, 0, 'setfont'); //							var sfSize = sfTokens.pop();
              //							if (sfSize.type === 'number') {
              //								sfSize = parseInt(sfSize.token);
              //								var sfFontName = '';
              //								for (var sfi = 2; sfi < sfTokens.length; sfi++)
              //									sfFontName += sfTokens[sfi].token;
              //								multilineVars.setfont[sfNum] = { face: sfFontName, size: sfSize };
              //								sfDone = true;
              //							}
            }
          }
        } //				if (!sfDone)
        //					return "Bad parameters: " + cmd;


        break;

      case "gchordfont":
      case "partsfont":
      case "tripletfont":
      case "vocalfont":
      case "textfont":
      case "annotationfont":
      case "historyfont":
      case "infofont":
      case "measurefont":
      case "repeatfont":
      case "wordsfont":
        return getChangingFont(cmd, tokens, str);

      case "composerfont":
      case "subtitlefont":
      case "tempofont":
      case "titlefont":
      case "voicefont":
      case "footerfont":
      case "headerfont":
        return getGlobalFont(cmd, tokens, str);

      case "barlabelfont":
      case "barnumberfont":
      case "barnumfont":
        return getChangingFont("measurefont", tokens, str);

      case "staves":
      case "score":
        multilineVars.score_is_present = true;

        var addVoice = function addVoice(id, newStaff, bracket, brace, continueBar) {
          if (newStaff || multilineVars.staves.length === 0) {
            multilineVars.staves.push({
              index: multilineVars.staves.length,
              numVoices: 0
            });
          }

          var staff = parseCommon.last(multilineVars.staves);
          if (bracket !== undefined && staff.bracket === undefined) staff.bracket = bracket;
          if (brace !== undefined && staff.brace === undefined) staff.brace = brace;
          if (continueBar) staff.connectBarLines = 'end';

          if (multilineVars.voices[id] === undefined) {
            multilineVars.voices[id] = {
              staffNum: staff.index,
              index: staff.numVoices
            };
            staff.numVoices++;
          }
        };

        var openParen = false;
        var openBracket = false;
        var openBrace = false;
        var justOpenParen = false;
        var justOpenBracket = false;
        var justOpenBrace = false;
        var continueBar = false;
        var lastVoice;

        var addContinueBar = function addContinueBar() {
          continueBar = true;

          if (lastVoice) {
            var ty = 'start';

            if (lastVoice.staffNum > 0) {
              if (multilineVars.staves[lastVoice.staffNum - 1].connectBarLines === 'start' || multilineVars.staves[lastVoice.staffNum - 1].connectBarLines === 'continue') ty = 'continue';
            }

            multilineVars.staves[lastVoice.staffNum].connectBarLines = ty;
          }
        };

        while (tokens.length) {
          var t = tokens.shift();

          switch (t.token) {
            case '(':
              if (openParen) warn("Can't nest parenthesis in %%score", str, t.start);else {
                openParen = true;
                justOpenParen = true;
              }
              break;

            case ')':
              if (!openParen || justOpenParen) warn("Unexpected close parenthesis in %%score", str, t.start);else openParen = false;
              break;

            case '[':
              if (openBracket) warn("Can't nest brackets in %%score", str, t.start);else {
                openBracket = true;
                justOpenBracket = true;
              }
              break;

            case ']':
              if (!openBracket || justOpenBracket) warn("Unexpected close bracket in %%score", str, t.start);else {
                openBracket = false;
                multilineVars.staves[lastVoice.staffNum].bracket = 'end';
              }
              break;

            case '{':
              if (openBrace) warn("Can't nest braces in %%score", str, t.start);else {
                openBrace = true;
                justOpenBrace = true;
              }
              break;

            case '}':
              if (!openBrace || justOpenBrace) warn("Unexpected close brace in %%score", str, t.start);else {
                openBrace = false;
                multilineVars.staves[lastVoice.staffNum].brace = 'end';
              }
              break;

            case '|':
              addContinueBar();
              break;

            default:
              var vc = "";

              while (t.type === 'alpha' || t.type === 'number') {
                vc += t.token;
                if (t.continueId) t = tokens.shift();else break;
              }

              var newStaff = !openParen || justOpenParen;
              var bracket = justOpenBracket ? 'start' : openBracket ? 'continue' : undefined;
              var brace = justOpenBrace ? 'start' : openBrace ? 'continue' : undefined;
              addVoice(vc, newStaff, bracket, brace, continueBar);
              justOpenParen = false;
              justOpenBracket = false;
              justOpenBrace = false;
              continueBar = false;
              lastVoice = multilineVars.voices[vc];
              if (cmd === 'staves') addContinueBar();
              break;
          }
        }

        break;

      case "newpage":
        var pgNum = tokenizer.getInt(restOfString);
        tuneBuilder.addNewPage(pgNum.digits === 0 ? -1 : pgNum.value);
        break;

      case "abc":
        var arr = restOfString.split(' ');

        switch (arr[0]) {
          case "-copyright":
          case "-creator":
          case "-edited-by":
          case "-version":
          case "-charset":
            var subCmd = arr.shift();
            tuneBuilder.addMetaText(cmd + subCmd, arr.join(' '));
            break;

          default:
            return "Unknown directive: " + cmd + arr[0];
        }

        break;

      case "header":
      case "footer":
        var footerStr = tokenizer.getMeat(restOfString, 0, restOfString.length);
        footerStr = restOfString.substring(footerStr.start, footerStr.end);
        if (footerStr.charAt(0) === '"' && footerStr.charAt(footerStr.length - 1) === '"') footerStr = footerStr.substring(1, footerStr.length - 1);
        var footerArr = footerStr.split('\t');
        var footer = {};
        if (footerArr.length === 1) footer = {
          left: "",
          center: footerArr[0],
          right: ""
        };else if (footerArr.length === 2) footer = {
          left: footerArr[0],
          center: footerArr[1],
          right: ""
        };else footer = {
          left: footerArr[0],
          center: footerArr[1],
          right: footerArr[2]
        };
        if (footerArr.length > 3) warn("Too many tabs in " + cmd + ": " + footerArr.length + " found.", restOfString, 0);
        tuneBuilder.addMetaTextObj(cmd, footer);
        break;

      case "midi":
        var midi = tokenizer.tokenize(restOfString, 0, restOfString.length, true);
        if (midi.length > 0 && midi[0].token === '=') midi.shift();
        if (midi.length === 0) warn("Expected midi command", restOfString, 0);else parseMidiCommand(midi, tune, restOfString);
        break;

      case "percmap":
        var percmap = interpretPercMap(restOfString);
        if (percmap.error) warn(percmap.error, str, 8);else {
          if (!tune.formatting.percmap) tune.formatting.percmap = {};
          tune.formatting.percmap[percmap.key] = percmap.value;
        }
        break;

      case "map":
      case "playtempo":
      case "auquality":
      case "continuous":
      case "nobarcheck":
        // TODO-PER: Actually handle the parameters of these
        tune.formatting[cmd] = restOfString;
        break;

      default:
        return "Unknown directive: " + cmd;
    }

    return null;
  };

  parseDirective.globalFormatting = function (formatHash) {
    for (var cmd in formatHash) {
      if (formatHash.hasOwnProperty(cmd)) {
        var value = '' + formatHash[cmd];
        var tokens = tokenizer.tokenize(value, 0, value.length);
        var scratch;

        switch (cmd) {
          case "titlefont":
          case "gchordfont":
          case "composerfont":
          case "footerfont":
          case "headerfont":
          case "historyfont":
          case "infofont":
          case "measurefont":
          case "partsfont":
          case "repeatfont":
          case "subtitlefont":
          case "tempofont":
          case "textfont":
          case "voicefont":
          case "tripletfont":
          case "vocalfont":
          case "wordsfont":
          case "annotationfont":
            getChangingFont(cmd, tokens, value);
            break;

          case "scale":
            setScale(cmd, tokens);
            break;

          case "partsbox":
            scratch = addMultilineVarBool('partsBox', cmd, tokens);
            if (scratch !== null) warn(scratch);
            multilineVars.partsfont.box = multilineVars.partsBox;
            break;

          case "freegchord":
            scratch = addMultilineVarBool('freegchord', cmd, tokens);
            if (scratch !== null) warn(scratch);
            break;

          case "fontboxpadding":
            if (tokens.length !== 1 || tokens[0].type !== 'number') warn("Directive \"" + cmd + "\" requires a number as a parameter.");
            tune.formatting.fontboxpadding = tokens[0].floatt;
            break;

          case "stretchlast":
            var sl = parseStretchLast(tokens);
            if (sl.value !== undefined) tune.formatting.stretchlast = sl.value;
            if (sl.error) return sl.error;
            break;

          default:
            warn("Formatting directive unrecognized: ", cmd, 0);
        }
      }
    }
  };

  function parseStretchLast(tokens) {
    if (tokens.length === 0) return {
      value: 1
    }; // if there is no value then the presence of this is the same as "true"
    else if (tokens.length === 1) {
        if (tokens[0].type === "number") {
          if (tokens[0].floatt >= 0 || tokens[0].floatt <= 1) return {
            value: tokens[0].floatt
          };
        } else if (tokens[0].token === 'false') {
          return {
            value: 0
          };
        } else if (tokens[0].token === 'true') {
          return {
            value: 1
          };
        }
      }
    return {
      error: "Directive stretchlast requires zero or one parameter: false, true, or number between 0 and 1 (received " + tokens[0].token + ')'
    };
  }
})();

module.exports = parseDirective;

/***/ }),

/***/ "./src/parse/abc_parse_header.js":
/*!***************************************!*\
  !*** ./src/parse/abc_parse_header.js ***!
  \***************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

//    abc_parse_header.js: parses a the header fields from a string representing ABC Music Notation into a usable internal structure.
var parseCommon = __webpack_require__(/*! ./abc_common */ "./src/parse/abc_common.js");

var parseDirective = __webpack_require__(/*! ./abc_parse_directive */ "./src/parse/abc_parse_directive.js");

var parseKeyVoice = __webpack_require__(/*! ./abc_parse_key_voice */ "./src/parse/abc_parse_key_voice.js");

var ParseHeader = function ParseHeader(tokenizer, warn, multilineVars, tune, tuneBuilder) {
  this.reset = function (tokenizer, warn, multilineVars, tune) {
    parseKeyVoice.initialize(tokenizer, warn, multilineVars, tune, tuneBuilder);
    parseDirective.initialize(tokenizer, warn, multilineVars, tune, tuneBuilder);
  };

  this.reset(tokenizer, warn, multilineVars, tune);

  this.setTitle = function (title) {
    if (multilineVars.hasMainTitle) tuneBuilder.addSubtitle(tokenizer.translateString(tokenizer.stripComment(title))); // display secondary title
    else {
        var titleStr = tokenizer.translateString(tokenizer.theReverser(tokenizer.stripComment(title)));
        if (multilineVars.titlecaps) titleStr = titleStr.toUpperCase();
        tuneBuilder.addMetaText("title", titleStr);
        multilineVars.hasMainTitle = true;
      }
  };

  this.setMeter = function (line) {
    line = tokenizer.stripComment(line);

    if (line === 'C') {
      if (multilineVars.havent_set_length === true) {
        multilineVars.default_length = 0.125;
        multilineVars.havent_set_length = false;
      }

      return {
        type: 'common_time'
      };
    } else if (line === 'C|') {
      if (multilineVars.havent_set_length === true) {
        multilineVars.default_length = 0.125;
        multilineVars.havent_set_length = false;
      }

      return {
        type: 'cut_time'
      };
    } else if (line === 'o') {
      if (multilineVars.havent_set_length === true) {
        multilineVars.default_length = 0.125;
        multilineVars.havent_set_length = false;
      }

      return {
        type: 'tempus_perfectum'
      };
    } else if (line === 'c') {
      if (multilineVars.havent_set_length === true) {
        multilineVars.default_length = 0.125;
        multilineVars.havent_set_length = false;
      }

      return {
        type: 'tempus_imperfectum'
      };
    } else if (line === 'o.') {
      if (multilineVars.havent_set_length === true) {
        multilineVars.default_length = 0.125;
        multilineVars.havent_set_length = false;
      }

      return {
        type: 'tempus_perfectum_prolatio'
      };
    } else if (line === 'c.') {
      if (multilineVars.havent_set_length === true) {
        multilineVars.default_length = 0.125;
        multilineVars.havent_set_length = false;
      }

      return {
        type: 'tempus_imperfectum_prolatio'
      };
    } else if (line.length === 0 || line.toLowerCase() === 'none') {
      if (multilineVars.havent_set_length === true) {
        multilineVars.default_length = 0.125;
        multilineVars.havent_set_length = false;
      }

      return null;
    } else {
      var tokens = tokenizer.tokenize(line, 0, line.length); // the form is [open_paren] decimal [ plus|dot decimal ]... [close_paren] slash decimal [plus same_as_before]

      try {
        var parseNum = function parseNum() {
          // handles this much: [open_paren] decimal [ plus|dot decimal ]... [close_paren]
          var ret = {
            value: 0,
            num: ""
          };
          var tok = tokens.shift();
          if (tok.token === '(') tok = tokens.shift();

          while (1) {
            if (tok.type !== 'number') throw "Expected top number of meter";
            ret.value += parseInt(tok.token);
            ret.num += tok.token;
            if (tokens.length === 0 || tokens[0].token === '/') return ret;
            tok = tokens.shift();

            if (tok.token === ')') {
              if (tokens.length === 0 || tokens[0].token === '/') return ret;
              throw "Unexpected paren in meter";
            }

            if (tok.token !== '.' && tok.token !== '+') throw "Expected top number of meter";
            ret.num += tok.token;
            if (tokens.length === 0) throw "Expected top number of meter";
            tok = tokens.shift();
          }

          return ret; // just to suppress warning
        };

        var parseFraction = function parseFraction() {
          // handles this much: parseNum slash decimal
          var ret = parseNum();
          if (tokens.length === 0) return ret;
          var tok = tokens.shift();
          if (tok.token !== '/') throw "Expected slash in meter";
          tok = tokens.shift();
          if (tok.type !== 'number') throw "Expected bottom number of meter";
          ret.den = tok.token;
          ret.value = ret.value / parseInt(ret.den);
          return ret;
        };

        if (tokens.length === 0) throw "Expected meter definition in M: line";
        var meter = {
          type: 'specified',
          value: []
        };
        var totalLength = 0;

        while (1) {
          var ret = parseFraction();
          totalLength += ret.value;
          var mv = {
            num: ret.num
          };
          if (ret.den !== undefined) mv.den = ret.den;
          meter.value.push(mv);
          if (tokens.length === 0) break; //var tok = tokens.shift();
          //if (tok.token !== '+') throw "Extra characters in M: line";
        }

        if (multilineVars.havent_set_length === true) {
          multilineVars.default_length = totalLength < 0.75 ? 0.0625 : 0.125;
          multilineVars.havent_set_length = false;
        }

        return meter;
      } catch (e) {
        warn(e, line, 0);
      }
    }

    return null;
  };

  this.calcTempo = function (relTempo) {
    var dur = 1 / 4;

    if (multilineVars.meter && multilineVars.meter.type === 'specified') {
      dur = 1 / parseInt(multilineVars.meter.value[0].den);
    } else if (multilineVars.origMeter && multilineVars.origMeter.type === 'specified') {
      dur = 1 / parseInt(multilineVars.origMeter.value[0].den);
    } //var dur = multilineVars.default_length ? multilineVars.default_length : 1;


    for (var i = 0; i < relTempo.duration; i++) {
      relTempo.duration[i] = dur * relTempo.duration[i];
    }

    return relTempo;
  };

  this.resolveTempo = function () {
    if (multilineVars.tempo) {
      // If there's a tempo waiting to be resolved
      this.calcTempo(multilineVars.tempo);
      tune.metaText.tempo = multilineVars.tempo;
      delete multilineVars.tempo;
    }
  };

  this.addUserDefinition = function (line, start, end) {
    var equals = line.indexOf('=', start);

    if (equals === -1) {
      warn("Need an = in a macro definition", line, start);
      return;
    }

    var before = parseCommon.strip(line.substring(start, equals));
    var after = parseCommon.strip(line.substring(equals + 1));

    if (before.length !== 1) {
      warn("Macro definitions can only be one character", line, start);
      return;
    }

    var legalChars = "HIJKLMNOPQRSTUVWXYhijklmnopqrstuvw~";

    if (legalChars.indexOf(before) === -1) {
      warn("Macro definitions must be H-Y, h-w, or tilde", line, start);
      return;
    }

    if (after.length === 0) {
      warn("Missing macro definition", line, start);
      return;
    }

    if (multilineVars.macros === undefined) multilineVars.macros = {};
    multilineVars.macros[before] = after;
  };

  this.setDefaultLength = function (line, start, end) {
    var len = parseCommon.gsub(line.substring(start, end), " ", "");
    var len_arr = len.split('/');

    if (len_arr.length === 2) {
      var n = parseInt(len_arr[0]);
      var d = parseInt(len_arr[1]);

      if (d > 0) {
        multilineVars.default_length = n / d; // a whole note is 1

        multilineVars.havent_set_length = false;
      }
    } else if (len_arr.length === 1 && len_arr[0] === '1') {
      multilineVars.default_length = 1;
      multilineVars.havent_set_length = false;
    }
  };

  var tempoString = {
    larghissimo: 20,
    adagissimo: 24,
    sostenuto: 28,
    grave: 32,
    largo: 40,
    lento: 50,
    larghetto: 60,
    adagio: 68,
    adagietto: 74,
    andante: 80,
    andantino: 88,
    "marcia moderato": 84,
    "andante moderato": 100,
    moderato: 112,
    allegretto: 116,
    "allegro moderato": 120,
    allegro: 126,
    animato: 132,
    agitato: 140,
    veloce: 148,
    "mosso vivo": 156,
    vivace: 164,
    vivacissimo: 172,
    allegrissimo: 176,
    presto: 184,
    prestissimo: 210
  };

  this.setTempo = function (line, start, end) {
    //Q - tempo; can be used to specify the notes per minute, e.g. If
    //the meter denominator is a 4 note then Q:120 or Q:C=120
    //is 120 quarter notes per minute. Similarly  Q:C3=40 would be 40
    //dotted half notes per minute. An absolute tempo may also be
    //set, e.g. Q:1/8=120 is 120 eighth notes per minute,
    //irrespective of the meter's denominator.
    //
    // This is either a number, "C=number", "Cnumber=number", or fraction [fraction...]=number
    // It depends on the M: field, which may either not be present, or may appear after this.
    // If M: is not present, an eighth note is used.
    // That means that this field can't be calculated until the end, if it is the first three types, since we don't know if we'll see an M: field.
    // So, if it is the fourth type, set it here, otherwise, save the info in the multilineVars.
    // The temporary variables we keep are the duration and the bpm. In the first two forms, the duration is 1.
    // In addition, a quoted string may both precede and follow. If a quoted string is present, then the duration part is optional.
    try {
      var tokens = tokenizer.tokenize(line, start, end);
      if (tokens.length === 0) throw "Missing parameter in Q: field";
      var tempo = {};
      var delaySet = true;
      var token = tokens.shift();

      if (token.type === 'quote') {
        tempo.preString = token.token;
        token = tokens.shift();

        if (tokens.length === 0) {
          // It's ok to just get a string for the tempo
          // If the string is a well-known tempo, put in the bpm
          if (tempoString[tempo.preString.toLowerCase()]) {
            tempo.bpm = tempoString[tempo.preString.toLowerCase()];
            tempo.suppressBpm = true;
          }

          return {
            type: 'immediate',
            tempo: tempo
          };
        }
      }

      if (token.type === 'alpha' && token.token === 'C') {
        // either type 2 or type 3
        if (tokens.length === 0) throw "Missing tempo after C in Q: field";
        token = tokens.shift();

        if (token.type === 'punct' && token.token === '=') {
          // This is a type 2 format. The duration is an implied 1
          if (tokens.length === 0) throw "Missing tempo after = in Q: field";
          token = tokens.shift();
          if (token.type !== 'number') throw "Expected number after = in Q: field";
          tempo.duration = [1];
          tempo.bpm = parseInt(token.token);
        } else if (token.type === 'number') {
          // This is a type 3 format.
          tempo.duration = [parseInt(token.token)];
          if (tokens.length === 0) throw "Missing = after duration in Q: field";
          token = tokens.shift();
          if (token.type !== 'punct' || token.token !== '=') throw "Expected = after duration in Q: field";
          if (tokens.length === 0) throw "Missing tempo after = in Q: field";
          token = tokens.shift();
          if (token.type !== 'number') throw "Expected number after = in Q: field";
          tempo.bpm = parseInt(token.token);
        } else throw "Expected number or equal after C in Q: field";
      } else if (token.type === 'number') {
        // either type 1 or type 4
        var num = parseInt(token.token);

        if (tokens.length === 0 || tokens[0].type === 'quote') {
          // This is type 1
          tempo.duration = [1];
          tempo.bpm = num;
        } else {
          // This is type 4
          delaySet = false;
          token = tokens.shift();
          if (token.type !== 'punct' && token.token !== '/') throw "Expected fraction in Q: field";
          token = tokens.shift();
          if (token.type !== 'number') throw "Expected fraction in Q: field";
          var den = parseInt(token.token);
          tempo.duration = [num / den]; // We got the first fraction, keep getting more as long as we find them.

          while (tokens.length > 0 && tokens[0].token !== '=' && tokens[0].type !== 'quote') {
            token = tokens.shift();
            if (token.type !== 'number') throw "Expected fraction in Q: field";
            num = parseInt(token.token);
            token = tokens.shift();
            if (token.type !== 'punct' && token.token !== '/') throw "Expected fraction in Q: field";
            token = tokens.shift();
            if (token.type !== 'number') throw "Expected fraction in Q: field";
            den = parseInt(token.token);
            tempo.duration.push(num / den);
          }

          token = tokens.shift();
          if (token.type !== 'punct' && token.token !== '=') throw "Expected = in Q: field";
          token = tokens.shift();
          if (token.type !== 'number') throw "Expected tempo in Q: field";
          tempo.bpm = parseInt(token.token);
        }
      } else throw "Unknown value in Q: field";

      if (tokens.length !== 0) {
        token = tokens.shift();

        if (token.type === 'quote') {
          tempo.postString = token.token;
          token = tokens.shift();
        }

        if (tokens.length !== 0) throw "Unexpected string at end of Q: field";
      }

      if (multilineVars.printTempo === false) tempo.suppress = true;
      return {
        type: delaySet ? 'delaySet' : 'immediate',
        tempo: tempo
      };
    } catch (msg) {
      warn(msg, line, start);
      return {
        type: 'none'
      };
    }
  };

  this.letter_to_inline_header = function (line, i, startLine) {
    var ws = tokenizer.eatWhiteSpace(line, i);
    i += ws;

    if (line.length >= i + 5 && line.charAt(i) === '[' && line.charAt(i + 2) === ':') {
      var e = line.indexOf(']', i);
      var startChar = multilineVars.iChar + i;
      var endChar = multilineVars.iChar + e + 1;

      switch (line.substring(i, i + 3)) {
        case "[I:":
          var err = parseDirective.addDirective(line.substring(i + 3, e));
          if (err) warn(err, line, i);
          return [e - i + 1 + ws];

        case "[M:":
          var meter = this.setMeter(line.substring(i + 3, e));
          if (tuneBuilder.hasBeginMusic() && meter) tuneBuilder.appendStartingElement('meter', startChar, endChar, meter);else multilineVars.meter = meter;
          return [e - i + 1 + ws];

        case "[K:":
          var result = parseKeyVoice.parseKey(line.substring(i + 3, e));
          if (result.foundClef && tuneBuilder.hasBeginMusic()) tuneBuilder.appendStartingElement('clef', startChar, endChar, multilineVars.clef);
          if (result.foundKey && tuneBuilder.hasBeginMusic()) tuneBuilder.appendStartingElement('key', startChar, endChar, parseKeyVoice.fixKey(multilineVars.clef, multilineVars.key));
          return [e - i + 1 + ws];

        case "[P:":
          if (startLine || tune.lines.length <= tune.lineNum) multilineVars.partForNextLine = {
            title: line.substring(i + 3, e),
            startChar: startChar,
            endChar: endChar
          };else tuneBuilder.appendElement('part', startChar, endChar, {
            title: line.substring(i + 3, e)
          });
          return [e - i + 1 + ws];

        case "[L:":
          this.setDefaultLength(line, i + 3, e);
          return [e - i + 1 + ws];

        case "[Q:":
          if (e > 0) {
            var tempo = this.setTempo(line, i + 3, e);

            if (tempo.type === 'delaySet') {
              if (tuneBuilder.hasBeginMusic()) tuneBuilder.appendElement('tempo', startChar, endChar, this.calcTempo(tempo.tempo));else multilineVars.tempoForNextLine = ['tempo', startChar, endChar, this.calcTempo(tempo.tempo)];
            } else if (tempo.type === 'immediate') {
              if (!startLine && tuneBuilder.hasBeginMusic()) tuneBuilder.appendElement('tempo', startChar, endChar, tempo.tempo);else multilineVars.tempoForNextLine = ['tempo', startChar, endChar, tempo.tempo];
            }

            return [e - i + 1 + ws, line.charAt(i + 1), line.substring(i + 3, e)];
          }

          break;

        case "[V:":
          if (e > 0) {
            parseKeyVoice.parseVoice(line, i + 3, e); //startNewLine();

            return [e - i + 1 + ws, line.charAt(i + 1), line.substring(i + 3, e)];
          }

          break;

        default: // TODO: complain about unhandled header

      }
    }

    return [0];
  };

  this.letter_to_body_header = function (line, i) {
    if (line.length >= i + 3) {
      switch (line.substring(i, i + 2)) {
        case "I:":
          var err = parseDirective.addDirective(line.substring(i + 2));
          if (err) warn(err, line, i);
          return [line.length];

        case "M:":
          var meter = this.setMeter(line.substring(i + 2));
          if (tuneBuilder.hasBeginMusic() && meter) tuneBuilder.appendStartingElement('meter', multilineVars.iChar + i, multilineVars.iChar + line.length, meter);
          return [line.length];

        case "K:":
          var result = parseKeyVoice.parseKey(line.substring(i + 2));
          if (result.foundClef && tuneBuilder.hasBeginMusic()) tuneBuilder.appendStartingElement('clef', multilineVars.iChar + i, multilineVars.iChar + line.length, multilineVars.clef);
          if (result.foundKey && tuneBuilder.hasBeginMusic()) tuneBuilder.appendStartingElement('key', multilineVars.iChar + i, multilineVars.iChar + line.length, parseKeyVoice.fixKey(multilineVars.clef, multilineVars.key));
          return [line.length];

        case "P:":
          if (tuneBuilder.hasBeginMusic()) tuneBuilder.appendElement('part', multilineVars.iChar + i, multilineVars.iChar + line.length, {
            title: line.substring(i + 2)
          });
          return [line.length];

        case "L:":
          this.setDefaultLength(line, i + 2, line.length);
          return [line.length];

        case "Q:":
          var e = line.indexOf('\x12', i + 2);
          if (e === -1) e = line.length;
          var tempo = this.setTempo(line, i + 2, e);
          if (tempo.type === 'delaySet') tuneBuilder.appendElement('tempo', multilineVars.iChar + i, multilineVars.iChar + line.length, this.calcTempo(tempo.tempo));else if (tempo.type === 'immediate') tuneBuilder.appendElement('tempo', multilineVars.iChar + i, multilineVars.iChar + line.length, tempo.tempo);
          return [e, line.charAt(i), parseCommon.strip(line.substring(i + 2))];

        case "V:":
          parseKeyVoice.parseVoice(line, i + 2, line.length); //						startNewLine();

          return [line.length, line.charAt(i), parseCommon.strip(line.substring(i + 2))];

        default: // TODO: complain about unhandled header

      }
    }

    return [0];
  };

  var metaTextHeaders = {
    A: 'author',
    B: 'book',
    C: 'composer',
    D: 'discography',
    F: 'url',
    G: 'group',
    I: 'instruction',
    N: 'notes',
    O: 'origin',
    R: 'rhythm',
    S: 'source',
    W: 'unalignedWords',
    Z: 'transcription'
  };

  this.parseHeader = function (line) {
    var field = metaTextHeaders[line.charAt(0)];

    if (field !== undefined) {
      if (field === 'unalignedWords') tuneBuilder.addMetaTextArray(field, parseDirective.parseFontChangeLine(tokenizer.translateString(tokenizer.stripComment(line.substring(2)))));else tuneBuilder.addMetaText(field, tokenizer.translateString(tokenizer.stripComment(line.substring(2))));
      return {};
    } else {
      var startChar = multilineVars.iChar;
      var endChar = startChar + line.length;

      switch (line.charAt(0)) {
        case 'H':
          tuneBuilder.addMetaText("history", tokenizer.translateString(tokenizer.stripComment(line.substring(2))));
          line = tokenizer.peekLine();

          while (line && line.charAt(1) !== ':') {
            tokenizer.nextLine();
            tuneBuilder.addMetaText("history", tokenizer.translateString(tokenizer.stripComment(line)));
            line = tokenizer.peekLine();
          }

          break;

        case 'K':
          // since the key is the last thing that can happen in the header, we can resolve the tempo now
          this.resolveTempo();
          var result = parseKeyVoice.parseKey(line.substring(2));

          if (!multilineVars.is_in_header && tuneBuilder.hasBeginMusic()) {
            if (result.foundClef) tuneBuilder.appendStartingElement('clef', startChar, endChar, multilineVars.clef);
            if (result.foundKey) tuneBuilder.appendStartingElement('key', startChar, endChar, parseKeyVoice.fixKey(multilineVars.clef, multilineVars.key));
          }

          multilineVars.is_in_header = false; // The first key signifies the end of the header.

          break;

        case 'L':
          this.setDefaultLength(line, 2, line.length);
          break;

        case 'M':
          multilineVars.origMeter = multilineVars.meter = this.setMeter(line.substring(2));
          break;

        case 'P':
          // TODO-PER: There is more to do with parts, but the writer doesn't care.
          if (multilineVars.is_in_header) tuneBuilder.addMetaText("partOrder", tokenizer.translateString(tokenizer.stripComment(line.substring(2))));else multilineVars.partForNextLine = {
            title: tokenizer.translateString(tokenizer.stripComment(line.substring(2))),
            startChar: startChar,
            endChar: endChar
          };
          break;

        case 'Q':
          var tempo = this.setTempo(line, 2, line.length);
          if (tempo.type === 'delaySet') multilineVars.tempo = tempo.tempo;else if (tempo.type === 'immediate') {
            if (!tune.metaText.tempo) tune.metaText.tempo = tempo.tempo;else multilineVars.tempoForNextLine = ['tempo', startChar, endChar, tempo.tempo];
          }
          break;

        case 'T':
          this.setTitle(line.substring(2));
          break;

        case 'U':
          this.addUserDefinition(line, 2, line.length);
          break;

        case 'V':
          parseKeyVoice.parseVoice(line, 2, line.length);
          if (!multilineVars.is_in_header) return {
            newline: true
          };
          break;

        case 's':
          return {
            symbols: true
          };

        case 'w':
          return {
            words: true
          };

        case 'X':
          break;

        case 'E':
        case 'm':
          warn("Ignored header", line, 0);
          break;

        default:
          return {
            regular: true
          };
      }
    }

    return {};
  };
};

module.exports = ParseHeader;

/***/ }),

/***/ "./src/parse/abc_parse_key_voice.js":
/*!******************************************!*\
  !*** ./src/parse/abc_parse_key_voice.js ***!
  \******************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var parseCommon = __webpack_require__(/*! ./abc_common */ "./src/parse/abc_common.js");

var parseDirective = __webpack_require__(/*! ./abc_parse_directive */ "./src/parse/abc_parse_directive.js");

var transpose = __webpack_require__(/*! ./abc_transpose */ "./src/parse/abc_transpose.js");

var parseKeyVoice = {};

(function () {
  var tokenizer;
  var warn;
  var multilineVars;
  var tune;
  var tuneBuilder;

  parseKeyVoice.initialize = function (tokenizer_, warn_, multilineVars_, tune_, tuneBuilder_) {
    tokenizer = tokenizer_;
    warn = warn_;
    multilineVars = multilineVars_;
    tune = tune_;
    tuneBuilder = tuneBuilder_;
  };

  parseKeyVoice.standardKey = function (keyName, root, acc, localTranspose) {
    var key1sharp = {
      acc: 'sharp',
      note: 'f'
    };
    var key2sharp = {
      acc: 'sharp',
      note: 'c'
    };
    var key3sharp = {
      acc: 'sharp',
      note: 'g'
    };
    var key4sharp = {
      acc: 'sharp',
      note: 'd'
    };
    var key5sharp = {
      acc: 'sharp',
      note: 'A'
    };
    var key6sharp = {
      acc: 'sharp',
      note: 'e'
    };
    var key7sharp = {
      acc: 'sharp',
      note: 'B'
    };
    var key1flat = {
      acc: 'flat',
      note: 'B'
    };
    var key2flat = {
      acc: 'flat',
      note: 'e'
    };
    var key3flat = {
      acc: 'flat',
      note: 'A'
    };
    var key4flat = {
      acc: 'flat',
      note: 'd'
    };
    var key5flat = {
      acc: 'flat',
      note: 'G'
    };
    var key6flat = {
      acc: 'flat',
      note: 'c'
    };
    var key7flat = {
      acc: 'flat',
      note: 'F'
    };
    var keys = {
      'C#': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp],
      'A#m': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp],
      'G#Mix': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp],
      'D#Dor': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp],
      'E#Phr': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp],
      'F#Lyd': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp],
      'B#Loc': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp],
      'F#': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp],
      'D#m': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp],
      'C#Mix': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp],
      'G#Dor': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp],
      'A#Phr': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp],
      'BLyd': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp],
      'E#Loc': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp],
      'B': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp],
      'G#m': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp],
      'F#Mix': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp],
      'C#Dor': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp],
      'D#Phr': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp],
      'ELyd': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp],
      'A#Loc': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp],
      'E': [key1sharp, key2sharp, key3sharp, key4sharp],
      'C#m': [key1sharp, key2sharp, key3sharp, key4sharp],
      'BMix': [key1sharp, key2sharp, key3sharp, key4sharp],
      'F#Dor': [key1sharp, key2sharp, key3sharp, key4sharp],
      'G#Phr': [key1sharp, key2sharp, key3sharp, key4sharp],
      'ALyd': [key1sharp, key2sharp, key3sharp, key4sharp],
      'D#Loc': [key1sharp, key2sharp, key3sharp, key4sharp],
      'A': [key1sharp, key2sharp, key3sharp],
      'F#m': [key1sharp, key2sharp, key3sharp],
      'EMix': [key1sharp, key2sharp, key3sharp],
      'BDor': [key1sharp, key2sharp, key3sharp],
      'C#Phr': [key1sharp, key2sharp, key3sharp],
      'DLyd': [key1sharp, key2sharp, key3sharp],
      'G#Loc': [key1sharp, key2sharp, key3sharp],
      'D': [key1sharp, key2sharp],
      'Bm': [key1sharp, key2sharp],
      'AMix': [key1sharp, key2sharp],
      'EDor': [key1sharp, key2sharp],
      'F#Phr': [key1sharp, key2sharp],
      'GLyd': [key1sharp, key2sharp],
      'C#Loc': [key1sharp, key2sharp],
      'G': [key1sharp],
      'Em': [key1sharp],
      'DMix': [key1sharp],
      'ADor': [key1sharp],
      'BPhr': [key1sharp],
      'CLyd': [key1sharp],
      'F#Loc': [key1sharp],
      'C': [],
      'Am': [],
      'GMix': [],
      'DDor': [],
      'EPhr': [],
      'FLyd': [],
      'BLoc': [],
      'F': [key1flat],
      'Dm': [key1flat],
      'CMix': [key1flat],
      'GDor': [key1flat],
      'APhr': [key1flat],
      'BbLyd': [key1flat],
      'ELoc': [key1flat],
      'Bb': [key1flat, key2flat],
      'Gm': [key1flat, key2flat],
      'FMix': [key1flat, key2flat],
      'CDor': [key1flat, key2flat],
      'DPhr': [key1flat, key2flat],
      'EbLyd': [key1flat, key2flat],
      'ALoc': [key1flat, key2flat],
      'Eb': [key1flat, key2flat, key3flat],
      'Cm': [key1flat, key2flat, key3flat],
      'BbMix': [key1flat, key2flat, key3flat],
      'FDor': [key1flat, key2flat, key3flat],
      'GPhr': [key1flat, key2flat, key3flat],
      'AbLyd': [key1flat, key2flat, key3flat],
      'DLoc': [key1flat, key2flat, key3flat],
      'Ab': [key1flat, key2flat, key3flat, key4flat],
      'Fm': [key1flat, key2flat, key3flat, key4flat],
      'EbMix': [key1flat, key2flat, key3flat, key4flat],
      'BbDor': [key1flat, key2flat, key3flat, key4flat],
      'CPhr': [key1flat, key2flat, key3flat, key4flat],
      'DbLyd': [key1flat, key2flat, key3flat, key4flat],
      'GLoc': [key1flat, key2flat, key3flat, key4flat],
      'Db': [key1flat, key2flat, key3flat, key4flat, key5flat],
      'Bbm': [key1flat, key2flat, key3flat, key4flat, key5flat],
      'AbMix': [key1flat, key2flat, key3flat, key4flat, key5flat],
      'EbDor': [key1flat, key2flat, key3flat, key4flat, key5flat],
      'FPhr': [key1flat, key2flat, key3flat, key4flat, key5flat],
      'GbLyd': [key1flat, key2flat, key3flat, key4flat, key5flat],
      'CLoc': [key1flat, key2flat, key3flat, key4flat, key5flat],
      'Gb': [key1flat, key2flat, key3flat, key4flat, key5flat, key6flat],
      'Ebm': [key1flat, key2flat, key3flat, key4flat, key5flat, key6flat],
      'DbMix': [key1flat, key2flat, key3flat, key4flat, key5flat, key6flat],
      'AbDor': [key1flat, key2flat, key3flat, key4flat, key5flat, key6flat],
      'BbPhr': [key1flat, key2flat, key3flat, key4flat, key5flat, key6flat],
      'CbLyd': [key1flat, key2flat, key3flat, key4flat, key5flat, key6flat],
      'FLoc': [key1flat, key2flat, key3flat, key4flat, key5flat, key6flat],
      'Cb': [key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat],
      'Abm': [key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat],
      'GbMix': [key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat],
      'DbDor': [key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat],
      'EbPhr': [key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat],
      'FbLyd': [key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat],
      'BbLoc': [key1flat, key2flat, key3flat, key4flat, key5flat, key6flat, key7flat],
      // The following are not in the 2.0 spec, but seem normal enough.
      // TODO-PER: These SOUND the same as what's written, but they aren't right
      'A#': [key1flat, key2flat],
      'B#': [],
      'D#': [key1flat, key2flat, key3flat],
      'E#': [key1flat],
      'G#': [key1flat, key2flat, key3flat, key4flat],
      'Gbm': [key1sharp, key2sharp, key3sharp, key4sharp, key5sharp, key6sharp, key7sharp],
      'none': []
    };
    return transpose.keySignature(multilineVars, keys, keyName, root, acc, localTranspose);
  };

  var clefLines = {
    'treble': {
      clef: 'treble',
      pitch: 4,
      mid: 0
    },
    'treble+8': {
      clef: 'treble+8',
      pitch: 4,
      mid: 0
    },
    'treble-8': {
      clef: 'treble-8',
      pitch: 4,
      mid: 0
    },
    'treble^8': {
      clef: 'treble+8',
      pitch: 4,
      mid: 0
    },
    'treble_8': {
      clef: 'treble-8',
      pitch: 4,
      mid: 0
    },
    'treble1': {
      clef: 'treble',
      pitch: 2,
      mid: 2
    },
    'treble2': {
      clef: 'treble',
      pitch: 4,
      mid: 0
    },
    'treble3': {
      clef: 'treble',
      pitch: 6,
      mid: -2
    },
    'treble4': {
      clef: 'treble',
      pitch: 8,
      mid: -4
    },
    'treble5': {
      clef: 'treble',
      pitch: 10,
      mid: -6
    },
    'perc': {
      clef: 'perc',
      pitch: 6,
      mid: 0
    },
    'swiss': {
      clef: 'swiss',
      pitch: 6,
      mid: 0
    },
    'none': {
      clef: 'none',
      mid: 0
    },
    'bass': {
      clef: 'bass',
      pitch: 8,
      mid: -12
    },
    'bass+8': {
      clef: 'bass+8',
      pitch: 8,
      mid: -12
    },
    'bass-8': {
      clef: 'bass-8',
      pitch: 8,
      mid: -12
    },
    'bass^8': {
      clef: 'bass+8',
      pitch: 8,
      mid: -12
    },
    'bass_8': {
      clef: 'bass-8',
      pitch: 8,
      mid: -12
    },
    'bass+16': {
      clef: 'bass',
      pitch: 8,
      mid: -12
    },
    'bass-16': {
      clef: 'bass',
      pitch: 8,
      mid: -12
    },
    'bass^16': {
      clef: 'bass',
      pitch: 8,
      mid: -12
    },
    'bass_16': {
      clef: 'bass',
      pitch: 8,
      mid: -12
    },
    'bass1': {
      clef: 'bass',
      pitch: 2,
      mid: -6
    },
    'bass2': {
      clef: 'bass',
      pitch: 4,
      mid: -8
    },
    'bass3': {
      clef: 'bass',
      pitch: 6,
      mid: -10
    },
    'bass4': {
      clef: 'bass',
      pitch: 8,
      mid: -12
    },
    'bass5': {
      clef: 'bass',
      pitch: 10,
      mid: -14
    },
    'tenor': {
      clef: 'alto',
      pitch: 8,
      mid: -8
    },
    'tenor1': {
      clef: 'alto',
      pitch: 2,
      mid: -2
    },
    'tenor2': {
      clef: 'alto',
      pitch: 4,
      mid: -4
    },
    'tenor3': {
      clef: 'alto',
      pitch: 6,
      mid: -6
    },
    'tenor4': {
      clef: 'alto',
      pitch: 8,
      mid: -8
    },
    'tenor5': {
      clef: 'alto',
      pitch: 10,
      mid: -10
    },
    'alto': {
      clef: 'alto',
      pitch: 6,
      mid: -6
    },
    'alto1': {
      clef: 'alto',
      pitch: 2,
      mid: -2
    },
    'alto2': {
      clef: 'alto',
      pitch: 4,
      mid: -4
    },
    'alto3': {
      clef: 'alto',
      pitch: 6,
      mid: -6
    },
    'alto4': {
      clef: 'alto',
      pitch: 8,
      mid: -8
    },
    'alto5': {
      clef: 'alto',
      pitch: 10,
      mid: -10
    },
    'alto+8': {
      clef: 'alto+8',
      pitch: 6,
      mid: -6
    },
    'alto-8': {
      clef: 'alto-8',
      pitch: 6,
      mid: -6
    },
    'alto^8': {
      clef: 'alto+8',
      pitch: 6,
      mid: -6
    },
    'alto_8': {
      clef: 'alto-8',
      pitch: 6,
      mid: -6
    }
  };

  var calcMiddle = function calcMiddle(clef, oct) {
    var value = clefLines[clef];
    var mid = value ? value.mid : 0;
    return mid + oct;
  };

  parseKeyVoice.fixClef = function (clef) {
    var value = clefLines[clef.type];

    if (value) {
      clef.clefPos = value.pitch;
      clef.type = value.clef;
    }
  };

  parseKeyVoice.deepCopyKey = function (key) {
    var ret = {
      accidentals: [],
      root: key.root,
      acc: key.acc,
      mode: key.mode
    };
    parseCommon.each(key.accidentals, function (k) {
      ret.accidentals.push(parseCommon.clone(k));
    });
    return ret;
  };

  var pitches = {
    A: 5,
    B: 6,
    C: 0,
    D: 1,
    E: 2,
    F: 3,
    G: 4,
    a: 12,
    b: 13,
    c: 7,
    d: 8,
    e: 9,
    f: 10,
    g: 11
  };

  parseKeyVoice.addPosToKey = function (clef, key) {
    // Shift the key signature from the treble positions to whatever position is needed for the clef.
    // This may put the key signature unnaturally high or low, so if it does, then shift it.
    var mid = clef.verticalPos;
    parseCommon.each(key.accidentals, function (acc) {
      var pitch = pitches[acc.note];
      pitch = pitch - mid;
      acc.verticalPos = pitch;
    });
    if (key.impliedNaturals) parseCommon.each(key.impliedNaturals, function (acc) {
      var pitch = pitches[acc.note];
      pitch = pitch - mid;
      acc.verticalPos = pitch;
    });

    if (mid < -10) {
      parseCommon.each(key.accidentals, function (acc) {
        acc.verticalPos -= 7;
        if (acc.verticalPos >= 11 || acc.verticalPos === 10 && acc.acc === 'flat') acc.verticalPos -= 7;
        if (acc.note === 'A' && acc.acc === 'sharp') acc.verticalPos -= 7;
        if ((acc.note === 'G' || acc.note === 'F') && acc.acc === 'flat') acc.verticalPos -= 7;
      });
      if (key.impliedNaturals) parseCommon.each(key.impliedNaturals, function (acc) {
        acc.verticalPos -= 7;
        if (acc.verticalPos >= 11 || acc.verticalPos === 10 && acc.acc === 'flat') acc.verticalPos -= 7;
        if (acc.note === 'A' && acc.acc === 'sharp') acc.verticalPos -= 7;
        if ((acc.note === 'G' || acc.note === 'F') && acc.acc === 'flat') acc.verticalPos -= 7;
      });
    } else if (mid < -4) {
      parseCommon.each(key.accidentals, function (acc) {
        acc.verticalPos -= 7;
        if (mid === -8 && (acc.note === 'f' || acc.note === 'g') && acc.acc === 'sharp') acc.verticalPos -= 7;
      });
      if (key.impliedNaturals) parseCommon.each(key.impliedNaturals, function (acc) {
        acc.verticalPos -= 7;
        if (mid === -8 && (acc.note === 'f' || acc.note === 'g') && acc.acc === 'sharp') acc.verticalPos -= 7;
      });
    } else if (mid >= 7) {
      parseCommon.each(key.accidentals, function (acc) {
        acc.verticalPos += 7;
      });
      if (key.impliedNaturals) parseCommon.each(key.impliedNaturals, function (acc) {
        acc.verticalPos += 7;
      });
    }
  };

  parseKeyVoice.fixKey = function (clef, key) {
    var fixedKey = parseCommon.clone(key);
    parseKeyVoice.addPosToKey(clef, fixedKey);
    return fixedKey;
  };

  var parseMiddle = function parseMiddle(str) {
    var i = 0;
    var p = str.charAt(i++);
    if (p === '^' || p === '_') p = str.charAt(i++);
    var mid = pitches[p];
    if (mid === undefined) mid = 6; // If a legal middle note wasn't received, just ignore it.

    for (; i < str.length; i++) {
      if (str.charAt(i) === ',') mid -= 7;else if (str.charAt(i) === "'") mid += 7;else break;
    }

    return {
      mid: mid - 6,
      str: str.substring(i)
    }; // We get the note in the middle of the staff. We want the note that appears as the first ledger line below the staff.
  };

  var normalizeAccidentals = function normalizeAccidentals(accs) {
    for (var i = 0; i < accs.length; i++) {
      if (accs[i].note === 'b') accs[i].note = 'B';else if (accs[i].note === 'a') accs[i].note = 'A';else if (accs[i].note === 'F') accs[i].note = 'f';else if (accs[i].note === 'E') accs[i].note = 'e';else if (accs[i].note === 'D') accs[i].note = 'd';else if (accs[i].note === 'C') accs[i].note = 'c';else if (accs[i].note === 'G' && accs[i].acc === 'sharp') accs[i].note = 'g';else if (accs[i].note === 'g' && accs[i].acc === 'flat') accs[i].note = 'G';
    }
  };

  parseKeyVoice.parseKey = function (str) // (and clef)
  {
    // returns:
    //		{ foundClef: true, foundKey: true }
    // Side effects:
    //		calls warn() when there is a syntax error
    //		sets these members of multilineVars:
    //			clef
    //			key
    //			style
    //
    // The format is:
    // K: [⟨key⟩] [⟨modifiers⟩*]
    // modifiers are any of the following in any order:
    //  [⟨clef⟩] [middle=⟨pitch⟩] [transpose=[-]⟨number⟩] [stafflines=⟨number⟩] [staffscale=⟨number⟩][style=⟨style⟩]
    // key is none|HP|Hp|⟨specified_key⟩
    // clef is [clef=] [⟨clef type⟩] [⟨line number⟩] [+8|-8]
    // specified_key is ⟨pitch⟩[#|b][mode(first three chars are significant)][accidentals*]
    if (str.length === 0) {
      // an empty K: field is the same as K:none
      str = 'none';
    }

    var tokens = tokenizer.tokenize(str, 0, str.length);
    var ret = {}; // Be sure that a key was passed in

    if (tokens.length === 0) {
      warn("Must pass in key signature.", str, 0);
      return ret;
    } // first the key


    switch (tokens[0].token) {
      case 'HP':
        parseDirective.addDirective("bagpipes");
        multilineVars.key = {
          root: "HP",
          accidentals: [],
          acc: "",
          mode: ""
        };
        ret.foundKey = true;
        tokens.shift();
        break;

      case 'Hp':
        parseDirective.addDirective("bagpipes");
        multilineVars.key = {
          root: "Hp",
          accidentals: [{
            acc: 'natural',
            note: 'g'
          }, {
            acc: 'sharp',
            note: 'f'
          }, {
            acc: 'sharp',
            note: 'c'
          }],
          acc: "",
          mode: ""
        };
        ret.foundKey = true;
        tokens.shift();
        break;

      case 'none':
        // we got the none key - that's the same as C to us
        multilineVars.key = {
          root: "none",
          accidentals: [],
          acc: "",
          mode: ""
        };
        ret.foundKey = true;
        tokens.shift();
        break;

      default:
        var retPitch = tokenizer.getKeyPitch(tokens[0].token);

        if (retPitch.len > 0) {
          ret.foundKey = true;
          var acc = "";
          var mode = ""; // The accidental and mode might be attached to the pitch, so we might want to just remove the first character.

          if (tokens[0].token.length > 1) tokens[0].token = tokens[0].token.substring(1);else tokens.shift();
          var key = retPitch.token; // We got a pitch to start with, so we might also have an accidental and a mode

          if (tokens.length > 0) {
            var retAcc = tokenizer.getSharpFlat(tokens[0].token);

            if (retAcc.len > 0) {
              if (tokens[0].token.length > 1) tokens[0].token = tokens[0].token.substring(1);else tokens.shift();
              key += retAcc.token;
              acc = retAcc.token;
            }

            if (tokens.length > 0) {
              var retMode = tokenizer.getMode(tokens[0].token);

              if (retMode.len > 0) {
                tokens.shift();
                key += retMode.token;
                mode = retMode.token;
              }
            } // Be sure that the key specified is in the list: not all keys are physically possible, like Cbmin.


            if (parseKeyVoice.standardKey(key, retPitch.token, acc, 0) === undefined) {
              warn("Unsupported key signature: " + key, str, 0);
              return ret;
            }
          } // We need to do a deep copy because we are going to modify it


          var oldKey = parseKeyVoice.deepCopyKey(multilineVars.key); //TODO-PER: HACK! To get the local transpose to work, the transposition is done for each line. This caused the global transposition variable to be factored in twice, so, instead of rewriting that right now, I'm just subtracting one of them here.

          var keyCompensate = multilineVars.globalTranspose ? -multilineVars.globalTranspose : 0;
          multilineVars.key = parseKeyVoice.deepCopyKey(parseKeyVoice.standardKey(key, retPitch.token, acc, keyCompensate));
          multilineVars.key.mode = mode;

          if (oldKey) {
            // Add natural in all places that the old key had an accidental.
            var kk;

            for (var k = 0; k < multilineVars.key.accidentals.length; k++) {
              for (kk = 0; kk < oldKey.accidentals.length; kk++) {
                if (oldKey.accidentals[kk].note && multilineVars.key.accidentals[k].note.toLowerCase() === oldKey.accidentals[kk].note.toLowerCase()) oldKey.accidentals[kk].note = null;
              }
            }

            for (kk = 0; kk < oldKey.accidentals.length; kk++) {
              if (oldKey.accidentals[kk].note) {
                if (!multilineVars.key.impliedNaturals) multilineVars.key.impliedNaturals = [];
                multilineVars.key.impliedNaturals.push({
                  acc: 'natural',
                  note: oldKey.accidentals[kk].note
                });
              }
            }
          }
        }

        break;
    } // There are two special cases of deprecated syntax. Ignore them if they occur


    if (tokens.length === 0) return ret;
    if (tokens[0].token === 'exp') tokens.shift();
    if (tokens.length === 0) return ret;
    if (tokens[0].token === 'oct') tokens.shift(); // now see if there are extra accidentals

    if (tokens.length === 0) return ret;
    var accs = tokenizer.getKeyAccidentals2(tokens);
    if (accs.warn) warn(accs.warn, str, 0); // If we have extra accidentals, first replace ones that are of the same pitch before adding them to the end.

    if (accs.accs) {
      if (!ret.foundKey) {
        // if there are only extra accidentals, make sure this is set.
        ret.foundKey = true;
        multilineVars.key = {
          root: "none",
          acc: "",
          mode: "",
          accidentals: []
        };
      }

      normalizeAccidentals(accs.accs);

      for (var i = 0; i < accs.accs.length; i++) {
        var found = false;

        for (var j = 0; j < multilineVars.key.accidentals.length && !found; j++) {
          if (multilineVars.key.accidentals[j].note === accs.accs[i].note) {
            found = true;

            if (multilineVars.key.accidentals[j].acc !== accs.accs[i].acc) {
              // If the accidental is different, then replace it. If it is the same, then the declaration was redundant, so just ignore it.
              multilineVars.key.accidentals[j].acc = accs.accs[i].acc;
              if (!multilineVars.key.explicitAccidentals) multilineVars.key.explicitAccidentals = [];
              multilineVars.key.explicitAccidentals.push(accs.accs[i]);
            }
          }
        }

        if (!found) {
          if (!multilineVars.key.explicitAccidentals) multilineVars.key.explicitAccidentals = [];
          multilineVars.key.explicitAccidentals.push(accs.accs[i]);
          multilineVars.key.accidentals.push(accs.accs[i]);

          if (multilineVars.key.impliedNaturals) {
            for (var kkk = 0; kkk < multilineVars.key.impliedNaturals.length; kkk++) {
              if (multilineVars.key.impliedNaturals[kkk].note === accs.accs[i].note) multilineVars.key.impliedNaturals.splice(kkk, 1);
            }
          }
        }
      }
    } // Now see if any optional parameters are present. They have the form "key=value", except that "clef=" is optional


    var token;

    while (tokens.length > 0) {
      switch (tokens[0].token) {
        case "m":
        case "middle":
          tokens.shift();

          if (tokens.length === 0) {
            warn("Expected = after middle", str, 0);
            return ret;
          }

          token = tokens.shift();

          if (token.token !== "=") {
            warn("Expected = after middle", str, token.start);
            break;
          }

          if (tokens.length === 0) {
            warn("Expected parameter after middle=", str, 0);
            return ret;
          }

          var pitch = tokenizer.getPitchFromTokens(tokens);
          if (pitch.warn) warn(pitch.warn, str, 0);
          if (pitch.position) multilineVars.clef.verticalPos = pitch.position - 6; // we get the position from the middle line, but want to offset it to the first ledger line.

          break;

        case "transpose":
          tokens.shift();

          if (tokens.length === 0) {
            warn("Expected = after transpose", str, 0);
            return ret;
          }

          token = tokens.shift();

          if (token.token !== "=") {
            warn("Expected = after transpose", str, token.start);
            break;
          }

          if (tokens.length === 0) {
            warn("Expected parameter after transpose=", str, 0);
            return ret;
          }

          if (tokens[0].type !== 'number') {
            warn("Expected number after transpose", str, tokens[0].start);
            break;
          }

          multilineVars.clef.transpose = tokens[0].intt;
          tokens.shift();
          break;

        case "stafflines":
          tokens.shift();

          if (tokens.length === 0) {
            warn("Expected = after stafflines", str, 0);
            return ret;
          }

          token = tokens.shift();

          if (token.token !== "=") {
            warn("Expected = after stafflines", str, token.start);
            break;
          }

          if (tokens.length === 0) {
            warn("Expected parameter after stafflines=", str, 0);
            return ret;
          }

          if (tokens[0].type !== 'number') {
            warn("Expected number after stafflines", str, tokens[0].start);
            break;
          }

          multilineVars.clef.stafflines = tokens[0].intt;
          tokens.shift();
          break;

        case "staffscale":
          tokens.shift();

          if (tokens.length === 0) {
            warn("Expected = after staffscale", str, 0);
            return ret;
          }

          token = tokens.shift();

          if (token.token !== "=") {
            warn("Expected = after staffscale", str, token.start);
            break;
          }

          if (tokens.length === 0) {
            warn("Expected parameter after staffscale=", str, 0);
            return ret;
          }

          if (tokens[0].type !== 'number') {
            warn("Expected number after staffscale", str, tokens[0].start);
            break;
          }

          multilineVars.clef.staffscale = tokens[0].floatt;
          tokens.shift();
          break;

        case "style":
          tokens.shift();

          if (tokens.length === 0) {
            warn("Expected = after style", str, 0);
            return ret;
          }

          token = tokens.shift();

          if (token.token !== "=") {
            warn("Expected = after style", str, token.start);
            break;
          }

          if (tokens.length === 0) {
            warn("Expected parameter after style=", str, 0);
            return ret;
          }

          switch (tokens[0].token) {
            case "normal":
            case "harmonic":
            case "rhythm":
            case "x":
            case "triangle":
              multilineVars.style = tokens[0].token;
              tokens.shift();
              break;

            default:
              warn("error parsing style element: " + tokens[0].token, str, tokens[0].start);
              break;
          }

          break;

        case "clef":
          tokens.shift();

          if (tokens.length === 0) {
            warn("Expected = after clef", str, 0);
            return ret;
          }

          token = tokens.shift();

          if (token.token !== "=") {
            warn("Expected = after clef", str, token.start);
            break;
          }

          if (tokens.length === 0) {
            warn("Expected parameter after clef=", str, 0);
            return ret;
          }

        //break; yes, we want to fall through. That allows "clef=" to be optional.

        case "treble":
        case "bass":
        case "alto":
        case "tenor":
        case "perc":
        case "swiss":
        case "none":
          // clef is [clef=] [⟨clef type⟩] [⟨line number⟩] [+8|-8]
          var clef = tokens.shift();

          switch (clef.token) {
            case 'treble':
            case 'tenor':
            case 'alto':
            case 'bass':
            case 'perc':
            case 'swiss':
            case 'none':
              break;

            case 'C':
              clef.token = 'alto';
              break;

            case 'F':
              clef.token = 'bass';
              break;

            case 'G':
              clef.token = 'treble';
              break;

            case 'c':
              clef.token = 'alto';
              break;

            case 'f':
              clef.token = 'bass';
              break;

            case 'g':
              clef.token = 'treble';
              break;

            default:
              warn("Expected clef name. Found " + clef.token, str, clef.start);
              break;
          }

          if (tokens.length > 0 && tokens[0].type === 'number') {
            clef.token += tokens[0].token;
            tokens.shift();
          }

          if (tokens.length > 1 && (tokens[0].token === '-' || tokens[0].token === '+' || tokens[0].token === '^' || tokens[0].token === '_') && tokens[1].token === '8') {
            clef.token += tokens[0].token + tokens[1].token;
            tokens.shift();
            tokens.shift();
          }

          multilineVars.clef = {
            type: clef.token,
            verticalPos: calcMiddle(clef.token, 0)
          };
          if (multilineVars.currentVoice && multilineVars.currentVoice.transpose !== undefined) multilineVars.clef.transpose = multilineVars.currentVoice.transpose;
          ret.foundClef = true;
          break;

        default:
          warn("Unknown parameter: " + tokens[0].token, str, tokens[0].start);
          tokens.shift();
      }
    }

    return ret;
  };

  var setCurrentVoice = function setCurrentVoice(id) {
    multilineVars.currentVoice = multilineVars.voices[id];
    tuneBuilder.setCurrentVoice(multilineVars.currentVoice.staffNum, multilineVars.currentVoice.index);
  };

  parseKeyVoice.parseVoice = function (line, i, e) {
    //First truncate the string to the first non-space character after V: through either the
    //end of the line or a % character. Then remove trailing spaces, too.
    var ret = tokenizer.getMeat(line, i, e);
    var start = ret.start;
    var end = ret.end; //The first thing on the line is the ID. It can be any non-space string and terminates at the
    //first space.

    var id = tokenizer.getToken(line, start, end);

    if (id.length === 0) {
      warn("Expected a voice id", line, start);
      return;
    }

    var isNew = false;

    if (multilineVars.voices[id] === undefined) {
      multilineVars.voices[id] = {};
      isNew = true;
      if (multilineVars.score_is_present) warn("Can't have an unknown V: id when the %score directive is present", line, start);
    }

    start += id.length;
    start += tokenizer.eatWhiteSpace(line, start);
    var staffInfo = {
      startStaff: isNew
    };

    var addNextTokenToStaffInfo = function addNextTokenToStaffInfo(name) {
      var attr = tokenizer.getVoiceToken(line, start, end);
      if (attr.warn !== undefined) warn("Expected value for " + name + " in voice: " + attr.warn, line, start);else if (attr.err !== undefined) warn("Expected value for " + name + " in voice: " + attr.err, line, start);else if (attr.token.length === 0 && line.charAt(start) !== '"') warn("Expected value for " + name + " in voice", line, start);else staffInfo[name] = attr.token;
      start += attr.len;
    };

    var addNextTokenToVoiceInfo = function addNextTokenToVoiceInfo(id, name, type) {
      var attr = tokenizer.getVoiceToken(line, start, end);
      if (attr.warn !== undefined) warn("Expected value for " + name + " in voice: " + attr.warn, line, start);else if (attr.err !== undefined) warn("Expected value for " + name + " in voice: " + attr.err, line, start);else if (attr.token.length === 0 && line.charAt(start) !== '"') warn("Expected value for " + name + " in voice", line, start);else {
        if (type === 'number') attr.token = parseFloat(attr.token);
        multilineVars.voices[id][name] = attr.token;
      }
      start += attr.len;
    };

    var getNextToken = function getNextToken(name, type) {
      var attr = tokenizer.getVoiceToken(line, start, end);
      if (attr.warn !== undefined) warn("Expected value for " + name + " in voice: " + attr.warn, line, start);else if (attr.err !== undefined) warn("Expected value for " + name + " in voice: " + attr.err, line, start);else if (attr.token.length === 0 && line.charAt(start) !== '"') warn("Expected value for " + name + " in voice", line, start);else {
        if (type === 'number') attr.token = parseFloat(attr.token);
        return attr.token;
      }
      start += attr.len;
    };

    var addNextNoteTokenToVoiceInfo = function addNextNoteTokenToVoiceInfo(id, name) {
      var noteToTransposition = {
        "_B": 2,
        "_E": 9,
        "_b": -10,
        "_e": -3
      };
      var attr = tokenizer.getVoiceToken(line, start, end);
      if (attr.warn !== undefined) warn("Expected one of (_B, _E, _b, _e) for " + name + " in voice: " + attr.warn, line, start);else if (attr.token.length === 0 && line.charAt(start) !== '"') warn("Expected one of (_B, _E, _b, _e) for " + name + " in voice", line, start);else {
        var t = noteToTransposition[attr.token];
        if (!t) warn("Expected one of (_B, _E, _b, _e) for " + name + " in voice", line, start);else multilineVars.voices[id][name] = t;
      }
      start += attr.len;
    }; //Then the following items can occur in any order:


    while (start < end) {
      var token = tokenizer.getVoiceToken(line, start, end);
      start += token.len;

      if (token.warn) {
        warn("Error parsing voice: " + token.warn, line, start);
      } else {
        var attr = null;

        switch (token.token) {
          case 'clef':
          case 'cl':
            addNextTokenToStaffInfo('clef'); // TODO-PER: check for a legal clef; do octavizing

            var oct = 0; //							for (var ii = 0; ii < staffInfo.clef.length; ii++) {
            //								if (staffInfo.clef[ii] === ',') oct -= 7;
            //								else if (staffInfo.clef[ii] === "'") oct += 7;
            //							}

            if (staffInfo.clef !== undefined) {
              staffInfo.clef = staffInfo.clef.replace(/[',]/g, ""); //'//comment for emacs formatting of regexp

              if (staffInfo.clef.indexOf('+16') !== -1) {
                oct += 14;
                staffInfo.clef = staffInfo.clef.replace('+16', '');
              }

              staffInfo.verticalPos = calcMiddle(staffInfo.clef, oct);
            }

            break;

          case 'treble':
          case 'bass':
          case 'tenor':
          case 'alto':
          case 'perc':
          case 'swiss':
          case 'none':
          case 'treble\'':
          case 'bass\'':
          case 'tenor\'':
          case 'alto\'':
          case 'none\'':
          case 'treble\'\'':
          case 'bass\'\'':
          case 'tenor\'\'':
          case 'alto\'\'':
          case 'none\'\'':
          case 'treble,':
          case 'bass,':
          case 'tenor,':
          case 'alto,':
          case 'none,':
          case 'treble,,':
          case 'bass,,':
          case 'tenor,,':
          case 'alto,,':
          case 'none,,':
            // TODO-PER: handle the octave indicators on the clef by changing the middle property
            var oct2 = 0; //							for (var iii = 0; iii < token.token.length; iii++) {
            //								if (token.token[iii] === ',') oct2 -= 7;
            //								else if (token.token[iii] === "'") oct2 += 7;
            //							}

            staffInfo.clef = token.token.replace(/[',]/g, ""); //'//comment for emacs formatting of regexp

            staffInfo.verticalPos = calcMiddle(staffInfo.clef, oct2);
            multilineVars.voices[id].clef = token.token;
            break;

          case 'staves':
          case 'stave':
          case 'stv':
            addNextTokenToStaffInfo('staves');
            break;

          case 'brace':
          case 'brc':
            addNextTokenToStaffInfo('brace');
            break;

          case 'bracket':
          case 'brk':
            addNextTokenToStaffInfo('bracket');
            break;

          case 'name':
          case 'nm':
            addNextTokenToStaffInfo('name');
            break;

          case 'subname':
          case 'sname':
          case 'snm':
            addNextTokenToStaffInfo('subname');
            break;

          case 'merge':
            staffInfo.startStaff = false;
            break;

          case 'stem':
          case 'stems':
            attr = tokenizer.getVoiceToken(line, start, end);
            if (attr.warn !== undefined) warn("Expected value for stems in voice: " + attr.warn, line, start);else if (attr.err !== undefined) warn("Expected value for stems in voice: " + attr.err, line, start);else if (attr.token === 'up' || attr.token === 'down') multilineVars.voices[id].stem = attr.token;else warn("Expected up or down for voice stem", line, start);
            start += attr.len;
            break;

          case 'up':
          case 'down':
            multilineVars.voices[id].stem = token.token;
            break;

          case 'middle':
          case 'm':
            addNextTokenToStaffInfo('verticalPos');
            staffInfo.verticalPos = parseMiddle(staffInfo.verticalPos).mid;
            break;

          case 'gchords':
          case 'gch':
            multilineVars.voices[id].suppressChords = true; // gchords can stand on its own, or it could be gchords=0.

            attr = tokenizer.getVoiceToken(line, start, end);
            if (attr.token === "0") start = start + attr.len;
            break;

          case 'space':
          case 'spc':
            addNextTokenToStaffInfo('spacing');
            break;

          case 'scale':
            addNextTokenToVoiceInfo(id, 'scale', 'number');
            break;

          case 'score':
            addNextNoteTokenToVoiceInfo(id, 'scoreTranspose');
            break;

          case 'transpose':
            addNextTokenToVoiceInfo(id, 'transpose', 'number');
            break;

          case 'stafflines':
            addNextTokenToVoiceInfo(id, 'stafflines', 'number');
            break;

          case 'staffscale':
            // TODO-PER: This is passed to the engraver, but the engraver ignores it.
            addNextTokenToVoiceInfo(id, 'staffscale', 'number');
            break;

          case 'octave':
            // TODO-PER: This is accepted, but not implemented, yet.
            addNextTokenToVoiceInfo(id, 'octave', 'number');
            break;

          case 'volume':
            // TODO-PER: This is accepted, but not implemented, yet.
            addNextTokenToVoiceInfo(id, 'volume', 'number');
            break;

          case 'cue':
            // TODO-PER: This is accepted, but not implemented, yet.
            var cue = getNextToken('cue', 'string');
            if (cue === 'on') multilineVars.voices[id].scale = 0.6;else multilineVars.voices[id].scale = 1;
            break;

          case "style":
            attr = tokenizer.getVoiceToken(line, start, end);
            if (attr.warn !== undefined) warn("Expected value for style in voice: " + attr.warn, line, start);else if (attr.err !== undefined) warn("Expected value for style in voice: " + attr.err, line, start);else if (attr.token === 'normal' || attr.token === 'harmonic' || attr.token === 'rhythm' || attr.token === 'x' || attr.token === 'triangle') multilineVars.voices[id].style = attr.token;else warn("Expected one of [normal, harmonic, rhythm, x, triangle] for voice style", line, start);
            start += attr.len;
            break;
          // default:
          // Use this to find V: usages that aren't handled.
          // 	console.log("parse voice", token, tune.metaText.title);
        }
      }

      start += tokenizer.eatWhiteSpace(line, start);
    } // now we've filled up staffInfo, figure out what to do with this voice
    // TODO-PER: It is unclear from the standard and the examples what to do with brace, bracket, and staves, so they are ignored for now.


    if (staffInfo.startStaff || multilineVars.staves.length === 0) {
      multilineVars.staves.push({
        index: multilineVars.staves.length,
        meter: multilineVars.origMeter
      });
      if (!multilineVars.score_is_present) multilineVars.staves[multilineVars.staves.length - 1].numVoices = 0;
    }

    if (multilineVars.voices[id].staffNum === undefined) {
      // store where to write this for quick access later.
      multilineVars.voices[id].staffNum = multilineVars.staves.length - 1;
      var vi = 0;

      for (var v in multilineVars.voices) {
        if (multilineVars.voices.hasOwnProperty(v)) {
          if (multilineVars.voices[v].staffNum === multilineVars.voices[id].staffNum) vi++;
        }
      }

      multilineVars.voices[id].index = vi - 1;
    }

    var s = multilineVars.staves[multilineVars.voices[id].staffNum];
    if (!multilineVars.score_is_present) s.numVoices++;
    if (staffInfo.clef) s.clef = {
      type: staffInfo.clef,
      verticalPos: staffInfo.verticalPos
    };
    if (staffInfo.spacing) s.spacing_below_offset = staffInfo.spacing;
    if (staffInfo.verticalPos) s.verticalPos = staffInfo.verticalPos;

    if (staffInfo.name) {
      if (s.name) s.name.push(staffInfo.name);else s.name = [staffInfo.name];
    }

    if (staffInfo.subname) {
      if (s.subname) s.subname.push(staffInfo.subname);else s.subname = [staffInfo.subname];
    }

    setCurrentVoice(id);
  };
})();

module.exports = parseKeyVoice;

/***/ }),

/***/ "./src/parse/abc_parse_music.js":
/*!**************************************!*\
  !*** ./src/parse/abc_parse_music.js ***!
  \**************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var parseCommon = __webpack_require__(/*! ./abc_common */ "./src/parse/abc_common.js");

var parseKeyVoice = __webpack_require__(/*! ./abc_parse_key_voice */ "./src/parse/abc_parse_key_voice.js");

var transpose = __webpack_require__(/*! ./abc_transpose */ "./src/parse/abc_transpose.js");

var tokenizer;
var warn;
var multilineVars;
var tune;
var tuneBuilder;
var header;

var MusicParser = function MusicParser(_tokenizer, _warn, _multilineVars, _tune, _tuneBuilder, _header) {
  tokenizer = _tokenizer;
  warn = _warn;
  multilineVars = _multilineVars;
  tune = _tune;
  tuneBuilder = _tuneBuilder;
  header = _header;
  this.lineContinuation = false;
}; //
// Parse line of music
//
// This is a stream of <(bar-marking|header|note-group)...> in any order, with optional spaces between each element
// core-note is <open-slur, accidental, pitch:required, octave, duration, close-slur&|tie> with no spaces within that
// chord is <open-bracket:required, core-note:required... close-bracket:required duration> with no spaces within that
// grace-notes is <open-brace:required, (open-slur|core-note:required|close-slur)..., close-brace:required> spaces are allowed
// note-group is <grace-notes, chord symbols&|decorations..., grace-notes, slur&|triplet, chord|core-note, end-slur|tie> spaces are allowed between items
// bar-marking is <ampersand> or <chord symbols&|decorations..., bar:required> spaces allowed
// header is <open-bracket:required, K|M|L|V:required, colon:required, field:required, close-bracket:required> spaces can occur between the colon, in the field, and before the close bracket
// header can also be the only thing on a line. This is true even if it is a continuation line. In this case the brackets are not required.
// a space is a back-tick, a space, or a tab. If it is a back-tick, then there is no end-beam.
// Line preprocessing: anything after a % is ignored (the double %% should have been taken care of before this)
// Then, all leading and trailing spaces are ignored.
// If there was a line continuation, the \n was replaced by a \r and the \ was replaced by a space. This allows the construct
// of having a header mid-line conceptually, but actually be at the start of the line. This is equivolent to putting the header in [ ].
// TODO-PER: How to handle ! for line break?
// TODO-PER: dots before bar, dots before slur
// TODO-PER: U: redefinable symbols.
// Ambiguous symbols:
// "[" can be the start of a chord, the start of a header element or part of a bar line.
// --- if it is immediately followed by "|", it is a bar line
// --- if it is immediately followed by K: L: M: V: it is a header (note: there are other headers mentioned in the standard, but I'm not sure how they would be used.)
// --- otherwise it is the beginning of a chord
// "(" can be the start of a slur or a triplet
// --- if it is followed by a number from 2-9, then it is a triplet
// --- otherwise it is a slur
// "]"
// --- if there is a chord open, then this is the close
// --- if it is after a [|, then it is an invisible bar line
// --- otherwise, it is par of a bar
// "." can be a bar modifier or a slur modifier, or a decoration
// --- if it comes immediately before a bar, it is a bar modifier
// --- if it comes immediately before a slur, it is a slur modifier
// --- otherwise it is a decoration for the next note.
// number:
// --- if it is after a bar, with no space, it is an ending marker
// --- if it is after a ( with no space, it is a triplet count
// --- if it is after a pitch or octave or slash, then it is a duration
// Unambiguous symbols (except inside quoted strings):
// vertical-bar, colon: part of a bar
// ABCDEFGabcdefg: pitch
// xyzZ: rest
// comma, prime: octave
// close-paren: end-slur
// hyphen: tie
// tilde, v, u, bang, plus, THLMPSO: decoration
// carat, underscore, equal: accidental
// ampersand: time reset
// open-curly, close-curly: grace notes
// double-quote: chord symbol
// less-than, greater-than, slash: duration
// back-tick, space, tab: space


var nonDecorations = "ABCDEFGabcdefgxyzZ[]|^_{"; // use this to prescreen so we don't have to look for a decoration at every note.

var isInTie = function isInTie(multilineVars, overlayLevel, el) {
  if (multilineVars.inTie[overlayLevel] === undefined) return false; // If this is single voice music then the voice index isn't set, so we use the first voice.

  var voiceIndex = multilineVars.currentVoice ? multilineVars.currentVoice.index : 0;

  if (multilineVars.inTie[overlayLevel][voiceIndex]) {
    if (el.pitches !== undefined || el.rest.type !== 'spacer') return true;
  }

  return false;
};

var el = {};

MusicParser.prototype.parseMusic = function (line) {
  header.resolveTempo(); //multilineVars.havent_set_length = false;	// To late to set this now.

  multilineVars.is_in_header = false; // We should have gotten a key header by now, but just in case, this is definitely out of the header.

  var i = 0;
  var startOfLine = multilineVars.iChar; // see if there is nothing but a comment on this line. If so, just ignore it. A full line comment is optional white space followed by %

  while (tokenizer.isWhiteSpace(line.charAt(i)) && i < line.length) {
    i++;
  }

  if (i === line.length || line.charAt(i) === '%') return; // Start with the standard staff, clef and key symbols on each line

  var delayStartNewLine = multilineVars.start_new_line;
  if (multilineVars.continueall === undefined) multilineVars.start_new_line = true;else multilineVars.start_new_line = false;
  var tripletNotesLeft = 0; // See if the line starts with a header field

  var retHeader = header.letter_to_body_header(line, i);

  if (retHeader[0] > 0) {
    i += retHeader[0]; // fixes bug on this: c[V:2]d

    if (retHeader[1] === 'V') this.startNewLine(); // delayStartNewLine = true;
    // TODO-PER: Handle inline headers
  }

  var overlayLevel = 0;

  while (i < line.length) {
    var startI = i;
    if (line.charAt(i) === '%') break;
    var retInlineHeader = header.letter_to_inline_header(line, i, delayStartNewLine);

    if (retInlineHeader[0] > 0) {
      i += retInlineHeader[0];
      if (retInlineHeader[1] === 'V') delayStartNewLine = true; // fixes bug on this: c[V:2]d
      // TODO-PER: Handle inline headers
      //multilineVars.start_new_line = false;
    } else {
      // Wait until here to actually start the line because we know we're past the inline statements.
      if (!tuneBuilder.hasBeginMusic() || delayStartNewLine && !this.lineContinuation) {
        this.startNewLine();
        delayStartNewLine = false;
      } // We need to decide if the following characters are a bar-marking or a note-group.
      // Unfortunately, that is ambiguous. Both can contain chord symbols and decorations.
      // If there is a grace note either before or after the chord symbols and decorations, then it is definitely a note-group.
      // If there is a bar marker, it is definitely a bar-marking.
      // If there is either a core-note or chord, it is definitely a note-group.
      // So, loop while we find grace-notes, chords-symbols, or decorations. [It is an error to have more than one grace-note group in a row; the others can be multiple]
      // Then, if there is a grace-note, we know where to go.
      // Else see if we have a chord, core-note, slur, triplet, or bar.


      var ret;

      while (1) {
        ret = tokenizer.eatWhiteSpace(line, i);

        if (ret > 0) {
          i += ret;
        }

        if (i > 0 && line.charAt(i - 1) === '\x12') {
          // there is one case where a line continuation isn't the same as being on the same line, and that is if the next character after it is a header.
          ret = header.letter_to_body_header(line, i);

          if (ret[0] > 0) {
            if (ret[1] === 'V') this.startNewLine(); // fixes bug on this: c\\nV:2]\\nd
            // TODO: insert header here

            i = ret[0];
            multilineVars.start_new_line = false;
          }
        } // gather all the grace notes, chord symbols and decorations


        ret = letter_to_spacer(line, i);

        if (ret[0] > 0) {
          i += ret[0];
        }

        ret = letter_to_chord(line, i);

        if (ret[0] > 0) {
          // There could be more than one chord here if they have different positions.
          // If two chords have the same position, then connect them with newline.
          if (!el.chord) el.chord = [];
          var chordName = tokenizer.translateString(ret[1]);
          chordName = chordName.replace(/;/g, "\n");
          var addedChord = false;

          for (var ci = 0; ci < el.chord.length; ci++) {
            if (el.chord[ci].position === ret[2]) {
              addedChord = true;
              el.chord[ci].name += "\n" + chordName;
            }
          }

          if (addedChord === false) {
            if (ret[2] === null && ret[3]) el.chord.push({
              name: chordName,
              rel_position: ret[3]
            });else el.chord.push({
              name: chordName,
              position: ret[2]
            });
          }

          i += ret[0];
          var ii = tokenizer.skipWhiteSpace(line.substring(i));
          if (ii > 0) el.force_end_beam_last = true;
          i += ii;
        } else {
          if (nonDecorations.indexOf(line.charAt(i)) === -1) ret = letter_to_accent(line, i);else ret = [0];

          if (ret[0] > 0) {
            if (ret[1] === null) {
              if (i + 1 < line.length) this.startNewLine(); // There was a ! in the middle of the line. Start a new line if there is anything after it.
            } else if (ret[1].length > 0) {
              if (ret[1].indexOf("style=") === 0) {
                el.style = ret[1].substr(6);
              } else {
                if (el.decoration === undefined) el.decoration = [];
                if (ret[1] === 'beambr1') el.beambr = 1;else if (ret[1] === "beambr2") el.beambr = 2;else el.decoration.push(ret[1]);
              }
            }

            i += ret[0];
          } else {
            ret = letter_to_grace(line, i); // TODO-PER: Be sure there aren't already grace notes defined. That is an error.

            if (ret[0] > 0) {
              el.gracenotes = ret[1];
              i += ret[0];
            } else break;
          }
        }
      }

      ret = letter_to_bar(line, i);

      if (ret[0] > 0) {
        // This is definitely a bar
        overlayLevel = 0;

        if (el.gracenotes !== undefined) {
          // Attach the grace note to an invisible note
          el.rest = {
            type: 'spacer'
          };
          el.duration = 0.125; // TODO-PER: I don't think the duration of this matters much, but figure out if it does.

          multilineVars.addFormattingOptions(el, tune.formatting, 'note');
          tuneBuilder.appendElement('note', startOfLine + i, startOfLine + i + ret[0], el);
          multilineVars.measureNotEmpty = true;
          el = {};
        }

        var bar = {
          type: ret[1]
        };
        if (bar.type.length === 0) warn("Unknown bar type", line, i);else {
          if (multilineVars.inEnding && bar.type !== 'bar_thin') {
            bar.endEnding = true;
            multilineVars.inEnding = false;
          }

          if (ret[2]) {
            bar.startEnding = ret[2];
            if (multilineVars.inEnding) bar.endEnding = true;
            multilineVars.inEnding = true;

            if (ret[1] === "bar_right_repeat") {
              // restore the tie and slur state from the start repeat
              multilineVars.restoreStartEndingHoldOvers();
            } else {
              // save inTie, inTieChord
              multilineVars.duplicateStartEndingHoldOvers();
            }
          }

          if (el.decoration !== undefined) bar.decoration = el.decoration;
          if (el.chord !== undefined) bar.chord = el.chord;
          if (bar.startEnding && multilineVars.barFirstEndingNum === undefined) multilineVars.barFirstEndingNum = multilineVars.currBarNumber;else if (bar.startEnding && bar.endEnding && multilineVars.barFirstEndingNum) multilineVars.currBarNumber = multilineVars.barFirstEndingNum;else if (bar.endEnding) multilineVars.barFirstEndingNum = undefined;

          if (bar.type !== 'bar_invisible' && multilineVars.measureNotEmpty) {
            var isFirstVoice = multilineVars.currentVoice === undefined || multilineVars.currentVoice.staffNum === 0 && multilineVars.currentVoice.index === 0;

            if (isFirstVoice) {
              multilineVars.currBarNumber++;
              if (multilineVars.barNumbers && multilineVars.currBarNumber % multilineVars.barNumbers === 0) bar.barNumber = multilineVars.currBarNumber;
            }
          }

          multilineVars.addFormattingOptions(el, tune.formatting, 'bar');
          tuneBuilder.appendElement('bar', startOfLine + i, startOfLine + i + ret[0], bar);
          multilineVars.measureNotEmpty = false;
          el = {};
        }
        i += ret[0];
      } else if (line[i] === '&') {
        // backtrack to beginning of measure
        ret = letter_to_overlay(line, i);

        if (ret[0] > 0) {
          tuneBuilder.appendElement('overlay', startOfLine, startOfLine + 1, {});
          i += 1;
          overlayLevel++;
        }
      } else {
        // This is definitely a note group
        //
        // Look for as many open slurs and triplets as there are. (Note: only the first triplet is valid.)
        ret = letter_to_open_slurs_and_triplets(line, i);

        if (ret.consumed > 0) {
          if (ret.startSlur !== undefined) el.startSlur = ret.startSlur;
          if (ret.dottedSlur) el.dottedSlur = true;

          if (ret.triplet !== undefined) {
            if (tripletNotesLeft > 0) warn("Can't nest triplets", line, i);else {
              el.startTriplet = ret.triplet;
              el.tripletMultiplier = ret.tripletQ / ret.triplet;
              tripletNotesLeft = ret.num_notes === undefined ? ret.triplet : ret.num_notes;
            }
          }

          i += ret.consumed;
        } // handle chords.


        if (line.charAt(i) === '[') {
          var chordStartChar = i;
          i++;
          var chordDuration = null;
          var rememberEndBeam = false;
          var done = false;

          while (!done) {
            var accent = letter_to_accent(line, i);

            if (accent[0] > 0) {
              i += accent[0];
            }

            var chordNote = getCoreNote(line, i, {}, false);

            if (chordNote !== null && chordNote.pitch !== undefined) {
              if (accent[0] > 0) {
                // If we found a decoration above, it modifies the entire chord. "style" is handled below.
                if (accent[1].indexOf("style=") !== 0) {
                  if (el.decoration === undefined) el.decoration = [];
                  el.decoration.push(accent[1]);
                }
              }

              if (chordNote.end_beam) {
                el.end_beam = true;
                delete chordNote.end_beam;
              }

              if (el.pitches === undefined) {
                el.duration = chordNote.duration;
                el.pitches = [chordNote];
              } else // Just ignore the note lengths of all but the first note. The standard isn't clear here, but this seems less confusing.
                el.pitches.push(chordNote);

              delete chordNote.duration;

              if (accent[0] > 0) {
                // If we found a style above, it modifies the individual pitch, not the entire chord.
                if (accent[1].indexOf("style=") === 0) {
                  el.pitches[el.pitches.length - 1].style = accent[1].substr(6);
                }
              }

              if (multilineVars.inTieChord[el.pitches.length]) {
                chordNote.endTie = true;
                multilineVars.inTieChord[el.pitches.length] = undefined;
              }

              if (chordNote.startTie) multilineVars.inTieChord[el.pitches.length] = true;
              i = chordNote.endChar;
              delete chordNote.endChar;
            } else if (line.charAt(i) === ' ') {
              // Spaces are not allowed in chords, but we can recover from it by ignoring it.
              warn("Spaces are not allowed in chords", line, i);
              i++;
            } else {
              if (i < line.length && line.charAt(i) === ']') {
                // consume the close bracket
                i++;

                if (multilineVars.next_note_duration !== 0) {
                  el.duration = el.duration * multilineVars.next_note_duration;
                  multilineVars.next_note_duration = 0;
                }

                if (isInTie(multilineVars, overlayLevel, el)) {
                  parseCommon.each(el.pitches, function (pitch) {
                    pitch.endTie = true;
                  });
                  setIsInTie(multilineVars, overlayLevel, false);
                }

                if (tripletNotesLeft > 0 && !(el.rest && el.rest.type === "spacer")) {
                  tripletNotesLeft--;

                  if (tripletNotesLeft === 0) {
                    el.endTriplet = true;
                  }
                }

                var postChordDone = false;

                while (i < line.length && !postChordDone) {
                  switch (line.charAt(i)) {
                    case ' ':
                    case '\t':
                      addEndBeam(el);
                      break;

                    case ')':
                      if (el.endSlur === undefined) el.endSlur = 1;else el.endSlur++;
                      break;

                    case '-':
                      parseCommon.each(el.pitches, function (pitch) {
                        pitch.startTie = {};
                      });
                      setIsInTie(multilineVars, overlayLevel, true);
                      break;

                    case '>':
                    case '<':
                      var br2 = getBrokenRhythm(line, i);
                      i += br2[0] - 1; // index gets incremented below, so we'll let that happen

                      multilineVars.next_note_duration = br2[2];
                      if (chordDuration) chordDuration = chordDuration * br2[1];else chordDuration = br2[1];
                      break;

                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                    case '/':
                      var fraction = tokenizer.getFraction(line, i);
                      chordDuration = fraction.value;
                      i = fraction.index;
                      if (line.charAt(i) === ' ') rememberEndBeam = true;
                      if (line.charAt(i) === '-' || line.charAt(i) === ')' || line.charAt(i) === ' ' || line.charAt(i) === '<' || line.charAt(i) === '>') i--; // Subtracting one because one is automatically added below
                      else postChordDone = true;
                      break;

                    default:
                      postChordDone = true;
                      break;
                  }

                  if (!postChordDone) {
                    i++;
                  }
                }
              } else warn("Expected ']' to end the chords", line, i);

              if (el.pitches !== undefined) {
                if (chordDuration !== null) {
                  el.duration = el.duration * chordDuration;
                  if (rememberEndBeam) addEndBeam(el);
                }

                multilineVars.addFormattingOptions(el, tune.formatting, 'note');
                tuneBuilder.appendElement('note', startOfLine + startI, startOfLine + i, el);
                multilineVars.measureNotEmpty = true;
                el = {};
              }

              done = true;
            }
          }
        } else {
          // Single pitch
          var el2 = {};
          var core = getCoreNote(line, i, el2, true);
          if (el2.endTie !== undefined) setIsInTie(multilineVars, overlayLevel, true);

          if (core !== null) {
            if (core.pitch !== undefined) {
              el.pitches = [{}]; // TODO-PER: straighten this out so there is not so much copying: getCoreNote shouldn't change e'

              if (core.accidental !== undefined) el.pitches[0].accidental = core.accidental;
              el.pitches[0].pitch = core.pitch;
              if (core.midipitch || core.midipitch === 0) el.pitches[0].midipitch = core.midipitch;
              if (core.endSlur !== undefined) el.pitches[0].endSlur = core.endSlur;
              if (core.endTie !== undefined) el.pitches[0].endTie = core.endTie;
              if (core.startSlur !== undefined) el.pitches[0].startSlur = core.startSlur;
              if (el.startSlur !== undefined) el.pitches[0].startSlur = el.startSlur;
              if (el.dottedSlur !== undefined) el.pitches[0].dottedSlur = true;
              if (core.startTie !== undefined) el.pitches[0].startTie = core.startTie;
              if (el.startTie !== undefined) el.pitches[0].startTie = el.startTie;
            } else {
              el.rest = core.rest;
              if (core.endSlur !== undefined) el.endSlur = core.endSlur;
              if (core.endTie !== undefined) el.rest.endTie = core.endTie;
              if (core.startSlur !== undefined) el.startSlur = core.startSlur;
              if (core.startTie !== undefined) el.rest.startTie = core.startTie;
              if (el.startTie !== undefined) el.rest.startTie = el.startTie;
            }

            if (core.chord !== undefined) el.chord = core.chord;
            if (core.duration !== undefined) el.duration = core.duration;
            if (core.decoration !== undefined) el.decoration = core.decoration;
            if (core.graceNotes !== undefined) el.graceNotes = core.graceNotes;
            delete el.startSlur;
            delete el.dottedSlur;

            if (isInTie(multilineVars, overlayLevel, el)) {
              if (el.pitches !== undefined) {
                el.pitches[0].endTie = true;
              } else if (el.rest.type !== 'spacer') {
                el.rest.endTie = true;
              }

              setIsInTie(multilineVars, overlayLevel, false);
            }

            if (core.startTie || el.startTie) setIsInTie(multilineVars, overlayLevel, true);
            i = core.endChar;

            if (tripletNotesLeft > 0 && !(core.rest && core.rest.type === "spacer")) {
              tripletNotesLeft--;

              if (tripletNotesLeft === 0) {
                el.endTriplet = true;
              }
            }

            if (core.end_beam) addEndBeam(el); // If there is a whole rest, then it should be the duration of the measure, not it's own duration. We need to special case it.
            // If the time signature length is greater than 4/4, though, then a whole rest has no special treatment.

            if (el.rest && el.rest.type === 'rest' && el.duration === 1 && durationOfMeasure(multilineVars) <= 1) {
              el.rest.type = 'whole';
              el.duration = durationOfMeasure(multilineVars);
            } // Create a warning if this is not a displayable duration.
            // The first item on a line is a regular note value, each item after that represents a dot placed after the previous note.
            // Only durations less than a whole note are tested because whole note durations have some tricky rules.


            var durations = [0.5, 0.75, 0.875, 0.9375, 0.96875, 0.984375, 0.25, 0.375, 0.4375, 0.46875, 0.484375, 0.4921875, 0.125, 0.1875, 0.21875, 0.234375, 0.2421875, 0.24609375, 0.0625, 0.09375, 0.109375, 0.1171875, 0.12109375, 0.123046875, 0.03125, 0.046875, 0.0546875, 0.05859375, 0.060546875, 0.0615234375, 0.015625, 0.0234375, 0.02734375, 0.029296875, 0.0302734375, 0.03076171875];

            if (el.duration < 1 && durations.indexOf(el.duration) === -1 && el.duration !== 0) {
              if (!el.rest || el.rest.type !== 'spacer') warn("Duration not representable: " + line.substring(startI, i), line, i);
            }

            multilineVars.addFormattingOptions(el, tune.formatting, 'note');
            tuneBuilder.appendElement('note', startOfLine + startI, startOfLine + i, el);
            multilineVars.measureNotEmpty = true;
            el = {};
          }
        }

        if (i === startI) {
          // don't know what this is, so ignore it.
          if (line.charAt(i) !== ' ' && line.charAt(i) !== '`') warn("Unknown character ignored", line, i);
          i++;
        }
      }
    }
  }

  this.lineContinuation = line.indexOf('\x12') >= 0 || retHeader[0] > 0;

  if (!this.lineContinuation) {
    el = {};
  }
};

var setIsInTie = function setIsInTie(multilineVars, overlayLevel, value) {
  // If this is single voice music then the voice index isn't set, so we use the first voice.
  var voiceIndex = multilineVars.currentVoice ? multilineVars.currentVoice.index : 0;
  if (multilineVars.inTie[overlayLevel] === undefined) multilineVars.inTie[overlayLevel] = [];
  multilineVars.inTie[overlayLevel][voiceIndex] = value;
};

var letter_to_chord = function letter_to_chord(line, i) {
  if (line.charAt(i) === '"') {
    var chord = tokenizer.getBrackettedSubstring(line, i, 5);
    if (!chord[2]) warn("Missing the closing quote while parsing the chord symbol", line, i); // If it starts with ^, then the chord appears above.
    // If it starts with _ then the chord appears below.
    // (note that the 2.0 draft standard defines them as not chords, but annotations and also defines @.)

    if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '^') {
      chord[1] = chord[1].substring(1);
      chord[2] = 'above';
    } else if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '_') {
      chord[1] = chord[1].substring(1);
      chord[2] = 'below';
    } else if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '<') {
      chord[1] = chord[1].substring(1);
      chord[2] = 'left';
    } else if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '>') {
      chord[1] = chord[1].substring(1);
      chord[2] = 'right';
    } else if (chord[0] > 0 && chord[1].length > 0 && chord[1].charAt(0) === '@') {
      // @-15,5.7
      chord[1] = chord[1].substring(1);
      var x = tokenizer.getFloat(chord[1]);
      if (x.digits === 0) warn("Missing first position in absolutely positioned annotation.", line, i);
      chord[1] = chord[1].substring(x.digits);
      if (chord[1][0] !== ',') warn("Missing comma absolutely positioned annotation.", line, i);
      chord[1] = chord[1].substring(1);
      var y = tokenizer.getFloat(chord[1]);
      if (y.digits === 0) warn("Missing second position in absolutely positioned annotation.", line, i);
      chord[1] = chord[1].substring(y.digits);
      var ws = tokenizer.skipWhiteSpace(chord[1]);
      chord[1] = chord[1].substring(ws);
      chord[2] = null;
      chord[3] = {
        x: x.value,
        y: y.value
      };
    } else {
      if (multilineVars.freegchord !== true) {
        chord[1] = chord[1].replace(/([ABCDEFG0-9])b/g, "$1♭");
        chord[1] = chord[1].replace(/([ABCDEFG0-9])#/g, "$1♯");
        chord[1] = chord[1].replace(/^([ABCDEFG])([♯♭]?)o([^A-Za-z])/g, "$1$2°$3");
        chord[1] = chord[1].replace(/^([ABCDEFG])([♯♭]?)o$/g, "$1$2°");
        chord[1] = chord[1].replace(/^([ABCDEFG])([♯♭]?)0([^A-Za-z])/g, "$1$2ø$3");
        chord[1] = chord[1].replace(/^([ABCDEFG])([♯♭]?)\^([^A-Za-z])/g, "$1$2∆$3");
      }

      chord[2] = 'default';
      chord[1] = transpose.chordName(multilineVars, chord[1]);
    }

    return chord;
  }

  return [0, ""];
};

var letter_to_grace = function letter_to_grace(line, i) {
  // Grace notes are an array of: startslur, note, endslur, space; where note is accidental, pitch, duration
  if (line.charAt(i) === '{') {
    // fetch the gracenotes string and consume that into the array
    var gra = tokenizer.getBrackettedSubstring(line, i, 1, '}');
    if (!gra[2]) warn("Missing the closing '}' while parsing grace note", line, i); // If there is a slur after the grace construction, then move it to the last note inside the grace construction

    if (line[i + gra[0]] === ')') {
      gra[0]++;
      gra[1] += ')';
    }

    var gracenotes = [];
    var ii = 0;
    var inTie = false;

    while (ii < gra[1].length) {
      var acciaccatura = false;

      if (gra[1].charAt(ii) === '/') {
        acciaccatura = true;
        ii++;
      }

      var note = getCoreNote(gra[1], ii, {}, false);

      if (note !== null) {
        // The grace note durations should not be affected by the default length: they should be based on 1/16, so if that isn't the default, then multiply here.
        note.duration = note.duration / (multilineVars.default_length * 8);
        if (acciaccatura) note.acciaccatura = true;
        gracenotes.push(note);

        if (inTie) {
          note.endTie = true;
          inTie = false;
        }

        if (note.startTie) inTie = true;
        ii = note.endChar;
        delete note.endChar;
      } else {
        // We shouldn't get anything but notes or a space here, so report an error
        if (gra[1].charAt(ii) === ' ') {
          if (gracenotes.length > 0) gracenotes[gracenotes.length - 1].end_beam = true;
        } else warn("Unknown character '" + gra[1].charAt(ii) + "' while parsing grace note", line, i);

        ii++;
      }
    }

    if (gracenotes.length) return [gra[0], gracenotes];
  }

  return [0];
};

function letter_to_overlay(line, i) {
  if (line.charAt(i) === '&') {
    var start = i;

    while (line.charAt(i) && line.charAt(i) !== ':' && line.charAt(i) !== '|') {
      i++;
    }

    return [i - start, line.substring(start + 1, i)];
  }

  return [0];
}

function durationOfMeasure(multilineVars) {
  // TODO-PER: This could be more complicated if one of the unusual measures is used.
  var meter = multilineVars.origMeter;
  if (!meter || meter.type !== 'specified') return 1;
  if (!meter.value || meter.value.length === 0) return 1;
  return parseInt(meter.value[0].num, 10) / parseInt(meter.value[0].den, 10);
}

var legalAccents = ["trill", "lowermordent", "uppermordent", "mordent", "pralltriller", "accent", "fermata", "invertedfermata", "tenuto", "0", "1", "2", "3", "4", "5", "+", "wedge", "open", "thumb", "snap", "turn", "roll", "breath", "shortphrase", "mediumphrase", "longphrase", "segno", "coda", "D.S.", "D.C.", "fine", "beambr1", "beambr2", "slide", "marcato", "upbow", "downbow", "/", "//", "///", "////", "trem1", "trem2", "trem3", "trem4", "turnx", "invertedturn", "invertedturnx", "trill(", "trill)", "arpeggio", "xstem", "mark", "umarcato", "style=normal", "style=harmonic", "style=rhythm", "style=x", "style=triangle"];
var volumeDecorations = ["p", "pp", "f", "ff", "mf", "mp", "ppp", "pppp", "fff", "ffff", "sfz"];
var dynamicDecorations = ["crescendo(", "crescendo)", "diminuendo(", "diminuendo)"];
var accentPseudonyms = [["<", "accent"], [">", "accent"], ["tr", "trill"], ["plus", "+"], ["emphasis", "accent"], ["^", "umarcato"], ["marcato", "umarcato"]];
var accentDynamicPseudonyms = [["<(", "crescendo("], ["<)", "crescendo)"], [">(", "diminuendo("], [">)", "diminuendo)"]];

var letter_to_accent = function letter_to_accent(line, i) {
  var macro = multilineVars.macros[line.charAt(i)];

  if (macro !== undefined) {
    if (macro.charAt(0) === '!' || macro.charAt(0) === '+') macro = macro.substring(1);
    if (macro.charAt(macro.length - 1) === '!' || macro.charAt(macro.length - 1) === '+') macro = macro.substring(0, macro.length - 1);
    if (parseCommon.detect(legalAccents, function (acc) {
      return macro === acc;
    })) return [1, macro];else if (parseCommon.detect(volumeDecorations, function (acc) {
      return macro === acc;
    })) {
      if (multilineVars.volumePosition === 'hidden') macro = "";
      return [1, macro];
    } else if (parseCommon.detect(dynamicDecorations, function (acc) {
      if (multilineVars.dynamicPosition === 'hidden') macro = "";
      return macro === acc;
    })) {
      return [1, macro];
    } else {
      if (!parseCommon.detect(multilineVars.ignoredDecorations, function (dec) {
        return macro === dec;
      })) warn("Unknown macro: " + macro, line, i);
      return [1, ''];
    }
  }

  switch (line.charAt(i)) {
    case '.':
      if (line[i + 1] === '(' || line[i + 1] === '-') // a dot then open paren is a dotted slur; likewise dot dash is dotted tie.
        break;
      return [1, 'staccato'];

    case 'u':
      return [1, 'upbow'];

    case 'v':
      return [1, 'downbow'];

    case '~':
      return [1, 'irishroll'];

    case '!':
    case '+':
      var ret = tokenizer.getBrackettedSubstring(line, i, 5); // Be sure that the accent is recognizable.

      if (ret[1].length > 1 && (ret[1].charAt(0) === '^' || ret[1].charAt(0) === '_')) ret[1] = ret[1].substring(1); // TODO-PER: The test files have indicators forcing the ornament to the top or bottom, but that isn't in the standard. We'll just ignore them.

      if (parseCommon.detect(legalAccents, function (acc) {
        return ret[1] === acc;
      })) return ret;

      if (parseCommon.detect(volumeDecorations, function (acc) {
        return ret[1] === acc;
      })) {
        if (multilineVars.volumePosition === 'hidden') ret[1] = '';
        return ret;
      }

      if (parseCommon.detect(dynamicDecorations, function (acc) {
        return ret[1] === acc;
      })) {
        if (multilineVars.dynamicPosition === 'hidden') ret[1] = '';
        return ret;
      }

      if (parseCommon.detect(accentPseudonyms, function (acc) {
        if (ret[1] === acc[0]) {
          ret[1] = acc[1];
          return true;
        } else return false;
      })) return ret;

      if (parseCommon.detect(accentDynamicPseudonyms, function (acc) {
        if (ret[1] === acc[0]) {
          ret[1] = acc[1];
          return true;
        } else return false;
      })) {
        if (multilineVars.dynamicPosition === 'hidden') ret[1] = '';
        return ret;
      } // We didn't find the accent in the list, so consume the space, but don't return an accent.
      // Although it is possible that ! was used as a line break, so accept that.


      if (line.charAt(i) === '!' && (ret[0] === 1 || line.charAt(i + ret[0] - 1) !== '!')) return [1, null];
      warn("Unknown decoration: " + ret[1], line, i);
      ret[1] = "";
      return ret;

    case 'H':
      return [1, 'fermata'];

    case 'J':
      return [1, 'slide'];

    case 'L':
      return [1, 'accent'];

    case 'M':
      return [1, 'mordent'];

    case 'O':
      return [1, 'coda'];

    case 'P':
      return [1, 'pralltriller'];

    case 'R':
      return [1, 'roll'];

    case 'S':
      return [1, 'segno'];

    case 'T':
      return [1, 'trill'];
  }

  return [0, 0];
};

var letter_to_spacer = function letter_to_spacer(line, i) {
  var start = i;

  while (tokenizer.isWhiteSpace(line.charAt(i))) {
    i++;
  }

  return [i - start];
}; // returns the class of the bar line
// the number of the repeat
// and the number of characters used up
// if 0 is returned, then the next element was not a bar line


var letter_to_bar = function letter_to_bar(line, curr_pos) {
  var ret = tokenizer.getBarLine(line, curr_pos);
  if (ret.len === 0) return [0, ""];

  if (ret.warn) {
    warn(ret.warn, line, curr_pos);
    return [ret.len, ""];
  } // Now see if this is a repeated ending
  // A repeated ending is all of the characters 1,2,3,4,5,6,7,8,9,0,-, and comma
  // It can also optionally start with '[', which is ignored.
  // Also, it can have white space before the '['.


  for (var ws = 0; ws < line.length; ws++) {
    if (line.charAt(curr_pos + ret.len + ws) !== ' ') break;
  }

  var orig_bar_len = ret.len;

  if (line.charAt(curr_pos + ret.len + ws) === '[') {
    ret.len += ws + 1;
  } // It can also be a quoted string. It is unclear whether that construct requires '[', but it seems like it would. otherwise it would be confused with a regular chord.


  if (line.charAt(curr_pos + ret.len) === '"' && line.charAt(curr_pos + ret.len - 1) === '[') {
    var ending = tokenizer.getBrackettedSubstring(line, curr_pos + ret.len, 5);
    return [ret.len + ending[0], ret.token, ending[1]];
  }

  var retRep = tokenizer.getTokenOf(line.substring(curr_pos + ret.len), "1234567890-,");
  if (retRep.len === 0 || retRep.token[0] === '-') return [orig_bar_len, ret.token];
  return [ret.len + retRep.len, ret.token, retRep.token];
};

var tripletQ = {
  2: 3,
  3: 2,
  4: 3,
  5: 2,
  // TODO-PER: not handling 6/8 rhythm yet
  6: 2,
  7: 2,
  // TODO-PER: not handling 6/8 rhythm yet
  8: 3,
  9: 2 // TODO-PER: not handling 6/8 rhythm yet

};

var letter_to_open_slurs_and_triplets = function letter_to_open_slurs_and_triplets(line, i) {
  // consume spaces, and look for all the open parens. If there is a number after the open paren,
  // that is a triplet. Otherwise that is a slur. Collect all the slurs and the first triplet.
  var ret = {};
  var start = i;

  if (line[i] === '.' && line[i + 1] === '(') {
    ret.dottedSlur = true;
    i++;
  }

  while (line.charAt(i) === '(' || tokenizer.isWhiteSpace(line.charAt(i))) {
    if (line.charAt(i) === '(') {
      if (i + 1 < line.length && line.charAt(i + 1) >= '2' && line.charAt(i + 1) <= '9') {
        if (ret.triplet !== undefined) warn("Can't nest triplets", line, i);else {
          ret.triplet = line.charAt(i + 1) - '0';
          ret.tripletQ = tripletQ[ret.triplet];
          ret.num_notes = ret.triplet;

          if (i + 2 < line.length && line.charAt(i + 2) === ':') {
            // We are expecting "(p:q:r" or "(p:q" or "(p::r"
            // That is: "put p notes into the time of q for the next r notes"
            // if r is missing, then it is equal to p.
            // if q is missing, it is determined from this table:
            // (2 notes in the time of 3
            // (3 notes in the time of 2
            // (4 notes in the time of 3
            // (5 notes in the time of n | if time sig is (6/8, 9/8, 12/8), n=3, else n=2
            // (6 notes in the time of 2
            // (7 notes in the time of n
            // (8 notes in the time of 3
            // (9 notes in the time of n
            if (i + 3 < line.length && line.charAt(i + 3) === ':') {
              // The second number, 'q', is not present.
              if (i + 4 < line.length && line.charAt(i + 4) >= '1' && line.charAt(i + 4) <= '9') {
                ret.num_notes = line.charAt(i + 4) - '0';
                i += 3;
              } else warn("expected number after the two colons after the triplet to mark the duration", line, i);
            } else if (i + 3 < line.length && line.charAt(i + 3) >= '1' && line.charAt(i + 3) <= '9') {
              ret.tripletQ = line.charAt(i + 3) - '0';

              if (i + 4 < line.length && line.charAt(i + 4) === ':') {
                if (i + 5 < line.length && line.charAt(i + 5) >= '1' && line.charAt(i + 5) <= '9') {
                  ret.num_notes = line.charAt(i + 5) - '0';
                  i += 4;
                }
              } else {
                i += 2;
              }
            } else warn("expected number after the triplet to mark the duration", line, i);
          }
        }
        i++;
      } else {
        if (ret.startSlur === undefined) ret.startSlur = 1;else ret.startSlur++;
      }
    }

    i++;
  }

  ret.consumed = i - start;
  return ret;
};

MusicParser.prototype.startNewLine = function () {
  var params = {
    startChar: -1,
    endChar: -1
  };
  if (multilineVars.partForNextLine.title) params.part = multilineVars.partForNextLine;
  params.clef = multilineVars.currentVoice && multilineVars.staves[multilineVars.currentVoice.staffNum].clef !== undefined ? parseCommon.clone(multilineVars.staves[multilineVars.currentVoice.staffNum].clef) : parseCommon.clone(multilineVars.clef);
  var scoreTranspose = multilineVars.currentVoice ? multilineVars.currentVoice.scoreTranspose : 0;
  params.key = parseKeyVoice.standardKey(multilineVars.key.root + multilineVars.key.acc + multilineVars.key.mode, multilineVars.key.root, multilineVars.key.acc, scoreTranspose);
  params.key.mode = multilineVars.key.mode;
  if (multilineVars.key.impliedNaturals) params.key.impliedNaturals = multilineVars.key.impliedNaturals;

  if (multilineVars.key.explicitAccidentals) {
    for (var i = 0; i < multilineVars.key.explicitAccidentals.length; i++) {
      var found = false;

      for (var j = 0; j < params.key.accidentals.length; j++) {
        if (params.key.accidentals[j].note === multilineVars.key.explicitAccidentals[i].note) {
          // If the note is already in the list, override it with the new value
          params.key.accidentals[j].acc = multilineVars.key.explicitAccidentals[i].acc;
          found = true;
        }
      }

      if (!found) params.key.accidentals.push(multilineVars.key.explicitAccidentals[i]);
    }
  }

  multilineVars.targetKey = params.key;
  if (params.key.explicitAccidentals) delete params.key.explicitAccidentals;
  parseKeyVoice.addPosToKey(params.clef, params.key);

  if (multilineVars.meter !== null) {
    if (multilineVars.currentVoice) {
      parseCommon.each(multilineVars.staves, function (st) {
        st.meter = multilineVars.meter;
      });
      params.meter = multilineVars.staves[multilineVars.currentVoice.staffNum].meter;
      multilineVars.staves[multilineVars.currentVoice.staffNum].meter = null;
    } else params.meter = multilineVars.meter;

    multilineVars.meter = null;
  } else if (multilineVars.currentVoice && multilineVars.staves[multilineVars.currentVoice.staffNum].meter) {
    // Make sure that each voice gets the meter marking.
    params.meter = multilineVars.staves[multilineVars.currentVoice.staffNum].meter;
    multilineVars.staves[multilineVars.currentVoice.staffNum].meter = null;
  }

  if (multilineVars.currentVoice && multilineVars.currentVoice.name) params.name = multilineVars.currentVoice.name;
  if (multilineVars.vocalfont) params.vocalfont = multilineVars.vocalfont;
  if (multilineVars.tripletfont) params.tripletfont = multilineVars.tripletfont;
  if (multilineVars.gchordfont) params.gchordfont = multilineVars.gchordfont;
  if (multilineVars.style) params.style = multilineVars.style;

  if (multilineVars.currentVoice) {
    var staff = multilineVars.staves[multilineVars.currentVoice.staffNum];
    if (staff.brace) params.brace = staff.brace;
    if (staff.bracket) params.bracket = staff.bracket;
    if (staff.connectBarLines) params.connectBarLines = staff.connectBarLines;
    if (staff.name) params.name = staff.name[multilineVars.currentVoice.index];
    if (staff.subname) params.subname = staff.subname[multilineVars.currentVoice.index];
    if (multilineVars.currentVoice.stem) params.stem = multilineVars.currentVoice.stem;
    if (multilineVars.currentVoice.stafflines) params.stafflines = multilineVars.currentVoice.stafflines;
    if (multilineVars.currentVoice.staffscale) params.staffscale = multilineVars.currentVoice.staffscale;
    if (multilineVars.currentVoice.scale) params.scale = multilineVars.currentVoice.scale;
    if (multilineVars.currentVoice.style) params.style = multilineVars.currentVoice.style;
    if (multilineVars.currentVoice.transpose) params.clef.transpose = multilineVars.currentVoice.transpose;
  }

  var isFirstVoice = multilineVars.currentVoice === undefined || multilineVars.currentVoice.staffNum === 0 && multilineVars.currentVoice.index === 0;
  if (multilineVars.barNumbers === 0 && isFirstVoice && multilineVars.currBarNumber !== 1) params.barNumber = multilineVars.currBarNumber;
  tuneBuilder.startNewLine(params);
  if (multilineVars.key.impliedNaturals) delete multilineVars.key.impliedNaturals;
  multilineVars.partForNextLine = {};
  if (multilineVars.tempoForNextLine.length === 4) tuneBuilder.appendElement(multilineVars.tempoForNextLine[0], multilineVars.tempoForNextLine[1], multilineVars.tempoForNextLine[2], multilineVars.tempoForNextLine[3]);
  multilineVars.tempoForNextLine = [];
}; // TODO-PER: make this a method in el.


var addEndBeam = function addEndBeam(el) {
  if (el.duration !== undefined && el.duration < 0.25) el.end_beam = true;
  return el;
};

var pitches = {
  A: 5,
  q: 5,
  B: 6,
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
  a: 12,
  b: 13,
  c: 7,
  p: 7,
  d: 8,
  e: 9,
  f: 10,
  g: 11
};
var rests = {
  x: 'invisible',
  X: 'invisible-multimeasure',
  y: 'spacer',
  z: 'rest',
  Z: 'multimeasure'
};

var getCoreNote = function getCoreNote(line, index, el, canHaveBrokenRhythm) {
  //var el = { startChar: index };
  var isComplete = function isComplete(state) {
    return state === 'octave' || state === 'duration' || state === 'Zduration' || state === 'broken_rhythm' || state === 'end_slur';
  };

  var dottedTie;

  if (line[index] === '.' && line[index + 1] === '-') {
    dottedTie = true;
    index++;
  }

  var state = 'startSlur';
  var durationSetByPreviousNote = false;

  while (1) {
    switch (line.charAt(index)) {
      case '(':
        if (state === 'startSlur') {
          if (el.startSlur === undefined) el.startSlur = 1;else el.startSlur++;
        } else if (isComplete(state)) {
          el.endChar = index;
          return el;
        } else return null;

        break;

      case ')':
        if (isComplete(state)) {
          if (el.endSlur === undefined) el.endSlur = 1;else el.endSlur++;
        } else return null;

        break;

      case '^':
        if (state === 'startSlur') {
          el.accidental = 'sharp';
          state = 'sharp2';
        } else if (state === 'sharp2') {
          el.accidental = 'dblsharp';
          state = 'pitch';
        } else if (isComplete(state)) {
          el.endChar = index;
          return el;
        } else return null;

        break;

      case '_':
        if (state === 'startSlur') {
          el.accidental = 'flat';
          state = 'flat2';
        } else if (state === 'flat2') {
          el.accidental = 'dblflat';
          state = 'pitch';
        } else if (isComplete(state)) {
          el.endChar = index;
          return el;
        } else return null;

        break;

      case '=':
        if (state === 'startSlur') {
          el.accidental = 'natural';
          state = 'pitch';
        } else if (isComplete(state)) {
          el.endChar = index;
          return el;
        } else return null;

        break;

      case 'A':
      case 'B':
      case 'C':
      case 'D':
      case 'E':
      case 'F':
      case 'G':
      case 'a':
      case 'b':
      case 'c':
      case 'd':
      case 'e':
      case 'f':
      case 'g':
      case 'q':
      case 'p':
        if (state === 'startSlur' || state === 'sharp2' || state === 'flat2' || state === 'pitch') {
          el.pitch = pitches[line.charAt(index)];
          transpose.note(multilineVars, el);
          state = 'octave'; // At this point we have a valid note. The rest is optional. Set the duration in case we don't get one below

          if (canHaveBrokenRhythm && multilineVars.next_note_duration !== 0) {
            el.duration = multilineVars.default_length * multilineVars.next_note_duration;
            multilineVars.next_note_duration = 0;
            durationSetByPreviousNote = true;
          } else el.duration = multilineVars.default_length; // If the clef is percussion, there is probably some translation of the pitch to a particular drum kit item.


          if (multilineVars.clef && (multilineVars.clef.type === "perc" || multilineVars.clef.type === "swiss") || multilineVars.currentVoice && (multilineVars.currentVoice.clef === "perc" || multilineVars.clef.type === "swiss")) {
            var key = line.charAt(index);

            if (el.accidental) {
              var accMap = {
                'dblflat': '__',
                'flat': '_',
                'natural': '=',
                'sharp': '^',
                'dblsharp': '^^'
              };
              key = accMap[el.accidental] + key;
            }

            if (tune.formatting && tune.formatting.midi && tune.formatting.midi.drummap) el.midipitch = tune.formatting.midi.drummap[key];
          }
        } else if (isComplete(state)) {
          el.endChar = index;
          return el;
        } else return null;

        break;

      case ',':
        if (state === 'octave') {
          el.pitch -= 7;
        } else if (isComplete(state)) {
          el.endChar = index;
          return el;
        } else return null;

        break;

      case '\'':
        if (state === 'octave') {
          el.pitch += 7;
        } else if (isComplete(state)) {
          el.endChar = index;
          return el;
        } else return null;

        break;

      case 'x':
      case 'X':
      case 'y':
      case 'z':
      case 'Z':
        if (state === 'startSlur') {
          el.rest = {
            type: rests[line.charAt(index)]
          }; // There shouldn't be some of the properties that notes have. If some sneak in due to bad syntax in the abc file,
          // just nix them here.

          delete el.accidental;
          delete el.startSlur;
          delete el.startTie;
          delete el.endSlur;
          delete el.endTie;
          delete el.end_beam;
          delete el.grace_notes; // At this point we have a valid note. The rest is optional. Set the duration in case we don't get one below

          if (el.rest.type.indexOf('multimeasure') >= 0) {
            el.duration = tune.getBarLength();
            el.rest.text = 1;
            state = 'Zduration';
          } else {
            if (canHaveBrokenRhythm && multilineVars.next_note_duration !== 0) {
              el.duration = multilineVars.default_length * multilineVars.next_note_duration;
              multilineVars.next_note_duration = 0;
              durationSetByPreviousNote = true;
            } else el.duration = multilineVars.default_length;

            state = 'duration';
          }
        } else if (isComplete(state)) {
          el.endChar = index;
          return el;
        } else return null;

        break;

      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '0':
      case '/':
        if (state === 'octave' || state === 'duration') {
          var fraction = tokenizer.getFraction(line, index); //if (!durationSetByPreviousNote)

          el.duration = el.duration * fraction.value; // TODO-PER: We can test the returned duration here and give a warning if it isn't the one expected.

          el.endChar = fraction.index;

          while (fraction.index < line.length && (tokenizer.isWhiteSpace(line.charAt(fraction.index)) || line.charAt(fraction.index) === '-')) {
            if (line.charAt(fraction.index) === '-') el.startTie = {};else el = addEndBeam(el);
            fraction.index++;
          }

          index = fraction.index - 1;
          state = 'broken_rhythm';
        } else if (state === 'sharp2') {
          el.accidental = 'quartersharp';
          state = 'pitch';
        } else if (state === 'flat2') {
          el.accidental = 'quarterflat';
          state = 'pitch';
        } else if (state === 'Zduration') {
          var num = tokenizer.getNumber(line, index);
          el.duration = num.num * tune.getBarLength();
          el.rest.text = num.num;
          el.endChar = num.index;
          return el;
        } else return null;

        break;

      case '-':
        if (state === 'startSlur') {
          // This is the first character, so it must have been meant for the previous note. Correct that here.
          tuneBuilder.addTieToLastNote(dottedTie);
          el.endTie = true;
        } else if (state === 'octave' || state === 'duration' || state === 'end_slur') {
          el.startTie = {};
          if (!durationSetByPreviousNote && canHaveBrokenRhythm) state = 'broken_rhythm';else {
            // Peek ahead to the next character. If it is a space, then we have an end beam.
            if (tokenizer.isWhiteSpace(line.charAt(index + 1))) addEndBeam(el);
            el.endChar = index + 1;
            return el;
          }
        } else if (state === 'broken_rhythm') {
          el.endChar = index;
          return el;
        } else return null;

        break;

      case ' ':
      case '\t':
        if (isComplete(state)) {
          el.end_beam = true; // look ahead to see if there is a tie

          dottedTie = false;

          do {
            if (line.charAt(index) === '.' && line.charAt(index + 1) === '-') {
              dottedTie = true;
              index++;
            }

            if (line.charAt(index) === '-') {
              el.startTie = {};
              if (dottedTie) el.startTie.style = "dotted";
            }

            index++;
          } while (index < line.length && (tokenizer.isWhiteSpace(line.charAt(index)) || line.charAt(index) === '-') || line.charAt(index) === '.' && line.charAt(index + 1) === '-');

          el.endChar = index;

          if (!durationSetByPreviousNote && canHaveBrokenRhythm && (line.charAt(index) === '<' || line.charAt(index) === '>')) {
            // TODO-PER: Don't need the test for < and >, but that makes the endChar work out for the regression test.
            index--;
            state = 'broken_rhythm';
          } else return el;
        } else return null;

        break;

      case '>':
      case '<':
        if (isComplete(state)) {
          if (canHaveBrokenRhythm) {
            var br2 = getBrokenRhythm(line, index);
            index += br2[0] - 1; // index gets incremented below, so we'll let that happen

            multilineVars.next_note_duration = br2[2];
            el.duration = br2[1] * el.duration;
            state = 'end_slur';
          } else {
            el.endChar = index;
            return el;
          }
        } else return null;

        break;

      default:
        if (isComplete(state)) {
          el.endChar = index;
          return el;
        }

        return null;
    }

    index++;

    if (index === line.length) {
      if (isComplete(state)) {
        el.endChar = index;
        return el;
      } else return null;
    }
  }

  return null;
};

var getBrokenRhythm = function getBrokenRhythm(line, index) {
  switch (line.charAt(index)) {
    case '>':
      if (index < line.length - 2 && line.charAt(index + 1) === '>' && line.charAt(index + 2) === '>') // triple >>>
        return [3, 1.875, 0.125];else if (index < line.length - 1 && line.charAt(index + 1) === '>') // double >>
        return [2, 1.75, 0.25];else return [1, 1.5, 0.5];

    case '<':
      if (index < line.length - 2 && line.charAt(index + 1) === '<' && line.charAt(index + 2) === '<') // triple <<<
        return [3, 0.125, 1.875];else if (index < line.length - 1 && line.charAt(index + 1) === '<') // double <<
        return [2, 0.25, 1.75];else return [1, 0.5, 1.5];
  }

  return null;
};

module.exports = MusicParser;

/***/ }),

/***/ "./src/parse/abc_tokenizer.js":
/*!************************************!*\
  !*** ./src/parse/abc_tokenizer.js ***!
  \************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

//    abc_tokenizer.js: tokenizes an ABC Music Notation string to support abc_parse.
var parseCommon = __webpack_require__(/*! ./abc_common */ "./src/parse/abc_common.js"); // this is a series of functions that get a particular element out of the passed stream.
// the return is the number of characters consumed, so 0 means that the element wasn't found.
// also returned is the element found. This may be a different length because spaces may be consumed that aren't part of the string.
// The return structure for most calls is { len: num_chars_consumed, token: str }


var Tokenizer = function Tokenizer(lines, multilineVars) {
  this.lineIndex = 0;
  this.lines = lines;
  this.multilineVars = multilineVars;

  this.skipWhiteSpace = function (str) {
    for (var i = 0; i < str.length; i++) {
      if (!this.isWhiteSpace(str.charAt(i))) return i;
    }

    return str.length; // It must have been all white space
  };

  var finished = function finished(str, i) {
    return i >= str.length;
  };

  this.eatWhiteSpace = function (line, index) {
    for (var i = index; i < line.length; i++) {
      if (!this.isWhiteSpace(line.charAt(i))) return i - index;
    }

    return i - index;
  }; // This just gets the basic pitch letter, ignoring leading spaces, and normalizing it to a capital


  this.getKeyPitch = function (str) {
    var i = this.skipWhiteSpace(str);
    if (finished(str, i)) return {
      len: 0
    };

    switch (str.charAt(i)) {
      case 'A':
        return {
          len: i + 1,
          token: 'A'
        };

      case 'B':
        return {
          len: i + 1,
          token: 'B'
        };

      case 'C':
        return {
          len: i + 1,
          token: 'C'
        };

      case 'D':
        return {
          len: i + 1,
          token: 'D'
        };

      case 'E':
        return {
          len: i + 1,
          token: 'E'
        };

      case 'F':
        return {
          len: i + 1,
          token: 'F'
        };

      case 'G':
        return {
          len: i + 1,
          token: 'G'
        };
      //			case 'a':return {len: i+1, token: 'A'};
      //			case 'b':return {len: i+1, token: 'B'};
      //			case 'c':return {len: i+1, token: 'C'};
      //			case 'd':return {len: i+1, token: 'D'};
      //			case 'e':return {len: i+1, token: 'E'};
      //			case 'f':return {len: i+1, token: 'F'};
      //			case 'g':return {len: i+1, token: 'G'};
    }

    return {
      len: 0
    };
  }; // This just gets the basic accidental, ignoring leading spaces, and only the ones that appear in a key


  this.getSharpFlat = function (str) {
    if (str === 'bass') return {
      len: 0
    };

    switch (str.charAt(0)) {
      case '#':
        return {
          len: 1,
          token: '#'
        };

      case 'b':
        return {
          len: 1,
          token: 'b'
        };
    }

    return {
      len: 0
    };
  };

  this.getMode = function (str) {
    var skipAlpha = function skipAlpha(str, start) {
      // This returns the index of the next non-alphabetic char, or the entire length of the string if not found.
      while (start < str.length && (str.charAt(start) >= 'a' && str.charAt(start) <= 'z' || str.charAt(start) >= 'A' && str.charAt(start) <= 'Z')) {
        start++;
      }

      return start;
    };

    var i = this.skipWhiteSpace(str);
    if (finished(str, i)) return {
      len: 0
    };
    var firstThree = str.substring(i, i + 3).toLowerCase();
    if (firstThree.length > 1 && firstThree.charAt(1) === ' ' || firstThree.charAt(1) === '^' || firstThree.charAt(1) === '_' || firstThree.charAt(1) === '=') firstThree = firstThree.charAt(0); // This will handle the case of 'm'

    switch (firstThree) {
      case 'mix':
        return {
          len: skipAlpha(str, i),
          token: 'Mix'
        };

      case 'dor':
        return {
          len: skipAlpha(str, i),
          token: 'Dor'
        };

      case 'phr':
        return {
          len: skipAlpha(str, i),
          token: 'Phr'
        };

      case 'lyd':
        return {
          len: skipAlpha(str, i),
          token: 'Lyd'
        };

      case 'loc':
        return {
          len: skipAlpha(str, i),
          token: 'Loc'
        };

      case 'aeo':
        return {
          len: skipAlpha(str, i),
          token: 'm'
        };

      case 'maj':
        return {
          len: skipAlpha(str, i),
          token: ''
        };

      case 'ion':
        return {
          len: skipAlpha(str, i),
          token: ''
        };

      case 'min':
        return {
          len: skipAlpha(str, i),
          token: 'm'
        };

      case 'm':
        return {
          len: skipAlpha(str, i),
          token: 'm'
        };
    }

    return {
      len: 0
    };
  };

  this.getClef = function (str, bExplicitOnly) {
    var strOrig = str;
    var i = this.skipWhiteSpace(str);
    if (finished(str, i)) return {
      len: 0
    }; // The word 'clef' is optional, but if it appears, a clef MUST appear

    var needsClef = false;
    var strClef = str.substring(i);

    if (parseCommon.startsWith(strClef, 'clef=')) {
      needsClef = true;
      strClef = strClef.substring(5);
      i += 5;
    }

    if (strClef.length === 0 && needsClef) return {
      len: i + 5,
      warn: "No clef specified: " + strOrig
    };
    var j = this.skipWhiteSpace(strClef);
    if (finished(strClef, j)) return {
      len: 0
    };

    if (j > 0) {
      i += j;
      strClef = strClef.substring(j);
    }

    var name = null;
    if (parseCommon.startsWith(strClef, 'treble')) name = 'treble';else if (parseCommon.startsWith(strClef, 'bass3')) name = 'bass3';else if (parseCommon.startsWith(strClef, 'bass')) name = 'bass';else if (parseCommon.startsWith(strClef, 'tenor')) name = 'tenor';else if (parseCommon.startsWith(strClef, 'alto2')) name = 'alto2';else if (parseCommon.startsWith(strClef, 'alto1')) name = 'alto1';else if (parseCommon.startsWith(strClef, 'alto')) name = 'alto';else if (!bExplicitOnly && needsClef && parseCommon.startsWith(strClef, 'none')) name = 'none';else if (parseCommon.startsWith(strClef, 'perc')) name = 'perc';else if (parseCommon.startsWith(strClef, 'swiss')) name = 'swiss';else if (!bExplicitOnly && needsClef && parseCommon.startsWith(strClef, 'C')) name = 'tenor';else if (!bExplicitOnly && needsClef && parseCommon.startsWith(strClef, 'F')) name = 'bass';else if (!bExplicitOnly && needsClef && parseCommon.startsWith(strClef, 'G')) name = 'treble';else return {
      len: i + 5,
      warn: "Unknown clef specified: " + strOrig
    };
    strClef = strClef.substring(name.length);
    j = this.isMatch(strClef, '+8');
    if (j > 0) name += "+8";else {
      j = this.isMatch(strClef, '-8');
      if (j > 0) name += "-8";
    }
    return {
      len: i + name.length,
      token: name,
      explicit: needsClef
    };
  }; // This returns one of the legal bar lines
  // This is called alot and there is no obvious tokenable items, so this is broken apart.


  this.getBarLine = function (line, i) {
    switch (line.charAt(i)) {
      case ']':
        ++i;

        switch (line.charAt(i)) {
          case '|':
            return {
              len: 2,
              token: "bar_thick_thin"
            };

          case '[':
            ++i;
            if (line.charAt(i) >= '1' && line.charAt(i) <= '9' || line.charAt(i) === '"') return {
              len: 2,
              token: "bar_invisible"
            };
            return {
              len: 1,
              warn: "Unknown bar symbol"
            };

          default:
            return {
              len: 1,
              token: "bar_invisible"
            };
        }

        break;

      case ':':
        ++i;

        switch (line.charAt(i)) {
          case ':':
            return {
              len: 2,
              token: "bar_dbl_repeat"
            };

          case '|':
            // :|
            ++i;

            switch (line.charAt(i)) {
              case ']':
                // :|]
                ++i;

                switch (line.charAt(i)) {
                  case '|':
                    // :|]|
                    ++i;
                    if (line.charAt(i) === ':') return {
                      len: 5,
                      token: "bar_dbl_repeat"
                    };
                    return {
                      len: 3,
                      token: "bar_right_repeat"
                    };

                  default:
                    return {
                      len: 3,
                      token: "bar_right_repeat"
                    };
                }

                break;

              case '|':
                // :||
                ++i;
                if (line.charAt(i) === ':') return {
                  len: 4,
                  token: "bar_dbl_repeat"
                };
                return {
                  len: 3,
                  token: "bar_right_repeat"
                };

              default:
                return {
                  len: 2,
                  token: "bar_right_repeat"
                };
            }

            break;

          default:
            return {
              len: 1,
              warn: "Unknown bar symbol"
            };
        }

        break;

      case '[':
        // [
        ++i;

        if (line.charAt(i) === '|') {
          // [|
          ++i;

          switch (line.charAt(i)) {
            case ':':
              return {
                len: 3,
                token: "bar_left_repeat"
              };

            case ']':
              return {
                len: 3,
                token: "bar_invisible"
              };

            default:
              return {
                len: 2,
                token: "bar_thick_thin"
              };
          }
        } else {
          if (line.charAt(i) >= '1' && line.charAt(i) <= '9' || line.charAt(i) === '"') return {
            len: 1,
            token: "bar_invisible"
          };
          return {
            len: 0
          };
        }

        break;

      case '|':
        // |
        ++i;

        switch (line.charAt(i)) {
          case ']':
            return {
              len: 2,
              token: "bar_thin_thick"
            };

          case '|':
            // ||
            ++i;
            if (line.charAt(i) === ':') return {
              len: 3,
              token: "bar_left_repeat"
            };
            return {
              len: 2,
              token: "bar_thin_thin"
            };

          case ':':
            // |:
            var colons = 0;

            while (line.charAt(i + colons) === ':') {
              colons++;
            }

            return {
              len: 1 + colons,
              token: "bar_left_repeat"
            };

          default:
            return {
              len: 1,
              token: "bar_thin"
            };
        }

        break;
    }

    return {
      len: 0
    };
  }; // this returns all the characters in the string that match one of the characters in the legalChars string


  this.getTokenOf = function (str, legalChars) {
    for (var i = 0; i < str.length; i++) {
      if (legalChars.indexOf(str.charAt(i)) < 0) return {
        len: i,
        token: str.substring(0, i)
      };
    }

    return {
      len: i,
      token: str
    };
  };

  this.getToken = function (str, start, end) {
    // This returns the next set of chars that doesn't contain spaces
    var i = start;

    while (i < end && !this.isWhiteSpace(str.charAt(i))) {
      i++;
    }

    return str.substring(start, i);
  }; // This just sees if the next token is the word passed in, with possible leading spaces


  this.isMatch = function (str, match) {
    var i = this.skipWhiteSpace(str);
    if (finished(str, i)) return 0;
    if (parseCommon.startsWith(str.substring(i), match)) return i + match.length;
    return 0;
  };

  this.getPitchFromTokens = function (tokens) {
    var ret = {};
    var pitches = {
      A: 5,
      B: 6,
      C: 0,
      D: 1,
      E: 2,
      F: 3,
      G: 4,
      a: 12,
      b: 13,
      c: 7,
      d: 8,
      e: 9,
      f: 10,
      g: 11
    };
    ret.position = pitches[tokens[0].token];
    if (ret.position === undefined) return {
      warn: "Pitch expected. Found: " + tokens[0].token
    };
    tokens.shift();

    while (tokens.length) {
      switch (tokens[0].token) {
        case ',':
          ret.position -= 7;
          tokens.shift();
          break;

        case '\'':
          ret.position += 7;
          tokens.shift();
          break;

        default:
          return ret;
      }
    }

    return ret;
  };

  this.getKeyAccidentals2 = function (tokens) {
    var accs; // find and strip off all accidentals in the token list

    while (tokens.length > 0) {
      var acc;

      if (tokens[0].token === '^') {
        acc = 'sharp';
        tokens.shift();
        if (tokens.length === 0) return {
          accs: accs,
          warn: 'Expected note name after ' + acc
        };

        switch (tokens[0].token) {
          case '^':
            acc = 'dblsharp';
            tokens.shift();
            break;

          case '/':
            acc = 'quartersharp';
            tokens.shift();
            break;
        }
      } else if (tokens[0].token === '=') {
        acc = 'natural';
        tokens.shift();
      } else if (tokens[0].token === '_') {
        acc = 'flat';
        tokens.shift();
        if (tokens.length === 0) return {
          accs: accs,
          warn: 'Expected note name after ' + acc
        };

        switch (tokens[0].token) {
          case '_':
            acc = 'dblflat';
            tokens.shift();
            break;

          case '/':
            acc = 'quarterflat';
            tokens.shift();
            break;
        }
      } else {
        // Not an accidental, we'll assume that a later parse will recognize it.
        return {
          accs: accs
        };
      }

      if (tokens.length === 0) return {
        accs: accs,
        warn: 'Expected note name after ' + acc
      };

      switch (tokens[0].token.charAt(0)) {
        case 'a':
        case 'b':
        case 'c':
        case 'd':
        case 'e':
        case 'f':
        case 'g':
        case 'A':
        case 'B':
        case 'C':
        case 'D':
        case 'E':
        case 'F':
        case 'G':
          if (accs === undefined) accs = [];
          accs.push({
            acc: acc,
            note: tokens[0].token.charAt(0)
          });
          if (tokens[0].token.length === 1) tokens.shift();else tokens[0].token = tokens[0].token.substring(1);
          break;

        default:
          return {
            accs: accs,
            warn: 'Expected note name after ' + acc + ' Found: ' + tokens[0].token
          };
      }
    }

    return {
      accs: accs
    };
  }; // This gets an accidental marking for the key signature. It has the accidental then the pitch letter.


  this.getKeyAccidental = function (str) {
    var accTranslation = {
      '^': 'sharp',
      '^^': 'dblsharp',
      '=': 'natural',
      '_': 'flat',
      '__': 'dblflat',
      '_/': 'quarterflat',
      '^/': 'quartersharp'
    };
    var i = this.skipWhiteSpace(str);
    if (finished(str, i)) return {
      len: 0
    };
    var acc = null;

    switch (str.charAt(i)) {
      case '^':
      case '_':
      case '=':
        acc = str.charAt(i);
        break;

      default:
        return {
          len: 0
        };
    }

    i++;
    if (finished(str, i)) return {
      len: 1,
      warn: 'Expected note name after accidental'
    };

    switch (str.charAt(i)) {
      case 'a':
      case 'b':
      case 'c':
      case 'd':
      case 'e':
      case 'f':
      case 'g':
      case 'A':
      case 'B':
      case 'C':
      case 'D':
      case 'E':
      case 'F':
      case 'G':
        return {
          len: i + 1,
          token: {
            acc: accTranslation[acc],
            note: str.charAt(i)
          }
        };

      case '^':
      case '_':
      case '/':
        acc += str.charAt(i);
        i++;
        if (finished(str, i)) return {
          len: 2,
          warn: 'Expected note name after accidental'
        };

        switch (str.charAt(i)) {
          case 'a':
          case 'b':
          case 'c':
          case 'd':
          case 'e':
          case 'f':
          case 'g':
          case 'A':
          case 'B':
          case 'C':
          case 'D':
          case 'E':
          case 'F':
          case 'G':
            return {
              len: i + 1,
              token: {
                acc: accTranslation[acc],
                note: str.charAt(i)
              }
            };

          default:
            return {
              len: 2,
              warn: 'Expected note name after accidental'
            };
        }

        break;

      default:
        return {
          len: 1,
          warn: 'Expected note name after accidental'
        };
    }
  };

  this.isWhiteSpace = function (ch) {
    return ch === ' ' || ch === '\t' || ch === '\x12';
  };

  this.getMeat = function (line, start, end) {
    // This removes any comments starting with '%' and trims the ends of the string so that there are no leading or trailing spaces.
    // it returns just the start and end characters that contain the meat.
    var comment = line.indexOf('%', start);
    if (comment >= 0 && comment < end) end = comment;

    while (start < end && (line.charAt(start) === ' ' || line.charAt(start) === '\t' || line.charAt(start) === '\x12')) {
      start++;
    }

    while (start < end && (line.charAt(end - 1) === ' ' || line.charAt(end - 1) === '\t' || line.charAt(end - 1) === '\x12')) {
      end--;
    }

    return {
      start: start,
      end: end
    };
  };

  var isLetter = function isLetter(ch) {
    return ch >= 'A' && ch <= 'Z' || ch >= 'a' && ch <= 'z';
  };

  var isNumber = function isNumber(ch) {
    return ch >= '0' && ch <= '9';
  };

  this.tokenize = function (line, start, end, alphaUntilWhiteSpace) {
    // this returns all the tokens inside the passed string. A token is a punctuation mark, a string of digits, a string of letters.
    //  Quoted strings are one token.
    //  If there is a minus sign next to a number, then it is included in the number.
    // If there is a period immediately after a number, with a number immediately following, then a float is returned.
    // The type of token is returned: quote, alpha, number, punct
    // If alphaUntilWhiteSpace is true, then the behavior of the alpha token changes.
    var ret = this.getMeat(line, start, end);
    start = ret.start;
    end = ret.end;
    var tokens = [];
    var i;

    while (start < end) {
      if (line.charAt(start) === '"') {
        i = start + 1;

        while (i < end && line.charAt(i) !== '"') {
          i++;
        }

        tokens.push({
          type: 'quote',
          token: line.substring(start + 1, i),
          start: start + 1,
          end: i
        });
        i++;
      } else if (isLetter(line.charAt(start))) {
        i = start + 1;
        if (alphaUntilWhiteSpace) while (i < end && !this.isWhiteSpace(line.charAt(i))) {
          i++;
        } else while (i < end && isLetter(line.charAt(i))) {
          i++;
        }
        tokens.push({
          type: 'alpha',
          token: line.substring(start, i),
          continueId: isNumber(line.charAt(i)),
          start: start,
          end: i
        });
        start = i + 1;
      } else if (line.charAt(start) === '.' && isNumber(line.charAt(i + 1))) {
        i = start + 1;
        var int2 = null;
        var float2 = null;

        while (i < end && isNumber(line.charAt(i))) {
          i++;
        }

        float2 = parseFloat(line.substring(start, i));
        tokens.push({
          type: 'number',
          token: line.substring(start, i),
          intt: int2,
          floatt: float2,
          continueId: isLetter(line.charAt(i)),
          start: start,
          end: i
        });
        start = i + 1;
      } else if (isNumber(line.charAt(start)) || line.charAt(start) === '-' && isNumber(line.charAt(i + 1))) {
        i = start + 1;
        var intt = null;
        var floatt = null;

        while (i < end && isNumber(line.charAt(i))) {
          i++;
        }

        if (line.charAt(i) === '.' && isNumber(line.charAt(i + 1))) {
          i++;

          while (i < end && isNumber(line.charAt(i))) {
            i++;
          }
        } else intt = parseInt(line.substring(start, i));

        floatt = parseFloat(line.substring(start, i));
        tokens.push({
          type: 'number',
          token: line.substring(start, i),
          intt: intt,
          floatt: floatt,
          continueId: isLetter(line.charAt(i)),
          start: start,
          end: i
        });
        start = i + 1;
      } else if (line.charAt(start) === ' ' || line.charAt(start) === '\t') {
        i = start + 1;
      } else {
        tokens.push({
          type: 'punct',
          token: line.charAt(start),
          start: start,
          end: start + 1
        });
        i = start + 1;
      }

      start = i;
    }

    return tokens;
  };

  this.getVoiceToken = function (line, start, end) {
    // This finds the next token. A token is delimited by a space or an equal sign. If it starts with a quote, then the portion between the quotes is returned.
    var i = start;

    while (i < end && this.isWhiteSpace(line.charAt(i)) || line.charAt(i) === '=') {
      i++;
    }

    if (line.charAt(i) === '"') {
      var close = line.indexOf('"', i + 1);
      if (close === -1 || close >= end) return {
        len: 1,
        err: "Missing close quote"
      };
      return {
        len: close - start + 1,
        token: this.translateString(line.substring(i + 1, close))
      };
    } else {
      var ii = i;

      while (ii < end && !this.isWhiteSpace(line.charAt(ii)) && line.charAt(ii) !== '=') {
        ii++;
      }

      return {
        len: ii - start + 1,
        token: line.substring(i, ii)
      };
    }
  };

  var charMap = {
    "`a": 'à',
    "'a": "á",
    "^a": "â",
    "~a": "ã",
    "\"a": "ä",
    "oa": "å",
    "aa": "å",
    "=a": "ā",
    "ua": "ă",
    ";a": "ą",
    "`e": 'è',
    "'e": "é",
    "^e": "ê",
    "\"e": "ë",
    "=e": "ē",
    "ue": "ĕ",
    ";e": "ę",
    ".e": "ė",
    "`i": 'ì',
    "'i": "í",
    "^i": "î",
    "\"i": "ï",
    "=i": "ī",
    "ui": "ĭ",
    ";i": "į",
    "`o": 'ò',
    "'o": "ó",
    "^o": "ô",
    "~o": "õ",
    "\"o": "ö",
    "=o": "ō",
    "uo": "ŏ",
    "/o": "ø",
    "`u": 'ù',
    "'u": "ú",
    "^u": "û",
    "~u": "ũ",
    "\"u": "ü",
    "ou": "ů",
    "=u": "ū",
    "uu": "ŭ",
    ";u": "ų",
    "`A": 'À',
    "'A": "Á",
    "^A": "Â",
    "~A": "Ã",
    "\"A": "Ä",
    "oA": "Å",
    "AA": "Å",
    "=A": "Ā",
    "uA": "Ă",
    ";A": "Ą",
    "`E": 'È',
    "'E": "É",
    "^E": "Ê",
    "\"E": "Ë",
    "=E": "Ē",
    "uE": "Ĕ",
    ";E": "Ę",
    ".E": "Ė",
    "`I": 'Ì',
    "'I": "Í",
    "^I": "Î",
    "~I": "Ĩ",
    "\"I": "Ï",
    "=I": "Ī",
    "uI": "Ĭ",
    ";I": "Į",
    ".I": "İ",
    "`O": 'Ò',
    "'O": "Ó",
    "^O": "Ô",
    "~O": "Õ",
    "\"O": "Ö",
    "=O": "Ō",
    "uO": "Ŏ",
    "/O": "Ø",
    "`U": 'Ù',
    "'U": "Ú",
    "^U": "Û",
    "~U": "Ũ",
    "\"U": "Ü",
    "oU": "Ů",
    "=U": "Ū",
    "uU": "Ŭ",
    ";U": "Ų",
    "ae": "æ",
    "AE": "Æ",
    "oe": "œ",
    "OE": "Œ",
    "ss": "ß",
    "'c": "ć",
    "^c": "ĉ",
    "uc": "č",
    "cc": "ç",
    ".c": "ċ",
    "cC": "Ç",
    "'C": "Ć",
    "^C": "Ĉ",
    "uC": "Č",
    ".C": "Ċ",
    "~N": "Ñ",
    "~n": "ñ",
    "=s": "š",
    "vs": "š",
    "DH": "Ð",
    "dh": "ð",
    "HO": "Ő",
    "Ho": "ő",
    "HU": "Ű",
    "Hu": "ű",
    "'Y": "Ý",
    "'y": "ý",
    "^Y": "Ŷ",
    "^y": "ŷ",
    "\"Y": "Ÿ",
    "\"y": "ÿ",
    "vS": "Š",
    "vZ": "Ž",
    "vz": 'ž' // More chars: Ĳ ĳ Ď ď Đ đ Ĝ ĝ Ğ ğ Ġ ġ Ģ ģ Ĥ ĥ Ħ ħ Ĵ ĵ Ķ ķ ĸ Ĺ ĺ Ļ ļ Ľ ľ Ŀ ŀ Ł ł Ń ń Ņ ņ Ň ň ŉ Ŋ ŋ Ŕ ŕ Ŗ ŗ Ř ř Ś ś Ŝ ŝ Ş ş Š Ţ ţ Ť ť Ŧ ŧ Ŵ ŵ Ź ź Ż ż Ž

  };
  var charMap1 = {
    "#": "♯",
    "b": "♭",
    "=": "♮"
  };
  var charMap2 = {
    "201": "♯",
    "202": "♭",
    "203": "♮",
    "241": "¡",
    "242": "¢",
    "252": "a",
    "262": "2",
    "272": "o",
    "302": "Â",
    "312": "Ê",
    "322": "Ò",
    "332": "Ú",
    "342": "â",
    "352": "ê",
    "362": "ò",
    "372": "ú",
    "243": "£",
    "253": "«",
    "263": "3",
    "273": "»",
    "303": "Ã",
    "313": "Ë",
    "323": "Ó",
    "333": "Û",
    "343": "ã",
    "353": "ë",
    "363": "ó",
    "373": "û",
    "244": "¤",
    "254": "¬",
    "264": "  ́",
    "274": "1⁄4",
    "304": "Ä",
    "314": "Ì",
    "324": "Ô",
    "334": "Ü",
    "344": "ä",
    "354": "ì",
    "364": "ô",
    "374": "ü",
    "245": "¥",
    "255": "-",
    "265": "μ",
    "275": "1⁄2",
    "305": "Å",
    "315": "Í",
    "325": "Õ",
    "335": "Ý",
    "345": "å",
    "355": "í",
    "365": "õ",
    "375": "ý",
    "246": "¦",
    "256": "®",
    "266": "¶",
    "276": "3⁄4",
    "306": "Æ",
    "316": "Î",
    "326": "Ö",
    "336": "Þ",
    "346": "æ",
    "356": "î",
    "366": "ö",
    "376": "þ",
    "247": "§",
    "257": " ̄",
    "267": "·",
    "277": "¿",
    "307": "Ç",
    "317": "Ï",
    "327": "×",
    "337": "ß",
    "347": "ç",
    "357": "ï",
    "367": "÷",
    "377": "ÿ",
    "250": " ̈",
    "260": "°",
    "270": " ̧",
    "300": "À",
    "310": "È",
    "320": "Ð",
    "330": "Ø",
    "340": "à",
    "350": "è",
    "360": "ð",
    "370": "ø",
    "251": "©",
    "261": "±",
    "271": "1",
    "301": "Á",
    "311": "É",
    "321": "Ñ",
    "331": "Ù",
    "341": "á",
    "351": "é",
    "361": "ñ",
    "371": "ù"
  };

  this.translateString = function (str) {
    var arr = str.split('\\');
    if (arr.length === 1) return str;
    var out = null;
    parseCommon.each(arr, function (s) {
      if (out === null) out = s;else {
        var c = charMap[s.substring(0, 2)];
        if (c !== undefined) out += c + s.substring(2);else {
          c = charMap2[s.substring(0, 3)];
          if (c !== undefined) out += c + s.substring(3);else {
            c = charMap1[s.substring(0, 1)];
            if (c !== undefined) out += c + s.substring(1);else out += "\\" + s;
          }
        }
      }
    });
    return out;
  };

  this.getNumber = function (line, index) {
    var num = 0;

    while (index < line.length) {
      switch (line.charAt(index)) {
        case '0':
          num = num * 10;
          index++;
          break;

        case '1':
          num = num * 10 + 1;
          index++;
          break;

        case '2':
          num = num * 10 + 2;
          index++;
          break;

        case '3':
          num = num * 10 + 3;
          index++;
          break;

        case '4':
          num = num * 10 + 4;
          index++;
          break;

        case '5':
          num = num * 10 + 5;
          index++;
          break;

        case '6':
          num = num * 10 + 6;
          index++;
          break;

        case '7':
          num = num * 10 + 7;
          index++;
          break;

        case '8':
          num = num * 10 + 8;
          index++;
          break;

        case '9':
          num = num * 10 + 9;
          index++;
          break;

        default:
          return {
            num: num,
            index: index
          };
      }
    }

    return {
      num: num,
      index: index
    };
  };

  this.getFraction = function (line, index) {
    var num = 1;
    var den = 1;

    if (line.charAt(index) !== '/') {
      var ret = this.getNumber(line, index);
      num = ret.num;
      index = ret.index;
    }

    if (line.charAt(index) === '/') {
      index++;

      if (line.charAt(index) === '/') {
        var div = 0.5;

        while (line.charAt(index++) === '/') {
          div = div / 2;
        }

        return {
          value: num * div,
          index: index - 1
        };
      } else {
        var iSave = index;
        var ret2 = this.getNumber(line, index);
        if (ret2.num === 0 && iSave === index) // If we didn't use any characters, it is an implied 2
          ret2.num = 2;
        if (ret2.num !== 0) den = ret2.num;
        index = ret2.index;
      }
    }

    return {
      value: num / den,
      index: index
    };
  };

  this.theReverser = function (str) {
    if (parseCommon.endsWith(str, ", The")) return "The " + str.substring(0, str.length - 5);
    if (parseCommon.endsWith(str, ", A")) return "A " + str.substring(0, str.length - 3);
    return str;
  };

  this.stripComment = function (str) {
    var i = str.indexOf('%');
    if (i >= 0) return parseCommon.strip(str.substring(0, i));
    return parseCommon.strip(str);
  };

  this.getInt = function (str) {
    // This parses the beginning of the string for a number and returns { value: num, digits: num }
    // If digits is 0, then the string didn't point to a number.
    var x = parseInt(str);
    if (isNaN(x)) return {
      digits: 0
    };
    var s = "" + x;
    var i = str.indexOf(s); // This is to account for leading spaces

    return {
      value: x,
      digits: i + s.length
    };
  };

  this.getFloat = function (str) {
    // This parses the beginning of the string for a number and returns { value: num, digits: num }
    // If digits is 0, then the string didn't point to a number.
    var x = parseFloat(str);
    if (isNaN(x)) return {
      digits: 0
    };
    var s = "" + x;
    var i = str.indexOf(s); // This is to account for leading spaces

    return {
      value: x,
      digits: i + s.length
    };
  };

  this.getMeasurement = function (tokens) {
    if (tokens.length === 0) return {
      used: 0
    };
    var used = 1;
    var num = '';

    if (tokens[0].token === '-') {
      tokens.shift();
      num = '-';
      used++;
    } else if (tokens[0].type !== 'number') return {
      used: 0
    };

    num += tokens.shift().token;
    if (tokens.length === 0) return {
      used: 1,
      value: parseInt(num)
    };
    var x = tokens.shift();

    if (x.token === '.') {
      used++;
      if (tokens.length === 0) return {
        used: used,
        value: parseInt(num)
      };

      if (tokens[0].type === 'number') {
        x = tokens.shift();
        num = num + '.' + x.token;
        used++;
        if (tokens.length === 0) return {
          used: used,
          value: parseFloat(num)
        };
      }

      x = tokens.shift();
    }

    switch (x.token) {
      case 'pt':
        return {
          used: used + 1,
          value: parseFloat(num)
        };

      case 'cm':
        return {
          used: used + 1,
          value: parseFloat(num) / 2.54 * 72
        };

      case 'in':
        return {
          used: used + 1,
          value: parseFloat(num) * 72
        };

      default:
        tokens.unshift(x);
        return {
          used: used,
          value: parseFloat(num)
        };
    }

    return {
      used: 0
    };
  };

  var substInChord = function substInChord(str) {
    while (str.indexOf("\\n") !== -1) {
      str = str.replace("\\n", "\n");
    }

    return str;
  };

  this.getBrackettedSubstring = function (line, i, maxErrorChars, _matchChar) {
    // This extracts the sub string by looking at the first character and searching for that
    // character later in the line (or search for the optional _matchChar).
    // For instance, if the first character is a quote it will look for
    // the end quote. If the end of the line is reached, then only up to the default number
    // of characters are returned, so that a missing end quote won't eat up the entire line.
    // It returns the substring and the number of characters consumed.
    // The number of characters consumed is normally two more than the size of the substring,
    // but in the error case it might not be.
    var matchChar = _matchChar || line.charAt(i);

    var pos = i + 1;

    while (pos < line.length && line.charAt(pos) !== matchChar) {
      ++pos;
    }

    if (line.charAt(pos) === matchChar) return [pos - i + 1, substInChord(line.substring(i + 1, pos)), true];else // we hit the end of line, so we'll just pick an arbitrary num of chars so the line doesn't disappear.
      {
        pos = i + maxErrorChars;
        if (pos > line.length - 1) pos = line.length - 1;
        return [pos - i + 1, substInChord(line.substring(i + 1, pos)), false];
      }
  };
};

Tokenizer.prototype.peekLine = function () {
  return this.lines[this.lineIndex];
};

Tokenizer.prototype.nextLine = function () {
  if (this.lineIndex > 0) {
    this.multilineVars.iChar += this.lines[this.lineIndex - 1].length + 1;
  }

  if (this.lineIndex < this.lines.length) {
    var result = this.lines[this.lineIndex];
    this.lineIndex++;
    return result;
  }

  return null;
};

module.exports = Tokenizer;

/***/ }),

/***/ "./src/parse/abc_transpose.js":
/*!************************************!*\
  !*** ./src/parse/abc_transpose.js ***!
  \************************************/
/***/ (function(module) {

//    abc_transpose.js: Handles the automatic transposition of key signatures, chord symbols, and notes.
var transpose = {};
var keyIndex = {
  'C': 0,
  'C#': 1,
  'Db': 1,
  'D': 2,
  'D#': 3,
  'Eb': 3,
  'E': 4,
  'F': 5,
  'F#': 6,
  'Gb': 6,
  'G': 7,
  'G#': 8,
  'Ab': 8,
  'A': 9,
  'A#': 10,
  'Bb': 10,
  'B': 11
};
var newKey = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
var newKeyMinor = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];

transpose.keySignature = function (multilineVars, keys, keyName, root, acc, localTranspose) {
  if (multilineVars.clef.type === "perc") return {
    accidentals: keys[keyName],
    root: root,
    acc: acc
  };
  if (!localTranspose) localTranspose = 0;
  multilineVars.localTransposeVerticalMovement = 0;
  multilineVars.localTransposePreferFlats = false;
  var k = keys[keyName];
  if (!k) return multilineVars.key; // If the key isn't in the list, it is non-standard. We won't attempt to transpose it.

  multilineVars.localTranspose = (multilineVars.globalTranspose ? multilineVars.globalTranspose : 0) + localTranspose;
  if (!multilineVars.localTranspose) return {
    accidentals: k,
    root: root,
    acc: acc
  };
  multilineVars.globalTransposeOrigKeySig = k;

  if (multilineVars.localTranspose % 12 === 0) {
    multilineVars.localTransposeVerticalMovement = multilineVars.localTranspose / 12 * 7;
    return {
      accidentals: k,
      root: root,
      acc: acc
    };
  }

  var baseKey = keyName[0];

  if (keyName[1] === 'b' || keyName[1] === '#') {
    baseKey += keyName[1];
    keyName = keyName.substr(2);
  } else keyName = keyName.substr(1);

  var index = keyIndex[baseKey] + multilineVars.localTranspose;

  while (index < 0) {
    index += 12;
  }

  if (index > 11) index = index % 12;
  var newKeyName = keyName[0] === 'm' ? newKeyMinor[index] : newKey[index];
  var transposedKey = newKeyName + keyName;
  var newKeySig = keys[transposedKey];
  if (newKeySig.length > 0 && newKeySig[0].acc === 'flat') multilineVars.localTransposePreferFlats = true;
  var distance = transposedKey.charCodeAt(0) - baseKey.charCodeAt(0);

  if (multilineVars.localTranspose > 0) {
    if (distance < 0) distance += 7;else if (distance === 0) {
      // There's a funny thing that happens when the key changes only an accidental's distance, for instance, from Ab to A.
      // If the distance is positive (we are raising pitch), and the change is higher (that is, Ab -> A), then raise an octave.
      // This test is easier because we know the keys are not equal (or we wouldn't get this far), so if the base key is a flat key, then
      // the transposed key must be higher. Likewise, if the transposed key is sharp, then the base key must be lower. And one
      // of those two things must be true because they are not both natural.
      if (baseKey[1] === '#' || transposedKey[1] === 'b') distance += 7;
    }
  } else if (multilineVars.localTranspose < 0) {
    if (distance > 0) distance -= 7;else if (distance === 0) {
      // There's a funny thing that happens when the key changes only an accidental's distance, for instance, from Ab to A.
      // If the distance is negative (we are dropping pitch), and the change is lower (that is, A -> Ab), then drop an octave.
      if (baseKey[1] === 'b' || transposedKey[1] === '#') distance -= 7;
    }
  }

  if (multilineVars.localTranspose > 0) multilineVars.localTransposeVerticalMovement = distance + Math.floor(multilineVars.localTranspose / 12) * 7;else multilineVars.localTransposeVerticalMovement = distance + Math.ceil(multilineVars.localTranspose / 12) * 7;
  return {
    accidentals: newKeySig,
    root: newKeyName[0],
    acc: newKeyName.length > 1 ? newKeyName[1] : ""
  };
};

var sharpChords = ['C', 'C♯', 'D', "D♯", 'E', 'F', "F♯", 'G', 'G♯', 'A', 'A♯', 'B'];
var flatChords = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
var sharpChordsFree = ['C', 'C#', 'D', "D#", 'E', 'F', "F#", 'G', 'G#', 'A', 'A#', 'B'];
var flatChordsFree = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

transpose.chordName = function (multilineVars, chord) {
  if (multilineVars.localTranspose && multilineVars.localTranspose % 12 !== 0) {
    // The chords are the same if it is an exact octave change.
    var transposeFactor = multilineVars.localTranspose;

    while (transposeFactor < 0) {
      transposeFactor += 12;
    }

    if (transposeFactor > 11) transposeFactor = transposeFactor % 12;

    if (multilineVars.freegchord) {
      chord = chord.replace(/Cb/g, "`~11`");
      chord = chord.replace(/Db/g, "`~1`");
      chord = chord.replace(/Eb/g, "`~3`");
      chord = chord.replace(/Fb/g, "`~4`");
      chord = chord.replace(/Gb/g, "`~6`");
      chord = chord.replace(/Ab/g, "`~8`");
      chord = chord.replace(/Bb/g, "`~10`");
      chord = chord.replace(/C#/g, "`~1`");
      chord = chord.replace(/D#/g, "`~3`");
      chord = chord.replace(/E#/g, "`~5`");
      chord = chord.replace(/F#/g, "`~6`");
      chord = chord.replace(/G#/g, "`~8`");
      chord = chord.replace(/A#/g, "`~10`");
      chord = chord.replace(/B#/g, "`~0`");
    } else {
      chord = chord.replace(/C♭/g, "`~11`");
      chord = chord.replace(/D♭/g, "`~1`");
      chord = chord.replace(/E♭/g, "`~3`");
      chord = chord.replace(/F♭/g, "`~4`");
      chord = chord.replace(/G♭/g, "`~6`");
      chord = chord.replace(/A♭/g, "`~8`");
      chord = chord.replace(/B♭/g, "`~10`");
      chord = chord.replace(/C♯/g, "`~1`");
      chord = chord.replace(/D♯/g, "`~3`");
      chord = chord.replace(/E♯/g, "`~5`");
      chord = chord.replace(/F♯/g, "`~6`");
      chord = chord.replace(/G♯/g, "`~8`");
      chord = chord.replace(/A♯/g, "`~10`");
      chord = chord.replace(/B♯/g, "`~0`");
    }

    chord = chord.replace(/C/g, "`~0`");
    chord = chord.replace(/D/g, "`~2`");
    chord = chord.replace(/E/g, "`~4`");
    chord = chord.replace(/F/g, "`~5`");
    chord = chord.replace(/G/g, "`~7`");
    chord = chord.replace(/A/g, "`~9`");
    chord = chord.replace(/B/g, "`~11`");
    var arr = chord.split("`");

    for (var i = 0; i < arr.length; i++) {
      if (arr[i][0] === '~') {
        var chordNum = parseInt(arr[i].substr(1), 10);
        chordNum += transposeFactor;
        if (chordNum > 11) chordNum -= 12;
        if (multilineVars.freegchord) arr[i] = multilineVars.localTransposePreferFlats ? flatChordsFree[chordNum] : sharpChordsFree[chordNum];else arr[i] = multilineVars.localTransposePreferFlats ? flatChords[chordNum] : sharpChords[chordNum];
      }
    }

    chord = arr.join("");
  }

  return chord;
};

var pitchToLetter = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

function accidentalChange(origPitch, newPitch, accidental, origKeySig, newKeySig) {
  var origPitchLetter = pitchToLetter[(origPitch + 49) % 7]; // Make sure it is a positive pitch before normalizing.

  var origAccidental = 0;

  for (var i = 0; i < origKeySig.length; i++) {
    if (origKeySig[i].note.toLowerCase() === origPitchLetter) origAccidental = accidentals[origKeySig[i].acc];
  }

  var currentAccidental = accidentals[accidental];
  var delta = currentAccidental - origAccidental;
  var newPitchLetter = pitchToLetter[(newPitch + 49) % 7]; // Make sure it is a positive pitch before normalizing.

  var newAccidental = 0;

  for (var j = 0; j < newKeySig.accidentals.length; j++) {
    if (newKeySig.accidentals[j].note.toLowerCase() === newPitchLetter) newAccidental = accidentals[newKeySig.accidentals[j].acc];
  }

  var calcAccidental = delta + newAccidental;

  if (calcAccidental < -2) {
    newPitch--;
    calcAccidental += newPitchLetter === 'c' || newPitchLetter === 'f' ? 1 : 2;
  }

  if (calcAccidental > 2) {
    newPitch++;
    calcAccidental -= newPitchLetter === 'b' || newPitchLetter === 'e' ? 1 : 2;
  }

  return [newPitch, calcAccidental];
}

var accidentals = {
  dblflat: -2,
  flat: -1,
  natural: 0,
  sharp: 1,
  dblsharp: 2
};
var accidentals2 = {
  "-2": "dblflat",
  "-1": "flat",
  "0": "natural",
  "1": "sharp",
  "2": "dblsharp"
};

transpose.note = function (multilineVars, el) {
  // the "el" that is passed in has el.accidental, and el.pitch. "pitch" is the vertical position (0=middle C)
  // localTranspose is the number of half steps
  // localTransposeVerticalMovement is the vertical distance to move.
  if (!multilineVars.localTranspose || multilineVars.clef.type === "perc") return;
  var origPitch = el.pitch;
  el.pitch = el.pitch + multilineVars.localTransposeVerticalMovement;

  if (el.accidental) {
    var ret = accidentalChange(origPitch, el.pitch, el.accidental, multilineVars.globalTransposeOrigKeySig, multilineVars.targetKey);
    el.pitch = ret[0];
    el.accidental = accidentals2[ret[1]];
  }
};

module.exports = transpose;

/***/ }),

/***/ "./src/parse/tune-builder.js":
/*!***********************************!*\
  !*** ./src/parse/tune-builder.js ***!
  \***********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var parseKeyVoice = __webpack_require__(/*! ../parse/abc_parse_key_voice */ "./src/parse/abc_parse_key_voice.js");

var parseCommon = __webpack_require__(/*! ../parse/abc_common */ "./src/parse/abc_common.js");

var TuneBuilder = function TuneBuilder(tune) {
  var self = this;

  this.reset = function () {
    tune.version = "1.1.0";
    tune.media = "screen";
    tune.metaText = {};
    tune.formatting = {
      midi: {
        drummap: {
          p: 38,
          q: 38
        }
      }
    };
    tune.lines = [];
    tune.staffNum = 0;
    tune.voiceNum = 0;
    tune.lineNum = 0;
    tune.runningFonts = {};
    delete tune.visualTranspose;
  };

  this.setVisualTranspose = function (visualTranspose) {
    if (visualTranspose) tune.visualTranspose = visualTranspose;
  };

  this.resolveOverlays = function () {
    var madeChanges = false;
    var durationsPerLines = [];

    for (var i = 0; i < tune.lines.length; i++) {
      var line = tune.lines[i];

      if (line.staff) {
        for (var j = 0; j < line.staff.length; j++) {
          var staff = line.staff[j];
          var overlayVoice = [];

          for (var k = 0; k < staff.voices.length; k++) {
            var voice = staff.voices[k];
            overlayVoice.push({
              hasOverlay: false,
              voice: [],
              snip: []
            });
            durationsPerLines[i] = 0;
            var durationThisBar = 0;
            var inOverlay = false;
            var overlayDuration = 0;
            var snipStart = -1;

            for (var kk = 0; kk < voice.length; kk++) {
              var event = voice[kk];

              if (event.el_type === "overlay" && !inOverlay) {
                madeChanges = true;
                inOverlay = true;
                snipStart = kk;
                overlayVoice[k].hasOverlay = true;
                if (overlayDuration === 0) overlayDuration = durationsPerLines[i]; // If this isn't the first line, we also need invisible rests on the previous lines.
                // So, if the next voice doesn't appear in a previous line, create it

                for (var ii = 0; ii < i; ii++) {
                  if (durationsPerLines[ii] && tune.lines[ii].staff && staff.voices.length >= tune.lines[ii].staff[0].voices.length) {
                    tune.lines[ii].staff[0].voices.push([{
                      el_type: "note",
                      duration: durationsPerLines[ii],
                      rest: {
                        type: "invisible"
                      },
                      startChar: event.startChar,
                      endChar: event.endChar
                    }]);
                  }
                }
              } else if (event.el_type === "bar") {
                if (inOverlay) {
                  // delete the overlay events from this array without messing up this loop.
                  inOverlay = false;
                  overlayVoice[k].snip.push({
                    start: snipStart,
                    len: kk - snipStart
                  });
                  overlayVoice[k].voice.push(event); // Also end the overlay with the barline.
                } else {
                  // This keeps the voices lined up: if the overlay isn't in the first measure then we need a bunch of invisible rests.
                  if (durationThisBar > 0) overlayVoice[k].voice.push({
                    el_type: "note",
                    duration: durationThisBar,
                    rest: {
                      type: "invisible"
                    },
                    startChar: event.startChar,
                    endChar: event.endChar
                  });
                  overlayVoice[k].voice.push(event);
                }

                durationThisBar = 0;
              } else if (event.el_type === "note") {
                if (inOverlay) {
                  overlayVoice[k].voice.push(event);
                } else {
                  durationThisBar += event.duration;
                  durationsPerLines[i] += event.duration;
                }
              } else if (event.el_type === "scale" || event.el_type === "stem" || event.el_type === "overlay" || event.el_type === "style" || event.el_type === "transpose") {
                // These types of events are duplicated on the overlay layer.
                overlayVoice[k].voice.push(event);
              }
            }

            if (overlayVoice[k].hasOverlay && overlayVoice[k].snip.length === 0) {
              // there was no closing bar, so we didn't set the snip amount.
              overlayVoice[k].snip.push({
                start: snipStart,
                len: voice.length - snipStart
              });
            }
          }

          for (k = 0; k < overlayVoice.length; k++) {
            var ov = overlayVoice[k];

            if (ov.hasOverlay) {
              ov.voice.splice(0, 0, {
                el_type: "stem",
                direction: "down"
              });
              staff.voices.push(ov.voice);

              for (var kkk = ov.snip.length - 1; kkk >= 0; kkk--) {
                var snip = ov.snip[kkk];
                staff.voices[k].splice(snip.start, snip.len);
                staff.voices[k].splice(snip.start + 1, 0, {
                  el_type: "stem",
                  direction: "auto"
                });
                var indexOfLastBar = findLastBar(staff.voices[k], snip.start);
                staff.voices[k].splice(indexOfLastBar, 0, {
                  el_type: "stem",
                  direction: "up"
                });
              } // remove ending marks from the overlay voice so they are not repeated


              for (kkk = 0; kkk < staff.voices[staff.voices.length - 1].length; kkk++) {
                staff.voices[staff.voices.length - 1][kkk] = parseCommon.clone(staff.voices[staff.voices.length - 1][kkk]);
                var el = staff.voices[staff.voices.length - 1][kkk];

                if (el.el_type === 'bar' && el.startEnding) {
                  delete el.startEnding;
                }

                if (el.el_type === 'bar' && el.endEnding) delete el.endEnding;
              }
            }
          }
        }
      }
    }

    return madeChanges;
  };

  function findLastBar(voice, start) {
    for (var i = start - 1; i > 0 && voice[i].el_type !== "bar"; i--) {}

    return i;
  }

  function fixTitles(lines) {
    // We might have name and subname defined. We now know what line everything is on, so we can determine which to use.
    var firstMusicLine = true;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      if (line.staff) {
        for (var j = 0; j < line.staff.length; j++) {
          var staff = line.staff[j];

          if (staff.title) {
            var hasATitle = false;

            for (var k = 0; k < staff.title.length; k++) {
              if (staff.title[k]) {
                staff.title[k] = firstMusicLine ? staff.title[k].name : staff.title[k].subname;
                if (staff.title[k]) hasATitle = true;else staff.title[k] = '';
              } else staff.title[k] = '';
            }

            if (!hasATitle) delete staff.title;
          }
        }

        firstMusicLine = false;
      }
    }
  }

  this.cleanUp = function (barsperstaff, staffnonote, currSlur) {
    this.closeLine(); // Close the last line.

    delete tune.runningFonts; // If the tempo was created with a string like "Allegro", then the duration of a beat needs to be set at the last moment, when it is most likely known.

    if (tune.metaText.tempo && tune.metaText.tempo.bpm && !tune.metaText.tempo.duration) tune.metaText.tempo.duration = [tune.getBeatLength()]; // Remove any blank lines

    var anyDeleted = false;
    var i, s, v;

    for (i = 0; i < tune.lines.length; i++) {
      if (tune.lines[i].staff !== undefined) {
        var hasAny = false;

        for (s = 0; s < tune.lines[i].staff.length; s++) {
          if (tune.lines[i].staff[s] === undefined) {
            anyDeleted = true;
            tune.lines[i].staff[s] = null; //tune.lines[i].staff[s] = { voices: []};	// TODO-PER: There was a part missing in the abc music. How should we recover?
          } else {
            for (v = 0; v < tune.lines[i].staff[s].voices.length; v++) {
              if (tune.lines[i].staff[s].voices[v] === undefined) tune.lines[i].staff[s].voices[v] = []; // TODO-PER: There was a part missing in the abc music. How should we recover?
              else if (this.containsNotes(tune.lines[i].staff[s].voices[v])) hasAny = true;
            }
          }
        }

        if (!hasAny) {
          tune.lines[i] = null;
          anyDeleted = true;
        }
      }
    }

    if (anyDeleted) {
      tune.lines = parseCommon.compact(tune.lines);
      parseCommon.each(tune.lines, function (line) {
        if (line.staff) line.staff = parseCommon.compact(line.staff);
      });
    } // if we exceeded the number of bars allowed on a line, then force a new line


    if (barsperstaff) {
      while (wrapMusicLines(tune.lines, barsperstaff)) {// This will keep wrapping until the end of the piece.
      }
    } // If we were passed staffnonote, then we want to get rid of all staffs that contain only rests.


    if (staffnonote) {
      anyDeleted = false;

      for (i = 0; i < tune.lines.length; i++) {
        if (tune.lines[i].staff !== undefined) {
          for (s = 0; s < tune.lines[i].staff.length; s++) {
            var keepThis = false;

            for (v = 0; v < tune.lines[i].staff[s].voices.length; v++) {
              if (this.containsNotesStrict(tune.lines[i].staff[s].voices[v])) {
                keepThis = true;
              }
            }

            if (!keepThis) {
              anyDeleted = true;
              tune.lines[i].staff[s] = null;
            }
          }
        }
      }

      if (anyDeleted) {
        parseCommon.each(tune.lines, function (line) {
          if (line.staff) line.staff = parseCommon.compact(line.staff);
        });
      }
    }

    fixTitles(tune.lines); // Remove the temporary working variables

    for (i = 0; i < tune.lines.length; i++) {
      if (tune.lines[i].staff) {
        for (s = 0; s < tune.lines[i].staff.length; s++) {
          delete tune.lines[i].staff[s].workingClef;
        }
      }
    } // If there are overlays, create new voices for them.


    while (this.resolveOverlays()) {// keep resolving overlays as long as any are found.
    }

    function cleanUpSlursInLine(line, staffNum, voiceNum) {
      if (!currSlur[staffNum]) currSlur[staffNum] = [];
      if (!currSlur[staffNum][voiceNum]) currSlur[staffNum][voiceNum] = [];
      var x; //			var lyr = null;	// TODO-PER: debugging.

      var addEndSlur = function addEndSlur(obj, num, chordPos) {
        if (currSlur[staffNum][voiceNum][chordPos] === undefined) {
          // There isn't an exact match for note position, but we'll take any other open slur.
          for (x = 0; x < currSlur[staffNum][voiceNum].length; x++) {
            if (currSlur[staffNum][voiceNum][x] !== undefined) {
              chordPos = x;
              break;
            }
          }

          if (currSlur[staffNum][voiceNum][chordPos] === undefined) {
            var offNum = chordPos * 100 + 1;
            parseCommon.each(obj.endSlur, function (x) {
              if (offNum === x) --offNum;
            });
            currSlur[staffNum][voiceNum][chordPos] = [offNum];
          }
        }

        var slurNum;

        for (var i = 0; i < num; i++) {
          slurNum = currSlur[staffNum][voiceNum][chordPos].pop();
          obj.endSlur.push(slurNum); //					lyr.syllable += '<' + slurNum;	// TODO-PER: debugging
        }

        if (currSlur[staffNum][voiceNum][chordPos].length === 0) delete currSlur[staffNum][voiceNum][chordPos];
        return slurNum;
      };

      var addStartSlur = function addStartSlur(obj, num, chordPos, usedNums) {
        obj.startSlur = [];

        if (currSlur[staffNum][voiceNum][chordPos] === undefined) {
          currSlur[staffNum][voiceNum][chordPos] = [];
        }

        var nextNum = chordPos * 100 + 1;

        for (var i = 0; i < num; i++) {
          if (usedNums) {
            parseCommon.each(usedNums, function (x) {
              if (nextNum === x) ++nextNum;
            });
            parseCommon.each(usedNums, function (x) {
              if (nextNum === x) ++nextNum;
            });
            parseCommon.each(usedNums, function (x) {
              if (nextNum === x) ++nextNum;
            });
          }

          parseCommon.each(currSlur[staffNum][voiceNum][chordPos], function (x) {
            if (nextNum === x) ++nextNum;
          });
          parseCommon.each(currSlur[staffNum][voiceNum][chordPos], function (x) {
            if (nextNum === x) ++nextNum;
          });
          currSlur[staffNum][voiceNum][chordPos].push(nextNum);
          obj.startSlur.push({
            label: nextNum
          });

          if (obj.dottedSlur) {
            obj.startSlur[obj.startSlur.length - 1].style = 'dotted';
            delete obj.dottedSlur;
          } //					lyr.syllable += ' ' + nextNum + '>';	// TODO-PER:debugging


          nextNum++;
        }
      };

      for (var i = 0; i < line.length; i++) {
        var el = line[i]; //				if (el.lyric === undefined)	// TODO-PER: debugging
        //					el.lyric = [{ divider: '-' }];	// TODO-PER: debugging
        //				lyr = el.lyric[0];	// TODO-PER: debugging
        //				lyr.syllable = '';	// TODO-PER: debugging

        if (el.el_type === 'note') {
          if (el.gracenotes) {
            for (var g = 0; g < el.gracenotes.length; g++) {
              if (el.gracenotes[g].endSlur) {
                var gg = el.gracenotes[g].endSlur;
                el.gracenotes[g].endSlur = [];

                for (var ggg = 0; ggg < gg; ggg++) {
                  addEndSlur(el.gracenotes[g], 1, 20);
                }
              }

              if (el.gracenotes[g].startSlur) {
                x = el.gracenotes[g].startSlur;
                addStartSlur(el.gracenotes[g], x, 20);
              }
            }
          }

          if (el.endSlur) {
            x = el.endSlur;
            el.endSlur = [];
            addEndSlur(el, x, 0);
          }

          if (el.startSlur) {
            x = el.startSlur;
            addStartSlur(el, x, 0);
          }

          if (el.pitches) {
            var usedNums = [];

            for (var p = 0; p < el.pitches.length; p++) {
              if (el.pitches[p].endSlur) {
                var k = el.pitches[p].endSlur;
                el.pitches[p].endSlur = [];

                for (var j = 0; j < k; j++) {
                  var slurNum = addEndSlur(el.pitches[p], 1, p + 1);
                  usedNums.push(slurNum);
                }
              }
            }

            for (p = 0; p < el.pitches.length; p++) {
              if (el.pitches[p].startSlur) {
                x = el.pitches[p].startSlur;
                addStartSlur(el.pitches[p], x, p + 1, usedNums);
              }
            } // Correct for the weird gracenote case where ({g}a) should match.
            // The end slur was already assigned to the note, and needs to be moved to the first note of the graces.


            if (el.gracenotes && el.pitches[0].endSlur && el.pitches[0].endSlur[0] === 100 && el.pitches[0].startSlur) {
              if (el.gracenotes[0].endSlur) el.gracenotes[0].endSlur.push(el.pitches[0].startSlur[0].label);else el.gracenotes[0].endSlur = [el.pitches[0].startSlur[0].label];
              if (el.pitches[0].endSlur.length === 1) delete el.pitches[0].endSlur;else if (el.pitches[0].endSlur[0] === 100) el.pitches[0].endSlur.shift();else if (el.pitches[0].endSlur[el.pitches[0].endSlur.length - 1] === 100) el.pitches[0].endSlur.pop();
              if (currSlur[staffNum][voiceNum][1].length === 1) delete currSlur[staffNum][voiceNum][1];else currSlur[staffNum][voiceNum][1].pop();
            }
          }
        }
      }
    } // TODO-PER: This could be done faster as we go instead of as the last step.


    function fixClefPlacement(el) {
      parseKeyVoice.fixClef(el);
    }

    function wrapMusicLines(lines, barsperstaff) {
      for (i = 0; i < lines.length; i++) {
        if (lines[i].staff !== undefined) {
          for (s = 0; s < lines[i].staff.length; s++) {
            var permanentItems = [];

            for (v = 0; v < lines[i].staff[s].voices.length; v++) {
              var voice = lines[i].staff[s].voices[v];
              var barNumThisLine = 0;

              for (var n = 0; n < voice.length; n++) {
                if (voice[n].el_type === 'bar') {
                  barNumThisLine++;

                  if (barNumThisLine >= barsperstaff) {
                    // push everything else to the next line, if there is anything else,
                    // and there is a next line. If there isn't a next line, create one.
                    if (n < voice.length - 1) {
                      var nextLine = getNextMusicLine(lines, i);

                      if (!nextLine) {
                        var cp = JSON.parse(JSON.stringify(lines[i]));
                        lines.push(parseCommon.clone(cp));
                        nextLine = lines[lines.length - 1];

                        for (var ss = 0; ss < nextLine.staff.length; ss++) {
                          for (var vv = 0; vv < nextLine.staff[ss].voices.length; vv++) {
                            nextLine.staff[ss].voices[vv] = [];
                          }
                        }
                      }

                      var startElement = n + 1;
                      var section = lines[i].staff[s].voices[v].slice(startElement);
                      lines[i].staff[s].voices[v] = lines[i].staff[s].voices[v].slice(0, startElement);
                      nextLine.staff[s].voices[v] = permanentItems.concat(section.concat(nextLine.staff[s].voices[v]));
                      return true;
                    }
                  }
                } else if (!voice[n].duration) {
                  permanentItems.push(voice[n]);
                }
              }
            }
          }
        }
      }

      return false;
    }

    function getNextMusicLine(lines, currentLine) {
      currentLine++;

      while (lines.length > currentLine) {
        if (lines[currentLine].staff) return lines[currentLine];
        currentLine++;
      }

      return null;
    }

    for (tune.lineNum = 0; tune.lineNum < tune.lines.length; tune.lineNum++) {
      var staff = tune.lines[tune.lineNum].staff;

      if (staff) {
        for (tune.staffNum = 0; tune.staffNum < staff.length; tune.staffNum++) {
          if (staff[tune.staffNum].clef) fixClefPlacement(staff[tune.staffNum].clef);

          for (tune.voiceNum = 0; tune.voiceNum < staff[tune.staffNum].voices.length; tune.voiceNum++) {
            var voice = staff[tune.staffNum].voices[tune.voiceNum];
            cleanUpSlursInLine(voice, tune.staffNum, tune.voiceNum);

            for (var j = 0; j < voice.length; j++) {
              if (voice[j].el_type === 'clef') fixClefPlacement(voice[j]);
            }

            if (voice.length > 0 && voice[voice.length - 1].barNumber) {
              // Don't hang a bar number on the last bar line: it should go on the next line.
              var nextLine = getNextMusicLine(tune.lines, tune.lineNum);
              if (nextLine) nextLine.staff[0].barNumber = voice[voice.length - 1].barNumber;
              delete voice[voice.length - 1].barNumber;
            }
          }
        }
      }
    } // Remove temporary variables that the outside doesn't need to know about


    delete tune.staffNum;
    delete tune.voiceNum;
    delete tune.lineNum;
    delete tune.potentialStartBeam;
    delete tune.potentialEndBeam;
    delete tune.vskipPending;
    return currSlur;
  };

  this.reset();

  this.getLastNote = function () {
    if (tune.lines[tune.lineNum] && tune.lines[tune.lineNum].staff && tune.lines[tune.lineNum].staff[tune.staffNum] && tune.lines[tune.lineNum].staff[tune.staffNum].voices[tune.voiceNum]) {
      for (var i = tune.lines[tune.lineNum].staff[tune.staffNum].voices[tune.voiceNum].length - 1; i >= 0; i--) {
        var el = tune.lines[tune.lineNum].staff[tune.staffNum].voices[tune.voiceNum][i];

        if (el.el_type === 'note') {
          return el;
        }
      }
    }

    return null;
  };

  this.addTieToLastNote = function (dottedTie) {
    // TODO-PER: if this is a chord, which note?
    var el = this.getLastNote();

    if (el && el.pitches && el.pitches.length > 0) {
      el.pitches[0].startTie = {};
      if (dottedTie) el.pitches[0].startTie.style = 'dotted';
      return true;
    }

    return false;
  };

  this.getDuration = function (el) {
    if (el.duration) return el.duration; //if (el.pitches && el.pitches.length > 0) return el.pitches[0].duration;

    return 0;
  };

  this.closeLine = function () {
    if (tune.potentialStartBeam && tune.potentialEndBeam) {
      tune.potentialStartBeam.startBeam = true;
      tune.potentialEndBeam.endBeam = true;
    }

    delete tune.potentialStartBeam;
    delete tune.potentialEndBeam;
  };

  this.appendElement = function (type, startChar, endChar, hashParams) {
    var This = tune;

    var pushNote = function pushNote(hp) {
      var currStaff = This.lines[This.lineNum].staff[This.staffNum];

      if (!currStaff) {
        // TODO-PER: This prevents a crash, but it drops the element. Need to figure out how to start a new line, or delay adding this.
        return;
      }

      if (hp.pitches !== undefined) {
        var mid = currStaff.workingClef.verticalPos;
        parseCommon.each(hp.pitches, function (p) {
          p.verticalPos = p.pitch - mid;
        });
      }

      if (hp.gracenotes !== undefined) {
        var mid2 = currStaff.workingClef.verticalPos;
        parseCommon.each(hp.gracenotes, function (p) {
          p.verticalPos = p.pitch - mid2;
        });
      }

      currStaff.voices[This.voiceNum].push(hp);
    };

    hashParams.el_type = type;
    if (startChar !== null) hashParams.startChar = startChar;
    if (endChar !== null) hashParams.endChar = endChar;

    var endBeamHere = function endBeamHere() {
      This.potentialStartBeam.startBeam = true;
      hashParams.endBeam = true;
      delete This.potentialStartBeam;
      delete This.potentialEndBeam;
    };

    var endBeamLast = function endBeamLast() {
      if (This.potentialStartBeam !== undefined && This.potentialEndBeam !== undefined) {
        // Do we have a set of notes to beam?
        This.potentialStartBeam.startBeam = true;
        This.potentialEndBeam.endBeam = true;
      }

      delete This.potentialStartBeam;
      delete This.potentialEndBeam;
    };

    if (type === 'note') {
      // && (hashParams.rest !== undefined || hashParams.end_beam === undefined)) {
      // Now, add the startBeam and endBeam where it is needed.
      // end_beam is already set on the places where there is a forced end_beam. We'll remove that here after using that info.
      // this.potentialStartBeam either points to null or the start beam.
      // this.potentialEndBeam either points to null or the start beam.
      // If we have a beam break (note is longer than a quarter, or an end_beam is on this element), then set the beam if we have one.
      // reset the variables for the next notes.
      var dur = self.getDuration(hashParams);

      if (dur >= 0.25) {
        // The beam ends on the note before this.
        endBeamLast();
      } else if (hashParams.force_end_beam_last && This.potentialStartBeam !== undefined) {
        endBeamLast();
      } else if (hashParams.end_beam && This.potentialStartBeam !== undefined) {
        // the beam is forced to end on this note, probably because of a space in the ABC
        if (hashParams.rest === undefined) endBeamHere();else endBeamLast();
      } else if (hashParams.rest === undefined) {
        // this a short note and we aren't about to end the beam
        if (This.potentialStartBeam === undefined) {
          // We aren't collecting notes for a beam, so start here.
          if (!hashParams.end_beam) {
            This.potentialStartBeam = hashParams;
            delete This.potentialEndBeam;
          }
        } else {
          This.potentialEndBeam = hashParams; // Continue the beaming, look for the end next note.
        }
      } //  end_beam goes on rests and notes which precede rests _except_ when a rest (or set of adjacent rests) has normal notes on both sides (no spaces)
      //			if (hashParams.rest !== undefined)
      //			{
      //				hashParams.end_beam = true;
      //				var el2 = this.getLastNote();
      //				if (el2) el2.end_beam = true;
      //				// TODO-PER: implement exception mentioned in the comment.
      //			}

    } else {
      // It's not a note, so there definitely isn't beaming after it.
      endBeamLast();
    }

    delete hashParams.end_beam; // We don't want this temporary variable hanging around.

    delete hashParams.force_end_beam_last; // We don't want this temporary variable hanging around.

    pushNote(hashParams);
  };

  this.appendStartingElement = function (type, startChar, endChar, hashParams2) {
    // If we're in the middle of beaming, then end the beam.
    this.closeLine(); // We only ever want implied naturals the first time.

    var impliedNaturals;

    if (type === 'key') {
      impliedNaturals = hashParams2.impliedNaturals;
      delete hashParams2.impliedNaturals;
      delete hashParams2.explicitAccidentals;
    } // Clone the object because it will be sticking around for the next line and we don't want the extra fields in it.


    var hashParams = parseCommon.clone(hashParams2);

    if (tune.lines[tune.lineNum] && tune.lines[tune.lineNum].staff) {
      // be sure that we are on a music type line before doing the following.
      // If tune is the first item in tune staff, then we might have to initialize the staff, first.
      if (tune.lines[tune.lineNum].staff.length <= tune.staffNum) {
        tune.lines[tune.lineNum].staff[tune.staffNum] = {};
        tune.lines[tune.lineNum].staff[tune.staffNum].clef = parseCommon.clone(tune.lines[tune.lineNum].staff[0].clef);
        tune.lines[tune.lineNum].staff[tune.staffNum].key = parseCommon.clone(tune.lines[tune.lineNum].staff[0].key);
        if (tune.lines[tune.lineNum].staff[0].meter) tune.lines[tune.lineNum].staff[tune.staffNum].meter = parseCommon.clone(tune.lines[tune.lineNum].staff[0].meter);
        tune.lines[tune.lineNum].staff[tune.staffNum].workingClef = parseCommon.clone(tune.lines[tune.lineNum].staff[0].workingClef);
        tune.lines[tune.lineNum].staff[tune.staffNum].voices = [[]];
      } // If tune is a clef type, then we replace the working clef on the line. This is kept separate from
      // the clef in case there is an inline clef field. We need to know what the current position for
      // the note is.


      if (type === 'clef') {
        tune.lines[tune.lineNum].staff[tune.staffNum].workingClef = hashParams;
      } // These elements should not be added twice, so if the element exists on tune line without a note or bar before it, just replace the staff version.


      var voice = tune.lines[tune.lineNum].staff[tune.staffNum].voices[tune.voiceNum];

      for (var i = 0; i < voice.length; i++) {
        if (voice[i].el_type === 'note' || voice[i].el_type === 'bar') {
          hashParams.el_type = type;
          hashParams.startChar = startChar;
          hashParams.endChar = endChar;
          if (impliedNaturals) hashParams.accidentals = impliedNaturals.concat(hashParams.accidentals);
          voice.push(hashParams);
          return;
        }

        if (voice[i].el_type === type) {
          hashParams.el_type = type;
          hashParams.startChar = startChar;
          hashParams.endChar = endChar;
          if (impliedNaturals) hashParams.accidentals = impliedNaturals.concat(hashParams.accidentals);
          voice[i] = hashParams;
          return;
        }
      } // We didn't see either that type or a note, so replace the element to the staff.


      tune.lines[tune.lineNum].staff[tune.staffNum][type] = hashParams2;
    }
  };

  this.pushLine = function (hash) {
    if (tune.vskipPending) {
      hash.vskip = tune.vskipPending;
      delete tune.vskipPending;
    }

    tune.lines.push(hash);
  };

  this.addSubtitle = function (str) {
    this.pushLine({
      subtitle: str
    });
  };

  this.addSpacing = function (num) {
    tune.vskipPending = num;
  };

  this.addNewPage = function (num) {
    this.pushLine({
      newpage: num
    });
  };

  this.addSeparator = function (spaceAbove, spaceBelow, lineLength) {
    this.pushLine({
      separator: {
        spaceAbove: Math.round(spaceAbove),
        spaceBelow: Math.round(spaceBelow),
        lineLength: Math.round(lineLength)
      }
    });
  };

  this.addText = function (str) {
    this.pushLine({
      text: str
    });
  };

  this.addCentered = function (str) {
    this.pushLine({
      text: [{
        text: str,
        center: true
      }]
    });
  };

  this.containsNotes = function (voice) {
    for (var i = 0; i < voice.length; i++) {
      if (voice[i].el_type === 'note' || voice[i].el_type === 'bar') return true;
    }

    return false;
  };

  this.containsNotesStrict = function (voice) {
    for (var i = 0; i < voice.length; i++) {
      if (voice[i].el_type === 'note' && voice[i].rest === undefined) return true;
    }

    return false;
  }; //	anyVoiceContainsNotes: function(line) {
  //		for (var i = 0; i < line.staff.voices.length; i++) {
  //			if (this.containsNotes(line.staff.voices[i]))
  //				return true;
  //		}
  //		return false;
  //	},


  this.changeVoiceScale = function (scale) {
    self.appendElement('scale', null, null, {
      size: scale
    });
  };

  this.startNewLine = function (params) {
    // If the pointed to line doesn't exist, just create that. If the line does exist, but doesn't have any music on it, just use it.
    // If it does exist and has music, then increment the line number. If the new element doesn't exist, create it.
    var This = tune;
    this.closeLine(); // Close the previous line.

    var createVoice = function createVoice(params) {
      var thisStaff = This.lines[This.lineNum].staff[This.staffNum];
      thisStaff.voices[This.voiceNum] = [];
      if (!thisStaff.title) thisStaff.title = [];
      thisStaff.title[This.voiceNum] = {
        name: params.name,
        subname: params.subname
      };
      if (params.style) self.appendElement('style', null, null, {
        head: params.style
      });
      if (params.stem) self.appendElement('stem', null, null, {
        direction: params.stem
      });else if (This.voiceNum > 0) {
        if (thisStaff.voices[0] !== undefined) {
          var found = false;

          for (var i = 0; i < thisStaff.voices[0].length; i++) {
            if (thisStaff.voices[0].el_type === 'stem') found = true;
          }

          if (!found) {
            var stem = {
              el_type: 'stem',
              direction: 'up'
            };
            thisStaff.voices[0].splice(0, 0, stem);
          }
        }

        self.appendElement('stem', null, null, {
          direction: 'down'
        });
      }
      if (params.scale) self.appendElement('scale', null, null, {
        size: params.scale
      });
    };

    var createStaff = function createStaff(params) {
      if (params.key && params.key.impliedNaturals) {
        params.key.accidentals = params.key.accidentals.concat(params.key.impliedNaturals);
        delete params.key.impliedNaturals;
      }

      This.lines[This.lineNum].staff[This.staffNum] = {
        voices: [],
        clef: params.clef,
        key: params.key,
        workingClef: params.clef
      };

      if (params.stafflines !== undefined) {
        This.lines[This.lineNum].staff[This.staffNum].clef.stafflines = params.stafflines;
        This.lines[This.lineNum].staff[This.staffNum].workingClef.stafflines = params.stafflines;
      }

      if (params.staffscale) {
        This.lines[This.lineNum].staff[This.staffNum].staffscale = params.staffscale;
      }

      if (params.annotationfont) self.setLineFont("annotationfont", params.annotationfont);
      if (params.gchordfont) self.setLineFont("gchordfont", params.gchordfont);
      if (params.tripletfont) self.setLineFont("tripletfont", params.tripletfont);
      if (params.vocalfont) self.setLineFont("vocalfont", params.vocalfont);
      if (params.bracket) This.lines[This.lineNum].staff[This.staffNum].bracket = params.bracket;
      if (params.brace) This.lines[This.lineNum].staff[This.staffNum].brace = params.brace;
      if (params.connectBarLines) This.lines[This.lineNum].staff[This.staffNum].connectBarLines = params.connectBarLines;
      if (params.barNumber) This.lines[This.lineNum].staff[This.staffNum].barNumber = params.barNumber;
      createVoice(params); // Some stuff just happens for the first voice

      if (params.part) self.appendElement('part', params.part.startChar, params.part.endChar, {
        title: params.part.title
      });
      if (params.meter !== undefined) This.lines[This.lineNum].staff[This.staffNum].meter = params.meter;

      if (This.vskipPending) {
        This.lines[This.lineNum].vskip = This.vskipPending;
        delete This.vskipPending;
      }
    };

    var createLine = function createLine(params) {
      This.lines[This.lineNum] = {
        staff: []
      };
      createStaff(params);
    };

    if (tune.lines[tune.lineNum] === undefined) createLine(params);else if (tune.lines[tune.lineNum].staff === undefined) {
      tune.lineNum++;
      this.startNewLine(params);
    } else if (tune.lines[tune.lineNum].staff[tune.staffNum] === undefined) createStaff(params);else if (tune.lines[tune.lineNum].staff[tune.staffNum].voices[tune.voiceNum] === undefined) createVoice(params);else if (!this.containsNotes(tune.lines[tune.lineNum].staff[tune.staffNum].voices[tune.voiceNum])) {
      // We don't need a new line but we might need to update parts of it.
      if (params.part) self.appendElement('part', params.part.startChar, params.part.endChar, {
        title: params.part.title
      });
    } else {
      tune.lineNum++;
      this.startNewLine(params);
    }
  };

  this.setRunningFont = function (type, font) {
    // This is called at tune start to set the current default fonts so we know whether to record a change.
    tune.runningFonts[type] = font;
  };

  this.setLineFont = function (type, font) {
    // If we haven't encountered the font type yet then we are using the default font so it doesn't
    // need to be noted. If we have encountered it, then only record it if it is different from the last time.
    if (tune.runningFonts[type]) {
      var isDifferent = false;
      var keys = Object.keys(font);

      for (var i = 0; i < keys.length; i++) {
        if (tune.runningFonts[type][keys[i]] !== font[keys[i]]) isDifferent = true;
      }

      if (isDifferent) {
        tune.lines[tune.lineNum].staff[tune.staffNum][type] = font;
      }
    }

    tune.runningFonts[type] = font;
  };

  this.setBarNumberImmediate = function (barNumber) {
    // If tune is called right at the beginning of a line, then correct the measure number that is already written.
    // If tune is called at the beginning of a measure, then correct the measure number that was just created.
    // If tune is called in the middle of a measure, then subtract one from it, because it will be incremented before applied.
    var currentVoice = this.getCurrentVoice();

    if (currentVoice && currentVoice.length > 0) {
      var lastElement = currentVoice[currentVoice.length - 1];

      if (lastElement.el_type === 'bar') {
        if (lastElement.barNumber !== undefined) // the measure number might not be written for tune bar, don't override that.
          lastElement.barNumber = barNumber;
      } else return barNumber - 1;
    }

    return barNumber;
  };

  this.hasBeginMusic = function () {
    // return true if there exists at least one line that contains "staff"
    for (var i = 0; i < tune.lines.length; i++) {
      if (tune.lines[i].staff) return true;
    }

    return false;
  };

  this.isFirstLine = function (index) {
    for (var i = index - 1; i >= 0; i--) {
      if (tune.lines[i].staff !== undefined) return false;
    }

    return true;
  };

  this.getCurrentVoice = function () {
    var currLine = tune.lines[tune.lineNum];
    if (!currLine) return null;
    var currStaff = currLine.staff[tune.staffNum];
    if (!currStaff) return null;
    if (currStaff.voices[tune.voiceNum] !== undefined) return currStaff.voices[tune.voiceNum];else return null;
  };

  this.setCurrentVoice = function (staffNum, voiceNum) {
    tune.staffNum = staffNum;
    tune.voiceNum = voiceNum;

    for (var i = 0; i < tune.lines.length; i++) {
      if (tune.lines[i].staff) {
        if (tune.lines[i].staff[staffNum] === undefined || tune.lines[i].staff[staffNum].voices[voiceNum] === undefined || !this.containsNotes(tune.lines[i].staff[staffNum].voices[voiceNum])) {
          tune.lineNum = i;
          return;
        }
      }
    }

    tune.lineNum = i;
  };

  this.addMetaText = function (key, value) {
    if (tune.metaText[key] === undefined) tune.metaText[key] = value;else tune.metaText[key] += "\n" + value;
  };

  this.addMetaTextArray = function (key, value) {
    if (tune.metaText[key] === undefined) tune.metaText[key] = [value];else tune.metaText[key].push(value);
  };

  this.addMetaTextObj = function (key, value) {
    tune.metaText[key] = value;
  };
};

module.exports = TuneBuilder;

/***/ }),

/***/ "./src/parse/wrap_lines.js":
/*!*********************************!*\
  !*** ./src/parse/wrap_lines.js ***!
  \*********************************/
/***/ (function(module) {

//    wrap_lines.js: does line wrap on an already parsed tune.
function wrapLines(tune, lineBreaks) {
  if (!lineBreaks || tune.lines.length === 0) return; // tune.lines contains nested arrays: there is an array of lines (that's the part this function rewrites),
  // there is an array of staffs per line (for instance, piano will have 2, orchestra will have many)
  // there is an array of voices per staff (for instance, 4-part harmony might have bass and tenor on a single staff)

  var lines = tune.deline({
    lineBreaks: false
  });
  var linesBreakElements = findLineBreaks(lines, lineBreaks); //console.log(JSON.stringify(linesBreakElements))

  tune.lines = addLineBreaks(lines, linesBreakElements);
  tune.lineBreaks = linesBreakElements;
}

function addLineBreaks(lines, linesBreakElements) {
  // linesBreakElements is an array of all of the elements that break for a new line
  // The objects in the array look like:
  // {"ogLine":0,"line":0,"staff":0,"voice":0,"start":0, "end":21}
  // ogLine is the original line that it came from,
  // line is the target line.
  // then copy all the elements from start to end for the staff and voice specified.
  // If the item doesn't contain "staff" then it is a non music line and should just be copied.
  var outputLines = [];
  var lastKeySig = []; // This is per staff - if the key changed then this will be populated.

  var lastStem = [];

  for (var i = 0; i < linesBreakElements.length; i++) {
    var action = linesBreakElements[i];

    if (lines[action.ogLine].staff) {
      var inputStaff = lines[action.ogLine].staff[action.staff];

      if (!outputLines[action.line]) {
        outputLines[action.line] = {
          staff: []
        };
      }

      if (!outputLines[action.line].staff[action.staff]) {
        outputLines[action.line].staff[action.staff] = {
          voices: []
        };
        var keys = Object.keys(inputStaff);

        for (var k = 0; k < keys.length; k++) {
          var skip = keys[k] === "voices";
          if (keys[k] === "meter" && action.line !== 0) skip = true;
          if (!skip) outputLines[action.line].staff[action.staff][keys[k]] = inputStaff[keys[k]];
        }

        if (lastKeySig[action.staff]) outputLines[action.line].staff[action.staff].key = lastKeySig[action.staff];
      }

      if (!outputLines[action.line].staff[action.staff].voices[action.voice]) {
        outputLines[action.line].staff[action.staff].voices[action.voice] = [];
      }

      outputLines[action.line].staff[action.staff].voices[action.voice] = lines[action.ogLine].staff[action.staff].voices[action.voice].slice(action.start, action.end + 1);
      if (lastStem[action.staff * 10 + action.voice]) outputLines[action.line].staff[action.staff].voices[action.voice].unshift({
        el_type: "stem",
        direction: lastStem[action.staff * 10 + action.voice].direction
      });
      var currVoice = outputLines[action.line].staff[action.staff].voices[action.voice];

      for (var kk = currVoice.length - 1; kk >= 0; kk--) {
        if (currVoice[kk].el_type === "key") {
          lastKeySig[action.staff] = {
            root: currVoice[kk].root,
            acc: currVoice[kk].acc,
            mode: currVoice[kk].mode,
            accidentals: currVoice[kk].accidentals.filter(function (acc) {
              return acc.acc !== 'natural';
            })
          };
          break;
        }
      }

      for (kk = currVoice.length - 1; kk >= 0; kk--) {
        if (currVoice[kk].el_type === "stem") {
          lastStem[action.staff * 10 + action.voice] = {
            direction: currVoice[kk].direction
          };
          break;
        }
      }
    } else {
      outputLines[action.line] = lines[action.ogLine];
    }
  } // There could be some missing info - if the tune passed in was incomplete or had different lengths for different voices or was missing a voice altogether - just fill in the gaps.


  for (var ii = 0; ii < outputLines.length; ii++) {
    if (outputLines[ii].staff) {
      outputLines[ii].staff = outputLines[ii].staff.filter(function (el) {
        return el != null;
      });
    }
  }

  return outputLines;
}

function findLineBreaks(lines, lineBreakArray) {
  // lineBreakArray is an array of all of the sections of the tune - often there will just be one
  // section unless there is a subtitle or other non-music lines. Each of the elements of
  // Each element of lineBreakArray is an array of the zero-based last measure of the line.
  var lineBreakIndexes = [];
  var lbai = 0;
  var lineCounter = 0;
  var outputLine = 0;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    if (line.staff) {
      var lineStart = lineCounter;
      var lineBreaks = lineBreakArray[lbai];
      lbai++;

      for (var j = 0; j < line.staff.length; j++) {
        var staff = line.staff[j];

        for (var k = 0; k < staff.voices.length; k++) {
          outputLine = lineStart;
          var measureNumber = 0;
          var lbi = 0;
          var voice = staff.voices[k];
          var start = 0;

          for (var e = 0; e < voice.length; e++) {
            var el = voice[e];

            if (el.el_type === 'bar') {
              if (lineBreaks[lbi] === measureNumber) {
                lineBreakIndexes.push({
                  ogLine: i,
                  line: outputLine,
                  staff: j,
                  voice: k,
                  start: start,
                  end: e
                });
                start = e + 1;
                outputLine++;
                lineCounter = Math.max(lineCounter, outputLine);
                lbi++;
              }

              measureNumber++;
            }
          }

          lineBreakIndexes.push({
            ogLine: i,
            line: outputLine,
            staff: j,
            voice: k,
            start: start,
            end: voice.length
          });
          outputLine++;
          lineCounter = Math.max(lineCounter, outputLine);
        }
      }
    } else {
      lineBreakIndexes.push({
        ogLine: i,
        line: outputLine
      });
      outputLine++;
      lineCounter = Math.max(lineCounter, outputLine);
    }
  }

  return lineBreakIndexes;
}

function freeFormLineBreaks(widths, lineBreakPoint) {
  var lineBreaks = [];
  var totals = [];
  var totalThisLine = 0; // run through each measure and see if the accumulation is less than the ideal.
  // if it passes the ideal, then see whether the last or this one is closer to the ideal.

  for (var i = 0; i < widths.length; i++) {
    var width = widths[i];
    var attemptedWidth = totalThisLine + width;
    if (attemptedWidth < lineBreakPoint) totalThisLine = attemptedWidth;else {
      // This just passed the ideal, so see whether the previous or the current number of measures is closer.
      var oldDistance = lineBreakPoint - totalThisLine;
      var newDistance = attemptedWidth - lineBreakPoint;

      if (oldDistance < newDistance && totalThisLine > 0) {
        lineBreaks.push(i - 1);
        totals.push(Math.round(totalThisLine - width));
        totalThisLine = width;
      } else {
        if (i < widths.length - 1) {
          lineBreaks.push(i);
          totals.push(Math.round(totalThisLine));
          totalThisLine = 0;
        }
      }
    }
  }

  totals.push(Math.round(totalThisLine));
  return {
    lineBreaks: lineBreaks,
    totals: totals
  };
}

function clone(arr) {
  var newArr = [];

  for (var i = 0; i < arr.length; i++) {
    newArr.push(arr[i]);
  }

  return newArr;
}

function oneTry(measureWidths, idealWidths, accumulator, lineAccumulator, lineWidths, lastVariance, highestVariance, currLine, lineBreaks, startIndex, otherTries) {
  for (var i = startIndex; i < measureWidths.length; i++) {
    var measureWidth = measureWidths[i];
    accumulator += measureWidth;
    lineAccumulator += measureWidth;
    var thisVariance = Math.abs(accumulator - idealWidths[currLine]);
    var varianceIsClose = Math.abs(thisVariance - lastVariance) < idealWidths[0] / 10; // see if the difference is less than 10%, if so, run the test both ways.

    if (varianceIsClose) {
      if (thisVariance < lastVariance) {
        // Also attempt one less measure on the current line - sometimes that works out better.
        var newWidths = clone(lineWidths);
        var newBreaks = clone(lineBreaks);
        newBreaks.push(i - 1);
        newWidths.push(lineAccumulator - measureWidth);
        otherTries.push({
          accumulator: accumulator,
          lineAccumulator: measureWidth,
          lineWidths: newWidths,
          lastVariance: Math.abs(accumulator - idealWidths[currLine + 1]),
          highestVariance: Math.max(highestVariance, lastVariance),
          currLine: currLine + 1,
          lineBreaks: newBreaks,
          startIndex: i + 1
        });
      } else if (thisVariance > lastVariance && i < measureWidths.length - 1) {
        // Also attempt one extra measure on this line.
        newWidths = clone(lineWidths);
        newBreaks = clone(lineBreaks); // newBreaks[newBreaks.length-1] = i;
        // newWidths[newWidths.length-1] = lineAccumulator;

        otherTries.push({
          accumulator: accumulator,
          lineAccumulator: lineAccumulator,
          lineWidths: newWidths,
          lastVariance: thisVariance,
          highestVariance: Math.max(highestVariance, thisVariance),
          currLine: currLine,
          lineBreaks: newBreaks,
          startIndex: i + 1
        });
      }
    }

    if (thisVariance > lastVariance) {
      lineBreaks.push(i - 1);
      currLine++;
      highestVariance = Math.max(highestVariance, lastVariance);
      lastVariance = Math.abs(accumulator - idealWidths[currLine]);
      lineWidths.push(lineAccumulator - measureWidth);
      lineAccumulator = measureWidth;
    } else {
      lastVariance = thisVariance;
    }
  }

  lineWidths.push(lineAccumulator);
}

function optimizeLineWidths(widths, lineBreakPoint, lineBreaks, explanation) {
  //	figure out how many lines
  var numLines = Math.ceil(widths.total / lineBreakPoint); // + 1 TODO-PER: this used to be plus one - not sure why
  //	get the ideal width for a line (cumulative width / num lines) - approx the same as lineBreakPoint except for rounding

  var idealWidth = Math.floor(widths.total / numLines); //	get each ideal line width (1*ideal, 2*ideal, 3*ideal, etc)

  var idealWidths = [];

  for (var i = 0; i < numLines; i++) {
    idealWidths.push(idealWidth * (i + 1));
  } //	from first measure, step through accum. Widths until the abs of the ideal is greater than the last one.
  // This can sometimes look funny in edge cases, so when the length is within 10%, try one more or one less to see which is better.
  // This is better than trying all the possibilities because that would get to be a huge number for even a medium size piece.
  // This method seems to never generate more than about 16 tries and it is usually 4 or less.


  var otherTries = [];
  otherTries.push({
    accumulator: 0,
    lineAccumulator: 0,
    lineWidths: [],
    lastVariance: 999999,
    highestVariance: 0,
    currLine: 0,
    lineBreaks: [],
    // These are the zero-based last measure on each line
    startIndex: 0
  });
  var index = 0;

  while (index < otherTries.length) {
    oneTry(widths.measureWidths, idealWidths, otherTries[index].accumulator, otherTries[index].lineAccumulator, otherTries[index].lineWidths, otherTries[index].lastVariance, otherTries[index].highestVariance, otherTries[index].currLine, otherTries[index].lineBreaks, otherTries[index].startIndex, otherTries);
    index++;
  }

  for (i = 0; i < otherTries.length; i++) {
    var otherTry = otherTries[i];
    otherTry.variances = [];
    otherTry.aveVariance = 0;

    for (var j = 0; j < otherTry.lineWidths.length; j++) {
      var lineWidth = otherTry.lineWidths[j];
      otherTry.variances.push(lineWidth - idealWidths[0]);
      otherTry.aveVariance += Math.abs(lineWidth - idealWidths[0]);
    }

    otherTry.aveVariance = otherTry.aveVariance / otherTry.lineWidths.length;
    explanation.attempts.push({
      type: "optimizeLineWidths",
      lineBreaks: otherTry.lineBreaks,
      variances: otherTry.variances,
      aveVariance: otherTry.aveVariance,
      widths: widths.measureWidths
    });
  }

  var smallest = 9999999;
  var smallestIndex = -1;

  for (i = 0; i < otherTries.length; i++) {
    otherTry = otherTries[i];

    if (otherTry.aveVariance < smallest) {
      smallest = otherTry.aveVariance;
      smallestIndex = i;
    }
  }

  return {
    failed: false,
    lineBreaks: otherTries[smallestIndex].lineBreaks,
    variance: otherTries[smallestIndex].highestVariance
  };
}

function fixedMeasureLineBreaks(widths, lineBreakPoint, preferredMeasuresPerLine) {
  var lineBreaks = [];
  var totals = [];
  var thisWidth = 0;
  var failed = false;

  for (var i = 0; i < widths.length; i++) {
    thisWidth += widths[i];

    if (thisWidth > lineBreakPoint) {
      failed = true;
    }

    if (i % preferredMeasuresPerLine === preferredMeasuresPerLine - 1) {
      if (i !== widths.length - 1) // Don't bother putting a line break for the last line - it's already a break.
        lineBreaks.push(i);
      totals.push(Math.round(thisWidth));
      thisWidth = 0;
    }
  }

  return {
    failed: failed,
    totals: totals,
    lineBreaks: lineBreaks
  };
}

function getRevisedTuneParams(lineBreaks, staffWidth, params) {
  var revisedParams = {
    lineBreaks: lineBreaks,
    staffwidth: staffWidth
  };

  for (var key in params) {
    if (params.hasOwnProperty(key) && key !== 'wrap' && key !== 'staffwidth') {
      revisedParams[key] = params[key];
    }
  }

  return {
    revisedParams: revisedParams
  };
}

function calcLineWraps(tune, widths, params) {
  // For calculating how much can go on the line, it depends on the width of the line. It is a convenience to just divide it here
  // by the minimum spacing instead of multiplying the min spacing later.
  // The scaling works differently: this is done by changing the scaling of the outer SVG, so the scaling needs to be compensated
  // for here, because the actual width will be different from the calculated numbers.
  // If the desired width is less than the margin, just punt and return the original tune
  //console.log(widths)
  if (widths.length === 0 || params.staffwidth < widths[0].left) {
    return {
      reParse: false,
      explanation: "Staff width is narrower than the margin",
      revisedParams: params
    };
  }

  var scale = params.scale ? Math.max(params.scale, 0.1) : 1;
  var minSpacing = params.wrap.minSpacing ? Math.max(parseFloat(params.wrap.minSpacing), 1) : 1;
  var minSpacingLimit = params.wrap.minSpacingLimit ? Math.max(parseFloat(params.wrap.minSpacingLimit), 1) : minSpacing - 0.1;
  var maxSpacing = params.wrap.maxSpacing ? Math.max(parseFloat(params.wrap.maxSpacing), 1) : undefined;
  if (params.wrap.lastLineLimit && !maxSpacing) maxSpacing = Math.max(parseFloat(params.wrap.lastLineLimit), 1); // var targetHeight = params.wrap.targetHeight ? Math.max(parseInt(params.wrap.targetHeight, 10), 100) : undefined;

  var preferredMeasuresPerLine = params.wrap.preferredMeasuresPerLine ? Math.max(parseInt(params.wrap.preferredMeasuresPerLine, 10), 0) : undefined;
  var accumulatedLineBreaks = [];
  var explanations = [];

  for (var s = 0; s < widths.length; s++) {
    var section = widths[s];
    var usableWidth = params.staffwidth - section.left;
    var lineBreakPoint = usableWidth / minSpacing / scale;
    var minLineSize = usableWidth / maxSpacing / scale;
    var allowableVariance = usableWidth / minSpacingLimit / scale;
    var explanation = {
      widths: section,
      lineBreakPoint: lineBreakPoint,
      minLineSize: minLineSize,
      attempts: [],
      staffWidth: params.staffwidth,
      minWidth: Math.round(allowableVariance)
    }; // If there is a preferred number of measures per line, test that first. If none of the lines is too long, then we're finished.

    var lineBreaks = null;

    if (preferredMeasuresPerLine) {
      var f = fixedMeasureLineBreaks(section.measureWidths, lineBreakPoint, preferredMeasuresPerLine);
      explanation.attempts.push({
        type: "Fixed Measures Per Line",
        preferredMeasuresPerLine: preferredMeasuresPerLine,
        lineBreaks: f.lineBreaks,
        failed: f.failed,
        totals: f.totals
      });
      if (!f.failed) lineBreaks = f.lineBreaks;
    } // If we don't have lineBreaks yet, use the free form method of line breaks.
    // This will be called either if Preferred Measures is not used, or if the music is just weird - like a single measure is way too crowded.


    if (!lineBreaks) {
      var ff = freeFormLineBreaks(section.measureWidths, lineBreakPoint);
      explanation.attempts.push({
        type: "Free Form",
        lineBreaks: ff.lineBreaks,
        totals: ff.totals
      });
      lineBreaks = ff.lineBreaks; // We now have an acceptable number of lines, but the measures may not be optimally distributed. See if there is a better distribution.

      if (lineBreaks.length > 0 && section.measureWidths.length < 25) {
        // Only do this if everything doesn't fit on one line.
        // This is an intensive operation and it is optional so just do it for shorter music.
        ff = optimizeLineWidths(section, lineBreakPoint, lineBreaks, explanation);
        explanation.attempts.push({
          type: "Optimize",
          failed: ff.failed,
          reason: ff.reason,
          lineBreaks: ff.lineBreaks,
          totals: ff.totals
        });
        if (!ff.failed) lineBreaks = ff.lineBreaks;
      }
    }

    accumulatedLineBreaks.push(lineBreaks);
    explanations.push(explanation);
  } // If the vertical space exceeds targetHeight, remove a line and try again. If that is too crowded, then don't use it.


  var staffWidth = params.staffwidth;
  var ret = getRevisedTuneParams(accumulatedLineBreaks, staffWidth, params);
  ret.explanation = explanations;
  ret.reParse = true;
  return ret;
}

module.exports = {
  wrapLines: wrapLines,
  calcLineWraps: calcLineWraps
};

/***/ }),

/***/ "./src/synth/abc_midi_flattener.js":
/*!*****************************************!*\
  !*** ./src/synth/abc_midi_flattener.js ***!
  \*****************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

//    abc_midi_flattener.js: Turn a linear series of events into a series of MIDI commands.
// We input a set of voices, but the notes are still complex. This pass changes the logical definitions
// of the grace notes, decorations, ties, triplets, rests, transpositions, keys, and accidentals into actual note durations.
// It also extracts guitar chords to a separate voice and resolves their rhythm.
var flatten;

var parseCommon = __webpack_require__(/*! ../parse/abc_common */ "./src/parse/abc_common.js");

var pitchesToPerc = __webpack_require__(/*! ./pitches-to-perc */ "./src/synth/pitches-to-perc.js");

(function () {
  "use strict";

  var barAccidentals;
  var accidentals;
  var transpose;
  var bagpipes;
  var tracks;
  var startingTempo;
  var startingMeter;
  var tempoChangeFactor = 1;
  var instrument;
  var currentInstrument; // var channel;

  var currentTrack;
  var lastNoteDurationPosition;
  var currentTrackName;
  var lastEventTime;
  var meter = {
    num: 4,
    den: 4
  };
  var chordTrack;
  var chordSourceTrack;
  var chordTrackFinished;
  var chordChannel;
  var chordInstrument = 0;
  var drumInstrument = 128;
  var boomVolume = 64;
  var chickVolume = 48;
  var currentChords;
  var lastChord;
  var chordLastBar;
  var lastBarTime;
  var gChordTacet = false;
  var hasRhythmHead = false;
  var doBeatAccents = true;
  var stressBeat1 = 105;
  var stressBeatDown = 95;
  var stressBeatUp = 85;
  var beatFraction = 0.25;
  var nextVolume;
  var nextVolumeDelta;
  var slurCount = 0;
  var drumTrack;
  var drumTrackFinished;
  var drumDefinition = {};
  var pickupLength = 0;
  var percmap; // The gaps per beat. The first two are in seconds, the third is in fraction of a duration.

  var normalBreakBetweenNotes = 0; //0.000520833333325*1.5; // for articulation (matches muse score value)

  var slurredBreakBetweenNotes = -0.001; // make the slurred notes actually overlap

  var staccatoBreakBetweenNotes = 0.4; // some people say staccato is half duration, some say 3/4 so this splits it

  flatten = function flatten(voices, options, percmap_) {
    if (!options) options = {};
    barAccidentals = [];
    accidentals = [0, 0, 0, 0, 0, 0, 0];
    bagpipes = false;
    tracks = [];
    startingTempo = options.qpm;
    startingMeter = undefined;
    tempoChangeFactor = 1;
    instrument = undefined;
    currentInstrument = undefined; // channel = undefined;

    currentTrack = undefined;
    currentTrackName = undefined;
    lastEventTime = 0;
    percmap = percmap_; // For resolving chords.

    meter = {
      num: 4,
      den: 4
    };
    chordTrack = [];
    chordSourceTrack = false;
    chordChannel = voices.length; // first free channel for chords

    chordTrackFinished = false;
    currentChords = [];
    boomVolume = 64;
    chickVolume = 48;
    lastChord = undefined;
    chordLastBar = undefined;
    gChordTacet = options.chordsOff ? true : false;
    hasRhythmHead = false;
    doBeatAccents = true;
    stressBeat1 = 105;
    stressBeatDown = 95;
    stressBeatUp = 85;
    beatFraction = 0.25;
    nextVolume = undefined;
    nextVolumeDelta = undefined;
    slurCount = 0; // For the drum/metronome track.

    drumTrack = [];
    drumTrackFinished = false;
    drumDefinition = {};
    if (voices.length > 0 && voices[0].length > 0) pickupLength = voices[0][0].pickupLength; // First adjust the input to resolve ties, set the starting time for each note, etc. That will make the rest of the logic easier

    preProcess(voices, options);

    for (var i = 0; i < voices.length; i++) {
      transpose = 0;
      lastNoteDurationPosition = -1;
      var voice = voices[i];
      currentTrack = [{
        cmd: 'program',
        channel: i,
        instrument: instrument
      }];
      currentTrackName = undefined;
      lastBarTime = 0;
      var voiceOff = false;
      if (options.voicesOff === true) voiceOff = true;else if (options.voicesOff && options.voicesOff.length && options.voicesOff.indexOf(i) >= 0) voiceOff = true;

      for (var j = 0; j < voice.length; j++) {
        var element = voice[j];

        switch (element.el_type) {
          case "name":
            currentTrackName = {
              cmd: 'text',
              type: "name",
              text: element.trackName
            };
            break;

          case "note":
            var setChordTrack = writeNote(element, voiceOff);
            if (setChordTrack) chordSourceTrack = i;
            break;

          case "key":
            accidentals = setKeySignature(element);
            break;

          case "meter":
            if (!startingMeter) startingMeter = element;
            meter = element;
            beatFraction = getBeatFraction(meter);
            break;

          case "tempo":
            if (!startingTempo) startingTempo = element.qpm;else tempoChangeFactor = element.qpm ? startingTempo / element.qpm : 1;
            break;

          case "transpose":
            transpose = element.transpose;
            break;

          case "bar":
            if (chordTrack.length > 0 && (chordSourceTrack === false || i === chordSourceTrack)) {
              resolveChords(lastBarTime, timeToRealTime(element.time));
              currentChords = [];
            }

            barAccidentals = [];
            if (i === 0) // Only write the drum part on the first voice so that it is not duplicated.
              writeDrum(voices.length + 1);
            hasRhythmHead = false; // decide whether there are rhythm heads each measure.

            chordLastBar = lastChord;
            lastBarTime = timeToRealTime(element.time);
            break;

          case "bagpipes":
            bagpipes = true;
            break;

          case "instrument":
            if (instrument === undefined) instrument = element.program;
            currentInstrument = element.program;
            if (currentTrack.length > 0 && currentTrack[currentTrack.length - 1].cmd === 'program') currentTrack[currentTrack.length - 1].instrument = element.program;else {
              var ii;

              for (ii = currentTrack.length - 1; ii >= 0 && currentTrack[ii].cmd !== 'program'; ii--) {
                ;
              }

              if (ii < 0 || currentTrack[ii].instrument !== element.program) currentTrack.push({
                cmd: 'program',
                channel: 0,
                instrument: element.program
              });
            }
            break;

          case "channel":
            setChannel(element.channel);
            break;

          case "drum":
            drumDefinition = normalizeDrumDefinition(element.params);
            break;

          case "gchord":
            if (!options.chordsOff) gChordTacet = element.tacet;
            break;

          case "beat":
            stressBeat1 = element.beats[0];
            stressBeatDown = element.beats[1];
            stressBeatUp = element.beats[2]; // TODO-PER: also use the last parameter - which changes which beats are strong.

            break;

          case "vol":
            nextVolume = element.volume;
            break;

          case "volinc":
            nextVolumeDelta = element.volume;
            break;

          case "beataccents":
            doBeatAccents = element.value;
            break;

          default:
            // This should never happen
            console.log("MIDI creation. Unknown el_type: " + element.el_type + "\n"); // jshint ignore:line

            break;
        }
      }

      if (currentTrack[0].instrument === undefined) currentTrack[0].instrument = instrument ? instrument : 0;
      if (currentTrackName) currentTrack.unshift(currentTrackName);
      tracks.push(currentTrack);
      if (chordTrack.length > 0) // Don't do chords on more than one track, so turn off chord detection after we create it.
        chordTrackFinished = true;
      if (drumTrack.length > 0) // Don't do drums on more than one track, so turn off drum after we create it.
        drumTrackFinished = true;
    } // See if any notes are octaves played at the same time. If so, raise the pitch of the higher one.


    if (options.detuneOctave) findOctaves(tracks, parseInt(options.detuneOctave, 10));
    if (chordTrack.length > 0) tracks.push(chordTrack);
    if (drumTrack.length > 0) tracks.push(drumTrack);
    return {
      tempo: startingTempo,
      instrument: instrument,
      tracks: tracks,
      totalDuration: lastEventTime
    };
  };

  function setChannel(channel) {
    for (var i = currentTrack.length - 1; i >= 0; i--) {
      if (currentTrack[i].cmd === "program") {
        currentTrack[i].channel = channel;
        return;
      }
    }
  }

  function timeToRealTime(time) {
    return time / 1000000;
  }

  function durationRounded(duration) {
    return Math.round(duration * tempoChangeFactor * 1000000) / 1000000;
  }

  function preProcess(voices, options) {
    for (var i = 0; i < voices.length; i++) {
      var voice = voices[i];
      var ties = {};
      var startingTempo = options.qpm;
      var timeCounter = 0;
      var tempoMultiplier = 1;

      for (var j = 0; j < voice.length; j++) {
        var element = voice[j];

        if (element.el_type === 'tempo') {
          if (!startingTempo) startingTempo = element.qpm;else tempoMultiplier = element.qpm ? startingTempo / element.qpm : 1;
          continue;
        } // For convenience, put the current time in each event so that it doesn't have to be calculated in the complicated stuff that follows.


        element.time = timeCounter;
        var thisDuration = element.duration ? element.duration : 0;
        timeCounter += Math.round(thisDuration * tempoMultiplier * 1000000); // To compensate for JS rounding problems, do all intermediate calcs on integers.
        // If there are pitches then put the duration in the pitch object and if there are ties then change the duration of the first note in the tie.

        if (element.pitches) {
          for (var k = 0; k < element.pitches.length; k++) {
            var pitch = element.pitches[k];

            if (pitch) {
              pitch.duration = element.duration;

              if (pitch.startTie) {
                //console.log(element)
                if (ties[pitch.pitch] === undefined) // We might have three notes tied together - if so just add this duration.
                  ties[pitch.pitch] = {
                    el: j,
                    pitch: k
                  };else {
                  voice[ties[pitch.pitch].el].pitches[ties[pitch.pitch].pitch].duration += pitch.duration;
                  element.pitches[k] = null;
                } //console.log(">>> START", JSON.stringify(ties));
              } else if (pitch.endTie) {
                //console.log(element)
                var tie = ties[pitch.pitch]; //console.log(">>> END", pitch.pitch, tie, JSON.stringify(ties));

                if (tie) {
                  var dur = pitch.duration;
                  delete voice[tie.el].pitches[tie.pitch].startTie;
                  voice[tie.el].pitches[tie.pitch].duration += dur;
                  element.pitches[k] = null;
                  delete ties[pitch.pitch];
                } else {
                  delete pitch.endTie;
                }
              }
            }
          }

          delete element.duration;
        }
      }

      for (var key in ties) {
        if (ties.hasOwnProperty(key)) {
          var item = ties[key];
          delete voice[item.el].pitches[item.pitch].startTie;
        }
      } // voices[0].forEach(v => delete v.elem)
      // voices[1].forEach(v => delete v.elem)
      // console.log(JSON.stringify(voices))

    }
  }

  function getBeatFraction(meter) {
    switch (parseInt(meter.den, 10)) {
      case 2:
        return 0.5;

      case 4:
        return 0.25;

      case 8:
        if (meter.num % 3 === 0) return 0.375;else return 0.125;

      case 16:
        return 0.125;
    }

    return 0.25;
  } //
  // The algorithm for chords is:
  // - The chords are done in a separate track.
  // - If there are notes before the first chord, then put that much silence to start the track.
  // - The pattern of chord expression depends on the meter, and how many chords are in a measure.
  // - There is a possibility that a measure will have an incorrect number of beats, if that is the case, then
  // start the pattern anew on the next measure number.
  // - If a chord root is not A-G, then ignore it as if the chord wasn't there at all.
  // - If a chord modification isn't in our supported list, change it to a major triad.
  //
  // - If there is only one chord in a measure:
  //		- If 2/4, play root chord
  //		- If cut time, play root(1) chord(3)
  //		- If 3/4, play root chord chord
  //		- If 4/4 or common time, play root chord fifth chord
  //		- If 6/8, play root(1) chord(3) fifth(4) chord(6)
  //		- For any other meter, play the full chord on each beat. (TODO-PER: expand this as more support is added.)
  //
  //	- If there is a chord specified that is not on a beat, move it earlier to the previous beat, unless there is already a chord on that beat.
  //	- Otherwise, move it later, unless there is already a chord on that beat.
  // 	- Otherwise, ignore it. (TODO-PER: expand this as more support is added.)
  //
  // - If there is a chord on the second beat, play a chord for the first beat instead of a bass note.
  // - Likewise, if there is a chord on the fourth beat of 4/4, play a chord on the third beat instead of a bass note.
  //
  // If there is any note in the melody that has a rhythm head, then assume the melody controls the rhythm, so that is
  // the same as a break.


  var breakSynonyms = ['break', '(break)', 'no chord', 'n.c.', 'tacet'];

  function findChord(elem) {
    if (gChordTacet) return 'break'; // TODO-PER: Just using the first chord if there are more than one.

    if (chordTrackFinished || !elem.chord || elem.chord.length === 0) return null; // Return the first annotation that is a regular chord: that is, it is in the default place or is a recognized "tacet" phrase.

    for (var i = 0; i < elem.chord.length; i++) {
      var ch = elem.chord[i];
      if (ch.position === 'default') return ch.name;
      if (breakSynonyms.indexOf(ch.name.toLowerCase()) >= 0) return 'break';
    }

    return null;
  }

  function calcBeat(measureStart, beatLength, currTime) {
    var distanceFromStart = currTime - measureStart;
    return distanceFromStart / beatLength;
  }

  function processVolume(beat, voiceOff) {
    if (voiceOff) return 0;
    var volume;

    if (nextVolume) {
      volume = nextVolume;
      nextVolume = undefined;
    } else if (!doBeatAccents) {
      volume = stressBeatDown;
    } else if (pickupLength > beat) {
      volume = stressBeatUp;
    } else {
      var barLength = meter.num / meter.den;
      var barBeat = calcBeat(lastBarTime, getBeatFraction(meter), beat);
      if (barBeat === 0) volume = stressBeat1;else if (parseInt(barBeat, 10) === barBeat) volume = stressBeatDown;else volume = stressBeatUp;
    }

    if (nextVolumeDelta) {
      volume += nextVolumeDelta;
      nextVolumeDelta = undefined;
    }

    if (volume < 0) volume = 0;
    if (volume > 127) volume = 127;
    return voiceOff ? 0 : volume;
  }

  function processChord(elem) {
    var firstChord = false;
    var chord = findChord(elem);

    if (chord) {
      var c = interpretChord(chord); // If this isn't a recognized chord, just completely ignore it.

      if (c) {
        // If we ever have a chord in this voice, then we add the chord track.
        // However, if there are chords on more than one voice, then just use the first voice.
        if (chordTrack.length === 0) {
          firstChord = true;
          chordTrack.push({
            cmd: 'program',
            channel: chordChannel,
            instrument: chordInstrument
          });
        }

        lastChord = c;
        var barBeat = calcBeat(lastBarTime, getBeatFraction(meter), timeToRealTime(elem.time));
        currentChords.push({
          chord: lastChord,
          beat: barBeat,
          start: timeToRealTime(elem.time)
        });
      }
    }

    return firstChord;
  }

  function findNoteModifications(elem, velocity) {
    var ret = {
      accent: false
    };

    if (elem.decoration) {
      for (var d = 0; d < elem.decoration.length; d++) {
        if (elem.decoration[d] === 'staccato') ret.thisBreakBetweenNotes = 'staccato';else if (elem.decoration[d] === 'tenuto') ret.thisBreakBetweenNotes = 'tenuto';else if (elem.decoration[d] === 'accent') {
          ret.velocity = Math.min(127, velocity * 1.5);
          ret.accent = true;
        } else if (elem.decoration[d] === 'trill') ret.noteModification = "trill";else if (elem.decoration[d] === 'lowermordent') ret.noteModification = "lowermordent";else if (elem.decoration[d] === 'uppermordent') ret.noteModification = "mordent";else if (elem.decoration[d] === 'mordent') ret.noteModification = "mordent";else if (elem.decoration[d] === 'turn') ret.noteModification = "turn";else if (elem.decoration[d] === 'roll') ret.noteModification = "roll";else if (elem.decoration[d] === '/') ret.noteModification = "roll";else if (elem.decoration[d] === '//') ret.noteModification = "roll";else if (elem.decoration[d] === '///') ret.noteModification = "roll";else if (elem.decoration[d] === '////') ret.noteModification = "roll";
      }
    }

    return ret;
  }

  function doModifiedNotes(noteModification, p, accent, origVelocity, duration) {
    var noteTime;
    var numNotes;
    var start = p.start;
    var pp;
    var runningDuration = durationRounded(duration);
    var shortestNote = durationRounded(1.0 / 32);

    switch (noteModification) {
      case "trill":
        var note = 1;

        while (runningDuration > 0) {
          currentTrack.push({
            cmd: 'note',
            pitch: p.pitch + note,
            volume: p.volume,
            start: start,
            duration: shortestNote,
            gap: 0,
            instrument: currentInstrument,
            style: 'decoration'
          });
          note = note === 1 ? 0 : 1;
          runningDuration -= shortestNote;
          start += shortestNote;
        }

        break;

      case "mordent":
        currentTrack.push({
          cmd: 'note',
          pitch: p.pitch,
          volume: p.volume,
          start: start,
          duration: shortestNote,
          gap: 0,
          instrument: currentInstrument,
          style: 'decoration'
        });
        runningDuration -= shortestNote;
        start += shortestNote;
        currentTrack.push({
          cmd: 'note',
          pitch: p.pitch + 1,
          volume: p.volume,
          start: start,
          duration: shortestNote,
          gap: 0,
          instrument: currentInstrument,
          style: 'decoration'
        });
        runningDuration -= shortestNote;
        start += shortestNote;
        currentTrack.push({
          cmd: 'note',
          pitch: p.pitch,
          volume: p.volume,
          start: start,
          duration: runningDuration,
          gap: 0,
          instrument: currentInstrument
        });
        break;

      case "lowermordent":
        currentTrack.push({
          cmd: 'note',
          pitch: p.pitch,
          volume: p.volume,
          start: start,
          duration: shortestNote,
          gap: 0,
          instrument: currentInstrument,
          style: 'decoration'
        });
        runningDuration -= shortestNote;
        start += shortestNote;
        currentTrack.push({
          cmd: 'note',
          pitch: p.pitch - 1,
          volume: p.volume,
          start: start,
          duration: shortestNote,
          gap: 0,
          instrument: currentInstrument,
          style: 'decoration'
        });
        runningDuration -= shortestNote;
        start += shortestNote;
        currentTrack.push({
          cmd: 'note',
          pitch: p.pitch,
          volume: p.volume,
          start: start,
          duration: runningDuration,
          gap: 0,
          instrument: currentInstrument
        });
        break;

      case "turn":
        shortestNote = p.duration / 5;
        currentTrack.push({
          cmd: 'note',
          pitch: p.pitch,
          volume: p.volume,
          start: start,
          duration: shortestNote,
          gap: 0,
          instrument: currentInstrument,
          style: 'decoration'
        });
        currentTrack.push({
          cmd: 'note',
          pitch: p.pitch + 1,
          volume: p.volume,
          start: start + shortestNote,
          duration: shortestNote,
          gap: 0,
          instrument: currentInstrument,
          style: 'decoration'
        });
        currentTrack.push({
          cmd: 'note',
          pitch: p.pitch,
          volume: p.volume,
          start: start + shortestNote * 2,
          duration: shortestNote,
          gap: 0,
          instrument: currentInstrument,
          style: 'decoration'
        });
        currentTrack.push({
          cmd: 'note',
          pitch: p.pitch + 1,
          volume: p.volume,
          start: start + shortestNote * 3,
          duration: shortestNote,
          gap: 0,
          instrument: currentInstrument,
          style: 'decoration'
        });
        currentTrack.push({
          cmd: 'note',
          pitch: p.pitch,
          volume: p.volume,
          start: start + shortestNote * 4,
          duration: shortestNote,
          gap: 0,
          instrument: currentInstrument
        });
        break;

      case "roll":
        while (runningDuration > 0) {
          if (accent) {
            accent = false;
            currentTrack.push({
              cmd: 'note',
              pitch: p.pitch,
              volume: p.volume,
              start: start,
              duration: shortestNote * 0.85,
              gap: 0,
              instrument: currentInstrument,
              style: 'decoration'
            });
          } else {
            currentTrack.push({
              cmd: 'note',
              pitch: p.pitch,
              volume: origVelocity / 2,
              start: start,
              duration: shortestNote * 0.85,
              gap: 0,
              instrument: currentInstrument,
              style: 'decoration'
            });
          }

          runningDuration -= shortestNote * 0.85;
          start += shortestNote * 0.85;
        }

        break;
    }
  }

  function writeNote(elem, voiceOff) {
    //
    // Create a series of note events to append to the current track.
    // The output event is one of: { pitchStart: pitch_in_abc_units, volume: from_1_to_64 }
    // { pitchStop: pitch_in_abc_units }
    // { moveTime: duration_in_abc_units }
    // If there are guitar chords, then they are put in a separate track, but they have the same format.
    //
    var trackStartingIndex = currentTrack.length;
    var velocity = processVolume(timeToRealTime(elem.time), voiceOff);
    var setChordTrack = processChord(elem); // if there are grace notes, then also play them.
    // I'm not sure there is an exact rule for the length of the notes. My rule, unless I find
    // a better one is: the grace notes cannot take more than 1/2 of the main note's value.
    // A grace note (of 1/8 note duration) takes 1/8 of the main note's value.

    var graces;

    if (elem.gracenotes && elem.pitches && elem.pitches.length > 0 && elem.pitches[0]) {
      graces = processGraceNotes(elem.gracenotes, elem.pitches[0].duration);
      if (elem.elem) elem.elem.midiGraceNotePitches = writeGraceNotes(graces, timeToRealTime(elem.time), velocity, currentInstrument); // make the graces a little quieter.
    } // The beat fraction is the note that gets a beat (.25 is a quarter note)
    // The tempo is in minutes and we want to get to milliseconds.
    // If the element is inside a repeat, there may be more than one value. If there is one value,
    // then just store that as a number. If there are more than one value, then change that to
    // an array and return all of them.


    if (elem.elem) {
      var rt = timeToRealTime(elem.time);
      var ms = rt / beatFraction / startingTempo * 60 * 1000;

      if (elem.elem.currentTrackMilliseconds === undefined) {
        elem.elem.currentTrackMilliseconds = ms;
        elem.elem.currentTrackWholeNotes = rt;
      } else {
        if (elem.elem.currentTrackMilliseconds.length === undefined) {
          if (elem.elem.currentTrackMilliseconds !== ms) {
            elem.elem.currentTrackMilliseconds = [elem.elem.currentTrackMilliseconds, ms];
            elem.elem.currentTrackWholeNotes = [elem.elem.currentTrackWholeNotes, rt];
          }
        } else {
          // There can be duplicates if there are multiple voices
          var found = false;

          for (var j = 0; j < elem.elem.currentTrackMilliseconds.length; j++) {
            if (elem.elem.currentTrackMilliseconds[j] === ms) found = true;
          }

          if (!found) {
            elem.elem.currentTrackMilliseconds.push(ms);
            elem.elem.currentTrackWholeNotes.push(rt);
          }
        }
      }
    } //var tieAdjustment = 0;


    if (elem.pitches) {
      var thisBreakBetweenNotes = '';
      var ret = findNoteModifications(elem, velocity);
      if (ret.thisBreakBetweenNotes) thisBreakBetweenNotes = ret.thisBreakBetweenNotes;
      var origVelocity = velocity;
      if (ret.velocity) velocity = ret.velocity; // TODO-PER: Can also make a different sound on style=x and style=harmonic

      var ePitches = elem.pitches;

      if (elem.style === "rhythm") {
        hasRhythmHead = true;

        if (lastChord && lastChord.chick) {
          ePitches = [];

          for (var i2 = 0; i2 < lastChord.chick.length; i2++) {
            var note2 = parseCommon.clone(elem.pitches[0]);
            note2.actualPitch = lastChord.chick[i2];
            ePitches.push(note2);
          }
        }
      }

      if (elem.elem) elem.elem.midiPitches = [];

      for (var i = 0; i < ePitches.length; i++) {
        var note = ePitches[i];
        if (!note) continue;
        if (note.startSlur) slurCount += note.startSlur.length;
        if (note.endSlur) slurCount -= note.endSlur.length;
        var actualPitch = note.actualPitch ? note.actualPitch : adjustPitch(note);

        if (currentInstrument === drumInstrument && percmap) {
          var name = pitchesToPerc(note);
          if (name && percmap[name]) actualPitch = percmap[name].sound;
        }

        var p = {
          cmd: 'note',
          pitch: actualPitch,
          volume: velocity,
          start: timeToRealTime(elem.time),
          duration: durationRounded(note.duration),
          instrument: currentInstrument
        };
        p = adjustForMicroTone(p);

        if (elem.gracenotes) {
          if (elem.gracenotes.length == 1) {
            p.duration = p.duration / 32;
            p.start = p.start + p.duration * elem.gracenotes.length;
          } else if (elem.gracenotes.length == 2) {
            p.duration = p.duration / 64;
            p.start = p.start + p.duration * (elem.gracenotes.length - 1) / 2;
          } else {
            p.duration = 1 / 16;
            p.start = p.start + p.duration;
          }
        }

        if (elem.elem) elem.elem.midiPitches.push(p);

        if (ret.noteModification) {
          doModifiedNotes(ret.noteModification, p, ret.accent, origVelocity, note.duration);
        } else {
          if (slurCount > 0) p.endType = 'tenuto';else if (thisBreakBetweenNotes) p.endType = thisBreakBetweenNotes;

          switch (p.endType) {
            case "tenuto":
              p.gap = slurredBreakBetweenNotes;
              break;

            case "staccato":
              var d = p.duration * staccatoBreakBetweenNotes;
              p.gap = startingTempo / 60 * d;
              break;

            default:
              p.gap = normalBreakBetweenNotes;
              break;
          }

          currentTrack.push(p);
        }
      }

      lastNoteDurationPosition = currentTrack.length - 1;
    }

    var realDur = getRealDuration(elem);
    lastEventTime = Math.max(lastEventTime, timeToRealTime(elem.time) + durationRounded(realDur));
    return setChordTrack;
  }

  function getRealDuration(elem) {
    if (elem.pitches && elem.pitches.length > 0 && elem.pitches[0]) return elem.pitches[0].duration;
    if (elem.elem) return elem.elem.duration;
    return elem.duration;
  }

  var scale = [0, 2, 4, 5, 7, 9, 11];

  function adjustPitch(note) {
    if (note.midipitch !== undefined) return note.midipitch; // The pitch might already be known, for instance if there is a drummap.

    var pitch = note.pitch;

    if (note.accidental) {
      switch (note.accidental) {
        // change that pitch (not other octaves) for the rest of the bar
        case "sharp":
          barAccidentals[pitch] = 1;
          break;

        case "flat":
          barAccidentals[pitch] = -1;
          break;

        case "natural":
          barAccidentals[pitch] = 0;
          break;

        case "dblsharp":
          barAccidentals[pitch] = 2;
          break;

        case "dblflat":
          barAccidentals[pitch] = -2;
          break;

        case "quartersharp":
          barAccidentals[pitch] = 0.25;
          break;

        case "quarterflat":
          barAccidentals[pitch] = -0.25;
          break;
      }
    }

    var actualPitch = extractOctave(pitch) * 12 + scale[extractNote(pitch)] + 60;

    if (barAccidentals[pitch] !== undefined) {
      // An accidental is always taken at face value and supersedes the key signature.
      actualPitch += barAccidentals[pitch];
    } else {
      // use normal accidentals
      actualPitch += accidentals[extractNote(pitch)];
    }

    actualPitch += transpose;
    return actualPitch;
  }

  function setKeySignature(elem) {
    var accidentals = [0, 0, 0, 0, 0, 0, 0];
    if (!elem.accidentals) return accidentals;

    for (var i = 0; i < elem.accidentals.length; i++) {
      var acc = elem.accidentals[i];
      var d;

      switch (acc.acc) {
        case "flat":
          d = -1;
          break;

        case "quarterflat":
          d = -0.25;
          break;

        case "sharp":
          d = 1;
          break;

        case "quartersharp":
          d = 0.25;
          break;

        default:
          d = 0;
          break;
      }

      var lowercase = acc.note.toLowerCase();
      var note = extractNote(lowercase.charCodeAt(0) - 'c'.charCodeAt(0));
      accidentals[note] += d;
    }

    return accidentals;
  }

  function processGraceNotes(graces, companionDuration) {
    // Grace notes take up half of the note value. So if there are many of them they are all real short.
    var graceDuration = 0;
    var ret = [];
    var grace;

    for (var g = 0; g < graces.length; g++) {
      grace = graces[g];
      graceDuration += grace.duration;
    }

    var multiplier = companionDuration / 2 / graceDuration;

    for (g = 0; g < graces.length; g++) {
      grace = graces[g];
      var pitch = {
        pitch: adjustPitch(grace),
        duration: grace.duration * multiplier
      };
      pitch = adjustForMicroTone(pitch);
      ret.push(pitch);
    }

    return ret;
  }

  function writeGraceNotes(graces, start, velocity, currentInstrument) {
    var midiGrace = [];
    velocity = Math.round(velocity);

    if (graces.length == 2) {
      graces.pop();
    }

    for (var g = 0; g < graces.length; g++) {
      var gp = graces[g];
      currentTrack.push({
        cmd: 'note',
        pitch: gp.pitch,
        volume: velocity,
        start: start,
        duration: gp.duration,
        gap: 0,
        instrument: currentInstrument,
        style: 'grace'
      });
      midiGrace.push({
        pitch: gp.pitch,
        durationInMeasures: gp.duration,
        volume: velocity,
        instrument: currentInstrument
      });
      start += gp.duration;
    }

    return midiGrace;
  }

  var quarterToneFactor = 0.02930223664349;

  function adjustForMicroTone(description) {
    // if the pitch is not a whole number then make it a whole number and add a tuning factor
    var pitch = '' + description.pitch;

    if (pitch.indexOf(".75") >= 0) {
      description.pitch = Math.round(description.pitch);
      description.cents = -50;
    } else if (pitch.indexOf(".25") >= 0) {
      description.pitch = Math.round(description.pitch);
      description.cents = 50;
    }

    return description;
  }

  function extractOctave(pitch) {
    return Math.floor(pitch / 7);
  }

  function extractNote(pitch) {
    pitch = pitch % 7;
    if (pitch < 0) pitch += 7;
    return pitch;
  }

  var basses = {
    'A': 33,
    'B': 35,
    'C': 36,
    'D': 38,
    'E': 40,
    'F': 41,
    'G': 43
  };

  function interpretChord(name) {
    // chords have the format:
    // [root][acc][modifier][/][bass][acc]
    // (The chord might be surrounded by parens. Just ignore them.)
    // root must be present and must be from A-G.
    // acc is optional and can be # or b
    // The modifier can be a wide variety of things, like "maj7". As they are discovered, more are supported here.
    // If there is a slash, then there is a bass note, which can be from A-G, with an optional acc.
    // If the root is unrecognized, then "undefined" is returned and there is no chord.
    // If the modifier is unrecognized, a major triad is returned.
    // If the bass notes is unrecognized, it is ignored.
    if (name.length === 0) return undefined;
    if (name === 'break') return {
      chick: []
    };
    var root = name.substring(0, 1);

    if (root === '(') {
      name = name.substring(1, name.length - 2);
      if (name.length === 0) return undefined;
      root = name.substring(0, 1);
    }

    var bass = basses[root];
    if (!bass) // If the bass note isn't listed, then this was an unknown root. Only A-G are accepted.
      return undefined; // Don't transpose the chords more than an octave.

    var chordTranspose = transpose;

    while (chordTranspose < -8) {
      chordTranspose += 12;
    }

    while (chordTranspose > 8) {
      chordTranspose -= 12;
    }

    bass += chordTranspose;
    var bass2 = bass - 5; // The alternating bass is a 4th below

    var chick;
    if (name.length === 1) chick = chordNotes(bass, '');
    var remaining = name.substring(1);
    var acc = remaining.substring(0, 1);

    if (acc === 'b' || acc === '♭') {
      bass--;
      bass2--;
      remaining = remaining.substring(1);
    } else if (acc === '#' || acc === '♯') {
      bass++;
      bass2++;
      remaining = remaining.substring(1);
    }

    var arr = remaining.split('/');
    chick = chordNotes(bass, arr[0]); // If the 5th is altered then the bass is altered. Normally the bass is 7 from the root, so adjust if it isn't.

    if (chick.length >= 3) {
      var fifth = chick[2] - chick[0];
      bass2 = bass2 + fifth - 7;
    }

    if (arr.length === 2) {
      var explicitBass = basses[arr[1].substring(0, 1)];

      if (explicitBass) {
        var bassAcc = arr[1].substring(1);
        var bassShift = {
          '#': 1,
          '♯': 1,
          'b': -1,
          '♭': -1
        }[bassAcc] || 0;
        bass = basses[arr[1].substring(0, 1)] + bassShift + chordTranspose;
        bass2 = bass;
      }
    }

    return {
      boom: bass,
      boom2: bass2,
      chick: chick
    };
  }

  var chordIntervals = {
    // diminished (all flat 5 chords)
    'dim': [0, 3, 6],
    '°': [0, 3, 6],
    '˚': [0, 3, 6],
    'dim7': [0, 3, 6, 9],
    '°7': [0, 3, 6, 9],
    '˚7': [0, 3, 6, 9],
    'ø7': [0, 3, 6, 10],
    'm7(b5)': [0, 3, 6, 10],
    'm7b5': [0, 3, 6, 10],
    'm7♭5': [0, 3, 6, 10],
    '-7(b5)': [0, 3, 6, 10],
    '-7b5': [0, 3, 6, 10],
    '7b5': [0, 4, 6, 10],
    '7(b5)': [0, 4, 6, 10],
    '7♭5': [0, 4, 6, 10],
    '7(b9,b5)': [0, 4, 6, 10, 13],
    '7b9,b5': [0, 4, 6, 10, 13],
    '7(#9,b5)': [0, 4, 6, 10, 15],
    '7#9b5': [0, 4, 6, 10, 15],
    'maj7(b5)': [0, 4, 6, 11],
    'maj7b5': [0, 4, 6, 11],
    '13(b5)': [0, 4, 6, 10, 14, 21],
    '13b5': [0, 4, 6, 10, 14, 21],
    // minor (all normal 5, minor 3 chords)
    'm': [0, 3, 7],
    '-': [0, 3, 7],
    'm6': [0, 3, 7, 9],
    '-6': [0, 3, 7, 9],
    'm7': [0, 3, 7, 10],
    '-7': [0, 3, 7, 10],
    '-(b6)': [0, 3, 7, 8],
    '-b6': [0, 3, 7, 8],
    '-6/9': [0, 3, 7, 9, 14],
    '-7(b9)': [0, 3, 7, 10, 13],
    '-7b9': [0, 3, 7, 10, 13],
    '-maj7': [0, 3, 7, 11],
    '-9+7': [0, 3, 7, 11, 13],
    '-11': [0, 3, 7, 11, 14, 17],
    'm11': [0, 3, 7, 11, 14, 17],
    '-maj9': [0, 3, 7, 11, 14],
    '-∆9': [0, 3, 7, 11, 14],
    'mM9': [0, 3, 7, 11, 14],
    // major (all normal 5, major 3 chords)
    'M': [0, 4, 7],
    '6': [0, 4, 7, 9],
    '6/9': [0, 4, 7, 9, 14],
    '6add9': [0, 4, 7, 9, 14],
    '69': [0, 4, 7, 9, 14],
    '7': [0, 4, 7, 10],
    '9': [0, 4, 7, 10, 14],
    '11': [0, 7, 10, 14, 17],
    '13': [0, 4, 7, 10, 14, 21],
    '7b9': [0, 4, 7, 10, 13],
    '7♭9': [0, 4, 7, 10, 13],
    '7(b9)': [0, 4, 7, 10, 13],
    '7(#9)': [0, 4, 7, 10, 15],
    '7#9': [0, 4, 7, 10, 15],
    '(13)': [0, 4, 7, 10, 14, 21],
    '7(9,13)': [0, 4, 7, 10, 14, 21],
    '7(#9,b13)': [0, 4, 7, 10, 15, 20],
    '7(#11)': [0, 4, 7, 10, 14, 18],
    '7#11': [0, 4, 7, 10, 14, 18],
    '7(b13)': [0, 4, 7, 10, 20],
    '7b13': [0, 4, 7, 10, 20],
    '9(#11)': [0, 4, 7, 10, 14, 18],
    '9#11': [0, 4, 7, 10, 14, 18],
    '13(#11)': [0, 4, 7, 10, 18, 21],
    '13#11': [0, 4, 7, 10, 18, 21],
    'maj7': [0, 4, 7, 11],
    '∆7': [0, 4, 7, 11],
    'Δ7': [0, 4, 7, 11],
    'maj9': [0, 4, 7, 11, 14],
    'maj7(9)': [0, 4, 7, 11, 14],
    'maj7(11)': [0, 4, 7, 11, 17],
    'maj7(#11)': [0, 4, 7, 11, 18],
    'maj7(13)': [0, 4, 7, 14, 21],
    'maj7(9,13)': [0, 4, 7, 11, 14, 21],
    '7sus4': [0, 5, 7, 10],
    'm7sus4': [0, 3, 7, 10, 17],
    'sus4': [0, 5, 7],
    'sus2': [0, 2, 7],
    '7sus2': [0, 2, 7, 10],
    '9sus4': [0, 5, 7, 10, 14],
    '13sus4': [0, 5, 7, 10, 14, 21],
    // augmented (all sharp 5 chords)
    'aug7': [0, 4, 8, 10],
    '+7': [0, 4, 8, 10],
    '+': [0, 4, 8],
    '7#5': [0, 4, 8, 10],
    '7♯5': [0, 4, 8, 10],
    '7+5': [0, 4, 8, 10],
    '9#5': [0, 4, 8, 10, 14],
    '9♯5': [0, 4, 8, 10, 14],
    '9+5': [0, 4, 8, 10, 14],
    '-7(#5)': [0, 3, 8, 10],
    '-7#5': [0, 3, 8, 10],
    '7(#5)': [0, 4, 8, 10],
    '7(b9,#5)': [0, 4, 8, 10, 13],
    '7b9#5': [0, 4, 8, 10, 13],
    'maj7(#5)': [0, 4, 8, 11],
    'maj7#5': [0, 4, 8, 11],
    'maj7(#5,#11)': [0, 4, 8, 11, 18],
    'maj7#5#11': [0, 4, 8, 11, 18],
    '9(#5)': [0, 4, 8, 10, 14],
    '13(#5)': [0, 4, 8, 10, 14, 21],
    '13#5': [0, 4, 8, 10, 14, 21]
  };

  function chordNotes(bass, modifier) {
    var intervals = chordIntervals[modifier];

    if (!intervals) {
      if (modifier.slice(0, 2).toLowerCase() === 'ma' || modifier.charAt(0) === 'M') intervals = chordIntervals.M;else if (modifier.charAt(0) === 'm' || modifier.charAt(0) === '-') intervals = chordIntervals.m;else intervals = chordIntervals.M;
    }

    bass += 12; // the chord is an octave above the bass note.

    var notes = [];

    for (var i = 0; i < intervals.length; i++) {
      notes.push(bass + intervals[i]);
    }

    return notes;
  }

  function writeBoom(boom, beatLength, volume, beat, noteLength) {
    // undefined means there is a stop time.
    if (boom !== undefined) chordTrack.push({
      cmd: 'note',
      pitch: boom,
      volume: volume,
      start: lastBarTime + beat * durationRounded(beatLength),
      duration: durationRounded(noteLength),
      gap: 0,
      instrument: chordInstrument
    });
  }

  function writeChick(chick, beatLength, volume, beat, noteLength) {
    for (var c = 0; c < chick.length; c++) {
      chordTrack.push({
        cmd: 'note',
        pitch: chick[c],
        volume: volume,
        start: lastBarTime + beat * durationRounded(beatLength),
        duration: durationRounded(noteLength),
        gap: 0,
        instrument: chordInstrument
      });
    }
  }

  var rhythmPatterns = {
    "2/2": ['boom', 'chick'],
    "2/4": ['boom', 'chick'],
    "3/4": ['boom', 'chick', 'chick'],
    "4/4": ['boom', 'chick', 'boom2', 'chick'],
    "5/4": ['boom', 'chick', 'chick', 'boom2', 'chick'],
    "6/8": ['boom', '', 'chick', 'boom2', '', 'chick'],
    "9/8": ['boom', '', 'chick', 'boom2', '', 'chick', 'boom2', '', 'chick'],
    "12/8": ['boom', '', 'chick', 'boom2', '', 'chick', 'boom', '', 'chick', 'boom2', '', 'chick']
  };

  function resolveChords(startTime, endTime) {
    var num = meter.num;
    var den = meter.den;
    var beatLength = 1 / den;
    var noteLength = beatLength / 2;
    var pattern = rhythmPatterns[num + '/' + den];
    var thisMeasureLength = parseInt(num, 10) / parseInt(den, 10);
    var portionOfAMeasure = thisMeasureLength - (endTime - startTime) / tempoChangeFactor;
    if (Math.abs(portionOfAMeasure) < 0.00001) portionOfAMeasure = false;

    if (!pattern || portionOfAMeasure) {
      // If it is an unsupported meter, or this isn't a full bar, just chick on each beat.
      pattern = [];
      var beatsPresent = (endTime - startTime) / tempoChangeFactor / beatLength;

      for (var p = 0; p < beatsPresent; p++) {
        pattern.push("chick");
      }
    } //console.log(startTime, pattern, currentChords, lastChord, portionOfAMeasure)


    if (currentChords.length === 0) {
      // there wasn't a new chord this measure, so use the last chord declared.
      currentChords.push({
        beat: 0,
        chord: lastChord
      });
    }

    if (currentChords[0].beat !== 0 && lastChord) {
      // this is the case where there is a chord declared in the measure, but not on its first beat.
      if (chordLastBar) currentChords.unshift({
        beat: 0,
        chord: chordLastBar
      });
    }

    if (currentChords.length === 1) {
      for (var m = currentChords[0].beat; m < pattern.length; m++) {
        if (!hasRhythmHead) {
          switch (pattern[m]) {
            case 'boom':
              writeBoom(currentChords[0].chord.boom, beatLength, boomVolume, m, noteLength);
              break;

            case 'boom2':
              writeBoom(currentChords[0].chord.boom2, beatLength, boomVolume, m, noteLength);
              break;

            case 'chick':
              writeChick(currentChords[0].chord.chick, beatLength, chickVolume, m, noteLength);
              break;
          }
        }
      }

      return;
    } // If we are here it is because more than one chord was declared in the measure, so we have to sort out what chord goes where.
    // First, normalize the chords on beats.


    var mult = beatLength === 0.125 ? 3 : 1; // If this is a compound meter then the beats in the currentChords is 1/3 of the true beat

    var beats = {};

    for (var i = 0; i < currentChords.length; i++) {
      var cc = currentChords[i];
      var b = Math.round(cc.beat * mult);
      beats['' + b] = cc;
    } // - If there is a chord on the second beat, play a chord for the first beat instead of a bass note.
    // - Likewise, if there is a chord on the fourth beat of 4/4, play a chord on the third beat instead of a bass note.


    for (var m2 = 0; m2 < pattern.length; m2++) {
      var thisChord;
      if (beats['' + m2]) thisChord = beats['' + m2];
      var lastBoom;

      if (!hasRhythmHead && thisChord) {
        switch (pattern[m2]) {
          case 'boom':
            if (beats['' + (m2 + 1)]) // If there is not a chord change on the next beat, play a bass note.
              writeChick(thisChord.chord.chick, beatLength, chickVolume, m2, noteLength);else {
              writeBoom(thisChord.chord.boom, beatLength, boomVolume, m2, noteLength);
              lastBoom = thisChord.chord.boom;
            }
            break;

          case 'boom2':
            if (beats['' + (m2 + 1)]) writeChick(thisChord.chord.chick, beatLength, chickVolume, m2, noteLength);else {
              // If there is the same root as the last chord, use the alternating bass, otherwise play the root.
              if (lastBoom === thisChord.chord.boom) {
                writeBoom(thisChord.chord.boom2, beatLength, boomVolume, m2, noteLength);
                lastBoom = undefined;
              } else {
                writeBoom(thisChord.chord.boom, beatLength, boomVolume, m2, noteLength);
                lastBoom = thisChord.chord.boom;
              }
            }
            break;

          case 'chick':
            writeChick(thisChord.chord.chick, beatLength, chickVolume, m2, noteLength);
            break;

          case '':
            if (beats['' + m2]) // If there is an explicit chord on this beat, play it.
              writeChick(thisChord.chord.chick, beatLength, chickVolume, m2, noteLength);
            break;
        }
      }
    }
  }

  function normalizeDrumDefinition(params) {
    // Be very strict with the drum definition. If anything is not perfect,
    // just turn the drums off.
    // Perhaps all of this logic belongs in the parser instead.
    if (params.pattern.length === 0 || params.on === false) return {
      on: false
    };
    var str = params.pattern[0];
    var events = [];
    var event = "";
    var totalPlay = 0;

    for (var i = 0; i < str.length; i++) {
      if (str[i] === 'd') totalPlay++;

      if (str[i] === 'd' || str[i] === 'z') {
        if (event.length !== 0) {
          events.push(event);
          event = str[i];
        } else event = event + str[i];
      } else {
        if (event.length === 0) {
          // there was an error: the string should have started with d or z
          return {
            on: false
          };
        }

        event = event + str[i];
      }
    }

    if (event.length !== 0) events.push(event); // Now the events array should have one item per event.
    // There should be two more params for each event: the volume and the pitch.

    if (params.pattern.length !== totalPlay * 2 + 1) return {
      on: false
    };
    var ret = {
      on: true,
      bars: params.bars,
      pattern: []
    };
    var beatLength = getBeatFraction(meter);
    var playCount = 0;

    for (var j = 0; j < events.length; j++) {
      event = events[j];
      var len = 1;
      var div = false;
      var num = 0;

      for (var k = 1; k < event.length; k++) {
        switch (event[k]) {
          case "/":
            if (num !== 0) len *= num;
            num = 0;
            div = true;
            break;

          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9":
            num = num * 10 + event[k];
            break;

          default:
            return {
              on: false
            };
        }
      }

      if (div) {
        if (num === 0) num = 2; // a slash by itself is interpreted as "/2"

        len /= num;
      } else if (num) len *= num;

      if (event[0] === 'd') {
        ret.pattern.push({
          len: len * beatLength,
          pitch: params.pattern[1 + playCount],
          velocity: params.pattern[1 + playCount + totalPlay]
        });
        playCount++;
      } else ret.pattern.push({
        len: len * beatLength,
        pitch: null
      });
    } // Now normalize the pattern to cover the correct number of measures. The note lengths passed are relative to each other and need to be scaled to fit a measure.


    var totalTime = 0;
    var measuresPerBeat = meter.num / meter.den;

    for (var ii = 0; ii < ret.pattern.length; ii++) {
      totalTime += ret.pattern[ii].len;
    }

    var numBars = params.bars ? params.bars : 1;
    var factor = totalTime / numBars / measuresPerBeat;

    for (ii = 0; ii < ret.pattern.length; ii++) {
      ret.pattern[ii].len = ret.pattern[ii].len / factor;
    }

    return ret;
  }

  function writeDrum(channel) {
    if (drumTrack.length === 0 && !drumDefinition.on) return;
    var measureLen = meter.num / meter.den;

    if (drumTrack.length === 0) {
      if (lastEventTime < measureLen) return; // This is true if there are pickup notes. The drum doesn't start until the first full measure.

      drumTrack.push({
        cmd: 'program',
        channel: channel,
        instrument: drumInstrument
      });
    }

    if (!drumDefinition.on) {
      // this is the case where there has been a drum track, but it was specifically turned off.
      return;
    }

    var start = lastBarTime;

    for (var i = 0; i < drumDefinition.pattern.length; i++) {
      var len = durationRounded(drumDefinition.pattern[i].len);

      if (drumDefinition.pattern[i].pitch) {
        drumTrack.push({
          cmd: 'note',
          pitch: drumDefinition.pattern[i].pitch,
          volume: drumDefinition.pattern[i].velocity,
          start: start,
          duration: len,
          gap: 0,
          instrument: drumInstrument
        });
      }

      start += len;
    }
  }

  function findOctaves(tracks, detuneCents) {
    var timing = {};

    for (var i = 0; i < tracks.length; i++) {
      for (var j = 0; j < tracks[i].length; j++) {
        var note = tracks[i][j];

        if (note.cmd === "note") {
          if (timing[note.start] === undefined) timing[note.start] = [];
          timing[note.start].push({
            track: i,
            event: j,
            pitch: note.pitch
          });
        }
      }
    }

    var keys = Object.keys(timing);

    for (i = 0; i < keys.length; i++) {
      var arr = timing[keys[i]];

      if (arr.length > 1) {
        arr = arr.sort(function (a, b) {
          return a.pitch - b.pitch;
        });
        var topEvent = arr[arr.length - 1];
        var topNote = topEvent.pitch % 12;
        var found = false;

        for (j = 0; !found && j < arr.length - 1; j++) {
          if (arr[j].pitch % 12 === topNote) found = true;
        }

        if (found) {
          var event = tracks[topEvent.track][topEvent.event];
          if (!event.cents) event.cents = 0;
          event.cents += detuneCents;
        }
      }
    }
  }
})();

module.exports = flatten;

/***/ }),

/***/ "./src/synth/abc_midi_renderer.js":
/*!****************************************!*\
  !*** ./src/synth/abc_midi_renderer.js ***!
  \****************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

//    abc_midi_renderer.js: Create the actual format for the midi.
var centsToFactor = __webpack_require__(/*! ./cents-to-factor */ "./src/synth/cents-to-factor.js");

var rendererFactory;

(function () {
  "use strict";

  function setAttributes(elm, attrs) {
    for (var attr in attrs) {
      if (attrs.hasOwnProperty(attr)) elm.setAttribute(attr, attrs[attr]);
    }

    return elm;
  }

  function Midi() {
    this.trackstrings = "";
    this.trackcount = 0;
    this.noteOnAndChannel = "%90";
    this.noteOffAndChannel = "%80";
  }

  Midi.prototype.setTempo = function (qpm) {
    if (this.trackcount === 0) {
      this.startTrack();
      this.track += "%00%FF%51%03" + toHex(Math.round(60000000 / qpm), 6);
      this.endTrack();
    }
  };

  Midi.prototype.setGlobalInfo = function (qpm, name, key, time) {
    if (this.trackcount === 0) {
      this.startTrack();
      var divisions = Math.round(60000000 / qpm); // Add the tempo

      this.track += "%00%FF%51%03" + toHex(divisions, 6);
      if (key) this.track += keySignature(key);
      if (time) this.track += timeSignature(time);

      if (name) {
        this.track += encodeString(name, "%01");
      }

      this.endTrack();
    }
  };

  Midi.prototype.startTrack = function () {
    this.noteWarped = {};
    this.track = "";
    this.trackName = "";
    this.trackInstrument = "";
    this.silencelength = 0;
    this.trackcount++;

    if (this.instrument) {
      this.setInstrument(this.instrument);
    }
  };

  Midi.prototype.endTrack = function () {
    this.track = this.trackName + this.trackInstrument + this.track;
    var tracklength = toHex(this.track.length / 3 + 4, 8);
    this.track = "MTrk" + tracklength + // track header
    this.track + '%00%FF%2F%00'; // track end

    this.trackstrings += this.track;
  };

  Midi.prototype.setText = function (type, text) {
    // MIDI defines the following types of events:
    //FF 01 len text Text Event
    //FF 02 len text Copyright Notice
    //FF 03 len text Sequence/Track Name
    //FF 04 len text Instrument Name
    //FF 05 len text Lyric
    //FF 06 len text Marker
    //FF 07 len text Cue Point
    switch (type) {
      case 'name':
        this.trackName = encodeString(text, "%03");
        break;
    }
  };

  Midi.prototype.setInstrument = function (number) {
    this.trackInstrument = "%00%C0" + toHex(number, 2);
    this.instrument = number;
  };

  Midi.prototype.setChannel = function (number, pan) {
    this.channel = number;
    var ccPrefix = "%00%B" + this.channel.toString(16); // Reset midi, in case it was set previously.

    this.track += ccPrefix + "%79%00"; // Reset All Controllers

    this.track += ccPrefix + "%40%00"; // Damper pedal

    this.track += ccPrefix + "%5B%30"; // Effect 1 Depth (reverb)
    // Translate pan as -1 to 1 to 0 to 127

    if (!pan) pan = 0;
    pan = Math.round((pan + 1) * 64);
    this.track += ccPrefix + "%0A" + toHex(pan, 2); // Pan

    this.track += ccPrefix + "%07%64"; // Channel Volume

    this.noteOnAndChannel = "%9" + this.channel.toString(16);
    this.noteOffAndChannel = "%8" + this.channel.toString(16);
  };

  var HALF_STEP = 4096; // For the pitch wheel - (i.e. the distance from C to C#)

  Midi.prototype.startNote = function (pitch, loudness, cents) {
    this.track += toDurationHex(this.silencelength); // only need to shift by amount of silence (if there is any)

    this.silencelength = 0;

    if (cents) {
      // the pitch is altered so send a midi pitch wheel event
      this.track += "%e" + this.channel.toString(16);
      var bend = Math.round(centsToFactor(cents) * HALF_STEP);
      this.track += to7BitHex(0x2000 + bend);
      this.track += toDurationHex(0); // this all happens at once so there is a zero length here

      this.noteWarped[pitch] = true;
    }

    this.track += this.noteOnAndChannel;
    this.track += "%" + pitch.toString(16) + toHex(loudness, 2); //note
  };

  Midi.prototype.endNote = function (pitch) {
    this.track += toDurationHex(this.silencelength); // only need to shift by amount of silence (if there is any)

    this.silencelength = 0;

    if (this.noteWarped[pitch]) {
      // the pitch was altered so alter it back.
      this.track += "%e" + this.channel.toString(16);
      this.track += to7BitHex(0x2000);
      this.track += toDurationHex(0); // this all happens at once so there is a zero length here

      this.noteWarped[pitch] = false;
    }

    this.track += this.noteOffAndChannel;
    this.track += "%" + pitch.toString(16) + "%00"; //end note
  };

  Midi.prototype.addRest = function (length) {
    this.silencelength += length;
    if (this.silencelength < 0) this.silencelength = 0;
  };

  Midi.prototype.getData = function () {
    return "data:audio/midi," + "MThd%00%00%00%06%00%01" + toHex(this.trackcount, 4) + "%01%e0" + // header
    this.trackstrings;
  };

  Midi.prototype.embed = function (parent, noplayer) {
    var data = this.getData();
    var link = setAttributes(document.createElement('a'), {
      href: data
    });
    link.innerHTML = "download midi";
    parent.insertBefore(link, parent.firstChild);
    if (noplayer) return;
    var embed = setAttributes(document.createElement('embed'), {
      src: data,
      type: 'video/quicktime',
      controller: 'true',
      autoplay: 'false',
      loop: 'false',
      enablejavascript: 'true',
      style: 'display:block; height: 20px;'
    });
    parent.insertBefore(embed, parent.firstChild);
  };

  function encodeString(str, cmdType) {
    // If there are multi-byte chars, we don't know how long the string will be until we create it.
    var nameArray = "";

    for (var i = 0; i < str.length; i++) {
      nameArray += toHex(str.charCodeAt(i), 2);
    }

    return "%00%FF" + cmdType + toHex(nameArray.length / 3, 2) + nameArray; // Each byte is represented by three chars "%XX", so divide by 3 to get the length.
  }

  function keySignature(key) {
    //00 FF 5902 03 00 - key signature
    if (!key || !key.accidentals) return "";
    var hex = "%00%FF%59%02";
    var sharpCount = 0;
    var flatCount = 256;

    for (var i = 0; i < key.accidentals.length; i++) {
      if (key.accidentals[i].acc === "sharp") sharpCount++;else if (key.accidentals[i].acc === "flat") flatCount--;
    }

    var sig = flatCount !== 256 ? toHex(flatCount, 2) : toHex(sharpCount, 2);
    var mode = key.mode === "m" ? "%01" : "%00";
    return hex + sig + mode;
  }

  function timeSignature(time) {
    //00 FF 58 04 04 02 30 08 - time signature
    var hex = "%00%FF%58%04" + toHex(time.num, 2);
    var dens = {
      1: 0,
      2: 1,
      4: 2,
      8: 3,
      16: 4,
      32: 5
    };
    var den = dens[time.den];
    if (!den) return ""; // the denominator is not supported, so just don't include this.

    hex += toHex(den, 2);
    var clocks;

    switch (time.num + "/" + time.den) {
      case "2/4":
      case "3/4":
      case "4/4":
      case "5/4":
        clocks = 24;
        break;

      case "6/4":
        clocks = 72;
        break;

      case "2/2":
      case "3/2":
      case "4/2":
        clocks = 48;
        break;

      case "3/8":
      case "6/8":
      case "9/8":
      case "12/8":
        clocks = 36;
        break;
    }

    if (!clocks) return ""; // time sig is not supported.

    hex += toHex(clocks, 2);
    return hex + "%08";
  } // s is assumed to be of even length


  function encodeHex(s) {
    var ret = "";

    for (var i = 0; i < s.length; i += 2) {
      ret += "%";
      ret += s.substr(i, 2);
    }

    return ret;
  }

  function toHex(n, padding) {
    var s = n.toString(16);
    s = s.split(".")[0];

    while (s.length < padding) {
      s = "0" + s;
    }

    if (s.length > padding) s = s.substring(0, padding);
    return encodeHex(s);
  }

  function to7BitHex(n) {
    // this takes a number and shifts all digits from the 7th one to the left.
    n = Math.round(n);
    var lower = n % 128;
    var higher = n - lower;
    return toHex(higher * 2 + lower, 4);
  }

  function toDurationHex(n) {
    var res = 0;
    var a = []; // cut up into 7 bit chunks;

    n = Math.round(n);

    while (n !== 0) {
      a.push(n & 0x7F);
      n = n >> 7;
    } // join the 7 bit chunks together, all but last chunk get leading 1


    for (var i = a.length - 1; i >= 0; i--) {
      res = res << 8;
      var bits = a[i];

      if (i !== 0) {
        bits = bits | 0x80;
      }

      res = res | bits;
    }

    var padding = res.toString(16).length;
    padding += padding % 2;
    return toHex(res, padding);
  }

  rendererFactory = function rendererFactory() {
    return new Midi();
  };
})();

module.exports = rendererFactory;

/***/ }),

/***/ "./src/synth/abc_midi_sequencer.js":
/*!*****************************************!*\
  !*** ./src/synth/abc_midi_sequencer.js ***!
  \*****************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

//    abc_midi_sequencer.js: Turn parsed abc into a linear series of events.
var sequence;

var parseCommon = __webpack_require__(/*! ../parse/abc_common */ "./src/parse/abc_common.js");

(function () {
  "use strict";

  var measureLength; // The abc is provided to us line by line. It might have repeats in it. We want to re arrange the elements to
  // be an array of voices with all the repeats embedded, and no lines. Then it is trivial to go through the events
  // one at a time and turn it into midi.

  var PERCUSSION_PROGRAM = 128;

  sequence = function sequence(abctune, options) {
    // Global options
    options = options || {};
    var qpm;
    var program = options.program || 0; // The program if there isn't a program specified.

    var transpose = options.midiTranspose || 0; // If the tune has a visual transpose then that needs to be subtracted out because we are getting the visual object.

    if (abctune.visualTranspose) transpose -= abctune.visualTranspose;
    var channel = options.channel || 0;
    var channelExplicitlySet = false;
    var drumPattern = options.drum || "";
    var drumBars = options.drumBars || 1;
    var drumIntro = options.drumIntro || 0;
    var drumOn = drumPattern !== "";
    var style = []; // The note head style for each voice.

    var rhythmHeadThisBar = false; // Rhythm notation was detected.

    var crescendoSize = 50; // how much to increase or decrease volume when crescendo/diminuendo is encountered.
    // All of the above overrides need to be integers

    program = parseInt(program, 10);
    transpose = parseInt(transpose, 10);
    channel = parseInt(channel, 10);
    if (channel === 10) program = PERCUSSION_PROGRAM;
    drumPattern = drumPattern.split(" ");
    drumBars = parseInt(drumBars, 10);
    drumIntro = parseInt(drumIntro, 10);
    var bagpipes = abctune.formatting.bagpipes; // If it is bagpipes, then the gracenotes are played on top of the main note.

    if (bagpipes) program = 71; // %%MIDI fermatafixed
    // %%MIDI fermataproportional
    // %%MIDI deltaloudness n
    // %%MIDI gracedivider b
    // %%MIDI ratio n m
    // %%MIDI beat a b c n
    // %%MIDI grace a/b
    // %%MIDI trim x/y
    // %MIDI gchordon
    // %MIDI gchordoff
    // %%MIDI bassprog 45
    // %%MIDI chordprog 24
    // %%MIDI chordname name n1 n2 n3 n4 n5 n6
    //%%MIDI beat ⟨int1⟩ ⟨int2⟩ ⟨int3⟩ ⟨int4⟩: controls the volumes of the notes in a measure. The first note in a bar has volume ⟨int1⟩; other ‘strong’ notes have volume ⟨int2⟩ and all the rest have volume ⟨int3⟩. These values must be in the range 0–127. The parameter ⟨int4⟩ determines which notes are ‘strong’. If the time signature is x/y, then each note is given a position number k = 0, 1, 2. . . x-1 within each bar. If k is a multiple of ⟨int4⟩, then the note is ‘strong’.

    var startingMidi = [];

    if (abctune.formatting.midi) {
      //console.log("MIDI Formatting:", abctune.formatting.midi);
      var globals = abctune.formatting.midi;

      if (globals.program && globals.program.length > 0) {
        program = globals.program[0];

        if (globals.program.length > 1) {
          program = globals.program[1];
          channel = globals.program[0];
        }

        channelExplicitlySet = true;
      }

      if (globals.transpose) transpose = globals.transpose[0];

      if (globals.channel) {
        channel = globals.channel[0];
        channelExplicitlySet = true;
      }

      if (globals.drum) drumPattern = globals.drum;
      if (globals.drumbars) drumBars = globals.drumbars[0];
      if (globals.drumon) drumOn = true;
      if (channel === 10) program = PERCUSSION_PROGRAM;
      if (globals.beat) startingMidi.push({
        el_type: 'beat',
        beats: globals.beat
      });
      if (globals.nobeataccents) startingMidi.push({
        el_type: 'beataccents',
        value: false
      });
    } // Specified options in abc string.
    // If the tempo was passed in, use that.
    // If the tempo is specified, use that.
    // If there is a default, use that.
    // Otherwise, use the default.


    if (options.qpm) qpm = parseInt(options.qpm, 10);else if (abctune.metaText.tempo) qpm = interpretTempo(abctune.metaText.tempo, abctune.getBeatLength());else if (options.defaultQpm) qpm = options.defaultQpm;else qpm = 180; // The tempo if there isn't a tempo specified.

    var startVoice = [];
    if (bagpipes) startVoice.push({
      el_type: 'bagpipes'
    });
    startVoice.push({
      el_type: 'instrument',
      program: program
    });
    if (channel) startVoice.push({
      el_type: 'channel',
      channel: channel
    });
    if (transpose) startVoice.push({
      el_type: 'transpose',
      transpose: transpose
    });
    startVoice.push({
      el_type: 'tempo',
      qpm: qpm
    });

    for (var ss = 0; ss < startingMidi.length; ss++) {
      startVoice.push(startingMidi[ss]);
    } // the relevant part of the input structure is:
    // abctune
    //		array lines
    //			array staff
    //				object key
    //				object meter
    //				array voices
    //					array abcelem
    // visit each voice completely in turn


    var voices = [];
    var inCrescendo = [];
    var inDiminuendo = [];
    var durationCounter = [0];
    var tempoChanges = {};
    tempoChanges["0"] = {
      el_type: 'tempo',
      qpm: qpm,
      timing: 0
    };
    var currentVolume;
    var startRepeatPlaceholder = []; // There is a place holder for each voice.

    var skipEndingPlaceholder = []; // This is the place where the first ending starts.

    var startingDrumSet = false;
    var lines = abctune.lines; //abctune.deline(); TODO-PER: can switch to this, then simplify the loops below.

    for (var i = 0; i < lines.length; i++) {
      // For each group of staff lines in the tune.
      var line = lines[i];

      if (line.staff) {
        var setDynamics = function setDynamics(elem) {
          var volumes = {
            'pppp': [15, 10, 5, 1],
            'ppp': [30, 20, 10, 1],
            'pp': [45, 35, 20, 1],
            'p': [60, 50, 35, 1],
            'mp': [75, 65, 50, 1],
            'mf': [90, 80, 65, 1],
            'f': [105, 95, 80, 1],
            'ff': [120, 110, 95, 1],
            'fff': [127, 125, 110, 1],
            'ffff': [127, 125, 110, 1]
          };
          var dynamicType;

          if (elem.decoration) {
            if (elem.decoration.indexOf('pppp') >= 0) dynamicType = 'pppp';else if (elem.decoration.indexOf('ppp') >= 0) dynamicType = 'ppp';else if (elem.decoration.indexOf('pp') >= 0) dynamicType = 'pp';else if (elem.decoration.indexOf('p') >= 0) dynamicType = 'p';else if (elem.decoration.indexOf('mp') >= 0) dynamicType = 'mp';else if (elem.decoration.indexOf('mf') >= 0) dynamicType = 'mf';else if (elem.decoration.indexOf('f') >= 0) dynamicType = 'f';else if (elem.decoration.indexOf('ff') >= 0) dynamicType = 'ff';else if (elem.decoration.indexOf('fff') >= 0) dynamicType = 'fff';else if (elem.decoration.indexOf('ffff') >= 0) dynamicType = 'ffff';

            if (dynamicType) {
              currentVolume = volumes[dynamicType].slice(0);
              voices[voiceNumber].push({
                el_type: 'beat',
                beats: currentVolume.slice(0)
              });
              inCrescendo[k] = false;
              inDiminuendo[k] = false;
            }

            if (elem.decoration.indexOf("crescendo(") >= 0) {
              var n = numNotesToDecoration(voice, v, "crescendo)");
              var top = Math.min(127, currentVolume[0] + crescendoSize);
              var endDec = endingVolume(voice, v + n + 1, Object.keys(volumes));
              if (endDec) top = volumes[endDec][0];
              if (n > 0) inCrescendo[k] = Math.floor((top - currentVolume[0]) / n);else inCrescendo[k] = false;
              inDiminuendo[k] = false;
            } else if (elem.decoration.indexOf("crescendo)") >= 0) {
              inCrescendo[k] = false;
            } else if (elem.decoration.indexOf("diminuendo(") >= 0) {
              var n2 = numNotesToDecoration(voice, v, "diminuendo)");
              var bottom = Math.max(15, currentVolume[0] - crescendoSize);
              var endDec2 = endingVolume(voice, v + n2 + 1, Object.keys(volumes));
              if (endDec2) bottom = volumes[endDec2][0];
              inCrescendo[k] = false;
              if (n2 > 0) inDiminuendo[k] = Math.floor((bottom - currentVolume[0]) / n2);else inDiminuendo[k] = false;
            } else if (elem.decoration.indexOf("diminuendo)") >= 0) {
              inDiminuendo[k] = false;
            }
          }
        };

        var staves = line.staff;
        var voiceNumber = 0;

        for (var j = 0; j < staves.length; j++) {
          var staff = staves[j]; // For each staff line

          for (var k = 0; k < staff.voices.length; k++) {
            // For each voice in a staff line
            var voice = staff.voices[k];

            if (!voices[voiceNumber]) {
              voices[voiceNumber] = [].concat(JSON.parse(JSON.stringify(startVoice)));
              var voiceName = getTrackTitle(line.staff, voiceNumber);
              if (voiceName) voices[voiceNumber].unshift({
                el_type: "name",
                trackName: voiceName
              });
            } // Negate any transposition for the percussion staff.


            if (transpose && (staff.clef.type === "perc" || staff.clef.type === "swiss")) voices[voiceNumber].push({
              el_type: 'transpose',
              transpose: 0
            });

            if (staff.clef && (staff.clef.type === 'perc' || staff.clef.type === "swiss") && !channelExplicitlySet) {
              for (var cl = 0; cl < voices[voiceNumber].length; cl++) {
                if (voices[voiceNumber][cl].el_type === 'instrument') voices[voiceNumber][cl].program = PERCUSSION_PROGRAM;
              }
            } else if (staff.key) {
              addKey(voices[voiceNumber], staff.key);
            }

            if (staff.meter) {
              addMeter(voices[voiceNumber], staff.meter);
            }

            if (!startingDrumSet && drumOn) {
              // drum information is only needed once, so use the first line and track 0.
              voices[voiceNumber].push({
                el_type: 'drum',
                params: {
                  pattern: drumPattern,
                  bars: drumBars,
                  on: drumOn,
                  intro: drumIntro
                }
              });
              startingDrumSet = true;
            }

            if (staff.clef && staff.clef.type !== "perc" && staff.clef.transpose) {
              staff.clef.el_type = 'clef';
              voices[voiceNumber].push({
                el_type: 'transpose',
                transpose: staff.clef.transpose
              });
            }

            if (staff.clef && staff.clef.type) {
              if (staff.clef.type.indexOf("-8") >= 0) voices[voiceNumber].push({
                el_type: 'transpose',
                transpose: -12
              });else if (staff.clef.type.indexOf("+8") >= 0) voices[voiceNumber].push({
                el_type: 'transpose',
                transpose: 12
              });
            }

            if (abctune.formatting.midi && abctune.formatting.midi.drumoff) {
              // If there is a drum off command right at the beginning it is put in the metaText instead of the stream,
              // so we will just insert it here.
              voices[voiceNumber].push({
                el_type: 'bar'
              });
              voices[voiceNumber].push({
                el_type: 'drum',
                params: {
                  pattern: "",
                  on: false
                }
              });
            }

            var noteEventsInBar = 0;
            var tripletMultiplier = 0;
            var tripletDurationTotal = 0; // try to mitigate the js rounding problems.

            var tripletDurationCount = 0;
            currentVolume = [105, 95, 85, 1];

            for (var v = 0; v < voice.length; v++) {
              // For each element in a voice
              var elem = voice[v];

              switch (elem.el_type) {
                case "note":
                  if (inCrescendo[k]) {
                    currentVolume[0] += inCrescendo[k];
                    currentVolume[1] += inCrescendo[k];
                    currentVolume[2] += inCrescendo[k];
                    voices[voiceNumber].push({
                      el_type: 'beat',
                      beats: currentVolume.slice(0)
                    });
                  }

                  if (inDiminuendo[k]) {
                    currentVolume[0] += inDiminuendo[k];
                    currentVolume[1] += inDiminuendo[k];
                    currentVolume[2] += inDiminuendo[k];
                    voices[voiceNumber].push({
                      el_type: 'beat',
                      beats: currentVolume.slice(0)
                    });
                  }

                  setDynamics(elem); // regular items are just pushed.

                  if (!elem.rest || elem.rest.type !== 'spacer') {
                    var noteElem = {
                      elem: elem,
                      el_type: "note",
                      timing: durationCounter[voiceNumber]
                    }; // Make a copy so that modifications aren't kept except for adding the midiPitches

                    if (elem.style) noteElem.style = elem.style;else if (style[voiceNumber]) noteElem.style = style[voiceNumber];
                    noteElem.duration = elem.duration === 0 ? 0.25 : elem.duration;

                    if (elem.startTriplet) {
                      tripletMultiplier = elem.tripletMultiplier;
                      tripletDurationTotal = elem.startTriplet * tripletMultiplier * elem.duration;
                      noteElem.duration = noteElem.duration * tripletMultiplier;
                      noteElem.duration = Math.round(noteElem.duration * 1000000) / 1000000;
                      tripletDurationCount = noteElem.duration;
                    } else if (tripletMultiplier) {
                      if (elem.endTriplet) {
                        tripletMultiplier = 0;
                        noteElem.duration = Math.round((tripletDurationTotal - tripletDurationCount) * 1000000) / 1000000;
                      } else {
                        noteElem.duration = noteElem.duration * tripletMultiplier;
                        noteElem.duration = Math.round(noteElem.duration * 1000000) / 1000000;
                        tripletDurationCount += noteElem.duration;
                      }
                    }

                    if (elem.rest) noteElem.rest = elem.rest;
                    if (elem.decoration) noteElem.decoration = elem.decoration.slice(0);
                    if (elem.pitches) noteElem.pitches = parseCommon.cloneArray(elem.pitches);
                    if (elem.gracenotes) noteElem.gracenotes = parseCommon.cloneArray(elem.gracenotes);
                    if (elem.chord) noteElem.chord = parseCommon.cloneArray(elem.chord);
                    voices[voiceNumber].push(noteElem);

                    if (elem.style === "rhythm") {
                      rhythmHeadThisBar = true;
                      chordVoiceOffThisBar(voices);
                    }

                    noteEventsInBar++;
                    durationCounter[voiceNumber] += noteElem.duration;
                  }

                  break;

                case "key":
                  addKey(voices[voiceNumber], elem);
                  break;

                case "meter":
                  addMeter(voices[voiceNumber], elem);
                  break;

                case "clef":
                  // need to keep this to catch the "transpose" element.
                  if (elem.transpose) voices[voiceNumber].push({
                    el_type: 'transpose',
                    transpose: elem.transpose
                  });

                  if (elem.type) {
                    if (elem.type.indexOf("-8") >= 0) voices[voiceNumber].push({
                      el_type: 'transpose',
                      transpose: -12
                    });else if (elem.type.indexOf("+8") >= 0) voices[voiceNumber].push({
                      el_type: 'transpose',
                      transpose: 12
                    });
                  }

                  break;

                case "tempo":
                  qpm = interpretTempo(elem, abctune.getBeatLength());
                  voices[voiceNumber].push({
                    el_type: 'tempo',
                    qpm: qpm,
                    timing: durationCounter[voiceNumber]
                  });
                  tempoChanges['' + durationCounter[voiceNumber]] = {
                    el_type: 'tempo',
                    qpm: qpm,
                    timing: durationCounter[voiceNumber]
                  };
                  break;

                case "bar":
                  if (noteEventsInBar > 0) // don't add two bars in a row.
                    voices[voiceNumber].push({
                      el_type: 'bar'
                    }); // We need the bar marking to reset the accidentals.

                  setDynamics(elem);
                  noteEventsInBar = 0; // figure out repeats and endings --
                  // The important part is where there is a start repeat, and end repeat, or a first ending.

                  var endRepeat = elem.type === "bar_right_repeat" || elem.type === "bar_dbl_repeat";
                  var startEnding = elem.startEnding === '1';
                  var startRepeat = elem.type === "bar_left_repeat" || elem.type === "bar_dbl_repeat" || elem.type === "bar_right_repeat";

                  if (endRepeat) {
                    var s = startRepeatPlaceholder[voiceNumber];
                    if (!s) s = 0; // If there wasn't a left repeat, then we repeat from the beginning.

                    var e = skipEndingPlaceholder[voiceNumber];
                    if (!e) e = voices[voiceNumber].length; // If there wasn't a first ending marker, then we copy everything.
                    // duplicate each of the elements - this has to be a deep copy.

                    for (var z = s; z < e; z++) {
                      var item = parseCommon.clone(voices[voiceNumber][z]);
                      if (item.pitches) item.pitches = parseCommon.cloneArray(item.pitches);
                      voices[voiceNumber].push(item);
                    } // reset these in case there is a second repeat later on.


                    skipEndingPlaceholder[voiceNumber] = undefined;
                    startRepeatPlaceholder[voiceNumber] = undefined;
                  }

                  if (startEnding) skipEndingPlaceholder[voiceNumber] = voices[voiceNumber].length;
                  if (startRepeat) startRepeatPlaceholder[voiceNumber] = voices[voiceNumber].length;
                  rhythmHeadThisBar = false;
                  break;

                case 'style':
                  style[voiceNumber] = elem.head;
                  break;

                case 'timeSignature':
                  voices[voiceNumber].push(interpretMeter(elem));
                  break;

                case 'part':
                  // TODO-PER: If there is a part section in the header, then this should probably affect the repeats.
                  break;

                case 'stem':
                case 'scale':
                case 'break':
                case 'font':
                  // These elements don't affect sound
                  break;

                case 'midi':
                  //console.log("MIDI inline", elem); // TODO-PER: for debugging. Remove this.
                  var drumChange = false;

                  switch (elem.cmd) {
                    case "drumon":
                      drumOn = true;
                      drumChange = true;
                      break;

                    case "drumoff":
                      drumOn = false;
                      drumChange = true;
                      break;

                    case "drum":
                      drumPattern = elem.params;
                      drumChange = true;
                      break;

                    case "drumbars":
                      drumBars = elem.params[0];
                      drumChange = true;
                      break;

                    case "drummap":
                      // This is handled before getting here so it can be ignored.
                      break;

                    case "channel":
                      // There's not much needed for the channel except to look out for the percussion channel
                      if (elem.params[0] === 10) voices[voiceNumber].push({
                        el_type: 'instrument',
                        program: PERCUSSION_PROGRAM
                      });
                      break;

                    case "program":
                      addIfDifferent(voices[voiceNumber], {
                        el_type: 'instrument',
                        program: elem.params[0]
                      });
                      channelExplicitlySet = true;
                      break;

                    case "transpose":
                      voices[voiceNumber].push({
                        el_type: 'transpose',
                        transpose: elem.params[0]
                      });
                      break;

                    case "gchordoff":
                      voices[voiceNumber].push({
                        el_type: 'gchord',
                        tacet: true
                      });
                      break;

                    case "gchordon":
                      voices[voiceNumber].push({
                        el_type: 'gchord',
                        tacet: false
                      });
                      break;

                    case "beat":
                      voices[voiceNumber].push({
                        el_type: 'beat',
                        beats: elem.params
                      });
                      break;

                    case "nobeataccents":
                      voices[voiceNumber].push({
                        el_type: 'beataccents',
                        value: false
                      });
                      break;

                    case "beataccents":
                      voices[voiceNumber].push({
                        el_type: 'beataccents',
                        value: true
                      });
                      break;

                    case "vol":
                      voices[voiceNumber].push({
                        el_type: 'vol',
                        volume: elem.params[0]
                      });
                      break;

                    case "volinc":
                      voices[voiceNumber].push({
                        el_type: 'volinc',
                        volume: elem.params[0]
                      });
                      break;

                    default:
                      console.log("MIDI seq: midi cmd not handled: ", elem.cmd, elem);
                  }

                  if (drumChange) {
                    voices[0].push({
                      el_type: 'drum',
                      params: {
                        pattern: drumPattern,
                        bars: drumBars,
                        intro: drumIntro,
                        on: drumOn
                      }
                    });
                    startingDrumSet = true;
                  }

                  break;

                default:
                  console.log("MIDI: element type " + elem.el_type + " not handled.");
              }
            }

            voiceNumber++;
            if (!durationCounter[voiceNumber]) durationCounter[voiceNumber] = 0;
          }
        }
      }
    } // If there are tempo changes, make sure they are in all the voices. This must be done post process because all the elements in all the voices need to be created first.


    insertTempoChanges(voices, tempoChanges);

    if (drumIntro) {
      var pickups = abctune.getPickupLength(); // add some measures of rests to the start of each track.

      for (var vv = 0; vv < voices.length; vv++) {
        var insertPoint = 0;

        while (voices[vv][insertPoint].el_type !== "note" && voices[vv].length > insertPoint) {
          insertPoint++;
        }

        if (voices[vv].length > insertPoint) {
          for (var w = 0; w < drumIntro; w++) {
            // If it is the last measure of intro, subtract the pickups.
            if (pickups === 0 || w < drumIntro - 1) voices[vv].splice(insertPoint, 0, {
              el_type: "note",
              rest: {
                type: "rest"
              },
              duration: measureLength
            }, {
              el_type: "bar"
            });else {
              voices[vv].splice(insertPoint, 0, {
                el_type: "note",
                rest: {
                  type: "rest"
                },
                duration: measureLength - pickups
              });
            }
          }
        }
      }
    }

    if (voices.length > 0 && voices[0].length > 0) {
      voices[0][0].pickupLength = abctune.getPickupLength();
    }

    return voices;
  };

  function numNotesToDecoration(voice, start, decoration) {
    var counter = 0;

    for (var i = start + 1; i < voice.length; i++) {
      if (voice[i].el_type === "note") counter++;
      if (voice[i].decoration && voice[i].decoration.indexOf(decoration) >= 0) return counter;
    }

    return counter;
  }

  function endingVolume(voice, start, volumeDecorations) {
    var end = Math.min(voice.length, start + 3); // If we have a volume within a couple notes of the end then assume that is the destination.

    for (var i = start; i < end; i++) {
      if (voice[i].el_type === "note") {
        if (voice[i].decoration) {
          for (var j = 0; j < voice[i].decoration.length; j++) {
            if (volumeDecorations.indexOf(voice[i].decoration[j]) >= 0) return voice[i].decoration[j];
          }
        }
      }
    }

    return null;
  }

  function insertTempoChanges(voices, tempoChanges) {
    if (!tempoChanges || tempoChanges.length === 0) return;
    var changePositions = Object.keys(tempoChanges);

    for (var i = 0; i < voices.length; i++) {
      var voice = voices[i];
      var lastTempo = tempoChanges['0'] ? tempoChanges['0'].qpm : 0; // Don't insert redundant changes. This happens normally when repeating from the beginning, but could happen anywhere that there is a tempo marking that is the same as the last one.

      for (var j = 0; j < voice.length; j++) {
        var el = voice[j];
        if (el.el_type === "tempo") lastTempo = el.qpm;

        if (changePositions.indexOf('' + el.timing) >= 0 && lastTempo !== tempoChanges['' + el.timing].qpm) {
          lastTempo = tempoChanges['' + el.timing].qpm;

          if (el.el_type === "tempo") {
            el.qpm = tempoChanges['' + el.timing].qpm;
            j++; // when there is a tempo element the next element has the same timing and we don't want it to match the second time.
          } else {
            //console.log("tempo position", i, j, el);
            voices[i].splice(j, 0, {
              el_type: "tempo",
              qpm: tempoChanges['' + el.timing].qpm,
              timing: el.timing
            });
            j += 2; // skip the element we just inserted.
          }
        }
      }
    }
  }

  function chordVoiceOffThisBar(voices) {
    for (var i = 0; i < voices.length; i++) {
      var voice = voices[i];
      var j = voice.length - 1;

      while (j >= 0 && voice[j].el_type !== 'bar') {
        voice[j].noChordVoice = true;
        j--;
      }
    }
  }

  function getTrackTitle(staff, voiceNumber) {
    if (!staff || staff.length <= voiceNumber || !staff[voiceNumber].title) return undefined;
    return staff[voiceNumber].title.join(" ");
  }

  function interpretTempo(element, beatLength) {
    var duration = 1 / 4;

    if (element.duration) {
      duration = element.duration[0];
    }

    var bpm = 60;

    if (element.bpm) {
      bpm = element.bpm;
    } // The tempo is defined with a beat length of "duration". If that isn't the natural beat length then there is a translation.


    return duration * bpm / beatLength;
  }

  function interpretMeter(element) {
    var meter;

    switch (element.type) {
      case "common_time":
        meter = {
          el_type: 'meter',
          num: 4,
          den: 4
        };
        break;

      case "cut_time":
        meter = {
          el_type: 'meter',
          num: 2,
          den: 2
        };
        break;

      case "specified":
        // TODO-PER: only taking the first meter, so the complex meters are not handled.
        meter = {
          el_type: 'meter',
          num: element.value[0].num,
          den: element.value[0].den
        };
        break;

      default:
        // This should never happen.
        meter = {
          el_type: 'meter'
        };
    }

    measureLength = meter.num / meter.den;
    return meter;
  }

  function removeNaturals(accidentals) {
    var acc = [];

    for (var i = 0; i < accidentals.length; i++) {
      if (accidentals[i].acc !== "natural") acc.push(accidentals[i]);
    }

    return acc;
  }

  function addKey(arr, key) {
    var newKey;
    if (key.root === 'HP') newKey = {
      el_type: 'key',
      accidentals: [{
        acc: 'natural',
        note: 'g'
      }, {
        acc: 'sharp',
        note: 'f'
      }, {
        acc: 'sharp',
        note: 'c'
      }]
    };else newKey = {
      el_type: 'key',
      accidentals: removeNaturals(key.accidentals)
    };
    addIfDifferent(arr, newKey);
  }

  function addMeter(arr, meter) {
    var newMeter = interpretMeter(meter);
    addIfDifferent(arr, newMeter);
  }

  function addIfDifferent(arr, item) {
    for (var i = arr.length - 1; i >= 0; i--) {
      if (arr[i].el_type === item.el_type) {
        if (JSON.stringify(arr[i]) !== JSON.stringify(item)) arr.push(item);
        return;
      }
    }

    arr.push(item);
  }
})();

module.exports = sequence;

/***/ }),

/***/ "./src/synth/active-audio-context.js":
/*!*******************************************!*\
  !*** ./src/synth/active-audio-context.js ***!
  \*******************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var registerAudioContext = __webpack_require__(/*! ./register-audio-context.js */ "./src/synth/register-audio-context.js");

function activeAudioContext() {
  if (!window.abcjsAudioContext) registerAudioContext();
  return window.abcjsAudioContext;
}

module.exports = activeAudioContext;

/***/ }),

/***/ "./src/synth/cents-to-factor.js":
/*!**************************************!*\
  !*** ./src/synth/cents-to-factor.js ***!
  \**************************************/
/***/ (function(module) {

// This turns the number of cents to detune into a value that is convenient to use in pitch calculations
// A cent is 1/100 of a musical half step and is calculated exponentially over the course of an octave.
// The equation is:
// Two to the power of cents divided by 1200
function centsToFactor(cents) {
  return Math.pow(2, cents / 1200);
}

module.exports = centsToFactor;

/***/ }),

/***/ "./src/synth/create-note-map.js":
/*!**************************************!*\
  !*** ./src/synth/create-note-map.js ***!
  \**************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// Convert the input structure to a more useful structure where each item has a length of its own.
var instrumentIndexToName = __webpack_require__(/*! ./instrument-index-to-name */ "./src/synth/instrument-index-to-name.js");

var createNoteMap = function createNoteMap(sequence) {
  var map = [];

  for (var i = 0; i < sequence.tracks.length; i++) {
    map.push([]);
  } // TODO-PER: handle more than one note in a track


  var nextNote = {};
  var currentInstrument = instrumentIndexToName[0]; // ev.start and ev.duration are in whole notes. Need to turn them into

  sequence.tracks.forEach(function (track, i) {
    track.forEach(function (ev) {
      switch (ev.cmd) {
        case "note":
          // ev contains:
          // {"cmd":"note","pitch":72,"volume":95,"start":0.125,"duration":0.25,"instrument":0,"gap":0}
          // where start and duration are in whole notes, gap is in 1/1920 of a second (i.e. MIDI ticks)
          if (ev.duration > 0) {
            var gap = ev.gap ? ev.gap : 0;
            var len = ev.duration;
            gap = Math.min(gap, len * 2 / 3);
            var obj = {
              pitch: ev.pitch,
              instrument: currentInstrument,
              start: Math.round(ev.start * 1000000) / 1000000,
              end: Math.round((ev.start + len - gap) * 1000000) / 1000000,
              volume: ev.volume
            };
            if (ev.style) obj.style = ev.style;
            if (ev.cents) obj.cents = ev.cents;
            map[i].push(obj);
          }

          break;

        case "program":
          currentInstrument = instrumentIndexToName[ev.instrument];
          break;

        case "text":
          // Ignore the track names - that is just for midi files.
          break;

        default:
          // TODO-PER: handle other event types
          console.log("Unhandled midi event", ev);
      }
    });
  });
  return map;
};

module.exports = createNoteMap;

/***/ }),

/***/ "./src/synth/create-synth-control.js":
/*!*******************************************!*\
  !*** ./src/synth/create-synth-control.js ***!
  \*******************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var supportsAudio = __webpack_require__(/*! ./supports-audio */ "./src/synth/supports-audio.js");

var registerAudioContext = __webpack_require__(/*! ./register-audio-context */ "./src/synth/register-audio-context.js");

var activeAudioContext = __webpack_require__(/*! ./active-audio-context */ "./src/synth/active-audio-context.js");

var parseCommon = __webpack_require__(/*! ../parse/abc_common */ "./src/parse/abc_common.js");

var loopImage = __webpack_require__(/*! ./images/loop.svg.js */ "./src/synth/images/loop.svg.js");

var playImage = __webpack_require__(/*! ./images/play.svg.js */ "./src/synth/images/play.svg.js");

var pauseImage = __webpack_require__(/*! ./images/pause.svg.js */ "./src/synth/images/pause.svg.js");

var loadingImage = __webpack_require__(/*! ./images/loading.svg.js */ "./src/synth/images/loading.svg.js");

var resetImage = __webpack_require__(/*! ./images/reset.svg.js */ "./src/synth/images/reset.svg.js");

function CreateSynthControl(parent, options) {
  var self = this; // parent is either an element or a selector.

  if (typeof parent === "string") {
    var selector = parent;
    parent = document.querySelector(selector);
    if (!parent) throw new Error("Cannot find element \"" + selector + "\" in the DOM.");
  } else if (!(parent instanceof HTMLElement)) throw new Error("The first parameter must be a valid element or selector in the DOM.");

  self.parent = parent;
  self.options = {};
  if (options) self.options = parseCommon.clone(options); // This can be called in the following cases:
  // AC already registered and not suspended
  // AC already registered and suspended
  // AC not registered and not passed in
  // AC not registered but passed in (but suspended)
  // AC not registered but passed in (not suspended)
  // If the AC is already registered, then just use it - ignore what is passed in
  // Create the AC if necessary if there isn't one already.
  // We don't care right now if the AC is suspended - whenever a button is clicked then we check it.

  if (self.options.ac) registerAudioContext(self.options.ac);
  buildDom(self.parent, self.options);
  attachListeners(self);

  self.disable = function (isDisabled) {
    var el = self.parent.querySelector(".abcjs-inline-audio");
    if (isDisabled) el.classList.add("abcjs-disabled");else el.classList.remove("abcjs-disabled");
  };

  self.setWarp = function (tempo, warp) {
    var el = self.parent.querySelector(".abcjs-midi-tempo");
    el.value = Math.round(warp);
    self.setTempo(tempo);
  };

  self.setTempo = function (tempo) {
    var el = self.parent.querySelector(".abcjs-midi-current-tempo");
    if (el) el.innerHTML = Math.round(tempo);
  };

  self.resetAll = function () {
    var pushedButtons = self.parent.querySelectorAll(".abcjs-pushed");

    for (var i = 0; i < pushedButtons.length; i++) {
      var button = pushedButtons[i];
      button.classList.remove("abcjs-pushed");
    }
  };

  self.pushPlay = function (push) {
    var startButton = self.parent.querySelector(".abcjs-midi-start");
    if (!startButton) return;
    if (push) startButton.classList.add("abcjs-pushed");else startButton.classList.remove("abcjs-pushed");
  };

  self.pushLoop = function (push) {
    var loopButton = self.parent.querySelector(".abcjs-midi-loop");
    if (!loopButton) return;
    if (push) loopButton.classList.add("abcjs-pushed");else loopButton.classList.remove("abcjs-pushed");
  };

  self.setProgress = function (percent, totalTime) {
    var progressBackground = self.parent.querySelector(".abcjs-midi-progress-background");
    var progressThumb = self.parent.querySelector(".abcjs-midi-progress-indicator");
    if (!progressBackground || !progressThumb) return;
    var width = progressBackground.clientWidth;
    var left = width * percent;
    progressThumb.style.left = left + "px";
    var clock = self.parent.querySelector(".abcjs-midi-clock");

    if (clock) {
      var totalSeconds = totalTime * percent / 1000;
      var minutes = Math.floor(totalSeconds / 60);
      var seconds = Math.floor(totalSeconds % 60);
      var secondsFormatted = seconds < 10 ? "0" + seconds : seconds;
      clock.innerHTML = minutes + ":" + secondsFormatted;
    }
  };

  if (self.options.afterResume) {
    var isResumed = false;

    if (self.options.ac) {
      isResumed = self.options.ac.state !== "suspended";
    } else if (activeAudioContext()) {
      isResumed = activeAudioContext().state !== "suspended";
    }

    if (isResumed) self.options.afterResume();
  }
}

function buildDom(parent, options) {
  var hasLoop = !!options.loopHandler;
  var hasRestart = !!options.restartHandler;
  var hasPlay = !!options.playHandler || !!options.playPromiseHandler;
  var hasProgress = !!options.progressHandler;
  var hasWarp = !!options.warpHandler;
  var hasClock = options.hasClock !== false;
  var html = '<div class="abcjs-inline-audio">\n';

  if (hasLoop) {
    var repeatTitle = options.repeatTitle ? options.repeatTitle : "Click to toggle play once/repeat.";
    var repeatAria = options.repeatAria ? options.repeatAria : repeatTitle;
    html += '<button type="button" class="abcjs-midi-loop abcjs-btn" title="' + repeatTitle + '" aria-label="' + repeatAria + '">' + loopImage + '</button>\n';
  }

  if (hasRestart) {
    var restartTitle = options.restartTitle ? options.restartTitle : "Click to go to beginning.";
    var restartAria = options.restartAria ? options.restartAria : restartTitle;
    html += '<button type="button" class="abcjs-midi-reset abcjs-btn" title="' + restartTitle + '" aria-label="' + restartAria + '">' + resetImage + '</button>\n';
  }

  if (hasPlay) {
    var playTitle = options.playTitle ? options.playTitle : "Click to play/pause.";
    var playAria = options.playAria ? options.playAria : playTitle;
    html += '<button type="button" class="abcjs-midi-start abcjs-btn" title="' + playTitle + '" aria-label="' + playAria + '">' + playImage + pauseImage + loadingImage + '</button>\n';
  }

  if (hasProgress) {
    var randomTitle = options.randomTitle ? options.randomTitle : "Click to change the playback position.";
    var randomAria = options.randomAria ? options.randomAria : randomTitle;
    html += '<button type="button" class="abcjs-midi-progress-background" title="' + randomTitle + '" aria-label="' + randomAria + '"><span class="abcjs-midi-progress-indicator"></span></button>\n';
  }

  if (hasClock) {
    html += '<span class="abcjs-midi-clock"></span>\n';
  }

  if (hasWarp) {
    var warpTitle = options.warpTitle ? options.warpTitle : "Change the playback speed.";
    var warpAria = options.warpAria ? options.warpAria : warpTitle;
    var bpm = options.bpm ? options.bpm : "BPM";
    html += '<span class="abcjs-tempo-wrapper"><label><input class="abcjs-midi-tempo" type="number" min="1" max="300" value="100" title="' + warpTitle + '" aria-label="' + warpAria + '">%</label><span>&nbsp;(<span class="abcjs-midi-current-tempo"></span> ' + bpm + ')</span></span>\n';
  }

  html += '<div class="abcjs-css-warning" style="font-size: 12px;color:red;border: 1px solid red;text-align: center;width: 300px;margin-top: 4px;font-weight: bold;border-radius: 4px;">CSS required: load abcjs-audio.css</div>';
  html += '</div>\n';
  parent.innerHTML = html;
}

function acResumerMiddleWare(next, ev, playBtn, afterResume, isPromise) {
  var needsInit = true;

  if (!activeAudioContext()) {
    registerAudioContext();
  } else {
    needsInit = activeAudioContext().state === "suspended";
  }

  if (!supportsAudio()) {
    throw {
      status: "NotSupported",
      message: "This browser does not support audio."
    };
  }

  if ((needsInit || isPromise) && playBtn) playBtn.classList.add("abcjs-loading");

  if (needsInit) {
    activeAudioContext().resume().then(function () {
      if (afterResume) {
        afterResume().then(function (response) {
          doNext(next, ev, playBtn, isPromise);
        });
      } else {
        doNext(next, ev, playBtn, isPromise);
      }
    });
  } else {
    doNext(next, ev, playBtn, isPromise);
  }
}

function doNext(next, ev, playBtn, isPromise) {
  if (isPromise) {
    next(ev).then(function () {
      if (playBtn) playBtn.classList.remove("abcjs-loading");
    });
  } else {
    next(ev);
    if (playBtn) playBtn.classList.remove("abcjs-loading");
  }
}

function attachListeners(self) {
  var hasLoop = !!self.options.loopHandler;
  var hasRestart = !!self.options.restartHandler;
  var hasPlay = !!self.options.playHandler || !!self.options.playPromiseHandler;
  var hasProgress = !!self.options.progressHandler;
  var hasWarp = !!self.options.warpHandler;
  var playBtn = self.parent.querySelector(".abcjs-midi-start");
  if (hasLoop) self.parent.querySelector(".abcjs-midi-loop").addEventListener("click", function (ev) {
    acResumerMiddleWare(self.options.loopHandler, ev, playBtn, self.options.afterResume);
  });
  if (hasRestart) self.parent.querySelector(".abcjs-midi-reset").addEventListener("click", function (ev) {
    acResumerMiddleWare(self.options.restartHandler, ev, playBtn, self.options.afterResume);
  });
  if (hasPlay) playBtn.addEventListener("click", function (ev) {
    acResumerMiddleWare(self.options.playPromiseHandler || self.options.playHandler, ev, playBtn, self.options.afterResume, !!self.options.playPromiseHandler);
  });
  if (hasProgress) self.parent.querySelector(".abcjs-midi-progress-background").addEventListener("click", function (ev) {
    acResumerMiddleWare(self.options.progressHandler, ev, playBtn, self.options.afterResume);
  });
  if (hasWarp) self.parent.querySelector(".abcjs-midi-tempo").addEventListener("change", function (ev) {
    acResumerMiddleWare(self.options.warpHandler, ev, playBtn, self.options.afterResume);
  });
}

module.exports = CreateSynthControl;

/***/ }),

/***/ "./src/synth/create-synth.js":
/*!***********************************!*\
  !*** ./src/synth/create-synth.js ***!
  \***********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var getNote = __webpack_require__(/*! ./load-note */ "./src/synth/load-note.js");

var createNoteMap = __webpack_require__(/*! ./create-note-map */ "./src/synth/create-note-map.js");

var registerAudioContext = __webpack_require__(/*! ./register-audio-context */ "./src/synth/register-audio-context.js");

var activeAudioContext = __webpack_require__(/*! ./active-audio-context */ "./src/synth/active-audio-context.js");

var supportsAudio = __webpack_require__(/*! ./supports-audio */ "./src/synth/supports-audio.js");

var pitchToNoteName = __webpack_require__(/*! ./pitch-to-note-name */ "./src/synth/pitch-to-note-name.js");

var instrumentIndexToName = __webpack_require__(/*! ./instrument-index-to-name */ "./src/synth/instrument-index-to-name.js");

var downloadBuffer = __webpack_require__(/*! ./download-buffer */ "./src/synth/download-buffer.js");

var placeNote = __webpack_require__(/*! ./place-note */ "./src/synth/place-note.js");

var soundsCache = __webpack_require__(/*! ./sounds-cache */ "./src/synth/sounds-cache.js"); // TODO-PER: remove the midi tests from here: I don't think the object can be constructed unless it passes.


var notSupportedMessage = "MIDI is not supported in this browser.";
var defaultSoundFontUrl = "https://paulrosen.github.io/midi-js-soundfonts/abcjs/"; // These are the original soundfonts supplied. They will need a volume boost:

var alternateSoundFontUrl = "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/";
var alternateSoundFontUrl2 = "https://paulrosen.github.io/midi-js-soundfonts/MusyngKite/";

function CreateSynth() {
  var self = this;
  self.audioBufferPossible = undefined;
  self.directSource = []; // type: AudioBufferSourceNode

  self.startTimeSec = undefined; // the time (in seconds) that the audio started: used for pause to get the pausedTimeSec.

  self.pausedTimeSec = undefined; // the position (in seconds) that the audio was paused: used for resume.

  self.audioBuffers = []; // cache of the buffers so starting play can be fast.

  self.duration = undefined; // the duration of the tune in seconds.

  self.isRunning = false; // whether there is currently a sound buffer running.
  // Load and cache all needed sounds

  self.init = function (options) {
    if (!options) options = {};
    registerAudioContext(options.audioContext); // This works no matter what - if there is already an ac it is a nop; if the context is not passed in, then it creates one.

    var startTime = activeAudioContext().currentTime;
    self.debugCallback = options.debugCallback;
    if (self.debugCallback) self.debugCallback("init called");
    self.audioBufferPossible = self._deviceCapable();
    if (!self.audioBufferPossible) return Promise.reject({
      status: "NotSupported",
      message: notSupportedMessage
    });
    var params = options.options ? options.options : {};
    self.soundFontUrl = params.soundFontUrl ? params.soundFontUrl : defaultSoundFontUrl;
    if (self.soundFontUrl[self.soundFontUrl.length - 1] !== '/') self.soundFontUrl += '/';
    if (params.soundFontVolumeMultiplier) self.soundFontVolumeMultiplier = params.soundFontVolumeMultiplier;else if (self.soundFontUrl === alternateSoundFontUrl || self.soundFontUrl === alternateSoundFontUrl2) self.soundFontVolumeMultiplier = 5.0;else if (self.soundFontUrl === defaultSoundFontUrl) self.soundFontVolumeMultiplier = 0.5;else self.soundFontVolumeMultiplier = 1.0;
    if (params.programOffsets) self.programOffsets = params.programOffsets;else if (self.soundFontUrl === defaultSoundFontUrl) self.programOffsets = {
      "violin": 113,
      "trombone": 200
    };else self.programOffsets = {};
    var p = params.fadeLength !== undefined ? parseInt(params.fadeLength, 10) : NaN;
    self.fadeLength = isNaN(p) ? 200 : p;
    p = params.noteEnd !== undefined ? parseInt(params.noteEnd, 10) : NaN;
    self.noteEnd = isNaN(p) ? 0 : p;
    self.pan = params.pan;
    self.meterSize = 1;

    if (options.visualObj) {
      self.flattened = options.visualObj.setUpAudio(params);
      var meter = options.visualObj.getMeterFraction();
      if (meter.den) self.meterSize = options.visualObj.getMeterFraction().num / options.visualObj.getMeterFraction().den;
    } else if (options.sequence) self.flattened = options.sequence;else return Promise.reject(new Error("Must pass in either a visualObj or a sequence"));

    self.millisecondsPerMeasure = options.millisecondsPerMeasure ? options.millisecondsPerMeasure : options.visualObj ? options.visualObj.millisecondsPerMeasure(self.flattened.tempo) : 1000;
    self.beatsPerMeasure = options.visualObj ? options.visualObj.getBeatsPerMeasure() : 4;
    self.sequenceCallback = params.sequenceCallback;
    self.callbackContext = params.callbackContext;
    self.onEnded = params.onEnded;
    var allNotes = {};
    var cached = [];
    var currentInstrument = instrumentIndexToName[0];
    self.flattened.tracks.forEach(function (track) {
      track.forEach(function (event) {
        if (event.cmd === "program" && instrumentIndexToName[event.instrument]) currentInstrument = instrumentIndexToName[event.instrument];

        if (event.pitch !== undefined) {
          var pitchNumber = event.pitch;
          var noteName = pitchToNoteName[pitchNumber];

          if (noteName) {
            if (!allNotes[currentInstrument]) allNotes[currentInstrument] = {};
            if (!soundsCache[currentInstrument] || !soundsCache[currentInstrument][noteName]) allNotes[currentInstrument][noteName] = true;else cached.push(currentInstrument + ":" + noteName);
          } else console.log("Can't find note: ", pitchNumber);
        }
      });
    });
    if (self.debugCallback) self.debugCallback("note gathering time = " + Math.floor((activeAudioContext().currentTime - startTime) * 1000) + "ms");
    startTime = activeAudioContext().currentTime;
    var notes = [];
    Object.keys(allNotes).forEach(function (instrument) {
      Object.keys(allNotes[instrument]).forEach(function (note) {
        notes.push({
          instrument: instrument,
          note: note
        });
      });
    }); // If there are lots of notes, load them in batches

    var batches = [];
    var CHUNK = 256;

    for (var i = 0; i < notes.length; i += CHUNK) {
      batches.push(notes.slice(i, i + CHUNK));
    }

    return new Promise(function (resolve, reject) {
      var results = {
        cached: cached,
        error: [],
        loaded: []
      };
      var index = 0;

      var next = function next() {
        if (index < batches.length) {
          self._loadBatch(batches[index], self.soundFontUrl, startTime).then(function (data) {
            startTime = activeAudioContext().currentTime;

            if (data) {
              if (data.error) results.error = results.error.concat(data.error);
              if (data.loaded) results.loaded = results.loaded.concat(data.loaded);
            }

            index++;
            next();
          }, reject);
        } else {
          resolve(results);
        }
      };

      next();
    });
  };

  self._loadBatch = function (batch, soundFontUrl, startTime, delay) {
    // This is called recursively to see if the sounds have loaded. The "delay" parameter is how long it has been since the original call.
    var promises = [];
    batch.forEach(function (item) {
      promises.push(getNote(soundFontUrl, item.instrument, item.note, activeAudioContext()));
    });
    return Promise.all(promises).then(function (response) {
      if (self.debugCallback) self.debugCallback("mp3 load time = " + Math.floor((activeAudioContext().currentTime - startTime) * 1000) + "ms");
      var loaded = [];
      var cached = [];
      var pending = [];
      var error = [];

      for (var i = 0; i < response.length; i++) {
        var oneResponse = response[i];
        var which = oneResponse.instrument + ":" + oneResponse.name;
        if (oneResponse.status === "loaded") loaded.push(which);else if (oneResponse.status === "pending") pending.push(which);else if (oneResponse.status === "cached") cached.push(which);else error.push(which + ' ' + oneResponse.message);
      }

      if (pending.length > 0) {
        // There was probably a second call for notes before the first one finished, so just retry a few times to see if they stop being pending.
        // Retry quickly at first so that there isn't an unnecessary delay, but increase the delay each time.
        if (!delay) delay = 50;else delay = delay * 2;

        if (delay < 90000) {
          return new Promise(function (resolve, reject) {
            setTimeout(function () {
              var newBatch = [];

              for (i = 0; i < pending.length; i++) {
                which = pending[i].split(":");
                newBatch.push({
                  instrument: which[0],
                  note: which[1]
                });
              }

              self._loadBatch(newBatch, soundFontUrl, startTime, delay).then(function (response) {
                resolve(response);
              })["catch"](function (error) {
                reject(error);
              });
            }, delay);
          });
        } else {
          var list = [];

          for (var j = 0; j < batch.length; j++) {
            list.push(batch[j].instrument + '/' + batch[j].note);
          }

          return Promise.reject(new Error("timeout attempting to load: " + list.join(", ")));
        }
      } else return Promise.resolve({
        loaded: loaded,
        cached: cached,
        error: error
      });
    })["catch"](function (error) {});
  };

  self.prime = function () {
    // At this point all of the notes are loaded. This function writes them into the output buffer.
    // Most music has a lot of repeating notes. If a note is the same pitch, volume, length, etc. as another one,
    // It saves a lot of time to just create it once and place it repeatedly where ever it needs to be.
    var fadeTimeSec = self.fadeLength / 1000;
    self.isRunning = false;
    if (!self.audioBufferPossible) return Promise.reject(new Error(notSupportedMessage));
    if (self.debugCallback) self.debugCallback("prime called");
    return new Promise(function (resolve) {
      var startTime = activeAudioContext().currentTime;
      var tempoMultiplier = self.millisecondsPerMeasure / 1000 / self.meterSize;
      self.duration = self.flattened.totalDuration * tempoMultiplier;

      if (self.duration <= 0) {
        self.audioBuffers = [];
        return resolve({
          status: "empty",
          seconds: 0
        });
      }

      self.duration += fadeTimeSec;
      var totalSamples = Math.floor(activeAudioContext().sampleRate * self.duration); // There might be a previous run that needs to be turned off.

      self.stop();
      var noteMapTracks = createNoteMap(self.flattened);
      if (self.sequenceCallback) self.sequenceCallback(noteMapTracks, self.callbackContext);
      var panDistances = setPan(noteMapTracks.length, self.pan); // Create a simple list of all the unique sounds in this music and where they should be placed.
      // There appears to be a limit on how many audio buffers can be created at once so this technique limits the number needed.

      var uniqueSounds = {};
      noteMapTracks.forEach(function (noteMap, trackNumber) {
        var panDistance = panDistances && panDistances.length > trackNumber ? panDistances[trackNumber] : 0;
        noteMap.forEach(function (note) {
          var key = note.instrument + ':' + note.pitch + ':' + note.volume + ':' + Math.round((note.end - note.start) * 1000) / 1000 + ':' + panDistance + ':' + tempoMultiplier + ':' + note.cents;
          if (!uniqueSounds[key]) uniqueSounds[key] = [];
          uniqueSounds[key].push(note.start);
        });
      }); // Now that we know what we are trying to create, construct the audio buffer by creating each sound and placing it.

      var allPromises = [];
      var audioBuffer = activeAudioContext().createBuffer(2, totalSamples, activeAudioContext().sampleRate);

      for (var key2 = 0; key2 < Object.keys(uniqueSounds).length; key2++) {
        var k = Object.keys(uniqueSounds)[key2];
        var parts = k.split(":");
        var cents = parts[6] !== undefined ? parseFloat(parts[6]) : 0;
        parts = {
          instrument: parts[0],
          pitch: parseInt(parts[1], 10),
          volume: parseInt(parts[2], 10),
          len: parseFloat(parts[3]),
          pan: parseFloat(parts[4]),
          tempoMultiplier: parseFloat(parts[5]),
          cents: cents
        };
        allPromises.push(placeNote(audioBuffer, activeAudioContext().sampleRate, parts, uniqueSounds[k], self.soundFontVolumeMultiplier, self.programOffsets[parts.instrument], fadeTimeSec, self.noteEnd / 1000));
      }

      self.audioBuffers = [audioBuffer];

      if (self.debugCallback) {
        self.debugCallback("sampleRate = " + activeAudioContext().sampleRate);
        self.debugCallback("totalSamples = " + totalSamples);
        self.debugCallback("creationTime = " + Math.floor((activeAudioContext().currentTime - startTime) * 1000) + "ms");
      }

      Promise.all(allPromises).then(function () {
        resolve({
          status: "ok",
          seconds: 0
        });
      });
    });
  };

  function setPan(numTracks, panParam) {
    if (panParam === null || panParam === undefined) return null;
    var panDistances = [];

    if (panParam.length) {
      if (numTracks === panParam.length) {
        var ok = true;

        for (var pp = 0; pp < panParam.length; pp++) {
          var x = parseFloat(panParam[pp]);
          if (x >= -1 && x <= 1) panDistances.push(x);else ok = false;
        }

        if (ok) return panDistances;
      }
    } else {
      var panNumber = parseFloat(panParam); // the separation needs to be no further than 2 (i.e. -1 to 1) so test to see if there are too many tracks for the passed in distance

      if (panNumber * (numTracks - 1) > 2) return null; // If there are an even number of tracks, then offset so that the first two are centered around the middle

      var even = numTracks % 2 === 0;
      var currLow = even ? 0 - panNumber / 2 : 0;
      var currHigh = currLow + panNumber; // Now add the tracks to either side

      for (var p = 0; p < numTracks; p++) {
        even = p % 2 === 0;

        if (even) {
          panDistances.push(currLow);
          currLow -= panNumber;
        } else {
          panDistances.push(currHigh);
          currHigh += panNumber;
        }
      }

      return panDistances;
    } // There was either no panning, or the parameters were illegal


    return null;
  } // This is called after everything is set up, so it can quickly make sound


  self.start = function () {
    if (!self.audioBufferPossible) throw new Error(notSupportedMessage);
    if (self.debugCallback) self.debugCallback("start called");
    var resumePosition = self.pausedTimeSec ? self.pausedTimeSec : 0;

    self._kickOffSound(resumePosition);

    self.startTimeSec = activeAudioContext().currentTime - resumePosition;
    self.pausedTimeSec = undefined;
    if (self.debugCallback) self.debugCallback("MIDI STARTED", self.startTimeSec);
  };

  self.pause = function () {
    if (!self.audioBufferPossible) throw new Error(notSupportedMessage);
    if (self.debugCallback) self.debugCallback("pause called");
    self.stop();
    self.pausedTimeSec = activeAudioContext().currentTime - self.startTimeSec;
  };

  self.resume = function () {
    self.start();
  };

  self.seek = function (position, units) {
    var offset;

    switch (units) {
      case "seconds":
        offset = position;
        break;

      case "beats":
        offset = position * self.millisecondsPerMeasure / self.beatsPerMeasure / 1000;
        break;

      default:
        // this is "percent" or any illegal value
        offset = (self.duration - self.fadeLength / 1000) * position;
        break;
    } // TODO-PER: can seek when paused or when playing


    if (!self.audioBufferPossible) throw new Error(notSupportedMessage);
    if (self.debugCallback) self.debugCallback("seek called sec=" + offset);

    if (self.isRunning) {
      self.stop();

      self._kickOffSound(offset);
    } else {
      self.pausedTimeSec = offset;
    }

    self.pausedTimeSec = offset;
  };

  self.stop = function () {
    self.isRunning = false;
    self.pausedTimeSec = undefined;
    self.directSource.forEach(function (source) {
      try {
        source.stop();
      } catch (error) {
        // We don't care if self succeeds: it might fail if something else turned off the sound or it ended for some reason.
        console.log("direct source didn't stop:", error);
      }
    });
    self.directSource = [];
  };

  self.finished = function () {
    self.startTimeSec = undefined;
    self.pausedTimeSec = undefined;
    self.isRunning = false;
  };

  self.download = function () {
    return downloadBuffer(self);
  }; /////////////// Private functions //////////////


  self._deviceCapable = function () {
    if (!supportsAudio()) {
      console.warn(notSupportedMessage);
      if (self.debugCallback) self.debugCallback(notSupportedMessage);
      return false;
    }

    return true;
  };

  self._kickOffSound = function (seconds) {
    self.isRunning = true;
    self.directSource = [];
    self.audioBuffers.forEach(function (audioBuffer, trackNum) {
      self.directSource[trackNum] = activeAudioContext().createBufferSource(); // creates a sound source

      self.directSource[trackNum].buffer = audioBuffer; // tell the source which sound to play

      self.directSource[trackNum].connect(activeAudioContext().destination); // connect the source to the context's destination (the speakers)
    });
    self.directSource.forEach(function (source) {
      source.start(0, seconds);
    });

    if (self.onEnded) {
      self.directSource[0].onended = function () {
        self.onEnded(self.callbackContext);
      };
    }
  };
}

module.exports = CreateSynth;

/***/ }),

/***/ "./src/synth/download-buffer.js":
/*!**************************************!*\
  !*** ./src/synth/download-buffer.js ***!
  \**************************************/
/***/ (function(module) {

var downloadBuffer = function downloadBuffer(buffer) {
  return window.URL.createObjectURL(bufferToWave(buffer.audioBuffers));
}; // Convert an AudioBuffer to a Blob using WAVE representation


function bufferToWave(audioBuffers) {
  var audioBuffer = audioBuffers[0];
  var numOfChan = audioBuffer.numberOfChannels;
  var length = audioBuffer.length * numOfChan * 2 + 44;
  var buffer = new ArrayBuffer(length);
  var view = new DataView(buffer);
  var channels = [];
  var i;
  var sample;
  var offset = 0;
  var pos = 0; // write WAVE header

  setUint32(0x46464952); // "RIFF"

  setUint32(length - 8); // file length - 8

  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk

  setUint32(16); // length = 16

  setUint16(1); // PCM (uncompressed)

  setUint16(numOfChan);
  setUint32(audioBuffer.sampleRate);
  setUint32(audioBuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec

  setUint16(numOfChan * 2); // block-align

  setUint16(16); // 16-bit (hardcoded in this demo)

  setUint32(0x61746164); // "data" - chunk

  setUint32(length - pos - 4); // chunk length
  // write interleaved data

  for (i = 0; i < numOfChan; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  while (pos < length) {
    for (i = 0; i < channels.length; i++) {
      // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp

      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int

      view.setInt16(pos, sample, true); // write 16-bit sample

      pos += 2;
    }

    offset++; // next source sample
  } // create Blob


  return new Blob([buffer], {
    type: "audio/wav"
  });

  function setUint16(data) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

module.exports = downloadBuffer;

/***/ }),

/***/ "./src/synth/get-midi-file.js":
/*!************************************!*\
  !*** ./src/synth/get-midi-file.js ***!
  \************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var tunebook = __webpack_require__(/*! ../api/abc_tunebook */ "./src/api/abc_tunebook.js");

var midiCreate = __webpack_require__(/*! ../midi/abc_midi_create */ "./src/midi/abc_midi_create.js");

var getMidiFile = function getMidiFile(source, options) {
  var params = {};

  if (options) {
    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        params[key] = options[key];
      }
    }
  }

  params.generateInline = false;

  function callback(div, tune, index) {
    var downloadMidi = midiCreate(tune, params);

    switch (params.midiOutputType) {
      case "encoded":
        return downloadMidi;

      case "binary":
        var decoded = downloadMidi.replace("data:audio/midi,", "");
        decoded = decoded.replace(/MThd/g, "%4d%54%68%64");
        decoded = decoded.replace(/MTrk/g, "%4d%54%72%6b");
        var buffer = new ArrayBuffer(decoded.length / 3);
        var output = new Uint8Array(buffer);

        for (var i = 0; i < decoded.length / 3; i++) {
          var p = i * 3 + 1;
          var d = parseInt(decoded.substring(p, p + 2), 16);
          output[i] = d;
        }

        return output;

      case "link":
      default:
        return generateMidiDownloadLink(tune, params, downloadMidi, index);
    }
  }

  if (typeof source === "string") return tunebook.renderEngine(callback, "*", source, params);else return callback(null, source, 0);
};

function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

var generateMidiDownloadLink = function generateMidiDownloadLink(tune, midiParams, midi, index) {
  var divClasses = ['abcjs-download-midi', 'abcjs-midi-' + index];
  if (midiParams.downloadClass) divClasses.push(midiParams.downloadClass);
  var html = '<div class="' + divClasses.join(' ') + '">';
  if (midiParams.preTextDownload) html += midiParams.preTextDownload;
  var title = tune.metaText && tune.metaText.title ? tune.metaText.title : 'Untitled';
  var label;
  if (midiParams.downloadLabel && isFunction(midiParams.downloadLabel)) label = midiParams.downloadLabel(tune, index);else if (midiParams.downloadLabel) label = midiParams.downloadLabel.replace(/%T/, title);else label = "Download MIDI for \"" + title + "\"";
  title = title.toLowerCase().replace(/'/g, '').replace(/\W/g, '_').replace(/__/g, '_');
  var filename = midiParams.fileName ? midiParams.fileName : title + '.midi';
  html += '<a download="' + filename + '" href="' + midi + '">' + label + '</a>';
  if (midiParams.postTextDownload) html += midiParams.postTextDownload;
  return html + "</div>";
};

module.exports = getMidiFile;

/***/ }),

/***/ "./src/synth/images/loading.svg.js":
/*!*****************************************!*\
  !*** ./src/synth/images/loading.svg.js ***!
  \*****************************************/
/***/ (function(module) {

var svg = "\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" class=\"abcjs-loading-svg\">\n    <circle cx=\"50\" cy=\"50\" fill=\"none\" stroke-width=\"20\" r=\"35\" stroke-dasharray=\"160 55\"></circle>\n</svg>\n";
module.exports = svg;

/***/ }),

/***/ "./src/synth/images/loop.svg.js":
/*!**************************************!*\
  !*** ./src/synth/images/loop.svg.js ***!
  \**************************************/
/***/ (function(module) {

var svg = "\n<svg version=\"1.0\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 700 700\" preserveAspectRatio=\"xMidYMid meet\">\n\t<g transform=\"translate(0,700) scale(0.1,-0.1)\" >\n\t<path d=\"M3111 6981 c-20 -37 -90 -55 -364 -96 -120 -18 -190 -33 -244 -55\n\t-42 -17 -124 -42 -182 -56 -78 -18 -119 -34 -157 -60 -28 -19 -86 -46 -128\n\t-60 -43 -13 -107 -42 -144 -64 -37 -23 -84 -46 -106 -52 -21 -7 -56 -29 -79\n\t-50 -22 -22 -61 -50 -86 -63 -26 -13 -67 -40 -91 -60 -24 -20 -65 -47 -90 -60\n\t-25 -13 -53 -31 -61 -41 -8 -9 -32 -30 -54 -46 -75 -54 -486 -460 -512 -507\n\t-15 -25 -48 -69 -75 -98 -26 -28 -48 -57 -48 -63 0 -6 -18 -29 -39 -53 -21\n\t-23 -56 -71 -77 -107 -20 -36 -50 -80 -65 -97 -16 -18 -33 -52 -40 -75 -12\n\t-47 -47 -115 -84 -166 -13 -18 -30 -56 -38 -83 -8 -27 -34 -80 -56 -118 -33\n\t-53 -46 -91 -62 -167 -12 -63 -34 -127 -59 -179 -42 -84 -60 -166 -60 -270 0\n\t-90 26 -122 125 -154 54 -17 96 -19 430 -20 305 -1 381 2 430 14 82 22 140 51\n\t153 78 6 12 22 47 37 77 14 30 38 77 54 103 15 27 34 73 40 103 7 30 28 78 48\n\t107 19 28 44 74 55 101 10 28 34 67 53 87 18 20 49 61 68 90 19 30 44 63 57\n\t74 13 11 36 40 52 65 59 94 232 270 306 313 20 11 57 37 82 58 25 20 70 52\n\t100 72 30 19 66 47 79 61 13 14 49 35 80 46 30 12 80 37 111 56 31 19 95 45\n\t143 58 48 12 110 37 139 55 63 40 127 55 323 76 83 9 208 28 279 41 156 29\n\t165 29 330 4 453 -71 514 -84 606 -130 31 -16 83 -36 116 -45 32 -9 84 -34\n\t115 -56 31 -21 82 -48 113 -60 32 -11 72 -33 89 -48 18 -16 59 -45 92 -65 33\n\t-21 74 -51 90 -66 17 -15 49 -40 73 -54 52 -32 65 -61 50 -113 -8 -31 -61 -90\n\t-277 -308 -300 -303 -361 -382 -369 -481 -2 -29 0 -66 6 -81 13 -40 88 -138\n\t115 -151 12 -6 54 -26 92 -44 l70 -33 945 -2 c520 -1 975 2 1012 7 64 8 191\n\t50 231 76 11 7 33 34 50 60 22 34 42 51 65 58 l32 9 0 1101 0 1102 -32 9 c-21\n\t7 -44 26 -64 55 -60 84 -77 97 -140 110 -44 9 -76 10 -127 2 -59 -9 -77 -17\n\t-134 -62 -37 -28 -172 -155 -301 -281 -129 -127 -249 -237 -267 -245 -25 -10\n\t-41 -11 -71 -2 -58 15 -112 45 -124 69 -6 11 -35 35 -64 54 -28 18 -58 41 -66\n\t50 -8 9 -41 35 -75 58 -33 22 -77 56 -99 75 -21 18 -64 46 -95 61 -31 14 -73\n\t39 -93 55 -20 15 -70 40 -110 55 -40 15 -97 44 -127 64 -29 21 -78 44 -107 53\n\t-30 8 -77 31 -105 51 -42 28 -73 39 -173 60 -68 14 -154 39 -196 58 -95 43\n\t-131 51 -343 76 -209 24 -242 32 -279 70 l-30 29 -328 0 c-312 0 -330 -1 -339\n\t-19z\"></path>\n\t<path d=\"M254 2875 c-89 -16 -107 -26 -145 -78 -32 -44 -62 -66 -91 -67 -17 0\n\t-18 -61 -18 -1140 l0 -1140 24 0 c16 0 41 -17 72 -50 40 -42 61 -55 117 -72\n\tl69 -21 82 23 c44 12 96 30 114 39 18 9 148 132 290 272 141 141 267 261 279\n\t268 51 26 86 14 176 -61 32 -26 62 -48 66 -48 5 0 36 -25 70 -55 34 -30 74\n\t-61 89 -69 15 -8 37 -28 50 -45 12 -17 50 -45 84 -62 34 -17 78 -44 98 -60 19\n\t-16 61 -37 93 -48 32 -11 81 -37 107 -56 27 -20 76 -45 109 -56 33 -12 75 -31\n\t93 -44 62 -45 93 -58 191 -82 54 -12 130 -37 168 -54 68 -29 180 -58 226 -59\n\t62 0 183 -64 183 -96 0 -12 88 -14 639 -14 l639 0 12 30 c18 44 76 66 233 89\n\t89 14 160 30 200 47 34 15 106 42 159 60 54 18 112 44 130 57 47 35 85 52 146\n\t67 29 7 76 28 105 48 29 20 77 48 107 63 30 15 66 39 80 54 14 15 50 40 81 56\n\t31 15 78 46 104 69 26 22 61 46 79 54 17 7 43 26 56 42 14 16 41 41 60 56 64\n\t48 380 362 408 405 15 23 40 51 55 63 15 12 36 38 46 58 11 21 37 57 58 82 22\n\t25 49 62 62 83 13 20 38 56 57 78 19 23 50 74 69 113 19 39 46 86 59 104 14\n\t18 34 62 46 98 12 36 32 77 45 92 31 38 60 97 80 167 9 33 26 76 37 95 29 50\n\t47 103 68 206 10 52 32 117 51 155 29 56 33 74 34 140 0 94 -10 108 -101 138\n\t-61 20 -83 21 -463 21 -226 0 -421 -4 -451 -10 -63 -12 -86 -30 -110 -85 -10\n\t-22 -33 -63 -52 -92 -21 -31 -42 -80 -53 -123 -11 -44 -32 -93 -56 -128 -20\n\t-32 -47 -83 -59 -115 -12 -32 -37 -77 -56 -100 -19 -23 -50 -65 -69 -94 -19\n\t-29 -44 -57 -54 -63 -11 -5 -29 -27 -42 -47 -52 -85 -234 -277 -300 -315 -25\n\t-15 -53 -38 -62 -51 -9 -14 -42 -39 -74 -57 -32 -18 -75 -48 -95 -66 -21 -18\n\t-59 -44 -85 -58 -26 -13 -72 -40 -100 -59 -35 -24 -78 -41 -128 -52 -47 -11\n\t-99 -31 -139 -56 -69 -42 -94 -49 -391 -110 -245 -51 -425 -66 -595 -50 -168\n\t16 -230 27 -330 61 -47 16 -123 35 -170 44 -98 17 -123 25 -172 58 -20 14 -71\n\t37 -114 53 -44 15 -95 40 -115 56 -20 16 -70 42 -110 59 -40 16 -88 45 -108\n\t63 -20 19 -55 46 -78 61 -24 14 -49 35 -55 47 -7 11 -34 33 -60 49 -50 31 -65\n\t61 -53 102 4 13 130 147 281 298 236 238 277 283 299 335 15 32 35 71 46 86\n\t12 18 19 44 19 76 0 42 -8 63 -53 138 -92 151 11 139 -1207 141 -798 2 -1030\n\t0 -1086 -11z\"></path>\n\t</g>\n</svg>\n";
module.exports = svg;

/***/ }),

/***/ "./src/synth/images/pause.svg.js":
/*!***************************************!*\
  !*** ./src/synth/images/pause.svg.js ***!
  \***************************************/
/***/ (function(module) {

var svg = "\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 25 25\" class=\"abcjs-pause-svg\">\n  <g>\n    <rect width=\"8.23\" height=\"25\"/>\n    <rect width=\"8.23\" height=\"25\" x=\"17\"/>\n  </g>\n</svg>\n";
module.exports = svg;

/***/ }),

/***/ "./src/synth/images/play.svg.js":
/*!**************************************!*\
  !*** ./src/synth/images/play.svg.js ***!
  \**************************************/
/***/ (function(module) {

var svg = "\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 25 25\" class=\"abcjs-play-svg\">\n    <g>\n    <polygon points=\"4 0 23 12.5 4 25\"/>\n    </g>\n</svg>\n";
module.exports = svg;

/***/ }),

/***/ "./src/synth/images/reset.svg.js":
/*!***************************************!*\
  !*** ./src/synth/images/reset.svg.js ***!
  \***************************************/
/***/ (function(module) {

var svg = "\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 25 25\">\n  <g>\n    <polygon points=\"5 12.5 24 0 24 25\"/>\n    <rect width=\"3\" height=\"25\" x=\"0\" y=\"0\"/>\n  </g>\n</svg>\n";
module.exports = svg;

/***/ }),

/***/ "./src/synth/instrument-index-to-name.js":
/*!***********************************************!*\
  !*** ./src/synth/instrument-index-to-name.js ***!
  \***********************************************/
/***/ (function(module) {

var instrumentIndexToName = ["acoustic_grand_piano", "bright_acoustic_piano", "electric_grand_piano", "honkytonk_piano", "electric_piano_1", "electric_piano_2", "harpsichord", "clavinet", "celesta", "glockenspiel", "music_box", "vibraphone", "marimba", "xylophone", "tubular_bells", "dulcimer", "drawbar_organ", "percussive_organ", "rock_organ", "church_organ", "reed_organ", "accordion", "harmonica", "tango_accordion", "acoustic_guitar_nylon", "acoustic_guitar_steel", "electric_guitar_jazz", "electric_guitar_clean", "electric_guitar_muted", "overdriven_guitar", "distortion_guitar", "guitar_harmonics", "acoustic_bass", "electric_bass_finger", "electric_bass_pick", "fretless_bass", "slap_bass_1", "slap_bass_2", "synth_bass_1", "synth_bass_2", "violin", "viola", "cello", "contrabass", "tremolo_strings", "pizzicato_strings", "orchestral_harp", "timpani", "string_ensemble_1", "string_ensemble_2", "synth_strings_1", "synth_strings_2", "choir_aahs", "voice_oohs", "synth_choir", "orchestra_hit", "trumpet", "trombone", "tuba", "muted_trumpet", "french_horn", "brass_section", "synth_brass_1", "synth_brass_2", "soprano_sax", "alto_sax", "tenor_sax", "baritone_sax", "oboe", "english_horn", "bassoon", "clarinet", "piccolo", "flute", "recorder", "pan_flute", "blown_bottle", "shakuhachi", "whistle", "ocarina", "lead_1_square", "lead_2_sawtooth", "lead_3_calliope", "lead_4_chiff", "lead_5_charang", "lead_6_voice", "lead_7_fifths", "lead_8_bass_lead", "pad_1_new_age", "pad_2_warm", "pad_3_polysynth", "pad_4_choir", "pad_5_bowed", "pad_6_metallic", "pad_7_halo", "pad_8_sweep", "fx_1_rain", "fx_2_soundtrack", "fx_3_crystal", "fx_4_atmosphere", "fx_5_brightness", "fx_6_goblins", "fx_7_echoes", "fx_8_scifi", "sitar", "banjo", "shamisen", "koto", "kalimba", "bagpipe", "fiddle", "shanai", "tinkle_bell", "agogo", "steel_drums", "woodblock", "taiko_drum", "melodic_tom", "synth_drum", "reverse_cymbal", "guitar_fret_noise", "breath_noise", "seashore", "bird_tweet", "telephone_ring", "helicopter", "applause", "gunshot", "percussion"];
module.exports = instrumentIndexToName;

/***/ }),

/***/ "./src/synth/load-note.js":
/*!********************************!*\
  !*** ./src/synth/load-note.js ***!
  \********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// Load one mp3 file for one note.
// url = the base url for the soundfont
// instrument = the instrument name (e.g. "acoustic_grand_piano")
// name = the pitch name (e.g. "A3")
var soundsCache = __webpack_require__(/*! ./sounds-cache */ "./src/synth/sounds-cache.js");

var getNote = function getNote(url, instrument, name, audioContext) {
  return new Promise(function (resolve, reject) {
    if (!soundsCache[instrument]) soundsCache[instrument] = {};
    var instrumentCache = soundsCache[instrument];

    if (instrumentCache[name] === 'error') {
      return resolve({
        instrument: instrument,
        name: name,
        status: "error",
        message: "Unable to load sound font" + ' ' + url + ' ' + instrument + ' ' + name
      });
    }

    if (instrumentCache[name] === 'pending') {
      return resolve({
        instrument: instrument,
        name: name,
        status: "pending"
      });
    }

    if (instrumentCache[name]) {
      return resolve({
        instrument: instrument,
        name: name,
        status: "cached"
      });
    } // if (this.debugCallback)
    // 	this.debugCallback(`Loading sound: ${instrument} ${name}`);


    instrumentCache[name] = "pending"; // This can be called in parallel, so don't call it a second time before the first one has loaded.

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url + instrument + '-mp3/' + name + '.mp3', true);
    xhr.responseType = 'arraybuffer';
    var self = this;

    function onSuccess(audioBuffer) {
      instrumentCache[name] = audioBuffer; // if (self.debugCallback)
      // 	self.debugCallback(`Sound loaded: ${instrument} ${name} ${url}`);

      resolve({
        instrument: instrument,
        name: name,
        status: "loaded"
      });
    }

    function onFailure(error) {
      error = "Can't decode sound. " + url + ' ' + instrument + ' ' + name + ' ' + error;
      if (self.debugCallback) self.debugCallback(error);
      return resolve({
        instrument: instrument,
        name: name,
        status: "error",
        message: error
      });
    }

    xhr.onload = function (e) {
      if (this.status === 200) {
        try {
          var promise = audioContext.decodeAudioData(this.response, onSuccess, onFailure); // older browsers only have the callback. Newer ones will report an unhandled
          // rejection if catch isn't handled so we need both. We don't need to report it twice, though.

          if (promise && promise["catch"]) promise["catch"](function () {});
        } catch (error) {
          reject(error);
        }
      } else {
        instrumentCache[name] = "error"; // To keep this from trying to load repeatedly.

        var cantLoadMp3 = "Onload error loading sound: " + name + " " + url + " " + e.currentTarget.status + " " + e.currentTarget.statusText;
        if (self.debugCallback) self.debugCallback(cantLoadMp3);
        return resolve({
          instrument: instrument,
          name: name,
          status: "error",
          message: cantLoadMp3
        });
      }
    };

    xhr.addEventListener("error", function () {
      instrumentCache[name] = "error"; // To keep this from trying to load repeatedly.

      var cantLoadMp3 = "Error in loading sound: " + " " + url;
      if (self.debugCallback) self.debugCallback(cantLoadMp3);
      return resolve({
        instrument: instrument,
        name: name,
        status: "error",
        message: cantLoadMp3
      });
    }, false);
    xhr.send();
  });
};

module.exports = getNote;

/***/ }),

/***/ "./src/synth/pitch-to-note-name.js":
/*!*****************************************!*\
  !*** ./src/synth/pitch-to-note-name.js ***!
  \*****************************************/
/***/ (function(module) {

var pitchToNoteName = {
  21: 'A0',
  22: 'Bb0',
  23: 'B0',
  24: 'C1',
  25: 'Db1',
  26: 'D1',
  27: 'Eb1',
  28: 'E1',
  29: 'F1',
  30: 'Gb1',
  31: 'G1',
  32: 'Ab1',
  33: 'A1',
  34: 'Bb1',
  35: 'B1',
  36: 'C2',
  37: 'Db2',
  38: 'D2',
  39: 'Eb2',
  40: 'E2',
  41: 'F2',
  42: 'Gb2',
  43: 'G2',
  44: 'Ab2',
  45: 'A2',
  46: 'Bb2',
  47: 'B2',
  48: 'C3',
  49: 'Db3',
  50: 'D3',
  51: 'Eb3',
  52: 'E3',
  53: 'F3',
  54: 'Gb3',
  55: 'G3',
  56: 'Ab3',
  57: 'A3',
  58: 'Bb3',
  59: 'B3',
  60: 'C4',
  61: 'Db4',
  62: 'D4',
  63: 'Eb4',
  64: 'E4',
  65: 'F4',
  66: 'Gb4',
  67: 'G4',
  68: 'Ab4',
  69: 'A4',
  70: 'Bb4',
  71: 'B4',
  72: 'C5',
  73: 'Db5',
  74: 'D5',
  75: 'Eb5',
  76: 'E5',
  77: 'F5',
  78: 'Gb5',
  79: 'G5',
  80: 'Ab5',
  81: 'A5',
  82: 'Bb5',
  83: 'B5',
  84: 'C6',
  85: 'Db6',
  86: 'D6',
  87: 'Eb6',
  88: 'E6',
  89: 'F6',
  90: 'Gb6',
  91: 'G6',
  92: 'Ab6',
  93: 'A6',
  94: 'Bb6',
  95: 'B6',
  96: 'C7',
  97: 'Db7',
  98: 'D7',
  99: 'Eb7',
  100: 'E7',
  101: 'F7',
  102: 'Gb7',
  103: 'G7',
  104: 'Ab7',
  105: 'A7',
  106: 'Bb7',
  107: 'B7',
  108: 'C8',
  109: 'Db8',
  110: 'D8',
  111: 'Eb8',
  112: 'E8',
  113: 'F8',
  114: 'Gb8',
  115: 'G8',
  116: 'Ab8',
  117: 'A8',
  118: 'Bb8',
  119: 'B8',
  120: 'C9',
  121: 'Db9'
};
module.exports = pitchToNoteName;

/***/ }),

/***/ "./src/synth/pitches-to-perc.js":
/*!**************************************!*\
  !*** ./src/synth/pitches-to-perc.js ***!
  \**************************************/
/***/ (function(module) {

var pitchMap = {
  f0: "_C",
  n0: "=C",
  s0: "^C",
  x0: "C",
  f1: "_D",
  n1: "=D",
  s1: "^D",
  x1: "D",
  f2: "_E",
  n2: "=E",
  s2: "^E",
  x2: "E",
  f3: "_F",
  n3: "=F",
  s3: "^F",
  x3: "F",
  f4: "_G",
  n4: "=G",
  s4: "^G",
  x4: "G",
  f5: "_A",
  n5: "=A",
  s5: "^A",
  x5: "A",
  f6: "_B",
  n6: "=B",
  s6: "^B",
  x6: "B",
  f7: "_c",
  n7: "=c",
  s7: "^c",
  x7: "c",
  f8: "_d",
  n8: "=d",
  s8: "^d",
  x8: "d",
  f9: "_e",
  n9: "=e",
  s9: "^e",
  x9: "e",
  f10: "_f",
  n10: "=f",
  s10: "^f",
  x10: "f",
  f11: "_g",
  n11: "=g",
  s11: "^g",
  x11: "g",
  f12: "_a",
  n12: "=a",
  s12: "^a",
  x12: "a",
  f13: "_b",
  n13: "=b",
  s13: "^b",
  x13: "b"
};

function pitchesToPerc(pitchObj) {
  var pitch = (pitchObj.accidental ? pitchObj.accidental[0] : 'x') + pitchObj.verticalPos;
  return pitchMap[pitch];
}

module.exports = pitchesToPerc;

/***/ }),

/***/ "./src/synth/place-note.js":
/*!*********************************!*\
  !*** ./src/synth/place-note.js ***!
  \*********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var soundsCache = __webpack_require__(/*! ./sounds-cache */ "./src/synth/sounds-cache.js");

var pitchToNoteName = __webpack_require__(/*! ./pitch-to-note-name */ "./src/synth/pitch-to-note-name.js");

var centsToFactor = __webpack_require__(/*! ./cents-to-factor */ "./src/synth/cents-to-factor.js");

function placeNote(outputAudioBuffer, sampleRate, sound, startArray, volumeMultiplier, ofsMs, fadeTimeSec, noteEndSec) {
  // sound contains { instrument, pitch, volume, len, pan, tempoMultiplier
  // len is in whole notes. Multiply by tempoMultiplier to get seconds.
  // ofsMs is an offset to subtract from the note to line up programs that have different length onsets.
  var OfflineAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  var len = sound.len * sound.tempoMultiplier;
  if (ofsMs) len += ofsMs / 1000;
  len -= noteEndSec;
  if (len < 0) len = 0.005; // Have some small audible length no matter how short the note is.

  var offlineCtx = new OfflineAC(2, Math.floor((len + fadeTimeSec) * sampleRate), sampleRate);
  var noteName = pitchToNoteName[sound.pitch];
  var noteBuffer = soundsCache[sound.instrument][noteName];

  if (noteBuffer === "error" || noteBuffer === "pending") {
    // If the note isn't available, just leave a blank spot
    // If the note is still pending by now that means an error happened when loading. There was probably a timeout.
    console.log("Didn't load note", sound.instrument, noteName, noteBuffer);
    return;
  } // create audio buffer


  var source = offlineCtx.createBufferSource();
  source.buffer = noteBuffer; // add gain
  // volume can be between 1 to 127. This translation to gain is just trial and error.
  // The smaller the first number, the more dynamic range between the quietest to loudest.
  // The larger the second number, the louder it will be in general.

  var volume = sound.volume / 96 * volumeMultiplier;
  source.gainNode = offlineCtx.createGain(); // add pan if supported and present

  if (sound.pan && offlineCtx.createStereoPanner) {
    source.panNode = offlineCtx.createStereoPanner();
    source.panNode.pan.setValueAtTime(sound.pan, 0);
  }

  source.gainNode.gain.value = volume; // Math.min(2, Math.max(0, volume));

  source.gainNode.gain.linearRampToValueAtTime(source.gainNode.gain.value, len);
  source.gainNode.gain.linearRampToValueAtTime(0.0, len + fadeTimeSec);

  if (sound.cents) {
    source.playbackRate.value = centsToFactor(sound.cents);
  } // connect all the nodes


  if (source.panNode) {
    source.panNode.connect(offlineCtx.destination);
    source.gainNode.connect(source.panNode);
  } else {
    source.gainNode.connect(offlineCtx.destination);
  }

  source.connect(source.gainNode); // Do the process of creating the sound and placing it in the buffer

  source.start(0);

  if (source.noteOff) {
    source.noteOff(len + fadeTimeSec);
  } else {
    source.stop(len + fadeTimeSec);
  }

  var fnResolve;

  offlineCtx.oncomplete = function (e) {
    if (e.renderedBuffer) {
      // If the system gets overloaded then this can start failing. Just drop the note if so.
      for (var i = 0; i < startArray.length; i++) {
        //Math.floor(startArray[i] * sound.tempoMultiplier * sampleRate)
        var start = startArray[i] * sound.tempoMultiplier;
        if (ofsMs) start -= ofsMs / 1000;
        if (start < 0) start = 0; // If the item that is moved back is at the very beginning of the buffer then don't move it back. To do that would be to push everything else forward. TODO-PER: this should probably be done at some point but then it would change timing in existing apps.

        start = Math.floor(start * sampleRate);
        copyToChannel(outputAudioBuffer, e.renderedBuffer, start);
      }
    }

    fnResolve();
  };

  offlineCtx.startRendering();
  return new Promise(function (resolve, reject) {
    fnResolve = resolve;
  });
}

var copyToChannel = function copyToChannel(toBuffer, fromBuffer, start) {
  for (var ch = 0; ch < 2; ch++) {
    var fromData = fromBuffer.getChannelData(ch);
    var toData = toBuffer.getChannelData(ch); // Mix the current note into the existing track

    for (var n = 0; n < fromData.length; n++) {
      toData[n + start] += fromData[n];
    }
  }
};

module.exports = placeNote;

/***/ }),

/***/ "./src/synth/play-event.js":
/*!*********************************!*\
  !*** ./src/synth/play-event.js ***!
  \*********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var SynthSequence = __webpack_require__(/*! ./synth-sequence */ "./src/synth/synth-sequence.js");

var CreateSynth = __webpack_require__(/*! ./create-synth */ "./src/synth/create-synth.js");

var activeAudioContext = __webpack_require__(/*! ./active-audio-context */ "./src/synth/active-audio-context.js");

function playEvent(midiPitches, midiGracePitches, millisecondsPerMeasure) {
  var sequence = new SynthSequence();

  for (var i = 0; i < midiPitches.length; i++) {
    var note = midiPitches[i];
    var trackNum = sequence.addTrack();
    sequence.setInstrument(trackNum, note.instrument);

    if (i === 0 && midiGracePitches) {
      for (var j = 0; j < midiGracePitches.length; j++) {
        var grace = midiGracePitches[j];
        sequence.appendNote(trackNum, grace.pitch, 1 / 64, grace.volume, grace.cents);
      }
    }

    sequence.appendNote(trackNum, note.pitch, note.duration, note.volume, note.cents);
  }

  var ac = activeAudioContext();

  if (ac.state === "suspended") {
    return ac.resume().then(function () {
      return doPlay(sequence, millisecondsPerMeasure);
    });
  } else {
    return doPlay(sequence, millisecondsPerMeasure);
  }
}

function doPlay(sequence, millisecondsPerMeasure) {
  var buffer = new CreateSynth();
  return buffer.init({
    sequence: sequence,
    millisecondsPerMeasure: millisecondsPerMeasure
  }).then(function () {
    return buffer.prime();
  }).then(function () {
    buffer.start();
    return Promise.resolve();
  });
}

module.exports = playEvent;

/***/ }),

/***/ "./src/synth/register-audio-context.js":
/*!*********************************************!*\
  !*** ./src/synth/register-audio-context.js ***!
  \*********************************************/
/***/ (function(module) {

// Call this when it is safe for the abcjs to produce sound. This is after the first user gesture on the page.
// If you call it with no parameters, then an AudioContext is created and stored.
// If you call it with a parameter, that is used as an already created AudioContext.
function registerAudioContext(ac) {
  // If one is passed in, that is the one to use even if there was already one created.
  if (ac) window.abcjsAudioContext = ac;else {
    // no audio context passed in, so create it unless there is already one from before.
    if (!window.abcjsAudioContext) {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      window.abcjsAudioContext = new AudioContext();
    }
  }
  return window.abcjsAudioContext.state !== "suspended";
}

module.exports = registerAudioContext;

/***/ }),

/***/ "./src/synth/sounds-cache.js":
/*!***********************************!*\
  !*** ./src/synth/sounds-cache.js ***!
  \***********************************/
/***/ (function(module) {

var soundsCache = {};
module.exports = soundsCache;

/***/ }),

/***/ "./src/synth/supports-audio.js":
/*!*************************************!*\
  !*** ./src/synth/supports-audio.js ***!
  \*************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var activeAudioContext = __webpack_require__(/*! ./active-audio-context */ "./src/synth/active-audio-context.js"); //
// Support for audio depends on three things: support for Promise, support for AudioContext, and support for AudioContext.resume.
// Unfortunately, AudioContext.resume cannot be detected unless an AudioContext is created, and creating an AudioContext can't
// be done until a user click, so there is no way to know for sure if audio is supported until the user tries.
// We can get close, though - we can test for Promises and AudioContext - there are just a few evergreen browsers that supported
// that before supporting resume, so we'll test what we can.
// The best use of this routine is to call it before doing any audio related stuff to decide whether to bother.
// But then, call it again after a user interaction to test for resume.


function supportsAudio() {
  var aac = activeAudioContext();
  if (aac) return aac.resume !== undefined;
  if (!window.Promise) return false;
  return !!window.AudioContext || !!window.webkitAudioContext || !!navigator.mozAudioContext || !!navigator.msAudioContext;
}

module.exports = supportsAudio;

/***/ }),

/***/ "./src/synth/synth-controller.js":
/*!***************************************!*\
  !*** ./src/synth/synth-controller.js ***!
  \***************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var CreateSynthControl = __webpack_require__(/*! ./create-synth-control */ "./src/synth/create-synth-control.js");

var CreateSynth = __webpack_require__(/*! ./create-synth */ "./src/synth/create-synth.js");

var TimingCallbacks = __webpack_require__(/*! ../api/abc_timing_callbacks */ "./src/api/abc_timing_callbacks.js");

var activeAudioContext = __webpack_require__(/*! ./active-audio-context */ "./src/synth/active-audio-context.js");

function SynthController() {
  var self = this;
  self.warp = 100;
  self.cursorControl = null;
  self.visualObj = null;
  self.timer = null;
  self.midiBuffer = null;
  self.options = null;
  self.currentTempo = null;
  self.control = null;
  self.isLooping = false;
  self.isStarted = false;
  self.isLoaded = false;
  self.isLoading = false;

  self.load = function (selector, cursorControl, visualOptions) {
    if (!visualOptions) visualOptions = {};
    self.control = new CreateSynthControl(selector, {
      loopHandler: visualOptions.displayLoop ? self.toggleLoop : undefined,
      restartHandler: visualOptions.displayRestart ? self.restart : undefined,
      playPromiseHandler: visualOptions.displayPlay ? self.play : undefined,
      progressHandler: visualOptions.displayProgress ? self.randomAccess : undefined,
      warpHandler: visualOptions.displayWarp ? self.onWarp : undefined,
      afterResume: self.init
    });
    self.cursorControl = cursorControl;
    self.disable(true);
  };

  self.disable = function (isDisabled) {
    if (self.control) self.control.disable(isDisabled);
  };

  self.setTune = function (visualObj, userAction, audioParams) {
    self.visualObj = visualObj;
    self.disable(false);
    self.options = audioParams;

    if (self.control) {
      self.pause();
      self.setProgress(0, 1);
      self.control.resetAll();
      self.restart();
      self.isStarted = false;
    }

    self.isLooping = false;
    if (userAction) return self.go();else {
      return Promise.resolve({
        status: "no-audio-context"
      });
    }
  };

  self.go = function () {
    self.isLoading = true;
    var millisecondsPerMeasure = self.visualObj.millisecondsPerMeasure() * 100 / self.warp;
    self.currentTempo = Math.round(self.visualObj.getBeatsPerMeasure() / millisecondsPerMeasure * 60000);
    if (self.control) self.control.setTempo(self.currentTempo);
    self.percent = 0;
    var loadingResponse;
    if (!self.midiBuffer) self.midiBuffer = new CreateSynth();
    return activeAudioContext().resume().then(function (response) {
      return self.midiBuffer.init({
        visualObj: self.visualObj,
        options: self.options,
        millisecondsPerMeasure: millisecondsPerMeasure
      });
    }).then(function (response) {
      loadingResponse = response;
      return self.midiBuffer.prime();
    }).then(function () {
      var subdivisions = 16;
      if (self.cursorControl && self.cursorControl.beatSubdivisions !== undefined && parseInt(self.cursorControl.beatSubdivisions, 10) >= 1 && parseInt(self.cursorControl.beatSubdivisions, 10) <= 64) subdivisions = parseInt(self.cursorControl.beatSubdivisions, 10); // Need to create the TimingCallbacks after priming the midi so that the midi data is available for the callbacks.

      self.timer = new TimingCallbacks(self.visualObj, {
        beatCallback: self.beatCallback,
        eventCallback: self.eventCallback,
        lineEndCallback: self.lineEndCallback,
        qpm: self.currentTempo,
        extraMeasuresAtBeginning: self.cursorControl ? self.cursorControl.extraMeasuresAtBeginning : undefined,
        lineEndAnticipation: self.cursorControl ? self.cursorControl.lineEndAnticipation : 0,
        beatSubdivisions: subdivisions
      });
      if (self.cursorControl && self.cursorControl.onReady && typeof self.cursorControl.onReady === 'function') self.cursorControl.onReady(self);
      self.isLoaded = true;
      self.isLoading = false;
      return Promise.resolve({
        status: "created",
        notesStatus: loadingResponse
      });
    });
  };

  self.destroy = function () {
    if (self.timer) {
      self.timer.reset();
      self.timer.stop();
      self.timer = null;
    }

    if (self.midiBuffer) {
      self.midiBuffer.stop();
      self.midiBuffer = null;
    }

    self.setProgress(0, 1);
    if (self.control) self.control.resetAll();
  };

  self.play = function () {
    return self.runWhenReady(self._play, undefined);
  };

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  self.runWhenReady = function (fn, arg1) {
    if (!self.visualObj) return Promise.resolve({
      status: "loading"
    });

    if (self.isLoading) {
      // Some other promise is waiting for the tune to be loaded, so just wait.
      return sleep(500).then(function () {
        if (self.isLoading) return self.runWhenReady(fn, arg1);
        return fn(arg1);
      });
    } else if (!self.isLoaded) {
      return self.go().then(function () {
        return fn(arg1);
      });
    } else {
      return fn(arg1);
    }
  };

  self._play = function () {
    return activeAudioContext().resume().then(function () {
      self.isStarted = !self.isStarted;

      if (self.isStarted) {
        if (self.cursorControl && self.cursorControl.onStart && typeof self.cursorControl.onStart === 'function') self.cursorControl.onStart();
        self.midiBuffer.start();
        self.timer.start(self.percent);
        if (self.control) self.control.pushPlay(true);
      } else {
        self.pause();
      }

      return Promise.resolve({
        status: "ok"
      });
    });
  };

  self.pause = function () {
    if (self.timer) {
      self.timer.pause();
      self.midiBuffer.pause();
      if (self.control) self.control.pushPlay(false);
    }
  };

  self.toggleLoop = function () {
    self.isLooping = !self.isLooping;
    if (self.control) self.control.pushLoop(self.isLooping);
  };

  self.restart = function () {
    if (self.timer) {
      self.timer.setProgress(0);
      self.midiBuffer.seek(0);
    }
  };

  self.randomAccess = function (ev) {
    return self.runWhenReady(self._randomAccess, ev);
  };

  self._randomAccess = function (ev) {
    var background = ev.target.classList.contains('abcjs-midi-progress-indicator') ? ev.target.parentNode : ev.target;
    var percent = (ev.x - background.offsetLeft) / background.offsetWidth;
    if (percent < 0) percent = 0;
    if (percent > 1) percent = 1;
    self.seek(percent);
    return Promise.resolve({
      status: "ok"
    });
  };

  self.seek = function (percent, units) {
    if (self.timer && self.midiBuffer) {
      self.timer.setProgress(percent, units);
      self.midiBuffer.seek(percent, units);
    }
  };

  self.setWarp = function (newWarp) {
    if (parseInt(newWarp, 10) > 0) {
      self.warp = parseInt(newWarp, 10);
      var wasPlaying = self.isStarted;
      var startPercent = self.percent;
      self.destroy();
      self.isStarted = false;
      return self.go().then(function () {
        self.setProgress(startPercent, self.midiBuffer.duration * 1000);
        if (self.control) self.control.setWarp(self.currentTempo, self.warp);

        if (wasPlaying) {
          return self.play().then(function () {
            self.seek(startPercent);
            return Promise.resolve();
          });
        }

        self.seek(startPercent);
        return Promise.resolve();
      });
    }

    return Promise.resolve();
  };

  self.onWarp = function (ev) {
    var newWarp = ev.target.value;
    return self.setWarp(newWarp);
  };

  self.setProgress = function (percent, totalTime) {
    self.percent = percent;
    if (self.control) self.control.setProgress(percent, totalTime);
  };

  self.finished = function () {
    self.timer.reset();

    if (self.isLooping) {
      self.timer.start(0);
      self.midiBuffer.finished();
      self.midiBuffer.start();
      return "continue";
    } else {
      self.timer.stop();

      if (self.isStarted) {
        if (self.control) self.control.pushPlay(false);
        self.isStarted = false;
        self.midiBuffer.finished();
        if (self.cursorControl && self.cursorControl.onFinished && typeof self.cursorControl.onFinished === 'function') self.cursorControl.onFinished();
        self.setProgress(0, 1);
      }
    }
  };

  self.beatCallback = function (beatNumber, totalBeats, totalTime, position) {
    var percent = beatNumber / totalBeats;
    self.setProgress(percent, totalTime);
    if (self.cursorControl && self.cursorControl.onBeat && typeof self.cursorControl.onBeat === 'function') self.cursorControl.onBeat(beatNumber, totalBeats, totalTime, position);
  };

  self.eventCallback = function (event) {
    if (event) {
      if (self.cursorControl && self.cursorControl.onEvent && typeof self.cursorControl.onEvent === 'function') self.cursorControl.onEvent(event);
    } else {
      return self.finished();
    }
  };

  self.lineEndCallback = function (lineEvent, leftEvent) {
    if (self.cursorControl && self.cursorControl.onLineEnd && typeof self.cursorControl.onLineEnd === 'function') self.cursorControl.onLineEnd(lineEvent, leftEvent);
  };

  self.getUrl = function () {
    return self.midiBuffer.download();
  };

  self.download = function (fileName) {
    var url = self.getUrl();
    var link = document.createElement('a');
    document.body.appendChild(link);
    link.setAttribute("style", "display: none;");
    link.href = url;
    link.download = fileName ? fileName : 'output.wav';
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };
}

module.exports = SynthController;

/***/ }),

/***/ "./src/synth/synth-sequence.js":
/*!*************************************!*\
  !*** ./src/synth/synth-sequence.js ***!
  \*************************************/
/***/ (function(module) {

var SynthSequence = function SynthSequence() {
  var self = this;
  self.tracks = [];
  self.totalDuration = 0;
  self.currentInstrument = [];
  self.starts = [];

  self.addTrack = function () {
    self.tracks.push([]);
    self.currentInstrument.push(0);
    self.starts.push(0);
    return self.tracks.length - 1;
  };

  self.setInstrument = function (trackNumber, instrumentNumber) {
    self.tracks[trackNumber].push({
      channel: 0,
      cmd: "program",
      instrument: instrumentNumber
    });
    self.currentInstrument[trackNumber] = instrumentNumber;
  };

  self.appendNote = function (trackNumber, pitch, durationInMeasures, volume, cents) {
    var note = {
      cmd: "note",
      duration: durationInMeasures,
      gap: 0,
      instrument: self.currentInstrument[trackNumber],
      pitch: pitch,
      start: self.starts[trackNumber],
      volume: volume
    };
    if (cents) note.cents = cents;
    self.tracks[trackNumber].push(note);
    self.starts[trackNumber] += durationInMeasures;
    self.totalDuration = Math.max(self.totalDuration, self.starts[trackNumber]);
  };
};

module.exports = SynthSequence;

/***/ }),

/***/ "./src/write/abc_absolute_element.js":
/*!*******************************************!*\
  !*** ./src/write/abc_absolute_element.js ***!
  \*******************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

//    abc_absolute_element.js: Definition of the AbsoluteElement class.
var setClass = __webpack_require__(/*! ./set-class */ "./src/write/set-class.js");

var highlight = __webpack_require__(/*! ./highlight */ "./src/write/highlight.js");

var unhighlight = __webpack_require__(/*! ./unhighlight */ "./src/write/unhighlight.js"); // Everything that is placed in the SVG is first created as an absolute element. This is one unit of graphic information.
// That is, it embodies a concept: a clef, a time signature, a bar line,etc. or most complexly:
// a note with its accidental, grace note, chord symbol, trill, stem, eighth flags, etc.
// In the largest sense, these are placed on the page at a particular place that is determined during the layout phase.
// This object doesn't contain any of the drawing information, though. That information is contained in an array of
// RelativeElements as the "children" of this class.
// During the layout phase, the width of all the children is calculated and the X coordinate of the absolute element is set.
//
// So, after the AbsoluteElement is placed, then its children can be placed relative to that. There are different types of
// relative elements that are placed with different rules:
// 1) Fixed - these elements don't move relative to the absolute element's coordinates. These are things like the notehead,
// any ledger lines, accidentals, etc.
// 2) Slotted - these elements can move vertically and don't get Y coordinates until after the absolute element is placed.
// These are things like the chord symbol, many decorations, the lyrics, etc.
//
// Relative elements are also classified by how they are related. This could be:
// 1) Increases the absolute element's width to the left. This doesn't change the center point of
// the absolute element, so adding a sharp to the note won't move it to the right. However, if the elements
// are close together then this enforces a minimum distance.
// 2) Has no effect on the width. Annotations and the tempo act like this. No matter how long they are the width doesn't change.
// 3) Increases the absolute element's width to the right. This doesn't change the center point,
// but it will increase the minimum distance.
// 4) Sets the width on both sides. This is the note heads. They are centered on both sides of the absolute element's X coordinate.
// duration - actual musical duration - different from notehead duration in triplets. refer to abcelem to get the notehead duration
// minspacing - spacing which must be taken on top of the width defined by the duration
// type is a meta-type for the element. It is not necessary for drawing, but it is useful to make semantic sense of the element. For instance, it can be used in the element's class name.


var AbsoluteElement = function AbsoluteElement(abcelem, duration, minspacing, type, tuneNumber, options) {
  //	console.log("Absolute:",abcelem, duration, minspacing, type, tuneNumber, options);
  if (!options) options = {};
  this.tuneNumber = tuneNumber;
  this.abcelem = abcelem;
  this.duration = duration;
  this.durationClass = options.durationClassOveride ? options.durationClassOveride : this.duration;
  this.minspacing = minspacing || 0;
  this.x = 0;
  this.children = [];
  this.heads = [];
  this.extra = [];
  this.extraw = 0;
  this.w = 0;
  this.right = [];
  this.invisible = false;
  this.bottom = undefined;
  this.top = undefined;
  this.type = type; // The following are the dimensions of the fixed part of the element.
  // That is, the chord text will be a different height depending on lot of factors, but the 8th flag will always be in the same place.

  this.fixed = {
    w: 0,
    t: undefined,
    b: undefined
  }; // there is no x-coord here, because that is set later.
  // these are the heights of all of the vertical elements that can't be placed until the end of the line.
  // the vertical order of elements that are above is: tempo, part, volume/dynamic, ending/chord, lyric
  // the vertical order of elements that are below is: lyric, chord, volume/dynamic

  this.specialY = {
    tempoHeightAbove: 0,
    partHeightAbove: 0,
    volumeHeightAbove: 0,
    dynamicHeightAbove: 0,
    endingHeightAbove: 0,
    chordHeightAbove: 0,
    lyricHeightAbove: 0,
    lyricHeightBelow: 0,
    chordHeightBelow: 0,
    volumeHeightBelow: 0,
    dynamicHeightBelow: 0
  };
};

AbsoluteElement.prototype.getFixedCoords = function () {
  return {
    x: this.x,
    w: this.fixed.w,
    t: this.fixed.t,
    b: this.fixed.b
  };
};

AbsoluteElement.prototype.addExtra = function (extra) {
  // used for accidentals, multi-measure rest text,
  // left-side decorations, gracenote heads,
  // left annotations, gracenote stems.
  // if (!(extra.c && extra.c.indexOf("accidentals") >= 0) &&
  // 	!(extra.c && extra.c.indexOf("arpeggio") >= 0) &&
  // 	extra.type !== "multimeasure-text" &&
  // 	!(extra.c === "noteheads.quarter" && (extra.scalex === 0.6 || extra.scalex === 0.36)) &&
  // 	!(extra.type === "stem" && extra.linewidth === -0.6) &&
  // 	extra.position !== "left"
  // )
  // 	console.log("extra", extra);
  this.fixed.w = Math.max(this.fixed.w, extra.dx + extra.w);
  if (this.fixed.t === undefined) this.fixed.t = extra.top;else this.fixed.t = Math.max(this.fixed.t, extra.top);
  if (this.fixed.b === undefined) this.fixed.b = extra.bottom;else this.fixed.b = Math.min(this.fixed.b, extra.bottom);
  if (extra.dx < this.extraw) this.extraw = extra.dx;
  this.extra[this.extra.length] = extra;

  this._addChild(extra);
};

AbsoluteElement.prototype.addHead = function (head) {
  if (head.dx < this.extraw) this.extraw = head.dx;
  this.heads[this.heads.length] = head;
  this.addRight(head);
};

AbsoluteElement.prototype.addRight = function (right) {
  // // used for clefs, note heads, bar lines, stems, key-signature accidentals, non-beamed flags, dots
  // if (!(right.c && right.c.indexOf("clefs") >= 0) &&
  // 	!(right.c && right.c.indexOf("noteheads") >= 0) &&
  // 	!(right.c && right.c.indexOf("flags") >= 0) &&
  // 	!(right.c && right.c.indexOf("rests") >= 0) &&
  // 	!(right.c && right.c.indexOf("dots.dot") >= 0) &&
  // 	right.type !== "stem" &&
  // 	right.type !== "bar" &&
  // 	right.type !== "none" && // used when an invisible anchor is needed.
  // 	!(this.type.indexOf("clef") >= -1 && right.c === "8") &&
  // 	this.type.indexOf("key-signature") === -1 &&
  // 	this.type.indexOf("time-signature") === -1 &&
  // 	!(this.abcelem && this.abcelem.rest && this.abcelem.rest.type === "spacer") &&
  // 	!(this.abcelem && this.abcelem.rest && this.abcelem.rest.type === "invisible") &&
  // 	!(right.type === "text" && right.position === "relative") &&
  // 	!(right.type === "text" && right.position === "right") &&
  // 	!(right.type === "text" && right.position === "above") &&
  // 	!(right.type === "text" && right.position === "below")
  // )
  // 	console.log("right", right);
  // These are the elements that are the fixed part.
  this.fixed.w = Math.max(this.fixed.w, right.dx + right.w);

  if (right.top !== undefined) {
    if (this.fixed.t === undefined) this.fixed.t = right.top;else this.fixed.t = Math.max(this.fixed.t, right.top);
  }

  if (right.bottom !== undefined) {
    if (this.fixed.b === undefined) this.fixed.b = right.bottom;else this.fixed.b = Math.min(this.fixed.b, right.bottom);
  }

  if (isNaN(this.fixed.t) || isNaN(this.fixed.b)) debugger;
  if (right.dx + right.w > this.w) this.w = right.dx + right.w;
  this.right[this.right.length] = right;

  this._addChild(right);
};

AbsoluteElement.prototype.addFixed = function (elem) {
  // used for elements that can't move relative to other elements after they have been placed.
  // used for ledger lines, bar numbers, debug msgs, clef, key sigs, time sigs
  this._addChild(elem);
};

AbsoluteElement.prototype.addFixedX = function (elem) {
  // used for elements that can't move horizontally relative to other elements after they have been placed.
  // used for parts, tempo, decorations
  this._addChild(elem);
};

AbsoluteElement.prototype.addCentered = function (elem) {
  // // used for chord labels, lyrics
  // if (!(elem.type === "chord" && elem.position === "above") &&
  // 	!(elem.type === "chord" && elem.position === "below") &&
  // 	elem.type !== 'lyric'
  // )
  // 	console.log("centered", elem);
  var half = elem.w / 2;
  if (-half < this.extraw) this.extraw = -half;
  this.extra[this.extra.length] = elem;
  if (elem.dx + half > this.w) this.w = elem.dx + half;
  this.right[this.right.length] = elem;

  this._addChild(elem);
};

AbsoluteElement.prototype.setLimit = function (member, child) {
  if (!child[member]) return;
  if (!this.specialY[member]) this.specialY[member] = child[member];else this.specialY[member] = Math.max(this.specialY[member], child[member]);
};

AbsoluteElement.prototype._addChild = function (child) {
  //	console.log("Relative:",child);
  child.parent = this;
  this.children[this.children.length] = child;
  this.pushTop(child.top);
  this.pushBottom(child.bottom);
  this.setLimit('tempoHeightAbove', child);
  this.setLimit('partHeightAbove', child);
  this.setLimit('volumeHeightAbove', child);
  this.setLimit('dynamicHeightAbove', child);
  this.setLimit('endingHeightAbove', child);
  this.setLimit('chordHeightAbove', child);
  this.setLimit('lyricHeightAbove', child);
  this.setLimit('lyricHeightBelow', child);
  this.setLimit('chordHeightBelow', child);
  this.setLimit('volumeHeightBelow', child);
  this.setLimit('dynamicHeightBelow', child);
};

AbsoluteElement.prototype.pushTop = function (top) {
  if (top !== undefined) {
    if (this.top === undefined) this.top = top;else this.top = Math.max(top, this.top);
  }
};

AbsoluteElement.prototype.pushBottom = function (bottom) {
  if (bottom !== undefined) {
    if (this.bottom === undefined) this.bottom = bottom;else this.bottom = Math.min(bottom, this.bottom);
  }
};

AbsoluteElement.prototype.setX = function (x) {
  this.x = x;

  for (var i = 0; i < this.children.length; i++) {
    this.children[i].setX(x);
  }
};

AbsoluteElement.prototype.center = function (before, after) {
  // Used to center whole rests
  var midpoint = (after.x - before.x) / 2 + before.x;
  this.x = midpoint - this.w / 2;

  for (var k = 0; k < this.children.length; k++) {
    this.children[k].setX(this.x);
  }
};

AbsoluteElement.prototype.setHint = function () {
  this.hint = true;
};

AbsoluteElement.prototype.highlight = function (klass, color) {
  highlight.bind(this)(klass, color);
};

AbsoluteElement.prototype.unhighlight = function (klass, color) {
  unhighlight.bind(this)(klass, color);
};

module.exports = AbsoluteElement;

/***/ }),

/***/ "./src/write/abc_abstract_engraver.js":
/*!********************************************!*\
  !*** ./src/write/abc_abstract_engraver.js ***!
  \********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// abc_abstract_engraver.js: Creates a data structure suitable for printing a line of abc
var AbsoluteElement = __webpack_require__(/*! ./abc_absolute_element */ "./src/write/abc_absolute_element.js");

var BeamElem = __webpack_require__(/*! ./abc_beam_element */ "./src/write/abc_beam_element.js");

var BraceElem = __webpack_require__(/*! ./abc_brace_element */ "./src/write/abc_brace_element.js");

var createClef = __webpack_require__(/*! ./abc_create_clef */ "./src/write/abc_create_clef.js");

var createKeySignature = __webpack_require__(/*! ./abc_create_key_signature */ "./src/write/abc_create_key_signature.js");

var createNoteHead = __webpack_require__(/*! ./abc_create_note_head */ "./src/write/abc_create_note_head.js");

var createTimeSignature = __webpack_require__(/*! ./abc_create_time_signature */ "./src/write/abc_create_time_signature.js");

var Decoration = __webpack_require__(/*! ./abc_decoration */ "./src/write/abc_decoration.js");

var EndingElem = __webpack_require__(/*! ./abc_ending_element */ "./src/write/abc_ending_element.js");

var glyphs = __webpack_require__(/*! ./abc_glyphs */ "./src/write/abc_glyphs.js");

var RelativeElement = __webpack_require__(/*! ./abc_relative_element */ "./src/write/abc_relative_element.js");

var spacing = __webpack_require__(/*! ./abc_spacing */ "./src/write/abc_spacing.js");

var StaffGroupElement = __webpack_require__(/*! ./abc_staff_group_element */ "./src/write/abc_staff_group_element.js");

var TempoElement = __webpack_require__(/*! ./abc_tempo_element */ "./src/write/abc_tempo_element.js");

var TieElem = __webpack_require__(/*! ./abc_tie_element */ "./src/write/abc_tie_element.js");

var TripletElem = __webpack_require__(/*! ./abc_triplet_element */ "./src/write/abc_triplet_element.js");

var VoiceElement = __webpack_require__(/*! ./abc_voice_element */ "./src/write/abc_voice_element.js");

var addChord = __webpack_require__(/*! ./add-chord */ "./src/write/add-chord.js");

var pitchesToPerc = __webpack_require__(/*! ../synth/pitches-to-perc */ "./src/synth/pitches-to-perc.js");

var parseCommon = __webpack_require__(/*! ../parse/abc_common */ "./src/parse/abc_common.js");

var getDuration = function getDuration(elem) {
  var d = 0;

  if (elem.duration) {
    d = elem.duration;
  }

  return d;
};

var hint = false;
var chartable = {
  rest: {
    0: "rests.whole",
    1: "rests.half",
    2: "rests.quarter",
    3: "rests.8th",
    4: "rests.16th",
    5: "rests.32nd",
    6: "rests.64th",
    7: "rests.128th",
    "multi": "rests.multimeasure"
  },
  note: {
    "-1": "noteheads.dbl",
    0: "noteheads.whole",
    1: "noteheads.half",
    2: "noteheads.quarter",
    3: "noteheads.quarter",
    4: "noteheads.quarter",
    5: "noteheads.quarter",
    6: "noteheads.quarter",
    7: "noteheads.quarter",
    'nostem': "noteheads.quarter"
  },
  rhythm: {
    "-1": "noteheads.slash.whole",
    0: "noteheads.slash.whole",
    1: "noteheads.slash.whole",
    2: "noteheads.slash.quarter",
    3: "noteheads.slash.quarter",
    4: "noteheads.slash.quarter",
    5: "noteheads.slash.quarter",
    6: "noteheads.slash.quarter",
    7: "noteheads.slash.quarter",
    nostem: "noteheads.slash.nostem"
  },
  x: {
    "-1": "noteheads.indeterminate",
    0: "noteheads.indeterminate",
    1: "noteheads.indeterminate",
    2: "noteheads.indeterminate",
    3: "noteheads.indeterminate",
    4: "noteheads.indeterminate",
    5: "noteheads.indeterminate",
    6: "noteheads.indeterminate",
    7: "noteheads.indeterminate",
    nostem: "noteheads.indeterminate"
  },
  harmonic: {
    "-1": "noteheads.harmonic.quarter",
    0: "noteheads.harmonic.quarter",
    1: "noteheads.harmonic.quarter",
    2: "noteheads.harmonic.quarter",
    3: "noteheads.harmonic.quarter",
    4: "noteheads.harmonic.quarter",
    5: "noteheads.harmonic.quarter",
    6: "noteheads.harmonic.quarter",
    7: "noteheads.harmonic.quarter",
    nostem: "noteheads.harmonic.quarter"
  },
  triangle: {
    "-1": "noteheads.triangle.quarter",
    0: "noteheads.triangle.quarter",
    1: "noteheads.triangle.quarter",
    2: "noteheads.triangle.quarter",
    3: "noteheads.triangle.quarter",
    4: "noteheads.triangle.quarter",
    5: "noteheads.triangle.quarter",
    6: "noteheads.triangle.quarter",
    7: "noteheads.triangle.quarter",
    nostem: "noteheads.triangle.quarter"
  },
  uflags: {
    3: "flags.u8th",
    4: "flags.u16th",
    5: "flags.u32nd",
    6: "flags.u64th"
  },
  dflags: {
    3: "flags.d8th",
    4: "flags.d16th",
    5: "flags.d32nd",
    6: "flags.d64th"
  }
};

var AbstractEngraver = function AbstractEngraver(getTextSize, tuneNumber, options) {
  this.decoration = new Decoration();
  this.getTextSize = getTextSize;
  this.tuneNumber = tuneNumber;
  this.isBagpipes = options.bagpipes;
  this.flatBeams = options.flatbeams;
  this.graceSlurs = options.graceSlurs;
  this.percmap = options.percmap;
  this.reset();
};

AbstractEngraver.prototype.reset = function () {
  this.slurs = {};
  this.ties = [];
  this.voiceScale = 1;
  this.slursbyvoice = {};
  this.tiesbyvoice = {};
  this.endingsbyvoice = {};
  this.scaleByVoice = {};
  this.tripletmultiplier = 1;
  this.abcline = undefined;
  this.accidentalSlot = undefined;
  this.accidentalshiftx = undefined;
  this.dotshiftx = undefined;
  this.hasVocals = false;
  this.minY = undefined;
  this.partstartelem = undefined;
  this.startlimitelem = undefined;
  this.stemdir = undefined;
};

AbstractEngraver.prototype.setStemHeight = function (heightInPixels) {
  this.stemHeight = Math.round(heightInPixels * 10 / spacing.STEP) / 10;
};

AbstractEngraver.prototype.getCurrentVoiceId = function (s, v) {
  return "s" + s + "v" + v;
};

AbstractEngraver.prototype.pushCrossLineElems = function (s, v) {
  this.slursbyvoice[this.getCurrentVoiceId(s, v)] = this.slurs;
  this.tiesbyvoice[this.getCurrentVoiceId(s, v)] = this.ties;
  this.endingsbyvoice[this.getCurrentVoiceId(s, v)] = this.partstartelem;
  this.scaleByVoice[this.getCurrentVoiceId(s, v)] = this.voiceScale;
};

AbstractEngraver.prototype.popCrossLineElems = function (s, v) {
  this.slurs = this.slursbyvoice[this.getCurrentVoiceId(s, v)] || {};
  this.ties = this.tiesbyvoice[this.getCurrentVoiceId(s, v)] || [];
  this.partstartelem = this.endingsbyvoice[this.getCurrentVoiceId(s, v)];
  this.voiceScale = this.scaleByVoice[this.getCurrentVoiceId(s, v)];
  if (this.voiceScale === undefined) this.voiceScale = 1;
};

AbstractEngraver.prototype.containsLyrics = function (staves) {
  for (var i = 0; i < staves.length; i++) {
    for (var j = 0; j < staves[i].voices.length; j++) {
      for (var k = 0; k < staves[i].voices[j].length; k++) {
        var el = staves[i].voices[j][k];

        if (el.lyric) {
          // We just want to see if there are vocals below the music to know where to put the dynamics.
          if (!el.positioning || el.positioning.vocalPosition === 'below') this.hasVocals = true;
          return;
        }
      }
    }
  }
};

AbstractEngraver.prototype.createABCLine = function (staffs, tempo) {
  this.minY = 2; // PER: This will be the lowest that any note reaches. It will be used to set the dynamics row.
  // See if there are any lyrics on this line.

  this.containsLyrics(staffs);
  var staffgroup = new StaffGroupElement(this.getTextSize);
  this.tempoSet = false;

  for (var s = 0; s < staffs.length; s++) {
    if (hint) this.restoreState();
    hint = false;
    this.swiss = staffs[s].clef.type === 'swiss';
    this.createABCStaff(staffgroup, staffs[s], tempo, s);
  }

  return staffgroup;
};

AbstractEngraver.prototype.createABCStaff = function (staffgroup, abcstaff, tempo, s) {
  // If the tempo is passed in, then the first element should get the tempo attached to it.
  staffgroup.getTextSize.updateFonts(abcstaff);

  for (var v = 0; v < abcstaff.voices.length; v++) {
    var voice = new VoiceElement(v, abcstaff.voices.length);

    if (v === 0) {
      voice.barfrom = abcstaff.connectBarLines === "start" || abcstaff.connectBarLines === "continue";
      voice.barto = abcstaff.connectBarLines === "continue" || abcstaff.connectBarLines === "end";
    } else {
      voice.duplicate = true; // bar lines and other duplicate info need not be created
    }

    if (abcstaff.title && abcstaff.title[v]) {
      voice.header = abcstaff.title[v].replace(/\\n/g, "\n");
      voice.headerPosition = 6 + staffgroup.getTextSize.baselineToCenter(voice.header, "voicefont", 'staff-extra voice-name', v, abcstaff.voices.length) / spacing.STEP;
    }

    if (abcstaff.clef && abcstaff.clef.type === "perc") voice.isPercussion = true;
    var clef = createClef(abcstaff.clef, this.tuneNumber);

    if (clef) {
      if (v === 0 && abcstaff.barNumber) {
        this.addMeasureNumber(abcstaff.barNumber, clef);
      }

      voice.addChild(clef);
      this.startlimitelem = clef; // limit ties here
    }

    var keySig = createKeySignature(abcstaff.key, this.tuneNumber);

    if (keySig) {
      voice.addChild(keySig);
      this.startlimitelem = keySig; // limit ties here
    }

    if (abcstaff.meter) {
      if (abcstaff.meter.type === 'specified') {
        this.measureLength = abcstaff.meter.value[0].num / abcstaff.meter.value[0].den;
      } else this.measureLength = 1;

      var ts = createTimeSignature(abcstaff.meter, this.tuneNumber);
      voice.addChild(ts);
      this.startlimitelem = ts; // limit ties here
    }

    if (voice.duplicate) voice.children = []; // we shouldn't reprint the above if we're reusing the same staff. We just created them to get the right spacing.

    var staffLines = abcstaff.clef.stafflines || abcstaff.clef.stafflines === 0 ? abcstaff.clef.stafflines : 5;

    if (this.swiss) {
      staffLines = abcstaff.clef.stafflines || abcstaff.clef.stafflines === 0 ? abcstaff.clef.stafflines : 1;
    }

    staffgroup.addVoice(voice, s, staffLines);
    var isSingleLineStaff = staffLines === 1;
    this.createABCVoice(abcstaff.voices[v], tempo, s, v, isSingleLineStaff, voice);
    staffgroup.setStaffLimits(voice);

    if (v === 0) {
      // only do brace and bracket processing on the first voice, otherwise it would be done twice.
      if (abcstaff.brace === "start" || !staffgroup.brace && abcstaff.brace) {
        if (!staffgroup.brace) staffgroup.brace = [];
        staffgroup.brace.push(new BraceElem(voice, "brace"));
      } else if (abcstaff.brace === "end" && staffgroup.brace) {
        staffgroup.brace[staffgroup.brace.length - 1].setBottomStaff(voice);
      } else if (abcstaff.brace === "continue" && staffgroup.brace) {
        staffgroup.brace[staffgroup.brace.length - 1].continuing(voice);
      }

      if (abcstaff.bracket === "start" || !staffgroup.bracket && abcstaff.bracket) {
        if (!staffgroup.bracket) staffgroup.bracket = [];
        staffgroup.bracket.push(new BraceElem(voice, "bracket"));
      } else if (abcstaff.bracket === "end" && staffgroup.bracket) {
        staffgroup.bracket[staffgroup.bracket.length - 1].setBottomStaff(voice);
      } else if (abcstaff.bracket === "continue" && staffgroup.bracket) {
        staffgroup.bracket[staffgroup.bracket.length - 1].continuing(voice);
      }
    }
  }
};

function getBeamGroup(abcline, pos) {
  // If there are notes beamed together, they are handled as a group, so find all of them here.
  var elem = abcline[pos];
  if (elem.el_type !== 'note' || !elem.startBeam || elem.endBeam) return {
    count: 1,
    elem: elem
  };
  var group = [];

  while (pos < abcline.length && abcline[pos].el_type === 'note') {
    group.push(abcline[pos]);
    if (abcline[pos].endBeam) break;
    pos++;
  }

  return {
    count: group.length,
    elem: group
  };
}

AbstractEngraver.prototype.createABCVoice = function (abcline, tempo, s, v, isSingleLineStaff, voice) {
  this.popCrossLineElems(s, v);
  this.stemdir = this.isBagpipes || this.swiss ? "down" : null;
  this.abcline = abcline;

  if (this.partstartelem) {
    this.partstartelem = new EndingElem("", null, null);
    voice.addOther(this.partstartelem);
  }

  var voiceNumber = voice.voicetotal < 2 ? -1 : voice.voicenumber;

  for (var slur in this.slurs) {
    if (this.slurs.hasOwnProperty(slur)) {
      // this is already a slur element, but it was created for the last line, so recreate it.
      this.slurs[slur] = new TieElem({
        force: this.slurs[slur].force,
        voiceNumber: voiceNumber,
        stemDir: this.slurs[slur].stemDir,
        style: this.slurs[slur].dotted
      });
      if (hint) this.slurs[slur].setHint();
      voice.addOther(this.slurs[slur]);
    }
  }

  for (var i = 0; i < this.ties.length; i++) {
    // this is already a tie element, but it was created for the last line, so recreate it.
    this.ties[i] = new TieElem({
      force: this.ties[i].force,
      stemDir: this.ties[i].stemDir,
      voiceNumber: voiceNumber,
      style: this.ties[i].dotted
    });
    if (hint) this.ties[i].setHint();
    voice.addOther(this.ties[i]);
  }

  for (var j = 0; j < this.abcline.length; j++) {
    setAveragePitch(this.abcline[j]);
    this.minY = Math.min(this.abcline[j].minpitch, this.minY);
  }

  var isFirstStaff = s === 0;
  var pos = 0;

  while (pos < this.abcline.length) {
    var ret = getBeamGroup(this.abcline, pos);
    var abselems = this.createABCElement(isFirstStaff, isSingleLineStaff, voice, ret.elem);

    if (abselems) {
      for (i = 0; i < abselems.length; i++) {
        if (!this.tempoSet && tempo && !tempo.suppress) {
          this.tempoSet = true;
          var tempoElement = new AbsoluteElement(tempo, 0, 0, "tempo", this.tuneNumber, {});
          tempoElement.addFixedX(new TempoElement(tempo, this.tuneNumber, createNoteHead));
          voice.addChild(tempoElement);
        }

        voice.addChild(abselems[i]);
      }
    }

    pos += ret.count;
  }

  this.pushCrossLineElems(s, v);
};

AbstractEngraver.prototype.saveState = function () {
  this.tiesSave = parseCommon.cloneArray(this.ties);
  this.slursSave = parseCommon.cloneHashOfHash(this.slurs);
  this.slursbyvoiceSave = parseCommon.cloneHashOfHash(this.slursbyvoice);
  this.tiesbyvoiceSave = parseCommon.cloneHashOfArrayOfHash(this.tiesbyvoice);
};

AbstractEngraver.prototype.restoreState = function () {
  this.ties = parseCommon.cloneArray(this.tiesSave);
  this.slurs = parseCommon.cloneHashOfHash(this.slursSave);
  this.slursbyvoice = parseCommon.cloneHashOfHash(this.slursbyvoiceSave);
  this.tiesbyvoice = parseCommon.cloneHashOfArrayOfHash(this.tiesbyvoiceSave);
}; // function writeMeasureWidth(voice) {
// 	var width = 0;
// 	for (var i = voice.children.length-1; i >= 0; i--) {
// 		var elem = voice.children[i];
// 		if (elem.abcelem.el_type === 'bar')
// 			break;
// 		width += elem.w;
// 	}
// 	return new RelativeElement(width.toFixed(2), -70, 0, undefined, {type:"debug"});
// }
// return an array of AbsoluteElement


AbstractEngraver.prototype.createABCElement = function (isFirstStaff, isSingleLineStaff, voice, elem) {
  var elemset = [];

  switch (elem.el_type) {
    case undefined:
      // it is undefined if we were passed an array in - an array means a set of notes that should be beamed together.
      elemset = this.createBeam(isSingleLineStaff, voice, elem);
      break;

    case "note":
      elemset[0] = this.createNote(elem, false, isSingleLineStaff, voice);

      if (this.triplet && this.triplet.isClosed()) {
        voice.addOther(this.triplet);
        this.triplet = null;
        this.tripletmultiplier = 1;
      }

      break;

    case "bar":
      elemset[0] = this.createBarLine(voice, elem, isFirstStaff);
      if (voice.duplicate && elemset.length > 0) elemset[0].invisible = true; //	  elemset[0].addChild(writeMeasureWidth(voice));

      break;

    case "meter":
      elemset[0] = createTimeSignature(elem, this.tuneNumber);
      this.startlimitelem = elemset[0]; // limit ties here

      if (voice.duplicate && elemset.length > 0) elemset[0].invisible = true;
      break;

    case "clef":
      elemset[0] = createClef(elem, this.tuneNumber);
      if (!elemset[0]) return null;
      if (voice.duplicate && elemset.length > 0) elemset[0].invisible = true;
      break;

    case "key":
      var absKey = createKeySignature(elem, this.tuneNumber);

      if (absKey) {
        elemset[0] = absKey;
        this.startlimitelem = elemset[0]; // limit ties here
      }

      if (voice.duplicate && elemset.length > 0) elemset[0].invisible = true;
      break;

    case "stem":
      this.stemdir = elem.direction === "auto" ? undefined : elem.direction;
      break;

    case "part":
      var abselem = new AbsoluteElement(elem, 0, 0, 'part', this.tuneNumber);
      var dim = this.getTextSize.calc(elem.title, 'partsfont', "part");
      abselem.addFixedX(new RelativeElement(elem.title, 0, 0, undefined, {
        type: "part",
        height: dim.height / spacing.STEP
      }));
      elemset[0] = abselem;
      break;

    case "tempo":
      var abselem3 = new AbsoluteElement(elem, 0, 0, 'tempo', this.tuneNumber);
      abselem3.addFixedX(new TempoElement(elem, this.tuneNumber, createNoteHead));
      elemset[0] = abselem3;
      break;

    case "style":
      if (elem.head === "normal") delete this.style;else this.style = elem.head;
      break;

    case "hint":
      hint = true;
      this.saveState();
      break;

    case "midi":
      // This has no effect on the visible music, so just skip it.
      break;

    case "scale":
      this.voiceScale = elem.size;
      break;

    default:
      var abselem2 = new AbsoluteElement(elem, 0, 0, 'unsupported', this.tuneNumber);
      abselem2.addFixed(new RelativeElement("element type " + elem.el_type, 0, 0, undefined, {
        type: "debug"
      }));
      elemset[0] = abselem2;
  }

  return elemset;
};

function setAveragePitch(elem) {
  if (elem.pitches) {
    sortPitch(elem);
    var sum = 0;

    for (var p = 0; p < elem.pitches.length; p++) {
      sum += elem.pitches[p].verticalPos;
    }

    elem.averagepitch = sum / elem.pitches.length;
    elem.minpitch = elem.pitches[0].verticalPos;
    elem.maxpitch = elem.pitches[elem.pitches.length - 1].verticalPos;
  }
}

AbstractEngraver.prototype.createBeam = function (isSingleLineStaff, voice, elems) {
  var abselemset = [];
  var beamelem = new BeamElem(this.stemHeight * this.voiceScale, this.stemdir, this.flatBeams || this.swiss, elems[0]);
  if (hint) beamelem.setHint();

  for (var i = 0; i < elems.length; i++) {
    var elem = elems[i];
    var abselem = this.createNote(elem, true, isSingleLineStaff, voice);
    abselemset.push(abselem);
    beamelem.add(abselem);

    if (this.triplet && this.triplet.isClosed()) {
      voice.addOther(this.triplet);
      this.triplet = null;
      this.tripletmultiplier = 1;
    }
  }

  beamelem.calcDir();
  voice.addBeam(beamelem);
  return abselemset;
};

var sortPitch = function sortPitch(elem) {
  var sorted;

  do {
    sorted = true;

    for (var p = 0; p < elem.pitches.length - 1; p++) {
      if (elem.pitches[p].pitch > elem.pitches[p + 1].pitch) {
        sorted = false;
        var tmp = elem.pitches[p];
        elem.pitches[p] = elem.pitches[p + 1];
        elem.pitches[p + 1] = tmp;
      }
    }
  } while (!sorted);
};

var ledgerLines = function ledgerLines(abselem, minPitch, maxPitch, isRest, symbolWidth, additionalLedgers, dir, dx, scale) {
  for (var i = maxPitch; i > 11; i--) {
    if (i % 2 === 0 && !isRest) {
      abselem.addFixed(new RelativeElement(null, dx, (symbolWidth + 4) * scale, i, {
        type: "ledger"
      }));
    }
  }

  for (i = minPitch; i < 1; i++) {
    if (i % 2 === 0 && !isRest) {
      abselem.addFixed(new RelativeElement(null, dx, (symbolWidth + 4) * scale, i, {
        type: "ledger"
      }));
    }
  }

  for (i = 0; i < additionalLedgers.length; i++) {
    // PER: draw additional ledgers
    var ofs = symbolWidth;
    if (dir === 'down') ofs = -ofs;
    abselem.addFixed(new RelativeElement(null, ofs + dx, (symbolWidth + 4) * scale, additionalLedgers[i], {
      type: "ledger"
    }));
  }
};

AbstractEngraver.prototype.addGraceNotes = function (elem, voice, abselem, notehead, stemHeight, isBagpipes, roomtaken) {
  var gracescale = 3 / 5;
  var graceScaleStem = 3.5 / 5; // TODO-PER: empirically found constant.

  stemHeight = Math.round(stemHeight * graceScaleStem);
  var gracebeam = null;
  var flag;

  if (elem.gracenotes.length > 1) {
    gracebeam = new BeamElem(stemHeight, "grace", isBagpipes);
    if (hint) gracebeam.setHint();
    gracebeam.mainNote = abselem; // this gives us a reference back to the note this is attached to so that the stems can be attached somewhere.
  }

  var i;
  var graceoffsets = [];

  for (i = elem.gracenotes.length - 1; i >= 0; i--) {
    // figure out where to place each gracenote
    roomtaken += 10;
    graceoffsets[i] = roomtaken;

    if (elem.gracenotes[i].accidental) {
      roomtaken += 7;
    }
  }

  for (i = 0; i < elem.gracenotes.length; i++) {
    var gracepitch = elem.gracenotes[i].verticalPos;
    flag = gracebeam ? null : chartable.uflags[isBagpipes ? 5 : 3];
    var accidentalSlot = [];
    var ret = createNoteHead(abselem, "noteheads.quarter", elem.gracenotes[i], {
      dir: "up",
      headx: -graceoffsets[i],
      extrax: -graceoffsets[i],
      flag: flag,
      scale: gracescale * this.voiceScale,
      accidentalSlot: accidentalSlot
    });
    ret.notehead.highestVert = ret.notehead.pitch + stemHeight;
    var grace = ret.notehead;
    this.addSlursAndTies(abselem, elem.gracenotes[i], grace, voice, "up", true);
    abselem.addExtra(grace); // PER: added acciaccatura slash

    if (elem.gracenotes[i].acciaccatura) {
      var pos = elem.gracenotes[i].verticalPos + 7 * gracescale; // the same formula that determines the flag position.

      var dAcciaccatura = gracebeam ? 5 : 6; // just an offset to make it line up correctly.

      abselem.addRight(new RelativeElement("flags.ugrace", -graceoffsets[i] + dAcciaccatura, 0, pos, {
        scalex: gracescale,
        scaley: gracescale
      }));
    }

    if (gracebeam) {
      // give the beam the necessary info
      var graceDuration = elem.gracenotes[i].duration / 2;
      if (isBagpipes) graceDuration /= 2;
      var pseudoabselem = {
        heads: [grace],
        abcelem: {
          averagepitch: gracepitch,
          minpitch: gracepitch,
          maxpitch: gracepitch,
          duration: graceDuration
        }
      };
      gracebeam.add(pseudoabselem);
    } else {
      // draw the stem
      var p1 = gracepitch + 1 / 3 * gracescale;
      var p2 = gracepitch + 7 * gracescale;
      var dx = grace.dx + grace.w;
      var width = -0.6;
      abselem.addExtra(new RelativeElement(null, dx, 0, p1, {
        "type": "stem",
        "pitch2": p2,
        linewidth: width
      }));
    }

    ledgerLines(abselem, gracepitch, gracepitch, false, glyphs.getSymbolWidth("noteheads.quarter"), [], true, grace.dx - 1, 0.6); // if this is the first grace note, we might want to start a slur.
    // there is a slur if graceSlurs is specifically set.
    // there is no slur if it is bagpipes.
    // there is not a slur if the element is a spacer or invisible rest.

    var isInvisibleRest = elem.rest && (elem.rest.type === "spacer" || elem.rest.type === "invisible");

    if (i === 0 && !isBagpipes && this.graceSlurs && !isInvisibleRest) {
      // This is the overall slur that is under the grace notes.
      voice.addOther(new TieElem({
        anchor1: grace,
        anchor2: notehead,
        isGrace: true
      }));
    }
  }

  if (gracebeam) {
    gracebeam.calcDir();
    voice.addBeam(gracebeam);
  }

  return roomtaken;
};

function addRestToAbsElement(abselem, elem, duration, dot, isMultiVoice, stemdir, isSingleLineStaff, durlog, voiceScale) {
  var c;
  var restpitch = 7;
  var noteHead;
  var roomTaken;
  var roomTakenRight;

  if (isMultiVoice) {
    if (stemdir === "down") restpitch = 3;
    if (stemdir === "up") restpitch = 11;
  } // There is special placement for the percussion staff. If there is one staff line, then move the rest position.


  if (isSingleLineStaff) {
    // The half and whole rests are attached to different lines normally, so we need to tweak their position to get them to both be attached to the same one.
    if (duration < 0.5) restpitch = 7;else if (duration < 1) restpitch = 7; // half rest
    else restpitch = 5; // whole rest
  }

  switch (elem.rest.type) {
    case "whole":
      c = chartable.rest[0];
      elem.averagepitch = restpitch;
      elem.minpitch = restpitch;
      elem.maxpitch = restpitch;
      dot = 0;
      break;

    case "rest":
      if (elem.style === "rhythm") // special case for rhythm: rests are a handy way to express the rhythm.
        c = chartable.rhythm[-durlog];else c = chartable.rest[-durlog];
      elem.averagepitch = restpitch;
      elem.minpitch = restpitch;
      elem.maxpitch = restpitch;
      break;

    case "invisible":
    case "invisible-multimeasure":
    case "spacer":
      c = "";
      elem.averagepitch = restpitch;
      elem.minpitch = restpitch;
      elem.maxpitch = restpitch;
      break;

    case "multimeasure":
      c = chartable.rest['multi'];
      elem.averagepitch = restpitch;
      elem.minpitch = restpitch;
      elem.maxpitch = restpitch;
      dot = 0;
      var mmWidth = glyphs.getSymbolWidth(c);
      abselem.addHead(new RelativeElement(c, mmWidth, mmWidth * 2, 7));
      var numMeasures = new RelativeElement("" + elem.rest.text, mmWidth, mmWidth, 16, {
        type: "multimeasure-text"
      });
      abselem.addExtra(numMeasures);
  }

  if (elem.rest.type.indexOf("multimeasure") < 0) {
    var ret = createNoteHead(abselem, c, {
      verticalPos: restpitch
    }, {
      dot: dot,
      scale: voiceScale
    });
    noteHead = ret.notehead;

    if (noteHead) {
      abselem.addHead(noteHead);
      roomTaken = ret.accidentalshiftx;
      roomTakenRight = ret.dotshiftx;
    }
  }

  return {
    noteHead: noteHead,
    roomTaken: roomTaken,
    roomTakenRight: roomTakenRight
  };
}

function addIfNotExist(arr, item) {
  for (var i = 0; i < arr.length; i++) {
    if (JSON.stringify(arr[i]) === JSON.stringify(item)) return;
  }

  arr.push(item);
}

AbstractEngraver.prototype.addNoteToAbcElement = function (abselem, elem, dot, stemdir, style, zeroDuration, durlog, nostem, voice) {
  var dotshiftx = 0; // room taken by chords with displaced noteheads which cause dots to shift

  var noteHead;
  var roomTaken = 0;
  var roomTakenRight = 0;
  var min;
  var i;
  var additionalLedgers = []; // The accidentalSlot will hold a list of all the accidentals on this chord. Each element is a vertical place,
  // and contains a pitch, which is the last pitch that contains an accidental in that slot. The slots are numbered
  // from closest to the note to farther left. We only need to know the last accidental we placed because
  // we know that the pitches are sorted by now.

  var accidentalSlot = [];
  var symbolWidth = 0;
  var dir = elem.averagepitch >= 6 ? "down" : "up";
  if (stemdir) dir = stemdir;
  style = elem.style ? elem.style : style; // get the style of note head.

  if (!style || style === "normal") style = "note";
  var noteSymbol;
  if (zeroDuration) noteSymbol = chartable[style].nostem;else noteSymbol = chartable[style][-durlog];
  if (!noteSymbol) console.log("noteSymbol:", style, durlog, zeroDuration); // determine elements of chords which should be shifted

  var p;

  for (p = dir === "down" ? elem.pitches.length - 2 : 1; dir === "down" ? p >= 0 : p < elem.pitches.length; p = dir === "down" ? p - 1 : p + 1) {
    var prev = elem.pitches[dir === "down" ? p + 1 : p - 1];
    var curr = elem.pitches[p];
    var delta = dir === "down" ? prev.pitch - curr.pitch : curr.pitch - prev.pitch;

    if (delta <= 1 && !prev.printer_shift) {
      curr.printer_shift = delta ? "different" : "same";

      if (curr.verticalPos > 11 || curr.verticalPos < 1) {
        // PER: add extra ledger line
        additionalLedgers.push(curr.verticalPos - curr.verticalPos % 2);
      }

      if (dir === "down") {
        roomTaken = glyphs.getSymbolWidth(noteSymbol) + 2;
      } else {
        dotshiftx = glyphs.getSymbolWidth(noteSymbol) + 2;
      }
    }
  }

  var pp = elem.pitches.length;

  for (p = 0; p < elem.pitches.length; p++) {
    if (!nostem) {
      var flag;

      if (dir === "down" && p !== 0 || dir === "up" && p !== pp - 1) {
        // not the stemmed elem of the chord
        flag = null;
      } else {
        flag = chartable[dir === "down" ? "dflags" : "uflags"][-durlog];
      }
    }

    var c;

    if (elem.pitches[p].style) {
      // There is a style for the whole group of pitches, but there could also be an override for a particular pitch.
      c = chartable[elem.pitches[p].style][-durlog];
    } else if (voice.isPercussion && this.percmap) {
      c = noteSymbol;
      var percHead = this.percmap[pitchesToPerc(elem.pitches[p])];

      if (percHead && percHead.noteHead) {
        if (chartable[percHead.noteHead]) c = chartable[percHead.noteHead][-durlog];
      }
    } else c = noteSymbol; // The highest position for the sake of placing slurs is itself if the slur is internal. It is the highest position possible if the slur is for the whole chord.
    // If the note is the only one in the chord, then any slur it has counts as if it were on the whole chord.


    elem.pitches[p].highestVert = elem.pitches[p].verticalPos;
    var isTopWhenStemIsDown = (stemdir === "up" || dir === "up") && p === 0;
    var isBottomWhenStemIsUp = (stemdir === "down" || dir === "down") && p === pp - 1;

    if (isTopWhenStemIsDown || isBottomWhenStemIsUp) {
      // place to put slurs if not already on pitches
      if (elem.startSlur || pp === 1) {
        elem.pitches[p].highestVert = elem.pitches[pp - 1].verticalPos;
        if (getDuration(elem) < 1 && (stemdir === "up" || dir === "up")) elem.pitches[p].highestVert += 6; // If the stem is up, then compensate for the length of the stem
      }

      if (elem.startSlur) {
        if (!elem.pitches[p].startSlur) elem.pitches[p].startSlur = []; //TODO possibly redundant, provided array is not optional

        for (i = 0; i < elem.startSlur.length; i++) {
          addIfNotExist(elem.pitches[p].startSlur, elem.startSlur[i]);
        }
      }

      if (elem.endSlur) {
        elem.pitches[p].highestVert = elem.pitches[pp - 1].verticalPos;
        if (getDuration(elem) < 1 && (stemdir === "up" || dir === "up")) elem.pitches[p].highestVert += 6; // If the stem is up, then compensate for the length of the stem

        if (!elem.pitches[p].endSlur) elem.pitches[p].endSlur = []; //TODO possibly redundant, provided array is not optional

        for (i = 0; i < elem.endSlur.length; i++) {
          addIfNotExist(elem.pitches[p].endSlur, elem.endSlur[i]);
        }
      }
    }

    var hasStem = !nostem && durlog <= -1;
    var ret = createNoteHead(abselem, c, elem.pitches[p], {
      dir: dir,
      extrax: -roomTaken,
      flag: flag,
      dot: dot,
      dotshiftx: dotshiftx,
      scale: this.voiceScale,
      accidentalSlot: accidentalSlot,
      shouldExtendStem: !stemdir,
      printAccidentals: !voice.isPercussion
    }, this.stemHeight - 3);
    symbolWidth = Math.max(glyphs.getSymbolWidth(c), symbolWidth);
    abselem.extraw -= ret.extraLeft;
    noteHead = ret.notehead;

    if (noteHead) {
      this.addSlursAndTies(abselem, elem.pitches[p], noteHead, voice, hasStem ? dir : null, false);
      if (elem.gracenotes && elem.gracenotes.length > 0) noteHead.bottom = noteHead.bottom - 1; // If there is a tie to the grace notes, leave a little more room for the note to avoid collisions.

      abselem.addHead(noteHead);
    }

    roomTaken += ret.accidentalshiftx;
    roomTakenRight = Math.max(roomTakenRight, ret.dotshiftx);
  } // draw stem from the furthest note to a pitch above/below the stemmed note


  if (hasStem) {
    var stemHeight = Math.round((this.stemHeight - 3) * this.voiceScale);
    var p1 = dir === "down" ? elem.minpitch - stemHeight : elem.minpitch + 1 / 3; // PER added stemdir test to make the line meet the note.

    if (p1 > 6 && !stemdir) p1 = 6;
    var p2 = dir === "down" ? elem.maxpitch - 1 / 3 : elem.maxpitch + stemHeight; // PER added stemdir test to make the line meet the note.

    if (p2 < 6 && !stemdir) p2 = 6;
    var dx = dir === "down" || abselem.heads.length === 0 ? 0 : abselem.heads[0].w;
    var width = dir === "down" ? 1 : -1; // TODO-PER-HACK: One type of note head has a different placement of the stem. This should be more generically calculated:

    if (noteHead.c === 'noteheads.slash.quarter') {
      if (dir === 'down') p2 -= 1;else p1 += 1;
    }

    abselem.addRight(new RelativeElement(null, dx, 0, p1, {
      "type": "stem",
      "pitch2": p2,
      linewidth: width
    })); //var RelativeElement = function RelativeElement(c, dx, w, pitch, opt) {

    min = Math.min(p1, p2);
  }

  return {
    noteHead: noteHead,
    roomTaken: roomTaken,
    roomTakenRight: roomTakenRight,
    min: min,
    additionalLedgers: additionalLedgers,
    dir: dir,
    symbolWidth: symbolWidth
  };
};

AbstractEngraver.prototype.addLyric = function (abselem, elem) {
  var lyricStr = "";
  parseCommon.each(elem.lyric, function (ly) {
    var div = ly.divider === ' ' ? "" : ly.divider;
    lyricStr += ly.syllable + div + "\n";
  });
  var lyricDim = this.getTextSize.calc(lyricStr, 'vocalfont', "lyric");
  var position = elem.positioning ? elem.positioning.vocalPosition : 'below';
  abselem.addCentered(new RelativeElement(lyricStr, 0, lyricDim.width, undefined, {
    type: "lyric",
    position: position,
    height: lyricDim.height / spacing.STEP,
    dim: this.getTextSize.attr('vocalfont', "lyric")
  }));
};

AbstractEngraver.prototype.createNote = function (elem, nostem, isSingleLineStaff, voice) {
  //stem presence: true for drawing stemless notehead
  var notehead = null;
  var roomtaken = 0; // room needed to the left of the note

  var roomtakenright = 0; // room needed to the right of the note

  var symbolWidth = 0;
  var additionalLedgers = []; // PER: handle the case of [bc'], where the b doesn't have a ledger line

  var dir;
  var duration = getDuration(elem);
  var zeroDuration = false;

  if (duration === 0) {
    zeroDuration = true;
    duration = 0.25;
    nostem = true;
  } //PER: zero duration will draw a quarter note head.


  var durlog = Math.floor(Math.log(duration) / Math.log(2)); //TODO use getDurlog

  var dot = 0;

  for (var tot = Math.pow(2, durlog), inc = tot / 2; tot < duration; dot++, tot += inc, inc /= 2) {
    ;
  }

  if (elem.startTriplet) {
    this.tripletmultiplier = elem.tripletMultiplier;
  }

  var durationForSpacing = duration * this.tripletmultiplier;
  if (elem.rest && elem.rest.type === 'multimeasure') durationForSpacing = 1;
  if (elem.rest && elem.rest.type === 'invisible-multimeasure') durationForSpacing = this.measureLength * elem.rest.text;
  var absType = elem.rest ? "rest" : "note";
  var abselem = new AbsoluteElement(elem, durationForSpacing, 1, absType, this.tuneNumber, {
    durationClassOveride: elem.duration * this.tripletmultiplier
  });
  if (hint) abselem.setHint();

  if (elem.rest) {
    if (this.measureLength === duration && elem.rest.type !== 'invisible' && elem.rest.type !== 'spacer' && elem.rest.type.indexOf('multimeasure') < 0) elem.rest.type = 'whole'; // If the rest is exactly a measure, always use a whole rest

    var ret1 = addRestToAbsElement(abselem, elem, duration, dot, voice.voicetotal > 1, this.stemdir, isSingleLineStaff, durlog, this.voiceScale);
    notehead = ret1.noteHead;
    roomtaken = ret1.roomTaken;
    roomtakenright = ret1.roomTakenRight;
  } else {
    var ret2 = this.addNoteToAbcElement(abselem, elem, dot, this.stemdir, this.style, zeroDuration, durlog, nostem, voice);
    if (ret2.min !== undefined) this.minY = Math.min(ret2.min, this.minY);
    notehead = ret2.noteHead;
    roomtaken = ret2.roomTaken;
    roomtakenright = ret2.roomTakenRight;
    additionalLedgers = ret2.additionalLedgers;
    dir = ret2.dir;
    symbolWidth = ret2.symbolWidth;
  }

  if (elem.lyric !== undefined) {
    this.addLyric(abselem, elem);
  }

  if (elem.gracenotes !== undefined) {
    roomtaken += this.addGraceNotes(elem, voice, abselem, notehead, this.stemHeight * this.voiceScale, this.isBagpipes, roomtaken);
  }

  if (elem.decoration) {
    this.decoration.createDecoration(voice, elem.decoration, abselem.top, notehead ? notehead.w : 0, abselem, roomtaken, dir, abselem.bottom, elem.positioning, this.hasVocals);
  }

  if (elem.barNumber) {
    abselem.addFixed(new RelativeElement(elem.barNumber, -10, 0, 0, {
      type: "barNumber"
    }));
  } // ledger lines


  ledgerLines(abselem, elem.minpitch, elem.maxpitch, elem.rest, symbolWidth, additionalLedgers, dir, -2, 1);

  if (elem.chord !== undefined) {
    var ret3 = addChord(this.getTextSize, abselem, elem, roomtaken, roomtakenright, symbolWidth);
    roomtaken = ret3.roomTaken;
    roomtakenright = ret3.roomTakenRight;
  }

  if (elem.startTriplet) {
    this.triplet = new TripletElem(elem.startTriplet, notehead, {
      flatBeams: this.flatBeams || this.swiss,
      tiesAbove: this.swiss
    }); // above is opposite from case of slurs
  }

  if (elem.endTriplet && this.triplet) {
    this.triplet.setCloseAnchor(notehead);
  }

  if (this.triplet && !elem.startTriplet && !elem.endTriplet && !(elem.rest && elem.rest.type === "spacer")) {
    this.triplet.middleNote(notehead);
  }

  return abselem;
};

AbstractEngraver.prototype.addSlursAndTies = function (abselem, pitchelem, notehead, voice, dir, isGrace) {
  if (pitchelem.endTie) {
    if (this.ties.length > 0) {
      // If there are multiple open ties, find the one that applies by matching the pitch, if possible.
      var found = false;

      for (var j = 0; j < this.ties.length; j++) {
        if (this.ties[j].anchor1 && this.ties[j].anchor1.pitch === notehead.pitch) {
          this.ties[j].setEndAnchor(notehead);
          this.ties.splice(j, 1);
          found = true;
          break;
        }
      }

      if (!found) {
        this.ties[0].setEndAnchor(notehead);
        this.ties.splice(0, 1);
      }
    }
  }

  var voiceNumber = voice.voicetotal < 2 ? -1 : voice.voicenumber;

  if (pitchelem.startTie) {
    var tie = new TieElem({
      anchor1: notehead,
      force: this.stemdir === "down" || this.stemdir === "up",
      stemDir: this.stemdir,
      isGrace: isGrace,
      voiceNumber: voiceNumber,
      style: pitchelem.startTie.style
    });
    if (hint) tie.setHint();
    this.ties[this.ties.length] = tie;
    voice.addOther(tie); // HACK-PER: For the animation, we need to know if a note is tied to the next one, so here's a flag.
    // Unfortunately, only some of the notes in the current event might be tied, but this will consider it
    // tied if any one of them is. That will work for most cases.

    abselem.startTie = true;
  }

  var slur;
  var slurid;

  if (pitchelem.endSlur) {
    for (var i = 0; i < pitchelem.endSlur.length; i++) {
      slurid = pitchelem.endSlur[i];

      if (this.slurs[slurid]) {
        slur = this.slurs[slurid];
        slur.setEndAnchor(notehead);
        delete this.slurs[slurid];
      } else {
        slur = new TieElem({
          anchor2: notehead,
          stemDir: this.stemdir,
          voiceNumber: voiceNumber
        });
        if (hint) slur.setHint();
        voice.addOther(slur);
      }

      if (this.startlimitelem) {
        slur.setStartX(this.startlimitelem);
      }
    }
  } else if (!isGrace) {
    for (var s in this.slurs) {
      if (this.slurs.hasOwnProperty(s)) {
        this.slurs[s].addInternalNote(notehead);
      }
    }
  }

  if (pitchelem.startSlur) {
    for (i = 0; i < pitchelem.startSlur.length; i++) {
      slurid = pitchelem.startSlur[i].label;
      slur = new TieElem({
        anchor1: notehead,
        stemDir: this.stemdir,
        voiceNumber: voiceNumber,
        style: pitchelem.startSlur[i].style
      });
      if (hint) slur.setHint();
      this.slurs[slurid] = slur;
      voice.addOther(slur);
    }
  }
};

AbstractEngraver.prototype.addMeasureNumber = function (number, abselem) {
  var measureNumDim = this.getTextSize.calc(number, "measurefont", 'bar-number');
  var dx = measureNumDim.width > 18 && abselem.abcelem.type === "treble" ? -7 : 0;
  abselem.addFixed(new RelativeElement(number, dx, measureNumDim.width, 11 + measureNumDim.height / spacing.STEP, {
    type: "barNumber",
    dim: this.getTextSize.attr("measurefont", 'bar-number')
  }));
};

AbstractEngraver.prototype.createBarLine = function (voice, elem, isFirstStaff) {
  // bar_thin, bar_thin_thick, bar_thin_thin, bar_thick_thin, bar_right_repeat, bar_left_repeat, bar_double_repeat
  var abselem = new AbsoluteElement(elem, 0, 10, 'bar', this.tuneNumber);
  var anchor = null; // place to attach part lines

  var dx = 0;

  if (elem.barNumber) {
    this.addMeasureNumber(elem.barNumber, abselem);
  }

  var firstdots = elem.type === "bar_right_repeat" || elem.type === "bar_dbl_repeat";
  var firstthin = elem.type !== "bar_left_repeat" && elem.type !== "bar_thick_thin" && elem.type !== "bar_invisible";
  var thick = elem.type === "bar_right_repeat" || elem.type === "bar_dbl_repeat" || elem.type === "bar_left_repeat" || elem.type === "bar_thin_thick" || elem.type === "bar_thick_thin";
  var secondthin = elem.type === "bar_left_repeat" || elem.type === "bar_thick_thin" || elem.type === "bar_thin_thin" || elem.type === "bar_dbl_repeat";
  var seconddots = elem.type === "bar_left_repeat" || elem.type === "bar_dbl_repeat"; // limit positioning of slurs

  if (firstdots || seconddots) {
    for (var slur in this.slurs) {
      if (this.slurs.hasOwnProperty(slur)) {
        this.slurs[slur].setEndX(abselem);
      }
    }

    this.startlimitelem = abselem;
  }

  if (firstdots) {
    abselem.addRight(new RelativeElement("dots.dot", dx, 1, 7));
    abselem.addRight(new RelativeElement("dots.dot", dx, 1, 5));
    dx += 6; //2 hardcoded, twice;
  }

  if (firstthin) {
    anchor = new RelativeElement(null, dx, 1, 2, {
      "type": "bar",
      "pitch2": 10,
      linewidth: 0.6
    });
    abselem.addRight(anchor);
  }

  if (elem.type === "bar_invisible") {
    anchor = new RelativeElement(null, dx, 1, 2, {
      "type": "none",
      "pitch2": 10,
      linewidth: 0.6
    });
    abselem.addRight(anchor);
  }

  if (elem.decoration) {
    this.decoration.createDecoration(voice, elem.decoration, 12, thick ? 3 : 1, abselem, 0, "down", 2, elem.positioning, this.hasVocals);
  }

  if (thick) {
    dx += 4; //3 hardcoded;

    anchor = new RelativeElement(null, dx, 4, 2, {
      "type": "bar",
      "pitch2": 10,
      linewidth: 4
    });
    abselem.addRight(anchor);
    dx += 5;
  } // if (this.partstartelem && (thick || (firstthin && secondthin))) { // means end of nth part
  // this.partstartelem.anchor2=anchor;
  // this.partstartelem = null;
  // }


  if (this.partstartelem && elem.endEnding) {
    this.partstartelem.anchor2 = anchor;
    this.partstartelem = null;
  }

  if (secondthin) {
    dx += 3; //3 hardcoded;

    anchor = new RelativeElement(null, dx, 1, 2, {
      "type": "bar",
      "pitch2": 10,
      linewidth: 0.6
    });
    abselem.addRight(anchor); // 3 is hardcoded
  }

  if (seconddots) {
    dx += 3; //3 hardcoded;

    abselem.addRight(new RelativeElement("dots.dot", dx, 1, 7));
    abselem.addRight(new RelativeElement("dots.dot", dx, 1, 5));
  } // 2 is hardcoded


  if (elem.startEnding && isFirstStaff) {
    // only put the first & second ending marks on the first staff
    var textWidth = this.getTextSize.calc(elem.startEnding, "repeatfont", '').width;
    abselem.minspacing += textWidth + 10; // Give plenty of room for the ending number.

    this.partstartelem = new EndingElem(elem.startEnding, anchor, null);
    voice.addOther(this.partstartelem);
  } // Add a little space to the left of the bar line so that nothing can crowd it.


  abselem.extraw -= 5;
  return abselem;
};

module.exports = AbstractEngraver;

/***/ }),

/***/ "./src/write/abc_beam_element.js":
/*!***************************************!*\
  !*** ./src/write/abc_beam_element.js ***!
  \***************************************/
/***/ (function(module) {

//    abc_beam_element.js: Definition of the BeamElem class.
// Most elements on the page are related to a particular absolute element -- notes, rests, bars, etc. Beams, however, span multiple elements.
// This means that beams can't be laid out until the absolute elements are placed. There is the further complication that the stems for beamed
// notes can't be laid out until the beams are because we don't know how long they will be until we know the slope of the beam and the horizontal
// spacing of the absolute elements.
//
// So, when a beam is detected, a BeamElem is created, then all notes belonging to that beam are added to it. These notes are not given stems at that time.
// Then, after the horizontal layout is complete, all of the BeamElem are iterated to set the beam position, then all of the notes that are beamed are given
// stems. After that, we are ready for the drawing step.
// There are three phases: the setup phase, when new elements are being discovered, the layout phase, when everything is calculated, and the drawing phase,
// when the object is not changed, but is used to put the elements on the page.
//
// Setup phase
//
var BeamElem = function BeamElem(stemHeight, type, flat, firstElement) {
  // type is "grace", "up", "down", or undefined. flat is used to force flat beams, as it commonly found in the grace notes of bagpipe music.
  this.type = "BeamElem";
  this.isflat = !!flat;
  this.isgrace = !!(type && type === "grace");
  this.forceup = !!(this.isgrace || type && type === "up");
  this.forcedown = !!(type && type === "down");
  this.elems = []; // all the AbsoluteElements that this beam touches. It may include embedded rests.

  this.total = 0;
  this.average = 6; // use middle line as start for average.

  this.allrests = true;
  this.stemHeight = stemHeight;
  this.beams = []; // During the layout phase, this will become a list of the beams that need to be drawn.

  if (firstElement && firstElement.duration) {
    this.duration = firstElement.duration;

    if (firstElement.startTriplet) {
      this.duration *= firstElement.tripletMultiplier;
    }

    this.duration = Math.round(this.duration * 1000) / 1000;
  } else this.duration = 0;
};

BeamElem.prototype.setHint = function () {
  this.hint = true;
};

BeamElem.prototype.add = function (abselem) {
  var pitch = abselem.abcelem.averagepitch;
  if (pitch === undefined) return; // don't include elements like spacers in beams

  if (!abselem.abcelem.rest) this.allrests = false;
  abselem.beam = this;
  this.elems.push(abselem);
  this.total = Math.round(this.total + pitch);

  if (this.min === undefined || abselem.abcelem.minpitch < this.min) {
    this.min = abselem.abcelem.minpitch;
  }

  if (this.max === undefined || abselem.abcelem.maxpitch > this.max) {
    this.max = abselem.abcelem.maxpitch;
  }
};

BeamElem.prototype.addBeam = function (beam) {
  this.beams.push(beam);
};

BeamElem.prototype.calcDir = function () {
  this.average = calcAverage(this.total, this.elems.length);

  if (this.forceup) {
    this.stemsUp = true;
  } else if (this.forcedown) {
    this.stemsUp = false;
  } else {
    var middleLine = 6; // hardcoded 6 is B

    this.stemsUp = this.average < middleLine; // true is up, false is down;
  }

  var dir = this.stemsUp ? 'up' : 'down';

  for (var i = 0; i < this.elems.length; i++) {
    for (var j = 0; j < this.elems[i].heads.length; j++) {
      this.elems[i].heads[j].stemDir = dir;
    }
  }
};

function calcAverage(total, numElements) {
  if (!numElements) return 0;
  return total / numElements;
}

module.exports = BeamElem;

/***/ }),

/***/ "./src/write/abc_brace_element.js":
/*!****************************************!*\
  !*** ./src/write/abc_brace_element.js ***!
  \****************************************/
/***/ (function(module) {

//    abc_brace_element.js: Definition of the BraceElement class.
var BraceElem = function BraceElem(voice, type) {
  this.startVoice = voice;
  this.type = type;
};

BraceElem.prototype.setBottomStaff = function (voice) {
  this.endVoice = voice; // If only the start brace has a name then the name belongs to the brace instead of the staff.

  if (this.startVoice.header && !this.endVoice.header) {
    this.header = this.startVoice.header;
    delete this.startVoice.header;
  }
};

BraceElem.prototype.continuing = function (voice) {
  // If the final staff isn't present, then use the last one we saw.
  this.lastContinuedVoice = voice;
};

BraceElem.prototype.getWidth = function () {
  return 10; // TODO-PER: right now the drawing function doesn't vary the width at all. If it does in the future then this will change.
};

BraceElem.prototype.isStartVoice = function (voice) {
  if (this.startVoice && this.startVoice.staff && this.startVoice.staff.voices.length > 0 && this.startVoice.staff.voices[0] === voice) return true;
  return false;
};

module.exports = BraceElem;

/***/ }),

/***/ "./src/write/abc_create_clef.js":
/*!**************************************!*\
  !*** ./src/write/abc_create_clef.js ***!
  \**************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

//    abc_create_clef.js
var AbsoluteElement = __webpack_require__(/*! ./abc_absolute_element */ "./src/write/abc_absolute_element.js");

var glyphs = __webpack_require__(/*! ./abc_glyphs */ "./src/write/abc_glyphs.js");

var RelativeElement = __webpack_require__(/*! ./abc_relative_element */ "./src/write/abc_relative_element.js");

var createClef = function createClef(elem, tuneNumber) {
  var clef;
  var octave = 0;
  elem.el_type = "clef";
  var abselem = new AbsoluteElement(elem, 0, 10, 'staff-extra clef', tuneNumber);
  abselem.isClef = true;

  switch (elem.type) {
    case "treble":
      clef = "clefs.G";
      break;

    case "tenor":
      clef = "clefs.C";
      break;

    case "alto":
      clef = "clefs.C";
      break;

    case "bass":
      clef = "clefs.F";
      break;

    case 'treble+8':
      clef = "clefs.G";
      octave = 1;
      break;

    case 'tenor+8':
      clef = "clefs.C";
      octave = 1;
      break;

    case 'bass+8':
      clef = "clefs.F";
      octave = 1;
      break;

    case 'alto+8':
      clef = "clefs.C";
      octave = 1;
      break;

    case 'treble-8':
      clef = "clefs.G";
      octave = -1;
      break;

    case 'tenor-8':
      clef = "clefs.C";
      octave = -1;
      break;

    case 'bass-8':
      clef = "clefs.F";
      octave = -1;
      break;

    case 'alto-8':
      clef = "clefs.C";
      octave = -1;
      break;

    case 'none':
      return null;

    case 'perc':
    case 'swiss':
      clef = "clefs.perc";
      break;

    default:
      abselem.addFixed(new RelativeElement("clef=" + elem.type, 0, 0, undefined, {
        type: "debug"
      }));
  } // if (elem.verticalPos) {
  // pitch = elem.verticalPos;
  // }


  var dx = 5;

  if (clef) {
    var height = glyphs.symbolHeightInPitches(clef);
    var ofs = clefOffsets(clef);
    abselem.addRight(new RelativeElement(clef, dx, glyphs.getSymbolWidth(clef), elem.clefPos, {
      top: height + elem.clefPos + ofs,
      bottom: elem.clefPos + ofs
    }));

    if (octave !== 0) {
      var scale = 2 / 3;
      var adjustspacing = (glyphs.getSymbolWidth(clef) - glyphs.getSymbolWidth("8") * scale) / 2;
      var pitch = octave > 0 ? abselem.top + 3 : abselem.bottom - 1;
      var top = octave > 0 ? abselem.top + 3 : abselem.bottom - 3;
      var bottom = top - 2;

      if (elem.type === "bass-8") {
        // The placement for bass octave is a little different. It should hug the clef.
        pitch = 3;
        adjustspacing = 0;
      }

      abselem.addRight(new RelativeElement("8", dx + adjustspacing, glyphs.getSymbolWidth("8") * scale, pitch, {
        scalex: scale,
        scaley: scale,
        top: top,
        bottom: bottom
      })); //abselem.top += 2;
    }
  }

  return abselem;
};

function clefOffsets(clef) {
  switch (clef) {
    case "clefs.G":
      return -5;

    case "clefs.C":
      return -4;

    case "clefs.F":
      return -4;

    case "clefs.perc":
      return -2;

    default:
      return 0;
  }
}

module.exports = createClef;

/***/ }),

/***/ "./src/write/abc_create_key_signature.js":
/*!***********************************************!*\
  !*** ./src/write/abc_create_key_signature.js ***!
  \***********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

//    abc_create_key_signature.js
var AbsoluteElement = __webpack_require__(/*! ./abc_absolute_element */ "./src/write/abc_absolute_element.js");

var glyphs = __webpack_require__(/*! ./abc_glyphs */ "./src/write/abc_glyphs.js");

var RelativeElement = __webpack_require__(/*! ./abc_relative_element */ "./src/write/abc_relative_element.js");

var parseCommon = __webpack_require__(/*! ../parse/abc_common */ "./src/parse/abc_common.js");

var createKeySignature = function createKeySignature(elem, tuneNumber) {
  if (!elem.accidentals || elem.accidentals.length === 0) return null;
  var abselem = new AbsoluteElement(elem, 0, 10, 'staff-extra key-signature', tuneNumber);
  abselem.isKeySig = true;
  var dx = 0;
  parseCommon.each(elem.accidentals, function (acc) {
    var symbol;
    var fudge = 0;

    switch (acc.acc) {
      case "sharp":
        symbol = "accidentals.sharp";
        fudge = -3;
        break;

      case "natural":
        symbol = "accidentals.nat";
        break;

      case "flat":
        symbol = "accidentals.flat";
        fudge = -1.2;
        break;

      case "quartersharp":
        symbol = "accidentals.halfsharp";
        fudge = -2.5;
        break;

      case "quarterflat":
        symbol = "accidentals.halfflat";
        fudge = -1.2;
        break;

      default:
        symbol = "accidentals.flat";
    }

    abselem.addRight(new RelativeElement(symbol, dx, glyphs.getSymbolWidth(symbol), acc.verticalPos, {
      thickness: glyphs.symbolHeightInPitches(symbol),
      top: acc.verticalPos + glyphs.symbolHeightInPitches(symbol) + fudge,
      bottom: acc.verticalPos + fudge
    }));
    dx += glyphs.getSymbolWidth(symbol) + 2;
  }, this);
  return abselem;
};

module.exports = createKeySignature;

/***/ }),

/***/ "./src/write/abc_create_note_head.js":
/*!*******************************************!*\
  !*** ./src/write/abc_create_note_head.js ***!
  \*******************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var glyphs = __webpack_require__(/*! ./abc_glyphs */ "./src/write/abc_glyphs.js");

var RelativeElement = __webpack_require__(/*! ./abc_relative_element */ "./src/write/abc_relative_element.js");

var createNoteHead = function createNoteHead(abselem, c, pitchelem, options) {
  var stemHeight = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 7;
  if (!options) options = {};
  var dir = options.dir !== undefined ? options.dir : null;
  var headx = options.headx !== undefined ? options.headx : 0;
  var extrax = options.extrax !== undefined ? options.extrax : 0;
  var flag = options.flag !== undefined ? options.flag : null;
  var dot = options.dot !== undefined ? options.dot : 0;
  var dotshiftx = options.dotshiftx !== undefined ? options.dotshiftx : 0;
  var scale = options.scale !== undefined ? options.scale : 1;
  var accidentalSlot = options.accidentalSlot !== undefined ? options.accidentalSlot : [];
  var shouldExtendStem = options.shouldExtendStem !== undefined ? options.shouldExtendStem : false;
  var printAccidentals = options.printAccidentals !== undefined ? options.printAccidentals : true; // TODO scale the dot as well

  var pitch = pitchelem.verticalPos;
  var notehead;
  var accidentalshiftx = 0;
  var newDotShiftX = 0;
  var extraLeft = 0;
  if (c === undefined) abselem.addFixed(new RelativeElement("pitch is undefined", 0, 0, 0, {
    type: "debug"
  }));else if (c === "") {
    notehead = new RelativeElement(null, 0, 0, pitch);
  } else {
    var shiftheadx = headx;

    if (pitchelem.printer_shift) {
      var adjust = pitchelem.printer_shift === "same" ? 1 : 0;
      shiftheadx = dir === "down" ? -glyphs.getSymbolWidth(c) * scale + adjust : glyphs.getSymbolWidth(c) * scale - adjust;
    }

    var opts = {
      scalex: scale,
      scaley: scale,
      thickness: glyphs.symbolHeightInPitches(c) * scale
    };
    notehead = new RelativeElement(c, shiftheadx, glyphs.getSymbolWidth(c) * scale, pitch, opts);
    notehead.stemDir = dir;

    if (flag) {
      var pos = pitch + (dir === "down" ? -stemHeight : stemHeight) * scale; // if this is a regular note, (not grace or tempo indicator) then the stem will have been stretched to the middle line if it is far from the center.

      if (shouldExtendStem) {
        if (dir === "down" && pos > 6) pos = 6;
        if (dir === "up" && pos < 6) pos = 6;
      } //if (scale===1 && (dir==="down")?(pos>6):(pos<6)) pos=6;


      var xdelta = dir === "down" ? headx : headx + notehead.w - 0.6;
      abselem.addRight(new RelativeElement(flag, xdelta, glyphs.getSymbolWidth(flag) * scale, pos, {
        scalex: scale,
        scaley: scale
      }));
    }

    newDotShiftX = notehead.w + dotshiftx - 2 + 5 * dot;

    for (; dot > 0; dot--) {
      var dotadjusty = 1 - Math.abs(pitch) % 2; //PER: take abs value of the pitch. And the shift still happens on ledger lines.

      abselem.addRight(new RelativeElement("dots.dot", notehead.w + dotshiftx - 2 + 5 * dot, glyphs.getSymbolWidth("dots.dot"), pitch + dotadjusty));
    }
  }
  if (notehead) notehead.highestVert = pitchelem.highestVert;

  if (printAccidentals && pitchelem.accidental) {
    var symb;

    switch (pitchelem.accidental) {
      case "quartersharp":
        symb = "accidentals.halfsharp";
        break;

      case "dblsharp":
        symb = "accidentals.dblsharp";
        break;

      case "sharp":
        symb = "accidentals.sharp";
        break;

      case "quarterflat":
        symb = "accidentals.halfflat";
        break;

      case "flat":
        symb = "accidentals.flat";
        break;

      case "dblflat":
        symb = "accidentals.dblflat";
        break;

      case "natural":
        symb = "accidentals.nat";
    } // if a note is at least a sixth away, it can share a slot with another accidental


    var accSlotFound = false;
    var accPlace = extrax;

    for (var j = 0; j < accidentalSlot.length; j++) {
      if (pitch - accidentalSlot[j][0] >= 6) {
        accidentalSlot[j][0] = pitch;
        accPlace = accidentalSlot[j][1];
        accSlotFound = true;
        break;
      }
    }

    if (accSlotFound === false) {
      accPlace -= glyphs.getSymbolWidth(symb) * scale + 2;
      accidentalSlot.push([pitch, accPlace]);
      accidentalshiftx = glyphs.getSymbolWidth(symb) * scale + 2;
    }

    var h = glyphs.symbolHeightInPitches(symb);
    abselem.addExtra(new RelativeElement(symb, accPlace, glyphs.getSymbolWidth(symb), pitch, {
      scalex: scale,
      scaley: scale,
      top: pitch + h / 2,
      bottom: pitch - h / 2
    }));
    extraLeft = glyphs.getSymbolWidth(symb) / 2; // TODO-PER: We need a little extra width if there is an accidental, but I'm not sure why it isn't the full width of the accidental.
  }

  return {
    notehead: notehead,
    accidentalshiftx: accidentalshiftx,
    dotshiftx: newDotShiftX,
    extraLeft: extraLeft
  };
};

module.exports = createNoteHead;

/***/ }),

/***/ "./src/write/abc_create_time_signature.js":
/*!************************************************!*\
  !*** ./src/write/abc_create_time_signature.js ***!
  \************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

//    abc_create_time_signature.js
var AbsoluteElement = __webpack_require__(/*! ./abc_absolute_element */ "./src/write/abc_absolute_element.js");

var glyphs = __webpack_require__(/*! ./abc_glyphs */ "./src/write/abc_glyphs.js");

var RelativeElement = __webpack_require__(/*! ./abc_relative_element */ "./src/write/abc_relative_element.js");

var createTimeSignature = function createTimeSignature(elem, tuneNumber) {
  elem.el_type = "timeSignature";
  var abselem = new AbsoluteElement(elem, 0, 10, 'staff-extra time-signature', tuneNumber);

  if (elem.type === "specified") {
    var x = 0;

    for (var i = 0; i < elem.value.length; i++) {
      if (i !== 0) {
        abselem.addRight(new RelativeElement('+', x + 1, glyphs.getSymbolWidth("+"), 6, {
          thickness: glyphs.symbolHeightInPitches("+")
        }));
        x += glyphs.getSymbolWidth("+") + 2;
      }

      if (elem.value[i].den) {
        var numWidth = 0;

        for (var i2 = 0; i2 < elem.value[i].num.length; i2++) {
          numWidth += glyphs.getSymbolWidth(elem.value[i].num.charAt(i2));
        }

        var denWidth = 0;

        for (i2 = 0; i2 < elem.value[i].num.length; i2++) {
          denWidth += glyphs.getSymbolWidth(elem.value[i].den.charAt(i2));
        }

        var maxWidth = Math.max(numWidth, denWidth);
        abselem.addRight(new RelativeElement(elem.value[i].num, x + (maxWidth - numWidth) / 2, numWidth, 8, {
          thickness: glyphs.symbolHeightInPitches(elem.value[i].num.charAt(0))
        }));
        abselem.addRight(new RelativeElement(elem.value[i].den, x + (maxWidth - denWidth) / 2, denWidth, 4, {
          thickness: glyphs.symbolHeightInPitches(elem.value[i].den.charAt(0))
        }));
        x += maxWidth;
      } else {
        var thisWidth = 0;

        for (var i3 = 0; i3 < elem.value[i].num.length; i3++) {
          thisWidth += glyphs.getSymbolWidth(elem.value[i].num.charAt(i3));
        }

        abselem.addRight(new RelativeElement(elem.value[i].num, x, thisWidth, 6, {
          thickness: glyphs.symbolHeightInPitches(elem.value[i].num.charAt(0))
        }));
        x += thisWidth;
      }
    }
  } else if (elem.type === "common_time") {
    abselem.addRight(new RelativeElement("timesig.common", 0, glyphs.getSymbolWidth("timesig.common"), 6, {
      thickness: glyphs.symbolHeightInPitches("timesig.common")
    }));
  } else if (elem.type === "cut_time") {
    abselem.addRight(new RelativeElement("timesig.cut", 0, glyphs.getSymbolWidth("timesig.cut"), 6, {
      thickness: glyphs.symbolHeightInPitches("timesig.cut")
    }));
  } else if (elem.type === "tempus_imperfectum") {
    abselem.addRight(new RelativeElement("timesig.imperfectum", 0, glyphs.getSymbolWidth("timesig.imperfectum"), 6, {
      thickness: glyphs.symbolHeightInPitches("timesig.imperfectum")
    }));
  } else if (elem.type === "tempus_imperfectum_prolatio") {
    abselem.addRight(new RelativeElement("timesig.imperfectum2", 0, glyphs.getSymbolWidth("timesig.imperfectum2"), 6, {
      thickness: glyphs.symbolHeightInPitches("timesig.imperfectum2")
    }));
  } else if (elem.type === "tempus_perfectum") {
    abselem.addRight(new RelativeElement("timesig.perfectum", 0, glyphs.getSymbolWidth("timesig.perfectum"), 6, {
      thickness: glyphs.symbolHeightInPitches("timesig.perfectum")
    }));
  } else if (elem.type === "tempus_perfectum_prolatio") {
    abselem.addRight(new RelativeElement("timesig.perfectum2", 0, glyphs.getSymbolWidth("timesig.perfectum2"), 6, {
      thickness: glyphs.symbolHeightInPitches("timesig.perfectum2")
    }));
  } else {
    console.log("time signature:", elem);
  }

  return abselem;
};

module.exports = createTimeSignature;

/***/ }),

/***/ "./src/write/abc_crescendo_element.js":
/*!********************************************!*\
  !*** ./src/write/abc_crescendo_element.js ***!
  \********************************************/
/***/ (function(module) {

//    abc_crescendo_element.js: Definition of the CrescendoElem class.
var CrescendoElem = function CrescendoElem(anchor1, anchor2, dir, positioning) {
  this.type = "CrescendoElem";
  this.anchor1 = anchor1; // must have a .x and a .parent property or be null (means starts at the "beginning" of the line - after keysig)

  this.anchor2 = anchor2; // must have a .x property or be null (means ends at the end of the line)

  this.dir = dir; // either "<" or ">"

  if (positioning === 'above') this.dynamicHeightAbove = 6;else this.dynamicHeightBelow = 6;
  this.pitch = undefined; // This will be set later
};

module.exports = CrescendoElem;

/***/ }),

/***/ "./src/write/abc_decoration.js":
/*!*************************************!*\
  !*** ./src/write/abc_decoration.js ***!
  \*************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// abc_decoration.js: Creates a data structure suitable for printing a line of abc
var DynamicDecoration = __webpack_require__(/*! ./abc_dynamic_decoration */ "./src/write/abc_dynamic_decoration.js");

var CrescendoElem = __webpack_require__(/*! ./abc_crescendo_element */ "./src/write/abc_crescendo_element.js");

var glyphs = __webpack_require__(/*! ./abc_glyphs */ "./src/write/abc_glyphs.js");

var RelativeElement = __webpack_require__(/*! ./abc_relative_element */ "./src/write/abc_relative_element.js");

var TieElem = __webpack_require__(/*! ./abc_tie_element */ "./src/write/abc_tie_element.js");

var Decoration = function Decoration() {
  this.startDiminuendoX = undefined;
  this.startCrescendoX = undefined;
  this.minTop = 12; // TODO-PER: this is assuming a 5-line staff. Pass that info in.

  this.minBottom = 0;
};

var closeDecoration = function closeDecoration(voice, decoration, pitch, width, abselem, roomtaken, dir, minPitch) {
  var yPos;

  for (var i = 0; i < decoration.length; i++) {
    if (decoration[i] === "staccato" || decoration[i] === "tenuto" || decoration[i] === "accent") {
      var symbol = "scripts." + decoration[i];
      if (decoration[i] === "accent") symbol = "scripts.sforzato";
      if (yPos === undefined) yPos = dir === "down" ? pitch + 2 : minPitch - 2;else yPos = dir === "down" ? yPos + 2 : yPos - 2;

      if (decoration[i] === "accent") {
        // Always place the accent three pitches away, no matter whether that is a line or space.
        if (dir === "up") yPos--;else yPos++;
      } else {
        // don't place on a stave line. The stave lines are 2,4,6,8,10
        switch (yPos) {
          case 2:
          case 4:
          case 6:
          case 8:
          case 10:
            if (dir === "up") yPos--;else yPos++;
            break;
        }
      }

      if (pitch > 9) yPos++; // take up some room of those that are above

      var deltaX = width / 2;

      if (glyphs.getSymbolAlign(symbol) !== "center") {
        deltaX -= glyphs.getSymbolWidth(symbol) / 2;
      }

      abselem.addFixedX(new RelativeElement(symbol, deltaX, glyphs.getSymbolWidth(symbol), yPos));
    }

    if (decoration[i] === "slide" && abselem.heads[0]) {
      var yPos2 = abselem.heads[0].pitch;
      yPos2 -= 2; // TODO-PER: not sure what this fudge factor is.

      var blank1 = new RelativeElement("", -roomtaken - 15, 0, yPos2 - 1);
      var blank2 = new RelativeElement("", -roomtaken - 5, 0, yPos2 + 1);
      abselem.addFixedX(blank1);
      abselem.addFixedX(blank2);
      voice.addOther(new TieElem({
        anchor1: blank1,
        anchor2: blank2,
        fixedY: true
      }));
    }
  }

  if (yPos === undefined) yPos = pitch;
  return {
    above: yPos,
    below: abselem.bottom
  };
};

var volumeDecoration = function volumeDecoration(voice, decoration, abselem, positioning) {
  for (var i = 0; i < decoration.length; i++) {
    switch (decoration[i]) {
      case "p":
      case "mp":
      case "pp":
      case "ppp":
      case "pppp":
      case "f":
      case "ff":
      case "fff":
      case "ffff":
      case "sfz":
      case "mf":
        var elem = new DynamicDecoration(abselem, decoration[i], positioning);
        voice.addOther(elem);
    }
  }
};

var compoundDecoration = function compoundDecoration(decoration, pitch, width, abselem, dir) {
  function highestPitch() {
    if (abselem.heads.length === 0) return 10; // TODO-PER: I don't know if this can happen, but we'll return the top of the staff if so.

    var pitch = abselem.heads[0].pitch;

    for (var i = 1; i < abselem.heads.length; i++) {
      pitch = Math.max(pitch, abselem.heads[i].pitch);
    }

    return pitch;
  }

  function lowestPitch() {
    if (abselem.heads.length === 0) return 2; // TODO-PER: I don't know if this can happen, but we'll return the bottom of the staff if so.

    var pitch = abselem.heads[0].pitch;

    for (var i = 1; i < abselem.heads.length; i++) {
      pitch = Math.min(pitch, abselem.heads[i].pitch);
    }

    return pitch;
  }

  function compoundDecoration(symbol, count) {
    var placement = dir === 'down' ? lowestPitch() + 0.5 : highestPitch() + 9;
    if (dir !== 'down' && count === 1) placement--;
    var deltaX = width / 2;
    deltaX += dir === 'down' ? -5 : 3;
    placement += (count - 1) * 0.5;

    for (var i = 0; i < count; i++) {
      placement -= 1;
      abselem.addFixedX(new RelativeElement(symbol, deltaX, glyphs.getSymbolWidth(symbol), placement));
    }
  }

  for (var i = 0; i < decoration.length; i++) {
    switch (decoration[i]) {
      case "/":
        compoundDecoration("flags.ugrace", 1);
        break;

      case "//":
        compoundDecoration("flags.ugrace", 2);
        break;

      case "///":
        compoundDecoration("flags.ugrace", 3);
        break;

      case "////":
        compoundDecoration("flags.ugrace", 4);
        break;
    }
  }
};

var stackedDecoration = function stackedDecoration(decoration, width, abselem, yPos, positioning, minTop, minBottom) {
  function incrementPlacement(placement, height) {
    if (placement === 'above') yPos.above += height;else yPos.below -= height;
  }

  function getPlacement(placement) {
    var y;

    if (placement === 'above') {
      y = yPos.above;
      if (y < minTop) y = minTop;
    } else {
      y = yPos.below;
      if (y > minBottom) y = minBottom;
    }

    return y;
  }

  function textDecoration(text, placement) {
    var y = getPlacement(placement);
    var textFudge = 2;
    var textHeight = 5; // TODO-PER: Get the height of the current font and use that for the thickness.

    abselem.addFixedX(new RelativeElement(text, width / 2, 0, y + textFudge, {
      type: "decoration",
      klass: 'ornament',
      thickness: 3
    }));
    incrementPlacement(placement, textHeight);
  }

  function symbolDecoration(symbol, placement) {
    var deltaX = width / 2;

    if (glyphs.getSymbolAlign(symbol) !== "center") {
      deltaX -= glyphs.getSymbolWidth(symbol) / 2;
    }

    var height = glyphs.symbolHeightInPitches(symbol) + 1; // adding a little padding so nothing touches.

    var y = getPlacement(placement);
    y = placement === 'above' ? y + height / 2 : y - height / 2; // Center the element vertically.

    abselem.addFixedX(new RelativeElement(symbol, deltaX, glyphs.getSymbolWidth(symbol), y, {
      klass: 'ornament',
      thickness: glyphs.symbolHeightInPitches(symbol)
    }));
    incrementPlacement(placement, height);
  }

  var symbolList = {
    "+": "scripts.stopped",
    "open": "scripts.open",
    "snap": "scripts.snap",
    "wedge": "scripts.wedge",
    "thumb": "scripts.thumb",
    "shortphrase": "scripts.shortphrase",
    "mediumphrase": "scripts.mediumphrase",
    "longphrase": "scripts.longphrase",
    "trill": "scripts.trill",
    "roll": "scripts.roll",
    "irishroll": "scripts.roll",
    "marcato": "scripts.umarcato",
    "dmarcato": "scripts.dmarcato",
    "umarcato": "scripts.umarcato",
    "turn": "scripts.turn",
    "uppermordent": "scripts.prall",
    "pralltriller": "scripts.prall",
    "mordent": "scripts.mordent",
    "lowermordent": "scripts.mordent",
    "downbow": "scripts.downbow",
    "upbow": "scripts.upbow",
    "fermata": "scripts.ufermata",
    "invertedfermata": "scripts.dfermata",
    "breath": ",",
    "coda": "scripts.coda",
    "segno": "scripts.segno"
  };
  var hasOne = false;

  for (var i = 0; i < decoration.length; i++) {
    switch (decoration[i]) {
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "D.C.":
      case "D.S.":
        textDecoration(decoration[i], positioning);
        hasOne = true;
        break;

      case "fine":
        textDecoration("FINE", positioning);
        hasOne = true;
        break;

      case "+":
      case "open":
      case "snap":
      case "wedge":
      case "thumb":
      case "shortphrase":
      case "mediumphrase":
      case "longphrase":
      case "trill":
      case "roll":
      case "irishroll":
      case "marcato":
      case "dmarcato":
      case "turn":
      case "uppermordent":
      case "pralltriller":
      case "mordent":
      case "lowermordent":
      case "downbow":
      case "upbow":
      case "fermata":
      case "breath":
      case "umarcato":
      case "coda":
      case "segno":
        symbolDecoration(symbolList[decoration[i]], positioning);
        hasOne = true;
        break;

      case "invertedfermata":
        symbolDecoration(symbolList[decoration[i]], 'below');
        hasOne = true;
        break;

      case "mark":
        abselem.klass = "mark";
        break;
    }
  }

  return hasOne;
};

function leftDecoration(decoration, abselem, roomtaken) {
  for (var i = 0; i < decoration.length; i++) {
    switch (decoration[i]) {
      case "arpeggio":
        // The arpeggio symbol is the height of a note (that is, two Y units). This stacks as many as we need to go from the
        // top note to the bottom note. The arpeggio should also be a little taller than the stacked notes, so there is an extra
        // one drawn and it is offset by half of a note height (that is, one Y unit).
        for (var j = abselem.abcelem.minpitch - 1; j <= abselem.abcelem.maxpitch; j += 2) {
          abselem.addExtra(new RelativeElement("scripts.arpeggio", -glyphs.getSymbolWidth("scripts.arpeggio") * 2 - roomtaken, 0, j + 2, {
            klass: 'ornament',
            thickness: glyphs.symbolHeightInPitches("scripts.arpeggio")
          }));
        }

        break;
    }
  }
}

Decoration.prototype.dynamicDecoration = function (voice, decoration, abselem, positioning) {
  var diminuendo;
  var crescendo;

  for (var i = 0; i < decoration.length; i++) {
    switch (decoration[i]) {
      case "diminuendo(":
        this.startDiminuendoX = abselem;
        diminuendo = undefined;
        break;

      case "diminuendo)":
        diminuendo = {
          start: this.startDiminuendoX,
          stop: abselem
        };
        this.startDiminuendoX = undefined;
        break;

      case "crescendo(":
        this.startCrescendoX = abselem;
        crescendo = undefined;
        break;

      case "crescendo)":
        crescendo = {
          start: this.startCrescendoX,
          stop: abselem
        };
        this.startCrescendoX = undefined;
        break;
    }
  }

  if (diminuendo) {
    voice.addOther(new CrescendoElem(diminuendo.start, diminuendo.stop, ">", positioning));
  }

  if (crescendo) {
    voice.addOther(new CrescendoElem(crescendo.start, crescendo.stop, "<", positioning));
  }
};

Decoration.prototype.createDecoration = function (voice, decoration, pitch, width, abselem, roomtaken, dir, minPitch, positioning, hasVocals) {
  if (!positioning) positioning = {
    ornamentPosition: 'above',
    volumePosition: hasVocals ? 'above' : 'below',
    dynamicPosition: hasVocals ? 'above' : 'below'
  }; // These decorations don't affect the placement of other decorations

  volumeDecoration(voice, decoration, abselem, positioning.volumePosition);
  this.dynamicDecoration(voice, decoration, abselem, positioning.dynamicPosition);
  compoundDecoration(decoration, pitch, width, abselem, dir); // treat staccato, accent, and tenuto first (may need to shift other markers)

  var yPos = closeDecoration(voice, decoration, pitch, width, abselem, roomtaken, dir, minPitch); // yPos is an object containing 'above' and 'below'. That is the placement of the next symbol on either side.

  yPos.above = Math.max(yPos.above, this.minTop);
  var hasOne = stackedDecoration(decoration, width, abselem, yPos, positioning.ornamentPosition, this.minTop, this.minBottom);

  if (hasOne) {//			abselem.top = Math.max(yPos.above + 3, abselem.top); // TODO-PER: Not sure why we need this fudge factor.
  }

  leftDecoration(decoration, abselem, roomtaken);
};

module.exports = Decoration;

/***/ }),

/***/ "./src/write/abc_dynamic_decoration.js":
/*!*********************************************!*\
  !*** ./src/write/abc_dynamic_decoration.js ***!
  \*********************************************/
/***/ (function(module) {

//    abc_dynamic_decoration.js: Definition of the DynamicDecoration class.
var DynamicDecoration = function DynamicDecoration(anchor, dec, position) {
  this.type = "DynamicDecoration";
  this.anchor = anchor;
  this.dec = dec;
  if (position === 'below') this.volumeHeightBelow = 6;else this.volumeHeightAbove = 6;
  this.pitch = undefined; // This will be set later
};

module.exports = DynamicDecoration;

/***/ }),

/***/ "./src/write/abc_ending_element.js":
/*!*****************************************!*\
  !*** ./src/write/abc_ending_element.js ***!
  \*****************************************/
/***/ (function(module) {

//    abc_ending_element.js: Definition of the EndingElement class.
var EndingElem = function EndingElem(text, anchor1, anchor2) {
  this.type = "EndingElem";
  this.text = text; // text to be displayed top left

  this.anchor1 = anchor1; // must have a .x property or be null (means starts at the "beginning" of the line - after keysig)

  this.anchor2 = anchor2; // must have a .x property or be null (means ends at the end of the line)

  this.endingHeightAbove = 5;
  this.pitch = undefined; // This will be set later
};

module.exports = EndingElem;

/***/ }),

/***/ "./src/write/abc_engraver_controller.js":
/*!**********************************************!*\
  !*** ./src/write/abc_engraver_controller.js ***!
  \**********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

//    abc_engraver_controller.js: Controls the engraving process of an ABCJS abstract syntax tree as produced by ABCJS/parse

/*global Math */
var spacing = __webpack_require__(/*! ./abc_spacing */ "./src/write/abc_spacing.js");

var AbstractEngraver = __webpack_require__(/*! ./abc_abstract_engraver */ "./src/write/abc_abstract_engraver.js");

var Renderer = __webpack_require__(/*! ./abc_renderer */ "./src/write/abc_renderer.js");

var FreeText = __webpack_require__(/*! ./free-text */ "./src/write/free-text.js");

var Separator = __webpack_require__(/*! ./separator */ "./src/write/separator.js");

var Subtitle = __webpack_require__(/*! ./subtitle */ "./src/write/subtitle.js");

var TopText = __webpack_require__(/*! ./top-text */ "./src/write/top-text.js");

var BottomText = __webpack_require__(/*! ./bottom-text */ "./src/write/bottom-text.js");

var setupSelection = __webpack_require__(/*! ./selection */ "./src/write/selection.js");

var layout = __webpack_require__(/*! ./layout/layout */ "./src/write/layout/layout.js");

var Classes = __webpack_require__(/*! ./classes */ "./src/write/classes.js");

var GetFontAndAttr = __webpack_require__(/*! ./get-font-and-attr */ "./src/write/get-font-and-attr.js");

var GetTextSize = __webpack_require__(/*! ./get-text-size */ "./src/write/get-text-size.js");

var draw = __webpack_require__(/*! ./draw/draw */ "./src/write/draw/draw.js");

var calcHeight = __webpack_require__(/*! ./calcHeight */ "./src/write/calcHeight.js");
/**
 * @class
 * Controls the engraving process, from ABCJS Abstract Syntax Tree (ABCJS AST) to rendered score sheet
 *
 * Call engraveABC to run the process. This creates a graphelems ABCJS Abstract Engraving Structure (ABCJS AES) that can be accessed through this.staffgroups
 * this data structure is first laid out (giving the graphelems x and y coordinates) and then drawn onto the renderer
 * each ABCJS AES represents a single staffgroup - all elements that are not in a staffgroup are rendered directly by the controller
 *
 * elements in ABCJS AES know their "source data" in the ABCJS AST, and their "target shape"
 * in the renderer for highlighting purposes
 *
 */


var EngraverController = function EngraverController(paper, params) {
  params = params || {};
  this.selectionColor = params.selectionColor;
  this.dragColor = params.dragColor ? params.dragColor : params.selectionColor;
  this.dragging = !!params.dragging;
  this.selectTypes = params.selectTypes;
  this.responsive = params.responsive;
  this.space = 3 * spacing.SPACE;
  this.scale = params.scale ? parseFloat(params.scale) : 0;
  this.classes = new Classes({
    shouldAddClasses: params.add_classes
  });
  if (!(this.scale > 0.1)) this.scale = undefined;

  if (params.staffwidth) {
    // Note: Normally all measurements to the engraver are in POINTS. However, if a person is formatting for the
    // screen and directly inputting the width, then it is more logical to have the measurement in pixels.
    this.staffwidthScreen = params.staffwidth;
    this.staffwidthPrint = params.staffwidth;
  } else {
    this.staffwidthScreen = 740; // TODO-PER: Not sure where this number comes from, but this is how it's always been.

    this.staffwidthPrint = 680; // The number of pixels in 8.5", after 1cm of margin has been removed.
  }

  this.listeners = [];
  if (params.clickListener) this.addSelectListener(params.clickListener);
  this.renderer = new Renderer(paper);
  this.renderer.setPaddingOverride(params);
  if (params.showDebug) this.renderer.showDebug = params.showDebug;
  this.renderer.controller = this; // TODO-GD needed for highlighting

  this.renderer.foregroundColor = params.foregroundColor ? params.foregroundColor : "currentColor";
  if (params.ariaLabel) this.renderer.ariaLabel = params.ariaLabel;
  this.renderer.minPadding = params.minPadding ? params.minPadding : 0;
  this.reset();
};

EngraverController.prototype.reset = function () {
  this.selected = [];
  this.staffgroups = [];
  if (this.engraver) this.engraver.reset();
  this.engraver = null;
  this.renderer.reset();
  this.dragTarget = null;
  this.dragIndex = -1;
  this.dragMouseStart = {
    x: -1,
    y: -1
  };
  this.dragYStep = 0;
};
/**
 * run the engraving process
 */


EngraverController.prototype.engraveABC = function (abctunes, tuneNumber) {
  if (abctunes[0] === undefined) {
    abctunes = [abctunes];
  }

  this.reset();

  for (var i = 0; i < abctunes.length; i++) {
    if (tuneNumber === undefined) tuneNumber = i;
    this.getFontAndAttr = new GetFontAndAttr(abctunes[i].formatting, this.classes);
    this.getTextSize = new GetTextSize(this.getFontAndAttr, this.renderer.paper);
    this.engraveTune(abctunes[i], tuneNumber);
  }
};
/**
 * Some of the items on the page are not scaled, so adjust them in the opposite direction of scaling to cancel out the scaling.
 */


EngraverController.prototype.adjustNonScaledItems = function (scale) {
  this.width /= scale;
  this.renderer.adjustNonScaledItems(scale);
};

EngraverController.prototype.getMeasureWidths = function (abcTune) {
  this.reset();
  this.getFontAndAttr = new GetFontAndAttr(abcTune.formatting, this.classes);
  this.getTextSize = new GetTextSize(this.getFontAndAttr, this.renderer.paper);
  this.setupTune(abcTune, 0);
  this.constructTuneElements(abcTune); // layout() sets the x-coordinate of the abcTune element here:
  // abcTune.lines[0].staffGroup.voices[0].children[0].x

  layout(this.renderer, abcTune, 0, this.space);
  var ret = [];
  var section;
  var needNewSection = true;

  for (var i = 0; i < abcTune.lines.length; i++) {
    var abcLine = abcTune.lines[i];

    if (abcLine.staff) {
      if (needNewSection) {
        section = {
          left: 0,
          measureWidths: [],
          //height: this.renderer.padding.top + this.renderer.spacing.music + this.renderer.padding.bottom + 24, // the 24 is the empirical value added to the bottom of all tunes.
          total: 0
        };
        ret.push(section);
        needNewSection = false;
      } // At this point, the voices are laid out so that the bar lines are even with each other. So we just need to get the placement of the first voice.


      if (abcLine.staffGroup.voices.length > 0) {
        var voice = abcLine.staffGroup.voices[0];
        var foundNotStaffExtra = false;
        var lastXPosition = 0;

        for (var k = 0; k < voice.children.length; k++) {
          var child = voice.children[k];

          if (!foundNotStaffExtra && !child.isClef && !child.isKeySig) {
            foundNotStaffExtra = true;
            section.left = child.x;
            lastXPosition = child.x;
          }

          if (child.type === 'bar') {
            section.measureWidths.push(child.x - lastXPosition);
            section.total += child.x - lastXPosition;
            lastXPosition = child.x;
          }
        }
      } //section.height += calcHeight(abcLine.staffGroup) * spacing.STEP;

    } else needNewSection = true;
  }

  return ret;
};

EngraverController.prototype.setupTune = function (abcTune, tuneNumber) {
  this.classes.reset();
  this.renderer.newTune(abcTune);
  this.engraver = new AbstractEngraver(this.getTextSize, tuneNumber, {
    bagpipes: abcTune.formatting.bagpipes,
    flatbeams: abcTune.formatting.flatbeams,
    graceSlurs: abcTune.formatting.graceSlurs !== false,
    // undefined is the default, which is true
    percmap: abcTune.formatting.percmap
  });
  this.engraver.setStemHeight(this.renderer.spacing.stemHeight);
  this.engraver.measureLength = abcTune.getMeterFraction().num / abcTune.getMeterFraction().den;

  if (abcTune.formatting.staffwidth) {
    this.width = abcTune.formatting.staffwidth * 1.33; // The width is expressed in pt; convert to px.
  } else {
    this.width = this.renderer.isPrint ? this.staffwidthPrint : this.staffwidthScreen;
  }

  var scale = abcTune.formatting.scale ? abcTune.formatting.scale : this.scale;
  if (this.responsive === "resize") // The resizing will mess with the scaling, so just don't do it explicitly.
    scale = undefined;
  if (scale === undefined) scale = this.renderer.isPrint ? 0.75 : 1;
  this.adjustNonScaledItems(scale);
  return scale;
};

EngraverController.prototype.constructTuneElements = function (abcTune) {
  abcTune.topText = new TopText(abcTune.metaText, abcTune.formatting, abcTune.lines, this.width, this.renderer.isPrint, this.renderer.padding.left, this.renderer.spacing, this.getTextSize); // Generate the raw staff line data

  var i;
  var abcLine;
  var hasPrintedTempo = false;
  var hasSeenNonSubtitle = false;

  for (i = 0; i < abcTune.lines.length; i++) {
    abcLine = abcTune.lines[i];

    if (abcLine.staff) {
      hasSeenNonSubtitle = true;
      abcLine.staffGroup = this.engraver.createABCLine(abcLine.staff, !hasPrintedTempo ? abcTune.metaText.tempo : null);
      hasPrintedTempo = true;
    } else if (abcLine.subtitle) {
      // If the subtitle is at the top, then it was already accounted for. So skip all subtitles until the first non-subtitle line.
      if (hasSeenNonSubtitle) {
        var center = this.width / 2 + this.renderer.padding.left;
        abcLine.nonMusic = new Subtitle(this.renderer.spacing.subtitle, abcTune.formatting, abcLine.subtitle, center, this.renderer.padding.left, this.getTextSize);
      }
    } else if (abcLine.text !== undefined) {
      hasSeenNonSubtitle = true;
      abcLine.nonMusic = new FreeText(abcLine.text, abcLine.vskip, this.getFontAndAttr, this.renderer.padding.left, this.width, this.getTextSize);
    } else if (abcLine.separator !== undefined && abcLine.separator.lineLength) {
      hasSeenNonSubtitle = true;
      abcLine.nonMusic = new Separator(abcLine.separator.spaceAbove, abcLine.separator.lineLength, abcLine.separator.spaceBelow);
    }
  }

  abcTune.bottomText = new BottomText(abcTune.metaText, this.width, this.renderer.isPrint, this.renderer.padding.left, this.renderer.spacing, this.getTextSize);
};

EngraverController.prototype.engraveTune = function (abcTune, tuneNumber) {
  var scale = this.setupTune(abcTune, tuneNumber); // Create all of the element objects that will appear on the page.

  this.constructTuneElements(abcTune); // Do all the positioning, both horizontally and vertically

  var maxWidth = layout(this.renderer, abcTune, this.width, this.space); // Do all the writing to the SVG

  var ret = draw(this.renderer, this.classes, abcTune, this.width, maxWidth, this.responsive, scale, this.selectTypes, tuneNumber);
  this.staffgroups = ret.staffgroups;
  this.selectables = ret.selectables;
  setupSelection(this);
};

EngraverController.prototype.getDim = function (historyEl) {
  // Get the dimensions on demand because the getBBox call is expensive.
  if (!historyEl.dim) {
    var box = historyEl.svgEl.getBBox();
    historyEl.dim = {
      left: Math.round(box.x),
      top: Math.round(box.y),
      right: Math.round(box.x + box.width),
      bottom: Math.round(box.y + box.height)
    };
  }

  return historyEl.dim;
};

EngraverController.prototype.addSelectListener = function (clickListener) {
  this.listeners[this.listeners.length] = clickListener;
};

module.exports = EngraverController;

/***/ }),

/***/ "./src/write/abc_glyphs.js":
/*!*********************************!*\
  !*** ./src/write/abc_glyphs.js ***!
  \*********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var spacing = __webpack_require__(/*! ./abc_spacing */ "./src/write/abc_spacing.js");
/**
 * Glyphs and some methods to adjust for their x and y baseline
 */


var glyphs = {
  '0': {
    d: [['M', 4.83, -14.97], ['c', 0.33, -0.03, 1.11, 0.00, 1.47, 0.06], ['c', 1.68, 0.36, 2.97, 1.59, 3.78, 3.60], ['c', 1.20, 2.97, 0.81, 6.96, -0.90, 9.27], ['c', -0.78, 1.08, -1.71, 1.71, -2.91, 1.95], ['c', -0.45, 0.09, -1.32, 0.09, -1.77, 0.00], ['c', -0.81, -0.18, -1.47, -0.51, -2.07, -1.02], ['c', -2.34, -2.07, -3.15, -6.72, -1.74, -10.20], ['c', 0.87, -2.16, 2.28, -3.42, 4.14, -3.66], ['z'], ['m', 1.11, 0.87], ['c', -0.21, -0.06, -0.69, -0.09, -0.87, -0.06], ['c', -0.54, 0.12, -0.87, 0.42, -1.17, 0.99], ['c', -0.36, 0.66, -0.51, 1.56, -0.60, 3.00], ['c', -0.03, 0.75, -0.03, 4.59, 0.00, 5.31], ['c', 0.09, 1.50, 0.27, 2.40, 0.60, 3.06], ['c', 0.24, 0.48, 0.57, 0.78, 0.96, 0.90], ['c', 0.27, 0.09, 0.78, 0.09, 1.05, 0.00], ['c', 0.39, -0.12, 0.72, -0.42, 0.96, -0.90], ['c', 0.33, -0.66, 0.51, -1.56, 0.60, -3.06], ['c', 0.03, -0.72, 0.03, -4.56, 0.00, -5.31], ['c', -0.09, -1.47, -0.27, -2.37, -0.60, -3.03], ['c', -0.24, -0.48, -0.54, -0.78, -0.93, -0.90], ['z']],
    w: 10.78,
    h: 14.959
  },
  '1': {
    d: [['M', 3.30, -15.06], ['c', 0.06, -0.06, 0.21, -0.03, 0.66, 0.15], ['c', 0.81, 0.39, 1.08, 0.39, 1.83, 0.03], ['c', 0.21, -0.09, 0.39, -0.15, 0.42, -0.15], ['c', 0.12, 0.00, 0.21, 0.09, 0.27, 0.21], ['c', 0.06, 0.12, 0.06, 0.33, 0.06, 5.94], ['c', 0.00, 3.93, 0.00, 5.85, 0.03, 6.03], ['c', 0.06, 0.36, 0.15, 0.69, 0.27, 0.96], ['c', 0.36, 0.75, 0.93, 1.17, 1.68, 1.26], ['c', 0.30, 0.03, 0.39, 0.09, 0.39, 0.30], ['c', 0.00, 0.15, -0.03, 0.18, -0.09, 0.24], ['c', -0.06, 0.06, -0.09, 0.06, -0.48, 0.06], ['c', -0.42, 0.00, -0.69, -0.03, -2.10, -0.24], ['c', -0.90, -0.15, -1.77, -0.15, -2.67, 0.00], ['c', -1.41, 0.21, -1.68, 0.24, -2.10, 0.24], ['c', -0.39, 0.00, -0.42, 0.00, -0.48, -0.06], ['c', -0.06, -0.06, -0.06, -0.09, -0.06, -0.24], ['c', 0.00, -0.21, 0.06, -0.27, 0.36, -0.30], ['c', 0.75, -0.09, 1.32, -0.51, 1.68, -1.26], ['c', 0.12, -0.27, 0.21, -0.60, 0.27, -0.96], ['c', 0.03, -0.18, 0.03, -1.59, 0.03, -4.29], ['c', 0.00, -3.87, 0.00, -4.05, -0.06, -4.14], ['c', -0.09, -0.15, -0.18, -0.24, -0.39, -0.24], ['c', -0.12, 0.00, -0.15, 0.03, -0.21, 0.06], ['c', -0.03, 0.06, -0.45, 0.99, -0.96, 2.13], ['c', -0.48, 1.14, -0.90, 2.10, -0.93, 2.16], ['c', -0.06, 0.15, -0.21, 0.24, -0.33, 0.24], ['c', -0.24, 0.00, -0.42, -0.18, -0.42, -0.39], ['c', 0.00, -0.06, 3.27, -7.62, 3.33, -7.74], ['z']],
    w: 8.94,
    h: 15.058
  },
  '2': {
    d: [['M', 4.23, -14.97], ['c', 0.57, -0.06, 1.68, 0.00, 2.34, 0.18], ['c', 0.69, 0.18, 1.50, 0.54, 2.01, 0.90], ['c', 1.35, 0.96, 1.95, 2.25, 1.77, 3.81], ['c', -0.15, 1.35, -0.66, 2.34, -1.68, 3.15], ['c', -0.60, 0.48, -1.44, 0.93, -3.12, 1.65], ['c', -1.32, 0.57, -1.80, 0.81, -2.37, 1.14], ['c', -0.57, 0.33, -0.57, 0.33, -0.24, 0.27], ['c', 0.39, -0.09, 1.26, -0.09, 1.68, 0.00], ['c', 0.72, 0.15, 1.41, 0.45, 2.10, 0.90], ['c', 0.99, 0.63, 1.86, 0.87, 2.55, 0.75], ['c', 0.24, -0.06, 0.42, -0.15, 0.57, -0.30], ['c', 0.12, -0.09, 0.30, -0.42, 0.30, -0.51], ['c', 0.00, -0.09, 0.12, -0.21, 0.24, -0.24], ['c', 0.18, -0.03, 0.39, 0.12, 0.39, 0.30], ['c', 0.00, 0.12, -0.15, 0.57, -0.30, 0.87], ['c', -0.54, 1.02, -1.56, 1.74, -2.79, 2.01], ['c', -0.42, 0.09, -1.23, 0.09, -1.62, 0.03], ['c', -0.81, -0.18, -1.32, -0.45, -2.01, -1.11], ['c', -0.45, -0.45, -0.63, -0.57, -0.96, -0.69], ['c', -0.84, -0.27, -1.89, 0.12, -2.25, 0.90], ['c', -0.12, 0.21, -0.21, 0.54, -0.21, 0.72], ['c', 0.00, 0.12, -0.12, 0.21, -0.27, 0.24], ['c', -0.15, 0.00, -0.27, -0.03, -0.33, -0.15], ['c', -0.09, -0.21, 0.09, -1.08, 0.33, -1.71], ['c', 0.24, -0.66, 0.66, -1.26, 1.29, -1.89], ['c', 0.45, -0.45, 0.90, -0.81, 1.92, -1.56], ['c', 1.29, -0.93, 1.89, -1.44, 2.34, -1.98], ['c', 0.87, -1.05, 1.26, -2.19, 1.20, -3.63], ['c', -0.06, -1.29, -0.39, -2.31, -0.96, -2.91], ['c', -0.36, -0.33, -0.72, -0.51, -1.17, -0.54], ['c', -0.84, -0.03, -1.53, 0.42, -1.59, 1.05], ['c', -0.03, 0.33, 0.12, 0.60, 0.57, 1.14], ['c', 0.45, 0.54, 0.54, 0.87, 0.42, 1.41], ['c', -0.15, 0.63, -0.54, 1.11, -1.08, 1.38], ['c', -0.63, 0.33, -1.20, 0.33, -1.83, 0.00], ['c', -0.24, -0.12, -0.33, -0.18, -0.54, -0.39], ['c', -0.18, -0.18, -0.27, -0.30, -0.36, -0.51], ['c', -0.24, -0.45, -0.27, -0.84, -0.21, -1.38], ['c', 0.12, -0.75, 0.45, -1.41, 1.02, -1.98], ['c', 0.72, -0.72, 1.74, -1.17, 2.85, -1.32], ['z']],
    w: 10.764,
    h: 14.97
  },
  '3': {
    d: [['M', 3.78, -14.97], ['c', 0.30, -0.03, 1.41, 0.00, 1.83, 0.06], ['c', 2.22, 0.30, 3.51, 1.32, 3.72, 2.91], ['c', 0.03, 0.33, 0.03, 1.26, -0.03, 1.65], ['c', -0.12, 0.84, -0.48, 1.47, -1.05, 1.77], ['c', -0.27, 0.15, -0.36, 0.24, -0.45, 0.39], ['c', -0.09, 0.21, -0.09, 0.36, 0.00, 0.57], ['c', 0.09, 0.15, 0.18, 0.24, 0.51, 0.39], ['c', 0.75, 0.42, 1.23, 1.14, 1.41, 2.13], ['c', 0.06, 0.42, 0.06, 1.35, 0.00, 1.71], ['c', -0.18, 0.81, -0.48, 1.38, -1.02, 1.95], ['c', -0.75, 0.72, -1.80, 1.20, -3.18, 1.38], ['c', -0.42, 0.06, -1.56, 0.06, -1.95, 0.00], ['c', -1.89, -0.33, -3.18, -1.29, -3.51, -2.64], ['c', -0.03, -0.12, -0.03, -0.33, -0.03, -0.60], ['c', 0.00, -0.36, 0.00, -0.42, 0.06, -0.63], ['c', 0.12, -0.30, 0.27, -0.51, 0.51, -0.75], ['c', 0.24, -0.24, 0.45, -0.39, 0.75, -0.51], ['c', 0.21, -0.06, 0.27, -0.06, 0.60, -0.06], ['c', 0.33, 0.00, 0.39, 0.00, 0.60, 0.06], ['c', 0.30, 0.12, 0.51, 0.27, 0.75, 0.51], ['c', 0.36, 0.33, 0.57, 0.75, 0.60, 1.20], ['c', 0.00, 0.21, 0.00, 0.27, -0.06, 0.42], ['c', -0.09, 0.18, -0.12, 0.24, -0.54, 0.54], ['c', -0.51, 0.36, -0.63, 0.54, -0.60, 0.87], ['c', 0.06, 0.54, 0.54, 0.90, 1.38, 0.99], ['c', 0.36, 0.06, 0.72, 0.03, 0.96, -0.06], ['c', 0.81, -0.27, 1.29, -1.23, 1.44, -2.79], ['c', 0.03, -0.45, 0.03, -1.95, -0.03, -2.37], ['c', -0.09, -0.75, -0.33, -1.23, -0.75, -1.44], ['c', -0.33, -0.18, -0.45, -0.18, -1.98, -0.18], ['c', -1.35, 0.00, -1.41, 0.00, -1.50, -0.06], ['c', -0.18, -0.12, -0.24, -0.39, -0.12, -0.60], ['c', 0.12, -0.15, 0.15, -0.15, 1.68, -0.15], ['c', 1.50, 0.00, 1.62, 0.00, 1.89, -0.15], ['c', 0.18, -0.09, 0.42, -0.36, 0.54, -0.57], ['c', 0.18, -0.42, 0.27, -0.90, 0.30, -1.95], ['c', 0.03, -1.20, -0.06, -1.80, -0.36, -2.37], ['c', -0.24, -0.48, -0.63, -0.81, -1.14, -0.96], ['c', -0.30, -0.06, -1.08, -0.06, -1.38, 0.03], ['c', -0.60, 0.15, -0.90, 0.42, -0.96, 0.84], ['c', -0.03, 0.30, 0.06, 0.45, 0.63, 0.84], ['c', 0.33, 0.24, 0.42, 0.39, 0.45, 0.63], ['c', 0.03, 0.72, -0.57, 1.50, -1.32, 1.65], ['c', -1.05, 0.27, -2.10, -0.57, -2.10, -1.65], ['c', 0.00, -0.45, 0.15, -0.96, 0.39, -1.38], ['c', 0.12, -0.21, 0.54, -0.63, 0.81, -0.81], ['c', 0.57, -0.42, 1.38, -0.69, 2.25, -0.81], ['z']],
    w: 9.735,
    h: 14.967
  },
  '4': {
    d: [['M', 8.64, -14.94], ['c', 0.27, -0.09, 0.42, -0.12, 0.54, -0.03], ['c', 0.09, 0.06, 0.15, 0.21, 0.15, 0.30], ['c', -0.03, 0.06, -1.92, 2.31, -4.23, 5.04], ['c', -2.31, 2.73, -4.23, 4.98, -4.26, 5.01], ['c', -0.03, 0.06, 0.12, 0.06, 2.55, 0.06], ['l', 2.61, 0.00], ['l', 0.00, -2.37], ['c', 0.00, -2.19, 0.03, -2.37, 0.06, -2.46], ['c', 0.03, -0.06, 0.21, -0.18, 0.57, -0.42], ['c', 1.08, -0.72, 1.38, -1.08, 1.86, -2.16], ['c', 0.12, -0.30, 0.24, -0.54, 0.27, -0.57], ['c', 0.12, -0.12, 0.39, -0.06, 0.45, 0.12], ['c', 0.06, 0.09, 0.06, 0.57, 0.06, 3.96], ['l', 0.00, 3.90], ['l', 1.08, 0.00], ['c', 1.05, 0.00, 1.11, 0.00, 1.20, 0.06], ['c', 0.24, 0.15, 0.24, 0.54, 0.00, 0.69], ['c', -0.09, 0.06, -0.15, 0.06, -1.20, 0.06], ['l', -1.08, 0.00], ['l', 0.00, 0.33], ['c', 0.00, 0.57, 0.09, 1.11, 0.30, 1.53], ['c', 0.36, 0.75, 0.93, 1.17, 1.68, 1.26], ['c', 0.30, 0.03, 0.39, 0.09, 0.39, 0.30], ['c', 0.00, 0.15, -0.03, 0.18, -0.09, 0.24], ['c', -0.06, 0.06, -0.09, 0.06, -0.48, 0.06], ['c', -0.42, 0.00, -0.69, -0.03, -2.10, -0.24], ['c', -0.90, -0.15, -1.77, -0.15, -2.67, 0.00], ['c', -1.41, 0.21, -1.68, 0.24, -2.10, 0.24], ['c', -0.39, 0.00, -0.42, 0.00, -0.48, -0.06], ['c', -0.06, -0.06, -0.06, -0.09, -0.06, -0.24], ['c', 0.00, -0.21, 0.06, -0.27, 0.36, -0.30], ['c', 0.75, -0.09, 1.32, -0.51, 1.68, -1.26], ['c', 0.21, -0.42, 0.30, -0.96, 0.30, -1.53], ['l', 0.00, -0.33], ['l', -2.70, 0.00], ['c', -2.91, 0.00, -2.85, 0.00, -3.09, -0.15], ['c', -0.18, -0.12, -0.30, -0.39, -0.27, -0.54], ['c', 0.03, -0.06, 0.18, -0.24, 0.33, -0.45], ['c', 0.75, -0.90, 1.59, -2.07, 2.13, -3.03], ['c', 0.33, -0.54, 0.84, -1.62, 1.05, -2.16], ['c', 0.57, -1.41, 0.84, -2.64, 0.90, -4.05], ['c', 0.03, -0.63, 0.06, -0.72, 0.24, -0.81], ['l', 0.12, -0.06], ['l', 0.45, 0.12], ['c', 0.66, 0.18, 1.02, 0.24, 1.47, 0.27], ['c', 0.60, 0.03, 1.23, -0.09, 2.01, -0.33], ['z']],
    w: 11.795,
    h: 14.994
  },
  '5': {
    d: [['M', 1.02, -14.94], ['c', 0.12, -0.09, 0.03, -0.09, 1.08, 0.06], ['c', 2.49, 0.36, 4.35, 0.36, 6.96, -0.06], ['c', 0.57, -0.09, 0.66, -0.06, 0.81, 0.06], ['c', 0.15, 0.18, 0.12, 0.24, -0.15, 0.51], ['c', -1.29, 1.26, -3.24, 2.04, -5.58, 2.31], ['c', -0.60, 0.09, -1.20, 0.12, -1.71, 0.12], ['c', -0.39, 0.00, -0.45, 0.00, -0.57, 0.06], ['c', -0.09, 0.06, -0.15, 0.12, -0.21, 0.21], ['l', -0.06, 0.12], ['l', 0.00, 1.65], ['l', 0.00, 1.65], ['l', 0.21, -0.21], ['c', 0.66, -0.57, 1.41, -0.96, 2.19, -1.14], ['c', 0.33, -0.06, 1.41, -0.06, 1.95, 0.00], ['c', 2.61, 0.36, 4.02, 1.74, 4.26, 4.14], ['c', 0.03, 0.45, 0.03, 1.08, -0.03, 1.44], ['c', -0.18, 1.02, -0.78, 2.01, -1.59, 2.70], ['c', -0.72, 0.57, -1.62, 1.02, -2.49, 1.20], ['c', -1.38, 0.27, -3.03, 0.06, -4.20, -0.54], ['c', -1.08, -0.54, -1.71, -1.32, -1.86, -2.28], ['c', -0.09, -0.69, 0.09, -1.29, 0.57, -1.74], ['c', 0.24, -0.24, 0.45, -0.39, 0.75, -0.51], ['c', 0.21, -0.06, 0.27, -0.06, 0.60, -0.06], ['c', 0.33, 0.00, 0.39, 0.00, 0.60, 0.06], ['c', 0.30, 0.12, 0.51, 0.27, 0.75, 0.51], ['c', 0.36, 0.33, 0.57, 0.75, 0.60, 1.20], ['c', 0.00, 0.21, 0.00, 0.27, -0.06, 0.42], ['c', -0.09, 0.18, -0.12, 0.24, -0.54, 0.54], ['c', -0.18, 0.12, -0.36, 0.30, -0.42, 0.33], ['c', -0.36, 0.42, -0.18, 0.99, 0.36, 1.26], ['c', 0.51, 0.27, 1.47, 0.36, 2.01, 0.27], ['c', 0.93, -0.21, 1.47, -1.17, 1.65, -2.91], ['c', 0.06, -0.45, 0.06, -1.89, 0.00, -2.31], ['c', -0.15, -1.20, -0.51, -2.10, -1.05, -2.55], ['c', -0.21, -0.18, -0.54, -0.36, -0.81, -0.39], ['c', -0.30, -0.06, -0.84, -0.03, -1.26, 0.06], ['c', -0.93, 0.18, -1.65, 0.60, -2.16, 1.20], ['c', -0.15, 0.21, -0.27, 0.30, -0.39, 0.30], ['c', -0.15, 0.00, -0.30, -0.09, -0.36, -0.18], ['c', -0.06, -0.09, -0.06, -0.15, -0.06, -3.66], ['c', 0.00, -3.39, 0.00, -3.57, 0.06, -3.66], ['c', 0.03, -0.06, 0.09, -0.15, 0.15, -0.18], ['z']],
    w: 10.212,
    h: 14.997
  },
  '6': {
    d: [['M', 4.98, -14.97], ['c', 0.36, -0.03, 1.20, 0.00, 1.59, 0.06], ['c', 0.90, 0.15, 1.68, 0.51, 2.25, 1.05], ['c', 0.57, 0.51, 0.87, 1.23, 0.84, 1.98], ['c', -0.03, 0.51, -0.21, 0.90, -0.60, 1.26], ['c', -0.24, 0.24, -0.45, 0.39, -0.75, 0.51], ['c', -0.21, 0.06, -0.27, 0.06, -0.60, 0.06], ['c', -0.33, 0.00, -0.39, 0.00, -0.60, -0.06], ['c', -0.30, -0.12, -0.51, -0.27, -0.75, -0.51], ['c', -0.39, -0.36, -0.57, -0.78, -0.57, -1.26], ['c', 0.00, -0.27, 0.00, -0.30, 0.09, -0.42], ['c', 0.03, -0.09, 0.18, -0.21, 0.30, -0.30], ['c', 0.12, -0.09, 0.30, -0.21, 0.39, -0.27], ['c', 0.09, -0.06, 0.21, -0.18, 0.27, -0.24], ['c', 0.06, -0.12, 0.09, -0.15, 0.09, -0.33], ['c', 0.00, -0.18, -0.03, -0.24, -0.09, -0.36], ['c', -0.24, -0.39, -0.75, -0.60, -1.38, -0.57], ['c', -0.54, 0.03, -0.90, 0.18, -1.23, 0.48], ['c', -0.81, 0.72, -1.08, 2.16, -0.96, 5.37], ['l', 0.00, 0.63], ['l', 0.30, -0.12], ['c', 0.78, -0.27, 1.29, -0.33, 2.10, -0.27], ['c', 1.47, 0.12, 2.49, 0.54, 3.27, 1.29], ['c', 0.48, 0.51, 0.81, 1.11, 0.96, 1.89], ['c', 0.06, 0.27, 0.06, 0.42, 0.06, 0.93], ['c', 0.00, 0.54, 0.00, 0.69, -0.06, 0.96], ['c', -0.15, 0.78, -0.48, 1.38, -0.96, 1.89], ['c', -0.54, 0.51, -1.17, 0.87, -1.98, 1.08], ['c', -1.14, 0.30, -2.40, 0.33, -3.24, 0.03], ['c', -1.50, -0.48, -2.64, -1.89, -3.27, -4.02], ['c', -0.36, -1.23, -0.51, -2.82, -0.42, -4.08], ['c', 0.30, -3.66, 2.28, -6.30, 4.95, -6.66], ['z'], ['m', 0.66, 7.41], ['c', -0.27, -0.09, -0.81, -0.12, -1.08, -0.06], ['c', -0.72, 0.18, -1.08, 0.69, -1.23, 1.71], ['c', -0.06, 0.54, -0.06, 3.00, 0.00, 3.54], ['c', 0.18, 1.26, 0.72, 1.77, 1.80, 1.74], ['c', 0.39, -0.03, 0.63, -0.09, 0.90, -0.27], ['c', 0.66, -0.42, 0.90, -1.32, 0.90, -3.24], ['c', 0.00, -2.22, -0.36, -3.12, -1.29, -3.42], ['z']],
    w: 9.956,
    h: 14.982
  },
  '7': {
    d: [['M', 0.21, -14.97], ['c', 0.21, -0.06, 0.45, 0.00, 0.54, 0.15], ['c', 0.06, 0.09, 0.06, 0.15, 0.06, 0.39], ['c', 0.00, 0.24, 0.00, 0.33, 0.06, 0.42], ['c', 0.06, 0.12, 0.21, 0.24, 0.27, 0.24], ['c', 0.03, 0.00, 0.12, -0.12, 0.24, -0.21], ['c', 0.96, -1.20, 2.58, -1.35, 3.99, -0.42], ['c', 0.15, 0.12, 0.42, 0.30, 0.54, 0.45], ['c', 0.48, 0.39, 0.81, 0.57, 1.29, 0.60], ['c', 0.69, 0.03, 1.50, -0.30, 2.13, -0.87], ['c', 0.09, -0.09, 0.27, -0.30, 0.39, -0.45], ['c', 0.12, -0.15, 0.24, -0.27, 0.30, -0.30], ['c', 0.18, -0.06, 0.39, 0.03, 0.51, 0.21], ['c', 0.06, 0.18, 0.06, 0.24, -0.27, 0.72], ['c', -0.18, 0.24, -0.54, 0.78, -0.78, 1.17], ['c', -2.37, 3.54, -3.54, 6.27, -3.87, 9.00], ['c', -0.03, 0.33, -0.03, 0.66, -0.03, 1.26], ['c', 0.00, 0.90, 0.00, 1.08, 0.15, 1.89], ['c', 0.06, 0.45, 0.06, 0.48, 0.03, 0.60], ['c', -0.06, 0.09, -0.21, 0.21, -0.30, 0.21], ['c', -0.03, 0.00, -0.27, -0.06, -0.54, -0.15], ['c', -0.84, -0.27, -1.11, -0.30, -1.65, -0.30], ['c', -0.57, 0.00, -0.84, 0.03, -1.56, 0.27], ['c', -0.60, 0.18, -0.69, 0.21, -0.81, 0.15], ['c', -0.12, -0.06, -0.21, -0.18, -0.21, -0.30], ['c', 0.00, -0.15, 0.60, -1.44, 1.20, -2.61], ['c', 1.14, -2.22, 2.73, -4.68, 5.10, -8.01], ['c', 0.21, -0.27, 0.36, -0.48, 0.33, -0.48], ['c', 0.00, 0.00, -0.12, 0.06, -0.27, 0.12], ['c', -0.54, 0.30, -0.99, 0.39, -1.56, 0.39], ['c', -0.75, 0.03, -1.20, -0.18, -1.83, -0.75], ['c', -0.99, -0.90, -1.83, -1.17, -2.31, -0.72], ['c', -0.18, 0.15, -0.36, 0.51, -0.45, 0.84], ['c', -0.06, 0.24, -0.06, 0.33, -0.09, 1.98], ['c', 0.00, 1.62, -0.03, 1.74, -0.06, 1.80], ['c', -0.15, 0.24, -0.54, 0.24, -0.69, 0.00], ['c', -0.06, -0.09, -0.06, -0.15, -0.06, -3.57], ['c', 0.00, -3.42, 0.00, -3.48, 0.06, -3.57], ['c', 0.03, -0.06, 0.09, -0.12, 0.15, -0.15], ['z']],
    w: 10.561,
    h: 15.093
  },
  '8': {
    d: [['M', 4.98, -14.97], ['c', 0.33, -0.03, 1.02, -0.03, 1.32, 0.00], ['c', 1.32, 0.12, 2.49, 0.60, 3.21, 1.32], ['c', 0.39, 0.39, 0.66, 0.81, 0.78, 1.29], ['c', 0.09, 0.36, 0.09, 1.08, 0.00, 1.44], ['c', -0.21, 0.84, -0.66, 1.59, -1.59, 2.55], ['l', -0.30, 0.30], ['l', 0.27, 0.18], ['c', 1.47, 0.93, 2.31, 2.31, 2.25, 3.75], ['c', -0.03, 0.75, -0.24, 1.35, -0.63, 1.95], ['c', -0.45, 0.66, -1.02, 1.14, -1.83, 1.53], ['c', -1.80, 0.87, -4.20, 0.87, -6.00, 0.03], ['c', -1.62, -0.78, -2.52, -2.16, -2.46, -3.66], ['c', 0.06, -0.99, 0.54, -1.77, 1.80, -2.97], ['c', 0.54, -0.51, 0.54, -0.54, 0.48, -0.57], ['c', -0.39, -0.27, -0.96, -0.78, -1.20, -1.14], ['c', -0.75, -1.11, -0.87, -2.40, -0.30, -3.60], ['c', 0.69, -1.35, 2.25, -2.25, 4.20, -2.40], ['z'], ['m', 1.53, 0.69], ['c', -0.42, -0.09, -1.11, -0.12, -1.38, -0.06], ['c', -0.30, 0.06, -0.60, 0.18, -0.81, 0.30], ['c', -0.21, 0.12, -0.60, 0.51, -0.72, 0.72], ['c', -0.51, 0.87, -0.42, 1.89, 0.21, 2.52], ['c', 0.21, 0.21, 0.36, 0.30, 1.95, 1.23], ['c', 0.96, 0.54, 1.74, 0.99, 1.77, 1.02], ['c', 0.09, 0.00, 0.63, -0.60, 0.99, -1.11], ['c', 0.21, -0.36, 0.48, -0.87, 0.57, -1.23], ['c', 0.06, -0.24, 0.06, -0.36, 0.06, -0.72], ['c', 0.00, -0.45, -0.03, -0.66, -0.15, -0.99], ['c', -0.39, -0.81, -1.29, -1.44, -2.49, -1.68], ['z'], ['m', -1.44, 8.07], ['l', -1.89, -1.08], ['c', -0.03, 0.00, -0.18, 0.15, -0.39, 0.33], ['c', -1.20, 1.08, -1.65, 1.95, -1.59, 3.00], ['c', 0.09, 1.59, 1.35, 2.85, 3.21, 3.24], ['c', 0.33, 0.06, 0.45, 0.06, 0.93, 0.06], ['c', 0.63, 0.00, 0.81, -0.03, 1.29, -0.27], ['c', 0.90, -0.42, 1.47, -1.41, 1.41, -2.40], ['c', -0.06, -0.66, -0.39, -1.29, -0.90, -1.65], ['c', -0.12, -0.09, -1.05, -0.63, -2.07, -1.23], ['z']],
    w: 10.926,
    h: 14.989
  },
  '9': {
    d: [['M', 4.23, -14.97], ['c', 0.42, -0.03, 1.29, 0.00, 1.62, 0.06], ['c', 0.51, 0.12, 0.93, 0.30, 1.38, 0.57], ['c', 1.53, 1.02, 2.52, 3.24, 2.73, 5.94], ['c', 0.18, 2.55, -0.48, 4.98, -1.83, 6.57], ['c', -1.05, 1.26, -2.40, 1.89, -3.93, 1.83], ['c', -1.23, -0.06, -2.31, -0.45, -3.03, -1.14], ['c', -0.57, -0.51, -0.87, -1.23, -0.84, -1.98], ['c', 0.03, -0.51, 0.21, -0.90, 0.60, -1.26], ['c', 0.24, -0.24, 0.45, -0.39, 0.75, -0.51], ['c', 0.21, -0.06, 0.27, -0.06, 0.60, -0.06], ['c', 0.33, 0.00, 0.39, 0.00, 0.60, 0.06], ['c', 0.30, 0.12, 0.51, 0.27, 0.75, 0.51], ['c', 0.39, 0.36, 0.57, 0.78, 0.57, 1.26], ['c', 0.00, 0.27, 0.00, 0.30, -0.09, 0.42], ['c', -0.03, 0.09, -0.18, 0.21, -0.30, 0.30], ['c', -0.12, 0.09, -0.30, 0.21, -0.39, 0.27], ['c', -0.09, 0.06, -0.21, 0.18, -0.27, 0.24], ['c', -0.06, 0.12, -0.06, 0.15, -0.06, 0.33], ['c', 0.00, 0.18, 0.00, 0.24, 0.06, 0.36], ['c', 0.24, 0.39, 0.75, 0.60, 1.38, 0.57], ['c', 0.54, -0.03, 0.90, -0.18, 1.23, -0.48], ['c', 0.81, -0.72, 1.08, -2.16, 0.96, -5.37], ['l', 0.00, -0.63], ['l', -0.30, 0.12], ['c', -0.78, 0.27, -1.29, 0.33, -2.10, 0.27], ['c', -1.47, -0.12, -2.49, -0.54, -3.27, -1.29], ['c', -0.48, -0.51, -0.81, -1.11, -0.96, -1.89], ['c', -0.06, -0.27, -0.06, -0.42, -0.06, -0.96], ['c', 0.00, -0.51, 0.00, -0.66, 0.06, -0.93], ['c', 0.15, -0.78, 0.48, -1.38, 0.96, -1.89], ['c', 0.15, -0.12, 0.33, -0.27, 0.42, -0.36], ['c', 0.69, -0.51, 1.62, -0.81, 2.76, -0.93], ['z'], ['m', 1.17, 0.66], ['c', -0.21, -0.06, -0.57, -0.06, -0.81, -0.03], ['c', -0.78, 0.12, -1.26, 0.69, -1.41, 1.74], ['c', -0.12, 0.63, -0.15, 1.95, -0.09, 2.79], ['c', 0.12, 1.71, 0.63, 2.40, 1.77, 2.46], ['c', 1.08, 0.03, 1.62, -0.48, 1.80, -1.74], ['c', 0.06, -0.54, 0.06, -3.00, 0.00, -3.54], ['c', -0.15, -1.05, -0.51, -1.53, -1.26, -1.68], ['z']],
    w: 9.959,
    h: 14.986
  },
  'rests.multimeasure': {
    d: [['M', 0, -4], ['l', 0, 16], ['l', 1, 0], ['l', 0, -5], ['l', 40, 0], ['l', 0, 5], ['l', 1, 0], ['l', 0, -16], ['l', -1, 0], ['l', 0, 5], ['l', -40, 0], ['l', 0, -5], ['z']],
    w: 42,
    h: 18
  },
  'rests.whole': {
    d: [['M', 0.06, 0.03], ['l', 0.09, -0.06], ['l', 5.46, 0.00], ['l', 5.49, 0.00], ['l', 0.09, 0.06], ['l', 0.06, 0.09], ['l', 0.00, 2.19], ['l', 0.00, 2.19], ['l', -0.06, 0.09], ['l', -0.09, 0.06], ['l', -5.49, 0.00], ['l', -5.46, 0.00], ['l', -0.09, -0.06], ['l', -0.06, -0.09], ['l', 0.00, -2.19], ['l', 0.00, -2.19], ['z']],
    w: 11.25,
    h: 4.68
  },
  'rests.half': {
    d: [['M', 0.06, -4.62], ['l', 0.09, -0.06], ['l', 5.46, 0.00], ['l', 5.49, 0.00], ['l', 0.09, 0.06], ['l', 0.06, 0.09], ['l', 0.00, 2.19], ['l', 0.00, 2.19], ['l', -0.06, 0.09], ['l', -0.09, 0.06], ['l', -5.49, 0.00], ['l', -5.46, 0.00], ['l', -0.09, -0.06], ['l', -0.06, -0.09], ['l', 0.00, -2.19], ['l', 0.00, -2.19], ['z']],
    w: 11.25,
    h: 4.68
  },
  'rests.quarter': {
    d: [['M', 1.89, -11.82], ['c', 0.12, -0.06, 0.24, -0.06, 0.36, -0.03], ['c', 0.09, 0.06, 4.74, 5.58, 4.86, 5.82], ['c', 0.21, 0.39, 0.15, 0.78, -0.15, 1.26], ['c', -0.24, 0.33, -0.72, 0.81, -1.62, 1.56], ['c', -0.45, 0.36, -0.87, 0.75, -0.96, 0.84], ['c', -0.93, 0.99, -1.14, 2.49, -0.60, 3.63], ['c', 0.18, 0.39, 0.27, 0.48, 1.32, 1.68], ['c', 1.92, 2.25, 1.83, 2.16, 1.83, 2.34], ['c', 0.00, 0.18, -0.18, 0.36, -0.36, 0.39], ['c', -0.15, 0.00, -0.27, -0.06, -0.48, -0.27], ['c', -0.75, -0.75, -2.46, -1.29, -3.39, -1.08], ['c', -0.45, 0.09, -0.69, 0.27, -0.90, 0.69], ['c', -0.12, 0.30, -0.21, 0.66, -0.24, 1.14], ['c', -0.03, 0.66, 0.09, 1.35, 0.30, 2.01], ['c', 0.15, 0.42, 0.24, 0.66, 0.45, 0.96], ['c', 0.18, 0.24, 0.18, 0.33, 0.03, 0.42], ['c', -0.12, 0.06, -0.18, 0.03, -0.45, -0.30], ['c', -1.08, -1.38, -2.07, -3.36, -2.40, -4.83], ['c', -0.27, -1.05, -0.15, -1.77, 0.27, -2.07], ['c', 0.21, -0.12, 0.42, -0.15, 0.87, -0.15], ['c', 0.87, 0.06, 2.10, 0.39, 3.30, 0.90], ['l', 0.39, 0.18], ['l', -1.65, -1.95], ['c', -2.52, -2.97, -2.61, -3.09, -2.70, -3.27], ['c', -0.09, -0.24, -0.12, -0.48, -0.03, -0.75], ['c', 0.15, -0.48, 0.57, -0.96, 1.83, -2.01], ['c', 0.45, -0.36, 0.84, -0.72, 0.93, -0.78], ['c', 0.69, -0.75, 1.02, -1.80, 0.90, -2.79], ['c', -0.06, -0.33, -0.21, -0.84, -0.39, -1.11], ['c', -0.09, -0.15, -0.45, -0.60, -0.81, -1.05], ['c', -0.36, -0.42, -0.69, -0.81, -0.72, -0.87], ['c', -0.09, -0.18, 0.00, -0.42, 0.21, -0.51], ['z']],
    w: 7.888,
    h: 21.435
  },
  'rests.8th': {
    d: [['M', 1.68, -6.12], ['c', 0.66, -0.09, 1.23, 0.09, 1.68, 0.51], ['c', 0.27, 0.30, 0.39, 0.54, 0.57, 1.26], ['c', 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ['c', 0.12, 0.27, 0.33, 0.45, 0.60, 0.48], ['c', 0.12, 0.00, 0.18, 0.00, 0.33, -0.09], ['c', 0.39, -0.18, 1.32, -1.29, 1.68, -1.98], ['c', 0.09, -0.21, 0.24, -0.30, 0.39, -0.30], ['c', 0.12, 0.00, 0.27, 0.09, 0.33, 0.18], ['c', 0.03, 0.06, -0.27, 1.11, -1.86, 6.42], ['c', -1.02, 3.48, -1.89, 6.39, -1.92, 6.42], ['c', 0.00, 0.03, -0.12, 0.12, -0.24, 0.15], ['c', -0.18, 0.09, -0.21, 0.09, -0.45, 0.09], ['c', -0.24, 0.00, -0.30, 0.00, -0.48, -0.06], ['c', -0.09, -0.06, -0.21, -0.12, -0.21, -0.15], ['c', -0.06, -0.03, 0.15, -0.57, 1.68, -4.92], ['c', 0.96, -2.67, 1.74, -4.89, 1.71, -4.89], ['l', -0.51, 0.15], ['c', -1.08, 0.36, -1.74, 0.48, -2.55, 0.48], ['c', -0.66, 0.00, -0.84, -0.03, -1.32, -0.27], ['c', -1.32, -0.63, -1.77, -2.16, -1.02, -3.30], ['c', 0.33, -0.45, 0.84, -0.81, 1.38, -0.90], ['z']],
    w: 7.534,
    h: 13.883
  },
  'rests.16th': {
    d: [['M', 3.33, -6.12], ['c', 0.66, -0.09, 1.23, 0.09, 1.68, 0.51], ['c', 0.27, 0.30, 0.39, 0.54, 0.57, 1.26], ['c', 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ['c', 0.15, 0.39, 0.57, 0.57, 0.87, 0.42], ['c', 0.39, -0.18, 1.20, -1.23, 1.62, -2.07], ['c', 0.06, -0.15, 0.24, -0.24, 0.36, -0.24], ['c', 0.12, 0.00, 0.27, 0.09, 0.33, 0.18], ['c', 0.03, 0.06, -0.45, 1.86, -2.67, 10.17], ['c', -1.50, 5.55, -2.73, 10.14, -2.76, 10.17], ['c', -0.03, 0.03, -0.12, 0.12, -0.24, 0.15], ['c', -0.18, 0.09, -0.21, 0.09, -0.45, 0.09], ['c', -0.24, 0.00, -0.30, 0.00, -0.48, -0.06], ['c', -0.09, -0.06, -0.21, -0.12, -0.21, -0.15], ['c', -0.06, -0.03, 0.12, -0.57, 1.44, -4.92], ['c', 0.81, -2.67, 1.47, -4.86, 1.47, -4.89], ['c', -0.03, 0.00, -0.27, 0.06, -0.54, 0.15], ['c', -1.08, 0.36, -1.77, 0.48, -2.58, 0.48], ['c', -0.66, 0.00, -0.84, -0.03, -1.32, -0.27], ['c', -1.32, -0.63, -1.77, -2.16, -1.02, -3.30], ['c', 0.72, -1.05, 2.22, -1.23, 3.06, -0.42], ['c', 0.30, 0.33, 0.42, 0.60, 0.60, 1.38], ['c', 0.09, 0.45, 0.21, 0.78, 0.33, 0.90], ['c', 0.09, 0.09, 0.27, 0.18, 0.45, 0.21], ['c', 0.12, 0.00, 0.18, 0.00, 0.33, -0.09], ['c', 0.33, -0.15, 1.02, -0.93, 1.41, -1.59], ['c', 0.12, -0.21, 0.18, -0.39, 0.39, -1.08], ['c', 0.66, -2.10, 1.17, -3.84, 1.17, -3.87], ['c', 0.00, 0.00, -0.21, 0.06, -0.42, 0.15], ['c', -0.51, 0.15, -1.20, 0.33, -1.68, 0.42], ['c', -0.33, 0.06, -0.51, 0.06, -0.96, 0.06], ['c', -0.66, 0.00, -0.84, -0.03, -1.32, -0.27], ['c', -1.32, -0.63, -1.77, -2.16, -1.02, -3.30], ['c', 0.33, -0.45, 0.84, -0.81, 1.38, -0.90], ['z']],
    w: 9.724,
    h: 21.383
  },
  'rests.32nd': {
    d: [['M', 4.23, -13.62], ['c', 0.66, -0.09, 1.23, 0.09, 1.68, 0.51], ['c', 0.27, 0.30, 0.39, 0.54, 0.57, 1.26], ['c', 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ['c', 0.12, 0.27, 0.33, 0.45, 0.60, 0.48], ['c', 0.12, 0.00, 0.18, 0.00, 0.27, -0.06], ['c', 0.33, -0.21, 0.99, -1.11, 1.44, -1.98], ['c', 0.09, -0.24, 0.21, -0.33, 0.39, -0.33], ['c', 0.12, 0.00, 0.27, 0.09, 0.33, 0.18], ['c', 0.03, 0.06, -0.57, 2.67, -3.21, 13.89], ['c', -1.80, 7.62, -3.30, 13.89, -3.30, 13.92], ['c', -0.03, 0.06, -0.12, 0.12, -0.24, 0.18], ['c', -0.21, 0.09, -0.24, 0.09, -0.48, 0.09], ['c', -0.24, 0.00, -0.30, 0.00, -0.48, -0.06], ['c', -0.09, -0.06, -0.21, -0.12, -0.21, -0.15], ['c', -0.06, -0.03, 0.09, -0.57, 1.23, -4.92], ['c', 0.69, -2.67, 1.26, -4.86, 1.29, -4.89], ['c', 0.00, -0.03, -0.12, -0.03, -0.48, 0.12], ['c', -1.17, 0.39, -2.22, 0.57, -3.00, 0.54], ['c', -0.42, -0.03, -0.75, -0.12, -1.11, -0.30], ['c', -1.32, -0.63, -1.77, -2.16, -1.02, -3.30], ['c', 0.72, -1.05, 2.22, -1.23, 3.06, -0.42], ['c', 0.30, 0.33, 0.42, 0.60, 0.60, 1.38], ['c', 0.09, 0.45, 0.21, 0.78, 0.33, 0.90], ['c', 0.12, 0.09, 0.30, 0.18, 0.48, 0.21], ['c', 0.12, 0.00, 0.18, 0.00, 0.30, -0.09], ['c', 0.42, -0.21, 1.29, -1.29, 1.56, -1.89], ['c', 0.03, -0.12, 1.23, -4.59, 1.23, -4.65], ['c', 0.00, -0.03, -0.18, 0.03, -0.39, 0.12], ['c', -0.63, 0.18, -1.20, 0.36, -1.74, 0.45], ['c', -0.39, 0.06, -0.54, 0.06, -1.02, 0.06], ['c', -0.66, 0.00, -0.84, -0.03, -1.32, -0.27], ['c', -1.32, -0.63, -1.77, -2.16, -1.02, -3.30], ['c', 0.72, -1.05, 2.22, -1.23, 3.06, -0.42], ['c', 0.30, 0.33, 0.42, 0.60, 0.60, 1.38], ['c', 0.09, 0.45, 0.21, 0.78, 0.33, 0.90], ['c', 0.18, 0.18, 0.51, 0.27, 0.72, 0.15], ['c', 0.30, -0.12, 0.69, -0.57, 1.08, -1.17], ['c', 0.42, -0.60, 0.39, -0.51, 1.05, -3.03], ['c', 0.33, -1.26, 0.60, -2.31, 0.60, -2.34], ['c', 0.00, 0.00, -0.21, 0.03, -0.45, 0.12], ['c', -0.57, 0.18, -1.14, 0.33, -1.62, 0.42], ['c', -0.33, 0.06, -0.51, 0.06, -0.96, 0.06], ['c', -0.66, 0.00, -0.84, -0.03, -1.32, -0.27], ['c', -1.32, -0.63, -1.77, -2.16, -1.02, -3.30], ['c', 0.33, -0.45, 0.84, -0.81, 1.38, -0.90], ['z']],
    w: 11.373,
    h: 28.883
  },
  'rests.64th': {
    d: [['M', 5.13, -13.62], ['c', 0.66, -0.09, 1.23, 0.09, 1.68, 0.51], ['c', 0.27, 0.30, 0.39, 0.54, 0.57, 1.26], ['c', 0.15, 0.63, 0.21, 0.81, 0.33, 0.96], ['c', 0.18, 0.21, 0.54, 0.30, 0.75, 0.18], ['c', 0.24, -0.12, 0.63, -0.66, 1.08, -1.56], ['c', 0.33, -0.66, 0.39, -0.72, 0.60, -0.72], ['c', 0.12, 0.00, 0.27, 0.09, 0.33, 0.18], ['c', 0.03, 0.06, -0.69, 3.66, -3.54, 17.64], ['c', -1.95, 9.66, -3.57, 17.61, -3.57, 17.64], ['c', -0.03, 0.06, -0.12, 0.12, -0.24, 0.18], ['c', -0.21, 0.09, -0.24, 0.09, -0.48, 0.09], ['c', -0.24, 0.00, -0.30, 0.00, -0.48, -0.06], ['c', -0.09, -0.06, -0.21, -0.12, -0.21, -0.15], ['c', -0.06, -0.03, 0.06, -0.57, 1.05, -4.95], ['c', 0.60, -2.70, 1.08, -4.89, 1.08, -4.92], ['c', 0.00, 0.00, -0.24, 0.06, -0.51, 0.15], ['c', -0.66, 0.24, -1.20, 0.36, -1.77, 0.48], ['c', -0.42, 0.06, -0.57, 0.06, -1.05, 0.06], ['c', -0.69, 0.00, -0.87, -0.03, -1.35, -0.27], ['c', -1.32, -0.63, -1.77, -2.16, -1.02, -3.30], ['c', 0.72, -1.05, 2.22, -1.23, 3.06, -0.42], ['c', 0.30, 0.33, 0.42, 0.60, 0.60, 1.38], ['c', 0.09, 0.45, 0.21, 0.78, 0.33, 0.90], ['c', 0.09, 0.09, 0.27, 0.18, 0.45, 0.21], ['c', 0.21, 0.03, 0.39, -0.09, 0.72, -0.42], ['c', 0.45, -0.45, 1.02, -1.26, 1.17, -1.65], ['c', 0.03, -0.09, 0.27, -1.14, 0.54, -2.34], ['c', 0.27, -1.20, 0.48, -2.19, 0.51, -2.22], ['c', 0.00, -0.03, -0.09, -0.03, -0.48, 0.12], ['c', -1.17, 0.39, -2.22, 0.57, -3.00, 0.54], ['c', -0.42, -0.03, -0.75, -0.12, -1.11, -0.30], ['c', -1.32, -0.63, -1.77, -2.16, -1.02, -3.30], ['c', 0.36, -0.54, 0.96, -0.87, 1.65, -0.93], ['c', 0.54, -0.03, 1.02, 0.15, 1.41, 0.54], ['c', 0.27, 0.30, 0.39, 0.54, 0.57, 1.26], ['c', 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ['c', 0.15, 0.39, 0.57, 0.57, 0.90, 0.42], ['c', 0.36, -0.18, 1.20, -1.26, 1.47, -1.89], ['c', 0.03, -0.09, 0.30, -1.20, 0.57, -2.43], ['l', 0.51, -2.28], ['l', -0.54, 0.18], ['c', -1.11, 0.36, -1.80, 0.48, -2.61, 0.48], ['c', -0.66, 0.00, -0.84, -0.03, -1.32, -0.27], ['c', -1.32, -0.63, -1.77, -2.16, -1.02, -3.30], ['c', 0.36, -0.54, 0.96, -0.87, 1.65, -0.93], ['c', 0.54, -0.03, 1.02, 0.15, 1.41, 0.54], ['c', 0.27, 0.30, 0.39, 0.54, 0.57, 1.26], ['c', 0.15, 0.63, 0.21, 0.81, 0.33, 0.96], ['c', 0.21, 0.21, 0.54, 0.30, 0.75, 0.18], ['c', 0.36, -0.18, 0.93, -0.93, 1.29, -1.68], ['c', 0.12, -0.24, 0.18, -0.48, 0.63, -2.55], ['l', 0.51, -2.31], ['c', 0.00, -0.03, -0.18, 0.03, -0.39, 0.12], ['c', -1.14, 0.36, -2.10, 0.54, -2.82, 0.51], ['c', -0.42, -0.03, -0.75, -0.12, -1.11, -0.30], ['c', -1.32, -0.63, -1.77, -2.16, -1.02, -3.30], ['c', 0.33, -0.45, 0.84, -0.81, 1.38, -0.90], ['z']],
    w: 12.453,
    h: 36.383
  },
  'rests.128th': {
    d: [['M', 6.03, -21.12], ['c', 0.66, -0.09, 1.23, 0.09, 1.68, 0.51], ['c', 0.27, 0.30, 0.39, 0.54, 0.57, 1.26], ['c', 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ['c', 0.12, 0.27, 0.33, 0.45, 0.60, 0.48], ['c', 0.21, 0.00, 0.33, -0.06, 0.54, -0.36], ['c', 0.15, -0.21, 0.54, -0.93, 0.78, -1.47], ['c', 0.15, -0.33, 0.18, -0.39, 0.30, -0.48], ['c', 0.18, -0.09, 0.45, 0.00, 0.51, 0.15], ['c', 0.03, 0.09, -7.11, 42.75, -7.17, 42.84], ['c', -0.03, 0.03, -0.15, 0.09, -0.24, 0.15], ['c', -0.18, 0.06, -0.24, 0.06, -0.45, 0.06], ['c', -0.24, 0.00, -0.30, 0.00, -0.48, -0.06], ['c', -0.09, -0.06, -0.21, -0.12, -0.21, -0.15], ['c', -0.06, -0.03, 0.03, -0.57, 0.84, -4.98], ['c', 0.51, -2.70, 0.93, -4.92, 0.90, -4.92], ['c', 0.00, 0.00, -0.15, 0.06, -0.36, 0.12], ['c', -0.78, 0.27, -1.62, 0.48, -2.31, 0.57], ['c', -0.15, 0.03, -0.54, 0.03, -0.81, 0.03], ['c', -0.66, 0.00, -0.84, -0.03, -1.32, -0.27], ['c', -1.32, -0.63, -1.77, -2.16, -1.02, -3.30], ['c', 0.36, -0.54, 0.96, -0.87, 1.65, -0.93], ['c', 0.54, -0.03, 1.02, 0.15, 1.41, 0.54], ['c', 0.27, 0.30, 0.39, 0.54, 0.57, 1.26], ['c', 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ['c', 0.12, 0.27, 0.33, 0.45, 0.63, 0.48], ['c', 0.12, 0.00, 0.18, 0.00, 0.30, -0.09], ['c', 0.42, -0.21, 1.14, -1.11, 1.50, -1.83], ['c', 0.12, -0.27, 0.12, -0.27, 0.54, -2.52], ['c', 0.24, -1.23, 0.42, -2.25, 0.39, -2.25], ['c', 0.00, 0.00, -0.24, 0.06, -0.51, 0.18], ['c', -1.26, 0.39, -2.25, 0.57, -3.06, 0.54], ['c', -0.42, -0.03, -0.75, -0.12, -1.11, -0.30], ['c', -1.32, -0.63, -1.77, -2.16, -1.02, -3.30], ['c', 0.36, -0.54, 0.96, -0.87, 1.65, -0.93], ['c', 0.54, -0.03, 1.02, 0.15, 1.41, 0.54], ['c', 0.27, 0.30, 0.39, 0.54, 0.57, 1.26], ['c', 0.15, 0.63, 0.21, 0.81, 0.33, 0.96], ['c', 0.18, 0.21, 0.51, 0.30, 0.75, 0.18], ['c', 0.36, -0.15, 1.05, -0.99, 1.41, -1.77], ['l', 0.15, -0.30], ['l', 0.42, -2.25], ['c', 0.21, -1.26, 0.42, -2.28, 0.39, -2.28], ['l', -0.51, 0.15], ['c', -1.11, 0.39, -1.89, 0.51, -2.70, 0.51], ['c', -0.66, 0.00, -0.84, -0.03, -1.32, -0.27], ['c', -1.32, -0.63, -1.77, -2.16, -1.02, -3.30], ['c', 0.36, -0.54, 0.96, -0.87, 1.65, -0.93], ['c', 0.54, -0.03, 1.02, 0.15, 1.41, 0.54], ['c', 0.27, 0.30, 0.39, 0.54, 0.57, 1.26], ['c', 0.15, 0.63, 0.21, 0.81, 0.33, 0.96], ['c', 0.18, 0.18, 0.48, 0.27, 0.72, 0.21], ['c', 0.33, -0.12, 1.14, -1.26, 1.41, -1.95], ['c', 0.00, -0.09, 0.21, -1.11, 0.45, -2.34], ['c', 0.21, -1.20, 0.39, -2.22, 0.39, -2.28], ['c', 0.03, -0.03, 0.00, -0.03, -0.45, 0.12], ['c', -0.57, 0.18, -1.20, 0.33, -1.71, 0.42], ['c', -0.30, 0.06, -0.51, 0.06, -0.93, 0.06], ['c', -0.66, 0.00, -0.84, -0.03, -1.32, -0.27], ['c', -1.32, -0.63, -1.77, -2.16, -1.02, -3.30], ['c', 0.36, -0.54, 0.96, -0.87, 1.65, -0.93], ['c', 0.54, -0.03, 1.02, 0.15, 1.41, 0.54], ['c', 0.27, 0.30, 0.39, 0.54, 0.57, 1.26], ['c', 0.09, 0.33, 0.18, 0.66, 0.21, 0.72], ['c', 0.12, 0.27, 0.33, 0.45, 0.60, 0.48], ['c', 0.18, 0.00, 0.36, -0.09, 0.57, -0.33], ['c', 0.33, -0.36, 0.78, -1.14, 0.93, -1.56], ['c', 0.03, -0.12, 0.24, -1.20, 0.45, -2.40], ['c', 0.24, -1.20, 0.42, -2.22, 0.42, -2.28], ['c', 0.03, -0.03, 0.00, -0.03, -0.39, 0.09], ['c', -1.05, 0.36, -1.80, 0.48, -2.58, 0.48], ['c', -0.63, 0.00, -0.84, -0.03, -1.29, -0.27], ['c', -1.32, -0.63, -1.77, -2.16, -1.02, -3.30], ['c', 0.33, -0.45, 0.84, -0.81, 1.38, -0.90], ['z']],
    w: 12.992,
    h: 43.883
  },
  'accidentals.sharp': {
    d: [['M', 5.73, -11.19], ['c', 0.21, -0.12, 0.54, -0.03, 0.66, 0.24], ['c', 0.06, 0.12, 0.06, 0.21, 0.06, 2.31], ['c', 0.00, 1.23, 0.00, 2.22, 0.03, 2.22], ['c', 0.00, 0.00, 0.27, -0.12, 0.60, -0.24], ['c', 0.69, -0.27, 0.78, -0.30, 0.96, -0.15], ['c', 0.21, 0.15, 0.21, 0.18, 0.21, 1.38], ['c', 0.00, 1.02, 0.00, 1.11, -0.06, 1.20], ['c', -0.03, 0.06, -0.09, 0.12, -0.12, 0.15], ['c', -0.06, 0.03, -0.42, 0.21, -0.84, 0.36], ['l', -0.75, 0.33], ['l', -0.03, 2.43], ['c', 0.00, 1.32, 0.00, 2.43, 0.03, 2.43], ['c', 0.00, 0.00, 0.27, -0.12, 0.60, -0.24], ['c', 0.69, -0.27, 0.78, -0.30, 0.96, -0.15], ['c', 0.21, 0.15, 0.21, 0.18, 0.21, 1.38], ['c', 0.00, 1.02, 0.00, 1.11, -0.06, 1.20], ['c', -0.03, 0.06, -0.09, 0.12, -0.12, 0.15], ['c', -0.06, 0.03, -0.42, 0.21, -0.84, 0.36], ['l', -0.75, 0.33], ['l', -0.03, 2.52], ['c', 0.00, 2.28, -0.03, 2.55, -0.06, 2.64], ['c', -0.21, 0.36, -0.72, 0.36, -0.93, 0.00], ['c', -0.03, -0.09, -0.06, -0.33, -0.06, -2.43], ['l', 0.00, -2.31], ['l', -1.29, 0.51], ['l', -1.26, 0.51], ['l', 0.00, 2.43], ['c', 0.00, 2.58, 0.00, 2.52, -0.15, 2.67], ['c', -0.06, 0.09, -0.27, 0.18, -0.36, 0.18], ['c', -0.12, 0.00, -0.33, -0.09, -0.39, -0.18], ['c', -0.15, -0.15, -0.15, -0.09, -0.15, -2.43], ['c', 0.00, -1.23, 0.00, -2.22, -0.03, -2.22], ['c', 0.00, 0.00, -0.27, 0.12, -0.60, 0.24], ['c', -0.69, 0.27, -0.78, 0.30, -0.96, 0.15], ['c', -0.21, -0.15, -0.21, -0.18, -0.21, -1.38], ['c', 0.00, -1.02, 0.00, -1.11, 0.06, -1.20], ['c', 0.03, -0.06, 0.09, -0.12, 0.12, -0.15], ['c', 0.06, -0.03, 0.42, -0.21, 0.84, -0.36], ['l', 0.78, -0.33], ['l', 0.00, -2.43], ['c', 0.00, -1.32, 0.00, -2.43, -0.03, -2.43], ['c', 0.00, 0.00, -0.27, 0.12, -0.60, 0.24], ['c', -0.69, 0.27, -0.78, 0.30, -0.96, 0.15], ['c', -0.21, -0.15, -0.21, -0.18, -0.21, -1.38], ['c', 0.00, -1.02, 0.00, -1.11, 0.06, -1.20], ['c', 0.03, -0.06, 0.09, -0.12, 0.12, -0.15], ['c', 0.06, -0.03, 0.42, -0.21, 0.84, -0.36], ['l', 0.78, -0.33], ['l', 0.00, -2.52], ['c', 0.00, -2.28, 0.03, -2.55, 0.06, -2.64], ['c', 0.21, -0.36, 0.72, -0.36, 0.93, 0.00], ['c', 0.03, 0.09, 0.06, 0.33, 0.06, 2.43], ['l', 0.03, 2.31], ['l', 1.26, -0.51], ['l', 1.26, -0.51], ['l', 0.00, -2.43], ['c', 0.00, -2.28, 0.00, -2.43, 0.06, -2.55], ['c', 0.06, -0.12, 0.12, -0.18, 0.27, -0.24], ['z'], ['m', -0.33, 10.65], ['l', 0.00, -2.43], ['l', -1.29, 0.51], ['l', -1.26, 0.51], ['l', 0.00, 2.46], ['l', 0.00, 2.43], ['l', 0.09, -0.03], ['c', 0.06, -0.03, 0.63, -0.27, 1.29, -0.51], ['l', 1.17, -0.48], ['l', 0.00, -2.46], ['z']],
    w: 8.25,
    h: 22.462
  },
  'accidentals.halfsharp': {
    d: [['M', 2.43, -10.05], ['c', 0.21, -0.12, 0.54, -0.03, 0.66, 0.24], ['c', 0.06, 0.12, 0.06, 0.21, 0.06, 2.01], ['c', 0.00, 1.05, 0.00, 1.89, 0.03, 1.89], ['l', 0.72, -0.48], ['c', 0.69, -0.48, 0.69, -0.51, 0.87, -0.51], ['c', 0.15, 0.00, 0.18, 0.03, 0.27, 0.09], ['c', 0.21, 0.15, 0.21, 0.18, 0.21, 1.41], ['c', 0.00, 1.11, -0.03, 1.14, -0.09, 1.23], ['c', -0.03, 0.03, -0.48, 0.39, -1.02, 0.75], ['l', -0.99, 0.66], ['l', 0.00, 2.37], ['c', 0.00, 1.32, 0.00, 2.37, 0.03, 2.37], ['l', 0.72, -0.48], ['c', 0.69, -0.48, 0.69, -0.51, 0.87, -0.51], ['c', 0.15, 0.00, 0.18, 0.03, 0.27, 0.09], ['c', 0.21, 0.15, 0.21, 0.18, 0.21, 1.41], ['c', 0.00, 1.11, -0.03, 1.14, -0.09, 1.23], ['c', -0.03, 0.03, -0.48, 0.39, -1.02, 0.75], ['l', -0.99, 0.66], ['l', 0.00, 2.25], ['c', 0.00, 1.95, 0.00, 2.28, -0.06, 2.37], ['c', -0.06, 0.12, -0.12, 0.21, -0.24, 0.27], ['c', -0.27, 0.12, -0.54, 0.03, -0.69, -0.24], ['c', -0.06, -0.12, -0.06, -0.21, -0.06, -2.01], ['c', 0.00, -1.05, 0.00, -1.89, -0.03, -1.89], ['l', -0.72, 0.48], ['c', -0.69, 0.48, -0.69, 0.48, -0.87, 0.48], ['c', -0.15, 0.00, -0.18, 0.00, -0.27, -0.06], ['c', -0.21, -0.15, -0.21, -0.18, -0.21, -1.41], ['c', 0.00, -1.11, 0.03, -1.14, 0.09, -1.23], ['c', 0.03, -0.03, 0.48, -0.39, 1.02, -0.75], ['l', 0.99, -0.66], ['l', 0.00, -2.37], ['c', 0.00, -1.32, 0.00, -2.37, -0.03, -2.37], ['l', -0.72, 0.48], ['c', -0.69, 0.48, -0.69, 0.48, -0.87, 0.48], ['c', -0.15, 0.00, -0.18, 0.00, -0.27, -0.06], ['c', -0.21, -0.15, -0.21, -0.18, -0.21, -1.41], ['c', 0.00, -1.11, 0.03, -1.14, 0.09, -1.23], ['c', 0.03, -0.03, 0.48, -0.39, 1.02, -0.75], ['l', 0.99, -0.66], ['l', 0.00, -2.25], ['c', 0.00, -2.13, 0.00, -2.28, 0.06, -2.40], ['c', 0.06, -0.12, 0.12, -0.18, 0.27, -0.24], ['z']],
    w: 5.25,
    h: 20.174
  },
  'accidentals.nat': {
    d: [['M', 0.21, -11.40], ['c', 0.24, -0.06, 0.78, 0.00, 0.99, 0.15], ['c', 0.03, 0.03, 0.03, 0.48, 0.00, 2.61], ['c', -0.03, 1.44, -0.03, 2.61, -0.03, 2.61], ['c', 0.00, 0.03, 0.75, -0.09, 1.68, -0.24], ['c', 0.96, -0.18, 1.71, -0.27, 1.74, -0.27], ['c', 0.15, 0.03, 0.27, 0.15, 0.36, 0.30], ['l', 0.06, 0.12], ['l', 0.09, 8.67], ['c', 0.09, 6.96, 0.12, 8.67, 0.09, 8.67], ['c', -0.03, 0.03, -0.12, 0.06, -0.21, 0.09], ['c', -0.24, 0.09, -0.72, 0.09, -0.96, 0.00], ['c', -0.09, -0.03, -0.18, -0.06, -0.21, -0.09], ['c', -0.03, -0.03, -0.03, -0.48, 0.00, -2.61], ['c', 0.03, -1.44, 0.03, -2.61, 0.03, -2.61], ['c', 0.00, -0.03, -0.75, 0.09, -1.68, 0.24], ['c', -0.96, 0.18, -1.71, 0.27, -1.74, 0.27], ['c', -0.15, -0.03, -0.27, -0.15, -0.36, -0.30], ['l', -0.06, -0.15], ['l', -0.09, -7.53], ['c', -0.06, -4.14, -0.09, -8.04, -0.12, -8.67], ['l', 0.00, -1.11], ['l', 0.15, -0.06], ['c', 0.09, -0.03, 0.21, -0.06, 0.27, -0.09], ['z'], ['m', 3.75, 8.40], ['c', 0.00, -0.33, 0.00, -0.42, -0.03, -0.42], ['c', -0.12, 0.00, -2.79, 0.45, -2.79, 0.48], ['c', -0.03, 0.00, -0.09, 6.30, -0.09, 6.33], ['c', 0.03, 0.00, 2.79, -0.45, 2.82, -0.48], ['c', 0.00, 0.00, 0.09, -4.53, 0.09, -5.91], ['z']],
    w: 5.4,
    h: 22.8
  },
  'accidentals.flat': {
    d: [['M', -0.36, -14.07], ['c', 0.33, -0.06, 0.87, 0.00, 1.08, 0.15], ['c', 0.06, 0.03, 0.06, 0.36, -0.03, 5.25], ['c', -0.06, 2.85, -0.09, 5.19, -0.09, 5.19], ['c', 0.00, 0.03, 0.12, -0.03, 0.24, -0.12], ['c', 0.63, -0.42, 1.41, -0.66, 2.19, -0.72], ['c', 0.81, -0.03, 1.47, 0.21, 2.04, 0.78], ['c', 0.57, 0.54, 0.87, 1.26, 0.93, 2.04], ['c', 0.03, 0.57, -0.09, 1.08, -0.36, 1.62], ['c', -0.42, 0.81, -1.02, 1.38, -2.82, 2.61], ['c', -1.14, 0.78, -1.44, 1.02, -1.80, 1.44], ['c', -0.18, 0.18, -0.39, 0.39, -0.45, 0.42], ['c', -0.27, 0.18, -0.57, 0.15, -0.81, -0.06], ['c', -0.06, -0.09, -0.12, -0.18, -0.15, -0.27], ['c', -0.03, -0.06, -0.09, -3.27, -0.18, -8.34], ['c', -0.09, -4.53, -0.15, -8.58, -0.18, -9.03], ['l', 0.00, -0.78], ['l', 0.12, -0.06], ['c', 0.06, -0.03, 0.18, -0.09, 0.27, -0.12], ['z'], ['m', 3.18, 11.01], ['c', -0.21, -0.12, -0.54, -0.15, -0.81, -0.06], ['c', -0.54, 0.15, -0.99, 0.63, -1.17, 1.26], ['c', -0.06, 0.30, -0.12, 2.88, -0.06, 3.87], ['c', 0.03, 0.42, 0.03, 0.81, 0.06, 0.90], ['l', 0.03, 0.12], ['l', 0.45, -0.39], ['c', 0.63, -0.54, 1.26, -1.17, 1.56, -1.59], ['c', 0.30, -0.42, 0.60, -0.99, 0.72, -1.41], ['c', 0.18, -0.69, 0.09, -1.47, -0.18, -2.07], ['c', -0.15, -0.30, -0.33, -0.51, -0.60, -0.63], ['z']],
    w: 6.75,
    h: 18.801
  },
  'accidentals.halfflat': {
    d: [['M', 4.83, -14.07], ['c', 0.33, -0.06, 0.87, 0.00, 1.08, 0.15], ['c', 0.06, 0.03, 0.06, 0.60, -0.12, 9.06], ['c', -0.09, 5.55, -0.15, 9.06, -0.18, 9.12], ['c', -0.03, 0.09, -0.09, 0.18, -0.15, 0.27], ['c', -0.24, 0.21, -0.54, 0.24, -0.81, 0.06], ['c', -0.06, -0.03, -0.27, -0.24, -0.45, -0.42], ['c', -0.36, -0.42, -0.66, -0.66, -1.80, -1.44], ['c', -1.23, -0.84, -1.83, -1.32, -2.25, -1.77], ['c', -0.66, -0.78, -0.96, -1.56, -0.93, -2.46], ['c', 0.09, -1.41, 1.11, -2.58, 2.40, -2.79], ['c', 0.30, -0.06, 0.84, -0.03, 1.23, 0.06], ['c', 0.54, 0.12, 1.08, 0.33, 1.53, 0.63], ['c', 0.12, 0.09, 0.24, 0.15, 0.24, 0.12], ['c', 0.00, 0.00, -0.12, -8.37, -0.18, -9.75], ['l', 0.00, -0.66], ['l', 0.12, -0.06], ['c', 0.06, -0.03, 0.18, -0.09, 0.27, -0.12], ['z'], ['m', -1.65, 10.95], ['c', -0.60, -0.18, -1.08, 0.09, -1.38, 0.69], ['c', -0.27, 0.60, -0.36, 1.38, -0.18, 2.07], ['c', 0.12, 0.42, 0.42, 0.99, 0.72, 1.41], ['c', 0.30, 0.42, 0.93, 1.05, 1.56, 1.59], ['l', 0.48, 0.39], ['l', 0.00, -0.12], ['c', 0.03, -0.09, 0.03, -0.48, 0.06, -0.90], ['c', 0.03, -0.57, 0.03, -1.08, 0.00, -2.22], ['c', -0.03, -1.62, -0.03, -1.62, -0.24, -2.07], ['c', -0.21, -0.42, -0.60, -0.75, -1.02, -0.84], ['z']],
    w: 6.728,
    h: 18.801
  },
  'accidentals.dblflat': {
    d: [['M', -0.36, -14.07], ['c', 0.33, -0.06, 0.87, 0.00, 1.08, 0.15], ['c', 0.06, 0.03, 0.06, 0.36, -0.03, 5.25], ['c', -0.06, 2.85, -0.09, 5.19, -0.09, 5.19], ['c', 0.00, 0.03, 0.12, -0.03, 0.24, -0.12], ['c', 0.63, -0.42, 1.41, -0.66, 2.19, -0.72], ['c', 0.81, -0.03, 1.47, 0.21, 2.04, 0.78], ['c', 0.57, 0.54, 0.87, 1.26, 0.93, 2.04], ['c', 0.03, 0.57, -0.09, 1.08, -0.36, 1.62], ['c', -0.42, 0.81, -1.02, 1.38, -2.82, 2.61], ['c', -1.14, 0.78, -1.44, 1.02, -1.80, 1.44], ['c', -0.18, 0.18, -0.39, 0.39, -0.45, 0.42], ['c', -0.27, 0.18, -0.57, 0.15, -0.81, -0.06], ['c', -0.06, -0.09, -0.12, -0.18, -0.15, -0.27], ['c', -0.03, -0.06, -0.09, -3.27, -0.18, -8.34], ['c', -0.09, -4.53, -0.15, -8.58, -0.18, -9.03], ['l', 0.00, -0.78], ['l', 0.12, -0.06], ['c', 0.06, -0.03, 0.18, -0.09, 0.27, -0.12], ['z'], ['m', 3.18, 11.01], ['c', -0.21, -0.12, -0.54, -0.15, -0.81, -0.06], ['c', -0.54, 0.15, -0.99, 0.63, -1.17, 1.26], ['c', -0.06, 0.30, -0.12, 2.88, -0.06, 3.87], ['c', 0.03, 0.42, 0.03, 0.81, 0.06, 0.90], ['l', 0.03, 0.12], ['l', 0.45, -0.39], ['c', 0.63, -0.54, 1.26, -1.17, 1.56, -1.59], ['c', 0.30, -0.42, 0.60, -0.99, 0.72, -1.41], ['c', 0.18, -0.69, 0.09, -1.47, -0.18, -2.07], ['c', -0.15, -0.30, -0.33, -0.51, -0.60, -0.63], ['z'], ['m', 3, -11], ['c', 0.33, -0.06, 0.87, 0.00, 1.08, 0.15], ['c', 0.06, 0.03, 0.06, 0.36, -0.03, 5.25], ['c', -0.06, 2.85, -0.09, 5.19, -0.09, 5.19], ['c', 0.00, 0.03, 0.12, -0.03, 0.24, -0.12], ['c', 0.63, -0.42, 1.41, -0.66, 2.19, -0.72], ['c', 0.81, -0.03, 1.47, 0.21, 2.04, 0.78], ['c', 0.57, 0.54, 0.87, 1.26, 0.93, 2.04], ['c', 0.03, 0.57, -0.09, 1.08, -0.36, 1.62], ['c', -0.42, 0.81, -1.02, 1.38, -2.82, 2.61], ['c', -1.14, 0.78, -1.44, 1.02, -1.80, 1.44], ['c', -0.18, 0.18, -0.39, 0.39, -0.45, 0.42], ['c', -0.27, 0.18, -0.57, 0.15, -0.81, -0.06], ['c', -0.06, -0.09, -0.12, -0.18, -0.15, -0.27], ['c', -0.03, -0.06, -0.09, -3.27, -0.18, -8.34], ['c', -0.09, -4.53, -0.15, -8.58, -0.18, -9.03], ['l', 0.00, -0.78], ['l', 0.12, -0.06], ['c', 0.06, -0.03, 0.18, -0.09, 0.27, -0.12], ['z'], ['m', 3.18, 11.01], ['c', -0.21, -0.12, -0.54, -0.15, -0.81, -0.06], ['c', -0.54, 0.15, -0.99, 0.63, -1.17, 1.26], ['c', -0.06, 0.30, -0.12, 2.88, -0.06, 3.87], ['c', 0.03, 0.42, 0.03, 0.81, 0.06, 0.90], ['l', 0.03, 0.12], ['l', 0.45, -0.39], ['c', 0.63, -0.54, 1.26, -1.17, 1.56, -1.59], ['c', 0.30, -0.42, 0.60, -0.99, 0.72, -1.41], ['c', 0.18, -0.69, 0.09, -1.47, -0.18, -2.07], ['c', -0.15, -0.30, -0.33, -0.51, -0.60, -0.63], ['z']],
    w: 12.1,
    h: 18.804
  },
  'accidentals.dblsharp': {
    d: [['M', -0.18, -3.96], ['c', 0.06, -0.03, 0.12, -0.06, 0.15, -0.06], ['c', 0.09, 0.00, 2.76, 0.27, 2.79, 0.30], ['c', 0.12, 0.03, 0.15, 0.12, 0.15, 0.51], ['c', 0.06, 0.96, 0.24, 1.59, 0.57, 2.10], ['c', 0.06, 0.09, 0.15, 0.21, 0.18, 0.24], ['l', 0.09, 0.06], ['l', 0.09, -0.06], ['c', 0.03, -0.03, 0.12, -0.15, 0.18, -0.24], ['c', 0.33, -0.51, 0.51, -1.14, 0.57, -2.10], ['c', 0.00, -0.39, 0.03, -0.45, 0.12, -0.51], ['c', 0.03, 0.00, 0.66, -0.09, 1.44, -0.15], ['c', 1.47, -0.15, 1.50, -0.15, 1.56, -0.03], ['c', 0.03, 0.06, 0.00, 0.42, -0.09, 1.44], ['c', -0.09, 0.72, -0.15, 1.35, -0.15, 1.38], ['c', 0.00, 0.03, -0.03, 0.09, -0.06, 0.12], ['c', -0.06, 0.06, -0.12, 0.09, -0.51, 0.09], ['c', -1.08, 0.06, -1.80, 0.30, -2.28, 0.75], ['l', -0.12, 0.09], ['l', 0.09, 0.09], ['c', 0.12, 0.15, 0.39, 0.33, 0.63, 0.45], ['c', 0.42, 0.18, 0.96, 0.27, 1.68, 0.33], ['c', 0.39, 0.00, 0.45, 0.03, 0.51, 0.09], ['c', 0.03, 0.03, 0.06, 0.09, 0.06, 0.12], ['c', 0.00, 0.03, 0.06, 0.66, 0.15, 1.38], ['c', 0.09, 1.02, 0.12, 1.38, 0.09, 1.44], ['c', -0.06, 0.12, -0.09, 0.12, -1.56, -0.03], ['c', -0.78, -0.06, -1.41, -0.15, -1.44, -0.15], ['c', -0.09, -0.06, -0.12, -0.12, -0.12, -0.54], ['c', -0.06, -0.93, -0.24, -1.56, -0.57, -2.07], ['c', -0.06, -0.09, -0.15, -0.21, -0.18, -0.24], ['l', -0.09, -0.06], ['l', -0.09, 0.06], ['c', -0.03, 0.03, -0.12, 0.15, -0.18, 0.24], ['c', -0.33, 0.51, -0.51, 1.14, -0.57, 2.07], ['c', 0.00, 0.42, -0.03, 0.48, -0.12, 0.54], ['c', -0.03, 0.00, -0.66, 0.09, -1.44, 0.15], ['c', -1.47, 0.15, -1.50, 0.15, -1.56, 0.03], ['c', -0.03, -0.06, 0.00, -0.42, 0.09, -1.44], ['c', 0.09, -0.72, 0.15, -1.35, 0.15, -1.38], ['c', 0.00, -0.03, 0.03, -0.09, 0.06, -0.12], ['c', 0.06, -0.06, 0.12, -0.09, 0.51, -0.09], ['c', 0.72, -0.06, 1.26, -0.15, 1.68, -0.33], ['c', 0.24, -0.12, 0.51, -0.30, 0.63, -0.45], ['l', 0.09, -0.09], ['l', -0.12, -0.09], ['c', -0.48, -0.45, -1.20, -0.69, -2.28, -0.75], ['c', -0.39, 0.00, -0.45, -0.03, -0.51, -0.09], ['c', -0.03, -0.03, -0.06, -0.09, -0.06, -0.12], ['c', 0.00, -0.03, -0.06, -0.63, -0.12, -1.38], ['c', -0.09, -0.72, -0.15, -1.35, -0.15, -1.38], ['z']],
    w: 7.95,
    h: 7.977
  },
  'dots.dot': {
    d: [['M', 1.32, -1.68], ['c', 0.09, -0.03, 0.27, -0.06, 0.39, -0.06], ['c', 0.96, 0.00, 1.74, 0.78, 1.74, 1.71], ['c', 0.00, 0.96, -0.78, 1.74, -1.71, 1.74], ['c', -0.96, 0.00, -1.74, -0.78, -1.74, -1.71], ['c', 0.00, -0.78, 0.54, -1.50, 1.32, -1.68], ['z']],
    w: 3.45,
    h: 3.45
  },
  'noteheads.dbl': {
    d: [['M', -0.69, -4.02], ['c', 0.18, -0.09, 0.36, -0.09, 0.54, 0.00], ['c', 0.18, 0.09, 0.24, 0.15, 0.33, 0.30], ['c', 0.06, 0.15, 0.06, 0.18, 0.06, 1.41], ['l', 0.00, 1.23], ['l', 0.12, -0.18], ['c', 0.72, -1.26, 2.64, -2.31, 4.86, -2.64], ['c', 0.81, -0.15, 1.11, -0.15, 2.13, -0.15], ['c', 0.99, 0.00, 1.29, 0.00, 2.10, 0.15], ['c', 0.75, 0.12, 1.38, 0.27, 2.04, 0.54], ['c', 1.35, 0.51, 2.34, 1.26, 2.82, 2.10], ['l', 0.12, 0.18], ['l', 0.00, -1.23], ['c', 0.00, -1.20, 0.00, -1.26, 0.06, -1.38], ['c', 0.09, -0.18, 0.15, -0.24, 0.33, -0.33], ['c', 0.18, -0.09, 0.36, -0.09, 0.54, 0.00], ['c', 0.18, 0.09, 0.24, 0.15, 0.33, 0.30], ['l', 0.06, 0.15], ['l', 0.00, 3.54], ['l', 0.00, 3.54], ['l', -0.06, 0.15], ['c', -0.09, 0.18, -0.15, 0.24, -0.33, 0.33], ['c', -0.18, 0.09, -0.36, 0.09, -0.54, 0.00], ['c', -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ['c', -0.06, -0.12, -0.06, -0.18, -0.06, -1.38], ['l', 0.00, -1.23], ['l', -0.12, 0.18], ['c', -0.48, 0.84, -1.47, 1.59, -2.82, 2.10], ['c', -0.84, 0.33, -1.71, 0.54, -2.85, 0.66], ['c', -0.45, 0.06, -2.16, 0.06, -2.61, 0.00], ['c', -1.14, -0.12, -2.01, -0.33, -2.85, -0.66], ['c', -1.35, -0.51, -2.34, -1.26, -2.82, -2.10], ['l', -0.12, -0.18], ['l', 0.00, 1.23], ['c', 0.00, 1.23, 0.00, 1.26, -0.06, 1.38], ['c', -0.09, 0.18, -0.15, 0.24, -0.33, 0.33], ['c', -0.18, 0.09, -0.36, 0.09, -0.54, 0.00], ['c', -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ['l', -0.06, -0.15], ['l', 0.00, -3.54], ['c', 0.00, -3.48, 0.00, -3.54, 0.06, -3.66], ['c', 0.09, -0.18, 0.15, -0.24, 0.33, -0.33], ['z'], ['m', 7.71, 0.63], ['c', -0.36, -0.06, -0.90, -0.06, -1.14, 0.00], ['c', -0.30, 0.03, -0.66, 0.24, -0.87, 0.42], ['c', -0.60, 0.54, -0.90, 1.62, -0.75, 2.82], ['c', 0.12, 0.93, 0.51, 1.68, 1.11, 2.31], ['c', 0.75, 0.72, 1.83, 1.20, 2.85, 1.26], ['c', 1.05, 0.06, 1.83, -0.54, 2.10, -1.65], ['c', 0.21, -0.90, 0.12, -1.95, -0.24, -2.82], ['c', -0.36, -0.81, -1.08, -1.53, -1.95, -1.95], ['c', -0.30, -0.15, -0.78, -0.30, -1.11, -0.39], ['z']],
    w: 16.83,
    h: 8.145
  },
  'noteheads.whole': {
    d: [['M', 6.51, -4.05], ['c', 0.51, -0.03, 2.01, 0.00, 2.52, 0.03], ['c', 1.41, 0.18, 2.64, 0.51, 3.72, 1.08], ['c', 1.20, 0.63, 1.95, 1.41, 2.19, 2.31], ['c', 0.09, 0.33, 0.09, 0.90, 0.00, 1.23], ['c', -0.24, 0.90, -0.99, 1.68, -2.19, 2.31], ['c', -1.08, 0.57, -2.28, 0.90, -3.75, 1.08], ['c', -0.66, 0.06, -2.31, 0.06, -2.97, 0.00], ['c', -1.47, -0.18, -2.67, -0.51, -3.75, -1.08], ['c', -1.20, -0.63, -1.95, -1.41, -2.19, -2.31], ['c', -0.09, -0.33, -0.09, -0.90, 0.00, -1.23], ['c', 0.24, -0.90, 0.99, -1.68, 2.19, -2.31], ['c', 1.20, -0.63, 2.61, -0.99, 4.23, -1.11], ['z'], ['m', 0.57, 0.66], ['c', -0.87, -0.15, -1.53, 0.00, -2.04, 0.51], ['c', -0.15, 0.15, -0.24, 0.27, -0.33, 0.48], ['c', -0.24, 0.51, -0.36, 1.08, -0.33, 1.77], ['c', 0.03, 0.69, 0.18, 1.26, 0.42, 1.77], ['c', 0.60, 1.17, 1.74, 1.98, 3.18, 2.22], ['c', 1.11, 0.21, 1.95, -0.15, 2.34, -0.99], ['c', 0.24, -0.51, 0.36, -1.08, 0.33, -1.80], ['c', -0.06, -1.11, -0.45, -2.04, -1.17, -2.76], ['c', -0.63, -0.63, -1.47, -1.05, -2.40, -1.20], ['z']],
    w: 14.985,
    h: 8.097
  },
  'noteheads.half': {
    d: [['M', 7.44, -4.05], ['c', 0.06, -0.03, 0.27, -0.03, 0.48, -0.03], ['c', 1.05, 0.00, 1.71, 0.24, 2.10, 0.81], ['c', 0.42, 0.60, 0.45, 1.35, 0.18, 2.40], ['c', -0.42, 1.59, -1.14, 2.73, -2.16, 3.39], ['c', -1.41, 0.93, -3.18, 1.44, -5.40, 1.53], ['c', -1.17, 0.03, -1.89, -0.21, -2.28, -0.81], ['c', -0.42, -0.60, -0.45, -1.35, -0.18, -2.40], ['c', 0.42, -1.59, 1.14, -2.73, 2.16, -3.39], ['c', 0.63, -0.42, 1.23, -0.72, 1.98, -0.96], ['c', 0.90, -0.30, 1.65, -0.42, 3.12, -0.54], ['z'], ['m', 1.29, 0.87], ['c', -0.27, -0.09, -0.63, -0.12, -0.90, -0.03], ['c', -0.72, 0.24, -1.53, 0.69, -3.27, 1.80], ['c', -2.34, 1.50, -3.30, 2.25, -3.57, 2.79], ['c', -0.36, 0.72, -0.06, 1.50, 0.66, 1.77], ['c', 0.24, 0.12, 0.69, 0.09, 0.99, 0.00], ['c', 0.84, -0.30, 1.92, -0.93, 4.14, -2.37], ['c', 1.62, -1.08, 2.37, -1.71, 2.61, -2.19], ['c', 0.36, -0.72, 0.06, -1.50, -0.66, -1.77], ['z']],
    w: 10.37,
    h: 8.132
  },
  'noteheads.quarter': {
    d: [['M', 6.09, -4.05], ['c', 0.36, -0.03, 1.20, 0.00, 1.53, 0.06], ['c', 1.17, 0.24, 1.89, 0.84, 2.16, 1.83], ['c', 0.06, 0.18, 0.06, 0.30, 0.06, 0.66], ['c', 0.00, 0.45, 0.00, 0.63, -0.15, 1.08], ['c', -0.66, 2.04, -3.06, 3.93, -5.52, 4.38], ['c', -0.54, 0.09, -1.44, 0.09, -1.83, 0.03], ['c', -1.23, -0.27, -1.98, -0.87, -2.25, -1.86], ['c', -0.06, -0.18, -0.06, -0.30, -0.06, -0.66], ['c', 0.00, -0.45, 0.00, -0.63, 0.15, -1.08], ['c', 0.24, -0.78, 0.75, -1.53, 1.44, -2.22], ['c', 1.20, -1.20, 2.85, -2.01, 4.47, -2.22], ['z']],
    w: 9.81,
    h: 8.094
  },
  'noteheads.slash.nostem': {
    d: [['M', 9.30, -7.77], ['c', 0.06, -0.06, 0.18, -0.06, 1.71, -0.06], ['l', 1.65, 0.00], ['l', 0.09, 0.09], ['c', 0.06, 0.06, 0.06, 0.09, 0.06, 0.15], ['c', -0.03, 0.12, -9.21, 15.24, -9.30, 15.33], ['c', -0.06, 0.06, -0.18, 0.06, -1.71, 0.06], ['l', -1.65, 0.00], ['l', -0.09, -0.09], ['c', -0.06, -0.06, -0.06, -0.09, -0.06, -0.15], ['c', 0.03, -0.12, 9.21, -15.24, 9.30, -15.33], ['z']],
    w: 12.81,
    h: 15.63
  },
  'noteheads.indeterminate': {
    d: [['M', 0.78, -4.05], ['c', 0.12, -0.03, 0.24, -0.03, 0.36, 0.03], ['c', 0.03, 0.03, 0.93, 0.72, 1.95, 1.56], ['l', 1.86, 1.50], ['l', 1.86, -1.50], ['c', 1.02, -0.84, 1.92, -1.53, 1.95, -1.56], ['c', 0.21, -0.12, 0.33, -0.09, 0.75, 0.24], ['c', 0.30, 0.27, 0.36, 0.36, 0.36, 0.54], ['c', 0.00, 0.03, -0.03, 0.12, -0.06, 0.18], ['c', -0.03, 0.06, -0.90, 0.75, -1.89, 1.56], ['l', -1.80, 1.47], ['c', 0.00, 0.03, 0.81, 0.69, 1.80, 1.50], ['c', 0.99, 0.81, 1.86, 1.50, 1.89, 1.56], ['c', 0.03, 0.06, 0.06, 0.15, 0.06, 0.18], ['c', 0.00, 0.18, -0.06, 0.27, -0.36, 0.54], ['c', -0.42, 0.33, -0.54, 0.36, -0.75, 0.24], ['c', -0.03, -0.03, -0.93, -0.72, -1.95, -1.56], ['l', -1.86, -1.50], ['l', -1.86, 1.50], ['c', -1.02, 0.84, -1.92, 1.53, -1.95, 1.56], ['c', -0.21, 0.12, -0.33, 0.09, -0.75, -0.24], ['c', -0.30, -0.27, -0.36, -0.36, -0.36, -0.54], ['c', 0.00, -0.03, 0.03, -0.12, 0.06, -0.18], ['c', 0.03, -0.06, 0.90, -0.75, 1.89, -1.56], ['l', 1.80, -1.47], ['c', 0.00, -0.03, -0.81, -0.69, -1.80, -1.50], ['c', -0.99, -0.81, -1.86, -1.50, -1.89, -1.56], ['c', -0.06, -0.12, -0.09, -0.21, -0.03, -0.36], ['c', 0.03, -0.09, 0.57, -0.57, 0.72, -0.63], ['z']],
    w: 9.843,
    h: 8.139
  },
  'scripts.ufermata': {
    d: [['M', -0.75, -10.77], ['c', 0.12, 0.00, 0.45, -0.03, 0.69, -0.03], ['c', 2.91, -0.03, 5.55, 1.53, 7.41, 4.35], ['c', 1.17, 1.71, 1.95, 3.72, 2.43, 6.03], ['c', 0.12, 0.51, 0.12, 0.57, 0.03, 0.69], ['c', -0.12, 0.21, -0.48, 0.27, -0.69, 0.12], ['c', -0.12, -0.09, -0.18, -0.24, -0.27, -0.69], ['c', -0.78, -3.63, -3.42, -6.54, -6.78, -7.38], ['c', -0.78, -0.21, -1.20, -0.24, -2.07, -0.24], ['c', -0.63, 0.00, -0.84, 0.00, -1.20, 0.06], ['c', -1.83, 0.27, -3.42, 1.08, -4.80, 2.37], ['c', -1.41, 1.35, -2.40, 3.21, -2.85, 5.19], ['c', -0.09, 0.45, -0.15, 0.60, -0.27, 0.69], ['c', -0.21, 0.15, -0.57, 0.09, -0.69, -0.12], ['c', -0.09, -0.12, -0.09, -0.18, 0.03, -0.69], ['c', 0.33, -1.62, 0.78, -3.00, 1.47, -4.38], ['c', 1.77, -3.54, 4.44, -5.67, 7.56, -5.97], ['z'], ['m', 0.33, 7.47], ['c', 1.38, -0.30, 2.58, 0.90, 2.31, 2.25], ['c', -0.15, 0.72, -0.78, 1.35, -1.47, 1.50], ['c', -1.38, 0.27, -2.58, -0.93, -2.31, -2.31], ['c', 0.15, -0.69, 0.78, -1.29, 1.47, -1.44], ['z']],
    w: 19.748,
    h: 11.289
  },
  'scripts.dfermata': {
    d: [['M', -9.63, -0.42], ['c', 0.15, -0.09, 0.36, -0.06, 0.51, 0.03], ['c', 0.12, 0.09, 0.18, 0.24, 0.27, 0.66], ['c', 0.78, 3.66, 3.42, 6.57, 6.78, 7.41], ['c', 0.78, 0.21, 1.20, 0.24, 2.07, 0.24], ['c', 0.63, 0.00, 0.84, 0.00, 1.20, -0.06], ['c', 1.83, -0.27, 3.42, -1.08, 4.80, -2.37], ['c', 1.41, -1.35, 2.40, -3.21, 2.85, -5.22], ['c', 0.09, -0.42, 0.15, -0.57, 0.27, -0.66], ['c', 0.21, -0.15, 0.57, -0.09, 0.69, 0.12], ['c', 0.09, 0.12, 0.09, 0.18, -0.03, 0.69], ['c', -0.33, 1.62, -0.78, 3.00, -1.47, 4.38], ['c', -1.92, 3.84, -4.89, 6.00, -8.31, 6.00], ['c', -3.42, 0.00, -6.39, -2.16, -8.31, -6.00], ['c', -0.48, -0.96, -0.84, -1.92, -1.14, -2.97], ['c', -0.18, -0.69, -0.42, -1.74, -0.42, -1.92], ['c', 0.00, -0.12, 0.09, -0.27, 0.24, -0.33], ['z'], ['m', 9.21, 0.00], ['c', 1.20, -0.27, 2.34, 0.63, 2.34, 1.86], ['c', 0.00, 0.90, -0.66, 1.68, -1.50, 1.89], ['c', -1.38, 0.27, -2.58, -0.93, -2.31, -2.31], ['c', 0.15, -0.69, 0.78, -1.29, 1.47, -1.44], ['z']],
    w: 19.744,
    h: 11.274
  },
  'scripts.sforzato': {
    d: [['M', -6.45, -3.69], ['c', 0.06, -0.03, 0.15, -0.06, 0.18, -0.06], ['c', 0.06, 0.00, 2.85, 0.72, 6.24, 1.59], ['l', 6.33, 1.65], ['c', 0.33, 0.06, 0.45, 0.21, 0.45, 0.51], ['c', 0.00, 0.30, -0.12, 0.45, -0.45, 0.51], ['l', -6.33, 1.65], ['c', -3.39, 0.87, -6.18, 1.59, -6.21, 1.59], ['c', -0.21, 0.00, -0.48, -0.24, -0.51, -0.45], ['c', 0.00, -0.15, 0.06, -0.36, 0.18, -0.45], ['c', 0.09, -0.06, 0.87, -0.27, 3.84, -1.05], ['c', 2.04, -0.54, 3.84, -0.99, 4.02, -1.02], ['c', 0.15, -0.06, 1.14, -0.24, 2.22, -0.42], ['c', 1.05, -0.18, 1.92, -0.36, 1.92, -0.36], ['c', 0.00, 0.00, -0.87, -0.18, -1.92, -0.36], ['c', -1.08, -0.18, -2.07, -0.36, -2.22, -0.42], ['c', -0.18, -0.03, -1.98, -0.48, -4.02, -1.02], ['c', -2.97, -0.78, -3.75, -0.99, -3.84, -1.05], ['c', -0.12, -0.09, -0.18, -0.30, -0.18, -0.45], ['c', 0.03, -0.15, 0.15, -0.30, 0.30, -0.39], ['z']],
    w: 13.5,
    h: 7.5
  },
  'scripts.staccato': {
    d: [['M', -0.36, -1.47], ['c', 0.93, -0.21, 1.86, 0.51, 1.86, 1.47], ['c', 0.00, 0.93, -0.87, 1.65, -1.80, 1.47], ['c', -0.54, -0.12, -1.02, -0.57, -1.14, -1.08], ['c', -0.21, -0.81, 0.27, -1.65, 1.08, -1.86], ['z']],
    w: 2.989,
    h: 3.004
  },
  'scripts.tenuto': {
    d: [['M', -4.20, -0.48], ['l', 0.12, -0.06], ['l', 4.08, 0.00], ['l', 4.08, 0.00], ['l', 0.12, 0.06], ['c', 0.39, 0.21, 0.39, 0.75, 0.00, 0.96], ['l', -0.12, 0.06], ['l', -4.08, 0.00], ['l', -4.08, 0.00], ['l', -0.12, -0.06], ['c', -0.39, -0.21, -0.39, -0.75, 0.00, -0.96], ['z']],
    w: 8.985,
    h: 1.08
  },
  'scripts.umarcato': {
    d: [['M', -0.15, -8.19], ['c', 0.15, -0.12, 0.36, -0.03, 0.45, 0.15], ['c', 0.21, 0.42, 3.45, 7.65, 3.45, 7.71], ['c', 0.00, 0.12, -0.12, 0.27, -0.21, 0.30], ['c', -0.03, 0.03, -0.51, 0.03, -1.14, 0.03], ['c', -1.05, 0.00, -1.08, 0.00, -1.17, -0.06], ['c', -0.09, -0.06, -0.24, -0.36, -1.17, -2.40], ['c', -0.57, -1.29, -1.05, -2.34, -1.08, -2.34], ['c', 0.00, -0.03, -0.51, 1.02, -1.08, 2.34], ['c', -0.93, 2.07, -1.08, 2.34, -1.14, 2.40], ['c', -0.06, 0.03, -0.15, 0.06, -0.18, 0.06], ['c', -0.15, 0.00, -0.33, -0.18, -0.33, -0.33], ['c', 0.00, -0.06, 3.24, -7.32, 3.45, -7.71], ['c', 0.03, -0.06, 0.09, -0.15, 0.15, -0.15], ['z']],
    w: 7.5,
    h: 8.245
  },
  'scripts.dmarcato': {
    d: [['M', -3.57, 0.03], ['c', 0.03, 0.00, 0.57, -0.03, 1.17, -0.03], ['c', 1.05, 0.00, 1.08, 0.00, 1.17, 0.06], ['c', 0.09, 0.06, 0.24, 0.36, 1.17, 2.40], ['c', 0.57, 1.29, 1.05, 2.34, 1.08, 2.34], ['c', 0.00, 0.03, 0.51, -1.02, 1.08, -2.34], ['c', 0.93, -2.07, 1.08, -2.34, 1.14, -2.40], ['c', 0.06, -0.03, 0.15, -0.06, 0.18, -0.06], ['c', 0.15, 0.00, 0.33, 0.18, 0.33, 0.33], ['c', 0.00, 0.09, -3.45, 7.74, -3.54, 7.83], ['c', -0.12, 0.12, -0.30, 0.12, -0.42, 0.00], ['c', -0.09, -0.09, -3.54, -7.74, -3.54, -7.83], ['c', 0.00, -0.09, 0.12, -0.27, 0.18, -0.30], ['z']],
    w: 7.5,
    h: 8.25
  },
  'scripts.stopped': {
    d: [['M', -0.27, -4.08], ['c', 0.18, -0.09, 0.36, -0.09, 0.54, 0.00], ['c', 0.18, 0.09, 0.24, 0.15, 0.33, 0.30], ['l', 0.06, 0.15], ['l', 0.00, 1.50], ['l', 0.00, 1.47], ['l', 1.47, 0.00], ['l', 1.50, 0.00], ['l', 0.15, 0.06], ['c', 0.15, 0.09, 0.21, 0.15, 0.30, 0.33], ['c', 0.09, 0.18, 0.09, 0.36, 0.00, 0.54], ['c', -0.09, 0.18, -0.15, 0.24, -0.33, 0.33], ['c', -0.12, 0.06, -0.18, 0.06, -1.62, 0.06], ['l', -1.47, 0.00], ['l', 0.00, 1.47], ['l', 0.00, 1.47], ['l', -0.06, 0.15], ['c', -0.09, 0.18, -0.15, 0.24, -0.33, 0.33], ['c', -0.18, 0.09, -0.36, 0.09, -0.54, 0.00], ['c', -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ['l', -0.06, -0.15], ['l', 0.00, -1.47], ['l', 0.00, -1.47], ['l', -1.47, 0.00], ['c', -1.44, 0.00, -1.50, 0.00, -1.62, -0.06], ['c', -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ['c', -0.09, -0.18, -0.09, -0.36, 0.00, -0.54], ['c', 0.09, -0.18, 0.15, -0.24, 0.33, -0.33], ['l', 0.15, -0.06], ['l', 1.47, 0.00], ['l', 1.47, 0.00], ['l', 0.00, -1.47], ['c', 0.00, -1.44, 0.00, -1.50, 0.06, -1.62], ['c', 0.09, -0.18, 0.15, -0.24, 0.33, -0.33], ['z']],
    w: 8.295,
    h: 8.295
  },
  'scripts.upbow': {
    d: [['M', -4.65, -15.54], ['c', 0.12, -0.09, 0.36, -0.06, 0.48, 0.03], ['c', 0.03, 0.03, 0.09, 0.09, 0.12, 0.15], ['c', 0.03, 0.06, 0.66, 2.13, 1.41, 4.62], ['c', 1.35, 4.41, 1.38, 4.56, 2.01, 6.96], ['l', 0.63, 2.46], ['l', 0.63, -2.46], ['c', 0.63, -2.40, 0.66, -2.55, 2.01, -6.96], ['c', 0.75, -2.49, 1.38, -4.56, 1.41, -4.62], ['c', 0.06, -0.15, 0.18, -0.21, 0.36, -0.24], ['c', 0.15, 0.00, 0.30, 0.06, 0.39, 0.18], ['c', 0.15, 0.21, 0.24, -0.18, -2.10, 7.56], ['c', -1.20, 3.96, -2.22, 7.32, -2.25, 7.41], ['c', 0.00, 0.12, -0.06, 0.27, -0.09, 0.30], ['c', -0.12, 0.21, -0.60, 0.21, -0.72, 0.00], ['c', -0.03, -0.03, -0.09, -0.18, -0.09, -0.30], ['c', -0.03, -0.09, -1.05, -3.45, -2.25, -7.41], ['c', -2.34, -7.74, -2.25, -7.35, -2.10, -7.56], ['c', 0.03, -0.03, 0.09, -0.09, 0.15, -0.12], ['z']],
    w: 9.73,
    h: 15.608
  },
  'scripts.downbow': {
    d: [['M', -5.55, -9.93], ['l', 0.09, -0.06], ['l', 5.46, 0.00], ['l', 5.46, 0.00], ['l', 0.09, 0.06], ['l', 0.06, 0.09], ['l', 0.00, 4.77], ['c', 0.00, 5.28, 0.00, 4.89, -0.18, 5.01], ['c', -0.18, 0.12, -0.42, 0.06, -0.54, -0.12], ['c', -0.06, -0.09, -0.06, -0.18, -0.06, -2.97], ['l', 0.00, -2.85], ['l', -4.83, 0.00], ['l', -4.83, 0.00], ['l', 0.00, 2.85], ['c', 0.00, 2.79, 0.00, 2.88, -0.06, 2.97], ['c', -0.15, 0.24, -0.51, 0.24, -0.66, 0.00], ['c', -0.06, -0.09, -0.06, -0.21, -0.06, -4.89], ['l', 0.00, -4.77], ['z']],
    w: 11.22,
    h: 9.992
  },
  'scripts.turn': {
    d: [['M', -4.77, -3.90], ['c', 0.36, -0.06, 1.05, -0.06, 1.44, 0.03], ['c', 0.78, 0.15, 1.50, 0.51, 2.34, 1.14], ['c', 0.60, 0.45, 1.05, 0.87, 2.22, 2.01], ['c', 1.11, 1.08, 1.62, 1.50, 2.22, 1.86], ['c', 0.60, 0.36, 1.32, 0.57, 1.92, 0.57], ['c', 0.90, 0.00, 1.71, -0.57, 1.89, -1.35], ['c', 0.24, -0.93, -0.39, -1.89, -1.35, -2.10], ['l', -0.15, -0.06], ['l', -0.09, 0.15], ['c', -0.03, 0.09, -0.15, 0.24, -0.24, 0.33], ['c', -0.72, 0.72, -2.04, 0.54, -2.49, -0.36], ['c', -0.48, -0.93, 0.03, -1.86, 1.17, -2.19], ['c', 0.30, -0.09, 1.02, -0.09, 1.35, 0.00], ['c', 0.99, 0.27, 1.74, 0.87, 2.25, 1.83], ['c', 0.69, 1.41, 0.63, 3.00, -0.21, 4.26], ['c', -0.21, 0.30, -0.69, 0.81, -0.99, 1.02], ['c', -0.30, 0.21, -0.84, 0.45, -1.17, 0.54], ['c', -1.23, 0.36, -2.49, 0.15, -3.72, -0.60], ['c', -0.75, -0.48, -1.41, -1.02, -2.85, -2.46], ['c', -1.11, -1.08, -1.62, -1.50, -2.22, -1.86], ['c', -0.60, -0.36, -1.32, -0.57, -1.92, -0.57], ['c', -0.90, 0.00, -1.71, 0.57, -1.89, 1.35], ['c', -0.24, 0.93, 0.39, 1.89, 1.35, 2.10], ['l', 0.15, 0.06], ['l', 0.09, -0.15], ['c', 0.03, -0.09, 0.15, -0.24, 0.24, -0.33], ['c', 0.72, -0.72, 2.04, -0.54, 2.49, 0.36], ['c', 0.48, 0.93, -0.03, 1.86, -1.17, 2.19], ['c', -0.30, 0.09, -1.02, 0.09, -1.35, 0.00], ['c', -0.99, -0.27, -1.74, -0.87, -2.25, -1.83], ['c', -0.69, -1.41, -0.63, -3.00, 0.21, -4.26], ['c', 0.21, -0.30, 0.69, -0.81, 0.99, -1.02], ['c', 0.48, -0.33, 1.11, -0.57, 1.74, -0.66], ['z']],
    w: 16.366,
    h: 7.893
  },
  'scripts.trill': {
    d: [['M', -0.51, -16.02], ['c', 0.12, -0.09, 0.21, -0.18, 0.21, -0.18], ['l', -0.81, 4.02], ['l', -0.81, 4.02], ['c', 0.03, 0.00, 0.51, -0.27, 1.08, -0.60], ['c', 0.60, -0.30, 1.14, -0.63, 1.26, -0.66], ['c', 1.14, -0.54, 2.31, -0.60, 3.09, -0.18], ['c', 0.27, 0.15, 0.54, 0.36, 0.60, 0.51], ['l', 0.06, 0.12], ['l', 0.21, -0.21], ['c', 0.90, -0.81, 2.22, -0.99, 3.12, -0.42], ['c', 0.60, 0.42, 0.90, 1.14, 0.78, 2.07], ['c', -0.15, 1.29, -1.05, 2.31, -1.95, 2.25], ['c', -0.48, -0.03, -0.78, -0.30, -0.96, -0.81], ['c', -0.09, -0.27, -0.09, -0.90, -0.03, -1.20], ['c', 0.21, -0.75, 0.81, -1.23, 1.59, -1.32], ['l', 0.24, -0.03], ['l', -0.09, -0.12], ['c', -0.51, -0.66, -1.62, -0.63, -2.31, 0.03], ['c', -0.39, 0.42, -0.30, 0.09, -1.23, 4.77], ['l', -0.81, 4.14], ['c', -0.03, 0.00, -0.12, -0.03, -0.21, -0.09], ['c', -0.33, -0.15, -0.54, -0.18, -0.99, -0.18], ['c', -0.42, 0.00, -0.66, 0.03, -1.05, 0.18], ['c', -0.12, 0.06, -0.21, 0.09, -0.21, 0.09], ['c', 0.00, -0.03, 0.36, -1.86, 0.81, -4.11], ['c', 0.90, -4.47, 0.87, -4.26, 0.69, -4.53], ['c', -0.21, -0.36, -0.66, -0.51, -1.17, -0.36], ['c', -0.15, 0.06, -2.22, 1.14, -2.58, 1.38], ['c', -0.12, 0.09, -0.12, 0.09, -0.21, 0.60], ['l', -0.09, 0.51], ['l', 0.21, 0.24], ['c', 0.63, 0.75, 1.02, 1.47, 1.20, 2.19], ['c', 0.06, 0.27, 0.06, 0.36, 0.06, 0.81], ['c', 0.00, 0.42, 0.00, 0.54, -0.06, 0.78], ['c', -0.15, 0.54, -0.33, 0.93, -0.63, 1.35], ['c', -0.18, 0.24, -0.57, 0.63, -0.81, 0.78], ['c', -0.24, 0.15, -0.63, 0.36, -0.84, 0.42], ['c', -0.27, 0.06, -0.66, 0.06, -0.87, 0.03], ['c', -0.81, -0.18, -1.32, -1.05, -1.38, -2.46], ['c', -0.03, -0.60, 0.03, -0.99, 0.33, -2.46], ['c', 0.21, -1.08, 0.24, -1.32, 0.21, -1.29], ['c', -1.20, 0.48, -2.40, 0.75, -3.21, 0.72], ['c', -0.69, -0.06, -1.17, -0.30, -1.41, -0.72], ['c', -0.39, -0.75, -0.12, -1.80, 0.66, -2.46], ['c', 0.24, -0.18, 0.69, -0.42, 1.02, -0.51], ['c', 0.69, -0.18, 1.53, -0.15, 2.31, 0.09], ['c', 0.30, 0.09, 0.75, 0.30, 0.99, 0.45], ['c', 0.12, 0.09, 0.15, 0.09, 0.15, 0.03], ['c', 0.03, -0.03, 0.33, -1.59, 0.72, -3.45], ['c', 0.36, -1.86, 0.66, -3.42, 0.69, -3.45], ['c', 0.00, -0.03, 0.03, -0.03, 0.21, 0.03], ['c', 0.21, 0.06, 0.27, 0.06, 0.48, 0.06], ['c', 0.42, -0.03, 0.78, -0.18, 1.26, -0.48], ['c', 0.15, -0.12, 0.36, -0.27, 0.48, -0.39], ['z'], ['m', -5.73, 7.68], ['c', -0.27, -0.03, -0.96, -0.06, -1.20, -0.03], ['c', -0.81, 0.12, -1.35, 0.57, -1.50, 1.20], ['c', -0.18, 0.66, 0.12, 1.14, 0.75, 1.29], ['c', 0.66, 0.12, 1.92, -0.12, 3.18, -0.66], ['l', 0.33, -0.15], ['l', 0.09, -0.39], ['c', 0.06, -0.21, 0.09, -0.42, 0.09, -0.45], ['c', 0.00, -0.03, -0.45, -0.30, -0.75, -0.45], ['c', -0.27, -0.15, -0.66, -0.27, -0.99, -0.36], ['z'], ['m', 4.29, 3.63], ['c', -0.24, -0.39, -0.51, -0.75, -0.51, -0.69], ['c', -0.06, 0.12, -0.39, 1.92, -0.45, 2.28], ['c', -0.09, 0.54, -0.12, 1.14, -0.06, 1.38], ['c', 0.06, 0.42, 0.21, 0.60, 0.51, 0.57], ['c', 0.39, -0.06, 0.75, -0.48, 0.93, -1.14], ['c', 0.09, -0.33, 0.09, -1.05, 0.00, -1.38], ['c', -0.09, -0.39, -0.24, -0.69, -0.42, -1.02], ['z']],
    w: 17.963,
    h: 16.49
  },
  'scripts.segno': {
    d: [['M', -3.72, -11.22], ['c', 0.78, -0.09, 1.59, 0.03, 2.31, 0.42], ['c', 1.20, 0.60, 2.01, 1.71, 2.31, 3.09], ['c', 0.09, 0.42, 0.09, 1.20, 0.03, 1.50], ['c', -0.15, 0.45, -0.39, 0.81, -0.66, 0.93], ['c', -0.33, 0.18, -0.84, 0.21, -1.23, 0.15], ['c', -0.81, -0.18, -1.32, -0.93, -1.26, -1.89], ['c', 0.03, -0.36, 0.09, -0.57, 0.24, -0.90], ['c', 0.15, -0.33, 0.45, -0.60, 0.72, -0.75], ['c', 0.12, -0.06, 0.18, -0.09, 0.18, -0.12], ['c', 0.00, -0.03, -0.03, -0.15, -0.09, -0.24], ['c', -0.18, -0.45, -0.54, -0.87, -0.96, -1.08], ['c', -1.11, -0.57, -2.34, -0.18, -2.88, 0.90], ['c', -0.24, 0.51, -0.33, 1.11, -0.24, 1.83], ['c', 0.27, 1.92, 1.50, 3.54, 3.93, 5.13], ['c', 0.48, 0.33, 1.26, 0.78, 1.29, 0.78], ['c', 0.03, 0.00, 1.35, -2.19, 2.94, -4.89], ['l', 2.88, -4.89], ['l', 0.84, 0.00], ['l', 0.87, 0.00], ['l', -0.03, 0.06], ['c', -0.15, 0.21, -6.15, 10.41, -6.15, 10.44], ['c', 0.00, 0.00, 0.21, 0.15, 0.48, 0.27], ['c', 2.61, 1.47, 4.35, 3.03, 5.13, 4.65], ['c', 1.14, 2.34, 0.51, 5.07, -1.44, 6.39], ['c', -0.66, 0.42, -1.32, 0.63, -2.13, 0.69], ['c', -2.01, 0.09, -3.81, -1.41, -4.26, -3.54], ['c', -0.09, -0.42, -0.09, -1.20, -0.03, -1.50], ['c', 0.15, -0.45, 0.39, -0.81, 0.66, -0.93], ['c', 0.33, -0.18, 0.84, -0.21, 1.23, -0.15], ['c', 0.81, 0.18, 1.32, 0.93, 1.26, 1.89], ['c', -0.03, 0.36, -0.09, 0.57, -0.24, 0.90], ['c', -0.15, 0.33, -0.45, 0.60, -0.72, 0.75], ['c', -0.12, 0.06, -0.18, 0.09, -0.18, 0.12], ['c', 0.00, 0.03, 0.03, 0.15, 0.09, 0.24], ['c', 0.18, 0.45, 0.54, 0.87, 0.96, 1.08], ['c', 1.11, 0.57, 2.34, 0.18, 2.88, -0.90], ['c', 0.24, -0.51, 0.33, -1.11, 0.24, -1.83], ['c', -0.27, -1.92, -1.50, -3.54, -3.93, -5.13], ['c', -0.48, -0.33, -1.26, -0.78, -1.29, -0.78], ['c', -0.03, 0.00, -1.35, 2.19, -2.91, 4.89], ['l', -2.88, 4.89], ['l', -0.87, 0.00], ['l', -0.87, 0.00], ['l', 0.03, -0.06], ['c', 0.15, -0.21, 6.15, -10.41, 6.15, -10.44], ['c', 0.00, 0.00, -0.21, -0.15, -0.48, -0.30], ['c', -2.61, -1.44, -4.35, -3.00, -5.13, -4.62], ['c', -0.90, -1.89, -0.72, -4.02, 0.48, -5.52], ['c', 0.69, -0.84, 1.68, -1.41, 2.73, -1.53], ['z'], ['m', 8.76, 9.09], ['c', 0.03, -0.03, 0.15, -0.03, 0.27, -0.03], ['c', 0.33, 0.03, 0.57, 0.18, 0.72, 0.48], ['c', 0.09, 0.18, 0.09, 0.57, 0.00, 0.75], ['c', -0.09, 0.18, -0.21, 0.30, -0.36, 0.39], ['c', -0.15, 0.06, -0.21, 0.06, -0.39, 0.06], ['c', -0.21, 0.00, -0.27, 0.00, -0.39, -0.06], ['c', -0.30, -0.15, -0.48, -0.45, -0.48, -0.75], ['c', 0.00, -0.39, 0.24, -0.72, 0.63, -0.84], ['z'], ['m', -10.53, 2.61], ['c', 0.03, -0.03, 0.15, -0.03, 0.27, -0.03], ['c', 0.33, 0.03, 0.57, 0.18, 0.72, 0.48], ['c', 0.09, 0.18, 0.09, 0.57, 0.00, 0.75], ['c', -0.09, 0.18, -0.21, 0.30, -0.36, 0.39], ['c', -0.15, 0.06, -0.21, 0.06, -0.39, 0.06], ['c', -0.21, 0.00, -0.27, 0.00, -0.39, -0.06], ['c', -0.30, -0.15, -0.48, -0.45, -0.48, -0.75], ['c', 0.00, -0.39, 0.24, -0.72, 0.63, -0.84], ['z']],
    w: 15,
    h: 22.504
  },
  'scripts.coda': {
    d: [['M', -0.21, -10.47], ['c', 0.18, -0.12, 0.42, -0.06, 0.54, 0.12], ['c', 0.06, 0.09, 0.06, 0.18, 0.06, 1.50], ['l', 0.00, 1.38], ['l', 0.18, 0.00], ['c', 0.39, 0.06, 0.96, 0.24, 1.38, 0.48], ['c', 1.68, 0.93, 2.82, 3.24, 3.03, 6.12], ['c', 0.03, 0.24, 0.03, 0.45, 0.03, 0.45], ['c', 0.00, 0.03, 0.60, 0.03, 1.35, 0.03], ['c', 1.50, 0.00, 1.47, 0.00, 1.59, 0.18], ['c', 0.09, 0.12, 0.09, 0.30, 0.00, 0.42], ['c', -0.12, 0.18, -0.09, 0.18, -1.59, 0.18], ['c', -0.75, 0.00, -1.35, 0.00, -1.35, 0.03], ['c', 0.00, 0.00, 0.00, 0.21, -0.03, 0.42], ['c', -0.24, 3.15, -1.53, 5.58, -3.45, 6.36], ['c', -0.27, 0.12, -0.72, 0.24, -0.96, 0.27], ['l', -0.18, 0.00], ['l', 0.00, 1.38], ['c', 0.00, 1.32, 0.00, 1.41, -0.06, 1.50], ['c', -0.15, 0.24, -0.51, 0.24, -0.66, 0.00], ['c', -0.06, -0.09, -0.06, -0.18, -0.06, -1.50], ['l', 0.00, -1.38], ['l', -0.18, 0.00], ['c', -0.39, -0.06, -0.96, -0.24, -1.38, -0.48], ['c', -1.68, -0.93, -2.82, -3.24, -3.03, -6.15], ['c', -0.03, -0.21, -0.03, -0.42, -0.03, -0.42], ['c', 0.00, -0.03, -0.60, -0.03, -1.35, -0.03], ['c', -1.50, 0.00, -1.47, 0.00, -1.59, -0.18], ['c', -0.09, -0.12, -0.09, -0.30, 0.00, -0.42], ['c', 0.12, -0.18, 0.09, -0.18, 1.59, -0.18], ['c', 0.75, 0.00, 1.35, 0.00, 1.35, -0.03], ['c', 0.00, 0.00, 0.00, -0.21, 0.03, -0.45], ['c', 0.24, -3.12, 1.53, -5.55, 3.45, -6.33], ['c', 0.27, -0.12, 0.72, -0.24, 0.96, -0.27], ['l', 0.18, 0.00], ['l', 0.00, -1.38], ['c', 0.00, -1.53, 0.00, -1.50, 0.18, -1.62], ['z'], ['m', -0.18, 6.93], ['c', 0.00, -2.97, 0.00, -3.15, -0.06, -3.15], ['c', -0.09, 0.00, -0.51, 0.15, -0.66, 0.21], ['c', -0.87, 0.51, -1.38, 1.62, -1.56, 3.51], ['c', -0.06, 0.54, -0.12, 1.59, -0.12, 2.16], ['l', 0.00, 0.42], ['l', 1.20, 0.00], ['l', 1.20, 0.00], ['l', 0.00, -3.15], ['z'], ['m', 1.17, -3.06], ['c', -0.09, -0.03, -0.21, -0.06, -0.27, -0.09], ['l', -0.12, 0.00], ['l', 0.00, 3.15], ['l', 0.00, 3.15], ['l', 1.20, 0.00], ['l', 1.20, 0.00], ['l', 0.00, -0.81], ['c', -0.06, -2.40, -0.33, -3.69, -0.93, -4.59], ['c', -0.27, -0.39, -0.66, -0.69, -1.08, -0.81], ['z'], ['m', -1.17, 10.14], ['l', 0.00, -3.15], ['l', -1.20, 0.00], ['l', -1.20, 0.00], ['l', 0.00, 0.81], ['c', 0.03, 0.96, 0.06, 1.47, 0.15, 2.13], ['c', 0.24, 2.04, 0.96, 3.12, 2.13, 3.36], ['l', 0.12, 0.00], ['l', 0.00, -3.15], ['z'], ['m', 3.18, -2.34], ['l', 0.00, -0.81], ['l', -1.20, 0.00], ['l', -1.20, 0.00], ['l', 0.00, 3.15], ['l', 0.00, 3.15], ['l', 0.12, 0.00], ['c', 1.17, -0.24, 1.89, -1.32, 2.13, -3.36], ['c', 0.09, -0.66, 0.12, -1.17, 0.15, -2.13], ['z']],
    w: 16.035,
    h: 21.062
  },
  'scripts.comma': {
    d: [['M', 1.14, -4.62], ['c', 0.30, -0.12, 0.69, -0.03, 0.93, 0.15], ['c', 0.12, 0.12, 0.36, 0.45, 0.51, 0.78], ['c', 0.90, 1.77, 0.54, 4.05, -1.08, 6.75], ['c', -0.36, 0.63, -0.87, 1.38, -0.96, 1.44], ['c', -0.18, 0.12, -0.42, 0.06, -0.54, -0.12], ['c', -0.09, -0.18, -0.09, -0.30, 0.12, -0.60], ['c', 0.96, -1.44, 1.44, -2.97, 1.38, -4.35], ['c', -0.06, -0.93, -0.30, -1.68, -0.78, -2.46], ['c', -0.27, -0.39, -0.33, -0.63, -0.24, -0.96], ['c', 0.09, -0.27, 0.36, -0.54, 0.66, -0.63], ['z']],
    w: 3.042,
    h: 9.237
  },
  'scripts.roll': {
    d: [['M', 1.95, -6.00], ['c', 0.21, -0.09, 0.36, -0.09, 0.57, 0.00], ['c', 0.39, 0.15, 0.63, 0.39, 1.47, 1.35], ['c', 0.66, 0.75, 0.78, 0.87, 1.08, 1.05], ['c', 0.75, 0.45, 1.65, 0.42, 2.40, -0.06], ['c', 0.12, -0.09, 0.27, -0.27, 0.54, -0.60], ['c', 0.42, -0.54, 0.51, -0.63, 0.69, -0.63], ['c', 0.09, 0.00, 0.30, 0.12, 0.36, 0.21], ['c', 0.09, 0.12, 0.12, 0.30, 0.03, 0.42], ['c', -0.06, 0.12, -3.15, 3.90, -3.30, 4.08], ['c', -0.06, 0.06, -0.18, 0.12, -0.27, 0.18], ['c', -0.27, 0.12, -0.60, 0.06, -0.99, -0.27], ['c', -0.27, -0.21, -0.42, -0.39, -1.08, -1.14], ['c', -0.63, -0.72, -0.81, -0.90, -1.17, -1.08], ['c', -0.36, -0.18, -0.57, -0.21, -0.99, -0.21], ['c', -0.39, 0.00, -0.63, 0.03, -0.93, 0.18], ['c', -0.36, 0.15, -0.51, 0.27, -0.90, 0.81], ['c', -0.24, 0.27, -0.45, 0.51, -0.48, 0.54], ['c', -0.12, 0.09, -0.27, 0.06, -0.39, 0.00], ['c', -0.24, -0.15, -0.33, -0.39, -0.21, -0.60], ['c', 0.09, -0.12, 3.18, -3.87, 3.33, -4.02], ['c', 0.06, -0.06, 0.18, -0.15, 0.24, -0.21], ['z']],
    w: 10.817,
    h: 6.125
  },
  'scripts.prall': {
    d: [['M', -4.38, -3.69], ['c', 0.06, -0.03, 0.18, -0.06, 0.24, -0.06], ['c', 0.30, 0.00, 0.27, -0.03, 1.89, 1.95], ['l', 1.53, 1.83], ['c', 0.03, 0.00, 0.57, -0.84, 1.23, -1.83], ['c', 1.14, -1.68, 1.23, -1.83, 1.35, -1.89], ['c', 0.06, -0.03, 0.18, -0.06, 0.24, -0.06], ['c', 0.30, 0.00, 0.27, -0.03, 1.89, 1.95], ['l', 1.53, 1.83], ['l', 0.48, -0.69], ['c', 0.51, -0.78, 0.54, -0.84, 0.69, -0.90], ['c', 0.42, -0.18, 0.87, 0.15, 0.81, 0.60], ['c', -0.03, 0.12, -0.30, 0.51, -1.50, 2.37], ['c', -1.38, 2.07, -1.50, 2.22, -1.62, 2.28], ['c', -0.06, 0.03, -0.18, 0.06, -0.24, 0.06], ['c', -0.30, 0.00, -0.27, 0.03, -1.89, -1.95], ['l', -1.53, -1.83], ['c', -0.03, 0.00, -0.57, 0.84, -1.23, 1.83], ['c', -1.14, 1.68, -1.23, 1.83, -1.35, 1.89], ['c', -0.06, 0.03, -0.18, 0.06, -0.24, 0.06], ['c', -0.30, 0.00, -0.27, 0.03, -1.89, -1.95], ['l', -1.53, -1.83], ['l', -0.48, 0.69], ['c', -0.51, 0.78, -0.54, 0.84, -0.69, 0.90], ['c', -0.42, 0.18, -0.87, -0.15, -0.81, -0.60], ['c', 0.03, -0.12, 0.30, -0.51, 1.50, -2.37], ['c', 1.38, -2.07, 1.50, -2.22, 1.62, -2.28], ['z']],
    w: 15.011,
    h: 7.5
  },
  'scripts.arpeggio': {
    d: [['M', 1.5, 0], ['c', 1.5, 2, 1.5, 3, 1.5, 3], ['s', 0, 1, -2, 1.5], ['s', -0.5, 3, 1, 5.5], ['l', 1.5, 0], ['s', -1.75, -2, -1.9, -3.25], ['s', 2.15, -0.6, 2.95, -1.6], ['s', 0.45, -1, 0.5, -1.25], ['s', 0, -1, -2, -3.9], ['l', -1.5, 0], ['z']],
    w: 5,
    h: 10
  },
  'scripts.mordent': {
    d: [['M', -0.21, -4.95], ['c', 0.27, -0.15, 0.63, 0.00, 0.75, 0.27], ['c', 0.06, 0.12, 0.06, 0.24, 0.06, 1.44], ['l', 0.00, 1.29], ['l', 0.57, -0.84], ['c', 0.51, -0.75, 0.57, -0.84, 0.69, -0.90], ['c', 0.06, -0.03, 0.18, -0.06, 0.24, -0.06], ['c', 0.30, 0.00, 0.27, -0.03, 1.89, 1.95], ['l', 1.53, 1.83], ['l', 0.48, -0.69], ['c', 0.51, -0.78, 0.54, -0.84, 0.69, -0.90], ['c', 0.42, -0.18, 0.87, 0.15, 0.81, 0.60], ['c', -0.03, 0.12, -0.30, 0.51, -1.50, 2.37], ['c', -1.38, 2.07, -1.50, 2.22, -1.62, 2.28], ['c', -0.06, 0.03, -0.18, 0.06, -0.24, 0.06], ['c', -0.30, 0.00, -0.27, 0.03, -1.83, -1.89], ['c', -0.81, -0.99, -1.50, -1.80, -1.53, -1.86], ['c', -0.06, -0.03, -0.06, -0.03, -0.12, 0.03], ['c', -0.06, 0.06, -0.06, 0.15, -0.06, 2.28], ['c', 0.00, 1.95, 0.00, 2.25, -0.06, 2.34], ['c', -0.18, 0.45, -0.81, 0.48, -1.05, 0.03], ['c', -0.03, -0.06, -0.06, -0.24, -0.06, -1.41], ['l', 0.00, -1.35], ['l', -0.57, 0.84], ['c', -0.54, 0.78, -0.60, 0.87, -0.72, 0.93], ['c', -0.06, 0.03, -0.18, 0.06, -0.24, 0.06], ['c', -0.30, 0.00, -0.27, 0.03, -1.89, -1.95], ['l', -1.53, -1.83], ['l', -0.48, 0.69], ['c', -0.51, 0.78, -0.54, 0.84, -0.69, 0.90], ['c', -0.42, 0.18, -0.87, -0.15, -0.81, -0.60], ['c', 0.03, -0.12, 0.30, -0.51, 1.50, -2.37], ['c', 1.38, -2.07, 1.50, -2.22, 1.62, -2.28], ['c', 0.06, -0.03, 0.18, -0.06, 0.24, -0.06], ['c', 0.30, 0.00, 0.27, -0.03, 1.89, 1.95], ['l', 1.53, 1.83], ['c', 0.03, 0.00, 0.06, -0.06, 0.09, -0.09], ['c', 0.06, -0.12, 0.06, -0.15, 0.06, -2.28], ['c', 0.00, -1.92, 0.00, -2.22, 0.06, -2.31], ['c', 0.06, -0.15, 0.15, -0.24, 0.30, -0.30], ['z']],
    w: 15.011,
    h: 10.012
  },
  'flags.u8th': {
    d: [['M', -0.42, 3.75], ['l', 0.00, -3.75], ['l', 0.21, 0.00], ['l', 0.21, 0.00], ['l', 0.00, 0.18], ['c', 0.00, 0.30, 0.06, 0.84, 0.12, 1.23], ['c', 0.24, 1.53, 0.90, 3.12, 2.13, 5.16], ['l', 0.99, 1.59], ['c', 0.87, 1.44, 1.38, 2.34, 1.77, 3.09], ['c', 0.81, 1.68, 1.20, 3.06, 1.26, 4.53], ['c', 0.03, 1.53, -0.21, 3.27, -0.75, 5.01], ['c', -0.21, 0.69, -0.51, 1.50, -0.60, 1.59], ['c', -0.09, 0.12, -0.27, 0.21, -0.42, 0.21], ['c', -0.15, 0.00, -0.42, -0.12, -0.51, -0.21], ['c', -0.15, -0.18, -0.18, -0.42, -0.09, -0.66], ['c', 0.15, -0.33, 0.45, -1.20, 0.57, -1.62], ['c', 0.42, -1.38, 0.60, -2.58, 0.60, -3.90], ['c', 0.00, -0.66, 0.00, -0.81, -0.06, -1.11], ['c', -0.39, -2.07, -1.80, -4.26, -4.59, -7.14], ['l', -0.42, -0.45], ['l', -0.21, 0.00], ['l', -0.21, 0.00], ['l', 0.00, -3.75], ['z']],
    w: 6.692,
    h: 22.59
  },
  'flags.u16th': {
    d: [['M', -0.42, 7.50], ['l', 0.00, -7.50], ['l', 0.21, 0.00], ['l', 0.21, 0.00], ['l', 0.00, 0.39], ['c', 0.06, 1.08, 0.39, 2.19, 0.99, 3.39], ['c', 0.45, 0.90, 0.87, 1.59, 1.95, 3.12], ['c', 1.29, 1.86, 1.77, 2.64, 2.22, 3.57], ['c', 0.45, 0.93, 0.72, 1.80, 0.87, 2.64], ['c', 0.06, 0.51, 0.06, 1.50, 0.00, 1.92], ['c', -0.12, 0.60, -0.30, 1.20, -0.54, 1.71], ['l', -0.09, 0.24], ['l', 0.18, 0.45], ['c', 0.51, 1.20, 0.72, 2.22, 0.69, 3.42], ['c', -0.06, 1.53, -0.39, 3.03, -0.99, 4.53], ['c', -0.30, 0.75, -0.36, 0.81, -0.57, 0.90], ['c', -0.15, 0.09, -0.33, 0.06, -0.48, 0.00], ['c', -0.18, -0.09, -0.27, -0.18, -0.33, -0.33], ['c', -0.09, -0.18, -0.06, -0.30, 0.12, -0.75], ['c', 0.66, -1.41, 1.02, -2.88, 1.08, -4.32], ['c', 0.00, -0.60, -0.03, -1.05, -0.18, -1.59], ['c', -0.30, -1.20, -0.99, -2.40, -2.25, -3.87], ['c', -0.42, -0.48, -1.53, -1.62, -2.19, -2.22], ['l', -0.45, -0.42], ['l', -0.03, 1.11], ['l', 0.00, 1.11], ['l', -0.21, 0.00], ['l', -0.21, 0.00], ['l', 0.00, -7.50], ['z'], ['m', 1.65, 0.09], ['c', -0.30, -0.30, -0.69, -0.72, -0.90, -0.87], ['l', -0.33, -0.33], ['l', 0.00, 0.15], ['c', 0.00, 0.30, 0.06, 0.81, 0.15, 1.26], ['c', 0.27, 1.29, 0.87, 2.61, 2.04, 4.29], ['c', 0.15, 0.24, 0.60, 0.87, 0.96, 1.38], ['l', 1.08, 1.53], ['l', 0.42, 0.63], ['c', 0.03, 0.00, 0.12, -0.36, 0.21, -0.72], ['c', 0.06, -0.33, 0.06, -1.20, 0.00, -1.62], ['c', -0.33, -1.71, -1.44, -3.48, -3.63, -5.70], ['z']],
    w: 6.693,
    h: 26.337
  },
  'flags.u32nd': {
    d: [['M', -0.42, 11.25], ['l', 0.00, -11.25], ['l', 0.21, 0.00], ['l', 0.21, 0.00], ['l', 0.00, 0.36], ['c', 0.09, 1.68, 0.69, 3.27, 2.07, 5.46], ['l', 0.87, 1.35], ['c', 1.02, 1.62, 1.47, 2.37, 1.86, 3.18], ['c', 0.48, 1.02, 0.78, 1.92, 0.93, 2.88], ['c', 0.06, 0.48, 0.06, 1.50, 0.00, 1.89], ['c', -0.09, 0.42, -0.21, 0.87, -0.36, 1.26], ['l', -0.12, 0.30], ['l', 0.15, 0.39], ['c', 0.69, 1.56, 0.84, 2.88, 0.54, 4.38], ['c', -0.09, 0.45, -0.27, 1.08, -0.45, 1.47], ['l', -0.12, 0.24], ['l', 0.18, 0.36], ['c', 0.33, 0.72, 0.57, 1.56, 0.69, 2.34], ['c', 0.12, 1.02, -0.06, 2.52, -0.42, 3.84], ['c', -0.27, 0.93, -0.75, 2.13, -0.93, 2.31], ['c', -0.18, 0.15, -0.45, 0.18, -0.66, 0.09], ['c', -0.18, -0.09, -0.27, -0.18, -0.33, -0.33], ['c', -0.09, -0.18, -0.06, -0.30, 0.06, -0.60], ['c', 0.21, -0.36, 0.42, -0.90, 0.57, -1.38], ['c', 0.51, -1.41, 0.69, -3.06, 0.48, -4.08], ['c', -0.15, -0.81, -0.57, -1.68, -1.20, -2.55], ['c', -0.72, -0.99, -1.83, -2.13, -3.30, -3.33], ['l', -0.48, -0.42], ['l', -0.03, 1.53], ['l', 0.00, 1.56], ['l', -0.21, 0.00], ['l', -0.21, 0.00], ['l', 0.00, -11.25], ['z'], ['m', 1.26, -3.96], ['c', -0.27, -0.30, -0.54, -0.60, -0.66, -0.72], ['l', -0.18, -0.21], ['l', 0.00, 0.42], ['c', 0.06, 0.87, 0.24, 1.74, 0.66, 2.67], ['c', 0.36, 0.87, 0.96, 1.86, 1.92, 3.18], ['c', 0.21, 0.33, 0.63, 0.87, 0.87, 1.23], ['c', 0.27, 0.39, 0.60, 0.84, 0.75, 1.08], ['l', 0.27, 0.39], ['l', 0.03, -0.12], ['c', 0.12, -0.45, 0.15, -1.05, 0.09, -1.59], ['c', -0.27, -1.86, -1.38, -3.78, -3.75, -6.33], ['z'], ['m', -0.27, 6.09], ['c', -0.27, -0.21, -0.48, -0.42, -0.51, -0.45], ['c', -0.06, -0.03, -0.06, -0.03, -0.06, 0.21], ['c', 0.00, 0.90, 0.30, 2.04, 0.81, 3.09], ['c', 0.48, 1.02, 0.96, 1.77, 2.37, 3.63], ['c', 0.60, 0.78, 1.05, 1.44, 1.29, 1.77], ['c', 0.06, 0.12, 0.15, 0.21, 0.15, 0.18], ['c', 0.03, -0.03, 0.18, -0.57, 0.24, -0.87], ['c', 0.06, -0.45, 0.06, -1.32, -0.03, -1.74], ['c', -0.09, -0.48, -0.24, -0.90, -0.51, -1.44], ['c', -0.66, -1.35, -1.83, -2.70, -3.75, -4.38], ['z']],
    w: 6.697,
    h: 32.145
  },
  'flags.u64th': {
    d: [['M', -0.42, 15.00], ['l', 0.00, -15.00], ['l', 0.21, 0.00], ['l', 0.21, 0.00], ['l', 0.00, 0.36], ['c', 0.06, 1.20, 0.39, 2.37, 1.02, 3.66], ['c', 0.39, 0.81, 0.84, 1.56, 1.80, 3.09], ['c', 0.81, 1.26, 1.05, 1.68, 1.35, 2.22], ['c', 0.87, 1.50, 1.35, 2.79, 1.56, 4.08], ['c', 0.06, 0.54, 0.06, 1.56, -0.03, 2.04], ['c', -0.09, 0.48, -0.21, 0.99, -0.36, 1.35], ['l', -0.12, 0.27], ['l', 0.12, 0.27], ['c', 0.09, 0.15, 0.21, 0.45, 0.27, 0.66], ['c', 0.69, 1.89, 0.63, 3.66, -0.18, 5.46], ['l', -0.18, 0.39], ['l', 0.15, 0.33], ['c', 0.30, 0.66, 0.51, 1.44, 0.63, 2.10], ['c', 0.06, 0.48, 0.06, 1.35, 0.00, 1.71], ['c', -0.15, 0.57, -0.42, 1.20, -0.78, 1.68], ['l', -0.21, 0.27], ['l', 0.18, 0.33], ['c', 0.57, 1.05, 0.93, 2.13, 1.02, 3.18], ['c', 0.06, 0.72, 0.00, 1.83, -0.21, 2.79], ['c', -0.18, 1.02, -0.63, 2.34, -1.02, 3.09], ['c', -0.15, 0.33, -0.48, 0.45, -0.78, 0.30], ['c', -0.18, -0.09, -0.27, -0.18, -0.33, -0.33], ['c', -0.09, -0.18, -0.06, -0.30, 0.03, -0.54], ['c', 0.75, -1.50, 1.23, -3.45, 1.17, -4.89], ['c', -0.06, -1.02, -0.42, -2.01, -1.17, -3.15], ['c', -0.48, -0.72, -1.02, -1.35, -1.89, -2.22], ['c', -0.57, -0.57, -1.56, -1.50, -1.92, -1.77], ['l', -0.12, -0.09], ['l', 0.00, 1.68], ['l', 0.00, 1.68], ['l', -0.21, 0.00], ['l', -0.21, 0.00], ['l', 0.00, -15.00], ['z'], ['m', 0.93, -8.07], ['c', -0.27, -0.30, -0.48, -0.54, -0.51, -0.54], ['c', 0.00, 0.00, 0.00, 0.69, 0.03, 1.02], ['c', 0.15, 1.47, 0.75, 2.94, 2.04, 4.83], ['l', 1.08, 1.53], ['c', 0.39, 0.57, 0.84, 1.20, 0.99, 1.44], ['c', 0.15, 0.24, 0.30, 0.45, 0.30, 0.45], ['c', 0.00, 0.00, 0.03, -0.09, 0.06, -0.21], ['c', 0.36, -1.59, -0.15, -3.33, -1.47, -5.40], ['c', -0.63, -0.93, -1.35, -1.83, -2.52, -3.12], ['z'], ['m', 0.06, 6.72], ['c', -0.24, -0.21, -0.48, -0.42, -0.51, -0.45], ['l', -0.06, -0.06], ['l', 0.00, 0.33], ['c', 0.00, 1.20, 0.30, 2.34, 0.93, 3.60], ['c', 0.45, 0.90, 0.96, 1.68, 2.25, 3.51], ['c', 0.39, 0.54, 0.84, 1.17, 1.02, 1.44], ['c', 0.21, 0.33, 0.33, 0.51, 0.33, 0.48], ['c', 0.06, -0.09, 0.21, -0.63, 0.30, -0.99], ['c', 0.06, -0.33, 0.06, -0.45, 0.06, -0.96], ['c', 0.00, -0.60, -0.03, -0.84, -0.18, -1.35], ['c', -0.30, -1.08, -1.02, -2.28, -2.13, -3.57], ['c', -0.39, -0.45, -1.44, -1.47, -2.01, -1.98], ['z'], ['m', 0.00, 6.72], ['c', -0.24, -0.21, -0.48, -0.39, -0.51, -0.42], ['l', -0.06, -0.06], ['l', 0.00, 0.33], ['c', 0.00, 1.41, 0.45, 2.82, 1.38, 4.35], ['c', 0.42, 0.72, 0.72, 1.14, 1.86, 2.73], ['c', 0.36, 0.45, 0.75, 0.99, 0.87, 1.20], ['c', 0.15, 0.21, 0.30, 0.36, 0.30, 0.36], ['c', 0.06, 0.00, 0.30, -0.48, 0.39, -0.75], ['c', 0.09, -0.36, 0.12, -0.63, 0.12, -1.05], ['c', -0.06, -1.05, -0.45, -2.04, -1.20, -3.18], ['c', -0.57, -0.87, -1.11, -1.53, -2.07, -2.49], ['c', -0.36, -0.33, -0.84, -0.78, -1.08, -1.02], ['z']],
    w: 6.682,
    h: 39.694
  },
  'flags.d8th': {
    d: [['M', 5.67, -21.63], ['c', 0.24, -0.12, 0.54, -0.06, 0.69, 0.15], ['c', 0.06, 0.06, 0.21, 0.36, 0.39, 0.66], ['c', 0.84, 1.77, 1.26, 3.36, 1.32, 5.10], ['c', 0.03, 1.29, -0.21, 2.37, -0.81, 3.63], ['c', -0.60, 1.23, -1.26, 2.13, -3.21, 4.38], ['c', -1.35, 1.53, -1.86, 2.19, -2.40, 2.97], ['c', -0.63, 0.93, -1.11, 1.92, -1.38, 2.79], ['c', -0.15, 0.54, -0.27, 1.35, -0.27, 1.80], ['l', 0.00, 0.15], ['l', -0.21, 0.00], ['l', -0.21, 0.00], ['l', 0.00, -3.75], ['l', 0.00, -3.75], ['l', 0.21, 0.00], ['l', 0.21, 0.00], ['l', 0.48, -0.30], ['c', 1.83, -1.11, 3.12, -2.10, 4.17, -3.12], ['c', 0.78, -0.81, 1.32, -1.53, 1.71, -2.31], ['c', 0.45, -0.93, 0.60, -1.74, 0.51, -2.88], ['c', -0.12, -1.56, -0.63, -3.18, -1.47, -4.68], ['c', -0.12, -0.21, -0.15, -0.33, -0.06, -0.51], ['c', 0.06, -0.15, 0.15, -0.24, 0.33, -0.33], ['z']],
    w: 8.492,
    h: 21.691
  },
  'flags.ugrace': {
    d: [['M', 6.03, 6.93], ['c', 0.15, -0.09, 0.33, -0.06, 0.51, 0.00], ['c', 0.15, 0.09, 0.21, 0.15, 0.30, 0.33], ['c', 0.09, 0.18, 0.06, 0.39, -0.03, 0.54], ['c', -0.06, 0.15, -10.89, 8.88, -11.07, 8.97], ['c', -0.15, 0.09, -0.33, 0.06, -0.48, 0.00], ['c', -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ['c', -0.09, -0.18, -0.06, -0.39, 0.03, -0.54], ['c', 0.06, -0.15, 10.89, -8.88, 11.07, -8.97], ['z']],
    w: 12.019,
    h: 9.954
  },
  'flags.dgrace': {
    d: [['M', -6.06, -15.93], ['c', 0.18, -0.09, 0.33, -0.12, 0.48, -0.06], ['c', 0.18, 0.09, 14.01, 8.04, 14.10, 8.10], ['c', 0.12, 0.12, 0.18, 0.33, 0.18, 0.51], ['c', -0.03, 0.21, -0.15, 0.39, -0.36, 0.48], ['c', -0.18, 0.09, -0.33, 0.12, -0.48, 0.06], ['c', -0.18, -0.09, -14.01, -8.04, -14.10, -8.10], ['c', -0.12, -0.12, -0.18, -0.33, -0.18, -0.51], ['c', 0.03, -0.21, 0.15, -0.39, 0.36, -0.48], ['z']],
    w: 15.12,
    h: 9.212
  },
  'flags.d16th': {
    d: [['M', 6.84, -22.53], ['c', 0.27, -0.12, 0.57, -0.06, 0.72, 0.15], ['c', 0.15, 0.15, 0.33, 0.87, 0.45, 1.56], ['c', 0.06, 0.33, 0.06, 1.35, 0.00, 1.65], ['c', -0.06, 0.33, -0.15, 0.78, -0.27, 1.11], ['c', -0.12, 0.33, -0.45, 0.96, -0.66, 1.32], ['l', -0.18, 0.27], ['l', 0.09, 0.18], ['c', 0.48, 1.02, 0.72, 2.25, 0.69, 3.30], ['c', -0.06, 1.23, -0.42, 2.28, -1.26, 3.45], ['c', -0.57, 0.87, -0.99, 1.32, -3.00, 3.39], ['c', -1.56, 1.56, -2.22, 2.40, -2.76, 3.45], ['c', -0.42, 0.84, -0.66, 1.80, -0.66, 2.55], ['l', 0.00, 0.15], ['l', -0.21, 0.00], ['l', -0.21, 0.00], ['l', 0.00, -7.50], ['l', 0.00, -7.50], ['l', 0.21, 0.00], ['l', 0.21, 0.00], ['l', 0.00, 1.14], ['l', 0.00, 1.11], ['l', 0.27, -0.15], ['c', 1.11, -0.57, 1.77, -0.99, 2.52, -1.47], ['c', 2.37, -1.56, 3.69, -3.15, 4.05, -4.83], ['c', 0.03, -0.18, 0.03, -0.39, 0.03, -0.78], ['c', 0.00, -0.60, -0.03, -0.93, -0.24, -1.50], ['c', -0.06, -0.18, -0.12, -0.39, -0.15, -0.45], ['c', -0.03, -0.24, 0.12, -0.48, 0.36, -0.60], ['z'], ['m', -0.63, 7.50], ['c', -0.06, -0.18, -0.15, -0.36, -0.15, -0.36], ['c', -0.03, 0.00, -0.03, 0.03, -0.06, 0.06], ['c', -0.06, 0.12, -0.96, 1.02, -1.95, 1.98], ['c', -0.63, 0.57, -1.26, 1.17, -1.44, 1.35], ['c', -1.53, 1.62, -2.28, 2.85, -2.55, 4.32], ['c', -0.03, 0.18, -0.03, 0.54, -0.06, 0.99], ['l', 0.00, 0.69], ['l', 0.18, -0.09], ['c', 0.93, -0.54, 2.10, -1.29, 2.82, -1.83], ['c', 0.69, -0.51, 1.02, -0.81, 1.53, -1.29], ['c', 1.86, -1.89, 2.37, -3.66, 1.68, -5.82], ['z']],
    w: 8.475,
    h: 22.591
  },
  'flags.d32nd': {
    d: [['M', 6.84, -29.13], ['c', 0.27, -0.12, 0.57, -0.06, 0.72, 0.15], ['c', 0.12, 0.12, 0.27, 0.63, 0.36, 1.11], ['c', 0.33, 1.59, 0.06, 3.06, -0.81, 4.47], ['l', -0.18, 0.27], ['l', 0.09, 0.15], ['c', 0.12, 0.24, 0.33, 0.69, 0.45, 1.05], ['c', 0.63, 1.83, 0.45, 3.57, -0.57, 5.22], ['l', -0.18, 0.30], ['l', 0.15, 0.27], ['c', 0.42, 0.87, 0.60, 1.71, 0.57, 2.61], ['c', -0.06, 1.29, -0.48, 2.46, -1.35, 3.78], ['c', -0.54, 0.81, -0.93, 1.29, -2.46, 3.00], ['c', -0.51, 0.54, -1.05, 1.17, -1.26, 1.41], ['c', -1.56, 1.86, -2.25, 3.36, -2.37, 5.01], ['l', 0.00, 0.33], ['l', -0.21, 0.00], ['l', -0.21, 0.00], ['l', 0.00, -11.25], ['l', 0.00, -11.25], ['l', 0.21, 0.00], ['l', 0.21, 0.00], ['l', 0.00, 1.35], ['l', 0.03, 1.35], ['l', 0.78, -0.39], ['c', 1.38, -0.69, 2.34, -1.26, 3.24, -1.92], ['c', 1.38, -1.02, 2.28, -2.13, 2.64, -3.21], ['c', 0.15, -0.48, 0.18, -0.72, 0.18, -1.29], ['c', 0.00, -0.57, -0.06, -0.90, -0.24, -1.47], ['c', -0.06, -0.18, -0.12, -0.39, -0.15, -0.45], ['c', -0.03, -0.24, 0.12, -0.48, 0.36, -0.60], ['z'], ['m', -0.63, 7.20], ['c', -0.09, -0.18, -0.12, -0.21, -0.12, -0.15], ['c', -0.03, 0.09, -1.02, 1.08, -2.04, 2.04], ['c', -1.17, 1.08, -1.65, 1.56, -2.07, 2.04], ['c', -0.84, 0.96, -1.38, 1.86, -1.68, 2.76], ['c', -0.21, 0.57, -0.27, 0.99, -0.30, 1.65], ['l', 0.00, 0.54], ['l', 0.66, -0.33], ['c', 3.57, -1.86, 5.49, -3.69, 5.94, -5.70], ['c', 0.06, -0.39, 0.06, -1.20, -0.03, -1.65], ['c', -0.06, -0.39, -0.24, -0.90, -0.36, -1.20], ['z'], ['m', -0.06, 7.20], ['c', -0.06, -0.15, -0.12, -0.33, -0.15, -0.45], ['l', -0.06, -0.18], ['l', -0.18, 0.21], ['l', -1.83, 1.83], ['c', -0.87, 0.90, -1.77, 1.80, -1.95, 2.01], ['c', -1.08, 1.29, -1.62, 2.31, -1.89, 3.51], ['c', -0.06, 0.30, -0.06, 0.51, -0.09, 0.93], ['l', 0.00, 0.57], ['l', 0.09, -0.06], ['c', 0.75, -0.45, 1.89, -1.26, 2.52, -1.74], ['c', 0.81, -0.66, 1.74, -1.53, 2.22, -2.16], ['c', 1.26, -1.53, 1.68, -3.06, 1.32, -4.47], ['z']],
    w: 8.385,
    h: 29.191
  },
  'flags.d64th': {
    d: [['M', 7.08, -32.88], ['c', 0.30, -0.12, 0.66, -0.03, 0.78, 0.24], ['c', 0.18, 0.33, 0.27, 2.10, 0.15, 2.64], ['c', -0.09, 0.39, -0.21, 0.78, -0.39, 1.08], ['l', -0.15, 0.30], ['l', 0.09, 0.27], ['c', 0.03, 0.12, 0.09, 0.45, 0.12, 0.69], ['c', 0.27, 1.44, 0.18, 2.55, -0.30, 3.60], ['l', -0.12, 0.33], ['l', 0.06, 0.42], ['c', 0.27, 1.35, 0.33, 2.82, 0.21, 3.63], ['c', -0.12, 0.60, -0.30, 1.23, -0.57, 1.80], ['l', -0.15, 0.27], ['l', 0.03, 0.42], ['c', 0.06, 1.02, 0.06, 2.70, 0.03, 3.06], ['c', -0.15, 1.47, -0.66, 2.76, -1.74, 4.41], ['c', -0.45, 0.69, -0.75, 1.11, -1.74, 2.37], ['c', -1.05, 1.38, -1.50, 1.98, -1.95, 2.73], ['c', -0.93, 1.50, -1.38, 2.82, -1.44, 4.20], ['l', 0.00, 0.42], ['l', -0.21, 0.00], ['l', -0.21, 0.00], ['l', 0.00, -15.00], ['l', 0.00, -15.00], ['l', 0.21, 0.00], ['l', 0.21, 0.00], ['l', 0.00, 1.86], ['l', 0.00, 1.89], ['c', 0.00, 0.00, 0.21, -0.03, 0.45, -0.09], ['c', 2.22, -0.39, 4.08, -1.11, 5.19, -2.01], ['c', 0.63, -0.54, 1.02, -1.14, 1.20, -1.80], ['c', 0.06, -0.30, 0.06, -1.14, -0.03, -1.65], ['c', -0.03, -0.18, -0.06, -0.39, -0.09, -0.48], ['c', -0.03, -0.24, 0.12, -0.48, 0.36, -0.60], ['z'], ['m', -0.45, 6.15], ['c', -0.03, -0.18, -0.06, -0.42, -0.06, -0.54], ['l', -0.03, -0.18], ['l', -0.33, 0.30], ['c', -0.42, 0.36, -0.87, 0.72, -1.68, 1.29], ['c', -1.98, 1.38, -2.25, 1.59, -2.85, 2.16], ['c', -0.75, 0.69, -1.23, 1.44, -1.47, 2.19], ['c', -0.15, 0.45, -0.18, 0.63, -0.21, 1.35], ['l', 0.00, 0.66], ['l', 0.39, -0.18], ['c', 1.83, -0.90, 3.45, -1.95, 4.47, -2.91], ['c', 0.93, -0.90, 1.53, -1.83, 1.74, -2.82], ['c', 0.06, -0.33, 0.06, -0.87, 0.03, -1.32], ['z'], ['m', -0.27, 4.86], ['c', -0.03, -0.21, -0.06, -0.36, -0.06, -0.36], ['c', 0.00, -0.03, -0.12, 0.09, -0.24, 0.24], ['c', -0.39, 0.48, -0.99, 1.08, -2.16, 2.19], ['c', -1.47, 1.38, -1.92, 1.83, -2.46, 2.49], ['c', -0.66, 0.87, -1.08, 1.74, -1.29, 2.58], ['c', -0.09, 0.42, -0.15, 0.87, -0.15, 1.44], ['l', 0.00, 0.54], ['l', 0.48, -0.33], ['c', 1.50, -1.02, 2.58, -1.89, 3.51, -2.82], ['c', 1.47, -1.47, 2.25, -2.85, 2.40, -4.26], ['c', 0.03, -0.39, 0.03, -1.17, -0.03, -1.71], ['z'], ['m', -0.66, 7.68], ['c', 0.03, -0.15, 0.03, -0.60, 0.03, -0.99], ['l', 0.00, -0.72], ['l', -0.27, 0.33], ['l', -1.74, 1.98], ['c', -1.77, 1.92, -2.43, 2.76, -2.97, 3.90], ['c', -0.51, 1.02, -0.72, 1.77, -0.75, 2.91], ['c', 0.00, 0.63, 0.00, 0.63, 0.06, 0.60], ['c', 0.03, -0.03, 0.30, -0.27, 0.63, -0.54], ['c', 0.66, -0.60, 1.86, -1.80, 2.31, -2.31], ['c', 1.65, -1.89, 2.52, -3.54, 2.70, -5.16], ['z']],
    w: 8.485,
    h: 32.932
  },
  'clefs.C': {
    d: [['M', 0.06, -14.94], ['l', 0.09, -0.06], ['l', 1.92, 0.00], ['l', 1.92, 0.00], ['l', 0.09, 0.06], ['l', 0.06, 0.09], ['l', 0.00, 14.85], ['l', 0.00, 14.82], ['l', -0.06, 0.09], ['l', -0.09, 0.06], ['l', -1.92, 0.00], ['l', -1.92, 0.00], ['l', -0.09, -0.06], ['l', -0.06, -0.09], ['l', 0.00, -14.82], ['l', 0.00, -14.85], ['z'], ['m', 5.37, 0.00], ['c', 0.09, -0.06, 0.09, -0.06, 0.57, -0.06], ['c', 0.45, 0.00, 0.45, 0.00, 0.54, 0.06], ['l', 0.06, 0.09], ['l', 0.00, 7.14], ['l', 0.00, 7.11], ['l', 0.09, -0.06], ['c', 0.18, -0.18, 0.72, -0.84, 0.96, -1.20], ['c', 0.30, -0.45, 0.66, -1.17, 0.84, -1.65], ['c', 0.36, -0.90, 0.57, -1.83, 0.60, -2.79], ['c', 0.03, -0.48, 0.03, -0.54, 0.09, -0.63], ['c', 0.12, -0.18, 0.36, -0.21, 0.54, -0.12], ['c', 0.18, 0.09, 0.21, 0.15, 0.24, 0.66], ['c', 0.06, 0.87, 0.21, 1.56, 0.57, 2.22], ['c', 0.51, 1.02, 1.26, 1.68, 2.22, 1.92], ['c', 0.21, 0.06, 0.33, 0.06, 0.78, 0.06], ['c', 0.45, 0.00, 0.57, 0.00, 0.84, -0.06], ['c', 0.45, -0.12, 0.81, -0.33, 1.08, -0.60], ['c', 0.57, -0.57, 0.87, -1.41, 0.99, -2.88], ['c', 0.06, -0.54, 0.06, -3.00, 0.00, -3.57], ['c', -0.21, -2.58, -0.84, -3.87, -2.16, -4.50], ['c', -0.48, -0.21, -1.17, -0.36, -1.77, -0.36], ['c', -0.69, 0.00, -1.29, 0.27, -1.50, 0.72], ['c', -0.06, 0.15, -0.06, 0.21, -0.06, 0.42], ['c', 0.00, 0.24, 0.00, 0.30, 0.06, 0.45], ['c', 0.12, 0.24, 0.24, 0.39, 0.63, 0.66], ['c', 0.42, 0.30, 0.57, 0.48, 0.69, 0.72], ['c', 0.06, 0.15, 0.06, 0.21, 0.06, 0.48], ['c', 0.00, 0.39, -0.03, 0.63, -0.21, 0.96], ['c', -0.30, 0.60, -0.87, 1.08, -1.50, 1.26], ['c', -0.27, 0.06, -0.87, 0.06, -1.14, 0.00], ['c', -0.78, -0.24, -1.44, -0.87, -1.65, -1.68], ['c', -0.12, -0.42, -0.09, -1.17, 0.09, -1.71], ['c', 0.51, -1.65, 1.98, -2.82, 3.81, -3.09], ['c', 0.84, -0.09, 2.46, 0.03, 3.51, 0.27], ['c', 2.22, 0.57, 3.69, 1.80, 4.44, 3.75], ['c', 0.36, 0.93, 0.57, 2.13, 0.57, 3.36], ['c', 0.00, 1.44, -0.48, 2.73, -1.38, 3.81], ['c', -1.26, 1.50, -3.27, 2.43, -5.28, 2.43], ['c', -0.48, 0.00, -0.51, 0.00, -0.75, -0.09], ['c', -0.15, -0.03, -0.48, -0.21, -0.78, -0.36], ['c', -0.69, -0.36, -0.87, -0.42, -1.26, -0.42], ['c', -0.27, 0.00, -0.30, 0.00, -0.51, 0.09], ['c', -0.57, 0.30, -0.81, 0.90, -0.81, 2.10], ['c', 0.00, 1.23, 0.24, 1.83, 0.81, 2.13], ['c', 0.21, 0.09, 0.24, 0.09, 0.51, 0.09], ['c', 0.39, 0.00, 0.57, -0.06, 1.26, -0.42], ['c', 0.30, -0.15, 0.63, -0.33, 0.78, -0.36], ['c', 0.24, -0.09, 0.27, -0.09, 0.75, -0.09], ['c', 2.01, 0.00, 4.02, 0.93, 5.28, 2.40], ['c', 0.90, 1.11, 1.38, 2.40, 1.38, 3.84], ['c', 0.00, 1.50, -0.30, 2.88, -0.84, 3.96], ['c', -0.78, 1.59, -2.19, 2.64, -4.17, 3.15], ['c', -1.05, 0.24, -2.67, 0.36, -3.51, 0.27], ['c', -1.83, -0.27, -3.30, -1.44, -3.81, -3.09], ['c', -0.18, -0.54, -0.21, -1.29, -0.09, -1.74], ['c', 0.15, -0.60, 0.63, -1.20, 1.23, -1.47], ['c', 0.36, -0.18, 0.57, -0.21, 0.99, -0.21], ['c', 0.42, 0.00, 0.63, 0.03, 1.02, 0.21], ['c', 0.42, 0.21, 0.84, 0.63, 1.05, 1.05], ['c', 0.18, 0.36, 0.21, 0.60, 0.21, 0.96], ['c', 0.00, 0.30, 0.00, 0.36, -0.06, 0.51], ['c', -0.12, 0.24, -0.27, 0.42, -0.69, 0.72], ['c', -0.57, 0.42, -0.69, 0.63, -0.69, 1.08], ['c', 0.00, 0.24, 0.00, 0.30, 0.06, 0.45], ['c', 0.12, 0.21, 0.30, 0.39, 0.57, 0.54], ['c', 0.42, 0.18, 0.87, 0.21, 1.53, 0.15], ['c', 1.08, -0.15, 1.80, -0.57, 2.34, -1.32], ['c', 0.54, -0.75, 0.84, -1.83, 0.99, -3.51], ['c', 0.06, -0.57, 0.06, -3.03, 0.00, -3.57], ['c', -0.12, -1.47, -0.42, -2.31, -0.99, -2.88], ['c', -0.27, -0.27, -0.63, -0.48, -1.08, -0.60], ['c', -0.27, -0.06, -0.39, -0.06, -0.84, -0.06], ['c', -0.45, 0.00, -0.57, 0.00, -0.78, 0.06], ['c', -1.14, 0.27, -2.01, 1.17, -2.46, 2.49], ['c', -0.21, 0.57, -0.30, 0.99, -0.33, 1.65], ['c', -0.03, 0.51, -0.06, 0.57, -0.24, 0.66], ['c', -0.12, 0.06, -0.27, 0.06, -0.39, 0.00], ['c', -0.21, -0.09, -0.21, -0.15, -0.24, -0.75], ['c', -0.09, -1.92, -0.78, -3.72, -2.01, -5.19], ['c', -0.18, -0.21, -0.36, -0.42, -0.39, -0.45], ['l', -0.09, -0.06], ['l', 0.00, 7.11], ['l', 0.00, 7.14], ['l', -0.06, 0.09], ['c', -0.09, 0.06, -0.09, 0.06, -0.54, 0.06], ['c', -0.48, 0.00, -0.48, 0.00, -0.57, -0.06], ['l', -0.06, -0.09], ['l', 0.00, -14.82], ['l', 0.00, -14.85], ['z']],
    w: 20.31,
    h: 29.97
  },
  'clefs.F': {
    d: [['M', 6.30, -7.80], ['c', 0.36, -0.03, 1.65, 0.00, 2.13, 0.03], ['c', 3.60, 0.42, 6.03, 2.10, 6.93, 4.86], ['c', 0.27, 0.84, 0.36, 1.50, 0.36, 2.58], ['c', 0.00, 0.90, -0.03, 1.35, -0.18, 2.16], ['c', -0.78, 3.78, -3.54, 7.08, -8.37, 9.96], ['c', -1.74, 1.05, -3.87, 2.13, -6.18, 3.12], ['c', -0.39, 0.18, -0.75, 0.33, -0.81, 0.36], ['c', -0.06, 0.03, -0.15, 0.06, -0.18, 0.06], ['c', -0.15, 0.00, -0.33, -0.18, -0.33, -0.33], ['c', 0.00, -0.15, 0.06, -0.21, 0.51, -0.48], ['c', 3.00, -1.77, 5.13, -3.21, 6.84, -4.74], ['c', 0.51, -0.45, 1.59, -1.50, 1.95, -1.95], ['c', 1.89, -2.19, 2.88, -4.32, 3.15, -6.78], ['c', 0.06, -0.42, 0.06, -1.77, 0.00, -2.19], ['c', -0.24, -2.01, -0.93, -3.63, -2.04, -4.71], ['c', -0.63, -0.63, -1.29, -1.02, -2.07, -1.20], ['c', -1.62, -0.39, -3.36, 0.15, -4.56, 1.44], ['c', -0.54, 0.60, -1.05, 1.47, -1.32, 2.22], ['l', -0.09, 0.21], ['l', 0.24, -0.12], ['c', 0.39, -0.21, 0.63, -0.24, 1.11, -0.24], ['c', 0.30, 0.00, 0.45, 0.00, 0.66, 0.06], ['c', 1.92, 0.48, 2.85, 2.55, 1.95, 4.38], ['c', -0.45, 0.99, -1.41, 1.62, -2.46, 1.71], ['c', -1.47, 0.09, -2.91, -0.87, -3.39, -2.25], ['c', -0.18, -0.57, -0.21, -1.32, -0.03, -2.28], ['c', 0.39, -2.25, 1.83, -4.20, 3.81, -5.19], ['c', 0.69, -0.36, 1.59, -0.60, 2.37, -0.69], ['z'], ['m', 11.58, 2.52], ['c', 0.84, -0.21, 1.71, 0.30, 1.89, 1.14], ['c', 0.30, 1.17, -0.72, 2.19, -1.89, 1.89], ['c', -0.99, -0.21, -1.50, -1.32, -1.02, -2.25], ['c', 0.18, -0.39, 0.60, -0.69, 1.02, -0.78], ['z'], ['m', 0.00, 7.50], ['c', 0.84, -0.21, 1.71, 0.30, 1.89, 1.14], ['c', 0.21, 0.87, -0.30, 1.71, -1.14, 1.89], ['c', -0.87, 0.21, -1.71, -0.30, -1.89, -1.14], ['c', -0.21, -0.84, 0.30, -1.71, 1.14, -1.89], ['z']],
    w: 20.153,
    h: 23.142
  },
  'clefs.G': {
    d: [['M', 9.69, -37.41], ['c', 0.09, -0.09, 0.24, -0.06, 0.36, 0.00], ['c', 0.12, 0.09, 0.57, 0.60, 0.96, 1.11], ['c', 1.77, 2.34, 3.21, 5.85, 3.57, 8.73], ['c', 0.21, 1.56, 0.03, 3.27, -0.45, 4.86], ['c', -0.69, 2.31, -1.92, 4.47, -4.23, 7.44], ['c', -0.30, 0.39, -0.57, 0.72, -0.60, 0.75], ['c', -0.03, 0.06, 0.00, 0.15, 0.18, 0.78], ['c', 0.54, 1.68, 1.38, 4.44, 1.68, 5.49], ['l', 0.09, 0.42], ['l', 0.39, 0.00], ['c', 1.47, 0.09, 2.76, 0.51, 3.96, 1.29], ['c', 1.83, 1.23, 3.06, 3.21, 3.39, 5.52], ['c', 0.09, 0.45, 0.12, 1.29, 0.06, 1.74], ['c', -0.09, 1.02, -0.33, 1.83, -0.75, 2.73], ['c', -0.84, 1.71, -2.28, 3.06, -4.02, 3.72], ['l', -0.33, 0.12], ['l', 0.03, 1.26], ['c', 0.00, 1.74, -0.06, 3.63, -0.21, 4.62], ['c', -0.45, 3.06, -2.19, 5.49, -4.47, 6.21], ['c', -0.57, 0.18, -0.90, 0.21, -1.59, 0.21], ['c', -0.69, 0.00, -1.02, -0.03, -1.65, -0.21], ['c', -1.14, -0.27, -2.13, -0.84, -2.94, -1.65], ['c', -0.99, -0.99, -1.56, -2.16, -1.71, -3.54], ['c', -0.09, -0.81, 0.06, -1.53, 0.45, -2.13], ['c', 0.63, -0.99, 1.83, -1.56, 3.00, -1.53], ['c', 1.50, 0.09, 2.64, 1.32, 2.73, 2.94], ['c', 0.06, 1.47, -0.93, 2.70, -2.37, 2.97], ['c', -0.45, 0.06, -0.84, 0.03, -1.29, -0.09], ['l', -0.21, -0.09], ['l', 0.09, 0.12], ['c', 0.39, 0.54, 0.78, 0.93, 1.32, 1.26], ['c', 1.35, 0.87, 3.06, 1.02, 4.35, 0.36], ['c', 1.44, -0.72, 2.52, -2.28, 2.97, -4.35], ['c', 0.15, -0.66, 0.24, -1.50, 0.30, -3.03], ['c', 0.03, -0.84, 0.03, -2.94, 0.00, -3.00], ['c', -0.03, 0.00, -0.18, 0.00, -0.36, 0.03], ['c', -0.66, 0.12, -0.99, 0.12, -1.83, 0.12], ['c', -1.05, 0.00, -1.71, -0.06, -2.61, -0.30], ['c', -4.02, -0.99, -7.11, -4.35, -7.80, -8.46], ['c', -0.12, -0.66, -0.12, -0.99, -0.12, -1.83], ['c', 0.00, -0.84, 0.00, -1.14, 0.15, -1.92], ['c', 0.36, -2.28, 1.41, -4.62, 3.30, -7.29], ['l', 2.79, -3.60], ['c', 0.54, -0.66, 0.96, -1.20, 0.96, -1.23], ['c', 0.00, -0.03, -0.09, -0.33, -0.18, -0.69], ['c', -0.96, -3.21, -1.41, -5.28, -1.59, -7.68], ['c', -0.12, -1.38, -0.15, -3.09, -0.06, -3.96], ['c', 0.33, -2.67, 1.38, -5.07, 3.12, -7.08], ['c', 0.36, -0.42, 0.99, -1.05, 1.17, -1.14], ['z'], ['m', 2.01, 4.71], ['c', -0.15, -0.30, -0.30, -0.54, -0.30, -0.54], ['c', -0.03, 0.00, -0.18, 0.09, -0.30, 0.21], ['c', -2.40, 1.74, -3.87, 4.20, -4.26, 7.11], ['c', -0.06, 0.54, -0.06, 1.41, -0.03, 1.89], ['c', 0.09, 1.29, 0.48, 3.12, 1.08, 5.22], ['c', 0.15, 0.42, 0.24, 0.78, 0.24, 0.81], ['c', 0.00, 0.03, 0.84, -1.11, 1.23, -1.68], ['c', 1.89, -2.73, 2.88, -5.07, 3.15, -7.53], ['c', 0.09, -0.57, 0.12, -1.74, 0.06, -2.37], ['c', -0.09, -1.23, -0.27, -1.92, -0.87, -3.12], ['z'], ['m', -2.94, 20.70], ['c', -0.21, -0.72, -0.39, -1.32, -0.42, -1.32], ['c', 0.00, 0.00, -1.20, 1.47, -1.86, 2.37], ['c', -2.79, 3.63, -4.02, 6.30, -4.35, 9.30], ['c', -0.03, 0.21, -0.03, 0.69, -0.03, 1.08], ['c', 0.00, 0.69, 0.00, 0.75, 0.06, 1.11], ['c', 0.12, 0.54, 0.27, 0.99, 0.51, 1.47], ['c', 0.69, 1.38, 1.83, 2.55, 3.42, 3.42], ['c', 0.96, 0.54, 2.07, 0.90, 3.21, 1.08], ['c', 0.78, 0.12, 2.04, 0.12, 2.94, -0.03], ['c', 0.51, -0.06, 0.45, -0.03, 0.42, -0.30], ['c', -0.24, -3.33, -0.72, -6.33, -1.62, -10.08], ['c', -0.09, -0.39, -0.18, -0.75, -0.18, -0.78], ['c', -0.03, -0.03, -0.42, 0.00, -0.81, 0.09], ['c', -0.90, 0.18, -1.65, 0.57, -2.22, 1.14], ['c', -0.72, 0.72, -1.08, 1.65, -1.05, 2.64], ['c', 0.06, 0.96, 0.48, 1.83, 1.23, 2.58], ['c', 0.36, 0.36, 0.72, 0.63, 1.17, 0.90], ['c', 0.33, 0.18, 0.36, 0.21, 0.42, 0.33], ['c', 0.18, 0.42, -0.18, 0.90, -0.60, 0.87], ['c', -0.18, -0.03, -0.84, -0.36, -1.26, -0.63], ['c', -0.78, -0.51, -1.38, -1.11, -1.86, -1.83], ['c', -1.77, -2.70, -0.99, -6.42, 1.71, -8.19], ['c', 0.30, -0.21, 0.81, -0.48, 1.17, -0.63], ['c', 0.30, -0.09, 1.02, -0.30, 1.14, -0.30], ['c', 0.06, 0.00, 0.09, 0.00, 0.09, -0.03], ['c', 0.03, -0.03, -0.51, -1.92, -1.23, -4.26], ['z'], ['m', 3.78, 7.41], ['c', -0.18, -0.03, -0.36, -0.06, -0.39, -0.06], ['c', -0.03, 0.00, 0.00, 0.21, 0.18, 1.02], ['c', 0.75, 3.18, 1.26, 6.30, 1.50, 9.09], ['c', 0.06, 0.72, 0.00, 0.69, 0.51, 0.42], ['c', 0.78, -0.36, 1.44, -0.96, 1.98, -1.77], ['c', 1.08, -1.62, 1.20, -3.69, 0.30, -5.55], ['c', -0.81, -1.62, -2.31, -2.79, -4.08, -3.15], ['z']],
    w: 19.051,
    h: 57.057
  },
  'clefs.perc': {
    d: [['M', 5.07, -7.44], ['l', 0.09, -0.06], ['l', 1.53, 0.00], ['l', 1.53, 0.00], ['l', 0.09, 0.06], ['l', 0.06, 0.09], ['l', 0.00, 7.35], ['l', 0.00, 7.32], ['l', -0.06, 0.09], ['l', -0.09, 0.06], ['l', -1.53, 0.00], ['l', -1.53, 0.00], ['l', -0.09, -0.06], ['l', -0.06, -0.09], ['l', 0.00, -7.32], ['l', 0.00, -7.35], ['z'], ['m', 6.63, 0.00], ['l', 0.09, -0.06], ['l', 1.53, 0.00], ['l', 1.53, 0.00], ['l', 0.09, 0.06], ['l', 0.06, 0.09], ['l', 0.00, 7.35], ['l', 0.00, 7.32], ['l', -0.06, 0.09], ['l', -0.09, 0.06], ['l', -1.53, 0.00], ['l', -1.53, 0.00], ['l', -0.09, -0.06], ['l', -0.06, -0.09], ['l', 0.00, -7.32], ['l', 0.00, -7.35], ['z']],
    w: 21,
    h: 14.97
  },
  'timesig.common': {
    d: [['M', 6.66, -7.83], ['c', 0.72, -0.06, 1.41, -0.03, 1.98, 0.09], ['c', 1.20, 0.27, 2.34, 0.96, 3.09, 1.92], ['c', 0.63, 0.81, 1.08, 1.86, 1.14, 2.73], ['c', 0.06, 1.02, -0.51, 1.92, -1.44, 2.22], ['c', -0.24, 0.09, -0.30, 0.09, -0.63, 0.09], ['c', -0.33, 0.00, -0.42, 0.00, -0.63, -0.06], ['c', -0.66, -0.24, -1.14, -0.63, -1.41, -1.20], ['c', -0.15, -0.30, -0.21, -0.51, -0.24, -0.90], ['c', -0.06, -1.08, 0.57, -2.04, 1.56, -2.37], ['c', 0.18, -0.06, 0.27, -0.06, 0.63, -0.06], ['l', 0.45, 0.00], ['c', 0.06, 0.03, 0.09, 0.03, 0.09, 0.00], ['c', 0.00, 0.00, -0.09, -0.12, -0.24, -0.27], ['c', -1.02, -1.11, -2.55, -1.68, -4.08, -1.50], ['c', -1.29, 0.15, -2.04, 0.69, -2.40, 1.74], ['c', -0.36, 0.93, -0.42, 1.89, -0.42, 5.37], ['c', 0.00, 2.97, 0.06, 3.96, 0.24, 4.77], ['c', 0.24, 1.08, 0.63, 1.68, 1.41, 2.07], ['c', 0.81, 0.39, 2.16, 0.45, 3.18, 0.09], ['c', 1.29, -0.45, 2.37, -1.53, 3.03, -2.97], ['c', 0.15, -0.33, 0.33, -0.87, 0.39, -1.17], ['c', 0.09, -0.24, 0.15, -0.36, 0.30, -0.39], ['c', 0.21, -0.03, 0.42, 0.15, 0.39, 0.36], ['c', -0.06, 0.39, -0.42, 1.38, -0.69, 1.89], ['c', -0.96, 1.80, -2.49, 2.94, -4.23, 3.18], ['c', -0.99, 0.12, -2.58, -0.06, -3.63, -0.45], ['c', -0.96, -0.36, -1.71, -0.84, -2.40, -1.50], ['c', -1.11, -1.11, -1.80, -2.61, -2.04, -4.56], ['c', -0.06, -0.60, -0.06, -2.01, 0.00, -2.61], ['c', 0.24, -1.95, 0.90, -3.45, 2.01, -4.56], ['c', 0.69, -0.66, 1.44, -1.11, 2.37, -1.47], ['c', 0.63, -0.24, 1.47, -0.42, 2.22, -0.48], ['z']],
    w: 13.038,
    h: 15.689
  },
  'timesig.cut': {
    d: [['M', 6.24, -10.44], ['c', 0.09, -0.06, 0.09, -0.06, 0.48, -0.06], ['c', 0.36, 0.00, 0.36, 0.00, 0.45, 0.06], ['l', 0.06, 0.09], ['l', 0.00, 1.23], ['l', 0.00, 1.26], ['l', 0.27, 0.00], ['c', 1.26, 0.00, 2.49, 0.45, 3.48, 1.29], ['c', 1.05, 0.87, 1.80, 2.28, 1.89, 3.48], ['c', 0.06, 1.02, -0.51, 1.92, -1.44, 2.22], ['c', -0.24, 0.09, -0.30, 0.09, -0.63, 0.09], ['c', -0.33, 0.00, -0.42, 0.00, -0.63, -0.06], ['c', -0.66, -0.24, -1.14, -0.63, -1.41, -1.20], ['c', -0.15, -0.30, -0.21, -0.51, -0.24, -0.90], ['c', -0.06, -1.08, 0.57, -2.04, 1.56, -2.37], ['c', 0.18, -0.06, 0.27, -0.06, 0.63, -0.06], ['l', 0.45, 0.00], ['c', 0.06, 0.03, 0.09, 0.03, 0.09, 0.00], ['c', 0.00, -0.03, -0.45, -0.51, -0.66, -0.69], ['c', -0.87, -0.69, -1.83, -1.05, -2.94, -1.11], ['l', -0.42, 0.00], ['l', 0.00, 7.17], ['l', 0.00, 7.14], ['l', 0.42, 0.00], ['c', 0.69, -0.03, 1.23, -0.18, 1.86, -0.51], ['c', 1.05, -0.51, 1.89, -1.47, 2.46, -2.70], ['c', 0.15, -0.33, 0.33, -0.87, 0.39, -1.17], ['c', 0.09, -0.24, 0.15, -0.36, 0.30, -0.39], ['c', 0.21, -0.03, 0.42, 0.15, 0.39, 0.36], ['c', -0.03, 0.24, -0.21, 0.78, -0.39, 1.20], ['c', -0.96, 2.37, -2.94, 3.90, -5.13, 3.90], ['l', -0.30, 0.00], ['l', 0.00, 1.26], ['l', 0.00, 1.23], ['l', -0.06, 0.09], ['c', -0.09, 0.06, -0.09, 0.06, -0.45, 0.06], ['c', -0.39, 0.00, -0.39, 0.00, -0.48, -0.06], ['l', -0.06, -0.09], ['l', 0.00, -1.29], ['l', 0.00, -1.29], ['l', -0.21, -0.03], ['c', -1.23, -0.21, -2.31, -0.63, -3.21, -1.29], ['c', -0.15, -0.09, -0.45, -0.36, -0.66, -0.57], ['c', -1.11, -1.11, -1.80, -2.61, -2.04, -4.56], ['c', -0.06, -0.60, -0.06, -2.01, 0.00, -2.61], ['c', 0.24, -1.95, 0.93, -3.45, 2.04, -4.59], ['c', 0.42, -0.39, 0.78, -0.66, 1.26, -0.93], ['c', 0.75, -0.45, 1.65, -0.75, 2.61, -0.90], ['l', 0.21, -0.03], ['l', 0.00, -1.29], ['l', 0.00, -1.29], ['z'], ['m', -0.06, 10.44], ['c', 0.00, -5.58, 0.00, -6.99, -0.03, -6.99], ['c', -0.15, 0.00, -0.63, 0.27, -0.87, 0.45], ['c', -0.45, 0.36, -0.75, 0.93, -0.93, 1.77], ['c', -0.18, 0.81, -0.24, 1.80, -0.24, 4.74], ['c', 0.00, 2.97, 0.06, 3.96, 0.24, 4.77], ['c', 0.24, 1.08, 0.66, 1.68, 1.41, 2.07], ['c', 0.12, 0.06, 0.30, 0.12, 0.33, 0.15], ['l', 0.09, 0.00], ['l', 0.00, -6.96], ['z']],
    w: 13.038,
    h: 20.97
  },
  'timesig.imperfectum': {
    d: [['M', 13, -5], ['a', 8, 8, 0, 1, 0, 0, 10]],
    w: 13.038,
    h: 20.97
  },
  'timesig.imperfectum2': {
    d: [['M', 13, -5], ['a', 8, 8, 0, 1, 0, 0, 10]],
    w: 13.038,
    h: 20.97
  },
  'timesig.perfectum': {
    d: [['M', 13, -5], ['a', 8, 8, 0, 1, 0, 0, 10]],
    w: 13.038,
    h: 20.97
  },
  'timesig.perfectum2': {
    d: [['M', 13, -5], ['a', 8, 8, 0, 1, 0, 0, 10]],
    w: 13.038,
    h: 20.97
  },
  'f': {
    d: [['M', 9.93, -14.28], ['c', 1.53, -0.18, 2.88, 0.45, 3.12, 1.50], ['c', 0.12, 0.51, 0.00, 1.32, -0.27, 1.86], ['c', -0.15, 0.30, -0.42, 0.57, -0.63, 0.69], ['c', -0.69, 0.36, -1.56, 0.03, -1.83, -0.69], ['c', -0.09, -0.24, -0.09, -0.69, 0.00, -0.87], ['c', 0.06, -0.12, 0.21, -0.24, 0.45, -0.42], ['c', 0.42, -0.24, 0.57, -0.45, 0.60, -0.72], ['c', 0.03, -0.33, -0.09, -0.39, -0.63, -0.42], ['c', -0.30, 0.00, -0.45, 0.00, -0.60, 0.03], ['c', -0.81, 0.21, -1.35, 0.93, -1.74, 2.46], ['c', -0.06, 0.27, -0.48, 2.25, -0.48, 2.31], ['c', 0.00, 0.03, 0.39, 0.03, 0.90, 0.03], ['c', 0.72, 0.00, 0.90, 0.00, 0.99, 0.06], ['c', 0.42, 0.15, 0.45, 0.72, 0.03, 0.90], ['c', -0.12, 0.06, -0.24, 0.06, -1.17, 0.06], ['l', -1.05, 0.00], ['l', -0.78, 2.55], ['c', -0.45, 1.41, -0.87, 2.79, -0.96, 3.06], ['c', -0.87, 2.37, -2.37, 4.74, -3.78, 5.91], ['c', -1.05, 0.90, -2.04, 1.23, -3.09, 1.08], ['c', -1.11, -0.18, -1.89, -0.78, -2.04, -1.59], ['c', -0.12, -0.66, 0.15, -1.71, 0.54, -2.19], ['c', 0.69, -0.75, 1.86, -0.54, 2.22, 0.39], ['c', 0.06, 0.15, 0.09, 0.27, 0.09, 0.48], ['c', 0.00, 0.24, -0.03, 0.27, -0.12, 0.42], ['c', -0.03, 0.09, -0.15, 0.18, -0.27, 0.27], ['c', -0.09, 0.06, -0.27, 0.21, -0.36, 0.27], ['c', -0.24, 0.18, -0.36, 0.36, -0.39, 0.60], ['c', -0.03, 0.33, 0.09, 0.39, 0.63, 0.42], ['c', 0.42, 0.00, 0.63, -0.03, 0.90, -0.15], ['c', 0.60, -0.30, 0.96, -0.96, 1.38, -2.64], ['c', 0.09, -0.42, 0.63, -2.55, 1.17, -4.77], ['l', 1.02, -4.08], ['c', 0.00, -0.03, -0.36, -0.03, -0.81, -0.03], ['c', -0.72, 0.00, -0.81, 0.00, -0.93, -0.06], ['c', -0.42, -0.18, -0.39, -0.75, 0.03, -0.90], ['c', 0.09, -0.06, 0.27, -0.06, 1.05, -0.06], ['l', 0.96, 0.00], ['l', 0.00, -0.09], ['c', 0.06, -0.18, 0.30, -0.72, 0.51, -1.17], ['c', 1.20, -2.46, 3.30, -4.23, 5.34, -4.50], ['z']],
    w: 16.155,
    h: 19.445
  },
  'm': {
    d: [['M', 2.79, -8.91], ['c', 0.09, 0.00, 0.30, -0.03, 0.45, -0.03], ['c', 0.24, 0.03, 0.30, 0.03, 0.45, 0.12], ['c', 0.36, 0.15, 0.63, 0.54, 0.75, 1.02], ['l', 0.03, 0.21], ['l', 0.33, -0.30], ['c', 0.69, -0.69, 1.38, -1.02, 2.07, -1.02], ['c', 0.27, 0.00, 0.33, 0.00, 0.48, 0.06], ['c', 0.21, 0.09, 0.48, 0.36, 0.63, 0.60], ['c', 0.03, 0.09, 0.12, 0.27, 0.18, 0.42], ['c', 0.03, 0.15, 0.09, 0.27, 0.12, 0.27], ['c', 0.00, 0.00, 0.09, -0.09, 0.18, -0.21], ['c', 0.33, -0.39, 0.87, -0.81, 1.29, -0.99], ['c', 0.78, -0.33, 1.47, -0.21, 2.01, 0.33], ['c', 0.30, 0.33, 0.48, 0.69, 0.60, 1.14], ['c', 0.09, 0.42, 0.06, 0.54, -0.54, 3.06], ['c', -0.33, 1.29, -0.57, 2.40, -0.57, 2.43], ['c', 0.00, 0.12, 0.09, 0.21, 0.21, 0.21], ['c', 0.24, 0.00, 0.75, -0.30, 1.20, -0.72], ['c', 0.45, -0.39, 0.60, -0.45, 0.78, -0.27], ['c', 0.18, 0.18, 0.09, 0.36, -0.45, 0.87], ['c', -1.05, 0.96, -1.83, 1.47, -2.58, 1.71], ['c', -0.93, 0.33, -1.53, 0.21, -1.80, -0.33], ['c', -0.06, -0.15, -0.06, -0.21, -0.06, -0.45], ['c', 0.00, -0.24, 0.03, -0.48, 0.60, -2.82], ['c', 0.42, -1.71, 0.60, -2.64, 0.63, -2.79], ['c', 0.03, -0.57, -0.30, -0.75, -0.84, -0.48], ['c', -0.24, 0.12, -0.54, 0.39, -0.66, 0.63], ['c', -0.03, 0.09, -0.42, 1.38, -0.90, 3.00], ['c', -0.90, 3.15, -0.84, 3.00, -1.14, 3.15], ['l', -0.15, 0.09], ['l', -0.78, 0.00], ['c', -0.60, 0.00, -0.78, 0.00, -0.84, -0.06], ['c', -0.09, -0.03, -0.18, -0.18, -0.18, -0.27], ['c', 0.00, -0.03, 0.36, -1.38, 0.84, -2.97], ['c', 0.57, -2.04, 0.81, -2.97, 0.84, -3.12], ['c', 0.03, -0.54, -0.30, -0.72, -0.84, -0.45], ['c', -0.24, 0.12, -0.57, 0.42, -0.66, 0.63], ['c', -0.06, 0.09, -0.51, 1.44, -1.05, 2.97], ['c', -0.51, 1.56, -0.99, 2.85, -0.99, 2.91], ['c', -0.06, 0.12, -0.21, 0.24, -0.36, 0.30], ['c', -0.12, 0.06, -0.21, 0.06, -0.90, 0.06], ['c', -0.60, 0.00, -0.78, 0.00, -0.84, -0.06], ['c', -0.09, -0.03, -0.18, -0.18, -0.18, -0.27], ['c', 0.00, -0.03, 0.45, -1.38, 0.99, -2.97], ['c', 1.05, -3.18, 1.05, -3.18, 0.93, -3.45], ['c', -0.12, -0.27, -0.39, -0.30, -0.72, -0.15], ['c', -0.54, 0.27, -1.14, 1.17, -1.56, 2.40], ['c', -0.06, 0.15, -0.15, 0.30, -0.18, 0.36], ['c', -0.21, 0.21, -0.57, 0.27, -0.72, 0.09], ['c', -0.09, -0.09, -0.06, -0.21, 0.06, -0.63], ['c', 0.48, -1.26, 1.26, -2.46, 2.01, -3.21], ['c', 0.57, -0.54, 1.20, -0.87, 1.83, -1.02], ['z']],
    w: 14.687,
    h: 9.126
  },
  'p': {
    d: [['M', 1.92, -8.70], ['c', 0.27, -0.09, 0.81, -0.06, 1.11, 0.03], ['c', 0.54, 0.18, 0.93, 0.51, 1.17, 0.99], ['c', 0.09, 0.15, 0.15, 0.33, 0.18, 0.36], ['l', 0.00, 0.12], ['l', 0.30, -0.27], ['c', 0.66, -0.60, 1.35, -1.02, 2.13, -1.20], ['c', 0.21, -0.06, 0.33, -0.06, 0.78, -0.06], ['c', 0.45, 0.00, 0.51, 0.00, 0.84, 0.09], ['c', 1.29, 0.33, 2.07, 1.32, 2.25, 2.79], ['c', 0.09, 0.81, -0.09, 2.01, -0.45, 2.79], ['c', -0.54, 1.26, -1.86, 2.55, -3.18, 3.03], ['c', -0.45, 0.18, -0.81, 0.24, -1.29, 0.24], ['c', -0.69, -0.03, -1.35, -0.18, -1.86, -0.45], ['c', -0.30, -0.15, -0.51, -0.18, -0.69, -0.09], ['c', -0.09, 0.03, -0.18, 0.09, -0.18, 0.12], ['c', -0.09, 0.12, -1.05, 2.94, -1.05, 3.06], ['c', 0.00, 0.24, 0.18, 0.48, 0.51, 0.63], ['c', 0.18, 0.06, 0.54, 0.15, 0.75, 0.15], ['c', 0.21, 0.00, 0.36, 0.06, 0.42, 0.18], ['c', 0.12, 0.18, 0.06, 0.42, -0.12, 0.54], ['c', -0.09, 0.03, -0.15, 0.03, -0.78, 0.00], ['c', -1.98, -0.15, -3.81, -0.15, -5.79, 0.00], ['c', -0.63, 0.03, -0.69, 0.03, -0.78, 0.00], ['c', -0.24, -0.15, -0.24, -0.57, 0.03, -0.66], ['c', 0.06, -0.03, 0.48, -0.09, 0.99, -0.12], ['c', 0.87, -0.06, 1.11, -0.09, 1.35, -0.21], ['c', 0.18, -0.06, 0.33, -0.18, 0.39, -0.30], ['c', 0.06, -0.12, 3.24, -9.42, 3.27, -9.60], ['c', 0.06, -0.33, 0.03, -0.57, -0.15, -0.69], ['c', -0.09, -0.06, -0.12, -0.06, -0.30, -0.06], ['c', -0.69, 0.06, -1.53, 1.02, -2.28, 2.61], ['c', -0.09, 0.21, -0.21, 0.45, -0.27, 0.51], ['c', -0.09, 0.12, -0.33, 0.24, -0.48, 0.24], ['c', -0.18, 0.00, -0.36, -0.15, -0.36, -0.30], ['c', 0.00, -0.24, 0.78, -1.83, 1.26, -2.55], ['c', 0.72, -1.11, 1.47, -1.74, 2.28, -1.92], ['z'], ['m', 5.37, 1.47], ['c', -0.27, -0.12, -0.75, -0.03, -1.14, 0.21], ['c', -0.75, 0.48, -1.47, 1.68, -1.89, 3.15], ['c', -0.45, 1.47, -0.42, 2.34, 0.00, 2.70], ['c', 0.45, 0.39, 1.26, 0.21, 1.83, -0.36], ['c', 0.51, -0.51, 0.99, -1.68, 1.38, -3.27], ['c', 0.30, -1.17, 0.33, -1.74, 0.15, -2.13], ['c', -0.09, -0.15, -0.15, -0.21, -0.33, -0.30], ['z']],
    w: 14.689,
    h: 13.127
  },
  'r': {
    d: [['M', 6.33, -9.12], ['c', 0.27, -0.03, 0.93, 0.00, 1.20, 0.06], ['c', 0.84, 0.21, 1.23, 0.81, 1.02, 1.53], ['c', -0.24, 0.75, -0.90, 1.17, -1.56, 0.96], ['c', -0.33, -0.09, -0.51, -0.30, -0.66, -0.75], ['c', -0.03, -0.12, -0.09, -0.24, -0.12, -0.30], ['c', -0.09, -0.15, -0.30, -0.24, -0.48, -0.24], ['c', -0.57, 0.00, -1.38, 0.54, -1.65, 1.08], ['c', -0.06, 0.15, -0.33, 1.17, -0.90, 3.27], ['c', -0.57, 2.31, -0.81, 3.12, -0.87, 3.21], ['c', -0.03, 0.06, -0.12, 0.15, -0.18, 0.21], ['l', -0.12, 0.06], ['l', -0.81, 0.03], ['c', -0.69, 0.00, -0.81, 0.00, -0.90, -0.03], ['c', -0.09, -0.06, -0.18, -0.21, -0.18, -0.30], ['c', 0.00, -0.06, 0.39, -1.62, 0.90, -3.51], ['c', 0.84, -3.24, 0.87, -3.45, 0.87, -3.72], ['c', 0.00, -0.21, 0.00, -0.27, -0.03, -0.36], ['c', -0.12, -0.15, -0.21, -0.24, -0.42, -0.24], ['c', -0.24, 0.00, -0.45, 0.15, -0.78, 0.42], ['c', -0.33, 0.36, -0.45, 0.54, -0.72, 1.14], ['c', -0.03, 0.12, -0.21, 0.24, -0.36, 0.27], ['c', -0.12, 0.00, -0.15, 0.00, -0.24, -0.06], ['c', -0.18, -0.12, -0.18, -0.21, -0.06, -0.54], ['c', 0.21, -0.57, 0.42, -0.93, 0.78, -1.32], ['c', 0.54, -0.51, 1.20, -0.81, 1.95, -0.87], ['c', 0.81, -0.03, 1.53, 0.30, 1.92, 0.87], ['l', 0.12, 0.18], ['l', 0.09, -0.09], ['c', 0.57, -0.45, 1.41, -0.84, 2.19, -0.96], ['z']],
    w: 9.41,
    h: 9.132
  },
  's': {
    d: [['M', 4.47, -8.73], ['c', 0.09, 0.00, 0.36, -0.03, 0.57, -0.03], ['c', 0.75, 0.03, 1.29, 0.24, 1.71, 0.63], ['c', 0.51, 0.54, 0.66, 1.26, 0.36, 1.83], ['c', -0.24, 0.42, -0.63, 0.57, -1.11, 0.42], ['c', -0.33, -0.09, -0.60, -0.36, -0.60, -0.57], ['c', 0.00, -0.03, 0.06, -0.21, 0.15, -0.39], ['c', 0.12, -0.21, 0.15, -0.33, 0.18, -0.48], ['c', 0.00, -0.24, -0.06, -0.48, -0.15, -0.60], ['c', -0.15, -0.21, -0.42, -0.24, -0.75, -0.15], ['c', -0.27, 0.06, -0.48, 0.18, -0.69, 0.36], ['c', -0.39, 0.39, -0.51, 0.96, -0.33, 1.38], ['c', 0.09, 0.21, 0.42, 0.51, 0.78, 0.72], ['c', 1.11, 0.69, 1.59, 1.11, 1.89, 1.68], ['c', 0.21, 0.39, 0.24, 0.78, 0.15, 1.29], ['c', -0.18, 1.20, -1.17, 2.16, -2.52, 2.52], ['c', -1.02, 0.24, -1.95, 0.12, -2.70, -0.42], ['c', -0.72, -0.51, -0.99, -1.47, -0.60, -2.19], ['c', 0.24, -0.48, 0.72, -0.63, 1.17, -0.42], ['c', 0.33, 0.18, 0.54, 0.45, 0.57, 0.81], ['c', 0.00, 0.21, -0.03, 0.30, -0.33, 0.51], ['c', -0.33, 0.24, -0.39, 0.42, -0.27, 0.69], ['c', 0.06, 0.15, 0.21, 0.27, 0.45, 0.33], ['c', 0.30, 0.09, 0.87, 0.09, 1.20, 0.00], ['c', 0.75, -0.21, 1.23, -0.72, 1.29, -1.35], ['c', 0.03, -0.42, -0.15, -0.81, -0.54, -1.20], ['c', -0.24, -0.24, -0.48, -0.42, -1.41, -1.02], ['c', -0.69, -0.42, -1.05, -0.93, -1.05, -1.47], ['c', 0.00, -0.39, 0.12, -0.87, 0.30, -1.23], ['c', 0.27, -0.57, 0.78, -1.05, 1.38, -1.35], ['c', 0.24, -0.12, 0.63, -0.27, 0.90, -0.30], ['z']],
    w: 6.632,
    h: 8.758
  },
  'z': {
    d: [['M', 2.64, -7.95], ['c', 0.36, -0.09, 0.81, -0.03, 1.71, 0.27], ['c', 0.78, 0.21, 0.96, 0.27, 1.74, 0.30], ['c', 0.87, 0.06, 1.02, 0.03, 1.38, -0.21], ['c', 0.21, -0.15, 0.33, -0.15, 0.48, -0.06], ['c', 0.15, 0.09, 0.21, 0.30, 0.15, 0.45], ['c', -0.03, 0.06, -1.26, 1.26, -2.76, 2.67], ['l', -2.73, 2.55], ['l', 0.54, 0.03], ['c', 0.54, 0.03, 0.72, 0.03, 2.01, 0.15], ['c', 0.36, 0.03, 0.90, 0.06, 1.20, 0.09], ['c', 0.66, 0.00, 0.81, -0.03, 1.02, -0.24], ['c', 0.30, -0.30, 0.39, -0.72, 0.27, -1.23], ['c', -0.06, -0.27, -0.06, -0.27, -0.03, -0.39], ['c', 0.15, -0.30, 0.54, -0.27, 0.69, 0.03], ['c', 0.15, 0.33, 0.27, 1.02, 0.27, 1.50], ['c', 0.00, 1.47, -1.11, 2.70, -2.52, 2.79], ['c', -0.57, 0.03, -1.02, -0.09, -2.01, -0.51], ['c', -1.02, -0.42, -1.23, -0.48, -2.13, -0.54], ['c', -0.81, -0.06, -0.96, -0.03, -1.26, 0.18], ['c', -0.12, 0.06, -0.24, 0.12, -0.27, 0.12], ['c', -0.27, 0.00, -0.45, -0.30, -0.36, -0.51], ['c', 0.03, -0.06, 1.32, -1.32, 2.91, -2.79], ['l', 2.88, -2.73], ['c', -0.03, 0.00, -0.21, 0.03, -0.42, 0.06], ['c', -0.21, 0.03, -0.78, 0.09, -1.23, 0.12], ['c', -1.11, 0.12, -1.23, 0.15, -1.95, 0.27], ['c', -0.72, 0.15, -1.17, 0.18, -1.29, 0.09], ['c', -0.27, -0.18, -0.21, -0.75, 0.12, -1.26], ['c', 0.39, -0.60, 0.93, -1.02, 1.59, -1.20], ['z']],
    w: 8.573,
    h: 8.743
  },
  '+': {
    d: [['M', 3.48, -9.3], ['c', 0.18, -0.09, 0.36, -0.09, 0.54, 0.00], ['c', 0.18, 0.09, 0.24, 0.15, 0.33, 0.30], ['l', 0.06, 0.15], ['l', 0.00, 1.29], ['l', 0.00, 1.29], ['l', 1.29, 0.00], ['c', 1.23, 0.00, 1.29, 0.00, 1.41, 0.06], ['c', 0.06, 0.03, 0.15, 0.09, 0.18, 0.12], ['c', 0.12, 0.09, 0.21, 0.33, 0.21, 0.48], ['c', 0.00, 0.15, -0.09, 0.39, -0.21, 0.48], ['c', -0.03, 0.03, -0.12, 0.09, -0.18, 0.12], ['c', -0.12, 0.06, -0.18, 0.06, -1.41, 0.06], ['l', -1.29, 0.00], ['l', 0.00, 1.29], ['c', 0.00, 1.23, 0.00, 1.29, -0.06, 1.41], ['c', -0.09, 0.18, -0.15, 0.24, -0.30, 0.33], ['c', -0.21, 0.09, -0.39, 0.09, -0.57, 0.00], ['c', -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ['c', -0.06, -0.12, -0.06, -0.18, -0.06, -1.41], ['l', 0.00, -1.29], ['l', -1.29, 0.00], ['c', -1.23, 0.00, -1.29, 0.00, -1.41, -0.06], ['c', -0.18, -0.09, -0.24, -0.15, -0.33, -0.33], ['c', -0.09, -0.18, -0.09, -0.36, 0.00, -0.54], ['c', 0.09, -0.18, 0.15, -0.24, 0.33, -0.33], ['l', 0.15, -0.06], ['l', 1.26, 0.00], ['l', 1.29, 0.00], ['l', 0.00, -1.29], ['c', 0.00, -1.23, 0.00, -1.29, 0.06, -1.41], ['c', 0.09, -0.18, 0.15, -0.24, 0.33, -0.33], ['z']],
    w: 7.507,
    h: 7.515
  },
  ',': {
    d: [['M', 1.32, -3.36], ['c', 0.57, -0.15, 1.17, 0.03, 1.59, 0.45], ['c', 0.45, 0.45, 0.60, 0.96, 0.51, 1.89], ['c', -0.09, 1.23, -0.42, 2.46, -0.99, 3.93], ['c', -0.30, 0.72, -0.72, 1.62, -0.78, 1.68], ['c', -0.18, 0.21, -0.51, 0.18, -0.66, -0.06], ['c', -0.03, -0.06, -0.06, -0.15, -0.06, -0.18], ['c', 0.00, -0.06, 0.12, -0.33, 0.24, -0.63], ['c', 0.84, -1.80, 1.02, -2.61, 0.69, -3.24], ['c', -0.12, -0.24, -0.27, -0.36, -0.75, -0.60], ['c', -0.36, -0.15, -0.42, -0.21, -0.60, -0.39], ['c', -0.69, -0.69, -0.69, -1.71, 0.00, -2.40], ['c', 0.21, -0.21, 0.51, -0.39, 0.81, -0.45], ['z']],
    w: 3.452,
    h: 8.143
  },
  '-': {
    d: [['M', 0.18, -5.34], ['c', 0.09, -0.06, 0.15, -0.06, 2.31, -0.06], ['c', 2.46, 0.00, 2.37, 0.00, 2.46, 0.21], ['c', 0.12, 0.21, 0.03, 0.42, -0.15, 0.54], ['c', -0.09, 0.06, -0.15, 0.06, -2.28, 0.06], ['c', -2.16, 0.00, -2.22, 0.00, -2.31, -0.06], ['c', -0.27, -0.15, -0.27, -0.54, -0.03, -0.69], ['z']],
    w: 5.001,
    h: 0.81
  },
  '.': {
    d: [['M', 1.32, -3.36], ['c', 1.05, -0.27, 2.10, 0.57, 2.10, 1.65], ['c', 0.00, 1.08, -1.05, 1.92, -2.10, 1.65], ['c', -0.90, -0.21, -1.50, -1.14, -1.26, -2.04], ['c', 0.12, -0.63, 0.63, -1.11, 1.26, -1.26], ['z']],
    w: 3.413,
    h: 3.402
  },
  'scripts.wedge': {
    d: [['M', -3.66, -7.44], ['c', 0.06, -0.09, 0.00, -0.09, 0.81, 0.03], ['c', 1.86, 0.30, 3.84, 0.30, 5.73, 0.00], ['c', 0.78, -0.12, 0.72, -0.12, 0.78, -0.03], ['c', 0.15, 0.15, 0.12, 0.24, -0.24, 0.60], ['c', -0.93, 0.93, -1.98, 2.76, -2.67, 4.62], ['c', -0.30, 0.78, -0.51, 1.71, -0.51, 2.13], ['c', 0.00, 0.15, 0.00, 0.18, -0.06, 0.27], ['c', -0.12, 0.09, -0.24, 0.09, -0.36, 0.00], ['c', -0.06, -0.09, -0.06, -0.12, -0.06, -0.27], ['c', 0.00, -0.42, -0.21, -1.35, -0.51, -2.13], ['c', -0.69, -1.86, -1.74, -3.69, -2.67, -4.62], ['c', -0.36, -0.36, -0.39, -0.45, -0.24, -0.60], ['z']],
    w: 7.49,
    h: 7.752
  },
  'scripts.thumb': {
    d: [['M', -0.54, -3.69], ['c', 0.15, -0.03, 0.36, -0.06, 0.51, -0.06], ['c', 1.44, 0.00, 2.58, 1.11, 2.94, 2.85], ['c', 0.09, 0.48, 0.09, 1.32, 0.00, 1.80], ['c', -0.27, 1.41, -1.08, 2.43, -2.16, 2.73], ['l', -0.18, 0.06], ['l', 0.00, 0.12], ['c', 0.03, 0.06, 0.06, 0.45, 0.09, 0.87], ['c', 0.03, 0.57, 0.03, 0.78, 0.00, 0.84], ['c', -0.09, 0.27, -0.39, 0.48, -0.66, 0.48], ['c', -0.27, 0.00, -0.57, -0.21, -0.66, -0.48], ['c', -0.03, -0.06, -0.03, -0.27, 0.00, -0.84], ['c', 0.03, -0.42, 0.06, -0.81, 0.09, -0.87], ['l', 0.00, -0.12], ['l', -0.18, -0.06], ['c', -1.08, -0.30, -1.89, -1.32, -2.16, -2.73], ['c', -0.09, -0.48, -0.09, -1.32, 0.00, -1.80], ['c', 0.15, -0.84, 0.51, -1.53, 1.02, -2.04], ['c', 0.39, -0.39, 0.84, -0.63, 1.35, -0.75], ['z'], ['m', 1.05, 0.90], ['c', -0.15, -0.09, -0.21, -0.09, -0.45, -0.12], ['c', -0.15, 0.00, -0.30, 0.03, -0.39, 0.03], ['c', -0.57, 0.18, -0.90, 0.72, -1.08, 1.74], ['c', -0.06, 0.48, -0.06, 1.80, 0.00, 2.28], ['c', 0.15, 0.90, 0.42, 1.44, 0.90, 1.65], ['c', 0.18, 0.09, 0.21, 0.09, 0.51, 0.09], ['c', 0.30, 0.00, 0.33, 0.00, 0.51, -0.09], ['c', 0.48, -0.21, 0.75, -0.75, 0.90, -1.65], ['c', 0.03, -0.27, 0.03, -0.54, 0.03, -1.14], ['c', 0.00, -0.60, 0.00, -0.87, -0.03, -1.14], ['c', -0.15, -0.90, -0.45, -1.44, -0.90, -1.65], ['z']],
    w: 5.955,
    h: 9.75
  },
  'scripts.open': {
    d: [['M', -0.54, -3.69], ['c', 0.15, -0.03, 0.36, -0.06, 0.51, -0.06], ['c', 1.44, 0.00, 2.58, 1.11, 2.94, 2.85], ['c', 0.09, 0.48, 0.09, 1.32, 0.00, 1.80], ['c', -0.33, 1.74, -1.47, 2.85, -2.91, 2.85], ['c', -1.44, 0.00, -2.58, -1.11, -2.91, -2.85], ['c', -0.09, -0.48, -0.09, -1.32, 0.00, -1.80], ['c', 0.15, -0.84, 0.51, -1.53, 1.02, -2.04], ['c', 0.39, -0.39, 0.84, -0.63, 1.35, -0.75], ['z'], ['m', 1.11, 0.90], ['c', -0.21, -0.09, -0.27, -0.09, -0.51, -0.12], ['c', -0.30, 0.00, -0.42, 0.03, -0.66, 0.15], ['c', -0.24, 0.12, -0.51, 0.39, -0.66, 0.63], ['c', -0.54, 0.93, -0.63, 2.64, -0.21, 3.81], ['c', 0.21, 0.54, 0.51, 0.90, 0.93, 1.11], ['c', 0.21, 0.09, 0.24, 0.09, 0.54, 0.09], ['c', 0.30, 0.00, 0.33, 0.00, 0.54, -0.09], ['c', 0.42, -0.21, 0.72, -0.57, 0.93, -1.11], ['c', 0.36, -0.99, 0.36, -2.37, 0.00, -3.36], ['c', -0.21, -0.54, -0.51, -0.90, -0.90, -1.11], ['z']],
    w: 5.955,
    h: 7.5
  },
  'scripts.longphrase': {
    d: [['M', 1.47, -15.09], ['c', 0.36, -0.09, 0.66, -0.18, 0.69, -0.18], ['c', 0.06, 0.00, 0.06, 0.54, 0.06, 11.25], ['l', 0.00, 11.25], ['l', -0.63, 0.15], ['c', -0.66, 0.18, -1.44, 0.39, -1.50, 0.39], ['c', -0.03, 0.00, -0.03, -3.39, -0.03, -11.25], ['l', 0.00, -11.25], ['l', 0.36, -0.09], ['c', 0.21, -0.06, 0.66, -0.18, 1.05, -0.27], ['z']],
    w: 2.16,
    h: 23.04
  },
  'scripts.mediumphrase': {
    d: [['M', 1.47, -7.59], ['c', 0.36, -0.09, 0.66, -0.18, 0.69, -0.18], ['c', 0.06, 0.00, 0.06, 0.39, 0.06, 7.50], ['l', 0.00, 7.50], ['l', -0.63, 0.15], ['c', -0.66, 0.18, -1.44, 0.39, -1.50, 0.39], ['c', -0.03, 0.00, -0.03, -2.28, -0.03, -7.50], ['l', 0.00, -7.50], ['l', 0.36, -0.09], ['c', 0.21, -0.06, 0.66, -0.18, 1.05, -0.27], ['z']],
    w: 2.16,
    h: 15.54
  },
  'scripts.shortphrase': {
    d: [['M', 1.47, -7.59], ['c', 0.36, -0.09, 0.66, -0.18, 0.69, -0.18], ['c', 0.06, 0.00, 0.06, 0.21, 0.06, 3.75], ['l', 0.00, 3.75], ['l', -0.42, 0.09], ['c', -0.57, 0.18, -1.65, 0.45, -1.71, 0.45], ['c', -0.03, 0.00, -0.03, -0.72, -0.03, -3.75], ['l', 0.00, -3.75], ['l', 0.36, -0.09], ['c', 0.21, -0.06, 0.66, -0.18, 1.05, -0.27], ['z']],
    w: 2.16,
    h: 8.04
  },
  'scripts.snap': {
    d: [['M', 4.50, -3.39], ['c', 0.36, -0.03, 0.96, -0.03, 1.35, 0.00], ['c', 1.56, 0.15, 3.15, 0.90, 4.20, 2.01], ['c', 0.24, 0.27, 0.33, 0.42, 0.33, 0.60], ['c', 0.00, 0.27, 0.03, 0.24, -2.46, 2.22], ['c', -1.29, 1.02, -2.40, 1.86, -2.49, 1.92], ['c', -0.18, 0.09, -0.30, 0.09, -0.48, 0.00], ['c', -0.09, -0.06, -1.20, -0.90, -2.49, -1.92], ['c', -2.49, -1.98, -2.46, -1.95, -2.46, -2.22], ['c', 0.00, -0.18, 0.09, -0.33, 0.33, -0.60], ['c', 1.05, -1.08, 2.64, -1.86, 4.17, -2.01], ['z'], ['m', 1.29, 1.17], ['c', -1.47, -0.15, -2.97, 0.30, -4.14, 1.20], ['l', -0.18, 0.15], ['l', 0.06, 0.09], ['c', 0.15, 0.12, 3.63, 2.85, 3.66, 2.85], ['c', 0.03, 0.00, 3.51, -2.73, 3.66, -2.85], ['l', 0.06, -0.09], ['l', -0.18, -0.15], ['c', -0.84, -0.66, -1.89, -1.08, -2.94, -1.20], ['z']],
    w: 10.38,
    h: 6.84
  }
}; // Custom characters that weren't generated from the font:

glyphs['noteheads.slash.whole'] = {
  d: [['M', 5, -5], ['l', 1, 1], ['l', -5, 5], ['l', -1, -1], ['z'], ['m', 4, 6], ['l', -5, -5], ['l', 2, -2], ['l', 5, 5], ['z'], ['m', 0, -2], ['l', 1, 1], ['l', -5, 5], ['l', -1, -1], ['z'], ['m', -4, 6], ['l', -5, -5], ['l', 2, -2], ['l', 5, 5], ['z']],
  w: 10.81,
  h: 15.63
};
glyphs['noteheads.slash.quarter'] = {
  d: [['M', 9, -6], ['l', 0, 4], ['l', -9, 9], ['l', 0, -4], ['z']],
  w: 9,
  h: 9
};
glyphs['noteheads.harmonic.quarter'] = {
  d: [['M', 3.63, -4.02], ['c', 0.09, -0.06, 0.18, -0.09, 0.24, -0.03], ['c', 0.03, 0.03, 0.87, 0.93, 1.83, 2.01], ['c', 1.50, 1.65, 1.80, 1.98, 1.80, 2.04], ['c', 0.00, 0.06, -0.30, 0.39, -1.80, 2.04], ['c', -0.96, 1.08, -1.80, 1.98, -1.83, 2.01], ['c', -0.06, 0.06, -0.15, 0.03, -0.24, -0.03], ['c', -0.12, -0.09, -3.54, -3.84, -3.60, -3.93], ['c', -0.03, -0.03, -0.03, -0.09, -0.03, -0.15], ['c', 0.03, -0.06, 3.45, -3.84, 3.63, -3.96], ['z']],
  w: 7.5,
  h: 8.165
};
glyphs['noteheads.triangle.quarter'] = {
  d: [['M', 0, 0], ['l', 9, 0], ['l', -4.5, -9], ['z']],
  w: 9,
  h: 9
};

var pathClone = function pathClone(pathArray) {
  var res = [];

  for (var i = 0, ii = pathArray.length; i < ii; i++) {
    res[i] = [];

    for (var j = 0, jj = pathArray[i].length; j < jj; j++) {
      res[i][j] = pathArray[i][j];
    }
  }

  return res;
};

var pathScale = function pathScale(pathArray, kx, ky) {
  for (var i = 0, ii = pathArray.length; i < ii; i++) {
    var p = pathArray[i];
    var j, jj;

    for (j = 1, jj = p.length; j < jj; j++) {
      p[j] *= j % 2 ? kx : ky;
    }
  }
};

var Glyphs = {
  printSymbol: function printSymbol(x, y, symb, paper, klass, stroke, fill) {
    if (!glyphs[symb]) return null;
    var pathArray = pathClone(glyphs[symb].d);
    pathArray[0][1] += x;
    pathArray[0][2] += y;
    var path = "";

    for (var i = 0; i < pathArray.length; i++) {
      path += pathArray[i].join(" ");
    }

    return paper.path({
      path: path,
      stroke: stroke,
      fill: fill,
      'class': klass
    });
  },
  getPathForSymbol: function getPathForSymbol(x, y, symb, scalex, scaley) {
    scalex = scalex || 1;
    scaley = scaley || 1;
    if (!glyphs[symb]) return null;
    var pathArray = pathClone(glyphs[symb].d);
    if (scalex !== 1 || scaley !== 1) pathScale(pathArray, scalex, scaley);
    pathArray[0][1] += x;
    pathArray[0][2] += y;
    return pathArray;
  },
  getSymbolWidth: function getSymbolWidth(symbol) {
    if (glyphs[symbol]) return glyphs[symbol].w;
    return 0;
  },
  symbolHeightInPitches: function symbolHeightInPitches(symbol) {
    var height = glyphs[symbol] ? glyphs[symbol].h : 0;
    return height / spacing.STEP;
  },
  getSymbolAlign: function getSymbolAlign(symbol) {
    if (symbol.substring(0, 7) === "scripts" && symbol !== "scripts.roll") {
      return "center";
    }

    return "left";
  },
  getYCorr: function getYCorr(symbol) {
    switch (symbol) {
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
      case "+":
        return -2;

      case "timesig.common":
      case "timesig.cut":
        return 0;

      case "flags.d32nd":
        return -1;

      case "flags.d64th":
        return -2;

      case "flags.u32nd":
        return 1;

      case "flags.u64th":
        return 3;

      case "rests.whole":
        return 1;

      case "rests.half":
        return -1;

      case "rests.8th":
        return -1;

      case "rests.quarter":
        return -1;

      case "rests.16th":
        return -1;

      case "rests.32nd":
        return -1;

      case "rests.64th":
        return -1;

      case "f":
      case "m":
      case "p":
      case "s":
      case "z":
        return -4;

      case "scripts.trill":
      case "scripts.upbow":
      case "scripts.downbow":
        return -2;

      case "scripts.ufermata":
      case "scripts.wedge":
      case "scripts.roll":
      case "scripts.shortphrase":
      case "scripts.longphrase":
        return -1;

      case "scripts.dfermata":
        return 1;

      default:
        return 0;
    }
  },
  setSymbol: function setSymbol(name, path) {
    glyphs[name] = path;
  }
};
module.exports = Glyphs; // we need the glyphs for layout information

/***/ }),

/***/ "./src/write/abc_relative_element.js":
/*!*******************************************!*\
  !*** ./src/write/abc_relative_element.js ***!
  \*******************************************/
/***/ (function(module) {

//    abc_relative_element.js: Definition of the RelativeElement class.
var RelativeElement = function RelativeElement(c, dx, w, pitch, opt) {
  opt = opt || {};
  this.x = 0;
  this.c = c; // character or path or string

  this.dx = dx; // relative x position

  this.w = w; // minimum width taken up by this element (can include gratuitous space)

  this.pitch = pitch; // relative y position by pitch

  this.scalex = opt.scalex || 1; // should the character/path be scaled?

  this.scaley = opt.scaley || 1; // should the character/path be scaled?

  this.type = opt.type || "symbol"; // cheap types.

  this.pitch2 = opt.pitch2;
  this.linewidth = opt.linewidth;
  this.klass = opt.klass;
  this.top = pitch;
  if (this.pitch2 !== undefined && this.pitch2 > this.top) this.top = this.pitch2;
  this.bottom = pitch;
  if (this.pitch2 !== undefined && this.pitch2 < this.bottom) this.bottom = this.pitch2;

  if (opt.thickness) {
    this.top += opt.thickness / 2;
    this.bottom -= opt.thickness / 2;
  }

  if (opt.stemHeight) {
    if (opt.stemHeight > 0) this.top += opt.stemHeight;else this.bottom += opt.stemHeight;
  }

  if (opt.dim) this.dim = opt.dim;
  if (opt.position) this.position = opt.position;
  this.height = opt.height ? opt.height : 4; // The +1 is to give a little bit of padding.

  if (opt.top) this.top = opt.top;
  if (opt.bottom) this.bottom = opt.bottom;
  if (opt.realWidth) this.realWidth = opt.realWidth;else this.realWidth = this.w;
  this.centerVertically = false;

  switch (this.type) {
    case "debug":
      this.chordHeightAbove = this.height;
      break;

    case "lyric":
      if (opt.position && opt.position === 'below') this.lyricHeightBelow = this.height;else this.lyricHeightAbove = this.height;
      break;

    case "chord":
      if (opt.position && opt.position === 'below') this.chordHeightBelow = this.height;else this.chordHeightAbove = this.height;
      break;

    case "text":
      if (this.pitch === undefined) {
        if (opt.position && opt.position === 'below') this.chordHeightBelow = this.height;else this.chordHeightAbove = this.height;
      } else this.centerVertically = true;

      break;

    case "part":
      this.partHeightAbove = this.height;
      break;
  }
};

RelativeElement.prototype.getChordDim = function () {
  if (this.type === "debug") return null;
  if (!this.chordHeightAbove && !this.chordHeightBelow) return null; // Chords are centered, annotations are left justified.
  // We add a little margin so that items can't touch - we use half the font size as the margin, so that is 1/4 on each side.
  // if there is only one character that we're printing, use half of that margin.

  var margin = this.dim.font.size / 4;
  if (this.c.length === 1) margin = margin / 2;
  var offset = this.type === "chord" ? this.realWidth / 2 : 0;
  var left = this.x - offset - margin;
  var right = left + this.realWidth + margin;
  return {
    left: left,
    right: right
  };
};

RelativeElement.prototype.invertLane = function (total) {
  if (this.lane === undefined) this.lane = 0;
  this.lane = total - this.lane - 1;
};

RelativeElement.prototype.putChordInLane = function (i) {
  this.lane = i; // Add some extra space to account for the character's descenders.

  if (this.chordHeightAbove) this.chordHeightAbove = this.height * 1.25 * this.lane;else this.chordHeightBelow = this.height * 1.25 * this.lane;
};

RelativeElement.prototype.getLane = function () {
  if (this.lane === undefined) return 0;
  return this.lane;
};

RelativeElement.prototype.setX = function (x) {
  this.x = x + this.dx;
};

module.exports = RelativeElement;

/***/ }),

/***/ "./src/write/abc_renderer.js":
/*!***********************************!*\
  !*** ./src/write/abc_renderer.js ***!
  \***********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

//    abc_renderer.js: API to render to SVG/Raphael/whatever rendering engine

/*global Math */
var spacing = __webpack_require__(/*! ./abc_spacing */ "./src/write/abc_spacing.js");

var Svg = __webpack_require__(/*! ./svg */ "./src/write/svg.js");
/**
 * Implements the API for rendering ABCJS Abstract Rendering Structure to a canvas/paper (e.g. SVG, Raphael, etc)
 * @param {Object} paper
 */


var Renderer = function Renderer(paper) {
  this.paper = new Svg(paper);
  this.controller = null;
  this.space = 3 * spacing.SPACE;
  this.padding = {}; // renderer's padding is managed by the controller

  this.reset();
};

Renderer.prototype.reset = function () {
  this.paper.clear();
  this.y = 0;
  this.abctune = null;
  this.path = null;
  this.isPrint = false;
  this.initVerticalSpace();
};

Renderer.prototype.newTune = function (abcTune) {
  this.abctune = abcTune; // TODO-PER: this is just to get the font info.

  this.setVerticalSpace(abcTune.formatting); //this.measureNumber = null;
  //this.noteNumber = null;

  this.isPrint = abcTune.media === 'print';
  this.setPadding(abcTune);
};

Renderer.prototype.setPaddingOverride = function (params) {
  this.paddingOverride = {
    top: params.paddingtop,
    bottom: params.paddingbottom,
    right: params.paddingright,
    left: params.paddingleft
  };
};

Renderer.prototype.setPadding = function (abctune) {
  // If the padding is set in the tune, then use that.
  // Otherwise, if the padding is set in the override, use that.
  // Otherwise, use the defaults (there are a different set of defaults for screen and print.)
  function setPaddingVariable(self, paddingKey, formattingKey, printDefault, screenDefault) {
    if (abctune.formatting[formattingKey] !== undefined) self.padding[paddingKey] = abctune.formatting[formattingKey];else if (self.paddingOverride[paddingKey] !== undefined) self.padding[paddingKey] = self.paddingOverride[paddingKey];else if (self.isPrint) self.padding[paddingKey] = printDefault;else self.padding[paddingKey] = screenDefault;
  } // 1cm x 0.393701in/cm x 72pt/in x 1.33px/pt = 38px
  // 1.8cm x 0.393701in/cm x 72pt/in x 1.33px/pt = 68px


  setPaddingVariable(this, 'top', 'topmargin', 38, 15);
  setPaddingVariable(this, 'bottom', 'botmargin', 38, 15);
  setPaddingVariable(this, 'left', 'leftmargin', 68, 15);
  setPaddingVariable(this, 'right', 'rightmargin', 68, 15);
};
/**
 * Some of the items on the page are not scaled, so adjust them in the opposite direction of scaling to cancel out the scaling.
 * @param {float} scale
 */


Renderer.prototype.adjustNonScaledItems = function (scale) {
  this.padding.top /= scale;
  this.padding.bottom /= scale;
  this.padding.left /= scale;
  this.padding.right /= scale;
  this.abctune.formatting.headerfont.size /= scale;
  this.abctune.formatting.footerfont.size /= scale;
};
/**
 * Set the the values for all the configurable vertical space options.
 */


Renderer.prototype.initVerticalSpace = function () {
  // conversion: 37.7953 = conversion factor for cm to px.
  // All of the following values are in px.
  this.spacing = {
    composer: 7.56,
    // Set the vertical space above the composer.
    graceBefore: 8.67,
    // Define the space before, inside and after the grace notes.
    graceInside: 10.67,
    graceAfter: 16,
    info: 0,
    // Set the vertical space above the infoline.
    lineSkipFactor: 1.1,
    // Set the factor for spacing between lines of text. (multiply this by the font size)
    music: 7.56,
    // Set the vertical space above the first staff.
    paragraphSkipFactor: 0.4,
    // Set the factor for spacing between text paragraphs. (multiply this by the font size)
    parts: 11.33,
    // Set the vertical space above a new part.
    slurHeight: 1.0,
    // Set the slur height factor.
    staffSeparation: 61.33,
    // Do not put a staff system closer than <unit> from the previous system.
    stemHeight: 26.67 + 20,
    // Set the stem height.
    subtitle: 3.78,
    // Set the vertical space above the subtitle.
    systemStaffSeparation: 48,
    // Do not place the staves closer than <unit> inside a system. * This values applies to all staves when in the tune header. Otherwise, it applies to the next staff
    text: 18.9,
    // Set the vertical space above the history.
    title: 7.56,
    // Set the vertical space above the title.
    top: 30.24,
    //Set the vertical space above the tunes and on the top of the continuation pages.
    vocal: 0,
    // Set the vertical space above the lyrics under the staves.
    words: 0 // Set the vertical space above the lyrics at the end of the tune.

  };
  /*
  TODO-PER: Handle the x-coordinate spacing items, too.
  maxshrink <float>Default: 0.65
  Set how much to compress horizontally when music line breaks
  are automatic.
  <float> must be between 0 (natural spacing)
  and 1 (max shrinking).
  // This next value is used to compute the natural spacing of
  // the notes. The base spacing of the crotchet is always
  // 40 pts. When the duration of a note type is twice the
  // duration of an other note type, its spacing is multiplied
  // by this factor.
  // The default value causes the note spacing to be multiplied
  // by 2 when its duration is multiplied by 4, i.e. the
  // space of the semibreve is 80 pts and the space of the
  // semiquaver is 20 pts.
  // Setting this value to 1 sets all note spacing to 40 pts.
  noteSpacingFactor: 1.414, // Set the note spacing factor to <float> (range 1..2).
  scale <float> Default: 0.75 Set the page scale factor. Note that the header and footer are not scaled.
  stretchlast <float>Default: 0.8
  Stretch the last music line of a tune when it exceeds
  the <float> fraction of the page width.
  <float> range is 0.0 to 1.0.
   */
};

Renderer.prototype.setVerticalSpace = function (formatting) {
  // conversion from pts to px 4/3
  if (formatting.staffsep !== undefined) this.spacing.staffSeparation = formatting.staffsep * 4 / 3;
  if (formatting.composerspace !== undefined) this.spacing.composer = formatting.composerspace * 4 / 3;
  if (formatting.partsspace !== undefined) this.spacing.parts = formatting.partsspace * 4 / 3;
  if (formatting.textspace !== undefined) this.spacing.text = formatting.textspace * 4 / 3;
  if (formatting.musicspace !== undefined) this.spacing.music = formatting.musicspace * 4 / 3;
  if (formatting.titlespace !== undefined) this.spacing.title = formatting.titlespace * 4 / 3;
  if (formatting.sysstaffsep !== undefined) this.spacing.systemStaffSeparation = formatting.sysstaffsep * 4 / 3;
  if (formatting.subtitlespace !== undefined) this.spacing.subtitle = formatting.subtitlespace * 4 / 3;
  if (formatting.topspace !== undefined) this.spacing.top = formatting.topspace * 4 / 3;
  if (formatting.vocalspace !== undefined) this.spacing.vocal = formatting.vocalspace * 4 / 3;
  if (formatting.wordsspace !== undefined) this.spacing.words = formatting.wordsspace * 4 / 3;
};
/**
 * Leave space before printing a staff system
 */

/**
 * Calculates the y for a given pitch value (relative to the stave the renderer is currently printing)
 * @param {number} ofs pitch value (bottom C on a G clef = 0, D=1, etc.)
 */


Renderer.prototype.calcY = function (ofs) {
  return this.y - ofs * spacing.STEP;
};

Renderer.prototype.moveY = function (em, numLines) {
  if (numLines === undefined) numLines = 1;
  this.y += em * numLines;
};

module.exports = Renderer;

/***/ }),

/***/ "./src/write/abc_spacing.js":
/*!**********************************!*\
  !*** ./src/write/abc_spacing.js ***!
  \**********************************/
/***/ (function(module) {

var spacing = {};
spacing.FONTEM = 360;
spacing.FONTSIZE = 30;
spacing.STEP = spacing.FONTSIZE * 93 / 720;
spacing.SPACE = 10;
spacing.TOPNOTE = 15;
spacing.STAVEHEIGHT = 100;
spacing.INDENT = 50;
module.exports = spacing;

/***/ }),

/***/ "./src/write/abc_staff_group_element.js":
/*!**********************************************!*\
  !*** ./src/write/abc_staff_group_element.js ***!
  \**********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

//    abc_staff_group_element.js: Definition of the StaffGroupElement class.
// StaffGroupElement contains all the elements that go together to make one line of music.
// That might be multiple staves that are tied together, and it might be multiple voices on one staff.
//
// Methods:
// constructor: some basic initialization
// addVoice(): Called once for each voice. May add a new staff if needed.
// finished(): Called only internally by layout()
// layout(): This does all the layout. It sets the following: spacingunits, startx, minspace, w, and the x-coordinate of each element in each voice.
// draw(): Calls the underlying methods on the voice objects to do the drawing. Sets y and height.
//
// Members:
// staffs: an array of all the staves in this group. Each staff contains the following elements:
//    { top, bottom, highest, lowest, y }
// voices: array of VoiceElement objects. This is mostly passed in, but the VoiceElement objects are modified here.
//
// spacingunits: number of relative x-units in the line. Used by the calling function to pass back in as the "spacing" input parameter.
// TODO-PER: This should actually be passed back as a return value.
// minspace: smallest space between two notes. Used by the calling function to pass back in as the "spacing" input parameter.
// TODO-PER: This should actually be passed back as a return value.
// startx: The left edge, taking the margin and the optional voice name. Used by the draw() method.
// w: The width of the line. Used by calling function to pass back in as the "spacing" input parameter, and the draw() method.
// TODO-PER: This should actually be passed back as a return value.  (TODO-PER: in pixels or spacing units?)
// y: The top of the staff group, in pixels. This is set in the draw method.
// TODO-PER: Where is that used? It looks like it might not be needed.
// height: Set in the draw() method to the height actually used. Used by the calling function to know where to start the next staff group.
// TODO-PER: This should actually be set in the layout method and passed back as a return value.
var calcHeight = __webpack_require__(/*! ./calcHeight */ "./src/write/calcHeight.js");

var StaffGroupElement = function StaffGroupElement(getTextSize) {
  this.getTextSize = getTextSize;
  this.voices = [];
  this.staffs = [];
  this.brace = undefined; //tony

  this.bracket = undefined;
};

StaffGroupElement.prototype.setLimit = function (member, voice) {
  if (!voice.specialY[member]) return;
  if (!voice.staff.specialY[member]) voice.staff.specialY[member] = voice.specialY[member];else voice.staff.specialY[member] = Math.max(voice.staff.specialY[member], voice.specialY[member]);
};

StaffGroupElement.prototype.addVoice = function (voice, staffnumber, stafflines) {
  var voiceNum = this.voices.length;
  this.voices[voiceNum] = voice;
  if (this.staffs[staffnumber]) this.staffs[staffnumber].voices.push(voiceNum);else {
    // TODO-PER: how does the min/max change when stafflines is not 5?
    this.staffs[this.staffs.length] = {
      top: 10,
      bottom: 2,
      lines: stafflines,
      voices: [voiceNum],
      specialY: {
        tempoHeightAbove: 0,
        partHeightAbove: 0,
        volumeHeightAbove: 0,
        dynamicHeightAbove: 0,
        endingHeightAbove: 0,
        chordHeightAbove: 0,
        lyricHeightAbove: 0,
        lyricHeightBelow: 0,
        chordHeightBelow: 0,
        volumeHeightBelow: 0,
        dynamicHeightBelow: 0
      }
    };
  }
  voice.staff = this.staffs[staffnumber];
};

StaffGroupElement.prototype.setHeight = function () {
  this.height = calcHeight(this);
};

StaffGroupElement.prototype.setWidth = function (width) {
  this.w = width;

  for (var i = 0; i < this.voices.length; i++) {
    this.voices[i].setWidth(width);
  }
};

StaffGroupElement.prototype.setStaffLimits = function (voice) {
  voice.staff.top = Math.max(voice.staff.top, voice.top);
  voice.staff.bottom = Math.min(voice.staff.bottom, voice.bottom);
  this.setLimit('tempoHeightAbove', voice);
  this.setLimit('partHeightAbove', voice);
  this.setLimit('volumeHeightAbove', voice);
  this.setLimit('dynamicHeightAbove', voice);
  this.setLimit('endingHeightAbove', voice);
  this.setLimit('chordHeightAbove', voice);
  this.setLimit('lyricHeightAbove', voice);
  this.setLimit('lyricHeightBelow', voice);
  this.setLimit('chordHeightBelow', voice);
  this.setLimit('volumeHeightBelow', voice);
  this.setLimit('dynamicHeightBelow', voice);
};

module.exports = StaffGroupElement;

/***/ }),

/***/ "./src/write/abc_tempo_element.js":
/*!****************************************!*\
  !*** ./src/write/abc_tempo_element.js ***!
  \****************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

//    abc_tempo_element.js: Definition of the TempoElement class.
var AbsoluteElement = __webpack_require__(/*! ./abc_absolute_element */ "./src/write/abc_absolute_element.js");

var RelativeElement = __webpack_require__(/*! ./abc_relative_element */ "./src/write/abc_relative_element.js");

var TempoElement = function TempoElement(tempo, tuneNumber, createNoteHead) {
  this.type = "TempoElement";
  this.tempo = tempo;
  this.tempo.type = "tempo"; /// TODO-PER: this should be set earlier, in the parser, probably.

  this.tuneNumber = tuneNumber; // TODO: can these two properties be merged?

  this.totalHeightInPitches = 6;
  this.tempoHeightAbove = this.totalHeightInPitches;
  this.pitch = undefined; // This will be set later

  if (this.tempo.duration && !this.tempo.suppressBpm) {
    this.note = this.createNote(createNoteHead, tempo, tuneNumber);
  }
};

TempoElement.prototype.setX = function (x) {
  this.x = x;
};

TempoElement.prototype.createNote = function (createNoteHead, tempo, tuneNumber) {
  var temposcale = 0.75;
  var duration = tempo.duration[0]; // TODO when multiple durations

  var absElem = new AbsoluteElement(tempo, duration, 1, 'tempo', tuneNumber); // There aren't an infinite number of note values, but we are passed a float, so just in case something is off upstream,
  // merge all of the in between points.

  var dot;
  var flag;
  var note;

  if (duration <= 1 / 32) {
    note = "noteheads.quarter";
    flag = "flags.u32nd";
    dot = 0;
  } else if (duration <= 1 / 16) {
    note = "noteheads.quarter";
    flag = "flags.u16th";
    dot = 0;
  } else if (duration <= 3 / 32) {
    note = "noteheads.quarter";
    flag = "flags.u16nd";
    dot = 1;
  } else if (duration <= 1 / 8) {
    note = "noteheads.quarter";
    flag = "flags.u8th";
    dot = 0;
  } else if (duration <= 3 / 16) {
    note = "noteheads.quarter";
    flag = "flags.u8th";
    dot = 1;
  } else if (duration <= 1 / 4) {
    note = "noteheads.quarter";
    dot = 0;
  } else if (duration <= 3 / 8) {
    note = "noteheads.quarter";
    dot = 1;
  } else if (duration <= 1 / 2) {
    note = "noteheads.half";
    dot = 0;
  } else if (duration <= 3 / 4) {
    note = "noteheads.half";
    dot = 1;
  } else if (duration <= 1) {
    note = "noteheads.whole";
    dot = 0;
  } else if (duration <= 1.5) {
    note = "noteheads.whole";
    dot = 1;
  } else if (duration <= 2) {
    note = "noteheads.dbl";
    dot = 0;
  } else {
    note = "noteheads.dbl";
    dot = 1;
  }

  var ret = createNoteHead(absElem, note, {
    verticalPos: 0
  }, // This is just temporary: we'll offset the vertical positioning when we get the actual vertical spot.
  {
    dir: "up",
    flag: flag,
    dot: dot,
    scale: temposcale
  });
  var tempoNote = ret.notehead;
  absElem.addHead(tempoNote);
  var stem;

  if (note !== "noteheads.whole" && note !== "noteheads.dbl") {
    var p1 = 1 / 3 * temposcale;
    var p2 = 5 * temposcale;
    var dx = tempoNote.dx + tempoNote.w;
    var width = -0.6;
    stem = new RelativeElement(null, dx, 0, p1, {
      "type": "stem",
      "pitch2": p2,
      linewidth: width
    });
    absElem.addRight(stem);
  }

  return absElem;
};

module.exports = TempoElement;

/***/ }),

/***/ "./src/write/abc_tie_element.js":
/*!**************************************!*\
  !*** ./src/write/abc_tie_element.js ***!
  \**************************************/
/***/ (function(module) {

//    abc_tie_element.js: Definition of the TieElement class.
var TieElem = function TieElem(options) {
  this.type = "TieElem"; //	console.log("constructor", options.anchor1 ? options.anchor1.pitch : "N/A", options.anchor2 ? options.anchor2.pitch : "N/A", options.isTie, options.isGrace);

  this.anchor1 = options.anchor1; // must have a .x and a .pitch, and a .parent property or be null (means starts at the "beginning" of the line - after keysig)

  this.anchor2 = options.anchor2; // must have a .x and a .pitch property or be null (means ends at the end of the line)

  if (options.isGrace) this.isGrace = true;
  if (options.fixedY) this.fixedY = true;
  if (options.stemDir) this.stemDir = options.stemDir;
  if (options.voiceNumber !== undefined) this.voiceNumber = options.voiceNumber;
  if (options.style !== undefined) this.dotted = true;
  this.internalNotes = [];
};

TieElem.prototype.addInternalNote = function (note) {
  this.internalNotes.push(note);
};

TieElem.prototype.setEndAnchor = function (anchor2) {
  //	console.log("end", this.anchor1 ? this.anchor1.pitch : "N/A", anchor2 ? anchor2.pitch : "N/A", this.isTie, this.isGrace);
  this.anchor2 = anchor2; // must have a .x and a .pitch property or be null (means ends at the end of the line)
}; // If we encounter a repeat sign, then we don't want to extend either a tie or a slur past it, so these are called to be a limit.


TieElem.prototype.setStartX = function (startLimitElem) {
  this.startLimitX = startLimitElem;
};

TieElem.prototype.setEndX = function (endLimitElem) {
  this.endLimitX = endLimitElem;
};

TieElem.prototype.setHint = function () {
  this.hint = true;
};

TieElem.prototype.calcTieDirection = function () {
  // The rules:
  // 1) If it is in a grace note group, then the direction is always BELOW.
  // 2) If it is in a single voice, then the direction is always OPPOSITE of the stem (or where the stem would have been in the case of whole notes.)
  // 3) If the stem direction is forced (probably because there are two voices on the same line), then the direction is the SAME as the stem direction.
  if (this.isGrace) this.above = false;else if (this.voiceNumber === 0) this.above = true;else if (this.voiceNumber > 0) this.above = false;else {
    var referencePitch;
    if (this.anchor1) referencePitch = this.anchor1.pitch;else if (this.anchor2) referencePitch = this.anchor2.pitch;else referencePitch = 14; // TODO-PER: this can't really happen normally. This would imply that a tie crossed over three lines, something like "C-\nz\nC"
    // Put the arc in the opposite direction of the stem. That isn't always the pitch if one or both of the notes are beamed with something that affects its stem.

    if (this.anchor1 && this.anchor1.stemDir === 'down' && this.anchor2 && this.anchor2.stemDir === "down") this.above = true;else if (this.anchor1 && this.anchor1.stemDir === 'up' && this.anchor2 && this.anchor2.stemDir === "up") this.above = false;else if (this.anchor1 && this.anchor2) this.above = referencePitch >= 6;else if (this.anchor1) this.above = this.anchor1.stemDir === "down";else if (this.anchor2) this.above = this.anchor2.stemDir === "down";else this.above = referencePitch >= 6;
  }
}; // From "standard music notation practice" by Music Publishers’ Association:
// 1) Slurs are placed under the note heads if all stems go up.
// 2) Slurs are placed over the note heads if all stems go down.
// 3) If there are both up stems and down stems, prefer placing the slur over.
// 4) When the staff has opposite stemmed voices, all slurs should be on the stemmed side.


TieElem.prototype.calcSlurDirection = function () {
  if (this.isGrace) this.above = false;else if (this.voiceNumber === 0) this.above = true;else if (this.voiceNumber > 0) this.above = false;else {
    var hasDownStem = false;
    if (this.anchor1 && this.anchor1.stemDir === "down") hasDownStem = true;
    if (this.anchor2 && this.anchor2.stemDir === "down") hasDownStem = true;

    for (var i = 0; i < this.internalNotes.length; i++) {
      var n = this.internalNotes[i];
      if (n.stemDir === "down") hasDownStem = true;
    }

    this.above = hasDownStem;
  }
};

TieElem.prototype.calcX = function (lineStartX, lineEndX) {
  if (this.anchor1) {
    this.startX = this.anchor1.x; // The normal case where there is a starting element to attach to.

    if (this.anchor1.scalex < 1) // this is a grace note - don't offset the tie as much.
      this.startX -= 3;
  } else if (this.startLimitX) this.startX = this.startLimitX.x + this.startLimitX.w; // if there is no start element, but there is a repeat mark before the start of the line.
  else this.startX = lineStartX; // There is no element and no repeat mark: extend to the beginning of the line.


  if (!this.anchor1 && this.dotted) this.startX -= 3; // The arc needs to be long enough to tell that it is dotted.

  if (this.anchor2) this.endX = this.anchor2.x; // The normal case where there is a starting element to attach to.
  else if (this.endLimitX) this.endX = this.endLimitX.x; // if there is no start element, but there is a repeat mark before the start of the line.
    else this.endX = lineEndX; // There is no element and no repeat mark: extend to the beginning of the line.
};

TieElem.prototype.calcTieY = function () {
  // If the tie comes from another line, then one or both anchors will be missing.
  if (this.anchor1) this.startY = this.anchor1.pitch;else if (this.anchor2) this.startY = this.anchor2.pitch;else this.startY = this.above ? 14 : 0;
  if (this.anchor2) this.endY = this.anchor2.pitch;else if (this.anchor1) this.endY = this.anchor1.pitch;else this.endY = this.above ? 14 : 0;
}; // From "standard music notation practice" by Music Publishers’ Association:
// 1) If the anchor note is down stem, the slur points to the note head.
// 2) If the anchor note is up stem, and the slur is over, then point to middle of stem.


TieElem.prototype.calcSlurY = function () {
  if (this.anchor1 && this.anchor2) {
    if (this.above && this.anchor1.stemDir === "up" && !this.fixedY) {
      this.startY = (this.anchor1.highestVert + this.anchor1.pitch) / 2;
      this.startX += this.anchor1.w / 2; // When going to the middle of the stem, bump the line to the right a little bit to make it look right.
    } else this.startY = this.anchor1.pitch; // If the closing note has an up stem, and it is beamed, and it isn't the first note in the beam, then the beam will get in the way.


    var beamInterferes = this.anchor2.parent.beam && this.anchor2.parent.beam.stemsUp && this.anchor2.parent.beam.elems[0] !== this.anchor2.parent;
    var midPoint = (this.anchor2.highestVert + this.anchor2.pitch) / 2;

    if (this.above && this.anchor2.stemDir === "up" && !this.fixedY && !beamInterferes && midPoint < this.startY) {
      this.endY = midPoint;
      this.endX += Math.round(this.anchor2.w / 2); // When going to the middle of the stem, bump the line to the right a little bit to make it look right.
    } else this.endY = this.above && beamInterferes ? this.anchor2.highestVert : this.anchor2.pitch;
  } else if (this.anchor1) {
    this.startY = this.endY = this.anchor1.pitch;
  } else if (this.anchor2) {
    this.startY = this.endY = this.anchor2.pitch;
  } else {
    // This is the case where the slur covers the entire line.
    // TODO-PER: figure out where the real top and bottom of the line are.
    this.startY = this.above ? 14 : 0;
    this.endY = this.above ? 14 : 0;
  }
};

TieElem.prototype.avoidCollisionAbove = function () {
  // Double check that an interior note in the slur isn't so high that it interferes.
  if (this.above) {
    var maxInnerHeight = -50;

    for (var i = 0; i < this.internalNotes.length; i++) {
      if (this.internalNotes[i].highestVert > maxInnerHeight) maxInnerHeight = this.internalNotes[i].highestVert;
    }

    if (maxInnerHeight > this.startY && maxInnerHeight > this.endY) this.startY = this.endY = maxInnerHeight - 1;
  }
};

module.exports = TieElem;

/***/ }),

/***/ "./src/write/abc_triplet_element.js":
/*!******************************************!*\
  !*** ./src/write/abc_triplet_element.js ***!
  \******************************************/
/***/ (function(module) {

//    abc_triplet_element.js: Definition of the TripletElem class.
var TripletElem = function TripletElem(number, anchor1, options) {
  this.type = "TripletElem";
  this.anchor1 = anchor1; // must have a .x and a .parent property or be null (means starts at the "beginning" of the line - after key signature)

  this.number = number;
  this.durationClass = ('d' + Math.round(anchor1.parent.durationClass * 1000) / 1000).replace(/\./, '-');
  this.middleElems = []; // This is to calculate the highest interior pitch. It is used to make sure that the drawn bracket never crosses a really high middle note.

  this.flatBeams = options.flatBeams;
  this.tiesAbove = options.tiesAbove;
};

TripletElem.prototype.isClosed = function () {
  return !!this.anchor2;
};

TripletElem.prototype.middleNote = function (elem) {
  this.middleElems.push(elem);
};

TripletElem.prototype.setCloseAnchor = function (anchor2) {
  this.anchor2 = anchor2; // TODO-PER: Unfortunately, I don't know if there is a beam above until after the vertical positioning is done,
  // so I don't know whether to leave room for the number above. Therefore, If there is a beam on the first note, I'll leave room just in case.

  if (this.anchor1.parent.beam) this.endingHeightAbove = 4;
};

module.exports = TripletElem;

/***/ }),

/***/ "./src/write/abc_voice_element.js":
/*!****************************************!*\
  !*** ./src/write/abc_voice_element.js ***!
  \****************************************/
/***/ (function(module) {

//    abc_voice_element.js: Definition of the VoiceElement class.
var VoiceElement = function VoiceElement(voicenumber, voicetotal) {
  this.children = [];
  this.beams = [];
  this.otherchildren = []; // ties, slurs, triplets

  this.w = 0;
  this.duplicate = false;
  this.voicenumber = voicenumber; //number of the voice on a given stave (not staffgroup)

  this.voicetotal = voicetotal;
  this.bottom = 7;
  this.top = 7;
  this.specialY = {
    tempoHeightAbove: 0,
    partHeightAbove: 0,
    volumeHeightAbove: 0,
    dynamicHeightAbove: 0,
    endingHeightAbove: 0,
    chordHeightAbove: 0,
    lyricHeightAbove: 0,
    lyricHeightBelow: 0,
    chordHeightBelow: 0,
    volumeHeightBelow: 0,
    dynamicHeightBelow: 0
  };
};

VoiceElement.prototype.addChild = function (absElem) {
  // This is always passed an AbsoluteElement
  if (absElem.type === 'bar') {
    var firstItem = true;

    for (var i = 0; firstItem && i < this.children.length; i++) {
      if (this.children[i].type.indexOf("staff-extra") < 0 && this.children[i].type !== "tempo") firstItem = false;
    }

    if (!firstItem) {
      this.beams.push("bar");
      this.otherchildren.push("bar");
    }
  }

  this.children[this.children.length] = absElem;
  this.setRange(absElem);
};

VoiceElement.prototype.setLimit = function (member, child) {
  // Sometimes we get an absolute element in here and sometimes we get some type of relative element.
  // If there is a "specialY" element, then assume it is an absolute element. If that doesn't exist, look for the
  // same members at the top level, because that's where they are in relative elements.
  var specialY = child.specialY;
  if (!specialY) specialY = child;
  if (!specialY[member]) return;
  if (!this.specialY[member]) this.specialY[member] = specialY[member];else this.specialY[member] = Math.max(this.specialY[member], specialY[member]);
};

VoiceElement.prototype.adjustRange = function (child) {
  if (child.bottom !== undefined) this.bottom = Math.min(this.bottom, child.bottom);
  if (child.top !== undefined) this.top = Math.max(this.top, child.top);
};

VoiceElement.prototype.setRange = function (child) {
  this.adjustRange(child);
  this.setLimit('tempoHeightAbove', child);
  this.setLimit('partHeightAbove', child);
  this.setLimit('volumeHeightAbove', child);
  this.setLimit('dynamicHeightAbove', child);
  this.setLimit('endingHeightAbove', child);
  this.setLimit('chordHeightAbove', child);
  this.setLimit('lyricHeightAbove', child);
  this.setLimit('lyricHeightBelow', child);
  this.setLimit('chordHeightBelow', child);
  this.setLimit('volumeHeightBelow', child);
  this.setLimit('dynamicHeightBelow', child);
};

VoiceElement.prototype.addOther = function (child) {
  this.otherchildren.push(child);
  this.setRange(child);
};

VoiceElement.prototype.addBeam = function (child) {
  this.beams.push(child);
};

VoiceElement.prototype.setWidth = function (width) {
  this.w = width;
};

module.exports = VoiceElement;

/***/ }),

/***/ "./src/write/add-chord.js":
/*!********************************!*\
  !*** ./src/write/add-chord.js ***!
  \********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var RelativeElement = __webpack_require__(/*! ./abc_relative_element */ "./src/write/abc_relative_element.js");

var spacing = __webpack_require__(/*! ./abc_spacing */ "./src/write/abc_spacing.js");

var addChord = function addChord(getTextSize, abselem, elem, roomTaken, roomTakenRight, noteheadWidth) {
  for (var i = 0; i < elem.chord.length; i++) {
    var pos = elem.chord[i].position;
    var rel_position = elem.chord[i].rel_position;
    var chords = elem.chord[i].name.split("\n");

    for (var j = chords.length - 1; j >= 0; j--) {
      // parse these in opposite order because we place them from bottom to top.
      var chord = chords[j];
      var x = 0;
      var y;
      var font;
      var klass;

      if (pos === "left" || pos === "right" || pos === "below" || pos === "above") {
        font = 'annotationfont';
        klass = "annotation";
      } else {
        font = 'gchordfont';
        klass = "chord";
      }

      var attr = getTextSize.attr(font, klass);
      var dim = getTextSize.calc(chord, font, klass);
      var chordWidth = dim.width;
      var chordHeight = dim.height / spacing.STEP;

      switch (pos) {
        case "left":
          roomTaken += chordWidth + 7;
          x = -roomTaken; // TODO-PER: This is just a guess from trial and error

          y = elem.averagepitch;
          abselem.addExtra(new RelativeElement(chord, x, chordWidth + 4, y, {
            type: "text",
            height: chordHeight,
            dim: attr,
            position: "left"
          }));
          break;

        case "right":
          roomTakenRight += 4;
          x = roomTakenRight; // TODO-PER: This is just a guess from trial and error

          y = elem.averagepitch;
          abselem.addRight(new RelativeElement(chord, x, chordWidth + 4, y, {
            type: "text",
            height: chordHeight,
            dim: attr,
            position: "right"
          }));
          break;

        case "below":
          // setting the y-coordinate to undefined for now: it will be overwritten later on, after we figure out what the highest element on the line is.
          abselem.addRight(new RelativeElement(chord, 0, 0, undefined, {
            type: "text",
            position: "below",
            height: chordHeight,
            dim: attr,
            realWidth: chordWidth
          }));
          break;

        case "above":
          // setting the y-coordinate to undefined for now: it will be overwritten later on, after we figure out what the highest element on the line is.
          abselem.addRight(new RelativeElement(chord, 0, 0, undefined, {
            type: "text",
            position: "above",
            height: chordHeight,
            dim: attr,
            realWidth: chordWidth
          }));
          break;

        default:
          if (rel_position) {
            var relPositionY = rel_position.y + 3 * spacing.STEP; // TODO-PER: this is a fudge factor to make it line up with abcm2ps

            abselem.addRight(new RelativeElement(chord, x + rel_position.x, 0, elem.minpitch + relPositionY / spacing.STEP, {
              position: "relative",
              type: "text",
              height: chordHeight,
              dim: attr
            }));
          } else {
            // setting the y-coordinate to undefined for now: it will be overwritten later on, after we figure out what the highest element on the line is.
            var pos2 = 'above';
            if (elem.positioning && elem.positioning.chordPosition) pos2 = elem.positioning.chordPosition;

            if (pos2 !== 'hidden') {
              abselem.addCentered(new RelativeElement(chord, noteheadWidth / 2, chordWidth, undefined, {
                type: "chord",
                position: pos2,
                height: chordHeight,
                dim: attr,
                realWidth: chordWidth
              }));
            }
          }

      }
    }
  }

  return {
    roomTaken: roomTaken,
    roomTakenRight: roomTakenRight
  };
};

module.exports = addChord;

/***/ }),

/***/ "./src/write/bottom-text.js":
/*!**********************************!*\
  !*** ./src/write/bottom-text.js ***!
  \**********************************/
/***/ (function(module) {

function BottomText(metaText, width, isPrint, paddingLeft, spacing, getTextSize) {
  this.rows = [];
  if (metaText.unalignedWords && metaText.unalignedWords.length > 0) this.unalignedWords(metaText.unalignedWords, paddingLeft, spacing, getTextSize);
  this.extraText(metaText, paddingLeft, spacing, getTextSize);
  if (metaText.footer && isPrint) this.footer(metaText.footer, width, paddingLeft, getTextSize);
}

BottomText.prototype.unalignedWords = function (unalignedWords, paddingLeft, spacing, getTextSize) {
  var indent = 50;
  var klass = 'meta-bottom unaligned-words';
  var defFont = 'wordsfont';
  this.rows.push({
    startGroup: "unalignedWords",
    klass: 'abcjs-meta-bottom abcjs-unaligned-words'
  });
  var space = getTextSize.calc("i", defFont, klass);
  this.rows.push({
    move: spacing.words
  });

  for (var j = 0; j < unalignedWords.length; j++) {
    if (unalignedWords[j] === '') this.rows.push({
      move: space.height
    });else if (typeof unalignedWords[j] === 'string') {
      this.addTextIf(paddingLeft + indent, unalignedWords[j], defFont, klass, 0, 0, "start", getTextSize, null, true);
    } else {
      var largestY = 0;
      var offsetX = 0;

      for (var k = 0; k < unalignedWords[j].length; k++) {
        var thisWord = unalignedWords[j][k];
        var font = thisWord.font ? thisWord.font : defFont;
        this.rows.push({
          left: paddingLeft + indent + offsetX,
          text: thisWord.text,
          font: font,
          anchor: 'start'
        });
        var size = getTextSize.calc(thisWord.text, defFont, klass);
        largestY = Math.max(largestY, size.height);
        offsetX += size.width; // If the phrase ends in a space, then that is not counted in the width, so we need to add that in ourselves.

        if (thisWord.text[thisWord.text.length - 1] === ' ') {
          offsetX += space.width;
        }
      }

      this.rows.push({
        move: largestY
      });
    }
  }

  this.rows.push({
    move: space.height * 2
  });
  this.rows.push({
    endGroup: "unalignedWords",
    absElemType: "unalignedWords"
  });
};

BottomText.prototype.extraText = function (metaText, marginLeft, spacing, getTextSize) {
  var extraText = "";
  if (metaText.book) extraText += "Book: " + metaText.book + "\n";
  if (metaText.source) extraText += "Source: " + metaText.source + "\n";
  if (metaText.discography) extraText += "Discography: " + metaText.discography + "\n";
  if (metaText.notes) extraText += "Notes: " + metaText.notes + "\n";
  if (metaText.transcription) extraText += "Transcription: " + metaText.transcription + "\n";
  if (metaText.history) extraText += "History: " + metaText.history + "\n";
  if (metaText['abc-copyright']) extraText += "Copyright: " + metaText['abc-copyright'] + "\n";
  if (metaText['abc-creator']) extraText += "Creator: " + metaText['abc-creator'] + "\n";
  if (metaText['abc-edited-by']) extraText += "Edited By: " + metaText['abc-edited-by'] + "\n";

  if (extraText.length > 0) {
    this.addTextIf(marginLeft, extraText, 'historyfont', 'meta-bottom extra-text', spacing.info, 0, "start", getTextSize, "extraText");
  }
};

BottomText.prototype.footer = function (footer, width, paddingLeft, getTextSize) {
  var klass = 'header meta-bottom';
  var font = "footerfont";
  this.rows.push({
    startGroup: "footer",
    klass: klass
  }); // Note: whether there is a footer or not doesn't change any other positioning, so this doesn't change the Y-coordinate.

  this.addTextIf(paddingLeft, footer.left, font, klass, 0, 0, 'start', getTextSize);
  this.addTextIf(paddingLeft + width / 2, footer.center, font, klass, 0, 0, 'middle', getTextSize);
  this.addTextIf(paddingLeft + width, footer.right, font, klass, 0, 0, 'end', getTextSize);
};

BottomText.prototype.addTextIf = function (marginLeft, text, font, klass, marginTop, marginBottom, anchor, getTextSize, absElemType, inGroup) {
  if (!text) return;
  if (marginTop) this.rows.push({
    move: marginTop
  });
  var attr = {
    left: marginLeft,
    text: text,
    font: font,
    anchor: anchor
  };
  if (absElemType) attr.absElemType = absElemType;

  if (!inGroup) {
    attr.klass = klass;
  }

  this.rows.push(attr); // If there are blank lines they won't be counted by getTextSize, so just get the height of one line and multiply

  var size = getTextSize.calc("A", font, klass);
  var numLines = text.split("\n").length;
  if (text[text.length - 1] === '\n') numLines--; // If there is a new line at the end of the string, then an extra line will be counted.

  var h = size.height * 1.1 * numLines;
  this.rows.push({
    move: Math.round(h)
  });
  if (marginBottom) this.rows.push({
    move: marginBottom
  });
};

module.exports = BottomText;

/***/ }),

/***/ "./src/write/calcHeight.js":
/*!*********************************!*\
  !*** ./src/write/calcHeight.js ***!
  \*********************************/
/***/ (function(module) {

var calcHeight = function calcHeight(staffGroup) {
  // the height is calculated here in a parallel way to the drawing below in hopes that both of these functions will be modified together.
  // TODO-PER: also add the space between staves. (That's systemStaffSeparation, which is the minimum distance between the staff LINES.)
  var height = 0;

  for (var i = 0; i < staffGroup.voices.length; i++) {
    var staff = staffGroup.voices[i].staff;

    if (!staffGroup.voices[i].duplicate) {
      height += staff.top;
      if (staff.bottom < 0) height += -staff.bottom;
    }
  }

  return height;
};

module.exports = calcHeight;

/***/ }),

/***/ "./src/write/classes.js":
/*!******************************!*\
  !*** ./src/write/classes.js ***!
  \******************************/
/***/ (function(module) {

var Classes = function Classes(options) {
  this.shouldAddClasses = options.shouldAddClasses;
  this.reset();
};

Classes.prototype.reset = function () {
  this.lineNumber = null;
  this.voiceNumber = null;
  this.measureNumber = null;
  this.measureTotalPerLine = [];
  this.noteNumber = null;
};

Classes.prototype.incrLine = function () {
  if (this.lineNumber === null) this.lineNumber = 0;else this.lineNumber++;
  this.voiceNumber = null;
  this.measureNumber = null;
  this.noteNumber = null;
};

Classes.prototype.incrVoice = function () {
  if (this.voiceNumber === null) this.voiceNumber = 0;else this.voiceNumber++;
  this.measureNumber = null;
  this.noteNumber = null;
};

Classes.prototype.isInMeasure = function () {
  return this.measureNumber !== null;
};

Classes.prototype.newMeasure = function () {
  if (this.measureNumber) this.measureTotalPerLine[this.lineNumber] = this.measureNumber;
  this.measureNumber = null;
  this.noteNumber = null;
};

Classes.prototype.startMeasure = function () {
  this.measureNumber = 0;
  this.noteNumber = 0;
};

Classes.prototype.incrMeasure = function () {
  this.measureNumber++;
  this.noteNumber = 0;
};

Classes.prototype.incrNote = function () {
  this.noteNumber++;
};

Classes.prototype.measureTotal = function () {
  var total = 0;

  for (var i = 0; i < this.lineNumber; i++) {
    total += this.measureTotalPerLine[i] ? this.measureTotalPerLine[i] : 0;
  } // This can be null when non-music things are present.


  if (this.measureNumber) total += this.measureNumber;
  return total;
};

Classes.prototype.getCurrent = function (c) {
  return {
    line: this.lineNumber,
    measure: this.measureNumber,
    measureTotal: this.measureTotal(),
    voice: this.voiceNumber,
    note: this.noteNumber
  };
};

Classes.prototype.generate = function (c) {
  if (!this.shouldAddClasses) return "";
  var ret = [];
  if (c && c.length > 0) ret.push(c);
  if (this.lineNumber !== null) ret.push("l" + this.lineNumber);
  if (this.measureNumber !== null) ret.push("m" + this.measureNumber);
  if (this.measureNumber !== null) ret.push("mm" + this.measureTotal()); // measureNumber is null between measures so this is still the test for measureTotal

  if (this.voiceNumber !== null) ret.push("v" + this.voiceNumber);
  if (c && (c.indexOf('note') >= 0 || c.indexOf('rest') >= 0 || c.indexOf('lyric') >= 0) && this.noteNumber !== null) ret.push("n" + this.noteNumber); // add a prefix to all classes that abcjs adds.

  if (ret.length > 0) {
    ret = ret.join(' '); // Some strings are compound classes - that is, specify more than one class in a string.

    ret = ret.split(' ');

    for (var i = 0; i < ret.length; i++) {
      if (ret[i].indexOf('abcjs-') !== 0 && ret[i].length > 0) // if the prefix doesn't already exist and the class is not blank.
        ret[i] = 'abcjs-' + ret[i];
    }
  }

  return ret.join(' ');
};

module.exports = Classes;

/***/ }),

/***/ "./src/write/draw/absolute.js":
/*!************************************!*\
  !*** ./src/write/draw/absolute.js ***!
  \************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var drawTempo = __webpack_require__(/*! ./tempo */ "./src/write/draw/tempo.js");

var drawRelativeElement = __webpack_require__(/*! ./relative */ "./src/write/draw/relative.js");

var spacing = __webpack_require__(/*! ../abc_spacing */ "./src/write/abc_spacing.js");

var setClass = __webpack_require__(/*! ../set-class */ "./src/write/set-class.js");

var elementGroup = __webpack_require__(/*! ./group-elements */ "./src/write/draw/group-elements.js");

function drawAbsolute(renderer, params, bartop, selectables, staffPos) {
  if (params.invisible) return;
  var isTempo = params.children.length > 0 && params.children[0].type === "TempoElement";
  params.elemset = [];
  elementGroup.beginGroup(renderer.paper, renderer.controller);

  for (var i = 0; i < params.children.length; i++) {
    var child = params.children[i];
    var el;

    switch (child.type) {
      case "TempoElement":
        el = drawTempo(renderer, child);
        if (el) params.elemset = params.elemset.concat(el);
        break;

      default:
        el = drawRelativeElement(renderer, child, bartop);
        if (el) params.elemset.push(el);
    }
  }

  var klass = params.type;

  if (params.type === 'note' || params.type === 'rest') {
    params.counters = renderer.controller.classes.getCurrent();
    klass += ' d' + Math.round(params.durationClass * 1000) / 1000;
    klass = klass.replace(/\./g, '-');

    if (params.abcelem.pitches) {
      for (var j = 0; j < params.abcelem.pitches.length; j++) {
        klass += ' p' + params.abcelem.pitches[j].pitch;
      }
    }
  }

  var g = elementGroup.endGroup(klass);

  if (g) {
    if (isTempo && params.elemset.length > 0) {
      // If this is a tempo element there are text portions that are in params.elemset[0] already.
      // The graphic portion (the drawn note) is in g and that should just be added to the text so that it is a single element for selecting.
      renderer.paper.moveElementToChild(params.elemset[0], g);
      selectables.add(params, params.elemset[0], false, staffPos);
    } else {
      params.elemset.push(g);
      selectables.add(params, g, params.type === 'note', staffPos);
    }
  } else if (params.elemset.length > 0) selectables.add(params, params.elemset[0], params.type === 'note', staffPos); // If there was no output, then don't add to the selectables. This happens when using the "y" spacer, for instance.


  if (params.klass) setClass(params.elemset, "mark", "", "#00ff00");
  if (params.hint) setClass(params.elemset, "abcjs-hint", "", null);
  params.abcelem.abselem = params;

  if (params.heads && params.heads.length > 0) {
    params.notePositions = [];

    for (var jj = 0; jj < params.heads.length; jj++) {
      params.notePositions.push({
        x: params.heads[jj].x + params.heads[jj].w / 2,
        y: staffPos.zero - params.heads[jj].pitch * spacing.STEP
      });
    }
  }
}

module.exports = drawAbsolute;

/***/ }),

/***/ "./src/write/draw/beam.js":
/*!********************************!*\
  !*** ./src/write/draw/beam.js ***!
  \********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var printPath = __webpack_require__(/*! ./print-path */ "./src/write/draw/print-path.js");

var roundNumber = __webpack_require__(/*! ./round-number */ "./src/write/draw/round-number.js");

function drawBeam(renderer, params) {
  if (params.beams.length === 0) return;
  var pathString = "";

  for (var i = 0; i < params.beams.length; i++) {
    var beam = params.beams[i];

    if (beam.split) {
      var slope = getSlope(renderer, beam.startX, beam.startY, beam.endX, beam.endY);
      var xes = [];

      for (var j = 0; j < beam.split.length; j += 2) {
        xes.push([beam.split[j], beam.split[j + 1]]);
      }

      for (j = 0; j < xes.length; j++) {
        var y1 = getY(beam.startX, beam.startY, slope, xes[j][0]);
        var y2 = getY(beam.startX, beam.startY, slope, xes[j][1]);
        pathString += draw(renderer, xes[j][0], y1, xes[j][1], y2, beam.dy);
      }
    } else pathString += draw(renderer, beam.startX, beam.startY, beam.endX, beam.endY, beam.dy);
  }

  var durationClass = ("abcjs-d" + params.duration).replace(/\./g, "-");
  var klasses = renderer.controller.classes.generate('beam-elem ' + durationClass);
  var el = printPath(renderer, {
    path: pathString,
    stroke: "none",
    fill: renderer.foregroundColor,
    'class': klasses
  });
  return [el];
}

function draw(renderer, startX, startY, endX, endY, dy) {
  // the X coordinates are actual coordinates, but the Y coordinates are in pitches.
  startY = roundNumber(renderer.calcY(startY));
  endY = roundNumber(renderer.calcY(endY));
  startX = roundNumber(startX);
  endX = roundNumber(endX);
  var startY2 = roundNumber(startY + dy);
  var endY2 = roundNumber(endY + dy);
  return "M" + startX + " " + startY + " L" + endX + " " + endY + "L" + endX + " " + endY2 + " L" + startX + " " + startY2 + "z";
}

function getSlope(renderer, startX, startY, endX, endY) {
  return (endY - startY) / (endX - startX);
}

function getY(startX, startY, slope, currentX) {
  var x = currentX - startX;
  return startY + x * slope;
}

module.exports = drawBeam;

/***/ }),

/***/ "./src/write/draw/brace.js":
/*!*********************************!*\
  !*** ./src/write/draw/brace.js ***!
  \*********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var sprintf = __webpack_require__(/*! ./sprintf */ "./src/write/draw/sprintf.js");

var spacing = __webpack_require__(/*! ../abc_spacing */ "./src/write/abc_spacing.js");

var renderText = __webpack_require__(/*! ./text */ "./src/write/draw/text.js");

function drawBrace(renderer, params, selectables) {
  // The absoluteY number is the spot where the note on the first ledger line is drawn (i.e. middle C if treble clef)
  // The STEP offset here moves it to the top and bottom lines
  var startY = params.startVoice.staff.absoluteY - spacing.STEP * 10;
  if (params.endVoice && params.endVoice.staff) params.endY = params.endVoice.staff.absoluteY - spacing.STEP * 2;else if (params.lastContinuedVoice && params.lastContinuedVoice.staff) params.endY = params.lastContinuedVoice.staff.absoluteY - spacing.STEP * 2;else params.endY = params.startVoice.staff.absoluteY - spacing.STEP * 2;
  return draw(renderer, params.x, startY, params.endY, params.type, params.header, selectables);
}

function straightPath(renderer, xLeft, yTop, yBottom, type) {
  xLeft += spacing.STEP;
  var xLineWidth = spacing.STEP * 0.75;
  var yOverlap = spacing.STEP * 0.75;
  var height = yBottom - yTop; // Straight line

  var pathString = sprintf("M %f %f l %f %f l %f %f l %f %f z", xLeft, yTop - yOverlap, // top left line
  0, height + yOverlap * 2, // bottom left line
  xLineWidth, 0, // bottom right line
  0, -(height + yOverlap * 2) // top right line
  ); // Top arm

  var wCurve = spacing.STEP * 2;
  var hCurve = spacing.STEP;
  pathString += sprintf("M %f %f q %f %f %f %f q %f %f %f %f z", xLeft + xLineWidth, yTop - yOverlap, // top left arm
  wCurve * 0.6, hCurve * 0.2, wCurve, -hCurve, // right point
  -wCurve * 0.1, hCurve * 0.3, -wCurve, hCurve + spacing.STEP // left bottom
  ); // Bottom arm

  pathString += sprintf("M %f %f q %f %f %f %f q %f %f %f %f z", xLeft + xLineWidth, yTop + yOverlap + height, // bottom left arm
  wCurve * 0.6, -hCurve * 0.2, wCurve, hCurve, // right point
  -wCurve * 0.1, -hCurve * 0.3, -wCurve, -hCurve - spacing.STEP // left bottom
  );
  return renderer.paper.path({
    path: pathString,
    stroke: renderer.foregroundColor,
    fill: renderer.foregroundColor,
    'class': renderer.controller.classes.generate(type)
  });
}

function curvyPath(renderer, xLeft, yTop, yBottom, type) {
  var yHeight = yBottom - yTop;
  var pathString = curve(xLeft, yTop, [7.5, -8, 21, 0, 18.5, -10.5, 7.5], [0, yHeight / 5.5, yHeight / 3.14, yHeight / 2, yHeight / 2.93, yHeight / 4.88, 0]);
  pathString += curve(xLeft, yTop, [0, 17.5, -7.5, 6.6, -5, 20, 0], [yHeight / 2, yHeight / 1.46, yHeight / 1.22, yHeight, yHeight / 1.19, yHeight / 1.42, yHeight / 2]);
  return renderer.paper.path({
    path: pathString,
    stroke: renderer.foregroundColor,
    fill: renderer.foregroundColor,
    'class': renderer.controller.classes.generate(type)
  });
}

function curve(xLeft, yTop, xCurve, yCurve) {
  return sprintf("M %f %f C %f %f %f %f %f %f C %f %f %f %f %f %f z", xLeft + xCurve[0], yTop + yCurve[0], xLeft + xCurve[1], yTop + yCurve[1], xLeft + xCurve[2], yTop + yCurve[2], xLeft + xCurve[3], yTop + yCurve[3], xLeft + xCurve[4], yTop + yCurve[4], xLeft + xCurve[5], yTop + yCurve[5], xLeft + xCurve[6], yTop + yCurve[6]);
}

var draw = function draw(renderer, xLeft, yTop, yBottom, type, header, selectables) {
  //Tony
  var ret;

  if (header) {
    renderer.paper.openGroup({
      klass: renderer.controller.classes.generate("staff-extra voice-name")
    });
    var position = yTop + (yBottom - yTop) / 2;
    position = position - renderer.controller.getTextSize.baselineToCenter(header, "voicefont", 'staff-extra voice-name', 0, 1);
    renderText(renderer, {
      x: renderer.padding.left,
      y: position,
      text: header,
      type: 'voicefont',
      klass: 'staff-extra voice-name',
      anchor: 'start',
      centerVertically: true
    });
  }

  if (type === "brace") ret = curvyPath(renderer, xLeft, yTop, yBottom, type);else if (type === "bracket") ret = straightPath(renderer, xLeft, yTop, yBottom, type);

  if (header) {
    ret = renderer.paper.closeGroup();
  }

  selectables.wrapSvgEl({
    el_type: type,
    startChar: -1,
    endChar: -1
  }, ret);
  return ret;
};

module.exports = drawBrace;

/***/ }),

/***/ "./src/write/draw/crescendo.js":
/*!*************************************!*\
  !*** ./src/write/draw/crescendo.js ***!
  \*************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var sprintf = __webpack_require__(/*! ./sprintf */ "./src/write/draw/sprintf.js");

var printPath = __webpack_require__(/*! ./print-path */ "./src/write/draw/print-path.js");

var roundNumber = __webpack_require__(/*! ./round-number */ "./src/write/draw/round-number.js");

function drawCrescendo(renderer, params, selectables) {
  if (params.pitch === undefined) window.console.error("Crescendo Element y-coordinate not set.");
  var y = renderer.calcY(params.pitch) + 4; // This is the top pixel to use (it is offset a little so that it looks good with the volume marks.)

  var height = 8; // TODO-PER: This is just a quick hack to make the dynamic marks not crash if they are mismatched. See the slur treatment for the way to get the beginning and end.

  var left = params.anchor1 ? params.anchor1.x : 0;
  var right = params.anchor2 ? params.anchor2.x : 800;
  var el;

  if (params.dir === "<") {
    el = drawLine(renderer, y + height / 2, y, y + height / 2, y + height, left, right);
  } else {
    el = drawLine(renderer, y, y + height / 2, y + height, y + height / 2, left, right);
  }

  selectables.wrapSvgEl({
    el_type: "dynamicDecoration",
    startChar: -1,
    endChar: -1
  }, el);
  return [el];
}

var drawLine = function drawLine(renderer, y1, y2, y3, y4, left, right) {
  y1 = roundNumber(y1);
  y2 = roundNumber(y2);
  y3 = roundNumber(y3);
  y4 = roundNumber(y4);
  left = roundNumber(left);
  right = roundNumber(right);
  var pathString = sprintf("M %f %f L %f %f M %f %f L %f %f", left, y1, right, y2, left, y3, right, y4);
  return printPath(renderer, {
    path: pathString,
    highlight: "stroke",
    stroke: renderer.foregroundColor,
    'class': renderer.controller.classes.generate('dynamics decoration')
  });
};

module.exports = drawCrescendo;

/***/ }),

/***/ "./src/write/draw/debug-box.js":
/*!*************************************!*\
  !*** ./src/write/draw/debug-box.js ***!
  \*************************************/
/***/ (function(module) {

function printDebugBox(renderer, attr, comment) {
  var box = renderer.paper.rectBeneath(attr);
  if (comment) renderer.paper.text(comment, {
    x: 0,
    y: attr.y + 7,
    "text-anchor": "start",
    "font-size": "14px",
    fill: "rgba(0,0,255,.4)",
    stroke: "rgba(0,0,255,.4)"
  });
  return box;
}

module.exports = printDebugBox;

/***/ }),

/***/ "./src/write/draw/draw.js":
/*!********************************!*\
  !*** ./src/write/draw/draw.js ***!
  \********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var drawStaffGroup = __webpack_require__(/*! ./staff-group */ "./src/write/draw/staff-group.js");

var setPaperSize = __webpack_require__(/*! ./set-paper-size */ "./src/write/draw/set-paper-size.js");

var nonMusic = __webpack_require__(/*! ./non-music */ "./src/write/draw/non-music.js");

var spacing = __webpack_require__(/*! ../abc_spacing */ "./src/write/abc_spacing.js");

var Selectables = __webpack_require__(/*! ./selectables */ "./src/write/draw/selectables.js");

function draw(renderer, classes, abcTune, width, maxWidth, responsive, scale, selectTypes, tuneNumber) {
  var selectables = new Selectables(renderer.paper, selectTypes, tuneNumber);
  renderer.moveY(renderer.padding.top);
  nonMusic(renderer, abcTune.topText, selectables);
  renderer.moveY(renderer.spacing.music);
  var staffgroups = [];

  for (var line = 0; line < abcTune.lines.length; line++) {
    classes.incrLine();
    var abcLine = abcTune.lines[line];

    if (abcLine.staff) {
      if (abcLine.vskip) {
        renderer.moveY(abcLine.vskip);
      }

      if (staffgroups.length >= 1) addStaffPadding(renderer, renderer.spacing.staffSeparation, staffgroups[staffgroups.length - 1], abcLine.staffGroup);
      var staffgroup = engraveStaffLine(renderer, abcLine.staffGroup, selectables);
      staffgroup.line = line; // If there are non-music lines then the staffgroup array won't line up with the line array, so this keeps track.

      staffgroups.push(staffgroup);
    } else if (abcLine.nonMusic) {
      nonMusic(renderer, abcLine.nonMusic, selectables);
    }
  }

  classes.reset();
  renderer.moveY(24); // TODO-PER: Empirically discovered. What variable should this be?

  nonMusic(renderer, abcTune.bottomText, selectables);
  setPaperSize(renderer, maxWidth, scale, responsive);
  return {
    staffgroups: staffgroups,
    selectables: selectables.getElements()
  };
}

function engraveStaffLine(renderer, staffGroup, selectables) {
  drawStaffGroup(renderer, staffGroup, selectables);
  var height = staffGroup.height * spacing.STEP;
  renderer.y += height;
  return staffGroup;
}

function addStaffPadding(renderer, staffSeparation, lastStaffGroup, thisStaffGroup) {
  var lastStaff = lastStaffGroup.staffs[lastStaffGroup.staffs.length - 1];
  var lastBottomLine = -(lastStaff.bottom - 2); // The 2 is because the scale goes to 2 below the last line.

  var nextTopLine = thisStaffGroup.staffs[0].top - 10; // Because 10 represents the top line.

  var naturalSeparation = nextTopLine + lastBottomLine; // This is how far apart they'd be without extra spacing

  var separationInPixels = naturalSeparation * spacing.STEP;
  if (separationInPixels < staffSeparation) renderer.moveY(staffSeparation - separationInPixels);
}

module.exports = draw;

/***/ }),

/***/ "./src/write/draw/dynamics.js":
/*!************************************!*\
  !*** ./src/write/draw/dynamics.js ***!
  \************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var printSymbol = __webpack_require__(/*! ./print-symbol */ "./src/write/draw/print-symbol.js");

function drawDynamics(renderer, params, selectables) {
  if (params.pitch === undefined) window.console.error("Dynamic Element y-coordinate not set.");
  var scalex = 1;
  var scaley = 1;
  var el = printSymbol(renderer, params.anchor.x, params.pitch, params.dec, scalex, scaley, renderer.controller.classes.generate('decoration dynamics'));
  selectables.wrapSvgEl({
    el_type: "dynamicDecoration",
    startChar: -1,
    endChar: -1,
    decoration: params.dec
  }, el);
  return [el];
}

module.exports = drawDynamics;

/***/ }),

/***/ "./src/write/draw/ending.js":
/*!**********************************!*\
  !*** ./src/write/draw/ending.js ***!
  \**********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var sprintf = __webpack_require__(/*! ./sprintf */ "./src/write/draw/sprintf.js");

var renderText = __webpack_require__(/*! ./text */ "./src/write/draw/text.js");

var printPath = __webpack_require__(/*! ./print-path */ "./src/write/draw/print-path.js");

var roundNumber = __webpack_require__(/*! ./round-number */ "./src/write/draw/round-number.js");

function drawEnding(renderer, params, linestartx, lineendx, selectables) {
  if (params.pitch === undefined) window.console.error("Ending Element y-coordinate not set.");
  var y = roundNumber(renderer.calcY(params.pitch));
  var height = 20;
  var pathString = '';

  if (params.anchor1) {
    linestartx = roundNumber(params.anchor1.x + params.anchor1.w);
    pathString += sprintf("M %f %f L %f %f ", linestartx, y, linestartx, roundNumber(y + height));
  }

  if (params.anchor2) {
    lineendx = roundNumber(params.anchor2.x);
    pathString += sprintf("M %f %f L %f %f ", lineendx, y, lineendx, roundNumber(y + height));
  }

  pathString += sprintf("M %f %f L %f %f ", linestartx, y, lineendx, y);
  renderer.paper.openGroup({
    klass: renderer.controller.classes.generate("ending")
  });
  printPath(renderer, {
    path: pathString,
    stroke: renderer.foregroundColor,
    fill: renderer.foregroundColor
  });
  if (params.anchor1) renderText(renderer, {
    x: roundNumber(linestartx + 5),
    y: roundNumber(renderer.calcY(params.pitch - 0.5)),
    text: params.text,
    type: 'repeatfont',
    klass: 'ending',
    anchor: "start",
    noClass: true
  });
  var g = renderer.paper.closeGroup();
  selectables.wrapSvgEl({
    el_type: "ending",
    startChar: -1,
    endChar: -1
  }, g);
  return [g];
}

module.exports = drawEnding;

/***/ }),

/***/ "./src/write/draw/group-elements.js":
/*!******************************************!*\
  !*** ./src/write/draw/group-elements.js ***!
  \******************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

/**
 * Begin a group of glyphs that will always be moved, scaled and highlighted together
 */
var roundNumber = __webpack_require__(/*! ./round-number */ "./src/write/draw/round-number.js");

function Group() {
  this.ingroup = false;
}

Group.prototype.beginGroup = function (paper, controller) {
  this.paper = paper;
  this.controller = controller;
  this.path = [];
  this.lastM = [0, 0];
  this.ingroup = true;
};

Group.prototype.isInGroup = function () {
  return this.ingroup;
};

Group.prototype.addPath = function (path) {
  path = path || [];
  if (path.length === 0) return;
  path[0][0] = "m";
  path[0][1] = roundNumber(path[0][1] - this.lastM[0]);
  path[0][2] = roundNumber(path[0][2] - this.lastM[1]);
  this.lastM[0] += path[0][1];
  this.lastM[1] += path[0][2];
  this.path.push(path[0]);

  for (var i = 1, ii = path.length; i < ii; i++) {
    if (path[i][0] === "m") {
      this.lastM[0] += path[i][1];
      this.lastM[1] += path[i][2];
    }

    this.path.push(path[i]);
  }
};
/**
 * End a group of glyphs that will always be moved, scaled and highlighted together
 */


Group.prototype.endGroup = function (klass) {
  this.ingroup = false;
  if (this.path.length === 0) return null;
  var path = "";

  for (var i = 0; i < this.path.length; i++) {
    path += this.path[i].join(" ");
  }

  var ret = this.paper.path({
    path: path,
    stroke: "none",
    fill: this.controller.renderer.foregroundColor,
    'class': this.controller.classes.generate(klass)
  });
  this.path = [];
  return ret;
}; // There is just a singleton of this object.


var elementGroup = new Group();
module.exports = elementGroup;

/***/ }),

/***/ "./src/write/draw/non-music.js":
/*!*************************************!*\
  !*** ./src/write/draw/non-music.js ***!
  \*************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var drawSeparator = __webpack_require__(/*! ./separator */ "./src/write/draw/separator.js");

var renderText = __webpack_require__(/*! ./text */ "./src/write/draw/text.js");

function nonMusic(renderer, obj, selectables) {
  for (var i = 0; i < obj.rows.length; i++) {
    var row = obj.rows[i];

    if (row.move) {
      renderer.moveY(row.move);
    } else if (row.text) {
      var x = row.left ? row.left : 0;
      var el = renderText(renderer, {
        x: x,
        y: renderer.y,
        text: row.text,
        type: row.font,
        klass: row.klass,
        anchor: row.anchor
      });

      if (row.absElemType) {
        selectables.wrapSvgEl({
          el_type: row.absElemType,
          startChar: -1,
          endChar: -1,
          text: row.text
        }, el);
      }
    } else if (row.separator) {
      drawSeparator(renderer, row.separator);
    } else if (row.startGroup) {
      renderer.paper.openGroup({
        klass: row.klass
      });
    } else if (row.endGroup) {
      // TODO-PER: also create a history element with the title "row.endGroup"
      var g = renderer.paper.closeGroup();
      if (row.absElemType) selectables.wrapSvgEl({
        el_type: row.absElemType,
        startChar: -1,
        endChar: -1,
        text: ""
      }, g);
    }
  }
}

module.exports = nonMusic;

/***/ }),

/***/ "./src/write/draw/print-path.js":
/*!**************************************!*\
  !*** ./src/write/draw/print-path.js ***!
  \**************************************/
/***/ (function(module) {

function printPath(renderer, attrs, params) {
  var ret = renderer.paper.path(attrs);
  return ret;
}

module.exports = printPath;

/***/ }),

/***/ "./src/write/draw/print-stem.js":
/*!**************************************!*\
  !*** ./src/write/draw/print-stem.js ***!
  \**************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var elementGroup = __webpack_require__(/*! ./group-elements */ "./src/write/draw/group-elements.js");

var roundNumber = __webpack_require__(/*! ./round-number */ "./src/write/draw/round-number.js");

function printStem(renderer, x, dx, y1, y2) {
  if (dx < 0 || y1 < y2) {
    // correct path "handedness" for intersection with other elements
    var tmp = roundNumber(y2);
    y2 = roundNumber(y1);
    y1 = tmp;
  } else {
    y1 = roundNumber(y1);
    y2 = roundNumber(y2);
  }

  x = roundNumber(x);
  var x2 = roundNumber(x + dx);
  var fill = renderer.foregroundColor;
  var pathArray = [["M", x, y1], ["L", x, y2], ["L", x2, y2], ["L", x2, y1], ["z"]];

  if (elementGroup.isInGroup()) {
    elementGroup.addPath(pathArray);
  } else {
    var path = "";

    for (var i = 0; i < pathArray.length; i++) {
      path += pathArray[i].join(" ");
    }

    var ret = renderer.paper.pathToBack({
      path: path,
      stroke: "none",
      fill: fill,
      'class': renderer.controller.classes.generate('stem')
    });
    return ret;
  }
}

module.exports = printStem;

/***/ }),

/***/ "./src/write/draw/print-symbol.js":
/*!****************************************!*\
  !*** ./src/write/draw/print-symbol.js ***!
  \****************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var renderText = __webpack_require__(/*! ./text */ "./src/write/draw/text.js");

var glyphs = __webpack_require__(/*! ../abc_glyphs */ "./src/write/abc_glyphs.js");

var elementGroup = __webpack_require__(/*! ./group-elements */ "./src/write/draw/group-elements.js");
/**
 * assumes this.y is set appropriately
 * if symbol is a multichar string without a . (as in scripts.staccato) 1 symbol per char is assumed
 * not scaled if not in printgroup
 */


function printSymbol(renderer, x, offset, symbol, scalex, scaley, klass) {
  var el;
  var ycorr;
  if (!symbol) return null;

  if (symbol.length > 1 && symbol.indexOf(".") < 0) {
    renderer.paper.openGroup({
      klass: klass
    });
    var dx = 0;

    for (var i = 0; i < symbol.length; i++) {
      var s = symbol.charAt(i);
      ycorr = glyphs.getYCorr(s);
      el = glyphs.printSymbol(x + dx, renderer.calcY(offset + ycorr), s, renderer.paper, '', "none", renderer.foregroundColor);

      if (el) {
        if (i < symbol.length - 1) dx += kernSymbols(s, symbol.charAt(i + 1), glyphs.getSymbolWidth(s));
      } else {
        renderText(renderer, {
          x: x,
          y: renderer.y,
          text: "no symbol:" + symbol,
          type: "debugfont",
          klass: 'debug-msg',
          anchor: 'start'
        });
      }
    }

    var g = renderer.paper.closeGroup();
    return g;
  } else {
    ycorr = glyphs.getYCorr(symbol);

    if (elementGroup.isInGroup()) {
      elementGroup.addPath(glyphs.getPathForSymbol(x, renderer.calcY(offset + ycorr), symbol, scalex, scaley));
    } else {
      el = glyphs.printSymbol(x, renderer.calcY(offset + ycorr), symbol, renderer.paper, klass, "none", renderer.foregroundColor);

      if (el) {
        return el;
      } else renderText(renderer, {
        x: x,
        y: renderer.y,
        text: "no symbol:" + symbol,
        type: "debugfont",
        klass: 'debug-msg',
        anchor: 'start'
      });
    }

    return null;
  }
}

function kernSymbols(lastSymbol, thisSymbol, lastSymbolWidth) {
  // This is just some adjustments to make it look better.
  var width = lastSymbolWidth;
  if (lastSymbol === 'f' && thisSymbol === 'f') width = width * 2 / 3;
  if (lastSymbol === 'p' && thisSymbol === 'p') width = width * 5 / 6;
  if (lastSymbol === 'f' && thisSymbol === 'z') width = width * 5 / 8;
  return width;
}

module.exports = printSymbol;

/***/ }),

/***/ "./src/write/draw/relative.js":
/*!************************************!*\
  !*** ./src/write/draw/relative.js ***!
  \************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var renderText = __webpack_require__(/*! ./text */ "./src/write/draw/text.js");

var printStem = __webpack_require__(/*! ./print-stem */ "./src/write/draw/print-stem.js");

var printStaffLine = __webpack_require__(/*! ./staff-line */ "./src/write/draw/staff-line.js");

var printSymbol = __webpack_require__(/*! ./print-symbol */ "./src/write/draw/print-symbol.js");

function drawRelativeElement(renderer, params, bartop) {
  if (params.pitch === undefined) window.console.error(params.type + " Relative Element y-coordinate not set.");
  var y = renderer.calcY(params.pitch);

  switch (params.type) {
    case "symbol":
      if (params.c === null) return null;
      var klass = "symbol";
      if (params.klass) klass += " " + params.klass;
      params.graphelem = printSymbol(renderer, params.x, params.pitch, params.c, params.scalex, params.scaley, renderer.controller.classes.generate(klass), "none", renderer.foregroundColor);
      break;

    case "debug":
      params.graphelem = renderText(renderer, {
        x: params.x,
        y: renderer.calcY(15),
        text: "" + params.c,
        type: "debugfont",
        klass: renderer.controller.classes.generate('debug-msg'),
        anchor: 'start',
        centerVertically: false,
        dim: params.dim
      });
      break;

    case "barNumber":
      params.graphelem = renderText(renderer, {
        x: params.x,
        y: y,
        text: "" + params.c,
        type: "measurefont",
        klass: renderer.controller.classes.generate('bar-number'),
        anchor: "middle",
        dim: params.dim
      });
      break;

    case "lyric":
      params.graphelem = renderText(renderer, {
        x: params.x,
        y: y,
        text: params.c,
        type: "vocalfont",
        klass: renderer.controller.classes.generate('lyric'),
        anchor: "middle",
        dim: params.dim
      });
      break;

    case "chord":
      params.graphelem = renderText(renderer, {
        x: params.x,
        y: y,
        text: params.c,
        type: 'gchordfont',
        klass: renderer.controller.classes.generate("chord"),
        anchor: "middle",
        dim: params.dim,
        lane: params.getLane()
      });
      break;

    case "decoration":
      // The +6 is to compensate for the placement of text in svg: to be on the same row as symbols, the y-coord needs to compensate for the center line.
      params.graphelem = renderText(renderer, {
        x: params.x,
        y: y + 6,
        text: params.c,
        type: 'annotationfont',
        klass: renderer.controller.classes.generate("annotation"),
        anchor: "middle",
        centerVertically: true,
        dim: params.dim
      });
      break;

    case "text":
      params.graphelem = renderText(renderer, {
        x: params.x,
        y: y,
        text: params.c,
        type: 'annotationfont',
        klass: renderer.controller.classes.generate("annotation"),
        anchor: "start",
        centerVertically: params.centerVertically,
        dim: params.dim,
        lane: params.getLane()
      });
      break;

    case "multimeasure-text":
      params.graphelem = renderText(renderer, {
        x: params.x + params.w / 2,
        y: y,
        text: params.c,
        type: 'tempofont',
        klass: renderer.controller.classes.generate("rest"),
        anchor: "middle",
        centerVertically: false,
        dim: params.dim
      });
      break;

    case "part":
      params.graphelem = renderText(renderer, {
        x: params.x,
        y: y,
        text: params.c,
        type: 'partsfont',
        klass: renderer.controller.classes.generate("part"),
        anchor: "start",
        dim: params.dim
      });
      break;

    case "bar":
      params.graphelem = printStem(renderer, params.x, params.linewidth, y, bartop ? bartop : renderer.calcY(params.pitch2));
      break;
    // bartop can't be 0

    case "stem":
      params.graphelem = printStem(renderer, params.x, params.linewidth, y, renderer.calcY(params.pitch2));
      break;

    case "ledger":
      params.graphelem = printStaffLine(renderer, params.x, params.x + params.w, params.pitch, renderer.controller.classes.generate("ledger"));
      break;
  }

  if (params.scalex !== 1 && params.graphelem) {
    scaleExistingElem(renderer.paper, params.graphelem, params.scalex, params.scaley, params.x, y);
  }

  return params.graphelem;
}

function scaleExistingElem(paper, elem, scaleX, scaleY, x, y) {
  paper.setAttributeOnElement(elem, {
    style: "transform:scale(" + scaleX + "," + scaleY + ");transform-origin:" + x + "px " + y + "px;"
  });
}

module.exports = drawRelativeElement;

/***/ }),

/***/ "./src/write/draw/round-number.js":
/*!****************************************!*\
  !*** ./src/write/draw/round-number.js ***!
  \****************************************/
/***/ (function(module) {

function roundNumber(x) {
  return parseFloat(x.toFixed(2));
}

module.exports = roundNumber;

/***/ }),

/***/ "./src/write/draw/selectables.js":
/*!***************************************!*\
  !*** ./src/write/draw/selectables.js ***!
  \***************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var highlight = __webpack_require__(/*! ../highlight */ "./src/write/highlight.js");

var unhighlight = __webpack_require__(/*! ../unhighlight */ "./src/write/unhighlight.js");

function Selectables(paper, selectTypes, tuneNumber) {
  this.elements = [];
  this.paper = paper;
  this.tuneNumber = tuneNumber;
  this.selectTypes = selectTypes;
}

Selectables.prototype.getElements = function () {
  return this.elements;
};

Selectables.prototype.add = function (absEl, svgEl, isNote, staffPos) {
  if (!this.canSelect(absEl)) return;
  var params;
  if (this.selectTypes === undefined) params = {
    selectable: false,
    "data-index": this.elements.length
  }; // This is the old behavior.
  else params = {
      selectable: true,
      tabindex: 0,
      "data-index": this.elements.length
    };
  this.paper.setAttributeOnElement(svgEl, params);
  var sel = {
    absEl: absEl,
    svgEl: svgEl,
    isDraggable: isNote
  };
  if (staffPos !== undefined) sel.staffPos = staffPos;
  this.elements.push(sel);
};

Selectables.prototype.canSelect = function (absEl) {
  if (this.selectTypes === false) return false;
  if (!absEl || !absEl.abcelem) return false;
  if (this.selectTypes === true) return true;

  if (this.selectTypes === undefined) {
    // by default, only notes can be clicked.
    return absEl.abcelem.el_type === 'note';
  }

  return this.selectTypes.indexOf(absEl.abcelem.el_type) >= 0;
};

Selectables.prototype.wrapSvgEl = function (abcelem, el) {
  var absEl = {
    tuneNumber: this.tuneNumber,
    abcelem: abcelem,
    elemset: [el],
    highlight: highlight,
    unhighlight: unhighlight
  };
  this.add(absEl, el, false);
};

module.exports = Selectables;

/***/ }),

/***/ "./src/write/draw/separator.js":
/*!*************************************!*\
  !*** ./src/write/draw/separator.js ***!
  \*************************************/
/***/ (function(module) {

function drawSeparator(renderer, width) {
  var fill = "rgba(0,0,0,255)";
  var stroke = "rgba(0,0,0,0)";
  var y = Math.round(renderer.y);
  var staffWidth = renderer.controller.width;
  var x1 = (staffWidth - width) / 2;
  var x2 = x1 + width;
  var pathString = 'M ' + x1 + ' ' + y + ' L ' + x2 + ' ' + y + ' L ' + x2 + ' ' + (y + 1) + ' L ' + x1 + ' ' + (y + 1) + ' L ' + x1 + ' ' + y + ' z';
  renderer.paper.pathToBack({
    path: pathString,
    stroke: stroke,
    fill: fill,
    'class': renderer.controller.classes.generate('defined-text')
  });
}

module.exports = drawSeparator;

/***/ }),

/***/ "./src/write/draw/set-paper-size.js":
/*!******************************************!*\
  !*** ./src/write/draw/set-paper-size.js ***!
  \******************************************/
/***/ (function(module) {

function setPaperSize(renderer, maxwidth, scale, responsive) {
  var w = (maxwidth + renderer.padding.right) * scale;
  var h = (renderer.y + renderer.padding.bottom) * scale;
  if (renderer.isPrint) h = Math.max(h, 1056); // 11in x 72pt/in x 1.33px/pt
  // TODO-PER: We are letting the page get as long as it needs now, but eventually that should go to a second page.
  // for accessibility

  var text = "Sheet Music";
  if (renderer.abctune && renderer.abctune.metaText && renderer.abctune.metaText.title) text += " for \"" + renderer.abctune.metaText.title + '"';
  renderer.paper.setTitle(text);
  var label = renderer.ariaLabel ? renderer.ariaLabel : text;
  renderer.paper.setAttribute("aria-label", label); // for dragging - don't select during drag

  var styles = ["-webkit-touch-callout: none;", "-webkit-user-select: none;", "-khtml-user-select: none;", "-moz-user-select: none;", "-ms-user-select: none;", "user-select: none;"];
  renderer.paper.insertStyles(".abcjs-dragging-in-progress text, .abcjs-dragging-in-progress tspan {" + styles.join(" ") + "}");
  var parentStyles = {
    overflow: "hidden"
  };

  if (responsive === 'resize') {
    renderer.paper.setResponsiveWidth(w, h);
  } else {
    parentStyles.width = "";
    parentStyles.height = h + "px";

    if (scale < 1) {
      parentStyles.width = w + "px";
      renderer.paper.setSize(w / scale, h / scale);
    } else renderer.paper.setSize(w, h);
  }

  renderer.paper.setScale(scale);
  renderer.paper.setParentStyles(parentStyles);
}

module.exports = setPaperSize;

/***/ }),

/***/ "./src/write/draw/sprintf.js":
/*!***********************************!*\
  !*** ./src/write/draw/sprintf.js ***!
  \***********************************/
/***/ (function(module) {

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * sprintf() for JavaScript v.0.4
 *
 Copyright (c) 2007-present, Alexandru Mărășteanu <hello@alexei.ro>
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 * Neither the name of this software nor the names of its contributors may be
 used to endorse or promote products derived from this software without
 specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR
 ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
//function str_repeat(i, m) { for (var o = []; m > 0; o[--m] = i); return(o.join('')); }
var sprintf = function sprintf() {
  var i = 0,
      a,
      f = arguments[i++],
      o = [],
      m,
      p,
      c,
      x;

  while (f) {
    if (m = /^[^\x25]+/.exec(f)) o.push(m[0]);else if (m = /^\x25{2}/.exec(f)) o.push('%');else if (m = /^\x25(?:(\d+)\$)?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(f)) {
      if ((a = arguments[m[1] || i++]) == null || a == undefined) throw "Too few arguments.";
      if (/[^s]/.test(m[7]) && typeof a != 'number') throw "Expecting number but found " + _typeof(a);

      switch (m[7]) {
        case 'b':
          a = a.toString(2);
          break;

        case 'c':
          a = String.fromCharCode(a);
          break;

        case 'd':
          a = parseInt(a);
          break;

        case 'e':
          a = m[6] ? a.toExponential(m[6]) : a.toExponential();
          break;

        case 'f':
          a = m[6] ? parseFloat(a).toFixed(m[6]) : parseFloat(a);
          break;

        case 'o':
          a = a.toString(8);
          break;

        case 's':
          a = (a = String(a)) && m[6] ? a.substring(0, m[6]) : a;
          break;

        case 'u':
          a = Math.abs(a);
          break;

        case 'x':
          a = a.toString(16);
          break;

        case 'X':
          a = a.toString(16).toUpperCase();
          break;
      }

      a = /[def]/.test(m[7]) && m[2] && a > 0 ? '+' + a : a;
      c = m[3] ? m[3] == '0' ? '0' : m[3].charAt(1) : ' ';
      x = m[5] - String(a).length;
      p = m[5] ? str_repeat(c, x) : '';
      o.push(m[4] ? a + p : p + a);
    } else throw "Huh ?!";
    f = f.substring(m[0].length);
  }

  return o.join('');
};

module.exports = sprintf;

/***/ }),

/***/ "./src/write/draw/staff-group.js":
/*!***************************************!*\
  !*** ./src/write/draw/staff-group.js ***!
  \***************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var spacing = __webpack_require__(/*! ../abc_spacing */ "./src/write/abc_spacing.js");

var drawBrace = __webpack_require__(/*! ./brace */ "./src/write/draw/brace.js");

var drawVoice = __webpack_require__(/*! ./voice */ "./src/write/draw/voice.js");

var printStaff = __webpack_require__(/*! ./staff */ "./src/write/draw/staff.js");

var printDebugBox = __webpack_require__(/*! ./debug-box */ "./src/write/draw/debug-box.js");

var printStem = __webpack_require__(/*! ./print-stem */ "./src/write/draw/print-stem.js");

function drawStaffGroup(renderer, params, selectables) {
  // We enter this method with renderer.y pointing to the topmost coordinate that we're allowed to draw.
  // All of the children that will be drawn have a relative "pitch" set, where zero is the first ledger line below the staff.
  // renderer.y will be offset at the beginning of each staff by the amount required to make the relative pitch work.
  // If there are multiple staves, then renderer.y will be incremented for each new staff.
  var colorIndex; // An invisible marker is useful to be able to find where each system starts.

  addInvisibleMarker(renderer, "abcjs-top-of-system");
  var startY = renderer.y; // So that it can be restored after we're done.
  // Set the absolute Y position for each staff here, so the voice drawing below can just use if.

  for (var j = 0; j < params.staffs.length; j++) {
    var staff1 = params.staffs[j]; //renderer.printHorizontalLine(50, renderer.y, "start");

    renderer.moveY(spacing.STEP, staff1.top);
    staff1.absoluteY = renderer.y;

    if (renderer.showDebug) {
      if (renderer.showDebug.indexOf("box") >= 0) {
        boxAllElements(renderer, params.voices, staff1.voices);
      }

      if (renderer.showDebug.indexOf("grid") >= 0) {
        renderer.paper.dottedLine({
          x1: renderer.padding.left,
          x2: renderer.padding.left + renderer.controller.width,
          y1: startY,
          y2: startY,
          stroke: "#0000ff"
        });
        printDebugBox(renderer, {
          x: renderer.padding.left,
          y: renderer.calcY(staff1.originalTop),
          width: renderer.controller.width,
          height: renderer.calcY(staff1.originalBottom) - renderer.calcY(staff1.originalTop),
          fill: renderer.foregroundColor,
          stroke: renderer.foregroundColor,
          "fill-opacity": 0.1,
          "stroke-opacity": 0.1
        });
        colorIndex = 0;
        debugPrintGridItem(staff1, 'chordHeightAbove');
        debugPrintGridItem(staff1, 'chordHeightBelow');
        debugPrintGridItem(staff1, 'dynamicHeightAbove');
        debugPrintGridItem(staff1, 'dynamicHeightBelow');
        debugPrintGridItem(staff1, 'endingHeightAbove');
        debugPrintGridItem(staff1, 'lyricHeightAbove');
        debugPrintGridItem(staff1, 'lyricHeightBelow');
        debugPrintGridItem(staff1, 'partHeightAbove');
        debugPrintGridItem(staff1, 'tempoHeightAbove');
        debugPrintGridItem(staff1, 'volumeHeightAbove');
        debugPrintGridItem(staff1, 'volumeHeightBelow');
      }
    }

    renderer.moveY(spacing.STEP, -staff1.bottom);

    if (renderer.showDebug) {
      if (renderer.showDebug.indexOf("grid") >= 0) {
        renderer.paper.dottedLine({
          x1: renderer.padding.left,
          x2: renderer.padding.left + renderer.controller.width,
          y1: renderer.y,
          y2: renderer.y,
          stroke: "#0000aa"
        });
      }
    }
  }

  var topLine; // these are to connect multiple staves. We need to remember where they are.

  var bottomLine;
  var bartop = 0;

  for (var i = 0; i < params.voices.length; i++) {
    var staff = params.voices[i].staff;
    renderer.y = staff.absoluteY;
    renderer.controller.classes.incrVoice(); //renderer.y = staff.y;
    // offset for starting the counting at middle C

    if (!params.voices[i].duplicate) {
      //			renderer.moveY(spacing.STEP, staff.top);
      if (!topLine) topLine = renderer.calcY(10);
      bottomLine = renderer.calcY(2);

      if (staff.lines !== 0) {
        renderer.controller.classes.newMeasure();
        printStaff(renderer, params.startx, params.w, staff.lines);
      }

      printBrace(renderer, staff.absoluteY, params.brace, i, selectables);
      printBrace(renderer, staff.absoluteY, params.bracket, i, selectables);
    }

    drawVoice(renderer, params.voices[i], bartop, selectables, {
      top: startY,
      zero: renderer.y,
      height: params.height * spacing.STEP
    });
    renderer.controller.classes.newMeasure();

    if (!params.voices[i].duplicate) {
      bartop = renderer.calcY(2); // This connects the bar lines between two different staves.
      //			if (staff.bottom < 0)
      //				renderer.moveY(spacing.STEP, -staff.bottom);
    }
  }

  renderer.controller.classes.newMeasure(); // connect all the staves together with a vertical line

  if (params.staffs.length > 1) {
    printStem(renderer, params.startx, 0.6, topLine, bottomLine);
  }

  renderer.y = startY;

  function debugPrintGridItem(staff, key) {
    var colors = ["rgb(207,27,36)", "rgb(168,214,80)", "rgb(110,161,224)", "rgb(191,119,218)", "rgb(195,30,151)", "rgb(31,170,177)", "rgb(220,166,142)"];

    if (staff.positionY[key]) {
      var height = staff.specialY[key] * spacing.STEP;
      if (key === "chordHeightAbove" && staff.specialY.chordLines && staff.specialY.chordLines.above) height *= staff.specialY.chordLines.above;
      if (key === "chordHeightBelow" && staff.specialY.chordLines && staff.specialY.chordLines.below) height *= staff.specialY.chordLines.below;
      printDebugBox(renderer, {
        x: renderer.padding.left,
        y: renderer.calcY(staff.positionY[key]),
        width: renderer.controller.width,
        height: height,
        fill: colors[colorIndex],
        stroke: colors[colorIndex],
        "fill-opacity": 0.4,
        "stroke-opacity": 0.4
      }, key.substr(0, 4));
      colorIndex += 1;
      if (colorIndex > 6) colorIndex = 0;
    }
  }
}

function printBrace(renderer, absoluteY, brace, index, selectables) {
  if (brace) {
    for (var i = 0; i < brace.length; i++) {
      if (brace[i].isStartVoice(index)) {
        brace[i].startY = absoluteY - spacing.STEP * 10;
        brace[i].elemset = drawBrace(renderer, brace[i], selectables);
      }
    }
  }
}

function addInvisibleMarker(renderer, className) {
  var y = Math.round(renderer.y);
  renderer.paper.pathToBack({
    path: "M 0 " + y + " L 0 0",
    stroke: "none",
    fill: "none",
    "stroke-opacity": 0,
    "fill-opacity": 0,
    'class': renderer.controller.classes.generate(className),
    'data-vertical': y
  });
}

function boxAllElements(renderer, voices, which) {
  for (var i = 0; i < which.length; i++) {
    var children = voices[which[i]].children;

    for (var j = 0; j < children.length; j++) {
      var elem = children[j];
      var coords = elem.getFixedCoords();
      if (elem.invisible || coords.t === undefined || coords.b === undefined) continue;
      var height = (coords.t - coords.b) * spacing.STEP;
      printDebugBox(renderer, {
        x: coords.x,
        y: renderer.calcY(coords.t),
        width: coords.w,
        height: height,
        fill: "#88e888",
        "fill-opacity": 0.4,
        stroke: "#4aa93d",
        "stroke-opacity": 0.8
      });

      for (var k = 0; k < elem.children.length; k++) {
        var relElem = elem.children[k];
        var chord = relElem.getChordDim();

        if (chord) {
          var y = renderer.calcY(relElem.pitch);
          y += relElem.dim.font.size * relElem.getLane();
          printDebugBox(renderer, {
            x: chord.left,
            y: y,
            width: chord.right - chord.left,
            height: relElem.dim.font.size,
            fill: "none",
            stroke: "#4aa93d",
            "stroke-opacity": 0.8
          });
        }
      }
    }
  }
}

module.exports = drawStaffGroup;

/***/ }),

/***/ "./src/write/draw/staff-line.js":
/*!**************************************!*\
  !*** ./src/write/draw/staff-line.js ***!
  \**************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var sprintf = __webpack_require__(/*! ./sprintf */ "./src/write/draw/sprintf.js");

var roundNumber = __webpack_require__(/*! ./round-number */ "./src/write/draw/round-number.js");

function printStaffLine(renderer, x1, x2, pitch, klass) {
  var dy = 0.35;
  var fill = renderer.foregroundColor;
  var y = renderer.calcY(pitch);
  x1 = roundNumber(x1);
  x2 = roundNumber(x2);
  var y1 = roundNumber(y - dy);
  var y2 = roundNumber(y + dy);
  var pathString = sprintf("M %f %f L %f %f L %f %f L %f %f z", x1, y1, x2, y1, x2, y2, x1, y2);
  var options = {
    path: pathString,
    stroke: "none",
    fill: fill
  };
  if (klass) options['class'] = klass;
  var ret = renderer.paper.pathToBack(options);
  return ret;
}

module.exports = printStaffLine;

/***/ }),

/***/ "./src/write/draw/staff.js":
/*!*********************************!*\
  !*** ./src/write/draw/staff.js ***!
  \*********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var printStaffLine = __webpack_require__(/*! ./staff-line */ "./src/write/draw/staff-line.js");

function printStaff(renderer, startx, endx, numLines) {
  var klass = "abcjs-top-line";
  renderer.paper.openGroup({
    prepend: true,
    klass: renderer.controller.classes.generate("abcjs-staff")
  }); // If there is one line, it is the B line. Otherwise, the bottom line is the E line.

  if (numLines === 1) {
    printStaffLine(renderer, startx, endx, 6, klass);
  } else {
    for (var i = numLines - 1; i >= 0; i--) {
      printStaffLine(renderer, startx, endx, (i + 1) * 2, klass);
      klass = undefined;
    }
  }

  renderer.paper.closeGroup();
}

module.exports = printStaff;

/***/ }),

/***/ "./src/write/draw/tempo.js":
/*!*********************************!*\
  !*** ./src/write/draw/tempo.js ***!
  \*********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var drawRelativeElement = __webpack_require__(/*! ./relative */ "./src/write/draw/relative.js");

var renderText = __webpack_require__(/*! ./text */ "./src/write/draw/text.js");

function drawTempo(renderer, params) {
  var x = params.x;
  if (params.pitch === undefined) window.console.error("Tempo Element y-coordinate not set.");
  var tempoGroup;
  params.tempo.el_type = "tempo"; //	renderer.wrapInAbsElem(params.tempo, "abcjs-tempo", function () {

  renderer.paper.openGroup({
    klass: renderer.controller.classes.generate("tempo")
  }); // The text is aligned with extra room for descenders but numbers look like they are a little too high, so bump it a little.

  var descenderHeight = 2;
  var y = renderer.calcY(params.pitch) + 2;
  var text;
  var size;

  if (params.tempo.preString) {
    text = renderText(renderer, {
      x: x,
      y: y,
      text: params.tempo.preString,
      type: 'tempofont',
      klass: 'abcjs-tempo',
      anchor: "start",
      noClass: true,
      "dominant-baseline": "ideographic"
    });
    size = renderer.controller.getTextSize.calc(params.tempo.preString, 'tempofont', 'tempo', text);
    var preWidth = size.width;
    var charWidth = preWidth / params.tempo.preString.length; // Just get some average number to increase the spacing.

    x += preWidth + charWidth;
  }

  if (params.note) {
    params.note.setX(x);

    for (var i = 0; i < params.note.children.length; i++) {
      drawRelativeElement(renderer, params.note.children[i], x);
    }

    x += params.note.w + 5;
    var str = "= " + params.tempo.bpm;
    text = renderText(renderer, {
      x: x,
      y: y,
      text: str,
      type: 'tempofont',
      klass: 'abcjs-tempo',
      anchor: "start",
      noClass: true
    });
    size = renderer.controller.getTextSize.calc(str, 'tempofont', 'tempo', text);
    var postWidth = size.width;
    var charWidth2 = postWidth / str.length; // Just get some average number to increase the spacing.

    x += postWidth + charWidth2;
  }

  if (params.tempo.postString) {
    renderText(renderer, {
      x: x,
      y: y,
      text: params.tempo.postString,
      type: 'tempofont',
      klass: 'abcjs-tempo',
      anchor: "start",
      noClass: true
    });
  }

  tempoGroup = renderer.paper.closeGroup(); //	});

  return [tempoGroup];
}

module.exports = drawTempo;

/***/ }),

/***/ "./src/write/draw/text.js":
/*!********************************!*\
  !*** ./src/write/draw/text.js ***!
  \********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var roundNumber = __webpack_require__(/*! ./round-number */ "./src/write/draw/round-number.js");

function renderText(renderer, params) {
  var y = params.y;

  if (params.lane) {
    var laneMargin = params.dim.font.size * 0.25;
    y += (params.dim.font.size + laneMargin) * params.lane;
  }

  var hash;

  if (params.dim) {
    hash = params.dim;
    hash.attr["class"] = params.klass;
  } else hash = renderer.controller.getFontAndAttr.calc(params.type, params.klass);

  if (params.anchor) hash.attr["text-anchor"] = params.anchor;
  hash.attr.x = params.x;
  hash.attr.y = y;
  if (!params.centerVertically) hash.attr.y += hash.font.size;

  if (params.type === 'debugfont') {
    console.log("Debug msg: " + params.text);
    hash.attr.stroke = "#ff0000";
  }

  var text = params.text.replace(/\n\n/g, "\n \n");
  text = text.replace(/^\n/, "\xA0\n");

  if (hash.font.box) {
    renderer.paper.openGroup({
      klass: hash.attr['class'],
      fill: renderer.foregroundColor
    });

    if (hash.attr["text-anchor"] === "end") {
      hash.attr.x -= hash.font.padding;
    } else if (hash.attr["text-anchor"] === "start") {
      hash.attr.x += hash.font.padding;
    }

    hash.attr.y += hash.font.padding;
    delete hash.attr['class'];
  }

  if (params.noClass) delete hash.attr['class'];
  hash.attr.x = roundNumber(hash.attr.x);
  hash.attr.y = roundNumber(hash.attr.y);
  var elem = renderer.paper.text(text, hash.attr);

  if (hash.font.box) {
    var size = elem.getBBox();
    var delta = 0;

    if (hash.attr["text-anchor"] === "middle") {
      delta = size.width / 2 + hash.font.padding;
    } else if (hash.attr["text-anchor"] === "end") {
      delta = size.width + hash.font.padding * 2;
    }

    var deltaY = 0;

    if (params.centerVertically) {
      deltaY = size.height - hash.font.padding;
    }

    renderer.paper.rect({
      x: Math.round(params.x - delta),
      y: Math.round(y - deltaY),
      width: Math.round(size.width + hash.font.padding * 2),
      height: Math.round(size.height + hash.font.padding * 2)
    });
    elem = renderer.paper.closeGroup();
  }

  return elem;
}

module.exports = renderText;

/***/ }),

/***/ "./src/write/draw/tie.js":
/*!*******************************!*\
  !*** ./src/write/draw/tie.js ***!
  \*******************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var sprintf = __webpack_require__(/*! ./sprintf */ "./src/write/draw/sprintf.js");

var roundNumber = __webpack_require__(/*! ./round-number */ "./src/write/draw/round-number.js");

function drawTie(renderer, params, linestartx, lineendx, selectables) {
  layout(params, linestartx, lineendx);
  var klass = '';

  if (params.anchor1) {
    klass += 'abcjs-start-m' + params.anchor1.parent.counters.measure + '-n' + params.anchor1.parent.counters.note;
  } else klass += 'abcjs-start-edge';

  if (params.anchor2) {
    klass += ' abcjs-end-m' + params.anchor2.parent.counters.measure + '-n' + params.anchor2.parent.counters.note;
  } else klass += ' abcjs-end-edge';

  if (params.hint) klass = "abcjs-hint";
  var fudgeY = params.fixedY ? 1.5 : 0; // TODO-PER: This just compensates for drawArc, which contains too much knowledge of ties and slurs.

  var el = drawArc(renderer, params.startX, params.endX, params.startY + fudgeY, params.endY + fudgeY, params.above, klass, params.isTie, params.dotted);
  selectables.wrapSvgEl({
    el_type: "slur",
    startChar: -1,
    endChar: -1
  }, el);
  return [el];
} // TODO-PER: I think params part should have been done earlier in the layout pass.


var layout = function layout(params, lineStartX, lineEndX) {
  // We now have all of the input variables set, so we can figure out the start and ending x,y coordinates, and finalize the direction of the arc.
  // Ties and slurs are handled a little differently, so do calculations for them separately.
  if (!params.anchor1 || !params.anchor2) params.isTie = true; // if the slur goes off the end of the line, then draw it like a tie
  else if (params.anchor1.pitch === params.anchor2.pitch && params.internalNotes.length === 0) params.isTie = true;else params.isTie = false;

  if (params.isTie) {
    params.calcTieDirection();
    params.calcX(lineStartX, lineEndX);
    params.calcTieY();
  } else {
    params.calcSlurDirection();
    params.calcX(lineStartX, lineEndX);
    params.calcSlurY();
  }

  params.avoidCollisionAbove();
};

var drawArc = function drawArc(renderer, x1, x2, pitch1, pitch2, above, klass, isTie, dotted) {
  // If it is a tie vs. a slur, draw it shallower.
  var spacing = isTie ? 1.2 : 1.5;
  x1 = roundNumber(x1 + 6);
  x2 = roundNumber(x2 + 4);
  pitch1 = pitch1 + (above ? spacing : -spacing);
  pitch2 = pitch2 + (above ? spacing : -spacing);
  var y1 = roundNumber(renderer.calcY(pitch1));
  var y2 = roundNumber(renderer.calcY(pitch2)); //unit direction vector

  var dx = x2 - x1;
  var dy = y2 - y1;
  var norm = Math.sqrt(dx * dx + dy * dy);
  var ux = dx / norm;
  var uy = dy / norm;
  var flatten = norm / 3.5;
  var maxFlatten = isTie ? 10 : 25; // If it is a tie vs. a slur, draw it shallower.

  var curve = (above ? -1 : 1) * Math.min(maxFlatten, Math.max(4, flatten));
  var controlx1 = roundNumber(x1 + flatten * ux - curve * uy);
  var controly1 = roundNumber(y1 + flatten * uy + curve * ux);
  var controlx2 = roundNumber(x2 - flatten * ux - curve * uy);
  var controly2 = roundNumber(y2 - flatten * uy + curve * ux);
  var thickness = 2;
  if (klass) klass += ' slur';else klass = 'slur';
  klass += isTie ? ' tie' : ' legato';
  var ret;

  if (dotted) {
    klass += ' dotted';
    var pathString2 = sprintf("M %f %f C %f %f %f %f %f %f", x1, y1, controlx1, controly1, controlx2, controly2, x2, y2);
    ret = renderer.paper.path({
      path: pathString2,
      stroke: renderer.foregroundColor,
      fill: "none",
      'stroke-dasharray': "5 5",
      'class': renderer.controller.classes.generate(klass)
    });
  } else {
    var pathString = sprintf("M %f %f C %f %f %f %f %f %f C %f %f %f %f %f %f z", x1, y1, controlx1, controly1, controlx2, controly2, x2, y2, roundNumber(controlx2 - thickness * uy), roundNumber(controly2 + thickness * ux), roundNumber(controlx1 - thickness * uy), roundNumber(controly1 + thickness * ux), x1, y1);
    ret = renderer.paper.path({
      path: pathString,
      stroke: "none",
      fill: renderer.foregroundColor,
      'class': renderer.controller.classes.generate(klass)
    });
  }

  return ret;
};

module.exports = drawTie;

/***/ }),

/***/ "./src/write/draw/triplet.js":
/*!***********************************!*\
  !*** ./src/write/draw/triplet.js ***!
  \***********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var sprintf = __webpack_require__(/*! ./sprintf */ "./src/write/draw/sprintf.js");

var renderText = __webpack_require__(/*! ./text */ "./src/write/draw/text.js");

var printPath = __webpack_require__(/*! ./print-path */ "./src/write/draw/print-path.js");

var roundNumber = __webpack_require__(/*! ./round-number */ "./src/write/draw/round-number.js");

function drawTriplet(renderer, params, selectables) {
  renderer.paper.openGroup({
    klass: renderer.controller.classes.generate('triplet ' + params.durationClass)
  });

  if (!params.hasBeam) {
    drawBracket(renderer, params.anchor1.x, params.startNote, params.anchor2.x + params.anchor2.w, params.endNote);
  } // HACK: adjust the position of "3". It is too high in all cases so we fudge it by subtracting 1 here.


  renderText(renderer, {
    x: params.xTextPos,
    y: renderer.calcY(params.yTextPos - 1),
    text: "" + params.number,
    type: 'tripletfont',
    anchor: "middle",
    centerVertically: true,
    noClass: true
  });
  var g = renderer.paper.closeGroup();
  selectables.wrapSvgEl({
    el_type: "triplet",
    startChar: -1,
    endChar: -1
  }, g);
  return g;
}

function drawLine(l, t, r, b) {
  return sprintf("M %f %f L %f %f", roundNumber(l), roundNumber(t), roundNumber(r), roundNumber(b));
}

function drawBracket(renderer, x1, y1, x2, y2) {
  y1 = renderer.calcY(y1);
  y2 = renderer.calcY(y2);
  var bracketHeight = 5; // Draw vertical lines at the beginning and end

  var pathString = "";
  pathString += drawLine(x1, y1, x1, y1 + bracketHeight);
  pathString += drawLine(x2, y2, x2, y2 + bracketHeight); // figure out midpoints to draw the broken line.

  var midX = x1 + (x2 - x1) / 2; //var midY = y1 + (y2-y1)/2;

  var gapWidth = 8;
  var slope = (y2 - y1) / (x2 - x1);
  var leftEndX = midX - gapWidth;
  var leftEndY = y1 + (leftEndX - x1) * slope;
  pathString += drawLine(x1, y1, leftEndX, leftEndY);
  var rightStartX = midX + gapWidth;
  var rightStartY = y1 + (rightStartX - x1) * slope;
  pathString += drawLine(rightStartX, rightStartY, x2, y2);
  printPath(renderer, {
    path: pathString,
    stroke: renderer.foregroundColor
  });
}

module.exports = drawTriplet;

/***/ }),

/***/ "./src/write/draw/voice.js":
/*!*********************************!*\
  !*** ./src/write/draw/voice.js ***!
  \*********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var drawCrescendo = __webpack_require__(/*! ./crescendo */ "./src/write/draw/crescendo.js");

var drawDynamics = __webpack_require__(/*! ./dynamics */ "./src/write/draw/dynamics.js");

var drawTriplet = __webpack_require__(/*! ./triplet */ "./src/write/draw/triplet.js");

var drawEnding = __webpack_require__(/*! ./ending */ "./src/write/draw/ending.js");

var drawTie = __webpack_require__(/*! ./tie */ "./src/write/draw/tie.js");

var drawBeam = __webpack_require__(/*! ./beam */ "./src/write/draw/beam.js");

var renderText = __webpack_require__(/*! ./text */ "./src/write/draw/text.js");

var drawAbsolute = __webpack_require__(/*! ./absolute */ "./src/write/draw/absolute.js");

function drawVoice(renderer, params, bartop, selectables, staffPos) {
  var width = params.w - 1;
  renderer.staffbottom = params.staff.bottom;

  if (params.header) {
    // print voice name
    var textEl = renderText(renderer, {
      x: renderer.padding.left,
      y: renderer.calcY(params.headerPosition),
      text: params.header,
      type: 'voicefont',
      klass: 'staff-extra voice-name',
      anchor: 'start',
      centerVertically: true
    });
    selectables.wrapSvgEl({
      el_type: "voiceName",
      startChar: -1,
      endChar: -1,
      text: params.header
    }, textEl);
  }

  var i;
  var child;
  var foundNote = false;

  for (i = 0; i < params.children.length; i++) {
    child = params.children[i];
    if (child.type === 'note' || child.type === 'rest') foundNote = true;
    var justInitializedMeasureNumber = false;

    if (child.type !== 'staff-extra' && !renderer.controller.classes.isInMeasure()) {
      renderer.controller.classes.startMeasure();
      justInitializedMeasureNumber = true;
    }

    switch (child.type) {
      // case "tempo":
      // 	child.elemset = drawTempo(renderer, child);
      // 	break;
      default:
        drawAbsolute(renderer, child, params.barto || i === params.children.length - 1 ? bartop : 0, selectables, staffPos);
    }

    if (child.type === 'note' || isNonSpacerRest(child)) renderer.controller.classes.incrNote();

    if (child.type === 'bar' && !justInitializedMeasureNumber && foundNote) {
      renderer.controller.classes.incrMeasure();
    }
  }

  renderer.controller.classes.startMeasure();

  for (i = 0; i < params.beams.length; i++) {
    var beam = params.beams[i];

    if (beam === 'bar') {
      renderer.controller.classes.incrMeasure();
    } else drawBeam(renderer, beam, selectables); // beams must be drawn first for proper printing of triplets, slurs and ties.

  }

  renderer.controller.classes.startMeasure();

  for (i = 0; i < params.otherchildren.length; i++) {
    child = params.otherchildren[i];

    if (child === 'bar') {
      renderer.controller.classes.incrMeasure();
    } else {
      switch (child.type) {
        case "CrescendoElem":
          child.elemset = drawCrescendo(renderer, child, selectables);
          break;

        case "DynamicDecoration":
          child.elemset = drawDynamics(renderer, child, selectables);
          break;

        case "TripletElem":
          drawTriplet(renderer, child, selectables);
          break;

        case "EndingElem":
          child.elemset = drawEnding(renderer, child, params.startx + 10, width, selectables);
          break;

        case "TieElem":
          child.elemset = drawTie(renderer, child, params.startx + 10, width, selectables);
          break;

        default:
          console.log(child);
          drawAbsolute(renderer, child, params.startx + 10, width, selectables, staffPos);
      }
    }
  }
}

function isNonSpacerRest(elem) {
  if (elem.type !== 'rest') return false;
  if (elem.abcelem && elem.abcelem.rest && elem.abcelem.rest.type !== 'spacer') return true;
  return false;
}

module.exports = drawVoice;

/***/ }),

/***/ "./src/write/free-text.js":
/*!********************************!*\
  !*** ./src/write/free-text.js ***!
  \********************************/
/***/ (function(module) {

function FreeText(text, vskip, getFontAndAttr, paddingLeft, width, getTextSize) {
  this.rows = [];
  var size;
  if (vskip) this.rows.push({
    move: vskip
  });
  var hash = getFontAndAttr.calc('textfont', 'defined-text');

  if (text === "") {
    // we do want to print out blank lines if they have been specified.
    this.rows.push({
      move: hash.attr['font-size'] * 2
    }); // move the distance of the line, plus the distance of the margin, which is also one line.
  } else if (typeof text === 'string') {
    this.rows.push({
      move: hash.attr['font-size'] / 2
    }); // TODO-PER: move down some - the y location should be the top of the text, but we output text specifying the center line.

    this.rows.push({
      left: paddingLeft,
      text: text,
      font: 'textfont',
      klass: 'defined-text',
      anchor: "start",
      absElemType: "freeText"
    });
    size = getTextSize.calc(text, 'textfont', 'defined-text');
    this.rows.push({
      move: size.height
    });
  } else {
    var currentFont = 'textfont';
    var isCentered = false; // The structure is wrong here: it requires an array to do centering, but it shouldn't have.

    for (var i = 0; i < text.length; i++) {
      if (text[i].font) currentFont = text[i].font;else currentFont = 'textfont';
      if (text[i].center) isCentered = true;
      var alignment = isCentered ? 'middle' : 'start';
      var x = isCentered ? width / 2 : paddingLeft;
      this.rows.push({
        left: x,
        text: text[i].text,
        font: currentFont,
        klass: 'defined-text',
        anchor: alignment,
        absElemType: "freeText"
      });
      size = getTextSize.calc(text[i].text, currentFont, 'defined-text');
      this.rows.push({
        move: size.height
      });
    }
  }
}

module.exports = FreeText;

/***/ }),

/***/ "./src/write/get-font-and-attr.js":
/*!****************************************!*\
  !*** ./src/write/get-font-and-attr.js ***!
  \****************************************/
/***/ (function(module) {

var GetFontAndAttr = function GetFontAndAttr(formatting, classes) {
  this.formatting = formatting;
  this.classes = classes;
};

GetFontAndAttr.prototype.updateFonts = function (fontOverrides) {
  if (fontOverrides.gchordfont) this.formatting.gchordfont = fontOverrides.gchordfont;
  if (fontOverrides.tripletfont) this.formatting.tripletfont = fontOverrides.tripletfont;
  if (fontOverrides.annotationfont) this.formatting.annotationfont = fontOverrides.annotationfont;
  if (fontOverrides.vocalfont) this.formatting.vocalfont = fontOverrides.vocalfont;
};

GetFontAndAttr.prototype.calc = function (type, klass) {
  var font;

  if (typeof type === 'string') {
    font = this.formatting[type]; // Raphael deliberately changes the font units to pixels for some reason, so we need to change points to pixels here.

    if (font) font = {
      face: font.face,
      size: Math.round(font.size * 4 / 3),
      decoration: font.decoration,
      style: font.style,
      weight: font.weight,
      box: font.box
    };else font = {
      face: "Arial",
      size: Math.round(12 * 4 / 3),
      decoration: "underline",
      style: "normal",
      weight: "normal"
    };
  } else font = {
    face: type.face,
    size: Math.round(type.size * 4 / 3),
    decoration: type.decoration,
    style: type.style,
    weight: type.weight,
    box: type.box
  };

  var paddingPercent = this.formatting.fontboxpadding ? this.formatting.fontboxpadding : 0.1;
  font.padding = font.size * paddingPercent;
  var attr = {
    "font-size": font.size,
    'font-style': font.style,
    "font-family": font.face,
    'font-weight': font.weight,
    'text-decoration': font.decoration,
    'class': this.classes.generate(klass)
  };
  return {
    font: font,
    attr: attr
  };
};

module.exports = GetFontAndAttr;

/***/ }),

/***/ "./src/write/get-text-size.js":
/*!************************************!*\
  !*** ./src/write/get-text-size.js ***!
  \************************************/
/***/ (function(module) {

var GetTextSize = function GetTextSize(getFontAndAttr, svg) {
  this.getFontAndAttr = getFontAndAttr;
  this.svg = svg;
};

GetTextSize.prototype.updateFonts = function (fontOverrides) {
  this.getFontAndAttr.updateFonts(fontOverrides);
};

GetTextSize.prototype.attr = function (type, klass) {
  return this.getFontAndAttr.calc(type, klass);
};

GetTextSize.prototype.calc = function (text, type, klass, el) {
  var hash; // This can be passed in either a string or a font. If it is a string it names one of the standard fonts.

  if (typeof type === 'string') hash = this.attr(type, klass);else {
    hash = {
      font: {
        face: type.face,
        size: type.size,
        decoration: type.decoration,
        style: type.style,
        weight: type.weight
      },
      attr: {
        "font-size": type.size,
        "font-style": type.style,
        "font-family": type.face,
        "font-weight": type.weight,
        "text-decoration": type.decoration,
        "class": this.getFontAndAttr.classes.generate(klass)
      }
    };
  }
  var size = this.svg.getTextSize(text, hash.attr, el);

  if (hash.font.box) {
    // Add padding and an equal margin to each side.
    return {
      height: size.height + hash.font.padding * 4,
      width: size.width + hash.font.padding * 4
    };
  }

  return size;
};

GetTextSize.prototype.baselineToCenter = function (text, type, klass, index, total) {
  // This is for the case where SVG wants to use the baseline of the first line as the Y coordinate.
  // If there are multiple lines of text or there is an array of text then that will not be centered so this adjusts it.
  var height = this.calc(text, type, klass).height;
  var fontHeight = this.attr(type, klass).font.size;
  return height * 0.5 + (total - index - 2) * fontHeight;
};

module.exports = GetTextSize;

/***/ }),

/***/ "./src/write/highlight.js":
/*!********************************!*\
  !*** ./src/write/highlight.js ***!
  \********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var setClass = __webpack_require__(/*! ./set-class */ "./src/write/set-class.js");

var highlight = function highlight(klass, color) {
  if (klass === undefined) klass = "abcjs-note_selected";
  if (color === undefined) color = "#ff0000";
  setClass(this.elemset, klass, "", color);
};

module.exports = highlight;

/***/ }),

/***/ "./src/write/layout/VoiceElements.js":
/*!*******************************************!*\
  !*** ./src/write/layout/VoiceElements.js ***!
  \*******************************************/
/***/ (function(module) {

var VoiceElement = function VoiceElements() {};

VoiceElement.beginLayout = function (startx, voice) {
  voice.i = 0;
  voice.durationindex = 0; //this.ii=this.children.length;

  voice.startx = startx;
  voice.minx = startx; // furthest left to where negatively positioned elements are allowed to go

  voice.nextx = startx; // x position where the next element of this voice should be placed assuming no other voices and no fixed width constraints

  voice.spacingduration = 0; // duration left to be laid out in current iteration (omitting additional spacing due to other aspects, such as bars, dots, sharps and flats)
};

VoiceElement.layoutEnded = function (voice) {
  return voice.i >= voice.children.length;
};

VoiceElement.getNextX = function (voice) {
  return Math.max(voice.minx, voice.nextx);
}; // number of spacing units expected for next positioning


VoiceElement.getSpacingUnits = function (voice) {
  return Math.sqrt(voice.spacingduration * 8);
}; // Try to layout the element at index this.i
// x - position to try to layout the element at
// spacing - base spacing
// can't call this function more than once per iteration


VoiceElement.layoutOneItem = function (x, spacing, voice, minPadding) {
  var child = voice.children[voice.i];
  if (!child) return 0;
  var er = x - voice.minx; // available extrawidth to the left

  var pad = voice.durationindex + child.duration > 0 ? minPadding : 0; // only add padding to the items that aren't fixed to the left edge.

  var extraWidth = getExtraWidth(child, pad);

  if (er < extraWidth) {
    // shift right by needed amount
    // There's an exception if a bar element is after a Part element, there is no shift.
    if (voice.i === 0 || child.type !== 'bar' || voice.children[voice.i - 1].type !== 'part' && voice.children[voice.i - 1].type !== 'tempo') x += extraWidth - er;
  }

  child.setX(x);
  voice.spacingduration = child.duration; //update minx

  voice.minx = x + getMinWidth(child); // add necessary layout space

  if (voice.i !== voice.children.length - 1) voice.minx += child.minspacing; // add minimumspacing except on last elem

  this.updateNextX(x, spacing, voice); // contribute to staff y position
  //this.staff.top = Math.max(child.top,this.staff.top);
  //this.staff.bottom = Math.min(child.bottom,this.staff.bottom);

  return x; // where we end up having placed the child
};

VoiceElement.shiftRight = function (dx, voice) {
  var child = voice.children[voice.i];
  if (!child) return;
  child.setX(child.x + dx);
  voice.minx += dx;
  voice.nextx += dx;
}; // call when spacingduration has been updated


VoiceElement.updateNextX = function (x, spacing, voice) {
  voice.nextx = x + spacing * Math.sqrt(voice.spacingduration * 8);
};

VoiceElement.updateIndices = function (voice) {
  if (!this.layoutEnded(voice)) {
    voice.durationindex += voice.children[voice.i].duration;
    if (voice.children[voice.i].type === 'bar') voice.durationindex = Math.round(voice.durationindex * 64) / 64; // everytime we meet a barline, do rounding to nearest 64th

    voice.i++;
  }
};

function getExtraWidth(child, minPadding) {
  // space needed to the left of the note
  var padding = 0;
  if (child.type === 'note' || child.type === 'bar') padding = minPadding;
  return -child.extraw + padding;
}

function getMinWidth(child) {
  // absolute space taken to the right of the note
  return child.w;
}

module.exports = VoiceElement;

/***/ }),

/***/ "./src/write/layout/beam.js":
/*!**********************************!*\
  !*** ./src/write/layout/beam.js ***!
  \**********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var RelativeElement = __webpack_require__(/*! ../abc_relative_element */ "./src/write/abc_relative_element.js");

var spacing = __webpack_require__(/*! ../abc_spacing */ "./src/write/abc_spacing.js");

var getBarYAt = __webpack_require__(/*! ./getBarYAt */ "./src/write/layout/getBarYAt.js");

var layoutBeam = function layoutBeam(beam) {
  if (beam.elems.length === 0 || beam.allrests) return;
  var dy = calcDy(beam.stemsUp, beam.isgrace); // This is the width of the beam line.
  // create the main beam

  var firstElement = beam.elems[0];
  var lastElement = beam.elems[beam.elems.length - 1];
  var minStemHeight = 0; // The following is to leave space for "!///!" marks.

  var referencePitch = beam.stemsUp ? firstElement.abcelem.maxpitch : firstElement.abcelem.minpitch;
  minStemHeight = minStem(firstElement, beam.stemsUp, referencePitch, minStemHeight);
  minStemHeight = minStem(lastElement, beam.stemsUp, referencePitch, minStemHeight);
  minStemHeight = Math.max(beam.stemHeight, minStemHeight); // TODO-PER: The 3 is the width of a 16th beam. The actual height of the beam should be used instead.

  var yPos = calcYPos(beam.average, beam.elems.length, minStemHeight, beam.stemsUp, firstElement.abcelem.averagepitch, lastElement.abcelem.averagepitch, beam.isflat, beam.min, beam.max, beam.isgrace);
  var xPos = calcXPos(beam.stemsUp, firstElement, lastElement);
  beam.addBeam({
    startX: xPos[0],
    endX: xPos[1],
    startY: yPos[0],
    endY: yPos[1],
    dy: dy
  }); // create the rest of the beams (in the case of 1/16th notes, etc.

  var beams = createAdditionalBeams(beam.elems, beam.stemsUp, beam.beams[0], beam.isgrace, dy);

  for (var i = 0; i < beams.length; i++) {
    beam.addBeam(beams[i]);
  } // Now that the main beam is defined, we know how tall the stems should be, so create them and attach them to the original notes.


  createStems(beam.elems, beam.stemsUp, beam.beams[0], dy, beam.mainNote);
};

var getDurlog = function getDurlog(duration) {
  // TODO-PER: This is a hack to prevent a Chrome lockup. Duration should have been defined already,
  // but there's definitely a case where it isn't. [Probably something to do with triplets.]
  if (duration === undefined) {
    return 0;
  } //        console.log("getDurlog: " + duration);


  return Math.floor(Math.log(duration) / Math.log(2));
}; //
// private functions
//


function minStem(element, stemsUp, referencePitch, minStemHeight) {
  if (!element.children) return minStemHeight;

  for (var i = 0; i < element.children.length; i++) {
    var elem = element.children[i];
    if (stemsUp && elem.top !== undefined && elem.c === "flags.ugrace") minStemHeight = Math.max(minStemHeight, elem.top - referencePitch);else if (!stemsUp && elem.bottom !== undefined && elem.c === "flags.ugrace") minStemHeight = Math.max(minStemHeight, referencePitch - elem.bottom + 7); // The extra 7 is because we are measuring the slash from the top.
  }

  return minStemHeight;
}

function calcSlant(leftAveragePitch, rightAveragePitch, numStems, isFlat) {
  if (isFlat) return 0;
  var slant = leftAveragePitch - rightAveragePitch;
  var maxSlant = numStems / 2;
  if (slant > maxSlant) slant = maxSlant;
  if (slant < -maxSlant) slant = -maxSlant;
  return slant;
}

function calcDy(asc, isGrace) {
  var dy = asc ? spacing.STEP : -spacing.STEP;
  if (isGrace) dy = dy * 0.4;
  return dy;
}

function calcXPos(asc, firstElement, lastElement) {
  var starthead = firstElement.heads[asc ? 0 : firstElement.heads.length - 1];
  var endhead = lastElement.heads[asc ? 0 : lastElement.heads.length - 1];
  var startX = starthead.x;
  if (asc) startX += starthead.w - 0.6;
  var endX = endhead.x;
  endX += asc ? endhead.w : 0.6;
  return [startX, endX];
}

function calcYPos(average, numElements, stemHeight, asc, firstAveragePitch, lastAveragePitch, isFlat, minPitch, maxPitch, isGrace) {
  var barpos = stemHeight - 2; // (isGrace)? 5:7;

  var barminpos = stemHeight - 2;
  var pos = Math.round(asc ? Math.max(average + barpos, maxPitch + barminpos) : Math.min(average - barpos, minPitch - barminpos));
  var slant = calcSlant(firstAveragePitch, lastAveragePitch, numElements, isFlat);
  var startY = pos + Math.floor(slant / 2);
  var endY = pos + Math.floor(-slant / 2); // If the notes are too high or too low, make the beam go down to the middle

  if (!isGrace) {
    if (asc && pos < 6) {
      startY = 6;
      endY = 6;
    } else if (!asc && pos > 6) {
      startY = 6;
      endY = 6;
    }
  }

  return [startY, endY];
}

function createStems(elems, asc, beam, dy, mainNote) {
  for (var i = 0; i < elems.length; i++) {
    var elem = elems[i];
    if (elem.abcelem.rest) continue; // TODO-PER: This is odd. If it is a regular beam then elems is an array of AbsoluteElements, if it is a grace beam then it is an array of objects , so we directly attach the element to the parent. We tell it if is a grace note because they are passed in as a generic object instead of an AbsoluteElement.

    var isGrace = elem.addExtra ? false : true;
    var parent = isGrace ? mainNote : elem;
    var furthestHead = elem.heads[asc ? 0 : elem.heads.length - 1];
    var ovalDelta = 1 / 5; //(isGrace)?1/3:1/5;

    var pitch = furthestHead.pitch + (asc ? ovalDelta : -ovalDelta);
    var dx = asc ? furthestHead.w : 0; // down-pointing stems start on the left side of the note, up-pointing stems start on the right side, so we offset by the note width.

    var x = furthestHead.x + dx; // this is now the actual x location in pixels.

    var bary = getBarYAt(beam.startX, beam.startY, beam.endX, beam.endY, x) - 0.5;
    var lineWidth = asc ? -1 : 1;
    if (!asc) bary -= dy / 2 / spacing.STEP; // TODO-PER: This is just a fudge factor so the down-pointing stems don't overlap.

    if (isGrace) dx += elem.heads[0].dx; // TODO-PER-HACK: One type of note head has a different placement of the stem. This should be more generically calculated:

    if (furthestHead.c === 'noteheads.slash.quarter') {
      if (asc) pitch += 1;else pitch -= 1;
    }

    var stem = new RelativeElement(null, dx, 0, pitch, {
      "type": "stem",
      "pitch2": bary,
      linewidth: lineWidth
    });
    stem.setX(parent.x); // This is after the x coordinates were set, so we have to set it directly.

    parent.addRight(stem);
  }
}

function createAdditionalBeams(elems, asc, beam, isGrace, dy) {
  var beams = [];
  var auxBeams = []; // auxbeam will be {x, y, durlog, single} auxbeam[0] should match with durlog=-4 (16th) (j=-4-durlog)

  for (var i = 0; i < elems.length; i++) {
    var elem = elems[i];
    if (elem.abcelem.rest) continue;
    var furthestHead = elem.heads[asc ? 0 : elem.heads.length - 1];
    var x = furthestHead.x + (asc ? furthestHead.w : 0);
    var bary = getBarYAt(beam.startX, beam.startY, beam.endX, beam.endY, x);
    var sy = asc ? -1.5 : 1.5;
    if (isGrace) sy = sy * 2 / 3; // This makes the second beam on grace notes closer to the first one.

    var duration = elem.abcelem.duration; // get the duration via abcelem because of triplets

    if (duration === 0) duration = 0.25; // if this is stemless, then we use quarter note as the duration.

    for (var durlog = getDurlog(duration); durlog < -3; durlog++) {
      var index = -4 - durlog;

      if (auxBeams[index]) {
        auxBeams[index].single = false;
      } else {
        auxBeams[index] = {
          x: x + (asc ? -0.6 : 0),
          y: bary + sy * (index + 1),
          durlog: durlog,
          single: true
        };
      }

      if (i > 0 && elem.abcelem.beambr && elem.abcelem.beambr <= index + 1) {
        if (!auxBeams[index].split) auxBeams[index].split = [auxBeams[index].x];
        var xPos = calcXPos(asc, elems[i - 1], elem);

        if (auxBeams[index].split[auxBeams[index].split.length - 1] >= xPos[0]) {
          // the reduction in beams leaves a note unattached so create a small flag for it.
          xPos[0] += elem.w;
        }

        auxBeams[index].split.push(xPos[0]);
        auxBeams[index].split.push(xPos[1]);
      }
    }

    for (var j = auxBeams.length - 1; j >= 0; j--) {
      if (i === elems.length - 1 || getDurlog(elems[i + 1].abcelem.duration) > -j - 4) {
        var auxBeamEndX = x;
        var auxBeamEndY = bary + sy * (j + 1);

        if (auxBeams[j].single) {
          auxBeamEndX = i === 0 ? x + 5 : x - 5;
          auxBeamEndY = getBarYAt(beam.startX, beam.startY, beam.endX, beam.endY, auxBeamEndX) + sy * (j + 1);
        }

        var b = {
          startX: auxBeams[j].x,
          endX: auxBeamEndX,
          startY: auxBeams[j].y,
          endY: auxBeamEndY,
          dy: dy
        };

        if (auxBeams[j].split !== undefined) {
          var split = auxBeams[j].split;

          if (b.endX <= split[split.length - 1]) {
            // the reduction in beams leaves the last note by itself, so create a little flag for it
            split[split.length - 1] -= elem.w;
          }

          split.push(b.endX);
          b.split = auxBeams[j].split;
        }

        beams.push(b);
        auxBeams = auxBeams.slice(0, j);
      }
    }
  }

  return beams;
}

module.exports = layoutBeam;

/***/ }),

/***/ "./src/write/layout/get-left-edge-of-staff.js":
/*!****************************************************!*\
  !*** ./src/write/layout/get-left-edge-of-staff.js ***!
  \****************************************************/
/***/ (function(module) {

function getLeftEdgeOfStaff(renderer, getTextSize, voices, brace, bracket) {
  var x = renderer.padding.left; // find out how much space will be taken up by voice headers

  var voiceheaderw = 0;
  var i;
  var size;

  for (i = 0; i < voices.length; i++) {
    if (voices[i].header) {
      size = getTextSize.calc(voices[i].header, 'voicefont', '');
      voiceheaderw = Math.max(voiceheaderw, size.width);
    }
  }

  voiceheaderw = addBraceSize(voiceheaderw, brace, getTextSize);
  voiceheaderw = addBraceSize(voiceheaderw, bracket, getTextSize);

  if (voiceheaderw) {
    // Give enough spacing to the right - we use the width of an A for the amount of spacing.
    var sizeW = getTextSize.calc("A", 'voicefont', '');
    voiceheaderw += sizeW.width;
  }

  x += voiceheaderw;
  var ofs = 0;
  ofs = setBraceLocation(brace, x, ofs);
  ofs = setBraceLocation(bracket, x, ofs);
  return x + ofs;
}

function addBraceSize(voiceheaderw, brace, getTextSize) {
  if (brace) {
    for (var i = 0; i < brace.length; i++) {
      if (brace[i].header) {
        var size = getTextSize.calc(brace[i].header, 'voicefont', '');
        voiceheaderw = Math.max(voiceheaderw, size.width);
      }
    }
  }

  return voiceheaderw;
}

function setBraceLocation(brace, x, ofs) {
  if (brace) {
    for (var i = 0; i < brace.length; i++) {
      setLocation(x, brace[i]);
      ofs = Math.max(ofs, brace[i].getWidth());
    }
  }

  return ofs;
}

function setLocation(x, element) {
  element.x = x;
}

module.exports = getLeftEdgeOfStaff;

/***/ }),

/***/ "./src/write/layout/getBarYAt.js":
/*!***************************************!*\
  !*** ./src/write/layout/getBarYAt.js ***!
  \***************************************/
/***/ (function(module) {

function getBarYAt(startx, starty, endx, endy, x) {
  return starty + (endy - starty) / (endx - startx) * (x - startx);
}

module.exports = getBarYAt;

/***/ }),

/***/ "./src/write/layout/layout.js":
/*!************************************!*\
  !*** ./src/write/layout/layout.js ***!
  \************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var layoutVoice = __webpack_require__(/*! ./voice */ "./src/write/layout/voice.js");

var setUpperAndLowerElements = __webpack_require__(/*! ./setUpperAndLowerElements */ "./src/write/layout/setUpperAndLowerElements.js");

var layoutStaffGroup = __webpack_require__(/*! ./staffGroup */ "./src/write/layout/staffGroup.js");

var getLeftEdgeOfStaff = __webpack_require__(/*! ./get-left-edge-of-staff */ "./src/write/layout/get-left-edge-of-staff.js");

var layout = function layout(renderer, abctune, width, space) {
  var i;
  var abcLine; // Adjust the x-coordinates to their absolute positions

  var maxWidth = width;

  for (i = 0; i < abctune.lines.length; i++) {
    abcLine = abctune.lines[i];

    if (abcLine.staff) {
      setXSpacing(renderer, width, space, abcLine.staffGroup, abctune.formatting, i === abctune.lines.length - 1, false);
      if (abcLine.staffGroup.w > maxWidth) maxWidth = abcLine.staffGroup.w;
    }
  } // Layout the beams and add the stems to the beamed notes.


  for (i = 0; i < abctune.lines.length; i++) {
    abcLine = abctune.lines[i];

    if (abcLine.staffGroup && abcLine.staffGroup.voices) {
      for (var j = 0; j < abcLine.staffGroup.voices.length; j++) {
        layoutVoice(abcLine.staffGroup.voices[j]);
      }

      setUpperAndLowerElements(renderer, abcLine.staffGroup);
    }
  } // Set the staff spacing
  // TODO-PER: we should have been able to do this by the time we called setUpperAndLowerElements, but for some reason the "bottom" element seems to be set as a side effect of setting the X spacing.


  for (i = 0; i < abctune.lines.length; i++) {
    abcLine = abctune.lines[i];

    if (abcLine.staffGroup) {
      abcLine.staffGroup.setHeight();
    }
  }

  return maxWidth;
}; // Do the x-axis positioning for a single line (a group of related staffs)


var setXSpacing = function setXSpacing(renderer, width, space, staffGroup, formatting, isLastLine, debug) {
  var leftEdge = getLeftEdgeOfStaff(renderer, staffGroup.getTextSize, staffGroup.voices, staffGroup.brace, staffGroup.bracket);
  var newspace = space;

  for (var it = 0; it < 8; it++) {
    // TODO-PER: shouldn't need multiple passes, but each pass gets it closer to the right spacing. (Only affects long lines: normal lines break out of this loop quickly.)
    var ret = layoutStaffGroup(newspace, renderer, debug, staffGroup, leftEdge);
    newspace = calcHorizontalSpacing(isLastLine, formatting.stretchlast, width + renderer.padding.left, staffGroup.w, newspace, ret.spacingUnits, ret.minSpace, renderer.padding.left + renderer.padding.right);
    if (debug) console.log("setXSpace", it, staffGroup.w, newspace, staffGroup.minspace);
    if (newspace === null) break;
  }

  centerWholeRests(staffGroup.voices);
};

function calcHorizontalSpacing(isLastLine, stretchLast, targetWidth, lineWidth, spacing, spacingUnits, minSpace, padding) {
  if (isLastLine) {
    if (stretchLast === undefined) {
      if (lineWidth / targetWidth < 0.66) return null; // keep this for backward compatibility. The break isn't quite the same for some reason.
    } else {
      // "Stretch the last music line of a tune when it lacks less than the float fraction of the page width."
      var lack = 1 - (lineWidth + padding) / targetWidth;
      var stretch = lack < stretchLast;
      if (!stretch) return null; // don't stretch last line too much
    }
  }

  if (Math.abs(targetWidth - lineWidth) < 2) return null; // if we are already near the target width, we're done.

  var relSpace = spacingUnits * spacing;
  var constSpace = lineWidth - relSpace;

  if (spacingUnits > 0) {
    spacing = (targetWidth - constSpace) / spacingUnits;

    if (spacing * minSpace > 50) {
      spacing = 50 / minSpace;
    }

    return spacing;
  }

  return null;
}

function centerWholeRests(voices) {
  // whole rests are a special case: if they are by themselves in a measure, then they should be centered.
  // (If they are not by themselves, that is probably a user error, but we'll just center it between the two items to either side of it.)
  for (var i = 0; i < voices.length; i++) {
    var voice = voices[i]; // Look through all of the elements except for the first and last. If the whole note appears there then there isn't anything to center it between anyway.

    for (var j = 1; j < voice.children.length - 1; j++) {
      var absElem = voice.children[j];

      if (absElem.abcelem.rest && (absElem.abcelem.rest.type === 'whole' || absElem.abcelem.rest.type === 'multimeasure')) {
        var before = voice.children[j - 1];
        var after = voice.children[j + 1];
        absElem.center(before, after);
      }
    }
  }
}

module.exports = layout;

/***/ }),

/***/ "./src/write/layout/setUpperAndLowerElements.js":
/*!******************************************************!*\
  !*** ./src/write/layout/setUpperAndLowerElements.js ***!
  \******************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var spacing = __webpack_require__(/*! ../abc_spacing */ "./src/write/abc_spacing.js");

var setUpperAndLowerElements = function setUpperAndLowerElements(renderer, staffGroup) {
  // Each staff already has the top and bottom set, now we see if there are elements that are always on top and bottom, and resolve their pitch.
  // Also, get the overall height of all the staves in this group.
  var lastStaffBottom;

  for (var i = 0; i < staffGroup.staffs.length; i++) {
    var staff = staffGroup.staffs[i]; // the vertical order of elements that are above is: tempo, part, volume/dynamic, ending/chord, lyric
    // the vertical order of elements that are below is: lyric, chord, volume/dynamic

    var positionY = {
      tempoHeightAbove: 0,
      partHeightAbove: 0,
      volumeHeightAbove: 0,
      dynamicHeightAbove: 0,
      endingHeightAbove: 0,
      chordHeightAbove: 0,
      lyricHeightAbove: 0,
      lyricHeightBelow: 0,
      chordHeightBelow: 0,
      volumeHeightBelow: 0,
      dynamicHeightBelow: 0
    };

    if (renderer.showDebug && renderer.showDebug.indexOf("box") >= 0) {
      staff.originalTop = staff.top; // This is just being stored for debugging purposes.

      staff.originalBottom = staff.bottom; // This is just being stored for debugging purposes.
    }

    incTop(staff, positionY, 'lyricHeightAbove');
    incTop(staff, positionY, 'chordHeightAbove', staff.specialY.chordLines.above);

    if (staff.specialY.endingHeightAbove) {
      if (staff.specialY.chordHeightAbove) staff.top += 2;else staff.top += staff.specialY.endingHeightAbove + margin;
      positionY.endingHeightAbove = staff.top;
    }

    if (staff.specialY.dynamicHeightAbove && staff.specialY.volumeHeightAbove) {
      staff.top += Math.max(staff.specialY.dynamicHeightAbove, staff.specialY.volumeHeightAbove) + margin;
      positionY.dynamicHeightAbove = staff.top;
      positionY.volumeHeightAbove = staff.top;
    } else {
      incTop(staff, positionY, 'dynamicHeightAbove');
      incTop(staff, positionY, 'volumeHeightAbove');
    }

    incTop(staff, positionY, 'partHeightAbove');
    incTop(staff, positionY, 'tempoHeightAbove');

    if (staff.specialY.lyricHeightBelow) {
      staff.specialY.lyricHeightBelow += renderer.spacing.vocal / spacing.STEP;
      positionY.lyricHeightBelow = staff.bottom;
      staff.bottom -= staff.specialY.lyricHeightBelow + margin;
    }

    if (staff.specialY.chordHeightBelow) {
      positionY.chordHeightBelow = staff.bottom;
      var hgt = staff.specialY.chordHeightBelow;
      if (staff.specialY.chordLines.below) hgt *= staff.specialY.chordLines.below;
      staff.bottom -= hgt + margin;
    }

    if (staff.specialY.volumeHeightBelow && staff.specialY.dynamicHeightBelow) {
      positionY.volumeHeightBelow = staff.bottom;
      positionY.dynamicHeightBelow = staff.bottom;
      staff.bottom -= Math.max(staff.specialY.volumeHeightBelow, staff.specialY.dynamicHeightBelow) + margin;
    } else if (staff.specialY.volumeHeightBelow) {
      positionY.volumeHeightBelow = staff.bottom;
      staff.bottom -= staff.specialY.volumeHeightBelow + margin;
    } else if (staff.specialY.dynamicHeightBelow) {
      positionY.dynamicHeightBelow = staff.bottom;
      staff.bottom -= staff.specialY.dynamicHeightBelow + margin;
    }

    if (renderer.showDebug && renderer.showDebug.indexOf("box") >= 0) staff.positionY = positionY; // This is just being stored for debugging purposes.

    for (var j = 0; j < staff.voices.length; j++) {
      var voice = staffGroup.voices[staff.voices[j]];
      setUpperAndLowerVoiceElements(positionY, voice, renderer.spacing);
    } // We might need a little space in between staves if the staves haven't been pushed far enough apart by notes or extra vertical stuff.
    // Only try to put in extra space if this isn't the top staff.


    if (lastStaffBottom !== undefined) {
      var thisStaffTop = staff.top - 10;
      var forcedSpacingBetween = lastStaffBottom + thisStaffTop;
      var minSpacingInPitches = renderer.spacing.systemStaffSeparation / spacing.STEP;
      var addedSpace = minSpacingInPitches - forcedSpacingBetween;
      if (addedSpace > 0) staff.top += addedSpace;
    }

    lastStaffBottom = 2 - staff.bottom; // the staff starts at position 2 and the bottom variable is negative. Therefore to find out how large the bottom is, we reverse the sign of the bottom, and add the 2 in.
    // Now we need a little margin on the top, so we'll just throw that in.
    //staff.top += 4;
    //console.log("Staff Y: ",i,heightInPitches,staff.top,staff.bottom);
  } //console.log("Staff Height: ",heightInPitches,this.height);

};

var margin = 1;

function incTop(staff, positionY, item, count) {
  if (staff.specialY[item]) {
    var height = staff.specialY[item];
    if (count) height *= count;
    staff.top += height + margin;
    positionY[item] = staff.top;
  }
}

function setUpperAndLowerVoiceElements(positionY, voice, spacing) {
  var i;
  var abselem;

  for (i = 0; i < voice.children.length; i++) {
    abselem = voice.children[i];
    setUpperAndLowerAbsoluteElements(positionY, abselem, spacing);
  }

  for (i = 0; i < voice.otherchildren.length; i++) {
    abselem = voice.otherchildren[i];

    switch (abselem.type) {
      case 'CrescendoElem':
        setUpperAndLowerCrescendoElements(positionY, abselem);
        break;

      case 'DynamicDecoration':
        setUpperAndLowerDynamicElements(positionY, abselem);
        break;

      case 'EndingElem':
        setUpperAndLowerEndingElements(positionY, abselem);
        break;
    }
  }
} // For each of the relative elements that can't be placed in advance (because their vertical placement depends on everything
// else on the line), this iterates through them and sets their pitch. By the time this is called, specialYResolved contains a
// hash with the vertical placement (in pitch units) for each type.
// TODO-PER: I think this needs to be separated by "above" and "below". How do we know that for dynamics at the point where they are being defined, though? We need a pass through all the relative elements to set "above" and "below".


function setUpperAndLowerAbsoluteElements(specialYResolved, element, spacing) {
  // specialYResolved contains the actual pitch for each of the classes of elements.
  for (var i = 0; i < element.children.length; i++) {
    var child = element.children[i];

    for (var key in element.specialY) {
      // for each class of element that needs to be placed vertically
      if (element.specialY.hasOwnProperty(key)) {
        if (child[key]) {
          // If this relative element has defined a height for this class of element
          child.pitch = specialYResolved[key];

          if (child.top === undefined) {
            // TODO-PER: HACK! Not sure this is the right place to do this.
            if (child.type === 'TempoElement') {
              setUpperAndLowerTempoElement(specialYResolved, child);
            } else {
              setUpperAndLowerRelativeElements(specialYResolved, child, spacing);
            }

            element.pushTop(child.top);
            element.pushBottom(child.bottom);
          }
        }
      }
    }
  }
}

function setUpperAndLowerCrescendoElements(positionY, element) {
  if (element.dynamicHeightAbove) element.pitch = positionY.dynamicHeightAbove;else element.pitch = positionY.dynamicHeightBelow;
}

function setUpperAndLowerDynamicElements(positionY, element) {
  if (element.volumeHeightAbove) element.pitch = positionY.volumeHeightAbove;else element.pitch = positionY.volumeHeightBelow;
}

function setUpperAndLowerEndingElements(positionY, element) {
  element.pitch = positionY.endingHeightAbove - 2;
}

function setUpperAndLowerTempoElement(positionY, element) {
  element.pitch = positionY.tempoHeightAbove;
  element.top = positionY.tempoHeightAbove;
  element.bottom = positionY.tempoHeightAbove;

  if (element.note) {
    var tempoPitch = element.pitch - element.totalHeightInPitches + 1; // The pitch we receive is the top of the allotted area: change that to practically the bottom.

    element.note.top = tempoPitch;
    element.note.bottom = tempoPitch;

    for (var i = 0; i < element.note.children.length; i++) {
      var child = element.note.children[i];
      child.top += tempoPitch;
      child.bottom += tempoPitch;
      child.pitch += tempoPitch;
      if (child.pitch2 !== undefined) child.pitch2 += tempoPitch;
    }
  }
}

function setUpperAndLowerRelativeElements(positionY, element, renderSpacing) {
  switch (element.type) {
    case "part":
      element.top = positionY.partHeightAbove + element.height;
      element.bottom = positionY.partHeightAbove;
      break;

    case "text":
    case "chord":
      if (element.chordHeightAbove) {
        element.top = positionY.chordHeightAbove;
        element.bottom = positionY.chordHeightAbove;
      } else {
        element.top = positionY.chordHeightBelow;
        element.bottom = positionY.chordHeightBelow;
      }

      break;

    case "lyric":
      if (element.lyricHeightAbove) {
        element.top = positionY.lyricHeightAbove;
        element.bottom = positionY.lyricHeightAbove;
      } else {
        element.top = positionY.lyricHeightBelow + renderSpacing.vocal / spacing.STEP;
        element.bottom = positionY.lyricHeightBelow + renderSpacing.vocal / spacing.STEP;
        element.pitch -= renderSpacing.vocal / spacing.STEP;
      }

      break;

    case "debug":
      element.top = positionY.chordHeightAbove;
      element.bottom = positionY.chordHeightAbove;
      break;
  }

  if (element.pitch === undefined || element.top === undefined) console.error("RelativeElement position not set.", element.type, element.pitch, element.top, positionY);
}

module.exports = setUpperAndLowerElements;

/***/ }),

/***/ "./src/write/layout/staffGroup.js":
/*!****************************************!*\
  !*** ./src/write/layout/staffGroup.js ***!
  \****************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var layoutVoiceElements = __webpack_require__(/*! ./VoiceElements */ "./src/write/layout/VoiceElements.js");

var layoutStaffGroup = function layoutStaffGroup(spacing, renderer, debug, staffGroup, leftEdge) {
  var epsilon = 0.0000001; // Fudging for inexactness of floating point math.

  var spacingunits = 0; // number of times we will have ended up using the spacing distance (as opposed to fixed width distances)

  var minspace = 1000; // a big number to start off with - used to find out what the smallest space between two notes is -- GD 2014.1.7

  var x = leftEdge;
  staffGroup.startx = x;
  var i;
  var currentduration = 0;
  if (debug) console.log("init layout", spacing);

  for (i = 0; i < staffGroup.voices.length; i++) {
    layoutVoiceElements.beginLayout(x, staffGroup.voices[i]);
  }

  var spacingunit = 0; // number of spacingunits coming from the previously laid out element to this one

  while (!finished(staffGroup.voices)) {
    // find first duration level to be laid out among candidates across voices
    currentduration = null; // candidate smallest duration level

    for (i = 0; i < staffGroup.voices.length; i++) {
      if (!layoutVoiceElements.layoutEnded(staffGroup.voices[i]) && (!currentduration || getDurationIndex(staffGroup.voices[i]) < currentduration)) currentduration = getDurationIndex(staffGroup.voices[i]);
    } // isolate voices at current duration level


    var currentvoices = [];
    var othervoices = [];

    for (i = 0; i < staffGroup.voices.length; i++) {
      var durationIndex = getDurationIndex(staffGroup.voices[i]); // PER: Because of the inexactness of JS floating point math, we just get close.

      if (durationIndex - currentduration > epsilon) {
        othervoices.push(staffGroup.voices[i]); //console.log("out: voice ",i);
      } else {
        currentvoices.push(staffGroup.voices[i]); //if (debug) console.log("in: voice ",i);
      }
    } // among the current duration level find the one which needs starting furthest right


    spacingunit = 0; // number of spacingunits coming from the previously laid out element to this one

    var spacingduration = 0;

    for (i = 0; i < currentvoices.length; i++) {
      //console.log("greatest spacing unit", x, currentvoices[i].getNextX(), currentvoices[i].getSpacingUnits(), currentvoices[i].spacingduration);
      if (layoutVoiceElements.getNextX(currentvoices[i]) > x) {
        x = layoutVoiceElements.getNextX(currentvoices[i]);
        spacingunit = layoutVoiceElements.getSpacingUnits(currentvoices[i]);
        spacingduration = currentvoices[i].spacingduration;
      }
    }

    spacingunits += spacingunit;
    minspace = Math.min(minspace, spacingunit);
    if (debug) console.log("currentduration: ", currentduration, spacingunits, minspace);

    for (i = 0; i < currentvoices.length; i++) {
      var voicechildx = layoutVoiceElements.layoutOneItem(x, spacing, currentvoices[i], renderer.minPadding);
      var dx = voicechildx - x;

      if (dx > 0) {
        x = voicechildx; //update x

        for (var j = 0; j < i; j++) {
          // shift over all previously laid out elements
          layoutVoiceElements.shiftRight(dx, currentvoices[j]);
        }
      }
    } // remove the value of already counted spacing units in other voices (e.g. if a voice had planned to use up 5 spacing units but is not in line to be laid out at this duration level - where we've used 2 spacing units - then we must use up 3 spacing units, not 5)


    for (i = 0; i < othervoices.length; i++) {
      othervoices[i].spacingduration -= spacingduration;
      layoutVoiceElements.updateNextX(x, spacing, othervoices[i]); // adjust other voices expectations
    } // update indexes of currently laid out elems


    for (i = 0; i < currentvoices.length; i++) {
      var voice = currentvoices[i];
      layoutVoiceElements.updateIndices(voice);
    }
  } // finished laying out
  // find the greatest remaining x as a base for the width


  for (i = 0; i < staffGroup.voices.length; i++) {
    if (layoutVoiceElements.getNextX(staffGroup.voices[i]) > x) {
      x = layoutVoiceElements.getNextX(staffGroup.voices[i]);
      spacingunit = layoutVoiceElements.getSpacingUnits(staffGroup.voices[i]);
    }
  } //console.log("greatest remaining",spacingunit,x);


  spacingunits += spacingunit;
  staffGroup.setWidth(x);
  return {
    spacingUnits: spacingunits,
    minSpace: minspace
  };
};

function finished(voices) {
  for (var i = 0; i < voices.length; i++) {
    if (!layoutVoiceElements.layoutEnded(voices[i])) return false;
  }

  return true;
}

function getDurationIndex(element) {
  return element.durationindex - (element.children[element.i] && element.children[element.i].duration > 0 ? 0 : 0.0000005); // if the ith element doesn't have a duration (is not a note), its duration index is fractionally before. This enables CLEF KEYSIG TIMESIG PART, etc. to be laid out before we get to the first note of other voices
}

module.exports = layoutStaffGroup;

/***/ }),

/***/ "./src/write/layout/triplet.js":
/*!*************************************!*\
  !*** ./src/write/layout/triplet.js ***!
  \*************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var getBarYAt = __webpack_require__(/*! ./getBarYAt */ "./src/write/layout/getBarYAt.js");

function layoutTriplet(element) {
  // TODO end and beginning of line (PER: P.S. I'm not sure this can happen: I think the parser will always specify both the start and end points.)
  if (element.anchor1 && element.anchor2) {
    element.hasBeam = !element.tiesAbove && !!element.anchor1.parent.beam && element.anchor1.parent.beam === element.anchor2.parent.beam;
    var beam = element.anchor1.parent.beam; // if hasBeam is true, then the first and last element in the triplet have the same beam.
    // We also need to check if the beam doesn't contain other notes so that `(3 dcdcc` will do a bracket.

    if (element.hasBeam && (beam.elems[0] !== element.anchor1.parent || beam.elems[beam.elems.length - 1] !== element.anchor2.parent)) element.hasBeam = false;

    if (element.hasBeam) {
      // If there is a beam then we don't need to draw anything except the text. The beam could either be above or below.
      var left = isAbove(beam) ? element.anchor1.x + element.anchor1.w : element.anchor1.x;
      element.yTextPos = heightAtMidpoint(left, element.anchor2.x, beam);
      element.yTextPos += isAbove(beam) ? 3 : -2; // This creates some space between the beam and the number.

      element.xTextPos = xAtMidpoint(left, element.anchor2.x);
      element.top = element.yTextPos + 1;
      element.bottom = element.yTextPos - 2;
      if (isAbove(beam)) element.endingHeightAbove = 4;
    } else {
      // If there isn't a beam, then we need to draw the bracket and the text. The bracket is always above.
      // The bracket is never lower than the 'a' line, but is 4 pitches above the first and last notes. If there is
      // a tall note in the middle, the bracket is horizontal and above the highest note.
      element.startNote = Math.max(element.anchor1.parent.top, 9) + 4;
      element.endNote = Math.max(element.anchor2.parent.top, 9) + 4; // If it starts or ends on a rest, make the beam horizontal

      if (element.anchor1.parent.type === "rest" && element.anchor2.parent.type !== "rest") element.startNote = element.endNote;else if (element.anchor2.parent.type === "rest" && element.anchor1.parent.type !== "rest") element.endNote = element.startNote; // See if the middle note is really high.

      var max = 0;

      for (var i = 0; i < element.middleElems.length; i++) {
        max = Math.max(max, element.middleElems[i].top);
      }

      max += 4;

      if (max > element.startNote || max > element.endNote) {
        element.startNote = max;
        element.endNote = max;
      }

      if (element.flatBeams) {
        element.startNote = Math.max(element.startNote, element.endNote);
        element.endNote = Math.max(element.startNote, element.endNote);
      }

      element.yTextPos = element.startNote + (element.endNote - element.startNote) / 2;
      element.xTextPos = element.anchor1.x + (element.anchor2.x + element.anchor2.w - element.anchor1.x) / 2;
      element.top = element.yTextPos + 1;
    }
  }

  delete element.middleElems;
  delete element.flatBeams;
}

function isAbove(beam) {
  return beam.stemsUp;
} // We can't just use the entire beam for the calculation. The range has to be passed in, because the beam might extend into some unrelated notes. for instance, (3_a'f'e'f'2 when L:16


function heightAtMidpoint(startX, endX, beam) {
  if (beam.beams.length === 0) return 0;
  beam = beam.beams[0];
  var midPoint = startX + (endX - startX) / 2;
  return getBarYAt(beam.startX, beam.startY, beam.endX, beam.endY, midPoint);
}

function xAtMidpoint(startX, endX) {
  return startX + (endX - startX) / 2;
}

module.exports = layoutTriplet;

/***/ }),

/***/ "./src/write/layout/voice.js":
/*!***********************************!*\
  !*** ./src/write/layout/voice.js ***!
  \***********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var layoutBeam = __webpack_require__(/*! ./beam */ "./src/write/layout/beam.js");

var getBarYAt = __webpack_require__(/*! ./getBarYAt */ "./src/write/layout/getBarYAt.js");

var layoutTriplet = __webpack_require__(/*! ./triplet */ "./src/write/layout/triplet.js");

var layoutVoice = function layoutVoice(voice) {
  for (var i = 0; i < voice.beams.length; i++) {
    if (voice.beams[i].type === 'BeamElem') {
      layoutBeam(voice.beams[i]);
      moveDecorations(voice.beams[i]); // The above will change the top and bottom of the abselem children, so see if we need to expand our range.

      for (var j = 0; j < voice.beams[i].elems.length; j++) {
        voice.adjustRange(voice.beams[i].elems[j]);
      }
    }
  }

  voice.staff.specialY.chordLines = setLaneForChord(voice.children); // Now we can layout the triplets

  for (i = 0; i < voice.otherchildren.length; i++) {
    var child = voice.otherchildren[i];

    if (child.type === 'TripletElem') {
      layoutTriplet(child);
      voice.adjustRange(child);
    }
  }

  voice.staff.top = Math.max(voice.staff.top, voice.top);
  voice.staff.bottom = Math.min(voice.staff.bottom, voice.bottom);
};

function moveDecorations(beam) {
  var padding = 1.5; // This is the vertical padding between elements, in pitches.

  for (var ch = 0; ch < beam.elems.length; ch++) {
    var child = beam.elems[ch];

    if (child.top) {
      // We now know where the ornaments should have been placed, so move them if they would overlap.
      var top = yAtNote(child, beam);

      for (var i = 0; i < child.children.length; i++) {
        var el = child.children[i];

        if (el.klass === 'ornament') {
          if (el.bottom - padding < top) {
            var distance = top - el.bottom + padding; // Find the distance that it needs to move and add a little margin so the element doesn't touch the beam.

            el.bottom += distance;
            el.top += distance;
            el.pitch += distance;
            top = child.top = el.top;
          }
        }
      }
    }
  }
}

function placeInLane(rightMost, relElem) {
  // These items are centered so figure the coordinates accordingly and add a little margin.
  var xCoords = relElem.getChordDim();

  if (xCoords) {
    for (var i = 0; i < rightMost.length; i++) {
      var fits = rightMost[i] < xCoords.left;

      if (fits) {
        if (i > 0) relElem.putChordInLane(i);
        rightMost[i] = xCoords.right;
        return;
      }
    } // If we didn't return early, then we need a new row


    rightMost.push(xCoords.right);
    relElem.putChordInLane(rightMost.length - 1);
  }
}

function setLaneForChord(absElems) {
  // Criteria:
  // 1) lane numbers start from the bottom so that as many items as possible are in lane 0, closest to the music.
  // 2) a chord can have more than one line (for instance "C\nD") each line is a lane.
  // 3) if two adjoining items would touch then push the second one to the next lane.
  // 4) use as many lanes as is necessary to get everything to not touch.
  // 5) leave a margin between items, so use another lane if the chords would have less than a character's width.
  // 6) if the chord only has one character, allow it to be closer than if the chord has more than one character.
  var rightMostAbove = [0];
  var rightMostBelow = [0];
  var i;
  var j;
  var relElem;

  for (i = 0; i < absElems.length; i++) {
    for (j = 0; j < absElems[i].children.length; j++) {
      relElem = absElems[i].children[j];

      if (relElem.chordHeightAbove) {
        placeInLane(rightMostAbove, relElem);
      }
    }

    for (j = absElems[i].children.length - 1; j >= 0; j--) {
      relElem = absElems[i].children[j];

      if (relElem.chordHeightBelow) {
        placeInLane(rightMostBelow, relElem);
      }
    }
  } // If we used a second line, then we need to go back and set the first lines.
  // Also we need to flip the indexes of the names so that we can count from the top line.


  if (rightMostAbove.length > 1 || rightMostBelow.length > 1) setLane(absElems, rightMostAbove.length, rightMostBelow.length);
  return {
    above: rightMostAbove.length,
    below: rightMostBelow.length
  };
}

function numAnnotationsBelow(absElem) {
  var count = 0;

  for (var j = 0; j < absElem.children.length; j++) {
    var relElem = absElem.children[j];
    if (relElem.chordHeightBelow) count++;
  }

  return count;
}

function setLane(absElems, numLanesAbove, numLanesBelow) {
  for (var i = 0; i < absElems.length; i++) {
    var below = numAnnotationsBelow(absElems[i]);

    for (var j = 0; j < absElems[i].children.length; j++) {
      var relElem = absElems[i].children[j];

      if (relElem.chordHeightAbove) {
        relElem.invertLane(numLanesAbove); // } else if (relElem.chordHeightBelow) {
        // 	relElem.invertLane(below);
      }
    }
  }
}

function yAtNote(element, beam) {
  beam = beam.beams[0];
  return getBarYAt(beam.startX, beam.startY, beam.endX, beam.endY, element.x);
}

module.exports = layoutVoice;

/***/ }),

/***/ "./src/write/selection.js":
/*!********************************!*\
  !*** ./src/write/selection.js ***!
  \********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var spacing = __webpack_require__(/*! ./abc_spacing */ "./src/write/abc_spacing.js");

function setupSelection(engraver) {
  engraver.rangeHighlight = rangeHighlight;

  if (engraver.dragging) {
    for (var h = 0; h < engraver.selectables.length; h++) {
      var hist = engraver.selectables[h];

      if (hist.selectable) {
        hist.svgEl.setAttribute("tabindex", 0);
        hist.svgEl.setAttribute("data-index", h);
        hist.svgEl.addEventListener("keydown", keyboardDown.bind(engraver));
        hist.svgEl.addEventListener("keyup", keyboardSelection.bind(engraver));
        hist.svgEl.addEventListener("focus", elementFocused.bind(engraver));
      }
    }
  }

  engraver.renderer.paper.svg.addEventListener('mousedown', mouseDown.bind(engraver));
  engraver.renderer.paper.svg.addEventListener('mousemove', mouseMove.bind(engraver));
  engraver.renderer.paper.svg.addEventListener('mouseup', mouseUp.bind(engraver));
}

function getCoord(ev, svg) {
  var scaleX = 1;
  var scaleY = 1; // when renderer.options.responsive === 'resize' the click coords are in relation to the HTML
  // element, we need to convert to the SVG viewBox coords

  if (svg.viewBox.baseVal) {
    // Firefox passes null to this when no viewBox is given
    // Chrome makes these values null when no viewBox is given.
    if (svg.viewBox.baseVal.width !== 0) scaleX = svg.viewBox.baseVal.width / svg.clientWidth;
    if (svg.viewBox.baseVal.height !== 0) scaleY = svg.viewBox.baseVal.height / svg.clientHeight;
  }

  var svgClicked = ev.target.tagName === "svg";
  var x;
  var y;

  if (svgClicked) {
    x = ev.offsetX;
    y = ev.offsetY;
  } else {
    x = ev.layerX;
    y = ev.layerY;
  }

  x = x * scaleX;
  y = y * scaleY; //console.log(x, y)

  return [x, y];
}

function elementFocused(ev) {
  // If there had been another element focused and is being dragged, then report that before setting the new element up.
  if (this.dragMechanism === "keyboard" && this.dragYStep !== 0 && this.dragTarget) notifySelect.bind(this)(this.dragTarget, this.dragYStep, this.selectables.length, this.dragIndex, ev);
  this.dragYStep = 0;
}

function keyboardDown(ev) {
  // Swallow the up and down arrow events - they will be used for dragging with the keyboard
  switch (ev.keyCode) {
    case 38:
    case 40:
      ev.preventDefault();
  }
}

function keyboardSelection(ev) {
  // "this" is the EngraverController because of the bind(this) when setting the event listener.
  var handled = false;
  var index = ev.target.dataset.index;

  switch (ev.keyCode) {
    case 13:
    case 32:
      handled = true;
      this.dragTarget = this.selectables[index];
      this.dragIndex = index;
      this.dragMechanism = "keyboard";
      mouseUp.bind(this)();
      break;

    case 38:
      // arrow up
      handled = true;
      this.dragTarget = this.selectables[index];
      this.dragIndex = index;

      if (this.dragTarget.isDraggable) {
        if (this.dragging && this.dragTarget.isDraggable) this.dragTarget.absEl.highlight(undefined, this.dragColor);
        this.dragYStep--;
        this.dragTarget.svgEl.setAttribute("transform", "translate(0," + this.dragYStep * spacing.STEP + ")");
      }

      break;

    case 40:
      // arrow down
      handled = true;
      this.dragTarget = this.selectables[index];
      this.dragIndex = index;
      this.dragMechanism = "keyboard";

      if (this.dragTarget.isDraggable) {
        if (this.dragging && this.dragTarget.isDraggable) this.dragTarget.absEl.highlight(undefined, this.dragColor);
        this.dragYStep++;
        this.dragTarget.svgEl.setAttribute("transform", "translate(0," + this.dragYStep * spacing.STEP + ")");
      }

      break;

    case 9:
      // tab
      // This is losing focus - if there had been dragging, then do the callback
      if (this.dragYStep !== 0) {
        mouseUp.bind(this)();
      }

      break;

    default:
      //console.log(ev);
      break;
  }

  if (handled) ev.preventDefault();
}

function findElementInHistory(selectables, el) {
  for (var i = 0; i < selectables.length; i++) {
    if (el === selectables[i].svgEl) return i;
  }

  return -1;
}

function findElementByCoord(self, x, y) {
  var minDistance = 9999999;
  var closestIndex = -1;

  for (var i = 0; i < self.selectables.length && minDistance > 0; i++) {
    var el = self.selectables[i];
    self.getDim(el);

    if (el.dim.left < x && el.dim.right > x && el.dim.top < y && el.dim.bottom > y) {
      // See if it is a direct hit on an element - if so, definitely take it (there are no overlapping elements)
      closestIndex = i;
      minDistance = 0;
    } else if (el.dim.top < y && el.dim.bottom > y) {
      // See if it is the same vertical as the element. Then the distance is the x difference
      var horiz = Math.min(Math.abs(el.dim.left - x), Math.abs(el.dim.right - x));

      if (horiz < minDistance) {
        minDistance = horiz;
        closestIndex = i;
      }
    } else if (el.dim.left < x && el.dim.right > x) {
      // See if it is the same horizontal as the element. Then the distance is the y difference
      var vert = Math.min(Math.abs(el.dim.top - y), Math.abs(el.dim.bottom - y));

      if (vert < minDistance) {
        minDistance = vert;
        closestIndex = i;
      }
    } else {
      // figure out the distance to this element.
      var dx = Math.abs(x - el.dim.left) > Math.abs(x - el.dim.right) ? Math.abs(x - el.dim.right) : Math.abs(x - el.dim.left);
      var dy = Math.abs(y - el.dim.top) > Math.abs(y - el.dim.bottom) ? Math.abs(y - el.dim.bottom) : Math.abs(y - el.dim.top);
      var hypotenuse = Math.sqrt(dx * dx + dy * dy);

      if (hypotenuse < minDistance) {
        minDistance = hypotenuse;
        closestIndex = i;
      }
    }
  }

  return closestIndex >= 0 && minDistance <= 12 ? closestIndex : -1;
}

function getBestMatchCoordinates(dim, ev, scale) {
  // Different browsers have conflicting meanings for the coordinates that are returned.
  // If the item we want is clicked on directly, then we will just see what is the best match.
  // This seems like less of a hack than browser sniffing.
  if (dim.x <= ev.offsetX && dim.x + dim.width >= ev.offsetX && dim.y <= ev.offsetY && dim.y + dim.height >= ev.offsetY) return [ev.offsetX, ev.offsetY]; // Firefox returns a weird value for offset, but layer is correct.
  // Safari and Chrome return the correct value for offset, but layer is multiplied by the scale (that is, if it were rendered with { scale: 2 })
  // For instance (if scale is 2):
  // Firefox: { offsetY: 5, layerY: 335 }
  // Others: {offsetY: 335, layerY: 670} (there could be a little rounding, so the number might not be exactly 2x)
  // So, if layerY/scale is approx. offsetY, then use offsetY, otherwise use layerY

  var epsilon = Math.abs(ev.layerY / scale - ev.offsetY);
  if (epsilon < 3) return [ev.offsetX, ev.offsetY];else return [ev.layerX, ev.layerY];
}

function getTarget(target) {
  // This searches up the dom for the first item containig the attribute "selectable", or stopping at the SVG.
  if (target.tagName === "svg") return target;
  var found = target.getAttribute("selectable");

  while (!found) {
    target = target.parentElement;
    if (target.tagName === "svg") found = true;else found = target.getAttribute("selectable");
  }

  return target;
}

function getMousePosition(self, ev) {
  // if the user clicked exactly on an element that we're interested in, then we already have the answer.
  // This is more reliable than the calculations because firefox returns different coords for offsetX, offsetY
  var x;
  var y;
  var box;
  var clickedOn = findElementInHistory(self.selectables, getTarget(ev.target));

  if (clickedOn >= 0) {
    // There was a direct hit on an element.
    box = getBestMatchCoordinates(self.selectables[clickedOn].svgEl.getBBox(), ev, self.scale);
    x = box[0];
    y = box[1]; //console.log("clicked on", clickedOn, x, y, self.selectables[clickedOn].svgEl.getBBox(), ev.target.getBBox());
  } else {
    // See if they clicked close to an element.
    box = getCoord(ev, self.renderer.paper.svg);
    x = box[0];
    y = box[1];
    clickedOn = findElementByCoord(self, x, y); //console.log("clicked near", clickedOn, x, y, printEl(ev.target));
  }

  return {
    x: x,
    y: y,
    clickedOn: clickedOn
  };
}

function mouseDown(ev) {
  // "this" is the EngraverController because of the bind(this) when setting the event listener.
  var positioning = getMousePosition(this, ev); // Only start dragging if the user clicked close enough to an element and clicked with the main mouse button.

  if (positioning.clickedOn >= 0 && ev.button === 0) {
    this.dragTarget = this.selectables[positioning.clickedOn];
    this.dragIndex = positioning.clickedOn;
    this.dragMechanism = "mouse";
    this.dragMouseStart = {
      x: positioning.x,
      y: positioning.y
    };

    if (this.dragging && this.dragTarget.isDraggable) {
      addGlobalClass(this.renderer.paper, "abcjs-dragging-in-progress");
      this.dragTarget.absEl.highlight(undefined, this.dragColor);
    }
  }
}

function mouseMove(ev) {
  // "this" is the EngraverController because of the bind(this) when setting the event listener.
  if (!this.dragTarget || !this.dragging || !this.dragTarget.isDraggable || this.dragMechanism !== 'mouse') return;
  var positioning = getMousePosition(this, ev);
  var yDist = Math.round((positioning.y - this.dragMouseStart.y) / spacing.STEP);

  if (yDist !== this.dragYStep) {
    this.dragYStep = yDist;
    this.dragTarget.svgEl.setAttribute("transform", "translate(0," + yDist * spacing.STEP + ")");
  }
}

function mouseUp(ev) {
  // "this" is the EngraverController because of the bind(this) when setting the event listener.
  if (!this.dragTarget) return;
  clearSelection.bind(this)();

  if (this.dragTarget.absEl && this.dragTarget.absEl.highlight) {
    this.selected = [this.dragTarget.absEl];
    this.dragTarget.absEl.highlight(undefined, this.selectionColor);
  }

  notifySelect.bind(this)(this.dragTarget, this.dragYStep, this.selectables.length, this.dragIndex, ev);

  if (this.dragTarget.svgEl && this.dragTarget.svgEl.focus) {
    this.dragTarget.svgEl.focus();
    this.dragTarget = null;
    this.dragIndex = -1;
  }

  removeGlobalClass(this.renderer.svg, "abcjs-dragging-in-progress");
}

function setSelection(dragIndex) {
  if (dragIndex >= 0 && dragIndex < this.selectables.length) {
    this.dragTarget = this.selectables[dragIndex];
    this.dragIndex = dragIndex;
    this.dragMechanism = "keyboard";
    mouseUp.bind(this)();
  }
}

function notifySelect(target, dragStep, dragMax, dragIndex, ev) {
  var classes = [];

  if (target.absEl.elemset) {
    var classObj = {};

    for (var j = 0; j < target.absEl.elemset.length; j++) {
      var es = target.absEl.elemset[j];

      if (es) {
        var klass = es.getAttribute("class").split(' ');

        for (var k = 0; k < klass.length; k++) {
          classObj[klass[k]] = true;
        }
      }
    }

    for (var kk = 0; kk < Object.keys(classObj).length; kk++) {
      classes.push(Object.keys(classObj)[kk]);
    }
  }

  var analysis = {};

  for (var ii = 0; ii < classes.length; ii++) {
    findNumber(classes[ii], "abcjs-v", analysis, "voice");
    findNumber(classes[ii], "abcjs-l", analysis, "line");
    findNumber(classes[ii], "abcjs-m", analysis, "measure");
  }

  if (target.staffPos) analysis.staffPos = target.staffPos;

  for (var i = 0; i < this.listeners.length; i++) {
    this.listeners[i](target.absEl.abcelem, target.absEl.tuneNumber, classes.join(' '), analysis, {
      step: dragStep,
      max: dragMax,
      index: dragIndex,
      setSelection: setSelection.bind(this)
    }, ev);
  }
}

function findNumber(klass, match, target, name) {
  if (klass.indexOf(match) === 0) {
    var value = klass.replace(match, '');
    var num = parseInt(value, 10);
    if ('' + num === value) target[name] = num;
  }
}

function clearSelection() {
  for (var i = 0; i < this.selected.length; i++) {
    this.selected[i].unhighlight(undefined, this.renderer.foregroundColor);
  }

  this.selected = [];
}

function rangeHighlight(start, end) {
  clearSelection.bind(this)();

  for (var line = 0; line < this.staffgroups.length; line++) {
    var voices = this.staffgroups[line].voices;

    for (var voice = 0; voice < voices.length; voice++) {
      var elems = voices[voice].children;

      for (var elem = 0; elem < elems.length; elem++) {
        // Since the user can highlight more than an element, or part of an element, a hit is if any of the endpoints
        // is inside the other range.
        var elStart = elems[elem].abcelem.startChar;
        var elEnd = elems[elem].abcelem.endChar;

        if (end > elStart && start < elEnd || end === start && end === elEnd) {
          //		if (elems[elem].abcelem.startChar>=start && elems[elem].abcelem.endChar<=end) {
          this.selected[this.selected.length] = elems[elem];
          elems[elem].highlight(undefined, this.selectionColor);
        }
      }
    }
  }
}

function getClassSet(el) {
  var oldClass = el.getAttribute('class');
  if (!oldClass) oldClass = "";
  var klasses = oldClass.split(" ");
  var obj = {};

  for (var i = 0; i < klasses.length; i++) {
    obj[klasses[i]] = true;
  }

  return obj;
}

function setClassSet(el, klassSet) {
  var klasses = [];

  for (var key in klassSet) {
    if (klassSet.hasOwnProperty(key)) klasses.push(key);
  }

  el.setAttribute('class', klasses.join(' '));
}

function addGlobalClass(svg, klass) {
  if (svg) {
    var obj = getClassSet(svg.svg);
    obj[klass] = true;
    setClassSet(svg.svg, obj);
  }
}

function removeGlobalClass(svg, klass) {
  if (svg) {
    var obj = getClassSet(svg.svg);
    delete obj[klass];
    setClassSet(svg.svg, obj);
  }
}

module.exports = setupSelection;

/***/ }),

/***/ "./src/write/separator.js":
/*!********************************!*\
  !*** ./src/write/separator.js ***!
  \********************************/
/***/ (function(module) {

function Separator(spaceAbove, lineLength, spaceBelow) {
  this.rows = [];
  if (spaceAbove) this.rows.push({
    move: spaceAbove
  });
  this.rows.push({
    separator: lineLength
  });
  if (spaceBelow) this.rows.push({
    move: spaceBelow
  });
}

module.exports = Separator;

/***/ }),

/***/ "./src/write/set-class.js":
/*!********************************!*\
  !*** ./src/write/set-class.js ***!
  \********************************/
/***/ (function(module) {

var setClass = function setClass(elemset, addClass, removeClass, color) {
  if (!elemset) return;

  for (var i = 0; i < elemset.length; i++) {
    var el = elemset[i];
    var attr = el.getAttribute("highlight");
    if (!attr) attr = "fill";
    el.setAttribute(attr, color);
    var kls = el.getAttribute("class");
    if (!kls) kls = "";
    kls = kls.replace(removeClass, "");
    kls = kls.replace(addClass, "");

    if (addClass.length > 0) {
      if (kls.length > 0 && kls.charAt(kls.length - 1) !== ' ') kls += " ";
      kls += addClass;
    }

    el.setAttribute("class", kls);
  }
};

module.exports = setClass;

/***/ }),

/***/ "./src/write/subtitle.js":
/*!*******************************!*\
  !*** ./src/write/subtitle.js ***!
  \*******************************/
/***/ (function(module) {

function Subtitle(spaceAbove, formatting, text, center, paddingLeft, getTextSize) {
  this.rows = [];
  if (spaceAbove) this.rows.push({
    move: spaceAbove
  });
  var tAnchor = formatting.titleleft ? 'start' : 'middle';
  var tLeft = formatting.titleleft ? paddingLeft : center;
  this.rows.push({
    left: tLeft,
    text: text,
    font: 'subtitlefont',
    klass: 'text subtitle',
    anchor: tAnchor
  });
  var size = getTextSize.calc(text, 'subtitlefont', 'text subtitle');
  this.rows.push({
    move: size.height
  });
}

module.exports = Subtitle;

/***/ }),

/***/ "./src/write/svg.js":
/*!**************************!*\
  !*** ./src/write/svg.js ***!
  \**************************/
/***/ (function(module) {

//    abc_voice_element.js: Definition of the VoiceElement class.

/*global module */
var svgNS = "http://www.w3.org/2000/svg";

function Svg(wrapper) {
  this.svg = createSvg();
  wrapper.appendChild(this.svg);
}

Svg.prototype.clear = function () {
  if (this.svg) {
    var wrapper = this.svg.parentNode;
    this.svg = createSvg();

    if (wrapper) {
      // TODO-PER: If the wrapper is not present, then the underlying div was pulled out from under this instance. It's possible that is still useful (for creating the music off page?)
      wrapper.innerHTML = "";
      wrapper.appendChild(this.svg);
    }
  }
};

Svg.prototype.setTitle = function (title) {
  var titleEl = document.createElement("title");
  var titleNode = document.createTextNode(title);
  titleEl.appendChild(titleNode);
  this.svg.insertBefore(titleEl, this.svg.firstChild);
};

Svg.prototype.setResponsiveWidth = function (w, h) {
  // this technique is from: http://thenewcode.com/744/Make-SVG-Responsive, thx to https://github.com/iantresman
  this.svg.setAttribute("viewBox", "0 0 " + w + " " + h);
  this.svg.setAttribute("preserveAspectRatio", "xMinYMin meet");
  this.svg.removeAttribute("height");
  this.svg.removeAttribute("width");
  this.svg.style['display'] = "inline-block";
  this.svg.style['position'] = "absolute";
  this.svg.style['top'] = "0";
  this.svg.style['left'] = "0";

  if (this.svg.parentNode) {
    var cls = this.svg.parentNode.getAttribute("class");
    if (!cls) this.svg.parentNode.setAttribute("class", "abcjs-container");else if (cls.indexOf("abcjs-container") < 0) this.svg.parentNode.setAttribute("class", cls + " abcjs-container");
    this.svg.parentNode.style['display'] = "inline-block";
    this.svg.parentNode.style['position'] = "relative";
    this.svg.parentNode.style['width'] = "100%"; // PER: I changed the padding from 100% to this through trial and error.
    // The example was using a square image, but this music might be either wider or taller.

    var padding = h / w * 100;
    this.svg.parentNode.style['padding-bottom'] = padding + "%";
    this.svg.parentNode.style['vertical-align'] = "middle";
    this.svg.parentNode.style['overflow'] = "hidden";
  }
};

Svg.prototype.setSize = function (w, h) {
  this.svg.setAttribute('width', w);
  this.svg.setAttribute('height', h);
};

Svg.prototype.setAttribute = function (attr, value) {
  this.svg.setAttribute(attr, value);
};

Svg.prototype.setScale = function (scale) {
  if (scale !== 1) {
    this.svg.style.transform = "scale(" + scale + "," + scale + ")";
    this.svg.style['-ms-transform'] = "scale(" + scale + "," + scale + ")";
    this.svg.style['-webkit-transform'] = "scale(" + scale + "," + scale + ")";
    this.svg.style['transform-origin'] = "0 0";
    this.svg.style['-ms-transform-origin-x'] = "0";
    this.svg.style['-ms-transform-origin-y'] = "0";
    this.svg.style['-webkit-transform-origin-x'] = "0";
    this.svg.style['-webkit-transform-origin-y'] = "0";
  } else {
    this.svg.style.transform = "";
    this.svg.style['-ms-transform'] = "";
    this.svg.style['-webkit-transform'] = "";
  }
};

Svg.prototype.insertStyles = function (styles) {
  var el = document.createElementNS(svgNS, "style");
  el.textContent = styles;
  this.svg.insertBefore(el, this.svg.firstChild); // prepend is not available on older browsers.
  //	this.svg.prepend(el);
};

Svg.prototype.setParentStyles = function (attr) {
  // This is needed to get the size right when there is scaling involved.
  for (var key in attr) {
    if (attr.hasOwnProperty(key)) {
      if (this.svg.parentNode) this.svg.parentNode.style[key] = attr[key];
    }
  } // This is the last thing that gets called, so delete the temporary SVG if one was created


  if (this.dummySvg) {
    var body = document.querySelector('body');
    body.removeChild(this.dummySvg);
    this.dummySvg = null;
  }
};

function constructHLine(x1, y1, x2) {
  var len = x2 - x1;
  return "M " + x1 + " " + y1 + " l " + len + ' ' + 0 + " l " + 0 + " " + 1 + " " + " l " + -len + " " + 0 + " " + " z ";
}

function constructVLine(x1, y1, y2) {
  var len = y2 - y1;
  return "M " + x1 + " " + y1 + " l " + 0 + ' ' + len + " l " + 1 + " " + 0 + " " + " l " + 0 + " " + -len + " " + " z ";
}

Svg.prototype.rect = function (attr) {
  // This uses path instead of rect so that it can be hollow and the color changes with "fill" instead of "stroke".
  var lines = [];
  var x1 = attr.x;
  var y1 = attr.y;
  var x2 = attr.x + attr.width;
  var y2 = attr.y + attr.height;
  lines.push(constructHLine(x1, y1, x2));
  lines.push(constructHLine(x1, y2, x2));
  lines.push(constructVLine(x2, y1, y2));
  lines.push(constructVLine(x1, y2, y1));
  return this.path({
    path: lines.join(" "),
    stroke: "none"
  });
};

Svg.prototype.dottedLine = function (attr) {
  var el = document.createElementNS(svgNS, 'line');
  el.setAttribute("x1", attr.x1);
  el.setAttribute("x2", attr.x2);
  el.setAttribute("y1", attr.y1);
  el.setAttribute("y2", attr.y2);
  el.setAttribute("stroke", attr.stroke);
  el.setAttribute("stroke-dasharray", "5,5");
  this.svg.insertBefore(el, this.svg.firstChild);
};

Svg.prototype.rectBeneath = function (attr) {
  var el = document.createElementNS(svgNS, 'rect');
  el.setAttribute("x", attr.x);
  el.setAttribute("width", attr.width);
  el.setAttribute("y", attr.y);
  el.setAttribute("height", attr.height);
  if (attr.stroke) el.setAttribute("stroke", attr.stroke);
  if (attr['stroke-opacity']) el.setAttribute("stroke-opacity", attr['stroke-opacity']);
  if (attr.fill) el.setAttribute("fill", attr.fill);
  if (attr['fill-opacity']) el.setAttribute("fill-opacity", attr['fill-opacity']);
  this.svg.insertBefore(el, this.svg.firstChild);
};

Svg.prototype.text = function (text, attr, target) {
  var el = document.createElementNS(svgNS, 'text');
  el.setAttribute("stroke", "none");

  for (var key in attr) {
    if (attr.hasOwnProperty(key)) {
      el.setAttribute(key, attr[key]);
    }
  }

  var lines = ("" + text).split("\n");

  for (var i = 0; i < lines.length; i++) {
    var line = document.createElementNS(svgNS, 'tspan');
    line.textContent = lines[i];
    line.setAttribute("x", attr.x ? attr.x : 0);
    if (i !== 0) line.setAttribute("dy", "1.2em");
    el.appendChild(line);
  }

  if (target) target.appendChild(el);else this.append(el);
  return el;
};

Svg.prototype.guessWidth = function (text, attr) {
  var svg = this.createDummySvg();
  var el = this.text(text, attr, svg);
  var size;

  try {
    size = el.getBBox();
    if (isNaN(size.height) || !size.height) // TODO-PER: I don't think this can happen unless there isn't a browser at all.
      size = {
        width: attr['font-size'] / 2,
        height: attr['font-size'] + 2
      }; // Just a wild guess.
    else size = {
        width: size.width,
        height: size.height
      };
  } catch (ex) {
    size = {
      width: attr['font-size'] / 2,
      height: attr['font-size'] + 2
    }; // Just a wild guess.
  }

  svg.removeChild(el);
  return size;
};

Svg.prototype.createDummySvg = function () {
  if (!this.dummySvg) {
    this.dummySvg = createSvg();
    var styles = ["display: block !important;", "height: 1px;", "width: 1px;", "position: absolute;"];
    this.dummySvg.setAttribute('style', styles.join(""));
    var body = document.querySelector('body');
    body.appendChild(this.dummySvg);
  }

  return this.dummySvg;
};

var sizeCache = {};

Svg.prototype.getTextSize = function (text, attr, el) {
  if (typeof text === 'number') text = '' + text;
  if (!text || text.match(/^\s+$/)) return {
    width: 0,
    height: 0
  };
  var key;

  if (text.length < 20) {
    // The short text tends to be repetitive and getBBox is really slow, so lets cache.
    key = text + JSON.stringify(attr);
    if (sizeCache[key]) return sizeCache[key];
  }

  var removeLater = !el;
  if (!el) el = this.text(text, attr);
  var size;

  try {
    size = el.getBBox();
    if (isNaN(size.height) || !size.height) size = this.guessWidth(text, attr);else size = {
      width: size.width,
      height: size.height
    };
  } catch (ex) {
    size = this.guessWidth(text, attr);
  }

  if (removeLater) {
    if (this.currentGroup) this.currentGroup.removeChild(el);else this.svg.removeChild(el);
  }

  if (key) sizeCache[key] = size;
  return size;
};

Svg.prototype.openGroup = function (options) {
  options = options ? options : {};
  var el = document.createElementNS(svgNS, "g");
  if (options.klass) el.setAttribute("class", options.klass);
  if (options.fill) el.setAttribute("fill", options.fill);
  if (options.stroke) el.setAttribute("stroke", options.stroke);
  if (options.prepend) this.svg.insertBefore(el, this.svg.firstChild);else this.svg.appendChild(el);
  this.currentGroup = el;
  return el;
};

Svg.prototype.closeGroup = function () {
  var g = this.currentGroup;
  this.currentGroup = null;
  return g;
};

Svg.prototype.path = function (attr) {
  var el = document.createElementNS(svgNS, "path");

  for (var key in attr) {
    if (attr.hasOwnProperty(key)) {
      if (key === 'path') el.setAttributeNS(null, 'd', attr.path);else el.setAttributeNS(null, key, attr[key]);
    }
  }

  this.append(el);
  return el;
};

Svg.prototype.pathToBack = function (attr) {
  var el = document.createElementNS(svgNS, "path");

  for (var key in attr) {
    if (attr.hasOwnProperty(key)) {
      if (key === 'path') el.setAttributeNS(null, 'd', attr.path);else el.setAttributeNS(null, key, attr[key]);
    }
  }

  this.prepend(el);
  return el;
};

Svg.prototype.append = function (el) {
  if (this.currentGroup) this.currentGroup.appendChild(el);else this.svg.appendChild(el);
};

Svg.prototype.prepend = function (el) {
  // The entire group is prepended, so don't prepend the individual elements.
  if (this.currentGroup) this.currentGroup.appendChild(el);else this.svg.insertBefore(el, this.svg.firstChild);
};

Svg.prototype.setAttributeOnElement = function (el, attr) {
  for (var key in attr) {
    if (attr.hasOwnProperty(key)) {
      el.setAttributeNS(null, key, attr[key]);
    }
  }
};

Svg.prototype.moveElementToChild = function (parent, child) {
  parent.appendChild(child);
};

function createSvg() {
  var svg = document.createElementNS(svgNS, "svg");
  svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
  svg.setAttribute('role', 'img'); // for accessibility

  svg.setAttribute('fill', 'currentColor'); // for automatically picking up dark mode and high contrast

  svg.setAttribute('stroke', 'currentColor'); // for automatically picking up dark mode and high contrast

  return svg;
}

module.exports = Svg;

/***/ }),

/***/ "./src/write/top-text.js":
/*!*******************************!*\
  !*** ./src/write/top-text.js ***!
  \*******************************/
/***/ (function(module) {

function TopText(metaText, formatting, lines, width, isPrint, paddingLeft, spacing, getTextSize) {
  this.rows = [];

  if (metaText.header && isPrint) {
    // Note: whether there is a header or not doesn't change any other positioning, so this doesn't change the Y-coordinate.
    // This text goes above the margin, so we'll temporarily move up.
    var headerTextHeight = getTextSize.calc("X", "headerfont", 'abcjs-header abcjs-meta-top').height;
    this.addTextIf(paddingLeft, metaText.header.left, 'headerfont', 'header meta-top', -headerTextHeight, 0, 'start', getTextSize);
    this.addTextIf(paddingLeft + width / 2, metaText.header.center, 'headerfont', 'header meta-top', -headerTextHeight, null, 'middle', getTextSize);
    this.addTextIf(paddingLeft + width, metaText.header.right, 'headerfont', 'header meta-top', -headerTextHeight, null, 'end', getTextSize);
  }

  if (isPrint) this.rows.push({
    move: spacing.top
  });
  var tAnchor = formatting.titleleft ? 'start' : 'middle';
  var tLeft = formatting.titleleft ? paddingLeft : paddingLeft + width / 2;

  if (metaText.title) {
    this.addTextIf(tLeft, metaText.title, 'titlefont', 'title meta-top', spacing.title, 0, tAnchor, getTextSize, "title");
  }

  if (lines[0] && lines[0].subtitle) {
    this.addTextIf(tLeft, lines[0].subtitle, 'subtitlefont', 'text meta-top subtitle', spacing.subtitle, 0, tAnchor, getTextSize, "subtitle");
  }

  if (metaText.rhythm || metaText.origin || metaText.composer) {
    this.rows.push({
      move: spacing.composer
    });

    if (metaText.rhythm && metaText.rhythm.length > 0) {
      var noMove = !!(metaText.composer || metaText.origin);
      this.addTextIf(paddingLeft, metaText.rhythm, 'infofont', 'meta-top rhythm', 0, null, "start", getTextSize, "rhythm", noMove);
    }

    var composerLine = "";
    if (metaText.composer) composerLine += metaText.composer;
    if (metaText.origin) composerLine += ' (' + metaText.origin + ')';

    if (composerLine.length > 0) {
      this.addTextIf(paddingLeft + width, composerLine, 'composerfont', 'meta-top composer', 0, null, "end", getTextSize, "composer");
    }
  }

  if (metaText.author && metaText.author.length > 0) {
    this.addTextIf(paddingLeft + width, metaText.author, 'composerfont', 'meta-top author', 0, 0, "end", getTextSize, "author");
  }

  if (metaText.partOrder && metaText.partOrder.length > 0) {
    this.addTextIf(paddingLeft, metaText.partOrder, 'partsfont', 'meta-top part-order', 0, 0, "start", getTextSize, "partOrder");
  }
}

TopText.prototype.addTextIf = function (marginLeft, text, font, klass, marginTop, marginBottom, anchor, getTextSize, absElemType, noMove) {
  if (!text) return;
  if (marginTop) this.rows.push({
    move: marginTop
  });
  this.rows.push({
    left: marginLeft,
    text: text,
    font: font,
    klass: klass,
    anchor: anchor,
    absElemType: absElemType
  });

  if (!noMove) {
    var size = getTextSize.calc(text, font, klass);
    this.rows.push({
      move: size.height
    });
    if (marginBottom) this.rows.push({
      move: marginBottom
    });
  }
};

module.exports = TopText;

/***/ }),

/***/ "./src/write/unhighlight.js":
/*!**********************************!*\
  !*** ./src/write/unhighlight.js ***!
  \**********************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var setClass = __webpack_require__(/*! ./set-class */ "./src/write/set-class.js");

var unhighlight = function unhighlight(klass, color) {
  if (klass === undefined) klass = "abcjs-note_selected";
  if (color === undefined) color = "#000000";
  setClass(this.elemset, "", klass, color);
};

module.exports = unhighlight;

/***/ }),

/***/ "./version.js":
/*!********************!*\
  !*** ./version.js ***!
  \********************/
/***/ (function(module) {

var version = '6.0.0-beta.33';
module.exports = version;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./index.js");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=abcjs-basic.js.map