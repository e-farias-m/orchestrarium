/* ============================================================
   Orchestrarium — Graphics Engine
   Procedurally generated SVG: instrument diagrams, hotspot
   overlays with DK-style leader lines, icons, seating chart.
   All SVG is string-built. Colors resolve from CSS vars.
   ============================================================ */
(function () {
  'use strict';

  /* --- SVG namespace helper --- */
  var NS = 'http://www.w3.org/2000/svg';

  /* --- Diagram ink palette (resolves from CSS custom properties) --- */
  var INK = 'var(--dg-ink)';
  var INK_DIM = 'var(--dg-ink-dim)';
  var HOUSING = 'var(--dg-housing)';
  var HOUSING_EDGE = 'var(--dg-housing-edge)';
  var OPEN = 'var(--dg-open)';
  var ACCENT = 'var(--dg-accent)';

  /* ================================================================
     INSTRUMENT DIAGRAMS
     Each returns an SVG string with viewBox and paths.
     Hotspot coordinates in instruments.js are % of this viewBox.
     ================================================================ */

  /* --- Violin (reference) --- */
  function violinSVG() {
    return [
      '<svg xmlns="', NS, '" viewBox="0 0 200 420" role="img" aria-label="Violin diagram">',
      /* Strings (draw first, behind body) */
      '<g stroke="', INK_DIM, '" stroke-width="1.2" fill="none" opacity="0.7">',
      '<line x1="94" y1="160" x2="94" y2="340"/>',
      '<line x1="98" y1="155" x2="98" y2="340"/>',
      '<line x1="102" y1="155" x2="102" y2="340"/>',
      '<line x1="106" y1="160" x2="106" y2="340"/>',
      '</g>',
      /* Bow (right side, diagonal) */
      '<g transform="rotate(-8 165 200)">',
      '<rect x="162" y="80" width="4" height="260" rx="2" fill="', HOUSING, '" stroke="', HOUSING_EDGE, '" stroke-width="0.8"/>',
      '<line x1="164" y1="85" x2="164" y2="330" stroke="', INK_DIM, '" stroke-width="1" opacity="0.5"/>',
      /* bow tip */
      '<path d="M162 80 Q164 72 166 80" fill="', HOUSING_EDGE, '"/>',
      /* bow frog */
      '<rect x="160" y="320" width="8" height="18" rx="2" fill="', INK, '"/>',
      '</g>',
      /* Scroll */
      '<path d="M92 22 Q88 10 100 8 Q112 10 108 22 Q106 30 100 28 Q96 26 98 22" fill="none" stroke="', INK, '" stroke-width="2.5" stroke-linecap="round"/>',
      /* Pegbox + pegs */
      '<rect x="90" y="28" width="20" height="28" rx="3" fill="', HOUSING, '" stroke="', HOUSING_EDGE, '" stroke-width="1"/>',
      /* pegs (4 small ovals) */
      '<ellipse cx="86" cy="36" rx="5" ry="3" fill="', INK, '"/>',
      '<ellipse cx="114" cy="42" rx="5" ry="3" fill="', INK, '"/>',
      '<ellipse cx="86" cy="48" rx="5" ry="3" fill="', INK, '"/>',
      '<ellipse cx="114" cy="54" rx="5" ry="3" fill="', INK, '"/>',
      /* Neck */
      '<rect x="91" y="56" width="18" height="80" fill="', HOUSING, '" stroke="', HOUSING_EDGE, '" stroke-width="0.8"/>',
      /* Fingerboard (dark strip on neck) */
      '<rect x="93" y="56" width="14" height="90" rx="1" fill="', INK, '" opacity="0.85"/>',
      /* Body — hourglass shape */
      '<path d="',
      /* left side of body */
      'M70 150 ',
      /* upper bout left */
      'Q45 155 42 185 ',
      'Q40 210 55 225 ',
      /* C-bout left */
      'Q65 235 62 250 ',
      'Q60 265 55 275 ',
      /* lower bout left */
      'Q35 290 38 320 ',
      'Q42 350 70 355 ',
      /* bottom */
      'L130 355 ',
      /* lower bout right */
      'Q158 350 162 320 ',
      'Q165 290 145 275 ',
      /* C-bout right */
      'Q140 265 138 250 ',
      'Q135 235 145 225 ',
      /* upper bout right */
      'Q160 210 158 185 ',
      'Q155 155 130 150 ',
      'Z" fill="', HOUSING, '" stroke="', HOUSING_EDGE, '" stroke-width="1.2"/>',
      /* f-holes */
      '<path d="M78 230 Q76 240 78 255 Q80 260 78 265" fill="none" stroke="', INK, '" stroke-width="2.5" stroke-linecap="round"/>',
      '<circle cx="78" cy="232" r="2.5" fill="', INK, '"/>',
      '<circle cx="78" cy="263" r="2.5" fill="', INK, '"/>',
      '<path d="M122 230 Q124 240 122 255 Q120 260 122 265" fill="none" stroke="', INK, '" stroke-width="2.5" stroke-linecap="round"/>',
      '<circle cx="122" cy="232" r="2.5" fill="', INK, '"/>',
      '<circle cx="122" cy="263" r="2.5" fill="', INK, '"/>',
      /* Bridge */
      '<path d="M88 240 L112 240 L110 248 L90 248 Z" fill="', HOUSING_EDGE, '" stroke="', INK, '" stroke-width="0.8"/>',
      /* Tailpiece */
      '<path d="M92 330 L108 330 L105 355 L95 355 Z" fill="', INK, '" opacity="0.8"/>',
      /* Chin rest (left side) */
      '<ellipse cx="78" cy="338" rx="14" ry="8" fill="', INK, '" opacity="0.6"/>',
      /* Endpin */
      '<circle cx="100" cy="358" r="4" fill="', INK, '"/>',
      '</svg>',
    ].join('');
  }

  /* --- Generic instrument silhouette (placeholder for Phase 2) --- */
  function genericSVG(family) {
    var bodyColor = {
      strings: 'var(--family-strings)',
      woodwinds: 'var(--family-woodwinds)',
      brass: 'var(--family-brass)',
      percussion: 'var(--family-percussion)',
      other: 'var(--family-other)',
    }[family] || ACCENT;

    return [
      '<svg xmlns="', NS, '" viewBox="0 0 200 420" role="img" aria-label="Instrument diagram">',
      '<rect x="60" y="40" width="80" height="340" rx="20" fill="', HOUSING, '" stroke="', bodyColor, '" stroke-width="2"/>',
      '<circle cx="100" cy="210" r="30" fill="', bodyColor, '" opacity="0.3"/>',
      '<text x="100" y="218" text-anchor="middle" font-size="24" fill="', INK, '">♪</text>',
      '</svg>',
    ].join('');
  }

  /* --- SVG for a specific instrument --- */
  function instrumentSVG(id) {
    if (id === 'violin') return violinSVG();
    var inst = INSTRUMENTS.get(id);
    return genericSVG(inst ? inst.family : 'other');
  }

  /* ================================================================
     HOTSPOT OVERLAY
     Renders percentage-positioned buttons + leader lines + labels
     over an instrument diagram.
     ================================================================ */

  /**
   * Render the hotspot overlay for an instrument.
   * @param {string} instrumentId
   * @param {number} tier - current grade band
   * @returns {string} HTML string (buttons + leader SVG + labels)
   */
  function hotspotOverlay(instrumentId, tier) {
    var inst = INSTRUMENTS.get(instrumentId);
    if (!inst) return '';

    var hotspots = INSTRUMENTS.hotspotsForTier(instrumentId, tier);
    if (!hotspots.length) return '';

    var isLangPt = (typeof getLang === 'function' && getLang() === 'pt');

    var out = [];
    out.push('<div class="hotspot-layer" id="hotspot-layer">');

    /* Leader lines SVG (absolute, covers the diagram) */
    out.push('<svg class="leader-svg" id="leader-svg" viewBox="0 0 100 100" preserveAspectRatio="none">');
    /* We'll draw lines in JS after layout; for now an empty placeholder */
    out.push('</svg>');

    /* Hotspot buttons */
    for (var i = 0; i < hotspots.length; i++) {
      var h = hotspots[i];
      var num = (tier === 1) ? '' : '<span class="hotspot-num">' + (i + 1) + '</span>';
      out.push(
        '<button class="hotspot" id="hs-' + h.id + '"',
        ' data-action="hotspot"',
        ' data-hotspot="' + h.id + '"',
        ' style="left:' + h.x + '%;top:' + h.y + '%"',
        ' aria-label="' + (isLangPt ? h.labelPt : h.label) + '">',
        '<span class="hotspot-dot"></span>',
        num,
        '</button>'
      );
    }

    out.push('</div>');

    /* Labels positioned at edges (DK style) */
    out.push('<div id="hotspot-labels">');
    for (var j = 0; j < hotspots.length; j++) {
      var hs = hotspots[j];
      var labelText = isLangPt ? hs.labelPt : hs.label;
      /* Place label: left side if x < 50, right side if x >= 50 */
      var side = hs.x < 50 ? 'left' : 'right';
      var labelX = hs.x < 50 ? hs.x - 2 : hs.x + 2;
      var labelAlign = hs.x < 50 ? 'right' : 'left';
      out.push(
        '<span class="hotspot-label" id="hl-' + hs.id + '"',
        ' data-hotspot="' + hs.id + '"',
        ' style="left:' + labelX + '%;top:' + hs.y + '%;transform:translate(' +
        (hs.x < 50 ? '-100%' : '0') + ',-50%);text-align:' + labelAlign + '">',
        labelText,
        '</span>'
      );
    }
    out.push('</div>');

    return out.join('');
  }

  /**
   * Draw leader lines from hotspot dots to their labels.
   * Call after DOM is rendered and positions are known.
   * @param {string} instrumentId
   * @param {number} tier
   */
  function drawLeaderLines(instrumentId, tier) {
    var layer = document.getElementById('hotspot-layer');
    var leaderSvg = document.getElementById('leader-svg');
    if (!layer || !leaderSvg) return;

    var hotspots = INSTRUMENTS.hotspotsForTier(instrumentId, tier);
    if (!hotspots.length) return;

    /* Clear existing lines */
    leaderSvg.innerHTML = '';

    /* We draw lines in the leader-svg coordinate space (0-100) */
    var lines = [];
    for (var i = 0; i < hotspots.length; i++) {
      var h = hotspots[i];
      var label = document.getElementById('hl-' + h.id);
      if (!label) continue;

      /* Label position relative to the layer (percentage) */
      var labelX = h.x < 50 ? h.x - 2 : h.x + 2;
      var labelY = h.y;

      /* Line from hotspot dot to label edge */
      lines.push(
        '<line x1="' + h.x + '" y1="' + h.y + '" x2="' + labelX + '" y2="' + labelY + '"',
        ' vector-effect="non-scaling-stroke"/>'
      );
    }
    leaderSvg.innerHTML = lines.join('');
  }

  /* ================================================================
     HOTSPOT INFO CARD
     Shows the description for a tapped hotspot.
     ================================================================ */
  function hotspotInfoCard(instrumentId, hotspotId) {
    var inst = INSTRUMENTS.get(instrumentId);
    if (!inst) return '';

    var hs = null;
    for (var i = 0; i < inst.hotspots.length; i++) {
      if (inst.hotspots[i].id === hotspotId) { hs = inst.hotspots[i]; break; }
    }
    if (!hs) return '';

    var isLangPt = (typeof getLang === 'function' && getLang() === 'pt');
    var label = isLangPt ? hs.labelPt : hs.label;
    var desc = isLangPt ? hs.descPt : hs.desc;
    var closeLabel = (typeof t === 'function') ? t('Close') : 'Close';

    return [
      '<div class="sheet-overlay" id="sheet-overlay" data-action="close-hotspot"></div>',
      '<div class="hotspot-info" id="hotspot-info" role="dialog" aria-label="' + label + '">',
      '<button class="hotspot-info-close" data-action="close-hotspot" aria-label="', closeLabel, '">×</button>',
      '<div class="hotspot-info-label">', label, '</div>',
      '<div class="hotspot-info-desc">', desc, '</div>',
      '</div>',
    ].join('');
  }

  /* ================================================================
     NUMBERED-DOT FALLBACK LIST
     Used on Tier 1 and as mobile fallback.
     ================================================================ */
  function hotspotList(instrumentId, tier) {
    var hotspots = INSTRUMENTS.hotspotsForTier(instrumentId, tier);
    if (!hotspots.length) return '';

    var isLangPt = (typeof getLang === 'function' && getLang() === 'pt');

    var out = ['<div class="hotspot-list">'];
    for (var i = 0; i < hotspots.length; i++) {
      var h = hotspots[i];
      var label = isLangPt ? h.labelPt : h.label;
      var desc = isLangPt ? h.descPt : h.desc;
      out.push(
        '<button class="hotspot-list-item" data-action="hotspot" data-hotspot="', h.id, '">',
        '<span class="hotspot-list-num">', (i + 1), '</span>',
        '<span>',
        '<span class="hotspot-list-label">', label, '</span>',
        '<div class="hotspot-list-desc">', desc, '</div>',
        '</span>',
        '</button>'
      );
    }
    out.push('</div>');
    return out.join('');
  }

  /* ================================================================
     INSTRUMENT ICONS (for grid cards)
     Simple line-art SVGs in a consistent 64×64 shell.
     ================================================================ */
  function iconShell(inner) {
    return [
      '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor"',
      ' stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"',
      ' aria-hidden="true">',
      inner,
      '</svg>',
    ].join('');
  }

  var ICONS = {
    violin: iconShell(
      '<path d="M32 8 Q28 4 32 4 Q36 4 32 8"/>' +
      '<rect x="29" y="8" width="6" height="12" rx="1"/>' +
      '<path d="M22 22 Q16 24 16 32 Q16 40 22 44 Q26 46 26 50 Q26 54 22 58 Q20 60 32 60 Q44 60 42 58 Q38 54 38 50 Q38 46 42 44 Q48 40 48 32 Q48 24 42 22 Q38 20 32 20 Q26 20 22 22Z"/>' +
      '<line x1="32" y1="20" x2="32" y2="58"/>' +
      '<circle cx="32" cy="58" r="2"/>'
    ),
    cello: iconShell(
      '<path d="M32 6 Q28 2 32 2 Q36 2 32 6"/>' +
      '<rect x="29" y="6" width="6" height="14" rx="1"/>' +
      '<path d="M20 22 Q12 26 12 36 Q12 46 20 52 Q26 56 26 60 L38 60 Q38 56 44 52 Q52 46 52 36 Q52 26 44 22 Q38 18 32 18 Q26 18 20 22Z"/>' +
      '<line x1="32" y1="18" x2="32" y2="60"/>' +
      '<line x1="32" y1="60" x2="32" y2="64"/>'
    ),
    flute: iconShell(
      '<line x1="8" y1="32" x2="56" y2="32" stroke-width="3"/>' +
      '<circle cx="14" cy="32" r="2"/>' +
      '<circle cx="22" cy="29" r="1.5"/>' +
      '<circle cx="28" cy="29" r="1.5"/>' +
      '<circle cx="34" cy="29" r="1.5"/>' +
      '<circle cx="40" cy="29" r="1.5"/>' +
      '<circle cx="46" cy="29" r="1.5"/>'
    ),
    clarinet: iconShell(
      '<line x1="32" y1="4" x2="32" y2="56" stroke-width="3"/>' +
      '<circle cx="32" cy="6" r="3"/>' +
      '<circle cx="29" cy="18" r="1.5"/>' +
      '<circle cx="35" cy="22" r="1.5"/>' +
      '<circle cx="29" cy="26" r="1.5"/>' +
      '<circle cx="35" cy="30" r="1.5"/>' +
      '<circle cx="29" cy="34" r="1.5"/>' +
      '<path d="M28 54 Q32 60 36 54"/>'
    ),
    trumpet: iconShell(
      '<line x1="10" y1="32" x2="36" y2="32" stroke-width="3"/>' +
      '<circle cx="10" cy="32" r="3"/>' +
      '<line x1="24" y1="28" x2="24" y2="36"/>' +
      '<line x1="28" y1="28" x2="28" y2="36"/>' +
      '<line x1="32" y1="28" x2="32" y2="36"/>' +
      '<path d="M36 32 L50 22 L50 42 Z"/>'
    ),
    'french-horn': iconShell(
      '<circle cx="36" cy="32" r="18"/>' +
      '<circle cx="36" cy="32" r="8"/>' +
      '<path d="M18 32 Q10 28 10 36 Q10 44 18 40"/>' +
      '<path d="M18 32 L8 28"/>'
    ),
    timpani: iconShell(
      '<ellipse cx="32" cy="20" rx="20" ry="8"/>' +
      '<path d="M12 20 L14 48 Q32 56 50 48 L52 20"/>' +
      '<line x1="28" y1="52" x2="24" y2="60"/>' +
      '<line x1="36" y1="52" x2="40" y2="60"/>'
    ),
    'snare-drum': iconShell(
      '<ellipse cx="32" cy="18" rx="18" ry="6"/>' +
      '<path d="M14 18 L14 46 Q32 52 50 46 L50 18"/>' +
      '<line x1="14" y1="40" x2="50" y2="40" stroke-dasharray="2,2"/>'
    ),
    triangle: iconShell(
      '<path d="M32 12 L16 44 L48 44 Z" fill="none"/>' +
      '<circle cx="32" cy="12" r="1.5"/>' +
      '<circle cx="16" cy="44" r="1.5"/>'
    ),
    piano: iconShell(
      '<rect x="8" y="24" width="48" height="24" rx="2"/>' +
      '<line x1="16" y1="24" x2="16" y2="48"/>' +
      '<line x1="24" y1="24" x2="24" y2="48"/>' +
      '<line x1="32" y1="24" x2="32" y2="48"/>' +
      '<line x1="40" y1="24" x2="40" y2="48"/>' +
      '<line x1="48" y1="24" x2="48" y2="48"/>' +
      '<rect x="14" y="24" width="4" height="14" fill="currentColor" opacity="0.7"/>' +
      '<rect x="22" y="24" width="4" height="14" fill="currentColor" opacity="0.7"/>' +
      '<rect x="36" y="24" width="4" height="14" fill="currentColor" opacity="0.7"/>' +
      '<rect x="44" y="24" width="4" height="14" fill="currentColor" opacity="0.7"/>'
    ),
    harp: iconShell(
      '<path d="M20 56 L20 12 Q32 8 44 12 L44 56"/>' +
      '<line x1="24" y1="14" x2="24" y2="52"/>' +
      '<line x1="28" y1="13" x2="28" y2="52"/>' +
      '<line x1="32" y1="12" x2="32" y2="52"/>' +
      '<line x1="36" y1="12" x2="36" y2="52"/>' +
      '<line x1="40" y1="13" x2="40" y2="52"/>'
    ),
    voice: iconShell(
      '<circle cx="32" cy="22" r="10"/>' +
      '<path d="M22 40 Q32 48 42 40"/>' +
      '<path d="M26 32 Q32 36 38 32"/>' +
      '<path d="M18 50 Q32 60 46 50"/>'
    ),
  };

  /* Generic fallback icon based on family */
  var FAMILY_ICONS = {
    strings: iconShell(
      '<path d="M32 8 Q28 4 32 4 Q36 4 32 8"/>' +
      '<rect x="29" y="8" width="6" height="12" rx="1"/>' +
      '<path d="M22 24 Q16 28 16 36 Q16 44 22 48 Q26 50 26 54 L38 54 Q38 50 42 48 Q48 44 48 36 Q48 28 42 24 Q36 20 32 20 Q28 20 22 24Z"/>'
    ),
    woodwinds: iconShell(
      '<line x1="16" y1="32" x2="48" y2="32" stroke-width="3"/>' +
      '<circle cx="18" cy="32" r="2"/>' +
      '<circle cx="26" cy="29" r="1.5"/>' +
      '<circle cx="32" cy="29" r="1.5"/>' +
      '<circle cx="38" cy="29" r="1.5"/>'
    ),
    brass: iconShell(
      '<line x1="12" y1="32" x2="32" y2="32" stroke-width="3"/>' +
      '<circle cx="12" cy="32" r="3"/>' +
      '<path d="M32 32 L48 22 L48 42 Z"/>'
    ),
    percussion: iconShell(
      '<ellipse cx="32" cy="22" rx="18" ry="8"/>' +
      '<path d="M14 22 L14 44 Q32 52 50 44 L50 22"/>'
    ),
    other: iconShell(
      '<circle cx="32" cy="32" r="20"/>' +
      '<text x="32" y="38" text-anchor="middle" font-size="20" stroke="none" fill="currentColor">♪</text>'
    ),
  };

  function instrumentIcon(id, size) {
    var svg = ICONS[id] || null;
    if (!svg) {
      var inst = INSTRUMENTS.get(id);
      svg = FAMILY_ICONS[inst ? inst.family : 'other'];
    }
    if (size) {
      svg = svg.replace('<svg ', '<svg width="' + size + '" height="' + size + '" ');
    }
    return svg;
  }

  function familyIcon(familyId, size) {
    var svg = FAMILY_ICONS[familyId] || FAMILY_ICONS.other;
    if (size) {
      svg = svg.replace('<svg ', '<svg width="' + size + '" height="' + size + '" ');
    }
    return svg;
  }

  /* ================================================================
     SIZE COMPARISON BAR
     Shows relative sizes of related instruments.
     ================================================================ */
  function sizeCompareBar(instrumentId) {
    var inst = INSTRUMENTS.get(instrumentId);
    if (!inst || !inst.related.length) return '';

    var items = [inst];
    for (var i = 0; i < inst.related.length; i++) {
      var rel = INSTRUMENTS.get(inst.related[i]);
      if (rel) items.push(rel);
    }

    /* Find max size for scaling */
    var maxSize = 0;
    for (var j = 0; j < items.length; j++) {
      if (items[j].sizeCm > maxSize) maxSize = items[j].sizeCm;
    }

    var isLangPt = (typeof getLang === 'function' && getLang() === 'pt');
    var cmLabel = (typeof t === 'function') ? t('cm') : 'cm';

    var out = ['<div class="size-compare">'];
    for (var k = 0; k < items.length; k++) {
      var it = items[k];
      var height = Math.max(8, Math.round((it.sizeCm / maxSize) * 120));
      var colorVar = 'var(--family-' + it.family + ')';
      var name = isLangPt ? it.namePt : it.name;
      out.push(
        '<div class="size-compare-item">',
        '<span class="size-compare-cm">', it.sizeCm, ' ', cmLabel, '</span>',
        '<div class="size-compare-bar" style="height:', height, 'px;--family-color:', colorVar, '"></div>',
        '<span class="size-compare-label">', name, '</span>',
        '</div>'
      );
    }
    out.push('</div>');
    return out.join('');
  }

  /* --- Public API --- */
  var Graphics = {
    instrumentSVG: instrumentSVG,
    violinSVG: violinSVG,
    hotspotOverlay: hotspotOverlay,
    drawLeaderLines: drawLeaderLines,
    hotspotInfoCard: hotspotInfoCard,
    hotspotList: hotspotList,
    instrumentIcon: instrumentIcon,
    familyIcon: familyIcon,
    sizeCompareBar: sizeCompareBar,
  };

  if (typeof window !== 'undefined') window.Graphics = Graphics;
  if (typeof module !== 'undefined' && module.exports) module.exports = Graphics;
})();
