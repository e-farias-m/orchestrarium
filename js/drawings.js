/* ============================================================
   Orchestrarium — Hand-drawn instrument illustrations.
   Each entry returns a self-contained SVG string. The viewBox
   aspect ratio is the coordinate space that instruments.js hotspots
   (percentages) point into, so keep hotspot positions in sync.
   ============================================================ */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  var INK = 'var(--dg-ink)';
  var INK_DIM = 'var(--dg-ink-dim)';
  var WOOD = 'var(--dg-wood)';
  var WOOD_D = 'var(--dg-wood-dark)';
  var WOOD_E = 'var(--dg-wood-edge)';
  var PAD = 'var(--dg-padauk)';
  var BRASS = 'var(--dg-brass)';
  var BRASS_D = 'var(--dg-brass-dark)';
  var BRASS_E = 'var(--dg-brass-edge)';
  var SIL = 'var(--dg-silver)';
  var SIL_D = 'var(--dg-silver-dark)';
  var SIL_E = 'var(--dg-silver-edge)';
  var EBON = 'var(--dg-ebonite)';
  var EBON_E = 'var(--dg-ebonite-edge)';
  var SKIN = 'var(--dg-skin)';
  var SKIN_E = 'var(--dg-skin-edge)';
  var ACC = 'var(--dg-accent)';
  var KEY = '#fbf8f2';
  var KEY_E = '#8b8f98';
  var WHITE = '#ffffff';

  /* Per-drawing gradient fills (objectBoundingBox, light from upper left). */
  function fills(id) {
    var u = 'dg-' + id;
    return {
      u: u,
      wood: 'url(#' + u + '-wood)',
      brass: 'url(#' + u + '-brass)',
      silver: 'url(#' + u + '-silver)',
      ebon: 'url(#' + u + '-ebon)',
      skin: 'url(#' + u + '-skin)',
      pad: 'url(#' + u + '-pad)',
    };
  }

  function gradients(u) {
    function lin(name, a, b, c) {
      return '<linearGradient id="' + u + '-' + name + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="' + a + '"/>' +
        '<stop offset="0.5" stop-color="' + b + '"/>' +
        '<stop offset="1" stop-color="' + c + '"/></linearGradient>';
    }
    return '<defs>' +
      lin('wood', '#dcb27a', WOOD, WOOD_D) +
      lin('brass', '#f3d68c', BRASS, BRASS_D) +
      lin('silver', '#f7f9fb', SIL, SIL_D) +
      lin('ebon', '#4a505a', EBON, EBON_E) +
      lin('skin', '#f6e7d2', SKIN, SKIN_E) +
      lin('pad', '#b0603f', PAD, '#5e2e1b') +
      '</defs>';
  }

  function wrap(vb, aria, f, inner) {
    return '<svg xmlns="' + NS + '" viewBox="' + vb + '" role="img" aria-label="' + aria + '">' +
      gradients(f.u) + inner + '</svg>';
  }

  /* ---- primitives ---- */
  function node(tag, o) {
    var s = '<' + tag;
    Object.keys(o).forEach(function (k) {
      if (o[k] !== undefined && o[k] !== null) s += ' ' + k + '="' + o[k] + '"';
    });
    return s + '/>';
  }
  function P(d, fill, stroke, sw) {
    return node('path', { d: d, fill: fill || 'none', stroke: stroke, 'stroke-width': sw,
      'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
  }
  function R(x, y, w, h, rx, fill, stroke, sw, tf) {
    return node('rect', { x: x, y: y, width: w, height: h, rx: rx || 0, fill: fill,
      stroke: stroke, 'stroke-width': sw, transform: tf });
  }
  function C(cx, cy, r, fill, stroke, sw) {
    return node('circle', { cx: cx, cy: cy, r: r, fill: fill, stroke: stroke, 'stroke-width': sw });
  }
  function E(cx, cy, rx, ry, fill, stroke, sw, tf) {
    return node('ellipse', { cx: cx, cy: cy, rx: rx, ry: ry, fill: fill, stroke: stroke,
      'stroke-width': sw, transform: tf });
  }
  function L(x1, y1, x2, y2, stroke, sw) {
    return node('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: stroke, 'stroke-width': sw,
      'stroke-linecap': 'round' });
  }
  /* A tube: dark edge, body colour, and a thin highlight on the left flank. */
  function T(d, w, body, edge) {
    return P(d, null, edge, w + 2.5) +
      P(d, null, body, w) +
      node('path', { d: d, fill: 'none', stroke: WHITE, 'stroke-opacity': 0.4,
        'stroke-width': Math.max(1, w * 0.18), 'stroke-linecap': 'round',
        transform: 'translate(' + (-w * 0.22).toFixed(2) + ' 0)' });
  }

  /* ================================================================
     STRINGS — violin and viola share one construction
     ================================================================ */
  function fiddle(id, aria, scaleX, scaleY) {
    var f = fills(id);
    var body = 'M70 150 Q45 155 42 185 Q40 210 55 225 Q65 235 62 250 Q60 265 55 275 ' +
      'Q35 290 38 320 Q42 350 70 355 L130 355 Q158 350 162 320 Q165 290 145 275 ' +
      'Q140 265 138 250 Q135 235 145 225 Q160 210 158 185 Q155 155 130 150 Z';
    var g = 'translate(100 252) scale(' + scaleX + ' ' + scaleY + ') translate(-100 -252)';
    var inner = [];

    /* Neck and fingerboard */
    inner.push(R(92, 58, 16, 96, 0, f.wood, WOOD_E, 1));
    inner.push(R(94, 58, 12, 96, 1, f.ebon));

    /* Scroll, pegbox and pegs */
    inner.push(P('M100 30 C92 30 88 24 90 16 C92 8 104 6 108 14 C111 20 106 24 102 21 C99 18 102 14 105 16',
      null, WOOD_E, 3));
    inner.push(R(90, 28, 20, 30, 3, f.wood, WOOD_E, 1));
    inner.push(E(84, 38, 6, 3, f.ebon));
    inner.push(E(116, 42, 6, 3, f.ebon));
    inner.push(E(84, 50, 6, 3, f.ebon));
    inner.push(E(116, 54, 6, 3, f.ebon));

    /* Body */
    inner.push(node('path', { d: body, fill: f.wood, stroke: WOOD_E, 'stroke-width': 1.4,
      transform: g }));
    inner.push(node('path', { d: body, fill: 'none', stroke: INK_DIM, 'stroke-width': 0.8,
      'stroke-dasharray': '3 2', 'stroke-opacity': 0.6,
      transform: 'translate(100 252) scale(' + (scaleX * 0.93) + ' ' + (scaleY * 0.93) + ') translate(-100 -252)' }));

    /* f-holes */
    inner.push(P('M78 222 Q74 240 78 258 Q82 266 78 274', null, EBON, 2.4));
    inner.push(P('M122 222 Q126 240 122 258 Q118 266 122 274', null, EBON, 2.4));
    inner.push(C(78, 220, 2, EBON));
    inner.push(C(122, 220, 2, EBON));

    /* Chin rest, bridge, tailpiece */
    inner.push(E(78, 338, 14, 8, EBON, null, 0, 'rotate(-4 78 338)'));
    inner.push(P('M88 240 L112 240 L110 252 L90 252 Z', SKIN, SKIN_E, 0.9));
    inner.push(P('M92 330 L108 330 L104 356 L96 356 Z', EBON));

    /* Strings over the body, from the nut to the tailpiece */
    inner.push('<g stroke="' + SIL_E + '" stroke-width="0.9" fill="none">' +
      L(95, 160, 95, 330, SIL_E, 0.9) + L(98.5, 158, 98.5, 330, SIL_E, 0.9) +
      L(101.5, 158, 101.5, 330, SIL_E, 0.9) + L(105, 160, 105, 330, SIL_E, 0.9) + '</g>');

    /* Endpin */
    inner.push(L(100, 356, 100, 366, SIL_E, 3));
    inner.push(C(100, 368, 3.5, EBON));

    /* Bow, tilted to the right */
    inner.push('<g transform="rotate(-8 165 200)">' +
      R(162, 80, 4, 260, 2, f.pad, WOOD_E, 0.8) +
      L(164, 85, 164, 330, INK_DIM, 1) +
      P('M162 80 Q164 72 166 80', EBON) +
      R(160, 320, 8, 18, 2, EBON) +
      '</g>');

    return wrap('0 0 200 420', aria, f, inner.join(''));
  }

  function violin() { return fiddle('violin', 'Violin diagram', 1, 1); }
  function viola() { return fiddle('viola', 'Viola diagram', 1.1, 1.08); }

  /* ================================================================
     WOODWIND
     ================================================================ */
  function piccolo() {
    var f = fills('piccolo');
    var inner = [];
    inner.push(T('M70 100 L392 100', 18, EBON, EBON_E));
    inner.push(R(146, 91, 6, 18, 1, f.silver, SIL_E, 0.8));
    inner.push(R(352, 91, 6, 18, 1, f.silver, SIL_E, 0.8));
    for (var i = 0; i < 8; i++) {
      var x = 180 + i * 20;
      inner.push(L(x, 90, x, 100, SIL_E, 1.4));
      inner.push(C(x, 88, 5, f.silver, SIL_E, 1));
      inner.push(C(x, 88, 2, EBON_E));
    }
    inner.push(E(98, 100, 10, 6, f.silver, SIL_E, 1.4));
    inner.push(E(98, 100, 5, 3, EBON_E));
    inner.push(R(64, 92, 8, 16, 3, f.silver, SIL_E, 1));
    inner.push(R(384, 92, 10, 16, 3, f.silver, SIL_E, 1));
    return wrap('0 0 420 200', 'Piccolo diagram', f, inner.join(''));
  }

  function englishHorn() {
    var f = fills('english-horn');
    var inner = [];
    inner.push(T('M72 52 L100 108 L100 300', 15, PAD, '#4a2616'));
    inner.push(T('M100 300 Q104 330 116 342', 15, PAD, '#4a2616'));
    inner.push(node('rect', { x: 52, y: 30, width: 10, height: 22, rx: 3, fill: SKIN,
      stroke: SKIN_E, 'stroke-width': 1, transform: 'rotate(-35 57 41)' }));
    inner.push(R(94, 106, 12, 5, 1, f.silver, SIL_E, 0.8));
    inner.push(R(94, 270, 12, 5, 1, f.silver, SIL_E, 0.8));
    for (var i = 0; i < 6; i++) {
      var y = 140 + i * 26;
      inner.push(L(106, y, 112, y, SIL_E, 1.2));
      inner.push(C(113, y, 4, f.silver, SIL_E, 1));
    }
    inner.push(P('M112 338 C128 350 136 378 130 398 C126 412 102 414 98 398 C94 380 98 356 112 338 Z',
      f.wood, '#4a2616', 1.2));
    return wrap('0 0 200 420', 'English horn diagram', f, inner.join(''));
  }

  function bassClarinet() {
    var f = fills('bass-clarinet');
    var inner = [];
    inner.push(P('M62 20 L88 34 L86 42 L60 28 Z', f.ebon, EBON_E, 1));
    inner.push(L(76, 28, 80, 35, SIL, 2.5));
    inner.push(T('M84 38 Q98 60 100 92', 9, SIL, SIL_E));
    inner.push(T('M100 92 L104 334', 18, EBON, EBON_E));
    for (var i = 0; i < 6; i++) {
      var y = 118 + i * 28;
      inner.push(L(108, y, 116, y, SIL_E, 1.2));
      inner.push(C(116, y, 4.5, f.silver, SIL_E, 1));
    }
    inner.push(R(96, 326, 16, 5, 1, f.silver, SIL_E, 0.8));
    inner.push(P('M110 330 L126 330 C134 352 138 378 136 402 L108 402 C108 378 110 352 110 330 Z',
      f.ebon, EBON_E, 1.2));
    return wrap('0 0 200 420', 'Bass clarinet diagram', f, inner.join(''));
  }

  /* ================================================================
     BRASS
     ================================================================ */
  function tuba() {
    var f = fills('tuba');
    var inner = [];
    inner.push(C(140, 200, 88, 'none', BRASS_E, 20));
    inner.push(C(140, 200, 88, 'none', BRASS, 15));
    inner.push(C(140, 200, 64, 'none', BRASS_E, 16));
    inner.push(C(140, 200, 64, 'none', BRASS_D, 11));
    inner.push(node('path', { d: 'M70 180 A88 88 0 0 1 120 116', fill: 'none', stroke: WHITE,
      'stroke-opacity': 0.4, 'stroke-width': 3, 'stroke-linecap': 'round' }));
    inner.push(T('M134 50 Q138 74 136 98', 7, BRASS, BRASS_E));
    inner.push(P('M116 36 L134 46 L132 52 L114 42 Z', f.silver, SIL_E, 1));
    [134, 150, 166].forEach(function (x) {
      inner.push(R(x - 4, 100, 8, 40, 3, f.silver, SIL_E, 1));
      inner.push(C(x, 98, 6, f.brass, BRASS_E, 1));
    });
    inner.push(T('M166 128 C204 110 216 72 216 46', 16, BRASS, BRASS_E));
    inner.push(E(216, 40, 28, 11, f.brass, BRASS_E, 2));
    inner.push(E(216, 40, 20, 7, BRASS_D));
    return wrap('0 0 300 320', 'Tuba diagram', f, inner.join(''));
  }

  /* ================================================================
     PERCUSSION
     ================================================================ */
  function triangle() {
    var f = fills('triangle');
    var inner = [];
    inner.push(L(150, 8, 150, 36, INK_DIM, 1.5));
    inner.push(C(150, 46, 9, 'none', SIL_E, 3.5));
    inner.push(T('M150 62 L62 236 L238 236 Z', 7, SIL, SIL_E));
    inner.push(T('M76 206 L100 262', 5, SIL, SIL_E));
    inner.push(C(76, 206, 6, EBON, EBON_E, 1));
    inner.push(R(94, 254, 14, 30, 6, EBON, EBON_E, 1, 'rotate(-20 101 269)'));
    return wrap('0 0 300 300', 'Triangle diagram', f, inner.join(''));
  }

  function glockenspiel() {
    var f = fills('glockenspiel');
    var inner = [];
    inner.push(R(22, 44, 316, 164, 10, f.wood, WOOD_E, 1.4));
    inner.push(R(34, 50, 292, 6, 3, WOOD_D));
    inner.push(R(60, 208, 14, 20, 2, WOOD_E));
    inner.push(R(286, 208, 14, 20, 2, WOOD_E));
    for (var i = 0; i < 15; i++) {
      var x = 40 + i * 20;
      var h = 92 - i * 2.4;
      var sharp = [1, 3, 6, 8, 10].indexOf(i % 12) >= 0;
      inner.push(R(x - 7, 126 - h / 2, 14, h, 2, sharp ? f.ebon : f.silver,
        sharp ? EBON_E : SIL_E, 0.8));
      inner.push(node('line', { x1: x - 3, y1: 126 - h / 2 + 4, x2: x - 3, y2: 126 + h / 2 - 4,
        stroke: WHITE, 'stroke-opacity': 0.5, 'stroke-width': 1.4, 'stroke-linecap': 'round' }));
    }
    inner.push(T('M30 236 L88 190', 6, WOOD, WOOD_E));
    inner.push(C(92, 184, 9, ACC, '#8a3a1a', 1));
    return wrap('0 0 360 260', 'Glockenspiel diagram', f, inner.join(''));
  }

  function marimba() {
    var f = fills('marimba');
    var inner = [];
    for (var i = 0; i < 14; i++) {
      var x = 41 + i * 26;
      var len = 128 - i * 4;
      inner.push(T('M' + x + ' 96 L' + x + ' ' + (96 + len), 7, BRASS, BRASS_E));
    }
    inner.push(R(22, 86, 376, 10, 3, f.wood, WOOD_E, 1));
    for (var j = 0; j < 14; j++) {
      var bx = 30 + j * 26;
      var sharp = [1, 3, 6, 8, 10].indexOf(j % 12) >= 0;
      inner.push(R(bx, 46, 22, 40, 3, sharp ? f.pad : f.wood, WOOD_E, 1));
    }
    inner.push(T('M60 240 L100 178', 6, WOOD, WOOD_E));
    inner.push(C(106, 172, 10, ACC, '#8a3a1a', 1));
    return wrap('0 0 420 250', 'Marimba diagram', f, inner.join(''));
  }

  function celesta() {
    var f = fills('celesta');
    var inner = [];
    inner.push(R(36, 60, 288, 146, 6, f.wood, WOOD_E, 1.4));
    inner.push(R(46, 68, 268, 36, 3, EBON));
    for (var i = 0; i < 12; i++) {
      var x = 58 + i * 21;
      inner.push(R(x, 76, 12, 22, 1, f.silver, SIL_E, 0.8));
      inner.push(R(x + 2, 110, 8, 14, 2, SKIN, SKIN_E, 0.8));
    }
    inner.push(R(44, 170, 272, 36, 2, KEY, KEY_E, 0.8));
    for (var k = 0; k < 15; k++) {
      inner.push(R(44 + k * 18, 170, 18, 36, 1, KEY, KEY_E, 0.8));
    }
    for (var b = 0; b < 14; b++) {
      if ([0, 1, 3, 4, 5].indexOf(b % 7) >= 0) {
        inner.push(R(44 + (b + 1) * 18 - 5, 170, 10, 22, 1, f.ebon, EBON_E, 0.6));
      }
    }
    inner.push(R(54, 206, 12, 26, 2, WOOD_E));
    inner.push(R(294, 206, 12, 26, 2, WOOD_E));
    return wrap('0 0 360 260', 'Celesta diagram', f, inner.join(''));
  }

  function snareDrum() {
    var f = fills('snare-drum');
    var inner = [];
    inner.push(R(50, 60, 200, 140, 0, f.silver));
    inner.push(E(150, 200, 100, 22, f.silver, SIL_E, 1.2));
    inner.push(P('M70 206 Q150 226 230 206', null, SIL_E, 1));
    for (var i = 0; i < 9; i++) {
      var x = 74 + i * 18;
      inner.push(L(x, 204, x, 212, SIL_E, 0.7));
    }
    inner.push(C(80, 150, 5, BRASS, BRASS_E, 1));
    inner.push(C(150, 150, 5, BRASS, BRASS_E, 1));
    inner.push(C(220, 150, 5, BRASS, BRASS_E, 1));
    inner.push(E(150, 60, 100, 22, SKIN, SKIN_E, 1));
    inner.push(E(150, 60, 104, 25, 'none', BRASS, 6));
    inner.push(P('M46 200 A104 25 0 0 0 254 200', null, BRASS_E, 6));
    return wrap('0 0 300 260', 'Snare drum diagram', f, inner.join(''));
  }

  function tamTam() {
    var f = fills('tam-tam');
    var inner = [];
    inner.push(R(40, 44, 12, 290, 2, f.pad, '#5e2e1b', 1));
    inner.push(R(248, 44, 12, 290, 2, f.pad, '#5e2e1b', 1));
    inner.push(R(40, 30, 220, 14, 3, f.pad, '#5e2e1b', 1));
    inner.push(L(120, 44, 100, 66, INK_DIM, 1.2));
    inner.push(L(180, 44, 200, 66, INK_DIM, 1.2));
    inner.push(C(150, 170, 115, f.brass, BRASS_E, 4));
    inner.push(C(150, 170, 96, 'none', BRASS_D, 2));
    inner.push(C(150, 170, 60, 'none', BRASS_D, 1.5));
    inner.push(C(150, 170, 26, BRASS_D, BRASS_E, 1.5));
    inner.push(R(60, 326, 180, 14, 4, EBON, EBON_E, 1));
    inner.push(T('M50 320 L70 274', 6, WOOD, WOOD_E));
    inner.push(C(74, 268, 9, ACC, '#8a3a1a', 1));
    return wrap('0 0 300 380', 'Tam-tam diagram', f, inner.join(''));
  }

  /* ================================================================
     KEYBOARD
     ================================================================ */
  function piano() {
    var f = fills('piano');
    var inner = [];
    inner.push(R(50, 40, 260, 34, 4, f.wood, WOOD_E, 1.2));
    inner.push(R(46, 74, 268, 30, 3, f.wood, WOOD_E, 1.2));
    inner.push(R(64, 104, 232, 46, 2, EBON, EBON_E, 1));
    for (var s = 0; s < 31; s++) {
      var sx = 70 + s * 7;
      inner.push(L(sx, 106, sx, 148, SIL, 0.8));
    }
    inner.push(R(50, 150, 260, 76, 3, f.wood, WOOD_E, 1.2));
    inner.push(R(150, 166, 60, 16, 2, f.brass, BRASS_E, 0.8));
    for (var i = 0; i < 24; i++) {
      inner.push(R(46 + i * 11.3, 226, 11.3, 44, 1, KEY, KEY_E, 0.6));
    }
    for (var b = 0; b < 23; b++) {
      if ([0, 1, 3, 4, 5].indexOf(b % 7) >= 0) {
        inner.push(R(46 + (b + 1) * 11.3 - 3.5, 226, 7, 26, 1, f.ebon, EBON_E, 0.5));
      }
    }
    inner.push(R(56, 270, 248, 6, 2, WOOD_D));
    inner.push(R(160, 276, 14, 30, 3, f.brass, BRASS_E, 1));
    inner.push(R(183, 276, 14, 30, 3, f.brass, BRASS_E, 1));
    inner.push(R(206, 276, 14, 30, 3, f.brass, BRASS_E, 1));
    inner.push(R(56, 340, 248, 14, 2, WOOD_E));
    return wrap('0 0 360 380', 'Piano diagram', f, inner.join(''));
  }

  /* ================================================================
     VOICE
     ================================================================ */
  function voice() {
    var f = fills('voice');
    var inner = [];
    var head = 'M150 40 C200 38 236 70 240 112 C241 124 244 128 252 136 C258 140 262 146 254 152 ' +
      'C246 156 244 158 246 164 C248 170 244 176 238 178 C240 186 240 196 232 202 ' +
      'C226 208 218 210 212 216 L210 240 C212 258 214 270 220 292 L70 292 ' +
      'C78 268 80 240 72 220 C50 200 36 166 40 130 C44 84 84 42 150 40 Z';
    inner.push(node('path', { d: head, fill: f.skin, stroke: SKIN_E, 'stroke-width': 1.4 }));
    inner.push(R(146, 200, 46, 60, 12, 'none', SKIN_E, 1.4));
    inner.push(P('M190 226 L152 232', null, ACC, 3));
    inner.push(P('M190 240 L154 244', null, ACC, 3));
    inner.push(C(204, 108, 4, INK));
    inner.push(P('M236 176 Q228 178 222 176', null, INK, 1.5));
    inner.push(node('path', { d: 'M262 138 Q274 150 262 162', fill: 'none', stroke: ACC,
      'stroke-width': 2.5, 'stroke-opacity': 0.7, 'stroke-linecap': 'round' }));
    inner.push(node('path', { d: 'M276 128 Q292 150 276 172', fill: 'none', stroke: ACC,
      'stroke-width': 2.5, 'stroke-opacity': 0.5, 'stroke-linecap': 'round' }));
    inner.push(node('path', { d: 'M290 118 Q310 150 290 182', fill: 'none', stroke: ACC,
      'stroke-width': 2.5, 'stroke-opacity': 0.3, 'stroke-linecap': 'round' }));
    return wrap('0 0 300 300', 'Voice diagram', f, inner.join(''));
  }

  var DRAWINGS = {
    violin: violin,
    viola: viola,
    piccolo: piccolo,
    'english-horn': englishHorn,
    'bass-clarinet': bassClarinet,
    tuba: tuba,
    triangle: triangle,
    glockenspiel: glockenspiel,
    marimba: marimba,
    celesta: celesta,
    'snare-drum': snareDrum,
    'tam-tam': tamTam,
    piano: piano,
    voice: voice,
  };

  if (typeof window !== 'undefined') window.ORCH_DRAWINGS = DRAWINGS;
  if (typeof module !== 'undefined' && module.exports) module.exports = DRAWINGS;
})();
