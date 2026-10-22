import { DORA_NOTE, parseMpsz, parseMpszGrupos } from '../../../logica/yakus'
import { CiclosDora, PedrasExemplo } from './PedrasExemplo'

const NAIPES = [
  { nome: 'Man', kanji: '萬', apelido: 'Caracteres', mpsz: '123456789m' },
  { nome: 'Pin', kanji: '筒', apelido: 'Círculos', mpsz: '123456789p' },
  { nome: 'Sou', kanji: '索', apelido: 'Bambus', mpsz: '123456789s' },
]

const HONRAS = [
  {
    nome: 'Ventos',
    kanji: '風牌',
    detalhe: 'Ton (Leste), Nan (Sul), Shaa (Oeste), Pei (Norte)',
    mpsz: '1234z',
  },
  {
    nome: 'Dragões',
    kanji: '三元牌',
    detalhe: 'Haku (Branco), Hatsu (Verde), Chun (Vermelho)',
    mpsz: '567z',
  },
]

/** Termos do jogo, na ordem em que costumam aparecer numa partida. */
const TERMOS: { termo: string; kanji: string; texto: string }[] = [
  {
    termo: 'Yaku',
    kanji: '役',
    texto: 'Condição de pontuação. Toda mão precisa de pelo menos um yaku para vencer.',
  },
  {
    termo: 'Han',
    kanji: '翻',
    texto: 'Valor de cada yaku e dora. Quanto mais han, mais pontos.',
  },
  {
    termo: 'Fu',
    kanji: '符',
    texto:
      'Pontos pela forma da mão (trincas, espera, jeito de vencer). Ajustam o valor até 4 han.',
  },
  { termo: 'Tenpai', kanji: '聴牌', texto: 'Falta só uma pedra para completar a mão.' },
  {
    termo: 'Chi',
    kanji: 'チー',
    texto: 'Pegar o descarte do jogador à sua esquerda para formar uma sequência. Abre a mão.',
  },
  {
    termo: 'Pon',
    kanji: 'ポン',
    texto: 'Pegar o descarte de qualquer jogador para formar uma trinca. Abre a mão.',
  },
  {
    termo: 'Kan',
    kanji: 'カン',
    texto:
      'Quatro pedras iguais. Você compra uma pedra de reposição e revela mais um indicador de dora. O kan fechado (as quatro são suas) não abre a mão.',
  },
  {
    termo: 'Riichi',
    kanji: '立直',
    texto: 'Declarar tenpai com a mão fechada, apostando 1.000 pontos. Vale 1 han.',
  },
  { termo: 'Tsumo', kanji: 'ツモ', texto: 'Vencer com uma pedra comprada por você.' },
  { termo: 'Ron', kanji: 'ロン', texto: 'Vencer com o descarte de outro jogador.' },
  {
    termo: 'Furiten',
    kanji: '振聴',
    texto: 'Se você já descartou uma das suas esperas, não pode vencer por ron, só por tsumo.',
  },
  {
    termo: 'Oya',
    kanji: '親',
    texto:
      'O dealer, sempre o Leste. Ganha 1,5× ao vencer e continua dealer se vencer ou ficar em tenpai no empate.',
  },
  { termo: 'Ko', kanji: '子', texto: 'Os outros três jogadores, que não são o dealer.' },
  {
    termo: 'Honba',
    kanji: '本場',
    texto:
      'Contador de rodadas extras (dealer continua ou empate). Cada honba soma 300 pontos à próxima vitória.',
  },
  {
    termo: 'Dora',
    kanji: 'ドラ',
    texto: 'Pedra bônus apontada pelo indicador. Cada uma vale 1 han, mas não é yaku.',
  },
  {
    termo: 'Ura dora',
    kanji: '裏ドラ',
    texto:
      'Pedra embaixo de cada indicador. Só é revelada para quem vence depois de declarar Riichi.',
  },
  {
    termo: 'Aka dora',
    kanji: '赤ドラ',
    texto: 'O 5 vermelho. Vale 1 dora quando a regra está ligada.',
  },
  {
    termo: 'Mangan',
    kanji: '満貫',
    texto:
      'Patamares de pontuação: Mangan (5 han), Haneman (6–7), Baiman (8–10), Sanbaiman (11–12).',
  },
  {
    termo: 'Yakuman',
    kanji: '役満',
    texto: 'Mão máxima: 32.000 pontos (48.000 sendo Leste).',
  },
  {
    termo: 'Chombo',
    kanji: '錯和',
    texto: 'Penalidade por erro grave, como vencer sem yaku ou dar ron em furiten.',
  },
]

