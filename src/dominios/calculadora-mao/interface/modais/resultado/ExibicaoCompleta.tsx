import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import ModalTutorialHanFu from '@/dominios/calculadora-han-fu/interface/modais/tutorial-han-fu/ModalTutorialHanFu'
import type { DetalheFu, Mao, VentoMao } from '../../../logica/mao'
import { termoGlossarioDoNome } from '../../../logica/glossario'
import { chavePatamar, nomeYakuExibido } from '../../../logica/nomesYaku'
import { textoDetalheFu } from '../../../logica/traducoes'
import { PedraSvg } from '../../compartilhado/componentes/PedraSvg'
import BlocoDica from '../glossario/BlocoDica'
import TextoGlossario from '../glossario/TextoGlossario'
import { explicacaoDoYaku } from './destaqueYaku'
import type { ContextoCenterpieceMao } from '@/dominios/centerpiece/logica/tipos-integracao'

const CHAVE_VENTO: Record<VentoMao, string> = {
  '1': 'winds.east',
  '2': 'winds.south',
  '3': 'winds.west',
  '4': 'winds.north',
}

const OUTROS_VENTOS: VentoMao[] = ['2', '3', '4']

/**
 * Ventos de quem paga ou recebe, além do Leste: os três que não são o Leste,
 * menos o de quem bateu ou errou (sem a mão, não dá para saber qual sai).
 */
export function ventosDosDemais(ventoDeQuem?: VentoMao): VentoMao[] {
  if (ventoDeQuem === '1') return OUTROS_VENTOS
  return ventoDeQuem ? OUTROS_VENTOS.filter((vento) => vento !== ventoDeQuem) : []
}

/**
 * Quem paga no tsumo: sendo Leste, todos pagam o mesmo; senão, Leste paga a
 * parte maior e os demais a menor. No ron o total já é o que o descarte paga.
 * Cada linha leva os ventos de quem paga, para não confundir quem é quem.
 */
function pagamentos(
  resultado: any,
  ventoVencedor?: VentoMao,
): { chave: string; valor: number; ventos: VentoMao[] }[] {
  const pts = resultado.pontos
  if (resultado.agari !== 'tsumo') return []
  if (resultado.isOya) {
    return [{ chave: 'calculator.everyonePays', valor: pts.oya?.ko, ventos: OUTROS_VENTOS }]
  }
  return [
    { chave: 'calculator.eastPays', valor: pts.ko?.oya, ventos: ['1'] },
    { chave: 'calculator.othersPay', valor: pts.ko?.ko, ventos: ventosDosDemais(ventoVencedor) },
  ]
}

/** Pedras dos ventos de quem paga ou recebe, ao lado da frase (resultado e chombo). */
export function VentosPagamento({ ventos }: { ventos: VentoMao[] }) {
  if (ventos.length === 0) return null
  return (
    <span className="ventos-pagamento" aria-hidden="true">
      {ventos.map((vento) => (
        <span key={vento} className="chip-pedra mini">
          <PedraSvg pedra={`${vento}z`} />
        </span>
      ))}
    </span>
  )
}

/** Tags de vento da rodada e do assento (resultado e penalidade de chombo). */
export function TagsVentos({ mao }: { mao: Mao }) {
  const { t } = useI18n()
  return (
    <div className="tags-ventos-resultado">
      <span>
        {t('calculator.roundWind')}: <strong>{t(CHAVE_VENTO[mao.ventoRodada])}</strong>
      </span>
      <span>
        {t('calculator.seatWind')}: <strong>{t(CHAVE_VENTO[mao.ventoAssento])}</strong>
      </span>
    </div>
  )
}

