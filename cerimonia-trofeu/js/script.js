const nomesArquivoQuadrilhas = {
  'Amor Junino': 'amor-junino.jpg',
  'Arraiá Chapéu de Palha': 'arraia-chapeu-de-palha.png',
  'Arraiá dos Matutos': 'arraia-dos-matutos.jpg',
  'Arroxa o Nó': 'arroxa-o-no.jpg',
  'Caipirada': 'caipirada.jpg',
  'Chinelo de Couro': 'chinelo-de-couro.jpg',
  'Coisas da Roça': 'coisas-da-roca.jpg',
  'Eita Bagaceira': 'eita-bagaceira.jpg',
  'Espalha Brasa': 'espalha-brasa.jpg',
  'Formiga da Roça': 'formiga-da-roca.jpg',
  'Fornalha': 'fornalha.jpg',
  'Furacão': 'furacao.jpg',
  'Mala Véia': 'mala-veia.jpg',
  'Matingueiros do Sertão': 'matingueiros-do-sertao.jpg',
  'Matulão': 'matulao.jpg',
  'Os Caboclos do Sertão': 'os-caboclos-do-sertao.jpg',
  'Paixão Cangaço': 'paixao-cangaco.JPEG',
  'Pinga em Mim': 'pinga-em-mim.jpg',
  'Rasga o Fole': 'rasga-o-fole.jpg',
  'Ribuliço': 'ribulico.jpg',
  'Sol de Maria': 'sol-de-maria.jpg',
  'Tengo Lengo': 'tengo-lengo.jpg',
  'Tico Tico no Fubá': 'tico-tico-no-fuba.jpg',
  'Vai Mas Não Vai': 'vai-mas-nao-vai.jpg',
  'Xamegar': 'xamegar.jpg',
  'Xém Nhem Nhém': 'xem-nhem-nhem.jpg',
  'Xique Xique': 'xique-xique.jpg'
};

const nomesArquivoLogosQuadrilhas = {
  'Amor Junino': 'amor-junino-logo.png',
  'Arraiá Chapéu de Palha': 'arraia-chapeu-de-palha-logo.png',
  'Arraiá dos Matutos': 'arraia-dos-matutos-logo.jpeg',
  'Arroxa o Nó': 'arroxa-o-no-logo.png',
  'Caipirada': 'caipirada-logo.png',
  'Chinelo de Couro': 'chinelo-de-couro-logo.png',
  'Coisas da Roça': 'coisas-da-roca-logo.png',
  'Eita Bagaceira': 'eita-bagaceira-logo.jpg',
  'Espalha Brasa': 'espalha-brasa-logo.png',
  'Formiga da Roça': 'formiga-da-roca-logo.png',
  'Fornalha': 'fornalha-logo.jpeg',
  'Furacão': 'furacao-logo.jpg',
  'Mala Véia': 'mala-veia-logo.png',
  'Matingueiros do Sertão': 'matingueiros-do-sertao-logo.png',
  'Matulão': 'matulao-logo.png',
  'Os Caboclos do Sertão': 'os-caboclos-do-sertao-logo.png',
  'Paixão Cangaço': 'paixao-cangaco.png',
  'Pinga em Mim': 'pinga-em-mim-logo.png',
  'Rasga o Fole': 'rasga-o-fole-logo.png',
  'Ribuliço': 'ribulico-logo.png',
  'Sol de Maria': 'sol-de-maria-logo.png',
  'Tengo Lengo': 'tengo-lengo-logo.png',
  'Tico Tico no Fubá': 'tico-tico-no-fuba-logo.png',
  'Vai Mas Não Vai': 'vai-mas-nao-vai-logo.jpeg',
  'Xamegar': 'xamegar-logo.jpg',
  'Xém Nhem Nhém': 'xem-nhem-nhem-logo.png',
  'Xique Xique': 'xique-xique-logo.jpg'
};

const nomesArquivoCidades = {
  'Paranoá': 'paranoa.jpg',
  'Samambaia': 'samambaia.jpg',
  'Taguatinga': 'taguatinga.jpg'
};

const nomesArquivoMelhorCasalDeNoivos = {
  'Amor Junino': 'amor-junino.jpg',
  'Arroxa o Nó': 'arroxa-o-no.jpg',
  'Chinelo de Couro': 'chinelo-de-couro.jpg',
  'Coisas da Roça': 'coisas-da-roca.jpg',
  'Espalha Brasa': 'espalha-brasa.jpg',
  'Formiga da Roça': 'formiga-da-roca.jpg',
  'Fornalha': 'fornalha.jpg',
  'Furacão': 'furacao.jpg',
  'Mala Véia': 'mala-veia.jpg',
  'Matingueiros do Sertão': 'matingueiros-do-sertao.jpg',
  'Matulão': 'matulao.jpg',
  'Os Caboclos do Sertão': 'os-caboclos-do-sertao.jpg',
  'Pinga em Mim': 'pinga-em-mim.jpg',
  'Rasga o Fole': 'rasga-o-fole.jpg',
  'Ribuliço': 'ribulico.jpg',
  'Sol de Maria': 'sol-de-maria.jpg',
  'Tengo Lengo': 'tengo-lengo.jpg',
  'Vai Mas Não Vai': 'vai-mas-nao-vai.jpg',
  'Xamegar': 'xamegar.jpg',
  'Xém Nhem Nhém': 'xem-nhem-nhem.jpg',
  'Xique Xique': 'xique-xique.jpg'
};

Object.assign(nomesArquivoMelhorCasalDeNoivos, nomesArquivoQuadrilhas, {
  'Tico Tico no Fubá': 'tico-tico.jpg'
});

const nomesArquivoMelhorMarcacao = {
  ...nomesArquivoQuadrilhas,
  'Matingueiros do Sertão': 'matingueiros-do-sertão.jpg',
  'Tico Tico no Fubá': 'tico-tico.jpg'
};

const imagensEspeciaisPorQuesito = {
  2: {
    pasta: 'melhor-marcacao',
    arquivos: nomesArquivoMelhorMarcacao
  },
  5: {
    pasta: 'melhor-casal-de-noivos',
    arquivos: nomesArquivoMelhorCasalDeNoivos
  }
};

const focoVencedoresPorQuesito = {
  1: {
    'chinelo-de-couro.jpg': { y: '9%' }
  },
  3: {
    'chinelo-de-couro.jpg': { y: '4%' },
    'formiga-da-roca.jpg': { y: '14%' }
  },
  2: {
    'matulao.jpg': { x: '47%', y: '22%' },
    'ribulico.jpg': { x: '50%', y: '22%' }
  },
  4: {
    'matulao.jpg': { x: '50%', y: '30%' },
    'arroxa-o-no.jpg': { x: '44%', y: '18%', scale: '1.05' },
    'pinga-em-mim.jpg': { x: '62%', y: '18%', scale: '1.05' },
    'ribulico.jpg': { x: '48%', y: '20%', scale: '1.05' }
  },
  5: {
    'formiga-da-roca.jpg': { x: '50%', y: '37%' },
    'os-caboclos-do-sertao.jpg': { x: '51%', y: '46%', scale: '1.04', fit: 'cover' }
  },
  8: {
    'chinelo-de-couro.jpg': { y: '2%' },
    'formiga-da-roca.jpg': { y: '7%' }
  },
  11: {
    'chinelo-de-couro.jpg': { y: '2%' },
    'formiga-da-roca.jpg': { y: '7%' }
  }
};

