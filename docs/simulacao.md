# Simulação

## Loop principal

A simulação roda no `useGameLoop` com `requestAnimationFrame` e usa `timeScale` para acelerar, pausar ou desacelerar a evolução do mundo.

Pontos-chave:

- `delta` é normalizado e limitado para evitar saltos grandes em frames longos.
- Referências (`refs`) são usadas para reduzir risco de estado obsoleto entre frames.
- O loop atualiza água, ecossistema, peixes, decorações e efeitos de alimentação.

## Dinâmica da água

Variáveis simuladas:

- pH
- amônia, nitrito, nitrato
- temperatura (com alvo + atuação do aquecedor)
- oxigênio e CO2
- GH, KH
- salinidade
- fosfato
- nível da água (evaporação)
- TDS

Principais influências:

- Biomassa dos peixes aumenta carga orgânica.
- Filtragem biológica converte amônia e nitrito.
- Filtragem mecânica reduz fosfato.
- Aeração impacta oxigênio/CO2.
- Injeção de CO2 desloca equilíbrio químico.
- Luz + nitrato elevam algas.
- Evaporação altera nível e concentração (especialmente em água salgada).

## Comportamento dos peixes

Cada peixe evolui por frame em dimensões biológicas e de movimento:

- Fome, idade, saúde, felicidade
- Estresse por qualidade da água fora da tolerância da espécie
- Busca de alimento por proximidade
- Locomoção com alvo, inércia, limitação de velocidade e bounce nas bordas
- Crescimento condicionado por espécie e fome

A felicidade considera:

- Bônus por decoração
- Penalidade por superlotação
- Penalidade por estresse

## Interações especiais

### Alimentação

- Partículas de comida são adicionadas manualmente e consumidas por proximidade.
- Ao comer, a fome reduz e um efeito visual (`EatingEffect`) é criado.

### Reprodução

Condições gerais para tentativa:

- Idade mínima e tamanho mínimo
- Fome baixa
- Saúde e felicidade altas
- `breedingCooldown` zerado
- Limite máximo de população
- Chance probabilística por frame

### Rivalidade

Espécies rivais são definidas em `src/constants/fish.ts`.

Quando rivais se aproximam:

- Peixes podem perseguir ou se reposicionar
- Pode ocorrer dano por ataque em curta distância
- Estresse e perda de felicidade são aplicados

## Tempo e sensores

Além do loop principal:

- Histórico da água é amostrado periodicamente em `App.tsx`.
- Sensores sofrem drift de calibração ao longo do tempo.
- Leitura exibida pode incluir ruído e offset em relação ao valor real.

## Templates de cenário

`App.tsx` inclui cenários prontos para testes de gameplay:

- `reproduction_lab`: ambiente favorável à reprodução
- `rival_warzone`: ambiente com espécies rivais e tensão ecológica

Esses templates facilitam QA manual de comportamentos críticos.
