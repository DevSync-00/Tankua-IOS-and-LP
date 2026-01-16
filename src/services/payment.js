import axios from 'axios';
import { PAYMENT_CONFIG, PAYMENT_STATUS } from '../config/payment';

/**
 * Generate a unique transaction reference
 */
const generateTransactionRef = (bookingId) => {
  return `TANKUA-${bookingId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
};

/**
 * Chapa Payment Integration
 * Documentation: https://developer.chapa.co/
 */
export const initiateChapaPayment = async (paymentData) => {
  try {
    // Check if API key is configured
    if (!PAYMENT_CONFIG.chapa.apiKey || PAYMENT_CONFIG.chapa.apiKey.includes('xxxxx') || PAYMENT_CONFIG.chapa.apiKey === 'CHk_test_xxxxxxxxxxxxx') {
      throw new Error('Chapa API key is not configured. Please set EXPO_PUBLIC_CHAPA_API_KEY in your environment variables.');
    }

    const { amount, currency = 'ETB', phoneNumber, bookingId, customerName, customerEmail } = paymentData;

    const transactionRef = generateTransactionRef(bookingId);

    const payload = {
      amount: amount.toString(),
      currency: currency,
      email: customerEmail || `${phoneNumber || 'customer'}@tankua.app`,
      first_name: customerName || 'Customer',
      last_name: '',
      phone_number: phoneNumber || '',
      tx_ref: transactionRef,
      callback_url: PAYMENT_CONFIG.callbacks.webhook,
      return_url: PAYMENT_CONFIG.callbacks.success,
      customization: {
        title: 'Tankua - Church Trip Booking',
        description: `Payment for booking ${bookingId}`,
      },
    };

    const response = await axios.post(
      `${PAYMENT_CONFIG.chapa.baseUrl}/transaction/initialize`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${PAYMENT_CONFIG.chapa.apiKey}`,
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
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('Invalid Chapa API key. Please check your API credentials in the configuration.');
    }
    
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || 'Invalid payment request';
      throw new Error(errorMessage);
    }

    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to process Chapa payment. Please check your API configuration.'
    );
  }
};

/**
 * Verify Chapa Payment
 */
export const verifyChapaPayment = async (transactionRef) => {
  try {
    const response = await axios.get(
      `${PAYMENT_CONFIG.chapa.baseUrl}/transaction/verify/${transactionRef}`,
      {
        headers: {
          'Authorization': `Bearer ${PAYMENT_CONFIG.chapa.apiKey}`,
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
  const chapaKey = PAYMENT_CONFIG.chapa.apiKey;
  const telebirrAppId = PAYMENT_CONFIG.telebirr.appId;
  
  return (
    !chapaKey || 
    chapaKey.includes('xxxxx') || 
    chapaKey === 'CHk_test_xxxxxxxxxxxxx' ||
    !telebirrAppId ||
    telebirrAppId === 'your-app-id'
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

