import { Bot, Loader2, RefreshCw, Send, Settings, Sparkles, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { chatAPI, mcpAPI } from '../config/api';

const Chat = () => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [tools, setTools] = useState([]);
  const [showTools, setShowTools] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Função para criar nova sessão
  const createNewSession = async () => {
    try {
      // Limpar localStorage
      localStorage.removeItem('chatSessionId');
      
      // Criar nova sessão
      const sessionResponse = await chatAPI.createSession();
      const newSessionId = sessionResponse.data.sessionId;
      setSessionId(newSessionId);
      
      // Salvar nova sessionId
      localStorage.setItem('chatSessionId', newSessionId);
      
      // Adicionar mensagem de boas-vindas
      setMessages([
        {
          role: 'assistant',
          content: 'Nova sessão iniciada! Sou seu assistente especializado em jogos de cartas. Posso ajudar você a:\n\n• Criar e gerenciar baralhos\n• Explicar regras de jogos\n• Sugerir jogadas\n• Simular partidas\n\nComo posso ajudar você hoje?',
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Erro ao criar nova sessão:', error);
    }
  };

  // Inicializar sessão e verificar conexão
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Verificar health da API
        const healthResponse = await mcpAPI.health();
        setIsConnected(healthResponse.data.mcpConnected);
        
        if (healthResponse.data.mcpConnected) {
          // Carregar tools disponíveis
          const toolsResponse = await mcpAPI.listTools();
          setTools(toolsResponse.data.tools);
          
          // Verificar se há uma sessão salva no localStorage
          const savedSessionId = localStorage.getItem('chatSessionId');
          let currentSessionId = savedSessionId;
          
          if (savedSessionId) {
            try {
              // Tentar carregar histórico da sessão salva
              const historyResponse = await chatAPI.getHistory(savedSessionId);
              setSessionId(savedSessionId);
              setMessages(historyResponse.data.messages.map(msg => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              })));
              return; // Sessão carregada com sucesso
            } catch (error) {
              console.log('Sessão salva expirou, criando nova...');
              localStorage.removeItem('chatSessionId');
            }
          }
          
          // Criar nova sessão
          const sessionResponse = await chatAPI.createSession();
          currentSessionId = sessionResponse.data.sessionId;
          setSessionId(currentSessionId);
          
          // Salvar sessionId no localStorage
          localStorage.setItem('chatSessionId', currentSessionId);
          
          // Adicionar mensagem de boas-vindas
          setMessages([
            {
              role: 'assistant',
              content: 'Olá! Sou seu assistente especializado em jogos de cartas. Posso ajudar você a:\n\n• Criar e gerenciar baralhos\n• Explicar regras de jogos\n• Sugerir jogadas\n• Simular partidas\n\nComo posso ajudar você hoje?',
              timestamp: new Date()
            }
          ]);
        }
      } catch (error) {
        console.error('Erro ao inicializar chat:', error);
        setMessages([
          {
            role: 'assistant',
            content: '❌ Erro ao conectar com o servidor. Verifique se o gateway está rodando.',
            timestamp: new Date()
          }
        ]);
      }
    };

    initializeChat();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(sessionId, inputMessage);
      
      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: '❌ Erro ao processar mensagem. Tente novamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content) => {
    // Formatar links e quebras de linha
    return content
      .split('\n')
      .map((line, index) => (
        <div key={index}>
          {line}
          {index < content.split('\n').length - 1 && <br />}
        </div>
      ));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Assistente de Jogos de Cartas</h1>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-500">
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={createNewSession}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Nova sessão"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowTools(!showTools)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Ver ferramentas disponíveis"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tools Panel */}
      {showTools && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Ferramentas Disponíveis ({tools.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tools.map((tool, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-sm text-gray-900">{tool.name}</div>
                <div className="text-xs text-gray-600 mt-1">{tool.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-3 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              
              <div
                className={`px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">
                  {formatMessage(message.content)}
                </div>
                <div
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-700" />
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-500">Processando...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="1"
              disabled={!isConnected || isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || !isConnected || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Enviar</span>
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          Pressione Enter para enviar, Shift+Enter para nova linha
        </div>
      </div>
    </div>
  );
};

export default Chat; 