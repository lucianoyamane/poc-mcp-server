import fetch from 'node-fetch';

const DECK_API_BASE_URL = process.env.DECK_API_BASE_URL || "https://deckofcardsapi.com/api/deck";

// Handler para criar um novo baralho
export async function criarBaralho({ deck_count = 1 }) {
  const url = `${DECK_API_BASE_URL}/new/shuffle/?deck_count=${deck_count}`;
  const response = await fetch(url);
  const data = await response.json();
  return {
    content: [{ type: "text", text: JSON.stringify(data) }]
  };
}

// Handler para embaralhar um baralho existente
export async function embaralharBaralho({ deck_id }) {
  if (!deck_id) throw new Error('deck_id é obrigatório');
  const url = `${DECK_API_BASE_URL}/${deck_id}/shuffle/`;
  const response = await fetch(url);
  const data = await response.json();
  return {
    content: [{ type: "text", text: JSON.stringify(data) }]
  };
}

// Handler para comprar cartas
export async function comprarCartas(params) {
  console.error("Parâmetros recebidos em comprarCartas:", params);
  const { deck_id, count = 1 } = params;
  if (!deck_id) throw new Error('deck_id é obrigatório');
  const url = `${DECK_API_BASE_URL}/${deck_id}/draw/?count=${count}`;
  const response = await fetch(url);
  const data = await response.json();
  return {
    content: [{ type: "text", text: JSON.stringify(data) }]
  };
} 