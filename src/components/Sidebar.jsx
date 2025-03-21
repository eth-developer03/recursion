import { FaChartLine, FaVideo, FaMagic, FaBrush, FaBars } from "react-icons/fa";
import { useState } from "react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true); // Sidebar starts open

  return (
    <>
      {/* Hamburger Icon - Now positioned properly */}
      <button
        className="fixed top-4 left-4 z-50 text-white p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaBars size={22} />
      </button>

      {/* Sidebar - Adjusted to not overlap navbar */}
      <aside
        className={`h-[calc(100vh-4rem)] w-64 bg-gradient-to-br from-[#2A0E61] via-[#4E2A84] to-[#F8461C] text-white shadow-lg fixed left-0 top-16 z-40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-yellow-300"
          >
            ✖
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="mt-4">
          <ul className="space-y-4">
            <li className="px-6 py-3 flex items-center gap-3 hover:bg-white/10 rounded-md transition-all duration-300">
              <FaChartLine /> Business Analytics
            </li>
            <li className="px-6 py-3 flex items-center gap-3 hover:bg-white/10 rounded-md transition-all duration-300">
              <FaVideo /> Create a Video
            </li>
            <li className="px-6 py-3 flex items-center gap-3 hover:bg-white/10 rounded-md transition-all duration-300">
              <FaMagic /> Generate Captions
            </li>
            <li className="px-6 py-3 flex items-center gap-3 hover:bg-white/10 rounded-md transition-all duration-300">
              <FaBrush /> Your Brand
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
