/**
 * Guia Aprender a jogar em espanhol: mesmos ids, pedras e respostas do pt-BR
 * (`npm run test:guia` confere). Vocabulário igual ao do app em es: ficha, palo,
 * trío, pareja, secuencia, robar, llamada, muro muerto.
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

const { pontos, linhaPatamar, grupoYakus, doGlossario, simNao, tabelaYakusLocais } = criarAuxiliares('es', {
  sim: 'Sí',
  nao: 'No',
  cabecalhoYakus: ['Yaku', 'Qué pide', 'Cerrada', 'Abierta'],
})

const modulos: TutorialModule[] = [
  {
    id: 'pedras',
    number: 1,
    title: 'Las fichas',
    cover: 'Conoce las 136 fichas del juego.',
    pages: [
      {
        id: 'naipes',
        number: '1.1',
        title: 'Los tres palos',
        termos: ['naipes', 'man', 'pin', 'sou'],
        blocks: [
          {
            type: 'text',
            md: 'Son **136 fichas**: 34 tipos, con 4 copias de cada uno. Tres palos van del 1 al 9.',
          },
          { type: 'text', md: '**Man** 萬 • Caracteres: números escritos en kanji.' },
          { type: 'hand', mpsz: '123456789m', numbered: true },
          { type: 'text', md: '**Pin** 筒 • Círculos: de uno a nueve círculos.' },
          { type: 'hand', mpsz: '123456789p', numbered: true },
          { type: 'text', md: '**Sou** 索 • Bambúes: el 1 suele ser un pájaro.' },
          { type: 'hand', mpsz: '123456789s', numbered: true },
        ],
      },
      {
        id: 'honras',
        number: '1.2',
        title: 'Los honores',
        termos: ['honras', 'ventos', 'dragoes'],
        blocks: [
          { type: 'text', md: 'Fichas sin número (字牌). Nunca forman secuencia.' },
          {
            type: 'text',
            md: '**Vientos** 風牌: Este (Ton), Sur (Nan), Oeste (Shaa), Norte (Pei).',
          },
          { type: 'hand', mpsz: '1234z' },
          {
            type: 'text',
            md: '**Dragones** 三元牌: Blanco (Haku), Verde (Hatsu), Rojo (Chun).',
          },
          { type: 'hand', mpsz: '567z' },
          {
            type: 'tip',
            md: 'Los nombres en japonés aparecen en la mesa, pero no te preocupes por ellos ahora: Este, Sur, Blanco y Rojo bastan para jugar.',
          },
        ],
      },
      {
        id: 'nomes',
        number: '1.3',
        title: 'Nombres que vas a oír',
        termos: ['terminais', 'aka-dora'],
        blocks: [
          {
            type: 'text',
            md: '- **Terminales**: los 1 y 9 de los palos.\n- **Simples**: las fichas del 2 al 8.\n- **5 rojo** (Aka dora): un 5 especial en cada palo, que vale un bono.',
          },
          { type: 'hand', mpsz: '19m 19p 19s', caption: 'Terminales', numbered: true },
          { type: 'hand', mpsz: '0m 0p 0s', caption: 'Los cincos rojos' },
          {
            type: 'tip',
            md: 'Por ahora, juega el 5 rojo como un 5 normal de su palo. El bono que vale lo verás en {{onde:dora}}.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '¿El 9 de Pin es terminal o simple?',
        hand: '9p',
        options: [{ label: 'Terminal', correct: true }, { label: 'Simple' }],
        answer: 'Terminal. Los 1 y 9 de los palos son terminales; del 2 al 8 son simples.',
      },
    ],
  },
  {
    id: 'mesa',
    number: 2,
    title: 'La mesa',
    cover: 'Arma tu primera mesa.',
    pages: [
      {
        id: 'sorteio',
        number: '2.1',
        title: 'Sortear los vientos',
        termos: ['ventos', 'oya'],
        blocks: [
          {
            type: 'text',
            md: 'Antes que nada, cada jugador necesita un viento. Define su lugar en la mesa y quién empieza.',
          },
          {
            type: 'text',
            md: '- Quien saca **Este** es el **oya** (quien reparte). Es quien lanza los dados y hace el primer descarte.\n- Los demás se sientan en sentido antihorario a partir de él: Este → Sur → Oeste → Norte.',
          },
          {
            type: 'image',
            image: 'mesaVentos',
            alt: 'Mesa vista desde arriba con los cuatro lugares: Este (el oya) abajo, Sur a la derecha, Oeste arriba y Norte a la izquierda. Flechas rojas en el medio muestran el orden de los turnos: del Este al Sur, del Sur al Oeste, del Oeste al Norte y del Norte de vuelta al Este.',
            caption:
              'El turno pasa a la derecha de quien jugó: Este → Sur → Oeste → Norte. Cuando cambia el oya, el Este también pasa a la derecha: quien era Sur es el nuevo Este.',
          },
          {
            type: 'text',
            md: '**Cómo sortear**\n- **Con las fichas**: pon boca abajo una ficha de cada viento, mézclalas y cada jugador toma una.\n- **Con la app**: el Sorteo de Vientos sortea los cuatro vientos al instante, sin separar fichas.',
          },
          { type: 'appLink', tool: 'sorteador', label: 'Abrir el Sorteo de Vientos' },
        ],
      },
      {
        id: 'muro',
        number: '2.2',
        title: 'Mezclar y armar el muro',
        blocks: [
          {
            type: 'steps',
            items: [
              'Esparzan las fichas en el centro de la mesa y mézclenlas bien, todos juntos, como vayan cayendo. Después pongan boca abajo las que quedaron boca arriba y mezclen suavemente, para que ninguna se dé vuelta otra vez.',
              {
                md: 'Cada jugador arma frente a sí una fila de **17 fichas de largo y 2 de alto** (34 fichas).',
                image: 'muroFileira',
                alt: 'Fila de 17 columnas de fichas boca abajo, cada columna con 2 fichas apiladas.',
              },
              {
                md: 'Cada uno empuja su muro un poco hacia el medio de la mesa, frente a sí. Los cuatro quedan alrededor del centro, pero ==no hace falta que se toquen== ni que formen un cuadrado perfecto.',
                image: 'muroQuadrado',
                alt: 'Vista desde arriba: cuatro muros alrededor del centro de la mesa, cada uno frente a un jugador, con un hueco en cada esquina. Este abajo, Sur a la derecha, Oeste arriba y Norte a la izquierda. En el medio, el centerpiece con el Este (東) y, en cada lado, los números de los dados que abren el muro de ese jugador: Este 1, 5 y 9; Sur 2, 6 y 10; Oeste 3, 7 y 11; Norte 4, 8 y 12.',
              },
            ],
          },
        ],
      },
      {
        id: 'abertura',
        number: '2.3',
        title: 'Abrir el muro',
        termos: ['oya'],
        blocks: [
          {
            type: 'text',
            md: 'El oya ==siempre lanza los dos dados== y los suma. El número dice **qué muro se abre** y **en qué columna** se corta. En el corte se separa el muro muerto.',
          },
          { type: 'heading', text: '1. Qué muro se abre' },
          {
            type: 'text',
            md: 'Cuenta los jugadores a partir del oya, en ==sentido antihorario==: el oya es el 1, quien está a su derecha es el 2, el de enfrente es el 3 y el de la izquierda es el 4. En el 5 la cuenta vuelve al oya.',
          },
          {
            type: 'text',
            md: '- **5 o 9**: el muro del oya.\n- **2, 6 o 10**: el muro de quien está a su derecha.\n- **3, 7 u 11**: el muro de enfrente.\n- **4, 8 o 12**: el muro de quien está a su izquierda.',
          },
          {
            type: 'tip',
            md: '**Con centerpiece** no hace falta contar: cada lado muestra los números que abren el muro del jugador sentado ahí. Solo busca la suma de los dados.',
          },
          {
            type: 'image',
            image: 'mesaDados',
            alt: 'Mesa vista desde arriba con los cuatro muros. Junto a cada viento, los números de la cuenta: Este 1, 5 y 9; Sur 2, 6 y 10; Oeste 3, 7 y 11; Norte 4, 8 y 12. Los dados en el medio suman 5, y el Este, el propio oya, está destacado.',
            caption: 'Ejemplo: 2 + 3 = 5. La cuenta da la vuelta y se detiene en el propio oya.',
          },
          { type: 'heading', text: '2. Dónde se abre' },
          {
            type: 'text',
            md: 'Quien armó el muro sorteado lo mira desde donde está sentado y cuenta las columnas ==de derecha a izquierda==: la columna del extremo derecho es la 1. Cuenta el mismo número que dieron los dados y separa el muro justo después de esa columna: esa es la ==apertura==.',
          },
          {
            type: 'image',
            image: 'muroContagem',
            alt: 'Un muro de 17 columnas, visto de frente por quien lo armó. Las 5 columnas del extremo derecho están numeradas: 1 en el extremo derecho y 5 más a la izquierda. Una flecha roja apunta de derecha a izquierda hasta el corte de la apertura, justo después de la 5.ª columna.',
            caption:
              'Dados 5: la columna 1 es la de tu derecha, y el corte viene después de la 5.ª.',
          },
          {
            type: 'image',
            image: 'mesaAbertura',
            alt: 'Mesa vista desde arriba. En el muro del Este, las columnas están numeradas del 1 al 5, en rojo, desde el extremo derecho de quien está sentado en el Este hacia la izquierda, y el muro está cortado después de la 5.ª.',
            caption: 'La misma cuenta vista desde arriba, en el muro del Este.',
          },
        ],
      },
      {
        id: 'muro-morto',
        number: '2.4',
        title: 'El muro muerto',
        termos: ['dora'],
        blocks: [
          {
            type: 'text',
            md: 'Las ==7 columnas justo a la derecha de la apertura== (14 fichas) forman el **muro muerto**. No se roban normalmente.',
          },
          {
            type: 'image',
            image: 'muroMorto',
            alt: 'Muro abierto visto de frente: a la izquierda el muro del que se roba, después la apertura y, a la derecha, las 7 columnas del muro muerto, numeradas del 1 al 7 a partir de la apertura. En la columna 3, la ficha de arriba está boca arriba: es el indicador de dora.',
            caption:
              'De frente al muro: robos a la izquierda de la apertura, muro muerto a la derecha, numerado a partir de la apertura.',
          },
          { type: 'heading', text: 'Si los dados dan menos de 7' },
          {
            type: 'text',
            md: 'A la derecha de la apertura quedan solo las columnas que contaste con los dados, menos de 7. ==Completa el muro muerto con el muro vecino==, a la derecha. En el ejemplo de los dados 5, quedan 5 columnas en el muro del Este y las otras 2 vienen del muro del Sur.',
          },
          {
            type: 'image',
            image: 'muroMortoCurto',
            alt: 'Mesa vista desde arriba con los dados sumando 5. El muro del Este está cortado después de la 5.ª columna; el muro muerto, con trama y contorno rojo, ocupa esas 5 columnas y sigue en las 2 primeras del muro del Sur, doblando la esquina. El indicador está en la 3.ª columna, todavía en el Este.',
            caption: 'Dados 5: 5 columnas en el Este + 2 en el Sur.',
          },
          {
            type: 'tip',
            md: 'Con 7 o más, el muro muerto cabe entero en el muro sorteado. De 2 a 6, siempre dobla la esquina.',
          },
          { type: 'heading', text: 'Para qué sirve' },
          {
            type: 'text',
            md: 'Son 136 fichas, 4 de cada una. Si todas entraran en juego, se podría contar lo que ya salió y saber exactamente lo que falta. Las 14 fichas del muro muerto quedan fuera de los robos, así que ==nadie sabe con certeza== qué fichas van a aparecer.',
          },
          { type: 'heading', text: 'El indicador de dora' },
          {
            type: 'text',
            md: 'Ahora la cuenta es al revés que la de los dados: cuenta ==3 columnas desde la apertura hacia la derecha== y da vuelta la ficha de arriba de la 3.ª. Es el **indicador de dora**, que vas a conocer en {{onde:dora}}.',
          },
          {
            type: 'tip',
            md: 'Algunas fichas del muro muerto tienen otros usos, que verás en {{onde:kan}}.',
          },
        ],
      },
      {
        id: 'compra',
        number: '2.5',
        title: 'Robar las fichas',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                md: 'El robo empieza ==en la columna justo a la izquierda de la apertura== (para quien armó ese muro) y sigue ==hacia la izquierda==, muro tras muro, como muestra la flecha. El muro muerto queda fuera. Visto desde arriba, las fichas salen del muro en sentido **horario**: al revés del orden de los turnos, que es antihorario.',
                image: 'mesaCompra',
                alt: 'Mesa vista desde arriba. El muro del Este está abierto; del lado de la esquina está el muro muerto, con contorno rojo, doblando hacia el muro del Sur. Del otro lado de la apertura sale una flecha roja que sigue por el muro del Este y después por el del Norte, en sentido horario.',
              },
              'El oya toma primero, después quien está a su derecha, y así sucesivamente. Cada uno toma **4 fichas por vez** (2 columnas), hasta que todos tengan 12.',
              'Cada jugador toma **1 ficha** más y queda con 13.',
              'El oya se queda con la **14.ª ficha** y abre el juego con el primer descarte.',
            ],
          },
          { type: 'heading', text: 'Resumen: hacia qué lado contar' },
          {
            type: 'text',
            md: 'Siempre de frente al muro, como quien lo armó:\n- **Dados**: del extremo derecho hacia la izquierda.\n- **Muro muerto e indicador**: de la apertura hacia la derecha.\n- **Robos**: de la apertura hacia la izquierda.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '¿Quién lanza los dados y hace el primer descarte?',
        options: [
          { label: 'Quien está a la derecha del Este' },
          { label: 'El oya, quien sacó Este', correct: true },
          { label: 'Quien sacó Norte' },
        ],
        answer: 'El oya, quien sacó Este. Lanza los dados y abre el juego con el primer descarte.',
      },
      {
        type: 'quiz',
        question: '¿Para qué sirve el muro muerto?',
        options: [
          { label: 'Guardar las fichas descartadas' },
          { label: 'Separar las fichas de quien perdió la mano' },
          {
            label:
              'Dejar fichas fuera de juego para que nadie sepa con certeza cuáles van a aparecer',
            correct: true,
          },
        ],
        answer:
          'Dejar fichas fuera de juego. Sin ellas en los robos, nadie puede contar exactamente lo que falta salir.',
      },
      {
        type: 'quiz',
        question: '¿Con cuántas fichas empieza el oya?',
        options: [{ label: '13' }, { label: '14', correct: true }, { label: '12' }],
        answer: '14. Los demás quedan con 13, y el oya abre el juego descartando la 14.ª.',
      },
      {
        type: 'quiz',
        question:
          'Los dados dieron 4 (1 + 3). ¿En qué muro está la apertura y dónde queda el muro muerto?',
        options: [
          { label: 'En el Norte, y el muro muerto cabe entero en él' },
          { label: 'En el Norte: 4 columnas en él + 3 en el muro del Este', correct: true },
          { label: 'En el Oeste: 4 columnas en él + 3 en el Sur' },
        ],
        answer:
          'Contando a partir del oya en sentido antihorario, el 4 cae en quien está a su izquierda: el Norte. Cuenta 4 columnas, desde su extremo derecho hacia la izquierda, y abre. Solo caben 4 columnas del muro muerto ahí; las otras 3 vienen del muro vecino a la derecha del Norte, que es el del Este.',
      },
    ],
  },
  {
    id: 'mao',
    number: 3,
    title: 'Mano completa',
    cover: 'Descubre qué estás tratando de armar.',
    pages: [
      {
        id: 'formula',
        number: '3.1',
        title: 'La fórmula: 4 grupos + 1 pareja',
        blocks: [
          {
            type: 'text',
            md: 'Para ganar necesitas **14 fichas**, organizadas en cuatro grupos de tres y una pareja.',
          },
          { type: 'hand', mpsz: '123m 456p 789s 555z 22s' },
        ],
      },
      {
        id: 'grupos',
        number: '3.2',
        title: 'Los tipos de grupo',
        termos: ['sequencia', 'trinca', 'par'],
        blocks: [
          { type: 'text', md: '**Secuencia**: tres números seguidos del mismo palo.' },
          { type: 'hand', mpsz: '345p' },
          { type: 'text', md: '**Trío**: tres fichas iguales.' },
          { type: 'hand', mpsz: '777s 555z' },
          { type: 'text', md: '**Pareja**: dos fichas iguales.' },
          { type: 'hand', mpsz: '22s' },
          {
            type: 'tip',
            md: 'La secuencia no da la vuelta (8-9-1 no vale) y los honores (vientos y dragones) nunca forman secuencia.',
          },
        ],
      },
      {
        id: 'tenpai',
        number: '3.3',
        title: 'Tenpai: falta una',
        termos: ['tenpai'],
        blocks: [
          {
            type: 'text',
            md: 'Juegas con 13 fichas y completas la 14.ª al ganar. Cuando solo falta una, tu mano está en **tenpai**. Las fichas que sirven son tus **esperas**.',
          },
          {
            type: 'text',
            md: 'Separa la mano en los grupos que ya están listos. Lo que ==queda incompleto== es donde está la espera.',
          },
          { type: 'heading', text: 'Dos lados' },
          {
            type: 'hand',
            mpsz: '234m 567p 789s 11z 45m',
            labels: ['Secuencia', 'Secuencia', 'Secuencia', 'Pareja', 'Espera'],
            after: '36m',
            afterLabel: 'espera',
            caption: 'El 4-5 se completa con el 3 o el 6: la mejor espera, hasta 8 fichas.',
          },
          { type: 'heading', text: 'En el medio' },
          {
            type: 'hand',
            mpsz: '123p 456s 777m 99s 46m',
            labels: ['Secuencia', 'Secuencia', 'Trío', 'Pareja', 'Espera'],
            after: '5m',
            afterLabel: 'espera',
            caption: 'El 4-6 solo se completa con el 5 del medio.',
          },
          { type: 'heading', text: 'En la punta' },
          {
            type: 'hand',
            mpsz: '345m 678p 222s 55z 12m',
            labels: ['Secuencia', 'Secuencia', 'Trío', 'Pareja', 'Espera'],
            after: '3m',
            afterLabel: 'espera',
            caption: 'El 1-2 solo se completa con el 3: del otro lado no hay 0.',
          },
          { type: 'heading', text: 'Dos parejas' },
          {
            type: 'hand',
            mpsz: '234m 567p 678s 22p 88s',
            labels: ['Secuencia', 'Secuencia', 'Secuencia', 'Espera', 'Espera'],
            after: '2p8s',
            afterLabel: 'espera',
            caption: 'Una de las parejas se vuelve trío y la otra queda de pareja.',
          },
          { type: 'heading', text: 'Solo la pareja' },
          {
            type: 'hand',
            mpsz: '123m 456m 789p 111z 5s',
            labels: ['Secuencia', 'Secuencia', 'Secuencia', 'Trío', 'Espera'],
            after: '5s',
            afterLabel: 'espera',
            caption: 'Los 4 grupos están listos: falta la pareja del 5 de Sou.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: '¿Esta mano está en tenpai?',
        hand: '234m 567p 11s 345s 78p',
        options: simNao(true),
        answer: 'Sí. Espera el 6 o el 9 de Pin para completar el 7-8.',
      },
    ],
  },
  {
    id: 'turno',
    number: 4,
    title: 'El turno',
    cover: 'Roba, descarta y llama fichas.',
    pages: [
      {
        id: 'comprar-descartar',
        number: '4.1',
        title: 'Robar y descartar',
        blocks: [
          {
            type: 'text',
            md: 'En tu turno robas una ficha del muro y descartas otra, boca arriba. Los descartes quedan en filas de seis frente a ti, entre tu muro y el centro de la mesa, a la vista de todos. El turno pasa a quien está a tu derecha.',
          },
          {
            type: 'image',
            image: 'mesaDescartes',
            alt: 'Mesa vista desde arriba: frente a cada muro, una fila de 6 descartes y el comienzo de la segunda. En el medio, el centro de la mesa con el viento de la ronda (東). Uno de los descartes del Sur está de lado, como en el Riichi. A la derecha del Este, por fuera del muro, un pon abierto: tres fichas, con la del extremo izquierdo acostada.',
            caption:
              'Cada uno descarta frente a sí, en filas de 6. A la derecha del Este, un pon: la ficha tomada queda de lado.',
          },
          {
            type: 'text',
            md: 'Con un descarte de otro jugador también puedes formar un grupo en el momento: es la **llamada**, como el pon y el chi. El grupo llamado queda abierto en la mesa, a tu derecha.',
          },
          {
            type: 'tip',
            md: 'En la mesa, la ficha tomada de otro jugador queda **de lado**, apuntando a quien descartó. Así todos saben de dónde vino.',
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
            md: 'Alguien descartó una ficha y tienes dos iguales en la mano. Di "pon", toma la ficha y muestra el trío en la mesa.',
          },
          {
            type: 'text',
            md: 'Vale con el descarte de **cualquier jugador**. El juego sigue a partir de ti: descarta una ficha.',
          },
          {
            type: 'melds',
            items: [
              { mpsz: '777s', deLado: 0, caption: 'De la izquierda' },
              { mpsz: '777s', deLado: 1, caption: 'De enfrente' },
              { mpsz: '777s', deLado: 2, caption: 'De la derecha' },
            ],
          },
          {
            type: 'text',
            md: 'Después del pon, tu mano queda **abierta**. Una mano sin ningún descarte de otro jugador es **cerrada**.',
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
            md: 'Puedes completar una secuencia con el descarte, pero solo de quien está **a tu izquierda**. Di "chi" y muestra la secuencia en la mesa.',
          },
          {
            type: 'melds',
            items: [
              {
                mpsz: '435p',
                deLado: 0,
                caption: 'Tomaste el 4 de Pin: queda de lado, a la izquierda',
              },
            ],
          },
          { type: 'text', md: 'Después del chi, tu mano queda **abierta**.' },
        ],
      },
      {
        id: 'prioridade',
        number: '4.4',
        title: 'Quién tiene prioridad',
        blocks: [
          {
            type: 'text',
            md: 'Si más de una persona quiere el mismo descarte: **ron > pon > chi**.',
          },
          {
            type: 'text',
            md: '**Ron** es ganar con el descarte de alguien. Lo verás en la próxima página.',
          },
        ],
      },
      {
        id: 'tsumo-ron',
        number: '4.5',
        title: 'Tsumo y ron',
        termos: ['tsumo', 'ron'],
        blocks: [
          {
            type: 'text',
            md: '- **Tsumo**: robaste la ficha que completó la mano. Todos los demás jugadores pagan.\n- **Ron**: la ficha vino del descarte de otro jugador. Solo paga quien descartó.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question:
          'El jugador de enfrente descartó el 6 de Pin y tienes el 5 y el 7 de Pin. ¿Puedes llamar chi?',
        hand: '57p',
        options: simNao(false),
        answer: 'No. El chi solo vale con el descarte de quien está a tu izquierda.',
      },
    ],
  },
  {
    id: 'yakus',
    number: 6,
    title: 'Mano válida',
    cover: 'Completa no basta: para ganar, la mano necesita un yaku.',
    pages: [
      {
        id: 'sem-yaku',
        number: '6.1',
        title: 'Sin yaku, no hay victoria',
        termos: ['yaku'],
        blocks: [
          {
            type: 'text',
            md: 'Tener 4 grupos y 1 pareja no basta. La mano necesita al menos un **yaku**, una condición de puntuación. Sin yaku, la mano igual puede estar en tenpai, y eso cuenta en el empate. Solo que no puede ganar.',
          },
          { type: 'tip', md: 'En la regla real, ganar sin yaku es chombo, una falta grave.' },
        ],
      },
      {
        id: 'yakus-iniciantes',
        number: '6.2',
        title: 'Yakus para empezar',
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
            md: 'Empieza por estos cinco: con ellos ya ganas la mayoría de las manos. Toca cada uno para ver cómo funciona.',
          },
          {
            type: 'cards',
            items: [
              {
                id: 'riichi',
                title: 'Riichi',
                badge: 'solo cerrada',
                blocks: [
                  {
                    type: 'text',
                    md: 'El yaku más común. Con la mano **cerrada** y en tenpai, dices "Riichi" y descartas la ficha de lado.',
                  },
                  {
                    type: 'text',
                    md: 'Por sí solo ya hace válida tu mano. Después de declararlo, ya no puedes cambiar la mano.',
                  },
                ],
              },
              {
                id: 'menzen-tsumo',
                title: 'Menzen Tsumo',
                badge: 'solo cerrada',
                blocks: [
                  {
                    type: 'text',
                    md: 'Ganar por tsumo (con la ficha que robaste) con la mano **cerrada**.',
                  },
                ],
              },
              {
                id: 'tanyao',
                title: "Tan'yao",
                badge: 'abierta o cerrada',
                blocks: [
                  {
                    type: 'text',
                    md: 'Solo fichas del 2 al 8, sin terminales y sin honores.',
                  },
                  { type: 'hand', mpsz: '234m 567m 345p 678s 55s' },
                  {
                    type: 'tip',
                    md: "Algunas mesas solo aceptan Tan'yao con la mano cerrada. Acuérdenlo antes de jugar.",
                  },
                ],
              },
              {
                id: 'yakuhai',
                title: 'Yakuhai',
                badge: 'abierta o cerrada',
                blocks: [
                  { type: 'text', md: 'Un trío de **dragón**, del **viento de la ronda** o del **viento de tu asiento**.' },
                  { type: 'hand', mpsz: '123m 456p 789s 555z 22s' },
                  { type: 'heading', text: 'Qué vientos valen' },
                  {
                    type: 'text',
                    md: 'Cada jugador tiene el **viento de su asiento** (el que sacó en el sorteo). Toda la mesa tiene el **viento de la ronda**: en el tonpuusen, el Este.',
                  },
                  {
                    type: 'text',
                    md: '- Viento de la ronda: vale yaku para todos.\n- Viento de tu asiento: vale yaku solo para ti.\n- Si el viento de la ronda también es el tuyo, vale ==doble==.\n- Un viento que no es de nadie no vale yaku.',
                  },
                  {
                    type: 'text',
                    md: 'Ejemplo: en la ronda del Este, el Este vale para todos. Para el **oya**, también es el viento del asiento: vale doble.',
                  },
                  {
                    type: 'tip',
                    md: 'También vale con la mano **abierta**: un pon de dragón o de viento de valor ya le da yaku a la mano.',
                  },
                ],
              },
              {
                id: 'pinfu',
                title: 'Pinfu',
                badge: 'solo cerrada',
                blocks: [
                  {
                    type: 'text',
                    md: 'Solo secuencias, una pareja que no sea de dragón ni de viento de valor (el tuyo o el de la ronda), y espera de dos lados (ryanmen).',
                  },
                  {
                    type: 'hand',
                    mpsz: '123m 456p 789p 23s 55m',
                    caption: 'Mano en tenpai',
                    after: '1s4s',
                    afterLabel: 'espera',
                  },
                ],
              },
            ],
          },
          { type: 'heading', text: 'Para el siguiente paso' },
          {
            type: 'text',
            md: 'Cuando esos cinco ya te salgan naturales, estos aparecen bastante en la mesa:',
          },
          {
            type: 'cards',
            items: [
              {
                id: 'iipeikou',
                title: 'Iipeikou',
                badge: 'solo cerrada',
                blocks: [
                  {
                    type: 'text',
                    md: 'Dos secuencias ==iguales==, del mismo palo.',
                  },
                  { type: 'hand', mpsz: '234m 234m 567p 789s 55p' },
                ],
              },
              {
                id: 'chanta',
                title: 'Chanta',
                badge: 'abierta o cerrada',
                blocks: [
                  {
                    type: 'text',
                    md: 'Todos los grupos **y la pareja** tienen un terminal (1 o 9) o un honor. Necesita al menos una secuencia.',
                  },
                  { type: 'hand', mpsz: '123m 789p 999s 111z 77z' },
                ],
              },
              {
                id: 'toitoi',
                title: 'Toitoi',
                badge: 'abierta o cerrada',
                blocks: [
                  {
                    type: 'text',
                    md: 'Solo tríos (o kans) y una pareja. ==Ninguna secuencia==.',
                  },
                  { type: 'hand', mpsz: '222m 555p 888s 666z 99m' },
                ],
              },
              {
                id: 'honitsu',
                title: "Hon'itsu",
                badge: 'abierta o cerrada',
                blocks: [
                  {
                    type: 'text',
                    md: 'Toda la mano de **un solo palo**, más honores.',
                  },
                  { type: 'hand', mpsz: '123s 456s 789s 555z 11z' },
                ],
              },
              {
                id: 'chinitsu',
                title: "Chin'itsu",
                badge: 'abierta o cerrada',
                blocks: [
                  {
                    type: 'text',
                    md: 'Toda la mano de **un solo palo**, ==sin honores==.',
                  },
                  { type: 'hand', mpsz: '123p 456p 345p 789p 99p' },
                ],
              },
              {
                id: 'chiitoitsu',
                title: 'Chiitoitsu',
                badge: 'solo cerrada',
                blocks: [
                  {
                    type: 'text',
                    md: '**Siete parejas** diferentes. Es la única mano que no sigue la fórmula de 4 grupos + 1 pareja.',
                  },
                  { type: 'hand', mpsz: '22m 55m 88p 33s 66s 11z 77z' },
                  {
                    type: 'tip',
                    md: 'Las parejas tienen que ser diferentes: cuatro fichas iguales no cuentan como dos parejas.',
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
        question: 'Mano abierta con un chi, sin trío de honor. ¿Tiene yaku?',
        hand: '123m 456p 789s 678p 11m',
        options: simNao(false),
        answer:
          "No. Tiene terminales (sin Tan'yao), está abierta (sin Riichi, Menzen Tsumo ni Pinfu) y no tiene trío de valor (sin Yakuhai).",
      },
    ],
  },
  {
    id: 'pontos',
    number: 8,
    title: 'Puntos',
    cover: 'Cuánto vale tu mano y cómo pagar.',
    coverTip:
      '¿Ya jugaste una ronda con el yaku en juego? Si todavía no, **juega una ahora**, aún sin contar puntos, y vuelve después.',
    pages: [
      {
        id: 'palitos',
        number: '8.1',
        title: 'Los palitos',
        termos: ['riichi', 'honba'],
        blocks: [
          {
            type: 'text',
            md: 'Los puntos se cuentan con palitos. Cada jugador empieza con **25.000**:',
          },
          { type: 'sticks' },
          {
            type: 'text',
            md: 'El palito de 1.000 también es la apuesta del Riichi. Los de 100 cuentan los honba.',
          },
        ],
      },
      {
        id: 'han-fu',
        number: '8.2',
        title: 'Han y fu',
        termos: ['han', 'fu'],
        blocks: [
          {
            type: 'text',
            md: 'El valor viene del **han** (yakus y doras) y del **fu** (forma de la mano). La calculadora hace la cuenta.',
          },
          { type: 'hanFuTutorial' },
          {
            type: 'table',
            headers: ['Yaku', 'Han'],
            rows: [
              ['Riichi', hanYaku('riichi')],
              ['Menzen Tsumo', hanYaku('menzen-tsumo')],
              ["Tan'yao", hanYaku('tanyao')],
              ['Yakuhai', `${hanYaku('yakuhai')} por trío`],
              ['Pinfu', hanYaku('pinfu')],
            ],
          },
          {
            type: 'text',
            md: "Los yakus se suman. Riichi + Tan'yao + Pinfu + Menzen Tsumo = **4 han**.",
          },
        ],
      },
      {
        id: 'patamares',
        number: '8.3',
        title: 'Los niveles',
        termos: ['patamares', 'mangan', 'oya', 'ko'],
        blocks: [
          {
            type: 'text',
            md: 'A partir de 5 han la mano pasa a un nivel, con valor fijo. El **ko** es quien no es el oya.',
          },
          {
            type: 'table',
            headers: ['Nivel', 'Han', 'Ko', 'Oya'],
            rows: [
              linhaPatamar('Mangan', '5', BASE_PATAMAR.mangan),
              linhaPatamar('Haneman', '6–7', BASE_PATAMAR.haneman),
              linhaPatamar('Baiman', '8–10', BASE_PATAMAR.baiman),
              linhaPatamar('Sanbaiman', '11–12', BASE_PATAMAR.sanbaiman),
              linhaPatamar('Yakuman', '13+', BASE_PATAMAR.yakuman),
            ],
          },
          { type: 'text', md: 'El oya recibe **1,5×** los puntos al ganar.' },
          { type: 'tip', md: 'Con 3 o 4 han, el fu puede llevar la mano a Mangan.' },
        ],
      },
      {
        id: 'quem-paga',
        number: '8.4',
        title: 'Quién paga',
        termos: ['ron', 'tsumo'],
        blocks: [
          {
            type: 'text',
            md: '- **Ron**: quien descartó paga todo.\n- **Tsumo**: todos pagan. Si quien ganó no es el oya, el oya paga la mitad y los otros dos dividen el resto.',
          },
          {
            type: 'text',
            md: 'Quien gane también se lleva las apuestas de Riichi (1.000 cada una) que estén en la mesa.',
          },
        ],
      },
      {
        id: 'riichi-aposta',
        number: '8.5',
        title: 'La apuesta del Riichi',
        termos: ['riichi'],
        blocks: [
          {
            type: 'text',
            md: 'Contando puntos, quien declara Riichi apuesta un palito de **1.000** en el centro de la mesa.',
          },
          {
            type: 'text',
            md: '- Para declararlo, necesitas tener al menos 1.000 puntos.\n- En Mahjong Soul y Tenhou, además debe haber 4 fichas o más para robar en el muro. En la mesa, depende de la regla.\n- Si la ficha del Riichi le da ron a alguien, la apuesta no se hace.\n- Quien gane la mano se lleva las apuestas de la mesa.\n- Si nadie gana, las apuestas quedan en la mesa para la próxima mano.',
          },
          {
            type: 'tip',
            md: 'El Riichi también revela la Ura-dora a quien gana, que verás en {{onde:dora}}.',
          },
        ],
      },
      {
        id: 'honba-empate',
        number: '8.6',
        title: 'Honba y empate',
        termos: ['honba', 'empate'],
        blocks: [
          {
            type: 'text',
            md: 'Cada honba en la mesa agrega 300 puntos a quien gane. En tsumo, cada jugador paga 100 más. En ron, quien descartó paga los 300. Este valor va aparte: no cambia con los límites ni con el 1,5× del oya.',
          },
          {
            type: 'text',
            md: 'Si el muro se acaba sin ganador, quien no está en tenpai paga 3.000 en total a quien sí lo está.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'Un ko gana un Mangan por tsumo. ¿Cuánto paga el oya?',
        options: [
          { label: pontos(BASE_PATAMAR.mangan) },
          { label: pontos(BASE_PATAMAR.mangan * 2), correct: true },
          { label: pontos(BASE_PATAMAR.mangan * 4) },
        ],
        answer: `${pontos(BASE_PATAMAR.mangan * 2)}, la mitad. Los otros dos pagan ${pontos(BASE_PATAMAR.mangan)} cada uno.`,
      },
    ],
  },
  {
    id: 'dora',
    number: 9,
    title: 'Dora',
    cover: 'Fichas de bonificación que encarecen la mano.',
    pages: [
      {
        id: 'indicador',
        number: '9.1',
        title: 'El indicador y la dora',
        termos: ['dora'],
        blocks: [
          {
            type: 'text',
            md: '¿Recuerdas la ficha volteada en el muro muerto? Es el **indicador**. El indicador no es la dora: la **dora** es la ficha que le sigue. Cada dora en la mano vale 1 han.',
          },
          {
            type: 'image',
            image: 'muroMorto',
            alt: 'Muro abierto visto de frente: robos a la izquierda, la apertura y el muro muerto a la derecha, con el indicador de dora volteado en la 3.ª columna a partir de la apertura.',
            caption: 'El indicador queda volteado en el muro muerto.',
          },
          {
            type: 'hand',
            mpsz: '3m',
            caption: 'Indicador 3 de Man',
            after: '4m',
            afterLabel: 'dora',
          },
          { type: 'tip', md: 'La dora no es un yaku. Sin yaku, no ayuda a ganar.' },
        ],
      },
      {
        id: 'ordem-dora',
        number: '9.2',
        title: 'El orden',
        termos: ['dora'],
        blocks: [
          {
            type: 'text',
            md: 'Cada ficha indica la siguiente. Al final de cada secuencia, la cuenta vuelve al principio. Si dos indicadores apuntan a la misma ficha, cada copia de ella en la mano vale 2 han.',
          },
          { type: 'doraCycles' },
        ],
      },
      {
        id: 'aka-dora',
        number: '9.3',
        title: '5 rojo',
        termos: ['aka-dora'],
        blocks: [
          {
            type: 'text',
            md: 'Cada 5 rojo (Aka dora) vale 1 han más y funciona como un 5 normal en la mano. Si el 5 también es la dora, el 5 rojo vale 2 han. Volteado como indicador, cuenta como un 5 normal.',
          },
          { type: 'hand', mpsz: '0m 0p 0s' },
          {
            type: 'tip',
            md: 'No todas las mesas juegan con los cincos rojos. Acuérdenlo antes de jugar.',
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
            md: 'Quien gana después de declarar **Riichi** revela la ficha que está debajo de cada indicador de dora. Esa es la **Ura-dora**: funciona como un indicador más, solo para quien ganó.',
          },
          { type: 'tip', md: 'Sin Riichi no hay Ura-dora. Es un motivo más para declararlo.' },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'El indicador es el Dragón rojo. ¿Cuál es la dora?',
        hand: '7z',
        options: [
          { label: 'Blanco', mpsz: '5z', correct: true },
          { label: 'Verde', mpsz: '6z' },
          { label: 'Rojo', mpsz: '7z' },
        ],
        answer: 'El Dragón blanco: Rojo → Blanco.',
      },
    ],
  },
  {
    id: 'kan',
    number: 10,
    title: 'Kan',
    cover: 'Cuatro fichas iguales, una ficha más y una dora más.',
    pages: [
      {
        id: 'kan',
        number: '10.1',
        title: 'Los tres kans',
        termos: ['kan'],
        blocks: [
          { type: 'text', md: 'Cuatro fichas iguales. Hay tres maneras de hacer kan:' },
          {
            type: 'text',
            md: '- **Kan abierto**: tienes tres iguales y alguien descarta la cuarta. Vale con cualquier jugador, como el pon.\n- **Kan cerrado**: las cuatro están en tu mano. Muéstralo en la mesa con las dos puntas boca abajo.\n- **Kan agregado**: ya tienes un pon y robas la cuarta. Queda acostada encima de la ficha de lado.',
          },
          {
            type: 'melds',
            items: [
              { mpsz: '8888p', deLado: 1, caption: 'Kan abierto (de enfrente)' },
              { mpsz: '1111m', viradas: [0, 3], caption: 'Kan cerrado' },
              { mpsz: '7777s', deLado: 0, empilhada: true, caption: 'Kan agregado' },
            ],
          },
          {
            type: 'text',
            md: 'El kan abierto y el kan agregado dejan la mano **abierta**. El kan cerrado, hecho solo con fichas de tu mano, mantiene la mano **cerrada**.',
          },
          { type: 'tip', md: 'El kan tiene la misma prioridad que el pon.' },
          { type: 'heading', text: 'Kan en Riichi' },
          {
            type: 'text',
            md: 'Después de declarar Riichi, todavía puedes hacer **kan cerrado**: si ya tenías las otras tres en la mano y ==tú mismo robaste la cuarta== del muro. Solo no vale si el kan cambia tu espera.',
          },
          {
            type: 'tip',
            md: 'Con el descarte de otro jugador **no vale**: en Riichi no se puede hacer kan abierto ni pon, porque la mano ya no puede cambiar.',
          },
          { type: 'heading', text: 'El peligro del kan' },
          {
            type: 'text',
            md: 'Todo kan da ==un indicador de dora más== (el kan dora), y vale para **todos** en la mesa, no solo para quien hizo el kan. Quien gane en Riichi además mira la Ura-dora debajo de él: una oportunidad más de dora.',
          },
          {
            type: 'tip',
            md: 'Por eso, piensa antes de hacer kan: la dora nueva puede encarecer la mano de quien te va a ganar.',
          },
        ],
      },
      {
        id: 'kan-dora',
        number: '10.2',
        title: 'Reposición y kan dora',
        termos: ['kan-dora'],
        blocks: [
          {
            type: 'text',
            md: 'Con cuatro fichas en un grupo, falta una en la mano. Después de cualquier kan, robas una ficha de **reposición** del muro muerto y se voltea un nuevo indicador de dora. Entonces descartas.',
          },
          {
            type: 'image',
            image: 'muroMortoKan',
            alt: 'Muro muerto visto de frente, con las 7 columnas numeradas a partir de la apertura. La ficha de arriba de la columna 1 está en la mesa, sola al lado: es la reposición del kan. En la columna 3 está volteado el indicador de dora y, en la columna 4, el indicador del kan dora.',
            caption:
              'Después de un kan: la reposición sale de la columna 1 y el kan dora se voltea en la 4.',
          },
          {
            type: 'text',
            md: 'Las columnas 1 y 2, junto a la apertura, guardan las **reposiciones del kan**: quien hace kan roba primero la ficha de arriba de la columna 1. Muchas mesas ya bajan esa ficha a la mesa, sola al lado, para que nadie derribe el muro al tomarla.',
          },
          {
            type: 'text',
            md: 'Cada kan voltea un indicador más, el **kan dora**: la ficha de arriba de la columna siguiente (la 4, después la 5…). Funciona igual que el primer indicador.',
          },
          {
            type: 'text',
            md: 'No se puede hacer kan cuando el muro se acabó: no hay ficha de reposición.',
          },
          {
            type: 'tip',
            md: 'El momento de voltear el kan dora depende de la regla. En Mahjong Soul y Tenhou, el del kan cerrado se voltea al instante. El del kan abierto y el del agregado se voltean después de tu descarte.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'Hice kan cerrado. ¿Mi mano sigue cerrada?',
        options: simNao(true),
        answer:
          'Sí. El kan cerrado se hace solo con fichas de tu mano, sin ningún descarte de otro jugador.',
      },
    ],
  },
  {
    id: 'fim-partida',
    number: 5,
    title: 'Fin de la partida',
    cover: 'Empate, el próximo oya y cuándo termina la partida.',
    pages: [
      {
        id: 'empate',
        number: '5.1',
        title: 'Empate',
        termos: ['empate', 'tenpai'],
        blocks: [
          {
            type: 'text',
            md: 'La mano también puede terminar **sin ganador**. Cuando ==solo queda el muro muerto== y nadie completó la mano, termina **empatada**.',
          },
          {
            type: 'text',
            md: 'Cada uno dice si está en tenpai. Quien lo está muestra la mano. Quien no, queda **noten** y puede dejarla boca abajo.',
          },
          {
            type: 'tip',
            md: 'Contando puntos, quien no está en tenpai le paga a quien sí. Lo verás en Honba y empate, en {{onde:pontos}}.',
          },
        ],
      },
      {
        id: 'proxima-mao',
        number: '5.2',
        title: 'La próxima mano',
        termos: ['oya', 'renchan'],
        blocks: [
          {
            type: 'text',
            md: '- Si el oya ganó, o estaba en tenpai en un empate, **sigue siendo oya** y la mano se repite (renchan).\n- Si no, el Este pasa al siguiente jugador.',
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
            md: 'Para empezar, juega un **tonpuusen**: cada jugador es oya al menos una vez. Cuando el último oya pasa el Este, termina la partida.',
          },
          {
            type: 'text',
            md: 'En las primeras partidas, sin contar puntos, gana quien ganó más manos. Cuando empiecen a contar, gana quien tenga más puntos, y la partida también termina si alguien queda con puntos negativos.',
          },
        ],
      },
    ],
    quiz: [
      {
        type: 'quiz',
        question: 'El oya ganó la mano. ¿Quién es el oya de la próxima?',
        options: [
          { label: 'Él mismo', correct: true },
          { label: 'Quien está a su derecha' },
          { label: 'Quien ganó la mano anterior a esa' },
        ],
        answer: 'Él mismo. Cuando el oya gana, sigue siendo oya y la mano se repite.',
      },
      {
        type: 'quiz',
        question:
          'Se acabó el muro y nadie ganó. El oya no estaba en tenpai. ¿Quién es el oya de la próxima?',
        options: [
          { label: 'Él mismo' },
          { label: 'Quien está a su derecha', correct: true },
          { label: 'Quien estaba en tenpai' },
        ],
        answer:
          'Quien está a su derecha. En el empate, el oya solo sigue si estaba en tenpai; si no, el Este pasa al siguiente.',
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
        md: 'En furiten no puedes ganar por ron, solo por tsumo. Vale para ==todas== tus esperas, no solo para la ficha que causó el furiten. Declarar ron en furiten suele ser chombo.',
      },
      {
        type: 'text',
        md: '- **Por los descartes**: alguna ficha que completaría tu mano está entre tus descartes. Dura hasta que cambies tu espera.\n- **Temporal**: dejaste pasar una ficha que completaría tu mano, sin declarar ron. Dura hasta tu próximo descarte.\n- **De Riichi**: después del Riichi, dejaste pasar una ficha que completaría tu mano. Dura hasta el fin de la mano.',
      },
      {
        type: 'tip',
        md: 'Lo que cuenta es la forma de la mano, no el yaku. Si la ficha completaría tu mano, el furiten vale aunque no tuvieras yaku para ganar con ella.',
      },
    ],
  },
  {
    id: 'kuikae',
    section: 'regras',
    title: 'Cambio prohibido (kuikae)',
    blocks: [
      {
        type: 'text',
        md: 'Justo después de un chi o un pon, el descarte de ese mismo turno tiene límites. Cantar solo para cambiar una ficha por otra que cumple la misma función es **kuikae**, y está prohibido.',
      },
      { type: 'heading', text: 'La misma ficha' },
      {
        type: 'text',
        md: 'No puedes descartar una ficha igual a la que acabas de tomar. Vale para chi y para pon.',
      },
      {
        type: 'melds',
        items: [
          {
            mpsz: '555p',
            deLado: 1,
            caption:
              'Pon del 5 de Pin: si aún tienes otro 5 de Pin en la mano, no puede salir ahora',
          },
        ],
      },
      { type: 'heading', text: 'El otro extremo de la secuencia' },
      {
        type: 'text',
        md: 'En un chi con dos fichas vecinas, la ficha del otro extremo también queda prohibida: con ella, la secuencia sería la misma, solo desplazada.',
      },
      {
        type: 'melds',
        items: [
          {
            mpsz: '234m',
            deLado: 0,
            caption: 'Chi del 2 de Man con 3-4: no puedes descartar el 2 ni el 5 de Man',
          },
          {
            mpsz: '867s',
            deLado: 0,
            caption: 'Chi del 8 de Sou con 6-7: no puedes descartar el 8 ni el 5 de Sou',
          },
        ],
      },
      {
        type: 'text',
        md: 'Un chi con la ficha del medio (3 con 2-4) o en un borde cerrado (3 con 1-2) solo prohíbe la ficha igual: no hay otro extremo.',
      },
      { type: 'heading', text: 'Por qué está prohibido' },
      {
        type: 'text',
        md: 'Cantar sirve para avanzar la mano. Con kuikae no avanza, porque la ficha que descartas completaría el mismo grupo. Sin la regla, se podría cantar solo para molestar: cortar el Ippatsu de alguien o cambiar quién roba la última ficha del muro.',
      },
      {
        type: 'tip',
        md: 'Si después del canto solo te quedarían fichas prohibidas para descartar, no puedes cantar. En Mahjong Soul y Tenhou el propio juego lo bloquea. En la mesa, quien hace kuikae queda con la mano muerta: sigue robando y descartando, pero ya no puede ganar la mano. Algunas reglas más antiguas solo prohíben la ficha igual a la que tomaste, así que acuérdenlo antes de jugar.',
      },
      {
        type: 'quiz',
        question:
          'Tienes 5-6 de Pin y haces chi del 4 de Pin. ¿Qué no puedes descartar en ese mismo turno?',
        hand: '56p',
        options: [
          { label: '4 y 7 de Pin', correct: true },
          { label: 'Solo el 4 de Pin' },
          { label: '4 y 6 de Pin' },
        ],
        answer:
          'El 4 y el 7 de Pin. El 4 es la ficha que tomaste; con el 7, el mismo 5-6 formaría 5-6-7, el otro extremo.',
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
        md: 'Todos los yakus, con el han de cada uno con la mano cerrada y abierta. **—** quiere decir que solo vale con la mano cerrada, e **Y** es yakuman. Toca un yaku para ver el ejemplo. Si la mano se puede leer de más de una forma, vale la lectura que da más puntos. Los yakuman no se suman con los yakus comunes.',
      },
      ...grupoYakus('Secuencia', [
        ['pinfu', 'Solo secuencias, pareja sin valor y espera de dos lados'],
        ['iipeikou', 'Dos secuencias iguales del mismo palo'],
        ['ryanpeikou', 'Dos veces dos secuencias iguales'],
        ['sanshoku-doujun', 'La misma secuencia en los tres palos'],
        ['ittsuu', '1-2-3, 4-5-6 y 7-8-9 del mismo palo'],
      ]),
      ...grupoYakus('Tríos', [
        ['toitoi', 'Cuatro tríos y una pareja'],
        ['sanankou', 'Tres tríos formados sin llamar'],
        ['sanshoku-doukou', 'El mismo trío en los tres palos'],
        ['sankantsu', 'Tres kans'],
        ['chiitoitsu', 'Siete parejas diferentes'],
      ]),
      ...grupoYakus('Terminales y honores', [
        ['tanyao', 'Solo fichas del 2 al 8'],
        ['yakuhai', 'Trío de dragón o de viento de valor'],
        ['shousangen', 'Dos tríos de dragón y la pareja del tercero'],
        ['chanta', 'Terminal u honor en todos los grupos y en la pareja'],
        ['junchan', 'Terminal en todos los grupos y en la pareja, sin honores'],
        ['honroutou', 'Solo terminales y honores'],
      ]),
      ...grupoYakus('Palo', [
        ['honitsu', 'Un solo palo, con honores'],
        ['chinitsu', 'Un solo palo, sin honores'],
      ]),
      ...grupoYakus('Otros', [
        ['riichi', 'Declarar tenpai con la mano cerrada'],
        ['double-riichi', 'Riichi ya en el primer descarte'],
        ['ippatsu', 'Ganar antes de tu siguiente descarte tras el Riichi, sin cantos en medio'],
        ['menzen-tsumo', 'Tsumo con la mano cerrada'],
        ['haitei', 'Tsumo con la última ficha del muro'],
        ['houtei', 'Ron en el último descarte'],
        ['rinshan', 'Ganar con la reposición del kan'],
        ['chankan', 'Ron en la ficha que otro agrega al pon'],
      ]),
      ...grupoYakus('Yakuman', [
        ['kokushi', 'Uno de cada terminal y honor, y uno repetido'],
        ['suuankou', 'Cuatro tríos formados sin llamar'],
        ['daisangen', 'Tríos de los tres dragones'],
        ['shousuushii', 'Tres tríos de viento y la pareja del cuarto'],
        ['daisuushii', 'Tríos de los cuatro vientos'],
        ['tsuuiisou', 'Solo honores'],
        ['chinroutou', 'Solo terminales'],
        ['ryuuiisou', 'Solo fichas verdes'],
        ['chuuren', '1-1-1-2-3-4-5-6-7-8-9-9-9 de un palo, más una'],
        ['suukantsu', 'Cuatro kans'],
        ['tenhou', 'El oya gana con las fichas que recibió'],
        ['chiihou', 'Ganar por tsumo en el primer robo'],
      ]),
      { type: 'tip', md: conteudoGuiaBolso('es').notaKazoe },
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
        md: 'Algunos yakus locales dependen de cómo fue la victoria y **no combinan entre sí**. Tsubame gaeshi, Kanburi y Renhou solo valen con Ron. Renkaihou y Toukanhou solo valen con Tsumo en Rinshan. El Renhou ocurre antes de tu primera robada, así que no combina con Riichi, Kanburi ni Maneman. La calculadora apaga el botón que no combina con lo ya marcado, y la Guía de bolsillo muestra las combinaciones de cada uno.',
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
    title: 'Chombo',
    termos: ['chombo'],
    blocks: [
      {
        type: 'text',
        md: 'Falta grave que estropea la mano de una forma que no se puede deshacer. Los casos más comunes:\n- Declarar victoria sin la mano completa, sin yaku o en furiten.\n- Declarar Riichi sin estar en tenpai. Esto se ve cuando la mano termina en empate y tienes que mostrarla.\n- Hacer, después del Riichi, un kan cerrado que cambia la espera.\n- Derribar el muro o revelar la mano por error.',
      },
      {
        type: 'text',
        md: 'La mano se anula y se juega de nuevo, con el mismo número de honba, y quien declaró Riichi en ella recupera su apuesta. La penalización más común es pagar un Mangan como en un tsumo. Si quien se equivocó es ko, paga 4.000 al oya y 2.000 a cada uno de los otros. Si es el oya, paga 4.000 a cada jugador. Los torneos suelen cobrar más, y las mesas casuales pueden no cobrar nada. Acuérdenlo antes de jugar.',
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
        md: 'El contador de **honba** sube uno cuando gana el oya o cuando la mano termina sin ganador, aunque el Este pase al siguiente. El oya pone un palito de 100 en la mesa para marcar cuántos hay. Cuando gana un ko, la cuenta vuelve a cero.',
      },
      {
        type: 'tip',
        md: 'Cada honba hace más cara la próxima victoria. Cuánto, lo verás en {{onde:pontos}}.',
      },
    ],
  },
  {
    id: 'hanchan',
    section: 'regras',
    title: 'Hanchan: Este y Sur',
    blocks: [
      {
        type: 'text',
        md: 'La partida estándar de clubes y torneos. Después de que todos fueron oya en la ronda del Este, empieza la ronda del **Sur** y cada uno es oya otra vez.',
      },
      {
        type: 'text',
        md: 'En la ronda del Sur, el viento de la ronda pasa a ser el Sur. Dura el doble que el tonpuusen y da más tiempo para recuperar puntos.',
      },
      {
        type: 'tip',
        md: '**¿Nadie llegó a 30.000?** En muchas mesas, como en Mahjong Soul y en Tenhou, la partida sigue en la ronda del **Oeste** hasta que alguien pase de 30.000. Según las reglas de la EMA, termina al final del Sur de todos modos.',
      },
    ],
  },
  {
    id: 'sanma',
    section: 'regras',
    title: "Sanma: 3 jugadores",
    blocks: [
      { type: 'text', md: "El **Sanma** es el Riichi con 3 jugadores, muy jugado en Japón y en Mahjong Soul. Las reglas son las mismas, con las diferencias de abajo." },
      { type: 'heading', text: "Fichas" },
      { type: 'text', md: "Se quitan las fichas del **2 al 8 de Man** y quedan 108 fichas. Del Man solo quedan el 1 y el 9. El 5 rojo existe solo en Pin y Sou." },
      { type: 'hand', mpsz: '19m', caption: "Del Man solo quedan estas" },
      { type: 'heading', text: "Mesa y llamadas" },
      { type: 'text', md: "- Solo están los asientos Este, Sur y Oeste.\n- Pon y Kan siguen, ==solo el Chi no existe==.\n- El indicador 1m hace del 9m la dora, y el 9m hace del 1m la dora.\n- No hay empate por cuatro vientos, cuatro Riichi ni ron triple. El Kyuushu kyuuhai sigue." },
      { type: 'heading', text: "Kita (Norte)" },
      { type: 'text', md: "Con un Norte en la mano puedes hacer **Kita**: lo apartas al lado de la mano y robas una reposición. Cada Kita vale **1 dora** (nukidora). No es una llamada, así que la mano sigue cerrada y el Tan'yao no se rompe. Con el indicador Oeste, cada Kita vale 2." },
      { type: 'hand', mpsz: '4z', caption: "Cada Norte apartado vale 1 dora" },
      { type: 'heading', text: "Yakus" },
      { type: 'text', md: "- **Sanshoku doujun** e **Ittsu** de Man son imposibles.\n- Kokushi, Chinroutou y Sanshoku doukou siguen siendo posibles, porque existen 1m y 9m.\n- Después de un Kita ya no hay Tenhou ni Chiihou. Ganar con la reposición del Kita vale Rinshan.\n- En general, el Norte en la mano no es yakuhai." },
      { type: 'heading', text: "Pagos" },
      { type: 'text', md: "En ron se paga lo mismo que con 4. En tsumo solo pagan 2. Con **tsumo-son**, lo más común, la parte del Norte se pierde: un Mangan de ko vale 6.000 en vez de 8.000. Algunas mesas reparten esa parte entre los dos que pagan. El noten suma 2.000 en vez de 3.000." },
      { type: 'tip', md: "Elige 3 jugadores en la configuración de la Calculadora de mano, del Han y Fu, de la Partida y del Torneo para que la app cuente todo como Sanma." },
    ],
  },
  {
    id: 'cinco-blocos',
    section: 'estrategia',
    title: 'Los 5 bloques',
    termos: ['par', 'trinca', 'sequencia'],
    blocks: [
      {
        type: 'text',
        md: 'Una mano completa tiene **5 bloques**: 4 grupos y 1 pareja. Por eso la mano avanza más rápido cuando la mantienes en ==5 bloques==, cada uno listo o en camino.',
      },
      {
        type: 'text',
        md: 'Un bloque es una pareja, un trío, una secuencia o un grupo casi listo (dos fichas esperando la tercera).',
      },
      {
        type: 'hand',
        mpsz: '55p 777s 345m 68p',
        labels: ['Pareja', 'Trío', 'Secuencia', 'Casi listo'],
        caption: 'Los cuatro tipos de bloque',
      },
      { type: 'tip', md: 'No vale para Chiitoitsu (siete parejas) ni para Kokushi musou.' },
      { type: 'heading', text: 'Ejemplo' },
      {
        type: 'hand',
        mpsz: '345m 24m 55p 46p 778s 12s',
        labels: ['Secuencia', 'En el medio', 'Pareja', 'En el medio', 'Casi listo', 'En la punta'],
      },
      {
        type: 'text',
        md: 'Son **6 bloques** para 5 lugares: uno tiene que salir. ¿Cuál?',
      },
      {
        type: 'text',
        md: '- **345m y 55p** ya están listos: se quedan.\n- **778s** acepta el 6, el 7 y el 9 de Sou: excelente, se queda.\n- **24m y 46p** esperan en el medio (3m y 5p), pero pasan a dos lados si llega un 5m, o un 3p o 7p.\n- **12s** espera en la punta y solo el 3s lo completa: es el ==peor bloque==.',
      },
      {
        type: 'hand',
        mpsz: '12s',
        caption: 'Desarma el peor bloque, empezando por el 1 de Sou',
        after: '3s',
        afterLabel: 'solo espera',
      },
    ],
  },
  {
    id: 'eficiencia',
    section: 'estrategia',
    title: 'Los primeros descartes',
    termos: ['tenpai'],
    blocks: [
      {
        type: 'text',
        md: 'Eficiencia es llegar al tenpai más rápido, guardando las formas que aceptan **más fichas**.',
      },
      {
        type: 'text',
        md: 'Con fichas ==sueltas== (sin pareja y sin vecina del mismo palo), descarta en este orden, de la primera a la última:',
      },
      { type: 'hand', mpsz: '234z', caption: '1. Vientos que no son el tuyo ni el de la ronda' },
      { type: 'hand', mpsz: '19m 19p 19s', caption: '2. Terminales (1 y 9)' },
      { type: 'hand', mpsz: '567z', caption: '3. Dragones' },
      { type: 'hand', mpsz: '1z', caption: '4. Por último, tu viento y el de la ronda' },
      {
        type: 'text',
        md: 'Qué vientos valen yaku para ti está en Yakuhai, en {{onde:yakus}}. En la ronda del Este, el **oya** guarda el Este hasta el final: para él, vale doble. Para los demás, el Este vale como un dragón.',
      },
      {
        type: 'tip',
        md: 'No guardes un honor de valor para siempre: si no formó pareja en pocas vueltas, descártalo pronto. Más adelante, puede ser justo la ficha que otro jugador espera.',
      },
    ],
  },
  {
    id: 'ordem-muda',
    section: 'estrategia',
    title: 'Cuándo cambia el orden',
    termos: ['par'],
    blocks: [
      { type: 'heading', text: 'Una pareja no es una ficha suelta' },
      {
        type: 'hand',
        mpsz: '33z 99m',
        caption: 'Una pareja de viento sin valor y una pareja de terminales: se quedan',
      },
      {
        type: 'text',
        md: 'Una pareja de viento sin valor puede ser la pareja de la mano (incluso en Pinfu), y una pareja de terminales también se queda.',
      },
      { type: 'heading', text: 'Un terminal con vecina no está suelto' },
      {
        type: 'hand',
        mpsz: '12p 13s',
        caption: '1 con 2, o 1 con 3: ya es medio grupo',
      },
      { type: 'heading', text: '1 junto al 4' },
      { type: 'hand', mpsz: '14p', caption: '1 junto al 4 (o 9 junto al 6): sale el 1' },
      {
        type: 'text',
        md: 'El 1 casi no ayuda cuando hay un 4 del mismo palo: el 2 y el 3 que le servirían encajan ==mejor en el 4==.',
      },
      { type: 'heading', text: 'Otros casos' },
      {
        type: 'text',
        md: "- **Un honor que ya salió** en los descartes vale menos: quedan menos copias para formar pareja.\n- **Yakus como Hon'itsu y Chanta** cambian todo: ahí honores y terminales pueden valer más.",
      },
    ],
  },
  {
    id: 'contagem-pedras',
    section: 'estrategia',
    title: 'Cuántas fichas ayudan',
    termos: ['ryanmen'],
    blocks: [
      {
        type: 'text',
        md: '¿Por qué ese orden? Cuenta cuántas fichas convierten una ficha suelta en pareja o en medio grupo. Cuantas más fichas ayudan, más vale guardarla.',
      },
      {
        type: 'table',
        headers: ['Ficha suelta', 'Fichas que ayudan'],
        rows: [
          ['Honor', '3 (solo forma pareja)'],
          ['1 y 9', '11'],
          ['2 y 8', '15'],
          ['3 a 7', '19'],
        ],
      },
      {
        type: 'hand',
        mpsz: '1p',
        caption: '1 de Pin suelto: la pareja, el 2 y el 3 ayudan',
        after: '1p2p3p',
        afterLabel: 'ayudan',
      },
      {
        type: 'hand',
        mpsz: '5p',
        caption: '5 de Pin suelto: la pareja y del 3 al 7 ayudan',
        after: '3p4p5p6p7p',
        afterLabel: 'ayudan',
      },
      {
        type: 'tip',
        md: 'Solo por la cuenta: 3 a 7 > 2 y 8 > 1 y 9 > honores. Lo que saca a un honor del final de la fila es el yaku que puede dar.',
      },
      { type: 'heading', text: 'Prefiere esperas de dos lados' },
      {
        type: 'text',
        md: 'Cuenta cuántas fichas sirven: cada tipo tiene 4 copias.',
      },
      {
        type: 'hand',
        mpsz: '23m',
        caption: 'Dos lados: hasta 8 fichas',
        after: '14m',
        afterLabel: 'espera',
      },
      {
        type: 'hand',
        mpsz: '13m',
        caption: 'En el medio: hasta 4 fichas',
        after: '2m',
        afterLabel: 'espera',
      },
      {
        type: 'hand',
        mpsz: '12m',
        caption: 'En la punta: hasta 4 fichas',
        after: '3m',
        afterLabel: 'espera',
      },
    ],
  },
  {
    id: 'quando-defender',
    section: 'estrategia',
    title: '¿Atacar o defender?',
    termos: ['tenpai', 'riichi'],
    blocks: [
      {
        type: 'text',
        md: 'Cuando alguien declara Riichi, mira tu mano. **Shanten** es cuánto falta para el tenpai: en 1-shanten falta una ficha, en 2-shanten faltan dos.',
      },
      {
        type: 'hand',
        mpsz: '234m 567p 11s 345s 78p',
        caption: 'Tenpai: espera el 6 o el 9 de Pin',
      },
      {
        type: 'hand',
        mpsz: '234m 567p 11s 34s 78p 9m',
        caption: '1-shanten: falta una ficha para el tenpai',
      },
      {
        type: 'text',
        md: '- **En tenpai**: atacar suele valer la pena, más aún si eres el oya. Depende de cuánto vale tu mano.\n- **1-shanten**: piensa si muchas fichas todavía ayudan y si la mano vale el riesgo.\n- **2-shanten o más**: ==defiende==.',
      },
      { type: 'heading', text: 'Qué tener en cuenta' },
      {
        type: 'text',
        md: '- ¿Cuántas doras están a la vista?\n- ¿Quien está en tenpai es el oya? Gana 1,5×.\n- ¿Cuánto vale tu mano?\n- ¿Cómo está el marcador?\n- ¿Cuántas manos faltan para que termine la partida?',
      },
    ],
  },
  {
    id: 'defesa',
    section: 'estrategia',
    title: 'Defensa: genbutsu',
    termos: ['riichi', 'furiten'],
    blocks: [
      {
        type: 'text',
        md: 'Defender es descartar la ficha con ==menos probabilidad== de ser la espera de quien declaró Riichi.',
      },
      {
        type: 'text',
        md: 'La base de todo es el **furiten**: si ==cualquier== ficha de su espera está en sus descartes, no puede hacer ron con ninguna de las esperas, ni con las otras.',
      },
      {
        type: 'hand',
        mpsz: '45s',
        caption: 'Si espera con 4-5 de Sou y ya descartó el 3…',
        after: '3s6s',
        afterLabel: 'furiten en ambas',
      },
      { type: 'heading', text: 'Genbutsu: sus fichas' },
      {
        type: 'text',
        md: 'Todo lo que el jugador en Riichi ==ya descartó== es 100% seguro contra él: si esa ficha fuera una de sus esperas, estaría en furiten y no podría hacer ron.',
      },
      {
        type: 'hand',
        mpsz: '9m 2z 7p 3s',
        caption: 'Sus descartes: todas son seguras contra él',
      },
      {
        type: 'tip',
        md: 'Solo el genbutsu es 100%. Suji, kabe y lo demás no garantizan nada, pero son mucho más seguros que una ficha cualquiera.',
      },
      {
        type: 'text',
        md: '**En la duda**: genbutsu primero, después honores que ya salieron dos o tres veces, después suji. Abandonar una mano débil es jugar bien.',
      },
    ],
  },
  {
    id: 'suji',
    section: 'estrategia',
    title: 'Defensa: suji',
    termos: ['furiten', 'ryanmen'],
    blocks: [
      {
        type: 'text',
        md: 'Los descartes de quien declaró Riichi muestran fichas más seguras para ti. Si descartó un 4, el ==1 y el 7== del mismo palo quedan más seguros.',
      },
      {
        type: 'text',
        md: 'Esos números de 3 en 3 (1-4-7, 2-5-8 y 3-6-9) se llaman **suji**. Protegen contra la espera de dos lados, la más común.',
      },
      { type: 'heading', text: 'Por qué funciona' },
      {
        type: 'text',
        md: 'Descartó el **5 de Pin**. Si esperara con 3-4 o con 6-7 de Pin, el 5 sería una de las esperas y estaría en furiten. Entonces ==no espera== con esas dos formas:',
      },
      {
        type: 'hand',
        mpsz: '34p',
        caption: '3-4 esperaría el 2 o el 5: imposible',
        after: '2p5p',
        afterLabel: 'espera',
      },
      {
        type: 'hand',
        mpsz: '67p',
        caption: '6-7 esperaría el 5 o el 8: imposible',
        after: '5p8p',
        afterLabel: 'espera',
      },
      {
        type: 'text',
        md: 'Por eso el **2 y el 8 de Pin** quedan más seguros: son los suji del 5.',
      },
      { type: 'heading', text: 'Las tres referencias' },
      {
        type: 'text',
        md: 'El 4, el 5 y el 6 son las referencias porque cada uno corta ==dos== esperas de dos lados. Si descartó uno de ellos, ==descartar sus suji== es más seguro para ti:',
      },
      {
        type: 'hand',
        mpsz: '4p',
        caption: 'Descartó el 4: puedes soltar el 1 y el 7 con menos riesgo',
        after: '1p7p',
        afterLabel: 'más seguras',
      },
      {
        type: 'hand',
        mpsz: '5p',
        caption: 'Descartó el 5: el 2 y el 8 quedan más seguros',
        after: '2p8p',
        afterLabel: 'más seguras',
      },
      {
        type: 'hand',
        mpsz: '6p',
        caption: 'Descartó el 6: el 3 y el 9 quedan más seguros',
        after: '3p9p',
        afterLabel: 'más seguras',
      },
      { type: 'heading', text: 'Lo que el suji no cubre' },
      {
        type: 'hand',
        mpsz: '46p',
        caption: 'En el medio: 4-6 espera el 5 aun con el 2 y el 8 descartados',
        after: '5p',
        afterLabel: 'espera',
      },
      {
        type: 'text',
        md: 'El suji no protege contra la espera en el medio, en la punta (1-2 esperando 3), en la pareja o en trío.',
      },
      {
        type: 'tip',
        md: 'Justamente ahí está la **trampa de suji**: quien conoce la regla puede esperar en un suji a propósito. Verás cómo, justo después del medio suji.',
      },
      { type: 'heading', text: 'No todo suji es igual' },
      {
        type: 'text',
        md: '- **1 y 9**: los más seguros. Solo se pueden esperar en la pareja o en un trío.\n- **2 y 8**: también se pueden esperar en el medio (el 2 con 1-3).\n- **3 y 7**: los menos seguros. También se pueden esperar en el medio y en la punta (el 3 con 1-2).',
      },
      {
        type: 'text',
        md: 'Cuidado con el suji de la ==ficha del Riichi==. Quien tiene 1-3-5 y suelta el 5 para declarar queda esperando el 2, que parece seguro por el suji del 5. Esto no vale para el 1 y el 9.',
      },
      {
        type: 'tip',
        md: 'Cuantos más suji haya ya en sus descartes, más peligrosas se vuelven las demás fichas: si espera a dos lados, la espera está en uno de los suji que faltan.',
      },
    ],
  },
  {
    id: 'meio-suji',
    section: 'estrategia',
    title: 'Defensa: medio suji y nakasuji',
    termos: ['ryanmen'],
    blocks: [
      { type: 'heading', text: 'Medio suji' },
      {
        type: 'hand',
        mpsz: '8m',
        caption: 'Descartó solo el 8: el 5 queda solo un poco más seguro',
        after: '5m',
        afterLabel: 'medio seguro',
      },
      {
        type: 'text',
        md: 'El 8 corta el 6-7 (que esperaría 5 u 8), pero no el 3-4. Todavía puede esperar el 5 con 3-4:',
      },
      {
        type: 'hand',
        mpsz: '34m',
        caption: 'Todavía posible: espera el 2 o el 5',
        after: '2m5m',
        afterLabel: 'espera',
      },
      {
        type: 'text',
        md: 'Por eso el 5 es solo **medio suji**: más seguro que nada, menos que un suji de verdad.',
      },
      { type: 'heading', text: 'Nakasuji' },
      {
        type: 'hand',
        mpsz: '2s8s',
        caption: 'Descartó el 2 y el 8: el 5 queda tan seguro como un suji',
        after: '5s',
        afterLabel: 'más segura',
      },
      {
        type: 'text',
        md: 'Con el 2 **y** el 8 descartados, el 3-4 y el 6-7 son imposibles. El 5 queda protegido por ambos lados y vale como ==un suji de verdad==. Lo mismo vale para el 4 (1 y 7) y el 6 (3 y 9).',
      },
    ],
  },
  {
    id: 'armadilha-suji',
    section: 'estrategia',
    title: 'Ataque: trampa de suji',
    termos: ['riichi', 'furiten'],
    blocks: [
      {
        type: 'text',
        md: 'Ahora del otro lado de la mesa: quien defiende con suji cree que, si descartaste un 4, el 1 y el 7 son seguros. La **trampa de suji** es ==esperar justo en ese suji==, con una forma que el suji no cubre.',
      },
      { type: 'heading', text: 'Cómo armarla' },
      {
        type: 'hand',
        mpsz: '4m 68m',
        caption: 'Tienes el 4 y el 6-8 de Man',
      },
      {
        type: 'steps',
        items: [
          '**Descarta el señuelo**: el 4 de Man. Para los demás, el 1 y el 7 de Man pasan a parecer seguros.',
          'Quédate con la espera **en el medio**: el 6-8 espera el 7, el suji del 4 que soltaste.',
          'Quien defiende con suji descarta el 7 creyendo que es seguro, y haces ron.',
        ],
      },
      {
        type: 'hand',
        mpsz: '68m',
        caption: 'Espera el 7, que parece seguro por el 4 descartado',
        after: '7m',
        afterLabel: 'espera',
      },
      { type: 'heading', text: 'Otras formas que funcionan' },
      {
        type: 'hand',
        mpsz: '89m',
        caption: 'En la punta: 8-9 espera el 7',
        after: '7m',
        afterLabel: 'espera',
      },
      {
        type: 'hand',
        mpsz: '11m 55p',
        caption: 'Dos parejas: espera el 1 (suji del 4) o el 5 de Pin',
        after: '1m5p',
        afterLabel: 'espera',
      },
      {
        type: 'text',
        md: 'Lo que ==no funciona== es la espera de dos lados: con el 4 descartado, un 5-6 esperando 4 o 7 te deja en **furiten**, porque el 4 está en tus descartes.',
      },
      {
        type: 'hand',
        mpsz: '56m',
        caption: 'Furiten: el 4 es una de las esperas y ya está en tus descartes',
        after: '4m7m',
        afterLabel: 'no sirve',
      },
      { type: 'heading', text: 'El señuelo más fuerte' },
      {
        type: 'text',
        md: 'Declarar Riichi ==con el propio señuelo==. Todos miran la ficha del Riichi y confían en sus suji. Un señuelo descartado temprano también ayuda, porque suma el sotogawa: el lado de afuera parece aún más seguro.',
      },
      { type: 'heading', text: 'Precauciones' },
      {
        type: 'text',
        md: '- La espera en el medio o en la punta acepta **menos fichas** (hasta 4) que la de dos lados (hasta 8). Solo vale cambiar cuando la trampa compensa.\n- Funciona contra quien **defiende con suji**. Los principiantes descartan sin leer tus descartes, y los jugadores experimentados desconfían del suji cerca del Riichi.\n- No exageres: si siempre haces trampa, los demás dejan de confiar en tus suji.',
      },
    ],
  },
  {
    id: 'kabe',
    section: 'estrategia',
    title: 'Defensa: kabe',
    termos: ['ryanmen'],
    blocks: [
      {
        type: 'text',
        md: '**Kabe** quiere decir pared. Es mirar dónde están las 4 copias de una ficha: en los descartes, en las llamadas, en el indicador de dora y en tu mano. Cuando ==las 4 están a la vista==, nadie más puede tener un grupo que la necesite.',
      },
      {
        type: 'hand',
        mpsz: '3333p',
        caption: 'Las 4 copias del 3 de Pin están a la vista',
      },
      {
        type: 'hand',
        mpsz: '23p 34p 13p',
        caption: 'Ninguno de estos es posible: todos necesitan un 3',
      },
      {
        type: 'hand',
        mpsz: '3p',
        caption: 'Detrás de la pared',
        after: '1p2p',
        afterLabel: 'más seguras',
      },
      {
        type: 'tip',
        md: 'El kabe no deja la ficha 100% segura: todavía puede esperarse en la pareja o en un trío. Pero queda mucho más segura que una ficha cualquiera.',
      },
      { type: 'heading', text: 'Qué fichas quedan más seguras' },
      {
        type: 'table',
        headers: ['Las 4 a la vista', 'Quedan más seguras'],
        rows: [
          ['2', '1'],
          ['3', '1 y 2'],
          ['4', '2 y 3'],
          ['5', '3 y 7'],
          ['6', '7 y 8'],
          ['7', '8 y 9'],
          ['8', '9'],
        ],
      },
      {
        type: 'text',
        md: 'Con 2, 3 o 4, las dos fichas de ==antes== quedan más seguras. Con 6, 7 u 8, las dos de ==después==. Con el 5, el 3 y el 7.',
      },
      {
        type: 'hand',
        mpsz: '1111s',
        caption: 'Terminal: las 4 copias a la vista no protegen nada',
      },
      { type: 'heading', text: 'No chance y one chance' },
      {
        type: 'hand',
        mpsz: '6666m',
        caption: 'No chance: las 4 a la vista',
      },
      {
        type: 'hand',
        mpsz: '666m',
        caption: 'One chance: 3 de las 4 a la vista',
      },
      {
        type: 'text',
        md: '- **No chance**: no hay posibilidad de espera de dos lados con ella, y vale también contra la espera en el medio. Es tan seguro como el suji, o más.\n- **One chance**: es menos probable que alguien tenga la última, pero puede tenerla. Vale más al principio y en el medio de la mano; cerca del final, la última copia ya puede estar en la mano de alguien.',
      },
    ],
  },
  {
    id: 'sotogawa',
    section: 'estrategia',
    title: 'Defensa: sotogawa',
    termos: ['riichi'],
    blocks: [
      {
        type: 'text',
        md: '**Sotogawa** es el lado de afuera. Quien descarta una ficha del medio ==muy al principio== (en la primera fila) probablemente no guardaba las fichas entre ella y la punta del palo: si las guardara, le sería útil.',
      },
      {
        type: 'hand',
        mpsz: '233m 334m',
        caption: 'Con uno de estos, no soltaría el 3 de Man temprano',
      },
      {
        type: 'text',
        md: 'Si lo soltó, probablemente ya completó el grupo. Las fichas hasta 2 números de distancia, ==yendo hacia la punta==, quedan un poco más seguras:',
      },
      {
        type: 'hand',
        mpsz: '3m',
        caption: 'Descartó el 3 temprano: el 1 y el 2 (lado de afuera) quedan un poco más seguros',
        after: '1m2m',
        afterLabel: 'más seguras',
      },
      {
        type: 'table',
        headers: ['Descartó temprano', 'Lado de afuera'],
        rows: [
          ['2', '1'],
          ['3', '1 y 2'],
          ['4', '2 y 3'],
          ['5', '3 y 7'],
          ['6', '7 y 8'],
          ['7', '8 y 9'],
          ['8', '9'],
        ],
      },
      {
        type: 'text',
        md: '- Funciona mejor contra quien juega bien: la idea supone que el jugador descarta con eficiencia.\n- Una ficha que es sotogawa **y** suji al mismo tiempo es más segura.\n- No vale para la ficha con la que declaró Riichi, aunque sea temprano.',
      },
      {
        type: 'hand',
        mpsz: '3p5p',
        caption: 'Descartó el 3 y el 5: el 2 es sotogawa del 3 y suji del 5',
        after: '2p',
        afterLabel: 'mucho más segura',
      },
    ],
  },
  {
    id: 'matagi-suji',
    section: 'estrategia',
    title: 'Defensa: matagi suji',
    termos: ['riichi'],
    blocks: [
      {
        type: 'text',
        md: '**Matagi suji** es lo contrario del sotogawa: muestra las fichas ==más peligrosas==. Mira los descartes del final, en especial la ficha con la que declaró Riichi.',
      },
      {
        type: 'hand',
        mpsz: '3m',
        caption: 'Declaró Riichi soltando el 3 de Man',
      },
      {
        type: 'hand',
        mpsz: '233m 334m',
        caption: 'Puede haber salido de uno de estos',
      },
      {
        type: 'hand',
        mpsz: '23m 34m',
        caption: 'Quedó en la mano un 2-3 o un 3-4',
      },
      {
        type: 'hand',
        mpsz: '3m',
        caption: 'Entonces las esperas más probables son 1-4 y 2-5',
        after: '1m4m2m5m',
        afterLabel: 'más peligrosas',
      },
      {
        type: 'text',
        md: 'Vale para cualquier ficha: las peligrosas son las esperas de dos lados que ==pasan por encima== de ella.',
      },
      {
        type: 'tip',
        md: 'No hace falta memorizar el matagi suji. En defensa el orden es genbutsu, después suji y kabe, después sotogawa. El matagi suji ayuda a decidir entre atacar o retroceder.',
      },
      {
        type: 'text',
        md: `Para profundizar: [Suji in mahjong, de NPMahjong](${ARTIGO_SUJI}), en inglés.`,
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
    title: 'Primeras partidas',
    cover: 'Todo lo que necesitas para jugar una ronda, sin yaku y sin contar puntos.',
    modules: ['pedras', 'mesa', 'mao', 'turno', 'fim-partida'].map(modulo),
  },
  {
    id: 'ir-alem',
    number: 2,
    title: 'Para ir más allá',
    cover:
      'Yaku, chombo y honba: las reglas del juego de verdad, todavía sin contar puntos.',
    milestone: {
      title: '¡Ya puedes jugar!',
      md: 'Antes de seguir, ==juega una ronda== (un tonpuusen). Por ahora, sin yaku y sin contar puntos: quien completa la mano gana, y el Este pasa como acabas de ver.\nLo que viste hasta aquí es la **base**. El juego completo va más allá, y los próximos módulos muestran el resto.',
    },
    modules: [
      modulo('yakus'),
      moduloRegras('chombo-honba', 7, 'Chombo y honba', 'El error que anula la mano y la mano que se repite.'),
    ],
  },
  {
    id: 'pontos-parte',
    number: 3,
    title: 'Puntos',
    cover: 'Cuánto vale cada mano, con dora y kan.',
    milestone: {
      title: '¡Juega otra vez!',
      md: 'Antes de los puntos, ==juega una partida== ya con el yaku en juego. Todavía sin contar puntos: anota quién gana cada mano, como en el marcador de una canasta, y al final gana quien ganó más manos.',
    },
    modules: ['pontos', 'dora', 'kan'].map(modulo),
  },
  {
    id: 'aprofundando',
    number: 4,
    title: 'Profundizando',
    cover:
      'Más reglas que también valen en toda partida.',
    modules: [
      moduloRegras('regras', 11, 'Más reglas', 'Detalles que también son parte del juego.'),
    ],
  },
  {
    id: 'estrategia-parte',
    number: 5,
    title: 'Estrategia',
    cover: 'Para jugar mejor: qué descartar y cuándo defenderse.',
    modules: [
      moduloRegras(
        'estrategia',
        12,
        'Estrategia',
        'Para jugar mejor después de las primeras partidas.',
        [
          {
            type: 'quiz',
            question: 'Tu mano tiene 6 bloques. ¿Cuál desarmas primero?',
            hand: '345m 24m 55p 46p 778s 12s',
            options: [
              { label: '1-2 de Sou', mpsz: '12s', correct: true },
              { label: '2-4 de Man', mpsz: '24m' },
              { label: '7-7-8 de Sou', mpsz: '778s' },
            ],
            answer:
              'El 1-2 de Sou. Espera en la punta y solo el 3 de Sou lo completa. El 2-4 de Man todavía puede pasar a dos lados, y el 7-7-8 acepta tres fichas diferentes.',
          },
          {
            type: 'quiz',
            question: 'Robaste y tienes que descartar. ¿Qué ficha sale primero?',
            hand: '234m 9m 55p 678p 45s 79s 4z',
            options: [
              { label: 'Norte', mpsz: '4z', correct: true },
              { label: '9 de Man', mpsz: '9m' },
              { label: '7 de Sou', mpsz: '7s' },
            ],
            answer:
              'El Norte (si no es tu viento ni el de la ronda). Solo puede formar pareja y no vale yaku. El 9 de Man todavía puede formar 7-8-9 y el 7-9 de Sou espera el 8.',
          },
          {
            type: 'quiz',
            question: 'El 1 y el 4 de Pin están solos en el palo. ¿Cuál sale?',
            hand: '14p',
            options: [
              { label: '1 de Pin', mpsz: '1p', correct: true },
              { label: '4 de Pin', mpsz: '4p' },
            ],
            answer:
              'El 1 de Pin. El 2 y el 3 que ayudarían al 1 encajan mejor en el 4, que además acepta el 5 y el 6.',
          },
          {
            type: 'quiz',
            question:
              'Alguien declaró Riichi. Tu mano está en 2-shanten y no vale mucho. ¿Qué haces?',
            options: [{ label: 'Defender', correct: true }, { label: 'Atacar' }],
            answer:
              'Defender. Faltan dos fichas para el tenpai: la probabilidad de llegar antes de pagar su mano es pequeña.',
          },
          {
            type: 'quiz',
            question: 'Descartó solo el 8 de Man. ¿El 5 de Man es suji?',
            hand: '8m',
            options: [{ label: 'Sí, es suji' }, { label: 'No, es solo medio suji', correct: true }],
            answer:
              'Solo medio suji. Todavía puede tener 3-4 de Man esperando el 2 o el 5. Para que el 5 valga como suji de verdad, también tiene que haber salido el 2.',
          },
          {
            type: 'quiz',
            question:
              'Quieres armar una trampa esperando el 7 de Man con 6-8. ¿Qué ficha es el mejor señuelo para descartar?',
            hand: '68m',
            options: [
              { label: '4 de Man', mpsz: '4m', correct: true },
              { label: '5 de Man', mpsz: '5m' },
              { label: '9 de Man', mpsz: '9m' },
            ],
            answer:
              'El 4 de Man. El 7 es suji del 4: quien defiende con suji cree que el 7 es seguro y te lo descarta.',
          },
          {
            type: 'quiz',
            question:
              'Alguien declaró Riichi y las 4 copias del 3 de Pin están a la vista. ¿Cuál de estas es la más segura?',
            hand: '3333p',
            options: [
              { label: '1 de Pin', mpsz: '1p', correct: true },
              { label: '4 de Pin', mpsz: '4p' },
              { label: '6 de Pin', mpsz: '6p' },
            ],
            answer:
              'El 1 de Pin. Solo se esperaría con un 2-3, y con los cuatro 3 a la vista nadie tiene 2-3. El 4 y el 6 todavía pueden esperarse de varias maneras.',
          },
          {
            type: 'quiz',
            question:
              'Eres el oya, en la ronda del Este. Tienes un Este y un Dragón verde sueltos. ¿Cuál guardas por más tiempo?',
            hand: '1z 6z',
            options: [
              { label: 'Este', mpsz: '1z', correct: true },
              { label: 'Verde', mpsz: '6z' },
            ],
            answer:
              'El Este. Para el oya en la ronda del Este, es el viento del asiento y el de la ronda: un trío suyo vale 2 han.',
          },
        ],
      ),
    ],
  },
]

trocarReferencias(tutorialParts)

/** Verbetes do Glossário do app, mais os termos de mesa que só o guia usa. */
const glossary: TermoGlossarioGuia[] = [
  { term: 'Chombo', definition: doGlossario('chombo') },
  { term: 'Dora', definition: doGlossario('dora') },
  { term: 'Fu', definition: doGlossario('fu') },
  { term: 'Furiten', definition: doGlossario('furiten') },
  {
    term: 'Genbutsu',
    definition: 'Ficha que el jugador en Riichi ya descartó: segura contra él.',
  },
  { term: 'Han', definition: doGlossario('han') },
  { term: 'Hanchan', definition: 'Partida estándar, con las rondas del Este y del Sur.' },
  { term: 'Honba', definition: doGlossario('honba') },
  { term: 'Ko', definition: doGlossario('ko') },
  { term: 'Menzen', definition: 'Mano cerrada: sin ningún descarte de otro jugador.' },
  {
    term: 'Muro muerto',
    definition:
      '14 fichas separadas después de la apertura, que no se roban normalmente. Ahí están el indicador de dora y las reposiciones del kan.',
  },
  { term: 'Oya', definition: doGlossario('oya') },
  {
    term: 'Suji',
    definition:
      'Números de 3 en 3 del mismo palo (1-4-7, 2-5-8, 3-6-9). Más seguros contra la espera de dos lados.',
  },
  { term: 'Tenpai', definition: doGlossario('tenpai') },
  { term: 'Tonpuusen', definition: 'Partida corta, solo con la ronda del Este.' },
  { term: 'Yaku', definition: doGlossario('yaku') },
]

