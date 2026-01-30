import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SvgProps } from 'react-native-svg';

interface SvgIconProps {
  icon: React.FC<SvgProps>;
  style?: StyleProp<ViewStyle>;
  width?: number | string;
  height?: number | string;
  color?: string;
}

const SvgIcon = ({
  icon: Icon,
  style,
  width = 24,
  height = 24,
  color,
  ...rest
}: SvgIconProps): React.JSX.Element => {
  return (
    <Icon width={width} height={height} fill={color} style={style} {...rest} />
  );
};

export default SvgIcon;
