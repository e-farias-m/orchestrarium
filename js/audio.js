/* ============================================================
   Orchestrarium — Audio Engine
   Two layers:
     1. Synth  — Web Audio procedural voices per instrument family
                 (works offline, no assets, instant).
     2. Samples — real Philharmonia recordings loaded on demand
                 from audio/samples/<id>.mp3, cached in memory.
   Plus Figaro orchestral excerpts with individual stem playback
   (mute/unmute per instrument) for higher tiers, streamed via native
   <audio> elements to keep memory small.
   Exposes window.Audio.
   ============================================================ */
(function () {
  'use strict';

  /* Save native Audio constructor before overwriting window.Audio */
  var NativeAudio = (typeof window !== 'undefined' && window.Audio) ? window.Audio : (typeof Audio !== 'undefined' ? Audio : null);

  var Audio = {
    ctx: null,
    master: null,
    ready: false,
    muted: false,
    volume: 0.8,

    /* Sample cache: id -> { buffer, loading, error } */
    _samples: {},
    _current: null,
    _currentStems: [],
  };

  /* --- Context bootstrap (lazy, on first user gesture) --- */
  function ensureCtx() {
    if (Audio.ctx) return Audio.ctx;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    Audio.ctx = new Ctx();
    Audio.master = Audio.ctx.createGain();
    Audio.master.gain.value = Audio.muted ? 0 : Audio.volume;
    Audio.master.connect(Audio.ctx.destination);
    Audio.ready = true;
    return Audio.ctx;
  }

  function resume() {
    if (Audio.ctx && Audio.ctx.state === 'suspended') {
      Audio.ctx.resume();
    }
  }

  function setVolume(v) {
    Audio.volume = Math.max(0, Math.min(1, v));
    if (Audio.master) Audio.master.gain.value = Audio.muted ? 0 : Audio.volume;
  }

  function setMuted(m) {
    Audio.muted = !!m;
    if (Audio.master) Audio.master.gain.value = Audio.muted ? 0 : Audio.volume;
  }

  /* ================================================================
     PROCEDURAL SYNTH VOICES
     Each returns a short musical phrase (2-3s) demonstrating timbre.
     ================================================================ */

  /* Note frequencies (A4 = 440) */
  function freq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /* Envelope helper */
  function env(gainNode, t0, attack, decay, sustain, release, peak, duration) {
    var g = gainNode.gain;
    g.cancelScheduledValues(t0);
    g.setValueAtTime(0.0001, t0);
    g.exponentialRampToValueAtTime(peak, t0 + attack);
    g.exponentialRampToValueAtTime(sustain, t0 + attack + decay);
    g.setValueAtTime(sustain, t0 + duration - release);
    g.exponentialRampToValueAtTime(0.0001, t0 + duration);
  }

  /* --- Strings: sawtooth through lowpass, slow bow attack --- */
  function playStrings(rootMidi, duration) {
    var ctx = ensureCtx(); if (!ctx) return;
    var t0 = ctx.currentTime + 0.02;
    var notes = [0, 4, 7, 12]; /* major arpeggio */
    for (var i = 0; i < notes.length; i++) {
      var start = t0 + i * (duration / notes.length) * 0.7;
      var osc = ctx.createOscillator();
      var osc2 = ctx.createOscillator();
      var filter = ctx.createBiquadFilter();
      var gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc.frequency.value = freq(rootMidi + notes[i]);
      osc2.frequency.value = freq(rootMidi + notes[i]) * 1.005;
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, start);
      filter.frequency.linearRampToValueAtTime(2200, start + 0.3);
      filter.Q.value = 1.2;
      var dur = duration * 0.7;
      env(gain, start, 0.18, 0.1, 0.28, 0.3, 0.22, dur);
      osc.connect(filter); osc2.connect(filter);
      filter.connect(gain); gain.connect(Audio.master);
      osc.start(start); osc2.start(start);
      osc.stop(start + dur + 0.1); osc2.stop(start + dur + 0.1);
    }
  }

  /* --- Woodwind (flute-ish): sine + slight breath noise --- */
  function playWoodwind(rootMidi, duration) {
    var ctx = ensureCtx(); if (!ctx) return;
    var t0 = ctx.currentTime + 0.02;
    var notes = [0, 2, 4, 7, 12];
    for (var i = 0; i < notes.length; i++) {
      var start = t0 + i * (duration / notes.length) * 0.6;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq(rootMidi + notes[i]);
      var dur = duration * 0.35;
      env(gain, start, 0.04, 0.05, 0.4, 0.15, 0.3, dur);
      osc.connect(gain); gain.connect(Audio.master);
      osc.start(start); osc.stop(start + dur + 0.05);
    }
  }

  /* --- Brass: square with bright attack and raucous harmonics --- */
  function playBrass(rootMidi, duration) {
    var ctx = ensureCtx(); if (!ctx) return;
    var t0 = ctx.currentTime + 0.02;
    var notes = [0, 4, 7, 12, 7];
    for (var i = 0; i < notes.length; i++) {
      var start = t0 + i * (duration / notes.length) * 0.6;
      var osc = ctx.createOscillator();
      var filter = ctx.createBiquadFilter();
      var gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq(rootMidi + notes[i]);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, start);
      filter.frequency.linearRampToValueAtTime(3200, start + 0.12);
      var dur = duration * 0.4;
      env(gain, start, 0.03, 0.08, 0.35, 0.14, 0.18, dur);
      osc.connect(filter); filter.connect(gain); gain.connect(Audio.master);
      osc.start(start); osc.stop(start + dur + 0.05);
    }
  }

  /* --- Percussion: filtered noise burst + pitched thump --- */
  function noiseBuffer(ctx, seconds) {
    var len = Math.floor(ctx.sampleRate * seconds);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function playPercussion(rootMidi, duration) {
    var ctx = ensureCtx(); if (!ctx) return;
    var t0 = ctx.currentTime + 0.02;
    var hits = [0, 0.18, 0.42, 0.6];
    for (var i = 0; i < hits.length; i++) {
      var start = t0 + hits[i] * duration;
      /* Noise component */
      var src = ctx.createBufferSource();
      src.buffer = noiseBuffer(ctx, 0.25);
      var nf = ctx.createBiquadFilter();
      nf.type = 'bandpass';
      nf.frequency.value = 1800;
      nf.Q.value = 0.9;
      var ng = ctx.createGain();
      env(ng, start, 0.002, 0.04, 0.0001, 0.05, 0.5, 0.18);
      src.connect(nf); nf.connect(ng); ng.connect(Audio.master);
      src.start(start); src.stop(start + 0.25);

      /* Pitched thump */
      var osc = ctx.createOscillator();
      var og = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq(rootMidi), start);
      osc.frequency.exponentialRampToValueAtTime(freq(rootMidi) * 0.5, start + 0.15);
      env(og, start, 0.002, 0.06, 0.0001, 0.06, 0.4, 0.22);
      osc.connect(og); og.connect(Audio.master);
      osc.start(start); osc.stop(start + 0.24);
    }
  }

  /* --- Other (piano/harp/voice): triangle arpeggio --- */
  function playOther(rootMidi, duration) {
    var ctx = ensureCtx(); if (!ctx) return;
    var t0 = ctx.currentTime + 0.02;
    var notes = [0, 4, 7, 11, 12, 7, 4];
    for (var i = 0; i < notes.length; i++) {
      var start = t0 + i * (duration / notes.length) * 0.55;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq(rootMidi + notes[i]);
      var dur = duration * 0.5;
      env(gain, start, 0.006, 0.2, 0.15, 0.25, 0.3, dur);
      osc.connect(gain); gain.connect(Audio.master);
      osc.start(start); osc.stop(start + dur + 0.1);
    }
  }

  var SYNTH = {
    strings: { fn: playStrings, root: 55 },      /* G3 */
    flute: { fn: playWoodwind, root: 72 },        /* C5 */
    woodwind: { fn: playWoodwind, root: 60 },     /* C4 */
    brass: { fn: playBrass, root: 55 },           /* G3 */
    percussion: { fn: playPercussion, root: 43 }, /* G2 */
    voice: { fn: playOther, root: 60 },
    other: { fn: playOther, root: 60 },
  };

  /**
   * Play a synthesized demonstration of an instrument.
   * @param {string} instrumentId
   */
  function playSynth(instrumentId) {
    var inst = INSTRUMENTS.get(instrumentId);
    if (!inst) return;
    ensureCtx(); resume();
    var type = (inst.synth && inst.synth.type) || 'other';
    var voice = SYNTH[type] || SYNTH.other;
    stop();
    voice.fn(voice.root, 2.4);
  }

  /* ================================================================
     SAMPLE LOADER (Philharmonia recordings)
     ================================================================ */
  function samplePath(id) {
    return 'audio/samples/' + id + '.mp3';
  }

  /**
   * Load (and decode) a sample into the cache. Returns a Promise.
   * @param {string} id
   */
  function loadSample(id) {
    var rec = Audio._samples[id];
    if (rec && rec.buffer) return Promise.resolve(rec.buffer);
    if (rec && rec.loading) return rec.loading;

    var ctx = ensureCtx();
    if (!ctx) return Promise.reject(new Error('no audio context'));

    var entry = Audio._samples[id] = { buffer: null, loading: null, error: null };
    entry.loading = fetch(samplePath(id))
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.arrayBuffer();
      })
      .then(function (ab) { return ctx.decodeAudioData(ab); })
      .then(function (buf) {
        entry.buffer = buf;
        entry.loading = null;
        return buf;
      })
      .catch(function (err) {
        entry.error = err;
        entry.loading = null;
        throw err;
      });
    return entry.loading;
  }

  function playBuffer(buffer, when, gainTo) {
    var ctx = ensureCtx(); if (!ctx) return null;
    var src = ctx.createBufferSource();
    src.buffer = buffer;
    var gain = ctx.createGain();
    gain.gain.value = (gainTo == null ? 1 : gainTo);
    src.connect(gain); gain.connect(Audio.master);
    src.start(when || ctx.currentTime);
    return { src: src, gain: gain };
  }

  /**
   * Play the real sample for an instrument, falling back to synth.
   * @param {string} instrumentId
   * @returns {Promise}
   */
  function playSample(instrumentId) {
    ensureCtx(); resume();
    stop();
    return loadSample(instrumentId).then(function (buf) {
      var node = playBuffer(buf, Audio.ctx.currentTime + 0.02, 0.9);
      Audio._current = node;
      Audio._currentType = 'sample';
      return node;
    }).catch(function () {
      /* No sample asset yet — fall back to synthesis */
      playSynth(instrumentId);
    });
  }

  /**
   * Prefer sample, fall back to synth automatically.
   * Used by detail-screen "Hear it!".
   */
  function hearIt(instrumentId) {
    var hasSample = sampleExists(instrumentId);
    return hasSample ? playSample(instrumentId) : Promise.resolve(playSynth(instrumentId));
  }

  /* Track which instruments have real sample assets shipped.
     Must stay in sync with audio/samples/manifest.json. */
  var WITH_SAMPLES = {
    violin: true, viola: true, cello: true, 'double-bass': true,
    flute: true, oboe: true, clarinet: true, bassoon: true,
    'alto-sax': true, 'english-horn': true, 'bass-clarinet': true,
    trumpet: true, 'french-horn': true, trombone: true, tuba: true,
    'snare-drum': true, triangle: true, 'bass-drum': true, 'tam-tam': true,
    harp: true, timpani: true, piccolo: true, glockenspiel: true,
    piano: true, marimba: true,
  };

  function sampleExists(id) { return !!WITH_SAMPLES[id]; }

  /* ================================================================
     ORCHESTRAL EXCERPTS (Figaro) with per-stem control
     ----------------------------------------------------------------
     Long (4 min) multitrack stems are played through native <audio>
     elements, NOT decoded into Web Audio buffers. Decoding would hold
     ~45 MB of PCM per stem (~600 MB for the 13-stem mixer) in memory;
     <audio> streams from disk/network and is evicted by the browser,
     keeping the footprint tiny on low-end K-8 devices.
     Trade-off: stems start within a few ms of each other rather than
     sample-accurate — imperceptible for listening/mute demos.
     ================================================================ */
  var EXCERPT_BASE_VOLUME = 0.8;

  function makeStemEl(url) {
    var el = new NativeAudio(url);
    el.preload = 'auto';
    el.crossOrigin = 'anonymous';
    el.volume = EXCERPT_BASE_VOLUME;
    return el;
  }

  /**
   * Play a single orchestral stem/excerpt (featured or premix).
   * @param {string} url - premix or stem URL
   * @returns {Promise}
   */
  function playExcerpt(url) {
    stopAll();
    var el = makeStemEl(url);
    Audio._current = el;
    Audio._currentType = 'excerpt';
    Audio._currentStems = [{ url: url, el: el, muted: false }];
    var p = el.play();
    return p && p.catch ? p.catch(function () {}) : Promise.resolve();
  }

  /**
   * Play a specific instrument's stem against the excerpt (solo/featured).
   * @param {string} instrumentId
   */
  function playStem(instrumentId) {
    var inst = INSTRUMENTS.get(instrumentId);
    if (!inst || !inst.excerpt) return Promise.resolve();
    return playExcerpt(inst.excerpt.stem);
  }

  /**
   * Play all Figaro stems together (full orchestral texture).
   * Stems are lazy: only the ones not muted are loaded and played.
   * @param {Array<string>} stemUrls
   * @param {object} [muteMap] - { url: true } to mute
   */
  function playStems(stemUrls, muteMap) {
    stopAll();
    muteMap = muteMap || {};
    var nodes = [];
    stemUrls.forEach(function (url) {
      var muted = !!muteMap[url];
      var el = makeStemEl(url);
      el.volume = muted ? 0 : EXCERPT_BASE_VOLUME;
      nodes.push({ url: url, el: el, muted: muted });
      if (!muted) {
        var p = el.play();
        if (p && p.catch) p.catch(function () {});
      }
    });
    Audio._currentStems = nodes;
    return Promise.resolve(nodes);
  }

  /* Current playback position across the stem set (from any live element). */
  function stemClock() {
    for (var i = 0; i < Audio._currentStems.length; i++) {
      var el = Audio._currentStems[i].el;
      if (el && !el.paused && el.currentTime > 0) return el.currentTime;
    }
    return 0;
  }

  function setStemMuted(url, muted) {
    for (var i = 0; i < Audio._currentStems.length; i++) {
      var s = Audio._currentStems[i];
      if (s.url === url) {
        s.muted = muted;
        s.el.volume = muted ? 0 : EXCERPT_BASE_VOLUME;
        if (!muted && s.el.paused) {
          /* Re-sync a previously-muted element to the running stems
             before it starts, so unmuting doesn't jump to the top. */
          var t = stemClock();
          if (t > 0) {
            try { s.el.currentTime = t; } catch (e) {}
          }
          var p = s.el.play();
          if (p && p.catch) p.catch(function () {});
        }
      }
    }
  }

  /* ================================================================
     PLAYBACK CONTROL
     ================================================================ */
  function stop() {
    if (Audio._current && Audio._current.src) {
      /* Web Audio buffer source */
      try { Audio._current.src.stop(); } catch (e) {}
    } else if (Audio._current && Audio._current.pause) {
      /* native <audio> element */
      try { Audio._current.pause(); Audio._current.currentTime = 0; } catch (e) {}
    }
    Audio._current = null;
    Audio._currentType = null;
  }

  function stopAll() {
    stop();
    for (var i = 0; i < Audio._currentStems.length; i++) {
      var s = Audio._currentStems[i];
      if (s && s.node && s.node.src) {
        try { s.node.src.stop(); } catch (e) {}
      } else if (s && s.el && s.el.pause) {
        try { s.el.pause(); s.el.currentTime = 0; } catch (e) {}
      }
    }
    Audio._currentStems = [];
  }

  /* ================================================================
     OFFLINE PRE-CACHE
     Called from Settings → "Download for offline use".
     Fetches + decodes all shipped samples so they live in Cache API.
     ================================================================ */
  function precacheAll(onProgress) {
    var ids = Object.keys(WITH_SAMPLES).filter(function (id) { return WITH_SAMPLES[id]; });
    var done = 0;
    function tick() { done++; if (onProgress) onProgress(done, ids.length); }
    return Promise.all(ids.map(function (id) {
      return loadSample(id).then(tick).catch(tick);
    }));
  }

  /* --- Public API --- */
  Audio.init = ensureCtx;
  Audio.resume = resume;
  Audio.play = playSynth;
  Audio.playSynth = playSynth;
  Audio.playSample = playSample;
  Audio.hearIt = hearIt;
  Audio.playExcerpt = playExcerpt;
  Audio.playStem = playStem;
  Audio.playStems = playStems;
  Audio.setStemMuted = setStemMuted;
  Audio.stop = stop;
  Audio.stopAll = stopAll;
  Audio.setVolume = setVolume;
  Audio.setMuted = setMuted;
  Audio.loadSample = loadSample;
  Audio.sampleExists = sampleExists;
  Audio.precacheAll = precacheAll;
  Audio.WITH_SAMPLES = WITH_SAMPLES;

  if (typeof window !== 'undefined') window.Audio = Audio;
  if (typeof module !== 'undefined' && module.exports) module.exports = Audio;
})();
