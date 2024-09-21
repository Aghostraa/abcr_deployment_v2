'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { FaTwitter, FaFacebook, FaLinkedin, FaInstagram } from 'react-icons/fa';

const FooterSection: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-black bg-opacity-50 text-center py-8"
    >
      <div className="container mx-auto px-4">
        <h3 className="text-2xl font-semibold mb-4">Impressum</h3>
        <p className="mb-4">
          ABC Blockchain Club e.V.<br />
          Templergraben 55, 52062 Aachen<br />
          Email: info@abcblockchain.com<br />
          Represented by: John Doe, President
        </p>
        <div className="flex justify-center space-x-4 mb-4">
          <a href="https://twitter.com/abcblockchain" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-blue-400 transition-colors">
            <FaTwitter />
          </a>
          <a href="https://facebook.com/abcblockchain" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-blue-400 transition-colors">
            <FaFacebook />
          </a>
          <a href="https://linkedin.com/company/abcblockchain" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-blue-400 transition-colors">
            <FaLinkedin />
          </a>
          <a href="https://instagram.com/abcblockchain" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-blue-400 transition-colors">
            <FaInstagram />
          </a>
        </div>
        <p>&copy; 2024 Aachen Blockchain Club. All rights reserved.</p>
      </div>
    </motion.footer>
  );
};

export default FooterSection;