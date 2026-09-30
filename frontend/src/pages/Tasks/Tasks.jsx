import React, { useEffect, useMemo, useState } from "react";
import TaskCard from "../../components/tasks/TaskCard/TaskCard";
import TaskFilters from "../../components/tasks/TaskFilters/TaskFilters";
import TaskForm from "../../components/tasks/TaskForm/TaskForm";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import Alert from "../../components/ui/Alert/Alert";
import EmptyState from "../../components/ui/EmptyState/EmptyState";
import Loader from "../../components/ui/Loader/Loader";
import useTask from "../../hooks/useTask";
import { getToken } from "../../services/token.services";
import { TASK_STATUS } from "../../utils/constants";
import { formatDueDate } from "../../utils/date";
import "./Tasks.css";

const EMPTY_TASK = {};

// Predicados por id de filtro (los ids son los que emite TaskFilters).
// "priority" muestra únicamente las tareas de prioridad alta.
const FILTER_PREDICATES = {
  all: () => true,
  pending: (task) => task.status === TASK_STATUS.PENDING,
  completed: (task) => task.status === TASK_STATUS.COMPLETED,
  priority: (task) => task.priority === "HIGH",
};

const Tasks = () => {
  const token = getToken();

  const {
    tasks = [],
    isLoading,
    isError,
    error,
    createTaskAsync,
    updateTaskAsync,
    deleteTaskAsync,
    isCreating,
    isUpdating,
    isDeleting,
  } = useTask(token);

  const [actionError, setActionError] = useState("");
  const [filter, setFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Sin tareas TaskFilters se desmonta: no dejar un filtro activo "oculto"
  // que esconda las próximas tareas.
  const hasTasks = tasks.length > 0;

  useEffect(() => {
    if (!hasTasks) {
      setFilter("all");
    }
  }, [hasTasks]);

  // Tareas visibles según el filtro activo
  const filteredTasks = useMemo(
    () => tasks.filter(FILTER_PREDICATES[filter] ?? FILTER_PREDICATES.all),
    [tasks, filter]
  );

  // Crear tarea
  const handleCreate = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  // Editar tarea
  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  // Cerrar formulario
  const handleCloseForm = () => {
    if (isCreating || isUpdating) {
      return;
    }

    setShowForm(false);
    setEditingTask(null);
  };

  // Crear o actualizar tarea
  const handleSubmit = async (formData) => {
    setActionError("");

    try {
      if (editingTask) {
        await updateTaskAsync({
          id: editingTask.id,
          data: formData,
        });
      } else {
        await createTaskAsync(formData);
        // La tarea nueva no debe quedar oculta por el filtro activo
        setFilter("all");
      }

      setShowForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Error al guardar la tarea:", error);

      setActionError(
        error?.message || "No se pudo guardar la tarea. Intentá de nuevo."
      );
    }
  };

  // Marcar tarea como completada o pendiente
  const handleToggle = async (task, completed) => {
    setActionError("");

    try {
      await updateTaskAsync({
        id: task.id,
        data: {
          status: completed ? "COMPLETED" : "PENDING",
        },
      });
    } catch (error) {
      console.error("Error al actualizar la tarea:", error);

      setActionError(
        error?.message || "No se pudo actualizar la tarea. Intentá de nuevo."
      );
    }
  };

  // Abrir confirmación de eliminación
  const handleDeleteRequest = (task) => {
    setTaskToDelete(task);
  };

  // Cancelar eliminación
  const handleCancelDelete = () => {
    if (isDeleting) {
      return;
    }

    setTaskToDelete(null);
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!taskToDelete) {
      return;
    }

    setActionError("");

    try {
      await deleteTaskAsync(taskToDelete.id);
      setTaskToDelete(null);
    } catch (error) {
      console.error("Error al eliminar la tarea:", error);

      setActionError(
        error?.message || "No se pudo eliminar la tarea. Intentá de nuevo."
      );
    }
  };

  // Adaptar prioridad del formulario al TaskCard
  const getTaskPriority = (priority) => {
    const priorities = {
      LOW: "low",
      MEDIUM: "normal",
      HIGH: "high",
    };

    return priorities[priority] || "normal";
  };

  return (
    <div className="tasks-page">
      {/* Encabezado */}
      <div className="tasks-header">
        <div>
          <h1>Mis tareas</h1>
          <p>Organiza tus tareas y mantén al día tus actividades.</p>
        </div>

        <button
          type="button"
          className="tasks-create-button"
          onClick={handleCreate}
        >
          + Nueva tarea
        </button>
      </div>

      {/* Filtros (solo tiene sentido si hay tareas que filtrar) */}
      {!isLoading && !isError && tasks.length > 0 && (
        <div className="tasks-filters">
          <TaskFilters activeFilter={filter} onFilterChange={setFilter} />
        </div>
      )}

      {/* Error de una acción (crear, editar, eliminar) */}
      {actionError && (
        <div className="tasks-action-alert">
          <Alert
            type="error"
            message={actionError}
            onClose={() => setActionError("")}
          />
        </div>
      )}

      {/* Estado de carga */}
      {isLoading && (
        <div className="tasks-state">
          <Loader text="Cargando tareas..." />
        </div>
      )}

      {/* Estado de error */}
      {isError && !isLoading && (
        <div className="tasks-state tasks-state-error">
          <h2>No se pudieron cargar las tareas</h2>
          <p>{error?.message || "Ocurrió un error al cargar tus tareas."}</p>
        </div>
      )}

      {/* Sin tareas creadas */}
      {!isLoading && !isError && tasks.length === 0 && (
        <div className="tasks-empty">
          <EmptyState
            title="No tienes tareas todavía"
            message="Crea tu primera tarea para comenzar a organizarte."
            buttonText="Crear primera tarea"
            onAction={handleCreate}
          />
        </div>
      )}

      {/* El filtro activo no coincide con ninguna tarea */}
      {!isLoading &&
        !isError &&
        tasks.length > 0 &&
        filteredTasks.length === 0 && (
          <div className="tasks-empty">
            <EmptyState
              icon="🔍"
              title="No hay tareas para este filtro"
              message="Prueba con otro filtro para ver el resto de tus tareas."
              buttonText="Ver todas las tareas"
              onAction={() => setFilter("all")}
              variant="compact"
            />
          </div>
        )}

      {/* Lista de tareas */}
      {!isLoading && !isError && filteredTasks.length > 0 && (
        <div className="tasks-list">
          {filteredTasks.map((task) => {
            const completed = task.status === TASK_STATUS.COMPLETED;

            return (
              <TaskCard
                key={task.id}
                title={task.title}
                description={task.description}
                date={formatDueDate(task.dueDate)}
                completed={completed}
                priority={getTaskPriority(task.priority)}
                category={task.category}
                onToggle={(newCompleted) => handleToggle(task, newCompleted)}
                onEdit={() => handleEdit(task)}
                onDelete={() => handleDeleteRequest(task)}
              />
            );
          })}
        </div>
      )}

      {/* Formulario para crear o editar */}
      {showForm && (
        <div className="task-form-overlay" onClick={handleCloseForm}>
          <div
            className="task-form-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="task-form-header">
              <h2>{editingTask ? "Editar tarea" : "Nueva tarea"}</h2>

              <button
                type="button"
                className="task-form-close"
                onClick={handleCloseForm}
                disabled={isCreating || isUpdating}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <TaskForm
              initialData={editingTask || EMPTY_TASK}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
              loading={isCreating || isUpdating}
              submitText={editingTask ? "Guardar cambios" : "Crear tarea"}
            />
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmDeleteModal
        isOpen={Boolean(taskToDelete)}
        taskName={taskToDelete?.title}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Tasks;
