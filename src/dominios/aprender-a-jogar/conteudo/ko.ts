/**
 * Guia Aprender a jogar em coreano: mesmos ids, pedras e respostas do pt-BR
 * (`npm run test:guia` confere). Traduzido do português, sem revisão de falante
 * nativo: ver src/compartilhado/i18n/REVISAR.md. Vocabulário igual ao do app em
 * ko: 친 / 자, 슌쯔, 커쯔, 머리, 버림패, 도라 표시패, 화료.
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

const { pontos, linhaPatamar, grupoYakus, doGlossario, simNao } = criarAuxiliares('ko', {
  sim: '예',
  nao: '아니요',
  cabecalhoYakus: ['역', '조건', '멘젠', '울기'],
})

const modulos: TutorialModule[] = [
  {
    id: 'pedras',
    number: 1,
    title: '패',
    cover: '게임에 쓰는 136장의 패를 알아봅시다.',
    pages: [
      {
        id: 'naipes',
        number: '1.1',
        title: '세 가지 수패',
        termos: ['naipes', 'man', 'pin', 'sou'],
        blocks: [
          {
            type: 'text',
            md: '패는 모두 **136장**: 34종류가 4장씩 있습니다. 수패는 세 종류이고 1부터 9까지 있습니다.',
          },
          // Mesmo formato do Glossário do Guia de bolso: nome, kanji, apelido e o
          // número em cima de cada pedra.
          { type: 'text', md: '**만수**(만) 萬 • 문자: 숫자가 한자로 적혀 있습니다.' },
          { type: 'hand', mpsz: '123456789m', numbered: true },
          { type: 'text', md: '**통수**(통) 筒 • 동그라미: 동그라미 1개부터 9개까지.' },
          { type: 'hand', mpsz: '123456789p', numbered: true },
          { type: 'text', md: '**삭수**(삭) 索 • 대나무: 1은 보통 새 그림입니다.' },
          { type: 'hand', mpsz: '123456789s', numbered: true },
        ],
      },
      {
        id: 'honras',
        number: '1.2',
        title: '자패',
        termos: ['honras', 'ventos', 'dragoes'],
        blocks: [
          { type: 'text', md: '숫자가 없는 패(字牌)입니다. 절대 슌쯔(연속된 세 장)를 만들지 못합니다.' },
          {
            type: 'text',
            md: '**풍패** 風牌: 동(東), 남(南), 서(西), 북(北).',
          },
          { type: 'hand', mpsz: '1234z' },
          {
            type: 'text',
            md: '**삼원패** 三元牌: 백(白, 하쿠), 발(發, 하쯔), 중(中, 쭌).',
          },
          { type: 'hand', mpsz: '567z' },
          {
            type: 'tip',
            md: '테이블에서는 일본어 이름도 들리지만 지금은 신경 쓰지 않아도 됩니다. 동, 남, 백, 중만 알아도 충분히 칠 수 있습니다.',
          },
        ],
      },
      {
        id: 'nomes',
        number: '1.3',
        title: '자주 듣게 될 이름',
        termos: ['terminais', 'aka-dora'],
        blocks: [
          {
            type: 'text',
            md: '- **노두패**: 수패의 1과 9.\n- **중장패**: 2부터 8까지의 패.\n- **빨간 5**(적도라): 각 수패에 하나씩 있는 특별한 5로, 보너스가 붙습니다.',
          },
          { type: 'hand', mpsz: '19m 19p 19s', caption: '노두패', numbered: true },
          { type: 'hand', mpsz: '0m 0p 0s', caption: '빨간 5' },
          {
            type: 'tip',
            md: '지금은 빨간 5를 그 수패의 평범한 5로 생각하고 치세요. 어떤 보너스가 붙는지는 {{onde:dora}}에서 봅니다.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '9통은 노두패일까요, 중장패일까요?',
        hand: '9p',
        options: [{ label: '노두패', correct: true }, { label: '중장패' }],
        answer: '노두패. 수패의 1과 9는 노두패이고, 2부터 8은 중장패입니다.',
      },
    ],
  },
  {
    id: 'mesa',
    number: 2,
    title: '테이블',
    cover: '첫 테이블을 차려 봅시다.',
    pages: [
      {
        id: 'sorteio',
        number: '2.1',
        title: '자리 바람 정하기',
        termos: ['ventos', 'oya'],
        blocks: [
          {
            type: 'text',
            md: '먼저 플레이어마다 바람을 하나씩 정합니다. 바람은 자리와 누가 먼저 시작하는지를 정합니다.',
          },
          {
            type: 'text',
            md: '- **동**을 뽑은 사람이 **친**(親, 오야: 딜러)입니다. 친이 주사위를 던지고 첫 패를 버립니다.\n- 나머지는 친부터 반시계 방향으로 앉습니다: 동 → 남 → 서 → 북.',
          },
          {
            type: 'image',
            image: 'mesaVentos',
            alt: '위에서 본 테이블과 네 자리: 아래에 동(친), 오른쪽에 남, 위에 서, 왼쪽에 북. 가운데 빨간 화살표가 차례 순서를 보여 줍니다: 동에서 남, 남에서 서, 서에서 북, 북에서 다시 동.',
            caption:
              '차례는 방금 친 사람의 오른쪽으로 넘어갑니다: 동 → 남 → 서 → 북. 친이 바뀔 때도 동이 오른쪽으로 넘어가서, 남이었던 사람이 새 동이 됩니다.',
          },
          {
            type: 'text',
            md: '**정하는 방법**\n- **패로 정하기**: 바람마다 패를 한 장씩 뒤집어 섞고, 한 사람씩 한 장을 가져갑니다.\n- **앱으로 정하기**: 바람 추첨기가 패를 따로 꺼내지 않고 바로 네 바람을 정해 줍니다.',
          },
          { type: 'appLink', tool: 'sorteador', label: '바람 추첨기 열기' },
        ],
      },
      {
        id: 'muro',
        number: '2.2',
        title: '패 섞기와 패산 쌓기',
        blocks: [
          {
            type: 'steps',
            items: [
              '테이블 가운데에 패를 펼쳐 놓고, 떨어진 모양 그대로 모두 함께 잘 섞습니다. 그다음 앞면이 위로 온 패를 뒤집고, 다시 뒤집히지 않도록 살살 섞습니다.',
              {
                md: '각자 자기 앞에 **길이 17장, 높이 2장**(34장)의 줄을 쌓습니다.',
                image: 'muroFileira',
                alt: '뒷면이 위로 놓인 17열의 패. 한 열마다 2장씩 쌓여 있습니다.',
              },
              {
                md: '각자 자기 패산을 앞쪽 테이블 가운데로 조금 밀어 놓습니다. 네 패산은 가운데를 둘러싸지만 ==서로 붙어 있을 필요는 없고== 완벽한 사각형일 필요도 없습니다.',
                image: 'muroQuadrado',
                alt: '위에서 본 모습: 테이블 가운데를 둘러싼 네 패산. 각 패산은 한 플레이어 앞에 있고, 모서리마다 틈이 있습니다. 아래에 동, 오른쪽에 남, 위에 서, 왼쪽에 북. 가운데에는 동(東)이 표시된 센터피스가 있고, 각 변에는 그 플레이어의 패산을 여는 주사위 숫자가 있습니다: 동 1, 5, 9; 남 2, 6, 10; 서 3, 7, 11; 북 4, 8, 12.',
              },
            ],
          },
        ],
      },
      {
        id: 'abertura',
        number: '2.3',
        title: '패산 가르기',
        termos: ['oya'],
        blocks: [
          {
            type: 'text',
            md: '친은 ==항상 주사위 두 개를 던져== 더합니다. 그 숫자가 **어느 패산을 가르는지**, 그리고 **몇 번째 열에서** 자르는지를 정합니다. 왕패는 이렇게 자른 자리에서 나뉩니다.',
          },
          { type: 'heading', text: '1. 어느 패산을 가르나' },
          {
            type: 'text',
            md: '친부터 ==반시계 방향으로== 플레이어를 셉니다: 친이 1, 친의 오른쪽이 2, 맞은편이 3, 왼쪽이 4입니다. 5가 되면 다시 친으로 돌아옵니다.',
          },
          {
            type: 'text',
            md: '- **5 또는 9**: 친의 패산.\n- **2, 6 또는 10**: 친 오른쪽 사람의 패산.\n- **3, 7 또는 11**: 맞은편 패산.\n- **4, 8 또는 12**: 친 왼쪽 사람의 패산.',
          },
          {
            type: 'tip',
            md: '**센터피스가 있으면** 셀 필요가 없습니다. 각 변에 그 자리에 앉은 플레이어의 패산을 여는 숫자가 적혀 있으니 주사위 합만 찾으면 됩니다.',
          },
          {
            type: 'image',
            image: 'mesaDados',
            alt: '위에서 본 테이블과 네 패산. 바람마다 옆에 세는 숫자가 있습니다: 동 1, 5, 9; 남 2, 6, 10; 서 3, 7, 11; 북 4, 8, 12. 가운데 주사위의 합은 5이고, 친인 동이 강조되어 있습니다.',
            caption: '예: 2 + 3 = 5. 한 바퀴 돌아 친에게서 멈춥니다.',
          },
          { type: 'heading', text: '2. 어디서 가르나' },
          {
            type: 'text',
            md: '정해진 패산을 쌓은 사람이 자기 자리에서 패산을 보고 ==오른쪽에서 왼쪽으로== 열을 셉니다: 오른쪽 끝 열이 1입니다. 주사위에 나온 숫자만큼 세고, 바로 그 열 다음에서 패산을 가릅니다: 이곳이 ==가른 자리==입니다.',
          },
          {
            type: 'image',
            image: 'muroContagem',
            alt: '쌓은 사람이 앞에서 본 17열의 패산. 오른쪽 끝 5열에 번호가 있습니다: 오른쪽 끝이 1이고 왼쪽으로 갈수록 5까지. 빨간 화살표가 오른쪽에서 왼쪽으로 5번째 열 바로 다음의 가른 자리를 가리킵니다.',
            caption: '주사위 5: 1열은 내 오른쪽 끝 열이고, 5번째 열 다음에서 가릅니다.',
          },
          {
            type: 'image',
            image: 'mesaAbertura',
            alt: '위에서 본 테이블. 동의 패산에서 동에 앉은 사람의 오른쪽 끝부터 왼쪽으로 1부터 5까지 빨간 번호가 붙어 있고, 5번째 열 다음에서 패산이 갈라져 있습니다.',
            caption: '같은 세기를 위에서 본 모습(동의 패산).',
          },
        ],
      },
      {
        id: 'muro-morto',
        number: '2.4',
        title: '왕패',
        termos: ['dora'],
        blocks: [
          {
            type: 'text',
            md: '==가른 자리 바로 오른쪽의 7열==(14장)이 **왕패**(王牌, 영상패라고도 함)가 됩니다. 평소에는 여기서 패를 가져오지 않습니다.',
          },
          {
            type: 'image',
            image: 'muroMorto',
            alt: '앞에서 본 갈라진 패산: 왼쪽은 패를 가져오는 패산, 그다음 가른 자리, 오른쪽은 가른 자리부터 1에서 7까지 번호가 붙은 왕패 7열. 3번째 열의 위 패가 앞면으로 뒤집혀 있습니다: 도라 표시패입니다.',
            caption:
              '패산을 정면으로 볼 때: 가른 자리 왼쪽은 가져오는 패, 오른쪽은 왕패이며 가른 자리부터 번호를 셉니다.',
          },
          { type: 'heading', text: '주사위가 7보다 작을 때' },
          {
            type: 'text',
            md: '가른 자리 오른쪽에는 주사위로 센 열만 남아서 7열이 안 됩니다. ==모자란 왕패는 오른쪽 옆 패산에서 채웁니다==. 주사위 5의 예에서는 동의 패산에 5열이 남고, 나머지 2열은 남의 패산에서 가져옵니다.',
          },
          {
            type: 'image',
            image: 'muroMortoCurto',
            alt: '위에서 본 테이블, 주사위 합은 5. 동의 패산은 5번째 열 다음에서 갈라져 있습니다. 빗금과 빨간 테두리의 왕패가 그 5열을 차지하고 모서리를 돌아 남의 패산 첫 2열까지 이어집니다. 표시패는 아직 동에 있는 3번째 열에 있습니다.',
            caption: '주사위 5: 동에 5열 + 남에 2열.',
          },
          {
            type: 'tip',
            md: '7 이상이면 왕패가 정해진 패산 안에 다 들어갑니다. 2부터 6이면 왕패는 언제나 모서리를 돕니다.',
          },
          { type: 'heading', text: '왜 필요한가' },
          {
            type: 'text',
            md: '패는 136장이고 같은 패가 4장씩입니다. 모든 패가 게임에 나온다면 이미 나온 패를 세어 남은 패를 정확히 알 수 있습니다. 왕패 14장은 가져오는 패에서 빠지기 때문에 앞으로 어떤 패가 나올지 ==아무도 확실히 알 수 없습니다==.',
          },
          { type: 'heading', text: '도라 표시패' },
          {
            type: 'text',
            md: '이번에는 주사위와 반대 방향으로 셉니다: ==가른 자리부터 오른쪽으로 3열==을 세고 3번째 열의 위 패를 앞면으로 뒤집습니다. 이 패가 **도라 표시패**이며, {{onde:dora}}에서 자세히 봅니다.',
          },
          {
            type: 'tip',
            md: '왕패의 다른 패에도 쓰임이 있는데, {{onde:kan}}에서 봅니다.',
          },
        ],
      },
      {
        id: 'compra',
        number: '2.5',
        title: '배패 가져오기',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                md: '가져오기는 ==가른 자리 바로 왼쪽 열==(그 패산을 쌓은 사람 기준)에서 시작해 화살표처럼 ==왼쪽으로==, 패산에서 패산으로 이어집니다. 왕패는 빼 둡니다. 위에서 보면 패는 **시계 방향**으로 빠져나갑니다: 반시계 방향인 차례 순서와 반대입니다.',
                image: 'mesaCompra',
                alt: '위에서 본 테이블. 동의 패산이 갈라져 있고, 모서리 쪽에는 빨간 테두리의 왕패가 남의 패산으로 꺾여 있습니다. 가른 자리 반대쪽에서 빨간 화살표가 나와 동의 패산을 따라가다가 북의 패산으로 시계 방향으로 이어집니다.',
              },
              '친이 먼저 가져가고, 그다음 친 오른쪽 사람, 이런 식으로 돌아갑니다. 한 번에 **4장씩**(2열) 가져가서 모두 12장이 될 때까지 반복합니다.',
              '각자 **1장**을 더 가져가 13장이 됩니다.',
              '친은 **14번째 패**를 가져가고 첫 패를 버리며 게임을 시작합니다.',
            ],
          },
          { type: 'heading', text: '정리: 어느 쪽으로 세나' },
          {
            type: 'text',
            md: '항상 패산을 쌓은 사람처럼 패산을 정면으로 보고:\n- **주사위**: 오른쪽 끝에서 왼쪽으로.\n- **왕패와 표시패**: 가른 자리에서 오른쪽으로.\n- **패 가져오기**: 가른 자리에서 왼쪽으로.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '누가 주사위를 던지고 첫 패를 버릴까요?',
        options: [
          { label: '동의 오른쪽 사람' },
          { label: '동을 뽑은 친', correct: true },
          { label: '북을 뽑은 사람' },
        ],
        answer: '동을 뽑은 친. 친이 주사위를 던지고 첫 패를 버리며 게임을 시작합니다.',
      },
      {
        type: 'quiz',
        question: '왕패는 무엇을 위해 있을까요?',
        options: [
          { label: '버린 패를 모아 두려고' },
          { label: '국에서 진 사람의 패를 따로 두려고' },
          {
            label: '일부 패를 게임에서 빼서 어떤 패가 나올지 아무도 확실히 모르게 하려고',
            correct: true,
          },
        ],
        answer:
          '일부 패를 게임에서 빼 두기 위해서입니다. 그 패들이 가져오는 패에 없으니 남은 패를 정확히 셀 수 없습니다.',
      },
      {
        type: 'quiz',
        question: '친은 몇 장으로 시작할까요?',
        options: [{ label: '13' }, { label: '14', correct: true }, { label: '12' }],
        answer: '14장. 다른 사람은 13장이고, 친은 14번째 패를 버리며 게임을 시작합니다.',
      },
      {
        type: 'quiz',
        question:
          '주사위가 4(1 + 3)가 나왔습니다. 가른 자리는 어느 패산에 있고, 왕패는 어디에 있을까요?',
        options: [
          { label: '북의 패산, 왕패는 그 안에 다 들어감' },
          { label: '북의 패산: 북에 4열 + 동의 패산에 3열', correct: true },
          { label: '서의 패산: 서에 4열 + 남에 3열' },
        ],
        answer:
          '친부터 반시계 방향으로 세면 4는 친의 왼쪽인 북입니다. 북은 자기 오른쪽 끝에서 왼쪽으로 4열을 세고 가릅니다. 그곳에는 왕패가 4열만 들어가고, 나머지 3열은 북의 오른쪽 옆인 동의 패산에서 채웁니다.',
      },
    ],
  },
  {
    id: 'mao',
    number: 3,
    title: '완성된 손패',
    cover: '무엇을 만들어야 하는지 알아봅시다.',
    pages: [
      {
        id: 'formula',
        number: '3.1',
        title: '공식: 몸통 4개 + 머리 1개',
        blocks: [
          {
            type: 'text',
            md: '화료(이기기)하려면 **14장**이 필요합니다. 세 장짜리 몸통 네 개와 머리(같은 패 두 장) 하나로 나눠집니다.',
          },
          { type: 'hand', mpsz: '123m 456p 789s 555z 22s' },
        ],
      },
      {
        id: 'grupos',
        number: '3.2',
        title: '몸통의 종류',
        termos: ['sequencia', 'trinca', 'par'],
        blocks: [
          { type: 'text', md: '**슌쯔**: 같은 수패의 연속된 숫자 세 장.' },
          { type: 'hand', mpsz: '345p' },
          { type: 'text', md: '**커쯔**: 똑같은 패 세 장.' },
          { type: 'hand', mpsz: '777s 555z' },
          { type: 'text', md: '**머리**(또이쯔): 똑같은 패 두 장.' },
          { type: 'hand', mpsz: '22s' },
          {
            type: 'tip',
            md: '슌쯔는 한 바퀴 돌지 않고(8-9-1은 안 됨), 자패(풍패와 삼원패)는 절대 슌쯔가 되지 않습니다.',
          },
        ],
      },
      {
        id: 'tenpai',
        number: '3.3',
        title: '텐파이: 한 장만 더',
        termos: ['tenpai'],
        blocks: [
          {
            type: 'text',
            md: '13장으로 치다가 화료할 때 14번째 패로 완성합니다. 한 장만 남았을 때 손패는 **텐파이**(聴牌) 상태입니다. 그 한 장이 될 수 있는 패가 **대기패**입니다.',
          },
          {
            type: 'text',
            md: '손패를 이미 완성된 몸통으로 나눠 보세요. ==완성되지 않고 남은 부분==에 대기가 있습니다.',
          },
          // Mãos inteiras de 13 pedras, com cada grupo rotulado, e a seta para as esperas.
          { type: 'heading', text: '양면 대기' },
          {
            type: 'hand',
            mpsz: '234m 567p 789s 11z 45m',
            labels: ['슌쯔', '슌쯔', '슌쯔', '머리', '대기'],
            after: '36m',
            afterLabel: '대기',
            caption: '4-5는 3이나 6으로 완성됩니다: 가장 좋은 대기로, 최대 8장.',
          },
          { type: 'heading', text: '간짱 대기(가운데)' },
          {
            type: 'hand',
            mpsz: '123p 456s 777m 99s 46m',
            labels: ['슌쯔', '슌쯔', '커쯔', '머리', '대기'],
            after: '5m',
            afterLabel: '대기',
            caption: '4-6은 가운데 5로만 완성됩니다.',
          },
          { type: 'heading', text: '변짱 대기(끝)' },
          {
            type: 'hand',
            mpsz: '345m 678p 222s 55z 12m',
            labels: ['슌쯔', '슌쯔', '커쯔', '머리', '대기'],
            after: '3m',
            afterLabel: '대기',
            caption: '1-2는 3으로만 완성됩니다: 반대쪽에는 0이 없습니다.',
          },
          { type: 'heading', text: '샤보 대기(머리 두 개)' },
          {
            type: 'hand',
            mpsz: '234m 567p 678s 22p 88s',
            labels: ['슌쯔', '슌쯔', '슌쯔', '대기', '대기'],
            after: '2p8s',
            afterLabel: '대기',
            caption: '한쪽 또이쯔는 커쯔가 되고 다른 쪽은 머리로 남습니다.',
          },
          { type: 'heading', text: '단기 대기(머리만)' },
          {
            type: 'hand',
            mpsz: '123m 456m 789p 111z 5s',
            labels: ['슌쯔', '슌쯔', '슌쯔', '커쯔', '대기'],
            after: '5s',
            afterLabel: '대기',
            caption: '몸통 4개는 완성: 5삭 머리만 남았습니다.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '이 손패는 텐파이일까요?',
        hand: '234m 567p 11s 345s 78p',
        options: simNao(true),
        answer: '예. 6통이나 9통을 기다려 7-8을 완성합니다.',
      },
    ],
  },
  {
    id: 'turno',
    number: 4,
    title: '차례',
    cover: '패를 가져오고, 버리고, 울어 봅시다.',
    pages: [
      {
        id: 'comprar-descartar',
        number: '4.1',
        title: '쯔모와 버리기',
        blocks: [
          {
            type: 'text',
            md: '내 차례에는 패산에서 한 장을 가져오고(쯔모) 다른 한 장을 앞면이 보이게 버립니다. 버림패는 내 패산과 테이블 가운데 사이, 내 앞에 여섯 장씩 줄지어 놓여 모두가 볼 수 있습니다. 차례는 내 오른쪽 사람에게 넘어갑니다.',
          },
          {
            type: 'image',
            image: 'mesaDescartes',
            alt: '위에서 본 테이블: 각 패산 앞에 버림패 6장 한 줄과 두 번째 줄의 시작. 가운데에는 장풍(東)이 표시된 테이블 중앙. 남의 버림패 하나가 리치처럼 옆으로 누워 있습니다. 동의 오른쪽, 패산 바깥에는 퐁으로 공개한 패 세 장이 있고 왼쪽 끝 패가 옆으로 누워 있습니다.',
            caption:
              '각자 자기 앞에 6장씩 줄지어 버립니다. 동의 오른쪽에는 퐁: 가져온 패가 옆으로 놓입니다.',
          },
          {
            type: 'text',
            md: '다른 사람의 버림패로 바로 몸통을 만들 수도 있습니다: 퐁이나 치 같은 **울기**(鳴き)입니다. 운 몸통은 테이블 위 내 오른쪽에 공개해 둡니다.',
          },
          {
            type: 'tip',
            md: '테이블에서 다른 사람에게서 가져온 패는 **옆으로** 눕혀 버린 사람 쪽을 가리키게 둡니다. 그러면 어디서 왔는지 모두가 압니다.',
          },
        ],
      },
      {
        id: 'pon',
        number: '4.2',
        title: '퐁',
        termos: ['pon'],
        blocks: [
          {
            type: 'text',
            md: '누군가 버린 패와 같은 패가 내 손에 두 장 있습니다. "퐁"이라고 말하고 그 패를 가져와 커쯔를 테이블에 공개합니다.',
          },
          {
            type: 'text',
            md: '**누구의** 버림패로도 할 수 있습니다. 게임은 나부터 이어집니다: 패를 한 장 버리세요.',
          },
          {
            type: 'melds',
            items: [
              { mpsz: '777s', deLado: 0, caption: '왼쪽에서' },
              { mpsz: '777s', deLado: 1, caption: '맞은편에서' },
              { mpsz: '777s', deLado: 2, caption: '오른쪽에서' },
            ],
          },
          {
            type: 'text',
            md: '퐁을 하면 손패가 **공개**(울은 손패)됩니다. 다른 사람의 버림패를 하나도 쓰지 않은 손패는 **멘젠**(門前, 닫힌 손패)입니다.',
          },
        ],
      },
      {
        id: 'chi',
        number: '4.3',
        title: '치',
        termos: ['chi', 'chamada'],
        blocks: [
          {
            type: 'text',
            md: '버림패로 슌쯔를 완성할 수도 있지만, **내 왼쪽** 사람의 버림패로만 가능합니다. "치"라고 말하고 슌쯔를 테이블에 공개합니다.',
          },
          {
            type: 'melds',
            items: [
              {
                mpsz: '435p',
                deLado: 0,
                caption: '4통을 가져옴: 왼쪽에 옆으로 놓입니다',
              },
            ],
          },
          { type: 'text', md: '치를 하면 손패가 **공개**됩니다.' },
        ],
      },
      {
        id: 'prioridade',
        number: '4.4',
        title: '누가 우선인가',
        blocks: [
          {
            type: 'text',
            md: '같은 버림패를 여러 명이 원하면: **론 > 퐁 > 치**.',
          },
          {
            type: 'text',
            md: '**론**은 다른 사람의 버림패로 화료하는 것입니다. 다음 페이지에서 봅니다.',
          },
        ],
      },
      {
        id: 'tsumo-ron',
        number: '4.5',
        title: '쯔모와 론',
        termos: ['tsumo', 'ron'],
        blocks: [
          {
            type: 'text',
            md: '- **쯔모**(自摸): 직접 가져온 패로 손패를 완성했습니다. 다른 플레이어 모두가 냅니다.\n- **론**(栄和): 다른 사람의 버림패로 완성했습니다. 버린 사람 혼자 냅니다.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question:
          '맞은편 사람이 6통을 버렸고, 내 손에는 5통과 7통이 있습니다. 치를 할 수 있을까요?',
        hand: '57p',
        options: simNao(false),
        answer: '아니요. 치는 내 왼쪽 사람의 버림패로만 할 수 있습니다.',
      },
    ],
  },
  {
    id: 'yakus',
    number: 6,
    title: '화료할 수 있는 손패',
    cover: '완성만으로는 부족합니다: 화료하려면 역이 있어야 합니다.',
    pages: [
      {
        id: 'sem-yaku',
        number: '6.1',
        title: '역이 없으면 화료도 없다',
        termos: ['yaku'],
        blocks: [
          {
            type: 'text',
            md: '몸통 4개와 머리 1개로는 부족합니다. 손패에는 점수 조건인 **역**(役, 야쿠)이 최소 하나 있어야 합니다. 역이 없어도 텐파이는 될 수 있고, 유국 때는 텐파이로 칩니다. 다만 화료는 할 수 없습니다.',
          },
          { type: 'tip', md: '실제 규칙에서 역 없이 화료하면 촌보(중대한 반칙)입니다.' },
        ],
      },
      {
        id: 'yakus-iniciantes',
        number: '6.2',
        title: '처음 익힐 역',
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
            md: '이 다섯 가지부터 시작하세요: 이것만으로도 대부분의 손패를 화료할 수 있습니다. 하나씩 눌러 어떻게 되는지 보세요.',
          },
          {
            type: 'cards',
            items: [
              {
                id: 'riichi',
                title: '리치',
                badge: '멘젠 한정',
                blocks: [
                  {
                    type: 'text',
                    md: '가장 흔한 역입니다. 손패가 **멘젠**이고 텐파이일 때 "리치"라고 말하고 패를 옆으로 눕혀 버립니다.',
                  },
                  {
                    type: 'text',
                    md: '그것만으로 손패가 화료 가능해집니다. 선언한 뒤에는 손패를 더 바꿀 수 없습니다.',
                  },
                ],
              },
              {
                id: 'menzen-tsumo',
                title: '멘젠쯔모',
                badge: '멘젠 한정',
                blocks: [
                  {
                    type: 'text',
                    md: '**멘젠**인 손패로 쯔모(직접 가져온 패)로 화료하는 것.',
                  },
                ],
              },
              {
                id: 'tanyao',
                title: '탕야오',
                badge: '울어도 됨',
                blocks: [
                  {
                    type: 'text',
                    md: '2부터 8까지의 패만. 노두패와 자패가 없습니다.',
                  },
                  { type: 'hand', mpsz: '234m 567m 345p 678s 55s' },
                  {
                    type: 'tip',
                    md: '어떤 테이블은 탕야오를 멘젠일 때만 인정합니다. 치기 전에 정해 두세요.',
                  },
                ],
              },
              {
                id: 'yakuhai',
                title: '역패',
                badge: '울어도 됨',
                blocks: [
                  { type: 'text', md: '**삼원패**, **장풍**, **자풍**의 커쯔.' },
                  { type: 'hand', mpsz: '123m 456p 789s 555z 22s' },
                  { type: 'heading', text: '어떤 바람이 역이 되나' },
                  {
                    type: 'text',
                    md: '각 플레이어에게는 **자풍**(자리 바람, 추첨에서 뽑은 바람)이 있습니다. 테이블 전체에는 **장풍**(판의 바람)이 있습니다: 동풍전에서는 동입니다.',
                  },
                  {
                    type: 'text',
                    md: '- 장풍: 모두에게 역이 됩니다.\n- 자풍: 나에게만 역이 됩니다.\n- 장풍이 내 자풍이기도 하면 ==두 배==가 됩니다.\n- 아무에게도 해당하지 않는 바람은 역이 되지 않습니다.',
                  },
                  {
                    type: 'text',
                    md: '예: 동장에서는 동이 모두에게 역입니다. **친**에게는 동이 자풍이기도 해서 두 배가 됩니다.',
                  },
                  {
                    type: 'tip',
                    md: '**울어도** 됩니다: 삼원패나 역이 되는 바람을 퐁하기만 해도 손패에 역이 생깁니다.',
                  },
                ],
              },
              {
                id: 'pinfu',
                title: '핑후',
                badge: '멘젠 한정',
                blocks: [
                  {
                    type: 'text',
                    md: '슌쯔만 있고, 머리는 삼원패나 역이 되는 바람(자풍 또는 장풍)이 아니며, 양면 대기(량멘)여야 합니다.',
                  },
                  {
                    type: 'hand',
                    mpsz: '123m 456p 789p 23s 55m',
                    caption: '텐파이 상태의 손패',
                    after: '1s4s',
                    afterLabel: '대기',
                  },
                ],
              },
            ],
          },
          { type: 'heading', text: '다음 단계로' },
          {
            type: 'text',
            md: '이 다섯 가지가 자연스러워지면 테이블에서 자주 보이는 역들입니다:',
          },
          {
            type: 'cards',
            items: [
              {
                id: 'iipeikou',
                title: '이페코',
                badge: '멘젠 한정',
                blocks: [
                  {
                    type: 'text',
                    md: '같은 수패의 ==똑같은== 슌쯔 두 개.',
                  },
                  { type: 'hand', mpsz: '234m 234m 567p 789s 55p' },
                ],
              },
              {
                id: 'chanta',
                title: '찬타',
                badge: '울어도 됨',
                blocks: [
                  {
                    type: 'text',
                    md: '모든 몸통 **과 머리**에 노두패(1 또는 9)나 자패가 들어 있습니다. 슌쯔가 최소 하나 있어야 합니다.',
                  },
                  { type: 'hand', mpsz: '123m 789p 999s 111z 77z' },
                ],
              },
              {
                id: 'toitoi',
                title: '또이또이',
                badge: '울어도 됨',
                blocks: [
                  {
                    type: 'text',
                    md: '커쯔(또는 깡)와 머리만. ==슌쯔가 하나도 없습니다==.',
                  },
                  { type: 'hand', mpsz: '222m 555p 888s 666z 99m' },
                ],
              },
              {
                id: 'honitsu',
                title: '혼일색',
                badge: '울어도 됨',
                blocks: [
                  {
                    type: 'text',
                    md: '손패 전체가 **한 가지 수패**와 자패로만 되어 있습니다.',
                  },
                  { type: 'hand', mpsz: '123s 456s 789s 555z 11z' },
                ],
              },
              {
                id: 'chinitsu',
                title: '청일색',
                badge: '울어도 됨',
                blocks: [
                  {
                    type: 'text',
                    md: '손패 전체가 **한 가지 수패**로만, ==자패 없이== 되어 있습니다.',
                  },
                  { type: 'hand', mpsz: '123p 456p 345p 789p 99p' },
                ],
              },
              {
                id: 'chiitoitsu',
                title: '치또이쯔',
                badge: '멘젠 한정',
                blocks: [
                  {
                    type: 'text',
                    md: '서로 다른 **또이쯔 일곱 개**. 몸통 4개 + 머리 1개 공식을 따르지 않는 유일한 손패입니다.',
                  },
                  { type: 'hand', mpsz: '22m 55m 88p 33s 66s 11z 77z' },
                  {
                    type: 'tip',
                    md: '또이쯔는 모두 달라야 합니다: 같은 패 네 장은 또이쯔 두 개로 치지 않습니다.',
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
        question: '치를 한 번 한 공개 손패이고 자패 커쯔가 없습니다. 역이 있을까요?',
        hand: '123m 456p 789s 678p 11m',
        options: simNao(false),
        answer:
          '아니요. 노두패가 있어서 탕야오가 아니고, 울었으니 리치, 멘젠쯔모, 핑후도 없으며, 역이 되는 커쯔도 없습니다(역패 없음).',
      },
    ],
  },
  {
    id: 'pontos',
    number: 8,
    title: '점수',
    cover: '내 손패가 얼마짜리이고 어떻게 내는지 알아봅시다.',
    coverTip:
      '역이 있어야 화료하는 규칙으로 한 판 쳐 봤나요? 아직이라면 점수는 세지 말고 **지금 한 판** 친 다음 돌아오세요.',
    pages: [
      {
        id: 'palitos',
        number: '8.1',
        title: '점봉',
        termos: ['riichi', 'honba'],
        blocks: [
          {
            type: 'text',
            md: '점수는 점봉(点棒)으로 셉니다. 각자 **25,000**점으로 시작합니다:',
          },
          { type: 'sticks' },
          {
            type: 'text',
            md: '1,000점 봉은 리치를 걸 때도 씁니다. 100점 봉은 본장을 셉니다.',
          },
        ],
      },
      {
        id: 'han-fu',
        number: '8.2',
        title: '판과 부',
        termos: ['han', 'fu'],
        blocks: [
          {
            type: 'text',
            md: '점수는 **판**(翻, 역과 도라)과 **부**(符, 손패의 모양)로 정해집니다. 계산은 계산기가 해 줍니다.',
          },
          { type: 'hanFuTutorial' },
          {
            type: 'table',
            headers: ['역', '판'],
            rows: [
              ['리치', hanYaku('riichi')],
              ['멘젠쯔모', hanYaku('menzen-tsumo')],
              ['탕야오', hanYaku('tanyao')],
              ['역패', `커쯔 하나당 ${hanYaku('yakuhai')}`],
              ['핑후', hanYaku('pinfu')],
            ],
          },
          {
            type: 'text',
            md: '역은 더해집니다. 리치 + 탕야오 + 핑후 + 멘젠쯔모 = **4판**.',
          },
        ],
      },
      {
        id: 'patamares',
        number: '8.3',
        title: '만관 이상 구간',
        termos: ['patamares', 'mangan', 'oya', 'ko'],
        blocks: [
          {
            type: 'text',
            md: '5판부터는 손패가 고정 점수 구간이 됩니다. **자**(子)는 친이 아닌 사람입니다.',
          },
          {
            type: 'table',
            headers: ['구간', '판', '자', '친'],
            rows: [
              linhaPatamar('만관', '5', BASE_PATAMAR.mangan),
              linhaPatamar('하네만', '6–7', BASE_PATAMAR.haneman),
              linhaPatamar('배만', '8–10', BASE_PATAMAR.baiman),
              linhaPatamar('삼배만', '11–12', BASE_PATAMAR.sanbaiman),
              linhaPatamar('역만', '13+', BASE_PATAMAR.yakuman),
            ],
          },
          { type: 'text', md: '친은 화료하면 점수를 **1.5배** 받습니다.' },
          { type: 'tip', md: '3판이나 4판이라도 부에 따라 만관이 될 수 있습니다.' },
        ],
      },
      {
        id: 'quem-paga',
        number: '8.4',
        title: '누가 내나',
        termos: ['ron', 'tsumo'],
        blocks: [
          {
            type: 'text',
            md: '- **론**: 버린 사람이 전부 냅니다.\n- **쯔모**: 모두가 냅니다. 화료한 사람이 친이 아니면 친이 절반을 내고 나머지 두 사람이 나머지를 나눠 냅니다.',
          },
          {
            type: 'text',
            md: '화료한 사람은 테이블에 놓인 리치 공탁(1,000점씩)도 가져갑니다.',
          },
        ],
      },
      {
        id: 'riichi-aposta',
        number: '8.5',
        title: '리치 공탁',
        termos: ['riichi'],
        blocks: [
          {
            type: 'text',
            md: '점수를 셀 때 리치를 선언한 사람은 **1,000**점 봉 하나를 테이블 가운데에 겁니다.',
          },
          {
            type: 'text',
            md: '- 선언하려면 1,000점 이상 있어야 합니다.\n- 작혼과 텐호에서는 패산에 가져올 패가 4장 이상 남아 있어야 합니다. 오프라인 대국에서는 규칙에 따라 다릅니다.\n- 리치 선언패로 론을 당하면 공탁은 내지 않습니다.\n- 그 국에서 화료한 사람이 테이블의 공탁을 가져갑니다.\n- 아무도 화료하지 못하면 공탁은 다음 국까지 테이블에 남습니다.',
          },
          {
            type: 'tip',
            md: '리치를 하면 화료할 때 뒷도라(우라도라)도 확인할 수 있습니다. {{onde:dora}}에서 봅니다.',
          },
        ],
      },
      {
        id: 'honba-empate',
        number: '8.6',
        title: '본장과 유국',
        termos: ['honba', 'empate'],
        blocks: [
          {
            type: 'text',
            md: '본장 하나마다 화료하는 사람에게 300점이 더해집니다. 쯔모는 각자 100점씩 더 내고, 론은 버린 사람이 300점을 냅니다. 이 점수는 따로 더해지므로 만관 같은 상한이나 친의 1.5배에 영향을 받지 않습니다.',
          },
          {
            type: 'text',
            md: '화료한 사람 없이 패산이 다 떨어지면, 노텐인 사람이 텐파이인 사람에게 합계 3,000점을 냅니다.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '자가 만관을 쯔모로 화료했습니다. 친은 얼마를 낼까요?',
        options: [
          { label: pontos(BASE_PATAMAR.mangan) },
          { label: pontos(BASE_PATAMAR.mangan * 2), correct: true },
          { label: pontos(BASE_PATAMAR.mangan * 4) },
        ],
        answer: `${pontos(BASE_PATAMAR.mangan * 2)}, 절반입니다. 나머지 두 사람은 ${pontos(BASE_PATAMAR.mangan)}씩 냅니다.`,
      },
    ],
  },
  {
    id: 'dora',
    number: 9,
    title: '도라',
    cover: '손패를 더 비싸게 만드는 보너스 패.',
    pages: [
      {
        id: 'indicador',
        number: '9.1',
        title: '표시패와 도라',
        termos: ['dora'],
        blocks: [
          {
            type: 'text',
            md: '왕패에서 뒤집은 패를 기억하나요? 그 패가 **도라 표시패**입니다. 표시패가 도라는 아닙니다: **도라**는 표시패의 다음 패입니다. 손패의 도라 한 장마다 1판입니다.',
          },
          {
            type: 'image',
            image: 'muroMorto',
            alt: '앞에서 본 갈라진 패산: 왼쪽은 가져오는 패, 가른 자리, 오른쪽은 왕패. 가른 자리부터 3번째 열에 도라 표시패가 뒤집혀 있습니다.',
            caption: '표시패는 왕패에서 앞면으로 뒤집혀 있습니다.',
          },
          {
            type: 'hand',
            mpsz: '3m',
            caption: '표시패 3만',
            after: '4m',
            afterLabel: '도라',
          },
          { type: 'tip', md: '도라는 역이 아닙니다. 역이 없으면 화료에 도움이 되지 않습니다.' },
        ],
      },
      {
        id: 'ordem-dora',
        number: '9.2',
        title: '순서',
        termos: ['dora'],
        blocks: [
          {
            type: 'text',
            md: '각 패는 다음 패를 가리킵니다. 각 순서의 끝에서는 처음으로 돌아갑니다. 표시패 두 장이 같은 패를 가리키면, 손패에 있는 그 패는 한 장마다 2판입니다.',
          },
          { type: 'doraCycles' },
        ],
      },
      {
        id: 'aka-dora',
        number: '9.3',
        title: '빨간 5',
        termos: ['aka-dora'],
        blocks: [
          {
            type: 'text',
            md: '빨간 5(적도라)는 한 장마다 1판이 더 붙고, 손패에서는 평범한 5로 씁니다. 5가 도라이기도 하면 빨간 5는 2판입니다. 표시패로 뒤집혔을 때는 평범한 5로 칩니다.',
          },
          { type: 'hand', mpsz: '0m 0p 0s' },
          {
            type: 'tip',
            md: '모든 테이블이 빨간 5를 쓰지는 않습니다. 치기 전에 정해 두세요.',
          },
        ],
      },
      {
        id: 'ura-dora',
        number: '9.4',
        title: '뒷도라',
        termos: ['ura-dora', 'riichi'],
        blocks: [
          {
            type: 'text',
            md: '**리치**를 선언하고 화료한 사람은 각 도라 표시패 아래의 패를 뒤집습니다. 이것이 **뒷도라**(裏ドラ, 우라도라)로, 화료한 사람에게만 적용되는 표시패가 하나 더 생기는 셈입니다.',
          },
          { type: 'tip', md: '리치가 없으면 뒷도라도 없습니다. 리치를 할 이유가 하나 더 생깁니다.' },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '표시패가 중(빨간 삼원패)입니다. 도라는 무엇일까요?',
        hand: '7z',
        options: [
          { label: '백', mpsz: '5z', correct: true },
          { label: '발', mpsz: '6z' },
          { label: '중', mpsz: '7z' },
        ],
        answer: '백입니다: 중 → 백.',
      },
    ],
  },
  {
    id: 'kan',
    number: 10,
    title: '깡',
    cover: '같은 패 네 장, 한 장 더 가져오기, 그리고 도라 하나 더.',
    pages: [
      {
        id: 'kan',
        number: '10.1',
        title: '세 가지 깡',
        termos: ['kan'],
        blocks: [
          { type: 'text', md: '같은 패 네 장입니다. 깡을 하는 방법은 세 가지입니다:' },
          {
            type: 'text',
            md: '- **명깡**(대명깡): 같은 패 세 장이 있는데 누군가 네 번째 패를 버립니다. 퐁처럼 누구의 버림패로도 됩니다.\n- **암깡**: 네 장이 모두 내 손에 있습니다. 양 끝 패를 뒤집어 테이블에 공개합니다.\n- **가깡**: 이미 퐁한 몸통이 있고 네 번째 패를 가져왔습니다. 옆으로 놓인 패 위에 눕혀 올립니다.',
          },
          {
            type: 'melds',
            items: [
              { mpsz: '8888p', deLado: 1, caption: '명깡(맞은편에서)' },
              { mpsz: '1111m', viradas: [0, 3], caption: '암깡' },
              { mpsz: '7777s', deLado: 0, empilhada: true, caption: '가깡' },
            ],
          },
          {
            type: 'text',
            md: '명깡과 가깡은 손패를 **공개**합니다. 내 손의 패만으로 한 암깡은 손패를 **멘젠**으로 유지합니다.',
          },
          { type: 'tip', md: '깡은 퐁과 우선순위가 같습니다.' },
          { type: 'heading', text: '리치 후의 깡' },
          {
            type: 'text',
            md: '리치를 선언한 뒤에도 **암깡**은 할 수 있습니다: 나머지 세 장이 이미 손에 있고 ==네 번째 패를 내가 직접 패산에서 가져왔을 때==입니다. 단, 깡으로 대기가 바뀌면 안 됩니다.',
          },
          {
            type: 'tip',
            md: '다른 사람의 버림패로는 **안 됩니다**: 리치 중에는 손패를 바꿀 수 없으니 명깡도 퐁도 할 수 없습니다.',
          },
          { type: 'heading', text: '깡의 위험' },
          {
            type: 'text',
            md: '깡을 할 때마다 ==도라 표시패가 하나 더== 생기고(깡도라), 이 도라는 깡을 한 사람만이 아니라 테이블의 **모두**에게 적용됩니다. 리치로 화료한 사람은 그 아래의 뒷도라도 봅니다: 도라 기회가 하나 더 생깁니다.',
          },
          {
            type: 'tip',
            md: '그러니 깡을 하기 전에 생각하세요: 새 도라가 나에게서 화료할 사람의 손패를 더 비싸게 만들 수 있습니다.',
          },
        ],
      },
      {
        id: 'kan-dora',
        number: '10.2',
        title: '영상패와 깡도라',
        termos: ['kan-dora'],
        blocks: [
          {
            type: 'text',
            md: '한 몸통에 네 장이 들어가면 손패가 한 장 모자랍니다. 어떤 깡을 하든 왕패에서 **영상패**(보충패)를 한 장 가져오고, 새 도라 표시패를 뒤집습니다. 그다음 패를 버립니다.',
          },
          {
            type: 'image',
            image: 'muroMortoKan',
            alt: '앞에서 본 왕패, 가른 자리부터 7열에 번호가 있습니다. 1열의 위 패가 테이블 옆에 따로 놓여 있습니다: 깡의 영상패입니다. 3열에는 도라 표시패가, 4열에는 깡도라 표시패가 뒤집혀 있습니다.',
            caption: '깡을 한 뒤: 영상패는 1열에서 나오고 깡도라는 4열에서 뒤집힙니다.',
          },
          {
            type: 'text',
            md: '가른 자리 옆의 1열과 2열에는 **깡의 영상패**가 있습니다: 깡을 한 사람은 먼저 1열의 위 패를 가져옵니다. 많은 테이블에서는 가져갈 때 패산이 무너지지 않게 이 패를 미리 테이블 옆에 따로 내려놓습니다.',
          },
          {
            type: 'text',
            md: '깡을 할 때마다 표시패가 하나 더, **깡도라**가 뒤집힙니다: 다음 열(4열, 그다음 5열…)의 위 패입니다. 첫 표시패와 똑같이 작동합니다.',
          },
          {
            type: 'text',
            md: '패산이 다 떨어지면 깡을 할 수 없습니다: 패가 없으니 영상패도 없습니다.',
          },
          {
            type: 'tip',
            md: '깡도라를 뒤집는 시점은 룰마다 다릅니다. 작혼과 텐호에서는 암깡이면 바로 뒤집습니다. 명깡과 가깡은 패를 버린 뒤에 뒤집습니다.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '암깡을 했습니다. 내 손패는 여전히 멘젠일까요?',
        options: simNao(true),
        answer:
          '예. 암깡은 다른 사람의 버림패 없이 내 손의 패만으로 합니다.',
      },
    ],
  },
  {
    id: 'fim-partida',
    number: 5,
    title: '대국의 끝',
    cover: '유국, 다음 친, 그리고 대국이 끝나는 때.',
    pages: [
      {
        id: 'empate',
        number: '5.1',
        title: '유국',
        termos: ['empate', 'tenpai'],
        blocks: [
          {
            type: 'text',
            md: '국은 **화료한 사람 없이** 끝날 수도 있습니다. ==왕패만 남았는데== 아무도 손패를 완성하지 못하면 **유국**(流局, 무승부)으로 끝납니다.',
          },
          {
            type: 'text',
            md: '각자 텐파이인지 말합니다. 텐파이인 사람은 손패를 보여 줍니다. 아닌 사람은 **노텐**이며 손패를 엎어 둬도 됩니다.',
          },
          {
            type: 'tip',
            md: '점수를 셀 때는 노텐인 사람이 텐파이인 사람에게 냅니다. {{onde:pontos}}의 본장과 유국에서 봅니다.',
          },
        ],
      },
      {
        id: 'proxima-mao',
        number: '5.2',
        title: '다음 국',
        termos: ['oya', 'renchan'],
        blocks: [
          {
            type: 'text',
            md: '- 친이 화료했거나 유국 때 텐파이였다면 **친을 계속**하고 국이 반복됩니다(연장, 렌짱).\n- 그렇지 않으면 동이 다음 플레이어에게 넘어갑니다.',
          },
        ],
      },
      {
        id: 'fim',
        number: '5.3',
        title: '동풍전',
        blocks: [
          {
            type: 'text',
            md: '처음에는 **동풍전**(東風戦)을 쳐 보세요: 각자 최소 한 번씩 친을 합니다. 마지막 친이 동을 넘기면 대국이 끝납니다.',
          },
          {
            type: 'text',
            md: '점수를 세지 않는 첫 대국들에서는 가장 많이 화료한 사람이 이깁니다. 점수를 세기 시작하면 점수가 가장 많은 사람이 이기고, 누군가 점수가 마이너스가 되어도 대국이 끝납니다.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '친이 화료했습니다. 다음 국의 친은 누구일까요?',
        options: [
          { label: '그 사람 그대로', correct: true },
          { label: '친의 오른쪽 사람' },
          { label: '바로 전 국에서 화료한 사람' },
        ],
        answer: '그 사람 그대로입니다. 친이 화료하면 친을 계속하고 국이 반복됩니다.',
      },
      {
        type: 'quiz',
        question:
          '패산이 다 떨어지고 아무도 화료하지 못했습니다. 친은 텐파이가 아니었습니다. 다음 국의 친은 누구일까요?',
        options: [
          { label: '그 사람 그대로' },
          { label: '친의 오른쪽 사람', correct: true },
          { label: '텐파이였던 사람' },
        ],
        answer:
          '친의 오른쪽 사람입니다. 유국일 때 친은 텐파이였어야만 계속하고, 그렇지 않으면 동이 넘어갑니다.',
      },
    ],
  },
]

const topicosRegras: TopicoRegras[] = [
  {
    id: 'furiten',
    section: 'regras',
    title: '후리텐',
    termos: ['furiten'],
    blocks: [
      {
        type: 'text',
        md: '후리텐(振聴) 상태에서는 론으로 화료할 수 없고 쯔모로만 화료할 수 있습니다. 후리텐의 원인이 된 패만이 아니라 ==모든== 대기패로 론을 할 수 없습니다. 후리텐으로 론을 선언하면 보통 촌보입니다.',
      },
      {
        type: 'text',
        md: '- **버림패 후리텐**: 손패를 완성하는 패 중 하나가 내 버림패에 있습니다. 대기를 바꿀 때까지 이어집니다.\n- **동순 후리텐**: 손패를 완성하는 패가 나왔는데 론을 하지 않고 넘겼습니다. 내 다음 버림패까지 이어집니다.\n- **리치 후 후리텐**: 리치 뒤에 손패를 완성하는 패를 넘겼습니다. 그 국이 끝날 때까지 이어집니다.',
      },
      {
        type: 'tip',
        md: '중요한 것은 역이 아니라 손패의 모양입니다. 역이 없어 화료할 수 없는 패라도 손패를 완성하는 패라면 후리텐이 됩니다.',
      },
    ],
  },
  {
    id: 'kuikae',
    section: 'regras',
    title: '쿠이카에 금지',
    blocks: [
      {
        type: 'text',
        md: '치나 퐁을 한 직후, 그 차례의 버림패에는 제한이 있습니다. 같은 역할을 하는 패로 바꾸기 위해서만 우는 것을 **쿠이카에**(喰い替え)라고 하며, 금지입니다.',
      },
      { type: 'heading', text: '같은 패' },
      {
        type: 'text',
        md: '방금 가져온 패와 같은 패는 그 차례에 버릴 수 없습니다. 치와 퐁 모두 같습니다.',
      },
      {
        type: 'melds',
        items: [
          {
            mpsz: '555p',
            deLado: 1,
            caption: '5통 퐁: 손에 5통이 하나 더 있어도 지금은 버릴 수 없습니다',
          },
        ],
      },
      { type: 'heading', text: '슌쯔의 반대쪽 끝' },
      {
        type: 'text',
        md: '이웃한 두 패로 치를 했다면 반대쪽 끝의 패도 버릴 수 없습니다. 그 패를 버리면 같은 슌쯔가 한 칸 옮겨진 것뿐이기 때문입니다.',
      },
      {
        type: 'melds',
        items: [
          { mpsz: '234m', deLado: 0, caption: '3-4로 2만 치: 2만도 5만도 버릴 수 없습니다' },
          { mpsz: '867s', deLado: 0, caption: '6-7로 8삭 치: 8삭도 5삭도 버릴 수 없습니다' },
        ],
      },
      {
        type: 'text',
        md: '가운데 패로 하는 치(2-4에 3)나 변짱 치(1-2에 3)는 같은 패만 금지입니다. 반대쪽 끝이 없기 때문입니다.',
      },
      { type: 'heading', text: '왜 금지일까' },
      {
        type: 'text',
        md: '울기는 손패를 앞으로 나아가게 하려는 것입니다. 쿠이카에로는 손패가 나아가지 않습니다. 버리는 패가 같은 몸통을 완성하는 패이기 때문입니다. 이 규칙이 없으면 남의 일발을 끊거나 해저패를 누가 뽑을지 바꾸려고만 울 수 있습니다.',
      },
      {
        type: 'tip',
        md: '울고 나서 버릴 수 있는 패가 금지된 패뿐이라면 그 울기는 할 수 없습니다. 작혼과 텐호에서는 게임이 막아 줍니다. 오프라인 대국에서 쿠이카에를 하면 화료 포기가 됩니다. 패를 계속 뽑고 버리지만 그 국에서는 더 이상 화료할 수 없습니다. 가져온 패와 같은 패만 금지하는 오래된 규칙도 있으니 시작하기 전에 정해 두세요.',
      },
      {
        type: 'quiz',
        question: '5-6통을 가지고 있고 4통을 치했습니다. 그 차례에 버릴 수 없는 패는?',
        hand: '56p',
        options: [
          { label: '4통과 7통', correct: true },
          { label: '4통만' },
          { label: '4통과 6통' },
        ],
        answer:
          '4통과 7통입니다. 4통은 가져온 패이고, 7통을 버리면 같은 5-6으로 5-6-7이 되어 반대쪽 끝이 되기 때문입니다.',
      },
    ],
  },
  {
    id: 'lista-yakus',
    section: 'regras',
    title: '역 목록',
    termos: ['yaku', 'yakuman'],
    blocks: [
      {
        type: 'text',
        md: '모든 역과 멘젠·울기일 때의 판수입니다. **—**는 멘젠일 때만 인정된다는 뜻이고, **Y**는 역만입니다. 역을 누르면 예시를 볼 수 있습니다. 손패를 여러 가지로 읽을 수 있으면 점수가 가장 높은 쪽으로 계산합니다. 역만은 일반 역과 더해지지 않습니다.',
      },
      ...grupoYakus('슌쯔', [
        ['pinfu', '슌쯔만, 역 없는 머리, 양면 대기'],
        ['iipeikou', '같은 수패의 똑같은 슌쯔 두 개'],
        ['ryanpeikou', '똑같은 슌쯔 두 개가 두 쌍'],
        ['sanshoku-doujun', '세 수패에 같은 슌쯔'],
        ['ittsuu', '같은 수패의 1-2-3, 4-5-6, 7-8-9'],
      ]),
      ...grupoYakus('커쯔', [
        ['toitoi', '커쯔 네 개와 머리'],
        ['sanankou', '울지 않고 만든 커쯔 세 개'],
        ['sanshoku-doukou', '세 수패에 같은 커쯔'],
        ['sankantsu', '깡 세 개'],
        ['chiitoitsu', '서로 다른 또이쯔 일곱 개'],
      ]),
      ...grupoYakus('노두패와 자패', [
        ['tanyao', '2부터 8까지의 패만'],
        ['yakuhai', '삼원패나 역이 되는 바람의 커쯔'],
        ['shousangen', '삼원패 커쯔 두 개와 나머지 삼원패 머리'],
        ['chanta', '모든 몸통과 머리에 노두패나 자패'],
        ['junchan', '모든 몸통과 머리에 노두패, 자패 없음'],
        ['honroutou', '노두패와 자패만'],
      ]),
      ...grupoYakus('수패 종류', [
        ['honitsu', '한 가지 수패와 자패'],
        ['chinitsu', '한 가지 수패만, 자패 없음'],
      ]),
      ...grupoYakus('기타', [
        ['riichi', '멘젠으로 텐파이를 선언'],
        ['double-riichi', '첫 버림패에서 바로 리치'],
        ['ippatsu', '리치 후 내 다음 버림패 전에 화료(중간에 울기가 없을 때)'],
        ['menzen-tsumo', '멘젠으로 쯔모'],
        ['haitei', '패산의 마지막 패로 쯔모'],
        ['houtei', '마지막 버림패로 론'],
        ['rinshan', '깡의 영상패로 화료'],
        ['chankan', '다른 사람이 퐁에 더하는 패로 론'],
      ]),
      ...grupoYakus('역만', [
        ['kokushi', '노두패와 자패 한 장씩, 그리고 그중 하나 한 장 더'],
        ['suuankou', '울지 않고 만든 커쯔 네 개'],
        ['daisangen', '삼원패 세 종류의 커쯔'],
        ['shousuushii', '풍패 커쯔 세 개와 나머지 풍패 머리'],
        ['daisuushii', '풍패 네 종류의 커쯔'],
        ['tsuuiisou', '자패만'],
        ['chinroutou', '노두패만'],
        ['ryuuiisou', '초록색 패만'],
        ['chuuren', '한 수패로 1-1-1-2-3-4-5-6-7-8-9-9-9, 그리고 한 장 더'],
        ['suukantsu', '깡 네 개'],
        ['tenhou', '친이 배패 그대로 화료'],
        ['chiihou', '첫 쯔모로 화료'],
      ]),
      { type: 'tip', md: conteudoGuiaBolso('ko').notaKazoe },
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
    title: '촌보',
    termos: ['chombo'],
    blocks: [
      {
        type: 'text',
        md: '되돌릴 수 없게 국을 망가뜨리는 중대한 반칙입니다. 흔한 경우:\n- 완성되지 않았거나 역이 없는 손패, 또는 후리텐으로 화료를 선언한다.\n- 텐파이가 아닌데 리치를 선언한다. 유국으로 끝나 손패를 보여 줄 때 드러납니다.\n- 리치 뒤에 대기가 바뀌는 암깡을 한다.\n- 패산을 무너뜨리거나 실수로 손패를 공개한다.',
      },
      {
        type: 'text',
        md: '그 국은 무효가 되고 같은 본장으로 다시 합니다. 그 국에서 리치한 사람은 공탁을 돌려받습니다. 가장 흔한 벌칙은 만관 쯔모만큼 내는 것입니다. 자라면 친에게 4,000점, 다른 자에게 2,000점씩 냅니다. 친이라면 모두에게 4,000점씩 냅니다. 대회에서는 더 무거운 경우가 많고, 가볍게 치는 자리에서는 받지 않기도 합니다. 치기 전에 정해 두세요.',
      },
    ],
  },
  {
    id: 'honba',
    section: 'chombo-honba',
    title: '본장',
    termos: ['honba'],
    blocks: [
      {
        type: 'text',
        md: '친이 화료하거나 화료한 사람 없이 국이 끝나면 **본장**이 하나 늘어납니다. 친이 넘어가도 본장은 남습니다. 친은 100점 봉을 테이블에 놓아 개수를 표시합니다. 자가 화료하면 0으로 돌아갑니다.',
      },
      {
        type: 'tip',
        md: '본장은 다음 화료를 더 비싸게 만듭니다. 얼마인지는 {{onde:pontos}}에서 봅니다.',
      },
    ],
  },
  {
    id: 'hanchan',
    section: 'regras',
    title: '반장전: 동장과 남장',
    blocks: [
      {
        type: 'text',
        md: '클럽과 대회의 기본 대국입니다. 동장에서 모두가 친을 한 번씩 하고 나면 **남장**이 시작되어 각자 다시 친을 합니다.',
      },
      {
        type: 'text',
        md: '남장에서는 장풍이 남이 됩니다. 동풍전의 두 배 길이라 점수를 만회할 시간이 더 있습니다.',
      },
      {
        type: 'tip',
        md: '**아무도 30,000점에 못 미쳤다면?** 작혼(Mahjong Soul)이나 텐호 같은 많은 곳에서는 누군가 30,000점을 넘을 때까지 **서장**으로 이어집니다. EMA 규칙에서는 남장이 끝나면 무조건 대국이 끝납니다.',
      },
    ],
  },
  {
    id: 'sanma',
    section: 'regras',
    title: "삼마: 3인",
    blocks: [
      { type: 'text', md: "**삼마**는 3명이 하는 리치 마작으로, 일본과 작혼에서 많이 합니다. 규칙은 같고, 다른 점은 아래와 같습니다." },
      { type: 'heading', text: "패" },
      { type: 'text', md: "**만수 2~8**을 빼서 108장으로 합니다. 만수는 1과 9만 남습니다. 적5는 통수와 삭수에만 있습니다." },
      { type: 'hand', mpsz: '19m', caption: "만수는 이것만 남는다" },
      { type: 'heading', text: "자리와 울기" },
      { type: 'text', md: "- 자리는 동·남·서만 있습니다.\n- 퐁과 깡은 됩니다. ==치만 없습니다==.\n- 도라 표시패가 1m이면 도라는 9m, 9m이면 도라는 1m입니다.\n- 사풍연타, 사가리치, 삼가화 유국은 없습니다. 구종구패는 있습니다." },
      { type: 'heading', text: "북뽑기" },
      { type: 'text', md: "손에 북이 있으면 **북뽑기**를 할 수 있습니다. 북을 손 옆에 두고 보충패를 가져옵니다. 북 1장마다 **도라 1**(뽑기 도라)입니다. 울기가 아니므로 멘젠이 유지되고 탕야오도 깨지지 않습니다. 도라 표시패가 서이면 북 1장이 2도라입니다." },
      { type: 'hand', mpsz: '4z', caption: "뽑은 북 1장은 도라 1" },
      { type: 'heading', text: "역" },
      { type: 'text', md: "- **삼색동순**과 만수 **일기통관**은 불가능합니다.\n- 1m과 9m이 있으므로 국사무쌍, 청노두, 삼색동각은 가능합니다.\n- 북뽑기 뒤에는 천화·지화가 없습니다. 북뽑기 보충패로 화료하면 영상개화입니다.\n- 보통 손 안의 북은 역패가 아닙니다." },
      { type: 'heading', text: "지불" },
      { type: 'text', md: "론은 4인과 같습니다. 쯔모는 2명만 냅니다. 흔한 **쯔모손**에서는 북가 몫이 사라져 자의 만관이 8,000이 아니라 6,000입니다. 북가 몫을 두 사람이 나누는 곳도 있습니다. 노텐 벌점은 3,000이 아니라 2,000입니다." },
      { type: 'tip', md: "손패 계산기, 판·부, 대국, 대회 설정에서 3인을 고르면 앱이 삼마로 계산합니다." },
    ],
  },
  {
    id: 'cinco-blocos',
    section: 'estrategia',
    title: '5블록',
    termos: ['par', 'trinca', 'sequencia'],
    blocks: [
      {
        type: 'text',
        md: '완성된 손패는 **5블록**입니다: 몸통 4개와 머리 1개. 그러니 손패를 ==5블록==으로, 각 블록이 완성되었거나 완성되어 가는 상태로 유지하면 더 빨리 나아갑니다.',
      },
      {
        type: 'text',
        md: '블록은 머리, 커쯔, 슌쯔, 또는 거의 완성된 몸통(세 번째 패를 기다리는 두 장)입니다.',
      },
      {
        type: 'hand',
        mpsz: '55p 777s 345m 68p',
        labels: ['머리', '커쯔', '슌쯔', '거의 완성'],
        caption: '네 가지 블록',
      },
      { type: 'tip', md: '치또이쯔(또이쯔 일곱 개)와 국사무쌍에는 해당하지 않습니다.' },
      { type: 'heading', text: '예시' },
      {
        type: 'hand',
        mpsz: '345m 24m 55p 46p 778s 12s',
        labels: ['슌쯔', '간짱', '머리', '간짱', '거의 완성', '변짱'],
      },
      {
        type: 'text',
        md: '자리 5개에 **블록이 6개**입니다: 하나는 빠져야 합니다. 어느 것일까요?',
      },
      {
        type: 'text',
        md: '- **345m과 55p**는 이미 완성: 남깁니다.\n- **778s**는 6, 7, 9삭을 받습니다: 아주 좋으니 남깁니다.\n- **24m과 46p**는 가운데(3m, 5p)를 기다리지만, 5m이나 3p·7p가 오면 양면이 됩니다.\n- **12s**는 끝을 기다려 3s로만 완성됩니다: ==가장 나쁜 블록==입니다.',
      },
      {
        type: 'hand',
        mpsz: '12s',
        caption: '가장 나쁜 블록을 1삭부터 버려 정리하세요',
        after: '3s',
        afterLabel: '대기는 이것뿐',
      },
    ],
  },
  {
    id: 'eficiencia',
    section: 'estrategia',
    title: '첫 버림패들',
    termos: ['tenpai'],
    blocks: [
      {
        type: 'text',
        md: '효율이란 **더 많은 패**를 받는 모양을 남겨 텐파이에 더 빨리 도달하는 것입니다.',
      },
      {
        type: 'text',
        md: '==고립패==(머리도 없고 같은 수패의 이웃도 없는 패)는 이 순서로, 처음부터 끝까지 버리세요:',
      },
      { type: 'hand', mpsz: '234z', caption: '1. 자풍도 장풍도 아닌 바람' },
      { type: 'hand', mpsz: '19m 19p 19s', caption: '2. 노두패(1과 9)' },
      { type: 'hand', mpsz: '567z', caption: '3. 삼원패' },
      { type: 'hand', mpsz: '1z', caption: '4. 마지막으로 자풍과 장풍' },
      {
        type: 'text',
        md: '어떤 바람이 나에게 역이 되는지는 {{onde:yakus}}의 역패에 있습니다. 동장에서 **친**은 동을 끝까지 남깁니다: 친에게는 두 배이기 때문입니다. 다른 사람에게 동은 삼원패처럼 하나의 역입니다.',
      },
      {
        type: 'tip',
        md: '역이 되는 자패를 끝까지 들고 있지는 마세요: 몇 바퀴 안에 머리가 되지 않으면 일찍 버리세요. 나중에는 바로 그 패가 다른 사람의 대기패일 수 있습니다.',
      },
    ],
  },
  {
    id: 'ordem-muda',
    section: 'estrategia',
    title: '순서가 바뀌는 경우',
    termos: ['par'],
    blocks: [
      { type: 'heading', text: '또이쯔는 고립패가 아니다' },
      {
        type: 'hand',
        mpsz: '33z 99m',
        caption: '역 없는 바람 또이쯔와 노두패 또이쯔: 남깁니다',
      },
      {
        type: 'text',
        md: '역 없는 바람 또이쯔는 손패의 머리가 될 수 있고(핑후에서도), 노두패 또이쯔도 남깁니다.',
      },
      { type: 'heading', text: '이웃이 있는 노두패는 고립패가 아니다' },
      {
        type: 'hand',
        mpsz: '12p 13s',
        caption: '1과 2, 또는 1과 3: 이미 몸통의 절반입니다',
      },
      { type: 'heading', text: '1과 4가 함께 있을 때' },
      { type: 'hand', mpsz: '14p', caption: '1과 4(또는 9와 6)가 함께: 1을 버립니다' },
      {
        type: 'text',
        md: '같은 수패의 4가 있으면 1은 거의 도움이 안 됩니다: 1에 붙을 2와 3은 ==4에 더 잘 붙습니다==.',
      },
      { type: 'heading', text: '그 밖의 경우' },
      {
        type: 'text',
        md: '- **이미 버림패에 나온 자패**는 가치가 낮습니다: 또이쯔가 될 남은 장수가 적습니다.\n- **혼일색이나 찬타 같은 역**을 노리면 모든 게 달라집니다: 자패와 노두패의 가치가 올라갈 수 있습니다.',
      },
    ],
  },
  {
    id: 'contagem-pedras',
    section: 'estrategia',
    title: '몇 장이 도움이 되나',
    termos: ['ryanmen'],
    blocks: [
      {
        type: 'text',
        md: '왜 이 순서일까요? 고립패를 또이쯔나 몸통의 절반으로 만드는 패가 몇 장인지 세어 보세요. 도움이 되는 패가 많을수록 남길 가치가 큽니다.',
      },
      {
        type: 'table',
        headers: ['고립패', '도움이 되는 패'],
        rows: [
          ['자패', '3(또이쯔만 가능)'],
          ['1과 9', '11'],
          ['2와 8', '15'],
          ['3부터 7', '19'],
        ],
      },
      {
        type: 'hand',
        mpsz: '1p',
        caption: '고립된 1통: 같은 패, 2, 3이 도움이 됩니다',
        after: '1p2p3p',
        afterLabel: '도움',
      },
      {
        type: 'hand',
        mpsz: '5p',
        caption: '고립된 5통: 같은 패와 3부터 7까지 도움이 됩니다',
        after: '3p4p5p6p7p',
        afterLabel: '도움',
      },
      {
        type: 'tip',
        md: '계산만 보면: 3~7 > 2와 8 > 1과 9 > 자패. 자패를 맨 뒤에서 구해 주는 것은 그 패가 줄 수 있는 역입니다.',
      },
      { type: 'heading', text: '양면 대기를 고르세요' },
      {
        type: 'text',
        md: '받을 수 있는 패가 몇 장인지 세어 보세요: 패마다 4장씩 있습니다.',
      },
      {
        type: 'hand',
        mpsz: '23m',
        caption: '양면: 최대 8장',
        after: '14m',
        afterLabel: '대기',
      },
      {
        type: 'hand',
        mpsz: '13m',
        caption: '간짱: 최대 4장',
        after: '2m',
        afterLabel: '대기',
      },
      {
        type: 'hand',
        mpsz: '12m',
        caption: '변짱: 최대 4장',
        after: '3m',
        afterLabel: '대기',
      },
    ],
  },
  {
    id: 'quando-defender',
    section: 'estrategia',
    title: '공격할까, 수비할까?',
    termos: ['tenpai', 'riichi'],
    blocks: [
      {
        type: 'text',
        md: '누군가 리치를 선언하면 내 손패를 보세요. **샹텐**(向聴)은 텐파이까지 남은 수입니다: 1샹텐이면 한 장, 2샹텐이면 두 장이 모자랍니다.',
      },
      {
        type: 'hand',
        mpsz: '234m 567p 11s 345s 78p',
        caption: '텐파이: 6통이나 9통 대기',
      },
      {
        type: 'hand',
        mpsz: '234m 567p 11s 34s 78p 9m',
        caption: '1샹텐: 텐파이까지 한 장',
      },
      {
        type: 'text',
        md: '- **텐파이**: 대개 공격할 만합니다. 내가 친이면 더욱 그렇습니다. 내 손패의 점수에 따라 다릅니다.\n- **1샹텐**: 도움이 되는 패가 아직 많은지, 손패가 위험을 감수할 만한지 생각하세요.\n- **2샹텐 이상**: ==수비하세요==.',
      },
      { type: 'heading', text: '따져 볼 것' },
      {
        type: 'text',
        md: '- 보이는 도라는 몇 장인가?\n- 텐파이인 사람이 친인가? 친은 1.5배를 받습니다.\n- 내 손패는 얼마짜리인가?\n- 점수 상황은 어떤가?\n- 대국이 끝날 때까지 몇 국 남았나?',
      },
    ],
  },
  {
    id: 'defesa',
    section: 'estrategia',
    title: '수비: 현물',
    termos: ['riichi', 'furiten'],
    blocks: [
      {
        type: 'text',
        md: '수비란 리치를 선언한 사람의 대기패일 ==가능성이 가장 낮은== 패를 버리는 것입니다.',
      },
      {
        type: 'text',
        md: '모든 것의 바탕은 **후리텐**입니다: 상대의 대기패 중 ==하나라도== 그 사람의 버림패에 있으면, 그 사람은 어느 대기패로도 론을 할 수 없습니다.',
      },
      {
        type: 'hand',
        mpsz: '45s',
        caption: '상대가 4-5삭으로 기다리는데 이미 3삭을 버렸다면…',
        after: '3s6s',
        afterLabel: '둘 다 후리텐',
      },
      { type: 'heading', text: '현물: 상대가 버린 패' },
      {
        type: 'text',
        md: '리치한 사람이 ==이미 버린== 패는 그 사람에게 100% 안전합니다(현물, 現物): 그 패가 대기패라면 그 사람은 후리텐이라 론을 할 수 없습니다.',
      },
      {
        type: 'hand',
        mpsz: '9m 2z 7p 3s',
        caption: '상대의 버림패: 모두 그 사람에게 안전합니다',
      },
      {
        type: 'tip',
        md: '100%인 것은 현물뿐입니다. 스지, 벽(카베) 등은 아무것도 보장하지 않지만, 아무 패보다는 훨씬 안전합니다.',
      },
      {
        type: 'text',
        md: '**잘 모르겠다면**: 현물 먼저, 그다음 이미 두세 장 나온 자패, 그다음 스지. 약한 손패를 포기하는 것도 좋은 플레이입니다.',
      },
    ],
  },
  {
    id: 'suji',
    section: 'estrategia',
    title: '수비: 스지',
    termos: ['furiten', 'ryanmen'],
    blocks: [
      {
        type: 'text',
        md: '리치한 사람의 버림패는 나에게 더 안전한 패를 알려 줍니다. 상대가 4를 버렸다면 같은 수패의 ==1과 7==이 더 안전해집니다.',
      },
      {
        type: 'text',
        md: '이렇게 3씩 차이 나는 숫자(1-4-7, 2-5-8, 3-6-9)를 **스지**(筋)라고 합니다. 가장 흔한 양면 대기를 막아 줍니다.',
      },
      { type: 'heading', text: '왜 통할까' },
      {
        type: 'text',
        md: '상대가 **5통**을 버렸습니다. 3-4통이나 6-7통으로 기다린다면 5가 대기패 중 하나라서 후리텐이 됩니다. 그러니 상대는 이 두 모양으로 ==기다리지 않습니다==:',
      },
      {
        type: 'hand',
        mpsz: '34p',
        caption: '3-4는 2나 5를 기다림: 불가능',
        after: '2p5p',
        afterLabel: '대기',
      },
      {
        type: 'hand',
        mpsz: '67p',
        caption: '6-7은 5나 8을 기다림: 불가능',
        after: '5p8p',
        afterLabel: '대기',
      },
      {
        type: 'text',
        md: '그래서 **2통과 8통**이 더 안전해집니다: 5의 스지입니다.',
      },
      { type: 'heading', text: '세 가지 기준' },
      {
        type: 'text',
        md: '4, 5, 6은 각각 양면 대기를 ==두 개== 끊기 때문에 기준이 됩니다. 상대가 그중 하나를 버렸다면 ==그 스지를 버리는 것==이 더 안전합니다:',
      },
      {
        type: 'hand',
        mpsz: '4p',
        caption: '상대가 4를 버림: 1과 7을 덜 위험하게 버릴 수 있습니다',
        after: '1p7p',
        afterLabel: '더 안전',
      },
      {
        type: 'hand',
        mpsz: '5p',
        caption: '상대가 5를 버림: 2와 8이 더 안전합니다',
        after: '2p8p',
        afterLabel: '더 안전',
      },
      {
        type: 'hand',
        mpsz: '6p',
        caption: '상대가 6을 버림: 3과 9가 더 안전합니다',
        after: '3p9p',
        afterLabel: '더 안전',
      },
      { type: 'heading', text: '스지가 막지 못하는 것' },
      {
        type: 'hand',
        mpsz: '46p',
        caption: '간짱: 2와 8이 버려져 있어도 4-6은 5를 기다립니다',
        after: '5p',
        afterLabel: '대기',
      },
      {
        type: 'text',
        md: '스지는 간짱, 변짱(1-2로 3 대기), 단기, 샤보 대기는 막지 못합니다.',
      },
      {
        type: 'tip',
        md: '바로 여기에 **스지 함정**이 있습니다: 규칙을 아는 사람은 일부러 스지로 기다릴 수 있습니다. 어떻게 하는지는 반스지 바로 다음에 봅니다.',
      },
      { type: 'heading', text: '스지라고 다 같지 않다' },
      {
        type: 'text',
        md: '- **1과 9**: 가장 안전합니다. 단기나 샤보로만 쏘일 수 있습니다.\n- **2와 8**: 간짱으로도 쏘일 수 있습니다(1-3으로 2 대기).\n- **3과 7**: 가장 덜 안전합니다. 간짱과 변짱으로도 쏘일 수 있습니다(1-2로 3 대기).',
      },
      {
        type: 'text',
        md: '==리치 선언패==의 스지는 조심하세요. 1-3-5에서 5를 버리고 리치하면 2 대기가 남습니다. 5의 스지라 안전해 보이지만 쏘입니다. 1과 9는 이런 걱정이 없습니다.',
      },
      {
        type: 'tip',
        md: '스지가 많이 통할수록 남은 패는 더 위험해집니다. 양면 대기라면 아직 통하지 않은 스지 중 하나가 대기이기 때문입니다.',
      },
    ],
  },
  {
    id: 'meio-suji',
    section: 'estrategia',
    title: '수비: 반스지와 나카스지',
    termos: ['ryanmen'],
    blocks: [
      { type: 'heading', text: '반스지' },
      {
        type: 'hand',
        mpsz: '8m',
        caption: '상대가 8만 버림: 5는 조금만 더 안전합니다',
        after: '5m',
        afterLabel: '반쯤 안전',
      },
      {
        type: 'text',
        md: '8은 6-7(5나 8 대기)을 끊지만 3-4는 끊지 못합니다. 상대는 여전히 3-4로 5를 기다릴 수 있습니다:',
      },
      {
        type: 'hand',
        mpsz: '34m',
        caption: '아직 가능: 2나 5 대기',
        after: '2m5m',
        afterLabel: '대기',
      },
      {
        type: 'text',
        md: '그래서 5는 **반스지**일 뿐입니다: 아무것도 없는 것보다는 안전하지만 진짜 스지보다는 덜합니다.',
      },
      { type: 'heading', text: '나카스지' },
      {
        type: 'hand',
        mpsz: '2s8s',
        caption: '상대가 2와 8을 버림: 5는 스지만큼 안전합니다',
        after: '5s',
        afterLabel: '더 안전',
      },
      {
        type: 'text',
        md: '2 **와** 8이 버려져 있으면 3-4와 6-7이 모두 불가능합니다. 5는 양쪽에서 보호되어 ==진짜 스지==와 같습니다(나카스지, 中筋). 4(1과 7)와 6(3과 9)도 마찬가지입니다.',
      },
    ],
  },
  {
    id: 'armadilha-suji',
    section: 'estrategia',
    title: '공격: 스지 함정',
    termos: ['riichi', 'furiten'],
    blocks: [
      {
        type: 'text',
        md: '이번에는 테이블 반대편 입장입니다: 스지로 수비하는 사람은 내가 4를 버렸으면 1과 7이 안전하다고 생각합니다. **스지 함정**(스지 히캇케)은 스지가 막지 못하는 모양으로 ==바로 그 스지를 기다리는 것==입니다.',
      },
      { type: 'heading', text: '만드는 법' },
      {
        type: 'hand',
        mpsz: '4m 68m',
        caption: '손에 4만과 6-8만이 있습니다',
      },
      {
        type: 'steps',
        items: [
          '**미끼를 버립니다**: 4만. 다른 사람에게는 1만과 7만이 안전해 보이게 됩니다.',
          '**간짱** 대기를 남깁니다: 6-8은 내가 버린 4의 스지인 7을 기다립니다.',
          '스지로 수비하는 사람이 안전하다고 생각하고 7을 버리면 론을 합니다.',
        ],
      },
      {
        type: 'hand',
        mpsz: '68m',
        caption: '버린 4 때문에 안전해 보이는 7을 기다림',
        after: '7m',
        afterLabel: '대기',
      },
      { type: 'heading', text: '통하는 다른 모양' },
      {
        type: 'hand',
        mpsz: '89m',
        caption: '변짱: 8-9는 7을 기다림',
        after: '7m',
        afterLabel: '대기',
      },
      {
        type: 'hand',
        mpsz: '11m 55p',
        caption: '샤보: 1만(4의 스지)이나 5통을 기다림',
        after: '1m5p',
        afterLabel: '대기',
      },
      {
        type: 'text',
        md: '==통하지 않는== 것은 양면 대기입니다: 4를 버린 상태에서 4나 7을 기다리는 5-6은 4가 내 버림패에 있으니 **후리텐**이 됩니다.',
      },
      {
        type: 'hand',
        mpsz: '56m',
        caption: '후리텐: 4가 대기패 중 하나이고 이미 내 버림패에 있습니다',
        after: '4m7m',
        afterLabel: '안 됨',
      },
      { type: 'heading', text: '가장 강한 미끼' },
      {
        type: 'text',
        md: '==미끼 패로 리치를 선언==하는 것입니다. 모두가 리치 선언패를 보고 그 스지를 믿습니다. 일찍 버린 미끼도 도움이 되는데, 소토가와가 더해져 바깥쪽이 더 안전해 보이기 때문입니다.',
      },
      { type: 'heading', text: '주의할 점' },
      {
        type: 'text',
        md: '- 간짱이나 변짱 대기는 양면(최대 8장)보다 **받는 패가 적습니다**(최대 4장). 함정이 그만한 가치가 있을 때만 바꾸세요.\n- **스지로 수비하는** 사람에게 통합니다. 초보자는 내 버림패를 읽지 않고 버리고, 숙련자는 리치 근처의 스지를 의심합니다.\n- 지나치게 쓰지 마세요: 늘 함정을 파면 다른 사람이 내 스지를 믿지 않게 됩니다.',
      },
    ],
  },
  {
    id: 'kabe',
    section: 'estrategia',
    title: '수비: 벽(카베)',
    termos: ['ryanmen'],
    blocks: [
      {
        type: 'text',
        md: '**카베**(壁)는 벽이라는 뜻입니다. 어떤 패 4장이 어디 있는지 보는 것입니다: 버림패, 운 몸통, 도라 표시패, 그리고 내 손패. ==4장이 모두 보이면== 그 패가 필요한 몸통은 아무도 가질 수 없습니다.',
      },
      {
        type: 'hand',
        mpsz: '3333p',
        caption: '3통 4장이 모두 보입니다',
      },
      {
        type: 'hand',
        mpsz: '23p 34p 13p',
        caption: '이 중 어느 것도 불가능: 모두 3이 필요합니다',
      },
      {
        type: 'hand',
        mpsz: '3p',
        caption: '벽 너머',
        after: '1p2p',
        afterLabel: '더 안전',
      },
      {
        type: 'tip',
        md: '벽이 있다고 100% 안전하지는 않습니다: 단기나 샤보로는 여전히 기다릴 수 있습니다. 하지만 아무 패보다는 훨씬 안전합니다.',
      },
      { type: 'heading', text: '어떤 패가 더 안전해지나' },
      {
        type: 'table',
        headers: ['4장이 보이는 패', '더 안전해지는 패'],
        rows: [
          ['2', '1'],
          ['3', '1과 2'],
          ['4', '2와 3'],
          ['5', '3과 7'],
          ['6', '7과 8'],
          ['7', '8과 9'],
          ['8', '9'],
        ],
      },
      {
        type: 'text',
        md: '2, 3, 4이면 ==앞의== 두 패가 더 안전해집니다. 6, 7, 8이면 ==뒤의== 두 패. 5이면 3과 7입니다.',
      },
      {
        type: 'hand',
        mpsz: '1111s',
        caption: '노두패: 4장이 보여도 아무것도 지켜 주지 않습니다',
      },
      { type: 'heading', text: '노찬스와 원찬스' },
      {
        type: 'hand',
        mpsz: '6666m',
        caption: '노찬스: 4장이 모두 보임',
      },
      {
        type: 'hand',
        mpsz: '666m',
        caption: '원찬스: 4장 중 3장이 보임',
      },
      {
        type: 'text',
        md: '- **노찬스**: 그 패로 양면 대기가 될 가능성이 없고, 간짱 대기에도 통합니다. 스지만큼, 또는 그 이상 안전합니다.\n- **원찬스**: 누군가 마지막 한 장을 가지고 있을 가능성은 낮지만 있을 수도 있습니다. 국의 초반과 중반에 더 쓸모 있고, 막바지에는 마지막 한 장이 이미 누군가의 손에 있을 수 있습니다.',
      },
    ],
  },
  {
    id: 'sotogawa',
    section: 'estrategia',
    title: '수비: 소토가와',
    termos: ['riichi'],
    blocks: [
      {
        type: 'text',
        md: '**소토가와**(外側)는 바깥쪽이라는 뜻입니다. 가운데 패를 ==아주 일찍==(첫 줄에서) 버린 사람은 아마 그 패와 수패 끝 사이의 패를 가지고 있지 않았을 겁니다: 가지고 있었다면 그 패가 쓸모 있었을 테니까요.',
      },
      {
        type: 'hand',
        mpsz: '233m 334m',
        caption: '이 중 하나가 있었다면 3만을 일찍 버리지 않았을 겁니다',
      },
      {
        type: 'text',
        md: '버렸다면 아마 이미 몸통을 완성했을 겁니다. ==끝 쪽으로== 2칸 이내의 패가 조금 더 안전해집니다:',
      },
      {
        type: 'hand',
        mpsz: '3m',
        caption: '3을 일찍 버림: 1과 2(바깥쪽)가 조금 더 안전합니다',
        after: '1m2m',
        afterLabel: '더 안전',
      },
      {
        type: 'table',
        headers: ['일찍 버린 패', '바깥쪽'],
        rows: [
          ['2', '1'],
          ['3', '1과 2'],
          ['4', '2와 3'],
          ['5', '3과 7'],
          ['6', '7과 8'],
          ['7', '8과 9'],
          ['8', '9'],
        ],
      },
      {
        type: 'text',
        md: '- 잘 치는 사람에게 더 잘 통합니다: 상대가 효율적으로 버린다는 전제이기 때문입니다.\n- 소토가와이면서 **동시에** 스지인 패가 더 안전합니다.\n- 리치 선언패에는 적용되지 않습니다. 일찍 나왔더라도 마찬가지입니다.',
      },
      {
        type: 'hand',
        mpsz: '3p5p',
        caption: '3과 5를 버림: 2는 3의 소토가와이자 5의 스지입니다',
        after: '2p',
        afterLabel: '훨씬 안전',
      },
    ],
  },
  {
    id: 'matagi-suji',
    section: 'estrategia',
    title: '수비: 마타기 스지',
    termos: ['riichi'],
    blocks: [
      {
        type: 'text',
        md: '**마타기 스지**(跨ぎ筋)는 소토가와의 반대입니다: ==더 위험한== 패를 알려 줍니다. 후반의 버림패, 특히 리치 선언패를 봅니다.',
      },
      {
        type: 'hand',
        mpsz: '3m',
        caption: '3만을 버리며 리치를 선언',
      },
      {
        type: 'hand',
        mpsz: '233m 334m',
        caption: '이 중 하나에서 나왔을 수 있습니다',
      },
      {
        type: 'hand',
        mpsz: '23m 34m',
        caption: '손에 2-3이나 3-4가 남았습니다',
      },
      {
        type: 'hand',
        mpsz: '3m',
        caption: '그러니 가장 가능성 높은 대기는 1-4와 2-5입니다',
        after: '1m4m2m5m',
        afterLabel: '더 위험',
      },
      {
        type: 'text',
        md: '어떤 패에도 해당합니다: 위험한 것은 그 패를 ==넘어가는== 양면 대기입니다.',
      },
      {
        type: 'tip',
        md: '마타기 스지를 외울 필요는 없습니다. 수비의 순서는 현물, 그다음 스지와 벽, 그다음 소토가와입니다. 마타기 스지는 공격할지 물러설지 정할 때 도움이 됩니다.',
      },
      {
        type: 'text',
        md: `더 알아보기: [Suji in mahjong, NPMahjong](${ARTIGO_SUJI}) (영어).`,
      },
    ],
  },
]

const moduloRegras = criarModuloRegras(topicosRegras)
const modulo = criarBuscaModulo(modulos)

export const tutorialParts: TutorialPart[] = [
  {
    id: 'primeiras-partidas',
    number: 1,
    title: '첫 대국',
    cover: '역도 점수 계산도 없이 한 판을 치는 데 필요한 모든 것.',
    modules: ['pedras', 'mesa', 'mao', 'turno', 'fim-partida'].map(modulo),
  },
  {
    id: 'ir-alem',
    number: 2,
    title: '한 걸음 더',
    cover:
      '역, 촌보, 본장: 점수는 아직 세지 않고 실제 게임의 규칙을.',
    milestone: {
      title: '이제 칠 수 있습니다!',
      md: '계속하기 전에 ==한 판 쳐 보세요==(동풍전). 지금은 역도 점수 계산도 없이: 손패를 완성한 사람이 이기고, 방금 본 대로 동이 넘어갑니다.\n지금까지 본 것은 **기초**입니다. 완전한 게임은 더 넓고, 다음 모듈들이 나머지를 보여 줍니다.',
    },
    modules: [
      modulo('yakus'),
      moduloRegras('chombo-honba', 7, '촌보와 본장', '화료를 무효로 만드는 실수와 반복되는 국.'),
    ],
  },
  {
    id: 'pontos-parte',
    number: 3,
    title: '점수',
    cover: '각 손패의 값, 도라와 깡까지.',
    milestone: {
      title: '다시 쳐 보세요!',
      md: '점수로 넘어가기 전에, 역이 있어야 하는 규칙으로 ==한 판 쳐 보세요==. 점수는 아직 세지 않고 국마다 누가 이겼는지 적어 두었다가, 가장 많이 이긴 사람이 이깁니다.',
    },
    modules: ['pontos', 'dora', 'kan'].map(modulo),
  },
  {
    id: 'aprofundando',
    number: 4,
    title: '더 깊이',
    cover:
      '모든 대국에 적용되는 더 많은 규칙.',
    modules: [
      moduloRegras('regras', 11, '더 많은 규칙', '이것도 게임의 일부인 세부 규칙.'),
    ],
  },
  {
    id: 'estrategia-parte',
    number: 5,
    title: '전략',
    cover: '더 잘 치기 위해: 무엇을 버리고 언제 수비할지.',
    modules: [
      moduloRegras(
        'estrategia',
        12,
        '전략',
        '첫 대국들을 치른 뒤 더 잘 치기 위해.',
        [
          {
            type: 'quiz',
            question: '손패에 블록이 6개 있습니다. 어느 것을 먼저 정리할까요?',
            hand: '345m 24m 55p 46p 778s 12s',
            options: [
              { label: '1-2삭', mpsz: '12s', correct: true },
              { label: '2-4만', mpsz: '24m' },
              { label: '7-7-8삭', mpsz: '778s' },
            ],
            answer:
              '1-2삭입니다. 끝을 기다리는 변짱이라 3삭으로만 완성됩니다. 2-4만은 아직 양면이 될 수 있고, 7-7-8은 서로 다른 패 세 종류를 받습니다.',
          },
          {
            type: 'quiz',
            question: '패를 가져왔고 하나를 버려야 합니다. 어느 패를 먼저 버릴까요?',
            hand: '234m 9m 55p 678p 45s 79s 4z',
            options: [
              { label: '북', mpsz: '4z', correct: true },
              { label: '9만', mpsz: '9m' },
              { label: '7삭', mpsz: '7s' },
            ],
            answer:
              '북입니다(자풍도 장풍도 아니라면). 혼자서는 또이쯔만 될 수 있고 역이 되지 않습니다. 9만은 아직 7-8-9가 될 수 있고, 7-9삭은 8을 기다립니다.',
          },
          {
            type: 'quiz',
            question: '1통과 4통이 그 수패에 홀로 있습니다. 어느 것을 버릴까요?',
            hand: '14p',
            options: [
              { label: '1통', mpsz: '1p', correct: true },
              { label: '4통', mpsz: '4p' },
            ],
            answer:
              '1통입니다. 1에 도움이 될 2와 3은 4에 더 잘 붙고, 4는 5와 6도 받습니다.',
          },
          {
            type: 'quiz',
            question:
              '누군가 리치를 선언했습니다. 내 손패는 2샹텐이고 점수도 높지 않습니다. 어떻게 할까요?',
            options: [{ label: '수비', correct: true }, { label: '공격' }],
            answer:
              '수비입니다. 텐파이까지 두 장이 모자라니 상대에게 방총하기 전에 거기까지 갈 가능성이 낮습니다.',
          },
          {
            type: 'quiz',
            question: '상대가 8만만 버렸습니다. 5만은 스지일까요?',
            hand: '8m',
            options: [{ label: '예, 스지입니다' }, { label: '아니요, 반스지일 뿐입니다', correct: true }],
            answer:
              '반스지일 뿐입니다. 상대는 아직 2나 5를 기다리는 3-4만을 가지고 있을 수 있습니다. 5가 진짜 스지가 되려면 2도 나와 있어야 합니다.',
          },
          {
            type: 'quiz',
            question:
              '6-8만으로 7만을 기다리는 함정을 만들려고 합니다. 어느 패를 미끼로 버리는 게 가장 좋을까요?',
            hand: '68m',
            options: [
              { label: '4만', mpsz: '4m', correct: true },
              { label: '5만', mpsz: '5m' },
              { label: '9만', mpsz: '9m' },
            ],
            answer:
              '4만입니다. 7은 4의 스지라서, 스지로 수비하는 사람은 7이 안전하다고 생각하고 나에게 버립니다.',
          },
          {
            type: 'quiz',
            question:
              '누군가 리치를 선언했고 3통 4장이 모두 보입니다. 이 중 가장 안전한 것은?',
            hand: '3333p',
            options: [
              { label: '1통', mpsz: '1p', correct: true },
              { label: '4통', mpsz: '4p' },
              { label: '6통', mpsz: '6p' },
            ],
            answer:
              '1통입니다. 1통은 2-3으로만 기다릴 수 있는데, 3 네 장이 모두 보이니 아무도 2-3을 가질 수 없습니다. 4와 6은 여러 방식으로 기다릴 수 있습니다.',
          },
          {
            type: 'quiz',
            question:
              '동장에서 내가 친입니다. 고립된 동과 발이 있습니다. 어느 것을 더 오래 남길까요?',
            hand: '1z 6z',
            options: [
              { label: '동', mpsz: '1z', correct: true },
              { label: '발', mpsz: '6z' },
            ],
            answer:
              '동입니다. 동장의 친에게 동은 자풍이자 장풍이라 커쯔 하나로 2판이 됩니다.',
          },
        ],
      ),
    ],
  },
]

trocarReferencias(tutorialParts, (parte, numeroModulo, titulo) => `${parte}부 ${numeroModulo}장(${titulo})`)

/** Verbetes do Glossário do app, mais os termos de mesa que só o guia usa. */
export const glossary: TermoGlossarioGuia[] = [
  { term: '촌보', definition: doGlossario('chombo') },
  { term: '도라', definition: doGlossario('dora') },
  { term: '부', definition: doGlossario('fu') },
  { term: '후리텐', definition: doGlossario('furiten') },
  {
    term: '현물',
    definition: '리치한 사람이 이미 버린 패: 그 사람에게 안전합니다.',
  },
  { term: '판', definition: doGlossario('han') },
  { term: '반장전', definition: '동장과 남장이 있는 기본 대국.' },
  { term: '본장', definition: doGlossario('honba') },
  { term: '자', definition: doGlossario('ko') },
  { term: '멘젠', definition: '닫힌 손패: 다른 사람의 버림패를 하나도 쓰지 않은 손패.' },
  {
    term: '왕패',
    definition:
      '가른 자리 뒤로 따로 떼어 둔 14장으로, 평소에는 가져오지 않습니다. 도라 표시패와 깡의 영상패가 여기에 있습니다.',
  },
  { term: '친', definition: doGlossario('oya') },
  {
    term: '스지',
    definition:
      '같은 수패에서 3씩 차이 나는 숫자(1-4-7, 2-5-8, 3-6-9). 양면 대기에 대해 더 안전합니다.',
  },
  { term: '텐파이', definition: doGlossario('tenpai') },
  { term: '동풍전', definition: '동장만 치는 짧은 대국.' },
  { term: '역', definition: doGlossario('yaku') },
]

