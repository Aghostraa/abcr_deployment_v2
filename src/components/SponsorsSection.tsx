'use client'

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const sponsors = [
  { name: 'Superteam Germany', logo: '/images/Sponsors/sponsor1.svg' },
  { name: 'ICP HUB DeArk', logo: '/images/Sponsors/sponsor2.png' },
  { name: 'Metabrew', logo: '/images/Sponsors/sponsor3.avif' },
  // Add more sponsors as needed
];

const SponsorsSection: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="my-24"
    >
      <h2 className="text-3xl font-bold mb-8 text-center gradient-text gradient-blue-teal">Our Sponsors</h2>
      <div className="flex flex-wrap justify-center items-center gap-8">
        {sponsors.map((sponsor, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Image
              src={sponsor.logo}
              alt={sponsor.name}
              width={150}
              height={150}
              className="rounded-lg"
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default SponsorsSection;