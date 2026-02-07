import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './TranslationModule.types';

type TranslationModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class TranslationModule extends NativeModule<TranslationModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(TranslationModule, 'TranslationModule');
