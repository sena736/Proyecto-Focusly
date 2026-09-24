const autocannon = require("autocannon");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.API_URL || "http://localhost:3000";

const CONNECTIONS = 100;
const DURATION = 30;

const tests = [
  {
    name: "GET /tasks",
    method: "GET",
    path: "/tasks",
  },
  {
    name: "POST /pomodoro-sessions",
    method: "POST",
    path: "/pomodoro-sessions",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      taskId: 1,
      duration: 25,
    }),
  },
  {
    name: "GET /phrases/random",
    method: "GET",
    path: "/phrases/random",
  },
];

function runTest(test) {
  return new Promise((resolve, reject) => {
    console.log("\n========================================");
    console.log(`Prueba: ${test.name}`);
    console.log("========================================");
    console.log(`URL: ${BASE_URL}${test.path}`);
    console.log(`Conexiones: ${CONNECTIONS}`);
    console.log(`Duración: ${DURATION} segundos\n`);

    const instance = autocannon(
      {
        url: `${BASE_URL}${test.path}`,
        method: test.method,
        connections: CONNECTIONS,
        duration: DURATION,
        headers: test.headers,
        body: test.body,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    autocannon.track(instance, {
      renderProgressBar: true,
      renderResultsTable: false,
      renderLatencyTable: false,
    });
  });
}

function processResult(test, result) {
  return {
    endpoint: test.path,
    method: test.method,
    connections: CONNECTIONS,
    durationSeconds: DURATION,

    requests: {
      total: result.requests?.total || 0,
      averagePerSecond: result.requests?.average || 0,
      minPerSecond: result.requests?.min || 0,
      maxPerSecond: result.requests?.max || 0,
    },

    latency: {
      averageMs: result.latency?.average || 0,
      minMs: result.latency?.min || 0,
      maxMs: result.latency?.max || 0,
      p95Ms: result.latency?.p95 || 0,
      p99Ms: result.latency?.p99 || 0,
    },

    errors: result.errors || 0,
    timeouts: result.timeouts || 0,
    non2xx: result.non2xx || 0,
  };
}

async function main() {
  console.log("\n");
  console.log("========================================");
  console.log("     FOCUSLY - PRUEBAS DE CARGA");
  console.log("========================================");
  console.log(`Servidor: ${BASE_URL}`);
  console.log(`Concurrencia: ${CONNECTIONS}`);
  console.log(`Duración por endpoint: ${DURATION}s`);

  const results = [];

  try {
    for (const test of tests) {
      try {
        const result = await runTest(test);

        results.push(processResult(test, result));
      } catch (error) {
        console.error(
          `Error ejecutando ${test.name}:`,
          error.message
        );

        results.push({
          endpoint: test.path,
          method: test.method,
          error: error.message,
        });
      }
    }

    const outputDirectory = path.join(__dirname, "results");

    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, {
        recursive: true,
      });
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

    const outputFile = path.join(
      outputDirectory,
      `load-test-${timestamp}.json`
    );

    fs.writeFileSync(
      outputFile,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          baseUrl: BASE_URL,
          connections: CONNECTIONS,
          durationSeconds: DURATION,
          results,
        },
        null,
        2
      )
    );

    console.log("\n");
    console.log("========================================");
    console.log("        RESULTADOS DE LA PRUEBA");
    console.log("========================================");

    results.forEach((result) => {
      console.log(`\n${result.method} ${result.endpoint}`);

      if (result.error) {
        console.log(`Error: ${result.error}`);
        return;
      }

      console.log(
        `Promedio: ${result.latency.averageMs} ms`
      );

      console.log(
        `P95: ${result.latency.p95Ms} ms`
      );

      console.log(
        `P99: ${result.latency.p99Ms} ms`
      );

      console.log(
        `Errores: ${result.errors}`
      );

      console.log(
        `Timeouts: ${result.timeouts}`
      );

      console.log(
        `Respuestas no 2xx: ${result.non2xx}`
      );

      console.log(
        `Requests totales: ${result.requests.total}`
      );
    });

    console.log("\n========================================");
    console.log("Resultados guardados en:");
    console.log(outputFile);
    console.log("========================================\n");
  } catch (error) {
    console.error("Error general:", error);
    process.exit(1);
  }
}

main();