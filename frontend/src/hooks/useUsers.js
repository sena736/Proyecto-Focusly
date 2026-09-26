import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getUsers, updateUserRole } from "../api/users.api";

const useUsers = () => {
  const queryClient = useQueryClient();

  // Obtener todos los usuarios
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  // Actualizar el rol de un usuario
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => updateUserRole(id, role),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });

  return {
    users: usersQuery.data ?? [],
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,

    updateUserRole: updateRoleMutation.mutate,
    updateUserRoleAsync: updateRoleMutation.mutateAsync,
    isUpdatingRole: updateRoleMutation.isPending,
    updateRoleError: updateRoleMutation.error,
  };
};

export default useUsers;
