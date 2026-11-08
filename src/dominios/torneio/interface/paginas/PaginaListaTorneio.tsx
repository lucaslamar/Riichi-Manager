import { useMemo, useRef, useState, type ClipboardEvent, type CSSProperties } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useAlturaTeclado } from '@/compartilhado/interface/hooks/useAlturaTeclado'
import { IconeMenu } from '@/compartilhado/interface/layout/IconeMenu'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import FolhaCadastrados from '@/dominios/centerpiece/interface/componentes/FolhaCadastrados'
import { ModalConfirmacao } from '@/dominios/centerpiece/interface/componentes/ModaisPartida'
import { useAviso } from '@/dominios/centerpiece/interface/hooks/useAviso'
import {
  acrescentarNomes,
  jogadorDaLinha,
  linhasDoTexto,
  sugestoesParaLinha,
} from '@/dominios/centerpiece/logica/listaClube'
import { garantirJogadoresPorNomes, useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido, partesDoNome, type Jogador } from '@/dominios/jogadores/logica/jogadores'
import { rodadaAleatoria } from '../../logica/formatos/rodadaAleatoria'
import { formatoValido } from '../../logica/configuracao'
import { analisarLista, idsDaLista, limparColagem, type StatusLista } from '../../logica/listaTorneio'
import { iniciarTorneio } from '../../logica/torneio'
import type { ListaSalva, Torneio } from '../../logica/tipos'
import ConfigTorneioSheet from '../componentes/ConfigTorneioSheet'
import { useTorneios } from '../hooks/useTorneios'
import '@/dominios/centerpiece/interface/clube.css'
import '../torneio.css'

/** Altura de cada linha da folha, a mesma da Lista do clube. */
const ALTURA_LINHA = 48
const LINHAS_DE_FOLGA = 3

/**
 * Lista do torneio em estilo bloco de notas: um nome por linha. Sem foco ao abrir
 * (o teclado só sobe quando a pessoa toca na folha) e com o rascunho salvo a cada letra.
 */
