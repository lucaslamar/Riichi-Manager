/**
 * Guia Aprender a jogar em japonês: mesmos ids, pedras e respostas do pt-BR
 * (`npm run test:guia` confere). Vocabulário igual ao do app em ja: 刻子, 順子,
 * 雀頭, 鳴き, 親, 子, 王牌, 和了.
 */
import { BASE_PATAMAR } from '@/compartilhado/mahjong/pontuacao'
import { conteudoGuiaBolso } from '@/dominios/calculadora-mao/conteudo/guia-bolso'
import {
  ARTIGO_SUJI,
  criarAuxiliares,
  criarBuscaModulo,
  criarModuloRegras,
  hanYaku,
  trocarReferencias,
  type TopicoRegras,
} from './auxiliares'
import type { ConteudoTutorial, TermoGlossarioGuia, TutorialModule, TutorialPart } from './tipos'

const { pontos, linhaPatamar, grupoYakus, doGlossario, simNao, tabelaYakusLocais } = criarAuxiliares('ja', {
  sim: 'はい',
  nao: 'いいえ',
  cabecalhoYakus: ['役', '条件', '門前', '副露'],
})

const modulos: TutorialModule[] = [
  {
    id: 'pedras',
    number: 1,
    title: '牌',
    cover: 'ゲームで使う136枚の牌を覚えましょう。',
    pages: [
      {
        id: 'naipes',
        number: '1.1',
        title: '3種類の数牌',
        termos: ['naipes', 'man', 'pin', 'sou'],
        blocks: [
          {
            type: 'text',
            md: '牌は全部で**136枚**：34種類が4枚ずつあります。数牌は3種類で、1から9まであります。',
          },
          { type: 'text', md: '**萬子** 萬 • マンズ：漢数字が書かれた牌。' },
          { type: 'hand', mpsz: '123456789m', numbered: true },
          { type: 'text', md: '**筒子** 筒 • ピンズ：1〜9個の丸が描かれた牌。' },
          { type: 'hand', mpsz: '123456789p', numbered: true },
          { type: 'text', md: '**索子** 索 • ソーズ：竹の絵の牌。1は鳥の絵が多いです。' },
          { type: 'hand', mpsz: '123456789s', numbered: true },
        ],
      },
      {
        id: 'honras',
        number: '1.2',
        title: '字牌',
        termos: ['honras', 'ventos', 'dragoes'],
        blocks: [
          { type: 'text', md: '数字のない牌（字牌）です。順子は作れません。' },
          {
            type: 'text',
            md: '**風牌** 風牌：東（トン）、南（ナン）、西（シャー）、北（ペー）。',
          },
          { type: 'hand', mpsz: '1234z' },
          {
            type: 'text',
            md: '**三元牌** 三元牌：白（ハク）、發（ハツ）、中（チュン）。',
          },
          { type: 'hand', mpsz: '567z' },
          {
            type: 'tip',
            md: '読み方は卓でよく耳にしますが、今は気にしなくて大丈夫です。漢字の形がわかれば遊べます。',
          },
        ],
      },
      {
        id: 'nomes',
        number: '1.3',
        title: 'よく聞く呼び名',
        termos: ['terminais', 'aka-dora'],
        blocks: [
          {
            type: 'text',
            md: '- **老頭牌**：数牌の1と9。\n- **中張牌**：2から8の牌。\n- **赤5**（赤ドラ）：各色に1枚ずつある特別な5で、ボーナスがつきます。',
          },
          { type: 'hand', mpsz: '19m 19p 19s', caption: '老頭牌', numbered: true },
          { type: 'hand', mpsz: '0m 0p 0s', caption: '赤5' },
          {
            type: 'tip',
            md: '今のところ、赤5は普通の5として使いましょう。ボーナスについては{{onde:dora}}で説明します。',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '筒子の9は老頭牌と中張牌のどちらですか？',
        hand: '9p',
        options: [{ label: '老頭牌', correct: true }, { label: '中張牌' }],
        answer: '老頭牌です。数牌の1と9が老頭牌で、2から8が中張牌です。',
      },
    ],
  },
  {
    id: 'mesa',
    number: 2,
    title: '卓の準備',
    cover: 'はじめての卓を準備しましょう。',
    pages: [
      {
        id: 'sorteio',
        number: '2.1',
        title: '風を決める',
        termos: ['ventos', 'oya'],
        blocks: [
          {
            type: 'text',
            md: 'まず、全員が風を1つずつ決めます。風で卓の席と、誰から始めるかが決まります。',
          },
          {
            type: 'text',
            md: '- **東**を引いた人が**親**です。親はサイコロを振り、最初に牌を捨てます。\n- ほかの人は親から反時計回りに座ります：東 → 南 → 西 → 北。',
          },
          {
            type: 'image',
            image: 'mesaVentos',
            alt: '上から見た卓と4つの席：東（親）が下、南が右、西が上、北が左。中央の赤い矢印が手番の順を示す：東から南、南から西、西から北、北から東へ。',
            caption:
              '手番は右隣に移ります：東 → 南 → 西 → 北。親が替わるときは東も右隣に移り、南だった人が新しい東になります。',
          },
          {
            type: 'text',
            md: '**決め方**\n- **牌で**：各風の牌を1枚ずつ伏せて混ぜ、全員が1枚ずつ取ります。\n- **アプリで**：風牌抽選なら、牌を分けなくてもすぐに4つの風を決められます。',
          },
          { type: 'appLink', tool: 'sorteador', label: '風牌抽選を開く' },
        ],
      },
      {
        id: 'muro',
        number: '2.2',
        title: '牌を混ぜて山を作る',
        blocks: [
          {
            type: 'steps',
            items: [
              '牌を卓の中央に広げ、全員でよく混ぜます。表になった牌を伏せてから軽く混ぜ、また表にならないようにします。',
              {
                md: '全員が自分の前に、**長さ17枚・高さ2枚**（34枚）の列を作ります。',
                image: 'muroFileira',
                alt: '伏せた牌の17列。各列に2枚ずつ積まれている。',
              },
              {
                md: 'それぞれ自分の山を少し中央に押し出します。4つの山は中央を囲みますが、==くっつける必要はなく==、きれいな正方形でなくても大丈夫です。',
                image: 'muroQuadrado',
                alt: '上から見た図：卓の中央を囲む4つの山。それぞれ各自の前にあり、四隅に隙間がある。東が下、南が右、西が上、北が左。中央の表示盤には東（東）と、各辺にその人の山を開くサイコロの目：東 1・5・9、南 2・6・10、西 3・7・11、北 4・8・12。',
              },
            ],
          },
        ],
      },
      {
        id: 'abertura',
        number: '2.3',
        title: '山を開く',
        termos: ['oya'],
        blocks: [
          {
            type: 'text',
            md: '親が==必ずサイコロを2つ振り==、目を合計します。その数で**どの山を開くか**と、**何列目で切るか**が決まります。切れ目で王牌を分けます。',
          },
          { type: 'heading', text: '1. どの山を開くか' },
          {
            type: 'text',
            md: '親から==反時計回り==に数えます。親が1、親の右の人が2、向かいの人が3、親の左の人が4です。5で親に戻ります。',
          },
          {
            type: 'text',
            md: '- **5か9**：親の山。\n- **2・6・10**：親の右の人の山。\n- **3・7・11**：向かいの人の山。\n- **4・8・12**：親の左の人の山。',
          },
          {
            type: 'tip',
            md: '**表示盤（センターピース）があれば**数えなくて大丈夫です。各辺に、そこに座る人の山を開く数字が書かれています。サイコロの合計を探すだけです。',
          },
          {
            type: 'image',
            image: 'mesaDados',
            alt: '上から見た卓と4つの山。各風の横に数え方の数字：東 1・5・9、南 2・6・10、西 3・7・11、北 4・8・12。中央のサイコロの合計は5で、親である東が強調されている。',
            caption: '例：2 + 3 = 5。一周して親で止まります。',
          },
          { type: 'heading', text: '2. どこで開くか' },
          {
            type: 'text',
            md: '選ばれた山を作った人が、自分の席から見て列を==右から左へ==数えます。右端の列が1です。サイコロの目の数だけ数え、その列のすぐ後ろで山を分けます。そこが==切れ目==です。',
          },
          {
            type: 'image',
            image: 'muroContagem',
            alt: '作った人が正面から見た17列の山。右端の5列に番号：右端が1、左へ進んで5。赤い矢印が右から左へ、5列目のすぐ後ろの切れ目まで伸びている。',
            caption: 'サイコロ5：1列目はあなたの右端で、5列目の後ろで切ります。',
          },
          {
            type: 'image',
            image: 'mesaAbertura',
            alt: '上から見た卓。東の山の列に赤で1から5の番号があり、東に座る人の右端から左へ進み、5列目の後ろで切られている。',
            caption: '同じ数え方を上から見た図（東の山）。',
          },
        ],
      },
      {
        id: 'muro-morto',
        number: '2.4',
        title: '王牌',
        termos: ['dora'],
        blocks: [
          {
            type: 'text',
            md: '==切れ目のすぐ右の7列==（14枚）が**王牌**です。通常はここからツモりません。',
          },
          {
            type: 'image',
            image: 'muroMorto',
            alt: '正面から見た開いた山：左にツモる山、次に切れ目、右に王牌の7列。切れ目から1〜7の番号がある。3列目の上の牌が表になっていて、これがドラ表示牌。',
            caption:
              '山の正面から見て、切れ目の左からツモり、右が王牌です。番号は切れ目から数えます。',
          },
          { type: 'heading', text: 'サイコロの目が7より小さいとき' },
          {
            type: 'text',
            md: '切れ目の右には、サイコロで数えた7未満の列しかありません。==足りない分は右隣の山から補います==。サイコロ5の例なら、東の山に5列、残り2列は南の山からです。',
          },
          {
            type: 'image',
            image: 'muroMortoCurto',
            alt: '上から見た卓。サイコロの合計は5。東の山は5列目の後ろで切られている。斜線と赤い輪郭の王牌がその5列を占め、角を曲がって南の山の最初の2列に続く。表示牌は3列目で、まだ東の山にある。',
            caption: 'サイコロ5：東に5列 + 南に2列。',
          },
          {
            type: 'tip',
            md: '7以上なら王牌は選ばれた山に収まります。2から6なら必ず角を曲がります。',
          },
          { type: 'heading', text: '何のためにあるか' },
          {
            type: 'text',
            md: '牌は136枚で、各4枚です。全部が場に出るなら、出た牌を数えて残りを正確に知ることができます。王牌の14枚はツモに使わないので、どの牌が出てくるかは==誰にも確実にはわかりません==。',
          },
          { type: 'heading', text: 'ドラ表示牌' },
          {
            type: 'text',
            md: '今度はサイコロのときと逆方向です。==切れ目から右へ3列==数え、3列目の上の牌をめくります。これが**ドラ表示牌**で、{{onde:dora}}で説明します。',
          },
          {
            type: 'tip',
            md: '王牌にはほかの使い道もあります。{{onde:kan}}で説明します。',
          },
        ],
      },
      {
        id: 'compra',
        number: '2.5',
        title: '配牌を取る',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                md: '配牌は==切れ目のすぐ左の列==（その山を作った人から見て）から始まり、矢印のように山から山へ==左へ==進みます。王牌は取りません。上から見ると、牌は**時計回り**に取られます。手番の順（反時計回り）とは逆です。',
                image: 'mesaCompra',
                alt: '上から見た卓。東の山が開いている。角の側に赤い輪郭の王牌があり、南の山へ曲がっている。切れ目の反対側から赤い矢印が東の山、次に北の山へ時計回りに進む。',
              },
              '親が最初に取り、次に親の右の人、と続きます。1回に**4枚ずつ**（2列）、全員が12枚になるまで取ります。',
              '全員がさらに**1枚**取って13枚にします。',
              '親は**14枚目**を取り、最初に牌を捨てて始めます。',
            ],
          },
          { type: 'heading', text: 'まとめ：どちらへ数えるか' },
          {
            type: 'text',
            md: 'いつも、山を作った人として山の正面から見ます：\n- **サイコロ**：右端から左へ。\n- **王牌と表示牌**：切れ目から右へ。\n- **ツモ**：切れ目から左へ。',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'サイコロを振り、最初に牌を捨てるのは誰ですか？',
        options: [
          { label: '東の右の人' },
          { label: '東を引いた親', correct: true },
          { label: '北を引いた人' },
        ],
        answer: '東を引いた親です。サイコロを振り、最初に牌を捨てて始めます。',
      },
      {
        type: 'quiz',
        question: '王牌は何のためにありますか？',
        options: [
          { label: '捨てた牌を置くため' },
          { label: '負けた人の牌を分けるため' },
          {
            label: '牌を場から外し、どの牌が出るか誰にも確実にわからないようにするため',
            correct: true,
          },
        ],
        answer:
          '牌を場から外すためです。ツモに使わない牌があるので、残りの牌を正確に数えることはできません。',
      },
      {
        type: 'quiz',
        question: '親は何枚で始めますか？',
        options: [{ label: '13' }, { label: '14', correct: true }, { label: '12' }],
        answer: '14枚です。ほかの人は13枚で、親が14枚目を捨てて始めます。',
      },
      {
        type: 'quiz',
        question: 'サイコロの目は4（1 + 3）でした。切れ目はどの山で、王牌はどこになりますか？',
        options: [
          { label: '北の山で、王牌はすべて北の山に収まる' },
          { label: '北の山：北に4列 + 東の山に3列', correct: true },
          { label: '西の山：西に4列 + 南に3列' },
        ],
        answer:
          '親から反時計回りに数えると、4は親の左の人、つまり北です。北は自分の右端から左へ4列数えて開きます。王牌は4列しか収まらないので、残り3列は北の右隣の山、つまり東の山から補います。',
      },
    ],
  },
  {
    id: 'mao',
    number: 3,
    title: '和了の形',
    cover: '何を作ろうとしているのかを知りましょう。',
    pages: [
      {
        id: 'formula',
        number: '3.1',
        title: '基本形：4面子 + 雀頭',
        blocks: [
          {
            type: 'text',
            md: '和了には**14枚**が必要で、3枚の組を4つと雀頭1つに分けます。',
          },
          { type: 'hand', mpsz: '123m 456p 789s 555z 22s' },
        ],
      },
      {
        id: 'grupos',
        number: '3.2',
        title: '組の種類',
        termos: ['sequencia', 'trinca', 'par'],
        blocks: [
          { type: 'text', md: '**順子**：同じ色の連続した3つの数。' },
          { type: 'hand', mpsz: '345p' },
          { type: 'text', md: '**刻子**：同じ牌3枚。' },
          { type: 'hand', mpsz: '777s 555z' },
          { type: 'text', md: '**雀頭**：同じ牌2枚。' },
          { type: 'hand', mpsz: '22s' },
          {
            type: 'tip',
            md: '順子は一周しません（8-9-1は不可）。字牌（風牌と三元牌）は順子になりません。',
          },
        ],
      },
      {
        id: 'tenpai',
        number: '3.3',
        title: '聴牌：あと1枚',
        termos: ['tenpai'],
        blocks: [
          {
            type: 'text',
            md: '手牌は13枚で、和了のときに14枚目がそろいます。あと1枚の状態が**聴牌**です。そろう牌が**待ち**です。',
          },
          {
            type: 'text',
            md: '手牌を完成した組に分けましょう。==未完成で残った部分==が待ちです。',
          },
          { type: 'heading', text: '両面' },
          {
            type: 'hand',
            mpsz: '234m 567p 789s 11z 45m',
            labels: ['順子', '順子', '順子', '雀頭', '待ち'],
            after: '36m',
            afterLabel: '待ち',
            caption: '4-5は3か6で完成します。最大8枚の、いちばん良い待ちです。',
          },
          { type: 'heading', text: '嵌張' },
          {
            type: 'hand',
            mpsz: '123p 456s 777m 99s 46m',
            labels: ['順子', '順子', '刻子', '雀頭', '待ち'],
            after: '5m',
            afterLabel: '待ち',
            caption: '4-6は真ん中の5でしか完成しません。',
          },
          { type: 'heading', text: '辺張' },
          {
            type: 'hand',
            mpsz: '345m 678p 222s 55z 12m',
            labels: ['順子', '順子', '刻子', '雀頭', '待ち'],
            after: '3m',
            afterLabel: '待ち',
            caption: '1-2は3でしか完成しません。反対側に0はありません。',
          },
          { type: 'heading', text: '双碰' },
          {
            type: 'hand',
            mpsz: '234m 567p 678s 22p 88s',
            labels: ['順子', '順子', '順子', '待ち', '待ち'],
            after: '2p8s',
            afterLabel: '待ち',
            caption: '片方の対子が刻子になり、もう片方が雀頭になります。',
          },
          { type: 'heading', text: '単騎' },
          {
            type: 'hand',
            mpsz: '123m 456m 789p 111z 5s',
            labels: ['順子', '順子', '順子', '刻子', '待ち'],
            after: '5s',
            afterLabel: '待ち',
            caption: '4面子は完成済みで、索子の5の雀頭だけが足りません。',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'この手は聴牌していますか？',
        hand: '234m 567p 11s 345s 78p',
        options: simNao(true),
        answer: 'はい。7-8を完成させる筒子の6か9を待っています。',
      },
    ],
  },
  {
    id: 'turno',
    number: 4,
    title: '手番',
    cover: 'ツモ、打牌、鳴きを覚えましょう。',
    pages: [
      {
        id: 'comprar-descartar',
        number: '4.1',
        title: 'ツモと打牌',
        blocks: [
          {
            type: 'text',
            md: '自分の番には山から1枚ツモり、別の1枚を表向きに捨てます。捨て牌は自分の山と卓の中央の間に、6枚ずつの列で並べ、全員に見えるようにします。手番は右隣の人に移ります。',
          },
          {
            type: 'image',
            image: 'mesaDescartes',
            alt: '上から見た卓：各山の前に6枚の捨て牌の列と2列目の始まり。中央に場風（東）。南の捨て牌の1枚は立直のように横向き。東の右、山の外側に開いたポン：3枚で左端が横向き。',
            caption:
              '捨て牌は各自の前に6枚ずつ並べます。東の右にあるのはポンで、取った牌を横に向けます。',
          },
          {
            type: 'text',
            md: '他家の捨て牌で、その場で組を作ることもできます。これが**鳴き**で、ポンやチーがあります。鳴いた組は自分の右側の卓上に公開します。',
          },
          {
            type: 'tip',
            md: '卓上では、他家から取った牌を**横向き**にして、捨てた人のほうに向けます。どこから来た牌か全員にわかります。',
          },
        ],
      },
      {
        id: 'pon',
        number: '4.2',
        title: 'ポン',
        termos: ['pon'],
        blocks: [
          {
            type: 'text',
            md: '誰かが捨てた牌と同じ牌を2枚持っていたら、「ポン」と言って牌を取り、刻子を卓上に公開します。',
          },
          {
            type: 'text',
            md: '**誰の**捨て牌でもできます。手番はあなたから続くので、牌を1枚捨てます。',
          },
          {
            type: 'melds',
            items: [
              { mpsz: '777s', deLado: 0, caption: '上家（左）から' },
              { mpsz: '777s', deLado: 1, caption: '対面から' },
              { mpsz: '777s', deLado: 2, caption: '下家（右）から' },
            ],
          },
          {
            type: 'text',
            md: 'ポンをすると手は**副露**（開いた手）になります。他家の捨て牌を使っていない手は**門前**です。',
          },
        ],
      },
      {
        id: 'chi',
        number: '4.3',
        title: 'チー',
        termos: ['chi', 'chamada'],
        blocks: [
          {
            type: 'text',
            md: '捨て牌で順子を完成させることもできますが、**上家（左の人）**の捨て牌だけです。「チー」と言って順子を卓上に公開します。',
          },
          {
            type: 'melds',
            items: [
              {
                mpsz: '435p',
                deLado: 0,
                caption: '筒子の4を取ったので、左に横向きで置きます',
              },
            ],
          },
          { type: 'text', md: 'チーをすると手は**副露**になります。' },
        ],
      },
      {
        id: 'prioridade',
        number: '4.4',
        title: '優先順位',
        blocks: [
          {
            type: 'text',
            md: '同じ捨て牌を複数の人が欲しいとき：**ロン > ポン > チー**。',
          },
          {
            type: 'text',
            md: '**ロン**は他家の捨て牌で和了することです。次のページで説明します。',
          },
        ],
      },
      {
        id: 'tsumo-ron',
        number: '4.5',
        title: 'ツモとロン',
        termos: ['tsumo', 'ron'],
        blocks: [
          {
            type: 'text',
            md: '- **ツモ**：自分で引いた牌で手が完成。ほかの全員が払います。\n- **ロン**：他家の捨て牌で手が完成。捨てた人だけが払います。',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '対面が筒子の6を捨てました。あなたは筒子の5と7を持っています。チーできますか？',
        hand: '57p',
        options: simNao(false),
        answer: 'いいえ。チーができるのは上家（左の人）の捨て牌だけです。',
      },
    ],
  },
  {
    id: 'yakus',
    number: 6,
    title: '和了できる手',
    cover: '形だけでは足りません。和了には役が必要です。',
    pages: [
      {
        id: 'sem-yaku',
        number: '6.1',
        title: '役がなければ和了できない',
        termos: ['yaku'],
        blocks: [
          {
            type: 'text',
            md: '4面子と雀頭だけでは足りません。手には少なくとも1つの**役**（得点の条件）が必要です。役がなくても聴牌にはなり、流局のときは聴牌として数えます。ただし和了はできません。',
          },
          { type: 'tip', md: '正式なルールでは、役なしの和了はチョンボ（重大な反則）です。' },
        ],
      },
      {
        id: 'yakus-iniciantes',
        number: '6.2',
        title: 'まず覚えたい役',
        termos: [
          'riichi',
          'yaku:menzen-tsumo',
          'yaku:tanyao',
          'yaku:yakuhai',
          'yaku:pinfu',
          'ryanmen',
          'yaku:iipeikou',
          'yaku:chanta',
          'yaku:toitoi',
          'yaku:chinitsu',
          'yaku:honitsu',
          'yaku:chiitoitsu',
        ],
        blocks: [
          {
            type: 'text',
            md: 'まずこの5つから始めましょう。これだけで多くの手を和了できます。タップすると説明が見られます。',
          },
          {
            type: 'cards',
            items: [
              {
                id: 'riichi',
                title: '立直',
                badge: '門前のみ',
                blocks: [
                  {
                    type: 'text',
                    md: 'いちばんよく使う役です。**門前**で聴牌したら「リーチ」と言い、牌を横向きに捨てます。',
                  },
                  {
                    type: 'text',
                    md: 'これだけで和了できます。宣言したあとは手を変えられません。',
                  },
                ],
              },
              {
                id: 'menzen-tsumo',
                title: '門前清自摸和',
                badge: '門前のみ',
                blocks: [
                  {
                    type: 'text',
                    md: '**門前**のまま、自分で引いた牌（ツモ）で和了すること。',
                  },
                ],
              },
              {
                id: 'tanyao',
                title: '断幺九',
                badge: '副露も可',
                blocks: [
                  {
                    type: 'text',
                    md: '2から8の牌だけ。老頭牌も字牌も使いません。',
                  },
                  { type: 'hand', mpsz: '234m 567m 345p 678s 55s' },
                  {
                    type: 'tip',
                    md: '門前でしか断幺九を認めない卓もあります。遊ぶ前に決めておきましょう。',
                  },
                ],
              },
              {
                id: 'yakuhai',
                title: '役牌',
                badge: '副露も可',
                blocks: [
                  { type: 'text', md: '**三元牌**、**場風**、**自風**の刻子。' },
                  { type: 'hand', mpsz: '123m 456p 789s 555z 22s' },
                  { type: 'heading', text: 'どの風が役になるか' },
                  {
                    type: 'text',
                    md: '各自に**自風**（決めたときに引いた風）があります。卓全体には**場風**があり、東風戦なら東です。',
                  },
                  {
                    type: 'text',
                    md: '- 場風：全員の役になります。\n- 自風：自分だけの役になります。\n- 場風と自風が同じなら==2倍==です。\n- 誰の風でもない風は役になりません。',
                  },
                  {
                    type: 'text',
                    md: '例：東場では、東は全員の役です。**親**にとっては自風でもあるので2倍です。',
                  },
                  {
                    type: 'tip',
                    md: '**副露**でも成立します。三元牌や役のある風をポンすれば、それだけで役がつきます。',
                  },
                ],
              },
              {
                id: 'pinfu',
                title: '平和',
                badge: '門前のみ',
                blocks: [
                  {
                    type: 'text',
                    md: '順子だけで、雀頭が三元牌でも役のある風（自風・場風）でもなく、待ちが両面。',
                  },
                  {
                    type: 'hand',
                    mpsz: '123m 456p 789p 23s 55m',
                    caption: '聴牌の手',
                    after: '1s4s',
                    afterLabel: '待ち',
                  },
                ],
              },
            ],
          },
          { type: 'heading', text: '次のステップ' },
          {
            type: 'text',
            md: 'この5つに慣れたら、次の役も卓でよく出てきます：',
          },
          {
            type: 'cards',
            items: [
              {
                id: 'iipeikou',
                title: '一盃口',
                badge: '門前のみ',
                blocks: [
                  {
                    type: 'text',
                    md: '同じ色の==同じ==順子が2つ。',
                  },
                  { type: 'hand', mpsz: '234m 234m 567p 789s 55p' },
                ],
              },
              {
                id: 'chanta',
                title: '混全帯幺九',
                badge: '副露も可',
                blocks: [
                  {
                    type: 'text',
                    md: 'すべての組**と雀頭**に老頭牌（1か9）か字牌が入っている。順子が1つ以上必要です。',
                  },
                  { type: 'hand', mpsz: '123m 789p 999s 111z 77z' },
                ],
              },
              {
                id: 'toitoi',
                title: '対々和',
                badge: '副露も可',
                blocks: [
                  {
                    type: 'text',
                    md: '刻子（か槓子）と雀頭だけ。==順子なし==。',
                  },
                  { type: 'hand', mpsz: '222m 555p 888s 666z 99m' },
                ],
              },
              {
                id: 'honitsu',
                title: '混一色',
                badge: '副露も可',
                blocks: [
                  {
                    type: 'text',
                    md: '手全体が**1色**と字牌だけ。',
                  },
                  { type: 'hand', mpsz: '123s 456s 789s 555z 11z' },
                ],
              },
              {
                id: 'chinitsu',
                title: '清一色',
                badge: '副露も可',
                blocks: [
                  {
                    type: 'text',
                    md: '手全体が**1色**だけで、==字牌なし==。',
                  },
                  { type: 'hand', mpsz: '123p 456p 345p 789p 99p' },
                ],
              },
              {
                id: 'chiitoitsu',
                title: '七対子',
                badge: '門前のみ',
                blocks: [
                  {
                    type: 'text',
                    md: '**異なる7つの対子**。4面子 + 雀頭の形に従わない唯一の手です。',
                  },
                  { type: 'hand', mpsz: '22m 55m 88p 33s 66s 11z 77z' },
                  {
                    type: 'tip',
                    md: '対子はすべて異なる必要があります。同じ牌4枚は2つの対子になりません。',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'チーをした副露の手で、字牌の刻子はありません。役はありますか？',
        hand: '123m 456p 789s 678p 11m',
        options: simNao(false),
        answer:
          'いいえ。老頭牌があり（断幺九なし）、副露で（立直・門前清自摸和・平和なし）、役牌の刻子もありません。',
      },
    ],
  },
  {
    id: 'pontos',
    number: 8,
    title: '点数',
    cover: '手の価値と支払い方を覚えましょう。',
    coverTip:
      '役ありで1回遊びましたか？ まだなら、点数は数えずに**今1回遊んでから**戻ってきましょう。',
    pages: [
      {
        id: 'palitos',
        number: '8.1',
        title: '点棒',
        termos: ['riichi', 'honba'],
        blocks: [
          {
            type: 'text',
            md: '点数は点棒で数えます。全員**25,000点**で始めます：',
          },
          { type: 'sticks' },
          {
            type: 'text',
            md: '1,000点棒は立直の供託にも使います。100点棒は本場を数えます。',
          },
        ],
      },
      {
        id: 'han-fu',
        number: '8.2',
        title: '翻と符',
        termos: ['han', 'fu'],
        blocks: [
          {
            type: 'text',
            md: '点数は**翻**（役とドラ）と**符**（手の形）で決まります。計算はアプリに任せられます。',
          },
          { type: 'hanFuTutorial' },
          {
            type: 'table',
            headers: ['役', '翻'],
            rows: [
              ['立直', hanYaku('riichi')],
              ['門前清自摸和', hanYaku('menzen-tsumo')],
              ['断幺九', hanYaku('tanyao')],
              ['役牌', `刻子ごとに${hanYaku('yakuhai')}`],
              ['平和', hanYaku('pinfu')],
            ],
          },
          {
            type: 'text',
            md: '役は足し算します。立直 + 断幺九 + 平和 + 門前清自摸和 = **4翻**。',
          },
        ],
      },
      {
        id: 'patamares',
        number: '8.3',
        title: '満貫以上',
        termos: ['patamares', 'mangan', 'oya', 'ko'],
        blocks: [
          {
            type: 'text',
            md: '5翻からは点数が固定の区分になります。**子**は親以外の人です。',
          },
          {
            type: 'table',
            headers: ['区分', '翻', '子', '親'],
            rows: [
              linhaPatamar('満貫', '5', BASE_PATAMAR.mangan),
              linhaPatamar('跳満', '6–7', BASE_PATAMAR.haneman),
              linhaPatamar('倍満', '8–10', BASE_PATAMAR.baiman),
              linhaPatamar('三倍満', '11–12', BASE_PATAMAR.sanbaiman),
              linhaPatamar('役満', '13+', BASE_PATAMAR.yakuman),
            ],
          },
          { type: 'text', md: '親が和了すると点数は**1.5倍**です。' },
          { type: 'tip', md: '3翻や4翻でも、符によって満貫になることがあります。' },
        ],
      },
      {
        id: 'quem-paga',
        number: '8.4',
        title: '誰が払うか',
        termos: ['ron', 'tsumo'],
        blocks: [
          {
            type: 'text',
            md: '- **ロン**：捨てた人が全額払います。\n- **ツモ**：全員が払います。和了者が子なら、親が半分を払い、残りを子2人で分けます。',
          },
          {
            type: 'text',
            md: '和了者は卓上の立直の供託（1本1,000点）も受け取ります。',
          },
        ],
      },
      {
        id: 'riichi-aposta',
        number: '8.5',
        title: '立直の供託',
        termos: ['riichi'],
        blocks: [
          {
            type: 'text',
            md: '点数を数えるときは、立直した人は**1,000点**棒を卓の中央に出します。',
          },
          {
            type: 'text',
            md: '- 立直するには1,000点以上の持ち点が必要です。\n- 雀魂や天鳳では、山の残りが4枚以上でなければなりません。対面のゲームではルールによって違います。\n- 立直宣言牌でロンされたときは、供託は出しません。\n- その局の和了者が卓上の供託を受け取ります。\n- 誰も和了しなければ、供託は次の局まで卓に残ります。',
          },
          {
            type: 'tip',
            md: '立直して和了すると裏ドラも見られます。{{onde:dora}}で説明します。',
          },
        ],
      },
      {
        id: 'honba-empate',
        number: '8.6',
        title: '本場と流局',
        termos: ['honba', 'empate'],
        blocks: [
          {
            type: 'text',
            md: '1本場につき、和了者に300点が加わります。ツモなら各自100点ずつ多く払い、ロンなら捨てた人が300点を払います。この点数は別枠で、満貫などの上限や親の1.5倍の影響を受けません。',
          },
          {
            type: 'text',
            md: '山がなくなって和了者がいなければ、ノーテンの人が聴牌の人に合計3,000点を払います。',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '子が満貫をツモ和了しました。親はいくら払いますか？',
        options: [
          { label: pontos(BASE_PATAMAR.mangan) },
          { label: pontos(BASE_PATAMAR.mangan * 2), correct: true },
          { label: pontos(BASE_PATAMAR.mangan * 4) },
        ],
        answer: `${pontos(BASE_PATAMAR.mangan * 2)}点で、半分です。ほかの2人は${pontos(BASE_PATAMAR.mangan)}点ずつ払います。`,
      },
    ],
  },
  {
    id: 'dora',
    number: 9,
    title: 'ドラ',
    cover: '手の点数を上げるボーナス牌です。',
    pages: [
      {
        id: 'indicador',
        number: '9.1',
        title: '表示牌とドラ',
        termos: ['dora'],
        blocks: [
          {
            type: 'text',
            md: '王牌でめくった牌を覚えていますか？ それが**表示牌**です。表示牌はドラではありません。その次の牌が**ドラ**です。手のドラ1枚につき1翻です。',
          },
          {
            type: 'image',
            image: 'muroMorto',
            alt: '正面から見た開いた山：左にツモる山、切れ目、右に王牌。切れ目から3列目にドラ表示牌がめくられている。',
            caption: '表示牌は王牌でめくったままにします。',
          },
          {
            type: 'hand',
            mpsz: '3m',
            caption: '表示牌：萬子の3',
            after: '4m',
            afterLabel: 'ドラ',
          },
          { type: 'tip', md: 'ドラは役ではありません。役がなければ和了できません。' },
        ],
      },
      {
        id: 'ordem-dora',
        number: '9.2',
        title: '順番',
        termos: ['dora'],
        blocks: [
          {
            type: 'text',
            md: '各牌が次の牌を示します。列の終わりまで行くと、最初に戻ります。2枚の表示牌が同じ牌を示すときは、その牌は手の中の1枚につき2翻になります。',
          },
          { type: 'doraCycles' },
        ],
      },
      {
        id: 'aka-dora',
        number: '9.3',
        title: '赤5',
        termos: ['aka-dora'],
        blocks: [
          {
            type: 'text',
            md: '赤5（赤ドラ）は1枚につき1翻増え、手の中では普通の5として使えます。5がドラでもあるときは、赤5は2翻です。表示牌としてめくられたときは、普通の5として扱います。',
          },
          { type: 'hand', mpsz: '0m 0p 0s' },
          {
            type: 'tip',
            md: '赤5を使わない卓もあります。遊ぶ前に決めておきましょう。',
          },
        ],
      },
      {
        id: 'ura-dora',
        number: '9.4',
        title: '裏ドラ',
        termos: ['ura-dora', 'riichi'],
        blocks: [
          {
            type: 'text',
            md: '**立直**して和了した人は、各ドラ表示牌の下の牌をめくります。これが**裏ドラ**で、和了した人だけに有効な追加の表示牌です。',
          },
          { type: 'tip', md: '立直しなければ裏ドラはありません。立直する理由がまた1つ増えます。' },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '表示牌は中です。ドラはどれですか？',
        hand: '7z',
        options: [
          { label: '白', mpsz: '5z', correct: true },
          { label: '發', mpsz: '6z' },
          { label: '中', mpsz: '7z' },
        ],
        answer: '白です：中 → 白。',
      },
    ],
  },
  {
    id: 'kan',
    number: 10,
    title: 'カン',
    cover: '同じ牌4枚、追加の1枚、そしてドラがもう1つ。',
    pages: [
      {
        id: 'kan',
        number: '10.1',
        title: '3種類のカン',
        termos: ['kan'],
        blocks: [
          { type: 'text', md: '同じ牌4枚です。カンには3つの方法があります：' },
          {
            type: 'text',
            md: '- **明槓**：同じ牌を3枚持っていて、誰かが4枚目を捨てたとき。ポンと同じく誰からでもできます。\n- **暗槓**：4枚とも自分の手にあるとき。両端を伏せて卓上に公開します。\n- **加槓**：ポンした牌の4枚目をツモったとき。横向きの牌の上に重ねます。',
          },
          {
            type: 'melds',
            items: [
              { mpsz: '8888p', deLado: 1, caption: '明槓（対面から）' },
              { mpsz: '1111m', viradas: [0, 3], caption: '暗槓' },
              { mpsz: '7777s', deLado: 0, empilhada: true, caption: '加槓' },
            ],
          },
          {
            type: 'text',
            md: '明槓と加槓をすると手は**副露**になります。手の中の牌だけで作る暗槓なら**門前**のままです。',
          },
          { type: 'tip', md: 'カンの優先順位はポンと同じです。' },
          { type: 'heading', text: '立直中のカン' },
          {
            type: 'text',
            md: '立直のあとでも**暗槓**はできます。ほかの3枚を持っていて、==4枚目を自分で山からツモった==ときです。カンで待ちが変わる場合はできません。',
          },
          {
            type: 'tip',
            md: '他家の捨て牌では**できません**。立直中は手を変えられないので、明槓もポンもできません。',
          },
          { type: 'heading', text: 'カンの危険' },
          {
            type: 'text',
            md: 'カンをするたびに==ドラ表示牌が1枚増え==（カンドラ）、カンをした人だけでなく**全員**に有効です。立直で和了した人は、その下の裏ドラも見られます。ドラの機会がまた増えます。',
          },
          {
            type: 'tip',
            md: 'だからカンの前によく考えましょう。新しいドラで、あなたから和了する人の手が高くなるかもしれません。',
          },
        ],
      },
      {
        id: 'kan-dora',
        number: '10.2',
        title: '嶺上牌とカンドラ',
        termos: ['kan-dora'],
        blocks: [
          {
            type: 'text',
            md: '4枚で1組になると、手の枚数が1枚足りなくなります。カンのあとは王牌から**嶺上牌**を1枚ツモり、新しいドラ表示牌をめくります。それから牌を捨てます。',
          },
          {
            type: 'image',
            image: 'muroMortoKan',
            alt: '正面から見た王牌。切れ目から7列に番号がある。1列目の上の牌が卓の上に1枚だけ置かれている：カンの嶺上牌。3列目にドラ表示牌、4列目にカンドラの表示牌がめくられている。',
            caption: 'カンのあと：嶺上牌は1列目から取り、カンドラは4列目をめくります。',
          },
          {
            type: 'text',
            md: '切れ目の隣の1列目と2列目が**カンの嶺上牌**です。カンをした人は、まず1列目の上の牌を取ります。取るときに山を崩さないよう、この牌を先に卓の上へ下ろしておく卓も多くあります。',
          },
          {
            type: 'text',
            md: 'カンのたびに表示牌を1枚めくります。これが**カンドラ**で、次の列（4列目、次に5列目…）の上の牌です。最初の表示牌と同じ働きをします。',
          },
          {
            type: 'text',
            md: '山が残っていないときはカンできません。嶺上牌を引けないためです。',
          },
          {
            type: 'tip',
            md: 'カンドラをめくるタイミングはルールによって違います。雀魂や天鳳では、暗槓はすぐにめくります。明槓と加槓は、打牌のあとにめくります。',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '暗槓をしました。手は門前のままですか？',
        options: simNao(true),
        answer: 'はい。暗槓は手の中の牌だけで作るので、他家の捨て牌を使っていません。',
      },
    ],
  },
  {
    id: 'fim-partida',
    number: 5,
    title: '対局の終わり',
    cover: '流局、次の親、対局が終わるとき。',
    pages: [
      {
        id: 'empate',
        number: '5.1',
        title: '流局',
        termos: ['empate', 'tenpai'],
        blocks: [
          {
            type: 'text',
            md: '局は**和了者なし**で終わることもあります。==王牌だけが残り==、誰も手を完成させていなければ**流局**です。',
          },
          {
            type: 'text',
            md: '全員が聴牌かどうかを言います。聴牌の人は手を見せます。聴牌でない人は**ノーテン**で、手を伏せたままでかまいません。',
          },
          {
            type: 'tip',
            md: '点数を数えるときは、ノーテンの人が聴牌の人に払います。{{onde:pontos}}の「本場と流局」で説明します。',
          },
        ],
      },
      {
        id: 'proxima-mao',
        number: '5.2',
        title: '次の局',
        termos: ['oya', 'renchan'],
        blocks: [
          {
            type: 'text',
            md: '- 親が和了したか、流局で聴牌していたら、**親を続け**、局を繰り返します（連荘）。\n- そうでなければ、東は次の人に移ります。',
          },
        ],
      },
      {
        id: 'fim',
        number: '5.3',
        title: '東風戦',
        blocks: [
          {
            type: 'text',
            md: 'まずは**東風戦**で遊びましょう。全員が少なくとも1回親になります。最後の親が東を渡すと対局は終わりです。',
          },
          {
            type: 'text',
            md: '最初の対局では点数を数えず、いちばん多く和了した人の勝ちです。点数を数えるようになったら、持ち点の多い人の勝ちで、誰かの点数がマイナスになっても対局は終わります。',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '親が和了しました。次の局の親は誰ですか？',
        options: [
          { label: '同じ人', correct: true },
          { label: '親の右の人' },
          { label: 'その前の局で和了した人' },
        ],
        answer: '同じ人です。親が和了すると親を続け、局を繰り返します。',
      },
      {
        type: 'quiz',
        question: '山がなくなり、誰も和了しませんでした。親はノーテンです。次の局の親は誰ですか？',
        options: [
          { label: '同じ人' },
          { label: '親の右の人', correct: true },
          { label: '聴牌していた人' },
        ],
        answer:
          '親の右の人です。流局で親が続くのは聴牌していたときだけで、そうでなければ東は次の人に移ります。',
      },
    ],
  },
]

const topicosRegras: TopicoRegras[] = [
  {
    id: 'furiten',
    section: 'regras',
    title: '振聴',
    termos: ['furiten'],
    blocks: [
      {
        type: 'text',
        md: '振聴のときはロンできず、ツモでしか和了できません。振聴の原因になった牌だけでなく、==すべての==待ちでロンできません。振聴でロンを宣言すると、ふつうはチョンボです。',
      },
      {
        type: 'text',
        md: '- **捨て牌の振聴**：手を完成させる牌が自分の捨て牌にあります。待ちを変えるまで続きます。\n- **同巡振聴**：手を完成させる牌をロンせずに見逃しました。次の自分の打牌まで続きます。\n- **立直後の振聴**：立直のあと、手を完成させる牌を見逃しました。その局の終わりまで続きます。',
      },
      {
        type: 'tip',
        md: '大事なのは手の形で、役ではありません。役がなくて和了できない牌でも、手を完成させる牌なら振聴になります。',
      },
    ],
  },
  {
    id: 'kuikae',
    section: 'regras',
    title: '喰い替え',
    blocks: [
      {
        type: 'text',
        md: 'チーやポンをした直後の打牌には制限があります。同じ役割の牌と入れ替えるためだけに鳴くことを**喰い替え**といい、禁止です。',
      },
      { type: 'heading', text: '同じ牌（現物喰い替え）' },
      {
        type: 'text',
        md: '鳴いて取った牌と同じ牌は、その巡に切れません。チーでもポンでも同じです。',
      },
      {
        type: 'melds',
        items: [
          {
            mpsz: '555p',
            deLado: 1,
            caption: '筒子の5をポン：手にもう1枚筒子の5があっても、この巡には切れません',
          },
        ],
      },
      { type: 'heading', text: '順子の反対側（スジ喰い替え）' },
      {
        type: 'text',
        md: '隣り合う2枚でチーしたときは、順子の反対側の牌も切れません。それを切ると、同じ順子がずれただけになるからです。',
      },
      {
        type: 'melds',
        items: [
          { mpsz: '234m', deLado: 0, caption: '3-4で萬子の2をチー：萬子の2も5も切れません' },
          { mpsz: '867s', deLado: 0, caption: '6-7で索子の8をチー：索子の8も5も切れません' },
        ],
      },
      {
        type: 'text',
        md: '嵌張（2-4で3）や辺張（1-2で3）のチーは、同じ牌だけが禁止です。反対側がないからです。',
      },
      { type: 'heading', text: 'なぜ禁止なのか' },
      {
        type: 'text',
        md: '鳴きは手を進めるためのものです。喰い替えでは手が進みません。切る牌が同じ面子を完成させる牌だからです。このルールがないと、一発を消したり海底をずらしたりするためだけに鳴けてしまいます。',
      },
      {
        type: 'tip',
        md: '鳴いたあとに切れる牌が禁止の牌しか残らない場合、その鳴きはできません。雀魂や天鳳ではゲームが止めてくれます。対面のゲームで喰い替えをすると、アガリ放棄になります。ツモと打牌は続けますが、その局はもうアガれません。鳴いた牌と同じ牌だけを禁止する古いルールもあるので、始める前に決めておきましょう。',
      },
      {
        type: 'quiz',
        question: '筒子の5-6を持っていて、筒子の4をチーしました。この巡に切れない牌は？',
        hand: '56p',
        options: [
          { label: '筒子の4と7', correct: true },
          { label: '筒子の4だけ' },
          { label: '筒子の4と6' },
        ],
        answer:
          '筒子の4と7です。4は取った牌、7を切ると同じ5-6で5-6-7になり、反対側になるからです。',
      },
    ],
  },
  {
    id: 'lista-yakus',
    section: 'regras',
    title: '役の一覧',
    termos: ['yaku', 'yakuman'],
    blocks: [
      {
        type: 'text',
        md: 'すべての役と、門前・副露それぞれの翻数です。**—** は門前のみ、**Y** は役満です。役をタップすると例が見られます。手を何通りかに読めるときは、点数が一番高い読み方を採ります。役満は通常の役とは複合しません。',
      },
      ...grupoYakus('順子', [
        ['pinfu', '順子だけ、役のない雀頭、両面待ち'],
        ['iipeikou', '同じ色の同じ順子が2つ'],
        ['ryanpeikou', '同じ順子2つが2組'],
        ['sanshoku-doujun', '同じ順子が3色に'],
        ['ittsuu', '同じ色の1-2-3、4-5-6、7-8-9'],
      ]),
      ...grupoYakus('刻子', [
        ['toitoi', '刻子4つと雀頭'],
        ['sanankou', '鳴かずに作った刻子3つ'],
        ['sanshoku-doukou', '同じ刻子が3色に'],
        ['sankantsu', 'カンが3つ'],
        ['chiitoitsu', '異なる対子7つ'],
      ]),
      ...grupoYakus('老頭牌と字牌', [
        ['tanyao', '2から8の牌だけ'],
        ['yakuhai', '三元牌か役のある風の刻子'],
        ['shousangen', '三元牌の刻子2つと残りの雀頭'],
        ['chanta', 'すべての組と雀頭に老頭牌か字牌'],
        ['junchan', 'すべての組と雀頭に老頭牌、字牌なし'],
        ['honroutou', '老頭牌と字牌だけ'],
      ]),
      ...grupoYakus('色', [
        ['honitsu', '1色と字牌だけ'],
        ['chinitsu', '1色だけ、字牌なし'],
      ]),
      ...grupoYakus('その他', [
        ['riichi', '門前で聴牌を宣言'],
        ['double-riichi', '最初の打牌で立直'],
        ['ippatsu', '立直後、次の自分の打牌までに和了（間に鳴きがないこと）'],
        ['menzen-tsumo', '門前でツモ'],
        ['haitei', '山の最後の牌でツモ'],
        ['houtei', '最後の捨て牌でロン'],
        ['rinshan', 'カンの嶺上牌で和了'],
        ['chankan', '他家が加槓した牌でロン'],
      ]),
      ...grupoYakus('役満', [
        ['kokushi', '老頭牌と字牌を1枚ずつ、どれか1枚が重なる'],
        ['suuankou', '鳴かずに作った刻子4つ'],
        ['daisangen', '三元牌の刻子3つ'],
        ['shousuushii', '風牌の刻子3つと残りの雀頭'],
        ['daisuushii', '風牌の刻子4つ'],
        ['tsuuiisou', '字牌だけ'],
        ['chinroutou', '老頭牌だけ'],
        ['ryuuiisou', '緑の牌だけ'],
        ['chuuren', '1色の1-1-1-2-3-4-5-6-7-8-9-9-9と、もう1枚'],
        ['suukantsu', 'カンが4つ'],
        ['tenhou', '親が配牌で和了'],
        ['chiihou', '最初のツモで和了'],
      ]),
      { type: 'tip', md: conteudoGuiaBolso('ja').notaKazoe },
    ],
  },
  {
    id: 'yakus-locais',
    section: 'regras',
    title: 'Local yaku',
    termos: ['yaku', 'yakuman'],
    blocks: [
      {
        type: 'text',
        md: 'Besides the yaku on the list, many tables play with **house rules**: yaku outside the standard rules that change from club to club. So ==agree before playing== which ones count at your table.',
      },
      { type: 'heading', text: 'A few examples' },
      {
        type: 'text',
        md: '- **Renhou**: a non-dealer wins by Ron before their first draw. Depending on the house, it is worth Mangan, Baiman or Yakuman.\n- **Daisharin**: 22334455667788 in Pin. Seven pairs in a ladder, paid as Yakuman.\n- **Paarenchan**: eight wins in a row. The eighth is a Yakuman, as long as the hand has a yaku.',
      },
      { type: 'hand', mpsz: '22334455667788p', caption: 'Daisharin' },
      ...tabelaYakusLocais(),
      {
        type: 'tip',
        md: 'ローカル役の中には和了の状況で決まり、**互いに複合しない**ものがあります。燕返し・槓振り・人和はロンのみ、連開花・東槓和は嶺上ツモのみです。人和は最初のツモの前に起きるので、リーチ・槓振り・マネ満とは複合しません。電卓はすでに選んだものと合わないボタンを無効にし、ポケットガイドには各役の組み合わせが載っています。',
      },
      {
        type: 'tip',
        md: 'To use any of them in the calculator, turn it on in **Calculation rules → Local yaku**. They all start off. The full list, with each value, is in the Local yaku tab of the Pocket guide.',
      },
    ],
  },
  {
    id: 'chombo',
    section: 'chombo-honba',
    title: 'チョンボ',
    termos: ['chombo'],
    blocks: [
      {
        type: 'text',
        md: '取り返しのつかない形で局を壊してしまう重大な反則です。よくある例:\n- 完成していない手、役のない手、振聴で和了を宣言する。\n- 聴牌していないのに立直する。流局して手を見せるときに分かります。\n- 立直のあと、待ちが変わる暗槓をする。\n- 山を崩す、または誤って手を倒して見せる。',
      },
      {
        type: 'text',
        md: 'その局は無効になり、同じ本場でやり直します。その局で立直した人は供託を返してもらいます。よくある罰則は満貫ツモ分の支払いです。子なら親に4,000点、ほかの子に2,000点ずつ払います。親なら全員に4,000点ずつ払います。大会ではもっと重いことが多く、気軽な卓では取らないこともあります。遊ぶ前に決めておきましょう。',
      },
    ],
  },
  {
    id: 'honba',
    section: 'chombo-honba',
    title: '本場',
    termos: ['honba'],
    blocks: [
      {
        type: 'text',
        md: '親が和了したときと、和了者なしで局が終わったときに、**本場**が1つ増えます。親が流れても本場は残ります。親は100点棒を卓に置いて数を示します。子が和了すると0に戻ります。',
      },
      {
        type: 'tip',
        md: '本場は次の和了を高くします。いくらかは{{onde:pontos}}で見ます。',
      },
    ],
  },
  {
    id: 'hanchan',
    section: 'regras',
    title: '半荘：東場と南場',
    blocks: [
      {
        type: 'text',
        md: 'クラブや大会の標準的な対局です。東場で全員が親をしたら**南場**に入り、もう一度全員が親になります。',
      },
      {
        type: 'text',
        md: '南場では場風が南になります。東風戦の2倍の長さで、点数を取り戻す時間も増えます。',
      },
      {
        type: 'tip',
        md: '**誰も30,000点に届かないときは？** 雀魂や天鳳など多くの卓では、誰かが30,000点を超えるまで**西場**に続きます。EMAルールでは、南場の終わりで必ず終了します。',
      },
    ],
  },
  {
    id: 'sanma',
    section: 'regras',
    title: "三麻：3人打ち",
    blocks: [
      { type: 'text', md: "**三麻**は3人で打つリーチ麻雀で、日本や雀魂でよく遊ばれています。ルールは同じで、違いは下のとおりです。" },
      { type: 'heading', text: "牌" },
      { type: 'text', md: "**萬子の2〜8**を抜き、108枚で遊びます。萬子は1と9だけが残ります。赤5は筒子と索子だけです。" },
      { type: 'hand', mpsz: '19m', caption: "萬子はこれだけ残る" },
      { type: 'heading', text: "卓と鳴き" },
      { type: 'text', md: "- 席は東・南・西だけです。\n- ポンとカンはできます。==チーだけはありません==。\n- ドラ表示牌が1mならドラは9m、9mならドラは1mです。\n- 四風連打、四家立直、三家和の流局はありません。九種九牌はあります。" },
      { type: 'heading', text: "北抜き" },
      { type: 'text', md: "手に北があれば**北抜き**ができます。北を手の横に置き、嶺上から1枚補充します。北1枚につき**ドラ1**（抜きドラ）です。鳴きではないので門前のままで、断幺九も崩れません。ドラ表示牌が西なら、北1枚で2ドラです。" },
      { type: 'hand', mpsz: '4z', caption: "抜いた北1枚でドラ1" },
      { type: 'heading', text: "役" },
      { type: 'text', md: "- **三色同順**と萬子の**一気通貫**はできません。\n- 1mと9mがあるので、国士無双・清老頭・三色同刻はできます。\n- 北抜きのあとは天和・地和になりません。北抜きの補充牌で和了ると嶺上開花です。\n- ふつう、手の中の北は役牌ではありません。" },
      { type: 'heading', text: "支払い" },
      { type: 'text', md: "ロンは4人打ちと同じです。ツモは2人だけが払います。よくある**ツモ損**では北家の分がなくなり、子の満貫は8,000ではなく6,000です。北家の分を2人で分ける卓もあります。ノーテン罰符は3,000ではなく2,000です。" },
      { type: 'tip', md: "手役計算機・符計算・対局・大会の設定で3人を選ぶと、アプリが三麻として計算します。" },
    ],
  },
  {
    id: 'cinco-blocos',
    section: 'estrategia',
    title: '5ブロック',
    termos: ['par', 'trinca', 'sequencia'],
    blocks: [
      {
        type: 'text',
        md: '完成形は**5ブロック**です：4面子と雀頭。だから手を==5ブロック==に保ち、それぞれ完成または完成間近にすると早く進みます。',
      },
      {
        type: 'text',
        md: 'ブロックとは、対子、刻子、順子、または完成間近の組（3枚目を待つ2枚）のことです。',
      },
      {
        type: 'hand',
        mpsz: '55p 777s 345m 68p',
        labels: ['対子', '刻子', '順子', '完成間近'],
        caption: '4種類のブロック',
      },
      { type: 'tip', md: '七対子と国士無双には当てはまりません。' },
      { type: 'heading', text: '例' },
      {
        type: 'hand',
        mpsz: '345m 24m 55p 46p 778s 12s',
        labels: ['順子', '嵌張', '対子', '嵌張', '完成間近', '辺張'],
      },
      {
        type: 'text',
        md: '5つの場所に**6ブロック**あるので、1つ外します。どれでしょう？',
      },
      {
        type: 'text',
        md: '- **345mと55p**は完成しているので残します。\n- **778s**は索子の6・7・9を受けられるので優秀で、残します。\n- **24mと46p**は嵌張（3mと5p）ですが、5m、または3pか7pが来れば両面になります。\n- **12s**は辺張で3sでしか完成しません。==最悪のブロック==です。',
      },
      {
        type: 'hand',
        mpsz: '12s',
        caption: '最悪のブロックを崩します。まず索子の1から',
        after: '3s',
        afterLabel: '待ちはこれだけ',
      },
    ],
  },
  {
    id: 'eficiencia',
    section: 'estrategia',
    title: '序盤の打牌',
    termos: ['tenpai'],
    blocks: [
      {
        type: 'text',
        md: '牌効率とは、**受け入れ枚数の多い**形を残して、より早く聴牌することです。',
      },
      {
        type: 'text',
        md: '==孤立牌==（対子も同じ色の隣の牌もない牌）は、次の順に捨てます：',
      },
      { type: 'hand', mpsz: '234z', caption: '1. 自風でも場風でもない風牌' },
      { type: 'hand', mpsz: '19m 19p 19s', caption: '2. 老頭牌（1と9）' },
      { type: 'hand', mpsz: '567z', caption: '3. 三元牌' },
      { type: 'hand', mpsz: '1z', caption: '4. 最後に自風と場風' },
      {
        type: 'text',
        md: 'どの風が役になるかは{{onde:yakus}}の役牌で説明しています。東場では、**親**は東を最後まで残します。親には2倍の価値があるからです。ほかの人にとって、東は三元牌と同じ価値です。',
      },
      {
        type: 'tip',
        md: '役のある字牌をいつまでも持ち続けないでください。数巡で対子にならなければ早めに捨てましょう。あとになると、他家の待ちそのものになるかもしれません。',
      },
    ],
  },
  {
    id: 'ordem-muda',
    section: 'estrategia',
    title: '順番が変わるとき',
    termos: ['par'],
    blocks: [
      { type: 'heading', text: '対子は孤立牌ではない' },
      {
        type: 'hand',
        mpsz: '33z 99m',
        caption: '役のない風の対子と老頭牌の対子：残します',
      },
      {
        type: 'text',
        md: '役のない風の対子は手の雀頭になれます（平和でも）。老頭牌の対子も残します。',
      },
      { type: 'heading', text: '隣のある老頭牌は孤立していない' },
      {
        type: 'hand',
        mpsz: '12p 13s',
        caption: '1と2、または1と3：すでに組の半分です',
      },
      { type: 'heading', text: '1と4' },
      { type: 'hand', mpsz: '14p', caption: '1と4（または9と6）：1を捨てます' },
      {
        type: 'text',
        md: '同じ色の4があると、1はあまり役に立ちません。1に合う2と3は、==4のほうにうまく合う==からです。',
      },
      { type: 'heading', text: 'その他' },
      {
        type: 'text',
        md: '- **すでに捨て牌に出た字牌**は価値が下がります。対子になる残り枚数が減るからです。\n- **混一色や混全帯幺九のような役**を狙うならすべて変わります。字牌や老頭牌の価値が上がることもあります。',
      },
    ],
  },
  {
    id: 'contagem-pedras',
    section: 'estrategia',
    title: '受け入れ枚数',
    termos: ['ryanmen'],
    blocks: [
      {
        type: 'text',
        md: 'なぜこの順番なのでしょう？ 孤立牌を対子か組の半分にする牌の枚数を数えます。枚数が多いほど、残す価値があります。',
      },
      {
        type: 'table',
        headers: ['孤立牌', '役立つ牌の枚数'],
        rows: [
          ['字牌', '3（対子のみ）'],
          ['1と9', '11'],
          ['2と8', '15'],
          ['3〜7', '19'],
        ],
      },
      {
        type: 'hand',
        mpsz: '1p',
        caption: '孤立した筒子の1：対子、2、3が役立ちます',
        after: '1p2p3p',
        afterLabel: '役立つ',
      },
      {
        type: 'hand',
        mpsz: '5p',
        caption: '孤立した筒子の5：対子と3〜7が役立ちます',
        after: '3p4p5p6p7p',
        afterLabel: '役立つ',
      },
      {
        type: 'tip',
        md: '枚数だけなら：3〜7 > 2と8 > 1と9 > 字牌。字牌の順番を上げるのは、その字牌がもたらす役です。',
      },
      { type: 'heading', text: '両面待ちを選ぶ' },
      {
        type: 'text',
        md: '使える枚数を数えましょう。各牌は4枚あります。',
      },
      {
        type: 'hand',
        mpsz: '23m',
        caption: '両面：最大8枚',
        after: '14m',
        afterLabel: '待ち',
      },
      {
        type: 'hand',
        mpsz: '13m',
        caption: '嵌張：最大4枚',
        after: '2m',
        afterLabel: '待ち',
      },
      {
        type: 'hand',
        mpsz: '12m',
        caption: '辺張：最大4枚',
        after: '3m',
        afterLabel: '待ち',
      },
    ],
  },
  {
    id: 'quando-defender',
    section: 'estrategia',
    title: '攻めるか守るか',
    termos: ['tenpai', 'riichi'],
    blocks: [
      {
        type: 'text',
        md: '誰かが立直したら、自分の手を見ましょう。**向聴**（シャンテン）は聴牌までの距離です。1向聴ならあと1枚、2向聴ならあと2枚です。',
      },
      {
        type: 'hand',
        mpsz: '234m 567p 11s 345s 78p',
        caption: '聴牌：筒子の6か9待ち',
      },
      {
        type: 'hand',
        mpsz: '234m 567p 11s 34s 78p 9m',
        caption: '1向聴：聴牌まであと1枚',
      },
      {
        type: 'text',
        md: '- **聴牌**：攻める価値があることが多く、親ならなおさらです。手の価値にもよります。\n- **1向聴**：まだ受け入れが多いか、リスクに見合う手かを考えましょう。\n- **2向聴以上**：==守りましょう==。',
      },
      { type: 'heading', text: '考えること' },
      {
        type: 'text',
        md: '- ドラは何枚見えていますか？\n- 聴牌している人は親ですか？ 親なら1.5倍です。\n- 自分の手の価値はどれくらいですか？\n- 点差はどうですか？\n- 対局の終わりまであと何局ですか？',
      },
    ],
  },
  {
    id: 'defesa',
    section: 'estrategia',
    title: '守備：現物',
    termos: ['riichi', 'furiten'],
    blocks: [
      {
        type: 'text',
        md: '守備とは、立直した人の待ちである==可能性がいちばん低い==牌を捨てることです。',
      },
      {
        type: 'text',
        md: 'すべての基本は**振聴**です。待ちの牌の==どれか1つ==でも自分の捨て牌にあれば、その人はどの待ちでもロンできません。',
      },
      {
        type: 'hand',
        mpsz: '45s',
        caption: '索子の4-5で待っていて、すでに3を捨てていたら…',
        after: '3s6s',
        afterLabel: '両方とも振聴',
      },
      { type: 'heading', text: '現物：その人の捨て牌' },
      {
        type: 'text',
        md: '立直した人が==すでに捨てた==牌は、その人に対して100%安全です。その牌が待ちなら振聴で、ロンできないからです。',
      },
      {
        type: 'hand',
        mpsz: '9m 2z 7p 3s',
        caption: 'その人の捨て牌：すべてその人に安全',
      },
      {
        type: 'tip',
        md: '100%安全なのは現物だけです。筋や壁などは何も保証しませんが、適当な牌よりずっと安全です。',
      },
      {
        type: 'text',
        md: '**迷ったら**：まず現物、次に2〜3枚出た字牌、次に筋。弱い手を降りるのは良いプレイです。',
      },
    ],
  },
  {
    id: 'suji',
    section: 'estrategia',
    title: '守備：筋',
    termos: ['furiten', 'ryanmen'],
    blocks: [
      {
        type: 'text',
        md: '立直した人の捨て牌から、より安全な牌がわかります。4を捨てていれば、同じ色の==1と7==がより安全になります。',
      },
      {
        type: 'text',
        md: 'この3つ違いの数（1-4-7、2-5-8、3-6-9）を**筋**と呼びます。いちばん多い両面待ちに対して効果があります。',
      },
      { type: 'heading', text: 'なぜ安全か' },
      {
        type: 'text',
        md: 'その人は**筒子の5**を捨てました。筒子の3-4や6-7で待っていれば、5も待ちの1つなので振聴になります。だから次の2つの形では==待っていません==：',
      },
      {
        type: 'hand',
        mpsz: '34p',
        caption: '3-4なら2か5待ち：ありえません',
        after: '2p5p',
        afterLabel: '待ち',
      },
      {
        type: 'hand',
        mpsz: '67p',
        caption: '6-7なら5か8待ち：ありえません',
        after: '5p8p',
        afterLabel: '待ち',
      },
      {
        type: 'text',
        md: 'だから**筒子の2と8**がより安全になります。これが5の筋です。',
      },
      { type: 'heading', text: '3つの基準' },
      {
        type: 'text',
        md: '4、5、6が基準になるのは、それぞれ==2つ==の両面待ちを消すからです。このどれかを捨てていれば、==その筋を捨てる==のは安全です：',
      },
      {
        type: 'hand',
        mpsz: '4p',
        caption: '4を捨てた：1と7を低いリスクで切れます',
        after: '1p7p',
        afterLabel: 'より安全',
      },
      {
        type: 'hand',
        mpsz: '5p',
        caption: '5を捨てた：2と8がより安全',
        after: '2p8p',
        afterLabel: 'より安全',
      },
      {
        type: 'hand',
        mpsz: '6p',
        caption: '6を捨てた：3と9がより安全',
        after: '3p9p',
        afterLabel: 'より安全',
      },
      { type: 'heading', text: '筋で防げないもの' },
      {
        type: 'hand',
        mpsz: '46p',
        caption: '嵌張：2と8が捨てられていても、4-6は5を待てます',
        after: '5p',
        afterLabel: '待ち',
      },
      {
        type: 'text',
        md: '筋は嵌張、辺張（1-2で3待ち）、単騎、双碰には効きません。',
      },
      {
        type: 'tip',
        md: 'まさにそこに**筋引っかけ**があります。ルールを知っている人は、わざと筋で待つことができます。片筋のあとで説明します。',
      },
      { type: 'heading', text: '筋にも差がある' },
      {
        type: 'text',
        md: '- **1と9**：いちばん安全。単騎か双碰でしか当たりません。\n- **2と8**：嵌張でも当たります（1-3で2待ち）。\n- **3と7**：いちばん危険。嵌張と辺張でも当たります（1-2で3待ち）。',
      },
      {
        type: 'text',
        md: '==立直宣言牌==の筋には注意しましょう。1-3-5から5を切って立直すると、2待ちが残ります。5の筋なので安全に見えますが、当たります。1と9はこの心配がありません。',
      },
      {
        type: 'tip',
        md: '筋がたくさん通っているほど、残りの牌は危険になります。両面待ちなら、まだ通っていない筋のどれかが待ちだからです。',
      },
    ],
  },
  {
    id: 'meio-suji',
    section: 'estrategia',
    title: '守備：片筋と中筋',
    termos: ['ryanmen'],
    blocks: [
      { type: 'heading', text: '片筋' },
      {
        type: 'hand',
        mpsz: '8m',
        caption: '8だけ捨てた：5は少しだけ安全',
        after: '5m',
        afterLabel: '半分安全',
      },
      {
        type: 'text',
        md: '8は6-7（5か8待ち）を消しますが、3-4は消しません。まだ3-4で5を待てます：',
      },
      {
        type: 'hand',
        mpsz: '34m',
        caption: 'まだありえる：2か5待ち',
        after: '2m5m',
        afterLabel: '待ち',
      },
      {
        type: 'text',
        md: 'だから5は**片筋**にすぎません。何もないよりは安全ですが、本当の筋ほどではありません。',
      },
      { type: 'heading', text: '中筋' },
      {
        type: 'hand',
        mpsz: '2s8s',
        caption: '2と8を捨てた：5は筋と同じくらい安全',
        after: '5s',
        afterLabel: 'より安全',
      },
      {
        type: 'text',
        md: '2**と**8が捨てられていれば、3-4も6-7もありえません。5は両側から守られ、==本当の筋==と同じです。4（1と7）と6（3と9）も同様です。',
      },
    ],
  },
  {
    id: 'armadilha-suji',
    section: 'estrategia',
    title: '攻撃：筋引っかけ',
    termos: ['riichi', 'furiten'],
    blocks: [
      {
        type: 'text',
        md: '今度は卓の反対側です。筋で守る人は、あなたが4を捨てれば1と7は安全だと考えます。**筋引っかけ**とは、筋で防げない形で==まさにその筋を待つ==ことです。',
      },
      { type: 'heading', text: '作り方' },
      {
        type: 'hand',
        mpsz: '4m 68m',
        caption: '萬子の4と6-8を持っています',
      },
      {
        type: 'steps',
        items: [
          '**おとりを捨てる**：萬子の4。他家には萬子の1と7が安全に見えます。',
          '**嵌張**の待ちを残す：6-8は7を待ちます。捨てた4の筋です。',
          '筋で守る人が安全だと思って7を捨てたら、ロンです。',
        ],
      },
      {
        type: 'hand',
        mpsz: '68m',
        caption: '7待ち。捨てた4のおかげで安全に見えます',
        after: '7m',
        afterLabel: '待ち',
      },
      { type: 'heading', text: 'ほかに使える形' },
      {
        type: 'hand',
        mpsz: '89m',
        caption: '辺張：8-9は7待ち',
        after: '7m',
        afterLabel: '待ち',
      },
      {
        type: 'hand',
        mpsz: '11m 55p',
        caption: '双碰：1（4の筋）か筒子の5待ち',
        after: '1m5p',
        afterLabel: '待ち',
      },
      {
        type: 'text',
        md: '==使えない==のは両面待ちです。4を捨てていると、5-6の4・7待ちは**振聴**になります。4が自分の捨て牌にあるからです。',
      },
      {
        type: 'hand',
        mpsz: '56m',
        caption: '振聴：4は待ちの1つで、すでに自分の捨て牌にあります',
        after: '4m7m',
        afterLabel: '使えない',
      },
      { type: 'heading', text: 'いちばん強いおとり' },
      {
        type: 'text',
        md: '==おとりそのもので立直する==ことです。全員が立直宣言牌を見て、その筋を信じます。早く捨てたおとりも効果があります。外側が加わり、外側の牌がさらに安全に見えるからです。',
      },
      { type: 'heading', text: '注意点' },
      {
        type: 'text',
        md: '- 嵌張や辺張の受け入れは、両面（最大8枚）より**少なく**（最大4枚）なります。引っかけに価値があるときだけ変えましょう。\n- 効くのは**筋で守る人**に対してです。初心者はあなたの捨て牌を読まずに捨てますし、上級者は立直の近くの筋を疑います。\n- やりすぎは禁物です。いつも引っかけていると、他家はあなたの筋を信じなくなります。',
      },
    ],
  },
  {
    id: 'kabe',
    section: 'estrategia',
    title: '守備：壁',
    termos: ['ryanmen'],
    blocks: [
      {
        type: 'text',
        md: '**壁**は、ある牌の4枚がどこにあるかを見ることです：捨て牌、鳴き、ドラ表示牌、自分の手。==4枚すべて見えている==なら、その牌が必要な組は誰も持てません。',
      },
      {
        type: 'hand',
        mpsz: '3333p',
        caption: '筒子の3が4枚とも見えています',
      },
      {
        type: 'hand',
        mpsz: '23p 34p 13p',
        caption: 'どれもありえません。すべて3が必要です',
      },
      {
        type: 'hand',
        mpsz: '3p',
        caption: '壁の向こう側',
        after: '1p2p',
        afterLabel: 'より安全',
      },
      {
        type: 'tip',
        md: '壁は牌を100%安全にはしません。単騎や双碰で待たれることはあります。それでも適当な牌よりずっと安全です。',
      },
      { type: 'heading', text: 'どの牌がより安全になるか' },
      {
        type: 'table',
        headers: ['4枚見えている牌', 'より安全な牌'],
        rows: [
          ['2', '1'],
          ['3', '1と2'],
          ['4', '2と3'],
          ['5', '3と7'],
          ['6', '7と8'],
          ['7', '8と9'],
          ['8', '9'],
        ],
      },
      {
        type: 'text',
        md: '2、3、4なら、==小さいほう==の2つの牌がより安全です。6、7、8なら、==大きいほう==の2つです。5なら3と7です。',
      },
      {
        type: 'hand',
        mpsz: '1111s',
        caption: '老頭牌：4枚見えていても何も守りません',
      },
      { type: 'heading', text: 'ノーチャンスとワンチャンス' },
      {
        type: 'hand',
        mpsz: '6666m',
        caption: 'ノーチャンス：4枚見えている',
      },
      {
        type: 'hand',
        mpsz: '666m',
        caption: 'ワンチャンス：4枚中3枚見えている',
      },
      {
        type: 'text',
        md: '- **ノーチャンス**：その牌を使う両面待ちはありえず、嵌張にも有効です。筋と同じか、それ以上に安全です。\n- **ワンチャンス**：最後の1枚を誰かが持っている可能性は低いですが、ありえます。序盤と中盤に価値が高く、終盤には最後の1枚が誰かの手にあるかもしれません。',
      },
    ],
  },
  {
    id: 'sotogawa',
    section: 'estrategia',
    title: '守備：外側',
    termos: ['riichi'],
    blocks: [
      {
        type: 'text',
        md: '**外側**とは外の部分のことです。中ほどの牌を==ごく早く==（1段目で）捨てた人は、その牌と端の間の牌をおそらく持っていません。持っていれば、その牌は役に立つはずだからです。',
      },
      {
        type: 'hand',
        mpsz: '233m 334m',
        caption: 'これらを持っていれば、萬子の3を早く切りません',
      },
      {
        type: 'text',
        md: '切ったなら、おそらくすでに組を完成させています。==端に向かって==2つ先までの牌が少し安全になります：',
      },
      {
        type: 'hand',
        mpsz: '3m',
        caption: '3を早く切った：1と2（外側）が少し安全',
        after: '1m2m',
        afterLabel: 'より安全',
      },
      {
        type: 'table',
        headers: ['早く切った牌', '外側'],
        rows: [
          ['2', '1'],
          ['3', '1と2'],
          ['4', '2と3'],
          ['5', '3と7'],
          ['6', '7と8'],
          ['7', '8と9'],
          ['8', '9'],
        ],
      },
      {
        type: 'text',
        md: '- 上手な人に対して効果的です。この考え方は、相手が効率よく切ることを前提にしています。\n- 外側**かつ**筋の牌はより安全です。\n- 立直宣言牌には、早くても当てはまりません。',
      },
      {
        type: 'hand',
        mpsz: '3p5p',
        caption: '3と5を切った：2は3の外側で5の筋',
        after: '2p',
        afterLabel: 'かなり安全',
      },
    ],
  },
  {
    id: 'matagi-suji',
    section: 'estrategia',
    title: '守備：跨ぎ筋',
    termos: ['riichi'],
    blocks: [
      {
        type: 'text',
        md: '**跨ぎ筋**は外側の逆で、==いちばん危険な==牌を示します。終盤の捨て牌、特に立直宣言牌を見ます。',
      },
      {
        type: 'hand',
        mpsz: '3m',
        caption: '萬子の3を切って立直',
      },
      {
        type: 'hand',
        mpsz: '233m 334m',
        caption: 'これらの形から切ったのかもしれません',
      },
      {
        type: 'hand',
        mpsz: '23m 34m',
        caption: '手には2-3か3-4が残ります',
      },
      {
        type: 'hand',
        mpsz: '3m',
        caption: 'だから可能性が高い待ちは1-4と2-5',
        after: '1m4m2m5m',
        afterLabel: 'いちばん危険',
      },
      {
        type: 'text',
        md: 'どの牌でも同じです。危険なのは、その牌を==跨ぐ==両面待ちです。',
      },
      {
        type: 'tip',
        md: '跨ぎ筋を暗記する必要はありません。守備の順番は、現物、次に筋と壁、次に外側です。跨ぎ筋は、攻めるか降りるかを決める助けになります。',
      },
      {
        type: 'text',
        md: `さらに詳しく：[Suji in mahjong（NPMahjong）](${ARTIGO_SUJI})（英語）。`,
      },
    ],
  },
]

const moduloRegras = criarModuloRegras(topicosRegras)
const modulo = criarBuscaModulo(modulos)

const tutorialParts: TutorialPart[] = [
  {
    id: 'primeiras-partidas',
    number: 1,
    title: 'はじめての対局',
    cover: 'はじめての対局に必要なことだけ。役も点数計算もまだ使いません。',
    modules: ['pedras', 'mesa', 'mao', 'turno', 'fim-partida'].map(modulo),
  },
  {
    id: 'ir-alem',
    number: 2,
    title: 'さらに先へ',
    cover:
      '役、チョンボ、本場：点数はまだ数えずに、本当のゲームのルールを。',
    milestone: {
      title: 'もう遊べます！',
      md: '先に進む前に、==1回遊びましょう==（東風戦）。今は役なし・点数なしで、手を完成させた人の勝ちです。東は今見たとおりに移ります。\nここまでが**基本**です。本当のゲームはさらに続き、次のモジュールで残りを説明します。',
    },
    modules: [
      modulo('yakus'),
      moduloRegras('chombo-honba', 7, 'チョンボと本場', '手を無効にするミスと、繰り返される局。'),
    ],
  },
  {
    id: 'pontos-parte',
    number: 3,
    title: '点数',
    cover: '手の値段を、ドラとカンも含めて。',
    milestone: {
      title: 'もう一度遊びましょう！',
      md: '点数に進む前に、役ありで==1回遊びましょう==。点数はまだ数えず、誰が和了したかを毎局メモして、和了の多い人の勝ちにします。',
    },
    modules: ['pontos', 'dora', 'kan'].map(modulo),
  },
  {
    id: 'aprofundando',
    number: 4,
    title: 'もっと深く',
    cover:
      'どの対局にも関わるその他のルール。',
    modules: [
      moduloRegras('regras', 11, 'その他のルール', 'これらもゲームの一部です。'),
    ],
  },
  {
    id: 'estrategia-parte',
    number: 5,
    title: '戦略',
    cover: '上達のために：何を切るか、いつ守るか。',
    modules: [
      moduloRegras('estrategia', 12, '戦略', '最初の対局のあとに、もっと上手に打つために。', [
        {
          type: 'quiz',
          question: '手に6ブロックあります。最初に崩すのはどれですか？',
          hand: '345m 24m 55p 46p 778s 12s',
          options: [
            { label: '索子の1-2', mpsz: '12s', correct: true },
            { label: '萬子の2-4', mpsz: '24m' },
            { label: '索子の7-7-8', mpsz: '778s' },
          ],
          answer:
            '索子の1-2です。辺張で、索子の3でしか完成しません。萬子の2-4は両面になれますし、7-7-8は3種類の牌を受けられます。',
        },
        {
          type: 'quiz',
          question: 'ツモったあと、捨てる牌を選びます。最初に切るのはどれですか？',
          hand: '234m 9m 55p 678p 45s 79s 4z',
          options: [
            { label: '北', mpsz: '4z', correct: true },
            { label: '萬子の9', mpsz: '9m' },
            { label: '索子の7', mpsz: '7s' },
          ],
          answer:
            '北です（自風でも場風でもなければ）。孤立していて対子にしかならず、役にもなりません。萬子の9は7-8-9になれますし、索子の7-9は8を待ちます。',
        },
        {
          type: 'quiz',
          question: '筒子の1と4が孤立しています。どちらを切りますか？',
          hand: '14p',
          options: [
            { label: '筒子の1', mpsz: '1p', correct: true },
            { label: '筒子の4', mpsz: '4p' },
          ],
          answer: '筒子の1です。1に役立つ2と3は4にもうまく合い、4はさらに5と6も受けられます。',
        },
        {
          type: 'quiz',
          question: '誰かが立直しました。自分の手は2向聴で、あまり価値がありません。どうしますか？',
          options: [{ label: '守る', correct: true }, { label: '攻める' }],
          answer: '守ります。聴牌まであと2枚で、相手に振り込む前にそこまで届く可能性は低いです。',
        },
        {
          type: 'quiz',
          question: '相手は萬子の8だけを捨てています。萬子の5は筋ですか？',
          hand: '8m',
          options: [{ label: 'はい、筋です' }, { label: 'いいえ、片筋です', correct: true }],
          answer:
            '片筋です。萬子の3-4で2か5を待っている可能性があります。5が本当の筋になるには、2も出ている必要があります。',
        },
        {
          type: 'quiz',
          question: '6-8で萬子の7を待つ引っかけを作りたいです。おとりに最適な牌はどれですか？',
          hand: '68m',
          options: [
            { label: '萬子の4', mpsz: '4m', correct: true },
            { label: '萬子の5', mpsz: '5m' },
            { label: '萬子の9', mpsz: '9m' },
          ],
          answer: '萬子の4です。7は4の筋なので、筋で守る人は7を安全だと思って捨ててくれます。',
        },
        {
          type: 'quiz',
          question: '誰かが立直し、筒子の3が4枚とも見えています。いちばん安全なのはどれですか？',
          hand: '3333p',
          options: [
            { label: '筒子の1', mpsz: '1p', correct: true },
            { label: '筒子の4', mpsz: '4p' },
            { label: '筒子の6', mpsz: '6p' },
          ],
          answer:
            '筒子の1です。1を両面で待つのは2-3だけで、3が4枚見えていれば2-3は誰も持てません。4と6はまだいろいろな形で待たれます。',
        },
        {
          type: 'quiz',
          question: 'あなたは東場の親です。孤立した東と發があります。長く残すのはどちらですか？',
          hand: '1z 6z',
          options: [
            { label: '東', mpsz: '1z', correct: true },
            { label: '發', mpsz: '6z' },
          ],
          answer: '東です。東場の親にとって東は自風かつ場風で、刻子なら2翻です。',
        },
      ]),
    ],
  },
]

trocarReferencias(tutorialParts, (parte, numeroModulo, titulo) => {
  return `パート${parte}・モジュール${numeroModulo}（${titulo}）`
})

/** Verbetes do Glossário do app, mais os termos de mesa que só o guia usa. */
const glossary: TermoGlossarioGuia[] = [
  { term: 'チョンボ', definition: doGlossario('chombo') },
  { term: 'ドラ', definition: doGlossario('dora') },
  { term: '符', definition: doGlossario('fu') },
  { term: '振聴', definition: doGlossario('furiten') },
  {
    term: '現物',
    definition: '立直した人がすでに捨てた牌。その人に対して安全です。',
  },
  { term: '翻', definition: doGlossario('han') },
  { term: '半荘', definition: '標準的な対局で、東場と南場があります。' },
  { term: '本場', definition: doGlossario('honba') },
  { term: '子', definition: doGlossario('ko') },
  { term: '門前', definition: '他家の捨て牌を使っていない手。' },
  {
    term: '王牌',
    definition:
      '切れ目の後ろに分ける14枚で、通常はツモりません。ドラ表示牌とカンの嶺上牌があります。',
  },
  { term: '親', definition: doGlossario('oya') },
  {
    term: '筋',
    definition: '同じ色の3つ違いの数（1-4-7、2-5-8、3-6-9）。両面待ちに対してより安全です。',
  },
  { term: '聴牌', definition: doGlossario('tenpai') },
  { term: '東風戦', definition: '東場だけの短い対局。' },
  { term: '役', definition: doGlossario('yaku') },
]

export const conteudoJa: ConteudoTutorial = {
  tutorialParts,
  glossary,
  ranks: ['初心者', '中級者', '熟練者', '上級者', '初段'],
  ilustracoes: {
    colunaDuasPedras: '1列 = 2枚',
    umaSobreOutra: '2枚を重ねる',
    comprimentoMuro: '長さ17枚',
    conteDireitaEsquerda: '右から左へ数える',
    abertura: '切れ目',
    esquerda: '← 左',
    suaDireita: '自分の右 →',
    voceSentado: 'あなた（自分の山の正面に座る）',
    indicadorDora: 'ドラ表示牌',
    reposicaoKan: 'カンの嶺上牌',
    kanDora: 'カンドラ',
    compras: '← ツモ',
    muroMorto: '王牌（14枚）',
    muroMortoCurto: '王牌',
    ponChamada: 'ポン（鳴き）',
    ordem: '手番',
    daVez: 'の順',
    ventos: { leste: '東', sul: '南', oeste: '西', norte: '北' },
    sufixoOya: '（親）',
    dadosExemplo: '2 + 3 = 5 → 東（親）',
    dadosExemploCurto: '2 + 3 = 5 → 東',
    direitaLeste: '1 = 東の右端',
    contaEsquerda: '← 左へ数える',
    abreDepois: '5列目の後ろで開く ↘',
    colunasLeste: '東に5列',
    colunasSul: '+ 南に2列 ↘',
    seusDescartes: '捨て牌：6枚ずつの列',
  },
}
