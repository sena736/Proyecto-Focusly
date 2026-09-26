import api from "./api";

export const getUsers = async () => {
  const response = await api.get("/users");

  return response.data?.users ?? response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await api.patch(`/users/${id}/role`, {
    role,
  });

  return response.data;
};
