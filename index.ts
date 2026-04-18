import { registerRootComponent } from 'expo';
import './index.css';
import './ReactotronConfig';
import './src/utils/i18n';
import CustomerApp from './src/apps/customer/App';
import ManagerApp from './src/apps/manager/App';
import { isManagerApp } from './src/utils/appVariant';

const App = isManagerApp ? ManagerApp : CustomerApp;

registerRootComponent(App);
