
import { pipeline } from "@huggingface/transformers";

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
      audio: audioBuffer.getChannelData(0),
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
    // Handle both single and array results
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
      src_lang: "eng_Latn",
      tgt_lang: targetLanguage,
    });

    return result[0].translation_text;
  } catch (error) {
    console.error("Error translating text:", error);
    throw error;
  }
}
