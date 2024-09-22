'use client'

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

interface TeamMember {
  name: string;
  role: string;
  email: string;
  telegram: string;
  image: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "John Doe",
    role: "President",
    email: "john@abcblockchain.com",
    telegram: "@johndoe",
    image: "/images/team/john-doe.jpg"
  },
  {
    name: "Jane Smith",
    role: "Vice President",
    email: "jane@abcblockchain.com",
    telegram: "@janesmith",
    image: "/images/team/jane-smith.jpg"
  },
  // Add more team members here
];

const TeamPage: React.FC = () => {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <h1 className="text-4xl font-bold mb-8 text-center gradient-text gradient-purple-pink">Our Team</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              className="glass-panel p-6 rounded-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src={member.image}
                alt={member.name}
                width={200}
                height={200}
                className="rounded-full mx-auto mb-4"
              />
              <h2 className="text-2xl font-semibold mb-2 text-center">{member.name}</h2>
              <p className="text-lg text-center mb-4">{member.role}</p>
              <div className="flex flex-col items-center">
                <Link href={`mailto:${member.email}`} className="mb-2 hover:text-blue-400 transition-colors">
                  {member.email}
                </Link>
                <Link href={`https://t.me/${member.telegram.substring(1)}`} className="hover:text-blue-400 transition-colors">
                  {member.telegram}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default TeamPage;