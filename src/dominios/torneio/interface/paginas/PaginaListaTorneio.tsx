import { useMemo, useRef, useState, type ClipboardEvent, type CSSProperties } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { manterLinhaVisivel } from '@/compartilhado/interface/hooks/linhaVisivel'
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
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido, partesDoNome, type Jogador } from '@/dominios/jogadores/logica/jogadores'
import { rodadasIniciais } from '../../logica/formatos'
import { formatoValido } from '../../logica/configuracao'
import { analisarLista, entradasDoTorneio, limparColagem, type StatusLista } from '../../logica/listaTorneio'
import FolhaImportar from '../componentes/FolhaImportar'
import { iniciarTorneio } from '../../logica/torneio'
import type { ListaSalva, Torneio } from '../../logica/tipos'
import ConfigTorneioSheet from '../componentes/ConfigTorneioSheet'
import { useTorneios } from '../hooks/useTorneios'
import '@/dominios/centerpiece/interface/clube.css'
import '../torneio.css'

/** Altura de cada linha da folha, a mesma da Lista do clube. */
const ALTURA_LINHA = 48
const LINHAS_DE_FOLGA = 1

/**
 * Lista do torneio em estilo bloco de notas: um nome por linha. Sem foco ao abrir
 * (o teclado só sobe quando a pessoa toca na folha) e com o rascunho salvo a cada letra.
 */
