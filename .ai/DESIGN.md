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

## iPad e PC

- Prioridade: Torneio, Organizar mesas do clube e Ranking, as telas mais usadas por clubes. Teste com lista cheia (40 a 64 pessoas) e nomes compridos.
- Menu lateral a partir de 1024px deitado. Em pé ou dividido, barra inferior.
- Histórico e Em andamento no celular deitado: uma coluna, com todos os cards na largura da busca (pedido do usuário em 22/11/2026). Card não encolhe até o texto, e duas colunas só quando o nome cabe. Janela de PC com até 560px de altura também fica em uma.
- Card de partida (Histórico, Em andamento e MCR) abre e fecha os detalhes com toque em qualquer ponto, menos nos botões (pedido do usuário em 22/11/2026). Para mostrar que abre, a pílula "Detalhes" com chevron fica ao lado da data, sem linha só para a seta. Abaixo de 480px fica só o chevron. A pílula é o botão do teclado e do leitor de tela.
- Toque: 44px no tablet (`any-pointer: coarse`). Só com mouse os itens do menu encolhem, menos com a Área de toque ampliada.
- A ação principal fica à vista sem rolar: Sortear preso na base, Registrar dentro da tela, timer da rodada preso no topo.
- `sticky` dentro do conteúdo principal só funciona com `overflow-x: clip`. Com `hidden` o main vira área de rolagem e nada gruda.
- Nome de jogador nas mesas quebra linha, nunca é cortado.
- iPad em pé é tela grande, não celular esticado: usa a largura (880 a 1040px), os assentos crescem até a ação principal fechar embaixo e a letra sobe no Pro 13.
- O Pro 13 atual tem 1032×1376. Faixas de iPad vão até 1376px, não 1366.
- Tocar na aba Ranking com a análise de um jogador aberta volta à lista, com os filtros. Formulário aberto não sai com esse toque, para não perder o digitado.
- Texto no iPad: 17px para o que se lê (títulos de seção, dicas, ajudas, contagem) e 15px para selos e metadados. Só rótulo dentro de círculo pequeno fica em 13px. Fica em `estilos/textos-tablet.css`: texto de apoio novo entra lá.
- MPSZ em tela alta: teclas de 72 a 100px conforme a altura, todas iguais. O ? do Sorteador tem 34px, na linha da escolha de jogadores.
- Ranking a partir de 768px, em pé ou deitado: uma linha por jogador, com as métricas em colunas alinhadas. A tabela do torneio vai até 960px.
- Controle escondido numa largura precisa existir em outro lugar dela (o Guia de bolso sumia no PC).

## Seleção de pedras

- Não escolhida não é desabilitada: a pedra fica com a aparência cheia (opacidade, face e cor das Pedras). Escolhida ganha só um contorno por sombra na cor `--cor-destaque` (a do botão Gang, rosa no tema escuro), com `aria-pressed` e sem mudar de tamanho. No Alto contraste o contorno engrossa. O foco fica por fora dele. Exemplo: Flores e Estações do MCR.

## Teclados em grade

