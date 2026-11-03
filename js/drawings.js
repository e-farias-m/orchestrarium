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
      wood2: 'url(#' + u + '-wood2)',
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
      lin('wood2', '#b98152', '#8a5a2c', '#4e2f14') +
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
  /* Two-tone bell or cone: body fill, dark outline. */
  function bellCone(d, fill) {
    return P(d, fill, BRASS_E, 1.4);
  }
  /* Bow stick with frog, tilted by angle around (cx, cy). */
  function bow(f, x, y0, len, angle, cx, cy) {
    return '<g transform="rotate(' + angle + ' ' + cx + ' ' + cy + ')">' +
      R(x, y0, 4.5, len, 2, f.pad, WOOD_E, 0.8) +
      L(x + 2.2, y0 + 4, x + 2.2, y0 + len - 30, INK_DIM, 0.9) +
      R(x - 2, y0 + len - 28, 8.5, 18, 2, EBON) +
      '</g>';
  }

  /* ================================================================
     STRINGS
     ================================================================ */
  /* Violin and viola share the fiddle construction. */
  function fiddle(id, aria, sx, sy, bodyFill) {
    var f = fills(id);
    var body = 'M73 150 Q48 155 45 185 Q43 210 58 225 Q65 235 62 250 Q60 265 55 275 ' +
      'Q35 290 38 320 Q42 350 70 355 L130 355 Q158 350 162 320 Q165 290 145 275 ' +
      'Q140 265 138 250 Q135 235 142 225 Q157 210 155 185 Q152 155 127 150 Z';
    var pivot = 'translate(100 252) scale(' + sx + ' ' + sy + ') translate(-100 -252)';
    var inner = [];

    inner.push(R(92, 58, 16, 96, 0, f.wood, WOOD_E, 1));
    inner.push(R(94, 58, 12, 96, 1, f.ebon));

    inner.push(P('M100 30 C92 30 88 24 90 16 C92 8 104 6 108 14 C111 20 106 24 102 21 C99 18 102 14 105 16',
      null, WOOD_E, 3));
    inner.push(R(90, 28, 20, 30, 3, f.wood, WOOD_E, 1));
    inner.push(E(84, 38, 6, 3, f.ebon));
    inner.push(E(116, 42, 6, 3, f.ebon));
    inner.push(E(84, 50, 6, 3, f.ebon));
    inner.push(E(116, 54, 6, 3, f.ebon));

    inner.push(node('path', { d: body, fill: bodyFill, stroke: WOOD_E, 'stroke-width': 1.4, transform: pivot }));
    inner.push(node('path', { d: body, fill: 'none', stroke: INK_DIM, 'stroke-width': 0.8,
      'stroke-dasharray': '3 2', 'stroke-opacity': 0.6,
      transform: 'translate(100 252) scale(' + (sx * 0.93) + ' ' + (sy * 0.93) + ') translate(-100 -252)' }));

    inner.push(P('M78 222 Q74 240 78 258 Q82 266 78 274', null, EBON, 2.4));
    inner.push(P('M122 222 Q126 240 122 258 Q118 266 122 274', null, EBON, 2.4));
    inner.push(C(78, 220, 2, EBON));
    inner.push(C(122, 220, 2, EBON));

    inner.push(E(78, 338, 14, 8, EBON, null, 0, 'rotate(-4 78 338)'));
    inner.push(P('M88 240 L112 240 L110 252 L90 252 Z', f.skin, SKIN_E, 0.9));
    inner.push(P('M92 330 L108 330 L104 356 L96 356 Z', EBON));

    inner.push('<g stroke="' + SIL_E + '" stroke-width="0.9" fill="none">' +
      L(95, 160, 95, 330, SIL_E, 0.9) + L(98.5, 158, 98.5, 330, SIL_E, 0.9) +
      L(101.5, 158, 101.5, 330, SIL_E, 0.9) + L(105, 160, 105, 330, SIL_E, 0.9) + '</g>');

    inner.push(L(100, 356, 100, 366, SIL_E, 3));
    inner.push(C(100, 368, 3.5, EBON));

    inner.push(bow(f, 162, 80, 260, -8, 165, 200));
    return wrap('0 0 200 420', aria, f, inner.join(''));
  }

  function violin() { return fiddle('violin', 'Violin diagram', 1, 1, fills('violin').wood); }

  /* Viola: deeper C-bouts, larger body, darker spruce/maple tone. */
  function viola() {
    return fiddle('viola', 'Viola diagram', 1.1, 1.1, fills('viola').wood2);
  }

  function cello() {
    var f = fills('cello');
    var inner = [];
    var body = 'M100 160 C80 160 64 168 58 186 C52 204 56 222 68 238 C74 250 70 262 66 274 ' +
      'C66 286 36 298 34 326 C32 364 62 398 100 398 C138 398 168 364 166 326 ' +
      'C164 298 134 286 134 274 C130 262 126 250 126 238 C144 222 148 204 142 186 ' +
      'C136 168 120 160 100 160 Z';

    inner.push(P('M100 24 C92 24 88 18 90 12 C92 4 104 2 108 10 C111 16 106 20 102 17 C99 14 102 10 105 12',
      null, WOOD_E, 3.2));
    inner.push(R(90, 24, 20, 30, 3, f.wood, WOOD_E, 1));
    inner.push(E(84, 32, 6, 3, f.ebon));
    inner.push(E(116, 40, 6, 3, f.ebon));
    inner.push(E(84, 48, 6, 3, f.ebon));
    inner.push(E(116, 56, 6, 3, f.ebon));
    inner.push(R(92, 50, 16, 118, 0, f.wood, WOOD_E, 1));
    inner.push(R(94, 50, 12, 122, 1, f.ebon));

    inner.push(node('path', { d: body, fill: f.wood, stroke: WOOD_E, 'stroke-width': 1.6 }));
    inner.push(node('path', { d: body, fill: 'none', stroke: INK_DIM, 'stroke-width': 0.8,
      'stroke-dasharray': '3 2', 'stroke-opacity': 0.6,
      transform: 'translate(100 279) scale(0.92) translate(-100 -279)' }));

    inner.push(P('M84 252 Q80 270 84 288 Q88 296 84 306', null, EBON, 2.6));
    inner.push(P('M116 252 Q120 270 116 288 Q112 296 116 306', null, EBON, 2.6));
    inner.push(P('M86 286 L114 286 L112 300 L88 300 Z', f.skin, SKIN_E, 0.9));
    inner.push(P('M96 338 L104 338 L102 384 L98 384 Z', EBON));

    inner.push('<g stroke="' + SIL_E + '" stroke-width="0.9" fill="none">' +
      L(95, 170, 95, 338, SIL_E, 0.9) + L(98.5, 170, 98.5, 338, SIL_E, 0.9) +
      L(101.5, 170, 101.5, 338, SIL_E, 0.9) + L(105, 170, 105, 338, SIL_E, 0.9) + '</g>');

    inner.push(L(100, 398, 100, 414, SIL_E, 3));
    inner.push(C(100, 416, 3.5, EBON));

    inner.push(bow(f, 162, 40, 330, -4, 165, 200));
    return wrap('0 0 200 420', 'Cello diagram', f, inner.join(''));
  }

  function doubleBass() {
    var f = fills('double-bass');
    var inner = [];
    var body = 'M100 160 C80 160 64 168 58 186 C52 204 56 222 68 238 C74 250 70 262 66 274 ' +
      'C66 286 36 298 34 326 C32 364 62 398 100 398 C138 398 168 364 166 326 ' +
      'C164 298 134 286 134 274 C130 262 126 250 126 238 C144 222 148 204 142 186 ' +
      'C136 168 120 160 100 160 Z';

    inner.push(P('M100 18 C92 18 88 12 90 6 C92 0 104 0 108 8 C111 14 106 18 102 15', null, WOOD_E, 3));
    inner.push(R(88, 14, 24, 36, 3, f.wood, WOOD_E, 1));
    inner.push(E(82, 24, 5, 3, f.ebon));
    inner.push(E(118, 30, 5, 3, f.ebon));
    inner.push(E(82, 40, 5, 3, f.ebon));
    inner.push(E(118, 46, 5, 3, f.ebon));
    inner.push(R(93, 50, 14, 140, 0, f.wood, WOOD_E, 1));
    inner.push(R(95, 50, 10, 160, 1, f.ebon));

    inner.push(node('path', { d: body, fill: f.wood, stroke: WOOD_E, 'stroke-width': 1.6 }));
    inner.push(P('M84 288 Q80 306 84 324 Q88 332 84 342', null, EBON, 2.6));
    inner.push(P('M116 288 Q120 306 116 324 Q112 332 116 342', null, EBON, 2.6));
    inner.push(P('M86 322 L114 322 L112 336 L88 336 Z', f.skin, SKIN_E, 0.9));
    inner.push(P('M94 350 L106 350 L104 390 L96 390 Z', EBON));

    inner.push('<g stroke="' + SIL_E + '" stroke-width="0.9" fill="none">' +
      L(95, 210, 95, 350, SIL_E, 0.9) + L(98.5, 210, 98.5, 350, SIL_E, 0.9) +
      L(101.5, 210, 101.5, 350, SIL_E, 0.9) + L(105, 210, 105, 350, SIL_E, 0.9) + '</g>');

    inner.push(L(100, 404, 100, 416, SIL_E, 3));
    inner.push(bow(f, 166, 70, 165, -3, 168, 200));
    return wrap('0 0 200 420', 'Double bass diagram', f, inner.join(''));
  }

  function harp() {
    var f = fills('harp');
    var inner = [];
    inner.push(R(38, 392, 170, 14, 6, f.wood, WOOD_E, 1));
    inner.push(node('path', { d: 'M60 392 C30 330 36 220 74 170 C86 152 96 140 104 126 L120 392 Z',
      fill: f.wood, stroke: WOOD_E, 'stroke-width': 1.4 }));
    inner.push(L(120, 392, 104, 126, WOOD_E, 2));
    var N = 18;
    for (var i = 0; i < N; i++) {
      var s = i / (N - 1);
      var ax = 120 - 16 * s, ay = 392 - 266 * s;
      var r = 0.15 + 0.8 * s;
      var bx = 104 + 92 * r, by = 126 - 86 * r;
      inner.push(L(ax, ay, bx, by, SIL, 0.8));
    }
    inner.push(T('M180 398 C218 320 222 180 196 40', 16, PAD, '#5e2e1b'));
    inner.push(T('M196 40 L104 126', 10, PAD, '#5e2e1b'));
    inner.push(C(196, 34, 6, PAD, '#5e2e1b', 1.2));
    return wrap('0 0 240 420', 'Harp diagram', f, inner.join(''));
  }

  /* ================================================================
     WOODWIND
     ================================================================ */
  function flute() {
    var f = fills('flute');
    var inner = [];
    inner.push(T('M60 100 L392 100', 13, f.silver, SIL_E));
    inner.push(R(138, 93, 6, 14, 2, f.silver, SIL_E, 0.8));
    inner.push(R(60, 94, 8, 12, 3, f.silver, SIL_E, 1));
    inner.push(R(384, 94, 10, 12, 3, f.silver, SIL_E, 1));
    inner.push(E(76, 100, 9, 6, 'none', SIL_E, 1.2));
    inner.push(E(76, 100, 6, 4, EBON));
    for (var i = 0; i < 11; i++) {
      var x = 160 + i * 17;
      inner.push(L(x, 96, x, 102, SIL_E, 1.2));
      inner.push(E(x, 92, 4.5, 3.5, f.silver, SIL_E, 0.9));
    }
    for (var j = 0; j < 7; j++) {
      var y = 108 + 0;
      var x2 = 170 + j * 24;
      inner.push(E(x2, y, 4, 3, f.silver, SIL_E, 0.9));
    }
    return wrap('0 0 420 200', 'Flute diagram', f, inner.join(''));
  }

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

  function oboe() {
    var f = fills('oboe');
    var inner = [];
    inner.push(R(96, 4, 8, 22, 3, SKIN, SKIN_E, 1));
    inner.push(T('M100 24 L100 150', 12, PAD, '#4a2616'));
    inner.push(R(94, 150, 12, 6, 1, f.silver, SIL_E, 0.8));
    inner.push(T('M100 156 L100 300', 14, PAD, '#4a2616'));
    inner.push(P('M92 300 L108 300 C112 326 116 352 118 370 L82 370 C84 352 88 326 92 300 Z', f.wood, '#4a2616', 1.2));
    inner.push(R(80, 368, 40, 6, 2, f.silver, SIL_E, 0.8));
    for (var i = 0; i < 6; i++) {
      var y = 160 + i * 18;
      inner.push(L(104, y, 110, y, SIL_E, 1));
      inner.push(C(110, y, 3.8, f.silver, SIL_E, 0.9));
    }
    return wrap('0 0 200 420', 'Oboe diagram', f, inner.join(''));
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

  function clarinet() {
    var f = fills('clarinet');
    var inner = [];
    inner.push(P('M80 22 L100 34 L98 42 L78 30 Z', f.ebon, EBON_E, 1));
    inner.push(L(90, 27, 94, 35, SIL, 2.5));
    inner.push(R(74, 38, 10, 6, 2, SKIN, SKIN_E, 0.8, 'rotate(-30 79 41)'));
    inner.push(T('M104 42 L104 330', 16, EBON, EBON_E));
    for (var i = 0; i < 8; i++) {
      var y = 80 + i * 30;
      inner.push(L(112, y, 118, y, SIL_E, 1.2));
      inner.push(C(118, y, 4.5, f.silver, SIL_E, 1));
    }
    inner.push(R(96, 326, 16, 6, 1, f.silver, SIL_E, 0.8));
    inner.push(P('M97 332 L111 332 C116 352 128 372 128 392 L80 392 C80 372 92 352 97 332 Z', f.ebon, EBON_E, 1.2));
    return wrap('0 0 200 420', 'Clarinet diagram', f, inner.join(''));
  }

  function bassClarinet() {
    var f = fills('bass-clarinet');
    var inner = [];
    inner.push(P('M62 20 L88 34 L86 42 L60 28 Z', f.ebon, EBON_E, 1));
    inner.push(L(76, 28, 80, 35, SIL, 2.5));
    inner.push(T('M84 38 Q98 60 100 92', 9, f.silver, SIL_E));
    inner.push(T('M100 92 L100 330', 18, EBON, EBON_E));
    for (var i = 0; i < 6; i++) {
      var y = 118 + i * 28;
      inner.push(L(108, y, 116, y, SIL_E, 1.2));
      inner.push(C(116, y, 4.5, f.silver, SIL_E, 1));
    }
    inner.push(R(92, 326, 16, 5, 1, f.silver, SIL_E, 0.8));
    inner.push(T('M100 330 Q100 362 124 362 Q140 362 140 340', 12, f.brass, BRASS_E));
    inner.push(P('M118 282 Q122 320 134 340 L146 340 Q158 320 162 282 Z', f.brass, BRASS_E, 1.2));
    inner.push(E(140, 282, 22, 8, BRASS_E));
    inner.push(E(140, 282, 18, 6, BRASS_D));
    return wrap('0 0 200 420', 'Bass clarinet diagram', f, inner.join(''));
  }

  function bassoon() {
    var f = fills('bassoon');
    var inner = [];
    inner.push(R(62, 20, 10, 14, 3, SKIN, SKIN_E, 1, 'rotate(-20 67 27)'));
    inner.push(T('M70 26 Q96 40 100 74', 6, f.silver, SIL_E));
    inner.push(T('M100 74 L100 330', 14, PAD, '#4a2616'));
    inner.push(R(94, 150, 12, 5, 1, f.silver, SIL_E, 0.8));
    inner.push(R(94, 260, 12, 5, 1, f.silver, SIL_E, 0.8));
    for (var i = 0; i < 8; i++) {
      var y = 100 + i * 26;
      inner.push(L(106, y, 112, y, SIL_E, 1.2));
      inner.push(C(112, y, 3.8, f.silver, SIL_E, 0.9));
    }
    inner.push(T('M100 330 Q100 362 118 368', 14, PAD, '#4a2616'));
    inner.push(P('M110 364 L140 364 C146 378 146 392 140 400 L110 400 C108 388 108 376 110 364 Z', f.wood, '#4a2616', 1.2));
    return wrap('0 0 200 420', 'Bassoon diagram', f, inner.join(''));
  }

  function altoSax() {
    var f = fills('alto-sax');
    var inner = [];
    inner.push(P('M84 16 L100 28 L96 34 L80 22 Z', f.ebon, EBON_E, 1));
    inner.push(T('M92 32 Q100 36 102 52', 8, f.brass, BRASS_E));
    inner.push(T('M102 52 L102 296', 22, f.brass, BRASS_E));
    inner.push(T('M102 296 Q102 330 126 332', 22, f.brass, BRASS_E));
    inner.push(T('M126 332 Q146 326 150 296', 16, f.brass, BRASS_E));
    inner.push(E(154, 280, 22, 10, f.brass, BRASS_E, 2));
    inner.push(E(154, 280, 16, 6, BRASS_D));
    for (var i = 0; i < 6; i++) {
      var y = 90 + i * 30;
      inner.push(C(116, y, 4, f.silver, SIL_E, 1));
    }
    return wrap('0 0 200 420', 'Alto saxophone diagram', f, inner.join(''));
  }

  /* ================================================================
     BRASS
     ================================================================ */
  function trumpet() {
    var f = fills('trumpet');
    var inner = [];
    inner.push(T('M64 100 L150 100', 9, f.brass, BRASS_E));
    inner.push(E(56, 100, 6, 9, f.silver, SIL_E, 1));
    [172, 192, 212].forEach(function (x) {
      inner.push(R(x - 5, 46, 10, 56, 3, f.silver, SIL_E, 1));
      inner.push(C(x, 44, 6, f.brass, BRASS_E, 1));
    });
    inner.push(T('M150 100 L330 100', 12, f.brass, BRASS_E));
    inner.push(T('M190 100 L190 128 Q190 148 212 148 L238 148 Q258 148 258 128 L258 100', 9, f.brass, BRASS_E));
    inner.push(T('M330 100 L350 100', 12, f.brass, BRASS_E));
    inner.push(P('M350 100 C358 96 368 72 376 46 L376 154 C368 128 358 104 350 100 Z', f.brass, BRASS_E, 1.5));
    inner.push(E(376, 100, 8, 54, f.brass, BRASS_E, 2.5));
    inner.push(E(376, 100, 4, 46, BRASS_D));
    return wrap('0 0 420 200', 'Trumpet diagram', f, inner.join(''));
  }

  function frenchHorn() {
    var f = fills('french-horn');
    var inner = [];
    inner.push(C(140, 170, 78, 'none', BRASS_E, 18));
    inner.push(C(140, 170, 78, 'none', BRASS, 13));
    inner.push(C(140, 170, 50, 'none', BRASS_E, 14));
    inner.push(C(140, 170, 50, 'none', BRASS_D, 9));
    inner.push(T('M56 72 L110 128', 8, f.brass, BRASS_E));
    inner.push(P('M44 66 L58 64 L62 76 L48 80 Z', f.silver, SIL_E, 1));
    for (var k = 0; k < 3; k++) {
      inner.push(R(114 + k * 9, 104, 7, 34, 2, f.silver, SIL_E, 0.8));
      inner.push(C(117.5 + k * 9, 102, 4.5, f.brass, BRASS_E, 1));
    }
    inner.push(T('M190 170 C214 150 220 120 220 96', 14, f.brass, BRASS_E));
    inner.push(E(230, 70, 46, 24, f.brass, BRASS_E, 2.5));
    inner.push(E(230, 70, 38, 18, BRASS_D));
    return wrap('0 0 300 300', 'French horn diagram', f, inner.join(''));
  }

  function tuba() {
    var f = fills('tuba');
    var inner = [];
    inner.push(E(120, 240, 80, 100, 'none', BRASS_E, 20));
    inner.push(E(120, 240, 80, 100, 'none', BRASS, 15));
    inner.push(E(120, 240, 52, 70, 'none', BRASS_E, 14));
    inner.push(E(120, 240, 52, 70, 'none', BRASS_D, 9));
    inner.push(node('path', { d: 'M52 210 A80 100 0 0 1 90 146', fill: 'none', stroke: WHITE,
      'stroke-opacity': 0.4, 'stroke-width': 3, 'stroke-linecap': 'round' }));
    inner.push(T('M74 118 L110 128', 8, f.brass, BRASS_E));
    inner.push(P('M60 112 L74 110 L76 122 L62 124 Z', f.silver, SIL_E, 1));
    [110, 126, 142].forEach(function (x) {
      inner.push(R(x - 4, 116, 8, 36, 3, f.silver, SIL_E, 1));
      inner.push(C(x, 114, 6, f.brass, BRASS_E, 1));
    });
    inner.push(T('M142 112 C170 96 186 66 186 40', 16, f.brass, BRASS_E));
    inner.push(E(186, 36, 40, 13, f.brass, BRASS_E, 2));
    inner.push(E(186, 36, 30, 9, BRASS_D));
    return wrap('0 0 260 380', 'Tuba diagram', f, inner.join(''));
  }

  function trombone() {
    var f = fills('trombone');
    var inner = [];
    inner.push(P('M70 92 L84 100 L70 108 Z', f.silver, SIL_E, 1));
    inner.push(E(66, 100, 6, 10, f.silver, SIL_E, 1));
    inner.push(T('M80 100 L300 100', 12, f.brass, BRASS_E));
    inner.push(T('M104 108 L300 108', 8, f.silver, SIL_E));
    inner.push(T('M120 104 Q120 140 180 140 Q240 140 240 104', 9, f.brass, BRASS_E));
    inner.push(T('M300 100 L330 100', 12, f.brass, BRASS_E));
    inner.push(P('M330 100 C344 96 356 80 366 60 L372 40 L372 160 L366 140 C356 120 344 104 330 100 Z', f.brass, BRASS_E, 1.5));
    inner.push(E(372, 100, 8, 60, f.brass, BRASS_E, 2.5));
    inner.push(E(372, 100, 4, 52, BRASS_D));
    return wrap('0 0 420 200', 'Trombone diagram', f, inner.join(''));
  }

  /* ================================================================
     PERCUSSION
     ================================================================ */
  function timpani() {
    var f = fills('timpani');
    var inner = [];
    inner.push(L(104, 236, 84, 266, SIL_E, 3));
    inner.push(R(68, 264, 44, 8, 3, f.brass, BRASS_E, 1));
    inner.push(R(96, 236, 48, 6, 3, EBON, EBON_E, 1));
    inner.push(P('M24 64 C24 150 60 214 120 232 C180 214 216 150 216 64 Z', f.brass, BRASS_E, 1.5));
    inner.push(E(120, 64, 100, 24, 'none', BRASS_E, 6));
    inner.push(E(120, 64, 92, 20, f.skin, SKIN_E, 1));
    [44, 80, 120, 160, 196].forEach(function (x) {
      inner.push(C(x, 80, 4, f.brass, BRASS_E, 1));
    });
    return wrap('0 0 240 300', 'Timpani diagram', f, inner.join(''));
  }

  function snareDrum() {
    var f = fills('snare-drum');
    var inner = [];
    inner.push(R(50, 62, 200, 44, 0, f.wood, WOOD_E, 1.2));
    inner.push(E(150, 106, 100, 22, '#d8c2a4', SKIN_E, 1.2));
    for (var i = 0; i < 9; i++) {
      var x = 72 + i * 19;
      inner.push(L(x, 108, x, 116, SIL, 0.9));
    }
    inner.push(E(150, 62, 100, 22, f.skin, SKIN_E, 1));
    inner.push(E(150, 62, 104, 25, 'none', BRASS, 6));
    inner.push(P('M46 106 A104 25 0 0 0 254 106', null, BRASS_E, 6));
    inner.push(C(80, 84, 4, BRASS, BRASS_E, 1));
    inner.push(C(150, 84, 4, BRASS, BRASS_E, 1));
    inner.push(C(220, 84, 4, BRASS, BRASS_E, 1));
    return wrap('0 0 300 150', 'Snare drum diagram', f, inner.join(''));
  }

  function bassDrum() {
    var f = fills('bass-drum');
    var inner = [];
    inner.push(C(150, 150, 128, f.wood, WOOD_E, 1.5));
    inner.push(C(150, 150, 118, 'none', BRASS, 8));
    inner.push(C(150, 150, 108, f.skin, SKIN_E, 1.2));
    inner.push(C(150, 150, 44, 'none', ACC, 4));
    inner.push(C(150, 150, 22, ACC));
    [[150, 28], [272, 150], [150, 272], [28, 150]].forEach(function (p) {
      inner.push(C(p[0], p[1], 4, BRASS, BRASS_E, 1));
    });
    return wrap('0 0 300 300', 'Bass drum diagram', f, inner.join(''));
  }

  function triangle() {
    var f = fills('triangle');
    var inner = [];
    inner.push(L(150, 8, 150, 36, INK_DIM, 1.5));
    inner.push(C(150, 46, 9, 'none', SIL_E, 3.5));
    inner.push(T('M150 62 L62 236 L238 236 Z', 7, f.silver, SIL_E));
    inner.push(T('M76 206 L100 262', 5, f.silver, SIL_E));
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
    inner.push(T('M30 236 L88 190', 6, f.wood, WOOD_E));
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
    inner.push(T('M60 240 L100 178', 6, f.wood, WOOD_E));
    inner.push(C(106, 172, 10, ACC, '#8a3a1a', 1));
    return wrap('0 0 420 250', 'Marimba diagram', f, inner.join(''));
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
    inner.push(T('M50 320 L70 274', 6, f.wood, WOOD_E));
    inner.push(C(74, 268, 9, ACC, '#8a3a1a', 1));
    return wrap('0 0 300 380', 'Tam-tam diagram', f, inner.join(''));
  }

  /* ================================================================
     KEYBOARD AND VOICE
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
    cello: cello,
    'double-bass': doubleBass,
    flute: flute,
    piccolo: piccolo,
    oboe: oboe,
    'english-horn': englishHorn,
    clarinet: clarinet,
    'bass-clarinet': bassClarinet,
    bassoon: bassoon,
    'alto-sax': altoSax,
    trumpet: trumpet,
    'french-horn': frenchHorn,
    trombone: trombone,
    tuba: tuba,
    timpani: timpani,
    'snare-drum': snareDrum,
    'bass-drum': bassDrum,
    triangle: triangle,
    glockenspiel: glockenspiel,
    marimba: marimba,
    'tam-tam': tamTam,
    piano: piano,
    harp: harp,
    celesta: celesta,
    voice: voice,
  };

  if (typeof window !== 'undefined') window.ORCH_DRAWINGS = DRAWINGS;
  if (typeof module !== 'undefined' && module.exports) module.exports = DRAWINGS;
})();
