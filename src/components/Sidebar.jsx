import { FaChartLine, FaVideo, FaMagic, FaBrush, FaBars } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";  // Import for navigation

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();  // Initialize navigate function

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
            <SidebarItem Icon={FaChartLine} text="Business Analytics" onClick={() => navigate("/")} />
            <SidebarItem Icon={FaVideo} text="Create a Video" onClick={() => navigate("/create-video")} />
            <SidebarItem Icon={FaMagic} text="Generate Captions" />
            <SidebarItem Icon={FaBrush} text="Your Brand" />
          </ul>
        </nav>
      </aside>
    </>
  );
};

const SidebarItem = ({ Icon, text, onClick }) => (
  <li
    className="px-6 py-3 flex items-center gap-3 hover:bg-white/10 hover:text-blue-400 rounded-md transition-all duration-300 cursor-pointer"
    onClick={onClick}
  >
    <Icon />
    {text}
  </li>
);

export default Sidebar;
