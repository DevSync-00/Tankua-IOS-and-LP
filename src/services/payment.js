import axios from 'axios';
import { PAYMENT_CONFIG, PAYMENT_STATUS } from '../config/payment';

const isHttpUrl = (value) => {
  if (!value || typeof value !== 'string') return false;
  return /^https?:\/\//i.test(value.trim());
};

const extractGatewayErrorMessage = (error, fallback = 'Payment request failed') => {
  const responseData = error?.response?.data;
  const message = responseData?.message;

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  if (message && typeof message === 'object') {
    if (typeof message.error === 'string' && message.error.trim()) {
      return message.error;
    }
    if (typeof message.detail === 'string' && message.detail.trim()) {
      return message.detail;
    }
  }

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    const firstError = responseData.errors[0];
    if (typeof firstError === 'string') return firstError;
    if (typeof firstError?.message === 'string') return firstError.message;
  }

  if (typeof responseData?.error === 'string' && responseData.error.trim()) {
    return responseData.error;
  }

  if (responseData && typeof responseData === 'object') {
    try {
      const serialized = JSON.stringify(responseData);
      if (serialized && serialized !== '{}') {
        return serialized;
      }
    } catch (serializationError) {
      // Ignore serialization issues and keep falling back.
    }
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

/**
 * Generate a unique transaction reference
 */
const generateTransactionRef = (bookingId) => {
  const bookingPart = String(bookingId || 'BK')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(-8)
    .toUpperCase();
  const timePart = Date.now().toString().slice(-8);
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();

  // Chapa max tx_ref length is 50 characters.
  return `TNK-${timePart}-${bookingPart}-${randomPart}`.slice(0, 50);
};

/**
 * Chapa Payment Integration
 * Documentation: https://developer.chapa.co/
 */
export const initiateChapaPayment = async (paymentData) => {
  try {
    // Check if secret key is configured
    const chapaKey = PAYMENT_CONFIG.chapa.secretKey;
    if (!chapaKey || chapaKey.includes('xxxxx') || chapaKey === 'CHk_test_xxxxxxxxxxxxx' || chapaKey === 'CHASECK_TEST_xxxxxxxxxxxxx') {
      throw new Error('Chapa secret key is not configured. Please set EXPO_PUBLIC_CHAPA_SECRET_KEY in your environment variables.');
    }
    if (chapaKey.startsWith('CHAPUBK-')) {
      throw new Error('Chapa public key detected. Use your Chapa secret key (usually starts with CHASECK_) in EXPO_PUBLIC_CHAPA_SECRET_KEY.');
    }

    const { amount, currency = 'ETB', phoneNumber, bookingId, customerName, customerEmail } = paymentData;

    const transactionRef = generateTransactionRef(bookingId);

    const payload = {
      amount: amount.toString(),
      currency: currency,
      email: customerEmail || `${phoneNumber || 'customer'}@tankua.app`,
      first_name: customerName || 'Customer',
      last_name: 'User',
      phone_number: phoneNumber || '',
      tx_ref: transactionRef,
      customization: {
        // Chapa constraints: title <= 16 chars, description <= 50 chars.
        title: 'Tankua Booking',
        description: `Booking ${String(bookingId || '').slice(0, 40)}`.slice(0, 50),
      },
    };

    // Chapa requires valid HTTP(S) callback/return URLs.
    // We provide safe fallbacks when deep links are configured.
    const callbackUrl = isHttpUrl(PAYMENT_CONFIG.callbacks.webhook)
      ? PAYMENT_CONFIG.callbacks.webhook.trim()
      : 'https://example.com/chapa/callback';
    const returnUrl = isHttpUrl(PAYMENT_CONFIG.callbacks.success)
      ? PAYMENT_CONFIG.callbacks.success.trim()
      : callbackUrl;

    payload.callback_url = callbackUrl;
    payload.return_url = returnUrl;

    const response = await axios.post(
      `${PAYMENT_CONFIG.chapa.baseUrl}/transaction/initialize`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${chapaKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status === 'success' && response.data.data) {
      return {
        success: true,
        transactionRef,
        checkoutUrl: response.data.data.checkout_url,
        paymentId: response.data.data.id,
      };
    }

    throw new Error(response.data.message || 'Failed to initialize Chapa payment');
  } catch (error) {
    console.error('Chapa payment error:', error);
    if (error?.response?.data) {
      console.error('Chapa payment error response body:', error.response.data);
    }
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('Chapa authentication failed. Use a valid Chapa secret key (not CHAPUBK public key) in EXPO_PUBLIC_CHAPA_SECRET_KEY.');
    }
    
    if (error.response?.status === 400) {
      const errorMessage = extractGatewayErrorMessage(error, 'Invalid payment request');
      throw new Error(errorMessage);
    }

    throw new Error(extractGatewayErrorMessage(
      error,
      'Failed to process Chapa payment. Please check your API configuration.'
    ));
  }
};

/**
 * Verify Chapa Payment
 */
export const verifyChapaPayment = async (transactionRef) => {
  try {
    const chapaKey = PAYMENT_CONFIG.chapa.secretKey;
    const response = await axios.get(
      `${PAYMENT_CONFIG.chapa.baseUrl}/transaction/verify/${transactionRef}`,
      {
        headers: {
          'Authorization': `Bearer ${chapaKey}`,
        },
      }
    );

    if (response.data.status === 'success') {
      return {
        success: true,
        verified: response.data.data.status === 'successful',
        paymentData: response.data.data,
      };
    }

    return {
      success: false,
      verified: false,
      message: response.data.message,
    };
  } catch (error) {
    console.error('Chapa verification error:', error);
    throw new Error('Failed to verify Chapa payment');
  }
};

/**
 * Telebirr Payment Integration
 * Note: Telebirr API structure may vary - adjust based on official documentation
 */
export const initiateTelebirrPayment = async (paymentData) => {
  try {
    // Check if API credentials are configured
    if (!PAYMENT_CONFIG.telebirr.appId || 
        PAYMENT_CONFIG.telebirr.appId === 'your-app-id' ||
        !PAYMENT_CONFIG.telebirr.appKey ||
        PAYMENT_CONFIG.telebirr.appKey === 'your-app-key') {
      throw new Error('Telebirr API credentials are not configured. Please set EXPO_PUBLIC_TELEBIRR_APP_ID and EXPO_PUBLIC_TELEBIRR_APP_KEY in your environment variables.');
    }

    const { amount, phoneNumber, bookingId, customerName } = paymentData;

    const transactionRef = generateTransactionRef(bookingId);

    // Telebirr typically requires:
    // 1. Create order/transaction
    // 2. Get payment URL or initiate payment
    // 3. User completes payment via Telebirr app
    // 4. Verify payment status

    const payload = {
      appId: PAYMENT_CONFIG.telebirr.appId,
      appKey: PAYMENT_CONFIG.telebirr.appKey,
      subject: `Tankua Booking ${bookingId}`,
      totalAmount: amount.toString(),
      outTradeNo: transactionRef,
      notifyUrl: PAYMENT_CONFIG.callbacks.webhook,
      returnUrl: PAYMENT_CONFIG.callbacks.success,
      timeoutExpress: '30m',
      shortCode: phoneNumber, // User's phone number for Telebirr
      receiveName: customerName || 'Tankua',
    };

    // Note: This is a generic structure - adjust based on Telebirr's actual API
    const response = await axios.post(
      `${PAYMENT_CONFIG.telebirr.baseUrl}/api/payment/create`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          // Telebirr may require additional headers like signature, timestamp, etc.
        },
      }
    );

    if (response.data.success || response.data.code === '0000') {
      return {
        success: true,
        transactionRef,
        paymentUrl: response.data.paymentUrl || response.data.data?.paymentUrl,
        paymentId: response.data.paymentId || response.data.data?.paymentId,
        qrCode: response.data.qrCode || response.data.data?.qrCode, // If Telebirr provides QR
      };
    }

    throw new Error(response.data.message || 'Failed to initialize Telebirr payment');
  } catch (error) {
    console.error('Telebirr payment error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('Invalid Telebirr API credentials. Please check your API keys in the configuration.');
    }
    
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || 'Invalid payment request';
      throw new Error(errorMessage);
    }

    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to process Telebirr payment. Please check your API configuration.'
    );
  }
};

