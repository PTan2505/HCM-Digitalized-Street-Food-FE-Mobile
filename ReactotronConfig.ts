import Reactotron, { networking } from 'reactotron-react-native';

declare global {
  interface Console {
    tron: typeof Reactotron;
  }
}

if (__DEV__) {
  Reactotron.configure({
    name: 'Lowca App',
  })
    .useReactNative()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .use(networking() as any)
    .connect();

  console.tron = Reactotron;
  console.log('Reactotron connected');
}

export default Reactotron;
