# Regras de Negocio

## Contrato

A calculadora ja possui um motor funcional e nao deve ser reescrita por mudancas de UX.

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

- `calculo-mao.ts`: chamada principal para calcular mao completa.
- `esperas.ts`: esperas possiveis, tenpai e avaliacao de espera.
- `conversor-riichi.ts`: formato enviado para a dependencia `riichi`.
- `calculadora-rapida.ts`: tabela da Calculadora de Han e Fu, com han/fu e honba.
- `ordenacao.ts`: ordenacao e contagem de slots/pedras.
- `tipos.ts`: contrato de `Mao`, `Meld`, `Acao` e ventos.

## Onde ficam as acoes de interface

- `useEstadoMao.ts`: estado editavel da mao e configuracao.
- `useAcoesPedras.ts`: clique em tile, descartes, indicadores e melds.
- `useAcoesMelds.ts`: validacoes de Chi/Pon/Kan.
- `useEsperasMao.ts`: dados derivados de espera.
- `useResultadoMao.ts`: resultado completo e furiten depois da pedra vencedora.
- `useCalculadoraMao.ts`: API publica consumida pelos componentes.

## Cuidados

- Nao altere `calculo-mao.ts` para resolver problema visual.
- Nao recalcule resultado automaticamente ao mudar uma opcao na finalizacao; o usuario deve clicar em Calcular.
- Nao remova a pedra vencedora ao fechar a modal.
- Ao voltar para montagem, remova apenas `indiceAgari` e preserve configuracoes reaproveitaveis.
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
- Torneio Fast continua acessivel pelo menu global.