- Linha de botões nunca tem altura fixa menor que o mínimo de toque (44px, 46px com a Área de toque ampliada): use `minmax(44px, auto)`. Com altura fixa, as linhas montam uma na outra. Em tela baixa, encolha o visor, não as teclas.
- Colunas vizinhas de um teclado têm as linhas alinhadas: não esticar só uma delas (teclas em oval desalinhadas foram recusadas pelo usuário).
- Mudou um teclado, abra o "?" dele: a cena de ajuda é um desenho à parte e precisa ser conferida na tela.
- MPSZ em tela baixa: primeiro saem as folgas, depois as pedras e as teclas encolhem, estas nunca abaixo de 44px. Deitado, se ainda não couber (320px de altura), o painel rola em vez de cortar.
- Teclado de pontos com W.O.: o botão fica acima do Calcular mão. Em tela baixa os dois botões e o visor encolhem, e até 600px de altura eles dividem a linha. A folha não rola em 360×640.
- Na tela é sempre "WO", sem pontinhos, também para quem saiu no meio (pedido do usuário em 22/11/2026). O botão do teclado diz só WO, sem explicação junto: ligado muda o fundo, a borda e o ícone para ✓, e tocar de novo desfaz. A explicação fica no ? da regra.
- Registrar partida e Finalizar mesa usam a barra da Lista (pedido do usuário em 22/11/2026, substitui o par de botões): presa embaixo, soma e status à esquerda, ícones de 44px à direita na ordem da Lista (lixeira, configs, disquete) e Registrar na largura toda, com ícone. Nada de segundo botão largo. No celular deitado vira coluna à direita. Na retomada, a faixa da rodada ocupa o lugar da dica.
- Na barra do registro cabem no máximo 3 ícones em 320px: a ampulheta das salvas fica no cabeçalho. Regras travadas (torneio e Chinês) não têm configs. A lixeira confirma e não tira quem veio do sorteio.
- Registrar partida não tem título "Jogadores e pontos" (pedido do usuário em 22/11/2026: era tímido e repetia a faixa). A faixa roxa diz "Toque para registrar jogadores e pontos". Quando os jogadores vêm do sorteio, ela fala só dos pontos.
- O preset no registro é só leitura (pedido do usuário em 22/11/2026): num quadro com borda e fundo apenas visual (sem toque, chave ou cadeado), descido até rente à barra, com a linha do negativado. Quem edita é o ícone de configs.
- Teclado de pontos: no Riichi a última linha tem 0, 00 e 000. No Chinês os pontos são pequenos, então não tem 00 nem 000, e o − e o + ocupam duas linhas cada.

## Pedras brancas

- Nunca branco puro: creme, para não chocar com o fundo (pedido do usuário). `--pedra-face` é #F2EFE6 no Dark e #FAFAE8 no Azul, igual no Riichi e no Chinês.

## Dragão Branco (pedido do usuário em 22/11/2026)

- No Riichi é liso, só a cor da pedra: sem moldura nem linha interna, em qualquer cor de pedra.
- No Chinês o desenho mistura as cores da arte: verde com vermelho, e verde com rosa nas pretas do tema escuro. A versão de uma cor só foi testada e o usuário preferiu esta (22/11/2026).

## Escrita

- Rótulos dizem o que vai acontecer ("Salvar partida", não "OK").
- Erros explicam o problema e como resolver. Estados vazios orientam o próximo passo.
- Variantes de mahjong pelo nome que os jogadores usam (Riichi, MCR), não pelo país.

## Padrões de tela do Torneio

