/**
 * Guia Aprender a jogar em pt-BR: um livro em três partes. Primeiras partidas
 * (das pedras ao fim da partida, para jogar sem contar pontos), Para ir além
 * (pontos, dora e kan) e Aprofundando (mais regras e estratégia), com
 * glossário e créditos.
 *
 * É a versão longa das ajudas do app (botões "?", Glossário do Guia de bolso,
 * cartões de yaku): mesmo vocabulário e mesmo tom. Onde o app já tem o dado
 * (valores dos patamares, han dos yakus, verbetes do glossário), ele vem de
 * lá, para os dois nunca divergirem.
 *
 * Quando um texto adianta um assunto, ele diz onde: `{{onde:<id do módulo>}}`
 * vira "Parte N, Módulo M (Título)" (ver `trocarReferencias`), então a
 * referência acompanha a ordem do livro. Os textos não citam telas do app,
 * menos o Sorteador, que o próprio guia abre no sorteio dos ventos.
 *
 * Escrito a partir do Mahjong Guia de Bolso, de Isabella Oliveira / Cerrado
 * Mahjong Club (ver `credits`).
 */
import { BASE_PATAMAR } from '@/compartilhado/mahjong/pontuacao'
import { SECOES_GLOSSARIO } from '@/dominios/calculadora-mao/logica/glossario'
import { KAZOE_NOTE, YAKU } from '@/dominios/calculadora-mao/logica/yakus'
import type {
  ConteudoTutorial,
  TermoGlossarioGuia,
  TutorialBlock,
  TutorialModule,
  TutorialPart,
} from './tipos'

const pontos = (valor: number) => valor.toLocaleString('pt-BR')

/** Linha da tabela de patamares: ko recebe 4× a base e o oya 6×, como na calculadora. */
const linhaPatamar = (nome: string, han: string, base: number) => [
  nome,
  han,
  pontos(base * 4),
  pontos(base * 6),
]

/** Han de um yaku na referência do app (mão fechada). */
const hanYaku = (id: string) => String(YAKU.find((item) => item.id === id)?.hanClosed ?? '')

/** Yakuman que só vale com a mão fechada: na tabela, "—" na coluna da aberta. */
const YAKUMAN_SO_FECHADA = new Set(['kokushi', 'suuankou', 'chuuren', 'tenhou', 'chiihou'])

/**
 * Linha da Lista de yakus: nome, a frase e o han da referência do app.
 * "—" = só fechada; "Y" = yakuman; "+1" = soma ao Riichi (Daburu Riichi).
 */
const linhaYaku = (id: string, frase: string) => {
  const yaku = YAKU.find((item) => item.id === id)
  if (yaku?.yakuman) return [yaku.romaji, frase, 'Y', YAKUMAN_SO_FECHADA.has(id) ? '—' : 'Y']
  const han = (valor: number | null | undefined) =>
    valor == null ? '—' : yaku?.bonus ? `+${valor}` : String(valor)
  return [yaku?.romaji ?? id, frase, han(yaku?.hanClosed), han(yaku?.hanOpen)]
}

/** Um grupo da Lista de yakus: subtítulo e tabela; tocar num yaku abre o cartão dele. */
const grupoYakus = (titulo: string, linhas: [id: string, frase: string][]): TutorialBlock[] => [
  { type: 'heading', text: titulo },
  {
    type: 'table',
    headers: ['Yaku', 'O que pede', 'Fechada', 'Aberta'],
    rows: linhas.map(([id, frase]) => linhaYaku(id, frase)),
    compact: true,
    links: linhas.map(([id]) => `yaku:${id}`),
  },
]

/** Definição de um verbete do Glossário do app (fonte única). */
const doGlossario = (id: string) => {
  for (const secao of SECOES_GLOSSARIO) {
    const item = secao.itens.find((verbete) => verbete.id === id)
    if (item?.texto) return item.texto
  }
  return ''
}

/** Artigo de suji indicado na Defesa básica e em "Para ir além". */
const ARTIGO_SUJI = 'https://npmahjong.com/blog/suji'

const SIM_NAO = (sim: boolean) => [
  { label: 'Sim', correct: sim },
  { label: 'Não', correct: !sim },
]

