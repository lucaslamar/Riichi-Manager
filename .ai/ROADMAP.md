# Roadmap e ideias

Ideias discutidas e ainda não implementadas. Ao implementar, mova a regra para BUSINESS ou DESIGN e apague daqui.

## Brief do Torneio de 21/11/2026: próximas fases

- Fases concluídas.
- Fora por enquanto: PDF com QR (o app não gera PDF) e link do QR direto para o torneio (precisa de backend).

## Aguardando decisão

- **WO no Chinês:** sem valores definidos, por isso o botão não aparece. Conferir atraso e WO na WRC 2025 e na EMA (os números vieram do brief).

- **Chance de virar:** conferir com torneios reais se a porcentagem acerta (curva normal, jogos independentes) e confirmar o mínimo de 3 mesas.
- **Cenários de virada:** confirmar a linha da uma flutuante (hoje 2 acima do retorno) e os limites da projeção (3 a 100 jogos).
- **W.O. no meio da partida:** confirmar a ordem com dois ou mais W.O. e definir valores para o Chinês.
- **Salvar para continuar:** levar ao Chinês (hoje o rascunho dele já salva sozinho, sem rodada nem lista) e ao Finalizar mesa do torneio.

## Premiação

- Controle de pagamento de parcelas por jogador.
- Inscritos da temporada que ainda não jogaram nenhum encontro: hoje a conta usa quem já esteve em algum.
- Escolher a moeda na tela (hoje é a do idioma ao ligar) e conferir moeda e divisão do modo Chinês com o clube.

## Clube

- Lembrar repetições entre dias diferentes (hoje só o mesmo dia).
- Sanma no clube, com mesas de 3. O sorteio compartilhado já aceita.

## Desktop

- Marcar no menu lateral o subitem aberto (hoje marca só Mesa partida ou Ranking).
- Proposta aguardando aprovação: lista de presença em duas áreas no iPad deitado e PC (nomes de um lado, contagem e Sortear do outro).
- Proposta aguardando aprovação: digitar a mão pelo teclado físico sem abrir o MPSZ.
- Proposta aguardando aprovação: limitar a largura da Calculadora e do Han e Fu em monitor grande.
- Conferir num iPad de verdade (Safari, teclado do sistema, Split View).


## Modo Chinês

- Confirmar as regras do Tutorial marcadas em [REFERENCIAS-MCR.md](REFERENCIAS-MCR.md).
- Traduzir `tutorial.mcr.*` (hoje em português nos 7 idiomas).
- Decidir se os dados das mesas do MCR usam os dois lançamentos da regra chinesa (hoje um lançamento escolhe a parede, como no Riichi).
- Decidir se Corrigir também edita um resultado MCR jogado no Placar (hoje só abre a mesa finalizada).
- Decidir se o Placar troca as cadeiras entre as rodadas.
- Decidir se a calculadora mostra o An Gang com as 4 pedras viradas, como o Tutorial, ou só as pontas.
- Compartilhar a mão: abrir direto o editor dos Stories (`instagram-stories://`) só na versão React Native, pois precisa de Facebook App ID e não funciona bem na web. Preencher `SHARE_HANDLE` quando houver um @ ou site curto.
