/**
 * Email Service - Frontend Mock Implementation
 * Provides email simulation without backend dependencies
 */

import { EMAIL_PROVIDERS } from "../types";

class EmailService {
  constructor() {
    this.accounts = new Map();
    this.isInitialized = false;
    this.simulateDelay = 500;
  }

  /**
   * Initialize the email service
   */
  async initialize() {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      this.isInitialized = true;
      console.log("Email Service initialized (Mock Mode)");
    } catch (error) {
      console.error("Failed to initialize Email Service:", error);
      throw error;
    }
  }

  /**
   * Configure and test email account connection (Mock)
   */
  async configureAccount(accountConfig) {
    try {
      // Validate configuration
      if (!this.validateAccountConfig(accountConfig)) {
        throw new Error("Invalid account configuration");
      }

      // Simulate connection test delay
      await new Promise((resolve) => setTimeout(resolve, this.simulateDelay));

      // Store mock account configuration
      this.accounts.set(accountConfig.id, {
        config: accountConfig,
        status: "connected",
        lastActivity: new Date(),
        mode: "mock",
      });

      return {
        success: true,
        message: "Email account configured successfully (Mock)",
        accountId: accountConfig.id,
      };
    } catch (error) {
      console.error("Email account configuration failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Validate email account configuration
   */
  validateAccountConfig(config) {
    const required = ["id", "email", "provider"];
    return required.every((field) => config[field]);
  }

  /**
   * Test IMAP connection (Mock)
   */
  async testIMAPConnection(accountConfig) {
    try {
      console.log(`Testing IMAP connection (Mock): ${accountConfig.email}`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true, provider: "Mock Provider" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Test SMTP connection (Mock)
   */
  async testSMTPConnection(accountConfig) {
    try {
      console.log(`Testing SMTP connection (Mock): ${accountConfig.email}`);
      await new Promise((resolve) => setTimeout(resolve, 200));
      return { success: true, provider: "Mock Provider" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch emails from IMAP server (Mock)
   */
  async fetchEmails(accountId, folder = "INBOX", options = {}) {
    try {
      const account = this.accounts.get(accountId);
      if (!account) {
        throw new Error("Account not configured");
      }

      console.log(
        `Fetching emails from ${folder} for account ${accountId} (Mock)`
      );
      await new Promise((resolve) => setTimeout(resolve, this.simulateDelay));

      const mockEmails = this.generateMockEmails(folder, options.limit || 10);

      return {
        success: true,
        emails: mockEmails,
        folder: folder,
        total: mockEmails.length,
      };
    } catch (error) {
      console.error("Failed to fetch emails:", error);
      return {
        success: false,
        error: error.message,
        emails: [],
      };
    }
  }

  /**
   * Send email via SMTP (Mock)
   */
  async sendEmail(accountId, emailData) {
    try {
      const account = this.accounts.get(accountId);
      if (!account) {
        throw new Error("Account not configured");
      }

      console.log(`Sending email from account ${accountId} (Mock)`);

      // Validate email data
      if (!this.validateEmailData(emailData)) {
        throw new Error("Invalid email data");
      }

      // Simulate sending delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const messageId = `<${Date.now()}.${Math.random().toString(
        36
      )}@qumail.mock>`;

      return {
        success: true,
        messageId: messageId,
        message: "Email sent successfully (Mock)",
      };
    } catch (error) {
      console.error("Failed to send email:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Validate email data before sending
   */
  validateEmailData(emailData) {
    const required = ["to", "subject", "body"];
    return required.every(
      (field) => emailData[field] && emailData[field].toString().trim()
    );
  }

  /**
   * Generate mock emails for demonstration
   */
  generateMockEmails(folder, count) {
    const emails = [];
    const senders = [
      "alice@example.com",
      "bob@quantumtech.com",
      "security@isro.gov.in",
      "team@quantum-research.org",
      "notifications@gmail.com",
    ];

    const subjects = [
      "Quantum Key Distribution Test Results",
      "Security Protocol Update",
      "Meeting: QKD Implementation Review",
      "New Quantum Keys Available",
      "System Maintenance Notification",
      "Research Paper: Post-Quantum Cryptography",
      "Weekly Security Report",
      "Quantum Communication Setup",
      "Important: Security Configuration",
      "Team Update: QuMail Development",
    ];

    for (let i = 0; i < count; i++) {
      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 72));

      const email = {
        id: `${folder.toLowerCase()}_${Date.now()}_${i}`,
        from: senders[Math.floor(Math.random() * senders.length)],
        to: ["user@qumail.local"],
        cc: Math.random() > 0.7 ? ["cc@example.com"] : [],
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        body: this.generateMockEmailBody(),
        timestamp: timestamp,
        encrypted: Math.random() > 0.5,
        securityLevel: Math.random() > 0.5 ? "quantum_secure" : "quantum_aes",
        quantumKeyId: Math.random() > 0.3 ? `QK_${Date.now()}_${i}` : null,
        read: folder === "INBOX" ? Math.random() > 0.3 : true,
        attachments: Math.random() > 0.7 ? [this.generateMockAttachment()] : [],
        headers: {
          "Message-ID": `<${Date.now()}.${i}@mock.qumail>`,
          "X-QuMail-Security":
            Math.random() > 0.5 ? "quantum-secured" : "standard",
          "X-QuMail-Key-ID": `QK_${Date.now()}_${i}`,
        },
      };

      emails.push(email);
    }

    return emails.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Generate mock email body content
   */
  generateMockEmailBody() {
    const templates = [
      `Dear Team,

I hope this email finds you well. I wanted to update you on our quantum key distribution implementation progress.

The latest tests show excellent results with our QKD system. Key generation rates are within expected parameters, and the ETSI GS QKD 014 compliance is working perfectly.

Best regards,
Alice`,

      `Hello,

Please find the attached security report for this week. Notable points:

• Quantum key utilization: 94%
• Encryption success rate: 100%
• No security incidents reported
• System uptime: 99.8%

The QuMail application is performing excellently with quantum-secured communications.

Security Team`,

      `Hi everyone,

Quick reminder about our meeting tomorrow at 2 PM to discuss the QKD implementation review. We'll be covering:

1. Current system performance
2. Integration with email providers
3. Security level configurations
4. Future roadmap

See you there!`,

      `System Notification:

Quantum Key Manager maintenance scheduled for tonight between 2-4 AM IST. During this time:

- New key generation will be temporarily unavailable
- Existing keys remain valid
- Email encryption will fall back to backup methods

No action required from users. Service will resume automatically.

QuMail System`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Generate mock attachment
   */
  generateMockAttachment() {
    const files = [
      { name: "security-report.pdf", type: "application/pdf", size: 245760 },
      { name: "quantum-keys.json", type: "application/json", size: 8192 },
      { name: "diagram.png", type: "image/png", size: 156800 },
      { name: "config.xml", type: "application/xml", size: 4096 },
    ];

    const file = files[Math.floor(Math.random() * files.length)];

    return {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      filename: file.name,
      contentType: file.type,
      size: file.size,
      encrypted: Math.random() > 0.3,
      data: `mock_data_${Date.now()}`, // In real implementation, this would be actual file data
    };
  }

  /**
   * Get folders for an account (Mock)
   */
  async getFolders(accountId) {
    try {
      const account = this.accounts.get(accountId);
      if (!account) {
        throw new Error("Account not configured");
      }

      await new Promise((resolve) => setTimeout(resolve, 200));

      // Standard email folders
      const folders = [
        { name: "INBOX", path: "INBOX", type: "inbox", unreadCount: 5 },
        { name: "Sent", path: "INBOX.Sent", type: "sent", unreadCount: 0 },
        {
          name: "Drafts",
          path: "INBOX.Drafts",
          type: "drafts",
          unreadCount: 0,
        },
        { name: "Trash", path: "INBOX.Trash", type: "trash", unreadCount: 0 },
        {
          name: "Quantum Secure",
          path: "INBOX.QuantumSecure",
          type: "custom",
          unreadCount: 2,
        },
        {
          name: "Archive",
          path: "INBOX.Archive",
          type: "custom",
          unreadCount: 0,
        },
      ];

      return {
        success: true,
        folders: folders,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        folders: [],
      };
    }
  }

  /**
   * Search emails (Mock)
   */
  async searchEmails(accountId, searchCriteria) {
    try {
      console.log(
        `Searching emails for account ${accountId} (Mock):`,
        searchCriteria
      );
      await new Promise((resolve) => setTimeout(resolve, 400));

      const allEmails = this.generateMockEmails("search", 50);
      let filteredEmails = allEmails;

      if (searchCriteria.query) {
        const query = searchCriteria.query.toLowerCase();
        filteredEmails = filteredEmails.filter(
          (email) =>
            email.subject.toLowerCase().includes(query) ||
            email.body.toLowerCase().includes(query) ||
            email.from.toLowerCase().includes(query)
        );
      }

      if (searchCriteria.sender) {
        filteredEmails = filteredEmails.filter((email) =>
          email.from.toLowerCase().includes(searchCriteria.sender.toLowerCase())
        );
      }

      if (searchCriteria.securityLevel) {
        filteredEmails = filteredEmails.filter(
          (email) => email.securityLevel === searchCriteria.securityLevel
        );
      }

      return {
        success: true,
        emails: filteredEmails.slice(0, 20),
        total: filteredEmails.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        emails: [],
      };
    }
  }

  /**
   * Get connection status for an account (Mock)
   */
  getConnectionStatus(accountId) {
    const account = this.accounts.get(accountId);

    return {
      accountId: accountId,
      imap: account
        ? { status: "connected", lastActivity: account.lastActivity }
        : null,
      smtp: account
        ? { status: "connected", lastActivity: account.lastActivity }
        : null,
      isConnected: Boolean(account),
      mode: "mock",
    };
  }

  /**
   * Disconnect account (Mock)
   */
  async disconnectAccount(accountId) {
    try {
      this.accounts.delete(accountId);
      console.log(`Disconnected email account: ${accountId} (Mock)`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get supported email providers
   */
  getSupportedProviders() {
    return Object.entries(EMAIL_PROVIDERS).map(([key, provider]) => ({
      id: key.toLowerCase(),
      name: provider.name,
      imap: provider.imap,
      smtp: provider.smtp,
    }));
  }
}

// Export singleton instance
export const emailService = new EmailService();
