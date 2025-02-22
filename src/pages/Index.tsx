
import { useState } from "react";
import { motion } from "framer-motion";
import VideoUpload from "@/components/VideoUpload";
import LanguageSelector from "@/components/LanguageSelector";

const Index = () => {
  const [video, setVideo] = useState<File | string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState("");
  const [voiceLanguage, setVoiceLanguage] = useState("");

  const handleVideoSelect = (file: File | string) => {
    setVideo(file);
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
