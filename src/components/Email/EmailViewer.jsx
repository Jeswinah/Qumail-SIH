import React, { useState, useEffect } from "react";
import {
  Shield,
  Paperclip,
  Download,
  Reply,
  ReplyAll,
  Forward,
  Archive,
  Trash2,
  Lock,
  Unlock,
  Key,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useAppStore } from "../../stores/appStore";
import { encryptionEngine } from "../../services/encryptionEngine";

const EmailViewer = ({ email }) => {
  const { updateEmail } = useAppStore();
  const [decryptedEmail, setDecryptedEmail] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState(null);
  const [showRawContent, setShowRawContent] = useState(false);

  useEffect(() => {
    if (email) {
      // Mark as read if not already
      if (!email.read) {
        updateEmail(email.id, { read: true });
      }

      // Decrypt if encrypted
      if (email.encrypted) {
        decryptEmail();
      } else {
        setDecryptedEmail(email);
      }
    }
  }, [email]);

  const decryptEmail = async () => {
    setIsDecrypting(true);
    setDecryptionError(null);

    try {
      const result = await encryptionEngine.decryptEmail(email);

      if (result.success) {
        setDecryptedEmail(result.decryptedEmail);
      } else {
        setDecryptionError(result.error);
        setDecryptedEmail(email); // Show encrypted version
      }
    } catch (error) {
      setDecryptionError(error.message);
      setDecryptedEmail(email);
    } finally {
      setIsDecrypting(false);
    }
  };

  const getSecurityInfo = (securityLevel) => {
    switch (securityLevel) {
      case "quantum_secure":
        return {
          icon: Shield,
          color: "text-green-600",
          bgColor: "bg-green-50",
          name: "Quantum Secure",
          description: "One Time Pad encryption with quantum keys",
        };
      case "quantum_aes":
        return {
          icon: Key,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          name: "Quantum AES",
          description: "AES encryption with quantum key derivation",
        };
      case "pqc_encryption":
        return {
          icon: Lock,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          name: "Post-Quantum",
          description: "Post-quantum cryptography algorithms",
        };
      default:
        return {
          icon: Unlock,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          name: "Standard",
          description: "Traditional encryption methods",
        };
    }
  };

  const downloadAttachment = (attachment) => {
    try {
      let data = attachment.data;

      // Convert data to appropriate format for download
      if (
        typeof data === "string" &&
        attachment.contentType.startsWith("text/")
      ) {
        data = new Blob([data], { type: attachment.contentType });
      } else if (data instanceof ArrayBuffer) {
        data = new Blob([data], { type: attachment.contentType });
      } else {
        // For demo purposes, create a sample file
        data = new Blob([`Sample content for ${attachment.filename}`], {
          type: attachment.contentType,
        });
      }

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download attachment:", error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!email) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <h3 className="text-xl font-medium mb-2">QuMail</h3>
          <p>Select an email to view</p>
        </div>
      </div>
    );
  }

  const displayEmail = decryptedEmail || email;
  const securityInfo = getSecurityInfo(email.securityLevel);
  const SecurityIcon = securityInfo.icon;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {isDecrypting ? "Decrypting..." : displayEmail.subject}
            </h1>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{email.from}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{format(new Date(email.timestamp), "PPP p")}</span>
              </div>
            </div>

            {email.to && email.to.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">To: </span>
                {email.to.join(", ")}
              </div>
            )}

            {email.cc && email.cc.length > 0 && (
              <div className="mt-1 text-sm text-gray-600">
                <span className="font-medium">CC: </span>
                {email.cc.join(", ")}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
              <Reply className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
              <ReplyAll className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
              <Forward className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
              <Archive className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Security Information */}
        {email.encrypted && (
          <div className={`p-3 rounded-lg ${securityInfo.bgColor} border`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <SecurityIcon
                  className={`h-5 w-5 mr-2 ${securityInfo.color}`}
                />
                <div>
                  <span className={`font-medium ${securityInfo.color}`}>
                    {securityInfo.name}
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    {securityInfo.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {isDecrypting ? (
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                    Decrypting...
                  </div>
                ) : decryptionError ? (
                  <div className="flex items-center text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Decryption Failed
                  </div>
                ) : (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Decrypted
                  </div>
                )}

                {email.quantumKeyId && (
                  <span className="text-xs text-gray-500 font-mono">
                    Key: {email.quantumKeyId.substring(0, 12)}...
                  </span>
                )}
              </div>
            </div>

            {decryptionError && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <strong>Error:</strong> {decryptionError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Attachments */}
        {displayEmail.attachments && displayEmail.attachments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Paperclip className="h-4 w-4 mr-1" />
              Attachments ({displayEmail.attachments.length})
            </h3>
            <div className="space-y-2">
              {displayEmail.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <Paperclip className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {attachment.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.size)} •{" "}
                        {attachment.contentType}
                        {attachment.encrypted && (
                          <span className="ml-2 text-green-600">
                            🔒 Encrypted
                          </span>
                        )}
                        {attachment.decryptionError && (
                          <span className="ml-2 text-red-600">
                            ⚠️ Decryption failed
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadAttachment(attachment)}
                    className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    disabled={attachment.decryptionError}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Body */}
        <div className="prose max-w-none">
          {isDecrypting ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Decrypting email content...</p>
              </div>
            </div>
          ) : (
            <div>
              {/* Toggle between decrypted and raw content */}
              {email.encrypted && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowRawContent(!showRawContent)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showRawContent
                      ? "Show Decrypted Content"
                      : "Show Raw Encrypted Content"}
                  </button>
                </div>
              )}

              {showRawContent && email.encrypted ? (
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-auto">
                  <pre>{email.body}</pre>
                </div>
              ) : (
                <div
                  className="email-content"
                  dangerouslySetInnerHTML={{
                    __html:
                      displayEmail.body?.includes("<html>") ||
                      displayEmail.body?.includes("<div>")
                        ? displayEmail.body
                        : `<div style="white-space: pre-wrap; font-family: inherit;">${displayEmail.body}</div>`,
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer with metadata */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Message ID: {email.id}</div>
          {email.headers && email.headers["Message-ID"] && (
            <div>Email Message-ID: {email.headers["Message-ID"]}</div>
          )}
          {email.encrypted && email.originalEncryptionMetadata && (
            <div>
              Encryption ID: {email.originalEncryptionMetadata.encryptionId} •
              Version: {email.originalEncryptionMetadata.version}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailViewer;
