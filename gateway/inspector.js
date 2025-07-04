import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runInspector() {
    console.log('🔍 Iniciando Inspector MCP...\n');
    
    const client = new Client({ 
        name: "mcp-inspector", 
        version: "1.0.0" 
    });
    
    try {
        // Conectar ao servidor MCP
        const serverPath = path.join(__dirname, '../index.js');
        const transport = new StdioClientTransport({
            command: process.execPath,
            args: [serverPath],
        });
        
        client.connect(transport);
        
        console.log('✅ Conectado ao servidor MCP\n');
        
        // Listar tools
        console.log('📋 TOOLS DISPONÍVEIS:');
        console.log('='.repeat(50));
        const toolsResult = await client.listTools();
        toolsResult.tools.forEach((tool, index) => {
            console.log(`${index + 1}. ${tool.name}`);
            console.log(`   Descrição: ${tool.description}`);
            console.log(`   Schema: ${JSON.stringify(tool.inputSchema, null, 2)}`);
            console.log('');
        });
        
        // Listar resources
        console.log('📁 RESOURCES DISPONÍVEIS:');
        console.log('='.repeat(50));
        const resourcesResult = await client.listResources();
        resourcesResult.resources.forEach((resource, index) => {
            console.log(`${index + 1}. ${resource.name}`);
            console.log(`   URI: ${resource.uri}`);
            console.log(`   Descrição: ${resource.description}`);
            console.log(`   MIME Type: ${resource.mimeType}`);
            console.log('');
        });
        
        // Listar prompts
        console.log('💬 PROMPTS DISPONÍVEIS:');
        console.log('='.repeat(50));
        const promptsResult = await client.listPrompts();
        promptsResult.prompts.forEach((prompt, index) => {
            console.log(`${index + 1}. ${prompt.name}`);
            console.log(`   Descrição: ${prompt.description}`);
            if (prompt.arguments) {
                console.log('   Argumentos:');
                prompt.arguments.forEach(arg => {
                    console.log(`     - ${arg.name} (${arg.required ? 'obrigatório' : 'opcional'}): ${arg.description}`);
                });
            }
            console.log('');
        });
        
        // Testar uma tool
        console.log('🧪 TESTANDO TOOL: criar_baralho');
        console.log('='.repeat(50));
        const testResult = await client.callTool({
            name: "criar_baralho",
            arguments: {}
        });
        console.log('Resultado:', JSON.stringify(testResult, null, 2));
        
        // Testar um prompt
        console.log('\n🧪 TESTANDO PROMPT: explicar-regras');
        console.log('='.repeat(50));
        const promptResult = await client.getPrompt({
            name: "explicar-regras",
            arguments: { jogo: "pôquer" }
        });
        console.log('Resultado:', JSON.stringify(promptResult, null, 2));
        
        await transport.close();
        console.log('\n✅ Inspector finalizado');
        
    } catch (error) {
        console.error('❌ Erro no inspector:', error);
        process.exit(1);
    }
}

runInspector(); 