import { useEffect, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useMediaQuery } from '@/compartilhado/interface/hooks/useMediaQuery'
import type { CodigoPedra } from '../../../logica/mao'
import { parseMpsz } from '../../../logica/yakus'
import { nomePedraAcessivel } from '../../constantes'
import { PedraYaku } from '../yakus/PedrasExemplo'
import {
  CENAS_AJUDA,
  rotuloChamadaCena,
  type ChamadaCena,
  type NomeCena,
  type QuadroCena,
} from './cenasAjuda'
import './cena-ajuda.css'

const DURACAO_QUADRO_MS = 1400
const DURACAO_ULTIMO_QUADRO_MS = 2600
/** Segurar dura mais que tocar, para dar tempo de ver o anel cheio. */
const DURACAO_SEGURAR_MS = 2000

const CHAMADAS: ChamadaCena[] = ['chii', 'pon', 'kanAberto', 'kanFechado']
const CLASSE_CHAMADA: Record<ChamadaCena, string> = {
  chii: 'chi',
  pon: 'pon',
  kanAberto: 'kan',
  kanFechado: 'kanf',
}
const TECLAS_NUMEROS = ['1', '2', '3', 'm', '4', '5', '6', 'p', '7', '8', '9', 's', '0', 'z']
const ABAS_GUIA = ['beginner', 'yakuman'] as const
const PEDRAS_CARTAO_GUIA = parseMpsz('555z666z777z')
/** Teclado de pedras inteiro, uma fileira por naipe, como no app. */
const FILEIRAS_TECLADO = ['123456789m', '123456789p', '123456789s', '1234567z'].map(parseMpsz)
/** Pedras que uma chamada ocupa na contagem da mão (o kan também conta 3). */
const SLOTS_CHAMADA = 3

/**
 * Mostra uma cena da ajuda passo a passo, em loop, passando de um caso para o
 * outro. A cena é a Calculadora de Mão inteira em miniatura (cabeçalho da mão,
 * mão, barra de chamadas e teclado completo), com o dedo tocando onde o
 * jogador tocaria. Com movimento reduzido no aparelho, fica parada no
 * resultado do caso escolhido e lista os passos.
 */
