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
      type="button"
      disabled={desabilitado}
      onClick={aoClicar}
      style={{
        minHeight: 36,
        padding: '4px 12px',
        fontSize: '0.85rem',
        fontWeight: 900,
        border: `2px solid ${ativo ? cor : '#dde1e7'}`,
        borderRadius: 8,
        cursor: desabilitado ? 'not-allowed' : 'pointer',
        background: ativo ? cor : 'white',
        color: ativo ? 'white' : desabilitado ? '#bbb' : cor,
        opacity: desabilitado ? 0.45 : 1,
        transition: 'all 0.15s',
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
  aoClicar,
}: {
  rotulo: string
  ativo: boolean
  desabilitado: boolean
  aoClicar: () => void
}) {
  return (
    <button
      type="button"
      className={ativo ? 'btn-primario' : 'btn-contorno'}
      disabled={desabilitado}
      style={{
        minHeight: 36,
        padding: '4px 14px',
        fontSize: '0.85rem',
        opacity: desabilitado ? 0.35 : 1,
      }}
      onClick={aoClicar}
    >
      {rotulo}
    </button>
  )
}

/** Seletor de Han na calculadora rápida. */
