
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const VideoUpload = ({ onVideoSelect }: { onVideoSelect: (file: File | string) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      onVideoSelect(videoFile);
      toast.success("Video uploaded successfully!");
    } else {
      toast.error("Please upload a valid video file");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onVideoSelect(file);
      toast.success("Video uploaded successfully!");
    } else {
      toast.error("Please upload a valid video file");
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoUrl.trim()) {
      onVideoSelect(videoUrl);
      toast.success("Video URL added successfully!");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto"
      >
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-purple-500 bg-purple-50" : "border-gray-300"
          } transition-colors duration-200`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg text-gray-600">
              Drag and drop your video here, or{" "}
              <label className="text-purple-500 hover:text-purple-600 cursor-pointer">
                browse
                <input
                  type="file"
                  className="hidden"
                  accept="video/*"
                  onChange={handleFileInput}
                />
              </label>
            </p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-xl mx-auto">
        <form onSubmit={handleUrlSubmit} className="flex space-x-2">
          <input
            type="url"
            placeholder="Or enter video URL..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Add URL
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoUpload;
