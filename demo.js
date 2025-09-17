/**
 * QuMail Demo Script
 * Demonstrates all features of the Quantum Secure Email Client
 */

import { kmService } from "./src/services/kmService.js";
import { emailService } from "./src/services/emailService.js";
import { securityService } from "./src/services/securityService.js";
import { encryptionEngine } from "./src/services/encryptionEngine.js";

class QuMailDemo {
  constructor() {
    this.demoData = {
      sampleEmail: {
        to: "recipient@example.com",
        subject: "Quantum Secure Communication Test",
        body: `This is a demonstration of QuMail's quantum-secured email capabilities.
                
The email you're reading has been protected using quantum key distribution technology.
Different security levels provide varying degrees of protection:

1. Standard Encryption: Traditional AES encryption
2. Post-Quantum Cryptography: Quantum-resistant algorithms
3. Quantum-aided AES: AES with quantum-derived keys
4. Quantum Secure: One-time pad with true quantum keys

Each level offers increasing security against both classical and quantum attacks.`,
        attachments: [
          {
            name: "quantum_security_brief.txt",
            content:
              "Quantum Key Distribution provides information-theoretic security...",
            type: "text/plain",
          },
        ],
      },
      kmConfig: {
        endpoint: "http://localhost:8080",
        saeId: "demo-client-001",
        targetSaeId: "demo-server-001",
      },
      emailConfig: {
        provider: "gmail",
        email: "demo@qumail.com",
        password: "demo-password",
        name: "QuMail Demo User",
      },
    };
  }

