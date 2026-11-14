import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { manterLinhaVisivel } from '@/compartilhado/interface/hooks/linhaVisivel'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { IconeMenu } from '@/compartilhado/interface/layout/IconeMenu'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido, partesDoNome, type Jogador } from '@/dominios/jogadores/logica/jogadores'
import {
  acrescentarNomes,
  entradasDaLista,
  jogadorDaLinha,
  limparLista,
  linhasDoTexto,
  sugestoesParaLinha,
} from '../../logica/listaClube'
import { contagemDeMesas } from '../../logica/sorteioClube'
import BotaoConfiguracoes from '@/dominios/configuracoes/interface/BotaoConfiguracoes'
import '@/dominios/torneio/interface/torneio.css'
import FolhaListasSalvas from '@/dominios/torneio/interface/componentes/FolhaListasSalvas'
import { useTorneios } from '@/dominios/torneio/interface/hooks/useTorneios'
import FolhaCadastrados from '../componentes/FolhaCadastrados'
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
  const [listasSalvas, setListasSalvas] = useState(false)
  const { listas, guardarLista, excluirLista } = useTorneios()

  const linhas = useMemo(() => linhasDoTexto(lista), [lista])
  const entradas = useMemo(() => entradasDaLista(lista, jogadores), [lista, jogadores])
  const idsNaLista = useMemo(
    () => new Set(entradas.flatMap((entrada) => (entrada.jogadorId ? [entrada.jogadorId] : []))),
    [entradas],
  )
  const contagem = contagemDeMesas(entradas.length)
  const vinculos = useMemo(
    () => linhas.map((linha) => jogadorDaLinha(jogadores, linha)),
    [linhas, jogadores],
  )

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
    const linha = elemento.value.slice(0, elemento.selectionStart).split('\n').length - 1
    setLinhaAtual(linha)
    // A linha em edição fica acima da barra (que sobe com o teclado).
    manterLinhaVisivel(elemento, linha, ALTURA_LINHA)
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
        : t(
            resultado.erro === 'nomeDuplicado'
              ? 'players.errorDuplicateName'
              : 'players.errorEmptyName',
          ),
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
            <BotaoConfiguracoes />
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
                <span
                  className="clb-marcador clb-marcador--convidado"
                  title={t('match.club.guestShort')}
                >
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
                  {partesDoNome(jogador).apoio &&
                    nomeExibido(jogador) !== partesDoNome(jogador).apoio && (
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
            {t(entrada.jogadorId ? 'match.club.linked' : 'match.club.guest', {
              name: entrada.nome,
            })}
          </li>
        ))}
      </ul>

      {/* Rodapé como o da lista do torneio: contagem, limpar, cadastro e a seta de sortear. */}
      <div className="ptd-rodape-fixo clb-rodape trn-rodape">
        <div className="trn-rodape-topo">
          <p id="clb-contagem" className="clb-contagem" aria-live="polite">
            {/* Ícones no lugar das palavras; o leitor de tela ouve "12 jogadores, 3 mesas". */}
            <span className="clb-contadores">
              <span>
                <i className="fas fa-user" aria-hidden="true" />
                <strong aria-hidden="true">{numero(entradas.length)}</strong>
                <span className="sr-only">
                  {t('match.club.players', { count: entradas.length })}
                </span>
              </span>
              <span className="clb-barra" aria-hidden="true" />
              <span>
                <IconeMenu icone="centerpiece" />
                <strong aria-hidden="true">{numero(contagem.mesas)}</strong>
                <span className="sr-only">{t('match.club.tables', { count: contagem.mesas })}</span>
              </span>
            </span>
            {contagem.podeSortear ? (
              <span className="trn-status trn-status--ok">
                {t('tournament.list.ready', { players: entradas.length, tables: contagem.mesas })}{' '}
                <i className="fas fa-check" aria-hidden="true" />
              </span>
            ) : (
              <span className="clb-falta">
                {entradas.length < 4
                  ? t('match.club.minimum', { count: 4 - entradas.length })
                  : `${t('match.club.missing', { count: contagem.faltam })}, ${t('match.club.leftover', { count: contagem.sobram })}`}
              </span>
            )}
          </p>
          <span className="trn-rodape-icones">
            <button
              type="button"
              className="trn-adicionar-cadastro"
              aria-label={t('match.club.clear')}
              title={t('match.club.clear')}
              disabled={!lista.trim() && !sorteio}
              onClick={() => setLimpando(true)}
            >
              <i className="fas fa-trash" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="trn-adicionar-cadastro"
              aria-label={t('match.club.registeredTitle')}
              title={t('match.club.registeredTitle')}
              onClick={abrirCadastrados}
            >
              <i className="fas fa-address-book" aria-hidden="true" />
            </button>
            {/* Com o teclado aberto o Sortear some: a seta, como a de enviar do WhatsApp, sorteia. */}
            <button
              type="button"
              className="trn-adicionar-cadastro clb-enviar"
              aria-label={t('match.club.draw')}
              title={t('match.club.draw')}
              disabled={!contagem.podeSortear}
              onClick={iniciarSorteio}
            >
              {/* Seta deitada, como a de enviar do WhatsApp (o avião do Font Awesome é inclinado). */}
              <svg className="clb-enviar-seta" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 20.5 21.5 12 3 3.5v6.6L15.5 12 3 13.9z" fill="currentColor" />
              </svg>
            </button>
          </span>
        </div>
        <button
          type="button"
          className="btn-primario ptd-btn-largo clb-sortear"
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
          aoAbrirListasSalvas={() => {
            setInserirApos(null)
            setListasSalvas(true)
          }}
          aoFechar={() => setInserirApos(null)}
          aoConfirmar={(escolhidos) => acrescentar(escolhidos.map(nomeExibido))}
          aoUsarNomes={acrescentar}
        />
      )}

      {listasSalvas && (
        <FolhaListasSalvas
          listas={listas}
          podeGuardar={entradas.length > 0}
          // Os nomes do último sorteio ficam junto das listas salvas.
          ultimoEncontro={
            ultimoEncontro
              ? {
                  criadoEm: ultimoEncontro.criadoEm,
                  nomes: ultimoEncontro.jogadores.map((entrada) => entrada.nome),
                }
              : undefined
          }
          aoUsarNomes={(nomes) => {
            acrescentar(nomes)
            setListasSalvas(false)
          }}
          aoFechar={() => setListasSalvas(false)}
          aoGuardar={(nome) => {
            guardarLista(nome, entradas.map((entrada) => entrada.nome).join('\n'))
            mostrar(t('tournament.list.saved', { name: nome }))
            setListasSalvas(false)
          }}
          aoCarregar={(salva) => {
            definirLista(salva.texto)
            mostrar(t('tournament.list.loaded', { name: salva.nome }))
            setListasSalvas(false)
          }}
          aoExcluir={(salva) => excluirLista(salva.id)}
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
