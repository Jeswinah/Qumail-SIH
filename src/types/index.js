/**
 * Type definitions for QuMail - Quantum Secure Email Client
 * Based on ETSI GS QKD 014 standards and email protocols
 */

// Security Levels as per problem statement
export const SECURITY_LEVELS = {
  QUANTUM_SECURE: "quantum_secure", // Level 1: One Time Pad
  QUANTUM_AES: "quantum_aes", // Level 2: Quantum-aided AES
  PQC_ENCRYPTION: "pqc_encryption", // Level 3: Post-Quantum Cryptography
  NO_QUANTUM: "no_quantum", // Level 4: No Quantum security
};

// ETSI GS QKD 014 Key Management Interface
export const KM_API_ENDPOINTS = {
  GET_KEY: "/api/v1/keys/{key_ID}",
  GET_KEY_WITH_IDS: "/api/v1/keys/{key_ID}/with_key_IDs",
  GET_STATUS: "/api/v1/keys/{key_ID}/status",
  ENCODE_KEY: "/api/v1/keys/{slave_SAE_ID}/enc_keys",
  DECODE_KEY: "/api/v1/keys/{slave_SAE_ID}/dec_keys",
};

// Email Protocol Types
export const EMAIL_PROTOCOLS = {
  IMAP: "imap",
  SMTP: "smtp",
  POP3: "pop3",
};

// Email Providers Configuration
export const EMAIL_PROVIDERS = {
  GMAIL: {
    name: "Gmail",
    imap: { host: "imap.gmail.com", port: 993, secure: true },
    smtp: { host: "smtp.gmail.com", port: 587, secure: false },
  },
  YAHOO: {
    name: "Yahoo Mail",
    imap: { host: "imap.mail.yahoo.com", port: 993, secure: true },
    smtp: { host: "smtp.mail.yahoo.com", port: 587, secure: false },
  },
  OUTLOOK: {
    name: "Outlook",
    imap: { host: "outlook.office365.com", port: 993, secure: true },
    smtp: { host: "smtp-mail.outlook.com", port: 587, secure: false },
  },
};

// Application States
export const APP_STATES = {
  INITIALIZING: "initializing",
  CONNECTING_KM: "connecting_km",
  CONNECTING_EMAIL: "connecting_email",
  READY: "ready",
  ERROR: "error",
};

// Quantum Key States (ETSI standard)
export const KEY_STATES = {
  AVAILABLE: "available",
  CONSUMED: "consumed",
  EXPIRED: "expired",
  ERROR: "error",
};
