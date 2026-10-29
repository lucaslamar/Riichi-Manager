# Changelog - Mojoca

## 5.7.2 - 2026-10-29

### Alterado

- **Notação de volta à Calculadora de Mão**, agora como botão **Notação** depois de Kan fechado. Ela troca o teclado de pedras por um campo de texto com o teclado normal do celular (aceita maiúsculas e espaços), e a mão é montada enquanto se digita. A Han e Fu voltou a ser só a calculadora.
- **Chamadas digitadas**: `c` depois de um grupo é chamada aberta, e o app deduz o tipo pelo formato (`123mc` chi, `111pc` pon, `1111sc` kan aberto); `a` é kan fechado (`1111ma`). No modo notação os botões Chi / Pon / Kan somem.
- **Deslizar**: nas pedras, dedo para a direita abre a notação; nela, dedo para a esquerda (ou o botão ‹ Peças) volta às pedras.
- **Ajuda "?" da notação**, no padrão das ajudas da finalização: naipes, honras, 5 vermelho, chamadas e batida, com pedras de exemplo.

## 5.7.1 - 2026-10-29

### Alterado

- **Han e Fu de volta à barra inferior**, logo depois da Calculadora, com um ícone novo de palito de riichi (também na sidebar). O atalho Han e Fu saiu da linha Chi / Pon / Kan / Kan fechado, e o deslizar segue a ordem da barra: Calculadora, Han e Fu, Aprender, Sorteador, Regras.
- **Notação da mão agora fica na Han e Fu**: um campo de texto que usa o teclado padrão do aparelho e aceita maiúsculas e espaços (`2388M 447p`). Abaixo dele aparecem a contagem de peças ou o erro e as pedras lidas.
- A Calculadora voltou a ter só o teclado de peças: saíram o seletor Peças | Notação e a barra de naipes da 5.7.0.

## 5.7.0 - 2026-10-29

### Novo

- **Calculadora: mão por notação**: além do teclado de peças, a mão pode ser digitada em notação (`2388m447p2458889s`, `0` para o 5 vermelho, `1z`–`7z` para ventos e dragões). O campo abre o teclado numérico do celular e uma barra com m, p, s, z e apagar, que não fecha o teclado. A última pedra digitada vira a batida. O seletor Peças | Notação lembra a última escolha, e a mão passa de um modo para o outro sem se perder. Com a notação errada, o erro aparece abaixo do campo e a mão não é calculada.

- **Aprender a jogar**: guia em tela cheia para quem nunca jogou, lido como um livro, passando as páginas para o lado. Abre pelo novo item "Aprender" na barra inferior (e na sidebar e no menu). Feito em colaboração com o Cerrado Mahjong Club, inspirado no Mahjong Guia de Bolso, de Isabella Oliveira.
  - **6 módulos em sequência**: As pedras, A mesa, A mão válida, O turno (comprar, pon, chi, kan, tsumo e ron), Yakus para iniciantes e Dora. Cada módulo abre com uma capa de capítulo e termina num quiz de escolher a resposta: ao responder, a certa fica verde (e a escolhida errada, vermelha) e a explicação aparece. As mãos de exemplo usam as pedras do app.
  - **A mesa, passo a passo**: jogar os dados (a contagem anti-horária a partir do oya: 5 e 9 no oya, 2, 6 e 10 à direita…), abrir o muro contando da ponta direita, o muro morto (as 7 colunas à direita da abertura, o indicador na 3ª coluna a partir da abertura, as reposições do kan nas colunas 1 e 2), o caso dos dados menores que 7 (o muro morto dobra a esquina para o muro vizinho) e a compra, que começa à esquerda da abertura.
  - O exemplo da mesa é com os dados dando 5: a contagem volta ao próprio oya e o muro morto já precisa ser completado no muro vizinho (5 colunas no Leste + 2 no Sul). O quiz do módulo pergunta onde ficam a abertura e o muro morto com os dados 4.
  - Na mesa vista de cima, cada muro fica na frente do seu jogador, com um vão em cada canto: os muros não precisam se encostar nem formar um quadrado perfeito (o texto do passo diz isso também).
  - **Tenpai com mãos inteiras**: cinco mãos de 13 pedras (dois lados, no meio, na ponta, dois pares e só o par), com cada grupo rotulado como na Formação da mão do Guia de bolso e o grupo da espera em vermelho, seguido da seta com as pedras que completam.
  - Na capa do guia a barra de cima fica sempre à vista, e a dica da capa explica que o X volta para o app e o botão de lista abre o índice.
  - **Vermelho onde importa**: nas ilustrações, o corte da abertura, a contagem das colunas, o contorno do muro morto, o indicador e a seta da compra; no texto, as palavras-chave (ponta direita, abertura, 3 colunas a partir da abertura…).
  - **Ilustrações em preto e branco**, no traço de mangá: a fileira de 17 × 2 com o close de uma coluna; a mesa vista de cima com a contagem dos dados, a abertura, o muro morto dobrando a esquina, a seta da compra e os descartes em fileiras de 6 com o centro da mesa; e o close do muro morto com o indicador virado e a reposição do kan sozinha ao lado.
  - **Yakus para iniciantes numa página só**: Riichi, Menzen Tsumo, Tan'yao, Yakuhai e Pinfu em cartões que abrem ao tocar. O "Ver em Aprender a jogar" de um desses yakus abre o guia já com o cartão dele aberto.
  - **Chamadas como ficam na mesa**: pon da esquerda, da frente e da direita (a pedra pegada de lado, apontando para quem descartou), chi, kan aberto, kan fechado (pontas viradas) e kan adicionado (a 4ª pedra deitada em cima).
  - **Dora numa página só**: o indicador no muro morto, a ordem dos números, ventos e dragões com as pedras e exemplos.
  - **Leitura limpa**: a tela mostra só a página, com o número no rodapé. Tocar no terço da direita da tela avança e no da esquerda volta (com dedo ou mouse), além do deslize e das setas do teclado. Um toque no meio mostra a barra de cima (fechar, módulo, índice e progresso), que some sozinha.
  - **Índice**: módulos com as páginas (✓ nos concluídos), Regras à parte, Glossário e Créditos. No celular abre por baixo; no tablet, preso ao botão.
  - **Regras à parte**, em três partes:
    - **Pontuação**: Han e fu, Os patamares, Quem paga (com quiz), Honba e empate, A próxima mão, Fim da partida e Hanchan.
    - **Mais regras**: Ventos de valor, Furiten, Mais detalhes do Riichi, Yakus de situação, Mais yakus, Yakuman e Chombo.
    - **Estratégia**: Eficiência da mão (o que descartar primeiro, esperas de dois lados, com quiz) e Defesa básica (genbutsu, suji e nakasuji, e contra o que o suji não protege).
  - **Continuar de onde parou**: a capa oferece "Continuar" ou "Começar do início".
  - Na página 2.1 o Sorteador de Ventos e em Pontuação › Han e fu a Calculadora de Han e Fu abrem por cima do guia. Ao voltar, o guia continua na mesma página.
  - Os termos do glossário viram link nas páginas, como nas ajudas "?". Os valores dos patamares e o han dos yakus vêm do próprio app.
- O Aprender entrou no deslize entre telas, na ordem da barra (Calculadora, Sorteador, Aprender, Regras): deslizar para a esquerda no Sorteador, ou para a direita nas Regras, abre o guia. Ao fechar, a pessoa volta para a tela de onde veio.
- **"Ver em Aprender a jogar"**: as ajudas "?" da finalização, a definição de um termo e os cartões de yaku ganharam um link discreto que abre o guia na página do assunto, por cima da ajuda.

### Alterado

- Janela base (Modal): o deslize de página foi para um hook compartilhado (`useDeslizePaginas`), o mesmo do guia. Deslizar numa área que rola de lado (tabela larga) não vira mais a página.
- Com uma janela ou o guia abertos, deslizar pela borda esquerda não abre mais o menu por trás deles.
- "Como funciona o sorteio" saiu da tela Regras e virou um botão "?" no canto de cima do Sorteador de Ventos.
- Sorteador: as bolinhas de pensamento terminam fora da cabeça do gato, do lado do balão, e as pedras dos balõezinhos têm face branca.

## 5.6.1 - 2026-10-23

### Novo

- **Busca sempre à mão no Guia de bolso**: o campo "Buscar termo, yaku ou aba" fica preso logo abaixo das abas e continua visível ao descer o Glossário e os yakus. O sumário do Glossário agora para o assunto logo abaixo da busca.
- Guia de consulta do tutorial de Han e Fu: a busca também fica presa no topo ao rolar.

### Alterado

- **Tablets sem "cartão flutuando"** (a partir de 768px, como o iPad 11, Air e Pro; o iPad mini segue com o layout de celular): Regras, Sorteador e Calculadora de Han e Fu ocupam a tela de borda a borda até a navegação, sem sombra, sem cantos arredondados e sem faixa cinza dos lados nem embaixo. Margens internas de 32px em pé e 48px deitado (menores no Modo compacto).
- Regras e configurações: texto com largura de leitura (até 720px), fundo até a barra de navegação.
- Sorteador no tablet: sem a largura fixa de 600px; gato e balão centralizados no espaço livre e o gato escala pelo menor lado da tela, sem rolar em pé nem deitado.
- Calculadora de Han e Fu no tablet: a Tabela rápida mostra o Han nas colunas e o Fu nas linhas (canto "Fu/Han"), cabe na largura sem rolar de lado, com colunas iguais e os pares do tsumo ("500-1.000") numa linha só. A linha de Han fica presa embaixo do cabeçalho ao rolar. Com a sidebar, a página não rola mais para o lado.
- Calculadora de Han e Fu: o valor do Han e do Fu tem sempre a largura de 3 algarismos, sem os botões − e + por cima do número. No tablet, Han e Fu ficam um embaixo do outro quando não cabem lado a lado.
- Finalização da Calculadora de Mão no tablet: a lixeira foi para as ações do cabeçalho, depois do lápis (Guia, Regras, Editar, Limpar), em vermelho e com área de toque de 44×44px, também nas outras ações. As 14 pedras usam a largura toda numa linha, até 52px. No celular a lixeira continua no canto da mão.
- Cabeçalho: o lugar do botão de voltar fica reservado em todas as telas, então o MOJOCA não muda de posição quando a seta aparece (celular em pé e tablet).
- O campo de busca virou um componente compartilhado (`CampoBusca`), usado no Guia de bolso e no tutorial.

## 5.6.0 - 2026-10-23

### Novo

