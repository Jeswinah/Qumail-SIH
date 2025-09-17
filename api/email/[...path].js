/**
 * Vercel Serverless Function for Email API
 * IMAP/SMTP Simulation
 */

// In-memory storage (will reset on each deployment)
let emails = new Map();
let accounts = new Map();
let folders = new Map();
let initialized = false;

function initializeEmailData() {
  if (initialized) return;

  // Sample emails
  const sampleEmails = [
    {
      id: "1",
      messageId: "msg_001@example.com",
      from: "alice@company.com",
      to: "user@qumail.com",
      subject: "Quantum Security Meeting",
      body: "Hi, let's discuss the quantum security implementation for our email system.",
      date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      unread: true,
      folder: "INBOX",
      attachments: [],
      securityLevel: 3,
      encrypted: true,
    },
    {
      id: "2",
      messageId: "msg_002@example.com",
      from: "bob@research.org",
      to: "user@qumail.com",
      subject: "ETSI QKD Standards Update",
      body: "Please find attached the latest ETSI GS QKD 014 documentation.",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      unread: true,
      folder: "INBOX",
      attachments: [
        {
          name: "ETSI_GS_QKD_014.pdf",
          size: 245760,
          type: "application/pdf",
        },
      ],
      securityLevel: 4,
      encrypted: true,
    },
    {
      id: "3",
      messageId: "msg_003@example.com",
      from: "support@isro.gov.in",
      to: "user@qumail.com",
      subject: "SIH 2024 - Project Submission",
      body: "Your Smart India Hackathon project submission has been received.",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      unread: false,
      folder: "INBOX",
      attachments: [],
      securityLevel: 2,
      encrypted: true,
    },
  ];

  sampleEmails.forEach((email) => {
    emails.set(email.id, email);
  });

  // Sample folders
  const sampleFolders = [
    { name: "INBOX", count: 3, unread: 2 },
    { name: "SENT", count: 5, unread: 0 },
    { name: "DRAFTS", count: 1, unread: 0 },
    { name: "TRASH", count: 0, unread: 0 },
  ];

  sampleFolders.forEach((folder) => {
    folders.set(folder.name, folder);
  });

  initialized = true;
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  initializeEmailData();

  const { method, url, body } = req;
  const pathname = new URL(url, `http://${req.headers.host}`).pathname;
  const searchParams = new URL(url, `http://${req.headers.host}`).searchParams;

  try {
    // Configure account
    if (method === "POST" && pathname === "/api/email/configure") {
      const { provider, email, password, name } = body;

      if (!provider || !email || !password) {
        return res.status(400).json({
          error: "INVALID_CONFIG",
          message: "Provider, email, and password are required",
        });
      }

      const accountId = `account_${Date.now()}`;
      const account = {
        id: accountId,
        provider,
        email,
        name: name || email,
        configured: true,
        connected: true,
        lastSync: new Date().toISOString(),
      };

      accounts.set(accountId, account);

      return res.json({
        success: true,
        account: {
          id: accountId,
          email,
          name: account.name,
          provider,
          connected: true,
        },
      });
    }

    // Get emails from folder
    if (method === "GET" && pathname.includes("/emails/")) {
      const folderMatch = pathname.match(/\/emails\/([^\/]+)$/);
      if (!folderMatch) {
        return res.status(400).json({ error: "Invalid folder" });
      }

      const folder = folderMatch[1];
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const unreadOnly = searchParams.get("unreadOnly") === "true";

      let folderEmails = Array.from(emails.values()).filter(
        (email) => email.folder === folder.toUpperCase()
      );

      if (unreadOnly) {
        folderEmails = folderEmails.filter((email) => email.unread);
      }

      // Sort by date (newest first)
      folderEmails.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Apply pagination
      const paginatedEmails = folderEmails.slice(offset, offset + limit);

      return res.json({
        emails: paginatedEmails,
        total: folderEmails.length,
        folder,
        pagination: {
          offset,
          limit,
          hasMore: offset + limit < folderEmails.length,
        },
      });
    }

    // Send email
    if (method === "POST" && pathname === "/api/email/send") {
      const { to, subject, body, attachments = [], securityLevel = 1 } = body;

      if (!to || !subject || !body) {
        return res.status(400).json({
          error: "INVALID_EMAIL",
          message: "To, subject, and body are required",
        });
      }

      const emailId = `email_${Date.now()}`;
      const messageId = `${emailId}@qumail.com`;

      const newEmail = {
        id: emailId,
        messageId,
        from: "user@qumail.com",
        to,
        subject,
        body,
        date: new Date().toISOString(),
        unread: false,
        folder: "SENT",
        attachments,
        securityLevel,
        encrypted: securityLevel > 1,
      };

      emails.set(emailId, newEmail);

      return res.json({
        success: true,
        messageId,
        emailId,
        timestamp: new Date().toISOString(),
      });
    }

    // Get status
    if (method === "GET" && pathname === "/api/email/status") {
      const accountList = Array.from(accounts.values()).map((account) => ({
        id: account.id,
        email: account.email,
        name: account.name,
        provider: account.provider,
        connected: account.connected,
        lastSync: account.lastSync,
      }));

      return res.json({
        status: "active",
        accounts: accountList,
        totalEmails: emails.size,
        folders: Array.from(folders.keys()),
        timestamp: new Date().toISOString(),
      });
    }

    // Health check
    if (method === "GET" && pathname === "/api/email/health") {
      return res.json({
        status: "healthy",
        service: "Vercel Email Service",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        stats: {
          emails: emails.size,
          accounts: accounts.size,
          folders: folders.size,
        },
      });
    }

    // Default 404
    return res.status(404).json({
      error: "NOT_FOUND",
      message: "Endpoint not found",
      path: pathname,
      method,
    });
  } catch (error) {
    console.error("Email API Error:", error);
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    });
  }
};
