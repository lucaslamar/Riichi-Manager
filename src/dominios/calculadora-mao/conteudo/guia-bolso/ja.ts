import type { ConteudoGuiaBolso } from './tipos'

const IPPATSU = '立直から1巡以内に和了すること。その間に誰かの鳴きが入ると消える。'

export const conteudo: ConteudoGuiaBolso = {
  categorias: {
    sequencias: '順子を使う役',
    'terminais-honras': '么九牌・字牌を使う役',
    'trincas-pares': '対子・刻子・槓子を使う役',
    naipes: '色（スート）を揃える役',
    outros: 'その他の役',
  },

  yakus: {
    iipeikou: {
      titulo: '一盃口',
      nome: 'イーペーコー',
      descricao: '同じ色の同じ順子が2組。門前のみ。',
    },
    ryanpeikou: {
      titulo: '二盃口',
      nome: 'リャンペーコー',
      descricao: '一盃口が2組。門前のみ。七対子とは複合しない。',
    },
    pinfu: {
      titulo: '平和',
      nome: 'ピンフ',
      descricao:
        '順子4組＋雀頭で、雀頭が三元牌・場風・自風ではなく、両面待ちで和了。オタ風の雀頭は可。門前のみ。',
    },
    'sanshoku-doujun': {
      titulo: '三色同順',
      nome: 'サンショク',
      descricao: '萬子・筒子・索子で同じ数の順子（例：234を3色）。',
      apelidos: ['三色'],
    },
    ittsuu: {
      titulo: '一気通貫',
      nome: 'イッツー',
      descricao: '同じ色の123・456・789。',
      apelidos: ['一通'],
    },
    tanyao: {
      titulo: '断幺九',
      nome: 'タンヤオ',
      descricao: '2〜8の数牌だけで作る。么九牌・字牌なし。EMAでは鳴いても成立（喰いタン）。',
      apelidos: ['断么九', 'タンヤオ'],
    },
    yakuhai: {
      titulo: '役牌',
      nome: 'ヤクハイ',
      descricao: '三元牌、場風、自風の刻子か槓子。1組につき1翻。連風牌（ダブ風）は2翻。',
    },
    shousangen: {
      titulo: '小三元',
      nome: 'ショウサンゲン',
      descricao: '三元牌の刻子2組＋残りの三元牌の雀頭（役牌も加算）。',
    },
    daisangen: { titulo: '大三元', nome: 'ダイサンゲン', descricao: '三元牌3種すべての刻子。' },
    shousuushii: {
      titulo: '小四喜',
      nome: 'ショウスーシー',
      descricao: '風牌の刻子3組＋4種目の風牌の雀頭。',
    },
    daisuushii: { titulo: '大四喜', nome: 'ダイスーシー', descricao: '風牌4種すべての刻子。' },
    chanta: {
      titulo: '混全帯幺九',
      nome: 'チャンタ',
      descricao: 'すべての面子と雀頭に么九牌か字牌が入る。順子が1組以上必要。',
      apelidos: ['チャンタ'],
    },
    junchan: {
      titulo: '純全帯幺九',
      nome: 'ジュンチャン',
      descricao: 'すべての面子と雀頭に1か9が入る。字牌なし。',
      apelidos: ['ジュンチャン'],
    },
    honroutou: {
      titulo: '混老頭',
      nome: 'ホンロートー',
      descricao: '么九牌と字牌だけで作る（必ず対々和か七対子と複合）。',
    },
    chinroutou: { titulo: '清老頭', nome: 'チンロートー', descricao: '1と9だけで作る。' },
    tsuuiisou: { titulo: '字一色', nome: 'ツーイーソー', descricao: '風牌と三元牌だけで作る。' },
    kokushi: {
      titulo: '国士無双',
      nome: 'コクシムソウ',
      descricao: '么九牌と字牌13種を1枚ずつ＋どれか1枚の重複。門前のみ。',
    },
    chiitoitsu: {
      titulo: '七対子',
      nome: 'チートイツ',
      descricao: 'ちょうど7組の対子。門前のみ。同じ対子2組は認められない。',
      dica: '配牌に対子が4組あれば狙う価値あり。理想は5組から。手によっては対々和のほうが良いことも。',
      apelidos: ['チートイ'],
    },
    toitoi: {
      titulo: '対々和',
      nome: 'トイトイ',
      descricao: '刻子（または槓子）4組＋雀頭。',
      apelidos: ['トイトイ'],
    },
    sanankou: {
      titulo: '三暗刻',
      nome: 'サンアンコー',
      descricao: '鳴かずに作った刻子が3組（ほかは鳴いていても可）。',
    },
    suuankou: {
      titulo: '四暗刻',
      nome: 'スーアンコー',
      descricao: '鳴かずに作った刻子が4組。門前のみ。',
    },
    'sanshoku-doukou': {
      titulo: '三色同刻',
      nome: 'サンショクドーコー',
      descricao: '3色で同じ数の刻子。',
    },
    sankantsu: {
      titulo: '三槓子',
      nome: 'サンカンツ',
      descricao: '槓子3組（明槓・暗槓どちらでも）。',
    },
    suukantsu: { titulo: '四槓子', nome: 'スーカンツ', descricao: '槓子4組。' },
    honitsu: {
      titulo: '混一色',
      nome: 'ホンイツ',
      descricao: '1色の数牌と字牌だけで作る。',
      apelidos: ['ホンイツ'],
    },
    chinitsu: {
      titulo: '清一色',
      nome: 'チンイツ',
      descricao: '1色の数牌だけで作る。字牌なし。',
      apelidos: ['チンイツ'],
    },
    ryuuiisou: {
      titulo: '緑一色',
      nome: 'リューイーソー',
      descricao: '索子の2・3・4・6・8と發だけで作る。',
    },
    chuuren: {
      titulo: '九蓮宝燈',
      nome: 'チューレンポートー',
      descricao: '1色で1112345678999＋同じ色のどれか1枚。門前のみ。',
    },
    riichi: {
      titulo: '立直',
      nome: 'リーチ',
      descricao: '門前で聴牌したら1,000点を供託して宣言する。一発と裏ドラが有効になる。',
      apelidos: ['リーチ'],
    },
    'double-riichi': {
      titulo: 'ダブル立直',
      nome: 'ダブルリーチ',
      descricao: '鳴きが入る前の、最初の打牌で立直すること。',
      apelidos: ['ダブリー', 'ダブルリーチ'],
    },
    ippatsu: { titulo: '一発', nome: 'イッパツ', descricao: IPPATSU },
    'menzen-tsumo': {
      titulo: '門前清自摸和',
      nome: 'メンゼンツモ',
      descricao: '完全な門前で、自分のツモで和了すること。',
      apelidos: ['門前ツモ', 'メンゼンツモ', 'メンツモ'],
    },
    haitei: { titulo: '海底摸月', nome: 'ハイテイ', descricao: '山の最後の牌をツモって和了。' },
    houtei: { titulo: '河底撈魚', nome: 'ホウテイ', descricao: 'その局の最後の打牌でロン和了。' },
    rinshan: {
      titulo: '嶺上開花',
      nome: 'リンシャン',
      descricao: 'カンをして引いた嶺上牌で和了。',
    },
    chankan: {
      titulo: '槍槓',
      nome: 'チャンカン',
      descricao: '他家がポンに加えてカン（加槓）した牌でロン和了。暗槓を奪えるのは国士無双だけ。',
      apelidos: ['搶槓'],
    },
    tenhou: { titulo: '天和', nome: 'テンホー', descricao: '親が配牌で和了。' },
    chiihou: {
      titulo: '地和',
      nome: 'チーホー',
      descricao: '子が鳴きの入る前の最初のツモで和了。',
    },
    renhou: {
      titulo: '人和',
      nome: 'レンホー',
      descricao: '最初のツモの前に、鳴きの入る前にロン和了。ほかの役やドラは加算しない（EMA）。',
    },
  },

  notaDora:
    'ドラは役ではない：役が1つ以上ある手にだけ翻を加える。表示牌の次の牌がドラ（9→1、北→東、中→白）。',
  notaKazoe:
    '**数え役満**は役ではない：役とドラで13翻以上になった手が役満として扱われる。採用しない卓もあり、その場合は三倍満止まり。',

  iniciante: [
    { titulo: 'まず覚えたい1翻役', subtitulo: 'ここから始めよう' },
    { titulo: '狙いやすい2翻以上の役', subtitulo: '次のステップ' },
  ],

  ciclosDora: {
    numeros: { titulo: '数牌', detalhe: '1つ上の数。9の次は1。' },
    ventos: { titulo: '風牌', detalhe: '東 → 南 → 西 → 北 → 東' },
    dragoes: { titulo: '三元牌', detalhe: '白 → 發 → 中 → 白' },
  },

  nomesHonras: {
    '1z': '東',
    '2z': '南',
    '3z': '西',
    '4z': '北',
    '5z': '白',
    '6z': '發',
    '7z': '中',
  },

  yakuhai: {
    ventos: { Ton: '東', Nan: '南', Sha: '西', Pei: '北' },
    dragoes: { Haku: '白', Hatsu: '發', Chun: '中' },
    tituloRodada: '場風',
    tituloAssento: '自風',
    textoDragao: '{{dragao}}の刻子か槓子。1翻。',
    textoVentoRodada: '{{vento}}（今の場風）の刻子か槓子。1翻。',
    textoVentoAssento: '{{vento}}（あなたの自風）の刻子か槓子。1翻。',
    dicaVentoDuploRodada:
      'この風は自風でもあるので、同じ刻子が2回数えられ（連風牌・ダブ風）、合計2翻になる。',
    dicaVentoDuploAssento:
      'この風は場風でもあるので、同じ刻子が2回数えられ（連風牌・ダブ風）、合計2翻になる。',
  },

  secoes: {
    naipes: {
      titulo: '数牌',
      intro: '1〜9の数字の牌。3つの色がある。',
      aliases: ['数牌'],
      itens: {
        man: { nome: '萬子', apelido: 'マンズ', aliases: ['萬子', 'マンズ'] },
        pin: { nome: '筒子', apelido: 'ピンズ', aliases: ['筒子', 'ピンズ'] },
        sou: { nome: '索子', apelido: 'ソーズ', aliases: ['索子', 'ソーズ'] },
        terminais: {
          nome: '么九牌と中張牌',
          topicos: ['1と9は**老頭牌**（么九牌）。', '2〜8は**中張牌**。'],
          aliases: ['么九牌', '幺九牌', '老頭牌', '中張牌', 'ヤオチュー牌'],
        },
      },
    },
    honras: {
      titulo: '字牌',
      intro: '数字のない牌：風牌と三元牌。',
      aliases: ['字牌'],
      itens: {
        ventos: {
          nome: '風牌',
          texto: '東（トン）、南（ナン）、西（シャー）、北（ペー）',
          aliases: ['風牌'],
        },
        dragoes: {
          nome: '三元牌',
          texto: '白（ハク）、發（ハツ）、中（チュン）',
          aliases: ['三元牌'],
        },
      },
    },
    mao: {
      titulo: '手の形',
      intro: '基本の和了形は4面子（順子か刻子）＋雀頭1つ。',
      rotulosExemplo: ['順子', '順子', '刻子', '刻子', '雀頭'],
      itens: {
        sequencia: {
          nome: '順子',
          leitura: 'シュンツ',
          texto: '同じ色の連続した3つの数（例：筒子の3-4-5）。チーで作ることもできる。',
          aliases: ['順子', 'シュンツ'],
        },
        trinca: {
          nome: '刻子',
          leitura: 'コーツ',
          texto: '同じ牌3枚。ポンで作ることもできる。',
          aliases: ['刻子', 'コーツ', '暗刻', '明刻'],
        },
        par: {
          nome: '雀頭',
          leitura: 'ジャントウ',
          texto: '同じ牌2枚（対子）。',
          aliases: ['雀頭', '対子', 'ジャントウ', 'トイツ', 'アタマ'],
        },
      },
    },
    chamadas: {
      titulo: '鳴き',
      itens: {
        chamada: {
          nome: '鳴き',
          leitura: '副露',
          texto:
            '他家の捨て牌を取って、チー・ポン・カンで面子を作ること。暗槓以外の鳴きはすべて手を開く。',
          aliases: ['鳴き', '鳴く', '鳴いて', '鳴かず', '副露'],
        },
        chi: {
          nome: 'チー',
          texto: '上家（左の人）の捨て牌を取って順子を作る。',
          aliases: ['チー'],
        },
        pon: {
          nome: 'ポン',
          texto: '誰の捨て牌でも取って刻子を作る。',
          aliases: ['ポン'],
        },
        kan: {
          nome: 'カン',
          texto:
            '同じ牌4枚（槓子）。嶺上牌を1枚引き、ドラ表示牌を1枚追加でめくる。暗槓（4枚とも自分の牌）は手を開かない。',
          aliases: ['カン', '槓子', '暗槓', '明槓', '加槓'],
        },
        kuitan: {
          nome: '喰いタン',
          texto:
            '鳴いて作る断幺九。EMAルールでは認められるが、なしで遊ぶ卓もある（喰いタンなし）。',
          aliases: ['喰いタン', 'クイタン'],
        },
      },
    },
    vitoria: {
      titulo: '待ちと和了',
      itens: {
        tenpai: {
          nome: '聴牌',
          leitura: 'テンパイ',
          texto: 'あと1枚で手が完成する状態。',
          aliases: ['聴牌', 'テンパイ'],
        },
        ryanmen: {
          nome: '両面',
          leitura: 'リャンメン',
          texto: '連続した2つの数で、両側どちらの牌でも完成する待ち（3-4なら2か5待ち）。',
          aliases: ['両面', 'リャンメン'],
        },
        riichi: {
          nome: '立直',
          leitura: 'リーチ',
          texto: '門前で聴牌を宣言し、1,000点を供託する。1翻。',
          aliases: ['立直', 'リーチ'],
        },
        ippatsu: { nome: '一発', leitura: 'イッパツ', aliases: ['一発', 'イッパツ'] },
        tsumo: {
          nome: 'ツモ',
          texto: '自分で引いた牌で和了すること。',
          aliases: ['ツモ', '自摸'],
        },
        ron: { nome: 'ロン', texto: '他家の捨て牌で和了すること。', aliases: ['ロン', '栄和'] },
        'ron-duplo': {
          nome: 'ダブロン',
          leitura: 'ダブルロン',
          texto: '同じ捨て牌に2人がロンし、2人とも和了。放銃者がそれぞれに支払う。',
          topicos: [
            '**頭ハネ**：ダブロンを認めない卓では1人だけが和了。放銃者から見て先の順番の人が優先。',
            '同じ捨て牌に3人がロンした場合、流局にする卓が多い（三家和）。',
          ],
          aliases: ['ダブロン', 'ダブルロン', '頭ハネ', '頭跳ね'],
        },
        furiten: {
          nome: '振聴',
          leitura: 'フリテン',
          texto: '自分の待ち牌をすでに捨てていると、ロンできずツモ和了のみ。',
          topicos: [
            '**捨て牌フリテン**：和了牌が自分の捨て牌の中にある。',
            '**同巡内フリテン**：和了牌を見逃した。次の自分の打牌まで続く。',
            '**立直後のフリテン**：立直後に和了牌を見逃した。その局の終わりまで続く。',
          ],
          aliases: ['振聴', 'フリテン'],
        },
      },
    },
    dora: {
      titulo: 'ドラ',
      itens: {
        dora: {
          nome: 'ドラ',
          texto: '表示牌が示すボーナス牌。1枚につき1翻だが、役ではない。',
          topicos: [
            '**ドラ表示牌**は王牌でめくられた牌。',
            'ドラは下の順で表示牌の次の牌（表示牌が筒子の7 → ドラは筒子の8）。',
          ],
          aliases: ['ドラ', 'ドラ表示牌', '表示牌'],
        },
        'kan-dora': {
          nome: 'カンドラ',
          texto: 'カンのたびに表示牌が1枚増える。',
          aliases: ['カンドラ', '槓ドラ'],
        },
        'ura-dora': {
          nome: '裏ドラ',
          texto: '各表示牌の下の牌。立直して和了した人だけがめくれる。',
          aliases: ['裏ドラ'],
        },
        'aka-dora': {
          nome: '赤ドラ',
          apelido: '赤5',
          texto: '赤い5は1枚につきドラ1。赤ドラありのルールのときだけ数える。',
          aliases: ['赤ドラ', '赤5', '赤牌'],
        },
      },
    },
    pontuacao: {
      titulo: '点数',
      itens: {
        yaku: {
          nome: '役',
          leitura: 'ヤク',
          texto: '点数になる条件。和了には役が1つ以上必要。',
          aliases: ['役'],
        },
        han: {
          nome: '翻',
          leitura: 'ハン',
          texto: '役とドラそれぞれの価値。翻が多いほど点数が高い。',
          aliases: ['翻', 'ハン'],
        },
        fu: {
          nome: '符',
          leitura: 'フ',
          texto: '手の形（刻子、待ち、和了の仕方）による点。4翻までの点数を調整する。',
          aliases: ['符'],
        },
      },
    },
    patamares: {
      titulo: '満貫以上の区切り',
      aliases: ['満貫以上'],
      itens: {
        mangan: {
          nome: '満貫',
          leitura: 'マンガン',
          texto: '5翻、または4翻40符以上、3翻70符以上。{{ko}}点（親は{{oya}}点）。',
          aliases: ['満貫', 'マンガン'],
        },
        haneman: {
          nome: '跳満',
          leitura: 'ハネマン',
          texto: '6〜7翻。{{ko}}点（親は{{oya}}点）。',
          aliases: ['跳満', 'ハネマン'],
        },
        baiman: {
          nome: '倍満',
          leitura: 'バイマン',
          texto: '8〜10翻。{{ko}}点（親は{{oya}}点）。',
          aliases: ['倍満', 'バイマン'],
        },
        sanbaiman: {
          nome: '三倍満',
          leitura: 'サンバイマン',
          texto: '11〜12翻。{{ko}}点（親は{{oya}}点）。',
          aliases: ['三倍満', 'サンバイマン'],
        },
        yakuman: {
          nome: '役満',
          leitura: 'ヤクマン',
          texto: '最高の手。{{ko}}点（親は{{oya}}点）。',
          aliases: ['役満', '数え役満', 'ヤクマン'],
        },
      },
    },
    mesa: {
      titulo: '卓',
      itens: {
        oya: {
          nome: '親',
          leitura: 'オヤ',
          texto: 'ディーラー。常に東家。和了すると1.5倍。和了するか流局で聴牌なら連荘。',
          aliases: ['親', '東家'],
        },
        renchan: {
          nome: '連荘',
          leitura: 'レンチャン',
          texto:
            '親が次の局も親を続けること。親が和了するか、流局で聴牌のときに起きる。自風は変わらず、本場が増える。',
          aliases: ['連荘', 'レンチャン'],
        },
        ko: {
          nome: '子',
          leitura: 'コ',
          texto: '親以外の3人。',
          aliases: ['子家'],
        },
        honba: {
          nome: '本場',
          leitura: 'ホンバ',
          texto:
            '積み棒の数。連荘か流局のたびに増え、子が和了すると0に戻る。1本場ごとに次の和了者へ300点（ツモなら各自100点）。',
          aliases: ['本場', '積み棒'],
        },
        empate: {
          nome: '流局',
          leitura: 'リュウキョク',
          texto: '山がなくなり、和了者なしで局が終わること。',
          aliases: ['流局', '荒牌平局'],
        },
        'empate-abortivo': {
          nome: '途中流局',
          leitura: 'トチュウリュウキョク',
          texto:
            '山がなくなる前に局が流れること。親はそのままで本場が増える。EMAルールでは使わないが、採用する卓は多い。よくあるもの：',
          topicos: [
            '**九種九牌**：配牌に么九牌・字牌が9種以上。その人は局を流せる。',
            '**四風連打**：第1巡で4人が同じ風牌を捨てる。',
            '**四家立直**：4人全員が立直。',
            '**四開槓**：別々の人が合計4回カン。',
            '**三家和**：同じ捨て牌に3人がロン。',
          ],
          aliases: ['途中流局', '九種九牌', '四風連打', '四家立直', '四開槓', '三家和'],
        },
        chombo: {
          nome: '錯和',
          leitura: 'チョンボ',
          texto: '役なしで和了する、フリテンでロンするなど、重大なミスへの罰則。',
          aliases: ['錯和', 'チョンボ'],
        },
      },
    },
    regras: {
      titulo: 'ルールと団体',
      itens: {
        ema: {
          nome: 'EMA',
          texto:
            '欧州麻雀協会（European Mahjong Association）。ヨーロッパの競技麻雀を運営する団体。RCR（Riichi Competition Rules）を公開しており、日本国外の多くのクラブが基準にしている。',
          aliases: ['EMA', 'RCR', '欧州麻雀協会'],
        },
        'm-league': {
          nome: 'Mリーグ',
          texto:
            '2018年に始まった日本のプロ麻雀リーグ。企業がスポンサーのチームに各団体のプロ雀士が所属し、実況と各選手の手牌を映すカメラ付きで生配信される。トップレベルの対局を見るのに最適。',
          aliases: ['Mリーグ', 'M.League'],
        },
      },
    },
  },
}
