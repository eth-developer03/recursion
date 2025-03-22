import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ScriptDisplay from './ScriptDisplay'; // Import the new component
import { generateScript, getJobStatus } from '../api';

const CreateVideo = () => {
  const [redditSource, setRedditSource] = useState('technology');
  const [newsSource, setNewsSource] = useState('science');
  const [videoStyle, setVideoStyle] = useState('informative');
  const [contentLimit, setContentLimit] = useState('5');
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('');
  const [script, setScript] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Prepare the form data payload
    const data = {
      subreddits: redditSource ? [redditSource] : [],
      news_topics: newsSource ? [newsSource] : [],
      video_style: videoStyle || "informative",
      content_limit: contentLimit ? parseInt(contentLimit) : 5
    };

    try {
      setIsLoading(true);
      setStatus('Submitting request...');
      
      // Send form data to the backend
      const res = await generateScript(data);
      setJobId(res.job_id);
      setStatus("Processing script generation...");

      // Poll for job status every 3 seconds
      const interval = setInterval(async () => {
        try {
          const jobStatus = await getJobStatus(res.job_id);
          setStatus(jobStatus.status);

          if (jobStatus.status === "completed") {
            clearInterval(interval);
            setScript(jobStatus.result);
            setIsLoading(false);
          } else if (jobStatus.status === "failed") {
            clearInterval(interval);
            setStatus("Failed: " + (jobStatus.error || "Unknown error"));
            setIsLoading(false);
          }
        } catch (error) {
          clearInterval(interval);
          setStatus("Error checking status: " + error.message);
          setIsLoading(false);
        }
      }, 3000);
      
    } catch (error) {
      console.error("Error:", error);
      setStatus("Error: " + error.message);
      setIsLoading(false);
    }
  };

  const videoStyles = [
    { value: "informative", label: "Informative" },
    { value: "entertaining", label: "Entertaining" },
    { value: "educational", label: "Educational" },
    { value: "dramatic", label: "Dramatic" }
  ];

  return (
    <motion.div
      className="min-h-screen flex flex-col text-white"
      style={{
        backgroundImage: "url('/public/5072609.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <Navbar />
      <div className="flex flex-1 mt-16">
        <Sidebar />

        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-8 text-center">🎥 Create Your Video</h2>

            <div className="bg-black/60 p-8 rounded-2xl shadow-lg border border-gray-700 backdrop-blur-md w-full mb-8">
              <h3 className="text-xl font-semibold mb-6">Content Sources</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Reddit Source</label>
                  <input
                    type="text"
                    placeholder="e.g., technology, worldnews"
                    value={redditSource}
                    onChange={(e) => setRedditSource(e.target.value)}
                    className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">News Topic</label>
                  <input
                    type="text"
                    placeholder="e.g., science, business"
                    value={newsSource}
                    onChange={(e) => setNewsSource(e.target.value)}
                    className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Video Style</label>
                  <select
                    value={videoStyle}
                    onChange={(e) => setVideoStyle(e.target.value)}
                    className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  >
                    {videoStyles.map(style => (
                      <option key={style.value} value={style.value}>
                        {style.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Content Limit</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="Number of items (1-10)"
                    value={contentLimit}
                    onChange={(e) => setContentLimit(e.target.value)}
                    className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <button
                className="w-full mt-2 bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>🚀 Generate Script</>
                )}
              </button>

              {status && (
                <div className="mt-4 p-3 rounded bg-gray-800/50 text-center">
                  <p className="text-lg">Status: {status}</p>
                </div>
              )}
            </div>

            {script && <ScriptDisplay scriptData={script} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateVideo;