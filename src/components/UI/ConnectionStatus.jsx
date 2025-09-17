import React from "react";
import { CheckCircle, AlertCircle, Key, Mail, Wifi } from "lucide-react";

const ConnectionStatus = ({ kmConnected, emailConnected }) => {
  const getStatusInfo = (connected, service) => {
    if (connected) {
      return {
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        message: `${service} connected`,
      };
    }
    return {
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      message: `${service} disconnected`,
    };
  };

  const kmStatus = getStatusInfo(kmConnected, "Key Manager");
  const emailStatus = getStatusInfo(emailConnected, "Email Server");

  // Don't show status bar if everything is connected
  if (kmConnected && emailConnected) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-6">
          {/* Key Manager Status */}
          <div className="flex items-center">
            <Key className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-gray-700 mr-2">KM:</span>
            <div className="flex items-center">
              <kmStatus.icon className={`h-4 w-4 mr-1 ${kmStatus.color}`} />
              <span className={kmStatus.color}>
                {kmConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          {/* Email Server Status */}
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-gray-700 mr-2">Email:</span>
            <div className="flex items-center">
              <emailStatus.icon
                className={`h-4 w-4 mr-1 ${emailStatus.color}`}
              />
              <span className={emailStatus.color}>
                {emailConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          {!kmConnected && (
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Connect KM
            </button>
          )}
          {!emailConnected && (
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Connect Email
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;
