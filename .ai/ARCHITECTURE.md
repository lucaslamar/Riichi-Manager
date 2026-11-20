# Arquitetura

## Visão geral

O Riichi Manager é uma aplicação estática em React e TypeScript, publicada no GitHub Pages, sem backend ou serviços obrigatórios. `src/main.tsx` inicia o armazenamento e monta os providers de preferências e idioma; `src/app/App.tsx` compõe os módulos e controla a navegação. Para desenvolver, use `npm install` e `npm run dev`.

## Organização

- `src/dominios`: funcionalidades organizadas por domínio, incluindo calculadoras, mesa e clubes (`centerpiece`), jogadores, torneios, sorteador de ventos, configurações e guia de aprendizado. Partidas vinculam mesas de torneio aos resultados e rankings.
- `src/compartilhado`: recursos usados entre domínios, incluindo interface, internacionalização, persistência, adaptadores e lógica de Mahjong compartilhada.
- `src/services`: serviços de armazenamento e backup.
- `public/locales`: traduções da interface; a cadeia de fallback passa por `en` e depois `pt-BR`.

Dentro dos domínios, mantenha regras em `logica` e estado e componentes em `interface`. A lógica de Mahjong deve permanecer independente de JSX, CSS, DOM e APIs do navegador. As calculadoras podem compartilhar pontuação pura, mas não estado nem hooks de montagem de mão.

## Dados e integração

- A aplicação usa IndexedDB via Dexie para dados como jogadores, partidas e torneios. Preferências permanecem no `localStorage`, que também é a alternativa quando o banco não está disponível. O roteamento das chaves está em `src/compartilhado/persistencia/armazenamento.ts` e a inicialização em `src/services/storage/iniciarArmazenamento.ts`.
- `src/services/storage/armazenamentoDados.ts` migra dados do `localStorage` com conferência antes de removê-los; leituras usam memória e gravações vão ao banco em fila. Preserve compatibilidade e aguarde gravações pendentes quando necessário.
- `src/services/backup/backup.ts` define o formato versionado, validação e mesclagem; `lojaBackup.ts` integra os repositórios. Mudanças incompatíveis no formato exigem atenção à versão do esquema e aos dados existentes.
- Componentes chamam ações nomeadas; regras sensíveis pertencem à lógica, não ao JSX. Adaptadores em `src/compartilhado/adaptadores` isolam recursos da plataforma.
- O Vite usa a base `/Riichi-Manager/`; caminhos de assets públicos montados em TypeScript devem respeitar `import.meta.env.BASE_URL`. O build gera um service worker a partir de `scripts/sw-modelo.js` para acesso offline e atualiza o cache por versão; ele não é registrado em desenvolvimento.

Para detalhes de módulos e fluxos, consulte [arquitetura](../docs/arquitetura.md) e [fluxo da calculadora](../docs/calculadora-fluxo.md). Em caso de divergência, confira o código: a documentação de arquitetura ainda menciona apenas `localStorage`.

## Modo de jogo (versão 7.0.0)

- A versão atual é a 7.0.0, que introduziu o modo de jogo global. A versão exibida e a do backup vêm do `package.json` (`__VERSAO_APP__` no `vite.config.ts`).
- `src/compartilhado/modo-jogo`: `ModoJogo` é `'riichi' | 'mcr'`, com padrão `'riichi'`. O `ModoJogoProvider` envolve o app em `src/main.tsx`, abaixo do `PreferenciasProvider`, e grava o modo em `localStorage` na chave `rm.modoJogo`. `useModoJogo()` devolve `modo`, `setModo` e `isChines`. O provider também põe `data-modo` no `<html>` e atualiza o `document.title`. `maoEmAndamento.ts` avisa ao cartão de modo se a calculadora chinesa tem pedras.
- `src/compartilhado/marca/nome-app.ts`: o nome exibido é Riichi Manager no Japonês e Mahjong Manager no Chinês. Repositório, `base`, manifesto, ícones e chaves de armazenamento não mudam.
- `src/compartilhado/interface/layout/navegacao.ts`: `navegacaoDoModo(modo)` devolve páginas, itens e ordem do carrossel. No Riichi devolve as listas originais, sem mudança. No MCR ficam ocultas a Han e Fu, o Centerpiece e as Partidas, e entram as telas `placarMcr` e `guiaBolso`, que só existem no MCR. A barra do MCR tem duas páginas: Calculadora, Placar, Guia e Ranking, e depois Sorteador e Tutorial. O subitem Registrar partida finalizada (`SUBITENS_SO_RIICHI`) some no MCR. A Calculadora de Mão continua no mesmo lugar e, no App, mostra a calculadora chinesa. O Tutorial abre o `TutorialMcr` no lugar do `GuiaAprender`. Ao trocar de modo numa tela que não existe no outro, o App volta para a Calculadora.
- `src/dominios/calculadora-mao-chinesa`: domínio separado da Calculadora de Mão japonesa, que não deve ser alterada. `logica/motor` é o porte em TypeScript do GB-Mahjong (MIT, licença em `LICENCA-GB-MAHJONG.txt`). `logica/fan-mcr.ts` é a única porta de entrada do motor para a interface, `logica/pontuacao-mcr.ts` calcula os pagamentos e `logica/montagem.ts` monta e valida a mão. A interface só reutiliza `PedraSvg` e os nomes acessíveis das pedras da calculadora japonesa, sem estado nem hooks dela.

