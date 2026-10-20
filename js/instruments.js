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
        stem: 'audio/excerpts/figaro-violin-1.mp3',
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
      related: ['glockenspiel', 'timpani', 'triangle'],
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
