/**
 * Environment Configuration for QuMail
 * Handles both local development and Vercel deployment
 */

const isDevelopment = import.meta.env.MODE === "development";
const isVercel =
  typeof window !== "undefined" &&
  window.location.hostname.includes("vercel.app");

export const config = {
  // API Endpoints
  KM_ENDPOINT: isDevelopment
    ? "http://localhost:8080"
    : import.meta.env.VITE_KM_ENDPOINT || window.location.origin,

  EMAIL_ENDPOINT: isDevelopment
    ? "http://localhost:8081"
    : import.meta.env.VITE_EMAIL_ENDPOINT || window.location.origin,

  // API Paths
  KM_API_PATH: isDevelopment ? "/api/v1" : "/api/km",
  EMAIL_API_PATH: isDevelopment ? "/api" : "/api/email",

  // Default Settings
  DEFAULT_SAE_ID: "qumail-client-001",
  DEFAULT_TARGET_SAE_ID: "qumail-server-001",

  // Environment flags
  IS_DEVELOPMENT: isDevelopment,
  IS_VERCEL: isVercel,
  IS_PRODUCTION: !isDevelopment,
};

export default config;
