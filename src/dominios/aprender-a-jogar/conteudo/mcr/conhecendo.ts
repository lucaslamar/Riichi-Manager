/** Partes 1 e 2: o jogo, as pedras e a mesa, para quem nunca jogou. */
import type { TutorialPart } from '../tipos'
import { criarModulo, pagina, quiz, texto, type Traduzir } from './auxiliares'

export function parteConhecendo(t: Traduzir): TutorialPart {
  return {
    id: 'mcr-parte-1',
    number: 1,
    title: t('tutorial.mcr.parte1.titulo'),
    cover: t('tutorial.mcr.parte1.capa'),
    modules: [
      criarModulo(
        'mcr-o-que-e',
        1,
        t('tutorial.mcr.mcr.titulo'),
        t('tutorial.mcr.mcr.capa'),
        [
          pagina(t('tutorial.mcr.mcr.regras'), [
            texto(t('tutorial.mcr.mcr.oficial')),
            texto(t('tutorial.mcr.mcr.numeros')),
          ]),
          pagina(t('tutorial.mcr.mcr.comoE'), [
            texto(t('tutorial.mcr.mcr.resumo')),
            { type: 'tip', md: t('tutorial.mcr.mcr.dica') },
          ]),
        ],
        [
          quiz(t, 'tutorial.mcr.mcr.q1', 3, 2),
          quiz(t, 'tutorial.mcr.mcr.q2', 3, 0),
          quiz(t, 'tutorial.mcr.mcr.q3', 3, 1),
        ],
      ),
      criarModulo(
        'mcr-pecas',
        2,
        t('tutorial.mcr.pecas.titulo'),
        t('tutorial.mcr.pecas.capa'),
        [
          pagina(t('tutorial.mcr.pecas.naipes'), [
            texto(t('tutorial.mcr.pecas.naipesTexto')),
            { type: 'hand', mpsz: '123456789m', caption: t('tutorial.mcr.pecas.caracteres') },
            { type: 'hand', mpsz: '123456789p', caption: t('tutorial.mcr.pecas.circulos') },
            { type: 'hand', mpsz: '123456789s', caption: t('tutorial.mcr.pecas.bambus') },
          ]),
          pagina(t('tutorial.mcr.pecas.honras'), [
            texto(t('tutorial.mcr.pecas.honrasTexto')),
            { type: 'hand', mpsz: '1234z', caption: t('tutorial.mcr.pecas.ventos') },
            { type: 'hand', mpsz: '765z', caption: t('tutorial.mcr.pecas.dragoes') },
          ]),
          pagina(t('tutorial.mcr.pecas.flores'), [
            { type: 'flowers', caption: t('tutorial.mcr.pecas.floresLegenda') },
            texto(t('tutorial.mcr.pecas.floresTexto')),
          ]),
          pagina(t('tutorial.mcr.pecas.grupos'), [
            { type: 'hand', mpsz: '19m 19p 19s', caption: t('tutorial.mcr.pecas.terminais') },
            { type: 'hand', mpsz: '1234z 765z', caption: t('tutorial.mcr.pecas.honrasLegenda') },
            { type: 'hand', mpsz: '2345678m', caption: t('tutorial.mcr.pecas.simples') },
          ]),
        ],
        [
          quiz(t, 'tutorial.mcr.pecas.q1', 3, 2),
          quiz(t, 'tutorial.mcr.pecas.q2', 3, 0),
          quiz(t, 'tutorial.mcr.pecas.q3', 3, 2),
        ],
      ),
      criarModulo(
        'mcr-objetivo',
        3,
        t('tutorial.mcr.objetivo.titulo'),
        t('tutorial.mcr.objetivo.capa'),
        [
          pagina(t('tutorial.mcr.objetivo.forma'), [
            texto(t('tutorial.mcr.objetivo.formaTexto')),
            {
              type: 'hand',
              mpsz: '123m 456p 789s 777z 55m',
              labels: [
                t('tutorial.mcr.objetivo.sequencia'),
                t('tutorial.mcr.objetivo.sequencia2'),
                t('tutorial.mcr.objetivo.sequencia3'),
                t('tutorial.mcr.objetivo.trinca'),
                t('tutorial.mcr.objetivo.par'),
              ],
            },
            texto(t('tutorial.mcr.objetivo.especiais')),
          ]),
          pagina(t('tutorial.mcr.objetivo.minimo'), [
            texto(t('tutorial.mcr.objetivo.minimoTexto')),
            { type: 'fans', ids: [39] },
          ]),
          pagina(t('tutorial.mcr.objetivo.especial'), [
            texto(t('tutorial.mcr.objetivo.especialTexto')),
            { type: 'fans', ids: [19] },
          ]),
        ],
        [
          quiz(t, 'tutorial.mcr.objetivo.q1', 3, 0),
          quiz(t, 'tutorial.mcr.objetivo.q2', 2, 1),
          quiz(t, 'tutorial.mcr.objetivo.q3', 3, 1),
        ],
      ),
    ],
  }
}

