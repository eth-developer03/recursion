import { useState, useEffect } from "react";
import { FaFileAlt, FaVideo } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const YourBrand = () => {
  const [logos, setLogos] = useState([]);
  const [content, setContent] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLogos(["/public/logo1.png", "/public/logo2.png", "/public/logo3.png"]);
      setContent([
        "Empowering your brand with AI-driven content.",
        "Simplifying video generation with cutting-edge tools.",
        "Elevate your marketing with seamless brand management.",
      ]);
      setVideos([
        "/public/output1.mp4",
        "/public/output2.mp4",
        "/public/output3.mp4",
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div
      className="min-h-screen w-full flex flex-col bg-cover bg-center bg-no-repeat text-white"  // ✅ All text white
      style={{ backgroundImage: "url('/public/5072609.jpg')" }}
    >
      {/* ✅ Navbar with hamburger */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      </div>

      {/* ✅ Sidebar + Content */}
      <div className="flex transition-all duration-300 pt-20">
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="fixed top-[4rem] left-0 z-40"
            >
              <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.div
          initial={{ marginLeft: "0" }}
          animate={{ marginLeft: isSidebarOpen ? "16rem" : "0rem" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex-1 p-12 transition-all duration-300"
        >
          <h1 className="text-4xl font-bold mb-8">🚀 Your Brand Overview</h1>

          {loading ? (
            <p className="text-lg">Loading brand data...</p>
          ) : (
            <>
              {/* ✅ Brand Logos Section */}
              <section className="mb-12">
                <h2 className="text-3xl font-semibold mb-4">🖼️ Brand Logos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {logos.map((logo, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="bg-gray-800 p-4 rounded-lg shadow-md"
                    >
                      <img
                        src={logo}
                        alt={`Logo ${index + 1}`}
                        className="w-full h-32 object-contain rounded-lg"
                      />
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* ✅ Content Section */}
              <section className="mb-12">
                <h2 className="text-3xl font-semibold mb-4">📝 Content</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {content.map((text, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="bg-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4"
                    >
                      <FaFileAlt size={32} />
                      <p>{text}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* ✅ Videos Section */}
              <section>
                <h2 className="text-3xl font-semibold mb-4">🎥 Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="bg-gray-800 p-4 rounded-lg shadow-md"
                    >
                      <h4 className="font-medium mb-2">Video {index + 1}</h4>
                      <video controls src={video} className="w-full rounded-md" />
                      <div className="flex justify-between items-center mt-3">
                        <a
                          href={video}
                          download
                          className="hover:text-blue-500 transition"
                        >
                          🔥 Download
                        </a>
                        <a
                          href={video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-green-500 transition"
                        >
                          ▶️ Preview
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default YourBrand;
