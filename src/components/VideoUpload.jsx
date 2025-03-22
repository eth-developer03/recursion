import { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";  // ✅ Spinner icon

const VideoUpload = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [videos, setVideos] = useState([]);
  const [showVideos, setShowVideos] = useState(false);
  const [loading, setLoading] = useState(false);  // ✅ Loading state

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
    }
  };

  const handleUpload = () => {
    if (!videoFile) {
      alert("Please select a video file to upload.");
      return;
    }

    setUploadMessage(`✅ ${videoFile.name} uploaded successfully`);

    // ✅ Show the loader during processing
    setLoading(true);
    setShowVideos(false);  

    // ✅ Simulate processing delay (3 seconds)
    setTimeout(() => {
      const outputVideos = ["/output1.mp4", "/output2.mp4", "/output3.mp4"];
      setVideos(outputVideos);
      setLoading(false);
      setShowVideos(true);
    }, 3000);  // 3-second delay
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-6 rounded-xl shadow-xl border border-gray-700 backdrop-blur-lg relative w-full max-w-3xl"
      style={{ backgroundColor: "#0A192F" }}
    >
      <h2 className="text-gray-200 font-semibold text-lg flex items-center gap-2 mb-4">
        🚀 Upload Your Video
      </h2>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {/* File Upload */}
        <label className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-700/20 transition-all duration-300 shadow-md hover:shadow-lg w-full">
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <FaCloudUploadAlt size={40} className="text-gray-300 mb-2" />
          <p className="text-gray-300 text-sm">Click to upload or drag & drop</p>
        </label>

        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Upload Video
        </button>
      </div>

      {uploadMessage && (
        <p className="text-gray-300 mt-4">{uploadMessage}</p>
      )}

      {/* ✅ Loader while processing */}
      {loading && (
        <div className="flex items-center justify-center mt-8">
          <ImSpinner2 className="animate-spin text-blue-500 text-4xl" />
          <p className="text-gray-300 ml-2">Processing videos...</p>
        </div>
      )}

      {/* ✅ Display Output Videos Only After Processing */}
      {showVideos && !loading && (
        <div className="mt-8 w-full">
          <h3 className="text-gray-200 text-xl font-semibold mb-4">🎥 Generated Videos</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md">
                <h4 className="text-gray-200 font-medium">Video {index + 1}</h4>
                <video
                  controls
                  src={video}  // ✅ Use direct relative path
                  className="w-full mt-2"
                />
                <div className="flex justify-between items-center mt-2">
                  <a
                    href={video}
                    download
                    className="text-blue-400 hover:text-blue-500 transition"
                  >
                    🔥 Download
                  </a>
                  <a
                    href={video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-500 transition"
                  >
                    ▶️ Preview
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
