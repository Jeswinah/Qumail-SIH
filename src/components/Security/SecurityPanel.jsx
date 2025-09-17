import React, { useState, useEffect } from "react";
import {
  Shield,
  Key,
  Lock,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import { useAppStore } from "../../stores/appStore";
import { securityService } from "../../services/securityService";
import { SECURITY_LEVELS } from "../../types";

const SecurityPanel = () => {
  const { securityConfig, updateSecurityConfig, setSecurityLevel } =
    useAppStore();
  const [activeTab, setActiveTab] = useState("levels");
  const [testResults, setTestResults] = useState(null);
  const [isTestingEncryption, setIsTestingEncryption] = useState(false);

  useEffect(() => {
    securityService.initialize();
  }, []);

  const securityLevels = [
    {
      id: SECURITY_LEVELS.QUANTUM_SECURE,
      name: "Quantum Secure",
      description: "One Time Pad with quantum keys - Perfect security",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      features: [
        "Perfect security",
        "Quantum key distribution",
        "One-time pad encryption",
        "Information-theoretic security",
      ],
    },
    {
      id: SECURITY_LEVELS.QUANTUM_AES,
      name: "Quantum-aided AES",
      description: "AES encryption with quantum key derivation",
      icon: Key,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      features: [
        "Quantum key seeding",
        "AES-256-GCM encryption",
        "High performance",
        "Quantum resistance",
      ],
    },
    {
      id: SECURITY_LEVELS.PQC_ENCRYPTION,
      name: "Post-Quantum Cryptography",
      description: "Quantum-resistant algorithms",
      icon: Lock,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      features: [
        "Kyber key encapsulation",
        "Dilithium signatures",
        "Future-proof security",
        "Mathematical hardness",
      ],
    },
    {
      id: SECURITY_LEVELS.NO_QUANTUM,
      name: "Standard Encryption",
      description: "Traditional RSA and AES encryption",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      features: [
        "RSA-2048 encryption",
        "AES-256 symmetric",
        "High performance",
        "Wide compatibility",
      ],
    },
  ];

  const handleSecurityLevelChange = (level) => {
    setSecurityLevel(level);
    securityService.setSecurityLevel(level);
  };

  const handleConfigUpdate = (key, value) => {
    updateSecurityConfig({ [key]: value });
  };

  const testEncryption = async () => {
    setIsTestingEncryption(true);
    setTestResults(null);

    try {
      const testData =
        "This is a test message for QuMail encryption verification.";
      const startTime = Date.now();

      // Test encryption
      const encrypted = await securityService.encryptData(testData);
      const encryptTime = Date.now() - startTime;

      // Test decryption
      const decryptStartTime = Date.now();
      const decrypted = await securityService.decryptData(encrypted);
      const decryptTime = Date.now() - decryptStartTime;

      const isValid = decrypted.data === testData;

      setTestResults({
        success: isValid,
        encryptTime,
        decryptTime,
        algorithm: encrypted.algorithm,
        keySize: encrypted.keySize,
        securityLevel: encrypted.securityLevel,
        details: {
          originalSize: testData.length,
          encryptedSize: encrypted.encryptedData.length,
          quantumKeyId: encrypted.quantumKeyId,
          timestamp: encrypted.timestamp,
        },
      });
    } catch (error) {
      setTestResults({
        success: false,
        error: error.message,
      });
    } finally {
      setIsTestingEncryption(false);
    }
  };

  const SecurityLevelCard = ({ level, isActive, onSelect }) => {
    const IconComponent = level.icon;

    return (
      <div
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
          isActive
            ? `${level.borderColor} ${level.bgColor}`
            : "border-gray-200 bg-white hover:bg-gray-50"
        }`}
        onClick={() => onSelect(level.id)}
      >
        <div className="flex items-center mb-3">
          <IconComponent
            className={`h-6 w-6 mr-3 ${
              isActive ? level.color : "text-gray-400"
            }`}
          />
          <h3
            className={`font-semibold ${
              isActive ? level.color : "text-gray-900"
            }`}
          >
            {level.name}
          </h3>
          {isActive && (
            <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
          )}
        </div>

        <p className="text-gray-600 text-sm mb-3">{level.description}</p>

        <div className="space-y-1">
          {level.features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center text-xs text-gray-500"
            >
              <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
              {feature}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <Shield className="h-6 w-6 text-blue-600 mr-3" />
          <h1 className="text-xl font-semibold text-gray-900">
            Security Configuration
          </h1>
        </div>
        <p className="text-gray-600 mt-1">
          Configure multi-level quantum security for QuMail
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab("levels")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "levels"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Security Levels
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "settings"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Advanced Settings
          </button>
          <button
            onClick={() => setActiveTab("testing")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "testing"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Testing & Validation
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "levels" && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Choose Security Level
              </h2>
              <p className="text-gray-600">
                Select the appropriate security level based on your
                requirements. Higher levels provide better security but may
                impact performance.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {securityLevels.map((level) => (
                <SecurityLevelCard
                  key={level.id}
                  level={level}
                  isActive={securityConfig.level === level.id}
                  onSelect={handleSecurityLevelChange}
                />
              ))}
            </div>

            {/* Current Security Info */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center mb-2">
                <Info className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-medium text-blue-900">
                  Current Security Configuration
                </h3>
              </div>
              <div className="text-sm text-blue-800">
                <p>
                  <strong>Active Level:</strong>{" "}
                  {
                    securityLevels.find((l) => l.id === securityConfig.level)
                      ?.name
                  }
                </p>
                <p>
                  <strong>Key Lifetime:</strong> {securityConfig.keyLifetime}{" "}
                  seconds
                </p>
                <p>
                  <strong>Auto Key Rotation:</strong>{" "}
                  {securityConfig.autoKeyRotation ? "Enabled" : "Disabled"}
                </p>
                <p>
                  <strong>Backup Encryption:</strong>{" "}
                  {securityConfig.backupEncryption}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Advanced Security Settings
              </h2>
            </div>

            {/* Key Management Settings */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Key Management</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Lifetime (seconds)
                  </label>
                  <input
                    type="number"
                    value={securityConfig.keyLifetime}
                    onChange={(e) =>
                      handleConfigUpdate(
                        "keyLifetime",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="60"
                    max="86400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Encryption
                  </label>
                  <select
                    value={securityConfig.backupEncryption}
                    onChange={(e) =>
                      handleConfigUpdate("backupEncryption", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AES-256">AES-256</option>
                    <option value="AES-192">AES-192</option>
                    <option value="ChaCha20">ChaCha20</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={securityConfig.autoKeyRotation}
                    onChange={(e) =>
                      handleConfigUpdate("autoKeyRotation", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Enable automatic key rotation
                  </span>
                </label>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">
                Security Features
              </h3>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={securityConfig.enableOneTimePad}
                    onChange={(e) =>
                      handleConfigUpdate("enableOneTimePad", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Enable One Time Pad encryption
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={securityConfig.enableQuantumAES}
                    onChange={(e) =>
                      handleConfigUpdate("enableQuantumAES", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Enable Quantum-aided AES
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={securityConfig.enablePQC}
                    onChange={(e) =>
                      handleConfigUpdate("enablePQC", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Enable Post-Quantum Cryptography
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "testing" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Encryption Testing & Validation
              </h2>
              <p className="text-gray-600">
                Test the current security configuration to ensure proper
                encryption and decryption functionality.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Encryption Test</h3>
                <button
                  onClick={testEncryption}
                  disabled={isTestingEncryption}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isTestingEncryption ? "Testing..." : "Run Test"}
                </button>
              </div>

              {testResults && (
                <div
                  className={`p-4 rounded-md ${
                    testResults.success
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-center mb-2">
                    {testResults.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <h4
                      className={`font-medium ${
                        testResults.success ? "text-green-900" : "text-red-900"
                      }`}
                    >
                      Test {testResults.success ? "Passed" : "Failed"}
                    </h4>
                  </div>

                  {testResults.success ? (
                    <div className="text-sm text-green-800 space-y-1">
                      <p>
                        <strong>Algorithm:</strong> {testResults.algorithm}
                      </p>
                      <p>
                        <strong>Security Level:</strong>{" "}
                        {testResults.securityLevel}
                      </p>
                      <p>
                        <strong>Key Size:</strong> {testResults.keySize} bits
                      </p>
                      <p>
                        <strong>Encryption Time:</strong>{" "}
                        {testResults.encryptTime}ms
                      </p>
                      <p>
                        <strong>Decryption Time:</strong>{" "}
                        {testResults.decryptTime}ms
                      </p>
                      {testResults.details.quantumKeyId && (
                        <p>
                          <strong>Quantum Key ID:</strong>{" "}
                          {testResults.details.quantumKeyId}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-red-800">
                      <strong>Error:</strong> {testResults.error}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityPanel;
