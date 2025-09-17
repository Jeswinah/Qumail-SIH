/**
 * Mock Key Manager Server - ETSI GS QKD 014 Simulation
 * For testing and demonstration purposes
 */

import express from "express";
import cors from "cors";
import crypto from "crypto";

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory key storage (simulate quantum key database)
const keyDatabase = new Map();
const keyStatus = new Map();

// Generate mock quantum key
function generateQuantumKey(keyId, size = 256) {
  const key = crypto.randomBytes(size / 8).toString("base64");
  const timestamp = new Date().toISOString();

  const quantumKey = {
    key_ID: keyId,
    key: key,
    key_size: size,
    algorithm_type: "QUANTUM",
    timestamp: timestamp,
    status: "available",
    metadata: {
      generated_by: "Mock QKD System",
      entropy_source: "Simulated Quantum Source",
      correlation_coefficient: Math.random().toFixed(6),
    },
  };

  keyDatabase.set(keyId, quantumKey);
  keyStatus.set(keyId, "available");

  return quantumKey;
}

// Initialize with some sample keys
for (let i = 1; i <= 10; i++) {
  generateQuantumKey(`QK_${Date.now()}_${i}`, 256);
}

// Health check endpoint
app.get("/api/v1/status", (req, res) => {
  res.json({
    status: "online",
    service: "Mock QKD Key Manager",
    version: "1.0.0",
    etsi_compliance: "GS QKD 014",
    available_keys: keyDatabase.size,
    timestamp: new Date().toISOString(),
  });
});

