# Acessibilidade e modo falado

O adaptador `compartilhado/adaptadores/voz.ts` concentra tudo o que o app fala. `anunciar()` manda avisos curtos: com a Narração ligada na voz do app eles são falados, senão vão para uma região `aria-live` única, lida pelo leitor de tela. `narrar()` só fala com a Narração ligada (as pedras da mão). `falar()` usa `speechSynthesis` sempre, com a voz mais natural do aparelho (de preferência a Microsoft Francisca) e a velocidade da Narração.

A Narração fica nas Configurações (`configuracoes/interface/CartaoNarracao.tsx`), com liga/desliga, velocidade, saída (voz do app ou só leitor) e nomes das pedras (idioma do app ou japonês). A narração da mão está em `calculadora-mao/interface/narracao/narrarMao.ts`. Os atalhos (Alt+M mão, Alt+D descartes, Alt+R repetir, Alt+S parar) ficam em `compartilhado/interface/narracao/AtalhosNarracao.tsx`. A leitura dos descartes (Alt+D) ainda não tem tela registrada.

Troca de tela não é anúncio: o foco vai para o título da tela nova (`focarTituloTela` em `TituloTela.tsx`, só depois do primeiro toque), que o leitor lê, como o `screenChanged` do iPhone e o `accessibilityPaneTitle` do Android. Só o guia, que não tem título no cabeçalho, tem o nome anunciado. Com a Narração na voz do app, o título também é falado. Hoje são anunciados por `aria-live`: "Mão apagada" ao limpar a mão, o top 3 do Ranking, o tempo da vez de 10 em 10 segundos e a dica e os ventos do Sorteador. O resultado da Calculadora de Mão é sempre falado com `falar()`. O registro de descartes do Centerpiece (Fase 6) deixa a base pronta para anunciar jogadas.

## O que já está pronto

- **Dados estruturados.** Com "Registrar descartes" ligado na mesa, cada lance fica em `partida.registro.lances`, com ordem global na mão, quem jogou, a pedra, Riichi e quem chamou. Kakan é um lance próprio. Ao fim da mão, os lances vão para o evento no histórico (`evento.lances`). Ver `logica/descartes.ts`.
- **Frases por extenso.** `logica/descreverPedras.ts` monta os textos e recebe o tradutor do idioma ativo:
  - `descreverPedra`: "3 de caracteres", "vento Leste", "dragão branco";
  - `descreverEsperas`: "3 e 6 de bambu";
  - `descreverRio`: "Fulano descartou: …";
  - `descreverFuriten`: "Furiten temporário · espera 3 e 6 de bambu · até seu próximo descarte".
- **Leitor de tela.** O rio e cada pedra usam essas frases no `aria-label`.
- **Furiten.** `logica/furiten.ts` calcula os 3 tipos da linha do tempo e das esperas e diz qual pedra causou, em qual descarte. As esperas vêm de `calculadora-mao/logica/esperas.ts`.
- **Entrada sem olhar para as pedras.** Os descartes e a mão da checagem de furiten aceitam notação mpsz no teclado do sistema, sem depender do teclado de pedras. As pedras do teclado usam `descreverPedra` no `aria-label`.
- **Privacidade.** A checagem de furiten só mostra as esperas ao próprio jogador, por alguns segundos, ao tocar no ícone do card. Um modo falado precisa respeitar isso: ler a espera em voz alta entrega a mão para a mesa.

Tudo em `logica/` é TypeScript puro e pode ser copiado para o React Native.

## O que falta para o modo falado

- Implementação de `voz.ts` para o React Native.
- Decidir o que é anunciado sozinho (batida, Riichi, descarte, troca de vez) e o que só é lido a pedido.
- Ler a mão informada e o estado de furiten sob demanda.
- Entrada por voz, se fizer sentido.
- Revisar com pessoas cegas: ordem de foco, tamanho das frases e nomes das pedras.
- Traduzir `spokenTiles` e `match.discards`: es, ja, zh-Hans, ko e lt ainda estão em inglês.
