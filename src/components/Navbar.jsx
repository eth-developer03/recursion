import { FaUserCircle, FaCog, FaSignOutAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-bold flex items-center gap-2">
        👋 Hi, Aryan
      </h1>

      {/* Navbar Icons */}
      <div className="flex items-center gap-6">
        {/* Rotating Settings Icon on Hover */}
        <motion.button
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
          className="text-gray-300 hover:text-blue-400"
        >
          <FaCog size={22} />
        </motion.button>

        {/* Logout */}
        <button className="text-gray-300 hover:text-red-400 flex items-center">
          <FaSignOutAlt size={20} className="mr-1" />
          Logout
        </button>

        {/* User Profile */}
        <FaUserCircle size={26} className="text-gray-300 cursor-pointer hover:text-blue-400" />
      </div>
    </nav>
  );
};

export default Navbar;
