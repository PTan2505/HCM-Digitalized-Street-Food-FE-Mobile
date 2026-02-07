import ExpoModulesCore
import MLKitTranslate

public class TranslationModule: Module {
  public func definition() -> ModuleDefinition {
    Name("TranslationModule")

    // Translate text from source language to target language
    // sourceLanguage and targetLanguage should be language codes like "en", "vi"
    AsyncFunction("translate") { (text: String, sourceLanguage: String, targetLanguage: String, promise: Promise) in
      guard let sourceLang = self.getTranslateLanguage(code: sourceLanguage),
            let targetLang = self.getTranslateLanguage(code: targetLanguage) else {
        promise.reject("INVALID_LANGUAGE", "Invalid source or target language code")
        return
      }

      let options = TranslatorOptions(sourceLanguage: sourceLang, targetLanguage: targetLang)
      let translator = Translator.translator(options: options)

      // Download model if needed, then translate
      let conditions = ModelDownloadConditions(
        allowsCellularAccess: false,
        allowsBackgroundDownloading: true
      )

      translator.downloadModelIfNeeded(with: conditions) { error in
        if let error = error {
          promise.reject("MODEL_DOWNLOAD_ERROR", error.localizedDescription)
          return
        }

        translator.translate(text) { translatedText, error in
          if let error = error {
            promise.reject("TRANSLATION_ERROR", error.localizedDescription)
            return
          }

          promise.resolve(translatedText)
        }
      }
    }

    // Download translation model for offline use
    AsyncFunction("downloadModel") { (languageCode: String, promise: Promise) in
      guard let lang = self.getTranslateLanguage(code: languageCode) else {
        promise.reject("INVALID_LANGUAGE", "Invalid language code: \(languageCode)")
        return
      }

      let options = TranslatorOptions(sourceLanguage: .english, targetLanguage: lang)
      let translator = Translator.translator(options: options)

      let conditions = ModelDownloadConditions(
        allowsCellularAccess: false,
        allowsBackgroundDownloading: true
      )

      translator.downloadModelIfNeeded(with: conditions) { error in
        if let error = error {
          promise.reject("MODEL_DOWNLOAD_ERROR", error.localizedDescription)
          return
        }
        promise.resolve(true)
      }
    }
  }

  private func getTranslateLanguage(code: String) -> TranslateLanguage? {
    switch code.lowercased() {
    case "en": return .english
    case "vi": return .vietnamese
    case "zh": return .chinese
    case "ja": return .japanese
    case "ko": return .korean
    case "fr": return .french
    case "de": return .german
    case "es": return .spanish
    case "th": return .thai
    default: return nil
    }
  }
}
