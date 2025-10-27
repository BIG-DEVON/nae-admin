/**
 * COPY this file to: /public/runtime-config.js
 * Then set BASE_URL to your server's base URL (no trailing slash).
 *
 * Examples:
 *   "http://192.168.0.112:9000"
 *   "https://api.example.com"
 *   "http://192.168.0.112:9000/api"    // if your server expects /api prefix
 */
window.__RUNTIME_CONFIG__ = {
  BASE_URL: "http://192.168.0.112:9000",
  // If your assets (images) live elsewhere, set ASSET_BASE. Otherwise leave "" to reuse BASE_URL.
  ASSET_BASE: "",
};
