import React from "react";
import { Mail, Shield, Settings, Search, Plus, RefreshCw } from "lucide-react";
import { useAppStore } from "../../stores/appStore";

const Header = ({ onCompose, activeView }) => {
  const { unreadCount, securityConfig } = useAppStore();

  const getSecurityLevelColor = (level) => {
    switch (level) {
      case "quantum_secure":
        return "text-green-600 bg-green-100";
      case "quantum_aes":
        return "text-blue-600 bg-blue-100";
      case "pqc_encryption":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-orange-600 bg-orange-100";
    }
  };

  const getSecurityLevelName = (level) => {
    switch (level) {
      case "quantum_secure":
        return "Quantum Secure";
      case "quantum_aes":
        return "Quantum AES";
      case "pqc_encryption":
        return "PQC";
      default:
        return "Standard";
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      {/* Left section - Logo and app name */}
      <div className="flex items-center">
        <div className="flex items-center mr-8">
          <Shield className="h-8 w-8 text-blue-600 mr-2" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">QuMail</h1>
            <p className="text-xs text-gray-500">Quantum Secure Email</p>
          </div>
        </div>

        {/* Security Level Indicator */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${getSecurityLevelColor(
            securityConfig.level
          )}`}
        >
          🔒 {getSecurityLevelName(securityConfig.level)}
        </div>
      </div>

      {/* Center section - Search */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search emails..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center space-x-4">
        {/* Compose button */}
        <button
          onClick={onCompose}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Compose
        </button>

        {/* Refresh button */}
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <RefreshCw className="h-5 w-5" />
        </button>

        {/* Notifications */}
        {unreadCount > 0 && (
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 text-blue-600 mr-1" />
            <span className="text-blue-600 font-medium">
              {unreadCount} unread
            </span>
          </div>
        )}

        {/* Settings button */}
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
