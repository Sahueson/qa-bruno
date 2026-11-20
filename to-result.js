// bruno-report.json -> result.json (formato común de ivan-qa-lab-shared/schema)
const fs = require("fs");
const [, , input, output] = process.argv;
const results = JSON.parse(fs.readFileSync(input, "utf8"))[0].results;
const roles = {"TC-API10":"Anónimo","TC-API11":"Anónimo","TC-API12":"Jugador MAD","TC-API05":"Anónimo","TC-API18":"Jugador MAD","TC-API19":"Bloqueado","TC-API20":"Sin equipo","TC-API21":"Jugador MAD","TC-API01":"Anónimo","TC-API06":"Anónimo","TC-API08":"Anónimo","TC-API13":"Jugador MAD","TC-API14":"Jugador FOE","TC-API15":"Bloqueado","TC-API16":"Jugador MAD","TC-API17":"Super Admin","TC-API22":"Jugador FOE","TC-API23":"Admin MAD","TC-API02":"Anónimo","TC-API24":"Anónimo","TC-API25":"Sin equipo","TC-API26":"Bloqueado","TC-API27":"Jugador MAD","TC-API28":"Jugador FOE","TC-API29":"Anónimo","TC-API30":"Jugador FOE","TC-API31":"Jugador MAD","TC-API32":"Super Admin","TC-API03":"Anónimo","TC-API04":"Anónimo","TC-API33":"Jugador MAD","TC-API34":"Jugador FOE","TC-API35":"Admin FOE","TC-API36":"Jugador MAD","TC-API37":"Jugador FOE","TC-API38":"Jugador FOE","TC-API07":"Anónimo","TC-API39":"Anónimo","TC-API40":"Bloqueado","TC-API41":"Jugador FOE","TC-API42":"Jugador FOE","TC-API43":"Super Admin","TC-API44":"Jugador MAD","TC-API45":"Jugador FOE","TC-API46":"Jugador MAD","TC-API47":"Jugador MAD","TC-API48":"Anónimo","TC-API49":"Anónimo","TC-API50":"Jugador MAD","TC-API51":"Jugador MAD","TC-API52":"Jugador MAD","TC-API53":"Anónimo","TC-API54":"Jugador MAD","TC-API55":"Jugador MAD","TC-API56":"Jugador MAD","TC-API57":"Anónimo","TC-API58":"Anónimo"};
const tests = results.map((r) => {
  const name = r.name || r.test.filename;
  const failedTest = (r.testResults || []).find((t) => t.status === "fail");
  const skipped = r.status === "skipped";
  return {
    name,
    status: skipped ? "skipped" : failedTest || r.status === "error" ? "failed" : "passed",
    duration_ms: Math.round((r.runDuration || 0) * 1000),
    role: roles[name.split(" ")[0]] || "Anónimo",
    error: failedTest ? failedTest.error || "Fallo en el test" : r.error || null,
    evidence_url: null,
  };
}).sort((a, b) => a.name.localeCompare(b.name));
const count = (s) => tests.filter((t) => t.status === s).length;
const total = tests.reduce((a, t) => a + t.duration_ms, 0);
const now = Date.now();
const result = {
  tool: "bruno", target: "tactical-calendar", suite: process.env.SUITE || "all",
  started_at: new Date(now - total).toISOString(), finished_at: new Date(now).toISOString(), duration_ms: total,
  summary: { total: tests.length, passed: count("passed"), failed: count("failed"), skipped: count("skipped") },
  tests,
};
fs.writeFileSync(output, JSON.stringify(result, null, 2));
console.log(`result.json: ${result.summary.passed}/${result.summary.total} pasan, ${result.summary.skipped} omitidos`);
