// bruno-report.json -> result.json (formato común de ivan-qa-lab-shared/schema)
const fs = require("fs");
const [, , input, output] = process.argv;
const results = JSON.parse(fs.readFileSync(input, "utf8"))[0].results;
const roles = { "TC-API12": "Jugador MAD", "TC-API13": "Jugador MAD", "TC-API14": "Jugador FOE", "TC-API15": "Bloqueado", "TC-API16": "Jugador MAD", "TC-API17": "Super Admin" };
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
  tool: "bruno", target: "tactical-calendar", suite: process.env.SUITE || "api",
  started_at: new Date(now - total).toISOString(), finished_at: new Date(now).toISOString(), duration_ms: total,
  summary: { total: tests.length, passed: count("passed"), failed: count("failed"), skipped: count("skipped") },
  tests,
};
fs.writeFileSync(output, JSON.stringify(result, null, 2));
console.log(`result.json: ${result.summary.passed}/${result.summary.total} pasan, ${result.summary.skipped} omitidos`);
