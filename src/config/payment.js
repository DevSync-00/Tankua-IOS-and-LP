// Payment Gateway Configuration
// IMPORTANT: In production, these API keys should be stored securely on your backend
// and payment requests should be made through your server, not directly from the client

export const PAYMENT_CONFIG = {
  // Chapa API Configuration
  chapa: {
    // Use your Chapa secret key from https://developer.chapa.co/
    // Keep fallback to EXPO_PUBLIC_CHAPA_API_KEY for backward compatibility.
    secretKey:
      process.env.EXPO_PUBLIC_CHAPA_SECRET_KEY ||
      process.env.EXPO_PUBLIC_CHAPA_API_KEY ||
      'CHASECK_TEST_xxxxxxxxxxxxx',
    baseUrl: 'https://api.chapa.co/v1',
    // For production, use: 'https://api.chapa.co/v1'
    // For testing, use: 'https://api.chapa.co/v1' (same URL, but test keys)
  },

  // Telebirr API Configuration
  telebirr: {
    // Get your credentials from Telebirr Developer Portal
    appId: process.env.EXPO_PUBLIC_TELEBIRR_APP_ID || 'your-app-id',
    appKey: process.env.EXPO_PUBLIC_TELEBIRR_APP_KEY || 'your-app-key',
    publicKey: process.env.EXPO_PUBLIC_TELEBIRR_PUBLIC_KEY || 'your-public-key',
    baseUrl: process.env.EXPO_PUBLIC_TELEBIRR_BASE_URL || 'https://telebirr-api.com',
    // For production, use the production URL provided by Telebirr
    // For testing, use the sandbox URL
  },

  // Callback URLs (for webhook handling)
  callbacks: {
    success: 'tankua://payment/success',
    cancel: 'tankua://payment/cancel',
    // For webhooks, you'll need a backend endpoint
    webhook: process.env.EXPO_PUBLIC_WEBHOOK_URL || 'https://your-backend.com/api/payments/webhook',
  },
};

// Payment status constants
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

// Payment method types
export const PAYMENT_METHODS = {
  CHAPA: 'chapa',
  TELEBIRR: 'telebirr',
  CBE_BIRR: 'cbe',
  AMOLE: 'amole',
};

