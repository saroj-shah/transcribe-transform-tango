
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface QASectionProps {
  videoId: string;
}

const QASection = ({ videoId }: QASectionProps) => {
  const [query, setQuery] = useState('');
  const [answers, setAnswers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('qa-embeddings', {
        body: { query, video_id: videoId }
      });

      if (error) throw error;
      setAnswers(data.matches);
    } catch (error) {
      console.error('Error querying video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4">Ask Questions About the Video</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about the video..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !query}
          className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Searching..." : "Ask Question"}
        </button>
      </form>

      {answers.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Relevant Segments:</h4>
          <div className="space-y-4">
            {answers.map((answer, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{answer.content}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Relevance: {Math.round(answer.similarity * 100)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QASection;
