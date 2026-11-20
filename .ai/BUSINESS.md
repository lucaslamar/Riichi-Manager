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
- Placar MCR: anota vitória (vencedor, ron ou tsumo, quem descartou, fan com as flores) ou empate. A mão precisa de 8 fan ou mais. O placar não confere as flores, então o aviso pede que o mínimo seja contado sem elas. Uma partida tem 16 mãos: o dealer passa a cada mão e o vento da rodada muda a cada 4 mãos. As cadeiras não trocam de lugar entre as rodadas no placar. O timer da vez tem 30 segundos por padrão e pode ser desligado.

- Flores no MCR: cada flor ou estação vale 1 fan, sem função própria nem relação com o assento. Na calculadora, as 8 ficam numa linha do teclado: cada uma entra uma vez na mão, e um toque na flor da mão a tira. Flores não contam para o mínimo de 8.
- Ranking no MCR: soma os pontos MCR dos placares finalizados. Colocação pelo total da partida, com empate dividindo a posição.

- Glossário MCR (`aprender-a-jogar/conteudo/mcr/glossario.ts`): o do guia do CMC, no livro e na aba Glossário do Guia de bolso, com o selo "Diferente do Riichi" no que muda (dealer, Chow com kuikae, Kong oculto, flores, espera sem furiten). Os créditos do CMC saíram da tela: o uso foi autorizado sem crédito.
- Voz do resultado MCR: "Hu!" no ron e "Zimo!" no tsumo, em chinês, depois os fan, o total e os pagamentos. Mão inválida: só o aviso, sem chamada.

- Torneio MCR (decidido com o usuário em 20/11/2026, regra da EMA): cada mesa dá pontos de mesa 4, 2, 1 e 0 pela colocação. Empatados dividem igualmente os pontos das colocações que ocupam juntos (dois em 1º ficam com 3 cada). A classificação soma os pontos de mesa e desempata pela soma dos pontos das partidas. Cada sessão (mesa) acaba nas 16 mãos ou no fim do tempo configurado (0 = sem limite). Um torneio aberto por vez. A regra veio de memória: vale conferir com o regulamento da EMA.

### Decisões em aberto

- Mudar o nome do app inteiro para Mahjong Manager (repositório, endereço, manifesto e ícones).
- Exemplos dos 81 fan no Guia de bolso: dependem do novo `fans-mcr.ts` com o campo `exemplo`, que ainda não foi enviado.
- Traduções do modo Chinês: es, ja, ko e lt estão em inglês e o zh-Hans só tem os nomes dos fan. Veja `src/compartilhado/i18n/REVISAR.md`.
