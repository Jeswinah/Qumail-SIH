import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Components
import Sidebar from "./components/UI/Sidebar";
import Header from "./components/UI/Header";
import EmailComposer from "./components/Email/EmailComposer";
import EmailList from "./components/Email/EmailList";
import EmailViewer from "./components/Email/EmailViewer";
import SecurityPanel from "./components/Security/SecurityPanel";
import SettingsPanel from "./components/UI/SettingsPanel";
import ConnectionStatus from "./components/UI/ConnectionStatus";

// Services and Stores
import { useAppStore } from "./stores/appStore";
import { APP_STATES } from "./types";

const App = () => {
  const { appState, initializeApp, isKMConnected, isEmailConnected } =
    useAppStore();
  const [activeView, setActiveView] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showComposer, setShowComposer] = useState(false);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  const renderMainContent = () => {
    switch (activeView) {
      case "inbox":
      case "sent":
      case "drafts":
      case "trash":
        return (
          <div className="flex-1 flex">
            <div className="w-1/3 border-r border-gray-200">
              <EmailList
                folder={activeView}
                onEmailSelect={setSelectedEmail}
                selectedEmail={selectedEmail}
              />
            </div>
            <div className="flex-1">
              {selectedEmail ? (
                <EmailViewer email={selectedEmail} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <h3 className="text-xl font-medium mb-2">QuMail</h3>
                    <p>Quantum Secure Email Client</p>
                    <p className="text-sm mt-2">Select an email to view</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case "security":
        return <SecurityPanel />;
      case "settings":
        return <SettingsPanel />;
      default:
        return null;
    }
  };

  if (appState.status === APP_STATES.INITIALIZING) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">
            Initializing QuMail
          </h2>
          <p className="text-gray-600 mt-2">Quantum Secure Email Client</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <Header
          onCompose={() => setShowComposer(true)}
          activeView={activeView}
        />

        {/* Connection Status Bar */}
        <ConnectionStatus
          kmConnected={isKMConnected}
          emailConnected={isEmailConnected}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar activeView={activeView} onViewChange={setActiveView} />

          {/* Main Content */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {renderMainContent()}
          </main>
        </div>

        {/* Email Composer Modal */}
        {showComposer && (
          <EmailComposer
            onClose={() => setShowComposer(false)}
            replyTo={selectedEmail?.from}
            subject={
              selectedEmail?.subject ? `Re: ${selectedEmail.subject}` : ""
            }
          />
        )}

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
          }}
        />
      </div>
    </Router>
  );
};

export default App;