export default function PaginaListaTorneio({
  torneio,
  aoVoltar,
  aoSortear,
  aoImportado,
}: {
  torneio: Torneio
  aoVoltar: () => void
  aoSortear: () => void
  /** Torneio que chegou de outro aparelho: abre no lugar deste rascunho. */
  aoImportado: (torneioId: string) => void
}) {
  const { t, numero } = useI18n()
  const { jogadores, adicionar } = useJogadores()
  const { lista, listas, definirLista, guardarLista, excluirLista, salvar, excluir } = useTorneios()
  const { aviso, mostrar } = useAviso()
  const raiz = useRef<HTMLElement | null>(null)
  const campo = useRef<HTMLTextAreaElement | null>(null)

  const [linhaAtual, setLinhaAtual] = useState<number | null>(null)
  const [memoria, setMemoria] = useState(false)
  const [cadastrados, setCadastrados] = useState(false)
  const [limpando, setLimpando] = useState(false)
  const [importando, setImportando] = useState(false)
  const [configurando, setConfigurando] = useState(false)
  const [renomeando, setRenomeando] = useState(false)

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
    const linha = elemento.value.slice(0, elemento.selectionStart).split('\n').length - 1
    setLinhaAtual(linha)
    // A linha em edição fica acima da barra (que sobe com o teclado).
    manterLinhaVisivel(elemento, linha, ALTURA_LINHA)
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

  const cadastrar = (nome: string) => {
    const resultado = adicionar({ nome })
    mostrar(
      resultado.ok
        ? t('match.club.registered', { name: nome })
        : t(resultado.erro === 'nomeDuplicado' ? 'players.errorDuplicateName' : 'players.errorEmptyName'),
    )
  }

  const sortear = () => {
    if (!podeSortear) return
    const agora = new Date().toISOString()
    // Ninguém é cadastrado sozinho: quem não está no cadastro entra como convidado.
    const { ids, convidados } = entradasDoTorneio(analise.nomes, jogadores, gerarId)
    salvar(iniciarTorneio({ ...torneio, convidados }, ids, rodadasIniciais(torneio, ids, agora), agora))
    aoSortear()
  }

  const totalDeLinhas = Math.max(linhas.length + LINHAS_DE_FOLGA, 4)
  const estiloFolha = { '--clb-linha': `${ALTURA_LINHA}px`, '--clb-linhas': totalDeLinhas } as CSSProperties

  return (
    <section
      ref={raiz}
      className="clb-lista trn-lista"
      // Folha curta: tocar no vazio abaixo dos nomes leva o cursor para o fim da lista.
      onClick={(evento) => {
        if (evento.target !== evento.currentTarget) return
        const elemento = campo.current
        if (!elemento) return
        elemento.focus()
        elemento.setSelectionRange(elemento.value.length, elemento.value.length)
      }}
    >
      <TituloTela
        titulo={
          <button
            type="button"
            className="trn-titulo-editavel"
            aria-label={t('tournament.list.rename', { name: torneio.nome })}
            onClick={() => setRenomeando(true)}
          >
            <span>{torneio.nome}</span>
            <i className="fas fa-pen" aria-hidden="true" />
          </button>
        }
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
              aria-label={t('tournament.import.menu')}
              title={t('tournament.import.menu')}
              onClick={() => setImportando(true)}
            >
              <i className="fas fa-file-import" aria-hidden="true" />
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
                <span className="clb-marcador clb-marcador--convidado" title={t('match.club.guestShort')}>
                  <i className="far fa-user" />
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

        {/* Como no Encontro do clube: quem não está no cadastro joga como convidado, e
            "Cadastrar" na linha é opcional, sem tirar o foco do texto. */}
        <div className="clb-acoes-linhas">
          {linhas.map((linha, indice) =>
            linha && !vinculos[indice] && !analise.repetidas.has(indice) ? (
              <button
                key={`${indice}-${linha}`}
                type="button"
                className="clb-cadastrar"
                style={{ top: indice * ALTURA_LINHA }}
                aria-label={t('match.club.registerNamed', { name: linha })}
                onPointerDown={(evento) => evento.preventDefault()}
                onClick={() => cadastrar(linha)}
              >
                {t('match.club.register')}
              </button>
            ) : null,
          )}
        </div>

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
        <div className="trn-rodape-topo">
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
            <span className="clb-falta">
              {t(torneio.formato.tipo === 'temporada' ? 'tournament.list.pickSeason' : 'tournament.list.cutsTooBig')}
            </span>
          ) : (
            <TextoStatus status={analise.status} jogadores={analise.jogadores} mesas={analise.mesas} />
          )}
        </p>
        <span className="trn-rodape-icones">
          <button
            type="button"
            className="trn-adicionar-cadastro"
            aria-label={t('tournament.list.clear')}
            title={t('tournament.list.clear')}
            disabled={!lista.trim()}
            onClick={() => setLimpando(true)}
          >
            <i className="fas fa-trash" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="trn-adicionar-cadastro"
            aria-label={t('tournament.list.import')}
            title={t('tournament.list.import')}
            onClick={() => setCadastrados(true)}
          >
            <i className="fas fa-address-book" aria-hidden="true" />
          </button>
          {/* Com o teclado aberto o Sortear some: a seta, como a de enviar do WhatsApp, sorteia. */}
          <button
            type="button"
            className="trn-adicionar-cadastro clb-enviar"
            aria-label={t('tournament.list.draw')}
            title={t('tournament.list.draw')}
            disabled={!podeSortear}
            onClick={sortear}
          >
            <i className="fas fa-paper-plane" aria-hidden="true" />
          </button>
        </span>
        </div>
        <button
          type="button"
          className="btn-primario ptd-btn-largo clb-sortear"
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

      {renomeando && (
        <FolhaNome
          nome={torneio.nome}
          aoFechar={() => setRenomeando(false)}
          aoSalvar={(nome) => {
            salvar({ ...torneio, nome })
            setRenomeando(false)
          }}
        />
      )}

      {importando && (
        <FolhaImportar
          aoFechar={() => setImportando(false)}
          aoImportado={(torneioId) => {
            setImportando(false)
            // Rascunho vazio não serve para nada depois da importação.
            if (!lista.trim() && torneioId !== torneio.id) excluir(torneio.id)
            aoImportado(torneioId)
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
}: {
  listas: readonly ListaSalva[]
  podeGuardar: boolean
  aoFechar: () => void
  aoGuardar: (nome: string) => void
  aoCarregar: (lista: ListaSalva) => void
  aoExcluir: (lista: ListaSalva) => void
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

    </Modal>
  )
}

/** Nome do torneio: aparece no título da Lista e das Mesas sorteadas. */
function FolhaNome({
  nome,
  aoFechar,
  aoSalvar,
}: {
  nome: string
  aoFechar: () => void
  aoSalvar: (nome: string) => void
}) {
  const { t } = useI18n()
  const [texto, setTexto] = useState(nome)
  const valido = texto.trim().length > 0
  return (
    <Modal
      titulo={t('tournament.settings.name')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      rodape={
        <div className="ptd-acoes-folha">
          <button type="button" className="btn-contorno" onClick={aoFechar}>
            {t('actions.cancel')}
          </button>
          <button
            type="submit"
            form="trn-form-nome"
            className="btn-primario"
            disabled={!valido}
          >
            {t('tournament.settings.save')}
          </button>
        </div>
      }
    >
      <form
        id="trn-form-nome"
        onSubmit={(evento) => {
          evento.preventDefault()
          if (valido) aoSalvar(texto.trim())
        }}
      >
        <input
          className="trn-campo"
          value={texto}
          maxLength={60}
          aria-label={t('tournament.settings.name')}
          enterKeyHint="done"
          onChange={(evento) => setTexto(evento.target.value)}
        />
      </form>
    </Modal>
  )
}
