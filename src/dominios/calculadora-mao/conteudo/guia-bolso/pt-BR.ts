import type { ConteudoGuiaBolso } from './tipos'

const IPPATSU = 'Vencer dentro da primeira volta após o Riichi, sem chamadas no meio.'

export const conteudo: ConteudoGuiaBolso = {
  categorias: {
    sequencias: 'Baseados em sequências',
    'terminais-honras': 'Baseados em terminais / honras',
    'trincas-pares': 'Baseados em pares / trincas / quads',
    naipes: 'Baseados em naipes',
    outros: 'Outros yakus',
  },

  yakus: {
    iipeikou: {
      nome: 'Sequência dupla pura',
      descricao: 'Duas sequências idênticas no mesmo naipe. Só mão fechada.',
    },
    ryanpeikou: {
      nome: 'Duas sequências duplas puras',
      descricao: 'Dois Iipeikou na mesma mão. Só mão fechada. Não acumula com Chiitoitsu.',
    },
    pinfu: {
      nome: 'Mão sem fu',
      descricao:
        '4 sequências + par que não seja de dragão, do vento da rodada nem do vento do seu assento, vencendo com espera ryanmen. Par dos outros ventos pode. Só mão fechada.',
    },
    'sanshoku-doujun': {
      nome: 'Três sequências coloridas',
      descricao: 'A mesma sequência nos três naipes (ex.: 234 de Man, Pin e Sou).',
    },
    ittsuu: { nome: 'Reta pura', descricao: '123, 456 e 789 do mesmo naipe.' },
    tanyao: {
      nome: 'Tudo simples',
      descricao:
        'Apenas pedras de 2 a 8. Sem terminais e sem honras. Vale aberta pela EMA (kuitan).',
    },
    yakuhai: {
      nome: 'Trinca de valor',
      descricao:
        'Trinca ou quad de dragão, do vento da rodada (bakaze) ou do vento do seu assento (jikaze). 1 han por trinca. Vento duplo vale 2.',
    },
    shousangen: {
      nome: 'Três dragões pequenos',
      descricao: 'Duas trincas de dragão + par do terceiro dragão (soma também os Yakuhai).',
    },
    daisangen: { nome: 'Três dragões grandes', descricao: 'Trincas dos três dragões.' },
    shousuushii: {
      nome: 'Quatro ventos pequenos',
      descricao: 'Três trincas de vento + par do quarto vento.',
    },
    daisuushii: { nome: 'Quatro ventos grandes', descricao: 'Trincas dos quatro ventos.' },
    chanta: {
      nome: 'Terminais e honras em tudo',
      descricao:
        'Todo grupo e o par contêm um terminal ou uma honra. Precisa ter pelo menos uma sequência.',
    },
    junchan: {
      nome: 'Terminais em tudo',
      descricao: 'Todo grupo e o par contêm um terminal. Sem honras.',
    },
    honroutou: {
      nome: 'Terminais e honras',
      descricao: 'Só terminais e honras (sempre combina com Toitoi ou Chiitoitsu).',
    },
    chinroutou: { nome: 'Só terminais', descricao: 'Mão formada apenas por 1s e 9s.' },
    tsuuiisou: { nome: 'Só honras', descricao: 'Mão formada apenas por ventos e dragões.' },
    kokushi: {
      nome: 'Treze órfãos',
      descricao: 'Um de cada terminal e honra (13 pedras) + uma repetida. Só fechada.',
    },
    chiitoitsu: {
      nome: 'Sete pares',
      descricao:
        'Exatamente 7 pares, só vale se a mão estiver fechada. Vale lembrar que dois pares iguais não contam.',
      dica: 'Vale tentar quando a mão inicial já tem 4 pares. O ideal é começar com 5. Dependendo da mão, pode ser melhor ir para Toitoi.',
    },
    toitoi: { nome: 'Todas trincas', descricao: '4 trincas (ou quads) + 1 par.' },
    sanankou: {
      nome: 'Três trincas ocultas',
      descricao: 'Três trincas formadas sem chamar pedras (o resto da mão pode ser aberto).',
    },
    suuankou: {
      nome: 'Quatro trincas ocultas',
      descricao: 'Quatro trincas formadas sem chamar pedras. Só fechada.',
    },
    'sanshoku-doukou': {
      nome: 'Três trincas coloridas',
      descricao: 'A mesma trinca numérica nos três naipes.',
    },
    sankantsu: { nome: 'Três quads', descricao: 'Três quads, abertos ou fechados.' },
    suukantsu: { nome: 'Quatro quads', descricao: 'Quatro quads.' },
    honitsu: { nome: 'Meio flush', descricao: 'Um único naipe misturado com honras.' },
    chinitsu: { nome: 'Flush completo', descricao: 'Um único naipe, sem honras.' },
    ryuuiisou: {
      nome: 'Tudo verde',
      descricao: 'Apenas 2, 3, 4, 6, 8 de Sou e Dragão Verde.',
    },
    chuuren: {
      nome: 'Nove portões',
      descricao: '1112345678999 de um naipe + qualquer pedra do mesmo naipe. Só fechada.',
    },
    riichi: {
      nome: 'Declarar pronto',
      descricao:
        'Declare em tenpai com a mão fechada, apostando 1.000 pontos. Habilita Ippatsu e Ura-dora.',
    },
    'double-riichi': {
      nome: 'Riichi duplo',
      descricao: 'Riichi declarado no primeiro descarte, sem chamadas antes.',
      apelidos: ['riichi duplo'],
    },
    ippatsu: { nome: 'Ippatsu', descricao: IPPATSU },
    'menzen-tsumo': {
      nome: 'Tsumo fechado',
      descricao: 'Vencer por compra própria (tsumo) com a mão totalmente fechada.',
    },
    haitei: { nome: 'Debaixo do mar', descricao: 'Vencer por tsumo com a última pedra do muro.' },
    houtei: { nome: 'Debaixo do rio', descricao: 'Vencer com o último descarte da mão.' },
    rinshan: {
      nome: 'Flor no topo da montanha',
      descricao: 'Vencer com a pedra de reposição após declarar um kan.',
    },
    chankan: {
      nome: 'Roubando o kan',
      descricao:
        'Vencer com a pedra que outro jogador adiciona a um pon para formar kan. Kan fechado só pode ser roubado para Kokushi.',
    },
    tenhou: { nome: 'Mão celestial', descricao: 'O dealer vence com a mão inicial.' },
    chiihou: {
      nome: 'Mão terrestre',
      descricao: 'Não-dealer vence por tsumo na primeira compra, sem chamadas antes.',
    },
    renhou: {
      nome: 'Mão humana',
      descricao:
        'Vencer por ron antes da sua primeira compra, sem chamadas antes. Não soma outros yakus nem dora (EMA).',
    },
  },

  notaDora:
    'Dora não é yaku: só soma han se a mão já tiver pelo menos um yaku. O indicador aponta a próxima pedra (9→1, N→E, Vermelho→Branco).',
  notaKazoe:
    '**Kazoe yakuman** não é um yaku: é a mão que soma 13 han ou mais (yakus e doras) e passa a valer um Yakuman. Nem toda mesa usa: sem ele, a mão para em Sanbaiman.',

  iniciante: [
    { titulo: 'Yakus essenciais de 1 han', subtitulo: 'Comece por estes' },
    { titulo: 'Yakus fáceis de 2+ han', subtitulo: 'Para o próximo passo' },
  ],

  ciclosDora: {
    numeros: { titulo: 'Números', detalhe: 'Sobe um e o 9 volta para o 1.' },
    ventos: { titulo: 'Ventos', detalhe: 'Leste → Sul → Oeste → Norte → Leste.' },
    dragoes: { titulo: 'Dragões', detalhe: 'Branco → Verde → Vermelho → Branco.' },
  },

  nomesHonras: {
    '1z': 'Ton',
    '2z': 'Nan',
    '3z': 'Shaa',
    '4z': 'Pei',
    '5z': 'Haku',
    '6z': 'Hatsu',
    '7z': 'Chun',
  },

  yakuhai: {
    ventos: { Ton: 'Leste', Nan: 'Sul', Sha: 'Oeste', Pei: 'Norte' },
    dragoes: { Haku: 'Dragão branco', Hatsu: 'Dragão verde', Chun: 'Dragão vermelho' },
    tituloRodada: 'Vento da rodada',
    tituloAssento: 'Vento do assento',
    textoDragao: 'Trinca ou quad de {{dragao}}. Vale 1 han.',
    textoVentoRodada: 'Trinca ou quad de {{vento}}, o vento da rodada atual. Vale 1 han.',
    textoVentoAssento: 'Trinca ou quad de {{vento}}, o vento do seu assento. Vale 1 han.',
    dicaVentoDuploRodada:
      'Como esse vento também é o do seu assento, a mesma trinca conta duas vezes (vento duplo) e vale 2 han no total.',
    dicaVentoDuploAssento:
      'Como esse vento também é o da rodada, a mesma trinca conta duas vezes (vento duplo) e vale 2 han no total.',
  },

  secoes: {
    naipes: {
      titulo: 'Naipes',
      intro: 'Pedras numeradas de 1 a 9, em três naipes.',
      aliases: ['naipe', 'naipes'],
      itens: {
        man: { nome: 'Man', apelido: 'Caracteres', aliases: ['man', 'manzu'] },
        pin: { nome: 'Pin', apelido: 'Círculos', aliases: ['pin', 'pinzu'] },
        sou: { nome: 'Sou', apelido: 'Bambus', aliases: ['sou', 'souzu'] },
        terminais: {
          nome: 'Terminais e simples',
          topicos: ['1 e 9 são **terminais**.', '2 a 8 são **simples**.'],
          aliases: ['terminal', 'terminais', 'routouhai', 'simples', 'chunchanpai'],
        },
      },
    },
    honras: {
      titulo: 'Honras',
      intro: 'Pedras sem número: ventos e dragões.',
      aliases: ['honra', 'honras', 'jihai'],
      itens: {
        ventos: {
          nome: 'Ventos',
          texto: 'Ton (Leste), Nan (Sul), Shaa (Oeste), Pei (Norte)',
          aliases: ['vento', 'ventos', 'kazehai', 'leste', 'sul', 'oeste', 'norte'],
        },
        dragoes: {
          nome: 'Dragões',
          texto: 'Haku (Branco), Hatsu (Verde), Chun (Vermelho)',
          aliases: ['dragão', 'dragões', 'dragao', 'dragoes', 'sangenpai'],
        },
      },
    },
    mao: {
      titulo: 'Formação da mão',
      intro: 'A mão comum tem 4 grupos (sequências ou trincas) + 1 par.',
      rotulosExemplo: ['Sequência', 'Sequência', 'Trinca', 'Trinca', 'Par'],
      itens: {
        sequencia: {
          nome: 'Sequência',
          texto: 'Três números seguidos do mesmo naipe (ex.: 3-4-5 de Pin). Pode vir de um chi.',
          aliases: ['sequência', 'sequências', 'sequencia', 'sequencias', 'shuntsu'],
        },
        trinca: {
          nome: 'Trinca',
          texto: 'Três pedras iguais. Pode vir de um pon.',
          aliases: ['trinca', 'trincas', 'trio', 'trios', 'koutsu'],
        },
        par: { nome: 'Par', texto: 'Duas pedras iguais.', aliases: ['par', 'pares', 'jantou'] },
      },
    },
    chamadas: {
      titulo: 'Chamadas',
      itens: {
        chamada: {
          nome: 'Chamada',
          leitura: 'naki',
          texto:
            'Pegar o descarte de outro jogador para formar uma combinação com chi, pon ou kan. Toda chamada abre a mão, exceto o kan fechado.',
          aliases: [
            'chamada',
            'chamadas',
            'chamar',
            'chamou',
            'chamando',
            'chamado',
            'chamados',
            'naki',
          ],
        },
        chi: {
          nome: 'Chi',
          texto: 'Pegar o descarte do jogador à sua esquerda para formar uma sequência.',
          aliases: ['chi', 'chii'],
        },
        pon: {
          nome: 'Pon',
          texto: 'Pegar o descarte de qualquer jogador para formar uma trinca.',
          aliases: ['pon'],
        },
        kan: {
          nome: 'Kan',
          texto:
            'Quatro pedras iguais. Você compra uma pedra de reposição e revela mais um indicador de dora. O kan fechado (as quatro são suas) não abre a mão.',
          aliases: ['kan', 'kans', 'kantsu', 'quad', 'quads'],
        },
        kuitan: {
          nome: 'Kuitan',
          texto:
            "Tan'yao com a mão aberta. Permitido pelas regras da EMA, mas algumas mesas jogam sem ele (kuitan nashi).",
          aliases: ['kuitan'],
        },
      },
    },
    vitoria: {
      titulo: 'Espera e vitória',
      itens: {
        tenpai: {
          nome: 'Tenpai',
          texto: 'Falta só uma pedra para completar a mão.',
          aliases: ['tenpai', 'tempai'],
        },
        ryanmen: {
          nome: 'Ryanmen',
          texto:
            'Espera de duas pontas: dois números seguidos que completam com a pedra de qualquer lado (3-4 espera 2 ou 5).',
          aliases: ['ryanmen'],
        },
        riichi: {
          nome: 'Riichi',
          texto: 'Declarar tenpai com a mão fechada, apostando 1.000 pontos. Vale 1 han.',
          aliases: ['riichi'],
        },
        ippatsu: { nome: 'Ippatsu', aliases: ['ippatsu', 'ipatsu'] },
        tsumo: {
          nome: 'Tsumo',
          texto: 'Vencer com uma pedra comprada por você.',
          aliases: ['tsumo'],
        },
        ron: { nome: 'Ron', texto: 'Vencer com o descarte de outro jogador.', aliases: ['ron'] },
        'ron-duplo': {
          nome: 'Ron duplo',
          leitura: 'daburon',
          texto:
            'Dois jogadores dão ron no mesmo descarte e os dois vencem. Quem descartou paga cada um deles.',
          topicos: [
            '**Atamahane**: algumas mesas não aceitam ron duplo e só um vence. Ganha quem joga primeiro depois de quem descartou.',
            'Com três ron no mesmo descarte, muitas mesas anulam a rodada (sanchahou).',
          ],
          aliases: ['ron duplo', 'double ron', 'daburon', 'atamahane'],
        },
        furiten: {
          nome: 'Furiten',
          texto:
            'Se você já descartou uma das suas esperas, não pode vencer por ron, só por tsumo.',
          topicos: [
            '**Pelos descartes**: uma pedra que completaria sua mão está entre os seus descartes.',
            '**Temporário**: você deixou passar uma pedra que completaria sua mão. Dura até o seu próximo descarte.',
            '**De Riichi**: depois do Riichi, você deixou passar uma pedra que completaria sua mão. Dura até o fim da rodada.',
          ],
          aliases: ['furiten'],
        },
      },
    },
    dora: {
      titulo: 'Dora',
      itens: {
        dora: {
          nome: 'Dora',
          texto: 'Pedra bônus apontada pelo indicador. Cada uma vale 1 han, mas não é yaku.',
          topicos: [
            'O **indicador** é a pedra virada no muro morto.',
            'A dora é a pedra seguinte na ordem abaixo (indicador 7 de Pin → dora 8 de Pin).',
          ],
          aliases: ['dora', 'doras', 'indicador', 'indicadores', 'indicador de dora'],
        },
        'kan-dora': {
          nome: 'Kan-dora',
          texto: 'Cada kan revela mais um indicador.',
          aliases: ['kan-dora', 'kandora', 'kan dora'],
        },
        'ura-dora': {
          nome: 'Ura-dora',
          texto:
            'Pedra embaixo de cada indicador. Só é revelada para quem vence depois de declarar Riichi.',
          aliases: ['ura-dora', 'uradora', 'ura dora'],
        },
        'aka-dora': {
          nome: 'Aka dora',
          apelido: '5 vermelho',
          texto: 'Cada 5 vermelho vale 1 dora. Só conta com a regra Aka dora ligada.',
          aliases: [
            'aka dora',
            'aka-dora',
            'akadora',
            '5 vermelho',
            '5 vermelhos',
            'cinco vermelho',
            'cincos vermelhos',
          ],
        },
      },
    },
    pontuacao: {
      titulo: 'Pontuação',
      itens: {
        yaku: {
          nome: 'Yaku',
          texto: 'Condição de pontuação. Toda mão precisa de pelo menos um yaku para vencer.',
          aliases: ['yaku', 'yakus'],
        },
        han: {
          nome: 'Han',
          texto: 'Valor de cada yaku e dora. Quanto mais han, mais pontos.',
          aliases: ['han'],
        },
        fu: {
          nome: 'Fu',
          texto:
            'Pontos pela forma da mão (trincas, espera, jeito de vencer). Ajustam o valor até 4 han.',
          aliases: ['fu'],
        },
      },
    },
    patamares: {
      titulo: 'Patamares de pontuação',
      aliases: ['patamar', 'patamares'],
      itens: {
        mangan: {
          nome: 'Mangan',
          texto:
            '5 han, ou 4 han com 40 fu ou mais, ou 3 han com 70 fu ou mais. Vale {{ko}} ({{oya}} sendo oya).',
          aliases: ['mangan', 'mangans'],
        },
        haneman: {
          nome: 'Haneman',
          texto: '6 ou 7 han. Vale {{ko}} ({{oya}} sendo oya).',
          aliases: ['haneman', 'hanemans'],
        },
        baiman: {
          nome: 'Baiman',
          texto: '8 a 10 han. Vale {{ko}} ({{oya}} sendo oya).',
          aliases: ['baiman', 'baimans'],
        },
        sanbaiman: {
          nome: 'Sanbaiman',
          texto: '11 ou 12 han. Vale {{ko}} ({{oya}} sendo oya).',
          aliases: ['sanbaiman', 'sanbaimans'],
        },
        yakuman: {
          nome: 'Yakuman',
          texto: 'Mão máxima. Vale {{ko}} ({{oya}} sendo oya).',
          aliases: ['yakuman', 'yakumans', 'kazoe yakuman'],
        },
      },
    },
    mesa: {
      titulo: 'Mesa',
      itens: {
        oya: {
          nome: 'Oya',
          texto:
            'O dealer, sempre o Leste. Ganha 1,5× ao vencer. Se vencer ou ficar em tenpai no empate, faz renchan.',
          aliases: ['oya', 'dealer', 'dealers'],
        },
        renchan: {
          nome: 'Renchan',
          texto:
            'Quando o oya continua como dealer na mão seguinte. Acontece se ele vencer ou se ficar em tenpai num empate. O vento dos jogadores não gira e o contador de honba sobe.',
          aliases: ['renchan'],
        },
        ko: {
          nome: 'Ko',
          texto: 'Os outros três jogadores, que não são o dealer.',
          aliases: ['ko'],
        },
        honba: {
          nome: 'Honba',
          texto:
            'Contador de mãos extras. Sobe a cada renchan ou empate e zera quando um ko vence. Cada honba soma 300 pontos ao próximo vencedor (no tsumo, 100 de cada jogador).',
          aliases: ['honba', 'honbas'],
        },
        empate: {
          nome: 'Empate / Ryuukyoku',
          texto: 'Rodada termina sem vencedor quando o muro acaba.',
          aliases: ['empate', 'empates', 'empatada', 'empatado', 'ryuukyoku'],
        },
        'empate-abortivo': {
          nome: 'Empate abortivo',
          leitura: 'tochuu ryuukyoku',
          texto:
            'A rodada é anulada antes de o muro acabar. O oya continua e o honba sobe. As regras da EMA não usam empate abortivo, mas muitas mesas usam. Os casos comuns:',
          topicos: [
            '**Kyuushu kyuuhai**: 9 terminais ou honras diferentes na mão inicial. O jogador pode anular a rodada.',
            '**Suufon renda**: os quatro jogadores descartam o mesmo vento na primeira volta.',
            '**Suucha riichi**: os quatro jogadores declaram Riichi.',
            '**Suukaikan**: quatro kans de jogadores diferentes.',
            '**Sanchahou**: três jogadores dão ron no mesmo descarte.',
          ],
          aliases: [
            'empate abortivo',
            'empates abortivos',
            'tochuu ryuukyoku',
            'kyuushu kyuuhai',
            'suufon renda',
            'suucha riichi',
            'suukaikan',
            'sanchahou',
          ],
        },
        chombo: {
          nome: 'Chombo',
          texto: 'Penalidade por erro grave, como vencer sem yaku ou dar ron em furiten.',
          aliases: ['chombo'],
        },
      },
    },
    regras: {
      titulo: 'Regras e entidades',
      itens: {
        ema: {
          nome: 'EMA',
          texto:
            'European Mahjong Association, entidade que organiza o mahjong competitivo na Europa. Publica o RCR (Riichi Competition Rules), regulamento de Riichi usado como referência por muitos clubes fora do Japão.',
          aliases: ['ema', 'rcr'],
        },
        'm-league': {
          nome: 'M.League',
          texto:
            'Liga profissional de Riichi do Japão, criada em 2018. Times patrocinados reúnem jogadores profissionais de várias associações, e as partidas são transmitidas ao vivo, com narração e câmeras mostrando a mão de cada um. É a melhor vitrine para ver jogo de alto nível.',
          aliases: ['m.league', 'm league', 'mleague'],
        },
      },
    },
  },
}
