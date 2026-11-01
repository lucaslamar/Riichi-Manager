import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import {
  gerarNotacaoCompleta,
  interpretarNotacaoCompleta,
  lerPendentes,
  separarPendentes,
  slotsDosPendentes,
  tipoDoGrupoPendente,
  chamadasPossiveis,
  type ErroNotacao,
  ordenarPedras,
} from '../../../logica/mao'
import { codigoBase, proximaDoraIndicada } from '../../constantes'
import type { EstadoCalculadoraMao } from '../../hooks/useCalculadoraMao'
import { AcoesConstrutorMao } from './AcoesConstrutorMao'
import { CampoNotacaoMao } from './CampoNotacaoMao'
import { DescartesMao } from './DescartesMao'
import { MaoAtual } from './MaoAtual'
import { TecladoPedras } from './TecladoPedras'

/** Mão fechada que a notação descreve; uma batida em meld devolve as pedras consumidas. */
function pedrasParaNotacao(mao: EstadoCalculadoraMao['mao']) {
  return mao.agariMeld ? [...mao.pedras, ...mao.agariMeld.pedrasConsumidasMao] : mao.pedras
}

interface PropsConstrutorMao {
  estado: EstadoCalculadoraMao
  embutido?: boolean
  contexto?: 'montagem' | 'finalizacao'
  aoAbrirRegras?: () => void
  acoesCabecalho?: ReactNode
  aoCalcularDireto?: () => void
  /** Campo de notação no lugar do teclado de pedras; o estado fica na página (gestos). */
  entradaNotacao?: boolean
  aoMudarEntradaNotacao?: (ativa: boolean) => void
}

/**
 * Área para montar a mão completa pedra por pedra.
 *
 * Como ler este componente:
 * - aqui ficam apenas estados de interface local, como sticky e menu mobile;
 * - dados derivados leves são preparados e repassados para subcomponentes;
 * - a edição real da mão continua no hook `useCalculadoraMao`.
 */
