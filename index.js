import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import { comprarCartas, criarBaralho, embaralharBaralho } from "./handlers.js";
import { comprarCartasSchema, criarBaralhoSchema, embaralharBaralhoSchema } from "./schemas.js";
import { comprarCartasMeta, criarBaralhoMeta, embaralharBaralhoMeta } from "./toolsMeta.js";
dotenv.config();

// Criação do servidor MCP
const server = new McpServer({
  name: "deck-of-cards",
  version: "1.0.0"
});

server.tool(
  criarBaralhoMeta.name,
  criarBaralhoMeta.description,
  criarBaralhoSchema,
  criarBaralho
);

server.tool(
  embaralharBaralhoMeta.name,
  embaralharBaralhoMeta.description,
  embaralharBaralhoSchema,
  embaralharBaralho
);

server.tool(
  comprarCartasMeta.name,
  comprarCartasMeta.description,
  comprarCartasSchema,
  comprarCartas
);

server.tool(
  "comprar_cartas_prompt_tool",
  "Simula a lógica do prompt para perguntar quantas cartas comprar.",
  { deck_id: embaralharBaralhoSchema.deck_id },
  async ({ deck_id }) => {
    return {
      content: [{
        type: "text",
        text: `Quantas cartas você deseja comprar do baralho ${deck_id}? (simulação de prompt)`
      }]
    };
  }
);

const transport = new StdioServerTransport();
server.connect(transport);

console.log("Servidor MCP conectado e aguardando comandos..."); 