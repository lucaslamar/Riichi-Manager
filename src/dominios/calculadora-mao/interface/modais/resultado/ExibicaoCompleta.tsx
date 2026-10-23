import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { DetalheFu, Mao, VentoMao } from '../../../logica/mao'
import { termoGlossarioDoNome } from '../../../logica/glossario'
import { PedraSvg } from '../../compartilhado/componentes/PedraSvg'
import BlocoDica from '../glossario/BlocoDica'
import TextoGlossario from '../glossario/TextoGlossario'
import { explicacaoDoYaku } from './destaqueYaku'

const CHAVE_VENTO: Record<VentoMao, string> = {
  '1': 'winds.east',
  '2': 'winds.south',
  '3': 'winds.west',
  '4': 'winds.north',
}

const formatar = (valor: number) => valor.toLocaleString('pt-BR')

/**
 * Grafia exibida dos nomes que a lógica usa como identificador (filtros de
 * dora, ligação com a referência de yakus): mesma grafia do Glossário.
 */
const NOME_EXIBIDO: Record<string, string> = {
  Tanyao: "Tan'yao",
  Uradora: 'Ura-dora',
  Akadora: 'Aka dora',
}

/**
 * Quem paga no tsumo: sendo Leste, todos pagam o mesmo; senão, Leste paga a
 * parte maior e os demais a menor. No ron o total já é o que o descarte paga.
 */
function pagamentos(resultado: any, nomeLeste: string): { quem: string; valor: number }[] {
  const pts = resultado.pontos
  if (resultado.agari !== 'tsumo') return []
  if (resultado.isOya) return [{ quem: 'Todos pagam', valor: pts.oya?.ko }]
  return [
    { quem: `${nomeLeste} paga`, valor: pts.ko?.oya },
    { quem: 'Demais pagam', valor: pts.ko?.ko },
  ]
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
}: {
  resultado: any
  mao?: Mao
  /** Yaku aberto na lista (mostra a explicação e destaca as pedras). */
  yakuSelecionado?: string | null
  aoSelecionarYaku?: (nome: string | null) => void
}) {
  const { t } = useI18n()
  const pts = resultado.pontos
  const completarIndicadores = (quantidade: number) => Math.max(0, 5 - quantidade)
  const pontosHonba: number = resultado.pontosHonba ?? 0
  const rotuloHanFu =
    resultado.yakuman > 0
      ? `${resultado.yakuman}× Yakuman`
      : resultado.han > 0
        ? `${resultado.han} Han ${resultado.fu} Fu`
        : null

  return (
    <>
      {/* O patamar (Mangan, Haneman...) abre o verbete dele no glossário. */}
      {resultado.nome && (
        <div className="nome-mao">
          <TextoGlossario texto={resultado.nome} />
        </div>
      )}
      {mao && <TagsVentos mao={mao} />}
      {pontosHonba > 0 && mao ? (
        <div className="linhas-pontos-resultado">
          <div className="linha-pontos-resultado">
            <span>{rotuloHanFu}</span>
            <strong>{formatar(pts.total - pontosHonba)}</strong>
          </div>
          <div className="linha-pontos-resultado">
            <span>
              {t('calculator.honba')} {mao.honba}
            </span>
            <strong>+{formatar(pontosHonba)}</strong>
          </div>
        </div>
      ) : (
        rotuloHanFu && (
          <div className={resultado.yakuman > 0 ? 'resumo-yakuman' : 'resumo-han-fu'}>
            {rotuloHanFu}
          </div>
        )
      )}
      <div className="pontos-totais">{formatar(pts.total)}</div>
      {resultado.agari === 'tsumo' && (
        <div className="pagamentos-resultado">
          {pagamentos(resultado, t(CHAVE_VENTO['1'])).map(({ quem, valor }) => (
            <span key={quem}>
              {quem} <strong>{formatar(valor ?? 0)}</strong>
            </span>
          ))}
        </div>
      )}
      {mao && (mao.dora.length > 0 || mao.uradora.length > 0) && (
        <div className="indicadores-resultado">
          {mao.dora.length > 0 && (
            <div className="linha-indicadores-resultado">
              <strong>Indicadores de dora</strong>
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
              <strong>Indicadores de ura-dora</strong>
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
          <div className="rotulo-lista-resultado">Yaku</div>
          <div className="lista-yaku">
            {resultado.yaku.map(
              ([nome, valor, ehYakuman]: [string, number, boolean], i: number) => {
                const aberto = yakuSelecionado === nome
                const explicacao = explicacaoDoYaku(nome, mao)
                const ignorar = [termoGlossarioDoNome(explicacao?.yaku?.romaji ?? nome)]
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
                        {NOME_EXIBIDO[nome] ?? nome}
                        {/* Avisa que o yaku abre a explicação ao tocar. */}
                        {explicacao && (
                          <i
                            className="fas fa-circle-exclamation chip-yaku__icone"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                      <strong>{ehYakuman ? `${valor}× YM` : `${valor}han`}</strong>
                    </button>
                    {aberto && explicacao && (
                      <div id={idExplicacao} className="chip-yaku__explicacao">
                        {(explicacao.titulo ?? explicacao.yaku) && (
                          <span className="chip-yaku__nome-pt">
                            {explicacao.titulo?.nome ?? explicacao.yaku?.namePt}{' '}
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
          <div className="rotulo-lista-resultado">Fu</div>
          <div className="lista-fu">
            {resultado.fuDetalhes.map((detalhe: DetalheFu, i: number) => (
              <span key={i} className="chip-fu">
                <strong>{detalhe.fu} fu</strong>
                <span>{detalhe.tipo}</span>
                <small>{detalhe.descricao}</small>
              </span>
            ))}
          </div>
        </>
      )}
    </>
  )
}
