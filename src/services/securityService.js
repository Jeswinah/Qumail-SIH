/**
 * Security Service - Frontend Mock Implementation
 * Simulates 4 security levels without crypto dependencies
 * Level 1: Quantum Secure (One Time Pad)
 * Level 2: Quantum-aided AES
 * Level 3: Post-Quantum Cryptography (PQC)
 * Level 4: No Quantum Security
 */

import { kmService } from "./kmService";
import { SECURITY_LEVELS } from "../types";

class SecurityService {
  constructor() {
    this.currentSecurityLevel = SECURITY_LEVELS.QUANTUM_SECURE;
    this.isInitialized = false;
    this.supportedAlgorithms = {
      [SECURITY_LEVELS.QUANTUM_SECURE]: ["OTP"],
      [SECURITY_LEVELS.QUANTUM_AES]: ["AES-256-GCM", "AES-192-GCM"],
      [SECURITY_LEVELS.PQC_ENCRYPTION]: ["Kyber", "Dilithium", "AES-256"],
      [SECURITY_LEVELS.NO_QUANTUM]: ["AES-256-GCM", "RSA-2048"],
    };
    this.simulateDelay = 300;
  }

  /**
   * Initialize the security service
   */
  async initialize() {
    try {
      await new Promise((resolve) => setTimeout(resolve, this.simulateDelay));
      this.isInitialized = true;
      console.log("Security Service initialized (Mock Mode)");
    } catch (error) {
      console.error("Failed to initialize Security Service:", error);
      throw error;
    }
  }

  /**
   * Set current security level
   */
  setSecurityLevel(level) {
    if (Object.values(SECURITY_LEVELS).includes(level)) {
      this.currentSecurityLevel = level;
      console.log(`Security level set to: ${level}`);
    } else {
      throw new Error(`Invalid security level: ${level}`);
    }
  }

  /**
   * Get current security level
   */
  getCurrentSecurityLevel() {
    return this.currentSecurityLevel;
  }

  /**
   * Get supported algorithms for current security level
   */
  getSupportedAlgorithms(securityLevel = this.currentSecurityLevel) {
    return this.supportedAlgorithms[securityLevel] || [];
  }

  /**
   * Simulate encryption for demo purposes
   */
  async encryptData(data, securityLevel = this.currentSecurityLevel) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      await new Promise((resolve) => setTimeout(resolve, this.simulateDelay));

      const encryptionId = `enc_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 10)}`;

      // Mock encrypted data - in real implementation this would be actual encryption
      const mockEncryptedData = btoa(
        JSON.stringify({
          original: data,
          timestamp: new Date().toISOString(),
          securityLevel: securityLevel,
        })
      );

      return {
        encryptedData: mockEncryptedData,
        encryptionId: encryptionId,
        securityLevel: securityLevel,
        algorithm: this.getSupportedAlgorithms(securityLevel)[0],
        timestamp: new Date().toISOString(),
        keyId: `key_${encryptionId}`,
        metadata: {
          originalSize: data.length,
          encryptedSize: mockEncryptedData.length,
          compressionRatio: 1.0,
        },
      };
    } catch (error) {
      console.error("Encryption failed:", error);
      throw error;
    }
  }

  /**
   * Simulate decryption for demo purposes
   */
  async decryptData(encryptedData, _securityLevel = this.currentSecurityLevel) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      await new Promise((resolve) => setTimeout(resolve, this.simulateDelay));

      // Mock decryption - extract original data
      try {
        const decoded = JSON.parse(atob(encryptedData.encryptedData));
        return decoded.original;
      } catch {
        // If it's not our mock format, return a placeholder
        return "[Encrypted Content - Demo Mode]";
      }
    } catch (error) {
      console.error("Decryption failed:", error);
      throw error;
    }
  }

  /**
   * Get security level information
   */
  getSecurityLevelInfo(level = this.currentSecurityLevel) {
    const info = {
      [SECURITY_LEVELS.QUANTUM_SECURE]: {
        name: "Quantum Secure (Level 4)",
        description: "One-Time Pad encryption with quantum keys",
        strength: "Information-theoretic security",
        keySource: "Quantum Key Distribution",
        algorithms: ["OTP"],
        quantumResistant: true,
        performance: "High latency, maximum security",
      },
      [SECURITY_LEVELS.QUANTUM_AES]: {
        name: "Quantum-aided AES (Level 3)",
        description: "AES encryption with quantum-derived keys",
        strength: "Quantum-enhanced symmetric encryption",
        keySource: "QKD + Key Derivation",
        algorithms: ["AES-256-GCM", "AES-192-GCM"],
        quantumResistant: true,
        performance: "Medium latency, high security",
      },
      [SECURITY_LEVELS.PQC_ENCRYPTION]: {
        name: "Post-Quantum Cryptography (Level 2)",
        description: "Quantum-resistant public key algorithms",
        strength: "Post-quantum secure asymmetric encryption",
        keySource: "PQC Key Generation",
        algorithms: ["Kyber", "Dilithium", "AES-256"],
        quantumResistant: true,
        performance: "Low latency, future-proof security",
      },
      [SECURITY_LEVELS.NO_QUANTUM]: {
        name: "Standard Encryption (Level 1)",
        description: "Traditional AES encryption",
        strength: "Classical computational security",
        keySource: "Standard Key Generation",
        algorithms: ["AES-256-GCM", "RSA-2048"],
        quantumResistant: false,
        performance: "Very low latency, standard security",
      },
    };

    return info[level] || null;
  }

  /**
   * Check if security level requires quantum keys
   */
  requiresQuantumKeys(securityLevel = this.currentSecurityLevel) {
    return [
      SECURITY_LEVELS.QUANTUM_SECURE,
      SECURITY_LEVELS.QUANTUM_AES,
    ].includes(securityLevel);
  }

  /**
   * Get current security status
   */
  getSecurityStatus() {
    return {
      isInitialized: this.isInitialized,
      currentSecurityLevel: this.currentSecurityLevel,
      quantumKeysAvailable: this.requiresQuantumKeys()
        ? kmService.isConnected
        : true,
      lastSecurityCheck: new Date(),
      mode: "frontend-mock",
    };
  }
}

// Export singleton instance
export const securityService = new SecurityService();
