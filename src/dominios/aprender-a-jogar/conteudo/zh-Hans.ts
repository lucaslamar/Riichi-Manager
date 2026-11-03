/**
 * Guia Aprender a jogar em chinês simplificado: mesmos ids, pedras e respostas do
 * pt-BR (`npm run test:guia` confere). Vocabulário igual ao do app em zh-Hans:
 * 刻子, 顺子, 雀头, 鸣牌, 庄家, 子家, 王牌, 和牌.
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

const { pontos, linhaPatamar, grupoYakus, doGlossario, simNao } = criarAuxiliares('zh-Hans', {
  sim: '是',
  nao: '否',
  cabecalhoYakus: ['役', '条件', '门清', '副露'],
})

const modulos: TutorialModule[] = [
  {
    id: 'pedras',
    number: 1,
    title: '牌',
    cover: '认识游戏中的136张牌。',
    pages: [
      {
        id: 'naipes',
        number: '1.1',
        title: '三种花色',
        termos: ['naipes', 'man', 'pin', 'sou'],
        blocks: [
          {
            type: 'text',
            md: '一共**136张牌**：34种，每种4张。三种花色都是从1到9。',
          },
          { type: 'text', md: '**万子** 万：写着汉字数字的牌。' },
          { type: 'hand', mpsz: '123456789m', numbered: true },
          { type: 'text', md: '**筒子** 筒：画着一到九个圆圈的牌。' },
          { type: 'hand', mpsz: '123456789p', numbered: true },
          { type: 'text', md: '**索子** 索：画着竹子的牌，1通常是一只鸟。' },
          { type: 'hand', mpsz: '123456789s', numbered: true },
        ],
      },
      {
        id: 'honras',
        number: '1.2',
        title: '字牌',
        termos: ['honras', 'ventos', 'dragoes'],
        blocks: [
          { type: 'text', md: '没有数字的牌（字牌），不能组成顺子。' },
          {
            type: 'text',
            md: '**风牌**：东、南、西、北。',
          },
          { type: 'hand', mpsz: '1234z' },
          {
            type: 'text',
            md: '**三元牌**：白、发、中。',
          },
          { type: 'hand', mpsz: '567z' },
          {
            type: 'tip',
            md: '牌桌上有时会听到日语读音，但现在不用在意：认识这些字就足够开始玩了。',
          },
        ],
      },
      {
        id: 'nomes',
        number: '1.3',
        title: '常听到的名称',
        termos: ['terminais', 'aka-dora'],
        blocks: [
          {
            type: 'text',
            md: '- **老头牌**：各花色的1和9。\n- **中张牌**：2到8的牌。\n- **红5**（赤宝牌）：每种花色一张特殊的5，有额外奖励。',
          },
          { type: 'hand', mpsz: '19m 19p 19s', caption: '老头牌', numbered: true },
          { type: 'hand', mpsz: '0m 0p 0s', caption: '红5' },
          {
            type: 'tip',
            md: '现在先把红5当作普通的5来用。它的奖励会在{{onde:dora}}中介绍。',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '筒子的9是老头牌还是中张牌？',
        hand: '9p',
        options: [{ label: '老头牌', correct: true }, { label: '中张牌' }],
        answer: '老头牌。各花色的1和9是老头牌，2到8是中张牌。',
      },
    ],
  },
  {
    id: 'mesa',
    number: 2,
    title: '牌桌',
    cover: '摆好你的第一张牌桌。',
    pages: [
      {
        id: 'sorteio',
        number: '2.1',
        title: '抽风位',
        termos: ['ventos', 'oya'],
        blocks: [
          {
            type: 'text',
            md: '首先，每位玩家都需要一个风。它决定座位，也决定谁先开始。',
          },
          {
            type: 'text',
            md: '- 抽到**东**的人是**庄家**。庄家掷骰子，并第一个打牌。\n- 其他人从庄家开始按逆时针就座：东 → 南 → 西 → 北。',
          },
          {
            type: 'image',
            image: 'mesaVentos',
            alt: '从上方看牌桌的四个座位：东（庄家）在下，南在右，西在上，北在左。中间的红色箭头表示出牌顺序：东到南，南到西，西到北，北回到东。',
            caption:
              '轮到出牌的人依次向右：东 → 南 → 西 → 北。庄家更换时，东也向右移：原来的南成为新的东。',
          },
          {
            type: 'text',
            md: '**怎么抽**\n- **用牌**：把四个风牌各一张扣着洗匀，每位玩家拿一张。\n- **用应用**：抽风位功能可以立刻抽出四个风，不用挑牌。',
          },
          { type: 'appLink', tool: 'sorteador', label: '打开抽风位' },
        ],
      },
      {
        id: 'muro',
        number: '2.2',
        title: '洗牌和砌牌山',
        blocks: [
          {
            type: 'steps',
            items: [
              '把牌摊在牌桌中央，大家一起充分洗牌。然后把朝上的牌翻过去，再轻轻洗一下，不要让牌再翻过来。',
              {
                md: '每位玩家在自己面前砌一排**长17张、高2张**（34张）的牌。',
                image: 'muroFileira',
                alt: '17列扣着的牌，每列叠放2张。',
              },
              {
                md: '每人把自己的牌山稍微推向牌桌中间。四排牌围着中央，但==不用靠在一起==，也不必是完美的正方形。',
                image: 'muroQuadrado',
                alt: '俯视图：四排牌山围着牌桌中央，各在一位玩家面前，四角留有空隙。东在下，南在右，西在上，北在左。中央的指示盘上有东（东），每边是开该玩家牌山的骰子点数：东 1、5、9；南 2、6、10；西 3、7、11；北 4、8、12。',
              },
            ],
          },
        ],
      },
      {
        id: 'abertura',
        number: '2.3',
        title: '开牌山',
        termos: ['oya'],
        blocks: [
          {
            type: 'text',
            md: '庄家==总是掷两颗骰子==并相加。这个数决定**开哪排牌山**，以及**在第几列切开**。王牌就在切口处分开。',
          },
          { type: 'heading', text: '1. 开哪排牌山' },
          {
            type: 'text',
            md: '从庄家开始按==逆时针==数：庄家是1，庄家右边的人是2，对面的人是3，庄家左边的人是4。数到5时回到庄家。',
          },
          {
            type: 'text',
            md: '- **5或9**：庄家的牌山。\n- **2、6或10**：庄家右边的人的牌山。\n- **3、7或11**：对面的牌山。\n- **4、8或12**：庄家左边的人的牌山。',
          },
          {
            type: 'tip',
            md: '**有指示盘时**不用数：每一边都标着开该座位牌山的数字，找到骰子的总和就行。',
          },
          {
            type: 'image',
            image: 'mesaDados',
            alt: '从上方看牌桌和四排牌山。每个风旁边有计数数字：东 1、5、9；南 2、6、10；西 3、7、11；北 4、8、12。中间的骰子合计为5，庄家所在的东被突出显示。',
            caption: '例：2 + 3 = 5。数一圈后停在庄家。',
          },
          { type: 'heading', text: '2. 在哪里开' },
          {
            type: 'text',
            md: '砌这排牌山的人从自己的座位看，==从右向左==数列：最右边的一列是1。数到骰子的点数，在这一列后面分开牌山：这就是==开门==。',
          },
          {
            type: 'image',
            image: 'muroContagem',
            alt: '砌牌的人从正面看的17列牌山。最右边的5列有编号：最右为1，向左到5。红色箭头从右向左指向开门切口，就在第5列之后。',
            caption: '骰子5：第1列在你的最右边，切口在第5列之后。',
          },
          {
            type: 'image',
            image: 'mesaAbertura',
            alt: '从上方看牌桌。东家牌山的列用红色标着1到5，从坐在东位的人的最右边向左，牌山在第5列之后切开。',
            caption: '从上方看同样的数法（东家牌山）。',
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
            md: '==开门右边的7列==（14张）就是**王牌**。通常不从这里摸牌。',
          },
          {
            type: 'image',
            image: 'muroMorto',
            alt: '从正面看打开的牌山：左边是摸牌的牌山，然后是开门，右边是王牌的7列，从开门起编号1到7。第3列上面的牌翻开：它是宝牌指示牌。',
            caption: '面对牌山：开门左边摸牌，右边是王牌，从开门开始编号。',
          },
          { type: 'heading', text: '骰子点数小于7时' },
          {
            type: 'text',
            md: '开门右边只有你数过的列，不足7列。==用右边相邻的牌山补足王牌==。以骰子5为例，东家牌山留5列，另外2列来自南家牌山。',
          },
          {
            type: 'image',
            image: 'muroMortoCurto',
            alt: '从上方看牌桌，骰子合计为5。东家牌山在第5列后切开；带斜线和红色轮廓的王牌占这5列，并转过角继续占南家牌山的前2列。指示牌在第3列，仍在东家。',
            caption: '骰子5：东家5列 + 南家2列。',
          },
          {
            type: 'tip',
            md: '点数为7或以上时，王牌全部在被选中的牌山上。点数为2到6时，一定会转角。',
          },
          { type: 'heading', text: '有什么用' },
          {
            type: 'text',
            md: '一共136张牌，每种4张。如果全部进入牌局，就能数出已经出现的牌，准确知道还剩什么。王牌的14张不参与摸牌，所以==没有人能确定==哪些牌会出现。',
          },
          { type: 'heading', text: '宝牌指示牌' },
          {
            type: 'text',
            md: '这次方向与数骰子时相反：==从开门向右数3列==，翻开第3列上面的牌。它是**宝牌指示牌**，会在{{onde:dora}}中介绍。',
          },
          {
            type: 'tip',
            md: '王牌中的一些牌还有其他用途，会在{{onde:kan}}中介绍。',
          },
        ],
      },
      {
        id: 'compra',
        number: '2.5',
        title: '摸牌',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                md: '摸牌从==开门左边紧邻的一列==开始（对砌这排牌的人而言），一排接一排==向左==进行，如箭头所示。王牌不参与。从上方看，牌按**顺时针**被取走：与逆时针的出牌顺序相反。',
                image: 'mesaCompra',
                alt: '从上方看牌桌。东家牌山已打开；靠角的一侧是带红色轮廓的王牌，转向南家牌山。开门另一侧有一条红色箭头，沿东家牌山再到北家牌山，按顺时针方向。',
              },
              '庄家先拿，然后是庄家右边的人，依此类推。每人每次拿**4张**（2列），直到每人都有12张。',
              '每人再拿**1张**，共13张。',
              '庄家拿**第14张**，并打出第一张牌开始游戏。',
            ],
          },
          { type: 'heading', text: '小结：往哪边数' },
          {
            type: 'text',
            md: '始终像砌牌的人一样面对牌山：\n- **骰子**：从最右边向左。\n- **王牌和指示牌**：从开门向右。\n- **摸牌**：从开门向左。',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '谁掷骰子并第一个打牌？',
        options: [
          { label: '东家右边的人' },
          { label: '抽到东的庄家', correct: true },
          { label: '抽到北的人' },
        ],
        answer: '抽到东的庄家。庄家掷骰子，并打出第一张牌开始游戏。',
      },
      {
        type: 'quiz',
        question: '王牌有什么用？',
        options: [
          { label: '存放打出的牌' },
          { label: '分开输家的牌' },
          {
            label: '让一些牌不进入牌局，使没有人能确定哪些牌会出现',
            correct: true,
          },
        ],
        answer: '让一些牌不进入牌局。它们不参与摸牌，所以没有人能准确数出还剩哪些牌。',
      },
      {
        type: 'quiz',
        question: '庄家开始时有几张牌？',
        options: [{ label: '13' }, { label: '14', correct: true }, { label: '12' }],
        answer: '14张。其他人有13张，庄家打出第14张开始游戏。',
      },
      {
        type: 'quiz',
        question: '骰子是4（1 + 3）。开门在哪排牌山，王牌在哪里？',
        options: [
          { label: '北家，王牌全部在北家牌山上' },
          { label: '北家：北家4列 + 东家牌山3列', correct: true },
          { label: '西家：西家4列 + 南家3列' },
        ],
        answer:
          '从庄家开始按逆时针数，4落在庄家左边的人，也就是北家。北家从自己的最右边向左数4列并开门。那里只放得下4列王牌，另外3列来自北家右边相邻的牌山，也就是东家。',
      },
    ],
  },
  {
    id: 'mao',
    number: 3,
    title: '完整的手牌',
    cover: '了解你要组成什么。',
    pages: [
      {
        id: 'formula',
        number: '3.1',
        title: '公式：4组面子 + 1组雀头',
        blocks: [
          {
            type: 'text',
            md: '和牌需要**14张牌**，分成四组三张和一组对子。',
          },
          { type: 'hand', mpsz: '123m 456p 789s 555z 22s' },
        ],
      },
      {
        id: 'grupos',
        number: '3.2',
        title: '组的种类',
        termos: ['sequencia', 'trinca', 'par'],
        blocks: [
          { type: 'text', md: '**顺子**：同一花色的三个连续数字。' },
          { type: 'hand', mpsz: '345p' },
          { type: 'text', md: '**刻子**：三张相同的牌。' },
          { type: 'hand', mpsz: '777s 555z' },
          { type: 'text', md: '**雀头**：两张相同的牌。' },
          { type: 'hand', mpsz: '22s' },
          {
            type: 'tip',
            md: '顺子不能绕回（8-9-1不算），字牌（风牌和三元牌）不能组成顺子。',
          },
        ],
      },
      {
        id: 'tenpai',
        number: '3.3',
        title: '听牌：只差一张',
        termos: ['tenpai'],
        blocks: [
          {
            type: 'text',
            md: '你手上有13张牌，和牌时凑齐第14张。只差一张时，你的手牌就处于**听牌**状态。能完成手牌的牌就是你的**听的牌**。',
          },
          {
            type: 'text',
            md: '把手牌分成已经完成的组。==剩下不完整的部分==就是听牌的地方。',
          },
          { type: 'heading', text: '两面' },
          {
            type: 'hand',
            mpsz: '234m 567p 789s 11z 45m',
            labels: ['顺子', '顺子', '顺子', '雀头', '听'],
            after: '36m',
            afterLabel: '听',
            caption: '4-5靠3或6完成：最好的听牌，最多8张。',
          },
          { type: 'heading', text: '嵌张' },
          {
            type: 'hand',
            mpsz: '123p 456s 777m 99s 46m',
            labels: ['顺子', '顺子', '刻子', '雀头', '听'],
            after: '5m',
            afterLabel: '听',
            caption: '4-6只能靠中间的5完成。',
          },
          { type: 'heading', text: '边张' },
          {
            type: 'hand',
            mpsz: '345m 678p 222s 55z 12m',
            labels: ['顺子', '顺子', '刻子', '雀头', '听'],
            after: '3m',
            afterLabel: '听',
            caption: '1-2只能靠3完成：另一边没有0。',
          },
          { type: 'heading', text: '双碰' },
          {
            type: 'hand',
            mpsz: '234m 567p 678s 22p 88s',
            labels: ['顺子', '顺子', '顺子', '听', '听'],
            after: '2p8s',
            afterLabel: '听',
            caption: '一组对子变成刻子，另一组留作雀头。',
          },
          { type: 'heading', text: '单骑' },
          {
            type: 'hand',
            mpsz: '123m 456m 789p 111z 5s',
            labels: ['顺子', '顺子', '顺子', '刻子', '听'],
            after: '5s',
            afterLabel: '听',
            caption: '4组面子已经完成：只差索子5的雀头。',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '这手牌听牌了吗？',
        hand: '234m 567p 11s 345s 78p',
        options: simNao(true),
        answer: '是。它听筒子的6或9来完成7-8。',
      },
    ],
  },
  {
    id: 'turno',
    number: 4,
    title: '回合',
    cover: '摸牌、打牌和鸣牌。',
    pages: [
      {
        id: 'comprar-descartar',
        number: '4.1',
        title: '摸牌和打牌',
        blocks: [
          {
            type: 'text',
            md: '轮到你时，从牌山摸一张牌，再打出另一张，正面朝上。舍牌每行六张放在你面前，在你的牌山和牌桌中央之间，所有人都能看到。然后轮到你右边的人。',
          },
          {
            type: 'image',
            image: 'mesaDescartes',
            alt: '从上方看牌桌：每排牌山前有一行6张舍牌和第二行的开头。中间是牌桌中央和场风（东）。南家的一张舍牌横放，如同立直。东家右边、牌山外侧有一组明碰：三张牌，最左边一张横放。',
            caption: '每人在自己面前打牌，每行6张。东家右边是一组碰：拿来的牌横放。',
          },
          {
            type: 'text',
            md: '你也可以用其他玩家打出的牌当场组成一组：这就是**鸣牌**，比如碰和吃。鸣牌的组公开放在牌桌上，在你的右边。',
          },
          {
            type: 'tip',
            md: '在牌桌上，从别人那里拿来的牌要**横放**，指向打出它的人。这样大家都知道它从哪里来。',
          },
        ],
      },
      {
        id: 'pon',
        number: '4.2',
        title: '碰',
        termos: ['pon'],
        blocks: [
          {
            type: 'text',
            md: '有人打出一张牌，而你手上有两张相同的牌。喊“碰”，拿走这张牌，把刻子公开放在牌桌上。',
          },
          {
            type: 'text',
            md: '**任何玩家**打出的牌都可以碰。游戏从你继续：打出一张牌。',
          },
          {
            type: 'melds',
            items: [
              { mpsz: '777s', deLado: 0, caption: '来自上家（左）' },
              { mpsz: '777s', deLado: 1, caption: '来自对家' },
              { mpsz: '777s', deLado: 2, caption: '来自下家（右）' },
            ],
          },
          {
            type: 'text',
            md: '碰之后，你的手牌变成**副露**。没有用过其他玩家舍牌的手牌是**门清**。',
          },
        ],
      },
      {
        id: 'chi',
        number: '4.3',
        title: '吃',
        termos: ['chi', 'chamada'],
        blocks: [
          {
            type: 'text',
            md: '你可以用打出的牌完成顺子，但只能用**上家（左边的人）**打出的牌。喊“吃”，把顺子公开放在牌桌上。',
          },
          {
            type: 'melds',
            items: [
              {
                mpsz: '435p',
                deLado: 0,
                caption: '拿了筒子的4：它横放在左边',
              },
            ],
          },
          { type: 'text', md: '吃之后，你的手牌变成**副露**。' },
        ],
      },
      {
        id: 'prioridade',
        number: '4.4',
        title: '优先顺序',
        blocks: [
          {
            type: 'text',
            md: '如果多人想要同一张舍牌：**荣和 > 碰 > 吃**。',
          },
          {
            type: 'text',
            md: '**荣和**是用别人打出的牌和牌。下一页会介绍。',
          },
        ],
      },
      {
        id: 'tsumo-ron',
        number: '4.5',
        title: '自摸和荣和',
        termos: ['tsumo', 'ron'],
        blocks: [
          {
            type: 'text',
            md: '- **自摸**：你摸到了完成手牌的牌。其他所有玩家支付。\n- **荣和**：这张牌来自其他玩家的舍牌。只有打出它的人支付。',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '对家打出筒子的6，你有筒子的5和7。可以吃吗？',
        hand: '57p',
        options: simNao(false),
        answer: '否。只能吃上家（左边的人）打出的牌。',
      },
    ],
  },
  {
    id: 'yakus',
    number: 6,
    title: '有效的手牌',
    cover: '形状完整还不够：要和牌，手牌必须有役。',
    pages: [
      {
        id: 'sem-yaku',
        number: '6.1',
        title: '没有役就不能和牌',
        termos: ['yaku'],
        blocks: [
          {
            type: 'text',
            md: '有4组面子和1组雀头还不够。手牌至少要有一个**役**，也就是计分条件。',
          },
          { type: 'tip', md: '按正式规则，没有役就和牌属于错和，是严重的犯规。' },
        ],
      },
      {
        id: 'yakus-iniciantes',
        number: '6.2',
        title: '入门的役',
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
            md: '从这五个开始：有了它们，大多数手牌都能和。点一下可以查看说明。',
          },
          {
            type: 'cards',
            items: [
              {
                id: 'riichi',
                title: '立直',
                badge: '仅门清',
                blocks: [
                  {
                    type: 'text',
                    md: '最常见的役。手牌**门清**且听牌时，喊“立直”，并把牌横着打出。',
                  },
                  {
                    type: 'text',
                    md: '它本身就能让手牌有效。宣言后就不能再改变手牌。',
                  },
                ],
              },
              {
                id: 'menzen-tsumo',
                title: '门前清自摸和',
                badge: '仅门清',
                blocks: [
                  {
                    type: 'text',
                    md: '手牌**门清**时，用自己摸到的牌（自摸）和牌。',
                  },
                ],
              },
              {
                id: 'tanyao',
                title: '断幺九',
                badge: '可副露',
                blocks: [
                  {
                    type: 'text',
                    md: '只有2到8的牌，没有老头牌和字牌。',
                  },
                  { type: 'hand', mpsz: '234m 567m 345p 678s 55s' },
                  {
                    type: 'tip',
                    md: '有些牌桌只接受门清的断幺九。开始前先约定好。',
                  },
                ],
              },
              {
                id: 'yakuhai',
                title: '役牌',
                badge: '可副露',
                blocks: [
                  { type: 'text', md: '**三元牌**或**东**的刻子。' },
                  { type: 'hand', mpsz: '123m 456p 789s 555z 22s' },
                  { type: 'heading', text: '哪些风算役' },
                  {
                    type: 'text',
                    md: '每位玩家有自己的**自风**（抽到的风）。整张牌桌有**场风**：东风战中是东。',
                  },
                  {
                    type: 'text',
                    md: '- 场风：对所有人都算役。\n- 自风：只对你算役。\n- 如果场风也是你的自风，算==双倍==。\n- 不属于任何人的风不算役。',
                  },
                  {
                    type: 'text',
                    md: '例：东场中，东对所有人都算役。对**庄家**来说，它也是自风：算双倍。',
                  },
                  {
                    type: 'tip',
                    md: '**副露**时也成立：碰三元牌或有价值的风，手牌就有役了。',
                  },
                ],
              },
              {
                id: 'pinfu',
                title: '平和',
                badge: '仅门清',
                blocks: [
                  {
                    type: 'text',
                    md: '全是顺子，雀头不是三元牌，也不是有价值的风（自风或场风），并且是两面听（两面）。',
                  },
                  {
                    type: 'hand',
                    mpsz: '123m 456p 789p 23s 55m',
                    caption: '听牌的手牌',
                    after: '1s4s',
                    afterLabel: '听',
                  },
                ],
              },
            ],
          },
          { type: 'heading', text: '下一步' },
          {
            type: 'text',
            md: '熟悉这五个之后，下面这些在牌桌上也很常见：',
          },
          {
            type: 'cards',
            items: [
              {
                id: 'iipeikou',
                title: '一杯口',
                badge: '仅门清',
                blocks: [
                  {
                    type: 'text',
                    md: '同一花色的两组==相同==顺子。',
                  },
                  { type: 'hand', mpsz: '234m 234m 567p 789s 55p' },
                ],
              },
              {
                id: 'chanta',
                title: '混全带幺九',
                badge: '可副露',
                blocks: [
                  {
                    type: 'text',
                    md: '所有组**和雀头**都有老头牌（1或9）或字牌。至少要有一组顺子。',
                  },
                  { type: 'hand', mpsz: '123m 789p 999s 111z 77z' },
                ],
              },
              {
                id: 'toitoi',
                title: '对对和',
                badge: '可副露',
                blocks: [
                  {
                    type: 'text',
                    md: '只有刻子（或杠子）和雀头。==没有顺子==。',
                  },
                  { type: 'hand', mpsz: '222m 555p 888s 666z 99m' },
                ],
              },
              {
                id: 'honitsu',
                title: '混一色',
                badge: '可副露',
                blocks: [
                  {
                    type: 'text',
                    md: '整手牌只有**一种花色**，加上字牌。',
                  },
                  { type: 'hand', mpsz: '123s 456s 789s 555z 11z' },
                ],
              },
              {
                id: 'chinitsu',
                title: '清一色',
                badge: '可副露',
                blocks: [
                  {
                    type: 'text',
                    md: '整手牌只有**一种花色**，==没有字牌==。',
                  },
                  { type: 'hand', mpsz: '123p 456p 345p 789p 99p' },
                ],
              },
              {
                id: 'chiitoitsu',
                title: '七对子',
                badge: '仅门清',
                blocks: [
                  {
                    type: 'text',
                    md: '**七组不同的对子**。这是唯一不遵循4组面子 + 1组雀头公式的手牌。',
                  },
                  { type: 'hand', mpsz: '22m 55m 88p 33s 66s 11z 77z' },
                  {
                    type: 'tip',
                    md: '对子必须各不相同：四张相同的牌不算两组对子。',
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
        question: '吃过一次的副露手牌，没有字牌刻子。它有役吗？',
        hand: '123m 456p 789s 678p 11m',
        options: simNao(false),
        answer:
          '否。它有老头牌（没有断幺九），已副露（没有立直、门前清自摸和、平和），也没有役牌刻子。',
      },
    ],
  },
  {
    id: 'pontos',
    number: 8,
    title: '点数',
    cover: '你的手牌值多少，以及如何支付。',
    coverTip: '玩过要求有役的牌局了吗？如果还没有，**现在玩一局**，仍然不计点数，然后再回来。',
    pages: [
      {
        id: 'palitos',
        number: '8.1',
        title: '点棒',
        termos: ['riichi', 'honba'],
        blocks: [
          {
            type: 'text',
            md: '点数用点棒来计算。每位玩家开始时有**25,000**点：',
          },
          { type: 'sticks' },
          {
            type: 'text',
            md: '1,000点棒也是立直的押注。100点棒用来记录连庄的本场。',
          },
        ],
      },
      {
        id: 'han-fu',
        number: '8.2',
        title: '番和符',
        termos: ['han', 'fu'],
        blocks: [
          {
            type: 'text',
            md: '点数由**番**（役和宝牌）和**符**（手牌形状）决定。计算可以交给计算器。',
          },
          { type: 'hanFuTutorial' },
          {
            type: 'table',
            headers: ['役', '番'],
            rows: [
              ['立直', hanYaku('riichi')],
              ['门前清自摸和', hanYaku('menzen-tsumo')],
              ['断幺九', hanYaku('tanyao')],
              ['役牌', `每组刻子${hanYaku('yakuhai')}`],
              ['平和', hanYaku('pinfu')],
            ],
          },
          {
            type: 'text',
            md: '役可以相加。立直 + 断幺九 + 平和 + 门前清自摸和 = **4番**。',
          },
        ],
      },
      {
        id: 'patamares',
        number: '8.3',
        title: '满贯以上',
        termos: ['patamares', 'mangan', 'oya', 'ko'],
        blocks: [
          {
            type: 'text',
            md: '从5番开始，手牌进入固定点数的等级。**子家**是庄家以外的人。',
          },
          {
            type: 'table',
            headers: ['等级', '番', '子家', '庄家'],
            rows: [
              linhaPatamar('满贯', '5', BASE_PATAMAR.mangan),
              linhaPatamar('跳满', '6–7', BASE_PATAMAR.haneman),
              linhaPatamar('倍满', '8–10', BASE_PATAMAR.baiman),
              linhaPatamar('三倍满', '11–12', BASE_PATAMAR.sanbaiman),
              linhaPatamar('役满', '13+', BASE_PATAMAR.yakuman),
            ],
          },
          { type: 'text', md: '庄家和牌时得到**1.5倍**点数。' },
          { type: 'tip', md: '3番或4番时，符也可能让手牌达到满贯。' },
        ],
      },
      {
        id: 'quem-paga',
        number: '8.4',
        title: '谁来支付',
        termos: ['ron', 'tsumo'],
        blocks: [
          {
            type: 'text',
            md: '- **荣和**：打出那张牌的人支付全部。\n- **自摸**：所有人支付。如果和牌的人不是庄家，庄家付一半，另外两人分摊其余部分。',
          },
          {
            type: 'text',
            md: '和牌的人还能拿走牌桌上的立直押注（每根1,000点）。',
          },
        ],
      },
      {
        id: 'riichi-aposta',
        number: '8.5',
        title: '立直的押注',
        termos: ['riichi'],
        blocks: [
          {
            type: 'text',
            md: '计点时，宣言立直的人要把一根**1,000**点棒放到牌桌中央。',
          },
          {
            type: 'text',
            md: '- 宣言时至少要有1,000点，并且牌山至少还剩4张可摸。\n- 和牌的人拿走牌桌上的押注。\n- 如果没有人和牌，押注留在牌桌上到下一局。',
          },
          {
            type: 'tip',
            md: '立直还能让和牌的人翻开里宝牌，会在{{onde:dora}}中介绍。',
          },
        ],
      },
      {
        id: 'honba-empate',
        number: '8.6',
        title: '本场和流局',
        termos: ['honba', 'empate'],
        blocks: [
          {
            type: 'text',
            md: '每重打一局增加一个本场。每个本场让下一位和牌的人多得300点：自摸时每人付100点；荣和时打出那张牌的人付300点。',
          },
          {
            type: 'text',
            md: '如果牌山摸完没有人和牌，没听牌的人一共付3,000点给听牌的人。',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '子家自摸满贯。庄家付多少？',
        options: [
          { label: pontos(BASE_PATAMAR.mangan) },
          { label: pontos(BASE_PATAMAR.mangan * 2), correct: true },
          { label: pontos(BASE_PATAMAR.mangan * 4) },
        ],
        answer: `${pontos(BASE_PATAMAR.mangan * 2)}点，也就是一半。另外两人各付${pontos(BASE_PATAMAR.mangan)}点。`,
      },
    ],
  },
  {
    id: 'dora',
    number: 9,
    title: '宝牌',
    cover: '让手牌更值钱的奖励牌。',
    pages: [
      {
        id: 'indicador',
        number: '9.1',
        title: '指示牌和宝牌',
        termos: ['dora'],
        blocks: [
          {
            type: 'text',
            md: '还记得王牌上翻开的那张牌吗？它是**指示牌**。指示牌不是宝牌：**宝牌**是它的下一张牌。手牌中每张宝牌算1番。',
          },
          {
            type: 'image',
            image: 'muroMorto',
            alt: '从正面看打开的牌山：左边摸牌，然后是开门，右边是王牌，从开门数第3列翻开宝牌指示牌。',
            caption: '指示牌在王牌上保持翻开。',
          },
          {
            type: 'hand',
            mpsz: '3m',
            caption: '指示牌：万子的3',
            after: '4m',
            afterLabel: '宝牌',
          },
          { type: 'tip', md: '宝牌不是役。没有役，它不能帮你和牌。' },
        ],
      },
      {
        id: 'ordem-dora',
        number: '9.2',
        title: '顺序',
        termos: ['dora'],
        blocks: [
          {
            type: 'text',
            md: '每张牌指示下一张。到一个序列的末尾时，回到开头。',
          },
          { type: 'doraCycles' },
        ],
      },
      {
        id: 'aka-dora',
        number: '9.3',
        title: '红5',
        termos: ['aka-dora'],
        blocks: [
          {
            type: 'text',
            md: '每张红5（赤宝牌）多算1番，在手牌中当作普通的5。',
          },
          { type: 'hand', mpsz: '0m 0p 0s' },
          {
            type: 'tip',
            md: '不是每张牌桌都用红5。开始前先约定好。',
          },
        ],
      },
      {
        id: 'ura-dora',
        number: '9.4',
        title: '里宝牌',
        termos: ['ura-dora', 'riichi'],
        blocks: [
          {
            type: 'text',
            md: '宣言**立直**后和牌的人，翻开每张宝牌指示牌下面的牌。这就是**里宝牌**：相当于多一张指示牌，只对和牌的人有效。',
          },
          { type: 'tip', md: '不立直就没有里宝牌。这又是一个宣言的理由。' },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '指示牌是中。宝牌是哪张？',
        hand: '7z',
        options: [
          { label: '白', mpsz: '5z', correct: true },
          { label: '发', mpsz: '6z' },
          { label: '中', mpsz: '7z' },
        ],
        answer: '白：中 → 白。',
      },
    ],
  },
  {
    id: 'kan',
    number: 10,
    title: '杠',
    cover: '四张相同的牌，多摸一张，再多一张宝牌。',
    pages: [
      {
        id: 'kan',
        number: '10.1',
        title: '三种杠',
        termos: ['kan'],
        blocks: [
          { type: 'text', md: '四张相同的牌。杠有三种方式：' },
          {
            type: 'text',
            md: '- **明杠**：你有三张相同的牌，有人打出第四张。和碰一样，任何玩家打出的都可以。\n- **暗杠**：四张都在你手上。公开时把两端扣着放。\n- **加杠**：你已经碰过，又摸到第四张。把它放在横放的牌上面。',
          },
          {
            type: 'melds',
            items: [
              { mpsz: '8888p', deLado: 1, caption: '明杠（来自对家）' },
              { mpsz: '1111m', viradas: [0, 3], caption: '暗杠' },
              { mpsz: '7777s', deLado: 0, empilhada: true, caption: '加杠' },
            ],
          },
          {
            type: 'text',
            md: '明杠和加杠会让手牌变成**副露**。暗杠只用自己手上的牌，手牌保持**门清**。',
          },
          { type: 'tip', md: '杠的优先顺序和碰相同。' },
          { type: 'heading', text: '立直后的杠' },
          {
            type: 'text',
            md: '宣言立直后仍然可以**暗杠**：手上已有另外三张，而且==第四张是你自己从牌山摸到的==。如果杠会改变听牌，就不行。',
          },
          {
            type: 'tip',
            md: '用其他玩家打出的牌**不行**：立直后不能明杠或碰，因为手牌不能再改变。',
          },
          { type: 'heading', text: '杠的危险' },
          {
            type: 'text',
            md: '每次杠都会==多一张宝牌指示牌==（杠宝牌），对牌桌上**所有人**都有效，不只是开杠的人。立直和牌的人还能看它下面的里宝牌：又多一次宝牌的机会。',
          },
          {
            type: 'tip',
            md: '所以开杠前要想一想：新的宝牌可能让和你牌的人手牌更值钱。',
          },
        ],
      },
      {
        id: 'kan-dora',
        number: '10.2',
        title: '岭上牌和杠宝牌',
        termos: ['kan-dora'],
        blocks: [
          {
            type: 'text',
            md: '一组有四张牌时，手牌就少了一张。任何杠之后，你从王牌摸一张**岭上牌**，并翻开一张新的宝牌指示牌。然后打牌。',
          },
          {
            type: 'image',
            image: 'muroMortoKan',
            alt: '从正面看王牌，7列从开门开始编号。第1列上面的牌单独放在旁边的桌面上：它是杠的岭上牌。第3列翻开宝牌指示牌，第4列翻开杠宝牌指示牌。',
            caption: '杠之后：岭上牌来自第1列，杠宝牌在第4列翻开。',
          },
          {
            type: 'text',
            md: '靠近开门的第1列和第2列存放**杠的岭上牌**：开杠的人先摸第1列上面的牌。很多牌桌会先把这张牌放到旁边的桌面上，以免拿牌时碰倒牌山。',
          },
          {
            type: 'text',
            md: '每次杠都会多翻开一张指示牌，这就是**杠宝牌**：下一列上面的牌（第4列，然后第5列…）。它和第一张指示牌的作用相同。',
          },
          {
            type: 'text',
            md: '牌山摸完后不能开杠：已没有岭上牌可摸。',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '我暗杠了。手牌还是门清吗？',
        options: simNao(true),
        answer: '是。暗杠只用自己手上的牌，没有用其他玩家的舍牌。',
      },
    ],
  },
  {
    id: 'fim-partida',
    number: 5,
    title: '牌局结束',
    cover: '流局、下一任庄家，以及牌局何时结束。',
    pages: [
      {
        id: 'empate',
        number: '5.1',
        title: '流局',
        termos: ['empate', 'tenpai'],
        blocks: [
          {
            type: 'text',
            md: '一局也可能**没有人和牌**。当==只剩下王牌==且没有人完成手牌时，就是**流局**。',
          },
          {
            type: 'text',
            md: '每人说明自己是否听牌。听牌的人亮出手牌，没听牌的人可以把牌扣着。',
          },
          {
            type: 'tip',
            md: '计点时，没听牌的人付给听牌的人。这会在{{onde:pontos}}的“本场和流局”中介绍。',
          },
        ],
      },
      {
        id: 'proxima-mao',
        number: '5.2',
        title: '下一局',
        termos: ['oya', 'renchan'],
        blocks: [
          {
            type: 'text',
            md: '- 如果庄家和牌，或在流局时听牌，就**继续当庄家**，这一局重来（连庄）。\n- 否则，东移给下一位玩家。',
          },
        ],
      },
      {
        id: 'fim',
        number: '5.3',
        title: '东风战',
        blocks: [
          {
            type: 'text',
            md: '开始时先玩**东风战**：每位玩家至少当一次庄家。最后一位庄家把东传下去时，牌局结束。',
          },
          {
            type: 'text',
            md: '最初几局不计点数，和牌次数最多的人获胜。开始计点后，点数最多的人获胜；如果有人点数变成负数，牌局也会结束。',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '庄家和牌了。下一局的庄家是谁？',
        options: [
          { label: '还是同一个人', correct: true },
          { label: '庄家右边的人' },
          { label: '再上一局和牌的人' },
        ],
        answer: '还是同一个人。庄家和牌后继续当庄家，这一局重来。',
      },
      {
        type: 'quiz',
        question: '牌山摸完，没有人和牌。庄家没有听牌。下一局的庄家是谁？',
        options: [
          { label: '还是同一个人' },
          { label: '庄家右边的人', correct: true },
          { label: '听牌的人' },
        ],
        answer: '庄家右边的人。流局时，庄家只有听牌才能继续；否则东传给下一位。',
      },
    ],
  },
]

const topicosRegras: TopicoRegras[] = [
  {
    id: 'furiten',
    section: 'regras',
    title: '振听',
    termos: ['furiten'],
    blocks: [
      {
        type: 'text',
        md: '振听时不能荣和，只能自摸。振听时宣言荣和属于错和。',
      },
      {
        type: 'text',
        md: '- **舍牌振听**：能完成手牌的牌在你自己的舍牌中。\n- **同巡振听**：你放过了能完成手牌的牌，没有宣言荣和。持续到你下次打牌。\n- **立直振听**：立直后放过了能完成手牌的牌。持续到本局结束。',
      },
    ],
  },
  {
    id: 'kuikae',
    section: 'regras',
    title: '食替',
    blocks: [
      {
        type: 'text',
        md: '吃或碰之后，同一巡打出的牌有限制。只为了把一张牌换成作用相同的另一张而鸣牌，叫作**食替**，是禁止的。',
      },
      { type: 'heading', text: '相同的牌（现物食替）' },
      { type: 'text', md: '不能打出和刚拿到的牌相同的牌。吃和碰都一样。' },
      {
        type: 'melds',
        items: [
          { mpsz: '555p', deLado: 1, caption: '碰筒子的5：手里还有一张筒子的5，这一巡也不能打出' },
        ],
      },
      { type: 'heading', text: '顺子的另一端（筋食替）' },
      {
        type: 'text',
        md: '用相邻的两张牌吃时，顺子另一端的牌也不能打：打出它，顺子只是错开了一格。',
      },
      {
        type: 'melds',
        items: [
          { mpsz: '234m', deLado: 0, caption: '用3-4吃万子的2：万子的2和5都不能打' },
          { mpsz: '867s', deLado: 0, caption: '用6-7吃索子的8：索子的8和5都不能打' },
        ],
      },
      {
        type: 'text',
        md: '用中间的牌吃（2-4吃3）或边张吃（1-2吃3），只禁止相同的牌：没有另一端。',
      },
      {
        type: 'tip',
        md: '如果鸣牌后能打的只剩被禁止的牌，就不能鸣这张牌。雀魂和天凤会直接阻止；线下对局的罚则各不相同，开打前先约定好。',
      },
      {
        type: 'quiz',
        question: '你有筒子的5-6，吃了筒子的4。这一巡不能打哪些牌？',
        hand: '56p',
        options: [
          { label: '筒子的4和7', correct: true },
          { label: '只有筒子的4' },
          { label: '筒子的4和6' },
        ],
        answer: '筒子的4和7。4是刚拿到的牌；打出7的话，同样的5-6组成5-6-7，就是另一端。',
      },
    ],
  },
  {
    id: 'lista-yakus',
    section: 'regras',
    title: '役种列表',
    termos: ['yaku', 'yakuman'],
    blocks: [
      {
        type: 'text',
        md: '所有的役，以及它们在门清和副露时的番数。**—** 表示只在门清时有效，**Y** 表示役满。点一个役可以查看例子。',
      },
      ...grupoYakus('顺子', [
        ['pinfu', '全是顺子，雀头无价值，两面听'],
        ['iipeikou', '同一花色的两组相同顺子'],
        ['ryanpeikou', '两次两组相同顺子'],
        ['sanshoku-doujun', '三种花色有相同的顺子'],
        ['ittsuu', '同一花色的1-2-3、4-5-6和7-8-9'],
      ]),
      ...grupoYakus('刻子', [
        ['toitoi', '四组刻子和一组雀头'],
        ['sanankou', '不鸣牌组成的三组刻子'],
        ['sanshoku-doukou', '三种花色有相同的刻子'],
        ['sankantsu', '三组杠'],
        ['chiitoitsu', '七组不同的对子'],
      ]),
      ...grupoYakus('老头牌和字牌', [
        ['tanyao', '只有2到8的牌'],
        ['yakuhai', '三元牌或有价值的风的刻子'],
        ['shousangen', '两组三元牌刻子和第三种的雀头'],
        ['chanta', '所有组和雀头都有老头牌或字牌'],
        ['junchan', '所有组和雀头都有老头牌，没有字牌'],
        ['honroutou', '只有老头牌和字牌'],
      ]),
      ...grupoYakus('花色', [
        ['honitsu', '只有一种花色，加字牌'],
        ['chinitsu', '只有一种花色，没有字牌'],
      ]),
      ...grupoYakus('其他', [
        ['riichi', '门清时宣言听牌'],
        ['double-riichi', '第一次打牌就立直'],
        ['ippatsu', '立直后一巡内和牌'],
        ['menzen-tsumo', '门清时自摸'],
        ['haitei', '用牌山最后一张牌自摸'],
        ['houtei', '荣和最后一张舍牌'],
        ['rinshan', '用杠的岭上牌和牌'],
        ['chankan', '荣和别人加杠的牌'],
        ['renhou', '在第一次摸牌前荣和'],
      ]),
      ...grupoYakus('役满', [
        ['kokushi', '老头牌和字牌各一张，其中一张重复'],
        ['suuankou', '不鸣牌组成的四组刻子'],
        ['daisangen', '三元牌的三组刻子'],
        ['shousuushii', '三组风牌刻子和第四种的雀头'],
        ['daisuushii', '四种风牌的刻子'],
        ['tsuuiisou', '只有字牌'],
        ['chinroutou', '只有老头牌'],
        ['ryuuiisou', '只有绿色的牌'],
        ['chuuren', '一种花色的1-1-1-2-3-4-5-6-7-8-9-9-9，再加一张'],
        ['suukantsu', '四组杠'],
        ['tenhou', '庄家用发到的牌和牌'],
        ['chiihou', '第一次摸牌就自摸和牌'],
      ]),
      { type: 'tip', md: conteudoGuiaBolso('zh-Hans').notaKazoe },
    ],
  },
  {
    id: 'chombo',
    section: 'chombo-honba',
    title: '错和',
    termos: ['chombo'],
    blocks: [
      {
        type: 'text',
        md: '使这一局作废的严重犯规，比如手牌无效或没有役却宣言和牌、振听时荣和，或者不小心推倒并亮出手牌。',
      },
      {
        type: 'text',
        md: '罚则因俱乐部和比赛而异。常见做法是犯规者支付一个满贯的点数，然后重打这一局。开始前先约定好规则。',
      },
    ],
  },
  {
    id: 'honba',
    section: 'chombo-honba',
    title: '本场',
    termos: ['honba'],
    blocks: [
      {
        type: 'text',
        md: '一局重复时，**本场**加一：庄家和牌，或者流局。庄家在桌上放一根100点棒来标记次数。闲家和牌时，次数归零。',
      },
      {
        type: 'tip',
        md: '每个本场都会让下一次和牌更值钱。多少，你会在{{onde:pontos}}中看到。',
      },
    ],
  },
  {
    id: 'hanchan',
    section: 'regras',
    title: '半庄：东场和南场',
    blocks: [
      {
        type: 'text',
        md: '俱乐部和比赛的标准牌局。所有人在东场都当过庄家后，进入**南场**，每人再当一次庄家。',
      },
      {
        type: 'text',
        md: '南场中，场风变成南。时长是东风战的两倍，也有更多时间追回点数。',
      },
      {
        type: 'tip',
        md: '**没有人达到30,000点？** 在雀魂和天凤等很多牌桌上，牌局会继续进入**西场**，直到有人超过30,000点。按EMA规则，无论如何都在南场结束。',
      },
    ],
  },
  {
    id: 'cinco-blocos',
    section: 'estrategia',
    title: '五个块',
    termos: ['par', 'trinca', 'sequencia'],
    blocks: [
      {
        type: 'text',
        md: '完整的手牌有**五个块**：4组面子和1组雀头。所以把手牌保持在==五个块==，每块已完成或快要完成，进度会更快。',
      },
      {
        type: 'text',
        md: '块可以是对子、刻子、顺子，或快要完成的组（两张牌等第三张）。',
      },
      {
        type: 'hand',
        mpsz: '55p 777s 345m 68p',
        labels: ['对子', '刻子', '顺子', '快完成'],
        caption: '四种块',
      },
      { type: 'tip', md: '不适用于七对子和国士无双。' },
      { type: 'heading', text: '例子' },
      {
        type: 'hand',
        mpsz: '345m 24m 55p 46p 778s 12s',
        labels: ['顺子', '嵌张', '对子', '嵌张', '快完成', '边张'],
      },
      {
        type: 'text',
        md: '五个位置有**六个块**：必须拆掉一个。拆哪个？',
      },
      {
        type: 'text',
        md: '- **345m和55p**已经完成：保留。\n- **778s**能接受索子的6、7和9：很好，保留。\n- **24m和46p**是嵌张（3m和5p），但来了5m，或3p、7p后会变成两面。\n- **12s**是边张，只有3s能完成：这是==最差的块==。',
      },
      {
        type: 'hand',
        mpsz: '12s',
        caption: '拆掉最差的块，从索子的1开始',
        after: '3s',
        afterLabel: '只听这张',
      },
    ],
  },
  {
    id: 'eficiencia',
    section: 'estrategia',
    title: '开局的打牌',
    termos: ['tenpai'],
    blocks: [
      {
        type: 'text',
        md: '牌效率就是更快听牌，留下能接受**更多牌**的形状。',
      },
      {
        type: 'text',
        md: '面对==孤张==（没有对子，也没有同花色的邻牌）时，按这个顺序打，从先到后：',
      },
      { type: 'hand', mpsz: '234z', caption: '1. 既不是自风也不是场风的风牌' },
      { type: 'hand', mpsz: '19m 19p 19s', caption: '2. 老头牌（1和9）' },
      { type: 'hand', mpsz: '567z', caption: '3. 三元牌' },
      { type: 'hand', mpsz: '1z', caption: '4. 最后才是自风和场风' },
      {
        type: 'text',
        md: '哪些风对你算役，见{{onde:yakus}}中的役牌。东场时，**庄家**把东留到最后：对庄家来说，它算双倍。对其他人来说，东的价值和三元牌一样。',
      },
      {
        type: 'tip',
        md: '不要一直留着有价值的字牌：如果几巡内没成对，就早点打掉。晚些时候，它可能正是别人在听的牌。',
      },
    ],
  },
  {
    id: 'ordem-muda',
    section: 'estrategia',
    title: '顺序何时改变',
    termos: ['par'],
    blocks: [
      { type: 'heading', text: '对子不是孤张' },
      {
        type: 'hand',
        mpsz: '33z 99m',
        caption: '无价值的风牌对子和老头牌对子：保留',
      },
      {
        type: 'text',
        md: '无价值的风牌对子可以当手牌的雀头（平和也可以），老头牌对子同样保留。',
      },
      { type: 'heading', text: '有邻牌的老头牌不是孤张' },
      {
        type: 'hand',
        mpsz: '12p 13s',
        caption: '1和2，或1和3：已经是半组了',
      },
      { type: 'heading', text: '1和4' },
      { type: 'hand', mpsz: '14p', caption: '1和4（或9和6）：打掉1' },
      {
        type: 'text',
        md: '有同花色的4时，1几乎没有帮助：对1有用的2和3，==和4搭配更好==。',
      },
      { type: 'heading', text: '其他情况' },
      {
        type: 'text',
        md: '- **已经出现在舍牌中的字牌**价值更低：能成对的张数变少了。\n- **混一色和混全带幺九这样的役**会改变一切：这时字牌和老头牌可能更有价值。',
      },
    ],
  },
  {
    id: 'contagem-pedras',
    section: 'estrategia',
    title: '有多少牌能帮忙',
    termos: ['ryanmen'],
    blocks: [
      {
        type: 'text',
        md: '为什么是这个顺序？数一数有多少张牌能把孤张变成对子或半组。能帮忙的牌越多，越值得保留。',
      },
      {
        type: 'table',
        headers: ['孤张', '有帮助的牌'],
        rows: [
          ['字牌', '3（只能成对）'],
          ['1和9', '11'],
          ['2和8', '15'],
          ['3到7', '19'],
        ],
      },
      {
        type: 'hand',
        mpsz: '1p',
        caption: '孤张筒子1：对子、2和3有帮助',
        after: '1p2p3p',
        afterLabel: '有帮助',
      },
      {
        type: 'hand',
        mpsz: '5p',
        caption: '孤张筒子5：对子和3到7有帮助',
        after: '3p4p5p6p7p',
        afterLabel: '有帮助',
      },
      {
        type: 'tip',
        md: '只看张数：3到7 > 2和8 > 1和9 > 字牌。能让字牌提前的，是它可能带来的役。',
      },
      { type: 'heading', text: '优先两面听' },
      {
        type: 'text',
        md: '数一数有多少张牌可用：每种牌有4张。',
      },
      {
        type: 'hand',
        mpsz: '23m',
        caption: '两面：最多8张',
        after: '14m',
        afterLabel: '听',
      },
      {
        type: 'hand',
        mpsz: '13m',
        caption: '嵌张：最多4张',
        after: '2m',
        afterLabel: '听',
      },
      {
        type: 'hand',
        mpsz: '12m',
        caption: '边张：最多4张',
        after: '3m',
        afterLabel: '听',
      },
    ],
  },
  {
    id: 'quando-defender',
    section: 'estrategia',
    title: '进攻还是防守？',
    termos: ['tenpai', 'riichi'],
    blocks: [
      {
        type: 'text',
        md: '有人宣言立直时，看看你的手牌。**向听**是离听牌还差多少：1向听差一张，2向听差两张。',
      },
      {
        type: 'hand',
        mpsz: '234m 567p 11s 345s 78p',
        caption: '听牌：听筒子的6或9',
      },
      {
        type: 'hand',
        mpsz: '234m 567p 11s 34s 78p 9m',
        caption: '1向听：离听牌差一张',
      },
      {
        type: 'text',
        md: '- **听牌**：通常值得进攻，如果你是庄家更是如此。这取决于你的手牌价值。\n- **1向听**：考虑是否还有很多牌能帮忙，以及手牌是否值得冒险。\n- **2向听或更多**：==防守==。',
      },
      { type: 'heading', text: '要考虑什么' },
      {
        type: 'text',
        md: '- 能看到几张宝牌？\n- 听牌的人是庄家吗？庄家得1.5倍。\n- 你的手牌值多少？\n- 比分如何？\n- 离牌局结束还有几局？',
      },
    ],
  },
  {
    id: 'defesa',
    section: 'estrategia',
    title: '防守：现物',
    termos: ['riichi', 'furiten'],
    blocks: [
      {
        type: 'text',
        md: '防守就是打出==最不可能==是立直者所听的牌。',
      },
      {
        type: 'text',
        md: '一切的基础是**振听**：如果他听的牌中==任何一张==在他的舍牌里，他就不能荣和任何一张听的牌。',
      },
      {
        type: 'hand',
        mpsz: '45s',
        caption: '如果他用索子4-5听牌，又已经打过3…',
        after: '3s6s',
        afterLabel: '两张都振听',
      },
      { type: 'heading', text: '现物：他打过的牌' },
      {
        type: 'text',
        md: '立直者==已经打过==的牌，对他是100%安全的：如果那张牌是他听的牌，他就振听，不能荣和。',
      },
      {
        type: 'hand',
        mpsz: '9m 2z 7p 3s',
        caption: '他的舍牌：对他都安全',
      },
      {
        type: 'tip',
        md: '只有现物是100%安全。筋、壁等都不能保证，但比随便一张牌安全得多。',
      },
      {
        type: 'text',
        md: '**拿不准时**：先打现物，然后是已经出现两三张的字牌，再是筋牌。放弃一手弱牌也是好的打法。',
      },
    ],
  },
  {
    id: 'suji',
    section: 'estrategia',
    title: '防守：筋',
    termos: ['furiten', 'ryanmen'],
    blocks: [
      {
        type: 'text',
        md: '立直者的舍牌能告诉你哪些牌更安全。如果他打过4，同花色的==1和7==就更安全。',
      },
      {
        type: 'text',
        md: '这些相隔3的数字（1-4-7、2-5-8和3-6-9）叫作**筋**。它们能防最常见的两面听。',
      },
      { type: 'heading', text: '为什么有效' },
      {
        type: 'text',
        md: '他打过**筒子的5**。如果他用筒子3-4或6-7听牌，5就是听的牌之一，他会振听。所以他==不会==用这两种形状听牌：',
      },
      {
        type: 'hand',
        mpsz: '34p',
        caption: '3-4会听2或5：不可能',
        after: '2p5p',
        afterLabel: '听',
      },
      {
        type: 'hand',
        mpsz: '67p',
        caption: '6-7会听5或8：不可能',
        after: '5p8p',
        afterLabel: '听',
      },
      {
        type: 'text',
        md: '所以**筒子的2和8**更安全：它们是5的筋。',
      },
      { type: 'heading', text: '三个基准' },
      {
        type: 'text',
        md: '4、5、6是基准，因为每个都能排除==两种==两面听。如果他打过其中一张，==打它的筋==对你更安全：',
      },
      {
        type: 'hand',
        mpsz: '4p',
        caption: '他打过4：你打1和7风险更低',
        after: '1p7p',
        afterLabel: '更安全',
      },
      {
        type: 'hand',
        mpsz: '5p',
        caption: '他打过5：2和8更安全',
        after: '2p8p',
        afterLabel: '更安全',
      },
      {
        type: 'hand',
        mpsz: '6p',
        caption: '他打过6：3和9更安全',
        after: '3p9p',
        afterLabel: '更安全',
      },
      { type: 'heading', text: '筋防不了什么' },
      {
        type: 'hand',
        mpsz: '46p',
        caption: '嵌张：即使2和8打过，4-6仍然听5',
        after: '5p',
        afterLabel: '听',
      },
      {
        type: 'text',
        md: '筋防不了嵌张、边张（1-2听3）、单骑或双碰。',
      },
      {
        type: 'tip',
        md: '这正是**筋陷阱**的所在：了解规则的人可以故意听筋牌。半筋之后会介绍怎么做。',
      },
    ],
  },
  {
    id: 'meio-suji',
    section: 'estrategia',
    title: '防守：半筋和中筋',
    termos: ['ryanmen'],
    blocks: [
      { type: 'heading', text: '半筋' },
      {
        type: 'hand',
        mpsz: '8m',
        caption: '他只打过8：5只是稍微安全一点',
        after: '5m',
        afterLabel: '半安全',
      },
      {
        type: 'text',
        md: '8排除了6-7（听5或8），但没有排除3-4。他仍然可能用3-4听5：',
      },
      {
        type: 'hand',
        mpsz: '34m',
        caption: '仍有可能：听2或5',
        after: '2m5m',
        afterLabel: '听',
      },
      {
        type: 'text',
        md: '所以5只是**半筋**：比没有强，但不如真正的筋。',
      },
      { type: 'heading', text: '中筋' },
      {
        type: 'hand',
        mpsz: '2s8s',
        caption: '他打过2和8：5和筋一样安全',
        after: '5s',
        afterLabel: '更安全',
      },
      {
        type: 'text',
        md: '2**和**8都打过时，3-4和6-7都不可能。5两边都受保护，算作==真正的筋==。4（1和7）和6（3和9）也一样。',
      },
    ],
  },
  {
    id: 'armadilha-suji',
    section: 'estrategia',
    title: '进攻：筋陷阱',
    termos: ['riichi', 'furiten'],
    blocks: [
      {
        type: 'text',
        md: '现在换到牌桌的另一边：用筋防守的人认为，你打过4，1和7就安全。**筋陷阱**就是用筋防不了的形状，==正好听那张筋牌==。',
      },
      { type: 'heading', text: '如何做' },
      {
        type: 'hand',
        mpsz: '4m 68m',
        caption: '你有万子的4和6-8',
      },
      {
        type: 'steps',
        items: [
          '**打出诱饵**：万子的4。在别人看来，万子的1和7变得安全了。',
          '留下**嵌张**听牌：6-8听7，也就是你打出的4的筋。',
          '用筋防守的人以为7安全而打出，你就荣和。',
        ],
      },
      {
        type: 'hand',
        mpsz: '68m',
        caption: '听7，因为打过4，它看起来很安全',
        after: '7m',
        afterLabel: '听',
      },
      { type: 'heading', text: '其他可行的形状' },
      {
        type: 'hand',
        mpsz: '89m',
        caption: '边张：8-9听7',
        after: '7m',
        afterLabel: '听',
      },
      {
        type: 'hand',
        mpsz: '11m 55p',
        caption: '双碰：听1（4的筋）或筒子的5',
        after: '1m5p',
        afterLabel: '听',
      },
      {
        type: 'text',
        md: '==行不通==的是两面听：打过4后，用5-6听4或7会让你**振听**，因为4在你的舍牌中。',
      },
      {
        type: 'hand',
        mpsz: '56m',
        caption: '振听：4是听的牌之一，已经在你的舍牌中',
        after: '4m7m',
        afterLabel: '不可用',
      },
      { type: 'heading', text: '最强的诱饵' },
      {
        type: 'text',
        md: '==用诱饵本身宣言立直==。所有人都会看立直宣言牌，并相信它的筋。早早打出的诱饵也有帮助，因为再加上外侧：外面的牌看起来更安全。',
      },
      { type: 'heading', text: '注意事项' },
      {
        type: 'text',
        md: '- 嵌张或边张接受的牌（最多4张）比两面（最多8张）**更少**。只有陷阱值得时才换。\n- 它对**用筋防守的人**有效。新手打牌不读你的舍牌，老手在立直附近也不相信筋。\n- 不要过度使用：如果你总是设陷阱，别人就不再相信你的筋。',
      },
    ],
  },
  {
    id: 'kabe',
    section: 'estrategia',
    title: '防守：壁',
    termos: ['ryanmen'],
    blocks: [
      {
        type: 'text',
        md: '**壁**就是看一种牌的4张都在哪里：舍牌、鸣牌、宝牌指示牌和你的手牌。当==4张全都可见==时，别人就不可能有需要它的组。',
      },
      {
        type: 'hand',
        mpsz: '3333p',
        caption: '筒子3的4张全都可见',
      },
      {
        type: 'hand',
        mpsz: '23p 34p 13p',
        caption: '这些都不可能：都需要一张3',
      },
      {
        type: 'hand',
        mpsz: '3p',
        caption: '壁的后面',
        after: '1p2p',
        afterLabel: '更安全',
      },
      {
        type: 'tip',
        md: '壁不能让一张牌100%安全：它仍可能被单骑或双碰听到。但它比随便一张牌安全得多。',
      },
      { type: 'heading', text: '哪些牌更安全' },
      {
        type: 'table',
        headers: ['4张可见', '更安全的牌'],
        rows: [
          ['2', '1'],
          ['3', '1和2'],
          ['4', '2和3'],
          ['5', '3和7'],
          ['6', '7和8'],
          ['7', '8和9'],
          ['8', '9'],
        ],
      },
      {
        type: 'text',
        md: '2、3或4时，==前面==的两张牌更安全。6、7或8时，==后面==的两张牌更安全。5时，3和7更安全。',
      },
      {
        type: 'hand',
        mpsz: '1111s',
        caption: '老头牌：4张可见也保护不了什么',
      },
      { type: 'heading', text: 'No chance和One chance' },
      {
        type: 'hand',
        mpsz: '6666m',
        caption: 'No chance：4张可见',
      },
      {
        type: 'hand',
        mpsz: '666m',
        caption: 'One chance：4张中有3张可见',
      },
      {
        type: 'text',
        md: '- **No chance**：不可能有用它的两面听，对嵌张也有效。和筋一样安全，甚至更安全。\n- **One chance**：别人有最后一张的可能性较小，但也可能有。在一局的前中期更有价值；接近结束时，最后一张可能已经在别人手里。',
      },
    ],
  },
  {
    id: 'sotogawa',
    section: 'estrategia',
    title: '防守：外侧',
    termos: ['riichi'],
    blocks: [
      {
        type: 'text',
        md: '**外侧**就是外面的部分。==很早==（第一行）打出中间牌的人，很可能没有保留它和花色末端之间的牌：如果有，这张牌会有用。',
      },
      {
        type: 'hand',
        mpsz: '233m 334m',
        caption: '有这些形状时，他不会早早打出万子的3',
      },
      {
        type: 'text',
        md: '如果打了，可能已经完成了那一组。==朝花色末端==最多相距2的牌会稍微安全一些：',
      },
      {
        type: 'hand',
        mpsz: '3m',
        caption: '他很早打了3：1和2（外侧）稍微安全',
        after: '1m2m',
        afterLabel: '更安全',
      },
      {
        type: 'table',
        headers: ['很早打的牌', '外侧'],
        rows: [
          ['2', '1'],
          ['3', '1和2'],
          ['4', '2和3'],
          ['5', '3和7'],
          ['6', '7和8'],
          ['7', '8和9'],
          ['8', '9'],
        ],
      },
      {
        type: 'text',
        md: '- 对高手更有效：这个思路假设对方打牌讲究效率。\n- 同时是外侧**和**筋的牌更安全。\n- 不适用于立直宣言牌，即使打得很早。',
      },
      {
        type: 'hand',
        mpsz: '3p5p',
        caption: '他打了3和5：2是3的外侧，也是5的筋',
        after: '2p',
        afterLabel: '安全得多',
      },
    ],
  },
  {
    id: 'matagi-suji',
    section: 'estrategia',
    title: '防守：跨筋',
    termos: ['riichi'],
    blocks: [
      {
        type: 'text',
        md: '**跨筋**和外侧相反：它指出==最危险==的牌。看后期的舍牌，尤其是立直宣言牌。',
      },
      {
        type: 'hand',
        mpsz: '3m',
        caption: '打出万子的3宣言立直',
      },
      {
        type: 'hand',
        mpsz: '233m 334m',
        caption: '可能来自这些形状',
      },
      {
        type: 'hand',
        mpsz: '23m 34m',
        caption: '手上留下2-3或3-4',
      },
      {
        type: 'hand',
        mpsz: '3m',
        caption: '所以最可能听的是1-4和2-5',
        after: '1m4m2m5m',
        afterLabel: '最危险',
      },
      {
        type: 'text',
        md: '任何牌都一样：危险的是==跨过==它的两面听。',
      },
      {
        type: 'tip',
        md: '不必背跨筋。防守的顺序是现物，然后筋和壁，然后外侧。跨筋帮助你决定进攻还是退让。',
      },
      {
        type: 'text',
        md: `想进一步了解：[Suji in mahjong（NPMahjong）](${ARTIGO_SUJI})（英文）。`,
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
    title: '第一次对局',
    cover: '玩一局所需的一切，不用役，也不计点数。',
    modules: ['pedras', 'mesa', 'mao', 'turno', 'fim-partida'].map(modulo),
  },
  {
    id: 'ir-alem',
    number: 2,
    title: '更进一步',
    cover:
      '役、错和与本场：真正的游戏规则，但还不计点数。',
    milestone: {
      title: '你已经可以玩了！',
      md: '继续之前，先==玩一局==（东风战）。现在不用役，也不计点数：谁先完成手牌谁赢，东按你刚看到的方式传下去。\n到这里是**基础**。完整的游戏还有更多，接下来的模块会介绍其余内容。',
    },
    modules: [
      modulo('yakus'),
      moduloRegras('chombo-honba', 7, '错和与本场', '让手牌作废的失误，以及重复的一局。'),
    ],
  },
  {
    id: 'pontos-parte',
    number: 3,
    title: '点数',
    cover: '每手牌值多少，包括宝牌和杠。',
    milestone: {
      title: '再玩一局！',
      md: '进入点数之前，先在要求有役的规则下==玩一局==。还是不计点数：记下每一局谁和了，最后和牌次数最多的人获胜。',
    },
    modules: ['pontos', 'dora', 'kan'].map(modulo),
  },
  {
    id: 'aprofundando',
    number: 4,
    title: '深入学习',
    cover:
      '每局都适用的更多规则。',
    modules: [
      moduloRegras('regras', 11, '更多规则', '这些细节也是游戏的一部分。'),
    ],
  },
  {
    id: 'estrategia-parte',
    number: 5,
    title: '策略',
    cover: '打得更好：打哪张牌，什么时候防守。',
    modules: [
      moduloRegras('estrategia', 12, '策略', '在最初几局之后打得更好。', [
        {
          type: 'quiz',
          question: '你的手牌有六个块。先拆哪一个？',
          hand: '345m 24m 55p 46p 778s 12s',
          options: [
            { label: '索子1-2', mpsz: '12s', correct: true },
            { label: '万子2-4', mpsz: '24m' },
            { label: '索子7-7-8', mpsz: '778s' },
          ],
          answer: '索子1-2。它是边张，只有索子3能完成。万子2-4还能变成两面，7-7-8能接受三种牌。',
        },
        {
          type: 'quiz',
          question: '你摸完牌要打一张。先打哪张？',
          hand: '234m 9m 55p 678p 45s 79s 4z',
          options: [
            { label: '北', mpsz: '4z', correct: true },
            { label: '万子9', mpsz: '9m' },
            { label: '索子7', mpsz: '7s' },
          ],
          answer:
            '北（如果它不是你的自风或场风）。单张只能成对，也不算役。万子9还能组成7-8-9，索子7-9听8。',
        },
        {
          type: 'quiz',
          question: '筒子1和4在这个花色中是孤张。打哪张？',
          hand: '14p',
          options: [
            { label: '筒子1', mpsz: '1p', correct: true },
            { label: '筒子4', mpsz: '4p' },
          ],
          answer: '筒子1。对1有帮助的2和3，和4搭配更好，4还能接受5和6。',
        },
        {
          type: 'quiz',
          question: '有人宣言立直。你的手牌是2向听，价值也不高。怎么办？',
          options: [{ label: '防守', correct: true }, { label: '进攻' }],
          answer: '防守。离听牌还差两张：在放铳之前赶上的机会很小。',
        },
        {
          type: 'quiz',
          question: '他只打过万子8。万子5是筋吗？',
          hand: '8m',
          options: [{ label: '是，是筋' }, { label: '不是，只是半筋', correct: true }],
          answer: '只是半筋。他仍可能用万子3-4听2或5。要让5成为真正的筋，2也必须出现过。',
        },
        {
          type: 'quiz',
          question: '你想用6-8听万子7来设陷阱。打哪张牌当诱饵最好？',
          hand: '68m',
          options: [
            { label: '万子4', mpsz: '4m', correct: true },
            { label: '万子5', mpsz: '5m' },
            { label: '万子9', mpsz: '9m' },
          ],
          answer: '万子4。7是4的筋：用筋防守的人以为7安全，就会打给你。',
        },
        {
          type: 'quiz',
          question: '有人宣言立直，筒子3的4张全都可见。下面哪张最安全？',
          hand: '3333p',
          options: [
            { label: '筒子1', mpsz: '1p', correct: true },
            { label: '筒子4', mpsz: '4p' },
            { label: '筒子6', mpsz: '6p' },
          ],
          answer:
            '筒子1。它只会被2-3听到，而四张3都可见，就没有人有2-3。4和6仍可能以多种方式被听到。',
        },
        {
          type: 'quiz',
          question: '你是东场的庄家。手上有孤张东和发。留哪张更久？',
          hand: '1z 6z',
          options: [
            { label: '东', mpsz: '1z', correct: true },
            { label: '发', mpsz: '6z' },
          ],
          answer: '东。对东场的庄家来说，它既是自风也是场风：刻子算2番。',
        },
      ]),
    ],
  },
]

trocarReferencias(tutorialParts, (parte, numeroModulo, titulo) => {
  return `第${parte}部分·模块${numeroModulo}（${titulo}）`
})

/** Verbetes do Glossário do app, mais os termos de mesa que só o guia usa. */
const glossary: TermoGlossarioGuia[] = [
  { term: '错和', definition: doGlossario('chombo') },
  { term: '宝牌', definition: doGlossario('dora') },
  { term: '符', definition: doGlossario('fu') },
  { term: '振听', definition: doGlossario('furiten') },
  {
    term: '现物',
    definition: '立直者已经打过的牌：对他是安全的。',
  },
  { term: '番', definition: doGlossario('han') },
  { term: '半庄', definition: '标准牌局，有东场和南场。' },
  { term: '本场', definition: doGlossario('honba') },
  { term: '子家', definition: doGlossario('ko') },
  { term: '门清', definition: '没有用过其他玩家舍牌的手牌。' },
  {
    term: '王牌',
    definition: '开门后分出的14张牌，通常不摸。宝牌指示牌和杠的岭上牌都在这里。',
  },
  { term: '庄家', definition: doGlossario('oya') },
  {
    term: '筋',
    definition: '同一花色相隔3的数字（1-4-7、2-5-8、3-6-9）。对两面听更安全。',
  },
  { term: '听牌', definition: doGlossario('tenpai') },
  { term: '东风战', definition: '较短的牌局，只有东场。' },
  { term: '役', definition: doGlossario('yaku') },
]

