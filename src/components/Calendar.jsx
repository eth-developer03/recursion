// import { useState } from "react";
// import dayjs from "dayjs";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { motion } from "framer-motion";

// const Calendar = () => {
//   const [currentMonth, setCurrentMonth] = useState(dayjs().startOf("month"));
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [selectedTime, setSelectedTime] = useState("");

//   const handlePrevMonth = () => {
//     setCurrentMonth(currentMonth.subtract(1, "month"));
//   };

//   const handleNextMonth = () => {
//     setCurrentMonth(currentMonth.add(1, "month"));
//   };

//   const handleSelectDate = (day) => {
//     if (day) {
//       setSelectedDate(currentMonth.date(day));
//     }
//   };

//   const generateDays = () => {
//     const startOfMonth = currentMonth.startOf("month").day();
//     const daysInMonth = currentMonth.daysInMonth();
//     const prevMonthDays = Array.from({ length: startOfMonth }, () => null);
//     const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
//     return [...prevMonthDays, ...monthDays];
//   };

//   return (
//     <motion.div
//       className="min-h-screen flex justify-center items-center bg-black/60 text-white p-8"
//       initial={{ opacity: 0, scale: 0.9 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 0.5 }}
//     >
//       <div className="bg-gray-900/70 rounded-2xl shadow-lg border border-gray-700 p-6 w-full max-w-lg backdrop-blur-md">
//         <div className="flex justify-between items-center mb-6">
//           <motion.button
//             onClick={handlePrevMonth}
//             className="p-2 bg-gray-800 rounded-lg hover:bg-blue-600 transition"
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.9 }}
//           >
//             <ChevronLeft size={24} />
//           </motion.button>
//           <h2 className="text-2xl font-bold">{currentMonth.format("MMMM YYYY")}</h2>
//           <motion.button
//             onClick={handleNextMonth}
//             className="p-2 bg-gray-800 rounded-lg hover:bg-blue-600 transition"
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.9 }}
//           >
//             <ChevronRight size={24} />
//           </motion.button>
//         </div>

//         <div className="grid grid-cols-7 gap-2 text-center">
//           {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
//             <div key={day} className="text-sm font-medium text-blue-400">{day}</div>
//           ))}
//           {generateDays().map((day, index) => (
//             <motion.div
//               key={index}
//               className={`p-3 text-sm h-12 flex items-center justify-center rounded-lg cursor-pointer transition-all ${
//                 day
//                   ? selectedDate?.date() === day
//                     ? "bg-blue-600 text-white"
//                     : "bg-gray-800 hover:bg-blue-400"
//                   : ""
//               }`}
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//               onClick={() => handleSelectDate(day)}
//             >
//               {day}
//             </motion.div>
//           ))}
//         </div>

//         {selectedDate && (
//           <div className="mt-6 p-4 bg-gray-800 rounded-lg">
//             <p className="text-lg font-semibold text-blue-400">
//               📅 Selected Date: {selectedDate.format("DD MMM YYYY")}
//             </p>
//             <input
//               type="time"
//               className="mt-4 w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-1 focus:ring-blue-500 text-white"
//               value={selectedTime}
//               onChange={(e) => setSelectedTime(e.target.value)}
//               min="00:00"
//               max="23:59"
//             />
//           </div>
//         )}
//       </div>
//     </motion.div>
//   );
// };

// export default Calendar;

//
import { useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf("month"));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, "month"));
  };

  const handleSelectDate = (day) => {
    if (day) {
      setSelectedDate(currentMonth.date(day));
    }
  };

  const generateDays = () => {
    const startOfMonth = currentMonth.startOf("month").day();
    const daysInMonth = currentMonth.daysInMonth();
    const prevMonthDays = Array.from({ length: startOfMonth }, () => null);
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return [...prevMonthDays, ...monthDays];
  };

  return (
    <motion.div
      className="min-h-screen flex justify-center items-center text-white p-8"
      style={{
        backgroundImage: "url('/public/scheduling-bg.png')",  // Apply the new futuristic background
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Centered Scheduling Title */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center">
        <h1 className="text-6xl font-bold text-blue-400 drop-shadow-lg">Scheduling</h1>
      </div>

      <div className="bg-gray-900/70 rounded-2xl shadow-lg border border-gray-700 p-6 w-full max-w-lg backdrop-blur-md">
        <div className="flex justify-between items-center mb-6">
          <motion.button
            onClick={handlePrevMonth}
            className="p-2 bg-gray-800 rounded-lg hover:bg-blue-600 transition"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft size={24} />
          </motion.button>
          <h2 className="text-2xl font-bold">{currentMonth.format("MMMM YYYY")}</h2>
          <motion.button
            onClick={handleNextMonth}
            className="p-2 bg-gray-800 rounded-lg hover:bg-blue-600 transition"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight size={24} />
          </motion.button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-sm font-medium text-blue-400">{day}</div>
          ))}
          {generateDays().map((day, index) => (
            <motion.div
              key={index}
              className={`p-3 text-sm h-12 flex items-center justify-center rounded-lg cursor-pointer transition-all ${
                day
                  ? selectedDate?.date() === day
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 hover:bg-blue-400"
                  : ""
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSelectDate(day)}
            >
              {day}
            </motion.div>
          ))}
        </div>

        {selectedDate && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <p className="text-lg font-semibold text-blue-400">
              📅 Selected Date: {selectedDate.format("DD MMM YYYY")}
            </p>
            <input
              type="time"
              className="mt-4 w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-1 focus:ring-blue-500 text-white"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              min="00:00"
              max="23:59"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Calendar;
