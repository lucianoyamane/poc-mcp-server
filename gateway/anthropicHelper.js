import Anthropic from "@anthropic-ai/sdk";

export class AnthropicHelper {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
    }

    async sendMessage({ messages, tools = [] }) {
        const systemPrompt = `Você é um assistente especializado em jogos de cartas. 
        Use as ferramentas disponíveis para ajudar com baralhos, cartas e jogos.
        Sempre responda em português brasileiro.`;

        const response = await this.anthropic.messages.create({
            model: "claude-3-opus-20240229",
            max_tokens: 1000,
            system: systemPrompt,
            messages: messages,
            tools: tools.length > 0 ? tools : undefined,
        });

        return response;
    }
} 