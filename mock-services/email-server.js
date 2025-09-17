/**
 * Mock Email Server - IMAP/SMTP Simulation
 * For testing email functionality in QuMail
 */

import express from "express";
import cors from "cors";

const app = express();
const PORT = 8081;

// Middleware
app.use(cors());
app.use(express.json());

// Mock email storage
const emailStorage = {
  inbox: [],
  sent: [],
  drafts: [],
  trash: [],
};

// Mock user accounts
const userAccounts = new Map();

// Initialize with sample emails
function initializeSampleData() {
  const sampleEmails = [
    {
      id: "email_1",
      from: "alice@quantumtech.com",
      to: ["user@qumail.local"],
      subject: "Welcome to Quantum Secure Communications",
      body: "Welcome to the future of secure email communications with quantum key distribution.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      encrypted: true,
      securityLevel: "quantum_secure",
      quantumKeyId: "QK_welcome_001",
      read: false,
      folder: "inbox",
    },
    {
      id: "email_2",
      from: "security@isro.gov.in",
      to: ["user@qumail.local"],
      subject: "QKD System Status Update",
      body: "Your quantum key distribution system is operating normally. All security protocols are active.",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      encrypted: true,
      securityLevel: "quantum_aes",
      quantumKeyId: "QK_status_002",
      read: true,
      folder: "inbox",
    },
    {
      id: "email_3",
      from: "user@qumail.local",
      to: ["recipient@example.com"],
      subject: "Testing QuMail Quantum Security",
      body: "This is a test email sent using QuMail with quantum encryption.",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      encrypted: true,
      securityLevel: "quantum_secure",
      quantumKeyId: "QK_test_003",
      read: true,
      folder: "sent",
    },
  ];

  sampleEmails.forEach((email) => {
    if (!emailStorage[email.folder]) {
      emailStorage[email.folder] = [];
    }
    emailStorage[email.folder].push(email);
  });
}

initializeSampleData();

// Health check
app.get("/api/v1/status", (req, res) => {
  res.json({
    status: "online",
    service: "Mock Email Server",
    version: "1.0.0",
    protocols: ["IMAP", "SMTP"],
    accounts: userAccounts.size,
    timestamp: new Date().toISOString(),
  });
});

// Account authentication
app.post("/api/v1/auth", (req, res) => {
  const { email, password, host, port, protocol } = req.body;

  console.log(
    `Authentication request: ${email} via ${protocol}://${host}:${port}`
  );

  // Simple mock authentication
  if (email && password) {
    const accountId = `acc_${Date.now()}`;
    userAccounts.set(accountId, {
      email,
      host,
      port,
      protocol,
      authenticated: true,
      lastActivity: new Date(),
    });

    res.json({
      success: true,
      accountId: accountId,
      message: "Authentication successful",
    });
  } else {
    res.status(401).json({
      success: false,
      error: "Invalid credentials",
    });
  }
});

// Fetch emails (IMAP simulation)
app.get("/api/v1/emails/:accountId/:folder", (req, res) => {
  const { accountId, folder } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  console.log(`Fetching emails: ${folder} for account ${accountId}`);

  const account = userAccounts.get(accountId);
  if (!account) {
    return res.status(401).json({
      success: false,
      error: "Account not authenticated",
    });
  }

  const emails = emailStorage[folder] || [];
  const startIndex = parseInt(offset);
  const endIndex = startIndex + parseInt(limit);
  const paginatedEmails = emails.slice(startIndex, endIndex);

  res.json({
    success: true,
    emails: paginatedEmails,
    total: emails.length,
    folder: folder,
  });
});

// Send email (SMTP simulation)
app.post("/api/v1/send/:accountId", (req, res) => {
  const { accountId } = req.params;
  const emailData = req.body;

  console.log(`Sending email from account ${accountId}`);

  const account = userAccounts.get(accountId);
  if (!account) {
    return res.status(401).json({
      success: false,
      error: "Account not authenticated",
    });
  }

  // Validate email data
  if (!emailData.to || !emailData.subject || !emailData.body) {
    return res.status(400).json({
      success: false,
      error: "Missing required email fields",
    });
  }

  // Create email object
  const email = {
    id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    from: account.email,
    to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
    cc: emailData.cc || [],
    bcc: emailData.bcc || [],
    subject: emailData.subject,
    body: emailData.body,
    attachments: emailData.attachments || [],
    timestamp: new Date().toISOString(),
    encrypted: emailData.encrypted || false,
    securityLevel: emailData.securityLevel || "no_quantum",
    quantumKeyId: emailData.quantumKeyId || null,
    read: true,
    folder: "sent",
  };

  // Store in sent folder
  if (!emailStorage.sent) {
    emailStorage.sent = [];
  }
  emailStorage.sent.push(email);

  // Simulate delivery delay
  setTimeout(() => {
    console.log(`Email delivered: ${email.id}`);
  }, 1000);

  res.json({
    success: true,
    messageId: email.id,
    message: "Email sent successfully",
  });
});

// Get folders
app.get("/api/v1/folders/:accountId", (req, res) => {
  const { accountId } = req.params;

  const account = userAccounts.get(accountId);
  if (!account) {
    return res.status(401).json({
      success: false,
      error: "Account not authenticated",
    });
  }

  const folders = [
    {
      name: "INBOX",
      path: "inbox",
      type: "inbox",
      messageCount: emailStorage.inbox?.length || 0,
      unreadCount: emailStorage.inbox?.filter((e) => !e.read).length || 0,
    },
    {
      name: "Sent",
      path: "sent",
      type: "sent",
      messageCount: emailStorage.sent?.length || 0,
      unreadCount: 0,
    },
    {
      name: "Drafts",
      path: "drafts",
      type: "drafts",
      messageCount: emailStorage.drafts?.length || 0,
      unreadCount: 0,
    },
    {
      name: "Trash",
      path: "trash",
      type: "trash",
      messageCount: emailStorage.trash?.length || 0,
      unreadCount: 0,
    },
  ];

  res.json({
    success: true,
    folders: folders,
  });
});

