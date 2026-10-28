import type { ConteudoGuiaBolso } from './tipos'

const IPPATSU = '立直后一巡之内和牌，期间没有任何人鸣牌。'

export const conteudo: ConteudoGuiaBolso = {
  categorias: {
    sequencias: '顺子类役',
    'terminais-honras': '幺九牌 / 字牌类役',
    'trincas-pares': '对子 / 刻子 / 杠子类役',
    naipes: '花色类役',
    outros: '其他役',
  },

  yakus: {
    iipeikou: {
      titulo: '一杯口',
      descricao: '同一花色中两组完全相同的顺子。仅限门清。',
    },
    ryanpeikou: {
      titulo: '二杯口',
      descricao: '同一手牌中有两组一杯口。仅限门清。不与七对子复合。',
    },
    pinfu: {
      titulo: '平和',
      descricao:
        '4组顺子 + 雀头，雀头不能是三元牌、场风或自风，并以两面听和牌。其他风牌作雀头可以。仅限门清。',
    },
    'sanshoku-doujun': {
      titulo: '三色同顺',
      descricao: '万子、筒子、索子三种花色中有相同数字的顺子（例：三色的234）。',
      apelidos: ['三色'],
    },
    ittsuu: {
      titulo: '一气通贯',
      descricao: '同一花色的123、456、789。',
      apelidos: ['一通'],
    },
    tanyao: {
      titulo: '断幺九',
      descricao: '只用2到8的数牌。没有幺九牌，也没有字牌。EMA规则下副露也成立（食断）。',
      apelidos: ['断幺'],
    },
    yakuhai: {
      titulo: '役牌',
      descricao: '三元牌、场风或自风的刻子或杠子。每组1番。连风牌（双风）算2番。',
    },
    shousangen: {
      titulo: '小三元',
      descricao: '两组三元牌刻子 + 第三种三元牌作雀头（役牌也另外计番）。',
    },
    daisangen: { titulo: '大三元', descricao: '三种三元牌都是刻子。' },
    shousuushii: { titulo: '小四喜', descricao: '三组风牌刻子 + 第四种风牌作雀头。' },
    daisuushii: { titulo: '大四喜', descricao: '四种风牌都是刻子。' },
    chanta: {
      titulo: '混全带幺九',
      descricao: '每组面子和雀头都含有幺九牌或字牌。至少要有一组顺子。',
      apelidos: ['混全带', '全带'],
    },
    junchan: {
      titulo: '纯全带幺九',
      descricao: '每组面子和雀头都含有1或9。没有字牌。',
      apelidos: ['纯全带'],
    },
    honroutou: {
      titulo: '混老头',
      descricao: '只用幺九牌和字牌（一定与对对和或七对子复合）。',
    },
    chinroutou: { titulo: '清老头', descricao: '只用1和9组成的手牌。' },
    tsuuiisou: { titulo: '字一色', descricao: '只用风牌和三元牌组成的手牌。' },
    kokushi: {
      titulo: '国士无双',
      descricao: '13种幺九牌和字牌各一张 + 其中一种再多一张。仅限门清。',
      apelidos: ['国士'],
    },
    chiitoitsu: {
      titulo: '七对子',
      descricao: '正好7组对子，仅限门清。注意两组相同的对子不算。',
      dica: '起手已有4组对子时值得一试，最好有5组。视手牌而定，有时做对对和更好。',
    },
    toitoi: { titulo: '对对和', descricao: '4组刻子（或杠子）+ 1组雀头。' },
    sanankou: {
      titulo: '三暗刻',
      descricao: '不鸣牌做成的三组刻子（其余部分可以副露）。',
    },
    suuankou: { titulo: '四暗刻', descricao: '不鸣牌做成的四组刻子。仅限门清。' },
    'sanshoku-doukou': { titulo: '三色同刻', descricao: '三种花色中有相同数字的刻子。' },
    sankantsu: { titulo: '三杠子', descricao: '三组杠子，明杠暗杠皆可。' },
    suukantsu: { titulo: '四杠子', descricao: '四组杠子。' },
    honitsu: { titulo: '混一色', descricao: '只有一种花色的数牌，加上字牌。' },
    chinitsu: { titulo: '清一色', descricao: '只有一种花色的数牌，没有字牌。' },
    ryuuiisou: { titulo: '绿一色', descricao: '只用索子的2、3、4、6、8和发。' },
    chuuren: {
      titulo: '九莲宝灯',
      descricao: '同一花色的1112345678999 + 同花色任意一张。仅限门清。',
    },
    riichi: {
      titulo: '立直',
      descricao: '门清听牌时宣言，并押上1,000点。可以获得一发和里宝牌。',
    },
    'double-riichi': {
      titulo: '两立直',
      descricao: '在第一次打牌时立直，且此前没有任何人鸣牌。',
      apelidos: ['双立直'],
    },
    ippatsu: { titulo: '一发', descricao: IPPATSU },
    'menzen-tsumo': {
      titulo: '门前清自摸和',
      descricao: '完全门清的状态下自摸和牌。',
      apelidos: ['门清自摸'],
    },
    haitei: { titulo: '海底摸月', descricao: '自摸牌山的最后一张牌和牌。' },
    houtei: { titulo: '河底捞鱼', descricao: '荣和本局的最后一张打出的牌。' },
    rinshan: { titulo: '岭上开花', descricao: '开杠后用补摸的岭上牌和牌。' },
    chankan: {
      titulo: '抢杠',
      descricao: '其他玩家把牌加到碰上组成杠（加杠）时，荣和那张牌。暗杠只有国士无双可以抢。',
    },
    tenhou: { titulo: '天和', descricao: '庄家用起手牌直接和牌。' },
    chiihou: { titulo: '地和', descricao: '闲家在第一次摸牌时自摸和牌，此前没有任何人鸣牌。' },
    renhou: {
      titulo: '人和',
      descricao: '在自己第一次摸牌之前荣和，此前没有任何人鸣牌。不再叠加其他役和宝牌（EMA）。',
    },
  },

  notaDora:
    '宝牌不是役：只有手牌已经有至少一个役时才加番。指示牌指向下一张牌（9→1、北→东、中→白）。',
  notaKazoe:
    '**累计役满**不是役：役和宝牌加起来达到13番以上的手牌按役满计算。并非所有牌桌都采用；不采用时最多到三倍满。',

  iniciante: [
    { titulo: '必学的1番役', subtitulo: '从这些开始' },
    { titulo: '容易做的2番以上役', subtitulo: '下一步' },
  ],

  ciclosDora: {
    numeros: { titulo: '数牌', detalhe: '加一，9之后回到1。' },
    ventos: { titulo: '风牌', detalhe: '东 → 南 → 西 → 北 → 东' },
    dragoes: { titulo: '三元牌', detalhe: '白 → 发 → 中 → 白' },
  },

  nomesHonras: {
    '1z': '东',
    '2z': '南',
    '3z': '西',
    '4z': '北',
    '5z': '白',
    '6z': '发',
    '7z': '中',
  },

  yakuhai: {
    ventos: { Ton: '东', Nan: '南', Sha: '西', Pei: '北' },
    dragoes: { Haku: '白', Hatsu: '发', Chun: '中' },
    tituloRodada: '场风',
    tituloAssento: '自风',
    textoDragao: '{{dragao}}的刻子或杠子。1番。',
    textoVentoRodada: '{{vento}}（本局场风）的刻子或杠子。1番。',
    textoVentoAssento: '{{vento}}（你的自风）的刻子或杠子。1番。',
    dicaVentoDuploRodada: '这个风同时也是你的自风，同一组刻子算两次（连风牌），合计2番。',
    dicaVentoDuploAssento: '这个风同时也是场风，同一组刻子算两次（连风牌），合计2番。',
  },

  secoes: {
    naipes: {
      titulo: '数牌',
      intro: '1到9的数字牌，共三种花色。',
      aliases: ['数牌', '花色'],
      itens: {
        man: { nome: '万子', apelido: '万', aliases: ['万子'] },
        pin: { nome: '筒子', apelido: '饼', aliases: ['筒子', '饼子'] },
        sou: { nome: '索子', apelido: '条', aliases: ['索子', '条子'] },
        terminais: {
          nome: '幺九牌和中张牌',
          topicos: ['1和9是**老头牌**（幺九牌）。', '2到8是**中张牌**。'],
          aliases: ['幺九牌', '老头牌', '中张牌'],
        },
      },
    },
    honras: {
      titulo: '字牌',
      intro: '没有数字的牌：风牌和三元牌。',
      aliases: ['字牌'],
      itens: {
        ventos: {
          nome: '风牌',
          texto: '东、南、西、北',
          aliases: ['风牌'],
        },
        dragoes: {
          nome: '三元牌',
          texto: '白、发、中',
          aliases: ['三元牌'],
        },
      },
    },
    mao: {
      titulo: '手牌构成',
      intro: '一般的和牌型是4组面子（顺子或刻子）+ 1组雀头。',
      rotulosExemplo: ['顺子', '顺子', '刻子', '刻子', '雀头'],
      itens: {
        sequencia: {
          nome: '顺子',
          texto: '同一花色的三个连续数字（例：筒子的3-4-5）。可以通过吃来组成。',
          aliases: ['顺子'],
        },
        trinca: {
          nome: '刻子',
          texto: '三张相同的牌。可以通过碰来组成。',
          aliases: ['刻子', '暗刻', '明刻'],
        },
        par: { nome: '雀头', texto: '两张相同的牌（对子）。', aliases: ['雀头', '对子', '将牌'] },
      },
    },
    chamadas: {
      titulo: '鸣牌',
      itens: {
        chamada: {
          nome: '鸣牌',
          leitura: '副露',
          texto:
            '用吃、碰或杠拿走其他玩家打出的牌来组成面子。除暗杠外，所有鸣牌都会让手牌变成副露状态。',
          aliases: ['鸣牌', '副露'],
        },
        chi: {
          nome: '吃',
          texto: '拿走上家（左边玩家）打出的牌组成顺子。',
          aliases: ['吃'],
        },
        pon: {
          nome: '碰',
          texto: '拿走任意玩家打出的牌组成刻子。',
          aliases: ['碰'],
        },
        kan: {
          nome: '杠',
          texto:
            '四张相同的牌（杠子）。补摸一张岭上牌，并再翻开一张宝牌指示牌。暗杠（四张都是自己的）不算副露。',
          aliases: ['杠', '杠子', '暗杠', '明杠', '加杠'],
        },
        kuitan: {
          nome: '食断',
          texto: '副露状态下的断幺九。EMA规则允许，但有些牌桌不采用（无食断）。',
          aliases: ['食断'],
        },
      },
    },
    vitoria: {
      titulo: '听牌与和牌',
      itens: {
        tenpai: {
          nome: '听牌',
          texto: '只差一张牌就能完成手牌。',
          aliases: ['听牌'],
        },
        ryanmen: {
          nome: '两面',
          texto: '两面听：两个连续数字，两边任意一张都能完成（3-4听2或5）。',
          aliases: ['两面', '两面听'],
        },
        riichi: {
          nome: '立直',
          texto: '门清时宣言听牌，并押上1,000点。1番。',
          aliases: ['立直'],
        },
        ippatsu: { nome: '一发', aliases: ['一发'] },
        tsumo: { nome: '自摸', texto: '用自己摸到的牌和牌。', aliases: ['自摸'] },
        ron: { nome: '荣和', texto: '用其他玩家打出的牌和牌。', aliases: ['荣和', '点和'] },
        'ron-duplo': {
          nome: '一炮双响',
          texto: '两位玩家同时荣和同一张牌，两人都和牌。放铳者分别向两人支付。',
          topicos: [
            '**截和**：有些牌桌不允许一炮双响，只有一位玩家和牌：从放铳者开始按顺序最先的玩家。',
            '三人同时荣和同一张牌时，很多牌桌判为流局（三家和了）。',
          ],
          aliases: ['一炮双响', '双响', '截和', '头跳'],
        },
        furiten: {
          nome: '振听',
          texto: '如果你已经打出过自己的和牌张，就不能荣和，只能自摸。',
          topicos: [
            '**舍牌振听**：能完成手牌的牌在你自己的舍牌中。',
            '**同巡振听**：你放过了一张能和的牌。持续到你下次打牌。',
            '**立直振听**：立直后放过了一张能和的牌。持续到本局结束。',
          ],
          aliases: ['振听'],
        },
      },
    },
    dora: {
      titulo: '宝牌',
      itens: {
        dora: {
          nome: '宝牌',
          texto: '由指示牌决定的奖励牌。每张1番，但不是役。',
          topicos: [
            '**指示牌**是王牌中翻开的那张牌。',
            '宝牌是按下面顺序的下一张牌（指示牌筒子7 → 宝牌筒子8）。',
          ],
          aliases: ['宝牌', '宝牌指示牌', '指示牌', 'dora'],
        },
        'kan-dora': {
          nome: '杠宝牌',
          texto: '每开一次杠，就多翻开一张指示牌。',
          aliases: ['杠宝牌'],
        },
        'ura-dora': {
          nome: '里宝牌',
          texto: '每张指示牌下面的牌。只有立直后和牌的玩家才能翻开。',
          aliases: ['里宝牌'],
        },
        'aka-dora': {
          nome: '赤宝牌',
          apelido: '红5',
          texto: '每张红5算1张宝牌。只在开启赤宝牌规则时计算。',
          aliases: ['赤宝牌', '红5', '赤5', '红宝牌'],
        },
      },
    },
    pontuacao: {
      titulo: '计分',
      itens: {
        yaku: {
          nome: '役',
          texto: '计分条件。每手牌至少要有一个役才能和牌。',
          aliases: ['役', '役种'],
        },
        han: {
          nome: '番',
          texto: '每个役和宝牌的价值。番越多，点数越高。',
          aliases: ['番', '番数'],
        },
        fu: {
          nome: '符',
          texto: '根据手牌形状（刻子、听牌方式、和牌方式）得到的点。在4番以内调整点数。',
          aliases: ['符', '符数'],
        },
      },
    },
    patamares: {
      titulo: '满贯以上的档位',
      aliases: ['满贯以上'],
      itens: {
        mangan: {
          nome: '满贯',
          texto: '5番，或4番40符以上，或3番70符以上。{{ko}}点（庄家{{oya}}点）。',
          aliases: ['满贯'],
        },
        haneman: {
          nome: '跳满',
          texto: '6或7番。{{ko}}点（庄家{{oya}}点）。',
          aliases: ['跳满'],
        },
        baiman: {
          nome: '倍满',
          texto: '8到10番。{{ko}}点（庄家{{oya}}点）。',
          aliases: ['倍满'],
        },
        sanbaiman: {
          nome: '三倍满',
          texto: '11或12番。{{ko}}点（庄家{{oya}}点）。',
          aliases: ['三倍满'],
        },
        yakuman: {
          nome: '役满',
          texto: '最高档位。{{ko}}点（庄家{{oya}}点）。',
          aliases: ['役满', '累计役满'],
        },
      },
    },
    mesa: {
      titulo: '牌桌',
      itens: {
        oya: {
          nome: '庄家',
          leitura: '亲家',
          texto: '坐庄的玩家，永远是东家。和牌时得1.5倍。和牌或流局时听牌就连庄。',
          aliases: ['庄家', '亲家', '东家'],
        },
        renchan: {
          nome: '连庄',
          texto: '庄家在下一局继续坐庄。庄家和牌或流局时听牌就会连庄。座位风不轮转，本场数增加。',
          aliases: ['连庄'],
        },
        ko: {
          nome: '闲家',
          leitura: '子家',
          texto: '庄家以外的其他三位玩家。',
          aliases: ['闲家', '子家'],
        },
        honba: {
          nome: '本场',
          texto:
            '额外局数的计数。每次连庄或流局加一，闲家和牌时归零。每个本场给下一位和牌者加300点（自摸时每人各付100点）。',
          aliases: ['本场', '积棒'],
        },
        empate: {
          nome: '流局',
          texto: '牌山摸完时没有玩家和牌，本局结束。',
          aliases: ['流局', '荒牌流局'],
        },
        'empate-abortivo': {
          nome: '途中流局',
          texto:
            '牌山摸完前本局作废。庄家继续，本场数增加。EMA规则不采用途中流局，但很多牌桌采用。常见情况：',
          topicos: [
            '**九种九牌**：起手有9种以上不同的幺九牌或字牌。该玩家可以宣布流局。',
            '**四风连打**：第一巡四位玩家打出同一种风牌。',
            '**四家立直**：四位玩家都立直。',
            '**四杠散了**：不同玩家合计开了四次杠。',
            '**三家和了**：三位玩家同时荣和同一张牌。',
          ],
          aliases: ['途中流局', '九种九牌', '四风连打', '四家立直', '四杠散了', '三家和了'],
        },
        chombo: {
          nome: '错和',
          texto: '对严重错误的罚则，例如无役和牌，或在振听时荣和。',
          aliases: ['错和', '诈和'],
        },
      },
    },
    regras: {
      titulo: '规则与组织',
      itens: {
        ema: {
          nome: 'EMA',
          texto:
            '欧洲麻将协会（European Mahjong Association），组织欧洲竞技麻将的机构。发布RCR（Riichi Competition Rules），这套立直麻将规则被日本以外的许多俱乐部作为参考。',
          aliases: ['EMA', 'RCR', '欧洲麻将协会'],
        },
        'm-league': {
          nome: 'M联赛',
          leitura: 'M.League',
          texto:
            '日本的职业立直麻将联赛，创立于2018年。由企业赞助的队伍汇集了多个协会的职业选手，比赛全程直播，配有解说和显示每位选手手牌的镜头。是观看高水平对局的最佳窗口。',
          aliases: ['M联赛', 'M.League'],
        },
      },
    },
  },
}
