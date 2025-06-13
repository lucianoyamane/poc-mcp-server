import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { comprarCartas, criarBaralho, embaralharBaralho } from "./handlers.js";
dotenv.config();

// Criação do servidor MCP (baixo nível)
const server = new Server(
  {
    name: "deck-of-cards",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);


// Handler para chamada de tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (name === "criar_baralho") {
    return await criarBaralho(args);
  }
  if (name === "embaralhar_baralho") {
    return await embaralharBaralho(args);
  }
  if (name === "comprar_cartas") {
    return await comprarCartas(args);
  }
  if (name === "adicionar_pilha") {
    // Tool para criar/adicionar cartas a uma pilha
    const { deck_id, pile_name, cards } = args;
    if (!deck_id || !pile_name || !cards) {
      throw new Error("Parâmetros obrigatórios: deck_id, pile_name, cards");
    }
    const DECK_API_BASE_URL = process.env.DECK_API_BASE_URL || "https://deckofcardsapi.com/api/deck";
    const url = `${DECK_API_BASE_URL}/${deck_id}/pile/${pile_name}/add/?cards=${cards}`;
    const response = await fetch(url);
    const data = await response.json();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
        },
      ],
    };
  }
  if (name === "embaralhar_pilha") {
    // Tool para embaralhar uma pilha específica
    const { deck_id, pile_name } = args;
    if (!deck_id || !pile_name) {
      throw new Error("Parâmetros obrigatórios: deck_id, pile_name");
    }
    const DECK_API_BASE_URL = process.env.DECK_API_BASE_URL || "https://deckofcardsapi.com/api/deck";
    const url = `${DECK_API_BASE_URL}/${deck_id}/pile/${pile_name}/shuffle/`;
    const response = await fetch(url);
    const data = await response.json();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
        },
      ],
    };
  }
  throw new Error("Tool não encontrada: " + name);
});

// Handler para listar resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "deck://{deckId}/pile/{pileName}/list",
        name: "deck-pile-list",
        description: "Lista as cartas de uma pilha específica de um baralho",
        mimeType: "application/json",
      },
    ],
  };
});

// Handler para ler resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  // Parse da URI para extrair deckId e pileName
  const match = uri.match(/^deck:\/\/([^/]+)\/pile\/([^/]+)\/list$/);
  if (!match) {
    throw new Error("Resource URI inválida");
  }
  const deckId = match[1];
  const pileName = match[2];
  const DECK_API_BASE_URL = process.env.DECK_API_BASE_URL || "https://deckofcardsapi.com/api/deck";
  const url = `${DECK_API_BASE_URL}/${deckId}/pile/${pileName}/list/`;
  const response = await fetch(url);
  const data = await response.json();
  return {
    contents: [
      {
        uri,
        text: JSON.stringify(data),
      },
    ],
  };
});

// Handler para listar tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "criar_baralho",
        description: "Cria um novo baralho de cartas",
        inputSchema: {
          type: "object",
          properties: {
            deck_count: { type: "number", description: "Quantidade de baralhos", default: 1 }
          },
          required: [],
        },
      },
      {
        name: "embaralhar_baralho",
        description: "Embaralha um baralho existente",
        inputSchema: {
          type: "object",
          properties: {
            deck_id: { type: "string", description: "ID do baralho" }
          },
          required: ["deck_id"],
        },
      },
      {
        name: "comprar_cartas",
        description: "Compra cartas de um baralho",
        inputSchema: {
          type: "object",
          properties: {
            deck_id: { type: "string", description: "ID do baralho" },
            count: { type: "number", description: "Quantidade de cartas a comprar", default: 1 }
          },
          required: ["deck_id"],
        },
      },
      {
        name: "adicionar_pilha",
        description: "Adiciona cartas a uma pilha de um baralho (cria a pilha se não existir)",
        inputSchema: {
          type: "object",
          properties: {
            deck_id: { type: "string", description: "ID do baralho" },
            pile_name: { type: "string", description: "Nome da pilha" },
            cards: { type: "string", description: "Cartas a adicionar (ex: 'AS,2S')" }
          },
          required: ["deck_id", "pile_name", "cards"],
        },
      },
      {
        name: "embaralhar_pilha",
        description: "Embaralha uma pilha específica de um baralho",
        inputSchema: {
          type: "object",
          properties: {
            deck_id: { type: "string", description: "ID do baralho" },
            pile_name: { type: "string", description: "Nome da pilha" }
          },
          required: ["deck_id", "pile_name"],
        },
      },
    ],
  };
});

// Handler para listar templates de resources dinâmicos
server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
  return {
    resourceTemplates: [
      {
        uriTemplate: "deck://{deckId}/pile/{pileName}/list",
        name: "deck-pile-list",
        description: "Lista as cartas de uma pilha específica de um baralho",
        mimeType: "application/json",
      },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);

console.error("Servidor MCP (manual) conectado e aguardando comandos..."); 