export const conteudoKo: ConteudoTutorial = {
  tutorialParts,
  glossary,
  ranks: ['초보', '숙련', '베테랑', '전문가', '초단'],
  ilustracoes: {
    colunaDuasPedras: '1열 = 패 2장',
    umaSobreOutra: '한 장 위에 한 장',
    comprimentoMuro: '길이 17장',
    conteDireitaEsquerda: '오른쪽에서 왼쪽으로 세기',
    abertura: '가른 자리',
    esquerda: '← 왼쪽',
    suaDireita: '내 오른쪽 →',
    voceSentado: '내 패산을 마주 보고 앉은 나',
    indicadorDora: '도라 표시패',
    reposicaoKan: '깡 영상패',
    kanDora: '깡도라',
    compras: '← 가져오기',
    muroMorto: '왕패(14장)',
    muroMortoCurto: '왕패',
    ponChamada: '퐁(울기)',
    ordem: '순서',
    daVez: '차례',
    ventos: { leste: '동', sul: '남', oeste: '서', norte: '북' },
    sufixoOya: ' (친)',
    dadosExemplo: '2 + 3 = 5 → 동(친)',
    dadosExemploCurto: '2 + 3 = 5 → 동',
    direitaLeste: '1 = 동의 오른쪽',
    contaEsquerda: '← 왼쪽으로 세기',
    abreDepois: '5번째 열 다음에서 가르기 ↘',
    colunasLeste: '동에 5열',
    colunasSul: '+ 남에 2열 ↘',
    seusDescartes: '내 버림패: 6장씩 줄',
  },
}
