import type { DetalheFu } from '../../logica/mao'

export default function ExibicaoCompleta({ resultado }: { resultado: any }) {
  const pts = resultado.pontos
  return (
    <>
      {resultado.nome && <div className="nome-mao">{resultado.nome}</div>}
      {resultado.yakuman > 0 && (
        <div style={{ fontSize: '1.1rem', color: '#ffd54f', fontWeight: 800, marginBottom: 4 }}>
          {resultado.yakuman}× Yakuman
        </div>
      )}
      {resultado.han > 0 && resultado.yakuman === 0 && (
        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
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
      {resultado.yaku?.length > 0 && (
        <>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', margin: '14px 0 10px' }} />
          <div
            style={{
              fontSize: '0.78rem',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Yaku
          </div>
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
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', margin: '14px 0 10px' }} />
          <div
            style={{
              fontSize: '0.78rem',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Fu
          </div>
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
