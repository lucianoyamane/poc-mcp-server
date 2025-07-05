# Frontend - Chat de Jogos de Cartas

Interface web moderna para interagir com o servidor MCP de jogos de cartas.

## Funcionalidades

- 💬 **Chat em tempo real** com assistente especializado
- 🎯 **Interface moderna** estilo ChatGPT
- 🔧 **Visualização de tools** disponíveis
- 📱 **Responsivo** para desktop e mobile
- ⚡ **Performance otimizada** com Vite

## Tecnologias

- **React 18** - Framework principal
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones

## Instalação

```bash
cd frontend
npm install
```

## Desenvolvimento

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## Produção

```bash
npm run build
npm run preview
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do frontend:

```env
VITE_API_URL=http://localhost:3001
```

### Pré-requisitos

- Gateway HTTP rodando na porta 3001
- Servidor MCP funcionando
- API Key do Anthropic configurada

## Estrutura do Projeto

```
src/
├── components/
│   └── Chat.jsx          # Componente principal do chat
├── config/
│   └── api.js           # Configuração da API
├── App.jsx              # Componente raiz
└── index.css            # Estilos globais
```

## Funcionalidades do Chat

### Interface
- **Header** com status de conexão e botão de tools
- **Painel de tools** expansível
- **Área de mensagens** com auto-scroll
- **Input** com suporte a Enter/Shift+Enter

### Integração com MCP
- **Health check** automático
- **Criação de sessão** automática
- **Envio de mensagens** com processamento MCP
- **Exibição de tools** disponíveis

### UX/UI
- **Loading states** durante processamento
- **Mensagens de erro** amigáveis
- **Timestamps** nas mensagens
- **Formatação** de quebras de linha
- **Responsividade** completa

## Próximos Passos

1. **Autenticação** - Sistema de login
2. **Persistência** - Salvar histórico
3. **WebSocket** - Chat em tempo real
4. **Temas** - Modo escuro/claro
5. **Upload** - Envio de arquivos
