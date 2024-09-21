'use client'

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import DashboardLayout from '@/components/DashboardLayout';

interface Sponsor {
  name: string;
  logo: string;
  website: string;
}

const sponsors: Sponsor[] = [
  {
    name: "Crypto Inc.",
    logo: "/images/sponsors/crypto-inc.png",
    website: "https://crypto-inc.com"
  },
  {
    name: "Blockchain Solutions",
    logo: "/images/sponsors/blockchain-solutions.png",
    website: "https://blockchain-solutions.com"
  },
  // Add more sponsors here
];

const SponsorsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <h1 className="text-4xl font-bold mb-8 text-center gradient-text gradient-purple-pink">Our Sponsors</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sponsors.map((sponsor, index) => (
            <motion.div
              key={index}
              className="glass-panel p-6 rounded-lg shadow-lg flex flex-col items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src={sponsor.logo}
                alt={sponsor.name}
                width={200}
                height={100}
                className="mb-4"
              />
              <h2 className="text-2xl font-semibold mb-2">{sponsor.name}</h2>
              <a
                href={sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Visit Website
              </a>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default SponsorsPage;