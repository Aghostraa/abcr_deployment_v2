'use client'

import React from 'react';
import { motion } from 'framer-motion';

const UpcomingEventsSection: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="my-24"
    >
      <h2 className="text-3xl font-bold mb-8 text-center gradient-text gradient-blue-teal">Recent Events</h2>
      <div className="glass-panel p-6 rounded-lg shadow-lg">
        {/* Luma embed example */}
        <div className="luma-embed" style={{height: '500px', width: '100%'}}>
          <iframe
            src="https://lu.ma/embed/event/evt-KrBcG4pcQdpaR4q/simple"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{border: '1px solid #bfcbda88', borderRadius: '4px'}}
            allowFullScreen
          ></iframe>
        </div>
        {/* You can add more event manager embeds here */}
      </div>
    </motion.section>
  );
};

export default UpcomingEventsSection;