import { NativeModule, requireNativeModule } from 'expo-modules-core';

declare class TranslationModuleClass extends NativeModule {
  /**
   * Translate text from source language to target language
   * @param text - The text to translate
   * @param sourceLanguage - Source language code (e.g., "en")
   * @param targetLanguage - Target language code (e.g., "vi")
   * @returns Translated text
   */
  translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string>;

  /**
   * Download translation model for offline use
   * @param languageCode - Language code to download model for
   * @returns True if successful
   */
  downloadModel(languageCode: string): Promise<boolean>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<TranslationModuleClass>('TranslationModule');
