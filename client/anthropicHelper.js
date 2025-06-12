import { Anthropic } from "@anthropic-ai/sdk";
import dotenv from "dotenv";
dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
}

export class AnthropicHelper {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: ANTHROPIC_API_KEY,
        });
    }

    /**
     * Envia uma mensagem para o modelo Claude
     * @param {Array} messages - Histórico de mensagens
     * @param {Array} tools - Lista de ferramentas disponíveis (opcional)
     * @param {string} model - Nome do modelo (opcional, default: "claude-3-5-sonnet-20241022")
     * @param {number} max_tokens - Máximo de tokens (opcional, default: 1000)
     * @returns {Promise<any>} - Resposta do modelo
     */
    async sendMessage({ messages, tools = undefined, model = "claude-3-5-sonnet-20241022", max_tokens = 5000 }) {
        return await this.anthropic.messages.create({
            model,
            max_tokens,
            messages,
            ...(tools ? { tools } : {}),
        });
    }
} 