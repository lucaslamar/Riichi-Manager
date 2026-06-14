export function BotaoAcao({
  tipo,
  rotulo,
  ativo,
  desabilitado,
  aoClicar,
}: {
  tipo: string
  rotulo: string
  ativo: boolean
  desabilitado: boolean
  aoClicar: () => void
}) {
  const rotuloAcessivel = tipo === 'descarte' ? 'Bloqueios / descartes / furiten' : rotulo
  const variante = {
    chii: 'chi',
    pon: 'pon',
    kanAberto: 'kan-open',
    kanFechado: 'kan-closed',
    descarte: 'discard',
  }[tipo]

  return (
    <button
      className={`btn-acao-mao btn-acao-${tipo} action-tab action-tab--${variante} ${ativo ? 'active' : ''}`}
      type="button"
      disabled={desabilitado}
      aria-pressed={ativo}
      aria-label={rotuloAcessivel}
      title={rotuloAcessivel}
      onClick={aoClicar}
    >
      {tipo === 'descarte' && <i className="fas fa-ban" aria-hidden="true" />}
      <span>{rotulo}</span>
    </button>
  )
}

/** Botão toggle genérico (cinza/azul). */
export function BotaoToggle({
  rotulo,
  ativo,
  desabilitado,
  corAtiva,
  aoClicar,
}: {
  rotulo: string
  ativo: boolean
  desabilitado: boolean
  corAtiva?: string
  aoClicar: () => void
}) {
  return (
    <button
      type="button"
      className={`btn-toggle-mao ${ativo ? 'btn-primario ativo' : 'btn-contorno'}`}
      disabled={desabilitado}
      aria-pressed={ativo}
      aria-label={rotulo}
      style={{
        borderColor: ativo && corAtiva ? corAtiva : undefined,
        background: ativo && corAtiva ? corAtiva : undefined,
        color: ativo && corAtiva ? 'white' : undefined,
        opacity: desabilitado ? 0.35 : 1,
      }}
      onClick={aoClicar}
    >
      {rotulo}
    </button>
  )
}

/** Seletor de Han na calculadora rápida. */
