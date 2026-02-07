import ExpoModulesCore
import MLKitLanguageID

public class LanguageIdentificationModule: Module {
  public func definition() -> ModuleDefinition {
    Name("LanguageIdentificationModule")

    // Identify the language of the given text
    // Returns a language code (e.g., "en", "vi", "und" for undetermined)
    AsyncFunction("identifyLanguage") { (text: String, promise: Promise) in
      let options = LanguageIdentificationOptions(confidenceThreshold: 0.5)
      let languageId = LanguageIdentification.languageIdentification(options: options)

      languageId.identifyLanguage(for: text) { languageCode, error in
        if let error = error {
          promise.reject("LANGUAGE_ID_ERROR", error.localizedDescription)
          return
        }

        if let languageCode = languageCode, languageCode != "und" {
          promise.resolve(languageCode)
        } else {
          promise.resolve("und")
        }
      }
    }

    // Identify all possible languages with confidence scores
    AsyncFunction("identifyAllLanguages") { (text: String, promise: Promise) in
      let languageId = LanguageIdentification.languageIdentification()

      languageId.identifyPossibleLanguages(for: text) { identifiedLanguages, error in
        if let error = error {
          promise.reject("LANGUAGE_ID_ERROR", error.localizedDescription)
          return
        }

        let results = identifiedLanguages?.map { language in
          return [
            "languageCode": language.languageTag,
            "confidence": language.confidence
          ] as [String: Any]
        } ?? []

        promise.resolve(results)
      }
    }
  }
}
