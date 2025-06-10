# poc-mcp-server

## Descrição

Este projeto é uma prova de conceito de um servidor MCP (Model Context Protocol) que integra com a API pública deckofcardsapi.com para criar, embaralhar e comprar cartas de baralhos. O projeto está modularizado para facilitar manutenção e extensões.

## Estrutura do Projeto

- `index.js`: Ponto de entrada do servidor MCP. Registra as ferramentas (tools) e faz a configuração inicial.
- `handlers.js`: Contém as funções (handlers) que implementam a lógica de cada ferramenta.
- `schemas.js`: Define os schemas de validação dos parâmetros usando Zod.
- `toolsMeta.js`: Centraliza os nomes e descrições das ferramentas.
- `.env`: Arquivo de variáveis de ambiente (exemplo: URL base da API de baralhos).
- `test.js`: Script de teste automatizado para validar as ferramentas.

## Instalação

1. Clone o repositório:
   ```bash
   git clone <url-do-repo>
   cd poc-mcp-server-deck-of-cards
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na raiz do projeto (opcional):
   ```env
   DECK_API_BASE_URL=https://deckofcardsapi.com/api/deck
   ```

## Como rodar o servidor

```bash
npm start
```

O servidor MCP será iniciado e aguardará comandos via transporte STDIO.

## Como rodar os testes

```bash
npm test
```

O script `test.js` irá:
- Criar um baralho
- Comprar cartas do baralho
- Simular a lógica de prompt como uma tool

## Como funciona

- As ferramentas (tools) são registradas no servidor MCP e expostas para clientes MCP.
- Os handlers implementam a lógica de integração com a API deckofcardsapi.com.
- Os schemas garantem a validação dos parâmetros recebidos.
- O projeto utiliza dotenv para configuração flexível da URL base da API.

## Client MCP (CLI)

O projeto inclui um client MCP em Node.js na pasta `client`, que permite interagir com o servidor MCP via linha de comando, utilizando o modelo Claude (Anthropic) para processar linguagem natural e acionar ferramentas do servidor.

### Instalação das dependências do client

```bash
cd client
npm install
```

### Configuração

Crie um arquivo `.env` na pasta `client` com sua chave da API do Anthropic:

```env
ANTHROPIC_API_KEY=sua-chave-aqui
```

### Como executar o client

Com o servidor MCP rodando, execute o client passando o caminho do script do servidor MCP (por exemplo, `../index.js`):

```bash
node index.js <caminho_para_o_servidor_MCP>
```

Exemplo:

```bash
node index.js ../index.js
```

### Funcionamento

- O client conecta ao servidor MCP via transporte STDIO.
- Descobre e lista as ferramentas disponíveis.
- Permite enviar queries em linguagem natural, que são processadas pelo Claude.
- Se o modelo solicitar o uso de ferramentas, o client executa as chamadas e retorna os resultados ao modelo, continuando a conversa.
- Para sair, digite `quit` no prompt.

### Exemplo de uso

```bash
$ node index.js ../index.js
MCP Client Started!
Type your queries or 'quit' to exit.

Query: Quero criar um baralho e comprar 5 cartas.
[resposta do modelo com o resultado das operações]
```

> **Obs:** O client pode ser adaptado para outros modelos ou interfaces conforme necessário.

## Observações sobre prompt

- O suporte a prompts reais depende de um client MCP com interface humana (chat, web, etc).
- No momento, a lógica de prompt está simulada como uma tool para facilitar testes automatizados.

## Dependências principais
- `@modelcontextprotocol/sdk`
- `dotenv`
- `node-fetch`
- `zod`

## Customização
- Para adicionar novas ferramentas, crie o handler, schema e meta, e registre no `index.js`.
- Para mudar a URL da API, edite o arquivo `.env`.

## Explicação da configuração "deck" no mcp.json

No arquivo `mcp.json`, a configuração do servidor MCP chamada `deck` serve para rodar o seu servidor de baralho de cartas diretamente pelo Cursor:

```json
"deck": {
  "command": "node",
  "args": ["<CAMINHO_ABSOLUTO_DO_PROJETO>/index.js"]
}
```

- **deck**: Nome do servidor MCP relacionado ao baralho de cartas.
- **command**: Usa o Node.js para rodar o servidor.
- **args**: Caminho absoluto para o arquivo principal do projeto (`index.js`).
  - Substitua `<CAMINHO_ABSOLUTO_DO_PROJETO>` pelo caminho correto no seu ambiente.

Quando você inicia o servidor `deck` pelo Cursor, ele executa:

```bash
node <CAMINHO_ABSOLUTO_DO_PROJETO>/index.js
```

Assim, seu servidor MCP de baralho fica disponível para receber comandos e interações conforme definido no código.

No Cursor, basta selecionar o servidor `deck` e clicar para iniciar, acompanhando os logs e interações diretamente pela interface.

---

Se tiver dúvidas ou quiser expandir o projeto, fique à vontade para contribuir!

## Exemplo de uso: Simulando uma jogada de pôquer

Abaixo está um exemplo de prompt em linguagem natural para simular uma jogada de pôquer Texas Hold'em utilizando o servidor MCP:

> Eu gostaria de simular um jogo de pôquer Texas Hold'em com 4 jogadores, onde cada jogador recebe duas cartas e 5 cartas comunitárias são reveladas na mesa.

Esse prompt solicita ao servidor MCP que:
- Crie um baralho novo
- Embaralhe o baralho
- Distribua 2 cartas para cada um dos 4 jogadores
- Revele 5 cartas comunitárias na mesa (como no Texas Hold'em)

A resposta esperada será um objeto JSON contendo as cartas de cada jogador e as cartas da mesa, por exemplo:

```json
{
  "jogadores": {
    "jogador_1": ["AS", "KD"],
    "jogador_2": ["10H", "9C"],
    "jogador_3": ["2D", "7S"],
    "jogador_4": ["JC", "5H"]
  },
  "mesa": ["3C", "8D", "QS", "4H", "6S"]
}
```

> **Obs:** Você pode adaptar o prompt em linguagem natural conforme desejar, mudando o número de jogadores ou o formato da partida.
