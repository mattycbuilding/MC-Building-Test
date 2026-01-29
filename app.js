
// PATCH FILE — merge into your existing app.js

// === MASTER PIN (SHA-256 HASHED) ===
// PIN: 2645531350552
const MASTER_PIN_HASH = "0b2a4d6e1f16d8a8c74c8d2b8d4f2a2a8b6a0db59cfa3e2f2b94a9b93fdd6c3f";

async function verifyWorkerPin(inputPin, worker) {
  if (!worker) return false;

  // Profile Setup uses MASTER PIN
  if (worker.role === "profile_setup") {
    const hash = await sha256(inputPin);
    return hash === MASTER_PIN_HASH;
  }

  // Normal worker uses their own PIN
  if (!worker.pinHash) return false;
  const hash = await sha256(inputPin);
  return hash === worker.pinHash;
}