- `src/compartilhado/mahjong/mcr/fans-mcr.ts`: fonte única dos dados de exibição dos 81 fan, do guia do Cerrado Mahjong Club (nomes do CMC, 汉字, inglês, categoria, descrição, exclusões citadas no guia e equivalente no Riichi). O motor de fan continua sendo a fonte da verdade do cálculo. O resultado da calculadora chinesa usa os nomes deste arquivo pelo número oficial (`id` em `FanContado`). Só o Kan Aberto e Kan Fechado (82, do motor) segue em `mcr.fan` no i18n.
- `src/dominios/guia-bolso/mcr`: Guia de Bolso do MCR, uma tela própria (`PaginaGuiaBolsoMcr`). O Guia de Bolso do Riichi continua dentro da Calculadora de Mão, em `src/dominios/calculadora-mao/conteudo/guia-bolso`, sem mudança. `CreditosCmc` mostra os créditos nas duas telas do MCR.
- `src/dominios/aprender-a-jogar/mcr`: Tutorial do MCR em páginas no `Modal`. O texto fica em `conteudoTutorialMcr.ts`, como o conteúdo longo do Aprender a jogar, só em português. O Tutorial do Riichi (`GuiaAprender` e `conteudo/`) não mudou.
- `src/dominios/placar-mcr`: placar de partida MCR. `logica/placar.ts` soma os pontos pela fórmula de `pontuacao-mcr` e faz o rodízio do dealer. Os placares ficam na chave `riichi-manager-placares-mcr` do banco (em `CHAVES_DE_DADOS`), separados das partidas do Riichi. Os jogadores vêm do cadastro único (`useJogadores` e `SeletorJogador`), e `idsEmUso` também conta quem está num placar MCR. O timer reaproveita `useRelogioVez` e a lógica pura de `centerpiece/logica/vez.ts`. Os placares entram no backup como `placaresMcr` (campo opcional: backups antigos viram lista vazia, sem subir o `SCHEMA_BACKUP`), com mescla por id e unificação de jogadores.
- Calculadora chinesa com o layout da japonesa: `CalculadoraMaoChinesa` usa as mesmas classes de `compartilhado/interface/estilos/dominios/calculadoras` e importa, sem editar, `TecladoPedras`, `BotaoAcao`, `GradePedrasMao`, `PedraMao`, `ChipMeldMao` e `PedrasMeld` da calculadora japonesa. A mão (`MaoChinesaAtual`) e a finalização são próprias. Escondida, ela retorna `null` e mantém o estado, como a japonesa. Se renderizasse o cartão escondido, o CSS da mesa esconderia o Centerpiece e o Ranking. As flores usam a arte própria `PedraFlor` (SVG), porque o conjunto de pedras do app não tem flores.
- Ranking no MCR: `useRankingGeral` lê `partidasDoRankingMcr` (`placar-mcr/logica/rankingMcr.ts`), que converte os placares finalizados em partidas só com o resultado. A tela é a mesma. No MCR somem tobi, duração, registro manual e a análise do jogador.