/**
 * Verify Telebirr Payment
 */
export const verifyTelebirrPayment = async (transactionRef) => {
  try {
    const payload = {
      appId: PAYMENT_CONFIG.telebirr.appId,
      appKey: PAYMENT_CONFIG.telebirr.appKey,
      outTradeNo: transactionRef,
    };

    const response = await axios.post(
      `${PAYMENT_CONFIG.telebirr.baseUrl}/api/payment/query`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success || response.data.code === '0000') {
      const paymentData = response.data.data || response.data;
      return {
        success: true,
        verified: paymentData.status === 'SUCCESS' || paymentData.tradeStatus === 'SUCCESS',
        paymentData,
      };
    }

    return {
      success: false,
      verified: false,
      message: response.data.message,
    };
  } catch (error) {
    console.error('Telebirr verification error:', error);
    throw new Error('Failed to verify Telebirr payment');
  }
};

/**
 * Development mode payment simulation (for testing without API keys)
 */
const simulatePayment = async (paymentMethod, paymentData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    success: true,
    transactionRef: `DEV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
    checkoutUrl: null,
    paymentId: `dev-payment-${Date.now()}`,
    isDevelopment: true,
  };
};

/**
 * Check if we're in development mode (no API keys configured)
 */
const isDevelopmentMode = () => {
  const chapaKey = PAYMENT_CONFIG.chapa.secretKey;
  
  return (
    !chapaKey || 
    chapaKey.includes('xxxxx') || 
    chapaKey === 'CHk_test_xxxxxxxxxxxxx'
  );
};

/**
 * Process payment based on selected method
 */
export const processPayment = async (paymentMethod, paymentData) => {
  // If in development mode, simulate payment
  // Check if we're in development (__DEV__ is available in React Native/Expo)
  const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';
  
  if (isDevelopmentMode() && isDev) {
    console.warn('⚠️ Development mode: Simulating payment (no real API keys configured)');
    return await simulatePayment(paymentMethod, paymentData);
  }

  switch (paymentMethod) {
    case 'chapa':
      return await initiateChapaPayment(paymentData);
    case 'telebirr':
      return await initiateTelebirrPayment(paymentData);
    case 'cbe':
      // CBE Birr integration - similar structure
      throw new Error('CBE Birr integration not yet implemented');
    case 'amole':
      // Amole integration - similar structure
      throw new Error('Amole integration not yet implemented');
    default:
      throw new Error(`Unsupported payment method: ${paymentMethod}`);
  }
};

/**
 * Verify payment based on method
 */
export const verifyPayment = async (paymentMethod, transactionRef) => {
  switch (paymentMethod) {
    case 'chapa':
      return await verifyChapaPayment(transactionRef);
    case 'telebirr':
      return await verifyTelebirrPayment(transactionRef);
    default:
      throw new Error(`Unsupported payment method: ${paymentMethod}`);
  }
};

