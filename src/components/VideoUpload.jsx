import { useState } from "react";
import { FaCloudUploadAlt, FaLink } from "react-icons/fa";

const VideoUpload = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoLink, setVideoLink] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(URL.createObjectURL(file));
    }
  };

  const handleLinkChange = (event) => {
    setVideoLink(event.target.value);
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-6 rounded-xl shadow-xl border border-gray-700 backdrop-blur-lg relative w-full max-w-xl"
      style={{
        backgroundColor: "#0A192F", // Deep navy blue background
      }}
    >
      {/* Title */}
      <h2 className="text-gray-200 font-semibold text-lg flex items-center gap-2 mb-4">
        🚀 Upload Your Video
      </h2>

      {/* Upload Options */}
      <div className="flex flex-col gap-4 w-full max-w-md">
        {/* File Upload */}
        <label className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-700/20 transition-all duration-300 shadow-md hover:shadow-lg w-full">
          <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
          <FaCloudUploadAlt size={40} className="text-gray-300 mb-2" />
          <p className="text-gray-300 text-sm">Click to upload or drag & drop</p>
        </label>

        {/* Video Link Input */}
       
      </div>

      {/* Video Preview */}
      {(videoFile || videoLink) && (
        <div className="mt-4 w-full max-w-xl">
          {videoFile ? (
            <video controls className="w-full rounded-lg shadow-md border border-gray-400">
              <source src={videoFile} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <iframe
              src={videoLink}
              title="Video Preview"
              className="w-full h-56 rounded-lg shadow-md border border-gray-400"
              allowFullScreen
            />
          )}
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