export const conteudoZhHans: ConteudoTutorial = {
  tutorialParts,
  glossary,
  ranks: ['新手', '熟手', '老手', '专家', '初段'],
  ilustracoes: {
    colunaDuasPedras: '1列 = 2张',
    umaSobreOutra: '两张叠放',
    comprimentoMuro: '长17张',
    conteDireitaEsquerda: '从右向左数',
    abertura: '开门',
    esquerda: '← 左',
    suaDireita: '你的右边 →',
    voceSentado: '你，面对自己的牌山坐着',
    indicadorDora: '宝牌指示牌',
    reposicaoKan: '杠的岭上牌',
    kanDora: '杠宝牌',
    compras: '← 摸牌',
    muroMorto: '王牌（14张）',
    muroMortoCurto: '王牌',
    ponChamada: '碰（鸣牌）',
    ordem: '出牌',
    daVez: '顺序',
    ventos: { leste: '东', sul: '南', oeste: '西', norte: '北' },
    sufixoOya: '（庄家）',
    dadosExemplo: '2 + 3 = 5 → 东（庄家）',
    dadosExemploCurto: '2 + 3 = 5 → 东',
    direitaLeste: '1 = 东的最右边',
    contaEsquerda: '← 向左数',
    abreDepois: '第5列后开门 ↘',
    colunasLeste: '东家5列',
    colunasSul: '+ 南家2列 ↘',
    seusDescartes: '你的舍牌：每行6张',
  },
}
