# poc-mcp-server

## Descrição

Este projeto é uma prova de conceito de um servidor MCP (Model Context Protocol) que integra com a API pública deckofcardsapi.com para criar, embaralhar, comprar cartas de baralhos, manipular pilhas e interagir via prompts. O projeto está modularizado para facilitar manutenção e extensões.

## Estrutura do Projeto

- `index.js`: Ponto de entrada do servidor MCP. Registra as ferramentas (tools), resources dinâmicos e prompts.
- `handlers.js`: Contém as funções (handlers) que implementam a lógica de cada ferramenta.
- `schemas.js`: Define os schemas de validação dos parâmetros usando Zod.
- `toolsMeta.js`: Centraliza os nomes e descrições das ferramentas.
- `.env`: Arquivo de variáveis de ambiente (exemplo: URL base da API de baralhos).
- `test.js`: Script de teste automatizado para validar as ferramentas.
- `client/`: Client MCP CLI para interagir com o servidor.
- `docs/`: Documentação e problemas conhecidos.

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

- As ferramentas (**tools**), **resources** e **prompts** são registrados manualmente usando o modelo baixo nível do MCP Server.
- Os handlers implementam a lógica de integração com a API deckofcardsapi.com.
- Os schemas garantem a validação dos parâmetros recebidos.
- O projeto utiliza dotenv para configuração flexível da URL base da API.

## Tools disponíveis

- `criar_baralho`: Cria um novo baralho de cartas.
- `embaralhar_baralho`: Embaralha um baralho existente.
- `comprar_cartas`: Compra cartas de um baralho.
- `adicionar_pilha`: Adiciona cartas a uma pilha de um baralho (cria a pilha se não existir).
- `embaralhar_pilha`: Embaralha uma pilha específica de um baralho.

### Exemplo de uso da tool `adicionar_pilha`

```json
{
  "deck_id": "c7ji4ar6dxti",
  "pile_name": "teste",
  "cards": "AS,2S"
}
```

## Resources dinâmicos

O servidor expõe um resource dinâmico para listar as cartas de uma pilha específica de um baralho:

- **Template:** `deck://{deckId}/pile/{pileName}/list`
- **Como usar:**
  - Preencha os parâmetros `deckId` e `pileName` para montar a URI, por exemplo:
    - `deck://c7ji4ar6dxti/pile/teste/list`
  - Consulte esse resource pelo client MCP ou pelo inspector.

## Prompts MCP

O servidor expõe prompts para padronizar interações e facilitar fluxos conversacionais com LLMs. Os prompts disponíveis são:

- **explicar-regras**: Explica as regras de um jogo de cartas.
  - Argumentos: `jogo` (nome do jogo de cartas)
  - Exemplo: `{ "jogo": "pôquer" }`
- **sugerir-jogada**: Sugere a melhor jogada com base nas cartas informadas.
  - Argumentos: `cartas` (ex: "AS, KD, 10H, 9C")
  - Exemplo: `{ "cartas": "AS, KD, 10H, 9C" }`
- **simular-partida**: Simula uma partida de um jogo de cartas com N jogadores.
  - Argumentos: `jogo`, `jogadores`
  - Exemplo: `{ "jogo": "blackjack", "jogadores": 3 }`
- **mensagem-personalizada**: Gera uma mensagem de boas-vindas ou parabéns para um jogador.
  - Argumentos: `nome`, `tipo` (ex: "boas-vindas", "parabéns")
  - Exemplo: `{ "nome": "João", "tipo": "boas-vindas" }`

### Como testar prompts

- No [MCP Inspector](https://github.com/modelcontextprotocol/inspector), acesse a aba **Prompts**.
- Escolha um prompt, preencha os argumentos e veja a mensagem gerada.
- Você pode integrar prompts em fluxos de LLMs para padronizar perguntas e respostas.

## Testando com o MCP Inspector

Você pode testar o servidor e suas capabilities com o [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
npx @modelcontextprotocol/inspector node index.js
```

- Acesse a aba **Tools** para testar as ferramentas disponíveis.
- Acesse a aba **Resource Templates** para testar o resource dinâmico, preenchendo os parâmetros necessários.
- Acesse a aba **Prompts** para testar prompts e gerar mensagens customizadas.

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
- Permite enviar queries em linguagem natural, que são processadas pelo Claude.
- Para sair, digite `quit` no prompt.
- Para listar as tools disponíveis, digite `resources` ou `tools` (dependendo do comando implementado).
- Para consumir um resource dinâmico, digite:
  ```
  resource deck://<deck_id>/pile/<pile_name>/list
  ```

### Exemplo de uso

```bash
$ node index.js ../index.js
MCP Client Started!
Type your queries, 'resources' to listar resources, or 'quit' to exit.

Query: Quero criar um baralho e comprar 5 cartas.
[resposta do modelo com o resultado das operações]

Query: resource deck://c7ji4ar6dxti/pile/teste/list
[resposta com as cartas da pilha 'teste']
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
- Para adicionar novas ferramentas ou prompts, edite o handler correspondente no `index.js`.
- Para mudar a URL da API, edite o arquivo `.env`.

## Problemas conhecidos
Consulte a pasta `docs/` para problemas conhecidos e dicas de solução.

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
