/* ============================================================
   Orchestrarium — audio asset fetcher
   Downloads one representative sample per instrument from the
   skratchdot/philharmonia-samples GitHub mirror (CC BY-SA 3.0)
   and writes it as audio/samples/<rosterId>.mp3.

   Run: node tools/fetch-samples.js
   Idempotent: skips files that already exist.
   ============================================================ */
'use strict';

var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var OUT_DIR = path.join(ROOT, 'audio', 'samples');
var TREE = require('/tmp/phil_tree.json');

var RAW = 'https://raw.githubusercontent.com/skratchdot/philharmonia-samples/gh-pages/';

/* rosterId -> { folder, accept: fn(filename) }
   accept() picks from the mirror's files for that folder. */
var PLAN = {
  cello:       { folder: 'cello' },
  'double-bass': { folder: 'double bass' },
  flute:       { folder: 'flute' },
  clarinet:    { folder: 'clarinet' },
  oboe:        { folder: 'oboe' },
  bassoon:     { folder: 'bassoon' },
  'alto-sax':  { folder: 'saxophone' },
  'english-horn': { folder: 'cor anglais' },
  'bass-clarinet': { folder: 'bass clarinet' },
  'french-horn': { folder: 'french horn' },
  trombone:    { folder: 'trombone' },
  'snare-drum': { folder: 'percussion/snare drum' },
  triangle:    { folder: 'percussion/triangle' },
  'bass-drum': { folder: 'percussion/bass drum' },
  'tam-tam':   { folder: 'percussion/tam-tam' },
};

/* Note ranking: prefer these octaves (mid-range, clear timbre). */
var NOTE_RE = /^[a-z-]+_([A-Gs]{1,2})(\d)_/;

function scoreFile(name) {
  /* Higher score = better candidate. */
  var m = name.match(NOTE_RE);
  var oct = m ? parseInt(m[2], 10) : 4;
  var s = 0;

  /* Prefer medium octaves */
  s -= Math.abs(oct - 4) * 10;

  /* Prefer phrase > long > very-long > short bursts */
  if (/_phrase_/.test(name)) s += 100;
  else if (/_very-long_/.test(name)) s += 60;
  else if (/_long_/.test(name)) s += 80;
  else if (/_1_/.test(name)) s += 30;      /* 1s note */
  else if (/_15_/.test(name)) s += 20;
  else if (/_05_/.test(name)) s += 10;

  /* Prefer normal articulation, not tremolo/mute/glissando */
  if (/_normal\.mp3$/.test(name)) s += 40;
  if (/mute|gliss|tremolo|harmonic|pizz|scrap|rute|brush|stick|mallet|damped|rim/.test(name)) s -= 60;

  /* Prefer struck/arco/sustained percussion-like articulations */
  if (/struck|roll|arco|normal|rhythm/.test(name)) s += 25;

  /* Prefer forte/mezzo-forte for clarity */
  if (/_forte_/.test(name)) s += 20;
  else if (/_mezzo-forte_/.test(name)) s += 15;
  else if (/_mezzo-piano_/.test(name)) s += 8;
  else if (/_piano_/.test(name)) s += 5;
  else if (/_pianissimo_/.test(name)) s -= 15;

  return s;
}

function pick(folder) {
  var prefix = 'audio/' + folder + '/';
  var files = TREE.tree
    .filter(function (x) { return x.type === 'blob' && x.path.indexOf(prefix) === 0; })
    .map(function (x) { return x.path.substring(prefix.length); })
    .filter(function (n) { return /\.mp3$/.test(n); });

  if (!files.length) return null;
  files.sort(function (a, b) { return scoreFile(b) - scoreFile(a); });
  return { rel: prefix + files[0], name: files[0] };
}

function download(url, dest) {
  return new Promise(function (resolve, reject) {
    var https = require('https');
    var req = https.get(url, { headers: { 'User-Agent': 'orchestrarium-asset-fetch' } }, function (res) {
      if (res.statusCode !== 200) { reject(new Error('HTTP ' + res.statusCode + ' ' + url)); return; }
      var tmp = dest + '.part';
      var ws = fs.createWriteStream(tmp);
      res.pipe(ws);
      ws.on('finish', function () {
        ws.close(function () { fs.renameSync(tmp, dest); resolve(); });
      });
      ws.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(60000, function () { req.destroy(new Error('timeout ' + url)); });
  });
}

(async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  var man = [];
  var ids = Object.keys(PLAN);
  var ok = 0, skip = 0, fail = 0;

  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    var dest = path.join(OUT_DIR, id + '.mp3');
    if (fs.existsSync(dest)) {
      console.log('SKIP ' + id + ' (exists)');
      skip++;
      continue;
    }
    var chosen = pick(PLAN[id].folder);
    if (!chosen) { console.log('MISS ' + id + ' (no file in ' + PLAN[id].folder + ')'); fail++; continue; }
    try {
      await download(RAW + chosen.rel.replace(/ /g, '%20'), dest);
      var sz = fs.statSync(dest).size;
      console.log('OK   ' + id + '  <- ' + chosen.name + '  (' + Math.round(sz / 1024) + ' KB)');
      man.push({ id: id, source: 'philharmonia', file: chosen.name, license: 'CC BY-SA 3.0' });
      ok++;
    } catch (e) {
      console.log('FAIL ' + id + ': ' + e.message);
      fail++;
    }
  }

  /* Persist a provenance manifest for the credits page */
  var manPath = path.join(ROOT, 'audio', 'samples', 'manifest.json');
  var existing = [];
  if (fs.existsSync(manPath)) {
    try { existing = JSON.parse(fs.readFileSync(manPath, 'utf8')); } catch (e) {}
  }
  var merged = existing.concat(man);
  fs.writeFileSync(manPath, JSON.stringify(merged, null, 2));

  console.log('\nDone. ok=' + ok + ' skip=' + skip + ' fail=' + fail);
  if (fail) process.exit(1);
})();
