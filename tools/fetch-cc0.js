/* ============================================================
   Orchestrarium — CC0 sample fetcher (VSCO 2: Community Edition)
   The Philharmonia library never published harp, timpani, piccolo,
   glockenspiel, piano, celesta, marimba, or voice. This script
   fills those gaps from the VSCO 2: Community Edition (CC0) set
   hosted at sgossner/VSCO-2-CE, downloading one representative
   WAV per instrument and transcoding it to MP3 via ffmpeg.

   Run: node tools/fetch-cc0.js
   Idempotent: skips files that already exist.
   Requires: ffmpeg on PATH.
   ============================================================ */
'use strict';

var fs = require('fs');
var path = require('path');
var https = require('https');
var { execFileSync } = require('child_process');

var ROOT = path.join(__dirname, '..');
var OUT_DIR = path.join(ROOT, 'audio', 'samples');

var RAW = 'https://raw.githubusercontent.com/sgossner/VSCO-2-CE/master/';

/* rosterId -> chosen source WAV within the VSCO-2-CE repo.
   Notes are mid-range for a clear, representative timbre. */
var PLAN = {
  harp:         { src: 'Strings/Harp/KSHarp_A4_mf.wav',                          note: 'A4' },
  timpani:      { src: 'Percussion/Timpani/Timpani2_Hit_v4_rr1_Sum.wav',         note: 'hit' },
  glockenspiel: { src: 'Percussion/Glock/glock_medium_C6.wav',                   note: 'C6' },
  marimba:      { src: 'Percussion/Marimba/Marimba_hit_Outrigger_C4_loud_01.wav', note: 'C4' },
  piccolo:      { src: 'Woodwinds/Piccolo/Sus/piccolo_C6_sustain1.wav',          note: 'C6' },
  piano:        { src: 'Keys/Upright Piano/Player_dyn1_rr1_038.wav',             note: 'B3' },
};

function download(url, dest) {
  return new Promise(function (resolve, reject) {
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
    req.setTimeout(120000, function () { req.destroy(new Error('timeout ' + url)); });
  });
}

function toMp3(wavPath, mp3Path) {
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-i', wavPath,
    '-codec:a', 'libmp3lame', '-qscale:a', '4',
    mp3Path,
  ], { stdio: 'inherit' });
}

function encodePath(p) {
  return p.split('/').map(encodeURIComponent).join('/');
}

(async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  var ids = Object.keys(PLAN);
  var ok = 0, skip = 0, fail = 0;

  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    var dest = path.join(OUT_DIR, id + '.mp3');
    if (fs.existsSync(dest)) { console.log('SKIP ' + id + ' (exists)'); skip++; continue; }

    var tmpWav = path.join(OUT_DIR, id + '.src.wav');
    try {
      await download(RAW + encodePath(PLAN[id].src), tmpWav);
      toMp3(tmpWav, dest);
      fs.unlinkSync(tmpWav);
      var sz = fs.statSync(dest).size;
      console.log('OK   ' + id + '  <- ' + PLAN[id].src + '  (' + Math.round(sz / 1024) + ' KB)');
      ok++;
    } catch (e) {
      if (fs.existsSync(tmpWav)) { try { fs.unlinkSync(tmpWav); } catch (_) {} }
      console.log('FAIL ' + id + ': ' + e.message);
      fail++;
    }
  }

  console.log('\nDone. ok=' + ok + ' skip=' + skip + ' fail=' + fail);
  if (fail) process.exit(1);
})();
