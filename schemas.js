import { z } from "zod";

export const criarBaralhoSchema = {
  deck_count: z.number().optional()
};

export const embaralharBaralhoSchema = {
  deck_id: z.string()
};

export const comprarCartasSchema = {
  deck_id: z.string(),
  count: z.number().optional()
}; 