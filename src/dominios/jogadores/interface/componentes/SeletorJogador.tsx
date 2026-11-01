import { useMemo, useState } from 'react'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import {
  buscarJogadores,
  ordenarJogadores,
  partesDoNome,
  type DadosJogador,
  type Jogador,
} from '../../logica/jogadores'
import { useJogadores } from '../hooks/useJogadores'
import FormJogador from './FormJogador'
import '../jogadores.css'

interface PropsSeletorJogador {
  /** Título da folha (ex.: o assento que está sendo preenchido). */
  titulo?: string
  /** Jogadores já escolhidos nesta mesa: aparecem, mas não podem ser tocados. */
  idsEscolhidos?: readonly string[]
  aoEscolher: (jogador: Jogador) => void
  aoFechar: () => void
}

/**
 * Folha para escolher um jogador: busca, lista e "+ Novo jogador". Um jogador
 * criado aqui já volta escolhido. Arquivados não aparecem.
 */
export default function SeletorJogador({
  titulo,
  idsEscolhidos = [],
  aoEscolher,
  aoFechar,
}: PropsSeletorJogador) {
  const { t, idioma } = useI18n()
  const { jogadores, adicionar } = useJogadores()
  const [busca, setBusca] = useState('')
  const [criando, setCriando] = useState(false)

  const visiveis = useMemo(
    () =>
      ordenarJogadores(
        buscarJogadores(
          jogadores.filter((jogador) => !jogador.arquivado),
          busca,
        ),
        idioma,
      ),
    [jogadores, busca, idioma],
  )

  const criar = (dados: DadosJogador) => {
    const resultado = adicionar(dados)
    if (resultado.ok) aoEscolher(resultado.jogador)
    return resultado
  }

  return (
    <Modal
      titulo={criando ? t('players.new') : (titulo ?? t('players.choose'))}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      className="modal-folha seletor-jogador"
    >
      {criando ? (
        <FormJogador
          inicial={{ nome: busca }}
          aoSalvar={criar}
          aoCancelar={() => setCriando(false)}
        />
      ) : (
        <>
          <input
            className="entrada-jogador"
            type="search"
            value={busca}
            placeholder={t('players.search')}
            aria-label={t('players.search')}
            autoComplete="off"
            onChange={(evento) => setBusca(evento.target.value)}
          />

          <button
            type="button"
            className="btn-contorno botao-novo-jogador"
            onClick={() => setCriando(true)}
          >
            <i className="fas fa-plus" aria-hidden="true" />
            {t('players.new')}
          </button>

          {visiveis.length === 0 ? (
            <p className="vazio-jogadores">
              {busca ? t('players.noResults') : t('players.emptyChooser')}
            </p>
          ) : (
            <ul className="lista-seletor-jogador">
              {visiveis.map((jogador) => {
                const escolhido = idsEscolhidos.includes(jogador.id)
                return (
                  <li key={jogador.id}>
                    <button
                      type="button"
                      className="opcao-seletor-jogador"
                      disabled={escolhido}
                      onClick={() => aoEscolher(jogador)}
                    >
                      <span className="dados-jogador">
                        <span className="nome-cadastro">{partesDoNome(jogador).principal}</span>
                        {partesDoNome(jogador).apoio && (
                          <span className="apelido-jogador">{partesDoNome(jogador).apoio}</span>
                        )}
                      </span>
                      {escolhido && (
                        <span className="selo-jogador">{t('players.alreadyChosen')}</span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </Modal>
  )
}
