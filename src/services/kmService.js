/**
 * Key Manager Service - ETSI GS QKD 014 Implementation
 * Handles quantum key distribution and management
 */

import axios from "axios";
import { KM_API_ENDPOINTS, KEY_STATES } from "../types";

class KMService {
  constructor() {
    this.baseURL = "http://localhost:8080"; // Default KM endpoint
    this.apiKey = null;
    this.saeId = null; // Secure Application Entity ID
    this.isConnected = false;
    this.client = null;
  }

  /**
   * Initialize the KM service
   */
  async initialize() {
    try {
      // Create axios client with default configuration
      this.client = axios.create({
        baseURL: this.baseURL,
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      // Add request interceptor for authentication
      this.client.interceptors.request.use(
        (config) => {
          if (this.apiKey) {
            config.headers.Authorization = `Bearer ${this.apiKey}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Add response interceptor for error handling
      this.client.interceptors.response.use(
        (response) => response,
        (error) => {
          console.error("KM API Error:", error.response?.data || error.message);
          return Promise.reject(error);
        }
      );

      console.log("KM Service initialized");
    } catch (error) {
      console.error("Failed to initialize KM Service:", error);
      throw error;
    }
  }

  /**
   * Configure KM connection
   */
  async configure(config) {
    this.baseURL = config.endpoint;
    this.apiKey = config.apiKey;
    this.saeId = config.saeId;

    // Update client base URL
    if (this.client) {
      this.client.defaults.baseURL = this.baseURL;
    }

    return this.testConnection();
  }

  /**
   * Test connection to KM
   */
  async testConnection() {
    try {
      // Use a simple health check or status endpoint
      const response = await this.client.get("/api/v1/status");
      this.isConnected = response.status === 200;
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      console.error("KM connection test failed:", error);
      return false;
    }
  }

  /**
   * Get a quantum key by ID (ETSI GS QKD 014)
   */
  async getKey(keyId, additionalOptions = {}) {
    try {
      const endpoint = KM_API_ENDPOINTS.GET_KEY.replace("{key_ID}", keyId);
      const response = await this.client.get(endpoint, {
        params: {
          ...additionalOptions,
          sae_id: this.saeId,
        },
      });

      return {
        status: "success",
        keys: response.data.keys || [response.data],
        message: "Key retrieved successfully",
      };
    } catch (error) {
      return {
        status: "error",
        error_code: error.response?.data?.error_code || "KM_ERROR",
        error_message: error.response?.data?.message || error.message,
        keys: [],
      };
    }
  }

  /**
   * Get key with additional key IDs
   */
  async getKeyWithIds(keyId, additionalKeyIds = []) {
    try {
      const endpoint = KM_API_ENDPOINTS.GET_KEY_WITH_IDS.replace(
        "{key_ID}",
        keyId
      );
      const response = await this.client.post(endpoint, {
        additional_key_IDs: additionalKeyIds,
        sae_id: this.saeId,
      });

      return {
        status: "success",
        keys: response.data.keys || [],
        message: "Keys retrieved successfully",
      };
    } catch (error) {
      return {
        status: "error",
        error_code: error.response?.data?.error_code || "KM_ERROR",
        error_message: error.response?.data?.message || error.message,
        keys: [],
      };
    }
  }

  /**
   * Get key status
   */
  async getKeyStatus(keyId) {
    try {
      const endpoint = KM_API_ENDPOINTS.GET_STATUS.replace("{key_ID}", keyId);
      const response = await this.client.get(endpoint, {
        params: { sae_id: this.saeId },
      });

      return {
        status: "success",
        key_status: response.data.status,
        message: "Key status retrieved successfully",
      };
    } catch (error) {
      return {
        status: "error",
        error_code: error.response?.data?.error_code || "KM_ERROR",
        error_message: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Request new encryption key
   */
  async requestEncryptionKey(slaveId, keySize = 256) {
    try {
      const endpoint = KM_API_ENDPOINTS.ENCODE_KEY.replace(
        "{slave_SAE_ID}",
        slaveId
      );
      const response = await this.client.post(endpoint, {
        size: keySize,
        master_sae_id: this.saeId,
        algorithm_type: "AES",
      });

      return {
        status: "success",
        keys: response.data.keys || [],
        message: "Encryption key generated successfully",
      };
    } catch (error) {
      return {
        status: "error",
        error_code: error.response?.data?.error_code || "KM_ERROR",
        error_message: error.response?.data?.message || error.message,
        keys: [],
      };
    }
  }

  /**
   * Request decryption key
   */
  async requestDecryptionKey(slaveId, keyIds) {
    try {
      const endpoint = KM_API_ENDPOINTS.DECODE_KEY.replace(
        "{slave_SAE_ID}",
        slaveId
      );
      const response = await this.client.post(endpoint, {
        key_IDs: Array.isArray(keyIds) ? keyIds : [keyIds],
        master_sae_id: this.saeId,
      });

      return {
        status: "success",
        keys: response.data.keys || [],
        message: "Decryption keys retrieved successfully",
      };
    } catch (error) {
      return {
        status: "error",
        error_code: error.response?.data?.error_code || "KM_ERROR",
        error_message: error.response?.data?.message || error.message,
        keys: [],
      };
    }
  }

  /**
   * Generate quantum keys for One Time Pad encryption
   */
  async generateOTPKeys(dataSize) {
    try {
      // For OTP, we need key material equal to data size
      const keySize = Math.ceil(dataSize / 8) * 8; // Round up to byte boundary

      const response = await this.requestEncryptionKey(this.saeId, keySize);

      if (response.status === "success" && response.keys.length > 0) {
        return response.keys[0];
      }

      throw new Error(response.error_message || "Failed to generate OTP keys");
    } catch (error) {
      console.error("OTP key generation failed:", error);
      throw error;
    }
  }

  /**
   * Get quantum seed for AES encryption
   */
  async getQuantumSeed(keySize = 256) {
    try {
      const response = await this.requestEncryptionKey(this.saeId, keySize);

      if (response.status === "success" && response.keys.length > 0) {
        return response.keys[0];
      }

      throw new Error(response.error_message || "Failed to get quantum seed");
    } catch (error) {
      console.error("Quantum seed generation failed:", error);
      throw error;
    }
  }

  /**
   * Validate key freshness and availability
   */
  validateKey(key) {
    if (!key || !key.key_ID || !key.key) {
      return false;
    }

    // Check if key is expired
    if (key.timestamp) {
      const keyTime = new Date(key.timestamp);
      const now = new Date();
      const ageInSeconds = (now - keyTime) / 1000;

      // Default key lifetime is 1 hour
      if (ageInSeconds > 3600) {
        return false;
      }
    }

    // Check key status
    return key.status === KEY_STATES.AVAILABLE;
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      endpoint: this.baseURL,
      saeId: this.saeId,
      lastCheck: new Date(),
    };
  }

  /**
   * Disconnect from KM
   */
  disconnect() {
    this.isConnected = false;
    this.apiKey = null;
    this.saeId = null;
    console.log("Disconnected from KM");
  }
}

// Export singleton instance
export const kmService = new KMService();
