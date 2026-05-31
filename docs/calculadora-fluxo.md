# Fluxo da Calculadora de Mao

## Etapas

### 1. Montagem

Arquivo principal: `src/dominios/calculadora-mao/interface/componentes/ModoCompletoCalculadora.tsx`.

O usuario monta a mao pelo teclado. Com 13 slots, `useEsperasMao` calcula esperas possiveis. A tela mostra:

- status Tenpai, Furiten ou Sem yaku;
- lista de esperas;
- valor estimado por espera quando disponivel;
- teclado ainda clicavel para escolher a pedra vencedora.

### 2. Finalizar Mao

Quando uma espera e escolhida, `adicionarPedra` marca `indiceAgari` e a UI entra em finalizacao.

Esta etapa mostra:

- mao completa;
- pedra vencedora com destaque laranja;
- Ron/Tsumo;
- ventos;
- honba;
- doras manuais;
- indicadores de dora e ura dora;
- descartes para furiten;
- riichi quando a mao esta fechada;
- condicoes especiais;
- botao Calcular.

O botao "Voltar para montagem" chama `voltarParaMontagem` e remove apenas a pedra vencedora, preservando configuracoes reaproveitaveis.

### 3. Resultado

O botao Calcular chama `calcularMaoAtual`, que congela a assinatura da mao atual. O modal em `ResultadoMaoCalculada` abre quando ha resultado valido, furiten/chombo ou mao invalida sem yaku.

Fechar a modal apenas fecha a modal. A mao finalizada e as opcoes permanecem na tela.

## Mapa botao -> acao -> regra

| Interface | Acao | Estado afetado | Regra/arquivo |
| --- | --- | --- | --- |
| Tile do teclado sem acao ativa | `adicionarPedra(pedra)` | `mao.pedras`, `indiceAgari` quando 13 slots | `useAcoesPedras.ts`, esperas em `esperas.ts` |
| Tile do teclado com Descartes / Furiten | `adicionarPedra(pedra)` | `mao.descartes` | furiten em `esperas.ts` e `useResultadoMao.ts` |
| Tile do teclado com Ind. Dora | `adicionarPedra(pedra)` | `mao.dora` | dora em `calculo-mao.ts` / conversao para `riichi` |
| Tile do teclado com Ura dora | `adicionarPedra(pedra)` | `mao.uradora` | ura dora quando `riichi` esta ativo |
| Chi/Pon/Kan | `alternarAcao(tipo)` e depois `adicionarPedra` | `mao.melds`, `mao.pedras`, `riichi` | melds em `useAcoesMelds.ts` e `useAcoesPedras.ts` |
| Ron/Tsumo | `marcarVitoriaDefinida` + `atualizarMao` | `mao.agari` | pontuacao em `src/compartilhado/mahjong/pontuacao` e `calculo-mao.ts` |
| Vento da rodada | `marcarVentoRodadaDefinido` + `atualizarMao` | `mao.ventoRodada` | yaku/fu de vento em `calculo-mao.ts` |
| Vento do jogador | `marcarVentoAssentoDefinido` + `atualizarMao` | `mao.ventoAssento` | oya e fu em `calculo-mao.ts` |
| Riichi/Ippatsu/Double | `atualizarMao` | `mao.riichi` | yaku e ura dora em `calculo-mao.ts` |
| Tenhou/Chiihou, Rinshan/Chankan, Haitei/Houtei | `atualizarMao` | `bencao`, `kan`, `ultimaPedra` | yakus especiais em `calculo-mao.ts` |
| Calcular | `calcularMaoAtual()` | `assinaturaCalculo` | `useResultadoMao.ts` chama `calcularMao` |
| Fechar modal | `fecharModalResultado()` | somente estado da modal | nao altera regra de Mahjong |
| Voltar para montagem | `voltarParaMontagem()` | remove `indiceAgari` da mao | preserva opcoes para escolher outra espera |

## Calculadora de Han e Fu

A Calculadora de Han e Fu fica em `src/dominios/calculadora-han-fu`. Ela recebe apenas han, fu, tipo de vitoria, dealer/leste e honba. Ela nao monta tiles, nao calcula esperas e nao consome hooks ou componentes especificos da Calculadora de Mao.

## Acessibilidade

- Botoes de tile devem ter `aria-label` com destino da acao.
- Resultado usa `aria-live` para resumo objetivo.
- Estados visuais usam cor e texto/badge.
- A pedra vencedora tem destaque visual e texto acessivel.
