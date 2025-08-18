import React from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  BookOpen, 
  GraduationCap, 
  Users, 
  Globe, 
  Target,
  Lightbulb,
  Heart
} from "lucide-react";

const LoadingAnimation = ({ message = "Finding the perfect programs for you..." }) => {
  const icons = [
    { icon: Search, color: "text-blue-500", delay: 0 },
    { icon: BookOpen, color: "text-green-500", delay: 0.1 },
    { icon: GraduationCap, color: "text-purple-500", delay: 0.2 },
    { icon: Users, color: "text-pink-500", delay: 0.3 },
    { icon: Globe, color: "text-indigo-500", delay: 0.4 },
    { icon: Target, color: "text-red-500", delay: 0.5 },
    { icon: Lightbulb, color: "text-yellow-500", delay: 0.6 },
    { icon: Heart, color: "text-rose-500", delay: 0.7 },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center"
          >
            <Search className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-bold text-gray-800 mb-2"
          >
            Searching Programs
          </motion.h2>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-600"
          >
            {message}
          </motion.p>
        </div>

        {/* Animated Icons */}
        <div className="flex justify-center items-center space-x-2 mb-8">
          {icons.map(({ icon: Icon, color, delay }, index) => (
            <motion.div
              key={index}
              initial={{ y: 0, scale: 0.8 }}
              animate={{ 
                y: [-10, 0, -10],
                scale: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 1.5,
                delay: delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`w-8 h-8 ${color}`}
            >
              <Icon className="w-full h-full" />
            </motion.div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 bg-blue-500 rounded-full"
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ 
                scale: [0.8, 1.2, 0.8],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                delay: index * 0.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Status Messages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-6 text-center"
        >
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm text-gray-500"
          >
            Analyzing your preferences...
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
