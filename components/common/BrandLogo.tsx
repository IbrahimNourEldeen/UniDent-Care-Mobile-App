import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface BrandLogoProps {
  size?: number;
  width?: number;
  height?: number;
  isDark?: boolean;
  style?: StyleProp<ImageStyle>;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 40, 
  width, 
  height, 
  isDark = false, 
  style 
}) => {
  const logoSource = isDark 
    ? require('../../assets/images/logoLight.png') // Use Light logo on Dark background
    : require('../../assets/images/logoDark.png');  // Use Dark logo on Light background

  return (
    <Image
      source={logoSource}
      style={[
        {
          width: width || size,
          height: height || size,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
};

export default BrandLogo;
