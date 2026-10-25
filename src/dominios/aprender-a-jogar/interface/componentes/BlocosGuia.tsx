import { Fragment, useState, type ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { PedraSvg } from '@/dominios/calculadora-mao/interface/compartilhado/componentes/PedraSvg'
import { nomePedraAcessivel } from '@/dominios/calculadora-mao/interface/constantes'
import BlocoDica from '@/dominios/calculadora-mao/interface/modais/glossario/BlocoDica'
import TextoGlossario from '@/dominios/calculadora-mao/interface/modais/glossario/TextoGlossario'
import {
  CiclosDora,
  MaoRotulada,
  PedrasExemplo,
} from '@/dominios/calculadora-mao/interface/modais/yakus/PedrasExemplo'
import ModalTermo from '@/dominios/calculadora-mao/interface/modais/glossario/ModalTermo'
import BotaoTutorialHanFu from '@/dominios/calculadora-han-fu/interface/modais/tutorial-han-fu/BotaoTutorialHanFu'
import { dividirTextoGlossario } from '@/dominios/calculadora-mao/logica/glossario'
import { parseMpsz, parseMpszGrupos } from '@/dominios/calculadora-mao/logica/yakus'
import type {
  CartaoGuia,
  ChamadaGuia,
  FerramentaGuia,
  OpcaoQuiz,
  PassoGuia,
  TutorialBlock,
} from '../../conteudo/tipos'
import IlustracaoGuia from './IlustracaoGuia'
import PalitosGuia from './PalitosGuia'

/**
 * Termos do glossário que viram link numa página: só a primeira vez que
 * aparecem na página inteira (não a cada parágrafo), menos os que a própria
 * página explica. Devolve, para cada texto, os termos que não viram link nele.
 */
function criarLigadorTermos(termosDaPagina: string[] = []) {
  const vistos = new Set(termosDaPagina)
  return (texto: string) => {
    const ignorar = [...vistos]
    for (const { termo } of dividirTextoGlossario(texto, ignorar)) if (termo) vistos.add(termo)
    return ignorar
  }
}

type Ligador = ReturnType<typeof criarLigadorTermos>

/*
 * Os textos são montados por funções (não componentes) chamadas no render de
 * BlocosGuia, na ordem da página: assim o ligador vê os termos na ordem certa
 * e começa do zero a cada render.
 */

const EXPRESSAO_LINK = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g

/**
 * Uma linha: `==palavra-chave==` em vermelho, links externos em markdown e o
 * resto com os termos do glossário.
 */
function linhaTexto(texto: string, ligar: Ligador): ReactNode {
  if (!texto.includes('==')) return trechoTexto(texto, ligar)
  return texto.split('==').map((parte, indice) =>
    indice % 2 === 1 ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: texto fixo
      <mark key={indice} className="guia-chave">
        {trechoTexto(parte, ligar)}
      </mark>
    ) : (
      // biome-ignore lint/suspicious/noArrayIndexKey: texto fixo
      <Fragment key={indice}>{trechoTexto(parte, ligar)}</Fragment>
    ),
  )
}

/** Links externos em markdown e o resto com os termos do glossário. */
function trechoTexto(texto: string, ligar: Ligador): ReactNode {
  const partes: ReactNode[] = []
  let inicio = 0
  for (const encontro of texto.matchAll(EXPRESSAO_LINK)) {
    const posicao = encontro.index ?? 0
    if (posicao > inicio) {
      const trecho = texto.slice(inicio, posicao)
      partes.push(<TextoGlossario key={inicio} texto={trecho} ignorar={ligar(trecho)} />)
    }
    partes.push(
      // Nova aba, URL limpa (sem parâmetros de rastreio).
      <a key={posicao} href={encontro[2]} target="_blank" rel="noopener noreferrer">
        {encontro[1]}
      </a>,
    )
    inicio = posicao + encontro[0].length
  }
  if (inicio < texto.length) {
    const trecho = texto.slice(inicio)
    partes.push(<TextoGlossario key={inicio} texto={trecho} ignorar={ligar(trecho)} />)
  }
  return partes
}

