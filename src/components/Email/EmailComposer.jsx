import React, { useState, useRef } from "react";
import {
  X,
  Send,
  Paperclip,
  Shield,
  Key,
  Lock,
  Unlock,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useAppStore } from "../../stores/appStore";
import { emailService } from "../../services/emailService";
import { encryptionEngine } from "../../services/encryptionEngine";
import { SECURITY_LEVELS } from "../../types";
import toast from "react-hot-toast";

const EmailComposer = ({ onClose, replyTo, subject: initialSubject }) => {
  const { currentEmailAccount, securityConfig, addEmail } = useAppStore();
  const fileInputRef = useRef(null);

  const [emailData, setEmailData] = useState({
    to: replyTo ? [replyTo] : [""],
    cc: [],
    bcc: [],
    subject: initialSubject || "",
    body: "",
    attachments: [],
  });

  const [selectedSecurityLevel, setSelectedSecurityLevel] = useState(
    securityConfig.level
  );
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptionStatus, setEncryptionStatus] = useState(null);

  const securityLevels = [
    {
      id: SECURITY_LEVELS.QUANTUM_SECURE,
      name: "Quantum Secure",
      icon: Shield,
      color: "text-green-600",
      description: "One Time Pad with quantum keys",
    },
    {
      id: SECURITY_LEVELS.QUANTUM_AES,
      name: "Quantum AES",
      icon: Key,
      color: "text-blue-600",
      description: "AES with quantum key derivation",
    },
    {
      id: SECURITY_LEVELS.PQC_ENCRYPTION,
      name: "Post-Quantum",
      icon: Lock,
      color: "text-purple-600",
      description: "Post-quantum cryptography",
    },
    {
      id: SECURITY_LEVELS.NO_QUANTUM,
      name: "Standard",
      icon: Unlock,
      color: "text-orange-600",
      description: "Traditional encryption",
    },
  ];

  const handleInputChange = (field, value, index = null) => {
    if (field === "to" || field === "cc" || field === "bcc") {
      const newArray = [...emailData[field]];
      if (index !== null) {
        newArray[index] = value;
      } else {
        newArray.push(value);
      }
      setEmailData({ ...emailData, [field]: newArray });
    } else {
      setEmailData({ ...emailData, [field]: value });
    }
  };

  const addRecipientField = (field) => {
    setEmailData({
      ...emailData,
      [field]: [...emailData[field], ""],
    });
  };

  const removeRecipientField = (field, index) => {
    const newArray = emailData[field].filter((_, i) => i !== index);
    setEmailData({ ...emailData, [field]: newArray });
  };

  const handleFileAttachment = (event) => {
    const files = Array.from(event.target.files);

    Promise.all(
      files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              id: `att_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              filename: file.name,
              contentType: file.type,
              size: file.size,
              data: e.target.result,
            });
          };
          reader.readAsArrayBuffer(file);
        });
      })
    ).then((attachments) => {
      setEmailData({
        ...emailData,
        attachments: [...emailData.attachments, ...attachments],
      });
    });

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index) => {
    const newAttachments = emailData.attachments.filter((_, i) => i !== index);
    setEmailData({ ...emailData, attachments: newAttachments });
  };

  const validateEmail = () => {
    const errors = [];

    if (!emailData.to.some((email) => email.trim())) {
      errors.push("At least one recipient is required");
    }

    if (!emailData.subject.trim()) {
      errors.push("Subject is required");
    }

    if (!emailData.body.trim()) {
      errors.push("Email body is required");
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    [...emailData.to, ...emailData.cc, ...emailData.bcc]
      .filter((email) => email.trim())
      .forEach((email) => {
        if (!emailRegex.test(email.trim())) {
          errors.push(`Invalid email address: ${email}`);
        }
      });

    return errors;
  };

  const handleSend = async () => {
    const validationErrors = validateEmail();
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join(", "));
      return;
    }

    if (!currentEmailAccount) {
      toast.error("No email account connected");
      return;
    }

    setIsSending(true);
    setIsEncrypting(true);

    try {
      // Prepare email data
      const cleanEmailData = {
        ...emailData,
        to: emailData.to.filter((email) => email.trim()),
        cc: emailData.cc.filter((email) => email.trim()),
        bcc: emailData.bcc.filter((email) => email.trim()),
        from: currentEmailAccount.email,
      };

      // Encrypt email if needed
      let finalEmailData = cleanEmailData;

      if (selectedSecurityLevel !== SECURITY_LEVELS.NO_QUANTUM) {
        setEncryptionStatus("Encrypting with quantum security...");

        const encryptionResult = await encryptionEngine.encryptEmail(
          cleanEmailData,
          {
            securityLevel: selectedSecurityLevel,
          }
        );

        if (encryptionResult.success) {
          finalEmailData = encryptionResult.encryptedEmail;
          setEncryptionStatus("Encryption successful");
        } else {
          throw new Error(`Encryption failed: ${encryptionResult.error}`);
        }
      }

      setIsEncrypting(false);
      setEncryptionStatus("Sending email...");

      // Send email
      const sendResult = await emailService.sendEmail(
        currentEmailAccount.id,
        finalEmailData
      );

      if (sendResult.success) {
        toast.success("Email sent successfully!");

        // Add to sent folder
        const sentEmail = {
          ...finalEmailData,
          id: sendResult.messageId,
          timestamp: new Date().toISOString(),
          read: true,
        };

        addEmail(sentEmail, "sent");
        onClose();
      } else {
        throw new Error(sendResult.error);
      }
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error(`Failed to send email: ${error.message}`);
      setEncryptionStatus(null);
    } finally {
      setIsSending(false);
      setIsEncrypting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const RecipientField = ({ field, label, index, value }) => (
    <div className="flex items-center space-x-2">
      {index === 0 && (
        <label className="w-12 text-sm font-medium text-gray-700">
          {label}:
        </label>
      )}
      {index > 0 && <div className="w-12"></div>}

      <input
        type="email"
        value={value}
        onChange={(e) => handleInputChange(field, e.target.value, index)}
        placeholder="recipient@example.com"
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {emailData[field].length > 1 && (
        <button
          onClick={() => removeRecipientField(field, index)}
          className="p-1 text-gray-400 hover:text-red-600"
        >
          <Minus className="h-4 w-4" />
        </button>
      )}

      {index === emailData[field].length - 1 && (
        <button
          onClick={() => addRecipientField(field)}
          className="p-1 text-gray-400 hover:text-blue-600"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const selectedSecurity = securityLevels.find(
    (level) => level.id === selectedSecurityLevel
  );
  const SecurityIcon = selectedSecurity?.icon || Shield;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Compose Email</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Security Level Selector */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SecurityIcon
                className={`h-5 w-5 ${
                  selectedSecurity?.color || "text-gray-400"
                }`}
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Security Level:
                </span>
                <select
                  value={selectedSecurityLevel}
                  onChange={(e) => setSelectedSecurityLevel(e.target.value)}
                  className="ml-2 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {securityLevels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-gray-600">
              {selectedSecurity?.description}
            </div>
          </div>

          {/* Encryption Status */}
          {encryptionStatus && (
            <div className="mt-2 flex items-center text-sm">
              {isEncrypting ? (
                <div className="flex items-center text-blue-600">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                  {encryptionStatus}
                </div>
              ) : (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {encryptionStatus}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Recipients */}
          <div className="space-y-2">
            {emailData.to.map((email, index) => (
              <RecipientField
                key={`to-${index}`}
                field="to"
                label="To"
                index={index}
                value={email}
              />
            ))}

            {showCcBcc && (
              <>
                {emailData.cc.map((email, index) => (
                  <RecipientField
                    key={`cc-${index}`}
                    field="cc"
                    label="CC"
                    index={index}
                    value={email}
                  />
                ))}

                {emailData.bcc.map((email, index) => (
                  <RecipientField
                    key={`bcc-${index}`}
                    field="bcc"
                    label="BCC"
                    index={index}
                    value={email}
                  />
                ))}
              </>
            )}

            {!showCcBcc && (
              <button
                onClick={() => setShowCcBcc(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Add CC/BCC
              </button>
            )}
          </div>

          {/* Subject */}
          <div className="flex items-center space-x-2">
            <label className="w-12 text-sm font-medium text-gray-700">
              Subject:
            </label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              placeholder="Email subject"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Attachments */}
          {emailData.attachments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments:
              </label>
              <div className="space-y-2">
                {emailData.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center">
                      <Paperclip className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {attachment.filename}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({formatFileSize(attachment.size)})
                      </span>
                    </div>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message:
            </label>
            <textarea
              value={emailData.body}
              onChange={(e) => handleInputChange("body", e.target.value)}
              placeholder="Write your email message here..."
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileAttachment}
              multiple
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            >
              <Paperclip className="h-4 w-4 mr-1" />
              Attach
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSending}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailComposer;
