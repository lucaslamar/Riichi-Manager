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
