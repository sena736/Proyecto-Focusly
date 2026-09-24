import { useQuery } from "@tanstack/react-query";
import { getRandomPhrase } from "../api/phrases.api";

export const usePhrase = () => {
  return useQuery({
    queryKey: ["phrase"],
    queryFn: getRandomPhrase,
    staleTime: 5 * 60 * 1000,
  });
};