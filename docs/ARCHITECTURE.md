# QuMail Architecture Guide

## System Architecture Overview

QuMail implements a modular architecture that separates concerns between quantum security, email operations, and user interface. The system is designed to be scalable, maintainable, and secure.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     QuMail Frontend                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Header    │ │   Sidebar   │ │ Email Views │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │Security Panel│ │ Composer   │ │ Settings   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   QuMail Core Services                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ KM Service  │ │Email Service│ │Security Svc │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │Encryption   │ │App Store    │ │ Utils       │          │
│  │Engine       │ │(Zustand)    │ │             │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Systems                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │Quantum Key  │ │Email Servers│ │   Browser   │          │
│  │Manager      │ │(IMAP/SMTP)  │ │Local Storage│          │
│  │(ETSI GS     │ │             │ │             │          │
│  │QKD 014)     │ │             │ │             │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Layer (React Components)

#### Core Components

- **Header**: Application title bar, status indicators, user menu
- **Sidebar**: Navigation, folder tree, account switcher
- **EmailList**: Email listing with encryption status indicators
- **EmailViewer**: Email display with decryption capabilities
- **EmailComposer**: Email composition with security level selection
- **SecurityPanel**: Security status, key manager connection
- **SettingsPanel**: Application configuration, account management

#### Component Hierarchy

```
App
├── Header
├── Layout
│   ├── Sidebar
│   │   ├── Navigation
│   │   ├── FolderTree
│   │   └── AccountSwitcher
│   └── MainContent
│       ├── EmailList
│       ├── EmailViewer
│       ├── EmailComposer
│       ├── SecurityPanel
│       └── SettingsPanel
```

### Service Layer

#### 1. Key Manager Service (`kmService`)

**Purpose**: Interface with ETSI GS QKD 014 compliant Key Manager

**Responsibilities**:

- Establish secure connection to KM
- Request and manage quantum keys
- Handle key lifecycle (request, use, dispose)
- Maintain SAE (Secure Application Entity) registration

**Key Methods**:

```javascript
configure(config); // Configure KM endpoint
getStatus(); // Check KM connectivity
getKey(saeId, targetSae, size); // Request encryption key
getOTPKeys(saeId, target, count); // Request OTP keys
requestEncryptionKey(); // Advanced key request
generateOTPKeys(); // Generate OTP key series
```

**ETSI Compliance**:

- REST API endpoints as per GS QKD 014
- Proper SAE ID management
- Key status tracking
- Secure key transportation

#### 2. Email Service (`emailService`)

**Purpose**: Interface with standard email protocols

**Responsibilities**:

- Multi-provider email configuration
- IMAP/SMTP operations
- Email CRUD operations
- Attachment handling

**Key Methods**:

```javascript
configureAccount(config); // Setup email account
getEmails(folder); // Fetch emails
sendEmail(email); // Send email
searchEmails(query); // Search functionality
getFolders(); // Get folder structure
```

**Provider Support**:

- Gmail (OAuth2, App Passwords)
- Yahoo Mail (IMAP/SMTP)
- Outlook/Hotmail (Microsoft Graph)
- Generic IMAP/SMTP servers

#### 3. Security Service (`securityService`)

**Purpose**: Multi-level encryption/decryption

**Responsibilities**:

- Implement 4 security levels
- Algorithm selection and execution
- Key integration with KM service
- Security policy enforcement

**Security Levels Implementation**:

```javascript
// Level 1: Standard Encryption
encryptStandard(data) {
  // AES-256-GCM with random key
  return CryptoJS.AES.encrypt(data, randomKey);
}

// Level 2: Post-Quantum Cryptography
encryptPQC(data) {
  // Lattice-based or code-based algorithms
  return latticeEncrypt(data, pqcKey);
}

// Level 3: Quantum-aided AES
encryptQuantumAided(data) {
  // AES with quantum-derived key
  const quantumSeed = await kmService.getQuantumSeed();
  const key = deriveKey(quantumSeed);
  return CryptoJS.AES.encrypt(data, key);
}

// Level 4: Quantum Secure
encryptQuantumSecure(data) {
  // One-Time Pad with quantum keys
  const otpKeys = await kmService.getOTPKeys();
  return xorEncrypt(data, otpKeys);
}
```

#### 4. Encryption Engine (`encryptionEngine`)

**Purpose**: Unified email encryption interface

**Responsibilities**:

- Email component encryption (subject, body, attachments)
- Maintain email format compatibility
- Handle mixed security levels
- Metadata protection

**Email Processing Flow**:

```javascript
async encryptEmail(email, securityLevel) {
  const result = {
    to: email.to,
    from: email.from,
    timestamp: new Date().toISOString(),
    securityLevel: securityLevel
  };

  // Encrypt subject
  if (email.subject) {
    result.encryptedSubject = await securityService
      .encryptData(email.subject, securityLevel);
  }

  // Encrypt body
  if (email.body) {
    result.encryptedBody = await securityService
      .encryptData(email.body, securityLevel);
  }

  // Encrypt attachments
  if (email.attachments) {
    result.encryptedAttachments = await Promise.all(
      email.attachments.map(att =>
        this.encryptAttachment(att, securityLevel)
      )
    );
  }

  return result;
}
```

### State Management (Zustand Store)

#### Application State Structure

