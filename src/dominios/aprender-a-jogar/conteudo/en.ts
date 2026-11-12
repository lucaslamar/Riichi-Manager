/**
 * Guia Aprender a jogar em inglês: mesmos ids, pedras e respostas do pt-BR
 * (`npm run test:guia` confere). Vocabulário igual ao do app em en: tile, suit,
 * triplet, pair, sequence, draw, call, dead wall. Também é a reserva dos idiomas
 * sem guia próprio.
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

const { pontos, linhaPatamar, grupoYakus, doGlossario, simNao } = criarAuxiliares('en', {
  sim: 'Yes',
  nao: 'No',
  cabecalhoYakus: ['Yaku', 'What it needs', 'Closed', 'Open'],
})

const modulos: TutorialModule[] = [
  {
    id: 'pedras',
    number: 1,
    title: 'The tiles',
    cover: 'Meet the 136 tiles of the game.',
    pages: [
      {
        id: 'naipes',
        number: '1.1',
        title: 'The three suits',
        termos: ['naipes', 'man', 'pin', 'sou'],
        blocks: [
          {
            type: 'text',
            md: 'There are **136 tiles**: 34 types, with 4 copies of each. Three suits run from 1 to 9.',
          },
          { type: 'text', md: '**Man** 萬 • Characters: numbers written in kanji.' },
          { type: 'hand', mpsz: '123456789m', numbered: true },
          { type: 'text', md: '**Pin** 筒 • Circles: from one to nine circles.' },
          { type: 'hand', mpsz: '123456789p', numbered: true },
          { type: 'text', md: '**Sou** 索 • Bamboo: the 1 is usually a bird.' },
          { type: 'hand', mpsz: '123456789s', numbered: true },
        ],
      },
      {
        id: 'honras',
        number: '1.2',
        title: 'The honors',
        termos: ['honras', 'ventos', 'dragoes'],
        blocks: [
          { type: 'text', md: 'Tiles without numbers (字牌). They never form a sequence.' },
          {
            type: 'text',
            md: '**Winds** 風牌: East (Ton), South (Nan), West (Shaa), North (Pei).',
          },
          { type: 'hand', mpsz: '1234z' },
          {
            type: 'text',
            md: '**Dragons** 三元牌: White (Haku), Green (Hatsu), Red (Chun).',
          },
          { type: 'hand', mpsz: '567z' },
          {
            type: 'tip',
            md: "You'll hear the Japanese names at the table, but don't worry about them yet: East, South, White and Red are enough to play.",
          },
        ],
      },
      {
        id: 'nomes',
        number: '1.3',
        title: "Names you'll hear",
        termos: ['terminais', 'aka-dora'],
        blocks: [
          {
            type: 'text',
            md: '- **Terminals**: the 1s and 9s of the suits.\n- **Simples**: the tiles from 2 to 8.\n- **Red 5** (Aka dora): a special 5 in each suit, worth a bonus.',
          },
          { type: 'hand', mpsz: '19m 19p 19s', caption: 'Terminals', numbered: true },
          { type: 'hand', mpsz: '0m 0p 0s', caption: 'The red fives' },
          {
            type: 'tip',
            md: "For now, play the red 5 as a normal 5 of its suit. You'll see the bonus it's worth in {{onde:dora}}.",
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'Is the 9 of Pin a terminal or a simple?',
        hand: '9p',
        options: [{ label: 'Terminal', correct: true }, { label: 'Simple' }],
        answer: 'Terminal. The 1s and 9s of the suits are terminals; 2 to 8 are simples.',
      },
    ],
  },
  {
    id: 'mesa',
    number: 2,
    title: 'The table',
    cover: 'Set up your first table.',
    pages: [
      {
        id: 'sorteio',
        number: '2.1',
        title: 'Drawing the winds',
        termos: ['ventos', 'oya'],
        blocks: [
          {
            type: 'text',
            md: 'First of all, each player needs a wind. It sets their seat at the table and who starts.',
          },
          {
            type: 'text',
            md: '- Whoever draws **East** is the **oya** (dealer). The oya rolls the dice and makes the first discard.\n- The others sit counterclockwise from the oya: East → South → West → North.',
          },
          {
            type: 'image',
            image: 'mesaVentos',
            alt: 'Table seen from above with the four seats: East (the oya) at the bottom, South on the right, West at the top and North on the left. Red arrows in the middle show the turn order: from East to South, South to West, West to North and North back to East.',
            caption:
              'The turn passes to the right of whoever played: East → South → West → North. When the oya changes, East also passes to the right: whoever was South becomes the new East.',
          },
          {
            type: 'text',
            md: '**How to draw**\n- **With the tiles**: place one tile of each wind face down, shuffle them, and each player takes one.\n- **With the app**: the Wind Draw draws all four winds instantly, with no tiles to set aside.',
          },
          { type: 'appLink', tool: 'sorteador', label: 'Open the Wind Draw' },
        ],
      },
      {
        id: 'muro',
        number: '2.2',
        title: 'Shuffling and building the wall',
        blocks: [
          {
            type: 'steps',
            items: [
              'Spread the tiles in the center of the table and shuffle them well, all together, however they land. Then turn face down any that ended up face up and shuffle gently, so none flip over again.',
              {
                md: 'Each player builds a row in front of them, **17 tiles long and 2 high** (34 tiles).',
                image: 'muroFileira',
                alt: 'Row of 17 columns of face-down tiles, each column with 2 stacked tiles.',
              },
              {
                md: 'Each player pushes their wall a little toward the middle of the table. The four walls sit around the center, but they ==do not need to touch== or form a perfect square.',
                image: 'muroQuadrado',
                alt: "View from above: four walls around the center of the table, each in front of a player, with a gap at each corner. East at the bottom, South on the right, West at the top and North on the left. In the middle, the centerpiece with East (東) and, on each side, the dice numbers that open that player's wall: East 1, 5 and 9; South 2, 6 and 10; West 3, 7 and 11; North 4, 8 and 12.",
              },
            ],
          },
        ],
      },
      {
        id: 'abertura',
        number: '2.3',
        title: 'Breaking the wall',
        termos: ['oya'],
        blocks: [
          {
            type: 'text',
            md: 'The oya ==always rolls both dice== and adds them up. The number says **which wall opens** and **at which column** it is cut. The dead wall is separated at the cut.',
          },
          { type: 'heading', text: '1. Which wall opens' },
          {
            type: 'text',
            md: 'Count the players starting from the oya, ==counterclockwise==: the oya is 1, the player on their right is 2, the one across is 3 and the one on their left is 4. At 5 the count returns to the oya.',
          },
          {
            type: 'text',
            md: "- **5 or 9**: the oya's wall.\n- **2, 6 or 10**: the wall of the player on their right.\n- **3, 7 or 11**: the wall across.\n- **4, 8 or 12**: the wall of the player on their left.",
          },
          {
            type: 'tip',
            md: "**With a centerpiece** there's no need to count: each side shows the numbers that open the wall of the player sitting there. Just find the dice total.",
          },
          {
            type: 'image',
            image: 'mesaDados',
            alt: 'Table seen from above with the four walls. Next to each wind, the count numbers: East 1, 5 and 9; South 2, 6 and 10; West 3, 7 and 11; North 4, 8 and 12. The dice in the middle add up to 5, and East, the oya, is highlighted.',
            caption: 'Example: 2 + 3 = 5. The count goes around and stops at the oya.',
          },
          { type: 'heading', text: '2. Where it opens' },
          {
            type: 'text',
            md: 'Whoever built the chosen wall looks at it from their seat and counts the columns ==from right to left==: the rightmost column is 1. They count the number shown by the dice and separate the wall right after that column: that is the ==break==.',
          },
          {
            type: 'image',
            image: 'muroContagem',
            alt: 'A wall of 17 columns, seen from the front by the player who built it. The 5 rightmost columns are numbered: 1 at the right end and 5 further left. A red arrow points from right to left up to the cut of the break, right after the 5th column.',
            caption: 'Dice 5: column 1 is the one on your right, and the cut comes after the 5th.',
          },
          {
            type: 'image',
            image: 'mesaAbertura',
            alt: 'Table seen from above. On the East wall, the columns are numbered 1 to 5 in red, from the right end of the player sitting East toward the left, and the wall is cut after the 5th.',
            caption: 'The same count seen from above, on the East wall.',
          },
        ],
      },
      {
        id: 'muro-morto',
        number: '2.4',
        title: 'The dead wall',
        termos: ['dora'],
        blocks: [
          {
            type: 'text',
            md: 'The ==7 columns right of the break== (14 tiles) form the **dead wall**. They are not drawn normally.',
          },
          {
            type: 'image',
            image: 'muroMorto',
            alt: 'Open wall seen from the front: on the left the wall tiles are drawn from, then the break and, on the right, the 7 columns of the dead wall, numbered 1 to 7 from the break. In column 3, the top tile is face up: it is the dora indicator.',
            caption:
              'Facing the wall: draws to the left of the break, dead wall to the right, numbered from the break.',
          },
          { type: 'heading', text: 'If the dice total less than 7' },
          {
            type: 'text',
            md: 'Right of the break there are only the columns you counted with the dice, fewer than 7. ==Complete the dead wall with the neighboring wall==, on the right. In the dice 5 example, 5 columns stay on the East wall and the other 2 come from the South wall.',
          },
          {
            type: 'image',
            image: 'muroMortoCurto',
            alt: 'Table seen from above with the dice adding up to 5. The East wall is cut after the 5th column; the dead wall, hatched with a red outline, takes those 5 columns and continues into the first 2 of the South wall, turning the corner. The indicator is on the 3rd column, still on East.',
            caption: 'Dice 5: 5 columns on East + 2 on South.',
          },
          {
            type: 'tip',
            md: 'With 7 or more, the whole dead wall fits on the chosen wall. From 2 to 6, it always turns the corner.',
          },
          { type: 'heading', text: 'What it is for' },
          {
            type: 'text',
            md: 'There are 136 tiles, 4 of each. If they all came into play, you could count what has come out and know exactly what is left. The 14 dead wall tiles stay out of the draws, so ==nobody knows for sure== which tiles will appear.',
          },
          { type: 'heading', text: 'The dora indicator' },
          {
            type: 'text',
            md: "Now the count goes the opposite way from the dice: count ==3 columns from the break to the right== and flip the top tile of the 3rd. It is the **dora indicator**, which you'll meet in {{onde:dora}}.",
          },
          {
            type: 'tip',
            md: "Some dead wall tiles have other uses, which you'll see in {{onde:kan}}.",
          },
        ],
      },
      {
        id: 'compra',
        number: '2.5',
        title: 'Drawing the tiles',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                md: 'Drawing starts ==at the column just left of the break== (for whoever built that wall) and goes ==to the left==, wall after wall, as the arrow shows. The dead wall stays out. Seen from above, tiles leave the wall **clockwise**: the opposite of the turn order, which is counterclockwise.',
                image: 'mesaCompra',
                alt: 'Table seen from above. The East wall is open; on the corner side is the dead wall, with a red outline, turning into the South wall. From the other side of the break, a red arrow runs along the East wall and then the North wall, clockwise.',
              },
              'The oya takes first, then the player on their right, and so on. Each takes **4 tiles at a time** (2 columns), until everyone has 12.',
              'Each player takes **1 more tile** and has 13.',
              'The oya takes the **14th tile** and opens play with the first discard.',
            ],
          },
          { type: 'heading', text: 'Summary: which way to count' },
          {
            type: 'text',
            md: 'Always facing the wall, like whoever built it:\n- **Dice**: from the right end to the left.\n- **Dead wall and indicator**: from the break to the right.\n- **Draws**: from the break to the left.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'Who rolls the dice and makes the first discard?',
        options: [
          { label: 'The player to the right of East' },
          { label: 'The oya, who drew East', correct: true },
          { label: 'Whoever drew North' },
        ],
        answer:
          'The oya, who drew East. The oya rolls the dice and opens play with the first discard.',
      },
      {
        type: 'quiz',
        question: 'What is the dead wall for?',
        options: [
          { label: 'Keeping the discarded tiles' },
          { label: 'Setting aside the tiles of whoever lost the hand' },
          {
            label: 'Keeping tiles out of play so nobody knows for sure which will appear',
            correct: true,
          },
        ],
        answer:
          'Keeping tiles out of play. With them out of the draws, nobody can count exactly what is still to come.',
      },
      {
        type: 'quiz',
        question: 'How many tiles does the oya start with?',
        options: [{ label: '13' }, { label: '14', correct: true }, { label: '12' }],
        answer: '14. The others have 13, and the oya opens play by discarding the 14th.',
      },
      {
        type: 'quiz',
        question:
          'The dice came to 4 (1 + 3). Which wall has the break, and where is the dead wall?',
        options: [
          { label: 'North, and the whole dead wall fits on it' },
          { label: 'North: 4 columns on it + 3 on the East wall', correct: true },
          { label: 'West: 4 columns on it + 3 on South' },
        ],
        answer:
          'Counting from the oya counterclockwise, 4 lands on the player to their left: North. North counts 4 columns, from their right end to the left, and opens. Only 4 dead wall columns fit there; the other 3 come from the neighboring wall to the right of North, which is East.',
      },
    ],
  },
  {
    id: 'mao',
    number: 3,
    title: 'Complete hand',
    cover: "Find out what you're trying to build.",
    pages: [
      {
        id: 'formula',
        number: '3.1',
        title: 'The formula: 4 groups + 1 pair',
        blocks: [
          {
            type: 'text',
            md: 'To win you need **14 tiles**, arranged into four groups of three and one pair.',
          },
          { type: 'hand', mpsz: '123m 456p 789s 555z 22s' },
        ],
      },
      {
        id: 'grupos',
        number: '3.2',
        title: 'The types of group',
        termos: ['sequencia', 'trinca', 'par'],
        blocks: [
          { type: 'text', md: '**Sequence**: three consecutive numbers of the same suit.' },
          { type: 'hand', mpsz: '345p' },
          { type: 'text', md: '**Triplet**: three identical tiles.' },
          { type: 'hand', mpsz: '777s 555z' },
          { type: 'text', md: '**Pair**: two identical tiles.' },
          { type: 'hand', mpsz: '22s' },
          {
            type: 'tip',
            md: "A sequence doesn't wrap around (8-9-1 doesn't count) and honors (winds and dragons) never form a sequence.",
          },
        ],
      },
      {
        id: 'tenpai',
        number: '3.3',
        title: 'Tenpai: one tile away',
        termos: ['tenpai'],
        blocks: [
          {
            type: 'text',
            md: 'You play with 13 tiles and complete the 14th when you win. When only one is missing, your hand is in **tenpai**. The tiles that complete it are your **waits**.',
          },
          {
            type: 'text',
            md: 'Split the hand into the groups that are already done. What is ==left incomplete== is where the wait is.',
          },
          { type: 'heading', text: 'Two-sided' },
          {
            type: 'hand',
            mpsz: '234m 567p 789s 11z 45m',
            labels: ['Sequence', 'Sequence', 'Sequence', 'Pair', 'Wait'],
            after: '36m',
            afterLabel: 'wait',
            caption: 'The 4-5 is completed by the 3 or the 6: the best wait, up to 8 tiles.',
          },
          { type: 'heading', text: 'Middle' },
          {
            type: 'hand',
            mpsz: '123p 456s 777m 99s 46m',
            labels: ['Sequence', 'Sequence', 'Triplet', 'Pair', 'Wait'],
            after: '5m',
            afterLabel: 'wait',
            caption: 'The 4-6 is only completed by the 5 in the middle.',
          },
          { type: 'heading', text: 'Edge' },
          {
            type: 'hand',
            mpsz: '345m 678p 222s 55z 12m',
            labels: ['Sequence', 'Sequence', 'Triplet', 'Pair', 'Wait'],
            after: '3m',
            afterLabel: 'wait',
            caption: 'The 1-2 is only completed by the 3: there is no 0 on the other side.',
          },
          { type: 'heading', text: 'Two pairs' },
          {
            type: 'hand',
            mpsz: '234m 567p 678s 22p 88s',
            labels: ['Sequence', 'Sequence', 'Sequence', 'Wait', 'Wait'],
            after: '2p8s',
            afterLabel: 'wait',
            caption: 'One pair becomes a triplet and the other stays as the pair.',
          },
          { type: 'heading', text: 'Pair only' },
          {
            type: 'hand',
            mpsz: '123m 456m 789p 111z 5s',
            labels: ['Sequence', 'Sequence', 'Sequence', 'Triplet', 'Wait'],
            after: '5s',
            afterLabel: 'wait',
            caption: 'All 4 groups are done: only the pair for the 5 of Sou is missing.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'Is this hand in tenpai?',
        hand: '234m 567p 11s 345s 78p',
        options: simNao(true),
        answer: 'Yes. It waits on the 6 or the 9 of Pin to complete the 7-8.',
      },
    ],
  },
  {
    id: 'turno',
    number: 4,
    title: 'The turn',
    cover: 'Draw, discard and call tiles.',
    pages: [
      {
        id: 'comprar-descartar',
        number: '4.1',
        title: 'Draw and discard',
        blocks: [
          {
            type: 'text',
            md: 'On your turn you draw a tile from the wall and discard another, face up. Discards go in rows of six in front of you, between your wall and the center of the table, in view of everyone. The turn passes to the player on your right.',
          },
          {
            type: 'image',
            image: 'mesaDescartes',
            alt: "Table seen from above: in front of each wall, a row of 6 discards and the start of a second. In the middle, the center of the table with the round wind (東). One of South's discards is sideways, as in Riichi. To the right of East, outside the wall, an open pon: three tiles, with the leftmost lying sideways.",
            caption:
              'Each player discards in front of them, in rows of 6. To the right of East, a pon: the tile taken lies sideways.',
          },
          {
            type: 'text',
            md: "With another player's discard you can also form a group on the spot: that is a **call**, like pon and chi. The called group stays open on the table, on your right.",
          },
          {
            type: 'tip',
            md: 'On the table, the tile taken from another player lies **sideways**, pointing at whoever discarded it. That way everyone knows where it came from.',
          },
        ],
      },
      {
        id: 'pon',
        number: '4.2',
        title: 'Pon',
        termos: ['pon'],
        blocks: [
          {
            type: 'text',
            md: 'Someone discarded a tile and you have two identical ones in hand. Say "pon", take the tile and show the triplet on the table.',
          },
          {
            type: 'text',
            md: 'It works with the discard of **any player**. Play continues from you: discard a tile.',
          },
          {
            type: 'melds',
            items: [
              { mpsz: '777s', deLado: 0, caption: 'From the left' },
              { mpsz: '777s', deLado: 1, caption: 'From across' },
              { mpsz: '777s', deLado: 2, caption: 'From the right' },
            ],
          },
          {
            type: 'text',
            md: 'After a pon, your hand is **open**. A hand with no discards from other players is **closed**.',
          },
        ],
      },
      {
        id: 'chi',
        number: '4.3',
        title: 'Chi',
        termos: ['chi', 'chamada'],
        blocks: [
          {
            type: 'text',
            md: 'You can complete a sequence with a discard, but only from the player **on your left**. Say "chi" and show the sequence on the table.',
          },
          {
            type: 'melds',
            items: [
              {
                mpsz: '435p',
                deLado: 0,
                caption: 'You took the 4 of Pin: it lies sideways, on the left',
              },
            ],
          },
          { type: 'text', md: 'After a chi, your hand is **open**.' },
        ],
      },
      {
        id: 'prioridade',
        number: '4.4',
        title: 'Who has priority',
        blocks: [
          {
            type: 'text',
            md: 'If more than one player wants the same discard: **ron > pon > chi**.',
          },
          {
            type: 'text',
            md: "**Ron** is winning on someone's discard. You'll see it on the next page.",
          },
        ],
      },
      {
        id: 'tsumo-ron',
        number: '4.5',
        title: 'Tsumo and ron',
        termos: ['tsumo', 'ron'],
        blocks: [
          {
            type: 'text',
            md: "- **Tsumo**: you drew the tile that completed your hand. All the other players pay.\n- **Ron**: the tile came from another player's discard. Only the discarder pays.",
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question:
          'The player across from you discarded the 6 of Pin and you have the 5 and the 7 of Pin. Can you call chi?',
        hand: '57p',
        options: simNao(false),
        answer: 'No. Chi only works with the discard of the player on your left.',
      },
    ],
  },
  {
    id: 'yakus',
    number: 6,
    title: 'Valid hand',
    cover: "Complete isn't enough: to win, the hand needs a yaku.",
    pages: [
      {
        id: 'sem-yaku',
        number: '6.1',
        title: 'No yaku, no win',
        termos: ['yaku'],
        blocks: [
          {
            type: 'text',
            md: "Having 4 groups and 1 pair isn't enough. The hand needs at least one **yaku**, a scoring condition. Without a yaku, the hand can still be in tenpai, and that counts in a draw. It just cannot win.",
          },
          {
            type: 'tip',
            md: 'In the real rules, winning without a yaku is chombo, a serious foul.',
          },
        ],
      },
      {
        id: 'yakus-iniciantes',
        number: '6.2',
        title: 'Yaku to start with',
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
            md: 'Start with these five: with them you can already win most hands. Tap each one to see how it works.',
          },
          {
            type: 'cards',
            items: [
              {
                id: 'riichi',
                title: 'Riichi',
                badge: 'closed only',
                blocks: [
                  {
                    type: 'text',
                    md: 'The most common yaku. With a **closed** hand in tenpai, you say "Riichi" and discard the tile sideways.',
                  },
                  {
                    type: 'text',
                    md: 'On its own it makes your hand valid. After declaring, you can no longer change your hand.',
                  },
                ],
              },
              {
                id: 'menzen-tsumo',
                title: 'Menzen Tsumo',
                badge: 'closed only',
                blocks: [
                  {
                    type: 'text',
                    md: 'Winning by tsumo (with the tile you drew) with a **closed** hand.',
                  },
                ],
              },
              {
                id: 'tanyao',
                title: "Tan'yao",
                badge: 'open or closed',
                blocks: [
                  {
                    type: 'text',
                    md: 'Only tiles from 2 to 8, no terminals and no honors.',
                  },
                  { type: 'hand', mpsz: '234m 567m 345p 678s 55s' },
                  {
                    type: 'tip',
                    md: "Some tables only accept Tan'yao with a closed hand. Agree before you play.",
                  },
                ],
              },
              {
                id: 'yakuhai',
                title: 'Yakuhai',
                badge: 'open or closed',
                blocks: [
                  { type: 'text', md: 'A triplet of a **dragon**, the **round wind** or your **seat wind**.' },
                  { type: 'hand', mpsz: '123m 456p 789s 555z 22s' },
                  { type: 'heading', text: 'Which winds count' },
                  {
                    type: 'text',
                    md: 'Each player has their **seat wind** (the one they drew). The whole table has the **round wind**: in a tonpuusen, East.',
                  },
                  {
                    type: 'text',
                    md: "- Round wind: yaku for everyone.\n- Your seat wind: yaku only for you.\n- If the round wind is also yours, it counts ==double==.\n- A wind that is nobody's gives no yaku.",
                  },
                  {
                    type: 'text',
                    md: 'Example: in the East round, East counts for everyone. For the **oya**, it is also the seat wind: it counts double.',
                  },
                  {
                    type: 'tip',
                    md: 'It also works with an **open** hand: a pon of a dragon or a value wind already gives the hand a yaku.',
                  },
                ],
              },
              {
                id: 'pinfu',
                title: 'Pinfu',
                badge: 'closed only',
                blocks: [
                  {
                    type: 'text',
                    md: "Only sequences, a pair that isn't a dragon or a value wind (yours or the round's), and a two-sided wait (ryanmen).",
                  },
                  {
                    type: 'hand',
                    mpsz: '123m 456p 789p 23s 55m',
                    caption: 'Hand in tenpai',
                    after: '1s4s',
                    afterLabel: 'wait',
                  },
                ],
              },
            ],
          },
          { type: 'heading', text: 'For the next step' },
          {
            type: 'text',
            md: 'Once those five come naturally, these show up a lot at the table:',
          },
          {
            type: 'cards',
            items: [
              {
                id: 'iipeikou',
                title: 'Iipeikou',
                badge: 'closed only',
                blocks: [
                  {
                    type: 'text',
                    md: 'Two ==identical== sequences of the same suit.',
                  },
                  { type: 'hand', mpsz: '234m 234m 567p 789s 55p' },
                ],
              },
              {
                id: 'chanta',
                title: 'Chanta',
                badge: 'open or closed',
                blocks: [
                  {
                    type: 'text',
                    md: 'All groups **and the pair** have a terminal (1 or 9) or an honor. It needs at least one sequence.',
                  },
                  { type: 'hand', mpsz: '123m 789p 999s 111z 77z' },
                ],
              },
              {
                id: 'toitoi',
                title: 'Toitoi',
                badge: 'open or closed',
                blocks: [
                  {
                    type: 'text',
                    md: 'Only triplets (or kans) and a pair. ==No sequences==.',
                  },
                  { type: 'hand', mpsz: '222m 555p 888s 666z 99m' },
                ],
              },
              {
                id: 'honitsu',
                title: "Hon'itsu",
                badge: 'open or closed',
                blocks: [
                  {
                    type: 'text',
                    md: 'The whole hand in **one suit**, plus honors.',
                  },
                  { type: 'hand', mpsz: '123s 456s 789s 555z 11z' },
                ],
              },
              {
                id: 'chinitsu',
                title: "Chin'itsu",
                badge: 'open or closed',
                blocks: [
                  {
                    type: 'text',
                    md: 'The whole hand in **one suit**, ==no honors==.',
                  },
                  { type: 'hand', mpsz: '123p 456p 345p 789p 99p' },
                ],
              },
              {
                id: 'chiitoitsu',
                title: 'Chiitoitsu',
                badge: 'closed only',
                blocks: [
                  {
                    type: 'text',
                    md: "**Seven different pairs**. It is the only hand that doesn't follow the 4 groups + 1 pair formula.",
                  },
                  { type: 'hand', mpsz: '22m 55m 88p 33s 66s 11z 77z' },
                  {
                    type: 'tip',
                    md: "The pairs must be different: four identical tiles don't count as two pairs.",
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
        question: 'Open hand with a chi, no honor triplet. Does it have a yaku?',
        hand: '123m 456p 789s 678p 11m',
        options: simNao(false),
        answer:
          "No. It has terminals (no Tan'yao), it is open (no Riichi, Menzen Tsumo or Pinfu) and it has no value triplet (no Yakuhai).",
      },
    ],
  },
  {
    id: 'pontos',
    number: 8,
    title: 'Points',
    cover: 'What your hand is worth and how to pay.',
    coverTip:
      'Have you played a round where the yaku counts? If not, **play one now**, still without counting points, and come back later.',
    pages: [
      {
        id: 'palitos',
        number: '8.1',
        title: 'The sticks',
        termos: ['riichi', 'honba'],
        blocks: [
          {
            type: 'text',
            md: 'Points are counted with sticks. Each player starts with **25,000**:',
          },
          { type: 'sticks' },
          {
            type: 'text',
            md: 'The 1,000 stick is also the Riichi bet. The 100 sticks count the honba.',
          },
        ],
      },
      {
        id: 'han-fu',
        number: '8.2',
        title: 'Han and fu',
        termos: ['han', 'fu'],
        blocks: [
          {
            type: 'text',
            md: 'The value comes from **han** (yaku and dora) and **fu** (the shape of the hand). The calculator does the math.',
          },
          { type: 'hanFuTutorial' },
          {
            type: 'table',
            headers: ['Yaku', 'Han'],
            rows: [
              ['Riichi', hanYaku('riichi')],
              ['Menzen Tsumo', hanYaku('menzen-tsumo')],
              ["Tan'yao", hanYaku('tanyao')],
              ['Yakuhai', `${hanYaku('yakuhai')} per triplet`],
              ['Pinfu', hanYaku('pinfu')],
            ],
          },
          {
            type: 'text',
            md: "Yaku add up. Riichi + Tan'yao + Pinfu + Menzen Tsumo = **4 han**.",
          },
        ],
      },
      {
        id: 'patamares',
        number: '8.3',
        title: 'The limits',
        termos: ['patamares', 'mangan', 'oya', 'ko'],
        blocks: [
          {
            type: 'text',
            md: "From 5 han on, the hand reaches a limit, with a fixed value. The **ko** is anyone who isn't the oya.",
          },
          {
            type: 'table',
            headers: ['Limit', 'Han', 'Ko', 'Oya'],
            rows: [
              linhaPatamar('Mangan', '5', BASE_PATAMAR.mangan),
              linhaPatamar('Haneman', '6–7', BASE_PATAMAR.haneman),
              linhaPatamar('Baiman', '8–10', BASE_PATAMAR.baiman),
              linhaPatamar('Sanbaiman', '11–12', BASE_PATAMAR.sanbaiman),
              linhaPatamar('Yakuman', '13+', BASE_PATAMAR.yakuman),
            ],
          },
          { type: 'text', md: 'The oya receives **1.5×** the points when winning.' },
          { type: 'tip', md: 'With 3 or 4 han, fu can take the hand to Mangan.' },
        ],
      },
      {
        id: 'quem-paga',
        number: '8.4',
        title: 'Who pays',
        termos: ['ron', 'tsumo'],
        blocks: [
          {
            type: 'text',
            md: "- **Ron**: the discarder pays everything.\n- **Tsumo**: everyone pays. If the winner isn't the oya, the oya pays half and the other two split the rest.",
          },
          {
            type: 'text',
            md: 'The winner also takes any Riichi bets (1,000 each) on the table.',
          },
        ],
      },
      {
        id: 'riichi-aposta',
        number: '8.5',
        title: 'The Riichi bet',
        termos: ['riichi'],
        blocks: [
          {
            type: 'text',
            md: 'When counting points, whoever declares Riichi bets a **1,000** stick in the center of the table.',
          },
          {
            type: 'text',
            md: '- To declare, you need at least 1,000 points.\n- In Mahjong Soul and Tenhou, there must also be 4 or more tiles left to draw from the wall. At a live table, this depends on the rules.\n- If the Riichi tile deals in to someone, the bet is not placed.\n- Whoever wins the hand takes the bets on the table.\n- If nobody wins, the bets stay on the table for the next hand.',
          },
          {
            type: 'tip',
            md: "Riichi also reveals the Ura-dora for the winner, which you'll see in {{onde:dora}}.",
          },
        ],
      },
      {
        id: 'honba-empate',
        number: '8.6',
        title: 'Honba and draws',
        termos: ['honba', 'empate'],
        blocks: [
          {
            type: 'text',
            md: 'Each honba on the table adds 300 points for whoever wins. On tsumo, each player pays 100 more. On ron, the discarder pays the 300. This is added on top: it does not change with the limit hands or with the oya\'s 1.5×.',
          },
          {
            type: 'text',
            md: 'If the wall runs out with no winner, those not in tenpai pay 3,000 in total to those who are.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'A ko wins a Mangan by tsumo. How much does the oya pay?',
        options: [
          { label: pontos(BASE_PATAMAR.mangan) },
          { label: pontos(BASE_PATAMAR.mangan * 2), correct: true },
          { label: pontos(BASE_PATAMAR.mangan * 4) },
        ],
        answer: `${pontos(BASE_PATAMAR.mangan * 2)}, half. The other two pay ${pontos(BASE_PATAMAR.mangan)} each.`,
      },
    ],
  },
  {
    id: 'dora',
    number: 9,
    title: 'Dora',
    cover: 'Bonus tiles that make the hand more expensive.',
    pages: [
      {
        id: 'indicador',
        number: '9.1',
        title: 'The indicator and the dora',
        termos: ['dora'],
        blocks: [
          {
            type: 'text',
            md: 'Remember the tile flipped on the dead wall? It is the **indicator**. The indicator is not the dora: the **dora** is the tile after it. Each dora in your hand is worth 1 han.',
          },
          {
            type: 'image',
            image: 'muroMorto',
            alt: 'Open wall seen from the front: draws on the left, the break and the dead wall on the right, with the dora indicator flipped on the 3rd column from the break.',
            caption: 'The indicator stays flipped on the dead wall.',
          },
          {
            type: 'hand',
            mpsz: '3m',
            caption: 'Indicator 3 of Man',
            after: '4m',
            afterLabel: 'dora',
          },
          { type: 'tip', md: "Dora is not a yaku. Without a yaku, it doesn't help you win." },
        ],
      },
      {
        id: 'ordem-dora',
        number: '9.2',
        title: 'The order',
        termos: ['dora'],
        blocks: [
          {
            type: 'text',
            md: 'Each tile indicates the next. At the end of each sequence, the count returns to the start. If two indicators point to the same tile, each copy of it in your hand is worth 2 han.',
          },
          { type: 'doraCycles' },
        ],
      },
      {
        id: 'aka-dora',
        number: '9.3',
        title: 'Red 5',
        termos: ['aka-dora'],
        blocks: [
          {
            type: 'text',
            md: 'Each red 5 (Aka dora) is worth 1 extra han and works as a normal 5 in the hand. If 5 is also the dora, the red 5 is worth 2 han. Flipped as an indicator, it counts as a normal 5.',
          },
          { type: 'hand', mpsz: '0m 0p 0s' },
          {
            type: 'tip',
            md: 'Not every table plays with red fives. Agree before you play.',
          },
        ],
      },
      {
        id: 'ura-dora',
        number: '9.4',
        title: 'Ura-dora',
        termos: ['ura-dora', 'riichi'],
        blocks: [
          {
            type: 'text',
            md: 'Whoever wins after declaring **Riichi** reveals the tile under each dora indicator. That is the **Ura-dora**: it works as one more indicator, only for the winner.',
          },
          { type: 'tip', md: 'No Riichi, no Ura-dora. One more reason to declare.' },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'The indicator is the Red Dragon. What is the dora?',
        hand: '7z',
        options: [
          { label: 'White', mpsz: '5z', correct: true },
          { label: 'Green', mpsz: '6z' },
          { label: 'Red', mpsz: '7z' },
        ],
        answer: 'The White Dragon: Red → White.',
      },
    ],
  },
  {
    id: 'kan',
    number: 10,
    title: 'Kan',
    cover: 'Four identical tiles, one extra tile and one more dora.',
    pages: [
      {
        id: 'kan',
        number: '10.1',
        title: 'The three kans',
        termos: ['kan'],
        blocks: [
          { type: 'text', md: 'Four identical tiles. There are three ways to make a kan:' },
          {
            type: 'text',
            md: '- **Open kan**: you have three identical tiles and someone discards the fourth. It works with any player, like pon.\n- **Closed kan**: all four are in your hand. Show it on the table with the two ends face down.\n- **Added kan**: you already have a pon and draw the fourth. It lies on top of the sideways tile.',
          },
          {
            type: 'melds',
            items: [
              { mpsz: '8888p', deLado: 1, caption: 'Open kan (from across)' },
              { mpsz: '1111m', viradas: [0, 3], caption: 'Closed kan' },
              { mpsz: '7777s', deLado: 0, empilhada: true, caption: 'Added kan' },
            ],
          },
          {
            type: 'text',
            md: 'Open kan and added kan leave the hand **open**. A closed kan, made only with tiles from your hand, keeps the hand **closed**.',
          },
          { type: 'tip', md: 'Kan has the same priority as pon.' },
          { type: 'heading', text: 'Kan during Riichi' },
          {
            type: 'text',
            md: "After declaring Riichi, you can still make a **closed kan**: if you already had the other three in hand and ==you drew the fourth yourself== from the wall. It just doesn't work if the kan changes your wait.",
          },
          {
            type: 'tip',
            md: "With another player's discard, **it doesn't work**: in Riichi you can't make an open kan or a pon, because the hand can no longer change.",
          },
          { type: 'heading', text: 'The danger of kan' },
          {
            type: 'text',
            md: 'Every kan creates ==one more dora indicator== (the kan dora), and it counts for **everyone** at the table, not just whoever made the kan. Whoever wins in Riichi also looks at the Ura-dora under it: one more chance of dora.',
          },
          {
            type: 'tip',
            md: 'So think before making a kan: the new dora can make the hand of whoever beats you more expensive.',
          },
        ],
      },
      {
        id: 'kan-dora',
        number: '10.2',
        title: 'Replacement and kan dora',
        termos: ['kan-dora'],
        blocks: [
          {
            type: 'text',
            md: 'With four tiles in a group, your hand is one short. After any kan, you draw a **replacement** tile from the dead wall and a new dora indicator is flipped. Then you discard.',
          },
          {
            type: 'image',
            image: 'muroMortoKan',
            alt: 'Dead wall seen from the front, with the 7 columns numbered from the break. The top tile of column 1 is on the table, alone beside the wall: it is the kan replacement. On column 3 the dora indicator is flipped and, on column 4, the kan dora indicator.',
            caption:
              'After a kan: the replacement comes from column 1 and the kan dora flips on 4.',
          },
          {
            type: 'text',
            md: 'Columns 1 and 2, next to the break, hold the **kan replacements**: whoever makes a kan first draws the top tile of column 1. Many tables already move that tile down to the table, alone beside the wall, so nobody knocks the wall over when taking it.',
          },
          {
            type: 'text',
            md: 'Each kan flips one more indicator, the **kan dora**: the top tile of the next column (4, then 5…). It works just like the first indicator.',
          },
          {
            type: 'text',
            md: 'You may not declare a kan once the wall is empty: there is no replacement tile left to draw.',
          },
          {
            type: 'tip',
            md: 'When the kan dora is flipped depends on the rules. In Mahjong Soul and Tenhou, a closed kan flips it right away. An open or added kan only flips it after your discard.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'I made a closed kan. Is my hand still closed?',
        options: simNao(true),
        answer:
          'Yes. A closed kan is made only with tiles from your hand, with no discards from other players.',
      },
    ],
  },
  {
    id: 'fim-partida',
    number: 5,
    title: 'End of the game',
    cover: 'Draws, the next oya and when the game ends.',
    pages: [
      {
        id: 'empate',
        number: '5.1',
        title: 'Draw',
        termos: ['empate', 'tenpai'],
        blocks: [
          {
            type: 'text',
            md: 'A hand can also end **with no winner**. When ==only the dead wall is left== and nobody has completed a hand, it ends in a **draw**.',
          },
          {
            type: 'text',
            md: "Each player says whether they're in tenpai. Those who are show their hand. Those who aren't are **noten** and can leave it face down.",
          },
          {
            type: 'tip',
            md: "When counting points, those not in tenpai pay those who are. You'll see this in Honba and draws, in {{onde:pontos}}.",
          },
        ],
      },
      {
        id: 'proxima-mao',
        number: '5.2',
        title: 'The next hand',
        termos: ['oya', 'renchan'],
        blocks: [
          {
            type: 'text',
            md: '- If the oya won, or was in tenpai in a draw, they **stay oya** and the hand repeats (renchan).\n- Otherwise, East passes to the next player.',
          },
        ],
      },
      {
        id: 'fim',
        number: '5.3',
        title: 'Tonpuusen',
        blocks: [
          {
            type: 'text',
            md: 'To start, play a **tonpuusen**: each player is oya at least once. When the last oya passes East on, the game ends.',
          },
          {
            type: 'text',
            md: 'In your first games, without counting points, whoever won the most hands wins. Once you start counting, whoever has the most points wins, and the game also ends if someone goes below zero.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'The oya won the hand. Who is the oya of the next one?',
        options: [
          { label: 'The same player', correct: true },
          { label: 'The player on their right' },
          { label: 'Whoever won the hand before that' },
        ],
        answer: 'The same player. When the oya wins, they stay oya and the hand repeats.',
      },
      {
        type: 'quiz',
        question:
          "The wall ran out and nobody won. The oya wasn't in tenpai. Who is the oya of the next hand?",
        options: [
          { label: 'The same player' },
          { label: 'The player on their right', correct: true },
          { label: 'Whoever was in tenpai' },
        ],
        answer:
          'The player on their right. In a draw, the oya only stays if they were in tenpai; otherwise, East passes on.',
      },
    ],
  },
]

const topicosRegras: TopicoRegras[] = [
  {
    id: 'furiten',
    section: 'regras',
    title: 'Furiten',
    termos: ['furiten'],
    blocks: [
      {
        type: 'text',
        md: 'In furiten you cannot win by ron, only by tsumo. This applies to ==all== your waits, not just the tile that caused the furiten. Declaring ron in furiten is usually chombo.',
      },
      {
        type: 'text',
        md: '- **By discards**: a tile that would complete your hand is among your discards. It lasts until you change your wait.\n- **Temporary**: you let a tile that would complete your hand go by, without declaring ron. It lasts until your next discard.\n- **Riichi**: after Riichi, you let a tile that would complete your hand go by. It lasts until the end of the hand.',
      },
      {
        type: 'tip',
        md: 'What counts is the shape of the hand, not the yaku. If the tile would complete your hand, furiten applies even if you would have no yaku to win with it.',
      },
    ],
  },
  {
    id: 'kuikae',
    section: 'regras',
    title: 'Swap calling (kuikae)',
    blocks: [
      {
        type: 'text',
        md: 'Right after a chi or a pon, the discard you make that same turn has limits. Calling just to swap a tile for another that does the same job is **kuikae**, and it is not allowed.',
      },
      { type: 'heading', text: 'The same tile' },
      {
        type: 'text',
        md: 'You may not discard a tile identical to the one you just took. This applies to chi and pon.',
      },
      {
        type: 'melds',
        items: [
          {
            mpsz: '555p',
            deLado: 1,
            caption:
              'Pon of the 5 of Pin: if you still hold another 5 of Pin, it cannot go out now',
          },
        ],
      },
      { type: 'heading', text: 'The other end of the sequence' },
      {
        type: 'text',
        md: 'In a chi with two neighboring tiles, the tile at the other end is also forbidden: with it, the sequence would be the same, just shifted.',
      },
      {
        type: 'melds',
        items: [
          {
            mpsz: '234m',
            deLado: 0,
            caption: 'Chi of the 2 of Man with 3-4: you may not discard the 2 or the 5 of Man',
          },
          {
            mpsz: '867s',
            deLado: 0,
            caption: 'Chi of the 8 of Sou with 6-7: you may not discard the 8 or the 5 of Sou',
          },
        ],
      },
      {
        type: 'text',
        md: 'A chi with the middle tile (3 with 2-4) or on a closed edge (3 with 1-2) only forbids the identical tile: there is no other end.',
      },
      { type: 'heading', text: 'Why it is forbidden' },
      {
        type: 'text',
        md: 'Calls are meant to move your hand forward. With kuikae it does not move, because the tile you discard would complete the same group. Without the rule, you could call just to get in the way: break someone\'s Ippatsu or change who draws the last tile of the wall.',
      },
      {
        type: 'tip',
        md: 'If after the call you would have only forbidden tiles to discard, you cannot make the call. In Mahjong Soul and Tenhou the game blocks it. At a live table, a player who makes a kuikae call has a dead hand: they keep drawing and discarding, but can no longer win the hand. Some older rulesets only forbid the identical tile, so agree on it before playing.',
      },
      {
        type: 'quiz',
        question:
          'You hold 5-6 of Pin and chi the 4 of Pin. What can you not discard on that same turn?',
        hand: '56p',
        options: [
          { label: '4 and 7 of Pin', correct: true },
          { label: 'Only the 4 of Pin' },
          { label: '4 and 6 of Pin' },
        ],
        answer:
          'The 4 and 7 of Pin. The 4 is the tile you took; with the 7, the same 5-6 would make 5-6-7, the other end.',
      },
    ],
  },
  {
    id: 'lista-yakus',
    section: 'regras',
    title: 'Yaku list',
    termos: ['yaku', 'yakuman'],
    blocks: [
      {
        type: 'text',
        md: 'All the yaku, with the han of each with a closed and an open hand. **—** means it only counts with a closed hand, and **Y** is yakuman. Tap a yaku to see the example. If the hand can be read more than one way, the reading that scores the most counts. Yakuman do not add up with regular yaku.',
      },
      ...grupoYakus('Sequence', [
        ['pinfu', 'Only sequences, a valueless pair and a two-sided wait'],
        ['iipeikou', 'Two identical sequences of the same suit'],
        ['ryanpeikou', 'Twice two identical sequences'],
        ['sanshoku-doujun', 'The same sequence in all three suits'],
        ['ittsuu', '1-2-3, 4-5-6 and 7-8-9 of the same suit'],
      ]),
      ...grupoYakus('Triplets', [
        ['toitoi', 'Four triplets and a pair'],
        ['sanankou', 'Three triplets formed without calling'],
        ['sanshoku-doukou', 'The same triplet in all three suits'],
        ['sankantsu', 'Three kans'],
        ['chiitoitsu', 'Seven different pairs'],
      ]),
      ...grupoYakus('Terminals and honors', [
        ['tanyao', 'Only tiles from 2 to 8'],
        ['yakuhai', 'Triplet of a dragon or a value wind'],
        ['shousangen', 'Two dragon triplets and a pair of the third'],
        ['chanta', 'A terminal or honor in every group and the pair'],
        ['junchan', 'A terminal in every group and the pair, no honors'],
        ['honroutou', 'Only terminals and honors'],
      ]),
      ...grupoYakus('Suit', [
        ['honitsu', 'One suit only, with honors'],
        ['chinitsu', 'One suit only, no honors'],
      ]),
      ...grupoYakus('Others', [
        ['riichi', 'Declare tenpai with a closed hand'],
        ['double-riichi', 'Riichi on the very first discard'],
        ['ippatsu', 'Win before your next discard after Riichi, with no calls in between'],
        ['menzen-tsumo', 'Tsumo with a closed hand'],
        ['haitei', 'Tsumo with the last tile of the wall'],
        ['houtei', 'Ron on the last discard'],
        ['rinshan', 'Win with the kan replacement'],
        ['chankan', 'Ron on the tile another player adds to a pon'],
        ['renhou', 'Ron before your first draw'],
      ]),
      ...grupoYakus('Yakuman', [
        ['kokushi', 'One of each terminal and honor, plus one repeated'],
        ['suuankou', 'Four triplets formed without calling'],
        ['daisangen', 'Triplets of all three dragons'],
        ['shousuushii', 'Three wind triplets and a pair of the fourth'],
        ['daisuushii', 'Triplets of all four winds'],
        ['tsuuiisou', 'Only honors'],
        ['chinroutou', 'Only terminals'],
        ['ryuuiisou', 'Only green tiles'],
        ['chuuren', '1-1-1-2-3-4-5-6-7-8-9-9-9 of one suit, plus one'],
        ['suukantsu', 'Four kans'],
        ['tenhou', 'The oya wins with the tiles they were dealt'],
        ['chiihou', 'Win by tsumo on your first draw'],
      ]),
      { type: 'tip', md: conteudoGuiaBolso('en').notaKazoe },
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
      {
        type: 'tip',
        md: 'To use any of them in the calculator, turn it on in **Calculation rules → Local yaku**. They all start off. The full list, with each value, is in the Local yaku tab of the Pocket guide.',
      },
    ],
  },
  {
    id: 'chombo',
    section: 'chombo-honba',
    title: 'Chombo',
    termos: ['chombo'],
    blocks: [
      {
        type: 'text',
        md: 'A serious foul that spoils the hand in a way that can\'t be undone. The most common cases:\n- Declaring a win without a complete hand, without a yaku or in furiten.\n- Declaring Riichi without being in tenpai. This shows when the hand ends in a draw and you have to reveal it.\n- After Riichi, making a closed kan that changes your wait.\n- Knocking over the wall or revealing your hand by mistake.',
      },
      {
        type: 'text',
        md: 'The hand is voided and replayed with the same honba count, and anyone who declared Riichi in it takes their bet back. The most common penalty is paying a Mangan as if it were a tsumo. If the offender is a ko, they pay 4,000 to the oya and 2,000 to each of the others. If it\'s the oya, they pay 4,000 to each player. Tournaments usually charge more, and casual tables may not charge at all. Agree on it before you play.',
      },
    ],
  },
  {
    id: 'honba',
    section: 'chombo-honba',
    title: 'Honba',
    termos: ['honba'],
    blocks: [
      {
        type: 'text',
        md: 'The **honba** count goes up by one when the oya wins or when the hand ends with no winner, even if East moves on. The oya puts a 100 stick on the table to count them. When a ko wins, the count goes back to zero.',
      },
      {
        type: 'tip',
        md: "Each honba makes the next win worth more. How much, you'll see in {{onde:pontos}}.",
      },
    ],
  },
  {
    id: 'hanchan',
    section: 'regras',
    title: 'Hanchan: East and South',
    blocks: [
      {
        type: 'text',
        md: 'The standard game in clubs and tournaments. After everyone has been oya in the East round, the **South** round starts and each player is oya again.',
      },
      {
        type: 'text',
        md: 'In the South round, the round wind becomes South. It lasts twice as long as a tonpuusen and gives more time to recover points.',
      },
      {
        type: 'tip',
        md: '**Nobody reached 30,000?** At many tables, such as on Mahjong Soul and Tenhou, the game continues into the **West** round until someone passes 30,000. Under EMA rules, it ends after South regardless.',
      },
    ],
  },
  {
    id: 'sanma',
    section: 'regras',
    title: "Sanma: 3 players",
    blocks: [
      { type: 'text', md: "**Sanma** is Riichi with 3 players, widely played in Japan and on Mahjong Soul. The rules are the same, with the differences below." },
      { type: 'heading', text: "Tiles" },
      { type: 'text', md: "The **2 to 8 of Man** are removed, leaving 108 tiles. Only the 1 and 9 of Man remain. Red fives exist only in Pin and Sou." },
      { type: 'hand', mpsz: '19m', caption: "All that is left of Man" },
      { type: 'heading', text: "Table and calls" },
      { type: 'text', md: "- There are only the East, South and West seats.\n- Pon and Kan stay, ==only Chi is gone==.\n- A 1m indicator makes 9m the dora, and 9m makes 1m the dora.\n- No abortive draw for four winds, four Riichi or triple ron. Kyuushu kyuuhai stays." },
      { type: 'heading', text: "Kita (North)" },
      { type: 'text', md: "With a North in hand you can call **Kita**: set it aside next to your hand and draw a replacement. Each Kita is worth **1 dora** (nukidora). It is not a call, so the hand stays closed and Tan'yao still counts. With a West indicator, each Kita is worth 2." },
      { type: 'hand', mpsz: '4z', caption: "Each North set aside is 1 dora" },
      { type: 'heading', text: "Yaku" },
      { type: 'text', md: "- **Sanshoku doujun** and a Man **Ittsu** are impossible.\n- Kokushi, Chinroutou and Sanshoku doukou are still possible, since 1m and 9m exist.\n- After a Kita there is no Tenhou or Chiihou. Winning on the Kita replacement counts as Rinshan.\n- Usually a North in hand is not yakuhai." },
      { type: 'heading', text: "Payments" },
      { type: 'text', md: "Ron pays the same as with 4 players. On tsumo only 2 pay. With **tsumo-son**, the most common rule, the North share is lost: a non-dealer Mangan is 6,000 instead of 8,000. Some tables split that share between the two payers. Noten totals 2,000 instead of 3,000." },
      { type: 'tip', md: "Pick 3 players in the settings of the Hand calculator, Han and Fu, Match and Tournament to have the app count everything as Sanma." },
    ],
  },
  {
    id: 'cinco-blocos',
    section: 'estrategia',
    title: 'The 5 blocks',
    termos: ['par', 'trinca', 'sequencia'],
    blocks: [
      {
        type: 'text',
        md: 'A complete hand has **5 blocks**: 4 groups and 1 pair. So the hand moves faster when you keep it at ==5 blocks==, each one done or on its way.',
      },
      {
        type: 'text',
        md: 'A block is a pair, a triplet, a sequence or a nearly done group (two tiles waiting for the third).',
      },
      {
        type: 'hand',
        mpsz: '55p 777s 345m 68p',
        labels: ['Pair', 'Triplet', 'Sequence', 'Nearly done'],
        caption: 'The four types of block',
      },
      { type: 'tip', md: "It doesn't apply to Chiitoitsu (seven pairs) or Kokushi musou." },
      { type: 'heading', text: 'Example' },
      {
        type: 'hand',
        mpsz: '345m 24m 55p 46p 778s 12s',
        labels: ['Sequence', 'Middle', 'Pair', 'Middle', 'Nearly done', 'Edge'],
      },
      {
        type: 'text',
        md: 'That is **6 blocks** for 5 places: one has to go. Which?',
      },
      {
        type: 'text',
        md: '- **345m and 55p** are already done: they stay.\n- **778s** accepts the 6, the 7 and the 9 of Sou: great, it stays.\n- **24m and 46p** wait in the middle (3m and 5p), but become two-sided if a 5m, or a 3p or 7p, arrives.\n- **12s** waits on the edge and only the 3s completes it: it is the ==worst block==.',
      },
      {
        type: 'hand',
        mpsz: '12s',
        caption: 'Break up the worst block, starting with the 1 of Sou',
        after: '3s',
        afterLabel: 'only wait',
      },
    ],
  },
  {
    id: 'eficiencia',
    section: 'estrategia',
    title: 'The first discards',
    termos: ['tenpai'],
    blocks: [
      {
        type: 'text',
        md: 'Efficiency means reaching tenpai faster, keeping the shapes that accept **more tiles**.',
      },
      {
        type: 'text',
        md: 'With ==loose== tiles (no pair and no neighbor of the same suit), discard in this order, from first to last:',
      },
      { type: 'hand', mpsz: '234z', caption: "1. Winds that aren't yours or the round's" },
      { type: 'hand', mpsz: '19m 19p 19s', caption: '2. Terminals (1 and 9)' },
      { type: 'hand', mpsz: '567z', caption: '3. Dragons' },
      { type: 'hand', mpsz: '1z', caption: "4. Last of all, your wind and the round's" },
      {
        type: 'text',
        md: 'Which winds give you a yaku is in Yakuhai, in {{onde:yakus}}. In the East round, the **oya** keeps East until the end: for them, it counts double. For the others, East is worth as much as a dragon.',
      },
      {
        type: 'tip',
        md: "Don't hold a value honor forever: if it hasn't formed a pair within a few turns, discard it early. Later on, it may be the very tile another player is waiting for.",
      },
    ],
  },
  {
    id: 'ordem-muda',
    section: 'estrategia',
    title: 'When the order changes',
    termos: ['par'],
    blocks: [
      { type: 'heading', text: 'A pair is not a loose tile' },
      {
        type: 'hand',
        mpsz: '33z 99m',
        caption: 'A pair of a valueless wind and a pair of terminals: they stay',
      },
      {
        type: 'text',
        md: 'A pair of a valueless wind can be the pair of the hand (even in Pinfu), and a pair of terminals stays too.',
      },
      { type: 'heading', text: 'A terminal with a neighbor is not loose' },
      {
        type: 'hand',
        mpsz: '12p 13s',
        caption: '1 with 2, or 1 with 3: already half a group',
      },
      { type: 'heading', text: '1 next to 4' },
      { type: 'hand', mpsz: '14p', caption: '1 next to 4 (or 9 next to 6): the 1 goes' },
      {
        type: 'text',
        md: 'The 1 hardly helps when you have a 4 of the same suit: the 2 and 3 that would suit it fit ==better with the 4==.',
      },
      { type: 'heading', text: 'Other cases' },
      {
        type: 'text',
        md: "- **An honor already discarded** is worth less: fewer copies remain to make a pair.\n- **Yaku like Hon'itsu and Chanta** change everything: then honors and terminals can be worth more.",
      },
    ],
  },
  {
    id: 'contagem-pedras',
    section: 'estrategia',
    title: 'How many tiles help',
    termos: ['ryanmen'],
    blocks: [
      {
        type: 'text',
        md: 'Why that order? Count how many tiles turn a loose tile into a pair or half a group. The more tiles help, the more it is worth keeping.',
      },
      {
        type: 'table',
        headers: ['Loose tile', 'Tiles that help'],
        rows: [
          ['Honor', '3 (pair only)'],
          ['1 and 9', '11'],
          ['2 and 8', '15'],
          ['3 to 7', '19'],
        ],
      },
      {
        type: 'hand',
        mpsz: '1p',
        caption: 'Loose 1 of Pin: the pair, the 2 and the 3 help',
        after: '1p2p3p',
        afterLabel: 'help',
      },
      {
        type: 'hand',
        mpsz: '5p',
        caption: 'Loose 5 of Pin: the pair and 3 through 7 help',
        after: '3p4p5p6p7p',
        afterLabel: 'help',
      },
      {
        type: 'tip',
        md: 'By the count alone: 3 to 7 > 2 and 8 > 1 and 9 > honors. What moves an honor up the line is the yaku it can give.',
      },
      { type: 'heading', text: 'Prefer two-sided waits' },
      {
        type: 'text',
        md: 'Count how many tiles work: each type has 4 copies.',
      },
      {
        type: 'hand',
        mpsz: '23m',
        caption: 'Two-sided: up to 8 tiles',
        after: '14m',
        afterLabel: 'wait',
      },
      {
        type: 'hand',
        mpsz: '13m',
        caption: 'Middle: up to 4 tiles',
        after: '2m',
        afterLabel: 'wait',
      },
      {
        type: 'hand',
        mpsz: '12m',
        caption: 'Edge: up to 4 tiles',
        after: '3m',
        afterLabel: 'wait',
      },
    ],
  },
  {
    id: 'quando-defender',
    section: 'estrategia',
    title: 'Attack or defend?',
    termos: ['tenpai', 'riichi'],
    blocks: [
      {
        type: 'text',
        md: 'When someone declares Riichi, look at your hand. **Shanten** is how far you are from tenpai: at 1-shanten you need one tile, at 2-shanten you need two.',
      },
      {
        type: 'hand',
        mpsz: '234m 567p 11s 345s 78p',
        caption: 'Tenpai: waits on the 6 or the 9 of Pin',
      },
      {
        type: 'hand',
        mpsz: '234m 567p 11s 34s 78p 9m',
        caption: '1-shanten: one tile away from tenpai',
      },
      {
        type: 'text',
        md: '- **In tenpai**: attacking is usually worth it, especially if you are the oya. It depends on what your hand is worth.\n- **1-shanten**: consider whether many tiles still help and whether the hand is worth the risk.\n- **2-shanten or more**: ==defend==.',
      },
      { type: 'heading', text: 'What to weigh' },
      {
        type: 'text',
        md: '- How many dora are visible?\n- Is the player in tenpai the oya? They get 1.5×.\n- What is your hand worth?\n- What is the score?\n- How many hands are left in the game?',
      },
    ],
  },
  {
    id: 'defesa',
    section: 'estrategia',
    title: 'Defense: genbutsu',
    termos: ['riichi', 'furiten'],
    blocks: [
      {
        type: 'text',
        md: 'Defending means discarding the tile with the ==lowest chance== of being the wait of whoever declared Riichi.',
      },
      {
        type: 'text',
        md: 'The basis of it all is **furiten**: if ==any== tile of their wait is in their discards, they cannot ron with any of their waits, not even the others.',
      },
      {
        type: 'hand',
        mpsz: '45s',
        caption: 'If they wait with 4-5 of Sou and already discarded the 3…',
        after: '3s6s',
        afterLabel: 'furiten on both',
      },
      { type: 'heading', text: 'Genbutsu: their own tiles' },
      {
        type: 'text',
        md: 'Everything the Riichi player ==has already discarded== is 100% safe against them: if that tile were one of their waits, they would be in furiten and could not ron.',
      },
      {
        type: 'hand',
        mpsz: '9m 2z 7p 3s',
        caption: 'Their discards: all safe against them',
      },
      {
        type: 'tip',
        md: 'Only genbutsu is 100%. Suji, kabe and the rest guarantee nothing, but they are much safer than a random tile.',
      },
      {
        type: 'text',
        md: '**When in doubt**: genbutsu first, then honors that have appeared two or three times, then suji. Giving up on a weak hand is good play.',
      },
    ],
  },
  {
    id: 'suji',
    section: 'estrategia',
    title: 'Defense: suji',
    termos: ['furiten', 'ryanmen'],
    blocks: [
      {
        type: 'text',
        md: 'The discards of whoever declared Riichi show tiles that are safer for you. If they discarded a 4, the ==1 and 7== of the same suit become safer.',
      },
      {
        type: 'text',
        md: 'These numbers three apart (1-4-7, 2-5-8 and 3-6-9) are called **suji**. They protect against the two-sided wait, the most common one.',
      },
      { type: 'heading', text: 'Why it works' },
      {
        type: 'text',
        md: 'They discarded the **5 of Pin**. If they were waiting with 3-4 or 6-7 of Pin, the 5 would be one of the waits and they would be in furiten. So they are ==not waiting== with these two shapes:',
      },
      {
        type: 'hand',
        mpsz: '34p',
        caption: '3-4 would wait on the 2 or 5: impossible',
        after: '2p5p',
        afterLabel: 'wait',
      },
      {
        type: 'hand',
        mpsz: '67p',
        caption: '6-7 would wait on the 5 or 8: impossible',
        after: '5p8p',
        afterLabel: 'wait',
      },
      {
        type: 'text',
        md: 'That is why the **2 and 8 of Pin** become safer: they are the suji of the 5.',
      },
      { type: 'heading', text: 'The three references' },
      {
        type: 'text',
        md: 'The 4, 5 and 6 are the references because each one rules out ==two== two-sided waits. If they discarded one of them, ==discarding its suji== is safer for you:',
      },
      {
        type: 'hand',
        mpsz: '4p',
        caption: 'They discarded the 4: you can let go of the 1 and 7 with less risk',
        after: '1p7p',
        afterLabel: 'safer',
      },
      {
        type: 'hand',
        mpsz: '5p',
        caption: 'They discarded the 5: the 2 and 8 become safer',
        after: '2p8p',
        afterLabel: 'safer',
      },
      {
        type: 'hand',
        mpsz: '6p',
        caption: 'They discarded the 6: the 3 and 9 become safer',
        after: '3p9p',
        afterLabel: 'safer',
      },
      { type: 'heading', text: "What suji doesn't cover" },
      {
        type: 'hand',
        mpsz: '46p',
        caption: 'Middle: 4-6 waits on the 5 even with the 2 and 8 discarded',
        after: '5p',
        afterLabel: 'wait',
      },
      {
        type: 'text',
        md: "Suji doesn't protect against middle waits, edge waits (1-2 waiting on 3), pair waits or triplet waits.",
      },
      {
        type: 'tip',
        md: "That is exactly where the **suji trap** lives: anyone who knows the rule can wait on a suji on purpose. You'll see how, right after half suji.",
      },
      { type: 'heading', text: 'Not every suji is equal' },
      {
        type: 'text',
        md: '- **1 and 9**: the safest. They can only be waited on as a pair or in a triplet.\n- **2 and 8**: they can also be waited on in the middle (the 2 with 1-3).\n- **3 and 7**: the least safe. They can also be waited on in the middle and on the edge (the 3 with 1-2).',
      },
      {
        type: 'text',
        md: 'Be careful with the suji of the ==Riichi tile==. Someone with 1-3-5 who lets go of the 5 to declare is left waiting on the 2, which looks safe as suji of the 5. This doesn\'t apply to 1 and 9.',
      },
      {
        type: 'tip',
        md: 'The more suji are already in their discards, the more dangerous the other tiles get: if they have a two-sided wait, it is in one of the suji that are left.',
      },
    ],
  },
  {
    id: 'meio-suji',
    section: 'estrategia',
    title: 'Defense: half suji and nakasuji',
    termos: ['ryanmen'],
    blocks: [
      { type: 'heading', text: 'Half suji' },
      {
        type: 'hand',
        mpsz: '8m',
        caption: 'They only discarded the 8: the 5 is only a little safer',
        after: '5m',
        afterLabel: 'half safe',
      },
      {
        type: 'text',
        md: 'The 8 rules out 6-7 (which would wait on 5 or 8), but not 3-4. They can still wait on the 5 with 3-4:',
      },
      {
        type: 'hand',
        mpsz: '34m',
        caption: 'Still possible: waits on the 2 or 5',
        after: '2m5m',
        afterLabel: 'wait',
      },
      {
        type: 'text',
        md: 'That is why the 5 is only **half suji**: safer than nothing, less safe than a real suji.',
      },
      { type: 'heading', text: 'Nakasuji' },
      {
        type: 'hand',
        mpsz: '2s8s',
        caption: 'They discarded the 2 and 8: the 5 is as safe as a suji',
        after: '5s',
        afterLabel: 'safer',
      },
      {
        type: 'text',
        md: 'With the 2 **and** 8 discarded, 3-4 and 6-7 are impossible. The 5 is protected on both sides and counts as ==a real suji==. The same goes for the 4 (1 and 7) and the 6 (3 and 9).',
      },
    ],
  },
  {
    id: 'armadilha-suji',
    section: 'estrategia',
    title: 'Attack: suji trap',
    termos: ['riichi', 'furiten'],
    blocks: [
      {
        type: 'text',
        md: "Now from the other side of the table: whoever defends with suji thinks that if you discarded a 4, the 1 and 7 are safe. The **suji trap** is ==waiting on exactly that suji==, with a shape suji doesn't cover.",
      },
      { type: 'heading', text: 'How to set it up' },
      {
        type: 'hand',
        mpsz: '4m 68m',
        caption: 'You have the 4 and the 6-8 of Man',
      },
      {
        type: 'steps',
        items: [
          '**Discard the bait**: the 4 of Man. To the others, the 1 and 7 of Man now look safe.',
          'Keep the **middle** wait: the 6-8 waits on the 7, the suji of the 4 you let go.',
          'Whoever defends with suji discards the 7 thinking it is safe, and you call ron.',
        ],
      },
      {
        type: 'hand',
        mpsz: '68m',
        caption: 'Waits on the 7, which looks safe because of the discarded 4',
        after: '7m',
        afterLabel: 'wait',
      },
      { type: 'heading', text: 'Other shapes that work' },
      {
        type: 'hand',
        mpsz: '89m',
        caption: 'Edge: 8-9 waits on the 7',
        after: '7m',
        afterLabel: 'wait',
      },
      {
        type: 'hand',
        mpsz: '11m 55p',
        caption: 'Two pairs: waits on the 1 (suji of the 4) or the 5 of Pin',
        after: '1m5p',
        afterLabel: 'wait',
      },
      {
        type: 'text',
        md: 'What ==does not work== is a two-sided wait: with the 4 discarded, a 5-6 waiting on 4 or 7 leaves you in **furiten**, because the 4 is in your discards.',
      },
      {
        type: 'hand',
        mpsz: '56m',
        caption: 'Furiten: the 4 is one of the waits and is already in your discards',
        after: '4m7m',
        afterLabel: "doesn't work",
      },
      { type: 'heading', text: 'The strongest bait' },
      {
        type: 'text',
        md: 'Declaring Riichi ==with the bait itself==. Everyone looks at the Riichi tile and trusts its suji. Bait discarded early also helps, because it adds sotogawa: the outside looks even safer.',
      },
      { type: 'heading', text: 'Cautions' },
      {
        type: 'text',
        md: "- A middle or edge wait accepts **fewer tiles** (up to 4) than a two-sided one (up to 8). Only switch when the trap is worth it.\n- It works against those who **defend with suji**. Beginners discard without reading your discards, and experienced players distrust suji near a Riichi.\n- Don't overdo it: if you always set traps, the others stop trusting your suji.",
      },
    ],
  },
  {
    id: 'kabe',
    section: 'estrategia',
    title: 'Defense: kabe',
    termos: ['ryanmen'],
    blocks: [
      {
        type: 'text',
        md: '**Kabe** means wall. It is looking at where the 4 copies of a tile are: in the discards, in the calls, on the dora indicator and in your hand. When ==all 4 are visible==, nobody else can have a group that needs it.',
      },
      {
        type: 'hand',
        mpsz: '3333p',
        caption: 'All 4 copies of the 3 of Pin are visible',
      },
      {
        type: 'hand',
        mpsz: '23p 34p 13p',
        caption: 'None of these is possible: they all need a 3',
      },
      {
        type: 'hand',
        mpsz: '3p',
        caption: 'Behind the wall',
        after: '1p2p',
        afterLabel: 'safer',
      },
      {
        type: 'tip',
        md: "Kabe doesn't make a tile 100% safe: it can still be waited on as a pair or a triplet. But it is much safer than a random tile.",
      },
      { type: 'heading', text: 'Which tiles become safer' },
      {
        type: 'table',
        headers: ['All 4 visible', 'Become safer'],
        rows: [
          ['2', '1'],
          ['3', '1 and 2'],
          ['4', '2 and 3'],
          ['5', '3 and 7'],
          ['6', '7 and 8'],
          ['7', '8 and 9'],
          ['8', '9'],
        ],
      },
      {
        type: 'text',
        md: 'With 2, 3 or 4, the two tiles ==below== become safer. With 6, 7 or 8, the two ==above==. With the 5, the 3 and 7.',
      },
      {
        type: 'hand',
        mpsz: '1111s',
        caption: 'Terminal: all 4 copies visible protect nothing',
      },
      { type: 'heading', text: 'No chance and one chance' },
      {
        type: 'hand',
        mpsz: '6666m',
        caption: 'No chance: all 4 visible',
      },
      {
        type: 'hand',
        mpsz: '666m',
        caption: 'One chance: 3 of the 4 visible',
      },
      {
        type: 'text',
        md: "- **No chance**: there is no chance of a two-sided wait using it, and it also holds against a middle wait. It is as safe as suji, or more.\n- **One chance**: it's less likely that someone has the last one, but they might. It is worth more early and mid-hand; near the end, the last copy may already be in someone's hand.",
      },
    ],
  },
  {
    id: 'sotogawa',
    section: 'estrategia',
    title: 'Defense: sotogawa',
    termos: ['riichi'],
    blocks: [
      {
        type: 'text',
        md: '**Sotogawa** is the outside. Whoever discards a middle tile ==very early== (in the first row) probably was not keeping the tiles between it and the end of the suit: if they were, it would be useful.',
      },
      {
        type: 'hand',
        mpsz: '233m 334m',
        caption: "With one of these, they wouldn't let go of the 3 of Man early",
      },
      {
        type: 'text',
        md: 'If they did, they probably already completed the group. Tiles up to 2 numbers away, ==toward the end of the suit==, become a little safer:',
      },
      {
        type: 'hand',
        mpsz: '3m',
        caption: 'They discarded the 3 early: the 1 and 2 (outside) become a little safer',
        after: '1m2m',
        afterLabel: 'safer',
      },
      {
        type: 'table',
        headers: ['Discarded early', 'Outside'],
        rows: [
          ['2', '1'],
          ['3', '1 and 2'],
          ['4', '2 and 3'],
          ['5', '3 and 7'],
          ['6', '7 and 8'],
          ['7', '8 and 9'],
          ['8', '9'],
        ],
      },
      {
        type: 'text',
        md: "- It works best against good players: the idea assumes they discard efficiently.\n- A tile that is both sotogawa **and** suji is safer.\n- It doesn't apply to the tile they declared Riichi with, even if early.",
      },
      {
        type: 'hand',
        mpsz: '3p5p',
        caption: 'They discarded the 3 and 5: the 2 is sotogawa of the 3 and suji of the 5',
        after: '2p',
        afterLabel: 'much safer',
      },
    ],
  },
  {
    id: 'matagi-suji',
    section: 'estrategia',
    title: 'Defense: matagi suji',
    termos: ['riichi'],
    blocks: [
      {
        type: 'text',
        md: '**Matagi suji** is the opposite of sotogawa: it shows the ==most dangerous== tiles. Look at the late discards, especially the tile they declared Riichi with.',
      },
      {
        type: 'hand',
        mpsz: '3m',
        caption: 'Declared Riichi discarding the 3 of Man',
      },
      {
        type: 'hand',
        mpsz: '233m 334m',
        caption: 'It may have come from one of these',
      },
      {
        type: 'hand',
        mpsz: '23m 34m',
        caption: 'That leaves a 2-3 or a 3-4 in the hand',
      },
      {
        type: 'hand',
        mpsz: '3m',
        caption: 'So the most likely waits are 1-4 and 2-5',
        after: '1m4m2m5m',
        afterLabel: 'most dangerous',
      },
      {
        type: 'text',
        md: 'This works for any tile: the dangerous ones are the two-sided waits that ==straddle== it.',
      },
      {
        type: 'tip',
        md: "You don't need to memorize matagi suji. On defense the order is genbutsu, then suji and kabe, then sotogawa. Matagi suji helps you decide between attacking and folding.",
      },
      {
        type: 'text',
        md: `To go deeper: [Suji in mahjong, by NPMahjong](${ARTIGO_SUJI}).`,
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
    title: 'First games',
    cover: 'Everything you need to play a round, with no yaku and no point counting.',
    modules: ['pedras', 'mesa', 'mao', 'turno', 'fim-partida'].map(modulo),
  },
  {
    id: 'ir-alem',
    number: 2,
    title: 'Going further',
    cover:
      'Yaku, chombo and honba: the rules of the real game, still without counting points.',
    milestone: {
      title: 'You can play now!',
      md: "Before moving on, ==play a round== (a tonpuusen). For now, with no yaku and no point counting: whoever completes a hand wins, and East passes on as you just saw.\nWhat you've seen so far is the **foundation**. The full game goes further, and the next modules show the rest.",
    },
    modules: [
      modulo('yakus'),
      moduloRegras('chombo-honba', 7, 'Chombo and honba', 'The mistake that voids a hand and the hand that repeats.'),
    ],
  },
  {
    id: 'pontos-parte',
    number: 3,
    title: 'Points',
    cover: 'What each hand is worth, with dora and kan.',
    milestone: {
      title: 'Play again!',
      md: 'Before points, ==play a game== where the yaku counts. Still without counting points: write down who wins each hand on a score sheet, and at the end whoever won the most hands wins.',
    },
    modules: ['pontos', 'dora', 'kan'].map(modulo),
  },
  {
    id: 'aprofundando',
    number: 4,
    title: 'Going deeper',
    cover:
      'More rules that also apply in every game.',
    modules: [
      moduloRegras('regras', 11, 'More rules', 'Details that are also part of the game.'),
    ],
  },
  {
    id: 'estrategia-parte',
    number: 5,
    title: 'Strategy',
    cover: 'To play better: what to discard and when to defend.',
    modules: [
      moduloRegras('estrategia', 12, 'Strategy', 'To play better after your first games.', [
        {
          type: 'quiz',
          question: 'Your hand has 6 blocks. Which do you break up first?',
          hand: '345m 24m 55p 46p 778s 12s',
          options: [
            { label: '1-2 of Sou', mpsz: '12s', correct: true },
            { label: '2-4 of Man', mpsz: '24m' },
            { label: '7-7-8 of Sou', mpsz: '778s' },
          ],
          answer:
            'The 1-2 of Sou. It waits on the edge and only the 3 of Sou completes it. The 2-4 of Man can still become two-sided, and the 7-7-8 accepts three different tiles.',
        },
        {
          type: 'quiz',
          question: 'You drew and must discard. Which tile goes first?',
          hand: '234m 9m 55p 678p 45s 79s 4z',
          options: [
            { label: 'North', mpsz: '4z', correct: true },
            { label: '9 of Man', mpsz: '9m' },
            { label: '7 of Sou', mpsz: '7s' },
          ],
          answer:
            "North (if it isn't your wind or the round's). On its own it can only become a pair and gives no yaku. The 9 of Man can still become 7-8-9 and the 7-9 of Sou waits on the 8.",
        },
        {
          type: 'quiz',
          question: 'The 1 and 4 of Pin are alone in the suit. Which goes?',
          hand: '14p',
          options: [
            { label: '1 of Pin', mpsz: '1p', correct: true },
            { label: '4 of Pin', mpsz: '4p' },
          ],
          answer:
            'The 1 of Pin. The 2 and 3 that would help the 1 fit better with the 4, which also accepts the 5 and 6.',
        },
        {
          type: 'quiz',
          question:
            "Someone declared Riichi. Your hand is 2-shanten and isn't worth much. What do you do?",
          options: [{ label: 'Defend', correct: true }, { label: 'Attack' }],
          answer:
            'Defend. You are two tiles from tenpai: the chance of getting there before paying for their hand is small.',
        },
        {
          type: 'quiz',
          question: 'They only discarded the 8 of Man. Is the 5 of Man suji?',
          hand: '8m',
          options: [{ label: 'Yes, it is suji' }, { label: 'No, only half suji', correct: true }],
          answer:
            'Only half suji. They can still have 3-4 of Man waiting on the 2 or 5. For the 5 to count as a real suji, the 2 must have come out too.',
        },
        {
          type: 'quiz',
          question:
            'You want to set a trap waiting on the 7 of Man with 6-8. Which tile is the best bait to discard?',
          hand: '68m',
          options: [
            { label: '4 of Man', mpsz: '4m', correct: true },
            { label: '5 of Man', mpsz: '5m' },
            { label: '9 of Man', mpsz: '9m' },
          ],
          answer:
            'The 4 of Man. The 7 is suji of the 4: whoever defends with suji thinks the 7 is safe and discards it to you.',
        },
        {
          type: 'quiz',
          question:
            'Someone declared Riichi and all 4 copies of the 3 of Pin are visible. Which of these is safest?',
          hand: '3333p',
          options: [
            { label: '1 of Pin', mpsz: '1p', correct: true },
            { label: '4 of Pin', mpsz: '4p' },
            { label: '6 of Pin', mpsz: '6p' },
          ],
          answer:
            'The 1 of Pin. It would only be waited on by a 2-3, and with all four 3s visible nobody has a 2-3. The 4 and 6 can still be waited on in several ways.',
        },
        {
          type: 'quiz',
          question:
            'You are the oya, in the East round. You have a loose East and a loose Green Dragon. Which do you keep longer?',
          hand: '1z 6z',
          options: [
            { label: 'East', mpsz: '1z', correct: true },
            { label: 'Green', mpsz: '6z' },
          ],
          answer:
            'East. For the oya in the East round, it is both the seat wind and the round wind: a triplet of it is worth 2 han.',
        },
      ]),
    ],
  },
]

trocarReferencias(
  tutorialParts,
  (parte, numeroModulo, titulo) => `Part ${parte}, Module ${numeroModulo} (${titulo})`,
)

/** Verbetes do Glossário do app, mais os termos de mesa que só o guia usa. */
const glossary: TermoGlossarioGuia[] = [
  { term: 'Chombo', definition: doGlossario('chombo') },
  { term: 'Dora', definition: doGlossario('dora') },
  { term: 'Fu', definition: doGlossario('fu') },
  { term: 'Furiten', definition: doGlossario('furiten') },
  {
    term: 'Genbutsu',
    definition: 'A tile the Riichi player has already discarded: safe against them.',
  },
  { term: 'Han', definition: doGlossario('han') },
  { term: 'Hanchan', definition: 'Standard game, with the East and South rounds.' },
  { term: 'Honba', definition: doGlossario('honba') },
  { term: 'Ko', definition: doGlossario('ko') },
  { term: 'Menzen', definition: 'Closed hand: no discards from other players.' },
  {
    term: 'Dead wall',
    definition:
      '14 tiles set aside after the break, not drawn normally. It holds the dora indicator and the kan replacements.',
  },
  { term: 'Oya', definition: doGlossario('oya') },
  {
    term: 'Suji',
    definition:
      'Numbers three apart in the same suit (1-4-7, 2-5-8, 3-6-9). Safer against a two-sided wait.',
  },
  { term: 'Tenpai', definition: doGlossario('tenpai') },
  { term: 'Tonpuusen', definition: 'Short game, with the East round only.' },
  { term: 'Yaku', definition: doGlossario('yaku') },
]

