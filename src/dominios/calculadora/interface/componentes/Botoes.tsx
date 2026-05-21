export function BotaoAcao({
  rotulo,
  cor,
  ativo,
  desabilitado,
  aoClicar,
}: {
  tipo: string
  rotulo: string
  cor: string
  ativo: boolean
  desabilitado: boolean
  aoClicar: () => void
}) {
  return (
    <button
      className="btn-acao-mao"
      type="button"
      disabled={desabilitado}
      onClick={aoClicar}
      style={{
        border: `2px solid ${ativo ? cor : '#dde1e7'}`,
        cursor: desabilitado ? 'not-allowed' : 'pointer',
        background: ativo ? cor : 'white',
        color: ativo ? 'white' : desabilitado ? '#bbb' : cor,
        opacity: desabilitado ? 0.45 : 1,
      }}
    >
      {rotulo}
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
      className={ativo ? 'btn-primario' : 'btn-contorno'}
      disabled={desabilitado}
      style={{
        minHeight: 36,
        padding: '7px 14px',
        fontSize: '0.85rem',
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
