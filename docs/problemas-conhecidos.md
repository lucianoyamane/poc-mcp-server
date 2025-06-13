# Problemas Conhecidos - Servidor MCP

## 1. Uso de `console.log` no stdout quebra o protocolo MCP

### Sintoma

Ao rodar o servidor MCP com ferramentas como o `@modelcontextprotocol/inspector` ou outros clients MCP, aparece o erro:

```
Error from MCP server: SyntaxError: Unexpected token 'R', "Resource d"... is not valid JSON
```

Ou:

```
Error from MCP server: Unexpected token ... is not valid JSON
```

### Causa

O protocolo MCP espera que **toda a saída padrão (stdout)** do servidor MCP seja composta apenas por mensagens JSON válidas do protocolo. Qualquer texto extra (como logs, prints, etc) enviado para o stdout quebra a comunicação, pois o client/inspector tenta interpretar como JSON e falha.

No Node.js, comandos como:

```js
console.log("Resource deck-pile-list registrado!");
console.log("Servidor MCP conectado e aguardando comandos...");
```

vão para o stdout e causam esse problema.

### Solução

- **Nunca use `console.log` para logs informativos em servidores MCP.**
- Use `console.error` para logs, pois a saída de erro (stderr) não interfere no protocolo MCP.

**Exemplo correto:**

```js
console.error("Resource deck-pile-list registrado!");
console.error("Servidor MCP conectado e aguardando comandos...");
```

### Resumo
- Apenas mensagens JSON do protocolo MCP devem ir para o stdout.
- Logs e prints informativos devem ir para o stderr (`console.error`).

---

Se encontrar outros problemas recorrentes, adicione neste arquivo para facilitar o diagnóstico futuro! 