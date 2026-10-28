import type { ConteudoGuiaBolso } from './tipos'

const IPPATSU = 'Win within one go-around after Riichi, with no calls in between.'

export const conteudo: ConteudoGuiaBolso = {
  categorias: {
    sequencias: 'Sequence-based',
    'terminais-honras': 'Terminal / honor-based',
    'trincas-pares': 'Pair / triplet / quad-based',
    naipes: 'Suit-based',
    outros: 'Other yaku',
  },

  yakus: {
    iipeikou: {
      nome: 'Pure double sequence',
      descricao: 'Two identical sequences in the same suit. Closed hand only.',
    },
    ryanpeikou: {
      nome: 'Twice pure double sequence',
      descricao:
        'Two Iipeikou in the same hand. Closed hand only. Does not combine with Chiitoitsu.',
    },
    pinfu: {
      nome: 'No-points hand',
      descricao:
        '4 sequences + a pair that is not a dragon, the round wind or your seat wind, won on a ryanmen wait. A pair of the other winds is fine. Closed hand only.',
    },
    'sanshoku-doujun': {
      nome: 'Mixed triple sequence',
      descricao: 'The same sequence in all three suits (e.g. 234 of Man, Pin and Sou).',
    },
    ittsuu: { nome: 'Pure straight', descricao: '123, 456 and 789 of the same suit.' },
    tanyao: {
      nome: 'All simples',
      descricao: 'Only tiles 2 to 8. No terminals and no honors. Counts open under EMA (kuitan).',
    },
    yakuhai: {
      nome: 'Value triplet',
      descricao:
        'Triplet or quad of a dragon, the round wind (bakaze) or your seat wind (jikaze). 1 han per triplet. A double wind is worth 2.',
    },
    shousangen: {
      nome: 'Little three dragons',
      descricao: 'Two dragon triplets + a pair of the third dragon (the Yakuhai also count).',
    },
    daisangen: { nome: 'Big three dragons', descricao: 'Triplets of all three dragons.' },
    shousuushii: {
      nome: 'Little four winds',
      descricao: 'Three wind triplets + a pair of the fourth wind.',
    },
    daisuushii: { nome: 'Big four winds', descricao: 'Triplets of all four winds.' },
    chanta: {
      nome: 'Half outside hand',
      descricao:
        'Every group and the pair contain a terminal or an honor. Needs at least one sequence.',
    },
    junchan: {
      nome: 'Fully outside hand',
      descricao: 'Every group and the pair contain a terminal. No honors.',
    },
    honroutou: {
      nome: 'All terminals and honors',
      descricao: 'Only terminals and honors (always goes with Toitoi or Chiitoitsu).',
    },
    chinroutou: { nome: 'All terminals', descricao: 'A hand made only of 1s and 9s.' },
    tsuuiisou: { nome: 'All honors', descricao: 'A hand made only of winds and dragons.' },
    kokushi: {
      nome: 'Thirteen orphans',
      descricao: 'One of each terminal and honor (13 tiles) + one duplicate. Closed only.',
    },
    chiitoitsu: {
      nome: 'Seven pairs',
      descricao:
        'Exactly 7 pairs, only with a closed hand. Keep in mind that two identical pairs do not count.',
      dica: 'Worth trying when your starting hand already has 4 pairs. Ideally start with 5. Depending on the hand, going for Toitoi may be better.',
    },
    toitoi: { nome: 'All triplets', descricao: '4 triplets (or quads) + 1 pair.' },
    sanankou: {
      nome: 'Three concealed triplets',
      descricao: 'Three triplets formed without calling tiles (the rest of the hand can be open).',
    },
    suuankou: {
      nome: 'Four concealed triplets',
      descricao: 'Four triplets formed without calling tiles. Closed only.',
    },
    'sanshoku-doukou': {
      nome: 'Triple triplets',
      descricao: 'The same numbered triplet in all three suits.',
    },
    sankantsu: { nome: 'Three quads', descricao: 'Three quads, open or closed.' },
    suukantsu: { nome: 'Four quads', descricao: 'Four quads.' },
    honitsu: { nome: 'Half flush', descricao: 'A single suit mixed with honors.' },
    chinitsu: { nome: 'Full flush', descricao: 'A single suit, no honors.' },
    ryuuiisou: {
      nome: 'All green',
      descricao: 'Only 2, 3, 4, 6, 8 of Sou and the Green Dragon.',
    },
    chuuren: {
      nome: 'Nine gates',
      descricao: '1112345678999 of one suit + any tile of the same suit. Closed only.',
    },
    riichi: {
      nome: 'Ready declaration',
      descricao:
        'Declare in tenpai with a closed hand, betting 1,000 points. Enables Ippatsu and Ura-dora.',
    },
    'double-riichi': {
      nome: 'Double Riichi',
      descricao: 'Riichi declared on your first discard, with no calls before it.',
    },
    ippatsu: { nome: 'One shot', descricao: IPPATSU },
    'menzen-tsumo': {
      nome: 'Fully concealed hand',
      descricao: 'Win by self-draw (tsumo) with a fully closed hand.',
    },
    haitei: { nome: 'Under the sea', descricao: 'Win by tsumo on the last tile of the wall.' },
    houtei: { nome: 'Under the river', descricao: 'Win on the last discard of the hand.' },
    rinshan: {
      nome: 'After a kan',
      descricao: 'Win with the replacement tile drawn after declaring a kan.',
    },
    chankan: {
      nome: 'Robbing a kan',
      descricao:
        'Win on the tile another player adds to a pon to make a kan. A closed kan can only be robbed for Kokushi.',
    },
    tenhou: { nome: 'Blessing of heaven', descricao: 'The dealer wins with the starting hand.' },
    chiihou: {
      nome: 'Blessing of earth',
      descricao: 'A non-dealer wins by tsumo on their first draw, with no calls before it.',
    },
    renhou: {
      nome: 'Blessing of man',
      descricao:
        'Win by ron before your first draw, with no calls before it. Does not add other yaku or dora (EMA).',
    },
  },

  notaDora:
    'Dora is not a yaku: it only adds han if the hand already has at least one yaku. The indicator points to the next tile (9→1, N→E, Red→White).',
  notaKazoe:
    '**Kazoe yakuman** is not a yaku: it is a hand that adds up to 13 han or more (yaku and dora) and counts as a Yakuman. Not every table uses it: without it, the hand stops at Sanbaiman.',

  iniciante: [
    { titulo: 'Essential 1-han yaku', subtitulo: 'Start with these' },
    { titulo: 'Easy 2+ han yaku', subtitulo: 'For the next step' },
  ],

  ciclosDora: {
    numeros: { titulo: 'Numbers', detalhe: 'Goes up by one and 9 wraps to 1.' },
    ventos: { titulo: 'Winds', detalhe: 'East → South → West → North → East.' },
    dragoes: { titulo: 'Dragons', detalhe: 'White → Green → Red → White.' },
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
    ventos: { Ton: 'East', Nan: 'South', Sha: 'West', Pei: 'North' },
    dragoes: { Haku: 'White dragon', Hatsu: 'Green dragon', Chun: 'Red dragon' },
    tituloRodada: 'Round wind',
    tituloAssento: 'Seat wind',
    textoDragao: 'Triplet or quad of the {{dragao}}. Worth 1 han.',
    textoVentoRodada: 'Triplet or quad of {{vento}}, the wind of the current round. Worth 1 han.',
    textoVentoAssento: 'Triplet or quad of {{vento}}, your seat wind. Worth 1 han.',
    dicaVentoDuploRodada:
      'Since this wind is also your seat wind, the same triplet counts twice (double wind) and is worth 2 han in total.',
    dicaVentoDuploAssento:
      'Since this wind is also the round wind, the same triplet counts twice (double wind) and is worth 2 han in total.',
  },

  secoes: {
    naipes: {
      titulo: 'Suits',
      intro: 'Tiles numbered 1 to 9, in three suits.',
      aliases: ['suit', 'suits'],
      itens: {
        man: { nome: 'Man', apelido: 'Characters', aliases: ['man', 'manzu', 'characters'] },
        pin: { nome: 'Pin', apelido: 'Circles', aliases: ['pin', 'pinzu', 'circles', 'dots'] },
        sou: { nome: 'Sou', apelido: 'Bamboo', aliases: ['sou', 'souzu', 'bamboo', 'bamboos'] },
        terminais: {
          nome: 'Terminals and simples',
          topicos: ['1 and 9 are **terminals**.', '2 to 8 are **simples**.'],
          aliases: ['terminal', 'terminals', 'routouhai', 'simple', 'simples', 'chunchanpai'],
        },
      },
    },
    honras: {
      titulo: 'Honors',
      intro: 'Tiles without numbers: winds and dragons.',
      aliases: ['honor', 'honors', 'honour', 'honours', 'jihai'],
      itens: {
        ventos: {
          nome: 'Winds',
          texto: 'Ton (East), Nan (South), Shaa (West), Pei (North)',
          aliases: ['wind', 'winds', 'kazehai', 'east', 'south', 'west', 'north'],
        },
        dragoes: {
          nome: 'Dragons',
          texto: 'Haku (White), Hatsu (Green), Chun (Red)',
          aliases: ['dragon', 'dragons', 'sangenpai'],
        },
      },
    },
    mao: {
      titulo: 'Hand shape',
      intro: 'A standard hand has 4 groups (sequences or triplets) + 1 pair.',
      rotulosExemplo: ['Sequence', 'Sequence', 'Triplet', 'Triplet', 'Pair'],
      itens: {
        sequencia: {
          nome: 'Sequence',
          texto:
            'Three consecutive numbers of the same suit (e.g. 3-4-5 of Pin). Can come from a chi.',
          aliases: ['sequence', 'sequences', 'shuntsu'],
        },
        trinca: {
          nome: 'Triplet',
          texto: 'Three identical tiles. Can come from a pon.',
          aliases: ['triplet', 'triplets', 'koutsu'],
        },
        par: { nome: 'Pair', texto: 'Two identical tiles.', aliases: ['pair', 'pairs', 'jantou'] },
      },
    },
    chamadas: {
      titulo: 'Calls',
      itens: {
        chamada: {
          nome: 'Call',
          leitura: 'naki',
          texto:
            "Take another player's discard to complete a combination with chi, pon or kan. Every call opens the hand, except a closed kan.",
          aliases: ['call', 'calls', 'calling', 'called', 'naki'],
        },
        chi: {
          nome: 'Chi',
          texto: 'Take the discard of the player on your left to make a sequence.',
          aliases: ['chi', 'chii'],
        },
        pon: {
          nome: 'Pon',
          texto: "Take any player's discard to make a triplet.",
          aliases: ['pon'],
        },
        kan: {
          nome: 'Kan',
          texto:
            'Four identical tiles. You draw a replacement tile and reveal one more dora indicator. A closed kan (all four are yours) does not open the hand.',
          aliases: ['kan', 'kans', 'kantsu', 'quad', 'quads'],
        },
        kuitan: {
          nome: 'Kuitan',
          texto:
            "Tan'yao with an open hand. Allowed under EMA rules, but some tables play without it (kuitan nashi).",
          aliases: ['kuitan'],
        },
      },
    },
    vitoria: {
      titulo: 'Waiting and winning',
      itens: {
        tenpai: {
          nome: 'Tenpai',
          texto: 'Only one tile away from completing the hand.',
          aliases: ['tenpai', 'tempai'],
        },
        ryanmen: {
          nome: 'Ryanmen',
          texto:
            'Two-sided wait: two consecutive numbers completed by the tile on either side (3-4 waits on 2 or 5).',
          aliases: ['ryanmen', 'two-sided wait'],
        },
        riichi: {
          nome: 'Riichi',
          texto: 'Declare tenpai with a closed hand, betting 1,000 points. Worth 1 han.',
          aliases: ['riichi'],
        },
        ippatsu: { nome: 'Ippatsu', aliases: ['ippatsu', 'ipatsu'] },
        tsumo: {
          nome: 'Tsumo',
          texto: 'Win with a tile you drew yourself.',
          aliases: ['tsumo', 'self-draw'],
        },
        ron: { nome: 'Ron', texto: "Win on another player's discard.", aliases: ['ron'] },
        'ron-duplo': {
          nome: 'Double ron',
          leitura: 'daburon',
          texto:
            'Two players declare ron on the same discard and both win. The discarder pays each of them.',
          topicos: [
            '**Atamahane**: some tables do not allow double ron and only one player wins: the first in turn order after the discarder.',
            'With three ron declared on the same discard, many tables cancel the hand (sanchahou).',
          ],
          aliases: ['double ron', 'daburon', 'atamahane'],
        },
        furiten: {
          nome: 'Furiten',
          texto:
            'If you have already discarded one of your winning tiles, you cannot win by ron, only by tsumo.',
          topicos: [
            '**By discards**: a tile that would complete your hand is among your own discards.',
            '**Temporary**: you let a tile that would complete your hand go by. Lasts until your next discard.',
            '**Riichi**: after Riichi, you let a tile that would complete your hand go by. Lasts until the end of the hand.',
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
          texto:
            'Bonus tile shown by the indicator. Each one is worth 1 han, but it is not a yaku.',
          topicos: [
            'The **indicator** is the tile turned face up in the dead wall.',
            'The dora is the next tile in the order below (indicator 7 of Pin → dora 8 of Pin).',
          ],
          aliases: ['dora', 'doras', 'indicator', 'indicators', 'dora indicator'],
        },
        'kan-dora': {
          nome: 'Kan-dora',
          texto: 'Each kan reveals one more indicator.',
          aliases: ['kan-dora', 'kandora', 'kan dora'],
        },
        'ura-dora': {
          nome: 'Ura-dora',
          texto:
            'Tile under each indicator. Only revealed for a player who wins after declaring Riichi.',
          aliases: ['ura-dora', 'uradora', 'ura dora'],
        },
        'aka-dora': {
          nome: 'Aka dora',
          apelido: 'red 5',
          texto: 'Each red 5 is worth 1 dora. Only counts with the Aka dora rule on.',
          aliases: ['aka dora', 'aka-dora', 'akadora', 'red 5', 'red 5s', 'red five', 'red fives'],
        },
      },
    },
    pontuacao: {
      titulo: 'Scoring',
      itens: {
        yaku: {
          nome: 'Yaku',
          texto: 'Scoring condition. Every hand needs at least one yaku to win.',
          aliases: ['yaku', 'yakus'],
        },
        han: {
          nome: 'Han',
          texto: 'Value of each yaku and dora. The more han, the more points.',
          aliases: ['han'],
        },
        fu: {
          nome: 'Fu',
          texto:
            'Points for the shape of the hand (triplets, wait, way of winning). They adjust the value up to 4 han.',
          aliases: ['fu'],
        },
      },
    },
    patamares: {
      titulo: 'Scoring limits',
      aliases: ['limit', 'limits', 'limit hand', 'limit hands'],
      itens: {
        mangan: {
          nome: 'Mangan',
          texto:
            '5 han, or 4 han with 40 fu or more, or 3 han with 70 fu or more. Worth {{ko}} ({{oya}} as dealer).',
          aliases: ['mangan', 'mangans'],
        },
        haneman: {
          nome: 'Haneman',
          texto: '6 or 7 han. Worth {{ko}} ({{oya}} as dealer).',
          aliases: ['haneman', 'hanemans'],
        },
        baiman: {
          nome: 'Baiman',
          texto: '8 to 10 han. Worth {{ko}} ({{oya}} as dealer).',
          aliases: ['baiman', 'baimans'],
        },
        sanbaiman: {
          nome: 'Sanbaiman',
          texto: '11 or 12 han. Worth {{ko}} ({{oya}} as dealer).',
          aliases: ['sanbaiman', 'sanbaimans'],
        },
        yakuman: {
          nome: 'Yakuman',
          texto: 'Limit hand. Worth {{ko}} ({{oya}} as dealer).',
          aliases: ['yakuman', 'yakumans', 'kazoe yakuman'],
        },
      },
    },
    mesa: {
      titulo: 'Table',
      itens: {
        oya: {
          nome: 'Oya',
          texto:
            'The dealer, always East. Gets 1.5× when winning. If they win or are tenpai in a draw, they get a renchan.',
          aliases: ['oya', 'dealer', 'dealers'],
        },
        renchan: {
          nome: 'Renchan',
          texto:
            'When the oya stays dealer for the next hand. Happens if they win or are tenpai in a draw. Seat winds do not rotate and the honba counter goes up.',
          aliases: ['renchan', 'dealer repeat'],
        },
        ko: {
          nome: 'Ko',
          texto: 'The other three players, who are not the dealer.',
          aliases: ['ko', 'non-dealer', 'non-dealers'],
        },
        honba: {
          nome: 'Honba',
          texto:
            'Counter of extra hands. Goes up with each renchan or draw and resets when a ko wins. Each honba adds 300 points for the next winner (on tsumo, 100 from each player).',
          aliases: ['honba', 'honbas'],
        },
        empate: {
          nome: 'Draw / Ryuukyoku',
          texto: 'The hand ends with no winner when the wall runs out.',
          aliases: ['exhaustive draw', 'exhaustive draws', 'ryuukyoku'],
        },
        'empate-abortivo': {
          nome: 'Abortive draw',
          leitura: 'tochuu ryuukyoku',
          texto:
            'The hand is cancelled before the wall runs out. The oya stays and the honba goes up. EMA rules do not use abortive draws, but many tables do. The common cases:',
          topicos: [
            '**Kyuushu kyuuhai**: 9 different terminals or honors in the starting hand. The player may cancel the hand.',
            '**Suufon renda**: all four players discard the same wind on the first go-around.',
            '**Suucha riichi**: all four players declare Riichi.',
            '**Suukaikan**: four kans by different players.',
            '**Sanchahou**: three players declare ron on the same discard.',
          ],
          aliases: [
            'abortive draw',
            'abortive draws',
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
          texto:
            'Penalty for a serious mistake, such as winning without a yaku or declaring ron in furiten.',
          aliases: ['chombo'],
        },
      },
    },
    regras: {
      titulo: 'Rules and organizations',
      itens: {
        ema: {
          nome: 'EMA',
          texto:
            'European Mahjong Association, the body that runs competitive mahjong in Europe. It publishes the RCR (Riichi Competition Rules), a Riichi rulebook used as a reference by many clubs outside Japan.',
          aliases: ['ema', 'rcr'],
        },
        'm-league': {
          nome: 'M.League',
          texto:
            "Japan's professional Riichi league, founded in 2018. Sponsored teams bring together pro players from several associations, and matches are streamed live, with commentary and cameras showing each player's hand. It is the best showcase for high-level play.",
          aliases: ['m.league', 'm league', 'mleague'],
        },
      },
    },
  },
}
