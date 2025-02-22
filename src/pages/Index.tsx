
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import VideoUpload from "@/components/VideoUpload";
import LanguageSelector from "@/components/LanguageSelector";
import VideoPlayer from "@/components/VideoPlayer";
import TranscriptDisplay from "@/components/TranscriptDisplay";
import { transcribeVideo, detectLanguage } from "@/utils/videoProcessing";
import type { TranscriptSegment } from "@/components/TranscriptDisplay";

const Index = () => {
  const [video, setVideo] = useState<File | string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [voiceLanguage, setVoiceLanguage] = useState("");
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>("");

  const handleVideoSelect = async (file: File | string) => {
    setVideo(file);
    if (file instanceof File) {
      setVideoUrl(URL.createObjectURL(file));
      processVideo(file);
    } else {
      setVideoUrl(file);
      // Handle URL video processing
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
      
      // Detect language from the first few segments
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
                  </motion.section>

                  {transcript.length > 0 && (
                    <motion.section
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white rounded-2xl shadow-lg p-8"
                    >
                      <TranscriptDisplay 
                        segments={transcript} 
                        currentTime={currentTime}
                      />
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
