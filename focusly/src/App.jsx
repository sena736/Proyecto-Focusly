import { useEffect, useState } from "react";
import Home from "./pages/Home";
import "./App.css";

function App() {
  return (<Home/>)
 /*  // -------------------------
  // ESTADO DE LAS TAREAS
  // -------------------------
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("focusly_tasks");

    return savedTasks
      ? JSON.parse(savedTasks)
      : [
          {
            id: 1,
            title: "Estudiar programación",
            completed: false,
          },
          {
            id: 2,
            title: "Realizar proyecto de React",
            completed: true,
          },
        ];
  });

  const [newTask, setNewTask] = useState("");

  // -------------------------
  // TEMPORIZADOR POMODORO
  // -------------------------
  const [time, setTime] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  // Guardar tareas en localStorage
  useEffect(() => {
    localStorage.setItem("focusly_tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Temporizador
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTime((previousTime) => {
        if (previousTime <= 1) {
          setRunning(false);
          return 25 * 60;
        }

        return previousTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  // -------------------------
  // AGREGAR TAREA
  // -------------------------
  const addTask = () => {
    if (newTask.trim() === "") return;

    const task = {
      id: Date.now(),
      title: newTask,
      completed: false,
    };

    setTasks([...tasks, task]);
    setNewTask("");
  };

  // -------------------------
  // COMPLETAR TAREA
  // -------------------------
  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  // -------------------------
  // ELIMINAR TAREA
  // -------------------------
  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // Formato del temporizador
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className="app">

      {/* BARRA LATERAL 
      <aside className="sidebar">

        <h1 className="logo">Focusly</h1>

        <nav>
          <button>Inicio</button>
          <button>Dashboard</button>
          <button>Mis tareas</button>
          <button>Pomodoro</button>
          <button>Frases motivadoras</button>
          <button>Configuración</button>
          <button>Panel administrativo</button>
        </nav>

      </aside>

      {/* CONTENIDO PRINCIPAL 
      <main className="main">

        <header>
          <h2>Dashboard</h2>
          <p>Organiza tus tareas y aprovecha mejor tu tiempo.</p>
        </header>

        {/* ESTADÍSTICAS *
        <section className="stats">

          <div className="card">
            <h3>Tareas totales</h3>
            <strong>{tasks.length}</strong>
          </div>

          <div className="card">
            <h3>Completadas</h3>
            <strong>
              {tasks.filter((task) => task.completed).length}
            </strong>
          </div>

          <div className="card">
            <h3>Pendientes</h3>
            <strong>
              {tasks.filter((task) => !task.completed).length}
            </strong>
          </div>

        </section>

        <div className="content">

          {/* LISTA DE TAREAS 
          <section className="tasks">

            <h2>Lista de tareas</h2>

            <div className="add-task">

              <input
                type="text"
                placeholder="Escribe una nueva tarea..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addTask();
                  }
                }}
              />

              <button onClick={addTask}>
                Agregar
              </button>

            </div>

            <div className="task-list">

              {tasks.map((task) => (

                <div className="task" key={task.id}>

                  <div>

                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                    />

                    <span
                      className={
                        task.completed ? "completed" : ""
                      }
                    >
                      {task.title}
                    </span>

                  </div>

                  <button
                    className="delete"
                    onClick={() => deleteTask(task.id)}
                  >
                    Eliminar
                  </button>

                </div>

              ))}

            </div>

          </section>

          rgrvrvfrvfrvr

        </div>

        {/* FRASE MOTIVADORA *
        <section className="quote">

          <h2>Frase del día</h2>

          <p>
            "El éxito es la suma de pequeños esfuerzos
            repetidos cada día."
          </p>

        </section>

      </main>

    </div>
  ); */
}

export default App;