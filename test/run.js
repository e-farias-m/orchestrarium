/* ============================================================
   Orchestrarium — test suite (plain Node, no deps)
   Run: node test/run.js
   Loads the data modules in a shared sandbox so cross-file
   globals (INSTRUMENTS, t, getLang, Graphics stubs) resolve.
   ============================================================ */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var ROOT = path.join(__dirname, '..');
var passed = 0, failed = 0;
var failures = [];

function ok(cond, label) {
  if (cond) { passed++; return; }
  failed++; failures.push(label);
  console.error('  ✗ ' + label);
}

function eq(a, b, label) {
  ok(a === b, label + ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')');
}

function section(name) { console.log('\n' + name); }

/* --- Build a browser-ish sandbox and load the browser modules --- */
function loadSandbox() {
  var store = {};
  var sandbox = {
    console: console,
    Math: Math,
    Date: Date,
    JSON: JSON,
    Promise: Promise,
    Object: Object,
    Array: Array,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    requestAnimationFrame: function (fn) { fn(); },
    localStorage: {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
      setItem: function (k, v) { store[k] = String(v); },
      removeItem: function (k) { delete store[k]; },
    },
    navigator: { language: 'en-US' },
    document: {
      documentElement: { setAttribute: function () {} },
      addEventListener: function () {},
      getElementById: function () { return null; },
      querySelectorAll: function () { return []; },
    },
    fetch: function () { return Promise.reject(new Error('no fetch in test')); },
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  vm.createContext(sandbox);

  var files = ['js/i18n.js', 'js/instruments.js'];
  files.forEach(function (f) {
    var code = fs.readFileSync(path.join(ROOT, f), 'utf8');
    vm.runInContext(code, sandbox, { filename: f });
  });
  return sandbox;
}

var S = loadSandbox();
var INSTRUMENTS = S.INSTRUMENTS;
var t = S.t;
var getLang = S.getLang;
var setLang = S.setLang;

/* ================================================================ */
section('i18n');
ok(typeof t === 'function', 't is a function');
eq(t('Close'), 'Close', 'EN passthrough for known key');
setLang('pt');
eq(t('Close'), 'Fechar', 'PT translation for known key');
eq(t('Some Unknown String'), 'Some Unknown String', 'unknown key falls back to EN source');
setLang('en');
eq(t('Close'), 'Close', 'EN restored after setLang');

/* ================================================================ */
section('Instrument roster');
eq(INSTRUMENTS.ROSTER.length, 27, 'roster has 27 instruments');
eq(INSTRUMENTS.FAMILY_ORDER.length, 5, 'five families');
eq(INSTRUMENTS.byTier(1).length, 12, 'tier 1 => 12 instruments');
eq(INSTRUMENTS.byTier(2).length, 20, 'tier 2 => 20 instruments');
eq(INSTRUMENTS.byTier(3).length, 27, 'tier 3 => 27 instruments');

var ids = INSTRUMENTS.ROSTER.map(function (r) { return r.id; });
eq(new Set(ids).size, ids.length, 'all instrument ids unique');

var tierCounts = { 1: 0, 2: 0, 3: 0 };
INSTRUMENTS.ROSTER.forEach(function (r) {
  ok(tierCounts[r.tier] !== undefined, r.id + ' has valid tier');
  tierCounts[r.tier]++;
  ok(!!INSTRUMENTS.FAMILIES[r.family], r.id + ' has valid family');
  ok(!!r.name && !!r.namePt, r.id + ' has EN + PT names');
});
eq(tierCounts[1], 12, 'exactly 12 tier-1');
eq(tierCounts[2], 8, 'exactly 8 tier-2');
eq(tierCounts[3], 7, 'exactly 7 tier-3');

eq(INSTRUMENTS.familyCount('strings', 3), 4, 'strings family has 4');
eq(INSTRUMENTS.familyCount('woodwinds', 3), 8, 'woodwinds family has 8');
eq(INSTRUMENTS.familyCount('brass', 3), 4, 'brass family has 4');
eq(INSTRUMENTS.familyCount('percussion', 3), 7, 'percussion family has 7');
eq(INSTRUMENTS.familyCount('other', 3), 4, 'other family has 4');

/* ================================================================ */
section('Violin reference detail (all tiers)');
var v = INSTRUMENTS.get('violin');
ok(!!v, 'violin exists');
ok(v.hotspots.length >= 10, 'violin has 10+ hotspots');
ok(v.hasDetail, 'violin hasDetail');
var vT1 = INSTRUMENTS.hotspotsForTier('violin', 1);
var vT2 = INSTRUMENTS.hotspotsForTier('violin', 2);
var vT3 = INSTRUMENTS.hotspotsForTier('violin', 3);
ok(vT1.length < vT2.length && vT2.length < vT3.length,
  'hotspot count grows across tiers (1<2<3)');
eq(vT3.length, v.hotspots.length, 'tier 3 sees all hotspots');

/* Every hotspot has valid coords + both languages */
v.hotspots.forEach(function (h) {
  ok(h.x >= 0 && h.x <= 100 && h.y >= 0 && h.y <= 100, 'hotspot ' + h.id + ' coords in 0-100');
  ok(!!h.label && !!h.labelPt, 'hotspot ' + h.id + ' EN+PT label');
  ok(!!h.desc && !!h.descPt, 'hotspot ' + h.id + ' EN+PT desc');
  ok(Array.isArray(h.tiers) && h.tiers.length > 0, 'hotspot ' + h.id + ' has tiers');
});

/* Facts cumulative across tiers */
eq(INSTRUMENTS.factsForTier('violin', 1).length, 2, 'violin tier1 => 2 facts');
eq(INSTRUMENTS.factsForTier('violin', 2).length, 4, 'violin tier2 => 4 facts (cumulative)');
ok(INSTRUMENTS.factsForTier('violin', 3).length > 4, 'violin tier3 => more facts');

/* Related resolve to real ids */
v.related.forEach(function (id) {
  ok(!!INSTRUMENTS.get(id), 'related id resolves: ' + id);
});
ok(!!v.excerpt && !!v.excerpt.stem, 'violin has excerpt stem');

/* ================================================================ */
section('All detailed instruments are well-formed');
var detailed = INSTRUMENTS.ROSTER.filter(function (r) {
  return INSTRUMENTS.get(r.id).hasDetail;
});
ok(detailed.length >= 10, 'at least 10 instruments have full detail (' + detailed.length + ')');
detailed.forEach(function (r) {
  var inst = INSTRUMENTS.get(r.id);
  ok(inst.facts[1] && inst.facts[1].length > 0, r.id + ' has tier-1 facts');
  inst.hotspots.forEach(function (h) {
    ok(h.x >= 0 && h.x <= 100 && h.y >= 0 && h.y <= 100,
      r.id + ' hotspot ' + h.id + ' coords valid');
  });
  inst.related.forEach(function (rel) {
    ok(!!INSTRUMENTS.get(rel), r.id + ' related ' + rel + ' resolves');
  });
});

section('Orchestra multitrack stems');
ok(INSTRUMENTS.ORCHESTRA_STEMS.length >= 8,
  'has a multitrack stem list (' + INSTRUMENTS.ORCHESTRA_STEMS.length + ')');
ok(!!INSTRUMENTS.ORCHESTRA_PREMIX, 'has a premix reference');
INSTRUMENTS.ORCHESTRA_STEMS.forEach(function (s) {
  ok(!!s.id && !!s.label && !!s.labelPt && !!s.url, 'stem ' + s.id + ' is complete');
  ok(s.url.indexOf('audio/excerpts/figaro-') === 0, 'stem ' + s.id + ' url shape');
});
detailed.forEach(function (r) {
  var inst = INSTRUMENTS.get(r.id);
  if (inst.excerpt) {
    ok(inst.excerpt.stem && inst.excerpt.stem.indexOf('audio/excerpts/') === 0,
      r.id + ' excerpt stem path');
    ok(!!inst.excerpt.stemLabel && !!inst.excerpt.stemLabelPt, r.id + ' excerpt bilingual label');
  }
});

/* ================================================================ */
section('Games logic (isolated game module)');
var gsb = loadSandbox();
/* Load graphics (stubbed for icons) + games into the same sandbox. */
var gcode = fs.readFileSync(path.join(ROOT, 'js/graphics.js'), 'utf8');
vm.runInContext(gcode, gsb, { filename: 'js/graphics.js' });
var gamesCode = fs.readFileSync(path.join(ROOT, 'js/games.js'), 'utf8');
vm.runInContext(gamesCode, gsb, { filename: 'js/games.js' });

var Games = gsb.Games;
ok(!!Games, 'Games exposes API');
eq(Games.isUnlocked('quiz'), true, 'quiz unlocked from start');
eq(Games.isUnlocked('bingo'), false, 'bingo locked with 0 explored');
eq(Games.isUnlocked('build'), false, 'build locked with 0 explored');

Games.Progress.markExplored('violin');
Games.Progress.markExplored('cello');
Games.Progress.markExplored('flute');
eq(Games.Progress.exploredCount(), 3, 'explored count = 3');
eq(Games.isUnlocked('bingo'), true, 'bingo unlocks at 3 explored');
eq(Games.isUnlocked('build'), false, 'build still locked at 3');

/* Quiz flow */
Games.start('quiz', 1);
var Quiz = Games.GAMES.quiz.api;
eq(Quiz.total, 8, 'quiz has 8 rounds');
eq(Quiz.choices.length, 4, 'quiz presents 4 choices');
ok(Quiz.choices.some(function (c) { return c.id === Quiz.answer.id; }),
  'correct answer is among the choices');
var correctId = Quiz.answer.id;
Quiz.answerWith(correctId);
eq(Quiz.state, 'reveal', 'correct answer moves to reveal');
eq(Quiz.score, 1, 'score increments on correct');

/* Bingo flow */
Games.start('bingo', 1);
var Bingo = Games.GAMES.bingo.api;
eq(Bingo.card.length, 9, 'bingo card has 9 cells');
ok(!!Bingo.currentCall(), 'bingo has a current call');
var callId = Bingo.currentCall();
Bingo.mark(callId);
ok(Bingo.marked[callId], 'marking the called cell works');

/* Build flow — needs 6 explored to unlock */
['viola', 'trumpet', 'timpani', 'piano'].forEach(function (id) {
  Games.Progress.markExplored(id);
});
eq(Games.Progress.exploredCount(), 7, 'explored count = 7');
eq(Games.isUnlocked('build'), true, 'build unlocks at 6 explored');
Games.start('build', 1);
var Build = Games.GAMES.build.api;
ok(Build.queue.length > 0 && Build.queue.length <= 10, 'build queue within 10');
var cur = Build.current();
ok(!!cur, 'build has a current instrument');
var wrongFam = cur.family === 'strings' ? 'brass' : 'strings';
eq(Build.place(wrongFam), false, 'wrong family rejected');
eq(Build.place(cur.family), true, 'correct family accepted');

/* Score stars */
eq(Games.scoreStars(8, 8), '★★★', 'perfect score = 3 stars');
eq(Games.scoreStars(0, 8), '☆☆☆', 'zero score = 0 stars');

/* ================================================================ */
section('Graphics module');
var Graphics = gsb.Graphics;
ok(!!Graphics, 'Graphics exposes API');
var svg = Graphics.instrumentSVG('violin');
ok(svg.indexOf('<svg') === 0 && svg.indexOf('</svg>') !== -1, 'violin SVG well-formed');
ok(svg.indexOf('aria-label') !== -1, 'violin SVG has aria-label');
ok(Graphics.instrumentSVG('cello').indexOf('<svg') === 0, 'cello SVG renders');
ok(Graphics.instrumentIcon('violin', 64).indexOf('<svg') === 0, 'violin icon renders');
ok(Graphics.instrumentIcon('unknown-xyz', 64).indexOf('<svg') === 0, 'unknown id → family icon');
ok(Graphics.familyIcon('brass', 40).indexOf('<svg') === 0, 'family icon renders');
var overlay = Graphics.hotspotOverlay('violin', 2);
ok(overlay.indexOf('hotspot-layer') !== -1, 'hotspot overlay renders layer');
ok(overlay.indexOf('data-action="hotspot"') !== -1, 'hotspot overlay has action buttons');
var listHtml = Graphics.hotspotList('violin', 1);
ok(listHtml.indexOf('hotspot-list') !== -1, 'hotspot list renders');
var card = Graphics.hotspotInfoCard('violin', 'bridge');
ok(card.indexOf('hotspot-info') !== -1, 'hotspot info card renders');
ok(card.indexOf('Bridge') !== -1, 'info card shows EN label');
var sizeBar = Graphics.sizeCompareBar('violin');
ok(sizeBar.indexOf('size-compare') !== -1, 'size compare bar renders');

/* ================================================================ */
section('Summary');
console.log('\n  passed: ' + passed + '   failed: ' + failed);
if (failed) {
  console.log('\n  Failures:');
  failures.forEach(function (f) { console.log('   - ' + f); });
  process.exit(1);
}
console.log('  All tests passed.\n');
