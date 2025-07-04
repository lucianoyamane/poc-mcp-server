# Plano de Refatoração — Servidor MCP

Este documento sugere um plano de refatoração para o arquivo `index.js` do servidor MCP, visando melhorar a organização, escalabilidade e manutenibilidade do projeto.

---

## Observação sobre a abordagem manual (baixo nível) com o Model Context Protocol (MCP)

Durante a implementação deste projeto, optamos por utilizar a API de **baixo nível** do MCP SDK (`Server` e `setRequestHandler`) ao invés das abstrações de alto nível (`McpServer`, `server.tool`, `server.resource`, etc). Essa decisão foi motivada por:

- **Limitações e bugs** encontrados ao tentar expor resources dinâmicos e templates usando o alto nível, especialmente para listagem e leitura de resources no Inspector e clients MCP.
- **Necessidade de controle total** sobre o registro de capabilities, schemas, templates e handlers, garantindo compatibilidade com o protocolo MCP e ferramentas como o Inspector.
- **Facilidade para customizar** a listagem de tools, resources, prompts e o tratamento de requests, permitindo lógica específica para cada caso.

### Impactos dessa abordagem

- O código exige registro manual de todos os handlers (`setRequestHandler`) para cada schema do protocolo (tools, resources, prompts, etc).
- É necessário listar explicitamente as tools, resources e templates, bem como implementar o parsing de URIs dinâmicas.
- O projeto serve como referência para quem deseja controle total sobre o ciclo de vida do servidor MCP, sendo ideal para provas de conceito, debugging e projetos que exigem customização avançada.

### Quando usar o modo manual?
- Quando o modo alto nível não expõe todas as capabilities necessárias.
- Quando é preciso garantir compatibilidade com clients MCP, Inspector ou outros consumidores do protocolo.
- Quando se deseja lógica customizada para autenticação, autorização, logging ou integração com sistemas externos.

---

## 1. Separação dos Prompts em um Módulo

- **O que fazer:**
  - Criar um arquivo `prompts.js` (ou `prompts.handlers.js`) contendo:
    - O objeto `prompts` (metadados dos prompts)
    - O objeto `promptHandlers` (funções que geram as mensagens dos prompts)
- **Como usar:**
  - Importar ambos no `index.js` e usar nos handlers de prompts.
- **Benefícios:**
  - Facilita a adição de novos prompts.
  - Mantém o arquivo principal mais limpo.

## 2. Separação dos Resources e Resource Templates

- **O que fazer:**
  - Criar um arquivo `resources.js` (ou `resources.handlers.js`) contendo:
    - Definição dos resources estáticos e dinâmicos (templates)
    - Funções auxiliares para parsing e validação de URIs
- **Como usar:**
  - Importar no `index.js` e usar nos handlers de resources.
- **Benefícios:**
  - Centraliza a lógica de resources, facilitando manutenção e expansão.

## 3. Centralização dos Handlers em uma Função de Setup

- **O que fazer:**
  - Criar um arquivo `handlers.js` com uma função `setupHandlers(server)`.
  - Essa função registra todos os handlers de tools, resources e prompts.
- **Como usar:**
  - No `index.js`, basta chamar `setupHandlers(server)` após criar o servidor.
- **Benefícios:**
  - Deixa o `index.js` enxuto e focado apenas na inicialização.
  - Facilita testes e reuso dos handlers.

## 4. Centralização de Schemas e Metadados

- **O que fazer:**
  - Opcionalmente, criar arquivos para schemas de validação de inputs das tools/prompts/resources.
- **Benefícios:**
  - Facilita reuso, documentação e futuras validações automáticas.

## 5. Padronização de Mensagens de Erro

- **O que fazer:**
  - Criar uma função utilitária para mensagens de erro padronizadas.
  - Exemplo: `throwError('Tool não encontrada', { tool: name })`
- **Benefícios:**
  - Facilita manutenção, logging e internacionalização.

## 6. Documentação Inline e JSDoc

- **O que fazer:**
  - Adicionar comentários JSDoc nos handlers e funções principais.
- **Benefícios:**
  - Melhora a compreensão do código por outros desenvolvedores.

---

## Exemplo de Estrutura Modularizada

```
/tools.handlers.js
/prompts.js
/resources.js
/handlers.js      // setupHandlers(server)
/index.js
```

---

## Etapas sugeridas

1. Separar prompts e seus handlers em `prompts.js`.
2. Separar resources e templates em `resources.js`.
3. Criar `handlers.js` para centralizar o registro dos handlers.
4. Refatorar o `index.js` para importar e usar apenas a função de setup.
5. (Opcional) Centralizar schemas e utilitários de erro.
6. Adicionar comentários JSDoc.

---

## Benefícios gerais
- Código mais limpo e modular.
- Facilidade para adicionar novas features.
- Melhor organização para equipes e projetos maiores.
- Facilita testes e manutenção.

---

Siga as etapas conforme sua prioridade e disponibilidade. Se quiser exemplos práticos de cada etapa, peça por aqui! 