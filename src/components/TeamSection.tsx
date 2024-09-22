'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaTelegram, FaEnvelope } from 'react-icons/fa'; // Import Telegram and Email icons

const teamMembers = [
  {
    name: 'Ahoura Azarbin',
    role: 'President',
    image: '/images/Team/ahoura.png',
    email: 'mailto:ahoura@aachen-blockchain.de',
    telegram: 'https://t.me/AghostraA',
  },
  {
    name: 'Mikolaj Radlinski',
    role: 'Vice President',
    image: '/images/Team/mikolaj.png',
    email: 'mailto:mike@aachen-blockchain.de',
    telegram: 'https://t.me/MikePawel',
  },
  {
    name: 'Santhosh Senthil Kumar',
    role: 'Treasurer',
    image: '/images/Team/santhosh.png',
    email: 'mailto:santhosh@aachen-blockchain.de',
    telegram: 'https://t.me/sant18z',
  },
  // Add more team members as needed
];

const TeamSection: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="my-24"
    >
      <h2 className="text-3xl font-bold mb-8 text-center gradient-text gradient-yellow-orange">
        Contact Us
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            className="glass-panel p-6 rounded-lg shadow-lg text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Image
              src={member.image}
              alt={member.name}
              width={150}
              height={150}
              className="rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold">{member.name}</h3>
            <p>{member.role}</p>
            {/* Icons Section */}
            <div className="flex justify-center space-x-4 mt-4">
              {/* Email Icon */}
              <a href={member.email} target="_blank" rel="noopener noreferrer">
                <FaEnvelope className="text-blue-500 hover:text-blue-300 text-2xl" />
              </a>
              {/* Telegram Icon */}
              <a href={member.telegram} target="_blank" rel="noopener noreferrer">
                <FaTelegram className="text-blue-500 hover:text-blue-300 text-2xl" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default TeamSection;
