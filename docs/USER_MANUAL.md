# QuMail User Manual

Welcome to QuMail, the revolutionary quantum-secured email client. This manual will guide you through all features and capabilities of the application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Account Setup](#account-setup)
4. [Key Manager Configuration](#key-manager-configuration)
5. [Security Levels](#security-levels)
6. [Composing Emails](#composing-emails)
7. [Reading Emails](#reading-emails)
8. [Managing Attachments](#managing-attachments)
9. [Security Settings](#security-settings)
10. [Troubleshooting](#troubleshooting)

## Getting Started

### System Requirements

- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Internet connection for email and key manager services
- JavaScript enabled

### First Launch

1. Open QuMail in your web browser
2. You'll see the welcome screen with setup options
3. Begin by configuring your email account
4. Optionally configure quantum key manager for enhanced security

## Interface Overview

QuMail features a familiar Microsoft Outlook-style interface with quantum security enhancements.

### Main Components

#### Header Bar

- **QuMail Logo**: Application branding
- **Security Status**: Shows current security level and KM connection
- **User Menu**: Access to settings and help

#### Sidebar

- **Navigation Menu**: Switch between Inbox, Sent, Drafts, etc.
- **Folder Tree**: Organize emails in custom folders
- **Account Switcher**: Switch between multiple email accounts
- **Security Panel**: Monitor encryption status

#### Main Content Area

- **Email List**: View emails with security indicators
- **Email Viewer**: Read emails with decryption status
- **Composer**: Write new emails with security level selection

#### Status Bar

- **Connection Status**: Email and KM service connectivity
- **Encryption Status**: Current security mode
- **Key Status**: Available quantum keys count

### Security Indicators

| Icon | Meaning                             |
| ---- | ----------------------------------- |
| 🔒   | Standard encryption (Level 1)       |
| 🛡️   | Post-quantum cryptography (Level 2) |
| ⚡   | Quantum-aided encryption (Level 3)  |
| 🌟   | Quantum secure encryption (Level 4) |
| ❌   | No encryption or decryption failed  |
| ⚠️   | Security warning or degraded mode   |

## Account Setup

### Adding Your First Email Account

1. **Click "Add Account"** in the sidebar
2. **Select Provider**: Choose from Gmail, Yahoo, Outlook, or Custom
3. **Enter Credentials**:
   - Email address
   - Password (or app password for Gmail)
   - Display name
4. **Configure Settings** (if using Custom):
   - IMAP server settings
   - SMTP server settings
5. **Test Connection** and save

### Gmail Setup

1. Enable 2-factor authentication in your Google account
2. Generate an app password:
   - Google Account → Security → App passwords
   - Select "Mail" and generate password
3. Use the app password instead of your regular password

### Yahoo Mail Setup

1. Enable "Allow apps that use less secure sign in"
2. Or use Yahoo app password (recommended)
3. IMAP: imap.mail.yahoo.com:993 (SSL)
4. SMTP: smtp.mail.yahoo.com:587 (TLS)

### Outlook/Hotmail Setup

1. Enable "Less secure app access" if required
2. Or use Microsoft app password
3. IMAP: outlook.office365.com:993 (SSL)
4. SMTP: smtp-mail.outlook.com:587 (TLS)

### Multiple Accounts

- Add multiple accounts by repeating the setup process
- Switch between accounts using the account switcher
- Each account maintains separate security settings

## Key Manager Configuration

The Key Manager (KM) provides quantum keys for enhanced security levels.

### Basic Configuration

1. **Go to Settings** → Key Manager
2. **Enter KM Endpoint**: URL of your quantum key manager
3. **Set SAE ID**: Your secure application entity identifier
4. **Test Connection**: Verify connectivity
5. **Save Configuration**

### Advanced Configuration

- **Target SAE ID**: Default recipient identifier
- **Key Rotation Interval**: How often to refresh keys
- **Maximum Cached Keys**: Number of keys to store locally
- **Authentication Method**: Bearer token or certificate

### ETSI GS QKD 014 Compliance

QuMail implements the ETSI standard for quantum key distribution:

- REST API interface
- Proper SAE registration
- Key lifecycle management
- Status monitoring
- Error handling

## Security Levels

QuMail offers four security levels to match different threat models and requirements.

### Level 1: Standard Encryption

- **Algorithm**: AES-256-GCM
- **Key Source**: Cryptographically secure random
- **Use Case**: Basic privacy protection
- **Performance**: Fastest
- **Requirements**: None

**When to Use**: Regular business emails, personal correspondence

### Level 2: Post-Quantum Cryptography

- **Algorithm**: Lattice-based cryptography
- **Key Source**: PQC key generation
- **Use Case**: Future-proof against quantum computers
- **Performance**: Moderate
- **Requirements**: None

**When to Use**: Long-term data protection, regulatory compliance

### Level 3: Quantum-aided AES

- **Algorithm**: AES-256 with quantum-derived keys
- **Key Source**: Quantum random number generator
- **Use Case**: Enhanced entropy for key generation
- **Performance**: Fast
- **Requirements**: Key Manager connection

**When to Use**: High-security business communications

### Level 4: Quantum Secure

- **Algorithm**: One-Time Pad (Vernam cipher)
- **Key Source**: True quantum keys from QKD
- **Use Case**: Maximum theoretical security
- **Performance**: Moderate (key consumption)
- **Requirements**: Active Key Manager with quantum keys

**When to Use**: Top secret communications, critical infrastructure

### Automatic Security Level Selection

QuMail can automatically select the highest available security level:

1. Check Key Manager availability
2. Verify quantum key supply
3. Select maximum feasible level
4. Fallback to lower levels if needed

## Composing Emails

### Basic Email Composition

1. **Click "Compose"** or use Ctrl+N
2. **Enter Recipients**: To, CC, BCC fields
3. **Add Subject**: Will be encrypted based on security level
4. **Write Message**: Rich text editor with formatting
5. **Attach Files**: Drag and drop or browse files
6. **Select Security Level**: Choose from 1-4 based on requirements
7. **Send**: Email is encrypted and transmitted

### Security Level Selection

- **Automatic**: QuMail selects highest available level
- **Manual**: Choose specific level from dropdown
- **Policy Enforcement**: Admin can set minimum levels
- **Recipient Consideration**: Ensure recipient can decrypt

### Rich Text Features

- **Bold, Italic, Underline**: Standard formatting
- **Lists**: Numbered and bulleted lists
- **Links**: Hyperlinks (encrypted in message)
- **Images**: Inline images (encrypted as attachments)
- **Tables**: Data tables

### Draft Management

- **Auto-save**: Drafts saved every 30 seconds
- **Manual Save**: Ctrl+S to save immediately
- **Encryption**: Drafts encrypted at selected security level
- **Recovery**: Recover from unexpected closures

## Reading Emails

### Email List View

- **Security Indicators**: Icons show encryption level
- **Unread Status**: Bold for unread emails
- **Sender Information**: Name and email address
- **Subject Preview**: Decrypted subject line
- **Date/Time**: Received timestamp
- **Attachment Indicator**: Paperclip icon

### Email Detail View

- **Automatic Decryption**: QuMail decrypts emails automatically
- **Security Information**: Shows encryption method used
- **Full Content**: Subject, body, and attachments
- **Reply Options**: Reply, Reply All, Forward
- **Security Warning**: Alerts for decryption issues

### Decryption Process

1. **Identify Security Level**: From email metadata
2. **Retrieve Keys**: From Key Manager if needed
3. **Decrypt Content**: Subject, body, attachments
4. **Verify Integrity**: Check for tampering
5. **Display Result**: Show plaintext or error

### Handling Decryption Failures

- **Key Unavailable**: Contact sender for key sharing
- **Wrong Security Level**: Verify email metadata
- **Corrupted Data**: Request email resend
- **KM Offline**: Use cached keys if available

## Managing Attachments

### Sending Attachments

1. **Drag and Drop**: Drag files into composer
2. **Browse Files**: Click attachment button
3. **Security Level**: Attachments use same level as email
4. **Size Limits**: Respect email provider limits
5. **Encryption**: All attachments encrypted individually

### Receiving Attachments

- **Security Scan**: Automatic virus scanning (if configured)
- **Decryption**: Automatic with email decryption
- **Download**: Click to download decrypted file
- **Preview**: Some file types support preview

### Supported File Types

- **Documents**: PDF, DOC, DOCX, TXT, RTF
- **Images**: JPG, PNG, GIF, BMP, SVG
- **Archives**: ZIP, RAR, 7Z
- **Media**: MP3, MP4, AVI (size permitting)
- **Spreadsheets**: XLS, XLSX, CSV
- **Presentations**: PPT, PPTX

### Large File Handling

- **Compression**: Automatic compression for large files
- **Chunking**: Split large files for encryption
- **Progress Indicators**: Show upload/download progress
- **Resume Support**: Resume interrupted transfers

## Security Settings

### Global Security Settings

- **Default Security Level**: Set minimum encryption level
- **Allow Downgrade**: Permit lower security levels
- **Key Rotation**: Automatic key refresh intervals
- **Audit Logging**: Log all security operations

### Per-Account Settings

- **Account Security Level**: Override global settings
- **Key Manager Assignment**: Separate KM per account
- **Encryption Policies**: Account-specific policies
- **Recipient Verification**: Verify recipient capabilities

### Advanced Security Features

- **Perfect Forward Secrecy**: Keys deleted after use (Level 4)
- **Metadata Protection**: Hide email patterns
- **Key Escrow**: Enterprise key backup
- **Compliance Reporting**: Generate security reports

### Security Monitoring

- **Real-time Status**: Current security posture
- **Key Usage Statistics**: Monitor key consumption
- **Security Alerts**: Warnings and notifications
- **Audit Trail**: Complete operation history

## Troubleshooting

### Common Issues

#### Cannot Connect to Email Server

**Symptoms**: "Connection failed" error when adding account
**Solutions**:

1. Verify email credentials are correct
2. Check internet connectivity
3. Ensure email provider allows IMAP/SMTP
4. Use app passwords for Gmail/Yahoo
5. Check firewall settings

#### Key Manager Connection Failed

**Symptoms**: "KM offline" status, degraded security
**Solutions**:

1. Verify KM endpoint URL is correct
2. Check network connectivity to KM
3. Ensure SAE ID is properly configured
4. Verify authentication credentials
5. Contact KM administrator

#### Email Decryption Failed

**Symptoms**: "Cannot decrypt" error, garbled content
**Solutions**:

1. Verify you have required security level support
2. Check Key Manager connectivity
3. Ensure email wasn't corrupted in transit
4. Contact sender to verify encryption method
5. Try refreshing quantum keys

#### Performance Issues

**Symptoms**: Slow email operations, UI lag
**Solutions**:

1. Clear browser cache and cookies
2. Reduce number of cached emails
3. Lower default security level temporarily
4. Check system resource usage
5. Use incognito/private browsing mode

#### Attachment Problems

**Symptoms**: Cannot open attachments, download failures
**Solutions**:

1. Verify file isn't corrupted
2. Check browser download settings
3. Ensure sufficient disk space
4. Try different browser
5. Contact sender for new copy

### Error Messages

| Error                  | Meaning                    | Solution                                |
| ---------------------- | -------------------------- | --------------------------------------- |
| "KM_CONNECTION_FAILED" | Cannot reach Key Manager   | Check KM endpoint and connectivity      |
| "INSUFFICIENT_KEYS"    | Not enough quantum keys    | Wait for key generation or reduce usage |
| "DECRYPTION_FAILED"    | Cannot decrypt email       | Verify keys and encryption level        |
| "AUTH_FAILED"          | Email authentication error | Check credentials and app passwords     |
| "QUOTA_EXCEEDED"       | Storage or rate limit hit  | Clean up old emails or wait             |

### Getting Help

#### Built-in Help

- **Help Menu**: Click ? icon for context help
- **Tooltips**: Hover over UI elements for explanations
- **Status Messages**: Real-time operation feedback
- **Error Details**: Click error messages for more info

#### Support Resources

- **Documentation**: Complete guides and references
- **FAQ**: Frequently asked questions
- **Video Tutorials**: Step-by-step walkthroughs
- **Community Forum**: User discussions and tips

#### Contact Support

- **Email**: support@qumail.dev
- **Chat**: In-app chat support (business hours)
- **Phone**: Enterprise customers only
- **Ticket System**: Submit detailed bug reports

### Best Practices

#### Security Best Practices

1. **Use highest security level appropriate for content**
2. **Regularly update Key Manager configuration**
3. **Monitor security status indicators**
4. **Report suspicious activities immediately**
5. **Keep software updated**

#### Performance Best Practices

1. **Archive old emails regularly**
2. **Limit number of concurrent accounts**
3. **Use appropriate security levels**
4. **Clear browser cache periodically**
5. **Monitor resource usage**

#### Privacy Best Practices

1. **Use unique passwords for each account**
2. **Enable 2-factor authentication where possible**
3. **Regularly review account permissions**
4. **Avoid public WiFi for sensitive emails**
5. **Log out when using shared computers**

---

**QuMail User Manual** - Version 1.0  
For technical support: support@qumail.dev  
Last updated: 2024
