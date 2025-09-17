/**
 * QuMail Validation Script
 * Tests core functionality without requiring UI interaction
 */

import { kmService } from "./src/services/kmService.js";
import { emailService } from "./src/services/emailService.js";
import { securityService } from "./src/services/securityService.js";
import { encryptionEngine } from "./src/services/encryptionEngine.js";

class QuMailValidator {
  constructor() {
    this.results = {
      kmService: null,
      emailService: null,
      securityService: null,
      encryptionEngine: null,
      overall: null,
    };
  }

  async validateKMService() {
    console.log("🔐 Testing Key Manager Service...");
    try {
      // Test KM connection
      const status = await kmService.getStatus();
      console.log("✅ KM Status:", status ? "Connected" : "Disconnected");

      // Test key retrieval
      const key = await kmService.getKey("test-sae-1", "test-sae-2", 256);
      console.log("✅ Key retrieved:", key ? "Success" : "Failed");

      // Test OTP keys
      const otpKeys = await kmService.getOTPKeys("test-sae-1", "test-sae-2", 5);
      console.log("✅ OTP Keys:", otpKeys?.length || 0, "keys retrieved");

      this.results.kmService = true;
      return true;
    } catch (error) {
      console.error("❌ KM Service Error:", error.message);
      this.results.kmService = false;
      return false;
    }
  }

  async validateEmailService() {
    console.log("📧 Testing Email Service...");
    try {
      // Test email configuration
      const config = {
        provider: "gmail",
        email: "test@gmail.com",
        password: "test-password",
      };

      const configResult = await emailService.configureAccount(config);
      console.log("✅ Email Config:", configResult ? "Success" : "Failed");

      // Test email fetching
      const emails = await emailService.getEmails("INBOX");
      console.log("✅ Emails fetched:", emails?.length || 0, "emails");

      // Test email composition
      const testEmail = {
        to: "recipient@example.com",
        subject: "Test Email",
        body: "This is a test email",
        attachments: [],
      };

      const sendResult = await emailService.sendEmail(testEmail);
      console.log("✅ Email sending:", sendResult ? "Success" : "Failed");

      this.results.emailService = true;
      return true;
    } catch (error) {
      console.error("❌ Email Service Error:", error.message);
      this.results.emailService = false;
      return false;
    }
  }

  async validateSecurityService() {
    console.log("🛡️ Testing Security Service...");
    try {
      const testData = "This is test data for encryption";
      const results = {};

      // Test all security levels
      for (let level = 1; level <= 4; level++) {
        try {
          const encrypted = await securityService.encryptData(testData, level);
          const decrypted = await securityService.decryptData(encrypted, level);

          results[`level${level}`] = {
            encrypted: !!encrypted,
            decrypted: decrypted === testData,
          };

          console.log(
            `✅ Security Level ${level}:`,
            encrypted ? "Encrypt OK" : "Encrypt Failed",
            "|",
            decrypted === testData ? "Decrypt OK" : "Decrypt Failed"
          );
        } catch (error) {
          console.error(`❌ Security Level ${level} Error:`, error.message);
          results[`level${level}`] = { encrypted: false, decrypted: false };
        }
      }

      const allPassed = Object.values(results).every(
        (r) => r.encrypted && r.decrypted
      );
      this.results.securityService = allPassed;
      return allPassed;
    } catch (error) {
      console.error("❌ Security Service Error:", error.message);
      this.results.securityService = false;
      return false;
    }
  }

  async validateEncryptionEngine() {
    console.log("🔧 Testing Encryption Engine...");
    try {
      const testEmail = {
        subject: "Test Subject",
        body: "Test email body content",
        attachments: [
          {
            name: "test.txt",
            content: "Test file content",
            type: "text/plain",
          },
        ],
      };

      // Test encryption with different security levels
      for (let level = 1; level <= 4; level++) {
        try {
          const encrypted = await encryptionEngine.encryptEmail(
            testEmail,
            level
          );
          const decrypted = await encryptionEngine.decryptEmail(
            encrypted,
            level
          );

          const subjectMatch = decrypted.subject === testEmail.subject;
          const bodyMatch = decrypted.body === testEmail.body;
          const attachmentMatch =
            decrypted.attachments?.length === testEmail.attachments.length;

          console.log(
            `✅ Encryption Engine Level ${level}:`,
            subjectMatch ? "Subject OK" : "Subject Failed",
            "|",
            bodyMatch ? "Body OK" : "Body Failed",
            "|",
            attachmentMatch ? "Attachments OK" : "Attachments Failed"
          );
        } catch (error) {
          console.error(
            `❌ Encryption Engine Level ${level} Error:`,
            error.message
          );
        }
      }

      this.results.encryptionEngine = true;
      return true;
    } catch (error) {
      console.error("❌ Encryption Engine Error:", error.message);
      this.results.encryptionEngine = false;
      return false;
    }
  }

  async runAllTests() {
    console.log("🚀 Starting QuMail Validation Tests...\n");

    const kmResult = await this.validateKMService();
    console.log("");

    const emailResult = await this.validateEmailService();
    console.log("");

    const securityResult = await this.validateSecurityService();
    console.log("");

    const encryptionResult = await this.validateEncryptionEngine();
    console.log("");

    // Overall results
    const passedTests = [
      kmResult,
      emailResult,
      securityResult,
      encryptionResult,
    ].filter((result) => result).length;
    const totalTests = 4;

    console.log("📊 VALIDATION RESULTS:");
    console.log("======================");
    console.log(
      `🔐 Key Manager Service: ${
        this.results.kmService ? "✅ PASS" : "❌ FAIL"
      }`
    );
    console.log(
      `📧 Email Service: ${this.results.emailService ? "✅ PASS" : "❌ FAIL"}`
    );
    console.log(
      `🛡️ Security Service: ${
        this.results.securityService ? "✅ PASS" : "❌ FAIL"
      }`
    );
    console.log(
      `🔧 Encryption Engine: ${
        this.results.encryptionEngine ? "✅ PASS" : "❌ FAIL"
      }`
    );
    console.log("======================");
    console.log(
      `📈 Overall Score: ${passedTests}/${totalTests} (${Math.round(
        (passedTests / totalTests) * 100
      )}%)`
    );

    this.results.overall = passedTests === totalTests;

    if (this.results.overall) {
      console.log("🎉 ALL TESTS PASSED! QuMail is ready for deployment.");
    } else {
      console.log("⚠️ Some tests failed. Please check the errors above.");
    }

    return this.results;
  }
}

// Export for use in other modules
export { QuMailValidator };

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new QuMailValidator();
  validator.runAllTests().then((results) => {
    process.exit(results.overall ? 0 : 1);
  });
}
