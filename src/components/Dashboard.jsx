import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import VideoUpload from "./VideoUpload";

const Dashboard = () => {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-white">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-10 overflow-auto">
          {/* Hero Section */}
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-lg border border-white/10">
            <h2 className="text-4xl font-bold flex items-center gap-2">
              📊 Business Analytics
            </h2>
            <p className="text-gray-300 text-lg">View your latest stats and insights here.</p>
          </div>

          {/* Video Upload Section */}
          <div className="mt-10 bg-gradient-to-r from-[#3b82f6] to-[#9333ea] p-10 rounded-xl shadow-lg border border-white/10">
            <VideoUpload />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
