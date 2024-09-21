'use client'

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const teamMembers = [
  { name: 'John Doe', role: 'President', image: '/images/john-doe.jpg' },
  { name: 'Jane Smith', role: 'Vice President', image: '/images/jane-smith.jpg' },
  { name: 'Alice Johnson', role: 'Team Lead', image: '/images/alice-johnson.jpg' },
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
      <h2 className="text-3xl font-bold mb-8 text-center gradient-text gradient-yellow-orange">Our Team</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            className="glass-panel p-6 rounded-lg shadow-lg text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
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
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default TeamSection;