- Texto de ajuda visível tem no máximo 1 linha em 360px (cerca de 331px úteis), nos 7 idiomas. O resto vai para o ? (`AjudaCampo`) ao lado do rótulo.
- `AjudaCampo` não vai dentro de `<label>` que envolve um campo: use um `div` e dê `aria-label` ao campo.
- Selo do formato ao lado de "em andamento" no card, na rodada e no ranking. O nome trunca, os selos não.
- Encerrar fica ao lado do Ranking, sempre com confirmação.
- Ordem no topo da rodada (pedido do usuário em 22/11/2026): Encerrar, Ranking, Compartilhar, ⋮. Sem Encerrar (torneio finalizado), começa no Ranking.
- Ranking: visão e filtros ficam numa barra abaixo do nome do torneio, não no cabeçalho (no desktop ele é estreito).
- Ranking: a linha inteira abre a folha da distância, com um botão no nome para teclado e leitor de tela. A folha mostra Mangan, Haneman e Yakuman, e o Baiman fica no leitor de tela e em "Distância em".
- Card do jogador, nesta ordem: cabeçalho (nome, posição, pontos, compartilhar, setas, fechar), Comparar com (é filtro, vem antes do que filtra), divisória, lista e o rodapé Aproximado. Os números ficam recolhidos numa linha antes do rodapé.
- A linha da distância expande no lugar, com chevron e `aria-expanded`, uma por vez. Os cenários usam o nome, sem artigo nem pronome ("1 direto", não "1 nela").
- Na linha aberta são sempre os dois, em caixas iguais (pedido do usuário em 22/11/2026): primeiro "Sem a média" (as mãos da diferença de agora) e depois "Com a média" (costume e chance). As tabelas de cenário vêm depois. A probabilidade nunca substitui as mãos. Vale também na distância para o próximo do Ranking geral.
- Número que depende de mão lançada some quando não existe. Nada de coluna de "—" em torneio.
- Centerpiece simples tem a faixa roxa fixa, como a do registro (pedido do usuário em 22/11/2026, no lugar da dica que sumia no 1º toque): uma linha para abrir o menu e outra, só com timer ligado, para os ventos iniciarem e reiniciarem o cronômetro. Fica embaixo da mesa, para não concorrer com o ? do topo. A mesa encolhe para ela caber, e com a tela deitada e baixa a faixa vai para o lado da mesa, que não reserva altura para ela (vale também na mesa de 3). No celular deitado (até 500px de altura) ela é uma tira virada para quem senta na lateral, no mesmo sentido do giro da mesa, colada na mesa (12px), no meio da altura dela (80%, sem ir de canto a canto) e com letra de 14 a 18px conforme a altura (pedidos do usuário em 22/11/2026). Só em tela estreita (menos de 660px ou proporção até 7:4) ocupa a altura toda, para o texto caber nos 7 idiomas. O toque na faixa abre o menu.
- Menu Mesa do Centerpiece simples, quando é painel à direita (celular deitado), fecha arrastando para a direita, por onde entrou (pedido do usuário em 22/11/2026). É opção do Modal (`fechaParaOLado`), não padrão: com abas ou páginas, arrastar de lado é delas. O usuário decidiu em 22/11/2026 deixar só nesse menu: não levar aos outros sem ele pedir.
- Honba no menu Mesa é uma pílula só, sem caixa dentro de caixa (pedido do usuário em 22/11/2026): − e + iguais, com 48×44px de toque, o número no meio e só o − apagado no 0.
- Mesas de 3 e 4 do Centerpiece simples: o texto do centro encolhe com o anel, sem mínimo fixo que passe dele (pedido do usuário em 22/11/2026). No celular deitado a de 3 usa o mesmo quadrado da de 4.
- Menu ⋮ do torneio em dois grupos com título (pedido do usuário em 22/11/2026, no lugar da divisória): Métricas (Estatísticas, Compartilhar resultado) e Ações do torneio (as que mudam o torneio, com Abortar por último em vermelho). Sem ação disponível, o título das ações não aparece.
- O menu ⋮ repete, com nome, o que os ícones do topo fazem (pedido do usuário em 22/11/2026: "mesmo que tenha ícone"). Entre Métricas e Ações fica Compartilhar e exportar (rodada em texto, rodada em imagem, Exportar), e Encerrar abre as Ações. Ícone novo no topo da rodada entra também no menu.
- Quem está sendo acompanhado fica destacado e, fora da tela, fixo acima da navegação. Use `position: fixed`: `sticky` não gruda dentro do conteúdo principal.
- Colocação e pontos se separam por espaço e cor (a colocação neutra, os pontos em verde ou vermelho), sem "·" depois do "º".
- O ? fica sempre ao lado de um título, nunca no meio ou no fim de um texto de apoio. Embaixo do Formato vão no máximo duas linhas: o que é e quantos jogadores precisa. O resto vai no ? do Formato.
- O ? com mais de uma ideia não é parágrafo corrido: título curto, uma linha por caso (rótulo em negrito e frase curta embaixo), o caso atual em destaque e o porquê no fim.
- Valor padrão escolhido pelo app tem um ? com o porquê do padrão, não só o que o campo faz.
- Registrar ausência é o ícone ao lado de Registrar resultado. A folha mostra os pontos de cada um antes de confirmar.
- WO usa selo neutro e "Faltou" ou "Presente" no lugar dos pontos da mesa, sem colocação.
- QR das imagens é uma assinatura discreta (pedido do usuário em 22/11/2026): 148 px em 1080, escuro em fundo lilás claro só no QR, nos dois temas, com o convite e o endereço em texto leve na cor de apoio. Não usar caixa clara na largura toda nem competir com as mesas. Ao mudar, confira a leitura com jsqr também na imagem reduzida à metade.
- Cabeçalho da rodada: quatro ações de 44px no celular. No menu lateral elas descem para uma linha abaixo do título, também com 44px.
- Mudança de posição fica junto do número, sem coluna nova, com seta, cor e texto para leitor de tela.
- A seta nunca deixa a conta para quem lê (pedido do usuário em 22/11/2026): embaixo dela vai a posição de antes, em cor neutra ("era 2º"), e no card "era 2º na rodada 1". O leitor de tela fala os dois. Quem manteve ou estreou não tem "era".
- Painéis secundários (Qualidade do sorteio) vêm fechados, numa linha, com pílula e chevron. Abrem sozinhos só com nota regular ou ruim antes de a rodada começar. Abertos, 2 linhas curtas e os botões. O resto vai para a folha de detalhes.
- Sortear de novo é secundário com nota perfeita ou ótima e principal nas outras. A comparação com o anterior fica 5 s, e o Voltar ao anterior continua no painel.

