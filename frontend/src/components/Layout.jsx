import React from 'react';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-transparent relative overflow-hidden">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 bg-mesh opacity-50 pointer-events-none" />

            {/* Content */}
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 container mx-auto px-4 py-8"
            >
                {children}
            </motion.main>
        </div>
    );
};

export default Layout;
