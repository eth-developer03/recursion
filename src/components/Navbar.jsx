import { FaCog, FaSignOutAlt, FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white/10 backdrop-blur-lg shadow-md border-b border-white/20">
      {/* Branding */}
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        🚀 <span className="text-yellow-400">ContentFlow</span>
      </h1>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <button className="hover:text-yellow-400 transition-colors duration-300">
          <FaCog size={22} />
        </button>
        <button className="hover:text-yellow-400 transition-colors duration-300">
          <FaSignOutAlt size={22} />
        </button>
        <FaUserCircle size={28} className="text-white/80" />
      </div>
    </nav>
  );
};

export default Navbar;