## Compartilhar a mão (imagem dos Stories)

- Ícone de compartilhar (`fa-share-nodes`, o mesmo do resto do app) no cabeçalho do Resultado, antes do lápis, com 44px como os outros. O Compartilhar da prévia usa o mesmo ícone (pedido do usuário em 26/11/2026). O resto do Resultado não muda.
- Imagem de 1080×1920. Zonas que o Instagram cobre: 250px no topo, 340px na base e 48px nos lados (`SAFE_TOP`, `SAFE_BOTTOM`, `SAFE_SIDE` em `comporHistoria.ts`). Textos e mascote ficam dentro delas.
- Nenhuma tela desenha as pedras do app (pedido do usuário em 25/11/2026): a foto que a pessoa tirou é a protagonista e já mostra a mão.
- A foto é a estrela (pedido do usuário em 26/11/2026): nunca é cortada (sempre contain) nem coberta, em qualquer orientação, na tela e na imagem exportada. Atrás dela vai a própria foto desfocada e escurecida (cover, blur de 24px, brilho 45%, escala 1,1), para não sobrar faixa vazia. Deitado, o desfoque é mais escuro e menos saturado (brilho 30%, saturação 60%) e a coluna tem um degradê escuro nas bordas, por baixo da foto: uma pedra laranja no canto vazava um brilho (pedido do usuário em 26/11/2026).
- Um layout só, na tela e na imagem (pedido do usuário em 26/11/2026): os estilos Foto cheia e Cabine, as bolinhas para trocar entre eles e o botão Deitada saíram. O título "Riichi Manager / Acesse o app" também saiu, fica só o mascote com o QR.
- Imagem exportada: a foto inteira no topo, na largura toda com o tamanho natural dela, encolhendo (sem cortar) se faltar altura. Embaixo, o resultado à esquerda e o mascote no canto direito, sem cobrir pontos nem yaku. Com carimbo, ele tem 300px à esquerda do mascote, com 70% da altura dele reservada embaixo do resultado (a ponta de cima pode invadir os yaku), a 85% e em tela, como na prévia. A dica do Link não entra. Desenhada num canvas fora da tela, separada da prévia.
- Câmera: tela cheia preta, X e virar câmera (só com mais de uma) em 44px no topo, e embaixo a galeria (48px), o obturador (72px) e o ? (48px), que abre "Como fotografar a mão": um desenho da disposição e 5 dicas de uma linha (pedido do usuário em 25/11/2026). A guia tracejada é dividida em Mão, Chamadas e Batida (em rosa, na ponta), na ordem em que as pedras vão na mesa (pedido do usuário em 25/11/2026). Sem câmera ou sem permissão, aviso no meio da tela e a galeria, sem alerta.
- Celular deitado na foto (pedido do usuário em 25/11/2026): a web não consegue travar a orientação (o iPhone não deixa e o Android só em tela cheia), então a câmera em pé mostra "Gire o celular para deitado" com o ícone girando, sem bloquear a foto. Deitado, o aviso some e a guia ocupa a largura.
- Prévia montada na tela nas duas orientações (pedido do usuário em 26/11/2026), com 100dvh e as áreas seguras. No painel do resultado, o topo (patamar, a linha com a pílula do Ron/Tsumo, han/fu e quem bateu, e os pontos) vai na largura toda. Embaixo, os yaku em cartões à esquerda, o carimbo no espaço que sobra embaixo deles e o mascote no canto direito, sem se cobrirem.
- Prévia em pé, nesta ordem: foto (até 45% da altura, ou a altura natural se a foto for deitada), resultado e a barra de ações. Faltando espaço, encolhe primeiro a foto (até 20% da altura), depois o mascote (pela altura da tela) e por fim os pontos.
- Prévia deitada: a foto numa coluna com a altura toda e a largura da proporção real dela, até 60% da área útil (sem o trilho), e deixando pelo menos 400px para o painel, que fica com o resto. A foto encosta nas bordas da coluna, com o desfoque só onde ela não chega. O quadro com respiro, fio lilás e sombra foi testado e descartado pelo usuário em 26/11/2026. O trilho de ícones à direita não mudou.
- Ações da prévia: Refazer, Salvar, Descartar (lixeira vermelha, que joga a foto fora e volta ao Resultado) e Compartilhar em lilás, a principal. Em pé, os três primeiros com ícone e nome curto e o Compartilhar largo embaixo. Deitado, o trilho de ícones, com o Compartilhar como o botão redondo de destaque: 52px, fundo lilás, ícone escuro, no fim do trilho e 16px abaixo dos outros. A versão só com o ícone lilás, sem a bola, foi testada e o usuário voltou atrás em 26/11/2026. Esc também descarta. Na câmera, onde ainda não há foto, continua o X.
- Bloco do resultado com o visual do Resultado do app e sem os pagamentos: patamar em peso normal, a pílula do Ron/Tsumo, quem bateu, han/fu e os pontos grandes na cor primária. Na tela, todos os yaku em cartões, um por linha, como no Resultado (pedido do usuário em 26/11/2026): o nome à esquerda e o valor em lilás à direita, sem o ícone de explicação. Deitado, os cartões ficam mais baixos. Na imagem, até 8 pílulas (com mais, 7 e um "+N"). O han/fu some quando só repetiria o patamar (Yakuman).
- Carimbo de borracha das mãos grandes (pedido do usuário em 26/11/2026, no lugar do selo hanko com kanji): `HanCarimbo`, só do Mangan para cima e só no Riichi. Como os selos "ORIGINAL", num SVG próprio de viewBox 200: anel de r=94 (6px) e de r=80 (2px), "- RIICHI MAHJONG -" curvo em cima, o han/fu curvo embaixo ("- 11 HAN · 20 FU -", ou "- 2× YAKUMAN -" no Yakuman), círculo interno de r=62 (3px) e a palavra do nível em Anton atravessando o meio, ajustada a 150px com `textLength`, sobre uma faixa da cor do card que "corta" o círculo interno. Estrelas acima e abaixo da palavra contam o nível (Mangan 1, Haneman 2, Baiman 3, Sanbaiman 4, Yakuman e Kazoe 5), com a do meio maior. Só tinta, sem preenchimento: roxo do app no Mangan e Haneman, vermelho #E5484D no Baiman e Sanbaiman, dourado #E0B341 no Yakuman e Kazoe.
- Texto curvo do carimbo em 11px, não 13px: entre os anéis sobram só 10px e as letras da Anton, que são altas, encostavam neles.
- Tinta gasta: máscara de ruído (feTurbulence 0,9, 2 oitavas) com um corte que tira ~15% da tinta (medido). A semente vem da própria mão (nome do patamar, han, fu, pontos, ron/tsumo e yaku) e decide o desgaste e a inclinação, entre -8° e -14°. A prévia e a imagem usam o mesmo SVG em texto (`svgDoCarimbo`), com a Anton embutida em data URL, então o desgaste sai igual nos dois (conferido pixel a pixel). A inclinação fica dentro do SVG, para a imagem não passar da própria caixa e o painel não rolar.
- Carimbo na tela: à esquerda do mascote, com o centro um pouco acima da base dele, em até 160px em pé e 170px deitado. Pode invadir a lista de yaku, como um carimbo batido por cima do papel, em até 35% da área dele, com opacidade 0,85 e mix-blend-mode screen para os yaku continuarem legíveis. Nunca cobre o título, os pontos, o QR nem a barra. Sem espaço, encolhe até 110px e depois some (deitado, com 7 yaku num celular de 390px de altura, ele some). Em pé, a mão com carimbo reserva 76px embaixo dos yaku, que a foto cede. A posição é calculada medindo o painel (`posicaoCarimbo.ts`). Entra 200ms depois do mascote, como uma carimbada (escala 1,5 → 0,94 → 1 e opacidade em 280ms), e o card treme 2px por 120ms. Com `prefers-reduced-motion`, aparece parado. O aria-label tem o nível e o han/fu ("Sanbaiman, 11 han 20 fu").
- Dica do Link fora do card (pedido do usuário em 26/11/2026): em pé, uma linha pequena embaixo da barra de ações. Deitado, um balão ao lado do Compartilhar que some sozinho em uns 6s. Só nas 3 primeiras vezes que a tela abre (contagem no localStorage).
- Ao conferir o QR com jsqr numa foto real, leia o recorte do QR: na imagem inteira, as pedras da foto confundem o jsqr.
- Fundo da prévia no roxo escuro do app (#141019), no lugar do preto, em todos os temas. A câmera continua preta.
- Mascote (pedido do usuário em 26/11/2026): um cachorro de boné de hélice segurando uma placa, com o QR desenhado dentro dela, preto no branco puro, nível M, sem logo nem margem extra (a placa já tem a margem branca). Inclinado em -5° e passando 10% da borda direita, como numa pose de vitória. Só rotação no plano: perspectiva, skew e filtro são proibidos, para o QR continuar legível. Na imagem exportada tem 400×500, com o QR de 160px. Na tela, em pé, cerca de 38% da largura (no máximo 22% da altura), e deitado 45% da altura.
- Animação do mascote na tela: entra com translateX de 40px a 0 e escala 0,9 → 1,05 → 1 em 350ms ease-out. Só a hélice gira em loop (dentro do SVG), nunca a placa nem o QR. Com `prefers-reduced-motion`, nada se mexe.
- Arte do mascote: `public/mascote/mascote-qr-placeholder.svg`, placeholder até a arte final. O caminho fica só em `MASCOTE_QR_SRC` (`historia-mao/mascote.ts`), junto das medidas da prancheta (800×1000): moldura da placa 176,496 448×448, área branca 208,528 384×384 e área do QR 240,560 320×320 (30%, 56%, 40%, 32%). A arte final precisa manter essas medidas e o id `helice` na hélice. O código não depende do desenho. Sem a arte (não carregou), a imagem exportada sai com o QR simples em fundo branco.
