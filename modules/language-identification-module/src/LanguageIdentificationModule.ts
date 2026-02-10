import { NativeModule, requireNativeModule } from 'expo-modules-core';

export interface IdentifiedLanguage {
  languageCode: string;
  confidence: number;
}

declare class LanguageIdentificationModuleClass extends NativeModule {
  /**
   * Identify the language of the given text
   * @param text - The text to identify
   * @returns Language code (e.g., "en", "vi", "und" for undetermined)
   */
  identifyLanguage(text: string): Promise<string>;

  /**
   * Identify all possible languages with confidence scores
   * @param text - The text to identify
   * @returns Array of identified languages with confidence scores
   */
  identifyAllLanguages(text: string): Promise<IdentifiedLanguage[]>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<LanguageIdentificationModuleClass>(
  'LanguageIdentificationModule'
);
