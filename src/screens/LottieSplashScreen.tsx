import LottieView from 'lottie-react-native';
import { JSX, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import SplashScreen from '@assets/splash/splashScreen.json';

interface Props {
  onFinish?: (isCancelled: boolean) => void;
}

// memo prevents re-renders when AppSplashGate re-renders during splash
// (auth/location/branches updates). Combined with useCallback on onFinish,
// this ensures LottieView never sees a prop change that could trigger
// a premature onAnimationFinish call.
const LottieSplashScreen = memo(function LottieSplashScreen({
  onFinish,
}: Props): JSX.Element {
  return (
    <View className="flex-1 items-center justify-center">
      <LottieView
        autoPlay
        resizeMode="cover"
        loop={false}
        source={SplashScreen}
        onAnimationFinish={onFinish}
        style={styles.lottie}
      />
    </View>
  );
});

export default LottieSplashScreen;

const styles = StyleSheet.create({
  lottie: {
    width: '100%',
    height: '100%',
  },
});
