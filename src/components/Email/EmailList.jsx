import React, { useEffect, useState } from "react";
import {
  Shield,
  Paperclip,
  Star,
  Archive,
  Trash2,
  Mail,
  MailOpen,
  ChevronDown,
  Search,
} from "lucide-react";
import { useAppStore } from "../../stores/appStore";
import { emailService } from "../../services/emailService";
import { format } from "date-fns";

const EmailList = ({ folder, onEmailSelect, selectedEmail }) => {
  const { emails, currentEmailAccount, addEmail } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");

  const folderEmails = emails[folder] || [];

  useEffect(() => {
    loadEmails();
  }, [folder, currentEmailAccount]);

  const loadEmails = async () => {
    if (!currentEmailAccount) return;

    setLoading(true);
    try {
      const result = await emailService.fetchEmails(
        currentEmailAccount.id,
        folder.toUpperCase()
      );
      if (result.success) {
        result.emails.forEach((email) => {
          addEmail(email, folder);
        });
      }
    } catch (error) {
      console.error("Failed to load emails:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmails = folderEmails
    .filter((email) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        email.subject.toLowerCase().includes(query) ||
        email.from.toLowerCase().includes(query) ||
        email.body.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (sortBy === "timestamp") {
        const aTime = new Date(aValue).getTime();
        const bTime = new Date(bValue).getTime();
        return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
      }

      if (sortOrder === "desc") {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

  const getSecurityIcon = (securityLevel) => {
    switch (securityLevel) {
      case "quantum_secure":
        return (
          <Shield className="h-4 w-4 text-green-600" title="Quantum Secure" />
        );
      case "quantum_aes":
        return <Shield className="h-4 w-4 text-blue-600" title="Quantum AES" />;
      case "pqc_encryption":
        return (
          <Shield className="h-4 w-4 text-purple-600" title="Post-Quantum" />
        );
      default:
        return <Shield className="h-4 w-4 text-gray-400" title="Standard" />;
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, "HH:mm");
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return format(date, "MMM dd");
    }
  };

  const EmailItem = ({ email, isSelected, onClick }) => (
    <div
      onClick={() => onClick(email)}
      className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? "bg-blue-50 border-blue-200" : ""
      } ${!email.read ? "bg-blue-25" : ""}`}
    >
      <div className="flex items-start space-x-3">
        {/* Read/Unread indicator */}
        <div className="flex-shrink-0 mt-1">
          {email.read ? (
            <MailOpen className="h-4 w-4 text-gray-400" />
          ) : (
            <Mail className="h-4 w-4 text-blue-600" />
          )}
        </div>

        {/* Email content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p
              className={`text-sm truncate ${
                !email.read
                  ? "font-semibold text-gray-900"
                  : "font-medium text-gray-700"
              }`}
            >
              {email.from}
            </p>
            <div className="flex items-center space-x-2">
              {email.encrypted && getSecurityIcon(email.securityLevel)}
              {email.attachments && email.attachments.length > 0 && (
                <Paperclip className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-xs text-gray-500">
                {formatDate(email.timestamp)}
              </span>
            </div>
          </div>

          <p
            className={`text-sm mb-1 truncate ${
              !email.read ? "font-medium text-gray-900" : "text-gray-700"
            }`}
          >
            {email.subject}
          </p>

          <p className="text-xs text-gray-500 truncate">
            {email.body.replace(/<[^>]*>/g, "").substring(0, 100)}...
          </p>

          {/* Security and encryption info */}
          {email.encrypted && (
            <div className="flex items-center mt-2 space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                🔒 Encrypted
              </span>
              {email.quantumKeyId && (
                <span className="text-xs text-gray-500">
                  Key: {email.quantumKeyId.substring(0, 8)}...
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const folderNames = {
    inbox: "Inbox",
    sent: "Sent",
    drafts: "Drafts",
    trash: "Trash",
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {folderNames[folder] || folder}
          </h2>
          <span className="text-sm text-gray-500">
            {filteredEmails.length} emails
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Sort options */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="timestamp">Date</option>
              <option value="from">Sender</option>
              <option value="subject">Subject</option>
            </select>
            <button
              onClick={() =>
                setSortOrder(sortOrder === "desc" ? "asc" : "desc")
              }
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {sortOrder === "desc" ? "↓" : "↑"}
            </button>
          </div>

          <button
            onClick={loadEmails}
            disabled={loading}
            className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-y-auto">
        {loading && folderEmails.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-gray-500">Loading emails...</div>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Mail className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? "No emails found"
                  : `No emails in ${folderNames[folder]}`}
              </p>
            </div>
          </div>
        ) : (
          <div>
            {filteredEmails.map((email) => (
              <EmailItem
                key={email.id}
                email={email}
                isSelected={selectedEmail?.id === email.id}
                onClick={onEmailSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with email count */}
      {filteredEmails.length > 0 && (
        <div className="border-t border-gray-200 p-2 text-center">
          <span className="text-xs text-gray-500">
            {filteredEmails.length} of {folderEmails.length} emails
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
        </div>
      )}
    </div>
  );
};

export default EmailList;