const focoParticipantesBase = {
  'caipirada.jpg': { y: '16%' },
  'chinelo-de-couro.jpg': { y: '14%' },
  'coisas-da-roca.jpg': { y: '6%' },
  'espalha-brasa.jpg': { y: '-4%' },
  'formiga-da-roca.jpg': { y: '11%' },
  'fornalha.jpg': { y: '4%' },
  'furacao.jpg': { y: '19%' },
  'tengo-lengo.jpg': { y: '9%' },
  'vai-mas-nao-vai.jpg': { y: '6%' },
  'xamegar.jpg': { y: '16%' },
  'xem-nhem-nhem.jpg': { y: '9%' }
};

const focoParticipantesPorQuesito = {
  2: {
    'arraia-dos-matutos.jpg': { y: '11%' },
    'coisas-da-roca.jpg': { y: '6%' },
    'eita-bagaceira.jpg': { y: '11%' },
    'espalha-brasa.jpg': { y: '-4%' },
    'formiga-da-roca.jpg': { y: '11%' },
    'mala-veia.jpg': { y: '11%' },
    'sol-de-maria.jpg': { y: '9%' },
    'xamegar.jpg': { y: '6%' }
  },
  5: {
    'arraia-dos-matutos.jpg': { y: '75%' },
    'eita-bagaceira.jpg': { y: '36%' },
    'espalha-brasa.jpg': { y: '16%' },
    'formiga-da-roca.jpg': { y: '31%' }
  },
  13: {
    'matingueiros-do-sertao.jpg': { y: '12%' },
    'sol-de-maria.jpg': { y: '5%' },
    'os-caboclos-do-sertao.jpg': { y: '14%' }
  }
};

const OPERATOR_STORAGE_KEY = 'trofeu-operator-config-v1';
const DEFAULT_OPERATOR_CONFIG = {
  stage: {
    ratio: 'auto',
    width: 100,
    height: 100
  },
  photos: {}
};

let operatorConfig = null;

const corMap = {
  'Amor Junino': '#BF360C',
  'Arraiá Chapéu de Palha': '#6B5B95',
  'Arraiá dos Matutos': '#4A148C',
  'Arroxa o Nó': '#8B0000',
  'Caipirada': '#006064',
  'Chinelo de Couro': '#5D4037',
  'Coisas da Roça': '#2E7D32',
  'Eita Bagaceira': '#E65100',
  'Espalha Brasa': '#B71C1C',
  'Formiga da Roça': '#1B5E20',
  'Fornalha': '#C62828',
  'Furacão': '#0277BD',
  'Mala Véia': '#37474F',
  'Matingueiros do Sertão': '#558B2F',
  'Matulão': '#F57F17',
  'Os Caboclos do Sertão': '#4E342E',
  'Paixão Cangaço': '#7C4D1E',
  'Pinga em Mim': '#4527A0',
  'Rasga o Fole': '#795548',
  'Ribuliço': '#0D3B8C',
  'Sol de Maria': '#F9A825',
  'Tengo Lengo': '#00695C',
  'Tico Tico no Fubá': '#8E24AA',
  'Vai Mas Não Vai': '#1A237E',
  'Xamegar': '#880E4F',
  'Xém Nhem Nhém': '#283593',
  'Xique Xique': '#33691E',
  'Paranoá': '#5D4037',
  'Samambaia': '#0D47A1',
  'Taguatinga': '#E65100'
};

function cor(nome) {
  return corMap[nome] || '#5b3526';
}