export const conteudoEs: ConteudoTutorial = {
  tutorialParts,
  glossary,
  ranks: ['Novato', 'Adepto', 'Veterano', 'Especialista', '1.er dan'],
  ilustracoes: {
    colunaDuasPedras: '1 columna = 2 fichas',
    umaSobreOutra: 'una acostada encima de la otra',
    comprimentoMuro: '17 fichas de largo',
    conteDireitaEsquerda: 'cuenta de derecha a izquierda',
    abertura: 'apertura',
    esquerda: '← izquierda',
    suaDireita: 'tu derecha →',
    voceSentado: 'tú, sentado de frente a tu muro',
    indicadorDora: 'indicador de dora',
    reposicaoKan: 'reposición del kan',
    kanDora: 'kan dora',
    compras: '← robos',
    muroMorto: 'muro muerto (14 fichas)',
    muroMortoCurto: 'muro muerto',
    ponChamada: 'pon (llamada)',
    ordem: 'orden',
    daVez: 'de turnos',
    ventos: { leste: 'Este', sul: 'Sur', oeste: 'Oeste', norte: 'Norte' },
    sufixoOya: ' (oya)',
    dadosExemplo: '2 + 3 = 5 → Este (el oya)',
    dadosExemploCurto: '2 + 3 = 5 → Este',
    direitaLeste: '1 = la derecha del Este',
    contaEsquerda: '← cuenta hacia la izquierda',
    abreDepois: 'abre después de la 5.ª ↘',
    colunasLeste: '5 columnas en el Este',
    colunasSul: '+ 2 en el Sur ↘',
    seusDescartes: 'tus descartes: filas de 6',
  },
}
