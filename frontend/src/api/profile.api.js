import { request } from "./auth.api";

export const getProfile = async () => {
  return request("/profile", {
    method: "GET",
  });
};

export const updateProfile = async (data) => {
  return request("/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};
