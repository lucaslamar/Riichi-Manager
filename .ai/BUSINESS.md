# Regras de negócio

Este arquivo resume contratos existentes, não todas as regras de Mahjong nem todas as variantes. Antes de alterá-los, consulte o código e a documentação específica; não deduza regras ausentes. Em caso de dúvida sobre uma regra de negócio, consulte o usuário.

## Calculadoras

- Preserve o motor de cálculo ao alterar interface ou reorganizar arquivos. A Calculadora de Mão trata tenpai, esperas, furiten, yaku, dora, honba, ventos, vitória e condições especiais conforme as regras e configurações existentes.
- Na finalização, o cálculo completo é solicitado pelo botão Calcular; mudar uma opção não deve recalcular automaticamente o resultado final.
- Fechar o resultado preserva a mão finalizada e suas opções. Voltar à montagem retira a pedra vencedora e preserva as configurações reaproveitáveis; quando a batida pertence a um meld, a operação também precisa restaurar a estrutura correspondente.
- A Calculadora de Han e Fu realiza pontuação direta e não depende da montagem, das esperas ou do estado da Calculadora de Mão.

Para detalhes, consulte [regras de negócio](../docs/regras-de-negocio.md) e [fluxo da calculadora](../docs/calculadora-fluxo.md), mas confira o código: esses documentos contêm caminhos antigos e simplificam o retorno à montagem. Pontos de entrada: `src/dominios/calculadora-mao/interface/hooks/useCalculadoraMao/useCalculadoraMao.ts` e `src/dominios/calculadora-mao/logica`.

## Mesa, jogadores e torneios

- Yonma usa quatro jogadores; Sanma usa três e possui regras configuráveis, incluindo pagamento de tsumo e noten. Registros antigos sem variante são Yonma. Partidas e torneios Sanma guardam as regras escolhidas na criação; mudanças posteriores nos ajustes não devem alterar esses registros. Consulte `src/compartilhado/mahjong/variante` e `src/dominios/centerpiece/logica/partida.ts`.
- Partidas de torneio são vinculadas ao torneio e constituem a fonte dos resultados usados nas classificações. Encontros de clube agrupam partidas originadas de um sorteio; não são torneios. Consulte `src/dominios/torneio/logica` e `src/dominios/centerpiece/logica/encontroClube.ts`.
- Preserve as configurações de mesa, variantes e yakus locais existentes. Consulte a lógica e os testes da área antes de mudar regras ou dados persistidos.

## Torneio: formatos, sorteio e ranking

### Formatos

- Rodízio: grade inteira sorteada no início, cada jogador é Leste uma vez. Indicado para encontro com hora para acabar e para iniciantes.
- Suíço: rodada 1 sorteada, depois as mesas seguem a classificação. Indicado para torneio competitivo de um dia.
- Eliminatório: classificatória e cortes até a mesa final. Indicado para evento com final e muitos jogadores.
- Brasileirão (`corridos`, o padrão): cada rodada é sorteada na hora, sem número de rodadas. O organizador encerra.
- Temporada: como o Brasileirão, com cada encontro somando num ranking acumulado.
- O Torneio é sempre de 4: mesas fecham com 8, 12, 16… jogadores. O código de mesas de 3 (sorteio, mínimos) continua, mas nenhuma tela cria torneio de Sanma. Confirmado pelo usuário em 22/11/2026: não religar nem tratar como bug, e o "Jogar Sanma quando falta um" do brief fica descartado.
- Ventos: no Rodízio o padrão é o app sortear. Nos outros, saem na mesa, então o app não sabe quem foi Leste.

### Sorteio

