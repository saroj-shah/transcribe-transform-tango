
import { motion } from "framer-motion";

export interface TranscriptSegment {
  text: string;
  start: number;
  end: number;
}

interface TranscriptDisplayProps {
  segments: TranscriptSegment[];
  currentTime: number;
}

const TranscriptDisplay = ({ segments, currentTime }: TranscriptDisplayProps) => {
  const getCurrentSegment = () => {
    return segments.find(
      (segment) => currentTime >= segment.start && currentTime <= segment.end
    );
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Transcript</h3>
      <div className="space-y-4">
        {segments.map((segment, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0.5 }}
            animate={{
              opacity: getCurrentSegment()?.text === segment.text ? 1 : 0.5,
              backgroundColor:
                getCurrentSegment()?.text === segment.text
                  ? "rgb(243 244 246)"
                  : "transparent",
            }}
            className="p-2 rounded-md transition-colors"
          >
            <div className="flex items-start space-x-2">
              <span className="text-sm text-gray-500">
                {Math.floor(segment.start / 60)}:
                {Math.floor(segment.start % 60)
                  .toString()
                  .padStart(2, "0")}
              </span>
              <p className="flex-1 text-gray-700">{segment.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TranscriptDisplay;
