/* ============================================================
   Orchestrarium — Instrument Data Model
   Each instrument: id, names, family, tier, hotspots, facts.
   Hotspot x/y are percentage coordinates on the SVG frame.
   tiers arrays indicate which grade-band sees each hotspot/fact.
   ============================================================ */
(function () {
  'use strict';

  var FAMILIES = {
    strings:    { id: 'strings',    emoji: '🎻', colorVar: '--family-strings' },
    woodwinds:  { id: 'woodwinds',  emoji: '🪈', colorVar: '--family-woodwinds' },
    brass:      { id: 'brass',      emoji: '🎺', colorVar: '--family-brass' },
    percussion: { id: 'percussion', emoji: '🥁', colorVar: '--family-percussion' },
    other:      { id: 'other',      emoji: '🎹', colorVar: '--family-other' },
  };

  var FAMILY_ORDER = ['strings', 'woodwinds', 'brass', 'percussion', 'other'];

  /* --- Figaro Overture multitrack sections (synchronized stems) ---
     Live Musopen Symphony performance, CC0. Each entry is one microphone
     section isolated from the same take, aligned at t=0. */
  var ORCHESTRA_STEMS = [
    { id: 'violin',       label: 'Violins',      labelPt: 'Violinos',      url: 'audio/excerpts/figaro-violin.mp3' },
    { id: 'viola',        label: 'Violas',       labelPt: 'Violas',        url: 'audio/excerpts/figaro-viola.mp3' },
    { id: 'cello',        label: 'Cellos',       labelPt: 'Violoncelos',   url: 'audio/excerpts/figaro-cello.mp3' },
    { id: 'double-bass',  label: 'Double Basses', labelPt: 'Contrabaixos', url: 'audio/excerpts/figaro-double-bass.mp3' },
    { id: 'flute',        label: 'Flutes',       labelPt: 'Flautas',       url: 'audio/excerpts/figaro-flute.mp3' },
    { id: 'oboe',         label: 'Oboes',        labelPt: 'Oboés',         url: 'audio/excerpts/figaro-oboe.mp3' },
    { id: 'clarinet',     label: 'Clarinets',    labelPt: 'Clarinetes',    url: 'audio/excerpts/figaro-clarinet.mp3' },
    { id: 'bassoon',      label: 'Bassoons',     labelPt: 'Fagotes',       url: 'audio/excerpts/figaro-bassoon.mp3' },
    { id: 'french-horn',  label: 'Horns',        labelPt: 'Trompas',       url: 'audio/excerpts/figaro-french-horn.mp3' },
    { id: 'trumpet',      label: 'Trumpets',     labelPt: 'Trompetes',     url: 'audio/excerpts/figaro-trumpet.mp3' },
    { id: 'timpani',      label: 'Timpani',      labelPt: 'Tímpanos',      url: 'audio/excerpts/figaro-timpani.mp3' },
    { id: 'percussion',   label: 'Percussion',   labelPt: 'Percussão',     url: 'audio/excerpts/figaro-percussion.mp3' },
  ];
  var ORCHESTRA_PREMIX = 'audio/excerpts/figaro-premix.mp3';

  /* --- Full roster (27 instruments) --- */
  var ROSTER = [
    /* Tier 1 (12) */
    { id: 'violin',        name: 'Violin',           namePt: 'Violino',          family: 'strings',    tier: 1, emoji: '🎻', sizeCm: 36 },
    { id: 'cello',         name: 'Cello',            namePt: 'Violoncelo',       family: 'strings',    tier: 1, emoji: '🎸', sizeCm: 120 },
    { id: 'flute',         name: 'Flute',            namePt: 'Flauta',           family: 'woodwinds',  tier: 1, emoji: '🪈', sizeCm: 66 },
    { id: 'clarinet',      name: 'Clarinet',         namePt: 'Clarinete',        family: 'woodwinds',  tier: 1, emoji: '🪈', sizeCm: 66 },
    { id: 'trumpet',       name: 'Trumpet',          namePt: 'Trompete',         family: 'brass',      tier: 1, emoji: '🎺', sizeCm: 48 },
    { id: 'french-horn',   name: 'French Horn',      namePt: 'Trompa',           family: 'brass',      tier: 1, emoji: '📯', sizeCm: 47 },
    { id: 'timpani',       name: 'Timpani',          namePt: 'Tímpanos',         family: 'percussion', tier: 1, emoji: '🥁', sizeCm: 60 },
    { id: 'snare-drum',    name: 'Snare Drum',       namePt: 'Caixa',            family: 'percussion', tier: 1, emoji: '🥁', sizeCm: 35 },
    { id: 'triangle',      name: 'Triangle',         namePt: 'Triângulo',        family: 'percussion', tier: 1, emoji: '🔺', sizeCm: 20 },
    { id: 'piano',         name: 'Piano',            namePt: 'Piano',            family: 'other',      tier: 1, emoji: '🎹', sizeCm: 150 },
    { id: 'harp',          name: 'Harp',             namePt: 'Harpa',            family: 'other',      tier: 1, emoji: '🪕', sizeCm: 180 },
    { id: 'voice',         name: 'Voice',            namePt: 'Voz',              family: 'other',      tier: 1, emoji: '🎤', sizeCm: 30 },

    /* Tier 2 (8) */
    { id: 'viola',         name: 'Viola',            namePt: 'Viola',            family: 'strings',    tier: 2, emoji: '🎻', sizeCm: 42 },
    { id: 'double-bass',   name: 'Double Bass',      namePt: 'Contrabaixo',      family: 'strings',    tier: 2, emoji: '🎸', sizeCm: 180 },
    { id: 'oboe',          name: 'Oboe',             namePt: 'Oboé',             family: 'woodwinds',  tier: 2, emoji: '🪈', sizeCm: 60 },
    { id: 'bassoon',       name: 'Bassoon',          namePt: 'Fagote',           family: 'woodwinds',  tier: 2, emoji: '🪈', sizeCm: 134 },
    { id: 'alto-sax',      name: 'Alto Saxophone',   namePt: 'Saxofone Alto',    family: 'woodwinds',  tier: 2, emoji: '🎷', sizeCm: 70 },
    { id: 'trombone',      name: 'Trombone',         namePt: 'Trombone',         family: 'brass',      tier: 2, emoji: '🎺', sizeCm: 110 },
    { id: 'bass-drum',     name: 'Bass Drum',        namePt: 'Bombo',            family: 'percussion', tier: 2, emoji: '🥁', sizeCm: 60 },
    { id: 'glockenspiel',  name: 'Glockenspiel',     namePt: 'Glockenspiel',     family: 'percussion', tier: 2, emoji: '🔔', sizeCm: 40 },

    /* Tier 3 (7) */
    { id: 'piccolo',       name: 'Piccolo',          namePt: 'Piccolo',          family: 'woodwinds',  tier: 3, emoji: '🪈', sizeCm: 32 },
    { id: 'english-horn',  name: 'English Horn',     namePt: 'Cor Inglês',       family: 'woodwinds',  tier: 3, emoji: '🪈', sizeCm: 80 },
    { id: 'bass-clarinet', name: 'Bass Clarinet',    namePt: 'Clarinete Baixo',  family: 'woodwinds',  tier: 3, emoji: '🪈', sizeCm: 130 },
    { id: 'tuba',          name: 'Tuba',             namePt: 'Tuba',             family: 'brass',      tier: 3, emoji: '🎺', sizeCm: 140 },
    { id: 'celesta',       name: 'Celesta',          namePt: 'Celesta',          family: 'other',      tier: 3, emoji: '✨', sizeCm: 100 },
    { id: 'marimba',       name: 'Marimba',          namePt: 'Marimba',          family: 'percussion', tier: 3, emoji: '🪵', sizeCm: 130 },
    { id: 'tam-tam',       name: 'Tam-tam',          namePt: 'Tam-tam',          family: 'percussion', tier: 3, emoji: '🔔', sizeCm: 80 },
  ];

  /* --- Detailed instrument data (hotspots, facts, synth, excerpt) --- */
  var DETAIL = {

    /* ======================== VIOLIN (reference implementation) ======================== */
    violin: {
      synth: { type: 'strings' },

      hotspots: [
        {
          id: 'scroll', x: 50, y: 5,
          label: 'Scroll', labelPt: 'Roscão',
          desc: 'The decorative carved spiral at the very top of the violin.',
          descPt: 'A espiral decorativa e entalhada no topo do violino.',
          tiers: [2, 3],
        },
        {
          id: 'pegs', x: 34, y: 12,
          label: 'Pegs', labelPt: 'Clavijas',
          desc: 'Four wooden pegs that hold and tune the strings. Turn one to make its string tighter or looser.',
          descPt: 'Quatro clavijas de madeira que seguram e afinam as cordas. Gire uma para deixar sua corda mais tensa ou mais frouxa.',
          tiers: [2, 3],
        },
        {
          id: 'neck', x: 50, y: 22,
          label: 'Neck', labelPt: 'Pescoço',
          desc: 'The long piece of wood connecting the body to the scroll. The player presses the strings here to change notes.',
          descPt: 'A peça longa de madeira que liga o corpo ao rosção. O músico pressiona as cordas aqui para mudar as notas.',
          tiers: [2, 3],
        },
        {
          id: 'fingerboard', x: 50, y: 32,
          label: 'Fingerboard', labelPt: 'Tastilho',
          desc: 'The smooth black strip along the neck. The player presses the strings against it — there are no frets, so exact finger placement changes the pitch.',
          descPt: 'A faixa preta e lisa ao longo do pescoço. O músico pressiona as cordas contra ela — não há trastes, então a posição exata dos dedos muda a altura.',
          tiers: [2, 3],
        },
        {
          id: 'strings', x: 50, y: 55,
          label: 'Strings', labelPt: 'Cordas',
          desc: 'Four strings tuned in fifths: G, D, A, and E. The violin is the smallest and highest-pitched member of the string family.',
          descPt: 'Quatro cordas afinadas em quintas: Sol, Ré, Lá e Mi. O violino é o menor e mais agudo membro da família das cordas.',
          tiers: [1, 2, 3],
        },
        {
          id: 'bridge', x: 50, y: 52,
          label: 'Bridge', labelPt: 'Ponte',
          desc: 'A small piece of wood that holds the strings above the body. It passes the strings\' vibrations down into the violin so it can sing.',
          descPt: 'Uma pequena peça de madeira que sustenta as cordas acima do corpo. Ela transmite as vibrações das cordas para dentro do violino para que ele possa cantar.',
          tiers: [1, 2, 3],
        },
        {
          id: 'f-holes', x: 38, y: 56,
          label: 'f-holes', labelPt: 'Bocas de som',
          desc: 'Two f-shaped openings on either side of the bridge. They let the sound escape from inside the body.',
          descPt: 'Duas aberturas em forma de "f" de cada lado da ponte. Elas deixam o som escapar de dentro do corpo.',
          tiers: [2, 3],
        },
        {
          id: 'body', x: 50, y: 65,
          label: 'Body', labelPt: 'Corpo',
          desc: 'The hollow wooden box that makes the violin loud enough to hear. Its curved shape is carefully carved to project sound.',
          descPt: 'A caixa oca de madeira que faz o violino soar alto o suficiente para ser ouvido. Sua forma curva é cuidadosamente entalhada para projetar o som.',
          tiers: [1, 2, 3],
        },
        {
          id: 'chin-rest', x: 38, y: 78,
          label: 'Chin rest', labelPt: 'Descanso de queixo',
          desc: 'A small cup where the player rests their chin to hold the violin comfortably under the jaw.',
          descPt: 'Uma pequena concha onde o músico apoia o queixo para segurar o violino confortavelmente sob a mandíbula.',
          tiers: [2, 3],
        },
        {
          id: 'tailpiece', x: 50, y: 78,
          label: 'Tailpiece', labelPt: 'Saltarelho',
          desc: 'The piece at the bottom where the strings are anchored. Some violins have tiny fine tuners here too.',
          descPt: 'A peça na parte de baixo onde as cordas são fixadas. Alguns violinos também têm pequenos afinadores finos aqui.',
          tiers: [3],
        },
        {
          id: 'endpin', x: 50, y: 88,
          label: 'Endpin', labelPt: 'Espigão',
          desc: 'A small button at the very bottom that holds the tailpiece in place.',
          descPt: 'Um pequeno botão na parte mais baixa que mantém o saltarelho no lugar.',
          tiers: [3],
        },
        {
          id: 'bow', x: 82, y: 45,
          label: 'Bow', labelPt: 'Arco',
          desc: 'A stick strung with horsehair, coated in rosin to grip the strings. The player draws it across the strings to make them vibrate.',
          descPt: 'Um bastão com pelos de cavalo, coberto de resina para agarrar as cordas. O músico puxa o arco sobre as cordas para fazê-las vibrar.',
          tiers: [1, 2, 3],
        },
      ],

      facts: {
        1: [
          { en: 'The violin has four strings tuned in fifths: G, D, A, and E.',
            pt: 'O violino tem quatro cordas afinadas em quintas: Sol, Ré, Lá e Mi.' },
          { en: 'It is the smallest and highest-pitched member of the string family.',
            pt: 'É o menor membro e de altura mais aguda da família das cordas.' },
        ],
        2: [
          { en: 'A violinist holds the instrument under their chin, using a chin rest for comfort.',
            pt: 'O violinista segura o instrumento sob o queixo, usando um descanso de queixo para conforto.' },
          { en: 'The bow is made of horsehair coated with rosin, which makes it grip the strings.',
            pt: 'O arco é feito de pelos de cavalo cobertos com resina, o que faz com que ele agarre as cordas.' },
        ],
        3: [
          { en: 'The violin evolved from earlier string instruments like the rebec and viol during the 16th century.',
            pt: 'O violino evoluiu a partir de instrumentos de cordas anteriores como o rabeca e a viola no século XVI.' },
          { en: 'A single violin can produce over 60 distinct notes across its range.',
            pt: 'Um único violino pode produzir mais de 60 notas distintas em sua extensão.' },
        ],
      },

      didYouKnow: {
        en: 'The smallest violin is only 20 cm long — it fits in your hand! The largest string instrument, the double bass, is taller than most children.',
        pt: 'O menor violino tem apenas 20 cm — cabe na sua mão! O maior instrumento de cordas, o contrabaixo, é mais alto que a maioria das crianças.',
      },

      excerpt: {
        stem: 'audio/excerpts/figaro-violin.mp3',
        stemLabel: 'Violin I',
        stemLabelPt: 'Violino I',
        premix: 'audio/excerpts/figaro-premix.mp3',
        description: 'Hear the violin in Mozart\'s Marriage of Figaro Overture.',
        descriptionPt: 'Ouça o violino na Abertura de Le Nozze di Figaro, de Mozart.',
      },

      related: ['viola', 'cello', 'double-bass'],
    },

    /* ======================== CELLO ======================== */
    cello: {
      synth: { type: 'strings' },
      hotspots: [
        { id: 'strings', x: 50, y: 55,
          label: 'Strings', labelPt: 'Cordas',
          desc: 'Four strings, much thicker than a violin\'s, tuned in fifths: C, G, D, and A.',
          descPt: 'Quatro cordas, muito mais grossas que as do violino, afinadas em quintas: Dó, Sol, Ré e Lá.',
          tiers: [1, 2, 3] },
        { id: 'endpin', x: 50, y: 92,
          label: 'Endpin', labelPt: 'Espigão',
          desc: 'A metal spike that rests on the floor, holding the cello upright while the player sits.',
          descPt: 'Uma haste metálica que apoia no chão, segurando o violoncelo em pé enquanto o músico está sentado.',
          tiers: [1, 2, 3] },
        { id: 'body', x: 50, y: 60,
          label: 'Body', labelPt: 'Corpo',
          desc: 'The cello\'s body is about 75 cm tall. It rests between the player\'s knees.',
          descPt: 'O corpo do violoncelo tem cerca de 75 cm de altura. Ele fica entre os joelhos do músico.',
          tiers: [2, 3] },
        { id: 'bow', x: 82, y: 40,
          label: 'Bow', labelPt: 'Arco',
          desc: 'The cello bow is shorter and heavier than a violin bow, producing a warm, rich sound.',
          descPt: 'O arco do violoncelo é mais curto e mais pesado que o arco do violino, produzindo um som quente e rico.',
          tiers: [2, 3] },
      ],
      facts: {
        1: [
          { en: 'The cello is held between the knees while the player sits down.',
            pt: 'O violoncelo é segurado entre os joelhos enquanto o músico está sentado.' },
          { en: 'It plays low, warm notes that sound like a human voice singing.',
            pt: 'Ele toca notas graves e quentes que soam como a voz humana cantando.' },
        ],
        2: [
          { en: 'The cello has four strings tuned in fifths: C, G, D, and A.',
            pt: 'O violoncelo tem quatro cordas afinadas em quintas: Dó, Sol, Ré e Lá.' },
          { en: 'A metal spike called an endpin rests on the floor to hold it up.',
            pt: 'Uma haste metálica chamada espigão apoia no chão para segurá-lo.' },
        ],
        3: [
          { en: 'The word "cello" is short for "violoncello," which means "small violone" in Italian.',
            pt: 'A palavra "cello" é a abreviação de "violoncelo", que significa "violone pequeno" em italiano.' },
        ],
      },
      didYouKnow: {
        en: 'Famous cellists include Yo-Yo Ma and Jacqueline du Pré. The cello section sits right in the middle of the orchestra!',
        pt: 'Violoncelistas famosos incluem Yo-Yo Ma e Jacqueline du Pré. A seção de violoncelos fica bem no centro da orquestra!',
      },
      excerpt: {
        stem: 'audio/excerpts/figaro-cello.mp3',
        stemLabel: 'Cello',
        stemLabelPt: 'Violoncelo',
        premix: 'audio/excerpts/figaro-premix.mp3',
        description: 'Hear the cello in Mozart\'s Marriage of Figaro Overture.',
        descriptionPt: 'Ouça o violoncelo na Abertura de Le Nozze di Figaro, de Mozart.',
      },
      related: ['violin', 'viola', 'double-bass'],
    },

    /* ======================== FLUTE ======================== */
    flute: {
      synth: { type: 'flute' },
      hotspots: [
        { id: 'embouchure', x: 18, y: 15,
          label: 'Embouchure hole', labelPt: 'Boca',
          desc: 'The hole the player blows across. The way they shape their lips changes the sound.',
          descPt: 'O furo sobre o qual o músico sopra. A forma como ele molda os lábios muda o som.',
          tiers: [1, 2, 3] },
        { id: 'head-joint', x: 30, y: 15,
          label: 'Head joint', labelPt: 'Cabeça',
          desc: 'The top section with the lip plate and embouchure hole.',
          descPt: 'A seção superior com a placa de lábios e a boca.',
          tiers: [2, 3] },
        { id: 'keys', x: 55, y: 50,
          label: 'Keys', labelPt: 'Teclas',
          desc: 'The metal keys the player presses to change notes. A flute has about 16 of them!',
          descPt: 'As teclas metálicas que o músico pressiona para mudar as notas. Uma flauta tem cerca de 16 teclas!',
          tiers: [1, 2, 3] },
        { id: 'body', x: 55, y: 50,
          label: 'Body', labelPt: 'Corpo',
          desc: 'The long silver tube. The player blows across the embouchure hole to make the air column inside vibrate.',
          descPt: 'O longo tubo prateado. O músico sopra sobre a boca para fazer a coluna de ar dentro dele vibrar.',
          tiers: [2, 3] },
        { id: 'foot-joint', x: 85, y: 50,
          label: 'Foot joint', labelPt: 'Pé',
          desc: 'The short bottom section with the last few keys for the lowest notes.',
          descPt: 'A seção curta de baixo com as últimas teclas para as notas mais graves.',
          tiers: [3] },
      ],
      facts: {
        1: [
          { en: 'The flute is held sideways and played by blowing across a hole, not into it.',
            pt: 'A flauta é segurada de lado e tocada soprando sobre um furo, não dentro dele.' },
          { en: 'It is one of the highest and brightest instruments in the orchestra.',
            pt: 'É um dos instrumentos mais agudos e brilhantes da orquestra.' },
        ],
        2: [
          { en: 'The flute has about 16 keys that the player presses to change notes.',
            pt: 'A flauta tem cerca de 16 teclas que o músico pressiona para mudar as notas.' },
          { en: 'It is made of silver, gold, or platinum — the metal changes the tone color.',
            pt: 'É feita de prata, ouro ou platina — o metal muda a cor do som.' },
        ],
        3: [
          { en: 'The flute is one of the oldest instruments, with examples made from bone dating back 40,000 years.',
            pt: 'A flauta é um dos instrumentos mais antigos, com exemplos feitos de osso com 40.000 anos.' },
        ],
      },
      didYouKnow: {
        en: 'In "The Carnival of the Animals," Saint-Saëns uses the flute to sound like a bird in the "Volière" movement!',
        pt: 'Em "O Carnaval dos Animais", Saint-Saëns usa a flauta para soar como um pássaro no movimento "Volière"!',
      },
      excerpt: {
        stem: 'audio/excerpts/figaro-flute.mp3',
        stemLabel: 'Flute',
        stemLabelPt: 'Flauta',
        premix: 'audio/excerpts/figaro-premix.mp3',
        description: 'Hear the flute in Mozart\'s Marriage of Figaro Overture.',
        descriptionPt: 'Ouça a flauta na Abertura de Le Nozze di Figaro, de Mozart.',
      },
      related: ['piccolo', 'clarinet', 'oboe'],
    },

    /* ======================== CLARINET ======================== */
    clarinet: {
      synth: { type: 'woodwind' },
      hotspots: [
        { id: 'mouthpiece', x: 50, y: 8,
          label: 'Mouthpiece', labelPt: 'Bocal',
          desc: 'The top part where the player puts their mouth. A thin reed vibrates against it to make sound.',
          descPt: 'A parte de cima onde o músico coloca a boca. Uma fina palheta vibra contra ela para produzir som.',
          tiers: [1, 2, 3] },
        { id: 'reed', x: 44, y: 8,
          label: 'Reed', labelPt: 'Palheta',
          desc: 'A tiny slice of cane that vibrates when the player blows. It is the "engine" of the clarinet\'s sound.',
          descPt: 'Uma fina fatia de cana que vibra quando o músico sopra. É o "motor" do som do clarinete.',
          tiers: [2, 3] },
        { id: 'keys', x: 50, y: 50,
          label: 'Keys', labelPt: 'Teclas',
          desc: 'Silver keys and rings the player presses. The clarinet has more keys than almost any other woodwind.',
          descPt: 'Teclas e anéis prateados que o músico pressiona. O clarinete tem mais teclas do que quase qualquer outra madeira.',
          tiers: [1, 2, 3] },
        { id: 'bell', x: 50, y: 90,
          label: 'Bell', labelPt: 'Sino',
          desc: 'The flared bottom opening where sound comes out.',
          descPt: 'A abertura alargada na parte de baixo por onde o som sai.',
          tiers: [2, 3] },
      ],
      facts: {
        1: [
          { en: 'The clarinet makes a smooth, warm sound that can be quiet or loud.',
            pt: 'O clarinete produz um som suave e quente que pode ser suave ou forte.' },
          { en: 'It is a woodwind instrument — even though it looks metallic, it started as wood.',
            pt: 'É um instrumento de sopro — mesmo que pareça metálico, começou sendo de madeira.' },
        ],
        2: [
          { en: 'A thin reed vibrates against the mouthpiece to make the clarinet\'s sound.',
            pt: 'Uma fina palheta vibra contra o bocal para produzir o som do clarinete.' },
          { en: 'The clarinet can play the widest range of notes of almost any instrument.',
            pt: 'O clarinete pode tocar a maior variedade de notas de quase qualquer instrumento.' },
        ],
        3: [
          { en: 'The clarinet has over 20 keys and rings, operated by the fingers and thumbs.',
            pt: 'O clarinete tem mais de 20 teclas e anéis, operados pelos dedos e polegares.' },
        ],
      },
      didYouKnow: {
        en: 'In "Peter and the Wolf," the cat is played by the clarinet — sneaking and prowling!',
        pt: 'Em "Peter e o Lobo", o gato é tocado pelo clarinete — espreitando e de emboscada!',
      },
      excerpt: {
        stem: 'audio/excerpts/figaro-clarinet.mp3',
        stemLabel: 'Clarinet',
        stemLabelPt: 'Clarinete',
        premix: 'audio/excerpts/figaro-premix.mp3',
        description: 'Hear the clarinet in Mozart\'s Marriage of Figaro Overture.',
        descriptionPt: 'Ouça o clarinete na Abertura de Le Nozze di Figaro, de Mozart.',
      },
      related: ['bass-clarinet', 'flute', 'oboe'],
    },

    /* ======================== TRUMPET ======================== */
    trumpet: {
      synth: { type: 'brass' },
      hotspots: [
        { id: 'mouthpiece', x: 50, y: 8,
          label: 'Mouthpiece', labelPt: 'Bocal',
          desc: 'A cup-shaped piece the player buzzes their lips into. The buzz is what starts the sound!',
          descPt: 'Uma peça em forma de xícara onde o músico vibra os lábios. A vibração é o que inicia o som!',
          tiers: [1, 2, 3] },
        { id: 'valves', x: 50, y: 45,
          label: 'Valves', labelPt: 'Válvulas',
          desc: 'Three buttons the player presses. Each valve changes the length of the tubing, making the pitch go up or down.',
          descPt: 'Três botões que o músico pressiona. Cada válvula muda o comprimento do tubo, fazendo a altura subir ou descer.',
          tiers: [1, 2, 3] },
        { id: 'tuning-slide', x: 72, y: 30,
          label: 'Tuning slide', labelPt: 'Trompa de afinação',
          desc: 'A sliding loop of tubing that lets the player fine-tune the pitch.',
          descPt: 'Uma volta de tubo deslizante que permite ao músico afinar a altura com precisão.',
          tiers: [3] },
        { id: 'bell', x: 85, y: 55,
          label: 'Bell', labelPt: 'Sino',
          desc: 'The wide flared end where the sound comes out. It projects the sound forward to the audience.',
          descPt: 'A extremidade alargada de onde sai o som. Ela projeta o som para a frente, até a plateia.',
          tiers: [1, 2, 3] },
        { id: 'leadpipe', x: 50, y: 20,
          label: 'Leadpipe', labelPt: 'Tubo de condução',
          desc: 'The tube that connects the mouthpiece to the valves.',
          descPt: 'O tubo que liga o bocal às válvulas.',
          tiers: [3] },
      ],
      facts: {
        1: [
          { en: 'The trumpet is the highest-pitched brass instrument.',
            pt: 'O trompete é o instrumento de metais de altura mais aguda.' },
          { en: 'The player buzzes their lips into the mouthpiece to make sound.',
            pt: 'O músico vibra os lábios no bocal para produzir som.' },
        ],
        2: [
          { en: 'Three valves let the trumpet play every note in its range.',
            pt: 'Três válvulas permitem ao trompete tocar todas as notas em sua extensão.' },
          { en: 'The sound is bright, brilliant, and can be heard over the whole orchestra.',
            pt: 'O som é brilhante e forte, e pode ser ouvido sobre toda a orquestra.' },
        ],
        3: [
          { en: 'A trumpet has about 1.8 meters of tubing wound into loops.',
            pt: 'Um trompete tem cerca de 1,8 metro de tubo enrolado em voltas.' },
        ],
      },
      didYouKnow: {
        en: 'The trumpet can play so loudly that it can be heard from the back of a huge concert hall!',
        pt: 'O trompete pode tocar tão alto que pode ser ouvido do fundo de um enorme concerto!',
      },
      excerpt: {
        stem: 'audio/excerpts/figaro-trumpet.mp3',
        stemLabel: 'Trumpet',
        stemLabelPt: 'Trompete',
        premix: 'audio/excerpts/figaro-premix.mp3',
        description: 'Hear the trumpet in Mozart\'s Marriage of Figaro Overture.',
        descriptionPt: 'Ouça o trompete na Abertura de Le Nozze di Figaro, de Mozart.',
      },
      related: ['french-horn', 'trombone', 'tuba'],
    },

    /* ======================== FRENCH HORN ======================== */
    'french-horn': {
      synth: { type: 'brass' },
      hotspots: [
        { id: 'mouthpiece', x: 20, y: 30,
          label: 'Mouthpiece', labelPt: 'Bocal',
          desc: 'A deep, funnel-shaped mouthpiece. The player buzzes their lips into it.',
          descPt: 'Um bocal profundo em forma de funil. O músico vibra os lábios nele.',
          tiers: [1, 2, 3] },
        { id: 'valves', x: 45, y: 45,
          label: 'Valves', labelPt: 'Válvulas',
          desc: 'Rotary valves operated by the left hand. They change the length of the tubing.',
          descPt: 'Válvulas rotativas operadas pela mão esquerda. Elas mudam o comprimento do tubo.',
          tiers: [2, 3] },
        { id: 'bell', x: 70, y: 55,
          label: 'Bell', labelPt: 'Sino',
          desc: 'The large flared bell faces backward over the player\'s shoulder — this gives the horn its warm, mellow sound.',
          descPt: 'O grande sino alargado fica virado para trás, por cima do ombro do músico — isso dá à trompa seu som quente e suave.',
          tiers: [1, 2, 3] },
        { id: 'body', x: 50, y: 50,
          label: 'Body', labelPt: 'Corpo',
          desc: 'About 3.7 meters of tubing coiled into a circle!',
          descPt: 'Cerca de 3,7 metros de tubo enrolados em um círculo!',
          tiers: [3] },
      ],
      facts: {
        1: [
          { en: 'The French horn has a warm, mellow sound that blends beautifully with other instruments.',
            pt: 'A trompa tem um som quente e suave que se mistura lindamente com outros instrumentos.' },
          { en: 'The bell faces backward, which is why the sound is so soft and round.',
            pt: 'O sino fica virado para trás, por isso o som é tão suave e arredondado.' },
        ],
        2: [
          { en: 'The horn has about 3.7 meters of tubing wound into a big circle.',
            pt: 'A trompa tem cerca de 3,7 metros de tubo enrolados em um grande círculo.' },
          { en: 'Players use their right hand inside the bell to fine-tune the pitch.',
            pt: 'Os músicos usam a mão direita dentro do sino para afinar a altura.' },
        ],
        3: [
          { en: 'The horn evolved from hunting horns, which only could play a few notes.',
            pt: 'A trompa evoluiu a partir de cornos de caça, que só podiam tocar algumas notas.' },
        ],
      },
      didYouKnow: {
        en: 'In "Peter and the Wolf," the wolf is played by three French horns — can you hear why that sounds scary?',
        pt: 'Em "Peter e o Lobo", o lobo é tocado por três trompas — consegue ouvir por que isso soa assustador?',
      },
      excerpt: {
        stem: 'audio/excerpts/figaro-french-horn.mp3',
        stemLabel: 'French Horn',
        stemLabelPt: 'Trompa',
        premix: 'audio/excerpts/figaro-premix.mp3',
        description: 'Hear the French horn in Mozart\'s Marriage of Figaro Overture.',
        descriptionPt: 'Ouça a trompa na Abertura de Le Nozze di Figaro, de Mozart.',
      },
      related: ['trumpet', 'trombone', 'tuba'],
    },

    /* ======================== TIMPANI ======================== */
    timpani: {
      synth: { type: 'percussion' },
      hotspots: [
        { id: 'drumhead', x: 50, y: 15,
          label: 'Drumhead', labelPt: 'Pele',
          desc: 'The stretched skin on top that the player strikes with mallets.',
          descPt: 'A pele esticada no topo que o músico golpeita com baquetas.',
          tiers: [1, 2, 3] },
        { id: 'shell', x: 50, y: 55,
          label: 'Shell', labelPt: 'Caixa',
          desc: 'The big bowl-shaped body. Its size determines the pitch — bigger means lower!',
          descPt: 'O grande corpo em forma de tigela. Seu tamanho determina a altura — maior significa mais grave!',
          tiers: [1, 2, 3] },
        { id: 'pedals', x: 35, y: 90,
          label: 'Pedals', labelPt: 'Pedais',
          desc: 'Foot pedals that tighten or loosen the drumhead, letting the player change pitch while playing!',
          descPt: 'Pedais que apertam ou afrouxam a pele, permitindo ao músico mudar a altura enquanto toca!',
          tiers: [2, 3] },
      ],
      facts: {
        1: [
          { en: 'Timpani are big copper drums that can be tuned to specific notes.',
            pt: 'Os tímpanos são grandes tambores de cobre que podem ser afinados em notas específicas.' },
          { en: 'The player hits them with soft mallets to make a deep, booming sound.',
            pt: 'O músico golpeia com baquetas macias para produzir um som grave e potente.' },
        ],
        2: [
          { en: 'Foot pedals let timpani players change pitch mid-song!',
            pt: 'Os pedais permitem que os timpaneiros mudem de nota no meio da música!' },
          { en: 'A timpani section usually has 3 or 4 drums of different sizes.',
            pt: 'Uma seção de tímpanos geralmente tem 3 ou 4 tambores de tamanhos diferentes.' },
        ],
        3: [
          { en: 'Timpani are one of the oldest orchestral instruments, dating back to the 1600s.',
            pt: 'Os tímpanos são um dos instrumentos orquestrais mais antigos, com origem no século XVII.' },
        ],
      },
      didYouKnow: {
        en: 'A timpani player can change the pitch while a note is still ringing, using the pedals — like magic!',
        pt: 'Um timpaneiro pode mudar a altura enquanto a nota ainda está soando, usando os pedais — como mágica!',
      },
      excerpt: {
        stem: 'audio/excerpts/figaro-timpani.mp3',
        stemLabel: 'Timpani',
        stemLabelPt: 'Tímpanos',
        premix: 'audio/excerpts/figaro-premix.mp3',
        description: 'Hear the timpani in Mozart\'s Marriage of Figaro Overture.',
        descriptionPt: 'Ouça os tímpanos na Abertura de Le Nozze di Figaro, de Mozart.',
      },
      related: ['bass-drum', 'snare-drum', 'tam-tam'],
    },

    /* ======================== SNARE DRUM ======================== */
    'snare-drum': {
      synth: { type: 'percussion' },
      hotspots: [
        { id: 'drumhead', x: 50, y: 12,
          label: 'Drumhead', labelPt: 'Pele',
          desc: 'The top skin that the player strikes. The bottom head vibrates too!',
          descPt: 'A pele superior que o músico golpeita. A pele inferior também vibra!',
          tiers: [1, 2, 3] },
        { id: 'shell', x: 50, y: 50,
          label: 'Shell', labelPt: 'Caixa',
          desc: 'The cylindrical body, usually made of wood or metal.',
          descPt: 'O corpo cilíndrico, geralmente feito de madeira ou metal.',
          tiers: [2, 3] },
        { id: 'rim', x: 50, y: 10,
          label: 'Rim', labelPt: 'Aro',
          desc: 'The metal ring at the top. Players can hit the rim for a clicking sound!',
          descPt: 'O anel metálico no topo. Os músicos podem golpear o aro para produzir um som de estalo!',
          tiers: [3] },
      ],
      facts: {
        1: [
          { en: 'The snare drum has wires stretched across the bottom head that rattle when you play.',
            pt: 'A caixa tem fios esticados na pele de baixo que tilintam quando você toca.' },
          { en: 'It is used to keep a steady beat in marches and orchestral music.',
            pt: 'É usada para manter um ritmo constante em marchas e música orquestral.' },
        ],
        2: [
          { en: 'The "snare" is the set of wires on the bottom head that give the drum its crisp rattle.',
            pt: 'A "corda" é o conjunto de fios na pele inferior que dá ao tambor seu tilintar nítido.' },
        ],
        3: [
          { en: 'You can turn the snares off for a hollow, tom-tom sound.',
            pt: 'Você pode desligar as cordas para produzir um som oco, como um tamborim.' },
        ],
      },
      didYouKnow: {
        en: 'The snare drum can also be played with brushes for a softer, swishing sound in jazz!',
        pt: 'A caixa também pode ser tocada com escovas para produzir um som suave e sussurrante no jazz!',
      },
      related: ['timpani', 'bass-drum', 'tam-tam'],
    },

    /* ======================== TRIANGLE ======================== */
    triangle: {
      synth: { type: 'percussion' },
      hotspots: [
        { id: 'body', x: 50, y: 50,
          label: 'Body', labelPt: 'Corpo',
          desc: 'A bent metal bar in a triangle shape. Despite the name, it has an open corner so it can ring freely.',
          descPt: 'Uma barra metálica curvada em forma de triângulo. Apesar do nome, tem um canto aberto para poder ressoar livremente.',
          tiers: [1, 2, 3] },
        { id: 'striker', x: 25, y: 70,
          label: 'Striker', labelPt: 'Baqueta',
          desc: 'A small metal beater. The player hangs the triangle from a hook and strikes it.',
          descPt: 'Uma pequena baqueta de metal. O músico pendura o triângulo em um gancho e golpeia.',
          tiers: [2, 3] },
      ],
      facts: {
        1: [
          { en: 'The triangle makes a bright, ringing "ting" sound.',
            pt: 'O triângulo produz um som brilhante e ressoante, um "ting".' },
          { en: 'It is made from a single bent metal bar.',
            pt: 'É feito de uma única barra metálica curvada.' },
        ],
        2: [
          { en: 'The open corner is what lets the triangle vibrate and ring.',
            pt: 'O canto aberto é o que deixa o triângulo vibrar e ressoar.' },
        ],
        3: [
          { en: 'Some composers use the triangle to add sparkle and magic to the orchestra!',
            pt: 'Alguns compositores usam o triângulo para adicionar brilho e magia à orquestra!',
          },
        ],
      },
      didYouKnow: {
        en: 'You might not see the triangle in the orchestra, but you can always hear its bright "ting!"',
        pt: 'Você pode não ver o triângulo na orquestra, mas sempre pode ouvir seu brilhante "ting"!',
      },
      related: ['glockenspiel', 'timpani', 'snare-drum'],
    },

    /* ======================== PIANO ======================== */
    piano: {
      synth: { type: 'keyboard' },
      hotspots: [
        { id: 'keys', x: 50, y: 60,
          label: 'Keys', labelPt: 'Teclas',
          desc: '88 black and white keys. Pressing a key makes a hammer hit a string inside.',
          descPt: '88 teclas pretas e brancas. Pressionar uma tecla faz um martelo golpear uma corda lá dentro.',
          tiers: [1, 2, 3] },
        { id: 'strings', x: 50, y: 30,
          label: 'Strings', labelPt: 'Cordas',
          desc: 'Over 200 strings stretched inside, struck by tiny felt hammers.',
          descPt: 'Mais de 200 cordas esticadas lá dentro, golpeadas por pequenos martelos de feltro.',
          tiers: [2, 3] },
        { id: 'body', x: 50, y: 40,
          label: 'Body', labelPt: 'Corpo',
          desc: 'The large wooden case that amplifies the sound. In a grand piano, it\'s the iconic wing shape.',
          descPt: 'A grande caixa de madeira que amplifica o som. Num piano de cauda, é a icônica forma de asa.',
          tiers: [2, 3] },
      ],
      facts: {
        1: [
          { en: 'The piano has 88 keys — 52 white and 36 black.',
            pt: 'O piano tem 88 teclas — 52 brancas e 36 pretas.' },
          { en: 'Pressing a key makes a tiny hammer hit a string inside.',
            pt: 'Pressionar uma tecla faz um pequeno martelo golpear uma corda lá dentro.' },
        ],
        2: [
          { en: 'A grand piano has over 200 strings and 12,000 parts!',
            pt: 'Um piano de cauda tem mais de 200 cordas e 12.000 peças!' },
          { en: 'The piano can play both melody and accompaniment at the same time.',
            pt: 'O piano pode tocar melodia e acompanhamento ao mesmo tempo.' },
        ],
        3: [
          { en: 'The piano was invented in Italy around 1700 by Bartolomeo Cristofori.',
            pt: 'O piano foi inventado na Itália por volta de 1700 por Bartolomeo Cristofori.' },
        ],
      },
      didYouKnow: {
        en: 'The piano is called a "pianoforte" because it can play both soft (piano) and loud (forte)!',
        pt: 'O piano é chamado de "pianoforte" porque pode tocar tanto suave (piano) quanto forte (forte)!',
      },
      related: ['celesta', 'harp', 'glockenspiel'],
    },

    /* ======================== HARP ======================== */
    harp: {
      synth: { type: 'strings' },
      hotspots: [
        { id: 'strings', x: 50, y: 40,
          label: 'Strings', labelPt: 'Cordas',
          desc: '47 strings stretched from the top to the soundboard. Each string is a different length and color.',
          descPt: '47 cordas esticadas do topo até o tampo. Cada corda tem um comprimento e uma cor diferentes.',
          tiers: [1, 2, 3] },
        { id: 'soundboard', x: 50, y: 65,
          label: 'Soundboard', labelPt: 'Tampo',
          desc: 'The wide wooden body that resonates and amplifies the string vibrations.',
          descPt: 'O largo corpo de madeira que ressoa e amplifica as vibrações das cordas.',
          tiers: [2, 3] },
        { id: 'neck', x: 50, y: 12,
          label: 'Neck', labelPt: 'Pescoço',
          desc: 'The curved top piece where the strings are attached.',
          descPt: 'A peça curva no topo onde as cordas são fixadas.',
          tiers: [3] },
      ],
      facts: {
        1: [
          { en: 'The harp has 47 strings and 7 pedals, making it one of the most complex instruments.',
            pt: 'A harpa tem 47 cordas e 7 pedais, sendo um dos instrumentos mais complexos.' },
          { en: 'You pluck the strings with your fingers to make a magical, dreamy sound.',
            pt: 'Você pinça as cordas com os dedos para produzir um som mágico e sonhador.' },
        ],
        2: [
          { en: 'Each harp string is colored to help the player find the right one — red for C, blue for F.',
            pt: 'Cada corda da harpa tem uma cor para ajudar o músico a encontrar a certa — vermelha para Dó, azul para Fá.' },
          { en: 'The pedals can change each string to three different pitches!',
            pt: 'Os pedais podem mudar cada corda para três alturas diferentes!' },
        ],
        3: [
          { en: 'The harp has been around for over 5,000 years — it\'s one of the oldest instruments.',
            pt: 'A harpa existe há mais de 5.000 anos — é um dos instrumentos mais antigos.' },
        ],
      },
      didYouKnow: {
        en: 'The harp on the logo of the Guinness beer company is one of the oldest trademarks in the world!',
        pt: 'A harpa no logotipo da cerveja Guinness é uma das marcas registradas mais antigas do mundo!',
      },
      related: ['piano', 'violin', 'cello'],
    },

    /* ======================== VOICE ======================== */
    voice: {
      synth: { type: 'voice' },
      hotspots: [
        { id: 'body', x: 50, y: 50,
          label: 'Your body', labelPt: 'Seu corpo',
          desc: 'Your voice box (larynx) contains tiny vocal cords that vibrate when you sing or speak.',
          descPt: 'Sua laringe contém pequenas cordas vocais que vibram quando você canta ou fala.',
          tiers: [1, 2, 3] },
      ],
      facts: {
        1: [
          { en: 'Your voice is an instrument you always have with you!',
            pt: 'Sua voz é um instrumento que você sempre tem com você!' },
          { en: 'Singers in an orchestra are called the "chorus" or "choir."',
            pt: 'Os cantores numa orquestra são chamados de "coro" ou "coral".' },
        ],
        2: [
          { en: 'The voice box has two tiny vocal cords that vibrate to make sound.',
            pt: 'A laringe tem duas pequenas cordas vocais que vibram para produzir som.' },
          { en: 'Vibrating your vocal cords faster makes a higher pitch, slower makes a lower pitch.',
            pt: 'Fazer as cordas vibrarem mais rápido produz uma altura mais grave, mais lento produz uma mais aguda.' },
        ],
        3: [
          { en: 'A trained singer can span over three octaves — more than most instruments!',
            pt: 'Um cantor treinado pode abranger mais de três oitavas — mais do que a maioria dos instrumentos!' },
        ],
      },
      didYouKnow: {
        en: 'The human voice is the original musical instrument — people have been singing for thousands of years before any instrument was invented!',
        pt: 'A voz humana é o instrumento musical original — as pessoas cantavam há milhares de anos antes de qualquer instrumento ser inventado!',
      },
      related: ['cello', 'french-horn', 'flute'],
    },

    /* ======================== VIOLA ======================== */
    viola: {
      synth: { type: 'strings' },
      hotspots: [
        { id: 'strings', x: 50, y: 55,
          label: 'Strings', labelPt: 'Cordas',
          desc: 'Four strings tuned in fifths: C, G, D, and A — a fifth lower than the violin.',
          descPt: 'Quatro cordas afinadas em quintas: Dó, Sol, Ré e Lá — uma quinta abaixo do violino.',
          tiers: [1, 2, 3] },
        { id: 'body', x: 50, y: 65,
          label: 'Body', labelPt: 'Corpo',
          desc: 'A little bigger than a violin, which gives the viola its deeper, darker sound.',
          descPt: 'Um pouco maior que o violino, o que dá à viola seu som mais grave e escuro.',
          tiers: [1, 2, 3] },
        { id: 'chin-rest', x: 38, y: 78,
          label: 'Chin rest', labelPt: 'Descanso de queixo',
          desc: 'Like the violin, the viola is held under the chin.',
          descPt: 'Como o violino, a viola é segurada sob o queixo.',
          tiers: [2, 3] },
        { id: 'bow', x: 82, y: 45,
          label: 'Bow', labelPt: 'Arco',
          desc: 'The viola bow is slightly heavier than a violin bow, helping it pull a rich, warm tone.',
          descPt: 'O arco da viola é um pouco mais pesado que o do violino, ajudando a produzir um som rico e quente.',
          tiers: [2, 3] },
        { id: 'f-holes', x: 38, y: 56,
          label: 'f-holes', labelPt: 'Bocas de som',
          desc: 'Two f-shaped openings that let the sound escape from inside the body.',
          descPt: 'Duas aberturas em forma de "f" que deixam o som escapar de dentro do corpo.',
          tiers: [3] },
      ],
      facts: {
        1: [
          { en: 'The viola is the middle-sized member of the string family.',
            pt: 'A viola é o membro de tamanho médio da família das cordas.' },
          { en: 'It sounds a little lower and darker than the violin.',
            pt: 'Ela soa um pouco mais grave e escura que o violino.' },
        ],
        2: [
          { en: 'The viola has four strings tuned in fifths: C, G, D, and A.',
            pt: 'A viola tem quatro cordas afinadas em quintas: Dó, Sol, Ré e Lá.' },
          { en: 'Violas often play the inner harmony notes that fill out the orchestra.',
            pt: 'As violas frequentemente tocam as notas de harmonia internas que preenchem a orquestra.' },
        ],
        3: [
          { en: 'The viola uses the alto clef, which almost no other instrument reads.',
            pt: 'A viola usa a clave de dó na terceira linha, que quase nenhum outro instrumento lê.' },
        ],
      },
      didYouKnow: {
        en: 'The viola is often called the "Cinderella" of the orchestra — it rarely gets the melody, but it makes everyone else sound better!',
        pt: 'A viola é frequentemente chamada de "Cinderela" da orquestra — raramente toca a melodia, mas faz todos os outros soarem melhor!',
      },
      excerpt: {
        stem: 'audio/excerpts/figaro-viola.mp3',
        stemLabel: 'Viola',
        stemLabelPt: 'Viola',
        premix: 'audio/excerpts/figaro-premix.mp3',
        description: 'Hear the viola in Mozart\'s Marriage of Figaro Overture.',
        descriptionPt: 'Ouça a viola na Abertura de Le Nozze di Figaro, de Mozart.',
      },
      related: ['violin', 'cello', 'double-bass'],
    },

    /* ======================== DOUBLE BASS ======================== */
    'double-bass': {
      synth: { type: 'strings' },
      hotspots: [
        { id: 'strings', x: 50, y: 55,
          label: 'Strings', labelPt: 'Cordas',
          desc: 'Four very thick strings tuned in fourths: E, A, D, and G — the lowest of the string family.',
          descPt: 'Quatro cordas muito grossas afinadas em quartas: Mi, Lá, Ré e Sol — as mais graves da família das cordas.',
          tiers: [1, 2, 3] },
        { id: 'body', x: 50, y: 60,
          label: 'Body', labelPt: 'Corpo',
          desc: 'The biggest and deepest-voiced member of the string family. It stands taller than many adults!',
          descPt: 'O maior e mais grave membro da família das cordas. É mais alto que muitos adultos!',
          tiers: [1, 2, 3] },
        { id: 'endpin', x: 50, y: 92,
          label: 'Endpin', labelPt: 'Espigão',
          desc: 'A thick metal peg that rests on the floor, holding the huge bass upright.',
          descPt: 'Um espigão metálico grosso que apoia no chão, segurando o enorme contrabaixo em pé.',
          tiers: [2, 3] },
        { id: 'bow', x: 82, y: 45,
          label: 'Bow', labelPt: 'Arco',
          desc: 'Players choose between a French bow (held overhand) or a German bow (held underhand).',
          descPt: 'Os músicos escolhem entre arco francês (segurado por cima) ou alemão (segurado por baixo).',
          tiers: [3] },
      ],
      facts: {
        1: [
          { en: 'The double bass is the largest and lowest instrument in the string family.',
            pt: 'O contrabaixo é o maior e mais grave instrumento da família das cordas.' },
          { en: 'It provides the deep, rumbling bass notes that anchor the whole orchestra.',
            pt: 'Ele fornece as notas graves e retumbantes que sustentam toda a orquestra.' },
        ],
        2: [
          { en: 'Because it is so tall, bass players usually stand or sit on a high stool.',
            pt: 'Por ser tão alto, os contrabaixistas geralmente ficam em pé ou sentados numa banqueta alta.' },
          { en: 'Its four strings are tuned in fourths: E, A, D, and G.',
            pt: 'Suas quatro cordas são afinadas em quartas: Mi, Lá, Ré e Sol.' },
        ],
        3: [
          { en: 'In jazz, the double bass is often plucked instead of bowed — this is called "pizzicato."',
            pt: 'No jazz, o contrabaixo é frequentemente pinçado em vez de tocado com arco — isso se chama "pizzicato".' },
        ],
      },
      didYouKnow: {
        en: 'A double bass is so big that its strings are sometimes made of metal wrapped around a core of silk or steel — like giant cables!',
        pt: 'Um contrabaixo é tão grande que suas cordas às vezes são feitas de metal enrolado em torno de um núcleo de seda ou aço — como cabos gigantes!',
      },
      excerpt: {
        stem: 'audio/excerpts/figaro-double-bass.mp3',
        stemLabel: 'Double Bass',
        stemLabelPt: 'Contrabaixo',
        premix: 'audio/excerpts/figaro-premix.mp3',
        description: 'Hear the double bass in Mozart\'s Marriage of Figaro Overture.',
        descriptionPt: 'Ouça o contrabaixo na Abertura de Le Nozze di Figaro, de Mozart.',
      },
      related: ['cello', 'viola', 'violin'],
    },

    /* ======================== OBOE ======================== */
    oboe: {
      synth: { type: 'woodwind' },
      hotspots: [
        { id: 'reed', x: 50, y: 6,
          label: 'Double reed', labelPt: 'Palheta dupla',
          desc: 'Two thin pieces of cane bound together. They vibrate against each other to make the oboe\'s sound.',
          descPt: 'Duas finas peças de cana amarradas juntas. Elas vibram uma contra a outra para produzir o som do oboé.',
          tiers: [1, 2, 3] },
        { id: 'keys', x: 50, y: 45,
          label: 'Keys', labelPt: 'Teclas',
          desc: 'Many silver keys cover the long, narrow tube.',
          descPt: 'Muitas teclas prateadas cobrem o tubo longo e estreito.',
          tiers: [1, 2, 3] },
        { id: 'body', x: 50, y: 55,
          label: 'Body', labelPt: 'Corpo',
          desc: 'A slender wooden tube made from African blackwood.',
          descPt: 'Um delgado tubo de madeira feito de pau-preto africano.',
          tiers: [2, 3] },
        { id: 'bell', x: 50, y: 92,
          label: 'Bell', labelPt: 'Sino',
          desc: 'A small, slightly flared opening where the sound comes out.',
          descPt: 'Uma pequena abertura levemente alargada por onde o som sai.',
          tiers: [2, 3] },
      ],
      facts: {
        1: [
          { en: 'The oboe has a clear, reedy sound that can sound happy or sad.',
            pt: 'O oboé tem um som claro e anasalado que pode soar alegre ou triste.' },
          { en: 'It is one of the smallest instruments in the orchestra.',
            pt: 'É um dos menores instrumentos da orquestra.' },
        ],
        2: [
          { en: 'The oboe uses a double reed — two pieces of cane that vibrate together.',
            pt: 'O oboé usa uma palheta dupla — duas peças de cana que vibram juntas.' },
          { en: 'The orchestra tunes to the oboe because its pitch is so steady.',
            pt: 'A orquestra afina pelo oboé porque sua altura é muito estável.' },
        ],
        3: [
          { en: 'Oboe players carve and adjust their own reeds by hand, like tiny wooden sculptures.',
            pt: 'Os oboístas esculpem e ajustam suas próprias palhetas à mão, como pequenas esculturas de madeira.' },
        ],
      },
      didYouKnow: {
        en: 'In "Peter and the Wolf," the duck is played by the oboe — can you hear its quacking melody?',
        pt: 'Em "Peter e o Lobo", o pato é tocado pelo oboé — consegue ouvir sua melodia grasnada?',
      },
      excerpt: {
        stem: 'audio/excerpts/figaro-oboe.mp3',
        stemLabel: 'Oboe',
        stemLabelPt: 'Oboé',
        premix: 'audio/excerpts/figaro-premix.mp3',
        description: 'Hear the oboe in Mozart\'s Marriage of Figaro Overture.',
        descriptionPt: 'Ouça o oboé na Abertura de Le Nozze di Figaro, de Mozart.',
      },
      related: ['english-horn', 'bassoon', 'clarinet'],
    },

    /* ======================== BASSOON ======================== */
    bassoon: {
      synth: { type: 'woodwind' },
      hotspots: [
        { id: 'reed', x: 30, y: 12,
          label: 'Double reed', labelPt: 'Palheta dupla',
          desc: 'A double reed sits on a thin metal tube called the bocal.',
          descPt: 'Uma palheta dupla fica num tubo metálico fino chamado tudel.',
          tiers: [1, 2, 3] },
        { id: 'bocal', x: 35, y: 20,
          label: 'Bocal', labelPt: 'Tudel',
          desc: 'The curved metal tube that carries the reed to the bassoon\'s body.',
          descPt: 'O tubo metálico curvo que leva a palheta até o corpo do fagote.',
          tiers: [3] },
        { id: 'keys', x: 50, y: 50,
          label: 'Keys', labelPt: 'Teclas',
          desc: 'A complex system of keys operated by both hands.',
          descPt: 'Um complexo sistema de teclas operado pelas duas mãos.',
          tiers: [1, 2, 3] },
        { id: 'bell', x: 55, y: 90,
          label: 'Bell', labelPt: 'Sino',
          desc: 'The flared end of the long, folded tube.',
          descPt: 'A extremidade alargada do tubo longo e dobrado.',
          tiers: [2, 3] },
      ],
      facts: {
        1: [
          { en: 'The bassoon is the lowest and largest of the woodwinds.',
            pt: 'O fagote é a madeira mais grave e maior.' },
          { en: 'It has a long tube folded in half, so it fits in your arms.',
            pt: 'Ele tem um tubo longo dobrado ao meio, por isso cabe nos seus braços.' },
        ],
        2: [
          { en: 'The bassoon uses a double reed, like the oboe but bigger.',
            pt: 'O fagote usa uma palheta dupla, como o oboé, mas maior.' },
          { en: 'It can sound funny and bouncy, or deep and serious.',
            pt: 'Ele pode soar engraçado e saltitante, ou profundo e sério.' },
        ],
        3: [
          { en: 'If you stretched out a bassoon\'s tube, it would be about 2.5 meters long!',
            pt: 'Se você esticasse o tubo de um fagote, ele teria cerca de 2,5 metros de comprimento!' },
        ],
      },
      didYouKnow: {
        en: 'In "Peter and the Wolf," the grandfather is played by the bassoon — gruff and grumpy!',
        pt: 'Em "Peter e o Lobo", o avô é tocado pelo fagote — rabugento e mal-humorado!',
      },
      excerpt: {
        stem: 'audio/excerpts/figaro-bassoon.mp3',
        stemLabel: 'Bassoon',
        stemLabelPt: 'Fagote',
        premix: 'audio/excerpts/figaro-premix.mp3',
        description: 'Hear the bassoon in Mozart\'s Marriage of Figaro Overture.',
        descriptionPt: 'Ouça o fagote na Abertura de Le Nozze di Figaro, de Mozart.',
      },
      related: ['oboe', 'bass-clarinet', 'tuba'],
    },

    /* ======================== ALTO SAXOPHONE ======================== */
    'alto-sax': {
      synth: { type: 'woodwind' },
      hotspots: [
        { id: 'mouthpiece', x: 50, y: 8,
          label: 'Mouthpiece', labelPt: 'Bocal',
          desc: 'A single reed is attached to the mouthpiece, like a clarinet.',
          descPt: 'Uma palheta simples é presa ao bocal, como no clarinete.',
          tiers: [1, 2, 3] },
        { id: 'keys', x: 55, y: 45,
          label: 'Keys', labelPt: 'Teclas',
          desc: 'Many keys and levers let the player play fast, smooth melodies.',
          descPt: 'Muitas teclas e alavancas permitem ao músico tocar melodias rápidas e suaves.',
          tiers: [1, 2, 3] },
        { id: 'body', x: 50, y: 40,
          label: 'Body', labelPt: 'Corpo',
          desc: 'A brass tube bent into a curve, with a conical shape that gives the sax its smooth, singing tone.',
          descPt: 'Um tubo de latão dobrado em curva, com forma cônica que dá ao saxofone seu tom suave e cantante.',
          tiers: [2, 3] },
        { id: 'bell', x: 55, y: 88,
          label: 'Bell', labelPt: 'Sino',
          desc: 'The upward-facing bell projects sound out to the audience.',
          descPt: 'O sino voltado para cima projeta o som para a plateia.',
          tiers: [1, 2, 3] },
      ],
      facts: {
        1: [
          { en: 'The saxophone is shiny and curved, made of brass.',
            pt: 'O saxofone é brilhante e curvo, feito de latão.' },
          { en: 'It is a woodwind instrument, even though it is made of metal.',
            pt: 'É um instrumento de sopro de madeira, mesmo sendo feito de metal.' },
        ],
        2: [
          { en: 'The saxophone uses a single reed, like the clarinet.',
            pt: 'O saxofone usa uma palheta simples, como o clarinete.' },
          { en: 'It is famous for jazz music, but sometimes appears in orchestras too.',
            pt: 'É famoso no jazz, mas às vezes aparece em orquestras também.' },
        ],
        3: [
          { en: 'The saxophone was invented by Adolphe Sax in Belgium in the 1840s.',
            pt: 'O saxofone foi inventado por Adolphe Sax na Bélgica na década de 1840.' },
        ],
      },
      didYouKnow: {
        en: 'The saxophone is one of the youngest instruments — it is less than 200 years old, while the violin is over 400!',
        pt: 'O saxofone é um dos instrumentos mais jovens — tem menos de 200 anos, enquanto o violino tem mais de 400!',
      },
      related: ['clarinet', 'bass-clarinet', 'oboe'],
    },

    /* ======================== PICCOLO ======================== */
    piccolo: {
      synth: { type: 'flute' },
      hotspots: [
        { id: 'embouchure', x: 18, y: 15,
          label: 'Embouchure hole', labelPt: 'Boca',
          desc: 'Like the flute, the player blows across a hole to make sound.',
          descPt: 'Como na flauta, o músico sopra sobre um furo para produzir som.',
          tiers: [1, 2, 3] },
        { id: 'keys', x: 55, y: 50,
          label: 'Keys', labelPt: 'Teclas',
          desc: 'The piccolo has fewer keys than a flute because it plays only high notes.',
          descPt: 'O piccolo tem menos teclas que a flauta porque toca apenas notas agudas.',
          tiers: [1, 2, 3] },
        { id: 'body', x: 55, y: 50,
          label: 'Body', labelPt: 'Corpo',
          desc: 'A short silver tube — about half the length of a flute.',
          descPt: 'Um curto tubo prateado — cerca de metade do comprimento de uma flauta.',
          tiers: [2, 3] },
      ],
      facts: {
        1: [
          { en: 'The piccolo is the smallest and highest instrument in the orchestra.',
            pt: 'O piccolo é o menor e mais agudo instrumento da orquestra.' },
          { en: 'Its name means "small" in Italian.',
            pt: 'Seu nome significa "pequeno" em italiano.' },
        ],
        2: [
          { en: 'The piccolo plays an octave higher than the flute.',
            pt: 'O piccolo toca uma oitava acima da flauta.' },
          { en: 'Its tiny size makes its sound pierce through the whole orchestra.',
            pt: 'Seu tamanho minúsculo faz seu som atravessar toda a orquestra.' },
        ],
        3: [
          { en: 'Composers use the piccolo to sound like birds, whistles, or sparkling light.',
            pt: 'Os compositores usam o piccolo para soar como pássaros, assobios ou luz cintilante.' },
        ],
      },
      didYouKnow: {
        en: 'The piccolo is so loud and piercing that it can be heard over an entire orchestra of 100 players!',
        pt: 'O piccolo é tão forte e penetrante que pode ser ouvido sobre uma orquestra inteira de 100 músicos!',
      },
      excerpt: {
        stem: 'audio/excerpts/figaro-flute.mp3',
        stemLabel: 'Piccolo',
        stemLabelPt: 'Piccolo',
        premix: 'audio/excerpts/figaro-premix.mp3',
        description: 'Hear the piccolo in Mozart\'s Marriage of Figaro Overture.',
        descriptionPt: 'Ouça o piccolo na Abertura de Le Nozze di Figaro, de Mozart.',
      },
      related: ['flute', 'oboe', 'clarinet'],
    },

    /* ======================== ENGLISH HORN ======================== */
    'english-horn': {
      synth: { type: 'woodwind' },
      hotspots: [
        { id: 'reed', x: 30, y: 12,
          label: 'Double reed', labelPt: 'Palheta dupla',
          desc: 'A double reed, just like the oboe, but a bit larger.',
          descPt: 'Uma palheta dupla, igual à do oboé, mas um pouco maior.',
          tiers: [1, 2, 3] },
        { id: 'keys', x: 50, y: 45,
          label: 'Keys', labelPt: 'Teclas',
          desc: 'A key system similar to the oboe\'s, sized for its longer body.',
          descPt: 'Um sistema de teclas semelhante ao do oboé, dimensionado para seu corpo mais longo.',
          tiers: [1, 2, 3] },
        { id: 'body', x: 50, y: 55,
          label: 'Body', labelPt: 'Corpo',
          desc: 'Longer than an oboe, giving it a lower, creamier sound.',
          descPt: 'Mais longo que o oboé, dando-lhe um som mais grave e aveludado.',
          tiers: [2, 3] },
        { id: 'bell', x: 55, y: 88,
          label: 'Bell', labelPt: 'Sino',
          desc: 'A rounded bell — the French called it "cor anglais," or "English horn," but nobody knows why!',
          descPt: 'Um sino arredondado — os franceses o chamaram de "cor anglais", ou "corno inglês", mas ninguém sabe por quê!',
          tiers: [2, 3] },
      ],
      facts: {
        1: [
          { en: 'The English horn is a bigger, deeper cousin of the oboe.',
            pt: 'O corno inglês é um primo maior e mais grave do oboé.' },
          { en: 'It has a soft, sad, singing sound.',
            pt: 'Ele tem um som suave, triste e cantante.' },
        ],
        2: [
          { en: 'Despite the name, the English horn is not from England and is not a horn!',
            pt: 'Apesar do nome, o corno inglês não é da Inglaterra e não é um corno!' },
          { en: 'It uses a double reed, just like its cousin the oboe.',
            pt: 'Ele usa uma palheta dupla, assim como seu primo, o oboé.' },
        ],
        3: [
          { en: 'The famous slow solo in Dvořák\'s "New World" Symphony is played by the English horn.',
            pt: 'O famoso solo lento da Sinfonia "Novo Mundo" de Dvořák é tocado pelo corno inglês.' },
        ],
      },
      didYouKnow: {
        en: 'The English horn\'s name in French, "cor anglais," is said with an English accent by some orchestras just for fun!',
        pt: 'O nome do corno inglês em francês, "cor anglais", é pronunciado com sotaque inglês por algumas orquestras só por diversão!',
      },
      excerpt: {
        stem: 'audio/excerpts/figaro-oboe.mp3',
        stemLabel: 'English Horn',
        stemLabelPt: 'Corno Inglês',
        premix: 'audio/excerpts/figaro-premix.mp3',
        description: 'Hear the English horn in Mozart\'s Marriage of Figaro Overture.',
        descriptionPt: 'Ouça o corno inglês na Abertura de Le Nozze di Figaro, de Mozart.',
      },
      related: ['oboe', 'bassoon', 'clarinet'],
    },

    /* ======================== BASS CLARINET ======================== */
    'bass-clarinet': {
      synth: { type: 'woodwind' },
      hotspots: [
        { id: 'mouthpiece', x: 40, y: 8,
          label: 'Mouthpiece', labelPt: 'Bocal',
          desc: 'A single reed on the mouthpiece, like the regular clarinet.',
          descPt: 'Uma palheta simples no bocal, como no clarinete comum.',
          tiers: [1, 2, 3] },
        { id: 'keys', x: 55, y: 45,
          label: 'Keys', labelPt: 'Teclas',
          desc: 'A large key system covering the long, doubled-over tube.',
          descPt: 'Um grande sistema de teclas cobrindo o tubo longo e dobrado.',
          tiers: [1, 2, 3] },
        { id: 'neck', x: 45, y: 22,
          label: 'Neck', labelPt: 'Pescoço',
          desc: 'A curved metal neck bends down to the body.',
          descPt: 'Um pescoço metálico curvo desce até o corpo.',
          tiers: [2, 3] },
        { id: 'bell', x: 60, y: 90,
          label: 'Bell', labelPt: 'Sino',
          desc: 'The flared bell turns upward, giving the bass clarinet its rich, dark voice.',
          descPt: 'O sino alargado vira para cima, dando ao clarinete baixo sua voz rica e escura.',
          tiers: [2, 3] },
      ],
      facts: {
        1: [
          { en: 'The bass clarinet is a much bigger, lower clarinet.',
            pt: 'O clarinete baixo é um clarinete muito maior e mais grave.' },
          { en: 'It has a deep, dark, velvety sound.',
            pt: 'Ele tem um som profundo, escuro e aveludado.' },
        ],
        2: [
          { en: 'Its long body is bent so the player can hold it while sitting.',
            pt: 'Seu corpo longo é dobrado para que o músico possa segurá-lo sentado.' },
          { en: 'It uses a single reed, like the clarinet, but bigger.',
            pt: 'Ele usa uma palheta simples, como o clarinete, mas maior.' },
        ],
        3: [
          { en: 'Composers use the bass clarinet for mysterious, sneaky, or jazzy moments.',
            pt: 'Os compositores usam o clarinete baixo para momentos misteriosos, sorrateiros ou jazzísticos.' },
        ],
      },
      didYouKnow: {
        en: 'In "Peter and the Wolf," the bass clarinet isn\'t used — but in many movie scores it plays the sneaky villain\'s theme!',
        pt: 'Em "Peter e o Lobo", o clarinete baixo não é usado — mas em muitas trilhas de filmes ele toca o tema do vilão sorrateiro!',
      },
      excerpt: {
        stem: 'audio/excerpts/figaro-clarinet.mp3',
        stemLabel: 'Bass Clarinet',
        stemLabelPt: 'Clarinete Baixo',
        premix: 'audio/excerpts/figaro-premix.mp3',
        description: 'Hear the bass clarinet in Mozart\'s Marriage of Figaro Overture.',
        descriptionPt: 'Ouça o clarinete baixo na Abertura de Le Nozze di Figaro, de Mozart.',
      },
      related: ['clarinet', 'bassoon', 'tuba'],
    },

    /* ======================== TROMBONE ======================== */
    trombone: {
      synth: { type: 'brass' },
      hotspots: [
        { id: 'mouthpiece', x: 30, y: 20,
          label: 'Mouthpiece', labelPt: 'Bocal',
          desc: 'A cup-shaped mouthpiece where the player buzzes their lips.',
          descPt: 'Um bocal em forma de xícara onde o músico vibra os lábios.',
          tiers: [1, 2, 3] },
        { id: 'slide', x: 55, y: 50,
          label: 'Slide', labelPt: 'Vara',
          desc: 'The long, sliding tube that the player pushes and pulls to change notes — that\'s why it\'s called a "slide" trombone!',
          descPt: 'O longo tubo deslizante que o músico empurra e puxa para mudar as notas — é por isso que se chama trombone "de vara"!',
          tiers: [1, 2, 3] },
        { id: 'bell', x: 70, y: 30,
          label: 'Bell', labelPt: 'Sino',
          desc: 'The wide flared end that projects the big, bold sound.',
          descPt: 'A extremidade larga e alargada que projeta o som grande e audacioso.',
          tiers: [1, 2, 3] },
        { id: 'tuning-slide', x: 45, y: 30,
          label: 'Tuning slide', labelPt: 'Trompa de afinação',
          desc: 'A small sliding loop used to fine-tune the pitch.',
          descPt: 'Uma pequena volta deslizante usada para afinar a altura com precisão.',
          tiers: [3] },
      ],
      facts: {
        1: [
          { en: 'The trombone has a long slide that moves to change notes.',
            pt: 'O trombone tem uma longa vara que se move para mudar as notas.' },
          { en: 'It can make a big, bold, powerful sound.',
            pt: 'Ele pode produzir um som grande, audacioso e poderoso.' },
        ],
        2: [
          { en: 'Instead of valves, the trombone uses a sliding tube.',
            pt: 'Em vez de válvulas, o trombone usa um tubo deslizante.' },
          { en: 'The slide can also make a funny "slide whistle" sound called a glissando.',
            pt: 'A vara também pode produzir um som engraçado de "apito deslizante" chamado glissando.' },
        ],
        3: [
          { en: 'The trombone is the only brass instrument that changes pitch by sliding.',
            pt: 'O trombone é o único instrumento de metais que muda de altura deslizando.' },
        ],
      },
      didYouKnow: {
        en: 'Trombones can slide so smoothly that composers use them to sound like a giant yawning or a swooping bird!',
        pt: 'Os trombones podem deslizar tão suavemente que os compositores os usam para soar como um bocejo gigante ou um pássaro em voo rasante!',
      },
      excerpt: {
        stem: 'audio/excerpts/figaro-trumpet.mp3',
        stemLabel: 'Trombone',
        stemLabelPt: 'Trombone',
        premix: 'audio/excerpts/figaro-premix.mp3',
        description: 'Hear the trombone in Mozart\'s Marriage of Figaro Overture.',
        descriptionPt: 'Ouça o trombone na Abertura de Le Nozze di Figaro, de Mozart.',
      },
      related: ['trumpet', 'tuba', 'french-horn'],
    },

    /* ======================== TUBA ======================== */
    tuba: {
      synth: { type: 'brass' },
      hotspots: [
        { id: 'mouthpiece', x: 45, y: 15,
          label: 'Mouthpiece', labelPt: 'Bocal',
          desc: 'A very large, deep mouthpiece for the player to buzz into.',
          descPt: 'Um bocal muito grande e profundo no qual o músico vibra os lábios.',
          tiers: [1, 2, 3] },
        { id: 'valves', x: 50, y: 40,
          label: 'Valves', labelPt: 'Válvulas',
          desc: 'Four valves change the length of the tubing to make lower or higher notes.',
          descPt: 'Quatro válvulas mudam o comprimento do tubo para produzir notas mais graves ou mais agudas.',
          tiers: [1, 2, 3] },
        { id: 'bell', x: 65, y: 20,
          label: 'Bell', labelPt: 'Sino',
          desc: 'The huge, upward-facing bell. It projects a deep, round sound.',
          descPt: 'O enorme sino voltado para cima. Ele projeta um som grave e arredondado.',
          tiers: [1, 2, 3] },
        { id: 'body', x: 50, y: 55,
          label: 'Body', labelPt: 'Corpo',
          desc: 'About 5.5 meters of tubing coiled up — the biggest of all the brass instruments.',
          descPt: 'Cerca de 5,5 metros de tubo enrolados — o maior de todos os instrumentos de metais.',
          tiers: [2, 3] },
      ],
      facts: {
        1: [
          { en: 'The tuba is the biggest and lowest brass instrument.',
            pt: 'A tuba é o maior e mais grave instrumento de metais.' },
          { en: 'It makes a deep, booming sound like a friendly giant.',
            pt: 'Ela produz um som grave e retumbante, como um gigante amigável.' },
        ],
        2: [
          { en: 'A tuba has about 5.5 meters of tubing wrapped around its body.',
            pt: 'Uma tuba tem cerca de 5,5 metros de tubo enrolados em seu corpo.' },
          { en: 'It sits on the player\'s lap and rests on their shoulder.',
            pt: 'Ela fica no colo do músico e se apoia em seu ombro.' },
        ],
        3: [
          { en: 'The tuba was invented in 1835 and is the youngest of the orchestral brass.',
            pt: 'A tuba foi inventada em 1835 e é o mais jovem dos metais orquestrais.' },
        ],
      },
      didYouKnow: {
        en: 'In "Peter and the Wolf," Peter\'s grandfather is sometimes played by the tuba in other versions — deep and grumpy!',
        pt: 'Em "Peter e o Lobo", o avô de Peter às vezes é tocado pela tuba em outras versões — grave e rabugento!',
      },
      excerpt: {
        stem: 'audio/excerpts/figaro-double-bass.mp3',
        stemLabel: 'Tuba',
        stemLabelPt: 'Tuba',
        premix: 'audio/excerpts/figaro-premix.mp3',
        description: 'Hear the tuba in Mozart\'s Marriage of Figaro Overture.',
        descriptionPt: 'Ouça a tuba na Abertura de Le Nozze di Figaro, de Mozart.',
      },
      related: ['trombone', 'french-horn', 'double-bass'],
    },

    /* ======================== BASS DRUM ======================== */
    'bass-drum': {
      synth: { type: 'percussion' },
      hotspots: [
        { id: 'drumhead', x: 50, y: 45,
          label: 'Drumhead', labelPt: 'Pele',
          desc: 'A huge skin stretched over the frame. The player strikes it with a soft mallet.',
          descPt: 'Uma enorme pele esticada sobre a armação. O músico golpeia com uma baqueta macia.',
          tiers: [1, 2, 3] },
        { id: 'shell', x: 50, y: 50,
          label: 'Shell', labelPt: 'Caixa',
          desc: 'The wide cylindrical frame that gives the bass drum its deep, thunderous voice.',
          descPt: 'A larga armação cilíndrica que dá ao bombo sua voz grave e trovejante.',
          tiers: [1, 2, 3] },
        { id: 'rim', x: 20, y: 45,
          label: 'Rim', labelPt: 'Aro',
          desc: 'The wooden or metal hoop that holds the drumhead tightly.',
          descPt: 'O aro de madeira ou metal que mantém a pele bem esticada.',
          tiers: [3] },
      ],
      facts: {
        1: [
          { en: 'The bass drum is the biggest drum in the orchestra.',
            pt: 'O bombo é o maior tambor da orquestra.' },
          { en: 'It makes a deep, booming sound like thunder.',
            pt: 'Ele produz um som grave e retumbante como um trovão.' },
        ],
        2: [
          { en: 'It is struck with a big, soft mallet to make its low sound.',
            pt: 'Ele é golpeado com uma baqueta grande e macia para produzir seu som grave.' },
          { en: 'It is often played on the strongest beats to add drama.',
            pt: 'Ele costuma ser tocado nos tempos mais fortes para adicionar dramaticidade.' },
        ],
        3: [
          { en: 'A bass drum can be over a meter wide — bigger than most school doors!',
            pt: 'Um bombo pode ter mais de um metro de largura — maior que a maioria das portas de escola!' },
        ],
      },
      didYouKnow: {
        en: 'The bass drum can be so loud that it makes the whole concert hall vibrate — you can feel it in your chest!',
        pt: 'O bombo pode ser tão forte que faz vibrar toda a sala de concerto — você sente no peito!',
      },
      related: ['timpani', 'snare-drum', 'tam-tam'],
    },

    /* ======================== GLOCKENSPIEL ======================== */
    glockenspiel: {
      synth: { type: 'percussion' },
      hotspots: [
        { id: 'bars', x: 50, y: 45,
          label: 'Bars', labelPt: 'Barras',
          desc: 'A row of metal bars, each tuned to a different note, laid out like a piano keyboard.',
          descPt: 'Uma fileira de barras de metal, cada uma afinada numa nota diferente, dispostas como um teclado de piano.',
          tiers: [1, 2, 3] },
        { id: 'mallets', x: 25, y: 70,
          label: 'Mallets', labelPt: 'Baquetas',
          desc: 'The player strikes the bars with small hard mallets for a bright, bell-like sound.',
          descPt: 'O músico golpeia as barras com pequenas baquetas duras para produzir um som brilhante, como de sino.',
          tiers: [1, 2, 3] },
        { id: 'frame', x: 50, y: 65,
          label: 'Frame', labelPt: 'Estrutura',
          desc: 'A frame holds the bars in place, often inside a carrying case.',
          descPt: 'Uma estrutura mantém as barras no lugar, geralmente dentro de um estojo de transporte.',
          tiers: [2, 3] },
      ],
      facts: {
        1: [
          { en: 'The glockenspiel is a set of metal bars that sound like tiny bells.',
            pt: 'O glockenspiel é um conjunto de barras de metal que soam como sininhos.' },
          { en: 'Its name means "bell play" in German.',
            pt: 'Seu nome significa "jogo de sinos" em alemão.' },
        ],
        2: [
          { en: 'The player strikes the metal bars with small mallets.',
            pt: 'O músico golpeia as barras de metal com pequenas baquetas.' },
          { en: 'Its sparkling sound is often used for magical or fairy-tale moments.',
            pt: 'Seu som cintilante costuma ser usado em momentos mágicos ou de contos de fada.' },
        ],
        3: [
          { en: 'The glockenspiel sounds two octaves higher than written — it is tiny but piercing!',
            pt: 'O glockenspiel soa duas oitavas acima do escrito — é minúsculo mas penetrante!' },
        ],
      },
      didYouKnow: {
        en: 'The glockenspiel is one of the few instruments small enough to carry in one hand — many players hold it like a tray!',
        pt: 'O glockenspiel é um dos poucos instrumentos pequenos o bastante para carregar numa mão — muitos músicos o seguram como uma bandeja!',
      },
      related: ['marimba', 'triangle', 'celesta'],
    },

    /* ======================== MARIMBA ======================== */
    marimba: {
      synth: { type: 'percussion' },
      hotspots: [
        { id: 'bars', x: 50, y: 40,
          label: 'Bars', labelPt: 'Barras',
          desc: 'A large set of wooden bars, each tuned to a note. The bars are laid out like piano keys.',
          descPt: 'Um grande conjunto de barras de madeira, cada uma afinada numa nota. As barras são dispostas como teclas de piano.',
          tiers: [1, 2, 3] },
        { id: 'resonators', x: 50, y: 65,
          label: 'Resonators', labelPt: 'Ressonadores',
          desc: 'Metal tubes hanging under each bar amplify and lengthen the sound.',
          descPt: 'Tubos de metal pendurados sob cada barra amplificam e prolongam o som.',
          tiers: [2, 3] },
        { id: 'mallets', x: 25, y: 70,
          label: 'Mallets', labelPt: 'Baquetas',
          desc: 'The player strikes the bars with mallets, sometimes holding two or four at once!',
          descPt: 'O músico golpeia as barras com baquetas, às vezes segurando duas ou quatro ao mesmo tempo!',
          tiers: [1, 2, 3] },
      ],
      facts: {
        1: [
          { en: 'The marimba is a big wooden xylophone with a warm, mellow sound.',
            pt: 'A marimba é um grande xilofone de madeira com um som quente e suave.' },
          { en: 'You play it by hitting the wooden bars with mallets.',
            pt: 'Você a toca golpeando as barras de madeira com baquetas.' },
        ],
        2: [
          { en: 'Metal tubes called resonators hang under the bars to make the sound last longer.',
            pt: 'Tubos de metal chamados ressonadores ficam pendurados sob as barras para fazer o som durar mais.' },
          { en: 'The bars are made of rosewood or other hard woods.',
            pt: 'As barras são feitas de pau-rosa ou outras madeiras duras.' },
        ],
        3: [
          { en: 'The marimba comes from Africa and Latin America, and is often used in folk music.',
            pt: 'A marimba vem da África e da América Latina, e é frequentemente usada na música folclórica.' },
        ],
      },
      didYouKnow: {
        en: 'A marimba can be over 2 meters long — the biggest ones need two players standing side by side!',
        pt: 'Uma marimba pode ter mais de 2 metros de comprimento — as maiores precisam de dois músicos lado a lado!',
      },
      related: ['glockenspiel', 'timpani', 'piano'],
    },

    /* ======================== TAM-TAM ======================== */
    'tam-tam': {
      synth: { type: 'percussion' },
      hotspots: [
        { id: 'body', x: 50, y: 50,
          label: 'Body', labelPt: 'Corpo',
          desc: 'A huge, flat metal disc. Unlike cymbals, a tam-tam is struck and left to ring, not crashed.',
          descPt: 'Um enorme disco de metal plano. Ao contrário dos pratos, o tam-tam é golpeado e deixado ressoar, não é batido.',
          tiers: [1, 2, 3] },
        { id: 'mallets', x: 25, y: 70,
          label: 'Mallet', labelPt: 'Baqueta',
          desc: 'The player uses a soft, padded mallet for a deep, shimmering roar.',
          descPt: 'O músico usa uma baqueta macia e acolchoada para produzir um rugido profundo e cintilante.',
          tiers: [1, 2, 3] },
        { id: 'stand', x: 50, y: 88,
          label: 'Stand', labelPt: 'Suporte',
          desc: 'A frame hangs or holds the heavy disc so it can vibrate freely.',
          descPt: 'Uma armação pendura ou sustenta o disco pesado para que ele possa vibrar livremente.',
          tiers: [2, 3] },
      ],
      facts: {
        1: [
          { en: 'The tam-tam is a giant metal disc that makes a huge, booming crash.',
            pt: 'O tam-tam é um disco gigante de metal que produz um estrondo enorme e retumbante.' },
          { en: 'Its sound can take many seconds to fade away completely.',
            pt: 'Seu som pode levar muitos segundos para desaparecer completamente.' },
        ],
        2: [
          { en: 'It is struck with a soft mallet — never hit like a cymbal.',
            pt: 'Ele é golpeado com uma baqueta macia — nunca batido como um prato.' },
          { en: 'Composers use it for dramatic, mysterious, or scary moments.',
            pt: 'Os compositores o usam para momentos dramáticos, misteriosos ou assustadores.' },
        ],
        3: [
          { en: 'The tam-tam is a type of gong — its deep roar can shake the whole concert hall.',
            pt: 'O tam-tam é um tipo de gongo — seu rugido profundo pode fazer tremer toda a sala de concerto.' },
        ],
      },
      didYouKnow: {
        en: 'A tam-tam can ring for nearly a minute after one strike — the sound seems to hang in the air!',
        pt: 'Um tam-tam pode ressoar por quase um minuto após um único golpe — o som parece pairar no ar!',
      },
      related: ['bass-drum', 'timpani', 'triangle'],
    },

    /* ======================== CELESTA ======================== */
    celesta: {
      synth: { type: 'other' },
      hotspots: [
        { id: 'keys', x: 50, y: 70,
          label: 'Keys', labelPt: 'Teclas',
          desc: 'A small keyboard, like a piano\'s, that the player presses to play.',
          descPt: 'Um pequeno teclado, como o do piano, que o músico pressiona para tocar.',
          tiers: [1, 2, 3] },
        { id: 'hammers', x: 50, y: 45,
          label: 'Hammers', labelPt: 'Martelos',
          desc: 'Pressing a key makes a felt hammer strike a metal bar inside, like a piano.',
          descPt: 'Pressionar uma tecla faz um martelo de feltro golpear uma barra de metal lá dentro, como um piano.',
          tiers: [2, 3] },
        { id: 'bars', x: 50, y: 30,
          label: 'Bars', labelPt: 'Barras',
          desc: 'Metal bars inside the box ring with a pure, bell-like sound.',
          descPt: 'Barras de metal dentro da caixa ressoam com um som puro, como de sino.',
          tiers: [2, 3] },
      ],
      facts: {
        1: [
          { en: 'The celesta is a small keyboard that sounds like tiny bells.',
            pt: 'A celesta é um pequeno teclado que soa como sininhos.' },
          { en: 'Its name means "heavenly" in French.',
            pt: 'Seu nome significa "celestial" em francês.' },
        ],
        2: [
          { en: 'Inside, hammers hit metal bars instead of strings.',
            pt: 'Lá dentro, martelos golpeiam barras de metal em vez de cordas.' },
          { en: 'Its sparkling sound is used for magical, dreamy moments.',
            pt: 'Seu som cintilante é usado em momentos mágicos e sonhadores.' },
        ],
        3: [
          { en: 'Tchaikovsky made the celesta famous with the "Dance of the Sugar Plum Fairy."',
            pt: 'Tchaikovsky tornou a celesta famosa com a "Dança da Fada dos Açúcar".' },
        ],
      },
      didYouKnow: {
        en: 'The celesta sounds so magical that it is often used for fairy music — Tchaikovsky kept it a secret until its premiere!',
        pt: 'A celesta soa tão mágica que é frequentemente usada para música de fadas — Tchaikovsky a manteve em segredo até a estreia!',
      },
      related: ['piano', 'glockenspiel', 'harp'],
    },
  };

  /* --- Build the lookup maps --- */
  var BY_ID = {};
  for (var i = 0; i < ROSTER.length; i++) {
    var inst = ROSTER[i];
    var detail = DETAIL[inst.id] || {};
    BY_ID[inst.id] = {
      id: inst.id,
      name: inst.name,
      namePt: inst.namePt,
      family: inst.family,
      tier: inst.tier,
      emoji: inst.emoji,
      sizeCm: inst.sizeCm,
      synth: detail.synth || { type: 'generic' },
      hotspots: detail.hotspots || [],
      facts: detail.facts || { 1: [], 2: [], 3: [] },
      didYouKnow: detail.didYouKnow || null,
      excerpt: detail.excerpt || null,
      related: detail.related || [],
      hasDetail: !!DETAIL[inst.id],
    };
  }

  /* --- Public API --- */
  var INSTRUMENTS = {
    FAMILIES: FAMILIES,
    FAMILY_ORDER: FAMILY_ORDER,
    ROSTER: ROSTER,
    BY_ID: BY_ID,
    ORCHESTRA_STEMS: ORCHESTRA_STEMS,
    ORCHESTRA_PREMIX: ORCHESTRA_PREMIX,

    get: function (id) { return BY_ID[id] || null; },

    byFamily: function (familyId) {
      return ROSTER.filter(function (r) { return r.family === familyId; });
    },

    byTier: function (maxTier) {
      return ROSTER.filter(function (r) { return r.tier <= maxTier; });
    },

    byFamilyAndTier: function (familyId, maxTier) {
      return ROSTER.filter(function (r) {
        return r.family === familyId && r.tier <= maxTier;
      });
    },

    familyCount: function (familyId, maxTier) {
      return INSTRUMENTS.byFamilyAndTier(familyId, maxTier).length;
    },

    /* Hotspots filtered by tier */
    hotspotsForTier: function (id, tier) {
      var inst = BY_ID[id];
      if (!inst) return [];
      return inst.hotspots.filter(function (h) {
        return h.tiers.indexOf(tier) !== -1;
      });
    },

    /* Facts filtered by tier (cumulative) */
    factsForTier: function (id, tier) {
      var inst = BY_ID[id];
      if (!inst) return [];
      var out = [];
      for (var t = 1; t <= tier; t++) {
        if (inst.facts[t]) out = out.concat(inst.facts[t]);
      }
      return out;
    },

    /* Instruments available at a given tier, in ROSTER order */
    availableAt: function (tier) {
      return ROSTER.filter(function (r) { return r.tier <= tier; });
    },
  };

  if (typeof window !== 'undefined') window.INSTRUMENTS = INSTRUMENTS;
  if (typeof module !== 'undefined' && module.exports) module.exports = INSTRUMENTS;
})();
