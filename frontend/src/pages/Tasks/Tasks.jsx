import React, { useState } from "react";
import TaskCard from "../../components/TaskCard/TaskCard";
import TaskForm from "../../components/TaskForm/TaskForm";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal/ConfirmDeleteModal";
import useTask from "../../hooks/useTask";
import { getToken } from "../../services/token.service";
import "./Tasks.css";

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

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

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
    try {
      if (editingTask) {
        await updateTaskAsync({
          id: editingTask.id,
          data: formData,
        });
      } else {
        await createTaskAsync(formData);
      }

      setShowForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Error al guardar la tarea:", error);
    }
  };

  // Marcar tarea como completada o pendiente
  const handleToggle = async (task, completed) => {
    try {
      await updateTaskAsync({
        id: task.id,
        data: {
          ...task,
          status: completed ? "completada" : "pendiente",
        },
      });
    } catch (error) {
      console.error("Error al actualizar la tarea:", error);
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

    try {
      await deleteTaskAsync(taskToDelete.id);
      setTaskToDelete(null);
    } catch (error) {
      console.error("Error al eliminar la tarea:", error);
    }
  };

  // Adaptar prioridad del formulario al TaskCard
  const getTaskPriority = (priority) => {
    const priorities = {
      baja: "low",
      media: "normal",
      alta: "high",
      low: "low",
      normal: "normal",
      high: "high",
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

      {/* Estado de carga */}
      {isLoading && (
        <div className="tasks-state">
          <p>Cargando tareas...</p>
        </div>
      )}

      {/* Estado de error */}
      {isError && !isLoading && (
        <div className="tasks-state tasks-state-error">
          <h2>No se pudieron cargar las tareas</h2>
          <p>{error?.message || "Ocurrió un error al cargar tus tareas."}</p>
        </div>
      )}

      {/* Lista de tareas */}
      {!isLoading && !isError && (
        <div className="tasks-list">
          {tasks.length === 0 ? (
            <div className="tasks-empty">
              <h2>No tienes tareas todavía</h2>

              <p>Crea tu primera tarea para comenzar a organizarte.</p>

              <button
                type="button"
                className="tasks-empty-button"
                onClick={handleCreate}
              >
                Crear primera tarea
              </button>
            </div>
          ) : (
            tasks.map((task) => {
              const completed = task.completed ?? task.status === "completada";

              return (
                <TaskCard
                  key={task.id}
                  title={task.title}
                  description={task.description}
                  date={task.dueDate}
                  completed={completed}
                  priority={getTaskPriority(task.priority)}
                  category={task.category}
                  onToggle={(newCompleted) => handleToggle(task, newCompleted)}
                  onEdit={() => handleEdit(task)}
                  onDelete={() => handleDeleteRequest(task)}
                />
              );
            })
          )}
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
              initialData={editingTask || {}}
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