// Get key by ID - ETSI GS QKD 014 compliant
app.get("/api/v1/keys/:key_ID", (req, res) => {
  const keyId = req.params.key_ID;
  const saeId = req.query.sae_id;

  console.log(`Key request: ${keyId} from SAE: ${saeId}`);

  if (!saeId) {
    return res.status(400).json({
      error_code: "MISSING_SAE_ID",
      message: "SAE ID is required",
    });
  }

  // If specific key requested
  if (keyId !== "new") {
    const key = keyDatabase.get(keyId);
    if (!key) {
      return res.status(404).json({
        error_code: "KEY_NOT_FOUND",
        message: `Key ${keyId} not found`,
      });
    }

    // Mark key as consumed after retrieval
    keyStatus.set(keyId, "consumed");
    key.status = "consumed";

    return res.json({
      keys: [key],
    });
  }

  // Generate new key
  const newKeyId = `QK_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  const newKey = generateQuantumKey(newKeyId, 256);

  res.json({
    keys: [newKey],
  });
});

// Get key with additional key IDs
app.post("/api/v1/keys/:key_ID/with_key_IDs", (req, res) => {
  const keyId = req.params.key_ID;
  const { additional_key_IDs, sae_id } = req.body;

  console.log(
    `Multiple key request: ${keyId} + ${
      additional_key_IDs?.length || 0
    } additional keys`
  );

  if (!sae_id) {
    return res.status(400).json({
      error_code: "MISSING_SAE_ID",
      message: "SAE ID is required",
    });
  }

  const keys = [];

  // Get primary key
  let primaryKey = keyDatabase.get(keyId);
  if (!primaryKey) {
    primaryKey = generateQuantumKey(keyId, 256);
  }
  keys.push(primaryKey);

  // Get additional keys
  if (additional_key_IDs && Array.isArray(additional_key_IDs)) {
    additional_key_IDs.forEach((id) => {
      let key = keyDatabase.get(id);
      if (!key) {
        key = generateQuantumKey(id, 256);
      }
      keys.push(key);
    });
  }

  // Mark all keys as consumed
  keys.forEach((key) => {
    keyStatus.set(key.key_ID, "consumed");
    key.status = "consumed";
  });

  res.json({ keys });
});

// Get key status
app.get("/api/v1/keys/:key_ID/status", (req, res) => {
  const keyId = req.params.key_ID;
  const saeId = req.query.sae_id;

  if (!saeId) {
    return res.status(400).json({
      error_code: "MISSING_SAE_ID",
      message: "SAE ID is required",
    });
  }

  const status = keyStatus.get(keyId) || "not_found";

  res.json({
    key_ID: keyId,
    status: status,
    timestamp: new Date().toISOString(),
  });
});

// Generate encryption keys for slave SAE
app.post("/api/v1/keys/:slave_SAE_ID/enc_keys", (req, res) => {
  const slaveId = req.params.slave_SAE_ID;
  const { size = 256, master_sae_id, algorithm_type = "AES" } = req.body;

  console.log(
    `Encryption key request: ${size} bits for ${slaveId} from ${master_sae_id}`
  );

  if (!master_sae_id) {
    return res.status(400).json({
      error_code: "MISSING_MASTER_SAE_ID",
      message: "Master SAE ID is required",
    });
  }

  // Generate multiple keys for redundancy
  const keyCount = Math.ceil(size / 256);
  const keys = [];

  for (let i = 0; i < keyCount; i++) {
    const keyId = `ENC_${Date.now()}_${slaveId}_${i}`;
    const key = generateQuantumKey(keyId, Math.min(size, 256));
    key.algorithm_type = algorithm_type;
    key.slave_sae_id = slaveId;
    key.master_sae_id = master_sae_id;
    keys.push(key);
  }

  res.json({ keys });
});

// Get decryption keys for slave SAE
app.post("/api/v1/keys/:slave_SAE_ID/dec_keys", (req, res) => {
  const slaveId = req.params.slave_SAE_ID;
  const { key_IDs, master_sae_id } = req.body;

  console.log(
    `Decryption key request: ${key_IDs?.length || 0} keys for ${slaveId}`
  );

  if (!master_sae_id) {
    return res.status(400).json({
      error_code: "MISSING_MASTER_SAE_ID",
      message: "Master SAE ID is required",
    });
  }

  if (!key_IDs || !Array.isArray(key_IDs)) {
    return res.status(400).json({
      error_code: "MISSING_KEY_IDS",
      message: "Key IDs array is required",
    });
  }

  const keys = [];

  key_IDs.forEach((keyId) => {
    let key = keyDatabase.get(keyId);
    if (!key) {
      // If key not found, generate a corresponding key
      key = generateQuantumKey(keyId, 256);
    }

    // Mark as used for decryption
    key.status = "consumed";
    keyStatus.set(keyId, "consumed");
    keys.push(key);
  });

  res.json({ keys });
});

// List all available keys (for debugging)
app.get("/api/v1/keys", (req, res) => {
  const keys = Array.from(keyDatabase.values()).map((key) => ({
    key_ID: key.key_ID,
    key_size: key.key_size,
    algorithm_type: key.algorithm_type,
    timestamp: key.timestamp,
    status: key.status,
  }));

  res.json({
    total_keys: keys.length,
    keys: keys,
  });
});

// Generate new quantum keys endpoint (for demo)
app.post("/api/v1/generate", (req, res) => {
  const { count = 1, size = 256 } = req.body;
  const keys = [];

  for (let i = 0; i < count; i++) {
    const keyId = `GEN_${Date.now()}_${i}`;
    const key = generateQuantumKey(keyId, size);
    keys.push(key);
  }

  res.json({
    message: `Generated ${count} quantum keys`,
    keys: keys,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error_code: "INTERNAL_ERROR",
    message: "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔐 Mock QKD Key Manager Server running on port ${PORT}`);
  console.log(`📡 ETSI GS QKD 014 compliant endpoints available`);
  console.log(`🔑 ${keyDatabase.size} quantum keys pre-generated`);
  console.log(`🌐 CORS enabled for browser access`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  /api/v1/status - Health check`);
  console.log(`  GET  /api/v1/keys/:key_ID - Get specific key`);
  console.log(`  POST /api/v1/keys/:key_ID/with_key_IDs - Get multiple keys`);
  console.log(`  GET  /api/v1/keys/:key_ID/status - Get key status`);
  console.log(
    `  POST /api/v1/keys/:slave_SAE_ID/enc_keys - Generate encryption keys`
  );
  console.log(
    `  POST /api/v1/keys/:slave_SAE_ID/dec_keys - Get decryption keys`
  );
  console.log(`  GET  /api/v1/keys - List all keys (debug)`);
  console.log(`  POST /api/v1/generate - Generate new keys (demo)`);
});
