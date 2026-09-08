import { useState } from "react";
import {
  FiPlus,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import './SeccionTareas.css'

function SeccionTareas() {
  const [tareas, setTareas] = useState([
    {
      id: 1,
      titulo: "Tarea 1",
      descripcion: "Revisar matemáticas",
      completada: false,
    },
    {
      id: 2,
      titulo: "Tarea 2",
      descripcion: "Repasar inglés",
      completada: false,
    },
    {
      id: 3,
      titulo: "Tarea 3",
      descripcion: "Resolver ejercicios de biología",
      completada: true,
    },
  ]);

  // Control del formulario
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: "",
    descripcion: "",
  });

  // Tarea que se está editando
  const [tareaEditando, setTareaEditando] = useState(null);

  // Menú de opciones
  const [menuAbierto, setMenuAbierto] = useState(null);

  // Mostrar todas las tareas
  const [mostrarTodas, setMostrarTodas] = useState(false);

  // Cambiar estado completada
  const cambiarEstadoTarea = (id) => {
    setTareas((tareasActuales) =>
      tareasActuales.map((tarea) =>
        tarea.id === id
          ? {
              ...tarea,
              completada: !tarea.completada,
            }
          : tarea
      )
    );
  };

  // Abrir formulario para nueva tarea
  const abrirFormulario = () => {
    setNuevaTarea({
      titulo: "",
      descripcion: "",
    });

    setTareaEditando(null);
    setMostrarFormulario(true);
  };

  // Guardar nueva tarea o edición
  const guardarTarea = (e) => {
    e.preventDefault();

    if (!nuevaTarea.titulo.trim()) {
      alert("Escribe un título para la tarea.");
      return;
    }

    if (tareaEditando) {
      // Editar tarea existente
      setTareas((tareasActuales) =>
        tareasActuales.map((tarea) =>
          tarea.id === tareaEditando.id
            ? {
                ...tarea,
                titulo: nuevaTarea.titulo,
                descripcion: nuevaTarea.descripcion,
              }
            : tarea
        )
      );
    } else {
      // Crear nueva tarea
      const tarea = {
        id: Date.now(),
        titulo: nuevaTarea.titulo,
        descripcion: nuevaTarea.descripcion,
        completada: false,
      };

      setTareas((tareasActuales) => [...tareasActuales, tarea]);
    }

    cerrarFormulario();
  };

  // Eliminar tarea
  const eliminarTarea = (id) => {
    const confirmar = window.confirm(
      "¿Estás seguro de eliminar esta tarea?"
    );

    if (!confirmar) return;

    setTareas((tareasActuales) =>
      tareasActuales.filter((tarea) => tarea.id !== id)
    );

    setMenuAbierto(null);
  };

  // Preparar tarea para editar
  const editarTarea = (tarea) => {
    setTareaEditando(tarea);

    setNuevaTarea({
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
    });

    setMostrarFormulario(true);
    setMenuAbierto(null);
  };

  // Cerrar formulario
  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setTareaEditando(null);

    setNuevaTarea({
      titulo: "",
      descripcion: "",
    });
  };

  // Mostrar solamente las primeras tareas
  const tareasVisibles = mostrarTodas
    ? tareas
    : tareas.slice(0, 3);

  return (
    <section className="tasks-section">
      <div className="section-header">
        <div>
          <h2>Mis tareas</h2>
          <p>
            Organiza tus actividades y mantén el enfoque.
          </p>
        </div>

        <button
          className="new-task-button"
          onClick={abrirFormulario}
        >
          <FiPlus />
          Nueva tarea
        </button>
      </div>

      <div className="tasks-card">
        {tareasVisibles.length === 0 ? (
          <div className="empty-tasks">
            <p>No tienes tareas registradas.</p>

            <button onClick={abrirFormulario}>
              Crear primera tarea
            </button>
          </div>
        ) : (
          tareasVisibles.map((tarea) => (
            <div className="task-item" key={tarea.id}>
              {/* Checkbox */}
              <button
                className={`task-check ${
                  tarea.completada ? "completed" : ""
                }`}
                onClick={() => cambiarEstadoTarea(tarea.id)}
                title={
                  tarea.completada
                    ? "Marcar como pendiente"
                    : "Marcar como completada"
                }
              >
                {tarea.completada && "✓"}
              </button>

              {/* Información */}
              <div className="task-information">
                <h4
                  className={
                    tarea.completada
                      ? "task-completed-text"
                      : ""
                  }
                >
                  {tarea.titulo}
                </h4>

                <p>{tarea.descripcion}</p>
              </div>

              {/* Estado */}
              <span className="task-status">
                {tarea.completada ? "Hecha" : "Hoy"}
              </span>

              {/* Menú */}
              <div className="task-menu-container">
                <button
                  className="more-button"
                  onClick={() =>
                    setMenuAbierto(
                      menuAbierto === tarea.id
                        ? null
                        : tarea.id
                    )
                  }
                >
                  <FiMoreVertical />
                </button>

                {menuAbierto === tarea.id && (
                  <div className="task-menu">
                    <button onClick={() => editarTarea(tarea)}>
                      <FiEdit />
                      Editar
                    </button>

                    <button
                      onClick={() => eliminarTarea(tarea.id)}
                    >
                      <FiTrash2 />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {tareas.length > 3 && (
          <button
            className="view-tasks"
            onClick={() => setMostrarTodas(!mostrarTodas)}
          >
            {mostrarTodas
              ? "Mostrar menos"
              : "Ver todas las tareas"}
          </button>
        )}
      </div>

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <div className="task-modal">
          <div className="task-modal-content">
            <div className="modal-header">
              <h3>
                {tareaEditando
                  ? "Editar tarea"
                  : "Nueva tarea"}
              </h3>

              <button
                className="close-modal"
                onClick={cerrarFormulario}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={guardarTarea}>
              <div className="form-group">
                <label>Título</label>

                <input
                  type="text"
                  placeholder="Ej. Estudiar matemáticas"
                  value={nuevaTarea.titulo}
                  onChange={(e) =>
                    setNuevaTarea({
                      ...nuevaTarea,
                      titulo: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>

                <textarea
                  placeholder="Describe la tarea..."
                  value={nuevaTarea.descripcion}
                  onChange={(e) =>
                    setNuevaTarea({
                      ...nuevaTarea,
                      descripcion: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={cerrarFormulario}
                  className="cancel-button"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  {tareaEditando
                    ? "Guardar cambios"
                    : "Crear tarea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default SeccionTareas;