import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logs de debug
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const chatAPI = {
  // Criar nova sessão
  createSession: () => api.post('/api/chat/session'),
  
  // Enviar mensagem
  sendMessage: (sessionId, message) => 
    api.post('/api/chat/message', { sessionId, message }),
  
  // Obter histórico
  getHistory: (sessionId) => 
    api.get(`/api/chat/history/${sessionId}`),
};

export const mcpAPI = {
  // Health check
  health: () => api.get('/api/health'),
  
  // Tools
  listTools: () => api.get('/api/tools'),
  
  // Resources
  listResources: () => api.get('/api/resources'),
  readResource: (uri) => api.post('/api/resources/read', { uri }),
  
  // Prompts
  listPrompts: () => api.get('/api/prompts'),
  executePrompt: (name, arguments_) => 
    api.post('/api/prompts/execute', { name, arguments: arguments_ }),
};

export default api; 