export function partePreparando(t: Traduzir): TutorialPart {
  return {
    id: 'mcr-parte-2',
    number: 2,
    title: t('tutorial.mcr.parte2.titulo'),
    cover: t('tutorial.mcr.parte2.capa'),
    milestone: { title: t('tutorial.mcr.parte2.marco'), md: t('tutorial.mcr.parte2.marcoTexto') },
    modules: [
      criarModulo(
        'mcr-sorteio',
        4,
        t('tutorial.mcr.sorteio.titulo'),
        t('tutorial.mcr.sorteio.capa'),
        [
          pagina(t('tutorial.mcr.sorteio.sortear'), [
            {
              type: 'steps',
              items: [
                t('tutorial.mcr.sorteio.passo1'),
                t('tutorial.mcr.sorteio.passo2'),
                t('tutorial.mcr.sorteio.passo3'),
                t('tutorial.mcr.sorteio.passo4'),
              ],
            },
            { type: 'hand', mpsz: '1234z' },
            { type: 'appLink', tool: 'sorteador', label: t('tutorial.mcr.sorteio.abrir') },
          ]),
          pagina(t('tutorial.mcr.sorteio.assentos'), [
            texto(t('tutorial.mcr.sorteio.assentosTexto')),
            { type: 'image', image: 'mcrQuadrado', alt: t('tutorial.mcr.sorteio.assentosAlt') },
          ]),
        ],
        [
          quiz(t, 'tutorial.mcr.sorteio.q1', 3, 1),
          quiz(t, 'tutorial.mcr.sorteio.q2', 3, 0),
          quiz(t, 'tutorial.mcr.sorteio.q3', 3, 2),
        ],
      ),
      criarModulo(
        'mcr-muro',
        5,
        t('tutorial.mcr.muro.titulo'),
        t('tutorial.mcr.muro.capa'),
        [
          pagina(t('tutorial.mcr.muro.passos'), [
            {
              type: 'steps',
              items: [
                {
                  md: t('tutorial.mcr.muro.passo1'),
                  image: 'mcrEmbaralhar',
                  alt: t('tutorial.mcr.muro.alt1'),
                },
                {
                  md: t('tutorial.mcr.muro.passo2'),
                  image: 'mcrPilhas',
                  alt: t('tutorial.mcr.muro.alt2'),
                },
                {
                  md: t('tutorial.mcr.muro.passo3'),
                  image: 'mcrQuadrado',
                  alt: t('tutorial.mcr.muro.alt3'),
                },
              ],
            },
          ]),
          pagina(t('tutorial.mcr.muro.piso'), [texto(t('tutorial.mcr.muro.pisoTexto'))]),
        ],
        [
          quiz(t, 'tutorial.mcr.muro.q1', 3, 1),
          quiz(t, 'tutorial.mcr.muro.q2', 3, 0),
          quiz(t, 'tutorial.mcr.muro.q3', 3, 1),
        ],
      ),
      criarModulo(
        'mcr-distribuicao',
        6,
        t('tutorial.mcr.distribuicao.titulo'),
        t('tutorial.mcr.distribuicao.capa'),
        [
          pagina(t('tutorial.mcr.distribuicao.abrir'), [
            {
              type: 'steps',
              items: [
                t('tutorial.mcr.distribuicao.dado1'),
                t('tutorial.mcr.distribuicao.dado2'),
                t('tutorial.mcr.distribuicao.dado3'),
              ],
            },
            {
              type: 'image',
              image: 'mcrAbertura',
              alt: t('tutorial.mcr.distribuicao.aberturaAlt'),
            },
            texto(t('tutorial.mcr.distribuicao.sentido')),
          ]),
          pagina(t('tutorial.mcr.distribuicao.distribuir'), [
            texto(t('tutorial.mcr.distribuicao.distribuirTexto')),
            {
              type: 'image',
              image: 'mcrDistribuicao',
              alt: t('tutorial.mcr.distribuicao.voltasAlt'),
            },
          ]),
          pagina(t('tutorial.mcr.distribuicao.ultima'), [
            texto(t('tutorial.mcr.distribuicao.ultimaTexto')),
            {
              type: 'image',
              image: 'mcrUltimaVolta',
              alt: t('tutorial.mcr.distribuicao.ultimaAlt'),
            },
            texto(t('tutorial.mcr.distribuicao.inicio')),
          ]),
        ],
        [
          quiz(t, 'tutorial.mcr.distribuicao.q1', 3, 2),
          quiz(t, 'tutorial.mcr.distribuicao.q2', 2, 0),
          quiz(t, 'tutorial.mcr.distribuicao.q3', 3, 1),
        ],
      ),
      criarModulo(
        'mcr-flores',
        7,
        t('tutorial.mcr.flores.titulo'),
        t('tutorial.mcr.flores.capa'),
        [
          pagina(t('tutorial.mcr.flores.repor'), [
            { type: 'flowers' },
            {
              type: 'steps',
              items: [
                t('tutorial.mcr.flores.passo1'),
                t('tutorial.mcr.flores.passo2'),
                t('tutorial.mcr.flores.passo3'),
                t('tutorial.mcr.flores.passo4'),
              ],
            },
            { type: 'tip', md: t('tutorial.mcr.flores.dica') },
          ]),
        ],
        [
          quiz(t, 'tutorial.mcr.flores.q1', 3, 1),
          quiz(t, 'tutorial.mcr.flores.q2', 3, 0),
          quiz(t, 'tutorial.mcr.flores.q3', 2, 1),
        ],
      ),
    ],
  }
}
