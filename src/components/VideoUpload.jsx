import { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";

const VideoUpload = () => {
  const [videoFile, setVideoFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-white/10 shadow-lg w-[350px] h-[250px] border border-white/20 backdrop-blur-md">
      {/* Title */}
      <h2 className="text-white font-bold text-xl flex items-center gap-2 mb-4">
        📁 Upload Your Video
      </h2>

      <label className="border-2 border-dashed border-yellow-400 rounded-lg p-10 text-center cursor-pointer hover:bg-yellow-400/10 transition-all duration-300 shadow-md hover:shadow-lg">
        <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
        <FaCloudUploadAlt size={50} className="text-yellow-400 mb-2 animate-bounce" />
        <p className="text-white">Click to upload or drag & drop</p>
      </label>

      {/* Video Preview */}
      {videoFile && (
        <div className="mt-6 w-full max-w-xl">
          <video controls className="w-full rounded-lg shadow-lg border border-white/20">
            <source src={videoFile} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
