import { useState } from "react";
import { FaBars } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { motion } from "framer-motion";

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex">
      {/* Sidebar */}
      <motion.div
        animate={{ width: sidebarOpen ? "250px" : "60px" }} // 👈 Keeps space for the button
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-gray-800 h-screen shadow-md overflow-hidden flex flex-col"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4">
          {sidebarOpen && <h2 className="text-xl font-bold text-white">Dashboard</h2>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
            {sidebarOpen ? <IoClose size={22} /> : <FaBars size={22} />}
          </button>
        </div>

        {/* Sidebar Content (Hidden when collapsed) */}
        {sidebarOpen && (
          <div className="p-4">
            <h3 className="text-sm text-gray-400 mb-2">Services</h3>
            <ul className="space-y-2">
              {["Business Analytics", "Create a video", "Generate Captions", "Your brand"].map((repo, index) => (
                <li key={index} className="hover:bg-gray-700 px-3 py-2 rounded cursor-pointer text-white">
                  {repo}
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Sidebar;
