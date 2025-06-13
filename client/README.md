# MCP Client CLI — Deck of Cards (Demonstração)

Este client é uma interface de linha de comando (CLI) para interagir com um servidor MCP (Model Context Protocol) que integra com a API pública deckofcardsapi.com. O objetivo é demonstrar como um client MCP pode consumir **tools**, **resources** e **prompts** de forma interativa, incluindo suporte a linguagem natural para prompts.

---

## Funcionalidades

- **Interação via linha de comando** com o servidor MCP.
- **Consumo de tools** (ferramentas) para criar, embaralhar, comprar cartas, manipular pilhas, etc.
- **Leitura de resources** dinâmicos (ex: listar cartas de uma pilha).
- **Consumo de prompts** MCP, inclusive por linguagem natural (ex: "Explique as regras do pôquer").
- **Listagem de tools, resources e prompts** disponíveis.
- **Integração com o modelo Claude (Anthropic)** para processar queries em linguagem natural.

---

## Instalação

1. Acesse a pasta do client:
   ```bash
   cd client
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` com sua chave da API do Anthropic:
   ```env
   ANTHROPIC_API_KEY=sua-chave-aqui
   ```

---

## Como executar

Com o servidor MCP rodando (ex: `../index.js`), execute:

```bash
node index.js <caminho_para_o_servidor_MCP>
```

Exemplo:
```bash
node index.js ../index.js
```

---

## Comandos disponíveis no chat

- **Queries em linguagem natural:**
  - Exemplo: `Quero criar um baralho e comprar 5 cartas.`
- **Listar tools/resources/prompts:**
  - `resources` — lista os resources disponíveis
  - `prompts` — lista os prompts disponíveis
- **Consumir resource diretamente:**
  - `resource <uri>`
  - Exemplo: `resource deck://c7ji4ar6dxti/pile/teste/list`
- **Consumir prompt diretamente:**
  - `prompt <nome> <json_de_argumentos>`
  - Exemplo: `prompt explicar-regras {"jogo":"pôquer"}`
- **Comandos naturais para prompts:**
  - `Explique as regras do pôquer`
  - `Melhor jogada com AS, KD, 10H, 9C`
  - `Simule uma partida de blackjack com 3 jogadores`
  - `Envie uma mensagem de boas-vindas para João`
- **Sair:**
  - `quit`

---

## Exemplos de uso

### 1. Criar e manipular baralho
```
Query: Quero criar um baralho e comprar 5 cartas.
```

### 2. Listar resources
```
Query: resources
```

### 3. Consumir resource dinâmico
```
Query: resource deck://c7ji4ar6dxti/pile/teste/list
```

### 4. Listar prompts
```
Query: prompts
```

### 5. Consumir prompt diretamente
```
Query: prompt explicar-regras {"jogo":"pôquer"}
```

### 6. Usar prompts por linguagem natural
```
Query: Explique as regras do pôquer
Query: Melhor jogada com AS, KD, 10H, 9C
Query: Simule uma partida de blackjack com 3 jogadores
Query: Envie uma mensagem de boas-vindas para João
```

---

## Scripts disponíveis

Você pode usar os scripts definidos no `package.json` para facilitar o uso do client:

- **start**
  - Executa o client MCP apontando para o servidor MCP padrão (`../index.js`).
  - Exemplo:
    ```bash
    npm start
    ```

---

## Observações

- O client mantém o contexto da conversa, permitindo follow-ups naturais.
- O suporte a prompts por linguagem natural é demonstrativo e pode ser expandido para outros padrões.
- O client pode ser adaptado para outros modelos ou servidores MCP.

---

## Sobre o projeto

Este client foi desenvolvido para fins de demonstração e aprendizado sobre o protocolo MCP, integração com LLMs e boas práticas de CLI conversacional.

Fique à vontade para adaptar, expandir ou contribuir! 