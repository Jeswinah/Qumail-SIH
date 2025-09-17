# QuMail Testing Guide

## Overview

This document provides comprehensive testing instructions for the Quantum Secure Email Client (QuMail) application.

## Prerequisites

1. Node.js (v16 or higher)
2. npm or yarn package manager
3. Modern web browser (Chrome, Firefox, Edge)

## Setup Instructions

### 1. Install Dependencies

```bash
cd c:\Users\jeswi\OneDrive\Desktop\SIH\qumail
npm install --legacy-peer-deps
```

### 2. Start Development Environment

```bash
# Terminal 1: Start Development Server
npm run dev

# Terminal 2: Start Mock Key Manager Service
npm run mock-km

# Terminal 3: Start Mock Email Service
npm run mock-email
```

## Testing Scenarios

### 1. Application Launch Test

- **Objective**: Verify the application starts correctly
- **Steps**:
  1. Start development server
  2. Navigate to http://localhost:5173
  3. Verify the QuMail interface loads
  4. Check that all UI components are visible

### 2. Key Manager Connection Test

- **Objective**: Test QKD Key Manager integration
- **Steps**:
  1. Start mock KM service (port 8080)
  2. In QuMail, go to Settings → Key Manager
  3. Configure KM endpoint: http://localhost:8080
  4. Test connection and verify status
  5. Request quantum keys and verify response

### 3. Email Service Integration Test

- **Objective**: Test email operations
- **Steps**:
  1. Start mock email service (port 8081)
  2. Configure email account in Settings
  3. Fetch emails from inbox
  4. Compose and send test email
  5. Verify email encryption/decryption

### 4. Security Level Testing

#### Quantum Secure (Level 4)

- **Requirements**: Active KM connection
- **Test**: Encrypt/decrypt email using One Time Pad
- **Verification**: Check quantum key consumption

#### Quantum-aided AES (Level 3)

- **Requirements**: Active KM connection
- **Test**: Encrypt using AES with quantum seed
- **Verification**: Verify key derivation from quantum source

#### Post-Quantum Cryptography (Level 2)

- **Requirements**: No external dependencies
- **Test**: Encrypt using PQC algorithms
- **Verification**: Check algorithm selection and performance

#### Standard Encryption (Level 1)

- **Requirements**: No external dependencies
- **Test**: Encrypt using standard AES
- **Verification**: Basic encryption functionality

### 5. Email Compatibility Test

- **Objective**: Verify email format compatibility
- **Steps**:
  1. Compose encrypted email
  2. Verify MIME structure
  3. Check attachment handling
  4. Test with different email clients

## Mock Services

### Key Manager (Port 8080)

- **Endpoint**: http://localhost:8080
- **Features**: ETSI GS QKD 014 compliant
- **Sample Keys**: Pre-loaded with test quantum keys
- **Authentication**: Mock bearer token system

### Email Service (Port 8081)

- **Endpoint**: http://localhost:8081
- **Features**: IMAP/SMTP simulation
- **Sample Data**: Pre-loaded with test emails
- **Providers**: Gmail, Yahoo, Outlook simulation

## Expected Results

### Successful Tests

1. ✅ Application loads without errors
2. ✅ All UI components render correctly
3. ✅ KM service connects and provides keys
4. ✅ Email operations work smoothly
5. ✅ All 4 security levels function
6. ✅ Encryption/decryption maintains email format
7. ✅ Settings persist between sessions

### Common Issues

- **Port conflicts**: Ensure ports 5173, 8080, 8081 are available
- **CORS errors**: Mock services include CORS headers
- **Key exhaustion**: Restart KM service to refresh keys
- **Browser cache**: Clear cache if UI doesn't update

## Performance Benchmarks

- Application load time: < 3 seconds
- Key retrieval: < 1 second
- Email encryption: < 2 seconds
- Email decryption: < 1 second
- UI responsiveness: Real-time updates

## Security Validation

- Quantum key uniqueness verification
- Encryption algorithm correctness
- Key disposal after use (OTP mode)
- Secure storage of configurations
- ETSI standard compliance

## Demo Scenarios

1. **Basic Email Flow**: Compose → Encrypt → Send → Receive → Decrypt
2. **Security Level Comparison**: Same email encrypted with all 4 levels
3. **KM Integration Demo**: Real-time key management operations
4. **Multi-Account Setup**: Multiple email providers
5. **Attachment Security**: Encrypted file handling

## Troubleshooting

- Check browser console for JavaScript errors
- Verify network connectivity to mock services
- Ensure all dependencies are installed
- Check port availability and firewall settings
