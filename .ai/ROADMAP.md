# Roadmap e ideias

Ideias discutidas e ainda não implementadas. Ao implementar, mova a regra para BUSINESS ou DESIGN e apague daqui.

## Brief do Torneio de 21/11/2026: próximas fases

- Todas as fases feitas, menos a 3C.
- Fora por enquanto: PDF com QR (o app não gera PDF), link do QR direto para o torneio (precisa de backend) e a dica de uma na folha da distância.

## Aguardando decisão

- **3C, grades ZAPS:** só com autorização do autor (licença NC).
- **WO no Chinês:** sem valores definidos, por isso o botão não aparece. Conferir atraso e WO na WRC 2025 e na EMA (os números vieram do brief).
- **Sanma no Torneio:** saiu de propósito em `ef63b2b` (10/11/2026), antes de ser publicado, e o Torneio é sempre de 4. Só voltar se o usuário decidir. Aí faltam a escolha de 3 ou 4, o registro de 3 (hoje exige os 4 lugares), os cortes em múltiplos de 3, os valores de WO e o "Jogar Sanma quando falta um" do brief.

## Premiação

- Controle de pagamento de parcelas por jogador.
- Inscritos da temporada que ainda não jogaram nenhum encontro: hoje a conta usa quem já esteve em algum.
- Escolher a moeda na tela (hoje é a do idioma ao ligar) e conferir moeda e divisão do modo Chinês com o clube.

## Clube

- Lembrar repetições entre dias diferentes (hoje só o mesmo dia).
- Sanma no clube, com mesas de 3. O sorteio compartilhado já aceita.

## Problemas conhecidos

- O fim do tempo não encerra a partida na mão atual, embora a ajuda diga que sim.
- A ajuda do timer de vez cita a aba Mesa, que não existe mais nas configurações do torneio.
- `npm run lint` varre `.claude/skills` e falha num script de lá.

## Desktop

- Revisar a tela de desktop, inclusive o título que trunca com quatro ações no menu lateral.
- Na folha de pontos, apagar o valor anterior ao começar a digitar (só no desktop).
