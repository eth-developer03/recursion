import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { motion } from "framer-motion";  // ✅ Import Framer Motion

const CreateVideo = () => {
  const [redditSource, setRedditSource] = useState("");
  const [newsSource, setNewsSource] = useState("");
  const [videoStyle, setVideoStyle] = useState("");
  const [contentLimit, setContentLimit] = useState("");

  return (
    <motion.div
      className="h-screen flex flex-col text-white"
      style={{
        backgroundImage: "url('/public/5072609.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundBlendMode: "overlay",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Navbar */}
      <motion.div
        className="fixed top-0 left-0 w-full z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <Navbar />
      </motion.div>

      <div className="flex flex-1 mt-[4rem]">
        {/* Sidebar */}
        <motion.div
          className="mt-[4rem]"
          initial={{ x: -200 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <Sidebar />
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="flex-1 p-12 overflow-auto mt-[4rem] flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.h2
            className="text-4xl font-extrabold text-white drop-shadow-lg mb-8 flex items-center gap-2"
            whileHover={{ scale: 1.1 }}
          >
            🎥 Create Your Video
          </motion.h2>

          <motion.div
            className="bg-black/60 p-8 rounded-2xl shadow-lg border border-gray-700 backdrop-blur-md w-full max-w-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Dropdowns with Motion */}
              <motion.select
                className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none transition hover:border-blue-500"
                value={redditSource}
                onChange={(e) => setRedditSource(e.target.value)}
                whileFocus={{ scale: 1.05 }}
              >
                <option value="">Select Reddit Source</option>
                <option value="news">News</option>
                <option value="tech">Tech</option>
                <option value="gaming">Gaming</option>
              </motion.select>

              <motion.select
                className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none transition hover:border-blue-500"
                value={newsSource}
                onChange={(e) => setNewsSource(e.target.value)}
                whileFocus={{ scale: 1.05 }}
              >
                <option value="">Select News Source</option>
                <option value="cnn">CNN</option>
                <option value="bbc">BBC</option>
                <option value="reuters">Reuters</option>
              </motion.select>

              <motion.select
                className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none transition hover:border-blue-500"
                value={videoStyle}
                onChange={(e) => setVideoStyle(e.target.value)}
                whileFocus={{ scale: 1.05 }}
              >
                <option value="">Select Video Style</option>
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="cinematic">Cinematic</option>
              </motion.select>
            </div>

            {/* Content Limit Dropdown */}
            <motion.select
              className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none transition hover:border-blue-500 mb-6"
              value={contentLimit}
              onChange={(e) => setContentLimit(e.target.value)}
              whileFocus={{ scale: 1.05 }}
            >
              <option value="">Select Content Limit</option>
              <option value="30">30 sec</option>
              <option value="60">60 sec</option>
              <option value="120">2 min</option>
            </motion.select>

            {/* Generate Button with Framer */}
            <motion.button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-lg shadow-lg flex items-center justify-center gap-2"
              whileHover={{ scale: 1.1, rotate: 2 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              🚀 Generate
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreateVideo;
