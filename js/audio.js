/* ============================================================
   Orchestrarium — Audio Engine
   Two layers:
     1. Synth  — Web Audio procedural voices per instrument family
                 (works offline, no assets, instant).
     2. Samples — real Philharmonia recordings loaded on demand
                 from audio/samples/<id>.mp3, cached in memory.
   Plus Figaro orchestral excerpts with individual stem playback
   (mute/unmute per instrument) for higher tiers.
   Exposes window.Audio.
   ============================================================ */
(function () {
  'use strict';

  var Audio = {
    ctx: null,
    master: null,
    ready: false,
    muted: false,
    volume: 0.8,

    /* Sample cache: id -> { buffer, loading, error } */
    _samples: {},
    /* Decoded excerpt cache */
    _excerpts: {},
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
  };

  function sampleExists(id) { return !!WITH_SAMPLES[id]; }

  /* ================================================================
     ORCHESTRAL EXCERPTS (Figaro) with per-stem control
     ================================================================ */
  function loadExcerpt(url) {
    if (Audio._excerpts[url]) return Promise.resolve(Audio._excerpts[url]);
    var ctx = ensureCtx();
    if (!ctx) return Promise.reject(new Error('no audio context'));
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.arrayBuffer();
      })
      .then(function (ab) { return ctx.decodeAudioData(ab); })
      .then(function (buf) {
        Audio._excerpts[url] = buf;
        return buf;
      });
  }

  /**
   * Play an orchestral excerpt, optionally muting/soloing stems.
   * @param {string} url - premix or stem URL
   * @param {object} [opts] - { start, gain }
   * @returns {Promise}
   */
  function playExcerpt(url, opts) {
    opts = opts || {};
    ensureCtx(); resume();
    stopAll();
    return loadExcerpt(url).then(function (buf) {
      var node = playBuffer(buf, Audio.ctx.currentTime + 0.02,
        opts.gain == null ? 0.85 : opts.gain);
      Audio._current = node;
      Audio._currentType = 'excerpt';
      return node;
    });
  }

  /**
   * Play a specific instrument's stem against the excerpt (solo/featured).
   * @param {string} instrumentId
   */
  function playStem(instrumentId) {
    var inst = INSTRUMENTS.get(instrumentId);
    if (!inst || !inst.excerpt) return Promise.resolve();
    return playExcerpt(inst.excerpt.stem, { gain: 1 });
  }

  /**
   * Play all Figaro stems together (full orchestral texture),
   * silent-until-ready. Stems are optional; missing ones are skipped.
   * @param {Array<string>} stemUrls
   * @param {object} [muteMap] - { url: true } to mute
   */
  function playStems(stemUrls, muteMap) {
    ensureCtx(); resume();
    stopAll();
    muteMap = muteMap || {};
    var ctx = Audio.ctx;
    var startAt = ctx.currentTime + 0.08;
    return Promise.all(stemUrls.map(function (url) {
      return loadExcerpt(url).catch(function () { return null; });
    })).then(function (buffers) {
      var nodes = [];
      for (var i = 0; i < buffers.length; i++) {
        if (!buffers[i]) continue;
        var muted = !!muteMap[stemUrls[i]];
        var node = playBuffer(buffers[i], startAt, muted ? 0 : 0.8);
        nodes.push({ url: stemUrls[i], node: node, muted: muted });
      }
      Audio._currentStems = nodes;
      return nodes;
    });
  }

  function setStemMuted(url, muted) {
    for (var i = 0; i < Audio._currentStems.length; i++) {
      if (Audio._currentStems[i].url === url) {
        Audio._currentStems[i].node.gain.gain.value = muted ? 0 : 0.8;
        Audio._currentStems[i].muted = muted;
      }
    }
  }

  /* ================================================================
     PLAYBACK CONTROL
     ================================================================ */
  function stop() {
    if (Audio._current && Audio._current.src) {
      try { Audio._current.src.stop(); } catch (e) {}
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
