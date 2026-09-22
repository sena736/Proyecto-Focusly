import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, createTask, updateTask, deleteTask } from "../api/task.api";

const useTask = (token) => {
  const queryClient = useQueryClient();

  // Obtener tareas
  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: () => getTasks(token),
    enabled: !!token,
  });

  // Crear tarea
  const createMutation = useMutation({
    mutationFn: (taskData) => createTask(taskData, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  // Editar tarea
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTask(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  // Eliminar tarea
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTask(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  return {
    // Datos de las tareas
    tasks: tasksQuery.data,

    // Estado de la consulta
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,

    // Acciones
    createTask: createMutation.mutate,
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate,

    // Estados de las acciones
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
};

export default useTask;