/** Texto com parágrafos e listas: linha com "- " vira item. */
function textoGuia(md: string, ligar: Ligador, chave: number): ReactNode {
  const grupos: { lista: boolean; linhas: string[] }[] = []
  for (const linha of md.split('\n')) {
    const lista = linha.startsWith('- ')
    const ultimo = grupos[grupos.length - 1]
    const conteudo = lista ? linha.slice(2) : linha
    if (lista && ultimo?.lista) ultimo.linhas.push(conteudo)
    else grupos.push({ lista, linhas: [conteudo] })
  }
  return (
    <Fragment key={chave}>
      {grupos.map((grupo, indice) =>
        grupo.lista ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: texto fixo
          <ul key={indice} className="guia-lista">
            {grupo.linhas.map((linha, indiceLinha) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: texto fixo
              <li key={indiceLinha}>{linhaTexto(linha, ligar)}</li>
            ))}
          </ul>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: texto fixo
          <p key={indice} className="guia-paragrafo">
            {linhaTexto(grupo.linhas[0], ligar)}
          </p>
        ),
      )}
    </Fragment>
  )
}

/** Negrito `**…**` sem links (células de tabela). */
function TextoSimples({ md }: { md: string }) {
  return (
    <>
      {md.split('**').map((parte, indice) =>
        indice % 2 === 1 ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: texto fixo
          <strong key={indice}>{parte}</strong>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: texto fixo
          <Fragment key={indice}>{parte}</Fragment>
        ),
      )}
    </>
  )
}

const nomesPedras = (mpsz: string) => parseMpsz(mpsz).map(nomePedraAcessivel)

/** Pedras grandes e centralizadas; quebram linha entre grupos, nunca no meio. */
export function MaoGuia({
  mpsz,
  caption,
  after,
  afterLabel = '',
  numbered = false,
  labels,
}: {
  mpsz: string
  caption?: string
  after?: string
  afterLabel?: string
  numbered?: boolean
  labels?: string[]
}) {
  const { t } = useI18n()
  // Grupos rotulados "Espera" (1, 2…): ficam em vermelho pelo CSS (data-espera).
  const esperas = labels
    ?.map((rotulo, indice) => (rotulo.toLowerCase() === 'espera' ? indice + 1 : 0))
    .filter(Boolean)
    .join(' ')
  return (
    <figure className="guia-mao" data-espera={esperas || undefined}>
      <div className="guia-mao__linha">
        {labels ? (
          // Mão com um rótulo embaixo de cada grupo, a mesma do Guia de bolso.
          <MaoRotulada grupos={parseMpszGrupos(mpsz)} rotulos={labels} />
        ) : (
          <PedrasExemplo
            grupos={parseMpszGrupos(mpsz)}
            rotulo={nomesPedras(mpsz).join(', ')}
            numerar={numbered}
          />
        )}
        {after && (
          <span className="guia-mao__resultado">
            <span className="guia-mao__seta" aria-hidden="true">
              <i className="fas fa-arrow-right" />
              {afterLabel}
            </span>
            <PedrasExemplo
              // Cada pedra separada: são alternativas, não um grupo.
              grupos={parseMpsz(after).map((pedra) => [pedra])}
              rotulo={`${afterLabel}: ${nomesPedras(after).join(` ${t('learn.or')} `)}`}
            />
          </span>
        )}
      </div>
      {caption && <figcaption className="guia-mao__legenda">{caption}</figcaption>}
    </figure>
  )
}

/**
 * Chamadas abertas como ficam na mesa: a pedra pegada de lado, apontando para
 * quem descartou; no kan fechado, as pontas viradas; no kan adicionado, a 4ª
 * pedra deitada em cima da pedra de lado.
 */
