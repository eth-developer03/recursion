import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const GenerateThumbnail = () => {
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState('/public/thumbnail_frame14_1080x1920.jpg'); // Hardcoded image

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideo(URL.createObjectURL(file));
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
            <h2 className="text-4xl font-bold text-white mb-8 text-center">📸 Generate Thumbnail</h2>

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

              {/* Display Video */}
              {/* {video && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Uploaded Video</h3>
                  <video controls src={video} className="w-full rounded-lg shadow-md"></video>
                </div>
              )} */}

              {/* Display Hardcoded Thumbnail */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Generated Thumbnail</h3>
                <img 
                  src={thumbnail} 
                  alt="Generated Thumbnail" 
                  className="w-lg rounded-lg shadow-md"
                />
                  {/* <div className="w-md rounded-lg shadow-md max-w-md flex justify-center">
    <div>
    <img 
      src={thumbnail} 
      alt="Generated Thumbnail" 
      className="w-full rounded-lg shadow-md"
    />
    </div>
  </div> */}
              </div>

            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GenerateThumbnail;
