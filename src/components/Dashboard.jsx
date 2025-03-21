import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import VideoUpload from "./VideoUpload";

const Dashboard = () => {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#0057D9] via-[#7E22CE] to-[#FF7A00] text-white">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-12 overflow-auto">
          {/* Hero Section */}
          <div className="text-center flex flex-col items-center justify-center">
            <h2 className="text-5xl font-extrabold text-white drop-shadow-lg">
              Elevate Your Brand, <br /> 
              <span className="text-yellow-300">One Click Away.</span>
            </h2>

            {/* CTA Box */}
            <div className="mt-6 flex items-center bg-white/10 backdrop-blur-lg p-3 rounded-full shadow-xl border border-white/20 max-w-2xl w-full">
              <span className="ml-4 text-xl text-yellow-300">🚀</span>
              <input
                type="text"
                placeholder="Describe your campaign..."
                className="bg-transparent outline-none text-white flex-1 px-4 placeholder-gray-300"
              />
              <button className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-2 rounded-full shadow-lg hover:scale-105 transition-all duration-300">
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
