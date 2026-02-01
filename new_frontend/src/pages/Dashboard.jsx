import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, FileText, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const agents = [
    {
      id: 'chatbot',
      name: 'Chatbot Agent',
      description: 'Interact with our advanced medical AI for quick answers and guidance.',
      icon: <Bot className="w-8 h-8 text-purple-400" />,
      gradient: 'from-purple-600/20 to-purple-900/40',
      path: '/chatbot',
    },
    {
      id: 'report',
      name: 'Report Agent',
      description: 'Upload and analyze medical reports, PDFs, and images with ease.',
      icon: <FileText className="w-8 h-8 text-yellow-400" />,
      gradient: 'from-yellow-600/20 to-yellow-900/40',
      path: '/report',
    },
  ];

  return (
    <div className="pt-24 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          Select Your <span className="text-gradient">Medical Agent</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Choose the specialized agent you need for your healthcare assistance today.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl px-4">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            onClick={() => navigate(agent.path)}
            className={`group relative glass-card p-8 rounded-3xl cursor-pointer overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br ${agent.gradient}`}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-yellow-500 opacity-0 group-hover:opacity-20 transition duration-500 blur-xl" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                {agent.icon}
              </div>
              <h3 className="text-3xl font-bold mb-4 text-white">
                {agent.name}
              </h3>
              <p className="text-gray-400 text-lg mb-8 group-hover:text-gray-300 transition-colors duration-300">
                {agent.description}
              </p>
              <div className="flex items-center gap-2 text-white font-semibold">
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