- **Tutorial "Como contar Han e Fu"**: abre ao tocar no cabeçalho da Tabela rápida (com o chapéu de formatura 🎓) e no verbete Fu do Glossário. É a mesma janela das ajudas "?", agora em páginas: Anterior/Próximo, pontos para pular de página e deslizar o dedo para o lado.
  - **Visão geral**: a ordem da conta (han, mão de limite, fu, tabela), com o link "calcule você mesmo" que leva direto à página da fórmula.
  - **Contando han**: yaku, dora (que não é yaku), mão aberta e a leitura com mais han.
  - **Guia de consulta**: Fu base, Fu das combinações (tabela), Par, espera e arredondamento (só o par do seu vento e do vento da rodada soma fu), Mãos de limite (tabela, com nota sobre o Kiriage Mangan), Honba e dois exemplos com as pedras do app (a mesma mão por tsumo e por ron, com o fu somado parcela por parcela). No topo, campo de busca (o mesmo do Guia de bolso) e sumário que rola até cada assunto.
  - **Do Han/Fu aos pontos**: a fórmula numa caixa de livro didático (Pontos básicos = Fu × 2^(2 + Han), com expoente de verdade), quanto o oya e o ko recebem no ron e no tsumo, o exemplo de 4 han e 110 fu passo a passo e "Matemática para idiotas": dobrar, quebrar o número, truque do 11, multiplicação com retas (desenhada reta a reta, parada com "Reduzir movimento") e o pagamento. Termina com a curiosidade do kuku (九九) e o botão "Ver na Tabela rápida". Crédito à página Japanese mahjong scoring rules, da Wikipedia (CC BY-SA 4.0).

### Alterado

- **Tabela rápida sempre aberta**: saiu a seta de abrir/fechar. O cabeçalho ficou com metade da altura, com "Valores base sem honba." na mesma linha do título.
- Tabela rápida no celular: cada linha mostra o Han em cima do Fu ("3 Han / 30 Fu"), para não perder a referência ao rolar.
- Tabela rápida no tablet: a coluna Han/Fu fica presa à esquerda quando a tabela rola para o lado.
- Tabela rápida com o celular deitado: a linha "1 Han · 2 Han · 3 Han · 4 Han" desce junto ao rolar.
- Calculadora de Han e Fu: "É leste?" virou "É oya? 親".
- Janela base (Modal): ganhou o modo em páginas, usado pelo tutorial. As demais janelas não mudam.

## 5.5.0 - 2026-10-23

### Novo

- **Busca no Guia de bolso**: campo "Buscar termo, yaku ou aba" no topo de todas as abas. Com texto, o resultado entra no lugar do conteúdo: as abas do Guia pelo nome (por exemplo, "yakus para" leva a Yaku para iniciantes), os verbetes do Glossário e os cartões dos yakus. A busca procura no começo das palavras, sem diferenciar acento nem plural, pelo nome, kanji e outras formas de cada termo ("dealer" acha Oya, "naki" acha Chamada, "pares" acha Par e Chiitoitsu). Trocar de aba limpa a busca.
- **Sumário no Glossário**: índice "Sumário:" com os assuntos no topo da aba, que rola até o bloco.
- **Yakus clicáveis**: o nome de um yaku nos textos (por exemplo, "Toitoi" na dica do Chiitoitsu, "Tan'yao" no Kuitan) abre o cartão dele, com han, explicação e mão de exemplo. Também vale para outras grafias, como Chiitoi, Tanyao e Kokushi.
- Glossário, novos verbetes:
  - **Chamada** 鳴き (naki), no começo de Chamadas.
  - **Ron duplo** ダブロン (daburon), abaixo de Ron, com o atamahane (só um vence: quem joga primeiro depois de quem descartou) e os três ron no mesmo descarte.
  - **Patamares de pontuação**: Mangan, Haneman, Baiman, Sanbaiman e Yakuman, cada um com os han e quanto vale, também sendo oya. Os valores vêm das mesmas bases da calculadora.
  - **Renchan** 連荘, abaixo de Oya.
  - **Empate / Ryuukyoku** 流局, com o **Empate abortivo** 途中流局 logo abaixo (Kyuushu kyuuhai, Suufon renda, Suucha riichi, Suukaikan e Sanchahou).
  - **EMA**, numa seção nova, Regras e entidades.
- Formação da mão: exemplo de mão completa com 14 pedras, com Sequência, Sequência, Trinca, Trinca e Par embaixo de cada grupo. No celular, a linha só quebra entre grupos.
- Resultado: cada yakuhai tem a sua explicação: Vento da rodada 場風, Vento do assento 自風, Dragão branco 白, verde 發 ou vermelho 中, com o nome do vento no texto. Se o vento da rodada e o seu são o mesmo, os dois cartões avisam que a trinca conta duas vezes (vento duplo) e vale 2 han.
- Resultado: tocar no patamar (Mangan, Haneman…) abre o verbete dele no Glossário.
- Bloco de dica em cinza com ícone de info, usado na dica do Chiitoitsu, na nota "Dora não é yaku" e no aviso de vento duplo.

### Alterado

- Guia de bolso: abas renomeadas para Yaku para iniciantes, Yaku de sequência, Yaku de terminais, Yaku de trincas, Yaku de naipe e Outros yaku. Os nomes longos quebram em duas linhas, centralizados, com todas as abas da fileira na mesma altura.
- Termos que viram link: agora também dentro do mesmo assunto do Glossário (por exemplo, "tenpai" no Riichi), e mais formas de cada termo: Leste, Sul, Oeste e Norte (Ventos), dealer (Oya), chamada, chamadas e chamar (Chamada), empate, renchan e EMA.
- Textos sem ponto e vírgula e com "pedra" no lugar de "peça", no Guia de bolso, no Resultado e nas ajudas "?".
- Saíram parênteses que só repetiam o que o termo com link já explica: "terminais (1 e 9)", "honras (ventos e dragões)", "quads (kans)", "dealer (Leste)", "chombo (penalidade)".
- Riichi: subtítulo "Declarar pronto" (antes repetia "Riichi").
- Tan'yao: "Apenas pedras de 2 a 8. Sem terminais e sem honras. Vale aberta pela EMA (kuitan)."
- Chiitoitsu: "Exatamente 7 pares, só vale se a mão estiver fechada. Vale lembrar que dois pares iguais não contam.", com a dica de quando tentar em bloco destacado, antes das pedras.
- Pinfu: o par não pode ser de dragão, do vento da rodada nem do seu vento, e o texto avisa que par dos outros ventos pode.
- Dora: o exemplo do indicador usa o mesmo naipe das pedras (7 de Pin → 8 de Pin).
- Furiten: o verbete do Glossário ganhou os três tipos (Pelos descartes, Temporário e De Riichi). Na ajuda "?" do Furiten, os tipos ficam agrupados em "Tipos de furiten", e "Como o app verifica" virou um bloco de dica em cinza.
- Kuitan, Oya e Honba com textos novos. O Honba sobe a cada renchan ou empate, zera quando um ko vence e soma 300 pontos (100 de cada jogador no tsumo).

## 5.4.0 - 2026-10-23

### Novo

- **Sorteador de Ventos com o gato de boné de hélice** (o meme do clube): a hélice gira com uma pedra de vento em cada pá, e o toque faz ela frear; a pedra que para no alto é o vento do jogador, maior e com contorno azul. As pás seguem a ordem da mesa, como nos jogos: Leste embaixo, Sul à direita, Oeste em cima e Norte à esquerda. A hélice gira no sentido anti-horário, o mesmo dos turnos.
- **Sorteio justo por construção**: a ordem dos 4 ventos é embaralhada uma única vez, antes do primeiro toque, com o gerador aleatório criptográfico do aparelho. O toque só revela o próximo vento: o momento do toque e a posição de quem sorteia não mudam nada, e cada jogador tem 25% de chance de cada vento. A explicação está em "Como funciona o sorteio", na tela Regras.
- O gato fala num balão de quadrinho que nasce da boca dele: de quem é a vez, "Sorteando…", o vento sorteado e, no fim, "Ron ron!" com a língua de fora.
- Cada vento sorteado sai voando da boca do gato num balãozinho, ligado a ela por uma trilha de bolinhas, como balão de pensamento. No fim, os 4 se juntam num balão gigante.
- O último vento vai sozinho para o Jogador 4, sem precisar tocar.
- O pirulito na patinha do gato tem "REINICIAR" escrito em granulado colorido e reinicia o sorteio a qualquer momento, mesmo antes de saírem todos os ventos.
- Ícone do Sorteador no menu virou um boné de hélice.

### Alterado

- Sorteador todo no toque: tocar na tela sorteia, passa para o próximo jogador e, no fim, começa outro sorteio; no meio dele, quem reinicia é o pirulito (com um respiro de pouco mais de 1 segundo para ninguém apagar o resultado sem querer). Saíram os botões "Sortear vento" e "Reiniciar sorteio", o título e os cartões com "Disponível".
- Ventos com a mesma pedra da Configuração de ventos da Calculadora de Mão (Leste em vermelho), no lugar dos kanjis coloridos.
- Com "Reduzir movimento" ligado no aparelho, a hélice fica parada e a pedra sorteada vai direto para o alto, com um fade curto.
- A pedra de vento da Calculadora de Mão virou um componente compartilhado com o Sorteador, sem mudança visual na Calculadora.
- Novo script `scripts/check-wind-fairness.ts`: roda 1 milhão de sorteios e falha se algum vento sair fora de 24,5%–25,5% em alguma posição.

## 5.3.0 - 2026-10-22

### Novo

