import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";  // ⬅ Added for navigation
import { FaGoogle, FaFacebookF, FaInstagram, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

const Login = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef(null);
  const navigate = useNavigate(); // ⬅ Initialize navigation

  const slides = [
    { img: "https://img.freepik.com/free-vector/colorful-flow-background_52683-43164.jpg", text: "Use AI-powered tools to grow your business 🚀" },
    { img: "https://t3.ftcdn.net/jpg/04/29/25/86/360_F_429258682_bh9Dq1yturGAXCzGED7noc5T32CFU6xv.jpg", text: "Optimize marketing strategies with data-driven insights 📊" },
    { img: "https://crosseyedpianist.com/wp-content/uploads/2011/06/flow-dual-ring-1-jpeg.jpg", text: "Secure transactions and financial growth solutions 💰" }
  ];

  const socialLogins = [
    { icon: <FaGoogle className="mr-2" />, text: "Sign in with Google", link: "https://accounts.google.com/signin", bg: "bg-red-500", hover: "hover:bg-red-600" },
    { icon: <FaFacebookF className="mr-2" />, text: "Sign in with Facebook", link: "https://www.facebook.com/login", bg: "bg-blue-600", hover: "hover:bg-blue-700" },
    { icon: <FaInstagram className="mr-2" />, text: "Sign in with Instagram", link: "https://www.instagram.com/accounts/login/", bg: "bg-pink-500", hover: "hover:bg-pink-600" },
    { icon: <FaXTwitter className="mr-2" />, text: "Sign in with X", link: "https://twitter.com/i/flow/login", bg: "bg-black", hover: "hover:bg-gray-900" },
    { icon: <FaYoutube className="mr-2" />, text: "Sign in with YouTube", link: "https://accounts.google.com/ServiceLogin?service=youtube", bg: "bg-red-600", hover: "hover:bg-red-700" }
  ];

  useEffect(() => {
    intervalRef.current = setInterval(() => handleNext(), 5000);
    return () => clearInterval(intervalRef.current);
  }, [activeIndex]);

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % slides.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);

  // ⬇ Redirect to dashboard when login button is clicked
  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/dashboard");
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

          {socialLogins.map((social, index) => (
            <button 
              key={index}
              onClick={() => window.open(social.link, "_blank")}
              className={`flex items-center justify-center ${social.bg} text-white py-3 rounded-lg w-full mb-2 ${social.hover} transition-all duration-300 shadow-lg`}
            >
              {social.icon} {social.text}
            </button>
          ))}

          <div className="text-center text-gray-500 my-2">or continue with email</div>

          <input type="email" placeholder="Enter your email" className="w-full p-3 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          <input type="password" placeholder="Enter your password" className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          
          <button 
            onClick={handleLogin}  // ⬅ Added redirect functionality
            className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition-all duration-300 shadow-lg"
          >
            Sign in
          </button>

          <p className="text-center text-gray-500 mt-4">
            Don't have an account? <a href="#" className="text-blue-500 hover:underline">Sign up</a>
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

          <div className="absolute bottom-6 left-6 flex gap-4">
            <button onClick={handlePrev} className="bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg">
              <IoChevronBack size={24} />
            </button>
            <button onClick={handleNext} className="bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg">
              <IoChevronForward size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
