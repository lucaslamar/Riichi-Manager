# Changelog - Riichi Manager

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
