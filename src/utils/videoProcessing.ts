
import { pipeline } from "@huggingface/transformers";
import type { TranslationOutput } from "@huggingface/transformers";

export async function transcribeVideo(videoFile: File): Promise<any> {
  try {
    const transcriber = await pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-small"
    );

    const audioContext = new AudioContext();
    const arrayBuffer = await videoFile.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Convert AudioBuffer to format expected by the model
    const audioData = {
      data: audioBuffer.getChannelData(0),
      sampling_rate: audioBuffer.sampleRate
    };

    const result = await transcriber(audioData, {
      return_timestamps: true,
    });

    return result;
  } catch (error) {
    console.error("Error transcribing video:", error);
    throw error;
  }
}

export async function detectLanguage(text: string) {
  try {
    const classifier = await pipeline(
      "text-classification",
      "Xenova/language-detection-fine-tuned-on-xlm-roberta-base",
    );

    const result = await classifier(text);
    const classification = Array.isArray(result) ? result[0] : result;
    return classification.hasOwnProperty('label') 
      ? (classification as any).label 
      : Object.keys(classification)[0];
  }
  catch (error) {
    console.error("Error detecting language:", error);
    throw error;
  }
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    const translator = await pipeline(
      "translation",
      "Xenova/nllb-200-distilled-600M"
    );

    const result = await translator(text, {
      tgt_lang: targetLanguage,
    }) as TranslationOutput[];

    return result[0].translation_text || '';
  } catch (error) {
    console.error("Error translating text:", error);
    throw error;
  }
}

export async function generateSummary(text: string): Promise<string> {
  try {
    const summarizer = await pipeline(
      "summarization",
      "Xenova/distilbart-cnn-6-6"
    );

    const result = await summarizer(text, {
      max_length: 150,
      min_length: 50,
    });

    return result[0].summary_text;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
}
