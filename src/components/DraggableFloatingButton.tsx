import RobotSplash from '@assets/splash/robotSplash.json';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectUser } from '@slices/auth';
import { navigationRef } from '@utils/navigationRef';
import LottieView from 'lottie-react-native';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const BUTTON_SIZE = 64;
const EDGE_PADDING = 16;

export const DraggableFloatingButton = (): React.JSX.Element | null => {
  const user = useAppSelector(selectUser);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const INITIAL_X = screenWidth - BUTTON_SIZE - EDGE_PADDING;
  const INITIAL_Y = 400;
  const translateX = useSharedValue(INITIAL_X);
  const translateY = useSharedValue(INITIAL_Y);
  const startX = useSharedValue(INITIAL_X);
  const startY = useSharedValue(INITIAL_Y);

  const tapGesture = Gesture.Tap()
    .maxDistance(10)
    .runOnJS(true)
    .onEnd(() => {
      navigationRef.navigate('Chatbot');
    });

  const panGesture = Gesture.Pan()
    .minDistance(1)
    .onBegin(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    })
    .onEnd(() => {
      const snapX =
        translateX.value + BUTTON_SIZE / 2 < screenWidth / 2
          ? EDGE_PADDING
          : screenWidth - BUTTON_SIZE - EDGE_PADDING;

      const clampedY = Math.max(
        EDGE_PADDING,
        Math.min(translateY.value, screenHeight - BUTTON_SIZE - EDGE_PADDING)
      );

      translateX.value = withTiming(snapX, {
        duration: 600,
        easing: Easing.out(Easing.exp),
      });
      translateY.value = withTiming(clampedY, {
        duration: 600,
        easing: Easing.out(Easing.exp),
      });
    });

  // Tap gets priority; pan only activates when the finger actually moves
  const gesture = Gesture.Simultaneous(tapGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  if (user === null) return null;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.button, animatedStyle]}>
        <LottieView source={RobotSplash} autoPlay loop style={styles.lottie} />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    overflow: 'hidden',
  },
  lottie: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
});
