import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const Dashboard = () => {
  const location = useLocation();
  const userType = location.pathname.split("/")[2]; // Extracts the type

  const dashboardContent = {
    individuals: {
      title: "Welcome, Individual!",
      description: "Track your spending, habits, and personal analytics.",
    },
    businesses: {
      title: "Business Dashboard",
      description: "Monitor sales, revenue, and customer analytics.",
    },
    marketers: {
      title: "Marketing Dashboard",
      description: "Analyze campaigns, track leads, and boost engagement.",
    },
  };

  const { title, description } = dashboardContent[userType] || {
    title: "Dashboard",
    description: "Select your dashboard type.",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center items-center min-h-screen bg-gray-100"
    >
      <div className="bg-white p-8 rounded-xl shadow-md text-center w-96">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
};

export default Dashboard;
