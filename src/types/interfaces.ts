/**
 * Interface types for QuMail application
 */

// Email Message Interface
export interface EmailMessage {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
  timestamp: Date;
  encrypted: boolean;
  securityLevel: string;
  quantumKeyId?: string;
  headers?: Record<string, string>;
}

// Email Attachment Interface
export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  data: ArrayBuffer | string;
  encrypted: boolean;
}

// Quantum Key Interface (ETSI GS QKD 014)
export interface QuantumKey {
  key_ID: string;
  key: string; // Base64 encoded key material
  key_size: number;
  algorithm_type?: string;
  timestamp: string;
  status: string;
  metadata?: Record<string, any>;
}

// Key Manager Response Interface
export interface KMResponse {
  keys?: QuantumKey[];
  message?: string;
  status: "success" | "error";
  error_code?: string;
  error_message?: string;
}

// Security Configuration Interface
export interface SecurityConfig {
  level: string;
  enableOneTimePad: boolean;
  enableQuantumAES: boolean;
  enablePQC: boolean;
  keyLifetime: number; // in seconds
  autoKeyRotation: boolean;
  backupEncryption: string;
}

// Email Account Configuration
export interface EmailAccount {
  id: string;
  name: string;
  email: string;
  provider: string;
  imap: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
  };
  isConnected: boolean;
}

// Key Manager Configuration
export interface KMConfig {
  id: string;
  name: string;
  endpoint: string;
  apiKey?: string;
  saeId: string; // Secure Application Entity ID
  isConnected: boolean;
  lastSync?: Date;
  supportedAlgorithms: string[];
}

// Application Configuration
export interface AppConfig {
  theme: "light" | "dark";
  language: string;
  autoSave: boolean;
  securityConfig: SecurityConfig;
  emailAccounts: EmailAccount[];
  kmConfigs: KMConfig[];
  debugMode: boolean;
}

// Encryption Context
export interface EncryptionContext {
  algorithm: string;
  keyId?: string;
  quantumKey?: QuantumKey;
  sessionKey?: string;
  metadata: Record<string, any>;
}

// Application State Interface
export interface AppState {
  status: string;
  currentUser?: EmailAccount;
  activeKM?: KMConfig;
  securityLevel: string;
  keyCache: Map<string, QuantumKey>;
  notifications: Notification[];
}

// Notification Interface
export interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  timestamp: Date;
  persistent?: boolean;
}

// Email Folder Interface
export interface EmailFolder {
  name: string;
  path: string;
  messages: EmailMessage[];
  unreadCount: number;
  type: "inbox" | "sent" | "drafts" | "trash" | "custom";
}

// Search Interface
export interface EmailSearch {
  query: string;
  sender?: string;
  recipient?: string;
  subject?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  securityLevel?: string;
  hasAttachments?: boolean;
}
