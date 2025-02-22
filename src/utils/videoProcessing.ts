
import { pipeline } from "@huggingface/transformers";
import type { AutomaticSpeechRecognitionOutput, TextGenerationConfig } from "@huggingface/transformers";

interface TranscriptionResult {
  text: string;
  chunks: Array<{
    text: string;
    timestamp: [number, number];
  }>;
}

// Define proper types for the NLLB translation
interface NLLBTranslationConfig extends TextGenerationConfig {
  src_lang: string;
  tgt_lang: string;
}

interface NLLBTranslationOutput {
  translation_text: string;
}

interface CustomSummarizationOutput {
  summary_text: string;
}

// NLLB language code mapping
const languageToNLLB: Record<string, string> = {
  'en': 'eng_Latn',
  'es': 'spa_Latn',
  'fr': 'fra_Latn',
  'de': 'deu_Latn',
  'it': 'ita_Latn',
  'pt': 'por_Latn',
  'nl': 'nld_Latn',
  'pl': 'pol_Latn',
  'ru': 'rus_Cyrl',
  'ja': 'jpn_Jpan',
  'ko': 'kor_Hang',
  'zh': 'zho_Hans',
};

export async function transcribeVideo(videoFile: File): Promise<TranscriptionResult> {
  try {
    const transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-small");
    
    const audioContext = new AudioContext();
    const arrayBuffer = await videoFile.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const result = await transcriber(audioBuffer.getChannelData(0), {
      return_timestamps: true,
      chunk_length_s: 30,
      stride_length_s: 5
    }) as AutomaticSpeechRecognitionOutput;

    return {
      text: result.text,
      chunks: result.chunks || []
    };
  } catch (error) {
    console.error("Error transcribing video:", error);
    throw error;
  }
}

export async function detectLanguage(text: string): Promise<string> {
  try {
    const classifier = await pipeline(
      "text-classification",
      "Xenova/language-detection-fine-tuned-on-xlm-roberta-base"
    );

    const result = await classifier(text);
    const classification = Array.isArray(result) ? result[0] : result;
    
    if (typeof classification === 'object' && classification !== null) {
      return (classification as any).label || 'unknown';
    }
    
    return 'unknown';
  } catch (error) {
    console.error("Error detecting language:", error);
    throw error;
  }
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!targetLanguage || !languageToNLLB[targetLanguage]) {
    throw new Error(`Unsupported target language: ${targetLanguage}`);
  }

  try {
    const translator = await pipeline(
      "translation",
      "Xenova/nllb-200-distilled-600M"
    );

    const nllbTargetLang = languageToNLLB[targetLanguage];
    console.log("Translating to:", nllbTargetLang);

    const translationConfig: TextGenerationConfig = {
      src_lang: 'eng_Latn',
      tgt_lang: nllbTargetLang,
      temperature: 1.0,
      top_k: 50,
      top_p: 0.9,
      no_repeat_ngram_size: 3,
      num_beams: 1,
      num_return_sequences: 1
    } as TextGenerationConfig;

    const result = await translator(text, translationConfig) as NLLBTranslationOutput[];
    console.log("Translation result:", result);

    if (!result || !Array.isArray(result) || !result[0]) {
      throw new Error("Translation failed - no result returned");
    }

    const translatedText = result[0].translation_text;
    if (!translatedText) {
      throw new Error("Translation failed - invalid response format");
    }

    return translatedText;
  } catch (error) {
    console.error("Error translating:", error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : "Translation failed - please try again"
    );
  }
}

export async function generateSummary(text: string): Promise<string> {
  try {
    const summarizer = await pipeline(
      "summarization",
      "Xenova/distilbart-cnn-6-6"
    );

    const summaryConfig: TextGenerationConfig = {
      temperature: 1.0,
      top_k: 50,
      top_p: 0.9,
      no_repeat_ngram_size: 3,
      num_beams: 1,
      num_return_sequences: 1
    } as TextGenerationConfig;

    const result = await summarizer(text, summaryConfig);
    const summaryResult = result as unknown as CustomSummarizationOutput[];
    return summaryResult[0].summary_text;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
}
