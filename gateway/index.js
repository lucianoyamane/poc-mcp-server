import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { MCPGatewayClient } from './mcpClient.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.GATEWAY_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Armazenamento em memória para sessões (em produção, use Redis ou banco de dados)
const sessions = new Map();

// Cliente MCP global (uma instância para todos os usuários)
let mcpClient = null;

// Inicializar cliente MCP
async function initializeMCP() {
    try {
        mcpClient = new MCPGatewayClient();
        const serverPath = path.join(__dirname, '../index.js');
        await mcpClient.connectToServer(serverPath);
        console.log('✅ Cliente MCP inicializado com sucesso');
    } catch (error) {
        console.error('❌ Erro ao inicializar cliente MCP:', error);
        process.exit(1);
    }
}

// Middleware para verificar se MCP está conectado
function requireMCP(req, res, next) {
    if (!mcpClient || !mcpClient.isConnected) {
        return res.status(503).json({ 
            error: 'Serviço MCP não disponível',
            message: 'O servidor MCP não está conectado. Tente novamente em alguns segundos.'
        });
    }
    next();
}

// Rotas da API

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        mcpConnected: mcpClient?.isConnected || false,
        timestamp: new Date().toISOString()
    });
});

// Iniciar nova sessão de chat
app.post('/api/chat/session', requireMCP, (req, res) => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session = {
        id: sessionId,
        messages: [],
        createdAt: new Date(),
        lastActivity: new Date()
    };
    
    sessions.set(sessionId, session);
    
    res.json({ 
        sessionId,
        message: 'Sessão de chat criada com sucesso'
    });
});

// Enviar mensagem para o chat
app.post('/api/chat/message', requireMCP, async (req, res) => {
    try {
        const { sessionId, message } = req.body;
        
        if (!sessionId || !message) {
            return res.status(400).json({ 
                error: 'Parâmetros inválidos',
                message: 'sessionId e message são obrigatórios'
            });
        }

        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(404).json({ 
                error: 'Sessão não encontrada',
                message: 'A sessão de chat não existe ou expirou'
            });
        }

        // Adicionar mensagem do usuário ao histórico
        session.messages.push({
            role: 'user',
            content: message,
            timestamp: new Date()
        });

        session.lastActivity = new Date();

        // Processar mensagem com MCP (remover timestamp das mensagens)
        const messagesForMCP = session.messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        const response = await mcpClient.processQuery(messagesForMCP);

        // Adicionar resposta do assistente ao histórico
        session.messages.push({
            role: 'assistant',
            content: response,
            timestamp: new Date()
        });

        res.json({
            sessionId,
            response,
            messageCount: session.messages.length
        });

    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        res.status(500).json({ 
            error: 'Erro interno',
            message: 'Falha ao processar mensagem. Tente novamente.'
        });
    }
});

// Obter histórico de mensagens
app.get('/api/chat/history/:sessionId', requireMCP, (req, res) => {
    const { sessionId } = req.params;
    
    const session = sessions.get(sessionId);
    if (!session) {
        return res.status(404).json({ 
            error: 'Sessão não encontrada',
            message: 'A sessão de chat não existe ou expirou'
        });
    }

    res.json({
        sessionId,
        messages: session.messages,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity
    });
});

// Listar resources disponíveis
app.get('/api/resources', requireMCP, async (req, res) => {
    try {
        const resources = await mcpClient.listResources();
        res.json(resources);
    } catch (error) {
        console.error('Erro ao listar resources:', error);
        res.status(500).json({ 
            error: 'Erro interno',
            message: 'Falha ao listar resources'
        });
    }
});

// Listar tools disponíveis
app.get('/api/tools', requireMCP, async (req, res) => {
    try {
        res.json({
            tools: mcpClient.tools,
            count: mcpClient.tools.length,
            connected: mcpClient.isConnected
        });
    } catch (error) {
        console.error('Erro ao listar tools:', error);
        res.status(500).json({ 
            error: 'Erro interno',
            message: 'Falha ao listar tools'
        });
    }
});

// Listar prompts disponíveis
app.get('/api/prompts', requireMCP, async (req, res) => {
    try {
        const prompts = await mcpClient.listPrompts();
        res.json(prompts);
    } catch (error) {
        console.error('Erro ao listar prompts:', error);
        res.status(500).json({ 
            error: 'Erro interno',
            message: 'Falha ao listar prompts'
        });
    }
});

// Executar prompt
app.post('/api/prompts/execute', requireMCP, async (req, res) => {
    try {
        const { name, arguments: args } = req.body;
        
        if (!name) {
            return res.status(400).json({ 
                error: 'Parâmetros inválidos',
                message: 'Nome do prompt é obrigatório'
            });
        }

        const promptResult = await mcpClient.getPrompt({ name, arguments: args || {} });
        res.json(promptResult);
    } catch (error) {
        console.error('Erro ao executar prompt:', error);
        res.status(500).json({ 
            error: 'Erro interno',
            message: 'Falha ao executar prompt'
        });
    }
});

// Ler resource
app.post('/api/resources/read', requireMCP, async (req, res) => {
    try {
        const { uri } = req.body;
        
        if (!uri) {
            return res.status(400).json({ 
                error: 'Parâmetros inválidos',
                message: 'URI do resource é obrigatória'
            });
        }

        const resource = await mcpClient.readResource({ uri });
        res.json(resource);
    } catch (error) {
        console.error('Erro ao ler resource:', error);
        res.status(500).json({ 
            error: 'Erro interno',
            message: 'Falha ao ler resource'
        });
    }
});

// Limpar sessões antigas (executar a cada 30 minutos)
setInterval(() => {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    
    for (const [sessionId, session] of sessions.entries()) {
        if (session.lastActivity < thirtyMinutesAgo) {
            sessions.delete(sessionId);
            console.log(`Sessão ${sessionId} removida por inatividade`);
        }
    }
}, 30 * 60 * 1000);

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Encerrando gateway...');
    if (mcpClient) {
        await mcpClient.cleanup();
    }
    process.exit(0);
});

// Inicializar e iniciar servidor
async function startServer() {
    await initializeMCP();
    
    app.listen(PORT, () => {
        console.log(`🚀 Gateway HTTP rodando na porta ${PORT}`);
        console.log(`📡 Endpoints disponíveis:`);
        console.log(`   - POST /api/chat/session - Criar sessão`);
        console.log(`   - POST /api/chat/message - Enviar mensagem`);
        console.log(`   - GET  /api/chat/history/:sessionId - Histórico`);
        console.log(`   - GET  /api/resources - Listar resources`);
        console.log(`   - GET  /api/prompts - Listar prompts`);
        console.log(`   - POST /api/prompts/execute - Executar prompt`);
        console.log(`   - POST /api/resources/read - Ler resource`);
        console.log(`   - GET  /api/health - Health check`);
    });
}

startServer().catch(console.error); 