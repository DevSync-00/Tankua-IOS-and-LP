import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../config/theme';

const WavyShape = ({ position = 'top', color = COLORS.primary }) => {
  // Top wavy shape path
  const topPath = "M0,60 Q150,20 300,40 T600,50 L600,0 L0,0 Z";
  
  // Bottom wavy shape path
  const bottomPath = "M0,0 Q150,40 300,20 T600,10 L600,60 L0,60 Z";

  return (
    <View style={[styles.container, position === 'top' ? styles.top : styles.bottom]}>
      <Svg height="60" width="100%" viewBox="0 0 600 60" preserveAspectRatio="none">
        <Path
          d={position === 'top' ? topPath : bottomPath}
          fill={color}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 0,
  },
  top: {
    top: 0,
  },
  bottom: {
    bottom: 0,
  },
});

export default WavyShape;