export default function ConstrutorMao({
  estado,
  embutido = false,
  contexto = 'montagem',
  aoAbrirRegras,
  acoesCabecalho,
  aoCalcularDireto,
  entradaNotacao = false,
  aoMudarEntradaNotacao,
}: PropsConstrutorMao) {
  const { t } = useI18n()
  const sentinelaStickyRef = useRef<HTMLDivElement | null>(null)
  const [maoEditorGrudado, setMaoEditorGrudado] = useState(false)
  const [menuAcoesMaoAberto, setMenuAcoesMaoAberto] = useState(false)
  const {
    mao,
    acaoPendente,
    configuracao,
    totalPedras,
    slotsUsados,
    maoCompleta,
    podeSelecionarPedra,
    adicionarPedra,
    adicionarPedraDaMao,
    removerPedra,
    removerMeld,
    removerDescarte,
    limpar,
    alternarAcao,
    podeChii,
    podePon,
    podeKanAberto,
    podeKanFechado,
    resultadoMaoInvalida,
    esperasPossiveis,
    maoProntaParaFinalizar,
    maoProntaParaEscolherBatida,
    selecionandoPedraAgari,
    escolhaChiiPendente,
    mensagemFinalizacao,
    candidatasPedraAgari,
    fluxoOpcoes,
    finalizarMao,
    alternarSelecaoPedraAgari,
    escolherPedraAgariMao,
    escolherPedraAgariMeld,
    escolherPedraAgariPorCodigo,
    escolherChiiPendente,
    substituirMaoNotacao,
  } = estado

  const [textoNotacao, setTextoNotacao] = useState('')
  const { completo: notacaoCompleta, pendentes: pendentesNotacao } = separarPendentes(textoNotacao)
  const notacao = useMemo(
    () => interpretarNotacaoCompleta(notacaoCompleta, { akadora: configuracao.akadora }),
    [notacaoCompleta, configuracao.akadora],
  )
  const entradaPorNotacao = contexto === 'montagem' && entradaNotacao && !!aoMudarEntradaNotacao
  const erroNotacao = entradaPorNotacao ? notacao.erro : null
  /** Entrada recusada: a mensagem fica até o próximo toque; o texto já voltou ao que valia. */
  const [erroRecusado, setErroRecusado] = useState<ErroNotacao | null>(null)
  /** 4 iguais que estouram a mão: é só o passo antes da tecla Kan, não um erro a mostrar. */
  const grupoEsperandoKan =
    erroNotacao?.chave === 'notation.errors.tooManyTiles' &&
    chamadasPossiveis(notacaoCompleta).has('kanFechado')
  const erroVisivel = entradaPorNotacao
    ? (erroRecusado ?? (grupoEsperandoKan ? null : erroNotacao))
    : null

  // Na mão, o que espera o naipe: chamadas viram melds tracejados; o resto, pedras brancas.
  const gruposPendentes = lerPendentes(pendentesNotacao).map((grupo) => ({
    ...grupo,
    tipo: tipoDoGrupoPendente(grupo),
  }))

  /** Mão atual em notação; a batida vai por último na mão fechada. */
  const notacaoDaMao = () =>
    gerarNotacaoCompleta(
      pedrasParaNotacao(mao),
      mao.agariMeld ? -1 : mao.indiceAgari,
      mao.melds.filter((_meld, indice) => indice !== mao.agariMeld?.indiceMeld),
    )

  const abrirNotacao = () => {
    setMenuAcoesMaoAberto(false)
    aoMudarEntradaNotacao?.(true)
  }
  const voltarParaPedras = () => aoMudarEntradaNotacao?.(false)

  /**
   * Entrada inválida é recusada: a mão não muda, o texto volta ao que ela descreve e
   * o erro só aparece até o próximo toque, sem travar o que vem depois. A exceção é o
   * grupo de 4 iguais que estoura a mão: ele fica à espera da tecla Kan (e sem batida).
   */
  const mudarTextoNotacao = (texto: string) => {
    setErroRecusado(null)
    const { completo } = separarPendentes(texto)
    const resultado = interpretarNotacaoCompleta(completo, { akadora: configuracao.akadora })
    if (!resultado.erro) {
      setTextoNotacao(texto)
      substituirMaoNotacao(resultado)
      return
    }
    if (
      resultado.erro.chave === 'notation.errors.tooManyTiles' &&
      chamadasPossiveis(completo).has('kanFechado')
    ) {
      setTextoNotacao(texto)
      substituirMaoNotacao(null)
      return
    }
    setErroRecusado(resultado.erro)
    setTextoNotacao(notacaoDaMao())
  }

  /** AC: zera tudo, como a lixeira da mão. */
  const limparNotacao = () => {
    setErroRecusado(null)
    setTextoNotacao('')
    limpar()
  }

  /** Tira um grupo que esperava o naipe (e desmarca a chamada). */
  const removerGrupoPendente = (indice: number) => {
    estado.setAcaoPendente(null)
    const resto = gruposPendentes
      .filter((_grupo, posicao) => posicao !== indice)
      .map((grupo) => grupo.digitos + grupo.marca)
    mudarTextoNotacao(notacaoCompleta + resto.join(''))
  }

  /** Tira um número solto que esperava o naipe (`posicao` na ordem em que aparecem na mão). */
  const removerPedraPendente = (posicao: number) => {
    let restante = posicao
    const texto = gruposPendentes.map((grupo) => {
      if (grupo.tipo || restante < 0) return grupo.digitos + grupo.marca
      if (restante >= grupo.digitos.length) {
        restante -= grupo.digitos.length
        return grupo.digitos + grupo.marca
      }
      const digitos = grupo.digitos.slice(0, restante) + grupo.digitos.slice(restante + 1)
      restante = -1
      return digitos && digitos + grupo.marca
    })
    mudarTextoNotacao(notacaoCompleta + texto.join(''))
  }

  /*
   * O texto acompanha a mão: ao abrir a notação e quando ela muda fora do campo
   * (remover pedra ou meld tocando nele, Limpar). Digitar não dispara isto: texto
   * válido deixa a mão igual ao que foi lido, e texto com erro não mexe na mão.
   * Só compara pedras e melds: a ordem digitada e a batida ficam como estão.
   */
  const assinatura = (pedras: string[], melds: typeof mao.melds) =>
    [ordenarPedras([...pedras]).join(), ...melds.map((meld) => meld.tipo + meld.pedras.join())]
      .sort()
      .join('|')
  const assinaturaMao = assinatura(mao.pedras, mao.melds)
  useEffect(() => {
    if (!entradaPorNotacao) return
    if (assinatura(notacao.pedras, notacao.melds) === assinaturaMao) return
    // Texto no meio da digitação (com erro) só é reescrito quando a mão foi limpa.
    if (notacao.erro && assinaturaMao !== assinatura([], [])) return
    setTextoNotacao(notacaoDaMao() + pendentesNotacao)
    // O texto só acompanha a mão; reagir a `notacao` aqui desfaria o que está sendo digitado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assinaturaMao, entradaPorNotacao])

  /**
   * Converte indicadores escolhidos em doras reais para destacar o teclado.
   * Quando há dora manual, indicadores visuais são ignorados pelo cálculo.
   */
  const dorasReais = useMemo(
    () =>
      new Set(
        [...mao.dora, ...mao.uradora].map((indicador) =>
          codigoBase(proximaDoraIndicada(indicador)),
        ),
      ),
    [mao.dora, mao.uradora],
  )

  const temEsperaValida = esperasPossiveis.some((espera) => !espera.semYaku)
  const temEsperaSemYaku = esperasPossiveis.some((espera) => espera.semYaku)
  const temEsperaFuriten = esperasPossiveis.some((espera) => !espera.semYaku && espera.furiten)
  const statusTenpai = temEsperaFuriten
    ? t('calculator.furiten')
    : temEsperaValida
      ? t('calculator.tenpai')
      : temEsperaSemYaku
        ? t('calculator.noYaku')
        : null
  const filtrarTecladoPorEspera = slotsUsados === 13 && !acaoPendente && temEsperaValida
  const furitenBloqueiaRonNoTeclado = mao.agari === 'ron' || !fluxoOpcoes.vitoriaDefinida
  const esperasPorPedra = useMemo(
    () => new Map(esperasPossiveis.map((espera) => [espera.pedra, espera])),
    [esperasPossiveis],
  )

  /** Texto curto exibido dentro do badge de espera no teclado. */
  const rotuloEsperaTeclado = (
    espera: Pick<(typeof esperasPossiveis)[number], 'semYaku' | 'yakuman' | 'han'>,
  ) => {
    if (espera.semYaku) return t('calculator.noYaku')
    if (espera.yakuman > 0) return `${espera.yakuman}Y`
    return `${espera.han} han`
  }

  /** Classe visual que separa espera válida, furiten e espera sem yaku. */
  const classeEsperaTeclado = (
    espera?: Pick<(typeof esperasPossiveis)[number], 'semYaku' | 'furiten'>,
  ) => {
    if (!espera) return ''
    if (espera.semYaku) return 'espera-sem-yaku'
    return espera.furiten ? 'espera-valida espera-furiten' : 'espera-valida'
  }

  const rotulosAcaoMobile = {
    chii: { rotulo: t('melds.chii'), cor: 'var(--cor-sucesso, #4caf50)' },
    pon: { rotulo: t('melds.pon'), cor: 'var(--cor-primario, #2196f3)' },
    kanAberto: { rotulo: t('melds.kanAberto'), cor: 'var(--cor-destaque, #ba68c8)' },
    kanFechado: { rotulo: t('melds.kanFechado'), cor: 'var(--cor-secundario-texto, #9c27b0)' },
    dora: { rotulo: t('melds.dora'), cor: 'var(--cor-aviso, #d97706)' },
    uradora: { rotulo: t('melds.uradora'), cor: 'var(--cor-aviso, #d97706)' },
    descarte: { rotulo: t('melds.discards'), cor: 'var(--cor-texto, #111827)' },
  }
  const acaoMobileAtiva = acaoPendente ? rotulosAcaoMobile[acaoPendente.tipo] : null
  const acaoMeldAtiva =
    acaoPendente?.tipo === 'chii' ||
    acaoPendente?.tipo === 'pon' ||
    acaoPendente?.tipo === 'kanAberto' ||
    acaoPendente?.tipo === 'kanFechado'
      ? acaoPendente
      : null
  const mostrarTeclado = contexto === 'montagem'
  const mostrarFinalizacaoNoTeclado =
    contexto === 'montagem' &&
    maoProntaParaEscolherBatida &&
    !acaoMeldAtiva &&
    !erroNotacao &&
    !(entradaPorNotacao && pendentesNotacao)
  const aoConfirmarNotacao = () => {
    if (!mostrarFinalizacaoNoTeclado || !maoProntaParaFinalizar || selecionandoPedraAgari) return
    if (aoCalcularDireto) aoCalcularDireto()
    else finalizarMao()
  }

  /**
   * Marca na mão fechada as pedras já escolhidas durante uma ação de chii.
   * A comparação usa código base para tratar aka dora como equivalente ao 5 normal.
   */
  const indicesSelecionadosChii = useMemo(() => {
    const indicesSelecionados = new Set<number>()
    if (acaoPendente?.tipo !== 'chii') return indicesSelecionados

    for (const pedraSelecionada of acaoPendente.pedras) {
      const indice = mao.pedras.findIndex(
        (pedraMao, indicePedra) =>
          !indicesSelecionados.has(indicePedra) &&
          codigoBase(pedraMao) === codigoBase(pedraSelecionada),
      )
      if (indice >= 0) indicesSelecionados.add(indice)
    }
    return indicesSelecionados
  }, [acaoPendente, mao.pedras])

  /** Troca o modo do próximo clique e fecha o menu mobile para manter feedback imediato. */
  const alternarAcaoMao = (tipo: Parameters<typeof alternarAcao>[0]) => {
    alternarAcao(tipo)
    setMenuAcoesMaoAberto(false)
  }

  const limparDescartes = () => {
    estado.atualizarMao((rascunho) => {
      rascunho.descartes = []
    })
  }

  useEffect(() => {
    const atualizarEstadoSticky = () => {
      const sentinela = sentinelaStickyRef.current
      if (!sentinela) return
      setMaoEditorGrudado(sentinela.getBoundingClientRect().top < 8)
    }

    atualizarEstadoSticky()
    window.addEventListener('scroll', atualizarEstadoSticky, { passive: true })
    window.addEventListener('resize', atualizarEstadoSticky)

    return () => {
      window.removeEventListener('scroll', atualizarEstadoSticky)
      window.removeEventListener('resize', atualizarEstadoSticky)
    }
  }, [])

  return (
    <div
      className={`${embutido ? '' : 'card'} construtor-mao construtor-mao-${contexto} ${
        selecionandoPedraAgari ? 'selecionando-batida' : ''
      } ${entradaPorNotacao ? 'com-notacao' : ''}`.trim()}
    >
      <div ref={sentinelaStickyRef} aria-hidden="true" />
      <MaoAtual
        mao={mao}
        acaoPendente={acaoPendente}
        acaoMeldAtiva={acaoMeldAtiva}
        acaoMobileAtiva={acaoMobileAtiva}
        // A contagem da mão inclui o que ainda espera o naipe.
        totalPedras={
          totalPedras +
          (entradaPorNotacao
            ? gruposPendentes.reduce((soma, grupo) => soma + grupo.digitos.length, 0)
            : 0)
        }
        slotsUsados={slotsUsados + (entradaPorNotacao ? slotsDosPendentes(pendentesNotacao) : 0)}
        maoEditorGrudado={maoEditorGrudado}
        menuAcoesMaoAberto={menuAcoesMaoAberto}
        indicesSelecionadosChii={indicesSelecionadosChii}
        statusTenpai={statusTenpai}
        temEsperaValida={temEsperaValida}
        temEsperaSemYaku={temEsperaSemYaku}
        temEsperaFuriten={temEsperaFuriten}
        podeChii={podeChii}
        podePon={podePon}
        podeKanAberto={podeKanAberto}
        podeKanFechado={podeKanFechado}
        maoInvalida={resultadoMaoInvalida}
        selecionandoPedraAgari={selecionandoPedraAgari}
        contexto={contexto}
        acoesCabecalho={acoesCabecalho}
        aoAbrirRegras={aoAbrirRegras}
        aoAbrirMenuAcoes={() => setMenuAcoesMaoAberto((aberto) => !aberto)}
        aoAlternarAcao={alternarAcaoMao}
        aoAdicionarPedraDaMao={adicionarPedraDaMao}
        aoEscolherPedraAgariMao={escolherPedraAgariMao}
        aoEscolherPedraAgariMeld={escolherPedraAgariMeld}
        aoRemoverPedra={contexto === 'montagem' ? removerPedra : () => undefined}
        aoRemoverMeld={contexto === 'montagem' ? removerMeld : () => undefined}
        aoLimpar={limpar}
        pedrasPendentes={
          entradaPorNotacao
            ? gruposPendentes.filter((grupo) => !grupo.tipo).flatMap((grupo) => [...grupo.digitos])
            : undefined
        }
        meldsPendentes={
          entradaPorNotacao
            ? gruposPendentes.flatMap((grupo, indice) =>
                grupo.tipo ? [{ indice, tipo: grupo.tipo, pedras: [...grupo.digitos] }] : [],
              )
            : undefined
        }
        aoRemoverPedraPendente={removerPedraPendente}
        aoRemoverMeldPendente={removerGrupoPendente}
        entradaPorNotacao={entradaPorNotacao}
      />

      {contexto === 'montagem' && (
        <>
          <DescartesMao
            descartes={mao.descartes}
            temEsperaFuriten={temEsperaFuriten}
            aoRemoverDescarte={removerDescarte}
            aoLimparDescartes={limparDescartes}
          />

          {/* Na notação as chamadas são digitadas: a linha de botões dá lugar ao campo. */}
          {!entradaPorNotacao && (
            <div className="acoes-construtor-mao">
              <AcoesConstrutorMao
                mao={mao}
                acaoPendente={acaoPendente}
                podeChii={podeChii}
                podePon={podePon}
                podeKanAberto={podeKanAberto}
                podeKanFechado={podeKanFechado}
                aoAlternarAcao={alternarAcaoMao}
                aoAbrirNotacao={aoMudarEntradaNotacao && abrirNotacao}
              />
            </div>
          )}
        </>
      )}

      {mostrarTeclado && (
        <div className="painel-teclado-calculadora">
          <span className="sr-only" aria-live="polite">
            {mensagemFinalizacao ??
              (mostrarFinalizacaoNoTeclado ? t('calculator.readyToFinalizeAnnouncement') : '')}
          </span>
          {contexto === 'montagem' && !entradaPorNotacao && (
            <div className="menu-acoes-teclado-mobile" aria-label={t('calculator.actionsMenu')}>
              <div className="opcoes-acoes-mao-mobile">
                <AcoesConstrutorMao
                  mao={mao}
                  acaoPendente={acaoPendente}
                  podeChii={podeChii}
                  podePon={podePon}
                  podeKanAberto={podeKanAberto}
                  podeKanFechado={podeKanFechado}
                  aoAlternarAcao={alternarAcaoMao}
                  aoAbrirNotacao={aoMudarEntradaNotacao && abrirNotacao}
                  compacto
                />
                {aoAbrirRegras && !mostrarFinalizacaoNoTeclado && (
                  <button
                    className="botao-configuracao-toolbar"
                    type="button"
                    aria-label={t('rulesModal.open')}
                    title={t('rulesModal.open')}
                    onClick={aoAbrirRegras}
                  >
                    <i className="fas fa-gear" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          )}
          {entradaPorNotacao && (
            <CampoNotacaoMao
              valor={textoNotacao}
              aoMudar={mudarTextoNotacao}
              aoConfirmar={aoConfirmarNotacao}
              aoVoltar={voltarParaPedras}
              aoLimpar={limparNotacao}
              slotsMao={slotsUsados}
              erro={erroVisivel ? t(erroVisivel.chave, erroVisivel.parametros) : null}
              // A chamada marcada é a mesma ação do teclado de pedras: com ela, tocar
              // nas pedras da mão forma o meld, como lá.
              chamadaArmada={acaoMeldAtiva?.tipo ?? null}
              aoArmarChamada={(tipo) => {
                if (tipo) alternarAcaoMao(tipo)
                else estado.setAcaoPendente(null)
              }}
            />
          )}
          {(!entradaPorNotacao ||
            mostrarFinalizacaoNoTeclado ||
            selecionandoPedraAgari ||
            escolhaChiiPendente) && (
            <TecladoPedras
              mostrarGrade={!entradaPorNotacao}
              acaoPendente={acaoPendente}
              configuracao={configuracao}
              dorasReais={dorasReais}
              esperasPorPedra={esperasPorPedra}
              filtrarTecladoPorEspera={filtrarTecladoPorEspera}
              furitenBloqueiaRon={furitenBloqueiaRonNoTeclado}
              maoCompleta={maoCompleta}
              podeSelecionarPedra={podeSelecionarPedra}
              rotuloEsperaTeclado={rotuloEsperaTeclado}
              classeEsperaTeclado={classeEsperaTeclado}
              contexto={contexto}
              maoProntaParaFinalizar={mostrarFinalizacaoNoTeclado}
              batidaDefinida={maoProntaParaFinalizar}
              mensagemFinalizacao={mensagemFinalizacao}
              selecionandoPedraAgari={selecionandoPedraAgari}
              candidatasPedraAgari={candidatasPedraAgari}
              escolhaChiiPendente={escolhaChiiPendente}
              aoAbrirRegras={contexto === 'montagem' ? aoAbrirRegras : undefined}
              aoAdicionarPedra={adicionarPedra}
              aoFinalizarMao={aoCalcularDireto ? undefined : finalizarMao}
              aoCalcularDireto={aoCalcularDireto}
              aoAlternarSelecaoPedraAgari={alternarSelecaoPedraAgari}
              aoEscolherPedraAgariPorCodigo={escolherPedraAgariPorCodigo}
              aoEscolherChiiPendente={escolherChiiPendente}
            />
          )}
        </div>
      )}
    </div>
  )
}
