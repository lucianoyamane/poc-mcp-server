import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";
import readline from "readline/promises";
import { AnthropicHelper } from "./anthropicHelper.js";
dotenv.config(); // load environment variables from .env
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
}
class MCPClient {
    mcp;
    anthropicHelper;
    transport = null;
    tools = [];
    messages = [];
    constructor() {
        // Initialize AnthropicHelper e MCP client
        this.anthropicHelper = new AnthropicHelper();
        this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
        this.messages = [];
    }
    async connectToServer(serverScriptPath) {
        /**
         * Connect to an MCP server
         *
         * @param serverScriptPath - Path to the server script (.py or .js)
         */
        try {
            // Determine script type and appropriate command
            const isJs = serverScriptPath.endsWith(".js");
            if (!isJs) {
                throw new Error("Server script must be a .js file");
            }
            const command = process.execPath;
            // Initialize transport and connect to server
            this.transport = new StdioClientTransport({
                command,
                args: [serverScriptPath],
            });
            this.mcp.connect(this.transport);
            // List available tools
            const toolsResult = await this.mcp.listTools();
            this.tools = toolsResult.tools.map((tool) => {
                return {
                    name: tool.name,
                    description: tool.description,
                    input_schema: tool.inputSchema,
                };
            });
            console.log("Connected to server with tools:", this.tools.map(({ name }) => name));
        }
        catch (e) {
            console.log("Failed to connect to MCP server: ", e);
            throw e;
        }
    }
    async processQuery() {
        /**
         * Processa a query usando Claude e as ferramentas disponíveis, mantendo o contexto da conversa
         */
        // Chamada inicial para o modelo Claude via helper
        const response = await this.anthropicHelper.sendMessage({
            messages: this.messages,
            tools: this.tools,
        });
        // Processa resposta e tool calls
        const finalText = [];
        const toolResults = [];
        for (const content of response.content) {
            if (content.type === "text") {
                this.messages.push({ role: "assistant", content: content.text });
                finalText.push(content.text);
            }
            else if (content.type === "tool_use") {
                // Executa chamada de ferramenta
                const toolName = content.name;
                const toolArgs = content.input;
                const result = await this.mcp.callTool({
                    name: toolName,
                    arguments: toolArgs,
                });
                toolResults.push(result);
                finalText.push(`[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`);
                // Continua a conversa com o resultado da ferramenta
                this.messages.push({
                    role: "user",
                    content: result.content,
                });
                // Nova chamada para o modelo Claude via helper
                const response = await this.anthropicHelper.sendMessage({
                    messages: this.messages,
                });
                if (response.content[0].type === "text") {
                    this.messages.push({ role: "assistant", content: response.content[0].text });
                    finalText.push(response.content[0].text);
                }
            }
        }
        return finalText.join("\n");
    }
    async chatLoop() {
        /**
         * Executa o loop de chat interativo
         */
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        try {
            console.log("\nMCP Client Started!");
            console.log("Type your queries, 'resources' to listar resources, or 'quit' to exit.");
            while (true) {
                const message = await rl.question("\nQuery: ");
                if (message.toLowerCase() === "quit") {
                    break;
                }
                if (message.toLowerCase() === "resources") {
                    const resources = await this.mcp.listResources();
                    console.log("\nResources disponíveis:");
                    for (const resource of resources.resources) {
                        console.log(`- ${resource.name}: ${resource.uriTemplate}`);
                    }
                    continue;
                }
                if (message.toLowerCase() === "prompts") {
                    const prompts = await this.mcp.listPrompts();
                    console.log("\nPrompts disponíveis:");
                    for (const prompt of prompts.prompts) {
                        console.log(`- ${prompt.name}: ${prompt.description}`);
                        if (prompt.arguments) {
                            for (const arg of prompt.arguments) {
                                console.log(`    • ${arg.name} (${arg.required ? 'obrigatório' : 'opcional'}): ${arg.description}`);
                            }
                        }
                    }
                    continue;
                }
                if (message.toLowerCase().startsWith("prompt ")) {
                    const [_, nomePrompt, ...argsArr] = message.split(" ");
                    const argsStr = argsArr.join(" ").trim();
                    let args = {};
                    if (argsStr) {
                        try {
                            args = JSON.parse(argsStr);
                        } catch (e) {
                            console.log("Argumentos inválidos. Use JSON válido, exemplo: prompt explicar-regras {\"jogo\":\"pôquer\"}");
                            continue;
                        }
                    }
                    try {
                        const promptResult = await this.mcp.getPrompt({ name: nomePrompt, arguments: args });
                        console.log("\nMensagem(s) do prompt:");
                        for (const msg of promptResult.messages) {
                            if (msg.content && typeof msg.content === 'object' && 'text' in msg.content) {
                                console.log(`- ${msg.role}: ${msg.content.text}`);
                            } else {
                                console.log(`- ${msg.role}:`, msg.content);
                            }
                        }
                    } catch (err) {
                        console.log("Erro ao consumir prompt:", err.message);
                    }
                    continue;
                }
                if (message.toLowerCase().startsWith("resource ")) {
                    const uri = message.substring("resource ".length).trim();
                    try {
                        const resource = await this.mcp.readResource({ uri });
                        console.log("\nConteúdo do resource:");
                        for (const content of resource.contents) {
                            console.log(`- URI: ${content.uri}`);
                            console.log(content.text);
                        }
                    } catch (err) {
                        console.log("Erro ao ler resource:", err.message);
                    }
                    continue;
                }
                // Matching natural para o prompt 'explicar-regras'
                const matchExpRegras = message.toLowerCase().match(/^explique as regras do (.+)$/);
                if (matchExpRegras) {
                    const jogo = matchExpRegras[1].trim();
                    try {
                        const promptResult = await this.mcp.getPrompt({ name: "explicar-regras", arguments: { jogo } });
                        // Envie a mensagem do prompt para o modelo Claude
                        const promptMessages = promptResult.messages.map(m => ({
                            role: m.role,
                            content: typeof m.content === 'object' && 'text' in m.content ? m.content.text : m.content
                        }));
                        const response = await this.anthropicHelper.sendMessage({
                            messages: promptMessages,
                            tools: this.tools,
                        });
                        for (const content of response.content) {
                            if (content.type === "text") {
                                console.log("\nResposta do modelo:");
                                console.log(content.text);
                            }
                        }
                    } catch (err) {
                        console.log("Erro ao consumir prompt:", err.message);
                    }
                    continue;
                }
                this.messages.push({ role: "user", content: message });
                const response = await this.processQuery();
                console.log("\n" + response);
            }
        }
        finally {
            rl.close();
        }
    }
    async cleanup() {
        /**
         * Clean up resources
         */
        await this.mcp.close();
    }
}
async function main() {
    if (process.argv.length < 3) {
        console.log("Usage: node build/index.js <path_to_server_script>");
        return;
    }
    const mcpClient = new MCPClient();
    try {
        await mcpClient.connectToServer(process.argv[2]);
        await mcpClient.chatLoop();
    }
    finally {
        await mcpClient.cleanup();
    }
}
main();
