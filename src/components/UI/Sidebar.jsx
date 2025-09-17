import React from "react";
import {
  Inbox,
  Send,
  FileText,
  Trash2,
  Shield,
  Settings,
  Key,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAppStore } from "../../stores/appStore";

const Sidebar = ({ activeView, onViewChange }) => {
  const { emails, isKMConnected, isEmailConnected, currentEmailAccount } =
    useAppStore();

  const mainFolders = [
    {
      id: "inbox",
      name: "Inbox",
      icon: Inbox,
      count: emails.inbox?.filter((email) => !email.read).length || 0,
    },
    {
      id: "sent",
      name: "Sent",
      icon: Send,
      count: 0,
    },
    {
      id: "drafts",
      name: "Drafts",
      icon: FileText,
      count: emails.drafts?.length || 0,
    },
    {
      id: "trash",
      name: "Trash",
      icon: Trash2,
      count: emails.trash?.length || 0,
    },
  ];

  const securityOptions = [
    {
      id: "security",
      name: "Security Panel",
      icon: Shield,
    },
  ];

  const settingsOptions = [
    {
      id: "settings",
      name: "Settings",
      icon: Settings,
    },
  ];

  const SidebarItem = ({ item, isActive, onClick, showCount = false }) => {
    const IconComponent = item.icon;

    return (
      <button
        onClick={() => onClick(item.id)}
        className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-colors ${
          isActive
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <div className="flex items-center">
          <IconComponent className="h-4 w-4 mr-3" />
          <span className="text-sm font-medium">{item.name}</span>
        </div>
        {showCount && item.count > 0 && (
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            {item.count}
          </span>
        )}
      </button>
    );
  };

  const ConnectionStatus = ({ connected, label, icon: Icon }) => (
    <div
      className={`flex items-center text-xs px-3 py-2 rounded ${
        connected ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
      }`}
    >
      <Icon className="h-3 w-3 mr-2" />
      <span>
        {label}: {connected ? "Connected" : "Disconnected"}
      </span>
    </div>
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Account info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {currentEmailAccount?.name?.[0] || "U"}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {currentEmailAccount?.name || "No Account"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {currentEmailAccount?.email || "Not connected"}
            </p>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="p-4 space-y-2 border-b border-gray-200">
        <ConnectionStatus
          connected={isKMConnected}
          label="Key Manager"
          icon={isKMConnected ? Key : Key}
        />
        <ConnectionStatus
          connected={isEmailConnected}
          label="Email Server"
          icon={isEmailConnected ? Wifi : WifiOff}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {/* Mail folders */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Mail
          </h3>
          <div className="space-y-1">
            {mainFolders.map((folder) => (
              <SidebarItem
                key={folder.id}
                item={folder}
                isActive={activeView === folder.id}
                onClick={onViewChange}
                showCount={true}
              />
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Security
          </h3>
          <div className="space-y-1">
            {securityOptions.map((option) => (
              <SidebarItem
                key={option.id}
                item={option}
                isActive={activeView === option.id}
                onClick={onViewChange}
              />
            ))}
          </div>
        </div>

        {/* Settings */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Application
          </h3>
          <div className="space-y-1">
            {settingsOptions.map((option) => (
              <SidebarItem
                key={option.id}
                item={option}
                isActive={activeView === option.id}
                onClick={onViewChange}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>QuMail v1.0</p>
          <p>Quantum Secure Email Client</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
