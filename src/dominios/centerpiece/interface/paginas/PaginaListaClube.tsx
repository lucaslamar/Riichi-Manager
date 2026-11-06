import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { IconeMenu } from '@/compartilhado/interface/layout/IconeMenu'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import {
  buscarJogadores,
  nomeExibido,
  ordenarJogadores,
  partesDoNome,
  type Jogador,
} from '@/dominios/jogadores/logica/jogadores'
import {
  acrescentarNomes,
  entradasDaLista,
  jogadorDaLinha,
  limparLista,
  linhasDoTexto,
  sugestoesParaLinha,
} from '../../logica/listaClube'
import { contagemDeMesas } from '../../logica/sorteioClube'
import { ModalConfirmacao } from '../componentes/ModaisPartida'
import { useAviso } from '../hooks/useAviso'
import { useClube } from '../hooks/useClube'

/** Altura de cada linha da folha; o marcador e o "Cadastrar" se alinham por ela. */
const ALTURA_LINHA = 48
/** Linhas vazias abaixo do texto, para a folha parecer uma página e não um campo. */
const LINHAS_DE_FOLGA = 3

/**
 * Lista do clube, no estilo bloco de notas: uma folha onde se digita um nome por
 * linha. O texto é o que vale; o vínculo com o cadastro sai do próprio nome.
 */
