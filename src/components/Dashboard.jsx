import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import VideoUpload from "./VideoUpload";

const Dashboard = () => {
  return (
    <div
      className="h-screen flex flex-col text-white"
      style={{
        backgroundImage: "url('/public/5072609.jpg')", // Use uploaded background
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundBlendMode: "overlay",
      }}
    >
      {/* Fixed Navbar at the top */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 mt-[4rem]"> 
        {/* Sidebar - Ensure it starts below navbar */}
        <div className="mt-[4rem]">
          <Sidebar />
        </div>

        {/* Main Section with padding to avoid overlap */}
        <div className="flex-1 p-12 overflow-auto mt-[4rem]">
          {/* Hero Section */}
          <div className="text-center flex flex-col items-center justify-center">
            <h2 className="text-5xl font-extrabold text-white drop-shadow-lg">
              Elevate Your Brand, <br />
              <span className="text-blue-400">One Click Away.</span>
            </h2>

            {/* CTA Box */}
            <div className="mt-6 flex items-center bg-black/40 backdrop-blur-lg p-3 rounded-full shadow-xl border border-gray-600 max-w-2xl w-full">
              <span className="ml-4 text-xl text-blue-400">🚀</span>
              <input
                type="text"
                placeholder="Paste your video link here"
                className="bg-transparent outline-none text-white flex-1 px-4 placeholder-gray-400"
              />
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full shadow-lg hover:scale-105 transition-all duration-300">
                Generate ✨
              </button>
            </div>

            {/* Video Upload Section */}
            <div className="mt-12">
              <VideoUpload />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
