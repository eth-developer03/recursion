import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa6";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { auth, signInWithGoogle } from "../firebase"; // Firebase Auth Import

const Login = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const slides = [
    { img: "https://img.freepik.com/free-vector/colorful-flow-background_52683-43164.jpg", text: "Use AI-powered tools to grow your business 🚀" },
    { img: "https://t3.ftcdn.net/jpg/04/29/25/86/360_F_429258682_bh9Dq1yturGAXCzGED7noc5T32CFU6xv.jpg", text: "Optimize marketing strategies with data-driven insights 📊" },
    { img: "https://crosseyedpianist.com/wp-content/uploads/2011/06/flow-dual-ring-1-jpeg.jpg", text: "Secure transactions and financial growth solutions 💰" }
  ];

  useEffect(() => {
    intervalRef.current = setInterval(() => handleNext(), 5000);
    return () => clearInterval(intervalRef.current);
  }, [activeIndex]);

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % slides.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);

  // Google Sign-In
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  // Email & Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginWithEmail(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-6 font-sans">
      <div className="bg-white shadow-2xl rounded-lg flex overflow-hidden max-w-5xl w-full">
        
        {/* Left Side: Login Form */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-1/2 p-10 flex flex-col justify-center"
        >
          <h1 className="text-4xl font-bold mb-4 text-gray-900 tracking-wide">Log in to your account</h1>
          <p className="text-gray-500 text-md mb-6">Choose a login method</p>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          {/* Google Sign-In Button */}
          <button 
            onClick={handleGoogleLogin}
            className="flex items-center justify-center bg-red-500 text-white py-3 rounded-lg w-full mb-2 hover:bg-red-600 transition-all duration-300 shadow-lg"
          >
            <FaGoogle className="mr-2" /> Sign in with Google
          </button>

          <div className="text-center text-gray-500 my-2">or continue with email</div>

          <form onSubmit={handleLogin} className="flex flex-col">
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-3 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
            
            <button 
              type="submit"
              className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition-all duration-300 shadow-lg"
            >
              Sign in
            </button>
          </form>

          <p className="text-center text-gray-500 mt-4">
  Don't have an account? 
  <span 
    onClick={() => navigate("/signup")}  
    className="text-blue-500 hover:underline cursor-pointer"
  >
    Sign up
  </span>
</p>
        </motion.div>

        {/* Right Side: Smooth Image Slider */}
        <div 
          className="w-1/2 bg-gray-900 relative flex flex-col justify-end overflow-hidden"
          onMouseEnter={() => clearInterval(intervalRef.current)}
          onMouseLeave={() => (intervalRef.current = setInterval(() => handleNext(), 5000))}
        >
          <AnimatePresence>
            <motion.div 
              key={activeIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="w-full h-full absolute"
            >
              <img src={slides[activeIndex].img} className="w-full h-full object-cover" alt="Slider" />
            </motion.div>
          </AnimatePresence>

          <motion.div
            key={slides[activeIndex].text}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute bottom-20 left-8 text-white text-3xl font-bold w-3/4 tracking-wide drop-shadow-lg"
          >
            {slides[activeIndex].text}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
