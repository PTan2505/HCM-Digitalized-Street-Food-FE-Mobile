/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Text, TextInput } from 'react-native';

export const setGlobalStyles = () => {
  const customSettings = {
    style: {
      fontFamily: 'Nunito', // Make sure this matches your 'useFonts' name
      // color: 'black', // Optional default color
    },
  };

  // --- FIX: Cast to 'any' to bypass TypeScript checks ---
  const TextAny = Text as any;
  const TextInputAny = TextInput as any;

  // 1. Patch <Text>
  // Check if 'render' exists (it might be 'defaultProps' in some RN versions)
  if (TextAny.render) {
    const originalRender = TextAny.render;
    TextAny.render = function (...args: any[]) {
      const origin = originalRender.call(this, ...args);
      return React.cloneElement(origin, {
        style: [customSettings.style, origin.props.style],
      });
    };
  } else {
    // Fallback: Use defaultProps (Deprecated but works if render is missing)
    TextAny.defaultProps = TextAny.defaultProps ?? {};
    TextAny.defaultProps.style = {
      ...customSettings.style,
      ...TextAny.defaultProps.style,
    };
  }

  // 2. Patch <TextInput>
  if (TextInputAny.render) {
    const originalRender = TextInputAny.render;
    TextInputAny.render = function (...args: any[]) {
      const origin = originalRender.call(this, ...args);
      return React.cloneElement(origin, {
        style: [customSettings.style, origin.props.style],
      });
    };
  } else {
    TextInputAny.defaultProps = TextInputAny.defaultProps ?? {};
    TextInputAny.defaultProps.style = {
      ...customSettings.style,
      ...TextInputAny.defaultProps.style,
    };
  }
};
