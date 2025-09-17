import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { APP_STATES, SECURITY_LEVELS } from "../types";
import { kmService } from "../services/kmService";
import { emailService } from "../services/emailService";

export const useAppStore = create()(
  devtools(
    persist(
      (set, get) => ({
        // Application State
        appState: {
          status: APP_STATES.INITIALIZING,
          currentUser: null,
          activeKM: null,
          securityLevel: SECURITY_LEVELS.QUANTUM_SECURE,
          keyCache: new Map(),
          notifications: [],
        },

        // Email Accounts
        emailAccounts: [],
        currentEmailAccount: null,

        // Key Manager Configurations
        kmConfigs: [],
        currentKMConfig: null,

        // Security Configuration
        securityConfig: {
          level: SECURITY_LEVELS.QUANTUM_SECURE,
          enableOneTimePad: true,
          enableQuantumAES: true,
          enablePQC: false,
          keyLifetime: 3600, // 1 hour
          autoKeyRotation: true,
          backupEncryption: "AES-256",
        },

        // Email Data
        emails: {
          inbox: [],
          sent: [],
          drafts: [],
          trash: [],
        },

        // UI State
        selectedEmail: null,
        showComposer: false,
        sidebarCollapsed: false,

        // Actions
        initializeApp: async () => {
          set((state) => ({
            appState: { ...state.appState, status: APP_STATES.INITIALIZING },
          }));

          try {
            // Initialize services
            await kmService.initialize();
            await emailService.initialize();

            set((state) => ({
              appState: { ...state.appState, status: APP_STATES.READY },
            }));
          } catch (error) {
            console.error("Failed to initialize app:", error);
            set((state) => ({
              appState: { ...state.appState, status: APP_STATES.ERROR },
            }));
          }
        },

        // Email Account Management
        addEmailAccount: (account) => {
          set((state) => ({
            emailAccounts: [...state.emailAccounts, account],
          }));
        },

        removeEmailAccount: (accountId) => {
          set((state) => ({
            emailAccounts: state.emailAccounts.filter(
              (acc) => acc.id !== accountId
            ),
            currentEmailAccount:
              state.currentEmailAccount?.id === accountId
                ? null
                : state.currentEmailAccount,
          }));
        },

        setCurrentEmailAccount: (account) => {
          set({ currentEmailAccount: account });
        },

        // Key Manager Management
        addKMConfig: (config) => {
          set((state) => ({
            kmConfigs: [...state.kmConfigs, config],
          }));
        },

        removeKMConfig: (configId) => {
          set((state) => ({
            kmConfigs: state.kmConfigs.filter((cfg) => cfg.id !== configId),
            currentKMConfig:
              state.currentKMConfig?.id === configId
                ? null
                : state.currentKMConfig,
          }));
        },

        setCurrentKMConfig: (config) => {
          set({ currentKMConfig: config });
        },

        // Security Configuration
        updateSecurityConfig: (config) => {
          set({ securityConfig: { ...get().securityConfig, ...config } });
        },

        setSecurityLevel: (level) => {
          set((state) => ({
            securityConfig: { ...state.securityConfig, level },
            appState: { ...state.appState, securityLevel: level },
          }));
        },

        // Email Management
        addEmail: (email, folder = "inbox") => {
          set((state) => ({
            emails: {
              ...state.emails,
              [folder]: [...state.emails[folder], email],
            },
          }));
        },

        updateEmail: (emailId, updates) => {
          set((state) => {
            const newEmails = { ...state.emails };
            Object.keys(newEmails).forEach((folder) => {
              newEmails[folder] = newEmails[folder].map((email) =>
                email.id === emailId ? { ...email, ...updates } : email
              );
            });
            return { emails: newEmails };
          });
        },

        deleteEmail: (emailId) => {
          set((state) => {
            const newEmails = { ...state.emails };
            Object.keys(newEmails).forEach((folder) => {
              newEmails[folder] = newEmails[folder].filter(
                (email) => email.id !== emailId
              );
            });
            return { emails: newEmails };
          });
        },

        moveEmail: (emailId, fromFolder, toFolder) => {
          set((state) => {
            const email = state.emails[fromFolder].find(
              (e) => e.id === emailId
            );
            if (!email) return state;

            return {
              emails: {
                ...state.emails,
                [fromFolder]: state.emails[fromFolder].filter(
                  (e) => e.id !== emailId
                ),
                [toFolder]: [...state.emails[toFolder], email],
              },
            };
          });
        },

        // Key Management
        addQuantumKey: (key) => {
          set((state) => {
            const newKeyCache = new Map(state.appState.keyCache);
            newKeyCache.set(key.key_ID, key);
            return {
              appState: { ...state.appState, keyCache: newKeyCache },
            };
          });
        },

        removeQuantumKey: (keyId) => {
          set((state) => {
            const newKeyCache = new Map(state.appState.keyCache);
            newKeyCache.delete(keyId);
            return {
              appState: { ...state.appState, keyCache: newKeyCache },
            };
          });
        },

        getQuantumKey: (keyId) => {
          return get().appState.keyCache.get(keyId);
        },

        // Notifications
        addNotification: (notification) => {
          set((state) => ({
            appState: {
              ...state.appState,
              notifications: [
                ...state.appState.notifications,
                {
                  ...notification,
                  id: Date.now().toString(),
                  timestamp: new Date(),
                },
              ],
            },
          }));
        },

        removeNotification: (notificationId) => {
          set((state) => ({
            appState: {
              ...state.appState,
              notifications: state.appState.notifications.filter(
                (n) => n.id !== notificationId
              ),
            },
          }));
        },

        clearNotifications: () => {
          set((state) => ({
            appState: { ...state.appState, notifications: [] },
          }));
        },

        // UI Actions
        setSelectedEmail: (email) => {
          set({ selectedEmail: email });
        },

        setShowComposer: (show) => {
          set({ showComposer: show });
        },

        toggleSidebar: () => {
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
        },

        // Computed values
        get isKMConnected() {
          return get().currentKMConfig?.isConnected || false;
        },

        get isEmailConnected() {
          return get().currentEmailAccount?.isConnected || false;
        },

        get unreadCount() {
          return get().emails.inbox.filter((email) => !email.read).length;
        },
      }),
      {
        name: "qumail-storage",
        partialize: (state) => ({
          emailAccounts: state.emailAccounts,
          kmConfigs: state.kmConfigs,
          securityConfig: state.securityConfig,
          currentEmailAccount: state.currentEmailAccount,
          currentKMConfig: state.currentKMConfig,
        }),
      }
    ),
    {
      name: "qumail-store",
    }
  )
);
