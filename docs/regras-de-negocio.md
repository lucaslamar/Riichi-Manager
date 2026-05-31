# Regras de Negocio

## Contrato

A calculadora ja possui um motor funcional e nao deve ser reescrita por mudancas de UX ou reorganizacao de pastas.

Preserve:

- tenpai com 13 pedras;
- esperas possiveis;
- valor estimado por espera;
- furiten;
- sem yaku;
- dora e ura dora;
- honba;
- ventos;
- Ron/Tsumo;
- Riichi;
- condicoes especiais;
- modal de resultado;
- validacoes atuais.

## Onde ficam as regras

- `src/dominios/calculadora-mao/logica/calculo-mao.ts`: chamada principal para calcular mao completa.
- `src/dominios/calculadora-mao/logica/esperas.ts`: esperas possiveis, tenpai e avaliacao de espera.
- `src/dominios/calculadora-mao/logica/conversor-riichi.ts`: formato enviado para a dependencia `riichi`.
- `src/compartilhado/mahjong/pontuacao/calculadora-han-fu.ts`: tabela pura de pontos por han/fu, com ron/tsumo, dealer/leste e honba.
- `src/dominios/calculadora-mao/logica/ordenacao.ts`: ordenacao e contagem de slots/pedras.
- `src/dominios/calculadora-mao/logica/tipos.ts`: contrato de `Mao`, `Meld`, `Acao` e ventos.

## Onde ficam as acoes de interface

- `src/dominios/calculadora-mao/interface/hooks/useEstadoMao.ts`: estado editavel da mao e configuracao.
- `src/dominios/calculadora-mao/interface/hooks/useAcoesPedras.ts`: clique em tile, descartes, indicadores e melds.
- `src/dominios/calculadora-mao/interface/hooks/useAcoesMelds.ts`: validacoes de Chi/Pon/Kan.
- `src/dominios/calculadora-mao/interface/hooks/useEsperasMao.ts`: dados derivados de espera.
- `src/dominios/calculadora-mao/interface/hooks/useResultadoMao.ts`: resultado completo e furiten depois da pedra vencedora.
- `src/dominios/calculadora-mao/interface/hooks/useCalculadoraMao.ts`: API publica consumida pelos componentes.
- `src/dominios/calculadora-han-fu/interface/hooks/useCalculadoraHanFu.ts`: estado isolado da calculadora direta por Han/Fu.

## Cuidados

- Nao altere `calculo-mao.ts` para resolver problema visual.
- Nao recalcule resultado automaticamente ao mudar uma opcao na finalizacao; o usuario deve clicar em Calcular.
- Nao remova a pedra vencedora ao fechar a modal.
- Ao voltar para montagem, remova apenas `indiceAgari` e preserve configuracoes reaproveitaveis.
- A Calculadora de Han e Fu nao deve depender de tiles, esperas, furiten, melds ou estado da Calculadora de Mao.
- Ao adicionar idioma, mantenha `pt-BR` como fallback.
- Ao adicionar anuncios, use `AdSlot` e nunca cubra mao, esperas, teclado, opcoes ou Calcular.

## Testes manuais recomendados

- 13 pedras em tenpai exibem esperas.
- Espera descartada aparece como furiten.
- Espera sem yaku aparece como sem yaku.
- Escolher espera leva para Finalizar Mao.
- Pedra vencedora fica laranja.
- Fechar resultado preserva finalizacao.
- Voltar para montagem preserva ventos, honba, doras e riichi quando fizer sentido.
- Calculadora de Han e Fu atualiza resultado ao mudar han, fu, Ron/Tsumo, leste/dealer e honba.
- Torneio Fast continua acessivel pelo menu global.
