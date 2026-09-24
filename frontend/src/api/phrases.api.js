const API_URL = import.meta.env.VITE_API_URL || "";

export const getRandomPhrase = async () => {
  const response = await fetch(
    `${API_URL}/api/v1/phrases/random`
  );

  if (!response.ok) {
    throw new Error("No se pudo obtener la frase motivacional");
  }

  const result = await response.json();

  return result.data;
};