export default function PaginaListaTorneio({
  torneio,
  aoVoltar,
  aoSortear,
}: {
  torneio: Torneio
  aoVoltar: () => void
  aoSortear: () => void
}) {
  const { t, numero } = useI18n()
  const { jogadores } = useJogadores()
  const { lista, listas, definirLista, guardarLista, excluirLista, salvar } = useTorneios()
  const { aviso, mostrar } = useAviso()
  const raiz = useRef<HTMLElement | null>(null)
  const campo = useRef<HTMLTextAreaElement | null>(null)
  useAlturaTeclado(raiz)

  const [linhaAtual, setLinhaAtual] = useState<number | null>(null)
  const [memoria, setMemoria] = useState(false)
  const [cadastrados, setCadastrados] = useState(false)
  const [limpando, setLimpando] = useState(false)
  const [configurando, setConfigurando] = useState(false)

  const linhas = useMemo(() => linhasDoTexto(lista), [lista])
  const analise = useMemo(() => analisarLista(lista, jogadores), [lista, jogadores])
  /** Um corte do Eliminatório maior que a lista também segura o sorteio. */
  const formatoOk = formatoValido(torneio.formato, analise.jogadores)
  const podeSortear = analise.podeSortear && formatoOk
  const vinculos = useMemo(() => linhas.map((linha) => jogadorDaLinha(jogadores, linha)), [linhas, jogadores])
  const idsNaLista = useMemo(
    () => new Set(vinculos.flatMap((jogador) => (jogador ? [jogador.id] : []))),
    [vinculos],
  )
  const sugestoes =
    linhaAtual === null ? [] : sugestoesParaLinha(jogadores, linhas[linhaAtual] ?? '', idsNaLista)

  const acompanharCursor = () => {
    const elemento = campo.current
    if (!elemento) return
    setLinhaAtual(elemento.value.slice(0, elemento.selectionStart).split('\n').length - 1)
  }

  /** Colar do WhatsApp: números e marcadores saem, cada nome numa linha. */
  const colar = (evento: ClipboardEvent<HTMLTextAreaElement>) => {
    const colado = evento.clipboardData.getData('text')
    if (!colado.includes('\n') && !/^\s*(\d|[-–—•·*])/.test(colado)) return
    evento.preventDefault()
    const elemento = evento.currentTarget
    const antes = lista.slice(0, elemento.selectionStart)
    const depois = lista.slice(elemento.selectionEnd)
    const limpo = limparColagem(colado)
    const separadorAntes = antes && !antes.endsWith('\n') ? '\n' : ''
    const separadorDepois = depois && !depois.startsWith('\n') ? '\n' : ''
    definirLista(`${antes}${separadorAntes}${limpo}${separadorDepois}${depois}`)
  }

  const usarSugestao = (jogador: Jogador) => {
    if (linhaAtual === null) return
    const novas = lista.split(/\r?\n/)
    novas[linhaAtual] = nomeExibido(jogador)
    definirLista(novas.join('\n'))
    const fim = novas.slice(0, linhaAtual + 1).join('\n').length
    requestAnimationFrame(() => {
      campo.current?.focus()
      campo.current?.setSelectionRange(fim, fim)
      setLinhaAtual(linhaAtual)
    })
  }

  const sortear = () => {
    if (!podeSortear) return
    const agora = new Date().toISOString()
    const ids = idsDaLista(analise.nomes, jogadores, garantirJogadoresPorNomes)
    salvar(iniciarTorneio(torneio, ids, rodadaAleatoria(ids, 1, agora), agora))
    aoSortear()
  }

  const totalDeLinhas = Math.max(linhas.length + LINHAS_DE_FOLGA, 8)
  const estiloFolha = { '--clb-linha': `${ALTURA_LINHA}px`, '--clb-linhas': totalDeLinhas } as CSSProperties

  return (
    <section ref={raiz} className="clb-lista trn-lista">
      <TituloTela
        titulo={t('tournament.list.title')}
        aoVoltar={aoVoltar}
        acoes={
          <span className="clb-acoes-titulo">
            <button
              type="button"
              className="cm-btn-icone"
              aria-label={t('tournament.list.memory')}
              title={t('tournament.list.memory')}
              onClick={() => setMemoria(true)}
            >
              <i className="fas fa-sd-card" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="cm-btn-icone"
              aria-label={t('tournament.list.settings')}
              title={t('tournament.list.settings')}
              onClick={() => setConfigurando(true)}
            >
              <i className="fas fa-gear" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="cm-btn-icone cm-btn-icone--perigo"
              aria-label={t('tournament.list.clear')}
              title={t('tournament.list.clear')}
              disabled={!lista.trim()}
              onClick={() => setLimpando(true)}
            >
              <i className="fas fa-trash" aria-hidden="true" />
            </button>
          </span>
        }
      />

      <div className="clb-folha" style={estiloFolha}>
        <ol className="clb-marcadores" aria-hidden="true">
          {linhas.map((linha, indice) => (
            <li key={indice}>
              {analise.repetidas.has(indice) ? (
                <span className="clb-marcador trn-marcador--repetido">
                  <i className="fas fa-clone" />
                </span>
              ) : vinculos[indice] ? (
                <span className="clb-marcador">
                  <i className="fas fa-user" />
                </span>
              ) : linha ? (
                <span className="clb-marcador clb-marcador--convidado trn-marcador--novo">
                  <i className="fas fa-user-plus" />
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        {/* Mesma fonte e posição do texto, só para sublinhar os repetidos em vermelho. */}
        <div className="trn-sublinhados" aria-hidden="true">
          {linhas.map((linha, indice) => (
            <div key={indice}>{analise.repetidas.has(indice) ? <span>{linha}</span> : ' '}</div>
          ))}
        </div>

        <textarea
          ref={campo}
          className="clb-campo trn-campo-lista"
          value={lista}
          rows={totalDeLinhas}
          wrap="off"
          spellCheck={false}
          autoCapitalize="words"
          autoComplete="off"
          enterKeyHint="next"
          placeholder={t('tournament.list.placeholder')}
          aria-label={t('tournament.list.editorLabel')}
          aria-describedby="trn-status"
          onChange={(evento) => {
            definirLista(evento.target.value)
            acompanharCursor()
          }}
          onPaste={colar}
          onSelect={acompanharCursor}
          onFocus={acompanharCursor}
          onBlur={() => setLinhaAtual(null)}
        />

        {sugestoes.length > 0 && linhaAtual !== null && (
          <ul
            className="clb-sugestoes"
            style={{ top: (linhaAtual + 1) * ALTURA_LINHA }}
            aria-label={t('match.club.suggestions')}
          >
            {sugestoes.map((jogador) => (
              <li key={jogador.id}>
                <button
                  type="button"
                  aria-label={t('match.club.suggestionLabel', { name: nomeExibido(jogador) })}
                  onPointerDown={(evento) => evento.preventDefault()}
                  onClick={() => usarSugestao(jogador)}
                >
                  <i className="fas fa-user" aria-hidden="true" />
                  <span>{nomeExibido(jogador)}</span>
                  {partesDoNome(jogador).apoio && nomeExibido(jogador) !== partesDoNome(jogador).apoio && (
                    <small>{partesDoNome(jogador).apoio}</small>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="ptd-rodape-fixo clb-rodape trn-rodape">
        <p id="trn-status" className="clb-contagem" aria-live="polite">
          <span className="clb-contadores">
            <span>
              <i className="fas fa-user" aria-hidden="true" />
              <strong aria-hidden="true">{numero(analise.jogadores)}</strong>
              <span className="sr-only">{t('match.club.players', { count: analise.jogadores })}</span>
            </span>
            <span className="clb-barra" aria-hidden="true" />
            <span>
              <IconeMenu icone="centerpiece" />
              <strong aria-hidden="true">{numero(analise.mesas)}</strong>
              <span className="sr-only">{t('match.club.tables', { count: analise.mesas })}</span>
            </span>
          </span>
          {analise.podeSortear && !formatoOk ? (
            <span className="clb-falta">{t('tournament.list.cutsTooBig')}</span>
          ) : (
            <TextoStatus status={analise.status} jogadores={analise.jogadores} mesas={analise.mesas} />
          )}
        </p>
        <button
          type="button"
          className="btn-primario ptd-btn-largo"
          disabled={!podeSortear}
          onClick={sortear}
        >
          <i className="fas fa-shuffle" aria-hidden="true" /> {t('tournament.list.draw')}
        </button>
      </div>

      {aviso && (
        <p className="ptd-aviso clb-aviso" role="status">
          {aviso}
        </p>
      )}

      {memoria && (
        <FolhaMemoria
          listas={listas}
          podeGuardar={analise.jogadores > 0}
          aoFechar={() => setMemoria(false)}
          aoGuardar={(nome) => {
            guardarLista(nome, analise.nomes.join('\n'))
            mostrar(t('tournament.list.saved', { name: nome }))
            setMemoria(false)
          }}
          aoCarregar={(salva) => {
            definirLista(salva.texto)
            mostrar(t('tournament.list.loaded', { name: salva.nome }))
            setMemoria(false)
          }}
          aoExcluir={(salva) => excluirLista(salva.id)}
          aoImportar={() => {
            setMemoria(false)
            setCadastrados(true)
          }}
        />
      )}

      {cadastrados && (
        <FolhaCadastrados
          idsNaLista={idsNaLista}
          aoFechar={() => setCadastrados(false)}
          aoConfirmar={(escolhidos) => {
            definirLista(acrescentarNomes(lista, escolhidos.map(nomeExibido), jogadores).texto)
            setCadastrados(false)
          }}
          aoUsarNomes={(nomes) => {
            definirLista(acrescentarNomes(lista, nomes, jogadores).texto)
            setCadastrados(false)
          }}
        />
      )}

      {configurando && (
        <ConfigTorneioSheet
          torneio={torneio}
          jogadores={analise.jogadores}
          aoFechar={() => setConfigurando(false)}
          aoSalvar={(atualizado) => {
            salvar(atualizado)
            setConfigurando(false)
            mostrar(t('tournament.settings.saved'))
          }}
        />
      )}

      {limpando && (
        <ModalConfirmacao
          titulo={t('tournament.list.clearTitle')}
          texto={t('tournament.list.clearHelp')}
          rotuloConfirmar={t('tournament.list.clear')}
          perigo
          aoFechar={() => setLimpando(false)}
          aoConfirmar={() => {
            definirLista('')
            setLimpando(false)
          }}
        />
      )}
    </section>
  )
}

function TextoStatus({ status, jogadores, mesas }: { status: StatusLista; jogadores: number; mesas: number }) {
  const { t } = useI18n()
  if (status.tipo === 'pronta') {
    return (
      <span className="trn-status trn-status--ok">
        {t('tournament.list.ready', { players: jogadores, tables: mesas })}{' '}
        <i className="fas fa-check" aria-hidden="true" />
      </span>
    )
  }
  const texto =
    status.tipo === 'repetidos'
      ? t('tournament.list.duplicates', { count: status.quantidade })
      : status.tipo === 'primeiraMesa'
        ? t('tournament.list.firstTable', { count: status.faltam })
        : t('tournament.list.nextTable', { count: status.faltam })
  return <span className="clb-falta">{texto}</span>
}

/** Cartão de memória: guardar a lista com um nome, carregar uma guardada ou puxar do cadastro. */
function FolhaMemoria({
  listas,
  podeGuardar,
  aoFechar,
  aoGuardar,
  aoCarregar,
  aoExcluir,
  aoImportar,
}: {
  listas: readonly ListaSalva[]
  podeGuardar: boolean
  aoFechar: () => void
  aoGuardar: (nome: string) => void
  aoCarregar: (lista: ListaSalva) => void
  aoExcluir: (lista: ListaSalva) => void
  aoImportar: () => void
}) {
  const { t, idioma } = useI18n()
  const [nome, setNome] = useState('')
  const contar = (texto: string) => linhasDoTexto(texto).filter(Boolean).length

  return (
    <Modal
      titulo={t('tournament.list.memory')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      className="trn-folha-memoria"
    >
      <form
        className="trn-guardar"
        onSubmit={(evento) => {
          evento.preventDefault()
          if (nome.trim() && podeGuardar) aoGuardar(nome.trim())
        }}
      >
        <label className="trn-data">
          <span>{t('tournament.list.saveAs')}</span>
          <input
            className="trn-campo"
            value={nome}
            placeholder={t('tournament.list.saveExample')}
            onChange={(evento) => setNome(evento.target.value)}
          />
        </label>
        <button type="submit" className="btn-primario" disabled={!nome.trim() || !podeGuardar}>
          {t('tournament.list.save')}
        </button>
      </form>

      <h3 className="ptd-rotulo">{t('tournament.list.savedLists')}</h3>
      {listas.length === 0 ? (
        <p className="ptd-vazio">{t('tournament.list.noSaved')}</p>
      ) : (
        <ul className="cm-lista">
          {listas.map((salva) => (
            <li key={salva.id} className="trn-salva">
              <button type="button" className="trn-card" onClick={() => aoCarregar(salva)}>
                <i className="fas fa-list" aria-hidden="true" />
                <strong>{salva.nome}</strong>
                <span>
                  {t('tournament.history.players', { count: contar(salva.texto) })} ·{' '}
                  {new Intl.DateTimeFormat(idioma, { dateStyle: 'short' }).format(new Date(salva.salvaEm))}
                </span>
              </button>
              <button
                type="button"
                className="cm-btn-icone cm-btn-icone--perigo"
                aria-label={t('tournament.list.deleteSaved', { name: salva.nome })}
                onClick={() => aoExcluir(salva)}
              >
                <i className="fas fa-trash" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button type="button" className="btn-contorno ptd-btn-largo trn-importar" onClick={aoImportar}>
        <i className="fas fa-users" aria-hidden="true" /> {t('tournament.list.import')}
      </button>
    </Modal>
  )
}
