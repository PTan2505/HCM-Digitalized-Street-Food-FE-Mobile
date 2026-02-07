import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './TranslationModule.types';

type TranslationModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

class TranslationModule extends NativeModule<TranslationModuleEvents> {
  PI = Math.PI;
  setValueAsync(value: string): void {
    this.emit('onChange', { value });
  }
  hello(): string {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(TranslationModule, 'TranslationModule');
