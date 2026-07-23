import { createTestDb, seedTestData } from "./server/tests/helpers/testDb.js";
import movementRepository from "./server/src/repositories/movement.repository.js";

const db = createTestDb();
seedTestData(db);
movementRepository.db = db;

console.log("--- Probando getAll con kind ---");
try {
  const r = movementRepository.getAll({ kind: "ingreso" }, { page: 1, limit: 10 });
  console.log("getAll OK:", r);
} catch (e) {
  console.log("getAll ERROR:", e.message);
}

console.log("--- Probando count con kind ---");
try {
  const c = movementRepository.count({ kind: "ingreso" });
  console.log("count OK:", c);
} catch (e) {
  console.log("count ERROR:", e.message);
}