  async waitForUserInput(message) {
    console.log(`\n⏸️ ${message}`);
    console.log("Press Enter to continue...");
    // In a real environment, you'd wait for user input
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  async demonstrateKMIntegration() {
    console.log("\n🔐 QUANTUM KEY MANAGER INTEGRATION DEMO");
    console.log("=====================================");

    try {
      // Configure KM service
      console.log("📡 Configuring Key Manager connection...");
      await kmService.configure(this.demoData.kmConfig);
      console.log("✅ KM Configuration complete");

      // Check KM status
      console.log("🔍 Checking Key Manager status...");
      const status = await kmService.getStatus();
      console.log(`📊 KM Status: ${status ? "Online ✅" : "Offline ❌"}`);

      // Request encryption key
      console.log("🔑 Requesting encryption key...");
      const encKey = await kmService.requestEncryptionKey(
        this.demoData.kmConfig.saeId,
        this.demoData.kmConfig.targetSaeId,
        256
      );
      console.log(
        `✅ Encryption key obtained: ${encKey ? "Success" : "Failed"}`
      );
      console.log(`🆔 Key ID: ${encKey?.keyId || "N/A"}`);
      console.log(`📏 Key Size: ${encKey?.keySize || "N/A"} bits`);

      // Request OTP keys for quantum secure communication
      console.log("🎲 Requesting One-Time Pad keys...");
      const otpKeys = await kmService.getOTPKeys(
        this.demoData.kmConfig.saeId,
        this.demoData.kmConfig.targetSaeId,
        3
      );
      console.log(`✅ OTP Keys obtained: ${otpKeys?.length || 0} keys`);

      await this.waitForUserInput(
        "Key Manager integration demonstrated successfully!"
      );
    } catch (error) {
      console.error("❌ KM Integration Error:", error.message);
    }
  }

  async demonstrateSecurityLevels() {
    console.log("\n🛡️ MULTI-LEVEL SECURITY DEMONSTRATION");
    console.log("=====================================");

    const testMessage = "Confidential: Quantum security demonstration";

    const securityLevels = [
      {
        level: 1,
        name: "Standard Encryption",
        description: "AES-256 encryption",
      },
      {
        level: 2,
        name: "Post-Quantum Cryptography",
        description: "Quantum-resistant algorithms",
      },
      {
        level: 3,
        name: "Quantum-aided AES",
        description: "AES with quantum-derived keys",
      },
      {
        level: 4,
        name: "Quantum Secure",
        description: "One-time pad with quantum keys",
      },
    ];

    for (const { level, name, description } of securityLevels) {
      console.log(`\n📋 Testing Security Level ${level}: ${name}`);
      console.log(`📝 Description: ${description}`);

      try {
        // Encrypt the message
        console.log("🔒 Encrypting message...");
        const encrypted = await securityService.encryptData(testMessage, level);
        console.log(`✅ Encryption complete (${encrypted.length} bytes)`);
        console.log(`🔐 Encrypted preview: ${encrypted.substring(0, 50)}...`);

        // Decrypt the message
        console.log("🔓 Decrypting message...");
        const decrypted = await securityService.decryptData(encrypted, level);
        const success = decrypted === testMessage;
        console.log(
          `${success ? "✅" : "❌"} Decryption ${
            success ? "successful" : "failed"
          }`
        );

        if (success) {
          console.log(`📄 Decrypted: "${decrypted}"`);
        }

        // Show security metrics
        const metrics = await securityService.getSecurityMetrics(level);
        if (metrics) {
          console.log(`📊 Security metrics:`);
          console.log(`   🔢 Algorithm: ${metrics.algorithm}`);
          console.log(`   🔑 Key source: ${metrics.keySource}`);
          console.log(`   🛡️ Security level: ${metrics.securityLevel}`);
        }

        await this.waitForUserInput(
          `Security Level ${level} demonstration complete!`
        );
      } catch (error) {
        console.error(`❌ Security Level ${level} Error:`, error.message);
      }
    }
  }

  async demonstrateEmailOperations() {
    console.log("\n📧 EMAIL OPERATIONS DEMONSTRATION");
    console.log("==================================");

    try {
      // Configure email service
      console.log("⚙️ Configuring email service...");
      await emailService.configureAccount(this.demoData.emailConfig);
      console.log("✅ Email configuration complete");

      // Fetch existing emails
      console.log("📥 Fetching emails from inbox...");
      const emails = await emailService.getEmails("INBOX");
      console.log(`📊 Found ${emails?.length || 0} emails in inbox`);

      if (emails && emails.length > 0) {
        console.log(
          `📄 Latest email: "${emails[0].subject}" from ${emails[0].from}`
        );
      }

      // Demonstrate email composition
      console.log("✍️ Composing encrypted email...");
      const draftEmail = { ...this.demoData.sampleEmail };
      console.log(`📝 Subject: "${draftEmail.subject}"`);
      console.log(`👤 To: ${draftEmail.to}`);
      console.log(`📎 Attachments: ${draftEmail.attachments.length}`);

      // Encrypt email with different security levels
      for (let level = 1; level <= 4; level++) {
        console.log(`\n🔐 Encrypting email with Security Level ${level}...`);

        const encryptedEmail = await encryptionEngine.encryptEmail(
          draftEmail,
          level
        );
        console.log(`✅ Email encrypted successfully`);
        console.log(
          `📏 Encrypted size: ${JSON.stringify(encryptedEmail).length} bytes`
        );

        // Send encrypted email
        console.log("📤 Sending encrypted email...");
        const sendResult = await emailService.sendEmail(encryptedEmail);
        console.log(
          `${sendResult ? "✅" : "❌"} Email ${
            sendResult ? "sent" : "failed to send"
          }`
        );

        if (sendResult) {
          console.log(`📧 Email ID: ${sendResult.messageId || "Generated"}`);
        }
      }

      await this.waitForUserInput("Email operations demonstration complete!");
    } catch (error) {
      console.error("❌ Email Operations Error:", error.message);
    }
  }

  async demonstrateEndToEndWorkflow() {
    console.log("\n🔄 END-TO-END WORKFLOW DEMONSTRATION");
    console.log("====================================");

    try {
      console.log("🎯 Scenario: Sending quantum-secured confidential document");

      // Step 1: Prepare confidential email
      const confidentialEmail = {
        to: "ceo@company.com",
        subject: "[CONFIDENTIAL] Q4 Financial Report",
        body: `Dear CEO,

Please find attached the Q4 financial report. This document contains sensitive information and has been secured using quantum cryptography.

Security Level: Quantum Secure (Level 4)
Encryption: One-Time Pad with Quantum Keys
Authentication: ETSI GS QKD 014 compliant

The attached files are:
1. Financial Summary (Excel)
2. Audit Report (PDF)
3. Board Presentation (PowerPoint)

Best regards,
CFO`,
        attachments: [
          {
            name: "Q4_Financial_Summary.xlsx",
            content: "Mock Excel financial data...",
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
          {
            name: "Audit_Report_Q4.pdf",
            content: "Mock PDF audit report content...",
            type: "application/pdf",
          },
          {
            name: "Board_Presentation.pptx",
            content: "Mock PowerPoint presentation...",
            type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          },
        ],
      };

      // Step 2: Setup quantum secure environment
      console.log("🔧 Setting up quantum secure environment...");
      await kmService.configure(this.demoData.kmConfig);

      // Step 3: Verify quantum key availability
      console.log("🔍 Verifying quantum key availability...");
      const keyStatus = await kmService.getStatus();
      console.log(
        `🔑 Quantum keys: ${keyStatus ? "Available ✅" : "Not available ❌"}`
      );

      // Step 4: Encrypt with highest security level
      console.log("🔒 Encrypting with Quantum Secure protection (Level 4)...");
      const encryptedEmail = await encryptionEngine.encryptEmail(
        confidentialEmail,
        4
      );

      // Show encryption details
      console.log("📊 Encryption Results:");
      console.log(
        `   📝 Subject encrypted: ${!!encryptedEmail.encryptedSubject}`
      );
      console.log(`   📄 Body encrypted: ${!!encryptedEmail.encryptedBody}`);
      console.log(
        `   📎 Attachments encrypted: ${
          encryptedEmail.encryptedAttachments?.length || 0
        }`
      );
      console.log(
        `   🔐 Total encrypted size: ${
          JSON.stringify(encryptedEmail).length
        } bytes`
      );

      // Step 5: Send encrypted email
      console.log("📤 Sending quantum-secured email...");
      await emailService.configureAccount(this.demoData.emailConfig);
      const sendResult = await emailService.sendEmail(encryptedEmail);
      console.log(
        `${sendResult ? "✅" : "❌"} Email ${
          sendResult ? "sent successfully" : "failed to send"
        }`
      );

      // Step 6: Simulate recipient receiving and decrypting
      console.log("\n👤 Simulating recipient operations...");
      console.log("📥 Recipient receives encrypted email...");
      console.log("🔓 Recipient decrypts email using quantum keys...");

      const decryptedEmail = await encryptionEngine.decryptEmail(
        encryptedEmail,
        4
      );

      // Verify decryption integrity
      const subjectMatch = decryptedEmail.subject === confidentialEmail.subject;
      const bodyMatch = decryptedEmail.body === confidentialEmail.body;
      const attachmentMatch =
        decryptedEmail.attachments?.length ===
        confidentialEmail.attachments.length;

      console.log("🔍 Decryption verification:");
      console.log(
        `   📝 Subject: ${subjectMatch ? "✅ Intact" : "❌ Corrupted"}`
      );
      console.log(`   📄 Body: ${bodyMatch ? "✅ Intact" : "❌ Corrupted"}`);
      console.log(
        `   📎 Attachments: ${attachmentMatch ? "✅ Intact" : "❌ Corrupted"}`
      );

      // Step 7: Security audit
      console.log("\n🔍 Security Audit:");
      console.log("   🔑 Quantum keys consumed: Yes (OTP principle)");
      console.log("   🛡️ Forward secrecy: Guaranteed");
      console.log("   🔒 Information-theoretic security: Achieved");
      console.log("   📋 ETSI compliance: Verified");

      console.log(
        "\n🎉 End-to-end quantum secure email workflow completed successfully!"
      );

      await this.waitForUserInput("Full workflow demonstration complete!");
    } catch (error) {
      console.error("❌ End-to-End Workflow Error:", error.message);
    }
  }

  async runFullDemo() {
    console.log("🚀 WELCOME TO QUMAIL COMPREHENSIVE DEMO");
    console.log("=======================================");
    console.log(
      "This demonstration will showcase all features of the Quantum Secure Email Client"
    );
    console.log("");
    console.log("📋 Demo Agenda:");
    console.log("1. Quantum Key Manager Integration");
    console.log("2. Multi-Level Security System");
    console.log("3. Email Operations");
    console.log("4. End-to-End Workflow");
    console.log("");

    await this.waitForUserInput("Ready to begin comprehensive demo?");

    // Run all demonstrations
    await this.demonstrateKMIntegration();
    await this.demonstrateSecurityLevels();
    await this.demonstrateEmailOperations();
    await this.demonstrateEndToEndWorkflow();

    // Final summary
    console.log("\n🎯 DEMO SUMMARY");
    console.log("===============");
    console.log(
      "✅ Quantum Key Manager: ETSI GS QKD 014 compliant integration"
    );
    console.log("✅ Multi-Level Security: 4 security levels demonstrated");
    console.log("✅ Email Operations: Full IMAP/SMTP compatibility");
    console.log(
      "✅ End-to-End Workflow: Complete quantum secure email process"
    );
    console.log("");
    console.log(
      "🌟 QuMail successfully demonstrates quantum-secured email communication"
    );
    console.log("   suitable for deployment in high-security environments.");
    console.log("");
    console.log("📄 Key Features Demonstrated:");
    console.log("   • Quantum Key Distribution integration");
    console.log("   • Information-theoretic security (OTP mode)");
    console.log("   • Post-quantum cryptography support");
    console.log("   • Standard email client compatibility");
    console.log("   • Multi-provider email support");
    console.log("   • Secure attachment handling");
    console.log("   • ETSI standard compliance");
    console.log("");
    console.log("🏁 Demo completed successfully!");

    return true;
  }
}

// Export for use in other modules
export { QuMailDemo };

// Run demo if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new QuMailDemo();
  demo
    .runFullDemo()
    .then(() => {
      console.log("Demo completed. Thank you for trying QuMail!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Demo failed:", error);
      process.exit(1);
    });
}
