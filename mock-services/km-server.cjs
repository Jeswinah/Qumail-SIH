/**
 * Mock Key Manager Server - ETSI GS QKD 014 Simulation
 * For testing and demonstration purposes
 */

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory key storage (simulate quantum key database)
const keyDatabase = new Map();
const keyStatus = new Map();

// Generate mock quantum key
function generateQuantumKey(size = 256) {
  return crypto.randomBytes(size / 8).toString("base64");
}

// Generate unique key ID
function generateKeyId() {
  return crypto.randomUUID();
}

// Initialize with some sample keys
function initializeKeys() {
  for (let i = 0; i < 10; i++) {
    const keyId = generateKeyId();
    const key = generateQuantumKey();
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

  // Add some OTP keys
  for (let i = 0; i < 20; i++) {
    const keyId = generateKeyId();
    const key = generateQuantumKey(1024);
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
}

// ETSI GS QKD 014 REST API Endpoints

// Get status of Key Manager
app.get("/api/v1/status", (req, res) => {
  const availableKeys = Array.from(keyDatabase.values()).filter(
    (k) => !k.used
  ).length;

  res.json({
    status: "active",
    timestamp: new Date().toISOString(),
    availableKeys,
    qkdRate: "1000 keys/minute",
    errorRate: "0.001%",
    version: "1.0.0",
  });
});

// Get encryption key
app.get("/api/v1/keys/:slave_sae_id/enc_keys", (req, res) => {
  const { slave_sae_id } = req.params;
  const { number = 1, size = 256, key_stream_id } = req.query;

  try {
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

    for (let i = 0; i < number; i++) {
      if (i < availableKeys.length) {
        const selectedKey = availableKeys[i];
        selectedKey.used = true;
        keys.push({
          key_ID: selectedKey.keyId,
          key: selectedKey.key,
          key_size: selectedKey.keySize,
          timestamp: selectedKey.timestamp,
        });
      }
    }

    res.json({
      keys,
      key_stream_ID: key_stream_id || generateKeyId(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: error.message,
    });
  }
});

// Get OTP keys
app.get("/api/v1/keys/:slave_sae_id/otp_keys", (req, res) => {
  const { slave_sae_id } = req.params;
  const { number = 1, size = 1024, key_stream_id } = req.query;

  try {
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

    for (let i = 0; i < number; i++) {
      if (i < availableKeys.length) {
        const selectedKey = availableKeys[i];
        selectedKey.used = true;
        keys.push({
          key_ID: selectedKey.keyId,
          key: selectedKey.key,
          key_size: selectedKey.keySize,
          timestamp: selectedKey.timestamp,
        });
      }
    }

    res.json({
      keys,
      key_stream_ID: key_stream_id || generateKeyId(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: error.message,
    });
  }
});

// Get key status
app.get("/api/v1/keys/:slave_sae_id/status", (req, res) => {
  const { slave_sae_id } = req.params;

  const totalKeys = keyDatabase.size;
  const usedKeys = Array.from(keyDatabase.values()).filter(
    (k) => k.used
  ).length;
  const availableKeys = totalKeys - usedKeys;

  res.json({
    source_KME_ID: "mock-kme-001",
    target_KME_ID: "mock-kme-002",
    master_SAE_ID: "demo-server-001",
    slave_SAE_ID: slave_sae_id,
    key_size: 256,
    stored_key_count: availableKeys,
    max_key_count: 1000,
    max_key_per_request: 10,
    max_key_size: 1024,
    min_key_size: 128,
    max_SAE_ID_count: 100,
    status_extension: {
      quantum_safe: true,
      qkd_rate: "1000 keys/minute",
      last_key_generation: new Date().toISOString(),
    },
  });
});

// Request quantum seed
app.get("/api/v1/quantum_seed", (req, res) => {
  const { length = 32 } = req.query;
  const seed = crypto.randomBytes(parseInt(length)).toString("base64");

  res.json({
    seed,
    length: parseInt(length),
    timestamp: new Date().toISOString(),
    entropy_source: "quantum_random_generator",
  });
});

// SAE registration endpoint
app.post("/api/v1/sae/:sae_id/register", (req, res) => {
  const { sae_id } = req.params;
  const { certificate, target_sae_id } = req.body;

  res.json({
    sae_id,
    status: "registered",
    timestamp: new Date().toISOString(),
    session_id: generateKeyId(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Mock Key Manager",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "Endpoint not found",
    path: req.path,
    method: req.method,
  });
});

// Initialize and start server
initializeKeys();

app.listen(PORT, () => {
  console.log(`🔑 Mock Key Manager Server running on port ${PORT}`);
  console.log(
    `📡 ETSI GS QKD 014 API available at http://localhost:${PORT}/api/v1`
  );
  console.log(`🔍 Status: http://localhost:${PORT}/api/v1/status`);
  console.log(`❤️ Health: http://localhost:${PORT}/health`);
  console.log(`📊 Available keys: ${keyDatabase.size}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down Mock Key Manager Server...");
  process.exit(0);
});

module.exports = app;