// Search emails
app.post("/api/v1/search/:accountId", (req, res) => {
  const { accountId } = req.params;
  const { query, folder, sender, dateRange } = req.body;

  console.log(`Searching emails for account ${accountId}:`, {
    query,
    folder,
    sender,
  });

  const account = userAccounts.get(accountId);
  if (!account) {
    return res.status(401).json({
      success: false,
      error: "Account not authenticated",
    });
  }

  let searchEmails = [];

  if (folder && emailStorage[folder]) {
    searchEmails = emailStorage[folder];
  } else {
    // Search across all folders
    Object.values(emailStorage).forEach((folderEmails) => {
      searchEmails = searchEmails.concat(folderEmails);
    });
  }

  // Apply search filters
  if (query) {
    const queryLower = query.toLowerCase();
    searchEmails = searchEmails.filter(
      (email) =>
        email.subject.toLowerCase().includes(queryLower) ||
        email.body.toLowerCase().includes(queryLower) ||
        email.from.toLowerCase().includes(queryLower)
    );
  }

  if (sender) {
    searchEmails = searchEmails.filter((email) =>
      email.from.toLowerCase().includes(sender.toLowerCase())
    );
  }

  if (dateRange && dateRange.start && dateRange.end) {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    searchEmails = searchEmails.filter((email) => {
      const emailDate = new Date(email.timestamp);
      return emailDate >= startDate && emailDate <= endDate;
    });
  }

  res.json({
    success: true,
    emails: searchEmails,
    total: searchEmails.length,
  });
});

// Mark email as read/unread
app.patch("/api/v1/emails/:accountId/:emailId", (req, res) => {
  const { accountId, emailId } = req.params;
  const { read, folder } = req.body;

  const account = userAccounts.get(accountId);
  if (!account) {
    return res.status(401).json({
      success: false,
      error: "Account not authenticated",
    });
  }

  // Find and update email
  let emailFound = false;
  Object.keys(emailStorage).forEach((folderName) => {
    const email = emailStorage[folderName].find((e) => e.id === emailId);
    if (email) {
      if (read !== undefined) email.read = read;
      if (folder && folder !== folderName) {
        // Move email to different folder
        emailStorage[folderName] = emailStorage[folderName].filter(
          (e) => e.id !== emailId
        );
        if (!emailStorage[folder]) emailStorage[folder] = [];
        emailStorage[folder].push({ ...email, folder });
      }
      emailFound = true;
    }
  });

  if (emailFound) {
    res.json({
      success: true,
      message: "Email updated successfully",
    });
  } else {
    res.status(404).json({
      success: false,
      error: "Email not found",
    });
  }
});

// Delete email
app.delete("/api/v1/emails/:accountId/:emailId", (req, res) => {
  const { accountId, emailId } = req.params;

  const account = userAccounts.get(accountId);
  if (!account) {
    return res.status(401).json({
      success: false,
      error: "Account not authenticated",
    });
  }

  let emailDeleted = false;
  Object.keys(emailStorage).forEach((folderName) => {
    const emailIndex = emailStorage[folderName].findIndex(
      (e) => e.id === emailId
    );
    if (emailIndex !== -1) {
      emailStorage[folderName].splice(emailIndex, 1);
      emailDeleted = true;
    }
  });

  if (emailDeleted) {
    res.json({
      success: true,
      message: "Email deleted successfully",
    });
  } else {
    res.status(404).json({
      success: false,
      error: "Email not found",
    });
  }
});

// Get account info
app.get("/api/v1/account/:accountId", (req, res) => {
  const { accountId } = req.params;

  const account = userAccounts.get(accountId);
  if (!account) {
    return res.status(404).json({
      success: false,
      error: "Account not found",
    });
  }

  res.json({
    success: true,
    account: {
      email: account.email,
      host: account.host,
      port: account.port,
      protocol: account.protocol,
      lastActivity: account.lastActivity,
    },
  });
});

// Disconnect account
app.delete("/api/v1/account/:accountId", (req, res) => {
  const { accountId } = req.params;

  if (userAccounts.delete(accountId)) {
    res.json({
      success: true,
      message: "Account disconnected successfully",
    });
  } else {
    res.status(404).json({
      success: false,
      error: "Account not found",
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`📧 Mock Email Server running on port ${PORT}`);
  console.log(`📨 IMAP/SMTP simulation endpoints available`);
  console.log(
    `📁 ${Object.keys(emailStorage).length} email folders initialized`
  );
  console.log(
    `✉️  ${Object.values(emailStorage).flat().length} sample emails loaded`
  );
  console.log(`\nEndpoints:`);
  console.log(`  GET  /api/v1/status - Health check`);
  console.log(`  POST /api/v1/auth - Account authentication`);
  console.log(`  GET  /api/v1/emails/:accountId/:folder - Fetch emails`);
  console.log(`  POST /api/v1/send/:accountId - Send email`);
  console.log(`  GET  /api/v1/folders/:accountId - Get folders`);
  console.log(`  POST /api/v1/search/:accountId - Search emails`);
  console.log(`  PATCH /api/v1/emails/:accountId/:emailId - Update email`);
  console.log(`  DELETE /api/v1/emails/:accountId/:emailId - Delete email`);
});
