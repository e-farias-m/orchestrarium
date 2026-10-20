/* ============================================================
   Orchestrarium — Wayback audio fetcher
   The original philharmonia.co.uk sample URLs are 404 now, but
   the Wayback Machine has archived them. This queries the CDX
   API for each remaining instrument, picks the best sample with
   the same scoring rules as fetch-samples.js, and downloads it
   via the id_ raw-content endpoint.

   Run: node tools/fetch-wayback.js
   ============================================================ */
'use strict';

var fs = require('fs');
var path = require('path');
var https = require('https');

var ROOT = path.join(__dirname, '..');
var OUT_DIR = path.join(ROOT, 'audio', 'samples');

var INSTS = ['violin', 'viola', 'trumpet', 'tuba', 'harp', 'timpani'];

var NOTE_RE = /^[a-z-]+_([A-Gs]{1,2})(\d)_/;

function scoreFile(name) {
  var m = name.match(NOTE_RE);
  var oct = m ? parseInt(m[2], 10) : 4;
  var s = 0;
  s -= Math.abs(oct - 4) * 10;
  if (/_phrase_/.test(name)) s += 100;
  else if (/_very-long_/.test(name)) s += 60;
  else if (/_long_/.test(name)) s += 80;
  else if (/_1_/.test(name)) s += 30;
  else if (/_15_/.test(name)) s += 20;
  else if (/_05_/.test(name)) s += 10;
  if (/_normal\.mp3$/.test(name)) s += 40;
  if (/mute|gliss|tremolo|harmonic|pizz|scrap|rute|brush|stick|mallet|damped|rim/.test(name)) s -= 60;
  if (/struck|roll|arco|normal|rhythm/.test(name)) s += 25;
  if (/_forte_/.test(name)) s += 20;
  else if (/_mezzo-forte_/.test(name)) s += 15;
  else if (/_mezzo-piano_/.test(name)) s += 8;
  else if (/_piano_/.test(name)) s += 5;
  else if (/_pianissimo_/.test(name)) s -= 15;
  return s;
}

function get(url, opts) {
  opts = opts || {};
  return new Promise(function (resolve, reject) {
    var req = https.get(url, { headers: { 'User-Agent': 'orchestrarium-asset-fetch' } }, function (res) {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(get(res.headers.location, opts));
        return;
      }
      if (res.statusCode !== 200) { reject(new Error('HTTP ' + res.statusCode + ' ' + url)); return; }
      var chunks = [];
      res.on('data', function (c) { chunks.push(c); });
      res.on('end', function () { resolve(Buffer.concat(chunks)); });
    });
    req.on('error', reject);
    req.setTimeout(90000, function () { req.destroy(new Error('timeout ' + url)); });
  });
}

async function cdxList(inst) {
  var url = 'https://web.archive.org/cdx/search/cdx?url=philharmonia.co.uk/assets/audio/samples/' +
    inst + '/*&output=text&fl=original&collapse=urlkey&limit=2000';
  var buf = await get(url);
  return buf.toString('utf8').split('\n')
    .map(function (l) { return l.trim(); })
    .filter(Boolean)
    .filter(function (u) { return /\.mp3$/.test(u); });
}

(async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  var ok = 0, skip = 0, fail = 0;

  for (var i = 0; i < INSTS.length; i++) {
    var inst = INSTS[i];
    var dest = path.join(OUT_DIR, inst + '.mp3');
    if (fs.existsSync(dest)) { console.log('SKIP ' + inst + ' (exists)'); skip++; continue; }

    try {
      var urls = await cdxList(inst);
      if (!urls.length) { console.log('MISS ' + inst + ' (no archived files)'); fail++; continue; }

      /* Rank by basename score */
      var ranked = urls.map(function (u) {
        var base = u.substring(u.lastIndexOf('/') + 1);
        var canonical = base.replace(new RegExp('^' + inst.replace(/-/g, '-') + '_'), inst + '_');
        return { url: u, base: base, score: scoreFile(canonical) };
      }).sort(function (a, b) { return b.score - a.score; });

      /* Try the top few until one downloads */
      var saved = false;
      for (var k = 0; k < Math.min(ranked.length, 6); k++) {
        var raw = 'https://web.archive.org/web/2020id_/' + ranked[k].url;
        try {
          var data = await get(raw);
          if (data.length < 2000) continue; /* placeholder/redirect stub */
          fs.writeFileSync(dest, data);
          console.log('OK   ' + inst + '  <- ' + ranked[k].base + '  (' + Math.round(data.length / 1024) + ' KB)');
          saved = true; ok++;
          break;
        } catch (e) {
          /* try next candidate */
        }
      }
      if (!saved) { console.log('FAIL ' + inst + ' (no candidate downloaded)'); fail++; }
    } catch (e) {
      console.log('FAIL ' + inst + ': ' + e.message);
      fail++;
    }
  }

  console.log('\nDone. ok=' + ok + ' skip=' + skip + ' fail=' + fail);
  if (fail) process.exit(1);
})();
