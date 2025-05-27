import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  // Criar o cliente
  const client = new Client({
    name: "test-client",
    version: "1.0.0"
  });

  // Configurar o transporte
  const transport = new StdioClientTransport({
    command: "node",
    args: ["index.js"]
  });

  try {
    // Conectar ao servidor
    await client.connect(transport);

    // Criar um baralho
    console.log("Criando um baralho...");
    const resultado = await client.callTool({
      name: "criar_baralho",
      arguments: {
        deck_count: 1
      }
    });

    console.log("Resultado criar_baralho:", resultado);

    // Extrair o deck_id do resultado
    let deck_id;
    try {
      const data = JSON.parse(resultado.content[0].text);
      deck_id = data.deck_id;
    } catch (e) {
      console.error("Erro ao extrair deck_id:", e);
      return;
    }

    // Comprar 3 cartas (ou testar o prompt se não passar count)
    console.log(`Comprando cartas do baralho ${deck_id}...`);
    const resultadoCompra = await client.callTool({
      name: "comprar_cartas",
      arguments: {
        deck_id
        // Não passar count para acionar o prompt
      }
    });
    console.log("Resultado comprar_cartas:", resultadoCompra);

    // Simular a lógica do prompt como uma tool
    console.log(`Simulando prompt como tool para o baralho ${deck_id}...`);
    const respostaPromptTool = await client.callTool({
      name: "comprar_cartas_prompt_tool",
      arguments: { deck_id }
    });
    console.log("Resposta da tool que simula o prompt:", respostaPromptTool);
  } catch (error) {
    console.error("Erro:", error);
  } finally {
    await client.close();
  }
}

main(); 