/** Pedras do jogo, como o indicador de dora funciona e, por fim, o glossário. */
export default function AbaGlossario() {
  return (
    <>
      <section className="yaku-grupo">
        <h3 className="yaku-grupo__titulo">Naipes</h3>
        <div className="yaku-lista">
          {NAIPES.map((naipe) => (
            <article key={naipe.nome} className="yaku-card">
              <h4 className="yaku-card__nome">
                {naipe.nome}{' '}
                <span className="yaku-card__kanji" lang="ja">
                  {naipe.kanji}
                </span>{' '}
                <span className="yaku-card__apelido">• {naipe.apelido}</span>
              </h4>
              <PedrasExemplo
                grupos={[parseMpsz(naipe.mpsz)]}
                rotulo={`${naipe.nome}: 1 a 9`}
                numerar
              />
            </article>
          ))}
        </div>
        <ul className="yaku-topicos yaku-pedras__nota">
          <li>
            1 e 9 são <strong>terminais</strong>.
          </li>
          <li>
            2 a 8 são <strong>simples</strong>.
          </li>
        </ul>
      </section>

      <section className="yaku-grupo">
        <h3 className="yaku-grupo__titulo">Honras</h3>
        <div className="yaku-lista">
          {HONRAS.map((honra) => (
            <article key={honra.nome} className="yaku-card">
              <h4 className="yaku-card__nome">
                {honra.nome}{' '}
                <span className="yaku-card__kanji" lang="ja">
                  {honra.kanji}
                </span>
              </h4>
              <p className="yaku-card__descricao">{honra.detalhe}</p>
              <PedrasExemplo grupos={[parseMpsz(honra.mpsz)]} rotulo={honra.detalhe} numerar />
            </article>
          ))}
        </div>
      </section>

      <section className="yaku-grupo">
        <h3 className="yaku-grupo__titulo">
          Dora{' '}
          <span className="yaku-card__kanji" lang="ja">
            ドラ
          </span>{' '}
          / Ura-dora{' '}
          <span className="yaku-card__kanji" lang="ja">
            裏ドラ
          </span>
        </h3>
        <article className="yaku-card">
          <ul className="yaku-topicos">
            <li>
              O <strong>indicador</strong> é a pedra virada no muro morto.
            </li>
            <li>
              A <strong>dora</strong> é a pedra seguinte na ordem abaixo (indicador 3 de Man → dora
              4 de Man).
            </li>
            <li>Cada dora na mão vale 1 han.</li>
          </ul>
          <CiclosDora />
          <ul className="yaku-topicos yaku-pedras__nota">
            <li>
              <strong>Kan-dora:</strong> cada kan revela mais um indicador.
            </li>
            <li>
              <strong>Ura-dora:</strong> quem vence com Riichi vira também as pedras de baixo dos
              indicadores.
            </li>
          </ul>
        </article>
        <article className="yaku-card yaku-pedras__aka">
          <h4 className="yaku-card__nome">5 vermelho (aka dora)</h4>
          <ul className="yaku-topicos">
            <li>Cada 5 vermelho vale 1 dora.</li>
            <li>Só conta com a regra Aka dora ligada.</li>
          </ul>
          <PedrasExemplo grupos={parseMpszGrupos('0m0p0s')} rotulo="5 vermelho de Man, Pin e Sou" />
        </article>
        <p className="yaku-nota-dora">
          <i className="fas fa-circle-info" aria-hidden="true" /> {DORA_NOTE}
        </p>
      </section>

      <section className="yaku-grupo">
        <h3 className="yaku-grupo__titulo">Termos</h3>
        <dl className="yaku-glossario">
          {TERMOS.map(({ termo, kanji, texto }) => (
            <div key={termo} className="yaku-glossario__item">
              <dt className="yaku-card__nome">
                {termo}{' '}
                <span className="yaku-card__kanji" lang="ja">
                  {kanji}
                </span>
              </dt>
              <dd className="yaku-card__descricao">{texto}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  )
}
