import { FaCog, FaSignOutAlt, FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full px-8 py-4 flex justify-between items-center bg-black/40 backdrop-blur-lg border-b border-gray-700 shadow-md z-50">
      {/* Logo (Shifted Right) */}
      <h1 className="text-2xl font-bold text-white flex items-center gap-2 ml-12">
        🚀 <span className="text-gray-200">ContentFlow</span>
      </h1>



      {/* User Controls */}
      <div className="flex items-center gap-6 text-gray-300">
        <button className="hover:text-white transition-all">
          <FaCog size={22} />
        </button>
        <button className="hover:text-white transition-all">
          <FaSignOutAlt size={22} />
        </button>
        <FaUserCircle size={28} className="text-white" />
      </div>
    </nav>
  );
};

export default Navbar;
