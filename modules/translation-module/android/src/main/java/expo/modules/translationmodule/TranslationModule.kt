package expo.modules.translationmodule

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import com.google.mlkit.nl.translate.TranslateLanguage
import com.google.mlkit.nl.translate.Translation
import com.google.mlkit.nl.translate.TranslatorOptions
import com.google.mlkit.common.model.DownloadConditions

class TranslationModule : Module() {
  // Dictionary for common Vietnamese phrases that ML Kit often mistranslates (case-insensitive keys)
  private val viToEnDictionary = mapOf(
    "không thịt" to "No meat",
    "ăn chay" to "Vegetarian",
    "không hải sản" to "No seafood",
    "không gluten" to "Gluten-free",
    "không đường" to "Sugar-free",
    "không sữa" to "Dairy-free",
    "không đậu phộng" to "No peanuts",
    "không trứng" to "No eggs",
    "ít calo" to "Low calorie",
    "ít muối" to "Low sodium",
    "thuần chay" to "Vegan",
    "halal" to "Halal",
    "kosher" to "Kosher"
  )

  override fun definition() = ModuleDefinition {
    Name("TranslationModule")

    // Translate text from source language to target language
    // sourceLanguage and targetLanguage should be language codes like "en", "vi"
    AsyncFunction("translate") { text: String, sourceLanguage: String, targetLanguage: String, promise: Promise ->
      // Check dictionary first for vi->en translations
      if (sourceLanguage.lowercase() == "vi" && targetLanguage.lowercase() == "en" && text.isNotBlank()) {
        val dictResult = viToEnDictionary[text.lowercase().trim()]
        if (dictResult != null) {
          promise.resolve(dictResult)
          return@AsyncFunction
        }
      }

      val sourceLang = getTranslateLanguage(sourceLanguage)
      val targetLang = getTranslateLanguage(targetLanguage)
      
      if (sourceLang == null || targetLang == null) {
        promise.reject("INVALID_LANGUAGE", "Invalid source or target language code", null)
        return@AsyncFunction
      }

      val options = TranslatorOptions.Builder()
        .setSourceLanguage(sourceLang)
        .setTargetLanguage(targetLang)
        .build()
      
      val translator = Translation.getClient(options)
      
      // Download model if needed, then translate
      val conditions = DownloadConditions.Builder()
        .requireWifi()
        .build()
      
      translator.downloadModelIfNeeded(conditions)
        .addOnSuccessListener {
          translator.translate(text)
            .addOnSuccessListener { translatedText ->
              // Post-process: fix negation issues for vi->en
              val correctedText = if (sourceLanguage.lowercase() == "vi" && 
                                      targetLanguage.lowercase() == "en" &&
                                      text.contains("không", ignoreCase = true) &&
                                      !translatedText.contains("no ", ignoreCase = true) &&
                                      !translatedText.contains("not ", ignoreCase = true) &&
                                      !translatedText.contains("-free", ignoreCase = true) &&
                                      !translatedText.contains("without", ignoreCase = true) &&
                                      translatedText.isNotBlank()) {
                "No $translatedText"
              } else {
                translatedText
              }
              promise.resolve(correctedText)
            }
            .addOnFailureListener { e ->
              promise.reject("TRANSLATION_ERROR", e.message ?: "Failed to translate", e)
            }
        }
        .addOnFailureListener { e ->
          promise.reject("MODEL_DOWNLOAD_ERROR", e.message ?: "Failed to download translation model", e)
        }
    }

    // Download translation model for offline use
    AsyncFunction("downloadModel") { languageCode: String, promise: Promise ->
      val lang = getTranslateLanguage(languageCode)
      
      if (lang == null) {
        promise.reject("INVALID_LANGUAGE", "Invalid language code: $languageCode", null)
        return@AsyncFunction
      }

      // Create a translator with the target language to download its model
      val options = TranslatorOptions.Builder()
        .setSourceLanguage(TranslateLanguage.ENGLISH)
        .setTargetLanguage(lang)
        .build()
      
      val translator = Translation.getClient(options)
      val conditions = DownloadConditions.Builder()
        .requireWifi()
        .build()
      
      translator.downloadModelIfNeeded(conditions)
        .addOnSuccessListener {
          promise.resolve(true)
        }
        .addOnFailureListener { e ->
          promise.reject("MODEL_DOWNLOAD_ERROR", e.message ?: "Failed to download model", e)
        }
    }
  }

  private fun getTranslateLanguage(code: String): String? {
    return when (code.lowercase()) {
      "en" -> TranslateLanguage.ENGLISH
      "vi" -> TranslateLanguage.VIETNAMESE
      "zh" -> TranslateLanguage.CHINESE
      "ja" -> TranslateLanguage.JAPANESE
      "ko" -> TranslateLanguage.KOREAN
      "fr" -> TranslateLanguage.FRENCH
      "de" -> TranslateLanguage.GERMAN
      "es" -> TranslateLanguage.SPANISH
      "th" -> TranslateLanguage.THAI
      else -> null
    }
  }
}
