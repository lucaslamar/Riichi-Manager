# Riichi Manager

App web estatico para Riichi Mahjong, feito com React + TypeScript e publicado no GitHub Pages.

URL de producao: https://lucaslamar.github.io/Riichi-Manager/

## Estado atual

Versao do pacote: 4.0.2.

Modulos publicos:

- Calculadora de Mao: entrada principal do app, com montagem por tiles, esperas, furiten, dora, riichi, ventos, honba e resultado em modal.
- Calculadora de Han e Fu: pontuacao direta por han/fu, tipo de vitoria, dealer/leste e honba.
- Torneio Fast: cadastro, grade, timer, qualidade das mesas, ranking e persistencia em localStorage.
- Regras / Configuracoes e Sobre / versao: acessos globais compactos.

O app nao tem backend, banco de dados, autenticacao ou API externa obrigatoria.

## Como rodar

    npm install
    npm run dev

## Qualidade

    npm run lint
    npm run build

## Deploy GitHub Pages

O `vite.config.ts` usa:

    base: "/Riichi-Manager/"

Deploy:

    npm run build
    npm run deploy

## Estrutura do projeto

    src/
      app/                         # Composicao raiz e navegacao manual

      compartilhado/
        i18n/                      # Provider e helper de traducoes
        mahjong/
          pontuacao/               # Tipos e funcoes puras de pontos por han/fu
        interface/
          componentes/             # Componentes compartilhados, como AdSlot e BarraCalculadora
          layout/                  # Cabecalho/menu global
          estilos/                 # Tokens, reset, layout e CSS compartilhado

      dominios/
        calculadora-mao/
          logica/                  # Montagem, esperas, furiten, yaku/fu e conversao para riichi
          interface/
            hooks/                 # Estado, acoes de usuario e resultado da mao completa
            componentes/           # UI de montagem/finalizacao de mao
            paginas/               # Pagina da Calculadora de Mao

        calculadora-han-fu/
          logica/                  # Porta de entrada para pontuacao direta compartilhada
          interface/
            hooks/                 # Estado isolado de han, fu, leste, ron/tsumo e honba
            componentes/           # Controles e resultado Han/Fu
            paginas/               # Pagina da Calculadora de Han e Fu

        torneio-fast/
          logica/                  # Sorteio, qualidade, chaves e tipos
          interface/               # Telas do torneio
          persistencia/            # localStorage

    public/
      locales/                     # pt-BR default e estrutura para outros idiomas
      tiles/                       # Assets publicos das pedras

    docs/
      arquitetura.md
      calculadora-fluxo.md
      regras-de-negocio.md

## Documentacao

Leia tambem:

- Arquitetura: `docs/arquitetura.md`
- Fluxo da calculadora: `docs/calculadora-fluxo.md`
- Regras de negocio: `docs/regras-de-negocio.md`

# Contribuindo

## Principios

- Preserve as regras da mao completa em `src/dominios/calculadora-mao/logica`.
- Mantenha pontuacao direta compartilhada em `src/compartilhado/mahjong/pontuacao`.
- Prefira UX da mao em `src/dominios/calculadora-mao/interface`.
- Prefira UX da Han/Fu em `src/dominios/calculadora-han-fu/interface`.
- Nao adicione backend, banco de dados, autenticacao ou API externa obrigatoria.
- Mantenha compatibilidade com GitHub Pages.
- Use `import.meta.env.BASE_URL` para arquivos em `public`.
- Textos novos devem ir para `public/locales/pt-BR.json`.
- Textos da interface devem usar fallback pelo `useI18n`.

## Antes de mexer na calculadora

Leia:

- `docs/calculadora-fluxo.md`
- `docs/regras-de-negocio.md`

O fluxo atual da Calculadora de Mao e:

1. Montar a mao.
2. Escolher a pedra vencedora.
3. Finalizar a mao e configurar vitoria.
4. Clicar em Calcular.
5. Ver o resultado em modal.

Fechar a modal nao remove a pedra vencedora. Para trocar a espera, use a acao explicita de voltar para montagem.

## Checklist rapido antes de abrir PR ou finalizar alteracao

    npm run lint
    npm run build

Ao alterar telas, valide pelo menos:

- mobile retrato;
- mobile paisagem;
- desktop/tablet;
- foco por teclado;
- aria-labels dos botoes novos;
- resultado da Calculadora de Mao em Ron e Tsumo;
- Calculadora de Han e Fu;
- Torneio Fast ainda acessivel pelo menu global;
- compatibilidade com GitHub Pages.

## Cuidados importantes

Evite alterar diretamente regras sensiveis sem entender o impacto. Antes de mexer em calculo, confira tenpai, esperas, furiten, sem-yaku, dora, honba, ventos, riichi, ron/tsumo, condicoes especiais e resultado final.

Mudancas visuais devem preservar o fluxo existente. Evite duplicar informacoes, criar containers desnecessarios, esconder acoes importantes, quebrar navegacao mobile, remover acessibilidade ou trocar botoes funcionais por icones decorativos sem `onClick`.

## Objetivo do projeto

O Riichi Manager busca ser um ecossistema simples, acessivel e funcional para jogadores e clubes de Riichi Mahjong.

Prioridades atuais:

- Calculadora de Mao mobile-first;
- calculo confiavel;
- boa experiencia visual com tiles;
- acessibilidade;
- suporte futuro a multiplos idiomas;
- Torneio Fast preservado;
- compatibilidade com GitHub Pages.
