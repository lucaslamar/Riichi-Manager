# Padrões de desenvolvimento

Estes padrões orientam novas alterações, implementações e refatorações futuras. O código existente pode ainda não segui-los integralmente; não amplie o escopo de uma tarefa apenas para padronizá-lo.

## Código

- Prefira soluções simples, diretas e legíveis a abstrações ou complexidade desnecessárias. Reutilize recursos existentes quando apropriado.
- Use nomes consistentes, descritivos e que expressem a intenção de variáveis, funções, classes e arquivos. Prefira português, respeitando o contexto, termos técnicos e convenções existentes.
- Mantenha funções pequenas e com uma responsabilidade bem definida. Evite misturar operações distintas em uma mesma função.
- Prefira retornos antecipados quando reduzirem aninhamento e facilitarem a leitura, sem prejudicar a clareza.
- Evite duplicação de lógica. Quando uma regra ou comportamento precisar ser reutilizado, avalie uma solução compartilhada sem criar abstrações prematuras.
- Prefira código autoexplicativo. Use comentários apenas quando necessários para esclarecer decisões, regras de negócio ou comportamentos que o código não expressa bem. Mantenha-os atualizados.
- Evite efeitos colaterais inesperados. Funções devem ter comportamentos previsíveis e responsabilidades claras.
- Trate erros de forma explícita. Não oculte falhas nem utilize valores padrão que possam mascarar problemas.
- Separe lógica de domínio, interface e APIs de plataforma. Preserve as fronteiras definidas em [ARCHITECTURE.md](ARCHITECTURE.md).
- Organize classes e módulos de acordo com suas responsabilidades. Evite concentrar regras de negócio independentes em um único lugar.
- Preserve contratos existentes e evite mudanças de comportamento não solicitadas. Consulte o usuário quando a regra de negócio estiver incerta.

## Testes e confiabilidade

- Escreva testes para regras de negócio, cálculos e comportamentos importantes.
- Prefira testes independentes, determinísticos e que verifiquem resultados observáveis.
- Evite testes excessivamente acoplados à implementação interna. Priorize o comportamento esperado.
- Ao corrigir um erro, considere adicionar um teste que reproduza o problema e impeça sua recorrência.
- Não altere regras de negócio apenas para facilitar a implementação ou os testes.

## Interface e dados

- Siga os componentes, estilos e padrões de acessibilidade existentes. Use rótulos acessíveis, não dependa apenas de cor e respeite a privacidade das preferências do usuário.
- Mantenha textos de interface em `public/locales` e use `useI18n` nos componentes. A busca segue o idioma ativo, `en` e `pt-BR`; conteúdo longo do guia de aprendizado é uma exceção organizada por idioma no próprio domínio.
- Evite componentes com responsabilidades excessivas. Separe apresentação, interação e lógica quando isso melhorar a clareza e a manutenção.
- Ao alterar a inicialização de tema ou preferências visuais, mantenha `index.html` e `src/compartilhado/preferencias/PreferenciasProvider.tsx` consistentes: o HTML aplica preferências antes da primeira pintura.
- Respeite as fronteiras de persistência e use os adaptadores existentes para recursos de plataforma. Preserve o funcionamento no GitHub Pages.
- Evite duplicar estados ou manter informações derivadas que possam ser calculadas a partir dos dados existentes.

## Modos de jogo

- O layout é um só para todos os modos de jogo (Riichi, MCR e os que vierem, como o coreano). Cada modo troca só as regras, os cálculos e o conteúdo do guia e do tutorial. Melhorias de UX e design valem para todos os modos.
- Antes de criar uma tela para um modo, parametrize a do Riichi pelo `useModoJogo()` ou por props, com o conteúdo e as regras do modo. O Riichi deve continuar idêntico, conferido por testes e no navegador.
- Texto que muda com o modo é chave em `modo.<modo>` nos locales, não `if` de modo no JSX.
- Exemplos: o Guia de bolso (`ModalYakus`) e o Tutorial (`GuiaAprender`, com `conteudoGuia(idioma)` no Riichi e `criarConteudoMcr(t)` no MCR) são os mesmos nos dois modos. A Nova partida do placar MCR usa `CardAssento`, `sortearAssentos` e as classes `ptd-*` da Nova partida do Riichi.

## Manutenção e refatoração

- Faça alterações incrementais e preserve o funcionamento existente.
- Refatore apenas o necessário para atender ao objetivo da tarefa, melhorar a clareza ou corrigir problemas diretamente relacionados.
- Evite misturar refatorações amplas com implementações de funcionalidades.
- Remova código obsoleto, imports não utilizados e trechos desnecessários quando estiverem diretamente relacionados à alteração.
- Priorize legibilidade e facilidade de manutenção em vez de otimizações prematuras.
- Considere que outras pessoas precisarão compreender, revisar e dar continuidade ao código.

Consulte [arquitetura](../docs/arquitetura.md), [fluxo da calculadora](../docs/calculadora-fluxo.md) e [acessibilidade](../docs/acessibilidade.md) para detalhes, conferindo o código quando necessário.