export default function ExibicaoCompleta({
  resultado,
  mao,
  yakuSelecionado = null,
  aoSelecionarYaku,
  contextoCenterpiece,
}: {
  resultado: any
  mao?: Mao
  /** Yaku aberto na lista (mostra a explicação e destaca as pedras). */
  yakuSelecionado?: string | null
  aoSelecionarYaku?: (nome: string | null) => void
  /** Faixa com quem bateu e a rodada, quando aberta pelo Centerpiece. */
  contextoCenterpiece?: ContextoCenterpieceMao
}) {
  const { t, idioma, numero } = useI18n()
  const [tutorialAberto, setTutorialAberto] = useState(false)
  const pts = resultado.pontos
  const completarIndicadores = (quantidade: number) => Math.max(0, 5 - quantidade)
  const pontosHonba: number = resultado.pontosHonba ?? 0
  const rotuloHanFu =
    resultado.yakuman > 0
      ? t('hanFu.limitYakumanTimes', { count: resultado.yakuman })
      : resultado.han > 0
        ? t('calculator.hanFuSummary', { han: resultado.han, fu: resultado.fu })
        : null
  const patamar = resultado.nome ? chavePatamar(resultado.nome) : null
  const nomePatamar = patamar ? t(patamar.chave, patamar.parametros) : resultado.nome

  return (
    <>
      {/* O patamar (Mangan, Haneman...) abre o verbete dele no glossário. */}
      {resultado.nome && (
        <div className="nome-mao">
          <TextoGlossario texto={nomePatamar} />
        </div>
      )}
      {mao && <TagsVentos mao={mao} />}
      {contextoCenterpiece && (
        <div className="detalhes-contexto-resultado">
          <span>{contextoCenterpiece.vencedorNome}</span>
          <span>{t(contextoCenterpiece.tipoVitoria === 'ron' ? 'calculator.ron' : 'calculator.tsumo')}</span>
          <span>
            {t(CHAVE_VENTO[contextoCenterpiece.ventoRodada])} {contextoCenterpiece.rodadaNumero}
          </span>
        </div>
      )}
      {pontosHonba > 0 && mao ? (
        <div className="linhas-pontos-resultado">
          <div className="linha-pontos-resultado">
            <span>{rotuloHanFu}</span>
            <strong>{numero(pts.total - pontosHonba)}</strong>
          </div>
          <div className="linha-pontos-resultado">
            <span>
              {t('calculator.honba')} {mao.honba}
            </span>
            <strong>+{numero(pontosHonba)}</strong>
          </div>
        </div>
      ) : (
        rotuloHanFu && (
          <div className={resultado.yakuman > 0 ? 'resumo-yakuman' : 'resumo-han-fu'}>
            {rotuloHanFu}
          </div>
        )
      )}
      <div className="pontos-totais">{numero(pts.total)}</div>
      {resultado.agari === 'tsumo' && (
        <div className="pagamentos-resultado">
          {pagamentos(resultado, mao?.ventoAssento).map(({ chave, valor, ventos }) => (
            <span key={chave}>
              <VentosPagamento ventos={ventos} />
              {t(chave)} <strong>{numero(valor ?? 0)}</strong>
            </span>
          ))}
        </div>
      )}
      {mao && (mao.dora.length > 0 || mao.uradora.length > 0) && (
        <div className="indicadores-resultado">
          {mao.dora.length > 0 && (
            <div className="linha-indicadores-resultado">
              <strong>{t('calculator.doraIndicators')}</strong>
              <span className="tiles-indicadores-resultado">
                {mao.dora.map((pedra, indice) => (
                  <span key={`dora-${pedra}-${indice}`} className="chip-pedra mini">
                    <PedraSvg pedra={pedra} />
                  </span>
                ))}
                {Array.from({ length: completarIndicadores(mao.dora.length) }).map((_, indice) => (
                  <span
                    key={`dora-fechada-${indice}`}
                    className="chip-pedra mini indicador-fechado"
                  >
                    <PedraSvg virada />
                  </span>
                ))}
              </span>
            </div>
          )}
          {mao.uradora.length > 0 && (
            <div className="linha-indicadores-resultado">
              <strong>{t('calculator.uraDoraIndicators')}</strong>
              <span className="tiles-indicadores-resultado">
                {mao.uradora.map((pedra, indice) => (
                  <span key={`ura-${pedra}-${indice}`} className="chip-pedra mini">
                    <PedraSvg pedra={pedra} />
                  </span>
                ))}
                {Array.from({ length: completarIndicadores(mao.uradora.length) }).map(
                  (_, indice) => (
                    <span
                      key={`ura-fechada-${indice}`}
                      className="chip-pedra mini indicador-fechado"
                    >
                      <PedraSvg virada />
                    </span>
                  ),
                )}
              </span>
            </div>
          )}
        </div>
      )}
      {resultado.yaku?.length > 0 && (
        <>
          <div className="divisor-resultado" />
          <div className="rotulo-lista-resultado">{t('calculator.yakuHeading')}</div>
          <div className="lista-yaku">
            {resultado.yaku.map(
              ([nome, valor, ehYakuman]: [string, number, boolean], i: number) => {
                const aberto = yakuSelecionado === nome
                const explicacao = explicacaoDoYaku(nome, mao, idioma)
                const ignorar = [
                  termoGlossarioDoNome(explicacao?.yaku?.romaji ?? nome, idioma),
                  termoGlossarioDoNome(nomeYakuExibido(nome, idioma), idioma),
                ]
                const idExplicacao = `explicacao-yaku-${i}`
                // O cartão todo abre/fecha ao tocar (o botão é o acesso por
                // teclado); a explicação fica fora do botão por ter links.
                return (
                  // biome-ignore lint/a11y/useKeyWithClickEvents: o botão interno faz o mesmo
                  <div
                    key={i}
                    className={`chip-yaku${aberto ? ' aberto' : ''}`}
                    onClick={() => aoSelecionarYaku?.(aberto ? null : nome)}
                  >
                    <button
                      type="button"
                      className="chip-yaku__botao"
                      aria-expanded={aberto}
                      aria-controls={aberto && explicacao ? idExplicacao : undefined}
                    >
                      <span className="chip-yaku__rotulo">
                        {nomeYakuExibido(nome, idioma)}
                        {/* Avisa que o yaku abre a explicação ao tocar. */}
                        {explicacao && (
                          <i
                            className="fas fa-circle-exclamation chip-yaku__icone"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                      <strong>
                        {ehYakuman
                          ? t('calculator.yakumanShort', { count: valor })
                          : t('calculator.hanCount', { count: valor })}
                      </strong>
                    </button>
                    {aberto && explicacao && (
                      <div id={idExplicacao} className="chip-yaku__explicacao">
                        {(explicacao.titulo ?? explicacao.yaku) && (
                          <span className="chip-yaku__nome-pt">
                            {explicacao.titulo?.nome ??
                              explicacao.yaku?.nome ??
                              explicacao.yaku?.titulo}{' '}
                            <span lang="ja">
                              {explicacao.titulo?.kanji ?? explicacao.yaku?.kanji}
                            </span>
                          </span>
                        )}
                        <span>
                          <TextoGlossario texto={explicacao.texto} ignorar={ignorar} />
                        </span>
                        {explicacao.dica && <BlocoDica texto={explicacao.dica} ignorar={ignorar} />}
                      </div>
                    )}
                  </div>
                )
              },
            )}
          </div>
        </>
      )}
      {resultado.fuDetalhes?.length > 0 && resultado.yakuman === 0 && (
        <>
          <div className="divisor-resultado" />
          <div className="rotulo-lista-resultado">
            {t('hanFu.fu')}
            {/* "?" do Fu: abre o tutorial "Como contar Han e Fu" por cima do resultado. */}
            <button
              type="button"
              className="botao-ajuda-secao"
              aria-label={t('sectionHelp.buttonLabel', { section: t('hanFuTutorial.title') })}
              aria-haspopup="dialog"
              onClick={() => setTutorialAberto(true)}
            >
              <span className="botao-ajuda-secao-circulo" aria-hidden="true">
                ?
              </span>
            </button>
          </div>
          <div className="lista-fu">
            {resultado.fuDetalhes.map((detalhe: DetalheFu, i: number) => (
              <span key={i} className="chip-fu">
                <strong>{t('calculator.fuCount', { count: detalhe.fu })}</strong>
                <span>{t(detalhe.tipo)}</span>
                <small>{textoDetalheFu(detalhe, t)}</small>
              </span>
            ))}
          </div>
        </>
      )}
      {tutorialAberto && <ModalTutorialHanFu aoFechar={() => setTutorialAberto(false)} />}
    </>
  )
}
