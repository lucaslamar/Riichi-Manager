import type { ConteudoGuiaBolso } from './tipos'

const IPPATSU = 'Ganar dentro de la primera vuelta después del Riichi, sin llamadas en el medio.'

export const conteudo: ConteudoGuiaBolso = {
  categorias: {
    sequencias: 'Basados en secuencias',
    'terminais-honras': 'Basados en terminales / honores',
    'trincas-pares': 'Basados en parejas / tríos / cuartetos',
    naipes: 'Basados en palos',
    outros: 'Otros yakus',
  },

  yakus: {
    iipeikou: {
      nome: 'Secuencia doble pura',
      descricao: 'Dos secuencias idénticas del mismo palo. Solo mano cerrada.',
    },
    ryanpeikou: {
      nome: 'Dos secuencias dobles puras',
      descricao: 'Dos Iipeikou en la misma mano. Solo mano cerrada. No se acumula con Chiitoitsu.',
    },
    pinfu: {
      nome: 'Mano sin fu',
      descricao:
        '4 secuencias + pareja que no sea de dragón, del viento de la ronda ni del viento de tu asiento, ganando con espera ryanmen. La pareja de los otros vientos sirve. Solo mano cerrada.',
    },
    'sanshoku-doujun': {
      nome: 'Tres secuencias de colores',
      descricao: 'La misma secuencia en los tres palos (ej.: 234 de Man, Pin y Sou).',
    },
    ittsuu: { nome: 'Escalera pura', descricao: '123, 456 y 789 del mismo palo.' },
    tanyao: {
      nome: 'Todo simples',
      descricao:
        'Solo fichas del 2 al 8. Sin terminales y sin honores. Vale abierta según la EMA (kuitan).',
    },
    yakuhai: {
      nome: 'Trío de valor',
      descricao:
        'Trío o cuarteto de dragón, del viento de la ronda (bakaze) o del viento de tu asiento (jikaze). 1 han por trío. Viento doble vale 2.',
    },
    shousangen: {
      nome: 'Tres dragones pequeños',
      descricao: 'Dos tríos de dragón + pareja del tercer dragón (suma también los Yakuhai).',
    },
    daisangen: { nome: 'Tres dragones grandes', descricao: 'Tríos de los tres dragones.' },
    shousuushii: {
      nome: 'Cuatro vientos pequeños',
      descricao: 'Tres tríos de viento + pareja del cuarto viento.',
    },
    daisuushii: { nome: 'Cuatro vientos grandes', descricao: 'Tríos de los cuatro vientos.' },
    chanta: {
      nome: 'Terminales y honores en todo',
      descricao:
        'Todo grupo y la pareja contienen un terminal o un honor. Necesita al menos una secuencia.',
    },
    junchan: {
      nome: 'Terminales en todo',
      descricao: 'Todo grupo y la pareja contienen un terminal. Sin honores.',
    },
    honroutou: {
      nome: 'Terminales y honores',
      descricao: 'Solo terminales y honores (siempre combina con Toitoi o Chiitoitsu).',
    },
    chinroutou: { nome: 'Solo terminales', descricao: 'Mano formada únicamente por 1 y 9.' },
    tsuuiisou: {
      nome: 'Solo honores',
      descricao: 'Mano formada únicamente por vientos y dragones.',
    },
    kokushi: {
      nome: 'Trece huérfanos',
      descricao: 'Uno de cada terminal y honor (13 fichas) + uno repetido. Solo cerrada.',
    },
    chiitoitsu: {
      nome: 'Siete parejas',
      descricao:
        'Exactamente 7 parejas, solo vale si la mano está cerrada. Recuerda que dos parejas iguales no cuentan.',
      dica: 'Vale la pena intentarlo cuando la mano inicial ya tiene 4 parejas. Lo ideal es empezar con 5. Según la mano, puede ser mejor ir a Toitoi.',
    },
    toitoi: { nome: 'Todo tríos', descricao: '4 tríos (o cuartetos) + 1 pareja.' },
    sanankou: {
      nome: 'Tres tríos ocultos',
      descricao: 'Tres tríos formados sin llamar fichas (el resto de la mano puede ser abierto).',
    },
    suuankou: {
      nome: 'Cuatro tríos ocultos',
      descricao: 'Cuatro tríos formados sin llamar fichas. Solo cerrada.',
    },
    'sanshoku-doukou': {
      nome: 'Tres tríos de colores',
      descricao: 'El mismo trío numérico en los tres palos.',
    },
    sankantsu: { nome: 'Tres cuartetos', descricao: 'Tres cuartetos, abiertos o cerrados.' },
    suukantsu: { nome: 'Cuatro cuartetos', descricao: 'Cuatro cuartetos.' },
    honitsu: { nome: 'Medio color', descricao: 'Un único palo mezclado con honores.' },
    chinitsu: { nome: 'Color completo', descricao: 'Un único palo, sin honores.' },
    ryuuiisou: {
      nome: 'Todo verde',
      descricao: 'Solo 2, 3, 4, 6, 8 de Sou y Dragón Verde.',
    },
    chuuren: {
      nome: 'Nueve puertas',
      descricao: '1112345678999 de un palo + cualquier ficha del mismo palo. Solo cerrada.',
    },
    riichi: {
      nome: 'Declarar listo',
      descricao:
        'Declara en tenpai con la mano cerrada, apostando 1.000 puntos. Habilita Ippatsu y Ura-dora.',
    },
    'double-riichi': {
      nome: 'Riichi doble',
      descricao: 'Riichi declarado en el primer descarte, sin llamadas antes.',
      apelidos: ['riichi doble'],
    },
    ippatsu: { nome: 'Ippatsu', descricao: IPPATSU },
    'menzen-tsumo': {
      nome: 'Tsumo cerrado',
      descricao: 'Ganar con ficha robada por ti (tsumo) con la mano totalmente cerrada.',
    },
    haitei: { nome: 'Bajo el mar', descricao: 'Ganar por tsumo con la última ficha del muro.' },
    houtei: { nome: 'Bajo el río', descricao: 'Ganar con el último descarte de la mano.' },
    rinshan: {
      nome: 'Flor en la cima de la montaña',
      descricao: 'Ganar con la ficha de reposición después de declarar un kan.',
    },
    chankan: {
      nome: 'Robar el kan',
      descricao:
        'Ganar con la ficha que otro jugador agrega a un pon para formar kan. Un kan cerrado solo se puede robar para Kokushi.',
    },
    tenhou: { nome: 'Mano celestial', descricao: 'El oya gana con la mano inicial.' },
    chiihou: {
      nome: 'Mano terrenal',
      descricao: 'Un ko gana por tsumo en el primer robo, sin llamadas antes.',
    },
    renhou: {
      nome: 'Mano humana',
      descricao:
        'Ganar por ron antes de tu primer robo, sin llamadas antes. No suma otros yakus ni dora (EMA).',
    },
  },

  notaDora:
    'La dora no es un yaku: solo suma han si la mano ya tiene al menos un yaku. El indicador apunta a la ficha siguiente (9→1, N→E, Rojo→Blanco).',
  notaKazoe:
    '**Kazoe yakuman** no es un yaku: es la mano que suma 13 han o más (yakus y doras) y pasa a valer un Yakuman. No todas las mesas lo usan: sin él, la mano se queda en Sanbaiman.',

  iniciante: [
    { titulo: 'Yakus esenciales de 1 han', subtitulo: 'Empieza por estos' },
    { titulo: 'Yakus fáciles de 2+ han', subtitulo: 'Para el siguiente paso' },
  ],

  ciclosDora: {
    numeros: { titulo: 'Números', detalhe: 'Sube uno y el 9 vuelve al 1.' },
    ventos: { titulo: 'Vientos', detalhe: 'Este → Sur → Oeste → Norte → Este.' },
    dragoes: { titulo: 'Dragones', detalhe: 'Blanco → Verde → Rojo → Blanco.' },
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
    ventos: { Ton: 'Este', Nan: 'Sur', Sha: 'Oeste', Pei: 'Norte' },
    dragoes: { Haku: 'Dragón blanco', Hatsu: 'Dragón verde', Chun: 'Dragón rojo' },
    tituloRodada: 'Viento de la ronda',
    tituloAssento: 'Viento del asiento',
    textoDragao: 'Trío o cuarteto de {{dragao}}. Vale 1 han.',
    textoVentoRodada: 'Trío o cuarteto de {{vento}}, el viento de la ronda actual. Vale 1 han.',
    textoVentoAssento: 'Trío o cuarteto de {{vento}}, el viento de tu asiento. Vale 1 han.',
    dicaVentoDuploRodada:
      'Como este viento también es el de tu asiento, el mismo trío cuenta dos veces (viento doble) y vale 2 han en total.',
    dicaVentoDuploAssento:
      'Como este viento también es el de la ronda, el mismo trío cuenta dos veces (viento doble) y vale 2 han en total.',
  },

  secoes: {
    naipes: {
      titulo: 'Palos',
      intro: 'Fichas numeradas del 1 al 9, en tres palos.',
      aliases: ['palo', 'palos'],
      itens: {
        man: { nome: 'Man', apelido: 'Caracteres', aliases: ['man', 'manzu'] },
        pin: { nome: 'Pin', apelido: 'Círculos', aliases: ['pin', 'pinzu'] },
        sou: { nome: 'Sou', apelido: 'Bambúes', aliases: ['sou', 'souzu'] },
        terminais: {
          nome: 'Terminales y simples',
          topicos: ['1 y 9 son **terminales**.', '2 a 8 son **simples**.'],
          aliases: ['terminal', 'terminales', 'routouhai', 'simples', 'chunchanpai'],
        },
      },
    },
    honras: {
      titulo: 'Honores',
      intro: 'Fichas sin número: vientos y dragones.',
      aliases: ['honor', 'honores', 'jihai'],
      itens: {
        ventos: {
          nome: 'Vientos',
          texto: 'Ton (Este), Nan (Sur), Shaa (Oeste), Pei (Norte)',
          // Sem "este": em espanhol também é o demonstrativo, viraria link em qualquer frase.
          aliases: ['viento', 'vientos', 'kazehai', 'sur', 'oeste', 'norte'],
        },
        dragoes: {
          nome: 'Dragones',
          texto: 'Haku (Blanco), Hatsu (Verde), Chun (Rojo)',
          aliases: ['dragón', 'dragones', 'dragon', 'sangenpai'],
        },
      },
    },
    mao: {
      titulo: 'Formación de la mano',
      intro: 'La mano común tiene 4 grupos (secuencias o tríos) + 1 pareja.',
      rotulosExemplo: ['Secuencia', 'Secuencia', 'Trío', 'Trío', 'Pareja'],
      itens: {
        sequencia: {
          nome: 'Secuencia',
          texto: 'Tres números seguidos del mismo palo (ej.: 3-4-5 de Pin). Puede venir de un chi.',
          aliases: ['secuencia', 'secuencias', 'shuntsu'],
        },
        trinca: {
          nome: 'Trío',
          texto: 'Tres fichas iguales. Puede venir de un pon.',
          aliases: ['trío', 'tríos', 'trio', 'trios', 'koutsu'],
        },
        par: {
          nome: 'Pareja',
          texto: 'Dos fichas iguales.',
          aliases: ['pareja', 'parejas', 'jantou'],
        },
      },
    },
    chamadas: {
      titulo: 'Llamadas',
      itens: {
        chamada: {
          nome: 'Llamada',
          leitura: 'naki',
          texto:
            'Tomar el descarte de otro jugador para formar una combinación con chi, pon o kan. Toda llamada abre la mano, excepto el kan cerrado.',
          aliases: ['llamada', 'llamadas', 'llamar', 'llamó', 'llamando', 'naki'],
        },
        chi: {
          nome: 'Chi',
          texto:
            'Tomar el descarte del jugador a tu izquierda para formar una secuencia. Después de cantar, vale el kuikae.',
          aliases: ['chi', 'chii'],
        },
        pon: {
          nome: 'Pon',
          texto: 'Tomar el descarte de cualquier jugador para formar un trío.',
          aliases: ['pon'],
        },
        kan: {
          nome: 'Kan',
          texto:
            'Cuatro fichas iguales. Robas una ficha de reposición y revelas un indicador de dora más. No se puede hacer kan cuando el muro se acabó: no hay ficha de reposición.',
          topicos: [
            '**Kan abierto** (daiminkan): tienes tres iguales y tomas la cuarta del descarte de otro jugador. Abre la mano.',
            '**Kan añadido** (shouminkan): sumas la cuarta ficha a un Pon que ya tienes. La mano ya estaba abierta, y otro jugador puede ganar con esa ficha (Chankan).',
            '**Kan cerrado** (ankan): las cuatro fichas son tuyas. No abre la mano. Después del Riichi, solo vale si no cambia tu espera.',
          ],
          aliases: [
            'kan',
            'kans',
            'kantsu',
            'cuarteto',
            'cuartetos',
            'kan abierto',
            'kan añadido',
            'kan cerrado',
            'daiminkan',
            'shouminkan',
            'ankan',
          ],
        },
        kuikae: {
          nome: 'Kuikae',
          texto:
            'Después de cantar, no puedes descartar en ese mismo turno la ficha que tomaste. En el Chi tampoco puedes descartar la del otro extremo de la secuencia: con 3-4 en la mano, si tomas el 2 no puedes descartar otro 2 ni el 5. En el Pon, vale para la ficha igual.',
          aliases: ['kuikae'],
        },
        kuitan: {
          nome: 'Kuitan',
          texto:
            "Tan'yao con la mano abierta. Permitido por las reglas de la EMA, pero algunas mesas juegan sin él (kuitan nashi).",
          aliases: ['kuitan'],
        },
      },
    },
    vitoria: {
      titulo: 'Espera y victoria',
      itens: {
        tenpai: {
          nome: 'Tenpai',
          texto: 'Falta solo una ficha para completar la mano.',
          aliases: ['tenpai', 'tempai'],
        },
        ryanmen: {
          nome: 'Ryanmen',
          texto:
            'Espera de dos puntas: dos números seguidos que se completan con la ficha de cualquier lado (3-4 espera 2 o 5).',
          aliases: ['ryanmen'],
        },
        riichi: {
          nome: 'Riichi',
          texto:
            'Declarar tenpai con la mano cerrada, apostando 1.000 puntos. Vale 1 han. Solo se puede declarar con 4 fichas o más en el muro.',
          aliases: ['riichi'],
        },
        ippatsu: { nome: 'Ippatsu', aliases: ['ippatsu', 'ipatsu'] },
        tsumo: {
          nome: 'Tsumo',
          texto: 'Ganar con una ficha robada por ti.',
          aliases: ['tsumo'],
        },
        ron: { nome: 'Ron', texto: 'Ganar con el descarte de otro jugador.', aliases: ['ron'] },
        'ron-duplo': {
          nome: 'Ron doble',
          leitura: 'daburon',
          texto:
            'Dos jugadores hacen ron sobre el mismo descarte y los dos ganan. Quien descartó le paga a cada uno.',
          topicos: [
            '**Atamahane**: algunas mesas no aceptan ron doble y solo gana uno. Gana quien juega primero después de quien descartó.',
            'Con tres ron sobre el mismo descarte, muchas mesas anulan la ronda (sanchahou).',
          ],
          aliases: ['ron doble', 'double ron', 'daburon', 'atamahane'],
        },
        furiten: {
          nome: 'Furiten',
          texto: 'Si ya descartaste una de tus esperas, no puedes ganar por ron, solo por tsumo.',
          topicos: [
            '**Por los descartes**: una ficha que completaría tu mano está entre tus descartes.',
            '**Temporal**: dejaste pasar una ficha que completaría tu mano. Dura hasta tu próximo descarte.',
            '**De Riichi**: después del Riichi, dejaste pasar una ficha que completaría tu mano. Dura hasta el fin de la ronda.',
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
            'Ficha de bonificación señalada por el indicador. Cada una vale 1 han, pero no es un yaku.',
          topicos: [
            'El **indicador** es la ficha volteada en el muro muerto.',
            'La dora es la ficha siguiente en el orden de abajo (indicador 7 de Pin → dora 8 de Pin).',
          ],
          aliases: ['dora', 'doras', 'indicador', 'indicadores', 'indicador de dora'],
        },
        'kan-dora': {
          nome: 'Kan-dora',
          texto: 'Cada kan revela un indicador más.',
          aliases: ['kan-dora', 'kandora', 'kan dora'],
        },
        'ura-dora': {
          nome: 'Ura-dora',
          texto:
            'Ficha debajo de cada indicador. Solo se revela a quien gana después de declarar Riichi.',
          aliases: ['ura-dora', 'uradora', 'ura dora'],
        },
        'aka-dora': {
          nome: 'Aka dora',
          apelido: '5 rojo',
          texto: 'Cada 5 rojo vale 1 dora. Solo cuenta con la regla Aka dora activada.',
          aliases: [
            'aka dora',
            'aka-dora',
            'akadora',
            '5 rojo',
            '5 rojos',
            'cinco rojo',
            'cincos rojos',
          ],
        },
      },
    },
    pontuacao: {
      titulo: 'Puntuación',
      itens: {
        yaku: {
          nome: 'Yaku',
          texto: 'Condición de puntuación. Toda mano necesita al menos un yaku para ganar.',
          aliases: ['yaku', 'yakus'],
        },
        han: {
          nome: 'Han',
          texto: 'Valor de cada yaku y dora. Cuanto más han, más puntos.',
          aliases: ['han'],
        },
        fu: {
          nome: 'Fu',
          texto:
            'Puntos por la forma de la mano (tríos, espera, manera de ganar). Ajustan el valor hasta 4 han.',
          aliases: ['fu'],
        },
      },
    },
    patamares: {
      titulo: 'Niveles de puntuación',
      aliases: ['nivel', 'niveles'],
      itens: {
        mangan: {
          nome: 'Mangan',
          texto:
            '5 han, o 4 han con 40 fu o más, o 3 han con 70 fu o más. Vale {{ko}} ({{oya}} siendo oya).',
          aliases: ['mangan', 'mangans'],
        },
        haneman: {
          nome: 'Haneman',
          texto: '6 o 7 han. Vale {{ko}} ({{oya}} siendo oya).',
          aliases: ['haneman', 'hanemans'],
        },
        baiman: {
          nome: 'Baiman',
          texto: '8 a 10 han. Vale {{ko}} ({{oya}} siendo oya).',
          aliases: ['baiman', 'baimans'],
        },
        sanbaiman: {
          nome: 'Sanbaiman',
          texto: '11 o 12 han. Vale {{ko}} ({{oya}} siendo oya).',
          aliases: ['sanbaiman', 'sanbaimans'],
        },
        yakuman: {
          nome: 'Yakuman',
          texto: 'Mano máxima. Vale {{ko}} ({{oya}} siendo oya).',
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
            'Quien reparte, siempre el Este. Gana 1,5× al ganar. Si gana o queda en tenpai en el empate, hace renchan.',
          aliases: ['oya', 'dealer'],
        },
        renchan: {
          nome: 'Renchan',
          texto:
            'Cuando el oya sigue como tal en la mano siguiente. Ocurre si gana o si queda en tenpai en un empate. El viento de los jugadores no rota y el contador de honba sube.',
          aliases: ['renchan'],
        },
        ko: {
          nome: 'Ko',
          texto: 'Los otros tres jugadores, que no son el oya.',
          aliases: ['ko'],
        },
        honba: {
          nome: 'Honba',
          texto:
            'Contador de manos extra. Sube con cada renchan o empate y vuelve a cero cuando gana un ko. Cada honba suma 300 puntos al próximo ganador (en tsumo, 100 de cada jugador).',
          aliases: ['honba', 'honbas'],
        },
        empate: {
          nome: 'Empate / Ryuukyoku',
          texto: 'La ronda termina sin ganador cuando se acaba el muro.',
          aliases: ['empate', 'empates', 'ryuukyoku'],
        },
        'empate-abortivo': {
          nome: 'Empate abortivo',
          leitura: 'tochuu ryuukyoku',
          texto:
            'La ronda se anula antes de que se acabe el muro. El oya sigue y el honba sube. Las reglas de la EMA no usan empate abortivo, pero muchas mesas sí. Los casos comunes:',
          topicos: [
            '**Kyuushu kyuuhai**: 9 terminales u honores diferentes en la mano inicial. El jugador puede anular la ronda.',
            '**Suufon renda**: los cuatro jugadores descartan el mismo viento en la primera vuelta.',
            '**Suucha riichi**: los cuatro jugadores declaran Riichi.',
            '**Suukaikan**: cuatro kans de jugadores diferentes.',
            '**Sanchahou**: tres jugadores hacen ron sobre el mismo descarte.',
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
          texto: 'Penalización por un error grave, como ganar sin yaku o hacer ron en furiten.',
          aliases: ['chombo'],
        },
      },
    },
    regras: {
      titulo: 'Reglas y entidades',
      itens: {
        ema: {
          nome: 'EMA',
          texto:
            'European Mahjong Association, entidad que organiza el mahjong competitivo en Europa. Publica el RCR (Riichi Competition Rules), reglamento de Riichi usado como referencia por muchos clubes fuera de Japón.',
          aliases: ['ema', 'rcr'],
        },
        'm-league': {
          nome: 'M.League',
          texto:
            'Liga profesional de Riichi de Japón, creada en 2018. Equipos patrocinados reúnen a jugadores profesionales de varias asociaciones, y las partidas se transmiten en vivo, con narración y cámaras que muestran la mano de cada uno. Es la mejor vitrina para ver juego de alto nivel.',
          aliases: ['m.league', 'm league', 'mleague'],
        },
      },
    },
  },
}
