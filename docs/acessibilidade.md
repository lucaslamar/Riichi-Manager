# Acessibilidade e modo falado

O app ainda não fala: não há `speechSynthesis` nem anúncios automáticos de jogadas. O registro de descartes do Centerpiece (Fase 6) deixa a base pronta para esse módulo.

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

- Adaptador de voz (`falar()`), no mesmo padrão de `tocarAlarme()` e `vibrar()`, com implementação para a web e para o React Native.
- Decidir o que é anunciado sozinho (batida, Riichi, descarte, troca de vez) e o que só é lido a pedido.
- Ler a mão informada e o estado de furiten sob demanda.
- Entrada por voz, se fizer sentido.
- Revisar com pessoas cegas: ordem de foco, tamanho das frases e nomes das pedras.
- Traduzir `spokenTiles` e `match.discards`: es, ja, zh-Hans, ko e lt ainda estão em inglês.
