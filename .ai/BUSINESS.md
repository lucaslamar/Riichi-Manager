# Regras de negócio

Este arquivo resume contratos existentes, não todas as regras de Mahjong nem todas as variantes. Antes de alterá-los, consulte o código e a documentação específica; não deduza regras ausentes. Em caso de dúvida sobre uma regra de negócio, consulte o usuário.

## Calculadoras

- Preserve o motor de cálculo ao alterar interface ou reorganizar arquivos. A Calculadora de Mão trata tenpai, esperas, furiten, yaku, dora, honba, ventos, vitória e condições especiais conforme as regras e configurações existentes.
- Na finalização, o cálculo completo é solicitado pelo botão Calcular; mudar uma opção não deve recalcular automaticamente o resultado final.
- Fechar o resultado preserva a mão finalizada e suas opções. Voltar à montagem retira a pedra vencedora e preserva as configurações reaproveitáveis; quando a batida pertence a um meld, a operação também precisa restaurar a estrutura correspondente.
- Dora Eclipse (regra de cálculo, desligado por padrão, pedido do usuário em 23/11/2026): cada dora e Ura-dora de indicador vale +2 han, e cada pedra da mão igual a um indicador é uma Sombra (−1 han), a do ura só com riichi. Aka dora segue +1. Dora e Sombra não são Yaku, e depois da Sombra a mão nunca fica abaixo de 1 han. O resultado mostra "Sombra −N han" numa linha à parte. Na Nova partida, ligar o Eclipse põe a pontuação inicial em 50.000 (editável), e desligar volta ao valor de antes. Os 3 indicadores iniciais (máximo 5 com kans) são regra da mesa: a calculadora conta os indicadores que forem marcados, sem exigir 3.
- Chiitoitsu com quatro iguais (regra de cálculo, desligada por padrão, pedido do usuário em 23/11/2026): na mão fechada, quatro pedras iguais contam como dois pares. A biblioteca `riichi` recusa essa forma, então `logica/chiitoitsuQuatroIguais.ts` conta os Yaku possíveis num Chiitoitsu (Riichi, Ippatsu, Tsumo, Haitei/Houtei, Tan'yao, Honroutou, Honitsu, Chinitsu e Tsuuiisou), com 25 fu. Dora, Ura-dora, Sombra e honba seguem o cálculo padrão.
- Aniversário do Cerrado (yakuman local, pedido do usuário em 23/11/2026): o único yaku local ligado por padrão, como easter egg do clube. Mão fechada com 14 pedras exatas: trincas de 白, 西 e 中, mais 11 num naipe e 223 em outro, sempre em dois naipes diferentes (11 = os 1 de 10/10, 223 = 2, 2 e 3 de 2023, 白 = os três zeros). Vale por tsumo ou ron, com qualquer pedra da batida, e não segue a forma 4 grupos + par. Não soma com Yaku comuns nem dora, e só soma com Tenhou e Chiihou quando o Yakuman acumulado está ligado. Os ligados por padrão ficam em `YAKUS_LOCAIS_LIGADOS_POR_PADRAO` (`useYakusLocais`), e quem desliga fica em `desligados`, então quem já tinha a config salva também recebe o yaku ligado.
- Restaurar padrão nas Regras de cálculo (pedido do usuário em 25/11/2026): também volta os Yakus locais ao padrão, com só os de `YAKUS_LOCAIS_LIGADOS_POR_PADRAO` ligados e as opções do Paarenchan e do Renhou no padrão. Na aba Sanma, continua voltando só as regras do Sanma.
- A Calculadora de Han e Fu realiza pontuação direta e não depende da montagem, das esperas ou do estado da Calculadora de Mão.

Para detalhes, consulte [regras de negócio](../docs/regras-de-negocio.md) e [fluxo da calculadora](../docs/calculadora-fluxo.md), mas confira o código: esses documentos contêm caminhos antigos e simplificam o retorno à montagem. Pontos de entrada: `src/dominios/calculadora-mao/interface/hooks/useCalculadoraMao/useCalculadoraMao.ts` e `src/dominios/calculadora-mao/logica`.

## Mesa, jogadores e torneios

- Yonma usa quatro jogadores; Sanma usa três e possui regras configuráveis, incluindo pagamento de tsumo e noten. Registros antigos sem variante são Yonma. Partidas e torneios Sanma guardam as regras escolhidas na criação; mudanças posteriores nos ajustes não devem alterar esses registros. Consulte `src/compartilhado/mahjong/variante` e `src/dominios/centerpiece/logica/partida.ts`.
- Partidas de torneio são vinculadas ao torneio e constituem a fonte dos resultados usados nas classificações. Encontros de clube agrupam partidas originadas de um sorteio; não são torneios. Consulte `src/dominios/torneio/logica` e `src/dominios/centerpiece/logica/encontroClube.ts`.
- Preserve as configurações de mesa, variantes e yakus locais existentes. Consulte a lógica e os testes da área antes de mudar regras ou dados persistidos.

## Torneio: formatos, sorteio e ranking

### Formatos

- All Leste: grade inteira sorteada no início, cada jogador é Leste uma vez. Indicado para encontro com hora para acabar e para iniciantes.
- Suíço: rodada 1 sorteada, depois as mesas seguem a classificação. Indicado para torneio competitivo de um dia.
- Eliminatório: classificatória e cortes até a mesa final. Indicado para evento com final e muitos jogadores.
- Pontos corridos rápido (`corridos`, o padrão): cada rodada é sorteada na hora, sem número de rodadas. O organizador encerra.
- Brasileirão: como o Pontos corridos rápido, com cada encontro somando num ranking acumulado.
- O Torneio é sempre de 4: mesas fecham com 8, 12, 16… jogadores. O código de mesas de 3 (sorteio, mínimos) continua, mas nenhuma tela cria torneio de Sanma. Confirmado pelo usuário em 22/11/2026: não religar nem tratar como bug, e o "Jogar Sanma quando falta um" do brief fica descartado.
- Ventos: o All Leste (e a classificatória All Leste do Eliminatório) é só com ventos sorteados pelo app, sem escolha. Nos outros, o padrão é sair na mesa, então o app não sabe quem foi Leste. Torneio já sorteado segue como começou.
- All Leste tem 4 rodadas travadas, também como classificatória do Eliminatório, para todos serem Leste uma vez. Vale em todo sorteio do zero. O que já foi sorteado segue como está.
- Nomes de 22/11/2026: os ids não mudaram. `rodizio` = All Leste, `corridos` = Pontos corridos rápido ("Rápido" nos selos), `temporada` = Brasileirão. No código, "Temporada" é o Brasileirão.

### Sorteio

- É "aleatório mitigado": embaralha, testa várias combinações e fica com a de menor custo. As regras são comparadas em ordem, nunca somadas com pesos: ventos (Leste de novo antes dos outros) > dupla pela 3ª vez > trio repetido > repetições espalhadas entre as pessoas (soma dos quadrados) > total de duplas repetidas.
- Ventos na mesa: não entram no custo nem na nota, e a estatística não mostra ventos.
- Suíço e cortes: a ordem é a classificação, com trocas entre vizinhos pelas mesmas regras.
- 16 jogadores em mesas de 4 fecham 5 rodadas sem repetir, e 9 em mesas de 3 fecham 4: o sorteio por rodada só aceita rodadas que ainda deixam fechar (lista fixa).
- Mínimo de duplas repetidas em 2, 3 e 4 rodadas, provado por busca exaustiva: 8 jogadores = 4, 12, 24. 12 jogadores = 3, 9, 18. Sanma de 6 = 2, 6, 12. Com 12 e 3 rodadas, ninguém precisa repetir mais de 2 adversários.
- Rodadas ideais: 12 jogadores até 3 (a 4ª só se todos precisarem ser Leste uma vez), 8 repete sempre a partir da 2ª, 16 até 5 sem repetir.
- Nota: perfeita (sem repetição), ótima (no mínimo), boa (até 20% acima), regular (acima), ruim (dupla 3x, trio evitável ou Leste desequilibrado). No Eliminatório, vale só para a classificatória. Com uma mesa só não há nota.
- Sortear de novo: antes da primeira partida do torneio, em qualquer formato. Depois, só a última rodada do Pontos corridos rápido e do Brasileirão, sem mesa iniciada: a grade do All Leste sai inteira, e o Suíço e os cortes saem da classificação (refazer devolve as mesmas mesas). O sorteio anterior fica só em memória, para voltar.

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

- Diferença em pontos do ranking, com 1 casa. Mãos da linha resumida: diferença × 1000 ÷ ron fora do Leste (Mangan 8000, Haneman 12000, Baiman 16000, Yakuman 32000), para cima, sem contar uma. Arredonde antes de subir: 16,0 são 2 Mangans, não 3.
- MCR: vitórias de mesa = diferença ÷ 4, para cima (confirmado em 22/11/2026). Com pontos de mesa empatados, mostra a diferença do desempate.
- Diferença 0 é "Empatado". Quem não jogou não entra. No Eliminatório, compara só na mesma fase, e a Disputa mostra a fase de cima.
- Quem está no pódio vê a vantagem até o 4º. Os vizinhos não repetem o que o pódio já mostra.
- Candidatos ao 1º: metade de cima, de 4 a 8. "Ainda alcança": diferença ≤ rodadas que faltam para ele × melhor resultado de uma rodada do torneio. É estimativa, sem marca em formato sem número de rodadas, torneio encerrado ou Eliminatório antes de zerar os pontos.
- "Até a rodada" refaz ranking, setas e estimativa como estavam no fim daquela rodada.

### Cenários de virada (pedido do usuário em 22/11/2026)

- Quem persegue é sempre quem está atrás, também na linha "Vantagem sobre". Só no Riichi e com diferença maior que zero.
- Por ron de terceiros: a conta da distância. Por ron direto no líder cada ponto conta em dobro (Mangan = 16,0). Como na distância, cobrir é chegar a pelo menos o mesmo total.
- Líder no próximo jogo: em 4º, no zero ou em 1º. O valor do 4º e do 1º é o de quem termina com os pontos de partida: uma + (partida − retorno) ÷ 1000, e a oka para o 1º. Nunca número fixo.
- Diferença aparece também em pontos de mesa (7,2 = 7.200, pedido do usuário em 22/11/2026), sem contar uma. Por jogo sobe para o décimo de cima: 14,5 em 2 jogos são 7,3.
- Com uma: o perseguidor em 1º, 2º ou 3º, com o líder no zero, pela mesma conta.
- Suposição a confirmar: uma flutuante usa a linha de 2 acima do retorno, porque a linha real só se sabe no fim da mesa.
- Ficam de fora tsumo e mão de oya, e o rodapé diz isso.
- Jogos que faltam: rodadas do formato menos as jogadas. Cortado e torneio encerrado têm 0 (a diferença é final). Com pontos zerados no corte, conta só até o fim da fase. "Até a rodada" volta no tempo.
- Fim por data (Brasileirão, ou Ranking geral com período personalizado com data final): estima os jogos pelo ritmo de cada um, a partir de 7 dias e 3 jogos. Este mês e Este ano não contam como fim.
- Brasileirão por média ou melhores N: só a distância, sem cenários, porque mãos não viram pontos um para um.
- Ranking geral sem fim: distância para quem está logo acima em pontos, com as mãos sem média (terceiros e direto, só no Riichi) e a projeção pela média. As mãos aparecem mesmo quando não dá para projetar. Passar é ficar acima, então na divisão exata é o jogo seguinte. Não projeta com menos de 3 jogos de qualquer um, média menor ou igual, ou mais de 100 jogos (suposições a confirmar).

### Como costuma terminar e chance de virar (pedido do usuário em 22/11/2026)

- Em torneio ninguém lança mão. As estatísticas e a projeção saem só do resultado das mesas.
- Base de cada jogador: as rodadas do torneio (ou do Brasileirão) mais as outras mesas finalizadas dele, de 4, sem repetir. Fora: WO de quem não apareceu e a mesa em que ele mesmo saiu por W.O. "Até a rodada" não usa mesa que terminou depois. No geral valem os filtros.
- Dessa base valem só as 20 mesas mais recentes de cada um, pela data (decidido com o usuário em 22/11/2026). O corte vem depois de tirar o que fica fora, então um W.O. não gasta vaga.
- Cada mesa entra pelo saldo (final − partida) e pela colocação, com a uma das regras atuais. Assim 25.000 e 30.000 se misturam sem distorcer.
- Costuma terminar com: pontos de partida atuais + saldo médio, em centenas. Por jogo: média de saldo + uma, retorno e oka da colocação.
- Se terminarem assim: os dois jogam o que falta para cada um (sem fim conhecido, 1 jogo). O que sobra da diferença vira Mangans e diretos.
- Chance de virar: curva normal com a média e a variação de cada um, jogos independentes. Só com 3 mesas ou mais de cada um que ainda joga. Empatar não é virar. Nunca mostra 0% nem 100%.
- É estimativa: não considera adversários nem se os dois caem na mesma mesa.
- Só no Riichi: no Chinês os pontos de mesa do torneio não se misturam com os das partidas.
- A diferença só é final quando nenhum dos dois joga mais.

### Estatísticas do jogador (pedido do usuário em 22/11/2026)

- Os mesmos números nos escopos torneio, temporada e geral. O geral segue os filtros do Ranking.
- Taxas de vitória, deal-in e riichi: vezes ÷ mãos jogadas (ron, tsumo, ryukyoku e abortivo, sem chombo). Só entram partidas com mão a mão. Sem elas o campo nem aparece, nem a maior mão.
- Mesa de torneio e de clube e partida registrada à mão não têm mãos no Riichi, e o app não pede. Quando só parte dos jogos tem mãos, a tela diz quantos entraram na conta.
- Maior mão: valor até o Mangan, depois patamar e múltiplos de Yakuman. Empate fica com a primeira. No Chinês, os fan.
- Média de pontos: pontos do ranking por jogo. O WO de quem não apareceu fica fora das estatísticas. Partida com W.O. entra, com opção de tirar.

### Inscrição e premiação

- Desligada por padrão, em todos os formatos e modos. Padrões: 100, 5 parcelas, clube 25%, divisão automática, mínimo 16.
- Automática: 50/30/20 até 19 jogadores (também abaixo de 16, com aviso do mínimo), 45/27/18/10 de 20 a 27, 40/25/17/11/7 com 28 ou mais.
- Antecipada: o organizador informa só quantos pagaram o valor menor. O app não controla pagamento por pessoa.
- Cada prêmio desce para múltiplo de 5 e a sobra vai para o clube. A personalizada precisa somar 100%.
- Empate divide a soma das posições ocupadas. Quem não jogou, ou está abaixo do mínimo de partidas do Brasileirão, não recebe.
- No Brasileirão a premiação é dele, não do encontro, e conta quem esteve em algum encontro.
- A moeda é a do idioma ao ligar e fica guardada.

### WO e atraso

- Aprovado em 22/11/2026, só no Riichi de 4: −30,0 para cada ausente e +10,0 para cada presente. Com 2 ou mais ausentes a mesa não fecha em zero, de propósito.
- Atraso: −1,0 por minuto até 10 minutos, sem mudar a colocação. Passou disso é WO.
- Os valores mudam por torneio, na aba Pontuação. O encontro novo herda os do Brasileirão.
- WO soma pontos e conta como partida no torneio (e no mínimo do Brasileirão), mas não entra na média de colocação, na melhor rodada do "Ainda alcança", no histórico nem no Ranking geral.
- O desconto de atraso faz parte do resultado da partida, então vale também no Ranking geral.
- Remontar: com outra mesa em WO na rodada, os presentes dela completam a mesa atual e os ausentes vão para ela.
- Faltar ao encontro inteiro não é WO: a pessoa só não entra na lista do dia.

### W.O. no meio da partida (pedido do usuário em 22/11/2026)

- É quem saiu durante o jogo. Não é o WO de quem não apareceu (acima): a partida foi jogada, entra no histórico e nos rankings e fica marcada "Com W.O.".
- Padrão: fica em 4º com os pontos que tinha na saída, sem penalidade. Editável nas regras do torneio e nas do Registrar partida finalizada, e copiado para cada partida.
- Penalidade em pontos do ranking, depois da uma, dentro de `multa`.
- Os pontos da saída são obrigatórios: vazio não vira zero.
- Forçado em 4º, a uma, a oka e os sticks que sobram seguem a colocação nova. A uma flutuante continua contando os acima do retorno pelos pontos reais.
- Suposição a confirmar: dois ou mais W.O. ocupam os últimos lugares, ordenados pelos pontos entre si.
- Com W.O. a soma não precisa fechar. Só no Riichi de 4: o Chinês não tem valores definidos.

### Negativado: tobi (pedido do usuário em 22/11/2026)

- Há mesa em que a partida não acaba quando alguém fica negativado. A escolha (Acaba ou Continua) fica no Registrar partida finalizada, no clube e no torneio, e é copiada para cada partida.
- O padrão é o do preset: Clube acaba, EMA e WRC continuam. Mudar vira Personalizado. Torneio já criado segue com o que tinha salvo.
- Pontos negativos sempre podem ser registrados, com as duas regras. Salvar para continuar com negativado e tobi ligado avisa, sem impedir.
- O "% tobi" do Ranking e o "mandou pro tobi" contam todo final abaixo de zero, com as duas regras (confirmado pelo usuário em 22/11/2026: não filtrar por tobi nem tratar como bug).

### Partida em andamento (pedido do usuário em 22/11/2026)

- Salvar para continuar existe no registro avulso e no do clube do Riichi. Guarda rodada, honba, dealer, pontos, sticks, jogadores e assentos, W.O., regras inteiras e data e hora.
- Retomar abre tudo como foi salvo, mesmo que o preset tenha mudado. Registrar apaga a salva.
- Os sticks salvos fecham a soma se os pontos ainda faltam exatamente esse valor, e aí seguem a regra de palitos que sobram.
- Não entra no histórico nem no ranking até registrar. Vai no backup.

### Nomes e compartilhamento

- Fim do tempo no torneio (decidido com o usuário em 22/11/2026): o app só avisa que as partidas terminam na mão atual. Não encerra partida sozinho, quem registra o resultado é o usuário.
- Quem sai do cadastro mantém o nome no torneio (`Torneio.nomes`, depois o guardado na partida). Sem registro nenhum, "Jogador N" pela posição na lista, nunca "?".
- O resultado da mesa mostra os pontos que ficaram na mesa e o resultado com uma.
- Imagens e textos da rodada, do ranking e da disputa dizem o tipo do torneio. A imagem leva o QR do app (desligável em Ajustes) e o texto termina com o link. O QR leva à página inicial, porque o torneio só existe no aparelho do organizador.

### Registro de pontos

- A folha de pontos aceita teclado físico (dígitos, `-`, `+`, Backspace, Enter, Esc) com as mesmas regras das teclas. O teclado do sistema só abre ao tocar no visor, e usa `PROPS_TECLADO_COM_SINAL`, porque `numeric` não tem o menos no Samsung.
- O primeiro dígito troca o valor inteiro, também ao reabrir (pedido do usuário em 22/11/2026, substitui "digitar continua o valor"). Sem valor, o 0 é só placeholder e OK deixa vazio. ⌫ tira só o último, e + ou − continuam a conta.
- No torneio, com o visor intocado e vazio, o + e o Calcular mão somam dos pontos de partida. O − começa um número negativo.
- "Soma X / total" acompanha o que está sendo digitado.

## Privacidade e acessibilidade

Na checagem de furiten da mesa, as esperas são informação privada do jogador. Não as anuncie automaticamente ou exponha à mesa. O modo falado ainda não está implementado; suas possíveis funcionalidades não são regras atuais. Consulte [acessibilidade](../docs/acessibilidade.md).

## Modo Chinês (MCR / Guobiao)

- Os modos de jogo se chamam **Riichi** e **Chinês (MCR)** na interface. Não usar 'Japonês' para o modo; 'japonês' só para o idioma.
- O modo Riichi é o padrão e a referência. Nada nele muda com o modo Chinês.
- O motor de fan é um porte em TypeScript do GB-Mahjong (Zheng Fan, MIT). O pacote `gb-mahjong-js` foi recusado porque conta os fan chamando um binário C++ pelo Node e não roda no navegador. O porte é conferido com os 130 casos do gb-mahjong-js em `npm run test:fan-mcr`. Ao mexer no motor, preserve a equivalência com o original, incluindo as regras de exclusão.
- Regras adotadas: mínimo de 8 fan sem contar as flores. Cada flor vale 1 fan e soma no total e no pagamento. O pagamento usa F = fan total com flores. No Dianhe, quem descartou paga F + 8 e os outros dois pagam 8. No Zimo, os três pagam F + 8. Não há bônus do dealer, honba nem limite. Mão abaixo do mínimo não mostra pagamento. O MCR não tem furiten, Riichi, Ippatsu, dora nem fu.
- A pedra da batida é a última da mão. As condições "última pedra" e "kan" mudam de nome conforme Dianhe ou Zimo: Última pedra da parede ou Último descarte, e Batida com reposição do Gang ou Roubar o Gang. As combinações que o GB-Mahjong recusa ficam bloqueadas em `validarMao`.
- Trocar de modo limpa a mão da calculadora chinesa e pede confirmação só se ela tiver pedras. A mão da calculadora japonesa fica guardada na memória enquanto o modo Chinês está ativo.

### Guia de Bolso, Tutorial e Placar

- Conteúdo do MCR: "Guia do Mahjong Chinês (MCR) para quem já sabe jogar Riichi Mahjong", do Cerrado Mahjong Club, de Juliana Visoni e Gabriel Souza. No modo Chinês, os nomes em português dos fan são os do CMC. O PDF de referência deve ficar em `.ai/referencias/GUIA_DO_MAHJONG_CHINES_CMC.pdf`, mas ainda não está no repositório: o conteúdo veio do texto do guia enviado pelo usuário.
- O guia do CMC numerava Duas Quadras Ocultas (双暗杠) como fan 48, com 8 pontos. Por decisão do usuário (19/11/2026), vale a lista oficial do MCR: é o fan 53 e vale 6, e Todas Trincas a Mão Completamente Exposta são os fan 48 a 52. `fans-mcr.ts` segue essa numeração, e o `test:fan-mcr` confere os 81 fan contra o motor por número, 汉字 e pontos.
- Tutorial MCR (pedido do usuário em 22/11/2026): ensina o mahjong chinês do zero, como se fosse o único. Só a Parte 6, opcional, compara com o Riichi, com o selo "Diferente do Riichi" (`--texto-aviso`). Ela não bloqueia o Mestre do MCR. As regras que não vêm do guia do CMC estão em [REFERENCIAS-MCR.md](REFERENCIAS-MCR.md), para confirmação. Progresso antigo: 1→1, 2→10, 3→8, 4→11, 5→13 e 6→14.
- Falso Hu no MCR (decidido com o usuário em 21/11/2026, regra da EMA): quem errou paga 10 pontos a cada um dos outros três (−30 e +10 cada). A mão continua e o dealer não muda. Fica em `PlacarMcr.falsosHu` e entra em `totais`.
- Placar MCR: anota vitória (vencedor, Dianhe ou Zimo, quem descartou, fan com as flores) ou empate. A mão precisa de 8 fan ou mais. O placar não confere as flores, então o aviso pede que o mínimo seja contado sem elas. Uma partida tem 16 mãos: o dealer passa a cada mão e o vento da rodada muda a cada 4 mãos. As cadeiras não trocam de lugar entre as rodadas no placar. O timer da vez tem 30 segundos por padrão e pode ser desligado.

- Flores no MCR: cada flor ou estação vale 1 fan, sem função própria nem relação com o assento. Na calculadora, entram na finalização da mão, num contador de 0 a 8 ligado às 8 pedras, que podem ser escolhidas uma a uma. Flores não contam para o mínimo de 8.
- Centerpiece simples no MCR (pedido do usuário em 22/11/2026): o mesmo do Riichi, com timer, dados, Sorteador, giro e atalhos de cálculo. Sai o honba (o dealer passa a cada mão, então o botão é Próxima mão), sai a opção de 3 jogadores e sai o atalho de Han e Fu, porque o MCR não tem fu. Cada modo guarda a sua mesa. Os dados são os das outras mesas (um lançamento escolhe a parede), não os dois lançamentos que o Tutorial ensina.
- Registrar partida finalizada no MCR (pedido do usuário em 22/11/2026): a mesma tela do Riichi, com a mesa somando zero, sem uma, oka nem escolha de regras. Como no Riichi avulso, a soma que não fecha fica em vermelho e não impede registrar. Entra no Histórico e no Ranking.
- Registro do MCR é só a calculadora de pontos (decisão do usuário em 22/11/2026, no lugar da Súmula mão a mão, que saiu): cada um começa com 0 e a pessoa soma e subtrai em cima do que já tem. Calcular mão usa a batida do Placar e põe o pagamento nos quatro totais. O rascunho fica salvo até registrar. Não recolocar a Súmula sem pedido.
- Mesas sorteadas do MCR: em torneio e clube, Registrar resultado numa mesa sem mão jogada pergunta Placar ou Totais. Mesa com mão no Placar segue nele, e totais começados seguem neles. No torneio a soma precisa fechar em zero, como no Riichi, e Corrigir reabre os totais que vieram do registro (mesmo id e data). Trocar dois de lugar leva os pontos.
- Ranking no MCR: soma os pontos MCR dos placares finalizados. Colocação pelo total da partida, com empate dividindo a posição.

- Glossário MCR (`aprender-a-jogar/conteudo/mcr/glossario.ts`): o do guia do CMC, no livro e na aba Glossário do Guia de bolso, sem comparações com o Riichi (elas ficam no módulo 23). No modo Chinês os textos não ganham links para o glossário do Riichi. Os créditos do CMC saíram da tela: o uso foi autorizado sem crédito.
- Voz MCR: com a Narração ligada, fala as chamadas ao montar ("Chi!", "Peng!", "Gang!", "An Gang!") e a batida ("Hu!" no Dianhe, "Zimo!" no Zimo). No resultado, diz a batida em chinês, os fan, o total e os pagamentos. Sem Narração, só o total e os pagamentos. Mão inválida: só o aviso.

- Torneio MCR (decidido com o usuário em 20/11/2026, regra da EMA, e trocado pelo Torneio do Riichi em 21/11/2026): os mesmos formatos, sorteio, timers e ranking do Riichi. Cada mesa dá pontos de mesa 4, 2, 1 e 0 pela colocação. Empatados dividem igualmente os pontos das colocações que ocupam juntos (dois em 1º ficam com 3 cada). A classificação soma os pontos de mesa e desempata pela soma dos pontos das partidas. A regra veio de memória: vale conferir com o regulamento da EMA.

### Terminologia do MCR (pedido do usuário em 22/11/2026)

| Riichi | MCR | 汉字 | Significado |
|---|---|---|---|
| Chi | Chi | 吃 | Chow, sequência só do jogador à esquerda |
| Pon | Peng | 碰 | Pung, trinca |
| Kan | Gang | 明杠 | Kong exposto |
| Kan fechado | An Gang | 暗杠 | Kong oculto |
| Ron | Dianhe | 点和 | Vitória por descarte |
| Tsumo | Zimo | 自摸 | Vitória por compra própria |
| Yaku | Fan | 番 | Elemento de pontuação |

- Riichi, dora e honba não existem no MCR e não aparecem nas telas do modo. Exceções: o nome do modo em Configurações e a parte opcional do Tutorial para quem vem do Riichi. Os nomes descritivos do CMC (Chow, Pung, Kong, trinca, quadra) podem ficar nas descrições.
- O Guia de bolso do MCR perdeu a aba Riichi e o selo com o yaku equivalente, por esse critério. Os equivalentes ficam no módulo 24 do Tutorial. A busca continua achando pelo nome do yaku.
- Nos códigos e nas chaves, os nomes internos seguem `pon`, `kanAberto`, `kanFechado`, `ron` e `tsumo`, para não mexer em dados salvos.
- O MCR não tem 5 vermelho: o teclado MPSZ e a cena de ajuda não mostram o 0. M P S Z ficam sempre na coluna da direita, como no Riichi (o usuário recusou os naipes numa linha embaixo e também os números esticados em oval). O lugar do 0 é um ⌫ largo, e o ⌫ de cima continua, porque é o que sobra com a mão completa. A cena de ajuda sempre repete o layout do teclado.
- Botões do MCR como os do Riichi (pedido do usuário em 22/11/2026, substitui o brief do mesmo dia): só o nome (Chi, Peng, Gang, An Gang, Zimo, Dianhe), sem ideogramas, e o MPSZ na mesma linha, sem menu ⋯. Os ideogramas continuam no Tutorial, no Glossário, no nome dos fan e no nome acessível das chamadas.

### Decisões em aberto

- Mudar o nome do app inteiro para Mahjong Manager (repositório, endereço, manifesto e ícones).
- Traduções do modo Chinês: es, ja, ko e lt estão em inglês e o zh-Hans só tem os nomes dos fan. Veja `src/compartilhado/i18n/REVISAR.md`.

## Compartilhar a mão

- Objetivo: tornar o app "instagramável". Cada Story com a mão e a assinatura do app (logo, nome e QR para o site) divulga o Riichi Manager. O formato de referência é o dos Stories (9:16), e o resto (WhatsApp, Discord) deve ficar bom também.
- Privacidade: a foto nunca sai do aparelho. Sem envio, sem gravar, e a câmera desliga ao capturar, fechar ou sair do app.
- Só aparece com um resultado válido: some no chombo, na mão sem yaku e na mão MCR inválida.
- O cartão mostra até 4 yaku ou fan e "+N" para o resto, e o nome de quem bateu quando o resultado vem do Centerpiece.
