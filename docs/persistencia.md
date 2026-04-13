# Persistência

## Objetivo

A persistência salva e restaura o estado do aquário de forma resiliente, mantendo compatibilidade com saves antigos.

Arquivo de referência: `src/services/storage.ts`.

## Chave e versão

- Chave de armazenamento: `aquariumState`
- Versão atual do schema: `2`

## Formato salvo (versionado)

```json
{
  "version": 2,
  "savedAt": "2026-03-25T12:00:00.000Z",
  "data": {
    "fishList": [],
    "foodList": [],
    "environment": "freshwater",
    "decorations": [],
    "waterQuality": {
      "ph": 7.2,
      "ammonia": 0,
      "nitrite": 0,
      "nitrate": 5,
      "temperature": 25,
      "targetTemperature": 25,
      "oxygen": 100,
      "co2": 10,
      "gh": 6,
      "kh": 4,
      "salinity": 1,
      "phosphate": 0.04,
      "waterLevel": 100,
      "tds": 320
    },
    "ecosystem": {
      "timeOfDay": 8,
      "lightOn": true,
      "algaeLevel": 0
    },
    "equipment": {
      "biologicalFiltration": 70,
      "mechanicalFiltration": 65,
      "aeration": 60,
      "co2Injection": 20,
      "lightIntensity": 65,
      "heaterPower": 70
    },
    "sensors": {
      "calibrationOffsetPh": 0,
      "calibrationOffsetTemp": 0,
      "readingNoise": 8
    }
  }
}
```

## Compatibilidade com legado

Se o payload não tiver envelope (`version` + `data`), o parser tenta ler como formato legado direto.

Isso evita quebra de estado para usuários que já tinham save em versões anteriores.

## Estratégia de normalização

Durante `loadState`:

- Campos estruturais inválidos são descartados para defaults seguros.
- Ambiente inválido cai para `freshwater`.
- `waterQuality` e `ecosystem` usam fallback tipado quando ausentes/inválidos.
- `equipment` e `sensors` podem ser omitidos e preenchidos pela aplicação.

## Testes existentes

`src/services/storage.test.ts` cobre:

- Salvamento com envelope versionado
- Leitura de payload versionado
- Compatibilidade com formato legado
- Retorno `null` para JSON inválido

## Guia para evolução de versão

Quando alterar schema de persistência:

1. Incrementar `STORAGE_VERSION`.
2. Criar etapa explícita de migração por versão (ex.: `v2 -> v3`).
3. Preservar compatibilidade de leitura para versões anteriores relevantes.
4. Adicionar testes de migração cobrindo casos válidos e corrompidos.

Sem migração explícita, mudanças de formato podem causar perda de estado salvo.