- É "aleatório mitigado": embaralha, testa várias combinações e fica com a de menor custo. As regras são comparadas em ordem, nunca somadas com pesos: ventos (Leste de novo antes dos outros) > dupla pela 3ª vez > trio repetido > repetições espalhadas entre as pessoas (soma dos quadrados) > total de duplas repetidas.
- Ventos na mesa: não entram no custo nem na nota, e a estatística não mostra ventos.
- Suíço e cortes: a ordem é a classificação, com trocas entre vizinhos pelas mesmas regras.
- 16 jogadores em mesas de 4 fecham 5 rodadas sem repetir, e 9 em mesas de 3 fecham 4: o sorteio por rodada só aceita rodadas que ainda deixam fechar (lista fixa).
- Mínimo de duplas repetidas em 2, 3 e 4 rodadas, provado por busca exaustiva: 8 jogadores = 4, 12, 24. 12 jogadores = 3, 9, 18. Sanma de 6 = 2, 6, 12. Com 12 e 3 rodadas, ninguém precisa repetir mais de 2 adversários.
- Rodadas ideais: 12 jogadores até 3 (a 4ª só se todos precisarem ser Leste uma vez), 8 repete sempre a partir da 2ª, 16 até 5 sem repetir.
- Nota: perfeita (sem repetição), ótima (no mínimo), boa (até 20% acima), regular (acima), ruim (dupla 3x, trio evitável ou Leste desequilibrado). No Eliminatório, vale só para a classificatória. Com uma mesa só não há nota.
- Sortear de novo: antes da primeira partida do torneio, em qualquer formato. Depois, só a última rodada do Brasileirão e da Temporada, sem mesa iniciada: a grade do Rodízio sai inteira, e o Suíço e os cortes saem da classificação (refazer devolve as mesmas mesas). O sorteio anterior fica só em memória, para voltar.

### Clube

- Novo sorteio no mesmo dia (data local) é uma nova rodada do mesmo grupo, com o mesmo sorteio mitigado. O 1º do dia é aleatório puro.
- Só contam sorteios com mesa iniciada ou registrada, e só entre quem está na lista agora. Sorteio refeito antes de jogar não conta.
- Convidado é reconhecido pelo nome sem acento e sem maiúscula, também se for cadastrado no meio do dia.
- "Começar do zero" marca os sorteios de hoje com `foraDoDia`: deixam de contar, sem sair do histórico.
- O clube continua só de 4 pessoas por mesa (Sanma no clube ainda não existe).

### Ranking do torneio

- Mudança de posição: compara o ranking atual com o do fim da rodada anterior à última com resultado, e só com todas as rodadas até ela fechadas. Com mesa faltando não há seta, porque quem ainda não jogou pareceria cair.
- A rodada 1 não mostra seta. Empate segue 1, 2, 2, 4. Quem não tinha jogado aparece como estreia.
- Eliminatório: compara dentro da fase. Cortado não tem seta, e a primeira rodada depois de zerar os pontos também não.
- A confirmação do resultado mostra o ranking do torneio antes e depois, inclusive ao corrigir.
- Encerrar: só torneio em andamento e não transferido (`podeEncerrar`).

### Distância para o pódio

- Diferença em pontos do ranking, com 1 casa. Mãos: diferença × 1000 ÷ ron fora do Leste (Mangan 8000, Haneman 12000, Baiman 16000, Yakuman 32000), para cima, sem contar uma. Arredonde antes de subir: 16,0 são 2 Mangans, não 3.
- MCR: vitórias de mesa = diferença ÷ 4, para cima (confirmado em 22/11/2026). Com pontos de mesa empatados, mostra a diferença do desempate.
- Diferença 0 é "Empatado". Quem não jogou não entra. No Eliminatório, compara só na mesma fase, e a Disputa mostra a fase de cima.
- Quem está no pódio vê a vantagem até o 4º. Os vizinhos não repetem o que o pódio já mostra.
- Candidatos ao 1º: metade de cima, de 4 a 8. "Ainda alcança": diferença ≤ rodadas que faltam para ele × melhor resultado de uma rodada do torneio. É estimativa, sem marca em formato sem número de rodadas, torneio encerrado ou Eliminatório antes de zerar os pontos.
- "Até a rodada" refaz ranking, setas e estimativa como estavam no fim daquela rodada.

### Inscrição e premiação

