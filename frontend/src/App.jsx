import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import ReportAgent from './pages/ReportAgent';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/report" element={<ReportAgent />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
