import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import VideoUpload from "@/components/VideoUpload";
import LanguageSelector from "@/components/LanguageSelector";
import VideoPlayer from "@/components/VideoPlayer";
import TranscriptDisplay from "@/components/TranscriptDisplay";
import QASection from "@/components/QASection";
import { transcribeVideo, detectLanguage, translateText, generateSummary } from "@/utils/videoProcessing";
import type { TranscriptSegment } from "@/components/TranscriptDisplay";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [video, setVideo] = useState<File | string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [voiceLanguage, setVoiceLanguage] = useState("");
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [translatedTranscript, setTranslatedTranscript] = useState<TranscriptSegment[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [videoId, setVideoId] = useState<string>("");

  const handleVideoSelect = async (file: File | string) => {
    setVideo(file);
    if (file instanceof File) {
      setVideoUrl(URL.createObjectURL(file));
      processVideo(file);
    } else {
      setVideoUrl(file);
      toast.error("URL video processing not implemented yet");
    }
  };

  const processVideo = async (file: File) => {
    setIsProcessing(true);
    try {
      const result = await transcribeVideo(file);
      const segments = result.chunks.map((chunk: any) => ({
        text: chunk.text,
        start: chunk.timestamp[0],
        end: chunk.timestamp[1],
      }));
      
      setTranscript(segments);
      
      const sampleText = segments.slice(0, 3).map(s => s.text).join(" ");
      const language = await detectLanguage(sampleText);
      setDetectedLanguage(language);
      
      toast.success("Video processed successfully!");
    } catch (error) {
      console.error("Error processing video:", error);
      toast.error("Error processing video. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranslate = async () => {
    if (!targetLanguage) {
      toast.error("Please select a target language");
      return;
    }

    setIsTranslating(true);
    try {
      const translatedSegments = await Promise.all(
        transcript.map(async (segment) => {
          const translatedText = await translateText(segment.text, targetLanguage);
          console.log("Translated segment:", translatedText); // Debug log
          return {
            ...segment,
            text: translatedText,
          };
        })
      );
      
      console.log("All translated segments:", translatedSegments); // Debug log
      setTranslatedTranscript(translatedSegments);
      toast.success("Translation completed!");
    } catch (error) {
      console.error("Error translating:", error);
      toast.error(error instanceof Error ? error.message : "Error translating. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const generateVoiceover = async () => {
    if (!translatedTranscript.length) {
      toast.error("Please translate the content first");
      return;
    }

    setIsGeneratingVoice(true);
    try {
      const text = translatedTranscript.map(segment => segment.text).join(" ");
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text }
      });

      if (error) throw error;

      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      toast.success("Voice generation completed!");
    } catch (error) {
      console.error("Error generating voice:", error);
      toast.error("Error generating voice. Please try again.");
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!transcript.length) {
      toast.error("Please process the video first");
      return;
    }

    try {
      const fullText = transcript.map(segment => segment.text).join(" ");
      const summaryText = await generateSummary(fullText);
      setSummary(summaryText);
      toast.success("Summary generated successfully!");
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Error generating summary. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Video Language Transformer
          </h1>
          <p className="text-lg text-gray-600">
            Upload a video, translate its content, and generate voiceovers in multiple languages
          </p>
        </motion.div>

        <div className="space-y-12">
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Upload Your Video
            </h2>
            <VideoUpload onVideoSelect={handleVideoSelect} />
          </section>

          {video && (
            <>
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Video Preview
                </h2>
                <VideoPlayer 
                  source={videoUrl} 
                  onTimeUpdate={setCurrentTime}
                />
                
                {audioUrl && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Generated Audio</h3>
                    <audio controls className="w-full">
                      <source src={audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </motion.section>

              {isProcessing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center p-8"
                >
                  <div className="loading-shimmer w-full h-12 bg-gray-200 rounded-lg" />
                  <p className="mt-4 text-gray-600">Processing video...</p>
                </motion.div>
              ) : (
                <>
                  {detectedLanguage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-purple-50 rounded-lg p-4 mb-6"
                    >
                      <p className="text-purple-700">
                        Detected language: <span className="font-semibold">{detectedLanguage}</span>
                      </p>
                    </motion.div>
                  )}

                  <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl shadow-lg p-8"
                  >
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                      Language Settings
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <LanguageSelector
                        selectedLanguage={targetLanguage}
                        onLanguageSelect={setTargetLanguage}
                        label="Target Translation Language"
                      />
                      <LanguageSelector
                        selectedLanguage={voiceLanguage}
                        onLanguageSelect={setVoiceLanguage}
                        label="Voice Generation Language"
                      />
                    </div>
                    <div className="mt-6 space-x-4">
                      <button
                        onClick={handleTranslate}
                        disabled={isTranslating || !targetLanguage}
                        className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isTranslating ? "Translating..." : "Translate"}
                      </button>
                      <button
                        onClick={generateVoiceover}
                        disabled={isGeneratingVoice || !translatedTranscript.length}
                        className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingVoice ? "Generating Voice..." : "Generate Voice"}
                      </button>
                    </div>
                  </motion.section>

                  {transcript.length > 0 && (
                    <motion.section
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white rounded-2xl shadow-lg p-8"
                    >
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Original Transcript</h3>
                          <TranscriptDisplay 
                            segments={transcript} 
                            currentTime={currentTime}
                          />
                        </div>
                        
                        {translatedTranscript.length > 0 && (
                          <div>
                            <h3 className="text-xl font-semibold mb-4">Translated Transcript</h3>
                            <TranscriptDisplay 
                              segments={translatedTranscript} 
                              currentTime={currentTime}
                            />
                          </div>
                        )}

                        <div className="border-t pt-6">
                          <button
                            onClick={handleGenerateSummary}
                            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Generate Summary
                          </button>

                          {summary && (
                            <div className="mt-4">
                              <h3 className="text-xl font-semibold mb-2">Summary</h3>
                              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                                {summary}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="border-t pt-6">
                          <QASection videoId={videoId} />
                        </div>
                      </div>
                    </motion.section>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
