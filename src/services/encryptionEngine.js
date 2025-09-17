/**
 * Encryption Engine - Unified encryption/decryption for QuMail
 * Integrates quantum keys, multi-level security, and email compatibility
 */

import { securityService } from "./securityService";
import { kmService } from "./kmService";
import { SECURITY_LEVELS } from "../types";

class EncryptionEngine {
  constructor() {
    this.isInitialized = false;
    this.supportedMimeTypes = [
      "text/plain",
      "text/html",
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/json",
      "application/xml",
    ];
  }

  /**
   * Initialize the encryption engine
   */
  async initialize() {
    try {
      await securityService.initialize();
      await kmService.initialize();
      this.isInitialized = true;
      console.log("Encryption Engine initialized");
    } catch (error) {
      console.error("Failed to initialize Encryption Engine:", error);
      throw error;
    }
  }

  /**
   * Encrypt email data (subject, body, attachments)
   */
  async encryptEmail(emailData, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const securityLevel =
        options.securityLevel || securityService.getCurrentSecurityLevel();
      const encryptionId = `enc_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      console.log(`Encrypting email with security level: ${securityLevel}`);

      // Encrypt email components
      const encryptedSubject = await this.encryptSubject(
        emailData.subject,
        securityLevel
      );
      const encryptedBody = await this.encryptBody(
        emailData.body,
        securityLevel
      );

      // Encrypt attachments if present
      let encryptedAttachments = [];
      if (emailData.attachments && emailData.attachments.length > 0) {
        encryptedAttachments = await this.encryptAttachments(
          emailData.attachments,
          securityLevel
        );
      }

      // Create encryption metadata
      const encryptionMetadata = {
        encryptionId,
        securityLevel,
        timestamp: new Date().toISOString(),
        version: "1.0",
        components: {
          subject: encryptedSubject.metadata,
          body: encryptedBody.metadata,
          attachments: encryptedAttachments.map((att) => att.metadata),
        },
      };

      // Build encrypted email
      const encryptedEmail = {
        ...emailData,
        subject: this.formatEncryptedSubject(encryptedSubject),
        body: this.formatEncryptedBody(encryptedBody),
        attachments: encryptedAttachments,
        encrypted: true,
        encryptionMetadata,
        headers: {
          ...emailData.headers,
          "X-QuMail-Encrypted": "true",
          "X-QuMail-Security-Level": securityLevel,
          "X-QuMail-Encryption-Id": encryptionId,
          "X-QuMail-Version": "1.0",
        },
      };

      console.log("Email encryption completed successfully");
      return {
        success: true,
        encryptedEmail,
        encryptionId,
        securityLevel,
      };
    } catch (error) {
      console.error("Email encryption failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Decrypt email data
   */
  async decryptEmail(encryptedEmail, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!encryptedEmail.encrypted) {
        return {
          success: true,
          decryptedEmail: encryptedEmail,
          wasEncrypted: false,
        };
      }

      const encryptionMetadata = encryptedEmail.encryptionMetadata;
      if (!encryptionMetadata) {
        throw new Error("Missing encryption metadata");
      }

      console.log(
        `Decrypting email with security level: ${encryptionMetadata.securityLevel}`
      );

      // Decrypt email components
      const decryptedSubject = await this.decryptSubject(
        encryptedEmail.subject,
        encryptionMetadata.components.subject
      );
      const decryptedBody = await this.decryptBody(
        encryptedEmail.body,
        encryptionMetadata.components.body
      );

      // Decrypt attachments if present
      let decryptedAttachments = [];
      if (encryptedEmail.attachments && encryptedEmail.attachments.length > 0) {
        decryptedAttachments = await this.decryptAttachments(
          encryptedEmail.attachments,
          encryptionMetadata.components.attachments
        );
      }

      // Build decrypted email
      const decryptedEmail = {
        ...encryptedEmail,
        subject: decryptedSubject,
        body: decryptedBody,
        attachments: decryptedAttachments,
        encrypted: false,
        // Keep metadata for audit purposes
        originalEncryptionMetadata: encryptionMetadata,
      };

      console.log("Email decryption completed successfully");
      return {
        success: true,
        decryptedEmail,
        wasEncrypted: true,
        securityLevel: encryptionMetadata.securityLevel,
      };
    } catch (error) {
      console.error("Email decryption failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Encrypt email subject
   */
  async encryptSubject(subject, securityLevel) {
    try {
      // For subjects, we use a more compact encryption to maintain email compatibility
      const encrypted = await securityService.encryptData(subject, {
        securityLevel,
      });

      return {
        encryptedData: encrypted.encryptedData,
        metadata: {
          algorithm: encrypted.algorithm,
          securityLevel: encrypted.securityLevel,
          quantumKeyId: encrypted.quantumKeyId,
          timestamp: encrypted.timestamp,
        },
      };
    } catch (error) {
      console.error("Subject encryption failed:", error);
      throw error;
    }
  }

  /**
   * Decrypt email subject
   */
  async decryptSubject(encryptedSubject, metadata) {
    try {
      // Check if subject is actually encrypted (has QuMail prefix)
      if (!encryptedSubject.startsWith("[QuMail-Encrypted]")) {
        return encryptedSubject; // Not encrypted
      }

      // Extract encrypted data
      const encryptedData = encryptedSubject.replace("[QuMail-Encrypted] ", "");

      const decrypted = await securityService.decryptData({
        encryptedData,
        securityLevel: metadata.securityLevel,
        quantumKeyId: metadata.quantumKeyId,
        algorithm: metadata.algorithm,
      });

      return decrypted.data;
    } catch (error) {
      console.error("Subject decryption failed:", error);
      return "[Decryption Failed]";
    }
  }

  /**
   * Encrypt email body
   */
  async encryptBody(body, securityLevel) {
    try {
      // Detect if body is HTML or plain text
      const isHtml =
        body.includes("<html>") ||
        body.includes("<body>") ||
        body.includes("<div>");

      const encrypted = await securityService.encryptData(body, {
        securityLevel,
      });

      return {
        encryptedData: encrypted.encryptedData,
        metadata: {
          algorithm: encrypted.algorithm,
          securityLevel: encrypted.securityLevel,
          quantumKeyId: encrypted.quantumKeyId,
          timestamp: encrypted.timestamp,
          isHtml,
          originalSize: body.length,
        },
      };
    } catch (error) {
      console.error("Body encryption failed:", error);
      throw error;
    }
  }

  /**
   * Decrypt email body
   */
  async decryptBody(encryptedBody, metadata) {
    try {
      // Check if body is actually encrypted
      if (!encryptedBody.includes("QuMail-Encrypted-Body")) {
        return encryptedBody; // Not encrypted
      }

      // Extract encrypted data from the formatted body
      const match = encryptedBody.match(/QuMail-Encrypted-Body:\s*([^<]+)/);
      if (!match) {
        throw new Error("Invalid encrypted body format");
      }

      const encryptedData = match[1].trim();

      const decrypted = await securityService.decryptData({
        encryptedData,
        securityLevel: metadata.securityLevel,
        quantumKeyId: metadata.quantumKeyId,
        algorithm: metadata.algorithm,
      });

      return decrypted.data;
    } catch (error) {
      console.error("Body decryption failed:", error);
      return "<p><strong>Decryption Failed:</strong> Unable to decrypt email body.</p>";
    }
  }

  /**
   * Encrypt email attachments
   */
  async encryptAttachments(attachments, securityLevel) {
    const encryptedAttachments = [];

    for (const attachment of attachments) {
      try {
        console.log(`Encrypting attachment: ${attachment.filename}`);

        // Convert attachment data to string if it's binary
        let attachmentData = attachment.data;
        if (attachment.data instanceof ArrayBuffer) {
          attachmentData = this.arrayBufferToBase64(attachment.data);
        }

        // Encrypt the attachment data
        const encrypted = await securityService.encryptData(attachmentData, {
          securityLevel,
        });

        const encryptedAttachment = {
          ...attachment,
          data: encrypted.encryptedData,
          encrypted: true,
          metadata: {
            algorithm: encrypted.algorithm,
            securityLevel: encrypted.securityLevel,
            quantumKeyId: encrypted.quantumKeyId,
            timestamp: encrypted.timestamp,
            originalSize: attachment.size,
            originalContentType: attachment.contentType,
          },
        };

        encryptedAttachments.push(encryptedAttachment);
      } catch (error) {
        console.error(
          `Failed to encrypt attachment ${attachment.filename}:`,
          error
        );

        // Add unencrypted attachment with error note
        encryptedAttachments.push({
          ...attachment,
          encrypted: false,
          encryptionError: error.message,
        });
      }
    }

    return encryptedAttachments;
  }

  /**
   * Decrypt email attachments
   */
  async decryptAttachments(encryptedAttachments, metadataArray) {
    const decryptedAttachments = [];

    for (let i = 0; i < encryptedAttachments.length; i++) {
      const attachment = encryptedAttachments[i];
      const metadata = metadataArray[i];

      try {
        if (!attachment.encrypted) {
          decryptedAttachments.push(attachment);
          continue;
        }

        console.log(`Decrypting attachment: ${attachment.filename}`);

        const decrypted = await securityService.decryptData({
          encryptedData: attachment.data,
          securityLevel: metadata.securityLevel,
          quantumKeyId: metadata.quantumKeyId,
          algorithm: metadata.algorithm,
        });

        // Convert back to ArrayBuffer if needed
        let decryptedData = decrypted.data;
        if (
          metadata.originalContentType &&
          !metadata.originalContentType.startsWith("text/")
        ) {
          decryptedData = this.base64ToArrayBuffer(decrypted.data);
        }

        const decryptedAttachment = {
          ...attachment,
          data: decryptedData,
          encrypted: false,
          contentType: metadata.originalContentType || attachment.contentType,
          size: metadata.originalSize || attachment.size,
        };

        decryptedAttachments.push(decryptedAttachment);
      } catch (error) {
        console.error(
          `Failed to decrypt attachment ${attachment.filename}:`,
          error
        );

        // Add attachment with error note
        decryptedAttachments.push({
          ...attachment,
          decryptionError: error.message,
        });
      }
    }

    return decryptedAttachments;
  }

  /**
   * Format encrypted subject for email compatibility
   */
  formatEncryptedSubject(encryptedSubject) {
    return `[QuMail-Encrypted] ${encryptedSubject.encryptedData.substring(
      0,
      50
    )}...`;
  }

  /**
   * Format encrypted body for email compatibility
   */
  formatEncryptedBody(encryptedBody) {
    return `
<html>
<body>
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0f8ff; border: 1px solid #4169e1; border-radius: 8px;">
    <h3 style="color: #4169e1; margin-top: 0;">🔒 QuMail Encrypted Message</h3>
    <p style="color: #333;">This message is encrypted with quantum security technology.</p>
    <p style="color: #666; font-size: 12px;">
      <strong>Security Level:</strong> ${encryptedBody.metadata.securityLevel}<br>
      <strong>Algorithm:</strong> ${encryptedBody.metadata.algorithm}<br>
      <strong>Encrypted:</strong> ${encryptedBody.metadata.timestamp}
    </p>
    <div style="background-color: #fff; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; font-size: 11px;">
      QuMail-Encrypted-Body: ${encryptedBody.encryptedData}
    </div>
    <p style="color: #666; font-size: 11px; margin-bottom: 0;">
      Open with QuMail to decrypt and view the original message.
    </p>
  </div>
</body>
</html>`;
  }

  /**
   * Validate email for encryption
   */
  validateEmailForEncryption(emailData) {
    const errors = [];

    if (!emailData.subject || emailData.subject.trim() === "") {
      errors.push("Email subject is required");
    }

    if (!emailData.body || emailData.body.trim() === "") {
      errors.push("Email body is required");
    }

    if (!emailData.to || emailData.to.length === 0) {
      errors.push("At least one recipient is required");
    }

    // Validate attachments
    if (emailData.attachments) {
      emailData.attachments.forEach((attachment, index) => {
        if (!attachment.filename) {
          errors.push(`Attachment ${index + 1} is missing filename`);
        }
        if (!attachment.data) {
          errors.push(`Attachment ${index + 1} is missing data`);
        }
        if (!this.supportedMimeTypes.includes(attachment.contentType)) {
          console.warn(
            `Attachment ${attachment.filename} has unsupported MIME type: ${attachment.contentType}`
          );
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get encryption statistics
   */
  getEncryptionStats() {
    return {
      supportedSecurityLevels: Object.values(SECURITY_LEVELS),
      supportedMimeTypes: this.supportedMimeTypes,
      kmConnected: kmService.isConnected,
      defaultSecurityLevel: securityService.getCurrentSecurityLevel(),
    };
  }

  // Utility methods

  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
      ""
    );
    return btoa(binary);
  }

  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Generate encryption report for audit
   */
  generateEncryptionReport(encryptionResult) {
    return {
      timestamp: new Date().toISOString(),
      encryptionId: encryptionResult.encryptionId,
      securityLevel: encryptionResult.securityLevel,
      success: encryptionResult.success,
      componentsEncrypted: {
        subject: true,
        body: true,
        attachments: encryptionResult.encryptedEmail?.attachments?.length || 0,
      },
      error: encryptionResult.error || null,
    };
  }
}

// Export singleton instance
export const encryptionEngine = new EncryptionEngine();
