import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
        <form>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-2 border rounded-md mb-3"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded-md mb-3"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded-md mb-4"
          />
          <button className="w-full bg-blue-500 text-white py-2 rounded-md">
            Sign Up
          </button>
        </form>
        <p className="text-center mt-4">
          Already have an account?{" "}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUp;
