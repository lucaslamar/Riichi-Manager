import type { DetalheFu, Mao } from '../../../logica/mao'
import { PedraSvg } from '../../compartilhado/componentes/PedraSvg'

export default function ExibicaoCompleta({ resultado, mao }: { resultado: any; mao?: Mao }) {
  const pts = resultado.pontos
  const completarIndicadores = (quantidade: number) => Math.max(0, 5 - quantidade)

  return (
    <>
      {resultado.nome && <div className="nome-mao">{resultado.nome}</div>}
      {resultado.yakuman > 0 && (
        <div className="resumo-yakuman">{resultado.yakuman}× Yakuman</div>
      )}
      {resultado.han > 0 && resultado.yakuman === 0 && (
        <div className="resumo-han-fu">
          {resultado.han} Han {resultado.fu} Fu
        </div>
      )}
      <div className="pontos-totais">{pts.total.toLocaleString('pt-BR')}</div>
      <div className="detalhe-pontos">
        {resultado.agari === 'tsumo'
          ? resultado.isOya
            ? `All ${pts.oya?.ko ?? 0}`
            : `Oya ${pts.ko?.oya ?? 0} / Ko ${pts.ko?.ko ?? 0}`
          : resultado.isOya
            ? `Ron ${pts.oya?.ron ?? 0}`
            : `Ron ${pts.ko?.ron ?? 0}`}
      </div>
      {mao && (
        <div className="detalhes-contexto-resultado">
          <span>{mao.agari === 'tsumo' ? 'Tsumo' : 'Ron'}</span>
          {mao.honba > 0 && <span>{mao.honba} Honba</span>}
          {mao.doraManual > 0 && <span>Dora manual: {mao.doraManual}</span>}
        </div>
      )}
      {mao && (mao.dora.length > 0 || mao.uradora.length > 0) && (
        <div className="indicadores-resultado">
          {mao.dora.length > 0 && (
            <div className="linha-indicadores-resultado">
              <strong>Indicadores de Dora</strong>
              <span className="tiles-indicadores-resultado">
                {mao.dora.map((pedra, indice) => (
                  <span key={`dora-${pedra}-${indice}`} className="chip-pedra mini">
                    <PedraSvg pedra={pedra} />
                  </span>
                ))}
                {Array.from({ length: completarIndicadores(mao.dora.length) }).map((_, indice) => (
                  <span key={`dora-fechada-${indice}`} className="chip-pedra mini indicador-fechado">
                    <PedraSvg virada />
                  </span>
                ))}
              </span>
            </div>
          )}
          {mao.uradora.length > 0 && (
            <div className="linha-indicadores-resultado">
              <strong>Indicadores de Ura Dora</strong>
              <span className="tiles-indicadores-resultado">
                {mao.uradora.map((pedra, indice) => (
                  <span key={`ura-${pedra}-${indice}`} className="chip-pedra mini">
                    <PedraSvg pedra={pedra} />
                  </span>
                ))}
                {Array.from({ length: completarIndicadores(mao.uradora.length) }).map((_, indice) => (
                  <span key={`ura-fechada-${indice}`} className="chip-pedra mini indicador-fechado">
                    <PedraSvg virada />
                  </span>
                ))}
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
              ([nome, valor, ehYakuman]: [string, number, boolean], i: number) => (
                <span key={i} className="chip-yaku">
                  {nome} <strong>{ehYakuman ? `${valor}× YM` : `${valor}han`}</strong>
                </span>
              ),
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