- Desligada por padrão, em todos os formatos e modos. Padrões: 100, 5 parcelas, clube 25%, divisão automática, mínimo 16.
- Automática: 50/30/20 até 19 jogadores (também abaixo de 16, com aviso do mínimo), 45/27/18/10 de 20 a 27, 40/25/17/11/7 com 28 ou mais.
- Antecipada: o organizador informa só quantos pagaram o valor menor. O app não controla pagamento por pessoa.
- Cada prêmio desce para múltiplo de 5 e a sobra vai para o clube. A personalizada precisa somar 100%.
- Empate divide a soma das posições ocupadas. Quem não jogou, ou está abaixo do mínimo de partidas da Temporada, não recebe.
- Na Temporada a premiação é dela, não do encontro, e conta quem esteve em algum encontro.
- A moeda é a do idioma ao ligar e fica guardada.

### WO e atraso

- Aprovado em 22/11/2026, só no Riichi de 4: −30,0 para cada ausente e +10,0 para cada presente. Com 2 ou mais ausentes a mesa não fecha em zero, de propósito.
- Atraso: −1,0 por minuto até 10 minutos, sem mudar a colocação. Passou disso é WO.
- Os valores mudam por torneio, na aba Pontuação. O encontro novo herda os da Temporada.
- WO soma pontos e conta como partida no torneio (e no mínimo da Temporada), mas não entra na média de colocação, na melhor rodada do "Ainda alcança", no histórico nem no Ranking geral.
- O desconto de atraso faz parte do resultado da partida, então vale também no Ranking geral.
- Remontar: com outra mesa em WO na rodada, os presentes dela completam a mesa atual e os ausentes vão para ela.
- Faltar ao encontro inteiro não é WO: a pessoa só não entra na lista do dia.

### Nomes e compartilhamento

- Quem sai do cadastro mantém o nome no torneio (`Torneio.nomes`, depois o guardado na partida). Sem registro nenhum, "Jogador N" pela posição na lista, nunca "?".
- O resultado da mesa mostra os pontos que ficaram na mesa e o resultado com uma.
- Imagens e textos da rodada, do ranking e da disputa dizem o tipo do torneio. A imagem leva o QR do app (desligável em Ajustes) e o texto termina com o link. O QR leva à página inicial, porque o torneio só existe no aparelho do organizador.

### Registro de pontos

- A folha de pontos aceita teclado físico (dígitos, `-`, `+`, Backspace, Enter, Esc) com as mesmas regras das teclas. O teclado do sistema só abre ao tocar no visor, e usa `PROPS_TECLADO_COM_SINAL`, porque `numeric` não tem o menos no Samsung.
- Digitar continua o valor que está no visor. Não apaga o anterior.

## Privacidade e acessibilidade

Na checagem de furiten da mesa, as esperas são informação privada do jogador. Não as anuncie automaticamente ou exponha à mesa. O modo falado ainda não está implementado; suas possíveis funcionalidades não são regras atuais. Consulte [acessibilidade](../docs/acessibilidade.md).

## Modo Chinês (MCR / Guobiao)

- O modo Japonês é o padrão e a referência. Nada nele muda com o modo Chinês.
- O motor de fan é um porte em TypeScript do GB-Mahjong (Zheng Fan, MIT). O pacote `gb-mahjong-js` foi recusado porque conta os fan chamando um binário C++ pelo Node e não roda no navegador. O porte é conferido com os 130 casos do gb-mahjong-js em `npm run test:fan-mcr`. Ao mexer no motor, preserve a equivalência com o original, incluindo as regras de exclusão.
- Regras adotadas: mínimo de 8 fan sem contar as flores. Cada flor vale 1 fan e soma no total e no pagamento. O pagamento usa F = fan total com flores. No ron, quem descartou paga F + 8 e os outros dois pagam 8. No tsumo, os três pagam F + 8. Não há bônus do dealer, honba nem limite. Mão abaixo do mínimo não mostra pagamento. O MCR não tem furiten, Riichi, Ippatsu, dora nem fu.
- A pedra da batida é a última da mão. As condições "última pedra" e "kan" mudam de nome conforme ron ou tsumo: Última pedra da parede ou Último descarte, e Batida com reposição do Kan ou Roubar o Kan. As combinações que o GB-Mahjong recusa ficam bloqueadas em `validarMao`.
- Trocar de modo limpa a mão da calculadora chinesa e pede confirmação só se ela tiver pedras. A mão da calculadora japonesa fica guardada na memória enquanto o modo Chinês está ativo.

