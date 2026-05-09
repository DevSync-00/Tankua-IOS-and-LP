import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../config/theme';

const PaperBoatIcon = ({ size = 80, color = COLORS.primary }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Paper boat body */}
        <Path
          d="M50 20 L20 70 L50 60 L80 70 Z"
          fill={color}
          stroke="#000000"
          strokeWidth="2"
        />
        {/* Paper boat sail/mast */}
        <Path
          d="M50 20 L50 60"
          stroke="#000000"
          strokeWidth="2"
        />
        {/* Paper boat detail lines */}
        <Path
          d="M35 50 L50 45 L65 50"
          stroke="#000000"
          strokeWidth="1.5"
          fill="none"
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

export default PaperBoatIcon;
