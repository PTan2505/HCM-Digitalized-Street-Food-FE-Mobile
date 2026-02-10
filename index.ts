import App from '@app/App';
import { registerRootComponent } from 'expo';
import './index.css';
import './src/utils/i18n';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
