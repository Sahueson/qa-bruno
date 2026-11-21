// bruno-report.json -> result.json (formato común de ivan-qa-lab-shared/schema)
const fs = require("fs");
const [, , input, output] = process.argv;
const results = JSON.parse(fs.readFileSync(input, "utf8"))[0].results;
const roles = {"TC-A01":"Anónimo","TC-A02":"Anónimo","TC-A03":"Jugador MAD","TC-A04":"Anónimo","TC-A05":"Jugador MAD","TC-A06":"Bloqueado","TC-A07":"Sin equipo","TC-A08":"Jugador MAD","TC-B01":"Anónimo","TC-B02":"Anónimo","TC-B03":"Anónimo","TC-B04":"Jugador MAD","TC-B05":"Jugador FOE","TC-B06":"Bloqueado","TC-B07":"Jugador MAD","TC-B08":"Super Admin","TC-B09":"Jugador FOE","TC-B10":"Admin MAD","TC-C01":"Anónimo","TC-C02":"Anónimo","TC-C03":"Sin equipo","TC-C04":"Bloqueado","TC-C05":"Jugador MAD","TC-C06":"Jugador FOE","TC-D01":"Anónimo","TC-D02":"Jugador FOE","TC-D03":"Jugador MAD","TC-D04":"Super Admin","TC-E01":"Anónimo","TC-E02":"Anónimo","TC-E03":"Jugador MAD","TC-E04":"Jugador FOE","TC-E05":"Admin FOE","TC-E06":"Jugador MAD","TC-E07":"Jugador FOE","TC-E08":"Jugador FOE","TC-F01":"Anónimo","TC-F02":"Anónimo","TC-F03":"Bloqueado","TC-F04":"Jugador FOE","TC-F05":"Jugador FOE","TC-G01":"Super Admin","TC-G02":"Jugador MAD","TC-G03":"Jugador FOE","TC-G04":"Jugador MAD","TC-G05":"Jugador MAD","TC-H01":"Anónimo","TC-H02":"Anónimo","TC-H03":"Jugador MAD","TC-H04":"Jugador MAD","TC-H05":"Jugador MAD","TC-I01":"Anónimo","TC-I02":"Jugador MAD","TC-I03":"Jugador MAD","TC-I04":"Jugador MAD","TC-I05":"Anónimo","TC-I06":"Anónimo"};
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