### Guia de Bolso, Tutorial e Placar

- Conteúdo do MCR: "Guia do Mahjong Chinês (MCR) para quem já sabe jogar Riichi Mahjong", do Cerrado Mahjong Club, de Juliana Visoni e Gabriel Souza. Os créditos aparecem no Guia de Bolso e no Tutorial. No modo Chinês, os nomes em português dos fan são os do CMC. O PDF de referência deve ficar em `.ai/referencias/GUIA_DO_MAHJONG_CHINES_CMC.pdf`, mas ainda não foi enviado.
- O guia do CMC numerava Duas Quadras Ocultas (双暗杠) como fan 48, com 8 pontos. Por decisão do usuário (19/11/2026), vale a lista oficial do MCR: é o fan 53 e vale 6, e Todas Trincas a Mão Completamente Exposta são os fan 48 a 52. `fans-mcr.ts` segue essa numeração, e o `test:fan-mcr` confere os 81 fan contra o motor por número, 汉字 e pontos.
- As diferenças para o Riichi (em vermelho no PDF) aparecem com o selo "Diferente do Riichi", usando o token `--texto-aviso`.
- Falso Hu no MCR (decidido com o usuário em 21/11/2026, regra da EMA): quem errou paga 10 pontos a cada um dos outros três (−30 e +10 cada). A mão continua e o dealer não muda. Fica em `PlacarMcr.falsosHu` e entra em `totais`.
- Placar MCR: anota vitória (vencedor, ron ou tsumo, quem descartou, fan com as flores) ou empate. A mão precisa de 8 fan ou mais. O placar não confere as flores, então o aviso pede que o mínimo seja contado sem elas. Uma partida tem 16 mãos: o dealer passa a cada mão e o vento da rodada muda a cada 4 mãos. As cadeiras não trocam de lugar entre as rodadas no placar. O timer da vez tem 30 segundos por padrão e pode ser desligado.

- Flores no MCR: cada flor ou estação vale 1 fan, sem função própria nem relação com o assento. Na calculadora, entram na finalização da mão, num contador de 0 a 8. Flores não contam para o mínimo de 8.
- Ranking no MCR: soma os pontos MCR dos placares finalizados. Colocação pelo total da partida, com empate dividindo a posição.

- Glossário MCR (`aprender-a-jogar/conteudo/mcr/glossario.ts`): o do guia do CMC, no livro e na aba Glossário do Guia de bolso, com o selo "Diferente do Riichi" no que muda (dealer, Chow com kuikae, Kong oculto, flores, espera sem furiten). Os créditos do CMC saíram da tela: o uso foi autorizado sem crédito.
- Voz do resultado MCR: "Hu!" no ron e "Zimo!" no tsumo, em chinês, depois os fan, o total e os pagamentos. Mão inválida: só o aviso, sem chamada.

- Torneio MCR (decidido com o usuário em 20/11/2026, regra da EMA, e trocado pelo Torneio do Riichi em 21/11/2026): os mesmos formatos, sorteio, timers e ranking do Riichi. Cada mesa dá pontos de mesa 4, 2, 1 e 0 pela colocação. Empatados dividem igualmente os pontos das colocações que ocupam juntos (dois em 1º ficam com 3 cada). A classificação soma os pontos de mesa e desempata pela soma dos pontos das partidas. A regra veio de memória: vale conferir com o regulamento da EMA.

### Decisões em aberto

- Mudar o nome do app inteiro para Mahjong Manager (repositório, endereço, manifesto e ícones).
- Traduções do modo Chinês: es, ja, ko e lt estão em inglês e o zh-Hans só tem os nomes dos fan. Veja `src/compartilhado/i18n/REVISAR.md`.
