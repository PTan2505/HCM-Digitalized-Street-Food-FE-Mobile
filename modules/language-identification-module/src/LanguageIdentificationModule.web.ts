import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './LanguageIdentificationModule.types';

type LanguageIdentificationModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

class LanguageIdentificationModule extends NativeModule<LanguageIdentificationModuleEvents> {
  PI = Math.PI;
  setValueAsync(value: string): void {
    this.emit('onChange', { value });
  }
  hello(): string {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(
  LanguageIdentificationModule,
  'LanguageIdentificationModule'
);
