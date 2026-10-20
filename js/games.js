/* ============================================================
   Orchestrarium — Games Engine
   Three games, gated by exploration progress:
     • quiz   — "What Instrument Is This?" (unlocked immediately)
     • bingo  — Instrument Bingo (unlock after 3 explored)
     • build  — Build the Orchestra (unlock after 6 explored)
   Each game is a small state machine rendered into #screen-body by
   app.js. Exposes window.Games.
   ============================================================ */
(function () {
  'use strict';

  var STORE_KEY = 'orchestrariumProgress';

  /* ================================================================
     PROGRESS
     ================================================================ */
  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { explored: {}, best: {} };
  }

  function saveProgress(p) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch (e) {}
    return p;
  }

  var Progress = {
    data: loadProgress(),

    markExplored: function (id) {
      if (!this.data.explored[id]) {
        this.data.explored[id] = Date.now();
        saveProgress(this.data);
      }
    },

    exploredCount: function () {
      return Object.keys(this.data.explored).length;
    },

    isExplored: function (id) {
      return !!this.data.explored[id];
    },

    best: function (game) {
      return this.data.best[game] || 0;
    },

    setBest: function (game, score) {
      if (score > (this.data.best[game] || 0)) {
        this.data.best[game] = score;
        saveProgress(this.data);
        return true; /* new best */
      }
      return false;
    },
  };

  /* ================================================================
     UNLOCK RULES
     ================================================================ */
  function isUnlocked(game) {
    if (game === 'quiz') return true;
    if (game === 'bingo') return Progress.exploredCount() >= 3;
    if (game === 'build') return Progress.exploredCount() >= 6;
    return false;
  }

  function unlockHint(game) {
    var need = game === 'bingo' ? 3 : 6;
    var have = Progress.exploredCount();
    return t('Explore more instruments to unlock!') +
      ' (' + have + '/' + need + ' ' + t('instrument(s) explored') + ')';
  }

  /* ================================================================
     SHARED HELPERS
     ================================================================ */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function pool(tier) {
    return INSTRUMENTS.availableAt(tier);
  }

  function distractor(instrument, all, count) {
    var others = all.filter(function (r) { return r.id !== instrument.id; });
    /* Prefer same-family distractors for a harder, more meaningful quiz */
    var same = shuffle(others.filter(function (r) { return r.family === instrument.family; }));
    var rest = shuffle(others.filter(function (r) { return r.family !== instrument.family; }));
    return same.concat(rest).slice(0, count);
  }

  function localizedName(inst) {
    return (getLang() === 'pt') ? inst.namePt : inst.name;
  }

  /* ================================================================
     GAME 1 — WHAT INSTRUMENT IS THIS? (quiz)
     ================================================================ */
  var Quiz = {
    round: 0,
    total: 8,
    score: 0,
    answer: null,
    choices: [],
    state: 'question', /* question | reveal | done */

    start: function (tier) {
      this.round = 0;
      this.score = 0;
      this.tier = tier;
      this.state = 'question';
      this.next();
    },

    next: function () {
      var p = pool(this.tier);
      this.answer = p[Math.floor(Math.random() * p.length)];
      this.choices = shuffle([this.answer].concat(distractor(this.answer, p, 3)));
      this.state = 'question';
    },

    answerWith: function (id) {
      if (this.state !== 'question') return;
      if (id === this.answer.id) {
        this.score++;
        this.state = 'reveal';
        this.lastCorrect = true;
      } else {
        this.state = 'reveal';
        this.lastCorrect = false;
      }
    },

    advance: function () {
      this.round++;
      if (this.round >= this.total) {
        this.state = 'done';
        this.newBest = Progress.setBest('quiz', this.score);
      } else {
        this.next();
      }
    },
  };

  function renderQuiz() {
    var inst = Quiz.answer;
    var out = [];

    out.push('<div class="game-play">');
    out.push('<div class="game-progress">' +
      '<span>' + t('Score') + ': ' + Quiz.score + '</span>' +
      '<span>' + (Quiz.round + 1) + ' / ' + Quiz.total + '</span>' +
      '</div>');

    if (Quiz.state === 'done') {
      var stars = scoreStars(Quiz.score, Quiz.total);
      out.push('<div class="game-result">');
      out.push('<div class="game-result-stars">' + stars + '</div>');
      out.push('<div class="game-result-score">' +
        t('Your score:') + ' ' + Quiz.score + ' / ' + Quiz.total + ' ' + t('stars') + '</div>');
      if (Quiz.newBest) out.push('<div class="game-newbest">' + t('New best!') + '</div>');
      out.push('<button class="audio-btn primary" data-action="game-again" data-game="quiz">' +
        t('Play again') + '</button>');
      out.push('<button class="audio-btn secondary" data-action="game-exit">' + t('Done') + '</button>');
      out.push('</div>');
      out.push('</div>');
      return out.join('');
    }

    out.push('<div class="game-question">' + t('Which instrument is this?') + '</div>');
    out.push('<button class="game-play-audio" data-action="quiz-play" data-id="' + inst.id + '">' +
      '<span class="game-play-icon">🔊</span><span>' + t('Listen') + '</span></button>');

    out.push('<div class="quiz-choices">');
    for (var i = 0; i < Quiz.choices.length; i++) {
      var c = Quiz.choices[i];
      var cls = 'quiz-choice';
      if (Quiz.state === 'reveal') {
        if (c.id === Quiz.answer.id) cls += ' correct';
        else if (c.id === Quiz.lastPick) cls += ' wrong';
      }
      out.push('<button class="' + cls + '" data-action="quiz-answer" data-id="' + c.id + '">' +
        '<span class="quiz-choice-icon" data-id="' + c.id + '">' + Graphics.instrumentIcon(c.id, 40) + '</span>' +
        '<span>' + localizedName(c) + '</span></button>');
    }
    out.push('</div>');

    if (Quiz.state === 'reveal') {
      out.push('<div class="quiz-feedback ' + (Quiz.lastCorrect ? 'ok' : 'no') + '">' +
        (Quiz.lastCorrect ? t('Correct!') : t('Try again!')) + '</div>');
      out.push('<button class="audio-btn primary" data-action="quiz-next">' +
        t('Next') + '</button>');
    }

    out.push('</div>');
    return out.join('');
  }

  function scoreStars(score, total) {
    var ratio = total ? score / total : 0;
    var n = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : ratio >= 0.3 ? 1 : 0;
    var s = '';
    for (var i = 0; i < 3; i++) s += (i < n ? '★' : '☆');
    return s;
  }

  /* ================================================================
     GAME 2 — INSTRUMENT BINGO
     ================================================================ */
  var Bingo = {
    card: [],
    marked: {},
    called: [],
    callsLeft: 0,
    state: 'playing', /* playing | bingo */

    start: function (tier) {
      var p = pool(tier);
      /* 3×3 = 9 cells drawn from the pool */
      this.card = shuffle(p).slice(0, Math.min(9, p.length));
      this.marked = {};
      this.called = [];
      this.callsLeft = Math.min(this.card.length, 8);
      this.state = 'playing';
      this.callNext();
    },

    callNext: function () {
      var remaining = this.card.filter(function (c) { return true; });
      var notCalled = this.card.filter(function (c) {
        return Bingo.called.indexOf(c.id) === -1;
      });
      if (!notCalled.length) return;
      var pick = notCalled[Math.floor(Math.random() * notCalled.length)];
      this.called.push(pick.id);
    },

    currentCall: function () {
      return this.called[this.called.length - 1];
    },

    mark: function (id) {
      if (this.state !== 'playing') return;
      if (id === this.currentCall()) {
        this.marked[id] = true;
        if (this.checkBingo()) {
          this.state = 'bingo';
          this.newBest = Progress.setBest('bingo', Object.keys(this.marked).length);
          return;
        }
      }
    },

    checkBingo: function () {
      /* A full row, column, or diagonal of marked cells */
      var n = 3, cells = [];
      for (var i = 0; i < n * n; i++) {
        cells.push(this.card[i] ? !!this.marked[this.card[i].id] : false);
      }
      var lines = [];
      for (var r = 0; r < n; r++) lines.push([cells[r * n], cells[r * n + 1], cells[r * n + 2]]);
      for (var c = 0; c < n; c++) lines.push([cells[c], cells[c + n], cells[c + 2 * n]]);
      lines.push([cells[0], cells[4], cells[8]]);
      lines.push([cells[2], cells[4], cells[6]]);
      return lines.some(function (l) { return l.every(Boolean); });
    },
  };

  function renderBingo() {
    var out = ['<div class="game-play">'];
    out.push('<div class="game-progress">' +
      '<span>' + t('Instrument Bingo') + '</span>' +
      '<span>' + t('Your card') + '</span></div>');

    if (Bingo.state === 'bingo') {
      out.push('<div class="game-result"><div class="game-bingo-word">' + t('BINGO!') + '</div>');
      if (Bingo.newBest) out.push('<div class="game-newbest">' + t('New best!') + '</div>');
      out.push('<button class="audio-btn primary" data-action="game-again" data-game="bingo">' +
        t('Play again') + '</button>');
      out.push('<button class="audio-btn secondary" data-action="game-exit">' + t('Done') + '</button>');
      out.push('</div></div>');
      return out.join('');
    }

    var cur = INSTRUMENTS.get(Bingo.currentCall());
    out.push('<div class="bingo-call">');
    out.push('<span>' + t('Listen') + ':</span>');
    out.push('<button class="game-play-audio small" data-action="bingo-play" data-id="' + cur.id + '">' +
      '<span class="game-play-icon">🔊</span></button>');
    out.push('</div>');

    out.push('<div class="bingo-card">');
    for (var i = 0; i < Bingo.card.length; i++) {
      var cell = Bingo.card[i];
      var isMarked = !!Bingo.marked[cell.id];
      var isCalled = Bingo.called.indexOf(cell.id) !== -1;
      var cls = 'bingo-cell' + (isMarked ? ' marked' : '') + (isCalled ? ' called' : '');
      out.push('<button class="' + cls + '" data-action="bingo-mark" data-id="' + cell.id + '">' +
        '<span class="bingo-cell-icon">' + Graphics.instrumentIcon(cell.id, 34) + '</span>' +
        '<span class="bingo-cell-name">' + localizedName(cell) + '</span></button>');
    }
    out.push('</div>');

    out.push('<button class="audio-btn secondary" data-action="bingo-call">' +
      t('Call next') + '</button>');
    out.push('<button class="audio-btn secondary" data-action="game-exit">' + t('Done') + '</button>');
    out.push('</div>');
    return out.join('');
  }

  /* ================================================================
     GAME 3 — BUILD THE ORCHESTRA
     Sort instruments into their family sections.
     ================================================================ */
  var Build = {
    tier: 2,
    queue: [],
    placed: {},   /* id -> familyId */
    state: 'playing', /* playing | done */
    errors: 0,

    start: function (tier) {
      this.tier = tier;
      var p = pool(tier);
      this.queue = shuffle(p).slice(0, 10);
      this.placed = {};
      this.errors = 0;
      this.state = 'playing';
    },

    current: function () {
      for (var i = 0; i < this.queue.length; i++) {
        if (!this.placed[this.queue[i].id]) return this.queue[i];
      }
      return null;
    },

    place: function (familyId) {
      var cur = this.current();
      if (!cur) return;
      if (cur.family === familyId) {
        this.placed[cur.id] = familyId;
        if (!this.current()) {
          this.state = 'done';
          var score = Math.max(0, this.queue.length - this.errors);
          this.newBest = Progress.setBest('build', score);
        }
        return true;
      }
      this.errors++;
      return false;
    },
  };

  function renderBuild() {
    var out = ['<div class="game-play">'];
    out.push('<div class="game-progress">' +
      '<span>' + t('Build the Orchestra') + '</span>' +
      '<span>' + Object.keys(Build.placed).length + ' / ' + Build.queue.length + '</span></div>');

    if (Build.state === 'done') {
      var score = Math.max(0, Build.queue.length - Build.errors);
      out.push('<div class="game-result">');
      out.push('<div class="game-result-score">' + t('Well done!') + ' ' +
        score + ' / ' + Build.queue.length + '</div>');
      if (Build.newBest) out.push('<div class="game-newbest">' + t('New best!') + '</div>');
      out.push('<button class="audio-btn primary" data-action="game-again" data-game="build">' +
        t('Play again') + '</button>');
      out.push('<button class="audio-btn secondary" data-action="game-exit">' + t('Done') + '</button>');
      out.push('</div></div>');
      return out.join('');
    }

    var cur = Build.current();
    out.push('<div class="build-prompt">' + t('Drag each instrument to its family section.') + '</div>');
    out.push('<div class="build-current">');
    out.push('<span class="build-current-icon">' + Graphics.instrumentIcon(cur.id, 44) + '</span>');
    out.push('<span class="build-current-name">' + localizedName(cur) + '</span>');
    out.push('<button class="game-play-audio small" data-action="build-play" data-id="' + cur.id + '">' +
      '<span class="game-play-icon">🔊</span></button>');
    out.push('</div>');

    out.push('<div class="build-sections">');
    for (var i = 0; i < INSTRUMENTS.FAMILY_ORDER.length; i++) {
      var fam = INSTRUMENTS.FAMILY_ORDER[i];
      var famMeta = INSTRUMENTS.FAMILIES[fam];
      var count = Object.keys(Build.placed).filter(function (id) {
        return Build.placed[id] === fam;
      }).length;
      out.push('<button class="build-section family-' + fam + '" data-action="build-place" data-family="' + fam + '">' +
        '<span class="build-section-emoji">' + famMeta.emoji + '</span>' +
        '<span class="build-section-name">' + t(fam.charAt(0).toUpperCase() + fam.slice(1)) + '</span>' +
        (count ? '<span class="build-section-count">' + count + '</span>' : '') +
        '</button>');
    }
    out.push('</div>');
    out.push('<button class="audio-btn secondary" data-action="game-exit">' + t('Done') + '</button>');
    out.push('</div>');
    return out.join('');
  }

  /* ================================================================
     DISPATCHER
     ================================================================ */
  var GAMES = {
    quiz: { id: 'quiz', emoji: '🎧', title: 'What Instrument Is This?',
            desc: 'Listen and pick the right instrument.', render: renderQuiz, api: Quiz },
    bingo: { id: 'bingo', emoji: '🎯', title: 'Instrument Bingo',
             desc: 'Hear a sound, find it on your card.', render: renderBingo, api: Bingo },
    build: { id: 'build', emoji: '🏛️', title: 'Build the Orchestra',
             desc: 'Put each instrument in its family.', render: renderBuild, api: Build },
  };

  function start(gameId, tier) {
    var g = GAMES[gameId];
    if (!g || !isUnlocked(gameId)) return false;
    g.api.start(tier);
    return true;
  }

  function renderGame(gameId) {
    var g = GAMES[gameId];
    if (!g) return '';
    return g.render();
  }

  function handleAction(action, el, tier) {
    /* Returns true if handled */
    switch (action) {
      case 'quiz-play':
        Audio.hearIt(el.getAttribute('data-id'));
        return true;
      case 'quiz-answer':
        var picked = el.getAttribute('data-id');
        var correct = (picked === Quiz.answer.id);
        Quiz.lastPick = correct ? null : picked;
        Quiz.answerWith(picked);
        return true;
      case 'quiz-next':
        Quiz.advance();
        return true;
      case 'bingo-play':
        Audio.hearIt(Bingo.currentCall());
        return true;
      case 'bingo-mark':
        Bingo.mark(el.getAttribute('data-id'));
        return true;
      case 'bingo-call':
        var wasBingo = (Bingo.state === 'bingo');
        Bingo.callNext();
        return true;
      case 'build-play':
        Audio.hearIt(Build.current().id);
        return true;
      case 'build-place':
        Build.place(el.getAttribute('data-family'));
        return true;
      case 'game-again':
        start(el.getAttribute('data-game'), tier);
        return true;
      default:
        return false;
    }
  }

  /* --- Public API --- */
  var Games = {
    Progress: Progress,
    isUnlocked: isUnlocked,
    unlockHint: unlockHint,
    GAMES: GAMES,
    start: start,
    render: renderGame,
    handleAction: handleAction,
    scoreStars: scoreStars,
  };

  if (typeof window !== 'undefined') window.Games = Games;
  if (typeof module !== 'undefined' && module.exports) module.exports = Games;
})();