export default function PaginaListaClube({
  aoVoltar,
  aoSortear,
}: {
  aoVoltar: () => void
  aoSortear: () => void
}) {
  const { t, numero } = useI18n()
  const { jogadores, adicionar } = useJogadores()
  const { lista, sorteio, encontros, definirLista, sortear, limpar } = useClube()
  // O encontro mais recente segue guardado mesmo depois de limpar a lista.
  const ultimoEncontro = encontros[encontros.length - 1] as (typeof encontros)[number] | undefined
  const { aviso, mostrar } = useAviso()
  const campo = useRef<HTMLTextAreaElement | null>(null)

  // Como no Samsung Notes: folha vazia abre com o cursor pronto. Com nomes, abre
  // sem selecionar, para conferir a lista sem o teclado na frente.
  useEffect(() => {
    const elemento = campo.current
    if (elemento && !elemento.value.trim()) elemento.focus({ preventScroll: true })
  }, [])
  const [linhaAtual, setLinhaAtual] = useState<number | null>(null)
  /**
   * Folha de cadastrados aberta: guarda quantos nomes ficam antes do ponto onde os
   * escolhidos entram (a contagem sobrevive à limpeza das linhas vazias no blur).
   */
  const [inserirApos, setInserirApos] = useState<number | null>(null)
  const [limpando, setLimpando] = useState(false)

  const linhas = useMemo(() => linhasDoTexto(lista), [lista])
  const entradas = useMemo(() => entradasDaLista(lista, jogadores), [lista, jogadores])
  const idsNaLista = useMemo(
    () => new Set(entradas.flatMap((entrada) => (entrada.jogadorId ? [entrada.jogadorId] : []))),
    [entradas],
  )
  const contagem = contagemDeMesas(entradas.length)
  const vinculos = useMemo(() => linhas.map((linha) => jogadorDaLinha(jogadores, linha)), [linhas, jogadores])

  const textoDaLinhaAtual = linhaAtual === null ? '' : (linhas[linhaAtual] ?? '')
  const sugestoes =
    linhaAtual === null ? [] : sugestoesParaLinha(jogadores, textoDaLinhaAtual, idsNaLista)

  const avisarRepetidos = (repetidos: number) => {
    if (repetidos > 0) mostrar(t('match.club.duplicatesRemoved', { count: repetidos }))
  }

  /** Linha do cursor, para as sugestões aparecerem logo abaixo dela. */
  const acompanharCursor = () => {
    const elemento = campo.current
    if (!elemento) return
    setLinhaAtual(elemento.value.slice(0, elemento.selectionStart).split('\n').length - 1)
  }

  /** Ao sair do campo: tira linhas vazias e repetidos, avisando o que saiu. */
  const arrumar = () => {
    setLinhaAtual(null)
    const limpa = limparLista(lista, jogadores)
    if (limpa.texto !== lista) definirLista(limpa.texto)
    avisarRepetidos(limpa.repetidos)
  }

  const usarSugestao = (jogador: Jogador) => {
    if (linhaAtual === null) return
    const novas = [...lista.split(/\r?\n/)]
    novas[linhaAtual] = nomeExibido(jogador)
    const texto = novas.join('\n')
    definirLista(texto)
    // Cursor no fim da linha completada, pronto para o Enter do próximo nome.
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

  const iniciarSorteio = () => {
    const limpa = limparLista(lista, jogadores)
    if (limpa.texto !== lista) definirLista(limpa.texto)
    if (sortear(entradasDaLista(limpa.texto, jogadores))) aoSortear()
  }

  /** Nomes escolhidos (cadastrados ou do último encontro) entram no fim da lista. */
  const acrescentar = (nomes: string[]) => {
    const resultado = acrescentarNomes(lista, nomes, jogadores, inserirApos ?? undefined)
    definirLista(resultado.texto)
    avisarRepetidos(resultado.repetidos)
    setInserirApos(null)
  }

  const abrirCadastrados = () => setInserirApos(Number.MAX_SAFE_INTEGER)

  const totalDeLinhas = Math.max(linhas.length + LINHAS_DE_FOLGA, 8)
  const estiloFolha = {
    '--clb-linha': `${ALTURA_LINHA}px`,
    '--clb-linhas': totalDeLinhas,
  } as CSSProperties

  return (
    <section className="clb-lista">
      <TituloTela
        titulo={t('match.club.listTitle')}
        aoVoltar={aoVoltar}
        acoes={
          <span className="clb-acoes-titulo">
            {/* Cartão de memória: puxar quem já está salvo no cadastro. */}
            <button
              type="button"
              className="cm-btn-icone"
              aria-label={t('match.club.registeredTitle')}
              title={t('match.club.registeredTitle')}
              onClick={abrirCadastrados}
            >
              <i className="fas fa-sd-card" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="cm-btn-icone cm-btn-icone--perigo"
              aria-label={t('match.club.clear')}
              title={t('match.club.clear')}
              disabled={!lista.trim() && !sorteio}
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
              {vinculos[indice] ? (
                <span className="clb-marcador" title={t('match.club.linkedShort')}>
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

        <textarea
          ref={campo}
          className="clb-campo"
          value={lista}
          rows={totalDeLinhas}
          wrap="off"
          spellCheck={false}
          autoCapitalize="words"
          autoComplete="off"
          enterKeyHint="next"
          placeholder={t('match.club.placeholder')}
          aria-label={t('match.club.editorLabel')}
          aria-describedby="clb-contagem"
          onChange={(evento) => {
            definirLista(evento.target.value)
            acompanharCursor()
          }}
          onSelect={acompanharCursor}
          onFocus={acompanharCursor}
          onBlur={arrumar}
        />

        {/* Ação discreta na linha: "Cadastrar" quem não está no cadastro, sem tirar o foco do texto. */}
        <div className="clb-acoes-linhas">
          {linhas.map((linha, indice) =>
            linha && !vinculos[indice] ? (
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

      {/* Para leitor de tela: quem está na lista e quem entra como convidado. */}
      <ul className="sr-only" aria-label={t('match.club.listSummary')}>
        {entradas.map((entrada) => (
          <li key={entrada.jogadorId ?? entrada.nome}>
            {t(entrada.jogadorId ? 'match.club.linked' : 'match.club.guest', { name: entrada.nome })}
          </li>
        ))}
      </ul>

      <div className="ptd-rodape-fixo clb-rodape">
        <p id="clb-contagem" className="clb-contagem" aria-live="polite">
          {/* Ícones no lugar das palavras; o leitor de tela ouve "12 jogadores, 3 mesas". */}
          <span className="clb-contadores">
            <span>
              <i className="fas fa-user" aria-hidden="true" />
              <strong aria-hidden="true">{numero(entradas.length)}</strong>
              <span className="sr-only">{t('match.club.players', { count: entradas.length })}</span>
            </span>
            <span className="clb-barra" aria-hidden="true" />
            <span>
              <IconeMenu icone="centerpiece" />
              <strong aria-hidden="true">{numero(contagem.mesas)}</strong>
              <span className="sr-only">{t('match.club.tables', { count: contagem.mesas })}</span>
            </span>
          </span>
          {!contagem.podeSortear && (
            <span className="clb-falta">
              {entradas.length < 4
                ? t('match.club.minimum', { count: 4 - entradas.length })
                : `${t('match.club.missing', { count: contagem.faltam })}, ${t('match.club.leftover', { count: contagem.sobram })}`}
            </span>
          )}
        </p>
        <button
          type="button"
          className="btn-primario ptd-btn-largo"
          disabled={!contagem.podeSortear}
          onClick={iniciarSorteio}
        >
          <i className="fas fa-shuffle" aria-hidden="true" /> {t('match.club.draw')}
        </button>
      </div>

      {aviso && (
        <p className="ptd-aviso clb-aviso" role="status">
          {aviso}
        </p>
      )}

      {inserirApos !== null && (
        <FolhaCadastrados
          idsNaLista={idsNaLista}
          ultimoEncontro={
            ultimoEncontro
              ? { criadoEm: ultimoEncontro.criadoEm, nomes: ultimoEncontro.jogadores.map((entrada) => entrada.nome) }
              : undefined
          }
          aoFechar={() => setInserirApos(null)}
          aoConfirmar={(escolhidos) => acrescentar(escolhidos.map(nomeExibido))}
          aoUsarNomes={acrescentar}
        />
      )}

      {limpando && (
        <ModalConfirmacao
          titulo={t('match.club.clearTitle')}
          texto={t('match.club.clearHelp')}
          rotuloConfirmar={t('match.club.clear')}
          perigo
          aoFechar={() => setLimpando(false)}
          aoConfirmar={() => {
            limpar()
            setLimpando(false)
          }}
        />
      )}
    </section>
  )
}

/** Folha inferior com o cadastro: busca e seleção de vários de uma vez. */
function FolhaCadastrados({
  idsNaLista,
  ultimoEncontro,
  aoFechar,
  aoConfirmar,
  aoUsarNomes,
}: {
  idsNaLista: ReadonlySet<string>
  /** Nomes do encontro mais recente, para repetir a lista de uma vez. */
  ultimoEncontro?: { criadoEm: string; nomes: string[] }
  aoFechar: () => void
  aoConfirmar: (jogadores: Jogador[]) => void
  aoUsarNomes: (nomes: string[]) => void
}) {
  const { t, idioma } = useI18n()
  const { jogadores } = useJogadores()
  const [busca, setBusca] = useState('')
  const [escolhidos, setEscolhidos] = useState<string[]>([])

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

  const alternar = (id: string) =>
    setEscolhidos((atuais) => (atuais.includes(id) ? atuais.filter((item) => item !== id) : [...atuais, id]))

  return (
    <Modal
      titulo={t('match.club.registeredTitle')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      className="seletor-jogador clb-folha-cadastrados"
      rodape={
        <div className="ptd-acoes-folha">
          <button type="button" className="btn-contorno" onClick={aoFechar}>
            {t('actions.cancel')}
          </button>
          <button
            type="button"
            className="btn-primario"
            disabled={escolhidos.length === 0}
            onClick={() =>
              // Na ordem em que foram tocados, que é a ordem em que chegaram.
              aoConfirmar(
                escolhidos.flatMap((id) => jogadores.find((jogador) => jogador.id === id) ?? []),
              )
            }
          >
            {t('match.club.addSelected', { count: escolhidos.length })}
          </button>
        </div>
      }
    >
      {/* Atalho: a lista inteira do último encontro, convidados inclusive. */}
      {ultimoEncontro && ultimoEncontro.nomes.length > 0 && (
        <button type="button" className="clb-ultimo-encontro" onClick={() => aoUsarNomes(ultimoEncontro.nomes)}>
          <i className="fas fa-clock-rotate-left" aria-hidden="true" />
          <span className="clb-ultimo-encontro-texto">
            <strong>{t('match.club.lastDrawNames')}</strong>
            <span className="ptd-apoio">
              <time dateTime={ultimoEncontro.criadoEm}>
                {new Intl.DateTimeFormat(idioma, { dateStyle: 'short', timeStyle: 'short' }).format(
                  new Date(ultimoEncontro.criadoEm),
                )}
              </time>
              {' · '}
              {ultimoEncontro.nomes.join(', ')}
            </span>
          </span>
          <span className="clb-ultimo-encontro-acao">
            {t('match.club.useNames', { count: ultimoEncontro.nomes.length })}
          </span>
        </button>
      )}
      <input
        className="entrada-jogador"
        type="search"
        value={busca}
        placeholder={t('players.search')}
        aria-label={t('players.search')}
        autoComplete="off"
        onChange={(evento) => setBusca(evento.target.value)}
      />
      {visiveis.length === 0 ? (
        <p className="vazio-jogadores">{busca ? t('players.noResults') : t('players.empty')}</p>
      ) : (
        <ul className="lista-seletor-jogador clb-lista-cadastrados">
          {visiveis.map((jogador) => {
            const naLista = idsNaLista.has(jogador.id)
            const marcado = naLista || escolhidos.includes(jogador.id)
            return (
              <li key={jogador.id}>
                <label className={`opcao-seletor-jogador clb-opcao${naLista ? ' clb-opcao--na-lista' : ''}`}>
                  <input
                    type="checkbox"
                    aria-label={nomeExibido(jogador)}
                    checked={marcado}
                    disabled={naLista}
                    onChange={() => alternar(jogador.id)}
                  />
                  <span className="dados-jogador">
                    <span className="nome-cadastro">
                      {partesDoNome(jogador).principal}
                      {jogador.clube && <small className="clube-jogador"> {jogador.clube}</small>}
                    </span>
                    {partesDoNome(jogador).apoio && (
                      <span className="apelido-jogador">{partesDoNome(jogador).apoio}</span>
                    )}
                  </span>
                  {naLista && <span className="selo-jogador">{t('match.club.alreadyInList')}</span>}
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </Modal>
  )
}
