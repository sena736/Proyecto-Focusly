import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../api/tasks.api";

/**
 * Hook para consultar y gestionar las tareas.
 */
export const useTasks = () => {
  const queryClient = useQueryClient();

  // Obtener tareas
  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  // Crear tarea
  const createTaskMutation = useMutation({
    mutationFn: createTask,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  // Actualizar tarea
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, taskData }) =>
      updateTask(taskId, taskData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  // Eliminar tarea
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => deleteTask(taskId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  return {
    // Consulta
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    refetch: tasksQuery.refetch,

    // Crear
    createTask: createTaskMutation.mutate,
    createTaskAsync: createTaskMutation.mutateAsync,
    isCreating: createTaskMutation.isPending,

    // Editar
    updateTask: updateTaskMutation.mutate,
    updateTaskAsync: updateTaskMutation.mutateAsync,
    isUpdating: updateTaskMutation.isPending,

    // Eliminar
    deleteTask: deleteTaskMutation.mutate,
    deleteTaskAsync: deleteTaskMutation.mutateAsync,
    isDeleting: deleteTaskMutation.isPending,
  };
};

export default useTasks;