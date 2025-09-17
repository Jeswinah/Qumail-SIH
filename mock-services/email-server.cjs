/**
 * Mock Email Server - IMAP/SMTP Simulation
 * For testing email functionality in QuMail
 */

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 8081;

// Middleware
app.use(cors());
app.use(express.json());

// Mock email storage
const emails = new Map();
const accounts = new Map();
const folders = new Map();

// Initialize with sample data
function initializeEmailData() {
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
}

// Email provider configurations
const providers = {
  gmail: {
    imap: { host: "imap.gmail.com", port: 993, secure: true },
    smtp: { host: "smtp.gmail.com", port: 587, secure: false },
  },
  yahoo: {
    imap: { host: "imap.mail.yahoo.com", port: 993, secure: true },
    smtp: { host: "smtp.mail.yahoo.com", port: 587, secure: false },
  },
  outlook: {
    imap: { host: "outlook.office365.com", port: 993, secure: true },
    smtp: { host: "smtp-mail.outlook.com", port: 587, secure: false },
  },
};

// Configure email account
app.post("/api/configure", (req, res) => {
  const { provider, email, password, name } = req.body;

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
    config: providers[provider] || providers.gmail,
  };

  accounts.set(accountId, account);

  res.json({
    success: true,
    account: {
      id: accountId,
      email,
      name: account.name,
      provider,
      connected: true,
    },
  });
});

// Get emails from folder
app.get("/api/emails/:folder", (req, res) => {
  const { folder } = req.params;
  const { limit = 50, offset = 0, unreadOnly = false } = req.query;

  let folderEmails = Array.from(emails.values()).filter(
    (email) => email.folder === folder.toUpperCase()
  );

  if (unreadOnly === "true") {
    folderEmails = folderEmails.filter((email) => email.unread);
  }

  // Sort by date (newest first)
  folderEmails.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Apply pagination
  const start = parseInt(offset);
  const end = start + parseInt(limit);
  const paginatedEmails = folderEmails.slice(start, end);

  res.json({
    emails: paginatedEmails,
    total: folderEmails.length,
    folder,
    pagination: {
      offset: start,
      limit: parseInt(limit),
      hasMore: end < folderEmails.length,
    },
  });
});

// Get specific email
app.get("/api/emails/:folder/:emailId", (req, res) => {
  const { emailId } = req.params;
  const email = emails.get(emailId);

  if (!email) {
    return res.status(404).json({
      error: "EMAIL_NOT_FOUND",
      message: "Email not found",
    });
  }

  // Mark as read
  email.unread = false;
  emails.set(emailId, email);

  res.json(email);
});

// Send email
app.post("/api/send", (req, res) => {
  const { to, subject, body, attachments = [], securityLevel = 1 } = req.body;

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

  res.json({
    success: true,
    messageId,
    emailId,
    timestamp: new Date().toISOString(),
  });
});

// Search emails
app.get("/api/search", (req, res) => {
  const { query, folder, dateRange } = req.query;

  if (!query) {
    return res.status(400).json({
      error: "INVALID_SEARCH",
      message: "Search query is required",
    });
  }

  let searchResults = Array.from(emails.values());

  // Filter by folder if specified
  if (folder) {
    searchResults = searchResults.filter(
      (email) => email.folder === folder.toUpperCase()
    );
  }

  // Search in subject and body
  const searchTerm = query.toLowerCase();
  searchResults = searchResults.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchTerm) ||
      email.body.toLowerCase().includes(searchTerm) ||
      email.from.toLowerCase().includes(searchTerm) ||
      email.to.toLowerCase().includes(searchTerm)
  );

  // Sort by relevance (date for now)
  searchResults.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({
    results: searchResults,
    query,
    total: searchResults.length,
  });
});

// Get folders
app.get("/api/folders", (req, res) => {
  const folderList = Array.from(folders.values()).map((folder) => ({
    ...folder,
    emails: Array.from(emails.values()).filter((e) => e.folder === folder.name),
  }));

  res.json({ folders: folderList });
});

// Create folder
app.post("/api/folders", (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      error: "INVALID_FOLDER",
      message: "Folder name is required",
    });
  }

  if (folders.has(name.toUpperCase())) {
    return res.status(409).json({
      error: "FOLDER_EXISTS",
      message: "Folder already exists",
    });
  }

  const folder = {
    name: name.toUpperCase(),
    count: 0,
    unread: 0,
  };

  folders.set(folder.name, folder);

  res.json({
    success: true,
    folder,
  });
});

// Delete email
app.delete("/api/emails/:emailId", (req, res) => {
  const { emailId } = req.params;

  if (!emails.has(emailId)) {
    return res.status(404).json({
      error: "EMAIL_NOT_FOUND",
      message: "Email not found",
    });
  }

  emails.delete(emailId);

  res.json({
    success: true,
    message: "Email deleted",
  });
});

// Get account status
app.get("/api/status", (req, res) => {
  const accountList = Array.from(accounts.values()).map((account) => ({
    id: account.id,
    email: account.email,
    name: account.name,
    provider: account.provider,
    connected: account.connected,
    lastSync: account.lastSync,
  }));

  res.json({
    status: "active",
    accounts: accountList,
    totalEmails: emails.size,
    folders: Array.from(folders.keys()),
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Mock Email Server",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    stats: {
      emails: emails.size,
      accounts: accounts.size,
      folders: folders.size,
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "Endpoint not found",
    path: req.path,
    method: req.method,
  });
});

// Initialize and start server
initializeEmailData();

app.listen(PORT, () => {
  console.log(`📧 Mock Email Server running on port ${PORT}`);
  console.log(`📡 Email API available at http://localhost:${PORT}/api`);
  console.log(`🔍 Status: http://localhost:${PORT}/api/status`);
  console.log(`❤️ Health: http://localhost:${PORT}/health`);
  console.log(`📊 Sample emails loaded: ${emails.size}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down Mock Email Server...");
  process.exit(0);
});

module.exports = app;
