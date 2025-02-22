
import { pipeline } from "@huggingface/transformers";

export async function transcribeVideo(videoFile: File): Promise<any> {
  try {
    const transcriber = await pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-small",
      { chunk_length: 30, stride_length: 5 }
    );

    const audioContext = new AudioContext();
    const arrayBuffer = await videoFile.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const result = await transcriber(audioBuffer, {
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
    return result[0].label;
  } catch (error) {
    console.error("Error detecting language:", error);
    throw error;
  }
}