function iniciaisDe(nome) {
  const ignorar = ['de', 'da', 'do', 'dos', 'das', 'e'];
  const partes = nome.split(' ').filter(Boolean).filter(p => !ignorar.includes(p.toLowerCase()));
  return partes.slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

function ordenarPorNome(lista) {
  return [...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
}

function quadrilha(nome) {
  return {
    nome,
    cor: cor(nome),
    imagem: nomesArquivoQuadrilhas[nome] ? `./imgens/quadrilhas/${nomesArquivoQuadrilhas[nome]}` : '',
    logo: nomesArquivoLogosQuadrilhas[nome] ? `./imgens/logos-quadrilhas/${nomesArquivoLogosQuadrilhas[nome]}` : '',
    iniciais: iniciaisDe(nome)
  };
}

function cidade(nome) {
  return {
    nome,
    cor: cor(nome),
    imagem: nomesArquivoCidades[nome] ? `./imgens/cidades/${nomesArquivoCidades[nome]}` : '',
    iniciais: iniciaisDe(nome)
  };
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function sanitizeStageConfig(stage = {}) {
  return {
    ratio: typeof stage.ratio === 'string' && stage.ratio ? stage.ratio : 'auto',
    width: clamp(Number(stage.width) || 100, 40, 100),
    height: clamp(Number(stage.height) || 100, 40, 100)
  };
}

function sanitizePhotoOverride(photo = {}) {
  const next = {};
  if (photo.x !== undefined) next.x = String(photo.x);
  if (photo.y !== undefined) next.y = String(photo.y);
  if (photo.scale !== undefined) next.scale = String(photo.scale);
  if (photo.scaleX !== undefined) next.scaleX = String(photo.scaleX);
  if (photo.scaleY !== undefined) next.scaleY = String(photo.scaleY);
  if (photo.fit !== undefined) next.fit = String(photo.fit);
  return next;
}

function normalizeOperatorConfig(raw = {}) {
  const photos = {};
  const rawPhotos = raw.photos && typeof raw.photos === 'object' ? raw.photos : {};
  Object.entries(rawPhotos).forEach(([key, value]) => {
    photos[key] = sanitizePhotoOverride(value);
  });

  return {
    stage: sanitizeStageConfig(raw.stage),
    photos
  };
}

function readOperatorConfig() {
  try {
    const raw = localStorage.getItem(OPERATOR_STORAGE_KEY);
    if (!raw) return normalizeOperatorConfig(DEFAULT_OPERATOR_CONFIG);
    return normalizeOperatorConfig(JSON.parse(raw));
  } catch (_) {
    return normalizeOperatorConfig(DEFAULT_OPERATOR_CONFIG);
  }
}

function saveOperatorConfig(config) {
  operatorConfig = normalizeOperatorConfig(config);
  try {
    localStorage.setItem(OPERATOR_STORAGE_KEY, JSON.stringify(operatorConfig));
  } catch (_) {}
  return operatorConfig;
}

function getOperatorConfig() {
  if (!operatorConfig) {
    operatorConfig = readOperatorConfig();
  }
  return operatorConfig;
}

function makePhotoOverrideKey(slideType, numeroQuesito, arquivo) {
  return `${slideType}|${numeroQuesito}|${arquivo}`;
}

function getPhotoOverride(slideType, numeroQuesito, arquivo) {
  if (!arquivo) return null;
  const config = getOperatorConfig();
  return config.photos[makePhotoOverrideKey(slideType, numeroQuesito, arquivo)] || null;
}

function applyPhotoFocus(item, focus) {
  if (!focus) return item;
  return {
    ...item,
    fotoPosX: focus.x || item.fotoPosX,
    fotoPosY: focus.y || item.fotoPosY,
    fotoScale: focus.scale || item.fotoScale,
    fotoScaleX: focus.scaleX || item.fotoScaleX,
    fotoScaleY: focus.scaleY || item.fotoScaleY,
    fotoFit: focus.fit || item.fotoFit
  };
}

function itemQuesito(item, numeroQuesito) {
  const config = imagensEspeciaisPorQuesito[numeroQuesito];
  return config && config.arquivos[item.nome]
    ? {
      ...item,
      imagem: `./imgens/quadrilhas/${config.pasta}/${config.arquivos[item.nome]}`,
      imagemFallback: item.imagem || ''
    }
    : item;
}

function itemParticipanteQuesito(item, numeroQuesito) {
  const itemComImagem = itemQuesito(item, numeroQuesito);
  const arquivo = (itemComImagem.imagem || '').split('/').pop();
  const foco = arquivo ? {
    ...(focoParticipantesBase[arquivo] || {}),
    ...(focoParticipantesPorQuesito[numeroQuesito]?.[arquivo] || {}),
    ...(getPhotoOverride('participantes', numeroQuesito, arquivo) || {})
  } : null;
  return applyPhotoFocus(itemComImagem, foco);
}

function itemVencedorQuesito(item, numeroQuesito) {
  const itemComImagem = itemQuesito(item, numeroQuesito);
  const arquivo = (itemComImagem.imagem || '').split('/').pop();
  const foco = arquivo ? {
    ...(focoVencedoresPorQuesito[numeroQuesito]?.[arquivo] || {}),
    ...(getPhotoOverride('vencedor', numeroQuesito, arquivo) || {})
  } : null;
  return applyPhotoFocus(itemComImagem, foco);
}

function itemEntradaAcesso2026(item) {
  const arquivo = (item.imagem || '').split('/').pop();
  const foco = arquivo ? getPhotoOverride('entrada-acesso-2026', 'novas-integrantes', arquivo) : null;
  return applyPhotoFocus(item, foco);
}

const nomesQuadrilhasEspecial2025 = [
  'Amor Junino',
  'Arraiá dos Matutos',
  'Arroxa o Nó',
  'Caipirada',
  'Coisas da Roça',
  'Eita Bagaceira',
  'Espalha Brasa',
  'Formiga da Roça',
  'Mala Véia',
  'Pinga em Mim',
  'Rasga o Fole',
  'Ribuliço',
  'Tico Tico no Fubá',
  'Vai Mas Não Vai',
  'Xamegar'
];

const nomesQuadrilhasAcesso2025 = [
  'Chinelo de Couro',
  'Fornalha',
  'Furacão',
  'Matingueiros do Sertão',
  'Matulão',
  'Os Caboclos do Sertão',
  'Sol de Maria',
  'Tengo Lengo',
  'Xém Nhem Nhém',
  'Xique Xique'
];

const quadrilhasEspecial = ordenarPorNome(nomesQuadrilhasEspecial2025.map(quadrilha));
const quadrilhasAcesso = ordenarPorNome(nomesQuadrilhasAcesso2025.map(quadrilha));

const nomesQuadrilhasNovasAcesso2026 = [
  'Arraiá Chapéu de Palha',
  'Paixão Cangaço'
];

const nomesQuadrilhasPromovidas2026 = [
  'Matulão',
  'Chinelo de Couro',
  'Xique Xique'
];

const nomesQuadrilhasRebaixadas2026 = [
  'Espalha Brasa',
  'Coisas da Roça',
  'Tico Tico no Fubá'
];

const temporada2026 = {
  novasIntegrantesAcesso: nomesQuadrilhasNovasAcesso2026.map((nome) => ({
    ...quadrilha(nome),
    fotoPosX: '50%',
    fotoPosY: '50%'
  })),
  promovidasParaEspecial: nomesQuadrilhasPromovidas2026.map(quadrilha),
  rebaixadasParaAcesso: nomesQuadrilhasRebaixadas2026.map(quadrilha),
  acesso: ordenarPorNome([
    ...nomesQuadrilhasAcesso2025.filter((nome) => !nomesQuadrilhasPromovidas2026.includes(nome)),
    ...nomesQuadrilhasRebaixadas2026,
    ...nomesQuadrilhasNovasAcesso2026
  ].map(quadrilha)),
  especial: ordenarPorNome([
    ...nomesQuadrilhasEspecial2025.filter((nome) => !nomesQuadrilhasRebaixadas2026.includes(nome)),
    ...nomesQuadrilhasPromovidas2026
  ].map(quadrilha))
};

const quesitos = [
  {
    nome: 'Melhor\nCoreografia/Harmonia',
    poesia: 'Quando o passo respira junto, a quadrilha vira corpo, desenho e emoção.',
    icon: '💃',
    numero: 1,
    participantes: { acesso: quadrilhasAcesso, especial: quadrilhasEspecial },
    vencedores: {
      acesso: [quadrilha('Chinelo de Couro'), quadrilha('Matulão')],
      especial: [quadrilha('Arroxa o Nó')]
    }
  },
  {
    nome: 'Melhor\nMarcação',
    poesia: 'É a mão que conduz a roda e faz o arraial caber inteiro dentro do compasso.',
    icon: '🎯',
    numero: 2,
    participantes: { acesso: quadrilhasAcesso, especial: quadrilhasEspecial },
    vencedores: {
      acesso: [quadrilha('Matulão')],
      especial: [quadrilha('Ribuliço')]
    }
  },
  {
    nome: 'Melhor Animação\ndos Dançarinos',
    poesia: 'No brilho do corpo e na resposta do público, a festa encontra seu fogo.',
    icon: '✨',
    numero: 3,
    participantes: { acesso: quadrilhasAcesso, especial: quadrilhasEspecial },
    vencedores: {
      acesso: [quadrilha('Chinelo de Couro')],
      especial: [quadrilha('Arroxa o Nó'), quadrilha('Formiga da Roça')]
    }
  },
  {
    nome: 'Melhor\nFigurino',
    poesia: 'Costura, cor e invenção: quando o tecido também conta a história.',
    icon: '👗',
    numero: 4,
    participantes: { acesso: quadrilhasAcesso, especial: quadrilhasEspecial },
    vencedores: {
      acesso: [quadrilha('Matulão')],
      especial: [quadrilha('Arroxa o Nó'), quadrilha('Ribuliço'), quadrilha('Pinga em Mim')]
    }
  },
  {
    nome: 'Melhor Casal\nde Noivos',
    poesia: 'No centro da cena, o romance encontra rito, gesto e presença.',
    icon: '💍',
    numero: 5,
    participantes: { acesso: quadrilhasAcesso, especial: quadrilhasEspecial },
    vencedores: {
      acesso: [quadrilha('Os Caboclos do Sertão')],
      especial: [quadrilha('Formiga da Roça')]
    }
  },
  {
    nome: 'Melhor Trilha\nSonora/Musical',
    poesia: 'A música guia a memória da cena e levanta o coração do arraial.',
    icon: '🎵',
    numero: 6,
    participantes: { acesso: quadrilhasAcesso, especial: quadrilhasEspecial },
    vencedores: {
      acesso: [quadrilha('Matulão')],
      especial: [
        quadrilha('Amor Junino'),
        quadrilha('Arroxa o Nó'),
        quadrilha('Caipirada'),
        quadrilha('Formiga da Roça'),
        quadrilha('Rasga o Fole'),
        quadrilha('Ribuliço'),
        quadrilha('Vai Mas Não Vai'),
        quadrilha('Xamegar')
      ]
    }
  },
  {
    nome: 'Melhor\nTemática/Enredo',
    poesia: 'Toda grande quadrilha deixa no terreiro uma narrativa inteira.',
    icon: '📖',
    numero: 7,
    participantes: { acesso: [], especial: quadrilhasEspecial },
    vencedores: {
      acesso: [],
      especial: [quadrilha('Rasga o Fole')]
    }
  },
  {
    nome: 'Quadrilha\nDisciplina',
    poesia: 'A grandeza também se revela no cuidado, no respeito e na precisão.',
    icon: '⭐',
    numero: 8,
    participantes: { acesso: quadrilhasAcesso, especial: quadrilhasEspecial },
    vencedores: {
      acesso: [quadrilha('Chinelo de Couro')],
      especial: [quadrilha('Formiga da Roça')]
    }
  },
  {
    nome: 'Quadrilha\nRevelação',
    poesia: 'Quando um novo brilho se acende, o movimento inteiro se renova.',
    icon: '🌟',
    numero: 9,
    participantes: { acesso: quadrilhasAcesso, especial: quadrilhasEspecial },
    vencedores: {
      acesso: [quadrilha('Matulão')],
      especial: [quadrilha('Rasga o Fole')]
    }
  },
  {
    nome: 'Quadrilhas\nSimpatia',
    poesia: 'Tem troféu que nasce do afeto, da entrega e do jeito de chegar no povo.',
    icon: '🤩',
    numero: 10,
    participantes: { acesso: quadrilhasAcesso, especial: quadrilhasEspecial },
    vencedores: {
      acesso: [quadrilha('Chinelo de Couro'), quadrilha('Matulão'), quadrilha('Os Caboclos do Sertão')],
      especial: [quadrilha('Caipirada')]
    }
  },
  {
    nome: 'Melhor Equipe\nde Produção',
    poesia: 'Nos bastidores mora a força que sustenta o sonho em cena.',
    icon: '🏗️',
    numero: 11,
    participantes: { acesso: quadrilhasAcesso, especial: quadrilhasEspecial },
    vencedores: {
      acesso: [quadrilha('Chinelo de Couro')],
      especial: [quadrilha('Formiga da Roça')]
    }
  },
  {
    nome: 'Melhor\nEtapa',
    poesia: 'Cada cidade acendeu seu terreiro e fez do circuito uma memória coletiva.',
    icon: '📍',
    numero: 12,
    participantes: {
      acesso: ordenarPorNome([cidade('Paranoá'), cidade('Samambaia'), cidade('Taguatinga')]),
      especial: []
    },
    vencedores: {
      acesso: [cidade('Samambaia'), cidade('Taguatinga')],
      especial: [cidade('Taguatinga')]
    }
  }
];

function criarSlides() {
  const slides = [{ tipo: 'capa' }];
  quesitos.forEach((quesito) => {
    slides.push({ tipo: 'quesito', quesito });
    slides.push({ tipo: 'participantes', quesito });
    slides.push({ tipo: 'suspense', quesito });
    slides.push({ tipo: 'vencedor', quesito });
  });
  slides.push({ tipo: 'resumo-final' });
  slides.push({
    tipo: 'entrada-acesso-2026',
    quadrilhas: temporada2026.novasIntegrantesAcesso
  });
  slides.push({ tipo: 'grupos-fotos-2026' });
  slides.push({ tipo: 'parceiros-liga' });
  slides.push({ tipo: 'agradecimentos' });
  return slides;
}

function quebrarNome(nome) {
  return nome.split('\n');
}

function criarMarkupImagem(item, classe) {
  const fallbackAttr = item.imagemFallback && item.imagemFallback !== item.imagem ? ` data-fallback-src="${item.imagemFallback}"` : '';
  return item.imagem ? `<img src="${item.imagem}" alt="${item.nome}"${fallbackAttr} onerror="if(this.dataset.fallbackSrc){const next=this.dataset.fallbackSrc;this.dataset.fallbackSrc='';this.src=next;return;}this.remove();this.parentElement.classList.add('sem-imagem')">` : '';
}

function estiloFoto(item, fim) {
  const focoX = item.fotoPosX ? `;--foto-pos-x:${item.fotoPosX}` : '';
  const focoY = item.fotoPosY ? `;--foto-pos-y:${item.fotoPosY}` : '';
  const zoom = item.fotoScale ? `;--foto-scale:${item.fotoScale}` : '';
  const zoomX = item.fotoScaleX ? `;--foto-scale-x:${item.fotoScaleX}` : '';
  const zoomY = item.fotoScaleY ? `;--foto-scale-y:${item.fotoScaleY}` : '';
  const fit = item.fotoFit ? `;--foto-fit:${item.fotoFit}` : '';
  return `background:linear-gradient(180deg, ${item.cor}, ${fim})${focoX}${focoY}${zoom}${zoomX}${zoomY}${fit}`;
}

function renderCapa() {
  return `
    <section class="slide slide-capa">
      <div class="capa-selo marca-kicker">&#10024; Cerim&ocirc;nia de Premia&ccedil;&atilde;o &middot; 2025</div>
      <div class="capa-destaque">
        <div class="capa-logo-flutuante capa-logo-flutuante--liga">
          <img class="capa-logo capa-logo--liga" src="./imgens/elementos/linq-dfe.png" alt="Logo da Liga" onerror="this.parentElement.remove()">
        </div>
        <div class="capa-titulo-wrap">
          <h1 class="capa-titulo">Trof&eacute;u <strong>Quadrilheiro</strong></h1>
          <div class="capa-linha"></div>
        </div>
        <div class="capa-logo-flutuante capa-logo-flutuante--trofeu">
          <img class="capa-logo capa-logo--trofeu" src="./imgens/elementos/logo-trofeu.png" alt="Logo do Trof&eacute;u Quadrilheiro" onerror="this.parentElement.remove()">
        </div>
      </div>
      <p class="capa-subtitulo">Uma noite para celebrar quem fez o circuito pulsar</p>
      <div class="capa-temporada">Liga Independente de Quadrilhas Juninas &middot; DF e Entorno</div>
      <div class="capa-pressione">Pressione Enter para come&ccedil;ar</div>
    </section>
  `;
}
function renderMarcasLaterais() {
  return `
      <div class="slide-marcas" aria-hidden="true">
        <div class="slide-marca slide-marca--liga">
          <img src="./imgens/elementos/linq-dfe.png" alt="" onerror="this.parentElement.remove()">
        </div>
        <div class="slide-marca slide-marca--trofeu">
          <img src="./imgens/elementos/logo-trofeu.png" alt="" onerror="this.parentElement.remove()">
        </div>
      </div>
  `;
}

function renderAberturaQuesito(q) {
  const linhas = quebrarNome(q.nome);
  return `
    <section class="slide slide-quesito">
      ${renderMarcasLaterais()}
      <div class="agradecimentos-poeira" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="quesito-numero">Quesito ${q.numero} de ${quesitos.length}</div>
      <div class="quesito-faixa"><span>${q.icon}</span><strong>Agora é hora de conhecer</strong></div>
      <h2 class="quesito-titulo">${linhas[0]}${linhas[1] ? `<span>${linhas[1]}</span>` : ''}</h2>
    </section>
  `;
}

function renderCardParticipante(item, delay = 0) {
  return `
    <article class="indicado-card" style="animation-delay:${delay}s">
      <div class="indicado-foto" style="${estiloFoto(item, '#120907')}" data-iniciais="${item.iniciais}">
        ${criarMarkupImagem(item, 'indicado')}
        <div class="indicado-sigla">${item.iniciais}</div>
        <div class="indicado-nome">${item.nome}</div>
      </div>
    </article>
  `;
}

function renderRodapeParticipantes(linhas) {
  return `
    <div class="indicados-rodape">
      <div class="indicados-kicker indicados-kicker-rodape">Na disputa desta noite</div>
      <div class="indicados-titulo indicados-titulo-rodape">${linhas.join(' ')}</div>
    </div>
  `;
}

function renderParticipantes(q) {
  const linhas = quebrarNome(q.nome);

  if (q.numero === 12) {
    const cardsEtapa = q.participantes.acesso.map((cidadeItem, index) => `
      <article class="etapa-cidade-card" style="animation-delay:${0.08 + index * 0.08}s">
        <div class="etapa-cidade-kicker">Cidade finalista</div>
        <div class="etapa-cidade-foto" style="background:linear-gradient(180deg, ${cidadeItem.cor}, #120907)" data-iniciais="${cidadeItem.iniciais}">
          ${criarMarkupImagem(cidadeItem, 'cidade')}
          <div class="etapa-cidade-nome">${cidadeItem.nome}</div>
        </div>
        <div class="etapa-cidade-sub">Etapa do circuito</div>
      </article>
    `).join('');

    return `
      <section class="slide slide-indicados">
        ${renderMarcasLaterais()}
        <div class="indicados-conteudo">
          <div class="etapa-slide-body">
            <div class="etapa-cidades-grid">${cardsEtapa}</div>
          </div>
        </div>
        ${renderRodapeParticipantes(linhas)}
      </section>
    `;
  }

  const acesso = q.participantes.acesso || [];
  const especial = q.participantes.especial || [];
  const cardsAcesso = acesso
    .map((item) => itemParticipanteQuesito(item, q.numero))
    .map((item, index) => renderCardParticipante(item, 0.06 + index * 0.04))
    .join('');
  const cardsEspecial = especial
    .map((item) => itemParticipanteQuesito(item, q.numero))
    .map((item, index) => renderCardParticipante(item, 0.06 + index * 0.04))
    .join('');
  const grupos = [];

  if (acesso.length) {
    grupos.push(`
            <div class="grupo-coluna grupo-acesso">
              <div class="grupo-tag">Grupo de Acesso · ${acesso.length} quadrilhas</div>
              <div class="cards-grid">${cardsAcesso}</div>
            </div>
    `);
  }

  if (especial.length) {
    grupos.push(`
            <div class="grupo-coluna grupo-especial">
              <div class="grupo-tag">Grupo Especial · ${especial.length} quadrilhas</div>
              <div class="cards-grid">${cardsEspecial}</div>
            </div>
    `);
  }

  return `
    <section class="slide slide-indicados">
      ${renderMarcasLaterais()}
      <div class="indicados-conteudo">
        <div class="grupos-grid">
          ${acesso.length ? `
            <div class="grupo-coluna grupo-acesso">
              <div class="grupo-tag">Grupo de Acesso · ${acesso.length} quadrilhas</div>
              <div class="cards-grid">${cardsAcesso}</div>
            </div>
          ` : '<div></div>'}
          ${especial.length ? `
            <div class="grupo-coluna grupo-especial">
              <div class="grupo-tag">Grupo Especial · ${especial.length} quadrilhas</div>
              <div class="cards-grid">${cardsEspecial}</div>
            </div>
          ` : '<div></div>'}
        </div>
      </div>
      ${renderRodapeParticipantes(linhas)}
    </section>
  `;
}

function renderSuspense(q) {
  const linhas = quebrarNome(q.nome);
  return `
    <section class="slide slide-suspense">
      ${renderMarcasLaterais()}
      <div class="suspense-kicker">Chegou a hora de conhecer</div>
      <div class="suspense-frase">E os vencedores de</div>
      <div class="suspense-quesito-faixa">${q.icon} ${linhas.join(' ')}</div>
      <div class="suspense-final">são...</div>
    </section>
  `;
}

function renderCardVencedor(item, delay = 0) {
  return `
    <article class="vencedor-card" style="animation-delay:${delay}s">
      <div class="vencedor-foto" style="${estiloFoto(item, '#140907')}" data-iniciais="${item.iniciais}">
        ${criarMarkupImagem(item, 'vencedor')}
        <div class="vencedor-sigla">${item.iniciais}</div>
        <div class="vencedor-nome">${item.nome}</div>
      </div>
      <div class="vencedor-footer">
        <span class="selo-vencedor">Vencedor</span>
      </div>
    </article>
  `;
}

function gradeVencedores(total) {
  if (total <= 1) return { colunas: 1, linhas: 1 };
  if (total === 2) return { colunas: 2, linhas: 1 };
  if (total === 3) return { colunas: 3, linhas: 1 };
  if (total === 4) return { colunas: 2, linhas: 2 };
  if (total <= 6) return { colunas: 3, linhas: 2 };
  return { colunas: 4, linhas: 2 };
}

function densidadeVencedores(q) {
  const totais = [q.vencedores.acesso.length, q.vencedores.especial.length].filter(Boolean);
  const maior = totais.length ? Math.max(...totais) : 0;
  if (maior >= 7) return 4;
  if (maior >= 4) return 3;
  if (maior >= 2) return 2;
  return 1;
}

function renderColunaVencedor(titulo, classe, itens, numeroQuesito) {
  if (!itens || !itens.length) return '<div></div>';
  const grade = gradeVencedores(itens.length);
  const cards = itens
    .map((item) => itemVencedorQuesito(item, numeroQuesito))
    .map((item, index) => renderCardVencedor(item, 0.08 + index * 0.08))
    .join('');
  return `
    <div class="vencedor-coluna ${classe}" data-cols="${grade.colunas}" data-rows="${grade.linhas}" data-total="${itens.length}" style="--vencedor-cols:${grade.colunas};--vencedor-rows:${grade.linhas}">
      <div class="grupo-tag">${titulo}</div>
      <div class="vencedor-lista">${cards}</div>
    </div>
  `;
}

function renderVencedor(q) {
  const linhas = quebrarNome(q.nome);
  const densidade = densidadeVencedores(q);
  const grupos = [
    q.vencedores.acesso.length ? renderColunaVencedor('Grupo de Acesso', 'grupo-acesso', q.vencedores.acesso, q.numero) : '',
    q.vencedores.especial.length ? renderColunaVencedor('Grupo Especial', 'grupo-especial', q.vencedores.especial, q.numero) : ''
  ].filter(Boolean);
  return `
    <section class="slide slide-vencedor slide-vencedor--densidade-${densidade}" data-density="${densidade}" data-grupos="${grupos.length}" data-confetti="true">
      ${renderMarcasLaterais()}
      <div class="vencedor-header">
        <div class="vencedor-kicker">O troféu vai para</div>
        <h2 class="vencedor-titulo">${q.icon} ${linhas.join(' ')}</h2>
      </div>
      <div class="vencedor-grupos">${grupos.join('')}</div>
    </section>
  `;
}

function nomesVencedores(itens) {
  return itens.map((item) => item.nome).join(' • ');
}

function renderLinhaPalmares(rotulo, classe, itens) {
  if (!itens || !itens.length) return '';
  return `
    <div class="palmares-linha">
      <span class="palmares-grupo ${classe}">${rotulo}</span>
      <p>${nomesVencedores(itens)}</p>
    </div>
  `;
}

function renderCardPalmares(q) {
  const linhas = quebrarNome(q.nome);
  return `
    <article class="palmares-card">
      <div class="palmares-card-topo">
        <div class="palmares-ordem">Q${q.numero}</div>
        <h3>${q.icon} ${linhas.join(' ')}</h3>
      </div>
      <div class="palmares-card-corpo">
        ${renderLinhaPalmares('Acesso', 'grupo-acesso', q.vencedores.acesso)}
        ${renderLinhaPalmares('Especial', 'grupo-especial', q.vencedores.especial)}
      </div>
    </article>
  `;
}

function renderResumoFinal() {
  return `
    <section class="slide slide-palmares">
      ${renderMarcasLaterais()}
      <div class="palmares-header">
        <div class="palmares-kicker">Encerramento da premiação</div>
        <h2 class="palmares-titulo">🏆 Vencedores do Troféu Quadrilheiro 2025</h2>
        <p class="palmares-subtitulo">Todos os vencedores da noite, reunidos em uma última tela.</p>
      </div>
      <div class="palmares-grid">
        ${quesitos.map((quesito) => renderCardPalmares(quesito)).join('')}
      </div>
    </section>
  `;
}

function renderParceirosLiga() {
  return `
    <section class="slide slide-parceiros-liga">
      ${renderMarcasLaterais()}
      <div class="agradecimentos-poeira" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="parceiros-palco">
        <div class="capa-logo-flutuante capa-logo-flutuante--liga agradecimentos-logo agradecimentos-logo--liga parceiros-logo parceiros-logo--liga">
          <img class="capa-logo capa-logo--liga" src="./imgens/elementos/linq-dfe.png" alt="Logo da Liga" onerror="this.parentElement.remove()">
        </div>
        <div class="parceiros-conteudo">
          <div class="parceiros-kicker">AGRADECIMENTO ESPECIAL</div>
          <h2 class="parceiros-titulo">Homenagem aos parceiros da Liga</h2>
          <div class="parceiros-grid parceiros-grid--generico">
            <article class="parceiros-card parceiros-card--manifesto parceiros-card--single">
              <div class="parceiros-card-texto parceiros-card-texto--manifesto parceiros-card-texto--single">
                <div class="parceiros-card-nome">Nosso reconhecimento a quem acredita, apoia e soma for&ccedil;as com a Liga ao longo da temporada.</div>
              </div>
            </article>
          </div>
        </div>
        <div class="capa-logo-flutuante capa-logo-flutuante--trofeu agradecimentos-logo agradecimentos-logo--trofeu parceiros-logo parceiros-logo--trofeu">
          <img class="capa-logo capa-logo--trofeu" src="./imgens/elementos/logo-trofeu.png" alt="Logo do Trof&eacute;u Quadrilheiro" onerror="this.parentElement.remove()">
        </div>
      </div>
    </section>
  `;
}
function renderAgradecimentos() {
  return `
    <section class="slide slide-agradecimentos">
      <div class="agradecimentos-poeira" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="agradecimentos-palco">
        <div class="capa-logo-flutuante capa-logo-flutuante--liga agradecimentos-logo agradecimentos-logo--liga">
          <img class="capa-logo capa-logo--liga" src="./imgens/elementos/linq-dfe.png" alt="Logo da Liga" onerror="this.parentElement.remove()">
        </div>
        <div class="agradecimentos-conteudo">
          <div class="agradecimentos-kicker">ENCERRAMENTO DO TROF&Eacute;U QUADRILHEIRO 2025</div>
          <div class="agradecimentos-titulo">Obrigado!</div>
          <p class="agradecimentos-subtitulo">Voc&ecirc;s fazem o circuito pulsar.</p>
          <div class="agradecimentos-assinatura">
            <span>Esse &eacute; o S&atilde;o Jo&atilde;o da Liga. E a Liga n&atilde;o Para!</span>
          </div>
        </div>
        <div class="capa-logo-flutuante capa-logo-flutuante--trofeu agradecimentos-logo agradecimentos-logo--trofeu">
          <img class="capa-logo capa-logo--trofeu" src="./imgens/elementos/logo-trofeu.png" alt="Logo do Trof&eacute;u Quadrilheiro" onerror="this.parentElement.remove()">
        </div>
      </div>
    </section>
  `;
}

function renderCardEntradaAcesso2026(item, delay = 0) {
  const destaque = itemEntradaAcesso2026(item);
  return `
    <article class="entrada-2026-card" style="animation-delay:${delay}s">
      <div class="entrada-2026-card-kicker">Nova integrante</div>
      <div class="entrada-2026-foto" style="${estiloFoto(destaque, '#140907')}" data-iniciais="${destaque.iniciais}">
        ${criarMarkupImagem(destaque, 'entrada-2026')}
        <div class="entrada-2026-nome">${destaque.nome}</div>
      </div>
      <div class="entrada-2026-meta">Grupo de Acesso · Temporada 2026</div>
    </article>
  `;
}

function renderEntradaAcesso2026(slide) {
  return `
    <section class="slide slide-entrada-2026" data-confetti="true">
      ${renderMarcasLaterais()}
      <div class="entrada-2026-header">
        <div class="entrada-2026-kicker">26º Circuito de Quadrilhas Juninas do DF e Entorno</div>
        <h2 class="entrada-2026-titulo">Duas novas quadrilhas entram no Grupo de Acesso em 2026</h2>
        <p class="entrada-2026-subtitulo">Arraiá Chapéu de Palha e Paixão Cangaço passam a integrar a próxima temporada do circuito.</p>
      </div>
      <div class="entrada-2026-grid">
        ${slide.quadrilhas.map((item, index) => renderCardEntradaAcesso2026(item, 0.1 + index * 0.1)).join('')}
      </div>
    </section>
  `;
}

function renderLogoQuadrilha2026(item) {
  return item.logo
    ? `<img src="${item.logo}" alt="Logo da quadrilha ${item.nome}" onerror="this.remove();this.parentElement.classList.add('sem-logo')">`
    : '';
}

function dividirListaGrupo2026(itens, totalColunas = 2) {
  const colunas = [];
  let inicio = 0;
  for (let indice = 0; indice < totalColunas; indice += 1) {
    const restante = itens.length - inicio;
    const colunasRestantes = totalColunas - indice;
    const tamanho = Math.ceil(restante / colunasRestantes);
    colunas.push(itens.slice(inicio, inicio + tamanho));
    inicio += tamanho;
  }
  return colunas.filter((coluna) => coluna.length);
}

function renderLinhaGrupo2026(item) {
  return `
    <li class="grupo-2026-item" data-iniciais="${item.iniciais}">
      <div class="grupo-2026-logo-wrap" data-iniciais="${item.iniciais}">
        ${renderLogoQuadrilha2026(item)}
      </div>
      <div class="grupo-2026-nome">${item.nome}</div>
    </li>
  `;
}

function renderGrupoTemporada2026(titulo, classe, itens) {
  const colunas = dividirListaGrupo2026(itens);
  return `
    <article class="grupo-2026-card ${classe}">
      <div class="grupo-2026-card-topo">
        <div class="grupo-tag">${titulo}</div>
        <div class="grupo-2026-total">${itens.length} quadrilhas</div>
      </div>
      <div class="grupo-2026-colunas" data-colunas="${colunas.length}">
        ${colunas.map((coluna) => `
          <ul class="grupo-2026-lista" style="--grupo-itens:${coluna.length}">
            ${coluna.map((item) => renderLinhaGrupo2026(item)).join('')}
          </ul>
        `).join('')}
      </div>
    </article>
  `;
}

function renderGruposFotos2026() {
  const acesso = temporada2026.acesso.map(item => itemParticipanteQuesito(item, 13));
  const especial = temporada2026.especial.map(item => itemParticipanteQuesito(item, 13));

  const cardsAcesso = acesso.map((item, index) => renderCardParticipante(item, 0.06 + index * 0.04)).join('');
  const cardsEspecial = especial.map((item, index) => renderCardParticipante(item, 0.06 + index * 0.04)).join('');

  return `
    <section class="slide slide-grupos-fotos">
      ${renderMarcasLaterais()}
      <div class="indicados-conteudo">
        <div class="grupos-grid">
          <div class="grupo-coluna grupo-acesso">
            <div class="grupo-tag">Grupo de Acesso · ${temporada2026.acesso.length} quadrilhas</div>
            <div class="cards-grid">${cardsAcesso}</div>
          </div>
          <div class="grupo-coluna grupo-especial">
            <div class="grupo-tag">Grupo Especial · ${temporada2026.especial.length} quadrilhas</div>
            <div class="cards-grid">${cardsEspecial}</div>
          </div>
        </div>
      </div>
      <div class="indicados-rodape">
        <div class="indicados-kicker indicados-kicker-rodape">26º Circuito de Quadrilhas Juninas · DF e Entorno</div>
        <div class="indicados-titulo indicados-titulo-rodape">Grupos definidos para 2026</div>
      </div>
    </section>
  `;
}

const slides = criarSlides();
let currentIndex = 0;
let confettiActive = false;
const SCREEN_RATIO_8X3 = 8 / 3;
const BLOCKED_TOP_RATIO_8X3 = 50 / 300;
const SCREEN_RATIO_TOLERANCE = 0.04;

const container = document.getElementById('presentation');
const counter = document.getElementById('slide-counter');
const stage = document.getElementById('stage');
const soundtrack = document.getElementById('presentation-audio');
const operatorPreviewMode = new URLSearchParams(window.location.search).has('operator-preview');
const SOUNDTRACK_VOLUME = 0.72;
let soundtrackEnabled = !operatorPreviewMode;

if (operatorPreviewMode) {
  document.body.classList.add('preview-embedded');
}

operatorConfig = getOperatorConfig();

async function tryPlaySoundtrack() {
  if (!soundtrack || operatorPreviewMode || !soundtrackEnabled) {
    return false;
  }

  soundtrack.volume = SOUNDTRACK_VOLUME;
  soundtrack.loop = true;

  try {
    await soundtrack.play();
    return true;
  } catch (_) {
    return false;
  }
}

function pauseSoundtrack() {
  if (!soundtrack) return;
  soundtrack.pause();
}

function parseRatio(value) {
  if (!value || value === 'auto') return null;
  const [w, h] = String(value).split(':').map(Number);
  if (!w || !h) return null;
  return { w, h };
}

function shouldReserveTopBlock(stageWidth, stageHeight, selectedRatio) {
  if (selectedRatio?.w === 8 && selectedRatio?.h === 3) {
    return true;
  }

  if (!stageWidth || !stageHeight) {
    return false;
  }

  const currentRatio = stageWidth / stageHeight;
  return Math.abs(currentRatio - SCREEN_RATIO_8X3) <= SCREEN_RATIO_TOLERANCE;
}

function applyStageConfig() {
  const config = getOperatorConfig();
  const ratio = parseRatio(config.stage.ratio);
  const baseWidth = window.innerWidth * (config.stage.width / 100);
  const baseHeight = window.innerHeight * (config.stage.height / 100);

  let width = baseWidth;
  let height = baseHeight;

  if (ratio) {
    width = Math.min(baseWidth, baseHeight * (ratio.w / ratio.h));
    height = Math.min(baseHeight, baseWidth * (ratio.h / ratio.w));
  }

  stage.style.width = `${width}px`;
  stage.style.height = `${height}px`;

  const blockedTopPercent = shouldReserveTopBlock(width, height, ratio)
    ? BLOCKED_TOP_RATIO_8X3 * 100
    : 0;

  stage.style.setProperty('--blocked-top', `${blockedTopPercent}%`);
  stage.toggleAttribute('data-top-blocked', blockedTopPercent > 0);
}

function normalizePercent(value, fallback = 50) {
  if (value === undefined || value === null || value === '') return fallback;
  return Number(String(value).replace('%', ''));
}

function normalizeScaleValue(value, fallback = 1) {
  if (value === undefined || value === null || value === '') return fallback;
  return Number(value);
}

function getSlideTitle(slide) {
  if (slide.tipo === 'capa') return 'Capa';
  if (slide.tipo === 'resumo-final') return 'Vencedores do Troféu 2025';
  if (slide.tipo === 'entrada-acesso-2026') return 'Novas quadrilhas · Acesso 2026';
  if (slide.tipo === 'grupos-fotos-2026') return 'Grupos de 2026';
  if (slide.tipo === 'parceiros-liga') return 'Parceiros da Liga';
  if (slide.tipo === 'agradecimentos') return 'Agradecimentos';
  if (!slide.quesito) return slide.tipo;
  const nome = slide.quesito.nome.replace(/\n/g, ' ');
  switch (slide.tipo) {
    case 'quesito':
      return `${nome} · Abertura`;
    case 'participantes':
      return `${nome} · Participantes`;
    case 'suspense':
      return `${nome} · Suspense`;
    case 'vencedor':
      return `${nome} · Vencedor`;
    default:
      return nome;
  }
}

function makePhotoControlItem(slideType, numeroQuesito, grupo, item) {
  const arquivo = (item.imagem || '').split('/').pop();
  if (!arquivo) return null;
  return {
    key: makePhotoOverrideKey(slideType, numeroQuesito, arquivo),
    arquivo,
    nome: item.nome,
    grupo,
    slideType,
    quesito: numeroQuesito,
    x: normalizePercent(item.fotoPosX, 50),
    y: normalizePercent(item.fotoPosY, 24),
    scaleX: Math.round(normalizeScaleValue(item.fotoScaleX, item.fotoScale || 1) * 100),
    scaleY: Math.round(normalizeScaleValue(item.fotoScaleY, item.fotoScale || 1) * 100),
    fit: item.fotoFit || 'cover'
  };
}

function getSlidePhotoControls(index = currentIndex) {
  const slide = slides[index];
  if (!slide) return [];

  if (slide.tipo === 'entrada-acesso-2026') {
    return (slide.quadrilhas || [])
      .map((item) => itemEntradaAcesso2026(item))
      .map((item) => makePhotoControlItem('entrada-acesso-2026', 'novas-integrantes', 'Acesso 2026', item))
      .filter(Boolean);
  }

  if (!slide.quesito) return [];
  const numeroQuesito = slide.quesito.numero;

  if (slide.tipo === 'participantes') {
    const acesso = (slide.quesito.participantes.acesso || [])
      .map((item) => itemParticipanteQuesito(item, numeroQuesito))
      .map((item) => makePhotoControlItem('participantes', numeroQuesito, 'Acesso', item))
      .filter(Boolean);
    const especial = (slide.quesito.participantes.especial || [])
      .map((item) => itemParticipanteQuesito(item, numeroQuesito))
      .map((item) => makePhotoControlItem('participantes', numeroQuesito, 'Especial', item))
      .filter(Boolean);
    return [...acesso, ...especial];
  }

  if (slide.tipo === 'vencedor') {
    const acesso = (slide.quesito.vencedores.acesso || [])
      .map((item) => itemVencedorQuesito(item, numeroQuesito))
      .map((item) => makePhotoControlItem('vencedor', numeroQuesito, 'Acesso', item))
      .filter(Boolean);
    const especial = (slide.quesito.vencedores.especial || [])
      .map((item) => itemVencedorQuesito(item, numeroQuesito))
      .map((item) => makePhotoControlItem('vencedor', numeroQuesito, 'Especial', item))
      .filter(Boolean);
    return [...acesso, ...especial];
  }

  return [];
}

function getSlidesMeta() {
  return slides.map((slide, index) => ({
    index,
    tipo: slide.tipo,
    quesitoNumero: slide.quesito?.numero || null,
    quesitoNome: slide.quesito?.nome?.replace(/\n/g, ' ') || null,
    title: getSlideTitle(slide)
  }));
}

function applyOperatorConfig(options = {}) {
  operatorConfig = readOperatorConfig();
  applyStageConfig();
  initStars();
  if (options.rerender) {
    goTo(currentIndex);
  }
}

window.TrofeuPresentationAPI = {
  getSlidesMeta,
  getCurrentIndex: () => currentIndex,
  getCurrentSlidePhotos: () => getSlidePhotoControls(currentIndex),
  getSlidePhotoControls,
  getConfig: () => cloneData(getOperatorConfig()),
  applyConfig(nextConfig) {
    saveOperatorConfig(nextConfig);
    applyOperatorConfig({ rerender: true });
    return cloneData(getOperatorConfig());
  },
  refreshConfig() {
    applyOperatorConfig({ rerender: true });
  },
  goTo,
  next() {
    goTo(currentIndex + 1);
  },
  prev() {
    goTo(currentIndex - 1);
  }
};

function renderSlide(item) {
  switch (item.tipo) {
    case 'capa':
      return renderCapa();
    case 'quesito':
      return renderAberturaQuesito(item.quesito);
    case 'participantes':
      return renderParticipantes(item.quesito);
    case 'suspense':
      return renderSuspense(item.quesito);
    case 'vencedor':
      return renderVencedor(item.quesito);
    case 'resumo-final':
      return renderResumoFinal();
    case 'entrada-acesso-2026':
      return renderEntradaAcesso2026(item);
    case 'grupos-fotos-2026':
      return renderGruposFotos2026();
    case 'parceiros-liga':
      return renderParceirosLiga();
    case 'agradecimentos':
      return renderAgradecimentos();
    default:
      return '<section class="slide"></section>';
  }
}

function goTo(index) {
  if (index < 0 || index >= slides.length) return;

  void tryPlaySoundtrack();
  stopConfetti();

  const anterior = container.querySelector('.slide.active');
  if (anterior) {
    anterior.classList.remove('active');
    anterior.classList.add('exit');
    setTimeout(() => anterior.remove(), 650);
  }

  currentIndex = index;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderSlide(slides[currentIndex]).trim();
  const novoSlide = wrapper.firstElementChild;
  container.appendChild(novoSlide);

  requestAnimationFrame(() => novoSlide.classList.add('active'));
  counter.textContent = `${currentIndex + 1} / ${slides.length}`;
  window.dispatchEvent(new CustomEvent('trofeu:slidechange', {
    detail: {
      index: currentIndex,
      slide: slides[currentIndex],
      photos: getSlidePhotoControls(currentIndex)
    }
  }));

  if (novoSlide.dataset.confetti === 'true') {
    setTimeout(startConfetti, 350);
    setTimeout(stopConfetti, 5000);
  }
}

document.getElementById('btn-next').addEventListener('click', () => {
  goTo(currentIndex + 1);
});
document.getElementById('btn-prev').addEventListener('click', () => {
  goTo(currentIndex - 1);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight' || event.key === ' ' || event.key === 'Enter') {
    goTo(currentIndex + 1);
  }
  if (event.key === 'ArrowLeft') {
    goTo(currentIndex - 1);
  }
});

document.addEventListener('pointerdown', () => {
  void tryPlaySoundtrack();
}, { passive: true });

const starsCanvas = document.getElementById('stars-canvas');
const starsCtx = starsCanvas.getContext('2d');
const stars = [];

function initStars() {
  starsCanvas.width = stage.offsetWidth;
  starsCanvas.height = stage.offsetHeight;
  stars.length = 0;
  for (let i = 0; i < 180; i += 1) {
    stars.push({
      x: Math.random() * starsCanvas.width,
      y: Math.random() * starsCanvas.height,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.014 + 0.004
    });
  }
}

function animateStars() {
  starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
  stars.forEach((star) => {
    star.a += star.speed;
    const alpha = 0.18 + ((Math.sin(star.a) + 1) / 2) * 0.65;
    starsCtx.beginPath();
    starsCtx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    starsCtx.fillStyle = `rgba(255, 244, 214, ${alpha})`;
    starsCtx.fill();
  });
  requestAnimationFrame(animateStars);
}

applyStageConfig();
initStars();
animateStars();
window.addEventListener('resize', () => {
  applyStageConfig();
  initStars();
});
window.addEventListener('storage', (event) => {
  if (event.key === OPERATOR_STORAGE_KEY) {
    applyOperatorConfig({ rerender: true });
  }
});

(function montarBandeirolas() {
  const cont = document.getElementById('bandeirolas-container');
  const cores = ['#e74c3c', '#f5c55a', '#3f8a3f', '#9b59b6', '#e67e22', '#2980b9'];
  const largura = stage.offsetWidth + 120;
  const espacamento = 40;
  const total = Math.ceil(largura / espacamento) + 2;
  for (let i = 0; i < total; i += 1) {
    const item = document.createElement('div');
    item.className = 'bandeirola';
    item.style.left = `${i * espacamento - 30}px`;
    item.style.background = cores[i % cores.length];
    item.style.animationDelay = `${i * 0.12}s`;
    item.style.animationDuration = `${2.4 + (i % 3) * 0.55}s`;
    cont.appendChild(item);
  }
}());

const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas.getContext('2d');
let confetti = [];
let confettiRaf = null;

function startConfetti() {
  confettiCanvas.width = stage.offsetWidth;
  confettiCanvas.height = stage.offsetHeight;
  confetti = [];
  confettiActive = true;
  const colors = ['#f5c55a', '#e74c3c', '#3f8a3f', '#9b59b6', '#ffffff', '#ffa6c8'];
  for (let i = 0; i < 170; i += 1) {
    confetti.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * 220,
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * 4 + 2,
      size: Math.random() * 9 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 12,
      shape: Math.random() > 0.45 ? 'rect' : 'circle'
    });
  }
  if (confettiRaf) cancelAnimationFrame(confettiRaf);
  animateConfetti();
}

function animateConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confetti.forEach((piece) => {
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.vy += 0.07;
    piece.rot += piece.rotV;
    confettiCtx.save();
    confettiCtx.translate(piece.x, piece.y);
    confettiCtx.rotate((piece.rot * Math.PI) / 180);
    confettiCtx.fillStyle = piece.color;
    if (piece.shape === 'rect') {
      confettiCtx.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2);
    } else {
      confettiCtx.beginPath();
      confettiCtx.arc(0, 0, piece.size / 2, 0, Math.PI * 2);
      confettiCtx.fill();
    }
    confettiCtx.restore();
  });

  confetti = confetti.filter((piece) => piece.y < confettiCanvas.height + 20);
  if (confettiActive || confetti.length) {
    confettiRaf = requestAnimationFrame(animateConfetti);
  }
}

function stopConfetti() {
  confettiActive = false;
  setTimeout(() => {
    if (confettiRaf) cancelAnimationFrame(confettiRaf);
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }, 2800);
}

setTimeout(() => {
  const hint = document.getElementById('hint');
  if (hint) hint.style.opacity = '0';
}, 5000);

goTo(0);

