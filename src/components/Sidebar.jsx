import { FaChartLine, FaVideo, FaMagic, FaBrush, FaBars } from "react-icons/fa";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";  // ✅ Import navigation and location
import { motion } from "framer-motion";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        className="fixed top-4 left-4 z-50 text-white p-2 bg-gray-800/80 rounded-md hover:bg-gray-700 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaBars size={22} />
      </button>

      {/* Sidebar Panel */}
      <aside
        className={`h-[calc(100vh-4rem)] w-64 bg-black/40 backdrop-blur-lg border-r border-gray-700 shadow-lg fixed left-0 top-16 z-40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Dashboard</h2>
          <button onClick={() => setIsOpen(false)} className="text-white hover:text-blue-400">
            ✖
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="mt-4">
          <ul className="space-y-2">
            <SidebarItem 
              Icon={FaChartLine} 
              text="Home" 
              path="/dashboard" 
              navigate={navigate} 
              isActive={location.pathname === "/dashboard"} 
            />
            <SidebarItem 
              Icon={FaVideo} 
              text="Create a Video" 
              path="/create-video" 
              navigate={navigate} 
              isActive={location.pathname === "/create-video"} 
            />
            <SidebarItem 
              Icon={FaMagic} 
              text="Generate Thumbnail" 
              path="/generate-thumbnail" 
              navigate={navigate} 
              isActive={location.pathname === "/generate-thumbnail"} 
            />
            <SidebarItem 
              Icon={FaBrush} 
              text="Caption" 
              path="/your-caption" 
              navigate={navigate} 
              isActive={location.pathname === "/your-caption"} 
            />

<SidebarItem 
              Icon={FaBrush} 

              text="Calendar" 
              path="/calendar" 
              navigate={navigate} 
              isActive={location.pathname === "/calendar"} 
            />


          </ul>
        </nav>
      </aside>
    </>
  );
};

// ✅ Improved SidebarItem Component with Path, Active State & Animations
const SidebarItem = ({ Icon, text, path, navigate, isActive }) => (
  <motion.li
    className={`px-6 py-3 flex items-center gap-3 rounded-md transition-all duration-300 cursor-pointer relative group
      ${isActive ? "bg-blue-500 text-white" : "hover:bg-white/10 hover:text-blue-400"}`}
    onClick={() => navigate(path)}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Icon />
    <span>{text}</span>

    {/* ✅ Tooltip */}
    <span className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black text-white text-xs rounded px-2 py-1 shadow-lg">
      {text}
    </span>
  </motion.li>
);

export default Sidebar;
