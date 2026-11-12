import { useMemo, useState } from 'react'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { usePartidas } from '@/dominios/centerpiece/interface/hooks/usePartidas'
import {
  buscarJogadores,
  jogadoresRecentes,
  ordenarJogadores,
  partesDoNome,
  type DadosJogador,
  type Jogador,
} from '../../logica/jogadores'
import { useJogadores } from '../hooks/useJogadores'
import { useEu } from '../hooks/useEu'
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
 * Folha para escolher um jogador: busca, lista e "+ Novo jogador". Sem busca, a
 * lista começa pelos últimos 5 que jogaram e pelos favoritos (a estrela de cada
 * linha liga e desliga). Um jogador criado aqui já volta escolhido. Arquivados
 * não aparecem.
 */
export default function SeletorJogador({
  titulo,
  idsEscolhidos = [],
  aoEscolher,
  aoFechar,
}: PropsSeletorJogador) {
  const { t, idioma } = useI18n()
  const { jogadores, adicionar, favoritar } = useJogadores()
  const { partidas } = usePartidas()
  const { euId } = useEu()
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

  const ativos = useMemo(() => jogadores.filter((jogador) => !jogador.arquivado), [jogadores])
  const recentes = useMemo(() => {
    const ids = jogadoresRecentes(partidas, (id) => ativos.some((jogador) => jogador.id === id))
    return ids.map((id) => ativos.find((jogador) => jogador.id === id)!)
  }, [partidas, ativos])
  const favoritos = useMemo(
    () => ordenarJogadores(ativos.filter((jogador) => jogador.favorito), idioma),
    [ativos, idioma],
  )

  const criar = (dados: DadosJogador) => {
    const resultado = adicionar(dados)
    if (resultado.ok) {
      // Se a folha seguir aberta para o próximo assento, volta para a lista.
      setCriando(false)
      setBusca('')
      aoEscolher(resultado.jogador)
    }
    return resultado
  }

  /** Uma linha: tocar escolhe, a estrela favorita (botões separados). */
  const linha = (jogador: Jogador, grupoChave: string) => {
    const escolhido = idsEscolhidos.includes(jogador.id)
    const partes = partesDoNome(jogador)
    return (
      <li key={`${grupoChave}-${jogador.id}`} className="linha-seletor-jogador">
        <button
          type="button"
          className="opcao-seletor-jogador"
          disabled={escolhido}
          onClick={() => {
            // A folha pode seguir aberta para o próximo assento: a busca recomeça.
            setBusca('')
            aoEscolher(jogador)
          }}
        >
          <span className="dados-jogador">
            <span className="nome-cadastro">
              {partes.principal}
              {jogador.id === euId && <span className="selo-eu">{t('players.me')}</span>}
              {jogador.clube && <small className="clube-jogador"> {jogador.clube}</small>}
            </span>
            {partes.apoio && <span className="apelido-jogador">{partes.apoio}</span>}
          </span>
          {escolhido && <span className="selo-jogador">{t('players.alreadyChosen')}</span>}
        </button>
        <button
          type="button"
          className={`estrela-jogador${jogador.favorito ? ' estrela-jogador--ativa' : ''}`}
          aria-pressed={!!jogador.favorito}
          aria-label={t(jogador.favorito ? 'players.unfavorite' : 'players.favorite', { name: partes.principal })}
          onClick={() => favoritar(jogador.id, !jogador.favorito)}
        >
          <i className={`${jogador.favorito ? 'fas' : 'far'} fa-star`} aria-hidden="true" />
        </button>
      </li>
    )
  }

  const grupo = (titulo: string | undefined, lista: readonly Jogador[], chave: string) => (
    <section key={chave} className="grupo-seletor-jogador">
      {titulo && <h3 className="titulo-grupo-jogador">{titulo}</h3>}
      <ul className="lista-seletor-jogador">{lista.map((jogador) => linha(jogador, chave))}</ul>
    </section>
  )

  return (
    <Modal
      titulo={criando ? t('players.new') : (titulo ?? t('players.choose'))}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      className="seletor-jogador"
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
            <>
              {/* Sem busca: atalhos antes da lista toda. */}
              {!busca && recentes.length > 0 && grupo(t('players.recent'), recentes, 'recentes')}
              {!busca && favoritos.length > 0 && grupo(t('players.favorites'), favoritos, 'favoritos')}
              {grupo(busca ? undefined : t('players.all'), visiveis, 'todos')}
            </>
          )}
        </>
      )}
    </Modal>
  )
}
