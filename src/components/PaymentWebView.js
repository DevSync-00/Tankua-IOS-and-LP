import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../config/theme';

/**
 * PaymentWebView - Handles in-app payment checkout
 * Supports Chapa and other web-based payment providers
 */
const PaymentWebView = ({
  visible,
  checkoutUrl,
  onSuccess,
  onCancel,
  onError,
  successUrl = 'tankua://payment/success',
  cancelUrl = 'tankua://payment/cancel',
  providerName = 'Payment',
}) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const webViewRef = useRef(null);

  // Handle navigation state changes to detect success/cancel
  const handleNavigationStateChange = (navState) => {
    const { url } = navState;
    
    // Check for success callback
    if (url.includes('payment/success') || 
        url.includes('callback') && url.includes('success') ||
        url.includes('status=success')) {
      onSuccess && onSuccess(url);
      return;
    }
    
    // Check for cancel callback
    if (url.includes('payment/cancel') || 
        url.includes('status=cancel') ||
        url.includes('status=cancelled')) {
      onCancel && onCancel();
      return;
    }
    
    // Check for failure
    if (url.includes('status=failed') || url.includes('status=error')) {
      onError && onError('Payment failed');
      return;
    }
  };

  // Handle messages from the WebView
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'PAYMENT_SUCCESS') {
        onSuccess && onSuccess(data);
      } else if (data.type === 'PAYMENT_CANCELLED') {
        onCancel && onCancel();
      } else if (data.type === 'PAYMENT_ERROR') {
        onError && onError(data.message);
      }
    } catch (e) {
      // Not a JSON message, ignore
    }
  };

  // Inject JavaScript to intercept payment completion
  const injectedJavaScript = `
    (function() {
      // Monitor for successful payment indicators
      const observer = new MutationObserver(function(mutations) {
        const successIndicators = [
          'payment successful',
          'transaction successful',
          'payment complete',
          'thank you for your payment'
        ];
        
        const bodyText = document.body.innerText.toLowerCase();
        for (const indicator of successIndicators) {
          if (bodyText.includes(indicator)) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PAYMENT_SUCCESS',
              message: 'Payment detected as successful'
            }));
            break;
          }
        }
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
      
      // Also monitor URL changes
      let lastUrl = window.location.href;
      setInterval(function() {
        if (window.location.href !== lastUrl) {
          lastUrl = window.location.href;
          if (lastUrl.includes('success')) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PAYMENT_SUCCESS',
              url: lastUrl
            }));
          }
        }
      }, 500);
    })();
    true;
  `;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onCancel}
          >
            <Ionicons name="close" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Ionicons name="lock-closed" size={16} color={COLORS.success} />
            <Text style={styles.title}>Secure {providerName} Checkout</Text>
          </View>
          
          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar */}
        {loading && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
        )}

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: checkoutUrl }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress)}
          onNavigationStateChange={handleNavigationStateChange}
          onMessage={handleMessage}
          injectedJavaScript={injectedJavaScript}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading secure checkout...</Text>
            </View>
          )}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
            onError && onError('Failed to load payment page');
          }}
        />

        {/* Footer Security Info */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
          <Text style={styles.footerText}>
            Your payment is secured with 256-bit encryption
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  placeholder: {
    width: 32,
  },
  progressContainer: {
    height: 3,
    backgroundColor: COLORS.lightGray,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
  },
});

export default PaymentWebView;


