# Documentação Técnica

Este diretório concentra a documentação operacional e arquitetural do **React Aquarium Simulator**.

## Índice

- [Arquitetura](./arquitetura.md)
- [Simulação](./simulacao.md)
- [Persistência](./persistencia.md)

## Como usar esta documentação

- Se você está chegando no projeto agora: comece por **Arquitetura**.
- Se vai ajustar comportamento do aquário/peixes: leia **Simulação**.
- Se vai mexer em save/load: leia **Persistência** antes de alterar o schema.

## Escopo atual

A documentação foi escrita com base na estrutura e regras presentes em `src/` na versão atual do projeto, incluindo:

- Organização por domínio em `features/`
- Loop principal em `src/hooks/useGameLoop.ts`
- Persistência local versionada em `src/services/storage.ts`
- Contratos de tipos em `src/types/`

## Convenções

- Idioma: pt-BR
- Foco: decisões técnicas, fluxo e manutenção
- Sem duplicar código-fonte; referência direta aos arquivos quando necessário
