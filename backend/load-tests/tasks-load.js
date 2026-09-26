const autocannon = require("autocannon");
const fs = require("fs");
const path = require("path");

const BASE_URL =
  process.env.LOAD_TEST_BASE_URL || "http://localhost:3000/api/v1";

const AUTH_TOKEN = process.env.LOAD_TEST_TOKEN || "";

const CONNECTIONS = 100;
const DURATION = Number(process.env.LOAD_TEST_DURATION || 10);

const results = [];

const getHeaders = () => {
  const headers = {
    accept: "application/json",
  };

  if (AUTH_TOKEN) {
    headers.authorization = `Bearer ${AUTH_TOKEN}`;
  }

  return headers;
};

const runTest = (name, options) => {
  return new Promise((resolve, reject) => {
    console.log(`\nEjecutando prueba: ${name}`);
    console.log(`URL: ${options.url}`);
    console.log(`Conexiones: ${CONNECTIONS}`);
    console.log(`Duración: ${DURATION}s`);

    autocannon(
      {
        ...options,
        connections: CONNECTIONS,
        duration: DURATION,
        headers: {
          ...getHeaders(),
          ...(options.headers || {}),
        },
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        const testResult = {
          endpoint: name,
          url: options.url,
          method: options.method || "GET",
          connections: CONNECTIONS,
          durationSeconds: DURATION,

          averageResponseTimeMs: result.latency.average,
          p95ResponseTimeMs: result.latency.p95,

          requests: {
            total: result.requests.total,
            averagePerSecond: result.requests.average,
          },

          errors: result.errors || 0,
          timeouts: result.timeouts || 0,
          non2xx: result.non2xx || 0,
        };

        results.push(testResult);

        console.log(`Promedio: ${testResult.averageResponseTimeMs} ms`);
        console.log(`P95: ${testResult.p95ResponseTimeMs} ms`);
        console.log(`Errores: ${testResult.errors}`);
        console.log(`Timeouts: ${testResult.timeouts}`);
        console.log(`Respuestas no 2xx: ${testResult.non2xx}`);

        resolve(testResult);
      },
    );
  });
};

const runLoadTests = async () => {
  console.log("======================================");
  console.log("FOCUSLY - PRUEBAS DE CARGA");
  console.log("======================================");

  try {
    await runTest("GET /tasks", {
      url: `${BASE_URL}/tasks`,
      method: "GET",
    });

    await runTest("POST /pomodoro-sessions", {
      url: `${BASE_URL}/pomodoro-sessions`,
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        duration: 25,
      }),
    });

    await runTest("GET /phrases/random", {
      url: `${BASE_URL}/phrases/random`,
      method: "GET",
    });

    const output = {
      generatedAt: new Date().toISOString(),
      configuration: {
        baseUrl: BASE_URL,
        connections: CONNECTIONS,
        durationSeconds: DURATION,
      },
      results,
    };

    const outputDirectory = path.join(__dirname, "results");

    fs.mkdirSync(outputDirectory, {
      recursive: true,
    });

    const outputFile = path.join(outputDirectory, "tasks-load-results.json");

    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), "utf8");

    console.log("\n======================================");
    console.log("PRUEBAS FINALIZADAS");
    console.log("======================================");
    console.log(`Resultados guardados en: ${outputFile}`);
  } catch (error) {
    console.error("\nError durante las pruebas de carga:");
    console.error(error);

    process.exitCode = 1;
  }
};

runLoadTests();