- **Termos clicáveis**: nas descrições do Guia de bolso, nas explicações dos yakus no Resultado, nas Regras de cálculo e nas ajudas "?", os termos do jogo ficam sublinhados em pontilhado (por exemplo, "Ippatsu" e "Ura-dora" no Riichi, "ryanmen" no Pinfu, "kuitan" no Tan'yao). Tocar abre a definição deslizando de lado dentro da própria janela, com o assunto inteiro e o termo destacado em amarelo. A seta ‹, o Esc ou deslizar o dedo para a direita voltam, e termos dentro da definição também abrem. Só a primeira vez que o termo aparece em cada texto vira link.
- Fechar janelas arrastando, como no iPhone: no topo da rolagem, arrastar para baixo; no fim, arrastar para cima; sem rolagem, os dois. A janela acompanha o dedo e o fundo clareia; se soltar antes, volta com efeito de mola. Com "Reduzir movimento" ligado no aparelho, vira um fade curto. O X continua em todas as janelas, menos no Resultado.
- Resultado: lápis (volta para a finalização da mão) e lixeira (limpa tudo e começa uma mão nova) no cabeçalho, no lugar do X.
- Glossário: novos termos Sequência, Trinca, Par, Ryanmen, Kuitan e Ippatsu, com pedras de exemplo em Sequência, Trinca, Par e Ryanmen.

### Alterado

- Guia de bolso: nova ordem das abas, em duas linhas (Glossário, Iniciante, Sequências, Terminais / Trincas, Naipes, Outros, Yakuman), e abre no Glossário na primeira vez.
- Glossário organizado por assunto (Naipes, Honras, Formação da mão, Chamadas, Espera e vitória, Dora, Pontuação e Mesa), cada um num bloco com título e subtítulos. A lista solta de termos saiu, e a nota "Dora não é yaku" entrou no item Dora.
- Ajudas "?" da finalização no mesmo formato de bloco do Glossário, mantendo os textos e o rosa de Doras e honba.
- Finalização da mão: a lixeira saiu do cabeçalho e foi para o canto direito da mão, ao lado da última fileira de pedras, só com o ícone. No cabeçalho, a engrenagem vem antes do lápis. Nos tablets a mão continua numa linha só, com a lixeira no fim.
- Termos do jogo padronizados nos textos: nomes de yaku, patamares e pedras com maiúscula (Riichi, Tan'yao, Mangan, Haku); ron, tsumo, dora, kan, furiten e chombo em minúscula no meio da frase; grafias únicas Ura-dora, Aka dora e Tan'yao (também nos yakus do Resultado).

## 5.2.0 - 2026-10-22

### Novo

- **Guia de bolso 🐑**: botão com chapéu de formatura (🎓) logo antes da engrenagem, no cabeçalho da mão (no tablet, antes da lixeira) e como primeiro botão na finalização. Abre uma janela com abas Iniciante, Sequências, Terminais, Trincas, Naipes, Outros, Yakuman e Glossário, baseada nas regras EMA 2016, no mesmo azul do Resultado. Cada yaku mostra nome em romaji, kanji e português, han com a mão fechada e aberta, uma explicação curta e uma mão de exemplo. Yakumans têm selo dourado e aba própria ("mão máxima"). A última aba aberta é lembrada.
- Aba Iniciante: os essenciais de 1 han (Riichi, Tan'yao, Yakuhai, Pinfu, Menzen tsumo) e os fáceis de 2+ han (Chiitoitsu, Toitoi, Sanshoku doujun, Ittsuu, Hon'itsu, Chin'itsu). O Chiitoitsu traz a dica de quando tentar (4 pares na mão inicial, ideal 5) e de quando é melhor ir para Toitoi.
- Aba Glossário: os três naipes com os números de 1 a 9 em cima de cada pedra; as honras com o nome japonês em cima (Ton, Nan, Shaa, Pei; Haku, Hatsu, Chun); a ordem do indicador de dora (9 → 1, Norte → Leste, Vermelho → Branco), Kan-dora, Ura-dora e os 5 vermelhos, em tópicos; e, por fim, 20 termos do jogo (Yaku, Han, Fu, Tenpai, Chi, Pon, Kan, Riichi, Tsumo, Ron, Furiten, Oya, Ko, Honba, Dora, Ura dora, Aka dora, Mangan, Yakuman e Chombo).
- Deslizar o dedo para o lado troca de aba nas janelas com abas, dando a volta: depois da última vem a primeira, e vice-versa.
- Resultado: tocar num yaku abre a explicação dele no próprio retângulo e pinta de dourado as pedras que formam esse yaku (por exemplo, a trinca de Branco no Yakuhai). Tocar de novo fecha. Uma exclamação no círculo ao lado do nome indica que ele é clicável.
- Resultado: tags com o vento da rodada e o seu vento.
- Regras de cálculo: opção **Multa de chombo**, Mangan (padrão) ou Yakuman. Mangan: 8.000, ou 12.000 sendo Leste. Yakuman: 32.000, ou 48.000 sendo Leste.

### Alterado

- Resultado: com honba, o valor aparece em linhas: Han e Fu com o seu valor, Honba com o acréscimo e o total grande embaixo.
- Resultado: no tsumo, em vez de "All" e "Oya/Ko", aparece quanto cada um paga: "Todos pagam" quando você é Leste; "Leste paga" e "Demais pagam" quando não é. No ron fica só o total.
- Resultado: as tags de vento usam o azul das tags do resultado.
- Penalidade de chombo (sem yaku ou ron em furiten) no mesmo formato do resultado, com as tags de vento em vermelho, o valor e quanto cada jogador recebe, seguindo a regra de multa escolhida.
- Finalização da mão: o teclado dos indicadores de dora abre logo abaixo de "Doras na mão", antes do Honba (no tablet, embaixo dos dois contadores), para não parecer que é do Honba.
- Deslizar entre as telas dá a volta: depois de Regras vem a Calculadora de Mão. A Han e Fu continua fora do círculo (deslizando para a direita na Calculadora de Mão).
- Ajuda de Doras e honba dividida em duas abas, Dora e Honba. Os Indicadores de Dora mostram a ordem do indicador com pedras, e o Aka Dora mostra os 5 vermelhos.
- Ajuda de Batida: saiu o trecho sobre Yaku, que agora tem a referência própria.
- Cabeçalho da mão na montagem: saíram os balões de Tenpai e do Kan ativo. O tenpai continua na cor da borda da mão e o Kan ativo, no próprio botão.
- Resultado: saíram as tags "Dora manual" e "Ura dora", que já aparecem na lista de yakus.

## 5.1.3 - 2026-10-22

### Novo

- Finalização da mão: rolagem guiada. Depois de cada escolha (Batida, ventos, Riichi…), a tela leva a próxima seção para o topo da área visível e, no fim, mostra o Calcular inteiro logo acima da navegação. Só rola para baixo, não mexe em seções que já estão inteiras na tela (comum no tablet) e para se a pessoa rolar por conta própria.

### Alterado

- Finalização da mão: a seção passou a se chamar "Doras e honba", com as Doras antes do Honba.
- Ajuda do Furiten no mesmo padrão das outras ajudas: em vez de lista, cada tipo (Pelos descartes, Temporário, De Riichi) e "Como o app verifica" ganharam um subtítulo com parágrafo.
- Regras de cálculo: o texto do Basengo diz "No tsumo" (antes "Na tsumo").
- Pedras da mão (montagem e finalização) viraram um componente só, com o tamanho definido num token de CSS.

## 5.1.2 - 2026-10-21

### Novo

- Gestos de deslizar com o dedo no celular e no tablet, seguindo a ordem da barra inferior, com a Han e Fu antes da Calculadora de Mão: Han e Fu ← Calculadora de Mão → Sorteador de Ventos → Regras. Dedo para a esquerda vai para a tela seguinte e dedo para a direita volta para a anterior. Na Han e Fu, os dois sentidos voltam para a Calculadora de Mão (inclusive no sentido da seta de voltar). Na finalização da mão, dedo para a direita volta para a edição da mão (como o botão "Editar mão") e dedo para a esquerda vai para o Sorteador de Ventos. Os gestos não agem com janela ou menu abertos, nem quando o toque começa numa área que rola de lado.

### Alterado

- A mão montada continua na Calculadora de Mão ao ir para outra tela e voltar (antes era apagada).

### Corrigido

- Celular em pé (com barra inferior): deslizar a partir da borda esquerda abria o menu lateral, que deveria existir só onde há o botão de menu (☰), como no celular deitado.

## 5.1.1 - 2026-10-21

### Novo

- Regras de cálculo: opção **Dora flamejante** (logo abaixo de Aka dora, desativada por padrão). Quando o Indicador de Dora é um 5 vermelho, cada Dora daquele indicador vale 2 han. Vale para cada indicador separadamente, incluindo Ura Dora. Depende do Aka dora: com ele desativado, a opção fica apagada e não conta, mas a escolha volta quando o Aka dora é reativado.
- Regras de cálculo: opção **Basengo** (logo abaixo de Tanyao aberto, desativada por padrão). Cada honba vale 1.500 pontos em vez de 300; no Tsumo, cada jogador paga 500 por honba. Assim como o honba normal, entra depois dos limites (mangan e acima) e não é multiplicado para o dealer.
- "Restaurar padrão" desativa as duas novas regras. Com elas desativadas, a pontuação continua igual à de antes.

### Alterado

- No app em português, "Vitória" passou a ser "Batida" (título da seção na finalização, ajuda, avisos e Calculadora de Han e Fu).
- Finalização da mão: a seção Honba e doras fica antes da Batida. Nos tablets, a Batida continua na coluna da direita.
- Regras de cálculo: os botões "Restaurar padrão" e "Aplicar" têm a mesma largura e ocupam todo o rodapé. No celular, "Restaurar padrão" quebra em duas linhas.
- Ajuda de Riichi e de Condições especiais: em vez de lista com "Termo: texto", cada assunto ganhou um subtítulo com parágrafo, no mesmo padrão da ajuda de Honba e doras. Os textos das outras ajudas não usam mais dois-pontos como separador, e no Furiten cada item da lista virou uma frase completa.
- Ajuda de Honba e doras: o subtítulo "Indicadores" virou "Indicadores de Dora", e foram adicionados Basengo, Aka Dora e Dora flamejante, cada um explicando como ativar no ícone de engrenagem (⚙) da Calculadora de Mão.
- Botão do dragão ao lado de "Doras na mão": desligado, fica só o ícone cinza, sem o quadrado; ligado, continua rosa. Leitores de tela agora também recebem se o botão está ligado ou não.

## 5.1.0 - 2026-10-20

### Novo

- Finalização da mão: botão de ajuda "?" ao lado do título de cada seção (Furiten, Vitória, Honba e doras, Configuração de ventos, Riichi e Condições especiais). Ele abre uma explicação curta para quem está começando; nas seções com mais de um assunto, a explicação traz um subtítulo para cada um. O antigo "i" das Doras saiu, e o texto dele está na ajuda de Honba e doras.
- Ajudas explicam quais condições são yaku (tornam a mão válida sozinhas), o que é Ura Dora e os tipos de furiten (pelos descartes, temporário e de Riichi). A ajuda de Honba e doras fica toda em rosa, com "Qual é o Dora?" trazendo a curiosidade de onde vem o nome (dragon → doragon → Dora), Doras na mão, Indicadores e Ura Dora; a de Vitória separa Tsumo, Ron e Yaku em subtítulos.

### Alterado

- Finalização da mão: a seção Furiten (botão Descartes) fica logo abaixo da mão, antes da Vitória.
- Finalização da mão: os títulos de seção com "?" ganharam uma linha de 44px de altura, para o "?" ter área de toque confortável sem encostar nos botões da seção.
- O botão de fechar das janelas mostra só o X, sem o círculo; a área de toque continua a mesma. Ao abrir uma janela, o X não aparece mais com o anel de foco (ele só aparece ao chegar nele pelo teclado).
- Botão dos Indicadores de Dora na finalização: o ícone de grade virou um dragão (Dora vem de "dragon").
- Contador de Honba na finalização: rosa como o de Doras (antes azul), já que os dois ficam na mesma seção.
- Finalização: o teclado dos painéis de Dora e Descartes segue o padrão do teclado da montagem em cada aparelho — no celular em pé e nos iPads as linhas ocupam a largura do painel, as Honras ficam centralizadas e as pedras não ficam mais achatadas. Virou um componente próprio (TecladoContextual) para ser reaproveitado.
- Finalização em telas deitadas a partir de 1024px (iPads deitados, Surface e desktop): mesma disposição dos tablets (Furiten; Honba e doras; Ventos à esquerda; Vitória, Riichi e Condições especiais à direita), com a mão compacta numa linha só e fundo branco (antes aparecia o azul-claro da página em volta do card). No iPad Pro 13, no Surface e no desktop ela substitui o layout em duas colunas (mão | opções), que espremia as opções, e tudo cabe sem rolar.
- Finalização com mão aberta (Chi, Pon ou Kan aberto): a seção Riichi continua no lugar, com o título e a ajuda, e diz "Só com a mão fechada" em vez de sumir; o Tenhou/Chiihou some em vez de ficar apagado no meio dos outros botões.
- Finalização nos tablets/iPads, Surface e desktop: os conjuntos (Chi/Pon/Kan) ficam ao lado das pedras da mão, na mesma linha e sem o título "Conjuntos" (continua para leitores de tela), em vez de numa faixa embaixo que empurrava o Calcular para fora da tela. Até 1279px as pedras dos conjuntos ficam um pouco menores para a mão + 4 conjuntos caberem numa linha.
- Finalização nos iPads em pé (Mini, Air, Pro 11 e Pro 13): tudo cabe numa tela só, com o Calcular visível sem rolar. A mão ficou um pouco menor, com as 14 pedras numa linha só (o Air e o Pro 11 quebravam em duas), e o bloco da mão perdeu espaços vazios.
- Finalização nos iPads: as caixas de Honba e Doras na mão dividem a largura da seção, alinhadas às bordas do botão Descartes (antes ficavam compactas à esquerda).
- Teclado da montagem no celular em pé: as Honras ficam centralizadas abaixo dos naipes, como nos tablets. Sem aka dora, os naipes de 9 pedras também ficam centralizados, sem a coluna vazia à direita. As pedras mantêm o mesmo tamanho.
- Teclado da montagem no celular deitado sem aka dora: os naipes de 9 pedras ocupam toda a largura, sem a coluna vazia à direita.
- Finalização no celular deitado: abaixo das pedras ficam o Furiten (Descartes) e depois o Calcular, aproveitando o espaço que sobrava em branco na coluna da mão; a coluna da direita fica só com as opções (Vitória, Honba e doras, ventos, Riichi e Condições especiais).
- Finalização: o painel de descartes ganhou a mesma caixa do painel de Dora, com as pedras descartadas junto do teclado; sem descartes, o teclado fica logo abaixo do botão, sem o espaço vazio que sobrava.
- Finalização no celular deitado: as pedras da mão ficam juntas (2px entre elas), sem o vão de ~8px que sobrava em cada coluna.

### Corrigido

- Finalização da mão no iPad Mini (768×1024): o Haitei/Houtei de Condições especiais ficava cortado, porque a coluna da direita (Vitória, Riichi e Condições especiais) passou do limite de altura da animação de abrir.

## 5.0.0 - 2026-10-19

### Novo nome

- O app passa a se chamar **Mojoca** (antes Riichi Manager). O endereço de acesso continua o mesmo por enquanto.

### Removido

- Centerpiece e Torneio saíram do app por enquanto (ainda faltava UX e responsividade). O código foi guardado fora do projeto para voltar no futuro.
- O app fica com: Calculadora de Mão, Calculadora de Han e Fu, Sorteador de Ventos e Regras / Configurações.

### Alterado

- Barra inferior agora tem só Calculadora de Mão, Sorteador de Ventos e Regras.
- Novos ícones: pedra 1 Pin para a Calculadora de Mão e catavento para o Sorteador de Ventos.
- No teclado da montagem, o botão de Descartes virou o atalho "Han e Fu", que abre a Calculadora de Han e Fu. Descartes / Furiten continuam na finalização da mão.
- Ao abrir a Han e Fu pelo atalho, aparece uma seta de voltar no topo para retornar à Calculadora de Mão.
- Todas as janelas (Resultado, Regras de cálculo e ajuda das Doras) agora seguem um mesmo modelo, com o mesmo visual e o mesmo botão de fechar em qualquer tela.
- Teclado da montagem nos iPads/tablets em pé (Mini, Air, Pro 11) com a mesma distribuição do iPad Pro 13: botões numa linha só ocupando a largura e pedras centralizadas, com as Honras no meio.

### Corrigido

- Janela de Resultado no iPad Mini: textos como "Han / Fu", pontos por jogador e os títulos Yaku e Fu ficavam invisíveis (branco no branco).
- Pedras do resultado agora cabem numa linha só no iPad.

### Também nesta versão

- transpõe tabela rápida de Han e Fu no celular deitado
- Ajusta botoes esticados na finalização de mão.
- ajusta doras.
- Opções da finalização de mão padronizadas no celular: RIICHI e CONDIÇÕES ESPECIAIS empilham uma abaixo da outra (não mais lado a lado), incluindo iPhone Pro Max, e ambas usam grade de 2 colunas com o terceiro botão ocupando a linha inteira.
- Pedras da finalização de mão maiores no celular, deixando o rótulo "Batida" legível sem esforço (mais destaque no iPhone 16 Pro Max).
- Áreas de toque da finalização padronizadas em 48px (Tsumo/Ron, Riichi, condições, Descartes, Calcular) e contadores de Honba/Doras maiores.
- alguns ajustes ipad mini vertical
- muda as ordems dos ventos.

## 4.4.4 - 2026-07-25

### Ajustado

- Modal "Regras de cálculo" responsivo em todos os aparelhos, sem rolagem horizontal e com "Aplicar" sempre acessível.
- Cabeçalho e rodapé (Restaurar padrão / Aplicar) fixos; só a lista de regras rola e a página atrás não se mexe.
- Celulares: layout empilhado e compacto; em telas baixas (paisagem) o modal cabe sem cortar o topo e mostra ao menos 2–3 regras de uma vez.
- Tablets (iPad Pro, Surface Pro 7): textos e controles maiores, mais confortáveis de ler.
- Desktop permanece inalterado.

## 4.4.3 - 2026-07-25

### Ajustado

- Tipografia da Calculadora de Mão ampliada no iPad Pro (11", 12.9"/13"), em retrato e paisagem, ~10–20% maior para leitura confortável: selo "MÃO X/14", rótulos da navegação lateral (sidebar) e da barra inferior, botões de meld (Chi, Pon, Kan, Kan fechado), botões utilitários (Finalizar mão / Mudar pedra da batida) e textos auxiliares. Pedras, melds, teclado e ícones mantêm o tamanho.
- Rótulo do meld ("Kan aberto", "Kan fechado", "Chi", "Pon") agora legível em todos os tablets e iPads (Mini, Air e Pro), bem maior que antes — no iPad Pro fica ainda mais destacado. Telefones permanecem inalterados.
- Selo "MÃO X/14" do cabeçalho aumentado no iPad Pro.
- Ícone de lixeira (limpar mão) aumentado nos iPads/tablets, com área de toque mais confortável (antes ficava minúsculo).
- Valor da espera em tenpai (selo "3 HAN", "2Y", "SEM YAKU" sobre cada pedra candidata do teclado) aumentado nos tablets e iPads, e maior ainda no iPad Pro, onde antes era quase ilegível ao lado das pedras grandes.
- Pedras do teclado aumentadas no iPad Mini/Air (e demais tablets pequenos) em retrato, ficando mais proporcionais à mão, que já usa pedras grandes. As pedras da mão não mudam.
- Botões "Mudar pedra da batida" e "Finalizar mão" agora grandes e fáceis de tocar nos tablets/iPads em retrato — ocupam a largura toda (lado a lado), mais altos e com texto maior, no mesmo espírito do layout de celular.

### Técnico

- Alteração feita apenas em CSS, concentrada em `src/compartilhado/interface/estilos/responsivo.css` (última folha na cascata), sem tocar em componentes, lógica ou traduções. Exceção: o rótulo do meld teve seu tamanho tirado de um estilo inline no componente e movido para a classe `.rotulo-meld-chip`, com o tamanho base preservado em `melds.css`, para permitir ampliá-lo por breakpoint sem afetar telefones/desktop.
- Escopo do iPad Pro por viewport: `min-width: 834px` (retrato) e `min-width: 1194px` (paisagem) incluem só os tamanhos Pro e excluem iPad Air (820/1180) e Mini (744/1133); o guarda `any-pointer: coarse` mantém desktop e notebooks com mouse (ex.: 1366×768) de fora, casando ainda com qualquer iPad.
- Legibilidade compartilhada de tablets (rótulo do meld, selo de ação ativa e valor da espera) usa `min-width: 700px` + `min-height: 600px`, incluindo o iPad Mini de 744px e excluindo telefones (inclusive em paisagem, onde a altura fica abaixo de 600px).
- Pedras do teclado e lixeira do iPad Mini/Air ficam na faixa existente `768–1023px` retrato (mesma receita atual); as 10 pedras por linha continuam cabendo já no iPad Mini de 768px.
- Botões de finalização em retrato de tablet trocam para grade de duas colunas de largura total; a engrenagem do rodapé já fica oculta nessa faixa, então as colunas são exclusivas dos dois botões.
- Verificado no preview em larguras de iPad Mini, Air e Pro (retrato e paisagem) e em telefones, confirmando ampliação dos textos/controles, ausência de estouro e telefones/desktop inalterados.

## 4.4.2 - 2026-07-19

### Ajustado

- Ajusta tela de construção de mão para Ipad air vertical e horizontal;
- Ajusta tela de construção de mão para Ipad pro air vertical e horizontal;
- Celulares em modo retrato (largura a partir de 375px) agora usam uma barra de navegação inferior fixa (estilo app nativo), no lugar do menu sanduíche, dando acesso direto aos módulos sem abrir gaveta: Centerpiece, Calculadora de Mão, Calculadora de Han e Fu, Torneio, Sorteador de Ventos e Regras / Configurações.
- Removido o botão de menu sanduíche (e o gesto de abrir a gaveta) no topo em celulares retrato, deixando o cabeçalho mais limpo, apenas com o logo/título.
- O teclado de pedras na construção da mão passa a ficar encaixado logo acima da barra de navegação, sem ficar escondido atrás dela.
- A mesa do Centerpiece e as páginas roláveis reservam o espaço da barra inferior, garantindo que nenhum conteúdo (como o card do jogador Sul) fique escondido atrás dela.
- O botão de configuração (engrenagem) da Calculadora de Mão em celulares retrato saiu do canto do teclado e passou para a barra de ações do cabeçalho, ao lado dos demais botões, liberando largura para o teclado e deixando o mesmo posicionamento já usado em paisagem, tablets e desktop.
- Teclado de pedras em celulares retrato levemente ampliado para melhor conforto de toque: pedras um pouco maiores e mais altas, mais espaçamento entre elas e botões de ação (Chi, Pon, Kan, Kan fechado, Descartes) e engrenagem com área de toque maior. O iPhone SE, tablets, desktop e o modo paisagem permanecem inalterados.
- Celulares em modo paisagem (iPhone XR, 12 Pro, 14, 14 Pro Max e a tela de capa do Galaxy Z Fold 5) passam a usar o menu sanduíche (navegação estilo desktop) no lugar da barra inferior, que não fazia sentido na horizontal.
- O menu sanduíche em paisagem foi aproximado da borda lateral (antes ficava afastado por herdar o espaçamento de cabeçalho dos tablets).
- Galaxy Z Fold 5: a tela de capa (estreita) em modo retrato passa a usar a barra de navegação inferior, igual aos demais celulares, no lugar do menu sanduíche.
- No Galaxy Z Fold 5 (tela de capa) em retrato, o teclado de pedras passou a ficar encaixado acima da barra inferior, que antes cobria as pedras de honra.

### Técnico

- O iPhone SE (e telas equivalentes, por volta de 320px) foi mantido de propósito com o menu sanduíche e a gaveta, por causa do espaço vertical reduzido.
- Alteração feita apenas em CSS, em uma faixa dedicada de celular retrato (`min-width: 375px` e `max-width: 767px`, `orientation: portrait`); reaproveita a barra inferior que já existia para tablets, sem mexer em componentes, lógica ou traduções.
- A realocação da engrenagem foi feita apenas em CSS (`max-width: 767px` e `orientation: portrait`): reaproveita o botão do cabeçalho já renderizado e oculta o do teclado, seguindo o mesmo padrão do modo paisagem, sem alterar componentes, lógica ou traduções.
- Ampliação do teclado feita só em CSS, nos blocos de retrato já existentes (`aspect-ratio` das pedras, `gap` das fileiras e `min-height` dos botões), sem novos breakpoints e sem mexer em componentes, lógica ou traduções.
- Navegação em paisagem: reaproveita a faixa `orientation: landscape` + `max-height: 560px`, com `max-width` estendido de 920px para 950px para incluir o iPhone 14 Pro Max (932px de largura); tablets continuam de fora por terem altura de paisagem ≥768px.
- A tela de capa do Galaxy Z Fold 5 é identificada por `max-width: 374px` + `max-aspect-ratio: 1 / 2` (proporção muito alta, ~0,39), que exclui de propósito todos os iPhone SE (~0,56) — assim o SE nunca é afetado, independentemente da largura exata.
- Todas as trocas de navegação são só de CSS (os três sistemas — sanduíche, barra inferior e sidebar — já são sempre renderizados); menu sanduíche e barra inferior nunca aparecem juntos.
- Desktop, tablets, o iPhone SE e a tela desdobrada do Galaxy Z Fold 5 permanecem inalterados.

## 4.4.1 - 2026-07-04

## Ajustado

- Reformulado o layout da Calculadora de Mão em modo retrato (portrait) para tablets (iPad Mini e similares), aproximando a experiência de um app nativo: navegação por barra inferior, cartão ocupando a tela inteira e teclado de pedras compacto e legível.
- Reformulado o layout da Calculadora de Mão em modo paisagem (landscape) para tablets: o conteúdo principal agora ocupa a tela por completo, sem a moldura de fundo que aparecia ao redor do cartão.
- Removidos os rótulos de texto "MAN", "PIN", "SOU" e "HONRAS" do teclado de pedras em paisagem, usando o espaço liberado para aumentar o tamanho das pedras.
- Padronizado o tamanho das pedras de honra (Ventos e Dragões) para ficarem do mesmo tamanho das demais pedras do teclado (antes ficavam visivelmente maiores).
- Aumentado o tamanho das pedras da mão em construção e das prévias de sequência/trinca (Chi, Pon) em paisagem, para ficarem legíveis no tablet.
- Ajustada a distribuição vertical da tela em paisagem: os botões de ação (Chi, Pon, Kan aberto, Kan fechado, Descartes/Furiten) ficam colados ao teclado, e o teclado se estende até o rodapé da tela, sem espaços vazios.
- Aumentado o tamanho e o espaçamento interno do painel "Escolha o Chi" em tablets, incluindo as pedras de prévia de cada opção.
- Reposicionado o ícone de engrenagem (regras de cálculo): agora aparece ao lado do ícone de lixeira, no cabeçalho da mão, em vez de flutuar sozinho sobre o teclado.

## Corrigido

- Corrigida sobreposição do painel "Escolha o Chi" sobre os botões de ação e o teclado de pedras em paisagem.
- Corrigido espaço vazio que sobrava no topo da tela em paisagem quando o painel "Escolha o Chi" não estava em exibição.
- Corrigida inconsistência no espaçamento entre as fileiras do teclado (MAN/PIN/SOU/HONRAS), que variava conforme o painel "Escolha o Chi" estivesse visível ou não.
- Removida a linha divisória entre as fileiras de naipes no teclado em paisagem, mantendo apenas o espaçamento como separação visual.

## Técnico

- Todos os ajustes de paisagem foram feitos em uma faixa de tela dedicada (tablets e notebooks pequenos em modo horizontal), sem alterar breakpoints, componentes ou estilos usados no modo retrato.
- Testado o modo retrato após cada alteração para garantir que permanece pixel a pixel igual ao comportamento anterior.
- Nenhuma alteração nas regras de cálculo, ordem das pedras, traduções ou lógica de Mahjong.

## 4.4.0 - 2026-06-14

## Ajustado

- Ajustado o layout do teclado de pedras no modo landscape para ocupar melhor toda a largura disponível da tela.
- Corrigido o comportamento em que o teclado ficava centralizado e estreito demais no modo horizontal.
- Melhorada a distribuição horizontal das pedras no teclado, evitando que o conteúdo fique comprimido no centro.
- Integradas as ações `Chi`, `Pon`, `Kan`, `Kan fechado` e `Descartes / Furiten` ao topo do teclado no landscape.
- Alterado o visual das ações no landscape para funcionar como uma barra segmentada, seguindo o estilo da referência mobile.
- Reduzido o espaçamento visual entre a barra de ações e o teclado, deixando os dois elementos com aparência de componente único.
- Mantida a proposta mobile-first, sem criar CSS específico para modelos de celular.

## Corrigido

- Corrigida a inconsistência visual dos botões de ação no modo landscape.
- Corrigido o uso excessivo de compactação no teclado, que fazia o layout desperdiçar espaço horizontal.
- Evitado que o teclado use `fit-content` ou comportamento semelhante no landscape quando isso reduz a largura do componente.
- Preservado o layout portrait sem alterações visuais intencionais.

## Técnico

- As regras responsivas continuam baseadas em tamanho de tela, altura disponível e orientação.
- Não foram criadas regras específicas para aparelhos como iPhone SE, iPhone XR, Pixel 7 ou Galaxy.
- Não houve alteração nas regras de cálculo, ordem das pedras, traduções ou lógica de Mahjong.

## 4.3.0 - 2026-06-06

### Adicionado

- Adicionada configuração no setup do **Centerpiece** para definir como os ventos iniciais serão atribuídos.
- Agora é possível escolher entre:
  - **Aleatório**, mantendo o sorteio justo dos ventos;
  - **Ordem dos nomes**, onde o 1º jogador vira Leste, o 2º Sul, o 3º Oeste e o 4º Norte.
- Adicionada finalização reduzida da **Calculadora de Mão** quando usada dentro do Centerpiece.
- A finalização reduzida mantém opções importantes como:
  - Doras na mão;
  - Indicadores de Dora / Ura Dora;
  - Condições especiais;
  - Riichi/Ippatsu;
  - Rinshan, Chankan, Haitei/Houtei e demais opções da mão.

### Alterado

- Ajustada a integração do **Centerpiece** com a **Calculadora de Han e Fu** para enviar corretamente:
  - Ron ou Tsumo;
  - se o vencedor é Leste ou não;
  - Honba atual.
- Ajustada a integração do **Centerpiece** com a **Calculadora de Mão** para enviar corretamente:
  - tipo de vitória;
  - vento do vencedor;
  - vento da rodada;
  - Honba;
  - estado de Riichi, quando aplicável.
- A Calculadora de Mão em modo Centerpiece não exige mais que o usuário preencha novamente Ron/Tsumo, ventos e Honba.
- O botão da montagem da mão em modo Centerpiece passa a levar para uma finalização reduzida, focada apenas nas opções que ainda precisam ser informadas.
- O botão inicial do setup do Centerpiece passa a refletir melhor o modo escolhido de definição dos ventos.

### Corrigido

- Corrige o cálculo de pagamento no Centerpiece para considerar corretamente se o vencedor é **Leste** ou **não Leste**.
- Corrige o cálculo de pagamento para diferenciar corretamente **Ron** e **Tsumo**.
- Corrige pagamentos de Tsumo para aplicar:
  - pagamento igual de todos quando o vencedor é Leste;
  - pagamento maior do Leste e menor dos não Leste quando o vencedor não é Leste.
- Corrige a integração para não usar a posição visual do jogador como critério de dealer.
- Garante que o dealer seja identificado pelo vento atual do jogador, usando `vento === 'leste'`.
- Evita dupla contagem de Honba ao aplicar resultados vindos das calculadoras.
- Garante que os Riichi sticks continuem sendo aplicados apenas pelo Centerpiece, e não pelas calculadoras.
- Corrige o fluxo integrado da Calculadora de Mão para não pular Doras e condições especiais antes do cálculo.

## 4.2.0 - 2026-06-06

### Adicionado

- Adiciona sorteador de ventos totalmente aleatorio.

## 4.1.3 - 2026-06-06

### Adicionado

- Suporte às rodadas Oeste (西) e Norte (北) como Enchousen (延長戦).
- Corrigi chombo, não-Leste paga 8.000 (Leste +4k, outros +2k cada). Leste paga 12.000 (todos os outros +4k cada)Add west north rounds

### Corrigido

- Move o botão de **Gerar PDF** para abaixo da ação de **Reiniciar Torneio**, deixando o topo da Classificação Geral mais limpo no mobile.
- Mantém o tempo do **Timer Base** visível mesmo quando o painel está recolhido.
- Reforça o visual dos cards da grade de mesas, deixando-os mais encorpados, legíveis e confortáveis para toque no mobile.
- Preserva o contador superior das mesas como elemento principal de leitura rápida.
- Ajusta a navegação entre rodadas para exibir até três botões principais por vez, com rolagem lateral para as demais rodadas.
- Adiciona indicação visual de que existem mais rodadas disponíveis fora da área visível.
- Melhora a hierarquia visual da Classificação Geral, Timer Base, Diagnóstico da Grade e Grade Completa de Rodadas.
- Ajusta botões, cards e seções do Torneio Fast para respeitarem melhor a largura da tela no mobile.
- Corrige estouros horizontais no Torneio Fast em telas mobile.
- Corrige cards, botões, timer e seções da grade para não ultrapassarem a largura da tela.
- Corrige o comportamento das abas de rodada para evitar rolagem horizontal global da página.
- Corrige os timers das mesas para acompanharem o **Timer Base** da rodada ativa.
- Corrige o problema em que os timers das mesas ficavam congelados.
- Corrige o acréscimo de **+5 min mesa**, mantendo a diferença individual da mesa em relação ao Timer Base.
- Corrige o acréscimo de **+5 min global** para refletir corretamente em todas as mesas.
- Corrige o Timer Base recolhido para continuar atualizando o tempo em tela.
- Corrige o comportamento de pausa e retomada para manter Timer Base e timers das mesas sincronizados.
- Corrige o fluxo para evitar timers independentes por mesa, usando o tempo da mesa como valor derivado do Timer Base mais o acréscimo individual.

## 4.1.1 - 2026-06-04

### Melhorias

- Simplifica a seção **Descartes / Furiten** na finalização, substituindo o par de botões separados (cabeçalho + "Editar/Concluir") por um único toggle no mesmo padrão dos **Indicadores de Dora**.
- Seletor de doras com teclado de peças recolhível

### Correções

- Corrige a detecção de **Chi** para diferenciar sequências formadas por pedras livres das que usariam pedras já comprometidas na mão.

## 4.1.0 - 2026-06-02

### Melhorias

- Refaz a antiga Calculadora Rápida como **Calculadora de Han e Fu**, com identidade própria e fluxo mais claro.
- Reorganiza a tela para destacar primeiro o resultado da pontuação e depois os controles de ajuste.
- Ajusta a interface mobile para seguir o padrão visual do Riichi Manager, sem alterar as cores primárias do app.
- Adiciona controles de **Han**, **Fu** e **Honba** com botões de menos e mais.
- Coloca **Han** e **Fu** lado a lado no mobile, com **Honba** logo abaixo para reduzir rolagem.
- Melhora a área de toque dos botões de menos e mais, mantendo o visual compacto e aumentando a área clicável invisível.
- Adiciona referência rápida expansível para consulta da tabela de pontuação.
- Melhora a referência rápida no mobile para evitar depender de rolagem horizontal como forma principal de leitura.
- Adiciona bloco de limites de pontuação, incluindo **Mangan**, **Haneman**, **Baiman**, **Sanbaiman** e **Yakuman**.
- Adiciona suporte a Yakuman múltiplo de `2Y` até `6Y`.
- Ajusta o controle de Han para avançar de `13 Han` diretamente para `2Y`, evitando duplicar `13 Han` e `1Y`.
- Exibe que **Fu não é usado em Yakuman** quando a seleção estiver em `13 Han` ou Yakuman múltiplo.
- Mantém **Honba** aplicado corretamente ao resultado de Ron e Tsumo.

### Correções

- Revisa a Calculadora de Han e Fu para seguir a tabela de pontuação de Riichi Mahjong em combinações de Leste/Não leste, Ron/Tsumo, Han/Fu e limites.
- Corrige o resultado de Tsumo para mostrar pagamentos separados entre **Leste** e **Não leste** quando necessário.
- Corrige o cálculo de Honba:
  - Ron recebe `+300` por honba.
  - Tsumo recebe `+100` de cada pagador por honba.
- Corrige o fluxo de Yakuman para não passar por `1Y` após `13 Han`.
- Corrige a exibição de Fu em resultados de Yakuman, impedindo que Fu pareça influenciar o cálculo.
- Corrige o layout dos controles de Han, Fu e Honba no mobile.
- Corrige os botões de incremento e decremento para manterem visual compacto com área de toque confortável.
- Corrige a referência rápida para destacar corretamente a configuração atual.
- Corrige estilos da Calculadora de Han e Fu para não dependerem da Calculadora de Mão nem sobrescreverem cores globais do app.

## 4.0.5 - 2026-06-01

## Alterado

- Indicadores de Dora e Ura Dora agora entram na contagem física de 4 cópias por pedra.
- Teclado bloqueia indicadores indisponíveis quando a pedra já atingiu o limite físico.
- Ajustado layout da mão para evitar corte visual ao exibir 4 kans.
- Ícone de descartes/furiten trocado de lixeira para bloqueio.
- Ícones de limpeza/remover trocados de pincel para lixeira.
- Badge de espera yakuman no teclado agora usa `Y` em vez de `x`, exemplo: `3Y`.

## 4.0.4 - 2026-06-01

### Melhorias

- Mantém a mão 14/14 editável, permitindo montar todas as pedras primeiro e depois declarar **Chi**, **Pon**, **Kan aberto**, **Kan fechado** e pedra da batida.
- Adiciona botões de ação na montagem para **Mudar batida** e **Ir para finalização de mão** quando a mão estiver pronta.
- Mantém **Descartes / Furiten** na montagem para permitir análise de furiten durante a escolha das esperas.
- Adiciona **Descartes / Furiten** também na Finalização de Mão, permitindo revisar e corrigir descartes esquecidos antes do cálculo.
- Agrupa descartes repetidos em formato compacto com contador, como `2x`, `3x` ou `4x`.
- Remove o botão **Dora** da barra principal da montagem, deixando a configuração de doras concentrada na Finalização de Mão.
- Unifica **Indicadores de Dora** e **Indicadores de Ura Dora** em um único fluxo de indicadores na finalização.
- Remove a seção separada de **Ura Dora**, simplificando a tela de finalização.
- Ajusta a seção de indicadores para deixar claro que ela representa **Dora** e **Ura Dora**, com suporte visual para até 10 indicadores.
- Ajusta o contador **Doras na mão** para considerar automaticamente aka dora e doras identificadas pelos indicadores, mantendo ajuste manual quando necessário.
- Altera a configuração padrão para **Aka dora ativa**.
- Garante que a configuração de aka dora venha das regras globais da calculadora, sem botão local de ativar/desativar na finalização.
- Renomeia visualmente `K.F.` para **Kan fechado**.
- Ajusta a barra da montagem para manter **Chi**, **Pon**, **Kan**, **Kan fechado** e **Descartes**.
- Troca o botão de descarte para ícone compacto de lixeira, evitando texto grande na barra.
- Padroniza ações de limpeza geral com ícone de vassoura, diferenciando-as do descarte.
- Posiciona lixeiras vermelhas dentro dos blocos correspondentes, como **Descartes / Furiten** e **Indicadores de Dora / Ura Dora**.
- Remove textos explicativos fixos que poluíam a Finalização, como o aviso permanente de aka dora desativada.
- Ajusta o controle de Riichi para voltar a ser uma opção simples de marcado/desmarcado, removendo o botão visual separado **Sem Riichi**.
- Permite declarar **Kan aberto** a partir de uma trinca solta, adicionando a quarta pedra como chamada externa.
- Permite declarar **Kan fechado** a partir de uma trinca solta no contexto da calculadora, adicionando a quarta pedra implícita ao meld.
- Mantém diferença visual e de regra entre **Kan aberto** e **Kan fechado**:
  - Kan aberto abre a mão.
  - Kan fechado preserva a mão fechada.
- Preserva aka dora ao formar Kan, mantendo códigos como `0m`, `0p` e `0s` no meld criado.
- Mantém o modo ativo após criar um meld quando ainda houver outras ações possíveis do mesmo tipo, facilitando organizar várias chamadas em sequência.

### Correções

- Corrige o furiten na Finalização para ser recalculado a partir da mão completa menos a pedra da batida escolhida.
- Corrige o caso em que o usuário montava 14/14 manualmente e o app não conseguia reconstruir corretamente as esperas para validar furiten.
- Corrige a perda ou troca indevida da pedra da batida ao voltar para montagem e reorganizar a mão.
- Corrige o comportamento em que ações estruturais podiam ser bloqueadas indevidamente quando a mão estava 14/14.
- Corrige o comportamento em que a Finalização podia continuar disponível após alteração estrutural sem revalidar a mão.
- Corrige o fluxo para que criar **Chi**, **Pon**, **Kan aberto** ou **Kan fechado** não seja confundido com escolha da pedra da batida.
- Corrige o caso em que criar um meld podia abrir ou liberar a finalização automaticamente.
- Corrige a disponibilidade de ações estruturais em tenpai.
- Corrige a disponibilidade de ações estruturais em mão 14/14.
- Corrige o caso em que botões ficavam desabilitados mesmo quando ainda havia ações possíveis.
- Corrige a reorganização de mãos completas em melds sucessivos, recalculando a estrutura e as possibilidades restantes após cada ação.
- Corrige a formação de **Kan aberto** para seguir a mesma lógica prática de entrada direta de Chi e Pon.
- Corrige a formação de **Kan fechado** a partir de trinca solta no fluxo da calculadora.
- Corrige o caso em que **Kan fechado** com aka dora não preservava corretamente a tile vermelha.
- Corrige a renderização de **Kan fechado** com aka dora, mantendo o Kan fechado visualmente e exibindo a aka no centro.
- Corrige a lógica que podia fabricar ou perder pedras indevidamente ao criar Kan.
- Corrige a tela branca causada por estados inválidos ao tentar usar Kan fechado.
- Corrige a renderização do dragão branco em alguns contextos da Finalização e dos melds.
- Corrige o problema em que indicadores de Dora ou Ura Dora bloqueavam tiles da mão.
- Corrige a contagem automática de doras para evitar dupla contagem entre aka, indicadores e ajuste manual.
- Corrige o visual do contador de descartes na montagem, removendo o badge preto pesado.
- Corrige a invasão visual do botão de descarte sobre **Kan fechado**.
- Corrige a sobreposição em que Kan fechado podia invadir a área de descartes.
- Corrige o posicionamento dos painéis contextuais para abrirem abaixo da seção acionada.
- Corrige o comportamento para manter apenas um painel contextual aberto por vez.
- Corrige o layout das lixeiras de **Descartes / Furiten** e **Indicadores de Dora / Ura Dora**, mantendo-as dentro dos respectivos blocos.

## 4.0.3 - 2026-05-31

### Refatoração

- Separa a antiga calculadora em dois domínios independentes:
  - `calculadora-mao`, responsável pela montagem, finalização e cálculo completo da mão.
  - `calculadora-han-fu`, responsável pela pontuação direta por han/fu.
- Move funções e tipos puros de pontuação para `src/compartilhado/mahjong/pontuacao`.
- Remove a dependência da Calculadora de Han e Fu sobre hooks e componentes específicos da Calculadora de Mão.
- Atualiza a navegação global para importar cada calculadora pelo seu domínio próprio.

### Melhorias

- Altera o avanço da montagem para a Finalização de Mão: escolher uma espera agora marca a pedra da batida e mantém o usuário na montagem até clicar em **Ir para finalização de mão**.
- Adiciona o fluxo de **Mudar batida** na montagem, permitindo revisar e corrigir a pedra vencedora antes de avançar.
- Exibe candidatas à batida no teclado com badge de han, sem yaku ou furiten quando disponível.
- Permite trocar a pedra da batida diretamente na tela de finalização ao clicar em uma tile visível da mão ou dos melds.
- Mantém o lápis como único caminho para voltar à montagem e editar a estrutura da mão.
- Separa a contagem estrutural da contagem física em mãos com Kan, evitando exibições como `15/14`.

### Correções

- Corrige a indicação visual de esperas em furiten no teclado.
- Quando qualquer espera atual aparece nos descartes do próprio jogador, todas as esperas válidas passam a ser marcadas como bloqueadas por furiten para Ron.
- Esperas bloqueadas por furiten deixam de aparecer como verdes válidas para Ron e passam a usar o estado visual de furiten.
- Mantém o han potencial acessível no tooltip, mas exibe o badge **Furiten** para deixar claro que Ron está bloqueado.
- Preserva Tsumo como vitória permitida: ao escolher Tsumo, as esperas podem voltar a aparecer como válidas.

## [4.0.2] - 2026-05-27

### Corrigido

- Corrigida a exibição de **kan fechado com aka dora**.
- Adiciona botao de finalizar a mao.

## [4.0.1] - 2026-05-26

### Adicionado

- A sidebar global agora pode ser aberta deslizando da borda esquerda e fechada arrastando para a esquerda em telas touch.

## [4.0.0] - 2026-05-26

### Melhorias

- Redesenhada a Calculadora de Mão no mobile para ter sensação de tela full-screen de app, reduzindo a aparência de card centralizado dentro de página.
- Refinado o teclado de pedras no mobile com painel mais integrado, maior aproveitamento da largura, tiles maiores, mais quadradas e com espaçamento compacto.
- Transformada a barra de ações **Chi**, **Pon**, **Kan**, **K.F.**, **Desc.** e **Dora** em um controle mais unificado, com destaque principal no modo ativo.
- Removidos rótulos visuais de naipes no teclado mobile, preservando acessibilidade por textos invisíveis e aria-labels.
- Reposicionada a engrenagem de **Regras de cálculo** para ficar mais discreta e integrada ao teclado.
- Reorganizada a tela de **Finalização da mão** para reduzir containers aninhados, remover título duplicado e deixar **MÃO COMPLETA 14/14** como cabeçalho principal da seção.
- Separada a mão principal dos melds na Finalização, mantendo **Chi**, **Pon** e **Kan** organizados em coluna para melhorar leitura no mobile.
- Adicionada seção compacta de **Descartes / Furiten** na Finalização, com agrupamento por tipo de pedra e contador quando houver descartes repetidos.
- Melhorada a responsividade entre mobile e desktop, mantendo navegação lateral nos dois contextos e evitando que o desktop pareça uma tela mobile estreita.
- Adicionada indicação compacta de modo ativo também para **Descartes** e **Dora**, seguindo o mesmo padrão de feedback usado em **Chi**, **Pon** e **Kan**.

### Corrigido

- Corrigida a detecção de tenpai e esperas em mãos com melds **Chi**, **Pon**, **Kan aberto** e **Kan fechado**.
- Corrigido o fluxo em que, após formar um meld e chegar a 13 slots, o modo ativo permanecia ligado e impedia clicar corretamente na espera vencedora.
- Corrigida a finalização de mãos em que a tile vencedora completa um meld, evitando que o app fique preso na montagem.
- Corrigida a pedra vencedora errada na Finalização quando a batida acontecia dentro de um meld; agora a tile clicada é preservada explicitamente.
- Corrigido o destaque laranja para aparecer no grupo correto quando a tile vencedora completa **Chi**, **Pon** ou **Kan**, sem marcar par ou pedra solta por engano.
- Corrigido o retorno da Finalização para a montagem para desfazer corretamente o meld de batida e restaurar as pedras consumidas, sem trocar a espera anterior.
- Corrigido o cálculo e a exibição de han das esperas em mãos com melds, preservando casos com yaku válido, sem yaku e furiten.
- Corrigidos os botões de ação da Finalização (**editar**, **regras/configurações** e **limpar**) para permanecerem clicáveis e acessíveis.
- Corrigida a contagem de yakuman como yaku válido, evitando que mãos de yakuman sejam tratadas como sem yaku.
- Removida linha fina/artefato visual que aparecia abaixo de **MÃO X/14** ao ativar modos como **Chi**, **Pon** ou **Kan**.

## [3.0.1] - 2026-05-24

### Melhorias

- Adicionado fluxo progressivo nas opções da mão: primeiro **Vitória**, depois **Ventos**, depois **Riichi** e **Condições especiais**.
- O fluxo da calculadora agora termina no botão **Calcular**, exibido após a mão ficar pronta e a configuração obrigatória ser definida.
- A modal de resultado agora abre somente pelo botão **Calcular**, sem abrir automaticamente ao completar a mão.
- Reposicionado o botão **Dora** para a barra de ações da mão, logo após **Descartes**.
- **Ura dora** continua aparecendo na barra de ações apenas quando **Riichi** está ativo.
- Mantidos **Honba** e **Doras na mão** na área de configuração da vitória.
- Ajustado o layout de **Condições especiais** para exibir os botões um abaixo do outro.
- Melhorado o visual dos seletores de vento e botões de opções para evitar quebra ou aperto em telas menores.

### Corrigido

- Corrigido o destaque inicial de **Tsumo/Ron** e dos ventos para só marcar visualmente depois que o jogador escolher.
- Ajustada a validação das ações **Chi**, **Pon**, **Kan aberto** e **Kan fechado** para permitir montar chamadas pelo teclado respeitando slots e limite físico das pedras.
- Ao voltar para menos de 13 slots, o fluxo de configuração e ações de dora/uradora pendentes são resetados.

## [3.0.0] - 2026-05-24

## Correções

- Corrigida a calculadora para não calcular automaticamente ao completar 14 tiles; o cálculo agora acontece somente ao clicar em **Calcular**.
- Corrigida a disponibilidade das ações **Chi**, **Pon**, **Kan** e **Kan fechado** para respeitar combinações reais na mão fechada, inclusive em mãos fechadas completas com 14 tiles.
- Corrigido o estado visual de tiles indisponíveis, incluindo aka dora já usado na mão, melds, doras ou descartes.
- Corrigido o caso de mão sem yaku para abrir modal de alerta/chombo em vez de mostrar apenas um card inline.
- Corrigido o fechamento da modal de resultado para remover apenas a pedra de agari e preservar ventos, honba, doras, riichi, vitória e condições especiais.

## Melhorias

- Adicionado botão principal **Calcular** após as opções da mão.
- Melhorado o feedback visual para mão inválida, sem yaku e chombo.
- Ajustado o fluxo de ações para cancelar automaticamente modos como Pon/Chi/Kan quando deixam de ter opções válidas.

## [2.9.0] - 2026-05-23

### Adicionado

- Modal de resultado no mobile ao fechar uma mão válida.
- Renderização da mão vencedora dentro do modal, com a pedra de agari separada visualmente.
- Exibição de indicadores de Dora e Ura Dora no modal, incluindo pedras fechadas restantes.
- Alerta de `Chombo` ao tentar vencer por Ron em uma espera marcada como `Furiten`.
- Retorno automático para tenpai ao fechar o modal de resultado, removendo a 14ª pedra.

### Alterado

- No mobile, o resultado completo deixou de ocupar a viewport principal durante a montagem da mão.
- O modal de resultado foi redesenhado como uma ficha clara de resultado, com visual mais próximo de uma mão real de Mahjong.
- A seção de `Yaku` no modal passou a usar linhas completas, seguindo o padrão visual da seção de `Fu`.
- Ações da mão no mobile foram integradas ao teclado, reduzindo a sensação de formulário.
- Labels dos naipes foram removidos do teclado mobile, mantendo separação por fileiras.
- Botões de `Riichi` e condições especiais passaram a ficar empilhados no mobile.
- No modo rápido, o controle de `Honba` foi adicionado ao cálculo e à interface compacta.
- O modo rápido foi simplificado para manter apenas um botão flutuante de retorno ao modo completo.
- A aplicação das regras configuráveis da mesa foi revisada para manter consistência entre cálculo, valor final e label exibida.

### Corrigido

- Corrigido caso em que uma espera `Furiten` podia abrir resultado pontuado em vez de alertar `Chombo`.
- Corrigido reaparecimento indevido do modal ao alternar entre modo completo e modo rápido.
- Corrigida a exibição visual do botão de fechar do modal de resultado.
- Corrigida a indicação visual da pedra vencedora no modal.
- Corrigida a apresentação de `Aka Dora` para permanecer como yaku em vez de chip contextual separado.

## [2.8.0] - 2026-05-23

### Adicionado

- Seletores de vento da rodada e de vento do jogador em formato de pedras clicáveis, substituindo os campos de seleção tradicionais.
- Controle de Honba na seção `Doras e Honbas`, integrado ao cálculo de pontuação.
- Ajuda contextual para `Doras na mão`, com tooltip no desktop e modal leve no mobile.
- Seleção de melds diretamente pelas pedras da mão durante modos de `Chi`, `Pon`, `Kan aberto` e `Kan fechado`.
- Autocompletar inteligente de `Chi` quando há apenas uma sequência válida ou quando a escolha pode ser inferida.
- Indicação de esperas diretamente no teclado em tenpai, exibindo han, furiten ou ausência de yaku nas pedras relevantes.
- Feedback textual na área da mão para `Tenpai`, `Furiten` e `Sem yaku`.

### Alterado

- Os seletores de vento foram reposicionados para a área de configurações da mão, reduzindo confusão com as honras usadas na montagem da mão.
- O menu flutuante da calculadora foi padronizado entre modo completo e mobile.
- No modo rápido, o botão flutuante agora retorna diretamente para a calculadora completa, sem abrir menu de ações.
- A área de condições da calculadora foi compactada no mobile para reduzir rolagem.
- O bloco de resultado e esperas foi reposicionado para ficar entre a mão e as condições, aproximando o feedback principal da montagem da mão.
- Waits válidos agora usam destaque verde, enquanto `Furiten` e `Sem yaku` usam alerta vermelho por representarem situações de mão inválida ou penalidade em Ron.

### Corrigido

- Corrigido o estado `NaN` no contador de Honba.
- Corrigido o cálculo para considerar Honba sem interferir na validação da mão.
- Ajustada a comunicação visual de `Sem yaku` e `Furiten` para evitar aparência de mão válida.

## [2.7.0] - 2026-05-21

### Adicionado

- Marcação de descartes próprios na calculadora de mão.
- Detecção de furiten nas esperas da mão.
- Alerta de chombo para Ron em furiten, com destaque de -8.000 pontos.
- Menu flutuante de ações da calculadora no mobile.
- Menu compacto de ações da mão no mobile.

### Alterado

- Removido o botão e a funcionalidade de Caminhos.
- Melhorado o layout da calculadora rápida no desktop e no mobile.
- Ajustado o bloco da mão no mobile para acompanhar a rolagem.
- Reorganizadas as opções da mão por vitória, doras, riichi e condições especiais.

## [2.6.0] - 2026-05-21

### Adicionado

- Suporte a melds utilizando pedras diretamente da mão.
- Contador manual de doras para cálculo personalizado.

### Corrigido

- Correção do cálculo de dora para dragões.
- Ajustes visuais [cores] em indicadores e destaques de dora e pedras para batida.
- Correção do bloco da mão agora ele se mexe no mobile, permitindo ver e editar ao mesmo tempo que escolhe configs [riichi, ipatsu etc].

---

## [2.5.3] - 2026-05-21

### Alterado

- Indicadores de dora e uradora agora ficam com nome explicito, modo continuo de selecao e destaque rosa da pedra real correspondente no teclado.
- Acoes de `Chii`, `Pon`, `Kan aberto` e `Kan fechado` agora continuam ativas para montar chamadas em sequencia enquanto houver slots livres.
- Blocos de montagem da mao e opcoes da calculadora foram unidos em um unico card, mantendo uso amigavel no celular.
- Visual de melds e resultado ficou mais legivel: pedras separadas, fundo branco, contorno por tipo de chamada, `Kan aberto` em roxo claro, `Riichi` e pedra de agari em laranja.

### Corrigido

- Aka dora (`0m`, `0p`, `0s`) agora pode ser usado como indicador de dora/uradora e entra corretamente no limite fisico de quatro copias do cinco.
- Previa de esperas agora prioriza yakuman retornado pela biblioteca, evitando mostrar `sem yaku` ou apenas `han/fu` em esperas como `Suuankou Tanki`.

---

## [2.5.2] - 2026-05-21

### Corrigido

- Calculadora rapida agora pergunta explicitamente se o vencedor e `Leste` ou `Nao leste`.
- Campo de vitoria da calculadora rapida ficou identificado como `Tsumo`/`Ron`, alinhado ao calculo de pontos exibido.

---

## [2.5.1] - 2026-05-21

### Corrigido

- Calculadora rápida agora usa apenas `Vento da Rodada` (Leste/Sul) e remove o seletor de `Assento` dessa tela.
- Pontuação rápida passa a seguir o `Vento da Rodada` selecionado, pagando mais para o Oya (Leste).

---

## [2.5.0] - 2026-05-21

### Adicionado

- Possibilidades de caminhos de yaku na calculadora de mão, com esperas que validam a mão e orientações em PT-BR para iniciantes.

---

## [2.4.0] - 2026-05-20

### Adicionado

- Configuração de ESLint, Prettier e EditorConfig.
- Recomendações de extensões do VS Code para ESLint, Prettier, EditorConfig e TypeScript.
- Declaração `vite-env.d.ts` para imports de CSS e assets no TypeScript.

### Alterado

- Reorganizada a base para um monolito estático por domínio dentro de `src`.
- Separados os domínios `calculadora` e `torneio-fast`, cada um com `interface` como front do domínio e `logica` como back do domínio rodando no navegador.
- Fragmentado o CSS global em arquivos menores: base, layout, componentes compartilhados e estilos por domínio.
- Quebrados os arquivos grandes de interface da calculadora e do torneio fast em componentes menores por responsabilidade.
- Dividida a lógica da calculadora de mão em arquivos focados: tipos, configuração, cálculo, conversão para `riichi`, tradução, calculadora rápida e ordenação.
- Atualizado o README com o estado atual do projeto e a nova arquitetura.

---

## [2.3.2] - 2026-05-19

### Corrigido

- Corrigida a validação dos yakus para aceitar yakumans e condições especiais.

---

## [2.3.1] - 2026-05-19

### Corrigido

- Corrigido o tamanho do modal no navegador mobile.
- Incluído o desfalque de botão na contagem (`dora`/`ura dora`).
- Botão `Houtei` estava faltando.
- Mão inválida (sem yaku) mostrava `0` em vez de `"Sem yaku — mão inválida"`.

---

## [2.3.0] - 2026-05-19

### Adicionado

- Modal **Regras** na calculadora de mão com opções da biblioteca `riichi` em PT-BR.
- Controles para `aka dora`, `tanyao aberto`, `par de vento duplo`, `fu em rinshan`, `kiriage mangan`, `kazoe yakuman`, `yakuman duplo` e `yakuman acumulado`.
- Pedras de **aka dora** no teclado da calculadora usando `0m`, `0p` e `0s`, renderizadas com as imagens vermelhas do pacote de tiles.

### Alterado

- Atualizada a dependência `riichi` no `package-lock.json` para o commit atual da branch `master`.
- O padrão de cálculo do par de vento duplo agora usa `2 fu`, alinhado com regras competitivas modernas, mantendo a opção de alternar para `4 fu`.
- A calculadora rápida e a calculadora completa agora usam as regras escolhidas no modal em vez de uma configuração fixa.
- O `Haku` (dragão branco) ganhou contorno e fundo de destaque para ficar mais visível.
- Menu inicial reorganizado para exibir: calculadora, torneio fast, sistema suíço e referência de yaku.
- A calculadora de mão agora é o botão principal destacado no menu inicial.
- Reiniciar torneio agora leva direto para o cadastro de jogadores do torneio fast.
- No celular, a área de configurações da calculadora mostra um resumo fixo da mão, doras e uradoras durante a rolagem.

### Corrigido

- Ordenação e limite de quantidade das pedras agora tratam aka dora como cinco vermelho sem permitir mais de quatro pedras do mesmo valor.
- `Kan fechado` não pode mais ser adicionado quando a mão já está completa ou sem slots livres suficientes.
- O resultado da calculadora agora mostra a origem dos `fu` quando a biblioteca fornece o detalhamento.

---

## [2.2.0] - 2026-05-18

### Adicionado

- Adicionadas imagens de pedras de Riichi Mahjong a partir do projeto `fluffystuff/riichi-mahjong-tiles`.
- Renderização visual das pedras na calculadora, incluindo mão, teclado, dora, uradora e melds.
- Representação visual de chamadas abertas com uma pedra de lado para `Chi`, `Pon` e `Kan aberto`.
- Representação de `Kan fechado` com pedras externas viradas para baixo.

### Alterado

- Yaku retornados em japonês pela biblioteca de cálculo agora são exibidos em romaji, como `Pinfu`, `Tanyao`, `Toitoi`, `Ittsu`, `Chinitsu`, entre outros.
- Melhorada a validação de `Chi`, permitindo apenas sequências válidas do mesmo naipe.
- Honras, ventos e dragões agora ficam bloqueados durante a seleção de `Chi`.

---

## [2.1.0] - 2026-05-18

### Corrigido

- `Kan` — a conversão para string da biblioteca não tratava kans corretamente.
- `Vento da rodada` — agora limitado a Leste e Sul (regra correta para riichi padrão).
- Cores dos melds — `Chi`, `Pon`, `Kan aberto` e `Kan fechado` agora possuem cores distintas e label pequeno.
- `Uradora` — movida para ao lado do `Riichi`.

---

## [2.0.0] - 2026-05-10

### Adicionado

- Migração do front para `React` e do back para `TypeScript`.
- Melhoria no design com diferenciação cromática por rodada para evitar confusão visual.
- Implementação do validador de yaku e calculadora de mão.

---

## [1.0.1] - 2026-05-03

### Adicionado

- Sistema de interface com suporte a pontuação negativa e entrada apenas de números.
- Persistência de dados.
- Travamento de mesa pós-validação.

---

## [1.0.0] - 2026-05-02

### Adicionado

- **Motor de Chaveamento V5.1**: implementação de algoritmos de permutação para equilíbrio de confrontos.
- **Rotação de Ventos**: lógica de Quadrado Latino para garantir que cada jogador passe por Leste, Sul, Oeste e Norte.
- **Cálculo de Pontuação Profissional**: sistema de conversão de pontos baseado em UMA e penalidades de saldo negativo.
- **Interface Base**: layout responsivo em cartões com suporte a exportação de resultados em PDF.
