import { useState } from "react";
import TaskForm from "../../components/TaskForm";
import TaskCard from "../../components/TaskCard";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import "./Tasks.css";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const handleSubmit = (taskData) => {
    if (editingTask) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTask.id ? { ...task, ...taskData } : task,
        ),
      );
      setEditingTask(null);
      return;
    }

    const newTask = {
      id: Date.now(),
      ...taskData,
      completed: false,
    };

    setTasks((currentTasks) => [...currentTasks, newTask]);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
  };

  // Solo abre el modal. No elimina la tarea.
  const handleDelete = (task) => {
    setTaskToDelete(task);
  };

  // Aquí se realizará el borrado real.
  // Actualmente usa el estado local como simulación.
  const deleteTask = (task) => {
    setTasks((currentTasks) =>
      currentTasks.filter((currentTask) => currentTask.id !== task.id),
    );
  };

  const handleConfirmDelete = () => {
    if (!taskToDelete) return;

    deleteTask(taskToDelete);
    setTaskToDelete(null);
  };

  const handleCancelDelete = () => {
    setTaskToDelete(null);
  };

  const handleToggleComplete = (task) => {
    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id
          ? { ...currentTask, completed: !currentTask.completed }
          : currentTask,
      ),
    );
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  return (
    <main className="tasks-page">
      {" "}
      <header className="tasks-page__header">
        {" "}
        <h1>Mis tareas</h1>{" "}
        <p>Organiza tus tareas y lleva un seguimiento de tu progreso. </p>{" "}
      </header>
      <section className="tasks-page__form">
        <h2>{editingTask ? "Editar tarea" : "Nueva tarea"}</h2>

        <TaskForm
          task={editingTask}
          onSubmit={handleSubmit}
          onCancel={editingTask ? handleCancelEdit : undefined}
        />
      </section>
      <section className="tasks-page__list">
        <div className="tasks-page__list-header">
          <h2>Lista de tareas</h2>
          <span>{tasks.length} tarea(s)</span>
        </div>

        {tasks.length === 0 ? (
          <p className="tasks-page__empty">
            No tienes tareas todavía. Crea una para comenzar.
          </p>
        ) : (
          <div className="tasks-page__cards">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>
        )}
      </section>
      {taskToDelete && (
        <ConfirmDeleteModal
          task={taskToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </main>
  );
};

export default Tasks;
