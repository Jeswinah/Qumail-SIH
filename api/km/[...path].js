/**
 * Vercel Serverless Function for Key Manager API
 * ETSI GS QKD 014 Simulation
 */

const crypto = require("crypto");

// In-memory storage (will reset on each deployment)
let keyDatabase = new Map();
let initialized = false;

// Initialize keys if not already done
function initializeKeys() {
  if (initialized) return;

  for (let i = 0; i < 10; i++) {
    const keyId = crypto.randomUUID();
    const key = crypto.randomBytes(32).toString("base64");
    keyDatabase.set(keyId, {
      keyId,
      key,
      keySize: 256,
      saeId: "demo-client-001",
      targetSaeId: "demo-server-001",
      timestamp: new Date().toISOString(),
      used: false,
      keyType: "encryption",
    });
  }

  // Add OTP keys
  for (let i = 0; i < 20; i++) {
    const keyId = crypto.randomUUID();
    const key = crypto.randomBytes(128).toString("base64");
    keyDatabase.set(keyId, {
      keyId,
      key,
      keySize: 1024,
      saeId: "demo-client-001",
      targetSaeId: "demo-server-001",
      timestamp: new Date().toISOString(),
      used: false,
      keyType: "otp",
    });
  }

  initialized = true;
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  initializeKeys();

  const { method, url } = req;
  const pathname = new URL(url, `http://${req.headers.host}`).pathname;

  try {
    // Route handling
    if (method === "GET" && pathname === "/api/km/status") {
      const availableKeys = Array.from(keyDatabase.values()).filter(
        (k) => !k.used
      ).length;

      return res.json({
        status: "active",
        timestamp: new Date().toISOString(),
        availableKeys,
        qkdRate: "1000 keys/minute",
        errorRate: "0.001%",
        version: "1.0.0",
      });
    }

    if (method === "GET" && pathname.includes("/enc_keys")) {
      const saeIdMatch = pathname.match(/\/keys\/([^\/]+)\/enc_keys/);
      if (!saeIdMatch) {
        return res.status(400).json({ error: "Invalid SAE ID" });
      }

      const { number = 1, size = 256 } = req.query;
      const keys = [];
      const availableKeys = Array.from(keyDatabase.values()).filter(
        (k) => !k.used && k.keyType === "encryption" && k.keySize >= size
      );

      if (availableKeys.length < number) {
        return res.status(409).json({
          error: "INSUFFICIENT_KEYS",
          message: "Not enough keys available",
          available: availableKeys.length,
          requested: number,
        });
      }

      for (let i = 0; i < Math.min(number, availableKeys.length); i++) {
        const selectedKey = availableKeys[i];
        selectedKey.used = true;
        keys.push({
          key_ID: selectedKey.keyId,
          key: selectedKey.key,
          key_size: selectedKey.keySize,
          timestamp: selectedKey.timestamp,
        });
      }

      return res.json({
        keys,
        key_stream_ID: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      });
    }

    if (method === "GET" && pathname.includes("/otp_keys")) {
      const saeIdMatch = pathname.match(/\/keys\/([^\/]+)\/otp_keys/);
      if (!saeIdMatch) {
        return res.status(400).json({ error: "Invalid SAE ID" });
      }

      const { number = 1, size = 1024 } = req.query;
      const keys = [];
      const availableKeys = Array.from(keyDatabase.values()).filter(
        (k) => !k.used && k.keyType === "otp" && k.keySize >= size
      );

      if (availableKeys.length < number) {
        return res.status(409).json({
          error: "INSUFFICIENT_KEYS",
          message: "Not enough OTP keys available",
          available: availableKeys.length,
          requested: number,
        });
      }

      for (let i = 0; i < Math.min(number, availableKeys.length); i++) {
        const selectedKey = availableKeys[i];
        selectedKey.used = true;
        keys.push({
          key_ID: selectedKey.keyId,
          key: selectedKey.key,
          key_size: selectedKey.keySize,
          timestamp: selectedKey.timestamp,
        });
      }

      return res.json({
        keys,
        key_stream_ID: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      });
    }

    if (method === "GET" && pathname === "/api/km/quantum_seed") {
      const { length = 32 } = req.query;
      const seed = crypto.randomBytes(parseInt(length)).toString("base64");

      return res.json({
        seed,
        length: parseInt(length),
        timestamp: new Date().toISOString(),
        entropy_source: "quantum_random_generator",
      });
    }

    // Health check
    if (method === "GET" && pathname === "/api/km/health") {
      return res.json({
        status: "healthy",
        service: "Vercel KM Service",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
      });
    }

    // Default 404
    return res.status(404).json({
      error: "NOT_FOUND",
      message: "Endpoint not found",
      path: pathname,
      method,
    });
  } catch (error) {
    console.error("KM API Error:", error);
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    });
  }
};
