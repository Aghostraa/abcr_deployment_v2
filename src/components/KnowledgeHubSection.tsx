'use client'

import React from 'react';
import { motion } from 'framer-motion';

const KnowledgeHubSection: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="my-24"
    >
      <h2 className="text-3xl font-bold mb-8 text-center gradient-text gradient-purple-pink">Knowledge Hub</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Latest Videos</h3>
          {/* Embed your YouTube video or playlist here */}
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src="https://www.youtube.com/embed/VIDEO_ID"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Recent Blog Posts</h3>
          {/* Add your blog post links or embeds here */}
          <ul className="space-y-2">
            <li><a href="#" className="text-blue-300 hover:text-blue-100">Blog Post 1</a></li>
            <li><a href="#" className="text-blue-300 hover:text-blue-100">Blog Post 2</a></li>
            <li><a href="#" className="text-blue-300 hover:text-blue-100">Blog Post 3</a></li>
          </ul>
        </div>
      </div>
    </motion.section>
  );
};

export default KnowledgeHubSection;