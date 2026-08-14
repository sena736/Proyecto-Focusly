function pomodoro () {
    return (

<section className="pomodoro">

            <h2>Temporizador Pomodoro</h2>

            <div className="timer">
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </div>

            <div className="timer-buttons">

              <button onClick={() => setRunning(!running)}>
                {running ? "Pausar" : "Iniciar"}
              </button>

              <button
                onClick={() => {
                  setRunning(false);
                  setTime(25 * 60);
                }}
              >
                Reiniciar
              </button>

            </div>

          </section>
    );
}