```javascript
const appStore = {
  // User authentication
  user: {
    id: string,
    email: string,
    name: string,
    preferences: object,
  },

  // Email accounts
  emailAccounts: [
    {
      id: string,
      provider: string,
      email: string,
      config: object,
      isActive: boolean,
    },
  ],

  // Key Manager configuration
  kmConfig: {
    endpoint: string,
    saeId: string,
    isConnected: boolean,
    status: object,
  },

  // Current email data
  emails: {
    inbox: array,
    sent: array,
    drafts: array,
    currentEmail: object,
  },

  // Security settings
  security: {
    defaultLevel: number,
    allowDowngrade: boolean,
    keyRotationInterval: number,
  },

  // UI state
  ui: {
    currentView: string,
    selectedFolder: string,
    composerOpen: boolean,
    settingsOpen: boolean,
  },
};
```

#### Store Actions

```javascript
// Email operations
setEmails(folder, emails);
addEmail(email);
removeEmail(emailId);
updateEmail(emailId, changes);

// Account management
addEmailAccount(account);
removeEmailAccount(accountId);
setActiveAccount(accountId);

// KM operations
setKMConfig(config);
updateKMStatus(status);
setKMConnection(connected);

// Security operations
setSecurityLevel(level);
updateSecuritySettings(settings);

// UI operations
setCurrentView(view);
toggleComposer();
toggleSettings();
```

## Security Architecture

### Quantum Key Management Flow

```
1. Application Startup
   ├── Load KM configuration from storage
   ├── Establish connection to KM service
   ├── Register SAE ID
   └── Verify KM availability

2. Email Encryption Request
   ├── Determine required security level
   ├── Request appropriate keys from KM
   │   ├── Encryption keys (Level 3)
   │   └── OTP keys (Level 4)
   ├── Perform encryption
   ├── Mark keys as used (OTP)
   └── Store encrypted email

3. Email Decryption Request
   ├── Identify security level from metadata
   ├── Retrieve corresponding keys
   ├── Perform decryption
   ├── Verify integrity
   └── Display plaintext

4. Key Lifecycle Management
   ├── Monitor key usage
   ├── Request new keys proactively
   ├── Dispose of used OTP keys
   └── Handle key expiration
```

### Security Boundaries

```
┌─────────────────────────────────────────┐
│          Browser Security Context       │
│  ┌─────────────────────────────────────┐│
│  │        QuMail Application           ││
│  │  ┌─────────────────────────────────┐││
│  │  │     Encryption Engine          │││ ← Crypto operations
│  │  └─────────────────────────────────┘││
│  │  ┌─────────────────────────────────┐││
│  │  │     Local Storage              │││ ← Config persistence
│  │  └─────────────────────────────────┘││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
                    │
                    ▼ (HTTPS)
┌─────────────────────────────────────────┐
│         Network Security Layer          │
│  ┌─────────────────────────────────────┐│
│  │     Quantum Key Manager            ││ ← ETSI GS QKD 014
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │     Email Servers                  ││ ← TLS/SSL
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

## Data Flow Architecture

### Email Composition Flow

```
User Input → EmailComposer → SecurityService → KMService
    ↓              ↓              ↓              ↓
UI Updates → EncryptionEngine → EmailService → External APIs
    ↓              ↓              ↓              ↓
Store Update → Encrypted Email → Send Request → Network
```

### Email Reception Flow

```
Email Server → EmailService → EncryptionEngine → SecurityService
     ↓             ↓             ↓                ↓
Network Req → Fetch Email → Decrypt Process → KMService
     ↓             ↓             ↓                ↓
Store Update → EmailViewer → Plaintext Display → User Interface
```

## Performance Architecture

### Optimization Strategies

1. **Lazy Loading**: Components and data loaded on demand
2. **Virtual Scrolling**: Large email lists rendered efficiently
3. **Key Caching**: Frequently used keys cached temporarily
4. **Background Processing**: Encryption/decryption in web workers
5. **State Persistence**: Critical state saved to localStorage

### Scalability Considerations

1. **Modular Services**: Independent scaling of components
2. **Stateless Design**: Services don't maintain session state
3. **Async Operations**: Non-blocking encryption/decryption
4. **Error Boundaries**: Isolated failure handling
5. **Progressive Enhancement**: Graceful degradation of features

## Deployment Architecture

### Development Environment

```
├── React Dev Server (Vite) → Port 5173
├── Mock KM Service         → Port 8080
└── Mock Email Service      → Port 8081
```

### Production Environment

```
├── Static Web Server       → Serves built React app
├── Quantum Key Manager     → Real ETSI GS QKD 014 service
└── Email Infrastructure    → Production email servers
```

### Security Deployment Considerations

1. **HTTPS Only**: All communications over TLS
2. **Content Security Policy**: Strict CSP headers
3. **CORS Configuration**: Proper cross-origin setup
4. **Key Manager Authentication**: Mutual TLS or token-based
5. **Error Handling**: No sensitive data in error messages

## Integration Points

### ETSI GS QKD 014 Integration

- REST API compliance
- SAE ID management
- Key request/response handling
- Status monitoring
- Error handling

### Email Protocol Integration

- IMAP for email retrieval
- SMTP for email sending
- OAuth2 for modern authentication
- Attachment handling
- Folder synchronization

### Browser Integration

- Local storage for configuration
- Web Crypto API for basic operations
- Service Workers for background tasks
- Progressive Web App capabilities

This architecture ensures a robust, secure, and scalable quantum email client that meets all ISRO SIH 2024 requirements while maintaining production-ready standards.