function ChamadasGuia({ itens }: { itens: ChamadaGuia[] }) {
  return (
    <div className="guia-chamadas">
      {itens.map((chamada, indiceChamada) => {
        const pedras = parseMpsz(chamada.mpsz)
        // No kan adicionado a 4ª pedra não entra na fileira: fica em cima da de lado.
        const fileira = chamada.empilhada ? pedras.slice(0, 3) : pedras
        const rotulo = `${chamada.caption}: ${pedras.map(nomePedraAcessivel).join(', ')}`
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: exemplos fixos
          <figure key={indiceChamada} className="guia-chamada">
            <span className="guia-chamada__pedras" role="img" aria-label={rotulo}>
              {fileira.map((pedra, indice) => {
                const deLado = indice === chamada.deLado
                const virada = chamada.viradas?.includes(indice) ?? false
                return (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: pedras fixas
                    key={indice}
                    className={`guia-chamada__coluna${deLado ? ' guia-chamada__coluna--lado' : ''}`}
                  >
                    {deLado && chamada.empilhada && (
                      <span className="guia-chamada__pedra guia-chamada__pedra--lado">
                        <PedraSvg pedra={pedras[3]} deLado />
                      </span>
                    )}
                    <span
                      className={`guia-chamada__pedra${deLado ? ' guia-chamada__pedra--lado' : ''}`}
                    >
                      <PedraSvg pedra={pedra} virada={virada} deLado={deLado} />
                    </span>
                  </span>
                )
              })}
            </span>
            <figcaption className="guia-mao__legenda">{chamada.caption}</figcaption>
          </figure>
        )
      })}
    </div>
  )
}

