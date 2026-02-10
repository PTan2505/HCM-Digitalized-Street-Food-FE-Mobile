package expo.modules.languageidentificationmodule

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import com.google.mlkit.nl.languageid.LanguageIdentification
import com.google.mlkit.nl.languageid.LanguageIdentificationOptions

class LanguageIdentificationModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("LanguageIdentificationModule")

    // Identify the language of the given text
    // Returns a language code (e.g., "en", "vi", "und" for undetermined)
    AsyncFunction("identifyLanguage") { text: String, promise: Promise ->
      val options = LanguageIdentificationOptions.Builder()
        .setConfidenceThreshold(0.5f)
        .build()
      val languageIdentifier = LanguageIdentification.getClient(options)
      
      languageIdentifier.identifyLanguage(text)
        .addOnSuccessListener { languageCode ->
          promise.resolve(languageCode)
        }
        .addOnFailureListener { e ->
          promise.reject("LANGUAGE_ID_ERROR", e.message ?: "Failed to identify language", e)
        }
    }

    // Identify all possible languages with confidence scores
    AsyncFunction("identifyAllLanguages") { text: String, promise: Promise ->
      val languageIdentifier = LanguageIdentification.getClient()
      
      languageIdentifier.identifyPossibleLanguages(text)
        .addOnSuccessListener { identifiedLanguages ->
          val results = identifiedLanguages.map { language ->
            mapOf(
              "languageCode" to language.languageTag,
              "confidence" to language.confidence
            )
          }
          promise.resolve(results)
        }
        .addOnFailureListener { e ->
          promise.reject("LANGUAGE_ID_ERROR", e.message ?: "Failed to identify languages", e)
        }
    }
  }
}
