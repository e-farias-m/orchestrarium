/* ============================================================
   Orchestrarium — Figaro overture excerpt fetcher

   The only public source of Mozart's Marriage of Figaro Overture
   multitracks is a 2.6 GB Pro Tools session ZIP on the Internet
   Archive (CC0). Rather than download the whole archive, this
   script range-reads the ZIP's central directory, extracts just
   the movement-02 (Overture) stems we need, inflates them, and
   transcodes each to a small mono MP3 for the web app.

   Source: archive.org/details/musopen-mozart-marriage-of-figaro-compressed
   License: CC0 (Musopen).

   Run: node tools/fetch-excerpts.js
   Idempotent: skips files that already exist.
   Requires: ffmpeg on PATH.
   ============================================================ */
'use strict';

var fs = require('fs');
var path = require('path');
var https = require('https');
var zlib = require('zlib');
var { execFileSync } = require('child_process');

var ROOT = path.join(__dirname, '..');
var OUT_DIR = path.join(ROOT, 'audio', 'excerpts');

var ITEM = 'musopen-mozart-marriage-of-figaro-compressed';
var ZIP = 'Mozart_-_Marriage_Of_Figaro.zip';
var BASE = 'https://archive.org/download/' + ITEM + '/' + ZIP;
var CD_TAIL = 2000000; /* bytes from the end that hold the EOCD + central dir */

/* rosterId -> source stem basename (movement 02 = the Overture).
   Stereo L/R stems are mixed down to mono by ffmpeg. */
var STEMS = {
  violin:        '1st violin F_02.wav',
  viola:         'viola F_02.wav',
  cello:         'celli F_01.wav',
  'double-bass': 'DB_02 L.wav',
  flute:         'flute_02 L.wav',
  oboe:          'oboe_02 L.wav',
  clarinet:      'clarinet_02.wav',
  bassoon:       'bassoon_01.wav',
  'french-horn': 'horn_02 L.wav',
  trumpet:       'trumpet_02.wav',
  timpani:       'timpani_02 L.wav',
  percussion:    'surr_02 L.wav',
  premix:        'premix_02.L.wav',
};

function request(url, headers) {
  return new Promise(function (resolve, reject) {
    var req = https.get(url, { headers: headers || {} }, function (res) {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(request(res.headers.location, headers));
        return;
      }
      if (res.statusCode !== 200 && res.statusCode !== 206) {
        reject(new Error('HTTP ' + res.statusCode + ' ' + url));
        return;
      }
      var chunks = [];
      res.on('data', function (c) { chunks.push(c); });
      res.on('end', function () { resolve(Buffer.concat(chunks)); });
    });
    req.on('error', reject);
    req.setTimeout(300000, function () { req.destroy(new Error('timeout ' + url)); });
  });
}

function range(start, end) {
  return request(BASE, { Range: 'bytes=' + start + '-' + end });
}

function contentLength() {
  return request(BASE, { Range: 'bytes=0-0' }).then(function () {
    return new Promise(function (resolve, reject) {
      var req = https.get(BASE, { method: 'HEAD' }, function (res) {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          var r2 = https.get(res.headers.location, { method: 'HEAD' }, function (res2) {
            resolve(parseInt(res2.headers['content-length'], 10));
          });
          r2.on('error', reject);
          return;
        }
        resolve(parseInt(res.headers['content-length'], 10));
      });
      req.on('error', reject);
    });
  });
}

/* Parse central directory entries: { name, csize, usize, lho } */
function parseCentralDir(buf) {
  var i = buf.indexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (i < 0) throw new Error('EOCD not found');
  var cdSize = buf.readUInt32LE(i + 12);
  var cdOff = buf.readUInt32LE(i + 16);
  return { cdSize: cdSize, cdOff: cdOff };
}

function parseEntries(buf) {
  var out = [];
  var i = 0;
  while (i < buf.length - 4 && buf.readUInt32LE(i) === 0x02014b50) {
    var csize = buf.readUInt32LE(i + 20);
    var usize = buf.readUInt32LE(i + 24);
    var nlen = buf.readUInt16LE(i + 28);
    var elen = buf.readUInt16LE(i + 30);
    var clen = buf.readUInt16LE(i + 32);
    var lho = buf.readUInt32LE(i + 42);
    var name = buf.toString('utf8', i + 46, i + 46 + nlen);
    out.push({ name: name, csize: csize, usize: usize, lho: lho });
    i += 46 + nlen + elen + clen;
  }
  return out;
}

function inflateEntry(entry) {
  return range(entry.lho, entry.lho + 30 + 2000 - 1).then(function (head) {
    var nlen = head.readUInt16LE(26);
    var elen = head.readUInt16LE(28);
    var dataStart = entry.lho + 30 + nlen + elen;
    return range(dataStart, dataStart + entry.csize - 1);
  }).then(function (comp) {
    return zlib.inflateRawSync(comp);
  });
}

function toMp3(wavPath, mp3Path) {
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-i', wavPath,
    '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '48k',
    mp3Path,
  ], { stdio: 'inherit' });
}

(async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  /* Determine which outputs are still needed. */
  var todo = Object.keys(STEMS).filter(function (id) {
    return !fs.existsSync(path.join(OUT_DIR, 'figaro-' + id + '.mp3'));
  });
  if (!todo.length) { console.log('All excerpts already present.'); return; }

  console.log('Reading ZIP central directory...');
  var total = await contentLength();
  var tail = await range(total - CD_TAIL, total - 1);
  var cd = parseCentralDir(tail);
  /* Central dir may extend before our tail window; fetch exactly. */
  var cdBuf = await range(cd.cdOff, cd.cdOff + cd.cdSize - 1);
  var entries = parseEntries(cdBuf);
  console.log('Central dir: ' + entries.length + ' entries');

  var byName = {};
  entries.forEach(function (e) { byName[e.name] = e; });

  var ok = 0, skip = 0, fail = 0;
  for (var k = 0; k < Object.keys(STEMS).length; k++) {
    var id = Object.keys(STEMS)[k];
    var dest = path.join(OUT_DIR, 'figaro-' + id + '.mp3');
    if (fs.existsSync(dest)) { console.log('SKIP ' + id); skip++; continue; }

    var base = STEMS[id];
    var full = Object.keys(byName).filter(function (n) {
      return n.indexOf('Audio Files/' + base) !== -1;
    })[0];
    if (!full) { console.log('MISS ' + id + ' (' + base + ')'); fail++; continue; }

    try {
      var raw = await inflateEntry(byName[full]);
      var tmpWav = path.join(OUT_DIR, id + '.src.wav');
      fs.writeFileSync(tmpWav, raw);
      toMp3(tmpWav, dest);
      fs.unlinkSync(tmpWav);
      var sz = fs.statSync(dest).size;
      console.log('OK   ' + id + '  <- ' + base + '  (' + Math.round(sz / 1024) + ' KB)');
      ok++;
    } catch (e) {
      console.log('FAIL ' + id + ': ' + e.message);
      fail++;
    }
  }

  console.log('\nDone. ok=' + ok + ' skip=' + skip + ' fail=' + fail);
  if (fail) process.exit(1);
})();
