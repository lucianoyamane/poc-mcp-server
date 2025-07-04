import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { AnthropicHelper } from "./anthropicHelper.js";

export class MCPGatewayClient {
    constructor() {
        this.mcp = new Client({ name: "mcp-gateway-client", version: "1.0.0" });
        this.anthropicHelper = new AnthropicHelper();
        this.transport = null;
        this.tools = [];
        this.isConnected = false;
    }

    async connectToServer(serverScriptPath) {
        try {
            const command = process.execPath;
            this.transport = new StdioClientTransport({
                command,
                args: [serverScriptPath],
            });
            
            this.mcp.connect(this.transport);
            
            // List available tools
            const toolsResult = await this.mcp.listTools();
            this.tools = toolsResult.tools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                input_schema: tool.inputSchema,
            }));
            
            this.isConnected = true;
            console.log("Gateway conectado ao servidor MCP com tools:", this.tools.map(({ name }) => name));
        } catch (e) {
            console.error("Falha ao conectar ao servidor MCP:", e);
            throw e;
        }
    }

    async processQuery(messages) {
        if (!this.isConnected) {
            throw new Error("Cliente MCP não está conectado");
        }

        // Chamada inicial para o modelo Claude
        const response = await this.anthropicHelper.sendMessage({
            messages: messages,
            tools: this.tools,
        });

        const finalText = [];
        const toolResults = [];

        for (const content of response.content) {
            if (content.type === "text") {
                finalText.push(content.text);
            } else if (content.type === "tool_use") {
                // Executa chamada de ferramenta
                const toolName = content.name;
                const toolArgs = content.input;
                
                const result = await this.mcp.callTool({
                    name: toolName,
                    arguments: toolArgs,
                });
                
                toolResults.push(result);
                finalText.push(`[Ferramenta ${toolName} executada com sucesso]`);

                // Continua a conversa com o resultado da ferramenta
                const updatedMessages = [...messages, {
                    role: "user",
                    content: result.content,
                }];

                // Nova chamada para o modelo Claude
                const followUpResponse = await this.anthropicHelper.sendMessage({
                    messages: updatedMessages,
                });

                if (followUpResponse.content[0].type === "text") {
                    finalText.push(followUpResponse.content[0].text);
                }
            }
        }

        return finalText.join("\n");
    }

    async listResources() {
        if (!this.isConnected) {
            throw new Error("Cliente MCP não está conectado");
        }
        return await this.mcp.listResources();
    }

    async listPrompts() {
        if (!this.isConnected) {
            throw new Error("Cliente MCP não está conectado");
        }
        return await this.mcp.listPrompts();
    }

    async getPrompt(promptRequest) {
        if (!this.isConnected) {
            throw new Error("Cliente MCP não está conectado");
        }
        return await this.mcp.getPrompt(promptRequest);
    }

    async readResource(resourceRequest) {
        if (!this.isConnected) {
            throw new Error("Cliente MCP não está conectado");
        }
        return await this.mcp.readResource(resourceRequest);
    }

    async cleanup() {
        if (this.transport) {
            await this.transport.close();
        }
        this.isConnected = false;
    }
} 