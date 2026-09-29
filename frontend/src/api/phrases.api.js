const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const getRandomPhrase = async () => {
  const response = await fetch(`${API_URL}/phrases/random`);

  if (!response.ok) {
    throw new Error("No se pudo obtener la frase motivacional");
  }

  const result = await response.json();

  return result.data;
};