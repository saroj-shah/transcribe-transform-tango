
import { pipeline } from "@huggingface/transformers";
import type { AutomaticSpeechRecognitionOutput, GenerationConfig } from "@huggingface/transformers";

interface TranscriptionResult {
  text: string;
  chunks: Array<{
    text: string;
    timestamp: [number, number];
  }>;
}

interface CustomTranslationOutput {
  generated_text: string;
}

interface CustomSummarizationOutput {
  generated_text: string;
}

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
  try {
    const translator = await pipeline(
      "translation",
      "Xenova/nllb-200-distilled-600M"
    );

    const result = await translator(text, {
      max_new_tokens: 512,
      do_sample: false
    } as GenerationConfig) as CustomTranslationOutput[];

    return result[0].generated_text;
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
      max_new_tokens: 150,
      min_new_tokens: 50,
      do_sample: false,
      early_stopping: true
    } as GenerationConfig) as CustomSummarizationOutput[];

    return result[0].generated_text;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
}
