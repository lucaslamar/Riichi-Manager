# Design de interface (mobile)

Estas diretrizes orientam telas novas e ajustes visuais, com foco no celular. Elas resumem o [Human Interface Guidelines da Apple](https://developer.apple.com/design/human-interface-guidelines) adaptado a um app web em React. A cópia completa das páginas fica na skill `.claude/skills/apple-design` (`references/hig/`). Para uma revisão de tela, use `/apple-design` e cite a página consultada.

O Riichi Manager é web e roda em qualquer celular. Por isso valem os princípios e os fundamentos (acessibilidade, cor, tipografia, layout e escrita). Convenções exclusivas de iOS nativo, como Liquid Glass e barras do sistema, não se aplicam.

## Princípios

- Cada tela tem um propósito claro. Todo elemento precisa merecer seu lugar.
- Permita explorar, pular e desfazer. Ações destrutivas pedem confirmação ou oferecem desfazer.
- Use padrões familiares e consistentes entre os módulos.
- Funcione em telas pequenas e grandes, com texto ampliado, toque, teclado e leitor de tela.
- Cuide dos detalhes: espaçamento, alinhamento, textos e animações acabados.

## Acessibilidade (bloqueante)

- Texto: padrão de 17px no celular e mínimo de 11px. Evite pesos finos em textos pequenos. Use unidades que acompanhem o zoom e o tamanho de fonte do sistema (`rem`).
- Contraste: 4,5:1 para texto comum e 3:1 para texto a partir de 18px ou em negrito, nos temas claro e escuro.
- Alvos de toque: padrão de 44×44px e mínimo de 28×28px, com espaço entre controles vizinhos.
- Nunca transmita informação só por cor. Botões só com ícone têm `aria-label`.
- Animações são opcionais e respeitam `prefers-reduced-motion`.

## Layout no celular

- Respeite as áreas seguras com `env(safe-area-inset-*)`, principalmente em barras fixas no topo e no rodapé.
- Ações principais ficam ao alcance do polegar, na parte de baixo da tela quando fizer sentido.
- Nada de rolagem horizontal da página. Conteúdo largo rola dentro do próprio bloco.
- Navegação leva a lugares, botões executam ações. Não misture os dois papéis.
- Modais: um por vez, com forma clara de sair além do botão de confirmar.

## Seleção de pedras

- Não escolhida não é desabilitada: a pedra fica com a aparência cheia (opacidade, face e cor das Pedras). Escolhida ganha só um contorno por sombra na cor `--cor-destaque` (a do botão Gang, rosa no tema escuro), com `aria-pressed` e sem mudar de tamanho. No Alto contraste o contorno engrossa. O foco fica por fora dele. Exemplo: Flores e Estações do MCR.

## Teclados em grade

- Linha de botões nunca tem altura fixa menor que o mínimo de toque (44px, 46px com a Área de toque ampliada): use `minmax(44px, auto)`. Com altura fixa, as linhas montam uma na outra. Em tela baixa, encolha o visor, não as teclas.
- Teclado de pontos: no Riichi a última linha tem 0, 00 e 000. No Chinês os pontos são pequenos, então não tem 00 nem 000, e o − e o + ocupam duas linhas cada.

## Dragão Branco (pedido do usuário em 22/11/2026)

- No Riichi é liso, só a cor da pedra: sem moldura nem linha interna, em qualquer cor de pedra.
- No Chinês o desenho tem uma cor só: rosa nas pretas do tema escuro e amarelo nas outras (pretas do claro e do Azul, e brancas). As cores saem de `scripts/gerar-pedras-chinesas-pretas.ts`.

## Escrita

- Rótulos dizem o que vai acontecer ("Salvar partida", não "OK").
- Erros explicam o problema e como resolver. Estados vazios orientam o próximo passo.
- Variantes de mahjong pelo nome que os jogadores usam (Riichi, MCR), não pelo país.

## Padrões de tela do Torneio

- Texto de ajuda visível tem no máximo 1 linha em 360px (cerca de 331px úteis), nos 7 idiomas. O resto vai para o ? (`AjudaCampo`) ao lado do rótulo.
- `AjudaCampo` não vai dentro de `<label>` que envolve um campo: use um `div` e dê `aria-label` ao campo.
- Selo do formato ao lado de "em andamento" no card, na rodada e no ranking. O nome trunca, os selos não.
- Encerrar fica ao lado do Ranking, sempre com confirmação.
- Ranking: visão e filtros ficam numa barra abaixo do nome do torneio, não no cabeçalho (no desktop ele é estreito).
- Ranking: a linha inteira abre a folha da distância, com um botão no nome para teclado e leitor de tela. A folha mostra Mangan, Haneman e Yakuman, e o Baiman fica no leitor de tela e em "Distância em".
- Quem está sendo acompanhado fica destacado e, fora da tela, fixo acima da navegação. Use `position: fixed`: `sticky` não gruda dentro do conteúdo principal.
- Colocação e pontos se separam por espaço e cor (a colocação neutra, os pontos em verde ou vermelho), sem "·" depois do "º".
- O ? fica sempre ao lado de um título, nunca no meio ou no fim de um texto de apoio. Embaixo do Formato vão no máximo duas linhas: o que é e quantos jogadores precisa. O resto vai no ? do Formato.
- O ? com mais de uma ideia não é parágrafo corrido: título curto, uma linha por caso (rótulo em negrito e frase curta embaixo), o caso atual em destaque e o porquê no fim.
- Valor padrão escolhido pelo app tem um ? com o porquê do padrão, não só o que o campo faz.
- Registrar ausência é o ícone ao lado de Registrar resultado. A folha mostra os pontos de cada um antes de confirmar.
- WO usa selo neutro e "Faltou" ou "Presente" no lugar dos pontos da mesa, sem colocação.
- QR das imagens é uma assinatura discreta (pedido do usuário em 22/11/2026): 148 px em 1080, escuro em fundo lilás claro só no QR, nos dois temas, com o convite e o endereço em texto leve na cor de apoio. Não usar caixa clara na largura toda nem competir com as mesas. Ao mudar, confira a leitura com jsqr também na imagem reduzida à metade.
- Cabeçalho da rodada: quatro ações de 44px no celular. No desktop ele mora no menu lateral estreito, com ações de 28px de largura.
- Mudança de posição fica junto do número, sem coluna nova, com seta, cor e texto para leitor de tela.
- Painéis secundários (Qualidade do sorteio) vêm fechados, numa linha, com pílula e chevron. Abrem sozinhos só com nota regular ou ruim antes de a rodada começar. Abertos, 2 linhas curtas e os botões. O resto vai para a folha de detalhes.
- Sortear de novo é secundário com nota perfeita ou ótima e principal nas outras. A comparação com o anterior fica 5 s, e o Voltar ao anterior continua no painel.