const modulos: TutorialModule[] = [
  {
    id: 'pedras',
    number: 1,
    title: 'As pedras',
    cover: 'Conheça as 136 pedras do jogo.',
    pages: [
      {
        id: 'naipes',
        number: '1.1',
        title: 'Os três naipes',
        termos: ['naipes', 'man', 'pin', 'sou'],
        blocks: [
          {
            type: 'text',
            md: 'São **136 pedras**: 34 tipos, com 4 cópias de cada. Três naipes vão de 1 a 9.',
          },
          // Mesmo formato do Glossário do Guia de bolso: nome, kanji, apelido e o
          // número em cima de cada pedra.
          { type: 'text', md: '**Man** 萬 • Caracteres: números escritos em kanji.' },
          { type: 'hand', mpsz: '123456789m', numbered: true },
          { type: 'text', md: '**Pin** 筒 • Círculos: de um a nove círculos.' },
          { type: 'hand', mpsz: '123456789p', numbered: true },
          { type: 'text', md: '**Sou** 索 • Bambus: o 1 costuma ser um pássaro.' },
          { type: 'hand', mpsz: '123456789s', numbered: true },
        ],
      },
      {
        id: 'honras',
        number: '1.2',
        title: 'As honras',
        termos: ['honras', 'ventos', 'dragoes'],
        blocks: [
          { type: 'text', md: 'Pedras sem número (字牌). Nunca formam sequência.' },
          {
            type: 'text',
            md: '**Ventos** 風牌: Leste (Ton), Sul (Nan), Oeste (Shaa), Norte (Pei).',
          },
          { type: 'hand', mpsz: '1234z' },
          {
            type: 'text',
            md: '**Dragões** 三元牌: Branco (Haku), Verde (Hatsu), Vermelho (Chun).',
          },
          { type: 'hand', mpsz: '567z' },
          {
            type: 'tip',
            md: 'Os nomes em japonês aparecem na mesa, mas não se preocupe com eles agora: Leste, Sul, Branco e Vermelho já bastam para jogar.',
          },
        ],
      },
      {
        id: 'nomes',
        number: '1.3',
        title: 'Nomes que você vai ouvir',
        termos: ['terminais', 'aka-dora'],
        blocks: [
          {
            type: 'text',
            md: '- **Terminais**: os 1 e 9 dos naipes.\n- **Simples**: as pedras de 2 a 8.\n- **5 vermelho** (Aka dora): um 5 especial em cada naipe, que vale bônus.',
          },
          { type: 'hand', mpsz: '19m 19p 19s', caption: 'Terminais', numbered: true },
          { type: 'hand', mpsz: '0m 0p 0s', caption: 'Os cincos vermelhos' },
          {
            type: 'tip',
            md: 'Por enquanto, jogue com o 5 vermelho como um 5 normal do naipe dele. O bônus que ele vale você vai ver na {{onde:dora}}.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'O 9 de Pin é terminal ou simples?',
        hand: '9p',
        options: [{ label: 'Terminal', correct: true }, { label: 'Simples' }],
        answer: 'Terminal. Os 1 e 9 dos naipes são terminais; de 2 a 8 são simples.',
      },
    ],
  },
  {
    id: 'mesa',
    number: 2,
    title: 'A mesa',
    cover: 'Monte sua primeira mesa.',
    pages: [
      {
        id: 'sorteio',
        number: '2.1',
        title: 'Sorteando os ventos',
        termos: ['ventos', 'oya'],
        blocks: [
          {
            type: 'text',
            md: 'Antes de tudo, cada jogador precisa de um vento. Ele define o lugar na mesa e quem começa.',
          },
          {
            type: 'text',
            md: '- Quem tira **Leste** é o **oya** (dealer). É ele quem joga os dados e faz o primeiro descarte.\n- Os outros sentam em sentido anti-horário a partir dele: Leste → Sul → Oeste → Norte.',
          },
          {
            type: 'text',
            md: '**Como sortear**\n- **Com as pedras**: vire para baixo uma pedra de cada vento, embaralhe e cada jogador pega uma.\n- **Com o app**: o Sorteador de Ventos sorteia os quatro ventos na hora, sem separar pedras.',
          },
          { type: 'appLink', tool: 'sorteador', label: 'Abrir o Sorteador de Ventos' },
        ],
      },
      {
        id: 'muro',
        number: '2.2',
        title: 'Embaralhar e montar o muro',
        blocks: [
          {
            type: 'steps',
            items: [
              'Espalhem as pedras no centro da mesa e embaralhem bem, todos juntos, do jeito que elas caírem. Depois virem para baixo as que ficaram com a face para cima e embaralhem de leve, para nenhuma virar de novo.',
              {
                md: 'Cada jogador monta à sua frente uma fileira de **17 pedras de comprimento e 2 de altura** (34 pedras).',
                image: 'muroFileira',
                alt: 'Fileira de 17 colunas de pedras viradas para baixo, cada coluna com 2 pedras empilhadas.',
              },
              {
                md: 'Cada um empurra o seu muro um pouco para o meio da mesa, na sua frente. Os quatro ficam em volta do centro, mas ==não precisam se encostar== nem formar um quadrado perfeito.',
                image: 'muroQuadrado',
                alt: 'Vista de cima: quatro muros em volta do centro da mesa, cada um na frente de um jogador, com um vão em cada canto. Leste embaixo, Sul à direita, Oeste em cima e Norte à esquerda. No meio, o centerpiece com o Leste (東) e, em cada lado, os números dos dados que abrem o muro daquele jogador: Leste 1, 5 e 9; Sul 2, 6 e 10; Oeste 3, 7 e 11; Norte 4, 8 e 12.',
              },
            ],
          },
        ],
      },
      {
        id: 'abertura',
        number: '2.3',
        title: 'Abrir o muro',
        termos: ['oya'],
        blocks: [
          {
            type: 'text',
            md: 'O oya ==sempre joga os dados==. A soma diz onde o muro abre: em qual muro e depois de quantas colunas. É ali que se separa o muro morto.',
          },
          {
            type: 'text',
            md: 'Com um centerpiece (ou numa mesa automática), não precisa decorar a conta: ele mostra, para cada número, qual muro abre.',
          },
          {
            type: 'tip',
            md: 'Sem centerpiece, a conta está na próxima página.',
          },
        ],
      },
      {
        id: 'abrindo-muro',
        number: '2.4',
        title: 'Contando com os dados',
        termos: ['oya'],
        blocks: [
          {
            type: 'text',
            md: 'Sem centerpiece, quem joga conta onde o muro abre a partir da soma dos dois dados.',
          },
          { type: 'heading', text: '1. Qual muro abre' },
          {
            type: 'text',
            md: 'Conte os jogadores a partir do oya, em ==sentido anti-horário==: o oya é o 1, quem está à direita dele é o 2, o da frente é o 3 e o da esquerda é o 4. No 5 a contagem volta ao oya.',
          },
          {
            type: 'text',
            md: '- **5 ou 9**: o muro do oya.\n- **2, 6 ou 10**: o muro de quem está à direita dele.\n- **3, 7 ou 11**: o muro da frente.\n- **4, 8 ou 12**: o muro de quem está à esquerda.',
          },
          {
            type: 'image',
            image: 'mesaDados',
            alt: 'Mesa vista de cima com os quatro muros. Ao lado de cada vento, os números da contagem: Leste 1, 5 e 9; Sul 2, 6 e 10; Oeste 3, 7 e 11; Norte 4, 8 e 12. Os dados no meio somam 5, e o Leste, o próprio oya, está destacado.',
            caption: 'Exemplo: 2 + 3 = 5. A contagem dá a volta e para no próprio oya.',
          },
          { type: 'heading', text: '2. Onde ele abre' },
          {
            type: 'text',
            md: 'Quem montou o muro sorteado conta, a partir da ==ponta direita== dele (olhando de onde está sentado), o mesmo número de colunas que deu nos dados. O muro se separa ali: essa é a ==abertura==.',
          },
          {
            type: 'image',
            image: 'mesaAbertura',
            alt: 'Mesa vista de cima. No muro do Leste, as colunas estão numeradas de 1 a 5, em vermelho, a partir da ponta direita de quem está sentado no Leste, e o muro está cortado depois da 5ª.',
            caption: 'Com 5, o Leste conta 5 colunas a partir da sua direita e abre o muro.',
          },
        ],
      },
      {
        id: 'muro-morto',
        number: '2.5',
        title: 'O muro morto',
        termos: ['dora'],
        blocks: [
          {
            type: 'text',
            md: 'As ==7 colunas logo à direita da abertura== (14 pedras) formam o **muro morto**. Elas não são compradas normalmente.',
          },
          {
            type: 'image',
            image: 'muroMorto',
            alt: 'Muro aberto visto de frente: à esquerda o muro de onde se compra, depois a abertura e, à direita, as 7 colunas do muro morto. Na 3ª coluna a partir da abertura, a pedra de cima está virada para cima: é o indicador de dora.',
            caption: 'De frente para o muro: compras à esquerda da abertura, muro morto à direita.',
          },
          { type: 'heading', text: 'Se os dados derem menos de 7' },
          {
            type: 'text',
            md: 'À direita da abertura sobram menos de 7 colunas para o muro morto. ==Complete o muro morto com o muro vizinho==, à direita. No exemplo dos dados 5, ficam 5 colunas no muro do Leste e as outras 2 vêm do muro do Sul.',
          },
          {
            type: 'image',
            image: 'muroMortoCurto',
            alt: 'Mesa vista de cima com os dados somando 5. O muro do Leste está cortado depois da 5ª coluna; o muro morto, com hachura e contorno vermelho, ocupa essas 5 colunas e continua nas 2 primeiras do muro do Sul, dobrando a esquina. O indicador fica na 3ª coluna, ainda no Leste.',
            caption: 'Dados 5: 5 colunas no Leste + 2 no Sul.',
          },
          {
            type: 'tip',
            md: 'Com 7 ou mais, o muro morto cabe inteiro no muro sorteado. De 2 a 6, ele sempre dobra a esquina.',
          },
          { type: 'heading', text: 'Para que serve' },
          {
            type: 'text',
            md: 'São 136 pedras, 4 de cada. Se todas entrassem em jogo, daria para contar o que já saiu e saber exatamente o que falta. As 14 pedras do muro morto ficam fora das compras, então ==ninguém sabe ao certo== quais pedras ainda vão aparecer.',
          },
          { type: 'heading', text: 'O indicador de dora' },
          {
            type: 'text',
            md: 'Conte ==3 colunas a partir da abertura== e vire para cima a pedra de cima da 3ª. Ela é o **indicador de dora**, que você vai conhecer na {{onde:dora}}.',
          },
          {
            type: 'tip',
            md: 'Algumas pedras do muro morto têm outros usos, que você vai ver na {{onde:kan}}.',
          },
        ],
      },
      {
        id: 'compra',
        number: '2.6',
        title: 'Comprar as pedras',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                md: 'A compra começa ==à esquerda da abertura== (para quem montou aquele muro) e segue no sentido da seta, muro após muro. O muro morto fica de fora.',
                image: 'mesaCompra',
                alt: 'Mesa vista de cima. O muro do Leste está aberto; do lado do canto fica o muro morto, com contorno vermelho, dobrando para o muro do Sul. Do outro lado da abertura sai uma seta vermelha que segue pelo muro do Leste e depois pelo do Norte, no sentido horário.',
              },
              'O oya pega primeiro, depois quem está à direita dele, e assim por diante. Cada um pega **4 pedras por vez** (2 colunas), até todos terem 12.',
              'Cada jogador pega mais **1 pedra** e fica com 13.',
              'O oya fica com a **14ª pedra** e abre o jogo com o primeiro descarte.',
            ],
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'Quem joga os dados e faz o primeiro descarte?',
        options: [
          { label: 'Quem está à direita do Leste' },
          { label: 'O oya, quem tirou Leste', correct: true },
          { label: 'Quem tirou Norte' },
        ],
        answer: 'O oya, quem tirou Leste. Ele joga os dados e abre o jogo com o primeiro descarte.',
      },
      {
        type: 'quiz',
        question: 'Para que serve o muro morto?',
        options: [
          { label: 'Guardar as pedras descartadas' },
          { label: 'Separar as pedras de quem perdeu a mão' },
          {
            label: 'Deixar pedras fora de jogo para ninguém saber ao certo quais vão aparecer',
            correct: true,
          },
        ],
        answer:
          'Deixar pedras fora de jogo. Sem elas nas compras, ninguém consegue contar exatamente o que ainda falta sair.',
      },
      {
        type: 'quiz',
        question: 'Com quantas pedras o oya começa?',
        options: [{ label: '13' }, { label: '14', correct: true }, { label: '12' }],
        answer: '14. Os outros ficam com 13, e o oya abre o jogo descartando a 14ª.',
      },
      {
        type: 'quiz',
        question:
          'Os dados deram 4 (1 + 3). Em qual muro está a abertura, e onde fica o muro morto?',
        options: [
          { label: 'No Norte, e o muro morto cabe inteiro nele' },
          { label: 'No Norte: 4 colunas nele + 3 no muro do Leste', correct: true },
          { label: 'No Oeste: 4 colunas nele + 3 no Sul' },
        ],
        answer:
          'Contando a partir do oya em sentido anti-horário, o 4 cai em quem está à esquerda dele: o Norte. Ele conta 4 colunas a partir da sua ponta direita e abre. Só cabem 4 colunas do muro morto ali; as outras 3 vêm do muro vizinho à direita do Norte, que é o do Leste.',
      },
    ],
  },
  {
    id: 'mao',
    number: 3,
    title: 'Mão completa',
    cover: 'Descubra o que você está tentando montar.',
    pages: [
      {
        id: 'formula',
        number: '3.1',
        title: 'A fórmula: 4 grupos + 1 par',
        blocks: [
          {
            type: 'text',
            md: 'Para vencer você precisa de **14 pedras**, organizadas em quatro grupos de três e um par.',
          },
          { type: 'hand', mpsz: '123m 456p 789s 555z 22s' },
        ],
      },
      {
        id: 'grupos',
        number: '3.2',
        title: 'Os tipos de grupo',
        termos: ['sequencia', 'trinca', 'par'],
        blocks: [
          { type: 'text', md: '**Sequência**: três números seguidos do mesmo naipe.' },
          { type: 'hand', mpsz: '345p' },
          { type: 'text', md: '**Trinca**: três pedras iguais.' },
          { type: 'hand', mpsz: '777s 555z' },
          { type: 'text', md: '**Par**: duas pedras iguais.' },
          { type: 'hand', mpsz: '22s' },
          {
            type: 'tip',
            md: 'Sequência não dá a volta (8-9-1 não vale) e honras (ventos e dragões) nunca formam sequência.',
          },
        ],
      },
      {
        id: 'tenpai',
        number: '3.3',
        title: 'Tenpai: falta uma',
        termos: ['tenpai'],
        blocks: [
          {
            type: 'text',
            md: 'Você joga com 13 pedras e completa a 14ª ao vencer. Quando só falta uma, sua mão está em **tenpai**. As pedras que servem são as suas **esperas**.',
          },
          {
            type: 'text',
            md: 'Separe a mão nos grupos que já estão prontos. O que ==sobra incompleto== é onde está a espera.',
          },
          // Mãos inteiras de 13 pedras, com cada grupo rotulado, e a seta para as esperas.
          { type: 'heading', text: 'Dois lados' },
          {
            type: 'hand',
            mpsz: '234m 567p 789s 11z 45m',
            labels: ['Sequência', 'Sequência', 'Sequência', 'Par', 'Espera'],
            after: '36m',
            afterLabel: 'espera',
            caption: 'O 4-5 fecha com o 3 ou o 6: a melhor espera, até 8 pedras.',
          },
          { type: 'heading', text: 'No meio' },
          {
            type: 'hand',
            mpsz: '123p 456s 777m 99s 46m',
            labels: ['Sequência', 'Sequência', 'Trinca', 'Par', 'Espera'],
            after: '5m',
            afterLabel: 'espera',
            caption: 'O 4-6 só fecha com o 5 do meio.',
          },
          { type: 'heading', text: 'Na ponta' },
          {
            type: 'hand',
            mpsz: '345m 678p 222s 55z 12m',
            labels: ['Sequência', 'Sequência', 'Trinca', 'Par', 'Espera'],
            after: '3m',
            afterLabel: 'espera',
            caption: 'O 1-2 só fecha com o 3: do outro lado não há 0.',
          },
          { type: 'heading', text: 'Dois pares' },
          {
            type: 'hand',
            mpsz: '234m 567p 678s 22p 88s',
            labels: ['Sequência', 'Sequência', 'Sequência', 'Espera', 'Espera'],
            after: '2p8s',
            afterLabel: 'espera',
            caption: 'Um dos pares vira trinca e o outro fica de par.',
          },
          { type: 'heading', text: 'Só o par' },
          {
            type: 'hand',
            mpsz: '123m 456m 789p 111z 5s',
            labels: ['Sequência', 'Sequência', 'Sequência', 'Trinca', 'Espera'],
            after: '5s',
            afterLabel: 'espera',
            caption: 'Os 4 grupos estão prontos: falta o par do 5 de Sou.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'Esta mão está em tenpai?',
        hand: '234m 567p 11s 345s 78p',
        options: SIM_NAO(true),
        answer: 'Sim. Ela espera o 6 ou o 9 de Pin para completar o 7-8.',
      },
    ],
  },
  {
    id: 'turno',
    number: 4,
    title: 'O turno',
    cover: 'Compre, descarte e chame pedras.',
    pages: [
      {
        id: 'comprar-descartar',
        number: '4.1',
        title: 'Comprar e descartar',
        blocks: [
          {
            type: 'text',
            md: 'Na sua vez você compra uma pedra do muro e descarta outra, virada para cima. Os descartes ficam em fileiras de seis à sua frente, entre o seu muro e o centro da mesa, à vista de todos. A vez passa para quem está à sua direita.',
          },
          {
            type: 'image',
            image: 'mesaDescartes',
            alt: 'Mesa vista de cima: na frente de cada muro, uma fileira de 6 descartes e o começo da segunda. No meio, o centro da mesa com o vento da rodada (東). Um dos descartes do Sul está de lado, como no Riichi.',
            caption: 'Cada um descarta à sua frente, em fileiras de 6. No meio, o centro da mesa.',
          },
          {
            type: 'text',
            md: 'Com um descarte de outro jogador você também pode formar um grupo na hora: é a **chamada**, como o pon e o chi. O grupo chamado fica aberto na mesa, à sua direita.',
          },
          {
            type: 'tip',
            md: 'Na mesa, a pedra pegada de outro jogador fica **de lado**, apontando para quem descartou. Assim todos sabem de onde ela veio.',
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
            md: 'Alguém descartou uma pedra e você tem duas iguais na mão. Diga "pon", pegue a pedra e mostre a trinca na mesa.',
          },
          {
            type: 'text',
            md: 'Vale com o descarte de **qualquer jogador**. O jogo continua a partir de você: descarte uma pedra.',
          },
          {
            type: 'melds',
            items: [
              { mpsz: '777s', deLado: 0, caption: 'Da esquerda' },
              { mpsz: '777s', deLado: 1, caption: 'Da frente' },
              { mpsz: '777s', deLado: 2, caption: 'Da direita' },
            ],
          },
          {
            type: 'text',
            md: 'Depois do pon, sua mão fica **aberta**. Mão sem nenhum descarte de outro jogador é **fechada**.',
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
            md: 'Você pode completar uma sequência com o descarte, mas só de quem está **à sua esquerda**. Diga "chi" e mostre a sequência na mesa.',
          },
          {
            type: 'melds',
            items: [
              {
                mpsz: '435p',
                deLado: 0,
                caption: 'Pegou o 4 de Pin: ele fica de lado, à esquerda',
              },
            ],
          },
          { type: 'text', md: 'Depois do chi, sua mão fica **aberta**.' },
        ],
      },
      {
        id: 'prioridade',
        number: '4.4',
        title: 'Quem tem prioridade',
        blocks: [
          {
            type: 'text',
            md: 'Se mais de uma pessoa quer o mesmo descarte: **ron > pon > chi**.',
          },
          {
            type: 'text',
            md: '**Ron** é vencer com o descarte de alguém. Você vai ver na próxima página.',
          },
        ],
      },
      {
        id: 'tsumo-ron',
        number: '4.5',
        title: 'Tsumo e ron',
        termos: ['tsumo', 'ron'],
        blocks: [
          {
            type: 'text',
            md: '- **Tsumo**: você comprou a pedra que completou a mão. Todos os outros jogadores pagam.\n- **Ron**: a pedra veio do descarte de outro jogador. Quem descartou paga sozinho.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question:
          'O jogador à sua frente descartou o 6 de Pin e você tem o 5 e o 7 de Pin. Pode chamar chi?',
        hand: '57p',
        options: SIM_NAO(false),
        answer: 'Não. Chi só vale com o descarte de quem está à sua esquerda.',
      },
    ],
  },
  {
    id: 'yakus',
    number: 5,
    title: 'Mão válida',
    cover: 'Completa não basta: para vencer, a mão precisa de um yaku.',
    pages: [
      {
        id: 'sem-yaku',
        number: '5.1',
        title: 'Sem yaku, sem vitória',
        termos: ['yaku'],
        blocks: [
          {
            type: 'text',
            md: 'Ter 4 grupos e 1 par não basta. A mão precisa de pelo menos um **yaku**, uma condição de pontuação.',
          },
          { type: 'tip', md: 'Vencer sem yaku é chombo, uma falta grave.' },
        ],
      },
      {
        id: 'yakus-iniciantes',
        number: '5.2',
        title: 'Os 5 yakus para começar',
        termos: [
          'riichi',
          'yaku:menzen-tsumo',
          'yaku:tanyao',
          'yaku:yakuhai',
          'yaku:pinfu',
          'ryanmen',
        ],
        blocks: [
          {
            type: 'text',
            md: 'Com estes cinco você já vence a maioria das mãos. Toque em cada um para ver como funciona.',
          },
          {
            type: 'cards',
            items: [
              {
                id: 'riichi',
                title: 'Riichi',
                badge: 'só fechada',
                blocks: [
                  {
                    type: 'text',
                    md: 'O yaku mais comum. Com a mão **fechada** e em tenpai, você diz "Riichi" e descarta a pedra de lado.',
                  },
                  {
                    type: 'text',
                    md: 'Sozinho já torna sua mão válida. Depois de declarar, você não pode mais alterar a mão.',
                  },
                ],
              },
              {
                id: 'menzen-tsumo',
                title: 'Menzen Tsumo',
                badge: 'só fechada',
                blocks: [
                  {
                    type: 'text',
                    md: 'Vencer por tsumo (com a pedra que você comprou) com a mão **fechada**.',
                  },
                ],
              },
              {
                id: 'tanyao',
                title: "Tan'yao",
                badge: 'aberta ou fechada',
                blocks: [
                  {
                    type: 'text',
                    md: 'Apenas pedras de 2 a 8, sem terminais e sem honras.',
                  },
                  { type: 'hand', mpsz: '234m 567m 345p 678s 55s' },
                  {
                    type: 'tip',
                    md: "Algumas mesas só aceitam Tan'yao com a mão fechada. Combine antes de jogar.",
                  },
                ],
              },
              {
                id: 'yakuhai',
                title: 'Yakuhai',
                badge: 'aberta ou fechada',
                blocks: [
                  { type: 'text', md: 'Uma trinca de **dragão** ou de **Leste**.' },
                  { type: 'hand', mpsz: '123m 456p 789s 555z 22s' },
                  {
                    type: 'tip',
                    md: 'Outros ventos também podem valer, conforme o seu lugar na mesa. Você vai ver isso em Ventos de valor, na {{onde:regras}}.',
                  },
                ],
              },
              {
                id: 'pinfu',
                title: 'Pinfu',
                badge: 'só fechada',
                blocks: [
                  {
                    type: 'text',
                    md: 'Só sequências, um par que não seja de dragão nem de Leste, e espera de dois lados (ryanmen).',
                  },
                  {
                    type: 'hand',
                    mpsz: '123m 456p 789p 23s 55m',
                    caption: 'Mão em tenpai',
                    after: '1s4s',
                    afterLabel: 'espera',
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
        question: 'Mão aberta com um chi, sem trinca de honra. Ela tem yaku?',
        hand: '123m 456p 789s 678p 11m',
        options: SIM_NAO(false),
        answer:
          "Não. Tem terminais (sem Tan'yao), está aberta (sem Riichi, Menzen Tsumo e Pinfu) e não tem trinca de valor (sem Yakuhai).",
      },
    ],
  },
  {
    id: 'pontos',
    number: 7,
    title: 'Pontos',
    cover: 'Quanto vale a sua mão e como pagar.',
    pages: [
      {
        id: 'palitos',
        number: '7.1',
        title: 'Os palitos',
        termos: ['riichi', 'honba'],
        blocks: [
          {
            type: 'text',
            md: 'Os pontos são contados com palitos. Cada jogador começa com **25.000**:',
          },
          { type: 'sticks' },
          {
            type: 'text',
            md: 'O palito de 1.000 também é a aposta do Riichi. Os de 100 marcam as mãos repetidas.',
          },
        ],
      },
      {
        id: 'han-fu',
        number: '7.2',
        title: 'Han e fu',
        termos: ['han', 'fu'],
        blocks: [
          {
            type: 'text',
            md: 'O valor vem de **han** (yakus e doras) e **fu** (forma da mão). A calculadora faz a conta.',
          },
          { type: 'hanFuTutorial' },
          {
            type: 'table',
            headers: ['Yaku', 'Han'],
            rows: [
              ['Riichi', hanYaku('riichi')],
              ['Menzen Tsumo', hanYaku('menzen-tsumo')],
              ["Tan'yao", hanYaku('tanyao')],
              ['Yakuhai', `${hanYaku('yakuhai')} por trinca`],
              ['Pinfu', hanYaku('pinfu')],
            ],
          },
          {
            type: 'text',
            md: "Os yakus se somam. Riichi + Tan'yao + Pinfu + Menzen Tsumo = **4 han**.",
          },
        ],
      },
      {
        id: 'patamares',
        number: '7.3',
        title: 'Os patamares',
        termos: ['patamares', 'mangan', 'oya', 'ko'],
        blocks: [
          {
            type: 'text',
            md: 'A partir de 5 han a mão vira um patamar, com valor fixo. O **ko** é quem não é o oya.',
          },
          {
            type: 'table',
            headers: ['Patamar', 'Han', 'Ko', 'Oya'],
            rows: [
              linhaPatamar('Mangan', '5', BASE_PATAMAR.mangan),
              linhaPatamar('Haneman', '6–7', BASE_PATAMAR.haneman),
              linhaPatamar('Baiman', '8–10', BASE_PATAMAR.baiman),
              linhaPatamar('Sanbaiman', '11–12', BASE_PATAMAR.sanbaiman),
              linhaPatamar('Yakuman', '13+', BASE_PATAMAR.yakuman),
            ],
          },
          { type: 'text', md: 'O oya recebe **1,5×** os pontos ao vencer.' },
          { type: 'tip', md: 'Com 3 ou 4 han, o fu pode levar a mão ao Mangan.' },
        ],
      },
      {
        id: 'quem-paga',
        number: '7.4',
        title: 'Quem paga',
        termos: ['ron', 'tsumo'],
        blocks: [
          {
            type: 'text',
            md: '- **Ron**: quem descartou paga tudo.\n- **Tsumo**: todos pagam. Se quem venceu não é o oya, o oya paga a metade e os outros dois dividem o resto.',
          },
          {
            type: 'text',
            md: 'Quem vencer também leva as apostas de Riichi (1.000 cada) que estiverem na mesa.',
          },
        ],
      },
      {
        id: 'riichi-aposta',
        number: '7.5',
        title: 'A aposta do Riichi',
        termos: ['riichi'],
        blocks: [
          {
            type: 'text',
            md: 'Contando pontos, quem declara Riichi aposta um palito de **1.000** no centro da mesa.',
          },
          {
            type: 'text',
            md: '- Para declarar, você precisa ter pelo menos 1.000 pontos, e ainda precisa haver 4 pedras ou mais para comprar no muro.\n- Quem vencer a mão leva as apostas da mesa.\n- Se ninguém vencer, as apostas ficam na mesa para a próxima mão.',
          },
          {
            type: 'tip',
            md: 'O Riichi também revela a Ura-dora para quem vence, que você vai ver na {{onde:dora}}.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'Um ko vence um Mangan por tsumo. Quanto o oya paga?',
        options: [
          { label: pontos(BASE_PATAMAR.mangan) },
          { label: pontos(BASE_PATAMAR.mangan * 2), correct: true },
          { label: pontos(BASE_PATAMAR.mangan * 4) },
        ],
        answer: `${pontos(BASE_PATAMAR.mangan * 2)}, a metade. Os outros dois pagam ${pontos(BASE_PATAMAR.mangan)} cada.`,
      },
    ],
  },
  {
    id: 'dora',
    number: 8,
    title: 'Dora',
    cover: 'Pedras bônus que deixam a mão mais cara.',
    pages: [
      {
        id: 'indicador',
        number: '8.1',
        title: 'O indicador e a dora',
        termos: ['dora'],
        blocks: [
          {
            type: 'text',
            md: 'Lembra da pedra virada no muro morto? Ela é o **indicador**. O indicador não é a dora: a **dora** é a pedra seguinte a ele. Cada dora na mão vale 1 han.',
          },
          {
            type: 'image',
            image: 'muroMorto',
            alt: 'Muro aberto visto de frente: compras à esquerda, a abertura e o muro morto à direita, com o indicador de dora virado na 3ª coluna a partir da abertura.',
            caption: 'O indicador fica virado no muro morto.',
          },
          {
            type: 'hand',
            mpsz: '3m',
            caption: 'Indicador 3 de Man',
            after: '4m',
            afterLabel: 'dora',
          },
          { type: 'tip', md: 'Dora não é yaku. Sem yaku, ela não ajuda a vencer.' },
        ],
      },
      {
        id: 'ordem-dora',
        number: '8.2',
        title: 'A ordem',
        termos: ['dora'],
        blocks: [
          {
            type: 'text',
            md: 'Cada pedra indica a seguinte. No fim de cada sequência, a contagem volta ao começo.',
          },
          { type: 'doraCycles' },
        ],
      },
      {
        id: 'aka-dora',
        number: '8.3',
        title: '5 vermelho',
        termos: ['aka-dora'],
        blocks: [
          {
            type: 'text',
            md: 'Cada 5 vermelho (Aka dora) vale 1 han a mais e funciona como um 5 normal na mão.',
          },
          { type: 'hand', mpsz: '0m 0p 0s' },
          {
            type: 'tip',
            md: 'Nem toda mesa joga com os cincos vermelhos. Combine antes de jogar.',
          },
        ],
      },
      {
        id: 'ura-dora',
        number: '8.4',
        title: 'Ura-dora',
        termos: ['ura-dora', 'riichi'],
        blocks: [
          {
            type: 'text',
            md: 'Quem vence depois de declarar **Riichi** revela a pedra que fica embaixo de cada indicador de dora. Essa é a **Ura-dora**: funciona como mais um indicador, só para quem venceu.',
          },
          { type: 'tip', md: 'Sem Riichi não tem Ura-dora. É mais um motivo para declarar.' },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'O indicador é o Dragão vermelho. Qual é a dora?',
        hand: '7z',
        options: [
          { label: 'Branco', mpsz: '5z', correct: true },
          { label: 'Verde', mpsz: '6z' },
          { label: 'Vermelho', mpsz: '7z' },
        ],
        answer: 'O Dragão branco: Vermelho → Branco.',
      },
    ],
  },
  {
    id: 'kan',
    number: 9,
    title: 'Kan',
    cover: 'Quatro pedras iguais, uma pedra a mais e mais uma dora.',
    pages: [
      {
        id: 'kan',
        number: '9.1',
        title: 'Os três kans',
        termos: ['kan'],
        blocks: [
          { type: 'text', md: 'Quatro pedras iguais. Há três jeitos de fazer kan:' },
          {
            type: 'text',
            md: '- **Kan aberto**: você tem três iguais e alguém descarta a quarta. Vale com qualquer jogador, como o pon.\n- **Kan fechado**: as quatro estão na sua mão. Mostre na mesa com as duas pontas viradas para baixo.\n- **Kan adicionado**: você já tem um pon e compra a quarta. Ela fica deitada em cima da pedra de lado.',
          },
          {
            type: 'melds',
            items: [
              { mpsz: '8888p', deLado: 1, caption: 'Kan aberto (da frente)' },
              { mpsz: '1111m', viradas: [0, 3], caption: 'Kan fechado' },
              { mpsz: '7777s', deLado: 0, empilhada: true, caption: 'Kan adicionado' },
            ],
          },
          {
            type: 'text',
            md: 'Kan aberto e kan adicionado deixam a mão **aberta**. O kan fechado, feito só com pedras da sua mão, mantém a mão **fechada**.',
          },
          { type: 'tip', md: 'O kan tem a mesma prioridade do pon.' },
          { type: 'heading', text: 'Kan no Riichi' },
          {
            type: 'text',
            md: 'Depois de declarar Riichi, você ainda pode fazer **kan fechado**: se já tinha as outras três na mão e ==você mesmo comprou a quarta== do muro. Só não vale se o kan mudar a sua espera.',
          },
          {
            type: 'tip',
            md: 'Com o descarte de outro jogador, **não vale**: em Riichi não dá para fazer kan aberto nem pon, porque a mão não pode mais mudar.',
          },
          { type: 'heading', text: 'O perigo do kan' },
          {
            type: 'text',
            md: 'Todo kan vira ==mais um indicador de dora== (o kan dora), e ele vale para **todos** na mesa, não só para quem fez o kan. Quem vencer em Riichi ainda olha a Ura-dora embaixo dele: mais uma chance de dora.',
          },
          {
            type: 'tip',
            md: 'Por isso, pense antes de fazer kan: a dora nova pode deixar mais cara a mão de quem vai vencer de você.',
          },
        ],
      },
      {
        id: 'kan-dora',
        number: '9.2',
        title: 'Reposição e kan dora',
        termos: ['kan-dora'],
        blocks: [
          {
            type: 'text',
            md: 'Com quatro pedras num grupo, falta uma na mão. Depois de qualquer kan, você compra uma pedra de **reposição** no muro morto e um novo indicador de dora é virado. Então descarta.',
          },
          {
            type: 'image',
            image: 'muroMortoKan',
            alt: 'Muro morto visto de frente, com as 7 colunas numeradas a partir da abertura. A pedra de cima da coluna 1 está na mesa, sozinha ao lado: é a reposição do kan. Na coluna 3 está virado o indicador de dora e, na coluna 4, o indicador do kan dora.',
            caption: 'Depois de um kan: a reposição sai da coluna 1 e o kan dora vira na 4.',
          },
          {
            type: 'text',
            md: 'As colunas 1 e 2, junto da abertura, guardam as **reposições do kan**: quem faz kan compra primeiro a pedra de cima da coluna 1. Muitas mesas já descem essa pedra para a mesa, sozinha ao lado, para ninguém derrubar o muro ao pegar.',
          },
          {
            type: 'text',
            md: 'Cada kan vira mais um indicador, o **kan dora**: a pedra de cima da coluna seguinte (a 4, depois a 5…). Ele funciona igual ao primeiro indicador.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'Fiz kan fechado. Minha mão continua fechada?',
        options: SIM_NAO(true),
        answer:
          'Sim. O kan fechado é feito só com pedras da sua mão, sem nenhum descarte de outro jogador.',
      },
    ],
  },
  {
    id: 'fim-partida',
    number: 6,
    title: 'Fim da partida',
    cover: 'Empate, o próximo oya e quando a partida acaba.',
    pages: [
      {
        id: 'empate',
        number: '6.1',
        title: 'Empate',
        termos: ['empate', 'tenpai'],
        blocks: [
          {
            type: 'text',
            md: 'A mão também pode acabar **sem vencedor**. Quando ==só sobra o muro morto== e ninguém completou a mão, ela termina **empatada**.',
          },
          {
            type: 'text',
            md: 'Cada um diz se está em tenpai. Quem está mostra a mão; quem não está pode deixar a mão virada para baixo.',
          },
          {
            type: 'tip',
            md: 'Contando pontos, quem não está em tenpai paga quem está. Você vai ver isso em Honba e empate, na {{onde:regras}}.',
          },
        ],
      },
      {
        id: 'proxima-mao',
        number: '6.2',
        title: 'A próxima mão',
        termos: ['oya', 'renchan'],
        blocks: [
          {
            type: 'text',
            md: '- Se o oya venceu, ou estava em tenpai num empate, ele **continua oya** e a mão se repete (renchan).\n- Senão, o Leste passa para o próximo jogador.',
          },
        ],
      },
      {
        id: 'fim',
        number: '6.3',
        title: 'Tonpuusen',
        blocks: [
          {
            type: 'text',
            md: 'Para começar, jogue um **tonpuusen**: cada jogador é oya pelo menos uma vez. Quando o último oya passa o Leste adiante, a partida acaba.',
          },
          {
            type: 'text',
            md: 'Nas primeiras partidas, sem contar pontos, vence quem ganhou mais mãos. Quando vocês passarem a contar, vence quem tiver mais pontos, e a partida também acaba se alguém ficar com pontos negativos.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'O oya venceu a mão. Quem é o oya da próxima?',
        options: [
          { label: 'Ele mesmo', correct: true },
          { label: 'Quem está à direita dele' },
          { label: 'Quem venceu a mão anterior a essa' },
        ],
        answer: 'Ele mesmo. Quando o oya vence, ele continua oya e a mão se repete.',
      },
      {
        type: 'quiz',
        question:
          'O muro acabou e ninguém venceu. O oya não estava em tenpai. Quem é o oya da próxima?',
        options: [
          { label: 'Ele mesmo' },
          { label: 'Quem está à direita dele', correct: true },
          { label: 'Quem estava em tenpai' },
        ],
        answer:
          'Quem está à direita dele. No empate, o oya só continua se estava em tenpai; senão, o Leste passa adiante.',
      },
    ],
  },
]

/** Um assunto da Parte 3 (Aprofundando); vira uma página do módulo da sua seção. */
interface TopicoRegras {
  id: string
  section: 'regras' | 'estrategia'
  title: string
  termos?: string[]
  blocks: TutorialBlock[]
}

const topicosRegras: TopicoRegras[] = [
  {
    id: 'ventos-de-valor',
    section: 'regras',
    title: 'Ventos de valor',
    termos: ['ventos', 'yaku:yakuhai'],
    blocks: [
      {
        type: 'text',
        md: 'Cada jogador tem o **vento do seu assento** (Leste, Sul, Oeste ou Norte). A mesa toda tem o **vento da rodada**: Leste no tonpuusen e na primeira metade do hanchan, Sul na segunda.',
      },
      {
        type: 'text',
        md: '- Trinca do vento da rodada vale 1 han para todos.\n- Trinca do vento do seu assento vale 1 han só para você.\n- Se o vento da rodada for também o seu vento, a trinca vale 2 han.\n- Trinca de um vento que não é de ninguém não vale yaku.',
      },
      {
        type: 'tip',
        md: 'Vale também com a mão **aberta**: um pon de vento de valor ou de dragão já dá yaku à mão.',
      },
      {
        type: 'tip',
        md: 'No Pinfu, o par não pode ser de dragão, do vento da rodada nem do vento do seu assento.',
      },
    ],
  },
  {
    id: 'furiten',
    section: 'regras',
    title: 'Furiten',
    termos: ['furiten'],
    blocks: [
      {
        type: 'text',
        md: 'Em furiten você não pode vencer por ron, só por tsumo. Declarar ron em furiten é chombo.',
      },
      {
        type: 'text',
        md: '- **Pelos descartes**: alguma pedra que completaria sua mão está entre os seus descartes.\n- **Temporário**: você deixou passar uma pedra que completaria sua mão, sem declarar ron. Dura até o seu próximo descarte.\n- **De Riichi**: depois do Riichi, você deixou passar uma pedra que completaria sua mão. Dura até o fim da rodada.',
      },
    ],
  },
  {
    id: 'lista-yakus',
    section: 'regras',
    title: 'Lista de yakus',
    termos: ['yaku', 'yakuman'],
    blocks: [
      {
        type: 'text',
        md: 'Todos os yakus, com o han de cada um com a mão fechada e aberta. **—** quer dizer que só vale com a mão fechada, e **Y** é yakuman. Toque num yaku para ver o exemplo.',
      },
      ...grupoYakus('Sequência', [
        ['pinfu', 'Só sequências, par sem valor e espera de dois lados'],
        ['iipeikou', 'Duas sequências iguais no mesmo naipe'],
        ['ryanpeikou', 'Duas vezes duas sequências iguais'],
        ['sanshoku-doujun', 'A mesma sequência nos três naipes'],
        ['ittsuu', '1-2-3, 4-5-6 e 7-8-9 do mesmo naipe'],
      ]),
      ...grupoYakus('Trincas', [
        ['toitoi', 'Quatro trincas e um par'],
        ['sanankou', 'Três trincas formadas sem chamar'],
        ['sanshoku-doukou', 'A mesma trinca nos três naipes'],
        ['sankantsu', 'Três kans'],
        ['chiitoitsu', 'Sete pares diferentes'],
      ]),
      ...grupoYakus('Terminais e honras', [
        ['tanyao', 'Só pedras de 2 a 8'],
        ['yakuhai', 'Trinca de dragão ou de vento de valor'],
        ['shousangen', 'Duas trincas de dragão e o par do terceiro'],
        ['chanta', 'Terminal ou honra em todos os grupos e no par'],
        ['junchan', 'Terminal em todos os grupos e no par, sem honras'],
        ['honroutou', 'Só terminais e honras'],
      ]),
      ...grupoYakus('Naipe', [
        ['honitsu', 'Um naipe só, com honras'],
        ['chinitsu', 'Um naipe só, sem honras'],
      ]),
      ...grupoYakus('Outros', [
        ['riichi', 'Declarar tenpai com a mão fechada'],
        ['double-riichi', 'Riichi já no primeiro descarte'],
        ['ippatsu', 'Vencer até uma volta depois do Riichi'],
        ['menzen-tsumo', 'Tsumo com a mão fechada'],
        ['haitei', 'Tsumo com a última pedra do muro'],
        ['houtei', 'Ron no último descarte'],
        ['rinshan', 'Vencer com a reposição do kan'],
        ['chankan', 'Ron na pedra que outro adiciona ao pon'],
        ['renhou', 'Ron antes da sua primeira compra'],
      ]),
      ...grupoYakus('Yakuman', [
        ['kokushi', 'Um de cada terminal e honra, e um repetido'],
        ['suuankou', 'Quatro trincas formadas sem chamar'],
        ['daisangen', 'Trincas dos três dragões'],
        ['shousuushii', 'Três trincas de vento e o par do quarto'],
        ['daisuushii', 'Trincas dos quatro ventos'],
        ['tsuuiisou', 'Só honras'],
        ['chinroutou', 'Só terminais'],
        ['ryuuiisou', 'Só pedras verdes'],
        ['chuuren', '1-1-1-2-3-4-5-6-7-8-9-9-9 de um naipe, mais uma'],
        ['suukantsu', 'Quatro kans'],
        ['tenhou', 'O oya vence com as pedras que recebeu'],
        ['chiihou', 'Vencer por tsumo na primeira compra'],
      ]),
      { type: 'tip', md: KAZOE_NOTE },
    ],
  },
  {
    id: 'chombo',
    section: 'regras',
    title: 'Chombo',
    termos: ['chombo'],
    blocks: [
      {
        type: 'text',
        md: 'Falta grave que anula a mão, como declarar vitória sem uma mão válida ou sem yaku, dar ron em furiten, ou derrubar e revelar a mão por engano.',
      },
      {
        type: 'text',
        md: 'A penalidade varia por clube e torneio. É comum quem errou pagar o valor de um Mangan e a mão ser repetida. Combine a regra antes de jogar.',
      },
    ],
  },
  {
    id: 'honba-empate',
    section: 'regras',
    title: 'Honba e empate',
    termos: ['honba', 'empate'],
    blocks: [
      {
        type: 'text',
        md: 'Cada mão repetida soma um honba. Cada honba adiciona 300 pontos ao próximo vencedor: no tsumo, cada jogador paga 100; no ron, quem descartou paga 300.',
      },
      {
        type: 'text',
        md: 'Se o muro acaba sem vencedor, quem não está em tenpai paga 3.000 no total para quem está.',
      },
    ],
  },
  {
    id: 'hanchan',
    section: 'regras',
    title: 'Hanchan: Leste e Sul',
    blocks: [
      {
        type: 'text',
        md: 'A partida padrão dos clubes e torneios. Depois que todos foram oya na rodada do Leste, começa a rodada do **Sul** e cada um é oya de novo.',
      },
      {
        type: 'text',
        md: 'Na rodada do Sul, o vento da rodada passa a ser o Sul. Dura o dobro do tonpuusen e dá mais tempo para recuperar pontos.',
      },
    ],
  },
  {
    id: 'eficiencia',
    section: 'estrategia',
    title: 'Eficiência da mão',
    termos: ['tenpai', 'ryanmen'],
    blocks: [
      {
        type: 'text',
        md: 'Eficiência é chegar ao tenpai mais rápido, guardando as formas que aceitam **mais pedras**.',
      },
      {
        type: 'text',
        md: '**Descarte primeiro o que não conversa com nada**\n- Honras soltas que não valem yaku para você (um vento que não é o seu nem o da rodada).\n- Depois, terminais soltos (1 e 9): só formam grupo de um lado.\n- Depois, honras de valor soltas (dragões, o vento da rodada e o seu).\n- Depois, as outras pedras soltas.',
      },
      { type: 'heading', text: 'Leste sozinho ou terminal sozinho?' },
      {
        type: 'hand',
        mpsz: '1z 9m',
        caption: 'Os dois estão soltos na mão: qual sai primeiro?',
      },
      {
        type: 'text',
        md: 'Descarte o ==9 de Man== e guarde o Leste por mais algumas voltas. O Leste é vento da rodada no tonpuusen e vale yaku para todos: se ele virar par, um pon já dá yaku, mesmo com a mão aberta. O 9 só forma sequência de um lado (7-8-9) e não traz yaku nenhum.',
      },
      {
        type: 'tip',
        md: 'Não segure o Leste para sempre: se ele não formou par em poucas voltas, descarte cedo. Mais tarde, uma honra de valor pode ser justo a pedra que outro jogador espera.',
      },
      {
        type: 'text',
        md: '**Prefira esperas de dois lados.** Conte quantas pedras servem: cada tipo tem 4 cópias.',
      },
      {
        type: 'hand',
        mpsz: '23m',
        caption: 'Dois lados: até 8 pedras',
        after: '14m',
        afterLabel: 'espera',
      },
      {
        type: 'hand',
        mpsz: '13m',
        caption: 'No meio: até 4 pedras',
        after: '2m',
        afterLabel: 'espera',
      },
      {
        type: 'hand',
        mpsz: '12m',
        caption: 'Na ponta: até 4 pedras',
        after: '3m',
        afterLabel: 'espera',
      },
      {
        type: 'quiz',
        question: 'Você comprou e precisa descartar. Qual pedra sai primeiro?',
        hand: '234m 9m 55p 678p 45s 79s 4z',
        options: [
          { label: 'Norte', mpsz: '4z', correct: true },
          { label: '9 de Man', mpsz: '9m' },
          { label: '7 de Sou', mpsz: '7s' },
        ],
        answer:
          'O Norte (se ele não for o seu vento nem o da rodada). Sozinho ele só vira par ou trinca e não vale yaku. O 9 de Man ainda pode virar 7-8-9 e o 7-9 de Sou espera o 8.',
      },
    ],
  },
  {
    id: 'defesa',
    section: 'estrategia',
    title: 'Defesa básica: genbutsu e suji',
    termos: ['riichi', 'furiten'],
    blocks: [
      {
        type: 'text',
        md: 'Quando alguém declara Riichi, a mão dele está pronta. Se a sua mão está longe, descartar com segurança vale mais do que insistir.',
      },
      {
        type: 'text',
        md: '**Genbutsu: as pedras dele.** Tudo o que o jogador em Riichi já descartou é 100% seguro contra ele: se essa pedra fosse uma espera dele, ele estaria em furiten e não poderia fazer ron.',
      },
      {
        type: 'text',
        md: '**Suji: os números de 3 em 3.** No mesmo naipe, 1-4-7, 2-5-8 e 3-6-9 são suji. Se ele descartou o 4, uma espera de dois lados 2-3 (que espera 1 ou 4) ou 5-6 (que espera 4 ou 7) o deixaria em furiten. Então o 1 e o 7 daquele naipe ficam mais seguros.',
      },
      {
        type: 'hand',
        mpsz: '4p',
        caption: 'Ele descartou o 4 de Pin',
        after: '1p7p',
        afterLabel: 'suji',
      },
      {
        type: 'text',
        md: '- Para o 4, o 5 e o 6, precisa dos dois lados: o 5 fica mais seguro se o 2 **e** o 8 já saíram (nakasuji).\n- Suji só protege contra espera de dois lados. Não protege contra espera no meio (4-6 esperando 5), na ponta (1-2 esperando 3), no par ou em trinca.',
      },
      {
        type: 'text',
        md: '**Na dúvida**: genbutsu primeiro, depois honras que já saíram duas ou três vezes, depois suji. Desistir de uma mão fraca é jogar bem.',
      },
      {
        type: 'text',
        md: `Para ir mais fundo (kabe, meio suji e as armadilhas do suji): [Suji in mahjong, do NPMahjong](${ARTIGO_SUJI}), em inglês.`,
      },
    ],
  },
]

/** Um módulo da Parte 3 (Aprofundando), com as páginas dos tópicos da seção. */
const moduloRegras = (
  id: TopicoRegras['section'],
  number: number,
  title: string,
  cover: string,
): TutorialModule => ({
  id,
  number,
  title,
  cover,
  pages: topicosRegras
    .filter((topico) => topico.section === id)
    .map(({ id: idTopico, title: titulo, termos, blocks }, indice) => ({
      id: idTopico,
      number: `${number}.${indice + 1}`,
      title: titulo,
      termos,
      blocks,
    })),
})

const modulo = (id: string) => {
  const encontrado = modulos.find((item) => item.id === id)
  if (!encontrado) throw new Error(`Módulo do guia não encontrado: ${id}`)
  return encontrado
}

export const tutorialParts: TutorialPart[] = [
  {
    id: 'primeiras-partidas',
    number: 1,
    title: 'Primeiras partidas',
    cover: 'Tudo o que você precisa para jogar, sem contar pontos.',
    modules: ['pedras', 'mesa', 'mao', 'turno', 'yakus', 'fim-partida'].map(modulo),
  },
  {
    id: 'ir-alem',
    number: 2,
    title: 'Para ir além',
    cover:
      'Pontos, dora e kan também fazem parte do jogo: numa partida de verdade, tudo isso entra na mesa.',
    milestone: {
      title: 'Você já pode jogar!',
      md: 'Com o que você viu até aqui já dá para jogar uma partida inteira. Nas primeiras, não precisa contar pontos: quem vence com uma mão válida ganha a mão, e o Leste passa adiante como no fim da partida.\nO que você viu até aqui é a **base**. O jogo completo vai além, e os próximos módulos mostram o resto.',
    },
    modules: ['pontos', 'dora', 'kan'].map(modulo),
  },
  {
    id: 'aprofundando',
    number: 3,
    title: 'Aprofundando',
    cover: 'Mais regras que também valem em toda partida, e estratégia para jogar melhor.',
    modules: [
      moduloRegras('regras', 10, 'Mais regras', 'Detalhes que também fazem parte do jogo.'),
      moduloRegras(
        'estrategia',
        11,
        'Estratégia',
        'Para jogar melhor depois das primeiras partidas.',
      ),
    ],
  },
]

/** Onde cada módulo está no livro, para as referências `{{onde:<id>}}` dos textos. */
const ONDE_ESTA = new Map(
  tutorialParts.flatMap((parte) =>
    parte.modules.map((item) => [
      item.id,
      `Parte ${parte.number}, Módulo ${item.number} (${item.title})`,
    ]),
  ),
)

/** Troca `{{onde:<id>}}` em todos os textos do livro pelo lugar do módulo. */
function trocarReferencias(valor: unknown) {
  if (!valor || typeof valor !== 'object') return
  const campos = valor as Record<string, unknown>
  for (const chave of Object.keys(campos)) {
    const campo = campos[chave]
    if (typeof campo === 'string' && campo.includes('{{onde:')) {
      campos[chave] = campo.replace(/\{\{onde:([\w-]+)\}\}/g, (_, id: string) => {
        const lugar = ONDE_ESTA.get(id)
        if (!lugar) throw new Error(`Referência do guia para módulo inexistente: ${id}`)
        return lugar
      })
    } else trocarReferencias(campo)
  }
}
trocarReferencias(tutorialParts)

/** Verbetes do Glossário do app, mais os termos de mesa que só o guia usa. */
export const glossary: TermoGlossarioGuia[] = [
  { term: 'Chombo', definition: doGlossario('chombo') },
  { term: 'Dora', definition: doGlossario('dora') },
  { term: 'Fu', definition: doGlossario('fu') },
  { term: 'Furiten', definition: doGlossario('furiten') },
  {
    term: 'Genbutsu',
    definition: 'Pedra que o jogador em Riichi já descartou: segura contra ele.',
  },
  { term: 'Han', definition: doGlossario('han') },
  { term: 'Hanchan', definition: 'Partida padrão, com as rodadas do Leste e do Sul.' },
  { term: 'Honba', definition: doGlossario('honba') },
  { term: 'Ko', definition: doGlossario('ko') },
  { term: 'Menzen', definition: 'Mão fechada: sem nenhum descarte de outro jogador.' },
  {
    term: 'Muro morto',
    definition:
      '14 pedras separadas depois da abertura, que não são compradas normalmente. Nele ficam o indicador de dora e as reposições do kan.',
  },
  { term: 'Oya', definition: doGlossario('oya') },
  {
    term: 'Suji',
    definition:
      'Números de 3 em 3 no mesmo naipe (1-4-7, 2-5-8, 3-6-9). Mais seguros contra espera de dois lados.',
  },
  { term: 'Tenpai', definition: doGlossario('tenpai') },
  { term: 'Tonpuusen', definition: 'Partida curta, só com a rodada do Leste.' },
  { term: 'Yaku', definition: doGlossario('yaku') },
]

const INSTAGRAM_CMC = 'https://www.instagram.com/cerradomahjongclub'
const INSTAGRAM_SAMBA = 'https://www.instagram.com/sambaestudios'

export const credits: TutorialBlock[] = [
  {
    type: 'text',
    md: '**Tutorial Mojoca em colaboração com o Cerrado Mahjong Club (CMC)**',
  },
  {
    type: 'text',
    md: 'Este tutorial foi inspirado no **Mahjong Guia de Bolso**, de Isabella Oliveira, que usamos para ensinar novos jogadores no Cerrado Mahjong Club. A ideia não é substituir o guia, é só ter uma versão que cabe no celular e economiza papel.',
  },
  { type: 'text', md: 'As árvores do Cerrado agradecem. 🌳' },
  { type: 'text', md: 'Se você tiver a chance, pegue o guia impresso. Ele é lindo.' },
  {
    type: 'tip',
    md: 'Mahjong Guia de Bolso © Isabella Oliveira / Cerrado Mahjong Club, licenciado em Creative Commons CC BY-NC-ND 4.0.',
  },
  { type: 'text', md: `Instagram: [@cerradomahjongclub](${INSTAGRAM_CMC})` },
]

export const furtherReading: TutorialBlock[] = [
  {
    type: 'text',
    md: `- **Cerrado Mahjong Club**: [@cerradomahjongclub](${INSTAGRAM_CMC})\n- **ABM**: Associação Brasileira de Mahjong.\n- **Feljong**, de Fel Barros (Samba Estudios): jogo de cartas inspirado no Riichi Mahjong, ótimo para quem está começando. Ensina as regras aos poucos, cabe na mochila e tem variantes para 2 e 3 jogadores. Boa porta de entrada antes de investir em um jogo de pedras. [@sambaestudios](${INSTAGRAM_SAMBA})\n- Canal **Jogos de Cartas & Afins**.\n- **NPMahjong**, de Nicolas Pro: artigos de estratégia, como [Suji in mahjong](${ARTIGO_SUJI}) (em inglês).`,
  },
]

export const conteudoPtBR: ConteudoTutorial = {
  tutorialParts,
  glossary,
  credits,
  furtherReading,
}
