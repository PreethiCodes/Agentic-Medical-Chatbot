import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, FileText, LayoutDashboard } from 'lucide-react';

const NavLink = ({ to, active, icon, label }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
      active
        ? 'bg-white/10 text-white border border-white/20'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-card px-6 py-3 rounded-2xl">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-yellow-400 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">MEDICAL_CHATBOT</span>
        </Link>
        <div className="flex items-center gap-6">
          <NavLink to="/" active={isActive('/')} icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavLink to="/chatbot" active={isActive('/chatbot')} icon={<Bot size={18} />} label="Chatbot" />
          <NavLink to="/report" active={isActive('/report')} icon={<FileText size={18} />} label="Report Agent" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
