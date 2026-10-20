/* ============================================================
   Orchestrarium — i18n
   English is the source-string identity.
   PT-BR dictionary maps EN source strings → PT-BR translations.
   t() falls back to the EN source string when no PT-BR entry exists.
   ============================================================ */
(function () {
  'use strict';

  var LANG_KEY = 'orchestrariumLang';

  function detectDefaultLang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved === 'pt' || saved === 'en') return saved;
    } catch (e) { /* private mode */ }
    if (/^pt/i.test(navigator.language || '')) return 'pt';
    return 'en';
  }

  var LANG = detectDefaultLang();

  /* PT-BR dictionary. Keys are exact EN source strings. */
  var PT = {
    /* --- App chrome --- */
    'Orchestrarium': 'Orchestrarium',
    'Instruments of the Orchestra': 'Instrumentos da Orquestra',
    'Learn about the instruments of the orchestra.': 'Aprenda sobre os instrumentos da orquestra.',
    'Free, offline-first, for K-8 students.': 'Gratuito, offline, para alunos do fundamental.',

    /* --- Welcome / Tier picker --- */
    'Welcome!': 'Bem-vindo!',
    'Choose your level to get started.': 'Escolha seu nível para começar.',
    'CHOOSE YOUR LEVEL': 'ESCOLHA SEU NÍVEL',
    'Little Kids': 'Criancinhas',
    'Explorers': 'Exploradores',
    'Big Kids': 'Grandões',
    'Ages 5–7': '5–7 anos',
    'Ages 8–10': '8–10 anos',
    'Ages 11–14': '11–14 anos',

    /* --- Home --- */
    'Explore': 'Explorar',
    'Play': 'Jogar',
    'Meet the instruments and hear how they sound.': 'Conheça os instrumentos e ouça como eles soam.',
    'Games and quizzes to test what you learned.': 'Jogos e quiz para testar o que você aprendeu.',
    'Glossary': 'Glossário',
    'Settings': 'Configurações',
    'Credits': 'Créditos',
    'Level': 'Nível',
    'Change level': 'Mudar nível',

    /* --- Families --- */
    'Strings': 'Cordas',
    'Woodwinds': 'Madeiras',
    'Brass': 'Metais',
    'Percussion': 'Percussão',
    'Other': 'Outros',
    'instruments': 'instrumentos',

    /* --- Instrument detail --- */
    'Hear it!': 'Ouça!',
    'In the orchestra': 'Na orquestra',
    'Solo': 'Solo',
    'Full orchestra': 'Orquestra completa',
    'Parts of the instrument': 'Partes do instrumento',
    'Facts': 'Curiosidades',
    'Size comparison': 'Comparação de tamanho',
    'Related instruments': 'Instrumentos relacionados',
    'Did you know?': 'Você sabia?',
    'cm': 'cm',
    'm': 'm',

    /* --- Hotspot labels (violin reference) --- */
    'Strings': 'Cordas',
    'Bow': 'Arco',
    'Scroll': 'Roscão',
    'Pegs': 'Clavijas',
    'Neck': 'Pescoço',
    'Fingerboard': 'Tastilho',
    'Bridge': 'Ponte',
    'f-holes': 'Bocas de som',
    'Body': 'Corpo',
    'Chin rest': 'Descanso de queixo',
    'Tailpiece': 'Saltarelho',
    'Endpin': 'Espigão',
    'Frets': 'Trastes',
    'Soundboard': 'Tampo',
    'Resonance box': 'Caixa de ressonância',
    'Keys': 'Teclas',
    'Valves': 'Válvulas',
    'Slide': 'Trompa',
    'Bell': 'Sino',
    'Mouthpiece': 'Bocal',
    'Lip plate': 'Placa de lábios',
    'Embouchure hole': 'Boca',
    'Head joint': 'Cabeça',
    'Body joint': 'Corpo',
    'Foot joint': 'Pé',
    'Reed': 'Palheta',
    'Bocal': 'Canela',
    'F-holes': 'Bocas de som',
    'Tuning pegs': 'Clavijas de afinação',
    'Fine tuners': 'Afinação fina',
    'Drumhead': 'Pele',
    'Shell': 'Caixa',
    'Rim': 'Aro',
    'Strainer': 'Tensor',
    'Lugs': 'Tarraxas',
    'Pedals': 'Pedais',
    'Dome': 'Cúpula',
    'Clapper': 'Martelinho',
    'Tongues': 'Línguas',
    'Pipes': 'Canos',
    'Bellows': 'Foles',
    'Soundboard': 'Tampo',
    'Strings': 'Cordas',
    'Tuning pins': 'Cravetas',
    'Action': 'Mecanismo',
    'Hammers': 'Martelos',

    /* --- Games --- */
    'What Instrument Is This?': 'Qual é este Instrumento?',
    'Listen and pick the right instrument.': 'Ouça e escolha o instrumento certo.',
    'Instrument Bingo': 'Bingo dos Instrumentos',
    'Hear a sound, find it on your card.': 'Ouça um som e encontre no seu cartão.',
    'Build the Orchestra': 'Monte a Orquestra',
    'Put each instrument in its family.': 'Coloque cada instrumento na sua família.',
    'Explore more instruments to unlock!': 'Explore mais instrumentos para desbloquear!',
    'instrument(s) explored': 'instrumento(s) explorado(s)',
    'Correct!': 'Correto!',
    'Try again!': 'Tente de novo!',
    'Play again': 'Jogar de novo',
    'Score': 'Pontuação',
    'Best': 'Recorde',
    'New best!': 'Novo recorde!',
    'Level up!': 'Subiu de nível!',

    /* --- Quiz --- */
    'Which instrument is this?': 'Qual é este instrumento?',
    'Listen...': 'Ouvindo...',
    'Listen': 'Ouvir',
    'Your score:': 'Sua pontuação:',
    'stars': 'estrelas',

    /* --- Bingo --- */
    'Your card': 'Seu cartão',
    'Call next': 'Chamar próximo',
    'BINGO!': 'BINGO!',

    /* --- Build the Orchestra --- */
    'Drag each instrument to its family section.': 'Arraste cada instrumento para a seção da sua família.',
    'Well done!': 'Muito bem!',
    'Try again': 'Tente de novo',
    'Reset': 'Recomeçar',

    /* --- Glossary terms --- */
    'Family': 'Família',
    'Orchestra': 'Orquestra',
    'Conductor': 'Regente',
    'Timbre': 'Timbre',
    'Pitch': 'Altura',
    'Vibration': 'Vibração',
    'Resonance': 'Ressonância',
    'Bow': 'Arco',
    'Reed': 'Palheta',
    'Embouchure': 'Embocadura',
    'Section': 'Seção',
    'Solo': 'Solo',
    'Score': 'Partitura',

    /* --- Glossary definitions --- */
    'A group of instruments that are similar in how they make sound.': 'Um grupo de instrumentos que são parecidos na forma como produzem som.',
    'A large group of musicians playing together, led by a conductor.': 'Um grande grupo de músicos tocando juntos, liderados por um regente.',
    'The person who leads the orchestra, setting the tempo and style.': 'A pessoa que lidera a orquestra, definindo o andamento e o estilo.',
    'The unique quality of a sound that lets you tell instruments apart.': 'A qualidade única de um som que permite distinguir os instrumentos.',
    'How high or low a sound is.': 'Quão grave ou agudo é um som.',
    'A rapid back-and-forth movement that produces sound.': 'Um movimento rápido de ida e volta que produz som.',
    'The deepening and enriching of sound inside a hollow space.': 'O aprofundamento e enriquecimento do som dentro de um espaço oco.',
    'A stick with hair, used to play string instruments.': 'Um bastão com pelos, usado para tocar instrumentos de cordas.',
    'A thin piece of material that vibrates to make sound in woodwind instruments.': 'Uma fina peça de material que vibra para produzir som em instrumentos de sopro.',
    'The way a player shapes their mouth to blow into an instrument.': 'A forma como o músico molda a boca para soprar no instrumento.',
    'A group of instruments of the same family playing together.': 'Um grupo de instrumentos da mesma família tocando juntos.',
    'A featured player who plays alone, or plays a prominent part.': 'Um músico destaque que toca sozinho, ou toca uma parte proeminente.',
    'The written form of music.': 'A forma escrita da música.',

    /* --- Settings --- */
    'Language': 'Idioma',
    'English': 'English',
    'Português (Brasil)': 'Português (Brasil)',
    'Audio': 'Áudio',
    'Download for offline use': 'Baixar para uso offline',
    'Downloaded': 'Baixado',
    'Downloading...': 'Baixando...',
    'About': 'Sobre',
    'Version': 'Versão',

    /* --- Misc --- */
    'Back': 'Voltar',
    'Close': 'Fechar',
    'Next': 'Próximo',
    'Done': 'Concluído',
    'Skip': 'Pular',
    'Start': 'Começar',
    'OK': 'OK',
    'Yes': 'Sim',
    'No': 'Não',
  };

  function t(str) {
    if (LANG === 'pt' && Object.prototype.hasOwnProperty.call(PT, str)) {
      return PT[str];
    }
    return str;
  }

  function setLang(lang) {
    LANG = (lang === 'pt') ? 'pt' : 'en';
    try { localStorage.setItem(LANG_KEY, LANG); } catch (e) {}
    document.documentElement.setAttribute('lang', LANG === 'pt' ? 'pt-BR' : 'en');
    if (typeof render === 'function') render();
  }

  function getLang() { return LANG; }

  /* Expose globally (works both in browser and Node test sandbox) */
  if (typeof window !== 'undefined') {
    window.t = t;
    window.setLang = setLang;
    window.getLang = getLang;
    window.I18N_PT = PT;
  }

  /* Node test sandbox */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { t: t, setLang: setLang, getLang: getLang, PT: PT, LANG: LANG };
  }
})();
