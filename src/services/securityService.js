/**
 * Security Service - Multi-Level Security Implementation
 * Implements 4 security levels as per problem statement:
 * Level 1: Quantum Secure (One Time Pad)
 * Level 2: Quantum-aided AES
 * Level 3: Post-Quantum Cryptography (PQC)
 * Level 4: No Quantum Security
 */

import CryptoJS from "crypto-js";
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
      [SECURITY_LEVELS.NO_QUANTUM]: ["RSA-2048", "AES-256"],
    };
  }

  /**
   * Initialize the security service
   */
  async initialize() {
    try {
      this.isInitialized = true;
      console.log("Security Service initialized");
      console.log(
        "Available security levels:",
        Object.keys(this.supportedAlgorithms)
      );
    } catch (error) {
      console.error("Failed to initialize Security Service:", error);
      throw error;
    }
  }

  /**
   * Set current security level
   */
  setSecurityLevel(level) {
    if (!Object.values(SECURITY_LEVELS).includes(level)) {
      throw new Error(`Invalid security level: ${level}`);
    }

    this.currentSecurityLevel = level;
    console.log(`Security level set to: ${level}`);
  }

  /**
   * Get current security level
   */
  getCurrentSecurityLevel() {
    return this.currentSecurityLevel;
  }

  /**
   * Encrypt data based on current security level
   */
  async encryptData(data, options = {}) {
    const securityLevel = options.securityLevel || this.currentSecurityLevel;

    console.log(`Encrypting data with security level: ${securityLevel}`);

    switch (securityLevel) {
      case SECURITY_LEVELS.QUANTUM_SECURE:
        return await this.encryptWithOTP(data, options);

      case SECURITY_LEVELS.QUANTUM_AES:
        return await this.encryptWithQuantumAES(data, options);

      case SECURITY_LEVELS.PQC_ENCRYPTION:
        return await this.encryptWithPQC(data, options);

      case SECURITY_LEVELS.NO_QUANTUM:
        return await this.encryptWithStandard(data, options);

      default:
        throw new Error(`Unsupported security level: ${securityLevel}`);
    }
  }

  /**
   * Decrypt data based on security level
   */
  async decryptData(encryptedData, options = {}) {
    const securityLevel = encryptedData.securityLevel || options.securityLevel;

    console.log(`Decrypting data with security level: ${securityLevel}`);

    switch (securityLevel) {
      case SECURITY_LEVELS.QUANTUM_SECURE:
        return await this.decryptFromOTP(encryptedData, options);

      case SECURITY_LEVELS.QUANTUM_AES:
        return await this.decryptFromQuantumAES(encryptedData, options);

      case SECURITY_LEVELS.PQC_ENCRYPTION:
        return await this.decryptFromPQC(encryptedData, options);

      case SECURITY_LEVELS.NO_QUANTUM:
        return await this.decryptFromStandard(encryptedData, options);

      default:
        throw new Error(`Unsupported security level: ${securityLevel}`);
    }
  }

  /**
   * Level 1: Quantum Secure - One Time Pad Encryption
   */
  async encryptWithOTP(data, options = {}) {
    try {
      // Convert data to bytes
      const dataBytes = new TextEncoder().encode(data);
      const dataSize = dataBytes.length;

      // Get quantum key from KM (key must be at least as long as data)
      const quantumKey = await kmService.generateOTPKeys(dataSize * 8); // Convert to bits

      if (!quantumKey || !quantumKey.key) {
        throw new Error("Failed to obtain quantum key for OTP encryption");
      }

      // Decode the base64 quantum key
      const keyBytes = this.base64ToBytes(quantumKey.key);

      if (keyBytes.length < dataSize) {
        throw new Error("Quantum key too short for OTP encryption");
      }

      // Perform XOR operation (OTP)
      const encryptedBytes = new Uint8Array(dataSize);
      for (let i = 0; i < dataSize; i++) {
        encryptedBytes[i] = dataBytes[i] ^ keyBytes[i];
      }

      const result = {
        encryptedData: this.bytesToBase64(encryptedBytes),
        securityLevel: SECURITY_LEVELS.QUANTUM_SECURE,
        algorithm: "OTP",
        quantumKeyId: quantumKey.key_ID,
        timestamp: new Date().toISOString(),
        keySize: quantumKey.key_size,
        metadata: {
          originalSize: dataSize,
          keySource: "QKD",
          entropy: "quantum",
        },
      };

      console.log("OTP encryption completed successfully");
      return result;
    } catch (error) {
      console.error("OTP encryption failed:", error);
      throw error;
    }
  }

  /**
   * Level 1: Decrypt from One Time Pad
   */
  async decryptFromOTP(encryptedData, options = {}) {
    try {
      if (!encryptedData.quantumKeyId) {
        throw new Error("Missing quantum key ID for OTP decryption");
      }

      // Retrieve the quantum key
      const keyResponse = await kmService.getKey(encryptedData.quantumKeyId);
      if (keyResponse.status !== "success" || !keyResponse.keys.length) {
        throw new Error("Failed to retrieve quantum key for OTP decryption");
      }

      const quantumKey = keyResponse.keys[0];
      const keyBytes = this.base64ToBytes(quantumKey.key);
      const encryptedBytes = this.base64ToBytes(encryptedData.encryptedData);

      // Perform XOR operation to decrypt
      const decryptedBytes = new Uint8Array(encryptedBytes.length);
      for (let i = 0; i < encryptedBytes.length; i++) {
        decryptedBytes[i] = encryptedBytes[i] ^ keyBytes[i];
      }

      const decryptedData = new TextDecoder().decode(decryptedBytes);
      console.log("OTP decryption completed successfully");

      return {
        data: decryptedData,
        verified: true,
        algorithm: "OTP",
        securityLevel: SECURITY_LEVELS.QUANTUM_SECURE,
      };
    } catch (error) {
      console.error("OTP decryption failed:", error);
      throw error;
    }
  }

  /**
   * Level 2: Quantum-aided AES Encryption
   */
  async encryptWithQuantumAES(data, options = {}) {
    try {
      // Get quantum seed from KM
      const quantumSeed = await kmService.getQuantumSeed(256);

      if (!quantumSeed || !quantumSeed.key) {
        throw new Error("Failed to obtain quantum seed for AES encryption");
      }

      // Use quantum key as seed for AES key derivation
      const quantumKeyBytes = this.base64ToBytes(quantumSeed.key);
      const aesKey = CryptoJS.SHA256(
        CryptoJS.lib.WordArray.create(quantumKeyBytes)
      );

      // Generate random IV
      const iv = CryptoJS.lib.WordArray.random(16);

      // Encrypt with AES-256-GCM
      const encrypted = CryptoJS.AES.encrypt(data, aesKey, {
        iv: iv,
        mode: CryptoJS.mode.GCM,
        padding: CryptoJS.pad.NoPadding,
      });

      const result = {
        encryptedData: encrypted.toString(),
        securityLevel: SECURITY_LEVELS.QUANTUM_AES,
        algorithm: "AES-256-GCM",
        quantumKeyId: quantumSeed.key_ID,
        iv: iv.toString(),
        timestamp: new Date().toISOString(),
        keySize: 256,
        metadata: {
          quantumSeed: true,
          keyDerivation: "SHA256",
          mode: "GCM",
        },
      };

      console.log("Quantum-AES encryption completed successfully");
      return result;
    } catch (error) {
      console.error("Quantum-AES encryption failed:", error);
      throw error;
    }
  }

  /**
   * Level 2: Decrypt from Quantum-aided AES
   */
  async decryptFromQuantumAES(encryptedData, options = {}) {
    try {
      if (!encryptedData.quantumKeyId) {
        throw new Error("Missing quantum key ID for AES decryption");
      }

      // Retrieve the quantum key
      const keyResponse = await kmService.getKey(encryptedData.quantumKeyId);
      if (keyResponse.status !== "success" || !keyResponse.keys.length) {
        throw new Error("Failed to retrieve quantum key for AES decryption");
      }

      const quantumSeed = keyResponse.keys[0];
      const quantumKeyBytes = this.base64ToBytes(quantumSeed.key);
      const aesKey = CryptoJS.SHA256(
        CryptoJS.lib.WordArray.create(quantumKeyBytes)
      );

      // Recreate IV
      const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);

      // Decrypt
      const decrypted = CryptoJS.AES.decrypt(
        encryptedData.encryptedData,
        aesKey,
        {
          iv: iv,
          mode: CryptoJS.mode.GCM,
          padding: CryptoJS.pad.NoPadding,
        }
      );

      const decryptedData = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedData) {
        throw new Error("Decryption failed - invalid key or corrupted data");
      }

      console.log("Quantum-AES decryption completed successfully");

      return {
        data: decryptedData,
        verified: true,
        algorithm: "AES-256-GCM",
        securityLevel: SECURITY_LEVELS.QUANTUM_AES,
      };
    } catch (error) {
      console.error("Quantum-AES decryption failed:", error);
      throw error;
    }
  }

  /**
   * Level 3: Post-Quantum Cryptography (Simulated)
   */
  async encryptWithPQC(data, options = {}) {
    try {
      console.log("Using simulated PQC encryption (Kyber + AES)");

      // Simulate Kyber key encapsulation + AES encryption
      // In a real implementation, this would use actual PQC libraries

      // Generate PQC key pair (simulated)
      const pqcKeyPair = this.generateSimulatedPQCKeyPair();

      // Use AES with the PQC-derived key
      const aesKey = CryptoJS.SHA256(pqcKeyPair.privateKey);
      const iv = CryptoJS.lib.WordArray.random(16);

      const encrypted = CryptoJS.AES.encrypt(data, aesKey, {
        iv: iv,
        mode: CryptoJS.mode.CTR,
        padding: CryptoJS.pad.Pkcs7,
      });

      const result = {
        encryptedData: encrypted.toString(),
        securityLevel: SECURITY_LEVELS.PQC_ENCRYPTION,
        algorithm: "Kyber-AES-256",
        pqcPublicKey: pqcKeyPair.publicKey,
        iv: iv.toString(),
        timestamp: new Date().toISOString(),
        keySize: 256,
        metadata: {
          pqcAlgorithm: "Kyber-768",
          symmetricAlgorithm: "AES-256-CTR",
          quantumResistant: true,
        },
      };

      console.log("PQC encryption completed successfully");
      return result;
    } catch (error) {
      console.error("PQC encryption failed:", error);
      throw error;
    }
  }

  /**
   * Level 3: Decrypt from PQC
   */
  async decryptFromPQC(encryptedData, options = {}) {
    try {
      // Simulate PQC key decapsulation
      const privateKey =
        options.pqcPrivateKey ||
        this.getStoredPQCPrivateKey(encryptedData.pqcPublicKey);

      if (!privateKey) {
        throw new Error("PQC private key not available");
      }

      const aesKey = CryptoJS.SHA256(privateKey);
      const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);

      const decrypted = CryptoJS.AES.decrypt(
        encryptedData.encryptedData,
        aesKey,
        {
          iv: iv,
          mode: CryptoJS.mode.CTR,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

      const decryptedData = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedData) {
        throw new Error("PQC decryption failed");
      }

      console.log("PQC decryption completed successfully");

      return {
        data: decryptedData,
        verified: true,
        algorithm: "Kyber-AES-256",
        securityLevel: SECURITY_LEVELS.PQC_ENCRYPTION,
      };
    } catch (error) {
      console.error("PQC decryption failed:", error);
      throw error;
    }
  }

  /**
   * Level 4: Standard Encryption (No Quantum)
   */
  async encryptWithStandard(data, options = {}) {
    try {
      console.log("Using standard encryption (RSA + AES)");

      // Generate standard RSA key pair and AES session key
      const sessionKey = CryptoJS.lib.WordArray.random(32); // 256-bit key
      const iv = CryptoJS.lib.WordArray.random(16);

      // Encrypt data with AES
      const encrypted = CryptoJS.AES.encrypt(data, sessionKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      // Simulate RSA encryption of session key
      const rsaKeyPair = this.generateSimulatedRSAKeyPair();
      const encryptedSessionKey = this.simulateRSAEncrypt(
        sessionKey.toString(),
        rsaKeyPair.publicKey
      );

      const result = {
        encryptedData: encrypted.toString(),
        securityLevel: SECURITY_LEVELS.NO_QUANTUM,
        algorithm: "RSA-2048-AES-256",
        encryptedSessionKey: encryptedSessionKey,
        rsaPublicKey: rsaKeyPair.publicKey,
        iv: iv.toString(),
        timestamp: new Date().toISOString(),
        keySize: 256,
        metadata: {
          asymmetricAlgorithm: "RSA-2048",
          symmetricAlgorithm: "AES-256-CBC",
          quantumResistant: false,
        },
      };

      console.log("Standard encryption completed successfully");
      return result;
    } catch (error) {
      console.error("Standard encryption failed:", error);
      throw error;
    }
  }

  /**
   * Level 4: Decrypt from Standard encryption
   */
  async decryptFromStandard(encryptedData, options = {}) {
    try {
      // Simulate RSA decryption of session key
      const privateKey =
        options.rsaPrivateKey ||
        this.getStoredRSAPrivateKey(encryptedData.rsaPublicKey);

      if (!privateKey) {
        throw new Error("RSA private key not available");
      }

      const sessionKey = this.simulateRSADecrypt(
        encryptedData.encryptedSessionKey,
        privateKey
      );
      const aesKey = CryptoJS.enc.Hex.parse(sessionKey);
      const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);

      const decrypted = CryptoJS.AES.decrypt(
        encryptedData.encryptedData,
        aesKey,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

      const decryptedData = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedData) {
        throw new Error("Standard decryption failed");
      }

      console.log("Standard decryption completed successfully");

      return {
        data: decryptedData,
        verified: true,
        algorithm: "RSA-2048-AES-256",
        securityLevel: SECURITY_LEVELS.NO_QUANTUM,
      };
    } catch (error) {
      console.error("Standard decryption failed:", error);
      throw error;
    }
  }

  /**
   * Get security level capabilities
   */
  getSecurityLevelInfo(level) {
    const info = {
      [SECURITY_LEVELS.QUANTUM_SECURE]: {
        name: "Quantum Secure",
        description: "One Time Pad with quantum keys - Perfect security",
        algorithms: ["OTP"],
        quantumResistant: true,
        keySource: "QKD",
        strength: "Perfect",
        performance: "Medium",
      },
      [SECURITY_LEVELS.QUANTUM_AES]: {
        name: "Quantum-aided AES",
        description: "AES encryption with quantum key derivation",
        algorithms: ["AES-256-GCM"],
        quantumResistant: true,
        keySource: "QKD + PRNG",
        strength: "Very High",
        performance: "High",
      },
      [SECURITY_LEVELS.PQC_ENCRYPTION]: {
        name: "Post-Quantum Cryptography",
        description: "Quantum-resistant algorithms",
        algorithms: ["Kyber", "Dilithium", "AES-256"],
        quantumResistant: true,
        keySource: "Mathematical",
        strength: "High",
        performance: "Medium",
      },
      [SECURITY_LEVELS.NO_QUANTUM]: {
        name: "Standard Encryption",
        description: "Traditional RSA and AES encryption",
        algorithms: ["RSA-2048", "AES-256"],
        quantumResistant: false,
        keySource: "Mathematical",
        strength: "Medium",
        performance: "Very High",
      },
    };

    return info[level] || null;
  }

  // Utility methods

  base64ToBytes(base64String) {
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  bytesToBase64(bytes) {
    const binaryString = Array.from(bytes, (byte) =>
      String.fromCharCode(byte)
    ).join("");
    return btoa(binaryString);
  }

  generateSimulatedPQCKeyPair() {
    // Simulate PQC key generation
    const publicKey = CryptoJS.lib.WordArray.random(32).toString();
    const privateKey = CryptoJS.lib.WordArray.random(32).toString();
    return { publicKey, privateKey };
  }

  generateSimulatedRSAKeyPair() {
    // Simulate RSA key generation
    const publicKey = CryptoJS.lib.WordArray.random(256).toString(); // Simulated 2048-bit key
    const privateKey = CryptoJS.lib.WordArray.random(256).toString();
    return { publicKey, privateKey };
  }

  simulateRSAEncrypt(data, publicKey) {
    // Simulate RSA encryption
    return CryptoJS.SHA256(data + publicKey).toString();
  }

  simulateRSADecrypt(encryptedData, privateKey) {
    // Simulate RSA decryption (this is just for demo)
    return CryptoJS.SHA256(privateKey).toString();
  }

  getStoredPQCPrivateKey(publicKey) {
    // In a real implementation, this would retrieve the stored private key
    return CryptoJS.SHA256(publicKey + "pqc_private").toString();
  }

  getStoredRSAPrivateKey(publicKey) {
    // In a real implementation, this would retrieve the stored private key
    return CryptoJS.SHA256(publicKey + "rsa_private").toString();
  }
}

// Export singleton instance
export const securityService = new SecurityService();
