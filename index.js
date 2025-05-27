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

const transport = new StdioServerTransport();
server.connect(transport);

console.log("Servidor MCP conectado e aguardando comandos..."); 