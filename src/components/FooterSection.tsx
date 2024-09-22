'use client'

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaTwitter, FaLinkedin, FaInstagram, FaGithub, FaDiscord } from 'react-icons/fa';

const FooterSection: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 text-gray-300 py-12"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">More Content</h3>
            <ul className="space-y-2">
              <li><Link href="/knowledge" className="hover:text-blue-400 transition-colors">Knowledge</Link></li>
              <li><Link href="/blog" className="hover:text-blue-400 transition-colors">Blog</Link></li>
              <li><Link href="https://github.com/aachen-blockchain-club" className="hover:text-blue-400 transition-colors">Github</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li><Link href="https://x.com/RWTHBlockchain" className="hover:text-blue-400 transition-colors">X</Link></li>
              <li><Link href="https://chat.whatsapp.com/LgWZ7jSoOFQFT01suJenqN" className="hover:text-blue-400 transition-colors">Whatsapp</Link></li>
              <li><Link href="https://discord.com/invite/BG2Gdg4dsD" className="hover:text-blue-400 transition-colors">Discord</Link></li>
              <li><Link href="https://linkedin.com/company/aachen-blockchain/" className="hover:text-blue-400 transition-colors">LinkedIn</Link></li>
              <li><Link href="https://instagram.com/aachen_blockchain/" className="hover:text-blue-400 transition-colors">Instagram</Link></li>
              
            
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-sm text-center">
            We are a public good, non profit student organisation. We only rely on grants and donations to sustain our operations.
          </p>
        </div>
        <div className="mt-8 flex justify-center space-x-4">
          <a href="https://x.com/RWTHBlockchain" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-blue-400 transition-colors">
            <FaTwitter />
          </a>
          <a href="https://linkedin.com/company/aachen-blockchain/" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-blue-400 transition-colors">
            <FaLinkedin />
          </a>
          <a href="https://instagram.com/aachen_blockchain/" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-blue-400 transition-colors">
            <FaInstagram />
          </a>
          <a href="https://github.com/aachen-blockchain-club" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-blue-400 transition-colors">
            <FaGithub />
          </a>
          <a href="https://discord.com/invite/BG2Gdg4dsD" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-blue-400 transition-colors">
            <FaDiscord />
          </a>
        </div>
        <div className="mt-8 text-center text-sm">
          <Link href="/impressum" className="hover:text-blue-400 transition-colors">Impressum</Link>
          <span className="mx-2">|</span>
          <span>&copy; 2024 Aachen Blockchain Club</span>
        </div>
      </div>
    </motion.footer>
  );
};

export default FooterSection;