import { API_BASE_URL as API_URL } from "./config";

export const getRandomPhrase = async () => {
  const response = await fetch(`${API_URL}/phrases/random`);

  if (!response.ok) {
    throw new Error("No se pudo obtener la frase motivacional");
  }

  const result = await response.json();

  return result.data;
};