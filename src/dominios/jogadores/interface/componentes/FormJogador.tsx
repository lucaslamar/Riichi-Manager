import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { DadosJogador, ErroJogador, ResultadoJogador } from '../../logica/jogadores'

const CHAVE_ERRO: Record<ErroJogador, string> = {
  nomeVazio: 'players.errorEmptyName',
  nomeDuplicado: 'players.errorDuplicateName',
}

interface PropsFormJogador {
  inicial?: DadosJogador
  aoSalvar: (dados: DadosJogador) => ResultadoJogador
  aoCancelar: () => void
}

/** Nome e apelido, usado ao criar e ao renomear. Quem chama decide o que fazer ao salvar. */
export default function FormJogador({ inicial, aoSalvar, aoCancelar }: PropsFormJogador) {
  const { t } = useI18n()
  const id = useId()
  const nomeRef = useRef<HTMLInputElement | null>(null)
  const [nome, setNome] = useState(inicial?.nome ?? '')
  const [apelido, setApelido] = useState(inicial?.apelido ?? '')
  const [erro, setErro] = useState<ErroJogador | null>(null)

  // A modal foca o próprio diálogo ao abrir; o foco vem para o nome logo depois.
  useEffect(() => {
    const temporizador = window.setTimeout(() => nomeRef.current?.focus(), 0)
    return () => window.clearTimeout(temporizador)
  }, [])

  const enviar = (evento: FormEvent) => {
    evento.preventDefault()
    const resultado = aoSalvar({ nome, apelido })
    if (!resultado.ok) setErro(resultado.erro)
  }

  return (
    <form className="form-jogador" onSubmit={enviar} noValidate>
      <label className="campo-jogador" htmlFor={`${id}-nome`}>
        {t('players.name')}
      </label>
      <input
        ref={nomeRef}
        id={`${id}-nome`}
        className="entrada-jogador"
        type="text"
        value={nome}
        autoComplete="off"
        aria-invalid={!!erro}
        aria-describedby={erro ? `${id}-erro` : undefined}
        onChange={(evento) => {
          setNome(evento.target.value)
          setErro(null)
        }}
      />
      {erro && (
        <p id={`${id}-erro`} className="erro-jogador" role="alert">
          {t(CHAVE_ERRO[erro])}
        </p>
      )}

      <label className="campo-jogador" htmlFor={`${id}-apelido`}>
        {t('players.nickname')}
      </label>
      <input
        id={`${id}-apelido`}
        className="entrada-jogador"
        type="text"
        value={apelido}
        autoComplete="off"
        onChange={(evento) => setApelido(evento.target.value)}
      />

      <div className="acoes-form-jogador">
        <button type="button" className="btn-contorno" onClick={aoCancelar}>
          {t('actions.cancel')}
        </button>
        <button type="submit" className="btn-primario">
          {t('players.save')}
        </button>
      </div>
    </form>
  )
}