function QuizGuia({
  pergunta,
  resposta,
  hand,
  opcoes,
}: {
  pergunta: ReactNode
  resposta: ReactNode
  hand?: string
  opcoes?: OpcaoQuiz[]
}) {
  const { t } = useI18n()
  // Uma escolha só: na hora aparecem a certa (em verde), a escolhida errada
  // (em vermelho) e a explicação.
  const [escolhida, setEscolhida] = useState<number | null>(null)
  const [aberta, setAberta] = useState(false)
  const respondida = aberta || escolhida !== null
  const acertou = escolhida !== null && !!opcoes?.[escolhida]?.correct
  const certa = opcoes?.find((opcao) => opcao.correct)

  return (
    <div className="guia-quiz">
      <p className="guia-quiz__pergunta">{pergunta}</p>
      {hand && <MaoGuia mpsz={hand} />}
      {opcoes && (
        <div className="guia-quiz__opcoes" role="group" aria-label={t('learn.quizOptions')}>
          {opcoes.map((opcao, indice) => {
            const errada = respondida && indice === escolhida && !opcao.correct
            const certa = respondida && opcao.correct
            return (
              <button
                // biome-ignore lint/suspicious/noArrayIndexKey: opções fixas
                key={indice}
                type="button"
                className={`guia-quiz__opcao${certa ? ' guia-quiz__opcao--certa' : ''}${
                  errada ? ' guia-quiz__opcao--errada' : ''
                }`}
                disabled={respondida}
                onClick={() => setEscolhida(indice)}
              >
                {opcao.mpsz && (
                  <PedrasExemplo
                    grupos={[parseMpsz(opcao.mpsz)]}
                    rotulo={nomesPedras(opcao.mpsz).join(', ')}
                  />
                )}
                {opcao.label && <span>{opcao.label}</span>}
                {(certa || errada) && (
                  <i
                    className={`fas ${certa ? 'fa-circle-check' : 'fa-circle-xmark'} guia-quiz__marca`}
                    aria-label={certa ? t('learn.quizRight') : t('learn.quizWrong')}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
      <div className="guia-quiz__retorno" role="status">
        {respondida && (
          <div className="guia-quiz__resposta">
            {escolhida !== null && (
              <p className={`guia-quiz__veredito${acertou ? ' guia-quiz__veredito--certo' : ''}`}>
                {acertou
                  ? t('learn.quizRight')
                  : t('learn.quizWrong', { answer: certa?.label ?? '' })}
              </p>
            )}
            <p>{resposta}</p>
          </div>
        )}
      </div>
      {!respondida && !opcoes && (
        <button
          type="button"
          className="btn-contorno guia-quiz__botao"
          onClick={() => setAberta(true)}
        >
          {t('learn.seeAnswer')}
        </button>
      )}
    </div>
  )
}

type BlocoTabela = Extract<TutorialBlock, { type: 'table' }>

/**
 * Tabela que rola de lado por conta própria (o deslize de página ignora o
 * toque aqui). Compacta, as duas primeiras colunas viram uma: nome em cima e
 * frase embaixo. Com `links`, tocar no nome abre o cartão do termo (o yaku
 * com o exemplo, como no Guia de bolso) por cima do guia.
 */
function TabelaGuia({ bloco }: { bloco: BlocoTabela }) {
  const [termoAberto, setTermoAberto] = useState<string | null>(null)
  const cabecalhos = bloco.compact
    ? bloco.headers.filter((_, indice) => indice !== 1)
    : bloco.headers

  return (
    <div className={`guia-tabela${bloco.compact ? ' guia-tabela--compacta' : ''}`}>
      <table>
        <thead>
          <tr>
            {cabecalhos.map((cabecalho) => (
              <th key={cabecalho} scope="col">
                {cabecalho}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bloco.rows.map((linha, indiceLinha) => {
            const termo = bloco.links?.[indiceLinha]
            const nome = bloco.compact ? (
              <>
                <span className="guia-tabela__nome">{linha[0]}</span>
                <span className="guia-tabela__frase">
                  <TextoSimples md={linha[1]} />
                </span>
              </>
            ) : (
              <TextoSimples md={linha[0]} />
            )
            return (
              <tr key={linha[0]}>
                <td>
                  {termo ? (
                    <button
                      type="button"
                      className="guia-tabela__link"
                      aria-haspopup="dialog"
                      onClick={() => setTermoAberto(termo)}
                    >
                      {nome}
                    </button>
                  ) : (
                    nome
                  )}
                </td>
                {linha.slice(bloco.compact ? 2 : 1).map((celula, indiceCelula) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: colunas fixas
                  <td key={indiceCelula}>
                    <TextoSimples md={celula} />
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
      {termoAberto && <ModalTermo termo={termoAberto} aoFechar={() => setTermoAberto(null)} />}
    </div>
  )
}

/** Cartões que abrem ao tocar (`<details>`): título e selo à vista, a explicação dentro. */
function CartoesGuia({
  itens,
  termos,
  aoAbrirFerramenta,
}: {
  itens: CartaoGuia[]
  termos?: string[]
  aoAbrirFerramenta: (ferramenta: FerramentaGuia) => void
}) {
  return (
    <div className="guia-cartoes">
      {itens.map((item) => (
        <details key={item.id} data-cartao={item.id} className="guia-cartao">
          <summary className="guia-cartao__topo">
            <span className="guia-cartao__titulo">{item.title}</span>
            {item.badge && <span className="guia-cartao__selo">{item.badge}</span>}
          </summary>
          <div className="guia-cartao__corpo">
            <BlocosGuia
              blocos={item.blocks}
              termos={termos}
              aoAbrirFerramenta={aoAbrirFerramenta}
            />
          </div>
        </details>
      ))}
    </div>
  )
}

/** Os blocos de uma página do guia, na ordem do conteúdo. */
export default function BlocosGuia({
  blocos,
  termos,
  aoAbrirFerramenta,
}: {
  blocos: TutorialBlock[]
  /** Termos que a página explica (não viram link nela). */
  termos?: string[]
  aoAbrirFerramenta: (ferramenta: FerramentaGuia) => void
}) {
  const { t } = useI18n()
  const ligar = criarLigadorTermos(termos)

  return (
    <>
      {blocos.map((bloco, indice) => {
        switch (bloco.type) {
          case 'text':
            return textoGuia(bloco.md, ligar, indice)
          case 'heading':
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos
              <h2 key={indice} className="guia-subtitulo guia-subtopico">
                {bloco.text}
              </h2>
            )
          case 'cards':
            return (
              <CartoesGuia
                // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos
                key={indice}
                itens={bloco.items}
                termos={termos}
                aoAbrirFerramenta={aoAbrirFerramenta}
              />
            )
          case 'hand':
            // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos
            return <MaoGuia key={indice} {...bloco} />
          case 'steps':
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos
              <ol key={indice} className="guia-passos">
                {bloco.items.map((item: PassoGuia, indicePasso) => {
                  const passo = typeof item === 'string' ? { md: item } : item
                  return (
                    // biome-ignore lint/suspicious/noArrayIndexKey: passos fixos
                    <li key={indicePasso} className="guia-passos__item">
                      <span className="guia-passos__numero" aria-hidden="true">
                        {indicePasso + 1}
                      </span>
                      <span>{linhaTexto(passo.md, ligar)}</span>
                      {/* Ilustração na largura toda, embaixo do número e do texto. */}
                      {passo.image && (
                        <IlustracaoGuia ilustracao={passo.image} alt={passo.alt ?? ''} />
                      )}
                    </li>
                  )
                })}
              </ol>
            )
          case 'melds':
            // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos
            return <ChamadasGuia key={indice} itens={bloco.items} />
          case 'image':
            return (
              <IlustracaoGuia
                // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos
                key={indice}
                ilustracao={bloco.image}
                alt={bloco.alt}
                legenda={bloco.caption}
              />
            )
          case 'doraCycles':
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos
              <div key={indice} className="guia-ciclos">
                <CiclosDora />
              </div>
            )
          case 'table':
            // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos
            return <TabelaGuia key={indice} bloco={bloco} />
          case 'quiz':
            return (
              <QuizGuia
                // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos
                key={indice}
                pergunta={linhaTexto(bloco.question, ligar)}
                resposta={linhaTexto(bloco.answer, ligar)}
                hand={bloco.hand}
                opcoes={bloco.options}
              />
            )
          case 'sticks':
            // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos
            return <PalitosGuia key={indice} />
          case 'hanFuTutorial':
            return (
              // O mesmo retângulo do verbete Fu no Guia de bolso: abre o tutorial por cima.
              <BotaoTutorialHanFu
                // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos
                key={indice}
                className="bloco-dica guia-dica guia-tutorial-han-fu"
                toqueNasBordas
                // Embaixo do passo 4 (consulte a tabela): abre a Calculadora de Han e Fu por cima do guia.
                rotuloVerTabela={t('learn.calculatorAndTable')}
                aoVerTabela={() => aoAbrirFerramenta('hanFu')}
              >
                <span>
                  <strong>Como contar</strong> han e fu, passo a passo
                </span>
              </BotaoTutorialHanFu>
            )
          case 'appLink':
            return (
              <button
                // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos
                key={indice}
                type="button"
                className="btn-contorno guia-link-app"
                onClick={() => aoAbrirFerramenta(bloco.tool)}
              >
                {bloco.label}
                <i className="fas fa-arrow-right" aria-hidden="true" />
              </button>
            )
          case 'tip':
            return (
              <BlocoDica
                // biome-ignore lint/suspicious/noArrayIndexKey: blocos fixos
                key={indice}
                className="guia-dica"
                texto={bloco.md}
                ignorar={ligar(bloco.md)}
              />
            )
          default:
            return null
        }
      })}
    </>
  )
}
