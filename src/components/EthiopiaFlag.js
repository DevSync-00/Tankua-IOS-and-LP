import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Path } from 'react-native-svg';

const EthiopiaFlag = ({ size = 24 }) => {
  return (
    <View style={[styles.container, { width: size * 1.5, height: size }]}>
      <Svg width={size * 1.5} height={size} viewBox="0 0 36 24">
        {/* Green stripe */}
        <Rect x="0" y="0" width="36" height="8" fill="#078930" />
        {/* Yellow stripe */}
        <Rect x="0" y="8" width="36" height="8" fill="#FCDD09" />
        {/* Red stripe */}
        <Rect x="0" y="16" width="36" height="8" fill="#DA1212" />
        {/* Blue circle with star */}
        <Circle cx="18" cy="12" r="6" fill="#0F47AF" />
        {/* Star */}
        <Path
          d="M18 8 L19.5 11.5 L23.5 12 L20.5 14.5 L21.5 18.5 L18 16.5 L14.5 18.5 L15.5 14.5 L12.5 12 L16.5 11.5 Z"
          fill="#FCDD09"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default EthiopiaFlag;
