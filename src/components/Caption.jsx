import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Caption = () => {
  const [video, setVideo] = useState(null);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideo(URL.createObjectURL(file));

      // Simulate loading caption after video upload
      setTimeout(() => {
        setCaption("🏎️ F1 Movie Trailer starring Brad Pitt, releasing in June 2025. Get ready for the ultimate race experience! 🚀");

        // Add relevant hashtags
        setHashtags("#F1Movie #BradPitt #FastAndFurious #June2025 #MovieTrailer #RacingThrill");
      }, 1500); 
      



    }
  };

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
            <h2 className="text-4xl font-bold text-white mb-8 text-center">🎥 Upload Video with Caption</h2>

            <div className="bg-black/60 p-8 rounded-2xl shadow-lg border border-gray-700 backdrop-blur-md w-full">
              
              {/* Upload Video */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Upload Video</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                />
              </div>

       
              {/* Display Caption */}
              {caption && (
                <div className="mt-6 flex justify-center items-center">
                  <div className="bg-gray-800/70 text-center p-4 rounded-lg shadow-md w-full max-w-2xl">
                    <h3 className="text-lg font-semibold">📄 Caption:</h3>
                    <p className="mt-2 text-white">{caption}</p>
                  </div>
                </div>
              )}

{hashtags && (
                <div className="mt-6 flex justify-center items-center">
                  <div className="bg-gray-800/70 text-center p-4 rounded-lg shadow-md w-full max-w-2xl">
                    <h3 className="text-lg font-semibold">🏷️ Hashtags:</h3>
                    <p className="mt-2 text-blue-400">{hashtags}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Caption;