export default function CenaAjuda({ nome }: { nome: NomeCena }) {
  const { t } = useI18n()
  const { casos } = CENAS_AJUDA[nome]
  const semMovimento = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [indiceCaso, setIndiceCaso] = useState(0)
  const [indice, setIndice] = useState(0)
  const caso = casos[indiceCaso]
  const ultimo = caso.quadros.length - 1

  useEffect(() => {
    if (semMovimento) return
    const atual = caso.quadros[indice]
    const espera = atual.segurando
      ? DURACAO_SEGURAR_MS
      : indice === ultimo
        ? DURACAO_ULTIMO_QUADRO_MS
        : DURACAO_QUADRO_MS
    const timer = window.setTimeout(() => {
      if (indice < ultimo) {
        setIndice(indice + 1)
        return
      }
      setIndice(0)
      setIndiceCaso((casoAtual) => (casoAtual + 1) % casos.length)
    }, espera)
    return () => window.clearTimeout(timer)
  }, [indice, ultimo, semMovimento, caso, casos.length])

  const escolherCaso = (novo: number) => {
    setIndiceCaso(novo)
    setIndice(0)
  }

  const legenda = (quadro: QuadroCena) => {
    const { chave, nome: alvo } = quadro.legenda
    const nomeAlvo = !alvo
      ? ''
      : 'pedra' in alvo
        ? nomePedraAcessivel(alvo.pedra)
        : 'chave' in alvo
          ? t(alvo.chave)
          : alvo.texto
    return t(`sectionHelp.demo.${chave}`, { name: nomeAlvo })
  }

  const passos = caso.quadros.map(legenda)
  const quadro = caso.quadros[semMovimento ? ultimo : indice]
  const toque = semMovimento ? undefined : quadro.toque
  const tocando = (alvo: string) =>
    toque === alvo ? ` cena-ajuda__tocando${quadro.segurando ? ' cena-ajuda__tocando--segurando' : ''}` : ''

  const renderizarItemMao = (item: CodigoPedra, posicao: number) => {
    const classe = `cena-ajuda__pedra-mao${quadro.escolhendoBatida ? ' cena-ajuda__pedra-mao--opcao' : ''}${
      quadro.batida === posicao ? ' cena-ajuda__pedra-mao--batida' : ''
    }${quadro.saindo?.includes(posicao) ? ' cena-ajuda__pedra-mao--saindo' : ''}${tocando(`mao:${posicao}`)}`
    return (
      // biome-ignore lint/suspicious/noArrayIndexKey: cena fixa
      <span key={posicao} className={classe}>
        {item.startsWith('#') ? (
          <span className="cena-ajuda__pendente">{item.slice(1)}</span>
        ) : (
          <PedraYaku pedra={item} />
        )}
        {quadro.batida === posicao && (
          <span className="cena-ajuda__selo-batida">{t('calculator.winningTile')}</span>
        )}
      </span>
    )
  }

  const renderizarTeclaPedra = (pedra: CodigoPedra) => {
    // O 5 vermelho (ponto ou face vermelha) só vale no naipe da cena.
    const ehCinco = pedra[0] === '5' && !!caso.pedrasTeclado?.includes(pedra)
    const mostrada = ehCinco && quadro.cincoVermelho ? (`0${pedra[1]}` as CodigoPedra) : pedra
    return (
      <span key={pedra} className={`cena-ajuda__tecla-pedra${tocando(`pedra:${pedra}`)}`}>
        <PedraYaku pedra={mostrada} />
        {ehCinco && quadro.pontoAka && <span className="cena-ajuda__ponto-aka" />}
      </span>
    )
  }

  const totalMao = (quadro.mao?.length ?? 0) + (quadro.meld ? SLOTS_CHAMADA : 0)

  /** Guia de bolso aberto por cima da calculadora, como no app. */
  const renderizarGuia = () => {
    if (!quadro.guia) return null
    const { aba } = quadro.guia
    return (
      <div className="cena-ajuda__guia">
        <strong>{t('pocketGuide.title')}</strong>
        <div className="cena-ajuda__abas-guia">
          {ABAS_GUIA.map((chave) => (
            <span
              key={chave}
              className={`cena-ajuda__aba-guia${aba === chave ? ' cena-ajuda__aba-guia--ativa' : ''}${tocando(
                `aba:${chave}`,
              )}`}
            >
              {t(`pocketGuide.tabs.${chave}`)}
            </span>
          ))}
        </div>
        {aba === 'yakuman' && (
          <div className="cena-ajuda__cartao-guia">
            <div>
              <strong>Daisangen</strong> <span>大三元</span>
              <span className="cena-ajuda__selo-yakuman">{t('pocketGuide.yakumanBadge')}</span>
            </div>
            <div className="cena-ajuda__pedras-cartao">
              {PEDRAS_CARTAO_GUIA.map((pedra, posicao) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: cena fixa
                <PedraYaku key={posicao} pedra={pedra} />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <figure className="cena-ajuda" aria-label={passos.join('. ')}>
      {casos.length > 1 && (
        <div className="cena-ajuda__casos" role="group" aria-label={t('sectionHelp.demo.cases')}>
          {casos.map((outro, posicao) => (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: cena fixa
              key={posicao}
              type="button"
              className={`cena-ajuda__caso${posicao === indiceCaso ? ' cena-ajuda__caso--ativo' : ''}`}
              aria-pressed={posicao === indiceCaso}
              onClick={() => escolherCaso(posicao)}
            >
              {outro.rotulo ? t(outro.rotulo) : posicao + 1}
            </button>
          ))}
        </div>
      )}

      <div className="cena-ajuda__tela" aria-hidden="true">
        {/* Cabeçalho da mão: título e, na ordem do app, ?, chapéu e engrenagem. */}
        <div className="cena-ajuda__cabecalho">
          <span className="cena-ajuda__titulo-mao">
            <i className="fas fa-layer-group" />
            {t('calculator.buildTitle', { total: Math.min(totalMao, 14) })}
          </span>
          <span className="cena-ajuda__icone cena-ajuda__icone--ajuda">?</span>
          <span className={`cena-ajuda__icone${tocando('chapeu')}`}>
            <i className="fas fa-graduation-cap" />
          </span>
          <span className="cena-ajuda__icone">
            <i className="fas fa-sliders" />
          </span>
        </div>

        <div className="cena-ajuda__mao">
          {quadro.mao?.map(renderizarItemMao)}
          {quadro.meld && (
            <span className={`cena-ajuda__meld cena-ajuda__meld--${CLASSE_CHAMADA[quadro.meld.tipo]}`}>
              <small>{t(rotuloChamadaCena(quadro.meld.tipo))}</small>
              {quadro.meld.pedras.map((pedra, posicao) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: cena fixa
                <PedraYaku key={posicao} pedra={pedra} />
              ))}
            </span>
          )}
        </div>

        <div className="cena-ajuda__painel">
          {caso.painel === 'numeros' ? (
            <>
              {/* Barra do MPSZ: voltar para as pedras, AC e apagar. */}
              <div className="cena-ajuda__barra-mpsz">
                <span>
                  <i className="fas fa-chevron-left" /> {t('notation.backToTiles')}
                </span>
                <span className="cena-ajuda__ac">AC</span>
                <i className="fas fa-delete-left" />
              </div>
              <div className="cena-ajuda__teclado-numeros">
                {CHAMADAS.map((chamada) => (
                  <span
                    key={chamada}
                    className={`cena-ajuda__chamada cena-ajuda__chamada--${CLASSE_CHAMADA[chamada]}${
                      quadro.ativa === chamada ? ' cena-ajuda__chamada--ativa' : ''
                    }${tocando(`chamada:${chamada}`)}`}
                  >
                    {t(rotuloChamadaCena(chamada))}
                  </span>
                ))}
                {TECLAS_NUMEROS.map((tecla) => (
                  <span
                    key={tecla}
                    className={`cena-ajuda__tecla${/[mpsz]/.test(tecla) ? ' cena-ajuda__tecla--naipe' : ''}${
                      tecla === '0' ? ' cena-ajuda__tecla--zero' : ''
                    }${tocando(`tecla:${tecla}`)}`}
                  >
                    {tecla.toUpperCase()}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="cena-ajuda__chamadas">
                {CHAMADAS.map((chamada) => (
                  <span
                    key={chamada}
                    className={`cena-ajuda__chamada cena-ajuda__chamada--${CLASSE_CHAMADA[chamada]}${
                      quadro.ativa === chamada ? ' cena-ajuda__chamada--ativa' : ''
                    }${tocando(`chamada:${chamada}`)}`}
                  >
                    {t(rotuloChamadaCena(chamada))}
                  </span>
                ))}
                <span className="cena-ajuda__chamada cena-ajuda__chamada--mpsz">MPSZ</span>
              </div>

              {quadro.opcoes ? (
                <div className="cena-ajuda__opcoes">
                  <small>{t('calculator.chooseChiiSequence')}</small>
                  <div>
                    {quadro.opcoes.map((sequencia, posicao) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: cena fixa
                      <span key={posicao} className={`cena-ajuda__opcao${tocando(`opcao:${posicao}`)}`}>
                        {sequencia.map((pedra) => (
                          <PedraYaku key={pedra} pedra={pedra} />
                        ))}
                      </span>
                    ))}
                  </div>
                </div>
              ) : caso.painel === 'batida' ? (
                // Mão completa: no lugar do teclado, Mudar batida e Finalizar mão.
                <div className="cena-ajuda__rodape-batida">
                  <span
                    className={`cena-ajuda__botao-batida${tocando('mudarBatida')}${
                      quadro.escolhendoBatida ? ' cena-ajuda__botao-batida--ativo' : ''
                    }`}
                  >
                    {t('calculator.changeWinningTileShort')}
                  </span>
                  <span className="cena-ajuda__botao-finalizar">{t('calculator.finalTitle')}</span>
                </div>
              ) : (
                <div className="cena-ajuda__teclado-pedras">
                  {FILEIRAS_TECLADO.map((fileira) => (
                    <div key={fileira[0]} className="cena-ajuda__fileira-pedras">
                      {fileira.map(renderizarTeclaPedra)}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {renderizarGuia()}
      </div>

      {semMovimento ? (
        <ol className="cena-ajuda__passos">
          {passos.map((passo, posicao) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: cena fixa
            <li key={posicao}>{passo}</li>
          ))}
        </ol>
      ) : (
        <figcaption className="cena-ajuda__legenda" aria-hidden="true">
          <span className="cena-ajuda__contador">
            {indice + 1}/{caso.quadros.length}
          </span>{' '}
          {passos[indice]}
        </figcaption>
      )}
    </figure>
  )
}
