import React, { useState } from "react";
import { Settings, Mail, Key, Shield, Save, TestTube } from "lucide-react";
import { useAppStore } from "../../stores/appStore";
import { kmService } from "../../services/kmService";
import { emailService } from "../../services/emailService";
import { EMAIL_PROVIDERS } from "../../types";
import toast from "react-hot-toast";

const SettingsPanel = () => {
  const {
    emailAccounts,
    kmConfigs,
    addEmailAccount,
    addKMConfig,
    setCurrentEmailAccount,
    setCurrentKMConfig,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState("email");
  const [emailForm, setEmailForm] = useState({
    name: "",
    email: "",
    provider: "gmail",
    password: "",
  });
  const [kmForm, setKMForm] = useState({
    name: "",
    endpoint: "http://localhost:8080",
    saeId: "QuMail_SAE_001",
    apiKey: "",
  });

  const [testingConnection, setTestingConnection] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setTestingConnection(true);

    try {
      const provider = EMAIL_PROVIDERS[emailForm.provider.toUpperCase()];
      if (!provider) {
        throw new Error("Unknown email provider");
      }

      const accountConfig = {
        id: `email_${Date.now()}`,
        name: emailForm.name,
        email: emailForm.email,
        provider: emailForm.provider,
        imap: {
          ...provider.imap,
          username: emailForm.email,
          password: emailForm.password,
        },
        smtp: {
          ...provider.smtp,
          username: emailForm.email,
          password: emailForm.password,
        },
        isConnected: false,
      };

      const result = await emailService.configureAccount(accountConfig);

      if (result.success) {
        accountConfig.isConnected = true;
        addEmailAccount(accountConfig);
        setCurrentEmailAccount(accountConfig);

        toast.success("Email account configured successfully!");
        setEmailForm({ name: "", email: "", provider: "gmail", password: "" });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(`Failed to configure email account: ${error.message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleKMSubmit = async (e) => {
    e.preventDefault();
    setTestingConnection(true);

    try {
      const kmConfig = {
        id: `km_${Date.now()}`,
        name: kmForm.name,
        endpoint: kmForm.endpoint,
        saeId: kmForm.saeId,
        apiKey: kmForm.apiKey,
        isConnected: false,
        supportedAlgorithms: ["OTP", "AES-256", "Kyber"],
      };

      const connected = await kmService.configure(kmConfig);

      if (connected) {
        kmConfig.isConnected = true;
        addKMConfig(kmConfig);
        setCurrentKMConfig(kmConfig);

        toast.success("Key Manager configured successfully!");
        setKMForm({
          name: "",
          endpoint: "http://localhost:8080",
          saeId: "QuMail_SAE_001",
          apiKey: "",
        });
      } else {
        throw new Error("Connection test failed");
      }
    } catch (error) {
      toast.error(`Failed to configure Key Manager: ${error.message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const testKMConnection = async () => {
    if (!kmForm.endpoint) {
      toast.error("Please enter KM endpoint");
      return;
    }

    setTestingConnection(true);
    try {
      const tempConfig = {
        endpoint: kmForm.endpoint,
        saeId: kmForm.saeId,
        apiKey: kmForm.apiKey,
      };

      const connected = await kmService.configure(tempConfig);

      if (connected) {
        toast.success("Key Manager connection successful!");
      } else {
        toast.error("Key Manager connection failed");
      }
    } catch (error) {
      toast.error(`Connection test failed: ${error.message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="flex-1 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <Settings className="h-6 w-6 text-blue-600 mr-3" />
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        </div>
        <p className="text-gray-600 mt-1">
          Configure email accounts and key management
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab("email")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "email"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Email Accounts
          </button>
          <button
            onClick={() => setActiveTab("km")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "km"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Key Manager
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "email" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Email Account Configuration
              </h2>

              {/* Existing accounts */}
              {emailAccounts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Configured Accounts
                  </h3>
                  <div className="space-y-2">
                    {emailAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {account.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {account.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              account.isConnected
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {account.isConnected ? "Connected" : "Disconnected"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add new account form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={emailForm.name}
                      onChange={(e) =>
                        setEmailForm({ ...emailForm, name: e.target.value })
                      }
                      placeholder="My Email Account"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Provider
                    </label>
                    <select
                      value={emailForm.provider}
                      onChange={(e) =>
                        setEmailForm({ ...emailForm, provider: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="gmail">Gmail</option>
                      <option value="yahoo">Yahoo Mail</option>
                      <option value="outlook">Outlook</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={emailForm.email}
                      onChange={(e) =>
                        setEmailForm({ ...emailForm, email: e.target.value })
                      }
                      placeholder="your.email@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={emailForm.password}
                      onChange={(e) =>
                        setEmailForm({ ...emailForm, password: e.target.value })
                      }
                      placeholder="App password or account password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={testingConnection}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {testingConnection ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Testing...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Add Account
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "km" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Key Manager Configuration
              </h2>

              {/* Existing KM configs */}
              {kmConfigs.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Configured Key Managers
                  </h3>
                  <div className="space-y-2">
                    {kmConfigs.map((config) => (
                      <div
                        key={config.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center">
                          <Key className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {config.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {config.endpoint}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              config.isConnected
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {config.isConnected ? "Connected" : "Disconnected"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add new KM form */}
              <form onSubmit={handleKMSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Key Manager Name
                    </label>
                    <input
                      type="text"
                      value={kmForm.name}
                      onChange={(e) =>
                        setKMForm({ ...kmForm, name: e.target.value })
                      }
                      placeholder="Primary Key Manager"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SAE ID
                    </label>
                    <input
                      type="text"
                      value={kmForm.saeId}
                      onChange={(e) =>
                        setKMForm({ ...kmForm, saeId: e.target.value })
                      }
                      placeholder="QuMail_SAE_001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endpoint URL
                    </label>
                    <input
                      type="url"
                      value={kmForm.endpoint}
                      onChange={(e) =>
                        setKMForm({ ...kmForm, endpoint: e.target.value })
                      }
                      placeholder="http://localhost:8080"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key (Optional)
                    </label>
                    <input
                      type="password"
                      value={kmForm.apiKey}
                      onChange={(e) =>
                        setKMForm({ ...kmForm, apiKey: e.target.value })
                      }
                      placeholder="Enter API key if required"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={testKMConnection}
                    disabled={testingConnection}
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100"
                  >
                    {testingConnection ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    disabled={testingConnection}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Add Key Manager
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
