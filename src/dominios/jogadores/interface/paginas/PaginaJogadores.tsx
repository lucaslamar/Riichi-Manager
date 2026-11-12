import { useEffect, useMemo, useRef, useState } from 'react'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import {
  buscarJogadores,
  linhaDeApoio,
  ordenarJogadores,
  partesDoNome,
  type Jogador,
} from '../../logica/jogadores'
import FormJogador from '../componentes/FormJogador'
import { useJogadores } from '../hooks/useJogadores'
import { useEu } from '../hooks/useEu'
import '../jogadores.css'

const DURACAO_DESFAZER_MS = 6000

/** Formulário aberto: jogador novo ou o que está sendo editado. */
type Edicao = { tipo: 'novo' } | { tipo: 'editar'; jogador: Jogador }

/** Onde o jogador aparece; vem de quem conhece as partidas. */
export interface UsoDoJogador {
  /** Nome das mesas em andamento: enquanto houver, não dá para arquivar nem excluir. */
  mesasAbertas: string[]
  partidasFinalizadas: number
}

function DadosJogador({ jogador, souEu = false }: { jogador: Jogador; souEu?: boolean }) {
  const { t } = useI18n()
  const { principal } = partesDoNome(jogador)
  const apoio = linhaDeApoio(jogador)
  return (
    <div className="dados-jogador">
      <span className="nome-cadastro">
        {principal}
        {souEu && <span className="selo-eu">{t('players.me')}</span>}
      </span>
      {apoio && <span className="apelido-jogador">{apoio}</span>}
    </div>
  )
}

