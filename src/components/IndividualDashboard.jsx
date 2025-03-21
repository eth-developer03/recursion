import { useState, useEffect } from "react";

const IndividualDashboard = () => {
  const [reels, setReels] = useState([]);
  const userName = "Aryan"; // Replace with dynamic user name

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => setReels(data))
      .catch((error) => console.error("Error loading data:", error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-lg font-bold">Hi, {userName} 👋</h1>
        <div className="flex items-center gap-4">
          <button className="text-gray-600 hover:text-black">Settings</button>
          <button className="text-gray-600 hover:text-black">Logout</button>
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer">
            <span className="text-gray-700">👤</span>
          </div>
        </div>
      </nav>

      {/* Reels Section */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Your Reels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reels.map((reel) => (
            <div key={reel.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={reel.thumbnail} alt={reel.title} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{reel.title}</h3>
                <p className="text-gray-600">👁 {reel.views} views • ❤️ {reel.likes} likes</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IndividualDashboard;
