import { configuracaoPadrao, type ConfiguracaoCalculo } from '../../logica/mao'
import { CONFIGURACOES_REGRAS } from '../constantes'

export default function ModalRegras({
  configuracao,
  aoMudar,
  aoFechar,
}: {
  configuracao: ConfiguracaoCalculo
  aoMudar: (config: ConfiguracaoCalculo) => void
  aoFechar: () => void
}) {
  const alternar = (chave: keyof ConfiguracaoCalculo) => {
    aoMudar({ ...configuracao, [chave]: !configuracao[chave] })
  }

  return (
    <div className="modal-regras-fundo" role="presentation" onMouseDown={aoFechar}>
      <div
        className="modal-regras"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-regras"
        onMouseDown={(evento) => evento.stopPropagation()}
      >
        <div className="modal-regras-cabecalho">
          <div>
            <h3 id="titulo-regras">Regras de cálculo</h3>
            <p>Escolha as variações usadas pela mesa.</p>
          </div>
          <button className="btn-icone" type="button" onClick={aoFechar} aria-label="Fechar regras">
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="lista-regras">
          {CONFIGURACOES_REGRAS.map((regra) => {
            const ativo = configuracao[regra.chave]
            return (
              <div className="linha-regra" key={regra.chave}>
                <div className="texto-regra">
                  <strong>{regra.titulo}</strong>
                  <span>{regra.ajuda}</span>
                </div>
                <div className="controle-regra" aria-label={regra.titulo}>
                  <button
                    type="button"
                    className={ativo ? 'ativo' : ''}
                    onClick={() => {
                      if (!ativo) alternar(regra.chave)
                    }}
                  >
                    {regra.ligado}
                  </button>
                  <button
                    type="button"
                    className={!ativo ? 'ativo' : ''}
                    onClick={() => {
                      if (ativo) alternar(regra.chave)
                    }}
                  >
                    {regra.desligado}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="modal-regras-rodape">
          <button
            type="button"
            className="btn-contorno"
            onClick={() => aoMudar(configuracaoPadrao)}
          >
            Restaurar padrao
          </button>
          <button type="button" className="btn-primario" onClick={aoFechar}>
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}