export const conteudoEn: ConteudoTutorial = {
  tutorialParts,
  glossary,
  ranks: ['Novice', 'Adept', 'Veteran', 'Expert', '1st dan'],
  ilustracoes: {
    colunaDuasPedras: '1 column = 2 tiles',
    umaSobreOutra: 'one lying on top of the other',
    comprimentoMuro: '17 tiles long',
    conteDireitaEsquerda: 'count from right to left',
    abertura: 'break',
    esquerda: '← left',
    suaDireita: 'your right →',
    voceSentado: 'you, sitting facing your wall',
    indicadorDora: 'dora indicator',
    reposicaoKan: 'kan replacement',
    kanDora: 'kan dora',
    compras: '← draws',
    muroMorto: 'dead wall (14 tiles)',
    muroMortoCurto: 'dead wall',
    ponChamada: 'pon (call)',
    ordem: 'turn',
    daVez: 'order',
    ventos: { leste: 'East', sul: 'South', oeste: 'West', norte: 'North' },
    sufixoOya: ' (oya)',
    dadosExemplo: '2 + 3 = 5 → East (the oya)',
    dadosExemploCurto: '2 + 3 = 5 → East',
    direitaLeste: "1 = East's right end",
    contaEsquerda: '← counts to the left',
    abreDepois: 'opens after the 5th ↘',
    colunasLeste: '5 columns on East',
    colunasSul: '+ 2 on South ↘',
    seusDescartes: 'your discards: rows of 6',
  },
}