export default function PaginaJogadores({
  aoVoltar,
  usoDoJogador,
  aoExcluir,
}: {
  aoVoltar: () => void
  usoDoJogador: (id: string) => UsoDoJogador
  /** Antes de sair do cadastro: as partidas guardam o nome dele. */
  aoExcluir: (jogador: Jogador) => void
}) {
  const { t, idioma } = useI18n()
  const { jogadores, adicionar, editar, arquivar, restaurar, excluir, devolver, favoritar } = useJogadores()
  const { euId, definirEu } = useEu()
  const [busca, setBusca] = useState('')
  const [verArquivados, setVerArquivados] = useState(false)
  const [edicao, setEdicao] = useState<Edicao | null>(null)
  const [menuDe, setMenuDe] = useState<Jogador | null>(null)
  const [paraArquivar, setParaArquivar] = useState<Jogador | null>(null)
  const [paraExcluir, setParaExcluir] = useState<Jogador | null>(null)
  const [bloqueado, setBloqueado] = useState<{ jogador: Jogador; mesas: string[] } | null>(null)
  const [excluido, setExcluido] = useState<Jogador | null>(null)
  const temporizador = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(temporizador.current), [])

  const encontrados = useMemo(
    () => ordenarJogadores(buscarJogadores(jogadores, busca), idioma),
    [jogadores, busca, idioma],
  )
  const ativos = encontrados.filter((jogador) => !jogador.arquivado)
  const arquivados = encontrados.filter((jogador) => jogador.arquivado)

  /** Quem está numa mesa aberta não pode sair: mostra o motivo no lugar. */
  const seLivre = (jogador: Jogador, acao: () => void) => {
    setMenuDe(null)
    const { mesasAbertas } = usoDoJogador(jogador.id)
    if (mesasAbertas.length > 0) setBloqueado({ jogador, mesas: mesasAbertas })
    else acao()
  }

  const confirmarExclusao = (jogador: Jogador) => {
    aoExcluir(jogador)
    excluir(jogador.id)
    setParaExcluir(null)
    setExcluido(jogador)
    window.clearTimeout(temporizador.current)
    temporizador.current = window.setTimeout(() => setExcluido(null), DURACAO_DESFAZER_MS)
  }

  const finalizadas = paraExcluir ? usoDoJogador(paraExcluir.id).partidasFinalizadas : 0

  return (
    <section className="pagina-jogadores">
      <TituloTela titulo={t('players.title')} aoVoltar={aoVoltar} />

      <div className="barra-jogadores">
        <div className="busca-jogadores">
          <i className="fas fa-magnifying-glass" aria-hidden="true" />
          <input
            className="entrada-jogador"
            type="search"
            value={busca}
            placeholder={t('players.search')}
            aria-label={t('players.search')}
            autoComplete="off"
            onChange={(evento) => setBusca(evento.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn-primario botao-adicionar-jogador"
          aria-label={t('players.add')}
          title={t('players.add')}
          onClick={() => setEdicao({ tipo: 'novo' })}
        >
          <i className="fas fa-plus" aria-hidden="true" />
        </button>
      </div>

      {ativos.length === 0 ? (
        <p className="vazio-jogadores">{busca ? t('players.noResults') : t('players.empty')}</p>
      ) : (
        <ul className="lista-jogadores">
          {ativos.map((jogador) => (
            <li key={jogador.id} className="linha-cadastro">
              <DadosJogador jogador={jogador} souEu={jogador.id === euId} />
              <button
                type="button"
                className={`estrela-jogador acao-jogador${jogador.favorito ? ' estrela-jogador--ativa' : ''}`}
                aria-pressed={!!jogador.favorito}
                aria-label={t(jogador.favorito ? 'players.unfavorite' : 'players.favorite', { name: jogador.nome })}
                onClick={() => favoritar(jogador.id, !jogador.favorito)}
              >
                <i className={`${jogador.favorito ? 'fas' : 'far'} fa-star`} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="acao-jogador"
                aria-label={t('players.renameNamed', { name: jogador.nome })}
                title={t('players.rename')}
                onClick={() => setEdicao({ tipo: 'editar', jogador })}
              >
                <i className="fas fa-pen" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="acao-jogador"
                aria-label={t('players.moreActions', { name: jogador.nome })}
                onClick={() => setMenuDe(jogador)}
              >
                <i className="fas fa-ellipsis" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {arquivados.length > 0 && (
        <div className="arquivados-jogadores">
          <button
            type="button"
            className="botao-arquivados"
            aria-expanded={verArquivados}
            onClick={() => setVerArquivados((aberto) => !aberto)}
          >
            <i className={`fas fa-chevron-${verArquivados ? 'down' : 'right'}`} aria-hidden="true" />
            {t('players.archivedCount', { count: arquivados.length })}
          </button>
          {verArquivados && (
            <ul className="lista-jogadores">
              {arquivados.map((jogador) => (
                <li key={jogador.id} className="linha-cadastro linha-cadastro--arquivada">
                  <DadosJogador jogador={jogador} />
                  <button
                    type="button"
                    className="acao-jogador"
                    aria-label={t('players.moreActions', { name: jogador.nome })}
                    onClick={() => setMenuDe(jogador)}
                  >
                    <i className="fas fa-ellipsis" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {edicao && (
        <Modal
          titulo={edicao.tipo === 'novo' ? t('players.new') : t('players.rename')}
          aoFechar={() => setEdicao(null)}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
        >
          <FormJogador
            inicial={edicao.tipo === 'editar' ? edicao.jogador : undefined}
            aoCancelar={() => setEdicao(null)}
            aoSalvar={(dados) => {
              const resultado =
                edicao.tipo === 'novo' ? adicionar(dados) : editar(edicao.jogador.id, dados)
              if (resultado.ok) setEdicao(null)
              return resultado
            }}
          />
        </Modal>
      )}

      {menuDe && (
        <Modal
          titulo={menuDe.nome}
          aoFechar={() => setMenuDe(null)}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
        >
          <div className="menu-jogador">
            {!menuDe.arquivado && (
              // Só um "eu" por vez: marcar outra pessoa troca a marca.
              <button
                type="button"
                aria-pressed={menuDe.id === euId}
                onClick={() => {
                  definirEu(menuDe.id === euId ? null : menuDe.id)
                  setMenuDe(null)
                }}
              >
                <i className={`fas ${menuDe.id === euId ? 'fa-user-minus' : 'fa-user-check'}`} aria-hidden="true" />
                {t(menuDe.id === euId ? 'players.notMe' : 'players.itsMe')}
              </button>
            )}
            {menuDe.arquivado ? (
              <button
                type="button"
                onClick={() => {
                  restaurar(menuDe.id)
                  setMenuDe(null)
                }}
              >
                <i className="fas fa-rotate-left" aria-hidden="true" />
                {t('players.restore')}
              </button>
            ) : (
              <button type="button" onClick={() => seLivre(menuDe, () => setParaArquivar(menuDe))}>
                <i className="fas fa-box-archive" aria-hidden="true" />
                {t('players.archive')}
              </button>
            )}
            <button
              type="button"
              className="menu-jogador-perigo"
              onClick={() => seLivre(menuDe, () => setParaExcluir(menuDe))}
            >
              <i className="fas fa-trash" aria-hidden="true" />
              {t('players.delete')}
            </button>
          </div>
        </Modal>
      )}

      {bloqueado && (
        <Modal
          titulo={t('players.inUseTitle', { name: bloqueado.jogador.nome })}
          aoFechar={() => setBloqueado(null)}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
        >
          <p>{t('players.inUseHelp', { tables: bloqueado.mesas.join(', ') })}</p>
        </Modal>
      )}

      {paraExcluir && (
        <Modal
          titulo={t('players.deleteTitle', { name: paraExcluir.nome })}
          aoFechar={() => setParaExcluir(null)}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
          rodape={
            <div className="acoes-form-jogador">
              {finalizadas > 0 && !paraExcluir.arquivado ? (
                <>
                  <button
                    type="button"
                    className="btn-contorno menu-jogador-perigo"
                    onClick={() => confirmarExclusao(paraExcluir)}
                  >
                    {t('players.deleteAnyway')}
                  </button>
                  <button
                    type="button"
                    className="btn-primario"
                    onClick={() => {
                      arquivar(paraExcluir.id)
                      setParaExcluir(null)
                    }}
                  >
                    {t('players.archive')}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn-contorno" onClick={() => setParaExcluir(null)}>
                    {t('actions.cancel')}
                  </button>
                  <button
                    type="button"
                    className="btn-primario ptd-btn-perigo"
                    onClick={() => confirmarExclusao(paraExcluir)}
                  >
                    {finalizadas > 0 ? t('players.deleteAnyway') : t('players.delete')}
                  </button>
                </>
              )}
            </div>
          }
        >
          {finalizadas > 0 ? (
            <p>
              {t(finalizadas === 1 ? 'players.deleteImpactOne' : 'players.deleteImpact', {
                name: paraExcluir.nome,
                count: finalizadas,
              })}
            </p>
          ) : (
            <p>{t('players.deleteHelp')}</p>
          )}
        </Modal>
      )}

      {paraArquivar && (
        <Modal
          titulo={t('players.archiveTitle', { name: paraArquivar.nome })}
          aoFechar={() => setParaArquivar(null)}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
          rodape={
            <div className="acoes-form-jogador">
              <button type="button" className="btn-contorno" onClick={() => setParaArquivar(null)}>
                {t('actions.cancel')}
              </button>
              <button
                type="button"
                className="btn-primario"
                onClick={() => {
                  arquivar(paraArquivar.id)
                  setParaArquivar(null)
                }}
              >
                {t('players.archive')}
              </button>
            </div>
          }
        >
          <p>{t('players.archiveHelp')}</p>
        </Modal>
      )}

      {excluido && (
        <div className="aviso-excluido" role="status">
          <span>{t('players.deleted', { name: excluido.nome })}</span>
          <button
            type="button"
            onClick={() => {
              devolver(excluido)
              setExcluido(null)
            }}
          >
            {t('players.undoDelete')}
          </button>
        </div>
      )}
    </section>
  )
}
