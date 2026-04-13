# Arquitetura

## Visão geral

O projeto usa **React + TypeScript + Vite** com separação por responsabilidade:

- Interface e orquestração no componente raiz (`src/App.tsx`)
- Regras de simulação contínua no hook (`src/hooks/useGameLoop.ts`)
- Persistência local em service (`src/services/storage.ts`)
- Tipagem e catálogos compartilhados em `src/types` e `src/constants`

Essa divisão permite evoluir UI e regras de domínio com menor acoplamento.

## Estrutura de pastas

```text
src/
  components/
    icons/
  constants/
    aquarium.ts
    fish.ts
    index.ts
  features/
    aquarium/
    controls/
    ecosystem/
    fish/
  hooks/
    useGameLoop.ts
  services/
    storage.ts
    storage.test.ts
  types/
    aquarium.ts
    environment.ts
    fish.ts
    index.ts
  App.tsx
  index.tsx
  index.css
```

## Responsabilidades por camada

### `App.tsx`

`App.tsx` coordena estado global da simulação e liga os eventos de interface às ações de domínio:

- Estados principais: peixes, comida, decorações, água, sensores, equipamento, ecossistema
- Ações de alto nível: alimentar, trocar água, calibrar sensores, aplicar templates, salvar/carregar
- Montagem da UI por abas (`Ribbon`, painéis e `Aquarium`)

Recomendação: manter apenas orquestração e composição de componentes no `App`; regras de cálculo devem ficar no hook/service.

### `hooks/useGameLoop.ts`

É a camada de simulação em tempo real, executada por `requestAnimationFrame`:

- Atualiza química da água e variáveis ambientais
- Processa comportamento de peixe (alvo, deslocamento, colisão, fome, estresse)
- Processa interações (alimentação, reprodução e rivalidade)
- Mantém consistência temporal com `delta` e `timeScale`

Recomendação: para novas regras de simulação, priorizar adição no hook com funções auxiliares puras quando possível.

### `features/*`

Organiza a UI por domínio funcional:

- `aquarium`: cena visual, partículas e status
- `fish`: listagem/card/modal de espécies
- `controls`: ribbon e painéis de controle por tema
- `ecosystem`: painel de ecossistema

Recomendação: componentes visuais não devem conter parsing de estado persistido nem regras de integração.

### `services/storage.ts`

Isola acesso ao `localStorage`:

- Salva via envelope versionado (`version`, `savedAt`, `data`)
- Carrega com validação mínima de estrutura
- Mantém compatibilidade com formato legado sem envelope

Essa camada evita espalhar lógica de persistência em múltiplos componentes.

### `types/*` e `constants/*`

- `types`: contratos de domínio usados entre UI, hook e service
- `constants`: catálogo de espécies, tolerâncias e regras de rivalidade

Recomendação: qualquer nova entidade de domínio deve nascer com tipo explícito e, quando aplicável, com constantes centralizadas.

## Fluxo de dados

1. Usuário interage com UI (painéis, clique no aquário, modal de peixe).
2. `App.tsx` dispara handlers e atualiza estado React.
3. `useGameLoop` executa ticks e recalcula estado derivado em tempo real.
4. Componentes renderizam o estado atualizado.
5. `saveState/loadState` persistem/restauram snapshots quando acionado.

## Diretrizes de evolução

- Evitar mover regras de domínio para componentes visuais.
- Adicionar testes ao tocar regras críticas do `useGameLoop`.
- Manter payload de persistência retrocompatível ou com migração explícita.
- Ao crescer o projeto, evoluir para organização por feature com subpastas (`components`, `hooks`, `services`, `types`) dentro de cada domínio.
