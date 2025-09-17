# QuMail API Documentation

## Overview

QuMail exposes several service APIs for quantum key management, email operations, security functions, and encryption services. This document provides comprehensive API reference for all components.

## Table of Contents

1. [Key Manager Service API](#key-manager-service-api)
2. [Email Service API](#email-service-api)
3. [Security Service API](#security-service-api)
4. [Encryption Engine API](#encryption-engine-api)
5. [Application Store API](#application-store-api)
6. [Error Handling](#error-handling)
7. [Configuration](#configuration)

---

## Key Manager Service API

The Key Manager Service provides ETSI GS QKD 014 compliant quantum key management.

### Configuration

```javascript
import { kmService } from "./services/kmService.js";

// Configure KM service
await kmService.configure({
  endpoint: "https://km.example.com:8080",
  saeId: "qumail-client-001",
  authentication: {
    type: "bearer",
    token: "your-api-token",
  },
});
```

### Methods

#### `configure(config)`

Configure the Key Manager connection.

**Parameters:**

- `config` (Object): Configuration object
  - `endpoint` (string): KM service URL
  - `saeId` (string): Secure Application Entity ID
  - `authentication` (Object): Auth configuration

**Returns:** `Promise<boolean>` - Configuration success

**Example:**

```javascript
const success = await kmService.configure({
  endpoint: "https://localhost:8080",
  saeId: "qumail-001",
});
```

#### `getStatus()`

Check Key Manager connectivity and status.

**Returns:** `Promise<Object>` - Status information

**Response:**

```javascript
{
  connected: boolean,
  lastUpdate: string,
  availableKeys: number,
  serviceVersion: string
}
```

#### `getKey(saeId, targetSaeId, keySize)`

Request an encryption key from the Key Manager.

**Parameters:**

- `saeId` (string): Source SAE ID
- `targetSaeId` (string): Target SAE ID
- `keySize` (number): Key size in bits (128, 256, 512)

**Returns:** `Promise<Object>` - Key object

**Response:**

```javascript
{
  keyId: string,
  key: string,        // Base64 encoded key
  keySize: number,
  timestamp: string,
  expiresAt: string
}
```

#### `getOTPKeys(saeId, targetSaeId, count)`

Request One-Time Pad keys for quantum secure encryption.

**Parameters:**

- `saeId` (string): Source SAE ID
- `targetSaeId` (string): Target SAE ID
- `count` (number): Number of keys to request

**Returns:** `Promise<Array>` - Array of OTP key objects

**Response:**

```javascript
[
  {
    keyId: string,
    key: string, // Base64 encoded key
    used: boolean,
    timestamp: string,
  },
];
```

#### `requestEncryptionKey(saeId, targetSaeId, keySize, metadata)`

Advanced key request with metadata.

**Parameters:**

- `saeId` (string): Source SAE ID
- `targetSaeId` (string): Target SAE ID
- `keySize` (number): Key size in bits
- `metadata` (Object): Additional request metadata

**Returns:** `Promise<Object>` - Enhanced key object

#### `generateOTPKeys(saeId, targetSaeId, count, keySize)`

Generate series of OTP keys.

**Parameters:**

- `saeId` (string): Source SAE ID
- `targetSaeId` (string): Target SAE ID
- `count` (number): Number of keys
- `keySize` (number): Size of each key

**Returns:** `Promise<Array>` - Generated OTP keys

#### `getQuantumSeed(length)`

Get quantum random seed for key derivation.

**Parameters:**

- `length` (number): Seed length in bytes

**Returns:** `Promise<string>` - Base64 encoded quantum seed

---

## Email Service API

The Email Service provides multi-provider email integration with IMAP/SMTP support.

### Configuration

```javascript
import { emailService } from "./services/emailService.js";

// Configure email account
await emailService.configureAccount({
  provider: "gmail",
  email: "user@gmail.com",
  password: "app-password",
  name: "User Name",
});
```

### Methods

#### `configureAccount(config)`

Configure email account for IMAP/SMTP operations.

**Parameters:**

- `config` (Object): Account configuration
  - `provider` (string): 'gmail', 'yahoo', 'outlook', 'custom'
  - `email` (string): Email address
  - `password` (string): Password or app password
  - `name` (string): Display name
  - `imap` (Object): Custom IMAP settings
  - `smtp` (Object): Custom SMTP settings

**Returns:** `Promise<boolean>` - Configuration success

#### `getEmails(folder, options)`

Fetch emails from specified folder.

**Parameters:**

- `folder` (string): Folder name ('INBOX', 'SENT', 'DRAFTS')
- `options` (Object): Fetch options
  - `limit` (number): Maximum emails to fetch
  - `offset` (number): Starting offset
  - `unreadOnly` (boolean): Fetch only unread emails

**Returns:** `Promise<Array>` - Array of email objects

**Response:**

```javascript
[
  {
    id: string,
    messageId: string,
    from: string,
    to: string,
    subject: string,
    body: string,
    date: string,
    unread: boolean,
    attachments: Array,
    securityLevel: number,
    encrypted: boolean,
  },
];
```

#### `sendEmail(email)`

Send email through SMTP.

**Parameters:**

- `email` (Object): Email object
  - `to` (string): Recipient email
  - `subject` (string): Email subject
  - `body` (string): Email body
  - `attachments` (Array): File attachments
  - `securityLevel` (number): Encryption level

**Returns:** `Promise<Object>` - Send result

**Response:**

```javascript
{
  messageId: string,
  success: boolean,
  timestamp: string
}
```

#### `searchEmails(query, options)`

Search emails by query.

**Parameters:**

- `query` (string): Search query
- `options` (Object): Search options
  - `folder` (string): Folder to search
  - `dateRange` (Object): Date range filter
  - `fromAddress` (string): Filter by sender

**Returns:** `Promise<Array>` - Matching emails

#### `getFolders()`

Get email folder structure.

**Returns:** `Promise<Array>` - Folder list

#### `createFolder(name)`

Create new email folder.

**Parameters:**

- `name` (string): Folder name

**Returns:** `Promise<boolean>` - Creation success

#### `deleteEmail(emailId)`

Delete email by ID.

**Parameters:**

- `emailId` (string): Email identifier

**Returns:** `Promise<boolean>` - Deletion success

---

## Security Service API

The Security Service implements multi-level encryption and decryption.

### Methods

#### `encryptData(data, securityLevel, options)`

Encrypt data using specified security level.

**Parameters:**

- `data` (string): Data to encrypt
- `securityLevel` (number): Security level (1-4)
- `options` (Object): Encryption options
  - `keyId` (string): Specific key ID to use
  - `metadata` (Object): Additional metadata

**Returns:** `Promise<string>` - Encrypted data (Base64)

**Security Levels:**

- `1`: Standard AES-256 encryption
- `2`: Post-Quantum Cryptography
- `3`: Quantum-aided AES encryption
- `4`: Quantum Secure (One-Time Pad)

#### `decryptData(encryptedData, securityLevel, options)`

Decrypt data using specified security level.

**Parameters:**

- `encryptedData` (string): Base64 encrypted data
- `securityLevel` (number): Security level used for encryption
- `options` (Object): Decryption options

**Returns:** `Promise<string>` - Decrypted plaintext

#### `getSecurityMetrics(securityLevel)`

Get security metrics for specified level.

**Parameters:**

- `securityLevel` (number): Security level to analyze

**Returns:** `Promise<Object>` - Security metrics

**Response:**

```javascript
{
  algorithm: string,
  keySource: string,
  securityLevel: string,
  quantumSafe: boolean,
  keySize: number,
  performance: {
    encryptionTime: number,
    decryptionTime: number
  }
}
```

#### `validateSecurityLevel(level, requirements)`

Validate if security level meets requirements.

**Parameters:**

- `level` (number): Security level to validate
- `requirements` (Object): Security requirements

**Returns:** `Promise<boolean>` - Validation result

#### `generateSecureRandom(length)`

Generate cryptographically secure random data.

**Parameters:**

- `length` (number): Length in bytes

**Returns:** `Promise<string>` - Base64 encoded random data

---

## Encryption Engine API

The Encryption Engine provides unified email encryption interface.

### Methods

#### `encryptEmail(email, securityLevel, options)`

Encrypt entire email with specified security level.

**Parameters:**

- `email` (Object): Email object to encrypt
  - `subject` (string): Email subject
  - `body` (string): Email body
  - `attachments` (Array): File attachments
- `securityLevel` (number): Security level (1-4)
- `options` (Object): Encryption options

**Returns:** `Promise<Object>` - Encrypted email object

**Response:**

```javascript
{
  to: string,
  from: string,
  timestamp: string,
  securityLevel: number,
  encryptedSubject: string,
  encryptedBody: string,
  encryptedAttachments: Array,
  metadata: {
    algorithm: string,
    keyIds: Array,
    checksum: string
  }
}
```

#### `decryptEmail(encryptedEmail, securityLevel, options)`

Decrypt entire email.

**Parameters:**

- `encryptedEmail` (Object): Encrypted email object
- `securityLevel` (number): Security level used
- `options` (Object): Decryption options

**Returns:** `Promise<Object>` - Decrypted email object

#### `encryptAttachment(attachment, securityLevel)`

Encrypt individual attachment.

**Parameters:**

- `attachment` (Object): Attachment object
  - `name` (string): File name
  - `content` (string): File content (Base64)
  - `type` (string): MIME type
- `securityLevel` (number): Security level

**Returns:** `Promise<Object>` - Encrypted attachment

#### `decryptAttachment(encryptedAttachment, securityLevel)`

Decrypt individual attachment.

**Parameters:**

- `encryptedAttachment` (Object): Encrypted attachment
- `securityLevel` (number): Security level used

**Returns:** `Promise<Object>` - Decrypted attachment

#### `validateEmailIntegrity(email)`

Validate email integrity and authenticity.

**Parameters:**

- `email` (Object): Email to validate

**Returns:** `Promise<Object>` - Validation result

---

## Application Store API

The Application Store (Zustand) manages global application state.

### State Structure

```javascript
{
  user: Object,           // Current user
  emailAccounts: Array,   // Configured email accounts
  kmConfig: Object,       // Key Manager configuration
  emails: Object,         // Email data by folder
  security: Object,       // Security settings
  ui: Object             // UI state
}
```

### Actions

#### Email Operations

```javascript
// Set emails for folder
store.setEmails(folder, emails);

// Add new email
store.addEmail(email);

// Update email
store.updateEmail(emailId, changes);

// Remove email
store.removeEmail(emailId);

// Set current email
store.setCurrentEmail(email);
```

#### Account Management

```javascript
// Add email account
store.addEmailAccount(account);

// Remove email account
store.removeEmailAccount(accountId);

// Set active account
store.setActiveAccount(accountId);
```

#### Key Manager Operations

```javascript
// Set KM configuration
store.setKMConfig(config);

// Update KM status
store.updateKMStatus(status);

// Set connection status
store.setKMConnection(connected);
```

#### Security Operations

```javascript
// Set default security level
store.setSecurityLevel(level);

// Update security settings
store.updateSecuritySettings(settings);
```

#### UI Operations

```javascript
// Set current view
store.setCurrentView(view);

// Toggle composer
store.toggleComposer();

// Toggle settings
store.toggleSettings();
```

---

## Error Handling

### Error Types

#### KMServiceError

```javascript
{
  type: 'KMServiceError',
  code: 'KM_CONNECTION_FAILED',
  message: 'Failed to connect to Key Manager',
  details: Object
}
```

#### EmailServiceError

```javascript
{
  type: 'EmailServiceError',
  code: 'EMAIL_SEND_FAILED',
  message: 'Failed to send email',
  details: Object
}
```

#### SecurityServiceError

```javascript
{
  type: 'SecurityServiceError',
  code: 'ENCRYPTION_FAILED',
  message: 'Encryption operation failed',
  details: Object
}
```

### Error Codes

| Code                     | Description                 | Recovery Action         |
| ------------------------ | --------------------------- | ----------------------- |
| `KM_CONNECTION_FAILED`   | Cannot connect to KM        | Check endpoint, retry   |
| `KM_KEY_UNAVAILABLE`     | No keys available           | Wait, request more keys |
| `EMAIL_AUTH_FAILED`      | Email authentication failed | Re-enter credentials    |
| `EMAIL_SEND_FAILED`      | Email sending failed        | Retry, check connection |
| `ENCRYPTION_FAILED`      | Encryption operation failed | Check security level    |
| `DECRYPTION_FAILED`      | Decryption operation failed | Verify keys, algorithm  |
| `INVALID_SECURITY_LEVEL` | Invalid security level      | Use valid level (1-4)   |

### Error Handling Best Practices

```javascript
try {
  const result = await kmService.getKey(saeId, targetSae, 256);
} catch (error) {
  if (error.code === "KM_CONNECTION_FAILED") {
    // Show connection error, allow retry
    showNotification("KM connection failed. Please check settings.", "error");
  } else if (error.code === "KM_KEY_UNAVAILABLE") {
    // Fallback to lower security level
    showNotification(
      "Quantum keys unavailable. Using standard encryption.",
      "warning"
    );
  } else {
    // Generic error handling
    console.error("Unexpected error:", error);
    showNotification("An unexpected error occurred.", "error");
  }
}
```

---

## Configuration

### Environment Variables

```bash
VITE_KM_ENDPOINT=https://localhost:8080
VITE_KM_SAE_ID=qumail-client-001
VITE_EMAIL_PROVIDER=gmail
VITE_DEFAULT_SECURITY_LEVEL=3
VITE_DEBUG_MODE=false
```

### Configuration Files

#### `config/km.json`

```json
{
  "endpoint": "https://localhost:8080",
  "saeId": "qumail-client-001",
  "targetSaeId": "qumail-server-001",
  "authentication": {
    "type": "bearer",
    "tokenEndpoint": "/auth/token"
  },
  "keyPolicy": {
    "defaultKeySize": 256,
    "keyRotationInterval": 3600,
    "maxCachedKeys": 10
  }
}
```

#### `config/email.json`

```json
{
  "providers": {
    "gmail": {
      "imap": {
        "host": "imap.gmail.com",
        "port": 993,
        "secure": true
      },
      "smtp": {
        "host": "smtp.gmail.com",
        "port": 587,
        "secure": false
      }
    }
  },
  "defaultProvider": "gmail",
  "maxAttachmentSize": 25000000
}
```

#### `config/security.json`

```json
{
  "defaultSecurityLevel": 3,
  "allowSecurityDowngrade": false,
  "algorithms": {
    "level1": "AES-256-GCM",
    "level2": "LATTICE-BASED",
    "level3": "QUANTUM-AES",
    "level4": "ONE-TIME-PAD"
  },
  "keyPolicy": {
    "minKeySize": 128,
    "maxKeySize": 1024,
    "keyExpirationTime": 3600
  }
}
```

This API documentation provides comprehensive reference for all QuMail services and their usage patterns.
