/* ============================================================
   Orchestrarium — Application State Machine
   Screens: welcome → home → family → grid → detail
            games → game-play, glossary, settings, credits
   Renders template-literal HTML into #app, one delegated
   click listener keyed on data-action.
   Exposes window.APP, window.render.
   ============================================================ */
(function () {
  'use strict';

  var TIER_KEY = 'orchestrariumTier';
  var TIER_NAMES = { 1: 'Little Kids', 2: 'Explorers', 3: 'Big Kids' };
  var TIER_AGES = { 1: 'Ages 5–7', 2: 'Ages 8–10', 3: 'Ages 11–14' };
  var TIER_EMOJI = { 1: '🧸', 2: '🔎', 3: '🎓' };

  var APP = {
    screen: 'welcome',
    tier: 1,
    family: null,     /* current family id on grid screen */
    instrument: null, /* current instrument id on detail screen */
    game: null,       /* current game id */
    activeHotspot: null,
    selectedStems: {}, /* excerpt stem mute map */
  };

  /* Restore tier from localStorage */
  function loadTier() {
    try {
      var t = parseInt(localStorage.getItem(TIER_KEY), 10);
      if (t === 1 || t === 2 || t === 3) return t;
    } catch (e) {}
    return null;
  }

  function saveTier(t) {
    try { localStorage.setItem(TIER_KEY, String(t)); } catch (e) {}
  }

  /* --- Helpers --- */
  function el(html) { return html; }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function localized(obj, base) {
    if (!obj) return '';
    if (getLang() === 'pt' && obj[base + 'Pt']) return obj[base + 'Pt'];
    return obj[base] || '';
  }
  function instName(inst) { return getLang() === 'pt' ? inst.namePt : inst.name; }

  function familyColorVar(family) { return 'var(--family-' + family + ')'; }

  /* ================================================================
     TOP BAR
     ================================================================ */
  function renderTopbar() {
    var showBack = APP.screen !== 'welcome';
    var title = topbarTitle();
    var out = ['<header class="topbar">'];
    if (showBack) {
      out.push('<button class="topbar-back" data-action="back" aria-label="', t('Back'), '">←</button>');
    }
    out.push('<div class="topbar-title">', esc(title), '</div>');
    out.push('<button class="topbar-action" data-action="nav-settings" aria-label="', t('Settings'), '">⚙</button>');
    out.push('</header>');
    return out.join('');
  }

  function topbarTitle() {
    switch (APP.screen) {
      case 'home': return t('Orchestrarium');
      case 'family': return t('Explore');
      case 'grid': return t(cap(APP.family || ''));
      case 'detail': {
        var inst = INSTRUMENTS.get(APP.instrument);
        return inst ? instName(inst) : t('Explore');
      }
      case 'games': return t('Play');
      case 'game': {
        var g = Games.GAMES[APP.game];
        return g ? t(g.title) : t('Play');
      }
      case 'glossary': return t('Glossary');
      case 'settings': return t('Settings');
      case 'credits': return t('Credits');
      default: return t('Orchestrarium');
    }
  }

  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  /* ================================================================
     SCREEN: WELCOME / TIER PICKER
     ================================================================ */
  function renderWelcome() {
    var lang = getLang();
    var out = ['<div class="welcome">'];
    out.push('<div class="welcome-lang-toggle" role="group" aria-label="', t('Language'), '">');
    out.push('<button class="lang-pill', lang === 'en' ? ' active' : '', '" data-action="set-lang" data-lang="en">', t('English'), '</button>');
    out.push('<button class="lang-pill', lang === 'pt' ? ' active' : '', '" data-action="set-lang" data-lang="pt">', t('Português (Brasil)'), '</button>');
    out.push('</div>');
    out.push('<img class="welcome-logo" src="icon.svg" alt="">');
    out.push('<h1 class="welcome-title">', t('Welcome!'), '</h1>');
    out.push('<p class="welcome-sub">', t('Choose your level to get started.'), '</p>');
    out.push('<div class="welcome-tier-label">', t('CHOOSE YOUR LEVEL'), '</div>');
    out.push('<div class="tier-picker">');
    for (var tier = 1; tier <= 3; tier++) {
      out.push(
        '<button class="tier-card" data-action="pick-tier" data-tier="', tier, '">',
        '<span class="tier-card-emoji">', TIER_EMOJI[tier], '</span>',
        '<span class="tier-card-body">',
        '<span class="tier-card-name">', t(TIER_NAMES[tier]), '</span>',
        '<span class="tier-card-ages">', t(TIER_AGES[tier]), '</span>',
        '</span>',
        '</button>'
      );
    }
    out.push('</div>');
    out.push('<p class="home-sub" style="margin-top:var(--sp-6)">',
      t('Learn about the instruments of the orchestra.'), '</p>');
    out.push('</div>');
    return out.join('');
  }

  /* ================================================================
     SCREEN: HOME
     ================================================================ */
  function renderHome() {
    var explored = Games.Progress.exploredCount();
    var out = ['<div class="home-header">'];
    out.push('<h1 class="home-title">', t('Orchestrarium'), '</h1>');
    out.push('<p class="home-sub">', t('Instruments of the Orchestra'), ' · ',
      t(TIER_NAMES[APP.tier]), '</p>');
    out.push('</div>');

    out.push('<div class="home-nav">');
    out.push('<div class="nav-section-label">', t('Explore'), '</div>');
    out.push(
      '<button class="nav-card" data-action="nav-explore">',
      '<span class="nav-card-icon" style="background:var(--accent-soft)">🎻</span>',
      '<span class="nav-card-body">',
      '<span class="nav-card-title">', t('Explore'), '</span>',
      '<span class="nav-card-desc">', t('Meet the instruments and hear how they sound.'), '</span>',
      '</span></button>'
    );

    out.push('<div class="nav-section-label" style="margin-top:var(--sp-2)">', t('Play'), '</div>');
    out.push(
      '<button class="nav-card" data-action="nav-games">',
      '<span class="nav-card-icon" style="background:var(--accent-soft)">🎮</span>',
      '<span class="nav-card-body">',
      '<span class="nav-card-title">', t('Play'), '</span>',
      '<span class="nav-card-desc">', t('Games and quizzes to test what you learned.'), '</span>',
      '</span>',
      '<span class="nav-card-badge">', explored, '/', INSTRUMENTS.availableAt(APP.tier).length, '</span>',
      '</button>'
    );

    out.push('<div class="nav-section-label" style="margin-top:var(--sp-2)">', t('More'), '</div>');
    out.push(
      '<button class="nav-card" data-action="nav-glossary">',
      '<span class="nav-card-icon" style="background:var(--accent-soft)">📖</span>',
      '<span class="nav-card-body">',
      '<span class="nav-card-title">', t('Glossary'), '</span>',
      '</span></button>',
      '<button class="nav-card" data-action="nav-settings">',
      '<span class="nav-card-icon" style="background:var(--accent-soft)">⚙</span>',
      '<span class="nav-card-body">',
      '<span class="nav-card-title">', t('Settings'), '</span>',
      '<span class="nav-card-desc">', t('Level'), ': ', t(TIER_NAMES[APP.tier]), '</span>',
      '</span></button>',
      '<button class="nav-card" data-action="nav-credits">',
      '<span class="nav-card-icon" style="background:var(--accent-soft)">ℹ️</span>',
      '<span class="nav-card-body">',
      '<span class="nav-card-title">', t('Credits'), '</span>',
      '</span></button>'
    );
    out.push('</div>');
    return out.join('');
  }

  /* ================================================================
     SCREEN: FAMILY MAP
     ================================================================ */
  function renderFamilyMap() {
    var out = ['<div class="family-map">'];
    for (var i = 0; i < INSTRUMENTS.FAMILY_ORDER.length; i++) {
      var fam = INSTRUMENTS.FAMILY_ORDER[i];
      var meta = INSTRUMENTS.FAMILIES[fam];
      var count = INSTRUMENTS.familyCount(fam, APP.tier);
      if (!count) continue;
      out.push(
        '<button class="family-tile" data-action="open-family" data-family="', fam, '"',
        ' style="--family-color:', familyColorVar(fam), '">',
        '<span class="family-tile-icon">', Graphics.familyIcon(fam, 40), '</span>',
        '<span class="family-tile-name">', t(cap(fam)), '</span>',
        '<span class="family-tile-count">', count, ' ', t('instruments'), '</span>',
        '</button>'
      );
    }
    out.push('</div>');
    return out.join('');
  }

  /* ================================================================
     SCREEN: INSTRUMENT GRID
     ================================================================ */
  function renderGrid() {
    var list = INSTRUMENTS.byFamilyAndTier(APP.family, APP.tier);
    var out = ['<div class="instrument-grid">'];
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      var inst = INSTRUMENTS.get(r.id);
      var explored = Games.Progress.isExplored(r.id);
      out.push(
        '<button class="instrument-card" data-action="open-instrument" data-id="', r.id, '"',
        ' style="--family-color:', familyColorVar(r.family), '">',
        '<span class="instrument-card-icon" style="color:', familyColorVar(r.family), '">',
        Graphics.instrumentIcon(r.id, 64),
        '</span>',
        '<span class="instrument-card-name">', esc(instName(inst)),
        explored ? ' ✓' : '', '</span>',
        '<span class="instrument-card-family">', t(cap(r.family)), '</span>',
        '</button>'
      );
    }
    out.push('</div>');
    return out.join('');
  }

  /* ================================================================
     SCREEN: INSTRUMENT DETAIL (DK spread)
     ================================================================ */
  function renderDetail() {
    var inst = INSTRUMENTS.get(APP.instrument);
    if (!inst) return '<p>' + t('Not found') + '</p>';

    /* Mark explored as soon as detail is opened */
    Games.Progress.markExplored(inst.id);

    var out = [];
    out.push('<div class="detail-spread">');

    /* Hero: diagram + hotspots + labels */
    out.push('<div class="detail-hero">');
    out.push('<div class="detail-diagram" id="detail-diagram" data-inst="', inst.id, '">');
    out.push(Graphics.instrumentSVG(inst.id));
    out.push(Graphics.hotspotOverlay(inst.id, APP.tier));
    out.push('</div>');
    out.push('</div>');

    /* Hero title band */
    out.push('<div class="detail-section" style="padding-top:var(--sp-3)">');
    out.push('<div style="display:flex;align-items:baseline;gap:var(--sp-3);flex-wrap:wrap">');
    out.push('<span style="font-size:var(--fs-title);font-weight:800">', esc(instName(inst)), '</span>');
    out.push('<span class="tier-badge">', t(cap(inst.family)), '</span>');
    out.push('</div>');
    out.push('</div>');

    /* Audio: Hear it! */
    out.push('<div class="detail-section">');
    out.push('<div class="detail-section-title">', t('Hear it!'), '</div>');
    out.push('<div class="audio-btn-row">');
    out.push(
      '<button class="audio-btn primary" data-action="hear-it" data-id="', inst.id, '" id="hear-btn">',
      '<span class="audio-btn-icon">🔊</span>',
      '<span>', inst.hasDetail || Audio.sampleExists(inst.id) ? t('Solo') : t('Hear it!'), '</span>',
      '</button>'
    );
    if (inst.excerpt) {
      out.push(
        '<button class="audio-btn secondary" data-action="play-excerpt" data-id="', inst.id, '">',
        '<span class="audio-btn-icon">🎼</span>',
        '<span>', t('In the orchestra'), ' — ', esc(localized(inst.excerpt, 'stemLabel')), '</span>',
        '</button>'
      );
    }
    out.push('</div>');
    out.push('</div>');

    /* Orchestra mixer — interactive synchronized multitrack */
    var isStemInstrument = INSTRUMENTS.ORCHESTRA_STEMS.some(function (s) { return s.id === inst.id; });
    if (isStemInstrument) {
      out.push('<div class="detail-section orchestra-mixer">');
      out.push('<div class="detail-section-title">', t('Play with the orchestra'), '</div>');
      out.push('<p class="mixer-hint">', t('Mute or unmute each part and hear how they fit together.'), '</p>');
      out.push('<div class="audio-btn-row">');
      out.push(
        '<button class="audio-btn primary" data-action="mixer-play">',
        '<span class="audio-btn-icon">▶️</span><span>', t('Play all'), '</span></button>'
      );
      out.push(
        '<button class="audio-btn secondary" data-action="mixer-stop">',
        '<span class="audio-btn-icon">⏹️</span><span>', t('Stop'), '</span></button>'
      );
      out.push('</div>');
      out.push('<ul class="mixer-tracks">');
      INSTRUMENTS.ORCHESTRA_STEMS.forEach(function (s) {
        var muted = !!APP.selectedStems[s.url];
        out.push(
          '<li class="mixer-track', muted ? ' muted' : '', '">',
          '<button class="mixer-toggle" data-action="mixer-toggle" data-stem-url="', s.url, '" aria-pressed="', muted ? 'true' : 'false', '">',
          '<span class="mixer-dot"></span>',
          '<span>', esc(localized(s, 'label')), '</span>',
          '</button></li>'
        );
      });
      out.push('</ul>');
      out.push('</div>');
    }

    /* Parts of the instrument (hotspot list — Tier 1 & mobile fallback) */
    var hotspots = INSTRUMENTS.hotspotsForTier(inst.id, APP.tier);
    if (hotspots.length) {
      out.push('<div class="detail-section">');
      out.push('<div class="detail-section-title">', t('Parts of the instrument'), '</div>');
      out.push(Graphics.hotspotList(inst.id, APP.tier));
      out.push('</div>');
    }

    /* Facts (cumulative by tier) */
    var facts = INSTRUMENTS.factsForTier(inst.id, APP.tier);
    if (facts.length) {
      out.push('<div class="detail-section">');
      out.push('<div class="detail-section-title">', t('Facts'), '</div>');
      out.push('<div class="fact-nuggets">');
      for (var i = 0; i < facts.length; i++) {
        out.push('<div class="fact-nugget">', esc(localized(facts[i], 'en') || localized(facts[i], 'pt')),
          '</div>');
      }
      out.push('</div>');
      out.push('</div>');
    }

    /* Did you know? */
    if (inst.didYouKnow) {
      out.push('<div class="detail-section">');
      out.push('<div class="fact-box">');
      out.push('<div class="fact-box-title">', t('Did you know?'), '</div>');
      out.push(esc(localized(inst.didYouKnow, 'en')));
      out.push('</div>');
      out.push('</div>');
    }

    /* Size comparison */
    if (inst.related.length) {
      out.push('<div class="detail-section">');
      out.push('<div class="detail-section-title">', t('Size comparison'), '</div>');
      out.push(Graphics.sizeCompareBar(inst.id));
      out.push('</div>');
    }

    /* Related instruments */
    if (inst.related.length) {
      out.push('<div class="detail-section">');
      out.push('<div class="detail-section-title">', t('Related instruments'), '</div>');
      out.push('<div class="related-row">');
      for (var j = 0; j < inst.related.length; j++) {
        var rel = INSTRUMENTS.get(inst.related[j]);
        if (!rel) continue;
        out.push(
          '<button class="related-chip" data-action="open-instrument" data-id="', rel.id, '">',
          '<span class="related-chip-icon">', rel.emoji, '</span>',
          '<span>', esc(instName(rel)), '</span>',
          '</button>'
        );
      }
      out.push('</div>');
      out.push('</div>');
    }

    out.push('</div>'); /* detail-spread */
    return out.join('');
  }

  /* ================================================================
     SCREEN: GAMES LIST
     ================================================================ */
  function renderGames() {
    var out = ['<div class="games-grid">'];
    var order = ['quiz', 'bingo', 'build'];
    for (var i = 0; i < order.length; i++) {
      var g = Games.GAMES[order[i]];
      var unlocked = Games.isUnlocked(g.id);
      out.push(
        '<button class="game-card', unlocked ? '' : ' locked', '"',
        unlocked ? ' data-action="open-game" data-game="' + g.id + '"' : ' disabled',
        '>',
        '<span class="game-card-icon">', g.emoji, '</span>',
        '<span class="game-card-body">',
        '<span class="game-card-title">', t(g.title), '</span>',
        '<span class="game-card-desc">', t(g.desc), '</span>',
        '</span>'
      );
      if (!unlocked) {
        out.push('<span class="game-card-lock">🔒</span>');
      } else {
        var best = Games.Progress.best(g.id);
        if (best) out.push('<span class="nav-card-badge">', t('Best'), ' ', best, '</span>');
      }
      out.push('</button>');
    }
    out.push('</div>');
    if (!Games.isUnlocked('bingo')) {
      out.push('<p class="home-sub" style="margin-top:var(--sp-4);text-align:center">',
        Games.unlockHint('bingo'), '</p>');
    }
    return out.join('');
  }

  function renderGamePlay() {
    var g = Games.GAMES[APP.game];
    if (!g) return '';
    return Games.render(APP.game);
  }

  /* ================================================================
     SCREEN: GLOSSARY
     ================================================================ */
  var GLOSSARY_TERMS = [
    'Family', 'Orchestra', 'Conductor', 'Timbre', 'Pitch', 'Vibration',
    'Resonance', 'Bow', 'Reed', 'Embouchure', 'Section', 'Solo', 'Score',
  ];

  function renderGlossary() {
    var out = ['<div class="glossary-list">'];
    for (var i = 0; i < GLOSSARY_TERMS.length; i++) {
      var term = GLOSSARY_TERMS[i];
      out.push(
        '<div class="glossary-item">',
        '<div class="glossary-term">', esc(t(term)), '</div>',
        '<div class="glossary-def">', esc(t(glossaryDef(term))), '</div>',
        '</div>'
      );
    }
    out.push('</div>');
    return out.join('');
  }

  function glossaryDef(term) {
    var defs = {
      Family: 'A group of instruments that are similar in how they make sound.',
      Orchestra: 'A large group of musicians playing together, led by a conductor.',
      Conductor: 'The person who leads the orchestra, setting the tempo and style.',
      Timbre: 'The unique quality of a sound that lets you tell instruments apart.',
      Pitch: 'How high or low a sound is.',
      Vibration: 'A rapid back-and-forth movement that produces sound.',
      Resonance: 'The deepening and enriching of sound inside a hollow space.',
      Bow: 'A stick with hair, used to play string instruments.',
      Reed: 'A thin piece of material that vibrates to make sound in woodwind instruments.',
      Embouchure: 'The way a player shapes their mouth to blow into an instrument.',
      Section: 'A group of instruments of the same family playing together.',
      Solo: 'A featured player who plays alone, or plays a prominent part.',
      Score: 'The written form of music.',
    };
    return defs[term] || term;
  }

  /* ================================================================
     SCREEN: SETTINGS
     ================================================================ */
  function renderSettings() {
    var lang = getLang();
    var out = ['<div class="settings-list">'];

    /* Language */
    out.push('<div class="settings-item">');
    out.push('<span class="settings-label">', t('Language'), '</span>');
    out.push('<span class="settings-value">', esc(t(lang === 'pt' ? 'Português (Brasil)' : 'English')), '</span>');
    out.push('</div>');
    out.push('<div class="settings-item">');
    out.push('<button class="audio-btn secondary" data-action="set-lang" data-lang="en"',
      lang === 'en' ? ' disabled' : '', ' style="flex:1">', t('English'), '</button>');
    out.push('<button class="audio-btn secondary" data-action="set-lang" data-lang="pt"',
      lang === 'pt' ? ' disabled' : '', ' style="flex:1">', t('Português (Brasil)'), '</button>');
    out.push('</div>');

    /* Level */
    out.push('<div class="settings-item">');
    out.push('<span class="settings-label">', t('Level'), '</span>');
    out.push('<span class="settings-value">', t(TIER_NAMES[APP.tier]), '</span>');
    out.push('</div>');
    out.push('<div class="settings-item">');
    for (var tier = 1; tier <= 3; tier++) {
      out.push('<button class="audio-btn secondary" data-action="pick-tier" data-tier="', tier, '"',
        tier === APP.tier ? ' disabled' : '', ' style="flex:1">', t(TIER_NAMES[tier]), '</button>');
    }
    out.push('</div>');

    /* Audio */
    out.push('<div class="settings-item">');
    out.push('<span class="settings-label">', t('Audio'), '</span>');
    out.push('<span class="settings-value">', Audio.muted ? '🔇' : '🔊', '</span>');
    out.push('</div>');
    out.push('<div class="settings-item">');
    out.push('<button class="audio-btn secondary" data-action="toggle-mute" style="flex:1">',
      Audio.muted ? '🔇' : '🔊', '</button>');
    out.push('</div>');

    /* Offline download */
    out.push('<div class="settings-item">');
    out.push('<span class="settings-label">', t('Download for offline use'), '</span>');
    out.push('<button class="audio-btn secondary" data-action="precache" id="precache-btn">',
      t('Download for offline use'), '</button>');
    out.push('</div>');

    /* About */
    out.push('<div class="settings-item">');
    out.push('<span class="settings-label">', t('Version'), '</span>');
    out.push('<span class="settings-value">', t('Orchestrarium'), ' 1.0', '</span>');
    out.push('</div>');
    out.push('<div class="settings-item">');
    out.push('<button class="audio-btn secondary" data-action="nav-credits" style="flex:1">',
      t('Credits'), '</button>');
    out.push('</div>');

    out.push('</div>');
    return out.join('');
  }

  /* ================================================================
     SCREEN: CREDITS
     ================================================================ */
  function renderCredits() {
    var out = ['<div class="credits-page">'];
    out.push('<h1>', t('Credits'), '</h1>');
    out.push('<p>', t('Orchestrarium'), ' — ', t('Instruments of the Orchestra'), '</p>');
    out.push('<p style="margin-top:var(--sp-4)">',
      'Instrument recordings: <a href="https://philharmonia.co.uk/" target="_blank" rel="noopener">Philharmonia Orchestra</a> ',
      'sample library (CC BY-SA 3.0) and ',
      '<a href="https://github.com/sgossner/VSCO-2-CE" target="_blank" rel="noopener">VSCO 2: Community Edition</a> (CC0 1.0).</p>');
    out.push('<p style="margin-top:var(--sp-3)">',
      'Orchestral excerpt: W. A. Mozart, <em>Le nozze di Figaro</em> Overture — ',
      'Musopen Symphony Orchestra, via <a href="https://archive.org/" target="_blank" rel="noopener">Musopen</a> (CC0). ',
      'Per-section multitrack stems extracted from the original session recording.</p>');
    out.push('<p style="margin-top:var(--sp-3)">',
      'Celesta and voice use built-in synthesized tones.</p>');
    out.push('<p style="margin-top:var(--sp-3)">',
      'Built with the Web Audio API. No tracking, no ads.</p>');
    out.push('<button class="audio-btn secondary" data-action="back" style="margin-top:var(--sp-5);max-width:200px">',
      t('Back'), '</button>');
    out.push('</div>');
    return out.join('');
  }

  /* ================================================================
     RENDER DISPATCH
     ================================================================ */
  function renderScreen() {
    switch (APP.screen) {
      case 'welcome': return renderWelcome();
      case 'home': return renderHome();
      case 'family': return renderFamilyMap();
      case 'grid': return renderGrid();
      case 'detail': return renderDetail();
      case 'games': return renderGames();
      case 'game': return renderGamePlay();
      case 'glossary': return renderGlossary();
      case 'settings': return renderSettings();
      case 'credits': return renderCredits();
      default: return renderWelcome();
    }
  }

  function render() {
    var app = document.getElementById('app');
    if (!app) return;

    /* Welcome screen is full-bleed (no topbar) */
    if (APP.screen === 'welcome') {
      app.innerHTML = renderScreen();
      return;
    }

    var body = renderScreen();
    app.innerHTML =
      renderTopbar() +
      '<main class="screen" id="screen-body">' + body + '</main>' +
      '<div class="sheet-overlay" id="sheet-overlay" data-action="close-hotspot"></div>' +
      '<div id="hotspot-card-mount"></div>';

    /* After paint: draw leader lines + wire hotspot info */
    if (APP.screen === 'detail') {
      requestAnimationFrame(function () {
        Graphics.drawLeaderLines(APP.instrument, APP.tier);
      });
    }
  }

  /* ================================================================
     ACTIONS (delegated)
     ================================================================ */
  function handleClick(e) {
    var target = e.target.closest('[data-action]');
    if (!target) return;
    var action = target.getAttribute('data-action');

    /* Let games consume their own actions first */
    if (APP.screen === 'game' && Games.handleAction(action, target, APP.tier)) {
      render();
      return;
    }

    switch (action) {
      case 'pick-tier':
        APP.tier = parseInt(target.getAttribute('data-tier'), 10);
        saveTier(APP.tier);
        document.documentElement.setAttribute('data-tier', String(APP.tier));
        APP.screen = 'home';
        render();
        break;

      case 'back':
        goBack();
        break;

      case 'nav-explore':
        APP.screen = 'family';
        render();
        break;
      case 'open-family':
        APP.family = target.getAttribute('data-family');
        APP.screen = 'grid';
        render();
        break;
      case 'open-instrument':
        APP.instrument = target.getAttribute('data-id');
        APP.activeHotspot = null;
        APP.screen = 'detail';
        render();
        break;

      case 'nav-games':
        APP.screen = 'games';
        render();
        break;
      case 'open-game':
        APP.game = target.getAttribute('data-game');
        Games.start(APP.game, APP.tier);
        APP.screen = 'game';
        render();
        break;
      case 'game-exit':
        Audio.stopAll();
        APP.screen = 'games';
        render();
        break;

      case 'nav-glossary':
        APP.screen = 'glossary';
        render();
        break;
      case 'nav-settings':
        APP.screen = 'settings';
        render();
        break;
      case 'nav-credits':
        APP.screen = 'credits';
        render();
        break;

      case 'set-lang':
        setLang(target.getAttribute('data-lang'));
        render();
        break;

      case 'toggle-mute':
        Audio.setMuted(!Audio.muted);
        render();
        break;

      case 'precache':
        startPrecache(target);
        break;

      case 'hear-it':
        playHearIt(target);
        break;
      case 'play-excerpt':
        Audio.playStem(target.getAttribute('data-id'));
        markPlaying(target);
        break;

      case 'mixer-play': {
        var stems = INSTRUMENTS.ORCHESTRA_STEMS.map(function (s) { return s.url; });
        Audio.playStems(stems, APP.selectedStems);
        break;
      }
      case 'mixer-stop':
        Audio.stop();
        break;
      case 'mixer-toggle': {
        var url = target.getAttribute('data-stem-url');
        var nowMuted = !APP.selectedStems[url];
        if (nowMuted) APP.selectedStems[url] = true; else delete APP.selectedStems[url];
        Audio.setStemMuted(url, nowMuted);
        render();
        break;
      }

      case 'hotspot':
        openHotspot(target.getAttribute('data-hotspot'));
        break;
      case 'close-hotspot':
        closeHotspot();
        break;

      default:
        break;
    }
  }

  /* --- Back navigation --- */
  function goBack() {
    Audio.stopAll();
    switch (APP.screen) {
      case 'home': APP.screen = 'welcome'; break;
      case 'family': APP.screen = 'home'; break;
      case 'grid': APP.screen = 'family'; break;
      case 'detail': APP.screen = 'grid'; break;
      case 'games': APP.screen = 'home'; break;
      case 'game': APP.screen = 'games'; break;
      case 'glossary':
      case 'settings':
      case 'credits':
        APP.screen = 'home'; break;
      default: APP.screen = 'welcome';
    }
    render();
  }

  /* --- Audio helpers --- */
  function playHearIt(btn) {
    Audio.hearIt(btn.getAttribute('data-id'));
    markPlaying(btn);
  }

  function markPlaying(btn) {
    btn.classList.add('playing');
    setTimeout(function () { btn.classList.remove('playing'); }, 2500);
  }

  function startPrecache(btn) {
    btn.textContent = t('Downloading...');
    Audio.precacheAll(function (done, total) {
      btn.textContent = done >= total
        ? t('Downloaded')
        : t('Downloading...') + ' ' + done + '/' + total;
    }).then(function () {
      btn.textContent = t('Downloaded');
    });
  }

  /* --- Hotspot info card --- */
  function openHotspot(hotspotId) {
    APP.activeHotspot = hotspotId;

    /* Highlight the active hotspot */
    var dots = document.querySelectorAll('.hotspot');
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('active',
        dots[i].getAttribute('data-hotspot') === hotspotId);
    }

    var mount = document.getElementById('hotspot-card-mount');
    var overlay = document.getElementById('sheet-overlay');
    if (!mount) return;

    mount.innerHTML = Graphics.hotspotInfoCard(APP.instrument, hotspotId);
    requestAnimationFrame(function () {
      var card = document.getElementById('hotspot-info');
      if (card) card.classList.add('open');
      if (overlay) overlay.classList.add('open');
    });
  }

  function closeHotspot() {
    APP.activeHotspot = null;
    var card = document.getElementById('hotspot-info');
    var overlay = document.getElementById('sheet-overlay');
    if (card) {
      card.classList.remove('open');
      setTimeout(function () {
        var mount = document.getElementById('hotspot-card-mount');
        if (mount) mount.innerHTML = '';
      }, 260);
    }
    if (overlay) overlay.classList.remove('open');
    var dots = document.querySelectorAll('.hotspot');
    for (var i = 0; i < dots.length; i++) dots[i].classList.remove('active');
  }

  /* ================================================================
     BOOT
     ================================================================ */
  function boot() {
    document.documentElement.setAttribute('lang', getLang() === 'pt' ? 'pt-BR' : 'en');

    var saved = loadTier();
    if (saved) {
      APP.tier = saved;
      document.documentElement.setAttribute('data-tier', String(saved));
      APP.screen = 'home';
    } else {
      APP.screen = 'welcome';
    }

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && APP.activeHotspot) closeHotspot();
    });

    render();
  }

  /* --- Public API --- */
  window.APP = APP;
  window.render = render;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
